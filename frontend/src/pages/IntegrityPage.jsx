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

function Li({ children }) {
    return <li className="ml-4 text-sm leading-relaxed list-disc text-text-muted">{children}</li>;
}

export default function IntegrityPage() {
    return (
        <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto space-y-6">
            <div>
                <h1 className="mb-2 text-4xl font-bold font-display text-text-main">Integritetspolicy</h1>
                <p className="text-sm text-text-dim">Senast uppdaterad: 25 februari 2026</p>
            </div>

            <Section title="1. Personuppgiftsansvarig">
                <P>
                    Liatch AB är personuppgiftsansvarig för behandlingen av dina personuppgifter på denna plattform.
                    Vi värnar om din integritet och behandlar dina uppgifter i enlighet med EU:s dataskyddsförordning (GDPR).
                </P>
                <P>
                    <span className="font-medium text-text-main">Kontakt:</span>{' '}
                    <a href="mailto:privacy@liatch.se" className="text-accent hover:underline">privacy@liatch.se</a>
                </P>
            </Section>

            <Section title="2. Vilka uppgifter vi samlar in">
                <P>Beroende på hur du använder Liatch samlar vi in följande uppgifter:</P>
                <ul className="mt-1 space-y-1">
                    <Li>Namn, e-postadress och lösenord (krypterat) vid registrering</Li>
                    <Li>Profilinformation såsom program, stad, telefonnummer och bio (om du väljer att fylla i det)</Li>
                    <Li>Länkar till LinkedIn, GitHub, portfolio och CV (om du väljer att ange dem)</Li>
                    <Li>Ansökningar och tillhörande personliga brev</Li>
                    <Li>Företags- eller skolinformation för arbetsgivare och skoladministratörer</Li>
                </ul>
            </Section>

            <Section title="3. Hur vi använder dina uppgifter">
                <P>Vi använder dina personuppgifter för att:</P>
                <ul className="mt-1 space-y-1">
                    <Li>Tillhandahålla och administrera ditt konto på plattformen</Li>
                    <Li>Matcha studenter med relevanta praktikplatser</Li>
                    <Li>Möjliggöra kommunikation mellan studenter och företag via ansökningar</Li>
                    <Li>Förbättra och utveckla plattformens funktioner</Li>
                    <Li>Uppfylla rättsliga skyldigheter</Li>
                </ul>
            </Section>

            <Section title="4. Laglig grund">
                <P>
                    Vi behandlar dina personuppgifter med stöd av följande rättsliga grunder enligt GDPR artikel 6:
                </P>
                <ul className="mt-1 space-y-1">
                    <Li><span className="text-text-main">Avtal</span> – för att uppfylla våra åtaganden gentemot dig som användare</Li>
                    <Li><span className="text-text-main">Samtycke</span> – för frivillig profilinformation som bio, länkar och foto</Li>
                    <Li><span className="text-text-main">Berättigat intresse</span> – för att förbättra och säkra tjänsten</Li>
                </ul>
            </Section>

            <Section title="5. Hur länge sparar vi dina uppgifter">
                <P>
                    Vi sparar dina uppgifter så länge ditt konto är aktivt. Om du begär att ditt konto raderas
                    tar vi bort dina personuppgifter inom 30 dagar, förutom uppgifter vi är skyldiga att behålla
                    enligt lag (t.ex. bokföringsunderlag).
                </P>
            </Section>

            <Section title="6. Dina rättigheter">
                <P>Enligt GDPR har du rätt att:</P>
                <ul className="mt-1 space-y-1">
                    <Li>Begära tillgång till de uppgifter vi har om dig</Li>
                    <Li>Begära rättelse av felaktiga uppgifter</Li>
                    <Li>Begära radering av dina uppgifter ("rätten att bli glömd")</Li>
                    <Li>Begära begränsning av behandlingen</Li>
                    <Li>Invända mot behandling som grundar sig på berättigat intresse</Li>
                    <Li>Begära dataportabilitet</Li>
                </ul>
                <P>
                    För att utöva dina rättigheter, kontakta oss på{' '}
                    <a href="mailto:privacy@liatch.se" className="text-accent hover:underline">privacy@liatch.se</a>.
                    Du har också rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY) på{' '}
                    <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">imy.se</a>.
                </P>
            </Section>

            <Section title="7. Delning med tredje part">
                <P>
                    Vi säljer aldrig dina personuppgifter. Vi kan dela uppgifter med tekniska underleverantörer
                    (t.ex. värdtjänst och databastjänst) som behandlar data på uppdrag av oss och under
                    tystnadsplikt. Alla sådana leverantörer är bundna av personuppgiftsbiträdesavtal.
                </P>
            </Section>

            <Section title="8. Kontakt">
                <P>
                    Har du frågor om hur vi hanterar dina personuppgifter är du välkommen att kontakta oss:
                </P>
                <P>
                    <span className="text-text-main">E-post:</span>{' '}
                    <a href="mailto:privacy@liatch.se" className="text-accent hover:underline">privacy@liatch.se</a>
                </P>
            </Section>
        </div>
    );
}
