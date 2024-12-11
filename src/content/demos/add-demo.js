const submitButton = document.getElementById('submit');
if (submitButton) {
    submitButton.addEventListener('click', function (event) {
        const newDemo = getDemoFromDocument(document);
        if (newDemo) {
            storeDemo(newDemo);
        }
    });
}
