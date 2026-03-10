import React, { useEffect, useState } from 'react';
import { fetchMySchool, updateMySchool } from '../lib/schoolApi';

const inputClass =
    'w-full px-3 py-2 border rounded-lg bg-bg-elevated border-fg/15 text-text-main placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-accent';
const labelClass = 'block mb-1 text-sm font-medium text-text-main';

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
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [website, setWebsite] = useState('');
    const [email, setEmail] = useState('');

    const populateForm = (s) => {
        setName(s.name ?? '');
        setDescription(s.description ?? '');
        setCity(s.city ?? '');
        setPostalCode(s.postal_code ?? '');
        setWebsite(s.website ?? '');
        setEmail(s.email ?? '');
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Du måste vara inloggad för att se skolprofilen.');
            setIsLoading(false);
            return;
        }

        fetchMySchool(token)
            .then((data) => {
                setSchool(data);
                populateForm(data);
            })
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

    const handleEdit = () => {
        setSaveError('');
        setIsEditing(true);
    };

    const handleCancel = () => {
        populateForm(school);
        setSaveError('');
        setIsEditing(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveError('');
        setIsSaving(true);
        const token = localStorage.getItem('accessToken');
        try {
            const updated = await updateMySchool(
                {
                    name: name || undefined,
                    description: description || null,
                    city: city || null,
                    postal_code: postalCode || null,
                    website: website || null,
                    email: email || null,
                },
                token
            );
            setSchool(updated);
            populateForm(updated);
            setIsEditing(false);
        } catch (err) {
            setSaveError(err.message);
        } finally {
            setIsSaving(false);
        }
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
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="mb-1 text-4xl font-bold font-display text-text-main">Skolprofil</h1>
                    {school.city && <p className="text-text-muted">{school.city}</p>}
                </div>
                {!isEditing && (
                    <button
                        onClick={handleEdit}
                        className="shrink-0 px-5 py-2.5 text-sm font-bold border border-fg/15 hover:border-accent/50 text-text-muted hover:text-accent rounded-lg transition-all"
                    >
                        Redigera profil
                    </button>
                )}
            </div>

            {!isEditing && (
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
            )}

            {isEditing && (
                <form onSubmit={handleSave} className="flex flex-col gap-6">
                    <div className="p-6 border rounded-2xl bg-bg-elevated border-fg/10">
                        <h2 className="mb-5 text-sm font-semibold tracking-wider uppercase text-text-dim">Skolinfo</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Skolnamn</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Skolans namn" required />
                            </div>
                            <div>
                                <label className={labelClass}>Stad</label>
                                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="t.ex. Stockholm" />
                            </div>
                            <div>
                                <label className={labelClass}>Postnummer</label>
                                <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputClass} placeholder="t.ex. 111 11" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>E-post</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="kontakt@skolan.se" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Webbplats</label>
                                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} placeholder="https://skolan.se" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Om skolan</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={`${inputClass} resize-y`} placeholder="Berätta om skolan..." />
                            </div>
                        </div>
                    </div>

                    {saveError && <p className="text-sm text-red-400">{saveError}</p>}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-2.5 text-sm font-bold text-white rounded-lg bg-accent hover:bg-accent/90 disabled:opacity-60 transition-all"
                        >
                            {isSaving ? 'Sparar...' : 'Spara ändringar'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-5 py-2.5 text-sm font-medium text-text-muted hover:text-text-main rounded-lg border border-fg/10 hover:border-fg/20 transition-all"
                        >
                            Avbryt
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
