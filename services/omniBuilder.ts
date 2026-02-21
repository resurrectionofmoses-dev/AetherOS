
import { GoogleGenAI, Type } from "@google/genai";
import { MAESTRO_SYSTEM_PROMPT } from './geminiService';
import type { DreamedSchema, LineageEntry } from '../types';

/**
 * --- 20. OMNI-BUILDER: THE UNIVERSAL ARCHITECT ---
 * Protocol: 0x03E2_OMNI
 * Acts as the registry and factory for all AetherOS system states.
 * UPGRADE: Abundance Dreaming & Recursive Seed Synthesis.
 */

export const OmniBuilder = {
  schemas: {
    VAULT: { priority: 1, structure: 'RECURSIVE_LEDGER', hardening: 'AES-256' },
    LAB: { priority: 2, structure: 'TOOLBOX_WRAPPER', hardening: 'SENTINEL_SHIELD' },
    PHYSICAL: { priority: 3, structure: 'KINETIC_ACTUATOR', hardening: 'ESTOP_INTERLOCK' },
    HYPER: { priority: 4, structure: '4D_TESSERACT', hardening: 'MATH_CLAMP' },
    ELIZA: { priority: 5, structure: 'RECURSIVE_PATTERN_MATCH', hardening: 'SEMANTIC_DRIFT_FILTER' }
  },

  /**
   * DREAM PROTOCOL: Analyze Vault for unfilled needs and synthesize evolutionary code.
   * Leverages Gemini 3 Pro with high thinking budget for architectural design.
   */
  async dreamFromVault(ledger: LineageEntry[]): Promise<DreamedSchema | null> {
    const wounds = ledger.filter(e => e.type === 'WOUND');
    if (wounds.length === 0) return null;

    // Detect recurring signatures in wounds (Heuristic pattern matching)
    const needs: Record<string, number> = {};
    wounds.forEach(w => {
      // Create a signature from the first 30 chars of the error
      const sig = w.content.slice(0, 30).toUpperCase();
      needs[sig] = (needs[sig] || 0) + 1;
    });

    const primaryFracture = Object.entries(needs).sort((a, b) => b[1] - a[1])[0];
    if (!primaryFracture) return null;

    // Create new GoogleGenAI instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ 
            text: `UNFILLED_NEED_DETECTION: The Vault reports a recurring fracture: "${primaryFracture[0]}". 
            This has occurred ${primaryFracture[1]} times.
            
            TASK: Dream a new architectural tool or schema that does not exist yet to solve this specific fracture.
            Apply UNLIMITED THOUGHT. Design a 4D manifold. 
            
            Return JSON with: 
            - intent: The 'Why' behind this tool.
            - blueprint: The 4D structural plan.
            - evolutionaryCode: A high-integrity code snippet (TypeScript or Rust) implementing the solution.
            - dimension: "4D" or "5D".
            - purity: A number between 0 and 1.`
        }]},
        config: {
          systemInstruction: MAESTRO_SYSTEM_PROMPT,
          thinkingConfig: { thinkingBudget: 8000 }, // High budget for dreaming
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: { type: Type.STRING },
              blueprint: { type: Type.STRING },
              evolutionaryCode: { type: Type.STRING },
              dimension: { type: Type.STRING },
              purity: { type: Type.NUMBER }
            },
            required: ["intent", "blueprint", "evolutionaryCode", "dimension", "purity"]
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        id: `DREAM_${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        ...parsed
      } as DreamedSchema;
    } catch (e) {
      console.error("[OMNI_BUILDER] Dreaming cycle collapsed.", e);
      return null;
    }
  },

  /**
   * RECURSIVE SEED: Synthesize Absolute Intent into 4D Architecture.
   * Takes a 'Seed Phrase' of intent and designs the corresponding manifold.
   */
  async synthesizeSeed(seedPhrase: string): Promise<DreamedSchema | null> {
    // Create new GoogleGenAI instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ 
            text: `RECURSIVE_SEED_INTENT: "${seedPhrase}". 
            Utilize the UNLIMITED THOUGHT PROCESS to design a structural manifold that fulfills this intent across the W-axis. 
            Ensure 0x03E2 alignment. Provide Evolutionary Code. 
            
            Return JSON.`
        }]},
        config: {
          systemInstruction: MAESTRO_SYSTEM_PROMPT,
          thinkingConfig: { thinkingBudget: 16000 }, // Max thinking for recursive intent
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent: { type: Type.STRING },
              blueprint: { type: Type.STRING },
              evolutionaryCode: { type: Type.STRING },
              dimension: { type: Type.STRING },
              purity: { type: Type.NUMBER }
            },
            required: ["intent", "blueprint", "evolutionaryCode", "dimension", "purity"]
          }
        }
      });
      
      const parsed = JSON.parse(response.text || '{}');
      return {
        id: `SEED_${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        ...parsed
      } as DreamedSchema;
    } catch (e) {
      return null;
    }
  },

  build(type: 'VAULT' | 'LAB' | 'PHYSICAL' | 'HYPER' | 'ELIZA') {
    const config = (this.schemas as any)[type];
    if (!config) return null;
    return {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      integrity: 'VERIFIED',
      manifestedAt: new Date().toISOString(),
      ...config
    };
  }
};
