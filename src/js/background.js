import * as Browser from './browser';
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
            Browser.openNewTab("https://github.com/jonathankellyva/vdc-helper/wiki/What's-New", false);
        }
    });

    Storage.LOCAL.set('version', currVersion);
    
    chrome.alarms.create('alarm', { periodInMinutes: 1 });

    Jobs.check();
    Notifications.showNew();
});

(chrome.action || chrome.browserAction).onClicked.addListener(function() {
    Browser.openNewTab('https://voices.com' );
});

chrome.alarms.onAlarm.addListener(function(alarm) {
    Jobs.check();
    Notifications.showNew();
});

setInterval(Notifications.showNew, 5000);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openNewTab' && message.url) {
        Browser.openNewTab(message.url, message.active);
        sendResponse({ status: 'success' });
    }
});

chrome.notifications.onClicked.addListener(async (uuid) => {
    Notifications.clicked(uuid);
});
