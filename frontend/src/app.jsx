import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import AdsPage from './pages/AdsPage';
import CompaniesPage from './pages/CompaniesPage';
import AboutPage from './pages/AboutPage';
import SchoolsPage from './pages/SchoolsPage';

function App() {
    return (
        <>
            <Navbar />
            <main className="pt-0 relative">
                <Routes>
                    <Route path="/" element={<Hero />} />
                    <Route path="/annonser" element={<AdsPage />} />
                    <Route path="/foretag" element={<CompaniesPage />} />
                    <Route path="/om-oss" element={<AboutPage />} />
                    <Route path="/skolor" element={<SchoolsPage />} />
                </Routes>
            </main>
            <Footer />
        </>
    );
}

export default App;
