/**
 * Safe Storage Protocol:
 * Prevents SecurityError / DOMException when localStorage is disabled or restricted.
 */

const memoryStorage: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[AetherOS] Storage access restricted. Falling back to memory for key: ${key}`);
      return memoryStorage[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[AetherOS] Storage write restricted. Siphoning to memory for key: ${key}`);
      memoryStorage[key] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      delete memoryStorage[key];
    }
  },
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (e) {
      Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]);
    }
  }
};
