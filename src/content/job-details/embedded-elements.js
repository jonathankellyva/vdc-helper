// Embed YouTube videos directly into the page.

function parseTimeToSeconds(time) {
    if (!time) return null;
    const match = time.match(/(\d+)([hms])/g); // Match segments like "1h", "30m", "45s"
    if (!match) {
        // Assume it's already in seconds
        return parseInt(time, 10);
    }

    let seconds = 0;
    match.forEach(part => {
        const unit = part.slice(-1); // Last character (h, m, or s)
        const value = parseInt(part.slice(0, -1), 10); // Number before the unit
        if (unit === "h") seconds += value * 3600;
        if (unit === "m") seconds += value * 60;
        if (unit === "s") seconds += value;
    });
    return seconds;
}

Array.from(document.querySelectorAll('div.overview-section')).forEach(div => {
    Array.from(div.querySelectorAll('a')).forEach(a => {
        try {
            const url = new URL(a.href);
            const params = new URLSearchParams(url.search);

            if (url.host.endsWith('youtube.com') || url.host.endsWith('youtu.be')) {
                const videoId = params.get('v') || url.pathname.split("/").pop();
                const startSecs = parseTimeToSeconds(params.get('t'));
                const videoEmbedURL = `https://www.youtube.com/embed/${videoId}` + (startSecs ? `?start=${startSecs}` : '');
                const iframe = document.createElement('iframe');

                iframe.src = videoEmbedURL;
                iframe.allowFullscreen = true;
                iframe.width = '100%';
                iframe.height = '384px';

                a.parentNode.appendChild(iframe);
            }
        } catch (e) {}
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
