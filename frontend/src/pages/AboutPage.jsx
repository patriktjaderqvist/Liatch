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

            <div className="relative z-10 text-center">
                <h1 className="mb-6 text-4xl font-bold font-display text-text-main">Det här är</h1>
                <h1 className="mb-6 font-bold text-transparent text-8xl font-display bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 bg-clip-text">Liatch</h1>
                <p className="mb-6 text-text-muted">Liatch är skapat för att vara en plattform som förenar företag, skolor och studenter. <br/>
                        Vårt mål är att skolor och studenter ska kunna söka LIA-praktik enkelt och smidigt. <br/>
                        Samtidigt som företag får tillgång till talangfulla studenter som kan bidra med nya idéer och energi.</p>
                <h2 className="text-5xl font-semibold text-transparent bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 bg-clip-text">Allt samlat på en plattform.</h2>
            </div>

            {/* Varför vi bygger Liatch */}
            <div className="mt-6">
                <h2 className="mb-4 text-5xl font-semibold text-text-main">Varför vi bygger Liatch</h2>
                <p className="text-text-muted">
                    Liatch är skapat för att vara en plattform som förenar företag, skolor och studenter. 
                    Vårt mål är att skolor och studenter ska kunna söka LIA-praktik enkelt och smidigt. 
                    Samtidigt som företag får tillgång till talangfulla studenter som kan bidra med nya idéer och energi.
                    Allt samlat på en plattform.
                </p>
            </div>

            {/* Team Section */}
            <div className="mt-12">
                <h2 className="mb-4 text-5xl font-semibold text-text-main">Vårt Team</h2>
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
    );
}



// Brainstorming ideas for additional content or features for the AboutPage:
// 1. Mission and <Vision>