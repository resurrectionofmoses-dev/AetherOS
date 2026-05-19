import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { biometricEngine, BiometricData } from '../services/biometricService';
import { ActivityIcon, MousePointer2Icon, KeyboardIcon, BrainIcon, ShieldCheckIcon, FingerprintIcon } from 'lucide-react';

export const BiometricIntelligenceView: React.FC = () => {
    const [stats, setStats] = useState<BiometricData>(biometricEngine.getReport());

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            biometricEngine.recordKeyDown(e.key);
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            biometricEngine.recordKeyUp(e.key);
        };

        const handleMouseMove = (e: MouseEvent) => {
            biometricEngine.recordMouseMove(e.clientX, e.clientY);
        };

        const handlePointerMove = (e: PointerEvent) => {
            if (e.pressure > 0) {
                biometricEngine.recordPointerForce(e.pressure);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('pointermove', handlePointerMove);

        const interval = setInterval(() => {
            setStats(biometricEngine.getReport());
        }, 500);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('pointermove', handlePointerMove);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="p-8 bg-[#0a0a0a] border border-zinc-800 rounded-3xl font-mono text-zinc-400 h-full overflow-y-auto custom-scrollbar">
            <header className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <BrainIcon className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Biometric Intelligence</h2>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Neural Hardhat Protocol active</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <ShieldCheckIcon className="w-3 h-3 text-green-500" />
                    <span className="text-[9px] font-black text-green-500 uppercase">Identity Verified</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                <StatCard 
                    label="Typing Velocity" 
                    value={`${stats.typingSpeed} WPM`} 
                    icon={<KeyboardIcon className="w-4 h-4" />} 
                    sub="Inter-keystroke cadence"
                />
                <StatCard 
                    label="Neural Entropy" 
                    value={`${stats.keystrokeEntropy}ms`} 
                    icon={<ActivityIcon className="w-4 h-4" />} 
                    sub="Timing variance profile"
                />
                <StatCard 
                    label="Tactile Pressure" 
                    value={`${stats.pressureIntensity}%`} 
                    icon={<FingerprintIcon className="w-4 h-4" />} 
                    sub="Force-dwell integration"
                />
                <StatCard 
                    label="Motion Delta" 
                    value={`${stats.jitter}px`} 
                    icon={<MousePointer2Icon className="w-4 h-4" />} 
                    sub="Spatial jitter signature"
                />
                <StatCard 
                    label="Progress" 
                    value={`${stats.learningProgress}%`} 
                    icon={<BrainIcon className="w-4 h-4" />} 
                    sub="Model training level"
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                    <span>Neural Mapping Progress</span>
                    <span>{stats.learningProgress}%</span>
                </div>
                <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.learningProgress}%` }}
                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    />
                </div>
            </div>

            <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1 animate-pulse" />
                    <p className="text-[11px] leading-relaxed text-zinc-500 italic">
                        The Sovereing system is currently analyzing your biological input patterns. 
                        Each keystroke and mouse movement contributes to your unique "777 Purity" signature. 
                        Once learning is complete, Hardhat-backed smart reconciliation can proceed.
                    </p>
                </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center border-t border-zinc-900 pt-4">
                <span className="text-[9px] text-zinc-700 uppercase font-black">Ref: Biometric-Hardhat-Sync</span>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                        <span className="text-[9px] text-zinc-700 uppercase font-black">WSL // ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                        <span className="text-[9px] text-zinc-700 uppercase font-black">ETH // LOCALHOST:8545</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ label: string, value: string, icon: React.ReactNode, sub: string }> = ({ label, value, icon, sub }) => (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors group">
        <div className="flex items-center gap-3 mb-3">
            <div className="p-1.5 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors">
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider font-sans">{label}</span>
        </div>
        <div className="text-2xl font-black text-white italic tracking-tighter mb-1">{value}</div>
        <div className="text-[9px] text-zinc-600 font-bold uppercase">{sub}</div>
    </div>
);
