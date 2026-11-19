import { describe, it, expect, beforeEach } from 'vitest';

const mockStore: Record<string, string> = {};
const mockSessionStore: Record<string, string> = {};

const makeStorageMock = (backing: Record<string, string>) => ({
  getItem: (key: string) => backing[key] ?? null,
  setItem: (key: string, value: string) => {
    backing[key] = String(value);
  },
  removeItem: (key: string) => {
    delete backing[key];
  },
  clear: () => {
    for (const k of Object.keys(backing)) delete backing[k];
  },
  key: (idx: number) => Object.keys(backing)[idx] ?? null,
  get length() {
    return Object.keys(backing).length;
  },
});

if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = { crypto: globalThis.crypto };
}
(globalThis as any).localStorage = makeStorageMock(mockStore);
(globalThis as any).sessionStorage = makeStorageMock(mockSessionStore);

import {
  BIONIC_AUGMENTATION_REGEX,
  NEURAL_INTERFACE_BCI_REGEX,
  scanBioCyberneticSignals,
  DNS_ANOMALY_PREVIEW_CSV,
  parseDnsFlowCsv,
  analyzeDnsAnomalies,
  executeAptureCommand,
  loadQArchiveVault,
  runZeroTokenSessionAudit,
  calculateShannonEntropy,
  inspectRansomwareArtifact,
  getRobustEvolveStates,
  executePhoenixJournalCommand,
  clampHorizonYears,
  computeDeterministicWealthProjection,
  applyManualAchievedOverride,
  evaluateWaterChemistry,
} from './sovereignProtocols';
import { cosineSimilarity, latentGazeSearch } from './latentGazeEngine';
import { learningRegexEngine } from './LearningRegexEngine';

describe('Sovereign Uploaded Protocols & Latent Gaze Suite', () => {
  beforeEach(() => {
    (globalThis as any).localStorage.clear();
    (globalThis as any).sessionStorage.clear();
    learningRegexEngine.resetToDefaults();
  });

  describe('Bio-Cybernetic & Neural-Interface BCI Regexes', () => {
    it('matches bionics/cyborg/augmentation/prosthetic/implant terms accurately', () => {
      expect(BIONIC_AUGMENTATION_REGEX.test('bionic arm augmentation')).toBe(true);
      expect(BIONIC_AUGMENTATION_REGEX.test('cyborg prosthetic implant')).toBe(true);
      expect(BIONIC_AUGMENTATION_REGEX.test('standard mechanical keyboard')).toBe(false);
    });

    it('matches neural-interface / BCI / neuroprosthetic / brain-control terms accurately', () => {
      expect(NEURAL_INTERFACE_BCI_REGEX.test('BCI brain-computer interface calibration')).toBe(true);
      expect(NEURAL_INTERFACE_BCI_REGEX.test('neuroprosthetic brain control link')).toBe(true);
      expect(NEURAL_INTERFACE_BCI_REGEX.test('simple html button')).toBe(false);
    });

    it('classifies single and dual vector matches via scanBioCyberneticSignals and LearningRegexEngine', () => {
      const dual = scanBioCyberneticSignals('Installed a bionic implant alongside a neural-interface BCI.');
      expect(dual.hasBionicMatch).toBe(true);
      expect(dual.hasBciMatch).toBe(true);
      expect(dual.classification).toBe('DUAL_VECTOR_DETECTED');

      const evalResult = learningRegexEngine.evaluateRules(
        'Inspecting neural-interface BCI link',
        learningRegexEngine.getRules()
      );
      expect(evalResult.matchedRule).not.toBeNull();
      expect(evalResult.matchedRule?.id).toBe('neural-interface-bci');
    });
  });

  describe('Latent Gaze Search (4-Stage Pipeline)', () => {
    it('computes exact cosine similarity', () => {
      expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1, 5);
      expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0, 5);
      expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
    });

    it('shifts top narrowed hypothesis cleanly based on user_context_vector weights', () => {
      const fishingRes = latentGazeSearch('Sonar ripple frame depth marker', [0.98, 0.05, 0.05, 0.05, 0.05, 0.05]);
      expect(fishingRes.rawPredictions.length).toBe(5);
      expect(fishingRes.bestMatch.id).toBe('hyp-fishing');

      const securityRes = latentGazeSearch('Port 53 packet dump and TCP 80 burst', [0.05, 0.98, 0.05, 0.1, 0.05, 0.05]);
      expect(securityRes.bestMatch.id).toBe('hyp-cyber');

      const fashionRes = latentGazeSearch('Obsidian grainy 35mm silhouette', [0.05, 0.05, 0.98, 0.05, 0.05, 0.05]);
      expect(fashionRes.bestMatch.id).toBe('hyp-art');
    });
  });

  describe('DNS Anomaly Training Data CSV Detector', () => {
    it('parses all 10 uploaded CSV rows and achieves 100% precision & recall on TCP/80 vs UDP/53 flows', () => {
      const rows = parseDnsFlowCsv(DNS_ANOMALY_PREVIEW_CSV);
      expect(rows.length).toBe(10);

      const summary = analyzeDnsAnomalies(DNS_ANOMALY_PREVIEW_CSV);
      expect(summary.totalPackets).toBe(10);
      expect(summary.truePositives).toBe(2);
      expect(summary.falsePositives).toBe(0);
      expect(summary.falseNegatives).toBe(0);
      expect(summary.precision).toBe(1);
      expect(summary.recall).toBe(1);
      expect(summary.accuracy).toBe(1);
      expect(summary.flaggedSources).toContain('202.158.214.106');
    });
  });

  describe('Profound Apture: Never Delete, Only Archive', () => {
    it('appends non-destructive sweep snapshots into ~/.q_archive/ and passes integrity verification', async () => {
      const initial = await loadQArchiveVault();
      const baseCount = initial.length;

      const sweep = await executeAptureCommand('q-sweep', {
        title: 'Incident Pre-Isolation Snapshot',
        sourceLocation: '~/Desktop/forensics',
        content: 'immutable forensic manifest content',
      });

      expect(sweep.verifiedOk).toBe(true);
      expect(sweep.sessions.length).toBe(baseCount + 1);
      expect(sweep.sessions[0].archivePath).toMatch(/^~\/\.q_archive\//);

      const verify = await executeAptureCommand('q-verify');
      expect(verify.verifiedOk).toBe(true);
      expect(verify.sessions.length).toBe(baseCount + 1);
    });
  });

  describe('Zero-Token Session Analysis, Ransomware Forensics, Robust-Evolve & Journalctl', () => {
    it('detects exposed host workspace paths and external tokens during Zero-Token audit', () => {
      const cleanAudit = runZeroTokenSessionAudit('sovereign://local/session');
      expect(cleanAudit.every((f) => f.verdict === 'PASS')).toBe(true);

      const leakyAudit = runZeroTokenSessionAudit('C:\\Users\\Operator\\secret_project firebaseConfig');
      const leakage = leakyAudit.find((f) => f.check === 'Data Leakage');
      const auth = leakyAudit.find((f) => f.check === 'Authentication');
      expect(leakage?.verdict).toBe('WARN');
      expect(auth?.verdict).toBe('FAIL');
    });

    it('flags .sentinel artifacts and high-entropy payloads and builds 4-stage incident playbook', () => {
      const lowEntropy = calculateShannonEntropy('aaaaabbbbbccccc');
      const highEntropy = calculateShannonEntropy('aB3$kL9!pQ7@mZ2#xR8&vW4*nC6^yT1%');
      expect(highEntropy).toBeGreaterThan(lowEntropy);

      const suspect = inspectRansomwareArtifact('important.docx.sentinel', 'x9K!mQ7@zP2#vR8&');
      expect(suspect.hasSentinelTag).toBe(true);
      expect(suspect.verdict).toBe('ENCRYPTED_SENTINEL_SUSPECT');
      expect(suspect.steps.map((s) => s.step)).toEqual([
        'Network Isolation',
        'Offline Scan',
        'Hash Verification',
        'Vault Audit',
      ]);
    });

    it('updates Robust-Evolve Billy Order state on fracture and executes journalctl commands', () => {
      const nominal = getRobustEvolveStates(false);
      expect(nominal.find((p) => p.process === 'Billy Order')?.state).toBe('LOCKED');

      const fractured = getRobustEvolveStates(true);
      expect(fractured.find((p) => p.process === 'Billy Order')?.state).toBe('FRACTURE_ALERT');

      const vacuum = executePhoenixJournalCommand('journalctl --vacuum-time=2d', ['boot ok']);
      expect(vacuum.lines.join('\n')).toContain('42.8M');

      const xe = executePhoenixJournalCommand('journalctl -xe', ['custom-kernel-line-42']);
      expect(xe.lines.some((l) => l.includes('custom-kernel-line-42'))).toBe(true);
    });
  });

  describe('Wealth Engine Architecture & Endless Pool Protocol', () => {
    it('clamps horizon at 50 years, engages 3.5% Safe Fallback, and stamps asterisk (*) audit trails on overrides', () => {
      const clamped = clampHorizonYears(85);
      expect(clamped.clamped).toBe(50);
      expect(clamped.wasClamped).toBe(true);

      const safeProj = computeDeterministicWealthProjection(10000, 1000, 12, 85, true);
      expect(safeProj.horizonYears).toBe(50);
      expect(safeProj.wasClamped).toBe(true);
      expect(safeProj.effectiveRatePercent).toBe(3.5);
      expect(safeProj.series[0].mode).toBe('SAFE_FALLBACK');

      const overridden = applyManualAchievedOverride(
        { id: 'g1', title: 'Sovereign Node Reserve', targetAmount: 25000, horizonYears: 10, achieved: false },
        'Verified offline ledger'
      );
      expect(overridden.achieved).toBe(true);
      expect(overridden.manualOverrideAudit?.startsWith('* ')).toBe(true);
    });

    it('validates Endless Pool pH (7.2-7.8) and Chlorine (1-3 ppm) bands', () => {
      expect(evaluateWaterChemistry(7.4, 2.0).overallStatus).toBe('OPTIMAL');
      const off = evaluateWaterChemistry(6.8, 0.4);
      expect(off.overallStatus).toBe('ADJUSTMENT_REQUIRED');
      expect(off.phValid).toBe(false);
      expect(off.chlorineValid).toBe(false);
    });
  });
});
