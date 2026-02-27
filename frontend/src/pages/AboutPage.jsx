import React from 'react';
import jesperImg from '../assets/jesper.jpg';
import patrikImg from '../assets/patrik.jpg';

export default function AboutPage() {
    return (
        <div className="relative px-6 pt-32 mx-auto max-w-7xl">
            <div className="relative z-10 text-center">
                <h1 className="mb-6 text-4xl font-bold font-display text-text-main">Det här är</h1>
                <h1 className="mb-6 font-bold text-8xl font-display text-accent">Liatch</h1>
                <p className="mb-6 text-text-muted">Liatch är skapat för att vara en plattform som förenar företag, skolor och studenter. <br/>
                        Vårt mål är att skolor och studenter ska kunna söka LIA-praktik enkelt och smidigt. <br/>
                        Samtidigt som företag får tillgång till talangfulla studenter som kan bidra med nya idéer och energi.</p>
                <h2 className="text-5xl font-semibold text-accent">Allt samlat på en plattform.</h2>
            </div>

            {/* Vår Vision Section */}
            <div className="flex justify-center mt-48" data-aos="fade-up" data-aos-duration="1000">
                <div className="flex flex-col items-center max-w-6xl overflow-hidden rounded-xl md:flex-row glass-card">
                    {/* Placeholder for Image */}
                    <div className="w-full bg-center bg-cover md:w-1/2 h-80 rounded-t-xl md:rounded-l-xl md:rounded-tr-none" style={{ backgroundImage: 'url(https://via.placeholder.com/600x400)' }}>
                        {/* Replace the URL above with your image */}
                    </div>
                    <div className="w-full p-10 md:w-1/2 md:p-16">
                        <h2 className="mb-6 text-4xl font-bold font-display text-text-main">Vår Vision</h2>
                        <p className="text-sm leading-relaxed text-text-muted">
                            Vi strävar efter att skapa en inkluderande och effektiv plattform där studenter kan hitta meningsfulla LIA-praktikplatser, företag kan upptäcka talangfulla studenter och skolor kan underlätta processen för sina elever. <br/><br/>
                            Genom att förena dessa tre grupper vill vi bidra till en mer dynamisk och samarbetsinriktad arbetsmarknad där alla parter kan dra nytta av varandra. <br/><br/>
                            Vi tror på kraften i samarbete och innovation för att forma framtidens arbetsliv, och vi är dedikerade till att göra det enklare för studenter att hitta rätt praktikplats, för företag att hitta rätt talang och för skolor att stödja sina elever på bästa sätt.
                        </p>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="mt-24" data-aos="fade-up" data-aos-duration="1000">
                <h2 className="mb-12 text-5xl font-bold text-center font-display text-accent">Vårt Team</h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
                    {/* Team Member Card */}
                    <div className="p-6 text-center rounded-xl glass-card">
                        <img src={jesperImg} alt="Jesper" className="object-cover w-24 h-24 mx-auto mb-4 border rounded-full border-fg/10" />
                        <h3 className="text-xl font-bold font-display text-text-main">Jesper</h3>
                        <p className="text-text-muted">Fullstack Developer</p>
                    </div>
                    <div className="p-6 text-center rounded-xl glass-card">
                        <img src={patrikImg} alt="Patrik" className="object-cover w-24 h-24 mx-auto mb-4 border rounded-full border-fg/10" />
                        <h3 className="text-xl font-bold font-display text-text-main">Patrik</h3>
                        <p className="text-text-muted">Fullstack Developer</p>
                    </div>
                </div>
            </div>
        </div>
    );
}