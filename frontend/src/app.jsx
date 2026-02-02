import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import useScrollReveal from './hooks/useScrollReveal';

function App() {
    useScrollReveal();

    return (
        <>
            <Navbar />
            <main className="pt-0 relative">
                <Hero />
            </main>
        </>
    );
}

export default App;
