
import React, { useState, useEffect } from 'react';
import { 
    EyeIcon, ActivityIcon, ZapIcon, GaugeIcon, SpinnerIcon, 
    ShieldIcon, FireIcon, CheckCircleIcon, TerminalIcon, 
    SearchIcon, WarningIcon, ScaleIcon
} from './icons';
import type { LabComponentProps } from '../types';

export const VisualSynthesisLabView: React.FC<LabComponentProps> = ({ 
  labName = "VISUAL SYNTHESIS LAB", 
  labIcon: LabIcon = EyeIcon, 
  labColor = "text-emerald-500", 
  description = "Project Chronos Visual Data Ingestion & K10 Hyper-Sharding." 
}) => {
  const [ingestionRate, setIngestionRate] = useState(1.2);
  const [bufferIntegrity, setBufferIntegrity] = useState(99.9);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dataStream, setDataStream] = useState<string[]>([]);
  
  // Simulation of K10 Hyper-Sharding
  useEffect(() => {
    let interval: number;
    if (isProcessing) {
      interval = window.setInterval(() => {
        setIngestionRate(prev => Math.max(0.5, Math.min(5.0, prev + (Math.random() - 0.5) * 0.5)));
        setBufferIntegrity(prev => Math.min(100, prev + (Math.random() > 0.8 ? 0.01 : 0)));
        setDataStream(prev => {
            const shard = `K10_SHARD_0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0')}`;
            return [`[INGEST] ${shard} >> WITNESSARY_OK`, ...prev].slice(0, 8);
        });
      }, 300);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isProcessing]);

  const toggleProcessing = () => {
    setIsProcessing(!isProcessing);
    if (!isProcessing) {
        setDataStream(prev => ["[SYSTEM] Initiating K10 Hyper-Sharding Protocol...", ...prev]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#020502] overflow-hidden font-mono text-emerald-100">
      <div className="p-6 border-b-8 border-black bg-emerald-950/20 flex justify-between items-center shadow-xl z-20">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-900/10 border-4 border-emerald-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="px-4 py-2 bg-black border-2 border-emerald-900 rounded-xl flex items-center gap-2">
                <ShieldIcon className="w-4 h-4 text-green-500" />
                <span className="text-[8px] font-black uppercase text-green-500 tracking-widest">PZIS: SECURE</span>
            </div>
            <button 
                onClick={toggleProcessing}
                className={`px-6 py-3 rounded-2xl border-4 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isProcessing ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white animate-pulse'}`}
            >
                {isProcessing ? 'HALT INGESTION' : 'INITIATE SYNTHESIS'}
            </button>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto custom-scrollbar">
        
        {/* Main Visualization */}
        <div className="lg:col-span-8 aero-panel bg-black/80 border-4 border-black p-8 flex flex-col justify-center items-center relative overflow-hidden shadow-[12px_12px_0_0_#000]">
             <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
             
             <div className="text-center space-y-10 relative z-10 w-full">
                <div className="flex justify-between items-end">
                    <div className="text-left">
                        <p className="text-[10px] text-emerald-900 font-black uppercase tracking-[0.5em] mb-4">Data Stream Velocity</p>
                        <div className="text-9xl font-black text-white wisdom-glow tracking-tighter leading-none">
                            {ingestionRate.toFixed(1)}<span className="text-2xl text-emerald-900 ml-2">GB/S</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Witnessary Buffer</p>
                        <p className="text-4xl font-comic-header text-emerald-500">{bufferIntegrity}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
                    <div className="p-4 bg-black border-2 border-emerald-900/30 rounded-2xl">
                        <p className="text-[8px] text-emerald-800 font-black uppercase mb-1">Visual Tensor</p>
                        <p className="text-2xl font-comic-header text-white">OPTIMAL</p>
                    </div>
                    <div className="p-4 bg-black border-2 border-emerald-900/30 rounded-2xl">
                        <p className="text-[8px] text-emerald-800 font-black uppercase mb-1">Protocol Divergence</p>
                        <p className="text-2xl font-comic-header text-green-500">0.00%</p>
                    </div>
                    <div className="p-4 bg-black border-2 border-emerald-900/30 rounded-2xl">
                        <p className="text-[8px] text-emerald-800 font-black uppercase mb-1">Grid Saturation</p>
                        <p className="text-2xl font-comic-header text-white">42%</p>
                    </div>
                    <div className="p-4 bg-black border-2 border-emerald-900/30 rounded-2xl">
                        <p className="text-[8px] text-emerald-800 font-black uppercase mb-1">Abundance Mode</p>
                        <p className="text-2xl font-comic-header text-amber-500 animate-pulse">ACTIVE</p>
                    </div>
                </div>
             </div>

             {/* Data Stream Log */}
             <div className="w-full mt-10 p-6 bg-emerald-950/10 border-2 border-emerald-900/20 rounded-3xl">
                <h4 className="font-comic-header text-2xl text-emerald-700 uppercase italic mb-4 flex items-center gap-3">
                    <TerminalIcon className="w-6 h-6" /> Chronos Ingestion Feed
                </h4>
                <div className="space-y-2 font-mono text-[10px] text-emerald-400 h-24 overflow-y-auto custom-scrollbar">
                    {isProcessing ? (
                        dataStream.map((log, i) => (
                            <div key={i} className="flex gap-3 border-l-2 border-emerald-900 pl-4 py-0.5 animate-in slide-in-from-left-2">
                                <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                                <span className="italic">{log}</span>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center opacity-20 py-4">
                            <p className="uppercase tracking-[0.3em] font-black">Link Established. Standby.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Audit & Compliance Sidecar */}
        <div className="lg:col-span-4 flex flex-col gap-8 overflow-hidden">
            <div className="aero-panel bg-slate-900 p-6 border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <h3 className="font-comic-header text-2xl text-emerald-500 uppercase italic flex items-center gap-2">
                        <ScaleIcon className="w-5 h-5" /> Data Integrity
                    </h3>
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                </div>
                
                <div className="space-y-6">
                    <div className="p-4 bg-emerald-950/10 border-2 border-emerald-900/20 rounded-2xl relative overflow-hidden group">
                        <SearchIcon className="absolute -right-4 -bottom-4 w-20 h-20 opacity-5 group-hover:scale-110 transition-transform" />
                        <h4 className="text-sm font-black text-white uppercase mb-2">Forensic Verification</h4>
                        <p className="text-[10px] text-gray-400 leading-relaxed italic mb-4">
                            Every visual shard is hashed against the Project Chronos Witnessary to ensure absolute fidelity and zero-drift.
                        </p>
                        <div className="w-full py-2 bg-emerald-600/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 text-center">
                            Auto-Audit: ENABLED
                        </div>
                    </div>

                    <div className="space-y-3">
                        {['Resolution: 8K', 'Bit Depth: 12-bit', 'Colorspace: REC.2020', 'Compression: LOSSLESS'].map((spec, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-black border border-white/5 rounded-xl">
                                <span className="text-[9px] font-black text-gray-500 uppercase">{spec.split(':')[0]}</span>
                                <span className="text-[9px] font-mono text-white">{spec.split(':')[1]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-6">
                    <div className="p-4 bg-amber-900/10 border-2 border-amber-600/30 rounded-2xl">
                        <p className="text-[9px] text-gray-400 leading-relaxed italic">
                            "The Eye of the System never blinks. Ingesting visual data at this velocity requires absolute architectural confidence."
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Lab Footer */}
      <div className="p-4 bg-slate-900 border-t-8 border-black flex justify-between items-center z-30 px-10 shadow-inner">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600 animate-ping" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest leading-none">Synthesis: ACTIVE</span>
            </div>
            <span className="text-[9px] text-gray-700 font-mono tracking-widest uppercase">
                Shard Integrity: 0x03E2 | Forensic Stride: 1.2 PB/S
            </span>
        </div>
        <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.3em] hidden sm:block">"Project Chronos: Visualizing the Absolute."</p>
      </div>
    </div>
  );
};
