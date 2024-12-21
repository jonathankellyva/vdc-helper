function getCategoryFromResponsePage() {
    let category = getCategory();

    Array.from(document.querySelectorAll('p')).forEach(el => {
        if (el.innerText === 'Category') {
            const categorySpan = el.parentNode.querySelector('span.text-dark');
            if (categorySpan) {
                category = categorySpan.innerText.trim();
            }
        }
    });
    
    return category;
}

const category = safeCall(getCategoryFromResponsePage);

const earningsField = document.querySelector('input[name="earnings"]');
const quoteField = document.querySelector('input[name="quote"]');
const budget = safeCall(getBudgetFromJobHighlights);

// Highlight live directed session tags in gold on the response page.

function highlightLiveDirectedSessionOnResponsePage() {
    Array.from(document.querySelectorAll('span.tag'))
        .filter(el => el.innerText.startsWith('Live Directed Session')).forEach(ldsTag => {
        ldsTag.classList.add('live-directed-session');
    });
}

safeCall(highlightLiveDirectedSessionOnResponsePage);

// Highlight jobs with a low budget (<$100, but someday a configurable amount) in red.

safeCall(highlightLowBudgets, budget);

// For audiobooks, display PFH rates next to Job Budget, Your Earnings, and Your Quote fields.

function displayAudiobookRatesOnResponsePage() {
    const estimatedLengthInHours = getEstimatedLength().totalHours;
    if (category === 'Audiobooks' && earningsField && quoteField && budget && budget.max && estimatedLengthInHours) {
        function updateQuotePFH() {
            Array('earnings', 'quote').forEach(prefix => {
                const inputField = prefix === 'earnings' ? earningsField : quoteField;

                let pfhField = document.getElementById(`${prefix}-pfh`);
                if (!pfhField) {
                    const inputGroup = document.getElementById(`${prefix}-input-group`);
                    if (inputGroup) {
                        pfhField = document.createElement('div');
                        pfhField.id = `${prefix}-pfh`;
                        pfhField.className = 'text-grey2 text-sm margin-top-small margin-left-smallest';
                        inputGroup.parentNode.appendChild(pfhField);
                    }
                }

                let pfhValue = 0;
                if (inputField.value) {
                    pfhValue = Math.round(inputField.value / estimatedLengthInHours);
                }

                if (pfhField) {
                    if (pfhValue) {
                        pfhField.innerText = `(\$${pfhValue} PFH)`;
                        pfhField.style.display = 'block';
                    } else {
                        pfhField.style.display = 'none';
                    }
                }
            });
        }

        earningsField.addEventListener('input', updateQuotePFH);
        quoteField.addEventListener('input', updateQuotePFH);
        window.setInterval(updateQuotePFH, 250);
    }

    safeCall(addPFHToBudgetIfApplicable);
}

safeCall(displayAudiobookRatesOnResponsePage);

// When responding to a job, automatically fill in the max budget for the bid.

function fillInMaxBudget() {
    if (earningsField && !earningsField.value && quoteField && !quoteField.value && budget) {
        quoteField.value = budget.max;
        quoteField.dispatchEvent(new Event('keyup'));
    }
}

safeCall(fillInMaxBudget);

// Allow selecting a response template that should be automatically filled in by default.

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

function selectDefaultResponseTemplate() {
    STORAGE_SYNC.get('default-template-id')
        .then(defaultTemplateId => {
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
                    STORAGE_SYNC.set('default-template-id', event.target.checked ? selectedTemplateId : null);
                });

                templateChoicesDropdown.parentNode.appendChild(defaultTemplateCheckbox);
                templateChoicesDropdown.parentNode.appendChild(defaultTemplateCheckboxLabel);

                const onTemplateSelected = (mutationsList, observer) => {
                    mutationsList.forEach(mutation => {
                        if (mutation.type === 'childList') {
                            mutation.addedNodes.forEach(node => {
                                selectedTemplateId = node.getAttribute('data-value');

                                const templateSelected = (selectedTemplateId || '') !== '';

                                STORAGE_SYNC.get('default-template-id').then(defaultTemplateId => {
                                    defaultTemplateCheckbox.checked = selectedTemplateId === defaultTemplateId;
                                });

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

                templateObserver.observe(templateSelector, {childList: true});

                if (defaultTemplateId && notes && revisionPolicy && notes.value === '') {
                    fetch(`https://www.voices.com/talent/jobs/member_template/${defaultTemplateId}`, {
                        method: 'GET',
                    })
                        .then(response => response.text())
                        .then(responseText => {
                            const responseData = JSON.parse(responseText);
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
                        });
                }
            }
        });
}

safeCall(selectDefaultResponseTemplate);
