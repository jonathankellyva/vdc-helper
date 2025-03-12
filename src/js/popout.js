let jobId = null;

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'popOutSampleScript') {
        if (!jobId) {
            jobId = message.jobId;
        } else if (jobId !== message.jobId) {
            return;
        }
        document.title = message.jobTitle;
        document.body.innerHTML = message.content;

        const contentHeight = document.body.scrollHeight + 40;
        const currentWindowHeight = window.innerHeight;

        if (contentHeight > currentWindowHeight) {
            chrome.windows.getCurrent(function(win) {
                chrome.runtime.sendMessage({
                    action: 'resizeWindow',
                    windowId: win.id,
                    height: contentHeight
                });
            });
        }
    }
});

window.addEventListener('beforeunload', () => {
    window.close();
});

window.setTimeout(() => {
    if (!jobId) {
        window.close();
    }
}, 2000);
