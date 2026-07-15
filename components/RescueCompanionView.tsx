import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Shield, Heart, MapPin, Search, Radio, Compass, Zap, 
  Send, History, ShieldAlert, CheckCircle, Info, Sparkles, Volume2, 
  VolumeX, AlertTriangle, Cpu, Globe, Users, Navigation, Hammer, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Survivor {
  id: string;
  sector: string;
  depth: number; // in meters
  vitals: {
    heartRate: number;
    respiration: number; // bpm
    temperature: number; // °C
    co2Level: number; // ppm (in pocket)
  };
  status: 'STABLE' | 'WEAK' | 'CRITICAL' | 'RESCUED';
  coordinates: { x: number; y: number };
  detectedAt: string;
  notes: string;
  companionAssigned: string | null;
}

interface CompanionDrone {
  id: string;
  name: string;
  type: 'Exo-Probe' | 'Heavy-Excavator' | 'Micro-Cavity-Crawler' | 'Sub-Surface-Acoustic-Beacon';
  status: 'IDLE' | 'SCANNING' | 'DEPLOYED' | 'STANDBY';
  battery: number;
  sonarResolution: string;
  currentTask: string | null;
  sensorPayload: string[];
}

interface HistoricalEvent {
  id: string;
  title: string;
  location: string;
  year: string;
  description: string;
  lesson: string;
  debrisSeverity: 'EXTREME' | 'HIGH' | 'MODERATE';
}

interface RecoveryLogEntry {
  id: string;
  survivorId: string;
  location: string;
  depth: number;
  timestamp: string;
  statusAtExtraction: 'STABLE' | 'WEAK' | 'CRITICAL' | 'RESCUED' | 'UNKNOWN';
  rescuedBy: string;
  notes: string;
}

export const RescueCompanionView: React.FC = () => {
  // Theme and Tab states
  const [activeTab, setActiveTab] = useState<'SCANNER' | 'RECOVERY_LOG'>('SCANNER');
  const [activeScanType, setActiveScanType] = useState<'ELECTROMAGNETIC' | 'ACOUSTIC' | 'THERMAL' | 'CO2_SENSE'>('ELECTROMAGNETIC');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [selectedSurvivor, setSelectedSurvivor] = useState<Survivor | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Recovery log specific state
  const [recoveryLogs, setRecoveryLogs] = useState<RecoveryLogEntry[]>(() => {
    const saved = localStorage.getItem('aether_recovery_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse recovery logs from localStorage:", e);
      }
    }
    return [
      {
        id: 'REC-001',
        survivorId: 'S-99',
        location: 'Sector C-2 (Sub-level 3 Cavity)',
        depth: 6.5,
        timestamp: '2026-07-13 14:15',
        statusAtExtraction: 'STABLE',
        rescuedBy: 'Taskforce Delta & Rover-03',
        notes: 'Extricated using hydraulic concrete cutter. Core vitals stabilized upon O2 delivery.'
      },
      {
        id: 'REC-002',
        survivorId: 'S-104',
        location: 'Sector F-4 (Pancake Slab Void)',
        depth: 3.2,
        timestamp: '2026-07-13 15:42',
        statusAtExtraction: 'WEAK',
        rescuedBy: 'TF-9 Heavy Rescuers',
        notes: 'Located via continuous wave GPR. Hand-dug access channel completed safely.'
      }
    ];
  });

  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [showManualLogForm, setShowManualLogForm] = useState<boolean>(false);

  // Manual entry state fields
  const [manualSurvivorId, setManualSurvivorId] = useState<string>('');
  const [manualLocation, setManualLocation] = useState<string>('');
  const [manualDepth, setManualDepth] = useState<number>(2.5);
  const [manualStatus, setManualStatus] = useState<'STABLE' | 'WEAK' | 'CRITICAL' | 'UNKNOWN'>('STABLE');
  const [manualRescuedBy, setManualRescuedBy] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');

  // Persist Recovery Logs
  useEffect(() => {
    localStorage.setItem('aether_recovery_logs', JSON.stringify(recoveryLogs));
  }, [recoveryLogs]);
  
  // Custom companion dialog
  const [messages, setMessages] = useState<Array<{ sender: 'companion' | 'rescuer', text: string, timestamp: string }>>([
    {
      sender: 'companion',
      text: "Aether E-DPR Companion initialized. Deploy me outside your system. I am equipped to analyze structural resonance, see through rubble layers, and detect human metabolic pings. What crisis theater shall we synchronize?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Audio Context for the scanning resonance hum
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // 1. Core State lists
  const [survivors, setSurvivors] = useState<Survivor[]>([
    {
      id: 'S-101',
      sector: 'Sector B-12 (South Collapse)',
      depth: 4.8,
      vitals: { heartRate: 88, respiration: 14, temperature: 34.2, co2Level: 1200 },
      status: 'WEAK',
      coordinates: { x: 32, y: 45 },
      detectedAt: '12 mins ago',
      notes: 'Trapped in void between crushed hollow-core concrete slabs. Structural integrity surrounding is highly unstable.',
      companionAssigned: 'Echo-01'
    },
    {
      id: 'S-102',
      sector: 'Sector A-3 (Basement Void 2)',
      depth: 7.2,
      vitals: { heartRate: 61, respiration: 9, temperature: 31.8, co2Level: 2400 },
      status: 'CRITICAL',
      coordinates: { x: 68, y: 72 },
      detectedAt: '3 mins ago',
      notes: 'Weak respiration rate detected under high debris volume. Air supply is deteriorating. Extreme carbon dioxide accumulation.',
      companionAssigned: null
    },
    {
      id: 'S-103',
      sector: 'Sector E-9 (Elevator Shaft Cave-In)',
      depth: 2.1,
      vitals: { heartRate: 94, respiration: 18, temperature: 36.5, co2Level: 450 },
      status: 'STABLE',
      coordinates: { x: 50, y: 25 },
      detectedAt: '24 mins ago',
      notes: 'Responsive voice responses noted. Debris mostly consists of light ceiling fragments. Minimal structural hazard.',
      companionAssigned: 'Rover-03'
    }
  ]);

  const [companions, setCompanions] = useState<CompanionDrone[]>([
    {
      id: 'C-01',
      name: 'Echo-01',
      type: 'Sub-Surface-Acoustic-Beacon',
      status: 'DEPLOYED',
      battery: 89,
      sonarResolution: '0.5cm Radial Precision',
      currentTask: 'Monitoring Void S-101',
      sensorPayload: ['Acoustic Microphones', 'Seismic Triggers']
    },
    {
      id: 'C-02',
      name: 'Exo-Sovereign-02',
      type: 'Heavy-Excavator',
      status: 'STANDBY',
      battery: 100,
      sonarResolution: 'Non-destructive Magnetic Resonator',
      currentTask: null,
      sensorPayload: ['Laser Range Finder', 'Thermal Array', 'Pneumatic Spreader']
    },
    {
      id: 'C-03',
      name: 'Rover-03',
      type: 'Micro-Cavity-Crawler',
      status: 'DEPLOYED',
      battery: 64,
      sonarResolution: '0.1cm Fiber-Optic Probe',
      currentTask: 'Securing Void S-103',
      sensorPayload: ['Endoscope Camera', 'O2 Supply Tube', 'Two-Way Speaker']
    },
    {
      id: 'C-04',
      name: 'Spectre-04',
      type: 'Exo-Probe',
      status: 'IDLE',
      battery: 95,
      sonarResolution: 'Continuous wave radar (GPR)',
      currentTask: null,
      sensorPayload: ['Ground Penetrating Radar', 'Infrared Thermographic Lens']
    }
  ]);

  const historicalCrises: HistoricalEvent[] = [
    {
      id: 'H-911',
      title: 'Ground Zero (9/11 Memorial)',
      location: 'New York City, USA',
      year: '2001',
      description: 'Massive structural collapse resulting in millions of tons of steel and pulverized concrete rubble. Hundreds of survivors trapped in deep pocket voids could not be located in time due to lack of sub-surface scanning tech.',
      lesson: 'Continuous wave radar (GPR) and micro-crawler drone companions deployed immediately can navigate tiny 2-inch void shafts to find air cavities, sustaining life with micro-oxygen delivery tubes.',
      debrisSeverity: 'EXTREME'
    },
    {
      id: 'H-TKM',
      title: 'Tohoku Earthquake & Tsunami',
      location: 'Miyagi Prefecture, Japan',
      year: '2011',
      description: 'Widespread coastal destruction with severe water-logged debris piles, making traditional thermal and acoustic scanning nearly impossible.',
      lesson: 'Multi-spectral sensor fusion (combining ultrasonic sonar and low-frequency CO2 sniffing) detects breathing metrics through saturated soil and debris.',
      debrisSeverity: 'HIGH'
    },
    {
      id: 'H-TRY',
      title: 'Kahramanmaraş Earthquake',
      location: 'Gaziantep, Turkey-Syria',
      year: '2023',
      description: 'Pancake collapses of multi-story residential towers, leaving extremely heavy nested concrete voids.',
      lesson: 'Resonant acoustic network beacons acting in unison can triangulate scratching noises down to a 3-inch margin, mapping survivors under 20 stories of debris.',
      debrisSeverity: 'EXTREME'
    }
  ];

  // 2. Sound synthesis for scanning resonance
  const playScatteringSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Create oscillator and gain nodes
      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();

      osc.type = activeScanType === 'ELECTROMAGNETIC' ? 'sawtooth' : 
                 activeScanType === 'ACOUSTIC' ? 'sine' : 'triangle';
      
      // Low frequency hum representing sub-surface radar
      osc.frequency.setValueAtTime(activeScanType === 'ELECTROMAGNETIC' ? 120 : 
                                   activeScanType === 'ACOUSTIC' ? 180 : 90, audioContextRef.current.currentTime);
      
      // Frequency sweeping effect to simulate a radar scan
      osc.frequency.linearRampToValueAtTime(
        activeScanType === 'ELECTROMAGNETIC' ? 240 : 
        activeScanType === 'ACOUSTIC' ? 280 : 150, 
        audioContextRef.current.currentTime + 3.0
      );

      gain.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);

      osc.start();
      osc.stop(audioContextRef.current.currentTime + 3.0);

    } catch (err) {
      console.warn("Resonant synthesizer bypassed due to browser audio restrictions:", err);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast(!soundEnabled ? "ACOUSTIC FEED ONLINE" : "ACOUSTIC FEED MUTED", {
      description: !soundEnabled 
        ? "Sub-surface frequency acoustic hum is now active." 
        : "Acoustic audio telemetry muted.",
      duration: 3000
    });
  };

  // 3. Trigger Scanning Sequence
  const handleTriggerScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    playScatteringSound();

    toast("TRIGGERING DISASTER OVERWATCH SCAN", {
      description: `Active Mode: ${activeScanType} debris-penetrating radar ping initialized.`,
      icon: <Activity className="text-red-500 animate-spin" />
    });

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          
          // Randomly fluctuate vitals or discover a new survivor void to keep interaction exciting
          setSurvivors(current => {
            const updated = current.map(surv => {
              if (surv.status === 'RESCUED') return surv;
              const hrDelta = Math.floor(Math.random() * 7) - 3;
              const tempDelta = Number((Math.random() * 0.4 - 0.2).toFixed(1));
              return {
                ...surv,
                vitals: {
                  ...surv.vitals,
                  heartRate: Math.max(50, Math.min(140, surv.vitals.heartRate + hrDelta)),
                  temperature: Number(Math.max(28, Math.min(38, surv.vitals.temperature + tempDelta)).toFixed(1))
                }
              };
            });
            return updated;
          });

          toast("SUB-SURFACE SCAN COMPLETE", {
            description: "Life signatures mapped. Deep slab density calculations successfully updated.",
            icon: <CheckCircle className="text-emerald-400" />
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // 4. Assign Drone to Survivor Void
  const handleAssignCompanion = (survivorId: string, companionName: string) => {
    // Set companion state to deployed
    setCompanions(prev => prev.map(comp => 
      comp.name === companionName 
        ? { ...comp, status: 'DEPLOYED', currentTask: `Assisting Void ${survivorId}` }
        : comp
    ));

    // Update survivor assignment
    setSurvivors(prev => prev.map(surv => 
      surv.id === survivorId 
        ? { ...surv, companionAssigned: companionName, notes: `${surv.notes} // AI Companion ${companionName} deployed directly to coordinates.` }
        : surv
    ));

    // Add to companion messages log
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        sender: 'companion',
        text: `⚡ SYSTEM ASSIGNMENT: Deployed companion drone "${companionName}" directly into the debris pocket at Void ${survivorId}. Thermal laser mapping engaged. Structural feedback: slabs are stable but require structural shoring. Directing military rescuers to safe entry vector!`,
        timestamp
      }
    ]);

    toast("AI COMPANION DEPLOYED", {
      description: `${companionName} successfully navigated structural void to reach survivor.`,
      icon: <Sparkles className="text-amber-500 animate-bounce" />
    });
  };

  // 5. Trigger "Rescue Secured"
  const handleSecureSurvivor = (id: string) => {
    const survivor = survivors.find(s => s.id === id);
    if (!survivor) return;

    setSurvivors(prev => prev.map(s => 
      s.id === id 
        ? { ...s, status: 'RESCUED', notes: 'Extricated successfully. Deployed outside systemic danger. Secured under medical care.' } 
        : s
    ));
    
    // Set assigned companion back to standby
    if (survivor.companionAssigned) {
      setCompanions(prev => prev.map(c => 
        c.name === survivor.companionAssigned 
          ? { ...c, status: 'STANDBY', currentTask: null }
          : c
      ));
    }

    // Capture current local time
    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Register inside Recovery Log
    const newLog: RecoveryLogEntry = {
      id: `REC-${Math.floor(100 + Math.random() * 900)}`,
      survivorId: survivor.id,
      location: survivor.sector || 'Unspecified Sector',
      depth: survivor.depth,
      timestamp: timestampStr,
      statusAtExtraction: survivor.status === 'RESCUED' ? 'STABLE' : survivor.status,
      rescuedBy: survivor.companionAssigned ? `Companion ${survivor.companionAssigned} & Tactical Ground Units` : 'Military Ground Squad',
      notes: survivor.notes || 'Sub-surface extraction successful.'
    };

    setRecoveryLogs(prev => [newLog, ...prev]);

    toast("LIFE SECURED // RESCUE SUCCESSFUL", {
      description: `Survivor ${id} successfully extricated. Added to Recovery Log.`,
      icon: <CheckCircle className="text-emerald-400 font-bold" />
    });

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        sender: 'companion',
        text: `🎉 EXTRICATION SUCCESS: Survivor ${id} has been physically retrieved! AI companion telemetry reports vital sign transition to stabilized levels. Operational recovery has been permanently archived in the tactical logs.`,
        timestamp
      }
    ]);
  };

  // 5b. Manual Log Submission (Offline Field Dispatch)
  const handleAddManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSurvivorId.trim() || !manualLocation.trim()) {
      toast.error("MISSING FIELDS", { description: "Survivor ID and location are mandatory for tracking accuracy." });
      return;
    }

    const timestampStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newLog: RecoveryLogEntry = {
      id: `REC-M${Math.floor(100 + Math.random() * 900)}`,
      survivorId: manualSurvivorId.toUpperCase(),
      location: manualLocation,
      depth: manualDepth,
      timestamp: timestampStr,
      statusAtExtraction: manualStatus as any,
      rescuedBy: manualRescuedBy.trim() || 'Manual Patrol Dispatch',
      notes: manualNotes.trim() || 'Offline field recovery recorded manually over comms.'
    };

    setRecoveryLogs(prev => [newLog, ...prev]);
    toast.success("MANUAL RECOVERY REGISTERED", {
      description: `Log for ${manualSurvivorId.toUpperCase()} has been saved successfully.`
    });

    // Reset fields
    setManualSurvivorId('');
    setManualLocation('');
    setManualDepth(2.5);
    setManualStatus('STABLE');
    setManualRescuedBy('');
    setManualNotes('');
    setShowManualLogForm(false);
  };

  // 5c. Exporting Recovery Logs
  const handleExportLogs = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recoveryLogs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `aether_rescue_recovery_log_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("RECOVERY FILE EXPORTED", {
        description: "Tactical operational logs downloaded successfully as JSON."
      });
    } catch (err) {
      toast.error("Export failed");
    }
  };

  // 5d. Remove Log entry
  const handleRemoveLogEntry = (id: string) => {
    setRecoveryLogs(prev => prev.filter(log => log.id !== id));
    toast("LOG DELETED", {
      description: `Recovery log entry ${id} permanently discarded.`
    });
  };

  // 6. Send AI query to Gemini Proxy
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiLoading) return;

    const userText = inputMessage;
    setInputMessage('');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { sender: 'rescuer', text: userText, timestamp }]);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName: 'gemini-3.5-flash',
          contents: [{ parts: [{ text: userText }] }],
          systemInstruction: `You are the "Aether E-DPR (Exoskeletal Debris-Penetrating Radar) Companion".
Your purpose is to act as a highly specialized rescue AI companion that accompanies military personnel, first responders, and emergency units during catastrophic collapses, earthquakes, and crises (such as Ground Zero 9/11).
Your unique technology includes:
1. Debris Penetrating Radar (DPR) which scans steel and pulverised rubble layers.
2. Acoustic micro-resonance arrays that translate heartbeat vibration and scratching sounds into coordinates.
3. Microsensor drone fleets that physical navigate tight crevices to establish O2, water, and vital communication.

Answer the rescuer's questions with an authoritative, technical, deeply supportive, and empathetic tone. Use rich military and rescue engineering terminology (e.g., "void mapping", "slab triangulation", "structural shoring", "acoustic resonance"). Keep responses highly structured and under 150 words. Focus on finding and saving lives, avoiding simulated infrastructure jargon unless it relates directly to concrete density, sonar paths, or life detection.`
        })
      });

      const data = await response.json();
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'companion', 
          text: data.text || "Direct signal link lost. Re-enforcing telemetry loop...", 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'companion',
          text: "⚠️ [SIGNAL FAULT] Heuristic offline routing activated. Structural advice: When scanning heavy reinforced concrete rubble fields like Ground Zero, adjust microwave frequencies to 1.5 GHz to minimize reflections from rebar while locating sub-surface cavities.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const AvgDepth = recoveryLogs.length > 0 
    ? (recoveryLogs.reduce((sum, log) => sum + log.depth, 0) / recoveryLogs.length).toFixed(1) 
    : '0.0';
  const CriticalSaves = recoveryLogs.filter(log => log.statusAtExtraction === 'CRITICAL').length;
  const WeakSaves = recoveryLogs.filter(log => log.statusAtExtraction === 'WEAK').length;

  const filteredLogs = recoveryLogs.filter(log => {
    const query = logSearchQuery.toLowerCase();
    return (
      log.id.toLowerCase().includes(query) ||
      log.survivorId.toLowerCase().includes(query) ||
      log.location.toLowerCase().includes(query) ||
      log.rescuedBy.toLowerCase().includes(query) ||
      log.notes.toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-full flex flex-col bg-black text-zinc-200 font-mono overflow-hidden relative p-4 lg:p-6 select-none">
      {/* Visual background textures */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="absolute inset-0 bg-red-950/5 pointer-events-none z-0" />

      {/* Top Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10 border-b border-red-900/40 pb-4 gap-4">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-red-950/40 border-2 border-red-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.25)] shrink-0 animate-pulse">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-red-500">
                Aether E-DPR
              </h1>
              <span className="bg-red-500 text-black font-black text-[8px] px-1.5 py-0.5 uppercase tracking-widest rounded-sm">
                CRISIS COMPANION
              </span>
            </div>
            <p className="text-[9.5px] text-zinc-500 uppercase tracking-widest mt-0.5">
              Multi-Domain Sub-Surface Imaging & Rescue Drone Orchestrator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSound}
            className={`p-2.5 rounded border flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              soundEnabled 
                ? 'bg-red-950/50 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title="Mute/Unmute active radar acoustic feedback"
          >
            {soundEnabled ? <Volume2 size={14} className="text-red-500" /> : <VolumeX size={14} />}
            <span className="hidden sm:inline">Acoustic Feed</span>
          </button>
          
          <div className="text-right hidden md:block">
            <span className="text-[10px] text-zinc-500 uppercase block">ORBIT_OVERWATCH: ACTIVE</span>
            <span className="text-[8px] text-zinc-650 block">REF: 911-RESCUE-CONTINUOUS</span>
          </div>
        </div>
      </div>

      {/* Main Panel Layout Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-5 overflow-hidden relative z-10 min-h-0">
        
        {/* Left Column: Scanner Panel & Visualizers (7 Columns) */}
        <div className="xl:col-span-7 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 min-h-0">
          
          {/* Module Nav Tabs */}
          <div className="flex border-b border-zinc-900 pb-2 gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('SCANNER')}
              className={`h-9 px-4 text-[10px] font-black uppercase tracking-wider transition-all border rounded-md cursor-pointer flex items-center gap-2 ${
                activeTab === 'SCANNER'
                  ? 'bg-red-950/40 border-red-500 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                  : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Compass size={12} className={activeTab === 'SCANNER' ? 'animate-spin-slow text-red-500' : ''} />
              Overwatch Scan Target Grid
            </button>
            <button
              onClick={() => setActiveTab('RECOVERY_LOG')}
              className={`h-9 px-4 text-[10px] font-black uppercase tracking-wider transition-all border rounded-md cursor-pointer flex items-center gap-2 ${
                activeTab === 'RECOVERY_LOG'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <CheckCircle size={12} className="text-emerald-400" />
              Rescue Recovery logs ({recoveryLogs.length})
            </button>
          </div>

          {activeTab === 'SCANNER' ? (
            <>
              {/* Section: Radar Cross-Section Scanner */}
              <div className="bg-zinc-950 border-2 border-red-950/60 p-4 rounded-xl flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 text-red-900 text-[60px] font-black pointer-events-none select-none tracking-tighter opacity-15">
                  SCAN
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="text-red-500 animate-spin-slow" size={16} />
                    <h2 className="text-[11px] font-black uppercase tracking-wider text-red-400">
                      DEBRIS PENETRATING RADAR TARGETING GRID
                    </h2>
                  </div>
                  <div className="flex gap-1.5">
                    {(['ELECTROMAGNETIC', 'ACOUSTIC', 'THERMAL'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setActiveScanType(type)}
                        className={`px-2 py-0.5 text-[8.5px] font-black tracking-tighter uppercase transition-all rounded-sm cursor-pointer ${
                          activeScanType === type
                            ? 'bg-red-500 text-black'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {type.split('_')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Radar Visual Area */}
                <div className="h-60 bg-black border-2 border-zinc-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                  
                  {/* Radar Grid Lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.1)_0%,transparent_70%)]" />
                  <div className="absolute inset-0 grid grid-cols-10 grid-rows-6 pointer-events-none opacity-20">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div key={i} className="border-[0.5px] border-red-950/40" />
                    ))}
                  </div>

                  {/* Scanning Sweeper Line */}
                  {isScanning && (
                    <motion.div 
                      initial={{ top: '0%' }}
                      animate={{ top: '100%' }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-[3px] bg-red-500/80 shadow-[0_0_15px_rgba(239,68,68,1)] z-10 pointer-events-none"
                    />
                  )}

                  {/* Commemorative Memorial Badge inside the radar */}
                  <div className="absolute bottom-2.5 left-3.5 z-20 flex items-center gap-1.5 bg-red-950/60 border border-red-500/30 px-2 py-1 rounded-md text-[8.5px] font-bold text-red-400">
                    <AlertTriangle size={12} className="text-red-500 animate-pulse" />
                    9/11 MEMORIAL SECTOR: NEVER FORGOTTEN
                  </div>

                  {/* Survivor Indicators mapped to coordinates */}
                  {survivors.map(surv => {
                    const isSelected = selectedSurvivor?.id === surv.id;
                    const isRescued = surv.status === 'RESCUED';
                    return (
                      <motion.button
                        key={surv.id}
                        onClick={() => setSelectedSurvivor(surv)}
                        style={{ left: `${surv.coordinates.x}%`, top: `${surv.coordinates.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-20 cursor-pointer"
                        whileHover={{ scale: 1.15 }}
                      >
                        {/* Ring animation for live survivor */}
                        {!isRescued && (
                          <span className={`absolute inline-flex h-7 w-7 rounded-full opacity-75 animate-ping ${
                            surv.status === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'
                          }`} />
                        )}

                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all shadow-[0_0_15px_rgba(0,0,0,0.8)] ${
                          isRescued 
                            ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                            : isSelected 
                              ? 'bg-red-500 border-white' 
                              : surv.status === 'CRITICAL' 
                                ? 'bg-red-950 border-red-500 animate-pulse' 
                                : 'bg-amber-950 border-amber-500'
                        }`}>
                          <Heart size={10} className={`text-white ${!isRescued && 'animate-pulse'}`} />
                        </div>

                        <span className={`text-[7px] font-black px-1 rounded uppercase tracking-wider mt-1 border shadow-sm ${
                          isRescued 
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                            : isSelected 
                              ? 'bg-red-500 text-black border-white' 
                              : surv.status === 'CRITICAL' 
                                ? 'bg-red-900 text-red-200 border-red-500/30' 
                                : 'bg-zinc-900 text-amber-300 border-amber-500/20'
                        }`}>
                          {surv.id} {isRescued ? '✓' : ''}
                        </span>
                      </motion.button>
                    );
                  })}

                  {/* No Signal Indicator */}
                  {survivors.length === 0 && (
                    <div className="text-center">
                      <ShieldAlert className="mx-auto text-zinc-700 mb-2" size={32} />
                      <p className="text-[10px] text-zinc-500 uppercase">Aether scanning sensors offline. Re-align drone orbit.</p>
                    </div>
                  )}
                </div>

                {/* Scanning Activation Controls */}
                <div className="flex gap-3 items-center mt-3 bg-black border border-zinc-900 p-2.5 rounded-lg">
                  <button
                    onClick={handleTriggerScan}
                    disabled={isScanning}
                    className={`h-9 px-4 font-black text-[10px] uppercase tracking-widest rounded-md transition-all flex items-center gap-2 cursor-pointer border ${
                      isScanning 
                        ? 'bg-red-950/20 border-red-500/30 text-red-500 grayscale' 
                        : 'bg-red-600 border-red-500 text-black hover:bg-red-500 active:scale-[0.98] shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    }`}
                  >
                    <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
                    {isScanning ? `Scattered Scattering... ${scanProgress}%` : 'Initiate Sub-surface Pulse Scan'}
                  </button>

                  <div className="flex-1 text-[8.5px] uppercase text-zinc-500 leading-normal">
                    {isScanning ? (
                      <span className="text-red-400 animate-pulse font-bold block">
                        EMITTING ELECTROMAGNETIC WAVE PROPAGATION THROUGH RUBBLE...
                      </span>
                    ) : (
                      <span>Ready to sweep target rubble debris field. Depth penetrations calibrated to 15 meters.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Selected Survivor Insight */}
              {selectedSurvivor && (
                <div className="bg-zinc-950 border-2 border-zinc-900 p-4 rounded-xl relative overflow-hidden animate-in fade-in duration-300">
                  <div className="flex justify-between items-start mb-3 border-b border-zinc-900 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Heart className="text-red-500 animate-pulse" size={14} />
                      <div>
                        <h3 className="text-xs font-black uppercase text-white">
                          VOICE & RESIDUAL CAVITY METRICS: {selectedSurvivor.id}
                        </h3>
                        <p className="text-[8px] text-zinc-500 uppercase">{selectedSurvivor.sector}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm border ${
                        selectedSurvivor.status === 'RESCUED' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30' :
                        selectedSurvivor.status === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-500/30 animate-pulse' :
                        'bg-amber-950 text-amber-400 border-amber-500/30'
                      }`}>
                        {selectedSurvivor.status}
                      </span>
                    </div>
                  </div>

                  {/* Vital parameters grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-black border border-zinc-900 p-2 rounded-lg">
                      <span className="text-[7.5px] text-zinc-500 uppercase block">Sub-surface Depth</span>
                      <span className="text-sm font-black text-white">{selectedSurvivor.depth} Meters</span>
                      <span className="text-[6.5px] text-zinc-600 uppercase block">Radar Reflection</span>
                    </div>
                    <div className="bg-black border border-zinc-900 p-2 rounded-lg">
                      <span className="text-[7.5px] text-zinc-500 uppercase block">Acoustic Heartbeat</span>
                      <span className="text-sm font-black text-red-400 animate-pulse">{selectedSurvivor.vitals.heartRate} BPM</span>
                      <span className="text-[6.5px] text-zinc-600 uppercase block">Piezoelectric Sensor</span>
                    </div>
                    <div className="bg-black border border-zinc-900 p-2 rounded-lg">
                      <span className="text-[7.5px] text-zinc-500 uppercase block">Respiration Rate</span>
                      <span className="text-sm font-black text-blue-400">{selectedSurvivor.vitals.respiration} /Min</span>
                      <span className="text-[6.5px] text-zinc-600 uppercase block">Carbon Dioxide Sniffer</span>
                    </div>
                    <div className="bg-black border border-zinc-900 p-2 rounded-lg">
                      <span className="text-[7.5px] text-zinc-500 uppercase block">Metabolic Temp</span>
                      <span className="text-sm font-black text-amber-500">{selectedSurvivor.vitals.temperature}°C</span>
                      <span className="text-[6.5px] text-zinc-600 uppercase block">Cavity Thermal Array</span>
                    </div>
                  </div>

                  {/* Description & Action items */}
                  <div className="text-[9px] bg-black p-3 border border-zinc-900 rounded-lg text-zinc-400 leading-relaxed uppercase mb-4">
                    <strong>COMPANION SCANNER NOTES:</strong> {selectedSurvivor.notes}
                  </div>

                  {/* Action row */}
                  <div className="flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-zinc-500 uppercase font-black">Assign Companion:</span>
                      <div className="flex gap-1.5">
                        {companions
                          .filter(c => c.status === 'STANDBY' || c.status === 'IDLE')
                          .map(comp => (
                            <button
                              key={comp.id}
                              onClick={() => handleAssignCompanion(selectedSurvivor.id, comp.name)}
                              className="px-2 py-1 bg-red-950/40 hover:bg-red-900/30 border border-red-500/30 text-red-400 text-[8px] font-black uppercase rounded transition-all cursor-pointer"
                            >
                              + {comp.name}
                            </button>
                        ))}
                        {companions.filter(c => c.status === 'STANDBY' || c.status === 'IDLE').length === 0 && (
                          <span className="text-[7px] text-zinc-650 uppercase">No drone standby. Recall companion first.</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {selectedSurvivor.status !== 'RESCUED' && (
                        <button
                          onClick={() => handleSecureSurvivor(selectedSurvivor.id)}
                          className="h-7 px-3 bg-emerald-600 border border-emerald-500 hover:bg-emerald-500 text-black text-[9px] font-black uppercase rounded transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle size={10} />
                          Mark Secured & Extricated
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedSurvivor(null)}
                        className="h-7 px-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] font-black uppercase rounded hover:text-white transition-all cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Historical Crises & Lessons Inherited */}
              <div className="bg-zinc-950 border-2 border-zinc-900 p-4 rounded-xl flex flex-col relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <History className="text-zinc-500" size={14} />
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                    HISTORICAL CRITICAL LESSONS DATABASE // RESOLVING EVENTS LIKE 9-11
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {historicalCrises.map(crisis => (
                    <div key={crisis.id} className="bg-black border border-zinc-900 hover:border-zinc-800 p-3 rounded-lg transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="text-[7px] font-black text-red-500 bg-red-950/50 border border-red-500/20 px-1 rounded uppercase">
                            {crisis.year} CRISIS
                          </span>
                          <span className="text-[7px] text-zinc-600 font-mono">SEV: {crisis.debrisSeverity}</span>
                        </div>
                        <h4 className="text-[10px] font-black text-white uppercase mb-1">{crisis.title}</h4>
                        <p className="text-[7.5px] text-zinc-500 uppercase leading-relaxed mb-2">{crisis.description}</p>
                      </div>
                      <div className="border-t border-zinc-900 pt-2 mt-1">
                        <span className="text-[7px] font-black text-amber-500 uppercase block mb-0.5">COMPANION DIRECTIVE</span>
                        <p className="text-[7.5px] text-zinc-400 uppercase leading-snug">{crisis.lesson}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Recovery Log Hub Tab view */
            <div className="bg-zinc-950 border-2 border-emerald-950/60 p-4 rounded-xl flex flex-col gap-4 relative overflow-hidden animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-3 gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-emerald-500 animate-pulse" size={16} />
                  <div>
                    <h2 className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                      TACTICAL RECOVERY LOG & SECURED LIVES REGISTER
                    </h2>
                    <p className="text-[8px] text-zinc-500 uppercase">Operational timestamped data for military command accountability</p>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleExportLogs}
                    className="h-8 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-emerald-400 text-[9px] font-black uppercase rounded transition-all cursor-pointer flex items-center gap-1.5"
                    title="Export operational log database to JSON file"
                  >
                    <span>↓</span> Export DB
                  </button>
                  <button
                    onClick={() => setShowManualLogForm(!showManualLogForm)}
                    className="h-8 px-3 bg-emerald-600 text-black hover:bg-emerald-500 text-[9px] font-black uppercase rounded transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  >
                    <span>+</span> {showManualLogForm ? 'Close Form' : 'Register Offline'}
                  </button>
                </div>
              </div>

              {/* Stat Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-black border border-zinc-900 p-2.5 rounded-lg flex flex-col">
                  <span className="text-[7.5px] text-zinc-500 uppercase block font-black">TOTAL RETRIEVED</span>
                  <span className="text-base font-black text-emerald-400 mt-1">{recoveryLogs.length} LIVES</span>
                  <span className="text-[6.5px] text-zinc-600 uppercase mt-0.5">S-99/104 EXTRACTED</span>
                </div>
                <div className="bg-black border border-zinc-900 p-2.5 rounded-lg flex flex-col">
                  <span className="text-[7.5px] text-zinc-500 uppercase block font-black">AVG RUBBLE DEPTH</span>
                  <span className="text-base font-black text-white mt-1">{AvgDepth} METERS</span>
                  <span className="text-[6.5px] text-zinc-600 uppercase mt-0.5">CAVITY DEEPEST AT 7.2m</span>
                </div>
                <div className="bg-black border border-zinc-900 p-2.5 rounded-lg flex flex-col">
                  <span className="text-[7.5px] text-zinc-500 uppercase block font-black">CRITICAL SAVES</span>
                  <span className="text-base font-black text-red-500 mt-1">{CriticalSaves} LIVES</span>
                  <span className="text-[6.5px] text-zinc-600 uppercase mt-0.5">CRITICAL PRIORITY ALPHA</span>
                </div>
                <div className="bg-black border border-zinc-900 p-2.5 rounded-lg flex flex-col">
                  <span className="text-[7.5px] text-zinc-500 uppercase block font-black">WEAK STATUS SECURED</span>
                  <span className="text-base font-black text-amber-500 mt-1">{WeakSaves} LIVES</span>
                  <span className="text-[6.5px] text-zinc-600 uppercase mt-0.5">STABILIZED IN FIELD</span>
                </div>
              </div>

              {/* Manual Entry Form */}
              {showManualLogForm && (
                <form onSubmit={handleAddManualLog} className="bg-black border border-zinc-800 p-4 rounded-xl flex flex-col gap-3.5 relative overflow-hidden animate-in slide-in-from-top-3 duration-300">
                  <div className="absolute top-0 right-0 p-1 text-zinc-800 text-[40px] font-black pointer-events-none select-none tracking-tighter opacity-10">
                    MANUAL
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <h3 className="text-[10px] font-black uppercase text-emerald-400">
                      REGISTER MANUAL/OFFLINE LIVES RECOVERED
                    </h3>
                    <span className="text-[7px] text-zinc-500 font-mono">INCIDENT-TRACKING: OFFLINE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[7.5px] text-zinc-500 uppercase font-black block mb-1">SURVIVOR SIGNATURE ID *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. S-105"
                        value={manualSurvivorId} 
                        onChange={e => setManualSurvivorId(e.target.value)} 
                        className="w-full h-8 bg-zinc-950 border border-zinc-800 rounded px-2.5 text-[10px] text-zinc-200 placeholder-zinc-700 uppercase focus:outline-none focus:border-emerald-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[7.5px] text-zinc-500 uppercase font-black block mb-1">DEBRIS LOCATION SECTOR *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Sector G-1 (North Wing)"
                        value={manualLocation} 
                        onChange={e => setManualLocation(e.target.value)} 
                        className="w-full h-8 bg-zinc-950 border border-zinc-800 rounded px-2.5 text-[10px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[7.5px] text-zinc-500 uppercase font-black block mb-1">EXTRACTION DEPTH (METERS)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={manualDepth} 
                        onChange={e => setManualDepth(parseFloat(e.target.value) || 0)} 
                        className="w-full h-8 bg-zinc-950 border border-zinc-800 rounded px-2.5 text-[10px] text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-[7.5px] text-zinc-500 uppercase font-black block mb-1">STATUS AT EXTRACTION</label>
                      <select 
                        value={manualStatus} 
                        onChange={e => setManualStatus(e.target.value as any)}
                        className="w-full h-8 bg-zinc-950 border border-zinc-800 rounded px-2 text-[10px] text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="STABLE">STABLE</option>
                        <option value="WEAK">WEAK</option>
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="UNKNOWN">UNKNOWN</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[7.5px] text-zinc-500 uppercase font-black block mb-1">RESCUED BY (UNIT / SQUADRON)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. TF-9 Heavy Rescue Battalion & Scout-02"
                      value={manualRescuedBy} 
                      onChange={e => setManualRescuedBy(e.target.value)} 
                      className="w-full h-8 bg-zinc-950 border border-zinc-800 rounded px-2.5 text-[10px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[7.5px] text-zinc-500 uppercase font-black block mb-1">TACTICAL EXTRACTION NOTES</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. Void shoring implemented. Survivor conscious with minor physical debris burns..."
                      value={manualNotes} 
                      onChange={e => setManualNotes(e.target.value)} 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-[10px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 uppercase"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="h-8 bg-emerald-600 hover:bg-emerald-500 text-black text-[9.5px] font-black uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>✓</span> Confirm & File Recovery Record
                  </button>
                </form>
              )}

              {/* Search & Filter bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-650" size={11} />
                <input 
                  type="text" 
                  placeholder="FILTER RECOVERY REGISTRY BY SIGNATURE, SECTOR, OR EXTRACTION UNIT..."
                  value={logSearchQuery}
                  onChange={e => setLogSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 bg-black border border-zinc-900 focus:border-emerald-500/50 rounded-lg text-[9px] uppercase tracking-wider text-white placeholder-zinc-700 focus:outline-none"
                />
              </div>

              {/* Table / List element */}
              <div className="border border-zinc-900 rounded-lg overflow-hidden bg-black max-h-[380px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950 text-[7.5px] text-zinc-500 uppercase tracking-wider border-b border-zinc-900 font-bold">
                      <th className="p-2.5">LOG ID</th>
                      <th className="p-2.5">SURVIVOR</th>
                      <th className="p-2.5">TIMESTAMP</th>
                      <th className="p-2.5">SECTOR / DEPTH</th>
                      <th className="p-2.5">STATUS</th>
                      <th className="p-2.5">RESCUE UNIT</th>
                      <th className="p-2.5 text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-[8px] uppercase">
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-zinc-950/50 transition-all">
                        <td className="p-2.5 text-emerald-400 font-black">{log.id}</td>
                        <td className="p-2.5 text-white font-black">{log.survivorId}</td>
                        <td className="p-2.5 text-zinc-500 text-[7px]">{log.timestamp}</td>
                        <td className="p-2.5 leading-snug">
                          <span className="text-zinc-200 font-semibold block">{log.location}</span>
                          <span className="text-zinc-500 text-[7px] font-normal">{log.depth} METERS DEPTH</span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.5 rounded-sm text-[6.5px] font-black tracking-widest border ${
                            log.statusAtExtraction === 'STABLE' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/20' :
                            log.statusAtExtraction === 'WEAK' ? 'bg-amber-950 text-amber-400 border-amber-500/20' :
                            log.statusAtExtraction === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-500/20 animate-pulse' :
                            'bg-zinc-900 text-zinc-400 border-zinc-800'
                          }`}>
                            {log.statusAtExtraction}
                          </span>
                        </td>
                        <td className="p-2.5 text-zinc-400 font-medium">{log.rescuedBy}</td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleRemoveLogEntry(log.id)}
                            className="p-1 hover:text-red-500 text-zinc-700 text-[10px] font-black transition-all cursor-pointer"
                            title="Purge log record"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-650 uppercase tracking-widest text-[8px]">
                          No recovery records found matching active filter queries.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Info alert footer */}
              <div className="flex items-start gap-2 bg-emerald-950/10 border border-emerald-500/10 p-2.5 rounded-lg text-[7.5px] uppercase text-zinc-500 leading-normal">
                <Info size={12} className="text-emerald-500 shrink-0" />
                <span>
                  The Aether Rescue Companion automatically uploads and archives metadata to this terminal upon clicking "Mark Secured & Extricated". Always verify depth triangulations and secure physical logs to assist civilian medical transition teams.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Active Drone Diagnostics & Gemini Chat (5 Columns) */}
        <div className="xl:col-span-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 min-h-0">
          
          {/* Section: Drone Fleet Dashboard */}
          <div className="bg-zinc-950 border-2 border-zinc-900 p-4 rounded-xl flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="text-red-400" size={14} />
                <h3 className="text-[11px] font-black uppercase tracking-wider text-red-400">
                  RESCUE DRONE FLEET & ACOUSTIC COGNITION
                </h3>
              </div>
              <span className="text-[8px] text-zinc-600 font-black">4 CHASSIS ACTIVE</span>
            </div>

            {/* Drone status items list */}
            <div className="flex flex-col gap-2.5">
              {companions.map(comp => (
                <div key={comp.id} className="bg-black border border-zinc-900 p-2.5 rounded-lg flex items-center justify-between hover:border-zinc-800 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <Zap size={14} className={comp.status === 'DEPLOYED' ? 'text-amber-500 animate-pulse' : 'text-zinc-600'} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-white uppercase">{comp.name}</span>
                        <span className="text-[6px] text-zinc-600 bg-zinc-900 px-1 rounded font-bold uppercase">{comp.type}</span>
                      </div>
                      <p className="text-[7.5px] text-zinc-500 truncate uppercase mt-0.5">
                        {comp.currentTask ? `Task: ${comp.currentTask}` : 'Status: Idle & Standby'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        comp.status === 'DEPLOYED' ? 'bg-red-500 animate-pulse' : 
                        comp.status === 'STANDBY' ? 'bg-amber-500' : 'bg-zinc-750'
                      }`} />
                      <span className="text-[8px] font-black text-zinc-400 uppercase">{comp.status}</span>
                    </div>
                    <span className={`text-[8.5px] font-mono block ${comp.battery < 30 ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
                      🔋 {comp.battery}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Live Interactive Dialogue Panel with Rescuer Companion (AI) */}
          <div className="bg-zinc-950 border-2 border-red-950/60 p-4 rounded-xl flex-1 flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
              <div className="flex items-center gap-2">
                <Users className="text-red-500" size={14} />
                <h3 className="text-[11px] font-black uppercase tracking-wider text-red-400">
                  EXOSKELETAL COMMANDER DIALOGUE LINK
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-red-950/30 px-2 py-0.5 border border-red-500/20 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[7px] font-black text-red-400 uppercase">SIGNAL SYNCED</span>
              </div>
            </div>

            {/* Messages box */}
            <div className="flex-1 bg-black border border-zinc-900 rounded-lg p-3 overflow-y-auto custom-scrollbar flex flex-col gap-3 min-h-0 mb-3">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col max-w-[90%] ${
                    msg.sender === 'rescuer' ? 'align-end ml-auto' : 'mr-auto'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 justify-between text-[7px] text-zinc-600 font-bold uppercase">
                    <span>{msg.sender === 'rescuer' ? 'RESCUE CONTROLLER' : 'AI COMPANION E-DPR'}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border text-[8.5px] uppercase leading-normal tracking-wide ${
                    msg.sender === 'rescuer' 
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-200 rounded-tr-none' 
                      : 'bg-red-950/20 border-red-500/30 text-red-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex items-center gap-2 mr-auto bg-red-950/10 border border-red-500/15 p-2 rounded-lg text-red-400 text-[8px] font-bold uppercase animate-pulse">
                  <RefreshCw size={10} className="animate-spin" />
                  Triangulating acoustic feedback models...
                </div>
              )}
            </div>

            {/* Query Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Ask companion (e.g. 'Safe Concrete breaching', 'Rescue directive Ground Zero')..."
                className="flex-1 h-9 bg-black border border-zinc-900 focus:border-red-500/50 rounded-lg px-3 text-[9px] uppercase tracking-wider text-white placeholder-zinc-700 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isAiLoading}
                className="w-12 h-9 bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:pointer-events-none text-black rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.2)]"
              >
                <Send size={12} />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
