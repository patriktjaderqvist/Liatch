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
// Authenticated pages
import MinaSokningarPage from './pages/MinaSokningarPage';
import MinProfilPage from './pages/MinProfilPage';
import VaraAnnonserPage from './pages/VaraAnnonserPage';
import SkapaAnnonsPage from './pages/SkapaAnnonsPage';
import ForetagsprofilPage from './pages/ForetagsprofilPage';
import StudenterPage from './pages/StudenterPage';
import SkolprofilPage from './pages/SkolprofilPage';

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
                    {/* Authenticated routes */}
                    <Route path="/mina-sokningar" element={<MinaSokningarPage />} />
                    <Route path="/min-profil" element={<MinProfilPage />} />
                    <Route path="/vara-annonser" element={<VaraAnnonserPage />} />
                    <Route path="/skapa-annons" element={<SkapaAnnonsPage />} />
                    <Route path="/foretagsprofil" element={<ForetagsprofilPage />} />
                    <Route path="/studenter" element={<StudenterPage />} />
                    <Route path="/skolprofil" element={<SkolprofilPage />} />
                </Routes>
            </main>
            <Footer />
        </>
    );
}

export default App;
