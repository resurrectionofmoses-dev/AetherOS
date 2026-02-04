
import { sessionLedger, TokenLedger } from './tokenLedger';
import { CONTINUITY_CONFIG } from '../constants';
import { estimateTokens } from '../utils';

export interface AuditResult {
  phase: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  message: string;
  signature: string;
}

/**
 * FORENSIC LEDGER TESTER:
 * This module executes the 'Restoration Check' on the conversation blockchain.
 * It ensures the 'Zero State' and 'Exhaustion Protocol' are fully manifest.
 */
export class TokenLedgerTester {
  private testLedger: TokenLedger;

  constructor() {
    this.testLedger = new TokenLedger();
  }

  public async runComprehensiveAudit(): Promise<AuditResult[]> {
    const results: AuditResult[] = [];

    // 1. Test Genesis Inheritance
    const genesisRem = this.testLedger.getRemaining("unstarted_session");
    const genesisPassed = genesisRem === CONTINUITY_CONFIG.DEFAULT_SESSION_BUDGET;
    results.push({
      phase: 'Genesis Inheritance',
      status: genesisPassed ? 'PASSED' : 'FAILED',
      message: genesisPassed 
        ? `Genesis budget inherited: ${genesisRem} BITS.` 
        : `Drift detected in Genesis state: ${genesisRem} vs ${CONTINUITY_CONFIG.DEFAULT_SESSION_BUDGET}`,
      signature: '0x0001_GEN'
    });

    // 2. Test Active Accounting
    this.testLedger.startSession("audit_session", 1000);
    this.testLedger.recordTurn("audit_session", "t1", 100, 200);
    this.testLedger.recordTurn("audit_session", "t2", 50, 50);
    
    const expectedRemaining = 1000 - (100 + 200 + 50 + 50);
    const actualRemaining = this.testLedger.getRemaining("audit_session");
    const accountingPassed = actualRemaining === expectedRemaining;
    
    results.push({
      phase: 'Active Accounting',
      status: accountingPassed ? 'PASSED' : 'FAILED',
      message: accountingPassed 
        ? `Accounting verified. Rem: ${actualRemaining} BITS.` 
        : `Siphoning error: Expected ${expectedRemaining}, got ${actualRemaining}`,
      signature: '0x03E2_ACC'
    });

    // 3. Test Abundance Forecasting
    // We foresee a 700 token burst will break the remaining 600 budget.
    const estimatedBurst = 700;
    const forecastTriggered = this.testLedger.predictExhaustion("audit_session", estimatedBurst);
    results.push({
      phase: 'Abundance Forecasting',
      status: forecastTriggered ? 'PASSED' : 'FAILED',
      message: forecastTriggered 
        ? `Budget break foreseen: Burst ${estimatedBurst} > Rem ${actualRemaining}.` 
        : `Forecasting stall: System failed to detect upcoming budget breach.`,
      signature: '0x0700_FORE'
    });

    // 4. Test State Recovery (Forking)
    this.testLedger.forkSession("audit_session");
    const statsAfterFork = this.testLedger.getSessionStats("audit_session");
    const forkPassed = statsAfterFork?.cumulative === 0 && statsAfterFork?.generation === 2;
    results.push({
      phase: 'State Recovery (Forking)',
      status: forkPassed ? 'PASSED' : 'FAILED',
      message: forkPassed 
        ? `Session forked into Generation 2. Stride reset to 0.` 
        : `Recovery failure: Session state persistent after fork command.`,
      signature: '0x0002_FORK'
    });

    return results;
  }
}

export const ledgerTester = new TokenLedgerTester();
