import { v4 as uuidv4 } from 'uuid';
import type { PredictiveAlert, SystemStatus } from '../types';

/**
 * PRE-COGNITIVE ENGINE: THE FORECAST
 * Protocol: 0x03E2_FUTURE
 * Analyzes entropy and system load to predict failures before they manifest.
 */
export const PredictionEngine = {
  
  /**
   * Scans current system telemetry for "Heuristic Drift".
   * If entropy exceeds threshold, returns a PredictiveAlert.
   */
  scan(systemStatus: SystemStatus, globalAdrenaline: number): PredictiveAlert | null {
    // 1. Calculate Entropy Base
    const baseEntropy = Math.random() * 100;
    
    // 2. Weigh against System Status
    const errorCount = Object.values(systemStatus).filter(s => s === 'Error').length;
    const warningCount = Object.values(systemStatus).filter(s => s === 'Warning').length;
    
    // 3. Adrenaline Factor (Too low = stagnation, Too high = burnout)
    const adrenalineRisk = globalAdrenaline > 90 ? 20 : globalAdrenaline < 20 ? 15 : 0;
    
    const probability = Math.min(99.9, baseEntropy + (errorCount * 15) + (warningCount * 5) + adrenalineRisk);

    // Threshold for triggering a banner (tuned for demonstration frequency)
    // In a real app, this might be 90% or higher.
    const TRIGGER_THRESHOLD = 92;

    if (probability > TRIGGER_THRESHOLD) {
      return this.generateAlert(probability);
    }

    return null;
  },

  generateAlert(probability: number): PredictiveAlert {
    const scenarios = [
      {
        title: "FALL OFF REQUINDOR IMMINENT",
        pattern: "Semantic Drift > 0.42 detected in Logic Core.",
        fix: "REALIGN MERKLE ROOT",
        reward: 50
      },
      {
        title: "KINETIC STALL FORESEEN",
        pattern: "Input buffer saturation approaching 98%.",
        fix: "FLUSH KINETIC BUFFER",
        reward: 35
      },
      {
        title: "BUDGET FRACTURE DETECTED",
        pattern: "Token Ledger forecasting exhaustion in < 3 turns.",
        fix: "BRIDGE TO GEN-2",
        reward: 75
      },
      {
        title: "ENTROPY CASCADE",
        pattern: "Unchecked chaos signatures in peripheral nodes.",
        fix: "ENFORCE 0x03E2 ORDER",
        reward: 60
      }
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    return {
      id: uuidv4(),
      title: scenario.title,
      probability: parseFloat(probability.toFixed(1)),
      timeToImpact: Math.floor(Math.random() * 30) + 10, // Seconds
      detectedPattern: scenario.pattern,
      suggestedFix: scenario.fix,
      reward: scenario.reward
    };
  }
};