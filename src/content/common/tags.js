// Highlight in-perp ads in red and other ads in green.

function highlightInPerpAds(el) {
    if (el.innerText.indexOf('In Perpetuity') > 0) {
        el.classList.add('in-perp-ad');
    } else {
        el.classList.add('non-perp-ad');
    }
}

// Make the ad licensing more concise (e.g., "0 Years: 0 Months: 5 Weeks" to "5 Weeks")

function simplifyLicensingParts(el) {
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

// Link to GVAA Rate Guide

const GVAA_RATE_GUIDE_LINK = 'https://globalvoiceacademy.com/gvaa-rate-guide-2/';

function addLinkToRateGuide(el) {
    const gvaaIconUrl = chrome.runtime.getURL('src/img/gvaa-icon.png');
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

Array.from(document.querySelectorAll('span.tag'))
    .filter(el => el.innerText.indexOf(' Ad ') > 0)
    .forEach(function (el) {
        safeCall(highlightInPerpAds, el);
        safeCall(simplifyLicensingParts, el);
        safeCall(addLinkToRateGuide, el);
    });
