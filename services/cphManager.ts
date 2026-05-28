import { HireableAgent } from '../agentTypes';

export interface CPHBudget {
  totalCPH: number;
  allocatedCPH: number;
  availableCPH: number;
  actualUsageCPH: number;
  utilizationRate: number;
  isOverCapacity: boolean;
  warningThreshold: number;
}

export interface PricingTier {
  tier: 'off_peak' | 'normal' | 'peak';
  multiplier: number;
  label: string;
  range: string;
}

export class CPHManager {
  static TOTAL_CAPACITY = 1000;

  static calculateEfficiency(specialtyLevel: number): number {
    const efficiency = 1.6 - (specialtyLevel * 0.011);
    return Math.max(0.6, Math.min(1.5, Number(efficiency.toFixed(2))));
  }

  static getPricingTier(date: Date = new Date()): PricingTier {
    const hour = date.getHours();
    if (hour >= 22 || hour < 6) {
      return {
        tier: 'off_peak',
        multiplier: 0.5,
        label: 'Off-Peak (50% cost)',
        range: '10 PM - 6 AM'
      };
    } else if ((hour >= 6 && hour < 9) || (hour >= 17 && hour < 22)) {
      return {
        tier: 'normal',
        multiplier: 0.75,
        label: 'Normal Hours (75% cost)',
        range: '6 AM - 9 AM, 5 PM - 10 PM'
      };
    } else {
      return {
        tier: 'peak',
        multiplier: 1.0,
        label: 'Peak Hours (100% cost)',
        range: '9 AM - 5 PM'
      };
    }
  }

  static calculateTaskCPH(baseCPH: number, agent: any, isPriority: boolean = false): number {
    const efficiency = typeof agent === 'number' 
      ? agent 
      : (agent?.efficiencyRating ?? this.calculateEfficiency(agent?.skills?.specialtyLevel ?? 50));
    const { multiplier } = this.getPricingTier();
    let cost = baseCPH * efficiency * multiplier;
    if (isPriority) {
      cost *= 1.5; // 50% priority markup
    }
    return Number(cost.toFixed(1));
  }

  static calculateBudget(teamAgents: HireableAgent[], totalCapacity: number = this.TOTAL_CAPACITY, currentUsage: number = 0): CPHBudget {
    const allocatedCPH = teamAgents
      .filter(a => a.status === 'working' || a.status === 'resting')
      .reduce((sum, a) => sum + (a.currentSalary || 0), 0);
    
    // Idle agents (on standby / resting) consume 20% of their salary, active ones (working) consume full rate.
    // Wait, the page says "Idle costs: Agents on standby consume 20% CPH", let's factor that into the budget / current usage when computed dynamically if desired!
    // Or we can keep it simple: allocated is the sum of hired salary.
    const availableCPH = Math.max(0, totalCapacity - allocatedCPH);
    
    // Usage computation based on active/idle agents if currentUsage is not set
    let computedUsage = currentUsage;
    if (currentUsage === 0) {
      computedUsage = teamAgents.reduce((sum, a) => {
        if (a.status === 'working') {
          return sum + a.currentSalary;
        } else if (a.status === 'resting' || a.status === 'available') {
          return sum + Math.round(a.currentSalary * 0.2); // 20% standby cost
        }
        return sum;
      }, 0);
    }

    const utilizationRate = totalCapacity > 0 ? Number((computedUsage / totalCapacity * 100).toFixed(1)) : 0;
    const isOverCapacity = computedUsage > totalCapacity;
    const warningThreshold = Math.floor(totalCapacity * 0.8);

    return {
      totalCPH: totalCapacity,
      allocatedCPH,
      availableCPH,
      actualUsageCPH: computedUsage,
      utilizationRate,
      isOverCapacity,
      warningThreshold
    };
  }

  static canAfford(budget: CPHBudget, cost: number): { canAfford: boolean; reason?: string } {
    if (budget.availableCPH >= cost) {
      return { canAfford: true };
    }
    return {
      canAfford: false,
      reason: `Need ${cost} CPH, only ${budget.availableCPH} CPH available`
    };
  }

  static suggestOptimizations(budget: CPHBudget): string[] {
    const suggestions: string[] = [];
    if (budget.utilizationRate > 90) {
      suggestions.push("⚠️ CPH utilization critical (>90%). Consider upgrading.");
    }
    suggestions.push("Schedule heavy tasks during off-peak hours for 50% savings.");
    const currentHour = new Date().getHours();
    if (currentHour < 22 && currentHour >= 9) {
      suggestions.push("Consider waiting until 10:00 PM for 50% CPH cost.");
    }
    return suggestions;
  }
}

export class CPHDisplay {
  static formatCPH(amount: number): string {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K CPH`;
    }
    return `${amount} CPH`;
  }

  static formatEfficiency(rate: number): string {
    const pct = Math.round(rate * 100);
    if (rate <= 0.85) {
      return `${pct}% ⚡ (Efficient)`;
    } else if (rate > 1.1) {
      return `${pct}% ⚠️ (Inefficient)`;
    }
    return `${pct}% (Baseline)`;
  }

  static getUtilizationColor(rate: number): string {
    if (rate >= 90) return 'text-red-500';
    if (rate >= 75) return 'text-amber-500';
    return 'text-emerald-500';
  }

  static getUtilizationLabel(rate: number): string {
    if (rate >= 90) return 'Critical';
    if (rate >= 75) return 'Warning';
    return 'Healthy';
  }
}
