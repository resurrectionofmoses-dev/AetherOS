
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoffeeIcon, TimerIcon, ZapIcon, ShieldIcon, CheckIcon } from './icons';
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
            if (!notified[period.id]) {
                speechService.speak(`Break sequence initiated: ${period.label}. Step away from the lattice, Operator.`, 'Kore');
                milestoneService.addMilestone(
                    `Protocol Engagement: ${period.label}`, 
                    `The operator has engaged a mandatory break period (${period.start}-${period.end}). Biological load mitigation active.`,
                    'WISDOM',
                    true
                );
                setNotified(prev => ({ ...prev, [period.id]: true }));
            }
        } else if (!period && activeBreak) {
            setActiveBreak(null);
        }

        // Reset notifications at midnight
        if (currentFormattedTime === '00:00') {
            setNotified({});
        }
    }, [currentFormattedTime, activeBreak, notified]);

    if (!activeBreak) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed bottom-10 right-10 z-[1000] w-80"
            >
                <div className="bg-black/90 border-4 border-amber-600 rounded-[2rem] p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] backdrop-blur-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-600 animate-pulse" />
                    
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-black">
                            <CoffeeIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">{activeBreak.label}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <TimerIcon className="w-3 h-3 text-amber-500" />
                                <span className="text-[10px] font-mono text-amber-500">
                                    {activeBreak.start} - {activeBreak.end}
                                </span>
                            </div>
                        </div>
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

                    <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full w-fit">
                        <CheckIcon className="w-2.5 h-2.5 text-green-500" />
                        <span className="text-[8px] font-bold text-green-500 uppercase">D:\ BACKUP_CONFIRMED</span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
