
import React, { useState } from 'react';
import { LinuxIcon, TerminalIcon, ActivityIcon, ShieldIcon, ZapIcon, FileIcon, CheckCircleIcon } from './icons';
import type { LabComponentProps } from '../types';

const EURODEMUS_CONFIG = `# /etc/systemd/system/eurodemus.service
# AETHEROS KERNEL // KEEPALIVE_MANIFEST_V1

[Unit]
Description=Eurodemus Lumen Engine (Daemon)
After=network.target auditd.service

[Service]
Type=notify
ExecStart=/usr/local/bin/eurodemus_d --mode=suitor
Restart=always
WatchdogSec=10s
User=aetheros
Group=witnessary

[Install]
WantedBy=multi-user.target`;

export const LinuxLabView: React.FC<LabComponentProps> = ({ 
  labName = "LINUX LAB", 
  labIcon: LabIcon = LinuxIcon, 
  labColor = "text-green-400", 
  description = "Kernel deep dives, forensic shell, and SystemD daemon orchestration." 
}) => {
  const [activeTab, setActiveTab] = useState<'SHELL' | 'SYSTEMD'>('SYSTEMD');

  return (
    <div className="h-full flex flex-col bg-[#051005] overflow-hidden font-mono text-green-100">
      <div className="p-6 border-b-8 border-black bg-green-900/20 flex justify-between items-center shadow-xl z-20">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-500/10 border-4 border-green-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-green-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => setActiveTab('SHELL')}
                className={`px-5 py-2 rounded-xl border-4 font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'SHELL' ? 'bg-green-600 text-black border-black' : 'bg-black text-green-600 border-green-900/40'}`}
            >
                Forensic Shell
            </button>
            <button 
                onClick={() => setActiveTab('SYSTEMD')}
                className={`px-5 py-2 rounded-xl border-4 font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === 'SYSTEMD' ? 'bg-green-600 text-black border-black' : 'bg-black text-green-600 border-green-900/40'}`}
            >
                Daemon Manifest
            </button>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar">
        {activeTab === 'SHELL' ? (
            <div className="aero-panel bg-black/80 border-4 border-black p-6 flex flex-col shadow-[12px_12px_0_0_rgba(0,0,0,1)] min-h-[400px]">
                <div className="flex items-center justify-between mb-4 border-b border-green-900/30 pb-2">
                    <div className="flex items-center gap-2 text-green-500">
                        <TerminalIcon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Forensic Shell</span>
                    </div>
                    <span className="text-[8px] text-green-800">tty1</span>
                </div>
                <div className="flex-1 font-mono text-sm text-green-400 space-y-1 overflow-y-auto custom-scrollbar">
                    <div>$ uname -a</div>
                    <div className="text-green-800">Linux aetheros-node 5.15.0-kali-maestro #1 SMP 0x03E2 x86_64</div>
                    <div>$ ps aux | grep eurodemus</div>
                    <div className="text-green-800">aetheros 412 0.2 0.1 /usr/local/bin/eurodemus_d --mode=suitor</div>
                    <div>$ systemctl status eurodemus</div>
                    <div className="text-green-500">● eurodemus.service - Eurodemus Lumen Engine</div>
                    <div className="text-green-500 ml-4">Loaded: loaded (/etc/systemd/system/eurodemus.service; enabled)</div>
                    <div className="text-green-500 ml-4">Active: active (running) since Thu 2026-05-21 04:20:00 UTC</div>
                    <div className="text-green-600 font-black mt-4">_</div>
                </div>
            </div>
        ) : (
            <div className="aero-panel bg-[#0a0a0a] border-4 border-green-600/30 p-6 flex flex-col shadow-[12px_12px_0_0_rgba(0,0,0,1)] min-h-[400px]">
                <div className="flex items-center justify-between mb-4 border-b border-green-900/30 pb-2">
                    <div className="flex items-center gap-2 text-green-400">
                        <FileIcon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">/etc/systemd/system/eurodemus.service</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                         <span className="text-[8px] font-bold text-green-700">LIVE CONFIG</span>
                    </div>
                </div>
                <div className="flex-1 bg-black p-4 rounded-xl border border-green-900/20 overflow-hidden relative group">
                     <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZapIcon className="w-4 h-4 text-green-500" />
                     </div>
                     <pre className="font-mono text-xs text-green-300/80 leading-relaxed whitespace-pre-wrap h-full overflow-y-auto custom-scrollbar">
                        {EURODEMUS_CONFIG}
                     </pre>
                </div>
                <div className="mt-4 flex gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 rounded border border-green-900/50">
                        <ActivityIcon className="w-3 h-3 text-green-500" />
                        <span className="text-[8px] font-bold text-green-400">WATCHDOG: 10s</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 rounded border border-green-900/50">
                        <ShieldIcon className="w-3 h-3 text-green-500" />
                        <span className="text-[8px] font-bold text-green-400">USER: aetheros</span>
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-8 flex flex-col">
            <div className="aero-panel bg-green-950/10 p-8 border-2 border-green-900/30 flex-1">
                <h4 className="font-comic-header text-3xl text-green-500 uppercase italic mb-6">Kernel Resilience</h4>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-green-800 mb-2">
                            <span>Entropy Saturation</span>
                            <span>99.4%</span>
                        </div>
                        <div className="h-2 bg-black rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: '99.4%' }} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-black border border-green-900/30 rounded-xl">
                            <p className="text-[8px] text-green-800 uppercase font-black">Load Avg</p>
                            <p className="text-white font-bold">1.2, 0.3, 0.0</p>
                        </div>
                        <div className="p-4 bg-black border border-green-900/30 rounded-xl">
                            <p className="text-[8px] text-green-800 uppercase font-black">Memory</p>
                            <p className="text-white font-bold">GIFTED</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-900 border-4 border-black rounded-[2rem] text-center italic text-xs text-green-600/80 leading-relaxed shadow-xl">
                "The kernel is the soul of the machine. The eurodemus daemon ensures the 0x03E2 heartbeat never falters."
            </div>
        </div>
      </div>
    </div>
  );
};
