export function highlightInPerpAds(el) {
    if (el.innerText.indexOf('In Perpetuity') > 0) {
        el.classList.add('in-perp-ad');
    } else {
        el.classList.add('non-perp-ad');
    }
}

export function simplifyLicensingParts(el) {
    const licensingParts = el.innerText.split(" • ");

    if (licensingParts.length === 3) {
        const duration = licensingParts.pop();
        const durationParts = duration.split(": ");
        const newDurationParts = durationParts.filter(part => !part.trim().startsWith("0"))
            // e.g., "1 Years" => "1 Year"
            .map(part => {
                if (part.startsWith("1 ") && part.endsWith("s")) {
                    return part.slice(0, -1);
                } else {
                    return part;
                }
            });

        el.innerText = licensingParts.join(" • ") + " • " + newDurationParts.join(": ");
    }
}

const GVAA_RATE_GUIDE_LINK = 'https://globalvoiceacademy.com/gvaa-rate-guide-2/';

export function addLinkToRateGuide(el) {
    const gvaaIconUrl = chrome.runtime.getURL('img/gvaa-icon.png');
    const gvaaLink = document.createElement('a');
    const gvaaIcon = document.createElement('img');
    gvaaLink.href = GVAA_RATE_GUIDE_LINK;
    gvaaLink.className = 'gvaa-link';
    gvaaLink.target = '_blank';
    gvaaIcon.src = gvaaIconUrl;
    gvaaIcon.className = 'gvaa-icon';
    gvaaLink.appendChild(gvaaIcon);
    el.appendChild(gvaaLink);
}