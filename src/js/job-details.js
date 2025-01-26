import * as Browser from './browser';
import * as Budgets from './budgets';
import * as ClientDetails from './client-details';
import * as EmbeddedElements from './embedded-elements';
import * as Job from './job';
import * as Links from './links';
import * as SampleScript from './sample-script';
import * as Tags from './tags';
import * as VoiceMatch from './voice-match';

Array.from(document.querySelectorAll('span.tag'))
    .filter(el => el.innerText.indexOf(' Ad ') > 0)
    .forEach(function (el) {
        // Highlight in-perp ads in red and other ads in green.
        Browser.safeCall(Tags.highlightInPerpAds, el);
        // Make the ad licensing more concise (e.g., "0 Years: 0 Months: 5 Weeks" to "5 Weeks")
        Browser.safeCall(Tags.simplifyLicensingParts, el);
        // Link to GVAA Rate Guide
        Browser.safeCall(Tags.addLinkToRateGuide, el);
    });

function addRateGuideLinkToCategory() {
    const categoryHeading = Job.getCategoryHeading();
    if (categoryHeading) {
        Tags.addLinkToRateGuide(categoryHeading);
    }
}

Browser.safeCall(addRateGuideLinkToCategory);

// Clicking on the Job Title/ID copies it to the clipboard.
// Holding a modifier key down while clicking will copy both (e.g., "12345 - Awesome Job").

function addClickHandlersToJobTitleAndId() {
    function copyToClipboardAndNotify(text, event) {
        Browser.copyToClipboardAndNotify(text, 'Copied to clipboard: ' + text, event);
    }

    const JOB_ID_AND_TITLE = `${Job.JOB_ID} - ${Job.JOB_TITLE}`;

    function onClickJobTitle(event) {
        copyToClipboardAndNotify(Browser.isSpecialKeyHeld(event) ? JOB_ID_AND_TITLE : Job.JOB_TITLE, event);
    }

    function onClickJobId(event) {
        copyToClipboardAndNotify(Browser.isSpecialKeyHeld(event) ? JOB_ID_AND_TITLE : Job.JOB_ID, event);
    }

    const SPECIAL_CLICK_NOTE = `\n(or ${Browser.SPECIAL_KEY}-click to copy both,\nlike "12345 - Job Title")`;

    if (Job.jobTitleElement) {
        Job.jobTitleElement.title = 'Click to copy Job Title to clipboard' + SPECIAL_CLICK_NOTE;
        Job.jobTitleElement.style.cursor = 'pointer';
        Job.jobTitleElement.addEventListener('click', onClickJobTitle);
    }
    if (Job.jobIdElement) {
        Job.jobIdElement.title = 'Click to copy Job ID to clipboard' + SPECIAL_CLICK_NOTE;
        Job.jobIdElement.style.cursor = 'pointer';
        Job.jobIdElement.addEventListener('click', onClickJobId);
    }
}

Browser.safeCall(addClickHandlersToJobTitleAndId);

// Highlight live directed session tags in gold.

function highlightLiveDirectedSessions() {
    Array.from(document.querySelectorAll('h5'))
        .filter(el => el.innerText === 'Live Directed Session').forEach(ldsHeader => {
        const ldsTag = ldsHeader.nextElementSibling;
        if (ldsTag && ldsTag.nodeName === 'SPAN' && ldsTag.classList.contains('tag')) {
            ldsTag.style.backgroundColor = 'gold';
        }
    });
}

Browser.safeCall(highlightLiveDirectedSessions);

// Hide Performance Details sections that just say "N/A" anyway.

function hideEmptyPerfDetailsSections() {
    Array.from(document.querySelectorAll('h5'))
        .filter(el => el.innerText === 'Other Project Requirements'
            || el.innerText === 'Reference Link').forEach(function (el) {
        if (el.nextElementSibling && el.nextElementSibling.innerText.trim() === 'N/A') {
            if (el.previousElementSibling) {
                // Hide the preceding <hr> tab
                el.previousElementSibling.style.display = 'none';
            }
            // Hide the header (e.g., "Other Project Requirements")
            el.style.display = 'none';
            // Hide the "N/A"
            el.nextElementSibling.style.display = 'none';
        }
    });

    const referenceFileWrapper = document.getElementById('reference-file-wrapper');
    if (referenceFileWrapper && referenceFileWrapper.previousElementSibling) {
        const noReferenceFiles = Array.from(referenceFileWrapper.querySelectorAll('p'))
            .filter(el => el.innerText.trim() === 'N/A').length > 0;
        if (noReferenceFiles) {
            // Hide the preceding <hr> tab
            referenceFileWrapper.previousElementSibling.style.display = 'none';
            // Hide the empty Reference Files section
            referenceFileWrapper.style.display = 'none';
        }
    }
}

Browser.safeCall(hideEmptyPerfDetailsSections);

// Make the "missing info" flagged job alert stand out more by making it red instead of blue.

function highlightMissingInfoAlert() {
    const missingInfoAlert = document.getElementById('missing-info-alert');
    if (missingInfoAlert) {
        missingInfoAlert.classList.remove('alert-info');
        missingInfoAlert.classList.add('alert-danger');
    }
}

Browser.safeCall(highlightMissingInfoAlert);

// In the Performance Details sections, turn URLs into actual links so that you can click them.

function makeLinksClickable() {
    Array.from(document.querySelectorAll('div.overview-section')).forEach(div => {
        Array.from(div.querySelectorAll('p')).forEach(Links.replaceLinks);
    });
}

Browser.safeCall(makeLinksClickable);

// Embed YouTube videos directly into the page.

Browser.safeCall(EmbeddedElements.embedYouTubeVideos);

// Embed supported reference files directly in the page so that you don't have to download them.

Browser.safeCall(EmbeddedElements.embedReferenceFiles);

// Add View links to supported reference files so that you don't have to download them.

Browser.safeCall(EmbeddedElements.addViewLinkForReferenceFiles);

// For jobs that you've responded to, display the audition player above the sample script.

Browser.safeCall(EmbeddedElements.displayAuditionPlayer);

// Highlight jobs with a low budget (<$100, but someday a configurable amount) in red.

Browser.safeCall(Budgets.highlightLowBudgets, Browser.safeCall(Budgets.getBudgetFromJobHighlights));

// For audiobooks, display PFH rates under Budget.

Browser.safeCall(Budgets.addPFHToBudgetIfApplicable);

// Allow editing Sample Scripts by clicking on them.

Browser.safeCall(SampleScript.initEditor);

// Automatically expand Sample Script rather than requiring you to click Read More.

Browser.safeCall(SampleScript.expandByDefault);

// Move Client Details to a single, compact line at the top of the page under the job title/ID.
Browser.safeCall(ClientDetails.moveClientDetails);

// Help determine cause of <100% VoiceMatch

Browser.safeCall(VoiceMatch.analyze);
