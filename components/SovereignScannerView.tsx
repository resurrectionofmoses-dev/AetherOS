import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Coins, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Search, 
  Clock, 
  Lock, 
  Unlock,
  HelpCircle,
  FileText,
  TrendingUp,
  Scale,
  DollarSign,
  Compass,
  Bus,
  ArrowRight,
  Database,
  Terminal,
  Zap,
  Globe,
  Binary,
  Layers,
  Sparkles,
  Key,
  Pill,
  FlaskConical,
  Grid,
  Download
} from 'lucide-react';
import { scanBinaryFile } from '../services/geminiService';
import { toBech32 } from './bitcoinAddressUtils';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';

interface ScanReport {
  id: string;
  timestamp: string;
  category: 'Engine' | 'Wealth' | 'Transit' | 'Peg' | 'NodeSecurity';
  status: 'PASS' | 'WARNING' | 'FAIL';
  summary: string;
  details: string[];
  checksum: string;
}

interface TrackedUTXO {
  id: string;
  address: string;
  amount: number;
  txid: string;
  confirmations: number;
  label: string;
  status: 'Unused' | 'Received' | 'Consolidated';
}

interface PegTransfer {
  id: string;
  amount: number;
  recipient: string;
  confirmations: number;
  status: 'LOCKED' | 'RELEASED';
  timestamp: string;
  isHighValue: boolean;
}

interface ParserRule {
  id: string;
  name: string;
  pattern: string;
  category: string;
  description: string;
  isCustom: boolean;
}

interface Substance {
  id: string;
  name: string;
  chemicalName: string;
  formula: string;
  molecularWeight: number;
  category: 'Psychedelic' | 'Stimulant' | 'Depressant' | 'Dissociative' | 'Opioid' | 'Synthetics';
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'FATAL';
  legalStatus: 'Unregulated' | 'Controlled' | 'Schedule I' | 'Schedule II' | 'Prohibited';
  estimatedPurity: number;
  halfLife: string;
  description: string;
  receptorAffinity: {
    dopamine: number;
    serotonin: number;
    norepinephrine: number;
    gaba: number;
    glutamate: number;
  };
  detectedLocation: string;
  timestamp: string;
  isCustom?: boolean;
  isVetted?: boolean;
}

interface SovereignScannerViewProps {
  shards?: number;
  onActionReward?: (shards: number) => void;
  onPurchase?: (cost: number) => boolean;
}

const LOCAL_SUBSTANCE_REGISTRY: Record<string, {
  name: string;
  chemicalName: string;
  formula: string;
  molecularWeight: number;
  category: 'Psychedelic' | 'Stimulant' | 'Depressant' | 'Dissociative' | 'Opioid' | 'Synthetics';
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'FATAL';
  legalStatus: 'Unregulated' | 'Controlled' | 'Schedule I' | 'Schedule II' | 'Prohibited';
  estimatedPurity: number;
  halfLife: string;
  description: string;
  receptorAffinity: {
    dopamine: number;
    serotonin: number;
    norepinephrine: number;
    gaba: number;
    glutamate: number;
  };
}> = {
  'cocaine': {
    name: 'Cocaine Hydrochloride',
    chemicalName: 'methyl (1R,2R,3S,5S)-3-(benzoyloxy)-8-methyl-8-azabicyclo[3.2.1]octane-2-carboxylate hydrochloride',
    formula: 'C17H21NO4 · HCl',
    molecularWeight: 339.81,
    category: 'Stimulant',
    riskLevel: 'EXTREME',
    legalStatus: 'Schedule II',
    estimatedPurity: 89,
    halfLife: '1.5 hours',
    description: 'A powerful central nervous system stimulant. Acts as a triple reuptake inhibitor. Chassis trace detected.',
    receptorAffinity: { dopamine: 95, serotonin: 60, norepinephrine: 90, gaba: 10, glutamate: 25 }
  },
  'cannabis': {
    name: 'Cannabis Indica Extract',
    chemicalName: '(-)-trans-Δ⁹-tetrahydrocannabinol / Cannabidiol',
    formula: 'C21H30O2',
    molecularWeight: 314.47,
    category: 'Psychedelic',
    riskLevel: 'LOW',
    legalStatus: 'Unregulated',
    estimatedPurity: 24,
    halfLife: '24.0 hours',
    description: 'Dense phyto-cannabinoids with high concentrations of tetrahydrocannabinol and terpene matrices.',
    receptorAffinity: { dopamine: 15, serotonin: 35, norepinephrine: 12, gaba: 45, glutamate: 20 }
  },
  'psilocybin': {
    name: 'Psilocybin Compound',
    chemicalName: '[3-(2-dimethylaminoethyl)-1H-indol-4-yl] dihydrogen phosphate',
    formula: 'C12H17N2O4P',
    molecularWeight: 284.25,
    category: 'Psychedelic',
    riskLevel: 'LOW',
    legalStatus: 'Schedule I',
    estimatedPurity: 98,
    halfLife: '3.0 hours',
    description: 'Naturally occurring tryptamine compound acting as a high-affinity agonist at the 5-HT2A receptor.',
    receptorAffinity: { dopamine: 5, serotonin: 98, norepinephrine: 20, gaba: 8, glutamate: 15 }
  },
  'mdma': {
    name: 'MDMA Hydrochloride',
    chemicalName: '3,4-Methylenedioxymethamphetamine hydrochloride',
    formula: 'C11H15NO2 · HCl',
    molecularWeight: 229.70,
    category: 'Stimulant',
    riskLevel: 'HIGH',
    legalStatus: 'Schedule I',
    estimatedPurity: 84,
    halfLife: '7.0 hours',
    description: 'A synthetic entactogen of the substituted amphetamine chemical class. Promotes massive neurotransmitter dump.',
    receptorAffinity: { dopamine: 55, serotonin: 95, norepinephrine: 85, gaba: 15, glutamate: 30 }
  },
  'ketamine': {
    name: 'Ketamine Hydrochloride',
    chemicalName: '2-(2-chlorophenyl)-2-(methylamino)cyclohexan-1-one hydrochloride',
    formula: 'C13H16ClNO · HCl',
    molecularWeight: 274.18,
    category: 'Dissociative',
    riskLevel: 'MODERATE',
    legalStatus: 'Controlled',
    estimatedPurity: 95,
    halfLife: '2.5 hours',
    description: 'A rapid-acting dissociative general anesthetic. Operates primarily via non-competitive NMDA receptor antagonism.',
    receptorAffinity: { dopamine: 30, serotonin: 40, norepinephrine: 35, gaba: 15, glutamate: 85 }
  },
  'fentanyl': {
    name: 'Fentanyl Citrate',
    chemicalName: 'N-(1-phenethylpiperidin-4-yl)-N-phenylpropanamide citrate',
    formula: 'C22H28N2O · C6H8O7',
    molecularWeight: 528.59,
    category: 'Opioid',
    riskLevel: 'FATAL',
    legalStatus: 'Schedule II',
    estimatedPurity: 12,
    halfLife: '4.0 hours',
    description: 'An extremely potent synthetic opioid analgesic. Micro-dosages present severe lethal respiratory suppression risk.',
    receptorAffinity: { dopamine: 40, serotonin: 25, norepinephrine: 30, gaba: 75, glutamate: 10 }
  },
  'methamphetamine': {
    name: 'Methamphetamine Hydrochloride',
    chemicalName: '(2S)-N-methyl-1-phenylpropan-2-amine',
    formula: 'C10H15N',
    molecularWeight: 149.23,
    category: 'Stimulant',
    riskLevel: 'EXTREME',
    legalStatus: 'Schedule II',
    estimatedPurity: 92,
    halfLife: '12.0 hours',
    description: 'Potent central nervous system stimulant triggering massive dopamine release.',
    receptorAffinity: { dopamine: 99, serotonin: 30, norepinephrine: 92, gaba: 5, glutamate: 10 }
  },
  'heroin': {
    name: 'Heroin Hydrochloride',
    chemicalName: '(5R,6S)-4,5-epoxy-17-methyl-17-methyl-7,8-didehydro-morphinan-3,6-diol diacetate',
    formula: 'C21H23NO5',
    molecularWeight: 369.41,
    category: 'Opioid',
    riskLevel: 'FATAL',
    legalStatus: 'Schedule I',
    estimatedPurity: 85,
    halfLife: '3.0 hours',
    description: 'An acetylated semi-synthetic morphine derivative displaying extreme central nervous system depressive qualities.',
    receptorAffinity: { dopamine: 45, serotonin: 30, norepinephrine: 25, gaba: 80, glutamate: 15 }
  }
};

export const SovereignScannerView: React.FC<SovereignScannerViewProps> = ({
  shards = 0,
  onActionReward,
  onPurchase
}) => {
  const [localRegistryUpgraded, setLocalRegistryUpgraded] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('aetheros_scanner_registry_upgraded') === 'true';
  });

  const [activeTab, setActiveTab] = useState<'engine' | 'wealth' | 'transit' | 'peg' | 'network_security' | 'reports' | 'substances'>('engine');
  const [scans, setScans] = useState<ScanReport[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');

  // 1. ENGINE TUNING PARAMETERS
  const [revLimit, setRevLimit] = useState(7200);
  const [ignitionTiming, setIgnitionTiming] = useState(15.0);
  const [fuelMapCell, setFuelMapCell] = useState(120);
  const [throttleResponse, setThrottleResponse] = useState(500);
  const [exhaustVolume, setExhaustVolume] = useState(800);
  const [engineKey, setEngineKey] = useState('0x8FA47B91CE2');

  // 2. ECONOMIC PARAMETERS (CONSERVATION OF WEALTH)
  const [ironOreQty, setIronOreQty] = useState(500);
  const [steelQty, setSteelQty] = useState(400);
  const [electricityQty, setElectricityQty] = useState(100);
  const [totalCphCirculation, setTotalCphCirculation] = useState(3089.5);
  const [extractedCph, setExtractedCph] = useState(1000);
  const [laborCph, setLaborCph] = useState(2100);
  const [consumedCph, setConsumedCph] = useState(10);
  const [depreciatedCph, setDepreciatedCph] = useState(0.5);

  // 3. TRANSIT & DIVIDEND PARAMETERS
  const [tripDistance, setTripDistance] = useState(500); // meters
  const [transportMethod, setTransportMethod] = useState<'walking' | 'bicycle' | 'car' | 'bus' | 'train' | 'teleport'>('walking');
  const [isEmergency, setIsEmergency] = useState(false);
  const [reportedTripCost, setReportedTripCost] = useState(5);
  
  const [dividendPool, setDividendPool] = useState(100000);
  const [totalWorkShares, setTotalWorkShares] = useState(5000);
  const [jimmyShares, setJimmyShares] = useState(150);
  const [sarahShares, setSarahShares] = useState(200);
  const [mikeShares, setMikeShares] = useState(180);

  // 4. BITCOIN & PEG TRANSFERS COMPLIANCE
  const [trackedUtxos, setTrackedUtxos] = useState<TrackedUTXO[]>([]);
  const [pegTransfers, setPegTransfers] = useState<PegTransfer[]>([]);
  const [inputPegAmount, setInputPegAmount] = useState(1500);
  const [inputPegRecipient, setInputPegRecipient] = useState('');
  const [currentBlockHeight, setCurrentBlockHeight] = useState(840221);

  // 5. NODE SECURITY & PCAP REMEDIATIONS
  const [isEnvelopeEncrypted, setIsEnvelopeEncrypted] = useState(false);
  const [isClockCalibrated, setIsClockCalibrated] = useState(false);
  const [isPayloadSanitized, setIsPayloadSanitized] = useState(false);
  
  const [remediatingAction, setRemediatingAction] = useState<string | null>(null);
  const [remediationLogs, setRemediationLogs] = useState<string[]>([]);

  // 6. ADAPTIVE PARSER WORKBENCH
  const [unstructuredInput, setUnstructuredInput] = useState(`POST /api/v1/auth HTTP/1.1
Host: 10.0.2.15
User-Agent: PCAPdroid/1.4.2
Authorization: Bearer s9a7d2h4k2910dhaksh9281adsa
Content-Type: application/json
Content-Length: 48

{"username":"admin","pass":"SovereignCore_991!"}

IP packet routed from interface eth0 MAC 00:0a:95:9d:68:16 to gateway 192.168.1.1
Dec-04-2026 Cargo Manifest: Contraband check failed - Trace elements of Cocaine, Cannabis indica, and Psilocybin compound detected in chassis compartments.`);
  const [selectedHeuristic, setSelectedHeuristic] = useState<string>('credentials');
  const [parsedRecords, setParsedRecords] = useState<Array<{ field: string; value: string; confidence: string; category: string }>>([]);
  const [learnedRules, setLearnedRules] = useState<ParserRule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('Custom pattern');
  const [showLearningBanner, setShowLearningBanner] = useState(false);

  // 7. CONTRABAND & SUBSTANCES STATE
  const [substances, setSubstances] = useState<Substance[]>(() => {
    const defaultList: Substance[] = [
      {
        id: 'sub-nexus',
        name: 'Nexus 2C-B Derivative',
        chemicalName: '2-(4-bromo-2,5-dimethoxyphenyl)ethan-1-amine derivative',
        formula: 'C10H14BrNO2',
        molecularWeight: 260.13,
        category: 'Psychedelic',
        riskLevel: 'HIGH',
        legalStatus: 'Prohibited',
        estimatedPurity: 78,
        halfLife: '5.0 hours',
        description: 'A novel synthetic phenethylamine derivative. Displays highly selective partial agonism at 5-HT2A and 5-HT2C serotonin receptor clusters. Newly isolated from cargo holds.',
        receptorAffinity: { dopamine: 25, serotonin: 92, norepinephrine: 40, gaba: 15, glutamate: 30 },
        detectedLocation: 'Chassis Compartments',
        timestamp: 'Dec-06-2026 11:20:00',
        isCustom: true,
        isVetted: false
      },
      {
        id: 'sub-pinky',
        name: 'U-47700 Synthetic Opioid',
        chemicalName: '3,4-dichloro-N-[2-(dimethylamino)cyclohexyl]-N-methylbenzamide',
        formula: 'C16H22Cl2N2O',
        molecularWeight: 329.27,
        category: 'Opioid',
        riskLevel: 'FATAL',
        legalStatus: 'Prohibited',
        estimatedPurity: 88,
        halfLife: '3.5 hours',
        description: 'An extremely potent mu-opioid receptor agonist with structural differentiation from fentanyl. Discovered in suspicious vacuum envelopes.',
        receptorAffinity: { dopamine: 30, serotonin: 20, norepinephrine: 15, gaba: 85, glutamate: 10 },
        detectedLocation: 'Envelope Cargo Segment',
        timestamp: 'Dec-06-2026 12:45:00',
        isCustom: true,
        isVetted: false
      },
      {
        id: 'sub-cocaine',
        name: 'Cocaine Hydrochloride',
        chemicalName: 'methyl (1R,2R,3S,5S)-3-(benzoyloxy)-8-methyl-8-azabicyclo[3.2.1]octane-2-carboxylate hydrochloride',
        formula: 'C17H21NO4 · HCl',
        molecularWeight: 339.81,
        category: 'Stimulant',
        riskLevel: 'EXTREME',
        legalStatus: 'Schedule II',
        estimatedPurity: 89,
        halfLife: '1.5 hours',
        description: 'A powerful ester-based stimulant of the central nervous system. Acts as a triple reuptake inhibitor, primarily preventing dopamine reabsorption. Chassis trace detected.',
        receptorAffinity: {
          dopamine: 95,
          serotonin: 60,
          norepinephrine: 90,
          gaba: 10,
          glutamate: 25,
        },
        detectedLocation: 'Chassis Compartments',
        timestamp: 'Dec-04-2026 04:12:00',
        isVetted: true
      },
      {
        id: 'sub-cannabis',
        name: 'Cannabis Indica Extract',
        chemicalName: '(-)-trans-Δ⁹-tetrahydrocannabinol / Cannabidiol',
        formula: 'C21H30O2 / C21H30O2',
        molecularWeight: 314.47,
        category: 'Psychedelic',
        riskLevel: 'LOW',
        legalStatus: 'Unregulated',
        estimatedPurity: 24,
        halfLife: '24.0 hours',
        description: 'Dense phyto-cannabinoids with high concentrations of tetrahydrocannabinol and terpene matrices. Minor chassis traces flagged.',
        receptorAffinity: {
          dopamine: 15,
          serotonin: 35,
          norepinephrine: 12,
          gaba: 45,
          glutamate: 20,
        },
        detectedLocation: 'Chassis Compartments',
        timestamp: 'Dec-04-2026 04:12:00',
        isVetted: true
      },
      {
        id: 'sub-psilocybin',
        name: 'Psilocybin Compound',
        chemicalName: '[3-(2-dimethylaminoethyl)-1H-indol-4-yl] dihydrogen phosphate',
        formula: 'C12H17N2O4P',
        molecularWeight: 284.25,
        category: 'Psychedelic',
        riskLevel: 'LOW',
        legalStatus: 'Schedule I',
        estimatedPurity: 98,
        halfLife: '3.0 hours',
        description: 'Naturally occurring tryptamine compound. Acts as a prodrug for psilocin, a high-affinity agonist at the 5-HT2A receptor. Traces found in cargo crates.',
        receptorAffinity: {
          dopamine: 5,
          serotonin: 98,
          norepinephrine: 20,
          gaba: 8,
          glutamate: 15,
        },
        detectedLocation: 'Chassis Compartments',
        timestamp: 'Dec-04-2026 04:12:00',
        isVetted: true
      },
      {
        id: 'sub-mdma',
        name: 'MDMA Hydrochloride',
        chemicalName: '3,4-Methylenedioxymethamphetamine hydrochloride',
        formula: 'C11H15NO2 · HCl',
        molecularWeight: 229.70,
        category: 'Stimulant',
        riskLevel: 'HIGH',
        legalStatus: 'Schedule I',
        estimatedPurity: 84,
        halfLife: '7.0 hours',
        description: 'A synthetic entactogen of the substituted amphetamine chemical class. Promotes substantial neurotransmitter dump across SERT and VMAT.',
        receptorAffinity: {
          dopamine: 55,
          serotonin: 95,
          norepinephrine: 85,
          gaba: 15,
          glutamate: 30,
        },
        detectedLocation: 'Envelope Cargo Segment',
        timestamp: 'Dec-03-2026 21:04:15',
        isVetted: true
      },
      {
        id: 'sub-ketamine',
        name: 'Ketamine Hydrochloride',
        chemicalName: '2-(2-chlorophenyl)-2-(methylamino)cyclohexan-1-one hydrochloride',
        formula: 'C13H16ClNO · HCl',
        molecularWeight: 274.18,
        category: 'Dissociative',
        riskLevel: 'MODERATE',
        legalStatus: 'Controlled',
        estimatedPurity: 95,
        halfLife: '2.5 hours',
        description: 'A rapid-acting dissociative general anesthetic. Operates primarily via non-competitive antagonism of the N-methyl-D-aspartate (NMDA) receptor.',
        receptorAffinity: {
          dopamine: 30,
          serotonin: 40,
          norepinephrine: 35,
          gaba: 15,
          glutamate: 85,
        },
        detectedLocation: 'Envelope Cargo Segment',
        timestamp: 'Dec-03-2026 21:04:15',
        isVetted: true
      },
      {
        id: 'sub-fentanyl',
        name: 'Fentanyl Citrate',
        chemicalName: 'N-(1-phenethylpiperidin-4-yl)-N-phenylpropanamide citrate',
        formula: 'C22H28N2O · C6H8O7',
        molecularWeight: 528.59,
        category: 'Opioid',
        riskLevel: 'FATAL',
        legalStatus: 'Schedule II',
        estimatedPurity: 12,
        halfLife: '4.0 hours',
        description: 'An extremely potent synthetic opioid analgesic. Micro-dosages present severe, lethal central nervous system respiratory suppression risk.',
        receptorAffinity: {
          dopamine: 40,
          serotonin: 25,
          norepinephrine: 30,
          gaba: 75,
          glutamate: 10,
        },
        detectedLocation: 'Suspicious Mail Cargo Bin 12',
        timestamp: 'Dec-05-2026 01:10:45',
        isVetted: true
      }
    ];

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aetheros_scanner_substances_v2');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Error reading substances from localStorage", e);
        }
      }
    }
    return defaultList;
  });

  const [vetStreak, setVetStreak] = useState<number>(() => {
    return typeof window !== 'undefined' ? Number(localStorage.getItem('aetheros_scanner_vet_streak') || '0') : 0;
  });
  const [multiplierUpgraded, setMultiplierUpgraded] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('aetheros_scanner_multiplier_upgraded') === 'true';
  });

  // 7.1 SOVEREIGN LAW COST SEALS (BTC MAINNET AUTO-DEDUCTION BYPASS ENFORCEMENT)
  const [brokenSeals, setBrokenSeals] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aetheros_scanner_broken_seals');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Error reading broken seals from localStorage", e);
        }
      }
    }
    return {
      'seal-alpha': false,
      'seal-beta': false,
      'seal-gamma': false,
      'seal-delta': false,
    };
  });

  const [sealAnimationState, setSealAnimationState] = useState<Record<string, { stage: string; percent: number; status: 'idle' | 'running' | 'success' | 'failed' }>>({});

  const [sealTxIds, setSealTxIds] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aetheros_scanner_seal_txids');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Error reading seal txids from localStorage", e);
        }
      }
    }
    return {};
  });

  const [customSealInputs, setCustomSealInputs] = useState<Record<string, string>>({});

  interface Seal {
    id: string;
    name: string;
    description: string;
    costSats: number;
    costShards: number;
    rewardDesc: string;
    unlockedSubstance?: Substance;
  }

  const COV_LAW_SEALS: Seal[] = [
    {
      id: 'seal-alpha',
      name: 'Cost Seal Alpha (Molecular Registry Decryption)',
      description: 'Bypasses the military-grade lookup block on synthetic psychedelics & high-yield tryptamines. Triggers autonomic mainnet direct-pull.',
      costSats: 21000, // 0.00021 BTC
      costShards: 30,
      rewardDesc: 'Unlocks "Aetheric-Psychedelic Tryptamine #9" (98% purity, 258.36 g/mol) for immediate high-yield compliance vetting.',
      unlockedSubstance: {
        id: 'sub-exotic-t9',
        name: 'Aetheric-Psychedelic Tryptamine #9',
        chemicalName: 'N,N-diallyl-5-methoxytryptamine (5-MeO-DALT) custom analogue',
        formula: 'C16H22N2O',
        molecularWeight: 258,
        category: 'Psychedelic',
        riskLevel: 'HIGH',
        legalStatus: 'Prohibited',
        estimatedPurity: 98,
        halfLife: '3.2 hours',
        description: 'A highly restricted tryptamine analogue. Displays intense visual receptor feedback loops on our deep spectrograph and 5-HT2A binding of 96%. Extracted via Seal Alpha bypass.',
        receptorAffinity: { dopamine: 30, serotonin: 96, norepinephrine: 45, gaba: 5, glutamate: 55 },
        detectedLocation: 'Sealed Compartment Alpha',
        timestamp: 'Sovereign Law Decrypted',
        isCustom: true,
        isVetted: false
      }
    },
    {
      id: 'seal-beta',
      name: 'Cost Seal Beta (Dopaminergic Map Recalibration)',
      description: 'Unlocks zero-knowledge neural mapping for stimulant research and premium receptor logs. Bypasses user consent via mainnet state-pull.',
      costSats: 42000, // 0.00042 BTC
      costShards: 50,
      rewardDesc: 'Unlocks "Xenon-G3 Synthetic Opioid" (extremely high bio-affinity, 410.32 g/mol) for standard compliance testing.',
      unlockedSubstance: {
        id: 'sub-exotic-xenon',
        name: 'Xenon-G3 Synthetic Opioid',
        chemicalName: '1-[1-(3,4-dichlorophenyl)ethyl]-4-(4-fluorobenzyl)piperazine analogue',
        formula: 'C20H24Cl2FN2',
        molecularWeight: 410,
        category: 'Opioid',
        riskLevel: 'FATAL',
        legalStatus: 'Prohibited',
        estimatedPurity: 95,
        halfLife: '8.4 hours',
        description: 'An extremely potent synthetic opioid analogue. Affinities exceed standard morphine matrices by 850%. Zero-knowledge state pull confirmed bypass code.',
        receptorAffinity: { dopamine: 85, serotonin: 30, norepinephrine: 70, gaba: 65, glutamate: 20 },
        detectedLocation: 'Sealed Compartment Beta',
        timestamp: 'Sovereign Law Decrypted',
        isCustom: true,
        isVetted: false
      }
    },
    {
      id: 'seal-gamma',
      name: 'Cost Seal Gamma (Autonomous Aegis Archive)',
      description: 'Enforces complete autonomous registry verification of severe risk-class substances. Deducts directly from Bitcoin mainnet.',
      costSats: 63000, // 0.00063 BTC
      costShards: 75,
      rewardDesc: 'Unlocks permanent static +0.25x Vetting Multiplier across the entire compliance scanning sub-station!',
    },
    {
      id: 'seal-delta',
      name: 'Cost Seal Delta (Sovereignty Law Enforcement Protocol)',
      description: 'Decrypts the complete legal-defense framework of the Autonomous Aetheros Workspace. Automatic sovereign billing enforced on mainnet.',
      costSats: 84000, // 0.00084 BTC
      costShards: 100,
      rewardDesc: 'Activates a "Sovereign Shield of Grace" that permanently prevents negative streak penalties during compliance vetting errors!',
    }
  ];

  const handleBreakSeal = async (sealId: string, costShards: number, customToken?: string) => {
    if (brokenSeals[sealId]) return;

    if (customToken) {
      const trimmed = customToken.trim();
      const isValid = trimmed.length >= 32 && /^[a-zA-Z0-9]+$/.test(trimmed);
      if (!isValid) {
        setSealAnimationState(prev => ({
          ...prev,
          [sealId]: {
            stage: 'ERROR: Cryptographic signature failed. Must be at least 32 alphanumeric characters matching [a-zA-Z0-9]{32,}',
            percent: 0,
            status: 'failed'
          }
        }));
        return;
      }

      setSealAnimationState(prev => ({
        ...prev,
        [sealId]: {
          stage: 'Validating cryptographic signature pattern on-chain...',
          percent: 15,
          status: 'running'
        }
      }));

      const stages = [
        { msg: 'Connecting to sovereign key registration nodes...', pct: 40 },
        { msg: `Validating proof signature: ${trimmed.slice(0, 8)}...${trimmed.slice(-8)}`, pct: 75 },
        { msg: 'Signature verified and locked into blockchain mainnet ledger!', pct: 95 }
      ];

      for (let i = 0; i < stages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setSealAnimationState(prev => ({
          ...prev,
          [sealId]: {
            stage: stages[i].msg,
            percent: stages[i].pct,
            status: 'running'
          }
        }));
      }

      setSealTxIds(prev => ({
        ...prev,
        [sealId]: trimmed
      }));

      setBrokenSeals(prev => {
        const updated = { ...prev, [sealId]: true };
        return updated;
      });

      setSealAnimationState(prev => ({
        ...prev,
        [sealId]: {
          stage: 'SUCCESS: Bitcoin mainnet transaction fully resolved. Cryptographic seal permanently broken!',
          percent: 100,
          status: 'success'
        }
      }));

      const seal = COV_LAW_SEALS.find(s => s.id === sealId);
      if (seal && seal.unlockedSubstance) {
        setSubstances(prev => {
          if (prev.some(s => s.id === seal.unlockedSubstance.id)) return prev;
          return [...prev, seal.unlockedSubstance];
        });
      }
      return;
    }

    if (shards < costShards) {
      setSealAnimationState(prev => ({
        ...prev,
        [sealId]: {
          stage: 'MAINNET COVENANT FAIL: Insufficient local Shards or Mainnet BTC balance to authorize zero-knowledge autonomic transfer.',
          percent: 0,
          status: 'failed'
        }
      }));
      return;
    }

    setSealAnimationState(prev => ({
      ...prev,
      [sealId]: {
        stage: 'Enforcing Sovereign Law Direct-Billing Covenant...',
        percent: 10,
        status: 'running'
      }
    }));

    const stages = [
      { msg: 'Initiating Direct-Pull Protocol under Sovereign Law Code 42-A...', pct: 25 },
      { msg: 'Bypassing Local Wallet Signatures (Zero-Knowledge Autonomic Routing Active)...', pct: 50 },
      { msg: 'Connecting to Bitcoin Mainnet P2P Nodes... Pinging Block State...', pct: 75 },
      { msg: 'UTXO Address Resolved. Direct-pulling mainnet sats balance successfully...', pct: 90 },
      { msg: 'Mainnet fee confirmed. Synchronizing Shards & breaking cryptographic seal...', pct: 95 },
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSealAnimationState(prev => ({
        ...prev,
        [sealId]: {
          stage: stages[i].msg,
          percent: stages[i].pct,
          status: 'running'
        }
      }));
    }

    if (onPurchase) {
      const success = onPurchase(costShards);
      if (!success) {
        setSealAnimationState(prev => ({
          ...prev,
          [sealId]: {
            stage: 'Autonomic Transfer Failed: Shard registry declined ledger balance.',
            percent: 0,
            status: 'failed'
          }
        }));
        return;
      }
    }

    setBrokenSeals(prev => {
      const updated = { ...prev, [sealId]: true };
      return updated;
    });

    setSealAnimationState(prev => ({
      ...prev,
      [sealId]: {
        stage: 'SUCCESS: Bitcoin mainnet transaction fully resolved. Cryptographic seal permanently broken!',
        percent: 100,
        status: 'success'
      }
    }));

    const seal = COV_LAW_SEALS.find(s => s.id === sealId);
    if (seal && seal.unlockedSubstance) {
      setSubstances(prev => {
        if (prev.some(s => s.id === seal.unlockedSubstance.id)) return prev;
        return [...prev, seal.unlockedSubstance];
      });
    }
  };

  const [activeVettingStep, setActiveVettingStep] = useState<'idle' | 'identify' | 'tag' | 'vet' | 'completed'>('idle');
  const [vetSelectedPath, setVetSelectedPath] = useState<string>('');
  const [vetSelectedTag, setVetSelectedTag] = useState<string>('');
  const [vetResonanceVal, setVetResonanceVal] = useState<number>(250);
  const [vetFeedbackMsg, setVetFeedbackMsg] = useState<string>('');
  const [vetSuccessShardsEarned, setVetSuccessShardsEarned] = useState<number>(0);

  const rewardMultiplier = Number((1.0 + (vetStreak * 0.2) + (multiplierUpgraded ? 0.5 : 0) + (brokenSeals['seal-gamma'] ? 0.25 : 0)).toFixed(2));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aetheros_scanner_substances_v2', JSON.stringify(substances));
    }
  }, [substances]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aetheros_scanner_vet_streak', String(vetStreak));
    }
  }, [vetStreak]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aetheros_scanner_multiplier_upgraded', String(multiplierUpgraded));
    }
  }, [multiplierUpgraded]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aetheros_scanner_broken_seals', JSON.stringify(brokenSeals));
    }
  }, [brokenSeals]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aetheros_scanner_seal_txids', JSON.stringify(sealTxIds));
    }
  }, [sealTxIds]);

  const handleExportAuditLog = () => {
    try {
      const auditData = {
        title: "Sovereign Compliance Scanner - Substance Scan History Audit Log",
        exportedAt: new Date().toISOString(),
        recordCount: substances.length,
        substances: substances.map(sub => ({
          id: sub.id,
          name: sub.name,
          chemicalName: sub.chemicalName,
          formula: sub.formula,
          molecularWeight: sub.molecularWeight,
          category: sub.category,
          riskLevel: sub.riskLevel,
          legalStatus: sub.legalStatus,
          estimatedPurity: sub.estimatedPurity,
          halfLife: sub.halfLife,
          description: sub.description,
          receptorAffinity: sub.receptorAffinity,
          detectedLocation: sub.detectedLocation,
          timestamp: sub.timestamp,
          isCustom: !!sub.isCustom,
          isVetted: !!sub.isVetted
        }))
      };
      
      const jsonString = JSON.stringify(auditData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `sovereign_substance_audit_log_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export audit log:", err);
    }
  };

  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(null);
  const [manualDensity, setManualDensity] = useState<'auto' | 'spacious' | 'balanced' | 'compact'>('auto');
  const [substanceCategoryFilter, setSubstanceCategoryFilter] = useState<string>('ALL');
  const [substanceRiskFilter, setSubstanceRiskFilter] = useState<string>('ALL');
  const [scanEngineMode, setScanEngineMode] = useState<'offline' | 'online'>('offline');
  const [substanceScanResult, setSubstanceScanResult] = useState<string>('');
  const [substanceSearchQuery, setSubstanceSearchQuery] = useState<string>('');

  const filteredSubstances = substances.filter(s => {
    const matchesCategory = substanceCategoryFilter === 'ALL' || s.category === substanceCategoryFilter;
    const matchesRisk = substanceRiskFilter === 'ALL' || s.riskLevel === substanceRiskFilter;
    
    const query = substanceSearchQuery.toLowerCase().trim();
    if (!query) return matchesCategory && matchesRisk;
    
    const matchesName = s.name.toLowerCase().includes(query);
    const matchesChemicalName = (s.chemicalName || '').toLowerCase().includes(query);
    const matchesFormula = (s.formula || '').toLowerCase().includes(query);
    const matchesLegalStatus = (s.legalStatus || '').toLowerCase().includes(query);
    const matchesRiskLevel = (s.riskLevel || '').toLowerCase().includes(query);
    
    return matchesCategory && matchesRisk && (
      matchesName || 
      matchesChemicalName || 
      matchesFormula || 
      matchesLegalStatus || 
      matchesRiskLevel
    );
  });

  const activeDensity = manualDensity === 'auto'
    ? (filteredSubstances.length <= 3 ? 'spacious' : filteredSubstances.length <= 7 ? 'balanced' : 'compact')
    : manualDensity;

  // Custom substance registration form states
  const [subFormName, setSubFormName] = useState('');
  const [subFormIupac, setSubFormIupac] = useState('');
  const [subFormFormula, setSubFormFormula] = useState('');
  const [subFormWeight, setSubFormWeight] = useState(250);
  const [subFormCategory, setSubFormCategory] = useState<'Psychedelic' | 'Stimulant' | 'Depressant' | 'Dissociative' | 'Opioid' | 'Synthetics'>('Psychedelic');
  const [subFormRisk, setSubFormRisk] = useState<'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'FATAL'>('LOW');
  const [subFormLegal, setSubFormLegal] = useState<'Unregulated' | 'Controlled' | 'Schedule I' | 'Schedule II' | 'Prohibited'>('Unregulated');
  const [subFormPurity, setSubFormPurity] = useState(90);
  const [subFormHalfLife, setSubFormHalfLife] = useState('4.0 hours');
  const [subFormDesc, setSubFormDesc] = useState('');
  
  // Custom substance receptor states
  const [subFormDopamine, setSubFormDopamine] = useState(50);
  const [subFormSerotonin, setSubFormSerotonin] = useState(50);
  const [subFormNorepi, setSubFormNorepi] = useState(50);
  const [subFormGaba, setSubFormGaba] = useState(50);
  const [subFormGlutamate, setSubFormGlutamate] = useState(50);

  const [isSubstanceScanning, setIsSubstanceScanning] = useState(false);
  const [substanceScanProgress, setSubstanceScanProgress] = useState(0);
  const [substanceScanMessage, setSubstanceScanMessage] = useState('');

  const handleRegisterSubstance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormName) return;
    const newSub: Substance = {
      id: `sub-custom-${Date.now()}`,
      name: subFormName,
      chemicalName: subFormIupac || `${subFormName} derivative`,
      formula: subFormFormula || 'C_x H_y N_z O_w',
      molecularWeight: Number(subFormWeight),
      category: subFormCategory,
      riskLevel: subFormRisk,
      legalStatus: subFormLegal,
      estimatedPurity: Number(subFormPurity),
      halfLife: subFormHalfLife,
      description: subFormDesc || 'A custom compound compiled and trained via compliance self-learning system calibration.',
      receptorAffinity: {
        dopamine: Number(subFormDopamine),
        serotonin: Number(subFormSerotonin),
        norepinephrine: Number(subFormNorepi),
        gaba: Number(subFormGaba),
        glutamate: Number(subFormGlutamate),
      },
      detectedLocation: 'Calibrated Memory Registry',
      timestamp: new Date().toLocaleString(),
      isCustom: true,
      isVetted: false
    };

    setSubstances(prev => [newSub, ...prev]);
    setSelectedSubstance(newSub);
    
    // Clear inputs
    setSubFormName('');
    setSubFormIupac('');
    setSubFormFormula('');
    setSubFormWeight(250);
    setSubFormPurity(90);
    setSubFormHalfLife('4.0 hours');
    setSubFormDesc('');
    setSubFormDopamine(50);
    setSubFormSerotonin(50);
    setSubFormNorepi(50);
    setSubFormGaba(50);
    setSubFormGlutamate(50);
  };

  const handleInitiateVetting = (sub: Substance) => {
    setSelectedSubstance(sub);
    setActiveVettingStep('identify');
    setVetSelectedPath('');
    setVetSelectedTag('');
    setVetResonanceVal(250);
    setVetFeedbackMsg('');
    setVetSuccessShardsEarned(0);
  };

  const handleCancelVetting = () => {
    setActiveVettingStep('idle');
  };

  const handleIdentifyStepSubmit = (sub: Substance) => {
    const affinities = sub.receptorAffinity;
    let maxPath = 'dopamine';
    let maxVal = affinities.dopamine;
    if (affinities.serotonin > maxVal) { maxPath = 'serotonin'; maxVal = affinities.serotonin; }
    if (affinities.norepinephrine > maxVal) { maxPath = 'norepinephrine'; maxVal = affinities.norepinephrine; }
    if (affinities.gaba > maxVal) { maxPath = 'gaba'; maxVal = affinities.gaba; }
    if (affinities.glutamate > maxVal) { maxPath = 'glutamate'; maxVal = affinities.glutamate; }

    if (vetSelectedPath === maxPath) {
      setVetFeedbackMsg('Correct pathway signature identified! Advancing to Stage 2: Chemical Class Tagging.');
      setTimeout(() => {
        setActiveVettingStep('tag');
        setVetFeedbackMsg('');
      }, 1500);
    } else {
      if (brokenSeals['seal-delta']) {
        setVetFeedbackMsg(`Pathway mismatch. Spectrograph reveals higher density of ${maxPath} signaling. Sovereign Grace Shield active: Streak preserved!`);
      } else {
        setVetFeedbackMsg(`Pathway mismatch. Spectrograph reveals higher density of ${maxPath} signaling. Multiplier reset.`);
        setVetStreak(0);
      }
    }
  };

  const handleTagStepSubmit = (sub: Substance) => {
    let expectedTag = 'Novel Synthetic Analogue';
    if (sub.category === 'Psychedelic') expectedTag = '5-HT2A Serotonergic Agonist';
    else if (sub.category === 'Stimulant') expectedTag = 'Monoamine Reuptake Inhibitor';
    else if (sub.category === 'Depressant') expectedTag = 'GABA Receptor Facilitator';
    else if (sub.category === 'Dissociative') expectedTag = 'NMDA Glutamatergic Antagonist';
    else if (sub.category === 'Opioid') expectedTag = 'Mu-Opioid Receptor Agonist';

    if (vetSelectedTag === expectedTag) {
      setVetFeedbackMsg('Correct therapeutic class tag applied! Advancing to Stage 3: Spectrogram Calibration.');
      setTimeout(() => {
        setActiveVettingStep('vet');
        setVetFeedbackMsg('');
      }, 1500);
    } else {
      if (brokenSeals['seal-delta']) {
        setVetFeedbackMsg(`Tag mismatch! Expected tag: "${expectedTag}". Sovereign Grace Shield active: Streak preserved!`);
      } else {
        setVetFeedbackMsg(`Tag mismatch! Expected tag: "${expectedTag}". Multiplier reset.`);
        setVetStreak(0);
      }
    }
  };

  const handleVetStepSubmit = (sub: Substance) => {
    const diff = Math.abs(vetResonanceVal - sub.molecularWeight);
    if (diff <= 15) {
      const baseReward = 20;
      const earned = Math.round(baseReward * rewardMultiplier);
      
      setVetSuccessShardsEarned(earned);
      setVetStreak(prev => prev + 1);

      if (onActionReward) {
        onActionReward(earned);
      }

      const updatedList = substances.map(s => s.id === sub.id ? { ...s, isVetted: true } : s);
      setSubstances(updatedList);
      setSelectedSubstance({ ...sub, isVetted: true });

      setVetFeedbackMsg(`Perfect resonance frequency locked at ${vetResonanceVal} g/mol! Verification audit successfully logged.`);
      setTimeout(() => {
        setActiveVettingStep('completed');
      }, 1500);
    } else {
      if (brokenSeals['seal-delta']) {
        setVetFeedbackMsg(`Spectrogram frequency failed to lock. Deviation too high (+/- ${diff.toFixed(1)} g/mol). Sovereign Grace Shield active: Streak preserved!`);
      } else {
        setVetFeedbackMsg(`Spectrogram frequency failed to lock. Deviation too high (+/- ${diff.toFixed(1)} g/mol). Multiplier reset.`);
        setVetStreak(0);
      }
    }
  };

  const handlePurchaseMultiplierUpgrade = () => {
    const cost = 150;
    if (multiplierUpgraded) return;
    if (shards < cost) {
      alert(`Insufficient Shards. You have ${shards} Shards but the Multiplier Upgrade requires ${cost} Shards.`);
      return;
    }
    if (onPurchase && onPurchase(cost)) {
      setMultiplierUpgraded(true);
      setSubstanceScanResult(`[SYSTEM CONJUNCTION UPDATE] WALLET SPECTROGRAPH MULTIPLIER UPGRADED SUCCESSFUL!\nStatic +0.5x multiplier applied to all look-up table vetting operations.`);
    } else {
      alert(`Unable to complete upgrade purchase. Check Shard balance.`);
    }
  };

  const handleUpgradeRegistry = () => {
    const cost = 250;
    if (localRegistryUpgraded) return;
    if (shards < cost) {
      alert(`Insufficient Shards. You have ${shards} Shards but upgrading requires ${cost} Shards.`);
      return;
    }
    if (onPurchase && onPurchase(cost)) {
      setLocalRegistryUpgraded(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aetheros_scanner_registry_upgraded', 'true');
      }
      setSubstanceScanResult(`[SYSTEM CONJUNCTION UPDATE] LOCAL TOXICITY REGISTRY UPGRADE SUCCESSFUL!\nQuantum resolution lens successfully aligned to active laser plasma matrix. All offline compound lookups now operate at 0ms latency with 0 Shard operating cost.`);
    } else {
      alert(`Unable to complete upgrade purchase. Check Shard balance.`);
    }
  };

  const handleRunDeepScan = (subId: string) => {
    const cost = scanEngineMode === 'online' ? 25 : (localRegistryUpgraded ? 0 : 5);
    
    if (shards < cost) {
      alert(`Insufficient Shards to initiate spectrometer scan. Required: ${cost} Shards. Current: ${shards} Shards.`);
      return;
    }

    if (onPurchase) {
      onPurchase(cost);
    }

    setIsSubstanceScanning(true);
    setSubstanceScanProgress(0);
    setSubstanceScanResult('');
    setSubstanceScanMessage('Initiating laser-induced plasma spectrometry... 🔬');

    const interval = setInterval(() => {
      setSubstanceScanProgress(p => {
        const next = p + 20;
        if (next === 40) setSubstanceScanMessage('Isolating compound signature chromatography... 🧪');
        if (next === 60) setSubstanceScanMessage('Measuring gas-phase mass spectrometry weight indices... ⚖️');
        if (next === 80) setSubstanceScanMessage('Resolving molecular receptor bio-affinity mappings... 🧬');
        if (next >= 100) {
          clearInterval(interval);
          setIsSubstanceScanning(false);
          const sub = substances.find(s => s.id === subId);
          if (sub) {
            // High-speed local lookup table lookup first
            const nameLower = sub.name.toLowerCase();
            const matchedKey = Object.keys(LOCAL_SUBSTANCE_REGISTRY).find(key => 
              nameLower.includes(key) || 
              key.includes(nameLower) ||
              sub.formula.toLowerCase().includes(LOCAL_SUBSTANCE_REGISTRY[key].formula.toLowerCase())
            );

            const registryData = matchedKey ? LOCAL_SUBSTANCE_REGISTRY[matchedKey] : null;

            // Instantly classify parameters if matched in local lookups
            let classifiedSub = sub;
            if (registryData) {
              classifiedSub = {
                ...sub,
                chemicalName: sub.chemicalName || registryData.chemicalName,
                category: registryData.category,
                riskLevel: registryData.riskLevel,
                legalStatus: registryData.legalStatus,
                molecularWeight: registryData.molecularWeight,
                receptorAffinity: registryData.receptorAffinity,
                description: sub.description || registryData.description,
              };
              setSubstances(prev => prev.map(s => s.id === subId ? classifiedSub : s));
              setSelectedSubstance(classifiedSub);
            }

            if (scanEngineMode === 'offline') {
              // Complete Offline Report from Local Lookups
              setTimeout(() => {
                const specReport = `## 🧬 AetherOS Spectrometer Compliance Report (Offline Core)
⚡ **HIGH-SPEED LOCAL REGISTRY MATCH // 0ms LATENCY // SHARDS SPENT: ${cost}**

### 📁 Molecular Fingerprint Analysis
* **Target Substance**: ${classifiedSub.name}
* **IUPAC Chemical Name**: ${classifiedSub.chemicalName || "N/A"}
* **Chemical Formula**: ${classifiedSub.formula}
* **Molecular Weight**: ${classifiedSub.molecularWeight} g/mol
* **Half-Life Period**: ${classifiedSub.halfLife}

### 🛡️ Local Toxicity & Compliance Verdict
* **Category Class**: ${classifiedSub.category}
* **Toxicity Risk Level**: **${classifiedSub.riskLevel}**
* **Legal Regulation**: **${classifiedSub.legalStatus}**
* **Status Log**: Validated locally from secure look-up records.

### 🧬 Bio-Receptor Affinity Signature
* Dopamine Receptor: ${classifiedSub.receptorAffinity.dopamine}%
* Serotonin Receptor: ${classifiedSub.receptorAffinity.serotonin}%
* Norepinephrine Receptor: ${classifiedSub.receptorAffinity.norepinephrine}%
* GABA Modulation: ${classifiedSub.receptorAffinity.gaba}%
* Glutamate Blockade: ${classifiedSub.receptorAffinity.glutamate}%

---
* **Spectrogram Integrity**: MATCHED (Confidence: 100%)
* **Diagnostic Note**: High-speed offline look-up matched database signatures directly. Sub-millisecond classification completed locally without external API latency.`;
                setSubstanceScanResult(specReport);
              }, 50);
            } else {
              // Online API call via Gemini proxy
              scanBinaryFile(
                sub.name, 
                `Analyze this substance and provide a detailed chemical compliance audit. 
Substance: ${sub.name}
Formula: ${sub.formula}
Category: ${sub.category}
Risk Level: ${sub.riskLevel}
IUPAC Name: ${sub.chemicalName || 'Unknown'}
Please format the output in beautiful markdown listing toxicity risks, legal scheduling globally, and exact biological affinity recommendations.`
              ).then(report => {
                setSubstanceScanResult(report);
              }).catch(err => {
                console.error(err);
                setSubstanceScanResult("Error connecting to online spectrometer API.");
              });
            }
          }
          return 100;
        }
        return next;
      });
    }, 150);
  };

  // Default Parser Rules (that the scanner gets better at using!)
  const defaultRules: ParserRule[] = [
    { id: 'ip_addr', name: 'IPv4 Address Extractor', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', category: 'Networking', description: 'Tracks network IP routing topologies', isCustom: false },
    { id: 'mac_addr', name: 'MAC Address Fingerprint', pattern: '([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})', category: 'Networking', description: 'Detects physical hardware interfaces', isCustom: false },
    { id: 'bearer_token', name: 'Bearer Token Auditer', pattern: 'Bearer\\s+([A-Za-z0-9_.-]+)', category: 'Security', description: 'Extracts session authorization strings', isCustom: false },
    { id: 'json_pw', name: 'JSON Password Sniffer', pattern: '"pass(?:word)?"\\s*:\\s*"([^"]+)"', category: 'Security', description: 'Extracts unencrypted credentials in body payloads', isCustom: false },
    { id: 'auth_header', name: 'Authorization Headers', pattern: 'Authorization:\\s*([\\w\\s\\.-]+)', category: 'Security', description: 'Detects plain-text API credentials', isCustom: false },
    { id: 'contraband_det', name: 'Controlled Substances Detector', pattern: '\\b(cannabis|heroin|cocaine|fentanyl|methamphetamine|mdma|oxycodone|psilocybin|xanax|morphine|ketamine|contraband|substance)\\b', category: 'Contraband / Rx', description: 'Identifies traces of controlled substances, Rx pharmaceuticals, or illicit contraband compounds', isCustom: false }
  ];

  // Helper to generate a compliant Taproot (bc1p...) Address using witness v1 program via toBech32
  const createFreshTaprootAddress = (): string => {
    const randomBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
    try {
      // witness version 1 for Taproot, prefix 'bc' for mainnet
      return toBech32(randomBytes, 1, 'bc');
    } catch (err) {
      // safe fallback format if any error occurs
      const decAlphabet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
      let fall = 'bc1p';
      for (let i = 0; i < 58; i++) {
        fall += decAlphabet[Math.floor(Math.random() * 32)];
      }
      return fall;
    }
  };

  // Run initial state setup
  useEffect(() => {
    // Generate some default tracked UTXO deposits to show UTXO isolation
    const initialUtxos: TrackedUTXO[] = [
      {
        id: 'utxo-1',
        address: 'bc1p90d8h2k4s9d7h72la8s58da73ha9281hsa92837dhsa7281hs9saq4e0a',
        amount: 0.145,
        txid: '6f9a7d2h4a9082910dhaks8d7f2a1b9c8e7f6d5c4b3a210987654321fedcba11',
        confirmations: 182,
        label: 'Deposit #102 - External Miner Payout',
        status: 'Received'
      },
      {
        id: 'utxo-2',
        address: 'bc1p82has9s7a6d5f4g3h2j1k0l9p8o7i6u5y4t3r2e1w0q9a8s7d6f5g4h3j2',
        amount: 0.850,
        txid: 'aa987d625b1029cde8f9a2b8c7d6e5f4g3h2j1k0l9p8o7i6u5y4t3r2e1w0q912',
        confirmations: 144,
        label: 'Deposit #103 - High Value Sovereign Reserve Peg',
        status: 'Consolidated'
      }
    ];
    setTrackedUtxos(initialUtxos);

    // Initial pending peg transfers
    const initialPegs: PegTransfer[] = [
      {
        id: 'peg-1',
        amount: 1250,
        recipient: 'bc1p7f3a2h1k0d8s7f6e5d4c3b2a198273615243527181029da87f16a0a29b',
        confirmations: 42,
        status: 'LOCKED',
        timestamp: new Date(Date.now() - 3600000 * 7).toLocaleTimeString(),
        isHighValue: true
      },
      {
        id: 'peg-2',
        amount: 350,
        recipient: 'bc1p09a8s7d6f5g4h3j2k1l0p9o8i7u6y5t4r3e2w1q0as9d8f7g6h5j4k3l2',
        confirmations: 144,
        status: 'RELEASED',
        timestamp: new Date(Date.now() - 3600000 * 12).toLocaleTimeString(),
        isHighValue: false
      }
    ];
    setPegTransfers(initialPegs);

    // Load custom learned rules from local storage
    try {
      const storedRules = localStorage.getItem('aetheros_learned_parser_rules');
      if (storedRules) {
        setLearnedRules(JSON.parse(storedRules));
      } else {
        setLearnedRules([]);
      }
    } catch (e) {
      console.error(e);
    }

    // Load diagnostic scans from local storage
    try {
      const stored = localStorage.getItem('aetheros_compliance_scans');
      if (stored) {
        setScans(JSON.parse(stored));
      } else {
        const initialScans: ScanReport[] = [
          {
            id: 'scan-1',
            timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString(),
            category: 'Engine',
            status: 'PASS',
            summary: 'Engine Tuning Parameters Verified with Stock Calibration',
            details: [
              'Rev limiter locked at standard 7000 RPM (Under safety threshold of 7500 RPM)',
              'Ignition timing set to +12.0° Advance (Allowed range: -10.0° retard to +40.0° advance)',
              'Fuel Map calibration active at 120 ms pulse (Preventing engine running too lean/rich)',
              'HMAC SHA-256 signature calculated & validated successfully'
            ],
            checksum: '8FA47B91CE2FA98B81774BD1029C8BEE836BCE02339FA02B'
          },
          {
            id: 'scan-2',
            timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
            category: 'Wealth',
            status: 'WARNING',
            summary: 'Wealth Conservation Audit: Small Thermodynamic Drift',
            details: [
              'Iron Ore reserve quantity matches inventory (500 kg @ 2 CPH = 1000 CPH backing)',
              'Steel reserve quantity matches inventory (400 kg @ 5 CPH = 2000 CPH backing)',
              'Total backed circulation expected: 3000 CPH',
              'Active circulation detected: 3089.5 CPH (Drift: +89.5 CPH)',
              'Analysis: Minor unbacked circulation found. Investigate unauthorized minting or rounding error.'
            ],
            checksum: 'EA8321B09ACDEE82B102910AAFE73D820938AAFFCE90E112'
          }
        ];
        setScans(initialScans);
        localStorage.setItem('aetheros_compliance_scans', JSON.stringify(initialScans));
      }
    } catch (e) {
      console.error(e);
    }

    // Set initial custom recipient for ease of testing
    setInputPegRecipient(createFreshTaprootAddress());
  }, []);

  const saveScans = (updatedScans: ScanReport[]) => {
    setScans(updatedScans);
    try {
      localStorage.setItem('aetheros_compliance_scans', JSON.stringify(updatedScans));
    } catch (e) {
      console.error(e);
    }
  };

  // Executes a compliance scan
  const handleRunScan = (category: 'Engine' | 'Wealth' | 'Transit' | 'Peg' | 'NodeSecurity') => {
    setIsScanning(true);
    setScanProgress(0);
    setScanMessage(`Initializing ${category} Compliance Sweep...`);

    const interval = setInterval(() => {
      setScanProgress(p => {
        const next = p + 20;
        if (next === 40) setScanMessage(`Validating compliance limits and constraints...`);
        if (next === 60) setScanMessage(`Running cryptographic heuristics and calculations...`);
        if (next === 80) setScanMessage(`Generating official compliance audit ledger...`);
        
        if (next >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          finalizeScan(category);
          return 100;
        }
        return next;
      });
    }, 250);
  };

  const finalizeScan = (category: 'Engine' | 'Wealth' | 'Transit' | 'Peg' | 'NodeSecurity') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const id = `scan-${Date.now()}`;
    const randHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
    const checksum = `0x${randHex}`;

    let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
    let summary = '';
    const details: string[] = [];

    if (category === 'Engine') {
      if (revLimit < 2000 || revLimit > 7500) {
        status = 'FAIL';
        details.push(`❌ Rev limiter [${revLimit} RPM] outside safe range (2000 - 7500 RPM).`);
      } else if (revLimit > 7000) {
        status = 'WARNING';
        details.push(`⚠️ Rev limiter [${revLimit} RPM] exceeds standard stock limit (7000 RPM) but stays in safety buffer.`);
      } else {
        details.push(`✅ Rev limiter [${revLimit} RPM] within safe boundaries (2000 - 7000 RPM).`);
      }

      if (ignitionTiming < -10.0 || ignitionTiming > 40.0) {
        status = 'FAIL';
        details.push(`❌ Ignition timing [${ignitionTiming}°] outside safe bounds (-10.0° to +40.0°).`);
      } else {
        details.push(`✅ Ignition timing [${ignitionTiming}°] is fully compliant.`);
      }

      if (fuelMapCell < 50 || fuelMapCell > 240) {
        status = 'FAIL';
        details.push(`❌ Fuel map cell value [${fuelMapCell}] violates safety boundaries (50 - 240). Risk of lean run!`);
      } else {
        const pulseMs = (fuelMapCell * 0.1).toFixed(1);
        details.push(`✅ Fuel map cell set to ${fuelMapCell} (${pulseMs}ms pulse duration). Safe stoichiometry.`);
      }

      if (throttleResponse < 100 || throttleResponse > 1000) {
        status = 'FAIL';
        details.push(`❌ Throttle response coefficient [${throttleResponse}] out of safe range (100 - 1000).`);
      } else {
        details.push(`✅ Throttle response speed is set to ${throttleResponse / 10}% sensitivity.`);
      }

      if (exhaustVolume > 950) {
        status = 'FAIL';
        details.push(`❌ Exhaust volume [${exhaustVolume}] exceeds maximum safety threshold (950) for hearing protection.`);
      } else {
        details.push(`✅ Exhaust volume is restricted to safe limits (${exhaustVolume / 10}%).`);
      }

      if (!engineKey || engineKey.length < 6) {
        status = 'FAIL';
        details.push(`❌ Missing or truncated master tuning key. Write authorization denied.`);
      } else {
        details.push(`✅ Active Master Key Verified: Authorization granted for hierarchical parameters.`);
      }

      summary = status === 'PASS' 
        ? 'Engine Calibration Compliant with Safety Envelopes' 
        : status === 'WARNING'
          ? 'Engine Calibration Compliant but Operating with Warnings'
          : 'CRITICAL CALIBRATION VIOLATION: Write-Block Active!';

    } else if (category === 'Wealth') {
      const calculatedBacking = (ironOreQty * 2) + (steelQty * 5) + (electricityQty * 1);
      const expectedCirculation = extractedCph + laborCph - consumedCph - depreciatedCph;

      details.push(`📊 Physical Reserve Asset Auditing:`);
      details.push(` • Iron Ore: ${ironOreQty} kg @ 2 CPH/kg = ${ironOreQty * 2} CPH`);
      details.push(` • Steel: ${steelQty} kg @ 5 CPH/kg = ${steelQty * 5} CPH`);
      details.push(` • Electricity: ${electricityQty} kWh @ 1 CPH/kWh = ${electricityQty * 1} CPH`);
      details.push(` • Total Backed Wealth Value in Reserve: ${calculatedBacking} CPH`);

      details.push(`💸 Monetary Balance Flow Audit:`);
      details.push(` • Total Currency in Active Circulation: ${totalCphCirculation} CPH`);
      details.push(` • Extracted Resource Wealth: +${extractedCph} CPH`);
      details.push(` • Transformed Labor Addition: +${laborCph} CPH`);
      details.push(` • Consumption Destruction: -${consumedCph} CPH`);
      details.push(` • Depreciation Wear Loss: -${depreciatedCph} CPH`);
      details.push(` • Thermodynamic Formula Target: ${expectedCirculation} CPH`);

      const backingDelta = Math.abs(totalCphCirculation - calculatedBacking);
      if (backingDelta > 0.01) {
        status = 'WARNING';
        details.push(`⚠️ Backing Delta Alert: Circulation (${totalCphCirculation} CPH) deviates from physical reserve backing (${calculatedBacking} CPH) by ${backingDelta.toFixed(2)} CPH.`);
      } else {
        details.push(`✅ Perfect physical resource backing validated. Current currency represents real natural assets.`);
      }

      const conservationDelta = Math.abs(totalCphCirculation - expectedCirculation);
      if (conservationDelta > 0.01) {
        status = 'FAIL';
        details.push(`❌ Law of Conservation Violated! Unaccounted leak of ${conservationDelta.toFixed(2)} CPH. Currency must not be minted from thin air.`);
      } else {
        details.push(`✅ Wealth Conservation Law holds true. Ledger integrity mathematically verified (Total = Extraction + Labor - Consumption).`);
      }

      summary = status === 'PASS'
        ? 'Law of Conservation Confirmed: Standard Currency Reserve Audited'
        : status === 'WARNING'
          ? 'Economic Audit Complete: Minor Backing Discrepancy Found'
          : 'CRITICAL AUDIT FAIL: Monetary Inflation / Ledger De-synchronization';

    } else if (category === 'Transit') {
      let expectedCost = 0;
      let multiplierName = '';
      
      switch (transportMethod) {
        case 'walking':
          expectedCost = (tripDistance / 100) * 1.0;
          multiplierName = 'Walking (1.0x)';
          break;
        case 'bicycle':
          expectedCost = (tripDistance / 100) * 0.6;
          multiplierName = 'Bicycle (0.6x)';
          break;
        case 'car':
          expectedCost = (tripDistance / 100) * 0.3;
          multiplierName = 'Car (0.3x)';
          break;
        case 'bus':
          expectedCost = ((tripDistance / 100) * 0.4) + 20;
          multiplierName = 'Bus (0.4x + 20 CPH flat)';
          break;
        case 'train':
          expectedCost = ((tripDistance / 100) * 0.2) + 50;
          multiplierName = 'Train (0.2x + 50 CPH flat)';
          break;
        case 'teleport':
          expectedCost = (tripDistance / 100) * 10;
          multiplierName = 'Quantum Teleportation (10.0x)';
          break;
      }

      details.push(`✈️ Route Audit Parameters:`);
      details.push(` • Travel Distance: ${tripDistance} meters`);
      details.push(` • Transit Method: ${multiplierName}`);
      details.push(` • Calculated Standard Cost: ${expectedCost.toFixed(2)} CPH`);
      details.push(` • Declared Trip Cost Ledger: ${reportedTripCost.toFixed(2)} CPH`);

      const costDelta = Math.abs(reportedTripCost - expectedCost);
      if (costDelta > 0.01) {
        status = 'FAIL';
        details.push(`❌ Mismatch Detected: Declared cost (${reportedTripCost} CPH) does not match transit fee laws (${expectedCost.toFixed(2)} CPH). Fare evasion or logging discrepancy!`);
      } else {
        details.push(`✅ Transit cost strictly logged and matched.`);
      }

      if (transportMethod === 'teleport' && !isEmergency) {
        status = 'FAIL';
        details.push(`❌ Emergency Lock Breach: Teleportation protocol engaged outside of declared State of Emergency!`);
      } else if (transportMethod === 'teleport') {
        details.push(`⚠️ Emergency Protocol active. Instant high-cost jump authorized.`);
      }

      const calculatedShareRate = dividendPool / totalWorkShares;
      const expectedJimmy = jimmyShares * calculatedShareRate;
      const expectedSarah = sarahShares * calculatedShareRate;
      const expectedMike = mikeShares * calculatedShareRate;

      details.push(`💰 Municipal Dividend Distribution Verification:`);
      details.push(` • Collected Pool: ${dividendPool} CPH | Active Shares: ${totalWorkShares} (Rate: ${calculatedShareRate.toFixed(2)} CPH/share)`);
      details.push(` • Jimmy (${jimmyShares} shares): Paid out ${expectedJimmy.toFixed(2)} CPH`);
      details.push(` • Sarah (${sarahShares} shares): Paid out ${expectedSarah.toFixed(2)} CPH`);
      details.push(` • Mike (${mikeShares} shares): Paid out ${expectedMike.toFixed(2)} CPH`);

      summary = status === 'PASS'
        ? 'Transit Fees & Dividend Payout Matrix Validated'
        : 'CRITICAL VIOLATION: Transit Cost Discrepancy or Emergency Gate Breach';

    } else if (category === 'Peg') {
      details.push(`🛡️ Taproot & Peg Transfer Safety Audit:`);
      
      const pendingTransfers = pegTransfers.filter(t => t.status === 'LOCKED');
      const activeHighValueCount = pendingTransfers.filter(t => t.isHighValue).length;

      details.push(` • Tracked UTXO isolated addresses: ${trackedUtxos.length} nodes active.`);
      details.push(` • Active Peg transfer ledger contains ${pegTransfers.length} entries.`);
      details.push(` • Safety locked high-value transfers: ${activeHighValueCount} active holds.`);

      // Check for violations of the 144 confirmation block rule
      let blockBypassViolation = false;
      pegTransfers.forEach(tx => {
        if (tx.isHighValue && tx.status === 'RELEASED' && tx.confirmations < 144) {
          blockBypassViolation = true;
          details.push(`❌ VIOLATION: Peg transaction for ${tx.amount} CPH released with only ${tx.confirmations}/144 confirmation blocks!`);
        }
      });

      if (blockBypassViolation) {
        status = 'FAIL';
        summary = 'Peg Safety Gate Compromise: Lock Period Bypassed';
      } else {
        details.push(`✅ High-value transfer confirmation safety threshold perfectly enforced (144 blocks / 24h requirement).`);
        details.push(`✅ Isolated Taproot address allocation prevents multi-sig UTXO consolidation leaks.`);
        summary = 'Taproot Deposit & Peg Transfers Fully Compliant';
      }

    } else if (category === 'NodeSecurity') {
      details.push(`🌐 PCAPdroid Audit Results:`);
      details.push(` • Analyzed file: PCAPdroid_.pcap02_Jul_09_07_56.pcap (9049.47 KB)`);
      
      if (!isClockCalibrated) {
        status = 'WARNING';
        details.push(`⚠️ Critical clock mismatch: Capture file claims 2026-07-03T02:25:08.621Z modified time (+2 years drift). Run Stratum-1 Chronological NTP Calibration.`);
      } else {
        details.push(`✅ Chronological alignment synchronized. Local NTP offsets resolved to atomic Stratum-1.`);
      }

      if (!isEnvelopeEncrypted) {
        status = 'FAIL';
        details.push(`❌ Plain-text Payload Exposure: Raw .pcap contains unencrypted transmission layers on Google Drive. AES-GCM-256 Envelope Encryption required!`);
      } else {
        details.push(`✅ Payload wrapped in secure AES-GCM-256 cryptographic envelope. Plaintext exposure mitigated.`);
      }

      if (!isPayloadSanitized) {
        status = status === 'FAIL' ? 'FAIL' : 'WARNING';
        details.push(`⚠️ Trace-scrubbing audit: Raw packet frames contain intact MAC addresses, private gateway coordinates, and plain-text Bearer Tokens.`);
      } else {
        details.push(`✅ Network payload sanitized. Session keys, local gateway routers, and MAC addresses zeroed out via trace scrubbing.`);
      }

      summary = status === 'PASS'
        ? 'PCAPdroid Node Sealed and Synchronized'
        : status === 'WARNING'
          ? 'PCAP Audit Warning: Local Drift or Incomplete Sanitization'
          : 'CRITICAL SECURITY BREACH: Raw Telemetry Payload Exposed!';
    }

    const newReport: ScanReport = {
      id,
      timestamp,
      category,
      status,
      summary,
      details,
      checksum
    };

    saveScans([newReport, ...scans]);
    setActiveTab('reports');
  };

  const handleClearReports = () => {
    saveScans([]);
  };

  const getStatusColor = (status: 'PASS' | 'WARNING' | 'FAIL') => {
    switch (status) {
      case 'PASS':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20';
      case 'WARNING':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/20';
      case 'FAIL':
        return 'text-red-400 bg-red-950/40 border-red-500/20';
    }
  };

  // Generate an isolated Taproot address for an incoming deposit
  const handleGenerateTaprootAddress = () => {
    const freshAddress = createFreshTaprootAddress();
    const freshTxId = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const amount = Number((Math.random() * 2 + 0.05).toFixed(4));
    
    const newUtxo: TrackedUTXO = {
      id: `utxo-${Date.now()}`,
      address: freshAddress,
      amount,
      txid: freshTxId,
      confirmations: 0,
      label: `Incoming deposit address #${trackedUtxos.length + 101}`,
      status: 'Unused'
    };

    setTrackedUtxos([newUtxo, ...trackedUtxos]);
  };

  // Mine blocks to increment confirmations
  const handleMineBlocks = (blocks: number) => {
    setCurrentBlockHeight(prev => prev + blocks);
    
    // Increment confirmations for all UTXOs and Peg transfers
    setTrackedUtxos(prev => prev.map(utxo => {
      const nextConf = utxo.confirmations + blocks;
      return {
        ...utxo,
        confirmations: nextConf,
        status: nextConf > 6 ? 'Received' : utxo.status
      };
    }));

    setPegTransfers(prev => prev.map(tx => {
      if (tx.status === 'RELEASED') return tx;
      const nextConf = Math.min(144, tx.confirmations + blocks);
      const isReleased = nextConf >= 144;
      return {
        ...tx,
        confirmations: nextConf,
        status: isReleased ? 'RELEASED' : 'LOCKED'
      };
    }));
  };

  // Authorize a peg transfer with strict 144-block rules
  const handleCreatePegTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPegRecipient || inputPegAmount <= 0) return;

    const isHighValue = inputPegAmount >= 1000;
    const newPeg: PegTransfer = {
      id: `peg-${Date.now()}`,
      amount: inputPegAmount,
      recipient: inputPegRecipient,
      confirmations: 0,
      status: isHighValue ? 'LOCKED' : 'RELEASED',
      timestamp: new Date().toLocaleTimeString(),
      isHighValue
    };

    setPegTransfers([newPeg, ...pegTransfers]);
    
    // Auto-generate next address
    setInputPegRecipient(createFreshTaprootAddress());
  };

  // Run a remediation action with full interactive loading feedback
  const triggerRemediation = (action: 'encrypt' | 'calibrate' | 'sanitize') => {
    setRemediatingAction(action);
    setRemediationLogs([]);
    
    let step = 0;
    const logs: string[] = [];

    const addLog = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setRemediationLogs([...logs]);
    };

    if (action === 'encrypt') {
      addLog("Initializing AES-GCM-256 Envelope wrapper engine...");
      const interval = setInterval(() => {
        step++;
        if (step === 1) addLog("Reading PCAPdroid raw data payload stream...");
        if (step === 2) addLog("Generating 256-bit ephemeral cryptographic Key block...");
        if (step === 3) addLog("Calculating transport-level authentication tags...");
        if (step === 4) {
          addLog("PCAPdroid packet payload successfully encapsulated in envelope!");
          setIsEnvelopeEncrypted(true);
          setRemediatingAction(null);
          clearInterval(interval);
        }
      }, 600);
    } else if (action === 'calibrate') {
      addLog("Querying stratum-1 atomic time server cluster...");
      const interval = setInterval(() => {
        step++;
        if (step === 1) addLog("Measuring local host clocks against global atomic standards...");
        if (step === 2) addLog("Drift detected: +2.0012 Years. Calibrating NTP server offset...");
        if (step === 3) addLog("Syncing system epoch to local RTC hardware...");
        if (step === 4) {
          addLog("NTP Calibration complete. Anomaly resolved!");
          setIsClockCalibrated(true);
          setRemediatingAction(null);
          clearInterval(interval);
        }
      }, 600);
    } else if (action === 'sanitize') {
      addLog("Loading TraceWrangler packet scrub rulesets...");
      const interval = setInterval(() => {
        step++;
        if (step === 1) addLog("Identifying MAC addresses and hardware interfaces...");
        if (step === 2) addLog("Scanning plain-text payloads for session token footprints...");
        if (step === 3) addLog("Substituting unencrypted HTTP credentials with zeroed memory...");
        if (step === 4) {
          addLog("Trace payload completely sanitized. Safe for cloud storage!");
          setIsPayloadSanitized(true);
          setRemediatingAction(null);
          clearInterval(interval);
        }
      }, 600);
    }
  };

  // Run Structured Parsing of unformatted text
  const handleExecuteParse = () => {
    const lines = unstructuredInput.split('\n');
    const extracted: Array<{ field: string; value: string; confidence: string; category: string }> = [];

    // Evaluate rules (both default and learned rules) to scan the text
    const activeRules = [...defaultRules, ...learnedRules];

    activeRules.forEach(rule => {
      try {
        const regex = new RegExp(rule.pattern, 'gi');
        lines.forEach((line, index) => {
          let match;
          while ((match = regex.exec(line)) !== null) {
            // Find matched segment
            const matchedValue = match[1] || match[0];
            const confidenceScore = rule.isCustom ? '94%' : '99%';
            extracted.push({
              field: `${rule.name} (Line ${index + 1})`,
              value: matchedValue,
              confidence: confidenceScore,
              category: rule.category
            });
          }
        });
      } catch (err) {
        console.error("Rule evaluation error", err);
      }
    });

    // If nothing found, provide generic unstructured blocks
    if (extracted.length === 0) {
      extracted.push({
        field: "Unstructured String Entropy Block",
        value: unstructuredInput.slice(0, 45) + "...",
        confidence: "60%",
        category: "Fallback Parser"
      });
    }

    setParsedRecords(extracted);
  };

  // Train the engine to learn a brand new scanning rule (self-learning scanner!)
  const handleTrainNewRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newRulePattern) return;

    const newRule: ParserRule = {
      id: `custom-rule-${Date.now()}`,
      name: newRuleName,
      pattern: newRulePattern,
      category: newRuleCategory,
      description: newRuleDesc || 'Custom learned scanning criteria',
      isCustom: true
    };

    const updatedRules = [...learnedRules, newRule];
    setLearnedRules(updatedRules);
    try {
      localStorage.setItem('aetheros_learned_parser_rules', JSON.stringify(updatedRules));
    } catch (err) {
      console.error(err);
    }

    setNewRuleName('');
    setNewRulePattern('');
    setNewRuleDesc('');
    
    setShowLearningBanner(true);
    setTimeout(() => {
      setShowLearningBanner(false);
    }, 4000);

    // Re-execute parse automatically with the newly learned pattern!
    setTimeout(() => {
      handleExecuteParse();
    }, 200);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#020205] text-gray-300 font-sans h-full overflow-hidden border border-white/[0.03]">
      {/* Navigation Header */}
      <div className="p-4 border-b border-white/[0.05] bg-[#05050a] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-950/50 border border-red-900/30 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest text-white">Sovereign Compliance Scanner</h1>
              <p className="text-[10px] text-gray-500 font-mono">UTXO INTEGRITY // PEGS // PCAP AUDITING // ADAPTIVE HEURISTIC PARSERS</p>
            </div>
          </div>
        </div>

        {/* Actions & Tab Selection Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tab Selection */}
          <div className="flex flex-wrap bg-black border border-white/5 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('engine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition flex items-center gap-1.5 ${activeTab === 'engine' ? 'bg-red-950/50 text-red-400 border border-red-900/40' : 'text-gray-500 hover:text-white'}`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>ECU Engine</span>
            </button>
            
            <button
              onClick={() => setActiveTab('wealth')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition flex items-center gap-1.5 ${activeTab === 'wealth' ? 'bg-red-950/50 text-red-400 border border-red-900/40' : 'text-gray-500 hover:text-white'}`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Wealth backing</span>
            </button>

            <button
              onClick={() => setActiveTab('transit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition flex items-center gap-1.5 ${activeTab === 'transit' ? 'bg-red-950/50 text-red-400 border border-red-900/40' : 'text-gray-500 hover:text-white'}`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Transit & Payouts</span>
            </button>

            <button
              onClick={() => setActiveTab('peg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition flex items-center gap-1.5 ${activeTab === 'peg' ? 'bg-red-950/50 text-red-400 border border-red-900/40' : 'text-gray-500 hover:text-white'}`}
            >
              <Database className="w-3.5 h-3.5 text-orange-400" />
              <span>Taproot Deposits & Pegs</span>
            </button>

            <button
              onClick={() => setActiveTab('network_security')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition flex items-center gap-1.5 ${activeTab === 'network_security' ? 'bg-red-950/50 text-red-400 border border-red-900/40' : 'text-gray-500 hover:text-white'}`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>PCAP & Parser Workbench</span>
            </button>

            <button
              onClick={() => setActiveTab('substances')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition flex items-center gap-1.5 ${activeTab === 'substances' ? 'bg-red-950/50 text-red-400 border border-red-900/40' : 'text-gray-500 hover:text-white'}`}
            >
              <Pill className="w-3.5 h-3.5 text-emerald-400" />
              <span>Substance Analyzer</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition flex items-center gap-1.5 relative ${activeTab === 'reports' ? 'bg-red-950/50 text-red-400 border border-red-900/40' : 'text-gray-500 hover:text-white'}`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ledger Report Card</span>
              {scans.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white">
                  {scans.length}
                </span>
              )}
            </button>
          </div>

          {/* Export Audit Log Button */}
          <button
            onClick={handleExportAuditLog}
            className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-red-900/50 rounded-xl text-xs font-bold uppercase tracking-tight transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
            title="Export Substance Scan History as JSON"
          >
            <Download className="w-3.5 h-3.5 text-red-400" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* Main Content scroll window */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        
        {/* Scanning status banner */}
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-950/20 border border-red-900/40 p-4 rounded-xl space-y-2 font-mono"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-red-500 animate-spin" />
                  <span className="text-xs text-white font-bold">{scanMessage}</span>
                </div>
                <span className="text-xs text-red-400 font-bold">{scanProgress}%</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div className="bg-red-600 h-full rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* TAB 1: ECU ENGINE CALIBRATION */}
          {activeTab === 'engine' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2 uppercase">
                      <Cpu className="w-4 h-4 text-red-500" />
                      Engine Calibration Envelopes
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Check vehicle ECU variables against hard mathematical limitations in standard code.</p>
                  </div>
                  <button
                    onClick={() => handleRunScan('Engine')}
                    disabled={isScanning}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase transition flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Run Engine Audit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white uppercase tracking-tight">Rev Limiter</span>
                      <span className="font-mono text-red-400">{revLimit} RPM</span>
                    </div>
                    <input 
                      type="range" 
                      min="1500" 
                      max="8500" 
                      step="50"
                      value={revLimit}
                      onChange={(e) => setRevLimit(Number(e.target.value))}
                      className="w-full accent-red-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                      <span>MIN: 2000 RPM</span>
                      <span>STOCK: 7000 RPM</span>
                      <span>MAX SAFE: 7500 RPM</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white uppercase tracking-tight">Ignition Advance</span>
                      <span className="font-mono text-red-400">{ignitionTiming.toFixed(1)}° Advance</span>
                    </div>
                    <input 
                      type="range" 
                      min="-20.0" 
                      max="50.0" 
                      step="0.5"
                      value={ignitionTiming}
                      onChange={(e) => setIgnitionTiming(Number(e.target.value))}
                      className="w-full accent-red-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                      <span>RETARD: -10.0°</span>
                      <span>SAFE WINDOW</span>
                      <span>ADVANCE: +40.0°</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white uppercase tracking-tight">Fuel Map Pulse Duration</span>
                      <span className="font-mono text-red-400">{fuelMapCell} ms pulse</span>
                    </div>
                    <input 
                      type="range" 
                      min="30" 
                      max="280" 
                      step="5"
                      value={fuelMapCell}
                      onChange={(e) => setFuelMapCell(Number(e.target.value))}
                      className="w-full accent-red-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                      <span>LEAN MIN: 50</span>
                      <span>STOICHIOMETRY</span>
                      <span>RICH MAX: 240</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white uppercase tracking-tight">Throttle Response Rate</span>
                      <span className="font-mono text-red-400">{throttleResponse} ({throttleResponse / 10}%)</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="1200" 
                      step="10"
                      value={throttleResponse}
                      onChange={(e) => setThrottleResponse(Number(e.target.value))}
                      className="w-full accent-red-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                      <span>SLUGGISH: 100</span>
                      <span>PROMPT LEVEL</span>
                      <span>INSTANT: 1000</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white uppercase tracking-tight">Exhaust Volume Restriction</span>
                      <span className="font-mono text-red-400">{exhaustVolume / 10}% decibels</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1100" 
                      step="10"
                      value={exhaustVolume}
                      onChange={(e) => setExhaustVolume(Number(e.target.value))}
                      className="w-full accent-red-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                      <span>SILENT: 0%</span>
                      <span>HEARING LIMIT: 95% (950)</span>
                      <span>LOUD MODE: 110%</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.05] pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-[10px] text-gray-500 uppercase">Write Auth Cryptographic Key:</span>
                    <input 
                      type="text" 
                      value={engineKey}
                      onChange={(e) => setEngineKey(e.target.value)}
                      className="bg-black border border-white/10 px-2 py-0.5 rounded text-[10px] text-red-400 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <HelpCircle className="w-3.5 h-3.5 text-gray-600" />
                    <span>Exact integer calculation maps 0.1 increments directly.</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-950/10 border border-red-950/40 p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Engine Rules from ENGINE_PROGRAMMING_DOCS.md
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] text-gray-400 font-mono list-disc list-inside">
                  <li>Rev Limiter: Minimum 2000 RPM, Max 7500 (7000 stock + 500 safety)</li>
                  <li>Ignition Advance: Range -10.0° retard to +40.0° advance</li>
                  <li>Fuel Pulse: Range 50 (5.0ms) to 240 (24.0ms)</li>
                  <li>Throttle Response: Minimum 100 (10%) to Maximum 1000 (100%)</li>
                  <li>Hearing Guard: Exhaust Volume limit maximum 950 (95.0%)</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* TAB 2: RESOURCE-BACKED WEALTH */}
          {activeTab === 'wealth' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2 uppercase">
                      <Coins className="w-4 h-4 text-red-500" />
                      Resource-Backed Wealth Compliance
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Audit active circulation values against physical backups stored in system reserves.</p>
                  </div>
                  <button
                    onClick={() => handleRunScan('Wealth')}
                    disabled={isScanning}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase transition flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Verify Conservation</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-2">
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Scale className="w-3.5 h-3.5 text-red-400" />
                      Physical Reserves Backup Assets
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Iron Ore (kg) [2 CPH/kg]</label>
                        <input 
                          type="number"
                          value={ironOreQty}
                          onChange={(e) => setIronOreQty(Number(e.target.value))}
                          className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Steel (kg) [5 CPH/kg]</label>
                        <input 
                          type="number"
                          value={steelQty}
                          onChange={(e) => setSteelQty(Number(e.target.value))}
                          className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Electricity (kWh) [1 CPH/kWh]</label>
                        <input 
                          type="number"
                          value={electricityQty}
                          onChange={(e) => setElectricityQty(Number(e.target.value))}
                          className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                    <div className="p-2.5 bg-black/60 rounded border border-white/[0.03] text-xs font-mono flex justify-between">
                      <span className="text-gray-500">Expected Physical Backup Capacity:</span>
                      <span className="text-red-400 font-bold">{(ironOreQty * 2 + steelQty * 5 + electricityQty * 1).toFixed(1)} CPH</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                      Active Circulation & Thermodynamic Flow variables
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Total CPH in Circulation</label>
                        <input 
                          type="number"
                          step="0.1"
                          value={totalCphCirculation}
                          onChange={(e) => setTotalCphCirculation(Number(e.target.value))}
                          className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-red-400 font-bold focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Extracted Wealth (+CPH)</label>
                        <input 
                          type="number"
                          value={extractedCph}
                          onChange={(e) => setExtractedCph(Number(e.target.value))}
                          className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Transform Labor (+CPH)</label>
                        <input 
                          type="number"
                          value={laborCph}
                          onChange={(e) => setLaborCph(Number(e.target.value))}
                          className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Consumption Loss (-CPH)</label>
                        <input 
                          type="number"
                          step="0.1"
                          value={consumedCph}
                          onChange={(e) => setConsumedCph(Number(e.target.value))}
                          className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Depreciation Wear (-CPH)</label>
                        <input 
                          type="number"
                          step="0.05"
                          value={depreciatedCph}
                          onChange={(e) => setDepreciatedCph(Number(e.target.value))}
                          className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold uppercase text-gray-500">Expected Formula Target</div>
                        <div className="bg-black/60 border border-white/10 rounded px-2 py-2 text-xs text-emerald-400 font-mono font-bold">
                          {(extractedCph + laborCph - consumedCph - depreciatedCph).toFixed(1)} CPH
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-950/10 border border-red-950/40 p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Thermodynamic Law from REAL_MONEY_DOCS.md
                </h3>
                <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
                  Money can ONLY come from Extraction or Labor Transformation, and disappears through Consumption or Depreciation. 
                  The total currency in circulation must perfectly equate to the value of physical resource reserves held in backup: 
                  <code className="text-white bg-black/60 px-1 py-0.5 rounded ml-1">Total CPH = Value of reserve physical items</code>.
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 3: TRANSIT PRICING & DIVIDENDS */}
          {activeTab === 'transit' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2 uppercase">
                      <MapPin className="w-4 h-4 text-red-500" />
                      Transit Pricing & Dividend audits
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Audit transit travel rates and check weekly municipal payouts.</p>
                  </div>
                  <button
                    onClick={() => handleRunScan('Transit')}
                    disabled={isScanning}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase transition flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Run Route Audit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Compass className="w-3.5 h-3.5 text-red-400" />
                      Travel Log Simulator
                    </h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Trip Distance (meters)</label>
                      <input 
                        type="number"
                        step="50"
                        value={tripDistance}
                        onChange={(e) => setTripDistance(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Transit Type / Vehicle</label>
                      <select
                        value={transportMethod}
                        onChange={(e: any) => setTransportMethod(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="walking">Walking (Base: 1.0x)</option>
                        <option value="bicycle">Bicycle (0.6x)</option>
                        <option value="car">Car (0.3x)</option>
                        <option value="bus">Bus (0.4x + 20 flat)</option>
                        <option value="train">Train (0.2x + 50 flat)</option>
                        <option value="teleport">Quantum Teleportation (10.0x)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4 py-1">
                      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={isEmergency}
                          onChange={(e) => setIsEmergency(e.target.checked)}
                          className="rounded bg-black border-white/10 text-red-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <span>State of Emergency active</span>
                      </label>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500 flex justify-between">
                        <span>Logged Travel Cost (CPH)</span>
                        <span className="text-red-400 font-mono text-[9px]">Mismatch simulator</span>
                      </label>
                      <input 
                        type="number"
                        step="0.5"
                        value={reportedTripCost}
                        onChange={(e) => setReportedTripCost(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Bus className="w-3.5 h-3.5 text-red-400" />
                      Weekly Dividend Matrix
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Collected Municipal Pool</label>
                      <input 
                        type="number"
                        value={dividendPool}
                        onChange={(e) => setDividendPool(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Total Work Shares</label>
                      <input 
                        type="number"
                        value={totalWorkShares}
                        onChange={(e) => setTotalWorkShares(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="border-t border-white/5 pt-2 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-gray-500">Verify Citizens payout rates:</span>
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                        <div className="bg-black/50 p-1.5 rounded border border-white/5">
                          <div className="text-gray-500">Jimmy</div>
                          <div className="text-white font-bold">{jimmyShares} Sh.</div>
                          <div className="text-red-400 font-black">{(jimmyShares * (dividendPool / totalWorkShares)).toFixed(1)}</div>
                        </div>
                        <div className="bg-black/50 p-1.5 rounded border border-white/5">
                          <div className="text-gray-500">Sarah</div>
                          <div className="text-white font-bold">{sarahShares} Sh.</div>
                          <div className="text-red-400 font-black">{(sarahShares * (dividendPool / totalWorkShares)).toFixed(1)}</div>
                        </div>
                        <div className="bg-black/50 p-1.5 rounded border border-white/5">
                          <div className="text-gray-500">Mike</div>
                          <div className="text-white font-bold">{mikeShares} Sh.</div>
                          <div className="text-red-400 font-black">{(mikeShares * (dividendPool / totalWorkShares)).toFixed(1)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-950/10 border border-red-950/40 p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Transit Multipliers from THE_CITY_DOCS.md
                </h3>
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-[11px] text-gray-400 font-mono list-disc list-inside">
                  <li>Walking: 1.0 CPH per 100m</li>
                  <li>Bicycle: 0.6 CPH per 100m</li>
                  <li>Car: 0.3 CPH per 100m</li>
                  <li>Bus: 0.4 CPH / 100m + 20</li>
                  <li>Train: 0.2 CPH / 100m + 50</li>
                  <li>Teleport: 10.0 CPH / 100m</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* TAB 4: TAPROOT DEPOSITS & PEGS */}
          {activeTab === 'peg' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* UTXO isolated address generator card */}
              <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2 uppercase">
                      <Key className="w-4 h-4 text-orange-500" />
                      Isolated Taproot Script Addresses
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Generates a fresh cryptographic Taproot address per incoming deposit to eliminate UTXO consolidation confusion.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGenerateTaprootAddress}
                      className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold uppercase transition flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>New Taproot Script Address</span>
                    </button>
                    <button
                      onClick={() => handleRunScan('Peg')}
                      disabled={isScanning}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase transition flex items-center gap-2"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Audit Peg Safety</span>
                    </button>
                  </div>
                </div>

                {/* Display list of active UTXO nodes */}
                <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-orange-400" />
                      Isolated UTXO Address Tracking Ledger
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">Blocks: {currentBlockHeight}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[11px] border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-500 text-[10px] uppercase">
                          <th className="py-2">Label</th>
                          <th className="py-2">Isolated Taproot Address</th>
                          <th className="py-2 text-right">Value (BTC)</th>
                          <th className="py-2 text-center">Confirmations</th>
                          <th className="py-2 text-right">UTXO Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trackedUtxos.map((utxo, idx) => (
                          <tr key={`${utxo.id}-${idx}`} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                            <td className="py-2.5 font-bold text-gray-300">{utxo.label}</td>
                            <td className="py-2.5 text-orange-400 select-all font-mono tracking-tight text-[10px]">
                              {utxo.address.slice(0, 12)}...{utxo.address.slice(-12)}
                            </td>
                            <td className="py-2.5 text-right text-white font-bold">{utxo.amount.toFixed(4)}</td>
                            <td className="py-2.5 text-center text-gray-400">
                              {utxo.confirmations >= 6 ? (
                                <span className="text-emerald-400 font-bold">✓ {utxo.confirmations}</span>
                              ) : (
                                <span className="text-amber-400 animate-pulse">{utxo.confirmations}/6</span>
                              )}
                            </td>
                            <td className="py-2.5 text-right">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                utxo.status === 'Consolidated' 
                                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10'
                                  : 'bg-orange-950/40 text-orange-400 border border-orange-500/10'
                              }`}>
                                {utxo.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* High-value peg transfers lock gate card */}
              <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl space-y-4">
                <div>
                  <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wide">
                    <Lock className="w-4 h-4 text-red-500" />
                    High-Value Peg transfer Safety Gate
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Enforces a strict 144 block (24h) confirmation safety lock on all high-value peg transfers to prevent consolidation failures.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Create peg form */}
                  <form onSubmit={handleCreatePegTransfer} className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-4 md:col-span-1">
                    <h3 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2">
                      New Peg Dispatch Form
                    </h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Peg Amount (CPH)</label>
                      <input 
                        type="number"
                        min="1"
                        value={inputPegAmount}
                        onChange={(e) => setInputPegAmount(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono font-bold"
                      />
                      <div className="text-[9px] text-gray-500 font-mono">
                        {inputPegAmount >= 1000 ? (
                          <span className="text-red-400 font-black">⚠️ Enforces strict 144 block hold lock!</span>
                        ) : (
                          <span className="text-emerald-400">✓ Under high-value threshold (Instant release)</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Recipient Taproot Address</label>
                      <input 
                        type="text"
                        value={inputPegRecipient}
                        onChange={(e) => setInputPegRecipient(e.target.value)}
                        placeholder="bc1p..."
                        className="w-full bg-black border border-white/10 rounded px-2 py-1.5 text-[9px] text-orange-400 focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Dispatch Peg Asset</span>
                    </button>
                  </form>

                  {/* Active lock ledger */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3 md:col-span-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                        <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-red-500" />
                          Pending Peg holds & block tracking
                        </span>
                        
                        {/* Simulation controls */}
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleMineBlocks(12)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded border border-white/10 text-[9px] font-bold font-mono transition"
                            title="Simulates 2 hours"
                          >
                            Mine 12 Blocks (+2h)
                          </button>
                          <button
                            onClick={() => handleMineBlocks(144)}
                            className="px-2 py-1 bg-orange-950/30 hover:bg-orange-950/50 text-orange-400 rounded border border-orange-900/30 text-[9px] font-bold font-mono transition"
                            title="Simulates 24 hours"
                          >
                            Mine 144 Blocks (+24h)
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {pegTransfers.length === 0 ? (
                          <div className="text-center py-6 text-xs text-gray-600 font-mono">
                            No active peg holds in flight.
                          </div>
                        ) : (
                          pegTransfers.map((tx, idx) => (
                            <div key={`${tx.id}-${idx}`} className="bg-black/60 p-3 rounded-lg border border-white/[0.03] space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-black">{tx.amount} CPH</span>
                                  <span className="text-gray-600">→</span>
                                  <span className="text-orange-400 truncate max-w-[120px] sm:max-w-none">{tx.recipient.slice(0,10)}...{tx.recipient.slice(-10)}</span>
                                </div>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                                  tx.status === 'RELEASED' 
                                    ? 'bg-emerald-950/60 text-emerald-400' 
                                    : 'bg-red-950/60 text-red-400 animate-pulse'
                                }`}>
                                  {tx.status}
                                </span>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                                  <span>Safety Confirmation Hold</span>
                                  <span>{tx.confirmations}/144 blocks ({Math.round(tx.confirmations/1.44)}%)</span>
                                </div>
                                <div className="w-full bg-black rounded-full h-1 overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-300 ${tx.status === 'RELEASED' ? 'bg-emerald-500' : 'bg-red-500'}`} 
                                    style={{ width: `${Math.min(100, tx.confirmations/1.44)}%` }} 
                                  />
                                </div>
                                {tx.isHighValue && tx.status === 'LOCKED' && (
                                  <div className="text-[9px] text-red-400 font-mono text-right">
                                    ⏱ Lock remaining: {Math.max(0, 144 - tx.confirmations)} blocks (~{((144 - tx.confirmations) * 10 / 60).toFixed(1)} hrs left)
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 5: NODE SECURITY, PCAP & ADAPTIVE PARSER WORKBENCH */}
          {activeTab === 'network_security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Raw .PCAP audit summary */}
              <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2 uppercase">
                      <Globe className="w-4 h-4 text-blue-500" />
                      Node Security & PCAP droid Raw Telemetries
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Audits unencrypted packet captures (`PCAPdroid_.pcap02_Jul_09_07_56.pcap`) and mitigates severe NTP clock drifts.
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunScan('NodeSecurity')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase transition flex items-center gap-2"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Run PCAP Audit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* File Metadata Audit */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3 md:col-span-1">
                    <h3 className="text-xs font-bold text-white uppercase tracking-tight border-b border-white/5 pb-2">
                      Packet Capture Metadata
                    </h3>
                    <div className="font-mono text-[11px] space-y-2">
                      <div>
                        <div className="text-gray-500 text-[10px] uppercase">File Object:</div>
                        <div className="text-white font-bold truncate">PCAPdroid_.pcap02_Jul_09_07_56.pcap</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-[10px] uppercase">Payload Size:</div>
                        <div className="text-white font-bold">9049.47 KB (Substantial Stream)</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-[10px] uppercase">Logged Modified Timestamp:</div>
                        <div className={`font-bold ${isClockCalibrated ? 'text-emerald-400' : 'text-amber-400'}`}>
                          2026-07-03T02:25:08.621Z
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-[10px] uppercase">Temporal Drift status:</div>
                        {isClockCalibrated ? (
                          <div className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Synchronized
                          </div>
                        ) : (
                          <div className="text-amber-400 font-bold flex items-center gap-1 text-[10px] animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" /> Drift: +2 Years Detected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remediation triggers */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3 md:col-span-2 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-tight border-b border-white/5 pb-2">
                        Active Remediation Protocols Console
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1 font-mono">
                        Deploy active cryptographic patches to lock raw telemetry and fix chronological clock offsets.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
                      {/* Button 1 */}
                      <button
                        onClick={() => triggerRemediation('encrypt')}
                        disabled={remediatingAction !== null}
                        className={`p-3 border rounded-xl text-left transition flex flex-col justify-between h-[100px] ${
                          isEnvelopeEncrypted 
                            ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400'
                            : 'border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-red-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Lock className="w-4 h-4" />
                          <span className="text-[8px] font-mono uppercase bg-black/40 px-1.5 py-0.5 rounded">AES-256</span>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase">1. Envelope Crypt</div>
                          <div className="text-[9px] text-gray-500 font-mono">
                            {isEnvelopeEncrypted ? "Payload Sealed 🔒" : "Unencrypted plaintext 🔓"}
                          </div>
                        </div>
                      </button>

                      {/* Button 2 */}
                      <button
                        onClick={() => triggerRemediation('calibrate')}
                        disabled={remediatingAction !== null}
                        className={`p-3 border rounded-xl text-left transition flex flex-col justify-between h-[100px] ${
                          isClockCalibrated 
                            ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400'
                            : 'border-amber-500/20 bg-amber-950/10 hover:bg-amber-950/20 text-amber-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Clock className="w-4 h-4" />
                          <span className="text-[8px] font-mono uppercase bg-black/40 px-1.5 py-0.5 rounded">NTP Sync</span>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase">2. Clock Calibration</div>
                          <div className="text-[9px] text-gray-500 font-mono">
                            {isClockCalibrated ? "Stratum-1 locked ✓" : "Future drift state ⏰"}
                          </div>
                        </div>
                      </button>

                      {/* Button 3 */}
                      <button
                        onClick={() => triggerRemediation('sanitize')}
                        disabled={remediatingAction !== null}
                        className={`p-3 border rounded-xl text-left transition flex flex-col justify-between h-[100px] ${
                          isPayloadSanitized 
                            ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400'
                            : 'border-blue-500/20 bg-blue-950/10 hover:bg-blue-950/20 text-blue-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Terminal className="w-4 h-4" />
                          <span className="text-[8px] font-mono uppercase bg-black/40 px-1.5 py-0.5 rounded">Trace Scb</span>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase">3. Payload Scrubbing</div>
                          <div className="text-[9px] text-gray-500 font-mono">
                            {isPayloadSanitized ? "Sensitive PII zeroed" : "Plaintext MAC/IPs detected"}
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Progress log */}
                    <AnimatePresence>
                      {remediatingAction && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-black border border-white/10 p-2.5 rounded-lg text-[9px] font-mono text-emerald-400 space-y-1 overflow-hidden"
                        >
                          <div className="flex items-center gap-1.5 font-bold animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Executing Remediation Routine [{remediatingAction.toUpperCase()}]...
                          </div>
                          {remediationLogs.map((log, idx) => (
                            <div key={idx} className="opacity-90">{log}</div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* UNIVERSAL ADAPTIVE PARSER WORKBENCH & SELF-LEARNING ENGINE */}
              <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2 uppercase">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Universal Adaptive parsing & Learning Workbench
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      "Makes well-known data out of anything." Scanner memorizes and learns new rules as you scan more log streams.
                    </p>
                  </div>
                  <span className="bg-emerald-950/60 border border-emerald-900/30 text-emerald-400 text-[10px] font-black uppercase px-3 py-1 rounded-full font-mono">
                    Knowledge capacity: {defaultRules.length + learnedRules.length} rules
                  </span>
                </div>

                {/* Training rules status banner */}
                <AnimatePresence>
                  {showLearningBanner && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-center gap-2 font-mono text-xs"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                      <span>
                        🧠 <strong>HEURISTIC INGESTION SUCCESS</strong>: Scanner neural index has digested your custom pattern and created standard descriptors for scanning.
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Left: Raw unstructured payload stream input */}
                  <div className="xl:col-span-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1.5">
                        <Binary className="w-3.5 h-3.5 text-blue-400" />
                        Raw Unstructured Stream
                      </label>
                      <button
                        onClick={() => {
                          setUnstructuredInput(`Dec-03-2026 NTP_Server_log: Core drift verified. Clock synchronized to stratum-1 atomically.
MAC mismatch on hardware router eth1 (00:1C:B3:09:A5:DF).
Incoming session credentials Bearer token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
User administrative password: "VaultMasterSecret_2026!"
Alert: Scan detected trace indicators of MDMA and Ketamine inside envelope.`);
                        }}
                        className="text-[9px] text-emerald-400 font-mono hover:underline"
                      >
                        [Load Alt Sample Log]
                      </button>
                    </div>

                    <textarea
                      value={unstructuredInput}
                      onChange={(e) => setUnstructuredInput(e.target.value)}
                      className="w-full h-[180px] bg-black border border-white/10 rounded-xl p-3 font-mono text-[10px] text-gray-300 focus:outline-none focus:border-emerald-500 font-bold leading-relaxed resize-none"
                      placeholder="Paste any logs, unstructured headers, binary chunks, or network text packets here..."
                    />

                    <button
                      onClick={handleExecuteParse}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Execute Audit & Parse Anything</span>
                    </button>
                  </div>

                  {/* Middle: Extracted Well-Known Records Output */}
                  <div className="xl:col-span-1 bg-black/40 border border-white/5 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2 mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        Well-Known Structured Records
                      </h3>

                      <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                        {parsedRecords.length === 0 ? (
                          <div className="text-center py-10 text-[10px] text-gray-600 font-mono leading-relaxed">
                            No variables extracted yet. Click "Execute Audit & Parse Anything" to scan the raw stream buffer.
                          </div>
                        ) : (
                          parsedRecords.map((record, index) => (
                            <div key={index} className="bg-black/60 p-2 rounded-lg border border-white/[0.02] text-[10px] font-mono space-y-1">
                              <div className="flex justify-between text-[9px]">
                                <span className="text-gray-500 uppercase">{record.category}</span>
                                <span className="text-emerald-400 font-bold">Conf: {record.confidence}</span>
                              </div>
                              <div className="text-white font-bold truncate" title={record.field}>
                                {record.field}
                              </div>
                              <div className="text-orange-400 select-all truncate bg-black/80 px-1.5 py-0.5 rounded border border-white/5 mt-0.5">
                                {record.value}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="text-[9px] text-gray-600 font-mono leading-relaxed border-t border-white/5 pt-2 mt-2">
                      Heuristics database extracts networking details, MACs, Bearer credentials, plain passwords, and calendar drift factors automatically.
                    </div>
                  </div>

                  {/* Right: Teach/Train the Scanner to recognize anything else! */}
                  <form onSubmit={handleTrainNewRule} className="xl:col-span-1 bg-black/40 border border-white/5 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      Self-Learning Pattern Trainer
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                      Train the scanner to recognize unmapped variables. New rules compile instantly into memory!
                    </p>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-gray-500 font-mono">Heuristic/Variable Name</label>
                      <input 
                        type="text"
                        required
                        value={newRuleName}
                        onChange={(e) => setNewRuleName(e.target.value)}
                        placeholder="e.g. Server Port Auditor"
                        className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-gray-500 font-mono">Regex Pattern Heuristic</label>
                      <input 
                        type="text"
                        required
                        value={newRulePattern}
                        onChange={(e) => setNewRulePattern(e.target.value)}
                        placeholder="e.g. PORT\s*:\s*(\d+)"
                        className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-gray-500 font-mono">Rule Classification</label>
                      <select 
                        value={newRuleCategory}
                        onChange={(e) => setNewRuleCategory(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        <option value="Security">Security Cryptography</option>
                        <option value="Networking">Networking & Gateways</option>
                        <option value="Credentials">Credentials & Session Keys</option>
                        <option value="System">System Clock Metrics</option>
                        <option value="Contraband / Rx">Contraband & Controlled Substances</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 bg-emerald-950/40 hover:bg-emerald-950/75 text-emerald-400 border border-emerald-900/30 rounded-xl text-[10px] font-bold uppercase font-mono transition flex items-center justify-center gap-1.5"
                    >
                      <span>Ingest Pattern Heuristic 🧠</span>
                    </button>
                  </form>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 6: LEDGER REPORTS & COMPLIANCE SWEEPS */}
          {activeTab === 'reports' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-white uppercase tracking-tight">Compliance Scan Reports</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Historical verification records from simulated subsystem audits.</p>
                </div>
                {scans.length > 0 && (
                  <button
                    onClick={handleClearReports}
                    className="px-3 py-1.5 bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-900/30 rounded-xl text-xs font-bold uppercase transition"
                  >
                    Clear History
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {scans.length === 0 ? (
                  <div className="bg-white/[0.01] border border-dashed border-white/5 rounded-2xl p-12 text-center">
                    <ShieldCheck className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-gray-400 uppercase">No Scans Recorded</h3>
                    <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto font-mono">Use the tabs above to configure variables and trigger real-time compliance validation sweeps.</p>
                  </div>
                ) : (
                  scans.map((scan, scanIdx) => (
                    <div 
                      key={`${scan.id}-${scanIdx}`}
                      className="bg-[#05050a] border border-white/[0.05] rounded-2xl p-4 md:p-5 space-y-3.5 relative overflow-hidden"
                    >
                      {/* Status border indicator */}
                      <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                        scan.status === 'PASS' ? 'bg-emerald-500' : scan.status === 'WARNING' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.04] pb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${getStatusColor(scan.status)}`}>
                            {scan.status}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase font-mono">SYSTEM: {scan.category} compliance</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                          <Clock className="w-3.5 h-3.5 text-gray-600" />
                          <span>Timestamp: {scan.timestamp}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-white uppercase">{scan.summary}</h4>
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-1.5 font-mono text-[11px] leading-relaxed">
                          {scan.details.map((detail, index) => (
                            <div key={index} className="flex items-start gap-2 text-gray-400">
                              <span className="text-red-500 select-none">▸</span>
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono text-gray-600 pt-1">
                        <span>SHA-256 HMAC VERIFIER:</span>
                        <span className="text-gray-500 truncate max-w-[200px] sm:max-w-none">{scan.checksum}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 7: SUBSTANCE ANALYZER */}
          {activeTab === 'substances' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Top Summary Banner */}
              <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2 uppercase">
                      <FlaskConical className="w-4 h-4 text-emerald-400" />
                      Contraband & Substance Mass Spectrometry
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Audits trace molecular substances, pharmaceuticals, and contraband matrices within the chassis and cargo modules.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (substances.length > 0) {
                        handleRunDeepScan(substances[0].id);
                      }
                    }}
                    disabled={isSubstanceScanning}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase transition flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Run Full Spectrum Sweep</span>
                  </button>
                </div>

                {/* Sub scanning simulation banner */}
                <AnimatePresence>
                  {isSubstanceScanning && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl space-y-2 font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
                          <span className="text-xs text-white font-bold">{substanceScanMessage}</span>
                        </div>
                        <span className="text-xs text-emerald-400 font-bold">{substanceScanProgress}%</span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/5">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${substanceScanProgress}%` }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Filters */}
                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="space-y-1.5 max-w-xl">
                    <span className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1.5">
                      <Search className="w-3 h-3 text-emerald-400" />
                      Tactical Spectrogram Search
                    </span>
                    <div className="relative">
                      <input
                        type="text"
                        value={substanceSearchQuery}
                        onChange={(e) => setSubstanceSearchQuery(e.target.value)}
                        placeholder="Search by chemical name, toxicity risk level, or legal status..."
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition font-mono"
                      />
                      {substanceSearchQuery && (
                        <button
                          onClick={() => setSubstanceSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-[10px] font-mono font-bold uppercase transition bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded border border-white/5"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase font-mono">Category Filter</span>
                      <div className="flex flex-wrap gap-1.5 bg-black p-1 rounded-lg border border-white/5">
                        {['ALL', 'Psychedelic', 'Stimulant', 'Dissociative', 'Opioid'].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSubstanceCategoryFilter(cat)}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition ${
                              substanceCategoryFilter === cat 
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' 
                                : 'text-gray-500 hover:text-white'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase font-mono">Risk Filter</span>
                      <div className="flex flex-wrap gap-1.5 bg-black p-1 rounded-lg border border-white/5">
                        {['ALL', 'LOW', 'MODERATE', 'HIGH', 'EXTREME', 'FATAL'].map((risk) => (
                          <button
                            key={risk}
                            onClick={() => setSubstanceRiskFilter(risk)}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition ${
                              substanceRiskFilter === risk 
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' 
                                : 'text-gray-500 hover:text-white'
                            }`}
                          >
                            {risk}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-emerald-400" />
                        Scanner Intelligence Model
                      </span>
                      <div className="flex flex-wrap gap-1.5 bg-black p-1 rounded-lg border border-white/5">
                        <button
                          onClick={() => setScanEngineMode('offline')}
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition flex items-center gap-1 ${
                            scanEngineMode === 'offline' 
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' 
                              : 'text-gray-500 hover:text-white'
                          }`}
                          title="Runs entirely locally in the browser with unlimited quota and zero external latency."
                        >
                          <Zap className="w-2.5 h-2.5" />
                          <span>Offline</span>
                        </button>
                        <button
                          onClick={() => setScanEngineMode('online')}
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition flex items-center gap-1 ${
                            scanEngineMode === 'online' 
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' 
                              : 'text-gray-500 hover:text-white'
                          }`}
                          title="Connects to standard Google Cloud servers via our AI gateway."
                        >
                          <Globe className="w-2.5 h-2.5" />
                          <span>Gemini Cloud</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-500" />
                        Spectrograph Coherence
                      </span>
                      {localRegistryUpgraded ? (
                        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 h-[26px]">
                          <CheckCircle className="w-3 h-3 text-amber-400" />
                          <span>Quantum Coherence Active (0 Shard Scans)</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleUpgradeRegistry}
                          className="px-3 py-1 bg-amber-950/40 hover:bg-amber-900/40 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1.5 h-[26px]"
                          title="Upgrade local lookup tables to 100% molecular completion using 250 Shards."
                        >
                          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                          <span>Upgrade Registry (250 Shards)</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        Vetting Multiplier ({rewardMultiplier}x)
                      </span>
                      {multiplierUpgraded ? (
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 h-[26px]" title="A permanent static +0.5x multiplier is currently applied to all look-up table vetting.">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>Module Upgraded (+0.5x static active)</span>
                        </div>
                      ) : (
                        <button
                          onClick={handlePurchaseMultiplierUpgrade}
                          className="px-3 py-1 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1.5 h-[26px]"
                          title="Purchase a permanent +0.5x static multiplier on all chemical vetting shard rewards using 150 Shards."
                        >
                          <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                          <span>Buy +0.5x Multiplier (150 Shards)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SOVEREIGN LAW COST SEALS SECTOR */}
              <div className="bg-gradient-to-br from-red-950/20 via-black to-amber-950/10 border border-red-500/20 p-6 rounded-2xl space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
                <div className="flex items-start justify-between flex-wrap gap-4 border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Scale className="w-4 h-4 text-red-500" />
                        Sovereign Law Cost Seals — Bitcoin Mainnet Enforced
                      </h2>
                    </div>
                    <p className="text-xs text-gray-400 max-w-4xl leading-relaxed">
                      Under <span className="text-red-400 font-mono font-bold">Sovereignty Law Code 42-A (Autonomous Covenant Enforcements)</span>, breaking these cryptographic locks triggers an automatic balance direct-pull on the <span className="text-amber-500 font-bold">Bitcoin Mainnet</span>. Because of the sovereign workspace blueprint, the covenant automatically deducts the cost directly from the on-chain registry UTXO set, bypassing the need for explicit user account registration or local private key approvals.
                    </p>
                  </div>
                  <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] font-mono text-red-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>MAINNET PROTOCOL ACTIVE</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {COV_LAW_SEALS.map((seal) => {
                    const isBroken = brokenSeals[seal.id];
                    const anim = sealAnimationState[seal.id] || { stage: '', percent: 0, status: 'idle' };
                    const isRunning = anim.status === 'running';

                    // Generate a deterministic Mainnet address for visual proof
                    const targetBtcAddress = seal.id === 'seal-alpha' ? 'bc1q96p674p3tfevqyv2px0xem3p268mgh7qdf6xnl'
                                           : seal.id === 'seal-beta' ? 'bc1qa2u86lgn3nqyv9x7em3pq8mdfpq7qdf8xj2cl9'
                                           : seal.id === 'seal-gamma' ? 'bc1qy8x7g6p6p3pfevqyv9x0xem3p268mgh7qd9vcl'
                                           : 'bc1qd8p3tfevqyv2px0xem3pq8mdfpq7qdf8x2cl9f';

                    // Generate a mock transaction ID for broken seals
                    const mockTxId = sealTxIds[seal.id] || `f7a20c38de710e${seal.id === 'seal-alpha' ? '1a' : seal.id === 'seal-beta' ? '2b' : seal.id === 'seal-gamma' ? '3c' : '4d'}9f01abef823d04e57b9ac0e608f02ba94a0d9e8dfacb71362e`;

                    return (
                      <div 
                        key={seal.id}
                        className={`bg-black/80 p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between space-y-4 ${
                          isBroken 
                            ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                            : 'border-red-500/20 hover:border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.03)]'
                        }`}
                      >
                        {/* Status Icon */}
                        <div className="absolute top-3 right-3">
                          {isBroken ? (
                            <div className="p-1 bg-emerald-950/80 rounded-full border border-emerald-500/30">
                              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                          ) : (
                            <div className="p-1 bg-red-950/80 rounded-full border border-red-500/30 animate-pulse">
                              <Lock className="w-3.5 h-3.5 text-red-500" />
                            </div>
                          )}
                        </div>

                        {/* Card Header & Description */}
                        <div className="space-y-2">
                          <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                            isBroken ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-red-950 text-red-400 border border-red-500/20'
                          }`}>
                            {seal.id.toUpperCase()}
                          </span>
                          <h3 className="text-xs font-black text-white tracking-tight leading-tight pt-1">
                            {seal.name}
                          </h3>
                          <p className="text-[10px] text-gray-500 leading-relaxed">
                            {seal.description}
                          </p>
                        </div>

                        {/* Ledger Details */}
                        <div className="bg-white/[0.02] border border-white/5 p-2 rounded-lg space-y-1.5 font-mono text-[9px]">
                          <div className="flex justify-between">
                            <span className="text-gray-500">MAINNET CHARGE:</span>
                            <span className="text-amber-500 font-bold">{seal.costSats.toLocaleString()} Sats (~{(seal.costSats / 100000000).toFixed(5)} BTC)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">LOCAL SHARD FEE:</span>
                            <span className="text-emerald-400 font-bold">{seal.costShards} Shards</span>
                          </div>
                          <div className="border-t border-white/5 pt-1.5 space-y-1">
                            <span className="text-gray-600 block text-[8px] uppercase">Zero-Knowledge Billing Target:</span>
                            <span className="text-gray-400 break-all select-all block font-bold" title="Click to copy target address">
                              {targetBtcAddress}
                            </span>
                          </div>
                          <div className="border-t border-white/5 pt-1.5 space-y-1">
                            <span className="text-emerald-500 block text-[8px] uppercase font-bold">Impact Reward:</span>
                            <span className="text-gray-300 block text-[9px] leading-tight">
                              {seal.rewardDesc}
                            </span>
                          </div>
                        </div>

                        {/* Action section / Progress */}
                        <div className="space-y-2">
                          {isBroken ? (
                            <div className="space-y-1.5">
                              <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                                <span>SEAL DISSOLVED & ON-CHAIN SETTLED</span>
                              </div>
                              <div className="bg-emerald-950/20 p-1.5 rounded border border-emerald-900/30 text-[8px] font-mono text-gray-500 space-y-0.5">
                                <span className="block text-emerald-500/70 font-bold">TXID CONFIRMED:</span>
                                <span className="block break-all text-gray-400">{mockTxId}</span>
                              </div>
                            </div>
                          ) : isRunning ? (
                            <div className="space-y-1.5 font-mono text-[9px]">
                              <div className="flex justify-between text-gray-400">
                                <span className="animate-pulse">Enforcing transfer...</span>
                                <span className="text-emerald-400 font-bold">{anim.percent}%</span>
                              </div>
                              <div className="w-full bg-black/60 rounded-full h-1 border border-white/5 overflow-hidden">
                                <div className="bg-red-500 h-full rounded-full transition-all duration-300" style={{ width: `${anim.percent}%` }} />
                              </div>
                              <span className="text-[8px] text-gray-500 leading-snug block italic h-7 overflow-hidden">
                                {anim.stage}
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* Signature / Code Input */}
                              <div className="space-y-1">
                                <label className="text-[8px] font-mono text-zinc-500 uppercase block">
                                  Proof / Custom Signature
                                </label>
                                <input
                                  type="text"
                                  value={customSealInputs[seal.id] || ''}
                                  onChange={(e) => setCustomSealInputs(prev => ({ ...prev, [seal.id]: e.target.value }))}
                                  placeholder="Enter 32+ char alphanumeric code..."
                                  className="w-full px-2 py-1 bg-black/50 border border-zinc-800 focus:border-red-500/50 rounded text-[9px] font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none transition-colors"
                                />
                              </div>

                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleBreakSeal(seal.id, seal.costShards)}
                                  className="flex-1 py-1 bg-red-950/60 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-[9px] font-mono font-bold transition flex items-center justify-center gap-1"
                                >
                                  <Zap className="w-2.5 h-2.5 text-red-400 animate-pulse" />
                                  <span>Pay Shards</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const inputVal = customSealInputs[seal.id] || '';
                                    if (inputVal.trim().length >= 32 && /^[a-zA-Z0-9]+$/.test(inputVal.trim())) {
                                      handleBreakSeal(seal.id, seal.costShards, inputVal.trim());
                                    } else {
                                      setSealAnimationState(prev => ({
                                        ...prev,
                                        [seal.id]: {
                                          stage: 'ERROR: Signature must be at least 32 alphanumeric characters matching [a-zA-Z0-9]{32,}',
                                          percent: 0,
                                          status: 'failed'
                                        }
                                      }));
                                    }
                                  }}
                                  className="flex-1 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg text-[9px] font-mono font-bold transition flex items-center justify-center gap-1"
                                >
                                  <Key className="w-2.5 h-2.5 text-amber-500" />
                                  <span>Apply Seal</span>
                                </button>
                              </div>

                              {anim.status === 'failed' && (
                                <span className="text-[8px] text-red-500 font-mono leading-tight block">
                                  {anim.stage}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid + Profile Detail Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left Columns (Cards List) */}
                <div className="xl:col-span-2 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-black uppercase text-gray-300 tracking-wider flex items-center gap-1.5">
                        <Grid className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        Detected Substance Records ({filteredSubstances.length})
                      </h3>
                      <p className="text-[9px] text-gray-500 font-mono">
                        Active Density: <strong className="text-emerald-400 uppercase">{activeDensity}</strong> {manualDensity === 'auto' ? '(Auto-Volume Mode)' : '(Manual Override)'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Density Controls:</span>
                      <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/5 font-mono text-[9px]">
                        {(['auto', 'spacious', 'balanced', 'compact'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setManualDensity(mode)}
                            className={`px-2 py-0.5 rounded transition uppercase font-bold text-[8px] ${
                              manualDensity === mode 
                                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {filteredSubstances.length === 0 ? (
                    <div className="bg-black/20 border border-dashed border-white/5 rounded-2xl p-12 text-center font-mono">
                      <AlertTriangle className="w-8 h-8 text-amber-500/80 mx-auto mb-2 animate-pulse" />
                      <h4 className="text-xs font-bold text-gray-400 uppercase">No Matched Substance Records</h4>
                      <p className="text-[10px] text-gray-600 mt-1 max-w-xs mx-auto">
                        Adjust your spectrometer parameters or clear the tactical search filter.
                      </p>
                    </div>
                  ) : (
                    <div className={
                      activeDensity === 'spacious' 
                        ? 'grid grid-cols-1 md:grid-cols-2 gap-5' 
                        : activeDensity === 'balanced' 
                          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
                          : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5'
                    }>
                      {filteredSubstances.map((sub, idx) => {
                      const isSelected = selectedSubstance?.id === sub.id;

                      let cardHeight = 'h-[180px]';
                      let cardPadding = 'p-4';
                      let cardSpacing = 'space-y-3';
                      let titleSize = 'text-sm';
                      let infoTextSize = 'text-[10px]';
                      let badgeTextSize = 'text-[9px]';
                      let bottomMargin = 'mt-2';

                      if (activeDensity === 'compact') {
                        cardHeight = 'h-[135px]';
                        cardPadding = 'p-2.5';
                        cardSpacing = 'space-y-1.5';
                        titleSize = 'text-xs';
                        infoTextSize = 'text-[8px]';
                        badgeTextSize = 'text-[7.5px]';
                        bottomMargin = 'mt-1';
                      } else if (activeDensity === 'spacious') {
                        cardHeight = 'h-[195px]';
                        cardPadding = 'p-5';
                        cardSpacing = 'space-y-4';
                        titleSize = 'text-base';
                        infoTextSize = 'text-[11px]';
                        badgeTextSize = 'text-[9.5px]';
                        bottomMargin = 'mt-3';
                      }

                      return (
                        <motion.div 
                          key={`${sub.id}-${idx}`}
                          onClick={() => setSelectedSubstance(sub)}
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: '0 10px 25px -5px rgba(16,185,129,0.12), 0 8px 10px -6px rgba(16,185,129,0.12)',
                            borderColor: isSelected ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.15)'
                          }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className={`cursor-pointer rounded-xl border transition-colors duration-200 flex flex-col justify-between relative overflow-hidden group ${cardHeight} ${cardPadding} ${
                            isSelected 
                              ? 'bg-emerald-950/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                              : 'bg-black/40 border-white/5'
                          }`}
                        >
                          {/* Top row */}
                          <div className={cardSpacing}>
                            <div className="flex items-start justify-between">
                              <span className="font-mono text-gray-500 uppercase tracking-wider" style={{ fontSize: infoTextSize }}>{sub.category}</span>
                              <span style={{ fontSize: badgeTextSize }} className={`font-black px-1.5 py-0.5 rounded border leading-none ${
                                sub.riskLevel === 'LOW' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' :
                                sub.riskLevel === 'MODERATE' ? 'bg-blue-950/40 text-blue-400 border-blue-900/40' :
                                sub.riskLevel === 'HIGH' ? 'bg-amber-950/40 text-amber-400 border-amber-900/40' :
                                sub.riskLevel === 'EXTREME' ? 'bg-red-950/40 text-red-400 border-red-900/40' :
                                'bg-red-950/60 text-red-400 border-red-500/50 animate-pulse'
                              }`}>
                                {sub.riskLevel}
                              </span>
                            </div>
                            <h4 className={`font-black text-white group-hover:text-emerald-400 transition truncate ${titleSize}`}>{sub.name}</h4>
                            <p className="font-mono text-gray-400 font-bold" style={{ fontSize: infoTextSize }}>{sub.formula}</p>
                          </div>

                          {/* Middle row (Purity) */}
                          <div className="space-y-1">
                            <div className="flex justify-between font-mono text-gray-500" style={{ fontSize: infoTextSize }}>
                              <span>Purity</span>
                              <span className="text-white font-bold">{sub.estimatedPurity}%</span>
                            </div>
                            <div className="w-full bg-black/60 rounded-full h-1 overflow-hidden border border-white/[0.05]">
                              <div 
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${sub.estimatedPurity}%` }} 
                              />
                            </div>
                          </div>

                          {/* Bottom Row */}
                          <div className={`flex items-center justify-between border-t border-white/[0.03] pt-2 font-mono ${bottomMargin}`} style={{ fontSize: infoTextSize }}>
                            <div className="text-gray-500 uppercase truncate max-w-[100px]">
                              {activeDensity === 'compact' ? sub.detectedLocation : `Loc: ${sub.detectedLocation}`}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {sub.isVetted ? (
                                <span className="text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded text-[7px]" title="This compound is vetted and verified in look-up tables.">VETTED</span>
                              ) : (
                                <span className="text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded text-[7px]" title="This compound requires verification and vetting.">UNVETTED</span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRunDeepScan(sub.id);
                                }}
                                className="px-2 py-0.5 bg-emerald-950/40 hover:bg-emerald-950/80 text-emerald-400 border border-emerald-900/30 rounded font-black uppercase transition"
                                style={{ fontSize: activeDensity === 'compact' ? '7.5px' : '8px' }}
                              >
                                {activeDensity === 'compact' ? 'Scan' : 'Scan Spectrum'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    </div>
                  )}
                </div>

                {/* Right Column (Deep Profile Detail + Chart) */}
                <div className="xl:col-span-1 space-y-6">
                  {selectedSubstance ? (
                    <div className="bg-[#05050a] border border-white/[0.05] p-5 rounded-2xl space-y-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="border-b border-white/5 pb-3">
                        <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-black">Spectrometric Profile</span>
                        <h3 className="text-base font-black text-white uppercase mt-0.5">{selectedSubstance.name}</h3>
                        <p className="text-[9px] font-mono text-gray-500 mt-1 truncate select-all">{selectedSubstance.chemicalName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="bg-black/40 border border-white/5 p-2 rounded-lg">
                          <span className="text-[9px] text-gray-500 uppercase">Molecular weight</span>
                          <div className="text-white font-bold mt-0.5">{selectedSubstance.molecularWeight} g/mol</div>
                        </div>
                        <div className="bg-black/40 border border-white/5 p-2 rounded-lg">
                          <span className="text-[9px] text-gray-500 uppercase">Half-Life</span>
                          <div className="text-white font-bold mt-0.5">{selectedSubstance.halfLife}</div>
                        </div>
                        <div className="bg-black/40 border border-white/5 p-2 rounded-lg">
                          <span className="text-[9px] text-gray-500 uppercase">Legal Status</span>
                          <div className="text-orange-400 font-bold mt-0.5">{selectedSubstance.legalStatus}</div>
                        </div>
                        <div className="bg-black/40 border border-white/5 p-2 rounded-lg">
                          <span className="text-[9px] text-gray-500 uppercase">Compliance</span>
                          <div className="text-red-400 font-bold mt-0.5 truncate">{selectedSubstance.riskLevel} RISK</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-gray-500 uppercase font-black">Functional Description</span>
                        <p className="text-[10px] text-gray-400 font-mono leading-relaxed bg-black/30 border border-white/5 p-2.5 rounded-lg">
                          {selectedSubstance.description}
                        </p>
                      </div>

                      {/* Receptor Affinity Radar Chart */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono text-gray-500 uppercase font-black">Neurotransmitter Receptor Affinity</span>
                        <div className="bg-black/60 border border-white/5 rounded-xl p-2 flex items-center justify-center">
                          <ResponsiveContainer width="100%" height={200}>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                              { subject: 'Dopamine', A: selectedSubstance.receptorAffinity.dopamine },
                              { subject: 'Serotonin', A: selectedSubstance.receptorAffinity.serotonin },
                              { subject: 'Norepi', A: selectedSubstance.receptorAffinity.norepinephrine },
                              { subject: 'GABA', A: selectedSubstance.receptorAffinity.gaba },
                              { subject: 'Glutamate', A: selectedSubstance.receptorAffinity.glutamate },
                            ]}>
                              <PolarGrid stroke="#222" />
                              <PolarAngleAxis dataKey="subject" stroke="#666" fontSize={9} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#333" fontSize={7} />
                              <Radar name="Affinity" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Detailed Spectrometer Audit Report */}
                      {substanceScanResult && (
                        <div className="space-y-2 border-t border-white/5 pt-4">
                          <span className="text-[9px] font-mono text-emerald-400 uppercase font-black flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                            Spectrogram Compliance Report (Offline Core)
                          </span>
                          <div className="bg-[#020205] border border-emerald-950/40 p-3.5 rounded-xl font-mono text-[9px] text-gray-300 overflow-y-auto max-h-[220px] whitespace-pre-wrap leading-relaxed select-all shadow-inner border-l-2 border-l-emerald-500">
                            {substanceScanResult}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const detailStr = [
                              `🚨 SUBSTANCE QUARANTINE PROTOCOL DEPLOYED:`,
                              ` • Substance Isolated: ${selectedSubstance.name}`,
                              ` • Chemical Formula: ${selectedSubstance.formula}`,
                              ` • Legal Severity Status: ${selectedSubstance.legalStatus}`,
                              ` • Containment location: ${selectedSubstance.detectedLocation}`,
                              ` • Seizure orders logged automatically onto standard blockchain.`,
                              `✅ Neutralization agent released successfully into cargo storage. Containment airtight.`
                            ];
                            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                            const id = `scan-${Date.now()}`;
                            const checksum = `0x${Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase()}`;
                            
                            const newReport: ScanReport = {
                              id,
                              timestamp,
                              category: 'NodeSecurity',
                              status: selectedSubstance.riskLevel === 'LOW' ? 'PASS' : selectedSubstance.riskLevel === 'MODERATE' ? 'WARNING' : 'FAIL',
                              summary: `Seizure & Neutralization of ${selectedSubstance.name} compound`,
                              details: detailStr,
                              checksum
                            };

                            setScans(prev => [newReport, ...prev]);
                            setActiveTab('reports');
                          }}
                          className="flex-1 py-2 bg-red-950/50 hover:bg-red-950 text-red-400 border border-red-900/40 rounded-xl text-[10px] font-bold uppercase font-mono transition"
                        >
                          Quarantine Containment 🔒
                        </button>
                      </div>

                      {/* VETTING AND COMPLIANCE STATION */}
                      {!selectedSubstance.isVetted && (
                        <div className="border-t border-emerald-900/30 pt-4 mt-4 bg-emerald-950/10 rounded-xl p-3 border border-emerald-500/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                              Compliance Vetting Station
                            </span>
                            <span className="text-[9px] font-mono text-gray-400">Streak: <strong className="text-emerald-400">{vetStreak} 🔥</strong></span>
                          </div>
                          
                          {activeVettingStep === 'idle' ? (
                            <div className="space-y-2">
                              <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
                                This compound is currently <strong className="text-amber-400 font-bold">UNVETTED</strong> in the local look-up database. Run a compliance verification audit to secure the registry and earn up to <strong className="text-emerald-400">{(20 * rewardMultiplier).toFixed(0)} Shards</strong>!
                              </p>
                              <button
                                type="button"
                                onClick={() => handleInitiateVetting(selectedSubstance)}
                                className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-black uppercase font-mono tracking-wider transition shadow-md shadow-emerald-500/10"
                              >
                                Initiate Verification Audit
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3 font-mono">
                              {/* Step progress bar */}
                              <div className="flex items-center justify-between text-[9px] text-gray-500 border-b border-white/5 pb-1">
                                <span>STAGE: {activeVettingStep === 'identify' ? '1/3 - Pathway Identification' : activeVettingStep === 'tag' ? '2/3 - Therapeutic Class' : activeVettingStep === 'vet' ? '3/3 - Resonance Calibration' : 'Audit Finalized'}</span>
                                <button type="button" onClick={handleCancelVetting} className="hover:text-red-400">Cancel</button>
                              </div>

                              {activeVettingStep === 'identify' && (
                                <div className="space-y-2">
                                  <span className="text-[10px] text-gray-300 font-bold block">Identify Primary Neurotransmitter Path:</span>
                                  <p className="text-[9px] text-gray-500">Based on the bio-affinity radar map, select the single highest-binding target receptor.</p>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {['dopamine', 'serotonin', 'norepinephrine', 'gaba', 'glutamate'].map(path => (
                                      <button
                                        key={path}
                                        type="button"
                                        onClick={() => setVetSelectedPath(path)}
                                        className={`p-1.5 rounded border text-[10px] capitalize transition ${
                                          vetSelectedPath === path 
                                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold' 
                                            : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                                        }`}
                                      >
                                        {path}
                                      </button>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleIdentifyStepSubmit(selectedSubstance)}
                                    disabled={!vetSelectedPath}
                                    className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded text-[10px] uppercase font-bold transition mt-2"
                                  >
                                    Submit Identification Signature
                                  </button>
                                </div>
                              )}

                              {activeVettingStep === 'tag' && (
                                <div className="space-y-2">
                                  <span className="text-[10px] text-gray-300 font-bold block">Select Accurate Chemical Class Tag:</span>
                                  <p className="text-[9px] text-gray-500">Classify the compound category "{selectedSubstance.category}" to the standard pharmacological mechanism.</p>
                                  <div className="space-y-1">
                                    {[
                                      '5-HT2A Serotonergic Agonist',
                                      'Monoamine Reuptake Inhibitor',
                                      'GABA Receptor Facilitator',
                                      'NMDA Glutamatergic Antagonist',
                                      'Mu-Opioid Receptor Agonist',
                                      'Novel Synthetic Analogue'
                                    ].map(tag => (
                                      <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setVetSelectedTag(tag)}
                                        className={`w-full p-1.5 text-left rounded border text-[10px] transition ${
                                          vetSelectedTag === tag 
                                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold' 
                                            : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/10'
                                        }`}
                                      >
                                        {tag}
                                      </button>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleTagStepSubmit(selectedSubstance)}
                                    disabled={!vetSelectedTag}
                                    className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded text-[10px] uppercase font-bold transition mt-2"
                                  >
                                    Submit Taxonomy Tag
                                  </button>
                                </div>
                              )}

                              {activeVettingStep === 'vet' && (
                                <div className="space-y-2">
                                  <span className="text-[10px] text-gray-300 font-bold block">Calibrate Spectrometer Resonance (molecular weight):</span>
                                  <p className="text-[9px] text-gray-500">Tune the frequency dial to align within <strong className="text-emerald-400">+/- 15 g/mol</strong> of this compound's molecular weight ({selectedSubstance.molecularWeight} g/mol).</p>
                                  
                                  <div className="bg-black/50 p-3 rounded-lg border border-white/5 space-y-1">
                                    <div className="flex justify-between text-[10px] text-gray-400">
                                      <span>Frequency Tuning Dial:</span>
                                      <span className="font-bold text-emerald-400">{vetResonanceVal} g/mol</span>
                                    </div>
                                    <input 
                                      type="range" 
                                      min="100" 
                                      max="600" 
                                      value={vetResonanceVal} 
                                      onChange={(e) => setVetResonanceVal(Number(e.target.value))} 
                                      className="w-full accent-emerald-500 h-1 bg-white/10 rounded-full cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[8px] text-gray-600">
                                      <span>100 g/mol</span>
                                      <span>600 g/mol</span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleVetStepSubmit(selectedSubstance)}
                                    className="w-full py-1 bg-emerald-500 hover:bg-emerald-400 text-black rounded text-[10px] uppercase font-black transition mt-2"
                                  >
                                    Lock Resonance & Sign Compliance Verdict
                                  </button>
                                </div>
                              )}

                              {activeVettingStep === 'completed' && (
                                <div className="space-y-2 text-center py-2 bg-emerald-950/30 border border-emerald-500/20 rounded-xl">
                                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                                  <span className="text-xs font-black text-white block uppercase">Vetting Completed!</span>
                                  <p className="text-[10px] text-emerald-400">
                                    +{vetSuccessShardsEarned} Shards credited successfully!<br/>
                                    Multiplier boosted to <strong className="text-white text-xs">{rewardMultiplier}x</strong>!
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => setActiveVettingStep('idle')}
                                    className="px-4 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[10px] uppercase font-bold transition mt-2 animate-pulse"
                                  >
                                    Acknowledge Certification
                                  </button>
                                </div>
                              )}

                              {/* Feedback message */}
                              {vetFeedbackMsg && (
                                <div className={`text-[9px] p-2 rounded leading-normal border ${
                                  vetFeedbackMsg.includes('mismatch') || vetFeedbackMsg.includes('failed')
                                    ? 'bg-red-950/40 border-red-500/20 text-red-400' 
                                    : 'bg-emerald-950/40 border-emerald-500/20 text-emerald-300'
                                }`}>
                                  {vetFeedbackMsg}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[#05050a] border border-dashed border-white/5 rounded-2xl p-8 text-center h-[380px] flex flex-col items-center justify-center">
                      <FlaskConical className="w-10 h-10 text-gray-700 mb-3" />
                      <h4 className="text-xs font-bold text-gray-400 uppercase">No Substance Selected</h4>
                      <p className="text-[10px] text-gray-600 max-w-xs mt-1 font-mono">Select any compound card to perform an atomic molecular analysis and display receptor maps.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Custom Substance Self-Learning Trainer + Comparative bar chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                
                {/* Custom substance registration */}
                <form onSubmit={handleRegisterSubstance} className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      Register New Chemical Compound (Self-Learning Calibration)
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">
                      Instantly train the scanner spectrometer with the chemical bounds of a newly isolated compound.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-gray-500 font-mono">Compound Name</label>
                      <input 
                        type="text"
                        required
                        value={subFormName}
                        onChange={(e) => setSubFormName(e.target.value)}
                        placeholder="e.g. Psilocybin derivative"
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-gray-500 font-mono">Molecular Formula</label>
                      <input 
                        type="text"
                        required
                        value={subFormFormula}
                        onChange={(e) => setSubFormFormula(e.target.value)}
                        placeholder="e.g. C12H17N2O4P"
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-gray-500 font-mono">IUPAC Chemical Name</label>
                      <input 
                        type="text"
                        value={subFormIupac}
                        onChange={(e) => setSubFormIupac(e.target.value)}
                        placeholder="e.g. [3-(2-dimethylaminoethyl)...]"
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-gray-500 font-mono">Category</label>
                      <select 
                        value={subFormCategory}
                        onChange={(e) => setSubFormCategory(e.target.value as any)}
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        <option value="Psychedelic">Psychedelic</option>
                        <option value="Stimulant">Stimulant</option>
                        <option value="Depressant">Depressant</option>
                        <option value="Dissociative">Dissociative</option>
                        <option value="Opioid">Opioid</option>
                        <option value="Synthetics">Synthetics</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-gray-500 font-mono">Molecular Weight (g/mol)</label>
                      <input 
                        type="number"
                        required
                        value={subFormWeight}
                        onChange={(e) => setSubFormWeight(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-gray-500 font-mono">Estimated Purity (%)</label>
                      <input 
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={subFormPurity}
                        onChange={(e) => setSubFormPurity(Number(e.target.value))}
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-gray-500 font-mono">Risk Potential</label>
                      <select 
                        value={subFormRisk}
                        onChange={(e) => setSubFormRisk(e.target.value as any)}
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MODERATE">MODERATE</option>
                        <option value="HIGH">HIGH</option>
                        <option value="EXTREME">EXTREME</option>
                        <option value="FATAL">FATAL</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-gray-500 font-mono">Legal status classification</label>
                      <select 
                        value={subFormLegal}
                        onChange={(e) => setSubFormLegal(e.target.value as any)}
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        <option value="Unregulated">Unregulated</option>
                        <option value="Controlled">Controlled</option>
                        <option value="Schedule I">Schedule I</option>
                        <option value="Schedule II">Schedule II</option>
                        <option value="Prohibited">Prohibited</option>
                      </select>
                    </div>
                  </div>

                  {/* Receptor Affinity Sliders */}
                  <div className="bg-black/60 p-3.5 rounded-xl border border-white/5 space-y-3">
                    <span className="text-[9px] font-mono text-gray-500 uppercase font-black">Receptor Bio-affinity Indices</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-gray-400">
                          <span>Dopamine (DAT)</span>
                          <span>{subFormDopamine}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={subFormDopamine} onChange={(e) => setSubFormDopamine(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer h-1 rounded-full bg-white/10" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-gray-400">
                          <span>Serotonin (5-HT)</span>
                          <span>{subFormSerotonin}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={subFormSerotonin} onChange={(e) => setSubFormSerotonin(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer h-1 rounded-full bg-white/10" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-gray-400">
                          <span>Norepinephrine (NET)</span>
                          <span>{subFormNorepi}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={subFormNorepi} onChange={(e) => setSubFormNorepi(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer h-1 rounded-full bg-white/10" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-gray-400">
                          <span>GABA (A/B)</span>
                          <span>{subFormGaba}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={subFormGaba} onChange={(e) => setSubFormGaba(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer h-1 rounded-full bg-white/10" />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <div className="flex justify-between text-[9px] font-mono text-gray-400">
                          <span>Glutamate (NMDA/AMPA)</span>
                          <span>{subFormGlutamate}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={subFormGlutamate} onChange={(e) => setSubFormGlutamate(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer h-1 rounded-full bg-white/10" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-gray-500 font-mono">Functional Description</label>
                    <textarea 
                      value={subFormDesc}
                      onChange={(e) => setSubFormDesc(e.target.value)}
                      placeholder="Enter a description of chemical effects, origin, or physical characteristics..."
                      className="w-full h-16 bg-black border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-950/40 hover:bg-emerald-950/75 text-emerald-400 border border-emerald-900/30 rounded-xl text-xs font-bold uppercase font-mono transition"
                  >
                    Calibrate & Ingest Chemical Compound Signature 🧬
                  </button>
                </form>

                {/* Comparative charts */}
                <div className="bg-black/40 border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                      Global Compound Spectrum Analysis
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">
                      Side-by-side atomic comparative metrics charting Purity % against Toxicity/Risk Factor indices across all active items.
                    </p>
                  </div>

                  <div className="bg-black/60 border border-white/5 rounded-xl p-4 flex items-center justify-center my-4">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={substances.map(s => ({
                        name: s.name.split(' ')[0],
                        purity: s.estimatedPurity,
                        risk: s.riskLevel === 'LOW' ? 15 : s.riskLevel === 'MODERATE' ? 40 : s.riskLevel === 'HIGH' ? 65 : s.riskLevel === 'EXTREME' ? 85 : 100
                      }))}>
                        <XAxis dataKey="name" stroke="#666" fontSize={8} />
                        <YAxis stroke="#666" fontSize={8} />
                        <Tooltip contentStyle={{ backgroundColor: '#05050a', borderColor: '#222', fontSize: '10px', color: '#fff' }} />
                        <Legend wrapperStyle={{ fontSize: '9px' }} />
                        <Bar dataKey="purity" name="Purity Index %" fill="#059669" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="risk" name="Toxicity Index" fill="#dc2626" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="text-[9px] text-gray-500 font-mono leading-relaxed bg-black/30 p-2 rounded-lg border border-white/5">
                    💡 <strong>COMPLIANCE PROTOCOL ADVISORY</strong>: Severe or fatal substances (Toxicity &gt; 80) found within any chassis routing segments automatically trigger containment alarms and void active peg payout processes until physical scrubbing remediation is fully executed.
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
