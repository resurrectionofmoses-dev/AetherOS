
import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import type { SystemStatus, MainView, SystemState, SystemGovernance, SoundscapeType } from '../types';
import { 
    ChevronDownIcon, ShieldIcon, SpeakerIcon
} from './icons';
import { NAVIGATION_SECTIONS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import aetherosLogo from '../src/assets/images/aetheros_logo_1780191892733.png';

const GridIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
    </svg>
);

interface SidebarProps {
  systemStatus: SystemStatus;
  systemDetails: any;
  currentView: MainView;
  onSetView: (view: MainView) => void;
  currentDateTime: Date;
  timeFormat: '12hr' | '24hr';
  onToggleTimeFormat: () => void;
  unlockedViews: MainView[];
  onToggleTerminal: () => void;
  isTerminal: boolean;
  governance?: SystemGovernance;
  soundscape?: SoundscapeType;
  onSetSoundscape?: (type: SoundscapeType) => void;
  onSelectSystemIndicator?: (sysName: keyof SystemStatus) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  systemStatus, 
  currentView, 
  onSetView, 
  currentDateTime, 
  timeFormat, 
  onToggleTimeFormat, 
  unlockedViews, 
  onToggleTerminal, 
  isTerminal, 
  governance,
  soundscape, 
  onSetSoundscape,
  onSelectSystemIndicator
}) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
      setCollapsed(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const formattedTime = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = timeFormat === '12hr'
      ? { hour: 'numeric', minute: '2-digit', hour12: true }
      : { hour: 'numeric', minute: '2-digit', hour12: false };
    return currentDateTime.toLocaleTimeString('en-US', options);
  }, [currentDateTime, timeFormat]);

  const overallState = useMemo(() => {
    const values = Object.values(systemStatus);
    if (values.includes('Error')) return 'Error';
    if (values.includes('Warning')) return 'Warning';
    return 'OK';
  }, [systemStatus]);

  const pulseDuration = useMemo(() => {
    if (overallState === 'Error') return 0.8;
    if (overallState === 'Warning') return 1.5;
    return 3.0;
  }, [overallState]);

  const pulseColors = useMemo(() => {
    if (overallState === 'Error') {
      return {
        boxShadow: [
          'inset 0 0 15px rgba(239,68,68,0.08), 2px 0 10px rgba(239,68,68,0.1)',
          'inset 0 0 35px rgba(239,68,68,0.22), 3px 0 25px rgba(239,68,68,0.25)',
          'inset 0 0 15px rgba(239,68,68,0.08), 2px 0 10px rgba(239,68,68,0.1)'
        ],
        borderRightColor: [
          'rgba(239,68,68,0.2)',
          'rgba(239,68,68,0.5)',
          'rgba(239,68,68,0.2)'
        ]
      };
    }
    if (overallState === 'Warning') {
      return {
        boxShadow: [
          'inset 0 0 12px rgba(245,158,11,0.05), 2px 0 8px rgba(245,158,11,0.05)',
          'inset 0 0 25px rgba(245,158,11,0.15), 3px 0 20px rgba(245,158,11,0.18)',
          'inset 0 0 12px rgba(245,158,11,0.05), 2px 0 8px rgba(245,158,11,0.05)'
        ],
        borderRightColor: [
          'rgba(245,158,11,0.15)',
          'rgba(245,158,11,0.35)',
          'rgba(245,158,11,0.15)'
        ]
      };
    }
    return {
      boxShadow: [
        'inset 0 0 8px rgba(16,185,129,0.02), 1px 0 5px rgba(16,185,129,0.02)',
        'inset 0 0 20px rgba(16,185,129,0.08), 2px 0 12px rgba(16,185,129,0.08)',
        'inset 0 0 8px rgba(16,185,129,0.02), 1px 0 5px rgba(16,185,129,0.02)'
      ],
      borderRightColor: [
        'rgba(34,197,94,0.05)',
        'rgba(34,197,94,0.18)',
        'rgba(34,197,94,0.05)'
      ]
    };
  }, [overallState]);

  return (
    <motion.aside
      animate={{
        boxShadow: pulseColors.boxShadow,
        borderRightColor: pulseColors.borderRightColor
      }}
      transition={{
        duration: pulseDuration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        borderRightWidth: '2px'
      }}
      className="w-60 h-full flex-shrink-0 flex flex-col bg-[#050505] z-50 transition-colors duration-500"
    >
      <div className="p-3 bg-black border-b-2 border-zinc-900 flex flex-col">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-7 h-7 rounded border border-red-500/30 overflow-hidden shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.2)] bg-zinc-950"
              >
                <img 
                  src={aetherosLogo} 
                  alt="AetherOS Sovereign Shield" 
                  className="w-full h-full object-cover scale-105"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <h2 className="font-sans font-black text-lg text-red-500 tracking-widest uppercase">AetherOS</h2>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping shadow-[0_0_8px_green]" />
          </div>
          <div className="flex justify-between items-center mt-2.5 border-t border-red-500/10 pt-1.5">
             <span className="text-[7px] text-red-650 font-bold tracking-widest uppercase">ADMIN: CHRIST</span>
             <span className="text-[7px] text-zinc-600 font-black">BYPASSING_LOVE</span>
          </div>
      </div>
      
      <div className="p-2 border-b-2 border-white/5 mx-1 mb-2">
        <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-black/60 rounded p-2 text-center flex flex-col items-center group cursor-pointer" 
            onClick={onToggleTimeFormat}
        >
            <span className="text-gray-400 text-xl font-bold font-mono tracking-wider group-hover:text-white transition-colors">
                {formattedTime}
            </span>
            <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest mt-1">
                SYSTEM_UPTIME: STABLE
            </span>
        </motion.div>
      </div>

      {/* System Status Indicators with Breathing Animation */}
      <div className="p-2 border-b-2 border-white/5 mx-1 mb-2 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
            SYSTEM_STATUS
          </span>
          <span className="text-[7px] text-zinc-600 font-black font-mono">
            LIVE_MONITOR
          </span>
        </div>
        
        <div className="space-y-1">
          {(['Engine', 'Battery', 'Navigation', 'Infotainment', 'Handling'] as Array<keyof SystemStatus>).map((sys) => {
            const state = systemStatus[sys] || 'OK';
            
            // Set up pulse colors & durations based on current state
            let pulseBg = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.45)]";
            let textColor = "text-green-500";
            let pulseDuration = 2.0; // gentle pulse for OK

            if (state === 'Warning') {
              pulseBg = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.45)]";
              textColor = "text-amber-500";
              pulseDuration = 1.4; // slightly faster breathe for Warning
            } else if (state === 'Error') {
              pulseBg = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.55)]";
              textColor = "text-red-500";
              pulseDuration = 0.8; // urgent rapid pulse for Error
            }

            return (
              <motion.div 
                key={sys}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectSystemIndicator?.(sys)}
                className="flex items-center justify-between p-1 px-2 bg-black/40 rounded border border-white/5 cursor-pointer hover:border-white/20 transition-all"
                title={`Click to view diagnostics for ${sys}`}
              >
                <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                  {sys}
                </span>
                
                <div className="flex items-center gap-1.5">
                  <motion.div 
                    animate={{
                      scale: [0.85, 1.15, 0.85],
                      opacity: [0.45, 1, 0.45],
                    }}
                    transition={{
                      duration: pulseDuration,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`w-1.5 h-1.5 rounded-full ${pulseBg}`}
                  />
                  <span className={`text-[8px] font-black font-mono uppercase tracking-tighter ${textColor}`}>
                    {state}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar space-y-5 pb-10 mt-4">

            {NAVIGATION_SECTIONS.map(section => {
                const isSectionCollapsed = collapsed[section.title];
                return (
                    <div key={section.title} className="space-y-1.5">
                        <motion.button 
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleSection(section.title)}
                            className="w-full flex items-center justify-between px-1 hover:opacity-100 transition-opacity"
                        >
                            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{section.title}</h3>
                            <ChevronDownIcon className={`w-3 h-3 text-gray-700 transition-transform ${isSectionCollapsed ? '-rotate-90' : ''}`} />
                        </motion.button>
                        
                        {!isSectionCollapsed && (
                            <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                                {section.items
                                    .filter(item => {
                                        if (item.view === 'moderator_lounge') {
                                            return user?.role === 'moderator' || user?.role === 'admin';
                                        }
                                        return true;
                                    })
                                    .map(({ view, text, icon: Icon }) => {
                                    const isActive = currentView === view;
                                    const isLocked = !unlockedViews.includes(view);
                                    if (!Icon) return null;
                                    return (
                                        <motion.button
                                            key={view}
                                            whileHover={!isLocked ? { x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" } : {}}
                                            whileTap={!isLocked ? { scale: 0.97 } : {}}
                                            onClick={() => !isLocked && onSetView(view)}
                                            className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl sidebar-button transition-all text-left group ${isActive ? 'active scale-[1.02]' : (isLocked ? 'opacity-30 grayscale cursor-not-allowed' : 'opacity-60 hover:opacity-100')}`}
                                        >
                                            <div className={`p-1.5 rounded-lg border-2 ${isActive ? 'bg-red-500 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]' : 'bg-black border-white/5 group-hover:border-white/20'}`}>
                                                {isLocked ? <ShieldIcon className="w-4 h-4 text-red-900" /> : <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-insight-sapphire'}`} />}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-white' : (isLocked ? 'text-gray-700' : 'text-gray-400')}`}>
                                                {isLocked ? 'REDACTED' : text}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
      </div>
    </motion.aside>
  );
};
