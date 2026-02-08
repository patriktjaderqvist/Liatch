import React from 'react';

export default function TermsPage() {
    return (
        <div className="px-6 py-24 mx-auto max-w-7xl">
            <h1 className="mb-8 text-3xl font-bold text-center text-text-main">Användarvillkor</h1>

            <section className="mb-12">
                <h2 className="mb-4 text-xl font-semibold text-text-main">1. Introduktion</h2>
                <p className="text-base text-text-muted">
                    Dessa användarvillkor beskriver regler och villkor för användning av vår plattform. Genom att använda vår plattform accepterar du dessa villkor i sin helhet. Om du inte accepterar villkoren, vänligen avstå från att använda plattformen.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 text-xl font-semibold text-text-main">2. Användarkonton</h2>
                <p className="text-base text-text-muted">
                    För att använda vissa funktioner på plattformen kan du behöva skapa ett konto. Du är ansvarig för att hålla dina inloggningsuppgifter säkra och för all aktivitet som sker under ditt konto.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 text-xl font-semibold text-text-main">3. Tillåten användning</h2>
                <p className="text-base text-text-muted">
                    Du får endast använda plattformen för lagliga ändamål och i enlighet med dessa villkor. Det är förbjudet att använda plattformen för att bryta mot lagar eller för att skada andra användare.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 text-xl font-semibold text-text-main">4. Immateriella rättigheter</h2>
                <p className="text-base text-text-muted">
                    Allt innehåll på plattformen, inklusive texter, bilder och grafik, är skyddat av upphovsrätt och andra immateriella rättigheter. Du får inte använda innehållet utan tillstånd.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 text-xl font-semibold text-text-main">5. Ansvarsbegränsning</h2>
                <p className="text-base text-text-muted">
                    Vi ansvarar inte för direkta eller indirekta skador som kan uppstå vid användning av plattformen. Användning sker på egen risk.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="mb-4 text-xl font-semibold text-text-main">6. Ändringar av villkor</h2>
                <p className="text-base text-text-muted">
                    Vi förbehåller oss rätten att ändra dessa villkor när som helst. Ändringar träder i kraft när de publiceras på plattformen.
                </p>
            </section>

            <section>
                <h2 className="mb-4 text-xl font-semibold text-text-main">7. Kontaktinformation</h2>
                <p className="text-base text-text-muted">
                    Om du har några frågor om dessa villkor, vänligen kontakta oss på support@liatch.com.
                </p>
            </section>
        </div>
    );
}
