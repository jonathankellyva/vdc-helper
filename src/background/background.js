importScripts('../shared/storage.js');

const currVersion = chrome.runtime.getManifest().version;

chrome.runtime.onInstalled.addListener(function() {
    STORAGE_SYNC.get('first-use').then(firstUse => {
        if (!firstUse) {
            STORAGE_SYNC.set('first-use', Date.now());
        }
    });
    STORAGE_SYNC.get('version').then(prevVersion => {
        if (prevVersion !== currVersion) {
            chrome.tabs.create({
                url: "https://github.com/jonathankellyva/vdc-helper/wiki/What's-New",
                active: false
            });
        }
    });

    STORAGE_SYNC.set('version', currVersion);
});

(chrome.action || chrome.browserAction).onClicked.addListener(function() {
    chrome.tabs.create({ url: 'https://voices.com' });
});
