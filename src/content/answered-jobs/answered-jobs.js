// Link to the original job postings rather than to your response.

Array.from(document.querySelectorAll('a'))
    .forEach(replacePreviewResponseLink);

const observer = new MutationObserver(replacePreviewResponseLinks);
const config = {
    childList: true,
    subtree: true,
};
observer.observe(document.body, config);
