import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InfoIcon, XIcon, ShieldIcon, AlertTriangleIcon } from './icons';

import type { AccessRole } from '../types';

interface GuestBannerProps {
    role: AccessRole;
}

export const GuestBanner: React.FC<GuestBannerProps> = ({ role }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (role !== 'guest' || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4"
            >
                <div className="bg-amber-950/20 backdrop-blur-md border-2 border-amber-500/30 p-4 rounded-2xl shadow-2xl flex items-start gap-4">
                    <div className="p-2 bg-amber-500/20 rounded-xl">
                        <AlertTriangleIcon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Guest Observer Mode Active</h3>
                        <p className="text-[10px] text-amber-200/70 leading-relaxed uppercase font-bold">
                            You are currently exploring AetherOS with a <span className="text-amber-500">Guest Signature</span>. 
                            Most core lattice write operations are restricted to full Operators. 
                            Your activity is logged for system telemetry.
                        </p>
                        <div className="flex gap-4 mt-3">
                            <div className="flex items-center gap-2">
                                <ShieldIcon className="w-3 h-3 text-amber-500/50" />
                                <span className="text-[8px] text-amber-500/50 font-black uppercase">Read-Only Lattice</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <InfoIcon className="w-3 h-3 text-amber-500/50" />
                                <span className="text-[8px] text-amber-500/50 font-black uppercase">Alpha Access</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-amber-500/20 rounded-lg transition-colors"
                    >
                        <XIcon className="w-4 h-4 text-amber-500" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
