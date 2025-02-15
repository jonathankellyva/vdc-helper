import * as Job from './job';

export const BUDGET_REGEX = /(?:\$([0-9,.]+) - )?\$([0-9,.]+)/;

export function getBudgetFromJobHighlights() {
    let budgetField = null;
    let minBudget = 0;
    let maxBudget = 0;
    const jobHighlights = Job.getJobHighlights();

    if (jobHighlights) {
        const fields = jobHighlights.querySelectorAll('span');
        fields.forEach(function (field) {
            const text = field.textContent.trim();
            const match = text.match(BUDGET_REGEX);
            if (match) {
                budgetField = field;
                minBudget = (match[1] || match[2]).replaceAll(',', '');
                maxBudget = match[2].replaceAll(',', '');
            }
        });

        return {
            field: budgetField,
            min: minBudget,
            max: maxBudget,
        };
    }
}

export function highlightLowBudgets(budget) {
    if (budget && budget.max < 100) {
        budget.field.classList.add('low-budget');
        budget.field.classList.remove('text-dark');
    }
}

export function addPFHToBudgetIfApplicable() {
    const category = Job.getCategory();
    const budget = getBudgetFromJobHighlights();
    const estimatedLengthInHours = Job.getEstimatedLength().totalHours;

    if (estimatedLengthInHours && budget && budget.field && budget.max && (category === 'Audiobooks' || estimatedLengthInHours >= 1/3)) {
        const pfhMin = Math.round(budget.min / estimatedLengthInHours);
        const pfhMax = Math.round(budget.max / estimatedLengthInHours);

        if (pfhMax) {
            const pfhField = document.createElement('div');
            pfhField.className = 'text-xxs';
            pfhField.innerText = pfhMin && pfhMin < pfhMax ? `(\$${pfhMin} - \$${pfhMax} PFH)` : `(\$${pfhMax} PFH)`;
            budget.field.parentNode.insertBefore(pfhField, budget.field.nextSibling);
        }
    }
}
