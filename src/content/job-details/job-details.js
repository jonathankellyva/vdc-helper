// Clicking on the Job Title/ID copies it to the clipboard.
// Holding a modifier key down while clicking will copy both (e.g., "12345 - Awesome Job").

const jobIdElement = jobHeader.querySelector('span');
const jobIdAndTitle = `${JOB_ID} - ${JOB_TITLE}`;

function copyToClipboardAndNotify(text, event) {
    navigator.clipboard.writeText(text).then(() => {
        const notification = document.createElement('div');
        notification.textContent = 'Copied to clipboard: ' + text;
        notification.className = 'clipboard-notification';
        notification.style.left = event.pageX + 'px';
        notification.style.top = event.pageY + 'px';
        document.body.appendChild(notification);

        window.setTimeout(function() {
            notification.style.opacity = '0%';
        }, 1500);

        window.setTimeout(function() {
            notification.remove();
        }, 2000);
    });
}

function onClickJobTitle(event) {
    copyToClipboardAndNotify(isSpecialKeyHeld(event) ? jobIdAndTitle : JOB_TITLE, event);
}

function onClickJobId(event) {
    copyToClipboardAndNotify(isSpecialKeyHeld(event) ? jobIdAndTitle : JOB_ID, event);
}

const SPECIAL_CLICK_NOTE = `\n(or ${SPECIAL_KEY}-click to copy both,\nlike "12345 - Job Title")`;

jobTitleElement.title = 'Click to copy Job Title to clipboard' + SPECIAL_CLICK_NOTE;
jobTitleElement.style.cursor = 'pointer';
jobTitleElement.addEventListener('click', onClickJobTitle);
jobIdElement.title = 'Click to copy Job ID to clipboard' + SPECIAL_CLICK_NOTE;
jobIdElement.style.cursor = 'pointer';
jobIdElement.addEventListener('click', onClickJobId);

// Highlight live directed session tags in gold.

Array.from(document.querySelectorAll('h5'))
    .filter(el => el.innerText === 'Live Directed Session').forEach(ldsHeader => {
    const ldsTag = ldsHeader.nextElementSibling;
    if (ldsTag.nodeName === 'SPAN' && ldsTag.classList.contains('tag')) {
        ldsTag.style.backgroundColor = 'gold';
    }
});

// Hide Performance Details sections that just say "N/A" anyway.

Array.from(document.querySelectorAll('h5'))
    .filter(el => el.innerText === 'Other Project Requirements'
        || el.innerText === 'Reference Link').forEach(function (el) {
    if (el.nextElementSibling.innerText.trim() === 'N/A') {
        // Hide the preceding <hr> tab
        el.previousElementSibling.style.display = 'none';
        // Hide the header (e.g., "Other Project Requirements")
        el.style.display = 'none';
        // Hide the "N/A"
        el.nextElementSibling.style.display = 'none';
    }
});

const referenceFileWrapper = document.getElementById('reference-file-wrapper');
if (referenceFileWrapper) {
    const noReferenceFiles = Array.from(referenceFileWrapper.querySelectorAll('p'))
        .filter(el => el.innerText.trim() === 'N/A').length > 0;
    if (noReferenceFiles) {
        // Hide the preceding <hr> tab
        referenceFileWrapper.previousElementSibling.style.display = 'none';
        // Hide the empty Reference Files section
        referenceFileWrapper.style.display = 'none';
    }
}

// Make the "missing info" flagged job alert stand out more by making it red instead of blue.

const missingInfoAlert = document.getElementById('missing-info-alert');
if (missingInfoAlert) {
    missingInfoAlert.classList.remove('alert-info');
    missingInfoAlert.classList.add('alert-danger');
}

// In the Performance Details sections, turn URLs into actual links so that you can click them.

Array.from(document.querySelectorAll('div.overview-section')).forEach(div => {
    Array.from(div.querySelectorAll('p')).forEach(replaceLinks);
});
