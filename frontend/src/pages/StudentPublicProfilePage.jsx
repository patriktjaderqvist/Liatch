import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchStudentByPublicId, fetchStudentContact } from '../lib/studentApi';
import { fetchSchoolStudentActivity } from '../lib/schoolApi';

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

function formatActivityDate(value) {
    if (!value) return '';
    try {
        return new Date(value).toLocaleString('sv-SE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

export default function StudentPublicProfilePage() {
    const { publicId } = useParams();
    const [student, setStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [contact, setContact] = useState(null);
    const [activity, setActivity] = useState(null);
    const [activityError, setActivityError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('userRole');

        fetchStudentByPublicId(publicId)
            .then((data) => {
                setStudent(data);
                if (role === 'foretag' && token) {
                    return fetchStudentContact(publicId, token);
                }
            })
            .then((contactData) => {
                if (contactData) setContact(contactData);
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));

        if (role === 'skola' && token) {
            fetchSchoolStudentActivity(publicId, token)
                .then((data) => setActivity(Array.isArray(data) ? data : []))
                .catch((err) => setActivityError(err.message));
        }
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
                        {profile?.bio && <p className="mb-4 text-sm leading-relaxed text-text-muted">{profile.bio}</p>}
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

                {contact && (contact.phone || contact.email) && (
                    <div className="p-6 glass-card rounded-2xl">
                        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Kontakt</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {contact.email && (
                                <div>
                                    <p className="text-xs text-text-dim mb-0.5">E-post</p>
                                    <a href={`mailto:${contact.email}`} className="text-sm text-accent hover:underline">{contact.email}</a>
                                </div>
                            )}
                            {contact.phone && (
                                <div>
                                    <p className="text-xs text-text-dim mb-0.5">Telefon</p>
                                    <a href={`tel:${contact.phone}`} className="text-sm text-accent hover:underline">{contact.phone}</a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activity !== null && (
                    <div className="p-6 glass-card rounded-2xl">
                        <h2 className="mb-4 text-sm font-semibold tracking-wider uppercase text-text-dim">Aktivitet</h2>
                        {activityError ? (
                            <p className="text-sm text-red-400">{activityError}</p>
                        ) : activity.length === 0 ? (
                            <p className="text-sm text-text-dim">Ingen aktivitet loggad än.</p>
                        ) : (
                            <ul className="flex flex-col divide-y divide-fg/10">
                                {activity.map((item) => (
                                    <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                {item.activity_type === 'search' ? (
                                                    <>
                                                        <p className="text-xs uppercase tracking-wide text-text-dim mb-0.5">Sökning</p>
                                                        <p className="text-sm text-text-main break-words">
                                                            "{item.search_query || '—'}"
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-xs uppercase tracking-wide text-text-dim mb-0.5">Visad annons</p>
                                                        {item.job_ad ? (
                                                            <a
                                                                href={`/annonser/${item.job_ad.id}`}
                                                                className="text-sm text-accent hover:underline break-words"
                                                            >
                                                                {item.job_ad.title}
                                                                {item.job_ad.company?.name && (
                                                                    <span className="text-text-muted"> · {item.job_ad.company.name}</span>
                                                                )}
                                                            </a>
                                                        ) : (
                                                            <p className="text-sm text-text-dim">Annons borttagen</p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <p className="shrink-0 text-xs text-text-dim whitespace-nowrap">
                                                {formatActivityDate(item.created_at)}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
