import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';
import {
    Code2,
    ExternalLink,
    FolderGit2,
    GitBranch,
    Globe,
    Lock,
    RefreshCw,
    Search,
    Sparkles,
    Terminal,
    UserSearch,
    Users,
    X,
    BookOpen,
    Layers,
    AlertCircle,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { safeStorage } from '../services/safeStorage';
import { compileAIProfile } from '../services/aiProfileService';
import { getRankSpec } from '../services/aiTrustCharter';
import { PortfolioProjectCard } from './PortfolioProjectCard';
import { AIDossierPanel } from './AIDossierPanel';
import type {
    UserProfile,
    ProfileProject,
    ProfileProjectTestimonial,
    ProficiencyLevel,
    ProgrammingLanguageEntry,
    PortfolioLink,
    NetworkProject,
    GlitchTelemetry,
    ChatMessage
} from '../types';

export interface CompatibilityResult {
    score: number;
    reasons: string[];
    offers?: string[];
    seeks?: string[];
    shared?: string[];
    weightedEndorsementScore?: number;
}

interface EndorsementConfirmationState {
    profileId: string;
    profileUsername: string;
    skillName: string;
    isRemoving: boolean;
}

interface CodingNetworkProfileSystemProps {
    profile?: UserProfile;
    onUpdateProfile?: (updates: Partial<UserProfile>) => void;
    projects?: NetworkProject[];
    glitchHistory?: GlitchTelemetry[];
    messages?: ChatMessage[];
    networkProfiles: any[];
    setNetworkProfiles: React.Dispatch<React.SetStateAction<any[]>>;
    selectedProfileNode: any | null;
    setSelectedProfileNode: React.Dispatch<React.SetStateAction<any | null>>;
    calculateCompatibility: (dev1: any, dev2: any) => CompatibilityResult;
    onInviteProfile: (targetProfile: any) => void;
    onSwitchToMatches: () => void;
    onToggleEndorseSkill: (profileId: string, skillName: string) => Promise<void> | void;
    onPeerProjectAddTestimonial: (projId: string, testimonial: ProfileProjectTestimonial) => Promise<void> | void;
    onPeerEndorseProject: (projId: string) => Promise<void> | void;
    onPeerRateProject: (projId: string, value: number) => Promise<void> | void;
}

const PROFICIENCY_META: Record<ProficiencyLevel, { pct: number; barClass: string; textClass: string }> = {
    Beginner: {
        pct: 25,
        barClass: 'bg-zinc-500',
        textClass: 'text-zinc-300'
    },
    Intermediate: {
        pct: 48,
        barClass: 'bg-sky-500',
        textClass: 'text-sky-300'
    },
    Advanced: {
        pct: 72,
        barClass: 'bg-indigo-500',
        textClass: 'text-indigo-300'
    },
    Expert: {
        pct: 88,
        barClass: 'bg-purple-500',
        textClass: 'text-purple-300'
    },
    Master: {
        pct: 98,
        barClass: 'bg-amber-400',
        textClass: 'text-amber-300'
    }
};

const normalizeUrl = (rawUrl: string): string => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
};

const getContributionLabel = (proj: ProfileProject): { label: string; textClass: string } => {
    const type = proj.contributionType || (proj.status === 'current' ? 'in_progress' : 'completed');
    if (type === 'contributed') {
        return { label: 'Contributed', textClass: 'text-cyan-300' };
    }
    if (type === 'in_progress' || proj.status === 'current') {
        return { label: 'In Progress', textClass: 'text-emerald-300' };
    }
    return { label: 'Completed', textClass: 'text-purple-300' };
};

const ProfileAvatar: React.FC<{ src?: string; username?: string; sizeClass?: string }> = ({
    src,
    username = 'OP',
    sizeClass = 'w-12 h-12'
}) => {
    const [failed, setFailed] = useState(false);
    const initials = (username || 'OP').replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'OP';

    if (!src || failed) {
        return (
            <div
                className={`${sizeClass} rounded-full border border-white/15 bg-slate-900 flex items-center justify-center font-mono text-xs font-bold text-zinc-200 shrink-0 select-none`}
            >
                {initials}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={username}
            onError={() => setFailed(true)}
            className={`${sizeClass} rounded-full border border-white/15 object-cover shrink-0 bg-slate-900`}
            referrerPolicy="no-referrer"
        />
    );
};

export const CodingNetworkProfileSystem: React.FC<CodingNetworkProfileSystemProps> = ({
    profile,
    onUpdateProfile,
    projects = [],
    glitchHistory = [],
    messages = [],
    networkProfiles,
    setNetworkProfiles,
    selectedProfileNode,
    setSelectedProfileNode,
    calculateCompatibility,
    onInviteProfile,
    onSwitchToMatches,
    onToggleEndorseSkill,
    onPeerProjectAddTestimonial,
    onPeerEndorseProject,
    onPeerRateProject
}) => {
    const [profilesSubMode, setProfilesSubMode] = useState<'directory' | 'my_profile'>('directory');
    const [searchProfileQuery, setSearchProfileQuery] = useState('');
    const [skillFilterMode, setSkillFilterMode] = useState<'all' | 'possess' | 'mentor'>('all');
    const [languageFilter, setLanguageFilter] = useState<string>('ALL');
    const [endorsementConfirmation, setEndorsementConfirmation] = useState<EndorsementConfirmationState | null>(null);

    // Discovery identifiers ONLY — subject cannot manually author bio, skills, or project reviews
    const [lookupIdentifier, setLookupIdentifier] = useState(profile?.username || '');
    const [lookupGithubUrl, setLookupGithubUrl] = useState(profile?.contactInfo?.github || '');
    const [lookupPortfolioUrl, setLookupPortfolioUrl] = useState(profile?.contactInfo?.website || '');
    const [lookupEmail, setLookupEmail] = useState(profile?.contactInfo?.email || '');
    const [includeWorkspaceContext, setIncludeWorkspaceContext] = useState(true);
    const [isCompilingOwnProfile, setIsCompilingOwnProfile] = useState(false);
    const [compileOwnError, setCompileOwnError] = useState<string | null>(null);

    // AI Lookup modal for adding another developer node via AI (no manual creation)
    const [isAILookupModalOpen, setIsAILookupModalOpen] = useState(false);
    const [peerLookupHandle, setPeerLookupHandle] = useState('');
    const [peerLookupGithub, setPeerLookupGithub] = useState('');
    const [peerLookupWebsite, setPeerLookupWebsite] = useState('');
    const [isCompilingPeer, setIsCompilingPeer] = useState(false);
    const [compilePeerError, setCompilePeerError] = useState<string | null>(null);

    useEffect(() => {
        if (profile) {
            setLookupIdentifier((prev) => prev || profile.username || '');
            setLookupGithubUrl((prev) => prev || profile.contactInfo?.github || '');
            setLookupPortfolioUrl((prev) => prev || profile.contactInfo?.website || '');
            setLookupEmail((prev) => prev || profile.contactInfo?.email || '');
        }
    }, [profile]);

    const availableLanguages = useMemo(() => {
        const set = new Set<string>();
        (networkProfiles || []).forEach((p) => {
            (p.programmingLanguages || []).forEach((lang: ProgrammingLanguageEntry) => {
                if (lang?.name) set.add(lang.name);
            });
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [networkProfiles]);

    const filteredProfiles = useMemo(() => {
        const q = searchProfileQuery.trim().toLowerCase();
        return (networkProfiles || []).filter((p) => {
            if (!p) return false;
            const langs: ProgrammingLanguageEntry[] = p.programmingLanguages || [];
            if (
                languageFilter !== 'ALL' &&
                !langs.some((l) => l.name.toLowerCase() === languageFilter.toLowerCase())
            ) {
                return false;
            }

            const teachSkills: string[] = p.willingToTeachSkills || [];
            if (skillFilterMode === 'possess') {
                if (!q) return true;
                return (
                    (p.skills || []).some((s: string) => s.toLowerCase().includes(q)) ||
                    langs.some((l) => l.name.toLowerCase().includes(q))
                );
            }

            if (skillFilterMode === 'mentor') {
                if (teachSkills.length === 0) return false;
                if (!q) return true;
                return (
                    (p.username || '').toLowerCase().includes(q) ||
                    teachSkills.some((s: string) => s.toLowerCase().includes(q)) ||
                    langs.some((l) => l.name.toLowerCase().includes(q))
                );
            }

            if (!q) return true;
            const projInterests: string[] = p.lookingForSkills || [];
            const pastProjects: ProfileProject[] = p.profileProjects || [];
            const verdict = p.aiDossier?.verdictSummary || '';
            return (
                (p.username || '').toLowerCase().includes(q) ||
                (p.tagline || '').toLowerCase().includes(q) ||
                (p.bio || '').toLowerCase().includes(q) ||
                verdict.toLowerCase().includes(q) ||
                (p.skills || []).some((s: string) => s.toLowerCase().includes(q)) ||
                langs.some((l) => l.name.toLowerCase().includes(q)) ||
                projInterests.some((s: string) => s.toLowerCase().includes(q)) ||
                teachSkills.some((s: string) => s.toLowerCase().includes(q)) ||
                pastProjects.some(
                    (pr) =>
                        (pr.title || '').toLowerCase().includes(q) ||
                        (pr.description || '').toLowerCase().includes(q) ||
                        (pr.technologies || []).some((t) => t.toLowerCase().includes(q))
                )
            );
        });
    }, [networkProfiles, searchProfileQuery, skillFilterMode, languageFilter]);

    const radarDataForSelectedNode = useMemo(() => {
        if (!selectedProfileNode) return [];
        const skillsList: string[] = selectedProfileNode.skills || [];
        const skillScores = skillsList.map((s) => {
            const endorsers = selectedProfileNode.skillEndorsements?.[s] || [];
            const score = Math.min(100, 50 + endorsers.length * 15);
            return { subject: s, value: score };
        });
        const topSkills = [...skillScores].sort((a, b) => b.value - a.value).slice(0, 7);
        while (topSkills.length < 3) {
            topSkills.push({ subject: 'Core Baseline', value: 50 });
        }
        return topSkills;
    }, [selectedProfileNode, selectedProfileNode?.skillEndorsements]);

    const radarDataForOwnNode = useMemo(() => {
        if (!profile) return [];
        const skillsList = profile.skills || [];
        const skillScores = skillsList.map((s) => {
            const endorsers = profile.skillEndorsements?.[s] || [];
            const score = Math.min(100, 50 + endorsers.length * 15);
            return { subject: s, value: score };
        });
        const topSkills = [...skillScores].sort((a, b) => b.value - a.value).slice(0, 7);
        while (topSkills.length < 3) {
            topSkills.push({ subject: 'Core Baseline', value: 50 });
        }
        return topSkills;
    }, [profile, profile?.skillEndorsements, profile?.skills]);

    const handleRunAIProfileCompile = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const identifier = lookupIdentifier.trim() || profile?.username || '';
        if (!identifier && !lookupGithubUrl.trim() && !lookupPortfolioUrl.trim() && !lookupEmail.trim()) {
            setCompileOwnError('Provide a handle, GitHub URL, website, or email for AI to investigate.');
            return;
        }

        setIsCompilingOwnProfile(true);
        setCompileOwnError(null);

        try {
            const result = await compileAIProfile({
                identifier,
                githubUrl: lookupGithubUrl.trim(),
                portfolioUrl: lookupPortfolioUrl.trim(),
                email: lookupEmail.trim(),
                includeWorkspaceContext,
                profile,
                projects,
                glitchHistory,
                messages
            });

            onUpdateProfile?.(result.profileUpdates);

            // Also update in directory if already synced
            if (profile) {
                const updatedNode = {
                    ...profile,
                    ...result.profileUpdates
                };
                const existingIdx = networkProfiles.findIndex(
                    (p) => p.id === profile.id || p.username.toLowerCase() === (updatedNode.username || '').toLowerCase()
                );
                if (existingIdx >= 0) {
                    const nextDir = networkProfiles.map((p, idx) => (idx === existingIdx ? updatedNode : p));
                    setNetworkProfiles(nextDir);
                    await safeStorage.setItem('aetheros_network_profiles', JSON.stringify(nextDir));
                }
            }

            toast.success('AI profile audit compiled (strengths, flaws & works updated).');
        } catch (err: any) {
            const msg = err?.message || 'AI profile compilation failed.';
            setCompileOwnError(msg);
            toast.error(msg);
        } finally {
            setIsCompilingOwnProfile(false);
        }
    };

    const handleSyncOwnProfileToDirectory = async () => {
        if (!profile) return;
        const publishedNode = {
            ...profile,
            aiAuthored: Boolean(profile.aiAuthored || profile.aiDossier)
        };

        const existsIndex = networkProfiles.findIndex(
            (p) => p.id === profile.id || p.username.toLowerCase() === profile.username.toLowerCase()
        );
        const updated =
            existsIndex >= 0
                ? networkProfiles.map((p, idx) => (idx === existsIndex ? publishedNode : p))
                : [publishedNode, ...networkProfiles];

        setNetworkProfiles(updated);
        try {
            await safeStorage.setItem('aetheros_network_profiles', JSON.stringify(updated));
        } catch (err) {
            console.error('[CodingNetworkProfileSystem] Failed to persist synced profile:', err);
        }
        toast.success(`Published @${profile.username} to the Coding Network Directory.`);
    };

    const handleAILookupPeer = async (e: React.FormEvent) => {
        e.preventDefault();
        const handle = peerLookupHandle.trim().replace(/^@/, '');
        if (!handle && !peerLookupGithub.trim() && !peerLookupWebsite.trim()) {
            setCompilePeerError('Enter a developer name, handle, GitHub URL, or portfolio link.');
            return;
        }

        setIsCompilingPeer(true);
        setCompilePeerError(null);

        try {
            const result = await compileAIProfile({
                identifier: handle || peerLookupGithub.trim() || peerLookupWebsite.trim(),
                githubUrl: peerLookupGithub.trim(),
                portfolioUrl: peerLookupWebsite.trim(),
                includeWorkspaceContext: false
            });

            const newProfile = {
                id: `dev_ai_${Date.now()}`,
                role: 'user',
                skillEndorsements: {},
                ...result.profileUpdates
            };

            const updated = [newProfile, ...networkProfiles];
            setNetworkProfiles(updated);
            await safeStorage.setItem('aetheros_network_profiles', JSON.stringify(updated));

            setIsAILookupModalOpen(false);
            setPeerLookupHandle('');
            setPeerLookupGithub('');
            setPeerLookupWebsite('');
            setProfilesSubMode('directory');
            setSelectedProfileNode(newProfile);
            toast.success(`AI compiled unfiltered profile for @${newProfile.username}`);
        } catch (err: any) {
            const msg = err?.message || 'AI developer lookup failed.';
            setCompilePeerError(msg);
            toast.error(msg);
        } finally {
            setIsCompilingPeer(false);
        }
    };

    const renderPortfolioIcon = (label: string, url: string) => {
        const combined = `${label} ${url}`.toLowerCase();
        if (combined.includes('github')) {
            return <GitBranch className="w-3.5 h-3.5 text-zinc-300 shrink-0" />;
        }
        return <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    };

    const ownLanguages: ProgrammingLanguageEntry[] = profile?.programmingLanguages || [];

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
            {/* Header Bar */}
            <div className="bg-[#0b0f17] border border-white/10 p-6 rounded-2xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            <span>AI-Compiled Developer Profiles</span>
                            <span aria-hidden="true">·</span>
                            <span>Unfiltered Strengths &amp; Flaws</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">
                            Network Developer Dossiers
                        </h3>
                        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                            Profiles are compiled and maintained by AI from codebase evidence, session telemetry, and public web records — displaying verified accomplishments alongside bugs, tech debt, and shortcomings.
                        </p>
                    </div>

                    <div className="w-full lg:w-auto flex flex-col gap-2.5">
                        <div className="flex flex-wrap gap-2">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search developer, language, flaw, project..."
                                    value={searchProfileQuery}
                                    onChange={(e) => setSearchProfileQuery(e.target.value)}
                                    className="w-full bg-[#060911] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono placeholder:text-zinc-600"
                                />
                            </div>
                            <select
                                value={languageFilter}
                                onChange={(e) => setLanguageFilter(e.target.value)}
                                className="bg-[#060911] border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                                title="Filter directory by programming language"
                            >
                                <option value="ALL">All Languages</option>
                                {availableLanguages.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex bg-[#060911] border border-white/10 p-1 rounded-xl flex-1 sm:w-64">
                                <button
                                    onClick={() => setSkillFilterMode('all')}
                                    className={`flex-1 text-[10px] font-mono font-semibold py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                                        skillFilterMode === 'all'
                                            ? 'bg-slate-800 text-white'
                                            : 'text-zinc-400 hover:text-zinc-200'
                                    }`}
                                >
                                    All Nodes
                                </button>
                                <button
                                    onClick={() => setSkillFilterMode('possess')}
                                    className={`flex-1 text-[10px] font-mono font-semibold py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                                        skillFilterMode === 'possess'
                                            ? 'bg-slate-800 text-white'
                                            : 'text-zinc-400 hover:text-zinc-200'
                                    }`}
                                >
                                    Skills
                                </button>
                                <button
                                    onClick={() => setSkillFilterMode('mentor')}
                                    className={`flex-1 text-[10px] font-mono font-semibold py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                                        skillFilterMode === 'mentor'
                                            ? 'bg-slate-800 text-white'
                                            : 'text-zinc-400 hover:text-zinc-200'
                                    }`}
                                >
                                    Mentors
                                </button>
                            </div>

                            <button
                                onClick={() => setIsAILookupModalOpen(true)}
                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                                <UserSearch className="w-3.5 h-3.5" />
                                <span>AI Audit Developer</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub Navigation Tabs */}
            <div className="flex bg-[#0b0f17] p-1.5 rounded-xl border border-white/10 max-w-lg mx-auto">
                <button
                    onClick={() => setProfilesSubMode('directory')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        profilesSubMode === 'directory'
                            ? 'bg-slate-800 text-white'
                            : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    <Users className="w-3.5 h-3.5" />
                    <span>Nodes Directory ({filteredProfiles.length})</span>
                </button>
                <button
                    onClick={() => setProfilesSubMode('my_profile')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        profilesSubMode === 'my_profile'
                            ? 'bg-slate-800 text-white'
                            : 'text-zinc-400 hover:text-white'
                    }`}
                >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>My AI Profile</span>
                </button>
            </div>

            {profilesSubMode === 'directory' ? (
                <>
                    {/* Directory Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredProfiles.map((p) => {
                            const matchInfo = calculateCompatibility(profile, p);
                            const langs: ProgrammingLanguageEntry[] = p.programmingLanguages || [];
                            const projs: ProfileProject[] = p.profileProjects || [];
                            const links: PortfolioLink[] = p.portfolioLinks || [];
                            const goodCount = p.aiDossier?.theGood?.length || 0;
                            const badCount = p.aiDossier?.theBad?.length || 0;

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedProfileNode(p)}
                                    className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 hover:border-cyan-500/40 transition-colors cursor-pointer flex flex-col justify-between gap-4 text-left"
                                >
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <ProfileAvatar src={p.avatarUrl} username={p.username} />
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-mono text-sm font-bold text-white truncate">
                                                            @{p.username}
                                                        </span>
                                                        <span className="text-xs font-mono text-zinc-400">
                                                            · {p.experienceLevel || 'Developer'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                                                        {p.tagline || 'Coding Network Member'}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 mt-1 tabular-nums flex-wrap">
                                                        <span className="text-amber-300/90">AI-Compiled</span>
                                                        {p.aiTrustRankNumber ? (
                                                            <>
                                                                <span aria-hidden="true">·</span>
                                                                <span className="text-cyan-300 font-semibold">
                                                                    Rank {getRankSpec(p.aiTrustRankNumber).romanNumeral} ·{' '}
                                                                    {p.aiTrustTitle || getRankSpec(p.aiTrustRankNumber).title}
                                                                </span>
                                                            </>
                                                        ) : null}
                                                        {p.realName ? (
                                                            <>
                                                                <span aria-hidden="true">·</span>
                                                                <span className="text-zinc-300">{p.realName}</span>
                                                            </>
                                                        ) : null}
                                                        {p.aiDossier && (
                                                            <>
                                                                <span aria-hidden="true">·</span>
                                                                <span className="text-emerald-400">{goodCount} strengths</span>
                                                                <span aria-hidden="true">·</span>
                                                                <span className="text-rose-400">{badCount} flaws</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono font-semibold text-zinc-300 tabular-nums shrink-0">
                                                {matchInfo.score}% match
                                            </span>
                                        </div>

                                        {/* Biography & AI Verdict */}
                                        <div className="space-y-1.5">
                                            <h5 className="text-[11px] font-mono text-zinc-400 font-semibold">
                                                AI Biography &amp; Verdict
                                            </h5>
                                            <p className="text-xs text-zinc-200 leading-relaxed line-clamp-2">
                                                {p.aiDossier?.verdictSummary || p.bio}
                                            </p>
                                        </div>

                                        {/* Programming Languages (clean metadata row) */}
                                        {langs.length > 0 && (
                                            <div className="space-y-1">
                                                <h5 className="text-[11px] font-mono text-zinc-400 font-semibold">
                                                    Languages Assessed
                                                </h5>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono tabular-nums">
                                                    {langs.slice(0, 4).map((lang) => {
                                                        const meta = PROFICIENCY_META[lang.proficiency] || PROFICIENCY_META.Intermediate;
                                                        return (
                                                            <span key={lang.name} className="text-zinc-200">
                                                                {lang.name}{' '}
                                                                <span className={`text-[11px] ${meta.textClass}`}>
                                                                    ({lang.proficiency})
                                                                </span>
                                                            </span>
                                                        );
                                                    })}
                                                    {langs.length > 4 && (
                                                        <span className="text-zinc-500">+{langs.length - 4} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Technical Skills */}
                                        <div className="space-y-1">
                                            <h5 className="text-[11px] font-mono text-zinc-400 font-semibold">
                                                Technical Skills
                                            </h5>
                                            <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                                                {(p.skills || []).slice(0, 6).join(' · ') || 'None detected'}
                                                {(p.skills || []).length > 6 ? ` · +${(p.skills || []).length - 6} more` : ''}
                                            </p>
                                        </div>

                                        {/* Projects Summary */}
                                        {projs.length > 0 && (
                                            <div className="pt-2 border-t border-white/5 space-y-1.5">
                                                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 tabular-nums">
                                                    <span>Audited Works ({projs.length})</span>
                                                    <span>
                                                        {projs.filter((pr) => pr.contributionType === 'completed' || pr.status === 'past').length} completed
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    {projs.slice(0, 2).map((pr) => {
                                                        const statusInfo = getContributionLabel(pr);
                                                        return (
                                                            <div
                                                                key={pr.id}
                                                                className="flex items-center justify-between gap-2 text-xs font-mono"
                                                            >
                                                                <span className="text-zinc-200 truncate">{pr.title}</span>
                                                                <span className={`text-[11px] shrink-0 ${statusInfo.textClass}`}>
                                                                    {statusInfo.label}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Links & Actions */}
                                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                                        <div className="flex flex-wrap items-center gap-3">
                                            {links.slice(0, 2).map((lnk) => (
                                                <a
                                                    key={lnk.id}
                                                    href={normalizeUrl(lnk.url)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-zinc-300 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
                                                >
                                                    {renderPortfolioIcon(lnk.label, lnk.url)}
                                                    <span>{lnk.label}</span>
                                                    <ExternalLink className="w-3 h-3 opacity-60" />
                                                </a>
                                            ))}
                                            {links.length === 0 && (
                                                <span className="text-zinc-500">No external links</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 ml-auto">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onInviteProfile(p);
                                                }}
                                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-100 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer"
                                            >
                                                Invite
                                            </button>
                                            <span className="text-cyan-400 font-semibold">Inspect &rarr;</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredProfiles.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl space-y-3">
                            <span className="text-zinc-400 block font-mono text-xs">
                                No developer profiles match your current filter criteria.
                            </span>
                            {(searchProfileQuery || languageFilter !== 'ALL' || skillFilterMode !== 'all') && (
                                <button
                                    onClick={() => {
                                        setSearchProfileQuery('');
                                        setLanguageFilter('ALL');
                                        setSkillFilterMode('all');
                                    }}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-zinc-200 cursor-pointer"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    )}
                </>
            ) : (
                /* MY AI PROFILE: Strictly Read-Only to the User — Populated Exclusively by Gemini AI */
                <div className="space-y-6 text-left">
                    {/* Discovery Identifier & AI Audit Trigger Form */}
                    <form
                        onSubmit={handleRunAIProfileCompile}
                        className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-4"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>AI-Filled Profile (User Cannot Edit Bio, Skills, or Reviews)</span>
                                </div>
                                <h4 className="text-lg font-bold text-white tracking-tight">
                                    AI Profile Discovery &amp; Unfiltered Audit
                                </h4>
                                <p className="text-xs text-zinc-400 max-w-2xl">
                                    Supply your handle, GitHub URL, website, or email below so AI knows who to look up. AI investigates public web sources, your workspace code, and session telemetry to populate everything it finds — good and bad.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                <button
                                    type="submit"
                                    disabled={isCompilingOwnProfile}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-black font-mono text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
                                >
                                    {isCompilingOwnProfile ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Auditing Works...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>{profile?.aiDossier ? 'Re-Audit via AI' : 'Compile Profile via AI'}</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSyncOwnProfileToDirectory}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-100 font-mono text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                                >
                                    Publish to Directory
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                            <div className="space-y-1">
                                <label className="text-[11px] text-zinc-400 block">Name / Handle to Audit</label>
                                <input
                                    type="text"
                                    value={lookupIdentifier}
                                    onChange={(e) => setLookupIdentifier(e.target.value)}
                                    placeholder="e.g. Aetheros_Prime or full name"
                                    className="w-full bg-[#060911] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] text-zinc-400 block">GitHub Profile URL (Optional)</label>
                                <input
                                    type="text"
                                    value={lookupGithubUrl}
                                    onChange={(e) => setLookupGithubUrl(e.target.value)}
                                    placeholder="https://github.com/username"
                                    className="w-full bg-[#060911] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] text-zinc-400 block">Website / Portfolio URL (Optional)</label>
                                <input
                                    type="text"
                                    value={lookupPortfolioUrl}
                                    onChange={(e) => setLookupPortfolioUrl(e.target.value)}
                                    placeholder="https://yoursite.dev"
                                    className="w-full bg-[#060911] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] text-zinc-400 block">Account Email (Optional)</label>
                                <input
                                    type="text"
                                    value={lookupEmail}
                                    onChange={(e) => setLookupEmail(e.target.value)}
                                    placeholder="you@domain.com"
                                    className="w-full bg-[#060911] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                        </div>

                        <label className="inline-flex items-center gap-2 text-xs text-zinc-300 font-mono cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={includeWorkspaceContext}
                                onChange={(e) => setIncludeWorkspaceContext(e.target.checked)}
                                className="rounded border-white/20 bg-[#060911] accent-cyan-500"
                            />
                            <span>
                                Inspect live workspace codebase, active projects, chat history, and glitch telemetry ({glitchHistory.length} glitches, {projects.length} projects)
                            </span>
                        </label>

                        {compileOwnError && (
                            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 flex items-start justify-between gap-3 text-xs text-rose-200 font-mono">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="font-semibold">AI Profile Audit Failed</p>
                                        <p className="text-rose-200/90">{compileOwnError}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRunAIProfileCompile()}
                                    className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                    </form>

                    {/* Loading Skeleton while AI Audits */}
                    {isCompilingOwnProfile && (
                        <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-4 animate-pulse">
                            <div className="h-4 w-56 bg-slate-800 rounded" />
                            <div className="h-12 w-full bg-slate-800/70 rounded" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="h-36 bg-slate-800/60 rounded-xl" />
                                <div className="h-36 bg-slate-800/60 rounded-xl" />
                            </div>
                        </div>
                    )}

                    {/* Unfiltered AI Dossier: The Good & The Bad */}
                    {!isCompilingOwnProfile && (
                        <AIDossierPanel dossier={profile?.aiDossier} username={profile?.username} />
                    )}

                    {/* Full Read-Only AI-Populated 5-Section Developer Profile */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Skill Signature Matrix */}
                            <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-2">
                                <h4 className="text-xs font-mono text-zinc-200 uppercase tracking-wider font-bold">
                                    Assessed Skill Distribution
                                </h4>
                                <p className="text-xs text-zinc-400">
                                    Compiled from AI audit findings and peer endorsements.
                                </p>

                                <div className="h-[220px] w-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarDataForOwnNode}>
                                            <PolarGrid stroke="#1e293b" />
                                            <PolarAngleAxis
                                                dataKey="subject"
                                                tick={{ fill: '#cbd5e1', fontSize: 9, fontFamily: 'monospace' }}
                                            />
                                            <PolarRadiusAxis
                                                angle={30}
                                                domain={[0, 100]}
                                                tick={{ fill: '#64748b', fontSize: 8 }}
                                            />
                                            <Radar
                                                name="Assessed"
                                                dataKey="value"
                                                stroke="#06b6d4"
                                                fill="#06b6d4"
                                                fillOpacity={0.22}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Assessed Programming Languages (Read-Only) */}
                            <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                    <h5 className="text-xs font-mono text-zinc-200 uppercase tracking-wider font-bold flex items-center gap-2">
                                        <Code2 className="w-4 h-4 text-cyan-400" />
                                        <span>Programming Languages Assessed</span>
                                    </h5>
                                    <span className="text-xs font-mono text-zinc-400 tabular-nums">
                                        {ownLanguages.length} detected
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {ownLanguages.map((lang) => {
                                        const meta = PROFICIENCY_META[lang.proficiency] || PROFICIENCY_META.Intermediate;
                                        return (
                                            <div key={lang.name} className="space-y-1.5 pb-2.5 border-b border-white/5 last:border-b-0 last:pb-0">
                                                <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
                                                    <span className="font-semibold text-white">{lang.name}</span>
                                                    <span className={meta.textClass}>
                                                        {lang.proficiency}
                                                        {typeof lang.years === 'number' && lang.years > 0 ? ` · ${lang.years}y` : ''}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                                    <div className={`h-full ${meta.barClass}`} style={{ width: `${meta.pct}%` }} />
                                                </div>
                                                {lang.aiEvidence && (
                                                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                                                        {lang.aiEvidence}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {ownLanguages.length === 0 && (
                                        <p className="text-xs text-zinc-500 font-mono">
                                            Run AI audit to assess language proficiencies.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Audited Skills & Inferred Blind Spots */}
                            <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <h5 className="text-xs font-mono text-zinc-300 uppercase tracking-wider font-bold">
                                        Observed Technical Skills
                                    </h5>
                                    <p className="text-xs font-mono text-zinc-200 leading-relaxed">
                                        {(profile?.skills || []).join(' · ') || 'Awaiting AI audit'}
                                    </p>
                                </div>
                                <div className="space-y-1.5 pt-3 border-t border-white/10">
                                    <h5 className="text-xs font-mono text-rose-300 uppercase tracking-wider font-bold">
                                        Detected Gaps / Weaknesses
                                    </h5>
                                    <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                                        {(profile?.lookingForSkills || []).join(' · ') || 'None noted yet'}
                                    </p>
                                </div>
                                <div className="space-y-1.5 pt-3 border-t border-white/10">
                                    <h5 className="text-xs font-mono text-emerald-300 uppercase tracking-wider font-bold">
                                        Verified Areas of Strength
                                    </h5>
                                    <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                                        {(profile?.willingToTeachSkills || []).join(' · ') || 'None verified yet'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: AI Biography, Links, Audited Works */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* AI-Authored Biography (Read-Only) */}
                            <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                                    <div>
                                        <h4 className="text-base font-bold text-white">
                                            @{profile?.username}
                                            {profile?.realName ? (
                                                <span className="text-xs font-mono text-amber-300 font-normal ml-2">
                                                    ({profile.realName})
                                                </span>
                                            ) : null}
                                        </h4>
                                        <p className="text-xs text-zinc-400 font-mono">
                                            {profile?.experienceLevel || 'Developer'} · {profile?.tagline || 'Uncompiled node'}
                                        </p>
                                        {profile?.aiTrustRankNumber ? (
                                            <p className="text-[11px] font-mono text-cyan-300 mt-1">
                                                AI Rank {getRankSpec(profile.aiTrustRankNumber).romanNumeral} —{' '}
                                                {profile.aiTrustTitle || getRankSpec(profile.aiTrustRankNumber).title} ·{' '}
                                                {(profile.grantedRanks || []).length} Set-in-Stone Seal
                                                {(profile.grantedRanks || []).length === 1 ? '' : 's'}
                                            </p>
                                        ) : null}
                                    </div>
                                    <span className="text-[11px] font-mono text-amber-300 inline-flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        AI-Written (Read-Only)
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <h5 className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                                        AI-Authored Biography
                                    </h5>
                                    <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                                        {profile?.bio || 'Run AI audit to generate an unfiltered biography from your works.'}
                                    </p>
                                </div>
                            </div>

                            {/* Discovered Portfolio & GitHub Links (Read-Only) */}
                            <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                    <h4 className="text-xs font-mono text-zinc-200 uppercase tracking-wider font-bold flex items-center gap-2">
                                        <GitBranch className="w-4 h-4 text-zinc-300" />
                                        <span>Discovered Portfolio, GitHub &amp; Web Links</span>
                                    </h4>
                                    <span className="text-xs font-mono text-zinc-400 tabular-nums">
                                        {(profile?.portfolioLinks || []).length} linked
                                    </span>
                                </div>

                                {(profile?.portfolioLinks || []).length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(profile?.portfolioLinks || []).map((lnk) => (
                                            <a
                                                key={lnk.id}
                                                href={normalizeUrl(lnk.url)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between gap-2 p-3 bg-[#060911] hover:bg-slate-900 border border-white/10 rounded-xl transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    {renderPortfolioIcon(lnk.label, lnk.url)}
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-mono font-semibold text-zinc-100 truncate">
                                                            {lnk.label}
                                                        </div>
                                                        <div className="text-[11px] font-mono text-zinc-400 truncate">
                                                            {lnk.url}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-500 font-mono">
                                        No verified GitHub or portfolio links discovered yet.
                                    </p>
                                )}
                            </div>

                            {/* Works & Projects Audit (Read-Only) */}
                            <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                    <h4 className="text-xs font-mono text-zinc-200 uppercase tracking-wider font-bold flex items-center gap-2">
                                        <FolderGit2 className="w-4 h-4 text-cyan-400" />
                                        <span>Audited Works &amp; Contributed Projects</span>
                                    </h4>
                                    <span className="text-xs font-mono text-zinc-400 tabular-nums">
                                        {(profile?.profileProjects || []).length} works
                                    </span>
                                </div>

                                <div className="divide-y divide-white/10">
                                    {(profile?.profileProjects || []).map((pro) => {
                                        const statusInfo = getContributionLabel(pro);
                                        return (
                                            <div key={pro.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                    <h5 className="text-sm font-bold text-white font-mono">
                                                        {pro.title}
                                                    </h5>
                                                    <div className="flex items-center gap-2 text-xs font-mono">
                                                        <span className="text-zinc-400">{pro.roleDefined || 'Contributor'}</span>
                                                        <span aria-hidden="true">·</span>
                                                        <span className={statusInfo.textClass}>{statusInfo.label}</span>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-zinc-300 leading-relaxed">
                                                    {pro.description}
                                                </p>

                                                {pro.aiCritique && (
                                                    <div className="p-3 rounded-xl bg-[#060911] border border-white/10 space-y-1">
                                                        <span className="text-[11px] font-mono text-amber-300 font-semibold block">
                                                            AI Assessment (Good &amp; Bad)
                                                        </span>
                                                        <p className="text-xs text-zinc-300 leading-relaxed">
                                                            {pro.aiCritique}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono">
                                                    <span className="text-zinc-400">
                                                        {(pro.technologies || []).join(' · ')}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        {(pro.sourceCodeUrl || pro.link) && (
                                                            <a
                                                                href={normalizeUrl(pro.sourceCodeUrl || pro.link || '')}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
                                                            >
                                                                <span>Repository</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                        {pro.liveDemoUrl && (
                                                            <a
                                                                href={normalizeUrl(pro.liveDemoUrl)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1"
                                                            >
                                                                <span>Live</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(profile?.profileProjects || []).length === 0 && (
                                        <p className="text-xs text-zinc-500 font-mono py-2">
                                            No works cataloged yet. Run the AI Profile Audit above.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Profile Node Detail Modal */}
            <AnimatePresence>
                {selectedProfileNode && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            className="w-full max-w-4xl bg-[#090d14] border border-white/15 rounded-2xl overflow-hidden shadow-2xl relative block text-left"
                        >
                            {/* Modal Header */}
                            <div className="p-6 bg-[#060911] border-b border-white/10 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <ProfileAvatar
                                        src={selectedProfileNode.avatarUrl}
                                        username={selectedProfileNode.username}
                                        sizeClass="w-14 h-14"
                                    />
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-bold text-white truncate">
                                            @{selectedProfileNode.username}
                                            {selectedProfileNode.realName ? (
                                                <span className="text-sm font-mono text-amber-300 font-normal ml-2">
                                                    · {selectedProfileNode.realName}
                                                </span>
                                            ) : null}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400 mt-0.5">
                                            <span>{selectedProfileNode.experienceLevel || 'Developer'}</span>
                                            {selectedProfileNode.aiTrustRankNumber ? (
                                                <>
                                                    <span aria-hidden="true">·</span>
                                                    <span className="text-cyan-300 font-semibold">
                                                        Rank {getRankSpec(selectedProfileNode.aiTrustRankNumber).romanNumeral} (
                                                        {selectedProfileNode.aiTrustTitle || getRankSpec(selectedProfileNode.aiTrustRankNumber).title})
                                                    </span>
                                                </>
                                            ) : null}
                                            {selectedProfileNode.tagline && (
                                                <>
                                                    <span aria-hidden="true">·</span>
                                                    <span className="truncate">{selectedProfileNode.tagline}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedProfileNode(null)}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-200 rounded-xl transition-colors text-xs font-mono font-semibold cursor-pointer shrink-0"
                                >
                                    Close
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 md:p-8 space-y-6 max-h-[74vh] overflow-y-auto custom-scrollbar">
                                {/* Unfiltered AI Dossier (The Good & The Bad) */}
                                <AIDossierPanel
                                    dossier={selectedProfileNode.aiDossier}
                                    username={selectedProfileNode.username}
                                />

                                {/* 1. Biography */}
                                <div className="p-5 bg-[#0b0f17] border border-white/10 rounded-2xl space-y-2">
                                    <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-wider font-bold flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-cyan-400" />
                                        <span>1. AI-Authored Biography</span>
                                    </h4>
                                    <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                                        {selectedProfileNode.bio}
                                    </p>
                                </div>

                                {/* Compatibility Summary */}
                                {(() => {
                                    const matchInfo = calculateCompatibility(profile, selectedProfileNode);
                                    return (
                                        <div className="p-5 bg-[#0b0f17] border border-white/10 rounded-2xl space-y-2">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-wider font-bold">
                                                    Compatibility Matrix
                                                </h4>
                                                <span className="text-xs font-mono font-bold text-cyan-300 tabular-nums">
                                                    {matchInfo.score}% match
                                                </span>
                                            </div>
                                            <div className="space-y-1 pt-1">
                                                {(matchInfo?.reasons || []).map((r, i) => (
                                                    <p key={i} className="text-xs text-zinc-300 font-mono">
                                                        {r}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* 2. Programming Languages */}
                                <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-wider font-bold flex items-center gap-2">
                                            <Code2 className="w-4 h-4 text-cyan-400" />
                                            <span>2. Programming Languages &amp; Proficiency</span>
                                        </h4>
                                        <span className="text-xs font-mono text-zinc-400 tabular-nums">
                                            {(selectedProfileNode.programmingLanguages || []).length} languages
                                        </span>
                                    </div>
                                    {(selectedProfileNode.programmingLanguages || []).length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {(selectedProfileNode.programmingLanguages || []).map((lang: ProgrammingLanguageEntry) => {
                                                const meta = PROFICIENCY_META[lang.proficiency] || PROFICIENCY_META.Intermediate;
                                                return (
                                                    <div key={lang.name} className="space-y-1.5">
                                                        <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
                                                            <span className="font-bold text-white">{lang.name}</span>
                                                            <span className={meta.textClass}>
                                                                {lang.proficiency}
                                                                {typeof lang.years === 'number' && lang.years > 0 ? ` · ${lang.years}y` : ''}
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                                            <div className={`h-full ${meta.barClass}`} style={{ width: `${meta.pct}%` }} />
                                                        </div>
                                                        {lang.aiEvidence && (
                                                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                                                                {lang.aiEvidence}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-xs font-mono text-zinc-500">
                                            No programming language proficiencies recorded.
                                        </p>
                                    )}
                                </div>

                                {/* 3. Technical Skills + Radar */}
                                <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-5 space-y-4">
                                    <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-wider font-bold flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-cyan-400" />
                                        <span>3. Technical Skills &amp; Peer Endorsements</span>
                                    </h4>
                                    <div className="h-[210px] w-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarDataForSelectedNode}>
                                                <PolarGrid stroke="#1e293b" />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{ fill: '#cbd5e1', fontSize: 9, fontFamily: 'monospace' }}
                                                />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
                                                <Radar name="Proficiency" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.22} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                                        {(selectedProfileNode.skills || []).map((s: string) => {
                                            const endorsers = selectedProfileNode.skillEndorsements?.[s] || [];
                                            const hasEndorsed = endorsers.includes(profile?.username || 'Aetheros_Prime');
                                            return (
                                                <button
                                                    key={s}
                                                    onClick={() =>
                                                        setEndorsementConfirmation({
                                                            profileId: selectedProfileNode.id,
                                                            profileUsername: selectedProfileNode.username,
                                                            skillName: s,
                                                            isRemoving: hasEndorsed
                                                        })
                                                    }
                                                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors ${
                                                        hasEndorsed
                                                            ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200'
                                                            : 'bg-[#060911] hover:bg-slate-900 text-zinc-200 border-white/10'
                                                    }`}
                                                >
                                                    <span>{s}</span>
                                                    <span className="text-[11px] text-zinc-400 tabular-nums">{endorsers.length}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {(selectedProfileNode.lookingForSkills || []).length > 0 && (
                                        <p className="text-xs font-mono text-zinc-400">
                                            <span className="text-rose-300 font-semibold">Detected gaps / seeking:</span>{' '}
                                            {(selectedProfileNode.lookingForSkills || []).join(' · ')}
                                        </p>
                                    )}
                                </div>

                                {/* 4. Portfolio & GitHub Links */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-wider font-bold flex items-center gap-2">
                                        <GitBranch className="w-4 h-4 text-zinc-300" />
                                        <span>4. Portfolio &amp; GitHub Links</span>
                                    </h4>
                                    {(selectedProfileNode.portfolioLinks || []).length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {(selectedProfileNode.portfolioLinks || []).map((lnk: PortfolioLink) => (
                                                <a
                                                    key={lnk.id}
                                                    href={normalizeUrl(lnk.url)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center justify-between gap-2 p-3 bg-[#0b0f17] hover:bg-slate-900 border border-white/10 rounded-xl transition-colors"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        {renderPortfolioIcon(lnk.label, lnk.url)}
                                                        <div className="min-w-0">
                                                            <div className="text-xs font-mono font-bold text-zinc-100 truncate">
                                                                {lnk.label}
                                                            </div>
                                                            <div className="text-[11px] font-mono text-zinc-400 truncate max-w-[240px]">
                                                                {lnk.url}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs font-mono text-zinc-500">
                                            No GitHub or portfolio links discovered.
                                        </p>
                                    )}
                                </div>

                                {/* 5. Audited Works & Projects */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-wider font-bold flex items-center gap-2">
                                        <FolderGit2 className="w-4 h-4 text-cyan-400" />
                                        <span>5. Audited Works &amp; Contributed Projects</span>
                                    </h4>
                                    {(selectedProfileNode.profileProjects || []).length > 0 ? (
                                        <div className="space-y-4">
                                            {(selectedProfileNode.profileProjects || []).map((pro: ProfileProject) => (
                                                <div key={pro.id} className="space-y-2">
                                                    {pro.aiCritique && (
                                                        <div className="px-4 py-2.5 bg-[#0b0f17] border border-amber-500/25 rounded-xl text-xs text-zinc-300">
                                                            <span className="font-mono text-amber-300 font-semibold">AI Critique: </span>
                                                            {pro.aiCritique}
                                                        </div>
                                                    )}
                                                    <PortfolioProjectCard
                                                        project={pro}
                                                        isOwnProject={false}
                                                        onAddTestimonial={onPeerProjectAddTestimonial}
                                                        onEndorse={onPeerEndorseProject}
                                                        onRate={onPeerRateProject}
                                                        currentUsername={profile?.username || 'Operator-You'}
                                                        ownerSkills={selectedProfileNode.skills || []}
                                                        ownerSkillEndorsements={selectedProfileNode.skillEndorsements || {}}
                                                        onQuickEndorse={(skillName) =>
                                                            onToggleEndorseSkill(selectedProfileNode.id, skillName)
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs font-mono text-zinc-500">
                                            No contributed or completed projects recorded yet.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-[#060911] border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
                                <span className="text-xs font-mono text-zinc-500">
                                    Node ID: {selectedProfileNode.id}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            onInviteProfile(selectedProfileNode);
                                            setSelectedProfileNode(null);
                                        }}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                                    >
                                        Invite to Collaborate
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedProfileNode(null);
                                            onSwitchToMatches();
                                        }}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold font-mono transition-colors cursor-pointer"
                                    >
                                        Match Matrix &rarr;
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AI Developer Lookup Modal (No Manual Self-Reporting) */}
            <AnimatePresence>
                {isAILookupModalOpen && (
                    <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
                        <motion.form
                            onSubmit={handleAILookupPeer}
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            className="w-full max-w-lg bg-[#090d14] border border-white/15 rounded-2xl overflow-hidden shadow-2xl text-left"
                        >
                            <div className="p-5 bg-[#060911] border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <UserSearch className="w-4 h-4 text-cyan-400" />
                                    <div>
                                        <h3 className="text-sm font-bold font-mono text-white">
                                            AI Developer Audit &amp; Directory Registration
                                        </h3>
                                        <p className="text-xs text-zinc-400">
                                            Enter a developer handle or URL. AI fills out their full profile — good &amp; bad.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAILookupModalOpen(false)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 font-mono text-xs">
                                <div className="space-y-1">
                                    <label className="text-[11px] text-zinc-300 font-semibold block">
                                        Developer Name or Handle *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. linustorvalds, karpathy, or developer name"
                                        value={peerLookupHandle}
                                        onChange={(e) => setPeerLookupHandle(e.target.value)}
                                        className="w-full bg-[#060911] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] text-zinc-300 font-semibold block">
                                        GitHub URL (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="https://github.com/username"
                                        value={peerLookupGithub}
                                        onChange={(e) => setPeerLookupGithub(e.target.value)}
                                        className="w-full bg-[#060911] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] text-zinc-300 font-semibold block">
                                        Website / Portfolio URL (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="https://developer.dev"
                                        value={peerLookupWebsite}
                                        onChange={(e) => setPeerLookupWebsite(e.target.value)}
                                        className="w-full bg-[#060911] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                                    />
                                </div>

                                {compilePeerError && (
                                    <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                        <span>{compilePeerError}</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-[#060911] border-t border-white/10 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAILookupModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-200 text-xs font-mono rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCompilingPeer}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-black text-xs font-mono font-bold rounded-xl cursor-pointer inline-flex items-center gap-2"
                                >
                                    {isCompilingPeer ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Investigating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>Run AI Profile Audit</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.form>
                    </div>
                )}
            </AnimatePresence>

            {/* Endorsement Confirmation Modal */}
            <AnimatePresence>
                {endorsementConfirmation && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="w-full max-w-md bg-[#090d14] border border-white/15 rounded-2xl overflow-hidden shadow-2xl relative block p-6 space-y-5 text-center"
                        >
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white">
                                    {endorsementConfirmation.isRemoving ? 'Retract Endorsement' : 'Confirm Skill Endorsement'}
                                </h3>
                                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                                    {endorsementConfirmation.isRemoving ? (
                                        <span>
                                            Retract your endorsement for <strong>@{endorsementConfirmation.profileUsername}</strong> in{' '}
                                            <strong className="text-cyan-300">{endorsementConfirmation.skillName}</strong>?
                                        </span>
                                    ) : (
                                        <span>
                                            Endorse <strong>@{endorsementConfirmation.profileUsername}</strong> for{' '}
                                            <strong className="text-cyan-300">{endorsementConfirmation.skillName}</strong>?
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="flex gap-3 justify-center pt-1">
                                <button
                                    onClick={() => setEndorsementConfirmation(null)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-200 rounded-xl transition-colors text-xs font-mono font-semibold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        onToggleEndorseSkill(
                                            endorsementConfirmation.profileId,
                                            endorsementConfirmation.skillName
                                        );
                                        setEndorsementConfirmation(null);
                                    }}
                                    className={`px-4 py-2 text-white rounded-xl text-xs font-semibold font-mono cursor-pointer transition-colors ${
                                        endorsementConfirmation.isRemoving
                                            ? 'bg-rose-600 hover:bg-rose-500'
                                            : 'bg-cyan-600 hover:bg-cyan-500 text-black'
                                    }`}
                                >
                                    {endorsementConfirmation.isRemoving ? 'Retract' : 'Endorse'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
