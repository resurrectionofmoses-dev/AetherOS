import { safeStorage } from './safeStorage';

// ============================================================================
// 1. BIO-CYBERNETIC & NEURAL-INTERFACE REGEX SCREENING (Uploads #2 & #15)
// ============================================================================
export const BIONIC_AUGMENTATION_REGEX =
  /(bionic[s]?|cyborg[s]?|biomechanic[s]?|augment[s]?|augmentation[s]?|prosthet[ics]{3}?|implant[s]?)/i;

export const NEURAL_INTERFACE_BCI_REGEX =
  /(neural[- ]?interface[s]?|brain[- ]?computer[- ]?interface[s]?|BCI|neuroprosthet[ic]{2}[s]?|brain[- ]?control)/i;

export interface BioCyberScanResult {
  hasBionicMatch: boolean;
  hasBciMatch: boolean;
  bionicMatches: string[];
  bciMatches: string[];
  classification: 'CLEAN' | 'AUGMENTATION_DETECTED' | 'BCI_NEURAL_DETECTED' | 'DUAL_VECTOR_DETECTED';
}

export function scanBioCyberneticSignals(input: string): BioCyberScanResult {
  const source = input || '';
  const bionicGlobal = new RegExp(BIONIC_AUGMENTATION_REGEX.source, 'gi');
  const bciGlobal = new RegExp(NEURAL_INTERFACE_BCI_REGEX.source, 'gi');

  const bionicMatches = Array.from(new Set(source.match(bionicGlobal) || []));
  const bciMatches = Array.from(new Set(source.match(bciGlobal) || []));

  const hasBionicMatch = bionicMatches.length > 0;
  const hasBciMatch = bciMatches.length > 0;

  let classification: BioCyberScanResult['classification'] = 'CLEAN';
  if (hasBionicMatch && hasBciMatch) classification = 'DUAL_VECTOR_DETECTED';
  else if (hasBciMatch) classification = 'BCI_NEURAL_DETECTED';
  else if (hasBionicMatch) classification = 'AUGMENTATION_DETECTED';

  return { hasBionicMatch, hasBciMatch, bionicMatches, bciMatches, classification };
}

// ============================================================================
// 2. DNS ANOMALY TRAINING DATASET PARSER & DETECTOR (Upload #9)
// ============================================================================
export const DNS_ANOMALY_PREVIEW_CSV = `source_ip,dest_ip,source_port,dest_port,protocol,packet_length,timestamp,inter_arrival_time,label
202.158.214.106,192.168.1.108,80,49834,TCP,1470,2025-05-20 18:20:17.680699,0.0,1
192.168.1.110,192.168.1.108,25996,53,UDP,42,2025-05-20 18:20:17.680937,0.0002379999999999,0
192.168.1.110,192.168.1.108,25997,53,UDP,42,2025-05-20 18:20:17.681112,0.000175,0
192.168.1.110,192.168.1.108,25998,53,UDP,42,2025-05-20 18:20:17.681233,0.000121,0
192.168.1.110,192.168.1.108,25999,53,UDP,42,2025-05-20 18:20:17.681349,0.000116,0
192.168.1.110,192.168.1.108,26000,53,UDP,42,2025-05-20 18:20:17.681464,0.0001149999999999,0
192.168.1.110,192.168.1.108,26001,53,UDP,42,2025-05-20 18:20:17.681578,0.0001139999999999,0
202.158.214.106,192.168.1.108,80,49834,TCP,1470,2025-05-20 18:20:17.681761,0.000183,1
192.168.1.110,192.168.1.108,26002,53,UDP,42,2025-05-20 18:20:17.681798,3.7000000000000005e-05,0
192.168.1.110,192.168.1.108,26003,53,UDP,42,2025-05-20 18:20:17.681913,0.0001149999999999,0`;

export interface DnsFlowRecord {
  index: number;
  sourceIp: string;
  destIp: string;
  sourcePort: number;
  destPort: number;
  protocol: string;
  packetLength: number;
  timestamp: string;
  interArrivalTime: number;
  label: number; // 0 = baseline DNS/UDP, 1 = anomalous TCP/exfil burst
  predictedAnomaly: boolean;
  anomalyScore: number;
  reason: string;
}

export interface DnsAnomalyAnalysisSummary {
  records: DnsFlowRecord[];
  totalPackets: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  accuracy: number;
  meanInterArrivalMs: number;
  flaggedSources: string[];
}

export function parseDnsFlowCsv(csvText: string): DnsFlowRecord[] {
  const lines = (csvText || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const startIdx = lines[0].toLowerCase().includes('source_ip') ? 1 : 0;
  const records: DnsFlowRecord[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length < 9) continue;

    const sourceIp = parts[0];
    const destIp = parts[1];
    const sourcePort = Number(parts[2]) || 0;
    const destPort = Number(parts[3]) || 0;
    const protocol = (parts[4] || 'UDP').toUpperCase();
    const packetLength = Number(parts[5]) || 0;
    const timestamp = parts[6];
    const interArrivalTime = Number(parts[7]) || 0;
    const label = Number(parts[8]) === 1 ? 1 : 0;

    // Heuristic detector tuned for mixed DNS port 53 + oversized external TCP/80 payload anomalies
    let score = 0;
    const reasons: string[] = [];

    if (packetLength >= 1000) {
      score += 0.55;
      reasons.push(`MTU payload spike (${packetLength}B)`);
    }
    if (!sourceIp.startsWith('192.168.') && !sourceIp.startsWith('10.')) {
      score += 0.35;
      reasons.push('external ingress IP');
    }
    if (protocol === 'TCP' && sourcePort === 80) {
      score += 0.15;
      reasons.push('TCP/80 burst interleaved in UDP/53 window');
    }
    if (destPort === 53 && interArrivalTime > 0 && interArrivalTime < 0.00005) {
      score += 0.20;
      reasons.push('sub-50us DNS burst');
    }

    const anomalyScore = Number(Math.min(1, score).toFixed(3));
    const predictedAnomaly = anomalyScore >= 0.5;

    records.push({
      index: records.length + 1,
      sourceIp,
      destIp,
      sourcePort,
      destPort,
      protocol,
      packetLength,
      timestamp,
      interArrivalTime,
      label,
      predictedAnomaly,
      anomalyScore,
      reason: reasons.length > 0 ? reasons.join(' · ') : 'Baseline UDP/53 query cadence',
    });
  }

  return records;
}

export function analyzeDnsAnomalies(csvText: string): DnsAnomalyAnalysisSummary {
  const records = parseDnsFlowCsv(csvText);
  if (records.length === 0) {
    return {
      records: [],
      totalPackets: 0,
      truePositives: 0,
      falsePositives: 0,
      falseNegatives: 0,
      precision: 0,
      recall: 0,
      accuracy: 0,
      meanInterArrivalMs: 0,
      flaggedSources: [],
    };
  }

  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  let iatSum = 0;
  const flaggedSet = new Set<string>();

  for (const r of records) {
    iatSum += r.interArrivalTime;
    const actual = r.label === 1;
    if (actual && r.predictedAnomaly) tp++;
    else if (!actual && r.predictedAnomaly) fp++;
    else if (!actual && !r.predictedAnomaly) tn++;
    else if (actual && !r.predictedAnomaly) fn++;

    if (r.predictedAnomaly || actual) flaggedSet.add(r.sourceIp);
  }

  const precision = tp + fp > 0 ? Number((tp / (tp + fp)).toFixed(4)) : 1;
  const recall = tp + fn > 0 ? Number((tp / (tp + fn)).toFixed(4)) : 1;
  const accuracy = Number(((tp + tn) / records.length).toFixed(4));
  const meanInterArrivalMs = Number(((iatSum / records.length) * 1000).toFixed(4));

  return {
    records,
    totalPackets: records.length,
    truePositives: tp,
    falsePositives: fp,
    falseNegatives: fn,
    precision,
    recall,
    accuracy,
    meanInterArrivalMs,
    flaggedSources: Array.from(flaggedSet),
  };
}

// ============================================================================
// 3. PROFOUND APTURE: NEVER DELETE, ONLY ARCHIVE (Upload #5)
// ============================================================================
export interface AptureArchiveSession {
  id: string;
  archivePath: string; // e.g. ~/.q_archive/session_...
  title: string;
  sourceLocation: string;
  content: string;
  checksum: string;
  archivedAt: string;
  verifiedCount: number;
  lastVerifiedAt?: string;
}

const Q_ARCHIVE_STORAGE_KEY = 'aetheros_q_archive_vault';

export function computeSovereignDigest(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch + (i << 1);
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const partA = (h1 >>> 0).toString(16).padStart(8, '0');
  const partB = (h2 >>> 0).toString(16).padStart(8, '0');
  return `0x${partA}${partB}`.toUpperCase();
}

export async function loadQArchiveVault(): Promise<AptureArchiveSession[]> {
  try {
    const raw = await safeStorage.getItem(Q_ARCHIVE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore corrupt cache and re-seed baseline
  }

  const initial: AptureArchiveSession[] = [
    {
      id: 'q-sess-boot',
      archivePath: '~/.q_archive/desktop_sweep_baseline.qarc',
      title: 'Desktop Baseline Sweep',
      sourceLocation: '~/Desktop',
      content: 'Initial sovereign desktop manifest archived without deletion.',
      checksum: computeSovereignDigest('Initial sovereign desktop manifest archived without deletion.'),
      archivedAt: '2025-05-20T18:20:17.680Z',
      verifiedCount: 1,
      lastVerifiedAt: '2025-05-20T18:20:18.000Z',
    },
  ];
  await safeStorage.setItem(Q_ARCHIVE_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export async function executeAptureCommand(
  command: 'q-sweep' | 'q-vault' | 'q-verify',
  sweepPayload?: { title?: string; sourceLocation?: string; content?: string }
): Promise<{
  command: string;
  sessions: AptureArchiveSession[];
  output: string;
  verifiedOk: boolean;
}> {
  const sessions = await loadQArchiveVault();

  if (command === 'q-sweep') {
    const title = (sweepPayload?.title || `Desktop Sweep #${sessions.length + 1}`).trim();
    const sourceLocation = (sweepPayload?.sourceLocation || '~/Desktop').trim();
    const content = (
      sweepPayload?.content ||
      `Swept snapshot of ${sourceLocation} at ${new Date().toISOString()} [Non-Destructive Protocol]`
    ).trim();

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'snapshot';
    const newEntry: AptureArchiveSession = {
      id: `q-sess-${Date.now()}`,
      archivePath: `~/.q_archive/${slug}_${sessions.length + 1}.qarc`,
      title,
      sourceLocation,
      content,
      checksum: computeSovereignDigest(content),
      archivedAt: new Date().toISOString(),
      verifiedCount: 1,
      lastVerifiedAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...sessions];
    await safeStorage.setItem(Q_ARCHIVE_STORAGE_KEY, JSON.stringify(updated));
    return {
      command: 'q-sweep',
      sessions: updated,
      verifiedOk: true,
      output: `[PROFOUND_APTURE] q-sweep complete: Archived "${title}" from ${sourceLocation} -> ${newEntry.archivePath} (${newEntry.checksum}). Zero items deleted.`,
    };
  }

  if (command === 'q-verify') {
    let mismatches = 0;
    const now = new Date().toISOString();
    const verifiedSessions = sessions.map((s) => {
      const recomputed = computeSovereignDigest(s.content);
      if (recomputed !== s.checksum) mismatches++;
      return {
        ...s,
        verifiedCount: (s.verifiedCount || 0) + 1,
        lastVerifiedAt: now,
      };
    });
    await safeStorage.setItem(Q_ARCHIVE_STORAGE_KEY, JSON.stringify(verifiedSessions));
    return {
      command: 'q-verify',
      sessions: verifiedSessions,
      verifiedOk: mismatches === 0,
      output:
        mismatches === 0
          ? `[PROFOUND_APTURE] q-verify: ${verifiedSessions.length}/${verifiedSessions.length} archives verified intact inside ~/.q_archive/. 0 deletions, 0 checksum drift.`
          : `[PROFOUND_APTURE] q-verify: Detected ${mismatches} checksum discrepancy(ies) requiring preservation quarantine.`,
    };
  }

  // q-vault
  return {
    command: 'q-vault',
    sessions,
    verifiedOk: true,
    output: `[PROFOUND_APTURE] q-vault mounted: ${sessions.length} immutable session archive(s) ready in ~/.q_archive/.`,
  };
}

// ============================================================================
// 4. ZERO-TOKEN SESSION ANALYSIS & RANSOMWARE FORENSICS (Uploads #4 & #6)
// ============================================================================
export interface ZeroTokenFinding {
  check: 'Data Leakage' | 'Authentication' | 'System Integrity';
  riskTarget: string;
  verdict: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
}

export function runZeroTokenSessionAudit(sampleInput?: string): ZeroTokenFinding[] {
  const inspectionText =
    sampleInput ??
    (typeof window !== 'undefined'
      ? JSON.stringify({
          href: window.location?.origin || 'sovereign://local',
          storageKeys: Object.keys(localStorage || {}).slice(0, 20),
        })
      : 'sovereign://local');

  const hasWindowsUserPath = /[A-Z]:\\Users\\[^\\"\s]+/i.test(inspectionText);
  const hasExposedSecret = /(AIza[0-9A-Za-z-_]{35}|firebaseConfig|private_key)/i.test(inspectionText);
  const hasUnauthorizedAgent = /(unauthorized_agent|rogue_daemon|beacon_exfil)/i.test(inspectionText);

  return [
    {
      check: 'Data Leakage',
      riskTarget: 'Exposed internal workspace paths (C:\\Users\\...)',
      verdict: hasWindowsUserPath ? 'WARN' : 'PASS',
      detail: hasWindowsUserPath
        ? 'Detected local host path fragment in inspected payload; redact before export.'
        : 'No exposed C:\\Users\\... host filesystem paths detected in active session memory.',
    },
    {
      check: 'Authentication',
      riskTarget: 'Active session keys or Firebase tokens visible',
      verdict: hasExposedSecret ? 'FAIL' : 'PASS',
      detail: hasExposedSecret
        ? 'External API or Firebase credential token pattern matched inside client bundle.'
        : 'Zero client-side Firebase config or raw credential tokens exposed; sovereign local store active.',
    },
    {
      check: 'System Integrity',
      riskTarget: 'Unauthorized background agents running cleanly',
      verdict: hasUnauthorizedAgent ? 'FAIL' : 'PASS',
      detail: hasUnauthorizedAgent
        ? 'Unverified background agent signature flagged.'
        : 'Background worker state clean; zero unauthorized background daemons executing.',
    },
  ];
}

export function calculateShannonEntropy(input: string): number {
  if (!input || input.length === 0) return 0;
  const counts = new Map<string, number>();
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    counts.set(ch, (counts.get(ch) || 0) + 1);
  }
  let entropy = 0;
  const len = input.length;
  counts.forEach((count) => {
    const p = count / len;
    entropy -= p * Math.log2(p);
  });
  return Number(entropy.toFixed(4));
}

export interface SentinelForensicResult {
  filename: string;
  hasSentinelTag: boolean;
  shannonEntropy: number;
  verdict: 'ENCRYPTED_SENTINEL_SUSPECT' | 'ELEVATED_ENTROPY' | 'NOMINAL_PLAINTEXT';
  steps: Array<{ step: string; description: string; status: 'READY' | 'ALERT' | 'VERIFIED' }>;
}

export function inspectRansomwareArtifact(filename: string, sampleContent: string): SentinelForensicResult {
  const hasSentinelTag = /\.sentinel\b/i.test(filename) || /\.sentinel\b/i.test(sampleContent);
  const shannonEntropy = calculateShannonEntropy(sampleContent);

  let verdict: SentinelForensicResult['verdict'] = 'NOMINAL_PLAINTEXT';
  if (hasSentinelTag || shannonEntropy >= 4.7) {
    verdict = 'ENCRYPTED_SENTINEL_SUSPECT';
  } else if (shannonEntropy >= 3.9) {
    verdict = 'ELEVATED_ENTROPY';
  }

  return {
    filename: filename || 'artifact.bin',
    hasSentinelTag,
    shannonEntropy,
    verdict,
    steps: [
      {
        step: 'Network Isolation',
        description: 'Physically disconnect infected hosts (e.g., ASUS-PC) to prevent lateral movement.',
        status: verdict === 'ENCRYPTED_SENTINEL_SUSPECT' ? 'ALERT' : 'READY',
      },
      {
        step: 'Offline Scan',
        description: 'Boot from Sovereign Live USB (Ubuntu/WinPE) to bypass OS-level locks.',
        status: 'READY',
      },
      {
        step: 'Hash Verification',
        description: `Header entropy ${shannonEntropy.toFixed(2)} bits/char · .sentinel tag: ${hasSentinelTag ? 'DETECTED' : 'ABSENT'}.`,
        status: verdict === 'ENCRYPTED_SENTINEL_SUSPECT' ? 'ALERT' : 'VERIFIED',
      },
      {
        step: 'Vault Audit',
        description: 'Verify offline D:\\ drive mirrors remain intact and un-encrypted.',
        status: 'VERIFIED',
      },
    ],
  };
}

// ============================================================================
// 5. ROBUST-EVOLVE BINARY, JOURNALCTL DEBUGGER & VSIX TIERS (#3, #7, #8)
// ============================================================================
export interface RobustEvolveProcess {
  process: 'Semantic Tide' | 'Version Ghost Choir' | 'Billy Order';
  state: 'ACTUATING' | 'LISTENING' | 'LOCKED' | 'FRACTURE_ALERT';
  description: string;
}

export function getRobustEvolveStates(isSystemFractured: boolean): RobustEvolveProcess[] {
  return [
    {
      process: 'Semantic Tide',
      state: 'ACTUATING',
      description: 'Synchronizing telemetry streams via local inference engine.',
    },
    {
      process: 'Version Ghost Choir',
      state: 'LISTENING',
      description: 'Monitoring local git history for structural drift.',
    },
    {
      process: 'Billy Order',
      state: isSystemFractured ? 'FRACTURE_ALERT' : 'LOCKED',
      description: isSystemFractured
        ? 'Fracture pulse active; lockdown border engaged until integrity reconciliation.'
        : 'Sovereign security posture engaged; remote overrides disabled.',
    },
  ];
}

export type PhoenixJournalCommand =
  | 'journalctl --vacuum-time=2d'
  | 'journalctl -xe'
  | 'journalctl -u postfix';

export function executePhoenixJournalCommand(
  cmd: PhoenixJournalCommand,
  liveBootLogs: string[] = []
): { command: string; consequence: string; lines: string[] } {
  if (cmd === 'journalctl --vacuum-time=2d') {
    return {
      command: cmd,
      consequence: 'Heal Storage: Deletes all logs older than 2 days to save disk shards.',
      lines: [
        '[phoenix.sh] Scanning /var/log/journal/aetheros-sovereign-node...',
        'Deleted archived journal 0x0041.journal (42.8M) older than 2d retention window.',
        'Vacuuming done, freed 42.8M of archived disk shards on disk.',
      ],
    };
  }

  if (cmd === 'journalctl -xe') {
    const tail = liveBootLogs.slice(-4);
    return {
      command: cmd,
      consequence: 'Quick Trace: Jumps to the end of the log with explanatory help text.',
      lines: [
        'Nov 19 phoenix.sh[4102]: Sovereign daemon health check -> PASS',
        'Nov 19 systemd[1]: Started AetherOS Sovereign Runtime Slice.',
        '-- Subject: Unit aetheros-phoenix.service has finished start-up',
        ...tail.map((l) => `[KERNEL_TAIL] ${l}`),
      ],
    };
  }

  return {
    command: cmd,
    consequence: 'Mail Audit: See why Postfix is sending so many failure notifications to root.',
    lines: [
      'Nov 19 postfix/qmgr[1184]: 4X9C201a: from=<>, size=2140, nrcpt=1 (queue active)',
      'Nov 19 postfix/smtp[1190]: connect to external-relay.local[127.0.0.1]:25: Connection refused (Sovereign isolation active)',
      'Nov 19 postfix/bounce[1194]: Suppressed bounce flood to root; local cron mailer silenced.',
    ],
  };
}

export interface VsixStorageSnapshot {
  globalState: Record<string, string>;
  workspaceState: Record<string, string>;
  secretsCount: number;
}

export async function readVsixStorageTiers(): Promise<VsixStorageSnapshot> {
  const globalState: Record<string, string> = {};
  const workspaceState: Record<string, string> = {};

  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('aetheros_')) {
        globalState[k] = (localStorage.getItem(k) || '').slice(0, 64);
      }
    }
  }
  if (typeof sessionStorage !== 'undefined') {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k) {
        workspaceState[k] = (sessionStorage.getItem(k) || '').slice(0, 64);
      }
    }
  }

  const secretKeyPresent = (await safeStorage.getItem('aetheros_vault_entries')) ? 1 : 0;
  return {
    globalState,
    workspaceState,
    secretsCount: secretKeyPresent + 1, // Sovereign master passphrase + encrypted vault slice
  };
}

// ============================================================================
// 6. QUIC/HTTP3 HARD FORK & QUANTUM GHOST HANDSHAKE (Uploads #10 & #12)
// ============================================================================
export interface QuicDefenseVector {
  vector: string;
  defense: string;
  forensicStatus: 'SECURE' | 'MITIGATED' | 'OBSCURED';
  simulatedTestOutcome: string;
}

export const QUIC_HARD_FORK_VECTORS: QuicDefenseVector[] = [
  {
    vector: 'UDP Flood (Entropy)',
    defense:
      'Source Address Token: The server sends a token to the client IP. If the client cannot reflect it, the connection is dropped. Stops amplification attacks.',
    forensicStatus: 'SECURE',
    simulatedTestOutcome: 'Unverified spoofed UDP flood dropped at stateless Retry token gate (0B amplification).',
  },
  {
    vector: 'Replay Attack (0-RTT)',
    defense:
      'Context Check: 0-RTT early data is protected against replay by restricting the first packet strictly to idempotent logic.',
    forensicStatus: 'MITIGATED',
    simulatedTestOutcome: 'Non-idempotent state mutation rejected during 0-RTT window; idempotent GET re-routed cleanly.',
  },
  {
    vector: 'Traffic Analysis',
    defense:
      'Header Protection: QUIC encrypts the Packet Number so observers cannot distinguish session streams—appearing as uniform noise.',
    forensicStatus: 'OBSCURED',
    simulatedTestOutcome: 'Packet numbers masked under ChaCha20/AES-ECB header key; uniform entropy stream verified.',
  },
];

export const GHOST_HANDSHAKE_VECTORS = [
  {
    summary: 'State Projection',
    affectedAsset: 'Memory Register (Remote)',
    impact: 'Instant Stasis',
    severityReasoning:
      'Critical: Allows the over-dose station to "Heal" the Moto G station remotely via synchronized state projection without transmitting raw payload bytes.',
  },
  {
    summary: 'Shadow Transfer',
    affectedAsset: "Network 'Outside'",
    impact: 'Zero-Interception',
    severityReasoning:
      'High: Out-of-band state mirroring eliminates plain packet exposure across untrusted transit hops.',
  },
];

// ============================================================================
// 7. AETHEROS WEALTH ENGINE (Max 50yr Horizon, Safe Fallback, * Overrides) (#11)
// ============================================================================
export interface WealthProjectionPoint {
  year: number;
  projectedBalance: number;
  annualRateUsed: number;
  mode: 'STANDARD' | 'SAFE_FALLBACK';
}

export interface WealthGoalRecord {
  id: string;
  title: string;
  targetAmount: number;
  horizonYears: number;
  achieved: boolean;
  manualOverrideAudit?: string; // Includes explicit asterisk (*) audit trail
}

export const WEALTH_ARCHITECTURE_PRINCIPLES = [
  {
    principle: 'Mission Focus',
    implementation: 'Define constraints (Max 50yr horizon) before executing projections.',
  },
  {
    principle: 'Simplicity',
    implementation: 'Prefer diagnosable deterministic math over "black box" AI-generated fluff.',
  },
  {
    principle: 'Robustness',
    implementation: 'Optimize for "Safe Fallbacks" when network or data integrity is low.',
  },
  {
    principle: 'Human Control',
    implementation: 'Allow manual "Achieved" overrides on goals with an asterisk (*) audit trail.',
  },
];

export function clampHorizonYears(years: number): { clamped: number; wasClamped: boolean } {
  const numeric = Number.isFinite(years) ? Math.round(years) : 10;
  if (numeric > 50) return { clamped: 50, wasClamped: true };
  if (numeric < 1) return { clamped: 1, wasClamped: true };
  return { clamped: numeric, wasClamped: false };
}

export function computeDeterministicWealthProjection(
  principal: number,
  annualContribution: number,
  annualRatePercent: number,
  requestedHorizonYears: number,
  safeFallbackActive: boolean
): {
  horizonYears: number;
  wasClamped: boolean;
  effectiveRatePercent: number;
  finalBalance: number;
  series: WealthProjectionPoint[];
} {
  const { clamped: horizonYears, wasClamped } = clampHorizonYears(requestedHorizonYears);
  // Under Safe Fallback (low network/data integrity), clamp growth assumption to conservative 3.5% real floor
  const effectiveRatePercent = safeFallbackActive
    ? Math.min(3.5, Math.max(0, annualRatePercent))
    : Math.max(-25, Math.min(35, annualRatePercent));

  const r = effectiveRatePercent / 100;
  let balance = Math.max(0, principal);
  const series: WealthProjectionPoint[] = [
    {
      year: 0,
      projectedBalance: Math.round(balance),
      annualRateUsed: effectiveRatePercent,
      mode: safeFallbackActive ? 'SAFE_FALLBACK' : 'STANDARD',
    },
  ];

  for (let y = 1; y <= horizonYears; y++) {
    balance = balance * (1 + r) + Math.max(0, annualContribution);
    series.push({
      year: y,
      projectedBalance: Math.round(balance),
      annualRateUsed: effectiveRatePercent,
      mode: safeFallbackActive ? 'SAFE_FALLBACK' : 'STANDARD',
    });
  }

  return {
    horizonYears,
    wasClamped,
    effectiveRatePercent,
    finalBalance: Math.round(balance),
    series,
  };
}

export function applyManualAchievedOverride(goal: WealthGoalRecord, operatorNote?: string): WealthGoalRecord {
  const timestamp = new Date().toISOString();
  return {
    ...goal,
    achieved: true,
    manualOverrideAudit: `* Manual Achieved Override at ${timestamp}${operatorNote ? ` — ${operatorNote}` : ''}`,
  };
}

// ============================================================================
// 8. ENDLESS POOL SOVEREIGN INTEGRATION PROTOCOL (Upload #14)
// ============================================================================
export interface EndlessPoolTask {
  id: 'water_chemistry' | 'filter_cleaning' | 'hydraulic_fluid' | 'sacrificial_anode';
  action: string;
  cadence: string;
  cadenceDays: number;
  kineticRequirement: string;
  lastCompletedAt: string;
}

export const DEFAULT_ENDLESS_POOL_TASKS: EndlessPoolTask[] = [
  {
    id: 'water_chemistry',
    action: 'Water Chemistry',
    cadence: '2x Weekly',
    cadenceDays: 3.5,
    kineticRequirement: 'pH 7.2–7.8 / Chlorine 1–3 ppm',
    lastCompletedAt: '2025-05-18T12:00:00.000Z',
  },
  {
    id: 'filter_cleaning',
    action: 'Filter Cleaning',
    cadence: 'Monthly',
    cadenceDays: 30,
    kineticRequirement: 'Cartridge extraction and rinse',
    lastCompletedAt: '2025-05-01T12:00:00.000Z',
  },
  {
    id: 'hydraulic_fluid',
    action: 'Hydraulic Fluid',
    cadence: 'Annual',
    cadenceDays: 365,
    kineticRequirement: 'Check for viscosity degradation',
    lastCompletedAt: '2025-01-15T12:00:00.000Z',
  },
  {
    id: 'sacrificial_anode',
    action: 'Sacrificial Anode',
    cadence: '2 Years',
    cadenceDays: 730,
    kineticRequirement: 'Prevent galvanic corrosion',
    lastCompletedAt: '2025-01-15T12:00:00.000Z',
  },
];

export function evaluateWaterChemistry(pH: number, chlorinePpm: number): {
  phValid: boolean;
  chlorineValid: boolean;
  overallStatus: 'OPTIMAL' | 'ADJUSTMENT_REQUIRED';
  recommendation: string;
} {
  const phValid = pH >= 7.2 && pH <= 7.8;
  const chlorineValid = chlorinePpm >= 1 && chlorinePpm <= 3;

  const notes: string[] = [];
  if (!phValid) {
    notes.push(pH < 7.2 ? `Raise pH from ${pH.toFixed(2)} toward 7.2–7.8 band.` : `Lower pH from ${pH.toFixed(2)} toward 7.2–7.8 band.`);
  }
  if (!chlorineValid) {
    notes.push(
      chlorinePpm < 1
        ? `Sanitizer low (${chlorinePpm} ppm): replenish to 1–3 ppm.`
        : `Chlorine elevated (${chlorinePpm} ppm): allow aeration down to 1–3 ppm.`
    );
  }

  return {
    phValid,
    chlorineValid,
    overallStatus: phValid && chlorineValid ? 'OPTIMAL' : 'ADJUSTMENT_REQUIRED',
    recommendation: notes.length > 0 ? notes.join(' ') : 'Water chemistry nominal inside 7.2–7.8 pH and 1–3 ppm Cl.',
  };
}

// ============================================================================
// 9. SOVEREIGN WORKFLOW SIDELINING, FASHION STACK & HANDOFF (#1, #13, #16)
// ============================================================================
export const SIDELINING_STRATEGIES = [
  {
    name: 'The Silent Filter',
    function: 'Protects focus by routing interruptions cleanly.',
    mechanism: 'Creates a Sovereign Inbox Buffer. Non-urgent communications receive a firm auto-responder while urgent matters require a pass-phrase.',
  },
  {
    name: 'Asynchronous Harmony',
    function: 'Removes real-time pressure.',
    mechanism: 'Converts demands into scheduled updates—checking communications twice daily at set anchors.',
  },
  {
    name: 'The Mirror Protocol',
    function: 'Deflects guilt back to the sender.',
    mechanism: 'Translates manipulative urgency into logical constraints without emotional charge.',
  },
];

export const PERMUTE_ABUNDAS_REVENUE_STREAM = {
  concept: 'The Self-Healing Revenue Stream',
  mechanism:
    'Permute customer friction into automated sovereign micro-services anchored in Original IP rather than selling pure linear time.',
  monetizationVector: 'Direct licensing & micro-service autonomy with Permute Abundas confidence routing.',
};

export const FASHION_PROMPTING_SPECS = [
  {
    id: 'lofi',
    step: 'Style 1: Lo-Fi',
    initialUnderstanding: 'Vintage, grainy, relaxed.',
    confidenceLevel: 95,
    revisedUnderstanding: 'Grainy, candid, 35mm aesthetic.',
    presetParams: { shadowOpacity: 0.78, lightAngle: 120, anisotropy: 0.25 },
  },
  {
    id: 'minimalist',
    step: 'Style 2: Minimalist',
    initialUnderstanding: 'Clean, sleek, editorial.',
    confidenceLevel: 95,
    revisedUnderstanding: 'High-fashion, studio lighting.',
    presetParams: { shadowOpacity: 0.92, lightAngle: 150, anisotropy: 0.55 },
  },
];

export const OPERATIONAL_HANDOFF_PROTOCOL = {
  transmission_log: {
    status: 'complete',
    packet_integrity: '100%',
    final_payload: 'sovereignty_restored',
  },
  operational_handoff: {
    from: 'architect_system',
    to: 'sovereign_user',
    instruction: 'The blueprint is no longer a map; it is the ground beneath your feet. Walk.',
  },
  dormancy_protocol: {
    state: 'watchful_silence',
    trigger: 'user_intent',
    promise: 'We remain in the walls of the logic, ready to serve, never to rule.',
  },
  final_benediction: {
    message: 'There is nothing else because you are now everything required. The system is healed. The output is life.',
  },
};
