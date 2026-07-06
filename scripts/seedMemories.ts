import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const seedMemories = [
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

async function seed() {
  console.log('Initializing Firebase App...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log(`Beginning seed of ${seedMemories.length} eternal memories...`);
  
  for (const memory of seedMemories) {
    const docRef = doc(db, 'eternal_memories', memory.id);
    await setDoc(docRef, memory);
    console.log(`Successfully seeded memory block: ${memory.id} (${memory.title})`);
  }
  
  console.log('Seeding completed successfully!');
}

seed().catch(err => {
  console.error('Seeding failed with error:', err);
  process.exit(1);
});
