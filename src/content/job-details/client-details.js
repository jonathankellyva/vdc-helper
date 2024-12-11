// Move Client Details to a single, compact line at the top of the page under the job title/ID.

const clientDetailsContainer = document.querySelector('.client-details-container');
if (jobHeader && clientDetailsContainer) {
    const clientDetails = clientDetailsContainer.querySelector('.d-flex');
    if (clientDetails) {
        const newClientDetailsContainer = document.createElement('a');

        newClientDetailsContainer.className = 'client-details-container font-medium text-sm';
        newClientDetailsContainer.style.display = 'block';
        newClientDetailsContainer.setAttribute('data-bs-toggle', 'modal');
        newClientDetailsContainer.setAttribute('data-bs-target', '#client-details-modal');

        const clientPhoto = clientDetails.querySelector('.circle-avatar-container');
        if (clientPhoto) {
            clientPhoto.style.display = 'inline-flex';
            clientPhoto.style.verticalAlign = 'middle';
            clientPhoto.style.marginRight = '5px';
            newClientDetailsContainer.appendChild(clientPhoto);
        }
        
        const voicesManagedJobIcon = clientDetails.querySelector('.voices-fsj-icon-container');
        if (voicesManagedJobIcon) {
            voicesManagedJobIcon.style.display = 'inline-flex';
            voicesManagedJobIcon.style.verticalAlign = 'middle';
            voicesManagedJobIcon.style.marginRight = '5px';
            newClientDetailsContainer.appendChild(voicesManagedJobIcon);
        }

        const clientName = clientDetails.querySelector('.client-name');
        if (clientName) {
            newClientDetailsContainer.appendChild(clientName);
        }

        const clientRating = clientDetails.querySelector('.job-details-rating');
        if (clientRating) {
            const clientReviews = clientRating.parentNode.querySelector('span');

            newClientDetailsContainer.appendChild(clientRating);
            if (clientReviews) {
                newClientDetailsContainer.appendChild(clientReviews);
            }
        }

        const clientLocation = clientDetails.querySelector('.location');
        if (clientLocation) {
            const clientLocationIcon = clientLocation.querySelector('i');
            const clientLocationText = clientLocation.querySelector('span');
            if (clientLocationIcon) {
                clientLocationIcon.classList.add('muted-text');
                clientLocationIcon.style.marginLeft = '5px';
                newClientDetailsContainer.appendChild(clientLocationIcon);
            }
            if (clientLocationText) {
                clientLocationText.innerText = abbreviateLocation(clientLocationText.innerText);
                clientLocationText.style.marginLeft = '5px';
                newClientDetailsContainer.appendChild(clientLocationText);
            }
        }

        if (newClientDetailsContainer.children) {
            jobHeader.appendChild(newClientDetailsContainer);
            Array.from(document.querySelectorAll('.client-details-container')).forEach(el => {
                if (el !== newClientDetailsContainer) {
                    el.style.display = 'none';
                }
            });
        }
    }
}
