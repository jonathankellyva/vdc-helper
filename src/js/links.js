function removeHtmlTags(input) {
    return input.replace(/<\/?(?:em|strong)>/g, '');
}

export function replaceLinks(el) {
    const urlPattern = /\b((?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|gov|edu|io|co|dev|us|uk|ca|au|de|fr|jp|ru|cn|be|tv)(?:\/(?:[^\s<]|<\/?(?:em|strong)>)*)?(?:\?(?:[^\s<]|<\/?(?:em|strong)>)*)?(?:#(?:[^\s<]|<\/?(?:em|strong)>)*)?)\b/g;
    el.innerHTML = el.innerHTML.replace(urlPattern, function (match, url) {
        const cleanedUrl = removeHtmlTags(url);
        const href = cleanedUrl.indexOf("://") > 0 ? cleanedUrl : 'https://' + cleanedUrl;
        try {
            // Some things might look like a URL, according to the rudimentary regex above,
            // but we confirm here that it is in fact a valid URL.
            new URL(href);
            return `<a href="${href}" target="_blank">${cleanedUrl}</a>`;
        } catch (_) {
        }

        // don't actually replace with a link if it wasn't a valid URL
        return match;
    });
}

const PREVIEW_RESPONSE_URL_REGEX = /\/talent\/jobs\/preview_response\/(\d+)$/;

export function replacePreviewResponseLink(link) {
    const href = link.getAttribute('href');
    const match = href && href.match(PREVIEW_RESPONSE_URL_REGEX);
    if (match) {
        link.setAttribute('href', `/talent/jobs/posting/${match[1]}`);
    }
}

