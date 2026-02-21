
import React, { useMemo, useState } from 'react';
import type { SystemStatus, MainView, SystemState, SystemGovernance, SoundscapeType } from '../types';
import { 
    EngineIcon, BatteryIcon, NavigationIcon, InfotainmentIcon, 
    WrenchIcon, ServerIcon, ZapIcon, SignalIcon, MusicIcon, 
    BuildIcon, BroadcastIcon, PackageIcon, ShareIcon, 
    ArchiveIcon, SteeringWheelIcon, ForgeIcon, ActivityIcon, 
    CodeIcon, SearchIcon, LogicIcon, UserIcon, StarIcon, RulesIcon,
    BookOpenIcon, ThermometerIcon, AtomIcon, FlaskIcon, DinoIcon,
    GemIcon, ShirtIcon, ConceptIcon, CleanIcon, GavelIcon, TruthIcon,
    TestTubeIcon, WindowsIcon, LinuxIcon, AppleIcon, MissionIcon, PhoneIcon,
    ScaleIcon, BookIcon, MovieIcon, ClockIcon, GlobeIcon, ChevronDownIcon,
    CalendarIcon, FlagIcon, BrainIcon, ShieldIcon, HomeIcon, VaultIcon,
    TerminalIcon, MessageCircleIcon, EyeIcon, OptimizerIcon,
    // Fix: Added missing LockIcon to imports
    FireIcon, GaugeIcon, LockIcon
} from './icons';

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

interface NavSection {
    title: string;
    path: string;
    items: { view: MainView; text: string; icon: React.FC<{className?: string}> }[];
}

// Move navigationSections outside the component for better performance and stable reference
const navigationSections: NavSection[] = [
  {
      title: 'Net Folder (Root)',
      path: 'root://coding_network',
      items: [
          { view: 'chat', text: 'NEURAL NEXUS', icon: BrainIcon },
          { view: 'absolute_reliability_network', text: 'RELIABILITY NET', icon: ShieldIcon },
          { view: 'coding_network', text: 'NET DIRECTIVES', icon: GlobeIcon },
          { view: 'universal_search', text: 'UNIVERSAL SEARCH', icon: SearchIcon },
          { view: 'gold_conjunction', text: 'GOLD CONJUNCTION', icon: GemIcon },
          { view: 'shard_store', text: 'SHARD STORE', icon: GemIcon },
          { view: 'conjunction_gates', text: 'CONJUNCTION GATES', icon: SignalIcon },
          { view: 'projects', text: 'CRAZY PROJECTS', icon: CodeIcon },
          { view: 'forge', text: 'BLUEPRINT FORGE', icon: ForgeIcon },
          { view: 'covenant', text: 'NETWORK COVENANT', icon: RulesIcon },
          { view: 'verification_gates', text: 'VERIFICATION GATES', icon: ShieldIcon },
      ]
  },
  {
      title: 'Core Systems',
      path: 'root://os/kernel',
      items: [
          { view: 'system_exhaustion', text: 'TOTAL EXHAUSTION', icon: FireIcon },
          { view: 'project_chronos', text: 'PROJECT CHRONOS', icon: ClockIcon },
          { view: 'build_logs', text: 'BUILD LOGS', icon: TerminalIcon },
          { view: 'rt_ipc_lab', text: 'RT-IPC LAB', icon: SignalIcon },
          { view: 'sovereign_shield', text: 'SOVEREIGN SHIELD', icon: ShieldIcon },
          { view: 'spectre_browser', text: 'SPECTRE BROWSER', icon: EyeIcon },
          { view: 'unified_chain', text: 'UNIFIED CHAIN', icon: ShieldIcon },
          { view: 'fuel_optimizer', text: 'FUEL OPTIMIZER', icon: OptimizerIcon },
          { view: 'vault', text: 'CONJUNCTION HUB', icon: VaultIcon },
          { view: 'healing_matrix', text: 'HEALING MATRIX', icon: FireIcon },
          { view: 'laws_justice_lab', text: 'LAWS & JUSTICE', icon: GavelIcon },
          { view: 'requindor_scroll', text: 'REQUINDOR SCROLL', icon: ActivityIcon },
          { view: 'omni_builder', text: 'OMNI BUILDER', icon: ForgeIcon },
          { view: 'singularity_engine', text: 'SINGULARITY', icon: ActivityIcon },
          { view: 'diagnostics', text: 'FORENSIC AUDIT', icon: WrenchIcon },
          { view: 'communications', text: 'SIGNAL BRIDGE', icon: BroadcastIcon },
          { view: 'up_north', text: 'UP NORTH PROTOCOL', icon: ShieldIcon },
          { view: 'device_link', text: 'DEVICE LINK', icon: ShareIcon },
          { view: 'bluetooth_bridge', text: 'BLUETOOTH SIG', icon: SignalIcon },
          { view: 'launch_center', text: 'LAUNCH CENTER', icon: FlagIcon },
          { view: 'eliza_terminal', text: 'ELIZA LOGIC', icon: MessageCircleIcon },
      ]
  },
  {
      title: 'Logic Shards (Labs)',
      path: 'root://labs/dev',
      items: [
          { view: 'code_fall_lab', text: 'CODE CASCADE', icon: CodeIcon },
          { view: 'alphabet_hexagon', text: 'ALPHABET HEX', icon: GridIcon },
          { view: 'powertrain_conjunction', text: 'POWERTRAIN SYNC', icon: GaugeIcon },
          { view: 'hyper_spatial_lab', text: 'HYPER-SPATIAL', icon: SignalIcon },
          { view: 'engineering_lab', text: 'ENGINEERING', icon: BuildIcon },
          { view: 'hard_code_lab', text: 'HARD CODE', icon: CodeIcon },
          { view: 'truth_lab', text: 'TRUTH LAB', icon: TruthIcon },
          { view: 'testing_lab', text: 'STRESS TESTING', icon: TestTubeIcon },
          { view: 'kinetics_lab', text: 'KINETICS', icon: ThermometerIcon },
          { view: 'quantum_theory_lab', text: 'QUANTUM', icon: AtomIcon },
          { view: 'chemistry_lab', text: 'CHEMISTRY', icon: FlaskIcon },
          { view: 'race_lab', text: 'RACE LAB', icon: FlagIcon },
          { view: 'paleontology_lab', text: 'PALEONTOLOGY', icon: DinoIcon },
          { view: 'raw_mineral_lab', text: 'RAW MINERAL', icon: GemIcon },
          { view: 'clothing_lab', text: 'CLOTHING', icon: ShirtIcon },
          { view: 'concepts_lab', text: 'CONCEPTS', icon: ConceptIcon },
          { view: 'sanitization_lab', text: 'SANITIZATION', icon: CleanIcon },
          { view: 'windows_lab', text: 'WINDOWS OS', icon: WindowsIcon },
          { view: 'linux_lab', text: 'LINUX OS', icon: LinuxIcon },
          { view: 'mac_os_lab', text: 'MAC OS', icon: AppleIcon },
          { view: 'apple_lab', text: 'APPLE SYSTEM', icon: AppleIcon },
          { view: 'mission_lab', text: 'MISSION OPS', icon: MissionIcon },
          { view: 'cell_phone_lab', text: 'CELL PHONE', icon: PhoneIcon },
          { view: 'sampling_lab', text: 'SAMPLING', icon: ScaleIcon },
          { view: 'pornography_studio', text: 'PORN STUDIO', icon: MovieIcon },
          { view: 'vehicle_telemetry_lab', text: 'VEHICLE TELEMETRY', icon: SteeringWheelIcon },
      ]
  },
  {
      title: 'Mentorship & Wisdom',
      path: 'root://users/wisdom',
      items: [
          { view: 'coding_network_teachers', text: 'FACULTY HUB', icon: UserIcon },
          { view: 'enlightenment_pool', text: 'ENLIGHTENMENT', icon: BrainIcon },
          { view: 'library_view', text: 'ARCHIVE LIBRARY', icon: BookOpenIcon },
          { view: 'timeline', text: 'RESILIENCE ROADMAP', icon: ClockIcon },
          { view: 'amoeba_heritage', text: 'AMOEBA HERITAGE', icon: BookIcon },
      ]
  }
];

const StatusIndicator: React.FC<{ system: string; state: SystemState; icon: React.FC<{className?: string}> }> = ({ system, state, icon: Icon }) => {
    const statusConfig = {
        'OK': { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', animation: '' },
        'Warning': { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', animation: 'animate-pulse' },
        'Error': { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', animation: 'animate-blink' }
    };

    const config = statusConfig[state] || statusConfig['OK'];

    return (
        <div className={`flex items-center gap-2 p-1.5 rounded-lg border ${config.border} ${config.bg} transition-all duration-500`}>
            <div className={`p-1 rounded-md bg-black/40 ${config.color}`}>
                <Icon className="w-3 h-3" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter truncate">{system}</span>
                <div className="flex items-center gap-1">
                    <div className={`w-1 h-1 rounded-full ${config.color.replace('text', 'bg')} ${config.animation}`} />
                    <span className={`text-[6px] font-bold uppercase ${config.color}`}>{state}</span>
                </div>
            </div>
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  systemStatus, 
  systemDetails,
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

  const currentPath = useMemo(() => {
      const section = navigationSections.find(s => s.items.some(i => i.view === currentView));
      return section ? section.path : 'root://aetheros';
      // Fix: Removed currentPath from dependency array to avoid self-reference error
  }, [currentView]);

  return (
    <aside className="w-60 h-full flex-shrink-0 flex flex-col bg-[#050505] border-r-4 border-black z-50">
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 0.8s infinite;
        }
      `}</style>
      <div className="p-3 bg-slate-900 border-b-4 border-black flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="font-comic-header text-2xl text-red-500 wisdom-glow italic tracking-tighter">AetherOS</h2>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping shadow-[0_0_8px_green]" />
          </div>
          <div className="bg-black/60 rounded px-2 py-1 mt-2 border border-white/5 overflow-hidden">
              <span className="text-[7px] font-mono text-cyan-500 uppercase whitespace-nowrap block animate-marquee">
                {currentPath}
              </span>
          </div>
      </div>
      
      <div className="p-2 border-b-2 border-white/5 mx-1 mb-2">
        <div className="bg-black/60 rounded p-2 text-center flex flex-col items-center group cursor-pointer" onClick={onToggleTimeFormat}>
            <span className="text-gray-400 text-xl font-bold font-mono tracking-wider group-hover:text-white transition-colors">
                {formattedTime}
            </span>
            <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest mt-1">
                SYSTEM_UPTIME: STABLE
            </span>
        </div>
      </div>

      <div className="px-2 mb-2 space-y-1.5">
          <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Health Metrics</span>
              <ActivityIcon className="w-2.5 h-2.5 text-gray-800" />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
              <StatusIndicator system="Engine" state={systemStatus.Engine} icon={EngineIcon} />
              <StatusIndicator system="Battery" state={systemStatus.Battery} icon={BatteryIcon} />
              <StatusIndicator system="Navigation" state={systemStatus.Navigation} icon={NavigationIcon} />
              <StatusIndicator system="Infotainment" state={systemStatus.Infotainment} icon={InfotainmentIcon} />
              <div className="col-span-2">
                <StatusIndicator system="Handling" state={systemStatus.Handling} icon={SteeringWheelIcon} />
              </div>
          </div>
      </div>

      <div className="px-2 mb-2">
          <div className="p-2 bg-black/80 rounded-xl border-2 border-zinc-900 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                  <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Ambient Flow</span>
                  <MusicIcon className="w-2.5 h-2.5 text-gray-600" />
              </div>
              <div className="grid grid-cols-3 gap-1">
                  {(['VOID', 'REACTOR', 'TERRA'] as SoundscapeType[]).map(s => (
                      <button
                        key={s}
                        onClick={() => onSetSoundscape?.(s)}
                        className={`text-[6px] font-black uppercase py-1.5 rounded border transition-all ${
                            soundscape === s 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_8px_blue]' 
                            : 'bg-black text-gray-600 border-zinc-800 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      <div className="px-2 mb-4">
          <div className="p-2 bg-black/80 rounded-xl border-2 border-zinc-900 flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                  <span className="text-[7px] font-black text-violet-500 uppercase tracking-widest">Law Intensity</span>
                  <span className="text-[10px] font-comic-header text-white">{((governance?.lawLevel ?? 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-600 transition-all duration-1000" style={{ width: `${(governance?.lawLevel || 0) * 100}%` }} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${governance?.symphonicFreedom ? 'bg-cyan-400 animate-ping shadow-[0_0_5px_cyan]' : 'bg-gray-700'}`} />
                  <span className={`text-[7px] font-black uppercase ${governance?.symphonicFreedom ? 'text-cyan-400' : 'text-gray-600'}`}>
                      {governance?.symphonicFreedom ? 'Symphonic Freedom: ON' : 'Freedom: Restricted'}
                  </span>
              </div>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar space-y-5 pb-10">
            <div className="px-1 mb-4">
                <button 
                    onClick={onToggleTerminal}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all ${isTerminal ? 'bg-green-600 text-black border-white' : 'bg-black text-green-500 border-green-900/40 hover:border-green-500'}`}
                >
                    <TerminalIcon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{isTerminal ? 'EXIT TERMINAL' : 'TERMINAL MODE'}</span>
                </button>
            </div>

            {navigationSections.map(section => {
                const isSectionCollapsed = collapsed[section.title];
                return (
                    <div key={section.title} className="space-y-1.5">
                        <button 
                            onClick={() => toggleSection(section.title)}
                            className="w-full flex items-center justify-between px-1 hover:opacity-100 transition-opacity"
                        >
                            <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{section.title}</h3>
                            <ChevronDownIcon className={`w-3 h-3 text-gray-700 transition-transform ${isSectionCollapsed ? '-rotate-90' : ''}`} />
                        </button>
                        
                        {!isSectionCollapsed && (
                            <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                                {section.items.map(({ view, text, icon: Icon }) => {
                                    const isActive = currentView === view;
                                    const isLocked = !unlockedViews.includes(view);
                                    if (!Icon) return null; // Defensive check for undefined icons
                                    return (
                                        <button
                                            key={view}
                                            onClick={() => onSetView(view)}
                                            className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl sidebar-button transition-all text-left group ${isActive ? 'active scale-[1.02]' : (isLocked ? 'opacity-30 grayscale cursor-not-allowed' : 'opacity-60 hover:opacity-100 hover:bg-white/5')}`}
                                        >
                                            <div className={`p-1.5 rounded-lg border-2 ${isActive ? 'bg-red-500 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]' : 'bg-black border-white/5 group-hover:border-white/20'}`}>
                                                {isLocked ? <ShieldIcon className="w-4 h-4 text-red-900" /> : <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-insight-sapphire'}`} />}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-white' : (isLocked ? 'text-gray-700' : 'text-gray-400')}`}>
                                                {isLocked ? 'REDACTED' : text}
                                            </span>
                                            {isActive && (
                                                <div className="ml-auto w-1 h-1 rounded-full bg-white animate-pulse" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
      </div>

      <div className="p-4 bg-black border-t-2 border-white/5 space-y-3">
          <p className="text-[7px] font-black text-gray-700 uppercase tracking-[0.3em] text-center">Root Command Relay</p>
          <div className="flex justify-center gap-2">
            {['OS', 'NET', 'LAB', 'USR'].map(s => (
                <div key={s} className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_6px_red]" />
                    <span className="text-[5px] text-gray-800 font-bold uppercase">{s}</span>
                </div>
            ))}
          </div>
      </div>
    </aside>
  );
};
