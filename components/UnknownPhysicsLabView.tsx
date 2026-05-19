import React, { useState, useEffect } from 'react';
import { AtomIcon, ActivityIcon, ShieldIcon, ZapIcon, AlertTriangleIcon } from './icons';

export const UnknownPhysicsLabView: React.FC = () => {
    const [stability, setStability] = useState(100);
    const [dimensionalFold, setDimensionalFold] = useState(0);
    const [gravitationalConstant, setGravitationalConstant] = useState(6.674);
    const [isContaining, setIsContaining] = useState(true);
    const [anomalyType, setAnomalyType] = useState<'NULL' | 'TACHYON_FIELD' | 'STRANGELET_SWARM' | 'VACUUM_DECAY'>('NULL');

    useEffect(() => {
        if (!isContaining) {
            const interval = setInterval(() => {
                setStability(prev => Math.max(0, prev - (Math.random() * 5)));
                setDimensionalFold(prev => Math.min(100, prev + (Math.random() * 10)));
                setGravitationalConstant(prev => prev + (Math.random() - 0.5) * 2);
            }, 500);
            return () => clearInterval(interval);
        } else {
            const interval = setInterval(() => {
                setStability(prev => Math.min(100, prev + 2));
                setDimensionalFold(prev => Math.max(0, prev - 5));
                setGravitationalConstant(prev => prev + (6.674 - prev) * 0.1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isContaining]);

    const handleInstatePhysics = () => {
        setIsContaining(false);
        const anomalies: typeof anomalyType[] = ['TACHYON_FIELD', 'STRANGELET_SWARM', 'VACUUM_DECAY'];
        setAnomalyType(anomalies[Math.floor(Math.random() * anomalies.length)]);
    };

    const handleContainment = () => {
        setIsContaining(true);
        setAnomalyType('NULL');
    };

    return (
        <div className="h-full flex flex-col bg-[#050010] text-purple-200 font-mono overflow-hidden relative">
            {/* Dynamic Background based on anomaly */}
            <div 
                className="absolute inset-0 pointer-events-none transition-all duration-1000"
                style={{
                    background: anomalyType === 'TACHYON_FIELD' ? 'radial-gradient(circle at center, rgba(147,51,234,0.2) 0%, transparent 70%)' :
                                anomalyType === 'STRANGELET_SWARM' ? 'radial-gradient(circle at center, rgba(236,72,153,0.2) 0%, transparent 70%)' :
                                anomalyType === 'VACUUM_DECAY' ? 'radial-gradient(circle at center, rgba(239,68,68,0.2) 0%, transparent 70%)' :
                                'radial-gradient(circle at center, rgba(59,130,246,0.05) 0%, transparent 70%)',
                    filter: `blur(${dimensionalFold / 10}px) hue-rotate(${dimensionalFold * 3.6}deg)`,
                    transform: `scale(${1 + (dimensionalFold / 100)}) skew(${dimensionalFold / 20}deg)`
                }}
            />

            {/* Header */}
            <div className="p-6 border-b-4 border-purple-900/50 bg-black/80 flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center shadow-[0_0_15px_currentColor] transition-colors ${stability < 30 ? 'bg-red-900/20 border-red-500 text-red-500' : 'bg-purple-900/20 border-purple-500 text-purple-500'}`}>
                        <AtomIcon className={`w-6 h-6 ${!isContaining ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Unknown Physics Lab</h1>
                        <p className={`text-[10px] font-bold tracking-[0.2em] uppercase ${stability < 30 ? 'text-red-500' : 'text-purple-500'}`}>
                            {isContaining ? 'Standard Model Enforced' : 'Causality Breakdown Imminent'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Containment Stability</div>
                        <div className={`text-xl font-black ${stability < 30 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
                            {stability.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center relative z-10">
                
                {/* Containment Core */}
                <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                    {/* Outer Rings */}
                    <div className={`absolute inset-0 border-4 rounded-full transition-all duration-1000 ${isContaining ? 'border-purple-500/30' : 'border-red-500/50 scale-150 opacity-0'}`} />
                    <div className={`absolute inset-4 border-4 border-dashed rounded-full transition-all duration-1000 ${isContaining ? 'border-purple-500/50 animate-[spin_10s_linear_infinite]' : 'border-red-500/80 animate-[spin_2s_linear_infinite] scale-125'}`} />
                    
                    {/* Core Anomaly */}
                    <div 
                        className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isContaining ? 'bg-purple-900/40 border-2 border-purple-400 shadow-[0_0_50px_rgba(168,85,247,0.4)]' : 'bg-red-900/60 border-4 border-red-500 shadow-[0_0_100px_rgba(239,68,68,0.8)] animate-pulse'}`}
                        style={{
                            transform: `scale(${1 + (dimensionalFold / 50)})`,
                            filter: `blur(${dimensionalFold / 20}px)`
                        }}
                    >
                        {isContaining ? (
                            <ShieldIcon className="w-12 h-12 text-purple-300" />
                        ) : (
                            <ZapIcon className="w-16 h-16 text-red-400 animate-bounce" />
                        )}
                    </div>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-4xl mb-12">
                    <div className="bg-black/60 border border-purple-900/50 rounded-xl p-4 flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Dimensional Fold</span>
                        <span className={`text-2xl font-black font-mono ${dimensionalFold > 50 ? 'text-red-400' : 'text-purple-400'}`}>
                            {dimensionalFold.toFixed(3)} Δ
                        </span>
                    </div>
                    <div className="bg-black/60 border border-purple-900/50 rounded-xl p-4 flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Gravitational Constant (G)</span>
                        <span className={`text-2xl font-black font-mono ${Math.abs(gravitationalConstant - 6.674) > 1 ? 'text-red-400' : 'text-purple-400'}`}>
                            {gravitationalConstant.toFixed(4)}
                        </span>
                    </div>
                    <div className="bg-black/60 border border-purple-900/50 rounded-xl p-4 flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Anomaly Signature</span>
                        <span className={`text-lg font-black uppercase tracking-widest ${anomalyType !== 'NULL' ? 'text-red-400' : 'text-purple-400'}`}>
                            {anomalyType}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-6">
                    {isContaining ? (
                        <button 
                            onClick={handleInstatePhysics}
                            className="px-8 py-4 bg-red-900/20 border-2 border-red-500 text-red-400 hover:bg-red-900/40 hover:text-red-300 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center gap-3"
                        >
                            <AlertTriangleIcon className="w-5 h-5" />
                            Instate Unknown Physics
                        </button>
                    ) : (
                        <button 
                            onClick={handleContainment}
                            className="px-8 py-4 bg-purple-900/20 border-2 border-purple-500 text-purple-400 hover:bg-purple-900/40 hover:text-purple-300 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center gap-3"
                        >
                            <ShieldIcon className="w-5 h-5" />
                            Re-establish Containment
                        </button>
                    )}
                </div>

                {/* Warning Banner */}
                {!isContaining && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-red-950/80 border border-red-500 px-6 py-3 rounded-lg flex items-center gap-3 animate-pulse">
                        <AlertTriangleIcon className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-black text-red-400 uppercase tracking-widest">
                            Warning: Local reality degradation detected. Exotic matter synthesis in progress.
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
