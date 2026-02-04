
import React from 'react';

// Re-exporting from existing individual icon files
export * from './SpeakerIcon';
export * from './SpeakerOffIcon';
export * from './UserIcon';
export * from './BotIcon';
export * from './ClipboardIcon';
export * from './PaperclipIcon';
export * from './XIcon';
export * from './FileIcon';
export * from './DownloadIcon';
export * from './ChevronDownIcon';
export * from './CheckCircleIcon';
export * from './AetherOSIcon';
export * from './MicrophoneIcon';
export * from './AnalyzeIcon';
export * from './EngineIcon';
export * from './BatteryIcon';
export * from './NavigationIcon';
export * from './InfotainmentIcon';
export * from './WarningIcon';
export * from './WrenchIcon';
export * from './MessageCircleIcon';
export * from './TerminalIcon';
export * from './FireIcon';
export * from './ServerIcon';
export * from './PinIcon';
export * from './ShareIcon';
export * from './ArchiveIcon';
export * from './LearnIcon';
export * from './CodeIcon';
export * from './SteeringWheelIcon';
export * from './SuspensionIcon';
export * from './TractionIcon';
export * from './RefactorIcon';
export * from './ForgeIcon';
export * from './ActivityIcon';
export * from './SearchIcon';
export * from './ZapIcon';
export * from './ShieldIcon';
export * from './ThermometerIcon';
export * from './SignalIcon';
export * from './MusicIcon';
export * from './BookOpenIcon';
export * from './BuildIcon';
export * from './BroadcastIcon';
export * from './UploadIcon';
export * from './InstallIcon';
export * from './PlusIcon';
export * from './PlusSquareIcon';
export * from './CheckSquareIcon';
export * from './CustomIcon';
export * from './EditIcon';
export * from './LogicIcon';
export * from './GaugeIcon';
export * from './BrainIcon';
export * from './StarIcon';
export * from './RulesIcon';
export * from './DebugIcon';
export * from './FocusIcon';
export * from './GitBranchIcon';
export * from './VaultIcon';
export * from './DoveIcon';
export * from './HomeIcon';
export * from './OptimizerIcon';
export * from './ChevronUpIcon';
export * from './GavelIcon';
export * from './EyeIcon';

// Helper for creating SVG icons in a .ts file without JSX
const createIcon = (d: string, viewBox = "0 0 24 24") => {
  return ({ className }: { className?: string }) => React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: viewBox,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    // Fix: replaced '=' with ':' for valid object literal property syntax
    strokeLinecap: "round",
    // Fix: replaced '=' with ':' for valid object literal property syntax
    strokeLinejoin: "round",
    className: className
  }, React.createElement('path', { d: d }));
};

// Defining missing icons as constants
export const GlobeIcon = createIcon("M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z");
export const BookIcon = createIcon("M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z");
export const MovieIcon = createIcon("M2 18v3c0 .6.4 1 1 1h4 M7 22c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h4 M22 2v20 M18 5l4 4 M18 19l4-4");
export const FlagIcon = createIcon("M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7");
export const ClockIcon = createIcon("M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2");
export const CalendarIcon = createIcon("M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18");

// Conjunction Series Specific Icons
export const AtomIcon = createIcon("M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2");
export const FlaskIcon = createIcon("M9 3h6v3l-4 8v4h-4v-4l-4-8z");
export const DinoIcon = createIcon("M12 2L2 7l10 5 10-5-10-5z");
export const GemIcon = createIcon("M6 3h12l3 6-9 12-9-12z");
export const ShirtIcon = createIcon("M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z");
export const ConceptIcon = createIcon("M2 6h20M2 12h20M2 18h20");
export const CleanIcon = createIcon("M20 7h-9m3 3H5m5 3h10m-4 3H9");
export const TruthIcon = createIcon("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z");
export const TestTubeIcon = createIcon("M9 3h6v13a3 3 0 11-6 0V3z");
export const WindowsIcon = createIcon("M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z");
export const LinuxIcon = createIcon("M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z");
export const AppleIcon = createIcon("M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z");
export const MissionIcon = createIcon("M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5");
export const PhoneIcon = createIcon("M17 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2z");
export const ScaleIcon = createIcon("M3 6h18M12 2v20M7 22h10");

export const SpinnerIcon = ({ className }: { className?: string }) => React.createElement('svg', {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  // Fix: replaced '=' with ':' for valid object literal property syntax
  strokeLinecap: "round",
  // Fix: replaced '=' with ':' for valid object literal property syntax
  strokeLinejoin: "round",
  className: `${className} animate-spin`
}, React.createElement('path', { d: "M21 12a9 9 0 1 1-6.219-8.56" }));
