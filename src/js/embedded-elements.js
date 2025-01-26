import * as Browser from './browser';
import * as Job from './job';
import * as SampleScript from './sample-script';

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

function parseYouTubeLink(a) {
    try {
        const url = new URL(a.href);

        if (url.host.endsWith('youtube.com') || url.host.endsWith('youtu.be')) {
            return {
                url: url,
                params: new URLSearchParams(url.search),
            };
        }
    } catch (e) {
    }

    return undefined;
}

export function embedYouTubeVideos() {
    Array.from(document.querySelectorAll('div.overview-section')).forEach(div => {
        Array.from(div.querySelectorAll('a')).forEach(a => {
            const ytLink = parseYouTubeLink(a);
            if (ytLink) {
                const videoId = ytLink.params.get('v') || ytLink.url.pathname.split("/").pop();
                const startSecs = parseTimeToSeconds(ytLink.params.get('t'));
                const videoEmbedURL = `https://www.youtube.com/embed/${videoId}` + (startSecs ? `?start=${startSecs}` : '');
                const iframe = document.createElement('iframe');

                iframe.src = videoEmbedURL;
                iframe.allowFullscreen = true;
                iframe.width = '100%';
                iframe.height = '384px';

                a.parentNode.appendChild(iframe);
            }
        });
    });
}

function embedReferenceFile(file, filename, downloadLink) {
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
}

export function embedReferenceFiles() {
    Array.from(document.querySelectorAll('.file-details-box')).forEach(file => {
        const filenameField = file.querySelector('.file-details-box-filename');
        if (filenameField) {
            Array.from(file.querySelectorAll('a'))
                .filter(a => a.innerText === 'Download').forEach(downloadLink => {
                    const filename = filenameField.innerText;
                    Browser.safeCall(embedReferenceFile, file, filename, downloadLink);
            });
        }
    });
}

function addViewLink(file, filename, linksContainer, downloadLink) {
    const isDocx = filename.endsWith('.docx');
    const isPdf = filename.endsWith('.pdf');
    
    if (isDocx || isPdf) {
        const viewLink = document.createElement('a');
        const separator = document.createTextNode(' | ');

        viewLink.href = 'about:blank';
        viewLink.target = '_blank';
        viewLink.innerText = 'View';
        viewLink.addEventListener('click', function (event) {
            fetch(downloadLink.href).then(response => {
                const s3DownloadUrl = response.url;
                Browser.openNewTab(`https://docs.google.com/viewer?url=${encodeURIComponent(s3DownloadUrl)}`);
            }).catch(e => {
                console.error(e);
                window.alert("Sorry, but we weren't able to open the document in a new tab. Please try the Download link instead.");
            });
            event.preventDefault();
        });

        linksContainer.insertBefore(separator, downloadLink);
        linksContainer.insertBefore(viewLink, separator);
    }
}

export function addViewLinkForReferenceFiles() {
    Array.from(document.querySelectorAll('.file-details-box')).forEach(file => {
        const filenameField = file.querySelector('.file-details-box-filename');
        const linksContainer = file.querySelector('.file-details-box-links');
        if (filenameField && linksContainer) {
            const existingViewLink = Array.from(file.querySelectorAll('a')).find(a => a.innerText === 'View');
            if (!existingViewLink) {
                Array.from(file.querySelectorAll('a'))
                    .filter(a => a.innerText === 'Download').forEach(downloadLink => {
                    const filename = filenameField.innerText;
                    Browser.safeCall(addViewLink, file, filename, linksContainer, downloadLink);
                });
            }
        }
    });
}

export function displayAuditionPlayer() {
    const sampleScriptHeader = SampleScript.getHeader();
    if (sampleScriptHeader) {
        fetch(`https://www.voices.com/talent/jobs/preview_response/${Job.JOB_ID}`, {
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
}
