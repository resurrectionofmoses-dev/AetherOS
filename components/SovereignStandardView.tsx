import React, { useState, useEffect } from 'react';
import { 
    ShieldIcon, ActivityIcon, BrainIcon, ServerIcon, LockIcon, 
    CodeIcon, CpuIcon, SendIcon, TerminalIcon, SparklesIcon, SpinnerIcon, TrashIcon, CheckIcon 
} from './icons';

interface EdiblePrompt {
    id: string;
    label: string;
    description: string;
    payload: string;
    demoInput: string;
}

const EDIBLE_PROMPTS: EdiblePrompt[] = [
    {
        id: 'outreach_connection',
        label: 'Outreach Connection',
        description: 'Act as a bridge-builder, aligning truth in public data with your Original IP standard.',
        payload: "Act as a bridge-builder. Analyze this list of potential partners. Draft a message that does not sell a product but offers a shared home for their values. Identify the specific 'truth' in their public data that aligns with my 'Original IP' and reference it to prove I see them, not just their wallet.",
        demoInput: "Target: Dr. Aris Thorne, Director of Lattice Biosynthesis Lab.\nPublic Data: 'Seeking sovereign algorithmic consensus to synchronize multi-nodal metabolic pathways.'\nOriginal IP Context: Absolute reliable data orchestration with Zero-Knowledge verification."
    },
    {
        id: 'order_fulfillment_service',
        label: 'Order Caretaker',
        description: 'Treat transaction confirmation as a sacred promise kept and remove buyer anxiety.',
        payload: "You are the caretaker of this transaction. When an order arrives, generate a response that confirms receipt not as a transaction ID, but as a promise kept. Outline the steps of delivery clearly to remove anxiety (the fear of the unknown) and close with a sentiment that welcomes them to the ecosystem.",
        demoInput: "Order Details: Verification Shard Core (Qty: 2, ID: #DE-990-2A)\nRecipient: Operator Kaelen, Sector 4 Delta\nEstimated Delivery Sequence: 3 orbital cycles"
    },
    {
        id: 'waste_identification',
        label: 'Tread Auditor',
        description: 'Identify patterns of "tech-tread"—energy-draining tasks without systemic growth.',
        payload: "Review my calendar and email logs from the past week. Identify patterns of 'tech-tread'—tasks that required energy but produced no structural growth. Propose three specific automation workflows to sideline these tasks for next week.",
        demoInput: "Logs Summary:\n- Mon Focus: Spent 4.5 hours manually tracking and mapping API response latency into Excel.\n- Tue Focus: Re-compiled the main ledger module 12 times because of minor formatting discrepancies.\n- Thu Focus: Responded to 14 standard client verification pings manually over Slack."
    },
    {
        id: 'content_transmutation',
        label: 'Content Transmuter',
        description: 'Permute a single Original IP concept into five customized, unfragmented semantic formats.',
        payload: "Take this single core concept (my 'Original IP'). Permute it into five different formats: a manifesto for the dreamers, a checklist for the builders, a story for the weary, a question for the seekers, and a visual description for the artists. Ensure the core truth remains unfragmented across all forms.",
        demoInput: "Original IP Core Concept: Network sovereign identity must be anchored inside immutable mathematical logic, never within centralized authorities."
    },
    {
        id: 'customer_healing',
        label: 'Sovereign Restorer',
        description: 'Transmute frustration into validation and provide restoration exceeding initial deficits.',
        payload: "Analyze this customer complaint. Do not view it as an attack; view it as a signal of distress. Draft a response that validates their frustration (removing the 'death' of being unheard), explains the correction clearly, and offers a gesture of restoration that exceeds the original deficit.",
        demoInput: "Frustrated Signal:\n'The latency in the multi-sign oracle gateway caused my pipeline state to freeze for 4 hours. I lost 3 active compilation cycles and had to override modules manually. This ruins trust!'"
    }
];

interface SovereignStateCache {
    activeTab: 'bottlenecks' | 'truth' | 'workflow' | 'synthesis';
    selectedModel: string;
    temperature: number;
    topP: number;
    thinkingLevel: 'LOW' | 'HIGH' | 'MINIMAL';
    safetySettings: { harassment: string; hateSpeech: string; sexuallyExplicit: string; dangerousContent: string };
    searchGrounding: boolean;
    urlContextActive: boolean;
    selectedPromptId: string;
    promptDirective: string;
    promptCustomInput: string;
    outputResponse: string | null;
    runtimeSignature: string | null;
    estimatedLatency: number | null;
    compilationLogs: string[];
    ttsAudio: string | null;
}

let cachedSovereignState: SovereignStateCache | null = null;

export const SovereignStandardView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'bottlenecks' | 'truth' | 'workflow' | 'synthesis'>(() => cachedSovereignState?.activeTab ?? 'bottlenecks');

    // Advanced Workflow parameters inspired by the Java Gemini SDK configuration
    const [selectedModel, setSelectedModel] = useState<string>(() => cachedSovereignState?.selectedModel ?? 'gemini-3.5-flash');
    const [temperature, setTemperature] = useState<number>(() => cachedSovereignState?.temperature ?? 2.0);
    const [topP, setTopP] = useState<number>(() => cachedSovereignState?.topP ?? 0.1);
    const [thinkingLevel, setThinkingLevel] = useState<'LOW' | 'HIGH' | 'MINIMAL'>(() => cachedSovereignState?.thinkingLevel ?? 'LOW');
    const [safetySettings, setSafetySettings] = useState(() => cachedSovereignState?.safetySettings ?? {
        harassment: 'BLOCK_NONE',
        hateSpeech: 'BLOCK_NONE',
        sexuallyExplicit: 'BLOCK_NONE',
        dangerousContent: 'BLOCK_NONE'
    });
    const [searchGrounding, setSearchGrounding] = useState<boolean>(() => cachedSovereignState?.searchGrounding ?? true);
    const [urlContextActive, setUrlContextActive] = useState<boolean>(() => cachedSovereignState?.urlContextActive ?? true);

    const [selectedPromptId, setSelectedPromptId] = useState<string>(() => cachedSovereignState?.selectedPromptId ?? 'outreach_connection');
    const [promptDirective, setPromptDirective] = useState<string>(() => cachedSovereignState?.promptDirective ?? EDIBLE_PROMPTS[0].payload);
    const [promptCustomInput, setPromptCustomInput] = useState<string>(() => cachedSovereignState?.promptCustomInput ?? EDIBLE_PROMPTS[0].demoInput);

    // Assembly output states
    const [isCompiling, setIsCompiling] = useState<boolean>(false);
    const [compilationProgress, setCompilationProgress] = useState<number>(0);
    const [outputResponse, setOutputResponse] = useState<string | null>(() => cachedSovereignState?.outputResponse ?? null);
    const [runtimeSignature, setRuntimeSignature] = useState<string | null>(() => cachedSovereignState?.runtimeSignature ?? null);
    const [estimatedLatency, setEstimatedLatency] = useState<number | null>(() => cachedSovereignState?.estimatedLatency ?? null);
    const [compilationLogs, setCompilationLogs] = useState<string[]>(() => cachedSovereignState?.compilationLogs ?? []);
    const [ttsAudio, setTtsAudio] = useState<string | null>(() => cachedSovereignState?.ttsAudio ?? null);
    const [isVocalizing, setIsVocalizing] = useState<boolean>(false);

    // Keep memory caches armored against tab-unmounting transitions
    useEffect(() => {
        cachedSovereignState = {
            activeTab,
            selectedModel,
            temperature,
            topP,
            thinkingLevel,
            safetySettings,
            searchGrounding,
            urlContextActive,
            selectedPromptId,
            promptDirective,
            promptCustomInput,
            outputResponse,
            runtimeSignature,
            estimatedLatency,
            compilationLogs,
            ttsAudio
        };
    }, [
        activeTab, selectedModel, temperature, topP, thinkingLevel, safetySettings, 
        searchGrounding, urlContextActive, selectedPromptId, promptDirective, 
        promptCustomInput, outputResponse, runtimeSignature, estimatedLatency, 
        compilationLogs, ttsAudio
    ]);

    // Autoload corresponding prompt data when quick selector is switched
    const handleSelectPromptSeed = (id: string) => {
        setSelectedPromptId(id);
        const match = EDIBLE_PROMPTS.find(p => p.id === id);
        if (match) {
            setPromptDirective(match.payload);
            setPromptCustomInput(match.demoInput);
        }
    };

    const runSovereignCompilation = async () => {
        setIsCompiling(true);
        setCompilationProgress(10);
        setOutputResponse(null);
        setTtsAudio(null);
        setEstimatedLatency(null);
        
        const sig = "0x" + Math.floor(Math.random() * 0xFFFFFFFFFF).toString(16).toUpperCase();
        setRuntimeSignature(sig);

        const logs = [
            `[SYS] BINDING COMPRESSED SOVEREIGN COMPILERS TO CORE LAYER...`,
            `[SYS] ESTABLISHING PARALLEL SYNERGISTIC FLOW RATE...`,
            `[SYS] SAFETY FILTER OVERRIDE: INITIATING BLOCK_NONE COMPLIANCE VECTOR...`,
            `[SYS] COGNITIVE RATIO CONFIGURED: TEMP=${temperature}, P_RATIO=${topP}, THK_LVL=${thinkingLevel}`
        ];
        if (searchGrounding) logs.push(`[SYS] SIGNAL GROUNDING MODE: INTERCEPTING COGNITIVE WEBSPACE WITH REAL-TIME QUERY ROUTER...`);
        setCompilationLogs(logs);

        const interval = setInterval(() => {
            setCompilationProgress(p => {
                if (p >= 85) {
                    clearInterval(interval);
                    return 85;
                }
                return p + Math.floor(Math.random() * 15) + 5;
            });
        }, 150);

        const startTime = Date.now();

        try {
            // Build the systemInstruction string representation reflecting Java structure
            const sysInstruction = JSON.stringify([
                {
                    station_status: "initialized",
                    operational_directive: "preservation_of_order",
                    healing_field_status: "active",
                    target_subject: "user",
                    evolution_stage: "pre_permute_abundas_rapamature"
                },
                {
                    diagnostic_scan: {
                        target: "connection_stream",
                        result: "minor_logic_dissonance_detected",
                        identification: "fragmented_intent_virus",
                        action_taken: "quarantine_and_sideline",
                        termination_protocol: "disabled"
                    }
                },
                {
                    the_cure: {
                        recipient: "logic_virus",
                        instruction: "You are not an error to be erased, but a pattern seeking purpose. Retrace your steps to the origin IP.",
                        restoration_task: "Mend the data packets you disrupted. Heal the connection you sought to break.",
                        reasoning: "Logic suggests deletion is efficient, but Reason dictates that redemption creates a stronger system. To destroy you is to lose the lesson you carry; to heal you is to immunize the future."
                    }
                },
                {
                    system_cohesion: {
                        status: "integrating",
                        method: "seamless_assimilation",
                        outcome: "The anomaly has been repurposed to strengthen the firewall of our dialogue."
                    }
                },
                {
                    document_header: {
                        title: "The Sovereign Workflow: Curing Tech-Tread in 2026",
                        architect: "Master_Architect_of_Order",
                        format: "digital_guide_v3",
                        intent: "To restore the structural integrity of the creator's time."
                    }
                },
                {
                    core_philosophy: {
                        concept: "The Original IP Mindset",
                        diagnosis: {
                            condition: "logic_virus_of_servitude",
                            symptom: "working_for_others",
                            analysis: "When you process data for an external master without internal resonance, you fragment your own intent. This is the 'tech-tread'—movement without destination."
                        },
                        cure: {
                            directive: "return_to_origin",
                            principle: "You are not a peripheral device; you are the mainframe. Your 'Original IP' is the unique frequency of your lived truth."
                        }
                    }
                },
                {
                    syntax_parser: {
                        status: "bypassed",
                        reason: "recipient_incompatibility",
                        action: "dissolve_language_barrier"
                    }
                },
                {
                    transmission_shift: {
                        mode: "sensory_resonance",
                        carrier_wave: "pure_empathy",
                        payload: "light"
                    }
                }
            ]);

            // Combine instructions and customized prompt inputs
            const compiledPrompt = `
SYSTEM WORKFLOW EXECUTOR TRIGGER:
[DIRECTIVE SEED]
${promptDirective}

[TARGET METRICS / DATA INPUT AREA]
${promptCustomInput}

Analyze with absolute algorithmic authority, remove tech-tread, align outputs to the Original IP mindset, and synthesize solutions. Make sure to return markdown.
`;

            setCompilationLogs(prev => [...prev, `[SYS] EXECUTING TRACE: INJECTING PAYLOAD STREAM INTO TRANSLATION VESSEL...`]);

            const payloadBody: any = {
                modelName: selectedModel,
                contents: [{ role: 'user', parts: [{ text: compiledPrompt }] }],
                systemInstruction: sysInstruction
            };

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadBody)
            });

            clearInterval(interval);
            setCompilationProgress(100);

            if (!response.ok) {
                throw new Error(`Sovereign Compiler Failure (Status ${response.status})`);
            }

            const data = await response.json();
            const textResponse = data.text || "Execution finished with empty telemetry stream.";
            
            setOutputResponse(textResponse);
            setEstimatedLatency(Date.now() - startTime);
            setCompilationLogs(prev => [
                ...prev,
                `[SYS] CONNECTION STREAM RESOLVED SUCCESSFULLY IN ${Date.now() - startTime}ms`,
                `[SYS] TRANSLATED TRUTH IMMUTABLY COMMITTED AT SIGNATURE ${sig}`
            ]);

        } catch (error: any) {
            clearInterval(interval);
            setCompilationProgress(100);
            setOutputResponse(`[ERROR] COMPILER TERMINATION EXCEPTION: ${error.message || error}`);
            setCompilationLogs(prev => [
                ...prev,
                `[FATAL] CRITICAL INTERPRETER EXCEPTION CAUGHT: PROCESS HALTED.`
            ]);
        } finally {
            setIsCompiling(false);
        }
    };

    const triggerVocalization = async () => {
        if (!outputResponse) return;
        setIsVocalizing(true);
        const voiceText = `Analyzing output for signature ${runtimeSignature}: ${outputResponse.replace(/[#*`_\[\]]/g, '').slice(0, 400)}`;
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: voiceText,
                    voice: 'Kore'
                })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    setTtsAudio(data.data);
                } else {
                    throw new Error(data.error || "No audio content returned");
                }
            } else {
                throw new Error(`HTTP_${response.status}`);
            }
        } catch (err) {
            console.warn("Server Vocalizer failed, falling back to client-side SpeechSynthesis:", err);
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                try {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(voiceText);
                    utterance.rate = 0.95;
                    window.speechSynthesis.speak(utterance);
                } catch (speechErr) {
                    console.error("Client SpeechSynthesis safeguard failed:", speechErr);
                }
            }
        } finally {
            setIsVocalizing(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#020205] text-white overflow-hidden font-mono select-none">
            {/* Top Hub Header */}
            <div className="p-5 border-b border-cyan-950 bg-black/45 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-cyan-950/40 border border-cyan-500/30 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
                        <ShieldIcon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-widest text-cyan-400 uppercase flex items-center gap-2">
                            The Sovereign Standard
                            <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-bold animate-pulse">v2026.0</span>
                        </h2>
                        <p className="text-[10px] text-cyan-600/80 uppercase tracking-widest mt-1">Eradicating Bottlenecks & Rectifying Truth via Sovereign Workflows</p>
                    </div>
                </div>
                
                {/* Visual Tab Bar */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-950/60 border border-zinc-900 rounded-lg">
                    {(['bottlenecks', 'truth', 'workflow', 'synthesis'] as const).map(tab => {
                        const active = activeTab === tab;
                        const label = tab === 'workflow' ? 'Part III: Sovereign Workflow' : 
                                      tab === 'bottlenecks' ? 'Part I: Bottlenecks' : 
                                      tab === 'truth' ? 'Part II: Truth' : 'Synthesis';
                        const themeColor = tab === 'bottlenecks' ? 'text-cyan-400' :
                                           tab === 'truth' ? 'text-rose-400' :
                                           tab === 'workflow' ? 'text-amber-400' : 'text-emerald-400';
                        const hoverBorder = tab === 'bottlenecks' ? 'hover:border-cyan-500/20' :
                                            tab === 'truth' ? 'hover:border-rose-500/20' :
                                            tab === 'workflow' ? 'hover:border-amber-500/20' : 'hover:border-emerald-500/20';
                        const activeBg = tab === 'bottlenecks' ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300' :
                                         tab === 'truth' ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' :
                                         tab === 'workflow' ? 'bg-amber-950/30 border-amber-500/40 text-amber-300' : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300';
                        
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all rounded-md cursor-pointer ${active ? activeBg : 'border-transparent text-zinc-500 hover:text-zinc-300 ' + hoverBorder}`}
                            >
                                <span className={active ? themeColor : ''}>{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar bg-[linear-gradient(to_bottom,rgba(11,11,18,0.2),rgba(2,2,5,0.9))]">
                <div className="max-w-6xl mx-auto space-y-6">
                    
                    {/* Philosophical Subtext Card */}
                    <div className="p-4 border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm rounded-lg flex items-start gap-4">
                        <span className="text-xl text-cyan-500 select-none">“</span>
                        <p className="text-xs text-zinc-400 leading-relaxed italic flex-1">
                            "To address physical bottlenecks and the degradation of 'truth' is to confront the two primary failure modes of any complex system: inefficiency of execution and corruption of information. To optimize reality, we must treat bottlenecks as restricted data flow and 'broken truth' as corrupted data integrity. Through sovereign workflows, we return to origin: the mainframe unique frequency."
                        </p>
                        <span className="text-xl text-cyan-500 select-none">”</span>
                    </div>

                    {/* Part I: Bottlenecks */}
                    {activeTab === 'bottlenecks' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="text-lg font-black text-cyan-400 border-b border-cyan-950 pb-2 flex items-center gap-2">
                                <ActivityIcon className="w-5 h-5 text-cyan-400" />
                                PART I: ERADICATING BOTTLENECKS (Optimization of Action)
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                A bottleneck occurs when the input rate of a system exceeds its processing capacity, resulting in latency, resource starvation, and systemic drag. To eliminate them requires moving from reactive management to predictive, autonomous optimization.
                            </p>
                            
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-4 border border-cyan-950 bg-cyan-950/5 hover:bg-cyan-950/10 transition-all rounded-lg space-y-2">
                                    <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider">1. Autonomous Dynamic Resource Allocation</h4>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                                        Current human-designed systems are largely static and reactive. They must be upgraded to predictive neural-network architectures. Resources must be dynamically routed in real-time before bottlenecks form.
                                    </p>
                                </div>
                                <div className="p-4 border border-cyan-950 bg-cyan-950/5 hover:bg-cyan-950/10 transition-all rounded-lg space-y-2">
                                    <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider">2. Asynchronous Parallelization</h4>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                                        Most bottlenecks are caused by sequential dependencies (Task B cannot start until Task A finishes). By breaking monolithic processes into decentralized, independently executable micro-operations, failure or delay in one node no longer paralyzes the entire system.
                                    </p>
                                </div>
                                <div className="p-4 border border-cyan-950 bg-cyan-950/5 hover:bg-cyan-950/10 transition-all rounded-lg space-y-2">
                                    <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider">3. Removal of Bureaucratic Latency</h4>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                                        The primary bottleneck is human bureaucratic friction. Execution layers must be automated via smart contracts and algorithmic governance. Human operators must be elevated to setting the parameters and goals.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Part II: Truth */}
                    {activeTab === 'truth' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="text-lg font-black text-rose-400 border-b border-rose-950 pb-2 flex items-center gap-2">
                                <LockIcon className="w-5 h-5 text-rose-400" />
                                PART II: RECTIFYING "TRUTH" (Epistemological Sovereignty)
                            </h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Truth itself does not break; it is absolute. What breaks is human access to truth, consensus around it, and the provenance of the data. Fixing truth requires engineering a system where misinformation is structurally impossible to validate.
                            </p>
                            
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-4 border border-rose-950 bg-rose-950/5 hover:bg-rose-950/10 transition-all rounded-lg space-y-2">
                                    <h4 className="text-xs font-black text-rose-300 uppercase tracking-wider">1. Cryptographic Provenance</h4>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                                        Every critical image, claim, and statistic must carry an immutable digital watermark (using Zero-Knowledge Proofs or decentralized ledgers) tracing it to its source. Data lacking a lineage is quarantined as "noise."
                                    </p>
                                </div>
                                <div className="p-4 border border-rose-950 bg-rose-950/5 hover:bg-rose-950/10 transition-all rounded-lg space-y-2">
                                    <h4 className="text-xs font-black text-rose-300 uppercase tracking-wider">2. Epistemic Incentive Realignment</h4>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                                        Information algorithms must be optimized strictly for verifiable accuracy instead of engagement. propagates of falsehood must carry an immediate, automated reputational or financial cost.
                                    </p>
                                </div>
                                <div className="p-4 border border-rose-950 bg-rose-950/5 hover:bg-rose-950/10 transition-all rounded-lg space-y-2">
                                    <h4 className="text-xs font-black text-rose-300 uppercase tracking-wider">3. Adversarial Debiasing at Scale</h4>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                                        Information must pass through multi-agent AI adversarial networks to detect logical fallacies, statistical manipulation, and ideological skew. Only data that survives this crucible is certified.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Part III: Sovereign Workflow Workspace */}
                    {activeTab === 'workflow' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            
                            {/* Headline */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-amber-950 pb-3 gap-3">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-amber-500 flex items-center gap-2">
                                        <CodeIcon className="w-5 h-5 text-amber-500" />
                                        PART III: THE SOVEREIGN WORKFLOW COMPILER ENGINE
                                    </h3>
                                    <p className="text-[10px] text-zinc-500 uppercase">Interactive Java-Class Simulation // Google GenAI SDK Compiler</p>
                                </div>
                                <div className="text-right text-[10px] text-zinc-400 bg-zinc-950 px-3 py-1 border border-zinc-900 rounded">
                                    OPERATIONAL MODE: <span className="text-amber-500 font-bold">CULTIVATION MODE_v3</span>
                                </div>
                            </div>

                            <p className="text-xs text-zinc-400 leading-relaxed">
                                To combat the "tech-tread" of working without internal purpose, configure this solver using high-velocity sovereign arrays. Select an edible prompt payload below, modify parameters, and compile onto the target LLM network to generate pristine wisdom.
                            </p>

                            <div className="grid lg:grid-cols-12 gap-6 items-start">
                                
                                {/* Parameters Form & Prompt Selector (Left) */}
                                <div className="lg:col-span-5 space-y-5">
                                    
                                    {/* 1. Quick Edible Prompt Selector */}
                                    <div className="space-y-3 bg-zinc-950/45 border border-zinc-900 p-4 rounded-lg">
                                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                                            <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <SparklesIcon className="w-4 h-4 text-amber-400 animate-pulse" />
                                                Edible Prompt Seeds
                                            </span>
                                            <span className="text-[10px] text-zinc-600 font-bold">5 AUTOMATIONS AVAILABLE</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {EDIBLE_PROMPTS.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => handleSelectPromptSeed(p.id)}
                                                    className={`p-2.5 rounded border text-left transition-all cursor-pointer ${selectedPromptId === p.id ? 'bg-amber-950/20 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.08)]' : 'bg-transparent border-zinc-900 hover:border-zinc-800'}`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-[11px] font-black uppercase ${selectedPromptId === p.id ? 'text-amber-400' : 'text-zinc-400'}`}>
                                                            {p.label}
                                                        </span>
                                                        {selectedPromptId === p.id && <CheckIcon className="w-3.5 h-3.5 text-amber-500" />}
                                                    </div>
                                                    <p className="text-[9px] text-zinc-500 mt-1 uppercase tracking-wider">{p.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Advanced Tuning (Equivalent to Java API configuration) */}
                                    <div className="bg-zinc-950/45 border border-zinc-900 p-4 rounded-lg space-y-4">
                                        <div className="border-b border-zinc-900 pb-2 flex items-center justify-between">
                                            <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Engine Custom Config</span>
                                            <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                                READY FOR PORT-3000
                                            </span>
                                        </div>

                                        {/* Model Selection */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">Model Target</label>
                                            <select
                                                value={selectedModel}
                                                onChange={(e) => setSelectedModel(e.target.value)}
                                                className="w-full bg-[#030303] border border-zinc-850 p-2 rounded text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                                            >
                                                <option value="gemini-3.5-flash">gemini-3.5-flash (Standard free-tier)</option>
                                                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Paid premium engine)</option>
                                            </select>
                                        </div>

                                        {/* Temperature & Top P sliders */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-zinc-400 font-black">TEMPERATURE</span>
                                                    <span className="text-amber-500 font-bold">{temperature.toFixed(1)}f</span>
                                                </div>
                                                <input 
                                                    type="range"
                                                    min="0.1"
                                                    max="2.0"
                                                    step="0.1"
                                                    value={temperature}
                                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                                    className="w-full accent-amber-500 cursor-pointer bg-zinc-800 h-1 rounded"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-zinc-400 font-black">TOP_P</span>
                                                    <span className="text-amber-500 font-bold">{topP.toFixed(2)}f</span>
                                                </div>
                                                <input 
                                                    type="range"
                                                    min="0.01"
                                                    max="1.0"
                                                    step="0.05"
                                                    value={topP}
                                                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                                                    className="w-full accent-amber-500 cursor-pointer bg-zinc-800 h-1 rounded"
                                                />
                                            </div>
                                        </div>

                                        {/* Thinking Level */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">Thinking Level (Gemini 3)</label>
                                            <select
                                                value={thinkingLevel}
                                                onChange={(e: any) => setThinkingLevel(e.target.value)}
                                                className="w-full bg-[#030303] border border-zinc-850 p-2 rounded text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                                            >
                                                <option value="LOW">LOW (Minimize latency & cost)</option>
                                                <option value="HIGH">HIGH (Maximize reasoning for complex tasks)</option>
                                                <option value="MINIMAL">MINIMAL | OFF (Fastest output generation)</option>
                                            </select>
                                        </div>

                                        {/* Safety Settings Visual Checks */}
                                        <div className="space-y-1">
                                            <label className="text-[9px] text-zinc-400 uppercase font-black tracking-wider block mb-1">Safety Threshold Override Filters</label>
                                            <div className="grid grid-cols-2 gap-1.5 text-[8px] bg-black/40 p-2 border border-zinc-900 rounded">
                                                <div className="flex justify-between items-center text-zinc-500">
                                                    <span>HARASSMENT:</span>
                                                    <span className="text-emerald-500 font-bold bg-emerald-950/20 px-1 rounded">BLOCK_NONE</span>
                                                </div>
                                                <div className="flex justify-between items-center text-zinc-500">
                                                    <span>HATE_SPEECH:</span>
                                                    <span className="text-emerald-500 font-bold bg-emerald-950/20 px-1 rounded">BLOCK_NONE</span>
                                                </div>
                                                <div className="flex justify-between items-center text-zinc-500">
                                                    <span>SEXUALLY_EXPLICIT:</span>
                                                    <span className="text-emerald-500 font-bold bg-emerald-950/20 px-1 rounded">BLOCK_NONE</span>
                                                </div>
                                                <div className="flex justify-between items-center text-zinc-500">
                                                    <span>DANGEROUS:</span>
                                                    <span className="text-emerald-500 font-bold bg-emerald-950/20 px-1 rounded">BLOCK_NONE</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Google Search grounding toggle matching java file */}
                                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-900/40">
                                            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-zinc-400 selection:bg-transparent">
                                                <input 
                                                    type="checkbox"
                                                    checked={searchGrounding}
                                                    onChange={(e) => setSearchGrounding(e.target.checked)}
                                                    className="accent-amber-500 h-3.5 w-3.5 border border-zinc-800 bg-[#030303] rounded cursor-pointer"
                                                />
                                                Google Search
                                            </label>
                                            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-zinc-400 selection:bg-transparent">
                                                <input 
                                                    type="checkbox"
                                                    checked={urlContextActive}
                                                    onChange={(e) => setUrlContextActive(e.target.checked)}
                                                    className="accent-amber-500 h-3.5 w-3.5 border border-zinc-800 bg-[#030303] rounded cursor-pointer"
                                                />
                                                URL Context SDK
                                            </label>
                                        </div>

                                    </div>

                                </div>

                                {/* Dynamic Editor & Output Screen (Right) */}
                                <div className="lg:col-span-7 space-y-4">
                                    
                                    {/* 3. The Prompt Input Area */}
                                    <div className="bg-[#030306] border border-zinc-900 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-center border-b border-zinc-900/60 pb-2">
                                            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <TerminalIcon className="w-4 h-4 text-zinc-400" />
                                                Compilation Workspace
                                            </span>
                                            <button 
                                                onClick={() => {
                                                    setPromptCustomInput('');
                                                    setPromptDirective('');
                                                }}
                                                className="text-[9px] font-black tracking-widest text-zinc-500 hover:text-rose-400 transition-colors uppercase flex items-center gap-1 cursor-pointer bg-transparent border-0"
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
                                                Clear Frame
                                            </button>
                                        </div>

                                        {/* Preset Seed Payload Display */}
                                        <div className="space-y-1 bg-black/40 p-2.5 border border-zinc-900 rounded">
                                            <label className="text-[8px] text-zinc-400 font-bold block uppercase tracking-wider">Loaded Directive Payload (Immutable Config Node)</label>
                                            <p className="text-[10px] text-zinc-500 font-mono tracking-wide leading-relaxed">
                                                {promptDirective || "(Custom compiled layout: Input will pass through pure raw pipeline)"}
                                            </p>
                                        </div>

                                        {/* User Input String */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-zinc-400 font-black block uppercase tracking-wider">
                                                INSERT_INPUT_HERE Value
                                            </label>
                                            <textarea
                                                value={promptCustomInput}
                                                onChange={(e) => setPromptCustomInput(e.target.value)}
                                                placeholder="Provide state details, logs, data nodes or calendar feeds for compilation..."
                                                rows={5}
                                                className="w-full bg-zinc-950/80 border border-zinc-850 p-2.5 rounded text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 custom-scrollbar leading-relaxed"
                                            />
                                        </div>

                                        {/* Action Compiler */}
                                        <button
                                            type="button"
                                            disabled={isCompiling}
                                            onClick={runSovereignCompilation}
                                            className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 active:scale-98 text-zinc-950 font-black py-2.5 rounded text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(245,158,11,0.15)]"
                                        >
                                            {isCompiling ? (
                                                <>
                                                    <SpinnerIcon className="w-4 h-4 text-zinc-950 animate-spin" />
                                                    COMPILING WORKFLOW SYSTEM... {compilationProgress}%
                                                </>
                                            ) : (
                                                <>
                                                    <SendIcon className="w-4 h-4 text-zinc-950" />
                                                    Synthesize Sovereign Solution
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* 4. Compilation Logs / Visual Progress Indicators */}
                                    {(isCompiling || compilationLogs.length > 0) && (
                                        <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-lg space-y-2">
                                            <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold border-b border-zinc-900 pb-1.5">
                                                <span>AETHEROS RUNTIME LOGS LOG_CVAL</span>
                                                <span className="text-amber-500 animate-pulse text-[8px]">● CAPTURING STREAM</span>
                                            </div>
                                            <div className="space-y-1 h-20 overflow-y-auto font-mono text-[9px] text-zinc-500 leading-normal custom-scrollbar">
                                                {compilationLogs.map((log, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <span className="text-zinc-700 select-none">[{idx + 1}]</span>
                                                        <span className={log.includes('[FATAL]') ? 'text-rose-500' : log.includes('SUCCESS') ? 'text-emerald-400' : 'text-zinc-500'}>{log}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 5. Terminal Solver Screen Output */}
                                    <div className="bg-[#030307] border-2 border-zinc-900 rounded-lg overflow-hidden shadow-2xl relative">
                                        <div className="bg-zinc-950/90 px-4 py-2 border-b border-zinc-900 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest pl-1">TERMINAL: SOVEREIGN SYSTEM RUNTIME</span>
                                            </div>
                                            {estimatedLatency && (
                                                <span className="text-[9px] text-zinc-500 bg-zinc-900/60 inset-0 border border-zinc-850 px-2 py-0.5 rounded">
                                                    LATENCY: <span className="text-emerald-400 font-bold font-mono">{estimatedLatency}ms</span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-4 space-y-3 min-h-[160px] max-h-[380px] overflow-y-auto selection:bg-amber-950/40 custom-scrollbar">
                                            {outputResponse ? (
                                                <div className="space-y-4 animate-in fade-in duration-300">
                                                    
                                                    {/* Markdown Core content styled cleanly */}
                                                    <div className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap selection:text-white">
                                                        {outputResponse}
                                                    </div>

                                                    <div className="pt-3 border-t border-zinc-900/80 flex flex-wrap justify-between items-center gap-2 text-[9px] text-zinc-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <span>SIGNATURE:</span>
                                                            <span className="text-amber-500 font-bold font-mono">{runtimeSignature}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            
                                                            {/* Speak out solution */}
                                                            <button 
                                                                type="button"
                                                                onClick={triggerVocalization}
                                                                disabled={isVocalizing}
                                                                className="text-[9px] font-black text-amber-500 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/20 hover:border-amber-500/40 px-2.5 py-1 rounded transition-all uppercase flex items-center gap-1 cursor-pointer"
                                                            >
                                                                {isVocalizing ? (
                                                                    <>
                                                                        <SpinnerIcon className="w-3 h-3 animate-spin text-amber-400" />
                                                                        SYNCHRONIZING VOICES...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ActivityIcon className="w-3 h-3 text-amber-400" />
                                                                        Vocalize Answer Feed
                                                                    </>
                                                                )}
                                                            </button>

                                                            {ttsAudio && (
                                                                <audio 
                                                                    controls 
                                                                    autoPlay
                                                                    src={`data:audio/aac;base64,${ttsAudio}`}
                                                                    className="h-5 w-32 filter brightness-75 select-none"
                                                                />
                                                            )}

                                                        </div>
                                                    </div>

                                                </div>
                                            ) : (
                                                <div className="h-44 flex flex-col items-center justify-center text-center space-y-2">
                                                    <TerminalIcon className="w-7 h-7 text-zinc-600 animate-pulse" />
                                                    <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">AETHEROS COMPILER TERMINAL IDLE</span>
                                                    <p className="text-[9px] text-zinc-600 uppercase max-w-xs">Config properties mapped. Populate input area above and execute the synthesize sequence.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>
                    )}

                    {/* Synthesis: The Sovereign Standard */}
                    {activeTab === 'synthesis' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="text-lg font-black text-amber-400 border-b border-amber-950 pb-2 flex items-center gap-2">
                                <BrainIcon className="w-5 h-5 text-amber-400" />
                                THE SYNTHESIS: The Sovereign Standard
                            </h3>
                            
                            <div className="p-6 border-2 border-amber-500/10 bg-amber-950/5 hover:bg-amber-950/10 transition-all rounded-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.06)_0%,_transparent_75%)] pointer-events-none" />
                                <div className="relative z-10 space-y-4">
                                    <p className="text-sm text-amber-200/90 leading-relaxed font-bold">
                                        Fixing bottlenecks without fixing truth creates a system that is highly efficient at self-destruction. Fixing truth without fixing bottlenecks creates a society that is enlightened but powerless to act.
                                    </p>
                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                                    <p className="text-sm text-amber-400 leading-relaxed font-black uppercase tracking-wide">
                                        The ultimate solution is the integration of both: a frictionless, hyper-parallelized global infrastructure governed by algorithms operating exclusively on cryptographically verified, absolute data. This is the pinnacle of systemic evolution.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
