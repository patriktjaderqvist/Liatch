import React, { useEffect, useState } from 'react';
import { fetchMyStudent, updateMyProfile, updateMyStudent } from '../lib/studentApi';

const inputClass =
    'w-full px-3 py-2 border rounded-lg bg-bg-elevated border-fg/15 text-text-main placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-accent';
const labelClass = 'block mb-1 text-sm font-medium text-text-main';

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

function InfoRow({ label, value }) {
    if (!value) return null;
    return (
        <div>
            <p className="text-xs text-text-dim mb-0.5">{label}</p>
            <p className="text-sm text-text-main">{value}</p>
        </div>
    );
}

export default function MinProfilPage() {
    const [student, setStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [copyStatus, setCopyStatus] = useState('');

    // Form state – grundinfo
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [program, setProgram] = useState('');

    // Form state – profil
    const [headline, setHeadline] = useState('');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [cvUrl, setCvUrl] = useState('');

    const populateForm = (s) => {
        setFirstName(s.first_name ?? '');
        setLastName(s.last_name ?? '');
        setProgram(s.program ?? '');
        const p = s.profile;
        setHeadline(p?.headline ?? '');
        setBio(p?.bio ?? '');
        setPhone(p?.phone ?? '');
        setCity(p?.city ?? '');
        setLinkedinUrl(p?.linkedin_url ?? '');
        setGithubUrl(p?.github_url ?? '');
        setPortfolioUrl(p?.portfolio_url ?? '');
        setCvUrl(p?.cv_url ?? '');
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Du måste vara inloggad för att se din profil.');
            setIsLoading(false);
            return;
        }
        fetchMyStudent(token)
            .then((data) => {
                setStudent(data);
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
        populateForm(student);
        setSaveError('');
        setIsEditing(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveError('');
        setIsSaving(true);
        const token = localStorage.getItem('accessToken');

        try {
            const updatedStudent = await updateMyStudent(
                { first_name: firstName, last_name: lastName, program: program || null },
                token
            );
            await updateMyProfile(
                {
                    headline: headline || null,
                    bio: bio || null,
                    phone: phone || null,
                    city: city || null,
                    linkedin_url: linkedinUrl || null,
                    github_url: githubUrl || null,
                    portfolio_url: portfolioUrl || null,
                    cv_url: cvUrl || null,
                },
                token
            );
            // Fetch fresh data to get updated profile
            const fresh = await fetchMyStudent(token);
            setStudent(fresh);
            populateForm(fresh);
            setIsEditing(false);
        } catch (err) {
            setSaveError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyPublicId = async () => {
        if (!student?.public_id) return;
        try {
            await navigator.clipboard.writeText(student.public_id);
            setCopyStatus('Kopierat');
        } catch {
            setCopyStatus('Kunde inte kopiera');
        }
        setTimeout(() => setCopyStatus(''), 2000);
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
                <p className="text-text-muted">Laddar profil...</p>
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

    const p = student?.profile;
    const displayName = `${student.first_name} ${student.last_name}`.trim();
    const schoolName = student?.school?.name || 'Ingen skola kopplad';
    const publicProfileUrl =
        typeof window !== 'undefined' && student?.public_id
            ? `${window.location.origin}/student/${student.public_id}`
            : '';

    return (
        <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="mb-1 text-4xl font-bold font-display text-text-main">Min profil</h1>
                    {p?.headline && <p className="text-text-muted">{p.headline}</p>}
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
                    {/* Grundinfo */}
                    <div className="p-6 glass-card rounded-2xl">
                        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Grundinfo</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <InfoRow label="Namn" value={displayName} />
                            <InfoRow label="Program" value={student.program} />
                            <div>
                                <p className="text-xs text-text-dim mb-0.5">Skola</p>
                                <p className="text-sm text-text-main">{schoolName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-dim mb-0.5">Student-ID</p>
                                <div className="flex items-center gap-2">
                                    <code className="px-2 py-1 text-xs rounded bg-bg-elevated text-text-main">{student.public_id || '-'}</code>
                                    <button
                                        type="button"
                                        onClick={handleCopyPublicId}
                                        disabled={!student.public_id}
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
                                    <a
                                        href={publicProfileUrl}
                                        className="text-sm break-all text-accent hover:underline"
                                    >
                                        {publicProfileUrl}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Om mig */}
                    {(p?.bio || p?.city || p?.phone) && (
                        <div className="p-6 glass-card rounded-2xl">
                            <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Om mig</h2>
                            <div className="flex flex-col gap-4">
                                {p?.bio && <p className="text-sm leading-relaxed text-text-muted">{p.bio}</p>}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <InfoRow label="Stad" value={p?.city} />
                                    <InfoRow label="Telefon" value={p?.phone} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Länkar */}
                    {(p?.linkedin_url || p?.github_url || p?.portfolio_url || p?.cv_url) && (
                        <div className="p-6 glass-card rounded-2xl">
                            <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Länkar</h2>
                            <div className="flex flex-col gap-2">
                                <LinkRow href={p?.linkedin_url} label="LinkedIn" />
                                <LinkRow href={p?.github_url} label="GitHub" />
                                <LinkRow href={p?.portfolio_url} label="Portfolio" />
                                <LinkRow href={p?.cv_url} label="CV" />
                            </div>
                        </div>
                    )}

                    {!p && (
                        <p className="text-sm text-text-dim">
                            Du har inte fyllt i din profil än. Klicka på "Redigera profil" för att komma igång.
                        </p>
                    )}
                </div>
            )}

            {/* Redigeringsläge */}
            {isEditing && (
                <form onSubmit={handleSave} className="flex flex-col gap-6">
                    {/* Grundinfo */}
                    <div className="p-6 border rounded-2xl bg-bg-elevated border-fg/10">
                        <h2 className="mb-5 text-sm font-semibold tracking-wider uppercase text-text-dim">Grundinfo</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Förnamn</label>
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} placeholder="Förnamn" />
                            </div>
                            <div>
                                <label className={labelClass}>Efternamn</label>
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} placeholder="Efternamn" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Program / Utbildning</label>
                                <input type="text" value={program} onChange={(e) => setProgram(e.target.value)} className={inputClass} placeholder="t.ex. Frontend Developer" />
                            </div>
                        </div>
                    </div>

                    {/* Profilinformation */}
                    <div className="p-6 border rounded-2xl bg-bg-elevated border-fg/10">
                        <h2 className="mb-5 text-sm font-semibold tracking-wider uppercase text-text-dim">Profilinformation</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className={labelClass}>Rubrik</label>
                                <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputClass} placeholder="t.ex. Frontend-student med fokus på React" />
                            </div>
                            <div>
                                <label className={labelClass}>Om mig</label>
                                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className={`${inputClass} resize-y`} placeholder="Berätta lite om dig själv..." />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Stad</label>
                                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="t.ex. Stockholm" />
                                </div>
                                <div>
                                    <label className={labelClass}>Telefon</label>
                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+46 70 000 00 00" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Länkar */}
                    <div className="p-6 border rounded-2xl bg-bg-elevated border-fg/10">
                        <h2 className="mb-5 text-sm font-semibold tracking-wider uppercase text-text-dim">Länkar</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className={labelClass}>LinkedIn</label>
                                <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/ditt-namn" />
                            </div>
                            <div>
                                <label className={labelClass}>GitHub</label>
                                <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={inputClass} placeholder="https://github.com/ditt-namn" />
                            </div>
                            <div>
                                <label className={labelClass}>Portfolio</label>
                                <input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className={inputClass} placeholder="https://din-portfolio.se" />
                            </div>
                            <div>
                                <label className={labelClass}>CV (länk)</label>
                                <input type="url" value={cvUrl} onChange={(e) => setCvUrl(e.target.value)} className={inputClass} placeholder="https://länk-till-cv.pdf" />
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
