import React, { useState, useEffect, useRef } from 'react';
import { GoldTranslator } from '../services/goldTranslator';
import { 
    GemIcon, ZapIcon, SpinnerIcon, ShieldIcon, TerminalIcon, 
    LogicIcon, StarIcon, FireIcon, HammerIcon, ScaleIcon,
    ActivityIcon, FlaskIcon, CheckCircleIcon, SearchIcon
} from './icons';
import type { GoldShard } from '../types';
import { v4 as uuidv4 } from 'uuid';

const SHELL_DATA = [
    { label: 'K (Shell 1)', electrons: 2, subshells: '1s²', radius: 40, desc: 'Innermost shell. Bound by strongest electrostatic energy.' },
    { label: 'L (Shell 2)', electrons: 8, subshells: '2s² 2p⁶', radius: 70, desc: 'Highly stable core octet shell.' },
    { label: 'M (Shell 3)', electrons: 18, subshells: '3s² 3p⁶ 3d¹⁰', radius: 105, desc: 'Outer core shell with complete d-orbital shielding.' },
    { label: 'N (Shell 4)', electrons: 32, subshells: '4s² 4p⁶ 4d¹⁰ 4f¹⁴', radius: 140, desc: 'Maximum shell capacity. Packed with high energy density.' },
    { label: 'O (Shell 5)', electrons: 18, subshells: '5s² 5p⁶ 5d¹⁰', radius: 175, desc: 'Relativistically expanded shell; influences gold’s yellow luster.' },
    { label: 'P (Shell 6)', electrons: 1, subshells: '6s¹', radius: 210, desc: 'Valence shell with a solitary electron tightly bound by relativistic contraction.' },
];

export const GoldConjunction: React.FC = () => {
    const [input, setInput] = useState('');
    const [isStamping, setIsStamping] = useState(false);
    const [currentShard, setCurrentShard] = useState<GoldShard | null>(null);
    const [history, setHistory] = useState<GoldShard[]>([]);
    const [shake, setShake] = useState(false);
    const [languageMode, setLanguageMode] = useState<'gold' | 'english'>('gold');
    
    // Bohr Atomic Visualizer & Prospecting States
    const [activeTab, setActiveTab] = useState<'bohr' | 'manifest'>('bohr');
    const [rotation, setRotation] = useState(0);
    const [orbitSpeed, setOrbitSpeed] = useState(1);
    const [excited, setExcited] = useState(false);
    const [selectedShell, setSelectedShell] = useState<number | null>(null);
    const [excitedTimer, setExcitedTimer] = useState<NodeJS.Timeout | null>(null);

    // Geological Assay Calculator States
    const [arsenicPercent, setArsenicPercent] = useState(45);
    const [antimonyPercent, setAntimonyPercent] = useState(30);
    const [mercuryPercent, setMercuryPercent] = useState(15);
    const [silverPercent, setSilverPercent] = useState(10);

    // Relativistic sound tone synthesis
    const playGoldenTone = (freq = 395) => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            
            // Rich perfect-fifth relativistic harmonic
            const harmonic = ctx.createOscillator();
            harmonic.type = 'sine';
            harmonic.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);
            const harmonicGain = ctx.createGain();
            harmonicGain.gain.setValueAtTime(0.015, ctx.currentTime);
            
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            
            osc.connect(gain);
            harmonic.connect(harmonicGain);
            harmonicGain.connect(ctx.destination);
            gain.connect(ctx.destination);
            
            osc.start();
            harmonic.start();
            osc.stop(ctx.currentTime + 0.8);
            harmonic.stop(ctx.currentTime + 0.8);
        } catch (err) {
            console.warn("AudioContext failed or blocked:", err);
        }
    };

    // Continuous smooth animation loop
    useEffect(() => {
        let animationFrameId: number;
        let lastTime = performance.now();
        
        const animate = (time: number) => {
            const delta = time - lastTime;
            lastTime = time;
            const speedFactor = excited ? 5.0 : orbitSpeed;
            setRotation(prev => (prev + (delta * 0.02 * speedFactor)) % 360);
            animationFrameId = requestAnimationFrame(animate);
        };
        
        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [orbitSpeed, excited]);

    const handleStamp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isStamping) return;

        setIsStamping(true);
        const result = await GoldTranslator.translate(input);
        
        // Visual Impact
        setShake(true);
        setTimeout(() => setShake(false), 500);

        const newShard: GoldShard = {
            id: `0x${uuidv4().slice(0, 4).toUpperCase()}_AUR`,
            originalIntent: input,
            goldTranslation: result.gold,
            valueClass: result.class as 1 | 2 | 3,
            weight: result.weight,
            timestamp: Date.now()
        };

        setCurrentShard(newShard);
        setHistory(prev => [newShard, ...prev].slice(0, 10));
        setInput('');
        setIsStamping(false);
        setActiveTab('manifest'); // switch to see stamped shard details
        playGoldenTone(523.25);
    };

    const triggerExcite = () => {
        if (excitedTimer) clearTimeout(excitedTimer);
        setExcited(true);
        playGoldenTone(600);
        const timer = setTimeout(() => {
            setExcited(false);
        }, 1500);
        setExcitedTimer(timer);
    };

    // Calculate prospectivity using weights from the Mathematical model
    const prospectivityScore = (
        (arsenicPercent * 0.35) + 
        (antimonyPercent * 0.25) + 
        (mercuryPercent * 0.15) + 
        (silverPercent * 0.25)
    ).toFixed(1);

    const getProspectivityStatus = (score: number) => {
        if (score > 75) return { label: 'HIGH PROSPECTIVITY ZONE (GREEN UNIT TEST)', color: 'text-green-400 border-green-500/30 bg-green-500/5' };
        if (score >= 40) return { label: 'MODERATE ANOMALY (REQUIRES DRIFT TESTING)', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' };
        return { label: 'STERILE COUNTRY ROCK (WASTED EFFORT MINIMIZED)', color: 'text-red-400 border-red-500/30 bg-red-500/5' };
    };

    return (
        <div className={`h-full flex flex-col bg-black text-[#fbbf24] font-mono overflow-hidden transition-all duration-300 ${shake ? 'translate-y-1' : ''}`}>
            {/* Gold Header */}
            <div className="p-6 border-b-8 border-black bg-black flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#fbbf24]/10 border-4 border-[#fbbf24] rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.3)]">
                        <GemIcon className="w-10 h-10 text-[#fbbf24] animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">GOLD_CONJUNCTION</h2>
                        <p className="text-[#fbbf24] text-[10px] font-black uppercase tracking-[0.4em] mt-1 italic">Aur-um Logic Station | High Stride</p>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[9px] text-[#fbbf24]/60 font-black uppercase tracking-widest mb-1">Grid Weight</p>
                        <p className="text-3xl font-comic-header text-white">
                            {history.reduce((acc, s) => acc + s.weight, 0).toFixed(0)}u
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 p-6 overflow-hidden relative">
                {/* Molten Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(251,191,36,0.1)_0%,_transparent_70%)] pointer-events-none" />

                {/* Stamping Portal */}
                <div className="lg:w-[420px] flex flex-col gap-6 flex-shrink-0 relative z-20">
                    <form onSubmit={handleStamp} className="aero-panel bg-[#121212]/90 p-6 border-[#fbbf24]/30 border-4 shadow-[15px_15px_0_0_#000] hover:scale-[1.01] transition-all">
                        <h3 className="font-comic-header text-3xl text-white uppercase italic tracking-tight mb-6 flex items-center gap-4">
                            <HammerIcon className="w-8 h-8 text-[#fbbf24]" /> Stamping Portal
                        </h3>
                        <div className="bg-black border-4 border-[#fbbf24]/20 p-5 rounded-[2rem] mb-6 focus-within:border-[#fbbf24] transition-all shadow-inner">
                            <p className="text-[#fbbf24]/40 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Input raw intent to gild</p>
                            <textarea 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="e.g. 'Build me a tower of logic'..."
                                className="w-full h-32 bg-transparent border-none font-mono text-[#fbbf24] focus:ring-0 outline-none text-lg resize-none placeholder:text-[#332a05]"
                                disabled={isStamping}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={isStamping || !input.trim()}
                            className="vista-button w-full py-5 bg-[#fbbf24] hover:bg-[#ffcc33] text-black font-black uppercase text-lg tracking-[0.2em] rounded-3xl flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(251,191,36,0.3)] transition-all active:scale-95 border-b-8 border-[#b48d1d]"
                        >
                            {isStamping ? <SpinnerIcon className="w-8 h-8 animate-spin" /> : <FireIcon className="w-8 h-8" />}
                            <span>STAMP INTENT</span>
                        </button>
                    </form>

                    <div className="p-5 bg-[#fbbf24]/5 border-4 border-[#fbbf24]/20 rounded-[2rem] italic text-[11px] text-[#fbbf24]/60 leading-relaxed font-mono">
                        [MAESTRO]: "The Gold Language is the phonaesthetic foundation of reliable conduction. To translate intent into Aur-logic is to give it the weight of eternity."
                    </div>
                </div>

                {/* Output Console / Tabbed Visualizer Panel */}
                <div className="flex-1 flex flex-col bg-black border-4 border-[#fbbf24]/30 rounded-3xl overflow-hidden relative shadow-[20px_20px_100px_rgba(0,0,0,0.8)]">
                    
                    {/* Header with Navigation Tabs */}
                    <div className="p-4 border-b-4 border-[#fbbf24]/20 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-20">
                        <div className="flex items-center gap-4">
                            <TerminalIcon className="w-6 h-6 text-white" />
                            <span className="text-xs font-black uppercase text-[#fbbf24] tracking-[0.2em]">
                                {activeTab === 'bohr' ? 'Au-79 Bohr-Rutherford Resonator' : 'Aur-um Logic Manifest'}
                            </span>
                        </div>
                        
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-[#fbbf24]/20">
                            <button
                                type="button"
                                onClick={() => setActiveTab('bohr')}
                                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                                    activeTab === 'bohr' 
                                        ? 'bg-[#fbbf24] text-black shadow-lg shadow-[#fbbf24]/20' 
                                        : 'text-[#fbbf24]/50 hover:text-[#fbbf24]/80'
                                }`}
                            >
                                Au-79 Bohr Model
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('manifest')}
                                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                                    activeTab === 'manifest' 
                                        ? 'bg-[#fbbf24] text-black shadow-lg shadow-[#fbbf24]/20' 
                                        : 'text-[#fbbf24]/50 hover:text-[#fbbf24]/80'
                                }`}
                            >
                                Shard Manifest
                            </button>
                        </div>
                    </div>

                    {/* Content Frame */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar font-mono relative z-20">
                        
                        {/* ========================================================= */}
                        {/* TAB 1: BOHR ATOMIC EXPLORER */}
                        {/* ========================================================= */}
                        {activeTab === 'bohr' && (
                            <div className="h-full flex flex-col xl:flex-row gap-6 animate-in fade-in duration-500">
                                
                                {/* Interactive Bohr SVG Canvas Column */}
                                <div className="flex-1 flex flex-col items-center bg-[#070707] border-2 border-[#fbbf24]/10 rounded-2xl p-4 relative overflow-hidden">
                                    <div className="absolute top-4 left-4 bg-black/80 border border-[#fbbf24]/20 p-3 rounded-lg z-10">
                                        <p className="text-[10px] text-[#fbbf24]/50 uppercase font-bold">Element ID</p>
                                        <p className="text-lg font-black text-white">GOLD (Au)</p>
                                        <p className="text-[9px] text-[#fbbf24]/80">Atomic Number: 79</p>
                                        <p className="text-[9px] text-[#fbbf24]/80">Atomic Mass: 196.97 u</p>
                                    </div>

                                    {/* SVG Bohr Atom */}
                                    <svg 
                                        viewBox="0 0 500 500" 
                                        className="w-full max-w-[420px] aspect-square transition-transform duration-500 hover:scale-[1.02]"
                                    >
                                        <defs>
                                            <radialGradient id="nucleusGradient" cx="50%" cy="50%" r="50%">
                                                <stop offset="0%" stopColor="#fffbeb" />
                                                <stop offset="35%" stopColor="#fef08a" />
                                                <stop offset="70%" stopColor="#d97706" />
                                                <stop offset="100%" stopColor="#78350f" />
                                            </radialGradient>
                                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                                <feGaussianBlur stdDeviation="3" result="blur" />
                                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                            </filter>
                                            <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                                                <feGaussianBlur stdDeviation="8" result="blur" />
                                                <feComponentTransfer in="blur" result="boost">
                                                    <feFuncA type="linear" slope="2"/>
                                                </feComponentTransfer>
                                                <feMerge>
                                                    <feMergeNode in="boost"/>
                                                    <feMergeNode in="SourceGraphic"/>
                                                </feMerge>
                                            </filter>
                                        </defs>

                                        {/* Subtle background ambient ring */}
                                        {excited && (
                                            <circle cx="250" cy="250" r="230" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.1" filter="url(#goldGlow)" />
                                        )}

                                        {/* Golden Concentric Rings / Orbits */}
                                        {SHELL_DATA.map((shell, idx) => (
                                            <g 
                                                key={shell.label} 
                                                className="group cursor-pointer" 
                                                onMouseEnter={() => setSelectedShell(idx)} 
                                                onMouseLeave={() => setSelectedShell(null)}
                                            >
                                                {/* Expanded mouse detector hitbox ring */}
                                                <circle 
                                                    cx="250" 
                                                    cy="250" 
                                                    r={shell.radius} 
                                                    fill="none" 
                                                    stroke="transparent" 
                                                    strokeWidth="12" 
                                                />
                                                {/* Visual glowing ring */}
                                                <circle 
                                                    cx="250" 
                                                    cy="250" 
                                                    r={shell.radius} 
                                                    fill="none" 
                                                    stroke={selectedShell === idx ? "#fbbf24" : "rgba(251,191,36,0.18)"} 
                                                    strokeWidth={selectedShell === idx ? 2 : 0.8} 
                                                    strokeDasharray={idx === 5 ? "4 4" : "none"}
                                                    className="transition-all duration-300"
                                                />

                                                {/* Orbiting Electrons */}
                                                {Array.from({ length: shell.electrons }).map((_, eIdx) => {
                                                    const baseAngle = (eIdx * (2 * Math.PI)) / shell.electrons;
                                                    const dir = idx % 2 === 0 ? 1 : -1;
                                                    const staggeredOffset = idx * 45;
                                                    const currentAngle = baseAngle + (staggeredOffset * Math.PI / 180) + (dir * rotation * Math.PI / 180);
                                                    const x = 250 + shell.radius * Math.cos(currentAngle);
                                                    const y = 250 + shell.radius * Math.sin(currentAngle);
                                                    return (
                                                        <circle
                                                            key={eIdx}
                                                            cx={x}
                                                            cy={y}
                                                            r={selectedShell === idx ? 4.5 : 2.5}
                                                            fill={selectedShell === idx ? "#ffffff" : "#fbbf24"}
                                                            stroke="#000"
                                                            strokeWidth={0.5}
                                                            filter="url(#glow)"
                                                            className="transition-all duration-300"
                                                        />
                                                    );
                                                })}
                                            </g>
                                        ))}

                                        {/* Glowing Central Nucleus */}
                                        <g className="cursor-pointer" onClick={() => playGoldenTone(395)}>
                                            <circle cx="250" cy="250" r="28" fill="url(#nucleusGradient)" filter="url(#glow)" />
                                            <text x="250" y="254" textAnchor="middle" fill="#000" className="font-sans font-black text-base select-none">Au</text>
                                            <text x="250" y="267" textAnchor="middle" fill="#78350f" className="font-mono text-[7px] font-black select-none tracking-widest">79</text>
                                        </g>
                                    </svg>

                                    {/* Orbit Speed & Excitation Controls */}
                                    <div className="w-full mt-4 bg-black/60 border border-[#fbbf24]/10 p-4 rounded-xl flex flex-col gap-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 uppercase font-bold">Orbit Velocity</span>
                                            <span className="text-[#fbbf24] font-bold">{(excited ? 5.0 : orbitSpeed).toFixed(1)}x</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="3" 
                                            step="0.1"
                                            value={orbitSpeed}
                                            onChange={e => setOrbitSpeed(parseFloat(e.target.value))}
                                            className="w-full accent-[#fbbf24] h-1.5 bg-[#fbbf24]/10 rounded-lg cursor-pointer"
                                            disabled={excited}
                                        />
                                        <div className="grid grid-cols-2 gap-3 mt-1">
                                            <button 
                                                onClick={triggerExcite}
                                                className={`py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${
                                                    excited 
                                                    ? 'bg-red-500 border-red-400 text-white animate-pulse' 
                                                    : 'bg-[#fbbf24]/10 border-[#fbbf24]/30 text-[#fbbf24] hover:bg-[#fbbf24]/20'
                                                }`}
                                            >
                                                {excited ? 'EXCITED_STATE!' : 'EXCITE ATOM'}
                                            </button>
                                            <button 
                                                onClick={() => playGoldenTone(395)}
                                                className="py-2 rounded-xl text-[10px] font-black uppercase bg-[#fbbf24] text-black border-2 border-transparent hover:bg-white hover:text-black transition-all"
                                            >
                                                RESONATE TONE
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Panel: Atomic stats & Geological Prospecting Index */}
                                <div className="flex-1 flex flex-col gap-6">
                                    
                                    {/* Shell info HUD */}
                                    <div className="bg-black/40 border-2 border-[#fbbf24]/20 p-4 rounded-xl">
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                                            <ZapIcon className="w-4 h-4 text-[#fbbf24]" /> Quantum State Details
                                        </p>
                                        {selectedShell !== null ? (
                                            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-black text-white">{SHELL_DATA[selectedShell].label}</span>
                                                    <span className="text-xs font-bold text-[#fbbf24] bg-[#fbbf24]/10 px-2 py-0.5 rounded border border-[#fbbf24]/20">
                                                        {SHELL_DATA[selectedShell].electrons} Electrons
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-[#fbbf24] mb-2 font-mono">Subshells: {SHELL_DATA[selectedShell].subshells}</p>
                                                <p className="text-xs text-gray-400 leading-relaxed italic">"{SHELL_DATA[selectedShell].desc}"</p>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500 italic py-4">Hover over any orbital ring to decode shell configuration, capacity, and relativistic bindings.</p>
                                        )}
                                    </div>

                                    {/* Bohr Relativistic Insight Card */}
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                                        <p className="text-[10px] text-[#fbbf24] uppercase font-black mb-2 flex items-center gap-2">
                                            <ActivityIcon className="w-4 h-4 text-sky-400" /> Relativistic Bohr Luster
                                        </p>
                                        <p className="text-[11px] text-gray-300 leading-relaxed">
                                            Gold's high nuclear charge forces core electrons into velocities approaching <strong>60% of the speed of light</strong>. This creates relativistic contraction of the 1s-6s orbits and expands d-orbitals, narrowing the energy gap between <span className="text-white font-bold">5d and 6s</span>.
                                        </p>
                                        <p className="text-[11px] text-gray-300 leading-relaxed mt-2">
                                            As a result, gold absorbs blue light and reflects a <strong>warm, spectacular yellow luster</strong>. Relativistic stability makes gold highly inert, meaning it survives physically in creeks as native nuggets awaiting panning.
                                        </p>
                                    </div>

                                    {/* Geological Prospecting Decision Support System */}
                                    <div className="bg-black border-2 border-dashed border-[#fbbf24]/20 p-4 rounded-xl">
                                        <p className="text-[10px] text-[#fbbf24] uppercase font-black mb-3 flex items-center gap-2">
                                            <ScaleIcon className="w-4 h-4 text-emerald-400" /> USGS Pathfinder Index Calculator
                                        </p>
                                        <p className="text-[10px] text-gray-500 leading-relaxed mb-4">
                                            Simulate soil geochemical surveys using pathfinder weight factors. Compute the local anomaly score ($Total\_Prospectivity = \sum (L_i \times w_i)$):
                                        </p>

                                        {/* Pathfinder Sliders */}
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                                    <span className="text-gray-400">Arsenic (As) Indicator - wt 35%</span>
                                                    <span className="text-white">{arsenicPercent}%</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="100" value={arsenicPercent}
                                                    onChange={e => setArsenicPercent(Number(e.target.value))}
                                                    className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg cursor-pointer"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                                    <span className="text-gray-400">Antimony (Sb) Indicator - wt 25%</span>
                                                    <span className="text-white">{antimonyPercent}%</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="100" value={antimonyPercent}
                                                    onChange={e => setAntimonyPercent(Number(e.target.value))}
                                                    className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg cursor-pointer"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="flex justify-between text-[10px] font-bold mb-1">
                                                        <span className="text-gray-400">Mercury (Hg) - wt 15%</span>
                                                        <span className="text-white">{mercuryPercent}%</span>
                                                    </div>
                                                    <input 
                                                        type="range" min="0" max="100" value={mercuryPercent}
                                                        onChange={e => setMercuryPercent(Number(e.target.value))}
                                                        className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-[10px] font-bold mb-1">
                                                        <span className="text-gray-400">Silver (Ag) - wt 25%</span>
                                                        <span className="text-white">{silverPercent}%</span>
                                                    </div>
                                                    <input 
                                                        type="range" min="0" max="100" value={silverPercent}
                                                        onChange={e => setSilverPercent(Number(e.target.value))}
                                                        className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Prospectivity Score output */}
                                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-gray-500 uppercase font-black">Conjunction Prospectivity Index:</span>
                                                <span className="text-xl font-comic-header text-white">{prospectivityScore} u</span>
                                            </div>
                                            <div className={`p-2 border rounded-lg text-center text-[9px] font-black uppercase tracking-wider ${getProspectivityStatus(Number(prospectivityScore)).color}`}>
                                                {getProspectivityStatus(Number(prospectivityScore)).label}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* TAB 2: SHARD MANIFEST */}
                        {/* ========================================================= */}
                        {activeTab === 'manifest' && (
                            <div className="animate-in fade-in duration-500">
                                {currentShard ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-[#fbbf24]/40 font-black uppercase tracking-widest">Shard_ID</p>
                                                <p className="text-3xl font-comic-header text-white italic">{currentShard.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-[#fbbf24]/40 font-black uppercase tracking-widest">
                                                    {languageMode === 'gold' ? 'Weight Class' : 'Significance Rating'}
                                                </p>
                                                <p className={`text-3xl font-comic-header ${currentShard.valueClass === 1 ? 'text-[#fbbf24]' : 'text-gray-500'}`}>
                                                    0{currentShard.valueClass}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-gradient-to-br from-[#1a1a1a] to-black border-4 border-[#fbbf24] rounded-[3rem] relative group overflow-hidden shadow-[0_0_100px_rgba(251,191,36,0.1)]">
                                            {/* Interactive Language Toggle Option Inside Shard */}
                                            <div className="absolute top-4 right-4 flex items-center gap-1 bg-black p-1 rounded-xl border border-[#fbbf24]/20 z-10">
                                                <button
                                                    type="button"
                                                    onClick={() => setLanguageMode('gold')}
                                                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                                        languageMode === 'gold' 
                                                            ? 'bg-[#fbbf24] text-black shadow-lg shadow-[#fbbf24]/20' 
                                                            : 'text-[#fbbf24]/50 hover:text-[#fbbf24]/80'
                                                    }`}
                                                >
                                                    Native Gold
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setLanguageMode('english')}
                                                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                                        languageMode === 'english' 
                                                            ? 'bg-[#fbbf24] text-black shadow-lg shadow-[#fbbf24]/20' 
                                                            : 'text-[#fbbf24]/50 hover:text-[#fbbf24]/80'
                                                    }`}
                                                >
                                                    English
                                                </button>
                                            </div>

                                            <h4 className="text-[10px] font-black text-[#fbbf24]/60 uppercase mb-6 flex items-center gap-2">
                                                <ShieldIcon className="w-4 h-4" /> 
                                                {languageMode === 'gold' ? 'Embossed Conjunction' : 'Embossed Decoded Intent'}
                                            </h4>
                                            <div 
                                                className="text-4xl lg:text-5xl font-comic-header text-[#fbbf24] uppercase tracking-tighter italic text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-tight pt-4 pb-2"
                                                style={{ textShadow: '2px 2px 0px #000, -2px -2px 0px #fff4' }}
                                            >
                                                {languageMode === 'gold' ? currentShard.goldTranslation : currentShard.originalIntent}
                                            </div>
                                            <p className="text-center mt-6 text-[10px] text-[#fbbf24]/30 uppercase tracking-[0.5em] font-black">
                                                {languageMode === 'gold' ? 'Manifested Weight' : 'Physical Resonance'}: {currentShard.weight.toFixed(0)}μ
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-5 bg-black border-2 border-[#fbbf24]/10 rounded-2xl">
                                                <p className="text-[8px] font-black text-gray-700 uppercase mb-2">
                                                    {languageMode === 'gold' ? 'Original Intent' : 'Native Gold Terminology'}
                                                </p>
                                                <p className="text-xs text-[#fbbf24]/80 italic">
                                                    "{languageMode === 'gold' ? currentShard.originalIntent : currentShard.goldTranslation}"
                                                </p>
                                            </div>
                                            <div className="p-5 bg-black border-2 border-[#fbbf24]/10 rounded-2xl flex flex-col justify-center items-center">
                                                <ScaleIcon className="w-8 h-8 text-[#fbbf24]/40 mb-2" />
                                                <p className="text-[8px] font-black text-[#fbbf24] uppercase">
                                                    {languageMode === 'gold' ? 'Reliability Shard' : 'Consistency Lock'}
                                                </p>
                                                <p className="text-xs text-white">SYNC_0x03E2</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-8 py-20">
                                        <GemIcon className="w-48 h-48 animate-spin-slow" />
                                        <p className="font-comic-header text-5xl uppercase tracking-[0.3em] text-center max-w-lg italic">
                                            {languageMode === 'gold' ? '"Krak-um Aur-um Dohm-um"' : '"Pound the Gold and build the Dome"'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    {/* Bottom Status Panel */}
                    <div className="p-4 bg-white/5 border-t-2 border-black/40 flex justify-between items-center text-[8px] font-black uppercase text-gray-700 tracking-widest relative z-20">
                        <span>{activeTab === 'bohr' ? 'Atomic State' : 'System State'}: {isStamping ? 'STAMPING' : (excited ? 'EXCITED' : 'STABLE')}</span>
                        <span>{activeTab === 'bohr' ? 'Gold Mass' : 'Stride'}: 196.97 u | {activeTab === 'bohr' ? 'Config' : 'Modulation'}: [2, 8, 18, 32, 18, 1]</span>
                    </div>
                </div>
            </div>

            <style>{`
                .drop-shadow-gold {
                    filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.4));
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
            `}</style>
        </div>
    );
};
