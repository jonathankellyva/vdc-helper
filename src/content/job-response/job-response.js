// Highlight live directed session tags in gold on the response page.

Array.from(document.querySelectorAll('span.tag'))
    .filter(el => el.innerText.startsWith('Live Directed Session')).forEach(ldsTag => {
    ldsTag.classList.add('live-directed-session');
});

// When responding to a job, automatically fill in the max budget for the bid.

let maxBudget = 0;
const jobHighlights = document.querySelector('#job-highlights');
if (jobHighlights) {
    const fields = jobHighlights.querySelectorAll('span');
    const budgetPattern = /(?:\$[0-9,]+ - )?\$([0-9,]+)/;
    fields.forEach(function (field) {
        const text = field.textContent.trim();
        const match = text.match(budgetPattern);
        if (match) {
            maxBudget = match[1].replaceAll(',', '');
        }
    });
}

const quoteField = document.querySelector('input[name="quote"]');
if (quoteField && !quoteField.value) {
    quoteField.value = maxBudget;
    quoteField.dispatchEvent(new Event('keyup'));
}

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

            templateObserver.observe(templateSelector, { childList: true });

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