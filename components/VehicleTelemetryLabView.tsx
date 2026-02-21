
import React, { useState, useEffect, useRef } from 'react';
import { 
    SteeringWheelIcon, ActivityIcon, ZapIcon, GaugeIcon, SpinnerIcon, 
    ShieldIcon, TerminalIcon, LogicIcon, CheckCircleIcon, WarningIcon, 
    SignalIcon, FireIcon, SearchIcon, CodeIcon
} from './icons';
import type { LabComponentProps } from '../types';

const INITIAL_SCHEMA = `{
  "vdm_frame": {
    "obd_pid": "0x0C",
    "label": "Engine RPM",
    "unit": "RPM",
    "byte_size": 2,
    "conduction_rag": "BLUE_RAG_OFFSET"
  },
  "thermal_shard": {
    "obd_pid": "0x05",
    "label": "Intake Temp",
    "unit": "C",
    "scaling": "X-40"
  },
  "conjunction_metadata": {
    "source": "Maestro_Logic_Core",
    "formula": "sum(reedles) / PB_S",
    "purity_threshold": 0.99
  }
}`;

export const VehicleTelemetryLabView: React.FC<LabComponentProps> = ({ 
  labName = "VEHICLE TELEMETRY", 
  labIcon: LabIcon = SteeringWheelIcon, 
  labColor = "text-cyan-400", 
  description = "Acquire and buffer real-time vehicle metrics via OBD-II protocol." 
}) => {
  const [rpm, setRpm] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [bufferSaturation, setBufferSaturation] = useState(0);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [linkStatus, setLinkStatus] = useState<'DISCONNECTED' | 'HANDSHAKING' | 'CONNECTED'>('DISCONNECTED');
  const [packets, setPackets] = useState<string[]>([]);
  const [schemaText, setSchemaText] = useState(INITIAL_SCHEMA);
  const [isCompiling, setIsCompiling] = useState(false);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: number;
    if (isAcquiring && linkStatus === 'CONNECTED') {
      interval = window.setInterval(() => {
        setRpm(750 + Math.floor(Math.random() * 5000));
        setSpeed(prev => Math.max(0, Math.min(120, prev + (Math.random() - 0.4) * 5)));
        setBufferSaturation(prev => Math.min(100, prev + Math.random() * 2));
        
        const hexAddr = "0x" + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
        const hexVal = Math.floor(Math.random() * 0xFF).toString(16).toUpperCase().padStart(2, '0');
        setPackets(prev => [`[OBD] ${hexAddr}: DATA_BYTE_${hexVal} [ACK]`, ...prev].slice(0, 10));
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isAcquiring, linkStatus]);

  const toggleLink = () => {
    if (linkStatus === 'CONNECTED') {
      setLinkStatus('DISCONNECTED');
      setIsAcquiring(false);
      setRpm(0);
      setSpeed(0);
    } else {
      setLinkStatus('HANDSHAKING');
      setPackets(prev => [`[HANDSHAKE] Initializing ISO 15765-4 CAN...`, ...prev]);
      setTimeout(() => {
        setLinkStatus('CONNECTED');
        setPackets(prev => [`[SUCCESS] ELM327 Interface Found. Sig: 0x03E2`, ...prev]);
      }, 1500);
    }
  };

  const handleCompileSchema = () => {
      setIsCompiling(true);
      setPackets(prev => [`[SCHEMA] Validating Forensic Shards...`, ...prev]);
      setTimeout(() => {
          setIsCompiling(false);
          setPackets(prev => [`[OK] Schema Linked to Conjunction Hub.`, ...prev]);
      }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-[#020508] overflow-hidden font-mono text-cyan-100 selection:bg-cyan-500/30">
      {/* Header */}
      <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-xl z-20">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-cyan-500/10 border-4 border-cyan-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-cyan-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={toggleLink}
                className={`px-6 py-3 rounded-2xl border-4 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${linkStatus === 'CONNECTED' ? 'bg-red-600 text-white' : linkStatus === 'HANDSHAKING' ? 'bg-amber-500 text-black animate-pulse' : 'bg-green-600 text-black'}`}
            >
                {linkStatus === 'CONNECTED' ? 'TERMINATE LINK' : linkStatus === 'HANDSHAKING' ? 'SYNCING...' : 'ESTABLISH OBD-II'}
            </button>
            <button 
                onClick={() => setIsAcquiring(!isAcquiring)}
                disabled={linkStatus !== 'CONNECTED'}
                className={`px-6 py-3 rounded-2xl border-4 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all disabled:opacity-30 ${isAcquiring ? 'bg-cyan-400 text-black animate-pulse' : 'bg-zinc-800 text-gray-500'}`}
            >
                {isAcquiring ? 'STREAMING...' : 'START ACQUISITION'}
            </button>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto custom-scrollbar">
        
        {/* Real-Time Gauges */}
        <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="aero-panel bg-black/80 border-4 border-black p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-[12px_12px_0_0_#000]">
                    <GaugeIcon className="absolute -right-4 -bottom-4 w-32 h-32 opacity-5 text-cyan-500" />
                    <p className="text-[10px] text-cyan-900 font-black uppercase tracking-[0.5em] mb-4">Rotational Resonance</p>
                    <div className="text-8xl font-black text-white wisdom-glow tracking-tighter leading-none">
                        {rpm}<span className="text-xl text-cyan-900 ml-2">RPM</span>
                    </div>
                    <div className="w-full mt-6 h-2 bg-gray-900 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_15px_cyan]" style={{ width: `${(rpm/6000)*100}%` }} />
                    </div>
                </div>

                <div className="aero-panel bg-black/80 border-4 border-black p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-[12px_12px_0_0_#000]">
                    <SignalIcon className="absolute -right-4 -bottom-4 w-32 h-32 opacity-5 text-green-500" />
                    <p className="text-[10px] text-green-900 font-black uppercase tracking-[0.5em] mb-4">Kinetic Velocity</p>
                    <div className="text-8xl font-black text-white wisdom-glow tracking-tighter leading-none">
                        {Math.floor(speed)}<span className="text-xl text-green-900 ml-2">MPH</span>
                    </div>
                    <div className="w-full mt-6 h-2 bg-gray-900 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-green-500 transition-all duration-300 shadow-[0_0_15px_green]" style={{ width: `${(speed/120)*100}%` }} />
                    </div>
                </div>
            </div>

            {/* Buffering Station */}
            <div className="aero-panel bg-black/60 border-4 border-black p-8 flex flex-col shadow-[12px_12px_0_0_#000]">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h3 className="font-comic-header text-3xl text-violet-400 uppercase italic flex items-center gap-3">
                        <ActivityIcon className="w-6 h-6" /> Data Buffering Station
                    </h3>
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Protocol: 0x03E2_REEDLE</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase mb-2">
                                <span>Buffer Saturation</span>
                                <span className={bufferSaturation > 80 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}>{bufferSaturation.toFixed(1)}%</span>
                            </div>
                            <div className="h-4 bg-black border-2 border-black rounded-lg overflow-hidden p-[1px]">
                                <div className={`h-full transition-all duration-500 ${bufferSaturation > 80 ? 'bg-red-600' : 'bg-violet-600'}`} style={{ width: `${bufferSaturation}%` }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                                <span className="text-[7px] text-gray-600 font-black uppercase block mb-1">Queue Depth</span>
                                <span className="text-lg font-bold text-white">482 PKTS</span>
                            </div>
                            <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                                <span className="text-[7px] text-gray-600 font-black uppercase block mb-1">Drift Compensator</span>
                                <span className="text-lg font-bold text-green-500">ACTIVE</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setBufferSaturation(0)}
                            className="w-full py-2 bg-violet-900/40 hover:bg-violet-600 text-violet-400 hover:text-white border border-violet-500/30 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                        >
                            Flush Shard Cache
                        </button>
                    </div>

                    <div className="bg-black/80 rounded-xl border-2 border-black p-4 font-mono text-[9px] h-48 overflow-y-auto custom-scrollbar">
                        <div className="text-violet-500 mb-2 border-b border-violet-900/30 pb-1">» BUFFER_INGRESS_STREAM</div>
                        {packets.length === 0 ? (
                            <div className="h-full flex items-center justify-center opacity-20 italic">Awaiting conduction signals...</div>
                        ) : (
                            packets.map((p, i) => (
                                <div key={i} className="mb-1 animate-in slide-in-from-left-1">
                                    <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                    <span className="text-cyan-400/80">{p}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar: Schema & Tools */}
        <div className="lg:col-span-4 space-y-8">
            {/* Linked Forge Shards - NEW RELIABILITY PANEL */}
            <div className="aero-panel bg-amber-950/20 border-4 border-amber-600/40 p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5"><CodeIcon className="w-20 h-20" /></div>
                <h3 className="font-comic-header text-xl text-amber-500 uppercase italic mb-4 flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4" /> Linked Forge Shards
                </h3>
                <div className="space-y-3 relative z-10">
                    <div className="p-3 bg-black/60 rounded-xl border-2 border-amber-600/40 group hover:border-amber-400 transition-all">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[7px] font-black text-amber-600 uppercase">Task_ID: 0xRPM_01</span>
                            {rpm > 0 && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />}
                        </div>
                        <p className="text-[9px] font-bold text-white uppercase leading-tight">
                            Track Engine RPM. Schema: &#123; value: number, unit: 'RPM' &#125;. 
                        </p>
                        <p className="text-[8px] text-gray-500 italic mt-1 leading-snug">
                            "Real-time acquisition of rotational velocity."
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="px-2 py-0.5 bg-amber-600 text-black text-[6px] font-black rounded uppercase">Active_Conduct</div>
                            <span className="text-[7px] text-amber-900 font-mono">0x03E2_HARMONY</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="aero-panel bg-slate-900 p-6 border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col">
                <h3 className="font-comic-header text-3xl text-amber-500 uppercase italic mb-6 border-b border-white/10 pb-2 flex items-center gap-2">
                    <LogicIcon className="w-6 h-6" /> Forensic Schema
                </h3>
                <div className="flex-1 bg-black/60 rounded-xl border-2 border-black p-4 font-mono text-[10px] text-amber-600 overflow-hidden relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <SearchIcon className="w-4 h-4 text-amber-900" />
                    </div>
                    <textarea 
                        value={schemaText}
                        onChange={e => setSchemaText(e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 outline-none h-64 custom-scrollbar leading-relaxed resize-none"
                    />
                </div>
                <button 
                    onClick={handleCompileSchema}
                    disabled={isCompiling}
                    className="mt-4 w-full py-3 bg-amber-600/10 hover:bg-amber-600 border border-amber-600/30 text-amber-500 hover:text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    {isCompiling ? <SpinnerIcon className="w-3 h-3 animate-spin" /> : <ZapIcon className="w-3 h-3" />}
                    Compile Epitume Schema
                </button>
            </div>

            <div className="aero-panel bg-black/40 p-6 border-4 border-black shadow-[8px_8px_0_0_#000] space-y-4">
                <h4 className="text-[10px] font-black text-cyan-600 uppercase tracking-widest flex items-center gap-2">
                    <ShieldIcon className="w-4 h-4" /> Maestro's Forensics
                </h4>
                <div className="p-4 bg-red-950/10 border border-red-900/30 rounded-xl italic text-[10px] text-red-400 leading-relaxed">
                    "OBD-II is the machine's confession. To acquire its telemetry is to conduct the very soul of the chassis. Do not let the packets stall in the buffer; the Fall Off Requindor is near."
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-black/60 rounded-lg border border-white/5 flex items-center gap-2 group hover:border-cyan-500 transition-all cursor-crosshair">
                        <ZapIcon className="w-3 h-3 text-cyan-900 group-hover:text-cyan-400" />
                        <span className="text-[8px] font-black uppercase text-gray-600 group-hover:text-gray-300">Fast Scan</span>
                    </div>
                    <div className={`p-3 bg-black/60 rounded-lg border border-white/5 flex items-center gap-2 group hover:border-red-500 transition-all cursor-crosshair`}>
                        <FireIcon className="w-3 h-3 text-red-900 group-hover:text-red-400" />
                        <span className="text-[8px] font-black uppercase text-gray-600 group-hover:text-gray-300">Deep Probes</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Lab Footer */}
      <div className="p-4 bg-slate-900 border-t-8 border-black flex justify-between items-center z-30 px-10 shadow-inner">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-ping ${linkStatus === 'CONNECTED' ? 'bg-cyan-500' : 'bg-red-600'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${linkStatus === 'CONNECTED' ? 'text-cyan-500' : 'text-red-500'}`}>
                    OBD-II: {linkStatus}
                </span>
            </div>
            <span className="text-[9px] text-gray-700 font-mono tracking-widest uppercase">
                Stride: 1.2 PB/S | Latency: 0.02ms | Signature: 0x03E2
            </span>
        </div>
        <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.3em] hidden sm:block">"Acquire the truth, conduct the flow."</p>
      </div>
    </div>
  );
};
