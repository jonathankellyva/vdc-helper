// ==UserScript==
// @name         Voices.com Helper
// @namespace    http://jskva.com/
// @version      2024-08-31
// @description  Several improvements to the Voices.com website
// @author       Jonathan Kelly <jskva@jskva.com>
// @match        https://www.voices.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=voices.com
// @downloadURL  https://jskva.com/vdc-helper.user.js
// @updateURL    https://jskva.com/vdc-helper.user.js
// @grant        none
// ==/UserScript==

/*

FEATURES

* Allow editing Sample Scripts by clicking on them.
  Note that edits are not currently saved across page loads. (I might add this eventually.)
  On Mac, hold Command and click on the script.
  On Windows, hold the Windows key and click on the script.
  On mobile, long press on the script.
  To restore the previous text, reload the page. (I might add a button for this eventually.)

* When responding to a job, automatically fill in the max budget for the bid.

* On the Answered Jobs page and in the Audition History of the Statistics page,
  link to the job posting rather than your response.
  Personally, I usually want to view the job posting rather than my response anyway,
  so I figured I might as well link to that by default.

* Hide dollar amounts on the Statistics page by default.
  Click on the dollar amount to show it.
  This could be helpful when sharing your screen.

UPCOMING FEATURE IDEAS:

* Automatically show %s on Statistics page (e.g., listen %, shortlist %).
* Link to appropriate section of GVAA Rate Guide from Job Highlights panel,
  or maybe even calculate recommended GVAA rate range based on licensing details.
* Highlight certain things in red (e.g., in-perp ads).
* Collapse/hide Performance Details sections that just contain "N/A" in order to save space.
* Popup notifications when you receive a new invitation/listen/shortlist/booking.
* Show number of business days until Project Deadlines.
* Move Client Details somewhere higher on the Job Details page.
* Hide "Managed Services Paymnt Policy" block on the top of Job Details page
  because it takes up a lot of vertical space and is kinda unnecessary.
* On Statistics page, allow filtering Audition History by Listened/Shortlisted.
* On Statistics page, allow sorting the Demo History table by each different column.

*/

(function() {
    'use strict';

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

            textarea.addEventListener('blur', () => {
                const newP = document.createElement('p');
                newP.innerText = textarea.value;
                newP.style.font = textarea.style.font;

                textarea.parentNode.replaceChild(newP, textarea);
            });
        }
    }

    if (window.location.pathname.startsWith('/talent/jobs/posting')) {
        document.addEventListener('click', documentClick);
        document.addEventListener('touchstart', startLongPress);
        document.addEventListener('touchend', cancelLongPress);
        document.addEventListener('touchcancel', cancelLongPress);
        document.addEventListener('touchmove', cancelLongPress);
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

    // Hide dollar amounts on the Statistics page by default.

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

    function hideDollarAmounts(mutationsList, observer) {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                const el = mutation.target;
                if (el.tagName === 'SPAN' && el.classList.contains('stat-figure') && el.innerText.startsWith('$') && el.getAttribute('mask') != 'false') {
                    hideDollarAmount(el)
                }
            }
        });
    }

    if (window.location.pathname.startsWith('/talent/statistics')) {
        Array.from(document.querySelectorAll('.stat-figure'))
            .filter(el => el.innerText.startsWith('$'))
            .forEach(hideDollarAmount);

        const observer = new MutationObserver(hideDollarAmounts);
        const config = {
            childList: true,
            subtree: true,
        };
        observer.observe(document.body, config);
    }
})();

