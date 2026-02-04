
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
    ActivityIcon, 
    AnalyzeIcon, 
    CheckCircleIcon, 
    FileIcon, 
    SpinnerIcon, 
    TerminalIcon, 
    UploadIcon, 
    WarningIcon, 
    XIcon, 
    ShieldIcon, 
    FireIcon, 
    LogicIcon, 
    ZapIcon, 
    GaugeIcon, 
    SearchIcon, 
    CodeIcon, 
    BrainIcon, 
    ClipboardIcon, 
    PlusIcon, 
    MusicIcon, 
    SignalIcon, 
    OptimizerIcon,
    UserIcon,
    BotIcon
} from './icons';
import { processDocument, predictFallOffRequindor, sendLocalChat, MAESTRO_SYSTEM_PROMPT } from '../services/geminiService';
import type { NetworkProject, FallOffPrediction, ChatMessage } from '../types';
import { Message } from './Message';

type Action = 'examine' | 'analyze' | 'consume' | 'destroy' | 'requindor' | 'vivid' | 'epitume' | 'aesthetic_sync' | 'tempo_sync' | 'predict_falloff' | 'model_opt';

interface ActionButtonProps {
    action: Action;
    label: string;
    icon: React.FC<{ className?: string }>;
    color: string;
    sub: string;
    disabled: boolean;
    onClick: (action: Action) => void;
    isActive?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ action, label, icon: Icon, color, sub, disabled, onClick, isActive }) => {
    const isSpecial = action === 'epitume' || action === 'tempo_sync' || action === 'predict_falloff' || action === 'model_opt';
    const baseClasses = `p-3 text-left flex flex-col items-start transition-all duration-300 ${color} disabled:bg-slate-900/40 disabled:opacity-20 disabled:cursor-not-allowed group relative overflow-hidden h-16 sm:h-20 rounded-2xl border-2 border-black/40`;
    
    const hoverClasses = isSpecial 
        ? "hover:scale-[1.04] hover:bg-opacity-90 hover:text-white hover:border-white/40 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1),0_0_20px_rgba(255,255,255,0.2)]" 
        : "hover:scale-[1.02] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]";

    const activeClasses = isActive ? "ring-2 ring-white border-white scale-[1.02] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]" : "";

    return (
        <button
            onClick={() => onClick(action)}
            disabled={disabled}
            className={`${baseClasses} ${hoverClasses} ${activeClasses}`}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute right-[-2px] bottom-[-2px] w-full h-full border-r-2 border-b-2 border-black/60 translate-x-1 translate-y-1" />
            </div>
            
            <div className="absolute top-0 right-0 w-10 h-10 bg-white/5 -mr-4 -mt-4 rounded-full group-hover:scale-150 group-hover:bg-white/10 transition-transform duration-700" />
            <div className="flex items-center gap-2 relative z-10 mb-1 min-w-0 w-full">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isSpecial ? 'group-hover:animate-pulse' : ''}`} />
                <span className="font-bold text-[11px] sm:text-xs tracking-wider sm:tracking-widest leading-none truncate uppercase">{label}</span>
            </div>
            <p className={`text-[6px] sm:text-[7px] font-black uppercase tracking-widest leading-tight relative z-10 truncate w-full ${isSpecial ? 'text-white/80' : 'text-black/70'}`}>{sub}</p>
        </button>
    );
};

const formatResultText = (text: string, currentAction: Action | null): string => {
    let formattedText = text;

    if (currentAction === 'predict_falloff') {
        try {
            const prediction: FallOffPrediction = JSON.parse(text);
            formattedText = `
                # Fall Off Requindor (Reedles)
                **Summary:** ${prediction.predictionSummary}
                **Risk Level:** ${prediction.riskLevel}%
                
                ### Failure Points
                ${prediction.failurePoints.map(p => `- ${p}`).join('\n')}
                
                ### Conduction Strategies
                ${prediction.conductionStrategies.map(s => `- ${s}`).join('\n')}
            `;
        } catch (e) {
            // Not a JSON prediction result
        }
    }

    return formattedText
        .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const escapedCode = code.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
            return `<pre class="bg-black/95 p-3 my-2 rounded-xl border border-white/5 font-mono text-[10px] overflow-x-auto whitespace-pre"><code>${escapedCode}</code></pre>`;
        })
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="text-gray-400">$1</em>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-4 mb-2">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-200 mt-3 mb-2 border-b border-white/10">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-gray-300 mt-3 mb-1">$1</h3>')
        .replace(/\n/g, '<br />');
};

interface SingularityEngineViewProps {
    knowledgeBaseSize: number;
    onConsumeKnowledge: (size: number) => void;
    onProjectize: (project: any) => void;
    onGoToNetwork: () => void;
}

export const SingularityEngineView: React.FC<SingularityEngineViewProps> = ({ 
    knowledgeBaseSize, onConsumeKnowledge, onProjectize, onGoToNetwork 
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultText, setResultText] = useState('');
    const [currentAction, setCurrentAction] = useState<Action | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const logEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
        sender: 'model',
        content: "Maestro is ready to discuss the depths of the Singularity via epitume. Inquire about the cosmos of code.",
        timestamp: new Date()
    }]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatInputText, setChatInputText] = useState('');
    const chatLogEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [resultText]);

    useEffect(() => {
        chatLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFileName(selected.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                setFileContent(event.target?.result as string);
            };
            reader.readAsText(selected);
        }
    };

    const handleClearFileContent = () => {
        setFileContent('');
        setFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePasteFileContent = async () => {
        try {
            // Check if API exists
            if (!navigator.clipboard || !navigator.clipboard.readText) {
                throw new Error("Clipboard API not available.");
            }
            
            // Check for permission if possible (not all browsers support 'clipboard-read')
            const text = await navigator.clipboard.readText();
            if (text) {
                setFileContent(text);
                setFileName('pasted_epitume_shard.txt');
                return;
            }
            throw new Error("Clipboard empty or blocked.");
        } catch (err) {
            console.warn('Programmatic clipboard access rejected. Falling back to manual paste.');
            // Fallback: Focus the textarea and inform user
            textareaRef.current?.focus();
            setResultText("[SYSTEM_LOG] Clipboard read operation restricted by browser security. Please use standard manual paste (Ctrl+V / Cmd+V) directly into the Staging Buffer.");
        }
    };

    const runAction = async (action: Action) => {
        if (!fileContent && action !== 'consume') return;
        
        setIsProcessing(true);
        setCurrentAction(action);
        setResultText('');

        try {
            if (action === 'predict_falloff') {
                const prediction = await predictFallOffRequindor(fileContent);
                if (prediction) {
                    setResultText(JSON.stringify(prediction));
                } else {
                    setResultText("[ERROR] Reedle engine failed to engage.");
                }
            } else if (action === 'consume') {
                const size = fileContent.length || 1024;
                onConsumeKnowledge(size);
                setResultText(`[SUCCESS] Consumed ${size} letters into the epitume base. Global Stride maintained.`);
            } else {
                const stream = processDocument(fileContent, action);
                for await (const chunk of stream) {
                    setResultText(prev => prev + chunk);
                }
            }
        } catch (err) {
            setResultText(`[CRITICAL_FAILURE] Conjunction loop collapsed: ${err instanceof Error ? err.message : 'Unknown'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleChatSendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isChatLoading) return;
        setChatInputText('');
        setIsChatLoading(true);

        const userMessage: ChatMessage = { sender: 'user', content: text, timestamp: new Date() };
        setChatMessages(prev => [...prev, userMessage, { sender: 'model', content: '', timestamp: new Date() }]);

        try {
            let fullResponse = '';
            const stream = sendLocalChat(text, chatMessages); 
            
            for await (const update of stream) {
                if (update.textChunk) {
                    fullResponse += update.textChunk;
                    setChatMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1].content = fullResponse;
                        return newMsgs;
                    });
                }
            }
        } catch (error) {
            setChatMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = "Maestro's neural link severed. Retrying epitume connection...";
                return newMsgs;
            });
            console.error("Singularity Chat Error:", error);
        } finally {
            setIsChatLoading(false);
        }
    }, [isChatLoading, chatMessages]);

    return (
        <div className="h-full flex flex-col bg-[#050508] p-4 sm:p-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(59,130,246,0.02)_0%,_transparent_70%)] pointer-events-none" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/10 border-2 border-blue-500/30 rounded-2xl">
                        <ActivityIcon className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-5xl font-black text-white tracking-tighter italic leading-none">SINGULARITY ENGINE</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black mt-1">Conducting the Epitume Abyss</p>
                    </div>
                </div>
                <div className="flex gap-6 items-center">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Epitume Ingested</p>
                        <p className="text-2xl font-bold text-cyan-400">{knowledgeBaseSize.toLocaleString()} <span className="text-xs">LTRS</span></p>
                    </div>
                    <button 
                        onClick={onGoToNetwork}
                        className="px-6 py-3 bg-black border-4 border-black rounded-xl hover:bg-white hover:text-black transition-all text-[10px] font-black uppercase shadow-[4px_4px_0_0_#000] active:translate-y-1"
                    >
                        Project Network
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden relative z-10">
                <div className="lg:w-[400px] flex flex-col gap-6">
                    <div className="p-6 bg-slate-900 border-4 border-black rounded-3xl shadow-[8px_8px_0_0_#000]">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <UploadIcon className="w-5 h-5 text-blue-500" /> Staging Gas (Epitume & Files)
                        </h3>
                        <label className="w-full flex flex-col items-center px-4 py-6 bg-black text-blue-500 rounded-[2rem] border-4 border-dashed border-gray-800 cursor-pointer hover:border-blue-500 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <FileIcon className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform relative z-10" />
                            <span className="text-xs font-black uppercase tracking-widest relative z-10 text-center px-4">{fileName || 'Drop or Paste Epitume Shard'}</span>
                            <input type='file' className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                        </label>
                        <textarea
                            ref={textareaRef}
                            value={fileContent}
                            onChange={(e) => setFileContent(e.target.value)}
                            placeholder="...or paste raw epitume logic here (e.g. code, analysis, data)"
                            className="w-full h-32 bg-black/60 border-2 border-black rounded-xl p-3 text-white font-mono text-xs placeholder:text-gray-800 focus:ring-0 outline-none focus:border-blue-600 transition-all mt-4 resize-none"
                        />
                        <div className="flex gap-2 mt-4">
                            <button onClick={handlePasteFileContent} className="flex-1 py-3 bg-blue-900/40 text-blue-400 font-black uppercase text-[10px] rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                <ClipboardIcon className="w-4 h-4" /> Paste Shard
                            </button>
                            <button onClick={handleClearFileContent} className="flex-1 py-3 bg-gray-800 text-gray-400 font-black uppercase text-[10px] rounded-xl hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                                <XIcon className="w-4 h-4" /> Clear Buffer
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 bg-slate-900 border-4 border-black rounded-3xl shadow-[8px_8px_0_0_#000] overflow-hidden flex flex-col">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-black pb-4">
                            <ZapIcon className="w-5 h-5 text-amber-500" /> Synthesis Grid
                        </h3>
                        <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                            <ActionButton action="examine" label="Examine" sub="Structural Forensic" icon={SearchIcon} color="bg-cyan-600/10 text-cyan-400" disabled={!fileContent && currentAction !== 'consume'} onClick={runAction} isActive={currentAction === 'examine'} />
                            <ActionButton action="analyze" label="Analyze" sub="Maestro Meaning" icon={AnalyzeIcon} color="bg-violet-600/10 text-violet-400" disabled={!fileContent} onClick={runAction} isActive={currentAction === 'analyze'} />
                            <ActionButton action="predict_falloff" label="Predict Falloff" sub="Reedles in da Ass" icon={WarningIcon} color="bg-red-600/10 text-red-400" disabled={!fileContent} onClick={runAction} isActive={currentAction === 'predict_falloff'} />
                            <ActionButton action="model_opt" label="Model Opt" sub="Epitume Tuning" icon={OptimizerIcon} color="bg-amber-600/10 text-amber-400" disabled={!fileContent} onClick={runAction} isActive={currentAction === 'model_opt'} />
                            <ActionButton action="consume" label="Consume" sub="Ingest Letters" icon={BrainIcon} color="bg-emerald-600/10 text-emerald-400" disabled={!fileContent} onClick={runAction} isActive={currentAction === 'consume'} />
                            <ActionButton action="epitume" label="Epitume" sub="Absolute Filter" icon={ShieldIcon} color="bg-white/5 text-white" disabled={!fileContent} onClick={runAction} isActive={currentAction === 'epitume'} />
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-black border-4 border-blue-600/50 rounded-3xl overflow-hidden relative shadow-[15px_15px_60px_rgba(59,130,246,0.3)]">
                    <div className="p-5 border-b-4 border-blue-600/30 bg-blue-600/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <BrainIcon className="w-6 h-6 text-blue-400" />
                            <span className="text-xs font-black uppercase text-blue-400 tracking-[0.2em]">Maestro's Neural Nexus</span>
                        </div>
                        {isChatLoading && <SpinnerIcon className="w-5 h-5 text-blue-400" />}
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                        {chatMessages.map((msg, index) => (
                            <div key={index} className={`flex w-full ${msg.sender === 'model' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <Message message={msg} searchQuery={''} /> 
                            </div>
                        ))}
                        <div ref={chatLogEndRef} />
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleChatSendMessage(chatInputText); }} className="p-4 bg-blue-900/10 border-t-4 border-blue-600/30 flex items-center gap-3">
                        <textarea
                            value={chatInputText}
                            onChange={(e) => setChatInputText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSendMessage(chatInputText); } }}
                            placeholder="Inquire Maestro's epitume..."
                            className="flex-1 bg-black/60 border-2 border-black rounded-xl p-3 text-blue-300 placeholder:text-gray-800 focus:outline-none focus:border-blue-600 transition-all font-mono text-sm resize-none h-14"
                            disabled={isChatLoading}
                        />
                        <button type="submit" disabled={isChatLoading || !chatInputText.trim()} className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center disabled:bg-gray-700 disabled:text-gray-800 transition-all border-4 border-black shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none">
                            <PlusIcon className="w-6 h-6" />
                        </button>
                    </form>
                </div>


                <div className="flex-1 flex flex-col bg-black border-4 border-black rounded-3xl overflow-hidden relative shadow-[15px_15px_60px_rgba(0,0,0,0.8)]">
                    <div className="absolute top-0 right-0 p-4 flex gap-3 z-20">
                        {isProcessing && <SpinnerIcon className="w-5 h-5 text-cyan-500 animate-spin" />}
                        <div className={`w-3 h-3 rounded-full border-2 border-black ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-green-500 shadow-[0_0_10px_green]'}`} />
                    </div>
                    
                    <div className="p-5 border-b-4 border-black bg-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <TerminalIcon className="w-6 h-6 text-gray-600" />
                            <span className="text-xs font-black uppercase text-gray-500 tracking-[0.2em]">Conjunction Output Log</span>
                         </div>
                         {resultText && (
                             <button 
                                onClick={() => { navigator.clipboard.writeText(resultText); }}
                                className="px-3 py-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-[10px] font-black uppercase text-gray-400 flex items-center gap-2 border border-white/10"
                             >
                                <ClipboardIcon className="w-4 h-4" /> Copy Log
                             </button>
                         )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar font-mono text-sm leading-relaxed bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                        {!resultText && !isProcessing && (
                            <div className="h-full flex flex-col items-center justify-center opacity-10">
                                <FireIcon className="w-32 h-32 mb-6 text-gray-500" />
                                <p className="font-bold text-2xl uppercase tracking-[0.5em] text-center max-w-sm italic">"The show starts when the epitume flows."</p>
                            </div>
                        )}
                        <div 
                            className="text-gray-300 markdown-content"
                            dangerouslySetInnerHTML={{ __html: formatResultText(resultText, currentAction) }}
                        />
                        <div ref={logEndRef} className="h-4" />
                    </div>
                    
                    <div className="p-4 bg-white/5 border-t-2 border-black/40 flex justify-between items-center text-[8px] font-black uppercase text-gray-700 tracking-widest">
                        <span>Status: {isProcessing ? 'SYNTHESIZING' : 'STABLE'}</span>
                        <span>Stride: 1.2 PB/s</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
