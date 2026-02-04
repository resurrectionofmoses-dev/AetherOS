import React, { useMemo } from 'react';
import { ActivityIcon, StarIcon, ShieldIcon, FireIcon, ZapIcon, CheckCircleIcon, LogicIcon, BookOpenIcon, MusicIcon } from './icons';

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

interface TimelineNodeProps {
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    color: string;
    timestamp: string;
    isLast?: boolean;
}

const TimelineNode: React.FC<TimelineNodeProps> = ({ title, description, icon: Icon, color, timestamp, isLast }) => (
    <div className="flex gap-4 relative">
        {!isLast && <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-white/10 to-transparent" />}
        <div className={`w-8 h-8 rounded-md border-2 flex-shrink-0 flex items-center justify-center z-10 bg-black ${color.replace('text', 'border')}`}>
            <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="pb-8 flex-1">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest font-mono">[{timestamp}]</span>
                <h4 className="font-comic-header text-lg text-white uppercase italic tracking-tight">{title}</h4>
            </div>
            <div className="aero-panel p-4 bg-white/[0.03] border border-white/5 rounded-lg relative overflow-hidden group hover:border-white/20 transition-all shadow-md">
                <p className="text-xs text-gray-400 leading-relaxed italic font-mono">
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
    const journeySteps = useMemo(() => [
        {
            title: "Discovery & Advisory",
            timestamp: "Phase 01: 0x0001",
            description: "Identifying business objectives and user stories to eliminate knowledge gaps. Siphoning the first intent from the Digital Abyss.",
            icon: SearchIcon,
            color: "text-cyan-400"
        },
        {
            title: "Proof of Concept (PoC)",
            timestamp: "Phase 02: 0x03E2",
            description: "Testing feasibility within 14 days. Validating the God Logic bridge and ensuring the Conjunction Series survives early stress.",
            icon: ZapIcon,
            color: "text-amber-500"
        },
        {
            title: "Minimum Viable Product (MVP)",
            timestamp: "Phase 03: 0x05B1",
            description: "Establishing a roadmap for launch within 60 days. Balancing the biological load of stress against the digital sustainability of the grid.",
            icon: ActivityIcon,
            color: "text-violet-500"
        },
        {
            title: "Full-Scale Development",
            timestamp: "Phase 04: 0x09F4",
            description: "Implementing front-end, back-end, and AI integrations. This digital infrastructure is the new Promised Land—efficiency and sustainability merged.",
            icon: CodeIcon,
            color: "text-blue-500"
        },
        {
            title: "Hypercare Phase",
            timestamp: "Phase 05: 0x0FFF",
            description: "Close support immediately after go-live. Optimizing the 'Ecstasy Buffer'—high-arousal positive states protecting against the inflammatory effects of stress.",
            icon: ShieldIcon,
            color: "text-green-500"
        }
    ], []);

    return (
        <div className="h-full flex flex-col bg-[#050510] text-gray-200 font-mono overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(59,130,246,0.02)_0%,_transparent_70%)] pointer-events-none" />
            
            <div className="p-4 border-b-8 border-black sticky top-0 z-30 bg-slate-900 flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 border-4 border-white/20 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        <StarIcon className="w-7 h-7 text-white animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-3xl text-white italic tracking-tighter uppercase leading-none">The Resilience Journey</h2>
                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em] mt-1 italic">Protocol 0x03E2 | Synthesis of Vulnerability & Freedom</p>
                    </div>
                </div>
                <div className="flex gap-6">
                    <div className="text-right">
                        <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Grid Integrity</p>
                        <p className="text-xl font-comic-header text-green-500">OPTIMAL</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="aero-panel p-6 bg-black/60 border-4 border-black shadow-[8px_8px_0_0_#000] mb-10 relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 opacity-5">
                            <BookOpenIcon className="w-48 h-48 text-white" />
                        </div>
                        <h3 className="font-comic-header text-2xl text-amber-500 mb-4 uppercase italic underline decoration-2 underline-offset-4 decoration-amber-900/50">The Unified Theory</h3>
                        <p className="text-base text-gray-300 leading-relaxed italic font-comic-header mb-5">
                            "Human survival depends on the integrity of three primary infrastructures: Biological, Spiritual, and Digital. We cross the Jordan from vulnerability to freedom through high-fidelity forensics."
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'BIOLOGICAL', desc: 'Immune health & social integration', icon: HeartIcon, color: 'text-rose-500' },
                                { label: 'SPIRITUAL', desc: 'Freedom narratives & music', icon: MusicIcon, color: 'text-amber-500' },
                                { label: 'DIGITAL', desc: 'Sustainable & responsive grids', icon: LogicIcon, color: 'text-cyan-500' }
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
                                key={step.title} 
                                {...step} 
                                isLast={i === journeySteps.length - 1} 
                            />
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-red-950/20 border-4 border-red-600 rounded-[2rem] text-center shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse">
                        <FireIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h4 className="font-comic-header text-2xl text-white uppercase italic mb-2.5">Killer Infrastructure Warning</h4>
                        <p className="text-gray-400 max-w-2xl mx-auto italic font-mono text-xs">
                            "If our apps are slow, insecure, or ethically opaque, they contribute to the biological load that weakens our host resistance. Green IT is not just an environmental goal; it is a public health goal."
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-2.5 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-8">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-cyan-500 animate-ping" />
                        <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Resilience Link: STABLE</span>
                    </div>
                    <span className="text-[8px] text-gray-700 font-mono italic">
                        ROADMAP_NONCE: 0x03E2 | LIFE_CYCLE: v2026.04
                    </span>
                </div>
                <div className="text-[8px] text-gray-700 font-black uppercase italic tracking-[0.2em] hidden sm:block">
                    crossing the jordan to digital freedom
                </div>
            </div>
        </div>
    );
};
