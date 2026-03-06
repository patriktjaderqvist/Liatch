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

export async function fetchMyCompany(accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/companies/me`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        'Kunde inte hämta företagsprofilen.'
    );
}

export async function updateMyCompany(payload, accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/companies/me`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        },
        'Kunde inte uppdatera företagsprofilen.'
    );
}

export async function fetchCompanyByPublicId(publicId) {
    return requestJson(
        `${apiBaseUrl}/api/v1/companies/public/${encodeURIComponent(publicId)}`,
        {
            method: 'GET',
        },
        'Kunde inte hämta företagsprofilen.'
    );
}
