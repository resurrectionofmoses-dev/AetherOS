import React, { useMemo, useState } from 'react';
import { GlitchTelemetry, SystemState } from '../types';
import { AlertTriangle, Camera, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface GlitchTelemetryOverlayProps {
    glitchHistory: GlitchTelemetry[];
    isSystemFractured?: boolean;
}

const getStatusTextColor = (state: SystemState) => {
    if (state === 'Error') return 'text-rose-400';
    if (state === 'Warning') return 'text-amber-400';
    return 'text-emerald-400';
};

export const GlitchTelemetryOverlay: React.FC<GlitchTelemetryOverlayProps> = ({
    glitchHistory,
    isSystemFractured = false,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const sortedGlitchHistory = useMemo(
        () => [...glitchHistory].sort((a, b) => b.timestamp - a.timestamp),
        [glitchHistory]
    );

    if (sortedGlitchHistory.length === 0) return null;

    const latestGlitch = sortedGlitchHistory[0];
    const latestIsSnapshot = Boolean(latestGlitch.isSnapshot);

    return (
        <div
            id="glitch-history-overlay"
            className={`fixed right-4 z-[200] bg-black/90 backdrop-blur-md border rounded-xl font-mono text-[10px] w-80 max-w-[calc(100vw-2rem)] transition-all ${
                isSystemFractured ? 'bottom-20' : 'bottom-4'
            } ${
                latestIsSnapshot
                    ? 'border-cyan-500/50 shadow-[0_0_18px_rgba(34,211,238,0.28)] text-cyan-200'
                    : 'border-rose-500/50 shadow-[0_0_18px_rgba(244,63,94,0.3)] text-rose-300'
            }`}
        >
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-800/90">
                <div className="flex items-center gap-2 min-w-0">
                    {latestIsSnapshot ? (
                        <Camera className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" />
                    )}
                    <div className="min-w-0">
                        <div className="font-bold tracking-wider truncate text-zinc-100">
                            GLITCH HISTORY ({sortedGlitchHistory.length})
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-zinc-400 uppercase tracking-widest">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Descending Timestamp</span>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCollapsed(prev => !prev)}
                    className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
                    aria-label={isCollapsed ? 'Expand glitch history' : 'Collapse glitch history'}
                    title={isCollapsed ? 'Expand glitch history' : 'Collapse glitch history'}
                >
                    {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
            </div>

            {!isCollapsed && (
                <div
                    id="glitch-history-list"
                    className="p-2.5 max-h-72 overflow-y-auto space-y-2"
                >
                    {sortedGlitchHistory.map((entry, idx) => {
                        const isSnapshot = Boolean(entry.isSnapshot);
                        const isLatest = idx === 0;

                        return (
                            <div
                                key={entry.id}
                                data-glitch-entry="true"
                                data-timestamp={entry.timestamp}
                                className={`p-2 rounded-lg border space-y-1.5 transition-colors ${
                                    isSnapshot
                                        ? isLatest
                                            ? 'bg-cyan-950/35 border-cyan-500/50 text-cyan-100'
                                            : 'bg-zinc-950/90 border-cyan-500/25 text-cyan-200'
                                        : isLatest
                                            ? 'bg-rose-950/35 border-rose-500/50 text-rose-100'
                                            : 'bg-zinc-950/90 border-rose-500/25 text-rose-200'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="text-[9px] text-zinc-400 font-bold">
                                            #{idx + 1}
                                        </span>
                                        {isLatest && (
                                            <span className="px-1 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[8px] font-black uppercase">
                                                LATEST
                                            </span>
                                        )}
                                        <span
                                            className={`px-1.5 py-0.5 rounded border text-[8px] font-black uppercase ${
                                                isSnapshot
                                                    ? 'bg-cyan-950 border-cyan-500/40 text-cyan-300'
                                                    : 'bg-rose-950 border-rose-500/40 text-rose-300'
                                            }`}
                                        >
                                            {isSnapshot ? 'SNAPSHOT' : 'GLITCH'}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-zinc-300 shrink-0">
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>

                                {entry.label && (
                                    <div className="px-2 py-1 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-100 text-[10px] break-words">
                                        Note: {entry.label}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px]">
                                    <span className="text-zinc-400">Duration:</span>
                                    <span className="text-right">{entry.duration}ms</span>
                                    {typeof entry.activityDensity === 'number' && (
                                        <>
                                            <span className="text-zinc-400">Activity Density:</span>
                                            <span className="text-right text-cyan-300 font-bold">
                                                {entry.activityDensity.toFixed(1)}
                                            </span>
                                        </>
                                    )}
                                    {typeof entry.acousticPressure === 'number' && (
                                        <>
                                            <span className="text-zinc-400">Acoustic Pressure:</span>
                                            <span className="text-right text-zinc-200">
                                                {entry.acousticPressure.toFixed(1)} dB
                                            </span>
                                        </>
                                    )}
                                    {entry.currentView && (
                                        <>
                                            <span className="text-zinc-400">View:</span>
                                            <span className="text-right text-zinc-300 truncate">
                                                {entry.currentView}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {entry.systemStatus && (
                                    <div className="pt-1 border-t border-zinc-800/80 flex flex-wrap gap-1">
                                        {(Object.entries(entry.systemStatus) as [string, SystemState][]).map(([key, value]) => (
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
                    })}
                </div>
            )}
        </div>
    );
};
