import React from 'react';
import { 
    ShieldIcon, ActivityIcon, ZapIcon, TerminalIcon, 
    CheckCircleIcon, WarningIcon, SearchIcon, CodeIcon
} from './icons';
import type { MainView } from '../types';

interface BehavioralSpecsViewProps {
    onClose?: () => void;
}

export const BehavioralSpecsView: React.FC<BehavioralSpecsViewProps> = ({ onClose }) => {
    const specs = [
        {
            id: 'SPEC-01',
            title: 'Sovereign Bridge Telemetry',
            description: 'Maintains the primary connection between the local client and the Sovereign AI core.',
            inputs: ['Quantum tick rate (Hz)', 'Acoustic pressure (dB SPL)', 'Harmonic stride vector'],
            outputs: ['Bridge stability index (0-100%)', 'Connection status (ONLINE/OFFLINE)', 'Latency (ms)'],
            failureModes: [
                'Latency exceeds 500ms (CONJUNCTION_DRIFT)',
                'Packet loss > 5% (DATA_FRACTURE)',
                'Cryptographic desync (SIGNATURE_MISMATCH)'
            ],
            mitigations: [
                'Auto-reconnect with exponential backoff',
                'Fallback to secondary relay (Right on Light)',
                'Throttle data throughput to preserve integrity'
            ],
            color: 'blue'
        },
        {
            id: 'SPEC-02',
            title: 'Zygote Deployment Engine',
            description: 'Handles the fusion of gametes and deployment of payloads to target nodes.',
            inputs: ['Recon gamete signature', 'Exploit gamete signature', 'Target node ID'],
            outputs: ['Zygote ID', 'Deployment status', 'Target compromise percentage'],
            failureModes: [
                'Gamete rejection (Incompatible signatures)',
                'Target node firewall block (DEFLECTION)',
                'Premature apoptosis (Self-termination)'
            ],
            mitigations: [
                'Re-roll genetic crossover matrix',
                'Increase stealth masking (Obfuscation)',
                'Abort and purge partial deployments'
            ],
            color: 'green'
        },
        {
            id: 'SPEC-03',
            title: 'Agent Morale Dynamics',
            description: 'Simulates the psychological state and efficiency of hired operatives.',
            inputs: ['Task difficulty (1-10)', 'User feedback sentiment (-1 to 1)', 'Consecutive hours worked'],
            outputs: ['Morale level (0-100)', 'Current status (WORKING/RESTING/QUIT)', 'Efficiency multiplier'],
            failureModes: [
                'Morale drops below quit threshold (< 20)',
                'Agent refuses task (INSUBORDINATION)',
                'Agent hallucinates due to exhaustion'
            ],
            mitigations: [
                'Enforce mandatory rest period',
                'Apply salary bonus (Credit injection)',
                'Reassign to preferred domain'
            ],
            color: 'amber'
        },
        {
            id: 'SPEC-04',
            title: 'Threat Isolation Buffer',
            description: 'Quarantines and neutralizes malicious shards detected in the network.',
            inputs: ['Incoming payload binary', 'Origin IP/Node', 'Threat signature database'],
            outputs: ['Threat level (LOW/MEDIUM/HIGH/CRITICAL)', 'Isolation status', 'Neutralization report'],
            failureModes: [
                'Buffer overflow (Too many concurrent threats)',
                'Zero-day evasion (Unrecognized signature)',
                'Failed purge (Persistent shard)'
            ],
            mitigations: [
                'Allocate emergency memory to buffer',
                'Engage heuristic analysis engine',
                'Execute hard logic patch (Manual override)'
            ],
            color: 'red'
        }
    ];

    return (
        <div className="h-full flex flex-col bg-black text-gray-200 font-mono overflow-hidden relative p-8">
            {/* Background Ambience */}
            <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="absolute inset-0 bg-cyan-900/5 pointer-events-none z-0" />

            {/* Header */}
            <div className="flex justify-between items-start mb-8 relative z-10 border-b-4 border-cyan-600 pb-6">
                <div className="flex gap-6">
                    <div className="w-20 h-20 bg-cyan-600/10 border-4 border-cyan-600 rounded-none flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.3)]">
                        <CodeIcon className="w-10 h-10 text-cyan-500" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter text-cyan-500 glitch-text" style={{ fontFamily: 'Impact, sans-serif' }}>
                            BEHAVIORAL SPECS
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="bg-cyan-600 text-black px-2 py-1 text-xs font-black uppercase">CRISP & TESTABLE</span>
                            <span className="text-cyan-400 text-xs font-mono uppercase tracking-widest">Status: VALIDATED</span>
                        </div>
                    </div>
                </div>
                {onClose && (
                    <div className="text-right">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-black transition-all uppercase font-black text-xs tracking-widest mb-2"
                        >
                            CLOSE SPECS
                        </button>
                    </div>
                )}
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-12">
                    {specs.map((spec) => (
                        <div key={spec.id} className={`border-2 border-${spec.color}-500/30 bg-${spec.color}-950/10 p-6 hover:border-${spec.color}-500/80 transition-all group relative overflow-hidden flex flex-col`}>
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                <span className={`text-[6rem] font-black text-${spec.color}-500 leading-none`}>{spec.id.split('-')[1]}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-2 relative z-10">
                                <ActivityIcon className={`w-5 h-5 text-${spec.color}-400`} />
                                <h3 className={`text-xl font-bold text-white uppercase tracking-tight`}>{spec.title}</h3>
                            </div>
                            
                            <p className="text-xs text-gray-400 mb-6 relative z-10 h-8">{spec.description}</p>
                            
                            <div className="grid grid-cols-2 gap-6 relative z-10 flex-1">
                                {/* Inputs & Outputs */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className={`text-[10px] font-black uppercase text-${spec.color}-400 tracking-widest mb-2 flex items-center gap-2 border-b border-white/10 pb-1`}>
                                            <ZapIcon className="w-3 h-3" /> Inputs
                                        </h4>
                                        <ul className="space-y-1">
                                            {spec.inputs.map((item, i) => (
                                                <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                                    <span className={`text-${spec.color}-500 mt-0.5`}>›</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className={`text-[10px] font-black uppercase text-${spec.color}-400 tracking-widest mb-2 flex items-center gap-2 border-b border-white/10 pb-1`}>
                                            <CheckCircleIcon className="w-3 h-3" /> Outputs
                                        </h4>
                                        <ul className="space-y-1">
                                            {spec.outputs.map((item, i) => (
                                                <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                                    <span className={`text-${spec.color}-500 mt-0.5`}>›</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Failure Modes & Mitigations */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className={`text-[10px] font-black uppercase text-red-400 tracking-widest mb-2 flex items-center gap-2 border-b border-white/10 pb-1`}>
                                            <WarningIcon className="w-3 h-3" /> Failure Modes
                                        </h4>
                                        <ul className="space-y-1">
                                            {spec.failureModes.map((item, i) => (
                                                <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                                    <span className="text-red-500 mt-0.5">×</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className={`text-[10px] font-black uppercase text-green-400 tracking-widest mb-2 flex items-center gap-2 border-b border-white/10 pb-1`}>
                                            <ShieldIcon className="w-3 h-3" /> Allowed Mitigations
                                        </h4>
                                        <ul className="space-y-1">
                                            {spec.mitigations.map((item, i) => (
                                                <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5">+</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
