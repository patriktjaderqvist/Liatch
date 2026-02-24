import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJobAd } from '../lib/jobAdsApi';

export default function SkapaAnnonsPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [employmentType, setEmploymentType] = useState('LIA');
    const [remote, setRemote] = useState(false);
    const [applicationDeadline, setApplicationDeadline] = useState('');
    const [startsAt, setStartsAt] = useState('');
    const [endsAt, setEndsAt] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setErrorMessage('Du måste vara inloggad för att skapa en annons.');
            setIsSubmitting(false);
            return;
        }

        const payload = {
            title,
            description,
            location: location || null,
            employment_type: employmentType || null,
            remote,
            application_deadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
            starts_at: startsAt ? new Date(startsAt).toISOString() : null,
            ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        };

        try {
            await createJobAd(payload, accessToken);
            navigate('/vara-annonser');
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full px-3 py-2 border rounded-lg bg-bg-elevated border-fg/15 text-text-main placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-accent";
    const labelClass = "block mb-1 text-sm font-medium text-text-main";

    return (
        <div className="max-w-2xl px-6 pt-32 pb-20 mx-auto">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold font-display text-text-main">Skapa annons</h1>
                <p className="text-text-muted">Publicera en ny praktikannons för studenter att söka.</p>
            </div>

            <div className="p-6 border shadow-lg rounded-2xl bg-bg-elevated border-fg/10">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Titel */}
                    <div>
                        <label className={labelClass}>Titel *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="t.ex. LIA Frontend Developer (React)"
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Beskrivning */}
                    <div>
                        <label className={labelClass}>Beskrivning *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Beskriv rollen, arbetsuppgifter och vad ni letar efter..."
                            required
                            rows={5}
                            className={`${inputClass} resize-y`}
                        />
                    </div>

                    {/* Plats + Anställningstyp */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Stad / Plats</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="t.ex. Stockholm"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Anställningstyp</label>
                            <select
                                value={employmentType}
                                onChange={(e) => setEmploymentType(e.target.value)}
                                className={inputClass}
                            >
                                <option value="LIA">LIA</option>
                                <option value="Praktik">Praktik</option>
                                <option value="Deltid">Deltid</option>
                                <option value="Heltid">Heltid</option>
                            </select>
                        </div>
                    </div>

                    {/* Distansarbete */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="remote"
                            checked={remote}
                            onChange={(e) => setRemote(e.target.checked)}
                            className="w-4 h-4 rounded accent-accent"
                        />
                        <label htmlFor="remote" className="text-sm font-medium cursor-pointer text-text-main">
                            Distansarbete möjligt
                        </label>
                    </div>

                    {/* Datum */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label className={labelClass}>Sista ansökningsdag</label>
                            <input
                                type="date"
                                value={applicationDeadline}
                                onChange={(e) => setApplicationDeadline(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Startdatum</label>
                            <input
                                type="date"
                                value={startsAt}
                                onChange={(e) => setStartsAt(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Slutdatum</label>
                            <input
                                type="date"
                                value={endsAt}
                                onChange={(e) => setEndsAt(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {errorMessage && (
                        <p className="text-sm text-red-400">{errorMessage}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 text-sm font-bold text-white rounded-lg bg-accent hover:bg-accent/90 focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-60 transition-all"
                        >
                            {isSubmitting ? 'Publicerar...' : 'Publicera annons'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/vara-annonser')}
                            className="px-5 py-2.5 text-sm font-medium text-text-muted hover:text-text-main rounded-lg border border-fg/10 hover:border-fg/20 transition-all"
                        >
                            Avbryt
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
