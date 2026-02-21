
import React, { useState } from 'react';
import { LockIcon, ShieldIcon, TerminalIcon, CodeIcon, ZapIcon, FireIcon, ActivityIcon, SignalIcon } from './icons';
import { CodeBlock } from './CodeBlock';
import { HexMetric } from './HexMetric';

const BASH_INIT = `#!/bin/bash
# 0x03E2 SIGNATURE: AETHER_OS_RECON_INIT
# DIRECTIVE: BOOTSTRAP SECURE NODE

echo ">>> [SOVEREIGN 0x03E2] INITIATING SEQUENTIAL WRITE..."

# 1. HARDEN THE SHELL (Forensic baseline)
apt-get update && apt-get install -y curl ufw fail2ban
ufw allow ssh
ufw allow 41641/udp # Tailscale harmonic frequency
ufw --force enable

# 2. INJECT TAILSCALE LOGIC
curl -fsSL https://tailscale.com/install.sh | sh

# 3. BIND TO THE MESH (Advertise as Exit Node)
echo ">>> [SOVEREIGN 0x03E2] BINDING TO ETHER..."
tailscale up --advertise-exit-node --ssh

echo ">>> [SOVEREIGN 0x03E2] NODE ACTIVE. AWAITING CONSOLE AUTHORIZATION."`;

const ACL_CONFIG = `// 0x03E2 FORENSIC ACL CONFIGURATION
{
  "tagOwners": {
    "tag:recon-node": ["user:you@example.com"],
    "tag:admin-console": ["user:you@example.com"]
  },
  "acls": [
    // 1. THE MAESTRO'S PRIVILEGE
    {
      "action": "accept",
      "src": ["tag:admin-console"],
      "dst": ["*:*"]
    },
    // 2. THE ISOLATION CELL (Recon Node)
    {
      "action": "accept",
      "src": ["tag:recon-node"],
      "dst": ["autogroup:internet:*"]
    }
  ],
  "ssh": [
    {
      "action": "check",
      "src": ["tag:admin-console"],
      "dst": ["tag:recon-node"],
      "users": ["root", "ubuntu"]
    }
  ]
}`;

const DOCKER_COMPOSE = `version: '3.8'
services:
  # THE HAMMER
  recon-shard:
    image: kalilinux/kali-rolling
    container_name: 0x03E2_RECON_UNIT
    network_mode: "host" 
    tty: true
    volumes:
      - ./data:/data 
    command: /bin/bash -c "apt update && apt install -y nmap masscan nikto jq && echo '[0x03E2] ARSENAL LOADED' && /bin/bash"
    restart: unless-stopped`;

const DEPENDENCIES = [
    { name: 'Tailscale', role: 'Mesh', integrity: 100, color: "border-cyan-600 text-cyan-400" },
    { name: 'WireGuard', role: 'Kernel', integrity: 99, color: "border-blue-600 text-blue-400" },
    { name: 'Docker', role: 'Entropy', integrity: 98, color: "border-violet-600 text-violet-400" },
    { name: 'Kali', role: 'Arsenal', integrity: 100, color: "border-emerald-600 text-emerald-400" }
];

export const TailscaleVaultView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'INIT' | 'ACL' | 'PAYLOAD'>('INIT');

    return (
        <div className="h-full flex flex-col bg-[#050505] text-gray-200 font-mono overflow-hidden">
            {/* Skim Milk Header */}
            <div className="p-3 border-b-4 border-black bg-slate-900 flex justify-between items-center shadow-xl z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600/10 border-2 border-red-600 rounded-xl flex items-center justify-center">
                        <LockIcon className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h2 className="font-comic-header text-2xl text-white italic tracking-tighter uppercase leading-none">RECON_VAULT</h2>
                        <p className="text-[7px] text-gray-500 font-black uppercase tracking-[0.3em] mt-0.5">Sovereign 0x03E2 | Tailscale Mesh Architecture</p>
                    </div>
                </div>
                <div className="flex gap-6 items-center">
                    <HexMetric size="sm" value="0.02" label="DRIFT" colorClass="border-red-600 text-red-500" />
                    <HexMetric size="sm" value="AES" label="CIPHER" colorClass="border-green-600 text-green-500" />
                    <div className="text-right">
                        <p className="text-[6px] text-gray-600 font-black uppercase mb-0.5">Mesh Status</p>
                        <p className="text-sm font-comic-header text-green-500">ENCRYPTED</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-4 gap-4 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(239,68,68,0.03)_0%,_transparent_70%)] pointer-events-none" />

                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab('INIT')} className={`px-4 py-2 rounded text-[10px] font-black uppercase transition-all ${activeTab === 'INIT' ? 'bg-red-600 text-black' : 'bg-zinc-900 text-gray-500'}`}>0x01_BOOTSTRAP</button>
                        <button onClick={() => setActiveTab('ACL')} className={`px-4 py-2 rounded text-[10px] font-black uppercase transition-all ${activeTab === 'ACL' ? 'bg-red-600 text-black' : 'bg-zinc-900 text-gray-500'}`}>0x02_LOGIC_GATE</button>
                        <button onClick={() => setActiveTab('PAYLOAD')} className={`px-4 py-2 rounded text-[10px] font-black uppercase transition-all ${activeTab === 'PAYLOAD' ? 'bg-red-600 text-black' : 'bg-zinc-900 text-gray-500'}`}>0x03_PAYLOAD</button>
                    </div>

                    <div className="flex-1 aero-panel bg-black/60 border-4 border-black p-4 overflow-hidden flex flex-col relative shadow-[10px_10px_0_0_#000]">
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {activeTab === 'INIT' && <CodeBlock language="bash" code={BASH_INIT} />}
                            {activeTab === 'ACL' && <CodeBlock language="json" code={ACL_CONFIG} />}
                            {activeTab === 'PAYLOAD' && <CodeBlock language="yaml" code={DOCKER_COMPOSE} />}
                        </div>
                    </div>
                </div>

                <div className="w-80 flex flex-col gap-4">
                    <div className="aero-panel bg-slate-900 border-4 border-black p-4 shadow-[8px_8px_0_0_#000]">
                        <h3 className="font-comic-header text-xl text-white uppercase italic mb-5 flex items-center gap-2">
                            <SignalIcon className="w-4 h-4 text-cyan-400" /> Mesh Topology
                        </h3>
                        <div className="flex flex-col items-center gap-4">
                            <HexMetric size="md" value="HUB" label="ADMIN_BASE" colorClass="border-cyan-600 text-cyan-500" />
                            <div className="h-6 w-0.5 bg-gray-800 animate-pulse" />
                            <HexMetric size="md" value="SPOKE" label="RECON_NODE" colorClass="border-red-600 text-red-500" />
                        </div>
                    </div>

                    <div className="aero-panel bg-black/60 border-4 border-black p-4 flex flex-col flex-1 shadow-[8px_8px_0_0_#000] overflow-hidden">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                            Dependency Manifold
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-2 gap-4 content-start">
                            {DEPENDENCIES.map(dep => (
                                <HexMetric 
                                    key={dep.name}
                                    size="sm"
                                    value={dep.integrity}
                                    label={dep.name}
                                    subLabel={dep.role}
                                    colorClass={dep.color}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-2 bg-slate-900 border-t-8 border-black flex justify-between items-center z-40 px-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Sovereign Vault: SEALED</span>
                    </div>
                    <span className="text-[8px] text-gray-700 font-mono italic">
                        0x03E2_HARMONIC_VERIFIED | STRIDE: 1.2 PB/S
                    </span>
                </div>
            </div>
        </div>
    );
};
