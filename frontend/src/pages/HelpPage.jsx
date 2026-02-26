import React, { useState } from 'react';

const faqData = [
    {
        category: 'Allmänt',
        items: [
            {
                q: 'Vad är Liatch?',
                a: 'Liatch är en plattform som kopplar samman studenter på yrkeshögskolor med företag som erbjuder LIA-platser (Lärande i arbete). Studenter kan söka praktikplatser, företag kan publicera annonser och skolor kan följa sina studenters praktik.',
            },
            {
                q: 'Är Liatch gratis att använda?',
                a: 'Ja, Liatch är kostnadsfritt för studenter och skolor. Företag kan använda grundfunktionerna utan kostnad.',
            },
            {
                q: 'Vilka typer av konton finns det?',
                a: 'Det finns tre kontotyper: Student – för dig som söker LIA-plats, Företag – för arbetsgivare som vill publicera annonser och ta emot ansökningar, och Skola – för skoladministratörer som följer sina studenters praktik.',
            },
        ],
    },
    {
        category: 'För studenter',
        items: [
            {
                q: 'Hur skapar jag ett konto som student?',
                a: 'Klicka på "Skapa konto" i navigeringen och välj "Student" som kontotyp. Fyll i dina uppgifter och registrera dig. Du kan sedan komplettera din profil med bio, länkar och mer.',
            },
            {
                q: 'Hur söker jag en LIA-plats?',
                a: 'Gå till sidan "Annonser" och bläddra bland tillgängliga LIA-platser. Du kan filtrera på titel, företag eller plats. Klicka på en annons för att läsa mer och skicka din ansökan.',
            },
            {
                q: 'Kan jag se status på mina ansökningar?',
                a: 'Ja, under "Mina ansökningar" i menyn kan du se alla dina ansökningar och deras aktuella status: Inskickad, Under granskning, Accepterad eller Avslagen.',
            },
            {
                q: 'Kan jag ändra min profil efter registrering?',
                a: 'Ja, gå till "Min profil" i menyn för att uppdatera namn, program, bio, stad, telefonnummer och dina länkar till LinkedIn, GitHub, portfolio och CV.',
            },
            {
                q: 'Vad händer om jag glömmer mitt lösenord?',
                a: 'Kontakta oss på support@liatch.se så hjälper vi dig återställa åtkomsten till ditt konto.',
            },
        ],
    },
    {
        category: 'För företag',
        items: [
            {
                q: 'Hur publicerar jag en LIA-annons?',
                a: 'Logga in med ditt företagskonto och gå till "Skapa annons" i menyn. Fyll i titel, beskrivning, plats, anställningstyp och datum. Annonsen publiceras direkt och är synlig för alla studenter.',
            },
            {
                q: 'Hur hanterar jag inkomna ansökningar?',
                a: 'Under "Vara annonser" kan du se alla dina publicerade annonser. Ansökningsfunktionalitet för att granska och svara på ansökningar finns tillgänglig i plattformen.',
            },
            {
                q: 'Kan jag pausa eller ta bort en annons?',
                a: 'Ja, du kan avaktivera eller ta bort dina annonser från "Vara annonser" i menyn.',
            },
            {
                q: 'Hur uppdaterar jag företagets profil och kontaktuppgifter?',
                a: 'Gå till "Företagsprofil" i menyn för att redigera företagsnamn, organisationsnummer, stad, e-post, beskrivning och webbplats.',
            },
        ],
    },
    {
        category: 'För skolor',
        items: [
            {
                q: 'Hur kan skolan använda Liatch?',
                a: 'Skolor kan logga in med ett skolkonto och följa sina studenters ansökningar och praktikplatser. Under "Studenter" visas alla studenter kopplade till skolan.',
            },
            {
                q: 'Hur kopplas studenter till vår skola?',
                a: 'När en student registrerar sig väljer de sin skola. Skoladministratörer kan sedan se dessa studenter i sin vy.',
            },
        ],
    },
    {
        category: 'Konto och säkerhet',
        items: [
            {
                q: 'Hur raderar jag mitt konto?',
                a: 'Kontakta oss på privacy@liatch.se med en begäran om kontoborttagning. Vi raderar ditt konto och alla tillhörande uppgifter inom 30 dagar.',
            },
            {
                q: 'Hur hanterar Liatch mina personuppgifter?',
                a: 'Vi behandlar dina personuppgifter i enlighet med GDPR. Läs vår integritetspolicy för fullständig information om hur vi samlar in, använder och lagrar dina uppgifter.',
            },
        ],
    },
];

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-fg/10 last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full gap-4 py-4 text-left group"
            >
                <span className="text-sm font-medium transition-colors text-text-main group-hover:text-accent">
                    {q}
                </span>
                <span className={`text-accent transition-transform flex-shrink-0 ${open ? 'rotate-45' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </span>
            </button>
            {open && (
                <p className="pb-4 text-sm leading-relaxed text-text-muted">
                    {a}
                </p>
            )}
        </div>
    );
}

export default function HelpPage() {
    return (
        <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto space-y-10">
            <div>
                <h1 className="mb-2 text-4xl font-bold font-display text-text-main">Hjälpcenter</h1>
                <p className="text-sm text-text-muted">
                    Hitta svar på vanliga frågor om Liatch. Hittar du inte det du söker?{' '}
                    <a href="mailto:support@liatch.se" className="text-accent hover:underline">
                        Kontakta oss
                    </a>.
                </p>
            </div>

            {faqData.map((section) => (
                <div key={section.category}>
                    <h2 className="mb-3 text-xs font-medium tracking-widest uppercase text-accent">
                        {section.category}
                    </h2>
                    <div className="px-6 glass-card rounded-xl">
                        {section.items.map((item) => (
                            <FaqItem key={item.q} q={item.q} a={item.a} />
                        ))}
                    </div>
                </div>
            ))}

            <div className="p-6 space-y-2 text-center glass-card rounded-xl">
                <p className="text-sm font-medium text-text-main">Hittade du inte svaret du sökte?</p>
                <p className="text-sm text-text-muted">
                    Kontakta oss på{' '}
                    <a href="mailto:support@liatch.se" className="text-accent hover:underline">
                        support@liatch.se
                    </a>{' '}
                    så svarar vi så snart vi kan.
                </p>
            </div>
        </div>
    );
}
