import React, { useState, useEffect, useRef } from 'react';
import { 
    CodeIcon, SignalIcon, ZapIcon, ActivityIcon, ShieldIcon, 
    TerminalIcon, LogicIcon, SearchIcon, FireIcon, GaugeIcon, SpinnerIcon,
    BuildIcon, PackageIcon, CheckCircleIcon, WarningIcon
} from './icons';
import type { LabComponentProps, ImplementationResponse } from '../types';
import { ImplementationResult } from './ImplementationResult';

const REACT_SNIPPETS = [
    'useState<number>(0)',
    'useEffect(() => {',
    'return ( <div /> )',
    '0x03E2_SYNC',
    'const [val, setVal] = useState()',
    'export default App;',
    '<React.StrictMode>',
    'import { GoogleGenAI } from "@google/genai";',
    'useCallback((id) => {',
    'props: LabComponentProps',
    'className="font-comic-header"',
    'await shroud.encrypt(logic)',
    'sessionLedger.recordTurn()',
    'const ai = new GoogleGenAI()',
    'type MainView = "chat" | "vault"',
    'AetherOS_Kernel_v5',
    'Stride: 1.2 PB/s',
    'const { x, y, z, w } = point4D;',
    'gl.useProgram(program)',
    'return extractJSON<T>(text)',
    'shroud.isLocked',
    'const root = ReactDOM.createRoot()',
    'if (!session || retryCount > 3)'
];

interface CodeFallLabViewProps extends LabComponentProps {
    onGenerate?: (logic: string) => Promise<ImplementationResponse | null>;
}

export const CodeFallLabView: React.FC<CodeFallLabViewProps> = ({ 
  labName = "RECURSIVE CODE FALL", 
  labIcon: LabIcon = CodeIcon, 
  labColor = "text-red-500", 
  description = "Conducting the React logic stream in real-time.",
  onGenerate
}) => {
  const [gravity, setGravity] = useState(4.0);
  const [conductionStatus, setConductionStatus] = useState('LOCKED');
  const [logic, setLogic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedModule, setGeneratedModule] = useState<ImplementationResponse | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (conductionStatus !== 'SYNCED') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const fontSize = 12;
    const columns = Math.floor(canvas.width / 20);
    const drops = Array(columns).fill(0).map(() => Math.random() * -100);
    const activeSnippets = Array(columns).fill(0).map(() => 
        REACT_SNIPPETS[Math.floor(Math.random() * REACT_SNIPPETS.length)]
    );

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const snippet = activeSnippets[i];
        const char = snippet[Math.floor(drops[i] / fontSize) % snippet.length] || ' ';
        
        ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#3b82f6';
        
        const x = i * 20;
        const y = drops[i];

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
          activeSnippets[i] = REACT_SNIPPETS[Math.floor(Math.random() * REACT_SNIPPETS.length)];
        }

        drops[i] += gravity * (1 + Math.random() * 0.5);
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, [conductionStatus, gravity]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.parentElement?.clientWidth || 800;
        canvasRef.current.height = canvasRef.current.parentElement?.clientHeight || 600;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInitiate = () => {
    setConductionStatus('CONDUCTING');
    setTimeout(() => setConductionStatus('SYNCED'), 1500);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logic.trim() || !onGenerate || isLoading) return;

    // ACTIVATE LOADING STATE
    setIsLoading(true);
    setError(null);
    setGeneratedModule(null);

    try {
        const result = await onGenerate(logic);
        if (result) {
            setGeneratedModule(result);
        } else {
            setError("Synthesis stalled. Check the logs.");
        }
    } catch (err) {
        setError("Architectural collapse. System unstable.");
    } finally {
        // DEACTIVATE LOADING STATE
        setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050000] overflow-hidden font-mono text-red-100">
      <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-xl z-20">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-900/10 border-4 border-red-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-red-900 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={handleInitiate}
                className={`px-6 py-3 rounded-2xl border-4 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${conductionStatus === 'SYNCED' ? 'bg-green-600 text-black' : 'bg-red-600 text-white animate-pulse'}`}
            >
                {conductionStatus === 'LOCKED' ? 'ESTABLISH SYNC' : conductionStatus === 'CONDUCTING' ? 'SYNCING...' : 'LINK_ESTABLISHED'}
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative bg-black overflow-hidden border-r-4 border-black">
            {conductionStatus === 'LOCKED' ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale scale-150">
                    <CodeIcon className="w-64 h-64 mb-8" />
                    <p className="font-comic-header text-6xl uppercase italic">Static Logic</p>
                </div>
            ) : (
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            )}
        </div>

        <div className="w-[400px] bg-slate-900 border-l-4 border-black p-6 flex flex-col gap-6 z-10 shadow-2xl overflow-y-auto custom-scrollbar">
            <div className="aero-panel bg-black/60 p-5 border-2 border-red-900/30">
                <h3 className="font-comic-header text-xl text-red-500 uppercase italic mb-4 flex items-center gap-2">
                    <GaugeIcon className="w-5 h-5" /> Stride Control
                </h3>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase text-gray-500">
                            <span>Gravity Coefficient</span>
                            <span className="text-red-400">{gravity.toFixed(1)}</span>
                        </div>
                        <input 
                            type="range" min="1" max="15" step="0.5" value={gravity}
                            onChange={e => setGravity(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-900 rounded-full appearance-none cursor-pointer accent-red-600"
                        />
                    </div>
                </div>
            </div>

            <div className="aero-panel bg-black/60 p-5 border-2 border-white/5 flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <h3 className="font-comic-header text-xl text-white uppercase italic flex items-center gap-2">
                        <TerminalIcon className="w-5 h-5" /> Neural Synthesis
                    </h3>
                    {isLoading && <SpinnerIcon className="w-4 h-4 text-amber-500 animate-spin" />}
                </div>

                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <form onSubmit={handleGenerate} className="flex flex-col gap-3">
                        <textarea
                            value={logic}
                            onChange={e => setLogic(e.target.value)}
                            placeholder="Input logical blueprint..."
                            className="w-full h-32 bg-black/80 border-2 border-black rounded-xl p-3 text-xs text-amber-400 font-mono resize-none focus:outline-none focus:border-amber-600 transition-all shadow-inner"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit"
                            disabled={!logic.trim() || isLoading}
                            className="vista-button w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <SpinnerIcon className="w-4 h-4 animate-spin" />
                                    <span>CONDUCTING...</span>
                                </>
                            ) : (
                                <>
                                    <BuildIcon className="w-4 h-4" />
                                    <span>HARVEST LOGIC</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                        {isLoading && (
                            <div className="h-full flex flex-col items-center justify-center gap-4 py-10 animate-in fade-in duration-500">
                                <div className="relative">
                                    <SpinnerIcon className="w-12 h-12 text-amber-500 animate-spin" />
                                    <LogicIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white animate-pulse" />
                                </div>
                                <p className="text-[10px] font-black uppercase text-amber-500 tracking-[0.4em] animate-pulse text-center">
                                    Traversing Neural Manifold...<br/>
                                    <span className="text-[8px] text-gray-700 italic">"Unlimited thought in progress."</span>
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-950/20 border-2 border-red-600 rounded-xl flex items-center gap-3 animate-bounce">
                                <WarningIcon className="w-5 h-5 text-red-500" />
                                <p className="text-[10px] text-red-400 uppercase font-black">{error}</p>
                            </div>
                        )}

                        {generatedModule && !isLoading && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center gap-2 mb-3 text-green-500 text-[10px] font-black uppercase tracking-widest bg-green-950/20 p-2 rounded-lg border border-green-600/30">
                                    <CheckCircleIcon className="w-4 h-4" />
                                    <span>Logic Fragment Synthesized</span>
                                </div>
                                <ImplementationResult response={generatedModule} />
                            </div>
                        )}

                        {!isLoading && !error && !generatedModule && (
                            <div className="h-full flex flex-col items-center justify-center opacity-10">
                                <PackageIcon className="w-12 h-12 mb-2" />
                                <p className="text-[8px] font-black uppercase tracking-widest">Buffer Ready</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-red-950/10 border-2 border-red-900/30 rounded-2xl italic text-[10px] text-red-400/60 leading-relaxed text-center">
                "The React stream is a solo performance. Catch the logic shards before they hit the buffer limit."
            </div>
        </div>
      </div>

      <div className="p-4 bg-slate-900 border-t-8 border-black flex justify-between items-center z-30 px-10 shadow-inner">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-ping ${conductionStatus === 'SYNCED' ? 'bg-green-500' : 'bg-red-600'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${conductionStatus === 'SYNCED' ? 'text-green-500' : 'text-red-500'}`}>
                    STREAM: {conductionStatus}
                </span>
            </div>
            <span className="text-[9px] text-gray-700 font-mono tracking-widest uppercase">
                Stride: 1.2 PB/S | Latency: 0.02ms | Resolution: FORENSIC
            </span>
        </div>
        <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.3em] hidden sm:block">"One Conductor. Recursive Fall. Absolute Order."</p>
      </div>
    </div>
  );
};
