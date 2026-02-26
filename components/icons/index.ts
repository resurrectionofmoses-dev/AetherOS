
import React from 'react';

// --- NAMED RE-EXPORTS FROM INDIVIDUAL FILES ---
export { LearnIcon, PackageIcon } from './LearnIcon';
export { BuildIcon } from './BuildIcon';
export { RefactorIcon } from './RefactorIcon';
export { UserIcon } from './UserIcon';
export { BotIcon } from './BotIcon';
export { ClipboardIcon } from './ClipboardIcon';
export { CustomIcon } from './CustomIcon';
export { EditIcon } from './EditIcon';
export { LogicIcon } from './LogicIcon';
export { ChevronDownIcon } from './ChevronDownIcon';
export { SpeakerIcon } from './SpeakerIcon';
export { SpeakerOffIcon } from './SpeakerOffIcon';
export { MicrophoneIcon } from './MicrophoneIcon';
export { PaperclipIcon } from './PaperclipIcon';
export { XIcon } from './XIcon';
export { ImplementIcon } from './ImplementIcon';
export { FileIcon } from './FileIcon';
export { DownloadIcon } from './DownloadIcon';
export { RulesIcon } from './RulesIcon';
export { DebugIcon } from './DebugIcon';
export { PlusSquareIcon } from './PlusSquareIcon';
export { CheckSquareIcon } from './CheckSquareIcon';
export { FocusIcon } from './FocusIcon';
export { GitBranchIcon } from './GitBranchIcon';
export { PlusIcon } from './PlusIcon';
export { SteeringWheelIcon } from './SteeringWheelIcon';
export { BookOpenIcon } from './BookOpenIcon';
export { CheckCircleIcon } from './CheckCircleIcon';
export { ChevronLeftIcon } from './ChevronLeftIcon';
export { ChevronRightIcon } from './ChevronRightIcon';
export { GavelIcon } from './GavelIcon';
export { FireIcon } from './FireIcon';
export { SecurityIcon } from './SecurityIcon';
export { OptimizerIcon } from './OptimizerIcon';
export { DocumenterIcon } from './DocumenterIcon';
export { AetherOSIcon } from './AetherOSIcon';
export { AnalyzeIcon } from './AnalyzeIcon';
export { EngineIcon } from './EngineIcon';
export { BatteryIcon } from './BatteryIcon';
export { NavigationIcon } from './NavigationIcon';
export { InfotainmentIcon } from './InfotainmentIcon';
export { WarningIcon } from './WarningIcon';
export { WrenchIcon } from './WrenchIcon';
export { MessageCircleIcon } from './MessageCircleIcon';
export { ThermometerIcon } from './ThermometerIcon';
export { ZapIcon } from './ZapIcon';
export { SignalIcon } from './SignalIcon';
export { MusicIcon } from './MusicIcon';
export { InstallIcon } from './InstallIcon';
export { UploadIcon } from './UploadIcon';
export { SpinnerIcon } from './SpinnerIcon';
export { GaugeIcon } from './GaugeIcon';
export { BrainIcon } from './BrainIcon';
export { CodeIcon } from './CodeIcon';
export { SuspensionIcon } from './SuspensionIcon';
export { TractionIcon } from './TractionIcon';
export { ForgeIcon, HammerIcon } from './ForgeIcon';
export { ArchiveIcon } from './ArchiveIcon';
export { SettingsIcon } from './SettingsIcon';
export { ChevronUpIcon } from './ChevronUpIcon';
export { VaultIcon } from './VaultIcon';
export { SearchIcon } from './SearchIcon';
export { PinIcon } from './PinIcon';
export { ShareIcon } from './ShareIcon';
export { ActivityIcon } from './ActivityIcon';
export { EyeIcon } from './EyeIcon';
export { ShieldIcon } from './ShieldIcon';
export { TerminalIcon } from './TerminalIcon';

// --- HOC GENERATED ICONS ---
function createIcon(d: string, viewBox = "0 0 24 24") {
  return function GeneratedIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return React.createElement('svg', {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: viewBox,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: className,
      style: style
    }, React.createElement('path', { d: d }));
  };
}

export const CpuIcon = createIcon("M4 7V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3 M4 17v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3 M9 2v3 M15 2v3 M9 19v3 M15 19v3 M2 9h3 M2 15h3 M19 9h3 M19 15h3 M7 7h10v10H7z");
export const BugIcon = createIcon("M3.97 9C3.358 9.612 3 10.462 3 11.4c0 1.175.569 2.215 1.435 2.855L3 18h2l1.5-3.5h7L15 18h2l-1.435-3.745C16.431 13.615 17 12.575 17 11.4c0-.938-.358-1.788-.97-2.4M3.97 9L6 6h8l2.03 3M3.97 9h12.06M7 11h.01M13 11h.01");
export const AlertTriangleIcon = createIcon("M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01");
export const ClockIcon = createIcon("M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z");
export const StarIcon = createIcon("M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z");
export const LockIcon = createIcon("M12 11V7a4 4 0 0 0-8 0v4 M12 11h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2");
export const SparklesIcon = createIcon("M12 3l1.912 5.813L21 9l-5.813 1.912L12 21l-1.912-5.813L3 15l5.813-1.912L12 3z M5 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z");
export const GlobeIcon = createIcon("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z");
export const BookIcon = createIcon("M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z");
export const CalendarIcon = createIcon("M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18");
export const AtomIcon = createIcon("M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z");
export const TruthIcon = createIcon("M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z");
export const DinoIcon = createIcon("M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z");
export const ShirtIcon = createIcon("M12 2L4 4v14l8 4 8-4V4l-8-2z");
export const ConceptIcon = createIcon("M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z");
export const FlagIcon = createIcon("M12 2l-1 5h2l-1-5zM5 22h14v-2H5v2zm7-18c-3.87 0-7 3.13-7 7 0 2.38 1.19 4.47 3 5.74V20h8v-3.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z");
export const HomeIcon = createIcon("M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6");
export const ServerIcon = createIcon("M2 2h20v8H2z M2 14h20v8H2z M6 6h.01 M6 18h.01");
export const BroadcastIcon = createIcon("M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.07 4.93a10 10 0 0 1 0 14.14 M4.93 19.07a10 10 0 0 1 0-14.14");
export const PhoneIcon = createIcon("M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z M12 18h.01");
export const MovieIcon = createIcon("M23 7l-7 5 7 5V7z M2 5h14v14H2z");
export const ScaleIcon = createIcon("M12 3v18 M12 7l10 5-10 5 M12 7l-10 5 10 5");
export const GemIcon = createIcon("M6 3h12l4 6-10 12L2 9z");
export const WindowsIcon = createIcon("M3 3h8v8H3z M13 3h8v8h-8z M3 13h8v8H3z M13 13h8v8h-8z");
export const LinuxIcon = createIcon("M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z");
export const AppleIcon = createIcon("M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z");
export const MissionIcon = createIcon("M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z");
export const FlaskIcon = createIcon("M9 3h6v3l5 11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L9 6V3z");

export const TestTubeIcon = FlaskIcon;
export const CleanIcon = SparklesIcon;
