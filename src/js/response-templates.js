export async function getTemplate(id, token) {
    const requestData = {
        '_token' : token
    };
    const response = await fetch(`https://www.voices.com/talent/jobs/member_template/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    });
    const responseData = await response.json();
    if (responseData.status === 'success' && responseData.data) {
        return responseData.data;
    }
    return {};
}
