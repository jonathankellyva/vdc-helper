export function replaceLinks(el) {
    const urlPattern = /((?:https?:\/\/)?(www\.)?[-a-zA-Z0-9.]{1,256}\.[a-zA-Z][a-zA-Z0-9]{1,5}\b([-a-zA-Z0-9()@:%_+.~#?&/=;]*[a-zA-Z0-9_#])?)/gi;
    el.innerHTML = el.innerHTML.replace(urlPattern, function (match, url) {
        const href = url.indexOf("://") > 0 ? url : 'https://' + url;
        try {
            // Some things might look like a URL, according to the rudimentary regex above,
            // but we confirm here that it is in fact a valid URL.
            // One thing in particular that we don't want to match (but that still matches the
            // above regex) is something like "foo...bar".
            if (!new URL(href).hostname.includes('..')) {
                return `<a href="${href}" target="_blank">${url}</a>`;
            }
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

