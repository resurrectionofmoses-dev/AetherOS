
import React, { useState, useEffect, useRef } from 'react';
import { 
    MovieIcon, ActivityIcon, ZapIcon, GaugeIcon, SpinnerIcon, 
    ShieldIcon, FireIcon, CheckCircleIcon, TerminalIcon, 
    GavelIcon, SearchIcon, WarningIcon, UserIcon, RulesIcon, ScaleIcon
} from './icons';
import type { LabComponentProps, FinancialForensicAudit } from '../types';
import { conductAgeVerificationAudit, conductFinancialForensicAudit } from '../services/geminiService';
import { OmniBuilder } from '../services/omniBuilder';

interface AgeAuditReport {
    report: string;
    riskLevel: string;
    complianceChecklist: string[];
    signature: string;
}

export const PornographyStudioView: React.FC<LabComponentProps> = ({ 
  labName = "PORNOGRAPHY STUDIO", 
  labIcon: LabIcon = MovieIcon, 
  labColor = "text-red-900", 
  description = "Forensic analysis of visual pleasure, aesthetics, and neural impact." 
}) => {
  const [fps, setFps] = useState(60);
  const [saturation, setSaturation] = useState(88);
  const [isRendering, setIsRendering] = useState(false);
  const [frameBuffer, setFrameBuffer] = useState<string[]>([]);
  const [hyperMode, setHyperMode] = useState(false);
  const [neuralSaturation, setNeuralSaturation] = useState(42);
  const neuralSaturationRef = useRef(neuralSaturation);
  const [isCrashing, setIsCrashing] = useState(false);
  
  // Update ref whenever state changes
  useEffect(() => {
    neuralSaturationRef.current = neuralSaturation;
  }, [neuralSaturation]);
  
  // Audit States
  const [isAgeAuditing, setIsAgeAuditing] = useState(false);
  const [ageAuditReport, setAgeAuditReport] = useState<AgeAuditReport | null>(null);
  const [isFinancialAuditing, setIsFinancialAuditing] = useState(false);
  const [financialAuditReport, setFinancialAuditReport] = useState<FinancialForensicAudit | null>(null);
  const [studioName, setStudioName] = useState('AetherOS-Internal-Media');

  // ==========================================
  // VIEWING SCREEN & WEAVER TO OMNI-BUILDER STATES
  // ==========================================
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(42);
  const [activeVideoTitle, setActiveVideoTitle] = useState("Vivid_Aesthetic_Manifold_Loop_v4.mp4");
  const [activeVideoMetadata, setActiveVideoMetadata] = useState<any>({
    id: "0x03E2_INIT_LOOP",
    dimensions: "1920x1080",
    fps: 60,
    compression: "H.265 (AetherOS Baseline Profile)",
    purity: 0.94,
    blockchainStatus: "GENESIS_BLOCK_VERIFIED",
    blockStamp: "0xBLOCK_HEIGHT_183421_NONCE_84321_HASH_D4B2A8"
  });
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTimeCode, setCurrentTimeCode] = useState("00:01:24:12");

  // Fragments for the Weaver
  const [fragments, setFragments] = useState([
    { id: 'FRAG_01', name: 'Aesthetic Purity Header', size: '14.2 MB', state: 'UNLOCATED', hash: 'SHA256_e491', bitSignature: '0x03E2_1A' },
    { id: 'FRAG_02', name: 'Neural Chroma Intercept', size: '84.1 MB', state: 'UNLOCATED', hash: 'SHA256_88bc', bitSignature: '0x03E2_FF' },
    { id: 'FRAG_03', name: 'Telemetry Edge Frames', size: '33.9 MB', state: 'UNLOCATED', hash: 'SHA256_d10a', bitSignature: '0x03E2_D4' },
    { id: 'FRAG_04', name: 'Symphonic Censure Stream', size: '121.5 MB', state: 'UNLOCATED', hash: 'SHA256_29fe', bitSignature: '0x03E2_99' },
    { id: 'FRAG_05', name: 'Quantum Keykode Block', size: '9.3 MB', state: 'UNLOCATED', hash: 'SHA256_4eef', bitSignature: '0x03E2_5D' }
  ]);

  const [isWeapingScanActive, setIsWeaperScanActive] = useState(false);
  const [isStitching, setIsStitching] = useState(false);
  const [stitchProgress, setStitchProgress] = useState(0);
  const [weavedVideoResult, setWeavedVideoResult] = useState<any>(null);
  const [isBlockchainVerifyingActive, setIsBlockchainVerifyingActive] = useState(false);
  const [blockchainProofResult, setBlockchainProofResult] = useState<any>(null);
  const [selectedFragments, setSelectedFragments] = useState<string[]>(['FRAG_01', 'FRAG_02', 'FRAG_03']);
  const [customVideoTitleInput, setCustomVideoTitleInput] = useState('Reconstructed_Aether_Chroma');

  // Trigger scanning for hidden traces/fragments
  const runWeaperScan = () => {
    setIsWeaperScanActive(true);
    let currentIdx = 0;
    
    // reset first
    setFragments(prev => prev.map(f => ({ ...f, state: 'UNLOCATED' })));

    const interval = setInterval(() => {
      setFragments(prev => {
        if (currentIdx < prev.length) {
          const next = [...prev];
          next[currentIdx] = { ...next[currentIdx], state: 'LOCATED' };
          setFrameBuffer(fBuffer => [`[WEAVER] Decollected fragment: ${next[currentIdx].name} (${next[currentIdx].id})`, ...fBuffer]);
          currentIdx++;
          return next;
        } else {
          clearInterval(interval);
          setIsWeaperScanActive(false);
          return prev;
        }
      });
    }, 800);
  };

  // Toggle fragment selection
  const toggleFragmentSelection = (id: string) => {
    if (selectedFragments.includes(id)) {
      setSelectedFragments(prev => prev.filter(x => x !== id));
    } else {
      setSelectedFragments(prev => [...prev, id]);
    }
  };

  // Build the stitched video via the OmniBuilder (Video Synthesis Engine)
  const executeWeaveSynthesis = () => {
    if (selectedFragments.length === 0) return;
    setIsStitching(true);
    setStitchProgress(0);
    setWeavedVideoResult(null);
    setBlockchainProofResult(null);

    const interval = setInterval(() => {
      setStitchProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          
          // Execute authentic OmniBuilder Video build!
          const activeFrags = fragments.filter(f => selectedFragments.includes(f.id)).map(f => f.name);
          const builtVideo = OmniBuilder.buildVerifiedVideo(customVideoTitleInput, activeFrags);
          
          setIsStitching(false);
          setWeavedVideoResult(builtVideo);
          
          // Auto load synthesized video into the Player Screen!
          setActiveVideoTitle(`${builtVideo.title}.mp4`);
          setActiveVideoMetadata({
            id: builtVideo.id,
            dimensions: builtVideo.metadata.dimensions,
            fps: builtVideo.metadata.fps,
            compression: builtVideo.metadata.compression,
            purity: 0.99,
            blockchainStatus: "AWAITING_ON_CHAIN_VALIDATION",
            blockStamp: "0xUNCONFIRMED_LEDGER_BLOCK"
          });
          
          setFrameBuffer(prev => [`[OMNI_BUILDER_WS] Synthesized evolutionary video: ${builtVideo.id} Title: "${builtVideo.title}"`, ...prev]);
          return 100;
        }
        return p + 10;
      });
    }, 150);
  };

  // Verify synthesized asset on-chain
  const verifyVideoOnBlockchain = () => {
    if (!weavedVideoResult) return;
    setIsBlockchainVerifyingActive(true);
    
    setTimeout(() => {
      setIsBlockchainVerifyingActive(false);
      setBlockchainProofResult(weavedVideoResult);
      setActiveVideoMetadata(prev => ({
        ...prev,
        blockchainStatus: "VERIFIED_ON_CHAIN",
        blockStamp: weavedVideoResult.blockchainProof
      }));
      setFrameBuffer(prev => [
        `[BLOCKCHAIN] Confirmed verification of ${weavedVideoResult.id}. Cryptographic Proof: ${weavedVideoResult.blockchainProof}`,
        ...prev
      ]);
    }, 1200);
  };

  // Pulse visual playback tracking heartbeat
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setVideoProgress(p => (p >= 100 ? 0 : p + 0.5));
        
        // Advance timecode slightly
        setCurrentTimeCode(prev => {
          const parts = prev.split(':').map(Number);
          let ff = parts[3] + 1;
          let ss = parts[2];
          let mm = parts[1];
          let hh = parts[0];
          if (ff >= 24) {
             ff = 0;
             ss += 1;
          }
          if (ss >= 60) {
             ss = 0;
             mm += 1;
          }
          if (mm >= 60) {
             mm = 0;
             hh += 1;
          }
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
        });
      }, 40); // ~24 fps cycle speed
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isPlaying]);

  // Film stock and Keykode states
  const [selectedStock, setSelectedStock] = useState('5219'); // '5219' (Vision3 500T), '5222' (Double-X), '5294' (Ektachrome)
  const [frameOffset, setFrameOffset] = useState(1042);
  const [isIndexingRoll, setIsIndexingRoll] = useState(false);
  const [indexedFrames, setIndexedFrames] = useState<{frame: number, keykode: string, edgeCode: string, timecode: string, event: string}[]>([]);

  const getKeykode = (frame: number, stock: string) => {
    const prefix = stock === '5219' ? 'KJ 88' : stock === '5222' ? 'KK 44' : 'KE 99';
    const roll = stock === '5219' ? '1042' : stock === '5222' ? '8802' : '3141';
    const feet = Math.floor(frame / 16);
    const offset = frame % 16;
    const feetStr = feet.toString().padStart(4, '0');
    const offsetStr = offset.toString().padStart(2, '0');
    return `${prefix} ${roll} ${feetStr}+${offsetStr}`;
  };

  const getTimecode = (frame: number) => {
    const totalSecs = Math.floor(frame / 24);
    const ff = (frame % 24).toString().padStart(2, '0');
    const hh = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
    const mm = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    const ss = (totalSecs % 60).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}:${ff}`;
  };

  const getMfgData = (stock: string) => {
    switch(stock) {
      case '5219':
        return {
          emulsion: '883-201-042',
          process: 'ECN-2 (Color Negative)',
          exposureIndex: '500T (Tungsten)',
          format: '35mm 4-Perf',
          mfgDate: 'OCTOBER 2025',
          mfgLocation: 'ROCHESTER, NY, USA'
        };
      case '5222':
        return {
          emulsion: '512-402-109',
          process: 'D-96 (Black & White)',
          exposureIndex: '250D / 200T',
          format: '35mm 4-Perf',
          mfgDate: 'JANUARY 2026',
          mfgLocation: 'ROCHESTER, NY, USA'
        };
      case '5294':
      default:
        return {
          emulsion: '314-159-880',
          process: 'E-6 (Color Reversal)',
          exposureIndex: '100D (Daylight)',
          format: '35mm 4-Perf',
          mfgDate: 'APRIL 2026',
          mfgLocation: 'ROCHESTER, NY, USA'
        };
    }
  };

  const startIndexingProcess = () => {
    setIsIndexingRoll(true);
    setIndexedFrames([]);
    let frameList: any[] = [];
    let currentF = frameOffset;
    const events = [
      "Roll Start Beacon Detected",
      "Scene 01 / Intro - Establishing Shot",
      "Dopamine Amplitude Alignment",
      "Symphonic Censure Transition",
      "Scene 02 - Core Climax Stream",
      "Hyper-Frequency Render Intercept",
      "Scene 03 - Forensic Audit Intercept",
      "Absolute Resolution Transition",
      "Scene 04 / Finale - Integration",
      "Roll Tail Out Metadata Marker"
    ];

    setTimeout(() => {
      events.forEach((evt, index) => {
        const fOffset = currentF + (index * 168);
        frameList.push({
          frame: fOffset,
          keykode: getKeykode(fOffset, selectedStock),
          edgeCode: selectedStock === '5219' ? '▲ KODAK 5219' : selectedStock === '5222' ? '▲ EASTMAN 5222' : '▲ KODAK 5294',
          timecode: getTimecode(fOffset),
          event: evt
        });
      });
      setIndexedFrames(frameList);
      setIsIndexingRoll(false);
    }, 1500);
  };

  useEffect(() => {
    let interval: number;
    if (isRendering) {
      interval = window.setInterval(() => {
        setFps(prev => {
            const base = hyperMode ? 144 : 60;
            return Math.max(1, Math.min(240, base + (Math.random() - 0.5) * (hyperMode ? 50 : 10)));
        });
        setSaturation(prev => {
            const base = hyperMode ? 150 : 88;
            return Math.max(0, Math.min(300, base + (Math.random() - 0.5) * (hyperMode ? 30 : 5)));
        });
        setNeuralSaturation(prev => {
            if (isCrashing) return Math.min(100, prev + 5);
            return Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * (hyperMode ? 10 : 2)));
        });
        setFrameOffset(prev => prev + 1);
        setFrameBuffer(prev => {
            const hex = "0x" + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
            const prefix = hyperMode ? "[CRITICAL_OVERFLOW] " : "[RENDER] ";
            return [`${prefix}Frame ${hex} processed. KEYKODE: ${getKeykode(frameOffset + 1, selectedStock)}`, ...prev].slice(0, 10);
        });

        if (hyperMode && neuralSaturationRef.current > 95 && !isCrashing) {
            triggerNeuralCrash();
        }
      }, hyperMode ? 100 : 500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRendering, hyperMode, isCrashing, frameOffset, selectedStock]);

  const triggerNeuralCrash = () => {
    setIsCrashing(true);
    setFrameBuffer(prev => ["[FATAL] NEURAL_BUFFER_EXHAUSTED", "[SYSTEM] Emergency stasis initiated.", ...prev]);
    setTimeout(() => {
        setIsCrashing(false);
        setHyperMode(false);
        setIsRendering(false);
        setNeuralSaturation(42);
    }, 3000);
  };

  const runAgeAudit = async () => {
    setIsAgeAuditing(true);
    setAgeAuditReport(null);
    try {
        const result = await conductAgeVerificationAudit(studioName);
        setAgeAuditReport(result);
    } catch (e) {
        console.error(e);
    } finally {
        setIsAgeAuditing(false);
    }
  };

  const runFinancialAudit = async () => {
    setIsFinancialAuditing(true);
    setFinancialAuditReport(null);
    try {
        const result = await conductFinancialForensicAudit(studioName);
        setFinancialAuditReport(result);
    } catch (e) {
        console.error(e);
    } finally {
        setIsFinancialAuditing(false);
    }
  };

  return (
    <div className={`h-full flex flex-col bg-[#050000] overflow-hidden font-mono text-red-100 transition-all duration-300 ${hyperMode ? 'bg-red-950/20' : ''} ${isCrashing ? 'animate-pulse grayscale contrast-200' : ''}`}>
      <div className={`p-6 border-b-8 border-black flex justify-between items-center shadow-xl z-20 transition-colors ${hyperMode ? 'bg-red-600/20' : 'bg-red-950/40'}`}>
        <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-red-900/10 border-4 border-red-900 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(153,27,27,0.3)] transition-all ${hyperMode ? 'scale-110 rotate-3 border-red-500 shadow-red-500/50' : ''}`}>
                <LabIcon className={`w-10 h-10 ${labColor} ${hyperMode ? 'animate-bounce text-red-400' : 'animate-pulse'}`} />
            </div>
            <div>
                <h2 className={`font-comic-header text-5xl italic tracking-tighter uppercase leading-none transition-colors ${hyperMode ? 'text-red-400' : 'text-white'}`}>
                    {hyperMode ? 'HYPER-SATURATION LAB' : labName}
                </h2>
                <p className="text-[9px] text-red-900 font-black uppercase tracking-[0.4em] mt-1 italic">
                    {hyperMode ? "WARNING: NEURAL OVERFLOW DETECTED // PROTOCOL_WORST" : description}
                </p>
            </div>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => setHyperMode(!hyperMode)}
                className={`px-4 py-3 rounded-2xl border-4 border-black font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${hyperMode ? 'bg-red-500 text-white animate-ping' : 'bg-zinc-900 text-red-900 hover:text-red-500'}`}
            >
                {hyperMode ? 'ABORT HYPER-MODE' : 'HYPER-INTENSITY'}
            </button>
            <button 
                onClick={runFinancialAudit}
                disabled={isFinancialAuditing}
                className="px-6 py-3 bg-zinc-900 hover:bg-emerald-900/40 text-emerald-500 border-4 border-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center gap-2"
            >
                {isFinancialAuditing ? <SpinnerIcon className="w-4 h-4" /> : <ScaleIcon className="w-4 h-4" />}
                FINANCIAL FORENSICS
            </button>
            <button 
                onClick={() => {
                  setIsRendering(!isRendering);
                  if (!isRendering) {
                    setFrameBuffer(prev => ["[MAESTRO] Initializing Deep Capture...", ...prev]);
                  }
                }}
                className={`px-6 py-3 rounded-2xl border-4 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isRendering ? 'bg-amber-500 text-black' : 'bg-red-600 text-white animate-pulse'}`}
            >
                {isRendering ? 'HALT PRODUCTION' : 'INITIATE CAPTURE'}
            </button>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto custom-scrollbar">
        
        {/* Render Engine Monitor */}
        <div className={`lg:col-span-8 aero-panel bg-black/80 border-4 border-black p-8 flex flex-col justify-center items-center relative overflow-hidden shadow-[12px_12px_0_0_#000] ${hyperMode ? 'border-red-500/50' : ''}`}>
             {(isCrashing || (hyperMode && Math.random() > 0.95)) && (
                 <div className="absolute inset-0 z-50 bg-red-600/40 flex flex-col items-center justify-center backdrop-blur-sm">
                     <span className="text-6xl font-black text-white italic tracking-tighter animate-bounce uppercase">NEURAL CRASH</span>
                     <p className="text-xs font-black text-black bg-white px-2 mt-4 tracking-widest uppercase">FATAL_DOPAMINE_CIRCUIT_BREAK</p>
                 </div>
             )}
             
             {neuralSaturation > 90 && !isCrashing && (
                 <div className="absolute top-10 right-10 z-40 bg-white p-4 border-4 border-red-600 animate-bounce">
                     <p className="text-xs font-black text-red-600 uppercase tracking-widest">CRITICAL: DOPAMINE EXHAUSTION</p>
                 </div>
             )}

             <div className="absolute bottom-4 left-4 z-40">
                <div className="flex items-center gap-2 p-2 bg-black border border-red-500/30 rounded text-[8px] font-black text-red-500 animate-pulse">
                    <ShieldIcon className="w-3 h-3" />
                    BOUNTY_TEMPLAR_ACTIVE // SCANNING_FOR_LEGAL_DRIFT
                </div>
             </div>
             
             <style>{`
                @keyframes circuitFlow {
                  0% { stroke-dashoffset: 200; }
                  100% { stroke-dashoffset: 0; }
                }
                @keyframes circuitProcessingPulse {
                  0%, 100% { opacity: 0.15; transform: scale(1); }
                  50% { opacity: 0.75; transform: scale(1.02); }
                }
                .circuit-line {
                  stroke-dasharray: 12, 24;
                  animation: circuitFlow ${hyperMode ? '3s' : isRendering ? '6s' : '15s'} linear infinite${isRendering ? ', circuitProcessingPulse 1.8s ease-in-out infinite' : ''};
                  transition: stroke-dasharray 0.3s, stroke 0.3s, transform 0.5s ease-in-out;
                  transform-origin: center;
                }
                .aero-panel:hover .circuit-line {
                  animation-duration: ${hyperMode ? '0.75s' : isRendering ? '1.5s' : '3s'}${isRendering ? ', 0.9s' : ''};
                }
                @keyframes nodePulse {
                  0%, 100% { transform: scale(1); opacity: 0.3; }
                  50% { transform: scale(1.4); opacity: 0.8; }
                }
                .circuit-node {
                  transform-origin: center;
                  animation: nodePulse 3s ease-in-out infinite;
                  transition: fill 0.3s, transform 0.3s;
                }
                .aero-panel:hover .circuit-node {
                  animation-duration: 0.75s;
                }
                @keyframes forensicGridScan {
                  0% { top: 0%; opacity: 0; }
                  10% { opacity: 0.5; }
                  90% { opacity: 0.5; }
                  100% { top: 100%; opacity: 0; }
                }
                .forensic-grid-scanner {
                  animation: forensicGridScan ${hyperMode ? '2.5s' : isRendering ? '5s' : '12s'} linear infinite;
                }
                .aero-panel:hover .forensic-grid-scanner {
                  animation-duration: ${hyperMode ? '0.625s' : isRendering ? '1.25s' : '2.5s'};
                }
              `}</style>

             <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#991b1b 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

             {/* Animated visual telemetry circuit logic paths */}
             <svg 
               className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.15]" 
               viewBox="0 0 800 500" 
               preserveAspectRatio="none"
             >
               <g fill="none" strokeWidth="2" strokeLinecap="round">
                 {/* Left branch */}
                 <path 
                   d="M 50 100 L 150 200 L 350 200 L 400 250" 
                   stroke={hyperMode ? '#ef4444' : '#991b1b'} 
                   className="circuit-line" 
                 />
                 <path 
                   d="M 150 200 L 100 250 L 100 400" 
                   stroke={hyperMode ? '#f87171' : '#7f1d1d'} 
                   className="circuit-line" 
                   style={{ animationDelay: '-1.5s' }}
                 />
                 
                 {/* Center branch */}
                 <path 
                   d="M 400 50 L 400 450" 
                   stroke={hyperMode ? '#fca5a5' : '#b91c1c'} 
                   className="circuit-line" 
                   style={{ animationDelay: '-3.5s' }}
                 />

                 {/* Right branch */}
                 <path 
                   d="M 750 100 L 650 200 L 450 200 L 400 250" 
                   stroke={hyperMode ? '#ef4444' : '#991b1b'} 
                   className="circuit-line" 
                   style={{ animationDelay: '-2.5s' }}
                 />
                 <path 
                   d="M 650 200 L 700 250 L 700 400" 
                   stroke={hyperMode ? '#f87171' : '#7f1d1d'} 
                   className="circuit-line" 
                   style={{ animationDelay: '-4.5s' }}
                 />

                 {/* Bottom inputs */}
                 <path 
                   d="M 200 450 L 300 350 L 500 350 L 600 450" 
                   stroke={hyperMode ? '#ef4444' : '#991b1b'} 
                   className="circuit-line" 
                   style={{ animationDelay: '-5.5s' }}
                 />
               </g>

               {/* Circuit Nodes */}
               <g fill={hyperMode ? '#f87171' : '#b91c1c'}>
                 <circle cx="50" cy="100" r="4.5" className="circuit-node" style={{ animationDelay: '0.2s', transformBox: 'fill-box' }} />
                 <circle cx="150" cy="200" r="4.5" className="circuit-node" style={{ animationDelay: '0.8s', transformBox: 'fill-box' }} />
                 <circle cx="350" cy="200" r="4.5" className="circuit-node" style={{ animationDelay: '1.4s', transformBox: 'fill-box' }} />
                 <circle cx="400" cy="250" r="5.5" className="circuit-node" style={{ animationDelay: '2s', transformBox: 'fill-box', fill: hyperMode ? '#fca5a5' : '#ef4444' }} />
                  
                 <circle cx="100" cy="400" r="4.5" className="circuit-node" style={{ animationDelay: '1.1s', transformBox: 'fill-box' }} />
                 <circle cx="750" cy="100" r="4.5" className="circuit-node" style={{ animationDelay: '0.5s', transformBox: 'fill-box' }} />
                 <circle cx="650" cy="200" r="4.5" className="circuit-node" style={{ animationDelay: '1.2s', transformBox: 'fill-box' }} />
                 <circle cx="450" cy="200" r="4.5" className="circuit-node" style={{ animationDelay: '1.7s', transformBox: 'fill-box' }} />
                 <circle cx="700" cy="400" r="4.5" className="circuit-node" style={{ animationDelay: '2.5s', transformBox: 'fill-box' }} />
                  
                 <circle cx="200" cy="450" r="4.5" className="circuit-node" style={{ animationDelay: '0.9s', transformBox: 'fill-box' }} />
                 <circle cx="300" cy="350" r="4.5" className="circuit-node" style={{ animationDelay: '1.5s', transformBox: 'fill-box' }} />
                 <circle cx="500" cy="350" r="4.5" className="circuit-node" style={{ animationDelay: '2.1s', transformBox: 'fill-box' }} />
                 <circle cx="600" cy="450" r="4.5" className="circuit-node" style={{ animationDelay: '2.7s', transformBox: 'fill-box' }} />
               </g>
             </svg>

             {/* Forensic laser sweep line */}
             <div className={`absolute left-0 right-0 h-[2px] pointer-events-none z-10 ${hyperMode ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]' : 'bg-red-900 shadow-[0_0_6px_rgba(153,27,27,0.5)]'} forensic-grid-scanner`} />
                     <div className="text-center space-y-8 relative z-10 w-full animate-in fade-in duration-300">
                <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
                    <div className="text-left">
                        <p className={`text-[10px] font-black uppercase tracking-[0.5em] mb-2 ${hyperMode ? 'text-red-400 animate-pulse' : 'text-red-900'}`}>Neural Frame Resonance</p>
                        <div className={`text-6xl font-black text-white wisdom-glow tracking-tighter leading-none ${hyperMode ? 'scale-110 text-red-100' : ''}`}>
                            {Math.floor(fps)}<span className={`text-lg ml-1 ${hyperMode ? 'text-red-500' : 'text-red-900'}`}>FPS</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Conjunction Stride</p>
                        <p className={`text-2xl font-comic-header ${hyperMode ? 'text-red-400' : 'text-red-500'}`}>
                            {hyperMode ? '9.8 EB/S' : '1.2 PB/S'}
                        </p>
                    </div>
                </div>

                {/* ==========================================
                    HIGH-POLISHED INTERACTIVE VIEWING SCREEN
                    ========================================== */}
                <div className="w-full bg-zinc-950/90 border-4 border-zinc-900 rounded-3xl p-6 shadow-2xl relative text-left">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-red-600 animate-ping' : 'bg-zinc-800'}`} />
                            <span className="text-[8.5px] uppercase font-bold tracking-widest text-[#ef4444] animate-pulse">
                                {isPlaying ? 'CAPTURE VIDEO SIGNAL FEED' : 'STATIC FREEZE MATCH'}
                            </span>
                        </div>
                        <span className="text-[8px] text-zinc-600 font-mono tracking-widest uppercase text-right">
                            DEEP_RECONSTRUCTION // {activeVideoMetadata.id}
                        </span>
                    </div>

                    {/* Video Render Stage */}
                    <div className="relative w-full aspect-video bg-[#0c0202] border-2 border-zinc-900 rounded-2xl overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                        {/* CRT Scanline effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-red-950/10 via-transparent to-red-950/10 pointer-events-none z-10" />

                        {/* Top Telemetry overlay */}
                        <div className="relative z-10 flex justify-between select-none">
                            <div className="text-[8px] font-black text-red-500 px-1.5 py-0.5 bg-black/80 border border-red-900/30 rounded">
                                REC ◄ {currentTimeCode}
                            </div>
                            <div className="text-[8px] tracking-wider font-black text-zinc-400 px-1.5 py-0.5 bg-black/80 border border-zinc-900 rounded">
                                {((videoProgress/100) * 144).toFixed(0)}f
                             </div>
                         </div>

                         {/* Core dynamic abstract pixels simulating play action */}
                         <div className="absolute inset-2 grid grid-cols-12 grid-rows-6 gap-1 opacity-[0.22] pointer-events-none animate-pulse">
                             {Array(72).fill(0).map((_, idx) => {
                                 let colorFactor = Math.abs(Math.sin(idx * 0.2 + videoProgress * 0.15) * 255);
                                 if (hyperMode) colorFactor = Math.min(255, colorFactor * 1.5);
                                 return (
                                     <div 
                                         key={idx} 
                                         className="w-full h-full rounded-sm transition-colors duration-100"
                                         style={{
                                             backgroundColor: isPlaying
                                                 ? `rgb(${Math.floor(colorFactor)}, ${Math.floor(colorFactor * 0.1)}, ${Math.floor(colorFactor * 0.2)})`
                                                 : 'rgb(24, 6, 6)'
                                         }}
                                     />
                                 );
                             })}
                         </div>

                         {/* Aesthetic Wave graph */}
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                             {isPlaying ? (
                                 <div className="flex items-end gap-1 h-1/4 opacity-40">
                                     {Array(18).fill(0).map((_, i) => {
                                         const h = 15 + Math.sin(videoProgress * 0.2 + i * 0.8) * 45 + Math.cos(videoProgress * 0.1 + i) * 20;
                                         return (
                                             <div 
                                                 key={i} 
                                                 className="w-1 bg-red-600 rounded-t"
                                                 style={{ height: `${Math.max(5, Math.min(100, h))}%` }}
                                             />
                                         );
                                     })}
                                 </div>
                             ) : (
                                 <span className="text-[7.5px] tracking-[0.3em] text-red-955 uppercase font-black animate-pulse">
                                     [ Aesthetic Frame Frozen ]
                                 </span>
                             )}
                         </div>

                         {/* Center info plate */}
                         <div className="relative z-20 flex flex-col items-center justify-center pointer-events-none self-center">
                             <div className="bg-black/85 border border-zinc-900 p-3 rounded-xl max-w-xs text-center shadow-2xl backdrop-blur-sm">
                                 <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest mb-1 select-none">ACTIVE TELEVISION FEED</p>
                                 <p className="text-[11px] text-zinc-200 font-bold truncate mb-1.5">{activeVideoTitle}</p>
                                 <span className="text-[7.5px] bg-red-950/40 text-red-400 px-1.5 py-0.5 rounded border border-red-900/40 font-black">
                                     {activeVideoMetadata.dimensions} @ {activeVideoMetadata.fps}Hz
                                 </span>
                             </div>
                         </div>

                         {/* Bottom security stamp & blockchain marker */}
                         <div className="relative z-10 flex justify-between items-end select-none">
                             <div className="text-[7px] font-black text-zinc-500 tracking-wider">
                                 SECURE CHANNEL STABILITY_LOCKED
                             </div>
                             
                             {activeVideoMetadata.blockchainStatus === "VERIFIED_ON_CHAIN" ? (
                                 <div className="text-[7px] font-black bg-emerald-950/80 border border-emerald-500 text-emerald-400 rounded px-1.5 py-0.5 tracking-wider animate-pulse flex items-center gap-1">
                                     ✓ BLOCKCHAIN LEDGER SYNCHRONIZED
                                 </div>
                             ) : (
                                 <div className="text-[7px] font-bold bg-[#3b0712] border border-red-800 text-red-400 rounded px-1.5 py-0.5 flex items-center gap-1">
                                     ⚠ UNREGISTERED BLOCK RECORD
                                 </div>
                             )}
                         </div>
                     </div>

                     {/* Audio-Video Playback controls */}
                     <div className="mt-4 space-y-3">
                         {/* Slider timeline tracker */}
                         <div className="flex items-center gap-3 text-[9px] font-mono">
                             <span className="text-zinc-600 select-none">00:00</span>
                             <div 
                                 onClick={(e) => {
                                     const rect = e.currentTarget.getBoundingClientRect();
                                     const x = e.clientX - rect.left;
                                     const pct = Math.floor((x / rect.width) * 100);
                                     setVideoProgress(pct);
                                 }}
                                 className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden cursor-pointer relative border border-zinc-800"
                             >
                                 <div 
                                     className="h-full bg-red-600 transition-all duration-75 relative" 
                                     style={{ width: `${videoProgress}%` }}
                                 >
                                     <span className="absolute right-0 top-0 bottom-0 w-0.5 bg-white" />
                                 </div>
                             </div>
                             <span className="text-red-400 font-bold">{videoProgress.toFixed(0)}%</span>
                         </div>

                         {/* Panel Actions */}
                         <div className="flex justify-between items-center bg-black/50 p-3 rounded-2xl border border-zinc-900 text-[10px]">
                             <div className="flex gap-2">
                                 <button 
                                     onClick={() => setIsPlaying(!isPlaying)}
                                     className={`px-3 py-1.5 rounded-lg font-black uppercase text-[8px] tracking-widest border transition-all ${isPlaying ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-red-600 text-white border-red-500 animate-pulse'}`}
                                 >
                                     {isPlaying ? 'PAUSE' : 'PLAY'}
                                 </button>
                                 <button 
                                     onClick={() => { setVideoProgress(0); setCurrentTimeCode("00:00:00:00"); }}
                                     className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-lg font-black uppercase text-[8px] border border-zinc-800 transition-all"
                                 >
                                     RESTART
                                 </button>
                             </div>

                             <div className="flex items-center gap-3 text-zinc-500">
                                 <button 
                                     onClick={() => setIsMuted(!isMuted)} 
                                     className="hover:text-white text-[8px] font-bold uppercase transition-colors"
                                 >
                                     {isMuted ? 'UNMUTE' : 'MUTE'}
                                 </button>
                                 <input 
                                     type="range" 
                                     min="0" 
                                     max="100" 
                                     value={isMuted ? 0 : volume}
                                     onChange={(e) => {
                                         setVolume(Number(e.target.value));
                                         setIsMuted(false);
                                     }}
                                     className="w-14 h-1 accent-red-600 bg-zinc-800 rounded cursor-pointer"
                                 />
                                 <span className="text-zinc-400 font-bold w-6 text-right">{isMuted ? 0 : volume}%</span>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Traditional stat counters */}
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                     <div className="p-4 bg-black border-2 border-red-900/20 rounded-2xl relative overflow-hidden text-left shadow-lg">
                         <p className="text-[7.5px] text-red-800 font-black uppercase mb-1">Color Saturation</p>
                         <p className="text-xl font-comic-header text-white">{saturation.toFixed(1)}%</p>
                         {hyperMode && <div className="absolute bottom-0 left-0 h-0.5 bg-red-500 animate-pulse" style={{ width: `${(saturation/300)*100}%` }} />}
                     </div>
                     <div className="p-4 bg-black border-2 border-red-900/20 rounded-2xl text-left shadow-lg">
                         <p className="text-[7.5px] text-red-800 font-black uppercase mb-1">Censure Bypass</p>
                         <p className={`text-xl font-comic-header ${hyperMode ? 'text-red-400 animate-ping' : 'text-green-500'}`}>
                             {hyperMode ? 'OVERLOAD' : 'ACTIVE'}
                         </p>
                     </div>
                     <div className="p-4 bg-black border-2 border-red-900/20 rounded-2xl text-left shadow-lg">
                         <p className="text-[7.5px] text-red-800 font-black uppercase mb-1">Neural Saturation</p>
                         <p className={`text-xl font-comic-header ${neuralSaturation > 80 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                             {neuralSaturation.toFixed(1)}%
                         </p>
                     </div>
                     <div className={`p-4 bg-black border-2 rounded-2xl text-left shadow-lg transition-colors ${ageAuditReport?.riskLevel === 'CRITICAL' ? 'border-red-600 bg-red-900/20' : 'border-red-900/20'}`}>
                         <p className="text-[7.5px] text-red-800 font-black uppercase mb-1">Age Gate Status</p>
                         <p className={`text-xl font-comic-header ${ageAuditReport?.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-amber-500 animate-pulse'}`}>{ageAuditReport?.riskLevel || 'PENDING'}</p>
                     </div>
                 </div></div>

                {/* KODAK Film Stock & Telecine Indexer Deck */}
                <div className="w-full mt-8 p-6 bg-zinc-950/90 border-4 border-zinc-900 rounded-3xl relative overflow-hidden text-left shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]">
                    <div className="absolute top-2 right-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        <span className="text-[7.5px] font-black text-red-500 tracking-wider">TELECINE ONLINE // CODE_ADMIN: CHRIST</span>
                    </div>
                    
                    <h4 className="font-comic-header text-xl text-white uppercase italic mb-1 flex items-center gap-2">
                         KODAK Keykode & Telecine Deck
                    </h4>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-4">
                        Automated Film-Stock Indexing, Edge-Code Demultiplexing & Manufacturing Verification
                    </p>

                    {/* Stock Chooser & Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="text-[8px] text-zinc-500 font-black uppercase block mb-1">Select Film Stock</label>
                            <select 
                                value={selectedStock}
                                onChange={(e) => {
                                    setSelectedStock(e.target.value);
                                    setFrameOffset(1000 + Math.floor(Math.random() * 5000));
                                }}
                                className="w-full bg-black border-2 border-zinc-800 text-zinc-300 font-mono text-[10px] p-2 rounded-lg focus:outline-none focus:border-red-500"
                            >
                                <option value="5219">KODAK VISION3 500T 35mm (5219)</option>
                                <option value="5222">EASTMAN DOUBLE-X B&W 35mm (5222)</option>
                                <option value="5294">KODAK EKTACHROME 100D 35mm (5294)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[8px] text-zinc-500 font-black uppercase block mb-1">Seek Frame (Manual Override)</label>
                            <input 
                                type="range"
                                min="0"
                                max="10000"
                                value={frameOffset}
                                onChange={(e) => setFrameOffset(parseInt(e.target.value))}
                                className="w-full h-8 accent-red-600 border border-zinc-800 rounded bg-transparent cursor-pointer"
                            />
                        </div>
                        <div className="flex gap-2 items-end">
                            <button
                                onClick={startIndexingProcess}
                                disabled={isIndexingRoll}
                                className="w-full py-2 px-3 bg-red-950/30 hover:bg-red-900/40 disabled:hover:bg-red-950/30 text-red-400 font-bold font-mono text-[9px] rounded border border-red-500/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <SearchIcon className="w-3 h-3" />
                                {isIndexingRoll ? "INDEXING ROLL..." : "INDEX ROLL"}
                            </button>
                        </div>
                    </div>

                    {/* Horizontal Film Strip Visualizer */}
                    <div className="w-full p-4 bg-zinc-950 border-y-4 border-dashed border-zinc-800 relative select-none font-mono my-4 overflow-hidden h-28 flex flex-col justify-between">
                        {/* Top Sprocket Holes */}
                        <div className="flex justify-between text-zinc-800 text-[10px] leading-none tracking-widest pointer-events-none">
                            <span>■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■</span>
                        </div>
                        
                        {/* Core Negative Overlay Information */}
                        <div className="flex justify-between items-center text-red-500/80 text-[10px] uppercase font-bold tracking-wider px-4">
                            <div className="flex items-center gap-4">
                                <span className="text-zinc-600">◄ {selectedStock === '5219' ? 'EASTMAN KODAK 5219' : selectedStock === '5222' ? 'EASTMAN DOUBLE-X 5222' : 'EASTMAN KODAK 5294'}</span>
                                <span className="text-zinc-600">LOT {getMfgData(selectedStock).emulsion.split('-')[0]}</span>
                            </div>
                            
                            {/* Live Keykode display */}
                            <div className="border border-red-500/20 px-2 py-0.5 bg-red-950/30 rounded flex items-center gap-4 text-xs">
                                <span className="text-red-400 font-black tracking-widest">{getKeykode(frameOffset, selectedStock)}</span>
                                <span className="text-zinc-700 font-normal select-none">|| |||| | | ||| |</span>
                            </div>

                            <span className="text-zinc-600">TC {getTimecode(frameOffset)}</span>
                        </div>

                        {/* Bottom Sprocket Holes */}
                        <div className="flex justify-between text-zinc-800 text-[10px] leading-none tracking-widest pointer-events-none">
                            <span>■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■ &nbsp; ■</span>
                        </div>
                    </div>

                    {/* Manufacturing Edge-Code Register */}
                    <div className="bg-black/60 rounded-xl p-4 border border-zinc-900 grid grid-cols-2 lg:grid-cols-4 gap-4 text-[10px] font-mono mb-4">
                        <div>
                            <span className="text-zinc-500 block uppercase text-[7.5px] font-bold">Emulsion Batch:</span>
                            <span className="text-zinc-300 font-black">{getMfgData(selectedStock).emulsion}</span>
                        </div>
                        <div>
                            <span className="text-zinc-500 block uppercase text-[7.5px] font-bold">Process Standard:</span>
                            <span className="text-zinc-300 font-black">{getMfgData(selectedStock).process}</span>
                        </div>
                        <div>
                            <span className="text-zinc-500 block uppercase text-[7.5px] font-bold">Exposure/Format:</span>
                            <span className="text-zinc-300 font-black">{getMfgData(selectedStock).exposureIndex} // {getMfgData(selectedStock).format}</span>
                        </div>
                        <div>
                            <span className="text-zinc-500 block uppercase text-[7.5px] font-bold">Estimated Origin:</span>
                            <span className="text-zinc-300 font-black">{getMfgData(selectedStock).mfgDate} ({getMfgData(selectedStock).mfgLocation.split(',')[0]})</span>
                        </div>
                    </div>

                    {/* Post-Production Index Logs Table */}
                    {indexedFrames.length > 0 && (
                        <div className="mt-4 animate-in fade-in duration-300">
                            <div className="flex justify-between items-center mb-1.5 border-b border-zinc-800 pb-1">
                                <span className="text-[8px] text-zinc-400 font-black uppercase tracking-wider">Automated Index Log Cut List</span>
                                <span className="text-[7.5px] text-zinc-600 font-mono">EDL_V1 // AUTHORIZATION: SECURE</span>
                            </div>
                            <div className="overflow-x-auto max-h-36 overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left font-mono text-[9px] border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-900 text-zinc-500 font-black uppercase">
                                            <th className="py-1 pr-2">FRAME</th>
                                            <th className="py-1 px-2">KODAK KEYKODE</th>
                                            <th className="py-1 px-2">TIMECODE</th>
                                            <th className="py-1 px-2">EDGE REGISTER</th>
                                            <th className="py-1 pl-2">EVENTS & SCENES</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-900 text-zinc-400">
                                        {indexedFrames.map((itm, idx) => (
                                            <tr key={idx} className="hover:bg-zinc-900/50">
                                                <td className="py-1 font-bold text-red-500 pr-2">{itm.frame}</td>
                                                <td className="py-1 text-zinc-200 px-2">{itm.keykode}</td>
                                                <td className="py-1 text-zinc-300 px-2">{itm.timecode}</td>
                                                <td className="py-1 text-zinc-500 px-2">{itm.edgeCode}</td>
                                                <td className="py-1 italic text-zinc-400 pl-2">{itm.event}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* ===============================================
                    DEEP CHROMATIC WEAVER & ASSEMBLY DECK
                    =============================================== */}
                <div className="w-full mt-8 p-6 bg-zinc-950/90 border-4 border-zinc-900 rounded-3xl relative overflow-hidden text-left shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] animate-in fade-in duration-300">
                    <div className="absolute top-2 right-4 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isWeapingScanActive ? 'bg-red-500 animate-ping' : 'bg-red-900'}`} />
                        <span className="text-[7.5px] font-black text-red-500 tracking-wider">
                            {isWeapingScanActive ? 'WEAVER ACTIVE SCANNING...' : 'WEAVER IDLE // BLOCKCHAIN READY'}
                        </span>
                    </div>

                    <h4 className="font-comic-header text-xl text-white uppercase italic mb-1 flex items-center gap-2">
                         Chromatic Trace Weaver & Assembly Deck
                    </h4>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-4">
                        Search Deconvoluted Sub-Sectors for Scattered Video Particles, Rebuild Ledger Fragments, & Cryptographically Verify Frame Integrity
                    </p>

                    {/* Scanner & Controller parameters */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Fragment Directory Indicator List */}
                        <div className="col-span-1 lg:col-span-12 xl:col-span-7 space-y-3">
                            <div className="flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase tracking-wider pb-1.5 border-b border-zinc-900">
                                <span>Trace Fragment Index Ledger</span>
                                <span className="text-zinc-650">5 SECTORS CHECKED</span>
                             </div>

                             <div className="space-y-2">
                                 {fragments.map(frag => (
                                     <div 
                                         key={frag.id}
                                         onClick={() => toggleFragmentSelection(frag.id)}
                                         className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between ${selectedFragments.includes(frag.id) ? 'bg-red-950/20 border-red-900/40 text-red-100' : 'bg-black border-zinc-900/60 text-zinc-500 hover:border-zinc-805'}`}
                                     >
                                         <div className="flex items-center gap-3">
                                             <input 
                                                 type="checkbox"
                                                 checked={selectedFragments.includes(frag.id)}
                                                 readOnly
                                                 className="accent-red-600 rounded cursor-pointer"
                                             />
                                             <div>
                                                 <p className="text-[10px] font-bold font-mono text-zinc-200">{frag.name}</p>
                                                 <div className="flex items-center gap-2 text-[7.5px] font-mono mt-0.5 text-zinc-500">
                                                     <span>ID: {frag.id}</span>
                                                     <span>•</span>
                                                     <span>Signature: {frag.bitSignature}</span>
                                                     <span>•</span>
                                                     <span>Size: {frag.size}</span>
                                                 </div>
                                             </div>
                                         </div>

                                         <div className="text-right">
                                             <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${frag.state === 'LOCATED' ? 'bg-emerald-950 border border-emerald-900/60 text-emerald-400 animate-pulse' : 'bg-zinc-900/60 text-zinc-650'}`}>
                                                 {frag.state}
                                             </span>
                                             <p className="text-[7.5px] font-mono text-zinc-600 mt-1 truncate max-w-[80px]">{frag.hash}</p>
                                         </div>
                                     </div>
                                 ))}
                             </div>

                             <div className="flex gap-2.5 pt-1.5">
                                 <button
                                     onClick={runWeaperScan}
                                     disabled={isWeapingScanActive}
                                     className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[9px] font-black uppercase tracking-wider rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                 >
                                     <SearchIcon className="w-3.5 h-3.5" />
                                     {isWeapingScanActive ? "Decoding Fragments..." : "Scan with Weaver for Traces"}
                                 </button>
                                 <button
                                     onClick={() => setFragments(prev => prev.map(f => ({ ...f, state: 'UNLOCATED' })))}
                                     className="px-4 py-2.5 bg-black hover:bg-zinc-950 text-zinc-500 hover:text-zinc-300 font-mono text-[9px] rounded-xl border border-zinc-900 transition-all"
                                 >
                                     Reset Traces
                                 </button>
                             </div>
                        </div>

                        {/* Reconstruction & Blockchain Verifier Controls Column */}
                        <div className="col-span-1 lg:col-span-12 xl:col-span-5 bg-black/40 p-5 rounded-2xl border border-zinc-900 space-y-4">
                            <div className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2 border-b border-zinc-900 pb-1.5">
                                Assembly Parameters
                            </div>

                            <div>
                                <label className="text-[8px] text-zinc-500 font-black uppercase block mb-1">Target Synthesis Title</label>
                                <input 
                                    type="text"
                                    value={customVideoTitleInput}
                                    onChange={(e) => setCustomVideoTitleInput(e.target.value)}
                                    placeholder="e.g. Aether_Chroma"
                                    className="w-full bg-black border border-zinc-900 text-zinc-350 font-mono text-[10px] p-2 rounded-lg focus:outline-none focus:border-red-500/80"
                                />
                            </div>

                            {/* Synthesis action trigger */}
                            <div className="space-y-3 pt-1">
                                <button
                                    onClick={executeWeaveSynthesis}
                                    disabled={isStitching || selectedFragments.length === 0}
                                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 disabled:bg-zinc-900 disabled:opacity-50 text-white font-mono text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_12px_rgba(220,38,38,0.2)]"
                                >
                                    {isStitching ? `Stitching Particles [${stitchProgress}%]...` : "Stitch & Synthesize Video"}
                                </button>
                                <p className="text-[7.5px] text-zinc-550 leading-relaxed text-center italic">
                                    Direct integration linkage to the AetherOS OmniBuilder schema rendering engine
                                </p>
                            </div>

                            {/* Stitching live progress display bar */}
                            {isStitching && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[7px] font-mono text-red-400">
                                        <span>MULTIPLEX_STITCH_MANIFOLD_RUN</span>
                                        <span>{stitchProgress}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-600 transition-all duration-100" style={{ width: `${stitchProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* Successfully Synthesized state output */}
                            {weavedVideoResult && (
                                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3 animate-in slide-in-from-bottom duration-300">
                                    <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[8px] text-emerald-400 font-black uppercase tracking-wider">
                                            OMNIBUILDER VIDEO SYNTHESIZED!
                                        </span>
                                    </div>

                                    <div className="space-y-1 font-mono text-[8px] text-zinc-400">
                                        <div>Asset ID: <span className="text-zinc-200">{weavedVideoResult.id}</span></div>
                                        <div>Title: <span className="text-zinc-300 truncate block">{weavedVideoResult.title}</span></div>
                                        <div>Structure: <span className="text-red-400">DEEP_STITCHED_MANIFOLD</span></div>
                                        <div>Hardening: <span className="text-amber-500">TEMPLAR_VERIFIED_LEDGER</span></div>
                                    </div>

                                    {/* Blockchain cryptographic validating action */}
                                    <div className="pt-1.5 space-y-2">
                                        <button
                                            onClick={verifyVideoOnBlockchain}
                                            disabled={isBlockchainVerifyingActive}
                                            className="w-full py-2 px-3 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            {isBlockchainVerifyingActive ? (
                                                <>
                                                    <SpinnerIcon className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                                                    VERIFYING COGNITIVE LEDGER...
                                                </>
                                            ) : (
                                                <>
                                                    <ShieldIcon className="w-3.5 h-3.5" />
                                                    Verify via Blockchain Consensus
                                                </>
                                            )}
                                        </button>

                                        {/* Cryptographic block proof output code */}
                                        {blockchainProofResult && (
                                            <div className="bg-black p-2 border border-zinc-900 rounded font-mono text-[7px] text-zinc-500 overflow-hidden text-ellipsis whitespace-nowrap">
                                                <span className="text-emerald-500 block">✓ LEDGER PROOF GENERATED:</span>
                                                {weavedVideoResult.blockchainProof}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

             {/* Deep Analytics Overlay */}
             <div className="absolute top-4 left-4 p-3 bg-red-950/40 border border-red-500/20 rounded shadow-lg backdrop-blur-md hidden md:block">
                <div className="text-[7px] font-black text-red-500 uppercase tracking-widest mb-1 border-b border-red-500/20 pb-1">DEEP_FORENSICS</div>
                <div className="space-y-1">
                    <div className="flex justify-between gap-4 text-[6px] font-mono text-red-300">
                        <span>PULSE_LOCK:</span>
                        <span className="text-white">TRUE</span>
                    </div>
                    <div className="flex justify-between gap-4 text-[6px] font-mono text-red-300">
                        <span>PUPIL_DILATION:</span>
                        <span className="text-white">88%</span>
                    </div>
                    <div className="flex justify-between gap-4 text-[6px] font-mono text-red-300">
                        <span>AESTHETIC_PURITY:</span>
                        <span className="text-white">0x03E2</span>
                    </div>
                </div>
             </div>

             {/* Dynamic Log Area */}
             <div className={`w-full mt-10 p-6 bg-red-950/10 border-2 border-red-900/20 rounded-3xl transition-all ${hyperMode ? 'border-red-500 bg-red-950/30 h-48' : ''}`}>
                <h4 className={`font-comic-header text-2xl uppercase italic mb-4 flex items-center gap-3 ${hyperMode ? 'text-red-400' : 'text-red-700'}`}>
                    <TerminalIcon className={`w-6 h-6 ${hyperMode ? 'animate-spin' : ''}`} /> Production Stream
                </h4>
                <div className={`space-y-2 font-mono text-[10px] text-red-400 overflow-y-auto custom-scrollbar ${hyperMode ? 'h-28' : 'h-24'}`}>
                    {isRendering ? (
                        frameBuffer.map((log, i) => (
                            <div key={i} className={`flex gap-3 border-l-2 pl-4 py-0.5 animate-in slide-in-from-left-2 ${log.includes('CRITICAL') ? 'text-red-500 font-black border-red-500' : 'border-red-900'}`}>
                                <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                                <span className={hyperMode ? 'uppercase text-[9px]' : 'italic'}>{log}</span>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center opacity-20 py-4">
                            <p className="uppercase tracking-[0.3em] font-black">Awaiting Conjunction Trigger.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Regulatory & Financial Sidecar */}
        <div className="lg:col-span-4 flex flex-col gap-8 overflow-hidden">
            {/* Age Verification Section */}
            <div className="aero-panel bg-slate-900 p-6 border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col max-h-[50%]">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <h3 className="font-comic-header text-2xl text-red-500 uppercase italic flex items-center gap-2">
                        <RulesIcon className="w-5 h-5" /> Age Audit
                    </h3>
                    <button onClick={runAgeAudit} className="text-[8px] font-black uppercase text-red-900 hover:text-red-500 transition-colors">Rescan</button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                    {isAgeAuditing ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-10 text-red-500">
                            <SpinnerIcon className="w-8 h-8 animate-spin" />
                            <p className="text-[8px] font-black uppercase tracking-[0.3em]">Siphoning Data...</p>
                        </div>
                    ) : ageAuditReport ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                            <div className={`p-3 rounded-xl border-2 flex items-center gap-3 ${ageAuditReport.riskLevel === 'CRITICAL' ? 'bg-red-900/20 border-red-600' : 'bg-green-900/20 border-green-600'}`}>
                                <WarningIcon className={`w-6 h-6 ${ageAuditReport.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-green-500'}`} />
                                <span className="text-lg font-comic-header uppercase">{ageAuditReport.riskLevel}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 italic leading-relaxed">
                                {ageAuditReport.report}
                            </p>
                        </div>
                    ) : (
                        <p className="text-[10px] text-gray-600 italic">Age gate analysis pending.</p>
                    )}
                </div>
            </div>

            {/* Financial Forensics Section */}
            <div className="aero-panel bg-black/60 p-6 border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <h3 className="font-comic-header text-2xl text-emerald-500 uppercase italic flex items-center gap-2">
                        <ScaleIcon className="w-5 h-5" /> Financial Forensics
                    </h3>
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                    {isFinancialAuditing ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 py-10 text-emerald-500">
                            <SpinnerIcon className="w-10 h-10 animate-spin" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">Tracing Money Flows...</p>
                        </div>
                    ) : financialAuditReport ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-emerald-900/10 border border-emerald-600/30 rounded-xl text-center">
                                    <p className="text-[7px] font-black text-emerald-700 uppercase mb-1">Verified Performers</p>
                                    <p className="text-2xl font-comic-header text-white">{financialAuditReport.verifiedPerformersCount}</p>
                                </div>
                                <div className={`p-3 border rounded-xl text-center flex flex-col justify-center ${financialAuditReport.financialFlowStatus === 'SECURE' ? 'bg-green-950/20 border-green-600/40' : 'bg-red-950/20 border-red-600/40'}`}>
                                    <p className="text-[7px] font-black text-gray-500 uppercase mb-1">Flow Integrity</p>
                                    <p className={`text-lg font-comic-header ${financialAuditReport.financialFlowStatus === 'SECURE' ? 'text-green-500' : 'text-red-500'}`}>{financialAuditReport.financialFlowStatus}</p>
                                </div>
                            </div>

                            <div className="bg-black/80 p-4 rounded-xl border border-white/5 space-y-3">
                                <h5 className="text-[9px] font-black uppercase text-emerald-400 tracking-widest border-b border-emerald-900/40 pb-2">Forensic Analysis</h5>
                                <p className="text-[11px] text-gray-400 italic leading-relaxed">
                                    {financialAuditReport.report}
                                </p>
                            </div>

                            {financialAuditReport.redFlags.length > 0 && (
                                <div className="space-y-2">
                                    <h5 className="text-[9px] font-black uppercase text-red-500 tracking-widest">Red Flags Detected</h5>
                                    {financialAuditReport.redFlags.map((flag, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-2 bg-red-900/10 border border-red-600/20 rounded-lg">
                                            <FireIcon className="w-3 h-3 text-red-600" />
                                            <span className="text-[9px] font-bold text-red-400 uppercase truncate">{flag}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <div className="p-2 bg-emerald-950/40 rounded-lg border-2 border-black text-center mt-4">
                                <p className="text-[8px] font-black text-emerald-800 uppercase mb-1">Legal Support Active</p>
                                <p className="text-[10px] font-black text-white uppercase italic">ChaseLawyers Secured</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-emerald-950/10 border-2 border-emerald-900/20 rounded-2xl relative overflow-hidden group">
                                <GavelIcon className="absolute -right-4 -bottom-4 w-20 h-20 opacity-5 group-hover:scale-110 transition-transform" />
                                <h4 className="text-sm font-black text-white uppercase mb-2">Financial Integrity Audit</h4>
                                <p className="text-[10px] text-gray-400 leading-relaxed italic mb-4">
                                    Verify performer payments, trace flows for illegal activity, and identify regulatory risks before they become liabilities.
                                </p>
                                <button 
                                    onClick={runFinancialAudit}
                                    className="w-full py-2 bg-emerald-600 text-black rounded-lg text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#000]"
                                >
                                    Initiate Forensic Scan
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 p-4 bg-amber-900/10 border-2 border-amber-600/30 rounded-2xl">
                    <p className="text-[9px] text-gray-400 leading-relaxed italic">
                        "Regular financial audits ensure studio practices are transparent and legally sound. ChaseLawyers provides assistant in drafting compliance policies."
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Lab Footer */}
      <div className="p-4 bg-slate-900 border-t-8 border-black flex justify-between items-center z-30 px-10 shadow-inner">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">Studio Protocol: SECURE</span>
            </div>
            <span className="text-[9px] text-gray-700 font-mono tracking-widest uppercase">
                Render Integrity: 0x03E2 | Forensic Stride: 1.2 PB/S
            </span>
        </div>
        <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.3em] hidden sm:block">"Pleasure flows where logic is hard-coded."</p>
      </div>
    </div>
  );
};
