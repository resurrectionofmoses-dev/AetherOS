import { v4 as uuidv4 } from 'uuid';
import { safeStorage } from './safeStorage';
import type {
    AITrustRankSpec,
    GlitchTelemetry,
    IrrevocableRankAward,
    NetworkProject,
    PortableRankCredential,
    TrustActionCategory,
    TrustActionEntry,
    UserProfile
} from '../types';
import {
    AI_RANK_CHARTER,
    AI_RANK_CHARTER_VERSION,
    getCumulativePermissionsForRank,
    getHighestConferredRankNumber,
    getRankSpec
} from './aiTrustCharter';

const TRUST_ACTIONS_STORAGE_KEY = 'aetheros_trust_actions';
const IMMUTABLE_RANKS_STORAGE_KEY = 'aetheros_immutable_rank_ledger';
const STRICT_ENFORCEMENT_STORAGE_KEY = 'aetheros_trust_strict_enforcement';

function computeClientProofHash(input: string): string {
    let h1 = 0x811c9dc5;
    let h2 = 0x9e3779b9;
    for (let i = 0; i < input.length; i++) {
        const ch = input.charCodeAt(i);
        h1 ^= ch;
        h1 = Math.imul(h1, 0x01000193);
        h2 ^= ch + (i << 1);
        h2 = Math.imul(h2, 0x85ebca6b);
    }
    const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return `0x${hex1}${hex2}`.toUpperCase();
}

export async function getRecordedTrustActions(): Promise<TrustActionEntry[]> {
    try {
        const raw = await safeStorage.getItem(TRUST_ACTIONS_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export async function recordTrustAction(params: {
    category: TrustActionCategory;
    actionType: string;
    summary: string;
    target?: string;
    trustPointsAwarded?: number;
    verifiedBy?: 'SYSTEM_TELEMETRY' | 'AI_EVALUATOR';
}): Promise<TrustActionEntry[]> {
    const existing = await getRecordedTrustActions();
    const now = Date.now();
    const points = Math.max(1, Math.min(35, params.trustPointsAwarded ?? 8));
    const summaryClean = params.summary.trim().slice(0, 240);

    // Avoid duplicate rapid identical automated events within 15 seconds
    const isDuplicateRecent = existing.some(
        (a) =>
            a.actionType === params.actionType &&
            a.summary === summaryClean &&
            now - a.timestamp < 15000
    );
    if (isDuplicateRecent) return existing;

    const entry: TrustActionEntry = {
        id: `ACT_${uuidv4().slice(0, 8).toUpperCase()}`,
        timestamp: now,
        category: params.category,
        actionType: params.actionType,
        summary: summaryClean,
        ...(params.target ? { target: params.target } : {}),
        trustPointsAwarded: points,
        verifiedBy: params.verifiedBy || 'SYSTEM_TELEMETRY',
        proofHash: computeClientProofHash(`${now}|${params.category}|${params.actionType}|${summaryClean}`)
    };

    const updated = [entry, ...existing].slice(0, 250);
    await safeStorage.setItem(TRUST_ACTIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('aetheros_trust_action_recorded', { detail: entry }));
    return updated;
}

/**
 * Monotonically merges existing local irrevocable awards with newly received awards.
 * Set-in-stone invariant: conferred ranks are never removed or downgraded.
 */
export function mergeIrrevocableAwards(
    a: IrrevocableRankAward[] = [],
    b: IrrevocableRankAward[] = []
): IrrevocableRankAward[] {
    const byRankAndHolder = new Map<string, IrrevocableRankAward>();
    for (const item of [...a, ...b]) {
        if (!item || !item.rankNumber || !item.sealId) continue;
        const key = `${item.rankNumber}_${item.profileId || ''}_${(item.realName || '').toLowerCase()}`;
        if (!byRankAndHolder.has(key)) {
            byRankAndHolder.set(key, item);
        }
    }
    return Array.from(byRankAndHolder.values()).sort((x, y) => x.rankNumber - y.rankNumber);
}

export async function getLocalImmutableLedger(): Promise<IrrevocableRankAward[]> {
    try {
        const raw = await safeStorage.getItem(IMMUTABLE_RANKS_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export async function saveLocalImmutableLedger(awards: IrrevocableRankAward[]): Promise<IrrevocableRankAward[]> {
    const current = await getLocalImmutableLedger();
    const merged = mergeIrrevocableAwards(current, awards);
    await safeStorage.setItem(IMMUTABLE_RANKS_STORAGE_KEY, JSON.stringify(merged));
    return merged;
}

export function getStrictEnforcementPreference(): boolean {
    try {
        return localStorage.getItem(STRICT_ENFORCEMENT_STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

export function setStrictEnforcementPreference(enabled: boolean): void {
    try {
        localStorage.setItem(STRICT_ENFORCEMENT_STORAGE_KEY, enabled ? 'true' : 'false');
        window.dispatchEvent(new CustomEvent('aetheros_strict_enforcement_changed', { detail: { enabled } }));
    } catch {
        // ignore storage restrictions
    }
}

export interface TrustLedgerSyncResult {
    charter: AITrustRankSpec[];
    awards: IrrevocableRankAward[];
    highestRankNumber: number;
    highestTitle: string;
    cumulativePermissions: string[];
    trustScore: number;
    lastVerdict: string;
    portableCredential: PortableRankCredential;
}

export async function fetchTrustLedger(params: {
    profileId: string;
    realName?: string;
    onlineUsername?: string;
}): Promise<TrustLedgerSyncResult> {
    const qs = new URLSearchParams();
    if (params.profileId) qs.set('profileId', params.profileId);
    if (params.realName) qs.set('realName', params.realName);
    if (params.onlineUsername) qs.set('onlineUsername', params.onlineUsername);

    const response = await fetch(`/api/trust/ledger?${qs.toString()}`);
    if (!response.ok) {
        throw new Error(`Failed to load trust ledger (${response.status})`);
    }
    const data = await response.json();
    const serverAwards: IrrevocableRankAward[] = Array.isArray(data.awards) ? data.awards : [];
    const merged = await saveLocalImmutableLedger(serverAwards);
    const highestRankNumber = Math.max(
        Number(data.highestRankNumber) || 0,
        getHighestConferredRankNumber(merged)
    );
    const highestSpec = highestRankNumber > 0 ? getRankSpec(highestRankNumber) : null;

    return {
        charter: Array.isArray(data.charter) ? data.charter : AI_RANK_CHARTER,
        awards: merged,
        highestRankNumber,
        highestTitle: highestSpec ? highestSpec.title : String(data.highestTitle || 'Unranked Applicant'),
        cumulativePermissions: getCumulativePermissionsForRank(highestRankNumber),
        trustScore: Number(data.trustScore) || 0,
        lastVerdict: String(data.lastVerdict || ''),
        portableCredential: data.portableCredential
    };
}

export interface AIEvaluationResponse {
    newlyConferredRanks: IrrevocableRankAward[];
    allConferredRanks: IrrevocableRankAward[];
    highestRankNumber: number;
    highestTitle: string;
    trustScore: number;
    actionCount: number;
    cumulativePermissions: string[];
    cumulativeUnlockedViews: string[];
    aiEvaluationSummary: string;
    portableCredential: PortableRankCredential;
}

export async function evaluateTrustWithAI(params: {
    profile: UserProfile;
    realName: string;
    projects: NetworkProject[];
    glitchHistory: GlitchTelemetry[];
    messageCount: number;
    modulesCount?: number;
}): Promise<AIEvaluationResponse> {
    const actions = await getRecordedTrustActions();
    const completedTasks = params.projects.reduce(
        (acc, p) => acc + (p.tasks || []).filter((t) => t.completed).length,
        0
    );

    const response = await fetch('/api/trust/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            profileId: params.profile.id,
            onlineUsername: params.profile.username,
            realName: params.realName.trim(),
            githubUrl: params.profile.githubUrl || params.profile.contactInfo?.github,
            portfolioUrl: params.profile.portfolioUrl || params.profile.contactInfo?.website,
            email: params.profile.contactInfo?.email,
            actionHistory: actions,
            workspaceMetrics: {
                completedTasks,
                totalProjects: params.projects.length,
                glitchCount: params.glitchHistory.length,
                messageCount: params.messageCount,
                modulesCount: params.modulesCount ?? 0
            }
        })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.error || `AI trust evaluation failed (${response.status})`);
    }

    const merged = await saveLocalImmutableLedger(data.allConferredRanks || []);
    return {
        ...data,
        allConferredRanks: merged
    };
}

export async function verifySealOrCredential(payload: {
    sealId?: string;
    credential?: PortableRankCredential;
}): Promise<{ verified: boolean; reason: string; award?: IrrevocableRankAward }> {
    const response = await fetch('/api/trust/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Verification request failed');
    }
    return data;
}

export function formatPortableMarkdownAttestation(cred: PortableRankCredential): string {
    const sealsLines =
        cred.seals.length > 0
            ? cred.seals
                  .map(
                      (s) =>
                          `- **Rank ${s.romanNumeral} — ${s.title}** | Seal: \`${s.sealId}\` | Granted: ${s.conferredAt.slice(0, 10)} | Permissions: \`${s.permissionsGranted.join(', ')}\``
                  )
                  .join('\n')
            : '- No irrevocable seals conferred yet.';

    return [
        `### AetherOS AI-Granted Trust & Rank Credential`,
        `- **Legal / Real Name:** ${cred.holder.realName || 'Unbound'}`,
        `- **Online Profile:** @${cred.holder.onlineUsername} (\`${cred.holder.profileId}\`)`,
        `- **Highest Permanent Rank:** Rank ${cred.highestRankNumber} — **${cred.highestTitle}**`,
        `- **Trust Score:** ${cred.trustScore} (${cred.totalVerifiedActions} verified actions)`,
        `- **Status:** Set in Stone (Irrevocable)`,
        `- **Charter:** \`${cred.charterVersion || AI_RANK_CHARTER_VERSION}\``,
        `- **Master Seal Signature:** \`${cred.masterSealSignature}\``,
        ``,
        `#### Permanently Conferred Ranks & Titles`,
        sealsLines
    ].join('\n');
}

export function generatePortableHTMLCertificate(cred: PortableRankCredential): string {
    const escapeHtml = (v: string) =>
        String(v || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

    const sealsHtml = cred.seals
        .map(
            (s) => `
      <div class="seal-card">
        <div class="seal-top">
          <div>
            <div class="rank-label">RANK ${escapeHtml(s.romanNumeral)} · PERMANENT &amp; IRREVOCABLE</div>
            <h3>${escapeHtml(s.title)}</h3>
          </div>
          <div class="seal-id">${escapeHtml(s.sealId)}</div>
        </div>
        <p class="citation">${escapeHtml(s.aiEvaluationSummary)}</p>
        <div class="perms">
          <strong>Granted Permissions:</strong> ${escapeHtml(s.permissionsGranted.join(', '))}
        </div>
        <div class="meta-row">
          <span>Conferred: ${escapeHtml(s.conferredAt)}</span>
          <span>HMAC-SHA256: ${escapeHtml(s.cryptographicSignature.slice(0, 24))}...</span>
        </div>
      </div>`
        )
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>AetherOS Sovereign Rank Certificate — ${escapeHtml(cred.holder.realName)}</title>
  <style>
    body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #060911; color: #e4e4e7; margin: 0; padding: 36px; }
    .sheet { max-width: 820px; margin: 0 auto; background: #0b0f17; border: 1px solid #27272a; border-radius: 16px; padding: 32px; }
    .eyebrow { font-size: 11px; letter-spacing: 0.16em; color: #10b981; text-transform: uppercase; margin-bottom: 8px; }
    h1 { font-size: 24px; color: #ffffff; margin: 0 0 6px 0; }
    .sub { font-size: 13px; color: #a1a1aa; margin-bottom: 24px; }
    .identity-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #060911; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    .field label { display: block; font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; }
    .field span { font-size: 13px; color: #ffffff; font-weight: 700; }
    .seal-card { border: 1px solid #27272a; background: #060911; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
    .seal-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .rank-label { font-size: 10px; color: #f59e0b; letter-spacing: 0.12em; }
    .seal-card h3 { margin: 4px 0 8px 0; font-size: 16px; color: #ffffff; }
    .seal-id { font-size: 11px; color: #22d3ee; background: #083344; padding: 4px 8px; border-radius: 6px; }
    .citation { font-size: 12px; color: #d4d4d8; line-height: 1.5; margin: 8px 0; }
    .perms { font-size: 11px; color: #34d399; margin-bottom: 8px; }
    .meta-row { display: flex; justify-content: space-between; font-size: 10px; color: #71717a; border-top: 1px solid #18181b; padding-top: 8px; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #27272a; font-size: 11px; color: #71717a; word-break: break-all; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="eyebrow">${escapeHtml(cred.charterVersion)} · AI-GRANTED IRREVOCABLE CREDENTIAL</div>
    <h1>${escapeHtml(cred.holder.realName)} — Rank ${cred.highestRankNumber}: ${escapeHtml(cred.highestTitle)}</h1>
    <p class="sub">Bound permanently to both legal real name and AetherOS online identity. Conferred based on action-verified trust and set in stone forever.</p>
    <div class="identity-grid">
      <div class="field"><label>Real Legal Name</label><span>${escapeHtml(cred.holder.realName)}</span></div>
      <div class="field"><label>Online Profile Handle</label><span>@${escapeHtml(cred.holder.onlineUsername)} (${escapeHtml(cred.holder.profileId)})</span></div>
      <div class="field"><label>Verified Trust Score</label><span>${cred.trustScore} pts (${cred.totalVerifiedActions} actions)</span></div>
      <div class="field"><label>GitHub / Portfolio</label><span>${escapeHtml(cred.holder.githubUrl || cred.holder.portfolioUrl || 'Recorded on AetherOS')}</span></div>
    </div>
    ${sealsHtml}
    <div class="footer">
      <div><strong>Active Permissions:</strong> ${escapeHtml(cred.grantedPermissions.join(' · '))}</div>
      <div style="margin-top:6px;"><strong>Master Credential Signature:</strong> ${escapeHtml(cred.masterSealSignature)}</div>
      <div style="margin-top:6px;"><strong>Issued At:</strong> ${escapeHtml(cred.generatedAt)}</div>
    </div>
  </div>
</body>
</html>`;
}
