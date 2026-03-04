import { apiBaseUrl } from './authApi';

async function requestJson(url, options, fallbackMessage) {
    let response;
    try {
        response = await fetch(url, options);
    } catch {
        throw new Error(
            `Kan inte nå backend-API (${apiBaseUrl || 'samma origin'}). Kontrollera att backend körs.`
        );
    }

    let body = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (!response.ok) {
        const detail = body?.detail;
        throw new Error(typeof detail === 'string' ? detail : fallbackMessage);
    }

    return body;
}

export async function createApplication(jobAdId, coverLetter, accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/applications/`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ job_ad_id: jobAdId, cover_letter: coverLetter || null }),
        },
        'Kunde inte skicka ansökan.'
    );
}

export async function fetchMyApplications(accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/applications/mine`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        'Kunde inte hämta dina ansökningar.'
    );
}

export async function withdrawApplication(id, accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/applications/${id}`,
        {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        'Kunde inte återta ansökan.'
    );
}

export async function fetchJobAdApplications(jobAdId, accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/applications/job-ad/${jobAdId}`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        'Kunde inte hämta ansökningarna.'
    );
}

export async function updateApplicationStatus(applicationId, newStatus, accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/applications/${applicationId}/status`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ status: newStatus }),
        },
        'Kunde inte uppdatera statusen.'
    );
}
