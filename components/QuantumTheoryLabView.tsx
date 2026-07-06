import React, { useState, useEffect } from 'react';
import { 
  Atom, 
  Zap, 
  Brain, 
  Shield, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  TrendingUp, 
  Compass, 
  Sliders, 
  ChevronRight, 
  ChevronLeft, 
  Binary, 
  Target, 
  HelpCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { LabComponentProps } from '../types';

export const QuantumTheoryLabView: React.FC<LabComponentProps> = ({ 
  labName = "QUANTUM THEORY LAB", 
  labIcon: LabIcon = Atom, 
  labColor = "text-fuchsia-400", 
  description = "Explore the fundamental nature of reality at the smallest scales." 
}) => {
  // Navigation tab: 'probe' (original Entanglement Probe) or 'grover' (1.3 Grover's Algorithm)
  const [activeTab, setActiveTab] = useState<'grover' | 'probe'>('grover');

  // --- ENTANGLEMENT PROBE (ORIGINAL VIEW STATES) ---
  const [entanglement, setEntanglement] = useState(72);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const performMeasurement = () => {
    setIsMeasuring(true);
    setTimeout(() => {
      setEntanglement(Math.floor(Math.random() * 100));
      setIsMeasuring(false);
    }, 1500);
  };

  // --- 1.3 GROVER'S ALGORITHM SIMULATOR STATES ---
  const [targetState, setTargetState] = useState<number>(3); // $|011\rangle$ by default
  const [groverStep, setGroverStep] = useState<number>(1); // 1: Equal Superposition (default active state)
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  
  // Custom interactive state amplitudes
  const [amplitudes, setAmplitudes] = useState<number[]>(
    Array(8).fill(1 / Math.sqrt(8)) // Starts in superposition
  );
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customLogs, setCustomLogs] = useState<string[]>(['[SYSTEM] Superposition established.']);

  // Reset Grover simulation
  const handleResetGrover = () => {
    setGroverStep(0);
    setAmplitudes([1, 0, 0, 0, 0, 0, 0, 0]); // Ground State
    setIsCustomMode(false);
    setCustomLogs(['[SYSTEM] Wavefunction collapsed to ground state |000⟩.']);
    setIsAutoPlaying(false);
  };

  // Run presets based on selected standard steps
  const applyStepPreset = (stepNum: number) => {
    setIsCustomMode(false);
    setGroverStep(stepNum);
    const sqrt8 = Math.sqrt(8);
    
    switch (stepNum) {
      case 0: // Ground State
        const ground = Array(8).fill(0);
        ground[0] = 1.0;
        setAmplitudes(ground);
        break;
      case 1: // Equal Superposition (Hadamard applied)
        setAmplitudes(Array(8).fill(1 / sqrt8));
        break;
      case 2: // Oracle Marker applied
        const afterOracle = Array(8).fill(1 / sqrt8);
        afterOracle[targetState] = -1 / sqrt8;
        setAmplitudes(afterOracle);
        break;
      case 3: // Diffuser / Mirror (Inversion about mean)
        const afterDiffuser = Array(8).fill(0.1768);
        afterDiffuser[targetState] = 0.8839;
        setAmplitudes(afterDiffuser);
        break;
      case 4: // Second Iteration (Oracle + Diffuser applied again)
        const afterIter2 = Array(8).fill(-0.0884);
        afterIter2[targetState] = 0.9723;
        setAmplitudes(afterIter2);
        break;
      case 5: // Measurement (Wavefunction Collapse)
        // Probabilistically collapse to target (94.5%) or random state
        const rolled = Math.random();
        const measured = Array(8).fill(0);
        if (rolled < 0.945) {
          measured[targetState] = 1.0;
        } else {
          const remainingStates = Array.from({ length: 8 }, (_, i) => i).filter(i => i !== targetState);
          const randomState = remainingStates[Math.floor(Math.random() * remainingStates.length)];
          measured[randomState] = 1.0;
        }
        setAmplitudes(measured);
        break;
      default:
        break;
    }
  };

  // Change target state
  const handleSelectTarget = (idx: number) => {
    setTargetState(idx);
    if (!isCustomMode) {
      // Re-apply current step preset with new target
      setTimeout(() => applyStepPreset(groverStep), 0);
    } else {
      setCustomLogs(prev => [...prev, `[ORACLE] Target state set to |${stateLabel(idx)}⟩.`]);
    }
  };

  // --- CUSTOM OPERATOR ACTIONS ---
  const applyHadamardAll = () => {
    setIsCustomMode(true);
    // Applying Hadamard gates to all qubits in Ground state creates superposition
    const nextAmps = Array(8).fill(1 / Math.sqrt(8));
    setAmplitudes(nextAmps);
    setCustomLogs(prev => [...prev, '[H-GATE] Equal Superposition created on all 8 states. All amplitudes = 0.354.']);
  };

  const applyCustomOracle = () => {
    setIsCustomMode(true);
    const nextAmps = [...amplitudes];
    nextAmps[targetState] = -nextAmps[targetState];
    setAmplitudes(nextAmps);
    setCustomLogs(prev => [
      ...prev, 
      `[ORACLE] Phase flipped for target state |${stateLabel(targetState)}⟩ (${(nextAmps[targetState]).toFixed(3)}).`
    ]);
  };

  const applyCustomDiffuser = () => {
    setIsCustomMode(true);
    const nextAmps = [...amplitudes];
    const mean = nextAmps.reduce((acc, v) => acc + v, 0) / 8;
    
    // Inversion about Mean formula: A_i' = 2*Mean - A_i
    for (let i = 0; i < 8; i++) {
      nextAmps[i] = 2 * mean - nextAmps[i];
    }
    
    setAmplitudes(nextAmps);
    setCustomLogs(prev => [
      ...prev, 
      `[DIFFUSER] Inversion about mean applied (Mean: ${mean.toFixed(3)}). Target state amplified to ${(nextAmps[targetState]).toFixed(3)}.`
    ]);
  };

  const applyCustomMeasure = () => {
    setIsCustomMode(true);
    const probs = amplitudes.map(amp => amp * amp);
    const sumProbs = probs.reduce((a, b) => a + b, 0);
    
    // Normalize if needed
    const normProbs = sumProbs > 0 ? probs.map(p => p / sumProbs) : Array(8).fill(0.125);
    
    // Weighted selection
    const r = Math.random();
    let cumulative = 0;
    let selected = 0;
    for (let i = 0; i < 8; i++) {
      cumulative += normProbs[i];
      if (r <= cumulative) {
        selected = i;
        break;
      }
    }
    
    const collapsed = Array(8).fill(0);
    collapsed[selected] = 1.0;
    setAmplitudes(collapsed);
    setCustomLogs(prev => [
      ...prev, 
      `[MEASURED] Wavefunction collapsed! Observed state: |${stateLabel(selected)}⟩ with ${Math.round(normProbs[selected] * 100)}% pre-measurement probability.`
    ]);
  };

  // Convert state index to 3-qubit binary label
  const stateLabel = (idx: number): string => {
    return idx.toString(2).padStart(3, '0');
  };

  // Compute stats
  const meanAmplitude = amplitudes.reduce((acc, v) => acc + v, 0) / 8;
  const targetProb = amplitudes[targetState] * amplitudes[targetState] * 100;

  // Auto-playing logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setGroverStep(prev => {
          const next = (prev + 1) % 6;
          applyStepPreset(next);
          return next;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, targetState]);

  return (
    <div className="h-full flex flex-col bg-[#050510] overflow-hidden font-mono text-zinc-300">
      {/* HEADER SECTION */}
      <div className="p-4 border-b border-zinc-900 bg-black/60 flex justify-between items-center shadow-md flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-xl flex items-center justify-center">
            <LabIcon className={`w-5 h-5 ${labColor} animate-pulse`} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wider text-white uppercase flex items-center gap-2">
              {labName} <span className="text-[10px] bg-fuchsia-950/50 text-fuchsia-400 border border-fuchsia-800/30 px-2 py-0.5 rounded">v1.3</span>
            </h2>
            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
              {description}
            </p>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex items-center gap-1.5 bg-black/50 p-1 border border-zinc-800 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('grover')}
            className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition flex items-center gap-1.5 ${
              activeTab === 'grover' 
                ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/20' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Binary className="w-3 h-3" />
            1.3 Grover's Algorithm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('probe')}
            className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition flex items-center gap-1.5 ${
              activeTab === 'probe' 
                ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/20' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3 h-3" />
            Entanglement Probe
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'probe' ? (
            /* --- TAB 1: ORIGINAL ENTANGLEMENT PROBE --- */
            <motion.div 
              key="probe-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 max-w-4xl mx-auto space-y-6"
            >
              <div className="bg-gradient-to-br from-[#0c051a] to-[#040410] border border-fuchsia-500/20 p-8 rounded-2xl space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(217,70,239,0.05)] text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(217,70,239,0.03)_0%,_transparent_70%)] pointer-events-none" />
                
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
                  <Atom className="w-6 h-6 text-fuchsia-500 animate-spin" />
                  Quantum Entanglement Probe
                </h3>
                
                <div className="relative h-44 flex items-center justify-center">
                  {isMeasuring ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 border-t-2 border-r-2 border-fuchsia-500 rounded-full animate-spin" />
                      <span className="text-[10px] text-fuchsia-400 uppercase tracking-widest font-bold">Collapsing Wavefunction...</span>
                    </div>
                  ) : (
                    <div className="text-7xl font-black text-fuchsia-500 drop-shadow-[0_0_15px_rgba(217,70,239,0.4)]">
                      {entanglement}%
                    </div>
                  )}
                </div>

                <p className="text-zinc-400 italic text-xs max-w-xl mx-auto leading-relaxed">
                  Current system state probability distribution. Measuring collapse will sync the kernel with the Maestro's 0x03E2 harmonic resonance.
                </p>

                <button 
                  onClick={performMeasurement}
                  disabled={isMeasuring}
                  className="w-full max-w-md py-4 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-fuchsia-800/40 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isMeasuring ? 'COLLAPSING WAVEFUNCTION...' : 'MEASURE STATE'}
                </button>
              </div>

              {/* STATS DECK */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'SPIN STATE', val: 'UP (EIGENSTATE)', desc: 'Angular polarization orientation' },
                  { label: 'COHERENCE VECTOR', val: '0x03E2_RES', desc: 'Sovereign hardware harmonic lock' },
                  { label: 'TENSOR FIELD', val: 'STABLE SUPERPOSITION', desc: 'Phase-stable manifold density' }
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-zinc-950/50 border border-zinc-900 rounded-xl">
                    <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest block mb-1">{stat.label}</span>
                    <span className="text-fuchsia-400 font-bold text-xs block">{stat.val}</span>
                    <span className="text-[8px] text-zinc-600 block mt-1 leading-none">{stat.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* --- TAB 2: GROVER'S ALGORITHM INTERACTIVE TUTORIAL --- */
            <motion.div
              key="grover-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5"
            >
              {/* LEFT COLUMN: INTERACTIVE VISUALIZER & CHART (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* INTERACTIVE CONTROLS PANEL */}
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] bg-indigo-950/50 text-indigo-400 border border-indigo-900/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Interactive Hardware Emulator
                      </span>
                      <h3 className="text-sm font-black text-white uppercase flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-emerald-400" />
                        Grover State Machine Control Deck
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className={`px-3 py-1 rounded text-[9px] font-bold uppercase flex items-center gap-1 transition ${
                          isAutoPlaying 
                            ? 'bg-amber-600 text-black font-black' 
                            : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {isAutoPlaying ? 'Pause Autoplay' : 'Autoplay'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleResetGrover}
                        className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-[9px] font-bold uppercase flex items-center gap-1 transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* SELECT TARGET STATE */}
                  <div className="space-y-2 bg-black/30 p-3 rounded-xl border border-zinc-900">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                        <Target className="w-3 h-3 text-red-500" />
                        Set Unsorted Database Target (|t⟩)
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        Target State: <strong className="text-emerald-400">|{stateLabel(targetState)}⟩</strong> (Index {targetState})
                      </span>
                    </div>

                    <div className="grid grid-cols-8 gap-1">
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectTarget(idx)}
                          className={`py-2 rounded font-mono text-xs font-black uppercase border transition-all ${
                            targetState === idx 
                              ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)] scale-105 z-10' 
                              : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800'
                          }`}
                        >
                          |{stateLabel(idx)}⟩
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* STEPPER / TIMELINE PRESETS */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                      Standard Grover Algorithm Flowchart Steps
                    </span>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 font-mono">
                      {[
                        { stepNum: 0, label: '0. Ground', desc: 'Initialize qubits' },
                        { stepNum: 1, label: '1. Superpos', desc: 'H-gates active' },
                        { stepNum: 2, label: '2. Oracle', desc: 'Flip target phase' },
                        { stepNum: 3, label: '3. Diffuser', desc: 'Invert about mean' },
                        { stepNum: 4, label: '4. Iteration 2', desc: 'Max amplification' },
                        { stepNum: 5, label: '5. Measure', desc: 'Wave collapse' }
                      ].map((step) => (
                        <button
                          key={step.stepNum}
                          type="button"
                          onClick={() => applyStepPreset(step.stepNum)}
                          className={`p-1.5 rounded text-left border transition-all ${
                            !isCustomMode && groverStep === step.stepNum 
                              ? 'bg-fuchsia-950/30 text-fuchsia-400 border-fuchsia-500/40 shadow-inner' 
                              : 'bg-zinc-950/40 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800'
                          }`}
                        >
                          <div className="text-[8.5px] font-black">{step.label}</div>
                          <div className="text-[7.5px] text-zinc-600 scale-95 origin-left truncate">{step.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CUSTOM LAB GATE CONTROLLERS */}
                  <div className="space-y-2 bg-black/40 p-3 rounded-xl border border-zinc-900">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-fuchsia-400" />
                      Manual Gate Playground (Break Wavefunction Preset Rules)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={applyHadamardAll}
                        className="py-1.5 px-2 bg-zinc-900 hover:bg-fuchsia-950/30 border border-zinc-800 hover:border-fuchsia-500/30 text-zinc-300 hover:text-fuchsia-400 text-[8.5px] font-bold rounded uppercase transition text-center"
                      >
                        [ H ] Hadamard All
                      </button>
                      <button
                        type="button"
                        onClick={applyCustomOracle}
                        className="py-1.5 px-2 bg-zinc-900 hover:bg-red-950/30 border border-zinc-800 hover:border-red-500/30 text-zinc-300 hover:text-red-400 text-[8.5px] font-bold rounded uppercase transition text-center"
                      >
                        [ Oracle ] Flip Phase
                      </button>
                      <button
                        type="button"
                        onClick={applyCustomDiffuser}
                        className="py-1.5 px-2 bg-zinc-900 hover:bg-emerald-950/30 border border-zinc-800 hover:border-emerald-500/30 text-zinc-300 hover:text-emerald-400 text-[8.5px] font-bold rounded uppercase transition text-center"
                      >
                        [ Diffuser ] Invert Mean
                      </button>
                      <button
                        type="button"
                        onClick={applyCustomMeasure}
                        className="py-1.5 px-2 bg-zinc-900 hover:bg-indigo-950/30 border border-zinc-800 hover:border-indigo-500/30 text-zinc-300 hover:text-indigo-400 text-[8.5px] font-bold rounded uppercase transition text-center"
                      >
                        [ Measure ] Collapse
                      </button>
                    </div>
                  </div>
                </div>

                {/* THE AMPLITUDE BAR CHART */}
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2 flex-wrap gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                        Wavefunction Amplitudes Vector (|Ψ⟩)
                      </h4>
                      <p className="text-[8px] text-zinc-600 uppercase font-mono">
                        Y-Axis: Phase/Amplitude Coefficient ([-1.0, 1.0]). Height Squared = Observation Probability.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-[8px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded bg-emerald-500" />
                        <span>Target Amplitude: <strong className="text-emerald-400">{amplitudes[targetState].toFixed(3)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded bg-fuchsia-500" />
                        <span>Mean Height: <strong className="text-fuchsia-400">{meanAmplitude.toFixed(3)}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* CHART CONTAINER */}
                  <div className="relative h-60 bg-black/40 rounded-xl border border-zinc-900 flex items-center p-4">
                    
                    {/* Y Axis Reference Labels */}
                    <div className="absolute left-2 top-2 bottom-2 w-8 flex flex-col justify-between text-[7px] text-zinc-600 font-mono pointer-events-none select-none">
                      <span>+1.0</span>
                      <span>+0.5</span>
                      <span>0.0</span>
                      <span>-0.5</span>
                      <span>-1.0</span>
                    </div>

                    {/* Horizontal Gridlines */}
                    <div className="absolute inset-x-12 top-4 bottom-4 flex flex-col justify-between pointer-events-none select-none">
                      <div className="border-t border-zinc-900/30 w-full" />
                      <div className="border-t border-zinc-900/30 w-full" />
                      <div className="border-t border-zinc-900/80 w-full" /> {/* Zero line */}
                      <div className="border-t border-zinc-900/30 w-full" />
                      <div className="border-t border-zinc-900/30 w-full" />
                    </div>

                    {/* Inversion about the Mean Reference Line */}
                    {groverStep > 1 && !isCustomMode && (
                      <div 
                        className="absolute inset-x-12 border-t-2 border-dashed border-fuchsia-500/40 z-20 pointer-events-none transition-all duration-300"
                        style={{
                          top: `calc(50% - ${meanAmplitude * 110}px)`
                        }}
                      >
                        <span className="absolute right-2 -top-3.5 text-[7px] text-fuchsia-400 font-black uppercase tracking-wider bg-black/90 px-1 py-0.5 border border-fuchsia-950 rounded leading-none">
                          Mean Height = {meanAmplitude.toFixed(3)}
                        </span>
                      </div>
                    )}

                    {/* Bars Grid */}
                    <div className="flex-1 ml-10 mr-2 h-full flex justify-between items-center gap-1 z-10">
                      {amplitudes.map((amp, idx) => {
                        const probability = amp * amp * 100;
                        const isTarget = idx === targetState;
                        
                        // Absolute height on layout
                        const barHeightPercentage = Math.abs(amp) * 100;
                        const isNegative = amp < 0;

                        return (
                          <div 
                            key={idx} 
                            onClick={() => handleSelectTarget(idx)}
                            className="flex-1 h-full flex flex-col justify-center items-center group cursor-pointer relative"
                          >
                            {/* Positive Amplitude Block */}
                            <div className="w-full flex-1 flex flex-col justify-end">
                              {!isNegative && amp > 0 && (
                                <motion.div
                                  layout
                                  className={`w-full max-w-[40px] rounded-t-lg transition-colors ${
                                    isTarget 
                                      ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                                      : 'bg-indigo-600/60 group-hover:bg-indigo-500/80'
                                  }`}
                                  style={{ height: `${barHeightPercentage}%` }}
                                  initial={false}
                                  animate={{ height: `${barHeightPercentage}%` }}
                                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                />
                              )}
                            </div>

                            {/* Center Line Split (0.0) */}
                            <div className={`w-full h-[2px] z-20 ${isTarget ? 'bg-emerald-400' : 'bg-zinc-800'}`} />

                            {/* Negative Amplitude Block */}
                            <div className="w-full flex-1 flex flex-col justify-start">
                              {isNegative && (
                                <motion.div
                                  layout
                                  className={`w-full max-w-[40px] rounded-b-lg transition-colors ${
                                    isTarget 
                                      ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                                      : 'bg-indigo-950 border border-indigo-500/30'
                                  }`}
                                  style={{ height: `${barHeightPercentage}%` }}
                                  initial={false}
                                  animate={{ height: `${barHeightPercentage}%` }}
                                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                />
                              )}
                            </div>

                            {/* VALUE FLOATING LABELS */}
                            <div className="absolute top-1 text-[8px] font-mono text-zinc-500 group-hover:text-zinc-300 pointer-events-none text-center">
                              <span className="block font-black text-white">{probability.toFixed(0)}%</span>
                              <span className={`block font-bold mt-0.5 text-[7px] ${amp < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                                {amp > 0 ? '+' : ''}{amp.toFixed(2)}
                              </span>
                            </div>

                            {/* STATE INDEX (Binary Label) */}
                            <div className={`absolute bottom-1 text-[8.5px] font-mono font-bold uppercase transition ${
                              isTarget ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-400'
                            }`}>
                              |{stateLabel(idx)}⟩
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-[8px] text-zinc-500 leading-normal border-t border-zinc-900/50 pt-2 flex justify-between flex-wrap gap-2">
                    <span>💡 Pro Tip: Click on any state bar (|000⟩ to |111⟩) to mark it as the correct database search target.</span>
                    <span className="text-zinc-400">Database Size N = 8 States (3 Qubits)</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: TEXT EXPLANATION & THEORETICAL MODULES (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* 1.3 GROVER'S ALGORITHM TEXT CONTENT CARD */}
                <div className="bg-gradient-to-br from-[#0c0a1a] via-black to-[#050510] border border-fuchsia-500/10 rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="border-b border-zinc-900 pb-3">
                    <h3 className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-fuchsia-400" />
                      1.3 Grover's Algorithm
                    </h3>
                    <p className="text-[9px] text-zinc-500 mt-1 uppercase font-bold tracking-widest leading-normal">
                      Quantum Search In Unsorted Databases
                    </p>
                  </div>

                  {/* MATHEMATICAL CONTRAST SECTION */}
                  <div className="grid grid-cols-2 gap-3 bg-black/50 p-3 rounded-xl border border-zinc-900">
                    <div className="space-y-1">
                      <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest font-black block">Classical Search</span>
                      <span className="text-xs font-black text-rose-400 block font-mono">O(N) Steps</span>
                      <p className="text-[8px] text-zinc-400 leading-relaxed">
                        Checks items sequentially. For N=1,000,000, checks 500,000 items on average to find target.
                      </p>
                    </div>
                    <div className="space-y-1 border-l border-zinc-900 pl-3">
                      <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest font-black block">Grover Quantum Search</span>
                      <span className="text-xs font-black text-emerald-400 block font-mono">O(√N) Steps</span>
                      <p className="text-[8px] text-zinc-400 leading-relaxed">
                        Checks items simultaneously in superposition. Checks only about 1,000 steps for N=1,000,000.
                      </p>
                    </div>
                  </div>

                  {/* USER REQUEST TEXT - EXACTLY WORDED FOR MAX ACCURACY */}
                  <div className="space-y-3.5 text-[9.5px] text-zinc-300 leading-relaxed max-h-[350px] overflow-y-auto pr-1">
                    <p>
                      <strong>Grover's Algorithm</strong> is one of the most famous applications of quantum gates. It provides a way to search through an unsorted database faster than any classical computer could.
                    </p>
                    <p>
                      If you have N items, a classical computer might have to check all N of them to find a specific item. Grover's algorithm can find it in roughly <code className="text-fuchsia-400 font-bold px-1 py-0.5 bg-black/50 rounded">\sqrt{'{N}'}</code> steps. For a list of 1,000,000 items, a classical computer checks 500,000 on average; Grover's checks only about 1,000.
                    </p>
                    
                    <div className="space-y-3 pl-2.5 border-l border-fuchsia-500/20">
                      <div>
                        <h4 className="font-black text-white uppercase text-[9px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                          1. Initialization (Equal Superposition)
                        </h4>
                        <p className="mt-0.5 text-zinc-400 text-[9px]">
                          First, we use Hadamard (H) gates on all qubits. Just like in the Bell State example, this puts the system into a state of equal superposition. Every possible answer in the database is equally likely.
                        </p>
                        <p className="text-zinc-500 text-[8.5px] mt-1 font-bold italic">
                          (Look at step 1 in the emulator: All the bars are at the same height.)
                        </p>
                      </div>

                      <div>
                        <h4 className="font-black text-white uppercase text-[9px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                          2. The Oracle (The Marker)
                        </h4>
                        <p className="mt-0.5 text-zinc-400 text-[9px]">
                          We then apply a special "black box" gate called the Oracle.
                        </p>
                        <ul className="list-disc pl-4 mt-1 space-y-0.5 text-zinc-400 text-[9px]">
                          <li><strong className="text-white">Mathematically:</strong> This is a diagonal matrix where most entries are 1, but the entry corresponding to the correct answer is -1.</li>
                          <li><strong className="text-white">Effect:</strong> It doesn't change the probability (height squared) yet, but it flips the phase (direction) of the correct answer.</li>
                        </ul>
                        <p className="text-zinc-500 text-[8.5px] mt-1 font-bold italic">
                          (Look at step 2 in the emulator: The bar for the correct answer has been flipped upside down.)
                        </p>
                      </div>

                      <div>
                        <h4 className="font-black text-white uppercase text-[9px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                          3. The Diffuser (The Mirror)
                        </h4>
                        <p className="mt-0.5 text-zinc-400 text-[9px]">
                          Next, we apply the Diffuser operator (also built from H-gates and X-gates). This step is often called "Inversion about the Mean."
                        </p>
                        <ul className="list-disc pl-4 mt-1 space-y-0.5 text-zinc-400 text-[9px]">
                          <li><strong className="text-white">The Logic:</strong> It calculates the average height of all the bars. It then flips all bars around that average line.</li>
                          <li><strong className="text-white">The Result:</strong> Since the correct answer's bar was negative (far below the average), flipping it around the average makes it shoot up high. The wrong answers (which were slightly above average) get pushed down.</li>
                        </ul>
                        <p className="text-zinc-500 text-[8.5px] mt-1 font-bold italic">
                          (Look at step 3 in the emulator: The correct answer's probability has been "amplified," while the others have shrunk.)
                        </p>
                      </div>

                      <div>
                        <h4 className="font-black text-white uppercase text-[9px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                          4. The Circuit
                        </h4>
                        <p className="mt-0.5 text-zinc-400 text-[9px]">
                          We repeat the Oracle and Diffuser steps <code className="text-fuchsia-400 px-0.5 bg-black/40 rounded">\approx \sqrt{'{N}'}</code> times. Each time, the correct answer's bar gets taller and the others get shorter. Finally, we measure the qubits. Because the probability of the correct answer is now nearly 100%, that is what we observe.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COMPUTATIONAL LOGS & AMPLIFICATION MATH TRACKER */}
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                    <Binary className="w-3.5 h-3.5 text-indigo-400" />
                    Quantum State Telemetry & Logs
                  </h4>
                  
                  {isCustomMode ? (
                    /* PlayGround Logs */
                    <div className="bg-black/60 rounded-xl p-3 border border-zinc-900 h-32 overflow-y-auto font-mono text-[9px] text-zinc-400 space-y-1">
                      {customLogs.map((log, lidx) => (
                        <div key={lidx} className="border-b border-zinc-950 pb-1">
                          <span className="text-fuchsia-500 mr-1.5">[{new Date().toLocaleTimeString()}]</span>
                          {log}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Standard Presets Helper Information */
                    <div className="bg-black/40 rounded-xl p-3 border border-zinc-900 space-y-2 text-[9px]">
                      <div className="flex justify-between border-b border-zinc-950 pb-1.5">
                        <span className="text-zinc-500">Amplitude Equation Mode:</span>
                        <span className="text-emerald-400 font-bold uppercase">
                          {groverStep === 0 ? 'Pure Ground State' :
                           groverStep === 1 ? 'Hadamard Equal Superposition' :
                           groverStep === 2 ? 'Oracle Phase Shift' :
                           groverStep === 3 ? 'Inversion About Mean (Iter 1)' :
                           groverStep === 4 ? 'Optimal Target Amplification' :
                           'Coherent Measurement State'}
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono text-[8px] text-zinc-400">
                        <div className="flex justify-between">
                          <span>Target State Probability Amplitude:</span>
                          <span className="text-white font-bold">{amplitudes[targetState].toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Observation Probability:</span>
                          <span className="text-emerald-400 font-bold">{targetProb.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wrong States Probability (Each):</span>
                          <span className="text-zinc-500">
                            {(((100 - targetProb) / 7)).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-zinc-900/40 pt-1.5 mt-1.5">
                          <span>Coherence Mean Offset Value:</span>
                          <span className="text-fuchsia-400">{meanAmplitude.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-zinc-600">STATE: ACTIVE</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomMode(true);
                        setCustomLogs(['[SYSTEM] Custom mode active. Trigger operators manually.']);
                      }}
                      className={`text-[8.5px] font-bold uppercase px-2 py-0.5 rounded border ${
                        isCustomMode 
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' 
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {isCustomMode ? 'Custom Playground Active' : 'Switch to Custom Mode'}
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
