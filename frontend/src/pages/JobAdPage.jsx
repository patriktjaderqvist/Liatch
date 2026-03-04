import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchJobAd } from '../lib/jobAdsApi';
import { createApplication, fetchMyApplications } from '../lib/applicationsApi';

function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

const STATUS_CONFIG = {
    submitted: { label: 'Inskickad', className: 'bg-fg/5 text-text-dim border-fg/10' },
    under_review: { label: 'Under granskning', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    accepted: { label: 'Accepterad', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
    rejected: { label: 'Avvisad', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
    withdrawn: { label: 'Återtagen', className: 'bg-fg/5 text-text-dim border-fg/10' },
};

function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-fg/5 text-text-dim border-fg/10' };
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${config.className}`}>
            {config.label}
        </span>
    );
}

export default function JobAdPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ad, setAd] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const userRole = localStorage.getItem('userRole');
    const [myApplication, setMyApplication] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [applyError, setApplyError] = useState('');

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const jobAdPromise = fetchJobAd(id);
        const appsPromise =
            userRole === 'privatperson' && accessToken
                ? fetchMyApplications(accessToken).catch(() => [])
                : Promise.resolve([]);

        Promise.all([jobAdPromise, appsPromise])
            .then(([adData, apps]) => {
                setAd(adData);
                const existing = apps.find(
                    (a) => a.job_ad_id === Number(id) && a.status !== 'withdrawn'
                );
                setMyApplication(existing || null);
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [id]);

    const handleApply = async () => {
        setApplyError('');
        setIsApplying(true);
        const accessToken = localStorage.getItem('accessToken');
        try {
            const application = await createApplication(Number(id), coverLetter, accessToken);
            setMyApplication(application);
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

    const isLongDescription = ad.description.length > 700;
    const visibleDescription =
        isLongDescription && !isDescriptionExpanded
            ? `${ad.description.slice(0, 700).trimEnd()}...`
            : ad.description;

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
                <p className="leading-relaxed whitespace-pre-wrap text-text-muted">{visibleDescription}</p>
                {isLongDescription && (
                    <button
                        type="button"
                        onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                        className="mt-4 text-sm font-semibold text-accent hover:underline"
                    >
                        {isDescriptionExpanded ? 'Visa mindre' : 'Visa hela annonsen'}
                    </button>
                )}
            </div>

            {/* Student: läsbar ansökningsvy om redan sökt */}
            {userRole === 'privatperson' && myApplication && (
                <div className="p-6 mb-8 glass-card rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-lg font-bold text-text-main">Din ansökan</h2>
                        <StatusBadge status={myApplication.status} />
                    </div>
                    <p className="mb-4 text-xs text-text-dim">
                        Skickad {formatDate(myApplication.created_at)}
                    </p>
                    {myApplication.cover_letter ? (
                        <div>
                            <p className="mb-1 text-sm font-medium text-text-main">Personligt brev</p>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-text-muted">
                                {myApplication.cover_letter}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm italic text-text-dim">Inget personligt brev skickat.</p>
                    )}
                    <p className="mt-4 text-xs text-text-dim">
                        Följ statusen under{' '}
                        <Link to="/mina-sokningar" className="text-accent hover:underline">
                            Mina ansökningar
                        </Link>.
                    </p>
                </div>
            )}

            {/* Student: sök-formulär om inte sökt (eller återtagen) */}
            {userRole === 'privatperson' && !myApplication && (
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
                        className="w-full py-2.5 text-sm font-bold text-white rounded-lg bg-accent hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] disabled:opacity-60 transition-all"
                    >
                        {isApplying ? 'Skickar...' : 'Skicka ansökan'}
                    </button>
                </div>
            )}
        </div>
    );
}
