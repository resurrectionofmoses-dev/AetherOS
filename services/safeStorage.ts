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

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  type: 'SYSTEM_ALERT' | 'PERMISSION_CHANGE' | 'BYPASS' | 'DEACTIVATION' | 'ALERT' | 'SECURITY';
  message: string;
  details?: any;
  verse?: {
    reference: string;
    text: string;
  };
}

export function getRandomVerse(type: string) {
  const verses = {
    integrity: [
      { reference: "Proverbs 11:3", text: "The integrity of the upright guides them, but the unfaithful are destroyed by their duplicity." },
      { reference: "Proverbs 10:9", text: "Whoever walks in integrity walks securely, but whoever takes crooked paths will be found out." },
      { reference: "Psalm 25:21", text: "May integrity and uprightness protect me, because my hope, Lord, is in you." },
      { reference: "Titus 2:7", text: "In everything set them an example by doing what is good. In your teaching show integrity, seriousness..." }
    ],
    alert: [
      { reference: "Proverbs 18:10", text: "The name of the Lord is a fortified tower; the righteous run to it and are safe." },
      { reference: "Isaiah 41:10", text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you." },
      { reference: "Philippians 4:6", text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." },
      { reference: "Psalm 46:1", text: "God is our refuge and strength, an ever-present help in trouble." }
    ],
    healing: [
      { reference: "Exodus 15:26", text: "For I am the Lord, who heals you." },
      { reference: "Psalm 147:3", text: "He heals the brokenhearted and binds up their wounds." },
      { reference: "Jeremiah 17:14", text: "Heal me, Lord, and I will be healed; save me and I will be saved, for you are the one I praise." },
      { reference: "James 5:16", text: "Confess your sins to each other and pray for each other so that you may be healed." }
    ]
  };

  if (type === 'PERMISSION_CHANGE' || type === 'BYPASS' || type === 'DEACTIVATION') {
    const list = verses.integrity;
    return list[Math.floor(Math.random() * list.length)];
  } else if (type === 'SYSTEM_ALERT' || type === 'ALERT') {
    const list = verses.alert;
    return list[Math.floor(Math.random() * list.length)];
  } else {
    const list = verses.healing;
    return list[Math.floor(Math.random() * list.length)];
  }
}

export const safeStorage = {
  /**
   * Inject user passphrase into the secure context.
   */
  setPassphrase: (pass: string) => {
    SESSION_PASSPHRASE = pass;
    console.log("[AetherOS] Sovereign Passphrase Engaged.");
  },

  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    try {
      const stored = await safeStorage.getItem('aetheros_audit_log');
      if (!stored) {
        return [];
      }
      return JSON.parse(stored) as AuditLogEntry[];
    } catch (e) {
      console.error("[AetherOS] Failed to get audit logs:", e);
      return [];
    }
  },

  appendAuditLog: async (
    type: 'SYSTEM_ALERT' | 'PERMISSION_CHANGE' | 'BYPASS' | 'DEACTIVATION' | 'ALERT' | 'SECURITY',
    message: string,
    details?: any
  ): Promise<void> => {
    try {
      const logs = await safeStorage.getAuditLogs();
      const newEntry: AuditLogEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type,
        message,
        details,
        verse: getRandomVerse(type)
      };
      
      const updatedLogs = [...logs, newEntry];
      await safeStorage.setItem('aetheros_audit_log', JSON.stringify(updatedLogs));
    } catch (e) {
      console.error("[AetherOS] Failed to append audit log:", e);
    }
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

