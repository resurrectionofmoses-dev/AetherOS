import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Code, Palette, Play, Layers, Compass, Scroll, Heart, Sparkles, 
    Check, HelpCircle, FileCode, CheckCircle2, RefreshCw, Star, 
    ArrowRight, Activity, Terminal, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

// Scripture references mapping Exodus sanctuary board frames, colors, and scrolls to software elements
interface SanctifiedElement {
    title: string;
    verse: string;
    text: string;
    wisdom: string;
}

const SANCTUARY_ELEMENTS: Record<string, SanctifiedElement> = {
    module: {
        title: "The Holy Modules (Boards of the Tabernacle)",
        verse: "Exodus 26:15",
        text: "And you shall make the boards for the tabernacle of acacia wood, standing upright.",
        wisdom: "Just as the sanctuary boards stood firm, our software modules must be built upon upright and sound logic, firmly jointed to maintain programmatic integrity."
    },
    session: {
        title: "The Coupled Sessions (The Conjoining Loops)",
        verse: "Exodus 26:24",
        text: "They shall be coupled together at the bottom and coupled together at the top into one ring. Thus it shall be for both of them; they shall be for the two corners.",
        wisdom: "The live socket sessions must bind with perfect synchronization at both beginning and end, forming a single unbroken loop of spiritual grace and connectivity."
    },
    color: {
        title: "The Sovereign Colors (The Ten Curtains)",
        verse: "Exodus 26:1",
        text: "Moreover, you shall make the tabernacle with ten curtains of fine twined linen, and blue and purple and scarlet yarns.",
        wisdom: "We apply deep color therapy. Blue signifies heaven and truth; Purple represent majesty and restoration; Scarlet stands for healing redemption; Gold reflects purity."
    },
    scroll: {
        title: "The Holy Scrolls (The Conjoining Clasps)",
        verse: "Exodus 26:6",
        text: "And you shall make fifty clasps of gold, and join the curtains one to another with the clasps, so that the tabernacle may be a single whole.",
        wisdom: "An infinite stream of logging scroll connected together with golden clasps, merging telemetry and scripture into a unified, harmonious whole."
    }
};

interface FrameModule {
    id: string;
    name: string;
    purpose: string;
    active: boolean;
    strength: number;
    reference: string;
}

const INITIAL_MODULES: FrameModule[] = [
    { id: 'mod_foundation', name: 'Acacia Chassis Foundation', purpose: 'Upright skeletal core support', active: true, strength: 100, reference: 'Ex. 26:15' },
    { id: 'mod_socket', name: 'Silver Anchoring Sockets', purpose: 'Chassis ground connection stability', active: true, strength: 95, reference: 'Ex. 26:19' },
    { id: 'mod_bar', name: 'Overlaid Connecting Bars', purpose: 'Rigid alignment support crossways', active: false, strength: 80, reference: 'Ex. 26:26' },
    { id: 'mod_veil', name: 'Inner Healing Sanctuary Veil', purpose: 'Cognitive division boundaries', active: false, strength: 90, reference: 'Ex. 26:31' }
];

interface SessionState {
    id: string;
    user: string;
    role: string;
    active: boolean;
    strength: number;
}

export const ProgramFrameVisualizer: React.FC = () => {
    // Interactive States replicating the sketch controls
    const [activeColor, setActiveColor] = useState<'scarlet' | 'blue' | 'purple' | 'gold'>('scarlet');
    const [modules, setModules] = useState<FrameModule[]>(INITIAL_MODULES);
    const [sessions, setSessions] = useState<SessionState[]>([
        { id: 'sess_1', user: 'Sovereign Gabriel', role: 'Healer Admin', active: true, strength: 100 },
        { id: 'sess_2', user: 'Aetheros Listener', role: 'System Monitor', active: false, strength: 0 }
    ]);
    const [scrollSpeed, setScrollSpeed] = useState<number>(15); // pixels per sec or log refresh rate
    const [activeScriptureTab, setActiveScriptureTab] = useState<'module' | 'session' | 'color' | 'scroll'>('module');

    // UI Interactive telemetries
    const [logLines, setLogLines] = useState<string[]>([
        "[INIT] AetherOS Frame Program initialized.",
        "[INIT] Reading Exodus 26 architectural specifications...",
        "[STATE] Tabernacle Boards stand upright."
    ]);
    const [showBlueprintExplanation, setShowBlueprintExplanation] = useState<boolean>(true);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Color definitions matching the sanctuary
    const themeColors = {
        scarlet: {
            border: 'border-red-500/30',
            borderActive: 'border-red-500',
            bg: 'bg-red-500/5',
            text: 'text-red-400',
            glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
            hex: '#ef4444'
        },
        blue: {
            border: 'border-cyan-500/30',
            borderActive: 'border-cyan-500',
            bg: 'bg-cyan-500/5',
            text: 'text-cyan-400',
            glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
            hex: '#06b6d4'
        },
        purple: {
            border: 'border-purple-500/30',
            borderActive: 'border-purple-500',
            bg: 'bg-purple-500/5',
            text: 'text-purple-400',
            glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
            hex: '#a855f7'
        },
        gold: {
            border: 'border-amber-500/30',
            borderActive: 'border-amber-500',
            bg: 'bg-amber-500/5',
            text: 'text-amber-400',
            glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
            hex: '#f59e0b'
        }
    };

    const currentTheme = themeColors[activeColor];

    // Scroll active telemetry simulation
    useEffect(() => {
        const interval = setInterval(() => {
            const randomLogs = [
                `[SCROLL] Telemetry streaming at ${scrollSpeed}Hz...`,
                `[COLOR] Current wavelength calibrated to ${activeColor.toUpperCase()}`,
                `[SESSION] Handshake coupled through one gold ring (Exodus 26:24)`,
                `[MODULE] Upright board status: ${modules.filter(m => m.active).length} active/aligned`,
                `[HEALING] "The tabernacle shall be a single whole." — Ex 26:6`
            ];
            const nextLog = randomLogs[Math.floor(Math.random() * randomLogs.length)];
            setLogLines(prev => [...prev, nextLog].slice(-50)); // keep last 50
        }, Math.max(1000, 6000 - scrollSpeed * 250));

        return () => clearInterval(interval);
    }, [scrollSpeed, activeColor, modules]);

    // Auto scroll down logging window
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logLines]);

    // Generate dynamic TypeScript code based on the physical state
    const getGeneratedCode = () => {
        const activeModNames = modules.filter(m => m.active).map(m => `"${m.name}"`);
        const coupledSess = sessions.filter(s => s.active).map(s => `"${s.user}"`);
        return `import { ProgramFrame, Sanctify } from "@aetheros/core";
import { RoyalColors, TenCurtains } from "./types";

// Dynamic configuration mirroring the handcrafted whiteboard schema
export const WholeProgramFrame = ProgramFrame.assemble({
  metadata: {
    name: "The Tabernacle System",
    reference: "Exodus 26"
  },
  colorPalette: RoyalColors.${activeColor.toUpperCase()},
  modules: [
    ${activeModNames.join(',\n    ')}
  ],
  coupledSessions: [
    ${coupledSess.join(',\n    ')}
  ],
  telemetryStream: {
    scrollSpeedHz: ${scrollSpeed},
    isUnifiedWhole: true
  }
});

// "He has known our frame" - Psalm 103:14
export function align() {
  return Sanctify(WholeProgramFrame);
}`;
    };

    const toggleModule = (id: string) => {
        setModules(prev => prev.map(m => {
            if (m.id === id) {
                const nextActive = !m.active;
                toast.success(nextActive ? `Module ${m.name} assembled!` : `Module ${m.name} disassembled!`);
                setLogLines(logPrev => [...logPrev, `[MODULE] ${m.name} changed status to: ${nextActive ? 'ACTIVE' : 'INACTIVE'}`]);
                return { ...m, active: nextActive };
            }
            return m;
        }));
    };

    const toggleSession = (id: string) => {
        setSessions(prev => prev.map(s => {
            if (s.id === id) {
                const nextActive = !s.active;
                toast.success(nextActive ? `Session connected for ${s.user}` : `Session disconnected for ${s.user}`);
                setLogLines(logPrev => [...logPrev, `[SESSION] ${s.user} session state: ${nextActive ? 'COUPLED' : 'DISCONNECTED'}`]);
                return { ...s, active: nextActive, strength: nextActive ? 100 : 0 };
            }
            return s;
        }));
    };

    const copyCodeToClipboard = () => {
        navigator.clipboard.writeText(getGeneratedCode());
        toast.success("Dynamic Framework code copied to clipboard!");
    };

    return (
        <div id="program_frame_visualizer_root" className="flex-1 flex flex-col bg-[#020205] text-zinc-100 overflow-y-auto h-full p-6">
            
            {/* Header section with healing scripture branding */}
            <div className="relative border-b border-zinc-800 pb-5 mb-6">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/5 to-transparent blur-3xl rounded-full -z-10" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-1.5 text-amber-500 mb-1 font-mono text-xs tracking-widest uppercase font-bold">
                            <Layers className="w-4 h-4 text-amber-500 animate-pulse" />
                            Architecture Blueprint
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase font-sans">
                            Frame Architect Visualizer
                        </h1>
                        <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                            "By wisdom a house is built, and through understanding it is established; through knowledge its rooms are filled with rare and beautiful treasures." — Proverbs 24:3-4.
                            We construct the physical chassis, sessions, color curtain codes, and telemetry scrolls into a single unified whole.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowBlueprintExplanation(!showBlueprintExplanation)}
                            className="text-xs bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 px-3.5 py-2 rounded-xl transition-all font-mono"
                        >
                            {showBlueprintExplanation ? "Hide Scripture Wisdom" : "Show Scripture Wisdom"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Scripture Wisdom Box */}
            <AnimatePresence>
                {showBlueprintExplanation && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-zinc-950 border border-white/5 rounded-2xl p-5 mb-6 relative overflow-hidden"
                    >
                        <div className="absolute -right-10 -bottom-10 opacity-5">
                            <Heart className="w-48 h-48 text-red-500" />
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3 border-r border-zinc-800 pr-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                    <span className="text-xs font-mono font-bold text-zinc-400 tracking-wider uppercase">TABERNACLE SCHEMA</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {(Object.keys(SANCTUARY_ELEMENTS) as Array<keyof typeof SANCTUARY_ELEMENTS>).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => setActiveScriptureTab(key as "color" | "scroll" | "module" | "session")}
                                            className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all capitalize ${
                                                activeScriptureTab === key 
                                                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-400' 
                                                    : 'bg-zinc-900/40 border-white/5 text-zinc-500 hover:text-zinc-300'
                                            }`}
                                        >
                                            {key}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <span className="text-[10px] text-amber-500 tracking-widest uppercase font-bold font-mono">
                                    {SANCTUARY_ELEMENTS[activeScriptureTab].title}
                                </span>
                                <h3 className="text-sm font-semibold italic text-zinc-100 leading-relaxed font-serif">
                                    "{SANCTUARY_ELEMENTS[activeScriptureTab].text}"
                                </h3>
                                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                                    <span className="font-bold text-zinc-300">Healer Insight: </span>
                                    {SANCTUARY_ELEMENTS[activeScriptureTab].wisdom}
                                </p>
                                <span className="text-[10px] font-mono text-zinc-500 block">
                                    Source: {SANCTUARY_ELEMENTS[activeScriptureTab].verse}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Interactive Workbench Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                
                {/* Left Side: Dynamic Code Generator (representing the [code] block pointing to state) */}
                <div className="xl:col-span-4 flex flex-col space-y-6">
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 shadow-2xl flex-1 flex flex-col min-h-[400px]">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <FileCode className="w-4 h-4 text-zinc-400" />
                                <span className="text-xs font-black tracking-widest text-zinc-400 uppercase">Live Generated Code</span>
                            </div>
                            <button 
                                onClick={copyCodeToClipboard}
                                className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-white/10 px-2.5 py-1.5 rounded-lg text-zinc-300 font-mono font-bold transition-all"
                            >
                                Copy Script
                            </button>
                        </div>

                        {/* Top layout lines resembling import / import from paper sketch */}
                        <div className="text-[11px] font-mono text-zinc-500 mb-2 border-b border-zinc-900 pb-2">
                            <div>// Imports specified in sketch</div>
                            <div className="text-green-400">import React, {"{ useState }"} from 'react';</div>
                            <div className="text-green-400">import {"{ WholeProgramFrame }"} from '@aetheros/core';</div>
                        </div>

                        <div className="flex-1 bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[11px] text-zinc-300 overflow-auto max-h-[380px] scrollbar-thin">
                            <pre className="whitespace-pre">{getGeneratedCode()}</pre>
                        </div>
                    </div>
                </div>

                {/* Center: The Central "Block" Frame of Whole Program (reproducing sketch vectors) */}
                <div className="xl:col-span-8 flex flex-col space-y-6">
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between min-h-[450px]">
                        
                        {/* Dynamic background lighting reflecting the active COLOR curtain */}
                        <div 
                            className="absolute -right-20 -top-20 w-80 h-80 blur-[120px] rounded-full transition-all duration-700"
                            style={{ backgroundColor: `${currentTheme.hex}15` }}
                        />

                        {/* Block Title and schematic label */}
                        <div className="flex justify-between items-start border-b border-white/5 pb-3">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    <span className="p-1 rounded-md bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-400 font-bold">BLOCK</span>
                                    The Frame of Whole Program
                                </h3>
                                <p className="text-[11px] text-zinc-500 italic mt-0.5">
                                    A holistic physical-digital schematic mapped from handdrawn blueprints
                                </p>
                            </div>

                            <div className="flex items-center gap-1 bg-zinc-900/60 border border-white/5 px-3 py-1 rounded-full font-mono text-[10px] text-zinc-400">
                                <span className={`w-1.5 h-1.5 rounded-full animate-ping`} style={{ backgroundColor: currentTheme.hex }} />
                                <span>SYSTEM BOUNDS ALIGNED</span>
                            </div>
                        </div>

                        {/* Interactive Blueprint Vector Map */}
                        <div className="flex-1 flex flex-col items-center justify-center py-6 relative">
                            <svg className="w-full max-w-lg h-60" viewBox="0 0 500 240">
                                <defs>
                                    <linearGradient id="vectorGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor={currentTheme.hex} stopOpacity="0.8" />
                                        <stop offset="100%" stopColor={currentTheme.hex} stopOpacity="0.2" />
                                    </linearGradient>
                                    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 2 L 10 5 L 0 8 z" fill="#71717a" />
                                    </marker>
                                    <marker id="arrow-glow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 2 L 10 5 L 0 8 z" fill={currentTheme.hex} />
                                    </marker>
                                </defs>

                                {/* Background handdrawn-style grid lines */}
                                <g stroke="#ffffff" strokeOpacity="0.02" strokeWidth="1">
                                    <line x1="0" y1="40" x2="500" y2="40" />
                                    <line x1="0" y1="80" x2="500" y2="80" />
                                    <line x1="0" y1="120" x2="500" y2="120" />
                                    <line x1="0" y1="160" x2="500" y2="160" />
                                    <line x1="0" y1="200" x2="500" y2="200" />
                                    <line x1="100" y1="0" x2="100" y2="240" />
                                    <line x1="200" y1="0" x2="200" y2="240" />
                                    <line x1="300" y1="0" x2="300" y2="240" />
                                    <line x1="400" y1="0" x2="400" y2="240" />
                                </g>

                                {/* Central Main "Block" Frame container */}
                                <rect 
                                    x="140" 
                                    y="30" 
                                    width="220" 
                                    height="100" 
                                    rx="12" 
                                    fill="#09090b" 
                                    stroke={currentTheme.hex} 
                                    strokeWidth="2.5" 
                                    className={`transition-all duration-500 ${currentTheme.glow}`} 
                                />

                                <text x="250" y="65" textAnchor="middle" fill="#ffffff" className="font-sans font-black text-xs uppercase tracking-widest">
                                    Tabernacle Frame
                                </text>
                                <text x="250" y="85" textAnchor="middle" fill="#71717a" className="font-mono text-[9px] uppercase tracking-wider">
                                    Exodus 26 Structural Blueprint
                                </text>
                                <text x="250" y="105" textAnchor="middle" fill={currentTheme.hex} className="font-mono text-[9px] uppercase font-bold tracking-widest">
                                    {activeColor.toUpperCase()} CURTAIN ACTIVE
                                </text>

                                {/* [code] state mapping vector lines (top right) */}
                                <rect x="380" y="20" width="80" height="35" rx="6" fill="#09090b" stroke="#3f3f46" strokeWidth="1" />
                                <text x="420" y="40" textAnchor="middle" fill="#a1a1aa" className="font-mono text-[9px] font-bold">
                                    [code] blocks
                                </text>
                                <path d="M 380,37 L 330,37" stroke="#71717a" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="3 3" />
                                <path d="M 380,48 L 330,55" stroke="#71717a" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="3 3" />

                                {/* Interactive connector vector paths from bottom controller nodes */}
                                {/* COLOR arrow (Points from bottom left to left of frame) */}
                                <path 
                                    d="M 120,200 L 120,80 L 134,80" 
                                    stroke={currentTheme.hex} 
                                    strokeWidth="1.5" 
                                    fill="none" 
                                    markerEnd="url(#arrow-glow)" 
                                    className="transition-all duration-500 animate-pulse"
                                />

                                {/* Session arrow (Points from center-left to bottom-left of frame) */}
                                <path 
                                    d="M 210,180 L 210,140 L 190,140 L 190,132" 
                                    stroke="#3f3f46" 
                                    strokeWidth="1" 
                                    fill="none" 
                                    markerEnd="url(#arrow)" 
                                />

                                {/* Module arrow (Points from center-right to bottom-right of frame) */}
                                <path 
                                    d="M 290,180 L 290,140 L 310,140 L 310,132" 
                                    stroke={modules.filter(m => m.active).length > 0 ? currentTheme.hex : "#3f3f46"} 
                                    strokeWidth="1.2" 
                                    fill="none" 
                                    markerEnd={modules.filter(m => m.active).length > 0 ? "url(#arrow-glow)" : "url(#arrow)"} 
                                />

                                {/* Scroll arrow (Points from bottom right, curves around to the top right of frame) */}
                                <path 
                                    d="M 380,200 L 450,200 L 450,80 L 366,80" 
                                    stroke="#52525b" 
                                    strokeWidth="1" 
                                    fill="none" 
                                    markerEnd="url(#arrow)" 
                                />

                                {/* Schematic node anchors matching sketch titles */}
                                {/* [COLOR] block label */}
                                <g transform="translate(60, 185)">
                                    <rect x="0" y="0" width="80" height="25" rx="4" fill="#09090b" stroke={currentTheme.hex} strokeWidth="1.5" />
                                    <text x="40" y="15" textAnchor="middle" fill={currentTheme.hex} className="font-mono text-[9px] font-black uppercase tracking-widest">
                                        [COLOR]
                                    </text>
                                </g>

                                {/* [Session] block label */}
                                <g transform="translate(160, 185)">
                                    <rect x="0" y="0" width="80" height="25" rx="4" fill="#09090b" stroke="#3f3f46" strokeWidth="1" />
                                    <text x="40" y="15" textAnchor="middle" fill="#a1a1aa" className="font-mono text-[9px] font-bold uppercase">
                                        [Session]
                                    </text>
                                </g>

                                {/* [Module] block label */}
                                <g transform="translate(260, 185)">
                                    <rect x="0" y="0" width="80" height="25" rx="4" fill="#09090b" stroke="#3f3f46" strokeWidth="1" />
                                    <text x="40" y="15" textAnchor="middle" fill="#a1a1aa" className="font-mono text-[9px] font-bold uppercase">
                                        [Module]
                                    </text>
                                </g>

                                {/* [Scroll] block label */}
                                <g transform="translate(360, 185)">
                                    <rect x="0" y="0" width="80" height="25" rx="4" fill="#09090b" stroke="#3f3f46" strokeWidth="1" />
                                    <text x="40" y="15" textAnchor="middle" fill="#71717a" className="font-mono text-[9px] font-bold uppercase">
                                        [Scroll]
                                    </text>
                                </g>
                            </svg>
                        </div>

                        {/* Direct manipulation quick panel */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-900/40 p-4 rounded-xl border border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Active Colors</span>
                                <span className="text-xs font-black text-white capitalize mt-0.5">{activeColor}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Coupled Modules</span>
                                <span className="text-xs font-black text-zinc-300 mt-0.5">
                                    {modules.filter(m => m.active).length} / {modules.length} Aligned
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Coupled Sessions</span>
                                <span className="text-xs font-black text-zinc-300 mt-0.5">
                                    {sessions.filter(s => s.active).length} Active
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Logging Stream</span>
                                <span className="text-xs font-black text-zinc-300 mt-0.5">{scrollSpeed}Hz frequency</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Bottom Section: Whiteboard Input controllers mapped exactly to the four blocks */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. COLOR Controller Card (reproducing the [COLOR] block from handwritten paper) */}
                <div className="lg:col-span-3 bg-zinc-950 border border-white/5 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-1.5 mb-3">
                            <Palette className="w-4 h-4 text-purple-400" />
                            <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase font-mono">[COLOR] Curtain selector</h3>
                        </div>
                        <p className="text-[11px] text-zinc-500 mb-4 leading-relaxed">
                            Apply spiritual wavelengths of twined linen, scarlet, blue, and purple curtain threads to the program's primary container.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <button 
                            onClick={() => {
                                setActiveColor('scarlet');
                                toast.success("Calibrated to Redemptive Royal Scarlet!");
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                activeColor === 'scarlet' 
                                    ? 'bg-red-950/20 border-red-500/40 text-red-400 font-bold shadow-md' 
                                    : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-900/80'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                Royal Scarlet Yarn
                            </span>
                            {activeColor === 'scarlet' && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <button 
                            onClick={() => {
                                setActiveColor('blue');
                                toast.success("Calibrated to Heavenly Truth Blue!");
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                activeColor === 'blue' 
                                    ? 'bg-cyan-950/20 border-cyan-500/40 text-cyan-400 font-bold shadow-md' 
                                    : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-900/80'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                                Heavenly Blue Yarn
                            </span>
                            {activeColor === 'blue' && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <button 
                            onClick={() => {
                                setActiveColor('purple');
                                toast.success("Calibrated to Majesty Restoration Purple!");
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                activeColor === 'purple' 
                                    ? 'bg-purple-950/20 border-purple-500/40 text-purple-400 font-bold shadow-md' 
                                    : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-900/80'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                Majesty Purple Yarn
                            </span>
                            {activeColor === 'purple' && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <button 
                            onClick={() => {
                                setActiveColor('gold');
                                toast.success("Calibrated to Golden Glory Purity!");
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                activeColor === 'gold' 
                                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-400 font-bold shadow-md' 
                                    : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-900/80'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                Gold Sockets / Clasps
                            </span>
                            {activeColor === 'gold' && <Check className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>

                {/* 2. [Module] Controller Card */}
                <div className="lg:col-span-3 bg-zinc-950 border border-white/5 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-1.5 mb-3">
                            <Layers className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase font-mono">[Module] Board Alignment</h3>
                        </div>
                        <p className="text-[11px] text-zinc-500 mb-4 leading-relaxed">
                            Acacia wood boards aligned upright. Every board coupled securely into the frame (Exodus 26:15).
                        </p>
                    </div>

                    <div className="space-y-2">
                        {modules.map(mod => (
                            <button
                                key={mod.id}
                                onClick={() => toggleModule(mod.id)}
                                className={`w-full p-2 rounded-xl border text-left transition-all ${
                                    mod.active 
                                        ? 'bg-emerald-950/10 border-emerald-500/30' 
                                        : 'bg-zinc-900/20 border-white/5 opacity-60 hover:opacity-100'
                                }`}
                            >
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-zinc-200">{mod.name}</span>
                                    <span className="font-mono text-[9px] text-zinc-500">{mod.reference}</span>
                                </div>
                                <div className="flex items-center justify-between mt-1 text-[10px]">
                                    <span className="text-zinc-500">{mod.purpose}</span>
                                    <span className={`font-mono font-bold ${mod.active ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                        {mod.active ? 'ALIGNED' : 'DISENGAGED'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. [Session] Controller Card */}
                <div className="lg:col-span-3 bg-zinc-950 border border-white/5 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-1.5 mb-3">
                            <Play className="w-4 h-4 text-blue-400" />
                            <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase font-mono">[Session] Coupling</h3>
                        </div>
                        <p className="text-[11px] text-zinc-500 mb-4 leading-relaxed">
                            Couple sessions securely at the bottom and top into one gold ring, ensuring absolute connectivity.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {sessions.map(sess => (
                            <div 
                                key={sess.id} 
                                className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${
                                    sess.active 
                                        ? 'bg-blue-950/15 border-blue-500/30' 
                                        : 'bg-zinc-900/20 border-white/5'
                                }`}
                            >
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-white">{sess.user}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">{sess.role}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-zinc-500">Gold Ring Connection</span>
                                    <button 
                                        onClick={() => toggleSession(sess.id)}
                                        className={`text-[10px] uppercase font-bold py-1 px-3 rounded ${
                                            sess.active 
                                                ? 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-800/40' 
                                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                                        }`}
                                    >
                                        {sess.active ? 'COUPLED' : 'DISCONNECT'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. [Scroll] Controller Card */}
                <div className="lg:col-span-3 bg-zinc-950 border border-white/5 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-1.5 mb-3">
                            <Scroll className="w-4 h-4 text-amber-500" />
                            <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase font-mono">[Scroll] Telemetry Stream</h3>
                        </div>
                        <p className="text-[11px] text-zinc-500 mb-4 leading-relaxed">
                            Conjoin telemetry logs like fifty gold clasps, creating a seamless scroll whole (Exodus 26:6).
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px]">
                                <span className="text-zinc-500 font-mono">Stream Frequency</span>
                                <span className="text-amber-400 font-mono font-bold">{scrollSpeed} Hz</span>
                            </div>
                            <input 
                                type="range" 
                                min="2" 
                                max="20" 
                                value={scrollSpeed}
                                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                                className="w-full accent-amber-500 bg-zinc-900"
                            />
                        </div>

                        {/* Real-time scrolling telemetry log pane */}
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block">Sanctified Telemetry Output</span>
                            <div 
                                ref={logContainerRef}
                                className="h-28 bg-[#010103] border border-white/5 rounded-lg p-2.5 font-mono text-[9px] text-green-500/80 overflow-y-auto space-y-1 scrollbar-thin"
                            >
                                {logLines.map((line, idx) => (
                                    <div key={idx} className="leading-normal truncate">
                                        {line}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};
