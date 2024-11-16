function loadNotifications() {
    return STORAGE_LOCAL.get('notifications', []);
}

function saveNotifications(notifications) {
    STORAGE_LOCAL.set('notifications', notifications);
}

function createNotification(type, job) {
    return {
        type: type,
        jobId: job.id,
        jobTitle: job.title,
        time: Date.now(),
    }
}

function getPopupNotificationTitle(data) {
    return `${data.jobId}: ${data.jobTitle}`;
}

function getPopupNotificationBody(data) {
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

function getNotificationTarget(data) {
    switch (data.type) {
        case 'newjob':
            return `https://www.voices.com/talent/jobs/posting/${data.jobId}`;
        case 'listen':
        case 'shortlist':
            return `https://www.voices.com/talent/jobs/preview_response/${data.jobId}`;
    }
    return null;
}

function getNotificationIcon(data) {
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

function getNotificationHistoryTitle(data) {
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

function getNotificationHistoryBody(data) {
    return `${data.jobId}: ${data.jobTitle}`;
}

function postNotification(data) {
    loadNotifications().then(notifications => {
        notifications.push(data);
        saveNotifications(notifications);
    })
}

function popUpNotification(data) {
    const title = getPopupNotificationTitle(data);
    const body = getPopupNotificationBody(data);
    const icon = getNotificationIcon(data);
    const target = getNotificationTarget(data);

    if (title && body) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: icon,
            title: title,
            message: body,
        });
    }
    
    data.shown = true;
}

function popUpNewNotifications() {
    loadNotifications().then(notifications => {
        const toShow = notifications.filter(notification => !notification.shown);

        if (toShow.length > 0) {
            toShow.forEach(popUpNotification);
            saveNotifications(notifications);
        }
    });
}
