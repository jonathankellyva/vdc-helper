// Embed YouTube videos directly into the page.

const YOUTUBE_LINK_REGEX = /https:\/\/(?:www\.)?(?:youtube.com\/watch\?v=|youtu\.be\/)([-_a-zA-Z0-9]+)(&.*)?/;

Array.from(document.querySelectorAll('div.overview-section')).forEach(div => {
    Array.from(div.querySelectorAll('a')).forEach(a => {
        const match = a.href.match(YOUTUBE_LINK_REGEX);
        if (match) {
            const videoId = match[1];
            const extraParams = match[2];
            const iframe = document.createElement('iframe');

            iframe.src = `https://www.youtube.com/embed/${videoId}?${extraParams}`;
            iframe.allowFullscreen = true;
            iframe.width = '100%';
            iframe.height = '384px';

            a.parentNode.appendChild(iframe);
        }
    });
});

// Embed supported reference files directly in the page so that you don't have to download them.

Array.from(document.querySelectorAll('.file-details-box')).forEach(file => {
    const filenameField = file.querySelector('.file-details-box-filename');
    if (filenameField) {
        Array.from(file.querySelectorAll('a'))
            .filter(a => a.innerText === 'Download').forEach(downloadLink => {
            const filename = filenameField.innerText;
            const isAudio = filename.endsWith('.mp3') || filename.endsWith('.m4a') || filename.endsWith('.wav');
            const isVideo = filename.endsWith('.mp4');
            const isImage = filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg');

            if (isAudio || isVideo) {
                const player = document.createElement(isAudio ? 'audio' : 'video');
                player.controls = true;
                player.src = downloadLink.href;
                player.style.display = 'block';
                player.style.width = '100%';
                file.appendChild(player);
            }

            if (isImage) {
                const img = document.createElement('img');
                img.src = downloadLink.href;
                img.style.marginTop = '10px';
                file.appendChild(img);
            }
        });
    }
});

// For jobs that you've responded to, display the audition player above the sample script.

const sampleScriptHeader = getSampleScriptHeader();
if (sampleScriptHeader) {
    fetch(`https://www.voices.com/talent/jobs/preview_response/${JOB_ID}`, {
        method: 'GET',
    })
        .then(response => response.text())
        .then(responseText => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(responseText, "text/html");
            const player = doc.getElementById('demo-player');

            if (player) {
                const header = document.createElement('h5');
                header.innerText = 'Your Audition';
                header.style.marginBottom = '5px';

                const yourAuditionContainer = document.createElement('div');
                yourAuditionContainer.className = 'your-audition-container';

                const activityContainer = document.createElement('span');
                activityContainer.className = 'your-audition-activity';

                const source = player.querySelector('source');
                const audio = document.createElement('audio');
                audio.controls = true;
                audio.src = source.getAttribute('data-src');
                audio.className = 'your-audition-player';

                yourAuditionContainer.appendChild(audio);
                yourAuditionContainer.appendChild(activityContainer);

                const listenedIcon = doc.querySelector('.fa-headphones-alt');
                if (listenedIcon) {
                    const listenedActivity = listenedIcon.parentNode.parentNode.parentNode;
                    listenedActivity.classList.remove('margin-top-medium');
                    activityContainer.appendChild(listenedActivity);
                }

                const shortlistedIcon = doc.querySelector('.fa-thumbs-up');
                if (shortlistedIcon) {
                    const shortlistedActivity = shortlistedIcon.parentNode.parentNode.parentNode;
                    shortlistedActivity.classList.remove('margin-top-medium');
                    activityContainer.appendChild(shortlistedActivity);

                    Array.from(shortlistedActivity.querySelectorAll('div'))
                        .filter(el => el.innerText.trim().startsWith('Added to a shortlist')).forEach(el => {
                        el.innerText = ' Shortlisted by the Client ';
                    });
                }

                sampleScriptHeader.parentNode.insertBefore(yourAuditionContainer, sampleScriptHeader);
                sampleScriptHeader.parentNode.insertBefore(header, yourAuditionContainer);
            }
        });
}
