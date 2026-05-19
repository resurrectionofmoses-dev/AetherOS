
import React, { useMemo, useState, useEffect } from 'react';
import { ActivityIcon, StarIcon, ShieldIcon, FireIcon, ZapIcon, CheckCircleIcon, LogicIcon, BookOpenIcon, MusicIcon, TimerIcon, PlusIcon } from './icons';
import { milestoneService } from '../services/milestoneService';
import { Milestone } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// Local icon definitions moved to top to prevent React Error #130 (temporal dead zone/hoisting issues in hooks)
const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
);

const CodeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
);

const PennyWheatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" />
    </svg>
);

interface TimelineNodeProps {
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    color: string;
    timestamp: string;
    isLast?: boolean;
    isConcrete?: boolean;
}

const TimelineNode: React.FC<TimelineNodeProps> = ({ title, description, icon: Icon, color, timestamp, isLast, isConcrete }) => (
    <div className="flex gap-4 relative">
        {!isLast && <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-white/10 to-transparent" />}
        <div className={`w-8 h-8 rounded-md border-2 flex-shrink-0 flex items-center justify-center z-10 bg-black ${color.replace('text', 'border')} ${isConcrete ? 'shadow-[0_0_15px_rgba(255,255,255,0.2)]' : ''}`}>
            <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="pb-8 flex-1">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest font-mono">[{timestamp}]</span>
                <h4 className="font-comic-header text-lg text-white uppercase italic tracking-tight flex items-center gap-2">
                    {title}
                    {isConcrete && <span className="text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-black tracking-widest uppercase">CONCRETE</span>}
                </h4>
            </div>
            <div className="aero-panel p-4 bg-white/[0.03] border border-white/5 rounded-lg relative overflow-hidden group hover:border-white/20 transition-all shadow-md">
                <p className="text-xs text-gray-400 leading-relaxed italic font-mono whitespace-pre-wrap">
                    {description}
                </p>
                <div className={`absolute top-0 right-0 p-1 opacity-5 group-hover:opacity-10 transition-opacity`}>
                    <Icon className="w-12 h-12" />
                </div>
            </div>
        </div>
    </div>
);

export const TimelineView: React.FC = () => {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newType, setNewType] = useState<Milestone['category']>('WISDOM');

    useEffect(() => {
        setMilestones(milestoneService.getMilestones());
    }, []);

    const handleAdd = async () => {
        if (!newTitle || !newDesc) return;
        await milestoneService.addMilestone(newTitle, newDesc, newType, true);
        setMilestones(milestoneService.getMilestones());
        setNewTitle('');
        setNewDesc('');
        setShowAdd(false);
    };

    const journeySteps = useMemo(() => {
        const base = [
            {
                title: "Discovery & Advisory",
                timestamp: "Phase 01: 0x0001",
                description: "Identifying business objectives and user stories to eliminate knowledge gaps. Siphoning the first intent from the Digital Abyss.",
                icon: SearchIcon,
                color: "text-cyan-400",
                isConcrete: false
            }
        ];

        const mappedMilestones = milestones.map(m => ({
            title: m.title,
            timestamp: m.date.toLocaleString(),
            description: m.description,
            icon: m.category === 'CODE' ? CodeIcon : m.category === 'SECURITY' ? ShieldIcon : m.category === 'INFRA' ? ZapIcon : LogicIcon,
            color: m.category === 'CODE' ? 'text-blue-400' : m.category === 'SECURITY' ? 'text-red-500' : m.category === 'INFRA' ? 'text-amber-500' : 'text-violet-500',
            isConcrete: m.isConcrete
        }));

        return [...base, ...mappedMilestones];
    }, [milestones]);

    return (
        <div className="h-full flex flex-col bg-[#050510] text-gray-200 font-mono overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(59,130,246,0.02)_0%,_transparent_70%)] pointer-events-none" />
            
            <div className="p-4 border-b-8 border-black sticky top-0 z-30 bg-slate-900 flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 border-4 border-white/20 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        <StarIcon className="w-7 h-7 text-white animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-3xl text-white italic tracking-tighter uppercase leading-none">Concrete Milestones & Findings</h2>
                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em] mt-1 italic">Penny Wheats & Titular Truths // Protocol 0x03E2</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowAdd(!showAdd)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 font-black text-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-amber-500 transition-colors shadow-[0_4px_0_0_#92400e]"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Record Finding
                    </button>
                    <div className="text-right">
                        <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Chronos State</p>
                        <p className="text-xl font-comic-header text-green-500">OPTIMAL</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8 pb-20">
                    
                    <AnimatePresence>
                        {showAdd && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-12"
                            >
                                <div className="aero-panel p-6 bg-zinc-900 border-2 border-amber-600/50 rounded-2xl shadow-xl">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
                                        <TimerIcon className="w-4 h-4" />
                                        Initialize New Chronicle Entry
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Finding Title</label>
                                            <input 
                                                value={newTitle}
                                                onChange={e => setNewTitle(e.target.value)}
                                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs focus:border-amber-500 outline-none transition-all placeholder:text-zinc-700 font-mono"
                                                placeholder="e.g. Penny Wheat: System Dissonance..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Categorization</label>
                                            <select 
                                                value={newType}
                                                onChange={e => setNewType(e.target.value as any)}
                                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs focus:border-amber-500 outline-none transition-all font-mono"
                                            >
                                                <option value="WISDOM">WISDOM (Abstract)</option>
                                                <option value="CODE">CODE (Implementation)</option>
                                                <option value="SECURITY">SECURITY (Protocol)</option>
                                                <option value="INFRA">INFRA (Structural)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-6">
                                        <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Contextual Description</label>
                                        <textarea 
                                            value={newDesc}
                                            onChange={e => setNewDesc(e.target.value)}
                                            rows={4}
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs focus:border-amber-500 outline-none transition-all placeholder:text-zinc-700 font-mono resize-none"
                                            placeholder="Provide the concrete evidence or findings here..."
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => setShowAdd(false)} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors">Abstain</button>
                                        <button onClick={handleAdd} className="px-8 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase hover:bg-white/90 transition-colors">Record Milestone</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="aero-panel p-6 bg-black/60 border-4 border-black shadow-[8px_8px_0_0_#000] mb-10 relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 opacity-5">
                            <BookOpenIcon className="w-48 h-48 text-white" />
                        </div>
                        <h3 className="font-comic-header text-2xl text-amber-500 mb-4 uppercase italic underline decoration-2 underline-offset-4 decoration-amber-900/50">The Registry of Truth</h3>
                        <p className="text-base text-gray-300 leading-relaxed italic font-comic-header mb-5">
                            "Human survival depends on the integrity of three primary infrastructures. Recording concrete findings prevents the biological load of repetitive failure."
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'BIOLOGICAL', desc: 'Host Resistance', icon: HeartIcon, color: 'text-rose-500' },
                                { label: 'TITULAR', desc: 'Concrete Milestones', icon: StarIcon, color: 'text-amber-500' },
                                { label: 'DIGITAL', desc: 'Sustainable Grids', icon: LogicIcon, color: 'text-cyan-500' }
                            ].map(item => (
                                <div key={item.label} className="p-2.5 bg-black/40 rounded-lg border border-white/5 flex flex-col items-center text-center group hover:border-white/20 transition-all">
                                    <item.icon className={`w-6 h-6 mb-2 ${item.color} group-hover:scale-110 transition-transform`} />
                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">{item.label}</span>
                                    <p className="text-[8px] text-gray-400 italic font-mono">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative pl-3 sm:pl-0">
                        {journeySteps.map((step, i) => (
                            <TimelineNode 
                                key={i} 
                                {...step} 
                                isLast={i === journeySteps.length - 1} 
                            />
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-red-950/20 border-4 border-red-600 rounded-[2rem] text-center shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse">
                        <FireIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h4 className="font-comic-header text-2xl text-white uppercase italic mb-2.5">Biological Load Alert</h4>
                        <p className="text-gray-400 max-w-2xl mx-auto italic font-mono text-xs">
                            "If our coding schedule ignores mandatory breaks, we weaken our own host resistance. Green IT is a public health goal."
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-2.5 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-8">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-cyan-500 animate-ping" />
                        <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Chronicle Integrity: VERIFIED</span>
                    </div>
                    <span className="text-[8px] text-gray-700 font-mono italic">
                        TITLES_TRACKED: {milestones.length} | REGISTRY: v2026.04
                    </span>
                </div>
                <div className="text-[8px] text-gray-700 font-black uppercase italic tracking-[0.2em] hidden sm:block">
                    siphoning truth from the digital abyss
                </div>
            </div>
        </div>
    );
};
