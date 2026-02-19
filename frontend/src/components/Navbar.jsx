import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, logoutUser } from '../lib/authApi';

export default function Navbar() {
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    // Check localStorage for user role on component mount and when storage changes
    useEffect(() => {
        const checkUserRole = () => {
            const role = localStorage.getItem('userRole');
            setUserRole(role);
        };

        checkUserRole();

        // Listen for storage changes (e.g., when user logs in)
        window.addEventListener('storage', checkUserRole);

        // Custom event for same-window storage changes
        window.addEventListener('userRoleChanged', checkUserRole);

        return () => {
            window.removeEventListener('storage', checkUserRole);
            window.removeEventListener('userRoleChanged', checkUserRole);
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
        navigate('/');
    };

    // Render navigation items based on user role
    const renderNavItems = () => {
        if (!userRole) {
            // Public navigation (not logged in)
            return (
                <>
                    <Link to="/annonser" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">SÖK PRAKTIK</Link>
                    <Link to="/foretag" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">FÖR FÖRETAG</Link>
                    <Link to="/skolor" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">FÖR SKOLOR</Link>
                    <Link to="/om-oss" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">OM OSS</Link>
                </>
            );
        }

        if (userRole === 'privatperson') {
            return (
                <>
                    <Link to="/annonser" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">ANNONSER</Link>
                    <Link to="/mina-sokningar" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">MINA SÖKNINGAR</Link>
                    <Link to="/min-profil" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">MIN PROFIL</Link>
                </>
            );
        }

        if (userRole === 'foretag') {
            return (
                <>
                    <Link to="/vara-annonser" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">VÅRA ANNONSER</Link>
                    <Link to="/skapa-annons" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">SKAPA ANNONS</Link>
                    <Link to="/foretagsprofil" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">FÖRETAGSPROFIL</Link>
                </>
            );
        }

        if (userRole === 'skola') {
            return (
                <>
                    <Link to="/annonser" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">ANNONSER</Link>
                    <Link to="/studenter" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">STUDENTER</Link>
                    <Link to="/skolprofil" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">SKOLPROFIL</Link>
                </>
            );
        }
    };

    return (
        <nav className="fixed w-full z-50 top-0 transition-all duration-300">
            <div className="glass border-b border-fg/5 bg-bg-void/80">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M13 2L3 14h9v8l10-12h-9l9-8z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="font-display text-2xl font-bold tracking-tight text-text-main">Liatch<span className="text-accent">.</span></span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {renderNavItems()}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-6">
                        {!userRole ? (
                            <>
                                <Link to="/login" className="hidden md:block text-sm font-medium text-text-muted hover:text-text-main transition-colors">Logga in</Link>
                                <Link to="/skapa-konto" className="bg-fg text-text-inverse hover:bg-accent hover:text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,77,0,0.4)]">
                                    Skapa konto
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-text-muted hover:text-text-main transition-colors"
                            >
                                Logga ut
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
