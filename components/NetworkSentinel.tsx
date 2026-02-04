
import React, { useState, useEffect, useRef } from 'react';
import { TerminalIcon, ShieldIcon, ActivityIcon, SearchIcon, ZapIcon, WarningIcon, SpinnerIcon, CheckCircleIcon, CodeIcon, BotIcon } from './icons';
import { neutralizeThreat } from '../services/geminiService';
import type { NetworkNode as NetworkNodeType, NeutralizationPlan } from '../types';

interface NetworkNodeProps {
    node: NetworkNodeType;
    isScanning: boolean;
    onNeutralize: (node: NetworkNodeType) => void;
}

const NetworkNode: React.FC<NetworkNodeProps> = ({ node, isScanning, onNeutralize }) => {
    const isVulnerable = node.status === 'VULNERABLE';
    const isNeutralizing = node.status === 'NEUTRALIZING';
    const isSecured = node.status === 'SECURED';
    const isFailed = node.status === 'FAILED';

    const getStatusIcon = () => {
        if (isNeutralizing) return <SpinnerIcon className="w-5 h-5 text-amber-400 animate-spin" />;
        if (isSecured) return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        if (isFailed) return <WarningIcon className="w-5 h-5 text-red-500" />;
        if (isVulnerable) return <WarningIcon className="w-5 h-5 text-red-500 animate-pulse" />;
        return <ZapIcon className="w-5 h-5 text-blue-400" />;
    };

    const getBorderColor = () => {
        if (isNeutralizing) return 'border-amber-500';
        if (isSecured) return 'border-green-500';
        if (isFailed) return 'border-red-600';
        if (isVulnerable) return 'border-red-500';
        return 'border-blue-500/50';
    };

    const getBgColor = () => {
        if (isNeutralizing) return 'bg-amber-900/20';
        if (isSecured) return 'bg-green-900/20';
        if (isFailed) return 'bg-red-900/20';
        if (isVulnerable) return 'bg-red-900/20';
        return 'bg-blue-900/10';
    };

    return (
        <div className={`p-4 rounded-xl border-2 text-center transition-all duration-300 relative overflow-hidden ${getBorderColor()} ${getBgColor()}`}>
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
            
            <div className="relative z-10">
                {getStatusIcon()}
                <p className="text-[10px] font-bold text-gray-400 mt-2">{node.ip}</p>
                <p className={`text-sm font-black uppercase truncate ${isSecured ? 'text-green-300' : isFailed ? 'text-red-300' : 'text-white'}`}>{node.label}</p>
                <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${node.threatLevel > 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${node.threatLevel}%` }}></div>
                </div>
                
                {isVulnerable && !isScanning && (
                    <button 
                        onClick={() => onNeutralize(node)}
                        className="vista-button w-full mt-4 py-2 bg-red-600/60 text-white font-black uppercase text-[9px] rounded-lg flex items-center justify-center gap-1 shadow-[4px_4px_0_0_#000] animate-pulse"
                    >
                        <ShieldIcon className="w-4 h-4" /> NEUTRALIZE HEURISTIC
                    </button>
                )}
                {isNeutralizing && (
                    <p className="text-[9px] text-amber-400 font-black uppercase mt-4 animate-pulse">SYNTHESIZING PLAN...</p>
                )}
                {node.neutralizationPlan && (isSecured || isFailed) && (
                    <div className="mt-4 p-2 bg-black/40 border border-white/5 rounded-lg text-left">
                        <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Maestro's Directive:</p>
                        <p className={`text-[9px] font-mono ${isSecured ? 'text-green-400' : 'text-red-400'}`}>{node.neutralizationPlan.statusUpdate}</p>
                        <p className="text-[8px] text-gray-600 uppercase font-black mt-2">Signature: <span className="text-gray-400">{node.neutralizationPlan.signature}</span></p>
                    </div>
                )}
            </div>
        </div>
    );
}

export const NetworkSentinel: React.FC = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [logs, setLogs] = useState<string[]>(["[KALI-SENTINEL] v4.2.0-STABLE initialization...", "[OK] Ethernet interface eth0 bound."]);
    const [nodes, setNodes] = useState<NetworkNodeType[]>([
        { id: '1', ip: '192.168.1.1', status: 'ACTIVE', label: 'Mainframe Gateway', threatLevel: 2 },
        { id: '2', ip: '10.0.0.15', status: 'VULNERABLE', label: 'Operator-PADD', threatLevel: 85 },
        { id: '3', ip: '172.16.2.99', status: 'SHADOW', label: 'Unknown Peer', threatLevel: 44 },
    ]);
    const logEndRef = useRef<HTMLDivElement>(null);

    const addLog = (msg: string, color: string = 'text-gray-400') => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] <span style="color:${color};">${msg}</span>`]);
    };

    const startScan = () => {
        setIsScanning(true);
        addLog("[!] Initiating stealth packet injection...", 'yellow');
        addLog("[*] Listening on promiscuous mode...", 'orange');
        
        setTimeout(() => {
            setIsScanning(false);
            addLog("[SUCCESS] Full network topography mapped.", 'green');
            addLog("[INFO] Found 1 critical vulnerability in AetherLink.", 'red');
            setNodes(prev => prev.map(n => n.id === '2' ? {...n, status: 'VULNERABLE', threatLevel: 90} : n));
        }, 4000);
    };

    const handleNeutralizeNode = async (nodeToNeutralize: NetworkNodeType) => {
        addLog(`[MAESTRO] Initiating heuristic neutralization for ${nodeToNeutralize.label} (${nodeToNeutralize.ip})...`, 'cyan');
        setNodes(prev => prev.map(n => n.id === nodeToNeutralize.id ? {...n, status: 'NEUTRALIZING'} : n));

        const threatContext = { ip: nodeToNeutralize.ip, vulnerability: 'Unknown vulnerability', threatLevel: nodeToNeutralize.threatLevel };
        const result = await neutralizeThreat(threatContext);

        if (result) {
            addLog(`[SYNTHESIS] Plan for ${nodeToNeutralize.ip} synthesized. Signature: ${result.signature}`, 'lime');
            setNodes(prev => prev.map(n => n.id === nodeToNeutralize.id ? {
                ...n,
                status: 'SECURED', // Simulate success for now
                threatLevel: 0, // Reset threat level
                neutralizationPlan: result
            } : n));
            addLog(`[SUCCESS] ${result.statusUpdate}`, 'green');
        } else {
            setNodes(prev => prev.map(n => n.id === nodeToNeutralize.id ? {...n, status: 'FAILED', neutralizationPlan: { plan: [], signature: 'FAIL_0x0000', statusUpdate: 'Neutralization failed. Manual intervention required.' }} : n));
            addLog(`[ERROR] Neutralization failed for ${nodeToNeutralize.ip}. Manual review.`, 'red');
        }
    };

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="h-full flex flex-col bg-black/60 p-6 space-y-6 overflow-hidden aero-panel">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-comic-header text-green-400 kali-glow">NETWORK SENTINEL</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Kali Linux Tested | Security Auditor</p>
                </div>
                <button 
                    onClick={startScan}
                    disabled={isScanning}
                    className="vista-button px-6 py-2 rounded-lg bg-green-900/40 text-green-400 font-bold flex items-center gap-2"
                >
                    {isScanning ? <SpinnerIcon className="w-5 h-5" /> : <SearchIcon className="w-5 h-5" />}
                    {isScanning ? 'SCANNING...' : 'STEALTH SCAN'}
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                {/* Visual Node Map */}
                <div className="flex-1 bg-black/40 rounded-xl border border-green-500/20 p-4 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(var(--kali-green) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 relative z-10">
                        {nodes.map(node => (
                            <NetworkNode key={node.id} node={node} isScanning={isScanning} onNeutralize={handleNeutralizeNode} />
                        ))}
                    </div>
                </div>

                {/* Live Logs */}
                <div className="lg:w-1/3 bg-black/80 rounded-xl border border-gray-800 p-4 flex flex-col overflow-hidden font-mono text-xs">
                    <div className="flex items-center gap-2 text-gray-500 border-b border-gray-800 pb-2 mb-2">
                        <TerminalIcon className="w-4 h-4" />
                        <span>CONSOLE_FEED: /dev/pts/0</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                        {logs.map((log, i) => (
                            <div key={i} className="animate-in slide-in-from-left-2" dangerouslySetInnerHTML={{ __html: log }} />
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-900/40 rounded-lg border border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <ShieldIcon className="w-8 h-8 text-blue-400" />
                    <div>
                        <p className="text-sm font-bold text-white uppercase">System Integrity: 98.4%</p>
                        <p className="text-[10px] text-gray-500 font-mono">Kernel 5.15.0-kali1-amd64 | No intrusions detected.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                    <span className="text-[10px] font-bold text-green-500 uppercase">Secure Link</span>
                </div>
            </div>
        </div>
    );
};
