import React, { useEffect, useState } from 'react';
import { fetchMyCompany, updateMyCompany } from '../lib/companyApi';

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

export default function ForetagsprofilPage() {
    const [company, setCompany] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Formulärfält
    const [name, setName] = useState('');
    const [organizationNumber, setOrganizationNumber] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');

    const populateForm = (c) => {
        setName(c.name ?? '');
        setOrganizationNumber(c.organization_number ?? '');
        setEmail(c.email ?? '');
        setCity(c.city ?? '');
        setPostalCode(c.postal_code ?? '');
        setWebsite(c.website ?? '');
        setDescription(c.description ?? '');
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Du måste vara inloggad för att se företagsprofilen.');
            setIsLoading(false);
            return;
        }
        fetchMyCompany(token)
            .then((data) => {
                setCompany(data);
                populateForm(data);
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const handleEdit = () => {
        setSaveError('');
        setIsEditing(true);
    };

    const handleCancel = () => {
        populateForm(company);
        setSaveError('');
        setIsEditing(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveError('');
        setIsSaving(true);
        const token = localStorage.getItem('accessToken');

        try {
            const updated = await updateMyCompany(
                {
                    name: name || null,
                    organization_number: organizationNumber || null,
                    email: email || null,
                    city: city || null,
                    postal_code: postalCode || null,
                    website: website || null,
                    description: description || null,
                },
                token
            );
            setCompany(updated);
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
                <p className="text-text-muted">Laddar företagsprofil...</p>
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

    return (
        <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="mb-1 text-4xl font-bold font-display text-text-main">Företagsprofil</h1>
                    {company.city && <p className="text-text-muted">{company.city}</p>}
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

            {/* Visningsläge */}
            {!isEditing && (
                <div className="flex flex-col gap-6">
                    {/* Företagsinfo */}
                    <div className="p-6 glass-card rounded-2xl">
                        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Företagsinfo</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <InfoRow label="Företagsnamn" value={company.name} />
                            <InfoRow label="Organisationsnummer" value={company.organization_number} />
                            <InfoRow label="Stad" value={company.city} />
                            <InfoRow label="Postnummer" value={company.postal_code} />
                            <InfoRow label="E-post" value={company.email} />
                        </div>
                    </div>

                    {/* Om företaget */}
                    {company.description && (
                        <div className="p-6 glass-card rounded-2xl">
                            <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Om företaget</h2>
                            <p className="text-sm leading-relaxed text-text-muted">{company.description}</p>
                        </div>
                    )}

                    {/* Webbplats */}
                    {company.website && (
                        <div className="p-6 glass-card rounded-2xl">
                            <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Webbplats</h2>
                            <LinkRow href={company.website} label={company.website} />
                        </div>
                    )}
                </div>
            )}

            {/* Redigeringsläge */}
            {isEditing && (
                <form onSubmit={handleSave} className="flex flex-col gap-6">
                    {/* Företagsinfo */}
                    <div className="p-6 border rounded-2xl bg-bg-elevated border-fg/10">
                        <h2 className="mb-5 text-sm font-semibold tracking-wider uppercase text-text-dim">Företagsinfo</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Företagsnamn</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={inputClass}
                                    placeholder="Företagets namn"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Organisationsnummer</label>
                                <input
                                    type="text"
                                    value={organizationNumber}
                                    onChange={(e) => setOrganizationNumber(e.target.value)}
                                    className={inputClass}
                                    placeholder="556XXX-XXXX"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>E-post</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass}
                                    placeholder="kontakt@foretag.se"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Stad</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className={inputClass}
                                    placeholder="t.ex. Stockholm"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Postnummer</label>
                                <input
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    className={inputClass}
                                    placeholder="123 45"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Webbplats</label>
                                <input
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className={inputClass}
                                    placeholder="https://ert-foretag.se"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Om företaget */}
                    <div className="p-6 border rounded-2xl bg-bg-elevated border-fg/10">
                        <h2 className="mb-5 text-sm font-semibold tracking-wider uppercase text-text-dim">Om företaget</h2>
                        <div>
                            <label className={labelClass}>Beskrivning</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                className={`${inputClass} resize-y`}
                                placeholder="Berätta om ert företag, vad ni gör och varför studenter ska söka till er..."
                            />
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
