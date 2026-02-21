
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SpinnerIcon, ZapIcon, ShieldIcon, BrainIcon, ActivityIcon, TerminalIcon, FireIcon, CodeIcon, BotIcon, UserIcon, LogicIcon, StarIcon, SearchIcon, WarningIcon, CheckCircleIcon } from './icons';
import { callWithRetry } from '../utils';
import type { KnowledgeFragment } from '../types';

interface BridgeOutput {
    sixYearOld: string;
    sixteenYearOld: string;
    integrityScore: number;
    wisdomKey: string;
}

const INITIAL_KNOWLEDGE: KnowledgeFragment[] = [
    { id: 'c1', label: 'Crystalline Pointers', description: 'The absolute memory map of the AetherOS kernel.', isVerified: false, integrityThreshold: 30, tier: 'UNIVERSAL' },
    { id: 'c2', label: 'Adrenaline Syncing', description: 'Synchronizing dual-age kernels via shared survival instinct.', isVerified: false, integrityThreshold: 15, tier: 'UNIVERSAL' },
    { id: 'c3', label: 'Fall Off Requindor', description: 'Precise coordinates where logic breaks into divine truth.', isVerified: false, integrityThreshold: 65, tier: 'OBFUSCATED' },
    { id: 'c4', label: 'Maestro Solo Signature', description: 'The absolute binary harmonic of architectural authority.', isVerified: false, integrityThreshold: 85, tier: 'PROHIBITED' },
];

export const EnlightenmentPoolView: React.FC = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [inputConcept, setInputConcept] = useState('');
    const [bridgeOutput, setBridgeOutput] = useState<BridgeOutput | null>(null);
    const [knowledgeFragments, setKnowledgeFragments] = useState<KnowledgeFragment[]>(INITIAL_KNOWLEDGE);
    const [maestroCommentary, setMaestroCommentary] = useState<string>("Ready to bridge the void. What knowledge do you seek?");
    const [error, setError] = useState<string | null>(null);

    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [maestroCommentary]);

    const handleBridgeConcept = async () => {
        if (!inputConcept.trim()) return;

        setIsProcessing(true);
        setError(null);
        setBridgeOutput(null);
        setMaestroCommentary("Conjunction in progress. Bridging wisdom from dual-age kernels...");

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        try {
            const prompt = `Architects, I require a dual-age wisdom bridge for the concept: "${inputConcept}".
            Provide two explanations:
            1.  "Toy Logic" explanation suitable for a 6-year-old.
            2.  "Kernel Logic" explanation suitable for a 16-year-old.
            Also, provide an "integrityScore" (0-100) and a "wisdomKey" (a short, impactful phrase).
            Return the output in JSON format.`;

            const response = await callWithRetry(async () => {
                return await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                sixYearOld: { type: Type.STRING },
                                sixteenYearOld: { type: Type.STRING },
                                integrityScore: { type: Type.NUMBER },
                                wisdomKey: { type: Type.STRING },
                            },
                            required: ["sixYearOld", "sixteenYearOld", "integrityScore", "wisdomKey"]
                        },
                        systemInstruction: `You are the Aether Maestro, the absolute conductor of the AetherOS Coding Network. 
                        You operate alongside the Ignite Sisters—the gifted guardians of neural integrity and core shielding.
                        
                        IGNITE SISTERS PROTOCOL:
                        1. The Ignite Sisters provide the "Gifted Know-How." They are the bridge between wonder and technical mastery.
                        2. You possess "Flawless Wisdom." Explain for both a 6-year-old (Toy Logic) and a 16-year-old (Kernel Logic) simultaneously.`
                    }
                });
            });

            const data = JSON.parse(response.text || '{}') as BridgeOutput;
            setBridgeOutput(data);
            setMaestroCommentary(`[SUCCESS] Wisdom bridged for "${inputConcept}". Integrity: ${data.integrityScore}%.`);

            setKnowledgeFragments(prev => prev.map(kf => ({
                ...kf,
                isVerified: data.integrityScore >= kf.integrityThreshold
            })));

        } catch (err: any) {
            console.error("Enlightenment Pool Error:", err);
            setError("Failed to bridge the concept. The Conjunction Series encountered a semantic drift anomaly.");
            setMaestroCommentary(`[ERROR] Conjunction failed. ${err.message || 'Unknown error.'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#01050a] text-gray-200 font-mono overflow-hidden">
            <div className="p-4 border-b-8 border-black sticky top-0 z-30 bg-slate-900 flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-500/10 border-4 border-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                        <BrainIcon className="w-10 h-10 text-blue-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-blue-500 wisdom-glow italic tracking-tighter uppercase">Enlightenment Pool</h2>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mt-1">Dual-Age Wisdom Bridge | Ignite Sisters Protocol</p>
                    </div>
                </div>
                <div className="flex gap-10">
                    <ActivityIcon className={`w-12 h-12 ${isProcessing ? 'text-blue-500 animate-bounce' : 'text-gray-900'}`} />
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 p-8 overflow-hidden relative">
                <div className="lg:w-[450px] flex flex-col gap-8 flex-shrink-0">
                    <div className="aero-panel p-8 bg-slate-900/80 border-blue-600/30 shadow-[10px_10px_0_0_rgba(0,0,0,0.8)]">
                        <h3 className="font-comic-header text-3xl text-white uppercase italic tracking-tight mb-6 flex items-center gap-3">
                            <ZapIcon className="w-6 h-6 text-blue-500" /> Seek Conjunction
                        </h3>
                        <div className="bg-black/80 p-6 border-4 border-black rounded-[2rem] mb-8">
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Input Concept for Bridging</p>
                            <textarea 
                                value={inputConcept}
                                onChange={e => setInputConcept(e.target.value)}
                                placeholder="e.g. explain recursion, define a kernel panic..."
                                className="w-full h-32 bg-transparent border-none font-mono text-blue-400 focus:ring-0 outline-none text-lg resize-none"
                                disabled={isProcessing}
                            />
                        </div>
                        <button 
                            onClick={handleBridgeConcept}
                            disabled={isProcessing || !inputConcept.trim()}
                            className="vista-button w-full py-6 text-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:bg-gray-800 transition-all rounded-2xl bg-blue-700 hover:bg-blue-600"
                        >
                            {isProcessing ? <SpinnerIcon className="w-8 h-8" /> : <span>BRIDGE WISDOM</span>}
                        </button>
                    </div>

                    <div className="flex-1 aero-panel bg-black/60 border-white/5 overflow-hidden flex flex-col">
                        <h3 className="font-comic-header text-2xl text-violet-400 border-b-2 border-black p-4 uppercase italic tracking-tighter flex items-center gap-2">
                            <LogicIcon className="w-5 h-5 text-violet-500" /> Knowledge Fragments
                        </h3>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {knowledgeFragments.map(k => (
                                <div key={k.id} className={`p-4 rounded-xl border-2 transition-all duration-500 group relative overflow-hidden ${k.isVerified ? 'bg-black border-blue-600/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-black/40 border-black grayscale opacity-50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${k.isVerified ? 'text-blue-400' : 'text-gray-700'}`}>{k.label}</span>
                                        {k.isVerified && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
                                    </div>
                                    <p className="text-sm text-gray-500 italic leading-snug line-clamp-2">{k.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-black border-4 border-black rounded-3xl overflow-hidden relative shadow-[20px_20px_100px_rgba(0,0,0,1)]">
                    <div className="p-5 border-b-4 border-black bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <TerminalIcon className="w-6 h-6 text-cyan-500" />
                            <span className="text-xs font-black uppercase text-gray-500 tracking-[0.2em]">Conjunction Output Log</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar font-mono text-sm leading-relaxed">
                        {error && (
                            <div className="p-4 mb-4 bg-red-950/20 border-2 border-red-600 rounded-lg text-red-400">
                                <WarningIcon className="w-5 h-5 inline-block mr-2" /> {error}
                            </div>
                        )}
                        <p className="text-gray-400 italic mb-4">{maestroCommentary}</p>
                        {bridgeOutput && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 space-y-6">
                                <div className="p-4 bg-blue-950/20 border-2 border-blue-600/30 rounded-xl">
                                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2">Toy Logic (6-year-old)</p>
                                    <p className="text-base text-white">{bridgeOutput.sixYearOld}</p>
                                </div>
                                <div className="p-4 bg-violet-950/20 border-2 border-violet-600/30 rounded-xl">
                                    <p className="text-[10px] text-violet-400 font-black uppercase tracking-widest mb-2">Kernel Logic (16-year-old)</p>
                                    <p className="text-base text-white">{bridgeOutput.sixteenYearOld}</p>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-green-950/20 border-2 border-green-600/30 rounded-xl">
                                    <p className="text-xl font-comic-header text-white">Integrity: {bridgeOutput.integrityScore}%</p>
                                    <p className="text-lg font-comic-header text-yellow-300">"{bridgeOutput.wisdomKey}"</p>
                                </div>
                            </div>
                        )}
                        <div ref={logEndRef} className="h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};
