import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJobAds } from '../lib/jobAdsApi';

function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function AdCard({ ad }) {
    return (
        <Link to={`/annonser/${ad.id}`} className="flex flex-col gap-3 p-6 transition-colors cursor-pointer glass-card rounded-2xl hover:border-accent/30">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-bold leading-snug text-text-main">{ad.title}</h2>
                {ad.remote && (
                    <span className="px-2 py-1 text-xs font-semibold border rounded-full shrink-0 bg-accent/10 text-accent border-accent/20">
                        Distans
                    </span>
                )}
            </div>

            <p className="text-sm font-medium text-accent">{ad.company.name}</p>

            <div className="flex flex-wrap gap-3 text-xs text-text-dim">
                {ad.location && (
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {ad.location}
                    </span>
                )}
                {ad.employment_type && (
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {ad.employment_type}
                    </span>
                )}
                {ad.application_deadline && (
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Sök senast {formatDate(ad.application_deadline)}
                    </span>
                )}
            </div>

            <p className="text-sm leading-relaxed text-text-muted line-clamp-3">
                {ad.description}
            </p>
        </Link>
    );
}

export default function AdsPage() {
    const [ads, setAds] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJobAds()
            .then((data) => {
                setAds(data);
                setFiltered(data);
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        const q = search.toLowerCase().trim();
        if (!q) {
            setFiltered(ads);
            return;
        }
        setFiltered(
            ads.filter(
                (ad) =>
                    ad.title.toLowerCase().includes(q) ||
                    ad.company.name.toLowerCase().includes(q) ||
                    (ad.location && ad.location.toLowerCase().includes(q))
            )
        );
    }, [search, ads]);

    return (
        <div className="px-6 pt-32 pb-20 mx-auto max-w-7xl">
            <div className="mb-10">
                <h1 className="mb-2 text-4xl font-bold font-display text-text-main">Praktikannonser</h1>
                <p className="text-text-muted">Hitta din nästa LIA-plats bland aktiva annonser.</p>
            </div>

            {/* Sökfält */}
            <div className="max-w-lg mb-8">
                <div className="relative">
                    <div className="absolute inset-y-0 flex items-center pointer-events-none left-4">
                        <svg className="w-4 h-4 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Sök på titel, företag eller stad..."
                        className="w-full py-3 pl-10 pr-4 transition-all border rounded-xl bg-fg/5 border-fg/10 text-text-main placeholder-text-dim focus:outline-none focus:border-accent/50 focus:bg-fg/10"
                    />
                </div>
            </div>

            {/* Innehåll */}
            {isLoading && (
                <p className="text-text-muted">Laddar annonser...</p>
            )}

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}

            {!isLoading && !error && filtered.length === 0 && (
                <p className="text-text-muted">
                    {search ? 'Inga annonser matchar din sökning.' : 'Det finns inga aktiva annonser just nu.'}
                </p>
            )}

            {!isLoading && !error && filtered.length > 0 && (
                <>
                    <p className="mb-4 text-xs text-text-dim">{filtered.length} annons{filtered.length !== 1 ? 'er' : ''}</p>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((ad) => (
                            <AdCard key={ad.id} ad={ad} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
