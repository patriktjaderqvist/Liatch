import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteJobAd, fetchMyJobAds } from '../lib/jobAdsApi';

function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function AdRow({ ad, onDelete }) {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm(`Är du säker på att du vill ta bort "${ad.title}"?`)) return;

        setIsDeleting(true);
        try {
            await onDelete(ad.id);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-5 glass-card rounded-xl sm:flex-row sm:items-center">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-bold truncate text-text-main">{ad.title}</h2>
                    <span
                        className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            ad.is_active
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-fg/5 text-text-dim border border-fg/10'
                        }`}
                    >
                        {ad.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                    {ad.remote && (
                        <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                            Distans
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-text-dim">
                    {ad.location && <span>{ad.location}</span>}
                    {ad.employment_type && <span>{ad.employment_type}</span>}
                    {ad.application_deadline && (
                        <span>Deadline: {formatDate(ad.application_deadline)}</span>
                    )}
                </div>
            </div>

            <div className="flex gap-2 shrink-0">
                <button
                    onClick={() => navigate(`/redigera-annons/${ad.id}`)}
                    className="px-4 py-2 text-sm font-medium transition-all border rounded-lg text-text-muted hover:text-text-main border-fg/10 hover:border-fg/20"
                >
                    Redigera
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-medium text-red-400 transition-all border rounded-lg hover:text-red-300 border-red-500/20 hover:border-red-500/40 disabled:opacity-50"
                >
                    {isDeleting ? 'Tar bort...' : 'Ta bort'}
                </button>
            </div>
        </div>
    );
}

export default function VaraAnnonserPage() {
    const [ads, setAds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError('Du måste vara inloggad för att se dina annonser.');
            setIsLoading(false);
            return;
        }

        fetchMyJobAds(accessToken)
            .then((data) => setAds(data))
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const handleDelete = async (id) => {
        const accessToken = localStorage.getItem('accessToken');
        try {
            await deleteJobAd(id, accessToken);
            setAds((prev) => prev.filter((ad) => ad.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="max-w-4xl px-6 pt-32 pb-20 mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="mb-2 text-4xl font-bold font-display text-text-main">Våra annonser</h1>
                    <p className="text-text-muted">Hantera ditt företags publicerade praktikannonser.</p>
                </div>
                <Link
                    to="/skapa-annons"
                    className="shrink-0 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(255,77,0,0.3)]"
                >
                    + Ny annons
                </Link>
            </div>

            {isLoading && (
                <p className="text-text-muted">Laddar annonser...</p>
            )}

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}

            {!isLoading && !error && ads.length === 0 && (
                <div className="py-16 text-center border border-fg/10 rounded-2xl">
                    <p className="mb-4 text-text-muted">Ni har inga annonser än.</p>
                    <Link
                        to="/skapa-annons"
                        className="inline-block bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
                    >
                        Skapa din första annons
                    </Link>
                </div>
            )}

            {!isLoading && !error && ads.length > 0 && (
                <>
                    <p className="mb-4 text-xs text-text-dim">{ads.length} annons{ads.length !== 1 ? 'er' : ''}</p>
                    <div className="flex flex-col gap-3">
                        {ads.map((ad) => (
                            <AdRow key={ad.id} ad={ad} onDelete={handleDelete} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
