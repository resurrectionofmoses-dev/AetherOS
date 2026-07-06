import { 
  getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc,
  query, orderBy, getDoc
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-applet-config.json';
import { CellularState, CellNode } from '../types';
import { safeStorage } from './safeStorage';

let dbInstance: any = null;
const COLLECTION_NAME = 'cellular_states';

function getDb() {
  if (!dbInstance) {
    try {
      const app = initializeApp(firebaseConfig);
      dbInstance = getFirestore(app);
    } catch (e) {
      console.warn('[AetherOS Cellular DB] Firebase initialization failed. Utilizing SafeStorage fallback.', e);
    }
  }
  return dbInstance;
}

export const cellularDb = {
  /**
   * Fetch all saved cellular states
   */
  async getCellularStates(): Promise<CellularState[]> {
    const firestoreDb = getDb();
    if (firestoreDb) {
      try {
        const q = query(collection(firestoreDb, COLLECTION_NAME));
        const querySnapshot = await getDocs(q);
        const items: CellularState[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            name: data.name || 'Unnamed Snapshot',
            cellsJson: data.cellsJson || '[]',
            phase: data.phase || 'G1',
            timestamp: data.timestamp || Date.now(),
          });
        });
        
        // Sync to local SafeStorage
        await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(items));
        return items.sort((a, b) => b.timestamp - a.timestamp);
      } catch (err: any) {
        console.warn('[AetherOS Cellular DB] Firestore read failed, using SafeStorage fallback:', err.message);
      }
    }

    // SafeStorage Fallback
    try {
      const stored = await safeStorage.getItem(COLLECTION_NAME);
      if (stored) {
        const parsed = JSON.parse(stored) as CellularState[];
        return parsed.sort((a, b) => b.timestamp - a.timestamp);
      }
    } catch (e) {
      console.error('[AetherOS Cellular DB] SafeStorage recovery failure:', e);
    }

    return [];
  },

  /**
   * Save a new cellular state snapshot
   */
  async saveCellularState(name: string, cells: CellNode[], phase: string): Promise<CellularState> {
    const id = 'snap_' + Date.now();
    const cellsJson = JSON.stringify(cells);
    const newSnapshot: CellularState = {
      id,
      name,
      cellsJson,
      phase,
      timestamp: Date.now(),
    };

    const firestoreDb = getDb();
    let firebaseSuccess = false;

    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, COLLECTION_NAME, id);
        await setDoc(docRef, {
          id: newSnapshot.id,
          name: newSnapshot.name,
          cellsJson: newSnapshot.cellsJson,
          phase: newSnapshot.phase,
          timestamp: newSnapshot.timestamp,
        });
        firebaseSuccess = true;
      } catch (err: any) {
        console.error('[AetherOS Cellular DB] Firestore write failed:', err);
      }
    }

    // Always record locally as well
    try {
      const stored = await safeStorage.getItem(COLLECTION_NAME);
      const list = stored ? (JSON.parse(stored) as CellularState[]) : [];
      list.push(newSnapshot);
      await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(list));
    } catch (err) {
      console.error('[AetherOS Cellular DB] Local SafeStorage write failed:', err);
    }

    return newSnapshot;
  },

  /**
   * Delete a cellular state snapshot
   */
  async deleteCellularState(id: string): Promise<void> {
    const firestoreDb = getDb();
    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, COLLECTION_NAME, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error('[AetherOS Cellular DB] Firestore delete failed:', err);
      }
    }

    try {
      const stored = await safeStorage.getItem(COLLECTION_NAME);
      if (stored) {
        const list = JSON.parse(stored) as CellularState[];
        const filtered = list.filter(item => item.id !== id);
        await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(filtered));
      }
    } catch (err) {
      console.error('[AetherOS Cellular DB] Local SafeStorage delete update failed:', err);
    }
  }
};
