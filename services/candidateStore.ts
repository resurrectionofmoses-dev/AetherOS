
import type { ScoredItem } from '../types';

/**
 * CANDIDATE STORE:
 * This is the persistent repository of 'Logic Shards'.
 * It provides the candidates for the Context Assembler's forensic sifting.
 */
export class CandidateStore {
  private shards: Record<string, ScoredItem[]> = {};

  constructor() {
    this.shards = {};
  }

  /**
   * Adds a new logic shard to the session's candidate pool.
   */
  public addShard(sessionId: string, item: ScoredItem): void {
    if (!this.shards[sessionId]) {
      this.shards[sessionId] = [];
    }
    this.shards[sessionId].push(item);
  }

  /**
   * Retrieves all candidate shards for a specific session.
   */
  public retrieveCandidates(sessionId: string): ScoredItem[] {
    return this.shards[sessionId] || [];
  }

  /**
   * Clears shards for a session (Reset Origin).
   */
  public clearSession(sessionId: string): void {
    delete this.shards[sessionId];
  }
}

// Singleton storage instance
export const candidateStore = new CandidateStore();
