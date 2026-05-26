import React, { useEffect, useState } from 'react';
import {
    fetchMySchoolStudents,
    linkStudentByPublicId,
    unlinkSchoolStudent,
} from '../lib/schoolApi';

export default function StudenterPage() {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [studentPublicId, setStudentPublicId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [unlinkingPublicId, setUnlinkingPublicId] = useState('');
    const [confirmUnlinkId, setConfirmUnlinkId] = useState('');

    const loadStudents = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Du måste vara inloggad för att hantera studenter.');
            setIsLoading(false);
            return;
        }

        try {
            const data = await fetchMySchoolStudents(token);
            setStudents(data);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (localStorage.getItem('userRole') !== 'skola') {
            setError('Den här sidan är endast tillgänglig för skolkonton.');
            setIsLoading(false);
            return;
        }
        loadStudents();
    }, []);

    const handleLinkStudent = async (e) => {
        e.preventDefault();
        setSubmitMessage('');
        setError('');

        const cleaned = studentPublicId.trim();
        if (!cleaned) {
            setSubmitMessage('Fyll i ett student-ID.');
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Din session har gått ut. Logga in igen.');
            return;
        }

        setIsSubmitting(true);
        try {
            await linkStudentByPublicId(cleaned, token);
            setStudentPublicId('');
            setSubmitMessage('Studenten har kopplats till skolan.');
            await loadStudents();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnlinkStudent = async (publicId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Din session har gått ut. Logga in igen.');
            return;
        }
        setError('');
        setSubmitMessage('');
        setUnlinkingPublicId(publicId);
        try {
            await unlinkSchoolStudent(publicId, token);
            setSubmitMessage('Kopplingen togs bort.');
            setConfirmUnlinkId('');
            await loadStudents();
        } catch (err) {
            setError(err.message);
        } finally {
            setUnlinkingPublicId('');
        }
    };

    return (
        <div className="px-6 pt-32 mx-auto max-w-7xl">
            <h1 className="mb-3 text-4xl font-bold font-display text-text-main">Studenter</h1>
            <p className="mb-8 text-text-muted">
                Koppla en student till er skola genom att ange studentens publika student-ID.
            </p>

            <form
                onSubmit={handleLinkStudent}
                className="flex flex-col gap-3 p-5 mb-8 border rounded-2xl border-fg/10 bg-bg-elevated sm:flex-row"
            >
                <input
                    type="text"
                    value={studentPublicId}
                    onChange={(e) => setStudentPublicId(e.target.value)}
                    placeholder="Student-ID (t.ex. 123e4567-e89b-12d3-a456-426614174000)"
                    className="flex-1 px-3 py-2 border rounded-lg border-fg/15 bg-bg-void text-text-main placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-sm font-bold text-white rounded-lg bg-accent hover:bg-accent/90 disabled:opacity-60 transition-all"
                >
                    {isSubmitting ? 'Kopplar...' : 'Koppla student'}
                </button>
            </form>

            {submitMessage && <p className="mb-4 text-sm text-green-400">{submitMessage}</p>}
            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

            {isLoading ? (
                <p className="text-text-muted">Laddar studenter...</p>
            ) : students.length === 0 ? (
                <p className="text-text-muted">Inga studenter är kopplade till skolan ännu.</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {students.map((student) => {
                        const isConfirming = confirmUnlinkId === student.public_id;
                        const isUnlinking = unlinkingPublicId === student.public_id;
                        return (
                            <div key={student.id} className="flex flex-col p-5 border rounded-2xl border-fg/10 bg-bg-elevated">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-base font-semibold text-text-main">
                                        {student.first_name} {student.last_name}
                                    </p>
                                    {student.application_count > 0 && (
                                        <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                                            {student.application_count} {student.application_count === 1 ? 'ansökan' : 'ansökningar'}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-text-muted">
                                    {student.program || 'Program saknas'}
                                </p>
                                <p className="mt-4 mb-1 text-xs text-text-dim">Student-ID</p>
                                <code className="text-xs break-all text-text-main">{student.public_id}</code>

                                <div className="flex items-center justify-between gap-3 pt-4 mt-auto">
                                    <a
                                        href={`/student/${student.public_id}`}
                                        className="text-sm text-accent hover:underline"
                                    >
                                        Öppna profil
                                    </a>
                                    {isConfirming ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleUnlinkStudent(student.public_id)}
                                                disabled={isUnlinking}
                                                className="text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50"
                                            >
                                                {isUnlinking ? 'Tar bort...' : 'Bekräfta'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setConfirmUnlinkId('')}
                                                disabled={isUnlinking}
                                                className="text-xs text-text-dim hover:text-text-main disabled:opacity-50"
                                            >
                                                Avbryt
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setConfirmUnlinkId(student.public_id)}
                                            className="text-xs text-text-dim hover:text-red-400"
                                            title="Ta bort koppling till skolan"
                                        >
                                            Ta bort
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
