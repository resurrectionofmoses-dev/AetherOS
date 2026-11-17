import React from 'react';
import { GlitchTelemetry, SystemState } from '../types';
import { AlertTriangle, Camera } from 'lucide-react';

interface GlitchTelemetryOverlayProps {
    glitchHistory: GlitchTelemetry[];
}

const getStatusTextColor = (state: SystemState) => {
    if (state === 'Error') return 'text-rose-400';
    if (state === 'Warning') return 'text-amber-400';
    return 'text-emerald-400';
};

export const GlitchTelemetryOverlay: React.FC<GlitchTelemetryOverlayProps> = ({ glitchHistory }) => {
    const lastGlitch = glitchHistory[glitchHistory.length - 1];
    
    if (!lastGlitch) return null;

    const isSnapshot = Boolean(lastGlitch.isSnapshot);

    return (
        <div
            className={`fixed bottom-4 right-4 z-[200] bg-black/85 border p-3 rounded-xl font-mono text-[10px] space-y-1.5 max-w-xs ${
                isSnapshot
                    ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.28)] text-cyan-200'
                    : 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)] text-rose-300'
            }`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {isSnapshot ? (
                        <Camera className="w-3 h-3 text-cyan-400" />
                    ) : (
                        <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />
                    )}
                    <span className="font-bold">
                        {isSnapshot ? 'FORENSIC LOG: STATE SNAPSHOT' : 'FORENSIC LOG: GLITCH TRIGGERED'}
                    </span>
                </div>
                {isSnapshot && (
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[8px] font-black uppercase">
                        SNAPSHOT
                    </span>
                )}
            </div>
            {lastGlitch.label && (
                <div className="px-2 py-1 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-100 text-[10px] break-words">
                    Note: {lastGlitch.label}
                </div>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <span className="text-zinc-400">Timestamp:</span>
                <span>{new Date(lastGlitch.timestamp).toLocaleTimeString()}</span>
                <span className="text-zinc-400">Duration:</span>
                <span>{lastGlitch.duration}ms</span>
                {typeof lastGlitch.activityDensity === 'number' && (
                    <>
                        <span className="text-zinc-400">Activity Density:</span>
                        <span className="text-cyan-300 font-bold">{lastGlitch.activityDensity.toFixed(1)}</span>
                    </>
                )}
                {typeof lastGlitch.acousticPressure === 'number' && (
                    <>
                        <span className="text-zinc-400">Acoustic Pressure:</span>
                        <span className="text-zinc-200">{lastGlitch.acousticPressure.toFixed(1)} dB</span>
                    </>
                )}
            </div>
            {lastGlitch.systemStatus && (
                <div className="pt-1 border-t border-zinc-800/80 flex flex-wrap gap-1.5">
                    {(Object.entries(lastGlitch.systemStatus) as [string, SystemState][]).map(([key, value]) => (
                        <span
                            key={key}
                            className="px-1.5 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 text-[8px] flex items-center gap-1"
                        >
                            <span className="text-zinc-400">{key}:</span>
                            <span className={`font-bold ${getStatusTextColor(value)}`}>{value}</span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

