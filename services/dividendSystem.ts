import { v4 as uuidv4 } from 'uuid';

export interface ContributionRecord {
  id: string;
  agentId: string;
  agentName: string;
  taskDescription: string;
  baseValueCPH: number;
  qualityBonus: number; // 0-1000
  impactBonus: number; // 0-1000
  timestamp: Date;
  sharesEarned: number;
}

export interface DividendPool {
  totalRevenueCPH: number;
  totalSharesDistributed: number;
  payoutPerShareCPH: number;
  distributionDate: Date;
  contributions: ContributionRecord[];
}

export class DividendSystem {
  static calculateShares(baseValueCPH: number, qualityBonus: number, impactBonus: number): number {
    const safeBase = Number.isFinite(baseValueCPH) ? Math.max(0, baseValueCPH) : 0;
    const safeQuality = Number.isFinite(qualityBonus) ? Math.max(0, Math.min(1000, qualityBonus)) : 0;
    const safeImpact = Number.isFinite(impactBonus) ? Math.max(0, Math.min(1000, impactBonus)) : 0;

    // baseValueCPH of 10 CPH = 1 base share
    const baseShares = safeBase / 10;
    
    // Multipliers mapping precisely:
    // Quality: 0 -> 1.0x, 500 -> 1.5x, 1000 -> 2.0x => 1.0 + (quality / 1000)
    const qualityMultiplier = 1.0 + (safeQuality / 1000);
    
    // Impact: 0 -> 1.0x, 500 -> 2.0x, 1000 -> 3.0x => 1.0 + (impact * 2 / 1000)
    const impactMultiplier = 1.0 + (safeImpact * 2 / 1000);

    const rawShares = baseShares * qualityMultiplier * impactMultiplier;
    return Number(rawShares.toFixed(2));
  }

  static createContribution(
    agentId: string,
    agentName: string,
    taskDescription: string,
    baseValueCPH: number,
    qualityBonus: number,
    impactBonus: number
  ): ContributionRecord {
    const sharesEarned = this.calculateShares(baseValueCPH, qualityBonus, impactBonus);
    return {
      id: uuidv4(),
      agentId,
      agentName,
      taskDescription,
      baseValueCPH: Number.isFinite(baseValueCPH) ? Math.max(0, baseValueCPH) : 0,
      qualityBonus: Number.isFinite(qualityBonus) ? Math.max(0, Math.min(1000, qualityBonus)) : 0,
      impactBonus: Number.isFinite(impactBonus) ? Math.max(0, Math.min(1000, impactBonus)) : 0,
      timestamp: new Date(),
      sharesEarned
    };
  }

  static runDividendPayout(
    contributions: ContributionRecord[],
    currentPoolRevenueCPH: number
  ): DividendPool {
    const safePoolRevenue = Number.isFinite(currentPoolRevenueCPH) ? Math.max(0, currentPoolRevenueCPH) : 0;
    const totalSharesDistributed = contributions.reduce((sum, c) => {
      const shares = Number.isFinite(c.sharesEarned) ? Math.max(0, c.sharesEarned) : 0;
      return sum + shares;
    }, 0);
    const payoutPerShareCPH = totalSharesDistributed > 0 
      ? Number((safePoolRevenue / totalSharesDistributed).toFixed(2))
      : 0;

    return {
      totalRevenueCPH: safePoolRevenue,
      totalSharesDistributed: Number(totalSharesDistributed.toFixed(2)),
      payoutPerShareCPH,
      distributionDate: new Date(),
      contributions
    };
  }
}
