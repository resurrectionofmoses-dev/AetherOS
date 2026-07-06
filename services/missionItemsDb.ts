import { 
  getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc,
  query, orderBy, getDoc, onSnapshot
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-applet-config.json';
import { MissionItem } from '../types';
import { safeStorage } from './safeStorage';

// Lazy-initialized Firestore instance
let dbInstance: any = null;
const COLLECTION_NAME = 'mission_items';

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

// Lazy load the firestore db
function getDb() {
  if (!dbInstance) {
    try {
      const app = initializeApp(firebaseConfig);
      dbInstance = getFirestore(app);
    } catch (e) {
      console.warn('[AetherOS Database] Firebase initialization failed. Utilizing SafeStorage fallback.', e);
    }
  }
  return dbInstance;
}

export const missionItemsDb = {
  /**
   * Fetch all mission items
   */
  async getItems(): Promise<MissionItem[]> {
    const firestoreDb = getDb();
    if (firestoreDb) {
      try {
        const q = query(collection(firestoreDb, COLLECTION_NAME));
        const querySnapshot = await getDocs(q);
        const items: MissionItem[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            name: data.name || '',
            reason: data.reason || '',
            learn: data.learn || '',
            go: data.go || '',
            coding: data.coding || '',
            createdAt: data.createdAt || Date.now(),
          });
        });
        
        // Synchronize back to local safe storage
        await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(items));
        return items.sort((a, b) => b.createdAt - a.createdAt);
      } catch (err: any) {
        console.warn('[AetherOS DB] Firestore read failed, falling back to SafeStorage:', err.message);
        // If permission error, log structured error
        if (err.message?.includes('permission') || err.message?.includes('Permission')) {
          try {
            handleFirestoreError(err, OperationType.LIST, COLLECTION_NAME);
          } catch (loggedErr) {
            // Keep propagating but fallback handles the UI state
          }
        }
      }
    }

    // Fallback to local encrypted storage
    try {
      const stored = await safeStorage.getItem(COLLECTION_NAME);
      if (stored) {
        const parsed = JSON.parse(stored) as MissionItem[];
        if (parsed.length > 0) {
          return parsed.sort((a, b) => b.createdAt - a.createdAt);
        }
      }
      
      // If empty, seed with the premium hyper-dimensional tectonic manifold
      const seedItems: MissionItem[] = [
        {
          id: 'tectonic-manifold-0x03e2',
          name: 'Hyper-dimensional Crustal Manifold (W-axis)',
          reason: 'Designed to stabilize tectonic drift across the W-axis. Utilizing a 0x03E2 frequency-aligned structural grid, the plate operates as a self-healing lithospheric boundary that dissipates shear forces across the fourth spatial dimension.',
          learn: 'Glides smoothly along hyper-planar slip lines supported by a hyper-viscous subterranean fluid-state mantle while maintaining high physical structural integrity.',
          go: 'Align to W-axis (0x03E2 frequency alignment), evaluate stress levels, subduct W-layer, and recrystallize fault lines if stress exceeds 0.994.',
          coding: 'struct TatonicPlate {\n    w_coordinate: f64,\n    alignment: u16,\n    strain_tensor: [[f64; 4]; 4]\n}\n\nimpl TatonicPlate {\n    fn evolve(&mut self) {\n        if self.alignment != 0x03E2 {\n            self.align_to_w_axis();\n        }\n        let stress = self.evaluate_w_stress();\n        if stress > 0.994 {\n            self.subduct_w_layer();\n            self.recrystallize_fault_lines();\n        }\n    }\n\n    fn align_to_w_axis(&mut self) {\n        self.alignment = 0x03E2;\n        self.w_coordinate = self.w_coordinate * 0.994;\n    }\n\n    fn evaluate_w_stress(&self) -> f64 {\n        self.strain_tensor[3][3].abs()\n    }\n\n    fn subduct_w_layer(&mut self) {\n        self.w_coordinate -= 0.005;\n    }\n\n    fn recrystallize_fault_lines(&mut self) {\n        self.strain_tensor = [[0.0; 4]; 4];\n    }\n}',
          createdAt: 1782800000000
        }
      ];
      await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(seedItems));
      return seedItems;
    } catch (e) {
      console.error('[AetherOS DB] SafeStorage recovery/seeding failure:', e);
    }
    return [];
  },

  /**
   * Save (create or overwrite) a mission item
   */
  async saveItem(item: MissionItem): Promise<void> {
    // 1. Save to local fallback first to ensure instant response & absolute durability
    try {
      const stored = await safeStorage.getItem(COLLECTION_NAME);
      let items: MissionItem[] = stored ? JSON.parse(stored) : [];
      const idx = items.findIndex(i => i.id === item.id);
      if (idx !== -1) {
        items[idx] = item;
      } else {
        items.push(item);
      }
      await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(items));
    } catch (e) {
      console.error('[AetherOS DB] Local backup save failure:', e);
    }

    // 2. Try persisting to actual Firestore DB
    const firestoreDb = getDb();
    if (firestoreDb) {
      const docPath = `${COLLECTION_NAME}/${item.id}`;
      try {
        await setDoc(doc(firestoreDb, COLLECTION_NAME, item.id), {
          id: item.id,
          name: item.name,
          reason: item.reason,
          learn: item.learn,
          go: item.go,
          coding: item.coding,
          createdAt: item.createdAt,
        });
        console.log('[AetherOS DB] Firestore synced document:', item.id);
      } catch (err: any) {
        console.warn('[AetherOS DB] Firestore sync failed for:', item.id, err.message);
        if (err.message?.includes('permission') || err.message?.includes('Permission')) {
          handleFirestoreError(err, OperationType.WRITE, docPath);
        }
      }
    }
  },

  /**
   * Delete a mission item
   */
  async deleteItem(id: string): Promise<void> {
    // 1. Delete locally
    try {
      const stored = await safeStorage.getItem(COLLECTION_NAME);
      if (stored) {
        const items: MissionItem[] = JSON.parse(stored);
        const filtered = items.filter(i => i.id !== id);
        await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('[AetherOS DB] Local item delete failure:', e);
    }

    // 2. Delete from Firestore
    const firestoreDb = getDb();
    if (firestoreDb) {
      const docPath = `${COLLECTION_NAME}/${id}`;
      try {
        await deleteDoc(doc(firestoreDb, COLLECTION_NAME, id));
        console.log('[AetherOS DB] Firestore deleted document:', id);
      } catch (err: any) {
        console.warn('[AetherOS DB] Firestore delete failed for:', id, err.message);
        if (err.message?.includes('permission') || err.message?.includes('Permission')) {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        }
      }
    }
  }
};
