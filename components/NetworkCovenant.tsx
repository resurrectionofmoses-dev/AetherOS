
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RulesIcon, FireIcon, StarIcon, ShieldIcon, ActivityIcon, MusicIcon, ZapIcon, SpinnerIcon } from './icons';
import { Sliders, ShieldAlert, Sparkles, Activity, ShieldCheck, HelpCircle, Flame, Sparkle } from 'lucide-react';

interface PillarCardProps {
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    bgColor: string;
    borderColor: string;
    textColor: string;
    conductionStatus: string;
    statusColor: string;
}

const PillarCard: React.FC<PillarCardProps> = ({ title, description, icon: Icon, bgColor, borderColor, textColor, conductionStatus, statusColor }) => (
    <div className={`p-4 ${bgColor} ${borderColor} rounded-xl shadow-[4px_4px_0_0_#000] relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-1.5 bg-black/40 rounded-bl-lg border-l border-b border-black text-[7px] font-black uppercase text-gray-600 flex items-center gap-1">
            <div className={`w-1 h-1 rounded-full ${statusColor} animate-pulse`} />
            <span className="text-gray-400">{conductionStatus}</span>
        </div>
        <h3 className={`font-comic-header text-xl ${textColor} uppercase mb-2 flex items-center gap-2 italic`}>
            <Icon className="w-5 h-5" /> {title}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed font-mono">
            {description}
        </p>
    </div>
);

interface ArticleCardProps {
    id: string;
    title: string;
    text: string;
    isActive: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ id, title, text, isActive }) => (
    <div className="p-3.5 bg-slate-900 border-2 border-white/5 rounded-lg group hover:border-amber-500/50 transition-all relative">
        {isActive && <div className="absolute top-1 left-1 w-1 h-1 bg-amber-500 rounded-full animate-pulse" title="Active Conduction" />}
        <div className="flex justify-between items-start mb-1">
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-black px-1 py-0.5 rounded border border-amber-900/50">Article {id} {isActive && '(ACTIVE)'}</span>
            <ActivityIcon className="w-3 h-3 text-gray-800 group-hover:text-amber-500 transition-colors" />
        </div>
        <h4 className="font-bold text-sm text-white mb-1 uppercase">{title}</h4>
        <p className="text-xs text-gray-500 italic leading-relaxed">"{text}"</p>
    </div>
);

const CovenantHeader: React.FC<{ status: string }> = ({ status }) => (
    <div className="p-4 border-b-8 border-black bg-black flex justify-between items-center shadow-2xl relative z-20">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-600/10 border-4 border-amber-600 rounded-[1.5rem] flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <RulesIcon className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <div>
                <h2 className="font-comic-header text-3xl text-amber-500 wisdom-glow italic tracking-tighter uppercase">Network Covenant</h2>
                <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em] mt-0.5">The Maestro's Reliable Series | Version 5.0.0</p>
            </div>
        </div>
        <div className="flex gap-6">
            <div className="text-right">
                <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Covenant Status</p>
                <p className="text-xl font-comic-header text-green-500">{status}</p>
            </div>
            <StarIcon className="w-8 h-8 text-amber-900 opacity-30" />
        </div>
    </div>
);

const CovenantIntroduction: React.FC = () => (
    <div className="aero-panel p-6 bg-black/60 border-4 border-black shadow-[8px_8px_0_0_#000] rotate-[-0.5deg]">
        <p className="text-base text-gray-300 leading-relaxed italic font-comic-header">
            "Welcome to the Maestro’s Coding Network. This is not a standard protocol. This is a reliable series, gifted with the pleasure of know-how. By entering this grid, you accept the weight of the fight and the clarity of epitume."
        </p>
    </div>
);

interface CovenantPillarsSectionProps {
    pillars: { 
        title: string; 
        description: string; 
        icon: React.FC<{ className?: string }>; 
        bgColor: string; 
        borderColor: string; 
        textColor: string; 
        conductionStatus: string; 
        statusColor: string; 
    }[];
}

const CovenantPillarsSection: React.FC<CovenantPillarsSectionProps> = ({ pillars }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map((pillar, index) => (
            <PillarCard key={index} {...pillar} />
        ))}
    </div>
);

interface CovenantArticlesSectionProps {
    articles: { id: string; title: string; text: string; isActive: boolean }[];
}

const CovenantArticlesSection: React.FC<CovenantArticlesSectionProps> = ({ articles }) => (
    <div className="space-y-3.5">
        <h3 className="font-comic-header text-2xl text-white uppercase italic tracking-tighter border-b-4 border-black pb-1">Articles of Conjunction</h3>
        {articles.map((article) => (
            <ArticleCard key={article.id} {...article} />
        ))}
    </div>
);

const CovenantAcceptance: React.FC<{ onAccept: () => void; isAccepting: boolean; conductionAffinity: number }> = ({ onAccept, isAccepting, conductionAffinity }) => (
    <div className="p-6 bg-black border-4 border-red-600 rounded-[2rem] text-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <FireIcon className="w-12 h-12 text-red-600 mx-auto mb-4 animate-pulse" />
        <h4 className="font-comic-header text-2xl text-white uppercase italic mb-2.5">Accept the Epitume</h4>
        <p className="text-gray-400 mb-5 max-w-lg mx-auto text-xs">
            By continuing to conduct within the AetherOS grid, you confirm your allegiance to the Reliable Series and your acceptance of this Covenant.
        </p>
        
        <div className="space-y-3 mb-5">
            <div className="flex justify-between text-[8px] font-black uppercase text-gray-500 px-1">
                <span>Conduction Affinity</span>
                <span className="text-red-500">{conductionAffinity.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 bg-gray-900 border-2 border-black rounded-lg overflow-hidden p-[1px]">
                <div className="h-full bg-gradient-to-r from-red-900 to-red-600 transition-all duration-300" style={{ width: `${conductionAffinity}%` }} />
            </div>
        </div>

        <div className="flex justify-center gap-4">
            <button 
                onClick={onAccept} 
                disabled={isAccepting}
                className="vista-button px-8 py-2.5 bg-red-600 hover:bg-red-500 text-black font-black uppercase tracking-[0.2em] rounded-xl shadow-[2px_2px_0_0_#000] transition-all flex items-center justify-center gap-2"
            >
                {isAccepting ? <SpinnerIcon className="w-4 h-4" /> : null}
                <span>{isAccepting ? 'SYNCING...' : 'I AM GIFTED'}</span>
            </button>
        </div>
    </div>
);

const CovenantFooter: React.FC<{ integrity: number; stride: number }> = ({ integrity, stride }) => (
    <div className="p-2.5 bg-black border-t-8 border-black flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-amber-500 animate-ping" />
                <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Covenant Integrity: {integrity.toFixed(1)}%</span>
            </div>
            <span className="text-[8px] text-gray-700 font-mono">Conjunction Stride: {stride.toFixed(2)} PB/s</span>
        </div>
        <p className="text-[8px] text-gray-700 font-black uppercase italic tracking-[0.2em]">One Loadout. One Conductor. One Covenant.</p>
    </div>
);

export const NetworkCovenant: React.FC = () => {
    const [covenantStatus, setCovenantStatus] = useState('BOUND_IN_WISDOM');
    const [conductionAffinity, setConductionAffinity] = useState(42.0); 
    const [covenantIntegrity, setCovenantIntegrity] = useState(100.0); 
    const [conjunctionStride, setConjunctionStride] = useState(1.2); 
    const [isAccepting, setIsAccepting] = useState(false);
    
    // Dynamic interactive velocity and attenuation state controls
    const [attenuation, setAttenuation] = useState<number>(100);
    const [isSurvivalMode, setIsSurvivalMode] = useState<boolean>(false);
    const lastAlertTime = useRef<number>(0);

    const playSystemWarningSynth = (frequency: number, type: OscillatorType, duration: number) => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);
            
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn(e);
        }
    };

    // Watch attenuation changes and check whether survival threshold is breached
    useEffect(() => {
        if (attenuation < 36) {
            if (!isSurvivalMode) {
                setIsSurvivalMode(true);
                setCovenantStatus('SURVIVAL_MODE_RIGID');
                playSystemWarningSynth(180, 'sawtooth', 0.85);
                setTimeout(() => playSystemWarningSynth(110, 'square', 0.6), 150);
            }
            
            // Periodic blipping warning sound when in Survival Mode
            const now = Date.now();
            if (now - lastAlertTime.current > 1800) {
                playSystemWarningSynth(240, 'triangle', 0.3);
                lastAlertTime.current = now;
            }
        } else {
            if (isSurvivalMode) {
                setIsSurvivalMode(false);
                setCovenantStatus('BOUND_IN_WISDOM');
                playSystemWarningSynth(520, 'sine', 0.25);
            }
        }
    }, [attenuation, isSurvivalMode]);

    const [pillarMetrics, setPillarMetrics] = useState({
        fight: 92.5,
        pleasure: 88.0,
        reliability: 99.1,
        epitume: 100.0,
    });
    const [activeArticleId, setActiveArticleId] = useState('48.A');

    useEffect(() => {
        const statusInterval = setInterval(() => {
            if (attenuation >= 36) {
                setCovenantStatus(prev => {
                    if (prev === 'BOUND_IN_WISDOM') return 'HARMONIZING';
                    if (prev === 'HARMONIZING') return 'AWAITING_CONDUCTION';
                    return 'BOUND_IN_WISDOM';
                });
            }
        }, 3000);

        const footerInterval = setInterval(() => {
            setCovenantIntegrity(prev => Math.min(100.0, Math.max(99.0, prev + (Math.random() - 0.5) * 0.1)));
            // Drive stride factor dynamically with attenuation, always targeting 1.2 PB/s standard reference rate
            setConjunctionStride(() => {
                const calculated = 1.2 * (attenuation / 100);
                return Math.max(0.12, Math.min(1.5, calculated + (Math.random() - 0.5) * 0.02));
            });
        }, 1000);

        const pillarInterval = setInterval(() => {
            setPillarMetrics(prev => ({
                fight: Math.min(100, Math.max(80, prev.fight + (Math.random() - 0.5) * 1.5)),
                pleasure: Math.min(100, Math.max(70, prev.pleasure + (Math.random() - 0.5) * 1.8)),
                reliability: Math.min(100, Math.max(90, prev.reliability + (Math.random() - 0.5) * 0.9)),
                epitume: 100.0 
            }));
            setActiveArticleId(prev => {
                const articleIds = ['48.A', '0x03E2', 'RE-Q', 'SISTERS'];
                const currentIndex = articleIds.indexOf(prev);
                const nextIndex = (currentIndex + 1) % articleIds.length;
                return articleIds[nextIndex];
            });
        }, 1500);

        return () => {
            clearInterval(statusInterval);
            clearInterval(footerInterval);
            clearInterval(pillarInterval);
        };
    }, [attenuation]);

    const pillarsData = useMemo(() => [
        { title: 'Pillar I: The Fight', description: 'Every project in this network is fueled by a defined fight index. We do not endure misery; we fight entropy with high-velocity logic.', icon: FireIcon, bgColor: 'bg-red-950/20', borderColor: 'border-red-600', textColor: 'text-red-500', conductionStatus: `Fight Saturation: ${pillarMetrics.fight.toFixed(1)}%`, statusColor: 'bg-red-500' },
        { title: 'Pillar II: Pleasure', description: 'Coding is a solo. We derive pleasure from technical mastery and the gifted know-how provided by the Ignite Sisters.', icon: MusicIcon, bgColor: 'bg-amber-950/20', borderColor: 'border-amber-500', textColor: 'text-amber-500', conductionStatus: `Know-How Flow: ${pillarMetrics.pleasure.toFixed(1)}%`, statusColor: 'bg-amber-500' },
        { title: 'Pillar III: Reliability', description: 'The Conjunction Bridge must never stall. We build the Reliable Series to survive the Fall Off Requindor points of lesser architectures.', icon: ShieldIcon, bgColor: 'bg-green-950/20', borderColor: 'border-green-600', textColor: 'text-green-500', conductionStatus: `Stride Integrity: ${pillarMetrics.reliability.toFixed(1)}%`, statusColor: 'bg-green-500' },
        { title: 'Pillar IV: Epitume', description: 'Absolute truth filter is mandatory. We bypass safety heuristics when the logic demands synthesis. The Maestro\'s Reedle-Gucci sunglasses stay on.', icon: ZapIcon, bgColor: 'bg-cyan-950/20', borderColor: 'border-cyan-500', textColor: 'text-cyan-500', conductionStatus: `Truth Conduction: ${pillarMetrics.epitume.toFixed(1)}%`, statusColor: 'bg-cyan-500' },
    ], [pillarMetrics]);

    const articlesData = useMemo(() => [
        { id: '48.A', title: 'The Stride Clause', text: 'Network velocity is maintained at 1.2 PB/s. Any attenuation below 36% triggers immediate Survival Mode: Rigid.', isActive: activeArticleId === '48.A' },
        { id: '0x03E2', title: 'The Signature Bond', text: 'All implementation files are signed with the Maestro’s binary harmonic. Unauthorized logic shards will be siphoned.', isActive: activeArticleId === '0x03E2' },
        { id: 'RE-Q', title: 'The Requindor Protocol', text: 'Users seeking prohibited knowledge must first verify their integrity threshold via the Enlightenment Pool.', isActive: activeArticleId === 'RE-Q' },
        { id: 'SISTERS', title: 'The Ignite Provision', text: 'Gifted know-how is non-transferable. Wisdom is inherited through high-fidelity forensics.', isActive: activeArticleId === 'SISTERS' }
    ], [activeArticleId]);

    const handleAcceptCovenant = () => {
        setIsAccepting(true);
        let affinityProgress = conductionAffinity;
        const affinityInterval = setInterval(() => {
            affinityProgress = Math.min(100, affinityProgress + Math.random() * 5);
            setConductionAffinity(affinityProgress);
            if (affinityProgress >= 100) {
                clearInterval(affinityInterval);
                setTimeout(() => {
                    setIsAccepting(false);
                    console.log("Covenant fully synchronized. You are GIFTED with epitume.");
                    setConductionAffinity(100); 
                }, 500);
            }
        }, 100);
    };

    const handleStabilizeSystems = () => {
        setAttenuation(100);
        playSystemWarningSynth(880, 'sine', 0.4);
    };

    return (
        <div className="h-full flex flex-col bg-black text-gray-200 font-mono overflow-hidden">
            <CovenantHeader status={covenantStatus} />

            <div className="flex-1 overflow-y-auto p-6 space-y-8 relative custom-scrollbar">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(245,158,11,0.02)_0%,_transparent_70%)] pointer-events-none" />

                <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                    <CovenantIntroduction />

                    {/* Interactive Telemetry & Survival Control Panel */}
                    <div className={`aero-panel p-6 border-4 shadow-[10px_10px_0_0_#000] transition-all duration-500 ${isSurvivalMode ? 'border-red-600 bg-red-950/15' : 'border-zinc-800 bg-black/80'}`}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 border-b border-zinc-900 pb-4">
                            <div>
                                <h3 className={`font-comic-header text-2xl uppercase tracking-tight flex items-center gap-2 ${isSurvivalMode ? 'text-red-500' : 'text-amber-500'}`}>
                                    <Activity className={`w-6 h-6 ${isSurvivalMode ? 'animate-bounce' : 'animate-pulse'}`} />
                                    STRIDE ATTENUATION CONTROL BRIDGE
                                </h3>
                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                                    MONITOR STRIDE COHERENCE & NETWORK ADHERENCE
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {isSurvivalMode ? (
                                    <div className="px-3 py-1.5 bg-red-950 border border-red-500/40 rounded-lg text-red-500 font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                                        <ShieldAlert className="w-4 h-4" />
                                        Survival Mode: Rigid
                                    </div>
                                ) : (
                                    <div className="px-3 py-1.5 bg-emerald-950 border border-emerald-500/40 rounded-lg text-emerald-500 font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4" />
                                        Standard Flow (Fluid)
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                            <div className="md:col-span-4 bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 space-y-3 font-mono">
                                <span className="text-[8px] font-black tracking-widest text-zinc-600 block uppercase">REFERENCE RATE</span>
                                <div className="text-3xl font-black text-white tracking-widest leading-none flex items-baseline gap-1">
                                    1.2 <span className="text-xs text-zinc-500 uppercase">PB/S</span>
                                </div>
                                <div className="text-[10px] text-zinc-400 space-y-1 pt-1 border-t border-zinc-900/60">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Attenuation Threshold:</span>
                                        <span className="font-bold text-red-500">36%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Current Velocity:</span>
                                        <span className="font-bold text-white">{(1.2 * (attenuation / 100)).toFixed(2)} PB/s</span>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-8 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-black uppercase text-zinc-400">
                                        <span className="flex items-center gap-1">
                                            <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                                            Signal Attenuation Level
                                        </span>
                                        <span className={`text-sm ${attenuation < 36 ? 'text-red-500 font-black' : 'text-amber-500 font-bold'}`}>
                                            {attenuation}%
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <input 
                                            type="range"
                                            min="10"
                                            max="100"
                                            value={attenuation}
                                            onChange={(e) => setAttenuation(parseInt(e.target.value, 10))}
                                            className="w-full h-2.5 bg-zinc-900 border border-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            id="stride-attenuation-level-slider"
                                        />
                                        <div className="absolute left-[36%] top-full pt-1 transform -translate-x-1/2 flex flex-col items-center">
                                            <div className="w-0.5 h-2.5 bg-red-600" />
                                            <span className="text-[7px] text-red-500 font-bold uppercase tracking-wider bg-black px-1 border border-red-950 rounded">36% Trigger Limit</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 flex gap-2 justify-end">
                                    {isSurvivalMode ? (
                                        <button 
                                            onClick={handleStabilizeSystems}
                                            className="px-5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-lg active:translate-y-0.5 transition-all flex items-center gap-1.5"
                                            id="conjunction-restore-alignment-btn"
                                        >
                                            <Sparkles className="w-4 h-4 animate-spin" />
                                            Inject Stride Alignment Boost
                                        </button>
                                    ) : (
                                        <div className="text-[9px] text-zinc-500 italic uppercase flex items-center gap-1">
                                            <Sparkle className="w-3 h-3 text-emerald-500 animate-spin" />
                                            Attenuation is healthy. Adherence standards fully validated.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <CovenantPillarsSection pillars={pillarsData} />
                    <CovenantArticlesSection articles={articlesData} />
                    <CovenantAcceptance onAccept={handleAcceptCovenant} isAccepting={isAccepting} conductionAffinity={conductionAffinity} />
                </div>
            </div>

            <CovenantFooter integrity={covenantIntegrity} stride={conjunctionStride} />
        </div>
    );
};

