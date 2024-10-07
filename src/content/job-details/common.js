function getSampleScriptHeader() {
    const additionalDetails = document.getElementById('additionalDetails');
    return Array.from(additionalDetails.querySelectorAll('h5'))
        .find(el => el.innerText.startsWith('Sample Script'));
}
