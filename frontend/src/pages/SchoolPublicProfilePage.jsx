import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSchoolByPublicId } from '../lib/schoolApi';

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

export default function SchoolPublicProfilePage() {
    const { publicId } = useParams();
    const [school, setSchool] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSchoolByPublicId(publicId)
            .then((data) => setSchool(data))
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [publicId]);

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

    return (
        <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
            <div className="mb-8">
                <h1 className="mb-1 text-4xl font-bold font-display text-text-main">{school.name}</h1>
                {school.city && <p className="text-text-muted">{school.city}</p>}
            </div>

            <div className="flex flex-col gap-6">
                {school.description && (
                    <div className="p-6 glass-card rounded-2xl">
                        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Om skolan</h2>
                        <p className="text-sm leading-relaxed text-text-muted">{school.description}</p>
                    </div>
                )}

                {(school.website || school.city) && (
                    <div className="p-6 glass-card rounded-2xl">
                        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Kontakt & info</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {school.city && (
                                <div>
                                    <p className="text-xs text-text-dim mb-0.5">Stad</p>
                                    <p className="text-sm text-text-main">{school.city}</p>
                                </div>
                            )}
                            {school.website && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-text-dim mb-0.5">Webbplats</p>
                                    <LinkRow href={school.website} label={school.website} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
