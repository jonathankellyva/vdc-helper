// ==UserScript==
// @name         Voices.com Helper
// @namespace    http://jskva.com/
// @version      2024-08-30
// @description  Several improvements to the Voices.com website
// @author       Jonathan Kelly <jskva@jskva.com>
// @match        https://www.voices.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=voices.com
// @downloadURL  https://jskva.com/vdc-helper.user.js
// @updateURL    https://jskva.com/vdc-helper.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Allow editing Sample Scripts by clicking on them.
    // Note that edits are not currently saved across page loads. (might be added eventually)
    //
    // On Mac, hold Command and click.
    // On Windows, hold the Windows key and click.
    // On mobile, long press.

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
        if (target.tagName === 'P') {
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

    if (window.location.pathname.startsWith("/talent/jobs/posting")) {
        document.addEventListener('click', documentClick);
        document.addEventListener('touchstart', startLongPress);
        document.addEventListener('touchend', cancelLongPress);
        document.addEventListener('touchcancel', cancelLongPress);
        document.addEventListener('touchmove', cancelLongPress);
    }

    // Hide dollar amounts on the Statistics page by default.
    // Click on the dollar amount to show it.

    // Coming soon for the Stats page:
    // - Automatically show %s (e.g., shortlist %)

    const REDACTED_TEXT = "(click to show)";

    function hideDollarAmount(el) {
        const amount = el.innerText
        if (amount != REDACTED_TEXT) {
            el.setAttribute("mask", "true");
            el.innerText = REDACTED_TEXT;
            el.addEventListener('click', () => {
                el.setAttribute("mask", "false");
                el.innerText = amount;
            });
        }
    }

    function hideDollarAmounts(mutationsList, observer) {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                const el = mutation.target;
                if (el.tagName === 'SPAN' && el.classList.contains('stat-figure') && el.innerText.startsWith("$") && el.getAttribute("mask") != "false") {
                    hideDollarAmount(el)
                }
            }
        });
    }

    if (window.location.pathname.startsWith("/talent/statistics")) {
        Array.from(document.querySelectorAll('.stat-figure'))
            .filter(el => el.innerText.startsWith("$"))
            .forEach(hideDollarAmount);

        const observer = new MutationObserver(hideDollarAmounts);
        const config = {
            childList: true,
            subtree: true,
        };
        observer.observe(document.body, config);
    }

    // When responding to a job, automatically bid using the max budget.

    if (window.location.pathname.startsWith("/talent/jobs/response")) {
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

    // On the Answered Jobs page, link to the job posting rather than your response.
    // TODO: Also do this on the Audition History on the Statistics page

    function replacePreviewResponseLinks(mutationsList, observer) {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'DIV' && node.classList.contains('jobs-list-item')) {
                        node.querySelectorAll('a').forEach(link => {
                            const href = link.getAttribute('href');
                            const match = href && href.match(/\/talent\/jobs\/preview_response\/(\d+)/);
                            if (match) {
                                link.setAttribute('href', `/talent/jobs/posting/${match[1]}`);
                            }
                        });
                    }
                });
            }
        });
    }

    if (window.location.pathname.startsWith("/talent/jobs/answered")) {
        const observer = new MutationObserver(replacePreviewResponseLinks);
        const config = {
            childList: true,
            subtree: true,
        };
        observer.observe(document.body, config);
    }
})();


