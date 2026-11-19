import { 
  getFirestore, doc, setDoc, getDoc, onSnapshot
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-applet-config.json';

// Lazy-initialized Firestore instance
let dbInstance: any = null;
const COLLECTION_NAME = 'subscriptions';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
    },
    operationType,
    path
  };
  console.error('[AetherOS Firestore Error]: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function getDb() {
  if (!dbInstance) {
    try {
      const app = initializeApp(firebaseConfig);
      dbInstance = getFirestore(app);
    } catch (e) {
      console.warn('[AetherOS Database] Firebase initialization failed. Utilizing fallback.', e);
    }
  }
  return dbInstance;
}

export interface UserSubscription {
  userId: string;
  email: string;
  status: 'active' | 'inactive' | 'expired';
  plan: string;
  expiresAt: number;
  updatedAt: number;
}

const LOCAL_SUB_PREFIX = 'aetheros_subscription_';
const localListeners = new Map<string, Set<(sub: UserSubscription | null) => void>>();

function readLocalSubscription(userId: string): UserSubscription | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_SUB_PREFIX}${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as UserSubscription) : null;
  } catch {
    return null;
  }
}

function writeLocalSubscription(sub: UserSubscription): void {
  try {
    localStorage.setItem(`${LOCAL_SUB_PREFIX}${sub.userId}`, JSON.stringify(sub));
  } catch {
    // ignore storage quota restrictions
  }
  const listeners = localListeners.get(sub.userId);
  if (listeners) {
    listeners.forEach((cb) => cb(sub));
  }
}

export const subscriptionsDb = {
  async getSubscription(userId: string): Promise<UserSubscription | null> {
    const db = getDb();
    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserSubscription;
          writeLocalSubscription(data);
          return data;
        }
      } catch (error) {
        console.warn('[AetherOS Database] Firestore getSubscription failed, reading local cache:', error);
      }
    }
    return readLocalSubscription(userId);
  },

  async saveSubscription(sub: UserSubscription): Promise<void> {
    // Always persist locally first and notify active subscribers immediately
    writeLocalSubscription(sub);

    const db = getDb();
    if (!db) return;

    try {
      const docRef = doc(db, COLLECTION_NAME, sub.userId);
      await setDoc(docRef, sub);
    } catch (error) {
      console.warn('[AetherOS Database] Firestore saveSubscription failed, local subscription remains active:', error);
    }
  },

  subscribeToStatus(userId: string, callback: (sub: UserSubscription | null) => void, onError?: (err: any) => void) {
    if (!localListeners.has(userId)) {
      localListeners.set(userId, new Set());
    }
    localListeners.get(userId)!.add(callback);

    const cached = readLocalSubscription(userId);
    if (cached) {
      callback(cached);
    }

    const db = getDb();
    if (!db) {
      if (!cached) callback(null);
      return () => {
        localListeners.get(userId)?.delete(callback);
      };
    }

    const docRef = doc(db, COLLECTION_NAME, userId);
    const unsubscribeFirestore = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserSubscription;
        try {
          localStorage.setItem(`${LOCAL_SUB_PREFIX}${userId}`, JSON.stringify(data));
        } catch {
          // ignore
        }
        callback(data);
      } else {
        callback(readLocalSubscription(userId));
      }
    }, (error) => {
      console.warn("[AetherOS Subscriptions Subscription Fallback]:", error);
      callback(readLocalSubscription(userId));
      if (onError) onError(error);
    });

    return () => {
      localListeners.get(userId)?.delete(callback);
      unsubscribeFirestore();
    };
  }
};
