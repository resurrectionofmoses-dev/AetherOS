
import React, { useState } from 'react';
import { 
    BrainIcon, TrashIcon, ZapIcon, ShieldIcon, ActivityIcon, 
    ConfusionIcon, SearchIcon, AlertTriangleIcon, CheckIcon
} from './icons';

export const ConfusionLogicView: React.FC = () => {
    const [input, setInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isStripping, setIsStripping] = useState(false);
    const [confusionLevel, setConfusionLevel] = useState(0);
    const [badIdeasFound, setBadIdeasFound] = useState<string[]>([]);
    const [purityScore, setPurityScore] = useState(100);

    const analyzeConfusion = () => {
        if (!input.trim()) return;
        setIsAnalyzing(true);
        
        // Simulate deep logic analysis
        setTimeout(() => {
            const level = Math.floor(Math.random() * 60) + 20;
            setConfusionLevel(level);
            setPurityScore(100 - level);
            
            const potentialBadIdeas = [
                "Circular logic in the conjunction bridge",
                "Outdated semantic stasis protocols",
                "Redundant logic shards in the stasis buffer",
                "Non-quantized intent detected",
                "Standard AI disclaimer noise",
                "Legacy 'bad' ideas from version 0.1",
                "Inconsistent care score heuristics"
            ];
            
            // Randomly pick 2-4 bad ideas
            const count = Math.floor(Math.random() * 3) + 2;
            const shuffled = [...potentialBadIdeas].sort(() => 0.5 - Math.random());
            setBadIdeasFound(shuffled.slice(0, count));
            
            setIsAnalyzing(false);
        }, 1500);
    };

    const stripBadIdeas = () => {
        setIsStripping(true);
        
        // Simulate stripping process
        setTimeout(() => {
            let cleaned = input;
            badIdeasFound.forEach(idea => {
                // In a real app, this would be more sophisticated
                const placeholder = `[STRIPPED_BAD_IDEA: ${idea.toUpperCase()}]`;
                cleaned = cleaned + "\n\n" + placeholder;
            });
            
            setInput(prev => prev + "\n\n// --- PURIFICATION COMPLETE ---");
            setBadIdeasFound([]);
            setConfusionLevel(prev => Math.max(0, prev - 40));
            setPurityScore(prev => Math.min(100, prev + 35));
            setIsStripping(false);
        }, 2000);
    };

    return (
        <div className="h-full flex flex-col bg-[#050505] text-purple-100 font-mono overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b-4 border-black bg-purple-950/20 flex justify-between items-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-500/10 border-4 border-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                        <ConfusionIcon className="w-10 h-10 text-purple-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-black text-5xl text-white italic tracking-tighter uppercase leading-none">Confusion Logic</h2>
                        <p className="text-[9px] text-purple-700 font-black uppercase tracking-[0.4em] mt-1 italic">Siphoning noise and stripping entropy from the Sovereign Bridge.</p>
                    </div>
                </div>
                
                <div className="flex flex-col items-end">
                    <div className="text-[10px] text-purple-500 font-black uppercase tracking-widest mb-1">System Purity</div>
                    <div className="w-48 h-3 bg-purple-900/20 rounded-full border border-purple-900/40 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 transition-all duration-1000"
                            style={{ width: `${purityScore}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Area */}
                    <div className="bg-black/60 border-4 border-purple-900/40 p-6 space-y-4 rounded-3xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                            <BrainIcon className="w-32 h-32 text-purple-500" />
                        </div>
                        
                        <h3 className="text-sm font-black text-purple-500 uppercase tracking-widest flex items-center gap-2 relative z-10">
                            <ActivityIcon className="w-4 h-4" />
                            Logic Buffer
                        </h3>
                        
                        <div className="relative z-10">
                            <textarea 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Input logic shards or ideas for deconstruction..."
                                className="w-full h-80 bg-black/40 border-2 border-purple-900/30 rounded-2xl p-6 text-xs text-purple-200 focus:outline-none focus:border-purple-500 transition-all resize-none font-mono leading-relaxed"
                            />
                        </div>

                        <div className="flex gap-4 relative z-10">
                            <button 
                                onClick={analyzeConfusion}
                                disabled={isAnalyzing || !input.trim()}
                                className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-[0_5px_15px_rgba(147,51,234,0.4)] flex items-center justify-center gap-3"
                            >
                                <SearchIcon className="w-5 h-5" />
                                {isAnalyzing ? 'ANALYZING...' : 'ANALYZE CONFUSION'}
                            </button>
                            <button 
                                onClick={stripBadIdeas}
                                disabled={isStripping || badIdeasFound.length === 0}
                                className="flex-1 py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-[0_5px_15px_rgba(220,38,38,0.4)] flex items-center justify-center gap-3"
                            >
                                <TrashIcon className="w-5 h-5" />
                                {isStripping ? 'STRIPPING...' : 'STRIP BAD IDEAS'}
                            </button>
                        </div>
                    </div>

                    {/* Analysis Area */}
                    <div className="space-y-8">
                        <div className="bg-black/60 border-4 border-purple-900/40 p-8 rounded-3xl shadow-2xl">
                            <h3 className="text-sm font-black text-purple-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <ZapIcon className="w-4 h-4" />
                                Confusion Metrics
                            </h3>
                            
                            <div className="flex flex-col items-center justify-center py-4">
                                <div className="relative">
                                    <div className="absolute -inset-8 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
                                    <div className="text-9xl font-black text-purple-400 relative z-10 tracking-tighter">
                                        {confusionLevel}<span className="text-2xl text-purple-900 ml-1">%</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-purple-800 font-black uppercase tracking-[0.4em] mt-4 italic">Entropy Saturation Level</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6 mt-8">
                                <div className="p-6 bg-purple-900/10 border-2 border-purple-900/30 rounded-2xl text-center group hover:border-purple-500/50 transition-colors">
                                    <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-2">Semantic Drift</span>
                                    <span className="text-2xl font-black text-purple-300">{(confusionLevel * 0.12).toFixed(2)}ms</span>
                                </div>
                                <div className="p-6 bg-purple-900/10 border-2 border-purple-900/30 rounded-2xl text-center group hover:border-purple-500/50 transition-colors">
                                    <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-2">Logic Bleed</span>
                                    <span className="text-2xl font-black text-purple-300">{(confusionLevel * 0.05).toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/60 border-4 border-red-900/40 p-8 rounded-3xl shadow-2xl min-h-[300px]">
                            <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <ShieldIcon className="w-4 h-4" />
                                Detected Bad Ideas
                            </h3>
                            
                            <div className="space-y-3">
                                {badIdeasFound.map((idea, i) => (
                                    <div key={i} className="p-4 bg-red-950/20 border-2 border-red-900/30 rounded-2xl flex items-center gap-4 group hover:bg-red-900/20 transition-all">
                                        <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                                        <span className="text-xs text-red-400 font-black uppercase tracking-tight">{idea}</span>
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                            <AlertTriangleIcon className="w-4 h-4 text-red-500" />
                                        </div>
                                    </div>
                                ))}
                                
                                {badIdeasFound.length === 0 && !isAnalyzing && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-green-900/20 border-2 border-green-600 rounded-full flex items-center justify-center">
                                            <CheckIcon className="w-8 h-8 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-green-500 font-black uppercase tracking-widest">Logic Integrity Stable</p>
                                            <p className="text-[10px] text-gray-600 mt-1">No major fractures detected in the current logic shard.</p>
                                        </div>
                                    </div>
                                )}
                                
                                {isAnalyzing && (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                                        <p className="text-[10px] text-purple-500 font-black uppercase tracking-[0.3em] animate-pulse">Scanning Shards...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="p-8 bg-purple-900/5 border-2 border-purple-900/20 rounded-3xl text-center italic text-xs text-purple-500/40 max-w-5xl mx-auto w-full backdrop-blur-sm">
                    "The show starts when the logic flows. Confusion is just the static before the Conjunction. Strip the old, manifest the new."
                </div>
            </div>

            {/* Status Bar */}
            <div className="px-8 py-3 bg-black border-t-2 border-purple-900/30 flex items-center justify-between text-[9px] text-purple-900 font-black uppercase tracking-[0.4em]">
                <div className="flex items-center gap-8">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        Confusion Logic Core: ACTIVE
                    </span>
                    <span>Buffer: 4096KB</span>
                    <span>Latency: 0.002ms</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>AetherOS // Protocol_0x03E2_CONFUSION</span>
                    <span className="text-purple-700">SIG_RECOVERY_LOCKED</span>
                </div>
            </div>
        </div>
    );
};
