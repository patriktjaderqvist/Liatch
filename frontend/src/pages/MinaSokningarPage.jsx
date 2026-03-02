import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyApplications, withdrawApplication } from '../lib/applicationsApi';

function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
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

function ApplicationRow({ application, onWithdraw }) {
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const canWithdraw = application.status === 'submitted' || application.status === 'under_review';

    const handleWithdraw = async () => {
        setIsWithdrawing(true);
        setConfirming(false);
        try {
            await onWithdraw(application.id);
        } finally {
            setIsWithdrawing(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 p-5 glass-card rounded-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link
                            to={`/annonser/${application.job_ad_id}`}
                            className="text-base font-bold truncate transition-colors text-text-main hover:text-accent"
                        >
                            {application.job_ad.title}
                        </Link>
                        <StatusBadge status={application.status} />
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-text-dim">
                        <span>{application.job_ad.company.name}</span>
                        <span>Sökt {formatDate(application.created_at)}</span>
                    </div>
                </div>

                {canWithdraw && !confirming && (
                    <button
                        onClick={() => setConfirming(true)}
                        className="px-4 py-2 text-sm font-medium transition-all border rounded-lg shrink-0 text-text-dim hover:text-text-main border-fg/10 hover:border-fg/20"
                    >
                        Dra tillbaka ansökan
                    </button>
                )}
            </div>

            {confirming && (
                <div className="flex items-center gap-3 pt-1 border-t border-fg/10">
                    <p className="flex-1 text-sm text-text-muted">Är du säker på att du vill dra tillbaka ansökan?</p>
                    <button
                        onClick={handleWithdraw}
                        disabled={isWithdrawing}
                        className="px-4 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all disabled:opacity-50"
                    >
                        {isWithdrawing ? 'Drar tillbaka...' : 'Ja, dra tillbaka'}
                    </button>
                    <button
                        onClick={() => setConfirming(false)}
                        className="px-4 py-1.5 text-sm font-medium text-text-dim hover:text-text-main border border-fg/10 hover:border-fg/20 rounded-lg transition-all"
                    >
                        Avbryt
                    </button>
                </div>
            )}
        </div>
    );
}

export default function MinaSokningarPage() {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [withdrawError, setWithdrawError] = useState('');

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError('Du måste vara inloggad för att se dina ansökningar.');
            setIsLoading(false);
            return;
        }
        fetchMyApplications(accessToken)
            .then(setApplications)
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const handleWithdraw = async (id) => {
        const accessToken = localStorage.getItem('accessToken');
        setWithdrawError('');
        try {
            const updated = await withdrawApplication(id, accessToken);
            setApplications((prev) =>
                prev.map((a) => (a.id === id ? updated : a))
            );
        } catch (err) {
            setWithdrawError(err.message);
        }
    };

    return (
        <div className="max-w-4xl px-6 pt-32 pb-20 mx-auto">
            <div className="mb-10">
                <h1 className="mb-2 text-4xl font-bold font-display text-text-main">Mina ansökningar</h1>
                <p className="text-text-muted">Följ status på dina inskickade ansökningar.</p>
            </div>

            {isLoading && <p className="text-text-muted">Laddar ansökningar...</p>}

            {error && <p className="text-sm text-red-400">{error}</p>}

            {withdrawError && <p className="text-sm text-red-400">{withdrawError}</p>}

            {!isLoading && !error && applications.length === 0 && (
                <div className="py-16 text-center border border-fg/10 rounded-2xl">
                    <p className="mb-4 text-text-muted">Du har inte sökt några tjänster än.</p>
                    <Link
                        to="/annonser"
                        className="inline-block bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
                    >
                        Bläddra bland annonser
                    </Link>
                </div>
            )}

            {!isLoading && !error && applications.length > 0 && (
                <>
                    <p className="mb-4 text-xs text-text-dim">
                        {applications.length} ansökan{applications.length !== 1 ? 'ar' : ''}
                    </p>
                    <div className="flex flex-col gap-3">
                        {applications.map((app) => (
                            <ApplicationRow key={app.id} application={app} onWithdraw={handleWithdraw} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
