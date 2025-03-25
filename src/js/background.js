import * as Browser from './browser';
import * as Jobs from './job-data';
import * as Notifications from './notifications';
import * as Storage from './storage';

const currVersion = chrome.runtime.getManifest().version;

const CHECK_JOBS = false;

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

    if (CHECK_JOBS) {
        Jobs.check();
    }
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

let popOuts = {};
Browser.safeCall(loadPrevPopouts);

async function loadPrevPopouts() {
    popOuts = await Storage.LOCAL.get('popOuts', {});
    Browser.safeCall(closePopOuts);
}

function closePopOuts() {
    Object.values(popOuts).forEach(async (winId) => {
        const win = await Browser.getWindow(winId);
        if (win) {
            Browser.safeCall(chrome.windows.remove, winId);
        }
    });
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'openNewTab' && message.url) {
        Browser.openNewTab(message.url, message.active);
        sendResponse({ status: 'success' });
    } else if (message.action === 'popOutSampleScript') {
        let win = await Browser.getWindow(popOuts[message.jobId]);

        if (!win && !message.updateOnly) {
            delete popOuts[message.jobId];
            win = await Browser.openNewWindow({
                url: chrome.runtime.getURL('html/popout.html'),
                type: 'popup',
                width: 400,
                height: 300
            });
            popOuts[message.jobId] = win.id;
            Storage.LOCAL.set('popOuts', popOuts);

            const tabId = win.tabs[0].id;

            // Wait for the tab to finish loading before sending the message
            chrome.tabs.onUpdated.addListener(function tabUpdated(updatedTabId, changeInfo) {
                if (updatedTabId === tabId && changeInfo.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(tabUpdated);

                    chrome.tabs.sendMessage(tabId, {
                        action: 'popOutSampleScript',
                        jobId: message.jobId,
                        jobTitle: message.jobTitle,
                        content: message.content
                    });
                }
            });
        }

        if (!message.updateOnly && win) {
            chrome.windows.update(win.id, { focused: true });
        }
    } else if (message.action === 'resizeWindow') {
        chrome.windows.update(message.windowId, { height: message.height });
    }
});

chrome.notifications.onClicked.addListener(async (uuid) => {
    Notifications.clicked(uuid);
});

chrome.runtime.onSuspend.addListener(() => {
    Browser.safeCall(closePopOuts);
});
