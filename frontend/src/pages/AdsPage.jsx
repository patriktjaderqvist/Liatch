import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchJobAds } from '../lib/jobAdsApi';
import { fetchRecommendedJobAds } from '../lib/recommendationsApi';
import { fetchMyStudent, logStudentActivity } from '../lib/studentApi';

const PAGE_SIZE = 12;
const GUEST_PREVIEW_COUNT = 3;
const DUMMY_LOCKED_ADS = [
    {
        id: 'locked-1',
        title: 'LIA Product Designer',
        company: { name: 'Tech Studio AB' },
        location: 'Stockholm',
        employment_type: 'LIA',
        remote: true,
        application_deadline: '2026-04-10T00:00:00Z',
        description: 'Designarbete i tvärfunktionellt team med fokus på användarresa och prototyper.',
    },
    {
        id: 'locked-2',
        title: 'LIA Backend Engineer',
        company: { name: 'Cloudforge Nordic' },
        location: 'Göteborg',
        employment_type: 'LIA',
        remote: false,
        application_deadline: '2026-04-12T00:00:00Z',
        description: 'Bygg API:er och datalager med fokus på skalbarhet, kvalitet och driftsäkerhet.',
    },
    {
        id: 'locked-3',
        title: 'LIA Frontend Developer',
        company: { name: 'Nextwave Digital' },
        location: 'Malmö',
        employment_type: 'LIA',
        remote: true,
        application_deadline: '2026-04-15T00:00:00Z',
        description: 'Utveckla komponenter och gränssnitt i moderna frontend-ramverk.',
    },
];

const QUICK_FILTERS = [
    {
        id: 'stockholm',
        label: 'Stockholm',
        predicate: (ad) => (ad.location || '').toLowerCase().includes('stockholm'),
    },
    {
        id: 'remote',
        label: 'Distans',
        predicate: (ad) => ad.remote,
    },
    {
        id: 'frontend',
        label: 'Frontend',
        predicate: (ad) => `${ad.title} ${ad.description}`.toLowerCase().includes('frontend'),
    },
    {
        id: 'backend',
        label: 'Backend',
        predicate: (ad) => `${ad.title} ${ad.description}`.toLowerCase().includes('backend'),
    },
    {
        id: 'react',
        label: 'React',
        predicate: (ad) => `${ad.title} ${ad.description}`.toLowerCase().includes('react'),
    },
    {
        id: 'fastapi',
        label: 'FastAPI',
        predicate: (ad) => `${ad.title} ${ad.description}`.toLowerCase().includes('fastapi'),
    },
];

function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function AdCard({ ad, to, onClick }) {
    return (
        <Link to={to} onClick={onClick} className="flex flex-col gap-3 p-6 transition-colors cursor-pointer glass-card rounded-2xl hover:border-accent/30">
            <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-bold leading-snug text-text-main">{ad.title}</h2>
                {ad.remote && (
                    <span className="px-2 py-1 text-xs font-semibold border rounded-full shrink-0 bg-accent/10 text-accent border-accent/20">
                        Distans
                    </span>
                )}
            </div>

            <p className="text-sm font-medium text-accent">{ad.company.name}</p>

            <div className="flex flex-wrap gap-3 text-xs text-text-dim">
                {ad.location && (
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {ad.location}
                    </span>
                )}
                {ad.employment_type && (
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {ad.employment_type}
                    </span>
                )}
                {ad.application_deadline && (
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Sök senast {formatDate(ad.application_deadline)}
                    </span>
                )}
            </div>

            <p className="text-sm leading-relaxed text-text-muted line-clamp-3">
                {ad.description}
            </p>
        </Link>
    );
}

function RecommendationStripCard({ recommendation, to, onClick }) {
    const ad = recommendation.job_ad;
    return (
        <Link
            to={to}
            onClick={onClick}
            className="flex flex-col gap-2 p-4 transition-colors border rounded-xl border-accent/20 bg-accent/5 hover:border-accent/40"
        >
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold leading-snug text-text-main">{ad.title}</p>
                <span className="shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full border border-accent/30 text-accent bg-accent/10">
                    {recommendation.score}%
                </span>
            </div>
            <p className="text-xs font-medium text-accent">{ad.company?.name}</p>
            <div className="flex flex-wrap gap-2">
                {recommendation.reasons?.slice(0, 2).map((reason) => (
                    <span
                        key={reason}
                        className="px-2 py-1 text-xs border rounded-full bg-fg/5 text-text-dim border-fg/10"
                    >
                        {reason}
                    </span>
                ))}
            </div>
        </Link>
    );
}

function buildRecommendedFilters(student) {
    const recommended = [];
    const profileCity = (student?.profile?.city || '').trim();
    if (profileCity) {
        recommended.push({
            id: `city:${profileCity.toLowerCase()}`,
            label: `Nära dig: ${profileCity}`,
            predicate: (ad) => (ad.location || '').toLowerCase().includes(profileCity.toLowerCase()),
        });
    }

    const program = (student?.program || '').toLowerCase();
    if (program.includes('front')) {
        recommended.push({
            id: 'program:frontend',
            label: 'Rek: Frontend',
            predicate: (ad) => `${ad.title} ${ad.description}`.toLowerCase().includes('frontend'),
        });
    }
    if (program.includes('back')) {
        recommended.push({
            id: 'program:backend',
            label: 'Rek: Backend',
            predicate: (ad) => `${ad.title} ${ad.description}`.toLowerCase().includes('backend'),
        });
    }
    if (program.includes('fullstack')) {
        recommended.push({
            id: 'program:fullstack',
            label: 'Rek: Fullstack',
            predicate: (ad) => `${ad.title} ${ad.description}`.toLowerCase().includes('fullstack'),
        });
    }

    return recommended;
}

export default function AdsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [ads, setAds] = useState([]);
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('accessToken')));
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
    const [recommendedFilters, setRecommendedFilters] = useState([]);
    const [recommendedAds, setRecommendedAds] = useState([]);
    const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);
    const [recommendationsError, setRecommendationsError] = useState('');

    const [selectedLocation, setSelectedLocation] = useState('all');
    const [selectedWorkMode, setSelectedWorkMode] = useState('all');
    const [selectedEmploymentType, setSelectedEmploymentType] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [activeQuickFilter, setActiveQuickFilter] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchJobAds()
            .then((data) => {
                setAds(data);
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        const syncSession = () => {
            setIsLoggedIn(Boolean(localStorage.getItem('accessToken')));
            setUserRole(localStorage.getItem('userRole'));
        };

        syncSession();
        window.addEventListener('storage', syncSession);
        window.addEventListener('userRoleChanged', syncSession);

        return () => {
            window.removeEventListener('storage', syncSession);
            window.removeEventListener('userRoleChanged', syncSession);
        };
    }, []);

    useEffect(() => {
        const loadRecommendations = async () => {
            if (!isLoggedIn || userRole !== 'privatperson') {
                setRecommendedFilters([]);
                return;
            }

            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setRecommendedFilters([]);
                return;
            }

            try {
                const student = await fetchMyStudent(accessToken);
                setRecommendedFilters(buildRecommendedFilters(student));
            } catch {
                setRecommendedFilters([]);
            }
        };

        loadRecommendations();
    }, [isLoggedIn, userRole]);

    useEffect(() => {
        const loadRecommendedAds = async () => {
            if (!isLoggedIn || userRole !== 'privatperson') {
                setRecommendedAds([]);
                setRecommendationsError('');
                return;
            }

            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setRecommendedAds([]);
                setRecommendationsError('');
                return;
            }

            setIsRecommendationsLoading(true);
            setRecommendationsError('');

            try {
                const data = await fetchRecommendedJobAds(accessToken, 4);
                setRecommendedAds(Array.isArray(data) ? data : []);
            } catch (err) {
                setRecommendedAds([]);
                setRecommendationsError(err.message);
            } finally {
                setIsRecommendationsLoading(false);
            }
        };

        loadRecommendedAds();
    }, [isLoggedIn, userRole]);

    useEffect(() => {
        const query = searchParams.get('q') || '';
        setSearch(query);
    }, [searchParams]);

    // Log student search queries to the backend so the school can see what
    // their students are looking for. Debounce 1500ms so we don't fire on
    // every keystroke, and only for logged-in students.
    useEffect(() => {
        if (!isLoggedIn || userRole !== 'privatperson') return undefined;
        const trimmed = search.trim();
        if (!trimmed) return undefined;
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return undefined;

        const handle = setTimeout(() => {
            logStudentActivity(
                { activity_type: 'search', search_query: trimmed },
                accessToken
            ).catch(() => {
                /* tracking is best-effort, don't surface errors */
            });
        }, 1500);

        return () => clearTimeout(handle);
    }, [search, isLoggedIn, userRole]);

    const logAdView = (adId) => {
        if (!isLoggedIn || userRole !== 'privatperson') return;
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;
        logStudentActivity(
            { activity_type: 'view', job_ad_id: adId },
            accessToken
        ).catch(() => {
            /* best-effort */
        });
    };

    const locations = useMemo(() => {
        return [...new Set(ads.map((ad) => ad.location).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'sv-SE'));
    }, [ads]);

    const employmentTypes = useMemo(() => {
        return [...new Set(ads.map((ad) => ad.employment_type).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'sv-SE'));
    }, [ads]);

    const allQuickFilters = useMemo(() => {
        const merged = [...recommendedFilters, ...QUICK_FILTERS];
        const uniqueById = new Map();
        for (const filter of merged) {
            if (!uniqueById.has(filter.id)) {
                uniqueById.set(filter.id, filter);
            }
        }
        return [...uniqueById.values()];
    }, [recommendedFilters]);

    const filteredAndSortedAds = useMemo(() => {
        let result = [...ads];

        const q = search.toLowerCase().trim();
        if (q) {
            result = result.filter((ad) =>
                ad.title.toLowerCase().includes(q) ||
                ad.company.name.toLowerCase().includes(q) ||
                (ad.location && ad.location.toLowerCase().includes(q)) ||
                ad.description.toLowerCase().includes(q)
            );
        }

        if (selectedLocation !== 'all') {
            result = result.filter((ad) => ad.location === selectedLocation);
        }

        if (selectedWorkMode === 'remote') {
            result = result.filter((ad) => ad.remote);
        }
        if (selectedWorkMode === 'onsite') {
            result = result.filter((ad) => !ad.remote);
        }

        if (selectedEmploymentType !== 'all') {
            result = result.filter((ad) => ad.employment_type === selectedEmploymentType);
        }

        if (activeQuickFilter !== 'all') {
            const quickFilter = allQuickFilters.find((filter) => filter.id === activeQuickFilter);
            if (quickFilter) {
                result = result.filter((ad) => quickFilter.predicate(ad));
            }
        }

        if (sortBy === 'deadline') {
            result.sort((a, b) => {
                if (!a.application_deadline && !b.application_deadline) return 0;
                if (!a.application_deadline) return 1;
                if (!b.application_deadline) return -1;
                return new Date(a.application_deadline) - new Date(b.application_deadline);
            });
        } else if (sortBy === 'company') {
            result.sort((a, b) => a.company.name.localeCompare(b.company.name, 'sv-SE'));
        } else {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        return result;
    }, [ads, search, selectedLocation, selectedWorkMode, selectedEmploymentType, activeQuickFilter, sortBy, allQuickFilters]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedLocation, selectedWorkMode, selectedEmploymentType, activeQuickFilter, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredAndSortedAds.length / PAGE_SIZE));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const pagedAds = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredAndSortedAds.slice(start, start + PAGE_SIZE);
    }, [filteredAndSortedAds, currentPage]);

    const visibleAds = isLoggedIn ? pagedAds : filteredAndSortedAds.slice(0, GUEST_PREVIEW_COUNT);
    const lockedAds = isLoggedIn ? [] : filteredAndSortedAds.slice(GUEST_PREVIEW_COUNT);
    const lockedPreviewAds = isLoggedIn
        ? []
        : lockedAds.length > 0
            ? lockedAds
            : DUMMY_LOCKED_ADS;
    const showLoginWall = !isLoggedIn && filteredAndSortedAds.length > 0;

    const handleSearchChange = (event) => {
        const nextValue = event.target.value;
        setSearch(nextValue);

        const nextParams = new URLSearchParams(searchParams);
        const trimmedValue = nextValue.trim();
        if (trimmedValue) {
            nextParams.set('q', trimmedValue);
        } else {
            nextParams.delete('q');
        }
        setSearchParams(nextParams, { replace: true });
    };

    const clearFilters = () => {
        setSelectedLocation('all');
        setSelectedWorkMode('all');
        setSelectedEmploymentType('all');
        setSortBy('newest');
        setActiveQuickFilter('all');
    };

    const getAdTarget = (adId) => {
        if (isLoggedIn) {
            return `/annonser/${adId}`;
        }
        return `/login?redirect=${encodeURIComponent(`/annonser/${adId}`)}`;
    };

    return (
        <div className="px-6 pt-32 pb-20 mx-auto max-w-7xl">
            <div className="mb-10">
                <h1 className="mb-2 text-4xl font-bold font-display text-text-main">Praktikannonser</h1>
                <p className="text-text-muted">Hitta din nästa LIA-plats bland aktiva annonser.</p>
            </div>

            {isLoggedIn && userRole === 'privatperson' && (
                <section className="p-5 mb-8 border rounded-2xl border-accent/20 bg-accent/5">
                    <h2 className="mb-3 text-sm font-bold tracking-[0.08em] uppercase text-text-main">
                        AI-matchade annonser · Powered by Groq + fallback
                    </h2>

                    {isRecommendationsLoading && (
                        <p className="text-sm text-text-dim">Tar fram rekommendationer...</p>
                    )}

                    {!isRecommendationsLoading && recommendationsError && (
                        <p className="text-sm text-text-dim">
                            Rekommendationer kunde inte laddas just nu: {recommendationsError}
                        </p>
                    )}

                    {!isRecommendationsLoading && !recommendationsError && recommendedAds.length === 0 && (
                        <p className="text-sm text-text-dim">
                            Inga rekommendationer ännu. Fyll gärna i mer i din profil för bättre träffar.
                        </p>
                    )}

                    {!isRecommendationsLoading && recommendedAds.length > 0 && (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {recommendedAds
                                .filter((recommendation) => recommendation?.job_ad?.id)
                                .map((recommendation) => (
                                <RecommendationStripCard
                                    key={recommendation.job_ad.id}
                                    recommendation={recommendation}
                                    to={getAdTarget(recommendation.job_ad.id)}
                                    onClick={() => logAdView(recommendation.job_ad.id)}
                                />
                                ))}
                        </div>
                    )}
                </section>
            )}

            <div className="grid gap-4 mb-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="relative">
                    <div className="absolute inset-y-0 flex items-center pointer-events-none left-4">
                        <svg className="w-4 h-4 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Sök på titel, företag, teknik eller stad..."
                        className="w-full py-3 pl-10 pr-4 transition-all border rounded-xl bg-fg/5 border-fg/10 text-text-main placeholder-text-dim focus:outline-none focus:border-accent/50 focus:bg-fg/10"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                    <select
                        value={selectedLocation}
                        onChange={(event) => setSelectedLocation(event.target.value)}
                        className="px-3 py-3 text-sm border rounded-xl bg-fg/5 border-fg/10 text-text-main focus:outline-none focus:border-accent/40"
                    >
                        <option value="all">Alla orter</option>
                        {locations.map((location) => (
                            <option key={location} value={location}>{location}</option>
                        ))}
                    </select>

                    <select
                        value={selectedWorkMode}
                        onChange={(event) => setSelectedWorkMode(event.target.value)}
                        className="px-3 py-3 text-sm border rounded-xl bg-fg/5 border-fg/10 text-text-main focus:outline-none focus:border-accent/40"
                    >
                        <option value="all">Alla upplägg</option>
                        <option value="remote">Distans</option>
                        <option value="onsite">På plats</option>
                    </select>

                    <select
                        value={selectedEmploymentType}
                        onChange={(event) => setSelectedEmploymentType(event.target.value)}
                        className="px-3 py-3 text-sm border rounded-xl bg-fg/5 border-fg/10 text-text-main focus:outline-none focus:border-accent/40"
                    >
                        <option value="all">Alla typer</option>
                        {employmentTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        className="px-3 py-3 text-sm border rounded-xl bg-fg/5 border-fg/10 text-text-main focus:outline-none focus:border-accent/40"
                    >
                        <option value="newest">Nyast först</option>
                        <option value="deadline">Snarast deadline</option>
                        <option value="company">Företag A-Ö</option>
                    </select>
                </div>
            </div>

            {allQuickFilters.length > 0 && (
                <div className="mb-8">
                    {recommendedFilters.length > 0 && (
                        <p className="mb-2 text-xs font-semibold tracking-[0.12em] uppercase text-text-dim">Rekommenderat för dig</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveQuickFilter('all')}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${activeQuickFilter === 'all'
                                ? 'border-accent/40 bg-accent/15 text-accent'
                                : 'border-fg/10 bg-fg/5 text-text-muted hover:border-accent/30 hover:text-text-main'
                                }`}
                        >
                            Alla
                        </button>
                        {allQuickFilters.map((filter) => (
                            <button
                                key={filter.id}
                                type="button"
                                onClick={() => setActiveQuickFilter(filter.id)}
                                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${activeQuickFilter === filter.id
                                    ? 'border-accent/40 bg-accent/15 text-accent'
                                    : 'border-fg/10 bg-fg/5 text-text-muted hover:border-accent/30 hover:text-text-main'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="px-3 py-1.5 text-xs rounded-full border border-fg/10 bg-fg/5 text-text-dim hover:text-text-main"
                        >
                            Nollställ filter
                        </button>
                    </div>
                </div>
            )}

            {isLoading && <p className="text-text-muted">Laddar annonser...</p>}

            {error && <p className="text-sm text-red-400">{error}</p>}

            {!isLoading && !error && filteredAndSortedAds.length === 0 && (
                <p className="text-text-muted">
                    {search ? 'Inga annonser matchar din sökning.' : 'Det finns inga aktiva annonser just nu.'}
                </p>
            )}

            {!isLoading && !error && filteredAndSortedAds.length > 0 && (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs text-text-dim">
                        <p>{filteredAndSortedAds.length} annons{filteredAndSortedAds.length !== 1 ? 'er' : ''}</p>
                        {isLoggedIn && totalPages > 1 && (
                            <p>Sida {currentPage} av {totalPages}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {visibleAds.map((ad) => (
                            <AdCard
                                key={ad.id}
                                ad={ad}
                                to={getAdTarget(ad.id)}
                                onClick={() => logAdView(ad.id)}
                            />
                        ))}
                    </div>

                    {showLoginWall && (
                        <div className="mt-8">
                            <div className="relative z-20 max-w-xl px-5 py-5 mx-auto mb-[-28px] text-center border rounded-2xl border-accent/25 bg-bg-void/85 backdrop-blur-md">
                                <p className="text-sm text-text-main">Logga in om du vill se fler annonser.</p>
                                <div className="flex flex-wrap justify-center gap-3 mt-4">
                                    <Link
                                        to="/login?redirect=%2Fannonser"
                                        className="px-4 py-2 text-sm font-bold text-white transition-colors rounded-lg bg-accent hover:bg-accent/90"
                                    >
                                        Logga in
                                    </Link>
                                    <Link
                                        to="/skapa-konto?redirect=%2Fannonser"
                                        className="px-4 py-2 text-sm font-semibold transition-colors border rounded-lg border-fg/15 text-text-main hover:border-accent/40 hover:text-accent"
                                    >
                                        Skapa konto
                                    </Link>
                                </div>
                            </div>

                            <div className="relative overflow-hidden border rounded-2xl border-accent/20 bg-bg-elevated/30 pt-10">
                                <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-bg-void/60 via-bg-void/40 to-bg-void/15"></div>

                                <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
                                    {lockedPreviewAds.map((ad) => (
                                        <div key={ad.id} className="relative pointer-events-none select-none">
                                            <div className="blur-[3px] opacity-80">
                                                <AdCard ad={ad} to={`/annonser/${ad.id}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoggedIn && totalPages > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm border rounded-lg border-fg/10 bg-fg/5 text-text-main disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Föregående
                            </button>

                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`min-w-[36px] px-3 py-2 text-sm rounded-lg border ${currentPage === page
                                        ? 'border-accent/40 bg-accent/15 text-accent'
                                        : 'border-fg/10 bg-fg/5 text-text-main'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm border rounded-lg border-fg/10 bg-fg/5 text-text-main disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Nästa
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
