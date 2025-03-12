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

export async function getWindow(winId) {
    return new Promise((resolve) => {
        if (!winId) {
            resolve(null);
        } else {
            return chrome.windows.get(winId, { populate: true }, (win) => {
                resolve(chrome.runtime.lastError ? null : win);
            });
        }
    });
}

export function openNewWindow(windowSpec) {
    if (typeof browser !== 'undefined' && browser.windows) {
        // Firefox
        return browser.windows.create(windowSpec);
    } else if (chrome.windows) {
        // Chrome
        return chrome.windows.create(windowSpec);
    } else {
        console.error('could not open window');
    }
}

export function openNewTab(url, active = true) {
    if (typeof browser !== 'undefined' && browser.tabs) {
        // Firefox
        browser.tabs.create({ url: url, active: active });
    } else if (chrome.tabs) {
        // Chrome
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

export function copyToClipboardAndNotify(text, notificationText, event) {
    navigator.clipboard.writeText(text).then(() => {
        const notification = document.createElement('div');
        notification.textContent = notificationText;
        notification.className = 'clipboard-notification';
        notification.style.left = event.pageX + 'px';
        notification.style.top = event.pageY + 'px';
        document.body.appendChild(notification);

        window.setTimeout(function () {
            notification.style.opacity = '0%';
        }, 1500);

        window.setTimeout(function () {
            notification.remove();
        }, 2000);
    });
}
