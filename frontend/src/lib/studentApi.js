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

export async function fetchMyStudent(accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/students/me`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        'Kunde inte hämta studentprofilen.'
    );
}

export async function updateMyStudent(payload, accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/students/me`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        },
        'Kunde inte uppdatera studentinfo.'
    );
}

export async function updateMyProfile(payload, accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/students/me/profile`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        },
        'Kunde inte uppdatera profilen.'
    );
}

export async function fetchStudent(studentId, accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/students/${studentId}`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        'Kunde inte hämta studentprofilen.'
    );
}
