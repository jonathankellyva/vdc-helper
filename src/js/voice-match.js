import * as Demos from './demos';
import * as Job from './job';

function getOrCreateVoiceMatchAnalysisModal() {
    let voiceMatchModal = document.getElementById('voice-match-modal');

    if (!voiceMatchModal) {
        const clientDetailsModal = document.getElementById('client-details-modal');

        voiceMatchModal = clientDetailsModal.cloneNode(true);
        voiceMatchModal.id = 'voice-match-modal';
        voiceMatchModal.style.display = 'none';
        voiceMatchModal.setAttribute('aria-labelledby', 'voice-match-modal-title');
        voiceMatchModal.setAttribute('aria-hidden', 'true');

        const header = voiceMatchModal.querySelector('.modal-header');
        const title = header.querySelector('span');
        const body = voiceMatchModal.querySelector('.modal-body');

        title.id = 'voice-match-analysis-modal-title';
        title.innerText = 'VoiceMatch Analysis';
        body.replaceChildren();
        clientDetailsModal.parentElement.appendChild(voiceMatchModal);
    }

    return voiceMatchModal;
}

function getPerformanceDetailsTags(fieldName) {
    const heading = Array.from(document.querySelectorAll('h5')).find(h => {
        return h.innerText.trim() === fieldName;
    });
    if (heading) {
        return Array.from(heading.parentNode.querySelectorAll('span.tag'));
    }
    return [];
}

function getPerformanceDetailsTagValues(fieldName) {
    return getPerformanceDetailsTags(fieldName).map(tag => tag.innerText.trim());
}

export async function analyze() {
    const voiceMatch = Job.getVoiceMatch();
    if (voiceMatch && voiceMatch.value < 100) {
        const voiceMatchModal = getOrCreateVoiceMatchAnalysisModal();

        const tags = {
            category: {
                elements: [ Job.getCategoryTag() ],
                values: [ Job.getCategory() ],
                demoFieldName: 'category',
                description: 'category',
            },
            language: {
                elements: getPerformanceDetailsTags('Language'),
                values: getPerformanceDetailsTagValues('Language'),
                demoFieldName: 'language',
                description: 'language',
            },
            age: {
                elements: getPerformanceDetailsTags('Voice Age'),
                values: getPerformanceDetailsTagValues('Voice Age'),
                demoFieldName: 'age',
                description: 'voice age',
            },
            accent: {
                elements: getPerformanceDetailsTags('Accent'),
                values: getPerformanceDetailsTagValues('Accent'),
                demoFieldName: 'accents',
                description: 'accent',
            },
            role: {
                elements: getPerformanceDetailsTags('Role'),
                values: getPerformanceDetailsTagValues('Role'),
                demoFieldName: 'roles',
                description: 'role',
            },
            style: {
                elements: getPerformanceDetailsTags('Style'),
                values: getPerformanceDetailsTagValues('Style'),
                demoFieldName: 'styles',
                description: 'style',
            },
        };

        const criteria = {
            category: tags.category.values?.[0],
            language: tags.language.values?.[0],
            age: tags.age.values?.[0],
            accent: tags.accent.values?.[0],
            role: tags.role.values?.[0],
            styles: tags.style.values,
        };

        const demos = await Demos.getAll(criteria);
        
        const hideLanguage = demos.every(demo => demo.language === tags.language.values?.[0]);

        function displayVoiceMatchAnalysis() {
            const body = voiceMatchModal.querySelector('.modal-body');
            const info = document.createElement('p');
            const addNewDemoLink = document.createElement('a');
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const tbody = document.createElement('tbody');
            
            info.className = 'text-xs';
            info.innerHTML = demos.length ? '<p>This table shows all of the attributes for each of your demos and how'
                + ' they match up with the corresponding attributes for this job invitation. Your demos are sorted'
                + ' by how closely they match the current job invitation.</p><p>This can help you determine which'
                + ' attributes you might need to add to one or more of your demos, or which new demos you might need'
                + ' to add.</p>'
                : '<p>You do not currently have any demos (or the Voices.com Helper was unable to retrieve them).'
                + ' Without any demos, your VoiceMatch for every job invitation will be very low.</p>';

            addNewDemoLink.href = 'https://www.voices.com/talent/demos/add';
            addNewDemoLink.target = '_blank';
            addNewDemoLink.innerText = 'Add a New Demo';

            ['Title', 'Category', 'Language', 'Voice Age', 'Accent', 'Role', 'Style']
                    .filter(heading => !hideLanguage || heading !== 'Language')
                    .forEach(heading => {
                const th = document.createElement('th');
                th.innerText = heading;
                headerRow.appendChild(th);
            });

            if (demos.length) {
                thead.appendChild(headerRow);
                table.replaceChildren(thead, tbody);

                function createDemoTitleCell(demo) {
                    const td = document.createElement('td');
                    td.className = 'title-cell';

                    const link = document.createElement('a');
                    link.href = `https://www.voices.com/talent/demos/edit/${demo.id}`;
                    link.target = '_blank';
                    link.innerText = demo.title;
                    td.appendChild(link);

                    return td;
                }

                function addTag(cell, text, matches = false, extraClassNames = '', title = undefined) {
                    const span = document.createElement('span');
                    span.className = 'tag' + (matches ? ' matching-tag' : '') + ' ' + extraClassNames;
                    if (title) span.title = title.replace(' Click for more details.', '');
                    span.innerText = text;
                    cell.appendChild(span);
                }

                const thisJobRow = document.createElement('tr');
                const thisJobCell = document.createElement('td');
                const thisJobSpan = document.createElement('span');
                thisJobSpan.innerText = Job.JOB_TITLE + ' (This Job)';
                thisJobCell.className = 'title-cell';
                thisJobCell.appendChild(thisJobSpan);
                thisJobRow.appendChild(thisJobCell);

                Object.values(tags).forEach(tag => {
                    if (!hideLanguage || tag.description !== 'language') {
                        const cell = document.createElement('td');
                        if (!tag.elements.length) {
                            addTag(cell, 'N/A');
                        }
                        for (let i = 0; i < tag.elements.length; i++) {
                            const element = tag.elements[i];
                            const value = tag.values[i];
                            const extraClassName = Array.from(element.classList).find(className => className.indexOf('-demo') > 0);
                            addTag(cell, value, !extraClassName, extraClassName, element.title);
                        }
                        thisJobRow.appendChild(cell);
                    }
                });

                tbody.appendChild(thisJobRow);

                const separatorRow = document.createElement('tr');
                const separatorCell = document.createElement('td');
                const separator = document.createElement('hr');

                separatorCell.colSpan = 7;
                separatorCell.appendChild(separator);
                separatorRow.appendChild(separatorCell);
                tbody.appendChild(separatorRow);

                demos.forEach(demo => {
                    const row = document.createElement('tr');

                    const titleCell = createDemoTitleCell(demo);
                    const categoryCell = document.createElement('td');
                    const languageCell = document.createElement('td');
                    const ageCell = document.createElement('td');
                    const accentsCell = document.createElement('td');
                    const rolesCell = document.createElement('td');
                    const stylesCell = document.createElement('td');

                    addTag(categoryCell, demo.category, tags.category.values.includes(demo.category));
                    if (!hideLanguage) {
                        addTag(languageCell, demo.language, tags.language.values.includes(demo.language));
                    }
                    addTag(ageCell, demo.age, tags.age.values.includes(demo.age));

                    demo.accents.forEach(accent => {
                        addTag(accentsCell, accent, Demos.accentsMatch(accent, tags.accent.values?.[0]));
                    });

                    demo.roles.forEach(role => {
                        addTag(rolesCell, role, tags.role.values.includes(role));
                    });

                    demo.styles.forEach(style => {
                        addTag(stylesCell, style, tags.style.values.includes(style));
                    });

                    row.appendChild(titleCell);
                    row.appendChild(categoryCell);
                    if (!hideLanguage) row.appendChild(languageCell);
                    row.appendChild(ageCell);
                    row.appendChild(accentsCell);
                    row.appendChild(rolesCell);
                    row.appendChild(stylesCell);

                    tbody.appendChild(row);
                });
            } else {
                voiceMatchModal.classList.add('no-demos');
            }

            table.className = 'voice-match-analysis-demos-table';

            body.replaceChildren(info, addNewDemoLink, table);
        }

        function makeClickable(el) {
            el.setAttribute('data-bs-toggle', 'modal');
            el.setAttribute('data-bs-target', '#voice-match-modal');
            el.addEventListener('click', displayVoiceMatchAnalysis);
        }

        voiceMatch.field.title = demos.length ? 'Click for help with improving your VoiceMatch.'
            : 'You have a low VoiceMatch score because you have not yet added any demos.';
        voiceMatch.field.classList.add('imperfect-voicematch');
        voiceMatch.field.classList.remove('text-dark');
        makeClickable(voiceMatch.field);

        if (demos.length) {
            const closestMatchingDemo = demos[0];

            Object.values(tags).forEach(tag => {
                tag.elements.forEach(el => {
                    const tagValue = el.innerText.trim();
                    const matchingDemo = demos.find(demo => {
                        const demoTagValues = demo[tag.demoFieldName];
                        if (tag.description === 'accent') {
                            return Demos.demoMatchesAccent(demo, tagValue);
                        }
                        return demoTagValues && demoTagValues.includes(tagValue);
                    });
                    if (!matchingDemo) {
                        const className = (tag.description === 'category' ? 'category' : 'tag') + '-with-missing-demo';
                        el.classList.add(className);
                        el.classList.remove('text-dark');
                        el.title = `You don't currently have any demos for this ${tag.description}.`;
                        makeClickable(el);
                    } else {
                        const demoTagValues = closestMatchingDemo[tag.demoFieldName];
                        if (!demoTagValues.includes(tagValue) && (tag.description !== 'accent' || !Demos.demoMatchesAccent(closestMatchingDemo, tagValue))) {
                            const className = (tag.description === 'category' ? 'category' : 'tag') + '-mismatches-closest-demo';
                            el.classList.add(className);
                            el.classList.remove('text-dark');
                            if (tag.description === 'role' || tag.description === 'style' || tag.description === 'accent') {
                                el.title = `Your closest matching demo is missing this ${tag.description}. Click for more details.`;
                            } else {
                                el.title = `Your closest matching demo is for a different ${tag.description}. Click for more details.`;
                            }
                            makeClickable(el);
                        }
                    }
                });
            });
        }
    }
}
