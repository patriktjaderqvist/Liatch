function getFallbackApiBaseUrl() {
    if (typeof window === "undefined") {
        return "http://localhost:8000";
    }

    const hostname = window.location.hostname;
    const isLocalhost =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]";

    if (isLocalhost) {
        return "http://localhost:8000";
    }

    // In non-local environments, default to same-origin.
    return "";
}

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? getFallbackApiBaseUrl();

export const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");

const accountTypeToUserType = {
    Student: "student",
    "Företag": "company",
    Skola: "school",
};

const userTypeToRole = {
    student: "privatperson",
    company: "foretag",
    school: "skola",
};

function extractApiErrorMessage(responseBody, fallbackMessage) {
    if (!responseBody) {
        return fallbackMessage;
    }
    if (typeof responseBody.detail === "string") {
        return responseBody.detail;
    }
    return fallbackMessage;
}

async function requestJson(url, options, fallbackMessage) {
    let response;
    try {
        response = await fetch(url, options);
    } catch {
        throw new Error(
            `Kan inte nå backend-API (${apiBaseUrl || "samma origin"}). Kontrollera att backend körs och att VITE_API_BASE_URL är korrekt.`
        );
    }
    let body = null;

    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (!response.ok) {
        throw new Error(extractApiErrorMessage(body, fallbackMessage));
    }

    return body;
}

function splitDisplayName(displayName) {
    const cleaned = displayName.trim().replace(/\s+/g, " ");
    if (!cleaned) {
        return { firstName: null, lastName: null };
    }

    const parts = cleaned.split(" ");
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: null };
    }

    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
    };
}

export function mapAccountTypeToUserType(accountType) {
    return accountTypeToUserType[accountType] || "student";
}

export function mapUserTypeToRole(userType) {
    return userTypeToRole[userType] || null;
}

export function createRegisterPayload({ accountType, displayName, email, password }) {
    const userType = mapAccountTypeToUserType(accountType);
    const { firstName, lastName } = splitDisplayName(displayName);

    return {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
    };
}

export async function registerUser(payload) {
    return requestJson(
        `${apiBaseUrl}/api/v1/auth/user/create`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        },
        "Kunde inte skapa konto."
    );
}

export async function loginUser(email, password) {
    const form = new URLSearchParams({
        username: email,
        password,
    });

    return requestJson(
        `${apiBaseUrl}/api/v1/auth/token`,
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: form,
        },
        "Kunde inte logga in."
    );
}

export async function fetchCurrentUser(accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/auth/me`,
        {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        "Kunde inte hämta användaren."
    );
}

export async function logoutUser(accessToken) {
    return requestJson(
        `${apiBaseUrl}/api/v1/auth/logout`,
        {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        "Kunde inte logga ut."
    );
}

export function persistSession(accessToken, userType) {
    localStorage.setItem("accessToken", accessToken);

    const role = mapUserTypeToRole(userType);
    if (role) {
        localStorage.setItem("userRole", role);
    } else {
        localStorage.removeItem("userRole");
    }

    window.dispatchEvent(new Event("userRoleChanged"));
}

export function clearSession() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    window.dispatchEvent(new Event("userRoleChanged"));
}
