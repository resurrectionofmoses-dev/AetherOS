
import { v4 as uuidv4 } from 'uuid';
import type { Checkpoint, ScoredItem } from '../types';

/**
 * VAULT OF PROVENANCE:
 * This module ensures every summary or compressed 'Paper' has a unique 
 * cryptographic identity and an unbreakable lineage back to raw intent.
 */
export class CheckpointStore {
  private store: Record<string, Checkpoint> = {};

  constructor() {
    this.store = {};
  }

  /**
   * Simple deterministic hash for forensic fingerprinting.
   * Matches the Python logic of 'Original Hash'.
   */
  private generateOriginalHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase();
  }

  /**
   * Creates a 'Block' in the vault, linking logic shards back to origins.
   */
  public create(item: ScoredItem | { id: string, raw_text: string }, summaryText: string, level: number, provenance: string): Checkpoint {
    const cid = uuidv4();
    const itemId = item.id || 'genesis_or_orphan';

    const checkpoint: Checkpoint = {
      id: cid,
      parent_id: itemId,
      summary: summaryText,
      level: level,
      provenance: provenance,
      original_hash: this.generateOriginalHash(item.raw_text),
      timestamp: Date.now() / 1000
    };

    this.store[cid] = checkpoint;
    return checkpoint;
  }

  /**
   * Retrieves an Inherited thought by its unique CID.
   */
  public retrieve(cid: string): Checkpoint | null {
    return this.store[cid] || null;
  }

  /**
   * Returns all checkpoints currently held in the Vault.
   */
  public getAll(): Checkpoint[] {
    return Object.values(this.store).sort((a, b) => b.timestamp - a.timestamp);
  }
}

// Singleton Vault instance
export const provenanceVault = new CheckpointStore();
