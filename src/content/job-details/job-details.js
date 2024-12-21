// Clicking on the Job Title/ID copies it to the clipboard.
// Holding a modifier key down while clicking will copy both (e.g., "12345 - Awesome Job").

function addClickHandlersToJobTitleAndId() {
    function copyToClipboardAndNotify(text, event) {
        navigator.clipboard.writeText(text).then(() => {
            const notification = document.createElement('div');
            notification.textContent = 'Copied to clipboard: ' + text;
            notification.className = 'clipboard-notification';
            notification.style.left = event.pageX + 'px';
            notification.style.top = event.pageY + 'px';
            document.body.appendChild(notification);

            window.setTimeout(function () {
                notification.style.opacity = '0%';
            }, 1500);

            window.setTimeout(function () {
                notification.remove();
            }, 2000);
        });
    }

    const JOB_ID_AND_TITLE = `${JOB_ID} - ${JOB_TITLE}`;

    function onClickJobTitle(event) {
        copyToClipboardAndNotify(isSpecialKeyHeld(event) ? JOB_ID_AND_TITLE : JOB_TITLE, event);
    }

    function onClickJobId(event) {
        copyToClipboardAndNotify(isSpecialKeyHeld(event) ? JOB_ID_AND_TITLE : JOB_ID, event);
    }

    const SPECIAL_CLICK_NOTE = `\n(or ${SPECIAL_KEY}-click to copy both,\nlike "12345 - Job Title")`;

    if (jobTitleElement) {
        jobTitleElement.title = 'Click to copy Job Title to clipboard' + SPECIAL_CLICK_NOTE;
        jobTitleElement.style.cursor = 'pointer';
        jobTitleElement.addEventListener('click', onClickJobTitle);
    }
    if (jobIdElement) {
        jobIdElement.title = 'Click to copy Job ID to clipboard' + SPECIAL_CLICK_NOTE;
        jobIdElement.style.cursor = 'pointer';
        jobIdElement.addEventListener('click', onClickJobId);
    }
}

safeCall(addClickHandlersToJobTitleAndId);

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

safeCall(highlightLiveDirectedSessions);

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

safeCall(hideEmptyPerfDetailsSections);

// Make the "missing info" flagged job alert stand out more by making it red instead of blue.

function highlightMissingInfoAlert() {
    const missingInfoAlert = document.getElementById('missing-info-alert');
    if (missingInfoAlert) {
        missingInfoAlert.classList.remove('alert-info');
        missingInfoAlert.classList.add('alert-danger');
    }
}

safeCall(highlightMissingInfoAlert);

// In the Performance Details sections, turn URLs into actual links so that you can click them.

function makeLinksClickable() {
    Array.from(document.querySelectorAll('div.overview-section')).forEach(div => {
        Array.from(div.querySelectorAll('p')).forEach(replaceLinks);
    });
}

safeCall(makeLinksClickable);

// Highlight jobs with a low budget (<$100, but someday a configurable amount) in red.

safeCall(highlightLowBudgets, safeCall(getBudgetFromJobHighlights));

// For audiobooks, display PFH rates under Budget.

safeCall(addPFHToBudgetIfApplicable);
