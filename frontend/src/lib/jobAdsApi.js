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

export async function fetchJobAds() {
    return requestJson(
        `${apiBaseUrl}/api/v1/job-ads/`,
        { method: 'GET' },
        'Kunde inte hämta annonser.'
    );
}

export async function fetchMyJobAds(accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/job-ads/mine`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        'Kunde inte hämta dina annonser.'
    );
}

export async function fetchJobAd(id) {
    return requestJson(
        `${apiBaseUrl}/api/v1/job-ads/${id}`,
        { method: 'GET' },
        'Kunde inte hämta annonsen.'
    );
}

export async function createJobAd(payload, accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/job-ads/`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        },
        'Kunde inte skapa annonsen.'
    );
}

export async function updateJobAd(id, payload, accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/job-ads/${id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        },
        'Kunde inte uppdatera annonsen.'
    );
}

export async function deleteJobAd(id, accessToken) {
    let response;
    try {
        response = await fetch(`${apiBaseUrl}/api/v1/job-ads/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    } catch {
        throw new Error('Kan inte nå backend-API. Kontrollera att backend körs.');
    }

    if (!response.ok) {
        let body = null;
        try {
            body = await response.json();
        } catch {
            body = null;
        }
        const detail = body?.detail;
        throw new Error(typeof detail === 'string' ? detail : 'Kunde inte ta bort annonsen.');
    }
}
