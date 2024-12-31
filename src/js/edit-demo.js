import * as Browser from './browser';
import * as Demos from './demos';

const demo = Browser.safeCall(Demos.fromDocument, document);
if (demo) {
    Demos.store(demo);
}

const submitButton = document.getElementById('submit');
if (submitButton) {
    submitButton.addEventListener('click', function () {
        const updatedDemo = Demos.fromDocument(document);
        if (updatedDemo) {
            Demos.store(updatedDemo);
        }
    });
}
