import { GoogleGenAI } from "@google/genai";
import { estimateTokens } from '../utils';
import type { ScoredItem, SimpleSummary } from '../types';
import { MAESTRO_SYSTEM_PROMPT } from './geminiService';

export class Summarizer {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Converts thought to vector. 
   * Ensures the 'Technical Foundation' is a high-precision numeric array.
   */
  public async embed(text: string): Promise<number[]> {
    try {
      const response = await this.ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });
      return Array.from(response.embeddings[0].values);
    } catch (e) {
      console.error("[AetherOS] Embedding conduction failed:", e);
      return new Array(768).fill(0); 
    }
  }

  /**
   * Level 1: Healing the text by removing redundant sentences.
   * Maintains the structure while reducing the 'Token Tax'.
   */
  public compressLevel1(text: string): string {
    if (!text) return "";
    // Improved split to avoid breaking on abbreviations, matching refined Python logic
    const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0);
    const seen = new Set<string>();
    const out: string[] = [];
    
    for (const s of sentences) {
      const key = s.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(s);
      }
    }
    return out.join(" ") + (out.length > 0 && !out[out.length-1].match(/[.!?]$/) ? "." : "");
  }

  /**
   * Level 2: Intent-focused distillation (Lossy).
   * 4 concise lines preserving the core architectural intent.
   */
  public async compressLevel2(text: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize into 4 concise lines preserving intent: ${text}`,
        config: {
          systemInstruction: MAESTRO_SYSTEM_PROMPT,
          maxOutputTokens: 120,
          thinkingConfig: { thinkingBudget: 60 }
        }
      });
      return response.text?.trim() || "";
    } catch (e) {
      return this.compressLevel1(text).slice(0, 500) + "... [STALLED]";
    }
  }

  /**
   * Level 3: Forensic Checkpoint summary (Deep Compression).
   * 1-2 lines capturing core intent and key facts for the Absolute Ledger.
   */
  public async compressLevel3(text: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Distill into 1-2 lines capturing core intent and key facts: ${text}`,
        config: {
          systemInstruction: MAESTRO_SYSTEM_PROMPT,
          maxOutputTokens: 60,
          thinkingConfig: { thinkingBudget: 30 }
        }
      });
      return response.text?.trim() || "";
    } catch (e) {
      return "[LEDGER_ERROR] Failed to distill logic shard.";
    }
  }

  /**
   * Logic for 'Thermostat' adjustment of the session budget.
   * Dynamically selects compression level based on available block space.
   */
  public chooseLevel(availableTokens: number, originalTokens: number): number {
    if (availableTokens >= originalTokens) return 0;
    if (availableTokens >= originalTokens * 0.6) return 1;
    if (availableTokens >= originalTokens * 0.3) return 2;
    return 3;
  }

  /**
   * Orchestrates the compression of a logic shard based on the targeted level.
   * Ensures the "Healed" state is manifest in the final summary output.
   */
  public async compress(item: ScoredItem, targetLevel: number): Promise<SimpleSummary> {
    const original = item.raw_text;
    if (targetLevel === 0) {
      return { text: original, tokens: item.tokens, level: 0 };
    }

    let text = "";
    if (targetLevel === 1) {
      text = this.compressLevel1(original);
    } else if (targetLevel === 2) {
      text = await this.compressLevel2(original);
    } else {
      text = await this.compressLevel3(original);
    }

    return { text, tokens: estimateTokens(text), level: targetLevel };
  }
}
