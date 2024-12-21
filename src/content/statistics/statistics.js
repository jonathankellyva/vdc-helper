// Hide dollar amounts by default.

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

        // Show audition listen/shortlist %s.

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

const observer = new MutationObserver(onStatsUpdated);
const config = {
    childList: true,
    subtree: true,
};
observer.observe(document.body, config);

// Allow filtering Audition History by Listened/Shortlisted.

function allowFilteringAuditionHistory() {
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
}

safeCall(allowFilteringAuditionHistory);

// In Audition History, link to the original job postings rather than to your response.

function linkToJobPostingsFromStatsPage() {
    Array.from(document.querySelectorAll('a'))
        .forEach(replacePreviewResponseLink);
}

safeCall(linkToJobPostingsFromStatsPage);
