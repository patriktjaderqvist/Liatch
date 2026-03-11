import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchJobAd } from '../lib/jobAdsApi';
import { fetchJobAdApplications, updateApplicationStatus } from '../lib/applicationsApi';
import { fetchRecommendedStudentsForJobAd } from '../lib/recommendationsApi';

function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function ApplicationCard({ application, onStatusChange, availableActions }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');

    const handleAction = async (newStatus) => {
        setIsUpdating(true);
        setUpdateError('');
        try {
            await onStatusChange(application.id, newStatus);
        } catch (err) {
            setUpdateError(err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const { student, cover_letter, created_at } = application;
    const studentProfilePath = student.public_id ? `/student/${student.public_id}` : `/studenter/${student.id}`;

    return (
        <div className="flex flex-col gap-3 p-4 glass-card rounded-xl">
            <div>
                <Link
                    to={studentProfilePath}
                    className="text-sm font-bold transition-colors text-text-main hover:text-accent"
                >
                    {student.first_name} {student.last_name}
                </Link>
                <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-text-dim">
                    {student.program && <span>{student.program}</span>}
                    <span>Sökt {formatDate(created_at)}</span>
                </div>
            </div>

            {cover_letter && (
                <p className="text-xs leading-relaxed text-text-muted line-clamp-3">{cover_letter}</p>
            )}

            {availableActions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {availableActions.map(({ label, newStatus, className }) => (
                        <button
                            key={newStatus}
                            onClick={() => handleAction(newStatus)}
                            disabled={isUpdating}
                            className={`px-3 py-1 text-xs font-medium border rounded-lg transition-all disabled:opacity-50 ${className}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {updateError && <p className="text-xs text-red-400">{updateError}</p>}
        </div>
    );
}

const UNDER_REVIEW_ACTION = {
    label: 'Under granskning',
    newStatus: 'under_review',
    className: 'text-yellow-400 border-yellow-500/20 hover:border-yellow-500/40',
};
const ACCEPT_ACTION = {
    label: 'Acceptera',
    newStatus: 'accepted',
    className: 'text-green-400 border-green-500/20 hover:border-green-500/40',
};
const REJECT_ACTION = {
    label: 'Avvisa',
    newStatus: 'rejected',
    className: 'text-red-400 border-red-500/20 hover:border-red-500/40',
};

function KanbanColumn({ title, applications, onStatusChange, availableActions }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-fg/10">
                <h2 className="text-xs font-bold tracking-wide uppercase text-text-dim">{title}</h2>
                <span className="text-xs text-text-dim">{applications.length}</span>
            </div>
            <div className="flex flex-col gap-2">
                {applications.length === 0 ? (
                    <div className="p-4 text-center border border-dashed border-fg/10 rounded-xl">
                        <p className="text-xs text-text-dim">Inga ansökningar</p>
                    </div>
                ) : (
                    applications.map((app) => (
                        <ApplicationCard
                            key={app.id}
                            application={app}
                            onStatusChange={onStatusChange}
                            availableActions={availableActions}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function RecommendedStudentCard({ recommendation }) {
    const student = recommendation.student;
    const profilePath = student?.public_id ? `/student/${student.public_id}` : null;

    return (
        <div className="flex flex-col gap-2 p-4 border rounded-xl border-accent/20 bg-accent/5">
            <div className="flex items-start justify-between gap-2">
                <div>
                    {profilePath ? (
                        <Link to={profilePath} className="text-sm font-bold text-text-main hover:text-accent">
                            {student.first_name} {student.last_name}
                        </Link>
                    ) : (
                        <p className="text-sm font-bold text-text-main">
                            {student.first_name} {student.last_name}
                        </p>
                    )}
                    {student.program && (
                        <p className="text-xs text-text-dim">{student.program}</p>
                    )}
                </div>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full border border-accent/30 text-accent bg-accent/10">
                    {recommendation.score}%
                </span>
            </div>

            {student.school?.name && (
                <p className="text-xs text-text-dim">Skola: {student.school.name}</p>
            )}

            <ul className="flex flex-col gap-1 pl-4 text-xs text-text-muted list-disc">
                {(recommendation.reasons || []).slice(0, 2).map((reason) => (
                    <li key={reason}>{reason}</li>
                ))}
            </ul>
        </div>
    );
}

export default function AnsokningarPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [jobAd, setJobAd] = useState(null);
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [recommendedStudents, setRecommendedStudents] = useState([]);
    const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);
    const [recommendationsError, setRecommendationsError] = useState('');

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setError('Du måste vara inloggad.');
            setIsLoading(false);
            return;
        }

        Promise.all([fetchJobAd(id), fetchJobAdApplications(id, accessToken)])
            .then(([adData, apps]) => {
                setJobAd(adData);
                setApplications(apps);
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [id]);

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setRecommendedStudents([]);
            setRecommendationsError('');
            return;
        }

        setIsRecommendationsLoading(true);
        setRecommendationsError('');

        fetchRecommendedStudentsForJobAd(id, accessToken, 6)
            .then((data) => setRecommendedStudents(Array.isArray(data) ? data : []))
            .catch((err) => {
                setRecommendedStudents([]);
                setRecommendationsError(err.message);
            })
            .finally(() => setIsRecommendationsLoading(false));
    }, [id]);

    const handleStatusChange = async (applicationId, newStatus) => {
        const accessToken = localStorage.getItem('accessToken');
        const updated = await updateApplicationStatus(applicationId, newStatus, accessToken);
        setApplications((prev) =>
            prev.map((a) => (a.id === applicationId ? updated : a))
        );
    };

    if (isLoading) {
        return (
            <div className="px-6 pt-32 pb-20 mx-auto max-w-7xl">
                <p className="text-text-muted">Laddar ansökningar...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-6 pt-32 pb-20 mx-auto max-w-7xl">
                <p className="text-sm text-red-400">{error}</p>
                <button
                    onClick={() => navigate('/vara-annonser')}
                    className="mt-4 text-sm text-accent hover:underline"
                >
                    ← Tillbaka till annonser
                </button>
            </div>
        );
    }

    const submitted = applications.filter((a) => a.status === 'submitted');
    const underReview = applications.filter((a) => a.status === 'under_review');
    const accepted = applications.filter((a) => a.status === 'accepted');
    const rejected = applications.filter((a) => a.status === 'rejected' || a.status === 'withdrawn');

    return (
        <div className="px-6 pt-32 pb-20 mx-auto max-w-7xl">
            <button
                onClick={() => navigate('/vara-annonser')}
                className="flex items-center gap-1 mb-8 text-sm transition-colors text-text-dim hover:text-text-main"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Våra annonser
            </button>

            <div className="mb-10">
                <h1 className="mb-2 text-4xl font-bold font-display text-text-main">Ansökningar</h1>
                <p className="text-text-muted">{jobAd?.title}</p>
            </div>

            <section className="p-5 mb-8 border rounded-2xl border-accent/20 bg-accent/5">
                <h2 className="mb-3 text-sm font-bold tracking-[0.08em] uppercase text-text-main">
                    Rekommenderade profiler · Powered by Groq + fallback
                </h2>

                {isRecommendationsLoading && (
                    <p className="text-sm text-text-dim">Tar fram rekommendationer...</p>
                )}

                {!isRecommendationsLoading && recommendationsError && (
                    <p className="text-sm text-text-dim">
                        Rekommendationer kunde inte laddas just nu: {recommendationsError}
                    </p>
                )}

                {!isRecommendationsLoading && !recommendationsError && recommendedStudents.length === 0 && (
                    <p className="text-sm text-text-dim">
                        Inga sökande att ranka ännu för den här annonsen.
                    </p>
                )}

                {!isRecommendationsLoading && recommendedStudents.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {recommendedStudents
                            .filter((recommendation) => recommendation?.student?.public_id)
                            .map((recommendation) => (
                                <RecommendedStudentCard
                                    key={recommendation.student.public_id}
                                    recommendation={recommendation}
                                />
                            ))}
                    </div>
                )}
            </section>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <KanbanColumn
                    title="Inskickade"
                    applications={submitted}
                    onStatusChange={handleStatusChange}
                    availableActions={[UNDER_REVIEW_ACTION, REJECT_ACTION]}
                />
                <KanbanColumn
                    title="Under granskning"
                    applications={underReview}
                    onStatusChange={handleStatusChange}
                    availableActions={[ACCEPT_ACTION, REJECT_ACTION]}
                />
                <KanbanColumn
                    title="Accepterade"
                    applications={accepted}
                    onStatusChange={handleStatusChange}
                    availableActions={[]}
                />
                <KanbanColumn
                    title="Avvisade"
                    applications={rejected}
                    onStatusChange={handleStatusChange}
                    availableActions={[]}
                />
            </div>
        </div>
    );
}
