import React from 'react';

export default function Navbar() {


    return (
        <nav className="fixed w-full z-50 top-0 transition-all duration-300">
            <div className="glass border-b border-fg/5 bg-bg-void/80">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M13 2L3 14h9v8l10-12h-9l9-8z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="font-display text-2xl font-bold tracking-tight text-text-main">Liatch<span className="text-accent">.</span></span>
                    </a>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="AdsPage.jsx" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">ANNONSER</a>
                        <a href="CompaniesPage.jsx" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">FÖR FÖRETAG</a>
                        <a href="AboutPage.jsx" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">OM OSS</a>
                        <a href="SchoolsPage.jsx" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors tracking-wide">FÖR SKOLOR</a>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-6">
                        {/* Theme Toggle */}


                        <a href="#" className="hidden md:block text-sm font-medium text-text-muted hover:text-text-main transition-colors">Logga in</a>
                        <a href="/profil" className="bg-fg text-text-inverse hover:bg-accent hover:text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,77,0,0.4)]">
                            Skapa konto
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
