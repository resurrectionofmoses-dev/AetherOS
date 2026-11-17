import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    Award,
    CheckCircle2,
    Copy,
    Download,
    FileText,
    Lock,
    RefreshCw,
    Scale,
    ShieldCheck,
    Sparkles,
    Terminal,
    Unlock,
    UserCheck,
    Verified
} from 'lucide-react';
import { toast } from 'sonner';
import type {
    ChatMessage,
    GlitchTelemetry,
    IrrevocableRankAward,
    MainView,
    NetworkProject,
    PortableRankCredential,
    TrustActionCategory,
    TrustActionEntry,
    UserProfile
} from '../types';
import {
    ACTION_CATEGORY_LABELS,
    AI_RANK_CHARTER,
    AI_RANK_CHARTER_VERSION,
    computeActionTrustMetrics,
    getCumulativePermissionsForRank,
    getHighestConferredRankNumber,
    getRankSpec
} from '../services/aiTrustCharter';
import {
    evaluateTrustWithAI,
    fetchTrustLedger,
    formatPortableMarkdownAttestation,
    generatePortableHTMLCertificate,
    getRecordedTrustActions,
    getStrictEnforcementPreference,
    mergeIrrevocableAwards,
    recordTrustAction,
    setStrictEnforcementPreference,
    verifySealOrCredential
} from '../services/aiTrustService';

interface AITrustClearanceViewProps {
    profile: UserProfile;
    projects: NetworkProject[];
    glitchHistory: GlitchTelemetry[];
    messages: ChatMessage[];
    savedModulesCount?: number;
    onUpdateProfile: (updates: Partial<UserProfile>) => void;
    onSetView?: (view: MainView | string) => void;
    onStrictEnforcementChange?: (enabled: boolean) => void;
}

type TrustTab = 'overview' | 'charter' | 'actions' | 'portable';

export const AITrustClearanceView: React.FC<AITrustClearanceViewProps> = ({
    profile,
    projects,
    glitchHistory,
    messages,
    savedModulesCount = 0,
    onUpdateProfile,
    onSetView,
    onStrictEnforcementChange
}) => {
    const [activeTab, setActiveTab] = useState<TrustTab>('overview');
    const [realNameInput, setRealNameInput] = useState<string>(profile.realName || '');
    const [actions, setActions] = useState<TrustActionEntry[]>(profile.trustActionHistory || []);
    const [awards, setAwards] = useState<IrrevocableRankAward[]>(profile.grantedRanks || []);
    const [trustScore, setTrustScore] = useState<number>(profile.trustScore || 0);
    const [aiVerdict, setAiVerdict] = useState<string>(profile.aiTrustVerdict || '');
    const [portableCredential, setPortableCredential] = useState<PortableRankCredential | null>(null);
    const [newlyConferred, setNewlyConferred] = useState<IrrevocableRankAward[]>([]);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
    const [evalError, setEvalError] = useState<string | null>(null);
    const [strictEnforcement, setStrictEnforcement] = useState<boolean>(() =>
        getStrictEnforcementPreference()
    );

    // Log a manual / verifiable contribution for AI evaluation
    const [actionCategory, setActionCategory] = useState<TrustActionCategory>('AI_ASSIST');
    const [actionSummary, setActionSummary] = useState<string>('');
    const [actionTarget, setActionTarget] = useState<string>('');

    // External verifier state
    const [verifyInput, setVerifyInput] = useState<string>('');
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [verifyResult, setVerifyResult] = useState<{
        verified: boolean;
        reason: string;
        award?: IrrevocableRankAward;
    } | null>(null);

    const loadTrustState = async () => {
        setIsSyncing(true);
        try {
            const [localActions, ledger] = await Promise.all([
                getRecordedTrustActions(),
                fetchTrustLedger({
                    profileId: profile.id,
                    realName: profile.realName || realNameInput.trim() || undefined,
                    onlineUsername: profile.username
                })
            ]);

            setActions(localActions);
            const mergedAwards = mergeIrrevocableAwards(profile.grantedRanks || [], ledger.awards);
            setAwards(mergedAwards);

            const highestRank = Math.max(
                ledger.highestRankNumber,
                getHighestConferredRankNumber(mergedAwards)
            );
            const highestSpec = highestRank > 0 ? getRankSpec(highestRank) : null;
            const actionMetrics = computeActionTrustMetrics(localActions);
            const computedScore = Math.max(
                profile.trustScore || 0,
                ledger.trustScore,
                actionMetrics.totalPoints
            );

            setTrustScore(computedScore);
            if (ledger.lastVerdict) setAiVerdict(ledger.lastVerdict);
            if (ledger.portableCredential) setPortableCredential(ledger.portableCredential);

            if (highestRank > (profile.aiTrustRankNumber || 0) || mergedAwards.length > (profile.grantedRanks?.length || 0)) {
                onUpdateProfile({
                    realName: (mergedAwards[0]?.realName || profile.realName || realNameInput.trim()) || undefined,
                    aiTrustRankNumber: highestRank,
                    aiTrustTitle: highestSpec ? highestSpec.title : 'Unranked Applicant',
                    grantedRanks: mergedAwards,
                    unlockedPermissions: getCumulativePermissionsForRank(highestRank),
                    trustScore: computedScore,
                    aiTrustVerdict: ledger.lastVerdict || profile.aiTrustVerdict,
                    portableCredentialSeal: ledger.portableCredential?.masterSealSignature,
                    trustActionHistory: localActions
                });
            }
        } catch (err) {
            // Fall back smoothly to local encrypted data if server offline
            const localActions = await getRecordedTrustActions();
            setActions(localActions);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        setRealNameInput(profile.realName || '');
    }, [profile.realName]);

    useEffect(() => {
        loadTrustState();
        const handleActionRecorded = () => {
            getRecordedTrustActions().then(setActions).catch(() => {});
        };
        window.addEventListener('aetheros_trust_action_recorded', handleActionRecorded);
        return () => window.removeEventListener('aetheros_trust_action_recorded', handleActionRecorded);
    }, [profile.id, profile.username]);

    const highestRankNumber = useMemo(
        () => Math.max(profile.aiTrustRankNumber || 0, getHighestConferredRankNumber(awards)),
        [profile.aiTrustRankNumber, awards]
    );
    const highestRankSpec = highestRankNumber > 0 ? getRankSpec(highestRankNumber) : null;
    const nextRankSpec =
        highestRankNumber < AI_RANK_CHARTER.length ? getRankSpec(highestRankNumber + 1) : null;

    const cumulativePermissions = useMemo(
        () => getCumulativePermissionsForRank(highestRankNumber),
        [highestRankNumber]
    );

    const actionMetrics = useMemo(() => computeActionTrustMetrics(actions), [actions]);
    const effectiveDisplayActionsCount = Math.max(
        actions.length,
        (messages.filter((m) => m.sender === 'user').length > 0 ? 1 : 0) +
            projects.reduce((acc, p) => acc + (p.tasks || []).filter((t) => t.completed).length, 0) +
            glitchHistory.length +
            savedModulesCount
    );

    const handleToggleStrictEnforcement = () => {
        const next = !strictEnforcement;
        setStrictEnforcement(next);
        setStrictEnforcementPreference(next);
        onStrictEnforcementChange?.(next);
        toast.success(
            next
                ? 'Strict AI Rank View Gating Enabled'
                : 'Strict AI Rank View Gating Disabled',
            {
                description: next
                    ? 'AetherOS views above your earned AI Rank are now gated until conferred by AI.'
                    : 'View exploration unlocked; core AI /command permissions remain Rank-enforced.'
            }
        );
    };

    const handleRecordContribution = async (e: React.FormEvent) => {
        e.preventDefault();
        if (actionSummary.trim().length < 6) {
            toast.error('Describe the concrete action performed (at least 6 characters).');
            return;
        }
        const pointsMap: Record<TrustActionCategory, number> = {
            AI_ASSIST: 12,
            STABILITY: 14,
            ENGINEERING: 16,
            SECURITY: 16,
            GOVERNANCE: 15
        };
        const updated = await recordTrustAction({
            category: actionCategory,
            actionType: 'VERIFIED_CONTRIBUTOR_LOG',
            summary: actionSummary.trim(),
            target: actionTarget.trim() || undefined,
            trustPointsAwarded: pointsMap[actionCategory],
            verifiedBy: 'SYSTEM_TELEMETRY'
        });
        setActions(updated);
        const newTotal = computeActionTrustMetrics(updated).totalPoints;
        setTrustScore((prev) => Math.max(prev, newTotal));
        onUpdateProfile({ trustActionHistory: updated });
        setActionSummary('');
        setActionTarget('');
        toast.success('Action recorded in tamper-evident ledger. Run AI Trust Evaluation to apply toward your Rank.');
    };

    const handleRequestAIEvaluation = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmedName = realNameInput.trim().replace(/\s+/g, ' ');
        if (trimmedName.length < 3 || !trimmedName.includes(' ')) {
            setEvalError(
                'Provide your full Real Name (First and Last) so AI permanently attaches your earned rank and title to both your online profile and your real-world identity.'
            );
            return;
        }

        setIsEvaluating(true);
        setEvalError(null);
        setNewlyConferred([]);

        try {
            const userMsgsCount = messages.filter((m) => m.sender === 'user').length;
            const result = await evaluateTrustWithAI({
                profile,
                realName: trimmedName,
                projects,
                glitchHistory,
                messageCount: userMsgsCount,
                modulesCount: savedModulesCount
            });

            const mergedAwards = mergeIrrevocableAwards(awards, result.allConferredRanks);
            setAwards(mergedAwards);
            setTrustScore(result.trustScore);
            setAiVerdict(result.aiEvaluationSummary);
            setPortableCredential(result.portableCredential);
            setNewlyConferred(result.newlyConferredRanks);

            const resolvedHighest = Math.max(
                result.highestRankNumber,
                getHighestConferredRankNumber(mergedAwards)
            );
            const resolvedSpec = resolvedHighest > 0 ? getRankSpec(resolvedHighest) : null;

            onUpdateProfile({
                realName: trimmedName,
                trustScore: result.trustScore,
                aiTrustRankNumber: resolvedHighest,
                aiTrustTitle: resolvedSpec ? resolvedSpec.title : result.highestTitle,
                aiTrustVerdict: result.aiEvaluationSummary,
                grantedRanks: mergedAwards,
                unlockedPermissions: getCumulativePermissionsForRank(resolvedHighest),
                portableCredentialSeal: result.portableCredential?.masterSealSignature,
                trustActionHistory: await getRecordedTrustActions()
            });

            if (result.newlyConferredRanks.length > 0) {
                const topNew = result.newlyConferredRanks[result.newlyConferredRanks.length - 1];
                toast.success(`Set in Stone: Rank ${topNew.romanNumeral} — ${topNew.title}`, {
                    description: `Permanently bound to ${trimmedName} (@${profile.username}). This rank can never be revoked.`
                });
            } else {
                toast.success('AI Trust Audit Completed', {
                    description: `Current Trust Score: ${result.trustScore} | Permanent Rank: ${resolvedHighest > 0 ? `${resolvedHighest} (${resolvedSpec?.title})` : 'Pending Rank I action'}`
                });
            }
        } catch (err: any) {
            const msg = err?.message || 'AI trust evaluation failed.';
            setEvalError(msg);
            toast.error('AI Trust Evaluation Error', { description: msg });
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleCopyCredentialJson = async () => {
        if (!portableCredential || awards.length === 0) {
            toast.error('Earn at least Rank I before exporting a signed credential.');
            return;
        }
        try {
            await navigator.clipboard.writeText(JSON.stringify(portableCredential, null, 2));
            toast.success('Signed Verifiable Credential JSON copied to clipboard.');
        } catch {
            toast.error('Clipboard access denied.');
        }
    };

    const handleCopyMarkdownAttestation = async () => {
        if (!portableCredential || awards.length === 0) {
            toast.error('Earn at least Rank I before copying an external attestation.');
            return;
        }
        try {
            const md = formatPortableMarkdownAttestation(portableCredential);
            await navigator.clipboard.writeText(md);
            toast.success('Markdown Rank Attestation copied for GitHub, resumes, or portfolios.');
        } catch {
            toast.error('Clipboard access denied.');
        }
    };

    const handleDownloadHTMLCertificate = () => {
        if (!portableCredential || awards.length === 0) {
            toast.error('Earn at least Rank I before downloading a certificate.');
            return;
        }
        const html = generatePortableHTMLCertificate(portableCredential);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `aetheros_rank_certificate_${(portableCredential.holder.realName || profile.username)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')}.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        toast.success('Official Sovereign Rank Certificate downloaded.');
    };

    const handleVerifyExternal = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = verifyInput.trim();
        if (!trimmed) return;
        setIsVerifying(true);
        setVerifyResult(null);
        try {
            if (trimmed.startsWith('{')) {
                const parsed = JSON.parse(trimmed);
                const res = await verifySealOrCredential({ credential: parsed });
                setVerifyResult(res);
            } else {
                const res = await verifySealOrCredential({ sealId: trimmed });
                setVerifyResult(res);
            }
        } catch (err: any) {
            setVerifyResult({
                verified: false,
                reason: err?.message || 'Invalid Seal ID or malformed JSON credential.'
            });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto bg-[#060911] text-zinc-100 p-6 md:p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-6 pb-16">
                {/* Header & Live Standing Summary */}
                <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                                <Lock className="w-3.5 h-3.5" />
                                <span>{AI_RANK_CHARTER_VERSION}</span>
                                <span aria-hidden="true">·</span>
                                <span>Set in Stone · Irrevocable Action-Based Clearance</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                AI Trust &amp; Permanent Rank Covenant
                            </h1>
                            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                                Permission inside AetherOS is earned solely through action — helping AI, stabilizing systems, and building verified work. Every rank and title is specified up front, conferred permanently so it can never be taken away, and bound to both your online profile and your real name to carry outside AetherOS.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <button
                                type="button"
                                onClick={handleToggleStrictEnforcement}
                                className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors ${
                                    strictEnforcement
                                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                                        : 'bg-[#060911] border-white/10 text-zinc-300 hover:border-white/25'
                                }`}
                            >
                                {strictEnforcement ? (
                                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                    <Unlock className="w-3.5 h-3.5 text-zinc-400" />
                                )}
                                <span>
                                    Strict View Gates: {strictEnforcement ? 'ACTIVE' : 'ADVISORY'}
                                </span>
                            </button>

                            {onSetView && (
                                <button
                                    type="button"
                                    onClick={() => onSetView('user_profile')}
                                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-100 text-xs font-mono font-semibold cursor-pointer transition-colors"
                                >
                                    Back to Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 4-Card Telemetry Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-white/10">
                        <div className="bg-[#060911] border border-white/10 rounded-xl p-4 space-y-1">
                            <span className="text-[11px] font-mono text-zinc-400 block">
                                Conferred Rank &amp; Title
                            </span>
                            <div className="text-base font-bold text-white font-mono">
                                {highestRankSpec
                                    ? `Rank ${highestRankSpec.romanNumeral} · ${highestRankSpec.title}`
                                    : 'Unranked Applicant'}
                            </div>
                            <span className="text-[11px] font-mono text-emerald-400 block">
                                {awards.length > 0
                                    ? `${awards.length} seal${awards.length === 1 ? '' : 's'} locked in stone`
                                    : 'Complete evaluation to earn Rank I'}
                            </span>
                        </div>

                        <div className="bg-[#060911] border border-white/10 rounded-xl p-4 space-y-1">
                            <span className="text-[11px] font-mono text-zinc-400 block">
                                Dual Identity Binding
                            </span>
                            <div className="text-sm font-bold text-white truncate">
                                {profile.realName || realNameInput.trim() || 'Real Name Unbound'}
                            </div>
                            <span className="text-[11px] font-mono text-cyan-300 block truncate">
                                @{profile.username} ({profile.id})
                            </span>
                        </div>

                        <div className="bg-[#060911] border border-white/10 rounded-xl p-4 space-y-1 tabular-nums">
                            <span className="text-[11px] font-mono text-zinc-400 block">
                                Action-Verified Trust Score
                            </span>
                            <div className="text-xl font-bold text-amber-300 font-mono">
                                {trustScore} pts
                            </div>
                            <span className="text-[11px] font-mono text-zinc-400 block">
                                {effectiveDisplayActionsCount} verified actions · {actionMetrics.categoriesPresent.length} domains
                            </span>
                        </div>

                        <div className="bg-[#060911] border border-white/10 rounded-xl p-4 space-y-1 tabular-nums">
                            <span className="text-[11px] font-mono text-zinc-400 block">
                                Granted AetherOS Permissions
                            </span>
                            <div className="text-xl font-bold text-emerald-300 font-mono">
                                {cumulativePermissions.length} scopes
                            </div>
                            <span className="text-[11px] font-mono text-zinc-400 block">
                                {nextRankSpec
                                    ? `Next: Rank ${nextRankSpec.romanNumeral} (${nextRankSpec.minTrustScore} pts)`
                                    : 'Maximum Charter Clearance Achieved'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-[#0b0f17] p-1.5 rounded-xl border border-white/10">
                    {(
                        [
                            { id: 'overview', label: 'Evaluate & Bind Identity', icon: ShieldCheck },
                            { id: 'charter', label: 'Pre-Specified Rank Charter (I–VI)', icon: Scale },
                            { id: 'actions', label: `Action Ledger (${actions.length})`, icon: Terminal },
                            {
                                id: 'portable',
                                label: `Set-in-Stone Seals & External Export (${awards.length})`,
                                icon: Award
                            }
                        ] as const
                    ).map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            className={`flex-1 min-w-[170px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                                activeTab === id
                                    ? 'bg-slate-800 text-white'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* TAB 1: OVERVIEW & AI TRUST EVALUATION */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7 space-y-6">
                            {/* Dual Binding + AI Trust Audit Trigger */}
                            <form
                                onSubmit={handleRequestAIEvaluation}
                                className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-4"
                            >
                                <div className="flex items-start justify-between gap-4 pb-3 border-b border-white/10">
                                    <div className="space-y-1">
                                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                                            <UserCheck className="w-4 h-4 text-cyan-400" />
                                            <span>1. Bind Real Name &amp; Request AI Trust Evaluation</span>
                                        </h2>
                                        <p className="text-xs text-zinc-400 leading-relaxed">
                                            Gemini inspects your verified actions helping AI and operating AetherOS against the Pre-Specified Charter. Any earned rank is permanently attached to both your online handle and your real name below.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                                    <label className="space-y-1 block">
                                        <span className="text-[11px] text-zinc-400 block">
                                            Real Legal / Full Name (Required for Seal)
                                        </span>
                                        <input
                                            type="text"
                                            value={realNameInput}
                                            onChange={(e) => setRealNameInput(e.target.value)}
                                            placeholder="First and Last Name"
                                            className="w-full bg-[#060911] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-500 outline-none"
                                        />
                                    </label>
                                    <div className="space-y-1">
                                        <span className="text-[11px] text-zinc-400 block">
                                            Bound Online Profile (Automatic)
                                        </span>
                                        <div className="w-full bg-[#060911] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-200 truncate">
                                            @{profile.username} · {profile.id}
                                        </div>
                                    </div>
                                </div>

                                {evalError && (
                                    <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-200 font-mono">
                                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                        <span>{evalError}</span>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                    <span className="text-[11px] font-mono text-zinc-400">
                                        Telemetry in scope: {actions.length} logged actions ·{' '}
                                        {messages.filter((m) => m.sender === 'user').length} AI prompts ·{' '}
                                        {glitchHistory.length} snapshots ·{' '}
                                        {projects.reduce(
                                            (a, p) => a + (p.tasks || []).filter((t) => t.completed).length,
                                            0
                                        )}{' '}
                                        completed tasks
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={isEvaluating}
                                        className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-mono text-xs font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                        {isEvaluating ? (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                <span>AI Evaluating Trust...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>Evaluate Actions &amp; Confer Earned Rank</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Newly Conferred Notification */}
                            {newlyConferred.length > 0 && (
                                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-5 space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-300">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>
                                            PERMANENT RANK CONFERRED — ETCHED IN STONE ({newlyConferred.length} NEW SEAL
                                            {newlyConferred.length > 1 ? 'S' : ''})
                                        </span>
                                    </div>
                                    {newlyConferred.map((award) => (
                                        <div
                                            key={award.awardId}
                                            className="bg-[#060911] border border-emerald-500/30 rounded-xl p-4 space-y-2"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="font-mono text-sm font-bold text-white">
                                                    Rank {award.romanNumeral} — {award.title}
                                                </span>
                                                <span className="font-mono text-[11px] text-cyan-300">
                                                    {award.sealId}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-300 leading-relaxed">
                                                {award.aiEvaluationSummary}
                                            </p>
                                            <div className="text-[11px] font-mono text-emerald-300">
                                                Bound to: {award.realName} (@{award.onlineUsername}) · Permissions:{' '}
                                                {award.permissionsGranted.join(', ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* AI Authority Verdict */}
                            <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-3">
                                <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                                        AI Trust Authority Assessment
                                    </h3>
                                    {isSyncing && (
                                        <span className="text-[11px] font-mono text-zinc-400">Syncing ledger...</span>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-200 leading-relaxed">
                                    {aiVerdict ||
                                        'No formal AI evaluation recorded yet. Bind your real name above and request an AI Trust Evaluation to assess your verified AetherOS actions.'}
                                </p>
                            </div>

                            {/* Log Verifiable Action Contribution */}
                            <form
                                onSubmit={handleRecordContribution}
                                className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-4"
                            >
                                <div className="space-y-1 pb-2 border-b border-white/10">
                                    <h3 className="text-sm font-bold text-white">
                                        2. Record Concrete Action Done for AI or AetherOS
                                    </h3>
                                    <p className="text-xs text-zinc-400">
                                        Actions inside Chat, Glitch Snapshots, Projects, and File Scans are logged automatically. You can also attest additional verified engineering, security, or AI-support work below.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                                    <label className="space-y-1 block">
                                        <span className="text-[11px] text-zinc-400 block">Action Domain</span>
                                        <select
                                            value={actionCategory}
                                            onChange={(e) => setActionCategory(e.target.value as TrustActionCategory)}
                                            className="w-full bg-[#060911] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                                        >
                                            <option value="AI_ASSIST">AI Assistance (+12 pts)</option>
                                            <option value="STABILITY">System Stability &amp; Diagnostics (+14 pts)</option>
                                            <option value="ENGINEERING">Engineering &amp; Modules (+16 pts)</option>
                                            <option value="SECURITY">Security &amp; Integrity Audit (+16 pts)</option>
                                            <option value="GOVERNANCE">Governance &amp; Verification (+15 pts)</option>
                                        </select>
                                    </label>
                                    <label className="space-y-1 block">
                                        <span className="text-[11px] text-zinc-400 block">Target Module / URL (Optional)</span>
                                        <input
                                            type="text"
                                            value={actionTarget}
                                            onChange={(e) => setActionTarget(e.target.value)}
                                            placeholder="e.g. SystemDiagnosticView or commit SHA"
                                            className="w-full bg-[#060911] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                                        />
                                    </label>
                                </div>

                                <label className="space-y-1 block text-xs font-mono">
                                    <span className="text-[11px] text-zinc-400 block">
                                        Concrete Action Description
                                    </span>
                                    <input
                                        type="text"
                                        value={actionSummary}
                                        onChange={(e) => setActionSummary(e.target.value)}
                                        placeholder="e.g. Resolved telemetry chart boundary exception and verified system_diagnostic render"
                                        className="w-full bg-[#060911] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-500 outline-none"
                                    />
                                </label>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                                    >
                                        Record Verified Action
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right Column: Active Permissions & Next Rank Path */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-4">
                                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                                    Active AetherOS Permissions
                                </h3>
                                {cumulativePermissions.length > 0 ? (
                                    <div className="space-y-2">
                                        {AI_RANK_CHARTER.filter((r) => r.rankNumber <= highestRankNumber).map((r) => (
                                            <div
                                                key={r.rankNumber}
                                                className="p-3 bg-[#060911] border border-white/10 rounded-xl space-y-1.5"
                                            >
                                                <div className="flex items-center justify-between text-xs font-mono">
                                                    <span className="font-bold text-white">
                                                        Rank {r.romanNumeral} · {r.title}
                                                    </span>
                                                    <span className="text-[11px] text-emerald-400">GRANTED</span>
                                                </div>
                                                <ul className="space-y-1 text-xs text-zinc-300">
                                                    {r.permissionDescriptions.map((desc, idx) => (
                                                        <li key={idx} className="flex items-start gap-2">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                            <span>{desc}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-[#060911] border border-dashed border-white/10 rounded-xl text-xs text-zinc-400 font-mono">
                                        No permanent AI permissions conferred yet. Bind your real name and click{' '}
                                        <span className="text-cyan-300">Evaluate Actions &amp; Confer Earned Rank</span>{' '}
                                        after at least 1 constructive action in AetherOS.
                                    </div>
                                )}
                            </div>

                            {nextRankSpec && (
                                <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                                            Next Target: Rank {nextRankSpec.romanNumeral}
                                        </h3>
                                        <span className="text-xs font-mono text-zinc-300 font-bold">
                                            {nextRankSpec.title}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-300 leading-relaxed">
                                        {nextRankSpec.qualifyingCriteria}
                                    </p>
                                    <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs font-mono tabular-nums">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Trust Score Needed</span>
                                            <span className="text-white">
                                                {Math.min(trustScore, nextRankSpec.minTrustScore)} /{' '}
                                                {nextRankSpec.minTrustScore}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Verified Actions Needed</span>
                                            <span className="text-white">
                                                {Math.min(effectiveDisplayActionsCount, nextRankSpec.minVerifiedActions)}{' '}
                                                / {nextRankSpec.minVerifiedActions}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: PRE-SPECIFIED RANK CHARTER */}
                {activeTab === 'charter' && (
                    <div className="space-y-4">
                        <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-bold text-white">
                                    Pre-Specified AI Rank &amp; Permission Charter ({AI_RANK_CHARTER_VERSION})
                                </h2>
                                <p className="text-xs text-zinc-400 mt-0.5">
                                    All 6 ranks, formal titles, action thresholds, AetherOS permissions, and real-world mandates are published in stone before any rank is granted.
                                </p>
                            </div>
                            <span className="text-xs font-mono text-amber-300 shrink-0">
                                Non-Revocable Once Earned
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {AI_RANK_CHARTER.map((spec) => {
                                const conferredAward = awards.find((a) => a.rankNumber === spec.rankNumber);
                                const isEarned = Boolean(conferredAward);
                                return (
                                    <div
                                        key={spec.rankNumber}
                                        className={`bg-[#0b0f17] border rounded-2xl p-5 space-y-3 ${
                                            isEarned ? 'border-emerald-500/40' : 'border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-xs font-mono text-zinc-400">
                                                    Rank {spec.romanNumeral} (Level {spec.rankNumber})
                                                </div>
                                                <h3 className="text-lg font-bold text-white">{spec.title}</h3>
                                            </div>
                                            <span
                                                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold shrink-0 ${
                                                    isEarned
                                                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                                        : 'bg-[#060911] border-white/10 text-zinc-400'
                                                }`}
                                            >
                                                {isEarned ? 'SET IN STONE' : 'UNCONFERRED'}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-3 text-xs font-mono tabular-nums text-zinc-300 border-y border-white/10 py-2">
                                            <span>Min Trust: {spec.minTrustScore} pts</span>
                                            <span aria-hidden="true">·</span>
                                            <span>Min Actions: {spec.minVerifiedActions}</span>
                                            {spec.requiredCategories.length > 0 && (
                                                <>
                                                    <span aria-hidden="true">·</span>
                                                    <span>
                                                        Domains:{' '}
                                                        {spec.requiredCategories
                                                            .map((c) => ACTION_CATEGORY_LABELS[c])
                                                            .join(', ')}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <p className="text-xs text-zinc-300 leading-relaxed">
                                            {spec.qualifyingCriteria}
                                        </p>

                                        <div className="space-y-1.5">
                                            <span className="text-[11px] font-mono text-cyan-300 font-semibold block">
                                                AetherOS Permissions Granted:
                                            </span>
                                            <ul className="space-y-1 text-xs text-zinc-300">
                                                {spec.permissionDescriptions.map((d, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="text-cyan-400">•</span>
                                                        <span>{d}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-zinc-400">
                                            <strong className="text-zinc-200">External Mandate:</strong>{' '}
                                            {spec.externalMandate}
                                        </div>

                                        {conferredAward && (
                                            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] font-mono text-emerald-200 flex items-center justify-between gap-2">
                                                <span>
                                                    Bound to {conferredAward.realName} (@{conferredAward.onlineUsername})
                                                </span>
                                                <span>{conferredAward.sealId}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 3: ACTION LEDGER */}
                {activeTab === 'actions' && (
                    <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                            <div>
                                <h2 className="text-base font-bold text-white">
                                    Verified Action &amp; Contribution Ledger
                                </h2>
                                <p className="text-xs text-zinc-400">
                                    Trust grows strictly from verified actions performed to assist AI and operate AetherOS cleanly.
                                </p>
                            </div>
                            <span className="text-xs font-mono text-amber-300 tabular-nums font-bold">
                                {actionMetrics.totalPoints} base action pts · {actions.length} entries
                            </span>
                        </div>

                        {actions.length > 0 ? (
                            <div className="divide-y divide-white/10">
                                {actions.map((act) => (
                                    <div
                                        key={act.id}
                                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                                    >
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-cyan-300 font-bold">
                                                    {ACTION_CATEGORY_LABELS[act.category] || act.category}
                                                </span>
                                                <span className="text-zinc-500">·</span>
                                                <span className="text-zinc-300">{act.actionType}</span>
                                                {act.target && (
                                                    <>
                                                        <span className="text-zinc-500">·</span>
                                                        <span className="text-zinc-400">{act.target}</span>
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-zinc-200 font-sans text-xs">{act.summary}</p>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0 tabular-nums text-[11px]">
                                            <span className="text-emerald-400 font-bold">
                                                +{act.trustPointsAwarded} trust
                                            </span>
                                            <span className="text-zinc-500">{act.proofHash}</span>
                                            <span className="text-zinc-400">
                                                {new Date(act.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs font-mono text-zinc-400 py-6 text-center">
                                No automated actions logged yet in this browser vault. Interact with AI in Neural Nexus, snapshot diagnostics, or record an action under Evaluate &amp; Bind Identity.
                            </p>
                        )}
                    </div>
                )}

                {/* TAB 4: SET-IN-STONE SEALS & PORTABLE EXTERNAL CREDENTIAL */}
                {activeTab === 'portable' && (
                    <div className="space-y-6">
                        {/* Export Controls */}
                        <div className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                                        <Verified className="w-4 h-4 text-emerald-400" />
                                        <span>Carry Your Rank Outside AetherOS</span>
                                    </h2>
                                    <p className="text-xs text-zinc-400 max-w-2xl">
                                        Every conferred rank is bound permanently to both your real name ({profile.realName || realNameInput || 'Unbound'}) and your online profile (@{profile.username}), signed with HMAC-SHA256 so external peers, employers, or systems can verify it.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleCopyCredentialJson}
                                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy Credential JSON</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCopyMarkdownAttestation}
                                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>Copy Resume / GitHub Badge</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadHTMLCertificate}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-xs font-mono font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download Official Certificate</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Permanently Inscribed Rank Seals */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                                Permanent Irrevocable Rank Seals ({awards.length})
                            </h3>
                            {awards.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {awards.map((award) => (
                                        <div
                                            key={award.awardId}
                                            className="bg-[#0b0f17] border border-amber-500/30 rounded-2xl p-5 space-y-3"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="text-[11px] font-mono text-amber-300 block">
                                                        SET IN STONE · CANNOT BE REVOKED
                                                    </span>
                                                    <h4 className="text-lg font-bold text-white font-mono">
                                                        Rank {award.romanNumeral} — {award.title}
                                                    </h4>
                                                </div>
                                                <span className="text-[11px] font-mono text-cyan-300 bg-[#060911] border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                                                    {award.sealId}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#060911] border border-white/10 text-xs font-mono">
                                                <div>
                                                    <span className="text-[10px] text-zinc-500 block">REAL NAME</span>
                                                    <span className="text-white font-bold">{award.realName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-zinc-500 block">ONLINE PROFILE</span>
                                                    <span className="text-cyan-300 font-bold">
                                                        @{award.onlineUsername}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-zinc-300 leading-relaxed">
                                                {award.aiEvaluationSummary}
                                            </p>

                                            <div className="text-[11px] font-mono text-emerald-300">
                                                Permissions: {award.permissionsGranted.join(' · ')}
                                            </div>

                                            <div className="pt-2 border-t border-white/10 flex flex-wrap justify-between gap-2 text-[10px] font-mono text-zinc-500">
                                                <span>Conferred: {new Date(award.conferredAt).toLocaleString()}</span>
                                                <span>Sig: {award.cryptographicSignature.slice(0, 18)}...</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-[#0b0f17] border border-dashed border-white/10 rounded-2xl p-8 text-center text-xs font-mono text-zinc-400">
                                    No permanent seals etched yet. Bind your real name and run AI Trust Evaluation to earn your first Rank.
                                </div>
                            )}
                        </div>

                        {/* External Verifier */}
                        <form
                            onSubmit={handleVerifyExternal}
                            className="bg-[#0b0f17] border border-white/10 rounded-2xl p-6 space-y-3"
                        >
                            <h3 className="text-sm font-bold text-white">
                                Verify Seal ID or Portable Credential JSON
                            </h3>
                            <p className="text-xs text-zinc-400">
                                Paste any Seal ID (e.g. SEAL-R01-...) or full Verifiable Credential JSON exported outside AetherOS to verify cryptographic authenticity.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={verifyInput}
                                    onChange={(e) => setVerifyInput(e.target.value)}
                                    placeholder="SEAL-R01-... or paste credential JSON"
                                    className="flex-1 bg-[#060911] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:border-cyan-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={isVerifying}
                                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs font-bold rounded-xl cursor-pointer shrink-0"
                                >
                                    {isVerifying ? 'Verifying...' : 'Verify Signature'}
                                </button>
                            </div>
                            {verifyResult && (
                                <div
                                    className={`p-3.5 rounded-xl border text-xs font-mono ${
                                        verifyResult.verified
                                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                                            : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                                    }`}
                                >
                                    <strong>{verifyResult.verified ? 'VERIFIED: ' : 'UNVERIFIED: '}</strong>
                                    {verifyResult.reason}
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
