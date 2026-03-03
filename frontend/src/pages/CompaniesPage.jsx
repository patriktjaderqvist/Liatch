import React from 'react';
import { Link } from 'react-router-dom';

const steps = [
    {
        number: '01',
        title: 'Skapa konto',
        description: 'Registrera ditt företag på några minuter. Helt gratis att komma igång.',
    },
    {
        number: '02',
        title: 'Publicera annons',
        description: 'Beskriv vad du söker, ange plats, period och krav. Annonsen syns direkt för alla studenter.',
    },
    {
        number: '03',
        title: 'Välj din kandidat',
        description: 'Granska inkomna ansökningar och personliga brev. Kontakta den student som passar bäst.',
    },
];

const benefits = [
    {
        title: 'Nå rätt studenter',
        description: 'Hundratals studenter från yrkeshögskolor runt om i Sverige söker aktivt LIA-platser.',
    },
    {
        title: 'Enkelt att hantera',
        description: 'Publicera, redigera och avaktivera annonser när det passar dig – allt på ett ställe.',
    },
    {
        title: 'Direktkontakt',
        description: 'Ta emot ansökningar med personliga brev direkt via plattformen. Inga mellanhänder.',
    },
    {
        title: 'Kostnadsfritt',
        description: 'Grundfunktionerna är helt kostnadsfria för företag. Kom igång utan risk.',
    },
];

export default function CompaniesPage() {
    return (
        <div className="pb-20">
            {/* Hero */}
            <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto text-center">
                <p className="mb-4 text-xs font-medium tracking-widest uppercase text-accent">För Företag</p>
                <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl font-display text-text-main">
                    Hitta din nästa praktikant
                </h1>
                <p className="mb-8 text-lg leading-relaxed text-text-muted">
                    Liatch kopplar samman ditt företag med motiverade studenter som söker LIA-praktik.
                    Publicera en annons och börja ta emot ansökningar redan idag.
                </p>
                <Link
                    to="/skapa-konto"
                    className="inline-block bg-accent hover:bg-accent/90 text-white font-medium px-8 py-3 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)] hover:scale-[1.02]"
                >
                    Skapa företagskonto
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
                        Redo att hitta din nästa praktikant?
                    </h2>
                    <p className="text-sm text-text-muted">
                        Skapa ett gratis företagskonto och publicera din första annons på några minuter.
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
