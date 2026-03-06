import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchStudentByPublicId } from '../lib/studentApi';

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

export default function StudentPublicProfilePage() {
    const { publicId } = useParams();
    const [student, setStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStudentByPublicId(publicId)
            .then((data) => setStudent(data))
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [publicId]);

    if (isLoading) {
        return (
            <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
                <p className="text-text-muted">Laddar studentprofil...</p>
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

    const displayName = `${student.first_name} ${student.last_name}`.trim();
    const profile = student.profile;

    return (
        <div className="max-w-3xl px-6 pt-32 pb-20 mx-auto">
            <div className="mb-8">
                <h1 className="mb-1 text-4xl font-bold font-display text-text-main">{displayName}</h1>
                {profile?.headline && <p className="text-text-muted">{profile.headline}</p>}
            </div>

            <div className="flex flex-col gap-6">
                <div className="p-6 glass-card rounded-2xl">
                    <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Grundinfo</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs text-text-dim mb-0.5">Program</p>
                            <p className="text-sm text-text-main">{student.program || 'Ej angivet'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-dim mb-0.5">Skola</p>
                            <p className="text-sm text-text-main">{student.school?.name || 'Ingen skola kopplad'}</p>
                        </div>
                    </div>
                </div>

                {(profile?.bio || profile?.city) && (
                    <div className="p-6 glass-card rounded-2xl">
                        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Om studenten</h2>
                        {profile?.bio && <p className="text-sm leading-relaxed text-text-muted mb-4">{profile.bio}</p>}
                        {profile?.city && (
                            <div>
                                <p className="text-xs text-text-dim mb-0.5">Stad</p>
                                <p className="text-sm text-text-main">{profile.city}</p>
                            </div>
                        )}
                    </div>
                )}

                {(profile?.linkedin_url || profile?.github_url || profile?.portfolio_url || profile?.cv_url) && (
                    <div className="p-6 glass-card rounded-2xl">
                        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Länkar</h2>
                        <div className="flex flex-col gap-2">
                            <LinkRow href={profile?.linkedin_url} label="LinkedIn" />
                            <LinkRow href={profile?.github_url} label="GitHub" />
                            <LinkRow href={profile?.portfolio_url} label="Portfolio" />
                            <LinkRow href={profile?.cv_url} label="CV" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
