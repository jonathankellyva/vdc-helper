const STATUS_REGEX = />([^<]+)</;

function getJobStatus(job) {
    if (job && job.status_button) {
        const match = job.status_button.match(STATUS_REGEX);
        if (match) {
            return match[1];
        }
    }
    return '';
}

function listJobs(jobs, requestData = {}, offset = 0, limit = 100) {
    requestData.custom = {};
    if (!requestData.filter) {
        requestData.filter = {
            by: [
                'show:all',
            ],
        };
    }
    requestData.is_internal = 0;
    if (!requestData.search) {
        requestData.search = {
            query: null,
        };
    }
    if (!requestData.sort) {
        requestData.sort = {
            order: 'desc',
            by: 'posted_date',
        };
    }

    const filteringByListened = requestData.filter.by.includes('show:listened');
    
    fetch(`https://www.voices.com/talent/jobs_pagination?offset=${offset}&limit=${limit}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    })
        .then(response => response.text())
        .then(responseText => {
            try {
                const responseData = JSON.parse(responseText);
                if (responseData.status === 'success' && responseData.data) {
                    responseData.data.entities.forEach(job => {
                        const oldData = jobs[job.id];

                        let listened = filteringByListened;
                        if (!listened && oldData && oldData.listened) {
                            listened = true;
                        }

                        const jobData = {
                            title: job.title,
                            posted_at: job.posted_at,
                            status: getJobStatus(job),
                            answered: job.is_sent === 1,
                            listened: listened,
                            shortlisted: job.is_shortlisted === 1,
                            closed: job.is_closed === 1,
                        };

                        if (oldData) {
                            if (!oldData.listened && jobData.listened) {
                                postNotification(createNotification('listen', job));
                            }
                            if (!oldData.shortlisted && jobData.shortlisted) {
                                postNotification(createNotification('shortlist', job));
                            }
                        } else if (jobData.status === 'Hiring' && !jobData.answered) {
                            postNotification(createNotification('newjob', job));
                        }

                        const keep = job.listened || job.shortlisted || job.answered || !job.closed;
                        if (keep) {
                            jobs[job.id] = jobData;
                        } else {
                            delete jobs[job.id];
                        }
                    });

                    STORAGE_LOCAL.set('jobs', jobs)

                    if (responseData.data.total > offset + limit) {
                        listJobs(jobs, requestData, offset + limit, limit);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        });
}

function listHiringJobs(savedJobData) {
    const requestData = {
        filter: {
            by: [
                'status:open',
                'show:all',
            ],
        }
    }
    listJobs(savedJobData, requestData);
}

function listAnsweredJobs(savedJobData, listened) {
    const requestData = {
        filter: {
            by: [
                'status:answered',
                'show:' + (listened ? 'listened' : 'all'),
            ],
        }
    }
    listJobs(savedJobData, requestData);
}

const MEMBER_ID_PATTERN = /(?:'currentMemberId': |member_id&quot;:)(\d+)/;

function getMemberId() {
    return fetch('https://www.voices.com/talent/account', {
        method: 'GET',
    })
        .then(response => response.text())
        .then(responseText => {
            const match = responseText.match(MEMBER_ID_PATTERN);
            return match ? match[1] : null;
        });
}

function checkJobs() {
    getMemberId().then(memberId => {
        if (memberId) {
            console.log(`Logged in as ${memberId}; checking for jobs`);
            STORAGE_LOCAL.get('jobs', {}).then(savedJobData => {
                listAnsweredJobs(savedJobData, true);
                listHiringJobs(savedJobData);
                listAnsweredJobs(savedJobData);
            });
        } else {
            console.log('Not logged in');
        }
    });
}