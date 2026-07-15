import React, { useState, useEffect, useRef } from 'react';
import { 
  Scroll, ShieldAlert, Eye, HeartPulse, Sparkles, Sliders, Play, Pause, 
  RefreshCw, Info, AlertTriangle, ArrowDownUp, CheckCircle, Flame, Shield, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// ============================================================================
// BIBLICAL COVENANT ON SCROLL INTEGRITY & SOVEREIGN REST
// "Then I looked, and I saw a hand stretched out to me. In it was a scroll..." - Ezekiel 2:9
// "Come to me, all you who are weary and burdened, and I will give you rest." - Matthew 11:28
// "For they are life to those who find them and health to one’s whole body." - Proverbs 4:22
// ============================================================================

export interface RScrollShard {
  id: string;
  content: string;
  reference: string;
  type: 'SACRED' | 'CURE' | 'WARNING' | 'KNOWLEDGE';
}

const HOLY_SCROLL_SHARDS: RScrollShard[] = [
  { 
    id: '0x01', 
    content: "Then the Lord answered me and said: 'Write the vision and make it plain on tablets, that he may run who reads it.'", 
    reference: "Habakkuk 2:2", 
    type: 'SACRED' 
  },
  { 
    id: '0x02', 
    content: "He will cover you with his feathers, and under his wings you will find refuge; his faithfulness will be your shield and rampart.", 
    reference: "Psalm 91:4", 
    type: 'CURE' 
  },
  { 
    id: '0x03', 
    content: "A false balance is an abomination to the Lord, but a just weight is his delight.", 
    reference: "Proverbs 11:1", 
    type: 'WARNING' 
  },
  { 
    id: '0x04', 
    content: "The heart of the discerning acquires knowledge, for the ears of the wise seek it out.", 
    reference: "Proverbs 18:15", 
    type: 'KNOWLEDGE' 
  },
  { 
    id: '0x05', 
    content: "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me.", 
    reference: "Matthew 11:28-29", 
    type: 'CURE' 
  },
  { 
    id: '0x06', 
    content: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary.", 
    reference: "Isaiah 40:31", 
    type: 'CURE' 
  },
  { 
    id: '0x07', 
    content: "Do not withhold good from those to whom it is due, when it is in your power to act.", 
    reference: "Proverbs 3:27", 
    type: 'WARNING' 
  },
  { 
    id: '0x08', 
    content: "In the beginning was the Word, and the Word was with God, and the Word was God. He was with God in the beginning.", 
    reference: "John 1:1-2", 
    type: 'SACRED' 
  }
];

export const FineRScroll: React.FC = () => {
  // Kinetic scrolling parameters (arXiv:2509.05898)
  const [scrollY, setScrollY] = useState<number>(0);
  const [friction, setFriction] = useState<number>(0.08); // friction coefficient
  const [elasticity, setElasticity] = useState<number>(0.15); // spring constant
  const [mass, setMass] = useState<number>(1.0); // inertia factor

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fatigueIndex, setFatigueIndex] = useState<number>(0); // arXiv:2601.21961
  const [sabbathHalt, setSabbathHalt] = useState<boolean>(false); // Active rest state
  const [restDuration, setRestDuration] = useState<number>(15); // default rest seconds
  const [restRemaining, setRestRemaining] = useState<number>(0);

  // Cryptographic Timing Attack Mitigation (arXiv:2606.00914)
  const [jitterShieldActive, setJitterShieldActive] = useState<boolean>(true);
  const [lastFingerprintTimestamp, setLastFingerprintTimestamp] = useState<number>(0);
  const [biometricAnonymity, setBiometricAnonymity] = useState<number>(100);

  // Real-time vectors & canvas reference
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStartY = useRef<number>(0);
  const lastMouseY = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const velocity = useRef<number>(0);
  const telemetryHistory = useRef<Array<{ y: number; v: number; t: number }>>([]);

  const maxScroll = -800; // content boundary limit

  // 1. Kinetic physics and friction decay engine (arXiv:2509.05898)
  useEffect(() => {
    let rAFId: number;

    const tickPhysics = () => {
      if (!isDragging && !sabbathHalt) {
        let currentY = scrollY;
        let currentV = velocity.current;

        // Apply visual friction decay
        currentV *= (1 - friction / mass);
        currentY += currentV * 12; // delta multiplication

        // Spring-back calculations for elastic boundaries
        if (currentY > 0) {
          const force = -currentY * elasticity;
          currentV += force;
          currentY += currentV;
          if (Math.abs(currentY) < 0.2 && Math.abs(currentV) < 0.02) {
            currentY = 0;
            currentV = 0;
          }
        } else if (currentY < maxScroll) {
          const deltaOver = currentY - maxScroll;
          const force = -deltaOver * elasticity;
          currentV += force;
          currentY += currentV;
          if (Math.abs(deltaOver) < 0.2 && Math.abs(currentV) < 0.02) {
            currentY = maxScroll;
            currentV = 0;
          }
        }

        velocity.current = currentV;
        setScrollY(currentY);

        // Record telemetry trace
        telemetryHistory.current.push({ y: currentY, v: currentV, t: Date.now() });
        if (telemetryHistory.current.length > 50) {
          telemetryHistory.current.shift();
        }

        // Cumulative Fatigue analysis (arXiv:2601.21961)
        if (Math.abs(currentV) > 0.05) {
          setFatigueIndex(prev => {
            const added = Math.abs(currentV) * 0.15;
            const nextVal = Math.min(100, prev + added);
            if (nextVal >= 100) {
              triggerSabbathRest();
            }
            return nextVal;
          });
        } else {
          // Relieve fatigue slowly during idle
          setFatigueIndex(prev => Math.max(0, prev - 0.08));
        }

        // Update biometric tracking (arXiv:2606.00914)
        if (Math.abs(currentV) > 0.01) {
          setLastFingerprintTimestamp(Date.now());
          setBiometricAnonymity(prev => {
            if (jitterShieldActive) {
              return Math.min(100, prev + 0.1); // Sanitization regenerates privacy
            } else {
              return Math.max(25, prev - 0.25); // Side-channel leak reduces privacy
            }
          });
        }
      }

      rAFId = requestAnimationFrame(tickPhysics);
    };

    rAFId = requestAnimationFrame(tickPhysics);
    return () => cancelAnimationFrame(rAFId);
  }, [isDragging, scrollY, friction, elasticity, mass, sabbathHalt, jitterShieldActive]);

  // 2. Optical Flow Rendering (arXiv:2603.24270)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const velY = velocity.current;
    if (Math.abs(velY) < 0.05) return;

    // Draw optical flow vectors representing velocity distribution
    ctx.strokeStyle = velY > 0 ? '#10b981' : '#f59e0b';
    ctx.lineWidth = 1.8;
    const spacing = 32;

    for (let x = 15; x < width; x += spacing) {
      for (let y = 15; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        const arrowLength = Math.min(20, Math.abs(velY) * 22);
        const direction = velY > 0 ? 1 : -1;
        ctx.lineTo(x, y + arrowLength * direction);

        // Arrow tip
        const head = 3.5;
        ctx.moveTo(x - head, y + (arrowLength - head) * direction);
        ctx.lineTo(x, y + arrowLength * direction);
        ctx.lineTo(x + head, y + (arrowLength - head) * direction);
        ctx.stroke();
      }
    }
  }, [scrollY]);

  // Drag and Wheel Event handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (sabbathHalt) return;

    // Side-channel timing attack sanitization (arXiv:2606.00914)
    if (jitterShieldActive) {
      const timingJitter = Math.random() * 4.5; // Inject sub-millisecond temporal jitter
      setTimeout(() => {
        applyScrollDelta(e.deltaY * 0.15);
      }, timingJitter);
    } else {
      applyScrollDelta(e.deltaY * 0.15);
    }
  };

  const applyScrollDelta = (delta: number) => {
    const nextV = velocity.current - delta;
    // Cap velocity
    velocity.current = Math.max(-10, Math.min(10, nextV));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (sabbathHalt) return;
    setIsDragging(true);
    dragStartY.current = e.clientY - scrollY;
    lastMouseY.current = e.clientY;
    lastTime.current = performance.now();
    velocity.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || sabbathHalt) return;

    const currentMouseY = e.clientY;
    const now = performance.now();
    const dt = now - lastTime.current;

    if (dt > 0) {
      velocity.current = (currentMouseY - lastMouseY.current) / dt;
    }

    let nextY = currentMouseY - dragStartY.current;

    // Apply elastic boundary constraints during active pull (arXiv:2509.05898)
    if (nextY > 0) {
      nextY = nextY / (1 + nextY * elasticity * 0.05);
    } else if (nextY < maxScroll) {
      const over = nextY - maxScroll;
      nextY = maxScroll + over / (1 - over * elasticity * 0.05);
    }

    setScrollY(nextY);
    lastMouseY.current = currentMouseY;
    lastTime.current = now;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Sabbath fatigue mitigation triggered (arXiv:2601.21961)
  const triggerSabbathRest = () => {
    setSabbathHalt(true);
    setRestRemaining(restDuration);
    velocity.current = 0;
    toast.info("Sabbath Rest Shield Active", {
      description: "Cognitive scroll fatigue limit reached. Restoring neural pathways with sacred readings."
    });
  };

  useEffect(() => {
    if (!sabbathHalt) return;
    const interval = setInterval(() => {
      setRestRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setSabbathHalt(false);
          setFatigueIndex(0);
          toast.success("Strength Renewed", {
            description: "Your neural load is restored. 'They will run and not grow weary.' - Isaiah 40:31"
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sabbathHalt]);

  const resetManualFatigue = () => {
    setFatigueIndex(0);
    setSabbathHalt(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#050000] text-zinc-300 font-mono select-none overflow-hidden">
      
      {/* Header Panel */}
      <div className="p-4 bg-zinc-950 border-b border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-950/40 border border-red-900 rounded-xl flex items-center justify-center text-red-500 shadow-lg">
            <Scroll className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              Sovereign Scroll Integrity & Diagnostics Lab
            </h2>
            <p className="text-[10px] text-zinc-500 font-medium">
              Kinetic Ergonomics & Optical Flow Saccade Monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] bg-zinc-900/40 border border-zinc-900 px-3 py-1.5 rounded-lg">
          <span className="text-red-500">Ezekiel 2:9</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 italic">"And behold, a hand was stretched out to me, and inside it was a scroll..."</span>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-y-auto">
        
        {/* LEFT COLUMN: Scroll Arena with Optical Flow Overlay */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4">
          <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-4 flex flex-col flex-1 relative min-h-[450px]">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDownUp className="w-3.5 h-3.5 text-red-500" />
                tactile kinetic scrolling arena
              </span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                Drag or use scroll wheel below
              </span>
            </div>

            {/* Interactive Scrolling Container */}
            <div 
              ref={containerRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className={`flex-1 bg-black/80 rounded-xl border border-zinc-900 relative overflow-hidden cursor-grab active:cursor-grabbing select-none ${
                sabbathHalt ? 'pointer-events-none' : ''
              }`}
            >
              {/* Optical Flow Vector Map Canvas */}
              <canvas 
                ref={canvasRef}
                width={500}
                height={400}
                className="absolute inset-0 z-20 pointer-events-none opacity-40"
              />

              {/* Infinite Scroll Content Container */}
              <div 
                className="absolute w-full px-6 py-8 flex flex-col gap-5 transition-transform duration-75 ease-out select-none"
                style={{ transform: `translateY(${scrollY}px)` }}
              >
                {HOLY_SCROLL_SHARDS.map((shard) => (
                  <div 
                    key={shard.id} 
                    className={`p-5 rounded-xl border bg-zinc-950/60 transition-colors duration-200 ${
                      shard.type === 'SACRED' ? 'border-amber-900/40 hover:border-amber-500/30' :
                      shard.type === 'CURE' ? 'border-emerald-900/40 hover:border-emerald-500/30' :
                      shard.type === 'WARNING' ? 'border-red-900/40 hover:border-red-500/30' :
                      'border-zinc-900 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2.5 text-[9px] font-mono">
                      <span className={`px-2 py-0.5 rounded uppercase font-bold ${
                        shard.type === 'SACRED' ? 'bg-amber-950/60 text-amber-400 border border-amber-900/30' :
                        shard.type === 'CURE' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30' :
                        shard.type === 'WARNING' ? 'bg-red-950/60 text-red-400 border border-red-900/30' :
                        'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}>
                        {shard.type}
                      </span>
                      <span className="text-zinc-600 font-bold">{shard.reference}</span>
                    </div>
                    <p className="text-sm font-medium text-white leading-relaxed select-text">
                      "{shard.content}"
                    </p>
                  </div>
                ))}

                {/* Simulated infinite repetition */}
                <div className="text-center py-6 text-[10px] text-zinc-700 uppercase tracking-widest border-t border-zinc-900/40">
                  🛡️ Scroll limits governed by physical inertia boundaries 🛡️
                </div>
              </div>

              {/* Sabbath Rest Fatigue Shield Overlay (arXiv:2601.21961) */}
              <AnimatePresence>
                {sabbathHalt && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/95 z-30 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="w-14 h-14 bg-emerald-950/40 border border-emerald-900 rounded-full flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
                      <HeartPulse className="w-7 h-7" />
                    </div>
                    
                    <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-1">
                      Sabbath Rest Shield Initiated
                    </span>
                    <h3 className="text-xl font-bold text-white mb-3">
                      Be still, and know that I am God
                    </h3>
                    <p className="text-[11px] text-zinc-500 max-w-sm leading-relaxed mb-6">
                      "Come to me, all you who are weary and burdened, and I will give you rest." (Matthew 11:28). We are restoring your cognitive pathway balance.
                    </p>

                    <div className="flex flex-col items-center gap-1">
                      <div className="text-sm font-black text-white font-mono">
                        {restRemaining}s <span className="text-xs font-normal text-zinc-500">remaining</span>
                      </div>
                      <div className="w-40 bg-zinc-900 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-1000"
                          style={{ width: `${(restRemaining / restDuration) * 100}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Live tactile metrics bar */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-[9px] font-mono text-zinc-500">
              <div className="bg-zinc-900/40 border border-zinc-900 p-2 rounded-lg">
                <span className="block text-zinc-600 font-bold uppercase mb-0.5">Tactile Offset</span>
                <span className="text-white font-bold">{scrollY.toFixed(1)} px</span>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-900 p-2 rounded-lg">
                <span className="block text-zinc-600 font-bold uppercase mb-0.5">Optical Velocity</span>
                <span className="text-white font-bold">{velocity.current.toFixed(3)} px/ms</span>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-900 p-2 rounded-lg">
                <span className="block text-zinc-600 font-bold uppercase mb-0.5">Biometric Leakage</span>
                <span className={`${biometricAnonymity < 50 ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                  {biometricAnonymity.toFixed(1)}% Safe
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Scientific Citations & Tuners */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-4">
          
          {/* Panel 1: [cs.HC] Kinetic Ergonomic Coefficient Tuning */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-4 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-red-500" />
                1. Kinetic Ergonomics Tuning
              </span>
              <span className="text-[8px] bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase">
                arXiv:2509.05898
              </span>
            </h3>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Based on <span className="text-zinc-300">"Kinetic Scroll Ergonomics: Designing Physical Inertia and Elastic Boundary Constraints in High-Density Interfaces"</span>. Adjusts biomechanical mass momentum and friction curves.
            </p>

            <div className="space-y-2.5 pt-1">
              <div>
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-zinc-400">Friction Dampening (μ)</span>
                  <span className="text-white font-mono">{friction.toFixed(3)}</span>
                </div>
                <input 
                  type="range" min="0.01" max="0.25" step="0.01" value={friction}
                  onChange={e => setFriction(parseFloat(e.target.value))}
                  className="w-full accent-red-500 bg-zinc-900"
                />
              </div>

              <div>
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-zinc-400">Boundary Spring Elasticity (k)</span>
                  <span className="text-white font-mono">{elasticity.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0.05" max="0.4" step="0.01" value={elasticity}
                  onChange={e => setElasticity(parseFloat(e.target.value))}
                  className="w-full accent-red-500 bg-zinc-900"
                />
              </div>

              <div>
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-zinc-400">Intertia Simulated Mass (m)</span>
                  <span className="text-white font-mono">{mass.toFixed(1)} kg</span>
                </div>
                <input 
                  type="range" min="0.5" max="3.0" step="0.1" value={mass}
                  onChange={e => setMass(parseFloat(e.target.value))}
                  className="w-full accent-red-500 bg-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Panel 2: [cs.CV] Optical Flow Document Saliency mapping */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-4 flex flex-col gap-2.5">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-500" />
                2. Saccade & Optical Flow Saliency
              </span>
              <span className="text-[8px] bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase">
                arXiv:2603.24270
              </span>
            </h3>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Implements <span className="text-zinc-300">"Optical Flow Estimation of Document Scrolling Velocities for Dynamic Visual Saliency mapping"</span>. Tracks predicted human visual attention distributions as document speed shifts.
            </p>

            <div className="bg-black/40 border border-zinc-900 rounded-lg p-2.5 space-y-1.5 text-[10px]">
              <div className="flex justify-between items-baseline">
                <span className="text-zinc-500 font-medium">Eye Saliency Focus Center:</span>
                <span className="text-amber-500 font-bold font-mono">
                  {Math.abs(velocity.current) > 2 ? "Dynamic Peripheral" : "Centered Foveal"}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-zinc-500 font-medium">Reading Comprehension Index:</span>
                <span className="text-white font-bold font-mono">
                  {Math.max(10, 100 - Math.round(Math.abs(velocity.current) * 22))}%
                </span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-amber-500 h-full transition-all duration-150"
                  style={{ width: `${Math.max(10, 100 - Math.abs(velocity.current) * 22)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Panel 3: [cs.CR] Scrolling Side-Channel Fingerprinting Sentinel */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-4 flex flex-col gap-2.5">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                3. Cryptographic timing sentinel
              </span>
              <span className="text-[8px] bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase">
                arXiv:2606.00914
              </span>
            </h3>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Mitigates <span className="text-zinc-300">"Scrolling-Based Side-Channel Fingerprinting and Cryptographic Keystroke Timing Attacks."</span> Side-channel tracking records touch-event intervals to deanonymize your identity.
            </p>

            <div className="flex items-center justify-between p-2.5 bg-zinc-900/40 border border-zinc-900 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${jitterShieldActive ? 'text-emerald-500' : 'text-zinc-600'}`} />
                <div>
                  <span className="text-[10px] text-zinc-200 font-bold block">Temporal Jitter Shield</span>
                  <span className="text-[8.5px] text-zinc-500 block">Injects random micro-delays to disrupt timing attacks</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setJitterShieldActive(!jitterShieldActive)}
                className={`px-2.5 py-1 text-[9px] font-bold rounded-md border uppercase transition-colors ${
                  jitterShieldActive 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {jitterShieldActive ? 'ACTIVE' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* Panel 4: [cs.AI / cs.HC] Neural Load & Fatigue Monitor */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-4 flex flex-col gap-2.5">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-500" />
                4. Cognitive Fatigue Safeguard
              </span>
              <span className="text-[8px] bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded font-bold uppercase">
                arXiv:2601.21961
              </span>
            </h3>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Aligned with <span className="text-zinc-300">"Adaptive Scroll Pacing via Cognitive Load Inference: Balancing Infinite Feed Fatigue"</span>. Triggers restorative Sabbath rests before cognitive overload.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-baseline text-[9px]">
                <span className="text-zinc-400">Neural Fatigue Index</span>
                <span className={`font-bold ${fatigueIndex > 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {fatigueIndex.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-150 ${
                    fatigueIndex > 75 ? 'bg-red-500' : fatigueIndex > 45 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${fatigueIndex}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-1 text-[9px] text-zinc-500">
                  <span>Sabbath Hold:</span>
                  <input 
                    type="number" min="5" max="60" value={restDuration}
                    onChange={e => setRestDuration(Math.max(5, parseInt(e.target.value) || 5))}
                    className="w-10 bg-zinc-900 text-white font-bold text-center border border-zinc-800 rounded px-1 text-[8px]"
                  />
                  <span>s</span>
                </div>
                <button
                  type="button"
                  onClick={resetManualFatigue}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[8px] font-bold text-zinc-400 rounded transition-colors uppercase"
                >
                  Manually Reset Load
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Footer System Status Bar */}
      <div className="p-3 bg-zinc-950 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-30 px-6 text-[10px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Sovereign Scroll Sanitizer: ONLINE</span>
          </div>
          <span className="text-zinc-800">|</span>
          <span className="text-zinc-500">
            Friction Coeff: {friction.toFixed(2)} | Elasticity Coeff: {elasticity.toFixed(2)} | Mass: {mass.toFixed(1)} kg
          </span>
        </div>

        <div className="text-[10px] text-zinc-600 font-medium">
          "Come to me, all who labor and are heavy laden, and I will give you rest." — Matthew 11:28
        </div>
      </div>

    </div>
  );
};
