
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, SpinnerIcon, ShieldIcon, ActivityIcon, ZapIcon, FireIcon, StarIcon, SignalIcon, WarningIcon } from './icons';

interface ProgressBarProps {
  progress: number;
  label: string;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, color = 'bg-violet-600' }) => (
  <div>
    <div className="flex justify-between items-baseline mb-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
        <span className="font-mono text-sm text-white">{progress}%</span>
    </div>
    <div className="w-full bg-black/40 rounded-full h-3 border-2 border-black overflow-hidden shadow-inner p-[1px]">
      <div
        className={`${color} h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

const CoreSector: React.FC<{ name: string; integrity: number; status: string }> = ({ name, integrity, status }) => (
    <div className="p-4 bg-black/60 rounded-2xl border-2 border-white/5 group hover:border-cyan-500/30 transition-all">
        <div className="flex justify-between items-start mb-3">
            <div>
                <h4 className="font-comic-header text-xl text-white tracking-tight uppercase italic">{name}</h4>
                <p className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">{status}</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${integrity > 80 ? 'bg-green-500' : integrity > 40 ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-ping'}`} />
        </div>
        <div className="space-y-2">
            <div className="flex justify-between text-[7px] font-black text-gray-600 uppercase">
                <span>Shield Resilience</span>
                <span>{integrity}%</span>
            </div>
            <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-700 ${integrity > 80 ? 'bg-cyan-500' : 'bg-amber-600'}`} 
                    style={{ width: `${integrity}%` }} 
                />
            </div>
        </div>
    </div>
);

export const StrategicOverview: React.FC = () => {
  const [shieldActive, setShieldActive] = useState(false);
  const [shieldLevel, setShieldLevel] = useState(42);
  const [sectors, setSectors] = useState([
    { name: "Aether Prime", integrity: 98, status: "STABLE_FIELD" },
    { name: "Solis Hub", integrity: 84, status: "RESONATING" },
    { name: "Nexus-7", integrity: 36, status: "ATTENUATED" },
    { name: "Iron Reach", integrity: 92, status: "LOCKED" }
  ]);

  useEffect(() => {
    if (shieldActive) {
      const interval = setInterval(() => {
        setShieldLevel(prev => Math.min(100, prev + (Math.random() * 2)));
        setSectors(prev => prev.map(s => ({
            ...s,
            integrity: Math.min(100, s.integrity + (Math.random() > 0.5 ? 1 : -0.5))
        })));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [shieldActive]);

  return (
    <div className="h-full flex flex-col bg-[#050810] text-gray-200 font-mono overflow-hidden relative">
      {/* Background Orbital Pulse */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[20px] border-cyan-500/10 rounded-full transition-all duration-[2000ms] ${shieldActive ? 'scale-110 opacity-40 animate-ping' : 'scale-75'}`} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-4 border-dashed border-white/5 rounded-full animate-spin-slow" />
      </div>

      <div className="p-4 sm:p-6 border-b-4 border-black sticky top-0 z-20 bg-slate-900 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-600/10 border-2 border-violet-500/40 rounded-xl flex items-center justify-center">
                <FireIcon className="w-7 h-7 text-violet-400 animate-pulse" />
            </div>
            <div>
                <h2 className="font-comic-header text-3xl text-white uppercase italic tracking-tighter">Ignite Sisters Initiative</h2>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] -mt-1">Mission Authority: Maestro Conjunction</p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-[8px] text-gray-600 font-black uppercase">Unity Rank</p>
                <p className="text-xl font-comic-header text-white">VANGUARD</p>
            </div>
            <ActivityIcon className="w-10 h-10 text-violet-900 opacity-30" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 relative z-10 custom-scrollbar">
        
        {/* Core Shielding Terminal */}
        <div className="aero-panel bg-black/80 border-4 border-cyan-600/40 p-6 sm:p-10 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="lg:w-1/2 space-y-8">
                    <div className="flex items-center gap-4 mb-4">
                        <ShieldIcon className={`w-10 h-10 ${shieldActive ? 'text-cyan-400 animate-pulse' : 'text-gray-800'}`} />
                        <div>
                            <h3 className="font-comic-header text-4xl text-white uppercase tracking-tighter">Shield the Core</h3>
                            <p className="text-cyan-500/60 text-[10px] font-black uppercase tracking-widest">Orbital Defense Protocol 0x03E2</p>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900/60 border-2 border-black rounded-[2rem] space-y-6">
                        <ProgressBar progress={shieldLevel} label="Universal Shield Saturation" color="bg-cyan-500 shadow-[0_0_15px_cyan]" />
                        <div className="grid grid-cols-2 gap-4 text-[9px] font-black uppercase font-mono">
                            <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                                <span className="text-gray-600 block mb-1">Link Frequency</span>
                                <span className="text-cyan-400">142.0 MHz</span>
                            </div>
                            <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                                <span className="text-gray-600 block mb-1">Drift Compensator</span>
                                <span className="text-green-500">ACTIVE</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShieldActive(!shieldActive)}
                            className={`vista-button w-full py-4 text-xl font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 transition-all ${
                                shieldActive ? 'bg-red-950/40 text-red-500 border-red-500/50' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                            }`}
                        >
                            {shieldActive ? <ZapIcon className="w-6 h-6" /> : <SignalIcon className="w-6 h-6" />}
                            <span>{shieldActive ? 'DISENGAGE SHIELD' : 'ACTIVATE PLANETARY SHIELD'}</span>
                        </button>
                    </div>
                </div>

                <div className="lg:w-1/2">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <SignalIcon className="w-4 h-4" /> Core Sector Telemetry
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sectors.map(sector => (
                            <CoreSector key={sector.name} {...sector} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Objectives Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 aero-panel bg-slate-900/40 p-6 border-white/5 overflow-hidden">
                <h3 className="font-comic-header text-2xl text-violet-300 border-b-2 border-black pb-2 mb-6 flex items-center gap-3 italic">
                    <StarIcon className="w-6 h-6 text-violet-500" /> Operational Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: "Sisterhood Link", status: 'Complete', progress: 100, color: 'bg-green-500' },
                        { title: "Ember Sector Audit", status: 'In Progress', progress: 55, color: 'bg-violet-600' },
                        { title: "Emissary Rendezvous", status: 'In Progress', progress: 20, color: 'bg-amber-600' },
                        { title: "Empathy Scanners", status: 'Complete', progress: 100, color: 'bg-green-500' },
                        { title: "Unity Beacons", status: 'In Progress', progress: 92, color: 'bg-cyan-600' },
                        { title: "Core Shielding", status: shieldActive ? 'Active' : 'Awaiting', progress: shieldLevel, color: 'bg-cyan-400' },
                    ].map(obj => (
                        <div key={obj.title} className="p-4 bg-black/40 rounded-2xl border-2 border-black group">
                            <div className="flex justify-between items-center mb-3">
                                <p className="font-bold text-sm text-white uppercase tracking-tight">{obj.title}</p>
                                {obj.status === 'Complete' ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <SpinnerIcon className={`w-4 h-4 ${obj.status === 'Active' ? 'text-cyan-400' : 'text-gray-700'}`} />}
                            </div>
                            <ProgressBar progress={obj.progress} label={obj.status} color={obj.color} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="aero-panel bg-violet-950/20 p-6 border-violet-500/30 flex-1">
                    <h4 className="font-comic-header text-xl text-violet-400 mb-4 uppercase italic">Maestro Directives</h4>
                    <div className="space-y-4 font-mono text-[10px] leading-relaxed">
                        <p className="text-gray-400 italic border-l-2 border-violet-500 pl-3">
                            "The Sisters are the bridge. The Core Worlds are the foundation. Shielding them is not an act of fear, but of absolute architectural authority."
                        </p>
                        <div className="bg-black/60 p-4 rounded-xl border border-white/5 text-violet-300">
                            <span className="text-[8px] font-black text-gray-600 uppercase block mb-1">Neural Alert</span>
                            Fragmented logic detected in Ember Sector. Priority realignment required once shields hit 100%.
                        </div>
                    </div>
                </div>

                <div className="aero-panel bg-amber-950/10 p-6 border-amber-600/20">
                    <h4 className="font-comic-header text-xl text-amber-500 mb-4 uppercase italic">Integrity Log</h4>
                    <div className="space-y-2">
                        {[
                            { time: "04:12", msg: "Shield 0x03E2 handshake confirmed." },
                            { time: "05:08", msg: "Solis Hub resonance at 92%." },
                            { time: "06:11", msg: "Nexus-7 buffer stall detected." }
                        ].map((log, i) => (
                            <div key={i} className="flex gap-3 text-[9px] font-mono text-gray-500">
                                <span className="text-amber-700">[{log.time}]</span>
                                <span className="truncate">{log.msg}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="p-3 bg-slate-900 border-t-4 border-black flex items-center justify-between z-20">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Global Defense: {shieldActive ? 'ON' : 'OFF'}</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Treasury Unit: €5,068 RESERVED</span>
         </div>
         <p className="text-[9px] text-gray-700 font-black uppercase italic tracking-[0.4em] hidden sm:block">Orchestrating the Accord</p>
      </div>
    </div>
  );
};
