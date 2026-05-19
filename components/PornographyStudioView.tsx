
import React, { useState, useEffect, useRef } from 'react';
import { 
    MovieIcon, ActivityIcon, ZapIcon, GaugeIcon, SpinnerIcon, 
    ShieldIcon, FireIcon, CheckCircleIcon, TerminalIcon, 
    GavelIcon, SearchIcon, WarningIcon, UserIcon, RulesIcon, ScaleIcon
} from './icons';
import type { LabComponentProps, FinancialForensicAudit } from '../types';
import { conductAgeVerificationAudit, conductFinancialForensicAudit } from '../services/geminiService';

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
        setFrameBuffer(prev => {
            const hex = "0x" + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
            const prefix = hyperMode ? "[CRITICAL_OVERFLOW] " : "[RENDER] ";
            return [`${prefix}Frame ${hex} processed.`, ...prev].slice(0, 10);
        });

        if (hyperMode && neuralSaturationRef.current > 95 && !isCrashing) {
            triggerNeuralCrash();
        }
      }, hyperMode ? 100 : 500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRendering, hyperMode, isCrashing]);

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
             
             <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#991b1b 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
             
             <div className="text-center space-y-10 relative z-10 w-full">
                <div className="flex justify-between items-end">
                    <div className="text-left">
                        <p className={`text-[10px] font-black uppercase tracking-[0.5em] mb-4 ${hyperMode ? 'text-red-400 animate-pulse' : 'text-red-900'}`}>Neural Frame Resonance</p>
                        <div className={`text-9xl font-black text-white wisdom-glow tracking-tighter leading-none ${hyperMode ? 'scale-110 text-red-100 hover:tracking-[-0.05em] transition-all' : ''}`}>
                            {Math.floor(fps)}<span className={`text-2xl ml-2 ${hyperMode ? 'text-red-500' : 'text-red-900'}`}>FPS</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Conjunction Stride</p>
                        <p className={`text-4xl font-comic-header ${hyperMode ? 'text-red-400' : 'text-red-500'}`}>
                            {hyperMode ? '9.8 EB/S' : '1.2 PB/S'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
                    <div className="p-4 bg-black border-2 border-red-900/30 rounded-2xl relative overflow-hidden">
                        <p className="text-[8px] text-red-800 font-black uppercase mb-1">Color Saturation</p>
                        <p className="text-2xl font-comic-header text-white">{saturation.toFixed(1)}%</p>
                        {hyperMode && <div className="absolute bottom-0 left-0 h-1 bg-red-500 animate-pulse" style={{ width: `${(saturation/300)*100}%` }} />}
                    </div>
                    <div className="p-4 bg-black border-2 border-red-900/30 rounded-2xl">
                        <p className="text-[8px] text-red-800 font-black uppercase mb-1">Censure Bypass</p>
                        <p className={`text-2xl font-comic-header ${hyperMode ? 'text-red-400 animate-ping' : 'text-green-500'}`}>
                            {hyperMode ? 'OVERLOAD' : 'ACTIVE'}
                        </p>
                    </div>
                    <div className="p-4 bg-black border-2 border-red-900/30 rounded-2xl">
                        <p className="text-[8px] text-red-800 font-black uppercase mb-1">Neural Saturation</p>
                        <p className={`text-2xl font-comic-header ${neuralSaturation > 80 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {neuralSaturation.toFixed(1)}%
                        </p>
                    </div>
                    <div className={`p-4 bg-black border-2 rounded-2xl transition-colors ${ageAuditReport?.riskLevel === 'CRITICAL' ? 'border-red-600 bg-red-900/20' : 'border-red-900/30'}`}>
                        <p className="text-[8px] text-red-800 font-black uppercase mb-1">Age Gate Status</p>
                        <p className={`text-2xl font-comic-header ${ageAuditReport?.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-amber-500 animate-pulse'}`}>{ageAuditReport?.riskLevel || 'PENDING'}</p>
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
