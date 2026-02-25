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

function CookieRow({ name, type, purpose, duration }) {
    return (
        <div className="grid grid-cols-4 gap-4 py-3 text-sm border-b border-fg/10 last:border-0">
            <span className="font-mono text-xs break-all text-text-main">{name}</span>
            <span className="text-text-dim">{type}</span>
            <span className="text-text-muted">{purpose}</span>
            <span className="text-text-dim">{duration}</span>
        </div>
    );
}

export default function CookiesPage() {
    return (
        <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto space-y-6">
            <div>
                <h1 className="mb-2 text-4xl font-bold font-display text-text-main">Cookie-policy</h1>
                <p className="text-sm text-text-dim">Senast uppdaterad: 25 februari 2026</p>
            </div>

            <Section title="Vad är cookies?">
                <P>
                    Cookies är små textfiler som lagras i din webbläsare när du besöker en webbplats.
                    De används för att webbplatsen ska fungera korrekt, minnas dina inställningar
                    och förbättra din upplevelse.
                </P>
                <P>
                    Liatch använder enbart cookies som är nödvändiga för att plattformen ska fungera.
                    Vi använder inga spårnings- eller marknadsföringscookies.
                </P>
            </Section>

            <Section title="Cookies vi använder">
                <P>Nedan ser du en lista över de cookies som Liatch använder:</P>
                <div className="mt-3">
                    <div className="grid grid-cols-4 gap-4 pb-2 text-xs font-medium tracking-wide uppercase border-b border-fg/20 text-text-dim">
                        <span>Namn</span>
                        <span>Typ</span>
                        <span>Syfte</span>
                        <span>Varaktighet</span>
                    </div>
                    <CookieRow
                        name="accessToken"
                        type="Nödvändig"
                        purpose="Håller dig inloggad på plattformen"
                        duration="Session / 8 h"
                    />
                    <CookieRow
                        name="userRole"
                        type="Nödvändig"
                        purpose="Visar rätt navigering beroende på kontotyp"
                        duration="Session"
                    />
                    <CookieRow
                        name="userDisplayName"
                        type="Nödvändig"
                        purpose="Visar ditt namn i gränssnittet"
                        duration="Session"
                    />
                </div>
                <P>
                    Dessa uppgifter lagras i webbläsarens <span className="font-mono text-xs text-text-main">localStorage</span>,
                    inte som traditionella HTTP-cookies, men omfattas av samma rättigheter och principer.
                </P>
            </Section>

            <Section title="Hur länge sparas cookies?">
                <P>
                    Sessionscookies raderas automatiskt när du stänger webbläsaren eller loggar ut.
                    Inloggningstoken har en maximal livslängd på 8 timmar och ogiltigförklaras
                    dessutom vid utloggning på serversidan.
                </P>
            </Section>

            <Section title="Hantera dina cookies">
                <P>
                    Du kan när som helst logga ut från Liatch för att radera alla sessionsuppgifter.
                    Du kan också manuellt rensa webbläsarens localStorage via din webbläsares
                    utvecklarverktyg (F12 → Application → Local Storage).
                </P>
                <P>
                    De flesta webbläsare låter dig också blockera eller radera cookies via inställningarna.
                    Observera att om du blockerar nödvändiga cookies kan du inte logga in på plattformen.
                </P>
            </Section>

            <Section title="Kontakt">
                <P>
                    Har du frågor om hur vi använder cookies, kontakta oss på{' '}
                    <a href="mailto:privacy@liatch.se" className="text-accent hover:underline">privacy@liatch.se</a>.
                </P>
            </Section>
        </div>
    );
}
