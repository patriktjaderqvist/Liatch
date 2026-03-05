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

export async function fetchMySchoolStudents(accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/schools/me/students`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        'Kunde inte hämta skolans studenter.'
    );
}

export async function linkStudentByPublicId(studentPublicId, accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/schools/me/students/link`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ student_public_id: studentPublicId }),
        },
        'Kunde inte koppla studenten till skolan.'
    );
}
