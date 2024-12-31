import * as Browser from './browser';
import * as Budgets from './budgets';
import * as Common from './links';

function getBudgetForJob(jobsListItem) {
    const budgetField = jobsListItem.querySelector('div.jobs-list-price');
    let minBudget = 0;
    let maxBudget = 0;

    if (budgetField) {
        const text = budgetField.textContent.trim();
        const match = text.match(Budgets.BUDGET_REGEX);
        if (match) {
            minBudget = (match[1] || match[2]).replaceAll(',', '');
            maxBudget = match[2].replaceAll(',', '');
        }
    }

    return {
        field: budgetField,
        min: minBudget,
        max: maxBudget,
    };
}

function handleJobAddedToList(mutationsList) {
    mutationsList.forEach(mutation => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'DIV' && node.classList.contains('jobs-list-item')) {
                    // Link to the original job postings rather than to your response.
                    node.querySelectorAll('a').forEach(Common.replacePreviewResponseLink);

                    // Highlight jobs with a low budget (<$100, but someday a configurable amount) in red.
                    Browser.safeCall(Budgets.highlightLowBudgets, Browser.safeCall(getBudgetForJob, node));
                }
            });
        }
    });
}

const observer = new MutationObserver(handleJobAddedToList);
const config = {
    childList: true,
    subtree: true,
};
observer.observe(document.body, config);
