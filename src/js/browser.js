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

export function openNewTab(url) {
    chrome.runtime.sendMessage({ action: "openTab", url });
}

export function isSpecialKeyHeld(event) {
    return event.altKey || event.ctrlKey || event.metaKey;
}

export function isSpecialKeyOrShiftHeld(event) {
    return isSpecialKeyHeld(event) || event.shiftKey;
}
