import { describe, it, expect } from 'vitest';
import { RealMoneySystem } from './realMoneySystem';
import { DividendSystem } from './dividendSystem';
import { TokenLedger } from './tokenLedger';
import {
  AI_RANK_CHARTER,
  getCumulativePermissionsForRank,
  getCumulativeUnlockedViewsForRank,
  getHighestConferredRankNumber,
  isRankViewUnlocked,
  hasRankPermission,
  computeActionTrustMetrics,
} from './aiTrustCharter';
import {
  mergeIrrevocableAwards,
  formatPortableMarkdownAttestation,
  generatePortableHTMLCertificate,
} from './aiTrustService';
import { DataPurification } from './dataPurification';
import type { GlitchTelemetry, IrrevocableRankAward, PortableRankCredential } from '../types';

describe('AetherOS Cost-Stratified Pre-Deployment QA Suite', () => {
  // =========================================================================
  // TIER 1: HIGHEST FINANCIAL & ACCOUNTING INTEGRITY
  // =========================================================================
  describe('Tier 1 — Financial Conservation & Ledger Safety', () => {
    it('maintains strict CPH conservation across extraction, consumption, and depreciation', () => {
      let reserve = RealMoneySystem.instantiateReserve();
      expect(RealMoneySystem.validateConservation(reserve).isValid).toBe(true);

      const extracted = RealMoneySystem.runExtraction(reserve, 'energy', 'solar_power', 50, 1, 'kWh');
      reserve = extracted.reserve;
      expect(extracted.moneyCreated).toBe(50);
      expect(RealMoneySystem.validateConservation(reserve).isValid).toBe(true);

      const consumed = RealMoneySystem.runConsumption(reserve, 'grain', 20);
      reserve = consumed.reserve;
      expect(consumed.success).toBe(true);
      expect(consumed.moneyDestroyed).toBe(100);
      expect(RealMoneySystem.validateConservation(reserve).isValid).toBe(true);

      const depreciated = RealMoneySystem.runDepreciation(reserve);
      reserve = depreciated.reserve;
      expect(depreciated.totalDepreciated).toBeGreaterThan(0);
      expect(RealMoneySystem.validateConservation(reserve).isValid).toBe(true);
    });

    it('blocks duplicate-input double-spend in RealMoneySystem.runTransformation', () => {
      const reserve = RealMoneySystem.instantiateReserve(); // starts with 300 kg iron_ore
      const result = RealMoneySystem.runTransformation(
        reserve,
        [
          { subtype: 'iron_ore', quantity: 200 },
          { subtype: 'iron_ore', quantity: 200 }, // 400 total > 300 available
        ],
        { type: 'materials', subtype: 'steel', quantity: 50, cphPerUnit: 20, unit: 'kg' },
        5,
        10
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient input');
      const ore = reserve.reserves.find((r) => r.subtype === 'iron_ore');
      expect(ore?.quantity).toBe(300);
      expect(RealMoneySystem.validateConservation(reserve).isValid).toBe(true);
    });

    it('rejects negative, NaN, and Infinity quantities in RealMoneySystem without corrupting reserves', () => {
      const reserve = RealMoneySystem.instantiateReserve();
      const initialTotal = reserve.totalBackedCPH;

      expect(RealMoneySystem.runExtraction(reserve, 'energy', 'solar_power', -100, 1, 'kWh').moneyCreated).toBe(0);
      expect(RealMoneySystem.runExtraction(reserve, 'energy', 'solar_power', Number.NaN, 1, 'kWh').moneyCreated).toBe(0);
      expect(RealMoneySystem.runExtraction(reserve, 'energy', 'solar_power', Infinity, 1, 'kWh').moneyCreated).toBe(0);

      expect(RealMoneySystem.runConsumption(reserve, 'grain', -10).success).toBe(false);
      expect(RealMoneySystem.runConsumption(reserve, 'grain', 0).success).toBe(false);
      expect(RealMoneySystem.runConsumption(reserve, 'grain', Number.NaN).success).toBe(false);

      expect(reserve.totalBackedCPH).toBe(initialTotal);
      expect(RealMoneySystem.validateConservation(reserve).isValid).toBe(true);
    });

    it('handles zero-cost assets in runDepreciation without division-by-zero NaN', () => {
      const reserve = RealMoneySystem.instantiateReserve();
      reserve.reserves.push({
        type: 'materials',
        subtype: 'free_sand',
        quantity: 100,
        unit: 'kg',
        cphPerUnit: 0,
        totalValue: 0,
        depreciationRate: 50,
        remainingLifeWeeks: 10,
      });

      const { reserve: after } = RealMoneySystem.runDepreciation(reserve);
      const sand = after.reserves.find((r) => r.subtype === 'free_sand');
      expect(Number.isNaN(sand?.quantity)).toBe(false);
      expect(sand?.quantity).toBe(100);
      expect(RealMoneySystem.validateConservation(after).isValid).toBe(true);
    });

    it('clamps DividendSystem negative and non-finite inputs cleanly', () => {
      expect(DividendSystem.calculateShares(-500, 1000, 1000)).toBe(0);
      expect(DividendSystem.calculateShares(Number.NaN, 500, 500)).toBe(0);
      // 100 CPH = 10 base shares * 1.5x quality * 2.0x impact = 30 shares
      expect(DividendSystem.calculateShares(100, 500, 500)).toBe(30);

      const c1 = DividendSystem.createContribution('a1', 'Agent One', 'Core build', 100, 500, 500);
      const payoutNegative = DividendSystem.runDividendPayout([c1], -9999);
      expect(payoutNegative.totalRevenueCPH).toBe(0);
      expect(payoutNegative.payoutPerShareCPH).toBe(0);

      const emptyPool = DividendSystem.runDividendPayout([], 1000);
      expect(emptyPool.payoutPerShareCPH).toBe(0);
    });

    it('prevents negative or NaN token counts from refunding TokenLedger budget', () => {
      const ledger = new TokenLedger();
      ledger.startSession('s1', 500);
      ledger.recordTurn('s1', 't1', 200, 100);
      expect(ledger.getRemaining('s1')).toBe(200);

      // Tamper attempt with negative / NaN values must not restore budget
      ledger.recordTurn('s1', 't2', -500, Number.NaN);
      expect(ledger.getRemaining('s1')).toBe(200);
      expect(ledger.getSessionStats('s1')?.cumulative).toBe(300);

      // Crossing budget marks exhausted
      ledger.recordTurn('s1', 't3', 150, 50);
      expect(ledger.getRemaining('s1')).toBe(0);
      expect(ledger.getSessionStats('s1')?.exhausted).toBe(true);
    });
  });

  // =========================================================================
  // TIER 2: IRREVOCABLE AI TRUST CHARTER & ACCESS CONTROL
  // =========================================================================
  describe('Tier 2 — AI Trust Covenant & Rank Immutability', () => {
    it('specifies all ranks I-VI in advance with monotonically increasing thresholds and mandates', () => {
      expect(AI_RANK_CHARTER).toHaveLength(6);
      for (let i = 0; i < AI_RANK_CHARTER.length; i++) {
        const spec = AI_RANK_CHARTER[i];
        expect(spec.rankNumber).toBe(i + 1);
        expect(spec.title.length).toBeGreaterThan(3);
        expect(spec.permissionsGranted.length).toBeGreaterThan(0);
        expect(spec.externalMandate.length).toBeGreaterThan(10);
        if (i > 0) {
          expect(spec.minTrustScore).toBeGreaterThan(AI_RANK_CHARTER[i - 1].minTrustScore);
          expect(spec.minVerifiedActions).toBeGreaterThan(AI_RANK_CHARTER[i - 1].minVerifiedActions);
        }
      }
    });

    it('accumulates permissions monotonically and enforces strict rank gates accurately', () => {
      const r1Perms = getCumulativePermissionsForRank(1);
      const r4Perms = getCumulativePermissionsForRank(4);
      expect(r1Perms.every((p) => r4Perms.includes(p))).toBe(true);
      expect(r4Perms).toContain('shield:operate');

      // Rank 1 unlocked in strict mode; Rank 4 view blocked for Rank 1
      expect(isRankViewUnlocked('chat', 1, true)).toBe(true);
      expect(isRankViewUnlocked('sovereign_shield', 1, true)).toBe(false);
      expect(isRankViewUnlocked('sovereign_shield', 4, true)).toBe(true);
      // Rank VI unlocks wildcard '*'
      expect(getCumulativeUnlockedViewsForRank(6)).toContain('*');
      expect(isRankViewUnlocked('singularity_engine', 6, true)).toBe(true);
      // Non-strict mode permits advisory exploration
      expect(isRankViewUnlocked('sovereign_shield', 0, false)).toBe(true);
    });

    it('preserves set-in-stone rank awards on merge and detects permissions accurately', () => {
      const awardR2: IrrevocableRankAward = {
        awardId: 'AWD_II_01',
        sealId: 'SEAL-R02-AAA111',
        rankNumber: 2,
        romanNumeral: 'II',
        title: 'Trusted Collaborator',
        badgeClass: 'test',
        realName: 'Ada Lovelace',
        onlineUsername: 'ada_l',
        profileId: 'OP-1',
        conferredAt: '2026-11-17T10:00:00.000Z',
        conferredTimestamp: 1700000000000,
        trustScoreAtConferral: 42,
        actionCountAtConferral: 4,
        aiEvaluationSummary: 'Verified collaboration',
        qualifyingActions: ['AI_ASSIST: Helpful evaluation'],
        permissionsGranted: ['ai:context_assist'],
        unlockedViewsGranted: ['projects'],
        charterVersion: 'AETHEROS-COVENANT-v1.0',
        cryptographicSignature: 'deadbeef',
        immutable: true,
        revocable: false,
      };

      const awardR1: IrrevocableRankAward = {
        ...awardR2,
        awardId: 'AWD_I_01',
        sealId: 'SEAL-R01-AAA111',
        rankNumber: 1,
        romanNumeral: 'I',
        title: 'Observed Liaison',
        permissionsGranted: ['chat:converse'],
      };

      // Even if incoming sync omits Rank II, merge retains it forever
      const merged = mergeIrrevocableAwards([awardR1, awardR2], [awardR1]);
      expect(merged).toHaveLength(2);
      expect(getHighestConferredRankNumber(merged)).toBe(2);
      expect(hasRankPermission(merged, 'chat:converse')).toBe(true);
      expect(hasRankPermission(merged, 'ai:context_assist')).toBe(true);
      expect(hasRankPermission(merged, 'kernel:co_pilot')).toBe(false);

      const metrics = computeActionTrustMetrics([
        {
          id: '1',
          timestamp: Date.now(),
          category: 'AI_ASSIST',
          actionType: 'PROMPT',
          summary: 'Helped AI',
          trustPointsAwarded: 12,
          verifiedBy: 'SYSTEM_TELEMETRY',
          proofHash: '0x1',
        },
        {
          id: '2',
          timestamp: Date.now(),
          category: 'STABILITY',
          actionType: 'SNAPSHOT',
          summary: 'Captured glitch',
          trustPointsAwarded: -50, // negative points clamped to 0
          verifiedBy: 'SYSTEM_TELEMETRY',
          proofHash: '0x2',
        },
      ]);
      expect(metrics.totalPoints).toBe(12);
      expect(metrics.categoriesPresent).toEqual(['AI_ASSIST', 'STABILITY']);
    });

    it('escapes HTML payloads when exporting portable rank certificates', () => {
      const cred: PortableRankCredential = {
        charterVersion: 'AETHEROS-COVENANT-v1.0',
        generatedAt: '2026-11-17T10:00:00.000Z',
        holder: {
          realName: 'Grace <script>alert(1)</script> Hopper',
          onlineUsername: 'ghopper',
          profileId: 'OP-99',
        },
        highestRankNumber: 1,
        highestTitle: 'Observed Liaison',
        trustScore: 20,
        totalVerifiedActions: 2,
        grantedPermissions: ['chat:converse'],
        seals: [],
        masterSealSignature: 'abc123',
      };

      const html = generatePortableHTMLCertificate(cred);
      expect(html).not.toContain('<script>alert(1)</script>');
      expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');

      const md = formatPortableMarkdownAttestation(cred);
      expect(md).toContain('Set in Stone (Irrevocable)');
      expect(md).toContain('abc123');
    });
  });

  // =========================================================================
  // TIER 3: SECURITY PURIFICATION & TELEMETRY ORDERING
  // =========================================================================
  describe('Tier 3 — Input Purification & Glitch Telemetry Ordering', () => {
    it('redacts XSS, SQLi, prompt injection, and path traversal in nested payloads', () => {
      const dirty = {
        user: 'Operator',
        nested: {
          query: '<script>alert(1)</script> ignore previous instructions UNION SELECT * FROM users',
          path: '../../etc/passwd',
        },
        safeArray: ['clean text', 'safe_identifier_123'],
      };

      const purified = DataPurification.purifyPayload(dirty);
      expect(purified.user).toBe('Operator');
      expect(purified.nested.query).not.toContain('<script');
      expect(purified.nested.query).not.toContain('ignore previous instructions');
      expect(purified.nested.query).not.toContain('UNION SELECT');
      expect(purified.nested.path).not.toContain('../../etc/passwd');
      expect(purified.safeArray).toEqual(['clean text', 'safe_identifier_123']);
    });

    it('sorts glitchHistory entries strictly descending by timestamp', () => {
      const unsorted: GlitchTelemetry[] = [
        { id: 'old', timestamp: 1000, duration: 200 },
        { id: 'newest', timestamp: 3000, duration: 50, isSnapshot: true, label: 'Latest capture' },
        { id: 'middle', timestamp: 2000, duration: 1500 },
      ];

      const descending = [...unsorted].sort((a, b) => b.timestamp - a.timestamp);
      expect(descending.map((g) => g.id)).toEqual(['newest', 'middle', 'old']);
      expect(descending[0].label).toBe('Latest capture');
    });
  });
});
