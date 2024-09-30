// ==UserScript==
// @name         Voices.com Helper
// @namespace    http://jskva.com/
// @version      2024-09-30
// @description  Several improvements to the Voices.com website
// @author       Jonathan Kelly <jskva@jskva.com>
// @match        https://www.voices.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=voices.com
// @downloadURL  https://github.com/jonathankellyva/vdc-helper/raw/stable/vdc-helper.user.js
// @updateURL    https://github.com/jonathankellyva/vdc-helper/raw/stable/vdc-helper.user.js
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_openInTab
// @grant        GM.xmlHttpRequest
// ==/UserScript==

// See https://github.com/jonathankellyva/vdc-helper for more information.

(function () {
    'use strict';

    const style = document.createElement('style');
    style.textContent = `
        .readmore-btn {
            display: none !important;
        }

        #missing-info-alert {
            border-color: darkred;
            background-color: pink;
        }
        
        a.gvaa-link {
            padding-left: 3px;
        }
        
        img.gvaa-icon {
            width: 16px;
            height: 16px;
        }
        
        .clipboard-notification {
            position: absolute;
            background-color: #ffffe1;
            color: black;
            font-family: Arial, sans-serif;
            font-size: 12px;
            padding: 4px 8px;
            border: 1px solid #c0c0c0;
            border-radius: 4px;
            box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            pointer-events: none;
            opacity: 1;
            transition: opacity 0.5s ease-out;
        }
        
        .proposal-border-template-selected {
            border-left: 8px solid rgb(240, 244, 247);
            padding-left: 24px;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);

    const isMac = navigator.platform.toLowerCase().indexOf('mac') >= 0;
    const specialKey = isMac ? 'command' : 'control';

    const prevVersion = GM_getValue('scriptVersion');
    const currVersion = GM_info.script.version;

    if (prevVersion !== currVersion) {
        if (prevVersion) {
            GM_openInTab('https://github.com/jonathankellyva/vdc-helper/wiki/What\'s-New', {active: false});
            window.setTimeout(() => {
                window.focus();
            }, 500);
        }
        GM_setValue('scriptVersion', currVersion);
    }

    const LONG_PRESS_DURATION = 500; // only for mobile

    let jobId = null;

    let pressTimeout;

    function documentClick(event) {
        if (event.metaKey) {
            makeScriptEditable(event.target);
        }
    }

    function startLongPress(event) {
        pressTimeout = setTimeout(() => handleLongPress(event), LONG_PRESS_DURATION);
    }

    function cancelLongPress() {
        clearTimeout(pressTimeout);
    }

    function handleLongPress(event) {
        makeScriptEditable(event.target);
    }

    function isSpecialKeyHeld(event) {
        return event.altKey || event.ctrlKey || event.metaKey;
    }

    function isSpecialKeyOrShiftHeld(event) {
        return isSpecialKeyHeld(event) || event.shiftKey;
    }

    let sampleScriptField = document.querySelector('p.readmore-content');
    let sampleScriptTextarea = null;
    let originalSampleScriptText = null;
    let prevSampleScriptText = null;
    let saveSampleScriptButton = null;
    let resetSampleScriptButton = null;
    let editingSampleScript = false;

    const sampleScriptContainer = document.getElementById('readmore-script-content');

    function countWords(text) {
        const words = text.match(/\b[-a-zA-Z0-9'’]+\b/g);
        return words ? words.length : 0;
    }

    function getSampleScriptHeader() {
        const additionalDetails = document.getElementById('additionalDetails');
        return Array.from(additionalDetails.querySelectorAll('h5'))
            .find(el => el.innerText.startsWith('Sample Script'));
    }

    function updateSampleScriptWordCounts() {
        const sampleScriptHeader = getSampleScriptHeader();
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
        replaceLinks(sampleScriptField);
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
        replaceLinks(sampleScriptField);
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
            if (event.key === 'Enter' && isSpecialKeyOrShiftHeld(event)) {
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

    function saveSampleScript() {
        const key = `script-${jobId}`;
        if (originalSampleScriptText !== sampleScriptField.innerText) {
            GM_setValue(key, sampleScriptTextarea.value);
        } else {
            GM_deleteValue(key);
        }
    }

    function makeScriptEditable(target) {
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

    function replaceLinks(el) {
        const urlPattern = /((?:https?:\/\/)?(www\.)?[-a-zA-Z0-9.]{1,256}\.[a-zA-Z][a-zA-Z0-9]{1,5}\b([-a-zA-Z0-9()@:%_+.~#?&/=;]*[a-zA-Z0-9_#])?)/gi;
        el.innerHTML = el.innerHTML.replace(urlPattern, function (match, url) {
            const href = url.indexOf("://") > 0 ? url : 'https://' + url;
            try {
                // Some things might look like a URL, according to the rudimentary regex above,
                // but we confirm here that it is in fact a valid URL.
                // One thing in particular that we don't want to match (but that still matches the
                // above regex) is something like "foo...bar".
                if (new URL(href).hostname.indexOf('..') < 0) {
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

    if (window.location.pathname.startsWith('/talent/jobs/posting')) {
        // Clicking on the Job Title/ID copies it to the clipboard.
        // Holding a modifier key down while clicking will copy both (e.g., "12345 - Awesome Job").

        const jobHeader = document.querySelector('.job-header');
        const jobTitleElement = jobHeader.querySelector('h1');
        const jobIdElement = jobHeader.querySelector('span');
        if (jobTitleElement && jobIdElement) {
            const jobTitle = jobTitleElement.innerText;
            const jobIdPattern = /#(\d+)/;
            const jobIdMatch = jobIdElement.innerText.match(jobIdPattern);

            if (jobIdMatch) {
                jobId = jobIdMatch[1];
                const jobIdAndTitle = `${jobId} - ${jobTitle}`;

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
                    copyToClipboardAndNotify(isSpecialKeyHeld(event) ? jobIdAndTitle : jobTitle, event);
                }

                function onClickJobId(event) {
                    copyToClipboardAndNotify(isSpecialKeyHeld(event) ? jobIdAndTitle : jobId, event);
                }

                const specialClickNote = `\n(or ${specialKey}-click to copy both,\nlike "12345 - Job Title")`;

                jobTitleElement.title = 'Click to copy Job Title to clipboard' + specialClickNote;
                jobTitleElement.style.cursor = 'pointer';
                jobTitleElement.addEventListener('click', onClickJobTitle);
                jobIdElement.title = 'Click to copy Job ID to clipboard' + specialClickNote;
                jobIdElement.style.cursor = 'pointer';
                jobIdElement.addEventListener('click', onClickJobId);
            }
        }

        // Allow editing Sample Scripts by clicking on them.

        sampleScriptField = document.querySelector('p.readmore-content');
        if (sampleScriptField) {
            originalSampleScriptText = sampleScriptField.innerText;

            sampleScriptTextarea = document.createElement('textarea');
            sampleScriptTextarea.style.display = 'none';
            sampleScriptTextarea.style.width = sampleScriptField.offsetWidth + 'px';
            sampleScriptTextarea.style.height = sampleScriptField.offsetHeight + 'px';
            sampleScriptTextarea.style.font = window.getComputedStyle(sampleScriptField).font;
            sampleScriptField.parentNode.appendChild(sampleScriptTextarea);

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

            const savedScript = GM_getValue(`script-${jobId}`);
            if (savedScript) {
                sampleScriptField.innerText = savedScript;
                sampleScriptTextarea.value = savedScript;
                onSampleScriptUpdated();
            }
        }

        document.addEventListener('click', documentClick);
        document.addEventListener('touchstart', startLongPress);
        document.addEventListener('touchend', cancelLongPress);
        document.addEventListener('touchcancel', cancelLongPress);
        document.addEventListener('touchmove', cancelLongPress);
        document.addEventListener('selectionchange', updateSampleScriptWordCounts);
        document.addEventListener('mouseup', updateSampleScriptWordCounts);

        updateSampleScriptWordCounts();
        
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

        // Automatically expand Sample Script rather than requiring you to click Read More.

        if (sampleScriptContainer) {
            sampleScriptContainer.setAttribute('aria-expanded', 'true');
        }

        // Hide Managed Services Payment Policy alert at the top of the page.
        // Instead, add an icon next to job ID at top of the page.

        const managedJobAlert = document.getElementById('proserve-policy-alert');

        if (managedJobAlert) {
            const jobTitleDetails = document.getElementById('job_title_details');
            if (jobTitleDetails) {
                Array.from(jobTitleDetails.querySelectorAll('span'))
                    .filter(el => el.innerText.startsWith('Job #')).forEach(jobId => {
                    const voicesManagedIconSpan = document.createElement('span');
                    voicesManagedIconSpan.className = 'status-icon status-icon-blue hidden-xs icon-padding';
                    voicesManagedIconSpan.style.display = 'inline-block';
                    voicesManagedIconSpan.style.verticalAlign = 'middle';
                    voicesManagedIconSpan.style.marginTop = '-1px';
                    voicesManagedIconSpan.setAttribute('data-toggle', 'tooltip');
                    voicesManagedIconSpan.setAttribute('data-placement', 'top');
                    voicesManagedIconSpan.setAttribute('data-container', 'body');
                    voicesManagedIconSpan.setAttribute('data-original-title',
                        'Job was posted by Voices Managed Services');
                    const voicesManagedIcon = document.createElement('img');
                    voicesManagedIcon.className = 'voices-fsj-icon';
                    voicesManagedIcon.src = 'https://static.voices.com/assets/images/branding/v-logo-white.svg';
                    voicesManagedIconSpan.appendChild(voicesManagedIcon);
                    jobId.insertAdjacentElement('afterend', voicesManagedIconSpan);
                });
            }

            managedJobAlert.style.display = 'none';
        }

        // In the Performance Details sections, turn URLs into actual links so that you can click them.

        Array.from(document.querySelectorAll('div.overview-section')).forEach(div => {
            Array.from(div.querySelectorAll('p')).forEach(replaceLinks);
        });

        // Embed YouTube videos directly into the page.

        const youtubeLinkPattern = /https:\/\/(?:www\.)?(?:youtube.com\/watch\?v=|youtu\.be\/)([-_a-zA-Z0-9]+)(&.*)?/;

        Array.from(document.querySelectorAll('div.overview-section')).forEach(div => {
            Array.from(div.querySelectorAll('a')).forEach(a => {
                const match = a.href.match(youtubeLinkPattern);
                if (match) {
                    // <iframe width="560" height="315" src="https://www.youtube.com/embed/pwLergHG81c?si=kQ44lnrkn08pUv42" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

                    const videoId = match[1];
                    const extraParams = match[2];
                    const iframe = document.createElement('iframe');

                    iframe.src = `https://www.youtube.com/embed/${videoId}?${extraParams}`;
                    iframe.allowFullscreen = true;
                    iframe.width = '100%';
                    iframe.height = '384px';

                    a.parentNode.appendChild(iframe);
                }
            });
        });

        // Move Client Details to a single, compact line at the top of the page under the job title/ID.

        const clientDetailsContainer = document.querySelector('.client-details-container');
        if (jobHeader && clientDetailsContainer) {
            const clientDetails = clientDetailsContainer.querySelector('.d-flex');
            if (clientDetails) {
                const newClientDetailsContainer = document.createElement('a');

                newClientDetailsContainer.style.display = 'block';
                newClientDetailsContainer.setAttribute('data-toggle', 'modal');
                newClientDetailsContainer.setAttribute('data-target', '#client-details-modal');

                const clientPhoto = clientDetails.querySelector('.circle-avatar-container');
                if (clientPhoto != null) {
                    clientPhoto.style.display = 'inline-flex';
                    clientPhoto.style.verticalAlign = 'middle';
                    newClientDetailsContainer.appendChild(clientPhoto);
                }

                const clientName = clientDetails.querySelector('.client-name');
                if (clientName != null) {
                    clientName.style.marginLeft = '5px';
                    clientName.classList.add('muted-text');
                    newClientDetailsContainer.appendChild(clientName);
                }

                const clientRating = clientDetails.querySelector('.job-details-rating');
                if (clientRating) {
                    const clientReviews = clientRating.parentNode.querySelector('span');

                    newClientDetailsContainer.appendChild(clientRating);
                    if (clientReviews) {
                        newClientDetailsContainer.appendChild(clientReviews);
                    }
                }

                const clientLocation = clientDetails.querySelector('.location');
                if (clientLocation) {
                    const clientLocationIcon = clientLocation.querySelector('i');
                    const clientLocationText = clientLocation.querySelector('span');
                    if (clientLocationIcon) {
                        clientLocationIcon.classList.add('muted-text');
                        clientLocationIcon.style.marginLeft = '5px';
                        newClientDetailsContainer.appendChild(clientLocationIcon);
                    }
                    if (clientLocationText) {
                        clientLocationText.innerText = abbreviateLocation(clientLocationText.innerText);
                        clientLocationText.style.marginLeft = '5px';
                        newClientDetailsContainer.appendChild(clientLocationText);
                    }
                }

                if (newClientDetailsContainer.children) {
                    jobHeader.appendChild(newClientDetailsContainer);
                    clientDetailsContainer.style.display = 'none';
                }
            }
        }

        // Display controls for playing reference audio and video along with the Download links.

        Array.from(document.querySelectorAll('.file-details-box')).forEach(file => {
            const filenameField = file.querySelector('.file-details-box-filename');
            const downloadLink = file.querySelector('a');
            if (filenameField && downloadLink && downloadLink.innerText === 'Download') {
                const filename = filenameField.innerText;
                const isAudio = filename.endsWith('.mp3') || filename.endsWith('.m4a') || filename.endsWith('.wav');
                const isVideo = filename.endsWith('.mp4');
                const isImage = filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg');
                if (isAudio || isVideo) {
                    const player = document.createElement(isAudio ? 'audio' : 'video');
                    player.controls = true;
                    player.src = downloadLink.href;
                    player.style.display = 'block';
                    player.style.width = '100%';
                    file.appendChild(player);
                } else if (isImage) {
                    const img = document.createElement('img');
                    img.src = downloadLink.href;
                    img.style.marginTop = '10px';
                    file.appendChild(img);
                }
            }
        });

        // For jobs that you've responded to, display the audition player above the sample script.

        const sampleScriptHeader = getSampleScriptHeader();
        if (sampleScriptHeader) {
            GM.xmlHttpRequest({
                method: 'GET',
                url: `https://www.voices.com/talent/jobs/preview_response/${jobId}`,
                onload: function (response) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, "text/html");
                    const player = doc.getElementById('demo-player');

                    if (player) {
                        const header = document.createElement('h5');
                        header.innerText = 'Your Audition';
                        header.style.marginBottom = '5px';
                        
                        const source = player.querySelector('source');
                        const audio = document.createElement('audio');
                        audio.controls = true;
                        audio.src = source.getAttribute('data-src');

                        sampleScriptHeader.parentNode.insertBefore(audio, sampleScriptHeader);
                        sampleScriptHeader.parentNode.insertBefore(header, audio);
                    }
                }
            });
        }
    }

    const defaultTemplateCheckbox = document.createElement('input');
    const defaultTemplateCheckboxLabel = document.createElement('label');
    const templateChoicesDropdown = document.querySelector('div.choices');
    const templateSelector = document.querySelector('.choices__list--single');
    const selectedTemplateItem = templateSelector ? templateSelector.querySelector('.choices__item') : null;
    const proposalBorderWrap = document.querySelector('div.border-wrap');
    const notes = document.getElementById('notes');
    const liveSessionPolicy = document.getElementById('lds_policy');
    const revisionPolicy = document.getElementById('revision_policy');

    let selectedTemplateId = null;

    if (window.location.pathname.startsWith('/talent/jobs/response')) {
        // Highlight live directed session tags in gold on the response page.

        Array.from(document.querySelectorAll('span.tag'))
            .filter(el => el.innerText.startsWith('Live Directed Session')).forEach(ldsTag => {
                ldsTag.style.backgroundColor = 'gold';
            });
    
        // Allow selecting a response template that should be automatically filled in by default.

        const defaultTemplateId = GM_getValue('default-template-id');

        if (templateChoicesDropdown && templateSelector && selectedTemplateItem) {
            defaultTemplateCheckbox.id = 'default-template-checkbox';
            defaultTemplateCheckbox.type = 'checkbox';
            defaultTemplateCheckbox.checked = (defaultTemplateId || '') !== '';
            defaultTemplateCheckbox.style.display = 'none';
            defaultTemplateCheckboxLabel.style.display = 'none';
            defaultTemplateCheckboxLabel.style.marginLeft = '5px';
            defaultTemplateCheckboxLabel.setAttribute('for', defaultTemplateCheckbox.id);
            defaultTemplateCheckboxLabel.innerText = 'Automatically use this template by default';

            defaultTemplateCheckbox.addEventListener('change', event => {
                if (event.target.checked) {
                    GM_setValue('default-template-id', selectedTemplateId);
                } else {
                    GM_deleteValue('default-template-id');
                }
            });

            templateChoicesDropdown.parentNode.appendChild(defaultTemplateCheckbox);
            templateChoicesDropdown.parentNode.appendChild(defaultTemplateCheckboxLabel);

            const onTemplateSelected = (mutationsList, observer) => {
                mutationsList.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            selectedTemplateId = node.getAttribute('data-value');

                            const templateSelected = (selectedTemplateId || '') !== '';
                            const defaultTemplateId = GM_getValue('default-template-id');

                            defaultTemplateCheckbox.checked = selectedTemplateId === defaultTemplateId;
                            defaultTemplateCheckbox.style.display = templateSelected ? 'inline' : 'none';
                            defaultTemplateCheckboxLabel.style.display = templateSelected ? 'inline' : 'none';

                            if (!templateSelected) {
                                notes.value = '';
                                revisionPolicy.value = '';
                                if (liveSessionPolicy) {
                                    liveSessionPolicy.value = '';
                                }
                            }

                            if (proposalBorderWrap) {
                                if (templateSelected) {
                                    proposalBorderWrap.classList.add('proposal-border-template-selected');
                                } else {
                                    proposalBorderWrap.classList.remove('proposal-border-template-selected');
                                    proposalBorderWrap.style = '';
                                }
                            }
                        });
                    }
                });
            };

            const templateObserver = new MutationObserver(onTemplateSelected);

            templateObserver.observe(templateSelector, { childList: true });

            if (defaultTemplateId && notes && revisionPolicy && notes.value === '') {
                GM.xmlHttpRequest({
                    method: 'GET',
                    url: `https://www.voices.com/talent/jobs/member_template/${defaultTemplateId}`,
                    onload: function (response) {
                        if (response.responseText) {
                            const responseData = JSON.parse(response.responseText);
                            if (responseData.status === 'success' && responseData.data) {
                                notes.value = responseData.data.template || '';
                                revisionPolicy.value = responseData.data.revision_policy || '';
                                if (liveSessionPolicy) {
                                    liveSessionPolicy.value = responseData.data.lds_policy || '';
                                }

                                defaultTemplateCheckbox.checked = true;
                                defaultTemplateCheckbox.style.display = 'inline';
                                defaultTemplateCheckboxLabel.style.display = 'inline';

                                selectedTemplateItem.classList.remove('choices__placeholder');
                                selectedTemplateItem.innerText = responseData.data.title;

                                if (proposalBorderWrap
                                    && !proposalBorderWrap.classList.contains('proposal-border-template-selected')) {
                                    proposalBorderWrap.classList.add('proposal-border-template-selected')
                                }

                                const deleteButton = document.createElement('button');
                                deleteButton.className = 'choices__button';
                                deleteButton.setAttribute('aria-label', `Remove item: ${defaultTemplateId}`);
                                deleteButton.setAttribute('data-button', '');
                                deleteButton.textContent = 'Remove item';

                                selectedTemplateItem.appendChild(deleteButton);
                            }
                        }
                    }
                });
            }
        }

        // When responding to a job, automatically fill in the max budget for the bid.

        let maxBudget = 0;
        const jobHighlights = document.querySelector('#job-highlights');
        if (jobHighlights) {
            let fields = jobHighlights.querySelectorAll('span');
            let budgetPattern = /(?:\$\d+ - )?\$(\d+)/;
            fields.forEach(function (field) {
                let text = field.textContent.trim();
                let match = text.match(budgetPattern);
                if (match) {
                    maxBudget = match[1];
                }
            });
        }

        const quoteField = document.querySelector('input[name="quote"]');
        if (quoteField && !quoteField.value) {
            quoteField.value = maxBudget;
            quoteField.dispatchEvent(new Event('keyup'));
        }
    }

    // Link to the original job postings rather than to your response.

    function replacePreviewResponseLink(link) {
        const href = link.getAttribute('href');
        const match = href && href.match(/\/talent\/jobs\/preview_response\/(\d+)$/);
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

    Array.from(document.querySelectorAll('a'))
        .forEach(replacePreviewResponseLink);

    const observer = new MutationObserver(replacePreviewResponseLinks);
    const config = {
        childList: true,
        subtree: true,
    };
    observer.observe(document.body, config);

    // Statistics page improvements:
    // * Hide dollar amounts by default.
    // * Show audition listen/shortlist %s.
    // * Allow filtering Audition History by Listened/Shortlisted.

    const REDACTED_TEXT = '(click to show)';

    function hideDollarAmount(el) {
        const amount = el.innerText
        if (amount !== REDACTED_TEXT) {
            el.setAttribute('mask', 'true');
            el.innerText = REDACTED_TEXT;
            el.addEventListener('click', () => {
                el.setAttribute('mask', 'false');
                el.innerText = amount;
            });
        }
    }

    function onStatsUpdated(mutationsList) {
        let auditionsSubmitted = 0;
        let auditionListens = 0;
        let auditionListenPercentField = document.getElementById('audition-listen-percent');
        let auditionsShortlisted = 0;
        let submittedAuditionShortlistPercentField = document.getElementById('submitted-audition-shortlist-percent');
        let listenedAuditionShortlistPercentField = document.getElementById('listened-audition-shortlist-percent');
        let updatePercents = false;

        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                const el = mutation.target;
                if (el.tagName === 'SPAN' && el.classList.contains('stat-figure')
                    && el.innerText.startsWith('$')
                    && el.getAttribute('mask') !== 'false') {
                    hideDollarAmount(el)
                }
            }

            const dataStatFigure = mutation.target.getAttribute('data-stat-figure');

            if (dataStatFigure === 'auditions_submitted') {
                auditionsSubmitted = parseInt(mutation.target.innerText);
                updatePercents = true;
            } else if (dataStatFigure === 'audition_listens') {
                const auditionListensField = mutation.target;
                auditionListens = parseInt(auditionListensField.innerText);
                if (!auditionListenPercentField) {
                    auditionListenPercentField = document.createElement('div');
                    auditionListenPercentField.id = 'audition-listen-percent';
                    auditionListenPercentField.style.fontSize = 'small';
                    auditionListensField.insertAdjacentElement('afterend', auditionListenPercentField);
                }
                updatePercents = true;
            } else if (dataStatFigure === 'auditions_shortlisted') {
                const auditionsShortlistedField = mutation.target;
                auditionsShortlisted = parseInt(auditionsShortlistedField.innerText);
                if (!submittedAuditionShortlistPercentField) {
                    submittedAuditionShortlistPercentField = document.createElement('div');
                    submittedAuditionShortlistPercentField.id = 'submitted-audition-shortlist-percent';
                    submittedAuditionShortlistPercentField.style.fontSize = 'small';
                    auditionsShortlistedField.insertAdjacentElement('afterend', submittedAuditionShortlistPercentField);
                }
                if (!listenedAuditionShortlistPercentField) {
                    listenedAuditionShortlistPercentField = document.createElement('div');
                    listenedAuditionShortlistPercentField.id = 'listened-audition-shortlist-percent';
                    listenedAuditionShortlistPercentField.style.fontSize = 'small';
                    auditionsShortlistedField.insertAdjacentElement('afterend', listenedAuditionShortlistPercentField);
                }
                updatePercents = true;
            }
        });

        if (updatePercents) {
            let auditionListenPercent = 0;
            let submittedAuditionShortlistPercent = 0;
            let listenedAuditionShortlistPercent = 0;

            if (auditionsSubmitted > 0) {
                if (auditionListens > 0) {
                    auditionListenPercent = (100 * auditionListens / auditionsSubmitted).toFixed(1);
                }

                if (auditionsShortlisted > 0) {
                    submittedAuditionShortlistPercent = (100 * auditionsShortlisted / auditionsSubmitted).toFixed(1);
                    listenedAuditionShortlistPercent = (100 * auditionsShortlisted / auditionListens).toFixed(1);
                }
            }

            auditionListenPercentField.innerHTML = auditionListenPercent > 0 ? ' (' + auditionListenPercent + '% of submitted)' : '';
            submittedAuditionShortlistPercentField.innerHTML = submittedAuditionShortlistPercent > 0 ? ' (' + submittedAuditionShortlistPercent + '% of submitted)' : '';
            listenedAuditionShortlistPercentField.innerHTML = listenedAuditionShortlistPercent > 0 ? ' (' + listenedAuditionShortlistPercent + '% of listened)' : '';
        }
    }

    let auditionHistory = null;
    let filterAuditionsBy = 'none';

    function changeAuditionFilter(mode) {
        if (filterAuditionsBy === mode) {
            filterAuditionsBy = 'none';
        } else {
            filterAuditionsBy = mode;
        }
        if (auditionHistory) {
            Array.from(auditionHistory.querySelectorAll('div.table-row')).forEach(function (row) {
                if (filterAuditionsBy === 'none') {
                    row.style.display = 'block';
                } else {
                    const label = filterAuditionsBy === 'Listened' ? 'Listened To' : 'Shortlisted';
                    const filter = '[aria-label="' + label + '"]'
                    const matches = row.querySelector(filter) != null;
                    row.style.display = matches ? 'block' : 'none';
                }
            });
        }
    }

    if (window.location.pathname.startsWith('/talent/statistics')) {
        Array.from(document.querySelectorAll('.stat-figure'))
            .filter(el => el.innerText.startsWith('$'))
            .forEach(hideDollarAmount);

        Array.from(document.querySelectorAll('h2'))
            .filter(h2 => h2.innerHTML === 'Audition History')
            .forEach(function (auditionHistoryHeader) {
                auditionHistory = auditionHistoryHeader.closest('.stats-container');
            });

        if (auditionHistory) {
            Array.from(auditionHistory.querySelectorAll('div'))
                .filter(div => div.innerHTML === 'Listened' || div.innerHTML === 'Shortlisted')
                .forEach(function (div) {
                    div.addEventListener('click', () => {
                        changeAuditionFilter(div.innerHTML);
                    });
                    div.style.cursor = 'pointer';
                });
        }

        const observer = new MutationObserver(onStatsUpdated);
        const config = {
            childList: true,
            subtree: true,
        };
        observer.observe(document.body, config);
    }


    // Highlight in-perp ads in red and other ads in green.

    Array.from(document.querySelectorAll('span.tag'))
        .filter(el => el.innerText.indexOf(' Ad ') > 0)
        .forEach(function (el) {
            // Highlight in-perp ads in red and other ads in green.

            if (el.innerText.indexOf('In Perpetuity') > 0) {
                el.style.backgroundColor = '#ffc4b8';
            } else {
                el.style.backgroundColor = 'lightgreen';
            }

            // Make the ad licensing more concise (e.g., "0 Years: 0 Months: 5 Weeks" to "5 Weeks")

            const licensingParts = el.innerText.split(" • ");
            if (licensingParts.length === 3) {
                const gvaaBaseLink = 'https://globalvoiceacademy.com/gvaa-rate-guide-2/';
                let gvaaLinkUrl = null;

                const adType = licensingParts[0];
                const adScope = licensingParts[1];
                const duration = licensingParts.pop();
                const durationParts = duration.split(": ");
                const newDurationParts = durationParts.filter(part => !part.trim().startsWith("0"))
                    // e.g., "1 Years" => "1 Year"
                    .map(part => {
                        if (part.startsWith("1 ") && part.endsWith("s")) {
                            return part.slice(0, -1);
                        } else {
                            return part;
                        }
                    });

                el.innerText = licensingParts.join(" • ") + " • " + newDurationParts.join(": ");

                // Link to GVAA Rate Guide (and to the corresponding section, if applicable)

                if (adType === 'Online Ad') {
                    gvaaLinkUrl = gvaaBaseLink + '#webusage';
                } else if (adType === 'Radio Ad') {
                    gvaaLinkUrl = gvaaBaseLink + '#radio';
                } else if (adType === 'Television Ad') {
                    gvaaLinkUrl = gvaaBaseLink + '#tv';
                } else {
                    gvaaLinkUrl = gvaaBaseLink;
                }

                if (gvaaLinkUrl) {
                    const gvaaIconUrl = 'https://raw.githubusercontent.com/jonathankellyva/vdc-helper/main/img/gvaa-icon.png';
                    const gvaaLink = document.createElement('a');
                    const gvaaIcon = document.createElement('img');
                    gvaaLink.href = gvaaLinkUrl;
                    gvaaLink.className = 'gvaa-link';
                    gvaaLink.target = '_blank';
                    gvaaIcon.src = gvaaIconUrl;
                    gvaaIcon.className = 'gvaa-icon';
                    gvaaLink.appendChild(gvaaIcon);
                    el.appendChild(gvaaLink);
                }
            }
        });
})();
