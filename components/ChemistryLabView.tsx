import React, { useState, useMemo, useEffect } from 'react';
import { 
    FlaskIcon, ZapIcon, ActivityIcon, SpinnerIcon, ShieldIcon, FireIcon, 
    CheckCircleIcon, WarningIcon, TerminalIcon, SearchIcon, GaugeIcon, 
    LogicIcon, ScaleIcon, CleanIcon, GavelIcon, TestTubeIcon, BookOpenIcon,
    PlusIcon, XIcon, ActivityIcon as WaveIcon, SignalIcon, ServerIcon, BrainIcon
} from './icons';
import type { LabComponentProps, AlchemyVirtues, AlchemyRecipe, GhostHardwareNode } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const ChemistryLabView: React.FC<LabComponentProps> = ({ 
  labName = "GHOST LAB", 
  labIcon: LabIcon = ServerIcon, 
  labColor = "text-cyan-400", 
  globalDirective
}) => {
  // --- Virtues & Recipes ---
  const [virtues, setVirtues] = useState<AlchemyVirtues>(() => {
    const saved = localStorage.getItem('alchemy_virtues');
    return saved ? JSON.parse(saved) : { knowledge: 42, logic: 36, wisdom: 12, integrity: 88, intellect: 24 };
  });

  const [recipes, setRecipes] = useState<AlchemyRecipe[]>(() => {
    const saved = localStorage.getItem('alchemy_recipes');
    return saved ? JSON.parse(saved).map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) })) : [];
  });

  // --- Infrastructure States ---
  const [nodes, setNodes] = useState<GhostHardwareNode[]>([
    { id: 'node-01', type: 'EPYC', load: 14, temp: 32, memory: '2TB ECC', status: 'ACTIVE' },
    { id: 'node-02', type: 'XEON', load: 8, temp: 28, memory: '2TB ECC', status: 'ACTIVE' },
    { id: 'node-03', type: 'FPGA', load: 45, temp: 42, memory: '512GB HBM', status: 'ACTIVE' },
  ]);

  const [dielectricTemp, setDielectricTemp] = useState(24); // Celsius
  const [backplaneLoad, setBackplaneLoad] = useState(1.2); // PB/s
  const [isOverclocking, setIsOverclocking] = useState(false);

  // --- Formula Maker States ---
  const [recipeName, setRecipeName] = useState('');
  const [activeVirtueInput, setActiveVirtueInput] = useState<keyof AlchemyVirtues>('logic');
  const [inputAmount, setInputAmount] = useState(10);
  const [isForging, setIsForging] = useState(false);
  const [forgeLogs, setForgeLogs] = useState<string[]>(["[READY] Dark Fiber backplane established.", "[OK] Dielectric levels nominal."]);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('alchemy_virtues', JSON.stringify(virtues));
  }, [virtues]);

  useEffect(() => {
    localStorage.setItem('alchemy_recipes', JSON.stringify(recipes));
  }, [recipes]);

  // Hardware Pulse
  useEffect(() => {
    const interval = setInterval(() => {
        setNodes(prev => prev.map(n => ({
            ...n,
            load: Math.max(0, Math.min(100, n.load + (Math.random() - 0.5) * 10)),
            temp: Math.max(20, Math.min(85, n.temp + (Math.random() - 0.5) * 2 + (isOverclocking ? 2 : 0)))
        })));
        setBackplaneLoad(prev => Math.max(0.8, Math.min(1.5, prev + (Math.random() - 0.5) * 0.1)));
    }, 2000);
    return () => clearInterval(interval);
  }, [isOverclocking]);

  const handleForge = () => {
    if (!recipeName.trim() || isForging) return;
    setIsForging(true);
    setForgeLogs(prev => [`[INIT] Synthesizing ${recipeName} Shard...`, ...prev]);

    // FPGA Synthesis: Higher hardware load improves outcome but risks thermal Requindor.
    const purity = Math.max(0, Math.min(100, 99.4 - (dielectricTemp > 40 ? (dielectricTemp - 40) * 2 : 0)));
    
    setTimeout(() => {
      const newRecipe: AlchemyRecipe = {
        id: uuidv4(),
        name: recipeName,
        virtueType: activeVirtueInput,
        amount: inputAmount,
        temperature: dielectricTemp,
        purity,
        timestamp: new Date(),
        fpgaSignature: `0x${uuidv4().slice(0, 8).toUpperCase()}_GHOST`
      };

      setRecipes(prev => [newRecipe, ...prev]);
      setVirtues(prev => ({
        ...prev,
        [activeVirtueInput]: prev[activeVirtueInput] + Math.round((inputAmount * purity) / 100)
      }));

      setForgeLogs(prev => [`[SUCCESS] Shard signed: ${newRecipe.fpgaSignature}`, `[OK] Yield purity: ${purity.toFixed(2)}%`, ...prev]);
      setRecipeName('');
      setIsForging(false);
    }, 2000);
  };

  const handleBigRedButton = () => {
    if (confirm("INITIATE THERMITE CHARGE? This will incinerate all local logic caches.")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#020502] overflow-hidden font-mono text-cyan-100 selection:bg-cyan-500/30">
      {/* Ghost Header */}
      <div className="px-6 py-4 border-b-4 border-black bg-[#0a0f1e] flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.9)] z-30">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 border-2 border-cyan-600 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.2)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-cyan-400 opacity-10 group-hover:scale-150 transition-transform duration-1000" />
                <LabIcon className={`w-8 h-8 ${labColor} animate-pulse relative z-10`} />
            </div>
            <div>
                <h2 className="font-comic-header text-3xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[8px] text-cyan-700 font-black uppercase tracking-[0.4em] mt-1 italic">
                   {globalDirective ? `GAZING AT: ${globalDirective.title}` : 'FPGA-Accelerated Conduction Grid'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
                <span className="text-[7px] text-gray-600 font-black uppercase">Backplane Sync</span>
                <span className="text-sm font-black text-cyan-500">{backplaneLoad.toFixed(2)} PB/S</span>
            </div>
            <div className="px-4 py-1.5 bg-black border-2 border-black rounded-lg text-emerald-500 text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#000] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                GHOST_SECURE
            </div>
        </div>
      </div>

      {/* Main Workspace Partitions */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        
        {/* Left: Neural Virtues & Infrastructure Control */}
        <div className="w-72 flex flex-col gap-4 flex-shrink-0 min-h-0">
            {/* Virtue Gauges */}
            <div className="aero-panel bg-black/60 border-4 border-black p-4 flex flex-col shadow-[6px_6px_0_0_#000]">
                <h3 className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                   <BrainIcon className="w-4 h-4" /> Logic Virtues
                </h3>
                <div className="space-y-4 pr-1">
                    {/* // FIX: Cast val to number by ensuring Object.entries returns expected types for virtues mapping */}
                    {(Object.entries(virtues) as [string, number][]).map(([key, val]) => (
                        <div key={key} className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-500">
                                <span>{key}</span>
                                <span className="text-white font-mono">{val}</span>
                            </div>
                            <div className="h-1 bg-black border border-white/5 rounded-full overflow-hidden">
                                {/* // FIX: val is correctly typed as number to prevent error on line 153 */}
                                <div className="h-full bg-cyan-500 transition-all duration-1000 shadow-[0_0_10px_cyan]" style={{ width: `${Math.min(100, val)}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hardware Node Monitor */}
            <div className="flex-1 aero-panel bg-black/40 border-4 border-black p-4 flex flex-col overflow-hidden">
                <h3 className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                   <ServerIcon className="w-4 h-4" /> Scalable Nodes
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                    {nodes.map(node => (
                        <div key={node.id} className="p-3 bg-black/80 rounded-xl border-2 border-zinc-900 group hover:border-violet-500 transition-all">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-black text-white uppercase">{node.type}</span>
                                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${node.status === 'ACTIVE' ? 'bg-green-950 text-green-500' : 'bg-red-950 text-red-500'}`}>{node.status}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div className="space-y-1">
                                    <span className="text-[6px] text-gray-600 font-black uppercase">Core Load</span>
                                    <div className="h-0.5 bg-gray-950 rounded-full overflow-hidden">
                                        <div className="h-full bg-violet-600" style={{ width: `${node.load}%` }} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[6px] text-gray-600 font-black uppercase">Temp</span>
                                    <span className={`text-[8px] font-black block ${node.temp > 75 ? 'text-red-500' : 'text-cyan-400'}`}>{node.temp.toFixed(1)}°C</span>
                                </div>
                            </div>
                            <p className="text-[7px] text-gray-700 font-mono text-right">{node.memory}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Center: Immersion Cooling & RDMA Flow (The Crucible) */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="flex-1 aero-panel bg-[#050914] border-4 border-black p-6 relative overflow-hidden flex flex-col shadow-[20px_20px_60px_rgba(0,0,0,0.9)]">
                {/* Dielectric Fluid Animation Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/20 to-cyan-500/10 animate-pulse" />
                    <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(0deg, rgba(34,211,238,0.1) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />
                </div>
                
                <div className="flex justify-between items-start relative z-10 mb-6">
                    <div>
                        <h3 className="font-comic-header text-4xl text-white uppercase italic tracking-tighter">Immersion Core</h3>
                        <p className="text-cyan-500/60 text-[10px] font-black uppercase tracking-widest mt-1">Status: Liquid Conduction Stable</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Coolant Temp</span>
                        <span className={`text-5xl font-comic-header ${dielectricTemp > 45 ? 'text-red-500 wisdom-glow' : 'text-cyan-400 shadow-[0_0_20px_cyan]'}`}>
                            {dielectricTemp}°C
                        </span>
                    </div>
                </div>

                {/* Interactive Visual Area */}
                <div className="flex-1 flex flex-col items-center justify-center relative py-6">
                    <div className="relative group flex flex-col items-center">
                        {/* Hardware Visualization */}
                        <div className={`w-80 h-48 border-4 border-cyan-500/30 rounded-3xl bg-black/40 relative overflow-hidden transition-all duration-700 ${isForging ? 'scale-105 border-cyan-400' : ''}`}>
                             {/* Floating Circuits Effect */}
                             <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                <SignalIcon className="w-32 h-32 text-cyan-400" />
                             </div>
                             {/* The "Fluid" immersion level */}
                             <div className="absolute bottom-0 left-0 w-full bg-cyan-900/30 border-t-2 border-cyan-500/50 transition-all duration-1000" style={{ height: '70%' }}>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.1)_0%,_transparent_70%)] animate-pulse" />
                             </div>
                             {/* RDMA Logic Spark */}
                             {isForging && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white rounded-full blur-3xl animate-ping" />
                                    <div className="absolute w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_cyan] animate-bounce" />
                                </div>
                             )}
                        </div>
                        {/* Overclock Status */}
                        <div className="mt-8 flex items-center gap-4">
                            <button 
                                onClick={() => setIsOverclocking(!isOverclocking)}
                                className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isOverclocking ? 'bg-red-600 text-white shadow-[0_0_20px_red]' : 'bg-zinc-800 text-gray-500'}`}
                            >
                                {isOverclocking ? 'OVERCLOCK ACTIVE (+40%)' : 'SYSTEM BALANCED'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Environmental Slider */}
                <div className="bg-black/90 border-2 border-cyan-900/30 p-4 rounded-2xl relative z-10 shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                         <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <GaugeIcon className="w-3 h-3" /> Dielectric Calibration
                         </span>
                         <span className="text-[8px] text-cyan-500 font-mono italic tracking-tighter">RDMA_THROUGHPUT: NOMINAL</span>
                    </div>
                    {/* FIX: Explicitly type event and cast to Number to resolve 'unknown' type error on line 154 */}
                    <input 
                        type="range" min="10" max="90" value={dielectricTemp}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDielectricTemp(Number(e.target.value))}
                        className="w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between mt-2 text-[7px] font-black text-gray-800 uppercase px-1">
                        <span>Chilled (10°C)</span>
                        <span>Optimal (24°C)</span>
                        <span>Requindor Wall (90°C)</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right: Synthesis Engine & Logic Vault */}
        <div className="w-80 flex flex-col gap-4 flex-shrink-0 min-h-0">
            {/* Formula Maker (FPGA Forge) */}
            <div className="aero-panel bg-[#0a1020] border-4 border-black p-5 flex flex-col shadow-[8px_8px_0_0_#000] flex-shrink-0">
                <h3 className="font-comic-header text-xl text-white uppercase italic mb-4 flex items-center gap-2">
                    <ZapIcon className="w-5 h-5 text-amber-500" /> Shard Synthesizer
                </h3>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-1">Logic Identity</label>
                        <input 
                            type="text" value={recipeName} onChange={e => setRecipeName(e.target.value)}
                            placeholder="e.g. Neural Bridge..."
                            className="w-full bg-black border-2 border-cyan-900/30 rounded-lg p-2 text-white text-xs placeholder:text-cyan-900 focus:border-cyan-500 transition-all outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-1">Target Virtue</label>
                            <select 
                                value={activeVirtueInput} onChange={e => setActiveVirtueInput(e.target.value as any)}
                                className="w-full bg-black border-2 border-cyan-900/30 rounded-lg p-1.5 text-cyan-400 text-[10px] uppercase font-black"
                            >
                                {['knowledge', 'logic', 'wisdom', 'integrity', 'intellect'].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-1">Complexity (bits)</label>
                            <input 
                                type="number" value={inputAmount} onChange={e => setInputAmount(parseInt(e.target.value))}
                                className="w-full bg-black border-2 border-cyan-900/30 rounded-lg p-1.5 text-white text-xs"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleForge}
                        disabled={isForging || !recipeName.trim()}
                        className="vista-button w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        {isForging ? <SpinnerIcon className="w-4 h-4" /> : <LogicIcon className="w-4 h-4" />}
                        <span>FORGE BINARY</span>
                    </button>
                </div>
            </div>

            {/* Recipe Vault & Logs */}
            <div className="flex-1 aero-panel bg-black border-4 border-black p-5 flex flex-col overflow-hidden shadow-[8px_8px_0_0_#000]">
                <h3 className="font-comic-header text-xl text-cyan-500 uppercase italic mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                    <ShieldIcon className="w-5 h-5" /> Logic Shard Vault
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 mb-4">
                    {recipes.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[9px] text-gray-800 uppercase font-black italic text-center px-4">
                            "Awaiting the first FPGA conduction cycle."
                        </div>
                    ) : (
                        recipes.map(recipe => (
                            <div key={recipe.id} className="p-3 bg-white/5 rounded-xl border-2 border-zinc-900 group hover:border-cyan-500 transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-1">
                                     <span className={`text-[6px] font-black uppercase px-1 rounded ${recipe.purity > 90 ? 'bg-green-600 text-black' : 'bg-red-600 text-black'}`}>
                                        {recipe.purity.toFixed(0)}% PURITY
                                     </span>
                                </div>
                                <p className="text-[10px] font-black text-white uppercase truncate">{recipe.name}</p>
                                <div className="flex justify-between items-center mt-2 text-[7px] text-gray-600 font-mono uppercase">
                                    <span>{recipe.virtueType} Shard</span>
                                    <span>{recipe.amount}B</span>
                                </div>
                                <p className="text-[6px] text-gray-700 mt-1 font-mono">{recipe.fpgaSignature}</p>
                            </div>
                        ))
                    )}
                </div>
                
                {/* Forge Output Stream */}
                <div className="h-28 bg-black border-2 border-zinc-900 p-3 rounded-xl overflow-hidden flex flex-col flex-shrink-0">
                    <p className="text-[7px] font-black text-gray-700 uppercase mb-2 border-b border-white/5 pb-1">Conduction Logs</p>
                    <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                        {forgeLogs.map((log, i) => (
                            <div key={i} className={`text-[8px] font-mono ${log.includes('[SUCCESS]') ? 'text-green-400' : log.includes('[INIT]') ? 'text-amber-400' : 'text-gray-500'}`}>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Ghost Lab Stride Footer */}
      <div className="p-2.5 bg-[#0a101a] border-t-8 border-black flex justify-between items-center z-40 px-8">
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-600 animate-ping" />
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Ghost Protocol: ACTIVE</span>
              </div>
              <span className="text-[8px] text-gray-700 font-mono tracking-widest uppercase">Nodes: 3/12 | RDMA: SYNC_0x03E2</span>
              <div className="h-4 w-px bg-white/10 mx-2" />
              <button 
                onClick={handleBigRedButton}
                className="px-4 py-1 bg-red-950/40 border border-red-600 text-red-500 text-[8px] font-black uppercase hover:bg-red-600 hover:text-white transition-all rounded-md shadow-lg"
              >
                BIG RED BUTTON (PURGE)
              </button>
          </div>
          <p className="text-[9px] text-gray-700 font-black uppercase italic tracking-[0.4em] hidden sm:block">A silent lab is a ghost lab.</p>
      </div>

      <style>{`
        .animate-scan {
            animation: scan 3s linear infinite;
        }
        @keyframes scan {
            0% { transform: translateY(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(100%); opacity: 0; }
        }
        .animate-spin-slow {
            animation: spin 10s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
