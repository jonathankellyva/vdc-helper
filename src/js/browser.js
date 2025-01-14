export const IS_MAC = navigator.platform.toLowerCase().indexOf('mac') >= 0;
export const SPECIAL_KEY = IS_MAC ? 'command' : 'control';

export function safeCall(func, ...args) {
    try {
        return func(...args);
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

export function openNewTab(url, active = true) {
    if (chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs.length > 0 ? tabs[0] : null;

            chrome.tabs.create({
                url: url,
                active: active,
                index: activeTab ? activeTab.index + 1 : 0
            });
        });
    } else {
        // The current context is not the background worker; send an async message to the background
        // worker, which will call this function again but will follow the above branch.
        chrome.runtime.sendMessage({ action: 'openNewTab', url: url, active: active });
    }
}

export function isSpecialKeyHeld(event) {
    return event.altKey || event.ctrlKey || event.metaKey;
}

export function isSpecialKeyOrShiftHeld(event) {
    return isSpecialKeyHeld(event) || event.shiftKey;
}
