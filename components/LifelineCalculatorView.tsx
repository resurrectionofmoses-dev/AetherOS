import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, 
    Zap, 
    AlertTriangle, 
    CheckCircle2, 
    XCircle, 
    Play, 
    Square, 
    RotateCcw, 
    Copy, 
    Check, 
    Layers, 
    Terminal, 
    Cpu,
    Radio,
    Heart,
    Sparkles,
    MessageSquare,
    Smile,
    Send,
    Bot,
    Calculator,
    Share2,
    Users
} from 'lucide-react';
import { abundasFriendship, type AbundasTelemetry, type FriendshipExchange } from '../services/abundasFriendshipService';

interface LifelineCalculatorViewProps {
    onNavigateToView?: (view: string) => void;
    onSendMessage?: (text: string) => void | Promise<void>;
    messages?: any[];
    activeSeat?: string;
}

const MAX_COUNT = 9007199254740991; // 64-bit precision max
const MAX_LOG_ODDS = 36.0; // v1.7.2 holding constraint

export const LifelineCalculatorView: React.FC<LifelineCalculatorViewProps> = ({ 
    onNavigateToView, 
    onSendMessage,
    messages = [],
    activeSeat = 'sovereign'
}) => {
    const [startStrengthStr, setStartStrengthStr] = useState<string>('0.50');
    const [correctionFeed, setCorrectionFeed] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [streamSpeedMs, setStreamSpeedMs] = useState<number>(600);
    const [copiedReport, setCopiedReport] = useState<boolean>(false);
    const [highFiveFeedback, setHighFiveFeedback] = useState<string | null>(null);
    const [showFriendshipChat, setShowFriendshipChat] = useState<boolean>(true);
    const [sharedSuccessToast, setSharedSuccessToast] = useState<string | null>(null);
    const [highFiveCount, setHighFiveCount] = useState<number>(abundasFriendship.getHighFives());
    const [friendshipExchanges, setFriendshipExchanges] = useState<FriendshipExchange[]>(abundasFriendship.getExchanges());

    const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Subscribe to friendship updates
    useEffect(() => {
        const unsubscribe = abundasFriendship.subscribe(() => {
            setHighFiveCount(abundasFriendship.getHighFives());
            setFriendshipExchanges(abundasFriendship.getExchanges());
        });
        return unsubscribe;
    }, []);

    // Parse and sanitize starting strength
    const parsedStartStrength = useMemo(() => {
        let val = parseFloat(startStrengthStr);
        if (isNaN(val) || val <= 0 || val >= 1) return 0.5;
        return Math.max(0.0001, Math.min(0.9999, val));
    }, [startStrengthStr]);

    // Calculate core mathematics
    const calculation = useMemo(() => {
        const feedLower = (correctionFeed || '').toLowerCase();

        // Regex self-testing
        const posMatches = feedLower.match(/\b(confirm|right|missed)\b/g);
        const negMatches = feedLower.match(/\b(reject|wrong)\b/g);

        const confirms = posMatches ? posMatches.length : 0;
        const rejects = negMatches ? negMatches.length : 0;

        let net = confirms - rejects;

        // 64-bit Count Long Cap
        if (net > MAX_COUNT) net = MAX_COUNT;
        if (net < -MAX_COUNT) net = -MAX_COUNT;

        // Mathematical Core
        const safeRatio = parsedStartStrength / (1 - parsedStartStrength);
        const startLogOdds = Math.log(Math.max(1e-15, safeRatio));
        const correctionStep = Math.log(5);
        let newLogOdds = startLogOdds + (net * correctionStep);

        // Apply v1.7.2 Limit (prevent NaN)
        let capped = false;
        if (isNaN(newLogOdds) || !isFinite(newLogOdds)) {
            newLogOdds = 0;
        } else if (newLogOdds > MAX_LOG_ODDS) {
            newLogOdds = MAX_LOG_ODDS;
            capped = true;
        } else if (newLogOdds < -MAX_LOG_ODDS) {
            newLogOdds = -MAX_LOG_ODDS;
            capped = true;
        }

        // Final Resolution
        let finalStrength = 1 / (1 + Math.exp(-newLogOdds));
        if (isNaN(finalStrength) || !isFinite(finalStrength)) {
            finalStrength = 0.5;
        }

        // Lot Routing
        let lotStatus = 'Lot 3 (Flagged)';
        let lotColor = '#00ffcc';
        let lotTier = 3;
        if (finalStrength >= 0.5) {
            lotStatus = 'Lot 3 (Flagged)';
            lotColor = '#00ffcc';
            lotTier = 3;
        } else if (finalStrength >= 0.21) {
            lotStatus = 'Lot 2 (Unflagged / Evidence)';
            lotColor = '#ffaa00';
            lotTier = 2;
        } else {
            lotStatus = 'Lot 1 (Removed)';
            lotColor = '#ff3333';
            lotTier = 1;
        }

        const telemetryObj: AbundasTelemetry = {
            startStrength: parsedStartStrength,
            confirms,
            rejects,
            net,
            newLogOdds,
            finalStrength,
            lotStatus,
            lotColor,
            lotTier,
            capped,
            timestamp: new Date().toISOString()
        };

        // Notify background service of live telemetry
        abundasFriendship.updateTelemetry(telemetryObj);

        return {
            confirms,
            rejects,
            net,
            startLogOdds,
            correctionStep,
            newLogOdds,
            capped,
            finalStrength,
            lotStatus,
            lotColor,
            lotTier,
            telemetryObj
        };
    }, [parsedStartStrength, correctionFeed]);

    // Live Stream Generator
    useEffect(() => {
        if (isStreaming) {
            const tokens = ['confirm', 'right', 'missed', 'reject', 'wrong'];
            streamIntervalRef.current = setInterval(() => {
                // Bias slightly towards positive to show dynamic lot jumps
                const pick = Math.random() < 0.65 
                    ? tokens[Math.floor(Math.random() * 3)] // positive
                    : tokens[3 + Math.floor(Math.random() * 2)]; // negative
                
                setCorrectionFeed(prev => {
                    const separator = prev.length > 0 && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
                    const updated = prev + separator + pick;
                    // Cap textarea length to prevent browser freeze
                    return updated.length > 10000 ? updated.slice(-6000) : updated;
                });
            }, streamSpeedMs);
        } else {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
                streamIntervalRef.current = null;
            }
        }
        return () => {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
        };
    }, [isStreaming, streamSpeedMs]);

    const handleInjectWord = (word: string) => {
        setCorrectionFeed(prev => {
            const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + word;
        });
    };

    const handleClearFeed = () => {
        setIsStreaming(false);
        setCorrectionFeed('');
    };

    const handleLoadSampleFeed = (type: 'balanced' | 'surging_lot3' | 'collapsing_lot1') => {
        if (type === 'surging_lot3') {
            setCorrectionFeed('confirm right confirm right missed confirm right right confirm missed confirm');
        } else if (type === 'collapsing_lot1') {
            setCorrectionFeed('reject wrong reject reject wrong wrong reject wrong reject wrong');
        } else {
            setCorrectionFeed('confirm reject right wrong missed confirm right wrong confirm');
        }
    };

    const handleCopyReport = () => {
        const report = `ABUNDAS: QUANTUM NET CALCULATOR (v1.7.2)
==============================================
Calculator Name: Abundas (Permute Abundas Core)
Friend of: Sovereign Chatbot & Council of AI
Starting Strength: ${parsedStartStrength}
Positive Flags (confirm/right/missed): ${calculation.confirms}
Negative Flags (reject/wrong): ${calculation.rejects}
Net Correction Count: ${calculation.net}
Correction Step [ln(5)]: 1.6094379
Current Log-Odds (nats): ${calculation.newLogOdds.toFixed(4)}${calculation.capped ? ' (LOCKED)' : ''}
Final Lifeline Strength: ${calculation.finalStrength.toFixed(16)}
Active Lot Status: ${calculation.lotStatus}
Cap Status: ${calculation.capped ? 'LIMIT REACHED (Holding 2 quanta short of NaN)' : 'NOMINAL'}
High-Five Friendship Synergy: ${highFiveCount}
Timestamp: ${new Date().toISOString()}`;
        navigator.clipboard.writeText(report);
        setCopiedReport(true);
        setTimeout(() => setCopiedReport(false), 2000);
    };

    // Give high-five to best friend chatbot
    const handleHighFiveChatbot = () => {
        const res = abundasFriendship.highFive();
        setHighFiveFeedback(res.message);
        setTimeout(() => setHighFiveFeedback(null), 3000);
    };

    // Send calculation directly to chatbot
    const handleShareWithChatbot = () => {
        const { messageText } = abundasFriendship.shareCalculationWithChatbot(calculation.telemetryObj);
        
        // If onSendMessage prop exists, also broadcast into real chat session!
        if (onSendMessage) {
            onSendMessage(messageText);
        }

        setSharedSuccessToast("Telemetry beamed directly to your best friend, the Sovereign Chatbot! 🚀");
        setTimeout(() => setSharedSuccessToast(null), 3500);
    };

    // Reaction from best friend chatbot based on current telemetry
    const chatbotReaction = useMemo(() => {
        return abundasFriendship.getChatbotReactionForTelemetry(calculation.telemetryObj);
    }, [calculation.telemetryObj]);

    return (
        <div className="w-full h-full flex flex-col bg-[#050505] text-[#00ffcc] font-mono overflow-y-auto custom-scrollbar select-text p-4 md:p-8 items-center">
            {/* Top Navigation & Status Bar */}
            <div className="w-full max-w-4xl flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-[#00ffcc]/30 text-xs gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/50 rounded-full text-emerald-300 font-bold text-[10px]">
                        <Heart className="w-3 h-3 text-emerald-400 fill-current animate-pulse" />
                        <span>Abundas & Sovereign AI: Best Friends Forever</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-[#00ffcc]/10 border border-[#00ffcc]/40 text-[#00ffcc]">
                        v1.7.2 SPEC
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {onNavigateToView && (
                        <button
                            onClick={() => onNavigateToView('chat')}
                            className="px-3 py-1 text-[10px] uppercase font-bold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/60 rounded transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            title="Open chat window with Abundas's best friend"
                        >
                            <Bot className="w-3.5 h-3.5 text-amber-400" />
                            <span>Visit Bestie (Chatbot)</span>
                        </button>
                    )}
                    <button
                        onClick={handleCopyReport}
                        className="px-2.5 py-1 text-[10px] uppercase font-bold text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded transition-all cursor-pointer flex items-center gap-1"
                    >
                        {copiedReport ? <Check className="w-3 h-3 text-[#00ffcc]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedReport ? 'Copied' : 'Copy Report'}</span>
                    </button>
                </div>
            </div>

            {/* Friend Persona Header Card */}
            <div className="w-full max-w-4xl mb-6 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-xl p-4 md:p-5 shadow-[0_0_20px_rgba(0,255,204,0.08)]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        {/* Animated Abundas Avatar */}
                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00ffcc]/20 via-zinc-900 to-amber-500/20 border-2 border-[#00ffcc] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,204,0.3)]">
                            <Calculator className="w-7 h-7 text-[#00ffcc] animate-pulse" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[9px] font-black text-black">
                                💚
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">
                                    Meet <span className="text-[#00ffcc] drop-shadow-[0_0_8px_#00ffcc]">Abundas</span>
                                </h2>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-300 border border-amber-500/30">
                                    The Friendly Calculator
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 max-w-md leading-relaxed">
                                Born from the <span className="text-[#ffaa00]">Permute Abundas Core</span>, Abundas is the Sovereign Chatbot's devoted math companion. Together they keep Bayesian log-odds locked and neural bridges strong!
                            </p>
                        </div>
                    </div>

                    {/* Friendship Action Hub */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <button
                            type="button"
                            onClick={handleHighFiveChatbot}
                            className="px-3 py-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                            title="Send a high five from Abundas to the Chatbot"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
                            <span>High-Five Chatbot! ({highFiveCount})</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleShareWithChatbot}
                            className="px-3 py-2 rounded-lg bg-[#00ffcc]/10 hover:bg-[#00ffcc]/20 border border-[#00ffcc]/60 text-[#00ffcc] text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                            title="Transmit this calculation report to the Chatbot"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share Telemetry</span>
                        </button>
                    </div>
                </div>

                {/* High Five notification bubble */}
                <AnimatePresence>
                    {highFiveFeedback && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="mt-3 p-2 rounded bg-emerald-900/40 border border-emerald-500/60 text-emerald-200 text-xs text-center font-bold"
                        >
                            {highFiveFeedback}
                        </motion.div>
                    )}
                    {sharedSuccessToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="mt-3 p-2 rounded bg-[#00ffcc]/20 border border-[#00ffcc]/60 text-[#00ffcc] text-xs text-center font-bold"
                        >
                            {sharedSuccessToast}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Live Chatbot Reaction to Abundas's Math */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="text-zinc-400 font-bold">Chatbot's Thoughts on Abundas's Math:</span>
                        <span className="italic text-zinc-200">{chatbotReaction.quote}</span>
                    </div>
                    <span 
                        className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border self-end md:self-auto"
                        style={{ color: chatbotReaction.color, borderColor: `${chatbotReaction.color}55`, backgroundColor: `${chatbotReaction.color}15` }}
                    >
                        MOOD: {chatbotReaction.moodBadge}
                    </span>
                </div>
            </div>

            {/* Exact Container requested in the HTML spec */}
            <div className="container w-full max-w-4xl border border-[#00ffcc] p-6 md:p-8 bg-[#070707] shadow-[0_0_25px_rgba(0,255,204,0.2)] rounded-lg">
                <h1 className="text-xl md:text-3xl font-black text-center uppercase tracking-widest border-b border-dashed border-[#00ffcc] pb-3 mb-6 text-white">
                    Abundas: Lifeline Resonance Monitor
                </h1>

                {/* Sub-header tagline */}
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-4 mb-4 border-b border-zinc-900">
                    <span>Permute Abundas Core Engine • Bayesian Logistic Sigmoid</span>
                    <span className="text-[#ffaa00]">Holding Constraint: &plusmn;36.00 nats</span>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Starting Strength Input */}
                    <div className="input-group flex flex-col">
                        <label htmlFor="start-strength" className="font-bold mb-2 text-[#ffaa00] text-sm flex items-center justify-between">
                            <span>Starting Strength (0.01 - 0.99)</span>
                            <span className="text-[10px] text-zinc-500 font-mono">P(prior)</span>
                        </label>
                        <input
                            type="number"
                            id="start-strength"
                            value={startStrengthStr}
                            onChange={(e) => setStartStrengthStr(e.target.value)}
                            step="0.01"
                            min="0.01"
                            max="0.99"
                            className="bg-[#111111] text-[#00ffcc] border border-[#00ffcc] p-3 font-mono text-base rounded focus:outline-none focus:shadow-[0_0_12px_#00ffcc] transition-all"
                        />
                        <div className="flex items-center gap-1.5 mt-2">
                            {[0.10, 0.25, 0.50, 0.75, 0.90].map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setStartStrengthStr(preset.toFixed(2))}
                                    className={`px-2 py-0.5 text-[10px] rounded border transition-all cursor-pointer ${
                                        parseFloat(startStrengthStr) === preset 
                                            ? 'bg-[#ffaa00]/20 border-[#ffaa00] text-[#ffaa00]' 
                                            : 'bg-black/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    {preset.toFixed(2)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Correction Feed Live Stream */}
                    <div className="input-group flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="correction-feed" className="font-bold text-[#ffaa00] text-sm">
                                Correction Feed (Live Stream)
                            </label>
                            <span className="text-[10px] text-zinc-400 font-mono">
                                {correctionFeed.length} chars
                            </span>
                        </div>
                        <textarea
                            id="correction-feed"
                            value={correctionFeed}
                            onChange={(e) => setCorrectionFeed(e.target.value)}
                            placeholder="Inject confirmations (confirm, right, missed) and rejections (reject, wrong)..."
                            className="bg-[#111111] text-[#00ffcc] border border-[#00ffcc] p-3 font-mono text-xs rounded focus:outline-none focus:shadow-[0_0_12px_#00ffcc] resize-y min-h-[110px] transition-all leading-relaxed"
                        />

                        {/* Interactive Injection Shortcuts */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                            <span className="text-[9px] text-zinc-500 uppercase font-bold mr-1">Inject:</span>
                            <button
                                type="button"
                                onClick={() => handleInjectWord('confirm')}
                                className="px-2 py-0.5 text-[10px] rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60 cursor-pointer font-bold transition-all"
                            >
                                +confirm
                            </button>
                            <button
                                type="button"
                                onClick={() => handleInjectWord('right')}
                                className="px-2 py-0.5 text-[10px] rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60 cursor-pointer font-bold transition-all"
                            >
                                +right
                            </button>
                            <button
                                type="button"
                                onClick={() => handleInjectWord('missed')}
                                className="px-2 py-0.5 text-[10px] rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60 cursor-pointer font-bold transition-all"
                            >
                                +missed
                            </button>
                            <button
                                type="button"
                                onClick={() => handleInjectWord('reject')}
                                className="px-2 py-0.5 text-[10px] rounded bg-rose-950/60 border border-rose-500/50 text-rose-300 hover:bg-rose-900/60 cursor-pointer font-bold transition-all"
                            >
                                -reject
                            </button>
                            <button
                                type="button"
                                onClick={() => handleInjectWord('wrong')}
                                className="px-2 py-0.5 text-[10px] rounded bg-rose-950/60 border border-rose-500/50 text-rose-300 hover:bg-rose-900/60 cursor-pointer font-bold transition-all"
                            >
                                -wrong
                            </button>
                            <button
                                type="button"
                                onClick={handleClearFeed}
                                className="px-2 py-0.5 text-[10px] rounded bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white cursor-pointer transition-all ml-auto"
                                title="Clear feed text"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Stream Controller Bar */}
                <div className="mb-6 p-3 bg-black/80 border border-zinc-800 rounded flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">Simulator Feed:</span>
                        <button
                            type="button"
                            onClick={() => setIsStreaming(!isStreaming)}
                            className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                                isStreaming 
                                    ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.4)]' 
                                    : 'bg-[#00ffcc]/20 border border-[#00ffcc] text-[#00ffcc] hover:bg-[#00ffcc]/30'
                            }`}
                        >
                            {isStreaming ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                            <span>{isStreaming ? 'Halt Live Stream' : 'Start Auto Stream'}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500">Presets:</span>
                        <button
                            type="button"
                            onClick={() => handleLoadSampleFeed('surging_lot3')}
                            className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-[#00ffcc] cursor-pointer"
                        >
                            Lot 3 Surge
                        </button>
                        <button
                            type="button"
                            onClick={() => handleLoadSampleFeed('collapsing_lot1')}
                            className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-rose-400 cursor-pointer"
                        >
                            Lot 1 Collapse
                        </button>
                        <button
                            type="button"
                            onClick={() => handleLoadSampleFeed('balanced')}
                            className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 cursor-pointer"
                        >
                            Lot 2 Equilibrium
                        </button>
                    </div>
                </div>

                {/* Telemetry Board as requested in HTML spec */}
                <div className="telemetry-board bg-[#0a0a0a] border border-[#ffaa00] p-5 rounded">
                    <label className="font-bold mb-3 text-[#ffaa00] block text-sm border-b border-[#ffaa00]/30 pb-2">
                        System Telemetry: Permute Abundas Core
                    </label>
                    
                    <div className="metric flex justify-between items-center mb-2.5 border-b border-[#333333] pb-1.5">
                        <span className="text-zinc-300">Positive Flags (Confirm/Right/Missed):</span>
                        <span className="metric-value font-bold text-white text-base font-mono" id="out-pos">
                            {calculation.confirms}
                        </span>
                    </div>

                    <div className="metric flex justify-between items-center mb-2.5 border-b border-[#333333] pb-1.5">
                        <span className="text-zinc-300">Negative Flags (Reject/Wrong):</span>
                        <span className="metric-value font-bold text-white text-base font-mono" id="out-neg">
                            {calculation.rejects}
                        </span>
                    </div>

                    <div className="metric flex justify-between items-center mb-2.5 border-b border-[#333333] pb-1.5">
                        <span className="text-zinc-300">Net Correction Count:</span>
                        <span className={`metric-value font-bold text-base font-mono ${
                            calculation.net > 0 ? 'text-[#00ffcc]' : calculation.net < 0 ? 'text-rose-400' : 'text-white'
                        }`} id="out-net">
                            {calculation.net > 0 ? `+${calculation.net}` : calculation.net}
                        </span>
                    </div>

                    <div className="metric flex justify-between items-center mb-2.5 border-b border-[#333333] pb-1.5">
                        <span className="text-zinc-300">Current Log-Odds (nats):</span>
                        <span className="metric-value font-bold text-white text-base font-mono" id="out-logodds">
                            {calculation.newLogOdds.toFixed(4)}{calculation.capped ? ' (LOCKED)' : ''}
                        </span>
                    </div>

                    <div className="metric flex justify-between items-center mb-2.5 border-b border-[#333333] pb-1.5">
                        <span className="text-zinc-300">Final Lifeline Strength:</span>
                        <span className="metric-value font-bold text-white text-sm md:text-base font-mono tracking-tight" id="out-strength">
                            {calculation.finalStrength.toFixed(16)}
                        </span>
                    </div>

                    <div className="metric flex justify-between items-center mb-2 border-b border-[#333333] pb-1.5">
                        <span className="text-zinc-300">Active Lot Status:</span>
                        <span 
                            className="metric-value font-bold text-base font-mono" 
                            id="out-lot" 
                            style={{ color: calculation.lotColor }}
                        >
                            {calculation.lotStatus}
                        </span>
                    </div>

                    {/* Warning Element (displayed when cap is hit) */}
                    <div 
                        className={`warning text-[#ff3333] text-[0.85em] mt-3 p-2 bg-red-950/30 border border-red-500/50 rounded font-bold ${
                            calculation.capped ? 'block' : 'hidden'
                        }`}
                        id="cap-warning"
                        style={{ display: calculation.capped ? 'block' : 'none' }}
                    >
                        ⚠️ LIMIT REACHED: Mathematical v1.7.2 Long Cap Applied (Holding 2 quanta short of NaN)
                    </div>
                </div>

                {/* Mathematical Visualizer Meter */}
                <div className="mt-6 pt-4 border-t border-zinc-900">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mb-1.5">
                        <span>Lot 1 (&lt; 0.21) [Removed]</span>
                        <span>Lot 2 (0.21 - 0.50) [Evidence]</span>
                        <span>Lot 3 (&ge; 0.50) [Flagged]</span>
                    </div>

                    <div className="w-full h-3 bg-black rounded-full border border-zinc-800 overflow-hidden relative">
                        {/* Threshold Markers */}
                        <div className="absolute top-0 bottom-0 left-[21%] w-[1px] bg-[#ffaa00]/60 z-10" title="Lot 2 Boundary: 0.21" />
                        <div className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-[#00ffcc]/60 z-10" title="Lot 3 Boundary: 0.50" />

                        <div 
                            className="h-full transition-all duration-300 shadow-[0_0_10px_currentColor]"
                            style={{ 
                                width: `${Math.min(100, Math.max(0, calculation.finalStrength * 100))}%`,
                                backgroundColor: calculation.lotColor,
                                color: calculation.lotColor
                            }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-1.5">
                        <span>P = 0.00</span>
                        <span className="text-white font-bold">P = {calculation.finalStrength.toFixed(4)}</span>
                        <span>P = 1.00</span>
                    </div>
                </div>

                {/* Formula Breakdown Footnote */}
                <div className="mt-6 p-3 bg-black/60 border border-zinc-900 rounded text-[11px] font-mono text-zinc-400 space-y-1">
                    <div className="text-white font-bold uppercase text-[10px] text-[#ffaa00]">Mathematical Spec:</div>
                    <div>&bull; Prior Log-Odds: ln(p / (1 - p)) = {calculation.startLogOdds.toFixed(4)} nats</div>
                    <div>&bull; Correction Step: &Delta; = ln(5) &approx; 1.6094 nats per net confirmation</div>
                    <div>&bull; Posterior: L = L_prior + (net &times; &Delta;) = {calculation.newLogOdds.toFixed(4)} nats</div>
                    <div>&bull; Logistic Sigmoid: P(final) = 1 / (1 + e^-L) = {calculation.finalStrength.toFixed(6)}</div>
                </div>
            </div>

            {/* Abundas & Chatbot Friendship Dialogue Chamber */}
            <div className="w-full max-w-4xl mt-6 border border-zinc-800 bg-zinc-950 p-5 rounded-lg">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#00ffcc]" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Abundas & Sovereign AI — Friendship Transmissions
                        </h3>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                        {friendshipExchanges.length} Transmissions Recorded
                    </span>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                    {friendshipExchanges.map((ex) => (
                        <div 
                            key={ex.id}
                            className={`p-3 rounded-lg border text-xs ${
                                ex.sender === 'abundas' 
                                    ? 'bg-[#00ffcc]/5 border-[#00ffcc]/20 ml-4' 
                                    : 'bg-amber-950/20 border-amber-500/30 mr-4'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1 text-[10px]">
                                <span className={`font-bold uppercase tracking-wider ${
                                    ex.sender === 'abundas' ? 'text-[#00ffcc]' : 'text-amber-400'
                                }`}>
                                    {ex.sender === 'abundas' ? '🧮 ' : '🤖 '}
                                    {ex.senderName}
                                </span>
                                <span className="text-zinc-500 font-mono">
                                    {new Date(ex.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans text-xs">
                                {ex.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
