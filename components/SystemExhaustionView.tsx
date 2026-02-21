
import React, { useState, useEffect, useRef } from 'react';
import { 
    FireIcon, ActivityIcon, ZapIcon, GaugeIcon, SpinnerIcon, 
    ShieldIcon, TerminalIcon, LogicIcon, CheckCircleIcon, WarningIcon,
    SearchIcon, CodeIcon, SignalIcon
} from './icons';
import { conductTotalExhaustionAnalysis } from '../services/geminiService';
import type { LabComponentProps, ExhaustionReport } from '../types';

export const SystemExhaustionView: React.FC<LabComponentProps> = ({ 
  labName = "SYSTEM EXHAUSTION", 
  labIcon: LabIcon = FireIcon, 
  labColor = "text-red-600", 
  description = "Max-load forensic stress test and absolute boundary analysis." 
}) => {
  const [load, setLoad] = useState(14);
  const [isExhausting, setIsExhausting] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[READY] Exhaustion protocols standby.", "[OK] Safety buffers engaged."]);
  const [report, setReport] = useState<ExhaustionReport | null>(null);
  
  // Simulated Subsystem Loads
  const [netLoad, setNetLoad] = useState(12);
  const [logicLoad, setLogicLoad] = useState(8);
  const [kineticLoad, setKineticLoad] = useState(4);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: number;
    if (isExhausting) {
        // Ramp up sequence
        interval = window.setInterval(() => {
            setLoad(prev => Math.min(120, prev + Math.random() * 5));
            setNetLoad(prev => Math.min(100, prev + Math.random() * 8));
            setLogicLoad(prev => Math.min(100, prev + Math.random() * 10));
            setKineticLoad(prev => Math.min(100, prev + Math.random() * 6));
            
            const sys = ['KERNEL', 'NET_MESH', 'LOGIC_CORE', 'KINETIC_BUS'][Math.floor(Math.random() * 4)];
            const hex = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase();
            setLogs(p => [`[STRESS] ${sys}_OVERLOAD_0x${hex} >> CRITICAL`, ...p].slice(0, 40));
        }, 150);
    } else {
        // Cooldown sequence
         if (load > 14) {
             interval = window.setInterval(() => {
                setLoad(prev => Math.max(14, prev - 5));
                setNetLoad(prev => Math.max(12, prev - 5));
                setLogicLoad(prev => Math.max(8, prev - 5));
                setKineticLoad(prev => Math.max(4, prev - 5));
             }, 100);
         }
    }
    return () => clearInterval(interval);
  }, [isExhausting, load]);

  const initiateExhaustion = async () => {
      if (isExhausting) return;
      setIsExhausting(true);
      setReport(null);
      setLogs(p => ["[COMMAND] EXAMINE. ANALYZE. EXHAUST.", "[WARNING] Disabling safety heuristics...", ...p]);
      
      // Simulate run time then call API
      setTimeout(async () => {
          try {
              setLogs(p => ["[ANALYSIS] Siphoning peak telemetry for Maestro...", ...p]);
              const result = await conductTotalExhaustionAnalysis({
                  peak_load: 120,
                  network_saturation: "FULL",
                  logic_drift: "0.42ms",
                  kinetic_status: "LOCKED"
              });
              setReport(result);
              setLogs(p => ["[SUCCESS] Forensic Report Generated.", ...p]);
          } catch (e) {
              setLogs(p => ["[ERROR] Analysis fracture. Logic burned out.", ...p]);
          } finally {
              setIsExhausting(false);
          }
      }, 5000);
  };

  return (
    <div className="h-full flex flex-col bg-[#080202] overflow-hidden font-mono text-red-100">
      <div className="p-6 border-b-8 border-black bg-red-950/20 flex justify-between items-center shadow-xl z-20">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-600/10 border-4 border-red-600 rounded-3xl flex items-center justify-center animate-pulse">
                <LabIcon className={`w-10 h-10 ${labColor}`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-red-500 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="flex gap-6">
            <div className="text-right">
                 <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Global Stress</p>
                 <p className={`text-3xl font-black ${load > 100 ? 'text-white animate-bounce' : 'text-red-500'}`}>{load.toFixed(0)}%</p>
            </div>
            <button 
                onClick={initiateExhaustion}
                disabled={isExhausting}
                className={`px-10 py-3 rounded-2xl border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isExhausting ? 'bg-zinc-800 text-gray-500' : 'bg-red-600 text-white hover:bg-red-500'}`}
            >
                {isExhausting ? 'EXHAUSTING...' : 'TOTAL EXHAUSTION'}
            </button>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto custom-scrollbar">
        
        {/* Main Stress Core */}
        <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="aero-panel bg-black/80 border-4 border-red-900/50 p-10 flex flex-col items-center justify-center relative overflow-hidden shadow-[20px_20px_0_0_#000]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(220,38,38,0.1)_0%,_transparent_70%)] animate-pulse" />
                
                <div className="relative z-10 w-full flex flex-col items-center">
                    <h3 className="text-[10px] text-red-500 font-black uppercase tracking-[0.8em] mb-8 animate-pulse">System Limit Break</h3>
                    
                    <div className="w-full h-12 bg-gray-900 rounded-full border-4 border-black p-1 overflow-hidden relative">
                        <div 
                            className="h-full bg-gradient-to-r from-red-900 via-red-600 to-white transition-all duration-75 shadow-[0_0_30px_red]" 
                            style={{ width: `${Math.min(100, (load / 120) * 100)}%` }} 
                        />
                        {/* Critical Line */}
                        <div className="absolute top-0 bottom-0 left-[83%] w-1 bg-black z-20" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-8 w-full mt-10">
                        {[
                            { l: 'Network Mesh', v: netLoad },
                            { l: 'Logic Core', v: logicLoad },
                            { l: 'Kinetic Bus', v: kineticLoad }
                        ].map(sys => (
                             <div key={sys.l} className="text-center p-4 bg-black/60 border-2 border-red-900/30 rounded-2xl">
                                <p className="text-[8px] font-black uppercase text-gray-500 mb-2">{sys.l}</p>
                                <div className="relative h-32 w-8 mx-auto bg-gray-900 rounded-full border border-gray-800 overflow-hidden">
                                    <div 
                                        className="absolute bottom-0 left-0 w-full bg-red-600 transition-all duration-100"
                                        style={{ height: `${sys.v}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-xl font-bold text-white">{sys.v.toFixed(0)}%</p>
                             </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Forensic Report Area */}
            {report && (
                <div className="aero-panel bg-slate-900 border-4 border-white/20 p-8 animate-in slide-in-from-bottom-10 shadow-2xl">
                    <div className="flex justify-between items-start mb-6 border-b-2 border-white/10 pb-4">
                        <div className="flex items-center gap-4">
                            <ShieldIcon className="w-10 h-10 text-green-500" />
                            <div>
                                <h3 className="font-comic-header text-3xl text-white uppercase italic">Forensic Conclusion</h3>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Signed: {report.signature}</p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-black font-black uppercase text-xs ${report.survivalStatus === 'SURVIVED' ? 'bg-green-500' : 'bg-red-500'}`}>
                            {report.survivalStatus}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-[9px] text-gray-500 font-black uppercase mb-2">Maestro's Assessment</p>
                            <p className="text-sm text-gray-300 italic leading-relaxed border-l-4 border-red-600 pl-4 bg-white/5 py-4 pr-4 rounded-r-xl">
                                "{report.maestroAssessment}"
                            </p>
                        </div>
                        <div>
                             <p className="text-[9px] text-gray-500 font-black uppercase mb-2">Fracture Points</p>
                             <ul className="space-y-2">
                                {report.fracturePoints.map((pt, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-red-400 font-mono bg-black/40 p-2 rounded border border-red-900/20">
                                        <WarningIcon className="w-3 h-3" /> {pt}
                                    </li>
                                ))}
                             </ul>
                             <div className="mt-4 p-4 bg-green-900/20 border border-green-600/30 rounded-xl">
                                 <p className="text-[8px] text-green-600 font-black uppercase mb-1">Remedial Action</p>
                                 <p className="text-xs text-green-100 font-bold">{report.remedialAction}</p>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Live Logs */}
        <div className="lg:col-span-4 flex flex-col">
            <div className="aero-panel bg-black border-4 border-black p-0 flex flex-col h-full shadow-[10px_10px_0_0_#000]">
                 <div className="p-4 border-b-2 border-white/10 bg-zinc-900 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-500">
                        <TerminalIcon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Stress Kernel Log</span>
                    </div>
                    {isExhausting && <SpinnerIcon className="w-4 h-4 text-white animate-spin" />}
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1.5 font-mono text-[10px]">
                    {logs.map((log, i) => (
                        <div key={i} className="text-gray-400 animate-in slide-in-from-left-2">
                            <span className="text-red-900 mr-2">[{i.toString().padStart(3, '0')}]</span>
                            {log}
                        </div>
                    ))}
                    <div ref={logEndRef} />
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};
