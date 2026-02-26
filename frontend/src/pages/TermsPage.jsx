import React from 'react';

function Section({ title, children }) {
    return (
        <div className="p-6 space-y-3 glass-card rounded-xl">
            <h2 className="text-lg font-semibold font-display text-text-main">{title}</h2>
            {children}
        </div>
    );
}

function P({ children }) {
    return <p className="text-sm leading-relaxed text-text-muted">{children}</p>;
}

export default function TermsPage() {
    return (
        <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto space-y-6">
            <div>
                <h1 className="mb-2 text-4xl font-bold font-display text-text-main">Användarvillkor</h1>
                <p className="text-sm text-text-dim">Senast uppdaterad: 25 februari 2026</p>
            </div>

            <Section title="1. Introduktion">
                <P>
                    Dessa användarvillkor beskriver regler och villkor för användning av vår plattform.
                    Genom att använda vår plattform accepterar du dessa villkor i sin helhet.
                    Om du inte accepterar villkoren, vänligen avstå från att använda plattformen.
                </P>
            </Section>

            <Section title="2. Användarkonton">
                <P>
                    För att använda vissa funktioner på plattformen kan du behöva skapa ett konto.
                    Du är ansvarig för att hålla dina inloggningsuppgifter säkra och för all aktivitet
                    som sker under ditt konto.
                </P>
            </Section>

            <Section title="3. Tillåten användning">
                <P>
                    Du får endast använda plattformen för lagliga ändamål och i enlighet med dessa villkor.
                    Det är förbjudet att använda plattformen för att bryta mot lagar eller för att
                    skada andra användare.
                </P>
            </Section>

            <Section title="4. Immateriella rättigheter">
                <P>
                    Allt innehåll på plattformen, inklusive texter, bilder och grafik, är skyddat av
                    upphovsrätt och andra immateriella rättigheter. Du får inte använda innehållet
                    utan tillstånd.
                </P>
            </Section>

            <Section title="5. Ansvarsbegränsning">
                <P>
                    Vi ansvarar inte för direkta eller indirekta skador som kan uppstå vid användning
                    av plattformen. Användning sker på egen risk.
                </P>
            </Section>

            <Section title="6. Ändringar av villkor">
                <P>
                    Vi förbehåller oss rätten att ändra dessa villkor när som helst.
                    Ändringar träder i kraft när de publiceras på plattformen.
                </P>
            </Section>

            <Section title="7. Kontaktinformation">
                <P>
                    Om du har frågor om dessa villkor är du välkommen att kontakta oss på{' '}
                    <a href="mailto:support@liatch.se" className="text-accent hover:underline">
                        support@liatch.se
                    </a>.
                </P>
            </Section>
        </div>
    );
}
