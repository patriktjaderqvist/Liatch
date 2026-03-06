import React from 'react';
import jesperImg from '../assets/jesper.jpg';
import patrikImg from '../assets/patrik.jpg';

export default function AboutPage() {
    return (
        <div className="pb-20">
            {/* Hero */}
            <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto text-center">
                <p className="mb-4 text-xs font-medium tracking-widest uppercase text-accent">Om Oss</p>
                <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl font-display text-text-main">
                    Det här är <span className="text-accent">Liatch</span>
                </h1>
                <p className="mb-8 text-lg leading-relaxed text-text-muted">
                    Liatch är skapat för att vara en plattform som förenar företag, skolor och studenter. <br />
                    Vårt mål är att skolor och studenter ska kunna söka LIA-praktik enkelt och smidigt. <br />
                    Samtidigt som företag får tillgång till talangfulla studenter som kan bidra med nya idéer och energi.
                </p>
                <h2 className="text-2xl font-semibold md:text-3xl text-accent">Allt samlat på en plattform.</h2>
            </div>

            {/* Vår vision */}
            <div className="max-w-5xl px-6 mx-auto mb-24">
                <h2 className="mb-12 text-2xl font-bold text-center font-display text-text-main">
                    Vår Vision
                </h2>
                <div className="p-8 space-y-6 glass-card rounded-xl">
                    <p className="text-sm leading-relaxed text-text-muted">
                        Vi strävar efter att skapa en inkluderande och effektiv plattform där studenter kan hitta meningsfulla LIA-praktikplatser, företag kan upptäcka talangfulla studenter och skolor kan underlätta processen för sina elever.
                    </p>
                    <p className="text-sm leading-relaxed text-text-muted">
                        Genom att förena dessa tre grupper vill vi bidra till en mer dynamisk och samarbetsinriktad arbetsmarknad där alla parter kan dra nytta av varandra.
                    </p>
                    <p className="text-sm leading-relaxed text-text-muted">
                        Vi tror på kraften i samarbete och innovation för att forma framtidens arbetsliv, och vi är dedikerade till att göra det enklare för studenter att hitta rätt praktikplats, för företag att hitta rätt talang och för skolor att stödja sina elever på bästa sätt.
                    </p>
                </div>
            </div>

            {/* Team */}
            <div className="max-w-5xl px-6 mx-auto mb-24">
                <h2 className="mb-12 text-2xl font-bold text-center font-display text-text-main">
                    Vårt Team
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="p-6 text-center space-y-3 glass-card rounded-xl">
                        <img src={jesperImg} alt="Jesper" className="object-cover w-24 h-24 mx-auto border rounded-full border-fg/10" />
                        <h3 className="text-xl font-semibold font-display text-text-main">Jesper</h3>
                        <p className="text-sm text-text-muted">Fullstack Developer</p>
                    </div>
                    <div className="p-6 text-center space-y-3 glass-card rounded-xl">
                        <img src={patrikImg} alt="Patrik" className="object-cover w-24 h-24 mx-auto border rounded-full border-fg/10" />
                        <h3 className="text-xl font-semibold font-display text-text-main">Patrik</h3>
                        <p className="text-sm text-text-muted">Fullstack Developer</p>
                    </div>
                </div>
            </div>

            {/* Banner */}
            <div className="max-w-3xl px-6 mx-auto">
                <div className="p-10 space-y-3 text-center glass-card rounded-2xl">
                    <h2 className="text-2xl font-bold font-display text-text-main">Allt samlat på en plattform.</h2>
                    <p className="text-sm text-text-muted">
                        Liatch förenar företag, skolor och studenter i en gemensam LIA-upplevelse.
                    </p>
                </div>
            </div>
        </div>
    );
}
