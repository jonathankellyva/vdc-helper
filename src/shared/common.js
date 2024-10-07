const IS_MAC = navigator.platform.toLowerCase().indexOf('mac') >= 0;
const SPECIAL_KEY = IS_MAC ? 'command' : 'control';

function isSpecialKeyHeld(event) {
    return event.altKey || event.ctrlKey || event.metaKey;
}

function isSpecialKeyOrShiftHeld(event) {
    return isSpecialKeyHeld(event) || event.shiftKey;
}

const jobHeader = document.querySelector('.job-header');

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

function replacePreviewResponseLinks(mutationsList) {
    mutationsList.forEach(mutation => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'DIV' && node.classList.contains('jobs-list-item')) {
                    node.querySelectorAll('a').forEach(replacePreviewResponseLink);
                }
            });
        }
    });
}
