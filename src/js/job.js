export const jobHeader = document.querySelector('.job-header');
export const jobIdElement = jobHeader ? jobHeader.querySelector('span') : null;
export const jobTitleElement = jobHeader ? jobHeader.querySelector('h1') : null;
export const JOB_TITLE = jobTitleElement ? jobTitleElement.innerText : null;

export const JOB_ID_URL_REGEX = /\/talent\/jobs\/(?:posting|(?:preview_)?response)\/(\d+)$/;

export function getJobId() {
    const match = window.location.pathname.match(JOB_ID_URL_REGEX);
    return match ? match[1] : null;
}

export const JOB_ID = getJobId();

export function abbreviateLocation(location) {
    const abbreviations = {
        "Alabama": "AL",
        "Alaska": "AK",
        "Arizona": "AZ",
        "Arkansas": "AR",
        "California": "CA",
        "Colorado": "CO",
        "Connecticut": "CT",
        "Delaware": "DE",
        "Florida": "FL",
        "Georgia": "GA",
        "Hawaii": "HI",
        "Idaho": "ID",
        "Illinois": "IL",
        "Indiana": "IN",
        "Iowa": "IA",
        "Kansas": "KS",
        "Kentucky": "KY",
        "Louisiana": "LA",
        "Maine": "ME",
        "Maryland": "MD",
        "Massachusetts": "MA",
        "Michigan": "MI",
        "Minnesota": "MN",
        "Mississippi": "MS",
        "Missouri": "MO",
        "Montana": "MT",
        "Nebraska": "NE",
        "Nevada": "NV",
        "New Hampshire": "NH",
        "New Jersey": "NJ",
        "New Mexico": "NM",
        "New York": "NY",
        "North Carolina": "NC",
        "North Dakota": "ND",
        "Ohio": "OH",
        "Oklahoma": "OK",
        "Oregon": "OR",
        "Pennsylvania": "PA",
        "Rhode Island": "RI",
        "South Carolina": "SC",
        "South Dakota": "SD",
        "Tennessee": "TN",
        "Texas": "TX",
        "Utah": "UT",
        "Vermont": "VT",
        "Virginia": "VA",
        "Washington": "WA",
        "West Virginia": "WV",
        "Wisconsin": "WI",
        "Wyoming": "WY",
        "United States": "US",
        "District of Columbia": "DC",
        "British Columbia": "BC",
        "Alberta": "AB",
        "Manitoba": "MB",
        "New Brunswick": "NB",
        "Newfoundland and Labrador": "NL",
        "Northwest Territories": "NT",
        "Nova Scotia": "NS",
        "Nunavut": "NU",
        "Ontario": "ON",
        "Prince Edward Island": "PEI",
        "Quebec": "QC",
        "Saskatchewan": "SK",
        "Yukon": "YT",
        "United Kingdom": "UK",
    };

    Object.keys(abbreviations).forEach(state => {
        const abbreviation = abbreviations[state];
        const regex = new RegExp(`\\b${state}\\b`, "g");
        location = location.replace(regex, abbreviation);
    });

    return location;
}

export function getJobTitleDetails() {
    return getJobTitleDetailsForDoc(document);
}

export function getJobTitleDetailsForDoc(doc) {
    return doc.getElementById('job_title_details');
}

export function getStatusField() {
    return getStatusFieldForDoc(document);
}

export function getStatusFieldForDoc(doc) {
    const jobTitleDetails = getJobTitleDetailsForDoc(doc);
    return jobTitleDetails ? Array.from(jobTitleDetails.querySelectorAll('span.status'))
        .find(el => {
            const text = el.innerText.trim();
            return text => text === 'Hiring' || text === 'Deciding' || text === 'Completed';
        }) : null;
}

export function getStatus() {
    return getStatusForDoc(document);
}

export function getStatusForDoc(doc) {
    const statusField = getStatusFieldForDoc(document);
    return statusField ? statusField.innerText.trim() : null;
}

function getResponsesField() {
    return getResponsesFieldForDoc(document);
}

function getResponsesFieldForDoc(doc) {
    const jobHighlights = getJobHighlightsForDoc(doc);

    if (jobHighlights) {
        const responsesHeader = Array.from(jobHighlights.querySelectorAll('p'))
            .find(el => el.innerText === 'Responses');
        return responsesHeader ? responsesHeader.parentNode.querySelector('span.text-dark') : null;
    }

    return null;
}

function getSpotlightActionMenus() {
    return getSpotlightActionMenusForDoc(document);
}

function getSpotlightActionMenusForDoc(doc) {
    const jobTitleDetails = getJobTitleDetailsForDoc(doc);
    return jobTitleDetails ? jobTitleDetails.querySelector('div.spotlight-action-menus') : null;
}

function getButtonTitles(container) {
    return Array.from(container.querySelectorAll('.btn'))
        .map(btn => btn.getAttribute('data-bs-original-title') || btn.innerText);
}

let visibilityHandler = null;
let updateThread = null;
let numFailedUpdatesInARow = 0;
let numUpdates = 0;

export function scheduleUpdates(interval = 30000) {
    if (visibilityHandler === null) {
        visibilityHandler = function () {
            if (document.hidden) {
                descheduleUpdates();
            } else {
                scheduleUpdates();
                update();
            }
        };
        document.addEventListener("visibilitychange", visibilityHandler);
    }

    if (getStatus() === 'Hiring') {
        descheduleUpdates();
        updateThread = window.setInterval(update, interval);
    }
}

function descheduleUpdates() {
    if (updateThread !== null) {
        window.clearInterval(updateThread);
        updateThread = null;
        numUpdates = 0;
        numFailedUpdatesInARow = 0;
    }
}

function update() {
    if (getStatus() === 'Hiring') {
        fetch('https://www.voices.com/talent/jobs/posting/' + getJobId(), {
                method: 'GET',
            })
                .then(response => response.text())
                .then(responseText => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(responseText, "text/html");

                    numUpdates++;
                    if (numUpdates >= 20) {
                        scheduleUpdates(300000);
                    }

                    const currStatusField = getStatusField();
                    const newStatusField = getStatusFieldForDoc(doc);
                    if (currStatusField && newStatusField) {
                        currStatusField.innerText = newStatusField.innerText;
                        currStatusField.className = newStatusField.className;
                        currStatusField.setAttribute('data-bs-original-title', newStatusField.getAttribute('title'));
                    }

                    const currActionMenu = getSpotlightActionMenus();
                    const newActionMenu = getSpotlightActionMenusForDoc(doc);
                    if (currActionMenu && newActionMenu) {
                        const currButtonTitles = getButtonTitles(currActionMenu);
                        const newButtonTitles = getButtonTitles(newActionMenu);
                        if (currButtonTitles !== newButtonTitles) {
                            currActionMenu.innerHTML = newActionMenu.innerHTML;
                        }
                    }

                    const currResponsesField = getResponsesField();
                    const newResponsesField = getResponsesFieldForDoc(doc);
                    if (currResponsesField && newResponsesField) {
                        currResponsesField.innerText = newResponsesField.innerText;
                    }

                    numFailedUpdatesInARow = 0;
                }).catch(e => {
                    numFailedUpdatesInARow++;
                    if (numFailedUpdatesInARow >= 10) {
                        descheduleUpdates();
                    }
                });
    } else {
        descheduleUpdates();
    }
}

export function getJobHighlights() {
    return getJobHighlightsForDoc(document);
}

function getJobHighlightsForDoc(doc) {
    const jobHighlights = doc.getElementById('job-highlights');
    if (jobHighlights) {
        return jobHighlights;
    }
    const jobHighlightsHeader = Array.from(doc.querySelectorAll('h4'))
        .find(el => el.innerText.trim() === 'Job Highlights')
    if (jobHighlightsHeader) {
        return jobHighlightsHeader.nextElementSibling;
    }
}

export function getVoiceMatch() {
    const jobHighlights = getJobHighlights();
    let voiceMatch = null;

    if (jobHighlights) {
        Array.from(jobHighlights.querySelectorAll('p')).forEach(el => {
            if (el.innerText === 'VoiceMatch™') {
                const voiceMatchSpan = el.parentNode.querySelector('span.text-dark');
                if (voiceMatchSpan) {
                    voiceMatch = {
                        field: voiceMatchSpan,
                        value: parseInt(voiceMatchSpan.innerText)
                    };
                }
            }
        });
    }

    return voiceMatch;
}

export function getCategoryHeading() {
    const jobHighlights = getJobHighlights();

    if (jobHighlights) {
        return Array.from(jobHighlights.querySelectorAll('p'))
            .find(el => el.innerText === 'Category');
    }

    return undefined;
}

export function getCategoryTag() {
    const categoryHeading = getCategoryHeading();

    if (categoryHeading) {
        return categoryHeading.parentNode.querySelector('span.text-dark');
    }

    return undefined;
}

export function getCategory() {
    const tag = getCategoryTag();
    return tag ? tag.innerText.trim() : undefined;
}

export function getEstimatedLength() {
    const jobHighlights = getJobHighlights();
    let totalSecs = 0;

    if (jobHighlights) {
        Array.from(document.querySelectorAll('p')).forEach(el => {
            if (el.innerText === 'Estimated Length' || el.innerText === 'Finished Minutes') {
                const lengthSpan = el.parentNode.querySelector('span.text-dark');
                if (lengthSpan) {
                    const lengthPattern = /(\d+)h: (\d+)m: (\d+)s/;
                    const match = lengthSpan.innerText.match(lengthPattern);
                    if (match) {
                        const hours = parseInt(match[1]);
                        const mins = parseInt(match[2]);
                        const secs = parseInt(match[3]);
                        totalSecs = hours * 3600 + mins * 60 + secs;
                    }
                }
            }
        });
    }

    return {
        totalHours: totalSecs / 3600,
        totalMins: totalSecs / 60,
        totalSecs: totalSecs,
    };
}
