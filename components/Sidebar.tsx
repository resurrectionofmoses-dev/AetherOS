
import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import type { SystemStatus, MainView, SystemState, SystemGovernance, SoundscapeType } from '../types';
import { 
    ChevronDownIcon, ShieldIcon, SpeakerIcon
} from './icons';
import { NAVIGATION_SECTIONS } from '../constants';
import { useAuth } from '../contexts/AuthContext';

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
  onSetSoundscape
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

  return (
    <aside className="w-60 h-full flex-shrink-0 flex flex-col bg-[#050505] border-r-2 border-black z-50">
      <div className="p-3 bg-black border-b-2 border-black flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="font-comic-header text-2xl text-red-500 wisdom-glow italic tracking-tighter">AetherOS</h2>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping shadow-[0_0_8px_green]" />
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
    </aside>
  );
};
