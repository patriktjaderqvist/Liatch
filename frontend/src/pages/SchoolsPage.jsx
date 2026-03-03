import React from 'react';
import { Link } from 'react-router-dom';

const steps = [
    {
        number: '01',
        title: 'Registrera skolan',
        description: 'Skapa ett skolkonto på Liatch. Kostnadsfritt och klart på några minuter.',
    },
    {
        number: '02',
        title: 'Studenter kopplar sig',
        description: 'När studenter registrerar sig väljer de din skola. De kopplas automatiskt till ert konto.',
    },
    {
        number: '03',
        title: 'Följ framstegen',
        description: 'Få en samlad översikt över era studenters ansökningar och praktikplatser.',
    },
];

const benefits = [
    {
        title: 'Samlad översikt',
        description: 'Se alla studenter kopplade till er skola och deras aktivitet på plattformen – på ett ställe.',
    },
    {
        title: 'Enklare LIA-process',
        description: 'Studenter hittar verifierade LIA-platser från riktiga företag direkt i plattformen.',
    },
    {
        title: 'Stort företagsnätverk',
        description: 'Liatch samarbetar med hundratals företag som aktivt söker studenter för LIA och praktik.',
    },
    {
        title: 'Kostnadsfritt för skolor',
        description: 'Liatch är helt gratis för skolor och deras studenter. Inga dolda avgifter.',
    },
];

export default function SchoolsPage() {
    return (
        <div className="pb-20">
            {/* Hero */}
            <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto text-center">
                <p className="mb-4 text-xs font-medium tracking-widest uppercase text-accent">För Skolor</p>
                <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl font-display text-text-main">
                    Stöd dina studenters LIA-sökning
                </h1>
                <p className="mb-8 text-lg leading-relaxed text-text-muted">
                    Liatch gör det enkelt för skolor att stötta sina studenter i jakten på rätt praktikplats.
                    Följ framstegen, se ansökningar och håll koll – allt samlat på ett ställe.
                </p>
                <Link
                    to="/skapa-konto"
                    className="inline-block bg-accent hover:bg-accent/90 text-white font-medium px-8 py-3 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)] hover:scale-[1.02]"
                >
                    Registrera din skola
                </Link>
            </div>

            {/* Så fungerar det */}
            <div className="max-w-5xl px-6 mx-auto mb-24">
                <h2 className="mb-12 text-2xl font-bold text-center font-display text-text-main">
                    Så här fungerar det
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {steps.map((step) => (
                        <div key={step.number} className="p-6 space-y-3 glass-card rounded-xl">
                            <span className="text-3xl font-bold font-display text-accent">{step.number}</span>
                            <h3 className="text-lg font-semibold font-display text-text-main">{step.title}</h3>
                            <p className="text-sm leading-relaxed text-text-muted">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fördelar */}
            <div className="max-w-5xl px-6 mx-auto mb-24">
                <h2 className="mb-12 text-2xl font-bold text-center font-display text-text-main">
                    Varför Liatch?
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {benefits.map((b) => (
                        <div key={b.title} className="p-6 space-y-2 glass-card rounded-xl">
                            <h3 className="font-semibold font-display text-text-main">{b.title}</h3>
                            <p className="text-sm leading-relaxed text-text-muted">{b.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA-banner */}
            <div className="max-w-3xl px-6 mx-auto">
                <div className="p-10 space-y-4 text-center glass-card rounded-2xl">
                    <h2 className="text-2xl font-bold font-display text-text-main">
                        Redo att stötta dina studenter?
                    </h2>
                    <p className="text-sm text-text-muted">
                        Registrera din skola gratis och ge dina studenter tillgång till hundratals LIA-platser.
                    </p>
                    <Link
                        to="/skapa-konto"
                        className="inline-block bg-accent hover:bg-accent/90 text-white font-medium px-8 py-3 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)] hover:scale-[1.02]"
                    >
                        Kom igång gratis
                    </Link>
                </div>
            </div>
        </div>
    );
}
