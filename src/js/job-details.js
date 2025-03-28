import * as Browser from './browser';
import * as Budgets from './budgets';
import * as ClientDetails from './client-details';
import * as EmbeddedElements from './embedded-elements';
import * as Job from './job';
import * as Links from './links';
import * as PerfDetails from './perf-details';
import * as SampleScript from './sample-script';
import * as Tags from './tags';
import * as VoiceMatch from './voice-match';

Browser.safeCall(Tags.improveAdTags);

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

Browser.safeCall(PerfDetails.hideEmptyPerfDetailsSections);

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

// Embed YouTube and Vimeo videos directly into the page.

Browser.safeCall(EmbeddedElements.embedVideos);

// Embed supported reference files directly in the page so that you don't have to download them.

Browser.safeCall(EmbeddedElements.embedReferenceFiles);

// Add View links to supported reference files so that you don't have to download them.

Browser.safeCall(EmbeddedElements.addViewLinkForReferenceFiles);

// For jobs that you've responded to, display the audition player above the sample script.

Browser.safeCall(EmbeddedElements.displayAuditionPlayer);

// Highlight jobs with a low budget (<$100, but someday a configurable amount) in red.

Browser.safeCall(Budgets.highlightLowBudgets, Browser.safeCall(Budgets.getBudgetFromJobHighlights));

// For audiobooks or any longer scripts, display PFH rates under Budget.

Browser.safeCall(Budgets.addPFHToBudgetIfApplicable);

// Allow editing Sample Scripts by clicking on them.

Browser.safeCall(SampleScript.initEditor);

// Automatically expand Sample Script rather than requiring you to click Read More.

Browser.safeCall(SampleScript.expandByDefault);

// Move Client Details to a single, compact line at the top of the page under the job title/ID.
Browser.safeCall(ClientDetails.moveClientDetails);

// Help determine cause of <100% VoiceMatch

Browser.safeCall(VoiceMatch.analyze);

// Get rid of terrible wrapping on the Job Details page. (The Performance Details section uses the
// `break-word` CSS class, which sets `word-break: break-all`, which adds line breaks in the
// middle of words. I have no idea why they do this because it is terrible for readability.)

function fixWrapping() {
    Array.from(document.querySelectorAll('p.break-word')).forEach(el => {
        el.classList.remove('break-word');
    });
}

Browser.safeCall(fixWrapping);

// Periodically update the job's status, number of responses, etc.

Browser.safeCall(Job.scheduleUpdates);
