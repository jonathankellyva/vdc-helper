import * as Demos from './demos'

const submitButton = document.getElementById('submit');
if (submitButton) {
    submitButton.addEventListener('click', function () {
        const newDemo = Demos.fromDocument(document);
        if (newDemo) {
            Demos.store(newDemo);
        }
    });
}
