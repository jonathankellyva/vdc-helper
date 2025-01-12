import * as Jobs from './job-data';
import * as Notifications from './notifications';
import * as Storage from './storage';

const currVersion = chrome.runtime.getManifest().version;

chrome.runtime.onInstalled.addListener(function() {
    Storage.SYNC.get('first-use').then(firstUse => {
        if (!firstUse) {
            Storage.SYNC.set('first-use', Date.now());
        }
    });
    Storage.LOCAL.get('version').then(prevVersion => {
        if (prevVersion !== currVersion) {
            chrome.tabs.create({
                url: "https://github.com/jonathankellyva/vdc-helper/wiki/What's-New",
                active: false
            });
        }
    });

    Storage.LOCAL.set('version', currVersion);
    
    chrome.alarms.create('alarm', { periodInMinutes: 1 });

    Jobs.check();
    Notifications.showNew();
});

(chrome.action || chrome.browserAction).onClicked.addListener(function() {
    chrome.tabs.create({ url: 'https://voices.com' });
});

chrome.alarms.onAlarm.addListener(function(alarm) {
    Jobs.check();
    Notifications.showNew();
});

setInterval(Notifications.showNew, 5000);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openTab" && message.url) {
        chrome.tabs.create({ url: message.url });
        sendResponse({ status: "success" });
    }
});

chrome.notifications.onClicked.addListener(async (uuid) => {
    Notifications.clicked(uuid);
});
