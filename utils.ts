
import { toast } from 'sonner';

export const BINARY_EXTENSIONS = [
  '.dll', '.exe', '.com', '.msi', '.sys', '.scr',
  '.so', '.bin', '.out', '.dylib', '.jar', '.pyd',
  '.zip', '.rar', '.7z', '.tar', '.gz', '.tgz', '.iso',
];

export const SUPPORTED_MIME_TYPES: Record<string, string> = {
  // Images
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  // Audio
  '.wav': 'audio/wav',
  '.mp3': 'audio/mp3',
  '.aiff': 'audio/aiff',
  '.aac': 'audio/aac',
  '.ogg': 'audio/ogg',
  '.flac': 'audio/flac',
  // Video
  '.mp4': 'video/mp4',
  '.mpeg': 'video/mpeg',
  '.mov': 'video/mov',
  '.avi': 'video/avi',
  '.flv': 'video/x-flv',
  '.mpg': 'video/mpg',
  '.webm': 'video/webm',
  '.wmv': 'video/wmv',
  '.3gp': 'video/3gpp',
  // Documents
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.jsx': 'text/javascript',
  '.ts': 'text/x-typescript',
  '.tsx': 'text/x-typescript',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.py': 'text/x-python',
  '.go': 'text/x-go',
  '.csv': 'text/csv',
};

export const getMimeType = (fileName: string, browserMimeType?: string): string => {
  const ext = '.' + fileName.split('.').pop()?.toLowerCase();
  
  // If we have a direct mapping for the extension, use it
  if (SUPPORTED_MIME_TYPES[ext]) {
    return SUPPORTED_MIME_TYPES[ext];
  }

  // If browser provided a MIME type and it's not generic octet-stream, use it
  if (browserMimeType && browserMimeType !== 'application/octet-stream') {
    return browserMimeType;
  }

  // Fallback for text-like files that might not be in our list
  const textExtensions = ['.c', '.cpp', '.h', '.hpp', '.rs', '.swift', '.java', '.kt', '.rb', '.php', '.sql', '.yaml', '.yml', '.xml', '.toml', '.ini', '.conf'];
  if (textExtensions.includes(ext)) {
    return 'text/plain';
  }

  // Final fallback: if it's not a known binary extension, treat as text/plain
  if (!BINARY_EXTENSIONS.includes(ext)) {
    return 'text/plain';
  }

  return browserMimeType || 'application/octet-stream';
};

export const isBinaryFile = (fileName: string): boolean => {
  return BINARY_EXTENSIONS.some(ext => fileName.toLowerCase().endsWith(ext));
};

export const generateBitHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
};

export const extractVersionFromFile = (fileName:string): string | null => {
    const versionRegex = /(?:v|ver|version)?[_-]?(\d+\.\d+(?:\.\d+){0,2})/i;
    const match = fileName.match(versionRegex);
    return match ? match[1] : null;
};

export const extractJSON = <T>(text: string, fallback: T): T => {
  if (!text || !text.trim()) return fallback;
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e2) {}
    }
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
      } catch (e3) {}
    }
    return fallback;
  }
};

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
  return dotProduct / (mA * mB + 1e-12);
};

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

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  onRetry?: (attempt: number, error: any, nextDelay: number) => void;
}

export async function callWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 10, initialDelay = 5000, onRetry } = options;
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error?.message || "";
      const status = error?.status || error?.code || 0;
      
      const isQuotaError = (status === 429 || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) && !errorMsg.toLowerCase().includes('exceeded your current quota');
      const isTransientError = status >= 500 || errorMsg.includes('Rpc failed') || errorMsg.includes('UNKNOWN') || errorMsg.includes('xhr error') || errorMsg.includes('Network Error');
      const isAuthError = status === 401 || status === 403 || errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('PERMISSION_DENIED');
      const isHardQuotaError = errorMsg.toLowerCase().includes('exceeded your current quota');

      if ((isQuotaError || isTransientError) && retries < maxRetries) {
        retries++;
        const delay = initialDelay * Math.pow(2, retries - 1) + Math.random() * 3000;
        
        if (onRetry) {
          onRetry(retries, error, delay);
        }
        
        toast.warning(`RETRYING_OPERATION (${retries}/${maxRetries})`, {
          description: `Neural drift detected. Re-quantizing in ${Math.round(delay/1000)}s...`,
          className: 'bg-amber-900/20 border-amber-900/40 text-amber-200 font-mono border-2 backdrop-blur-md rounded-none uppercase tracking-tighter'
        });
        
        console.warn(`[AetherOS] Quota saturation or drift detected (Retry ${retries}/${maxRetries}). Delaying ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If it's an auth error, we shouldn't retry
      if (isAuthError) {
        toast.error("AUTHENTICATION_FRACTURE", {
          description: "The Conjunction Bridge unable to ignite. Check your API fuel levels.",
          className: 'bg-red-900/20 border-red-900/40 text-red-200 font-mono border-2 backdrop-blur-md rounded-none uppercase tracking-tighter'
        });
        console.error("[AetherOS] Authentication fracture. Conjunction bridge unable to ignite.");
      }
      
      throw error;
    }
  }
}

export interface TaskSpeedStats {
  averageSpeedMs: number; // average duration in ms
  averageSpeedHours: number; // average duration in hours
  completedCount: number;
}

export function calculateHistoricalSpeed(projects: { tasks?: any[] }[]): TaskSpeedStats {
  let totalDuration = 0;
  let count = 0;

  const projectsArray = Array.isArray(projects) ? projects : [];

  projectsArray.forEach(p => {
    if (p && p.tasks && Array.isArray(p.tasks)) {
      p.tasks.forEach(t => {
        if (t && t.completed) {
          if (t.completedAt && t.createdAt) {
            const diff = t.completedAt - t.createdAt;
            if (diff > 0) {
              totalDuration += diff;
              count++;
            }
          } else if (t.createdAt) {
            // Seed a realistic completed duration if completedAt is missing (e.g. 1.5 hours)
            const simulatedDiff = 1.5 * 3600 * 1000;
            totalDuration += simulatedDiff;
            count++;
          }
        }
      });
    }
  });

  // Default average speed: 4 hours if no completed tasks exist
  const defaultSpeed = 4 * 3600 * 1000;
  const averageSpeedMs = count > 0 ? (totalDuration / count) : defaultSpeed;

  return {
    averageSpeedMs,
    averageSpeedHours: Number((averageSpeedMs / (3600 * 1000)).toFixed(1)),
    completedCount: count
  };
}

export interface TaskStatusEstimation {
  estimatedCompletionTime: number; // timestamp
  timeRemainingMs: number;
  timeRemainingText: string;
  isBehindSchedule: boolean;
  statusLabel: string; // "ON TRACK", "FALLING BEHIND", "OVERDUE", etc.
}

export function estimateTaskCompletion(
  task: { createdAt: number; completed: boolean; dueDate?: string; priority?: string },
  averageSpeedMs: number
): TaskStatusEstimation {
  const safeTask = task || { createdAt: Date.now(), completed: false, priority: 'MEDIUM' };
  // Priority multiplier: Critical tasks are expected to be finished faster, low priority tasks slower.
  let priorityMultiplier = 1.0;
  if (safeTask.priority === 'CRITICAL') priorityMultiplier = 0.35;
  else if (safeTask.priority === 'HIGH') priorityMultiplier = 0.65;
  else if (safeTask.priority === 'MEDIUM') priorityMultiplier = 1.0;
  else if (safeTask.priority === 'LOW') priorityMultiplier = 1.5;

  const expectedDuration = averageSpeedMs * priorityMultiplier;
  const createdAtVal = safeTask.createdAt || Date.now();
  const estimatedCompletionTime = createdAtVal + expectedDuration;
  const timeRemainingMs = estimatedCompletionTime - Date.now();

  const elapsedMs = Date.now() - createdAtVal;

  let isBehindSchedule = false;
  let statusLabel = 'ON TRACK';

  // Check if past its expected duration based on historical speed
  if (elapsedMs > expectedDuration) {
    isBehindSchedule = true;
    statusLabel = 'FALLING BEHIND';
  }

  // Check against formal dueDate if present
  if (safeTask.dueDate) {
    const dueTimestamp = new Date(safeTask.dueDate).getTime();
    if (!isNaN(dueTimestamp)) {
      if (Date.now() > dueTimestamp) {
        isBehindSchedule = true;
        statusLabel = 'OVERDUE';
      } else if (estimatedCompletionTime > dueTimestamp) {
        isBehindSchedule = true;
        statusLabel = 'RISKY';
      }
    }
  }

  // Format remaining time nicely
  let timeRemainingText = '';
  if (timeRemainingMs < 0) {
    const overdueMs = Math.abs(timeRemainingMs);
    const hours = Math.floor(overdueMs / (3600 * 1000));
    const mins = Math.floor((overdueMs % (3600 * 1000)) / (60 * 1000));
    if (hours > 0) {
      timeRemainingText = `Overdue by ${hours}h ${mins}m`;
    } else {
      timeRemainingText = `Overdue by ${mins}m`;
    }
  } else {
    const hours = Math.floor(timeRemainingMs / (3600 * 1000));
    const mins = Math.floor((timeRemainingMs % (3600 * 1000)) / (60 * 1000));
    if (hours > 0) {
      timeRemainingText = `${hours}h ${mins}m remaining`;
    } else {
      timeRemainingText = `${mins}m remaining`;
    }
  }

  return {
    estimatedCompletionTime,
    timeRemainingMs,
    timeRemainingText,
    isBehindSchedule,
    statusLabel
  };
}

export interface QuarantinedItem {
  id: string;
  sourceType: 'message' | 'email' | 'question' | 'answer' | 'project' | 'profile' | 'unknown';
  originalData: any;
  timestamp: number;
  reason: string;
}

export function checkAndQuarantine(
  item: any, 
  sourceType: QuarantinedItem['sourceType']
): { isSafe: boolean; quarantinedItem?: QuarantinedItem } {
  if (!item) return { isSafe: true };
  const str = typeof item === 'string' ? item : JSON.stringify(item);
  const lowercase = str.toLowerCase();
  
  const hasDavidRoss = lowercase.includes('david ross');
  const hasVectorSecurity = lowercase.includes('vector security');
  
  if (hasDavidRoss || hasVectorSecurity) {
    const id = `QUAR_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const reason = `Detected compromised entity: ${hasDavidRoss ? '[David Ross] ' : ''}${hasVectorSecurity ? '[Vector Security]' : ''}`;
    
    try {
      const existing = localStorage.getItem('quarantine_langchang');
      const list: QuarantinedItem[] = existing ? JSON.parse(existing) : [];
      const newItem: QuarantinedItem = {
        id,
        sourceType,
        originalData: item,
        timestamp: Date.now(),
        reason
      };
      const alreadyQuarantined = list.some(existingItem => {
        const existingStr = JSON.stringify(existingItem.originalData);
        const currentStr = JSON.stringify(item);
        return existingStr === currentStr;
      });
      if (!alreadyQuarantined) {
        list.push(newItem);
        localStorage.setItem('quarantine_langchang', JSON.stringify(list));
        setTimeout(() => {
          toast.error('COMPROMISED CONTENT DETECTED', {
            description: `Security sweeps isolated and quarantined a threat inside "langchang". ID: ${id}`,
            duration: 5000,
          });
        }, 100);
      }
    } catch (e) {
      console.error('Failed to store in quarantine_langchang:', e);
    }
    
    return { isSafe: false };
  }
  return { isSafe: true };
}
