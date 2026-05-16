import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, logoutUser } from '../lib/authApi';

export default function Navbar() {
    const [userRole, setUserRole] = useState(null);
    const [userDisplayName, setUserDisplayName] = useState(null);
    const navigate = useNavigate();

    const getRoleFallbackLabel = (role) => {
        if (role === 'privatperson') return 'Studentkonto';
        if (role === 'foretag') return 'Företagskonto';
        if (role === 'skola') return 'Skolkonto';
        return 'Inloggad användare';
    };

    // Check session data on component mount and when storage changes.
    useEffect(() => {
        const syncSession = () => {
            const role = localStorage.getItem('userRole');
            const displayName = localStorage.getItem('userDisplayName');
            const email = localStorage.getItem('userEmail');
            setUserRole(role);
            setUserDisplayName(displayName || email || null);
        };

        syncSession();

        // Listen for storage changes (e.g., when user logs in)
        window.addEventListener('storage', syncSession);

        // Custom event for same-window storage changes
        window.addEventListener('userRoleChanged', syncSession);

        return () => {
            window.removeEventListener('storage', syncSession);
            window.removeEventListener('userRoleChanged', syncSession);
        };
    }, []);

    const handleLogout = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            try {
                await logoutUser(accessToken);
            } catch {
                // Local session should still be cleared if API logout fails.
            }
        }

        clearSession();
        setUserRole(null);
        setUserDisplayName(null);
        navigate('/');
    };

    // Render navigation items based on user role
    const renderNavItems = () => {
        if (!userRole) {
            // Public navigation (not logged in)
            return (
                <>
                    <Link to="/annonser" className="text-sm font-medium tracking-wide transition-colors text-text-muted hover:text-text-main">SÖK PRAKTIK</Link>
                    <Link to="/foretag" className="text-sm font-medium tracking-wide transition-colors text-text-muted hover:text-text-main">FÖR FÖRETAG</Link>
                    <Link to="/skolor" className="text-sm font-medium tracking-wide transition-colors text-text-muted hover:text-text-main">FÖR SKOLOR</Link>
                    <Link to="/om-oss" className="text-sm font-medium tracking-wide transition-colors text-text-muted hover:text-text-main">OM OSS</Link>
                </>
            );
        }

        if (userRole === 'privatperson') {
            return (
                <>
                    <Link to="/annonser" className="text-sm font-medium tracking-wide transition-colors text-text-muted hover:text-text-main">ANNONSER</Link>
                    <Link to="/mina-sokningar" className="text-sm font-medium tracking-wide transition-colors text-text-muted hover:text-text-main">MINA ANSÖKNINGAR</Link>
                    <Link to="/min-profil" className="text-sm font-medium tracking-wide transition-colors text-text-muted hover:text-text-main">MIN PROFIL</Link>
                </>
            );
        }

        if (userRole === 'foretag') {
            return (
                <>
                    <Link to="/vara-annonser" className="text-sm font-medium tracking-wide transition-colors text-text-muted hover:text-text-main">VÅRA ANNONSER</Link>
                    <Link to="/skapa-annons" className="text-sm font-medium tracking-wide transition-colors text-text-muted hover:text-text-main">SKAPA ANNONS</Link>
                    <Link to="/foretagsprofil" className="text-sm font-medium tracking-wide transition-colors text-text-muted hover:text-text-main">FÖRETAGSPROFIL</Link>
                </>
            );
        }

        if (userRole === 'skola') {
            return (
                <>
                    <Link to="/annonser" className="text-sm font-medium tracking-wide transition-colors text-text-muted hover:text-text-main">ANNONSER</Link>
                    <Link to="/studenter" className="text-sm font-medium tracking-wide transition-colors text-text-muted hover:text-text-main">STUDENTER</Link>
                    <Link to="/skolprofil" className="text-sm font-medium tracking-wide transition-colors text-text-muted hover:text-text-main">SKOLPROFIL</Link>
                </>
            );
        }
    };

    return (
        <nav className="fixed top-0 z-50 w-full transition-all duration-300">
            <div className="border-b glass border-fg/5 bg-bg-void/80">
                <div className="px-4 py-3 mx-auto max-w-7xl sm:px-6">
                    <div className="flex items-center justify-between gap-4">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent">
                                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M13 2L3 14h9v8l10-12h-9l9-8z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold tracking-tight font-display text-text-main">Liatch<span className="text-accent">.</span></span>
                        </Link>

                        {/* Nav Tabs (desktop) */}
                        <div className="items-center hidden md:flex gap-x-6">
                            {renderNavItems()}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            {!userRole ? (
                                <>
                                    <Link to="/login" className="text-sm font-medium transition-colors text-text-muted hover:text-text-main">Logga in</Link>
                                    <Link to="/skapa-konto" className="bg-fg text-text-inverse hover:bg-accent hover:text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.4)]">
                                        Skapa konto
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <p className="hidden text-xs text-text-dim whitespace-nowrap max-w-[220px] truncate md:block">
                                        Inloggad som: {userDisplayName || getRoleFallbackLabel(userRole)}
                                    </p>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm font-medium transition-colors text-text-muted hover:text-text-main"
                                    >
                                        Logga ut
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Nav Tabs (mobile) */}
                    <div className="flex flex-wrap items-center justify-center pt-3 mt-3 border-t md:hidden gap-x-6 gap-y-2 border-fg/10">
                        {renderNavItems()}
                    </div>
                </div>
            </div>
        </nav>
    );
}
