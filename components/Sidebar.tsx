
import React, { useMemo, useState } from 'react';
import type { SystemStatus, VehicleSystem, MainView } from '../types';
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
    CalendarIcon, FlagIcon, BrainIcon, ShieldIcon, HomeIcon, VaultIcon
} from './icons';

interface SidebarProps {
  systemStatus: SystemStatus;
  systemDetails: any;
  currentView: MainView;
  onSetView: (view: MainView) => void;
  currentDateTime: Date;
  timeFormat: '12hr' | '24hr';
  onToggleTimeFormat: () => void;
  unlockedViews: MainView[];
}

interface NavSection {
    title: string;
    path: string;
    items: { view: MainView; text: string; icon: React.FC<{className?: string}> }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ systemStatus, currentView, onSetView, currentDateTime, timeFormat, onToggleTimeFormat, unlockedViews }) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
      setCollapsed(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const navigationSections: NavSection[] = [
    {
        title: 'Net Folder (Root)',
        path: 'root://coding_network',
        items: [
            { view: 'coding_network', text: 'NET DIRECTIVES', icon: GlobeIcon },
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
            { view: 'vault', text: 'CONJUNCTION HUB', icon: VaultIcon },
            { view: 'singularity_engine', text: 'SINGULARITY', icon: ActivityIcon },
            { view: 'diagnostics', text: 'FORENSIC AUDIT', icon: WrenchIcon },
            { view: 'communications', text: 'SIGNAL BRIDGE', icon: BroadcastIcon },
            { view: 'up_north', text: 'UP NORTH PROTOCOL', icon: ShieldIcon },
            { view: 'device_link', text: 'DEVICE LINK', icon: ShareIcon },
            { view: 'bluetooth_bridge', text: 'BLUETOOTH SIG', icon: SignalIcon },
            { view: 'launch_center', text: 'LAUNCH CENTER', icon: FlagIcon },
        ]
    },
    {
        title: 'Logic Shards (Labs)',
        path: 'root://labs/dev',
        items: [
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
            { view: 'laws_justice_lab', text: 'LAWS & JUSTICE', icon: GavelIcon },
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
        ]
    }
  ];

  const formattedTime = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = timeFormat === '12hr'
      ? { hour: 'numeric', minute: '2-digit', hour12: true }
      : { hour: 'numeric', minute: '2-digit', hour12: false };
    return currentDateTime.toLocaleTimeString('en-US', options);
  }, [currentDateTime, timeFormat]);

  const currentPath = useMemo(() => {
      const section = navigationSections.find(s => s.items.some(i => i.view === currentView));
      return section ? section.path : 'root://aetheros';
  }, [currentView]);

  return (
    <aside className="w-60 h-full flex-shrink-0 flex flex-col bg-[#050505] border-r-4 border-black z-50">
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

      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar space-y-5 pb-10">
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
                                    return (
                                        <button
                                            key={view}
                                            onClick={() => onSetView(view)}
                                            className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl sidebar-button transition-all text-left group ${isActive ? 'active scale-[1.02]' : (isLocked ? 'opacity-30 grayscale cursor-not-allowed' : 'opacity-60 hover:opacity-100 hover:bg-white/5')}`}
                                        >
                                            <div className={`p-1.5 rounded-lg border-2 ${isActive ? 'bg-red-500 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-black border-white/5 group-hover:border-white/20'}`}>
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
