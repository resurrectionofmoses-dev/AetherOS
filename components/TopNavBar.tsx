import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MainView } from '../types';
import { BrainIcon, GlobeIcon, ForgeIcon, VaultIcon, ShieldIcon, ActivityIcon, TerminalIcon, UserIcon, WarningIcon, ClockIcon, DatabaseIcon, EyeIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import { EmergencyKillSwitch } from '../services/emergencyKillSwitch';
import { ApiKeyInfoModal } from './ApiKeyInfoModal';
import aetherosLogo from '../src/assets/images/aetheros_logo_1780191892733.png';

interface TopNavBarProps {
    currentView: MainView;
    onSetView: (view: MainView) => void;
    isTerminal: boolean;
    onToggleTerminal: () => void;
    onTriggerKillSwitch?: () => void;
    isGhostMode: boolean;
    onToggleGhostMode: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ currentView, onSetView, isTerminal, onToggleTerminal, onTriggerKillSwitch, isGhostMode, onToggleGhostMode }) => {
    const { user, logout, toggleSeclusion } = useAuth();
    const [isApiModalOpen, setIsApiModalOpen] = useState(false);
    const [awayDuration, setAwayDuration] = useState<string>('');
    const [isTabLogsOpen, setIsTabLogsOpen] = useState(false);
    const [tabLogs, setTabLogs] = useState<string[]>([]);

    useEffect(() => {
        const loadLogs = () => {
            try {
                const currentLogs = localStorage.getItem('aetheros_tab_activity_logs');
                if (currentLogs) {
                    const parsed = JSON.parse(currentLogs);
                    // Show newest first
                    setTabLogs([...parsed].reverse());
                } else {
                    setTabLogs([]);
                }
            } catch (e) {
                console.error("Failed to parse tab activity logs", e);
            }
        };

        loadLogs();

        const handleSwitchEvent = () => {
            loadLogs();
        };

        window.addEventListener('aetheros_tab_switch', handleSwitchEvent);
        return () => {
            window.removeEventListener('aetheros_tab_switch', handleSwitchEvent);
        };
    }, []);

    useEffect(() => {
        if (user?.status !== 'active' && user?.lastActive) {
            const interval = setInterval(() => {
                const diff = Date.now() - user.lastActive!;
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                setAwayDuration(`${mins}:${secs.toString().padStart(2, '0')}`);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setAwayDuration('');
        }
    }, [user?.status, user?.lastActive]);
    
    const roleColors: Record<string, string> = {
        admin: 'text-red-500 border-red-500 bg-red-950/20',
        operator: 'text-amber-500 border-amber-500 bg-amber-950/20',
        moderator: 'text-blue-500 border-blue-500 bg-blue-950/20',
        user: 'text-emerald-500 border-emerald-500 bg-emerald-950/20',
        guest: 'text-gray-500 border-gray-700 bg-gray-950/20'
    };

    const navItems = [
        { id: 'chat', label: 'Nexus', icon: BrainIcon },
        { id: 'coding_network', label: 'Network', icon: GlobeIcon },
        { id: 'vault_manager', label: 'Vault', icon: DatabaseIcon },
        { id: 'system_integrity', label: 'Audit', icon: ActivityIcon },
        { id: 'accounts_registry', label: 'Registry', icon: UserIcon },
        { id: 'sovereign_shield', label: 'Shield', icon: ShieldIcon },
        { id: 'google_sheets', label: 'Ledger', icon: DatabaseIcon },
    ];

    if (user?.role === 'moderator' || user?.role === 'admin') {
        navItems.push({ id: 'moderator_lounge', label: 'Lounge', icon: ShieldIcon });
    }

    const handleKillSwitch = async () => {
        if (window.confirm("WARNING: KINETIC STASIS ENGAGEMENT REQUIRED? This will halt all physical and logical conduction cycles.")) {
            if (onTriggerKillSwitch) {
                onTriggerKillSwitch();
            } else {
                console.warn("WARNING: KINETIC STASIS ENGAGED. System halted.");
                await EmergencyKillSwitch.trigger();
            }
        }
    };

    return (
        <div className="h-14 bg-black border-b-2 border-zinc-900 flex items-center justify-between px-6 z-40 flex-shrink-0 shadow-md">
            <nav className="flex items-center gap-2 h-full">
                <div className="flex items-center px-4 gap-3 border-r-2 border-zinc-900 h-full mr-2">
                    <motion.div 
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        className="w-7 h-7 rounded border border-zinc-800 bg-zinc-950 overflow-hidden shadow-[0_0_8px_rgba(239,68,68,0.15)] shrink-0 hidden md:block"
                    >
                        <img 
                            src={aetherosLogo} 
                            alt="AetherOS Sovereign Shield" 
                            className="w-full h-full object-cover scale-105"
                            referrerPolicy="no-referrer"
                        />
                    </motion.div>
                    <div className="flex flex-col items-start">
                        <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Hierarchy Status</span>
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tighter ${roleColors[user?.role || 'guest']}`}>
                                <ShieldIcon className="w-2.5 h-2.5" />
                                {user?.role || 'GUEST'} 
                                {user?.sovereignty && (
                                    <span className="opacity-40 ml-1 border-l pl-1 border-current">
                                        {user.sovereignty}
                                    </span>
                                )}
                            </div>
                            {user?.status !== 'active' && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-500 text-[9px] font-black uppercase animate-pulse">
                                    <ClockIcon className="w-2.5 h-2.5" />
                                    {user?.status === 'away' ? 'AWAY' : 'AFK'} ({awayDuration})
                                </div>
                            )}
                        </div>
                    </div>
                    {user && (
                        <div className="flex flex-col items-start border-l-2 border-zinc-900 pl-3">
                            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Machine Node</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-zinc-400 uppercase">{user.machineId}</span>
                                <button 
                                    onClick={toggleSeclusion}
                                    title={user.seclusionActive ? "Seclusion Active: Identity locked to this machine" : "Seclusion Inactive: Identity vulnerable to migration"}
                                    className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase transition-all ${user.seclusionActive ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-black border-zinc-700 text-zinc-600 hover:text-zinc-400'}`}
                                >
                                    {user.seclusionActive ? 'SECLUDED' : 'SHIELD_OFF'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {navItems.map(item => {
                    const isActive = currentView === item.id;
                    const Icon = item.icon;
                    return (
                        <motion.button
                            key={item.id}
                            whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                            whileTap={{ y: 2 }}
                            onClick={() => onSetView(item.id as MainView)}
                            className={`h-full px-4 flex items-center gap-2 border-b-2 transition-all ${
                                isActive 
                                ? 'border-red-500 text-white bg-white/5' 
                                : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : ''}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </motion.button>
                    );
                })}
            </nav>
            <div className="flex items-center gap-4">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onToggleGhostMode}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${isGhostMode ? 'bg-amber-600 text-black border-amber-500' : 'bg-black text-amber-500 border-amber-900/40 hover:border-amber-500'}`}
                    title={isGhostMode ? "Disable Ghost Shroud" : "Enable Ghost Shroud"}
                >
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">{isGhostMode ? 'GHOST ON' : 'GHOST OFF'}</span>
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsApiModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-blue-900/20 text-blue-500 border-blue-900/40 hover:bg-blue-900/40 hover:text-blue-400 hover:border-blue-500 transition-all"
                    title="Gemini API Key Information"
                >
                    <BrainIcon className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">API INFO</span>
                </motion.button>
                <div className="relative">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsTabLogsOpen(!isTabLogsOpen)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-purple-900/20 text-purple-500 border-purple-900/40 hover:bg-purple-900/40 hover:text-purple-400 hover:border-purple-500 transition-all ${isTabLogsOpen ? 'bg-purple-900/40 border-purple-500 text-purple-400' : ''}`}
                        title="Tab Switching Activity Trace"
                    >
                        <ActivityIcon className="w-4 h-4 text-purple-400 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">TAB LOGS</span>
                    </motion.button>

                    {isTabLogsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-zinc-950 border-2 border-purple-900/60 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.15)] z-50 p-4 font-mono select-none text-left">
                            <div className="flex items-center justify-between border-b border-purple-950 pb-2 mb-3">
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Tab Switch Trace</span>
                                <button 
                                    className="text-[8px] px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded hover:bg-purple-900 transition-all"
                                    onClick={() => {
                                        localStorage.removeItem('aetheros_tab_activity_logs');
                                        setTabLogs([]);
                                    }}
                                >
                                    CLEAR
                                </button>
                            </div>
                            
                            <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900 pr-1 text-left">
                                {tabLogs.length === 0 ? (
                                    <div className="text-[9px] text-zinc-600 text-center py-6 italic">
                                        No tab transitions logged. Switch tabs to record.
                                    </div>
                                ) : (
                                    tabLogs.map((log, idx) => (
                                        <div key={idx} className="text-[9px] bg-zinc-900/65 p-1.5 border border-purple-950/40 rounded text-purple-300/90 leading-tight">
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div className="border-t border-purple-950/40 mt-3 pt-2 text-[8px] text-zinc-500 leading-normal flex items-center justify-between">
                                <span>ARMORING:</span>
                                <span className="text-emerald-400 font-bold uppercase tracking-tight">ACTIVE PERSISTENCE</span>
                            </div>
                        </div>
                    )}
                </div>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleKillSwitch}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-red-900/20 text-red-500 border-red-900 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all animate-pulse"
                >
                    <WarningIcon className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">KILL SWITCH</span>
                </motion.button>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onToggleTerminal}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${isTerminal ? 'bg-green-600 text-black border-green-500' : 'bg-black text-green-500 border-green-900/40 hover:border-green-500'}`}
                >
                    <TerminalIcon className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{isTerminal ? 'EXIT TERM' : 'TERM MODE'}</span>
                </motion.button>
                <div className="w-px h-6 bg-zinc-800" />
                <motion.button 
                    whileHover={{ scale: 1.05, borderColor: "rgba(220, 38, 38, 1)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 bg-black text-red-500 border-red-900/40 hover:border-red-500 transition-all"
                >
                    <UserIcon className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">DISCONNECT</span>
                </motion.button>
            </div>
            <ApiKeyInfoModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />
        </div>
    );
};
