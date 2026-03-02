import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchJobAd } from '../lib/jobAdsApi';
import { createApplication } from '../lib/applicationsApi';

function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function JobAdPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ad, setAd] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const userRole = localStorage.getItem('userRole');
    const [coverLetter, setCoverLetter] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [applyError, setApplyError] = useState('');
    const [applySuccess, setApplySuccess] = useState(false);

    useEffect(() => {
        fetchJobAd(id)
            .then(setAd)
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [id]);

    const handleApply = async () => {
        setApplyError('');
        setIsApplying(true);
        const accessToken = localStorage.getItem('accessToken');
        try {
            await createApplication(Number(id), coverLetter, accessToken);
            setApplySuccess(true);
        } catch (err) {
            setApplyError(err.message);
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
                <p className="text-text-muted">Laddar annons...</p>
            </div>
        );
    }

    if (error || !ad) {
        return (
            <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
                <p className="text-sm text-red-400">{error || 'Annonsen hittades inte.'}</p>
                <button
                    onClick={() => navigate('/annonser')}
                    className="mt-4 text-sm text-accent hover:underline"
                >
                    ← Tillbaka till annonser
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
            {/* Tillbaka */}
            <button
                onClick={() => navigate('/annonser')}
                className="flex items-center gap-1 mb-8 text-sm transition-colors text-text-dim hover:text-text-main"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Alla annonser
            </button>

            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {ad.remote && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                            Distans
                        </span>
                    )}
                    {ad.employment_type && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-fg/5 text-text-dim border border-fg/10">
                            {ad.employment_type}
                        </span>
                    )}
                </div>
                <h1 className="mb-2 text-4xl font-bold font-display text-text-main">{ad.title}</h1>
                <p className="text-lg font-medium text-accent">{ad.company?.name}</p>
                {ad.location && (
                    <p className="flex items-center gap-1 mt-1 text-sm text-text-dim">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {ad.location}
                    </p>
                )}
            </div>

            {/* Datum-info */}
            {(ad.application_deadline || ad.starts_at || ad.ends_at) && (
                <div className="grid grid-cols-1 gap-4 p-5 mb-8 text-sm glass-card rounded-xl sm:grid-cols-3">
                    {ad.application_deadline && (
                        <div>
                            <p className="text-text-dim mb-0.5">Sista ansökningsdag</p>
                            <p className="font-medium text-text-main">{formatDate(ad.application_deadline)}</p>
                        </div>
                    )}
                    {ad.starts_at && (
                        <div>
                            <p className="text-text-dim mb-0.5">Startdatum</p>
                            <p className="font-medium text-text-main">{formatDate(ad.starts_at)}</p>
                        </div>
                    )}
                    {ad.ends_at && (
                        <div>
                            <p className="text-text-dim mb-0.5">Slutdatum</p>
                            <p className="font-medium text-text-main">{formatDate(ad.ends_at)}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Beskrivning */}
            <div className="p-6 mb-8 glass-card rounded-xl">
                <h2 className="mb-4 text-lg font-bold text-text-main">Om rollen</h2>
                <p className="leading-relaxed whitespace-pre-wrap text-text-muted">{ad.description}</p>
            </div>

            {/* Sök tjänsten – bara för studenter */}
            {userRole === 'privatperson' && !applySuccess && (
                <div className="p-6 mb-8 glass-card rounded-xl">
                    <h2 className="mb-1 text-lg font-bold text-text-main">Sök tjänsten</h2>
                    <p className="mb-4 text-sm text-text-dim">Skicka din ansökan direkt till {ad.company?.name}.</p>
                    <div className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-text-main">
                            Personligt brev <span className="font-normal text-text-dim">(valfritt)</span>
                        </label>
                        <textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            rows={5}
                            className="w-full px-3 py-2 border rounded-lg resize-y bg-bg-elevated border-fg/15 text-text-main placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="Berätta varför du är rätt kandidat..."
                        />
                    </div>
                    {applyError && <p className="mb-3 text-sm text-red-400">{applyError}</p>}
                    <button
                        onClick={handleApply}
                        disabled={isApplying}
                        className="w-full py-2.5 text-sm font-bold text-white rounded-lg bg-accent hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(255,77,0,0.3)] disabled:opacity-60 transition-all"
                    >
                        {isApplying ? 'Skickar...' : 'Skicka ansökan'}
                    </button>
                </div>
            )}

            {applySuccess && (
                <div className="p-6 mb-8 border glass-card rounded-xl border-green-500/20 bg-green-500/5">
                    <p className="font-medium text-green-400">Ansökan skickad!</p>
                    <p className="mt-1 text-sm text-text-dim">
                        Du kan följa statusen under{' '}
                        <Link to="/mina-sokningar" className="text-accent hover:underline">
                            Mina ansökningar
                        </Link>.
                    </p>
                </div>
            )}
        </div>
    );
}
