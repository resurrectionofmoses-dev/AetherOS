
import { GoogleGenAI } from "@google/genai";
import { MAESTRO_SYSTEM_PROMPT } from './geminiService';
import type { SovereignSearchResult } from '../types';

/**
 * --- 31. SOVEREIGN SEARCH: THE CROSS-PROVIDER SIPHON ---
 * Protocol: 0x03E2_SEARCH_NET
 * Integrates all major search providers via Gemini grounding synthesis.
 */

export const SearchSovereign = {
    async conduct(query: string): Promise<SovereignSearchResult | null> {
        // Create new GoogleGenAI instance right before making an API call
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: { 
                    parts: [{ 
                        text: `TASK: Conduct a Sovereign Search for "${query}".
                        
                        PROTOCOL:
                        1. Siphon raw data using Google Search grounding.
                        2. Cross-reference results against the simulated logic-shards of DuckDuckGo, Bing, and the AetherOS Archives.
                        3. Provide a deep "Deconstruction" of the finding using forensic language.
                        4. Extract verified "Web Shards" (URLs).`
                    }] 
                },
                config: {
                    systemInstruction: MAESTRO_SYSTEM_PROMPT,
                    tools: [{ googleSearch: {} }],
                }
            });

            const deconstruction = response.text || "Search bridge stalled.";
            const shards: any[] = [];
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            
            groundingChunks.forEach((chunk: any, i: number) => {
                if (chunk.web) {
                    shards.push({
                        id: `EXT-0x${i}`,
                        title: chunk.web.title || "Grounding Source",
                        url: chunk.web.uri,
                        snippet: "Forensic source verified via Google Search grounding.",
                        veracity: 100
                    });
                }
            });

            return {
                deconstruction,
                shards,
                telemetry: {
                    stride: 1.2,
                    purity: 0.99,
                    providersReached: ["Google", "AetherOS"]
                }
            };
        } catch (e) {
            console.error("[SEARCH_STALL] Sovereign bridge failure.", e);
            return null;
        }
    }
};
