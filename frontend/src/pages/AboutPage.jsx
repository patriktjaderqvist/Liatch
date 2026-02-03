import React from 'react';

export default function AboutPage() {
    return (
        <div className="relative px-6 pt-32 mx-auto max-w-7xl">
            {/* Ambient Background */}
            <div className="absolute inset-0 transition-colors duration-500 bg-bg-void">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:60px_60px] opacity-20 mask-radial-fade"></div>
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10">
                <h1 className="mb-6 text-4xl font-bold font-display text-text-main">Om Oss</h1>
                <p className="text-text-muted">Vilka vi är och varför vi bygger Liatch.</p>

                {/* Varför vi bygger Liatch */}
                <div className="mt-6">
                    <h2 className="mb-4 text-2xl font-semibold text-text-main">Varför vi bygger Liatch</h2>
                    <p className="text-text-muted">
                        Liatch är skapat för att vara en plattform som förenar företag, skolor och studenter. 
                        Vårt mål är att skolor och studenter ska kunna söka LIA-praktik enkelt och smidigt. 
                        Samtidigt som företag får tillgång till talangfulla studenter som kan bidra med nya idéer och energi.
                        Allt samlat på en plattform.
                    </p>
                </div>

                {/* Team Section */}
                <div className="mt-12">
                    <h2 className="mb-4 text-3xl font-semibold text-text-main">Vårt Team</h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="p-6 rounded-lg shadow bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-700">Jesper</h3>
                            <p className="text-gray-500">Fullstack Developer</p>
                        </div>
                        <div className="p-6 rounded-lg shadow bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-700">Patrik</h3>
                            <p className="text-gray-500">Fullstack Developer</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

