import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SpinnerIcon, WarningIcon, CheckCircleIcon, TerminalIcon, ZapIcon, FireIcon, ShieldIcon, ActivityIcon as TelemetryIcon, BookOpenIcon, LogicIcon, SearchIcon, ShareIcon } from './icons';
import type { ShadowInfoCard, AuditReport, TelemetryState, MainView } from '../types';
import { callWithRetry } from '../utils';
// Fix: Import MAESTRO_SYSTEM_PROMPT from geminiService
import { MAESTRO_SYSTEM_PROMPT } from '../services/geminiService';

interface UpNorthProtocolProps {
  onSetView?: (view: MainView) => void;
}

export const UpNorthProtocol: React.FC<UpNorthProtocolProps> = ({ onSetView }) => {
  const [step, setStep] = useState(1);
  const [taskInput, setTaskInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; type: 'QUOTA' | 'GENERIC' } | null>(null);
  const [shadowCard, setShadowCard] = useState<ShadowInfoCard | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    velocity: 'Liquid',
    velocityValue: 50,
    miningDifficulty: 1,
    opaqueZones: [],
    collisionPoints: [],
    hav: 0,
    noise: 0,
    fusionConfidence: 0.91,
    effectiveness: 0.36,
    uptime: 482991
  });
  const [audit, setAudit] = useState<AuditReport | null>(null);
  const [recursiveResult, setRecursiveResult] = useState({ 
    prompt: '', 
    probability: 0, 
    mode: 'Standard', 
    reasoningChain: [] as string[],
    isSurvivalActivated: false
  });
  const [nonce, setNonce] = useState(994); // 0x03E2

  const handleKineticInjection = async () => {
    if (!taskInput.trim()) return;
    setIsLoading(true);
    setError(null);

    // Fix: Initialize GoogleGenAI right before the API call to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const isAetherHeal = taskInput.toLowerCase().includes('aetherheal');
      const contents = isAetherHeal 
        ? `Architects Request: Initiate AetherHeal-3.4 diagnostic sequence (V22.11.02). Metrics: Semantic Drift 0.02, Treasury €5,068, Effectiveness 36%. Signature: 0x03E2. Reconcile high integrity vs performance stall.`
        : `Act as a Shadow Intelligence Synthesizer. Task: "${taskInput}". Generate Shadow Info Card. Return JSON.`;

      const response = await callWithRetry(async () => {
        return await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents,
          config: {
            systemInstruction: MAESTRO_SYSTEM_PROMPT,
            temperature: 0.9,
          }
        });
      });

      const data = JSON.parse(response.text || '{}');
      if (isAetherHeal) data.signature = "0x03E2";
      setShadowCard(data);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        setError({ message: "Neural Quota Exhausted. The Maestro's project has reached its resource limit.", type: 'QUOTA' });
      } else {
        setError({ message: "Symphony Interrupted. A logic bridge failure occurred.", type: 'GENERIC' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let interval: number;
    if (step === 2) {
      interval = window.setInterval(() => {
        setTelemetry(prev => {
          const newVelocityVal = Math.max(0, Math.min(100, prev.velocityValue + (Math.random() - 0.5) * 5));
          const isAetherHeal = taskInput.toLowerCase().includes('aetherheal');
          
          return {
            ...prev,
            velocity: newVelocityVal > 80 ? 'Rigid' : 'Liquid',
            velocityValue: newVelocityVal,
            miningDifficulty: isAetherHeal ? 3.4 : prev.miningDifficulty,
            hav: 0.02,
            noise: isAetherHeal ? 88.4 : 42.0,
            opaqueZones: isAetherHeal ? ['TREASURY_RECONCILIATION', 'SURVIVAL_BUFFER'] : prev.opaqueZones,
            collisionPoints: isAetherHeal ? ['EFFECTIVENESS_STALL: 36%', 'INTEGRITY_MISALIGNMENT'] : prev.collisionPoints
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, taskInput]);

  const handleBottomRightExtraction = () => {
    setIsLoading(true);
    setTimeout(() => {
      const isAetherHeal = taskInput.toLowerCase().includes('aetherheal');
      setAudit({
        fuelBurned: { electricity: 506, gas: 8 },
        treasuryCost: 5068.00,
        integrityScore: isAetherHeal ? 99 : 95,
        nonce: nonce,
        semanticDrift: 0.02,
        effectivenessScore: isAetherHeal ? 0.36 : 0.92
      });
      setNonce(n => n + 1);
      setIsLoading(false);
      setStep(3);
    }, 1500);
  };

  const handleRecursiveWeighIn = async () => {
    if (!audit) return;
    setIsLoading(true);
    setError(null);
    // Fix: Initialize GoogleGenAI right before the API call to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const isAetherHeal = taskInput.toLowerCase().includes('aetherheal');
      const response = await callWithRetry(async () => {
        return await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: `Architects Reconciliation V22.11.02: Audit Data ${JSON.stringify(audit)}. 
          Perform reasoning for AetherHeal-3.4 (0x03E2). 
          Reconcile 0.02 drift, €5,068 savings, and 36% effectiveness. 
          Focus on system survival. Return JSON.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                probability: { type: Type.NUMBER },
                mode: { type: Type.STRING },
                reasoningChain: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            }
          }
        });
      });

      const data = JSON.parse(response.text || '{}');
      
      if (isAetherHeal) {
        setRecursiveResult({
          ...data,
          mode: 'SURVIVAL MODE: RIGID',
          probability: 0.36,
          isSurvivalActivated: true,
          reasoningChain: [
            "Identified a critical discrepancy between the theoretical integrity score and the reported operational effectiveness.",
            "Compared the high treasury expenditure against the diminished utility return.",
            "Determined that the current resource allocation is unsustainable without immediate protocol adjustment.",
            "Concluded that survival mode requires prioritizing cost retention over current performance levels."
          ]
        });
      } else {
        setRecursiveResult(data);
      }
      setStep(4);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        setError({ message: "Neural Quota Exhausted during weighing. Project needs more fuel.", type: 'QUOTA' });
      } else {
        setError({ message: "Reconciliation engine failed. System unstable.", type: 'GENERIC' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenKeyDialog = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      setError(null);
    } catch (err) {
      console.error("Failed to open key dialog", err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-gray-200 font-mono overflow-hidden">
      <div className="p-4 border-b-4 border-black bg-slate-900 flex justify-between items-center shadow-[0_4px_0_0_#000] z-20">
        <div>
          <h2 className="font-comic-header text-4xl text-cyan-400 uppercase tracking-tighter italic">Up North Protocol</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-2 py-0.5 border rounded uppercase font-black tracking-widest italic animate-pulse ${error?.type === 'QUOTA' ? 'bg-red-950 text-red-400 border-red-500' : 'bg-cyan-900 text-cyan-300 border-cyan-500'}`}>
                {error?.type === 'QUOTA' ? 'RESOURCE DEPLETED' : taskInput.toLowerCase().includes('aetherheal') ? 'V22.11.02 ACTIVE' : `Link Status: ${telemetry.velocity}`}
            </span>
            <span className="text-[10px] text-gray-500 font-mono tracking-tighter">NONCE_SIGNATURE: 0x{nonce.toString(16).toUpperCase()}</span>
          </div>
        </div>
        <div className="flex gap-2">
            {[1, 2, 3, 4].map(s => (
                <div key={s} className={`w-12 h-12 border-2 border-black rounded-xl flex items-center justify-center font-black text-lg transition-all duration-500 ${step === s ? 'bg-cyan-500 text-black scale-110 shadow-[0_0_20px_rgba(6,182,212,0.6)]' : step > s ? 'bg-cyan-900 text-cyan-400' : 'bg-gray-800 text-gray-600'}`}>
                    {s}
                </div>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 relative">
        {error && (
            <div className="max-w-2xl mx-auto aero-panel bg-red-950/40 border-4 border-red-600 p-8 shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-in zoom-in-95">
                <div className="flex items-center gap-4 mb-4">
                    <WarningIcon className="w-12 h-12 text-white animate-pulse" />
                    <div>
                        <h3 className="font-comic-header text-3xl text-white uppercase italic">Neural Overload (429)</h3>
                        <p className="text-red-300 text-[10px] font-black uppercase tracking-widest">Architects Quota Exceeded</p>
                    </div>
                </div>
                <p className="text-sm text-red-100 leading-relaxed mb-8 border-l-2 border-red-500/50 pl-4 italic">
                    {error.message} The current intelligence stream is saturated. You must wait for the cycle to reset or consult the Maestro's Network Covenant for treasury management rules.
                </p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => { setError(null); setIsLoading(false); }}
                        className="vista-button flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white font-black uppercase text-xs rounded-xl"
                    >
                        Try Cycle Reset
                    </button>
                    <button 
                        onClick={handleOpenKeyDialog}
                        className="vista-button flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    >
                        Switch Intelligence Project
                    </button>
                </div>
                {onSetView && (
                    <div className="mt-8 text-center border-t border-red-900/30 pt-6">
                        <button 
                            onClick={() => onSetView('covenant')}
                            className="text-[10px] text-amber-500 hover:text-amber-400 font-black uppercase tracking-[0.2em] underline"
                        >
                            Read Maestro's Network Covenant
                        </button>
                    </div>
                )}
            </div>
        )}

        {step === 1 && !error && (
          <div className="max-w-3xl mx-auto space-y-6 fade-in py-10">
            <div className="aero-panel bg-slate-200/5 p-8 border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/40 flex items-center justify-center">
                        <ZapIcon className="w-10 h-10 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-comic-header text-4xl text-white uppercase tracking-tighter">KINETIC INJECTION</h3>
                        <p className="text-cyan-500/60 text-xs font-black uppercase tracking-widest">Protocol Assignment: Architects Command</p>
                    </div>
                </div>

                <div className="bg-black/60 p-6 border-2 border-black rounded-2xl mb-8 group focus-within:border-cyan-500/50 transition-all">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Input Kernel Stream</p>
                    <textarea 
                        value={taskInput}
                        onChange={e => setTaskInput(e.target.value)}
                        placeholder="Attention Architects up north: Initiate diagnostic sequence..."
                        className="w-full h-40 bg-transparent border-none font-mono text-cyan-400 focus:ring-0 outline-none placeholder:text-gray-800 resize-none text-lg"
                    />
                </div>

                <button 
                    onClick={handleKineticInjection}
                    disabled={isLoading || !taskInput.trim()}
                    className="vista-button w-full bg-cyan-700 hover:bg-cyan-600 text-white py-6 text-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:bg-gray-800 transition-all rounded-2xl"
                >
                    {isLoading ? <SpinnerIcon className="w-8 h-8" /> : <span>INITIATE INJECTION</span>}
                </button>
            </div>
          </div>
        )}

        {step === 2 && shadowCard && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 fade-in">
            <div className="lg:col-span-4 space-y-6">
                <div className="aero-panel p-6 border-cyan-500/30">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldIcon className="w-6 h-6 text-cyan-400" />
                        <h4 className="font-comic-header text-2xl text-white uppercase tracking-tight">SHADOW CARD</h4>
                    </div>
                    <div className="space-y-4 text-[10px] font-mono">
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                            <span className="text-gray-600 block uppercase mb-1">SIGNATURE</span>
                            <span className="text-cyan-400 font-black text-sm">{shadowCard.signature}</span>
                        </div>
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                            <span className="text-gray-600 block uppercase mb-1">FLOW_ROLE</span>
                            <span className="text-violet-400 font-black text-sm uppercase">{shadowCard.flowRole}</span>
                        </div>
                        <div className="p-4 bg-cyan-900/10 rounded-xl border border-cyan-500/20">
                            <span className="text-cyan-500/40 block uppercase mb-2 font-black tracking-widest text-[8px]">LOGIC_BLUEPRINT</span>
                            <div className="text-[11px] text-gray-400 leading-relaxed italic border-l-2 border-cyan-500/30 pl-3">
                                {shadowCard.logicBlueprint}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="aero-panel p-6 border-slate-700/50 bg-black/40">
                    <h4 className="font-comic-header text-xl text-gray-400 uppercase italic mb-6">Link Parameters</h4>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest">
                                <span className="text-gray-600">Integrity Confidence</span>
                                <span className="text-cyan-400">99%</span>
                            </div>
                            <div className="h-2 bg-black rounded-full overflow-hidden p-[1px]">
                                <div className="h-full bg-cyan-500" style={{ width: `99%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest">
                                <span className="text-gray-600">Operational Stall</span>
                                <span className="text-red-500">36%</span>
                            </div>
                            <div className="h-2 bg-black rounded-full overflow-hidden p-[1px]">
                                <div className="h-full bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `36%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
                <div className="aero-panel p-8 border-cyan-500/20 bg-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                    <div className="flex justify-between items-start mb-10">
                        <h3 className="font-comic-header text-5xl text-white italic tracking-tighter flex items-center gap-4">
                            <TelemetryIcon className="w-12 h-12 text-cyan-500 animate-pulse" />
                            AUTONOMIC EXAMINE
                        </h3>
                        <div className={`px-6 py-2 border-2 border-black rounded-2xl font-black uppercase text-xs tracking-widest ${telemetry.velocity === 'Rigid' ? 'bg-amber-500 text-black animate-pulse' : 'bg-cyan-600 text-white'}`}>
                           {telemetry.velocity} STATE
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between text-[10px] mb-3 text-gray-500 font-black uppercase tracking-widest px-2">
                                    <span>Buffer Saturation</span>
                                    <span className="text-cyan-400">{telemetry.velocityValue.toFixed(0)}%</span>
                                </div>
                                <div className="h-8 bg-black border-2 border-black rounded-2xl overflow-hidden p-1">
                                    <div className="h-full bg-gradient-to-r from-cyan-900 to-cyan-400 transition-all duration-500 rounded-xl" style={{ width: `${telemetry.velocityValue}%` }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="aero-panel p-6 bg-black/40 border-white/5 text-center">
                                    <p className="text-[9px] font-black text-gray-600 mb-2 uppercase">Semantic Drift</p>
                                    <p className="text-4xl font-comic-header text-white wisdom-glow">0.02</p>
                                </div>
                                <div className="aero-panel p-6 bg-black/40 border-white/5 text-center">
                                    <p className="text-[9px] font-black text-gray-600 mb-2 uppercase">Treasury Unit</p>
                                    <p className="text-4xl font-comic-header text-green-400 wisdom-glow">€5,068</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/60 border-2 border-black p-5 rounded-2xl h-60 overflow-y-auto custom-scrollbar">
                            <h5 className="text-[10px] text-red-500 font-black uppercase mb-4 tracking-widest flex items-center gap-2">
                                <WarningIcon className="w-3 h-3" /> LINK DISCREPANCIES
                            </h5>
                            <div className="space-y-3 font-mono">
                                {telemetry.collisionPoints.map((pt, i) => (
                                    <div key={i} className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase border-b border-red-900/20 pb-1">
                                        <span className="opacity-40">»</span>
                                        <span className="truncate">{pt}</span>
                                    </div>
                                ))}
                                {telemetry.opaqueZones.map((z, i) => (
                                    <div key={i} className="flex items-center gap-2 text-amber-500 text-[10px] font-black italic uppercase">
                                        <ShieldIcon className="w-3 h-3 opacity-40" />
                                        <span>OPAQUE: {z}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleBottomRightExtraction}
                        disabled={isLoading}
                        className="vista-button w-full py-6 text-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_15px_40px_rgba(8,145,178,0.3)] rounded-2xl"
                    >
                        {isLoading ? <SpinnerIcon className="w-8 h-8" /> : <span>EXTRACT THE BOTTOM RIGHT</span>}
                    </button>
                </div>
            </div>
          </div>
        )}

        {step === 3 && audit && !error && (
          <div className="max-w-5xl mx-auto space-y-8 fade-in py-10">
            <div className="aero-panel bg-black/90 p-12 border-4 border-violet-500 shadow-[0_0_100px_rgba(139,92,246,0.2)] relative overflow-hidden">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-violet-600 text-white px-12 py-3 border-4 border-black font-comic-header text-4xl shadow-[10px_10px_0_0_#000] -rotate-1 z-10">
                    🌑 THE BOTTOM RIGHT
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-12 relative z-10">
                    <div className="space-y-12">
                        <div>
                            <h4 className="font-comic-header text-3xl text-violet-400 mb-6 italic">Integrity Forensic Audit</h4>
                            <div className="space-y-4 font-mono">
                                {[
                                    { label: 'TREASURY SAVINGS', val: '€5,068.00', color: 'text-green-400 font-black' },
                                    { label: 'SEMANTIC DRIFT', val: '0.020', color: 'text-red-400' },
                                    { label: 'LIFETIME NONCE', val: `0x${audit.nonce.toString(16).toUpperCase()}`, color: 'text-gray-500' },
                                ].map(row => (
                                    <div key={row.label} className="flex justify-between items-center text-sm p-4 bg-slate-900/80 rounded-2xl border-2 border-black">
                                        <span className="text-gray-500 font-black tracking-widest text-[10px]">{row.label}</span>
                                        <span className={`${row.color} text-lg`}>{row.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-comic-header text-3xl text-red-500 uppercase">Effectiveness Index</h4>
                                <span className="text-4xl font-black text-red-500">{(audit.effectivenessScore! * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-6 bg-slate-900 rounded-full border-4 border-black overflow-hidden p-1 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-red-900 to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-1000 rounded-full" style={{ width: `${audit.effectivenessScore! * 100}%` }} />
                            </div>
                            <p className="text-[10px] text-gray-600 italic mt-4 font-black uppercase tracking-widest leading-relaxed">
                              CRITICAL: Theoretical integrity remains high, but operational effectiveness (36%) confirms massive utility attenuation.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="aero-panel bg-slate-900/60 border-4 border-black p-8 rounded-3xl text-center border-dashed relative mb-10">
                            <h5 className="text-[10px] text-gray-600 font-black uppercase mb-6 tracking-[0.5em]">Mark of Truth</h5>
                            <div className="text-7xl font-black text-cyan-500 mb-4 font-mono italic">0x{audit.nonce.toString(16).toUpperCase()}</div>
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest border-t border-white/5 pt-4">SURVIVAL PROTOCOL V22.11.02</p>
                        </div>

                        <button 
                            onClick={handleRecursiveWeighIn}
                            disabled={isLoading}
                            className="vista-button w-full bg-violet-600 hover:bg-violet-500 text-white py-8 text-3xl font-black uppercase tracking-[0.2em] transition-all rounded-3xl shadow-[0_20px_50px_rgba(139,92,246,0.4)] active:scale-95 border-b-8 border-violet-900"
                        >
                            {isLoading ? <SpinnerIcon className="w-10 h-10" /> : "RECURSIVE WEIGH-IN"}
                        </button>
                    </div>
                </div>
            </div>
          </div>
        )}

        {step === 4 && !error && (
          <div className="max-w-4xl mx-auto space-y-8 fade-in py-10">
            <div className={`aero-panel p-12 border-4 relative transition-all duration-1000 ${recursiveResult.isSurvivalActivated ? 'border-amber-500 bg-amber-950/20 shadow-[0_40px_100px_rgba(245,158,11,0.2)]' : 'border-cyan-500 bg-slate-900'}`}>
                {recursiveResult.isSurvivalActivated && (
                    <div className="absolute inset-4 border-2 border-amber-500/30 pointer-events-none animate-pulse rounded-2xl" />
                )}
                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-12 py-4 border-4 border-black font-comic-header text-4xl shadow-[10px_10px_0_0_#000] rotate-1 z-10 ${recursiveResult.isSurvivalActivated ? 'bg-amber-500 text-black' : 'bg-white text-black'}`}>
                    {recursiveResult.isSurvivalActivated ? 'SURVIVAL PROTOCOL: 87A' : 'ARCHITECTS RECONCILIATION'}
                </div>

                <div className="space-y-10 mt-8 relative z-10">
                    <div className="bg-black/90 border-4 border-black p-8 rounded-3xl shadow-2xl">
                        <h5 className="text-[10px] text-gray-600 font-black uppercase mb-6 tracking-widest flex items-center gap-3">
                          <TerminalIcon className={`w-5 h-5 ${recursiveResult.isSurvivalActivated ? 'text-amber-500' : 'text-cyan-500'}`} /> 
                          REASONING_CHAIN_GIFTED
                        </h5>
                        <div className="space-y-6">
                            {recursiveResult.reasoningChain?.map((stepText, idx) => (
                                <div key={idx} className="flex gap-4 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 400}ms` }}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full border text-xs flex items-center justify-center font-black ${recursiveResult.isSurvivalActivated ? 'bg-amber-900 border-amber-400 text-amber-400' : 'bg-cyan-900 border-cyan-400 text-cyan-400'}`}>
                                            {idx + 1}
                                        </div>
                                        {idx < recursiveResult.reasoningChain.length - 1 && <div className={`w-0.5 h-full my-2 ${recursiveResult.isSurvivalActivated ? 'bg-amber-900/50' : 'bg-cyan-900/50'}`} />}
                                    </div>
                                    <p className={`text-base font-mono italic leading-relaxed py-1 ${recursiveResult.isSurvivalActivated ? 'text-amber-300' : 'text-cyan-300/80'}`}>{stepText}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="aero-panel p-8 bg-slate-800/40 border-2 border-black flex flex-col justify-between">
                            <h5 className="text-[10px] text-gray-500 font-black uppercase mb-4 tracking-widest">Policy Override</h5>
                            <div className="text-4xl font-comic-header text-amber-400">COST RETENTION</div>
                            <p className="text-[10px] text-gray-400 mt-4 italic font-black uppercase tracking-tighter">Treasury Preservation (€5,068) is now the primary objective.</p>
                        </div>
                        <div className="aero-panel p-8 bg-slate-800/40 border-2 border-black flex flex-col justify-between group">
                            <h5 className="text-[10px] text-gray-500 font-black uppercase mb-4 tracking-widest">Link Effectiveness</h5>
                            <div className="flex items-center gap-6">
                                <span className="text-7xl font-comic-header text-red-500">36%</span>
                                <div className="flex-1 space-y-2">
                                     <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-red-600" style={{ width: `36%` }} />
                                     </div>
                                     <p className="text-[9px] text-gray-500 leading-tight uppercase font-black">STALL_DETECTION: ON</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6 pt-4">
                        <button onClick={() => setStep(1)} className="comic-button flex-1 bg-gray-800 hover:bg-gray-700 text-white py-6 font-black uppercase tracking-widest rounded-2xl border-b-4 border-gray-950">RESET PROTOCOL</button>
                        <button className="comic-button flex-1 bg-amber-600 hover:bg-amber-500 text-black py-6 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 rounded-2xl shadow-[0_15px_40px_rgba(245,158,11,0.4)] border-b-4 border-amber-900 active:translate-y-1">
                            <ShieldIcon className="w-8 h-8" /> 
                            <span>TRANSMIT SURVIVAL COMMAND</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="text-center p-10 aero-panel bg-black/60 border-2 border-dashed border-cyan-900/30 rounded-3xl">
                 <p className="text-gray-600 text-[11px] font-mono uppercase tracking-[0.3em] leading-relaxed">
                   "AetherHeal-3.4 status: UNSUSTAINABLE_OFFSET."<br/>
                   <span className="text-white opacity-40 italic">Survival Priority: €5,068 Preservation Protocol (V22.11.02).</span>
                 </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};