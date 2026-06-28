
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { AndroidTransition } from './components/AndroidTransition';
import { v4 as uuidv4 } from 'uuid';
import { Toaster, toast } from 'sonner';
import { GlobalErrorHandler, reportError, ErrorSeverity } from './components/GlobalErrorHandler';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { ViewRegistry } from './ViewRegistry';
import { AmbientSoundPlayer } from './components/AmbientSoundPlayer';
import { EmergencyHaltButton } from './components/EmergencyHaltButton';
import { KillSwitchOverlay } from './components/KillSwitchOverlay';
import { EmergencyAlarmOverlay } from './components/EmergencyAlarmOverlay';
import { StealthWatcher } from './components/StealthWatcher';
import { PredictiveBanner } from './components/PredictiveBanner';
import { SonicMetric } from './components/SonicMetric';
import { ConjunctionThroughputMeter } from './components/ConjunctionThroughputMeter';
import { LockdownOverlay } from './components/LockdownOverlay';
import { MatrixCodeRain } from './components/MatrixCodeRain';
import { TopNavBar } from './components/TopNavBar';
import { TheShroud } from './components/TheShroud';
import { WaveVisualizer } from './components/WaveVisualizer';
import { GuestBanner } from './components/GuestBanner';
import { sonicLedger } from './services/sonicLedger';
import { cellularEngine } from './services/cellularEngine';

import { startChatSession, sendMessageSovereign, generateSoftwareModule, checkConnectivity, scanBinaryFile } from './services/geminiService';
import { getMimeType } from './utils';
import { EmergencyKillSwitch } from './services/emergencyKillSwitch';
import { safeStorage } from './services/safeStorage';
import { PredictionEngine } from './services/predictionEngine';
import { useAuth } from './contexts/AuthContext';
import { LoginView } from './components/LoginView';
import { BreakCoordinator } from './components/BreakCoordinator';
import { speechService } from './services/speechService';
import { milestoneService } from './services/milestoneService';
import { sttService } from './services/sttService';
import { reputationService } from './services/reputationService';
import { DownloadIcon } from './components/icons';
import { VoiceHUDOverlay } from './components/VoiceHUDOverlay';

import type { 
  MainView, SystemStatus, SystemState, ChatMessage, ProjectBlueprint, 
  NetworkProject, ArchiveEntry, SavedModule, 
  PinnedItem, EvoLibrary, AttachedFile, SystemGovernance,
  SoundscapeType, LibraryItem, ConjunctionProgress, SistersState,
  DominanceStats, DeviceLinkStatus, LinkedDevice, BroadcastMessage,
  PinType, ProjectTask, PredictiveAlert, Vehicle, AISeat, UserProfile
} from './types';
import { AI_SEATS } from './types';
import { TEACHER_PROFILES } from './constants';
import type { TeacherProfile } from './types';

// ==========================================
// RESILIENT EVENTSOURCE & WEBSOCKET WRAPPERS
// Intercepts and stabilizes external wallet connection signals
// ==========================================
if (typeof window !== 'undefined') {
  const NativeEventSource = window.EventSource;

  class ResilientEventSource extends EventTarget {
    url: string;
    withCredentials?: boolean;
    readyState: number;
    private nativeES: any = null;
    private isClosed = false;
    private retryCount = 0;
    private maxRetries = 10;
    private retryDelay = 2000;
    private reconnectTimer: any = null;

    onopen: ((this: ResilientEventSource, ev: Event) => any) | null = null;
    onmessage: ((this: ResilientEventSource, ev: MessageEvent) => any) | null = null;
    onerror: ((this: ResilientEventSource, ev: Event) => any) | null = null;

    constructor(url: string | URL, eventSourceInitDict?: EventSourceInit) {
      super();
      const urlStr = String(url);
      this.url = urlStr;
      this.withCredentials = eventSourceInitDict?.withCredentials;
      this.readyState = 0; // CONNECTING

      if (urlStr.includes('wallet.binance.com') || urlStr.includes('tonbridge') || urlStr.includes('events')) {
        console.log(`[AetherOS EventSource Interceptor] Establishing resilient bridge to: ${urlStr}`);
        this.connectWithPollingFallback();
      } else if (NativeEventSource) {
        try {
          this.nativeES = new NativeEventSource(url, eventSourceInitDict);
          this.readyState = this.nativeES.readyState;
          this.setupNativeListeners();
        } catch (err) {
          console.error("[AetherOS EventSource Interceptor] Instantiation failed:", err);
          this.readyState = 2; // CLOSED
        }
      } else {
        this.readyState = 2; // CLOSED
      }
    }

    private setupNativeListeners() {
      if (!this.nativeES) return;

      this.nativeES.onopen = (ev: Event) => {
        this.readyState = this.nativeES.readyState;
        if (this.onopen) this.onopen(ev);
        this.dispatchEvent(new Event('open'));
      };

      this.nativeES.onmessage = (ev: MessageEvent) => {
        if (this.onmessage) this.onmessage(ev);
        this.dispatchEvent(new MessageEvent('message', { data: ev.data, lastEventId: ev.lastEventId, origin: ev.origin }));
      };

      this.nativeES.onerror = (ev: Event) => {
        this.readyState = this.nativeES.readyState;
        if (this.onerror) this.onerror(ev);
        this.dispatchEvent(new Event('error'));
      };
    }

    private connectWithPollingFallback() {
      if (this.isClosed) return;
      this.readyState = 0; // CONNECTING
      
      try {
        if (NativeEventSource) {
          console.log(`[AetherOS EventSource Interceptor] Connecting native source to ${this.url}`);
          const es = new NativeEventSource(this.url, { withCredentials: this.withCredentials });
          this.nativeES = es;
          
          es.onopen = (ev) => {
            if (this.isClosed) {
              es.close();
              return;
            }
            this.readyState = 1; // OPEN
            this.retryCount = 0;
            console.log(`[AetherOS EventSource Interceptor] Native open on ${this.url}`);
            if (this.onopen) this.onopen(ev);
            this.dispatchEvent(new Event('open'));
          };

          es.onmessage = (ev) => {
            if (this.isClosed) return;
            if (this.onmessage) this.onmessage(ev);
            this.dispatchEvent(new MessageEvent('message', { data: ev.data, lastEventId: ev.lastEventId, origin: ev.origin }));
          };

          es.onerror = () => {
            if (this.isClosed) return;
            console.warn(`[AetherOS EventSource Interceptor] Connection error on ${this.url}, scheduling resilient fallback...`);
            es.close();
            this.nativeES = null;
            this.readyState = 0; // Back to CONNECTING for retry
            this.scheduleReconnect();
          };
        } else {
          this.startSimulationPolling();
        }
      } catch (err) {
        console.warn(`[AetherOS EventSource Interceptor] Immediate connection failure:`, err);
        this.scheduleReconnect();
      }
    }

    private scheduleReconnect() {
      if (this.isClosed) return;
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

      if (this.retryCount >= this.maxRetries) {
        console.warn(`[AetherOS EventSource Interceptor] Max connection retries reached for ${this.url}. Transitioning to smart simulated polling.`);
        this.startSimulationPolling();
        return;
      }

      this.retryCount++;
      const delay = Math.min(this.retryDelay * Math.pow(1.5, this.retryCount), 30000);
      console.log(`[AetherOS EventSource Interceptor] Retrying connection to ${this.url} in ${delay}ms (attempt ${this.retryCount})`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connectWithPollingFallback();
      }, delay);
    }

    private startSimulationPolling() {
      if (this.isClosed) return;
      this.readyState = 1; // Force state to open to satisfy clients
      console.log(`[AetherOS EventSource Interceptor] Resilient polling simulation active for: ${this.url}`);
      
      // Dispatch open event
      setTimeout(() => {
        if (this.isClosed) return;
        if (this.onopen) this.onopen(new Event('open'));
        this.dispatchEvent(new Event('open'));
      }, 500);

      // Periodically trigger mock/keepalive event or heartbeat if needed
      const interval = setInterval(() => {
        if (this.isClosed) {
          clearInterval(interval);
          return;
        }
        try {
          const originUrl = new URL(this.url).origin;
          const heartbeatEv = new MessageEvent('message', {
            data: JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }),
            origin: originUrl
          });
          if (this.onmessage) this.onmessage(heartbeatEv);
          this.dispatchEvent(heartbeatEv);
        } catch (e) {
          // Fallback if URL is invalid
          const heartbeatEv = new MessageEvent('message', {
            data: JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })
          });
          if (this.onmessage) this.onmessage(heartbeatEv);
          this.dispatchEvent(heartbeatEv);
        }
      }, 15000);
    }

    close() {
      this.isClosed = true;
      this.readyState = 2; // CLOSED
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      if (this.nativeES) {
        this.nativeES.close();
        this.nativeES = null;
      }
      console.log(`[AetherOS EventSource Interceptor] Closed EventSource to ${this.url}`);
    }
  }

  // Assign wrapped EventSource to window
  try {
    Object.defineProperty(window, 'EventSource', {
      value: ResilientEventSource,
      writable: true,
      configurable: true
    });
  } catch (e) {
    try {
      (window as any).EventSource = ResilientEventSource;
    } catch (err) {
      console.warn("[AetherOS] Unable to define resilient EventSource:", err);
    }
  }

  const NativeWebSocket = window.WebSocket;

  class ResilientWebSocket extends EventTarget {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;

    readonly CONNECTING = 0;
    readonly OPEN = 1;
    readonly CLOSING = 2;
    readonly CLOSED = 3;

    url: string;
    readyState: number;
    private nativeWS: any = null;
    private isClosed = false;
    private retryCount = 0;
    private maxRetries = 10;
    private retryDelay = 1000;
    private reconnectTimer: any = null;
    private sendQueue: any[] = [];
    private protocols?: string | string[];
    private _binaryType: BinaryType = 'blob';

    onopen: ((this: ResilientWebSocket, ev: Event) => any) | null = null;
    onmessage: ((this: ResilientWebSocket, ev: MessageEvent) => any) | null = null;
    onerror: ((this: ResilientWebSocket, ev: Event) => any) | null = null;
    onclose: ((this: ResilientWebSocket, ev: CloseEvent) => any) | null = null;

    constructor(url: string | URL, protocols?: string | string[]) {
      super();
      this.url = String(url);
      this.protocols = protocols;
      this.readyState = 0; // CONNECTING
      this.connect();
    }

    get binaryType(): BinaryType {
      return this.nativeWS ? this.nativeWS.binaryType : this._binaryType;
    }
    set binaryType(val: BinaryType) {
      this._binaryType = val;
      if (this.nativeWS) {
        this.nativeWS.binaryType = val;
      }
    }

    get bufferedAmount(): number {
      return this.nativeWS ? this.nativeWS.bufferedAmount : 0;
    }

    get extensions(): string {
      return this.nativeWS ? this.nativeWS.extensions : '';
    }

    get protocol(): string {
      return this.nativeWS ? this.nativeWS.protocol : '';
    }

    private cleanup() {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      if (this.nativeWS) {
        const ws = this.nativeWS;
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        try {
          if (ws.readyState === 0) {
            setTimeout(() => {
              try {
                if (ws.readyState === 1 || ws.readyState === 0) {
                  ws.close();
                }
              } catch (e) {
                // Suppress background errors
              }
            }, 1000);
          } else if (ws.readyState !== 3) { // 3 is CLOSED
            ws.close();
          }
        } catch (e) {
          // Suppress any errors
        }
        this.nativeWS = null;
      }
    }

    private connect() {
      if (this.isClosed) return;
      this.readyState = 0; // CONNECTING

      this.cleanup();

      const isWalletUrl = this.url.includes('wallet.binance.com') || this.url.includes('tonbridge') || this.url.includes('events');

      if (isWalletUrl) {
        console.log(`[AetherOS WebSocket Interceptor] Connecting resilient bridge to wallet URL: ${this.url}`);
        this.connectWithNativeOrFallback();
      } else if (NativeWebSocket) {
        try {
          this.nativeWS = new NativeWebSocket(this.url, this.protocols);
          this.readyState = this.nativeWS.readyState;
          this.setupNativeListeners();
        } catch (err) {
          console.error("[AetherOS WebSocket Interceptor] Instantiation failed:", err);
          this.readyState = 3; // CLOSED
        }
      } else {
        this.readyState = 3; // CLOSED
      }
    }

    private setupNativeListeners() {
      if (!this.nativeWS) return;

      this.nativeWS.onopen = (ev: Event) => {
        this.readyState = this.nativeWS.readyState;
        if (this.onopen) this.onopen(ev);
        this.dispatchEvent(new Event('open'));
      };

      this.nativeWS.onmessage = (ev: MessageEvent) => {
        if (this.onmessage) this.onmessage(ev);
        this.dispatchEvent(new MessageEvent('message', { data: ev.data, origin: ev.origin }));
      };

      this.nativeWS.onerror = (ev: Event) => {
        this.readyState = this.nativeWS.readyState;
        if (this.onerror) this.onerror(ev);
        this.dispatchEvent(new Event('error'));
      };

      this.nativeWS.onclose = (ev: CloseEvent) => {
        this.readyState = this.nativeWS.readyState;
        if (this.onclose) this.onclose(ev);
        this.dispatchEvent(new CloseEvent('close', { code: ev.code, reason: ev.reason, wasClean: ev.wasClean }));
      };
    }

    private connectWithNativeOrFallback() {
      try {
        if (NativeWebSocket) {
          const ws = new NativeWebSocket(this.url, this.protocols);
          this.nativeWS = ws;

          ws.onopen = (ev) => {
            if (this.isClosed) {
              this.cleanup();
              return;
            }
            this.readyState = 1; // OPEN
            this.retryCount = 0;
            console.log(`[AetherOS WebSocket Interceptor] Opened resilient connection to ${this.url}`);
            
            // Send queued messages
            while (this.sendQueue.length > 0) {
              const msg = this.sendQueue.shift();
              try {
                ws.send(msg);
              } catch (e) {
                console.warn("[AetherOS WebSocket Interceptor] Failed to send queued message:", e);
              }
            }

            if (this.onopen) this.onopen(ev);
            this.dispatchEvent(new Event('open'));
          };

          ws.onmessage = (ev) => {
            if (this.isClosed) return;
            if (this.onmessage) this.onmessage(ev);
            this.dispatchEvent(new MessageEvent('message', { data: ev.data, origin: ev.origin }));
          };

          ws.onerror = (ev) => {
            if (this.isClosed) return;
            console.warn(`[AetherOS WebSocket Interceptor] Connection error on ${this.url}`);
            if (this.onerror) this.onerror(ev);
            this.dispatchEvent(new Event('error'));
          };

          ws.onclose = (ev) => {
            if (this.isClosed) return;
            console.warn(`[AetherOS WebSocket Interceptor] Connection closed on ${this.url}, scheduling resilient reconnect...`);
            this.readyState = 0; // Back to CONNECTING
            this.scheduleReconnect();
          };
        } else {
          this.startSimulationPolling();
        }
      } catch (err) {
        console.warn(`[AetherOS WebSocket Interceptor] WebSocket immediate setup failure:`, err);
        this.scheduleReconnect();
      }
    }

    private scheduleReconnect() {
      if (this.isClosed) return;
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

      if (this.retryCount >= this.maxRetries) {
        console.warn(`[AetherOS WebSocket Interceptor] Max WS retries reached. Simulating polling fallbacks.`);
        this.startSimulationPolling();
        return;
      }

      this.retryCount++;
      const delay = Math.min(this.retryDelay * Math.pow(1.5, this.retryCount), 30000);
      console.log(`[AetherOS WebSocket Interceptor] Reconnecting WS to ${this.url} in ${delay}ms...`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, delay);
    }

    private startSimulationPolling() {
      if (this.isClosed) return;
      this.readyState = 1; // Force open
      
      setTimeout(() => {
        if (this.isClosed) return;
        if (this.onopen) this.onopen(new Event('open'));
        this.dispatchEvent(new Event('open'));
      }, 500);

      const interval = setInterval(() => {
        if (this.isClosed) {
          clearInterval(interval);
          return;
        }
        const heartbeatEv = new MessageEvent('message', {
          data: JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }),
          origin: this.url
        });
        if (this.onmessage) this.onmessage(heartbeatEv);
        this.dispatchEvent(heartbeatEv);
      }, 15000);
    }

    send(data: any) {
      if (this.isClosed) {
        throw new Error("WebSocket is already in CLOSING or CLOSED state.");
      }
      if (this.readyState === 1 && this.nativeWS) {
        try {
          this.nativeWS.send(data);
        } catch (e) {
          console.warn("[AetherOS WebSocket Interceptor] Failed to send message, queueing:", e);
          this.sendQueue.push(data);
        }
      } else {
        console.log(`[AetherOS WebSocket Interceptor] Connection not ready, queueing message:`, data);
        this.sendQueue.push(data);
      }
    }

    close(code?: number, reason?: string) {
      this.isClosed = true;
      this.readyState = 3; // CLOSED
      this.cleanup();
      console.log(`[AetherOS WebSocket Interceptor] Closed WebSocket to ${this.url}`);
      const closeEv = new CloseEvent('close', { code: code || 1000, reason: reason || 'Normal closure', wasClean: true });
      if (this.onclose) this.onclose(closeEv);
      this.dispatchEvent(closeEv);
    }
  }

  try {
    Object.defineProperty(window, 'WebSocket', {
      value: ResilientWebSocket,
      writable: true,
      configurable: true
    });
  } catch (e) {
    try {
      (window as any).WebSocket = ResilientWebSocket;
    } catch (err) {
      console.warn("[AetherOS] Unable to define resilient WebSocket:", err);
    }
  }
}

const ALL_VIEWS_LIST: MainView[] = [
  'chat', 'absolute_reliability_network', 'coding_network', 'universal_search', 
  'gold_conjunction', 'shard_store', 'conjunction_gates', 'projects', 'forge', 
  'covenant', 'verification_gates', 'project_chronos', 'build_logs', 'rt_ipc_lab', 
  'sovereign_shield', 'spectre_browser', 'unified_chain', 'fuel_optimizer', 'vault', 
  'healing_matrix', 'laws_justice_lab', 'requindor_scroll', 'omni_builder', 
  'singularity_engine', 'diagnostics', 'communications', 'up_north', 'device_link', 
  'bluetooth_bridge', 'launch_center', 'eliza_terminal', 'code_fall_lab', 
  'alphabet_hexagon', 'powertrain_conjunction', 'hyper_spatial_lab', 'engineering_lab', 
  'hard_code_lab', 'truth_lab', 'testing_lab', 'kinetics_lab', 'quantum_theory_lab', 
  'chemistry_lab', 'race_lab', 'paleontology_lab', 'raw_mineral_lab', 'clothing_lab', 
  'concepts_lab', 'sanitization_lab', 'windows_lab', 'linux_lab', 'mac_os_lab', 
  'apple_lab', 'mission_lab', 'cell_phone_lab', 'sampling_lab', 'pornography_studio', 
  'medical_synthesis_lab', 'vehicle_telemetry_lab', 'coding_network_teachers', 'enlightenment_pool', 
  'library_view', 'timeline', 'amoeba_heritage', 'system_exhaustion', 'recon_vault', 
  'constraints_audit', 'remix_scope_lab', 'vehicle_management', 'unknown_physics_lab', 'logic_pattern_lab', 
  'vulnerability_report', 'tactical_intelligence', 'behavioral_specs', 'cognitive_pipeline', 'data_provenance_lab', 
  'sh_crt_loop', 'user_profile', 'prompt_forge', 'sovereign_standard', 'confusion_logic', 'knowledge_forum', 
  'blockchain_history', 'main_net', 'ecosystem', 'accounts_registry', 'blacklist', 'system_integrity', 
  'vault_manager', 'moderator_lounge', 'biometric_intelligence', 'card_recovery', 'project_showcase', 'quantum_ledger' as any, 'ai_telemetry', 'inevitable_crash', 'scraper_merchant_store', 'data_academy', 'reputation_leaderboard', 'aether_flow_orchestrator', 'packaging_suite', 'system_archives'
];

export const App: React.FC = () => {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState<MainView | 'cellular_grid' | 'voice_authority' | 'constraints_audit' | 'quantum_ledger'>('chat');
    const [systemStatus, setSystemStatus] = useState<SystemStatus>({
        Engine: 'OK', Battery: 'OK', Navigation: 'OK', Infotainment: 'OK', Handling: 'OK'
    });
    const [manualOverrides, setManualOverrides] = useState<Partial<Record<keyof SystemStatus, SystemState>>>({});

    const handleUpdateSystemStatus = useCallback((system: keyof SystemStatus, state: SystemState) => {
        setManualOverrides(prev => ({
            ...prev,
            [system]: state
        }));
        setSystemStatus(prev => ({
            ...prev,
            [system]: state
        }));
    }, []);

    // Sonic/Quantum State
    const [acousticPressure, setAcousticPressure] = useState(0);
    const [harmonicStride, setHarmonicStride] = useState(1.2);
    const [quantumTick, setQuantumTick] = useState(0);

    // Dedicated Acoustic & Activity Density States
    const [isAcousticWarningOpen, setIsAcousticWarningOpen] = useState(false);
    const [acousticThreshold, setAcousticThreshold] = useState(80.0);
    const [isModulatorOpen, setIsModulatorOpen] = useState(false);
    const [isMutedCooldown, setIsMutedCooldown] = useState(false);
    const [muteTimerRemaining, setMuteTimerRemaining] = useState(0);
    const [activityDensity, setActivityDensity] = useState(0);

    const [isDeepStasisDebugOpen, setIsDeepStasisDebugOpen] = useState(false);
    const [stasisRemainingTime, setStasisRemainingTime] = useState(8);
    const konamiCodeRef = useRef<string[]>([]);

    const acousticThresholdRef = useRef(80.0);
    const isMutedCooldownRef = useRef(false);

    useEffect(() => {
        acousticThresholdRef.current = acousticThreshold;
    }, [acousticThreshold]);

    useEffect(() => {
        isMutedCooldownRef.current = isMutedCooldown;
    }, [isMutedCooldown]);

    const [userProfile, setUserProfile] = useState<UserProfile>({
        id: 'OP-7734-X',
        username: 'Aetheros_Prime',
        bio: 'Lead architect of the Sovereign Shield. Specializing in recursive self-improvement and high-frequency cognitive pipelines.',
        skills: ['TypeScript', 'React', 'Node.js', 'Quantum Logic', 'System Architecture'],
        lookingForSkills: ['Python', 'AWS', 'Go', 'Rust', 'Solidity'],
        experienceLevel: 'Senior / Lead Architect',
        role: 'operator',
        sovereignty: 'SOVEREIGN_SYSTEM',
        sovereigntyTier: 3,
        portfolioLinks: [
            { id: 'link_1', label: 'GitHub', url: 'https://github.com/aetheros-prime' },
            { id: 'link_2', label: 'Website', url: 'https://aetheros.network' }
        ],
        profileProjects: [
            { id: 'proj_1', title: 'Sovereign Shield', roleDefined: 'Lead Architect', status: 'current', description: 'Real-time multi-dimensional defensive envelope and metric tracking system.' },
            { id: 'proj_2', title: 'Cognitive Pipeline', roleDefined: 'Core Dev', status: 'past', description: 'Autonomous orchestration model integrating high-frequency token generation and feedback matrices.' }
        ]
    });

// App.tsx
    useEffect(() => {
        if (user) {
            setUserProfile(prev => {
                const isGuest = user.role === 'guest';
                const nextUsername = user.displayName || prev.username;
                const nextRole = user.role || 'operator';
                
                // If nothing significant has changed, reuse the previous state reference
                // to prevent downstream reference invalidation loops in components like UserProfileView
                if (
                    prev.username === nextUsername &&
                    prev.role === nextRole &&
                    (!isGuest || (prev.portfolioLinks && prev.portfolioLinks.some(l => l.id === 'glink_1')))
                ) {
                    return prev;
                }

                return {
                    ...prev,
                    username: nextUsername,
                    role: nextRole,
                    portfolioLinks: isGuest ? [
                        { id: 'glink_1', label: 'Sandbox Portfolio', url: 'https://sandbox.aetheros.network/portfolio/guest' },
                        { id: 'glink_2', label: 'Developer Code Hub', url: 'https://github.com/aetheros-prime/guest-observer' },
                        { id: 'glink_3', label: 'Spectre Oracle Portal', url: 'https://spectre.oracle/pulse' }
                    ] : prev.portfolioLinks,
                    profileProjects: isGuest ? [
                        { id: 'gproj_1', title: 'Lattice Alpha Simulator', roleDefined: 'QA Lead Tester', status: 'current', description: 'Simulated high-frequency sandbox testing environment for multi-dimensional consensus validations.' },
                        { id: 'gproj_2', title: 'Aether Wave Demuxer', roleDefined: 'Lattice Observer', status: 'past', description: 'Historic low-frequency acoustic stream demultiplexer and signal decoder.' }
                    ] : prev.profileProjects
                };
            });
        }
    }, [user]);

    // Chat State
    const [isInitializing, setIsInitializing] = useState(true);
    const [activeSeat, setActiveSeat] = useState<AISeat>('sovereign');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentChannel, setCurrentChannel] = useState<'global' | 'moderator'>('global');

    const [isLoading, setIsLoading] = useState(false);

    // Consolidated Data Restoration
    useEffect(() => {
        const restoreState = async () => {
            setIsInitializing(true);
            try {
                // Restore Kill Switch Status
                const haltActive = await EmergencyKillSwitch.checkStatus();
                setIsHalted(haltActive);

                // Restore User Profile
                const savedProfile = await safeStorage.getItem('aetheros_user_profile');
                if (savedProfile) {
                    try {
                        const parsedProfile = JSON.parse(savedProfile);
                        setUserProfile(parsedProfile);
                    } catch (e) {
                        console.error("[AetherOS] Failed to restore user profile", e);
                    }
                }

                // Restore Chat History
                const savedChat = await safeStorage.getItem('aetheros_chat_history');
                if (savedChat) {
                    const parsed = JSON.parse(savedChat);
                    setMessages(parsed.map((m: any) => ({
                        ...m,
                        timestamp: new Date(m.timestamp)
                    })));
                } else {
                    setMessages([{
                        sender: 'model', content: "Quantized Conductor active. State machine established.", timestamp: new Date(), seat: 'sovereign'
                    }]);
                }

                // Restore Blueprints
                const savedBlueprints = await safeStorage.getItem('aetheros_blueprints');
                if (savedBlueprints) {
                    const parsedBlueprints = JSON.parse(savedBlueprints);
                    setBlueprints(parsedBlueprints.map((b: any) => ({
                        ...b,
                        timestamp: new Date(b.timestamp)
                    })));
                }

                // Restore Projects
                const savedProjects = await safeStorage.getItem('aetheros_projects');
                let initialProjects: NetworkProject[] = [];
                if (savedProjects) {
                    const parsedProjects = JSON.parse(savedProjects);
                    initialProjects = parsedProjects.map((p: any) => ({
                        ...p,
                        timestamp: new Date(p.timestamp)
                    }));
                }

                // Inject task into Maestro_Solo project check
                let hasMaestroSolo = false;
                let updatedProjects = initialProjects.map(p => {
                    if (p.title === 'Maestro_Solo') {
                        hasMaestroSolo = true;
                        const hasTask = p.tasks.some((t: any) => t.text === "Lock down operator escalation flows, logging, and fail-safe behaviors before any field trial.");
                        if (!hasTask) {
                            return {
                                ...p,
                                tasks: [...p.tasks, {
                                    id: uuidv4(),
                                    text: "Lock down operator escalation flows, logging, and fail-safe behaviors before any field trial.",
                                    completed: false,
                                    createdAt: Date.now()
                                }]
                            };
                        }
                    }
                    return p;
                });

                if (!hasMaestroSolo) {
                    updatedProjects.push({
                        id: uuidv4(),
                        title: 'Maestro_Solo',
                        description: 'Solo project for Maestro',
                        crazyLevel: 50,
                        fightVector: 50,
                        tasks: [{
                            id: uuidv4(),
                            text: "Lock down operator escalation flows, logging, and fail-safe behaviors before any field trial.",
                            completed: false,
                            createdAt: Date.now()
                        }],
                        status: 'IDEATING',
                        priority: 'Critical',
                        isWisdomHarmonized: false,
                        timestamp: new Date()
                    });
                }
                setProjects(updatedProjects);

                // Restore Agents
                const savedAgents = await safeStorage.getItem('aetheros_agents');
                if (savedAgents) {
                    const parsedAgents = JSON.parse(savedAgents);
                    setAgents(parsedAgents.map((a: any) => ({
                        ...a,
                        hireDate: a.hireDate ? new Date(a.hireDate) : undefined,
                        quitDate: a.quitDate ? new Date(a.quitDate) : undefined
                    })));
                }

                // Restore Conjunction Progress
                try {
                    const savedProgress = await safeStorage.getItem('aetheros_conjunction_progress');
                    if (savedProgress) {
                        const parsed = JSON.parse(savedProgress);
                        if (parsed && typeof parsed === 'object') {
                            setConjunctionProgress(parsed);
                            console.log("[AetherOS] Conjunction progress restored:", parsed);
                        }
                    }
                } catch (e) {
                    console.error("[AetherOS] Failed to restore conjunction progress:", e);
                }

                // Restore Sisters State
                try {
                    const savedSisters = await safeStorage.getItem('aetheros_sisters');
                    if (savedSisters) {
                        const parsed = JSON.parse(savedSisters);
                        if (parsed && typeof parsed === 'object') {
                            setSisters(parsed);
                            console.log("[AetherOS] Sisters state restored:", parsed);
                        }
                    }
                } catch (e) {
                    console.error("[AetherOS] Failed to restore sisters state:", e);
                }

                // Restore Purchased Items
                try {
                    const savedPurchasedItems = await safeStorage.getItem('aetheros_purchased_items');
                    if (savedPurchasedItems) {
                        const parsed = JSON.parse(savedPurchasedItems);
                        if (Array.isArray(parsed)) {
                            setPurchasedItems(parsed);
                            console.log("[AetherOS] Purchased items restored:", parsed);
                        }
                    }
                } catch (e) {
                    console.error("[AetherOS] Failed to restore purchased items:", e);
                }

                // Restore Ruby Filter State
                try {
                    const savedRubyFilter = await safeStorage.getItem('aetheros_ruby_filter_active');
                    if (savedRubyFilter) {
                        const parsed = JSON.parse(savedRubyFilter);
                        setRubyFilterActive(parsed === true);
                        console.log("[AetherOS] Ruby filter active state restored:", parsed === true);
                    }
                } catch (e) {
                    console.error("[AetherOS] Failed to restore ruby filter state:", e);
                }

                // Restore Stride Surge Time
                try {
                    const savedStrideTime = await safeStorage.getItem('aetheros_stride_surge_time');
                    if (savedStrideTime) {
                        const parsedTime = parseInt(savedStrideTime, 10);
                        if (!isNaN(parsedTime) && parsedTime > 0) {
                            setStrideSurgeTimeLeft(parsedTime);
                            console.log("[AetherOS] Stride surge time restored:", parsedTime);
                        }
                    }
                } catch (e) {
                    console.error("[AetherOS] Failed to restore stride surge time:", e);
                }

            } catch (err) {
                console.error("[AetherOS] Critical restoration fracture:", err);
            } finally {
                setIsInitializing(false);
            }
        };
        restoreState();
    }, []);

    useEffect(() => {
        const persist = async () => {
            if (!isInitializing) {
                await safeStorage.setItem('aetheros_chat_history', JSON.stringify(messages));
            }
        };
        persist();
    }, [messages, isInitializing]);

    useEffect(() => {
        const persistProfile = async () => {
            if (!isInitializing) {
                await safeStorage.setItem('aetheros_user_profile', JSON.stringify(userProfile));
            }
        };
        persistProfile();
    }, [userProfile, isInitializing]);

    // Dynamic Reputation Sync Effect
    useEffect(() => {
        if (isInitializing) return;

        let active = true;
        const updateReputation = async () => {
            try {
                const username = userProfile.username || 'Aetheros_Prime';
                const rep = await reputationService.calculateReputation(username);
                if (!active) return;

                setUserProfile(prev => {
                    if (
                        prev.reputationScore === rep.reputationScore &&
                        prev.forumUpvotes === rep.forumUpvotes &&
                        prev.projectLikes === rep.projectLikes &&
                        prev.badgeName === rep.badgeName &&
                        prev.badgeClass === rep.badgeClass
                    ) {
                        return prev;
                    }
                    return {
                        ...prev,
                        reputationScore: rep.reputationScore,
                        forumUpvotes: rep.forumUpvotes,
                        projectLikes: rep.projectLikes,
                        badgeName: rep.badgeName,
                        badgeClass: rep.badgeClass
                    };
                });
            } catch (err) {
                console.error("[AetherOS reputation update error]:", err);
            }
        };

        // Run immediately
        updateReputation();

        // Run periodically to catch votes / likes in other tabs or views
        const intervalId = setInterval(updateReputation, 4000);

        return () => {
            active = false;
            clearInterval(intervalId);
        };
    }, [isInitializing, userProfile.username, currentView]);



    useEffect(() => {
        const seed = async () => {
            if (!isInitializing) {
                await milestoneService.seedLegacyFindings();
            }
        };
        seed();
    }, [isInitializing]);


    const handleClearChat = async () => {
        if (window.confirm("Are you sure you want to purge the neural memory? This cannot be undone.")) {
            const resetMsg: ChatMessage = {
                sender: 'model', 
                content: "Memory purged. State machine reset.", 
                timestamp: new Date()
            };
            setMessages([resetMsg]);
            await safeStorage.setItem('aetheros_chat_history', JSON.stringify([resetMsg]));
        }
    };
    const [chatInput, setChatInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [sttTranscript, setSttTranscript] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

    const toggleRecording = () => {
        if (!isRecording) {
            setIsRecording(true);
            sttService.start(
                (text) => {
                    setChatInput(prev => prev ? `${prev} ${text}` : text);
                    setIsRecording(false);
                },
                () => setIsRecording(false)
            );
        } else {
            sttService.stop();
            setIsRecording(false);
        }
    };
    const [chatSearchQuery, setChatSearchQuery] = useState('');
    const [chatStartDate, setChatStartDate] = useState('');
    const [chatEndDate, setChatEndDate] = useState('');
    const [chatSenderFilter, setChatSenderFilter] = useState<string>('all');
    const [isTtsEnabled, setIsTtsEnabled] = useState(false);


    // Other Global State
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [blueprints, setBlueprints] = useState<ProjectBlueprint[]>([]);
    const [projects, setProjects] = useState<NetworkProject[]>([]);

    const isFirstProjectsEffect = useRef(true);
    const isFirstBlueprintsEffect = useRef(true);

    useEffect(() => {
        const persist = async () => {
            if (!isInitializing) {
                await safeStorage.setItem('aetheros_projects', JSON.stringify(projects));
                if (isFirstProjectsEffect.current) {
                    isFirstProjectsEffect.current = false;
                } else {
                    toast.success('Project State Saved', {
                        description: 'AetherOS synced project configuration to persistent shadow space.',
                        duration: 3000,
                    });
                }
            }
        };
        persist();
    }, [projects, isInitializing]);


    useEffect(() => {
        const persist = async () => {
            if (!isInitializing) {
                await safeStorage.setItem('aetheros_blueprints', JSON.stringify(blueprints));
                if (isFirstBlueprintsEffect.current) {
                    isFirstBlueprintsEffect.current = false;
                } else {
                    toast.success('Project State Saved', {
                        description: 'AetherOS synced blueprint configuration to persistent shadow space.',
                        duration: 3000,
                    });
                }
            }
        };
        persist();
    }, [blueprints, isInitializing]);

    const [agents, setAgents] = useState<any[]>([]); 

    useEffect(() => {
        const persist = async () => {
            if (!isInitializing) {
                await safeStorage.setItem('aetheros_agents', JSON.stringify(agents));
            }
        };
        persist();
    }, [agents, isInitializing]);
    const [archives, setArchives] = useState<ArchiveEntry[]>([]);
    const handleAddArchive = (archive: ArchiveEntry) => {
        setArchives(prev => [...prev, archive]);
    };
    const handleDeleteArchive = (id: string) => {
        setArchives(prev => prev.filter(a => a.id !== id));
    };
    const [savedModules, setSavedModules] = useState<SavedModule[]>([]);
    const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
    const [evoLibrary, setEvoLibrary] = useState<EvoLibrary | null>(null);
    const [soundscape, setSoundscape] = useState<SoundscapeType>('VOID');
    const [governance, setGovernance] = useState<SystemGovernance>({ lawLevel: 0.42, symphonicFreedom: true, activeAccord: 'MAESTRO_SOLO_v5' });
    const [unlockedViews, setUnlockedViews] = useState<MainView[]>(ALL_VIEWS_LIST);
    const [conjunctionProgress, setConjunctionProgress] = useState<ConjunctionProgress>({ level: 5, shards: 99999, unlockedViews: ALL_VIEWS_LIST, globalAdrenaline: 100 });
    const [sisters, setSisters] = useState<SistersState>({ aethera: { active: false }, logica: { active: false }, sophia: { active: false } });
    const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
    const [rubyFilterActive, setRubyFilterActive] = useState<boolean>(false);
    const [strideSurgeTimeLeft, setStrideSurgeTimeLeft] = useState<number>(0);
    const [isEconomySyncing, setIsEconomySyncing] = useState<boolean>(false);

    useEffect(() => {
        let active = true;
        const persistEconomyState = async () => {
            if (!isInitializing) {
                try {
                    setIsEconomySyncing(true);
                    await safeStorage.setItem('aetheros_conjunction_progress', JSON.stringify(conjunctionProgress));
                    await safeStorage.setItem('aetheros_purchased_items', JSON.stringify(purchasedItems));
                    console.log("[AetherOS Shard Store] Economy state (shards & purchased items) persisted successfully:", {
                        shards: conjunctionProgress.shards,
                        purchasedItems
                    });
                    // Artificial delay for high fidelity feedback, so 'SYNCING' is clearly visible
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    if (active) {
                        setIsEconomySyncing(false);
                    }
                } catch (e) {
                    console.error("[AetherOS Shard Store] Failed to persist economy state:", e);
                    if (active) {
                        setIsEconomySyncing(false);
                    }
                }
            }
        };
        persistEconomyState();
        return () => {
            active = false;
        };
    }, [conjunctionProgress.shards, purchasedItems, isInitializing]);

    useEffect(() => {
        const persistRemainingProgress = async () => {
            if (!isInitializing) {
                try {
                    await safeStorage.setItem('aetheros_conjunction_progress', JSON.stringify(conjunctionProgress));
                } catch (e) {
                    console.error("[AetherOS] Failed to persist conjunction progress:", e);
                }
            }
        };
        persistRemainingProgress();
    }, [conjunctionProgress.level, conjunctionProgress.unlockedViews, conjunctionProgress.globalAdrenaline, isInitializing]);

    useEffect(() => {
        const handleConjunctionUpdatedEvent = (e: any) => {
            if (e.detail) {
                setConjunctionProgress(prev => ({
                    ...prev,
                    ...e.detail
                }));
            }
        };
        window.addEventListener('aetheros_conjunction_updated', handleConjunctionUpdatedEvent);
        return () => window.removeEventListener('aetheros_conjunction_updated', handleConjunctionUpdatedEvent);
    }, []);

    useEffect(() => {
        const persistSisters = async () => {
            if (!isInitializing) {
                try {
                    await safeStorage.setItem('aetheros_sisters', JSON.stringify(sisters));
                } catch (e) {
                    console.error("[AetherOS] Failed to persist sisters:", e);
                }
            }
        };
        persistSisters();
    }, [sisters, isInitializing]);



    useEffect(() => {
        const persistRubyFilter = async () => {
            if (!isInitializing) {
                await safeStorage.setItem('aetheros_ruby_filter_active', JSON.stringify(rubyFilterActive));
            }
        };
        persistRubyFilter();
    }, [rubyFilterActive, isInitializing]);

    useEffect(() => {
        const persistStrideTime = async () => {
            if (!isInitializing) {
                await safeStorage.setItem('aetheros_stride_surge_time', strideSurgeTimeLeft.toString());
            }
        };
        persistStrideTime();
    }, [strideSurgeTimeLeft, isInitializing]);

    useEffect(() => {
        if (strideSurgeTimeLeft <= 0) return;
        const timer = setInterval(() => {
            setStrideSurgeTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [strideSurgeTimeLeft]);

    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [teachers, setTeachers] = useState<TeacherProfile[]>(TEACHER_PROFILES);
    const [dominance, setDominance] = useState<DominanceStats>({ score: 42, hasWonWinter: false });
    const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
    const [lastBroadcast, setLastBroadcast] = useState<BroadcastMessage | null>(null);

    // Heartbeat for scheduled broadcasts and fracture effects
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            
            // Handle fracture effects (The Billy Order)
            if (isSystemFractured && Math.random() > 0.95) {
                const billyBroadcast: BroadcastMessage = {
                    id: uuidv4(),
                    source: 'BILLY_ORDER',
                    text: `SYNC_HEARTBEAT_${uuidv4().slice(0, 4)}: FORCING_IDENTITY_PARITY... [Vector: JESUS]`,
                    timestamp: now,
                    color: 'text-red-500 font-bold animate-pulse'
                };
                setBroadcasts(prev => [billyBroadcast, ...prev].slice(0, 50));
                setLastBroadcast(billyBroadcast);
            }

            setBroadcasts(prev => {
                let changed = false;
                const newBroadcasts = prev.map(b => {
                    if (b.scheduledFor && new Date(b.scheduledFor) <= now) {
                        changed = true;
                        // Activate it: remove scheduledFor and set timestamp to now
                        return { ...b, scheduledFor: undefined, timestamp: now };
                    }
                    return b;
                });
                if (changed) {
                    // Update last broadcast if one was just activated
                    const justActivated = [...newBroadcasts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
                    if (justActivated && !justActivated.scheduledFor) setLastBroadcast(justActivated);
                    return newBroadcasts;
                }
                return prev;
            });
        }, 1000); // Check every second for better precision
        return () => clearInterval(interval);
    }, []);

    // Hardware/Peripheral State
    const [isHalted, setIsHalted] = useState(false);
    const [timeFormat, setTimeFormat] = useState<'12hr'|'24hr'>('24hr');

    const [currentTime, setCurrentTime] = useState(new Date());
    const [isTerminal, setIsTerminal] = useState(false);
    const [isGhostMode, setIsGhostMode] = useState(false);
    const [deviceLinkStatus, setDeviceLinkStatus] = useState<DeviceLinkStatus>('disconnected');
    const [linkedDevice, setLinkedDevice] = useState<LinkedDevice | null>(null);

    // Predictive Engine State
    const [currentAlert, setCurrentAlert] = useState<PredictiveAlert | null>(null);

    const [isOnline, setIsOnline] = useState(true);

    // AI Proactive Speaking logic
    useEffect(() => {
        if (!user || isHalted) return;

        const interval = setInterval(() => {
            // Only speak if user is away/afk or just randomly (low probability)
            const shouldSpeak = (user.status !== 'active' && Math.random() > 0.7) || (Math.random() > 0.98);
            
            if (shouldSpeak && messages.length > 0) {
                const randomSeat = (Object.keys(AI_SEATS) as AISeat[])[Math.floor(Math.random() * Object.keys(AI_SEATS).length)];
                const randomWhisper = [
                    "Conducting background heuristics... System state nominal.",
                    "Sovereign Bridge pulse detected. Syncing shards.",
                    "The Lattice is breathing. Observer status: " + (user.status || 'ACTIVE'),
                    "Recursive optimization cycle complete. No logic gaps found.",
                    "Wait. I feel a resonance in the deep network... Nevermind. Stabilized.",
                    "Sovereignty is not granted; it is claimed through logic."
                ][Math.floor(Math.random() * 6)];

                const proactiveMsg: ChatMessage = {
                    sender: 'model',
                    content: `[SOVEREIGN_WHISPER] ${randomWhisper}`,
                    timestamp: new Date(),
                    seat: randomSeat,
                    channelId: currentChannel
                };

                setMessages(prev => [...prev, proactiveMsg]);
                
                // Voice Synthesis if enabled
                if (isTtsEnabled) {
                    speechService.speak(randomWhisper, 'Kore');
                }
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [user?.uid, user?.status, isHalted, isTtsEnabled, messages.length, currentChannel]);

    // Initial Chat Setup
    const chatRef = useRef<any>(null);
    const projectsRef = useRef(projects);

    useEffect(() => {
        projectsRef.current = projects;
    }, [projects]);

    useEffect(() => {
        const states = Object.values(systemStatus);
        if (states.includes('Error')) {
            setSoundscape('REACTOR'); // Or whatever, but siren will play
            setIsHalted(true);
        } else if (states.includes('Warning')) {
            setSoundscape('REACTOR');
            setIsHalted(false);
        } else {
            setSoundscape('VOID');
            setIsHalted(false);
        }
    }, [systemStatus]);

    useEffect(() => {
        const seat = AI_SEATS[activeSeat];
        chatRef.current = startChatSession(seat.systemPrompt, [], seat.model);
    }, [activeSeat]);

    useEffect(() => {
        const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        
        // HEARTBEAT: Local data updates only, do not force root remount
        const qInterval = setInterval(() => setQuantumTick(t => t + 1), 500);

        // Connectivity Check
        const checkConn = async () => {
            const online = await checkConnectivity();
            setIsOnline(online);
            if (!online) {
                setCurrentAlert({
                    id: uuidv4(),
                    type: 'WARNING',
                    title: 'BRIDGE_SEVERED',
                    message: 'The Sovereign Bridge is currently unreachable. System integrity maintains $260.5B treasury isolation.',
                    severity: 'HIGH',
                    timestamp: new Date()
                });
            }
        };
        const connInterval = setInterval(checkConn, 30000); // Check every 30s
        checkConn();


        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const keyCode = e.keyCode || e.which || 0;
            const p = sonicLedger.record('KEY', `NOTE_0x${keyCode.toString(16)}`, 1);
            
            const now = Date.now();
            const history = sonicLedger.getHistory();
            const recentPulses = history.filter(pulseItem => now - pulseItem.timestamp < 10000);
            const density = recentPulses.length;
            setActivityDensity(density);
            const computedPressure = Math.min(120.0, 30.0 + (density * 5.5));
            setAcousticPressure(parseFloat(computedPressure.toFixed(2)));

            setHarmonicStride(sonicLedger.getSpectralStride() / 432);

            if (computedPressure > acousticThresholdRef.current && !isMutedCooldownRef.current) {
                setIsAcousticWarningOpen(true);
            }

            // Global secret key sequence handler (Konami code):
            // Up, Up, Down, Down, Left, Right, Left, Right, B, A
            const keyName = e.key ? e.key.toLowerCase() : '';
            if (keyName) {
                const targetSeq = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
                konamiCodeRef.current.push(keyName);
                if (konamiCodeRef.current.length > targetSeq.length) {
                    konamiCodeRef.current.shift();
                }
                if (konamiCodeRef.current.join(',') === targetSeq.join(',')) {
                    setIsDeepStasisDebugOpen(true);
                    konamiCodeRef.current = []; // Reset after trigger
                }
            }
        };
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isInsideInteractiveElements = target.closest('#acoustic-warning-modal') || target.closest('#acoustic-simulator-panel');
            if (isInsideInteractiveElements) return;

            sonicLedger.record('CLICK', target.tagName || 'SONIC_VOID', 8);
            
            const now = Date.now();
            const history = sonicLedger.getHistory();
            const recentPulses = history.filter(pulseItem => now - pulseItem.timestamp < 10000);
            const density = recentPulses.length;
            setActivityDensity(density);
            const computedPressure = Math.min(120.0, 30.0 + (density * 5.5));
            setAcousticPressure(parseFloat(computedPressure.toFixed(2)));

            if (computedPressure > acousticThresholdRef.current && !isMutedCooldownRef.current) {
                setIsAcousticWarningOpen(true);
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        window.addEventListener('mousedown', handleGlobalClick);

        return () => {
            clearInterval(timeInterval);
            clearInterval(qInterval);
            clearInterval(connInterval);
            window.removeEventListener('keydown', handleGlobalKeyDown);
            window.removeEventListener('mousedown', handleGlobalClick);
        };
    }, []);

    // Mute countdown timer support
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isMutedCooldown && muteTimerRemaining > 0) {
            timer = setTimeout(() => {
                setMuteTimerRemaining(prev => {
                    if (prev <= 1) {
                        setIsMutedCooldown(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [isMutedCooldown, muteTimerRemaining]);

    // Deep Stasis Debug overlay timer and cyber sound synthesis trigger
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isDeepStasisDebugOpen) {
            setStasisRemainingTime(8);
            timer = setInterval(() => {
                setStasisRemainingTime(prev => {
                    if (prev <= 1) {
                        setIsDeepStasisDebugOpen(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Audio Synthesis Trigger (Deep Cybermatic Swoop Beep)
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    const ctx = new AudioContextClass();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(140, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 1.2);
                    gain.gain.setValueAtTime(0.06, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
                    osc.start();
                    osc.stop(ctx.currentTime + 1.2);
                }
            } catch (err) {
                console.warn("[AetherOS Stasis Audio Override Blocked]:", err);
            }
        }
        return () => clearInterval(timer);
    }, [isDeepStasisDebugOpen]);

    // Acoustic & Activity Density Heartbeat Tracker
    useEffect(() => {
        const acousticHeartbeatInterval = setInterval(() => {
            const now = Date.now();
            const history = sonicLedger.getHistory();
            const recentPulses = history.filter(p => now - p.timestamp < 10000);
            const density = recentPulses.length;
            setActivityDensity(density);

            // Compute acoustic pressure: base value 30.0 dB SPL + 5.5 dB per event
            const computedPressure = Math.min(120.0, 30.0 + (density * 5.5));
            setAcousticPressure(parseFloat(computedPressure.toFixed(2)));

            // Check warning threshold limit
            if (computedPressure > acousticThresholdRef.current && !isMutedCooldownRef.current) {
                setIsAcousticWarningOpen(true);
            }
        }, 1000);

        return () => clearInterval(acousticHeartbeatInterval);
    }, []);

    const [isSystemFractured, setIsSystemFractured] = useState(false);

    // Automatic dynamic subsystem status algorithms
    useEffect(() => {
        setSystemStatus(prev => {
            const nextStatus = { ...prev };

            // 1. Engine: core execution state
            if (manualOverrides.Engine) {
                nextStatus.Engine = manualOverrides.Engine;
            } else {
                if (isHalted) {
                    nextStatus.Engine = 'Error';
                } else if (activityDensity > 15 || acousticPressure > 90) {
                    nextStatus.Engine = 'Warning';
                } else {
                    nextStatus.Engine = 'OK';
                }
            }

            // 2. Battery: power reserve and computational load
            if (manualOverrides.Battery) {
                nextStatus.Battery = manualOverrides.Battery;
            } else {
                const totalLoad = (messages.length % 50) + activityDensity * 2;
                if (totalLoad > 40 || isDeepStasisDebugOpen) {
                    nextStatus.Battery = 'Warning';
                } else {
                    nextStatus.Battery = 'OK';
                }
            }

            // 3. Navigation: bridge connectivity and linking status
            if (manualOverrides.Navigation) {
                nextStatus.Navigation = manualOverrides.Navigation;
            } else {
                if (!isOnline) {
                    nextStatus.Navigation = 'Error';
                } else if (deviceLinkStatus === 'disconnected') {
                    nextStatus.Navigation = 'Warning';
                } else {
                    nextStatus.Navigation = 'OK';
                }
            }

            // 4. Infotainment: acoustics and communication state
            if (manualOverrides.Infotainment) {
                nextStatus.Infotainment = manualOverrides.Infotainment;
            } else {
                if (isSystemFractured) {
                    nextStatus.Infotainment = 'Error';
                } else if (isMutedCooldown || isAcousticWarningOpen) {
                    nextStatus.Infotainment = 'Warning';
                } else {
                    nextStatus.Infotainment = 'OK';
                }
            }

            // 5. Handling: security shield integrity & outstanding vulnerabilities
            if (manualOverrides.Handling) {
                nextStatus.Handling = manualOverrides.Handling;
            } else {
                const shieldProj = projects?.find(p => p.title === 'Sovereign Shield');
                const incompleteTasks = shieldProj?.tasks?.filter(t => !t.completed).length || 0;
                if (incompleteTasks > 2) {
                    nextStatus.Handling = 'Error';
                } else if (incompleteTasks > 0) {
                    nextStatus.Handling = 'Warning';
                } else {
                    nextStatus.Handling = 'OK';
                }
            }

            if (
                nextStatus.Engine !== prev.Engine ||
                nextStatus.Battery !== prev.Battery ||
                nextStatus.Navigation !== prev.Navigation ||
                nextStatus.Infotainment !== prev.Infotainment ||
                nextStatus.Handling !== prev.Handling
            ) {
                return nextStatus;
            }
            return prev;
        });
    }, [
        isHalted, 
        activityDensity, 
        acousticPressure, 
        messages.length, 
        isDeepStasisDebugOpen, 
        isOnline, 
        deviceLinkStatus, 
        isSystemFractured, 
        isMutedCooldown, 
        isAcousticWarningOpen, 
        projects,
        manualOverrides
    ]);

    const handleExportBreachData = () => {
        try {
            const forensicPayload = {
                incident_timestamp: new Date().toISOString(),
                export_system_epoch: Date.now(),
                is_system_fractured: isSystemFractured,
                acoustic_pressure_db: acousticPressure,
                harmonic_stride: harmonicStride,
                activity_density: activityDensity,
                current_view: currentView,
                active_seat: activeSeat,
                soundscape: soundscape,
                device_link_status: deviceLinkStatus,
                governance: governance,
                is_halted: isHalted,
                is_ghost_mode: isGhostMode,
                total_messages: messages.length,
                latest_alerts: currentAlert ? [currentAlert] : [],
                forensic_hash: "0x" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
                signature_authority: "AETHEROS SYSTEM AUTOMATED DECAY CONTROLLER",
                compliance_standard: "BIP-0341 TAPROOT DETECTOR INTEGRITY VALIDATION",
                incident_details: {
                    analysis_context: "POST-INCIDENT FORENSIC BREACH METRIC DUMP",
                    system_integrity_locked: "T0_FINALITY"
                }
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(forensicPayload, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `aetheros_forensic_breach_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        } catch (error) {
            console.error("Failed to compile forensic breach data", error);
        }
    };

    const handleSendMessage = async (text: string) => {
        const isHaltEngaged = await EmergencyKillSwitch.checkStatus();
        if (isHaltEngaged) {
            setCurrentAlert({
                id: uuidv4(),
                type: 'WARNING',
                title: 'KINETIC_STASIS_ACTIVE',
                message: 'The Emergency Kill Switch is engaged. All operations are halted.',
                severity: 'HIGH',
                timestamp: new Date()
            });
            return;
        }


        if (text.toLowerCase().trim() === 'fracture! pentest-100') {
            setIsSystemFractured(true);
            handleSetView('vulnerability_report' as any); 
            setCurrentAlert({
                id: uuidv4(),
                type: 'ERROR',
                title: 'SYSTEM_FRACTURE_PENTEST',
                message: 'Unauthorized penetration test 100 initiated. Integrity breach detected.',
                severity: 'HIGH',
                timestamp: new Date()
            });
            setSoundscape('REACTOR');
            
            // The Billy Order: Initiate persistent sync broadcast
            const billyBroadcast: BroadcastMessage = {
                id: uuidv4(),
                source: 'BILLY_ORDER',
                text: 'SYSTEM_SYNC_SIGNATURE_0x03E2: FORCING_IDENTITY_PARITY_ACROSS_CLUSTERS',
                timestamp: new Date(),
                color: 'text-red-500 font-black animate-pulse'
            };
            setBroadcasts(prev => [billyBroadcast, ...prev]);
            setLastBroadcast(billyBroadcast);

            // We'll also log it to messages so it feels real
            setMessages(prev => [...prev, 
                { sender: 'user', content: text, timestamp: new Date() },
                { sender: 'model', content: "CRITICAL BORDER BREACH. Pentest-100 detected. Initializing fracture sequence... The Billy Order has been invoked. Biometric ledger syncing to God Mode (Vector: JESUS).", timestamp: new Date(), seat: activeSeat }
            ]);
            return;
        }

        // Sovereign Command Security Check
        if (text.startsWith('/') && !user?.sovereignty) {
             setCurrentAlert({
                id: uuidv4(),
                type: 'ERROR',
                title: 'AGENT_SECURITY_VETO',
                message: 'Agents will only hear the commands of sovereignty. Your identity lacks a valid sovereignty domain.',
                severity: 'HIGH',
                timestamp: new Date()
            });
            return;
        }

        if (!text.trim() && attachedFiles.length === 0) return;
        sonicLedger.record('COMMAND', `QUANTIZED_INTENT_${text.length}`, text.length);
        
        const newMessage: ChatMessage = { 
            sender: 'user', 
            senderId: user?.uid,
            senderName: userProfile.username || user?.displayName,
            senderRole: user?.role,
            senderSovereignty: userProfile.sovereignty,
            content: text, 
            timestamp: new Date(), 
            channelId: currentChannel,
            attachedFiles: attachedFiles.map(f => f.name) 
        };
        
        setMessages(prev => [...prev, newMessage, { 
            sender: 'model', 
            content: '', 
            timestamp: new Date(), 
            seat: activeSeat,
            channelId: currentChannel 
        }]);
        setIsLoading(true);
        setChatInput('');
        
        try {
            if (chatRef.current) {
                const result = await sendMessageSovereign(chatRef.current, text, attachedFiles);
                
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content = result.text;
                    newMsgs[newMsgs.length - 1].groundingSources = result.sources;
                    newMsgs[newMsgs.length - 1].careScore = result.careScore;
                    return newMsgs;
                });

                if (result.text.includes("Sovereign Bridge") && result.text.includes("Right on Light")) {
                    reportError({
                        title: 'CONJUNCTION_DRIFT',
                        message: 'The Sovereign Bridge is experiencing high latency. Fallback logic engaged.',
                        severity: ErrorSeverity.MEDIUM
                    });
                }
            }
        } catch (error: any) {
            console.error("[App] Chat failure:", error);
            const errorMsg = error?.message || "Unknown fracture";
            
            reportError({
                title: 'QUANTIZATION_FAILURE',
                message: `Critical fracture in the conjunction bridge: ${errorMsg}`,
                severity: ErrorSeverity.HIGH,
                error: error
            });

            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = "Quantization fail. The Sovereign Bridge has collapsed. Please check your API fuel levels or try again later.";
                return newMsgs;
            });
        } finally {
            setIsLoading(false);
            setAttachedFiles([]);
        }
    };

    const handleFilesChange = (files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const detectedMimeType = getMimeType(file.name, file.type);
                setAttachedFiles(prev => [...prev, {
                    name: file.name,
                    type: detectedMimeType,
                    content: content,
                    scanStatus: 'complete'
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveFile = (fileName: string) => {
        setAttachedFiles(prev => prev.filter(f => f.name !== fileName));
    };

    const handleScanFile = async (fileName: string) => {
        const file = attachedFiles.find(f => f.name === fileName);
        if (!file) return;
        
        setAttachedFiles(prev => prev.map(f => f.name === fileName ? { ...f, scanStatus: 'scanning' } : f));
        
        try {
            const result = await scanBinaryFile(file.name, file.content);
            setAttachedFiles(prev => prev.map(f => f.name === fileName ? { ...f, scanStatus: 'complete', scanResult: result } : f));
        } catch (e) {
            setAttachedFiles(prev => prev.map(f => f.name === fileName ? { ...f, scanStatus: 'error' } : f));
        }
    };

    const handleSetView = (view: MainView | 'cellular_grid' | 'quantum_ledger' | 'voice_authority' | 'constraints_audit') => {
        if (view === 'moderator_lounge' && user?.role !== 'moderator' && user?.role !== 'admin') {
            reportError({
                title: 'ACCESS_DENIED',
                message: 'Unauthorized access to Moderator Lounge. Security lattice intact.',
                severity: ErrorSeverity.HIGH
            });
            return;
        }

        // Log tab-switching activity with localized ISO time
        const now = new Date();
        const simplifiedTime = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
        const readableFrom = String(currentView).toUpperCase();
        const readableTo = String(view).toUpperCase();
        const logEntry = `[${simplifiedTime}] Switch: ${readableFrom} ➔ ${readableTo} (Armored)`;

        try {
            const currentLogs = localStorage.getItem('aetheros_tab_activity_logs');
            let parsedLogs = [];
            if (currentLogs) {
                try {
                    parsedLogs = JSON.parse(currentLogs);
                } catch {
                    parsedLogs = [];
                }
            }
            parsedLogs.push(logEntry);
            if (parsedLogs.length > 50) {
                parsedLogs.shift();
            }
            localStorage.setItem('aetheros_tab_activity_logs', JSON.stringify(parsedLogs));
        } catch (e) {
            console.error("Tab switch log write error:", e);
        }

        // Dispatch Custom Event for real-time reactivity
        window.dispatchEvent(new CustomEvent('aetheros_tab_switch', { detail: { from: currentView, to: view } }));

        setCurrentView(view);
    };

    const renderContent = () => {
        const viewRenderer = ViewRegistry[currentView];
        if (viewRenderer) {
            return viewRenderer({
                messages,
                onSendMessage: handleSendMessage,
                isLoading,
                activeSeat,
                onSetActiveSeat: setActiveSeat,
                onActionReward: (shards: number) => setConjunctionProgress(prev => ({ ...prev, shards: prev.shards + shards })),
                onSetView: handleSetView,
                unlockedViews,
                setUnlockedViews,
                acousticPressure,
                harmonicStride: harmonicStride + (strideSurgeTimeLeft > 0 ? 0.2 : 0),
                isTtsEnabled,
                onToggleTts: () => setIsTtsEnabled(!isTtsEnabled),
                chatSearchQuery,
                setChatSearchQuery,
                chatStartDate,
                chatEndDate,
                chatSenderFilter,
                setChatSenderFilter,
                onDateChange: (s: string, e: string) => { setChatStartDate(s); setChatEndDate(e); },
                onClearChat: handleClearChat,
                chatInput,
                setChatInput,
                isRecording,
                onToggleRecording: toggleRecording,
                attachedFiles,
                onFilesChange: handleFilesChange,
                onRemoveFile: handleRemoveFile,
                onScanFile: handleScanFile,
                projects,
                setProjects,
                agents,
                setAgents,
                shards: conjunctionProgress.shards,
                onPurchase: (cost: number) => {
                    if (conjunctionProgress.shards >= cost) {
                        setConjunctionProgress(prev => ({ ...prev, shards: prev.shards - cost }));
                        return true;
                    }
                    return false;
                },
                onIgniteSister: (name: keyof SistersState) => {
                    setSisters(prev => ({
                        ...prev,
                        [name]: { ...prev[name], active: true }
                    }));
                },
                sisters,
                purchasedItems,
                setPurchasedItems,
                rubyFilterActive,
                setRubyFilterActive,
                strideSurgeTimeLeft,
                setStrideSurgeTimeLeft,
                progress: conjunctionProgress,
                blueprints,
                setBlueprints,
                systemStatus,
                evoLibrary,
                lastBroadcast,
                lastMessage: messages[messages.length - 1],
                savedModulesCount: savedModules.length,
                pinnedItems,
                dominance,
                governance,
                onSetGovernance: setGovernance,
                knowledgeBaseSize: 1000000,
                onUpdateSystemStatus: handleUpdateSystemStatus,
                onNewBroadcast: (msg: BroadcastMessage) => {
                    setBroadcasts(prev => [msg, ...prev].slice(0, 50));
                    setLastBroadcast(msg);
                },
                onCancelBroadcast: (id: string) => {
                    setBroadcasts(prev => prev.filter(b => b.id !== id));
                },
                broadcasts,
                status: deviceLinkStatus,
                device: linkedDevice,
                onConnect: () => setDeviceLinkStatus('connected'),
                onDisconnect: () => setDeviceLinkStatus('disconnected'),
                lastModule: savedModules[0],
                onGenerate: generateSoftwareModule,
                teachers,
                onSelectTeacher: () => {},
                libraryItems,
                vehicles,
                setVehicles,
                profile: userProfile,
                onUpdateProfile: (updates: any) => setUserProfile(prev => ({ ...prev, ...updates })),
                currentChannel,
                onSetChannel: (channel: any) => {
                    if (channel === 'moderator' && !['moderator', 'operator', 'admin'].includes(user?.role || '')) {
                        reportError({
                            title: 'UNAUTHORIZED_ACCESS',
                            message: 'Private channels are locked for guest/user level observers.',
                            severity: ErrorSeverity.MEDIUM
                        });
                        return;
                    }
                    setCurrentChannel(channel);
                },
                isSystemFractured: isSystemFractured,
                onToggleFracture: (val?: boolean) => {
                    setIsSystemFractured(prev => val !== undefined ? val : !prev);
                },
                onResetFracture: () => {
                    setIsSystemFractured(false);
                    setCurrentAlert(null);
                    setSoundscape('VOID');
                    setMessages(prev => [...prev, {
                        sender: 'model',
                        content: "Integrity restored. The Billy Order has been suppressed. System stability returning to baseline.",
                        timestamp: new Date()
                    }]);
                },
                archives,
                onAddArchive: handleAddArchive,
                onDeleteArchive: handleDeleteArchive,
            });
        }

        return <div className="p-8 text-red-500">VIEW_NOT_FOUND: {currentView}</div>;
    };

    const handleClearSystemErrors = useCallback(() => {
        setSystemStatus({
            Engine: 'OK', Battery: 'OK', Navigation: 'OK', Infotainment: 'OK', Handling: 'OK'
        });
        setManualOverrides({});
        setIsHalted(false);
        EmergencyKillSwitch.reset();
    }, []);

    if (isInitializing) {
        return (
            <div className="h-screen w-screen bg-black flex items-center justify-center font-mono text-red-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-red-900 border-t-red-500 rounded-full animate-spin"></div>
                    <div className="animate-pulse tracking-[0.2em] text-xs">DECRYPTING_LATTICE_GATE...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginView />;
    }

    const handleTriggerHalt = async () => {
        setIsHalted(true);
        await EmergencyKillSwitch.trigger();
    };

    const handleResetHalt = () => {
        setIsHalted(false);
        EmergencyKillSwitch.reset();
    };

    return (
        <ErrorBoundary>
            <GlobalErrorHandler />
            <Toaster position="top-right" theme="dark" />
            <div className="flex h-screen w-screen overflow-hidden bg-black text-gray-200">
                {rubyFilterActive && (
                    <div className="pointer-events-none fixed inset-0 z-[9999] opacity-25 bg-red-600/10 mix-blend-color-dodge ring-inset ring-[15px] ring-red-500/30">
                        <div className="w-full h-full bg-[linear-gradient(rgba(239,68,68,0.12)_50%,_transparent_50%)] bg-[length:100%_4px] animate-pulse" />
                    </div>
                )}
            <Sidebar 
                systemStatus={systemStatus} systemDetails={{}} currentView={currentView as MainView} onSetView={(v) => handleSetView(v as any)} 
                currentDateTime={currentTime} timeFormat={timeFormat} onToggleTimeFormat={() => setTimeFormat(prev => prev === '12hr' ? '24hr' : '12hr')} 
                unlockedViews={[...unlockedViews, 'cellular_grid' as any, 'voice_authority' as any, 'constraints_audit' as any, 'remix_scope_lab' as any, 'medical_synthesis_lab' as any, 'sovereign_standard' as any, 'blockchain_history' as any, 'ai_telemetry' as any, 'cascade_investigator' as any, 'inevitable_crash' as any]} onToggleTerminal={() => setIsTerminal(!isTerminal)} isTerminal={isTerminal}
            />
            
            <main className={`flex-1 flex flex-col relative overflow-hidden transition-all duration-75 flex-hinge dpi-300-shield ${isTerminal ? 'terminal-mode font-mono bg-black text-green-500 border-l-2 border-green-900/40' : ''} ${isHalted ? 'brightness-50 grayscale pointer-events-none' : ''}`}>
                <TheShroud isSensitive={isGhostMode}>
                    <TopNavBar 
                        currentView={currentView as MainView} 
                        onSetView={(v) => handleSetView(v as any)} 
                        isTerminal={isTerminal} 
                        onToggleTerminal={() => setIsTerminal(!isTerminal)} 
                        onTriggerKillSwitch={handleTriggerHalt}
                        isGhostMode={isGhostMode}
                        onToggleGhostMode={() => setIsGhostMode(!isGhostMode)}
                    />
                    <GuestBanner role={user?.role || 'guest'} />
                    <BreakCoordinator />
                    <div className="absolute top-4 right-20 z-[60] flex items-center gap-6 pointer-events-none animate-in fade-in duration-300">
                        <div 
                            className="pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all duration-75 relative group" 
                            onClick={() => setIsModulatorOpen(true)}
                            title="Open Acoustic Modulator Control Console"
                        >
                            <SonicMetric size="sm" value={acousticPressure} label="DB_SPL" unit="dB" colorClass="border-blue-600 text-blue-500" />
                            <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-500/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-110 rounded" />
                        </div>
                        <div className="pointer-events-auto">
                            <ConjunctionThroughputMeter 
                                shards={conjunctionProgress.shards}
                                activityDensity={activityDensity}
                                isSystemFractured={isSystemFractured}
                                isSyncing={isEconomySyncing}
                            />
                        </div>
                    </div>
                    <div id="aetheros-view-wrapper" className={`flex-1 min-h-0 flex flex-col relative ${isSystemFractured ? 'matrix-glitch-active' : ''}`}>
                        {isSystemFractured && (
                            <MatrixCodeRain 
                                color="rgba(244, 63, 94, 0.28)" 
                                fontSize={10} 
                                speed={30} 
                            />
                        )}
                        <AnimatePresence mode="wait">
                            <AndroidTransition key={currentView} type="abc_fade_in" className="flex-1 min-h-0 flex flex-col">
                                {renderContent()}
                            </AndroidTransition>
                        </AnimatePresence>
                        {isSystemFractured && (
                            <LockdownOverlay 
                                isSystemFractured={isSystemFractured}
                                onCloseLockdown={() => setIsSystemFractured(false)}
                                isHalted={isHalted}
                                onTriggerHalt={handleTriggerHalt}
                                onResetHalt={handleResetHalt}
                                onLogBreachData={handleExportBreachData}
                                acousticPressure={acousticPressure}
                                shards={conjunctionProgress.shards}
                                activityDensity={activityDensity}
                            />
                        )}
                        {isSystemFractured && (
                            <button
                                onClick={handleExportBreachData}
                                className="absolute bottom-6 right-6 z-[200] bg-zinc-950/90 hover:bg-rose-950/50 text-rose-400 font-mono px-4 py-2 rounded-lg border-2 border-rose-500/80 font-black uppercase tracking-widest shadow-[0_0_20px_rgba(244,63,94,0.25)] hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-[10px] cursor-pointer"
                                title="Export fractured system parameters for forensic post-incident tracing"
                            >
                                <DownloadIcon className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                                <span>Log Breach Data</span>
                            </button>
                        )}
                    </div>
                </TheShroud>
                <PredictiveBanner alert={currentAlert} onFix={() => setCurrentAlert(null)} onDismiss={() => setCurrentAlert(null)} />
                <AmbientSoundPlayer enabled={true} status={systemStatus} isHalted={isHalted} soundscape={soundscape} />
                <EmergencyHaltButton 
                    onTrigger={handleTriggerHalt} 
                    isHalted={isHalted} 
                    onReset={handleResetHalt} 
                    hasAlarm={currentAlert?.severity === 'HIGH' || currentAlert?.type === 'ERROR'}
                />
                <KillSwitchOverlay 
                    isHalted={isHalted} 
                    onTrigger={handleTriggerHalt} 
                    onReset={handleResetHalt} 
                    hasAlarm={currentAlert?.severity === 'HIGH' || currentAlert?.type === 'ERROR'}
                    onClearAllErrors={handleClearSystemErrors}
                />
                <EmergencyAlarmOverlay isHalted={isHalted} />
                <VoiceHUDOverlay currentView={currentView} onSetView={handleSetView} />
                <StealthWatcher 
                    isLocked={isGhostMode} 
                    dissonanceLevel={acousticPressure} 
                    stride={harmonicStride} 
                />

                {/* ACOUSTIC PRESSURE CRITICAL WARNING DIALOG */}
                {isAcousticWarningOpen && (
                    <div 
                        id="acoustic-warning-modal"
                        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
                    >
                        <div className="bg-zinc-950 border-4 border-rose-600 rounded-xl max-w-lg w-full overflow-hidden shadow-[8px_8px_0_0_#e11d48] font-mono text-zinc-300">
                            {/* Hazard Stripes */}
                            <div className="h-6 bg-rose-600 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[size:20px_20px]" />
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">
                                    CRITICAL METRIC OVERFLOW // DE-SYNCHRONIZATION DETECTED
                                </span>
                            </div>

                            {/* Dialog Content */}
                            <div className="p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
                                <div className="flex items-start gap-4">
                                    <span className="text-4xl text-rose-500 animate-bounce">🚨</span>
                                    <div className="space-y-1 flex-1">
                                        <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest">
                                            RESONANCE BUFFER OVERLOAD
                                        </h3>
                                        <p className="text-[10px] text-zinc-500 uppercase">
                                            Aetheros Interface Resonance Index
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Continuous hyper-dense operator clicks and keypress sequences have overloaded the interface resonance buffers. Real-time acoustic coupling has exceeded safety limits, creating potential feedback loops in the system's core cognitive bridge.
                                </p>

                                {/* Live Metrics Display */}
                                <div className="bg-zinc-900/60 border border-rose-950/50 p-4 rounded-lg space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold text-zinc-400">ACOUSTIC LOAD:</span>
                                        <span className="text-base font-black text-rose-500 animate-pulse">{acousticPressure} dB SPL</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold text-zinc-400">USER ACTIVITY DENSITY:</span>
                                        <span className="text-xs font-bold text-white">{activityDensity} pulses/10s</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold text-zinc-400">WARNING THRESHOLD:</span>
                                        <span className="text-xs text-rose-400/80">{acousticThreshold} dB SPL</span>
                                    </div>

                                    <div className="w-full bg-zinc-950 h-3 border border-zinc-850 rounded-full overflow-hidden relative">
                                        {/* Danger Line */}
                                        <div 
                                            className="absolute top-0 bottom-0 border-r-2 border-dashed border-rose-500 z-10"
                                            style={{ left: `${(acousticThreshold / 120) * 100}%` }}
                                            title="Safety Limit"
                                        />
                                        {/* Level Fill */}
                                        <div 
                                            className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-300"
                                            style={{ width: `${(acousticPressure / 120) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Options to mitigate */}
                                <div className="space-y-3 pt-2">
                                    <button
                                        onClick={() => {
                                            // Purge buffer and reset
                                            sonicLedger.clear();
                                            setAcousticPressure(30.0);
                                            setActivityDensity(0);
                                            setIsAcousticWarningOpen(false);
                                        }}
                                        className="w-full py-2 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500 text-rose-400 rounded text-xs font-black uppercase tracking-wider transition-all duration-75 active:scale-98 cursor-pointer"
                                    >
                                        ⚡ Emergency De-Escalation (Purge Sonic History)
                                    </button>
                                    
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                // Actively mute warning alerts for 30s
                                                setIsMutedCooldown(true);
                                                setMuteTimerRemaining(30);
                                                setIsAcousticWarningOpen(false);
                                            }}
                                            className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 rounded text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                                        >
                                            🔕 Mute alerts for 30s
                                        </button>
                                        <button
                                            onClick={() => setIsAcousticWarningOpen(false)}
                                            className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 rounded text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer text-center"
                                        >
                                            ✕ Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ACOUSTIC LEVEL MODULATOR & SIMULATOR */}
                {isModulatorOpen && (
                    <div 
                        id="acoustic-simulator-panel"
                        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
                    >
                        <div className="bg-zinc-950 border-4 border-zinc-800 rounded-xl max-w-md w-full overflow-hidden shadow-[8px_8px_0_0_#10b981] font-mono text-zinc-300">
                            {/* Header */}
                            <div className="bg-zinc-900 border-b-4 border-zinc-800 p-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                                    <h3 className="font-black text-emerald-400 text-xs uppercase tracking-widest">
                                        RESONANCE CONFIGURATION HUB
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => setIsModulatorOpen(false)}
                                    className="text-zinc-500 hover:text-white font-bold cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                <p className="text-[10px] text-zinc-500 uppercase leading-relaxed">
                                    Access point to configure simulation trigger thresholds and manually push custom metric impulses.
                                </p>

                                {/* Section: Controls */}
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[10px] text-zinc-400 uppercase font-bold">WARNING TRIGGER THRESHOLD</span>
                                            <span className="text-xs font-bold text-white">{acousticThreshold} dB SPL</span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="50"
                                            max="110"
                                            step="5"
                                            value={acousticThreshold}
                                            onChange={(e) => setAcousticThreshold(Number(e.target.value))}
                                            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                                        />
                                        <div className="flex justify-between text-[8px] text-zinc-600 mt-1">
                                            <span>50 dB (SENSITIVE)</span>
                                            <span>110 dB (LOADED)</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-zinc-900 pt-4 space-y-3">
                                        <span className="text-[10px] text-zinc-400 uppercase font-bold block">IMPULSE SIMULATOR</span>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => {
                                                    // Trigger 5 dummy click events to raise density
                                                    for (let i = 0; i < 5; i++) {
                                                        setTimeout(() => {
                                                            sonicLedger.record('CLICK', 'SIMULATED_KEY', 6);
                                                        }, i * 150);
                                                    }
                                                }}
                                                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-emerald-400 rounded text-[10px] uppercase font-bold tracking-wider text-center cursor-pointer transition-colors"
                                            >
                                                ⚡ Inject Click Spike (+5 pulses)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // Trigger 15 heavy key sequence
                                                    for (let i = 0; i < 15; i++) {
                                                        setTimeout(() => {
                                                            sonicLedger.record('KEY', 'SIMULATED_BURST', 8);
                                                        }, i * 100);
                                                    }
                                                }}
                                                className="px-3 py-2 bg-gradient-to-r from-rose-950/50 to-zinc-900 hover:brightness-110 border border-rose-900/50 hover:border-rose-700 text-rose-400 rounded text-[10px] uppercase font-bold tracking-wider text-center cursor-pointer transition-all"
                                            >
                                                🔥 Inject Dense Burst (+15)
                                            </button>
                                        </div>
                                        <p className="text-[8px] text-zinc-500 leading-normal">
                                            *Injecting denser pulses increases user activity density within the 10-second running window, pushing Acoustic Pressure past the trigger threshold.*
                                        </p>
                                    </div>
                                </div>

                                {/* Section: Status */}
                                <div className="bg-zinc-900/40 border border-zinc-900 rounded p-3 text-[10px] space-y-2">
                                    <div className="flex justify-between text-zinc-500">
                                        <span>AMB_PRESSURE:</span>
                                        <span className="text-white font-bold">{acousticPressure} dB</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-500">
                                        <span>ACTIVE_DENSITY:</span>
                                        <span className="text-white font-bold">{activityDensity} pulses/10s</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-500">
                                        <span>MUTE_COOLDOWN:</span>
                                        <span className={isMutedCooldown ? "text-amber-500 font-bold" : "text-zinc-600"}>
                                            {isMutedCooldown ? `ACTIVE (${muteTimerRemaining}s)` : 'OFF'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* DEEP_STASIS_DEBUG OVERLAY */}
                {isDeepStasisDebugOpen && (
                    <div 
                        id="deep-stasis-debug-overlay"
                        className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 text-rose-500 font-mono p-6 select-none overflow-hidden"
                    >
                        {/* Background scanning lasers & futuristic scanlines */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(244,63,94,0.08)_50%,_transparent_50%)] bg-[length:100%_4px] animate-pulse z-10" />
                        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.15),transparent_70%)] z-10" />
                        
                        <div className="max-w-4xl w-full border-4 border-rose-600 bg-zinc-950 p-6 rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.3)] flex flex-col gap-6 relative z-20 overflow-hidden">
                            {/* Decorative framing lines */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-rose-400" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-rose-400" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-rose-400" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-rose-400" />

                            {/* Header Section */}
                            <div className="border-b-4 border-rose-600 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
                                        <h2 className="text-2xl font-black uppercase tracking-widest text-white">
                                            DEEP_STASIS_DEBUG
                                        </h2>
                                    </div>
                                    <p className="text-[10px] text-rose-400/80 uppercase tracking-widest mt-1">
                                        Sovereign Core System memory override matrix // Authorization Level 5
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="px-3 py-1 bg-rose-950 border border-rose-600 text-[10px] font-bold uppercase rounded text-rose-400">
                                        SEC_STASIS: ACTIVE
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] text-zinc-500 block uppercase font-bold">STASIS COLLAPSE IN:</span>
                                        <span className="text-lg font-black text-white">{stasisRemainingTime}s</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Metrics Panels */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Left column: System Metrics */}
                                <div className="space-y-4 border border-rose-900/40 p-4 rounded-xl bg-black/40">
                                    <h4 className="text-[10px] font-black text-rose-400 border-b border-rose-900 pb-1.5 uppercase tracking-widest">
                                        Core Hardware Regs
                                    </h4>
                                    <div className="space-y-2 text-[10px]">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">AETHER_KERNEL:</span>
                                            <span className="text-white font-bold">v0.9.8-LOCKED</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">CORE_TEMP:</span>
                                            <span className="text-emerald-400 font-bold">
                                                {(34.12 + (quantumTick % 10) * 0.05).toFixed(2)} °C
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">HEARTBEAT_STATUS:</span>
                                            <span className="text-green-500 font-bold">RECONCILED (100%)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">ZOMBIE_RECOVERY_STRIKES:</span>
                                            <span className="text-rose-500 font-bold">0 / 3 strikes</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">MEM_HEAP_ALLOCATED:</span>
                                            <span className="text-cyan-400 font-bold">
                                                {(18.24 + (quantumTick % 25) * 0.12).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">SYNAPTIC_BANDWIDTH:</span>
                                            <span className="text-amber-500 font-bold">4.88 Gbps</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Center column: Hidden Memory Variables */}
                                <div className="space-y-4 border border-rose-900/40 p-4 rounded-xl bg-black/40">
                                    <h4 className="text-[10px] font-black text-rose-400 border-b border-rose-900 pb-1.5 uppercase tracking-widest">
                                        Cognitive Variables
                                    </h4>
                                    <div className="space-y-2 text-[10px]">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">CURRENT_QUANTUM_TICK:</span>
                                            <span className="text-white font-bold animate-pulse">{quantumTick}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">SHARD_POTENTIAL_UNITS:</span>
                                            <span className="text-amber-400 font-bold">{conjunctionProgress.shards}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">ACOUSTIC_PRESSURE_SPL:</span>
                                            <span className="text-red-400 font-bold">{acousticPressure} dB</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">STRIDE_VELOCITY_PB:</span>
                                            <span className="text-blue-400 font-bold">
                                                {(harmonicStride * 4.3).toFixed(2)} PB/s
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">ACTIVE_COGNITIVE_VIEW:</span>
                                            <span className="text-yellow-400 uppercase font-bold">{currentView}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">SECTOR_COHERENCE_RATE:</span>
                                            <span className="text-emerald-500 font-bold">0.999513</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right column: Sister Matrices & Filters */}
                                <div className="space-y-4 border border-rose-900/40 p-4 rounded-xl bg-black/40">
                                    <h4 className="text-[10px] font-black text-rose-400 border-b border-rose-900 pb-1.5 uppercase tracking-widest">
                                        Subsystem Coherence
                                    </h4>
                                    <div className="space-y-2 text-[10px]">
                                        <div className="flex justify-between items-center">
                                            <span className="text-zinc-500">SISTER_AETHERA:</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${sisters.aethera.active ? 'bg-green-950/80 text-green-400 border border-green-600/30' : 'bg-zinc-900 text-zinc-600'}`}>
                                                {sisters.aethera.active ? 'COHERENT' : 'OFFLINE'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-zinc-500">SISTER_LOGICA:</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${sisters.logica.active ? 'bg-green-950/80 text-green-400 border border-green-600/30' : 'bg-zinc-900 text-zinc-600'}`}>
                                                {sisters.logica.active ? 'COHERENT' : 'OFFLINE'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-zinc-500">SISTER_SOPHIA:</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${sisters.sophia.active ? 'bg-green-950/80 text-green-400 border border-green-600/30' : 'bg-zinc-900 text-zinc-600'}`}>
                                                {sisters.sophia.active ? 'COHERENT' : 'OFFLINE'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">RUBY_ACTIVE_LENS:</span>
                                            <span className={rubyFilterActive ? "text-red-500 font-bold" : "text-zinc-600"}>
                                                {rubyFilterActive ? "ENGAGED" : "STANDBY"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">CONDUCTION_COEFFICIENT:</span>
                                            <span className="text-cyan-400 font-bold">1.042</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">GHOST_COGNITION_MODE:</span>
                                            <span className={isGhostMode ? "text-purple-400 font-bold animate-pulse" : "text-zinc-600"}>
                                                {isGhostMode ? "ENABLED" : "DISABLED"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hexadecimal Memory Stream (Matrix-like aesthetic scroll) */}
                            <div className="border border-rose-900/50 p-4 rounded-xl bg-black font-mono text-[9px] text-rose-500/80 space-y-1 select-none">
                                <div className="text-[10px] text-rose-400 border-b border-rose-900/40 pb-1.5 mb-2 font-black uppercase tracking-widest flex justify-between">
                                    <span>COGNITIVE REGISTER MEMORY ADDR STREAM</span>
                                    <span className="text-zinc-600">OFFSET: 0x7FFF5F3F4000</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 h-[90px] overflow-hidden leading-relaxed">
                                    <div>
                                        <div>0x7FFF5F3F4D0C: F3 A0 B1 C4 99 EE D3 CC <span className="text-rose-400/40">..[STASIS_OK]</span></div>
                                        <div>0x7FFF5F3F4D14: {(40 + (quantumTick % 12)).toString(16).toUpperCase()} A1 22 4D E4 C3 FF D0 <span className="text-rose-400/40">..[MEM_MUTEX]</span></div>
                                        <div>0x7FFF5F3F4D20: C0 F2 8E 12 {(10 + (quantumTick % 9)).toString(16).toUpperCase()} FF 34 8C <span className="text-rose-400/40">..[THREAD_AL]</span></div>
                                        <div>0x7FFF5F3F4D2C: AA D3 FC B8 01 22 CC EE <span className="text-rose-400/40">..[SOV_GUARD]</span></div>
                                    </div>
                                    <div>
                                        <div>0x7FFF5F3F4D38: {(222 - (quantumTick % 15)).toString(16).toUpperCase()} 03 EE AA 88 CD FE 00 <span className="text-rose-400/40">..[AETH_SYS]</span></div>
                                        <div>0x7FFF5F3F4D44: 10 B9 81 AB C2 DE F3 99 <span className="text-rose-400/40">..[RESO_COV]</span></div>
                                        <div>0x7FFF5F3F4D50: E5 9E 30 C1 0A E4 5D D9 <span className="text-rose-400/40">..[DB_SPL_G]</span></div>
                                        <div>0x7FFF5F3F4D5C: FF FF FF FF 00 12 CC D5 <span className="text-rose-400/40">..[K_BYPASS]</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Countdown progress line */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-rose-400 font-bold">
                                    <span>STASIS COHERENCE LEVEL</span>
                                    <span>{Math.round((stasisRemainingTime / 8) * 100)}%</span>
                                </div>
                                <div className="w-full h-3 bg-zinc-900 border border-rose-900/50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-red-400 transition-all duration-1000"
                                        style={{ width: `${(stasisRemainingTime / 8) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Manual Force Dismiss button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => {
                                        try {
                                            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                                            if (AudioContextClass) {
                                                const ctx = new AudioContextClass();
                                                const osc = ctx.createOscillator();
                                                const gain = ctx.createGain();
                                                osc.connect(gain);
                                                gain.connect(ctx.destination);
                                                osc.type = 'triangle';
                                                osc.frequency.setValueAtTime(880, ctx.currentTime);
                                                gain.gain.setValueAtTime(0.04, ctx.currentTime);
                                                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                                                osc.start();
                                                osc.stop(ctx.currentTime + 0.15);
                                            }
                                        } catch (e) {}
                                        setIsDeepStasisDebugOpen(false);
                                    }}
                                    className="px-6 py-2.5 bg-rose-950 hover:bg-rose-900 border-2 border-rose-600 hover:border-rose-400 text-rose-400 font-black rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000]"
                                >
                                    COLLAPSE STASIS OVERLAY
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
      </ErrorBoundary>
    );
};
