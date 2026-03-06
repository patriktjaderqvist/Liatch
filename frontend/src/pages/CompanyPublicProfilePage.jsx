import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCompanyByPublicId } from '../lib/companyApi';

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

export default function CompanyPublicProfilePage() {
    const { publicId } = useParams();
    const [company, setCompany] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCompanyByPublicId(publicId)
            .then((data) => setCompany(data))
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [publicId]);

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
            <div className="mb-8">
                <h1 className="mb-1 text-4xl font-bold font-display text-text-main">{company.name}</h1>
                {company.city && <p className="text-text-muted">{company.city}</p>}
            </div>

            <div className="flex flex-col gap-6">
                {company.description && (
                    <div className="p-6 glass-card rounded-2xl">
                        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Om företaget</h2>
                        <p className="text-sm leading-relaxed text-text-muted">{company.description}</p>
                    </div>
                )}

                {(company.website || company.city) && (
                    <div className="p-6 glass-card rounded-2xl">
                        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Kontakt & info</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {company.city && (
                                <div>
                                    <p className="text-xs text-text-dim mb-0.5">Stad</p>
                                    <p className="text-sm text-text-main">{company.city}</p>
                                </div>
                            )}
                            {company.website && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-text-dim mb-0.5">Webbplats</p>
                                    <LinkRow href={company.website} label={company.website} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
