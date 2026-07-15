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

export const subscriptionsDb = {
  async getSubscription(userId: string): Promise<UserSubscription | null> {
    const db = getDb();
    if (!db) return null;
    
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserSubscription;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${userId}`);
    }
  },

  async saveSubscription(sub: UserSubscription): Promise<void> {
    const db = getDb();
    if (!db) return;
    
    try {
      const docRef = doc(db, COLLECTION_NAME, sub.userId);
      await setDoc(docRef, sub);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${sub.userId}`);
    }
  },

  subscribeToStatus(userId: string, callback: (sub: UserSubscription | null) => void, onError?: (err: any) => void) {
    const db = getDb();
    if (!db) {
      callback(null);
      return () => {};
    }

    const docRef = doc(db, COLLECTION_NAME, userId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as UserSubscription);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("[AetherOS Subscriptions Subscription Error]:", error);
      if (onError) onError(error);
    });
  }
};
