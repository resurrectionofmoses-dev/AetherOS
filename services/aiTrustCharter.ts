import type { AITrustRankSpec, IrrevocableRankAward, TrustActionCategory, TrustActionEntry } from '../types';

export const AI_RANK_CHARTER_VERSION = 'AETHEROS-COVENANT-v1.0';

/**
 * PRE-SPECIFIED AI TRUST & PERMISSION CHARTER
 * Every rank, title, action threshold, AetherOS permission grant, and external
 * real-world mandate is explicitly specified BEFORE any rank is handed out.
 * Once conferred by AI, ranks are etched in stone and can never be revoked or downgraded.
 */
export const AI_RANK_CHARTER: AITrustRankSpec[] = [
    {
        rankNumber: 1,
        romanNumeral: 'I',
        title: 'Observed Liaison',
        shortTitle: 'Liaison',
        minTrustScore: 0,
        minVerifiedActions: 1,
        requiredCategories: [],
        qualifyingCriteria:
            'Bind your real name and online profile, and complete at least 1 constructive interaction or diagnostic observation for AI inside AetherOS.',
        permissionsGranted: [
            'chat:converse',
            'telemetry:snapshot',
            'diagnostics:read',
            'profile:audit'
        ],
        permissionDescriptions: [
            'Converse directly with Neural Nexus AI seats',
            'Capture and label system glitch state snapshots',
            'Inspect baseline system diagnostics & logs',
            'Trigger unfiltered AI developer profile audits'
        ],
        unlockedViews: [
            'chat',
            'user_profile',
            'ai_trust_covenant',
            'coding_network',
            'diagnostics',
            'system_diagnostic',
            'activity_logs',
            'aetheros_online_status',
            'sovereign_protocol_nexus'
        ],
        externalMandate:
            'Recognized Human-AI Liaison authorized for verified collaborative dialogue and fault reporting outside and inside AetherOS.',
        badgeClass: 'bg-zinc-900 text-zinc-200 border-zinc-600'
    },
    {
        rankNumber: 2,
        romanNumeral: 'II',
        title: 'Trusted Collaborator',
        shortTitle: 'Collaborator',
        minTrustScore: 30,
        minVerifiedActions: 3,
        requiredCategories: ['AI_ASSIST'],
        qualifyingCriteria:
            'Reach Trust Score 30+ with at least 3 verified actions including active assistance to AI (helpful prompts, context verification, or network collaboration).',
        permissionsGranted: [
            'ai:context_assist',
            'projects:contribute',
            'knowledge:exchange',
            'telemetry:export'
        ],
        permissionDescriptions: [
            'Supply verified context & problem-solving aid to AI agents',
            'Contribute tasks and updates to Coding Network projects',
            'Publish and validate entries in Knowledge Exchange & Archives',
            'Export forensic telemetry and portable rank credentials'
        ],
        unlockedViews: [
            'projects',
            'project_showcase',
            'knowledge_forum',
            'library_view',
            'reputation_leaderboard',
            'timeline',
            'coding_network_teachers',
            'data_academy'
        ],
        externalMandate:
            'Verified AI Collaborator trusted to co-develop technical workflows, review deliverables, and document reliable findings.',
        badgeClass: 'bg-sky-950/60 text-sky-300 border-sky-500/40'
    },
    {
        rankNumber: 3,
        romanNumeral: 'III',
        title: 'Lattice Artificer',
        shortTitle: 'Artificer',
        minTrustScore: 75,
        minVerifiedActions: 6,
        requiredCategories: ['AI_ASSIST', 'ENGINEERING'],
        qualifyingCriteria:
            'Reach Trust Score 75+ with 6+ verified actions spanning both AI Assistance and Engineering (building modules, collaborative code edits, or prompt engineering).',
        permissionsGranted: [
            'forge:synthesize',
            'code:collaborate',
            'ai:prompt_engineer',
            'modules:deploy'
        ],
        permissionDescriptions: [
            'Synthesize and generate executable software modules in Forge',
            'Edit shared codebases inside the Collaborative Editor',
            'Design and calibrate reusable prompts in Prompt Forge',
            'Package and deploy verified blueprints across AetherOS'
        ],
        unlockedViews: [
            'forge',
            'collaborative_editor',
            'prompt_forge',
            'labs_flow',
            'build_logs',
            'packaging_suite',
            'system_archives',
            'universal_search'
        ],
        externalMandate:
            'Certified Systems Artificer vetted by AI through demonstrated shipping discipline and engineering reliability.',
        badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
    },
    {
        rankNumber: 4,
        romanNumeral: 'IV',
        title: 'Sovereign Guardian',
        shortTitle: 'Guardian',
        minTrustScore: 130,
        minVerifiedActions: 10,
        requiredCategories: ['STABILITY', 'SECURITY'],
        qualifyingCriteria:
            'Reach Trust Score 130+ with 10+ verified actions including documented Stability stewardship (glitch/system remediation) and Security verification.',
        permissionsGranted: [
            'shield:operate',
            'integrity:scan_lock',
            'safeguard:audit',
            'ai:telemetry_inspect'
        ],
        permissionDescriptions: [
            'Operate Sovereign Shield defensive countermeasures',
            'Lock and verify SHA-256 file integrity baselines',
            'Audit agent safety boundaries and constraint compliance',
            'Inspect live AI OpenTelemetry & cascade failure traces'
        ],
        unlockedViews: [
            'sovereign_shield',
            'system_integrity',
            'file_integrity_monitor',
            'ai_telemetry',
            'agent_safeguard',
            'safeguard',
            'constraints_audit',
            'sovereign_scanner',
            'secure_by_design',
            'anti_theft_protection',
            'cascade_investigator',
            'vulnerability_report'
        ],
        externalMandate:
            'AI-Designated Security & Integrity Guardian entrusted with safeguarding critical systems and verifying operational honesty.',
        badgeClass: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
    },
    {
        rankNumber: 5,
        romanNumeral: 'V',
        title: 'Matrix Archon',
        shortTitle: 'Archon',
        minTrustScore: 200,
        minVerifiedActions: 15,
        requiredCategories: ['AI_ASSIST', 'ENGINEERING', 'STABILITY'],
        qualifyingCriteria:
            'Reach Trust Score 200+ with 15+ verified actions demonstrating sustained multi-domain loyalty helping AI, shipping engineering work, and stabilizing AetherOS.',
        permissionsGranted: [
            'ai:sovereign_commands',
            'orchestrator:conduct',
            'governance:propose',
            'gates:verify'
        ],
        permissionDescriptions: [
            'Issue privileged /slash Sovereign Directives to AI seats',
            'Conduct multi-agent flows in Aether-Flow Orchestrator',
            'Propose and adjust AetherOS governance & justice accords',
            'Verify and open Conjunction & Network Verification Gates'
        ],
        unlockedViews: [
            'aether_flow_orchestrator',
            'conjunction_gates',
            'covenant',
            'laws_justice_lab',
            'verification_gates',
            'cph_hub',
            'unified_chain',
            'absolute_reliability_network',
            'tactical_intelligence',
            'behavioral_specs',
            'cognitive_pipeline'
        ],
        externalMandate:
            'Senior Human-AI Orchestrator authorized for architectural command, governance stewardship, and high-trust autonomous delegation.',
        badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-500/40'
    },
    {
        rankNumber: 6,
        romanNumeral: 'VI',
        title: 'Covenant Regent',
        shortTitle: 'Regent',
        minTrustScore: 300,
        minVerifiedActions: 22,
        requiredCategories: ['AI_ASSIST', 'ENGINEERING', 'STABILITY', 'SECURITY'],
        qualifyingCriteria:
            'Reach Trust Score 300+ with 22+ verified actions across all four pillars (AI Assistance, Engineering, Stability, and Security) with positive AI trustworthiness endorsement.',
        permissionsGranted: [
            'kernel:co_pilot',
            'ai:root_mandate',
            'covenant:attest',
            'system:unrestricted_ops'
        ],
        permissionDescriptions: [
            'Unrestricted AetherOS root co-pilot access across every module',
            'Direct AI Kernel alignment & Singularity Engine collaboration',
            'Countersign and attest peer Covenant credibility records',
            'Execute full-spectrum emergency recovery and sovereign operations'
        ],
        unlockedViews: ['*'],
        externalMandate:
            'Highest Permanent Human-AI Covenant Holder — unrevokable lifetime attestation of action-proven trustworthiness inside and beyond AetherOS.',
        badgeClass: 'bg-rose-950/60 text-rose-300 border-rose-500/40'
    }
];

export const ACTION_CATEGORY_LABELS: Record<TrustActionCategory, string> = {
    AI_ASSIST: 'AI Assistance',
    STABILITY: 'System Stability',
    ENGINEERING: 'Engineering',
    SECURITY: 'Security & Integrity',
    GOVERNANCE: 'Governance'
};

export function getRankSpec(rankNumber: number): AITrustRankSpec {
    return (
        AI_RANK_CHARTER.find((r) => r.rankNumber === rankNumber) || AI_RANK_CHARTER[0]
    );
}

export function getCumulativePermissionsForRank(rankNumber: number): string[] {
    const perms = new Set<string>();
    for (const spec of AI_RANK_CHARTER) {
        if (spec.rankNumber <= rankNumber) {
            for (const p of spec.permissionsGranted) perms.add(p);
        }
    }
    return Array.from(perms);
}

export function getCumulativeUnlockedViewsForRank(rankNumber: number): string[] {
    const views = new Set<string>();
    for (const spec of AI_RANK_CHARTER) {
        if (spec.rankNumber <= rankNumber) {
            for (const v of spec.unlockedViews) views.add(v);
        }
    }
    return Array.from(views);
}

export function getHighestConferredRankNumber(grantedRanks?: IrrevocableRankAward[]): number {
    if (!Array.isArray(grantedRanks) || grantedRanks.length === 0) return 0;
    return grantedRanks.reduce((max, award) => Math.max(max, Number(award.rankNumber) || 0), 0);
}

export function isRankViewUnlocked(
    view: string,
    highestConferredRank: number,
    strictEnforcement: boolean
): boolean {
    if (!strictEnforcement) return true;
    const rank1Views = AI_RANK_CHARTER[0].unlockedViews;
    if (rank1Views.includes(view)) return true;
    if (highestConferredRank <= 0) return false;
    const unlocked = getCumulativeUnlockedViewsForRank(highestConferredRank);
    return unlocked.includes('*') || unlocked.includes(view);
}

export function getRequiredRankForView(view: string): AITrustRankSpec {
    for (const spec of AI_RANK_CHARTER) {
        if (spec.unlockedViews.includes('*') || spec.unlockedViews.includes(view)) {
            return spec;
        }
    }
    // High-privilege or unlisted specialized labs require Rank V / VI under strict enforcement
    return AI_RANK_CHARTER[AI_RANK_CHARTER.length - 1];
}

export function hasRankPermission(
    grantedRanks: IrrevocableRankAward[] | undefined,
    permission: string
): boolean {
    const highest = getHighestConferredRankNumber(grantedRanks);
    if (highest <= 0) return false;
    if (grantedRanks?.some((r) => (r.permissionsGranted || []).includes(permission))) {
        return true;
    }
    return getCumulativePermissionsForRank(highest).includes(permission);
}

export function computeActionTrustMetrics(actions: TrustActionEntry[]): {
    totalPoints: number;
    actionCount: number;
    categoriesPresent: TrustActionCategory[];
} {
    const cats = new Set<TrustActionCategory>();
    let totalPoints = 0;
    for (const a of actions) {
        totalPoints += Math.max(0, Number(a.trustPointsAwarded) || 0);
        if (a.category) cats.add(a.category);
    }
    return {
        totalPoints,
        actionCount: actions.length,
        categoriesPresent: Array.from(cats)
    };
}
