// ==UserScript==
// @name         Voices.com Helper
// @namespace    http://jskva.com/
// @version      2024-09-06
// @description  Several improvements to the Voices.com website
// @author       Jonathan Kelly <jskva@jskva.com>
// @match        https://www.voices.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=voices.com
// @downloadURL  https://jskva.com/scripts/vdc-helper.user.js
// @updateURL    https://jskva.com/scripts/vdc-helper.user.js
// @grant        none
// ==/UserScript==

/*

FEATURES

--- Job Details Page ---

* Clicking on the Job Title copies the Job ID and Title to the clipboard.
  e.g., "12345 - Awesome Job". This can be useful when naming a project in your DAW.

* Move Client Details to a single, compact line at the top of the page under the job title.
  This is nicer than having to scroll all the way to the bottom just to see how many
  reviews the client has, where they're from, etc.

* Hide "Managed Services Payment Policy" block on the top of Job Details page.
  Instead, add an icon next to job ID at top of the page.

* Hide Performance Details sections that just say "N/A" anyway.

* Allow editing Sample Scripts by clicking on them.
  Note that edits are not currently saved across page loads. (I might add this eventually.)
  On Mac, hold Command and click on the script.
  On Windows, hold the Windows key and click on the script.
  On mobile, long press on the script.
  To restore the previous text, reload the page. (I might add a button for this eventually.)

* Automatically expand Sample Script rather than requiring you to click Read More.

* In the Performance Details sections, turn URLs into actual links so that you can click them.
  The links are usually to things like the company's website or YouTube/Vimeo references or
  things like that, so it's helpful to be able to click them instead of having to copy-paste
  them into the address bar of a new tab.  Note that these links will open in a new tab.

* In Licensing Details, highlight in-perp ads in red.

--- Job Response Editor ---

* Automatically fill in the max budget for the bid.

--- Statistics Page ---

* Automatically show listen % and shortlist %.

* Hide dollar amounts on the Statistics page by default.
  Click on the dollar amount to show it.
  This could be helpful when sharing your screen.

* Allow filtering Audition History by Listened/Shortlisted.

--- Other ---

* On the Answered Jobs page and in the Audition History of the Statistics page,
  link to the job posting rather than your response.
  Personally, I usually want to view the job posting rather than my response anyway,
  so I figured I might as well link to that by default.

UPCOMING FEATURE IDEAS:

* Link to appropriate section of GVAA Rate Guide from Job Highlights panel,
  or maybe even calculate recommended GVAA rate range based on licensing details.
* Popup notifications when you receive a new invitation/listen/shortlist/booking.
* Show number of business days until Project Deadlines.
* On Statistics page, allow sorting the Demo History table by each different column.

*/

(function() {
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
    `;
    document.head.appendChild(style);

    // Allow editing Sample Scripts by clicking on them.

    const LONG_PRESS_DURATION = 500; // only for mobile

    let pressTimeout;

    function adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    function documentClick(event) {
        if (event.metaKey) {
            makeEditable(event.target);
        }
    }

    function startLongPress(event) {
        pressTimeout = setTimeout(() => handleLongPress(event), LONG_PRESS_DURATION);
    }

    function cancelLongPress(event) {
        clearTimeout(pressTimeout);
    }

    function handleLongPress(event) {
        makeEditable(event.target);
    }

    function makeEditable(target) {
        if (target.tagName === 'P' && target.classList.contains('readmore-content')) {
            const originalText = target.innerText;
            const textarea = document.createElement('textarea');

            textarea.value = originalText;
            textarea.style.width = target.offsetWidth + 'px';
            textarea.style.height = target.offsetHeight + 'px';
            textarea.style.font = window.getComputedStyle(target).font;

            target.parentNode.replaceChild(textarea, target);

            adjustTextareaHeight(textarea);
            textarea.addEventListener('input', () => adjustTextareaHeight(textarea));

            textarea.focus();

            function finishEditing() {
                const newP = document.createElement('p');
                newP.innerText = textarea.value;
                newP.className = target.className;

                textarea.parentNode.replaceChild(newP, textarea);
                replaceLinks(newP);
            }

            function onKeyPress(event) {
                if (event.charCode == 13 && (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)) {
                    finishEditing();
                }
            }

            textarea.addEventListener('blur', finishEditing);
            textarea.addEventListener('keypress', onKeyPress);
        }
    }

    function replaceLinks(el) {
        const urlPattern = /((?:https?:\/\/)?(www\.)?[-a-zA-Z0-9.]{1,256}\.[a-zA-Z0-9]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*[a-zA-Z0-9_#])?)/gi;
        el.innerHTML = el.innerHTML.replace(urlPattern, function(match, url) {
            const href = url.indexOf("://") > 0 ? url : 'https://' + url;
            return `<a href="${href}" target="_blank">${url}</a>`;
        });
    }

    if (window.location.pathname.startsWith('/talent/jobs/posting')) {
        const jobHeader = document.querySelector('.job-header');

        document.addEventListener('click', documentClick);
        document.addEventListener('touchstart', startLongPress);
        document.addEventListener('touchend', cancelLongPress);
        document.addEventListener('touchcancel', cancelLongPress);
        document.addEventListener('touchmove', cancelLongPress);

        // Clicking on the Job Title copies the Job ID and Title to the clipboard.

        const jobTitleElement = jobHeader.querySelector('h1');
        const jobIdElement = jobHeader.querySelector('span');
        if (jobTitleElement && jobIdElement) {
            function copyJobIdAndTitleToClipboard() {
                const jobTitle = jobTitleElement.innerText;
                const jobIdPattern = /#(\d+)/;
                const match = jobIdElement.innerText.match(jobIdPattern);
                if (match) {
                    const jobId = match[1];
                    navigator.clipboard.writeText(`${jobId} - ${jobTitle}`);
                }
            }

            jobTitleElement.style.cursor = 'pointer';
            jobTitleElement.addEventListener('click', copyJobIdAndTitleToClipboard);
        }

        // Highlight in-perp ads in red.

        Array.from(document.querySelectorAll('span.tag'))
            .filter(el => el.innerText.indexOf(' Ad ') > 0 && el.innerText.indexOf('In Perpetuity') > 0).forEach(function(el) {
            el.style.backgroundColor = '#ffc4b8';
        });

        // Hide Performance Details sections that just say "N/A" anyway.

        Array.from(document.querySelectorAll('h5'))
            .filter(el => el.innerText == 'Other Project Requirements'
                    || el.innerText == 'Reference Link').forEach(function(el) {
            if (el.nextElementSibling.innerText.trim() == 'N/A') {
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
            .filter(el => el.innerText.trim() == 'N/A').length > 0;
            if (noReferenceFiles) {
                // Hide the preceding <hr> tab
                referenceFileWrapper.previousElementSibling.style.display = 'none';
                // Hide the empty Reference Files section
                referenceFileWrapper.style.display = 'none';
            }
        }

        // Automatically expand Sample Script rather than requiring you to click Read More.

        Array.from(document.querySelectorAll('a.readmore-btn')).forEach(btn => btn.click());

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
                    voicesManagedIconSpan.setAttribute('data-original-title', 'Job was posted by Voices Managed Services');
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

        // Move Client Details to a single, compact line at the top of the page under the job title.

        const clientDetailsContainer = document.querySelector('.client-details-container');
        if (jobHeader && clientDetailsContainer) {
            const clientDetails = clientDetailsContainer.querySelector('.d-flex');
            if (clientDetails) {
                const newClientDetailsContainer = document.createElement('a');

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
                const clientReviews = clientRating.parentNode.querySelector('span');
                if (clientRating != null) {
                    newClientDetailsContainer.appendChild(clientRating);
                }
                if (clientReviews != null) {
                    newClientDetailsContainer.appendChild(clientReviews);
                }

                const clientLocation = clientDetails.querySelector('.location');
                if (clientLocation) {
                    const clientLocationIcon = clientLocation.querySelector('i');
                    const clientLocationText = clientLocation.querySelector('span');
                    if (clientLocationIcon != null) {
                        clientLocationIcon.classList.add('muted-text');
                        clientLocationIcon.style.marginLeft = '5px';
                        newClientDetailsContainer.appendChild(clientLocationIcon);
                    }
                    if (clientLocationText != null) {
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
    }

    // When responding to a job, automatically fill in the max budget for the bid.

    if (window.location.pathname.startsWith('/talent/jobs/response')) {
        window.addEventListener('load', function() {
            let maxBudget = 0;
            const jobHighlights = document.querySelector('#job-highlights');
            if (jobHighlights) {
                let fields = jobHighlights.querySelectorAll('span');
                let budgetPattern = /(?:\$\d+ - )?\$(\d+)/;
                fields.forEach(function(field) {
                    let text = field.textContent.trim();
                    let match = text.match(budgetPattern);
                    if (match) {
                        maxBudget = match[1];
                    }
                });
            }

            let quoteField = document.querySelector('input[name="quote"]');
            if (quoteField && !quoteField.value) {
                let quote = 0;
                quoteField.value = maxBudget;
                quoteField.dispatchEvent(new Event('keyup'));
            }
        });
    }

    // Link to the original job postings rather than to your response.

    function replacePreviewResponseLink(link) {
        const href = link.getAttribute('href');
        const match = href && href.match(/\/talent\/jobs\/preview_response\/(\d+)/);
        if (match) {
            link.setAttribute('href', `/talent/jobs/posting/${match[1]}`);
        }
    }

    function replacePreviewResponseLinks(mutationsList, observer) {
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
        if (amount != REDACTED_TEXT) {
            el.setAttribute('mask', 'true');
            el.innerText = REDACTED_TEXT;
            el.addEventListener('click', () => {
                el.setAttribute('mask', 'false');
                el.innerText = amount;
            });
        }
    }

    function onStatsUpdated(mutationsList, observer) {
        let auditionsSubmitted = 0;
        let auditionListens = 0;
        let auditionListenPercentField = document.getElementById('audition-listen-percent');
        let auditionsShortlisted = 0;
        let auditionShortlistPercentField = document.getElementById('audition-shortlist-percent');
        let updatePercents = false;

        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                const el = mutation.target;
                if (el.tagName === 'SPAN' && el.classList.contains('stat-figure')
                    && el.innerText.startsWith('$')
                    && el.getAttribute('mask') != 'false') {
                    hideDollarAmount(el)
                }
            }

            const dataStatFigure = mutation.target.getAttribute('data-stat-figure');

            if (dataStatFigure == 'auditions_submitted') {
                auditionsSubmitted = parseInt(mutation.target.innerText);
                updatePercents = true;
            } else if (dataStatFigure == 'audition_listens') {
                const auditionListensField = mutation.target;
                auditionListens = parseInt(auditionListensField.innerText);
                if (!auditionListenPercentField) {
                    auditionListenPercentField = document.createElement('span');
                    auditionListenPercentField.id = 'audition-listen-percent';
                    auditionListensField.insertAdjacentElement('afterend', auditionListenPercentField);
                }
                updatePercents = true;
            } else if (dataStatFigure == 'auditions_shortlisted') {
                const auditionsShortlistedField = mutation.target;
                auditionsShortlisted = parseInt(auditionsShortlistedField.innerText);
                if (!auditionShortlistPercentField) {
                    auditionShortlistPercentField = document.createElement('span');
                    auditionShortlistPercentField.id = 'audition-shortlist-percent';
                    auditionsShortlistedField.insertAdjacentElement('afterend', auditionShortlistPercentField);
                }
                updatePercents = true;
            }
        });

        if (updatePercents) {
            let auditionListenPercent = 0;
            let auditionShortlistPercent = 0;

            if (auditionsSubmitted > 0) {
                if (auditionListens > 0) {
                    auditionListenPercent = (100 * auditionListens / auditionsSubmitted).toFixed(1);
                }

                if (auditionsShortlisted > 0) {
                    auditionShortlistPercent = (100 * auditionsShortlisted / auditionsSubmitted).toFixed(1);
                }
            }

            auditionListenPercentField.innerHTML = auditionListenPercent > 0 ? ' (' + auditionListenPercent + '%)' : '';
            auditionShortlistPercentField.innerHTML = auditionShortlistPercent > 0 ? ' (' + auditionShortlistPercent + '%)' : '';
        }
    }

    let auditionHistory = null;
    let filterAuditionsBy = 'none';

    function changeAuditionFilter(mode) {
        if (filterAuditionsBy == mode) {
            filterAuditionsBy = 'none';
        } else {
            filterAuditionsBy = mode;
        }
        if (auditionHistory) {
            Array.from(auditionHistory.querySelectorAll('div.table-row')).forEach(function(row) {
                if (filterAuditionsBy == 'none') {
                    row.style.display = 'block';
                } else {
                    const label = filterAuditionsBy == 'Listened' ? 'Listened To' : 'Shortlisted';
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
            .filter(h2 => h2.innerHTML == 'Audition History').forEach(function(auditionHistoryHeader) {
            auditionHistory = auditionHistoryHeader.closest('.stats-container');
        });

        if (auditionHistory) {
            Array.from(auditionHistory.querySelectorAll('div'))
                .filter(div => div.innerHTML == 'Listened' || div.innerHTML == 'Shortlisted').forEach(function(div) {
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
})();
