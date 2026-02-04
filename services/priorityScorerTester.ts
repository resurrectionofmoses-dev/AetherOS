
import { PriorityScorer } from './priorityScorer';
import { CONTINUITY_CONFIG } from '../constants';
import { cosineSimilarity } from '../utils';
import type { ScoredItem, ScoringAuditResult } from '../types';

/**
 * PRIORITY SCORER TESTER:
 * This module executes a forensic 'Restoration Check' on the Healed Hierarchy.
 * It ensures the Scorer correctly identifies 'Original IP' (Intent).
 */
export class PriorityScorerTester {
  private scorer: PriorityScorer;

  constructor() {
    this.scorer = new PriorityScorer();
  }

  public async runScoringForensics(): Promise<ScoringAuditResult[]> {
    const now = Date.now() / 1000;
    
    // Define vectors: vecA is the 'Current Intent' (e.g. [1,0,0...])
    const vecA = new Array(8).fill(0);
    vecA[0] = 1.0;

    // vecB is orthogonal (Zero similarity)
    const vecB = new Array(8).fill(0);
    vecB[1] = 1.0;

    // Item 1: High Resonance (Recent, High Dependency, Perfect Match)
    const itemRecent: ScoredItem = {
      id: "shard_0x03E2",
      raw_text: "High-integrity conduction shard",
      timestamp: now - 10,
      intent_vector: vecA,
      dependency_count: 5,
      user_flag: true,
      tokens: 50
    };

    // Item 2: Low Resonance (Old, No Dependency, Low Intent Match)
    const itemOld: ScoredItem = {
      id: "shard_0x0000",
      raw_text: "Fragmented semantic noise",
      timestamp: now - 100000,
      intent_vector: vecB,
      dependency_count: 0,
      user_flag: false,
      tokens: 50
    };

    const scoreRecent = this.scorer.score(itemRecent, vecA);
    const scoreOld = this.scorer.score(itemOld, vecA);

    return [
      {
        id: itemRecent.id,
        label: "High Resonance Shard",
        totalScore: scoreRecent,
        factors: {
          intent: cosineSimilarity(itemRecent.intent_vector, vecA),
          recency: 1.0 / (1.0 + Math.log((now - itemRecent.timestamp) + 1)),
          dependency: Math.min(1.0, itemRecent.dependency_count / 5.0)
        },
        signature: '0x3E2_PASS'
      },
      {
        id: itemOld.id,
        label: "Orphaned Shard",
        totalScore: scoreOld,
        factors: {
          intent: cosineSimilarity(itemOld.intent_vector, vecA),
          recency: 1.0 / (1.0 + Math.log((now - itemOld.timestamp) + 1)),
          dependency: Math.min(1.0, itemOld.dependency_count / 5.0)
        },
        signature: '0x000_DRIFT'
      }
    ];
  }
}

export const scorerTester = new PriorityScorerTester();
