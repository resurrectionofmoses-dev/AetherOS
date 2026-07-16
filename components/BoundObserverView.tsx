import React, { useState, useEffect } from 'react';
import { 
    ShieldIcon, ServerIcon, DownloadIcon, EyeIcon, 
    TerminalIcon, ChevronDownIcon, CheckCircleIcon, 
    ClipboardIcon, WarningIcon, ZapIcon, LockIcon, XIcon, SearchIcon, PlayIcon
} from './icons';
import { toast } from 'sonner';

interface ForensicPayload {
    targetId: string;
    documentTag: string;
    jurisdiction: string;
    tokenId: string;
    strategy: 'PREFIX' | 'SUFFIX' | 'PARAGRAPH_INTERLEAVE';
    timestamp: string;
}

export const BoundObserverView: React.FC = () => {
    // State matching user's image defaults
    const [targetId, setTargetId] = useState('david_ross@secure-vector.net');
    const [documentTag, setDocumentTag] = useState('source-optimizer-k40');
    const [jurisdiction, setJurisdiction] = useState('Production Server Core');
    const [tokenId, setTokenId] = useState('session_8892_token');
    const [strategy, setStrategy] = useState<'PREFIX' | 'SUFFIX' | 'PARAGRAPH_INTERLEAVE'>('PARAGRAPH_INTERLEAVE');
    
    // Core inputs and outputs
    const [sourceDocument, setSourceDocument] = useState<string>(
`// AetherOS System Core Kernel Optimizer v4.9
// Authored by Grid Administrator
const AetherosCoreValidator = () => {
    const activeSubnets = ["Lattice-Alpha", "Sovereign-Gamma", "Vector-Beta"];
    const consensusQuorum = 0.88;
    
    console.log("[KERNEL] Checking security posture...");
    
    // Core integrity check loop
    for (let subnet of activeSubnets) {
        if (!validateSubnetParity(subnet)) {
            triggerPreemptiveIsolation(subnet);
            return false;
        }
    }
    
    return true;
};`
    );
    
    const [watermarkedOutput, setWatermarkedOutput] = useState<string>('');
    const [isBaking, setIsBaking] = useState(false);
    const [viewInvisibleIndicators, setViewInvisibleIndicators] = useState(true);
    const [decoderInput, setDecoderInput] = useState<string>('');
    const [decodedData, setDecodedData] = useState<ForensicPayload | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanRun, setScanRun] = useState(false);

    // Default template documents for convenience
    const sampleTemplates = {
        code: `// AetherOS System Core Kernel Optimizer v4.9
// Authored by Grid Administrator
const AetherosCoreValidator = () => {
    const activeSubnets = ["Lattice-Alpha", "Sovereign-Gamma", "Vector-Beta"];
    const consensusQuorum = 0.88;
    
    console.log("[KERNEL] Checking security posture...");
    
    // Core integrity check loop
    for (let subnet of activeSubnets) {
        if (!validateSubnetParity(subnet)) {
            triggerPreemptiveIsolation(subnet);
            return false;
        }
    }
    
    return true;
};`,
        notes: `CONFIDENTIAL MEETING MINUTES - PROJECT SOVEREIGN SHIELD
DATE: July 15, 2026
PARTICIPANTS: Admin Christ, Maestro, Ignite Logica
- Reviewed network security breaches and telemetry.
- Confirmed transition to biometric-only authentication for local vaults.
- Approved forensic digital watermarking suite (Bound Observer) for all exported core files.
- Restated penalty of absolute network exile for data leakage.`,
        config: `# AetherOS Subnet Configuration Block
subnet_id: sub_77a9_operational
consensus_threshold: 0.95
pqc_encryption_enabled: true
failsafe_isolation_timeout: 450ms
egress_monitoring_level: OMNI_OBSERVER
allowed_ingress_vectors: [0x03E2, 0x1A4F]`
    };

    // Helper: string to binary string
    const stringToBinary = (str: string): string => {
        return str.split('').map(char => {
            const binary = char.charCodeAt(0).toString(2);
            return '0'.repeat(8 - binary.length) + binary;
        }).join('');
    };

    // Helper: binary string to string
    const binaryToString = (bin: string): string => {
        let str = '';
        for (let i = 0; i < bin.length; i += 8) {
            const byte = bin.slice(i, i + 8);
            if (byte.length === 8) {
                str += String.fromCharCode(parseInt(byte, 2));
            }
        }
        return str;
    };

    // Helper: Encode payload into ZWS characters
    // \u200B = '0', \u200C = '1', \u200D = character separator, \uFEFF = signature boundary
    const encodeZWS = (data: string): string => {
        const binary = stringToBinary(data);
        return '\uFEFF' + binary.split('').map(bit => {
            if (bit === '0') return '\u200B';
            if (bit === '1') return '\u200C';
            return '';
        }).join('\u200D') + '\uFEFF';
    };

    // Helper: Decode ZWS characters back into string
    const decodeZWS = (text: string): string => {
        const startIdx = text.indexOf('\uFEFF');
        if (startIdx === -1) return '';
        const endIdx = text.indexOf('\uFEFF', startIdx + 1);
        if (endIdx === -1) return '';
        
        const zwsSegment = text.slice(startIdx + 1, endIdx);
        const binary = zwsSegment.split('\u200D').map(char => {
            if (char === '\u200B') return '0';
            if (char === '\u200C') return '1';
            return '';
        }).join('');

        try {
            return binaryToString(binary);
        } catch {
            return '';
        }
    };

    // Bake Signature Logic
    const handleBakeSignature = () => {
        if (!targetId.trim() || !documentTag.trim() || !tokenId.trim()) {
            toast.error('CONFIGURATION ERROR', {
                description: 'All watermark metadata fields must be populated.'
            });
            return;
        }

        setIsBaking(true);
        const timestamp = new Date().toISOString();

        // Create metadata object
        const payload: ForensicPayload = {
            targetId,
            documentTag,
            jurisdiction,
            tokenId,
            strategy,
            timestamp
        };

        const jsonString = JSON.stringify(payload);
        const zwsWatermark = encodeZWS(jsonString);

        // Optional visible block to reinforce user visual experience
        const visibleComment = `/* [AetherOS Sovereign Spatial Provenance Block ID: ${tokenId}] */\n`;

        setTimeout(() => {
            let result = '';
            if (strategy === 'PREFIX') {
                result = zwsWatermark + visibleComment + sourceDocument;
            } else if (strategy === 'SUFFIX') {
                result = sourceDocument + '\n' + visibleComment + zwsWatermark;
            } else {
                // Paragraph Interleave - split by lines, inject ZWS at line ends & comments
                const lines = sourceDocument.split('\n');
                const halfway = Math.floor(lines.length / 2);
                
                // Inject hidden code in the middle or end of comments
                const processedLines = lines.map((line, index) => {
                    if (index === halfway) {
                        return line + zwsWatermark + ` // INJECTED_CARRIER_MARKER_${tokenId}`;
                    }
                    return line;
                });
                result = visibleComment + processedLines.join('\n');
            }

            setWatermarkedOutput(result);
            setIsBaking(false);
            
            // Append forensic activity to logs
            try {
                const existingLogsStr = localStorage.getItem('aetheros_tab_activity_logs');
                const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
                const newLog = {
                    id: 'act_' + Math.random().toString(36).substr(2, 9),
                    user: targetId,
                    view: 'bound_observer',
                    action: 'BAKE_FORENSIC_SIGNATURE',
                    timestamp: new Date().toISOString(),
                    details: `Watermark baked for target [${targetId}] with token [${tokenId}] under jurisdiction [${jurisdiction}]. Strategy: ${strategy}`
                };
                localStorage.setItem('aetheros_tab_activity_logs', JSON.stringify([newLog, ...existingLogs]));
            } catch (err) {
                console.error("Failed to append activity logs", err);
            }

            toast.success('SIGNATURE BAKED', {
                description: 'Forensic provenance signature successfully injected into carrier code.'
            });
        }, 1200);
    };

    // Auto-generate Token
    const handleGenerateToken = () => {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setTokenId(`session_${randomNum}_token`);
        toast.info('TOKEN GENERATED', {
            description: `Cryptographic token assigned: session_${randomNum}_token`
        });
    };

    // Forensic Scanner
    const handleRunForensicScanner = () => {
        if (!decoderInput.trim()) {
            toast.error('SCAN ERROR', {
                description: 'Please paste a suspicious watermarked snippet to run analysis.'
            });
            return;
        }

        setIsScanning(true);
        setScanRun(false);
        setDecodedData(null);

        setTimeout(() => {
            const decodedStr = decodeZWS(decoderInput);
            setIsScanning(false);
            setScanRun(true);

            if (decodedStr) {
                try {
                    const parsed: ForensicPayload = JSON.parse(decodedStr);
                    setDecodedData(parsed);
                    toast.success('BREACH DECODED', {
                        description: `Identity of leaker retrieved: ${parsed.targetId}`
                    });

                    // Log successful scan as breach analysis activity
                    const existingLogsStr = localStorage.getItem('aetheros_tab_activity_logs');
                    const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
                    const newLog = {
                        id: 'act_' + Math.random().toString(36).substr(2, 9),
                        user: 'Sovereign Core Inspector',
                        view: 'bound_observer',
                        action: 'RUN_FORENSIC_DECODER_SUCCESS',
                        timestamp: new Date().toISOString(),
                        details: `Leaker identified! Target: ${parsed.targetId}, Document: ${parsed.documentTag}, Token: ${parsed.tokenId}`
                    };
                    localStorage.setItem('aetheros_tab_activity_logs', JSON.stringify([newLog, ...existingLogs]));

                } catch {
                    setDecodedData(null);
                    toast.error('PARSING BREACH', {
                        description: 'ZWS bits were located but the JSON structure is malformed or corrupted.'
                    });
                }
            } else {
                setDecodedData(null);
                toast.warning('SCAN COMPLETE: NO SIGNAL', {
                    description: 'No hidden spatial provenance signatures or zero-width watermark strings detected in the text.'
                });
            }
        }, 1500);
    };

    // Copy to clipboard
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('COPIED TO CLIPBOARD', {
            description: 'Output text copied successfully.'
        });
    };

    // Download text
    const handleDownload = (text: string) => {
        const element = document.createElement("a");
        const file = new Blob([text], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `watermarked_${documentTag || 'document'}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('FILE EXPORTED', {
            description: `Saved as watermarked_${documentTag || 'document'}.txt`
        });
    };

    // Render ZWS indicators visibly
    const renderWithIndicators = (text: string) => {
        if (!text) return <span className="text-gray-600 italic">No output baked yet.</span>;
        
        if (!viewInvisibleIndicators) {
            return <span>{text}</span>;
        }

        // Replace ZWS characters with high-contrast visible blocks
        const chars = text.split('');
        return chars.map((char, index) => {
            if (char === '\u200B') {
                return <span key={index} className="bg-red-900 text-red-200 border border-red-500 rounded px-0.5 text-[8px] mx-0.5" title="ZWS Zero (0)">[0]</span>;
            }
            if (char === '\u200C') {
                return <span key={index} className="bg-emerald-900 text-emerald-200 border border-emerald-500 rounded px-0.5 text-[8px] mx-0.5" title="ZWS One (1)">[1]</span>;
            }
            if (char === '\u200D') {
                return <span key={index} className="bg-blue-900 text-blue-200 border border-blue-500 rounded px-0.5 text-[8px] mx-0.5" title="ZWS Delimiter">|</span>;
            }
            if (char === '\uFEFF') {
                return <span key={index} className="bg-amber-900 text-amber-200 border border-amber-500 rounded px-1 text-[8px] mx-0.5 font-bold" title="ZWS Boundary Marker">⚓</span>;
            }
            return <span key={index}>{char}</span>;
        });
    };

    // Set sample template
    const handleLoadTemplate = (type: 'code' | 'notes' | 'config') => {
        setSourceDocument(sampleTemplates[type]);
        toast.info('TEMPLATE LOADED', {
            description: `Switched to default ${type} carrier.`
        });
    };

    // Initialize state
    useEffect(() => {
        handleBakeSignature();
    }, []);

    return (
        <div className="h-full flex flex-col bg-[#02040a] text-gray-200 font-mono overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-red-650/10 border-4 border-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.25)]">
                        <ShieldIcon className="w-10 h-10 text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-5xl text-white tracking-tighter italic leading-none uppercase">BOUND OBSERVER</h2>
                        <div className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] mt-1 italic flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            Forensic Data Provenance & Leaker Isolation Suite
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 bg-black/60 border border-zinc-800 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                        SEC_LEVEL: <span className="text-red-500 font-black">OMNI_ROOT // UNRESTRICTED</span>
                    </span>
                </div>
            </div>

            {/* Main scrollable body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                
                {/* Introduction banner */}
                <div className="bg-red-950/10 border-2 border-red-500/25 p-5 rounded-2xl flex items-start gap-4 shadow-xl">
                    <WarningIcon className="w-6 h-6 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase text-red-400 tracking-wider">Sovereign Data Provenance & Leak Tracking Protocol</h4>
                        <p className="text-xs text-gray-400 leading-relaxed font-sans">
                            Embed invisible, post-quantum resilient spatial watermarks into sensitive source code, configuration files, or operational notes. By utilizing Zero-Width Space binary bit interleaving (ZWS), the exported payload maintains standard functionality but forensically binds the leaker's ID, document tag, and security jurisdiction permanently. Paste any leaked segment into the <span className="text-emerald-400 font-bold">Forensic Decoder</span> below to expose the leaker immediately.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    
                    {/* Left Panel: Configuration Form */}
                    <div className="aero-panel bg-black/85 border-4 border-black p-6 rounded-3xl flex flex-col gap-5 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                            <div className="flex items-center gap-2">
                                <TerminalIcon className="w-5 h-5 text-red-500" />
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">01A // FORENSIC WATERMARK CONFIGURATION</h3>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleLoadTemplate('code')} className="px-2 py-0.5 text-[8.5px] font-black border border-zinc-800 rounded bg-zinc-950 hover:bg-zinc-900 text-gray-400">CARRIER: CODE</button>
                                <button onClick={() => handleLoadTemplate('notes')} className="px-2 py-0.5 text-[8.5px] font-black border border-zinc-800 rounded bg-zinc-950 hover:bg-zinc-900 text-gray-400">CARRIER: NOTES</button>
                                <button onClick={() => handleLoadTemplate('config')} className="px-2 py-0.5 text-[8.5px] font-black border border-zinc-800 rounded bg-zinc-950 hover:bg-zinc-900 text-gray-400">CARRIER: CONFIG</button>
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-red-500 uppercase tracking-widest block">Leaker Target Address / ID</label>
                                    <input 
                                        type="text"
                                        value={targetId}
                                        onChange={(e) => setTargetId(e.target.value)}
                                        className="w-full bg-black/60 border-2 border-zinc-900 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-all font-bold"
                                        placeholder="e.g., leaker_id@network.net"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-red-500 uppercase tracking-widest block">Source Document Tag</label>
                                    <input 
                                        type="text"
                                        value={documentTag}
                                        onChange={(e) => setDocumentTag(e.target.value)}
                                        className="w-full bg-black/60 border-2 border-zinc-900 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-all font-bold"
                                        placeholder="e.g., core-optimizer-k40"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 relative">
                                    <label className="text-[10px] font-black text-red-500 uppercase tracking-widest block">Security Jurisdiction</label>
                                    <div className="relative">
                                        <select 
                                            value={jurisdiction}
                                            onChange={(e) => setJurisdiction(e.target.value)}
                                            className="w-full appearance-none bg-black/60 border-2 border-zinc-900 rounded-xl px-4 py-2 pr-10 text-xs text-white focus:outline-none focus:border-red-600 transition-all font-bold"
                                        >
                                            <option value="Production Server Core">Production Server Core</option>
                                            <option value="Operational Subnet Beta">Operational Subnet Beta</option>
                                            <option value="Neural Pipeline Layer-4">Neural Pipeline Layer-4</option>
                                            <option value="Intelligence Archive Vault">Intelligence Archive Vault</option>
                                        </select>
                                        <ChevronDownIcon className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-red-500 uppercase tracking-widest block">Lock Signature Token ID</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text"
                                            value={tokenId}
                                            onChange={(e) => setTokenId(e.target.value)}
                                            className="flex-1 bg-black/60 border-2 border-zinc-900 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-all font-bold"
                                            placeholder="e.g., session_8892_token"
                                        />
                                        <button 
                                            onClick={handleGenerateToken}
                                            className="px-3 bg-zinc-900 hover:bg-zinc-800 text-gray-300 rounded-xl border border-zinc-800 text-[10px] font-bold uppercase transition-colors"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Weighting Strategy Row */}
                            <div className="space-y-2 pt-2 border-t border-zinc-900/60">
                                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest block">Injection Structural Weighting Strategy</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['PREFIX', 'SUFFIX', 'PARAGRAPH_INTERLEAVE'] as const).map((strat) => (
                                        <button
                                            key={strat}
                                            onClick={() => setStrategy(strat)}
                                            className={`px-3 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                                strategy === strat
                                                    ? 'bg-red-950/40 border-red-600 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                                                    : 'bg-black/40 border-zinc-900 text-zinc-500 hover:text-zinc-450'
                                            }`}
                                        >
                                            {strat.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Source Document Text Area */}
                            <div className="space-y-1.5 pt-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Source Document (To Watermark)</label>
                                <textarea
                                    value={sourceDocument}
                                    onChange={(e) => setSourceDocument(e.target.value)}
                                    className="w-full h-44 bg-zinc-950 border-2 border-zinc-900 rounded-2xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-red-600 transition-all resize-none custom-scrollbar"
                                    placeholder="Paste source code, configuration file, or text documents..."
                                />
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleBakeSignature}
                            disabled={isBaking}
                            className="w-full py-4 bg-gradient-to-r from-red-650 to-red-750 hover:from-red-600 hover:to-red-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] disabled:opacity-50 active:translate-y-0.5 transition-all flex items-center justify-center gap-3 border-4 border-black font-mono cursor-pointer"
                        >
                            {isBaking ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>BAKING PROVENANCE MATRIX...</span>
                                </>
                            ) : (
                                <>
                                    <ShieldIcon className="w-5 h-5 text-white animate-pulse" />
                                    <span>BAKE SPACIAL PROVENANCE SIGNATURE</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Panel: Output and Leaked Carrier Highlights */}
                    <div className="aero-panel bg-black/85 border-4 border-black p-6 rounded-3xl flex flex-col gap-5 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                            <div className="flex items-center gap-2">
                                <ServerIcon className="w-5 h-5 text-red-500" />
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">01B // FORENSICALLY INJECTED CARRIER OUTPUT</h3>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <button
                                    onClick={() => setViewInvisibleIndicators(!viewInvisibleIndicators)}
                                    className={`p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-all ${viewInvisibleIndicators ? 'bg-red-950/20 text-red-400 border-red-900/40' : 'bg-black text-gray-500'}`}
                                    title="Toggle visible mapping of zero-width cryptographic bits"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleCopyToClipboard(watermarkedOutput)}
                                    className="p-1.5 rounded-lg border border-zinc-800 bg-black hover:bg-zinc-900 text-gray-400 hover:text-white transition-all"
                                    title="Copy watermarked text to clipboard"
                                >
                                    <ClipboardIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDownload(watermarkedOutput)}
                                    className="p-1.5 rounded-lg border border-zinc-800 bg-black hover:bg-zinc-900 text-gray-400 hover:text-white transition-all"
                                    title="Download watermarked document"
                                >
                                    <DownloadIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Metadata Details */}
                        <div className="grid grid-cols-2 gap-4 p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl text-[10px]">
                            <div className="space-y-0.5">
                                <span className="text-gray-500 block uppercase tracking-wider">Carrier Footprint Size</span>
                                <span className="text-white font-bold">{watermarkedOutput.length} Characters / Bytes</span>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-gray-500 block uppercase tracking-wider">Spatial Signature Overhead</span>
                                <span className="text-red-400 font-bold">+{viewInvisibleIndicators ? (watermarkedOutput.length - sourceDocument.length) : 0} bytes fingerprint</span>
                            </div>
                        </div>

                        {/* Output Display Code Block */}
                        <div className="relative flex-1 min-h-[300px] flex flex-col">
                            <div className="w-full flex-1 bg-zinc-950 border-2 border-zinc-900 rounded-2xl p-5 overflow-auto custom-scrollbar font-mono text-xs text-gray-300 whitespace-pre leading-relaxed relative">
                                
                                {/* Overlay "Leaked Carrier Block" indicator mapping like the user photo */}
                                {watermarkedOutput && (
                                    <div className="absolute top-4 right-4 z-20 animate-pulse">
                                        <div className="px-3 py-1.5 bg-red-900/30 border border-red-500 rounded-lg text-[8px] font-black text-red-400 tracking-widest uppercase shadow-[0_0_15px_rgba(239,68,68,0.15)] flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                            LEAKED CARRIER BLOCK
                                        </div>
                                    </div>
                                )}

                                {/* Code Body */}
                                <div className="relative select-all">
                                    {renderWithIndicators(watermarkedOutput)}
                                </div>
                            </div>
                        </div>

                        {/* Floating legend for indicators */}
                        {viewInvisibleIndicators && watermarkedOutput && (
                            <div className="p-3 bg-zinc-950 border border-zinc-900/60 rounded-xl flex flex-wrap gap-4 text-[9px] text-gray-400">
                                <span className="font-bold text-gray-500 uppercase tracking-widest">ZWS Legend:</span>
                                <span className="flex items-center gap-1">
                                    <span className="bg-red-900 text-red-200 border border-red-500 rounded px-0.5">[0]</span> Zero Bit
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="bg-emerald-900 text-emerald-200 border border-emerald-500 rounded px-0.5">[1]</span> One Bit
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="bg-blue-900 text-blue-200 border border-blue-500 rounded px-0.5">|</span> Separator
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="bg-amber-900 text-amber-200 border border-amber-500 rounded px-0.5">⚓</span> Boundary
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Panel: Forensic Breach Decoder / Scanner */}
                <div className="aero-panel bg-black/85 border-4 border-black p-6 rounded-3xl flex flex-col gap-5 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                        <div className="flex items-center gap-2">
                            <SearchIcon className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">02 // FORENSIC ANALYSIS & DECODER MATRIX</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                DECODER CORE: READY
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Paste container */}
                        <div className="lg:col-span-7 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">Paste Suspicious Leak Snippet</label>
                                <button 
                                    onClick={() => {
                                        setDecoderInput(watermarkedOutput);
                                        toast.info('PASTED BAKED OUTPUT', {
                                            description: 'Copied watermarked code from the preview above directly into the scanner.'
                                        });
                                    }}
                                    className="text-[9px] font-bold uppercase text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                                    disabled={!watermarkedOutput}
                                >
                                    Autofill Baked Output
                                </button>
                            </div>
                            <textarea
                                value={decoderInput}
                                onChange={(e) => setDecoderInput(e.target.value)}
                                className="w-full h-44 bg-zinc-950 border-2 border-zinc-900 rounded-2xl p-4 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-600 transition-all resize-none custom-scrollbar"
                                placeholder="Paste the leaked document or file code containing ZWS watermark strings to decode leaker coordinates..."
                            />
                            <button
                                onClick={handleRunForensicScanner}
                                disabled={isScanning}
                                className="py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isScanning ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        <span>ANALYZING FORENSIC TEXT SEGMENTS...</span>
                                    </>
                                ) : (
                                    <>
                                        <PlayIcon className="w-4 h-4 text-black" />
                                        <span>RUN FORENSIC DECODER</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Scanner results output */}
                        <div className="lg:col-span-5 border-2 border-zinc-900 rounded-2xl bg-zinc-950/40 p-5 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3">
                                <TerminalIcon className="w-12 h-12 text-zinc-900 shrink-0" />
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">DECODER SCAN RESULTS</h4>
                                
                                {isScanning && (
                                    <div className="space-y-2 py-4 animate-pulse">
                                        <div className="h-3 bg-zinc-800 rounded w-2/3" />
                                        <div className="h-3 bg-zinc-800 rounded w-1/2" />
                                        <div className="h-3 bg-zinc-800 rounded w-3/4" />
                                    </div>
                                )}

                                {!isScanning && !scanRun && (
                                    <div className="py-8 text-center space-y-2">
                                        <WarningIcon className="w-6 h-6 text-zinc-700 mx-auto animate-pulse" />
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Awaiting Forensic Scan Execution</p>
                                    </div>
                                )}

                                {!isScanning && scanRun && !decodedData && (
                                    <div className="py-8 text-center space-y-2 border-2 border-dashed border-red-950/40 rounded-xl bg-red-950/5 animate-in fade-in">
                                        <XIcon className="w-6 h-6 text-red-500 mx-auto" />
                                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">SCAN FAILURE: NO WATERMARK IDENTIFIED</p>
                                        <p className="text-[9px] text-gray-500 font-sans max-w-xs mx-auto px-4">
                                            The text contains no recognizable spatial provenance signatures or the bits were corrupted.
                                        </p>
                                    </div>
                                )}

                                {!isScanning && scanRun && decodedData && (
                                    <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[9px] font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                                            <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <span>LEAKER TARGET IDENTIFIED WITH 100% PARITY</span>
                                        </div>

                                        <div className="space-y-2.5 text-xs">
                                            <div className="flex justify-between py-1 border-b border-zinc-900">
                                                <span className="text-gray-500 uppercase text-[9px]">Leaker ID:</span>
                                                <span className="text-red-400 font-black tracking-wide">{decodedData.targetId}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-zinc-900">
                                                <span className="text-gray-500 uppercase text-[9px]">Document Tag:</span>
                                                <span className="text-white font-bold">{decodedData.documentTag}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-zinc-900">
                                                <span className="text-gray-500 uppercase text-[9px]">Jurisdiction:</span>
                                                <span className="text-white font-bold">{decodedData.jurisdiction}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-zinc-900">
                                                <span className="text-gray-500 uppercase text-[9px]">Token ID:</span>
                                                <span className="text-blue-400 font-mono font-bold">{decodedData.tokenId}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-zinc-900">
                                                <span className="text-gray-500 uppercase text-[9px]">Bake Strategy:</span>
                                                <span className="text-gray-300 font-bold">{decodedData.strategy.replace('_', ' ')}</span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span className="text-gray-500 uppercase text-[9px]">Baked Timestamp:</span>
                                                <span className="text-gray-400 text-[10px] font-mono">{new Date(decodedData.timestamp).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-3 border-t border-zinc-900/60 flex justify-between items-center text-[8px] text-gray-600">
                                <span>SIGNATURES PARSED ON THE COG_MATRIX</span>
                                <span>GRID PROTOCOL 0x03E2</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900 border-t-8 border-black flex justify-between items-center z-40 px-12">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">Bound Observer Engine: ACTIVE</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <TerminalIcon className="w-4 h-4 text-gray-800" />
                    <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.2em]">Forensic Parity Enforced.</p>
                </div>
            </div>
        </div>
    );
};
