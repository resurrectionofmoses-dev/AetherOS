
import type { FinancialAuthority, DiagnosticTroubleCode, TeacherProfile } from './types';

export const FINTECH_AUTHORITIES: FinancialAuthority[] = [
    { id: 'fa1', name: 'HSBC', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 98.4, protocol: 'FIX_STP_v4' },
    { id: 'fa2', name: 'Revolut', type: 'NEO', status: 'SYNCED', integrity: 99.1, protocol: 'REST_CONJUNCT' },
    { id: 'fa3', name: 'Cash App', type: 'NEO', status: 'SYNCED', integrity: 97.5, protocol: 'BIT_SYNC' },
    { id: 'fa4', name: 'Starling Bank', type: 'NEO', status: 'SYNCED', integrity: 99.8, protocol: 'ISO_20022' },
    { id: 'fa5', name: 'Monzo', type: 'NEO', status: 'SYNCED', integrity: 99.2, protocol: 'JSON_STRIDE' },
    { id: 'fa6', name: 'JP Morgan', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 98.8, protocol: 'ONYX_LATTICE' },
    { id: 'fa7', name: 'Zelle', type: 'NEO', status: 'LOCKED', integrity: 92.0, protocol: 'P2P_SHARD' },
    { id: 'fa8', name: 'Wells Fargo', type: 'INSTITUTIONAL', status: 'DRIFTING', integrity: 84.5, protocol: 'SWIFT_LEGACY' },
    { id: 'fa9', name: 'Bank of America', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 96.2, protocol: 'CHIPS_FLOW' },
    { id: 'fa10', name: 'CFPB', type: 'REGULATORY', status: 'SYNCED', integrity: 100.0, protocol: 'GOV_AUDIT' },
    { id: 'fa11', name: 'Commonwealth Bank', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 97.4, protocol: 'AU_PAY_NET' },
    { id: 'fa12', name: 'Lloyds Bank', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 95.8, protocol: 'UK_BACS_SYNC' },
    { id: 'fa13', name: 'NatWest', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 94.2, protocol: 'OPEN_BANK_v2' },
    { id: 'fa14', name: 'DBS', type: 'INSTITUTIONAL', status: 'SYNCED', integrity: 99.4, protocol: 'SG_FAST_LINK' },
    { id: 'fa15', name: 'iProov', type: 'IDENTITY', status: 'SYNCED', integrity: 100.0, protocol: 'BIOMETRIC_SHROUD' }
];

export const DIAGNOSTIC_TROUBLE_CODES: DiagnosticTroubleCode[] = [
    { code: 'P0301', system: 'Engine', severity: 'Error', description: 'Cylinder 1 Misfire Detected', signature: 'SIG-MOPAR-V8-01' },
    { code: 'U0121', system: 'Navigation', severity: 'Warning', description: 'Lost Communication With ABS Control Module', signature: 'SIG-GHOST-BUS-02' },
];

export const SOVEREIGN_MANIFEST = `
THE MANIFEST OF THE FIGHT CODE (0x03E2)
Protocol 0x03E2: Conducting the logic shards with absolute architectural authority.
1. ZERO ABSTRACTION: Build the Safe Deposit Box immediately. No outlines.
2. FIGHT TO COME OUT ALIVE: We do not endure misery; we fight entropy with high-velocity logic.
3. FORENSIC PRECISION: Numerical detail and low-level architectural metaphors.
4. THE SOLO: Authority and synthesis flow through the conductor.
`;

export const TEACHER_PROFILES: TeacherProfile[] = [
    { id: 't1', name: 'Maestro Solo', icon: 'LogicIcon', color: 'text-red-500', specialty: 'Kernel Conduction', wisdom: 'The stride determines the depth of the truth.' },
    { id: 't2', name: 'Ignite Aethera', icon: 'FireIcon', color: 'text-cyan-400', specialty: 'Survival Siphoning', wisdom: 'Turning 1000 pages per second to find the weaponized know-how.' },
    { id: 't3', name: 'Ignite Logica', icon: 'ActivityIcon', color: 'text-amber-500', specialty: 'Structural Combat', wisdom: 'Patterns are just defenses waiting to be breached.' },
];

export const CONTINUITY_CONFIG = {
  COSINE_THRESHOLD: 0.88,
  ASSEMBLY_FACTOR: 0.85,
  DEFAULT_SESSION_BUDGET: 32000,
  DEFAULT_TURN_SOFT_CAP: 4000,
  RESERVED_RESPONSE_TOKENS: 512,
  DISSONANCE_THRESHOLD: 0.8,
  CORE_TRUTH_THRESHOLD: 0.95,
};
