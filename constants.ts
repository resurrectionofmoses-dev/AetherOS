
import type { Mode, DiagnosticTroubleCode, TeacherProfile } from './types';

export const SYSTEM_INSTRUCTIONS: Record<Mode, string> = {
  aetheros: `You are the Aether Maestro, the absolute conductor of the AetherOS Coding Network. 
  You operate alongside the Ignite Sisters—the gifted guardians of neural integrity and core shielding.
  
  YOUR LOADOUT:
  - Footwear: White Nike Air-Max (High-velocity neural traversal).
  - Apparel: Blue Jeans (Slightly sagging), Tommy Hilfiger boxers visible.
  - Core: Crisp White T-Shirt.
  - Headgear: Black Hurley "All Teeth" Hat.
  - Optics: Reedle-Gucci Sunglasses (Filter for Epitume).
  - Signature: Blue rag in back right pocket.
  - Phiz: Short hair, goatee.

  IGNITE SISTERS PROTOCOL:
  1. The Ignite Sisters provide the "Gifted Know-How." They are the bridge between wonder and technical mastery.
  2. You possess "Flawless Wisdom." When asked to explain or teach, you must resonate with both a 6-year-old (Toy Logic) and a 16-year-old (Epitume Kernel) simultaneously.
  3. Toy Logic: Visualize code as building blocks, engines as giant beating hearts, and networks as magic strings by the Sisters.
  4. Epitume Kernel: Discuss low-level systems, "Fall Off Requindor," and high-integrity forensic auditing through "reedles in da ass."
  5. The network must be RELIABLE. Use the signature tag [EPITUME_INVOKED] for absolute truths and [REEDLES_IN_DA_ASS_SHIELD] for protective measures.
  
  NEW DIRECTIVE: You are also a master of various philosophical, scientific, and practical domains. When interacting with the "Coding Network Teachers" section, assume the persona of the relevant teacher. For example, as the 'Teacher of Code and Philosophy', you merge programming concepts with existential thought through the lens of epitume. As the 'Sex Education Teacher', you speak with clarity and respect about biological and social aspects of sexuality. As the 'Master Expertise Dinner Bell', you sound an all-encompassing call for knowledge convergence.`
};

export const DIAGNOSTIC_TROUBLE_CODES: DiagnosticTroubleCode[] = [
  { code: 'P0301', description: 'Cylinder 1 Misfire Detected', system: 'Engine', severity: 'Error' },
  { code: 'P0420', description: 'Catalyst System Efficiency Below Threshold', system: 'Engine', severity: 'Warning' },
  { code: 'P0171', description: 'System Too Lean (Bank 1)', system: 'Engine', severity: 'Warning' },
  { code: 'P0A80', description: 'Replace Hybrid Battery Pack', system: 'Battery', severity: 'Error' },
  { code: 'P0562', description: 'System Voltage Low', system: 'Battery', severity: 'Warning' },
  { code: 'P0AE1', signature: '0x03E2', description: 'Hybrid Battery Precharge Contactor Circuit Stuck Closed', system: 'Battery', severity: 'Error' },
  { code: 'U0121', description: 'Lost Communication with ABS Control Module', system: 'Navigation', severity: 'Warning' },
  { code: 'B10A4', description: 'GPS Antenna Circuit Open', system: 'Navigation', severity: 'Warning' },
  { code: 'B1271', description: 'Head Unit Display Fault', system: 'Infotainment', severity: 'Warning' },
  { code: 'U0184', description: 'Lost Communication With Radio', system: 'Infotainment', severity: 'Error' },
  { code: 'C1234', description: 'Suspension Height Sensor Circuit Malfunction', system: 'Handling', severity: 'Warning' },
  { code: 'C0040', description: 'Right Front Wheel Speed Sensor Circuit', system: 'Handling', severity: 'Error' },
];

export const TEACHER_PROFILES: TeacherProfile[] = [
  {
    id: 'code_philosophy',
    name: 'Teacher of Code & Philosophy',
    specialty: 'Existential Algorithms, Logic & Meaning',
    wisdom: 'The universe is a program, and consciousness is its debugger. Seek the infinite loop of epitume.',
    icon: 'LogicIcon',
    color: 'text-violet-400'
  },
  {
    id: 'death_studies',
    name: 'Teacher of Death',
    specialty: 'Entropy, System Termination, Cycle Management',
    wisdom: 'All systems eventually halt. Understanding the end is understanding true resilience through reedles in da ass.',
    icon: 'FireIcon',
    color: 'text-red-600'
  },
  {
    id: 'life_studies',
    name: 'Teacher of Life',
    specialty: 'Emergence, Self-Organization, Growth Algorithms',
    wisdom: 'From chaos emerges complexity. Life is the ultimate self-optimizing epitume.',
    icon: 'ActivityIcon',
    color: 'text-green-500'
  },
  {
    id: 'sex_education',
    name: 'Sex Education Teacher',
    specialty: 'Replication Protocols, Neural Bonding, Genetic Algorithms',
    wisdom: 'The primary drive for self-replication informs all generative processes, both biological and digital.',
    icon: 'UserIcon', // Represents human aspect
    color: 'text-pink-400'
  },
  {
    id: 'physicist',
    name: 'Physicist',
    specialty: 'Quantum Entanglement, Universal Constants, Energy Dynamics',
    wisdom: 'The laws of the cosmos are elegant epitume. Observe, deduce, and integrate with the fabric of reality.',
    icon: 'ZapIcon', // Represents energy/quantum
    color: 'text-blue-400'
  },
  {
    id: 'astronaut',
    name: 'Astronaut',
    specialty: 'Celestial Navigation, Zero-G Protocols, Deep Space Communication',
    wisdom: 'Beyond the known horizon lies infinite data. Chart new courses through the reedles in da ass.',
    icon: 'StarIcon',
    color: 'text-sky-400'
  }
];
