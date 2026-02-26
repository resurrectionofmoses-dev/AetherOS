
import { GoogleGenAI } from "@google/genai";
import { estimateTokens } from '../utils';
import type { ScoredItem, SimpleSummary } from '../types';
import { MAESTRO_SYSTEM_PROMPT } from './geminiService';

export class Summarizer {
  constructor() {
  }

  /**
   * Converts thought to vector. 
   */
  public async embed(text: string): Promise<number[]> {
    // Create new GoogleGenAI instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: [{ parts: [{ text: text }] }],
      });
      return Array.from(response.embeddings[0].values);
    } catch (e) {
      console.error("[AetherOS] Embedding conduction failed:", e);
      return new Array(768).fill(0); 
    }
  }

  public compressLevel1(text: string): string {
    if (!text) return "";
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

  public async compressLevel2(textInput: string): Promise<string> {
    // Create new GoogleGenAI instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: `Summarize into 4 concise lines preserving intent: ${textInput}` }] },
        config: {
          systemInstruction: MAESTRO_SYSTEM_PROMPT,
          maxOutputTokens: 120,
          thinkingConfig: { thinkingBudget: 60 }
        }
      });
      return response.text?.trim() || "";
    } catch (e) {
      return this.compressLevel1(textInput).slice(0, 500) + "... [STALLED]";
    }
  }

  public async compressLevel3(textInput: string): Promise<string> {
    // Create new GoogleGenAI instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: `Distill into 1-2 lines capturing core intent and key facts: ${textInput}` }] },
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

  public chooseLevel(availableTokens: number, originalTokens: number): number {
    if (availableTokens >= originalTokens) return 0;
    if (availableTokens >= originalTokens * 0.6) return 1;
    if (availableTokens >= originalTokens * 0.3) return 2;
    return 3;
  }

  public async compress(item: ScoredItem, targetLevel: number): Promise<SimpleSummary> {
    const original = item.raw_text;
    if (targetLevel === 0) {
      return { text: original, tokens: item.tokens, level: 0 };
    }

    let finalStr = "";
    if (targetLevel === 1) {
      finalStr = this.compressLevel1(original);
    } else if (targetLevel === 2) {
      finalStr = await this.compressLevel2(original);
    } else {
      finalStr = await this.compressLevel3(original);
    }

    return { text: finalStr, tokens: estimateTokens(finalStr), level: targetLevel };
  }
}
