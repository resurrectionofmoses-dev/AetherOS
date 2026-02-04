
import { CONTINUITY_CONFIG } from '../constants';
import { cosineSimilarity } from '../utils';
import type { ScoredItem } from '../types';

export class PriorityScorer {
  private weights: { intent: number; recency: number; dependency: number; user: number };

  constructor(weights?: { intent: number; recency: number; dependency: number; user: number }) {
    // Default weights: intent_match (50%), recency (20%), dependency (20%), user_flag (10%)
    this.weights = weights || { intent: 0.5, recency: 0.2, dependency: 0.2, user: 0.1 };
  }

  private recencyScore(timestamp: number): number {
    const now = Date.now() / 1000;
    const age = Math.max(1, now - timestamp);
    return 1.0 / (1.0 + Math.log(age + 1));
  }

  private dependencyScore(item: ScoredItem): number {
    return Math.min(1.0, (item.dependency_count || 0) / 5.0);
  }

  private intentMatchScore(itemEmbedding: number[], currentEmbedding: number[]): number {
    const cos = cosineSimilarity(itemEmbedding, currentEmbedding);
    if (cos < CONTINUITY_CONFIG.COSINE_THRESHOLD) {
      return 0.0;
    }
    return Math.max(0.0, (cos + 1) / 2);
  }

  public score(item: ScoredItem, currentEmbedding: number[]): number {
    const intent = this.intentMatchScore(item.intent_vector, currentEmbedding);
    const recency = this.recencyScore(item.timestamp);
    const dependency = this.dependencyScore(item);
    const userFlag = item.user_flag ? 1.0 : 0.0;

    const s = (
      this.weights.intent * intent +
      this.weights.recency * recency +
      this.weights.dependency * dependency +
      this.weights.user * userFlag
    );

    return Math.min(1.0, Math.max(0.0, s));
  }
}
