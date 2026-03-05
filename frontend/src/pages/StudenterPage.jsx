import React, { useEffect, useState } from 'react';
import { fetchMySchoolStudents, linkStudentByPublicId } from '../lib/schoolApi';

export default function StudenterPage() {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [studentPublicId, setStudentPublicId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

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

    return (
        <div className="pt-32 px-6 max-w-7xl mx-auto">
            <h1 className="text-4xl font-display font-bold text-text-main mb-3">Studenter</h1>
            <p className="text-text-muted mb-8">
                Koppla en student till er skola genom att ange studentens publika student-ID.
            </p>

            <form
                onSubmit={handleLinkStudent}
                className="p-5 mb-8 rounded-2xl border border-fg/10 bg-bg-elevated flex flex-col sm:flex-row gap-3"
            >
                <input
                    type="text"
                    value={studentPublicId}
                    onChange={(e) => setStudentPublicId(e.target.value)}
                    placeholder="Student-ID (t.ex. 123e4567-e89b-12d3-a456-426614174000)"
                    className="flex-1 px-3 py-2 rounded-lg border border-fg/15 bg-bg-void text-text-main placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-accent"
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
                    {students.map((student) => (
                        <div key={student.id} className="p-5 rounded-2xl border border-fg/10 bg-bg-elevated">
                            <p className="text-base font-semibold text-text-main">
                                {student.first_name} {student.last_name}
                            </p>
                            <p className="text-sm text-text-muted mt-1">
                                {student.program || 'Program saknas'}
                            </p>
                            <p className="text-xs text-text-dim mt-4 mb-1">Student-ID</p>
                            <code className="text-xs text-text-main break-all">{student.public_id}</code>
                            <div className="mt-4">
                                <a
                                    href={`/student/${student.public_id}`}
                                    className="text-sm text-accent hover:underline"
                                >
                                    Öppna profil
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
