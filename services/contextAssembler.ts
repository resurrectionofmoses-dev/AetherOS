import { CONTINUITY_CONFIG } from '../constants';
import { cosineSimilarity } from '../utils';
import type { ScoredItem } from '../types';
import { Summarizer } from './summarizer';
import { PriorityScorer } from './priorityScorer';
import { TokenLedger } from './tokenLedger';
import { CheckpointStore } from './checkpointStore';
import { candidateStore } from './candidateStore';

export interface AssemblyResult {
  prompt: string;
  tokensUsed: number;
  dissonanceDetected: boolean;
  report: {
    id: string;
    action: 'FULL' | 'COMPRESSED' | 'VAULTED' | 'FROZEN';
    level: number;
    similarity: number;
  }[];
}

/**
 * CONTEXT ASSEMBLER:
 * The 'Block Builder' of our conversation. 
 * Prevents resource conflicts by balancing resolution vs budget.
 */
export class ContextAssembler {
  private summarizer: Summarizer;
  private scorer: PriorityScorer;

  constructor() {
    this.summarizer = new Summarizer();
    this.scorer = new PriorityScorer();
  }

  public async assemblePrompt(
    sessionId: string,
    currentText: string,
    currentTokens: number,
    ledger: TokenLedger,
    checkpointStore: CheckpointStore
  ): Promise<AssemblyResult> {
    const remaining = ledger.getRemaining(sessionId) - CONTINUITY_CONFIG.RESERVED_RESPONSE_TOKENS - currentTokens;
    const candidates = candidateStore.retrieveCandidates(sessionId);
    const currentEmb = await this.summarizer.embed(currentText);

    const scored = candidates.map(item => ({
      item: item,
      score: this.scorer.score(item, currentEmb)
    })).sort((a, b) => b.score - a.score);

    const maxScore = scored.length > 0 ? Math.max(...scored.map(s => s.score)) : 1.0;
    const dissonanceDetected = scored.length > 0 && maxScore < CONTINUITY_CONFIG.DISSONANCE_THRESHOLD;

    const assembly: string[] = [];
    const report: AssemblyResult['report'] = [];
    let tokensUsed = 0;

    for (const scoredItem of scored) {
      const item = scoredItem.item;
      const score = scoredItem.score;
      const cos = cosineSimilarity(item.intent_vector, currentEmb);
      const spaceBudget = remaining * CONTINUITY_CONFIG.ASSEMBLY_FACTOR;

      if (score >= CONTINUITY_CONFIG.CORE_TRUTH_THRESHOLD) {
        assembly.push(item.raw_text);
        tokensUsed += item.tokens;
        report.push({ id: item.id, action: 'FROZEN', level: 0, similarity: cos });
        continue;
      }

      const isBreaching = ledger.predictExhaustion(sessionId, tokensUsed + item.tokens + currentTokens);

      if (cos >= CONTINUITY_CONFIG.COSINE_THRESHOLD && !isBreaching && tokensUsed + item.tokens <= spaceBudget) {
        assembly.push(item.raw_text);
        tokensUsed += item.tokens;
        report.push({ id: item.id, action: 'FULL', level: 0, similarity: cos });
        continue;
      }

      const available = remaining - tokensUsed;
      const level = isBreaching ? 3 : this.summarizer.chooseLevel(available, item.tokens);
      
      if (available > 0) {
        const summary = await this.summarizer.compress(item, level);
        
        if (level > 0) {
          const sumEmb = await this.summarizer.embed(summary.text);
          const fidelity = cosineSimilarity(item.intent_vector, sumEmb);

          if (fidelity < CONTINUITY_CONFIG.COSINE_THRESHOLD && !isBreaching) {
            const cp = checkpointStore.create(item, summary.text, level, "low_fidelity_drift");
            assembly.push(`[CHECKPOINT_REF:0x${cp.id.slice(0, 8).toUpperCase()}]`);
            report.push({ id: item.id, action: 'VAULTED', level: level, similarity: fidelity });
          } else {
            assembly.push(summary.text);
            tokensUsed += summary.tokens;
            report.push({ id: item.id, action: 'COMPRESSED', level: level, similarity: fidelity });
          }
        } else {
          assembly.push(summary.text);
          tokensUsed += summary.tokens;
          report.push({ id: item.id, action: 'FULL', level: 0, similarity: cos });
        }
      } else {
        const cp = checkpointStore.create(item, "", 3, "no_space_budget");
        assembly.push(`[CHECKPOINT_REF:0x${cp.id.slice(0, 8).toUpperCase()}]`);
        report.push({ id: item.id, action: 'VAULTED', level: 3, similarity: cos });
      }
    }

    assembly.push(currentText);
    const prompt = assembly.join("\n\n");

    return {
      prompt: prompt,
      tokensUsed: tokensUsed + currentTokens,
      dissonanceDetected: dissonanceDetected,
      report: report
    };
  }
}

export const contextAssembler = new ContextAssembler();
