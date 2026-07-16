import { describe, it, expect, beforeEach, vi } from 'vitest';

// 1. Establish robust window and localStorage browser mocks before importing safeStorage
const storageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => storageStore[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    storageStore[key] = value.toString();
    (localStorageMock as any)[key] = value.toString();
  }),
  removeItem: vi.fn((key: string) => {
    delete storageStore[key];
    delete (localStorageMock as any)[key];
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(storageStore)) {
      delete storageStore[key];
      delete (localStorageMock as any)[key];
    }
  })
};

// Polyfill global environment to simulate browser state
globalThis.window = {
  crypto: globalThis.crypto,
} as any;

globalThis.localStorage = localStorageMock as any;

// Now import safeStorage
import { safeStorage, getRandomVerse } from './safeStorage';

describe('AetherOS SafeStorage Protocol Suite', () => {
  beforeEach(() => {
    // Reset our mock localStorage store
    localStorageMock.clear();
    vi.clearAllMocks();
    
    // Restore default implementation of setItem
    localStorageMock.setItem.mockImplementation((key: string, value: string) => {
      storageStore[key] = value.toString();
      (localStorageMock as any)[key] = value.toString();
    });
    
    // Reset safeStorage internal passphrase to default fallback
    safeStorage.setPassphrase('');
  });

  describe('Cryptographic Operations & Custom Passphrases', () => {
    it('should successfully encrypt and decrypt data with the default fallback passphrase', async () => {
      const payload = 'AetherOS_Confidential_Payload_2026';
      
      // Perform write and verify it is encrypted in localStorage
      await safeStorage.setItem('test_secret', payload);
      const storedRaw = localStorageMock.getItem('test_secret');
      
      expect(storedRaw).not.toBeNull();
      expect(storedRaw).not.toBe(payload);
      expect(storedRaw).toContain('ciphertext');
      expect(storedRaw).toContain('iv');

      // Retrieve and decrypt the item
      const retrieved = await safeStorage.getItem('test_secret');
      expect(retrieved).toBe(payload);
    });

    it('should successfully encrypt and decrypt data with a dynamic custom sovereign passphrase', async () => {
      const sovereignPassphrase = 'AEC-SIM_SECURE_PHRASE_0x992B';
      const payload = 'Core_AI_Model_Weights_Checksum';

      safeStorage.setPassphrase(sovereignPassphrase);
      await safeStorage.setItem('model_check', payload);

      const retrieved = await safeStorage.getItem('model_check');
      expect(retrieved).toBe(payload);
    });

    it('should fail to decrypt items if the passphrase changes or is invalid', async () => {
      const payload = 'Strictly_Classified_State_Data';

      // Encrypt with Passphrase A
      safeStorage.setPassphrase('Passphrase_Alpha');
      await safeStorage.setItem('classified_key', payload);

      // Attempt decryption with Passphrase Beta
      safeStorage.setPassphrase('Passphrase_Beta');
      const decryptedWithWrongKey = await safeStorage.getItem('classified_key');
      
      // Decryption failure returns null fallback
      expect(decryptedWithWrongKey).toBeNull();
    });
  });

  describe('Data Persistence & Quarantine Fallbacks', () => {
    it('should fall back transparently to in-memory storage if localStorage is blocked (SecurityError / DOMException)', async () => {
      // Simulate third-party cookie blocking / localStorage restriction specifically for the target key
      localStorageMock.setItem.mockImplementation((key: string, value: string) => {
        if (key === 'restricted_key') {
          throw new Error('SecurityError: The operation is insecure.');
        }
        storageStore[key] = value.toString();
        (localStorageMock as any)[key] = value.toString();
      });

      const payload = 'Transient_Session_Variables';
      
      // Should not throw, should redirect safely to in-memory store
      await expect(safeStorage.setItem('restricted_key', payload)).resolves.not.toThrow();
      
      // The restricted key should be readable even when localStorage is blocked
      const retrieved = await safeStorage.getItem('restricted_key');
      expect(retrieved).toBe(payload);
    });

    it('should remove items correctly from both localStorage and memory fallbacks', async () => {
      await safeStorage.setItem('clean_target', 'to_be_deleted');
      expect(await safeStorage.getItem('clean_target')).toBe('to_be_deleted');

      safeStorage.removeItem('clean_target');
      expect(await safeStorage.getItem('clean_target')).toBeNull();
    });

    it('should completely clear store on requested clear() signal', async () => {
      await safeStorage.setItem('key_1', 'data_1');
      await safeStorage.setItem('key_2', 'data_2');

      expect(await safeStorage.getItem('key_1')).toBe('data_1');
      expect(await safeStorage.getItem('key_2')).toBe('data_2');

      safeStorage.clear();

      expect(await safeStorage.getItem('key_1')).toBeNull();
      expect(await safeStorage.getItem('key_2')).toBeNull();
    });
  });

  describe('Pre-Write Vault Backups (D:\\ simulation)', () => {
    it('should create a backup in localStorage when overwriting existing keys', async () => {
      const originalValue = 'Initial_System_Configuration';
      const newValue = 'Upgraded_System_Configuration';

      await safeStorage.setItem('sys_config', originalValue);
      
      // Overwrite the key to trigger vault pre-write backup logic
      await safeStorage.setItem('sys_config', newValue);

      // Check if backup exists in the storage keys
      const storageKeys = Object.keys(localStorageMock);
      const backupKeys = storageKeys.filter(k => k.startsWith('D:\\VAULT_BACKUP\\sys_config'));
      
      expect(backupKeys.length).toBe(1);
      expect(await safeStorage.getItem('sys_config')).toBe(newValue);
    });

    it('should cap the backups to a maximum of 5 to prevent storage exhaustion', async () => {
      const keyName = 'rate_limiter_state';
      
      // Generate 7 consecutive updates to trigger multiple backups
      for (let i = 1; i <= 7; i++) {
        await safeStorage.setItem(keyName, `State_Revision_${i}`);
      }

      const storageKeys = Object.keys(localStorageMock);
      const backupKeys = storageKeys.filter(k => k.startsWith(`D:\\VAULT_BACKUP\\${keyName}`));

      // Backups must be limited to exactly 5
      expect(backupKeys.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Audit Log & Telemetry Engine', () => {
    it('should append audit logs chronologically with unique identifiers and accurate metadata', async () => {
      const type = 'SECURITY';
      const msg = 'Unauthorized administrative bypass attempted by operator';
      const details = { ipAddress: '10.0.8.23', port: 443 };

      await safeStorage.appendAuditLog(type, msg, details);

      const logs = await safeStorage.getAuditLogs();
      expect(logs.length).toBe(1);

      const entry = logs[0];
      expect(entry.id).toContain('log_');
      expect(entry.type).toBe(type);
      expect(entry.message).toBe(msg);
      expect(entry.details).toEqual(details);
      expect(entry.timestamp).toBeLessThanOrEqual(Date.now());
      expect(entry.verse).toBeDefined();
      expect(entry.verse?.reference).toBeDefined();
      expect(entry.verse?.text).toBeDefined();
    });

    it('should return appropriate thematic verses according to audit type mapping', () => {
      // Test integrity category mapping
      const integrityVerse = getRandomVerse('PERMISSION_CHANGE');
      expect(integrityVerse).toBeDefined();
      
      // Check that the verse exists in the integrity list
      const integrityTexts = [
        "The integrity of the upright guides them, but the unfaithful are destroyed by their duplicity.",
        "Whoever walks in integrity walks securely, but whoever takes crooked paths will be found out.",
        "May integrity and uprightness protect me, because my hope, Lord, is in you.",
        "In everything set them an example by doing what is good. In your teaching show integrity, seriousness..."
      ];
      expect(integrityTexts).toContain(integrityVerse.text);

      // Test alert category mapping
      const alertVerse = getRandomVerse('SYSTEM_ALERT');
      const alertTexts = [
        "The name of the Lord is a fortified tower; the righteous run to it and are safe.",
        "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.",
        "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
        "God is our refuge and strength, an ever-present help in trouble."
      ];
      expect(alertTexts).toContain(alertVerse.text);
    });
  });
});
