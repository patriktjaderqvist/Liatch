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

export async function fetchRecommendedJobAds(accessToken, limit = 6) {
    return requestJson(
        `${apiBaseUrl}/api/v1/recommendations/me/job-ads?limit=${encodeURIComponent(limit)}`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        'Kunde inte hämta rekommenderade annonser.'
    );
}

export async function fetchRecommendedStudentsForJobAd(jobAdId, accessToken, limit = 6) {
    return requestJson(
        `${apiBaseUrl}/api/v1/recommendations/job-ads/${jobAdId}/students?limit=${encodeURIComponent(limit)}`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        'Kunde inte hämta rekommenderade profiler.'
    );
}
