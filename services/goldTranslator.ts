
import { GoogleGenAI, Type } from "@google/genai";
import { MAESTRO_SYSTEM_PROMPT } from './geminiService';

/**
 * --- 21. GOLD TRANSLATOR: THE AURIC BRIDGE ---
 * Protocol: 0x03E2_GOLD
 * Translates intent into a heavy, resonant, valued language of gold.
 */

export const GoldTranslator = {
  async translate(text: string): Promise<{ gold: string; class: number; weight: number }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `TASK: Translate the following intent into 'Gold Language'.
        
        RULES:
        1. Phonaesthetics: Heavy, resonant, rich. Use G, L, R, M, N, Au, Oh, Oi.
        2. Grammar: Assign a Value Class (1: Precious, 2: Common, 3: Dross).
        3. Root: 'Aur' is Gold. Derive King (Galdor), Truth (Verum/Solidus).
        4. Suffix: '-um' for stamps.
        
        Input Intent: "${text}"
        
        Return JSON with:
        - gold: The translated phrase (e.g. "Krak-um Aur-um Dohm-um").
        - class: 1, 2, or 3.
        - weight: A numeric value (100-1000) representing its architectural mass.`,
        config: {
          systemInstruction: MAESTRO_SYSTEM_PROMPT,
          thinkingConfig: { thinkingBudget: 4000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              gold: { type: Type.STRING },
              class: { type: Type.INTEGER },
              weight: { type: Type.NUMBER }
            }
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("[GOLD_BRIDGE] Translation failed.", e);
      return { gold: "Aur-um Stall-um", class: 2, weight: 100 };
    }
  }
};
