import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="relative bg-bg-void border-t border-fg/5 text-text-muted mt-20 overflow-hidden">
            {/* Ambient Background Effect */}
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.03] pointer-events-none"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

                    {/* Brand Section */}
                    <div className="md:col-span-4 space-y-6">
                        <Link to="/" className="flex items-center gap-3 group w-fit">
                            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center group-hover:bg-accent/90 transition-colors">
                                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M13 2L3 14h9v8l10-12h-9l9-8z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="font-display text-2xl font-bold tracking-tight text-text-main">Liatch<span className="text-accent">.</span></span>
                        </Link>
                        <p className="text-text-dim text-sm leading-relaxed max-w-xs">
                            Vi kopplar samman framtidens talanger med marknadens ledande företag. En plattform byggd för karriär, inte bara praktik.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="md:col-span-2 md:col-start-6 space-y-6">
                        <h4 className="text-text-main font-bold tracking-tight">Plattformen</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/annonser" className="hover:text-accent transition-colors">Sök Praktik</Link></li>
                            <li><Link to="/foretag" className="hover:text-accent transition-colors">För Företag</Link></li>
                            <li><Link to="/skolor" className="hover:text-accent transition-colors">För Skolor</Link></li>
                            <li><Link to="/om-oss" className="hover:text-accent transition-colors">Om Liatch</Link></li>
                        </ul>
                    </div>

                    {/* Legal / Resources */}
                    <div className="md:col-span-2 space-y-6">
                        <h4 className="text-text-main font-bold tracking-tight">Resurser</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-accent transition-colors">Hjälpcenter</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Integritetspolicy</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Användarvillkor</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Cookies</a></li>
                        </ul>
                    </div>

                    {/* Newsletter / Contact */}
                    <div className="md:col-span-3 space-y-6">
                        <h4 className="text-text-main font-bold tracking-tight">Håll dig uppdaterad</h4>
                        <p className="text-xs text-text-dim">Få de senaste praktikplatserna direkt i inkorgen.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="din@email.se"
                                className="bg-fg/5 border border-fg/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-accent/50 text-text-main placeholder-text-dim"
                            />
                            <button className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                OK
                            </button>
                        </div>
                    </div>

                </div>

                <div className="border-t border-fg/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-dim">
                    <p>&copy; {new Date().getFullYear()} Liatch AB. Alla rättigheter förbehållna.</p>
                    <p className="flex items-center gap-1">
                        Made with <span className="text-accent">♥</span> in Stockholm
                    </p>
                </div>
            </div>
        </footer>
    );
}
