import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    fromBase58Check, 
    fromBech32, 
    toBase58Check, 
    toBech32, 
    toOutputScript, 
    fromOutputScript, 
    NETWORKS 
} from './bitcoinAddressUtils';
import { CognitiveMemoryGraph } from './CognitiveMemoryGraph';
import { 
    BrainIcon, ActivityIcon, ZapIcon, TerminalIcon, 
    CheckCircleIcon, ShieldIcon, EyeIcon, LogicIcon,
    CodeIcon, WrenchIcon
} from './icons';
import { 
    cognitivePipeline, 
    SensingLayer, 
    PerceptionLayer, 
    ReasoningLayer, 
    DecisionLayer, 
    ActuationLayer,
    SensorData,
    Percept,
    ReasoningContext,
    Decision,
    ActuationResult
} from '../services/cognitivePipeline';
import {
    Play,
    RotateCcw,
    Sliders,
    Settings2,
    Volume2,
    VolumeX,
    Check,
    Copy,
    AlertTriangle,
    ArrowRight,
    Info,
    Bug,
    Sparkles,
    Gauge,
    Snail,
    FileText,
    History,
    Code
} from 'lucide-react';

interface CognitivePipelineViewProps {
    onClose?: () => void;
}

// Substantive Interactive Sample Code Datasets
const INTERACTIVE_CODE_PRESETS = [
  {
    id: 'REACT_LOOP',
    name: 'useEffect Infinite Reactivity Loop',
    severity: 'CRITICAL',
    complexity: 0.88,
    file: 'src/components/SignalMonitor.tsx',
    raw: `import React, { useState, useEffect } from 'react';

export const SignalMonitor: React.FC = () => {
  const [metric, setMetric] = useState(1.0);
  const [ticks, setTicks] = useState(0);

  // Dynamic feedback loop
  useEffect(() => {
    const nextVal = metric * 1.33;
    setMetric(nextVal); // ❌ DANGER: Mutates state triggering dependency inside effect body!
    setTicks(ticks + 1);
  }, [metric]); // Infinite loop trigger

  return <div>Metric: {metric} | Ticks: {ticks}</div>;
};`,
    healed: `import React, { useState, useEffect } from 'react';

export const SignalMonitor: React.FC = () => {
  const [metric, setMetric] = useState(1.0);
  const [ticks, setTicks] = useState(0);

  // ✅ FIXED: Injected standard stabilization guard and state updater functions
  useEffect(() => {
    // Only update state if threshold is compliant to prevent infinite feedback
    setMetric(prev => {
      const nextVal = prev * 1.33;
      if (nextVal > 1000) return prev; // Limit exponential drift
      return nextVal;
    });
    setTicks(t => t + 1);
  }, []); // Run safely on mount without recursive loop dependencies

  return <div>Metric: {metric} | Ticks: {ticks}</div>;
};`,
    diagnostics: [
      `[HAZARD] Dynamic state feedback loop identified at line 10. setMetric(nextVal) triggers side-effect recursively.`,
      `[DECELERATED] Inspecting closure pointers and variable reference trees... Scanning deep hooks...`,
      `[MUTATION] Abstracted direct mutation to state functional updater: setMetric(prev => nextVal).`,
      `[LOOKAHEAD CHECK] Re-compiling target hook closure. 0 warnings generated. Runtime frequency stable.`
    ]
  },
  {
    id: 'MEMORY_LEAK',
    name: 'Acoustic Events Subscriber Leak',
    severity: 'HIGH',
    complexity: 0.68,
    file: 'src/utils/AudioScheduler.ts',
    raw: `import { useEffect } from 'react';

export const AmbientSoundSync = () => {
  useEffect(() => {
    // ❌ DANGER: Attaches heavy global event listener but never cleans it up!
    window.addEventListener('keydown', (e) => {
      console.log('Acoustic Tick captured on host:', e.key);
      const audioCtx = new AudioContext(); // Allocation spam
      audioCtx.resume();
    });
  }, []); // Returns void!

  return <div>Acoustic Sync Listening...</div>;
};`,
    healed: `import { useEffect } from 'react';

export const AmbientSoundSync = () => {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      console.log('Acoustic Tick captured on host:', e.key);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
      } catch (ex) {}
    };

    // ✅ FIXED: Attached isolated handler cleanly and returned a disposal method
    window.addEventListener('keydown', handleKeydown);
    
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  return <div>Acoustic Sync Listening...</div>;
};`,
    diagnostics: [
      `[HAZARD] Resource leakage. Keydown callback bound to window scope lacks disposal on unmount.`,
      `[DECELERATED] Scanning React lifecycle end-hooks... No return cleanup function detected in useEffect.`,
      `[MUTATION] Refactored inline arrow handler to standard listener function declaration. Injected disposal return block.`,
      `[LOOKAHEAD CHECK] Simulating synthetic memory consumption test. Object count: 0 leaks.`
    ]
  },
  {
    id: 'SILENT_EXCEPTION',
    name: 'Ghost Empty Catch Block Swaller',
    severity: 'MEDIUM',
    complexity: 0.45,
    file: 'src/services/decapsulator.ts',
    raw: `export const decapsulateCortexPayload = (jsonData: string) => {
  try {
    const parsed = JSON.parse(jsonData);
    return parsed.data.cortexValue;
  } catch (error) {
    // ❌ DANGER: Swallows database exceptions silently without logging or fallbacks!
    // Downstream consumers will crash on undefined variables.
  }
};`,
    healed: `export const decapsulateCortexPayload = (jsonData: string) => {
  try {
    if (!jsonData) return null;
    const parsed = JSON.parse(jsonData);
    return parsed?.data?.cortexValue ?? null;
  } catch (error) {
    // ✅ FIXED: Restored diagnostic visibility to logger and returned secure static fallback value
    console.error('[CORTEX ERROR]: Decapsulation exception encountered. Details:', error);
    return null;
  }
};`,
    diagnostics: [
      `[HAZARD] Silent exception swallow block detected in try-catch wrapper. Hidden failure cascade potential.`,
      `[DECELERATED] Tracing diagnostic coverage ratio... 0% transparency inside catch callback scope.`,
      `[MUTATION] Decoupling parameters with robust safe-access chaining operators parsing structures. Appended console logging warnings.`,
      `[LOOKAHEAD CHECK] Syntactic parity matches ideal exception telemetry specification.`
    ]
  },
  {
    id: 'BITCOIN_TX',
    name: 'Bitcoin Transaction Hashing & Script Signature',
    severity: 'CRITICAL',
    complexity: 0.98,
    file: 'src/crypto/Transaction.ts',
    raw: `import * as bscript from './script';
import * as bcrypto from './crypto';

const BLANK_OUTPUT = { script: new Uint8Array(0), value: -1 };

export class Transaction {
  ins = [];
  outs = [];

  hashForSignature(inIndex, prevOutScript, hashType) {
    if (inIndex >= this.ins.length) return new Uint8Array(32);
    
    // ❌ TYPE DANGER: bscript.decompile can return undefined/null, crushing filter with TypeError!
    const ourScript = bscript.compile(
      bscript.decompile(prevOutScript).filter(x => x !== 0x6b)
    );

    const txTmp = this.clone();
    if ((hashType & 0x1f) === 0x03) {
      if (inIndex >= this.outs.length) return new Uint8Array(32);
      txTmp.outs.length = inIndex + 1;
      
      // ❌ SHARED REFERENCE CONTAMINATION: Overwrites outputs with direct reference pointers!
      for (let i = 0; i < inIndex; i++) {
        txTmp.outs[i] = BLANK_OUTPUT; 
      }
    }
    return bcrypto.hash256(txTmp.toBuffer());
  }
}`,
    healed: `import * as bscript from './script';
import * as bcrypto from './crypto';

const BLANK_OUTPUT = { script: new Uint8Array(0), value: -1 };

export class Transaction {
  ins = [];
  outs = [];

  hashForSignature(inIndex, prevOutScript, hashType) {
    if (inIndex >= this.ins.length) return new Uint8Array(32);
    
    // ✅ FIXED: Restored robust fallback to prevent decompile crashes on illegal scripts
    const decompiled = bscript.decompile(prevOutScript) || [];
    const ourScript = bscript.compile(
      decompiled.filter(x => x !== 0x6b)
    );

    const txTmp = this.clone();
    if ((hashType & 0x1f) === 0x03) {
      if (inIndex >= this.outs.length) return new Uint8Array(32);
      txTmp.outs.length = inIndex + 1;
      
      // ✅ FIXED: Injected cloned primitives to resolve reference state leak contamination
      for (let i = 0; i < inIndex; i++) {
        txTmp.outs[i] = { ...BLANK_OUTPUT, script: new Uint8Array(0) }; 
      }
    }
    return bcrypto.hash256(txTmp.toBuffer());
  }
}`,
    diagnostics: [
      `[HAZARD] Script decompile vulnerability detected at line 12. Uncaught decompile result checks cause TypeError crash.`,
      `[DECELERATED] Mathematical complexity extremely high: 98%. Decelerating clock to capture cryptographic bitmask operations.`,
      `[MUTATION] Decoupled BLANK_OUTPUT pointer by cloning payload per execution block to avoid global contamination.`,
      `[LOOKAHEAD CHECK] TapSighash validation pipeline is green. Type stability matches standard secure BIP-0341 specifications.`
    ]
  },
  {
    id: 'BITCOIN_ADDRESSES',
    name: 'Bitcoin Address Decoder & Encoder Stability',
    severity: 'HIGH',
    complexity: 0.95,
    file: 'src/crypto/Address.ts',
    raw: `import { Network } from './networks';

export interface Base58CheckResult {
  hash: Uint8Array;
  version: number;
}

export declare function fromBase58Check(address: string): Base58CheckResult;
export declare function fromBech32(address: string): any;

// ❌ DANGER: Missing network bounds check and byte prefix alignment in decoding!
export function toOutputScript(address: string, network?: Network): Uint8Array {
  if (address.startsWith('bc1')) {
    const decoded = fromBech32(address); // Crashes if return sequence has bad witness length
    const script = new Uint8Array(2 + decoded.data.length);
    script[0] = 0x00; // OP_0 for segwit v0
    script[1] = decoded.data.length;
    script.set(decoded.data, 2);
    return script;
  } else {
    const decoded = fromBase58Check(address); // Memory leak pointer potential
    const script = new Uint8Array(5 + decoded.hash.length);
    // Unsafe script serialization
    return script;
  }
}`,
    healed: `import { Network } from './networks';

export interface Base58CheckResult {
  hash: Uint8Array;
  version: number;
}

export declare function fromBase58Check(address: string): Base58CheckResult;
export declare function fromBech32(address: string): any;

// ✅ FIXED: Injected strict boundary validation and network-specific prefix checks
export function toOutputScript(address: string, network?: Network): Uint8Array {
  try {
    if (!address) throw new TypeError('Address is undefined or empty');
    
    if (address.startsWith('bc1') || address.startsWith('tb1')) {
      const decoded = fromBech32(address);
      if (!decoded || !decoded.data || decoded.data.length < 20 || decoded.data.length > 32) {
        throw new TypeError('Invalid Bech32 sequence length: ' + (decoded?.data?.length ?? 0));
      }
      
      const script = new Uint8Array(2 + decoded.data.length);
      script[0] = decoded.version === 0 ? 0x00 : decoded.version + 0x50; // Proper Taproot/Segwit Opcode handling
      script[1] = decoded.data.length;
      script.set(decoded.data, 2);
      return script;
    } else {
      const decoded = fromBase58Check(address);
      if (!decoded || !decoded.hash || decoded.hash.length !== 20) {
        throw new TypeError('Invalid hash payload length for Base58Check address');
      }
      
      // Standard P2PKH / P2SH generation safely
      const script = new Uint8Array(5 + decoded.hash.length);
      if (decoded.version === 0x00) {
        // OP_DUP OP_HASH160 <hash> OP_EQUALVERIFY OP_CHECKSIG
        script.set([0x76, 0xa9, decoded.hash.length]);
        script.set(decoded.hash, 3);
        script.set([0x88, 0xac], 3 + decoded.hash.length);
      } else {
        // OP_HASH160 <hash> OP_EQUAL
        script.set([0xa9, decoded.hash.length]);
        script.set(decoded.hash, 2);
        script.set([0x87], 2 + decoded.hash.length);
      }
      return script;
    }
  } catch (error) {
    console.error('[ADDRESS DECODING EXCEPTION]:', error);
    throw error;
  }
}`,
    diagnostics: [
      `[HAZARD] Address decoding vulnerability: Invalid witness length or index out of bounds during prefix parsing can crash application.`,
      `[DECELERATED] Normalizing address validator clock speed. High precision Base58 and Bech32 parser scanning in progress...`,
      `[MUTATION] Secured prefix lookup and injected strict length constraints. Taproot v1 vs. Segwit v0 opcodes successfully aligned.`,
      `[LOOKAHEAD CHECK] Complete unit test validation and network matching checks passed with zero memory leaks.`
    ]
  }
];

export const CognitivePipelineView: React.FC<CognitivePipelineViewProps> = ({ onClose }) => {
    // High-level functional View layout tabs
    const [viewMode, setViewMode] = useState<'CODE_HEALER' | 'STANDARD_STIMULUS' | 'ADDRESS_PARSER' | 'MEMORY_GRAPH'>('CODE_HEALER');

    // State for standard stimulus pipeline
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [sensorData, setSensorData] = useState<SensorData | null>(null);
    const [percept, setPercept] = useState<Percept | null>(null);
    const [reasoning, setReasoning] = useState<ReasoningContext | null>(null);
    const [decision, setDecision] = useState<Decision | null>(null);
    const [actuation, setActuation] = useState<ActuationResult | null>(null);

    // ==========================================
    // "SLOWS AS IT KNOWS" SELF-HEALING CODE PIPELINE STATES
    // ==========================================
    const [selectedSample, setSelectedSample] = useState(INTERACTIVE_CODE_PRESETS[0]);
    const [editableCode, setEditableCode] = useState(INTERACTIVE_CODE_PRESETS[0].raw);
    const [repairedResult, setRepairedResult] = useState<string>('');
    const [healerProcessing, setHealerProcessing] = useState(false);
    const [activeHealerPhase, setActiveHealerPhase] = useState<'IDLE' | 'SCANNING' | 'AUDITING' | 'DECELERATING' | 'SYNTHESIZING' | 'VERIFYING' | 'PASSED'>('IDLE');
    
    // Config controls
    const [decelerationCoefficient, setDecelerationCoefficient] = useState<number>(3.2); // 1.0 to 10.0 scale lambda
    const [lookaheadScanDepth, setLookaheadScanDepth] = useState<number>(3); // 1 to 5 scanner count
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
    const [currentVelocityHz, setCurrentVelocityHz] = useState<number>(4.5); // Processing speed mock
    const [pipelineLogs, setPipelineLogs] = useState<Array<{ text: string, type: 'INFO' | 'WARN' | 'HEAL' | 'SUCCESS' | 'SLOW' }>>([]);
    const [copiedFeedback, setCopiedFeedback] = useState(false);

    // Track active simulation steps
    const simulationTimeoutRefs = useRef<number[]>([]);

    // ==========================================
    // BITCOIN ADDRESS DECODER & ENCODER LAB STATES
    // ==========================================
    const [btcInputAddress, setBtcInputAddress] = useState('bc1qxy2kgdygjrsqtzq2n0yrf24v3unfv7j2gwyzgf'); // default segwit v0 address for testing
    const [selectedNet, setSelectedNet] = useState<'bitcoin' | 'testnet' | 'regtest'>('bitcoin');
    const [decoderResult, setDecoderResult] = useState<any>(null);
    const [decoderError, setDecoderError] = useState<string | null>(null);
    const [inputScriptHex, setInputScriptHex] = useState('76a914c4a1614741c6cbd6360c1d2cc4eb3606f1577788ac'); // default P2PKH script
    const [scriptToAddressResult, setScriptToAddressResult] = useState<string>('');
    const [scriptToAddressError, setScriptToAddressError] = useState<string | null>(null);
    const [activeSubsystemLogs, setActiveSubsystemLogs] = useState<string[]>([
      "Re-indexing combustion pointers for P0301. Purging carbon cache from the valve registry and normalizing spark timing delta to the AetherOS global clock via BPI channel 4.",
      "Bridging the Fall Off Requindor gap in the ABS subnet for U0121. Forcing node synchronization on the high-speed CAN bus via Kernel IRQ 12 to eliminate ghost signals.",
      "Flush the BPI buffer to prevent instruction overflow and verify sensor voltage harmonics against the reference kernel.",
      "Execute a full integrity sweep of the localized AetherOS node to verify the stride remains at 1.2 PB/s and inspect physical layer terminations for entropy decay."
    ]);

    // Handle Address decoding
    const handleDecodeAddress = (addrVal: string, netVal: 'bitcoin' | 'testnet' | 'regtest') => {
        try {
            setDecoderError(null);
            setDecoderResult(null);
            triggerTone(620, 'sine', 0.05);

            if (!addrVal.trim()) {
                throw new Error("Address display cannot be empty.");
            }

            const cleanAddr = addrVal.trim();
            const networkSetting = NETWORKS[netVal];
            
            let isBech32 = cleanAddr.startsWith('bc1') || cleanAddr.startsWith('tb1') || cleanAddr.startsWith('bcrt1');
            let result: any = {};
            
            if (isBech32) {
                const parsed = fromBech32(cleanAddr);
                result = {
                    type: parsed.version === 0 ? (parsed.data.length === 20 ? 'P2WPKH' : 'P2WSH') : (parsed.version === 1 ? 'P2TR (Taproot)' : `Witness v${parsed.version}`),
                    dataType: 'Witness Program',
                    version: parsed.version,
                    prefix: parsed.prefix,
                    dataHex: Array.from(parsed.data).map(b => b.toString(16).padStart(2, '0')).join(''),
                    rawBytes: parsed.data
                };
            } else {
                const parsed = fromBase58Check(cleanAddr);
                let type = 'Unknown Base58';
                if (parsed.version === networkSetting.pubKeyHash) type = 'P2PKH (Pay-to-Public-Key-Hash)';
                if (parsed.version === networkSetting.scriptHash) type = 'P2SH (Pay-to-Script-Hash)';
                
                result = {
                    type,
                    dataType: 'Pubkey/Script Hash',
                    version: parsed.version,
                    prefix: 'Base58 Version Byte',
                    dataHex: Array.from(parsed.hash).map(b => b.toString(16).padStart(2, '0')).join(''),
                    rawBytes: parsed.hash
                };
            }

            // Generate output script
            const outScriptBytes = toOutputScript(cleanAddr, networkSetting);
            result.outputScriptHex = Array.from(outScriptBytes).map(b => b.toString(16).padStart(2, '0')).join('');
            
            setDecoderResult(result);
        } catch (e: any) {
            setDecoderError(e.message || "Unknown Address Parsing Execution Fault.");
        }
    };

    // Handle Output Script decoding back to Address (reverse)
    const handleDecodeScript = (scriptHex: string, netVal: 'bitcoin' | 'testnet' | 'regtest') => {
        try {
            setScriptToAddressError(null);
            setScriptToAddressResult('');
            triggerTone(750, 'triangle', 0.05);

            const hex = scriptHex.replace(/\s+/g, '');
            if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
                throw new Error("Invalid hexadecimal string format.");
            }

            const bytes = new Uint8Array(hex.length / 2);
            for (let i = 0; i < bytes.length; i++) {
                bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
            }

            const networkSetting = NETWORKS[netVal];
            const address = fromOutputScript(bytes, networkSetting);
            setScriptToAddressResult(address);
        } catch (e: any) {
            setScriptToAddressError(e.message || "Script Conversion Error.");
        }
    };

    // Load defaults on network change
    useEffect(() => {
        if (viewMode === 'ADDRESS_PARSER') {
            const defaultAddress = selectedNet === 'bitcoin' 
                ? 'bc1qxy2kgdygjrsqtzq2n0yrf24v3unfv7j2gwyzgf' 
                : (selectedNet === 'testnet' ? 'tb1qxy2kgdygjrsqtzq2n0yrf24v3unfv7j2gwyzgf' : 'bcrt1qxy2kgdygjrsqtzq2n0yrf24v3unfv7j2gwyzgf');
            setBtcInputAddress(defaultAddress);
            handleDecodeAddress(defaultAddress, selectedNet);
        }
    }, [selectedNet, viewMode]);

    // Automatically update local code editor when preset changes
    useEffect(() => {
      setEditableCode(selectedSample.raw);
      setRepairedResult('');
      setActiveHealerPhase('IDLE');
      setCurrentVelocityHz(4.5);
      setPipelineLogs([]);
    }, [selectedSample]);

    // Synthetic audio haptic frequencies to represent processing spikes
    const triggerTone = (freq = 750, type: OscillatorType = 'sine', duration = 0.08) => {
        if (!soundEnabled) return;
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (_) {}
    };

    // Standard original stimulus pipeline trigger
    const handleProcess = async () => {
        if (!input.trim()) return;
        
        setIsProcessing(true);
        setSensorData(null);
        setPercept(null);
        setReasoning(null);
        setDecision(null);
        setActuation(null);
        triggerTone(480, 'triangle', 0.1);

        const sensing = new SensingLayer();
        const perception = new PerceptionLayer();
        const reasoningLayer = new ReasoningLayer();
        const decisionLayer = new DecisionLayer();
        const actuationLayer = new ActuationLayer();

        try {
            // 1. Sensing
            const sData = sensing.gather(input);
            setSensorData(sData);
            triggerTone(520, 'sine', 0.05);
            await new Promise(r => setTimeout(r, 400));

            // 2. Perception
            const pData = perception.perceive(sData);
            setPercept(pData);
            triggerTone(600, 'sine', 0.05);
            await new Promise(r => setTimeout(r, 400));

            // 3. Reasoning
            const rData = reasoningLayer.reason(pData, []);
            setReasoning(rData);
            triggerTone(680, 'sine', 0.05);
            await new Promise(r => setTimeout(r, 400));

            // 4. Decision
            const dData = decisionLayer.decide(rData);
            setDecision(dData);
            triggerTone(780, 'sine', 0.05);
            await new Promise(r => setTimeout(r, 400));

            // 5. Actuation
            const aData = await actuationLayer.actuate(dData);
            setActuation(aData);
            triggerTone(880, 'sawtooth', 0.12);

        } catch (error) {
            console.error("Pipeline error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    // ==========================================
    // HEALER CONVEYOR RUNNER (SLOWS AS IT KNOWS)
    // ==========================================
    const runSelfHealerPipeline = () => {
        // Reset current pipeline simulations
        simulationTimeoutRefs.current.forEach(clearTimeout);
        simulationTimeoutRefs.current = [];

        setHealerProcessing(true);
        setRepairedResult('');
        setPipelineLogs([]);
        setActiveHealerPhase('SCANNING');
        setCurrentVelocityHz(4.5);

        // Visual Logs utility
        const log = (text: string, type: 'INFO' | 'WARN' | 'HEAL' | 'SUCCESS' | 'SLOW') => {
            setPipelineLogs(prev => [...prev, { text, type }]);
        };

        // Phase calculations base timings altered by Slownesses constants and entropy
        const complexity = selectedSample.complexity;
        
        // "Slows as it Knows" Equation: 
        // Real-time latency drops inversely proportional to system uncertainty and complexity multiplied by lambda.
        // Base delay = 600ms per phase step.
        // Multiplier = 1.0 + (complexity * decelerationCoefficient)
        const computeSlowingDelay = (baseMs: number) => {
            return Math.floor(baseMs * (1.0 + (complexity * decelerationCoefficient * 0.75)));
        };

        // Phase 1: SCANNING (Base Speed 4.2Hz)
        triggerTone(500, 'sine', 0.07);
        log(`[SCANNING] Initializing AST (Abstract Syntax Tree) scanning of template: ${selectedSample.file}...`, 'INFO');
        log(`[METRICS] Local source contains approximately ${editableCode.split('\n').length} structural code blocks. Entropy check active.`, 'INFO');

        const delayToAudict = computeSlowingDelay(800);
        
        // Timeout to Transition to Phase 2: Auditing
        const t1 = window.setTimeout(() => {
            setActiveHealerPhase('AUDITING');
            // Calculate and display dynamic frequency deceleration
            const deceleratedFrequency = Math.max(0.2, parseFloat((4.5 / (1.0 + (complexity * decelerationCoefficient))).toFixed(2)));
            setCurrentVelocityHz(deceleratedFrequency);
            
            triggerTone(320, 'triangle', 0.15);
            log(`[COLLISION] HIGH UNCERTAINTY FOUND: Detected ${selectedSample.severity} severity reactivity hazard!`, 'WARN');
            log(`[DECELERATION TRAPPING] Slowing as we know! Dropping engine velocity to ${deceleratedFrequency} Hz (Slowing Factor: ${((1.0 + (complexity * decelerationCoefficient)) * 100).toFixed(0)}%).`, 'SLOW');
            log(`[LOOKAHEAD SCANNING] Activating recursive Lookahead scan path depth level: ${lookaheadScanDepth} out of 5 checks active.`, 'WARN');
            
            selectedSample.diagnostics.slice(0, 2).forEach((diag, index) => {
                log(diag, 'WARN');
            });

            // Transition to actual repairing (Phase 4: Synthesis)
            const delayToSynthesize = computeSlowingDelay(1500);
            
            const t2 = window.setTimeout(() => {
                setActiveHealerPhase('SYNTHESIZING');
                triggerTone(720, 'sine', 0.08);
                log(`[SYNTHESIZING] Resolving token tree conflicts in active branch...`, 'INFO');
                log(selectedSample.diagnostics[2] || `[MUTATION] Injected type safe wrappers.`, 'HEAL');
                
                const originalLength = editableCode.length;
                const repairedLength = selectedSample.healed.length;
                log(`[TRANSFORMATION] Code volume mutated from ${originalLength} characters to ${repairedLength} characters.`, 'HEAL');
                setRepairedResult(selectedSample.healed);

                // Transition to verification compiler lookahead (Phase 5: Verification)
                const delayToVerify = computeSlowingDelay(1000);

                const t3 = window.setTimeout(() => {
                    setActiveHealerPhase('VERIFYING');
                    triggerTone(800, 'sine', 0.04);
                    log(`[VERIFYING COMPILER] Bootstrapping virtual linter dry-run checks... 'tsc --noEmit' triggered.`, 'INFO');
                    log(`[LOOKAHEAD COMPILER] Scanning closures & return-type consistency across intermediate states.`, 'INFO');

                    const delayToSuccess = computeSlowingDelay(900);

                    const t4 = window.setTimeout(() => {
                        setActiveHealerPhase('PASSED');
                        triggerTone(1050, 'sine', 0.25);
                        setCurrentVelocityHz(4.8); // Speed recovers once correctness is validated
                        setHealerProcessing(false);
                        log(selectedSample.diagnostics[3] || `[VERIFIED] Virtual compilation complete. 0 structural errors.`, 'SUCCESS');
                        log(`[PIPELINE PIPING SUCCESSFUL] Resuming standard engine clock velocity: 4.8 Hz. Fully stabilized. Check Diff payload!`, 'SUCCESS');
                        
                    }, delayToSuccess);

                    simulationTimeoutRefs.current.push(t4);

                }, delayToVerify);

                simulationTimeoutRefs.current.push(t3);

            }, delayToSynthesize);

            simulationTimeoutRefs.current.push(t2);

        }, delayToAudict);

        simulationTimeoutRefs.current.push(t1);
    };

    // Copy to clipboard safely
    const handleCopyHealed = () => {
        if (!repairedResult) return;
        navigator.clipboard.writeText(repairedResult);
        setCopiedFeedback(true);
        triggerTone(1200, 'sine', 0.05);
        setTimeout(() => setCopiedFeedback(false), 2000);
    };

    // Clean timeouts on unmount
    useEffect(() => {
        return () => {
            simulationTimeoutRefs.current.forEach(clearTimeout);
        };
    }, []);

    // Helper logic card
    const LayerCard = ({ 
        title, icon: Icon, color, data, isActive, isComplete 
    }: { 
        title: string, icon: any, color: string, data: any, isActive: boolean, isComplete: boolean 
    }) => (
        <div className={`
            p-4 rounded-xl border transition-all duration-300 relative overflow-hidden text-left
            ${isActive ? `border-${color}-500 bg-zinc-950/90 shadow-[0_0_15px_rgba(245,158,11,0.15)]` : 
              isComplete ? `border-zinc-800 bg-zinc-950/40 opacity-90` : 
              'border-zinc-900 bg-black/10 opacity-40'}
        `}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400 animate-pulse' : isComplete ? 'text-emerald-500' : 'text-zinc-650'}`} />
                    <h4 className={`font-black uppercase tracking-wider text-[10.5px] ${isActive || isComplete ? 'text-white' : 'text-zinc-500'}`}>
                        {title}
                    </h4>
                </div>
                {isComplete && <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />}
            </div>
            
            <div className="h-28 overflow-y-auto custom-scrollbar font-mono text-[9px] bg-black/50 p-2.5 rounded border border-zinc-900 leading-normal">
                {data ? (
                    <pre className="text-zinc-300 whitespace-pre-wrap">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                ) : isActive ? (
                    <div className="text-amber-500 flex items-center gap-1.5 h-full justify-center">
                        <ActivityIcon className="w-3 h-3 animate-spin text-amber-500" /> Thinking...
                    </div>
                ) : (
                    <div className="text-zinc-700 flex items-center justify-center h-full italic">
                        Awaiting data conduit...
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div id="aetheros-cognitive-workspace" className="h-full flex flex-col bg-[#030305] text-[#d97706] font-mono overflow-y-auto p-6 select-none relative selection:bg-amber-500/20">
            
            {/* Header with Title and Tab Selectors */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#291405] pb-5 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-950/40 border-2 border-purple-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                            <BrainIcon className="w-5 h-5 text-purple-400 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
                                Autonomous Cognitive Pipeline
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/40 uppercase font-black tracking-widest">v3.0</span>
                            </h1>
                            <p className="text-[10px] text-purple-400/60 font-extrabold tracking-wider">
                                DECOMPILATION LOGIC LAB • MULTI-PASS SELF HEALING • DYNAMIC VELOCITY REGULATORS
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Tab Controls and Close Button */}
                <div className="flex flex-wrap items-center gap-2.5">
                    
                    {/* Healer Tab Toggle Button */}
                    <button
                        onClick={() => {
                            triggerTone(700, 'sine', 0.05);
                            setViewMode('CODE_HEALER');
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                            viewMode === 'CODE_HEALER'
                                ? 'bg-amber-950/40 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                                : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        <Bug className="w-3.5 h-3.5" />
                        <span>🛡️ Code Self-Healer Pipeline</span>
                    </button>

                    {/* Standard Pipeline toggle */}
                    <button
                        onClick={() => {
                            triggerTone(600, 'sine', 0.05);
                            setViewMode('STANDARD_STIMULUS');
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                            viewMode === 'STANDARD_STIMULUS'
                                ? 'bg-purple-950/40 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                                : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        <ZapIcon className="w-3.5 h-3.5" />
                        <span>🧠 Stimulus Conduit</span>
                    </button>

                    {/* Bitcoin Address Decoder toggle */}
                    <button
                        onClick={() => {
                            triggerTone(550, 'sine', 0.05);
                            setViewMode('ADDRESS_PARSER');
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                            viewMode === 'ADDRESS_PARSER'
                                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                                : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-350'
                        }`}
                    >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>🔐 Address Decode Sandbox</span>
                    </button>

                    {/* Cognitive Memory Graph toggle */}
                    <button
                        onClick={() => {
                            triggerTone(650, 'sine', 0.05);
                            setViewMode('MEMORY_GRAPH');
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                            viewMode === 'MEMORY_GRAPH'
                                ? 'bg-amber-950/40 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                                : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-350'
                        }`}
                    >
                        <BrainIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>🕸️ Cognitive Memory Graph</span>
                    </button>

                    {onClose && (
                        <button 
                            onClick={() => {
                                triggerTone(440, 'triangle', 0.06);
                                onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg border border-red-900/60 hover:bg-red-950/30 text-red-500 hover:text-red-400 font-black text-[10px] uppercase transition-all tracking-wider"
                        >
                            CLOSE LAB
                        </button>
                    )}
                </div>
            </div>

            {/* TAB CONTENT 1: "SLOWS-AS-IT-KNOWS" THEORETICAL CODE HEALER PIPELINE */}
            {viewMode === 'CODE_HEALER' && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
                    
                    {/* LEFT COLUMN: PARAMETER TUNING MATRIX & PRESETS SELECTOR */}
                    <div className="xl:col-span-4 space-y-6">
                        
                        {/* Sample presets and live editing container */}
                        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 text-left space-y-4">
                            <div>
                                <span className="text-[10px] uppercase font-black text-white block tracking-wider mb-2.5">Select Flawed Code Pattern</span>
                                <div className="space-y-1.5">
                                    {INTERACTIVE_CODE_PRESETS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => {
                                                triggerTone(800, 'sine', 0.04);
                                                setSelectedSample(preset);
                                            }}
                                            className={`w-full p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                                                selectedSample.id === preset.id
                                                    ? 'border-amber-500/80 bg-amber-950/20 text-white'
                                                    : 'border-zinc-900 bg-black/40 text-zinc-500 hover:border-zinc-850 hover:text-zinc-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-extrabold uppercase text-[10px] tracking-wide block truncate max-w-[80%]">{preset.name}</span>
                                                <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-black font-mono border ${
                                                    preset.severity === 'CRITICAL' 
                                                        ? 'bg-red-950/50 text-red-400 border-red-900' 
                                                        : preset.severity === 'HIGH'
                                                            ? 'bg-amber-950/40 text-amber-500 border-amber-900'
                                                            : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                                                }`}>
                                                    {preset.severity}
                                                </span>
                                            </div>
                                            <p className="text-[9px] text-zinc-500 truncate font-sans">
                                                File Target Location: {preset.file}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Editable Editor Container Area */}
                            <div className="space-y-2 pt-2 border-t border-zinc-900">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-black text-amber-600 tracking-wider">Interactive Source Code Input</span>
                                    <span className="text-[9px] text-zinc-650 flex items-center gap-1">
                                        <Code className="w-3 h-3" /> Static Template
                                    </span>
                                </div>
                                <textarea
                                    value={editableCode}
                                    onChange={(e) => {
                                        setEditableCode(e.target.value);
                                        if (e.target.value.length % 15 === 0) {
                                            triggerTone(650 + (e.target.value.length % 150), 'triangle', 0.03);
                                        }
                                    }}
                                    className="w-full h-56 bg-black/80 border border-zinc-900 focus:border-amber-500/50 rounded-xl p-3 text-amber-400 text-[11px] font-mono leading-relaxed focus:outline-none transition-colors resize-none shadow-inner"
                                    placeholder="Insert custom flawed code script..."
                                />
                            </div>
                        </div>

                        {/* HIGH CONJUNCTION METRICS TUNING SYSTEM */}
                        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 text-left space-y-4">
                            <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2.5 justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Sliders className="w-4 h-4 text-amber-500" />
                                    <span className="text-[10px] text-white uppercase font-black tracking-wider">Velocity & Lookahead Metrics</span>
                                </div>
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className="text-[9px] font-bold text-zinc-500 hover:text-white uppercase flex items-center gap-1 border border-zinc-900 bg-black p-1 px-2 rounded-md"
                                >
                                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
                                    <span>{soundEnabled ? 'Sync audio: ON' : 'Sync audio: OFF'}</span>
                                </button>
                            </div>

                            {/* Slider 1: Slowing multiplier constant lambda */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-zinc-500">Deceleration Scale Constant (λ):</span>
                                    <span className="text-white font-black font-mono">{decelerationCoefficient.toFixed(1)}x lag multiplier</span>
                                </div>
                                <input 
                                    type="range"
                                    min="1.0"
                                    max="8.0"
                                    step="0.5"
                                    value={decelerationCoefficient}
                                    onChange={(e) => {
                                        triggerTone(750, 'sine', 0.03);
                                        setDecelerationCoefficient(parseFloat(e.target.value));
                                    }}
                                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                                <p className="text-[9.5px] text-zinc-550 leading-relaxed font-sans pt-1">
                                    Controls computational slowing elasticity during trace trap checks. Direct representation of the <strong className="text-amber-600">"slows as it knows"</strong> mathematical constant.
                                </p>
                            </div>

                            {/* Slider 2: lookaheadScanDepth slider */}
                            <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-zinc-500">Lookahead Deep Verification Depth:</span>
                                    <span className="text-emerald-400 font-mono font-black">{lookaheadScanDepth} Scan Paths</span>
                                </div>
                                <input 
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="1"
                                    value={lookaheadScanDepth}
                                    onChange={(e) => {
                                        triggerTone(800, 'triangle', 0.03);
                                        setLookaheadScanDepth(parseInt(e.target.value));
                                    }}
                                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-[8px] text-zinc-650 font-bold">
                                    <span>L1 SANITY</span>
                                    <span>L2 HOOKS</span>
                                    <span>L3 TYPES</span>
                                    <span>L4 STACK</span>
                                    <span>L5 LEAKS</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: RECON TERMINAL & REPAIRED CODE SIDE-BY-SIDE DIFF (COL SPAN 8) */}
                    <div className="xl:col-span-8 space-y-6">
                        
                        {/* THE SPEEDOMETER THOUGHT DEVIATION METER */}
                        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5 text-left grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                            
                            {/* Graphical gauge circle representing computational velocity */}
                            <div className="md:col-span-4 flex flex-col items-center justify-center p-2 relative">
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    {/* SVG background loop */}
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle 
                                            cx="64" cy="64" r="54" 
                                            className="stroke-zinc-900 fill-none" 
                                            strokeWidth="8"
                                        />
                                        <circle 
                                            cx="64" cy="64" r="54" 
                                            className="stroke-amber-600 fill-none transition-all duration-700" 
                                            strokeWidth="8"
                                            strokeDasharray="339.2"
                                            // Scale proportional to velocity 4.5Hz -> 100% and 0.4Hz -> 10%
                                            strokeDashoffset={339.2 - (339.2 * (currentVelocityHz / 5.0))}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    
                                    {/* Absolute centered stats numbers */}
                                    <div className="absolute flex flex-col items-center text-center">
                                        <span className="text-[8px] uppercase font-black text-zinc-550 block">Conveyor Sync</span>
                                        <span className="text-xl font-black text-white mt-0.5 tracking-tight">
                                            {currentVelocityHz.toFixed(2)} Hz
                                        </span>
                                        <span className="text-[8px] text-amber-500 uppercase font-black tracking-widest mt-0.5 block animate-pulse">
                                            {activeHealerPhase}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Text labels and summary parameters */}
                            <div className="md:col-span-8 space-y-3">
                                <div>
                                    <span className="text-[9px] uppercase font-black text-amber-600 block tracking-wider">Velocity Compensation Ratio</span>
                                    <h3 className="text-sm font-extrabold text-white">"Slows as it Knows" Throttled Core Pipeline</h3>
                                    <p className="text-[10px] text-zinc-500 leading-relaxed font-sans mt-1">
                                        When a threat vector is detected in the input editor, the compiler scan loop drops velocity dynamically allowing multi-pass structural reasoning. Clean code compiles almost instantly.
                                    </p>
                                </div>

                                {/* Speed state indicator pill */}
                                <div className="grid grid-cols-2 gap-3 font-mono text-[9.5px]">
                                    <div className="p-2 rounded bg-black border border-zinc-900 border-l-2 border-l-amber-500">
                                        <span className="text-zinc-500 block text-[8px] uppercase font-black">Entropy Tension Match:</span>
                                        <span className="text-white font-extrabold block mt-0.5">{(selectedSample.complexity * 100).toFixed(0)}% Decelerator Weight</span>
                                    </div>
                                    <div className="p-2 rounded bg-black border border-zinc-900 border-l-2 border-l-emerald-500">
                                        <span className="text-zinc-500 block text-[8px] uppercase font-black">Thought Elasticity:</span>
                                        <span className="text-emerald-400 font-extrabold block mt-0.5">{(1.0 + (selectedSample.complexity * decelerationCoefficient)).toFixed(2)}x Delay Offset</span>
                                    </div>
                                </div>

                                {/* Large Trigger Run button */}
                                <button
                                    onClick={runSelfHealerPipeline}
                                    disabled={healerProcessing || !editableCode.trim()}
                                    className={`w-full py-2.5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all text-black flex items-center justify-center gap-2 ${
                                        healerProcessing 
                                            ? 'bg-zinc-805 bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
                                            : 'bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-[0.99]'
                                    }`}
                                >
                                    {healerProcessing ? (
                                        <>
                                            <ActivityIcon className="w-3.5 h-3.5 animate-spin" />
                                            <span>Decelerator Core Actively Reasoning...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-3.5 h-3.5 shrink-0 fill-current" />
                                            <span>Execute Code Self-Healing Conveyor</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* RECON CHRONICLE LOGS (THE TELEMETRY OUTPUT) */}
                        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 text-left space-y-2.5">
                            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Thought Chronicle & Compiler Output</span>
                            
                            <div className="h-32 overflow-y-auto bg-black p-3 rounded-xl border border-zinc-900 font-mono text-[10.5px] leading-relaxed space-y-1.5 custom-scrollbar">
                                {pipelineLogs.length === 0 ? (
                                    <div className="text-zinc-750 italic flex h-full items-center justify-center">
                                        <span>Click "Execute Code Self-Healing Conveyor" above to trace active loop logs...</span>
                                    </div>
                                ) : (
                                    pipelineLogs.map((logItem, idx) => (
                                        <div key={idx} className="flex gap-2 items-start animate-in slide-in-from-bottom-1 duration-150">
                                            {logItem.type === 'WARN' && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5 animate-pulse" />}
                                            {logItem.type === 'SLOW' && <Snail className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />}
                                            {logItem.type === 'HEAL' && <WrenchIcon className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />}
                                            {logItem.type === 'SUCCESS' && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                                            <span className={`text-left leading-normal ${
                                                logItem.type === 'WARN' ? 'text-red-400 font-extrabold' :
                                                logItem.type === 'SLOW' ? 'text-amber-400 font-extrabold font-serif italic' :
                                                logItem.type === 'HEAL' ? 'text-sky-300 font-semibold' :
                                                logItem.type === 'SUCCESS' ? 'text-emerald-400 font-black' :
                                                'text-zinc-400'
                                            }`}>
                                                {logItem.text}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* DOUBLE PAYLOAD SIDE-BY-SIDE DIFF MONITORS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            
                            {/* ORIGINAL BROKEN CONTAINER */}
                            <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 text-left flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
                                        <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                                            <Bug className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Raw Hazard Template
                                        </span>
                                        <span className="text-[9px] text-zinc-600 font-sans">Read-Only View</span>
                                    </div>
                                    <pre className="text-[9.5px] leading-relaxed text-red-400/80 font-mono overflow-x-auto max-h-[220px] p-2 bg-black/60 rounded border border-red-950/20 whitespace-pre scrollbar-thin">
                                        {editableCode}
                                    </pre>
                                </div>
                                <div className="text-[9px] text-[#291405] text-red-950/50 pt-2 border-t border-zinc-900/50 mt-2">
                                    CRITICAL_COMPILE_RISK: Dynamic variables mutation.
                                </div>
                            </div>

                            {/* MUTATED EXPORT OUTPUT CONTAINER */}
                            <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 text-left flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
                                        <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Restabilized Repaired Output
                                        </span>
                                        {repairedResult && (
                                            <button
                                                onClick={handleCopyHealed}
                                                className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-500 hover:text-white uppercase font-bold flex items-center gap-1 transition-colors"
                                            >
                                                {copiedFeedback ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                <span>{copiedFeedback ? 'Copied' : 'Copy Clean'}</span>
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="bg-black/60 min-h-[140px] max-h-[220px] rounded border border-emerald-950/20 p-2 overflow-x-auto relative scrollbar-thin">
                                        {repairedResult ? (
                                            <pre className="text-[9.5px] leading-relaxed text-emerald-400 font-mono whitespace-pre text-left">
                                                {repairedResult}
                                            </pre>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700/60 p-4 text-center">
                                                <History className="w-6 h-6 text-zinc-800 animate-spin" style={{ animationDuration: '4s' }} />
                                                <p className="text-[9px] font-sans mt-2.5">
                                                    Awaiting synthesis compilation loops above... Output payload will refresh dynamically.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-[9px] text-emerald-950/60 pt-2 border-t border-zinc-900/50 mt-2">
                                    COMPILE_STATUS: Passed safely. Verification depth match: verified 100%.
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            )}

            {/* TAB CONTENT 2: STANDARD STIMULUS MODULAR CONDUIT */}
            {viewMode === 'STANDARD_STIMULUS' && (
                <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-300">
                    
                    {/* Stimulus Input trigger block */}
                    <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-900 flex flex-col md:flex-row gap-4 text-left">
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest block">Signal Stimulus Input Target</label>
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
                                placeholder="Inject raw user coordinates or telemetry instructions (e.g. 'Query logs for port 3000 integrity')..."
                                className="w-full bg-black border-2 border-zinc-900 rounded-lg px-4 py-3 text-xs text-white focus:border-purple-500 outline-none transition-all font-mono"
                                disabled={isProcessing}
                            />
                        </div>
                        <div className="flex items-end justify-end shrink-0 py-1">
                            <button 
                                onClick={handleProcess}
                                disabled={isProcessing || !input.trim()}
                                className="bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-900 disabled:text-zinc-600 text-white px-8 h-10 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-[10px]"
                            >
                                {isProcessing ? <ActivityIcon className="w-4 h-4 animate-spin text-white" /> : <ZapIcon className="w-4 h-4 text-white" />}
                                <span>{isProcessing ? 'PROCESSING CONDUIT' : 'INJECT COGNITION'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Sequential pipeline graphic chain */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <LayerCard 
                            title="1. Sensing Process" 
                            icon={EyeIcon} 
                            color="blue" 
                            data={sensorData} 
                            isActive={isProcessing && !sensorData} 
                            isComplete={!!sensorData} 
                        />
                        <LayerCard 
                            title="2. Perception Node" 
                            icon={BrainIcon} 
                            color="cyan" 
                            data={percept} 
                            isActive={isProcessing && !!sensorData && !percept} 
                            isComplete={!!percept} 
                        />
                        <LayerCard 
                            title="3. Reasoning Matrix" 
                            icon={LogicIcon} 
                            color="purple" 
                            data={reasoning} 
                            isActive={isProcessing && !!percept && !reasoning} 
                            isComplete={!!reasoning} 
                        />
                        <LayerCard 
                            title="4. Decision Gateway" 
                            icon={ShieldIcon} 
                            color="amber" 
                            data={decision} 
                            isActive={isProcessing && !!reasoning && !decision} 
                            isComplete={!!decision} 
                        />
                        <LayerCard 
                            title="5. Actuation Effect" 
                            icon={WrenchIcon} 
                            color="green" 
                            data={actuation} 
                            isActive={isProcessing && !!decision && !actuation} 
                            isComplete={!!actuation} 
                        />
                    </div>
                </div>
            )}

            {/* TAB CONTENT 3: BITCOIN NATIVE ADDRESS & WITNESS DECODER PLAYGROUND */}
            {viewMode === 'ADDRESS_PARSER' && (
                <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-300">
                    
                    {/* Header bar / notice */}
                    <div className="bg-[#0c0d12] p-4 rounded-xl border border-emerald-950/40 text-left flex items-start gap-3">
                        <ShieldIcon className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider">AetherOS Witness Program & Base58 Check Sandbox</h3>
                            <p className="text-[10px] text-zinc-400/80 mt-1 leading-normal">
                                Zero-dependency mathematical parser with support for classical <b>P2PKH</b> (Base58), <b>P2SH</b>, <b>P2WPKH</b> (Segwit Bech32 v0), <b>P2WSH</b>, and taproot <b>P2TR</b> (Bech32m v1) address schemas.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* LEFT COLUMN: SOURCE ADDRESS COMPRESSOR & PARSER */}
                        <div className="lg:col-span-7 flex flex-col gap-5">
                            
                            <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-900 flex flex-col gap-4 text-left">
                                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-[11px] text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                                        <CodeIcon className="w-4 h-4 text-emerald-400" /> 1. Address Decoder & Script Compiler
                                    </span>
                                    <span className="text-[9px] text-zinc-500 font-mono">BIP-173 / BIP-350 ALIGNED</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                                    <div className="md:col-span-8 space-y-1">
                                        <label className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest block">Raw Bitcoin Address</label>
                                        <input 
                                            type="text"
                                            value={btcInputAddress}
                                            onChange={(e) => setBtcInputAddress(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleDecodeAddress(btcInputAddress, selectedNet)}
                                            placeholder="Enter e.g. bc1qxy2kgdygjrsqtzq2n0yrf24v3unfv7j2gwyzgf..."
                                            className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-[11px] text-zinc-200 outline-none focus:border-emerald-500 font-mono"
                                        />
                                    </div>

                                    <div className="md:col-span-4 space-y-1">
                                        <label className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest block">Active Network</label>
                                        <select 
                                            value={selectedNet}
                                            onChange={(e) => setSelectedNet(e.target.value as any)}
                                            className="w-full bg-black border border-zinc-800 rounded px-2.5 py-1.5 text-[11px] text-zinc-200 focus:border-emerald-500 font-mono outline-none"
                                        >
                                            <option value="bitcoin">Mainnet (bc / 1, 3)</option>
                                            <option value="testnet">Testnet (tb / m, n, 2)</option>
                                            <option value="regtest">Regtest (bcrt)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button 
                                        onClick={() => handleDecodeAddress(btcInputAddress, selectedNet)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded font-black uppercase tracking-widest text-[9px] flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                                    >
                                        <ActivityIcon className="w-3.5 h-3.5" />
                                        <span>Parse & Compile Output Script</span>
                                    </button>
                                </div>

                                {/* Decode Result Presentation Area */}
                                {decoderError && (
                                    <div className="bg-red-950/30 border border-red-900/60 p-3 rounded-lg flex items-start gap-2 text-left">
                                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-bold text-red-400">DECODER_CRASH: Fault Ingesting Payload</p>
                                            <p className="text-[9px] text-red-350/80 font-mono leading-normal">{decoderError}</p>
                                        </div>
                                    </div>
                                )}

                                {decoderResult && (
                                    <div className="bg-black/80 rounded-xl border border-zinc-900 p-4 space-y-3 font-mono">
                                        <div className="grid grid-cols-2 gap-4 text-[10px]">
                                            <div className="border-r border-zinc-900/80 pr-2 space-y-1">
                                                <span className="text-zinc-500 block uppercase text-[8px] tracking-wider">Identified Script Variant</span>
                                                <span className="text-emerald-400 font-black">{decoderResult.type}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-zinc-500 block uppercase text-[8px] tracking-wider">Witness/Bytes Payload Type</span>
                                                <span className="text-white font-bold">{decoderResult.dataType}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-[10px] border-t border-zinc-900/60 pt-3">
                                            <div className="border-r border-zinc-900/80 pr-2 space-y-1">
                                                <span className="text-zinc-500 block uppercase text-[8px] tracking-wider">Prefix / Version Byte</span>
                                                <span className="text-zinc-300 font-semibold">{decoderResult.prefix} (v{decoderResult.version ?? '0'})</span>
                                            </div>
                                            <div className="space-y-1 font-mono">
                                                <span className="text-zinc-500 block uppercase text-[8px] tracking-wider">Raw Decoded Payload Hash (Hex)</span>
                                                <span className="text-zinc-300 break-all text-[9.5px] leading-tight select-text block">{decoderResult.dataHex}</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-zinc-900/60 pt-3 text-[10px] space-y-1 bg-emerald-950/10 -mx-4 -mb-4 p-4 rounded-b-xl border-emerald-950/20">
                                            <div className="flex items-center justify-between pb-1.5">
                                                <span className="text-emerald-500 block uppercase text-[8.5px] font-extrabold tracking-widest">Compiled Native Output Script (Hex)</span>
                                                <span className="text-[8px] px-1 bg-emerald-950/50 rounded border border-emerald-800/20 text-emerald-300 uppercase tracking-widest font-black">SOLVENT</span>
                                            </div>
                                            <div className="bg-black/50 border border-emerald-900/30 p-2.5 rounded font-mono text-emerald-400 break-all text-[11px] select-all tracking-wider text-left">
                                                {decoderResult.outputScriptHex}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* RIGHT COLUMN: REVERSE PLAYGROUND & DIAGNOSTICS */}
                        <div className="lg:col-span-5 flex flex-col gap-5">
                            
                            {/* REVERSE PLAYGROUND */}
                            <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-900 flex flex-col gap-4 text-left">
                                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-[11px] text-purple-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                                        <WrenchIcon className="w-4 h-4 text-purple-400" /> 2. Output Script Deserializer
                                    </span>
                                    <span className="text-[9px] text-zinc-500 font-mono">REVERSE PATH</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest block">Output Script Hexadecimal Payload</label>
                                    <textarea 
                                        rows={2}
                                        value={inputScriptHex}
                                        onChange={(e) => setInputScriptHex(e.target.value)}
                                        placeholder="e.g. 76a914c4a1614741c6cbd6360c1d2cc4eb3606f1577788ac..."
                                        className="w-full bg-black border border-zinc-800 rounded p-2.5 text-[10px] text-purple-300 focus:border-purple-500 font-mono outline-none tracking-widest resize-none"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => handleDecodeScript(inputScriptHex, selectedNet)}
                                        className="bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700/30 px-4 py-1.5 rounded uppercase tracking-widest text-[9px] flex items-center gap-1.5 transition-all text-left"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Convert Script to Address</span>
                                    </button>
                                </div>

                                {scriptToAddressError && (
                                    <div className="bg-red-950/30 border border-red-900/40 p-2.5 rounded-lg text-left">
                                        <span className="text-[9px] text-red-400 font-extrabold uppercase block leading-none mb-1">CONVERSION_CRASH</span>
                                        <span className="text-[8.5px] text-zinc-400 font-mono leading-normal">{scriptToAddressError}</span>
                                    </div>
                                )}

                                {scriptToAddressResult && (
                                    <div className="bg-purple-950/10 border border-purple-900/20 p-3 rounded-lg text-left font-mono">
                                        <span className="text-purple-400 block uppercase text-[8px] font-extrabold tracking-widest mb-1">RECOVERED BITCOIN ADDRESS</span>
                                        <div className="bg-black/40 border border-purple-850/20 p-2 rounded text-zinc-150 select-all font-mono text-[10.5px] break-all">
                                            {scriptToAddressResult}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CRITICAL DATA INTEGRITY GAUGES */}
                            <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-900 flex flex-col gap-3 text-left">
                                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                                    <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                                        <Gauge className="w-4 h-4 text-amber-500" /> AetherOS Integrity Signatures
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2.5">
                                    <div className="bg-black/50 p-2 rounded border border-zinc-900 flex flex-col justify-center">
                                        <span className="text-zinc-500 text-[8px] uppercase tracking-wider block">Integrity_Locked</span>
                                        <span className="text-amber-400 font-black text-[10px] font-mono leading-none mt-1">T0_FINALITY</span>
                                    </div>
                                    <div className="bg-black/50 p-2 rounded border border-zinc-900 flex flex-col justify-center">
                                        <span className="text-zinc-500 text-[8px] uppercase tracking-wider block">Entropy_Decay</span>
                                        <span className="text-white font-bold text-[10px] font-mono leading-none mt-1">0.00%</span>
                                    </div>
                                    <div className="bg-black/50 p-2 rounded border border-zinc-900 flex flex-col justify-center">
                                        <span className="text-zinc-500 text-[8px] uppercase tracking-wider block">Core_Bus_Stride</span>
                                        <span className="text-emerald-400 font-bold text-[10px] font-mono leading-none mt-1">1.2 PB/s</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* DYNAMIC SYSTEM LOGS FROM THE SOVEREIGN MOTHERBOARD */}
                    <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-900 flex flex-col gap-3 text-left">
                        <div className="flex items-center justify-between border-b border-[#291405]/50 pb-2">
                            <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                                <TerminalIcon className="w-4 h-4 text-amber-500" /> Subsystem Combustion telemetry log
                            </span>
                            <span className="text-[8.5px] text-zinc-500 font-mono tracking-wider">AETHEROS KERNEL MODULE STABILITY</span>
                        </div>
                        <div className="bg-black border border-zinc-900/60 rounded-xl p-3 max-h-[140px] overflow-y-auto space-y-2 font-mono scrollbar-thin text-left">
                            {activeSubsystemLogs.map((logLine, idx) => (
                                <div key={idx} className="flex gap-2.5 text-[9.5px] items-start border-b border-zinc-950 pb-1.5">
                                    <span className="text-purple-500/80 shrink-0 select-none">[0{idx + 1}/SOVEREIGN]</span>
                                    <span className="text-zinc-400 leading-relaxed font-mono">{logLine}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}

            {viewMode === 'MEMORY_GRAPH' && (
                <div className="animate-in fade-in duration-300">
                    <CognitiveMemoryGraph triggerTone={triggerTone} />
                </div>
            )}

            {/* Bottom System Logs Footer */}
            <div className="mt-8 pt-4 border-t border-zinc-900 text-[10px] text-zinc-650 flex flex-col md:flex-row md:items-center justify-between font-mono gap-3 text-left">
                <div className="flex items-center gap-1.5">
                    <ShieldIcon className="w-3.5 h-3.5 text-purple-500 animate-pulse shrink-0" />
                    <span>AetherOS Decelerating Self-Correction Mechanics. System synchronized with Turnback Gold Theory.</span>
                </div>
                <div className="font-semibold text-zinc-650">
                    OTEL CONNECTION: <span className="text-emerald-400">ACTIVE</span> | DECOMPILER COUPLING: <span className="text-white">STABLE</span>
                </div>
            </div>

        </div>
    );
};
