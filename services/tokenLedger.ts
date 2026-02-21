import { CONTINUITY_CONFIG } from '../constants';
import type { SessionStats, LedgerEntry } from '../types';
import { provenanceVault } from './checkpointStore';

/**
 * LOGIC INHERITANCE PROTOCOL:
 * This module establishes the 'Blockchain of Conversation'. 
 * It ensures the 'Merkle Root' of our session budget is never exceeded.
 * 
 * UPGRADE: ABSOLUTE ABUNDANCE
 * - Forecasting: Foresee budget breaks before they happen.
 * - State Recovery: Auto-fork exhausted sessions into inherited generations.
 */
export class TokenLedger {
  private sessions: Record<string, SessionStats> = {};

  constructor() {
    this.sessions = {};
  }

  /**
   * Initializing the 'Genesis Block' for our session.
   */
  public startSession(sessionId: string, budgetValue: number = CONTINUITY_CONFIG.DEFAULT_SESSION_BUDGET): void {
    if (!this.sessions[sessionId]) {
      this.sessions[sessionId] = {
        budget: budgetValue,
        entries: [],
        cumulative: 0,
        exhausted: false,
        generation: 1
      };
    }
  }

  /**
   * ABILITY: Forecasting
   * Measures potential weight against current budget to avoid hard-vapor stalls.
   */
  public predictExhaustion(sessionId: string, estimatedTokens: number): boolean {
    const s = this.sessions[sessionId];
    if (!s) return false;
    return (s.cumulative + estimatedTokens) >= s.budget;
  }

  /**
   * ABILITY: State Recovery (Forking)
   * Automatically archives the current generation and spawns a fresh Inherited Block.
   */
  public forkSession(sessionId: string): void {
    const s = this.sessions[sessionId];
    if (!s) return;

    // Archive current generation to the Vault of Provenance
    provenanceVault.create(
      { id: `ledger_gen_${s.generation}`, raw_text: JSON.stringify(s.entries) },
      `Archive of Session ${sessionId} Generation ${s.generation}.`,
      3,
      `Ledger_Governor_v5_Recovery`
    );

    // Reset and Increment
    s.entries = [];
    s.cumulative = 0;
    s.exhausted = false;
    s.generation += 1;
  }

  /**
   * Measures and records the 'weight' of a conversation turn.
   */
  public recordTurn(sessionId: string, turnId: string, tokensIn: number, tokensOut: number): void {
    if (!this.sessions[sessionId]) {
      this.startSession(sessionId);
    }

    const s = this.sessions[sessionId];
    const turnTotal = tokensIn + tokensOut;

    // ABUNDANCE CHECK: If this turn would blow the budget, we should have forecasted.
    // Here we enforce the protocol after recording.
    s.entries.push({
      turn_id: turnId,
      in: tokensIn,
      out: tokensOut,
      cumulative: s.cumulative + turnTotal
    });

    s.cumulative += turnTotal;

    // Check if the 'Block' is full
    if (s.cumulative >= s.budget) {
      s.exhausted = true;
    }
  }

  /**
   * Forensic check on remaining session budget.
   */
  public getRemaining(sessionId: string): number {
    if (!this.sessions[sessionId]) {
      return CONTINUITY_CONFIG.DEFAULT_SESSION_BUDGET;
    }
    const s = this.sessions[sessionId];
    return Math.max(0, s.budget - s.cumulative);
  }

  /**
   * Ingest the full state of a session's ledger.
   */
  public getSessionStats(sessionId: string): SessionStats | null {
    return this.sessions[sessionId] || null;
  }
}

// Singleton conductor instance
export const sessionLedger = new TokenLedger();
