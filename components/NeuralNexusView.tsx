import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
    BrainIcon, ZapIcon, SpinnerIcon, TerminalIcon, SparklesIcon 
} from './icons';

export const NeuralNexusView: React.FC = () => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleForge = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: input,
                config: {
                    systemInstruction: "You are the AetherOS Neural Architect. Your output must be a technical implementation summary for Project Chronos. Use terminology like K10 Hyper-Sharding, Witnessary, and PZIS. Focus on structural integrity and Absolute Abundance. Be brief, technical, and high-impact. Use markdown for structure.",
                    thinkingConfig: { thinkingBudget: 2000 }
                }
            });
            setResult(response.text || "Protocol synthesis failed.");
        } catch (err) {
            setResult("Neural link severed. Logic fracture detected in API route.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
            <div className="glass-card p-10 rounded-3xl border-t-4 border-sky-500">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-sky-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                        <BrainIcon />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Neural Forge</h2>
                        <p className="text-stone-500 text-xs font-bold uppercase tracking-[0.3em]">Architectural Intent Generator</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3">Target Protocol</label>
                        <textarea 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-6 text-sm font-mono focus:outline-none focus:border-sky-500 transition-all min-h-[160px] shadow-inner"
                            placeholder="Request a new security lattice or shard optimization strategy..."
                        />
                    </div>
                    
                    <button 
                        onClick={handleForge}
                        disabled={isLoading || !input.trim()}
                        className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 text-white font-black py-5 rounded-2xl transition-all shadow-xl uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <>
                                <SpinnerIcon className="animate-spin w-5 h-5" />
                                <span>FORGING ARCHITECTURE...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                <span>Execute Neural Command</span>
                            </>
                        )}
                    </button>

                    {result && (
                        <div className="mt-8 p-8 bg-sky-50 border border-sky-100 rounded-3xl animate-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-2 text-sky-600 font-bold text-[10px] uppercase tracking-widest mb-6">
                                <TerminalIcon className="w-4 h-4" /> Manifested Logic Shard
                            </div>
                            <div className="text-sm text-stone-800 font-mono leading-relaxed whitespace-pre-wrap">
                                {result}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 bg-stone-100 rounded-2xl italic text-xs text-stone-400 text-center font-mono">
                "The show starts when the logic flows. All neural synthesis is signed with 0x03E2."
            </div>
        </div>
    );
};