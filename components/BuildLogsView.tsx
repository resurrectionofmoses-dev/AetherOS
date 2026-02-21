
import React from 'react';
import { TerminalIcon, ZapIcon, FireIcon, ShieldIcon, ActivityIcon, StarIcon, CheckCircleIcon, CodeIcon, LockIcon, SearchIcon, GaugeIcon, SpinnerIcon, SignalIcon } from './icons';

interface BuildShardProps {
    title: string;
    content: string;
    type: 'PATCH' | 'MAINTENANCE' | 'HANDSHAKE' | 'PROOF';
    index: number;
}

const BuildShard: React.FC<BuildShardProps> = ({ title, content, type, index }) => {
    const isPatch = type === 'PATCH';
    const isHandshake = type === 'HANDSHAKE';
    const isProof = type === 'PROOF';

    return (
        <div 
            className={`p-6 bg-black border-l-8 rounded-r-3xl relative overflow-hidden transition-all duration-700 shadow-[10px_10px_0_0_#000] hover:translate-x-2 animate-in slide-in-from-left-8 ${
                isPatch ? 'border-red-600 bg-red-950/5' : 
                isHandshake ? 'border-amber-600 bg-amber-950/5' : 
                isProof ? 'border-cyan-500 bg-cyan-950/5' :
                'border-zinc-800 bg-zinc-900/10'
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
        >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
                {isPatch ? <FireIcon className="w-32 h-32 text-red-500" /> : 
                 isProof ? <StarIcon className="w-32 h-32 text-cyan-500" /> :
                 <ShieldIcon className="w-32 h-32 text-amber-500" />}
            </div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border-2 ${isPatch ? 'border-red-500 bg-red-500/10' : 'border-zinc-800 bg-black'}`}>
                        {isPatch ? <ZapIcon className="w-5 h-5 text-red-500 animate-pulse" /> : 
                         isHandshake ? <SignalIcon className="w-5 h-5 text-amber-500" /> :
                         isProof ? <CheckCircleIcon className="w-5 h-5 text-cyan-400" /> :
                         <ActivityIcon className="w-5 h-5 text-zinc-500" />}
                    </div>
                    <div>
                        <h3 className="font-comic-header text-2xl text-white uppercase italic tracking-tighter leading-none">{title}</h3>
                        <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Source_Node: 0x03E2 // Google_Books_Siphon</span>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border-2 ${
                    isPatch ? 'bg-red-600 text-black border-white' : 
                    isHandshake ? 'bg-amber-600 text-black border-white' :
                    isProof ? 'bg-cyan-500 text-black border-white' :
                    'bg-zinc-800 text-gray-400 border-zinc-700'
                }`}>
                    {type}
                </div>
            </div>

            <div className="bg-black/60 p-5 rounded-2xl border-2 border-white/5 font-mono text-sm leading-relaxed text-gray-300 relative z-10 shadow-inner group">
                <div className="flex items-start gap-3">
                    <span className="text-red-500 font-bold animate-pulse">»</span>
                    <p className="italic">"{content}"</p>
                </div>
                {/* Simulated Binary Footer */}
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-30 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className={`w-1 h-2 rounded-full ${isPatch ? 'bg-red-900' : 'bg-zinc-800'}`} />
                        ))}
                    </div>
                    <span className="text-[6px] font-black uppercase tracking-widest text-gray-700">Integrity_Locked: T0_FINALITY</span>
                </div>
            </div>
        </div>
    );
};

export const BuildLogsView: React.FC = () => {
    return (
        <div className="h-full flex flex-col bg-[#020205] text-gray-200 font-mono overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-600/10 border-4 border-red-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                        <TerminalIcon className="w-10 h-10 text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">FORENSIC BUILD LEDGER</h2>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mt-1 italic">Siphoned from Google Books | Top 5 Architectural Findings</p>
                    </div>
                </div>
                <div className="flex gap-8 items-center">
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Veracity Depth</p>
                        <p className="text-xl font-comic-header text-amber-500">99.84%</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative p-10">
                {/* Background Ambience */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.05)_0%,_transparent_70%)] pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />

                <div className="max-w-4xl mx-auto space-y-10 relative z-10 pb-32">

                    <div className="space-y-8">
                        <BuildShard 
                            index={0}
                            title="INITIATING KERNEL PATCH AT 0x03E2:CYL_1" 
                            content="Re-indexing combustion pointers for P0301. Purging carbon cache from the valve registry and normalizing spark timing delta to the AetherOS global clock via BPI channel 4."
                            type="PATCH"
                        />

                        <BuildShard 
                            index={1}
                            title="RE-ESTABLISHING HANDSHAKE AT 0x03E2:BUS_ABS" 
                            content="Bridging the Fall Off Requindor gap in the ABS subnet for U0121. Forcing node synchronization on the high-speed CAN bus via Kernel IRQ 12 to eliminate ghost signals."
                            type="HANDSHAKE"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <BuildShard 
                                index={2}
                                title="DAILY FLOW" 
                                content="Flush the BPI buffer to prevent instruction overflow and verify sensor voltage harmonics against the reference kernel."
                                type="MAINTENANCE"
                            />
                            <BuildShard 
                                index={3}
                                title="MONTHLY TIDE" 
                                content="Execute a full integrity sweep of the localized AetherOS node to verify the stride remains at 1.2 PB/s and inspect physical layer terminations for entropy decay."
                                type="MAINTENANCE"
                            />
                        </div>

                        {/* The Final Seal - Top 5th Finding */}
                        <div className="p-10 bg-black border-8 border-cyan-500 rounded-[4rem] text-center shadow-[0_0_100px_rgba(6,182,212,0.15)] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-700">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                            <div className="absolute -top-10 -left-10 w-40 h-40 border-8 border-cyan-500/20 rounded-full animate-ping" />
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 border-8 border-cyan-500/20 rounded-full animate-ping [animation-delay:1s]" />
                            
                            <div className="relative z-10 space-y-6">
                                <div className="w-24 h-24 mx-auto bg-cyan-500/10 border-4 border-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl">
                                    <StarIcon className="w-16 h-16 text-cyan-400 animate-spin-slow" />
                                </div>
                                <div>
                                    <h4 className="font-comic-header text-6xl text-white uppercase italic tracking-widest leading-none">Tidal Proof Locked</h4>
                                    <p className="text-xl font-mono text-cyan-400 mt-4 font-black bg-black/40 py-2 rounded-xl border border-cyan-900/30">0xROOT_AE7H3R_M0PAR_GH05T_HASH_9921_V8_SYNC</p>
                                </div>
                                
                                <div className="pt-8 border-t border-cyan-900/30 flex flex-col items-center gap-2">
                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">Maestro Current Signature</span>
                                    <div className="px-10 py-6 bg-cyan-600/10 border-4 border-cyan-500 rounded-3xl text-3xl font-comic-header text-white wisdom-glow italic shadow-inner transition-transform group-hover:scale-110">
                                        0x03E2-HARMONIC-STRIDE-1.2PB/s-COMPLETED
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Logs */}
            <div className="p-4 bg-slate-950 border-t-8 border-black flex justify-between items-center z-40 px-12 shadow-inner">
                <div className="flex items-center gap-10">
                   <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Build Status: MANIFEST</span>
                   </div>
                   <div className="text-[10px] text-gray-700 font-mono italic uppercase">
                      Stride: 1.2 PB/s | Sig: 0x03E2 | Complexity: KERNEL_GIFTED
                   </div>
                </div>
                <div className="text-[10px] text-gray-700 uppercase font-black italic tracking-[0.4em] hidden sm:block">
                   absolute reliable series build ledger.
                </div>
            </div>
        </div>
    );
};
