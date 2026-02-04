import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { DeviceLinkStatus, LinkedDevice, SavedModule } from '../types';
import { ShareIcon, SpinnerIcon, CheckCircleIcon, PackageIcon, WarningIcon, ActivityIcon, ZapIcon, SignalIcon, ShieldIcon, TerminalIcon, WrenchIcon, CodeIcon, BroadcastIcon, SearchIcon, BotIcon, UserIcon } from './icons';

interface DeviceLinkViewProps {
  status: DeviceLinkStatus;
  device: LinkedDevice | null;
  onConnect: () => void;
  onDisconnect: () => void;
  lastModule: SavedModule | null;
}

const DISCOVERY_LOGS = [
    "Initializing Bluetooth radio stack...",
    "Scanning 2.4GHz spectrum for Operator signatures...",
    "Found nearby device: Operator-PADD-X1 (Signal: -65dBm)",
    "Found nearby device: Android-Aether-Link (Signal: -72dBm)",
    "Discovery complete. Select a target."
];

const HANDSHAKE_LOGS = [
    "Establishing encrypted tunnel...",
    "Synchronizing biometric keys...",
    "Verifying pairing authority...",
    "Syncing kernel state...",
    "Link stable. Buffering direct stream."
];

interface FoundDevice {
    id: string;
    name: string;
    type: 'Phone' | 'PADD' | 'Unknown';
    signal: number;
    mac: string;
}

const MOCK_DEVICES: FoundDevice[] = [
    { id: '1', name: 'Operator-PADD-X1', type: 'PADD', signal: -65, mac: '8A:2B:9F:44:E1:02' },
    { id: '2', name: 'Aether-Mobile-Node', type: 'Phone', signal: -78, mac: 'CF:11:90:BB:32:98' },
    { id: '3', name: 'Unknown Device', type: 'Unknown', signal: -92, mac: '00:00:00:00:00:00' },
];

const DisconnectedState: React.FC<{ 
    onStartScan: () => void; 
    onManualPair: (mac: string) => void;
    isScanning: boolean;
}> = ({ onStartScan, onManualPair, isScanning }) => {
    const [macInput, setMacInput] = useState('');

    const handleMacChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.toUpperCase().replace(/[^0-9A-F:]/g, '');
        if (val.length > 2 && val[2] !== ':') val = val.slice(0, 2) + ':' + val.slice(2);
        if (val.length > 5 && val[5] !== ':') val = val.slice(0, 5) + ':' + val.slice(5);
        if (val.length > 8 && val[8] !== ':') val = val.slice(0, 8) + ':' + val.slice(8);
        if (val.length > 11 && val[11] !== ':') val = val.slice(0, 11) + ':' + val.slice(11);
        if (val.length > 14 && val[14] !== ':') val = val.slice(0, 14) + ':' + val.slice(14);
        setMacInput(val.slice(0, 17));
    };

    return (
        <div className="text-center fade-in max-w-md w-full">
            <div className="relative inline-block mb-6">
                <ShareIcon className="w-20 h-20 mx-auto text-gray-600" />
                <div className="absolute inset-0 bg-violet-500/10 blur-2xl rounded-full" />
                {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 border-4 border-cyan-500/30 rounded-full animate-ping" />
                        <div className="w-16 h-16 border-4 border-cyan-500/50 rounded-full animate-ping [animation-delay:0.5s]" />
                        <SpinnerIcon className="w-10 h-10 text-cyan-400 absolute" />
                    </div>
                )}
            </div>
            
            <h3 className="text-3xl font-comic-header text-white mb-2 uppercase italic tracking-tighter">Bluetooth Offline</h3>
            <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                No mobile device linked. Initiate discovery to find nearby Operator hardware or input a specific MAC address.
            </p>

            <div className="space-y-4">
                <button 
                    onClick={onStartScan} 
                    disabled={isScanning}
                    className="comic-button px-8 py-4 text-xl w-full flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:bg-gray-700 transition-all"
                >
                    <SearchIcon className="w-6 h-6" />
                    {isScanning ? 'SCANNING SPECTRUM...' : 'SCAN FOR DEVICES'}
                </button>

                <div className="relative py-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-black" /></div>
                    <div className="relative flex justify-center text-[10px]"><span className="bg-[#050510] px-3 text-gray-600 font-black uppercase tracking-widest">or direct address</span></div>
                </div>

                <div className="comic-panel bg-black/60 p-4 border-violet-900/50 group">
                    <input 
                        type="text"
                        value={macInput}
                        onChange={handleMacChange}
                        placeholder="XX:XX:XX:XX:XX:XX"
                        className="w-full bg-gray-900 border-2 border-black rounded p-3 font-mono text-xl text-center text-white placeholder:text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all uppercase"
                    />
                    <button 
                        onClick={() => onManualPair(macInput)}
                        disabled={macInput.length !== 17 || isScanning}
                        className="w-full mt-3 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase text-xs rounded disabled:bg-gray-700 transition-all"
                    >
                        Target Handshake
                    </button>
                </div>
            </div>
        </div>
    );
};

const DiscoveryState: React.FC<{ 
    onDeviceSelect: (device: FoundDevice) => void; 
    onRetry: () => void;
}> = ({ onDeviceSelect, onRetry }) => {
    const [currentLog, setCurrentLog] = useState(0);
    const [showDevices, setShowDevices] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentLog(prev => {
                if (prev < DISCOVERY_LOGS.length - 1) return prev + 1;
                setShowDevices(true);
                clearInterval(interval);
                return prev;
            });
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center max-w-md w-full fade-in">
            <h3 className="font-comic-header text-3xl text-white mb-6 uppercase italic">Scanning Radios</h3>
            
            <div className="bg-black/80 border-2 border-black rounded-lg p-4 font-mono text-[10px] text-left mb-6 h-32 overflow-y-auto custom-scrollbar">
                {DISCOVERY_LOGS.slice(0, currentLog + 1).map((log, i) => (
                    <div key={i} className="text-cyan-500 animate-in slide-in-from-left-2 mb-1 flex gap-2">
                        <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                        <span>{log}</span>
                    </div>
                ))}
                {!showDevices && <div className="animate-pulse text-cyan-400">» STANDBY...</div>}
            </div>

            {showDevices && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-left mb-1">Detected Signatures:</p>
                    {MOCK_DEVICES.map((device) => (
                        <button 
                            key={device.id}
                            onClick={() => onDeviceSelect(device)}
                            className="w-full flex items-center justify-between p-4 bg-gray-800 border-2 border-black rounded-xl hover:bg-cyan-900/40 hover:border-cyan-500 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-900 rounded border border-gray-700 group-hover:border-cyan-500 transition-colors">
                                    <SignalIcon className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-white uppercase text-sm">{device.name}</p>
                                    <p className="text-[10px] text-gray-500 font-mono">{device.mac}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-black ${device.signal > -70 ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {device.signal}dBm
                                </span>
                                <p className="text-[9px] text-gray-600 font-bold">LINKABLE</p>
                            </div>
                        </button>
                    ))}
                    <button onClick={onRetry} className="text-[10px] text-gray-500 hover:text-white uppercase font-black mt-4 border-b border-dashed border-gray-700">Rescan Spectrum</button>
                </div>
            )}
        </div>
    );
};

const PairingRequestState: React.FC<{ 
    device: FoundDevice; 
    onConfirm: () => void; 
    onCancel: () => void;
}> = ({ device, onConfirm, onCancel }) => {
    const pairingCode = useMemo(() => Math.floor(100000 + Math.random() * 900000), []);
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(c => (c > 0 ? c - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="text-center max-w-sm mx-auto w-full fade-in">
            <div className="bg-violet-900/20 border-2 border-violet-500/50 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-violet-500 animate-pulse" />
                <h3 className="font-comic-header text-3xl text-white mb-2 uppercase italic">Pairing Request</h3>
                <p className="text-gray-400 text-xs mb-6 font-mono">Device: <span className="text-violet-400">{device.name}</span></p>

                <div className="bg-black/60 border-2 border-black rounded-xl p-6 mb-6">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-black">Verification Code</p>
                    <div className="text-5xl font-black text-white tracking-[0.2em]">{pairingCode}</div>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] text-gray-500 leading-tight">
                        Confirm this code matches the display on your mobile device. Authentication expires in <span className="text-violet-400 font-bold">{countdown}s</span>.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={onCancel} className="comic-button flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold uppercase text-sm">Deny</button>
                        <button onClick={onConfirm} className="comic-button flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase text-sm shadow-[0_0_15px_rgba(139,92,246,0.5)]">Pair & Link</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HandshakeState: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [logIdx, setLogIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 500);
                    return 100;
                }
                return p + 1;
            });
        }, 30);

        const logInt = setInterval(() => {
            setLogIdx(l => (l < HANDSHAKE_LOGS.length - 1 ? l + 1 : l));
        }, 600);

        return () => {
            clearInterval(interval);
            clearInterval(logInt);
        };
    }, [onComplete]);

    return (
        <div className="text-center max-sm mx-auto w-full fade-in">
            <h3 className="font-comic-header text-3xl text-white mb-6 uppercase italic">Finalizing Link</h3>
            <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                <div 
                    className="absolute inset-0 border-4 border-cyan-500 rounded-full transition-all duration-300"
                    style={{ clipPath: `inset(0 0 ${100 - progress}% 0)` }}
                />
                <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-white font-mono">
                    {progress}%
                </div>
            </div>
            <div className="bg-black/50 p-4 border-2 border-black rounded-lg text-[10px] font-mono text-cyan-400 flex items-center gap-3">
                <SpinnerIcon className="w-4 h-4" />
                <span>{HANDSHAKE_LOGS[logIdx]}</span>
            </div>
        </div>
    );
};

const ConnectedState: React.FC<{ 
    device: LinkedDevice; 
    onDisconnect: () => void; 
    lastModule: SavedModule | null; 
}> = ({ device, onDisconnect, lastModule }) => {
    const [note, setNote] = useState('');
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleSendNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim()) return;
        setFeedback(`Data packet transmitted to ${device.name}.`);
        setNote('');
        setTimeout(() => setFeedback(null), 3000);
    };
    
    return (
        <div className="flex flex-col h-full w-full max-w-lg mx-auto fade-in p-2">
            <div className="text-center p-6 bg-slate-900 border-4 border-black rounded-xl shadow-[8px_8px_0_0_#000] relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-black px-4 py-1 uppercase tracking-widest shadow-lg">Link: Secure</div>
                <div className="w-20 h-20 bg-green-900/20 border-4 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                    <CheckCircleIcon className="w-12 h-12 text-green-500"/>
                    <div className="absolute inset-0 bg-green-500/10 blur-xl animate-pulse" />
                </div>
                <h3 className="text-3xl font-comic-header text-white mb-1 uppercase italic tracking-tighter">Sync Active</h3>
                <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-gray-400 font-black uppercase">
                    <SignalIcon className="w-3 h-3 text-cyan-400" />
                    <span>{device.name}</span>
                    <span className="text-gray-700">|</span>
                    <span className="text-green-500">Stability: 99.8%</span>
                </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="comic-panel bg-gray-800 p-4 relative border-sky-900/50">
                     <h4 className="font-comic-header text-xl text-sky-400 mb-3 uppercase flex items-center gap-2 italic">
                        <TerminalIcon className="w-5 h-5" /> Remote Terminal
                     </h4>
                     <form onSubmit={handleSendNote} className="space-y-3">
                        <textarea 
                            value={note} 
                            onChange={e => setNote(e.target.value)} 
                            className="w-full h-28 bg-black/60 border-2 border-black rounded-lg p-4 text-sm text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-mono" 
                            placeholder="Type a remote kernel command..."
                        />
                        <div className="flex justify-between items-center h-8">
                            {feedback ? <span className="text-green-400 text-[10px] font-black uppercase tracking-widest animate-in fade-in">{feedback}</span> : <div/>}
                            <button type="submit" disabled={!note.trim()} className="comic-button bg-sky-600 hover:bg-sky-500 text-white px-8 py-2 text-xs font-black uppercase tracking-widest">
                                Send Payload
                            </button>
                        </div>
                     </form>
                </div>

                <div className="comic-panel bg-gray-800 p-4 border-violet-900/50">
                     <h4 className="font-comic-header text-xl text-violet-400 mb-3 uppercase flex items-center gap-2 italic">
                        <PackageIcon className="w-5 h-5" /> OTA Module Injector
                     </h4>
                     <div className="bg-black/40 p-3 rounded-lg border-2 border-black flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-gray-900 rounded border-2 border-gray-700 shadow-lg">
                                <PackageIcon className="w-5 h-5 text-violet-500 flex-shrink-0" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-black text-gray-300 uppercase" title={lastModule?.name || 'No Module'}>
                                    {lastModule?.name || 'NO MODULES STAGED'}
                                </p>
                                <span className="text-[9px] text-gray-600 font-mono font-black uppercase">READY FOR WIRELESS SYNC</span>
                            </div>
                        </div>
                         <button disabled={!lastModule} className="comic-button bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 text-[10px] font-black uppercase flex-shrink-0">
                            INJECT
                         </button>
                     </div>
                </div>
            </div>

            <div className="mt-8">
                <button onClick={onDisconnect} className="comic-button w-full bg-red-950/20 hover:bg-red-600 text-red-600 hover:text-white py-4 border-red-600/50 uppercase font-black tracking-[0.2em] text-xs transition-all">
                    TERMINATE LINK
                </button>
            </div>
        </div>
    );
};

export const DeviceLinkView: React.FC<DeviceLinkViewProps> = ({ status, device, onConnect, onDisconnect, lastModule }) => {
    const [internalState, setInternalState] = useState<'idle' | 'scanning' | 'pairing' | 'handshake'>('idle');
    const [selectedDevice, setSelectedDevice] = useState<FoundDevice | null>(null);

    const handleStartScan = () => {
        setInternalState('scanning');
    };

    const handleManualPair = (mac: string) => {
        const dev: FoundDevice = { id: 'manual', name: 'Direct Link Device', type: 'PADD', signal: -50, mac };
        setSelectedDevice(dev);
        setInternalState('pairing');
    };

    const handlePairSelect = (dev: FoundDevice) => {
        setSelectedDevice(dev);
        setInternalState('pairing');
    };

    const handleConfirmPairing = () => {
        setInternalState('handshake');
    };

    const handleHandshakeComplete = () => {
        onConnect();
        setInternalState('idle');
    };

    const renderContent = () => {
        if (status === 'connected' && device) {
            return <ConnectedState device={device} onDisconnect={onDisconnect} lastModule={lastModule} />;
        }
        
        switch (internalState) {
            case 'scanning':
                return <DiscoveryState onDeviceSelect={handlePairSelect} onRetry={() => setInternalState('scanning')} />;
            case 'pairing':
                return selectedDevice ? <PairingRequestState device={selectedDevice} onConfirm={handleConfirmPairing} onCancel={() => setInternalState('idle')} /> : null;
            case 'handshake':
                return <HandshakeState onComplete={handleHandshakeComplete} />;
            default:
                return <DisconnectedState onStartScan={handleStartScan} onManualPair={handleManualPair} isScanning={false} />;
        }
    }
    
    return (
        <div className="h-full flex flex-col bg-[#050510] rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            <div className="p-4 border-b-4 border-black sticky top-0 z-10 bg-slate-900 rounded-t-lg shadow-[0_4px_0_0_#000]">
                <h2 className="font-comic-header text-4xl text-white italic tracking-tighter">DEVICE LINK</h2>
                <div className="flex items-center gap-2 -mt-1">
                    <span className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em]">Synchro Radio Protocol v4.5</span>
                    <div className={`w-1 h-1 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.08)_0%,_transparent_70%)] pointer-events-none" />
                {renderContent()}
            </div>
        </div>
    );
};
