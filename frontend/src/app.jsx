import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import AdsPage from './pages/AdsPage';
import CompaniesPage from './pages/CompaniesPage';
import AboutPage from './pages/AboutPage';
import SchoolsPage from './pages/SchoolsPage';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import HelpPage from './pages/HelpPage';
import IntegrityPage from './pages/IntegrityPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';

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
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/skapa-konto" element={<CreateAccountPage />} />
                    <Route path="/hjalp" element={<HelpPage />} />
                    <Route path="/integritet" element={<IntegrityPage />} />
                    <Route path="/villkor" element={<TermsPage />} />
                    <Route path="/cookies" element={<CookiesPage />} />
                </Routes>
            </main>
            <Footer />
        </>
    );
}

export default App;
