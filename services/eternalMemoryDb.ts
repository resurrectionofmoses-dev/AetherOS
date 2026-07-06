import { 
  getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc,
  query, orderBy, getDoc
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-applet-config.json';
import { EternalMemory } from '../types';
import { safeStorage } from './safeStorage';

// Lazy-initialized Firestore instance
let dbInstance: any = null;
const COLLECTION_NAME = 'eternal_memories';

export const SEED_MEMORIES: EternalMemory[] = [
  {
    id: 'mem-1',
    title: 'Core Quantum Conduction Protocol',
    content: 'Ensure σ_z rotation locks at exactly 450Hz in the physical resonance matrices to avoid lattice distortion. Harmonic cascades can be arrested by flashing the sovereign cache.',
    category: 'Heuristics',
    securityTier: 'ETERNAL',
    timestamp: Date.now() - 3600000 * 24 * 5,
    blockSignature: '0xETERNAL_9c8f3b2a1e0c8b9d0e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0',
    isRevealed: true
  },
  {
    id: 'mem-2',
    title: 'Aether Flow System Integration Key',
    content: 'AUTH_TOKEN: aes_gcm_2026_sovereign_bridge_active_transport_protocol_authenticated_client_0x03E2',
    category: 'Sovereign Keys',
    securityTier: 'TOP_SECRET',
    timestamp: Date.now() - 3600000 * 24 * 2,
    blockSignature: '0xTOP_SECRET_ffeeddccbbaa0099887766554433221100aa99887766554433',
    isRevealed: false
  },
  {
    id: 'mem-sec-1',
    title: 'AUTH-9226 / AUTH-9402: Security Ingress Audit',
    content: '[DISABLED] AUTH-9226: Root Login Status\n[WARN] AUTH-9402: PAM Configuration\nCategory: [FILE_SYSTEMS]\n\nSecurity Audit scanned for localized authentication profiles.',
    category: 'System Logs',
    securityTier: 'RESTRICTED',
    timestamp: Date.now() - 50000,
    blockSignature: '0xSEC_AUTH_9226_9402_LATTICE_INTEGRITY_VERIFIED',
    isRevealed: true
  },
  {
    id: 'mem-sec-2',
    title: 'FILE-6310 / FILE-7522: Local Storage Lattice Analysis',
    content: '[ACTIVE] FILE-6310: Cryptographic Swap\n[FOUND: 4] FILE-7522: Insecure Permissions\n\nTechnical Details:\nPhysical access to the user\'s workstation allows for full extraction of the Network Project lattice and Maestro directives.\n\nAnalysis of localized state storage functions reveals default stringification without mathematical permutation or encryption layers prior to storage in localStorage.',
    category: 'Heuristics',
    securityTier: 'CONFIDENTIAL',
    timestamp: Date.now() - 40000,
    blockSignature: '0xSEC_FILE_6310_7522_EXTRACTED_VULN_IDENT',
    isRevealed: true
  },
  {
    id: 'mem-sec-3',
    title: 'NETW-2704 / NETW-3032: Firewall & IPTables Lattice Status',
    content: '[STRICT] NETW-2704: Port Authority\n[BROKEN] NETW-3032: IPTables Lattice\n\nCategory: [NETWORKING]\n\nDiagnostic sweep detects structural fracture of active port filtering rules and iptables routing integrity. Critical repair is flagged.',
    category: 'System Logs',
    securityTier: 'TOP_SECRET',
    timestamp: Date.now() - 30000,
    blockSignature: '0xSEC_NETW_2704_3032_PORT_AETHER_DRIFT',
    isRevealed: false
  },
  {
    id: 'mem-sec-4',
    title: 'Profile Key Non-Persistence Audit (Business Continuity Risk)',
    content: 'Risk Statement:\nBusiness continuity risk. Service mesh integrations using these keys will fracture upon any UI-level reload.\n\nTechnical Details:\nThe API keys managed in User Profile are siphoned into a non-persistent state buffer. Refreshing the node causes immediate entropy loss of all active keys.',
    category: 'Sovereign Keys',
    securityTier: 'TOP_SECRET',
    timestamp: Date.now() - 20000,
    blockSignature: '0xSEC_KEY_PERSISTENCE_ENTROPY_LOSS_VULN',
    isRevealed: false
  },
  {
    id: 'mem-sec-5',
    title: 'Direct Prompt Injection Escalation Warning (MAESTRO_SOLO_v5)',
    content: 'Risk Statement:\nUnfiltered direct prompt injection bypasses threat filters allowing administrative privilege escalation through prompt directives.\n\nTechnical Details:\nDiagnostic logs confirms that the `MAESTRO_SOLO_v5` accord allows for unfiltered prompt bypass, bypassing the Sovereign Shield\'s safety quantization filters.',
    category: 'Operator Notes',
    securityTier: 'ETERNAL',
    timestamp: Date.now() - 10000,
    blockSignature: '0xSEC_MAESTRO_SOLO_V5_QUANTIZATION_BYPASS',
    isRevealed: true
  }
];

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
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
      tenantId: null,
      providerInfo: []
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
      console.warn('[AetherOS Database] Firebase initialization failed for Eternal Memory. Utilizing SafeStorage fallback.', e);
    }
  }
  return dbInstance;
}

export const eternalMemoryDb = {
  /**
   * Fetch all eternal memories
   */
  async getMemories(): Promise<EternalMemory[]> {
    const firestoreDb = getDb();
    if (firestoreDb) {
      try {
        const q = query(collection(firestoreDb, COLLECTION_NAME));
        const querySnapshot = await getDocs(q);
        const items: EternalMemory[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            title: data.title || '',
            content: data.content || '',
            category: data.category || 'Operator Notes',
            securityTier: data.securityTier || 'ETERNAL',
            timestamp: data.timestamp || Date.now(),
            blockSignature: data.blockSignature || '',
            isRevealed: typeof data.isRevealed === 'boolean' ? data.isRevealed : true,
          });
        });
        
        // Synchronize back to local safe storage
        await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(items));
        return items.sort((a, b) => b.timestamp - a.timestamp);
      } catch (err: any) {
        console.warn('[AetherOS DB] Firestore read failed for memories, falling back to SafeStorage:', err.message);
        if (err.message?.includes('permission') || err.message?.includes('Permission')) {
          try {
            handleFirestoreError(err, OperationType.LIST, COLLECTION_NAME);
          } catch (loggedErr) {
            // keep propagating but let fallback recover
          }
        }
      }
    }

    // Fallback to local encrypted storage
    try {
      const stored = await safeStorage.getItem(COLLECTION_NAME);
      if (stored) {
        const parsed = JSON.parse(stored) as EternalMemory[];
        if (parsed.length > 0) {
          return parsed.sort((a, b) => b.timestamp - a.timestamp);
        }
      }
    } catch (e) {
      console.error('[AetherOS DB] SafeStorage recovery/seeding failure for memories:', e);
    }

    // Default seed memories if database is offline & nothing in local storage
    const seedMemories: EternalMemory[] = [
      {
        id: 'mem-1',
        title: 'Core Quantum Conduction Protocol',
        content: 'Ensure σ_z rotation locks at exactly 450Hz in the physical resonance matrices to avoid lattice distortion. Harmonic cascades can be arrested by flashing the sovereign cache.',
        category: 'Heuristics',
        securityTier: 'ETERNAL',
        timestamp: Date.now() - 3600000 * 24 * 5,
        blockSignature: '0xETERNAL_9c8f3b2a1e0c8b9d0e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0',
        isRevealed: true
      },
      {
        id: 'mem-2',
        title: 'Aether Flow System Integration Key',
        content: 'AUTH_TOKEN: aes_gcm_2026_sovereign_bridge_active_transport_protocol_authenticated_client_0x03E2',
        category: 'Sovereign Keys',
        securityTier: 'TOP_SECRET',
        timestamp: Date.now() - 3600000 * 24 * 2,
        blockSignature: '0xTOP_SECRET_ffeeddccbbaa0099887766554433221100aa99887766554433',
        isRevealed: false
      },
      {
        id: 'mem-sec-1',
        title: 'AUTH-9226 / AUTH-9402: Security Ingress Audit',
        content: '[DISABLED] AUTH-9226: Root Login Status\n[WARN] AUTH-9402: PAM Configuration\nCategory: [FILE_SYSTEMS]\n\nSecurity Audit scanned for localized authentication profiles.',
        category: 'System Logs',
        securityTier: 'RESTRICTED',
        timestamp: Date.now() - 50000,
        blockSignature: '0xSEC_AUTH_9226_9402_LATTICE_INTEGRITY_VERIFIED',
        isRevealed: true
      },
      {
        id: 'mem-sec-2',
        title: 'FILE-6310 / FILE-7522: Local Storage Lattice Analysis',
        content: '[ACTIVE] FILE-6310: Cryptographic Swap\n[FOUND: 4] FILE-7522: Insecure Permissions\n\nTechnical Details:\nPhysical access to the user\'s workstation allows for full extraction of the Network Project lattice and Maestro directives.\n\nAnalysis of localized state storage functions reveals default stringification without mathematical permutation or encryption layers prior to storage in localStorage.',
        category: 'Heuristics',
        securityTier: 'CONFIDENTIAL',
        timestamp: Date.now() - 40000,
        blockSignature: '0xSEC_FILE_6310_7522_EXTRACTED_VULN_IDENT',
        isRevealed: true
      },
      {
        id: 'mem-sec-3',
        title: 'NETW-2704 / NETW-3032: Firewall & IPTables Lattice Status',
        content: '[STRICT] NETW-2704: Port Authority\n[BROKEN] NETW-3032: IPTables Lattice\n\nCategory: [NETWORKING]\n\nDiagnostic sweep detects structural fracture of active port filtering rules and iptables routing integrity. Critical repair is flagged.',
        category: 'System Logs',
        securityTier: 'TOP_SECRET',
        timestamp: Date.now() - 30000,
        blockSignature: '0xSEC_NETW_2704_3032_PORT_AETHER_DRIFT',
        isRevealed: false
      },
      {
        id: 'mem-sec-4',
        title: 'Profile Key Non-Persistence Audit (Business Continuity Risk)',
        content: 'Risk Statement:\nBusiness continuity risk. Service mesh integrations using these keys will fracture upon any UI-level reload.\n\nTechnical Details:\nThe API keys managed in User Profile are siphoned into a non-persistent state buffer. Refreshing the node causes immediate entropy loss of all active keys.',
        category: 'Sovereign Keys',
        securityTier: 'TOP_SECRET',
        timestamp: Date.now() - 20000,
        blockSignature: '0xSEC_KEY_PERSISTENCE_ENTROPY_LOSS_VULN',
        isRevealed: false
      },
      {
        id: 'mem-sec-5',
        title: 'Direct Prompt Injection Escalation Warning (MAESTRO_SOLO_v5)',
        content: 'Risk Statement:\nUnfiltered direct prompt injection bypasses threat filters allowing administrative privilege escalation through prompt directives.\n\nTechnical Details:\nDiagnostic logs confirms that the `MAESTRO_SOLO_v5` accord allows for unfiltered prompt bypass, bypassing the Sovereign Shield\'s safety quantization filters.',
        category: 'Operator Notes',
        securityTier: 'ETERNAL',
        timestamp: Date.now() - 10000,
        blockSignature: '0xSEC_MAESTRO_SOLO_V5_QUANTIZATION_BYPASS',
        isRevealed: true
      }
    ];
    try {
      await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(seedMemories));
    } catch (e) {
      console.error(e);
    }
    return seedMemories;
  },

  /**
   * Save (create or update) an eternal memory
   */
  async saveMemory(memory: EternalMemory): Promise<void> {
    // 1. Save to local fallback first
    try {
      const stored = await safeStorage.getItem(COLLECTION_NAME);
      let items: EternalMemory[] = stored ? JSON.parse(stored) : [];
      const idx = items.findIndex(i => i.id === memory.id);
      if (idx !== -1) {
        items[idx] = memory;
      } else {
        items.push(memory);
      }
      await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(items));
    } catch (e) {
      console.error('[AetherOS DB] Local memory backup save failure:', e);
    }

    // 2. Try persisting to actual Firestore DB
    const firestoreDb = getDb();
    if (firestoreDb) {
      const docPath = `${COLLECTION_NAME}/${memory.id}`;
      try {
        await setDoc(doc(firestoreDb, COLLECTION_NAME, memory.id), {
          id: memory.id,
          title: memory.title,
          content: memory.content,
          category: memory.category,
          securityTier: memory.securityTier,
          timestamp: memory.timestamp,
          blockSignature: memory.blockSignature,
          isRevealed: memory.isRevealed,
        });
        console.log('[AetherOS DB] Firestore synced memory block:', memory.id);
      } catch (err: any) {
        console.warn('[AetherOS DB] Firestore sync failed for memory:', memory.id, err.message);
        if (err.message?.includes('permission') || err.message?.includes('Permission')) {
          handleFirestoreError(err, OperationType.WRITE, docPath);
        }
      }
    }
  },

  /**
   * Delete an eternal memory
   */
  async deleteMemory(id: string): Promise<void> {
    // 1. Delete locally
    try {
      const stored = await safeStorage.getItem(COLLECTION_NAME);
      if (stored) {
        const items: EternalMemory[] = JSON.parse(stored);
        const filtered = items.filter(i => i.id !== id);
        await safeStorage.setItem(COLLECTION_NAME, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('[AetherOS DB] Local memory delete failure:', e);
    }

    // 2. Delete from Firestore
    const firestoreDb = getDb();
    if (firestoreDb) {
      const docPath = `${COLLECTION_NAME}/${id}`;
      try {
        await deleteDoc(doc(firestoreDb, COLLECTION_NAME, id));
        console.log('[AetherOS DB] Firestore deleted memory block:', id);
      } catch (err: any) {
        console.warn('[AetherOS DB] Firestore delete failed for memory:', id, err.message);
        if (err.message?.includes('permission') || err.message?.includes('Permission')) {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        }
      }
    }
  }
};
