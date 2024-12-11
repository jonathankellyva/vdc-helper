const demo = safeCall(getDemoFromDocument, document);
if (demo) {
    storeDemo(demo);
}

const submitButton = document.getElementById('submit');
if (submitButton) {
    submitButton.addEventListener('click', function (event) {
        const updatedDemo = getDemoFromDocument(document);
        if (updatedDemo) {
            storeDemo(updatedDemo);
        }
    });
}
