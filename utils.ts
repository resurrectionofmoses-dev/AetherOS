export const BINARY_EXTENSIONS = [
  '.dll', '.exe', '.com', '.msi', '.sys', '.scr',
  '.so', '.bin', '.out', '.dylib', '.jar', '.pyd',
  '.zip', '.rar', '.7z', '.tar', '.gz', '.tgz', '.iso',
];

export const isBinaryFile = (fileName: string): boolean => {
  return BINARY_EXTENSIONS.some(ext => fileName.toLowerCase().endsWith(ext));
};

export const extractVersionFromFile = (fileName:string): string | null => {
    const versionRegex = /(?:v|ver|version)?[_-]?(\d+\.\d+(?:\.\d+){0,2})/i;
    const match = fileName.match(versionRegex);
    return match ? match[1] : null;
};

/**
 * Robustly extracts and parses JSON from a string that might contain 
 * markdown markers or other surrounding text.
 */
export const extractJSON = <T>(text: string, fallback: T): T => {
  if (!text || !text.trim()) return fallback;
  
  try {
    // Attempt direct parse first
    return JSON.parse(text.trim());
  } catch (e) {
    // Attempt to find JSON block in markdown
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e2) {
        console.warn("[AetherOS] Failed to parse JSON from markdown block.");
      }
    }
    
    // Fallback to finding first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    
    let start = -1;
    let end = -1;
    
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      end = lastBrace;
    } else if (firstBracket !== -1) {
      start = firstBracket;
      end = lastBracket;
    }
    
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.substring(start, end + 1).trim());
      } catch (e3) {
        console.warn("[AetherOS] Failed to parse extracted JSON substring.");
      }
    }
    
    return fallback;
  }
};

/**
 * Measures the alignment between the User's Intent (IP) and the 
 * Architect's Output. Ensures the 'Healed' state is maintained.
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (!vecA.length || !vecB.length) return 0;
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  const len = Math.min(vecA.length, vecB.length);
  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  // Adding epsilon (1e-12) to prevent division by zero; maintaining protocol integrity.
  return dotProduct / (mA * mB + 1e-12);
};

/**
 * Forensic estimation of block weight to manage the 'Session Budget'.
 */
export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  return Math.max(1, text.trim().split(/\s+/).length);
};

export const getDeviceCompat = (): any => {
  const ua = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);
  
  return {
    platform: navigator.platform,
    isMobile: isMobile && !isTablet,
    isTablet: isTablet,
    isDesktop: !isMobile && !isTablet,
    touchEnabled: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    screenRes: `${window.screen.width}x${window.screen.height}`,
    pwaSupport: 'serviceWorker' in navigator,
    batteryApi: 'getBattery' in navigator,
    bluetoothApi: 'bluetooth' in navigator,
    canEscalate: isMobile || /Linux/i.test(ua)
  };
};

export interface SophisticatedColor {
  name: string;
  text: string;
  bg: string;
  border: string;
  glow: string;
  shadow: string;
}

const COLOR_PALETTE: SophisticatedColor[] = [
  { name: 'Cyan', text: 'text-cyan-400', bg: 'bg-cyan-950/20', border: 'border-cyan-500/30', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.2)]', shadow: 'rgba(34,211,238,0.4)' },
  { name: 'Amber', text: 'text-amber-400', bg: 'bg-amber-950/20', border: 'border-amber-500/30', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.2)]', shadow: 'rgba(251,191,36,0.4)' },
  { name: 'Violet', text: 'text-violet-400', bg: 'bg-violet-950/20', border: 'border-violet-500/30', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.2)]', shadow: 'rgba(139,92,246,0.4)' },
  { name: 'Emerald', text: 'text-emerald-400', bg: 'bg-emerald-950/20', border: 'border-emerald-500/30', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]', shadow: 'rgba(16,185,129,0.4)' },
  { name: 'Rose', text: 'text-rose-400', bg: 'bg-rose-950/20', border: 'border-rose-500/30', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.2)]', shadow: 'rgba(244,63,94,0.4)' },
  { name: 'Sky', text: 'text-sky-400', bg: 'bg-sky-950/20', border: 'border-sky-500/30', glow: 'shadow-[0_0_15px_rgba(14,165,233,0.2)]', shadow: 'rgba(14,165,233,0.4)' },
  { name: 'Fuchsia', text: 'text-fuchsia-400', bg: 'bg-fuchsia-950/20', border: 'border-fuchsia-500/30', glow: 'shadow-[0_0_15px_rgba(217,70,239,0.2)]', shadow: 'rgba(217,70,239,0.4)' },
];

export const getSophisticatedColor = (seed: string): SophisticatedColor => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
};

export async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 2000
): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error?.message || "";
      const status = error?.status || error?.code || 0;
      
      const isQuotaError = status === 429 || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
      const isTransientError = status >= 500 || errorMsg.includes('Rpc failed') || errorMsg.includes('UNKNOWN') || errorMsg.includes('xhr error');

      if ((isQuotaError || isTransientError) && retries < maxRetries) {
        retries++;
        const delay = initialDelay * Math.pow(2, retries - 1) + Math.random() * 1000;
        console.warn(`[AetherOS] API Congestion Detected (${status}). Retrying conduction (${retries}/${maxRetries}) in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
