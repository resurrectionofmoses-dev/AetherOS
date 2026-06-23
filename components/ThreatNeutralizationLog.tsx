import React, { useState, useMemo } from 'react';
import { Search, Filter, Clock, ShieldAlert, Sparkles, TrendingUp, CheckCircle, RefreshCcw, Download } from 'lucide-react';

export interface ThreatNeutralization {
    id: string;
    origin: string;
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    payloadSize: string;
    timestamp: string;
    resolutionMethod: string;
    status: 'NEUTRALIZED' | 'PURGED';
}

const ORIGINS = [
    'Anomaly_Carrier',
    'Exotic_Decoupler',
    'Dark_Aero_Relay',
    'Bypass_Buffer',
    'Synaptic_Infiltration',
    'External_Node_77',
    'Semantic_Drift_Buffer',
    'Quantum_Decay_Relay',
    'Aetheric_Bridge',
    'Dissonance_Spillover'
];

const RESOLUTIONS = [
    'CRYPTO_PURGE',
    'ENTROPY_REFLECT',
    'GATT_ISOLATION',
    'COGNITIVE_ALIGN'
];

// Generate 50 historical neutralizations deterministically on load
const generatePast50Neutralizations = (): ThreatNeutralization[] => {
    const list: ThreatNeutralization[] = [];
    const baseTime = new Date("2026-05-29T09:53:53Z"); // Current local time as of checkpoint
    
    for (let i = 0; i < 50; i++) {
        // Subtract random time sequentially to model a history
        // index i corresponds to how far back. E.g. (i + 1) * 20 minutes to (i + 1) * 90 minutes.
        const minutesToSubtract = (i + 1) * 35 + (Math.sin(i) * 15);
        const eventTime = new Date(baseTime.getTime() - minutesToSubtract * 60 * 1000);
        
        // Deterministic properties based on i
        const idNum = 3452 - i * 17;
        const id = `VECT_S-${idNum}`;
        const origin = ORIGINS[i % ORIGINS.length];
        
        let threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        if (i % 7 === 0) threatLevel = 'CRITICAL';
        else if (i % 5 === 0) threatLevel = 'HIGH';
        else if (i % 3 === 0) threatLevel = 'MEDIUM';
        
        const payloadNum = (12 + (i * 37) % 245);
        const payloadSize = payloadNum > 180 ? `${(payloadNum / 10).toFixed(1)}MB` : `${payloadNum}KB`;
        const resolutionMethod = RESOLUTIONS[(i + 3) % RESOLUTIONS.length];
        
        // Formatting options for a highly professional look
        const yyyy = eventTime.getUTCFullYear();
        const mm = String(eventTime.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(eventTime.getUTCDate()).padStart(2, '0');
        const hh = String(eventTime.getUTCHours()).padStart(2, '0');
        const min = String(eventTime.getUTCMinutes()).padStart(2, '0');
        const ss = String(eventTime.getUTCSeconds()).padStart(2, '0');
        const formattedTimestamp = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss} UTC`;

        list.push({
            id,
            origin,
            threatLevel,
            payloadSize,
            timestamp: formattedTimestamp,
            resolutionMethod,
            status: 'NEUTRALIZED'
        });
    }
    return list;
};

interface ThreatNeutralizationLogProps {
    activeNeutralizations?: ThreatNeutralization[];
}

export const ThreatNeutralizationLog: React.FC<ThreatNeutralizationLogProps> = ({ activeNeutralizations = [] }) => {
    const [pastNeutralizations, setPastNeutralizations] = useState<ThreatNeutralization[]>(() => {
        return generatePast50Neutralizations();
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

    // Combine static seed log + any live updates neutralized during current session
    const combinedLog = useMemo(() => {
        // Filter out duplicates if live ones overlap (not expected)
        const filteredPast = pastNeutralizations.filter(
            past => !activeNeutralizations.some(live => live.id === past.id)
        );
        return [...activeNeutralizations, ...filteredPast].slice(0, 50);
    }, [activeNeutralizations, pastNeutralizations]);

    // Attack Trend Metrics Calculations
    const trendStats = useMemo(() => {
        const total = combinedLog.length;
        if (total === 0) {
            return {
                criticalCount: 0,
                highCount: 0,
                mediumCount: 0,
                lowCount: 0,
                topOrigin: 'N/A',
                topOriginCount: 0,
                criticalPercentage: 0
            };
        }

        let critical = 0;
        let high = 0;
        let medium = 0;
        let low = 0;

        const originCounts: Record<string, number> = {};

        combinedLog.forEach(item => {
            if (item.threatLevel === 'CRITICAL') critical++;
            else if (item.threatLevel === 'HIGH') high++;
            else if (item.threatLevel === 'MEDIUM') medium++;
            else if (item.threatLevel === 'LOW') low++;

            originCounts[item.origin] = (originCounts[item.origin] || 0) + 1;
        });

        let topOrigin = 'N/A';
        let topOriginCount = 0;
        Object.entries(originCounts).forEach(([origin, count]) => {
            if (count > topOriginCount) {
                topOriginCount = count;
                topOrigin = origin;
            }
        });

        return {
            criticalCount: critical,
            highCount: high,
            mediumCount: medium,
            lowCount: low,
            topOrigin,
            topOriginCount,
            criticalPercentage: Math.round((critical / total) * 100)
        };
    }, [combinedLog]);

    // Handle play a minor frequency click synthesizer sound like elsewhere on interaction
    const playLightClickSynth = (freq: number) => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            // quiet catch
        }
    };

    // Filtered logs
    const filteredLogs = useMemo(() => {
        return combinedLog.filter(item => {
            const matchesQuery = searchQuery === '' || 
                item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.origin.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesLevel = selectedLevel === 'ALL' || item.threatLevel === selectedLevel;

            return matchesQuery && matchesLevel;
        });
    }, [combinedLog, searchQuery, selectedLevel]);

    const handleExportCSV = () => {
        try {
            playLightClickSynth(587.33); // D5 audio feedback
            const headers = ['Threat ID', 'Origin Node', 'Severity Level', 'Payload Size', 'Neutralization Date', 'Mitigation Strategy', 'Status'];
            const rows = filteredLogs.map(item => [
                item.id,
                item.origin,
                item.threatLevel,
                item.payloadSize,
                item.timestamp,
                item.resolutionMethod,
                'SECURED'
            ]);
            
            const csvContent = [
                headers.join(','),
                ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `threat_forensics_export_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Forensic CSV Export Failure', error);
        }
    };

    const getSeverityStyles = (level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
        switch (level) {
            case 'CRITICAL':
                return {
                    badge: 'bg-red-500/10 text-red-400 border border-red-500/30',
                    dot: 'bg-red-500',
                    text: 'text-red-400'
                };
            case 'HIGH':
                return {
                    badge: 'bg-violet-950/20 text-violet-400 border border-violet-800/30',
                    dot: 'bg-violet-600',
                    text: 'text-violet-400'
                };
            case 'MEDIUM':
                return {
                    badge: 'bg-indigo-950/20 text-indigo-400 border border-indigo-800/30',
                    dot: 'bg-indigo-500',
                    text: 'text-indigo-400'
                };
            default:
                return {
                    badge: 'bg-blue-950/25 text-blue-400 border border-blue-900/20',
                    dot: 'bg-blue-500',
                    text: 'text-blue-400'
                };
        }
    };

    return (
        <div id="threat-neutralizations-history" className="h-full flex flex-col bg-black text-cyan-100 font-mono overflow-hidden">
            {/* Title HUD */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <div>
                        <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider">THREAT VECTOR NEUTRALIZATION HISTORY</h3>
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest leading-none">FORENSIC ARCHIVE // PAST 50 VERIFIED NEUTRALIZATIONS</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[7.5px] font-bold text-emerald-500 bg-emerald-950/20 px-2 py-0.5 border border-emerald-500/20 rounded animate-pulse">
                        ARCHIVE_SECURED::LIVE
                    </span>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1 px-2 py-1 bg-emerald-950/40 hover:bg-emerald-600 border border-emerald-800 hover:border-emerald-500 text-emerald-400 hover:text-white rounded text-[8px] font-bold uppercase transition-all tracking-wider cursor-pointer active:scale-95"
                        title="Export Current Filtered Log to CSV"
                        id="export-forensic-csv-btn"
                    >
                        <Download className="w-2.5 h-2.5" />
                        <span>EXPORT CSV</span>
                    </button>
                    <button
                        onClick={() => {
                            playLightClickSynth(880);
                            setPastNeutralizations(generatePast50Neutralizations());
                        }}
                        className="p-1 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-colors cursor-pointer text-zinc-500 hover:text-white"
                        title="Re-seed Forensic Index"
                    >
                        <RefreshCcw className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Trends Analysis Overview Deck */}
            <div className="p-4 border-b border-zinc-950 bg-black/40 grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
                
                {/* Severity Spectrum Trend Chart */}
                <div className="bg-zinc-950/60 border border-zinc-900/60 p-2.5 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[8px] font-black text-zinc-400">
                        <span className="flex items-center gap-1">
                            <TrendingUp className="w-2.5 h-2.5 text-blue-400" />
                            SEVERITY SPECTRUM
                        </span>
                        <span className="text-zinc-600">N={combinedLog.length}</span>
                    </div>
                    {/* Visual custom stacked bar representation */}
                    <div className="h-2 w-full bg-zinc-900 rounded-full flex overflow-hidden border border-zinc-800/20">
                        <div 
                            style={{ width: `${(trendStats.criticalCount / combinedLog.length) * 100}%` }} 
                            className="bg-red-500 h-full hover:opacity-85 transition-opacity" 
                            title={`Critical: ${trendStats.criticalCount}`}
                        />
                        <div 
                            style={{ width: `${(trendStats.highCount / combinedLog.length) * 100}%` }} 
                            className="bg-violet-600 h-full hover:opacity-85 transition-opacity" 
                            title={`High: ${trendStats.highCount}`}
                        />
                        <div 
                            style={{ width: `${(trendStats.mediumCount / combinedLog.length) * 100}%` }} 
                            className="bg-indigo-505 bg-indigo-500 h-full hover:opacity-85 transition-opacity" 
                            title={`Medium: ${trendStats.mediumCount}`}
                        />
                        <div 
                            style={{ width: `${(trendStats.lowCount / combinedLog.length) * 100}%` }} 
                            className="bg-blue-500 h-full hover:opacity-85 transition-opacity" 
                            title={`Low: ${trendStats.lowCount}`}
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[7px] text-center font-black">
                        <div className="text-red-400">CRIT ({trendStats.criticalCount})</div>
                        <div className="text-violet-400">HIGH ({trendStats.highCount})</div>
                        <div className="text-indigo-400">MED ({trendStats.mediumCount})</div>
                        <div className="text-blue-400">LOW ({trendStats.lowCount})</div>
                    </div>
                </div>

                {/* Primary Attack Vector Source */}
                <div className="bg-zinc-950/60 border border-zinc-900/60 p-2.5 rounded-xl flex flex-col justify-between">
                    <span className="text-[8px] font-black text-zinc-400 flex items-center gap-1">
                        <ShieldAlert className="w-2.5 h-2.5 text-amber-500" />
                        DOMINANT THREAT ORIGIN
                    </span>
                    <div className="py-1 min-w-0">
                        <p className="text-[10px] text-white font-bold truncate leading-none uppercase">{trendStats.topOrigin}</p>
                        <p className="text-[7.5px] text-zinc-500 font-mono mt-1 uppercase">RESPONSIBLE FOR {trendStats.topOriginCount} MITIGATIONS</p>
                    </div>
                </div>

                {/* Cognitive Assessment Insights text */}
                <div className="bg-zinc-950/60 border border-zinc-900/60 p-2.5 rounded-xl flex flex-col justify-between">
                    <span className="text-[8px] font-black text-zinc-400 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                        SYSTEM ASSESSMENT
                    </span>
                    <p className="text-[7.5px] leading-relaxed text-zinc-400 capitalize">
                        {trendStats.criticalPercentage > 15 
                            ? 'Warning: Critical vectors comprise a substantial fraction. Perimeter re-alignment recommended.'
                            : 'Nominal stable operation. Over 85% of threat vectors suppressed in sub-extreme categories.'
                        }
                    </p>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="p-3 border-b border-zinc-950 bg-zinc-900/40 flex flex-col gap-2 md:flex-row md:items-center justify-between shrink-0">
                {/* Search Bar Input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-650 text-zinc-500" />
                    <input 
                        type="text" 
                        placeholder="Search Vector ID or Origin Node..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value.length % 2 === 0) playLightClickSynth(660);
                        }}
                        className="w-full bg-zinc-950/90 hover:bg-black border border-zinc-800 focus:border-cyan-500 rounded-lg pl-8 p-1.5 text-[10px] focus:outline-none placeholder-zinc-600 transition-colors"
                    />
                </div>

                {/* Filter Selector tabs */}
                <div className="flex gap-1 overflow-x-auto">
                    {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(lvl => (
                        <button
                            key={lvl}
                            onClick={() => {
                                playLightClickSynth(lvl === 'ALL' ? 440 : 520);
                                setSelectedLevel(lvl);
                            }}
                            className={`py-1 px-2 border rounded-md text-[8px] font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                                selectedLevel === lvl 
                                    ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500 shadow-sm shadow-cyan-500/10'
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {lvl}
                        </button>
                    ))}
                </div>
            </div>

            {/* Forensic Neutralization Records List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar bg-black/60">
                {filteredLogs.length > 0 ? (
                    filteredLogs.map(item => {
                        const style = getSeverityStyles(item.threatLevel);
                        return (
                            <div 
                                key={item.id} 
                                className="p-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl transition-all flex flex-col gap-2 relative group hover:shadow-[0_2px_15px_rgba(0,0,0,1)]"
                            >
                                {/* Background timeline left strip */}
                                <div className={`absolute top-3 left-0 w-1 h-3/5 rounded-r ${style.dot}`} />
                                
                                <div className="flex items-start justify-between min-w-0 pl-1">
                                    <div className="min-w-0 flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                        <p className="text-[10px] font-bold text-white uppercase font-sans tracking-tight shrink-0 select-text">
                                            {item.id}
                                        </p>
                                        <span className="text-zinc-700 font-mono text-[8px] select-none">|</span>
                                        <p className="text-[8.5px] text-zinc-400 truncate select-text uppercase tracking-tight" title={item.origin}>
                                            {item.origin}
                                        </p>
                                    </div>
                                    <span className={`text-[6.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${style.badge}`}>
                                        {item.threatLevel}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-[7.5px] font-mono leading-none border-t border-zinc-900/60 pt-2 pl-1">
                                    <div>
                                        <span className="text-zinc-600 block text-[6px] uppercase pb-0.5 tracking-wider select-none">Mitigation Timestamp</span>
                                        <span className="text-zinc-300 font-bold block flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5 text-zinc-500" />
                                            {item.timestamp}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-zinc-600 block text-[6px] uppercase pb-0.5 tracking-wider select-none">Resolution Method</span>
                                        <span className="text-emerald-400 font-bold block font-sans tracking-tight">
                                            ⚙️ {item.resolutionMethod}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-zinc-600 block text-[6px] uppercase pb-0.5 tracking-wider select-none">Payload Shard Size</span>
                                        <span className="text-zinc-400 block">
                                            💾 {item.payloadSize}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-zinc-600 block text-[6px] uppercase pb-0.5 tracking-wider select-none">Tactical Status</span>
                                        <span className="text-emerald-500 font-black block text-[7px] tracking-wide animate-pulse">
                                            ✓ SECURED
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="h-44 flex flex-col items-center justify-center border-2 border-dashed border-zinc-900 rounded-2xl text-zinc-650 p-6 text-center select-none">
                        <Clock className="w-8 h-8 text-zinc-800 mb-2 stroke-[1.5]" />
                        <p className="text-[10px] font-black uppercase text-zinc-500">No Historical Records Found</p>
                        <p className="text-[8px] text-zinc-650 uppercase mt-0.5 leading-tight">No neutralizations matched active filtration parameters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
