/**
 * Safe Storage Protocol:
 * Prevents SecurityError / DOMException when localStorage is disabled or restricted.
 */

const memoryStorage: Record<string, string> = {};

/**
 * [AES-SIM] Absolute Encryption Scheme (AEC-SIM v3)
 * Implements AES-GCM encryption via the Web Crypto API with dynamic key derivation.
 */
let SESSION_PASSPHRASE: string | null = null;
const SALT_KEY = "AETHER_GCM_SALT_0x03E2";

interface CryptoPackage {
  iv: string;
  ciphertext: string;
}

const CRYPTO_ENGINE = {
  getSalt: () => {
    try {
      let salt = localStorage.getItem(SALT_KEY);
      if (!salt) {
        const newSalt = window.crypto.getRandomValues(new Uint8Array(16));
        salt = btoa(String.fromCharCode(...newSalt));
        try {
          localStorage.setItem(SALT_KEY, salt);
        } catch (e) {
          // Ignore write restriction
        }
      }
      return new Uint8Array(atob(salt).split('').map(c => c.charCodeAt(0)));
    } catch (e) {
      // Return stable fallback salt if localStorage access is blocked
      const fallbackSaltBase = "AETHER_STABLE_MEMORY_SALT_DEGRADATION";
      return new TextEncoder().encode(fallbackSaltBase).slice(0, 16);
    }
  },

  getDerivedKey: async (passphrase: string) => {
    const encoder = new TextEncoder();
    const salt = CRYPTO_ENGINE.getSalt();
    
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  encrypt: async (text: string): Promise<string> => {
    try {
      // Use fallback if no session passphrase set
      const key = await CRYPTO_ENGINE.getDerivedKey(SESSION_PASSPHRASE || 'AetherSovereign2026');
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      const encodedText = encoder.encode(text);

      const ciphertextArr = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedText
      );

      const pkg: CryptoPackage = {
        iv: btoa(String.fromCharCode(...iv)),
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertextArr)))
      };

      return JSON.stringify(pkg);
    } catch (e) {
      console.error("[AES-GCM] Encryption Failure:", e);
      return text;
    }
  },

  decrypt: async (jsonPkg: string): Promise<string | null> => {
    try {
      const pkg: CryptoPackage = JSON.parse(jsonPkg);
      const key = await CRYPTO_ENGINE.getDerivedKey(SESSION_PASSPHRASE || 'AetherSovereign2026');
      
      const iv = new Uint8Array(atob(pkg.iv).split('').map(c => c.charCodeAt(0)));
      const ciphertext = new Uint8Array(atob(pkg.ciphertext).split('').map(c => c.charCodeAt(0)));

      const decryptedArr = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );

      return new TextDecoder().decode(decryptedArr);
    } catch (e) {
      return null;
    }
  }
};

export const safeStorage = {
  /**
   * Inject user passphrase into the secure context.
   */
  setPassphrase: (pass: string) => {
    SESSION_PASSPHRASE = pass;
    console.log("[AetherOS] Sovereign Passphrase Engaged.");
  },

  getItem: async (key: string): Promise<string | null> => {
    try {
      let val: string | null = null;
      try {
        val = localStorage.getItem(key);
      } catch (e) {
        // Suppress storage read restrictions
      }
      if (!val) {
        return memoryStorage[key] ? await CRYPTO_ENGINE.decrypt(memoryStorage[key]) : null;
      }
      return await CRYPTO_ENGINE.decrypt(val);
    } catch (e) {
      console.warn(`[AetherOS] Storage access restricted for key: ${key}`);
      try {
        return memoryStorage[key] ? await CRYPTO_ENGINE.decrypt(memoryStorage[key]) : null;
      } catch (inner) {
        return null;
      }
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // PRE-WRITE BACKUP (D:\ simulation)
      let existing: string | null = null;
      try {
        existing = localStorage.getItem(key);
      } catch (e) {
        // Suppress storage read restrictions
      }
      if (existing) {
          const backupKey = `D:\\VAULT_BACKUP\\${key}_${new Date().getTime()}.enc`;
          try {
              localStorage.setItem(backupKey, existing);
              // Limit backups to last 5 per key to avoid storage overflow
              const allBackups = Object.keys(localStorage).filter(k => k.startsWith(`D:\\VAULT_BACKUP\\${key}`));
              if (allBackups.length > 5) {
                  allBackups.sort().slice(0, allBackups.length - 5).forEach(k => {
                      try {
                          localStorage.removeItem(k);
                      } catch (e) {
                          // Ignore backup removal failures
                      }
                  });
              }
          } catch (e) {
              console.warn("[AetherOS] D:\\ Vault Backup Overflow. Maintaining current state.");
          }
      }

      const encrypted = await CRYPTO_ENGINE.encrypt(value);
      try {
        localStorage.setItem(key, encrypted);
      } catch (e) {
        console.warn(`[AetherOS] Storage write restricted. Siphoning to memory for key: ${key}`);
        memoryStorage[key] = encrypted;
      }
    } catch (e) {
      console.error("[AetherOS] safeStorage.setItem top-level catch:", e);
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

