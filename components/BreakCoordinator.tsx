
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoffeeIcon, TimerIcon, ZapIcon, ShieldIcon, CheckIcon, XIcon } from './icons';
import { speechService } from '../services/speechService';
import { useAuth } from '../contexts/AuthContext';
import { milestoneService } from '../services/milestoneService';

interface BreakPeriod {
    id: string;
    label: string;
    start: string; // HH:mm
    end: string;
    type: 'SHORT' | 'LUNCH' | 'REFOCUS';
}

const BREAK_SCHEDULE: BreakPeriod[] = [
    { id: 'morning_maint', label: 'Morning Synapse Sync (15m)', start: '10:30', end: '10:45', type: 'SHORT' }, 
    { id: 'midday_reset', label: 'Solar Noon Protocol (Lunch)', start: '12:00', end: '13:00', type: 'LUNCH' },
    { id: 'afternoon_alpha', label: 'Afternoon Kinetic I', start: '15:00', end: '15:15', type: 'SHORT' },
    { id: 'afternoon_beta', label: 'Afternoon Kinetic II', start: '16:30', end: '16:45', type: 'SHORT' },
    { id: 'evening_harmony', label: 'Evening Tuning: Back to Noon', start: '19:00', end: '19:30', type: 'REFOCUS' }
];

export const BreakCoordinator: React.FC = () => {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeBreak, setActiveBreak] = useState<BreakPeriod | null>(null);
    const [manualBreak, setManualBreak] = useState<BreakPeriod | null>(null);
    const [showSelector, setShowSelector] = useState(false);
    const [notified, setNotified] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const currentFormattedTime = useMemo(() => {
        return currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    }, [currentTime]);

    useEffect(() => {
        const period = BREAK_SCHEDULE.find(b => currentFormattedTime >= b.start && currentFormattedTime < b.end);
        
        if (period && !activeBreak) {
            setActiveBreak(period);
            setNotified(prev => {
                if (!prev[period.id]) {
                    speechService.speak(`Break sequence initiated: ${period.label}. Step away from the lattice, Operator.`, 'Kore');
                    milestoneService.addMilestone(
                        `Protocol Engagement: ${period.label}`, 
                        `The operator has engaged a mandatory break period (${period.start}-${period.end}). Biological load mitigation active.`,
                        'WISDOM',
                        true
                    );
                    return { ...prev, [period.id]: true };
                }
                return prev;
            });
        } else if (!period && activeBreak) {
            setActiveBreak(null);
        }

        // Reset notifications at midnight (guarded against reference loops)
        if (currentFormattedTime === '00:00') {
            setNotified(prev => Object.keys(prev).length > 0 ? {} : prev);
        }
    }, [currentFormattedTime, activeBreak]);

    const handleTriggerManualBreak = (type: 'LUNCH' | 'SHORT') => {
        const now = new Date();
        const startStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        
        const durationMin = type === 'LUNCH' ? 60 : 15;
        const end = new Date(now.getTime() + durationMin * 60 * 1000);
        const endStr = end.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        
        const period: BreakPeriod = {
            id: `manual_${type.toLowerCase()}_${Date.now()}`,
            label: type === 'LUNCH' ? 'Solar Noon Protocol (Lunch)' : 'Manual Synapse Sync (Short)',
            start: startStr,
            end: endStr,
            type: type
        };
        
        setManualBreak(period);
        setShowSelector(false);
        speechService.speak(`${type === 'LUNCH' ? 'Lunch' : 'Synapse sync'} protocol manual override initiated. Refreshing cognitive buffer.`, 'Kore');
        milestoneService.addMilestone(
            `Manual Reset: ${period.label}`, 
            `The operator has requested manual break override (${period.start}-${period.end}). Optimizing mental reserves.`,
            'WISDOM',
            true
        );
    };

    const handleEndManualBreak = () => {
        setManualBreak(null);
        setActiveBreak(null); // Allow closing both
        speechService.speak(`Rest state terminated. Welcome back to the main net, core operator.`, 'Kore');
        milestoneService.addMilestone(
            `Break Handover Completed`, 
            `Manual rest sequence ended by Operator control. Sync protocols synchronized.`,
            'WISDOM',
            true
        );
    };

    const currentBreak = activeBreak || manualBreak;

    const timeRemainingStr = useMemo(() => {
        if (!currentBreak) return '';
        try {
            const [endH, endM] = currentBreak.end.split(':').map(Number);
            const endDate = new Date(currentTime);
            endDate.setHours(endH, endM, 0, 0);
            
            let diffMs = endDate.getTime() - currentTime.getTime();
            if (diffMs < 0) {
                diffMs += 24 * 60 * 60 * 1000;
            }
            
            const totalSecs = Math.floor(diffMs / 1000);
            if (totalSecs <= 0) return '00:00';
            
            const mins = Math.floor(totalSecs / 60);
            const secs = totalSecs % 60;
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        } catch (e) {
            return '--:--';
        }
    }, [currentTime, currentBreak]);

    if (!currentBreak) {
        return (
            <div className="fixed bottom-4 right-4 z-[1000] flex flex-col items-end gap-2">
                <AnimatePresence>
                    {showSelector && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="bg-[#0b0c16]/95 border border-zinc-800 rounded-2xl p-4 shadow-2xl w-64 backdrop-blur-md mb-2 font-mono text-xs select-none"
                        >
                            <div className="flex justify-between items-center mb-3 pb-1 border-b border-zinc-800">
                                <span className="font-bold text-amber-500 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                                    <CoffeeIcon className="w-3.5 h-3.5 text-amber-400" />
                                    Rest Protocols
                                </span>
                                <button 
                                    onClick={() => setShowSelector(false)}
                                    className="p-1 hover:text-rose-400 text-zinc-500 cursor-pointer transition-colors bg-transparent border-0"
                                >
                                    <XIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <p className="text-[9px] text-zinc-400 mb-3 leading-normal uppercase">
                                Activate neural reset flow to prevent biological exhaustion and tech-tread.
                            </p>
                            <div className="space-y-1.5">
                                <button
                                    onClick={() => handleTriggerManualBreak('LUNCH')}
                                    id="trigger-lunch-break-item"
                                    className="w-full text-left p-2.5 bg-amber-950/20 hover:bg-amber-900/20 border border-amber-900/30 hover:border-amber-500/40 rounded-xl transition-all group flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <CoffeeIcon className="w-4 h-4 text-amber-400" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-amber-300 uppercase">Solar Noon (Lunch)</span>
                                            <span className="text-[8px] text-zinc-500 uppercase">60m Recalibration</span>
                                        </div>
                                    </div>
                                    <span className="text-[8px] bg-amber-955 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase font-bold group-hover:animate-pulse">Engage</span>
                                </button>

                                <button
                                    onClick={() => handleTriggerManualBreak('SHORT')}
                                    className="w-full text-left p-2.5 bg-blue-950/20 hover:bg-blue-900/20 border border-blue-900/30 hover:border-blue-500/40 rounded-xl transition-all group flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <TimerIcon className="w-4 h-4 text-blue-400" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-blue-300 uppercase">Synapse Sync (Short)</span>
                                            <span className="text-[8px] text-zinc-500 uppercase">15m Micro Rest</span>
                                        </div>
                                    </div>
                                    <span className="text-[8px] bg-blue-955 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase font-bold">Engage</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setShowSelector(!showSelector)}
                    id="trigger-lunch-break-button"
                    className="flex items-center gap-2 bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-805 hover:border-amber-500/50 px-3.5 py-2 rounded-full shadow-lg transition-all duration-150 text-zinc-300 hover:text-amber-400 font-mono text-xs cursor-pointer group active:scale-95"
                    title="Engage Rest Protocols & Biological Breaks"
                >
                    <CoffeeIcon className="w-4 h-4 text-amber-500 group-hover:animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Take a Break</span>
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                </button>
            </div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed bottom-10 right-10 z-[1000] w-80"
            >
                <div className="bg-black/95 border-4 border-amber-600 rounded-[2rem] p-6 shadow-[0_0_50px_rgba(245,158,11,0.35)] backdrop-blur-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-600 animate-pulse" />
                    
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                            <CoffeeIcon className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest truncate">{currentBreak.label}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <TimerIcon className="w-3 h-3 text-amber-500" />
                                <span className="text-[10px] font-mono text-amber-500 font-bold">
                                    {currentBreak.start} - {currentBreak.end}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Countdown Display */}
                    <div className="mb-4 bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex flex-col items-center justify-center">
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mb-1">RESET_BUFFER_TTL</span>
                        <span className="text-2xl font-bold font-mono text-amber-500 tracking-wider animate-pulse">
                            {timeRemainingStr}
                        </span>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 italic text-[9px] text-gray-400 mb-4 leading-relaxed">
                        "To dive is to sound, to crash is to round, but to live is to let everything live. Never thrash, always let node go gold. Always audit for system integrity and make checks to be resimbler."
                    </div>

                    <div className="flex justify-between items-center bg-black p-3 rounded-xl border border-amber-900/30">
                        <div className="flex items-center gap-2">
                            <ZapIcon className="w-3 h-3 text-amber-500 animate-pulse" />
                            <span className="text-[9px] font-black text-amber-500 uppercase">SYSTEM_STATE: BREAK</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <ShieldIcon className="w-3 h-3 text-blue-500" />
                            <span className="text-[8px] font-black text-blue-500 uppercase">ENCRYPT_MODE: ON</span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full w-fit">
                            <CheckIcon className="w-2.5 h-2.5 text-green-500" />
                            <span className="text-[8px] font-bold text-green-500 uppercase">D:\ LUNCH_ACTIVE</span>
                        </div>
                        
                        <button
                            onClick={handleEndManualBreak}
                            className="bg-rose-950/40 hover:bg-rose-900 border border-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider cursor-pointer hover:text-white transition-all flex items-center gap-1"
                        >
                            <XIcon className="w-2.5 h-2.5" />
                            Return
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
