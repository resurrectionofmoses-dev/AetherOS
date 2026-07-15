import { 
  getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-applet-config.json';
import { safeStorage } from './safeStorage';

export interface SovereignFileLock {
  id: string; // The Google Drive File ID
  fileName: string;
  lockedAt: number;
  lockedBy: string;
  passphraseHash: string; // Simple client-side hash representing the lock seal
}

let dbInstance: any = null;
const COLLECTION_NAME = 'sovereign_file_locks';

/**
 * Returns the lazily initialized Firestore DB instance.
 * "But let all things be done decently and in order." — 1 Corinthians 14:40
 */
function getDb() {
  if (!dbInstance) {
    try {
      const app = initializeApp(firebaseConfig);
      dbInstance = getFirestore(app);
    } catch (e) {
      console.warn('[Sovereign File Lock DB] Firebase initialization failed. Utilizing SafeStorage fallback.', e);
    }
  }
  return dbInstance;
}

/**
 * A lightweight, deterministic hashing utility to secure passphrases.
 * "A good name is rather to be chosen than great riches..." — Proverbs 22:1
 */
export function hashPassphrase(passphrase: string): string {
  const trimmed = passphrase.trim();
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'sh_' + Math.abs(hash).toString(16);
}

export const sovereignFileLockService = {
  /**
   * Retrieves all file locks from either Firestore or the SafeStorage fallback.
   * "The Lord shall preserve thy going out and thy coming in..." — Psalm 121:8
   */
  async getFileLocks(): Promise<SovereignFileLock[]> {
    const firestoreDb = getDb();
    if (firestoreDb) {
      try {
        const q = query(collection(firestoreDb, COLLECTION_NAME));
        const querySnapshot = await getDocs(q);
        const locks: SovereignFileLock[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          locks.push({
            id: docSnap.id,
            fileName: data.fileName || 'Unnamed Document',
            lockedAt: data.lockedAt || Date.now(),
            lockedBy: data.lockedBy || 'Sovereign operator',
            passphraseHash: data.passphraseHash || '',
          });
        });
        
        // Cache locally for offline integrity and fast queries
        await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(locks));
        return locks;
      } catch (err: any) {
        console.warn('[Sovereign File Lock DB] Firestore read desync, utilizing local sanctuary cache:', err.message);
      }
    }

    // Local sanctuary recovery cache
    try {
      const stored = await safeStorage.getItem(COLLECTION_NAME);
      if (stored) {
        return JSON.parse(stored) as SovereignFileLock[];
      }
    } catch (e) {
      console.error('[Sovereign File Lock DB] Local recovery failure:', e);
    }

    return [];
  },

  /**
   * Locks a specific file by recording an assertion of undeletability in Firestore and local storage.
   * "He shall cover thee with his feathers, and under his wings shalt thou trust..." — Psalm 91:4
   */
  async lockFile(fileId: string, fileName: string, lockedBy: string, passphrasePlain: string): Promise<void> {
    const passphraseHash = hashPassphrase(passphrasePlain);
    const lockRecord: SovereignFileLock = {
      id: fileId,
      fileName,
      lockedAt: Date.now(),
      lockedBy: lockedBy || 'AetherOS_Prime',
      passphraseHash
    };

    const firestoreDb = getDb();
    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, COLLECTION_NAME, fileId);
        await setDoc(docRef, lockRecord);
      } catch (err: any) {
        console.warn('[Sovereign File Lock DB] Firestore write failed. Saving to local sanctuary cache instead.', err.message);
      }
    }

    // Always update local storage for absolute consistency
    try {
      const currentLocks = await this.getFileLocks();
      const updatedLocks = currentLocks.filter(l => l.id !== fileId).concat(lockRecord);
      await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(updatedLocks));
    } catch (e) {
      console.error('[Sovereign File Lock DB] Local lock sync failed:', e);
    }
  },

  /**
   * Unlocks a file if the correct unlock passphrase is provided.
   * "And ye shall know the truth, and the truth shall make you free." — John 8:32
   */
  async unlockFile(fileId: string, passphrasePlain: string): Promise<{ success: boolean; message: string }> {
    const currentLocks = await this.getFileLocks();
    const existingLock = currentLocks.find(l => l.id === fileId);

    if (!existingLock) {
      return { success: true, message: "File is already free; no lock was bound to this node." };
    }

    const verificationHash = hashPassphrase(passphrasePlain);
    if (existingLock.passphraseHash !== verificationHash) {
      return { 
        success: false, 
        message: "Unlock phrase verification failed. The lock remains sealed. (Psalm 147:13)" 
      };
    }

    // Unlock authorized! Let's delete the firestore lock
    const firestoreDb = getDb();
    let deletedFromCloud = false;
    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, COLLECTION_NAME, fileId);
        await deleteDoc(docRef);
        deletedFromCloud = true;
      } catch (err: any) {
        console.warn('[Sovereign File Lock DB] Firestore delete failed, relying on local sync:', err.message);
      }
    }

    // Sync to local storage
    try {
      const updatedLocks = currentLocks.filter(l => l.id !== fileId);
      await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(updatedLocks));
    } catch (e) {
      console.error('[Sovereign File Lock DB] Local unlock sync failed:', e);
    }

    return { 
      success: true, 
      message: "The seal has been broken. The file node is released in grace and love. (John 8:36)" 
    };
  }
};
