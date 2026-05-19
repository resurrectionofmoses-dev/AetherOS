
import { MAESTRO_SYSTEM_PROMPT, callAIProxy } from './geminiService';
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
    try {
      const contents = [{
        role: 'user',
        parts: [{
          text: `TASK: Initiate /HEAL Protocol (0x03E2).
          FRACTURES DETECTED: ${JSON.stringify(fractures)}
          
          REQUIREMENTS:
          1. Identify the 'Merkle Root' of the failure.
          2. Synthesize a 'Healed Shard' for each fracture.
          3. Generate a Maintenance Schedule (Daily/Monthly) to prevent logic bleed.
          4. Return a unique cryptographic signature.
          
          Return JSON.`
        }]
      }];

      const response = await callAIProxy(contents, 'gemini-1.5-flash', MAESTRO_SYSTEM_PROMPT);
      
      const jsonMatch = response.text.match(/\{.*\}/s);
      if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
      }
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
