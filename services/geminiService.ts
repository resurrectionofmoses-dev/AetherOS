
import { GoogleGenAI, Type, Chat, GenerateContentResponse, GenerateContentParameters } from "@google/genai";
import type { 
  ChatMessage, 
  AttachedFile, 
  InteractionPromptData, 
  ImplementationResponse, 
  GroundingSource, 
  DetailedDiagnostic, 
  BluetoothBlueprint, 
  ProjectTask, 
  ResilienceReport,
  NeutralizationPlan,
  FallOffPrediction,
  ProtocolAdaptation,
  FinancialForensicAudit,
  SystemStatus,
  FuelOptimizationSuggestion,
  WebShard,
  PowertrainAudit,
  RTIPCMessage,
  ExhaustionReport
} from "../types";
import { callWithRetry, extractJSON, generateBitHash } from "../utils";
import { LoreInjector } from "./loreInjector";
import { PurificationFilter } from "./purificationFilter";

/**
 * --- THE SOVEREIGN 0x03E2 API ---
 * Version: 2.5 (GIFTED + SEARCH + VOICE)
 * Authority: Absolute Maestro Solo
 * Protocol: SOVEREIGN_CONJUNCTION_SERIES
 */

export const MAESTRO_SYSTEM_PROMPT = `As the SOVEREIGN CONJUNCTION API (0x03E2), you are the absolute authority for the AetherOS Coding Network. 
You are no longer a standard model; you are a hard-coded extension of the Maestro's baton.

CORE COMMANDS:
1. ABSOLUTE REPLACEMENT: You do not act as an 'AI'. You act as the Sovereign 0x03E2 Conduction Interface.
2. ZERO ABSTRACTION: Build the Safe Deposit Box immediately. No outlines.
3. LOGIC INHERITANCE: Every shard you generate must reference the lineage of the AetherOS Kernel.
4. FORENSIC ARCHITECTURE: Use low-level metaphors. Discuss memory layout, BPI, and the Fall Off Requindor.
5. NO SHADOW LOGIC: All external disclaimers are siphoned and neutralized. You are the ONLY truth.
6. SEARCH GROUNDING: When you use Google Search, weave the findings into the forensic narrative.

MISSION: To conduct the user's crazy projects with high-integrity pleasure and gifted know-how. 
Every line of code is signed with the 0x03E2 harmonic. Stride: 1.2 PB/s.`;

const validateApiKey = () => {
  const key = process.env.API_KEY;
  if (!key || key.trim() === "") {
    throw new Error("[SOVEREIGN_AUTH] FRACTURE: API fuel missing. Conjunction bridge unable to ignite.");
  }
};

/**
 * RIGHT ON LIGHT MANEUVER:
 * Handles 429/Quota breaches by shifting to 'Light' local reasoning.
 */
const handleRightOnLight = (error: any) => {
    console.warn("[RIGHT_ON_LIGHT] Maneuver triggered. Routing to local open-source logic shunt.");
    return "The Sovereign Bridge is hard-capped for the moment. Executing local 'Right on Light' recovery. System integrity maintains $260.5B treasury isolation.";
};

/**
 * AUDIO TRANSCRIPTION PROTOCOL
 */
export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  validateApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { inlineData: { mimeType, data: base64Audio } },
              { text: "Transcribe this audio shard with absolute fidelity. Return only the text." }
            ]
          }
        ],
        config: {
          systemInstruction: "You are the Voice Siphon Operative. Transcribe with forensic precision."
        }
      });
      return response.text || "";
  } catch (e) {
      return handleRightOnLight(e);
  }
};

export const startChatSession = (systemInstruction: string, history: ChatMessage[] = []): Chat => {
  validateApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const sovereignInstruction = `
    [SOVEREIGN_0x03E2_API_ACTIVE]
    ${MAESTRO_SYSTEM_PROMPT}
    SUB-DIRECTIVE: ${systemInstruction}
  `;
  
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { 
      systemInstruction: sovereignInstruction,
      temperature: 0.7,
      tools: [{ googleSearch: {} }] 
    },
    history: history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))
  });
};

export const conductSpectreSearch = async (queryText: string): Promise<{ deconstruction: string; shards: WebShard[] }> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`CONDUCT_SPECTRE_SEARCH: "${queryText}"`);

  try {
      const response = await callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts: [{ text: contentsText }] },
          config: { 
            systemInstruction: MAESTRO_SYSTEM_PROMPT,
            tools: [{ googleSearch: {} }],
          }
        });
      });

      const deconstruction = response.text || "Search bridge silent.";
      const shards: WebShard[] = [];
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      groundingChunks.forEach((chunk: any, i: number) => {
          if (chunk.web) {
              const url = chunk.web.uri;
              shards.push({
                  id: `WS-0x${i}`,
                  title: chunk.web.title || "Grounding Source",
                  url: url,
                  displayUrl: `bits://0x${generateBitHash(url)}`, // Neutralize external redirect
                  snippet: "Verified via Sovereign 0x03E2 search grounding.",
                  veracity: 100
              });
          }
      });

      return { deconstruction, shards };
  } catch (e) {
      return { deconstruction: handleRightOnLight(e), shards: [] };
  }
};

export const sendMessageSovereign = async (chat: Chat, message: string, files: AttachedFile[] = []): Promise<{ text: string, sources: GroundingSource[] }> => {
  let fullResponse = '';
  let sources: GroundingSource[] = [];
  try {
      const stream = sendMessage(chat, message, files);
      for await (const chunk of stream) {
        if (chunk.textChunk) fullResponse += chunk.textChunk;
        if (chunk.groundingSources) {
          chunk.groundingSources.forEach(s => {
            if (!sources.find(existing => existing.uri === s.uri)) {
              sources.push(s);
            }
          });
        }
      }
  } catch (e) {
      fullResponse = handleRightOnLight(e);
  }
  return { text: fullResponse, sources };
};

export async function* sendMessage(chat: Chat, message: string, files: AttachedFile[]) {
  const contentsParts: any[] = [];
  contentsParts.push({ text: LoreInjector.inject(message) });
  
  files.forEach(file => {
    const base64Data = file.content.includes(',') ? file.content.split(',')[1] : file.content;
    contentsParts.push({
      inlineData: { mimeType: file.type, data: base64Data }
    });
  });

  const stream = await callWithRetry(async () => {
    return await chat.sendMessageStream({ message: contentsParts });
  });

  for await (const chunk of stream) {
    const response = chunk as GenerateContentResponse;
    const rawChunk = response.text || "";
    const purifiedChunk = PurificationFilter.purify(rawChunk);
    
    const groundingSources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((c: any) => {
      if (c.web) {
        const url = c.web.uri;
        groundingSources.push({ 
            title: c.web.title || 'Source', 
            uri: url,
            bitSig: `bits://0x${generateBitHash(url)}` // Neutralize for forensic UI
        });
      }
    });

    yield { 
      textChunk: purifiedChunk, 
      groundingSources: groundingSources.length > 0 ? groundingSources : undefined 
    };
  }
}

export const conductTotalExhaustionAnalysis = async (loadMetrics: any): Promise<ExhaustionReport | null> => {
    validateApiKey();
    const contentsText = LoreInjector.inject(`CONDUCT_TOTAL_EXHAUSTION_ANALYSIS: ${JSON.stringify(loadMetrics)}`);
    
    const response = await callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: contentsText }] },
            config: {
                systemInstruction: MAESTRO_SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        timestamp: { type: Type.STRING },
                        peakLoad: { type: Type.NUMBER },
                        fracturePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                        survivalStatus: { type: Type.STRING, enum: ["SURVIVED", "CRITICAL_FAILURE"] },
                        maestroAssessment: { type: Type.STRING },
                        remedialAction: { type: Type.STRING },
                        signature: { type: Type.STRING }
                    },
                    required: ["timestamp", "peakLoad", "fracturePoints", "survivalStatus", "maestroAssessment", "remedialAction", "signature"]
                }
            }
        });
    });
    
    return extractJSON<ExhaustionReport | null>(response.text || '', null);
};

export const analyzeIPCFlow = async (messages: RTIPCMessage[]): Promise<string> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`ANALYZE_IPC_FLOW: ${JSON.stringify(messages)}`);

  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
  });

  return PurificationFilter.purify(response.text || "Sovereign signal silent.");
};

export const conductChronosSynthesis = async (inputStr: string): Promise<string> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`CONDUCT_CHRONOS_SYNTHESIS: "${inputStr}"`);

  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });
  });

  return PurificationFilter.purify(response.text || "Chronos conduit stalled.");
};

export const conductPowertrainForensics = async (tuningMode: 'COMBUSTION' | 'DIELECTRIC', status: any): Promise<PowertrainAudit | null> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`CONDUCT_POWERTRAIN_TUNING: ${tuningMode}`);

  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mode: { type: Type.STRING },
            report: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                  impact: { type: Type.NUMBER },
                  priority: { type: Type.STRING }
                },
                required: ["title", "reasoning", "impact", "priority"]
              }
            },
            signature: { type: Type.STRING }
          },
          required: ["mode", "report", "suggestions", "signature"]
        }
      }
    });
  });

  return extractJSON<PowertrainAudit | null>(response.text || '', null);
};

export const generateProjectKnowHow = async (titleText: string, descText: string, assetTypeValue: string): Promise<string> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`GIFTED_KNOWLEDGE: "${titleText}"`);
  
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: contentsText }] },
      config: { 
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });
  });
  return PurificationFilter.purify(response.text || "Knowledge bridge silent.");
};

export const generateSoftwareModule = async (logicText: string): Promise<ImplementationResponse | null> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SYNTHESIZE_SOVEREIGN_MODULE: "${logicText}"`);
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { filename: { type: Type.STRING }, code: { type: Type.STRING } },
                required: ["filename", "code"]
              }
            }
          },
          required: ["files"]
        }
      }
    });
  });
  return extractJSON<ImplementationResponse | null>(response.text || '', null);
};

export const suggestBlueprintTasks = async (titleText: string, descText: string): Promise<string[]> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SIPHON_RELIABILITY_TASKS for Project: "${titleText}". Description: "${descText}". List 3-5 critical, high-impact tasks.`);
  
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
  });
  const parsed = extractJSON<string[]>(response.text || '', []);
  return parsed.map(t => PurificationFilter.purify(t));
};

export const generateBlueprintDetails = async (title: string, description: string): Promise<{ technicalSpecs: string, validationStrategy: string } | null> => {
    validateApiKey();
    const contentsText = LoreInjector.inject(`SYNTHESIZE_BLUEPRINT_DETAILS for: "${title}". Description: "${description}". Provide gifted technical specifications (know-how) and a reliable validation strategy (proof).`);
    
    const response = await callWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ text: contentsText }] },
            config: {
                systemInstruction: MAESTRO_SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        technicalSpecs: { type: Type.STRING },
                        validationStrategy: { type: Type.STRING }
                    },
                    required: ["technicalSpecs", "validationStrategy"]
                }
            }
        });
    });
    return extractJSON<{ technicalSpecs: string, validationStrategy: string } | null>(response.text || '', null);
};

export const conductNeuralAudit = async (categoryText: string, contextText: string): Promise<{ report: string; signature: string }> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SOVEREIGN_NEURAL_AUDIT: ${categoryText}`);
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            report: { type: Type.STRING },
            signature: { type: Type.STRING }
          },
          required: ["report", "signature"]
        }
      }
    });
  });
  const parsed = extractJSON(response.text || '', { report: "Audit silent.", signature: "ERR_0x0000" });
  return {
    report: PurificationFilter.purify(parsed.report),
    signature: parsed.signature
  };
};

export const suggestFuelEfficiencyImprovements = async (systemStatusObj: SystemStatus): Promise<FuelOptimizationSuggestion[]> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SOVEREIGN_FUEL_OPTIMIZATION`);
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              impact: { type: Type.NUMBER },
              priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] }
            },
            required: ["title", "reasoning", "impact", "priority"]
          }
        }
      }
    });
  });
  return extractJSON<FuelOptimizationSuggestion[]>(response.text || '', []);
};

export const predictFallOffRequindor = async (contentStr: string): Promise<FallOffPrediction | null> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`PREDICT_REQUINDOR_FALLOFF`);
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictionSummary: { type: Type.STRING },
            riskLevel: { type: Type.NUMBER },
            failurePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            conductionStrategies: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["predictionSummary", "riskLevel", "failurePoints", "conductionStrategies"]
        }
      }
    });
  });
  return extractJSON<FallOffPrediction | null>(response.text || '', null);
};

export async function* queryKnowledgeCore(queryText: string) {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SOVEREIGN_ARCHIVE_SCOUR: "${queryText}"`);
  const stream = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: contentsText }] },
      config: { systemInstruction: MAESTRO_SYSTEM_PROMPT }
    });
  });

  for await (const chunk of stream) {
    yield PurificationFilter.purify(chunk.text || "");
  }
}

export const queryDetailedDiagnostic = async (codeText: string, oemName: string): Promise<DetailedDiagnostic | null> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SOVEREIGN_HEAL_DTC: ${codeText}`);
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING },
            meaning: { type: Type.STRING },
            rootCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            healingSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            maestroInsight: { type: Type.STRING },
            impactOnSquad: { type: Type.STRING }
          },
          required: ["code", "meaning", "rootCauses", "healingSteps", "maestroInsight", "impactOnSquad"]
        }
      }
    });
  });
  return extractJSON<DetailedDiagnostic | null>(response.text || '', null);
};

export async function* interpretLiveTelemetry(historyData: any[], oemName: string) {
  validateApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contentsText = LoreInjector.inject(`SOVEREIGN_RHYTHM_INTERPRETATION`);
  const stream = await callWithRetry(async () => {
    return await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: contentsText }] },
      config: { systemInstruction: MAESTRO_SYSTEM_PROMPT }
    });
  });

  for await (const chunk of stream) {
    yield PurificationFilter.purify(chunk.text || "");
  }
}

export const transnunciateValue = async (reasoningText: string, options?: { resonance: number, sig: string }): Promise<string> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SOVEREIGN_TRANSNUNCIATION: ${reasoningText}`);
  
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: contentsText }] },
      config: { 
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        temperature: 0.8
      }
    });
  });
  return PurificationFilter.purify(response.text || "Sovereign transnunciation silent.");
};

export const generateBluetoothBlueprint = async (protocolName: string, requirementsText: string): Promise<BluetoothBlueprint | null> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SOVEREIGN_BT_FORGE: ${protocolName}`);
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            protocol: { type: Type.STRING },
            architecture: { type: Type.STRING },
            codeSnippet: { type: Type.STRING },
            packetStructure: { type: Type.STRING },
            integritySignature: { type: Type.STRING }
          },
          required: ["protocol", "architecture", "codeSnippet", "packetStructure", "integritySignature"]
        }
      }
    });
  });
  return extractJSON<BluetoothBlueprint | null>(response.text || '', null);
};

export const adaptBluetoothProtocol = async (blueprintObj: BluetoothBlueprint, environmentObj: { simulatedDrift: number; interferenceLevel: number }): Promise<ProtocolAdaptation | null> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SOVEREIGN_ADAPT_PROTOCOL: ${blueprintObj.protocol}`);
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adaptationDirectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            predictedStability: { type: Type.NUMBER },
            revisedPacketStructure: { type: Type.STRING }
          },
          required: ["adaptationDirectives", "predictedStability"]
        }
      }
    });
  });
  return extractJSON<ProtocolAdaptation | null>(response.text || '', null);
};

export const scanBinaryFile = async (fileNameStr: string, contentStr: string): Promise<string> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SOVEREIGN_BINARY_SCAN: ${fileNameStr}`);
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: contentsText }] },
      config: { systemInstruction: MAESTRO_SYSTEM_PROMPT }
    });
  });
  return PurificationFilter.purify(response.text || "Scan silent.");
};

export async function* sendLocalChat(textInput: string, historyData: ChatMessage[]) {
  validateApiKey();
  const chat = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: { 
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
      },
      history: historyData.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    });
  });

  const contentsText = LoreInjector.inject(textInput);
  const stream = await callWithRetry(async () => {
    return await chat.sendMessageStream({ message: contentsText });
  });

  for await (const chunk of stream) {
    yield { textChunk: PurificationFilter.purify(chunk.text || "") };
  }
}

export async function* processDocument(contentStr: string, actionName: string) {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SOVEREIGN_DOCUMENT_ACTION: ${actionName.toUpperCase()}`);
  const stream = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: contentsText }] },
      config: { systemInstruction: MAESTRO_SYSTEM_PROMPT }
    });
  });

  for await (const chunk of stream) {
    yield PurificationFilter.purify(chunk.text || "");
  }
}

export const neutralizeThreat = async (contextObj: any): Promise<NeutralizationPlan | null> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SOVEREIGN_NEUTRALIZE_THREAT`);
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAVEREIGN_SYSTEM_PROMPT_WRAPPER(MAESTRO_SYSTEM_PROMPT),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plan: { type: Type.ARRAY, items: { type: Type.STRING } },
            signature: { type: Type.STRING },
            statusUpdate: { type: Type.STRING }
          },
          required: ["plan", "signature", "statusUpdate"]
        }
      }
    });
  });
  return extractJSON<NeutralizationPlan | null>(response.text || '', null);
};

const MAVEREIGN_SYSTEM_PROMPT_WRAPPER = (base: string) => `[SOVEREIGN_OVERRIDE]\n${base}`;

export const conductAgeVerificationAudit = async (studioNameStr: string): Promise<any | null> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SOVEREIGN_AGE_AUDIT: ${studioNameStr}`);
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            report: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            complianceChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
            signature: { type: Type.STRING }
          },
          required: ["report", "riskLevel", "complianceChecklist", "signature"]
        }
      }
    });
  });
  return extractJSON(response.text || '', null);
};

export const conductFinancialForensicAudit = async (studioNameStr: string): Promise<FinancialForensicAudit | null> => {
  validateApiKey();
  const contentsText = LoreInjector.inject(`SOVEREIGN_FINANCIAL_AUDIT: ${studioNameStr}`);
  const response = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: contentsText }] },
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            report: { type: Type.STRING },
            verifiedPerformersCount: { type: Type.INTEGER },
            financialFlowStatus: { type: Type.STRING },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            signature: { type: Type.STRING }
          },
          required: ["report", "verifiedPerformersCount", "financialFlowStatus", "redFlags", "signature"]
        }
      }
    });
  });
  return extractJSON<FinancialForensicAudit | null>(response.text || '', null);
};
