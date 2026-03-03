const PORTAL_THEME_STORAGE_KEY = 'portalTheme';

const ROLE_TO_THEME = {
    privatperson: 'student',
    foretag: 'company',
    skola: 'school',
};

const ACCOUNT_TYPE_TO_THEME = {
    Student: 'student',
    'Företag': 'company',
    Skola: 'school',
};

const THEME_TO_ACCOUNT_TYPE = {
    student: 'Student',
    company: 'Företag',
    school: 'Skola',
};

function isValidTheme(theme) {
    return theme === 'student' || theme === 'company' || theme === 'school';
}

export function applyPortalTheme(theme) {
    if (typeof document === 'undefined') {
        return;
    }

    if (!isValidTheme(theme)) {
        document.documentElement.removeAttribute('data-portal');
        return;
    }

    document.documentElement.setAttribute('data-portal', theme);
}

export function getStoredPortalTheme() {
    if (typeof window === 'undefined') {
        return null;
    }

    const theme = window.localStorage.getItem(PORTAL_THEME_STORAGE_KEY);
    return isValidTheme(theme) ? theme : null;
}

export function setStoredPortalTheme(theme) {
    if (typeof window === 'undefined' || !isValidTheme(theme)) {
        return;
    }

    window.localStorage.setItem(PORTAL_THEME_STORAGE_KEY, theme);
    applyPortalTheme(theme);
    window.dispatchEvent(new Event('portalThemeChanged'));
}

export function setPortalThemeFromRole(role) {
    const theme = ROLE_TO_THEME[role];
    if (theme) {
        setStoredPortalTheme(theme);
    }
}

export function setPortalThemeFromAccountType(accountType) {
    const theme = ACCOUNT_TYPE_TO_THEME[accountType];
    if (theme) {
        setStoredPortalTheme(theme);
    }
}

export function getAccountTypeFromStoredPortalTheme() {
    const storedTheme = getStoredPortalTheme();
    return THEME_TO_ACCOUNT_TYPE[storedTheme] || 'Student';
}

export function initPortalTheme() {
    if (typeof window === 'undefined') {
        return;
    }

    const storedTheme = getStoredPortalTheme();
    if (storedTheme) {
        applyPortalTheme(storedTheme);
        return;
    }

    const role = window.localStorage.getItem('userRole');
    const inferredTheme = ROLE_TO_THEME[role] || 'student';
    setStoredPortalTheme(inferredTheme);
}
