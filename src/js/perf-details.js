export function hideEmptyPerfDetailsSections() {
    Array.from(document.querySelectorAll('h5')).forEach(hideSectionIfEmpty);
}

function hideSectionIfEmpty(header) {
    if (header) {
        const wrapper = header.parentElement.id === 'reference-file-wrapper'
            ? header.parentElement : undefined;
        const wrapperOrHeader = wrapper ? wrapper : header;
        const contents = header.nextElementSibling;
        const separator = wrapperOrHeader.previousElementSibling?.tagName === 'HR'
            ? wrapperOrHeader.previousElementSibling : undefined;
        if (contents?.innerText.trim() === 'N/A') {
            // Hide any preceding <hr> tab
            if (separator) {
                separator.style.display = 'none';
            }

            header.style.display = 'none';
            contents.style.display = 'none';
        }
    }
}
