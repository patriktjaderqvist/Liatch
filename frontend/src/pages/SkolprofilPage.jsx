import React, { useEffect, useState } from 'react';
import { fetchMySchool } from '../lib/schoolApi';

function InfoRow({ label, value }) {
    if (!value) return null;
    return (
        <div>
            <p className="text-xs text-text-dim mb-0.5">{label}</p>
            <p className="text-sm text-text-main">{value}</p>
        </div>
    );
}

function LinkRow({ href, label }) {
    if (!href) return null;
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm truncate text-accent hover:underline"
        >
            {label}
        </a>
    );
}

export default function SkolprofilPage() {
    const [school, setSchool] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copyStatus, setCopyStatus] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Du måste vara inloggad för att se skolprofilen.');
            setIsLoading(false);
            return;
        }

        fetchMySchool(token)
            .then((data) => setSchool(data))
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const handleCopyPublicId = async () => {
        if (!school?.public_id) return;
        try {
            await navigator.clipboard.writeText(school.public_id);
            setCopyStatus('Kopierat');
        } catch {
            setCopyStatus('Kunde inte kopiera');
        }
        setTimeout(() => setCopyStatus(''), 2000);
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
                <p className="text-text-muted">Laddar skolprofil...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
                <p className="text-sm text-red-400">{error}</p>
            </div>
        );
    }

    const publicProfileUrl =
        typeof window !== 'undefined' && school?.public_id
            ? `${window.location.origin}/skola/${school.public_id}`
            : '';

    return (
        <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
            <div className="mb-8">
                <h1 className="mb-1 text-4xl font-bold font-display text-text-main">Skolprofil</h1>
                {school.city && <p className="text-text-muted">{school.city}</p>}
            </div>

            <div className="flex flex-col gap-6">
                <div className="p-6 glass-card rounded-2xl">
                    <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Skolinfo</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InfoRow label="Skolnamn" value={school.name} />
                        <InfoRow label="Organisationsnummer" value={school.organization_number} />
                        <InfoRow label="Stad" value={school.city} />
                        <InfoRow label="Postnummer" value={school.postal_code} />
                        <InfoRow label="E-post" value={school.email} />
                        <div className="sm:col-span-2">
                            <p className="text-xs text-text-dim mb-0.5">Skol-ID</p>
                            <div className="flex items-center gap-2">
                                <code className="px-2 py-1 text-xs rounded bg-bg-elevated text-text-main">{school.public_id || '-'}</code>
                                <button
                                    type="button"
                                    onClick={handleCopyPublicId}
                                    disabled={!school.public_id}
                                    className="text-xs font-medium text-accent hover:text-accent/80 disabled:opacity-50"
                                >
                                    Kopiera
                                </button>
                                {copyStatus && <span className="text-xs text-text-dim">{copyStatus}</span>}
                            </div>
                        </div>
                        {publicProfileUrl && (
                            <div className="sm:col-span-2">
                                <p className="text-xs text-text-dim mb-0.5">Publik profil-URL</p>
                                <a href={publicProfileUrl} className="text-sm break-all text-accent hover:underline">
                                    {publicProfileUrl}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {school.description && (
                    <div className="p-6 glass-card rounded-2xl">
                        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Om skolan</h2>
                        <p className="text-sm leading-relaxed text-text-muted">{school.description}</p>
                    </div>
                )}

                {school.website && (
                    <div className="p-6 glass-card rounded-2xl">
                        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Webbplats</h2>
                        <LinkRow href={school.website} label={school.website} />
                    </div>
                )}
            </div>
        </div>
    );
}
