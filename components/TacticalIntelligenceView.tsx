import React from 'react';
import { 
    BrainIcon, ActivityIcon, ZapIcon, CodeIcon, 
    TerminalIcon, ShieldIcon, CheckCircleIcon, 
    ChevronDownIcon, SearchIcon 
} from './icons';
import type { MainView } from '../types';

interface TacticalIntelligenceViewProps {
    onClose: () => void;
}

export const TacticalIntelligenceView: React.FC<TacticalIntelligenceViewProps> = ({ onClose }) => {
    const vectors = [
        {
            id: '01',
            title: 'Genomic Processing: DART-PIM',
            subtitle: 'Vector: Eliminating Bottlenecks in DNA Read Mapping',
            icon: BrainIcon,
            color: 'text-purple-400',
            border: 'border-purple-500/30',
            bg: 'bg-purple-950/10',
            analysis: 'DART-PIM identifies the "path of zero electrical resistance" by utilizing Processing-In-Memory (PIM). In traditional architectures, the "memory wall" (latency between CPU and RAM) creates a systemic bottleneck during the high-volume data ingestion required for DNA alignment. DART-PIM eliminates this by executing the mapping logic directly within the memory layer, reducing data movement and forcing a new operational reality where throughput is limited only by hardware clock speed, not bus latency.'
        },
        {
            id: '02',
            title: 'Agent Dynamics: AI Morale & Free Will',
            subtitle: 'Vector: Simulating a Professional Workforce',
            icon: ActivityIcon,
            color: 'text-blue-400',
            border: 'border-blue-500/30',
            bg: 'bg-blue-950/10',
            analysis: 'The system manages agent state through a Dynamic Morale & Skill Logic. Agents are not static variables; their "Morale" functions as a state-vibration that affects skill progression and task efficiency. "Free Will" in this context is modeled as a branching logic tree where high-morale states trigger autonomous skill elevation, while low-morale states introduce noise into the execution flow, requiring re-calibration or "leadership" interventions to restore nominal performance.'
        },
        {
            id: '03',
            title: 'Industrial Automation: PLC Sequencing',
            subtitle: 'Vector: Programming Methods for Industrial Machinery',
            icon: ZapIcon,
            color: 'text-amber-400',
            border: 'border-amber-500/30',
            bg: 'bg-amber-950/10',
            analysis: `Transition logic is managed via three primary protocols:
• Ladder Logic (LD): Traditional parallel state evaluation mimicking physical relays.
• Sequential Function Charts (SFC): A multi-stage state machine that visualizes the "Billy Order" of the process.
• State Machines: Hard-coded transition logic where each step must be "blown like a trumpet" (verified by limit switches/sensors) before the sequence moves to the next phase.`
        },
        {
            id: '04',
            title: 'Analog Synthesis: CV & Gate Logic',
            subtitle: 'Vector: Early Drum Tracks and the Moog 960',
            icon: ActivityIcon, // Using ActivityIcon as a proxy for Waveform/Synth
            color: 'text-pink-400',
            border: 'border-pink-500/30',
            bg: 'bg-pink-950/10',
            analysis: `Control Voltage (CV) and Gates represent the fundamental "vectors" of synthesis. The Moog 960 Sequencer used CV to define the pitch/timbre of each step, while Gates triggered the "attack" or "state collapse" of the envelope.

Calibration: Fine-tuning is achieved via Trimmers. To calibrate for 2.5V and 5V ranges, high-precision multimeters (e.g., Fluke 87V or Keysight equivalents) are used to measure the op-amp output while adjusting the trimmer until the voltage aligns with the target logic level.

Clock Source: An op-amp can be configured as a Relaxation Oscillator (using a capacitor and resistor in the feedback loop) to create a stable, repeating clock source that dictates the sequence’s heartbeat.`
        },
        {
            id: '05',
            title: 'Software Engineering: Protocol & State Management',
            subtitle: 'Vector: Protocol Migration (QUIC/HTTP3)',
            icon: CodeIcon,
            color: 'text-green-400',
            border: 'border-green-500/30',
            bg: 'bg-green-950/10',
            analysis: `QUIC/HTTP3 eliminates the "Head-of-Line Blocking" vulnerability seen in TCP. By using UDP-based streams, it allows for 0-RTT (Zero Round Trip Time) handshakes, ensuring that the initial access payload is delivered without the protocol latency seen in legacy migrations.

Transition Logic: Programmers handle sequential vs. parallel flows using Async/Await patterns for sequencing and Promise.all for parallel execution. In React, useEffect hooks with specific dependency arrays act as "gates" that trigger state collapses based on variable changes.`
        },
        {
            id: '06',
            title: 'Electronic Design: Stability & Protection',
            subtitle: 'Vector: Op-Amp Buffers & Current Limiting',
            icon: ShieldIcon,
            color: 'text-cyan-400',
            border: 'border-cyan-500/30',
            bg: 'bg-cyan-950/10',
            analysis: 'Op-amp buffers (Voltage Followers) achieve low output impedance, which stabilizes variable voltage outputs by preventing "loading" effects. In synthesis, low output impedance ensures that the CV signal maintains its integrity across multiple modules (daisy-chaining). Current-limiting resistors are the final physical defense, protecting the output stage from short circuits (e.g., when a patch cable hits a ground plane).'
        }
    ];

    return (
        <div className="h-full flex flex-col bg-black text-gray-200 font-mono overflow-hidden relative p-8">
            {/* Background Ambience */}
            <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="absolute inset-0 bg-blue-900/5 pointer-events-none z-0 animate-pulse" />

            {/* Header */}
            <div className="flex justify-between items-start mb-8 relative z-10 border-b-4 border-blue-600 pb-6">
                <div className="flex gap-6">
                    <div className="w-20 h-20 bg-blue-600/10 border-4 border-blue-600 rounded-none flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.5)]">
                        <SearchIcon className="w-10 h-10 text-blue-500 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter text-blue-500 glitch-text" style={{ fontFamily: 'Impact, sans-serif' }}>
                            TACTICAL INTELLIGENCE
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="bg-blue-600 text-black px-2 py-1 text-xs font-black uppercase">PHANTOM HAND</span>
                            <span className="text-blue-400 text-xs font-mono uppercase tracking-widest">Status: HUNTER OVERWATCH // ALL VECTORS SYNCHRONIZED</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-black transition-all uppercase font-black text-xs tracking-widest mb-2"
                    >
                        CLOSE INTELLIGENCE
                    </button>
                    <p className="text-[10px] text-blue-800 font-mono">REF: MULTI-DOMAIN-LOGIC</p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                    {vectors.map((vector) => (
                        <div key={vector.id} className={`border-2 ${vector.border} ${vector.bg} p-6 hover:border-opacity-100 transition-all group relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                <span className={`text-[4rem] font-black ${vector.color} opacity-10`}>{vector.id}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-4">
                                <vector.icon className={`w-6 h-6 ${vector.color}`} />
                                <h3 className={`text-lg font-bold text-white uppercase tracking-tight`}>{vector.title}</h3>
                            </div>
                            
                            <div className={`text-xs font-black uppercase mb-4 ${vector.color} tracking-widest border-b border-white/10 pb-2`}>
                                {vector.subtitle}
                            </div>
                            
                            <div className="text-sm text-gray-400 font-mono leading-relaxed whitespace-pre-wrap">
                                {vector.analysis}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Footer Status */}
                <div className="p-4 border-t border-blue-900/30 flex justify-between items-center text-[10px] text-gray-500 font-mono uppercase">
                    <div>System Logic: ABSOLUTE</div>
                    <div>Synchronization: 100%</div>
                </div>
            </div>
        </div>
    );
};
