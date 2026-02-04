
import { GoogleGenAI, Type } from "@google/genai";
import { MAESTRO_SYSTEM_PROMPT } from './geminiService';
import type { DiagnosticTroubleCode } from '../types';

/**
 * --- 27. SYSTEM HEALER: THE RESTORATION BRIDGE ---
 * Protocol: 0x03E2_HEAL
 * Synthesizes fractures into a Healed Hierarchy.
 */

export interface HealingManifest {
  healedShards: string[];
  merkleProof: string;
  maintenanceSchedule: {
    daily: string;
    monthly: string;
  };
  signature: string;
}

export const SystemHealer = {
  async heal(fractures: DiagnosticTroubleCode[]): Promise<HealingManifest> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `TASK: Initiate /HEAL Protocol (0x03E2).
        FRACTURES DETECTED: ${JSON.stringify(fractures)}
        
        REQUIREMENTS:
        1. Identify the 'Merkle Root' of the failure.
        2. Synthesize a 'Healed Shard' for each fracture.
        3. Generate a Maintenance Schedule (Daily/Monthly) to prevent logic bleed.
        4. Return a unique cryptographic signature.
        
        Return JSON.`,
        config: {
          systemInstruction: MAESTRO_SYSTEM_PROMPT,
          thinkingConfig: { thinkingBudget: 4000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healedShards: { type: Type.ARRAY, items: { type: Type.STRING } },
              merkleProof: { type: Type.STRING },
              maintenanceSchedule: {
                type: Type.OBJECT,
                properties: {
                  daily: { type: Type.STRING },
                  monthly: { type: Type.STRING }
                }
              },
              signature: { type: Type.STRING }
            },
            required: ["healedShards", "merkleProof", "maintenanceSchedule", "signature"]
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("[HEAL_STALL] Restoration bridge failed.", e);
      return {
        healedShards: ["Emergency Bypass Shard"],
        merkleProof: "ROOT_RECOVERY_0x000",
        maintenanceSchedule: { daily: "Re-align blue rag.", monthly: "Inspect Tommy Hilfiger buffer." },
        signature: "ERR_HEAL_STALL"
      };
    }
  }
};
