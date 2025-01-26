import * as Browser from './browser';
import * as Job from './job';
import * as Links from './links';
import * as Storage from './storage';

export function getHeader() {
    const additionalDetails = document.getElementById('additionalDetails');
    return Array.from(additionalDetails.querySelectorAll('h5'))
        .find(el => el.innerText.startsWith('Sample Script'));
}

const LONG_PRESS_DURATION = 500; // only for mobile

let pressTimeout;

function documentClick(event) {
    if (event.metaKey) {
        openScriptEditor(event.target);
    }
}

function startLongPress(event) {
    pressTimeout = setTimeout(() => handleLongPress(event), LONG_PRESS_DURATION);
}

function cancelLongPress() {
    clearTimeout(pressTimeout);
}

function handleLongPress(event) {
    openScriptEditor(event.target);
}

let sampleScriptField = document.querySelector('p.readmore-content');
let sampleScriptTextarea = null;
let originalSampleScriptText = null;
let prevSampleScriptText = null;
let saveSampleScriptButton = null;
let resetSampleScriptButton = null;
let editingSampleScript = false;

const additionalDetails = document.getElementById('additionalDetails');
let sampleScriptContainer = document.getElementById('readmore-script-content');

function countWords(text) {
    const words = text.match(/\b[-a-zA-Z0-9'’]+\b/g);
    return words ? words.length : 0;
}

function updateSampleScriptWordCounts() {
    const sampleScriptHeader = getHeader();
    if (sampleScriptHeader && sampleScriptField) {
        const text = editingSampleScript ? sampleScriptTextarea.value : sampleScriptField.innerText;
        const totalWords = countWords(text);
        if (totalWords > 1) {
            const selection = window.getSelection();
            const isSelectingSampleScript = sampleScriptContainer
                && sampleScriptContainer.contains(selection.anchorNode)
                && sampleScriptContainer.contains(selection.focusNode);
            const selectedWords = isSelectingSampleScript ? countWords(selection.toString()) : 0;
            if (selectedWords > 0) {
                sampleScriptHeader.innerText = `Sample Script (selected ${selectedWords} of ${totalWords} total words)`;
            } else {
                sampleScriptHeader.innerText = `Sample Script (${totalWords} words)`;
            }
        } else {
            sampleScriptHeader.innerText = 'Sample Script';
        }
    }
}

function closeEditor(newText) {
    sampleScriptField.innerText = newText;
    sampleScriptTextarea.value = newText;
    sampleScriptField.style.display = 'block';
    sampleScriptTextarea.style.display = 'none';
    editingSampleScript = false;
    Links.replaceLinks(sampleScriptField);
    saveSampleScript();
    onSampleScriptUpdated();
}

function resetSampleScript() {
    if (editingSampleScript) {
        cancelEditingSampleScript();
    }

    sampleScriptField.innerText = originalSampleScriptText;
    sampleScriptField.style.display = 'block';
    sampleScriptTextarea.style.display = 'none';
    Links.replaceLinks(sampleScriptField);
    saveSampleScript();

    editingSampleScript = false;

    saveSampleScriptButton.style.display = 'none';
    resetSampleScriptButton.style.display = 'none';

    updateSampleScriptWordCounts();
}

function cancelEditingSampleScript() {
    if (editingSampleScript) {
        closeEditor(prevSampleScriptText);
    }
}

function finishEditingSampleScript() {
    if (editingSampleScript) {
        closeEditor(sampleScriptTextarea.value);
    }
}

function onSampleScriptKeyDown(event) {
    if (editingSampleScript) {
        if (event.key === 'Enter' && Browser.isSpecialKeyOrShiftHeld(event)) {
            finishEditingSampleScript();
        } else if (event.key === 'Escape') {
            cancelEditingSampleScript();
        }
    }
}

function onSampleScriptUpdated() {
    sampleScriptTextarea.style.height = 'auto';
    sampleScriptTextarea.style.height = sampleScriptTextarea.scrollHeight + 'px';
    saveSampleScriptButton.style.display = editingSampleScript ? 'inline' : 'none';
    saveSampleScriptButton.textContent = prevSampleScriptText === sampleScriptTextarea.value ? 'Close' : 'Save';
    resetSampleScriptButton.style.display = originalSampleScriptText === sampleScriptTextarea.value ? 'none' : 'inline';
    updateSampleScriptWordCounts();
}

function saveSampleScript(force) {
    const key = `script-${Job.JOB_ID}`;
    if (force || originalSampleScriptText !== sampleScriptField.innerText) {
        Storage.LOCAL.set(key, sampleScriptTextarea.value);
    } else {
        Storage.LOCAL.remove(key);
    }
}

function makeScriptEditable() {
    if (sampleScriptField) {
        const sampleScriptHeader = getHeader();
        if (sampleScriptHeader) {
            const sampleScriptLinks = document.createElement('span');

            const sampleScriptEditLink = document.createElement('a');
            sampleScriptEditLink.href = 'about:blank';
            sampleScriptEditLink.innerText = 'Edit';
            sampleScriptEditLink.title = 'Open sample script editor';
            sampleScriptEditLink.className = 'text-xs';
            sampleScriptEditLink.addEventListener('click', function (event) {
                if (!editingSampleScript) {
                    openScriptEditor(sampleScriptField);
                } else {
                    finishEditingSampleScript();
                }
                event.preventDefault();
                return false;
            });

            const separator = document.createElement('span');
            separator.innerText = ' | ';

            const sampleScriptCopyLink = document.createElement('a');
            sampleScriptCopyLink.href = 'about:blank';
            sampleScriptCopyLink.innerText = 'Copy';
            sampleScriptCopyLink.title = 'Copy sample script to clipboard';
            sampleScriptCopyLink.className = 'text-xs';
            sampleScriptCopyLink.addEventListener('click', function (event) {
                finishEditingSampleScript();
                copySampleScriptToClipboard(event);
                event.preventDefault();
                return false;
            });

            sampleScriptLinks.appendChild(sampleScriptEditLink);
            sampleScriptLinks.appendChild(separator);
            sampleScriptLinks.appendChild(sampleScriptCopyLink);

            sampleScriptHeader.parentNode.insertBefore(sampleScriptLinks, sampleScriptHeader.nextElementSibling);
            sampleScriptHeader.style.display = 'inline-block';
        }
        
        if (!sampleScriptTextarea) {
            sampleScriptTextarea = document.createElement('textarea');
            sampleScriptTextarea.style.display = 'none';
            sampleScriptTextarea.style.width = sampleScriptField.offsetWidth + 'px';
            sampleScriptTextarea.style.height = sampleScriptField.offsetHeight + 'px';
            sampleScriptTextarea.style.font = window.getComputedStyle(sampleScriptField).font;
            sampleScriptField.parentNode.appendChild(sampleScriptTextarea);
        }

        sampleScriptTextarea.addEventListener('keydown', onSampleScriptKeyDown);
        sampleScriptTextarea.addEventListener('input', onSampleScriptUpdated);

        saveSampleScriptButton = document.createElement('button');
        saveSampleScriptButton.id = 'save-sample-script';
        saveSampleScriptButton.textContent = 'Save';
        saveSampleScriptButton.style.marginTop = '10px';
        saveSampleScriptButton.style.marginRight = '10px';
        saveSampleScriptButton.style.display = 'none';
        sampleScriptField.parentNode.appendChild(saveSampleScriptButton);

        resetSampleScriptButton = document.createElement('button');
        resetSampleScriptButton.id = 'reset-sample-script';
        resetSampleScriptButton.textContent = 'Reset';
        resetSampleScriptButton.style.marginTop = '10px';
        resetSampleScriptButton.style.display = 'none';
        sampleScriptField.parentNode.appendChild(resetSampleScriptButton);

        saveSampleScriptButton.addEventListener('click', finishEditingSampleScript);
        resetSampleScriptButton.addEventListener('click', resetSampleScript);
    }
}

function copySampleScriptToClipboard(event) {
    Browser.copyToClipboardAndNotify(sampleScriptField.innerText, 'Copied sample script to clipboard', event);
}

function openScriptEditor(target) {
    if (target === sampleScriptField) {
        prevSampleScriptText = sampleScriptField.innerText;

        sampleScriptTextarea.value = prevSampleScriptText;

        sampleScriptField.style.display = 'none';
        sampleScriptTextarea.style.display = 'block';
        sampleScriptTextarea.focus();

        editingSampleScript = true;
        onSampleScriptUpdated();
    }
}

function addSampleScriptContainerIfNecessary() {
    if (additionalDetails && !sampleScriptContainer) {
        sampleScriptContainer = document.createElement('div');
        sampleScriptContainer.id = 'readmore-script-content';
        sampleScriptContainer.className = 'readmore-container readmore-container-wrapped';
        sampleScriptContainer.setAttribute('aria-expanded', 'true');

        sampleScriptField = document.createElement('p');
        sampleScriptField.className = 'text-grey1 text-sm readmore-content';

        sampleScriptContainer.appendChild(sampleScriptField);
        additionalDetails.appendChild(sampleScriptContainer);
    }

    makeScriptEditable();
}

export function initEditor() {
    sampleScriptField = document.querySelector('p.readmore-content');
    addSampleScriptContainerIfNecessary();

    Storage.LOCAL.get(`script-${Job.JOB_ID}`).nonnull().then(savedScript => {
        if (sampleScriptField.innerText) {
            originalSampleScriptText = sampleScriptField.innerText;
        } else {
            originalSampleScriptText = savedScript;
        }

        sampleScriptField.innerText = savedScript;
        sampleScriptTextarea.value = savedScript;
        onSampleScriptUpdated();
    });

    originalSampleScriptText = sampleScriptField.innerText;

    document.addEventListener('click', documentClick);
    document.addEventListener('touchstart', startLongPress);
    document.addEventListener('touchend', cancelLongPress);
    document.addEventListener('touchcancel', cancelLongPress);
    document.addEventListener('touchmove', cancelLongPress);
    document.addEventListener('selectionchange', updateSampleScriptWordCounts);
    document.addEventListener('mouseup', updateSampleScriptWordCounts);

    updateSampleScriptWordCounts();
}

export function expandByDefault() {
    if (sampleScriptContainer) {
        sampleScriptContainer.setAttribute('aria-expanded', 'true');
    }
}