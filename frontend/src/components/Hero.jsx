import React from 'react';

export default function Hero() {
    return (
        <section className="min-h-screen relative flex items-center justify-center pt-20 overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-bg-void transition-colors duration-500">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:60px_60px] opacity-20 mask-radial-fade"></div>
                {/* Glow Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] animate-float-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] animate-float-slow" style={{ animationDelay: '-4s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">



                <h1 className="mt-20 font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[0.9] text-text-main headline-glow transition-colors duration-500">
                    Hitta din nästa <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-main via-text-main to-text-muted">praktik</span>
                </h1>

                <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                    Koppla ihop din potential med branschens ledande företag. <span className="text-text-main font-medium">Liatch</span> är plattformen som förvandlar LIA & Praktik till karriär.
                </p>

                {/* Search Interface */}
                <div className="max-w-3xl mx-auto glass p-2 rounded-2xl">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-text-muted group-focus-within:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input type="text" className="w-full bg-fg/5 border border-fg/5 rounded-xl py-4 pl-12 pr-4 text-text-main placeholder-text-dim focus:outline-none focus:bg-fg/10 focus:border-accent/50 transition-all font-body" placeholder="Sök efter roll eller stad..." />
                        </div>
                        <button className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,77,0,0.3)] hover:scale-[1.02]">
                            Hitta Plats
                        </button>
                    </div>
                </div>

                {/* Stats Ticker */}

            </div>
        </section>
    );
}
