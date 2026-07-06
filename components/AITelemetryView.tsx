import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Network, 
  Cpu, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Layers, 
  Terminal, 
  Play, 
  Pause, 
  RefreshCw, 
  Sliders, 
  Send, 
  User, 
  Sparkles, 
  Clock, 
  Database,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ==========================================
// TYPE DEFINITIONS FOR AI OPENTELEMETRY SPANS
// ==========================================
export interface OpenTelemetrySpan {
  id: string; // Span ID, e.g. 16-hex characters
  name: string; // Context naming
  parentSpanId?: string; // Parent linking for hierarchy
  kind: 'INTERNAL' | 'CLIENT' | 'SERVER' | 'PRODUCER';
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
  status: {
    code: 'OK' | 'ERROR' | 'UNSET';
    message?: string;
  };
  attributes: {
    'ai.agent.name': string;
    'ai.agent.role': string;
    'ai.prompt.tokens'?: number;
    'ai.response.tokens'?: number;
    'ai.model': string;
    'ai.temperature'?: number;
    'telemetry.sdk.language': string;
    'telemetry.sdk.name': string;
    'otel.library.name': string;
    'otel.library.version': string;
    [key: string]: any;
  };
  events: Array<{
    name: string;
    timestampMs: number;
    attributes?: Record<string, any>;
  }>;
}

export interface AgentEntity {
  id: string;
  name: string;
  role: string;
  accentClass: string;
  avatarIcon: React.ReactNode;
  promptDirective: string;
}

export interface TraceRecord {
  traceId: string;
  name: string;
  timestamp: number;
  spans: OpenTelemetrySpan[];
  isSampled: boolean;
}

export const AITelemetryView: React.FC = () => {
  // Telemetry simulation configs
  const [samplerRate, setSamplerRate] = useState<number>(1.0); // 0.0 to 1.0
  const [injectLatency, setInjectLatency] = useState<boolean>(false);
  const [injectErrors, setInjectErrors] = useState<boolean>(false);
  const [propagationHeader, setPropagationHeader] = useState<string>('W3C_TRACE_CONTEXT'); // 'W3C_ID' or 'B3_MULTI'
  const [autoCycle, setAutoCycle] = useState<boolean>(true);
  
  // Conversation topics & customized directives
  const [currentTopic, setCurrentTopic] = useState<string>('LATTICE_CONJUNCTION');
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [customPromptEnabled, setCustomPromptEnabled] = useState<boolean>(false);

  // Active records & select states
  const [traces, setTraces] = useState<TraceRecord[]>([]);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);
  const [throughputMetrics, setThroughputMetrics] = useState<Array<{ time: string; spans: number; errors: number; latency: number }>>([]);

  // AI Seats around Central Node Config and state
  const [selectedSeatId, setSelectedSeatId] = useState<string>('google');
  const [quantization, setQuantization] = useState<'FP16' | 'INT8' | 'INT4'>('INT8');
  const [liberalField, setLiberalField] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [signalAnimationActive, setSignalAnimationActive] = useState<boolean>(false);

  interface AISeatModel {
    id: string;
    name: string;
    provider: string;
    description: string;
    techSpecs: string;
    colorClass: string;
    glowClass: string;
    icon: string;
    angleOffset: number;
  }

  const aiSeatsList: AISeatModel[] = [
    {
      id: 'google',
      name: 'Gemini 2.5 Flash',
      provider: 'Google (Sovereign Primary)',
      description: 'Multimodal powerhouse featuring high speed and absolute reasoning bounds.',
      techSpecs: 'FP16 • Native Multimodal • 1.2M Context',
      colorClass: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/50',
      glowClass: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]',
      icon: '💎',
      angleOffset: 0
    },
    {
      id: 'claude',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic (The Weaver)',
      description: 'Thoughtful compiler of code and structured analysis.',
      techSpecs: 'FP16 • Advanced Coding Spec • 200k Context',
      colorClass: 'text-amber-500 bg-amber-950/40 border-amber-500/50',
      glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      icon: '🍁',
      angleOffset: 60
    },
    {
      id: 'openai',
      name: 'GPT-4o (The Oracle)',
      provider: 'Microsoft / OpenAI',
      description: 'Fast, high-quality general intelligence and conversation hub.',
      techSpecs: '8-bit Quantized • Multimodal Audio • 128k Context',
      colorClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/50',
      glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]',
      icon: '🌀',
      angleOffset: 120
    },
    {
      id: 'llama',
      name: 'Llama 3 70B',
      provider: 'Meta (Open Source Rebel)',
      description: 'High-performance open weights model running locally.',
      techSpecs: 'INT8 • Locally Hosted • 64k Context',
      colorClass: 'text-blue-400 bg-blue-950/40 border-blue-500/50',
      glowClass: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]',
      icon: '🦙',
      angleOffset: 180
    },
    {
      id: 'mistral',
      name: 'Mistral Large',
      provider: 'Mistral AI (European Alliance)',
      description: 'Dense Mixture of Experts (MoE) with supreme logical weight.',
      techSpecs: 'INT4 • Sparse Activation • 32k Context',
      colorClass: 'text-purple-400 bg-purple-950/40 border-purple-500/50',
      glowClass: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]',
      icon: '🌪️',
      angleOffset: 240
    },
    {
      id: 'deepseek',
      name: 'DeepSeek R1',
      provider: 'DeepSeek (Quantized Reasoning)',
      description: 'Advanced reasoning and search grounding specialist.',
      techSpecs: 'INT4 • Active MoE • 128k Context',
      colorClass: 'text-rose-400 bg-rose-950/40 border-rose-500/50',
      glowClass: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]',
      icon: '🧬',
      angleOffset: 300
    }
  ];

  // Determine orbital radius based on Liberal Field setting
  const getRadius = () => {
    switch (liberalField) {
      case 'LOW': return 95;
      case 'MEDIUM': return 130;
      case 'HIGH': return 165;
    }
  };

  // Determine scale of nodes based on Quantization setting
  const getNodeScale = () => {
    switch (quantization) {
      case 'FP16': return 1.15;
      case 'INT8': return 0.95;
      case 'INT4': return 0.75;
    }
  };

  // Log notifications for console
  const [logs, setLogs] = useState<string[]>([]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // AI Agent Definitions
  const agents: AgentEntity[] = [
    {
      id: 'omni_llm',
      name: 'OmniNexus-Prime',
      role: 'Orchestrator',
      accentClass: 'border-cyan-500 text-cyan-400 focus:border-cyan-400 bg-cyan-950/20',
      avatarIcon: <Cpu className="w-4 h-4 text-cyan-400" />,
      promptDirective: 'Enforces optimal query tokenization, task distribution and logical convergence across lattice hubs.'
    },
    {
      id: 'security_gate',
      name: 'Sentinel-Vanguard',
      role: 'Sovereign Shield Guard',
      accentClass: 'border-red-500 text-red-400 focus:border-red-400 bg-red-950/20',
      avatarIcon: <ShieldCheck className="w-4 h-4 text-red-400" />,
      promptDirective: 'Audits trace parent context propagation headers for cryptographic integrity vulnerabilities and sandbox warnings.'
    },
    {
      id: 'chronos_time',
      name: 'Chronos-Sync',
      role: 'Symphonic Timekeeper',
      accentClass: 'border-purple-500 text-purple-400 focus:border-purple-400 bg-purple-950/20',
      avatarIcon: <Clock className="w-4 h-4 text-purple-400" />,
      promptDirective: 'Enforces high-definition millisecond timestamp parity, span correlation alignments, and clock drift mitigation.'
    },
    {
      id: 'lattice_transceiver',
      name: 'Aether-Transceiver',
      role: 'OTLP Transport Layer',
      accentClass: 'border-emerald-500 text-emerald-400 focus:border-emerald-400 bg-emerald-950/20',
      avatarIcon: <Network className="w-4 h-4 text-emerald-400" />,
      promptDirective: 'Validates structure-to-JSON OTLP payloads in reference serialization models to maintain lossless state telemetry.'
    }
  ];

  // System pre-determined dialogue scripts database mapping the topics
  const topicsConversation: Record<string, Array<{ agentId: string; content: string; operationName: string }>> = {
    'LATTICE_CONJUNCTION': [
      {
        agentId: 'omni_llm',
        content: "Initiating absolute orchestration scan. Resolving topological latency paths across peer conjunction hubs.",
        operationName: "evaluateLatencyBounds"
      },
      {
        agentId: 'lattice_transceiver',
        content: "Trace context mapped! I have packed the root propagation headers containing tracing ID 4bf92f3577b34da6a3ce929d0e0e4736. Generating OTLP spans.",
        operationName: "injectPropagationHeaders"
      },
      {
        agentId: 'chronos_time',
        content: "Clock alignment calibrated. Temporal metrics show low jitter: deviation is within 0.043ms. Absolute accuracy stabilized.",
        operationName: "measureClockParity"
      },
      {
        agentId: 'security_gate',
        content: "Analyzing span credentials pattern. Checkpoint passed. Safe transaction metadata logged. No unencrypted secrets detected.",
        operationName: "auditTraceSecrets"
      }
    ],
    'SECURITY_COMPLIANCE': [
      {
        agentId: 'security_gate',
        content: "Sovereign audit layer is engaged. I am scanning all child components for sandbox-restricted WebAuthn calls.",
        operationName: "assertSovereignCompliance"
      },
      {
        agentId: 'omni_llm',
        content: "Re-allocating model priority to deploy native biometrics fallbacks. Compensating sandbox constraints gracefully.",
        operationName: "adaptModelArchitecture"
      },
      {
        agentId: 'lattice_transceiver',
        content: "Propagating emergency fallback state span (ID: d99211a78b5e). Serialized trace payload successfully dispatched to secondary backup ledger.",
        operationName: "serializeMfaBypassPayload"
      },
      {
        agentId: 'chronos_time',
        content: "Bypass transition took 45ms. Performance span marked as compliant with Sovereignty standards.",
        operationName: "verifyBypassDuration"
      }
    ],
    'CLOCK_DRIFT': [
      {
        agentId: 'chronos_time',
        content: "Drift warning! Host OS clock reports a slow phase slip of +12.4ms. Executing atomic synchronization sweep.",
        operationName: "synchronizeAtomicClock"
      },
      {
        agentId: 'omni_llm',
        content: "Acknowledged. Halting state mutations on dependent branches to avoid database index collisions.",
        operationName: "quiesceActiveThreads"
      },
      {
        agentId: 'lattice_transceiver',
        content: "Pushing context span 'chronos.sync.epoch' with UTC standard metric to all listening nodes.",
        operationName: "broadcastEpochAnchor"
      },
      {
        agentId: 'security_gate',
        content: "Cryptographic validation key generated. Timestamp anchors successfully locked to prevent replay spoofing vectors.",
        operationName: "signTimestampEpoch"
      }
    ]
  };

  // Helper sound function matching custom sound design
  const playBeep = (freq = 800, type: OscillatorType = 'sine', duration = 0.08) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  };

  // Bootstrap metrics & initial traces
  useEffect(() => {
    // Generate dummy metrics data
    const initialMetrics = Array.from({ length: 15 }).map((_, i) => ({
      time: `T-${15 - i}s`,
      spans: Math.floor(Math.random() * 20) + 10,
      errors: Math.floor(Math.random() * 2),
      latency: Math.floor(Math.random() * 100) + 50
    }));
    setThroughputMetrics(initialMetrics);

    // Initial logs
    writeLog("Initiating Telemetry Node...");
    writeLog("OpenTelemetry TS-SDK client initialized. Collector: localhost:4318 (HTTP/JSON)");
    
    // Auto populate one initial Trace
    runTelemetryCycle(true);
  }, []);

  const isFirstTelemetryLogsRef = useRef(true);

  // Bottom scroll watcher for debugger text console
  useEffect(() => {
    const element = consoleBottomRef.current;
    if (element && element.parentElement) {
      const container = element.parentElement;
      const selection = window.getSelection();
      const hasSelection = selection && selection.toString();
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
      
      if (isFirstTelemetryLogsRef.current || (isNearBottom && !hasSelection)) {
        element.scrollIntoView({ behavior: 'smooth' });
        isFirstTelemetryLogsRef.current = false;
      }
    } else if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Interval loop for automated conversation cycle
  useEffect(() => {
    if (!autoCycle) return;
    const interval = setInterval(() => {
      runTelemetryCycle();
    }, 12000);
    return () => clearInterval(interval);
  }, [autoCycle, samplerRate, injectLatency, injectErrors, propagationHeader, currentTopic, customTopicInput, customPromptEnabled]);

  const writeLog = (msg: string) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  // Run dynamic trace creation
  const runTelemetryCycle = (isInitial = false) => {
    // 1. Check Sampler Rate
    const randSample = Math.random();
    const isSampled = randSample <= samplerRate;

    const traceId = Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18);
    const traceName = customPromptEnabled ? (customTopicInput || 'Custom Dialogue Thread') : `${currentTopic.replace('_', ' ')} Thread`;

    if (!isSampled) {
      writeLog(`Trace [ID: ..${traceId.slice(-6)}] discarded by Head-and-Tail Trace Sampler (fraction = ${samplerRate.toFixed(1)})`);
      return;
    }

    playBeep(920, 'sine', 0.12);

    // Get dialog inputs
    let rawDialogs: Array<{ agentId: string; content: string; operationName: string }> = [];

    if (customPromptEnabled && customTopicInput.trim() !== '') {
      // Intelligently parse custom input into multiple turns mapping each agent
      rawDialogs = [
        {
          agentId: 'omni_llm',
          content: `Analyzing prompt context: "${customTopicInput}". Synthesizing logical node strategy.`,
          operationName: "orchestrateCustomRequest"
        },
        {
          agentId: 'lattice_transceiver',
          content: `Translating context parameters into payload metadata. Building tracing context propagation.`,
          operationName: "mapCustomParameters"
        },
        {
          agentId: 'chronos_time',
          content: `All actions aligned sequentially. Generating timestamp coordinate envelopes matching active user time-sync.`,
          operationName: "correlateChronology"
        },
        {
          agentId: 'security_gate',
          content: `Strict policy validation performed. No structural violations detected inside context elements. Payload cleared.`,
          operationName: "validateCorePolicy"
        }
      ];
    } else {
      rawDialogs = topicsConversation[currentTopic] || topicsConversation['LATTICE_CONJUNCTION'];
    }

    let absoluteStartTime = Date.now() - (injectLatency ? 1500 : 200);
    const generatedSpans: OpenTelemetrySpan[] = [];
    let rootSpanId = Math.random().toString(16).substring(2, 18);

    // Build complete tree of OpenTelemetry Spans conforming to raw trace schema
    rawDialogs.forEach((dialog, index) => {
      const spanId = index === 0 ? rootSpanId : Math.random().toString(16).substring(2, 18);
      const isError = injectErrors && index === 1; // Inject errors into 1st trace child index
      
      const latencyModifier = injectLatency ? (Math.floor(Math.random() * 400) + 300) : (Math.floor(Math.random() * 45) + 12);
      const startTime = absoluteStartTime + (index * 40);
      const endTime = startTime + latencyModifier;

      const matchedAgent = agents.find(a => a.id === dialog.agentId) || agents[0];

      const newSpan: OpenTelemetrySpan = {
        id: spanId,
        name: dialog.operationName,
        parentSpanId: index === 0 ? undefined : rootSpanId,
        kind: index === 0 ? 'SERVER' : 'INTERNAL',
        startTimeMs: startTime,
        endTimeMs: endTime,
        durationMs: endTime - startTime,
        status: {
          code: isError ? 'ERROR' : 'OK',
          message: isError ? 'SOVEREIGN_CONTEXT_INLINE_FAILURE: Network state buffer underflow' : undefined
        },
        attributes: {
          'ai.agent.name': matchedAgent.name,
          'ai.agent.role': matchedAgent.role,
          'ai.prompt.tokens': Math.floor(Math.random() * 120) + 80,
          'ai.response.tokens': Math.floor(Math.random() * 250) + 150,
          'ai.model': 'gemini-3.5-flash',
          'ai.temperature': customPromptEnabled ? 0.8 : 0.4,
          'telemetry.sdk.language': 'typescript',
          'telemetry.sdk.name': '@opentelemetry/sdk-trace-web',
          'otel.library.name': 'sovereign-ai-propagator',
          'otel.library.version': '1.3.1',
          'ai.agent.dialog': dialog.content,
          'otel.propagation.header': propagationHeader,
          'system.load.factor': '0.34'
        },
        events: [
          {
            name: "prompt_submitted",
            timestampMs: startTime + 5,
            attributes: { "ai.tokens.count": 92 }
          },
          {
            name: "model_streaming_response",
            timestampMs: startTime + Math.floor(latencyModifier / 2)
          }
        ]
      };

      generatedSpans.push(newSpan);
    });

    const newTrace: TraceRecord = {
      traceId,
      name: traceName,
      timestamp: Date.now(),
      spans: generatedSpans,
      isSampled: true
    };

    setTraces(prev => [newTrace, ...prev.slice(0, 19)]);
    
    if (isInitial || !selectedTraceId) {
      setSelectedTraceId(traceId);
      setSelectedSpanId(generatedSpans[0].id);
    }

    // Append to live charts
    setThroughputMetrics(prev => {
      const nextTime = new Date().toLocaleTimeString().slice(11, 19);
      const newElem = {
        time: nextTime,
        spans: generatedSpans.length,
        errors: injectErrors ? 1 : 0,
        latency: injectLatency ? 750 : 80
      };
      return [...prev.slice(1), newElem];
    });

    writeLog(`Exported [Trace ID: ${traceId.slice(0, 8)}...] containing ${generatedSpans.length} verified Spans to Collector.`);
    if (injectErrors) {
      writeLog(`💥 ALERT: OTLP Span [ID: ${generatedSpans[1].id}] raised exception code: SOVEREIGN_CONTEXT_INLINE_FAILURE`);
    }
  };

  const clearAllConsole = () => {
    playBeep(450, 'sine', 0.1);
    setTraces([]);
    setSelectedTraceId(null);
    setSelectedSpanId(null);
    setLogs(["Buffer flushed. Diagnostic logs idle."]);
  };

  return (
    <div id="aetheros-view-wrapper" className="flex-1 flex flex-col h-full bg-[#030305] text-zinc-250 p-6 overflow-y-auto font-mono text-xs selection:bg-cyan-500/30">
      
      {/* HEADER META INFO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-900 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-cyan-950 border border-cyan-500/40 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-widest uppercase flex items-center gap-2">
                Ai-To-Ai Telemetry Ledger
              </h1>
              <p className="text-[10px] text-zinc-500 tracking-wider">
                OPENTELEMETRY TRACING DECK • COOPERATING DIGITAL CONJUNCTION INTELLIGENCE
              </p>
            </div>
          </div>
        </div>

        {/* Live Controller Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => {
              setAutoCycle(!autoCycle);
              playBeep(900, 'sine', 0.05);
            }}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${autoCycle ? 'bg-cyan-950 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'bg-black border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
          >
            {autoCycle ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="text-[10px] uppercase font-black">{autoCycle ? 'Tracing Live' : 'Paused'}</span>
          </button>
          
          <button 
            onClick={() => runTelemetryCycle()}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-950 hover:border-zinc-800 text-white font-bold tracking-widest text-[10px] flex items-center gap-1.5 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            TRIGGER SPAN
          </button>

          <button 
            onClick={clearAllConsole}
            className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-red-950/40 text-red-400 hover:text-red-300 hover:bg-zinc-900 font-bold text-[10px] flex items-center gap-1.5 transition-all"
          >
            FLUSH COLLECTOR
          </button>
        </div>
      </div>

      {/* AI SEATS QUANTUM ORBITAL FIELD SECTION */}
      <div id="ai-seats-orbital-deck" className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-6 mb-6 overflow-hidden relative">
        {/* Ambient absolute decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Left Column: Visual Circular Space */}
          <div id="quantum-orbit-arena" className="w-full lg:w-[55%] h-[400px] bg-black/40 border border-zinc-900 rounded-2xl flex items-center justify-center relative select-none overflow-hidden">
            
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:24px_24px] opacity-35" />

            {/* Orbit concentric lines based on liberal field density */}
            <div 
              id="orbital-ring-boundary"
              className="absolute rounded-full border border-dashed border-zinc-800 transition-all duration-700 pointer-events-none"
              style={{
                width: `${getRadius() * 2}px`,
                height: `${getRadius() * 2}px`,
              }}
            />
            
            <div 
              id="orbital-ring-outer-shield"
              className="absolute rounded-full border border-zinc-900 transition-all duration-700 pointer-events-none opacity-50"
              style={{
                width: `${getRadius() * 1.5 * 2}px`,
                height: `${getRadius() * 1.5 * 2}px`,
              }}
            />

            {/* Central Node: Central AI Chair */}
            <div id="central-ai-chair-node" className="absolute z-30 flex flex-col items-center justify-center">
              {/* Outer pulsing ring */}
              <motion.div 
                className="absolute w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-500/20 blur-[2px]"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.6, 0.9, 0.6]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              {/* Core central node button/glowing mass */}
              <button 
                id="conjunction-core-btn"
                type="button"
                onClick={() => {
                  playBeep(1200, 'sine', 0.15);
                  setSignalAnimationActive(true);
                  writeLog("💥 CONJUNCTION COMMAND: Triggered micro-signal fusion across all quantized AI seats.");
                  setTimeout(() => setSignalAnimationActive(false), 1200);
                }}
                className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-950 via-zinc-900 to-cyan-900 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] active:scale-95 transition-all z-40 cursor-pointer"
                title="Conjunction Core - Click to fire signal fusion"
              >
                <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
                <span className="text-[7.5px] font-black tracking-widest text-cyan-300 mt-1">CORE</span>
              </button>
            </div>

            {/* Pulsing Transmission Wave Animation from Selected Satellite to Center */}
            <AnimatePresence>
              {signalAnimationActive && (
                <motion.div 
                  id="transmission-pulsar-wave"
                  className="absolute z-20 pointer-events-none rounded-full border-2 border-cyan-400/80"
                  initial={{ width: 0, height: 0, opacity: 1 }}
                  animate={{ 
                    width: getRadius() * 2, 
                    height: getRadius() * 2, 
                    opacity: 0 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>

            {/* Surrounded Circular Seats */}
            {aiSeatsList.map((seat) => {
              const radius = getRadius();
              const angleRad = (seat.angleOffset * Math.PI) / 180;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;

              const isSelected = selectedSeatId === seat.id;
              const scale = isSelected ? getNodeScale() * 1.15 : getNodeScale();

              return (
                <motion.div
                  key={seat.id}
                  id={`ai-seat-wrapper-${seat.id}`}
                  className="absolute z-20 transition-all duration-700"
                  style={{
                    x,
                    y,
                  }}
                  animate={{
                    y: [y, y - 4, y], // Micro-hover/float animation
                  }}
                  transition={{
                    duration: 4 + (seat.angleOffset % 3),
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <button
                    id={`ai-seat-btn-${seat.id}`}
                    type="button"
                    onClick={() => {
                      playBeep(isSelected ? 900 : 700, 'sine', 0.05);
                      setSelectedSeatId(seat.id);
                    }}
                    className={`flex flex-col items-center justify-center rounded-full transition-all border font-bold text-center select-none cursor-pointer ${
                      isSelected 
                        ? `${seat.colorClass} ${seat.glowClass} ring-2 ring-cyan-500/20` 
                        : 'text-zinc-500 bg-zinc-950/90 border-zinc-900 hover:border-zinc-750 hover:text-zinc-300'
                    }`}
                    style={{
                      width: `${46 * scale}px`,
                      height: `${46 * scale}px`,
                    }}
                  >
                    <span className="text-[14px]" style={{ transform: `scale(${scale})` }}>
                      {seat.icon}
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-tight mt-0.5" style={{ fontSize: `${6.5 * scale}px` }}>
                      {seat.id}
                    </span>
                  </button>

                  {/* Active Satellite Link Line overlay */}
                  {isSelected && (
                    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none -z-10" style={{ transform: `rotate(${-seat.angleOffset}deg)` }}>
                      <line 
                        x1="150" 
                        y1="150" 
                        x2="150" 
                        y2={150 - radius} 
                        stroke="rgba(6, 182, 212, 0.25)" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 4" 
                      />
                    </svg>
                  )}
                </motion.div>
              );
            })}

            {/* Display Field Specs Legend */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-0.5 pointer-events-none">
              <span className="text-[8px] font-black tracking-widest text-zinc-500 uppercase">Field State Vector</span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                {liberalField} FIELD • {quantization} MASS
              </span>
            </div>

            <div className="absolute bottom-4 right-4 text-right flex flex-col gap-0.5 pointer-events-none">
              <span className="text-[8px] font-black tracking-widest text-zinc-500 uppercase">Conjunction Status</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                ACTIVE COUPLING
              </span>
            </div>
          </div>

          {/* Right Column: Interaction Setup Details */}
          <div id="ai-seats-config-desk" className="w-full lg:w-[42%] flex flex-col justify-between self-stretch gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-xs uppercase font-black text-white tracking-widest">
                  Seat Mass & Quantization Field
                </h3>
              </div>

              {/* Quantization MASS controls */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Quantization Mass Weight</span>
                  <span className="text-[9px] text-zinc-600">Alters Seat Size & Density</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[9px] font-bold">
                  {(['FP16', 'INT8', 'INT4'] as const).map(mode => (
                    <button
                      key={mode}
                      id={`quant-mass-btn-${mode}`}
                      type="button"
                      onClick={() => {
                        playBeep(920, 'sine', 0.03);
                        setQuantization(mode);
                        writeLog(`Quantization Mass configured to: ${mode}. Satellite geometry updated.`);
                      }}
                      className={`py-2 rounded-xl border transition-all uppercase ${quantization === mode ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 font-extrabold shadow-[0_0_10px_rgba(6,182,212,0.1)]' : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-350'}`}
                    >
                      {mode} {mode === 'FP16' ? '(Unquantized)' : mode === 'INT8' ? '(8-bit)' : '(Extreme)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liberal Field INTENSITY controls */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Liberal Field Density</span>
                  <span className="text-[9px] text-zinc-600">Alters Orbital Spacing Radius</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[9px] font-bold">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map(density => (
                    <button
                      key={density}
                      id={`field-density-btn-${density}`}
                      type="button"
                      onClick={() => {
                        playBeep(850, 'sine', 0.03);
                        setLiberalField(density);
                        writeLog(`Liberal Field Density adjusted to: ${density}. Concentric fields recalculated.`);
                      }}
                      className={`py-2 rounded-xl border transition-all uppercase ${liberalField === density ? 'bg-amber-950/40 border-amber-500 text-amber-400 font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-350'}`}
                    >
                      {density === 'LOW' ? 'Conservative' : density === 'MEDIUM' ? 'Balanced' : 'Liberal'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected seat details display card */}
              {(() => {
                const seat = aiSeatsList.find(s => s.id === selectedSeatId) || aiSeatsList[0];
                return (
                  <motion.div 
                    key={seat.id}
                    id={`active-seat-details-${seat.id}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-black/60 border border-zinc-900 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{seat.icon}</span>
                        <div>
                          <h4 className="font-bold text-white text-[11px] leading-tight">{seat.name}</h4>
                          <span className="text-[9px] text-zinc-500 tracking-tight">{seat.provider}</span>
                        </div>
                      </div>
                      <span className="text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-400 rounded px-1.5 py-0.5 uppercase font-black font-mono">
                        Active Seat
                      </span>
                    </div>

                    <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans">
                      {seat.description}
                    </p>

                    <div className="flex justify-between items-center pt-2 border-t border-zinc-900 text-[9.5px]">
                      <span className="text-zinc-500 uppercase tracking-wider font-bold">Precision Footprint</span>
                      <span className="text-cyan-400 font-mono font-bold">{seat.techSpecs}</span>
                    </div>
                  </motion.div>
                );
              })()}
            </div>

            {/* Broadcast action button */}
            <button 
              id="signal-transmission-btn"
              type="button"
              onClick={() => {
                playBeep(1100, 'sine', 0.2);
                setSignalAnimationActive(true);
                setTimeout(() => setSignalAnimationActive(false), 1200);
                
                const seat = aiSeatsList.find(s => s.id === selectedSeatId) || aiSeatsList[0];
                writeLog(`📡 SIGNAL FUSION: Dispatched direct quantum transmission route from [${seat.name}] into Central Chair.`);
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold tracking-widest text-[10px] uppercase shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              FIRE SIGNAL TRANSMISSION FUSION
            </button>
          </div>

        </div>
      </div>

      {/* THREE BENTO PANELS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* PANEL LEVEL A: AGENT CONFIGURATION & TRIGGER TOPIC */}
        <div className="xl:col-span-4 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs uppercase font-black text-white tracking-widest">AIs Directives Setup</h2>
          </div>

          {/* List active agents */}
          <div className="space-y-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Cooperating Neural Entities:</p>
            {agents.map(agent => (
              <div key={agent.id} className="p-3 bg-black/60 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-all flex items-start gap-3">
                <div className="p-2 bg-zinc-900 rounded-lg shrink-0 mt-0.5">
                  {agent.avatarIcon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px]">{agent.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 uppercase font-black uppercase text-[8px]">{agent.role}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                    {agent.promptDirective}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Choose discussion topic */}
          <div className="space-y-3 border-t border-zinc-900 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Simulated Dialogue Subject:</p>
              <div className="flex items-center gap-1">
                <input 
                  type="checkbox" 
                  id="customPromptToggle" 
                  checked={customPromptEnabled} 
                  onChange={(e) => {
                    playBeep(980, 'sine', 0.04);
                    setCustomPromptEnabled(e.target.checked);
                  }}
                  className="rounded bg-black border-zinc-800 text-cyan-500 focus:ring-opacity-0 shrink-0"
                />
                <label htmlFor="customPromptToggle" className="text-[9px] text-white font-bold uppercase cursor-pointer select-none">Custom Topic</label>
              </div>
            </div>

            {customPromptEnabled ? (
              <div className="flex gap-1.5">
                <input 
                  type="text"
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  placeholder="e.g. Discuss biometric memory limits..."
                  className="flex-1 bg-black rounded-lg border border-zinc-800 px-3 py-2 text-[11px] text-white focus:outline-none focus:border-cyan-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customTopicInput.trim() !== '') {
                      runTelemetryCycle();
                    }
                  }}
                  className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all"
                  title="Force telemetry span"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'LATTICE_CONJUNCTION', label: 'Topological Latency & Conjunction Paths' },
                  { id: 'SECURITY_COMPLIANCE', label: 'WebAuthn Sandboxing & Multi-Sovereignty' },
                  { id: 'CLOCK_DRIFT', label: 'Drift Warning & Atomic Clock Sync' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      playBeep(900, 'sine', 0.05);
                      setCurrentTopic(item.id);
                    }}
                    className={`text-left p-2.5 rounded-lg border text-[10px] transition-all flex justify-between items-center ${currentTopic === item.id ? 'bg-cyan-950/40 border-cyan-500/80 text-cyan-300' : 'bg-black border-zinc-900 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-250'}`}
                  >
                    <span>{item.label}</span>
                    {currentTopic === item.id && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Advanced OTel Settings */}
          <div className="space-y-4 border-t border-zinc-900 pt-4">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">OpenTelemetry Config SDK</p>
            
            {/* Sampler Selector */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-400">Head/Tail Sampler Fraction</span>
                <span className="text-cyan-400 font-bold">{samplerRate === 1.0 ? '100% (All Traces)' : `${samplerRate * 100}%`}</span>
              </div>
              <input 
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={samplerRate}
                onChange={(e) => {
                  playBeep(900, 'triangle', 0.03);
                  setSamplerRate(parseFloat(e.target.value));
                }}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Propagation Header Standard */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-400 block">Traceparent Header Spec</span>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    playBeep(850, 'sine', 0.03);
                    setPropagationHeader('W3C_TRACE_CONTEXT');
                  }}
                  className={`py-1.5 rounded border transition-all ${propagationHeader === 'W3C_TRACE_CONTEXT' ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-black border-zinc-900 text-zinc-500'}`}
                >
                  W3C Context
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playBeep(850, 'sine', 0.03);
                    setPropagationHeader('B3_MULTI');
                  }}
                  className={`py-1.5 rounded border transition-all ${propagationHeader === 'B3_MULTI' ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-black border-zinc-900 text-zinc-500'}`}
                >
                  B3 Multiple Headers
                </button>
              </div>
            </div>

            {/* Simulated failures toggle */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button 
                onClick={() => {
                  playBeep(980, 'sine', 0.03);
                  setInjectLatency(!injectLatency);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${injectLatency ? 'bg-amber-950/40 border-amber-500 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.1)]' : 'bg-black border-zinc-900 text-zinc-500'}`}
              >
                <span className="text-[7.5px] uppercase tracking-widest font-black">Latency Sweep</span>
                <span className="text-[11px] font-bold mt-1">{injectLatency ? '+800ms On' : 'Default (OK)'}</span>
              </button>

              <button 
                onClick={() => {
                  playBeep(980, 'sine', 0.03);
                  setInjectErrors(!injectErrors);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${injectErrors ? 'bg-red-950/40 border-red-500 text-red-400 shadow-[0_0_8px_rgba(239, 68, 68, 0.1)]' : 'bg-black border-zinc-900 text-zinc-500'}`}
              >
                <span className="text-[7.5px] uppercase tracking-widest font-black">Strict Failures</span>
                <span className="text-[11px] font-bold mt-1">{injectErrors ? 'Auto-Fail 1st Turn' : 'None'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* PANEL LEVEL B: REAL-TIME JAEGER/HONEYCOMB STYLE ACTIVE TRACING MATRIX */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Real-time active simulation analytics spark chart */}
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs uppercase font-black text-white tracking-widest">Live Dynamic Spans Throughput</h2>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-extrabold uppercase">HTTP Collector</span>
            </div>

            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={throughputMetrics}>
                  <defs>
                    <linearGradient id="colorSpans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#374151" fontSize={8} tickLine={false} />
                  <YAxis stroke="#374151" fontSize={8} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#1f2937', borderRadius: '8px' }}
                    labelClassName="text-white text-xs font-mono font-bold"
                  />
                  <Area type="monotone" dataKey="spans" stroke="#10b981" fillOpacity={1} fill="url(#colorSpans)" strokeWidth={1} name="Spans/sec" />
                  <Area type="monotone" dataKey="latency" stroke="#f59e0b" fillOpacity={0} strokeWidth={1.2} strokeDasharray="3 3" name="Latency (ms)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ACTIVE TRACES LIST */}
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5">
            <h2 className="text-xs uppercase font-black text-white mb-4 tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Collector Stream Index ({traces.length} Traces Loaded)
            </h2>

            {traces.length === 0 ? (
              <div className="bg-black/40 border border-zinc-900 border-dashed py-8 text-center rounded-xl space-y-2">
                <Terminal className="w-6 h-6 text-zinc-700 mx-auto" />
                <p className="text-zinc-500 uppercase text-[9px] font-bold">No active trace payload received yet.</p>
                <button 
                  onClick={() => runTelemetryCycle()}
                  className="px-3 py-1 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded-lg text-[9px] uppercase font-bold"
                >
                  Generate Initial Trace Spans
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
                {traces.map(trace => {
                  const errorCount = trace.spans.filter(s => s.status.code === 'ERROR').length;
                  const durationSum = trace.spans.reduce((acc, s) => acc + s.durationMs, 0);
                  const isSelected = selectedTraceId === trace.traceId;

                  return (
                    <div 
                      key={trace.traceId}
                      onClick={() => {
                        playBeep(980, 'sine', 0.02);
                        setSelectedTraceId(trace.traceId);
                        setSelectedSpanId(trace.spans[0]?.id || null);
                      }}
                      className={`grid grid-cols-12 items-center p-3.5 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-cyan-950/20 border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.06)]' : 'bg-black/60 border-zinc-900 hover:border-zinc-800'}`}
                    >
                      <div className="col-span-4 space-y-1">
                        <div className="flex items-center gap-2">
                          {errorCount > 0 ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                          <span className="font-bold text-white text-[11px] truncate tracking-wider">
                            {trace.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono tracking-tighter truncate">
                          TRACE_ID: {trace.traceId.slice(0, 14)}...
                        </div>
                      </div>

                      <div className="col-span-3 text-[10px] text-zinc-400 font-bold">
                        <span>{trace.spans.length} Completed Spans</span>
                      </div>

                      <div className="col-span-3 text-[10px] text-right font-mono pr-4">
                        <span className="text-zinc-500">Root Duration:</span>{' '}
                        <span className="text-amber-400 font-bold">{durationSum}ms</span>
                      </div>

                      <div className="col-span-2 text-right">
                        {errorCount > 0 ? (
                          <span className="text-[8px] font-black bg-red-950 border border-red-800 text-red-400 px-1.5 py-0.5 rounded uppercase">
                            {errorCount} Errors
                          </span>
                        ) : (
                          <span className="text-[8px] font-black bg-emerald-990 border border-emerald-800 text-emerald-400 px-1.5 py-0.5 rounded uppercase">
                            Compliant
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTIVE TRACE DETAIL: GANTT STYLE CASCADING TIMELINE CHANNELS */}
          {selectedTraceId && (
            <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5 space-y-6 animate-in fade-in duration-300">
              {(() => {
                const activeTrace = traces.find(t => t.traceId === selectedTraceId);
                if (!activeTrace) return null;

                const minStartTime = Math.min(...activeTrace.spans.map(s => s.startTimeMs));
                const maxEndTime = Math.max(...activeTrace.spans.map(s => s.endTimeMs));
                const totalDuration = maxEndTime - minStartTime || 1;

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                      <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Trace Interactive Visualizer (Waterfall)</p>
                        <h3 className="text-[13px] text-white font-black uppercase mt-1">
                          {activeTrace.name}
                        </h3>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-400 font-bold bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5">
                        {activeTrace.traceId}
                      </span>
                    </div>

                    {/* Chat dialog matching exact active trace waterfall triggers */}
                    <div className="bg-black border border-zinc-900 rounded-2xl p-4 space-y-3.5">
                      <p className="text-[9px] text-zinc-650 text-zinc-500 font-black tracking-widest uppercase">
                        AI-To-AI Dialogue Stream inside executing Spans:
                      </p>
                      
                      <div className="space-y-3">
                        {activeTrace.spans.map((span, idx) => {
                          const matchedAgent = agents.find(a => a.name === span.attributes['ai.agent.name']) || agents[0];
                          const isError = span.status.code === 'ERROR';

                          return (
                            <motion.div 
                              key={span.id}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                                isError ? 'bg-red-950/10 border-red-950' : 'bg-zinc-950 border-zinc-900 hover:border-zinc-850'
                              }`}
                            >
                              <div className="p-2 bg-black rounded-lg shrink-0 text-cyan-400">
                                {matchedAgent.avatarIcon}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-extrabold text-white uppercase">{matchedAgent.name}</span>
                                  <span className="text-zinc-500 font-mono text-[9px]">[{span.name}]</span>
                                </div>
                                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans italic selection:bg-zinc-800">
                                  " {span.attributes['ai.agent.dialog']} "
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cascading Gantt timeline spans representation */}
                    <div className="space-y-3.5">
                      <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">OTLP Spans Waterfall Gantt View:</p>
                      
                      <div className="space-y-2.5">
                        {activeTrace.spans.map((span) => {
                          const startPct = ((span.startTimeMs - minStartTime) / totalDuration) * 100;
                          const widthPct = ((span.endTimeMs - span.startTimeMs) / totalDuration) * 100;
                          const isSelectedSpan = selectedSpanId === span.id;
                          const isRoot = !span.parentSpanId;

                          return (
                            <div 
                              key={span.id}
                              onClick={() => {
                                playBeep(1020, 'triangle', 0.02);
                                setSelectedSpanId(span.id);
                              }}
                              className={`space-y-1 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                isSelectedSpan 
                                  ? 'bg-zinc-900 border-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                                  : 'bg-black/40 border-zinc-900/60 hover:bg-zinc-950 hover:border-zinc-800'
                              }`}
                            >
                              <div className="flex justify-between items-center text-[10px]">
                                <div className="flex items-center gap-1.5">
                                  {!isRoot && <ChevronRight className="w-3 h-3 text-zinc-650 shrink-0 select-none ml-1.5" />}
                                  <span className={`font-black ${isSelectedSpan ? 'text-cyan-400' : 'text-zinc-300'}`}>
                                    {span.name}
                                  </span>
                                  <span className="text-[8px] text-zinc-600 font-mono tracking-tighter">
                                    ({span.attributes['ai.agent.role']})
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-mono text-zinc-400">
                                    {span.durationMs}ms
                                  </span>
                                  {span.status.code === 'ERROR' ? (
                                    <span className="text-[7.5px] font-black bg-red-950 border border-red-800 text-red-500 px-1 py-0.2 rounded uppercase">
                                      Fail
                                    </span>
                                  ) : (
                                    <span className="text-[7.5px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-500 px-1 py-0.2 rounded uppercase">
                                      {span.kind}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Gantt Percentage Slider bar */}
                              <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden relative border border-zinc-900">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    span.status.code === 'ERROR' ? 'bg-red-500' : (isSelectedSpan ? 'bg-cyan-400' : 'bg-emerald-500/70')
                                  }`}
                                  style={{ 
                                    left: `${Math.max(0, Math.min(95, startPct))}%`, 
                                    width: `${Math.max(5, Math.min(100, widthPct))}%`,
                                    position: 'absolute'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SELECT DETAILED SPAN META SPEC FROM HIERARCHY */}
                    {selectedSpanId && (() => {
                      const activeSpan = activeTrace.spans.find(s => s.id === selectedSpanId);
                      if (!activeSpan) return null;

                      return (
                        <div className="bg-black/80 rounded-2xl border border-zinc-900 p-4 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
                            <div className="flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="font-extrabold text-white text-[11px] uppercase">
                                JSON Metadata schema [Span: {activeSpan.name}]
                              </span>
                            </div>
                            <span className="text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-400 rounded px-1.5 font-bold">
                              SpanID: {activeSpan.id}
                            </span>
                          </div>

                          {/* Attribute Grid lists */}
                          <div className="grid grid-cols-2 gap-4 text-[10px]">
                            <div className="space-y-1.5 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900/65">
                              <span className="text-zinc-500 block uppercase text-[8px] font-black tracking-widest">Model Specs</span>
                              <div className="space-y-1">
                                <div className="flex justify-between"><span className="text-zinc-400">ai.model:</span><span className="text-zinc-200">{activeSpan.attributes['ai.model']}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-400">ai.temperature:</span><span className="text-zinc-300">{activeSpan.attributes['ai.temperature']}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-400">prompt.tokens:</span><span className="text-zinc-300">{activeSpan.attributes['ai.prompt.tokens']}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-400">response.tokens:</span><span className="text-zinc-300">{activeSpan.attributes['ai.response.tokens']}</span></div>
                              </div>
                            </div>

                            <div className="space-y-1.5 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900/65">
                              <span className="text-zinc-500 block uppercase text-[8px] font-black tracking-widest">OTel Library Specs</span>
                              <div className="space-y-1">
                                <div className="flex justify-between"><span className="text-zinc-400">language:</span><span className="text-emerald-400 font-bold">{activeSpan.attributes['telemetry.sdk.language']}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-400">lib.name:</span><span className="text-cyan-400 font-mono text-[9px]">{activeSpan.attributes['otel.library.name']}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-400">lib.version:</span><span className="text-zinc-300">{activeSpan.attributes['otel.library.version']}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-400">system.load:</span><span className="text-zinc-350">{activeSpan.attributes['system.load.factor']}</span></div>
                              </div>
                            </div>
                          </div>

                          {/* Raw interactive OTLP structured JSON preview */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-widest">Raw OTLP Span JSON (W3C standard representation):</span>
                            <pre className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl overflow-x-auto text-[10px] text-zinc-400 text-left leading-relaxed">
                              {JSON.stringify({
                                trace_id: activeTrace.traceId,
                                span_id: activeSpan.id,
                                parent_span_id: activeSpan.parentSpanId || null,
                                name: activeSpan.name,
                                kind: activeSpan.kind,
                                start_time_unix_nano: activeSpan.startTimeMs * 1000000,
                                end_time_unix_nano: activeSpan.endTimeMs * 1000000,
                                body: activeSpan.attributes['ai.agent.dialog'],
                                status: {
                                  code: activeSpan.status.code === 'ERROR' ? 2 : 1,
                                  message: activeSpan.status.message || "STATUS_CODE_OK"
                                },
                                resource: {
                                  attributes: {
                                    "service.name": "aetheros.ai.conjunction.service",
                                    "telemetry.sdk.name": activeSpan.attributes['telemetry.sdk.name'],
                                    "telemetry.sdk.language": activeSpan.attributes['telemetry.sdk.language']
                                  }
                                }
                              }, null, 2)}
                            </pre>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER TERMINAL EVENTS LOG DISPLAY */}
      <div className="mt-8 bg-zinc-950 border border-zinc-900 rounded-2xl p-4 font-mono">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-zinc-300 uppercase">Live Trace Exporter Diagnostic Logs</span>
          </div>
          <span className="text-[8px] text-zinc-650 text-zinc-500 uppercase font-black tracking-widest">W3C Compliant Stream</span>
        </div>
        
        <div className="h-32 overflow-y-auto px-1 space-y-1 font-mono text-[10.5px] text-zinc-450 text-left select-text scroll-smooth" style={{ contentVisibility: 'auto' }}>
          {logs.map((log, index) => {
            const hasAlert = log.includes("💥 ALERT") || log.includes("discarded");
            const hasExport = log.includes("Exported");
            let textColor = "text-zinc-400";
            if (hasAlert) textColor = "text-amber-500";
            if (hasExport) textColor = "text-[#10b981]";

            return (
              <div key={index} className={`font-mono text-[9px] leading-relaxed break-all ${textColor}`}>
                <span className="text-zinc-600 mr-2 animate-pulse">&gt;</span> {log}
              </div>
            );
          })}
          <div ref={consoleBottomRef} />
        </div>
      </div>

    </div>
  );
};
