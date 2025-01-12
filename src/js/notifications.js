import * as Storage from './storage';

export function load() {
    return Storage.LOCAL.get('notifications', []);
}

export function save(notifications) {
    Storage.LOCAL.set('notifications', notifications);
}

export function create(type, job) {
    return {
        uuid: crypto.randomUUID(),
        type: type,
        jobId: job.id,
        jobTitle: job.title,
        time: Date.now(),
    }
}

function getPopupTitle(data) {
    return `${data.jobId}: ${data.jobTitle}`;
}

function getPopupBody(data) {
    switch (data.type) {
        case 'newjob':
            return 'You have received a new job invitation';
        case 'listen':
            return 'The client listened to your audition!';
        case 'shortlist':
            return 'Your audition was shortlisted!';
    }
    return null;
}

export function getTarget(data) {
    switch (data.type) {
        case 'newjob':
            return `https://www.voices.com/talent/jobs/posting/${data.jobId}`;
        case 'listen':
        case 'shortlist':
            return `https://www.voices.com/talent/jobs/preview_response/${data.jobId}`;
    }
    return null;
}

export function getIcon(data) {
    switch (data.type) {
        case 'newjob':
            return 'https://raw.githubusercontent.com/jonathankellyva/vdc-helper/main/src/img/briefcase.png';
        case 'listen':
            return 'https://raw.githubusercontent.com/jonathankellyva/vdc-helper/main/src/img/headphones.png';
        case 'shortlist':
            return 'https://raw.githubusercontent.com/jonathankellyva/vdc-helper/main/src/img/thumbs-up.png';
    }
    return null;
}

export function getHistoryTitle(data) {
    switch (data.type) {
        case 'newjob':
            return 'New Job Invitation';
        case 'listen':
            return 'New Listen!';
        case 'shortlist':
            return 'New Shortlist!';
    }
    return null;
}

export function getHistoryBody(data) {
    return `${data.jobId}: ${data.jobTitle}`;
}

export function post(data) {
    load().then(notifications => {
        notifications.push(data);
        save(notifications);
    })
}

function popUp(data) {
    const title = getPopupTitle(data);
    const body = getPopupBody(data);
    const icon = getIcon(data);

    if (title && body) {
        chrome.notifications.create(data.uuid, {
            type: 'basic',
            iconUrl: icon,
            title: title,
            message: body,
        });
    }
    
    data.shown = true;
}

export function showNew() {
    load().then(notifications => {
        const toShow = notifications.filter(notification => !notification.shown);

        if (toShow.length > 0) {
            toShow.forEach(popUp);
            save(notifications);
        }
    });
}

export async function clicked(uuid, newTab) {
    const notifications = await load();
    const data = notifications.find(notification => notification.uuid === uuid);

    if (data) {
        const target = getTarget(data);
        if (target) {
            chrome.tabs.create({ url: target });
        }
        data.read = true;
        save(notifications);
        chrome.notifications.clear(uuid);
    }
}
