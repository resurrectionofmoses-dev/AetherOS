/**
 * LATENT GAZE SEARCH ENGINE (hallucinations.py Sovereign Implementation)
 * 4-Stage Pipeline:
 * 1. THE GLANCE: Extract structured visual features from an image or visual prompt.
 * 2. THE HALLUCINATION: Generate 5 drastically different hypotheses at temperature = 0.8.
 * 3. THE NARROW DOWN: Rank predictions via exact cosine similarity against user_context_vector.
 * 4. SELECTION: Return the highest-affinity single intent alongside full similarity telemetry.
 */

export const GAZE_DOMAIN_LABELS = [
  'Fishing',
  'Cybersecurity',
  'Art',
  'Infrastructure',
  'Finance',
  'Biomechanics',
] as const;

export type GazeDomainLabel = (typeof GAZE_DOMAIN_LABELS)[number];

export interface UserContextVector {
  weights: number[]; // length 6 matching GAZE_DOMAIN_LABELS
}

export interface LatentPrediction {
  id: string;
  hypothesis: string;
  rationale: string;
  domainScores: number[];
  temperature: number;
  cosineSimilarity: number;
}

export interface LatentGazeResult {
  visualFeatures: string[];
  rawPredictions: LatentPrediction[];
  bestMatch: LatentPrediction;
  highestScore: number;
  temperatureUsed: number;
  sourceMode: 'sovereign-local' | 'neural-hybrid';
  timestamp: string;
}

const KEYWORD_DOMAIN_MAP: Array<{ domainIndex: number; keywords: RegExp; weight: number }> = [
  { domainIndex: 0, keywords: /\b(fish|lure|Sonar|tide|water|rod|lake|river|marine|depth|boat|pool|chlorine)\b/i, weight: 0.9 },
  { domainIndex: 1, keywords: /\b(packet|quic|http3|dns|firewall|sentinel|entropy|port|cipher|token|handshake|forensic|zero-rtt|security|hack|intrusion)\b/i, weight: 0.92 },
  { domainIndex: 2, keywords: /\b(35mm|grain|minimalist|studio|obsidian|mesh|editorial|fashion|shader|lighting|aesthetic|canvas|sculpture|silhouette)\b/i, weight: 0.9 },
  { domainIndex: 3, keywords: /\b(kernel|server|journalctl|postfix|phoenix|vsix|archive|vacuum|linux|systemd|protocol|bridge|telemetry)\b/i, weight: 0.88 },
  { domainIndex: 4, keywords: /\b(wealth|horizon|yield|ledger|treasury|revenue|portfolio|override|capital|audit|market)\b/i, weight: 0.91 },
  { domainIndex: 5, keywords: /\b(bionic|cyborg|prosthetic|implant|neural|bci|neuroprosthetic|augmentation|biomechanic|brain)\b/i, weight: 0.95 },
];

/**
 * Exact mathematical cosine similarity between two equal-length vectors.
 * Returns a scalar in [-1, 1] (typically [0, 1] for non-negative context weights).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const len = Math.min(vecA.length, vecB.length);
  if (len === 0) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < len; i++) {
    const a = Number.isFinite(vecA[i]) ? vecA[i] : 0;
    const b = Number.isFinite(vecB[i]) ? vecB[i] : 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (denom === 0) return 0;
  return Number((dot / denom).toFixed(6));
}

export function vectorizeTextForGaze(text: string): number[] {
  const vec = new Array(GAZE_DOMAIN_LABELS.length).fill(0.08);
  KEYWORD_DOMAIN_MAP.forEach(({ domainIndex, keywords, weight }) => {
    const matches = text.match(new RegExp(keywords.source, 'gi'));
    if (matches && matches.length > 0) {
      vec[domainIndex] = Math.min(1, vec[domainIndex] + weight * Math.min(1.5, 0.65 + matches.length * 0.2));
    }
  });
  return vec.map((v) => Number(v.toFixed(4)));
}

/**
 * Stage 1: THE GLANCE — Extracts structured visual descriptors from filename/description/data URL.
 */
export function analyzeVisualInput(imageInput: string): string[] {
  const cleaned = (imageInput || '').trim();
  if (!cleaned) {
    return ['unclassified silhouette', 'ambient studio contrast', 'structured telemetry frame'];
  }

  if (cleaned.startsWith('data:image/')) {
    const mimeMatch = cleaned.match(/^data:(image\/[a-zA-Z0-9+.-]+);/);
    const approxBytes = Math.round((cleaned.length * 3) / 4);
    return [
      `embedded optical frame (${mimeMatch?.[1] || 'image/raw'})`,
      `payload density ${approxBytes.toLocaleString()} bytes`,
      'edge-contrast boundary contours',
      'specular highlight geometry',
    ];
  }

  const tokens = cleaned
    .split(/[\s,;|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .slice(0, 12);

  return tokens.length > 0 ? tokens : [cleaned];
}

/**
 * Stage 2: THE HALLUCINATION — Produces 5 drastically divergent hypotheses (temp = 0.8).
 */
export function generateDivergentPredictions(
  visualFeatures: string[],
  temperature = 0.8
): Array<Omit<LatentPrediction, 'cosineSimilarity'>> {
  const featureSummary = visualFeatures.join(' ');
  const isTechOrNet = /packet|port|server|hex|signal|terminal|antenna|router|dns|cipher/i.test(featureSummary);
  const isBio = /bionic|neural|implant|arm|eye|bci|prosthet|sensor/i.test(featureSummary);
  const isWater = /pool|water|lake|fish|sonar|chlorine|wave|rippl/i.test(featureSummary);
  const isFashion = /fabric|mesh|35mm|obsidian|shadow|studio|minimalist|garment|dress/i.test(featureSummary);

  const candidates: Array<Omit<LatentPrediction, 'cosineSimilarity'>> = [
    {
      id: 'hyp-cyber',
      hypothesis: isTechOrNet
        ? `Adversarial packet entropy trace or covert C2 handshake signature embedded in "${featureSummary}"`
        : `Physical side-channel or RF leakage vector inferred from visual structure (${visualFeatures.slice(0, 3).join(', ')})`,
      rationale: 'Security vector hypothesis: isolates port 53/80 anomalies, header protection, and .sentinel tamper marks.',
      domainScores: [0.05, 0.96, 0.10, 0.68, 0.12, 0.18],
      temperature,
    },
    {
      id: 'hyp-fishing',
      hypothesis: isWater
        ? `Sub-surface acoustic thermocline, lure depth profile, or hydraulic circulation calibration for "${featureSummary}"`
        : `Outdoor field telemetry or aquatic sonar pattern analog drawn from "${visualFeatures.slice(0, 3).join(', ')}"`,
      rationale: 'Marine & kinetic hypothesis: maps ripples, chlorine/pH circulation, and environmental tide cues.',
      domainScores: [0.95, 0.08, 0.15, 0.32, 0.05, 0.05],
      temperature,
    },
    {
      id: 'hyp-art',
      hypothesis: isFashion
        ? `Obsidian-glass anisotropic editorial study in grainy 35mm monochrome highlighting "${featureSummary}"`
        : `Architectural lighting & minimalist sculptural composition inspired by "${visualFeatures.slice(0, 3).join(', ')}"`,
      rationale: 'Creative technologist hypothesis: aligns with Lo-Fi 35mm grain and High-Fashion Minimalist Vex spatial prompts.',
      domainScores: [0.12, 0.05, 0.97, 0.18, 0.08, 0.14],
      temperature,
    },
    {
      id: 'hyp-infra',
      hypothesis: `Systemd service fault trace (phoenix.sh / journalctl) or non-destructive ~/.q_archive snapshot for "${featureSummary}"`,
      rationale: 'Sovereign infrastructure hypothesis: routes visual telemetry to local state recovery and log vacuum diagnostics.',
      domainScores: [0.08, 0.45, 0.06, 0.95, 0.20, 0.12],
      temperature,
    },
    {
      id: 'hyp-bio-wealth',
      hypothesis: isBio
        ? `Biomechanical prosthetic / BCI neural interface calibration signal detected inside "${featureSummary}"`
        : `Long-horizon (<=50yr) physical asset & bionic augmentation ROI inspection linked to "${featureSummary}"`,
      rationale: 'Hybrid bio-cybernetic & Wealth Engine hypothesis: scores augmentation/BCI terminology alongside asset longevity.',
      domainScores: [0.05, 0.25, 0.12, 0.22, isBio ? 0.30 : 0.92, isBio ? 0.96 : 0.35],
      temperature,
    },
  ];

  // Perturb slightly with deterministic content vectors so custom descriptions genuinely shift rankings
  const inputVec = vectorizeTextForGaze(featureSummary);
  return candidates.map((cand) => ({
    ...cand,
    domainScores: cand.domainScores.map((s, idx) =>
      Number(Math.min(1, s * 0.78 + inputVec[idx] * 0.22).toFixed(4))
    ),
  }));
}

/**
 * Executes the complete 4-stage Latent Gaze Search synchronously using sovereign deterministic math.
 */
export function latentGazeSearch(
  imageInput: string,
  userContextVector: number[],
  customHypotheses?: Array<Omit<LatentPrediction, 'cosineSimilarity'>>
): LatentGazeResult {
  const visualFeatures = analyzeVisualInput(imageInput);
  const rawBase = customHypotheses && customHypotheses.length > 0
    ? customHypotheses
    : generateDivergentPredictions(visualFeatures, 0.8);

  const scored: LatentPrediction[] = rawBase
    .map((item) => ({
      ...item,
      cosineSimilarity: cosineSimilarity(item.domainScores, userContextVector),
    }))
    .sort((a, b) => b.cosineSimilarity - a.cosineSimilarity);

  const bestMatch = scored[0];
  return {
    visualFeatures,
    rawPredictions: scored,
    bestMatch,
    highestScore: bestMatch ? bestMatch.cosineSimilarity : 0,
    temperatureUsed: 0.8,
    sourceMode: customHypotheses ? 'neural-hybrid' : 'sovereign-local',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Optional neural-assisted Latent Gaze Search that asks /api/ai to invent 5 divergent predictions
 * at temp=0.8 and narrows them with exact cosine similarity—falling back transparently if offline.
 */
export async function runHybridLatentGazeSearch(
  imageInput: string,
  userContextVector: number[]
): Promise<LatentGazeResult> {
  const visualFeatures = analyzeVisualInput(imageInput);
  try {
    const prompt = `Visual features observed: ${visualFeatures.join(', ')}.
Invent 5 drastically different reasons (one each for Fishing/Marine, Cybersecurity, Creative Art/Fashion, Systems Infrastructure, and Finance/Biomechanics) why the user is looking at this.
Respond strictly as a JSON array of 5 objects with keys: "hypothesis" (1 sentence) and "rationale" (1 short sentence). Temperature intent: 0.8.`;

    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelName: 'gemini-3.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: 'Return only a valid JSON array of 5 divergent hypotheses.',
      }),
    });

    if (response.ok) {
      const payload = await response.json();
      const rawText = String(payload.text || '');
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length >= 3 && !rawText.includes('Heuristic Signal Intercepted')) {
          const formatted = parsed.slice(0, 5).map((entry: any, i: number) => {
            const text = `${entry.hypothesis || ''} ${entry.rationale || ''}`;
            return {
              id: `neural-hyp-${i + 1}`,
              hypothesis: String(entry.hypothesis || `Creative Prediction #${i + 1}`),
              rationale: String(entry.rationale || 'High-temperature divergent synthesis (0.8).'),
              domainScores: vectorizeTextForGaze(text),
              temperature: 0.8,
            };
          });
          return latentGazeSearch(imageInput, userContextVector, formatted);
        }
      }
    }
  } catch {
    // Graceful sovereign offline fallback below
  }

  return latentGazeSearch(imageInput, userContextVector);
}
