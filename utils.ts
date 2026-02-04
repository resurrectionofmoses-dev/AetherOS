
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
      const isQuotaError = error.message?.includes('429') || error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuotaError && retries < maxRetries) {
        retries++;
        const delay = initialDelay * Math.pow(2, retries - 1);
        console.warn(`Quota exceeded. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
