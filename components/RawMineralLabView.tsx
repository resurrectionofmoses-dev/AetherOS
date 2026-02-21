import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    GemIcon, ActivityIcon, ShieldIcon, SpinnerIcon, ZapIcon, FireIcon, 
    TerminalIcon, ScaleIcon, SearchIcon, CheckCircleIcon, WarningIcon, 
    LogicIcon, FlaskIcon 
} from './icons';
import type { LabComponentProps } from '../types';

const MINERAL_SHADER_VS = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const MINERAL_SHADER_FS = `
    precision mediump float;
    uniform float u_time;
    uniform float u_purity;
    uniform float u_load;
    uniform vec3 u_color_primary;
    uniform vec3 u_color_secondary;
    uniform vec2 u_resolution;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv = uv * 2.0 - 1.0;
        uv.x *= u_resolution.x / u_resolution.y;

        float dist = length(uv);
        float n = noise(uv * (3.0 + u_load * 0.1) + u_time * 0.2);
        
        // Fractal deconstruction lattice
        float lattice = abs(sin(uv.x * (10.0 + u_load * 0.5) + n) * cos(uv.y * (10.0 + u_load * 0.5) + n));
        lattice = smoothstep(0.4 - u_load * 0.002, 0.5 + u_load * 0.002, lattice);

        // Dynamic color bleeding
        vec3 baseColor = mix(u_color_secondary, u_color_primary, u_purity / 100.0);
        
        // Glitch scanlines
        float scan = abs(sin(uv.y * (50.0 + u_load) - u_time * 5.0));
        float scanLine = smoothstep(0.99, 1.0, scan);

        vec3 finalColor = baseColor * (0.3 + 0.7 * lattice);
        finalColor += scanLine * vec3(1.0) * (u_load / 100.0);
        
        // Add "Reedle" energy pulses
        float pulse = abs(sin(u_time * 2.0)) * 0.1;
        finalColor += (1.0 - smoothstep(0.0, 0.1, abs(dist - 0.5 - pulse))) * u_color_primary * 0.5;

        float alpha = smoothstep(0.8, 0.1, dist);
        gl_FragColor = vec4(finalColor, alpha * 0.8);
    }
`;

interface MineralProfile {
    id: string;
    name: string;
    primaryColor: [number, number, number];
    secondaryColor: [number, number, number];
    basePurity: number;
    volatility: number;
}

const MINERALS: MineralProfile[] = [
    { id: 'thumrium', name: 'THUMRIUM', primaryColor: [0.9, 0.1, 0.3], secondaryColor: [0.2, 0.0, 0.5], basePurity: 36.4, volatility: 0.88 },
    { id: 'gold_aurum', name: 'GOLD_AURUM', primaryColor: [1.0, 0.8, 0.0], secondaryColor: [0.4, 0.3, 0.0], basePurity: 99.4, volatility: 0.02 },
    { id: 'shard_03e2', name: 'SHARD_0x03E2', primaryColor: [0.0, 0.8, 1.0], secondaryColor: [0.0, 0.2, 0.4], basePurity: 100.0, volatility: 0.00 },
];

export const RawMineralLabView: React.FC<LabComponentProps> = ({ 
  labName = "RAW MINERAL LAB", 
  labIcon: LabIcon = GemIcon, 
  labColor = "text-stone-400", 
  description = "Forensic deconstruction of " + "Thumrium" + " and other high-misery logic shards.",
  onActionReward
}) => {
  const [activeProfile, setActiveProfile] = useState<MineralProfile>(MINERALS[0]);
  const [purity, setPurity] = useState(MINERALS[0].basePurity);
  const [forensicLoad, setForensicLoad] = useState(14);
  const [isDeconstructing, setIsDeconstructing] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[READY] Mass spectrometer calibrated for Thumrium.", "[OK] Dielectric vacuum holding at 10^-9 Torr."]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number | null>(null);

  const addLog = useCallback((msg: string, color: 'info' | 'warn' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const colorClasses = {
        info: 'text-gray-500',
        warn: 'text-red-500 font-bold animate-pulse',
        success: 'text-green-400 font-black'
    };
    setLogs(prev => [`[${timestamp}] <span class="${colorClasses[color]}">${msg}</span>`, ...prev].slice(0, 15));
  }, []);

  // WebGL Initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;
    glRef.current = gl;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error(gl.getShaderInfoLog(shader));
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, MINERAL_SHADER_VS);
    const fs = createShader(gl.FRAGMENT_SHADER, MINERAL_SHADER_FS);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    programRef.current = program;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, []);

  // Optimized Render Loop
  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    const render = (time: number) => {
      if (!canvasRef.current) return;
      
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      const posLoc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time * 0.001);
      gl.uniform1f(gl.getUniformLocation(program, 'u_purity'), purity);
      gl.uniform1f(gl.getUniformLocation(program, 'u_load'), forensicLoad);
      gl.uniform3fv(gl.getUniformLocation(program, 'u_color_primary'), activeProfile.primaryColor);
      gl.uniform3fv(gl.getUniformLocation(program, 'u_color_secondary'), activeProfile.secondaryColor);
      gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), gl.canvas.width, gl.canvas.height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);
    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [purity, forensicLoad, activeProfile]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = parent.clientHeight;
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDeconstruct = () => {
    if (isDeconstructing) return;
    setIsDeconstructing(true);
    addLog(`Initiating deconstruction of ${activeProfile.name}...`, 'info');

    let currentPurity = activeProfile.basePurity;
    let currentLoad = 14;

    const interval = setInterval(() => {
        const volatilityFactor = activeProfile.volatility * (Math.random() - 0.2);
        currentPurity = Math.min(100, currentPurity + (Math.random() * 5));
        currentLoad = Math.min(100, currentLoad + (Math.random() * 8));
        
        setPurity(currentPurity);
        setForensicLoad(currentLoad);

        if (currentLoad > 85 && Math.random() > 0.7) {
            addLog(`CRITICAL: Neural drift detected in ${activeProfile.name} core!`, 'warn');
        }

        if (currentPurity >= 100) {
            clearInterval(interval);
            setIsDeconstructing(false);
            addLog(`${activeProfile.name} logic fully manifest. Shard siphoned.`, 'success');
            onActionReward?.(Math.round(activeProfile.volatility * 50) + 10);
            
            // Auto-reset after a short delay
            setTimeout(() => {
                setPurity(activeProfile.basePurity);
                setForensicLoad(14);
            }, 2000);
        }
    }, 100);
  };

  const selectMineral = (m: MineralProfile) => {
      if (isDeconstructing) return;
      setActiveProfile(m);
      setPurity(m.basePurity);
      setForensicLoad(14);
      addLog(`Spectrum shifted to ${m.name}.`, 'info');
  };

  return (
    <div className="h-full flex flex-col bg-[#020202] overflow-hidden font-mono text-cyan-100 selection:bg-cyan-500/30">
      {/* Mineral Header */}
      <div className="px-6 py-5 border-b-4 border-black bg-[#0a0a0a] flex justify-between items-center shadow-2xl z-30">
        <div className="flex items-center gap-5">
            <div className={`w-14 h-14 bg-white/5 border-4 rounded-2xl flex items-center justify-center transition-all duration-500 ${isDeconstructing ? 'border-red-600 shadow-[0_0_25px_rgba(239,68,68,0.4)]' : 'border-zinc-800'}`}>
                <LabIcon className={`w-9 h-9 ${isDeconstructing ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`} />
            </div>
            <div>
                <h2 className="font-comic-header text-4xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1 italic">
                   {isDeconstructing ? 'DECONSTRUCTING_LOGIC_SHARD' : 'AWAITING_KINETIC_TRIGGER'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-10">
            <div className="text-right">
                <span className="text-[7px] text-gray-700 font-black uppercase block mb-1">CONJUNCTION_STRIDE</span>
                <span className="text-xl font-comic-header text-cyan-500">1.22 PB/S</span>
            </div>
            <div className="px-5 py-2 bg-black border-4 border-black rounded-xl text-green-500 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                VACUUM_SEALED
            </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6 relative">
        {/* Background Ambience */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Left: Inventory & Selection */}
        <div className="w-80 flex flex-col gap-6 flex-shrink-0 z-10">
            <div className="aero-panel bg-black/60 border-4 border-black p-5 flex flex-col shadow-[8px_8px_0_0_#000]">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                   <SearchIcon className="w-4 h-4" /> Shard Inventory
                </h3>
                <div className="space-y-3">
                    {MINERALS.map(m => (
                        <button
                            key={m.id}
                            onClick={() => selectMineral(m)}
                            disabled={isDeconstructing}
                            className={`w-full p-4 rounded-2xl border-4 transition-all duration-300 text-left relative overflow-hidden group ${
                                activeProfile.id === m.id 
                                ? 'bg-zinc-900 border-white/20 shadow-lg' 
                                : 'bg-black border-black hover:border-zinc-800 opacity-60'
                            }`}
                        >
                            <div className="flex justify-between items-center relative z-10">
                                <p className="font-black text-white text-sm uppercase tracking-tighter">{m.name}</p>
                                <GemIcon className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: `rgb(${m.primaryColor.map(c => c * 255).join(',')})` }} />
                            </div>
                            <div className="mt-2 flex items-center gap-2 relative z-10">
                                <div className="h-1 flex-1 bg-black rounded-full overflow-hidden">
                                    <div className="h-full bg-gray-800" style={{ width: `${m.basePurity}%` }} />
                                </div>
                                <span className="text-[7px] font-mono text-gray-600">{m.basePurity}% AUR</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 aero-panel bg-black/40 border-4 border-black p-5 flex flex-col overflow-hidden shadow-[8px_8px_0_0_#000]">
                <h3 className="text-xs font-black text-violet-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                   <TerminalIcon className="w-4 h-4" /> Forensic Stream
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 text-[10px] font-mono">
                    {logs.map((log, i) => (
                        <div key={i} className="animate-in slide-in-from-left-2 border-b border-white/5 pb-1" dangerouslySetInnerHTML={{ __html: log }} />
                    ))}
                </div>
            </div>
        </div>

        {/* Center: The Deconstruction Chamber */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 relative z-10">
            <div className="flex-1 aero-panel bg-[#050505] border-4 border-black relative overflow-hidden flex flex-col shadow-[20px_20px_60px_rgba(0,0,0,0.8)]">
                {/* WebGL Canvas */}
                <canvas 
                    ref={canvasRef} 
                    className="absolute inset-0 w-full h-full cursor-crosshair opacity-90 transition-opacity duration-1000" 
                />

                {/* HUD Overlays */}
                <div className="absolute top-8 left-8 space-y-4 pointer-events-none">
                    <div className="bg-black/80 border-2 border-white/10 p-4 rounded-2xl backdrop-blur-md shadow-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <ActivityIcon className="w-4 h-4 text-cyan-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-gray-400">Atomic Resonance</span>
                        </div>
                        <div className="text-4xl font-comic-header text-white">
                            {purity.toFixed(2)}%
                        </div>
                    </div>

                    <div className={`bg-black/80 border-2 p-4 rounded-2xl backdrop-blur-md shadow-xl transition-colors duration-500 ${forensicLoad > 80 ? 'border-red-600' : 'border-white/10'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <FireIcon className={`w-4 h-4 ${forensicLoad > 80 ? 'text-red-500 animate-ping' : 'text-orange-500'}`} />
                            <span className="text-[10px] font-black uppercase text-gray-400">Forensic Load</span>
                        </div>
                        <div className={`text-4xl font-comic-header ${forensicLoad > 80 ? 'text-red-500' : 'text-white'}`}>
                            {forensicLoad.toFixed(0)}u
                        </div>
                    </div>
                </div>

                {/* Right Side HUD */}
                <div className="absolute top-8 right-8 pointer-events-none">
                    <div className="bg-black/80 border-2 border-white/10 p-4 rounded-2xl backdrop-blur-md text-right">
                         <p className="text-[10px] font-black text-gray-600 uppercase mb-1">Volatitly Coefficient</p>
                         <p className="text-xl font-comic-header text-amber-500">{activeProfile.volatility.toFixed(2)}</p>
                         <div className="mt-4 flex flex-col items-end gap-1">
                            <div className="w-16 h-1 bg-gray-900 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: `${activeProfile.volatility * 100}%` }} />
                            </div>
                            <span className="text-[6px] text-gray-800 font-black uppercase">0x03E2_RESIDUE</span>
                         </div>
                    </div>
                </div>

                {/* Control Footer inside Chamber */}
                <div className="mt-auto p-10 flex flex-col items-center gap-6 relative z-20">
                    <div className="flex items-center gap-8">
                        <button 
                            onClick={handleDeconstruct}
                            disabled={isDeconstructing}
                            className={`vista-button px-16 py-6 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] transition-all shadow-[10px_10px_0_0_#000] border-4 border-black active:translate-y-2 active:shadow-none disabled:opacity-50 ${
                                isDeconstructing 
                                ? 'bg-red-600 text-white animate-pulse' 
                                : 'bg-cyan-600 hover:bg-cyan-500 text-black'
                            }`}
                        >
                            {isDeconstructing ? (
                                <div className="flex items-center gap-4">
                                    <SpinnerIcon className="w-6 h-6 animate-spin" />
                                    <span>DECONSTRUCTING...</span>
                                </div>
                            ) : (
                                <span>INITIATE FORENSIC SCAN</span>
                            )}
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-600 italic font-mono uppercase tracking-[0.4em]">"The show starts when the logic flows."</p>
                </div>
            </div>
        </div>

        {/* Right: Technical Specs & Shards */}
        <div className="w-80 flex flex-col gap-6 flex-shrink-0 z-10">
            <div className="aero-panel bg-black/60 border-4 border-black p-6 flex flex-col shadow-[8px_8px_0_0_#000]">
                <h3 className="font-comic-header text-2xl text-amber-500 uppercase italic mb-6 border-b border-amber-900/30 pb-2 flex items-center gap-3">
                    <ScaleIcon className="w-6 h-6" /> Elemental Data
                </h3>
                <div className="space-y-4">
                    {[
                        { label: 'Density', val: '19.32 g/cm³', icon: ActivityIcon },
                        { label: 'Atomic ID', val: '0x004F', icon: ZapIcon },
                        { label: 'Resonance', val: '432 Hz', icon: ActivityIcon },
                        { label: 'Stability', val: 'VULNERABLE', icon: ShieldIcon },
                    ].map(item => (
                        <div key={item.label} className="p-3 bg-white/5 rounded-xl border-2 border-black flex justify-between items-center group hover:border-amber-600 transition-all">
                            <div className="flex items-center gap-3">
                                <item.icon className="w-4 h-4 text-amber-900 group-hover:text-amber-500 transition-colors" />
                                <span className="text-[10px] font-black text-gray-500 uppercase">{item.label}</span>
                            </div>
                            <span className="text-xs font-bold text-white uppercase">{item.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="aero-panel bg-black/40 border-4 border-black p-6 flex flex-col flex-1 shadow-[8px_8px_0_0_#000]">
                <h3 className="font-comic-header text-2xl text-cyan-400 uppercase italic mb-4 flex items-center gap-3">
                    <FlaskIcon className="w-6 h-6" /> Yield Potential
                </h3>
                <div className="flex-1 flex flex-col justify-center items-center text-center p-4 border-4 border-dashed border-zinc-900 rounded-[2rem] opacity-30 group hover:opacity-100 transition-opacity">
                    <ZapIcon className="w-16 h-16 text-cyan-900 group-hover:text-cyan-400 transition-all duration-1000 mb-4" />
                    <p className="text-xl font-comic-header text-gray-600 uppercase tracking-widest mb-2">Shard Bounty</p>
                    <p className="text-4xl font-black text-white">{Math.round(activeProfile.volatility * 50) + 10}<span className="text-sm ml-1 text-cyan-900 font-mono">S</span></p>
                    <p className="mt-6 text-[8px] text-gray-700 font-black uppercase leading-relaxed">
                        Complete deconstruction to earn potential logic units. Volatility increases yield but threatens conduction stability.
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Lab Stride Footer */}
      <div className="p-3 bg-slate-950 border-t-8 border-black flex items-center justify-between z-40 px-10 shadow-inner">
          <div className="flex items-center gap-10">
             <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">Status: HIGH_PRESSURE</span>
             </div>
             <div className="text-[10px] text-gray-700 font-mono italic uppercase hidden sm:block">
                Stride: 1.2 PB/s | Buffer: 0x03E2 | Complexity: MAX_ELEMENTAL
             </div>
          </div>
          <div className="flex items-center gap-4">
              <CheckCircleIcon className="w-4 h-4 text-green-900" />
              <span className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.4em] hidden md:block">
                  Mineral forensic deconstruction station.
              </span>
          </div>
      </div>

      <style>{`
        .animate-spin-slow {
            animation: spin 15s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
