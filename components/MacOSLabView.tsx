
import React from 'react';
import { AppleIcon, ShieldIcon, ActivityIcon, SearchIcon, ZapIcon } from './icons';
import type { LabComponentProps } from '../types';

export const MacOSLabView: React.FC<LabComponentProps> = ({ 
  labName = "MAC OS LAB", 
  labIcon: LabIcon = AppleIcon, 
  labColor = "text-purple-400", 
  description = "macOS security auditing and architectural forensic synthesis." 
}) => {
  return (
    <div className="h-full flex flex-col bg-[#0a0510] overflow-hidden font-mono text-purple-100">
      <div className="p-6 border-b-8 border-black bg-purple-900/20 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-500/10 border-4 border-purple-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-purple-700 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="px-5 py-2 bg-black border-4 border-black rounded-xl text-purple-500 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000]">
            SIP: DISABLED
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.05)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="aero-panel bg-black/60 border-4 border-purple-900/40 p-8 space-y-6">
                <h3 className="font-comic-header text-3xl text-white uppercase italic">Security Posture</h3>
                <div className="space-y-4">
                    {['XProtect', 'Gatekeeper', 'FileVault', 'App Sandbox'].map(s => (
                        <div key={s} className="flex justify-between items-center p-3 bg-purple-950/20 border border-purple-800 rounded-xl">
                            <span className="text-xs font-bold text-purple-300">{s}</span>
                            <span className="text-[9px] font-black text-green-500 uppercase">Audited</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-8">
                <div className="aero-panel bg-slate-900 p-8 border-2 border-purple-600/30 flex-1">
                    <h4 className="font-comic-header text-3xl text-purple-400 uppercase italic mb-4">Core Shards</h4>
                    <div className="space-y-4 text-[10px] font-black uppercase text-purple-800">
                        <p>Kernel: Darwin 21.6.0</p>
                        <p>Arch: Apple Silicon (M2)</p>
                        <p>Integrity: 0x03E2_SYNC</p>
                    </div>
                </div>
                <div className="p-6 bg-purple-950/10 border-4 border-black rounded-[2rem] text-center italic text-xs text-purple-600/60 leading-relaxed shadow-inner">
                    "Design is not just what it looks like. Design is how the logic flows under the hood."
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
