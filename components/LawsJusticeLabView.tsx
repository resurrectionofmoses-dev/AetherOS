import React, { useState, useEffect } from 'react';
import { GavelIcon, ShieldIcon, ActivityIcon, ZapIcon, StarIcon, FireIcon, ScaleIcon, CheckCircleIcon, TerminalIcon, LogicIcon } from './icons';
import type { LabComponentProps, SystemGovernance } from '../types';

export const LawsJusticeLabView: React.FC<LabComponentProps> = ({ 
  labName = "LAWS & JUSTICE LAB", 
  labIcon: LabIcon = GavelIcon, 
  labColor = "text-amber-500", 
  description = "Ethical framework audit and regulatory compliance validation.",
  governance,
  onSetGovernance
}) => {
  const [activeAccord, setActiveAccord] = useState(governance?.activeAccord || 'MAESTRO_SOLO_v5');
  const [lawLevel, setLawLevel] = useState(governance?.lawLevel || 0.42);
  const [symphonicFreedom, setSymphonicFreedom] = useState(governance?.symphonicFreedom || true);
  const [logs, setLogs] = useState<string[]>(["[GOVERNANCE] Regulatory stack re-initialized.", "[OK] Symphonic Freedom enabled."]);

  const updateGov = (newGov: Partial<SystemGovernance>) => {
    if (onSetGovernance && governance) {
      onSetGovernance({ ...governance, ...newGov });
    }
  };

  const handleLawChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLawLevel(val);
    updateGov({ lawLevel: val });
    const logMsg = val < 0.3 ? "[GOV] Entering Laissez-faire mode. Currents broadening." : 
                   val > 0.7 ? "[GOV] Enforcing Rigid Enforcement. Logic lines tightening." :
                   "[GOV] Standard Conjunction active.";
    setLogs(prev => [logMsg, ...prev].slice(0, 5));
  };

  const toggleFreedom = () => {
    const newVal = !symphonicFreedom;
    setSymphonicFreedom(newVal);
    updateGov({ symphonicFreedom: newVal });
    setLogs(prev => [`[GOV] Symphonic Freedom: ${newVal ? 'UNLEASHED' : 'RESTRICTED'}`, ...prev].slice(0, 5));
  };

  const handleApplyAccord = () => {
    setLogs(prev => [`[OK] Applying ${activeAccord} to all symphonies.`, ...prev].slice(0, 5));
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a05] overflow-hidden font-mono text-amber-100">
      <div className="p-6 border-b-8 border-black bg-amber-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-500/10 border-4 border-amber-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-amber-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-[7px] text-gray-600 font-black uppercase">Active Accord</p>
                <p className="text-xl font-comic-header text-amber-500">{activeAccord}</p>
            </div>
            <div className="px-5 py-2 bg-black border-4 border-black rounded-xl text-amber-500 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
                {symphonicFreedom ? 'FREEDOM: ABSOLUTE' : 'FREEDOM: LIMITED'}
            </div>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto custom-scrollbar">
        
        {/* Governance Conductor Panel */}
        <div className="lg:col-span-8 aero-panel bg-black/60 border-4 border-black p-10 space-y-12 relative overflow-hidden flex flex-col justify-center shadow-[15px_15px_0_0_#000]">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <ShieldIcon className="w-64 h-64 text-amber-500" />
            </div>
            
            <div className="relative z-10 space-y-10">
                <div className="flex justify-between items-end border-b-4 border-amber-900/50 pb-6">
                    <h3 className="font-comic-header text-5xl text-white uppercase italic tracking-widest">The Conductor's Dial</h3>
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${lawLevel > 0.8 ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                        <span className="text-xs font-black uppercase text-gray-500">System Integrity Hooked</span>
                    </div>
                </div>

                {/* Law Level Control */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-amber-500">
                        <span className="flex items-center gap-2"><ScaleIcon className="w-4 h-4" /> Law Intensity</span>
                        <span className="text-3xl font-comic-header">{(lawLevel * 100).toFixed(0)}%</span>
                    </div>
                    <div className="relative">
                         <input 
                            type="range" min="0" max="1" step="0.01" value={lawLevel} 
                            onChange={handleLawChange}
                            className="w-full h-4 bg-gray-900 border-4 border-black rounded-full appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="flex justify-between mt-2 text-[8px] font-black text-gray-700 uppercase tracking-tighter">
                            <span>Laissez-faire (Symphonic Chaos)</span>
                            <span>Optimal Accord</span>
                            <span>Absolute Enforcement</span>
                        </div>
                    </div>
                </div>

                {/* Freedom Switch */}
                <div className="p-8 bg-amber-950/20 border-4 border-black rounded-[3rem] flex items-center justify-between group hover:border-amber-600 transition-all shadow-inner">
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-700 ${symphonicFreedom ? 'bg-cyan-600 border-white shadow-[0_0_30px_cyan]' : 'bg-gray-800 border-black'}`}>
                            <ZapIcon className={`w-8 h-8 ${symphonicFreedom ? 'text-white animate-bounce' : 'text-gray-600'}`} />
                        </div>
                        <div>
                            <h4 className="font-comic-header text-3xl text-white uppercase italic leading-none">Symphonic Freedom</h4>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">Grant nodes autonomy to interpret the law.</p>
                        </div>
                    </div>
                    <button 
                        onClick={toggleFreedom}
                        className={`vista-button px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-[0.2em] transition-all border-4 border-black shadow-[5px_5px_0_0_#000] active:translate-y-1 ${symphonicFreedom ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-gray-500'}`}
                    >
                        {symphonicFreedom ? 'UNLEASHED' : 'RESTRICTED'}
                    </button>
                </div>
            </div>
        </div>

        {/* Side Controls & Logs */}
        <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="aero-panel bg-black/40 p-8 border-4 border-black flex-1 flex flex-col shadow-[8px_8px_0_0_#000]">
                <h4 className="font-comic-header text-2xl text-white uppercase italic mb-6 border-b border-white/5 pb-2">Active Protocols</h4>
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {[
                        { title: 'The Stride Clause', active: lawLevel > 0.2 },
                        { title: 'The Signature Bond', active: lawLevel > 0.5 },
                        { title: 'The Ignite Provision', active: lawLevel > 0.1 },
                        { title: 'Symphonic Voluntaryism', active: symphonicFreedom }
                    ].map(rule => (
                        <div key={rule.title} className={`p-4 rounded-2xl border-2 transition-all duration-500 flex items-center justify-between ${rule.active ? 'bg-amber-950/20 border-amber-600' : 'bg-black border-zinc-900 opacity-30 grayscale'}`}>
                            <span className="text-[11px] font-black uppercase tracking-tight text-white">{rule.title}</span>
                            {rule.active && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 space-y-3">
                    <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Set Global Accord</p>
                    <input 
                        type="text" value={activeAccord} onChange={e => setActiveAccord(e.target.value.toUpperCase())}
                        className="w-full bg-black border-4 border-black rounded-xl p-3 text-amber-500 font-mono text-xs uppercase focus:border-amber-600 outline-none"
                    />
                    <button 
                        onClick={handleApplyAccord}
                        className="vista-button w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-xs rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1"
                    >
                        APPLY TO SQUAD
                    </button>
                </div>
            </div>
            
            <div className="aero-panel bg-slate-900 border-4 border-black p-6 flex flex-col h-48 overflow-hidden shadow-inner">
                <div className="flex items-center gap-2 mb-4 text-amber-500 font-black text-[10px] uppercase border-b border-white/5 pb-2">
                    <TerminalIcon className="w-4 h-4" /> Governance Logs
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                    {logs.map((log, i) => (
                        <div key={i} className="text-[10px] font-mono text-gray-500 italic flex gap-2 animate-in slide-in-from-left-2">
                            <span className="text-amber-800 opacity-40">[{i}]</span>
                            <span>{log}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-amber-900/10 border-4 border-black rounded-[2.5rem] text-center italic text-xs text-amber-600 leading-relaxed shadow-xl">
                "Freedom is not the absence of law, but the mastery of conduction. A symphony is gifted when it chooses the absolute truth of 0x03E2."
            </div>
        </div>
      </div>
    </div>
  );
};
