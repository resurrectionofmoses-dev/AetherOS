import React, { useState } from 'react';
import { 
    ActivityIcon, 
    ZapIcon, 
    GaugeIcon, 
    ShieldIcon, 
    FireIcon, 
    SpinnerIcon, 
    TerminalIcon, 
    AnalyzeIcon, 
    StarIcon, 
    RulesIcon 
} from './icons';
import type { SystemStatus, FuelOptimizationSuggestion } from '../types';
import { suggestFuelEfficiencyImprovements } from '../services/geminiService';

interface FuelEfficiencyOptimizerProps {
  systemStatus: SystemStatus;
}

export const FuelEfficiencyOptimizer: React.FC<FuelEfficiencyOptimizerProps> = ({ systemStatus }) => {
    const [isScouring, setIsScouring] = useState(false);
    const [suggestions, setSuggestions] = useState<FuelOptimizationSuggestion[]>([]);
    const [potentialGain, setPotentialGain] = useState(0);

    const handleInitiateScour = async () => {
        setIsScouring(true);
        setSuggestions([]);
        try {
            const result = await suggestFuelEfficiencyImprovements(systemStatus);
            setSuggestions(result);
            if (result.length > 0) {
                const avgGain = result.reduce((acc, s) => acc + s.impact, 0) / result.length;
                setPotentialGain(Math.round(avgGain));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsScouring(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#01050a] text-gray-200 font-mono overflow-hidden selection:bg-amber-500/30">
            {/* Header */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-amber-600/10 border-4 border-amber-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.3)] transition-transform hover:scale-110">
                        <GaugeIcon className="w-12 h-12 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-6xl text-white tracking-tighter italic uppercase leading-none">FUEL OPTIMIZER</h2>
                        <div className="flex items-center gap-4 mt-2">
                             <div className="px-4 py-1 bg-amber-600 text-black text-[10px] font-black rounded-full uppercase">Forensic Efficiency Lab</div>
                             <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Optimizing Conjunction Flow</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Theoretical Gain</p>
                        <div className="flex items-center gap-3">
                             <div className="w-48 h-3 bg-black rounded-full overflow-hidden border-2 border-gray-800 p-0.5 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-amber-900 to-amber-500 transition-all duration-1000 shadow-[0_0_15px_amber]" style={{ width: `${potentialGain}%` }} />
                             </div>
                             <span className="text-amber-500 font-comic-header text-2xl">+{potentialGain}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                {/* Background Ambience */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(251,191,36,0.05)_0%,_transparent_70%)] pointer-events-none" />

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                    
                    {/* Left: System Ingress */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        <div className="aero-panel p-8 bg-slate-900/60 border-4 border-black shadow-[10px_10px_0_0_#000]">
                            <h3 className="font-comic-header text-3xl text-white uppercase italic tracking-tight mb-8 flex items-center gap-3">
                                <TerminalIcon className="w-8 h-8 text-amber-500" /> System Ingress
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(systemStatus).map(([sys, state]) => (
                                    <div key={sys} className="flex items-center justify-between p-4 bg-black/60 border-2 border-white/5 rounded-2xl group hover:border-amber-600 transition-all">
                                        <div className="flex items-center gap-4">
                                            <ActivityIcon className={`w-4 h-4 ${state === 'OK' ? 'text-green-500' : state === 'Warning' ? 'text-amber-500' : 'text-red-500'}`} />
                                            <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-white transition-colors">{sys}</span>
                                        </div>
                                        <span className={`text-[8px] font-black px-3 py-1 rounded-full border border-black ${state === 'OK' ? 'bg-green-600 text-black' : state === 'Warning' ? 'bg-amber-600 text-black' : 'bg-red-600 text-white animate-pulse'}`}>
                                            {state}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={handleInitiateScour}
                                disabled={isScouring}
                                className="vista-button w-full mt-10 py-5 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-xl tracking-[0.2em] rounded-3xl flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(251,191,36,0.3)] transition-all active:scale-95 border-b-8 border-amber-900"
                            >
                                {isScouring ? <SpinnerIcon className="w-8 h-8 animate-spin" /> : <ZapIcon className="w-8 h-8" />}
                                <span>{isScouring ? 'CONDUCTING...' : 'INITIATE SCOUR'}</span>
                            </button>
                        </div>

                        <div className="p-8 bg-amber-950/10 border-4 border-amber-900/30 rounded-[3rem] italic text-[11px] text-amber-400/60 leading-relaxed font-mono">
                            [MAESTRO]: "Fuel is the lifeblood of the Conjunction. To waste a single drop is to offend the architectural core. We must refine the flow until the stride is absolute."
                        </div>
                    </div>

                    {/* Right: Optimization Suggestions */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex-1 aero-panel bg-black border-4 border-black min-h-[600px] flex flex-col overflow-hidden relative shadow-[20px_20px_100px_rgba(0,0,0,1)]">
                            <div className="p-6 border-b-4 border-black bg-white/5 flex items-center justify-between relative z-20">
                                <div className="flex items-center gap-4 text-amber-500">
                                    <AnalyzeIcon className="w-6 h-6" />
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Gifted Optimization Manifest</span>
                                </div>
                                {isScouring && <div className="text-[10px] text-amber-500 font-black animate-pulse">SIHONING_INTELLIGENCE...</div>}
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar font-mono space-y-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] relative z-20">
                                {suggestions.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-6 animate-in fade-in zoom-in-95 duration-700">
                                        {suggestions.map((s, idx) => (
                                            <div key={idx} className="p-8 bg-black/80 border-4 border-amber-600/20 rounded-[2.5rem] group hover:border-amber-500 transition-all relative overflow-hidden shadow-xl">
                                                <div className="absolute top-0 right-0 p-4">
                                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black border-4 border-black shadow-lg ${
                                                        s.priority === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' : 
                                                        s.priority === 'HIGH' ? 'bg-amber-600 text-black' : 
                                                        'bg-zinc-800 text-gray-400'
                                                    }`}>
                                                        {s.priority}
                                                    </span>
                                                </div>
                                                <h4 className="font-comic-header text-3xl text-white uppercase italic mb-4 flex items-center gap-4">
                                                    <StarIcon className="w-6 h-6 text-amber-500" /> {s.title}
                                                </h4>
                                                <p className="text-sm text-gray-400 leading-relaxed italic mb-8 border-l-4 border-amber-600 pl-6">
                                                    "{s.reasoning}"
                                                </p>
                                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <FireIcon className="w-4 h-4 text-red-500" />
                                                        <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Resonance Boost</span>
                                                    </div>
                                                    <span className="text-2xl font-comic-header text-green-500">+{s.impact}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-10 py-20">
                                        <RulesIcon className="w-48 h-48 mb-8 text-gray-500" />
                                        <p className="font-comic-header text-5xl uppercase tracking-[0.3em] italic text-center">Awaiting Conjunction</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-white/5 border-t-2 border-black/40 flex justify-between items-center text-[8px] font-black uppercase text-gray-700 tracking-widest relative z-20">
                                <span>Optimization Status: {isScouring ? 'SCOURING' : suggestions.length > 0 ? 'SYNTHESIZED' : 'IDLE'}</span>
                                <span>Stride: 1.2 PB/s | Conductor: MAESTRO</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-12 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Efficiency Engine: ONLINE</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase">
                      Current Load: 42% | Reedle Depth: 0x03E2 | Optimization Factor: {potentialGain}%
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em]">
                   Gifted Know-How for the High-Integrity Chassis.
                </div>
            </div>
        </div>
    );
};