import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock browser globals required by subscriptionsDb fallback & TSX modules in Node Vitest
const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: vi.fn((k: string) => (k in mockStorage ? mockStorage[k] : null)),
  setItem: vi.fn((k: string, v: string) => {
    mockStorage[k] = String(v);
  }),
  removeItem: vi.fn((k: string) => {
    delete mockStorage[k];
  }),
  clear: vi.fn(() => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
  }),
  length: 0,
  key: vi.fn(() => null),
} as unknown as Storage;

if (!globalThis.window) {
  globalThis.window = { crypto: globalThis.crypto } as any;
}

// Simulate offline / unconfigured Firestore to verify local subscription fallback path
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn((_db, col, id) => ({ col, id })),
  getDoc: vi.fn(async () => {
    throw new Error('offline_simulated');
  }),
  setDoc: vi.fn(async () => {
    throw new Error('offline_simulated');
  }),
  onSnapshot: vi.fn((_ref, _onNext, onError) => {
    if (onError) onError(new Error('offline_simulated'));
    return () => {};
  }),
}));

import { subscriptionsDb, UserSubscription } from './subscriptionsDb';
import { getPlanLevel, getViewRequiredLevel } from '../components/SovereignAccessGuard';
import { simulate3Weeks, dailyRate } from '../components/BankTransferSimulator';
import { fromBech32, toBech32, toOutputScript, fromOutputScript, NETWORKS } from '../components/bitcoinAddressUtils';
import { compileAIProfile } from './aiProfileService';
import { recordTrustAction, getRecordedTrustActions, getLocalImmutableLedger } from './aiTrustService';
import { safeStorage } from './safeStorage';

describe('AetherOS Critical User Path — Onboarding, Primary Features & Payments', () => {
  beforeEach(() => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. ONBOARDING & ACCESS CONTROL PATH
  // =========================================================================
  describe('Stage 1 — Access Tier Gating & Subscription Persistence', () => {
    it('evaluates subscription tier levels accurately and rejects expired or inactive leases', () => {
      const future = Date.now() + 86_400_000;
      const past = Date.now() - 86_400_000;

      expect(getPlanLevel('Gold Sovereign Core', 'active', future)).toBe(3);
      expect(getPlanLevel('Gold Sovereign Core (Direct-Pass)', 'active', future)).toBe(3);
      expect(getPlanLevel('Silver Consensus Member', 'active', future)).toBe(2);
      expect(getPlanLevel('Bronze Grid Observer', 'active', future)).toBe(1);

      // Expired or inactive must drop to level 0
      expect(getPlanLevel('Gold Sovereign Core', 'active', past)).toBe(0);
      expect(getPlanLevel('Gold Sovereign Core', 'inactive', future)).toBe(0);
      expect(getPlanLevel('Unlicensed', 'inactive')).toBe(0);
      expect(getPlanLevel(undefined, 'active', future)).toBe(0);
    });

    it('maps route view keys to Bronze (0), Silver (2), and Gold (3) requirements accurately', () => {
      // Gold exclusive
      expect(getViewRequiredLevel('forge')).toBe(3);
      expect(getViewRequiredLevel('omni_builder')).toBe(3);
      expect(getViewRequiredLevel('unknown_physics_lab')).toBe(3);
      expect(getViewRequiredLevel('data_provenance_lab')).toBe(3);

      // Silver tier
      expect(getViewRequiredLevel('coding_network')).toBe(2);
      expect(getViewRequiredLevel('testing_lab')).toBe(2);
      expect(getViewRequiredLevel('regex_editor_lab')).toBe(2);

      // Standard open / observer views
      expect(getViewRequiredLevel('chat')).toBe(0);
      expect(getViewRequiredLevel('wallet')).toBe(0);
      expect(getViewRequiredLevel('profile')).toBe(0);
    });

    it('persists and broadcasts subscription activation & revocation locally when Firestore is offline', async () => {
      const received: Array<UserSubscription | null> = [];
      const unsubscribe = subscriptionsDb.subscribeToStatus('user-qa-1', (sub) => {
        received.push(sub);
      });

      const activeSub: UserSubscription = {
        userId: 'user-qa-1',
        email: 'qa@aetheros.local',
        status: 'active',
        plan: 'Gold Sovereign Core',
        expiresAt: Date.now() + 30 * 86_400_000,
        updatedAt: Date.now(),
      };

      await subscriptionsDb.saveSubscription(activeSub);
      const fetched = await subscriptionsDb.getSubscription('user-qa-1');

      expect(fetched?.status).toBe('active');
      expect(fetched?.plan).toBe('Gold Sovereign Core');
      expect(received.some((s) => s?.plan === 'Gold Sovereign Core' && s?.status === 'active')).toBe(true);

      // Deactivate subscription and confirm broadcast updates immediately
      await subscriptionsDb.saveSubscription({
        ...activeSub,
        status: 'inactive',
        plan: 'Unlicensed',
        expiresAt: Date.now(),
      });

      const afterRevoke = await subscriptionsDb.getSubscription('user-qa-1');
      expect(afterRevoke?.status).toBe('inactive');
      expect(received[received.length - 1]?.status).toBe('inactive');

      unsubscribe();
    });
  });

  // =========================================================================
  // 2. PRIMARY FEATURES PATH (UNFILTERED PROFILE & TRUST ACTIONS)
  // =========================================================================
  describe('Stage 2 — Primary Workspace & Unfiltered AI Profile Integrity', () => {
    it('compiles workspace projects and glitches into AI profile request even if stored telemetry is corrupt', async () => {
      await safeStorage.setItem('aetheros_chat_history', '{malformed_json');
      await safeStorage.setItem('aetheros_glitch_history', 'not_json');

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          profileUpdates: { bio: 'Candid summary' },
          aiDossier: { verdictSummary: 'Balanced good & bad', theGood: [], theBad: [] },
        }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const res = await compileAIProfile({
        identifier: 'qa_handle',
        projects: [
          {
            id: 'p1',
            title: 'Core Engine',
            description: 'Main runtime',
            status: 'active',
            tasks: [
              { id: 't1', title: 'Ship parser', completed: true },
              { id: 't2', title: 'Fix leak', completed: false },
            ],
          } as any,
        ],
        glitchHistory: [
          { id: 'g1', timestamp: 2000, duration: 120, isSnapshot: true, label: 'Spike' },
        ],
      });

      expect(res.success).toBe(true);
      const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(sentBody.identifier).toBe('qa_handle');
      expect(sentBody.workspaceContext.projects[0]).toMatchObject({
        completedTasks: 1,
        unfinishedTasks: 1,
      });
      expect(sentBody.workspaceContext.glitches[0].label).toBe('Spike');
      vi.unstubAllGlobals();
    });

    it('records verified trust actions with bounded points, deduplicates rapid repeats, and handles corrupt ledgers', async () => {
      safeStorage.clear();
      if (!globalThis.window.dispatchEvent) {
        globalThis.window.dispatchEvent = vi.fn();
      }
      if (typeof globalThis.CustomEvent === 'undefined') {
        globalThis.CustomEvent = class CustomEvent<T> {
          type: string;
          detail?: T;
          constructor(type: string, init?: { detail?: T }) {
            this.type = type;
            this.detail = init?.detail;
          }
        } as any;
      }

      await recordTrustAction({
        category: 'STABILITY',
        actionType: 'GLITCH_SNAPSHOT',
        summary: 'Captured production anomaly',
        trustPointsAwarded: 999, // must clamp to 35
      });

      // Immediate duplicate within 15s should be suppressed
      await recordTrustAction({
        category: 'STABILITY',
        actionType: 'GLITCH_SNAPSHOT',
        summary: 'Captured production anomaly',
        trustPointsAwarded: 10,
      });

      const actions = await getRecordedTrustActions();
      expect(actions).toHaveLength(1);
      expect(actions[0].trustPointsAwarded).toBe(35);
      expect(actions[0].proofHash).toMatch(/^0X[0-9A-F]{16}$/);

      await safeStorage.setItem('aetheros_immutable_rank_ledger', '{corrupt');
      expect(await getLocalImmutableLedger()).toEqual([]);
    });
  });

  // =========================================================================
  // 3. PAYMENT, BITCOIN SETTLEMENT & TRANSFER SIMULATOR PATH
  // =========================================================================
  describe('Stage 3 — Bitcoin Address Verification & Bank Transfer Simulation', () => {
    it('validates the default treasury Bech32 address and rejects corrupted checksums', () => {
      const treasuryBtc = 'bc1q5lm7pe7d6rev9xc5uyl25jg98q3gn80r8te84j';
      const decoded = fromBech32(treasuryBtc);
      expect(decoded.prefix).toBe('bc');
      expect(decoded.version).toBe(0);
      expect(decoded.data.length).toBe(20);

      const script = toOutputScript(treasuryBtc, NETWORKS.bitcoin);
      expect(fromOutputScript(script, NETWORKS.bitcoin)).toBe(treasuryBtc);

      // Roundtrip witness v1 taproot-style encoding
      const encoded = toBech32(decoded.data, 0, 'bc');
      expect(encoded).toBe(treasuryBtc);

      // Corrupted last char must fail checksum validation
      expect(() => fromBech32('bc1q5lm7pe7d6rev9xc5uyl25jg98q3gn80r8te84k')).toThrow(/checksum/i);
      // Mixed case violates BIP-173
      expect(() => fromBech32('BC1q5lm7pe7d6rev9xc5uyl25jg98q3gn80r8te84j')).toThrow(/Mixed case/i);
    });

    it('simulates 21-day compounding, triggers transfer below minGainPercent, and clamps haircut >= 0', () => {
      expect(dailyRate(0)).toBe(0);

      // Case A: Gain on day 7 (~0.10%) is below 0.30% threshold -> triggers transfer & deducts fees
      const triggered = simulate3Weeks(
        { name: 'BankA', apr: 0.055 },
        { name: 'BankB', apr: 0.045 },
        100_000,
        { apr_fee_rate: 0.0025, title_cost: 450, lender_fee: 300, wire_fee: 25 },
        0.003,
        100_000,
        7
      );
      expect(triggered.transfer_event).toBe(true);
      expect(triggered.end_bank).toBe('BankB');
      expect(triggered.timeline).toHaveLength(21);
      expect(triggered.timeline[6].action).toBe('transfer');
      expect(triggered.timeline[6].transfer_fees_total).toBeCloseTo(1025, 2);

      // Case B: Gain threshold is lower than accrued 7-day yield -> holds at startBank
      const held = simulate3Weeks(
        { name: 'BankA', apr: 0.055 },
        { name: 'BankB', apr: 0.045 },
        100_000,
        { apr_fee_rate: 0.0025, title_cost: 450, lender_fee: 300, wire_fee: 25 },
        0.0005, // 0.05% < ~0.103% 7-day gain
        100_000,
        7
      );
      expect(held.transfer_event).toBe(false);
      expect(held.end_bank).toBe('BankA');
      expect(held.timeline[6].action).toBe('no_transfer');
      expect(held.timeline[6].transfer_fees_total).toBe(0);

      // Case C: Extreme fee never drives portfolio negative
      const floored = simulate3Weeks(
        { name: 'BankA', apr: 0.01 },
        { name: 'BankB', apr: 0.02 },
        100,
        { apr_fee_rate: 0.1, title_cost: 500, lender_fee: 500, wire_fee: 50 },
        0.05,
        100,
        7
      );
      expect(floored.final_value).toBeGreaterThanOrEqual(0);
    });
  });
});
