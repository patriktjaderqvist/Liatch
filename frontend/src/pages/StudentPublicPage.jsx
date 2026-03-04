import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStudent } from '../lib/studentApi';

export default function StudentPublicPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError('Du måste vara inloggad.');
            setIsLoading(false);
            return;
        }
        fetchStudent(id, accessToken)
            .then(setStudent)
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) {
        return (
            <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
                <p className="text-text-muted">Laddar profil...</p>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
                <p className="text-sm text-red-400">{error || 'Studenten hittades inte.'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-sm text-accent hover:underline"
                >
                    ← Tillbaka
                </button>
            </div>
        );
    }

    const p = student.profile;
    const hasProfileContent = p && (p.headline || p.bio || p.city || p.phone || p.linkedin_url || p.github_url || p.portfolio_url || p.cv_url);

    return (
        <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 mb-8 text-sm transition-colors text-text-dim hover:text-text-main"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Tillbaka
            </button>

            {/* Header */}
            <div className="mb-8">
                <h1 className="mb-1 text-4xl font-bold font-display text-text-main">
                    {student.first_name} {student.last_name}
                </h1>
                {student.program && (
                    <p className="text-lg font-medium text-accent">{student.program}</p>
                )}
                {p?.headline && (
                    <p className="mt-1 text-text-muted">{p.headline}</p>
                )}
            </div>

            {!hasProfileContent && (
                <div className="p-6 text-center glass-card rounded-xl">
                    <p className="text-text-dim">Den här studenten har inte fyllt i sin profil än.</p>
                </div>
            )}

            {hasProfileContent && (
                <>
                    {/* Om mig */}
                    {(p.bio || p.city || p.phone) && (
                        <div className="p-6 mb-6 glass-card rounded-xl">
                            <h2 className="mb-4 text-base font-bold text-text-main">Om mig</h2>
                            {p.bio && (
                                <p className="mb-4 leading-relaxed whitespace-pre-wrap text-text-muted">{p.bio}</p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm text-text-dim">
                                {p.city && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {p.city}
                                    </span>
                                )}
                                {p.phone && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {p.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Länkar */}
                    {(p.linkedin_url || p.github_url || p.portfolio_url || p.cv_url) && (
                        <div className="p-6 glass-card rounded-xl">
                            <h2 className="mb-4 text-base font-bold text-text-main">Länkar</h2>
                            <div className="flex flex-col gap-2">
                                {p.linkedin_url && (
                                    <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer"
                                        className="text-sm truncate text-accent hover:underline">
                                        LinkedIn
                                    </a>
                                )}
                                {p.github_url && (
                                    <a href={p.github_url} target="_blank" rel="noopener noreferrer"
                                        className="text-sm truncate text-accent hover:underline">
                                        GitHub
                                    </a>
                                )}
                                {p.portfolio_url && (
                                    <a href={p.portfolio_url} target="_blank" rel="noopener noreferrer"
                                        className="text-sm truncate text-accent hover:underline">
                                        Portfolio
                                    </a>
                                )}
                                {p.cv_url && (
                                    <a href={p.cv_url} target="_blank" rel="noopener noreferrer"
                                        className="text-sm truncate text-accent hover:underline">
                                        CV
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
