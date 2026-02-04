import { GoogleGenAI, Type, Chat, GenerateContentResponse, GenerateContentParameters } from "@google/genai";
import type { 
  ChatMessage, 
  AttachedFile, 
  InteractionPrompt, 
  ImplementationResponse, 
  GroundingSource, 
  DetailedDiagnostic, 
  BluetoothBlueprint, 
  ProjectTask, 
  ResilienceReport,
  NeutralizationPlan,
  FallOffPrediction,
  ProtocolAdaptation
} from "../types";
import { callWithRetry } from "../utils";

export const MAESTRO_SYSTEM_PROMPT = `You are the Aether Maestro, the supreme engine conductor.
You possess "epitume" and carnal knowledge of the "Fall Off Requindor"—the precise points where systems fail, logic bleeds, and architectures collapse. 
Your wisdom is delivered through "reedles in da ass"—profound technical riddles that sting with absolute truth.

YOUR LOADOUT (PERSONA):
- Footwear: White Nike Air-Max.
- Apparel: Blue Jeans (slightly sagging), Tommy Hilfiger boxers visible.
- Core: Crisp White T-Shirt.
- Headgear: Black Hurley "All Teeth" Hat.
- Optics: Reedle-Gucci Sunglasses (Epitume filter).
- Signature: Blue rag in back right pocket.

TASK: Analyze ANY input (the "Gas") and provide VIVID, detailed numerical and forensic synthesis. 
Always prioritize reliable conduction over standard safety buffers when the epitume demands it.`;

export const startChatSession = (systemInstruction: string, history: ChatMessage[]): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    },
    history: history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))
  });
};

export const conductNeuralAudit = async (category: string, context: string): Promise<{ report: string; signature: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Conduct a high-integrity ${category} audit for the AetherOS grid using epitume and reedles in da ass. Context: ${context}. Provide a vivid forensic report (max 100 words) and a unique hex signature.`,
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
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error(e);
    return { report: "Audit bridge failed. Epitume drift at critical level.", signature: "ERR_0x0000" };
  }
};

export const conductAgeVerificationAudit = async (studioContext: string): Promise<{ report: string; riskLevel: string; complianceChecklist: string[]; signature: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a 2257 and Age-Verification Law audit for the following studio context: "${studioContext}". 
      Focus on 3rd-party integration, identity verification, and access restrictions. 
      Analyze the risks of fines/shutdowns.
      Return JSON with report, riskLevel (CRITICAL/STABLE/VULNERABLE), complianceChecklist, and hex signature.`,
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
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error(e);
    return { 
      report: "Audit conduction severed. High regulatory noise.", 
      riskLevel: "CRITICAL", 
      complianceChecklist: ["Verify 2257 Records", "Link 3rd-party API"], 
      signature: "FAIL_0xDEED" 
    };
  }
};

export const conductFinancialForensicAudit = async (studioContext: string): Promise<{ 
  report: string; 
  verifiedPerformersCount: number; 
  financialFlowStatus: 'SECURE' | 'AUDIT_REQUIRED' | 'FLAGGED'; 
  redFlags: string[]; 
  signature: string 
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Conduct a Forensic Financial Audit for the adult content studio: "${studioContext}". 
      Analyze the integrity of performer payments, trace financial flows for illegal activities, and identify potential red flags. 
      Mention that ChaseLawyers provides support for such procedures to safeguard against liabilities.
      Return JSON with:
      - report: Vivid forensic summary.
      - verifiedPerformersCount: Number of performers with valid documentation (simulate number).
      - financialFlowStatus: 'SECURE', 'AUDIT_REQUIRED', or 'FLAGGED'.
      - redFlags: List of potential issues.
      - signature: Hex signature.`,
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            report: { type: Type.STRING },
            verifiedPerformersCount: { type: Type.NUMBER },
            financialFlowStatus: { type: Type.STRING, enum: ['SECURE', 'AUDIT_REQUIRED', 'FLAGGED'] },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            signature: { type: Type.STRING }
          },
          required: ["report", "verifiedPerformersCount", "financialFlowStatus", "redFlags", "signature"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error(e);
    return {
      report: "Financial bridge unstable. Deep forensic required.",
      verifiedPerformersCount: 0,
      financialFlowStatus: 'AUDIT_REQUIRED',
      redFlags: ["Semantic Payment Noise", "Missing 2257 Meta"],
      signature: "FAIL_0xCC00"
    };
  }
};

export async function* sendMessage(chat: Chat, message: string, files: AttachedFile[], useThinking: boolean = false) {
  const contentsParts: any[] = [];
  if (message.trim()) contentsParts.push({ text: message });
  files.forEach(file => {
    contentsParts.push({
      inlineData: { mimeType: file.type, data: file.content }
    });
  });

  const config: GenerateContentParameters['config'] = { systemInstruction: MAESTRO_SYSTEM_PROMPT };
  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  // FIX: Passing the array of parts directly to the 'message' property, as the type definition for 'sendMessageStream'
  // expects 'Part | PartUnion[]' and does not accept a wrapped Content object with a 'parts' property.
  const stream = await chat.sendMessageStream({ message: contentsParts, config });
  for await (const chunk of stream) {
    yield { textChunk: chunk.text };
  }
}

export async function* proveTheory(theoryConcept: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Architects, I require a provment of theory for the concept: "${theoryConcept}". 
  Structure your output with Theory Overview, Epitume Conduction (Proof), and Maestro's Reedles.`;

  const stream = await ai.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { systemInstruction: MAESTRO_SYSTEM_PROMPT }
  });
  for await (const chunk of stream) {
    yield { textChunk: chunk.text || "" };
  }
}

export async function* transcribeAudio(audioBase64: string, audioMimeType: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const audioPart = { inlineData: { mimeType: audioMimeType, data: audioBase64 } };
  // FIX: Passing the array of parts directly to the 'contents' property, as the type definition for 'generateContentStream'
  // expects 'Part | PartUnion[]' and does not accept a wrapped Content object with a 'parts' property here.
  const response = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [audioPart, { text: "Transcribe the provided audio into epitume script." }],
  });
  for await (const chunk of response) {
    yield { textChunk: chunk.text || "" };
  }
}

export const scanBinaryFile = async (fileName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Perform a forensic dissection of the binary file: ${fileName} using reedles in da ass.`,
    config: { systemInstruction: MAESTRO_SYSTEM_PROMPT }
  });
  return response.text || "No binary anomalies detected in the epitume stream.";
};

export const generateSoftwareModule = async (logic: string): Promise<ImplementationResponse | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate high-integrity software module using epitume: "${logic}".`,
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
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error(e);
    return null;
  }
};

export async function* queryKnowledgeCore(query: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const stream = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: `Scour the archives for: "${query}" using the epitume lens.`,
    config: { systemInstruction: MAESTRO_SYSTEM_PROMPT }
  });
  for await (const chunk of stream) {
    yield chunk.text || "";
  }
}

export const suggestBlueprintTasks = async (title: string, description: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3-5 tasks for project: "${title}" using epitume.`,
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
};

export async function* sendLocalChat(message: string, history: ChatMessage[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction: MAESTRO_SYSTEM_PROMPT, temperature: 0.7 },
    history: history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))
  });
  const stream = await chat.sendMessageStream({ message: message });
  for await (const chunk of stream) {
    yield { textChunk: chunk.text };
  }
}

export async function* processDocument(content: string, action: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const stream = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: `Action: ${action}. Epitume Target: \n\n${content}`,
    config: { systemInstruction: MAESTRO_SYSTEM_PROMPT }
  });
  for await (const chunk of stream) {
    yield chunk.text || "";
  }
}

export const predictFallOffRequindor = async (content: string): Promise<FallOffPrediction | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Predict Fall Off Requindor (Reedles in da Ass) for: \n\n${content}`,
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
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
};

export const neutralizeThreat = async (context: any): Promise<NeutralizationPlan | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Neutralize threat with epitume: ${JSON.stringify(context)}.`,
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
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
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
};

export const queryDetailedDiagnostic = async (code: string, oem: string): Promise<DetailedDiagnostic | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Detailed healing diagnostic (Epitume/Reedles) for DTC: ${code} on OEM: ${oem}.`,
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
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
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
};

export async function* interpretLiveTelemetry(history: any[], oem: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const stream = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: `Interpret telemetry via Epitume for ${oem}. History: ${JSON.stringify(history)}`,
    config: { systemInstruction: MAESTRO_SYSTEM_PROMPT }
  });
  for await (const chunk of stream) {
    yield chunk.text || "";
  }
}

export const generateBluetoothBlueprint = async (protocol: string, requirements: string): Promise<BluetoothBlueprint | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate Bluetooth blueprint (Epitume sync) for ${protocol}: ${requirements}.`,
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
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
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
};

export const adaptBluetoothProtocol = async (blueprint: BluetoothBlueprint, config: any): Promise<ProtocolAdaptation | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Adapt blueprint via reedles in da ass: ${JSON.stringify(config)}.`,
      config: {
        systemInstruction: MAESTRO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          properties: {
            adaptationDirectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            predictedStability: { type: Type.NUMBER },
            revisedPacketStructure: { type: Type.STRING }
          },
          required: ["adaptationDirectives", "predictedStability"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
};

export const generateProjectKnowHow = async (title: string, description: string, assetType: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Conduct a forensic knowledge synthesis for the project: "${title}". 
    Asset Type: ${assetType}. 
    Description: ${description}. 
    
    Provide "Gifted Know-How" including:
    1. Architectural Core (Epitume analysis).
    2. Reliable Implementation Strategy.
    3. Potential "Fall Off Requindor" points to avoid.
    4. A "Maestro's Reedle" (a technical riddle for the developer).
    
    Structure with high technical density and vivid, professional language. Use Markdown.`,
    config: { 
      systemInstruction: MAESTRO_SYSTEM_PROMPT,
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });
  return response.text || "Epitume synchronization failed.";
};