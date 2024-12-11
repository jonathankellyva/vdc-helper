const IS_MAC = navigator.platform.toLowerCase().indexOf('mac') >= 0;
const SPECIAL_KEY = IS_MAC ? 'command' : 'control';

function safeCall(func, ...args) {
    try {
        return func(...args);
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

function openNewTab(url) {
    chrome.runtime.sendMessage({ action: "openTab", url });
}

function isSpecialKeyHeld(event) {
    return event.altKey || event.ctrlKey || event.metaKey;
}

function isSpecialKeyOrShiftHeld(event) {
    return isSpecialKeyHeld(event) || event.shiftKey;
}

const jobHeader = document.querySelector('.job-header');
const jobIdElement = jobHeader ? jobHeader.querySelector('span') : null;
const jobTitleElement = jobHeader ? jobHeader.querySelector('h1') : null;
const JOB_TITLE = jobTitleElement ? jobTitleElement.innerText : null;

const JOB_ID_URL_REGEX = /\/talent\/jobs\/(?:posting|(?:preview_)?response)\/(\d+)$/;

function getJobId() {
    const match = window.location.pathname.match(JOB_ID_URL_REGEX);
    return match ? match[1] : null;
}

const JOB_ID = getJobId();

function replaceLinks(el) {
    const urlPattern = /((?:https?:\/\/)?(www\.)?[-a-zA-Z0-9.]{1,256}\.[a-zA-Z][a-zA-Z0-9]{1,5}\b([-a-zA-Z0-9()@:%_+.~#?&/=;]*[a-zA-Z0-9_#])?)/gi;
    el.innerHTML = el.innerHTML.replace(urlPattern, function (match, url) {
        const href = url.indexOf("://") > 0 ? url : 'https://' + url;
        try {
            // Some things might look like a URL, according to the rudimentary regex above,
            // but we confirm here that it is in fact a valid URL.
            // One thing in particular that we don't want to match (but that still matches the
            // above regex) is something like "foo...bar".
            if (!new URL(href).hostname.includes('..')) {
                return `<a href="${href}" target="_blank">${url}</a>`;
            }
        } catch (_) {
        }

        // don't actually replace with a link if it wasn't a valid URL
        return match;
    });
}

function abbreviateLocation(location) {
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

const PREVIEW_RESPONSE_URL_REGEX = /\/talent\/jobs\/preview_response\/(\d+)$/;

function replacePreviewResponseLink(link) {
    const href = link.getAttribute('href');
    const match = href && href.match(PREVIEW_RESPONSE_URL_REGEX);
    if (match) {
        link.setAttribute('href', `/talent/jobs/posting/${match[1]}`);
    }
}

function getJobHighlights() {
    const jobHighlights = document.getElementById('job-highlights');
    if (jobHighlights) {
        return jobHighlights;
    }
    const jobHighlightsHeader = Array.from(document.querySelectorAll('h4'))
        .find(el => el.innerText.trim() === 'Job Highlights')
    if (jobHighlightsHeader) {
        return jobHighlightsHeader.nextElementSibling;
    }
}

function getVoiceMatch() {
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

function getCategoryTag() {
    const jobHighlights = getJobHighlights();

    if (jobHighlights) {
        const categoryHeading = Array.from(jobHighlights.querySelectorAll('p')).find(el => el.innerText === 'Category');
        if (categoryHeading) {
            return categoryHeading.parentNode.querySelector('span.text-dark');
        }
    }

    return undefined;
}

function getCategory() {
    const tag = getCategoryTag();
    return tag ? tag.innerText.trim() : undefined;
}

const BUDGET_REGEX = /(?:\$([0-9,.]+) - )?\$([0-9,.]+)/;

function getBudgetFromJobHighlights() {
    let budgetField = null;
    let minBudget = 0;
    let maxBudget = 0;
    const jobHighlights = getJobHighlights();
    
    if (jobHighlights) {
        const fields = jobHighlights.querySelectorAll('span');
        fields.forEach(function (field) {
            const text = field.textContent.trim();
            const match = text.match(BUDGET_REGEX);
            if (match) {
                budgetField = field;
                minBudget = (match[1] || match[2]).replaceAll(',', '');
                maxBudget = match[2].replaceAll(',', '');
            }
        });
        
        return {
            field: budgetField,
            min: minBudget,
            max: maxBudget,
        };
    }
}

function getEstimatedLength() {
    const jobHighlights = getJobHighlights();
    let totalSecs = 0;

    if (jobHighlights) {
        Array.from(document.querySelectorAll('p')).forEach(el => {
            if (el.innerText === 'Estimated Length') {
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

function highlightLowBudgets(budget) {
    if (budget && budget.max < 100) {
        budget.field.classList.add('low-budget');
        budget.field.classList.remove('text-dark');
    }
}

function addPFHToBudgetIfApplicable() {
    const category = getCategory();
    const budget = getBudgetFromJobHighlights();
    const estimatedLengthInHours = getEstimatedLength().totalHours;

    if (category === 'Audiobooks' && budget && budget.field && budget.max && estimatedLengthInHours) {
        const pfhMin = Math.round(budget.min / estimatedLengthInHours);
        const pfhMax = Math.round(budget.max / estimatedLengthInHours);
        
        if (pfhMax) {
            const pfhField = document.createElement('div');
            pfhField.className = 'text-xxs';
            pfhField.innerText = pfhMin ? `(\$${pfhMin} - \$${pfhMax} PFH)` : `(\$${pfhMax} PFH)`;
            budget.field.parentNode.insertBefore(pfhField, budget.field.nextSibling);
        }
    }
}
