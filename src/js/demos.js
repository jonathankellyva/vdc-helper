import * as Storage from './storage';

const ONE_HOUR_IN_MILLIS = 60 * 60 * 1000;

export function fromDocument(doc) {
    const demo = {};
    
    const title = doc.getElementById('title');
    if (title) {
        demo.title = title.value;
    }

    const canonicalLink = doc.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
        const href = canonicalLink.getAttribute('href');
        demo.id = parseInt(href.split('/').pop());
    }

    const categoryElement = doc.querySelector('input[name="category_id"]:checked');
    if (categoryElement) {
        const categoryLabel = doc.querySelector(`label[for="${categoryElement.id}"]`);
        if (categoryLabel) {
            demo.category = categoryLabel.innerText;
        }
    }

    const languageElement = doc.querySelector('select[name="language_id"]');
    if (languageElement && languageElement.selectedOptions) {
        demo.language = languageElement.selectedOptions[0].innerText;
    }

    const accentsElement = doc.getElementById('demo-accents');
    if (accentsElement) {
        demo.accents = Array.from(accentsElement.selectedOptions).map(opt => opt.innerText);
    }

    const stylesElement = doc.getElementById('demo-styles');
    if (stylesElement) {
        demo.styles = Array.from(stylesElement.selectedOptions).map(opt => opt.innerText);
    }

    const rolesElement = doc.getElementById('demo-roles');
    if (rolesElement) {
        demo.roles = Array.from(rolesElement.selectedOptions).map(opt => opt.innerText);
    }

    const ageElement = doc.querySelector('input[name="voice_age_id"]:checked');
    if (ageElement) {
        const ageLabel = doc.querySelector(`label[for="${ageElement.id}"]`);
        if (ageLabel) {
            demo.age = ageLabel.innerText;
        }
    }

    demo.lastChecked = Date.now();

    return demo;
}

export async function fromStorage(demoId) {
    return Storage.LOCAL.get(`demo-${demoId}`);
}

export async function store(demo) {
    Storage.LOCAL.set(`demo-${demo.id}`, demo);
}

async function getDemo(demoId) {
    const demo = await fromStorage(demoId);
    if (demo && Date.now() - demo.lastChecked < ONE_HOUR_IN_MILLIS) {
        return demo;
    }

    return await fetch(`https://www.voices.com/talent/demos/edit/${demoId}`, {
            method: 'GET',
        })
            .then(response => response.text())
            .then(responseText => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(responseText, "text/html");
                const demo = fromDocument(doc);
                store(demo);
                return demo;
            });
}

export async function getAll(criteria) {
    const responseText = await fetch('https://www.voices.com/talent/demos').then(response => response.text());
    const parser = new DOMParser();
    const doc = parser.parseFromString(responseText, "text/html");
    const demoIds = Array.from(doc.querySelectorAll('a'))
        .filter(a => a.href.includes('/talent/demos/edit/')).map(a => a.href.split('/').pop());
    const demos = await Promise.all(demoIds.map(getDemo));

    sortByMatch(demos, criteria);
    return demos;
}

function getAccentGroup(accent) {
    return accent.replace(/ \(.+/, '');
}

export function accentsMatch(a, b) {
    if (!a || !b || a === b || a === 'No Preference' || b === 'No Preference') {
        return true;
    }
    if (a.indexOf('GenAm') > 0 && b.indexOf('GenAm') > 0) {
        return true;
    }
    if (a.indexOf('Any') > 0 || b.indexOf('Any') > 0) {
        return getAccentGroup(a) === getAccentGroup(b);
    }
    return false;
}

export function demoMatchesAccent(demo, accent) {
    return demo.accents.find(demoAccent => accentsMatch(demoAccent, accent));
}

function calculatePotentialVoiceMatchScore(demo, criteria) {
    let score = 100;

    if (demo.category !== criteria.category) score -= 10;
    if (demo.language !== criteria.language) score -= 10;
    if (demo.age !== criteria.age) score -= 10;
    if (!demoMatchesAccent(demo, criteria.accent)) score -= 10;
    if (criteria.role && !demo.roles.includes(criteria.role)) score -= 10;

    criteria.styles.forEach(style => {
        if (!demo.styles.includes(style)) score -= 10;
    });

    return score < 0 ? 0 : score;
}

function sortByMatch(demos, criteria) {
    demos.forEach(demo => demo.score = calculatePotentialVoiceMatchScore(demo, criteria));
    return demos.sort((a, b) => {
        const diff = b.score - a.score;
        if (diff !== 0) {
            return diff;
        }
        if (a.category === criteria.category && b.category !== criteria.category) {
            return -1;
        } else if (b.category === criteria.category && a.category !== criteria.category) {
            return 1;
        }
        if (criteria.age) {
            if (a.age === criteria.age && b.age !== criteria.age) {
                return -1;
            } else if (b.age === criteria.age && a.age !== criteria.age) {
                return 1;
            }
        }
        return 0;
    });
}
