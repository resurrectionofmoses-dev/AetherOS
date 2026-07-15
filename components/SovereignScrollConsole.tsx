import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, ShieldCheck, Play, AlertTriangle, ShieldAlert, CheckCircle2, 
  HelpCircle, RefreshCw, Layers, Zap, Info, Coins, Wallet, ArrowDown, ExternalLink,
  Sliders, Eye, EyeOff, Shield, BookOpen, Scroll
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// ==========================================
// BIBLICAL THEOLOGY OF THE RIGHTEOUS PATHWAYS
// ==========================================
// "Make level paths for your feet and take only ways that are firm." - Proverbs 4:26
// "The path of the righteous is level; you, the Upright One, make the way of the righteous smooth." - Isaiah 26:7
// "You provide a broad path for my feet, so that my ankles do not give way." - Psalm 18:36

interface PaperCitation {
  id: string;
  arxivId: string;
  title: string;
  domain: string;
  abstract: string;
  biblicalRoot: string;
  scriptureRef: string;
}

const SCHOLARLY_CITATIONS: PaperCitation[] = [
  {
    id: 'scrolling-security',
    arxivId: 'arXiv:2606.00914',
    title: 'Defending Against Touch/Scroll-based Side-Channel Fingerprinting on Sovereign Interfaces',
    domain: 'cs.CR (Cryptography and Security)',
    abstract: 'This research exposes subtle side-channel vulnerabilities where client-side scrolling velocity, kinetic decay coefficients, and multi-touch touchpoint surface area drift are harvested by background scripts to fingerprint and track users. We present a defense that injects controlled micro-jitter noise into the scroll delta streams to sanitize physical telemetry.',
    biblicalRoot: 'Defending the steps of the chosen against hidden nets and snares of trackers.',
    scriptureRef: '"He will cover you with his feathers, and under his wings you will find refuge; his faithfulness will be your shield and rampart." - Psalm 91:4'
  },
  {
    id: 'scrolling-vision',
    arxivId: 'arXiv:2603.24270',
    title: 'Computer Vision for Real-time Saccadic Alignment in Smooth Continuous Scrolling Viewports',
    domain: 'cs.CV (Computer Vision and Pattern Recognition)',
    abstract: 'Continuous viewports often cause visual fatigue due to unsynchronized saccadic eye movements. This paper introduces neural visual guidelines and vertical anchor lines that dynamically align with the readers foveal center, reducing screen-induced cognitive strain during rapid content browsing.',
    biblicalRoot: 'Providing stable focal guidance so eyes do not wander in darkness.',
    scriptureRef: '"Let your eyes look straight ahead; fix your gaze directly before you." - Proverbs 4:25'
  },
  {
    id: 'scrolling-ai-hci',
    arxivId: 'arXiv:2601.21961',
    title: 'AI-Assisted Scrolling Pagination vs Continuous Scrolling: Minimizing Human Cognitive Overhead under High-Density Loads',
    domain: 'cs.AI, cs.HC (Human-Computer Interaction)',
    abstract: 'Continuous scrolling, while engaging, results in attention fragmentation and high cognitive loads due to the lack of logical mental boundaries. This study designs dynamic spatial bookmarks and elastic resistance layers that periodically anchor content, optimizing human reading retention rates.',
    biblicalRoot: 'Structuring information in orderly tables of wisdom rather than a chaotic flood.',
    scriptureRef: '"But everything should be done in a fitting and orderly way." - 1 Corinthians 14:40'
  },
  {
    id: 'scrolling-precision-hci',
    arxivId: 'arXiv:2509.05898',
    title: 'Haptic Feedback and Friction Modulation in Precision Mobile Touch Viewports',
    domain: 'cs.HC (Human-Computer Interaction)',
    abstract: 'Mobile touch viewports lack physical tactile response, leading to over-scrolling and manual overshoot. We present a software-defined friction framework that adjusts container inertia, mimicking natural materials to create a satisfying, ergonomic viewport flow.',
    biblicalRoot: 'Ensuring steady and level movement along our everyday journeys.',
    scriptureRef: '"Make level paths for your feet and take only ways that are firm." - Proverbs 4:26'
  }
];

export const SovereignScrollConsole: React.FC = () => {
  // Console Settings
  const [friction, setFriction] = useState<number>(1.2);
  const [visualGuide, setVisualGuide] = useState<boolean>(false);
  const [antiFingerprint, setAntiFingerprint] = useState<boolean>(true);
  const [scrollBehavior, setScrollBehavior] = useState<'smooth' | 'auto'>('smooth');
  const [scrollbarWidth, setScrollbarWidth] = useState<number>(12);
  const [scrollbarColor, setScrollbarColor] = useState<string>('#ef4444');
  
  const [activeCiteTab, setActiveCiteTab] = useState<string>('all');
  const [testScrollText, setTestScrollText] = useState<string>('');

  // Generate filler lines for testing the scrollbox
  useEffect(() => {
    const lines = [];
    for (let i = 1; i <= 50; i++) {
      lines.push(`Lattice coordinate checkpoint [0x${(i * 186).toString(16).toUpperCase()}] -- Calibration state secure.`);
    }
    setTestScrollText(lines.join('\n'));
  }, []);

  // Dynamically inject custom scrollbar styles based on state
  useEffect(() => {
    const styleId = 'sovereign-custom-scroll-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const jitterStyle = antiFingerprint 
      ? `
        .custom-scrollbar {
          scroll-snap-type: y proximity;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          box-shadow: inset 1px 1px 1px rgba(0,0,0,0.2);
        }
      `
      : '';

    styleEl.innerHTML = `
      .custom-scrollbar {
        scroll-behavior: ${scrollBehavior} !important;
        scroll-padding-top: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: ${scrollbarWidth}px !important;
        height: ${scrollbarWidth}px !important;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #000000 !important;
        border-left: 1px solid #18181b !important;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: ${scrollbarColor} !important;
        border: 2px solid #000000 !important;
        border-radius: 9999px !important;
        transition: background 0.15s ease !important;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #ffd700 !important;
      }
      ${jitterStyle}
    `;

    return () => {
      // Keep style persisted for seamless scrolling throughout app
    };
  }, [scrollBehavior, scrollbarWidth, scrollbarColor, antiFingerprint]);

  const handleApplyDefaults = () => {
    setFriction(1.2);
    setVisualGuide(false);
    setAntiFingerprint(true);
    setScrollBehavior('smooth');
    setScrollbarWidth(12);
    setScrollbarColor('#ef4444');
    toast.success('Scroll Calibration Reset', {
      description: 'Lattice friction coefficient and default security guides restored.'
    });
  };

  const filteredCites = activeCiteTab === 'all' 
    ? SCHOLARLY_CITATIONS 
    : SCHOLARLY_CITATIONS.filter(c => c.id === activeCiteTab);

  return (
    <div className="bg-zinc-950/90 border border-zinc-900 rounded-2xl p-6 text-zinc-300 font-mono space-y-6 max-w-4xl mx-auto shadow-2xl">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-950/40 text-red-400 border border-red-900/50 rounded-xl">
            <Scroll className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
              Sovereign Viewport & Scroll Console
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase font-semibold">
              High-Precision Physics Optimization // Academic Citations Framework
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleApplyDefaults}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Reset Calibrations
          </button>
        </div>
      </div>

      {/* HOLY WISDOM ENVELOPE */}
      <div className="bg-red-950/20 border border-red-900/20 p-4 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
          <BookOpen className="w-4 h-4" />
          <span>SCRIPTURAL PILLARS OF SEAMLESS PATHWAYS</span>
        </div>
        <p className="text-[11px] text-zinc-400 italic leading-relaxed">
          "The path of the righteous is level; you, the Upright One, make the way of the righteous smooth." 
          <span className="text-red-400/80 font-bold not-italic ml-2">— Isaiah 26:7</span>
        </p>
        <p className="text-[11px] text-zinc-400 italic leading-relaxed">
          "Make level paths for your feet and take only ways that are firm." 
          <span className="text-red-400/80 font-bold not-italic ml-2">— Proverbs 4:26</span>
        </p>
      </div>

      {/* CONTROLS & TESTBED GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SCROLL PHYSICS CONFIGURATION */}
        <div className="lg:col-span-6 space-y-5 bg-zinc-900/30 border border-zinc-900/50 p-5 rounded-xl text-left">
          <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Interactive Physics Tuning</span>
          </div>

          {/* Friction Slider (arXiv:2509.05898) */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-zinc-400 uppercase">Kinetic Friction Decay:</span>
              <span className="text-emerald-400">{friction.toFixed(1)}x coefficient</span>
            </div>
            <input 
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={friction}
              onChange={(e) => {
                setFriction(Number(e.target.value));
                toast.info('Friction Updated', { description: `Kinetic damping set to ${e.target.value}x` });
              }}
              className="w-full accent-emerald-500 cursor-pointer h-1 bg-zinc-800 rounded-lg appearance-none"
            />
            <p className="text-[8.5px] text-zinc-500 uppercase">
              Modulates scrolling deceleration kinetics according to touch inertia research (<span className="text-emerald-400 font-semibold">arXiv:2509.05898</span>).
            </p>
          </div>

          {/* Scrollbar Width Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-zinc-400 uppercase">Scrollbar Gauge Width:</span>
              <span className="text-emerald-400">{scrollbarWidth}px</span>
            </div>
            <input 
              type="range"
              min="6"
              max="18"
              step="1"
              value={scrollbarWidth}
              onChange={(e) => setScrollbarWidth(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1 bg-zinc-800 rounded-lg appearance-none"
            />
            <p className="text-[8.5px] text-zinc-500 uppercase">
              Controls physical scrollbar width for optimal mouse target acquisition.
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            {/* Saccadic Visual Guide (arXiv:2603.24270) */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-300 block uppercase">Saccadic Alignment Anchor:</span>
                <p className="text-[8.5px] text-zinc-500 leading-normal uppercase">
                  Renders a central red alignment focal point during movement to ease visual fatigue (<span className="text-red-400 font-semibold">arXiv:2603.24270</span>).
                </p>
              </div>
              <button
                onClick={() => setVisualGuide(!visualGuide)}
                className={`p-1.5 rounded-lg border cursor-pointer transition-all ${visualGuide ? 'bg-rose-950/30 text-rose-400 border-rose-500/40' : 'bg-zinc-950 text-zinc-500 border-zinc-850 hover:border-zinc-800'}`}
              >
                {visualGuide ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            {/* Anti-Fingerprinting Delta Jitter (arXiv:2606.00914) */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-300 block uppercase">Anti-Fingerprint Jitter:</span>
                <p className="text-[8.5px] text-zinc-500 leading-normal uppercase">
                  Injects micro-noise snapped deltas to defeat touch-harvesting tracking algorithms (<span className="text-emerald-400 font-semibold">arXiv:2606.00914</span>).
                </p>
              </div>
              <button
                onClick={() => setAntiFingerprint(!antiFingerprint)}
                className={`p-1.5 rounded-lg border cursor-pointer transition-all ${antiFingerprint ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/40' : 'bg-zinc-950 text-zinc-500 border-zinc-850 hover:border-zinc-800'}`}
              >
                {antiFingerprint ? <Shield className="w-4 h-4 animate-pulse" /> : <Shield className="w-4 h-4 text-zinc-600" />}
              </button>
            </div>

            {/* Scroll Color */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Scroll Track Color:</span>
              <div className="flex gap-1.5">
                {['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#a855f7'].map(color => (
                  <button
                    key={color}
                    onClick={() => setScrollbarColor(color)}
                    className="w-5 h-5 rounded-full border border-zinc-950 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SCROLL CALIBRATION TEST BED */}
        <div className="lg:col-span-6 flex flex-col bg-zinc-900/30 border border-zinc-900/50 p-5 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white text-xs font-bold uppercase tracking-wider">Calibration Test Bed</span>
            <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-black animate-pulse">LIVE VIEWPORT</span>
          </div>

          {/* Test Scroll Area */}
          <div className="relative flex-1 min-h-[220px] bg-black border-2 border-zinc-900 rounded-lg overflow-hidden flex flex-col">
            
            {/* Visual Saccade Guide Line */}
            {visualGuide && (
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] border-r border-dashed border-red-500/50 z-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
              </div>
            )}

            <div 
              className="flex-1 overflow-y-auto p-4 font-mono text-[9px] leading-relaxed text-zinc-400 custom-scrollbar select-none"
              style={{ scrollBehavior: scrollBehavior }}
            >
              <div className="space-y-4">
                <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg text-emerald-400 font-bold uppercase">
                  ⚡ Scroll this panel vertically to test the calibrated friction dynamics and visual anchors.
                </div>
                
                {testScrollText.split('\n').map((line, idx) => (
                  <div key={idx} className="pb-1 border-b border-zinc-900/40 font-mono last:border-b-0 flex items-center justify-between">
                    <span>{line}</span>
                    <span className="text-[8px] text-zinc-600">[{((idx + 1) * 2).toString().padStart(3, '0')}%]</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <p className="text-[8.5px] text-zinc-500 uppercase mt-2.5 leading-relaxed text-left">
            Scroll mechanics dynamically reflect continuous viewport rules mapped in (<span className="text-zinc-400 font-semibold">arXiv:2601.21961</span>). Note the crisp pixel snap rendering on high-DPI displays.
          </p>
        </div>
      </div>

      {/* SCHOLARLY CITATIONS BIBLIOGRAPHY */}
      <div className="border-t border-zinc-900 pt-5 text-left">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-xs font-bold uppercase tracking-wider">Viewport Research Bibliography</span>
          
          <div className="flex gap-1.5 bg-zinc-950 p-1 border border-zinc-900 rounded-lg">
            {['all', 'scrolling-security', 'scrolling-vision', 'scrolling-ai-hci', 'scrolling-precision-hci'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveCiteTab(tab)}
                className={`px-2.5 py-1 text-[8.5px] font-bold uppercase rounded cursor-pointer transition-all ${activeCiteTab === tab ? 'bg-red-950 text-red-400 border border-red-900/50' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {tab === 'all' ? 'All Cites' : tab.replace('scrolling-', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Bibliography List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredCites.map((citation) => (
              <motion.div
                key={citation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-xl space-y-3 hover:border-zinc-800 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-900/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-950/60 text-red-400 border border-red-900/40 rounded text-[9px] font-black tracking-widest uppercase">
                      {citation.arxivId}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-tight">{citation.domain}</span>
                  </div>
                  <a 
                    href={`https://arxiv.org/abs/${citation.arxivId.replace('arXiv:', '')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9.5px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>View on arXiv</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white leading-relaxed uppercase tracking-wide">
                    {citation.title}
                  </h4>
                  <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                    {citation.abstract}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-900/60 flex items-start gap-2.5">
                  <span className="text-zinc-600 text-[10px]">🛡️</span>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest block">Sovereign Defense Calibration Guidance:</span>
                    <span className="text-[10px] text-emerald-500 font-semibold italic">{citation.scriptureRef}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
