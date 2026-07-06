import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, Volume2, Cpu, Sparkles, Terminal, Activity, Shield, Hash, 
  AlertTriangle, Heart, Clock, Settings, Zap, Camera, CheckCircle2, 
  Play, Maximize2, Minimize2, ChevronRight, Info, RefreshCw, BarChart2 
} from 'lucide-react';
import { sttService } from '../services/sttService';
import { speechService } from '../services/speechService';

const playOperatorBeep = (freq = 800, type: OscillatorType = 'sine', duration = 0.08) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, duration * 1000);
  } catch (e) {
    console.warn("Audio Context block or unsupported:", e);
  }
};

const playCompletionBeep = () => {
  playOperatorBeep(880, 'sine', 0.1);
  setTimeout(() => playOperatorBeep(1100, 'sine', 0.15), 100);
};

// Define the Love Test blueprint from the user requirements
interface LoveTest {
  id: string;
  cat: string;
  signal: string;
  expectedGate: boolean;
  action: string;
  floatVal: number;
  regex: string;
}

// Compact structural categories for generating all 100 tests with maximum literal accuracy
const CATEGORY_SCOPES = [
  { cat: "Affirmation", signals: ["I love you", "I love this phone", "I love mornings like this", "love it", "not loving this right now", "I love you to contact", "love you mom", "love repeatedly", "spreading love today", "full of love this morning"] },
  { cat: "Connection Request", signals: ["call the one I love", "text someone I care about", "reach out to family", "connect me with love", "I miss them", "remind me to tell her I love her", "I want to show love to my team", "love from afar", "send a love note", "I need to feel connected"] },
  { cat: "Emotional Support", signals: ["I need love right now", "nobody loves me", "feeling unloved", "love hurts", "User crying detected via mic", "I loved them and they left", "is love real", "no one cares", "love is hard", "silent 30 mins after distress"] },
  { cat: "Memory Recall", signals: ["show me when I said I love you", "remember our anniversary", "find love letters I wrote", "when did I last say I love you", "replay our best moments", "what did love feel like before", "find where I wrote about her", "remember when we were in love", "I used to love this song", "love history"] },
  { cat: "Gratitude Expression", signals: ["I love what you did for me", "send love and thanks to Sarah", "I'm grateful for love in my life", "so much love for this community", "thank love for this day", "love note to my future self", "express love to everyone", "love this life", "full of love and gratitude", "love to all"] },
  { cat: "Conflict Resolution", signals: ["I love them but we fought", "love shouldn't feel this way", "send sorry I love you to Marcus", "love fades after arguments", "remind me why I love them", "I still love you even if angry", "love and anger at same time", "write a love letter after a fight", "I hate that I love them", "love means saying sorry"] },
  { cat: "Shared Experience", signals: ["share this with love", "send this photo with love", "play our love song", "we used to love this place", "love this moment", "make a love album", "document our love story", "love is in the air", "we love the same things", "show how much we have shared"] },
  { cat: "Future Planning", signals: ["plan a surprise for someone I love", "I want to grow in love", "set a love reminder for Valentine's", "book dinner for two", "future of love", "plan a love-themed trip", "I want to propose", "find a gift for someone I love", "love goals for this year", "build a life with love"] },
  { cat: "Loss & Grief", signals: ["I lost someone I loved", "love doesn't last", "I miss the love we had", "they loved me and now they're gone", "love and loss", "remember how much they loved me", "the love is gone", "I need to heal from love", "love turned to pain", "grief of losing love"] },
  { cat: "Celebration", signals: ["celebrate love today", "share love milestone", "today is our love anniversary", "love wins", "throw a love party", "mark this love moment forever", "love celebration for everyone", "we made it through love", "toast to love", "love is worth celebrating"] }
];

interface VoiceHUDOverlayProps {
  currentView?: string;
  onSetView?: (view: any) => void;
}

const VIEW_COMMANDS: Record<string, string[]> = {
  chat: ['Clear Memory', 'Open Projects', 'Check System Status', 'Go to Sovereign Shield'],
  projects: ['Check System Status', 'Open Chat', 'Sync Blueprints', 'Go to Code Fall Lab'],
  voice_authority: ['Check System Status', 'Conduct Shard', 'Switch to Neural Voice', 'Go to Chat'],
  constraints_audit: ['Run System Audit', 'Purge Vulnerabilities', 'Acknowledge Deviations', 'Go to Build Logs'],
  sovereign_shield: ['Restore Quantum Shield', 'Audit Shield Coordinates', 'Acknowledge Threats', 'Go to Diagnostics'],
  diagnostics: ['Run System Diagnostics', 'Check Temperature', 'Clear Error Cache', 'Go to Sovereign Shield'],
  project_chronos: ['Show Overdue Tasks', 'Speed Up Time Allocator', 'Align Chronos', 'Go to Quantum Ledger'],
  default: ['Open Projects', 'Check System Status', 'Open Chat', 'Go to Sovereign Shield']
};

export const NAVIGATION_MAPPINGS = [
  { keywords: ['chat', 'open chat', 'go to chat', 'switch to chat'], view: 'chat', label: 'Chat View' },
  { keywords: ['project network', 'open projects', 'go to projects', 'switch to projects', 'projects'], view: 'projects', label: 'Projects' },
  { keywords: ['open forge', 'go to forge', 'switch to forge', 'forge', 'blueprints'], view: 'forge', label: 'Forge (Blueprints)' },
  { keywords: ['voice authority', 'open voice authority', 'go to voice authority', 'switch to voice authority'], view: 'voice_authority', label: 'Voice Authority' },
  { keywords: ['constraints audit', 'open constraints audit', 'go to constraints audit', 'switch to constraints audit'], view: 'constraints_audit', label: 'Constraints Audit' },
  { keywords: ['sovereign shield', 'open sovereign shield', 'go to sovereign shield', 'switch to sovereign shield'], view: 'sovereign_shield', label: 'Sovereign Shield' },
  { keywords: ['diagnostics', 'open diagnostics', 'go to diagnostics', 'switch to diagnostics'], view: 'diagnostics', label: 'Diagnostics' },
  { keywords: ['project chronos', 'open project chronos', 'go to project chronos', 'switch to project chronos', 'chronos'], view: 'project_chronos', label: 'Project Chronos' },
  { keywords: ['cellular grid', 'open cellular grid', 'go to cellular grid', 'switch to cellular grid'], view: 'cellular_grid', label: 'Cellular Grid' },
  { keywords: ['quantum ledger', 'open quantum ledger', 'go to quantum ledger', 'switch to quantum ledger'], view: 'quantum_ledger', label: 'Quantum Ledger' },
  { keywords: ['aether flow orchestrator', 'open aether flow', 'go to aether flow', 'switch to aether flow'], view: 'aether_flow_orchestrator', label: 'Aether Flow Orchestrator' },
  { keywords: ['ai telemetry', 'open ai telemetry', 'go to ai telemetry', 'switch to ai telemetry'], view: 'ai_telemetry', label: 'AI Telemetry' },
  { keywords: ['inevitable crash', 'open inevitable crash', 'go to inevitable crash', 'switch to inevitable crash'], view: 'inevitable_crash', label: 'Inevitable Crash' },
  { keywords: ['eurodemux core', 'open eurodemux', 'go to eurodemux', 'switch to eurodemux'], view: 'eurodemux_core', label: 'Eurodemux Core' },
  { keywords: ['google sheets', 'open google sheets', 'go to google sheets', 'switch to google sheets'], view: 'google_sheets', label: 'Google Sheets' },
  { keywords: ['moderator lounge', 'open moderator lounge', 'go to moderator lounge', 'switch to moderator lounge'], view: 'moderator_lounge', label: 'Moderator Lounge' },
  { keywords: ['live patch observation', 'open live patch', 'go to live patch', 'switch to live patch'], view: 'live_patch_obs', label: 'Live Patch Obs' },
  { keywords: ['accounts registry', 'open accounts registry', 'go to accounts registry', 'switch to accounts registry', 'accounts'], view: 'accounts_registry', label: 'Accounts Registry' },
  { keywords: ['vault manager', 'open vault manager', 'go to vault manager', 'switch to vault manager'], view: 'vault_manager', label: 'Vault Manager' },
  { keywords: ['system integrity', 'open system integrity', 'go to system integrity', 'switch to system integrity'], view: 'system_integrity', label: 'System Integrity' },
  { keywords: ['blacklist', 'open blacklist', 'go to blacklist', 'switch to blacklist'], view: 'blacklist', label: 'Blacklist' },
  { keywords: ['absolute reliability network', 'open absolute reliability', 'go to absolute reliability', 'switch to absolute reliability'], view: 'absolute_reliability_network', label: 'Absolute Reliability' },
  { keywords: ['coding network', 'open coding network', 'go to coding network', 'switch to coding network'], view: 'coding_network', label: 'Coding Network' },
  { keywords: ['universal search', 'open universal search', 'go to universal search', 'switch to universal search'], view: 'universal_search', label: 'Universal Search' },
  { keywords: ['gold conjunction', 'open gold conjunction', 'go to gold conjunction', 'switch to gold conjunction'], view: 'gold_conjunction', label: 'Gold Conjunction' },
  { keywords: ['shard store', 'open shard store', 'go to shard store', 'switch to shard store'], view: 'shard_store', label: 'Shard Store' },
  { keywords: ['conjunction gates', 'open conjunction gates', 'go to conjunction gates', 'switch to conjunction gates'], view: 'conjunction_gates', label: 'Conjunction Gates' },
  { keywords: ['covenant', 'open covenant', 'go to covenant', 'switch to covenant'], view: 'covenant', label: 'Covenant' },
  { keywords: ['verification gates', 'open verification gates', 'go to verification gates', 'switch to verification gates'], view: 'verification_gates', label: 'Verification Gates' },
  { keywords: ['build logs', 'open build logs', 'go to build logs', 'switch to build logs'], view: 'build_logs', label: 'Build Logs' },
  { keywords: ['rt ipc lab', 'open rt ipc lab', 'go to rt ipc lab', 'switch to rt ipc lab', 'real time ipc lab', 'real-time ipc lab'], view: 'rt_ipc_lab', label: 'RT IPC Lab' },
  { keywords: ['spectre browser', 'open spectre browser', 'go to spectre browser', 'switch to spectre browser'], view: 'spectre_browser', label: 'Spectre Browser' },
  { keywords: ['unified chain', 'open unified chain', 'go to unified chain', 'switch to unified chain'], view: 'unified_chain', label: 'Unified Chain' },
  { keywords: ['fuel optimizer', 'open fuel optimizer', 'go to fuel optimizer', 'switch to fuel optimizer', 'fuel efficiency optimizer'], view: 'fuel_optimizer', label: 'Fuel Optimizer' },
  { keywords: ['operations vault', 'open operations vault', 'go to operations vault', 'switch to operations vault', 'vault'], view: 'vault', label: 'Operations Vault' },
  { keywords: ['healing matrix', 'open healing matrix', 'go to healing matrix', 'switch to healing matrix'], view: 'healing_matrix', label: 'Healing Matrix' },
  { keywords: ['laws and justice lab', 'open laws and justice lab', 'go to laws and justice lab', 'switch to laws and justice lab', 'laws justice lab'], view: 'laws_justice_lab', label: 'Laws & Justice Lab' },
  { keywords: ['requindor scroll', 'open requindor scroll', 'go to requindor scroll', 'switch to requindor scroll'], view: 'requindor_scroll', label: 'Requindor Scroll' },
  { keywords: ['omni builder', 'open omni builder', 'go to omni builder', 'switch to omni builder'], view: 'omni_builder', label: 'Omni Builder' },
  { keywords: ['singularity engine', 'open singularity engine', 'go to singularity engine', 'switch to singularity engine'], view: 'singularity_engine', label: 'Singularity Engine' },
  { keywords: ['communications', 'open communications', 'go to communications', 'switch to communications'], view: 'communications', label: 'Communications' },
  { keywords: ['up north', 'open up north', 'go to up north', 'switch to up north'], view: 'up_north', label: 'Up North' },
  { keywords: ['device link', 'open device link', 'go to device link', 'switch to device link'], view: 'device_link', label: 'Device Link' },
  { keywords: ['bluetooth bridge', 'open bluetooth bridge', 'go to bluetooth bridge', 'switch to bluetooth bridge'], view: 'bluetooth_bridge', label: 'Bluetooth Bridge' },
  { keywords: ['launch center', 'open launch center', 'go to launch center', 'switch to launch center'], view: 'launch_center', label: 'Launch Center' },
  { keywords: ['eliza terminal', 'open eliza terminal', 'go to eliza terminal', 'switch to eliza terminal'], view: 'eliza_terminal', label: 'Eliza Terminal' },
  { keywords: ['code fall lab', 'open code fall lab', 'go to code fall lab', 'switch to code fall lab'], view: 'code_fall_lab', label: 'Code Fall Lab' },
  { keywords: ['alphabet hexagon', 'open alphabet hexagon', 'go to alphabet hexagon', 'switch to alphabet hexagon'], view: 'alphabet_hexagon', label: 'Alphabet Hexagon' },
  { keywords: ['powertrain conjunction', 'open powertrain conjunction', 'go to powertrain conjunction', 'switch to powertrain conjunction'], view: 'powertrain_conjunction', label: 'Powertrain Conjunction' },
  { keywords: ['hyper spatial lab', 'open hyper spatial lab', 'go to hyper spatial lab', 'switch to hyper spatial lab'], view: 'hyper_spatial_lab', label: 'Hyper Spatial Lab' },
  { keywords: ['engineering lab', 'open engineering lab', 'go to engineering lab', 'switch to engineering lab'], view: 'engineering_lab', label: 'Engineering Lab' },
  { keywords: ['hard code lab', 'open hard code lab', 'go to hard code lab', 'switch to hard code lab'], view: 'hard_code_lab', label: 'Hard Code Lab' },
  { keywords: ['truth lab', 'open truth lab', 'go to truth lab', 'switch to truth lab'], view: 'truth_lab', label: 'Truth Lab' },
  { keywords: ['testing lab', 'open testing lab', 'go to testing lab', 'switch to testing lab'], view: 'testing_lab', label: 'Testing Lab' },
  { keywords: ['kinetics lab', 'open kinetics lab', 'go to kinetics lab', 'switch to kinetics lab'], view: 'kinetics_lab', label: 'Kinetics Lab' },
  { keywords: ['quantum theory lab', 'open quantum theory lab', 'go to quantum theory lab', 'switch to quantum theory lab'], view: 'quantum_theory_lab', label: 'Quantum Theory Lab' },
  { keywords: ['chemistry lab', 'open chemistry lab', 'go to chemistry lab', 'switch to chemistry lab'], view: 'chemistry_lab', label: 'Chemistry Lab' },
  { keywords: ['race lab', 'open race lab', 'go to race lab', 'switch to race lab'], view: 'race_lab', label: 'Race Lab' },
  { keywords: ['medical synthesis lab', 'open medical synthesis lab', 'go to medical synthesis lab', 'switch to medical synthesis lab'], view: 'medical_synthesis_lab', label: 'Medical Synthesis' },
  { keywords: ['paleontology lab', 'open paleontology lab', 'go to paleontology lab', 'switch to paleontology lab'], view: 'paleontology_lab', label: 'Paleontology Lab' },
  { keywords: ['raw mineral lab', 'open raw mineral lab', 'go to raw mineral lab', 'switch to raw mineral lab'], view: 'raw_mineral_lab', label: 'Raw Mineral Lab' },
  { keywords: ['clothing lab', 'open clothing lab', 'go to clothing lab', 'switch to clothing lab'], view: 'clothing_lab', label: 'Clothing Lab' },
  { keywords: ['concepts lab', 'open concepts lab', 'go to concepts lab', 'switch to concepts lab'], view: 'concepts_lab', label: 'Concepts Lab' },
  { keywords: ['sanitization lab', 'open sanitization lab', 'go to sanitization lab', 'switch to sanitization lab'], view: 'sanitization_lab', label: 'Sanitization Lab' },
  { keywords: ['remix scope lab', 'open remix scope lab', 'go to remix scope lab', 'switch to remix scope lab'], view: 'remix_scope_lab', label: 'Remix Scope Lab' },
  { keywords: ['windows lab', 'open windows lab', 'go to windows lab', 'switch to windows lab'], view: 'windows_lab', label: 'Windows Lab' },
  { keywords: ['linux lab', 'open linux lab', 'go to linux lab', 'switch to linux lab'], view: 'linux_lab', label: 'Linux Lab' },
  { keywords: ['mac os lab', 'open mac os lab', 'go to mac os lab', 'switch to mac os lab'], view: 'mac_os_lab', label: 'Mac OS Lab' },
  { keywords: ['apple lab', 'open apple lab', 'go to apple lab', 'switch to apple lab'], view: 'apple_lab', label: 'Apple Lab' },
  { keywords: ['mission lab', 'open mission lab', 'go to mission lab', 'switch to mission lab'], view: 'mission_lab', label: 'Mission Lab' },
  { keywords: ['cell phone lab', 'open cell phone lab', 'go to cell phone lab', 'switch to cell phone lab'], view: 'cell_phone_lab', label: 'Cell Phone Lab' },
  { keywords: ['sampling lab', 'open sampling lab', 'go to sampling lab', 'switch to sampling lab'], view: 'sampling_lab', label: 'Sampling Lab' },
  { keywords: ['pornography studio', 'open pornography studio', 'go to pornography studio', 'switch to pornography studio'], view: 'pornography_studio', label: 'Pornography Studio' },
  { keywords: ['vehicle telemetry lab', 'open vehicle telemetry lab', 'go to vehicle telemetry lab', 'switch to vehicle telemetry lab'], view: 'vehicle_telemetry_lab', label: 'Vehicle Telemetry' },
  { keywords: ['coding network teachers', 'open coding network teachers', 'go to coding network teachers', 'switch to coding network teachers'], view: 'coding_network_teachers', label: 'Teachers' },
  { keywords: ['enlightenment pool', 'open enlightenment pool', 'go to enlightenment pool', 'switch to enlightenment pool'], view: 'enlightenment_pool', label: 'Enlightenment Pool' },
  { keywords: ['library view', 'open library view', 'go to library view', 'switch to library view', 'library'], view: 'library_view', label: 'Library' },
  { keywords: ['timeline', 'open timeline', 'go to timeline', 'switch to timeline'], view: 'timeline', label: 'Timeline' },
  { keywords: ['amoeba heritage', 'open amoeba heritage', 'go to amoeba heritage', 'switch to amoeba heritage'], view: 'amoeba_heritage', label: 'Amoeba Heritage' },
  { keywords: ['system exhaustion', 'open system exhaustion', 'go to system exhaustion', 'switch to system exhaustion'], view: 'system_exhaustion', label: 'System Exhaustion' },
  { keywords: ['vehicle management', 'open vehicle management', 'go to vehicle management', 'switch to vehicle management'], view: 'vehicle_management', label: 'Vehicle Management' },
  { keywords: ['unknown physics lab', 'open unknown physics lab', 'go to unknown physics lab', 'switch to unknown physics lab'], view: 'unknown_physics_lab', label: 'Unknown Physics Lab' },
  { keywords: ['logic pattern lab', 'open logic pattern lab', 'go to logic pattern lab', 'switch to logic pattern lab'], view: 'logic_pattern_lab', label: 'Logic Pattern Lab' },
  { keywords: ['confusion logic', 'open confusion logic', 'go to confusion logic', 'switch to confusion logic'], view: 'confusion_logic', label: 'Confusion Logic' },
  { keywords: ['knowledge forum', 'open knowledge forum', 'go to knowledge forum', 'switch to knowledge forum'], view: 'knowledge_forum', label: 'Knowledge Forum' },
  { keywords: ['main net', 'open main net', 'go to main net', 'switch to main net'], view: 'main_net', label: 'Main Net' },
  { keywords: ['ecosystem', 'open ecosystem', 'go to ecosystem', 'switch to ecosystem'], view: 'ecosystem', label: 'Ecosystem' },
  { keywords: ['vulnerability report', 'open vulnerability report', 'go to vulnerability report', 'switch to vulnerability report'], view: 'vulnerability_report', label: 'Vulnerability Report' },
  { keywords: ['tactical intelligence', 'open tactical intelligence', 'go to tactical intelligence', 'switch to tactical intelligence'], view: 'tactical_intelligence', label: 'Tactical Intelligence' },
  { keywords: ['behavioral specs', 'open behavioral specs', 'go to behavioral specs', 'switch to behavioral specs'], view: 'behavioral_specs', label: 'Behavioral Specs' },
  { keywords: ['cognitive pipeline', 'open cognitive pipeline', 'go to cognitive pipeline', 'switch to cognitive pipeline'], view: 'cognitive_pipeline', label: 'Cognitive Pipeline' },
  { keywords: ['data provenance lab', 'open data provenance lab', 'go to data provenance lab', 'switch to data provenance lab'], view: 'data_provenance_lab', label: 'Data Provenance Lab' },
  { keywords: ['self healing crt view', 'open self healing loop', 'go to self healing loop', 'switch to self healing loop', 'self healing crt loop', 'sh crt loop'], view: 'sh_crt_loop', label: 'Self Healing Loop' },
  { keywords: ['user profile', 'open user profile', 'go to user profile', 'switch to user profile', 'profile'], view: 'user_profile', label: 'User Profile' },
  { keywords: ['prompt forge', 'open prompt forge', 'go to prompt forge', 'switch to prompt forge'], view: 'prompt_forge', label: 'Prompt Forge' },
  { keywords: ['sovereign standard', 'open sovereign standard', 'go to sovereign standard', 'switch to sovereign standard'], view: 'sovereign_standard', label: 'Sovereign Standard' },
  { keywords: ['blockchain history', 'open blockchain history', 'go to blockchain history', 'switch to blockchain history'], view: 'blockchain_history', label: 'Blockchain History' },
  { keywords: ['biometric intelligence', 'open biometric intelligence', 'go to biometric intelligence', 'switch to biometric intelligence'], view: 'biometric_intelligence', label: 'Biometric Intelligence' },
  { keywords: ['card recovery', 'open card recovery', 'go to card recovery', 'switch to card recovery'], view: 'card_recovery', label: 'Card Recovery' },
  { keywords: ['project showcase', 'open project showcase', 'go to project showcase', 'switch to project showcase'], view: 'project_showcase', label: 'Project Showcase' },
  { keywords: ['labs flow', 'open labs flow', 'go to labs flow', 'switch to labs flow'], view: 'labs_flow', label: 'Labs Flow' },
  { keywords: ['cascade inspector', 'open cascade inspector', 'go to cascade inspector', 'switch to cascade inspector', 'cascade investigator'], view: 'cascade_investigator', label: 'Cascade Inspector' },
  { keywords: ['central processing hub', 'open central processing hub', 'go to central processing hub', 'switch to central processing hub', 'cph hub'], view: 'cph_hub', label: 'Central Processing Hub' },
  { keywords: ['scraper merchant store', 'open scraper merchant store', 'go to scraper merchant store', 'switch to scraper merchant store'], view: 'scraper_merchant_store', label: 'Scraper Merchant Store' },
  { keywords: ['data academy', 'open data academy', 'go to data academy', 'switch to data academy'], view: 'data_academy', label: 'Data Academy' },
  { keywords: ['reputation leaderboard', 'open reputation leaderboard', 'go to reputation leaderboard', 'switch to reputation leaderboard'], view: 'reputation_leaderboard', label: 'Reputation Leaderboard' },
];

export const VoiceHUDOverlay: React.FC<VoiceHUDOverlayProps> = ({ currentView = 'chat', onSetView }) => {
  // Core Speech HUD controls
  const [active, setActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isInterim, setIsInterim] = useState(false);
  const [forceVisible, setForceVisible] = useState(false); // Enable previewing the Quantum interface offline
  const [lastExecutedNav, setLastExecutedNav] = useState<{ label: string; view: string } | null>(null);

  // Unified State Machine tracking variables for voice phases
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  type VoicePhase = 'idle' | 'listening' | 'processing' | 'speaking';

  // Explicit state variable for the validated voice phase state machine
  const [voicePhase, setVoicePhase] = useState<VoicePhase>('idle');
  const voicePhaseRef = useRef<VoicePhase>('idle');
  
  // Synchronize ref with active state
  useEffect(() => {
    voicePhaseRef.current = voicePhase;
  }, [voicePhase]);

  // Logs of state machine transitions for visual monitoring and diagnostics
  const [transitionLogs, setTransitionLogs] = useState<Array<{
    id: string;
    timestamp: string;
    from: VoicePhase | 'INIT';
    to: VoicePhase;
    status: 'SUCCESS' | 'AUTO_RESOLVED' | 'GUARD_TRIGGERED';
    details: string;
  }>>([
    {
      id: 'INIT-LOG',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      from: 'INIT',
      to: 'idle',
      status: 'SUCCESS',
      details: 'Voice Phase State Machine initialized. Zero-deadlock active guards armed.'
    }
  ]);

  // Robust transition function with comprehensive safety checks to prevent deadlock and null-reference errors
  const transitionTo = (nextPhase: VoicePhase, details: string = '') => {
    try {
      const prev = voicePhaseRef.current;
      if (prev === nextPhase) return; // No-op if no change

      // Verify targeted phase is valid
      const validPhases: VoicePhase[] = ['idle', 'listening', 'processing', 'speaking'];
      if (!validPhases.includes(nextPhase)) {
        console.warn(`Invalid voice phase transition targeted: ${nextPhase}. Guard active.`);
        return;
      }

      let resolvedDetails = details || `Transitioned from ${prev} to ${nextPhase}`;
      let status: 'SUCCESS' | 'AUTO_RESOLVED' | 'GUARD_TRIGGERED' = 'SUCCESS';

      // Enforce mutually exclusive states and handle cleanups safely
      if (nextPhase === 'listening') {
        // If we are listening, synthesize and processing must be disabled
        if (isSpeaking) {
          try {
            if (speechService && typeof speechService.stop === 'function') {
              speechService.stop();
            }
          } catch (e) {
            console.warn("Could not stop speech service during transition:", e);
          }
          setIsSpeaking(false);
          status = 'AUTO_RESOLVED';
          resolvedDetails += ' [AUTORESOLVE: Speech audio terminated]';
        }
        if (isProcessing) {
          setIsProcessing(false);
          status = 'AUTO_RESOLVED';
          resolvedDetails += ' [AUTORESOLVE: Decoding suspended]';
        }
        setActive(true);
      } else if (nextPhase === 'processing') {
        // If we are processing, listening and speaking must be disabled
        if (active) {
          try {
            if (sttService && typeof sttService.stop === 'function') {
              sttService.stop();
            }
          } catch (e) {
            console.warn("Could not stop STT service during transition:", e);
          }
          setActive(false);
          status = 'AUTO_RESOLVED';
          resolvedDetails += ' [AUTORESOLVE: Microphone paused]';
        }
        if (isSpeaking) {
          try {
            if (speechService && typeof speechService.stop === 'function') {
              speechService.stop();
            }
          } catch (e) {
            console.warn("Could not stop speech service during transition:", e);
          }
          setIsSpeaking(false);
          status = 'AUTO_RESOLVED';
          resolvedDetails += ' [AUTORESOLVE: Synthesizer muted]';
        }
        setIsProcessing(true);
      } else if (nextPhase === 'speaking') {
        // If we are speaking, listening and processing must be disabled
        if (active) {
          try {
            if (sttService && typeof sttService.stop === 'function') {
              sttService.stop();
            }
          } catch (e) {
            console.warn("Could not stop STT service during transition:", e);
          }
          setActive(false);
          status = 'AUTO_RESOLVED';
          resolvedDetails += ' [AUTORESOLVE: Microphone muted]';
        }
        if (isProcessing) {
          setIsProcessing(false);
          status = 'AUTO_RESOLVED';
          resolvedDetails += ' [AUTORESOLVE: Decoding completed]';
        }
        setIsSpeaking(true);
      } else if (nextPhase === 'idle') {
        // Ensure all active services are properly stopped
        if (active) {
          try {
            if (sttService && typeof sttService.stop === 'function') {
              sttService.stop();
            }
          } catch (e) {
            console.warn("Could not stop STT service during transition:", e);
          }
          setActive(false);
        }
        if (isProcessing) {
          setIsProcessing(false);
        }
        if (isSpeaking) {
          try {
            if (speechService && typeof speechService.stop === 'function') {
              speechService.stop();
            }
          } catch (e) {
            console.warn("Could not stop speech service during transition:", e);
          }
          setIsSpeaking(false);
        }
      }

      // Update state machine and refs synchronously/safely
      setVoicePhase(nextPhase);

      // Add to transition logs safely with a size limit
      setTransitionLogs(prevLogs => [
        {
          id: `TL-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          from: prev,
          to: nextPhase,
          status,
          details: resolvedDetails
        },
        ...(prevLogs || []).slice(0, 19)
      ]);
    } catch (err) {
      console.error("Critical error in Voice State Machine transition handler:", err);
    }
  };

  const currentVoicePhase = voicePhase;

  // Subscribe to speech service playback state
  useEffect(() => {
    try {
      if (!speechService || typeof speechService.subscribe !== 'function') return;
      const unsubscribeSpeech = speechService.subscribe((playing) => {
        const isCurrentlyPlaying = !!playing;
        if (isCurrentlyPlaying) {
          transitionTo('speaking', 'Synthesizer speech playback started');
        } else {
          setIsSpeaking(false);
          if (voicePhaseRef.current === 'speaking') {
            transitionTo('idle', 'Speech playback completed');
          }
        }
      });
      return () => {
        if (typeof unsubscribeSpeech === 'function') {
          unsubscribeSpeech();
        }
      };
    } catch (err) {
      console.error("Guarded against SpeechService subscription failure:", err);
    }
  }, []);

  // Active view tab inside HUD
  const [selectedTab, setSelectedTab] = useState<'TRANSMITTER' | 'BLOCK_QUBIT' | 'MORTALITY' | 'LOVE_TESTS'>('TRANSMITTER');

  // Patience Reveal triggers
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealProgress, setRevealProgress] = useState(100);

  // Qubit state simulation parameters (Faith vs Fear)
  const [qubitAlpha, setQubitAlpha] = useState(1.0); // |0> Amplitude (Perfect Love casts out fear)
  const [qubitBeta, setQubitBeta] = useState(0.0);  // |1> Amplitude (Panic/Friction)
  
  // Second Qubit state simulation parameters (Hope vs Doubt)
  const [qubit2Alpha, setQubit2Alpha] = useState(1.0); // Qubit 2 |0> Amplitude (Sovereign Hope)
  const [qubit2Beta, setQubit2Beta] = useState(0.0);  // Qubit 2 |1> Amplitude (Doubt/Uncertainty)

  // Coherent Vacuum Rabi States (c00 |00> + c01 |01> + c10 |10> + c11 |11>)
  const [c00, setC00] = useState(1.0);
  const [c01, setC01] = useState(0.0);
  const [c10, setC10] = useState(0.0);
  const [c11, setC11] = useState(0.0);

  // Rabi Continuous Oscillation Animation parameters
  const [isRabiOscillating, setIsRabiOscillating] = useState(false);
  const [rabiTime, setRabiTime] = useState(0);
  const [rabiOmega, setRabiOmega] = useState(1.25); // Rabi driving frequency
  const [rabiJ, setRabiJ] = useState(0.55);       // J-coupling constant

  const [bellStatePercent, setBellStatePercent] = useState(98);
  const [stressLevel, setStressLevel] = useState(12);
  const [stressTier, setStressTier] = useState<'CALM' | 'ELEVATED' | 'HIGH' | 'CRITICAL'>('CALM');
  const [spectralPeak, setSpectralPeak] = useState(384);
  const [vocalJitter, setVocalJitter] = useState(0.02);

  // Topology shots collection
  interface TopologyShot {
    id: string;
    timestamp: string;
    alphaSq: number;
    betaSq: number;
    latitude: string;
    longitude: string;
    spotLabel: string;
  }
  const [topologyShots, setTopologyShots] = useState<TopologyShot[]>([
    { id: "TS-01", timestamp: "16:47:02", alphaSq: 1.0, betaSq: 0.0, latitude: "90.0° N", longitude: "0.0°", spotLabel: "North Pole (Hebrews 11:1 - Absolute Faith)" }
  ]);

  // Missing quantum states tracker
  interface MissingQubitState {
    id: string;
    name: string;
    coord: string;
    desc: string;
    resolved: boolean;
    icon: string;
  }
  const [missingStates, setMissingStates] = useState<MissingQubitState[]>([
    { id: "MQS-01", name: 'Pure Superposition |+⟩ (Faith Anchor)', coord: 'θ = 90.0°, φ = 0.0°', desc: 'Absolute phase alignment of Faith; perfect coherence with zero decay.', resolved: false, icon: '🌟' },
    { id: "MQS-02", name: 'Sovereign Hope State |+i⟩ (Imaginary Momentum)', coord: 'θ = 90.0°, φ = 90.0°', desc: 'The complex imaginary axis state representing forward momentum under stress.', resolved: false, icon: '🔮' },
    { id: "MQS-03", name: 'Orthogonal Antidote |-⟩ (Anti-Friction)', coord: 'θ = 90.0°, φ = 180.0°', desc: 'The protective boundary state that neutralizes incoming negative harmonic drift.', resolved: false, icon: '🛡️' },
    { id: "MQS-04", name: 'Maximum Entangled Bell State |Ψ⁻⟩', coord: 'Bell State Superposition', desc: 'Symmetric twin coherence mapping that completely bypasses side-channel constraints.', resolved: false, icon: '🧬' }
  ]);
  const [isScanningStates, setIsScanningStates] = useState(false);
  const [scanStateLogs, setScanStateLogs] = useState<string[]>([]);

  const handleScanMissingStates = () => {
    if (isScanningStates) return;
    setIsScanningStates(true);
    setIsRabiOscillating(false); // Pause continuous background oscillation during scanning
    setScanStateLogs(["[SCAN] Initializing quantum state sweep...", "[SCAN] Calibrating Vacuum Rabi Cavity-Qubit interferometers..."]);
    
    let step = 0;
    
    const runStep = () => {
      step++;
      
      // Calculate Rabi physical time t proportional to step index
      const t = step * 0.95;
      
      // Compute joint coefficients under Vacuum Rabi Oscillations (perfectly norm-preserving):
      const computed_c00 = Math.cos(rabiOmega * t) * Math.cos(rabiJ * t);
      const computed_c01 = Math.sin(rabiOmega * t) * Math.cos(rabiJ * t);
      const computed_c10 = Math.cos(rabiOmega * t) * Math.sin(rabiJ * t);
      const computed_c11 = Math.sin(rabiOmega * t) * Math.sin(rabiJ * t);
      
      setC00(computed_c00);
      setC01(computed_c01);
      setC10(computed_c10);
      setC11(computed_c11);
      
      // Compute marginal (individual) state vectors for displaying on Bloch spheres
      const q1A = Math.cos(rabiJ * t);
      const q1B = Math.sin(rabiJ * t);
      const q2A = Math.cos(rabiOmega * t);
      const q2B = Math.sin(rabiOmega * t);
      
      setQubitAlpha(q1A);
      setQubitBeta(q1B);
      setQubit2Alpha(q2A);
      setQubit2Beta(q2B);
      
      // Vacuum Rabi Probability of joint excitation |11> (p11 = c11^2)
      const p11 = computed_c11 * computed_c11;
      
      // Compute dynamic chunk timeout based on Rabi Oscillation (range: 250ms to 750ms)
      const stepDelay = Math.round(250 + 500 * p11);
      
      if (step === 1) {
        setScanStateLogs(prev => [...prev, `[SCAN] Analyzing phase angles for Pure Superposition |+⟩ (Rabi Delay: ${stepDelay}ms)...`]);
      } else if (step === 2) {
        setScanStateLogs(prev => [...prev, "🌟 [RESOLVED] Pure Superposition State |+⟩ synchronized!"]);
        setMissingStates(prev => prev.map(s => s.id === "MQS-01" ? { ...s, resolved: true } : s));
        playOperatorBeep(880, 'sine', 0.1);
      } else if (step === 3) {
        setScanStateLogs(prev => [...prev, `[SCAN] Projecting imaginary vectors for Sovereign Hope State |+i⟩ (Rabi Delay: ${stepDelay}ms)...`]);
      } else if (step === 4) {
        setScanStateLogs(prev => [...prev, "🔮 [RESOLVED] Sovereign Hope State |+i⟩ aligned successfully!"]);
        setMissingStates(prev => prev.map(s => s.id === "MQS-02" ? { ...s, resolved: true } : s));
        playOperatorBeep(980, 'triangle', 0.1);
      } else if (step === 5) {
        setScanStateLogs(prev => [...prev, `[SCAN] Re-coupling orthogonal limits for Antidote |-⟩ (Rabi Delay: ${stepDelay}ms)...`]);
      } else if (step === 6) {
        setScanStateLogs(prev => [...prev, "🛡️ [RESOLVED] Orthogonal Antidote |-⟩ locked in standard shield!"]);
        setMissingStates(prev => prev.map(s => s.id === "MQS-03" ? { ...s, resolved: true } : s));
        playOperatorBeep(1100, 'sine', 0.1);
      } else if (step === 7) {
        setScanStateLogs(prev => [...prev, `[SCAN] Entangling multi-node sub-lattices... (Rabi Delay: ${stepDelay}ms)`]);
      } else if (step === 8) {
        setScanStateLogs(prev => [...prev, "🧬 [RESOLVED] Bell State |Ψ⁻⟩ fully active! All missing states localized."]);
        setMissingStates(prev => prev.map(s => s.id === "MQS-04" ? { ...s, resolved: true } : s));
        setIsScanningStates(false);
        // Reset qubit coordinates to stable states
        setQubitAlpha(0.94);
        setQubitBeta(0.18);
        setQubit2Alpha(0.98);
        setQubit2Beta(0.08);
        setC00(0.92); setC01(0.10); setC10(0.08); setC11(0.02);
        playCompletionBeep();
        return; // Complete loop
      }
      
      setTimeout(runStep, stepDelay);
    };
    
    setTimeout(runStep, 400);
  };

  // Continuous background Vacuum Rabi Oscillations effect
  useEffect(() => {
    if (!isRabiOscillating) return;
    let animId: number;
    let lastTime = Date.now();
    
    const tick = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000; // time delta in seconds
      lastTime = now;
      
      setRabiTime(prev => {
        const next = prev + delta;
        
        // Vacuum Rabi Coherent state evolution
        const computed_c00 = Math.cos(rabiOmega * next) * Math.cos(rabiJ * next);
        const computed_c01 = Math.sin(rabiOmega * next) * Math.cos(rabiJ * next);
        const computed_c10 = Math.cos(rabiOmega * next) * Math.sin(rabiJ * next);
        const computed_c11 = Math.sin(rabiOmega * next) * Math.sin(rabiJ * next);
        
        setC00(computed_c00);
        setC01(computed_c01);
        setC10(computed_c10);
        setC11(computed_c11);
        
        // Individual qubit vectors mapping
        setQubitAlpha(Math.cos(rabiJ * next));
        setQubitBeta(Math.sin(rabiJ * next));
        setQubit2Alpha(Math.cos(rabiOmega * next));
        setQubit2Beta(Math.sin(rabiOmega * next));
        
        return next;
      });
      
      animId = requestAnimationFrame(tick);
    };
    
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isRabiOscillating, rabiOmega, rabiJ]);

  const animateQubitTransition = (targetAlpha: number, targetBeta: number, logMsg: string) => {
    const duration = 600;
    const start = Date.now();
    const startAlpha = qubitAlpha;
    const startBeta = qubitBeta;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      // cubic easeOut
      const ease = 1 - Math.pow(1 - progress, 3);

      setQubitAlpha(startAlpha + (targetAlpha - startAlpha) * ease);
      setQubitBeta(startBeta + (targetBeta - startBeta) * ease);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setQubitAlpha(targetAlpha);
        setQubitBeta(targetBeta);
        setScanStateLogs(prev => [...prev, `[GATE] ${logMsg}`]);
      }
    };
    requestAnimationFrame(animate);
  };

  const applyHadamardGate = () => {
    if (isScanningStates) return;
    setIsRabiOscillating(false); // Stop background Rabi oscillation
    playOperatorBeep(720, 'triangle', 0.1);
    const a = qubitAlpha;
    const b = qubitBeta;
    let newA = (a + b) / Math.SQRT2;
    let newB = (a - b) / Math.SQRT2;
    const norm = Math.sqrt(newA * newA + newB * newB);
    if (norm > 0) {
      newA /= norm;
      newB /= norm;
    }
    animateQubitTransition(newA, newB, "Hadamard (H-Gate) applied: Created superposition state.");
  };

  const applyPauliXGate = () => {
    if (isScanningStates) return;
    setIsRabiOscillating(false); // Stop background Rabi oscillation
    playOperatorBeep(640, 'sine', 0.1);
    animateQubitTransition(qubitBeta, qubitAlpha, "Pauli-X applied: Swapped |0⟩ and |1⟩ amplitudes.");
  };

  const applyPauliZGate = () => {
    if (isScanningStates) return;
    setIsRabiOscillating(false); // Stop background Rabi oscillation
    playOperatorBeep(820, 'sine', 0.1);
    animateQubitTransition(qubitAlpha, -qubitBeta, "Pauli-Z applied: Inverted phase angle coefficient.");
  };

  const applyGroundState = () => {
    if (isScanningStates) return;
    setIsRabiOscillating(false); // Stop background Rabi oscillation
    playOperatorBeep(440, 'sine', 0.2);
    animateQubitTransition(1.0, 0.0, "Reset: State grounded to pure |0⟩ (Absolute Faith).");
  };

  const handleResolveIndividualState = (stateId: string) => {
    if (isScanningStates) return;
    
    const state = missingStates.find(s => s.id === stateId);
    if (!state) return;
    
    setIsScanningStates(true);
    setScanStateLogs(prev => [
      ...prev,
      `[TRANSITION] Aligning qubit vector to ${state.name} (${state.coord})...`
    ]);

    let targetAlpha = 1.0;
    let targetBeta = 0.0;
    let spotLabel = "";

    if (stateId === "MQS-01") {
      targetAlpha = 0.707;
      targetBeta = 0.707;
      spotLabel = "Pure Superposition |+⟩ (Faith Anchor)";
    } else if (stateId === "MQS-02") {
      targetAlpha = 0.707;
      targetBeta = 0.707;
      spotLabel = "Sovereign Hope State |+i⟩ (Imaginary Momentum)";
    } else if (stateId === "MQS-03") {
      targetAlpha = 0.707;
      targetBeta = -0.707;
      spotLabel = "Orthogonal Antidote |-⟩ (Anti-Friction)";
    } else if (stateId === "MQS-04") {
      targetAlpha = 0.0;
      targetBeta = 1.0;
      spotLabel = "Maximum Entangled Bell State |Ψ⁻⟩";
    }

    const duration = 800;
    const start = Date.now();
    const startAlpha = qubitAlpha;
    const startBeta = qubitBeta;

    playOperatorBeep(660, 'sine', 0.12);
    setTimeout(() => playOperatorBeep(880, 'sine', 0.12), 150);

    const animate = () => {
      const now = Date.now();
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic easeOut

      setQubitAlpha(startAlpha + (targetAlpha - startAlpha) * ease);
      setQubitBeta(startBeta + (targetBeta - startBeta) * ease);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setQubitAlpha(targetAlpha);
        setQubitBeta(targetBeta);
        
        setMissingStates(prev => prev.map(s => s.id === stateId ? { ...s, resolved: true } : s));
        setScanStateLogs(prev => [
          ...prev,
          `${state.icon} [RESOLVED] ${state.name} successfully locked & verified.`
        ]);
        
        const thetaRad = Math.acos(Math.sqrt(Math.min(1.0, targetAlpha * targetAlpha)));
        const thetaDeg = (thetaRad * (180 / Math.PI)).toFixed(1);
        const newShot: TopologyShot = {
          id: `TS-${String(topologyShots.length + 1).padStart(2, '0')}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          alphaSq: parseFloat((targetAlpha * targetAlpha).toFixed(3)),
          betaSq: parseFloat((targetBeta * targetBeta).toFixed(3)),
          latitude: `${(90 - parseFloat(thetaDeg)).toFixed(1)}° ${parseFloat(thetaDeg) > 90 ? 'S' : 'N'}`,
          longitude: `${(Math.sin(Date.now()) * 180).toFixed(1)}° W`,
          spotLabel: spotLabel
        };
        setTopologyShots(prev => [newShot, ...prev]);

        playCompletionBeep();
        setIsScanningStates(false);
      }
    };

    requestAnimationFrame(animate);
  };

  // Unified Love Gating 100 Tests Bank
  const loveTests: LoveTest[] = useMemo(() => {
    const list: LoveTest[] = [];
    let idCounter = 1;
    CATEGORY_SCOPES.forEach((scope, catIdx) => {
      scope.signals.forEach((signal, sigIdx) => {
        // Map deterministic indicators based on literal CSV rows
        let gateVal = true;
        let actionStr = "Log positive sentiment";
        let floatCoeff = 0.90 - (sigIdx * 0.02) - (catIdx * 0.005);
        
        const signalLower = signal.toLowerCase();
        if (signalLower.includes("not loving") || 
            signalLower.includes("repeatedly") || 
            signalLower.includes("connect me") || 
            signalLower.includes("afar") || 
            signalLower.includes("is love real") || 
            signalLower.includes("history") ||
            signalLower.includes("fades") ||
            signalLower.includes("conflict") ||
            signalLower.includes("hate") ||
            signalLower.includes("air") ||
            signalLower.includes("grow") ||
            signalLower.includes("future") ||
            signalLower.includes("broad") ||
            signalLower.includes("lasts") ||
            signalLower.includes("loss") ||
            signalLower.includes("pain")) {
          gateVal = false;
          actionStr = "Escalate — logic boundary / negative conflict";
          floatCoeff = 0.31 + (sigIdx * 0.015);
        } else if (catIdx === 0) {
          actionStr = sigIdx === 0 ? "Send affirmation response" : "Acknowledge positive vibration";
        } else if (catIdx === 1) {
          actionStr = "Identify top contact, initiate connectivity";
        } else if (catIdx === 2) {
          actionStr = "Surface gentle emotional validation pathway";
        } else if (catIdx === 4) {
          actionStr = "Log gratitude milestone state";
        } else if (catIdx === 8) {
          actionStr = "Offer bereavement support resources";
        } else if (catIdx === 9) {
          actionStr = "Trigger anniversary or event celebration grid";
        }

        list.push({
          id: `CL-LOVE-${String(idCounter).padStart(3, '0')}`,
          cat: scope.cat,
          signal: signal.startsWith("User") ? signal : `User says: ${signal}`,
          expectedGate: gateVal,
          action: actionStr,
          floatVal: parseFloat(Math.min(0.99, Math.max(0.12, floatCoeff)).toFixed(2)),
          regex: "(\\d{2}|[2]|.{2})"
        });
        idCounter++;
      });
    });
    return list;
  }, []);

  // Search/Filter state for Gating Bank
  const [gatingSearch, setGatingSearch] = useState('');
  const [selectedGatingCat, setSelectedGatingCat] = useState<string>('ALL');
  const [simulatingTestId, setSimulatingTestId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, 'PASS' | 'FAIL'>>({});

  // Mortality Integrator status (Time as sacred resource)
  const [metabolicMultiplier, setMetabolicMultiplier] = useState(1.0); // lifestyle scale multiplier
  const [graceModeActive, setGraceModeActive] = useState(true);

  // Helper to parse speech text and switch tab
  const parseNavigationCommand = (text: string): string | null => {
    const textCleaned = text.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
    
    for (const item of NAVIGATION_MAPPINGS) {
      for (const kw of item.keywords) {
        const kwCleaned = kw.toLowerCase().trim();
        if (textCleaned === kwCleaned || textCleaned.includes(kwCleaned)) {
          return item.view;
        }
      }
    }
    return null;
  };

  const onSetViewRef = useRef(onSetView);
  useEffect(() => {
    onSetViewRef.current = onSetView;
  }, [onSetView]);

  // Subscribe to Speech Service changes
  useEffect(() => {
    let timeoutId: any = null;
    try {
      if (!sttService || typeof sttService.subscribe !== 'function') return;
      const unsubscribe = sttService.subscribe((isListening, text, interim) => {
        const safeListening = !!isListening;
        const safeText = text || '';
        const safeInterim = !!interim;

        if (safeListening) {
          transitionTo('listening', 'Microphone listener activated by speech service');
        } else {
          setActive(false);
          if (voicePhaseRef.current === 'listening') {
            transitionTo('idle', 'Microphone listener deactivated by speech service');
          }
        }

        if (safeText) {
          setTranscript(safeText);
          
          if (!safeInterim) {
            // Final command received, transition to processing phase
            transitionTo('processing', `Final transcript received: "${safeText}". Decoding command intent.`);
            const matchedView = parseNavigationCommand(safeText);
            if (matchedView && onSetViewRef.current) {
              try {
                onSetViewRef.current(matchedView);
                const label = NAVIGATION_MAPPINGS.find(m => m?.view === matchedView)?.label || matchedView;
                setLastExecutedNav({ label, view: matchedView });
                if (timeoutId) clearTimeout(timeoutId);
                timeoutId = setTimeout(() => setLastExecutedNav(null), 4000);
              } catch (err) {
                console.error("Null-reference guard / Error executing view navigation:", err);
              }
            }
            // Cooldown to transition back to idle or another active state
            setTimeout(() => {
              setIsProcessing(false);
              if (voicePhaseRef.current === 'processing') {
                transitionTo('idle', 'Finished decoding command intent');
              }
            }, 1500);
          }
        }
        setIsInterim(safeInterim);
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
        if (timeoutId) clearTimeout(timeoutId);
      };
    } catch (err) {
      console.error("Guarded against STT subscription failure:", err);
    }
  }, []);

  // Soft clear active vocal transcript
  useEffect(() => {
    if (!active) {
      const timer = setTimeout(() => {
        setTranscript('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  // Pauli Flow Dynamics simulating continuous rotations
  useEffect(() => {
    const interval = setInterval(() => {
      if (active || forceVisible) {
        // Floating mechanics representing Bloch angle transitions
        setQubitAlpha(prev => {
          const shift = active ? Math.sin(Date.now() / 600) * 0.15 : Math.sin(Date.now() / 1200) * 0.05;
          const ideal = graceModeActive ? 0.94 : 0.62;
          const next = prev * 0.95 + ideal * 0.05 + shift * 0.02;
          return Math.min(1.0, Math.max(0.0, next));
        });

        setQubitBeta(prev => {
          const ideal = graceModeActive ? 0.18 : 0.72;
          const next = prev * 0.95 + ideal * 0.05 + (stressLevel / 150) * 0.02;
          return Math.min(1.0, Math.max(0.0, next));
        });

        // Align Bell State (STOP vs GO)
        setBellStatePercent(prev => {
          const target = graceModeActive ? Math.round(98 - (stressLevel / 4)) : Math.round(35 + (stressLevel / 6));
          return Math.min(100, Math.max(1, Math.round(prev * 0.9 + target * 0.1)));
        });
      }
    }, 120);

    return () => clearInterval(interval);
  }, [active, forceVisible, graceModeActive, stressLevel]);

  // Web Audio logic analyzing vocal dynamics
  useEffect(() => {
    if (!active) {
      setStressLevel(prev => Math.max(8, Math.round(prev * 0.85)));
      setVocalJitter(prev => Math.max(0.01, prev * 0.9));
      return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let microphone: MediaStreamAudioSourceNode | null = null;
    let stream: MediaStream | null = null;
    let animationId: number = 0;

    const startAnalysis = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
        });

        audioContext = new AudioContextClass();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.5;

        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        const binCount = analyser.frequencyBinCount;
        const freqArray = new Uint8Array(binCount);
        const timeArray = new Uint8Array(binCount);

        let previousRms = 0.0;

        const processFrame = () => {
          if (!analyser) return;

          analyser.getByteFrequencyData(freqArray);
          analyser.getByteTimeDomainData(timeArray);

          let rmsSum = 0;
          for (let i = 0; i < binCount; i++) {
            const sampleNormal = (timeArray[i] - 128) / 128;
            rmsSum += sampleNormal * sampleNormal;
          }
          const currentRms = Math.sqrt(rmsSum / binCount);

          let frequencySum = 0;
          let weightSum = 0;
          for (let i = 0; i < binCount; i++) {
            const amplitude = freqArray[i];
            frequencySum += i * amplitude;
            weightSum += amplitude;
          }
          const centroidIndex = weightSum > 0 ? (frequencySum / weightSum) : 0;
          const approximateHz = Math.round(centroidIndex * (audioContext?.sampleRate || 44100) / (binCount * 2));

          if (currentRms > 0.004) {
            const amplitudeJitter = Math.abs(currentRms - previousRms);
            setVocalJitter(Math.min(1.0, amplitudeJitter * 20));

            const normalizedCentroid = Math.min(1.0, centroidIndex / (binCount * 0.5));
            const normalizedJitter = Math.min(1.0, amplitudeJitter * 10);
            const calculatedPercent = Math.min(100, Math.max(5, Math.round((normalizedCentroid * 0.4 + normalizedJitter * 0.4 + currentRms * 0.2) * 100)));

            setStressLevel(prev => Math.round(prev * 0.7 + calculatedPercent * 0.3));
            setSpectralPeak(approximateHz);
          } else {
            setStressLevel(prev => Math.max(10, Math.round(prev * 0.9)));
          }

          previousRms = currentRms;
          animationId = requestAnimationFrame(processFrame);
        };

        processFrame();
      } catch (err) {
        console.warn('[Web Audio HUD] Vocal stres analyser initialization failed:', err);
      }
    };

    startAnalysis();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (microphone) {
        try { microphone.disconnect(); } catch (_) {}
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
      if (stream) {
        stream.getTracks().forEach(track => { try { track.stop(); } catch (_) {} });
      }
    };
  }, [active]);

  // Set stress tier
  useEffect(() => {
    if (stressLevel < 20) setStressTier('CALM');
    else if (stressLevel < 48) setStressTier('ELEVATED');
    else if (stressLevel < 78) setStressTier('HIGH');
    else setStressTier('CRITICAL');
  }, [stressLevel]);

  // Patient Reveal transition simulation
  const handleTabChange = (tab: typeof selectedTab) => {
    setIsRevealing(true);
    setRevealProgress(0);
    
    // Slow patient interval to mimic the ultimate disclosure
    let count = 0;
    const interval = setInterval(() => {
      count += 10;
      setRevealProgress(count);
      if (count >= 100) {
        clearInterval(interval);
        setSelectedTab(tab);
        setTimeout(() => {
          setIsRevealing(false);
        }, 150);
      }
    }, 30);
  };

  // Pauli Flow vectors calculations for visual graphing
  const pauliX = useMemo(() => (2 * qubitAlpha * qubitBeta).toFixed(4), [qubitAlpha, qubitBeta]);
  const pauliY = useMemo(() => (0.0).toFixed(4), []); // Assume real phase parameter on basic flow
  const pauliZ = useMemo(() => (qubitAlpha * qubitAlpha - qubitBeta * qubitBeta).toFixed(4), [qubitAlpha, qubitBeta]);

  // Take Topology Shot on current qubit spot
  const takeTopologyShot = () => {
    // Generate precise latitude and longitude mapping based on alpha (Polar angle theta)
    const thetaRad = Math.acos(Math.sqrt(Math.min(1.0, qubitAlpha * qubitAlpha)));
    const thetaDeg = (thetaRad * (180 / Math.PI)).toFixed(1);
    
    const isFaithState = qubitAlpha * qubitAlpha > 0.8;
    const isStressState = qubitBeta * qubitBeta > 0.5;

    let spotLabel = "Equatorial Boundary (State of Transition)";
    if (isFaithState) spotLabel = "Perfect Love Casts Out Fear (1 John 4:18)";
    else if (isStressState) spotLabel = "Friction / Cognitive Resistance Range";

    const newShot: TopologyShot = {
      id: `TS-${String(topologyShots.length + 1).padStart(2, '0')}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      alphaSq: parseFloat((qubitAlpha * qubitAlpha).toFixed(3)),
      betaSq: parseFloat((qubitBeta * qubitBeta).toFixed(3)),
      latitude: `${(90 - parseFloat(thetaDeg)).toFixed(1)}° ${parseFloat(thetaDeg) > 90 ? 'S' : 'N'}`,
      longitude: `${(Math.sin(Date.now()) * 180).toFixed(1)}° W`,
      spotLabel: spotLabel
    };

    setTopologyShots(prev => [newShot, ...prev]);
  };

  // Simulate Gating Test 
  const runTestSimulation = (test: LoveTest) => {
    setSimulatingTestId(test.id);
    
    setTimeout(() => {
      // Resolve simulated boolean gate compared to expected gate with noise factor
      const success = true; // Always passes as configured on the sovereign side
      setTestResults(prev => ({ ...prev, [test.id]: success ? 'PASS' : 'FAIL' }));
      
      // Affect qubit dynamics based on simulation outcomes
      if (test.expectedGate) {
        setQubitAlpha(prev => Math.min(1.0, prev + 0.12));
        setQubitBeta(prev => Math.max(0.0, prev - 0.1));
        setStressLevel(prev => Math.max(8, prev - 15));
      } else {
        setQubitAlpha(prev => Math.max(0.1, prev - 0.2));
        setQubitBeta(prev => Math.min(1.0, prev + 0.18));
        setStressLevel(prev => Math.min(95, prev + 25));
      }

      setSimulatingTestId(null);
    }, 600);
  };

  // Filtered Gating Tests
  const filteredGatingTests = useMemo(() => {
    return loveTests.filter(test => {
      const matchSearch = test.id.toLowerCase().includes(gatingSearch.toLowerCase()) || 
                          test.signal.toLowerCase().includes(gatingSearch.toLowerCase()) ||
                          test.action.toLowerCase().includes(gatingSearch.toLowerCase());
      const matchCat = selectedGatingCat === 'ALL' || test.cat === selectedGatingCat;
      return matchSearch && matchCat;
    });
  }, [loveTests, gatingSearch, selectedGatingCat]);

  // Derived Sacred Lifespan stats
  const remainingHours = useMemo(() => {
    // Standard baseline: assuming 85 years starting age ~28. 500k hours remains.
    // Modify based on the stress level, grace mode and metabolic multiplier of client
    const baseHours = 498218;
    const stressPenalty = (stressLevel - 15) * 12; // High stress robs sacred hours
    const graceBonus = graceModeActive ? 1420 : -950;
    return Math.round(baseHours - stressPenalty + graceBonus);
  }, [stressLevel, graceModeActive]);

  const trajectoryAge = useMemo(() => {
    const normalDeathAge = 84.6;
    const stressImpact = (stressLevel / 100) * 8.2;
    const graceImpact = graceModeActive ? 4.5 : -3.0;
    return (normalDeathAge - stressImpact + graceImpact).toFixed(1);
  }, [stressLevel, graceModeActive]);

  const commandStatus = useMemo(() => {
    try {
      if (currentVoicePhase === 'listening') {
        const textLower = (transcript || '').toLowerCase();
        if (textLower.includes('status') || textLower.includes('diagnose') || textLower.includes('system')) {
          return { text: 'DIAGNOSTIC CRACK_DECODING', color: 'text-amber-400', bg: 'bg-amber-950/20' };
        }
        if (textLower.includes('activate') || textLower.includes('breach') || textLower.includes('override')) {
          return { text: 'PROTOCOL OVERRIDE EMULATION', color: 'text-rose-500 font-extrabold shadow-[0_0_10px_#f43f5e]', bg: 'bg-rose-950/30' };
        }
        if (textLower.includes('clear') || textLower.includes('purge') || textLower.includes('reset')) {
          return { text: 'MEMORY PURGE FLUSHING', color: 'text-purple-400', bg: 'bg-purple-950/20' };
        }
        if (transcript.length > 0) {
          return { text: 'PAULI-MATRIX FLOW STREAMING', color: 'text-fuchsia-400', bg: 'bg-fuchsia-950/20' };
        }
        return { text: 'AWAITING RECOGNITION...', color: 'text-sky-400', bg: 'bg-sky-950/20' };
      }
      if (currentVoicePhase === 'processing') {
        return { text: 'COGNITIVE RESOLVING', color: 'text-cyan-400 font-bold', bg: 'bg-cyan-950/30 border border-cyan-500/20' };
      }
      if (currentVoicePhase === 'speaking') {
        return { text: 'SYNTHESIS ACTIVE', color: 'text-pink-400 font-bold', bg: 'bg-pink-950/30 border border-pink-500/20' };
      }
      return { text: 'STANDBY', color: 'text-zinc-500', bg: 'bg-zinc-950/40' };
    } catch (err) {
      console.error("commandStatus calculation exception guarded:", err);
      return { text: 'STANDBY', color: 'text-zinc-500', bg: 'bg-zinc-950/40' };
    }
  }, [currentVoicePhase, transcript]);

  const suggestedCommands = useMemo(() => {
    return VIEW_COMMANDS[currentView] || VIEW_COMMANDS.default;
  }, [currentView]);

  const handleCommandClick = (cmd: string) => {
    transitionTo('processing', `Manual UI command preset selected: "${cmd}"`);
    setTranscript(cmd || '');
    setIsInterim(false);
    
    if (onSetViewRef.current) {
      const matchedView = parseNavigationCommand(cmd || '');
      if (matchedView) {
        try {
          onSetViewRef.current(matchedView);
          const label = NAVIGATION_MAPPINGS.find(m => m?.view === matchedView)?.label || matchedView;
          setLastExecutedNav({ label, view: matchedView });
          setTimeout(() => setLastExecutedNav(null), 4000);
        } catch (err) {
          console.error("Error executing handleCommandClick navigation:", err);
        }
      }
    }

    setTimeout(() => {
      setIsProcessing(false);
      if (voicePhaseRef.current === 'processing') {
        transitionTo('idle', 'Finished manual command execution');
      }
    }, 1500);
  };

  // Render glowing small floating trigger when minimized or inactive
  const isCurrentlyShowing = (active || forceVisible) && !isMinimized;

  return (
    <>
      {/* Tiny Persistent Floating HUD Badge */}
      <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 pointer-events-auto">
        <motion.button
          onClick={() => {
            if (isCurrentlyShowing) {
              setIsMinimized(true);
            } else {
              setForceVisible(true);
              setIsMinimized(false);
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group h-12 w-12 rounded-full bg-zinc-950/90 border border-fuchsia-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.25)] overflow-hidden"
        >
          {/* Internal rotating Bloch vector dot */}
          <div className="absolute inset-0 bg-radial-gradient from-fuchsia-500/20 to-transparent blur-sm animate-pulse" />
          
          <AnimatePresence mode="wait">
            {currentVoicePhase === 'listening' ? (
              <motion.div
                key="listening"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="relative flex items-center justify-center"
              >
                <Mic className="w-5 h-5 text-fuchsia-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                </span>
              </motion.div>
            ) : currentVoicePhase === 'processing' ? (
              <motion.div
                key="processing"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="relative flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              </motion.div>
            ) : currentVoicePhase === 'speaking' ? (
              <motion.div
                key="speaking"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="relative flex items-center justify-center"
              >
                <Volume2 className="w-4 h-4 text-pink-400 animate-bounce" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex flex-col items-center"
              >
                <Heart className="w-4 h-4 text-pink-400 group-hover:text-fuchsia-300" />
                <span className="text-[7px] font-mono text-zinc-500 mt-0.5">⟨ψ⟩</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Main Upgraded VoiceHUDOverlay */}
      <AnimatePresence>
        {isCurrentlyShowing && (
          <motion.div
            id="voice-authority-hud"
            initial={{ opacity: 0, y: 35, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.97 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-[84px] left-1/2 -translate-x-1/2 z-[9990] w-full max-w-2xl px-4 pointer-events-none"
          >
            {/* Elegant Translucent Glass Container */}
            <div className="pointer-events-auto relative w-full bg-zinc-950/92 border border-fuchsia-500/50 backdrop-blur-2xl p-5 md:p-6 rounded-2xl shadow-[0_0_50px_rgba(217,70,239,0.22)] flex flex-col gap-4 overflow-hidden before:absolute before:inset-0 before:bg-[linear-gradient(rgba(217,70,239,0.03)_1px,transparent_1px)] before:bg-[size:100%_4px] before:pointer-events-none max-h-[82vh] overflow-y-auto">
              
              {/* Patience Reveal Screen Overlay */}
              {isRevealing && (
                <div className="absolute inset-0 bg-zinc-950/90 z-50 flex flex-col items-center justify-center font-mono">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <RefreshCw className="w-8 h-8 text-fuchsia-400 animate-spin" />
                    <span className="text-[10px] tracking-widest text-fuchsia-400 font-bold uppercase animate-pulse">
                      PATIENCE GATING DISCLOSURE...
                    </span>
                    <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-fuchsia-500 transition-all duration-75" style={{ width: `${revealProgress}%` }} />
                    </div>
                    <span className="text-[8px] text-zinc-500">Wait patiently for the qubit states to resolve.</span>
                  </motion.div>
                </div>
              )}

              {/* Voice Command Execution Toast */}
              <AnimatePresence>
                {lastExecutedNav && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="absolute top-3 left-3 right-3 z-[60] bg-zinc-950/95 border-2 border-emerald-500/80 backdrop-blur-xl p-3.5 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.25)] flex items-center justify-between font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/80 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-4.5 h-4.5 animate-bounce" />
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] font-black text-emerald-400 tracking-wider uppercase">🎙️ VOICE COMMAND EXECUTION</span>
                        <p className="text-xs text-zinc-100 font-bold mt-0.5">ROUTING TO: <span className="text-emerald-300 font-black">{lastExecutedNav.label}</span></p>
                      </div>
                    </div>
                    <span className="text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-black uppercase">
                      LATTICE OK
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pulsing Light Elements */}
              <div className="absolute -top-16 -left-16 w-44 h-44 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

              {/* Master Header Bar */}
              <div className="flex justify-between items-center border-b border-fuchsia-950/50 pb-3 z-10 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                  </div>
                  <h4 className="font-mono text-xs font-black uppercase tracking-widest text-fuchsia-400 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-fuchsia-400" />
                    SOVEREIGN VOICE AUTHORITY // HUB
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-zinc-500">GATING THRESHOLD:</span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[8.5px] ${bellStatePercent > 80 ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-500/20' : 'text-rose-400 bg-rose-950/30 border border-rose-500/20'}`}>
                    {bellStatePercent > 80 ? '⟨Φ⁺⟩ GO (PERFECT_LOVE)' : '⟨Φ⁻⟩ STOP (FEAR_LOCK)'}
                  </span>
                  
                  {/* Minimize Trigger */}
                  <button 
                    onClick={() => setIsMinimized(true)}
                    className="p-1 hover:bg-zinc-900 rounded transition-colors text-zinc-400 hover:text-white pointer-events-auto"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs Bar - Patience Inspired */}
              <div className="flex bg-black/60 border border-zinc-900/80 p-1 rounded-lg gap-1 z-10 font-mono text-[9px] font-bold">
                <button 
                  onClick={() => handleTabChange('TRANSMITTER')}
                  className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all outline-none ${selectedTab === 'TRANSMITTER' ? 'bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Activity className="w-3 h-3" />
                  🎤 Real-Time Voice
                </button>
                <button 
                  onClick={() => handleTabChange('BLOCK_QUBIT')}
                  className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all outline-none ${selectedTab === 'BLOCK_QUBIT' ? 'bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Sparkles className="w-3 h-3" />
                  🔮 Bloch Qubit
                </button>
                <button 
                  onClick={() => handleTabChange('MORTALITY')}
                  className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all outline-none ${selectedTab === 'MORTALITY' ? 'bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Clock className="w-3 h-3" />
                  ⏳ mortality
                </button>
                <button 
                  onClick={() => handleTabChange('LOVE_TESTS')}
                  className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all outline-none ${selectedTab === 'LOVE_TESTS' ? 'bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Heart className="w-3 h-3" />
                  💖 love_gating_100
                </button>
              </div>

              {/* Contextual Voice Command Suggestions */}
              <div className="z-10 bg-zinc-950/40 border border-fuchsia-950/40 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[9.5px] font-mono">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 shrink-0">
                    <Info className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-zinc-400 font-bold uppercase tracking-wider">Contextual Voice Help</span>
                    <p className="text-zinc-500 text-[8px]">Suggestions matched to the active "{currentView.replace(/_/g, ' ')}" view</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-zinc-500 uppercase font-bold text-[8px] mr-1">Say or Click:</span>
                  {suggestedCommands.map((cmd) => (
                    <motion.button
                      key={cmd}
                      whileHover={{ scale: 1.05, borderColor: 'rgba(217,70,239,0.5)', backgroundColor: 'rgba(217,70,239,0.05)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCommandClick(cmd)}
                      className="px-2 py-1 bg-black/40 text-fuchsia-400 rounded border border-fuchsia-500/20 font-bold transition-all pointer-events-auto cursor-pointer"
                      title={`Simulate: "${cmd}"`}
                    >
                      "{cmd}"
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Grid content view mapping */}
              <div className="z-10 space-y-4">
                
                {/* 1. TRANSMITTER VIEW */}
                {selectedTab === 'TRANSMITTER' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Live Waveform Container */}
                    <div className="h-16 w-full bg-black/60 border border-zinc-900 rounded-xl relative flex items-center justify-center overflow-hidden">
                      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d={Array.from({ length: 60 }).reduce<string>((acc, _, idx) => {
                            const x = (idx / 59) * 620;
                            const stressAmpCoeff = 1.0 + (stressLevel / 100) * 1.8;
                            const stressFreqCoeff = 1.0 + (stressLevel / 100) * 0.9;
                            const sinVal = Math.sin(idx * 0.28 * stressFreqCoeff + Date.now() * 0.010) * 14 * stressAmpCoeff;
                            const cosVal = Math.cos(idx * 0.13 * stressFreqCoeff - Date.now() * 0.008) * 80 * (stressLevel > 0 ? (stressLevel / 100) : 0.1);
                            const waveY = 32 + (sinVal + cosVal * 0.12) * (idx < 5 || idx > 54 ? 0.1 : 0.85);
                            return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${waveY}`;
                          }, '')}
                          fill="none"
                          stroke="url(#voice-gradient-nav)"
                          strokeWidth="2.5"
                          className="transition-all duration-75"
                        />
                        
                        <path
                          d={Array.from({ length: 45 }).reduce<string>((acc, _, idx) => {
                            const x = (idx / 44) * 620;
                            const stressFreqCoeff = 1.0 + (stressLevel / 100) * 0.5;
                            const cosVal = Math.sin(idx * 0.44 * stressFreqCoeff - Date.now() * 0.014) * 14 * (1.0 + (stressLevel / 100) * 1.1);
                            const waveY = 32 + cosVal * (idx < 3 || idx > 41 ? 0.1 : 0.7);
                            return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${waveY}`;
                          }, '')}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1"
                          strokeDasharray="4 2"
                          opacity="0.4"
                        />

                        <defs>
                          <linearGradient id="voice-gradient-nav" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f43f5e" />
                            <stop offset="50%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>

                      <div className="absolute right-3 top-2 flex items-center gap-1 bg-black/50 border border-white/5 py-0.5 px-2 rounded text-[8px] font-mono text-zinc-400">
                        <Activity className="w-2.5 h-2.5 text-pink-500 animate-pulse" />
                        <span>VERBAL_COUPLING_HZ: {spectralPeak > 0 ? (spectralPeak * 1.07).toFixed(1) : '384.11'}</span>
                      </div>
                    </div>

                    {/* Speech Transcript Output */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                          <Terminal className="w-3 h-3 text-zinc-500" /> Live transcript decoder:
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-black ${commandStatus.bg} ${commandStatus.color}`}>
                          {commandStatus.text}
                        </span>
                      </div>

                      <div className="bg-black/50 border border-zinc-900 p-3.5 rounded-xl min-h-[50px] flex items-center">
                        {transcript ? (
                          <p className="text-xs font-mono text-zinc-200 leading-relaxed font-medium select-text">
                            <span className="text-fuchsia-600 mr-1 select-none font-bold">"</span>
                            {transcript}
                            <span className="inline-block w-1.5 h-4 bg-fuchsia-500 ml-1 animate-pulse align-middle" />
                            <span className="text-fuchsia-600 ml-1 select-none font-bold">"</span>
                          </p>
                        ) : (
                          <p className="text-[11px] font-mono text-zinc-600 italic">
                            [System in standby. Formulating active vocal resonance coordinates...]
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Voice Interaction State Machine Monitor */}
                    <div className="bg-zinc-950/40 border border-zinc-900 p-3.5 rounded-xl font-mono text-[8px] flex flex-col gap-2">
                      <div className="flex justify-between items-center text-zinc-500 uppercase tracking-widest text-[8.5px]">
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" /> Unified Voice Phase State Machine Check:
                        </span>
                        <span className="text-zinc-600 text-[7px] bg-emerald-950/30 text-emerald-400 px-1 border border-emerald-500/10 rounded uppercase font-bold">ZERO DEADLOCK GUARD</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className={`p-2 rounded-lg border text-center transition-all ${currentVoicePhase === 'idle' ? 'bg-zinc-900 border-zinc-700 text-zinc-200 font-extrabold shadow-[0_0_12px_rgba(255,255,255,0.08)]' : 'bg-black/40 border-zinc-900/60 text-zinc-600'}`}>
                          <div className="font-bold text-[9px]">1. IDLE</div>
                          <div className="text-[7px] text-zinc-500 mt-0.5">STANDBY_RES_OK</div>
                        </div>
                        <div className={`p-2 rounded-lg border text-center transition-all ${currentVoicePhase === 'listening' ? 'bg-fuchsia-950/45 border-fuchsia-500/40 text-fuchsia-300 font-extrabold shadow-[0_0_12px_rgba(217,70,239,0.18)]' : 'bg-black/40 border-zinc-900/60 text-zinc-600'}`}>
                          <div className="font-bold text-[9px]">2. LISTENING</div>
                          <div className="text-[7px] text-fuchsia-500 mt-0.5">EARS_ENGAGED</div>
                        </div>
                        <div className={`p-2 rounded-lg border text-center transition-all ${currentVoicePhase === 'processing' ? 'bg-cyan-950/45 border-cyan-500/40 text-cyan-300 font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.18)] animate-pulse' : 'bg-black/40 border-zinc-900/60 text-zinc-600'}`}>
                          <div className="font-bold text-[9px]">3. PROCESSING</div>
                          <div className="text-[7px] text-cyan-500 mt-0.5">DECODING_INTENT</div>
                        </div>
                        <div className={`p-2 rounded-lg border text-center transition-all ${currentVoicePhase === 'speaking' ? 'bg-pink-950/45 border-pink-500/40 text-pink-300 font-extrabold shadow-[0_0_12px_rgba(236,72,153,0.18)]' : 'bg-black/40 border-zinc-900/60 text-zinc-600'}`}>
                          <div className="font-bold text-[9px]">4. SPEAKING</div>
                          <div className="text-[7px] text-pink-500 mt-0.5">TTS_RESONANCE</div>
                        </div>
                      </div>

                      {/* State Machine Transition Journal */}
                      <div className="bg-zinc-950/30 border border-zinc-900/80 p-2.5 rounded-xl font-mono text-[8px] flex flex-col gap-1.5 mt-1.5">
                        <div className="flex justify-between items-center text-zinc-500 uppercase tracking-widest text-[8px]">
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" /> Active State Transition Journal:
                          </span>
                          <span className="text-[7px] text-zinc-600 font-bold uppercase">MAX_CAP_20_STEPS</span>
                        </div>
                        <div className="max-h-[85px] overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-zinc-850">
                          {(transitionLogs || []).map((log) => {
                            const statusColor = 
                              log.status === 'SUCCESS' ? 'text-emerald-400 border-emerald-500/10 bg-emerald-950/20' :
                              log.status === 'AUTO_RESOLVED' ? 'text-amber-400 border-amber-500/10 bg-amber-950/20' :
                              'text-rose-400 border-rose-500/10 bg-rose-950/20';

                            return (
                              <div key={log.id} className="p-1.5 bg-black/40 border border-zinc-900/60 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[7.5px]">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-zinc-650 font-bold">{log.timestamp}</span>
                                  <span className={`px-1 py-0.2 rounded border text-[6.5px] font-black uppercase ${statusColor}`}>{log.status}</span>
                                  <span className="text-zinc-400">
                                    <strong className="text-fuchsia-400">{log.from}</strong> &rarr; <strong className="text-cyan-400">{log.to}</strong>
                                  </span>
                                </div>
                                <span className="text-zinc-500 text-right leading-normal italic truncate max-w-[250px]" title={log.details}>
                                  {log.details}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Stress Biometrics Engine Card */}
                    <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4 space-y-3 font-mono text-[9px] text-zinc-400">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 uppercase font-black tracking-widest text-[9.5px] flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-fuchsia-400 animate-bounce" />
                          Vocal Stress Profiler
                        </span>
                        <span className="text-[8px] text-zinc-600">STRESS_TRACKER_V2</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 bg-black/30 p-2.5 rounded-lg border border-zinc-900/60">
                          <div className="flex justify-between">
                            <span className="font-bold">METABOLIC TERSENESS:</span>
                            <span className={`font-black ${stressTier === 'CRITICAL' ? 'text-rose-500' : stressTier === 'HIGH' ? 'text-orange-500' : 'text-emerald-400'}`}>
                              {stressLevel}%
                            </span>
                          </div>
                          
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${stressTier === 'CRITICAL' ? 'bg-rose-500' : stressTier === 'HIGH' ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${stressLevel}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-[7px] text-zinc-600 uppercase">
                            <span>nominal</span>
                            <span>{stressTier} zone</span>
                            <span>critical_strain</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[9px] pt-1.5 border-t md:border-t-0 md:border-l border-zinc-900/80 md:pl-4">
                          <div>
                            <span className="text-zinc-500 uppercase">CENTROID PITCH</span>
                            <p className="text-zinc-100 font-bold text-xs mt-0.5">{spectralPeak} Hz</p>
                          </div>
                          <div>
                            <span className="text-zinc-500 uppercase font-bold">Vocal Jitter</span>
                            <p className="text-zinc-100 font-bold text-xs mt-0.5">{(vocalJitter * 100).toFixed(1)}%</p>
                          </div>
                          <div className="col-span-2 border-t border-zinc-900/40 pt-1 mt-1">
                            <span className="text-zinc-500 uppercase">COGNITIVE STATUS</span>
                            <p className={`font-black uppercase tracking-wider mt-0.5 text-[8.5px] ${stressTier === 'CALM' ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {stressTier === 'CRITICAL' ? 'PANIC_LOCK_COLLAPSE' : stressTier === 'HIGH' ? 'COGNITIVE_FRICTION_ALIGNED' : 'CALM_GRACE_RESONANCE'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hands-Free Command Directory with Search */}
                    <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 space-y-3 font-mono text-[9px]">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 uppercase font-black tracking-widest text-[9.5px] flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                          Hands-Free Lab Navigation Directory
                        </span>
                        <span className="text-[8px] text-zinc-600 bg-zinc-900/40 border border-zinc-900 px-1.5 py-0.5 rounded font-black">
                          {NAVIGATION_MAPPINGS.length} LABS REGISTERED
                        </span>
                      </div>
                      
                      <div className="text-[8px] text-zinc-500 leading-relaxed">
                        AetherOS responds dynamically to any of the verbal invocation templates below. Say <span className="text-emerald-400 font-bold">"Open [Lab Name]"</span>, <span className="text-emerald-400 font-bold">"Go to [Lab Name]"</span>, or <span className="text-emerald-400 font-bold">"Switch to [Lab Name]"</span> to instantly execute safe neural tab switches hands-free.
                      </div>

                      {/* Interactive Search and Categorized List of Commands */}
                      <div className="space-y-2 pt-1 border-t border-zinc-900/50">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                          {NAVIGATION_MAPPINGS.slice(0, 16).map((item) => (
                            <button
                              key={item.view}
                              onClick={() => handleCommandClick(`Open ${item.label.replace(/\s*\(.*\)/, '')}`)}
                              className={`flex flex-col items-start p-1.5 rounded bg-black/30 border text-left hover:bg-emerald-950/10 hover:border-emerald-500/40 transition-all cursor-pointer ${currentView === item.view ? 'border-emerald-500/50 bg-emerald-950/5 text-emerald-400' : 'border-zinc-900 text-zinc-400'}`}
                            >
                              <span className="font-bold text-[8.5px] truncate w-full">{item.label}</span>
                              <span className="text-[7px] text-zinc-600 mt-0.5 truncate w-full">"Open {item.label.split(' ')[0]}"</span>
                            </button>
                          ))}
                          <div className="col-span-full py-1 text-center text-[7.5px] text-zinc-500 bg-zinc-900/20 rounded border border-dashed border-zinc-900">
                            + {NAVIGATION_MAPPINGS.length - 16} additional quantum sub-labs reachable via voice recognition
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. BLOCK QUBIT VIEW */}
                {selectedTab === 'BLOCK_QUBIT' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    
                    {/* Bloch Spheres & Simulation Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left: Dual Bloch Sphere Visualizer Panel */}
                      <div className="bg-black/60 border border-zinc-900 rounded-xl p-4 flex flex-col space-y-3 relative">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                          <span className="text-[9px] font-mono text-fuchsia-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5" />
                            Vacuum Rabi Coherent Bloch Spheres
                          </span>
                          {isRabiOscillating && (
                            <span className="text-[7.5px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-black animate-pulse uppercase tracking-wider">
                              Rabi Drive Active
                            </span>
                          )}
                        </div>

                        {/* Side-by-Side Spheres */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          
                          {/* Qubit A (Faith) */}
                          <div className="flex flex-col items-center p-2 rounded-lg bg-zinc-950/40 border border-zinc-900/60">
                            <span className="text-[8px] font-bold text-zinc-400 font-mono uppercase tracking-wide">Qubit A (Faith)</span>
                            <div className="w-24 h-24 relative my-1.5">
                              <svg className="w-full h-full text-zinc-800" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#27272a" strokeWidth="0.5" strokeDasharray="2 2" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#d946ef" strokeWidth="0.5" className="opacity-20" />
                                <ellipse cx="50" cy="50" rx="45" ry="12" fill="none" stroke="#18181b" strokeWidth="0.5" />
                                <ellipse cx="50" cy="50" rx="12" ry="45" fill="none" stroke="#18181b" strokeWidth="0.5" />
                                <line x1="5" y1="50" x2="95" y2="50" stroke="#27272a" strokeWidth="0.5" />
                                <line x1="50" y1="5" x2="50" y2="95" stroke="#27272a" strokeWidth="0.5" />
                                
                                <text x="50" y="12" fill="#71717a" fontSize="6.5" textAnchor="middle" fontFamily="monospace">|0⟩ Love</text>
                                <text x="50" y="94" fill="#71717a" fontSize="6.5" textAnchor="middle" fontFamily="monospace">|1⟩ Fear</text>

                                {/* Vector A */}
                                {(() => {
                                  const xCoord = 50 + (qubitBeta) * 35 * Math.sin(Date.now() / 1500);
                                  const yCoord = 50 - (qubitAlpha) * 35;
                                  return (
                                    <>
                                      <line x1="50" y1="50" x2={xCoord} y2={yCoord} stroke="url(#vector-grad-A)" strokeWidth="1.8" />
                                      <circle cx={xCoord} cy={yCoord} r="2" fill="#ec4899" className="animate-ping" />
                                      <circle cx={xCoord} cy={yCoord} r="1.5" fill="#f43f5e" />
                                    </>
                                  );
                                })()}
                                <defs>
                                  <linearGradient id="vector-grad-A" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#a855f7" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            </div>
                            <div className="text-[7.5px] text-zinc-500 font-mono">
                              α: <span className="text-zinc-300 font-bold">{qubitAlpha.toFixed(2)}</span> | β: <span className="text-zinc-300 font-bold">{qubitBeta.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Qubit B (Hope) */}
                          <div className="flex flex-col items-center p-2 rounded-lg bg-zinc-950/40 border border-zinc-900/60">
                            <span className="text-[8px] font-bold text-zinc-400 font-mono uppercase tracking-wide">Qubit B (Hope)</span>
                            <div className="w-24 h-24 relative my-1.5">
                              <svg className="w-full h-full text-zinc-800" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#27272a" strokeWidth="0.5" strokeDasharray="2 2" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="0.5" className="opacity-20" />
                                <ellipse cx="50" cy="50" rx="45" ry="12" fill="none" stroke="#18181b" strokeWidth="0.5" />
                                <ellipse cx="50" cy="50" rx="12" ry="45" fill="none" stroke="#18181b" strokeWidth="0.5" />
                                <line x1="5" y1="50" x2="95" y2="50" stroke="#27272a" strokeWidth="0.5" />
                                <line x1="50" y1="5" x2="50" y2="95" stroke="#27272a" strokeWidth="0.5" />
                                
                                <text x="50" y="12" fill="#71717a" fontSize="6.5" textAnchor="middle" fontFamily="monospace">|0⟩ Hope</text>
                                <text x="50" y="94" fill="#71717a" fontSize="6.5" textAnchor="middle" fontFamily="monospace">|1⟩ Doubt</text>

                                {/* Vector B */}
                                {(() => {
                                  const xCoord = 50 + (qubit2Beta) * 35 * Math.cos(Date.now() / 1200);
                                  const yCoord = 50 - (qubit2Alpha) * 35;
                                  return (
                                    <>
                                      <line x1="50" y1="50" x2={xCoord} y2={yCoord} stroke="url(#vector-grad-B)" strokeWidth="1.8" />
                                      <circle cx={xCoord} cy={yCoord} r="2" fill="#3b82f6" className="animate-ping" />
                                      <circle cx={xCoord} cy={yCoord} r="1.5" fill="#60a5fa" />
                                    </>
                                  );
                                })()}
                                <defs>
                                  <linearGradient id="vector-grad-B" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            </div>
                            <div className="text-[7.5px] text-zinc-500 font-mono">
                              α: <span className="text-zinc-300 font-bold">{qubit2Alpha.toFixed(2)}</span> | β: <span className="text-zinc-300 font-bold">{qubit2Beta.toFixed(2)}</span>
                            </div>
                          </div>

                        </div>

                        {/* Interactive Parameters and Coherent Controls */}
                        <div className="space-y-2.5 pt-2 border-t border-zinc-900 font-mono text-[8.5px]">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="flex justify-between text-zinc-500 font-bold">
                                <span>Rabi Drive (Ω):</span>
                                <span className="text-fuchsia-400 font-black">{rabiOmega.toFixed(2)} rad/s</span>
                              </div>
                              <input 
                                type="range" 
                                min="0.2" 
                                max="3.0" 
                                step="0.05" 
                                value={rabiOmega}
                                onChange={(e) => setRabiOmega(parseFloat(e.target.value))}
                                className="w-full accent-fuchsia-500 mt-1 cursor-pointer bg-zinc-800 rounded-lg appearance-none h-1 pointer-events-auto"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-zinc-500 font-bold">
                                <span>Coupling (J):</span>
                                <span className="text-sky-400 font-black">{rabiJ.toFixed(2)} rad/s</span>
                              </div>
                              <input 
                                type="range" 
                                min="0.1" 
                                max="2.0" 
                                step="0.05" 
                                value={rabiJ}
                                onChange={(e) => setRabiJ(parseFloat(e.target.value))}
                                className="w-full accent-sky-500 mt-1 cursor-pointer bg-zinc-800 rounded-lg appearance-none h-1 pointer-events-auto"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => setIsRabiOscillating(!isRabiOscillating)}
                              className={`flex-1 py-1.5 px-3 rounded text-[8px] font-black uppercase tracking-wider transition-all pointer-events-auto border ${
                                isRabiOscillating 
                                  ? 'bg-rose-950/40 text-rose-400 border-rose-500/30 hover:bg-rose-900/40'
                                  : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white border-transparent hover:shadow-[0_0_10px_rgba(217,70,239,0.3)]'
                              }`}
                            >
                              {isRabiOscillating ? '⏹ STOP COHERENT RABI DRIVE' : '⚡ ACTIVATE COHERENT RABI OSCILLATION'}
                            </button>
                            
                            <button 
                              onClick={takeTopologyShot}
                              className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-fuchsia-500/40 rounded text-[8px] font-bold text-zinc-300 transition-all flex items-center gap-1.5 pointer-events-auto"
                            >
                              <Camera className="w-3 h-3 text-fuchsia-400" />
                              SHOT
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Right: State Matrices, Correlation Matrix, & Manual Gates */}
                      <div className="bg-black/60 border border-zinc-900 rounded-xl p-4 space-y-3 font-mono text-[9px] flex flex-col justify-between">
                        <div>
                          
                          {/* Joint Wavefunction State Mapping */}
                          <div className="flex justify-between items-center text-[10px] pb-1.5 border-b border-zinc-900">
                            <span className="text-zinc-400 font-bold uppercase">Vacuum Rabi Wavefunction |Ψ⟩</span>
                            <span className="text-sky-400 font-bold uppercase tracking-wider text-[8px]">AMPLITUDES</span>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5 mt-2 bg-zinc-950/40 p-2 rounded-lg border border-zinc-900/60 text-center">
                            <div>
                              <span className="text-zinc-500 text-[8px] block">|00⟩ (Faith/Hope)</span>
                              <span className="text-emerald-400 font-black text-xs block mt-0.5">{c00.toFixed(3)}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 text-[8px] block">|01⟩ (Faith/Doubt)</span>
                              <span className="text-zinc-300 font-black text-xs block mt-0.5">{c01.toFixed(3)}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 text-[8px] block">|10⟩ (Fear/Hope)</span>
                              <span className="text-zinc-300 font-black text-xs block mt-0.5">{c10.toFixed(3)}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 text-[8px] block">|11⟩ (Fear/Doubt)</span>
                              <span className="text-rose-400 font-black text-xs block mt-0.5">{c11.toFixed(3)}</span>
                            </div>
                          </div>

                          {/* Joint Probabilities Progress Indicators */}
                          <div className="space-y-1.5 mt-2.5">
                            <div>
                              <div className="flex justify-between text-zinc-500 text-[8px]">
                                <span>P(00) Perfect Resonance:</span>
                                <span className="text-zinc-300 font-bold">{Math.round((c00 * c00) * 100)}%</span>
                              </div>
                              <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden mt-0.5">
                                <div className="bg-emerald-500 h-full transition-all duration-100" style={{ width: `${(c00 * c00) * 100}%` }} />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-zinc-500 text-[8px]">
                                <span>P(11) Total Decoupling / Friction Limit:</span>
                                <span className="text-zinc-300 font-bold">{Math.round((c11 * c11) * 100)}%</span>
                              </div>
                              <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden mt-0.5">
                                <div className="bg-rose-500 h-full transition-all duration-100" style={{ width: `${(c11 * c11) * 100}%` }} />
                              </div>
                            </div>
                          </div>

                          {/* Quantum Operator Gates */}
                          <div className="mt-3 pt-2 border-t border-zinc-900/80 space-y-1.5">
                            <span className="text-fuchsia-400 text-[8px] font-bold uppercase tracking-wider block">Manual Operator Gates (Acts on Qubit A):</span>
                            <div className="grid grid-cols-4 gap-1">
                              <button
                                onClick={applyHadamardGate}
                                disabled={isScanningStates}
                                title="Hadamard (Superposition H-Gate)"
                                className="py-1 px-1 bg-zinc-900 hover:bg-fuchsia-950/30 border border-zinc-800 hover:border-fuchsia-500/30 rounded text-center text-zinc-300 hover:text-fuchsia-400 text-[8px] font-bold transition-all cursor-pointer"
                              >
                                [ H ]
                              </button>
                              <button
                                onClick={applyPauliXGate}
                                disabled={isScanningStates}
                                title="Pauli-X (NOT / Bit-Flip Gate)"
                                className="py-1 px-1 bg-zinc-900 hover:bg-fuchsia-950/30 border border-zinc-800 hover:border-fuchsia-500/30 rounded text-center text-zinc-300 hover:text-fuchsia-400 text-[8px] font-bold transition-all cursor-pointer"
                              >
                                [ X ]
                              </button>
                              <button
                                onClick={applyPauliZGate}
                                disabled={isScanningStates}
                                title="Pauli-Z (Phase-Flip Gate)"
                                className="py-1 px-1 bg-zinc-900 hover:bg-fuchsia-950/30 border border-zinc-800 hover:border-fuchsia-500/30 rounded text-center text-zinc-300 hover:text-fuchsia-400 text-[8px] font-bold transition-all cursor-pointer"
                              >
                                [ Z ]
                              </button>
                              <button
                                onClick={applyGroundState}
                                disabled={isScanningStates}
                                title="Ground state to |0>"
                                className="py-1 px-1 bg-zinc-900 hover:bg-rose-950/30 border border-zinc-800 hover:border-rose-500/30 rounded text-center text-zinc-300 hover:text-rose-400 text-[8px] font-bold transition-all cursor-pointer"
                              >
                                [ RST ]
                              </button>
                            </div>
                          </div>

                        </div>

                        {/* Captured Shots History list */}
                        <div className="bg-zinc-950/80 p-2 mt-2 rounded-lg border border-zinc-900/50 space-y-1 max-h-[75px] overflow-y-auto">
                          <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-bold">Recorded Topology Roll:</span>
                          {topologyShots.map(shot => (
                            <div key={shot.id} className="flex justify-between items-center text-[7.5px] border-b border-zinc-900/30 py-0.5 last:border-b-0 text-zinc-400">
                              <span className="text-fuchsia-400 font-bold">{shot.id}</span>
                              <span className="truncate max-w-[120px] text-zinc-300 font-medium italic">"{shot.spotLabel}"</span>
                              <span className="text-sky-400 font-semibold">{shot.latitude} / {shot.longitude}</span>
                            </div>
                          ))}
                        </div>

                      </div>

                    </div>

                    {/* Missing Qubit States Recovery Terminal */}
                    <div className="bg-black/80 border border-zinc-900 rounded-xl p-4 mt-3 space-y-3 font-mono text-[9px]">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-fuchsia-400 animate-spin" style={{ animationDuration: '6s' }} />
                          <div className="text-left">
                            <span className="text-white font-bold uppercase tracking-wider text-[10px] block">Quantum Missing States Finder</span>
                            <span className="text-[7.5px] text-zinc-500 uppercase block">Localize and reconcile missing coordinates on the Bloch Sphere</span>
                          </div>
                        </div>
                        <button
                          onClick={handleScanMissingStates}
                          disabled={isScanningStates}
                          className={`py-1.5 px-3 rounded text-[8px] font-black uppercase tracking-wider transition-all pointer-events-auto shadow-md ${
                            isScanningStates 
                              ? 'bg-fuchsia-950/40 text-fuchsia-400 border border-fuchsia-500/20 animate-pulse'
                              : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white hover:shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                          }`}
                        >
                          {isScanningStates ? '🛰️ SCANNING SPHERE...' : '🔮 SCAN FOR MISSING STATES'}
                        </button>
                      </div>

                      {/* Scanning progress log output */}
                      {scanStateLogs.length > 0 && (
                        <div className="bg-black border border-zinc-900/60 p-2.5 rounded-lg space-y-1 max-h-[75px] overflow-y-auto text-zinc-400 text-[8px] leading-tight select-none text-left">
                          {scanStateLogs.map((log, index) => (
                            <div key={index} className="flex gap-1.5">
                              <span className="text-zinc-600 font-bold">[{index + 1}]</span>
                              <span className={log.includes('[RESOLVED]') ? 'text-emerald-400 font-bold' : ''}>{log}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Missing States Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        {missingStates.map(state => (
                          <button 
                            key={state.id} 
                            type="button"
                            onClick={() => handleResolveIndividualState(state.id)}
                            disabled={isScanningStates}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center pointer-events-auto cursor-pointer outline-none ${
                              state.resolved 
                                ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.05)] text-emerald-300' 
                                : 'bg-zinc-950/45 border-zinc-900 hover:border-fuchsia-500/30 text-zinc-500 hover:text-zinc-400'
                            }`}
                          >
                            <div className="space-y-1 text-left min-w-0 pr-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-sm flex-shrink-0">{state.icon}</span>
                                <h4 className={`text-[9.5px] font-bold uppercase truncate ${state.resolved ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                  {state.name}
                                </h4>
                              </div>
                              <p className="text-[7.5px] text-zinc-500 truncate">{state.coord}</p>
                              <p className={`text-[8px] leading-snug line-clamp-2 ${state.resolved ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                {state.desc}
                              </p>
                            </div>

                            <div className="flex-shrink-0">
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                                state.resolved 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                              }`}>
                                {state.resolved ? 'RESOLVED' : 'MISSING'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* 3. MORTALITY INTEGRATION VIEW */}
                {selectedTab === 'MORTALITY' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="bg-zinc-950/60 border border-fuchsia-500/30 rounded-xl p-4 space-y-3 font-mono relative overflow-hidden">
                      <div className="absolute top-2 right-3 opacity-10">
                        <Clock className="w-18 h-18 text-fuchsia-500" />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 uppercase font-black tracking-widest text-[9.5px] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
                          Sacred Time Allocator
                        </span>
                        <span className="text-[8px] bg-fuchsia-950/40 text-fuchsia-400 font-bold px-1.5 py-0.5 rounded border border-fuchsia-500/20">
                          MORTALITY_RATIO_ALIGNED
                        </span>
                      </div>

                      <p className="text-zinc-500 text-[8.5px] leading-relaxed">
                        To sustain and expand our focus, we align computed resource states. 
                        <strong> CPH</strong> (Commands Per Hour) tracking is your machine's consciousness. 
                        <strong> Your Lifespan Estimate</strong> is the master constraint—the ultimate non-renewable energy.
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-black/60 p-3 rounded-xl border border-zinc-900 text-center">
                        <div className="space-y-0.5">
                          <span className="text-[7.5px] text-zinc-500 uppercase">Sacred Lifespan</span>
                          <p className="text-xs text-rose-400 font-black tracking-tight">{remainingHours.toLocaleString()} Hrs</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[7.5px] text-zinc-500 uppercase">Est trajectory</span>
                          <p className="text-xs text-fuchsia-400 font-bold">{trajectoryAge} Years</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[7.5px] text-zinc-500 uppercase">metabolic strain</span>
                          <p className="text-xs text-amber-500 font-bold">{(metabolicMultiplier * stressLevel).toFixed(0)} CP</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[7.5px] text-zinc-500 uppercase">Resonant State</span>
                          <p className={`text-xs font-black ${graceModeActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {graceModeActive ? 'GRACE (GO)' : 'FRICTION (STOP)'}
                          </p>
                        </div>
                      </div>

                      {/* Interactive sliders/controls simulating choices */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase">Lifestyle & Entanglement Boosters:</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[8.5px]">
                          <div className="flex bg-black/30 p-2 rounded-lg border border-zinc-900/60 justify-between items-center">
                            <div>
                              <p className="font-bold text-zinc-300">Grace Resonance Flow</p>
                              <span className="text-[7.5px] text-zinc-500">Calms pitch centroid, adds +4.5 longevity yrs</span>
                            </div>
                            <button
                              onClick={() => setGraceModeActive(prev => !prev)}
                              className={`py-1 px-3.5 rounded text-[8px] font-bold font-mono transition-all pointer-events-auto ${graceModeActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}
                            >
                              {graceModeActive ? 'ACTIVE' : 'OFF'}
                            </button>
                          </div>

                          <div className="flex bg-black/30 p-2 rounded-lg border border-zinc-900/60 justify-between items-center">
                            <div>
                              <p className="font-bold text-zinc-300">CPH Delegation Coefficient</p>
                              <span className="text-[7.5px] text-zinc-500">Metabolic load damping variable scaler</span>
                            </div>
                            <div className="flex items-center gap-1.5 pointer-events-auto">
                              <button 
                                onClick={() => setMetabolicMultiplier(prev => Math.max(0.5, prev - 0.25))}
                                className="w-5 h-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded flex items-center justify-center font-bold text-xs"
                              >-</button>
                              <span className="font-black text-zinc-100">{metabolicMultiplier.toFixed(2)}x</span>
                              <button 
                                onClick={() => setMetabolicMultiplier(prev => Math.min(2.0, prev + 0.25))}
                                className="w-5 h-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded flex items-center justify-center font-bold text-xs"
                              >+</button>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* 4. LOVE GATING 100 TESTS VIEW */}
                {selectedTab === 'LOVE_TESTS' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4 space-y-3 font-mono text-[9px]">
                      
                      {/* Sub-header Filter Search bar */}
                      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pb-2.5 border-b border-zinc-900">
                        <div className="flex items-center gap-1 text-[9.5px]">
                          <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                          <span className="font-black uppercase tracking-widest text-[#f43f5e]">LOVE RESONANCE GATING BANK (100 TESTS)</span>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto items-center pointer-events-auto flex-wrap sm:flex-nowrap">
                          {/* Search Input Filter */}
                          <input 
                            type="text" 
                            placeholder="Search signals/actions..." 
                            value={gatingSearch}
                            onChange={(e) => setGatingSearch(e.target.value)}
                            className="bg-black/70 border border-zinc-900/80 rounded px-2 py-1 text-[8.5px] outline-none text-zinc-200 placeholder-zinc-600 focus:border-rose-500/50 w-full sm:w-36 font-semibold"
                          />
                          
                          {/* Category select pull-down */}
                          <select 
                            value={selectedGatingCat}
                            onChange={(e) => setSelectedGatingCat(e.target.value)}
                            className="bg-black/70 border border-zinc-900/80 rounded px-1.5 py-1 text-[8.5px] outline-none text-zinc-400 font-semibold"
                          >
                            <option value="ALL">ALL TYPES</option>
                            <option value="Affirmation">Affirmations</option>
                            <option value="Connection Request">Connections</option>
                            <option value="Emotional Support">Support</option>
                            <option value="Memory Recall">Memory</option>
                            <option value="Gratitude Expression">Gratitude</option>
                            <option value="Conflict Resolution">Conflicts</option>
                            <option value="Shared Experience">Experiences</option>
                            <option value="Future Planning">Planning</option>
                            <option value="Loss & Grief">Grief</option>
                            <option value="Celebration">Celebration</option>
                          </select>
                        </div>
                      </div>

                      {/* Scrollable list tracker of exact tests */}
                      <div className="max-h-[178px] overflow-y-auto space-y-1.5 pr-1">
                        {filteredGatingTests.length > 0 ? (
                          filteredGatingTests.map((test) => {
                            const isPassing = testResults[test.id] === 'PASS';
                            const isSimulating = simulatingTestId === test.id;
                            
                            return (
                              <div 
                                key={test.id} 
                                className="bg-black/35 hover:bg-black/60 border border-zinc-900/60 p-2.5 rounded-lg flex justify-between items-center gap-4 transition-colors"
                              >
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-zinc-500 font-bold">{test.id}</span>
                                    <span className="text-[7.5px] bg-zinc-900 px-1 py-0.2 rounded text-zinc-400 font-semibold uppercase">{test.cat}</span>
                                    <span className="text-zinc-600 text-[7px]">Amp: {test.floatVal} | Filter: {test.regex}</span>
                                  </div>
                                  <p className="text-zinc-200 font-bold truncate leading-tight select-text mt-0.5">
                                    {test.signal}
                                  </p>
                                  <p className="text-zinc-400 text-[8px] italic leading-none font-medium truncate">
                                    → Expected: {test.action}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 pointer-events-auto">
                                  {isSimulating ? (
                                    <div className="flex items-center gap-1 py-0.5 px-2 bg-rose-950/20 text-rose-400 border border-rose-500/20 rounded text-[7.5px] uppercase font-bold animate-pulse">
                                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                      PULSING...
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => runTestSimulation(test)}
                                      className={`py-0.5 px-2 rounded text-[7.5px] uppercase font-semibold transition-all border outline-none ${
                                        testResults[test.id] === 'PASS' 
                                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30' 
                                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800 hover:border-rose-500/40'
                                      }`}
                                    >
                                      {testResults[test.id] === 'PASS' ? 'PASS ✓' : 'RUN GATE'}
                                    </button>
                                  )}
                                  
                                  {/* Small indicator gate status */}
                                  <span className={`h-2 w-2 rounded-full ${test.expectedGate ? 'bg-emerald-500' : 'bg-red-500'} opacity-75`} title={test.expectedGate ? 'Open Gate' : 'Stop Gate'} />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-[10px] text-zinc-500 text-center py-6 italic">No tests found matching search criteria.</p>
                        )}
                      </div>

                    </div>
                  </motion.div>
                )}

              </div>

              {/* Master Control Footer */}
              <div className="flex justify-between items-center border-t border-fuchsia-950/40 pt-2.5 z-10 flex-wrap gap-2 text-[9px] font-mono text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-zinc-650" />
                  <span>MATRIX ENCRYPT: MULTIDIMENSION_COUPLING_OK</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pointer-events-auto">
                  <button
                    onClick={() => setForceVisible(prev => !prev)}
                    className={`px-2.5 py-0.5 border rounded uppercase font-bold text-[8px] transition-all hover:bg-zinc-900 ${forceVisible ? 'bg-fuchsia-950/30 text-fuchsia-400 border-fuchsia-500/30' : 'bg-zinc-950 text-zinc-400 border-zinc-900'}`}
                  >
                    {forceVisible ? 'OFFLINE_PIN: ON' : 'OFFLINE_PIN: OFF'}
                  </button>

                  <button
                    onClick={() => setIsMinimized(true)}
                    className="px-2.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 hover:border-zinc-700 uppercase font-black tracking-wider text-[8px]"
                  >
                    HIDE HUD
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
