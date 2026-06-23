
import React, { useState, useEffect, useRef } from 'react';
import { 
    EyeIcon, ActivityIcon, ZapIcon, GaugeIcon, SpinnerIcon, 
    ShieldIcon, FireIcon, CheckCircleIcon, TerminalIcon, 
    SearchIcon, WarningIcon, ScaleIcon
} from './icons';
import type { LabComponentProps } from '../types';

export const VisualSynthesisLabView: React.FC<LabComponentProps> = ({ 
  labName = "VISUAL SYNTHESIS LAB", 
  labIcon: LabIcon = EyeIcon, 
  labColor = "text-emerald-500", 
  description = "Project Chronos Visual Data Ingestion & K10 Hyper-Sharding." 
}) => {
  const [ingestionRate, setIngestionRate] = useState(1.2);
  const [bufferIntegrity, setBufferIntegrity] = useState(99.9);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dataStream, setDataStream] = useState<string[]>([]);

  // Quantum load dynamics
  const [acousticPressure, setAcousticPressure] = useState(65.0);
  const [harmonicStride, setHarmonicStride] = useState(4.2);
  const [autoFluctuate, setAutoFluctuate] = useState(true);

  // Dynamic calculation of active circuit nodes being processed by shader in real-time
  const activeNodesCount = React.useMemo(() => {
    const baseValue = isProcessing ? 86 : 13;
    // Modulate based on dynamic acoustic pressure and high-frequency millisecond-level noise to reflect real-time active shader workloads
    const noise = Math.sin(Date.now() * 0.008) * (isProcessing ? 5 : 1);
    const pressureComponent = (acousticPressure - 30) * (isProcessing ? 0.45 : 0.05);
    const calculated = Math.round(baseValue + pressureComponent + noise);
    return Math.max(isProcessing ? 35 : 13, calculated);
  }, [isProcessing, acousticPressure]);

  // Fluctuations for dynamic cybernetic metrics
  useEffect(() => {
    if (!autoFluctuate) return;
    let frameId: number;
    
    const tick = () => {
      const time = Date.now() * 0.001;
      const basePressure = isProcessing ? 88.0 : 54.0;
      const noise = Math.sin(time * 0.8) * 12.0 + Math.cos(time * 1.6) * 6.0;
      const spikes = isProcessing ? (Math.random() > 0.94 ? Math.random() * 16 : 0) : 0;
      
      setAcousticPressure(prev => {
        const target = Math.max(30, Math.min(120, basePressure + noise + spikes));
        return prev + (target - prev) * 0.1;
      });

      const baseStride = isProcessing ? 5.2 : 2.8;
      const strideNoise = Math.sin(time * 0.5) * 1.8;
      setHarmonicStride(prev => {
        const target = Math.max(1.0, Math.min(8.0, baseStride + strideNoise));
        return prev + (target - prev) * 0.08;
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [autoFluctuate, isProcessing]);

  // Sync state cleanly into a Ref to avoid WebGL context rebuilds/jank
  const currentMetricsRef = useRef({ acousticPressure, harmonicStride, isProcessing });
  useEffect(() => {
    currentMetricsRef.current = { acousticPressure, harmonicStride, isProcessing };
  }, [acousticPressure, harmonicStride, isProcessing]);

  // Canvas referencing
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hardware Accelerated WebGL Engine compilation & loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) {
      console.warn('WebGL initialization failed. falling back.');
      return;
    }

    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_acoustic_pressure;
      uniform float u_harmonic_stride;
      uniform float u_is_processing;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float zoom = 11.0 + u_harmonic_stride * 4.5;
        vec2 g_uv = uv * vec2(zoom, zoom * (u_resolution.y / u_resolution.x));
        vec2 id = floor(g_uv);
        vec2 f_uv = fract(g_uv) - 0.5;

        // Visual board grid line boundaries
        float grid = smoothstep(0.47, 0.5, max(abs(f_uv.x), abs(f_uv.y)));

        float n = hash(id);
        float val = 0.0;
        float speed = u_time * (0.35 + u_acoustic_pressure / 65.0);
        float thickness = 0.02 + u_acoustic_pressure * 0.00035;

        if (n < 0.25) {
          float dist = abs(f_uv.y);
          val = smoothstep(thickness, 0.0, dist);
        } else if (n < 0.5) {
          float dist = abs(f_uv.x);
          val = smoothstep(thickness, 0.0, dist);
        } else if (n < 0.75) {
          float dist = abs(length(f_uv - 0.5) - 0.5);
          val = smoothstep(thickness, 0.0, dist);
        } else {
          float dist = length(f_uv);
          val = smoothstep(thickness * 2.1, 0.0, dist);
        }

        // Processing particle charges propagating along channels
        float particle = 0.0;
        if (n < 0.65) {
          float flow = fract(uv.x * 2.8 + (uv.y * 0.7) - speed * 0.6);
          particle = smoothstep(0.09, 0.0, abs(flow - 0.5)) * val;
        }

        vec3 base_color = vec3(0.01, 0.05, 0.02);
        vec3 glow_color = vec3(0.05, 0.75, 0.38); // Standard Emerald

        // Gradient shifting based on critical load levels (dB warning Spl index)
        if (u_acoustic_pressure > 92.0) {
          float t = clamp((u_acoustic_pressure - 92.0) / 28.0, 0.0, 1.0);
          glow_color = mix(vec3(0.95, 0.52, 0.1), vec3(0.95, 0.12, 0.1), t);
        } else if (u_acoustic_pressure > 72.0) {
          float t = clamp((u_acoustic_pressure - 72.0) / 20.0, 0.0, 1.0);
          glow_color = mix(glow_color, vec3(0.95, 0.52, 0.1), t);
        }

        vec3 col = mix(base_color, glow_color, val * 0.3 + particle * 0.7);

        // Holographic laser sweep overlay
        float laserY = 0.5 + 0.5 * sin(u_time * 0.35);
        float distToLaser = abs(uv.y - laserY);
        float laserGlow = smoothstep(0.05, 0.0, distToLaser) * 0.16;
        col += glow_color * laserGlow;

        // Add soft secondary grid line highlight
        col += glow_color * grid * 0.035;

        gl_FragColor = vec4(col, 0.95);
      }
    `;

    const loadShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation failed: ', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader program linking failed: ', gl.getProgramInfoLog(program));
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const uTimeLocation = gl.getUniformLocation(program, 'u_time');
    const uResolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const uAcousticPressureLocation = gl.getUniformLocation(program, 'u_acoustic_pressure');
    const uHarmonicStrideLocation = gl.getUniformLocation(program, 'u_harmonic_stride');
    const uIsProcessingLocation = gl.getUniformLocation(program, 'u_is_processing');

    let animationFrameId: number;
    const startTime = Date.now();

    const resizeCanvas = () => {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    const render = () => {
      resizeCanvas();

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      const elapsedSeconds = (Date.now() - startTime) / 1000.0;
      gl.uniform1f(uTimeLocation, elapsedSeconds);
      gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(uAcousticPressureLocation, currentMetricsRef.current.acousticPressure);
      gl.uniform1f(uHarmonicStrideLocation, currentMetricsRef.current.harmonicStride);
      gl.uniform1f(uIsProcessingLocation, currentMetricsRef.current.isProcessing ? 1.0 : 0.0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    resizeCanvas();
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  // Simulation of K10 Hyper-Sharding
  useEffect(() => {
    let interval: number;
    if (isProcessing) {
      interval = window.setInterval(() => {
        setIngestionRate(prev => Math.max(0.5, Math.min(5.0, prev + (Math.random() - 0.5) * 0.5)));
        setBufferIntegrity(prev => Math.min(100, prev + (Math.random() > 0.8 ? 0.01 : 0)));
        setDataStream(prev => {
            const shard = `K10_SHARD_0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0')}`;
            return [`[INGEST] ${shard} >> WITNESSARY_OK`, ...prev].slice(0, 8);
        });
      }, 300);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isProcessing]);

  const toggleProcessing = () => {
    setIsProcessing(!isProcessing);
    if (!isProcessing) {
        setDataStream(prev => ["[SYSTEM] Initiating K10 Hyper-Sharding Protocol...", ...prev]);
    }
  };

  const isHighLoad = acousticPressure > 75;

  return (
    <div className="h-full flex flex-col bg-[#020502] overflow-hidden font-mono text-emerald-100">
      <div className="p-6 border-b-8 border-black bg-emerald-950/20 flex justify-between items-center shadow-xl z-20">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-900/10 border-4 border-emerald-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="px-4 py-2 bg-black border-2 border-emerald-900 rounded-xl flex items-center gap-2">
                <ShieldIcon className="w-4 h-4 text-green-500" />
                <span className="text-[8px] font-black uppercase text-green-500 tracking-widest">PZIS: SECURE</span>
            </div>
            <button 
                onClick={toggleProcessing}
                className={`px-6 py-3 rounded-2xl border-4 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isProcessing ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white animate-pulse'}`}
            >
                {isProcessing ? 'HALT INGESTION' : 'INITIATE SYNTHESIS'}
            </button>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto custom-scrollbar">
        
        {/* Main Visualization */}
        <div 
          className="lg:col-span-8 aero-panel bg-black/80 border-4 border-black p-8 flex flex-col justify-center items-center relative overflow-hidden shadow-[12px_12px_0_0_#000]"
          data-processing={isProcessing ? "true" : undefined}
          data-high-load={isHighLoad ? "true" : undefined}
          style={{
            '--circuit-color-base': 'rgba(16, 185, 129, 0.1)',
            '--circuit-color-glow': 'rgba(16, 185, 129, 0.15)',
            '--circuit-color-spark': 'rgba(52, 211, 153, 0.5)',
          } as React.CSSProperties}
        >
             <style>{`
                @keyframes circuitFlow {
                  0% { stroke-dashoffset: 200; }
                  100% { stroke-dashoffset: 0; }
                }
                @keyframes circuitProcessingPulse {
                  0%, 100% { opacity: 0.15; transform: scale(1); }
                  50% { opacity: 0.75; transform: scale(1.02); }
                }
                @keyframes forensicDeconstructionPulse {
                  0%, 100% { opacity: 0.4; }
                  50% { opacity: 1.0; }
                }
                @keyframes signalNoise {
                  0%, 100% { transform: translate(0, 0) skewX(0deg); opacity: 1; }
                  15% { transform: translate(0, 0) skewX(0deg); opacity: 1; }
                  20% { transform: translate(-1.5px, 0.5px) skewX(1deg); opacity: 0.5; }
                  25% { transform: translate(1.5px, -0.5px) skewX(-1deg); opacity: 0.9; }
                  30% { transform: translate(0, 0) skewX(0deg); opacity: 1; }
                  65% { transform: translate(0, 0) skewX(0deg); opacity: 1; }
                  70% { transform: translate(1.5px, -1px) skewX(-2deg); opacity: 0.4; }
                  75% { transform: translate(-1.5px, 1px) skewX(2deg); opacity: 0.9; }
                  80% { transform: translate(0, 0) skewX(0deg); opacity: 1; }
                }
                @keyframes dataDropout {
                  0%, 45%, 49%, 91%, 95%, 100% {
                    opacity: 1;
                    stroke-dasharray: 12, 24;
                  }
                  46% {
                    opacity: 0.1;
                    stroke-dasharray: 1, 120;
                  }
                  47% {
                    opacity: 0.01;
                    stroke-dasharray: 0, 200;
                  }
                  48% {
                    opacity: 0.25;
                    stroke-dasharray: 3, 40;
                  }
                  92% {
                    opacity: 0.03;
                    stroke-dasharray: 0, 150;
                  }
                  94% {
                    opacity: 0.35;
                    stroke-dasharray: 2, 60;
                  }
                }
                .circuit-line {
                  stroke-dasharray: 12, 24;
                  animation: circuitFlow ${isProcessing ? '6s' : '15s'} linear infinite${isProcessing ? ', circuitProcessingPulse 1.8s ease-in-out infinite' : ''};
                  transition: stroke-dasharray 0.3s, stroke 0.3s, transform 0.5s ease-in-out;
                  transform-origin: center;
                }
                .aero-panel[data-processing] .circuit-line {
                  animation: circuitFlow 6s linear infinite, forensicDeconstructionPulse 1.2s ease-in-out infinite, signalNoise 0.22s linear infinite !important;
                }
                .aero-panel[data-high-load] .circuit-line {
                  animation: circuitFlow 6s linear infinite, forensicDeconstructionPulse 1.2s ease-in-out infinite, signalNoise 0.22s linear infinite, dataDropout 4.2s ease-in-out infinite !important;
                }
                .aero-panel:hover .circuit-line {
                  animation-duration: ${isProcessing ? '1.5s' : '3s'}${isProcessing ? ', 0.9s' : ''};
                }
                @keyframes nodePulse {
                  0%, 100% { transform: scale(1); opacity: 0.3; }
                  50% { transform: scale(1.4); opacity: 0.8; }
                }
                .circuit-node {
                  transform-origin: center;
                  animation: nodePulse 3s ease-in-out infinite;
                  transition: fill 0.3s, transform 0.3s;
                }
                .aero-panel:hover .circuit-node {
                  animation-duration: 0.75s;
                }
                @keyframes forensicGridScan {
                  0% { top: 0%; opacity: 0; }
                  10% { opacity: 0.5; }
                  90% { opacity: 0.5; }
                  100% { top: 100%; opacity: 0; }
                }
                .forensic-grid-scanner {
                  animation: forensicGridScan ${isProcessing ? '5s' : '12s'} linear infinite;
                }
                .aero-panel:hover .forensic-grid-scanner {
                  animation-duration: ${isProcessing ? '1.25s' : '2.5s'};
                }
              `}</style>

             <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.24] z-0" />

             <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

             {/* Animated visual telemetry circuit logic paths */}
             <svg 
               className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.15]" 
               viewBox="0 0 800 500" 
               preserveAspectRatio="none"
             >
               <g fill="none" strokeWidth="2" strokeLinecap="round">
                 {/* Left branch */}
                 <path 
                   d="M 50 100 L 150 200 L 350 200 L 400 250" 
                   stroke={isProcessing ? '#34d399' : '#047857'} 
                   className="circuit-line" 
                 />
                 <path 
                   d="M 150 200 L 100 250 L 100 400" 
                   stroke={isProcessing ? '#a7f3d0' : '#064e3b'} 
                   className="circuit-line" 
                   style={{ animationDelay: '-1.5s' }}
                 />
                 
                 {/* Center branch */}
                 <path 
                   d="M 400 50 L 400 450" 
                   stroke={isProcessing ? '#d1fae5' : '#059669'} 
                   className="circuit-line" 
                   style={{ animationDelay: '-3.5s' }}
                 />

                 {/* Right branch */}
                 <path 
                   d="M 750 100 L 650 200 L 450 200 L 400 250" 
                   stroke={isProcessing ? '#48bb78' : '#047857'} 
                   className="circuit-line" 
                   style={{ animationDelay: '-2.5s' }}
                 />
                 <path 
                   d="M 650 200 L 700 250 L 700 400" 
                   stroke={isProcessing ? '#a7f3d0' : '#064e3b'} 
                   className="circuit-line" 
                   style={{ animationDelay: '-4.5s' }}
                 />

                 {/* Bottom inputs */}
                 <path 
                   d="M 200 450 L 300 350 L 500 350 L 600 450" 
                   stroke={isProcessing ? '#34d399' : '#047857'} 
                   className="circuit-line" 
                   style={{ animationDelay: '-5.5s' }}
                 />
               </g>

               {/* Circuit Nodes */}
               <g fill={isProcessing ? '#34d399' : '#059669'}>
                 <circle cx="50" cy="100" r="4.5" className="circuit-node" style={{ animationDelay: '0.2s', transformBox: 'fill-box' }} />
                 <circle cx="150" cy="200" r="4.5" className="circuit-node" style={{ animationDelay: '0.8s', transformBox: 'fill-box' }} />
                 <circle cx="350" cy="200" r="4.5" className="circuit-node" style={{ animationDelay: '1.4s', transformBox: 'fill-box' }} />
                 <circle cx="400" cy="250" r="5.5" className="circuit-node" style={{ animationDelay: '2s', transformBox: 'fill-box', fill: isProcessing ? '#a7f3d0' : '#10b981' }} />
                  
                 <circle cx="100" cy="400" r="4.5" className="circuit-node" style={{ animationDelay: '1.1s', transformBox: 'fill-box' }} />
                 <circle cx="750" cy="100" r="4.5" className="circuit-node" style={{ animationDelay: '0.5s', transformBox: 'fill-box' }} />
                 <circle cx="650" cy="200" r="4.5" className="circuit-node" style={{ animationDelay: '1.2s', transformBox: 'fill-box' }} />
                 <circle cx="450" cy="200" r="4.5" className="circuit-node" style={{ animationDelay: '1.7s', transformBox: 'fill-box' }} />
                 <circle cx="700" cy="400" r="4.5" className="circuit-node" style={{ animationDelay: '2.5s', transformBox: 'fill-box' }} />
                  
                 <circle cx="200" cy="450" r="4.5" className="circuit-node" style={{ animationDelay: '0.9s', transformBox: 'fill-box' }} />
                 <circle cx="300" cy="350" r="4.5" className="circuit-node" style={{ animationDelay: '1.5s', transformBox: 'fill-box' }} />
                 <circle cx="500" cy="350" r="4.5" className="circuit-node" style={{ animationDelay: '2.1s', transformBox: 'fill-box' }} />
                 <circle cx="600" cy="450" r="4.5" className="circuit-node" style={{ animationDelay: '2.7s', transformBox: 'fill-box' }} />
               </g>
             </svg>

             {/* Forensic laser sweep line */}
             <div className={`absolute left-0 right-0 h-[2px] pointer-events-none z-10 ${isProcessing ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'bg-emerald-950 shadow-[0_0_6px_rgba(6,78,59,0.5)]'} forensic-grid-scanner`} />
             
             <div className="text-center space-y-10 relative z-10 w-full">
                <div className="flex justify-between items-end gap-6 flex-wrap sm:flex-nowrap">
                    <div className="text-left">
                        <p className="text-[10px] text-emerald-900 font-black uppercase tracking-[0.5em] mb-4">Data Stream Velocity</p>
                        <div className="text-9xl font-black text-white wisdom-glow tracking-tighter leading-none">
                            {ingestionRate.toFixed(1)}<span className="text-2xl text-emerald-900 ml-2">GB/S</span>
                        </div>
                    </div>
                    <div className="flex gap-10 items-end shrink-0 select-none">
                        {/* Dynamic active circuit nodes counter sub-component */}
                        <div id="dynamic-shader-nodes-counter" className="text-right">
                            <p className="text-[10px] text-emerald-800 font-black uppercase tracking-widest mb-2 flex items-center justify-end gap-1.5 leading-none">
                                <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isProcessing ? 'bg-emerald-400' : 'bg-emerald-800'}`} />
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isProcessing ? 'bg-emerald-400' : 'bg-emerald-850'}`} />
                                </span>
                                Active Nodes
                            </p>
                            <p className="text-4xl font-mono font-black text-white tracking-widest leading-none">
                                {String(activeNodesCount).padStart(3, '0')}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-650 text-gray-600 font-black uppercase tracking-widest mb-2">Witnessary Buffer</p>
                            <p className="text-4xl font-comic-header text-emerald-500">{bufferIntegrity}%</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
                    <div className="p-4 bg-black border-2 border-emerald-900/30 rounded-2xl">
                        <p className="text-[8px] text-emerald-800 font-black uppercase mb-1">Visual Tensor</p>
                        <p className="text-2xl font-comic-header text-white">OPTIMAL</p>
                    </div>
                    <div className="p-4 bg-black border-2 border-emerald-900/30 rounded-2xl">
                        <p className="text-[8px] text-emerald-800 font-black uppercase mb-1">Protocol Divergence</p>
                        <p className="text-2xl font-comic-header text-green-500">0.00%</p>
                    </div>
                    <div className="p-4 bg-black border-2 border-emerald-900/30 rounded-2xl">
                        <p className="text-[8px] text-emerald-800 font-black uppercase mb-1">Grid Saturation</p>
                        <p className="text-2xl font-comic-header text-white">42%</p>
                    </div>
                    <div className="p-4 bg-black border-2 border-emerald-900/30 rounded-2xl">
                        <p className="text-[8px] text-emerald-800 font-black uppercase mb-1">Abundance Mode</p>
                        <p className="text-2xl font-comic-header text-amber-500 animate-pulse">ACTIVE</p>
                    </div>
                </div>
             </div>

             {/* Data Stream Log */}
             <div className="w-full mt-10 p-6 bg-emerald-950/10 border-2 border-emerald-900/20 rounded-3xl">
                <h4 className="font-comic-header text-2xl text-emerald-700 uppercase italic mb-4 flex items-center gap-3">
                    <TerminalIcon className="w-6 h-6" /> Chronos Ingestion Feed
                </h4>
                <div className="space-y-2 font-mono text-[10px] text-emerald-400 h-24 overflow-y-auto custom-scrollbar">
                    {isProcessing ? (
                        dataStream.map((log, i) => (
                            <div key={i} className="flex gap-3 border-l-2 border-emerald-900 pl-4 py-0.5 animate-in slide-in-from-left-2">
                                <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                                <span className="italic">{log}</span>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center opacity-20 py-4">
                            <p className="uppercase tracking-[0.3em] font-black">Link Established. Standby.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Audit & Compliance Sidecar */}
        <div className="lg:col-span-4 flex flex-col gap-8 overflow-hidden">
            {/* Acoustic Conduction Controls */}
            <div className="aero-panel bg-slate-900 p-6 border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="font-comic-header text-2xl text-emerald-500 uppercase italic flex items-center gap-2">
                        <ActivityIcon className="w-5 h-5 animate-pulse" /> Conduction Load
                    </h3>
                    <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded border border-white/5">
                      <span className="text-[7.5px] text-zinc-500 font-black uppercase">AUTO</span>
                      <input 
                        type="checkbox"
                        checked={autoFluctuate}
                        onChange={(e) => setAutoFluctuate(e.target.checked)}
                        className="w-3.5 h-3.5 text-emerald-500 accent-emerald-500 bg-zinc-900 border-zinc-700 rounded cursor-pointer"
                        id="conduction_metrics_autoforward_toggle"
                      />
                    </div>
                </div>

                <div className="space-y-4 text-xs font-mono">
                    {/* Acoustic Pressure DB */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-zinc-500 uppercase">Acoustic Pressure</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              acousticPressure > 90.0 ? 'bg-red-950/40 text-red-400' :
                              acousticPressure > 70.0 ? 'bg-amber-950/40 text-amber-400' :
                              'bg-emerald-950/40 text-emerald-400'
                            }`}>{acousticPressure.toFixed(1)} dB SPL</span>
                        </div>
                        <input 
                            type="range"
                            min="30"
                            max="120"
                            step="0.5"
                            value={acousticPressure}
                            onChange={(e) => {
                              setAutoFluctuate(false);
                              setAcousticPressure(parseFloat(e.target.value));
                            }}
                            className="w-full h-1.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            id="acoustic_pressure_control_slider"
                        />
                    </div>

                    {/* Harmonic Stride */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-zinc-500 uppercase">Harmonic Stride Factor</span>
                            <span className="text-emerald-400 text-[10px] font-bold">{harmonicStride.toFixed(2)}</span>
                        </div>
                        <input 
                            type="range"
                            min="1.0"
                            max="8.0"
                            step="0.05"
                            value={harmonicStride}
                            onChange={(e) => {
                              setAutoFluctuate(false);
                              setHarmonicStride(parseFloat(e.target.value));
                            }}
                            className="w-full h-1.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            id="harmonic_stride_control_slider"
                        />
                    </div>

                    {/* Digital LED Load Telemetry Indicators */}
                    <div className="p-3 bg-black border border-white/5 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[8px] text-zinc-500 uppercase">System Status:</span>
                            <span className={`text-[8.5px] font-bold uppercase ${
                              acousticPressure > 90.0 ? 'text-red-500 animate-pulse' :
                              acousticPressure > 70.0 ? 'text-amber-500' :
                              'text-emerald-400'
                            }`}>
                              {acousticPressure > 90.0 ? 'CRITICAL STRESS' :
                               acousticPressure > 70.0 ? 'HEAVY WORKLOAD' :
                               'STABLE CONDUCTION'}
                            </span>
                        </div>
                        <div className="grid grid-cols-10 gap-1 h-2">
                          {Array.from({ length: 10 }).map((_, i) => {
                            const threshold = 30 + i * 9;
                            const isActive = acousticPressure >= threshold;
                            let barColor = 'bg-emerald-600 shadow-[0_0_5px_rgba(16,185,129,0.5)]';
                            if (threshold > 90) {
                              barColor = 'bg-red-600 shadow-[0_0_5px_rgba(239,68,68,0.5)]';
                            } else if (threshold > 70) {
                              barColor = 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]';
                            }
                            return (
                              <div 
                                key={i} 
                                className={`h-full rounded-sm transition-all duration-300 ${
                                  isActive ? barColor : 'bg-zinc-950 border border-white/5'
                                }`} 
                              />
                            );
                          })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="aero-panel bg-slate-900 p-6 border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <h3 className="font-comic-header text-2xl text-emerald-500 uppercase italic flex items-center gap-2">
                        <ScaleIcon className="w-5 h-5" /> Data Integrity
                    </h3>
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                </div>
                
                <div className="space-y-6">
                    <div className="p-4 bg-emerald-950/10 border-2 border-emerald-900/20 rounded-2xl relative overflow-hidden group">
                        <SearchIcon className="absolute -right-4 -bottom-4 w-20 h-20 opacity-5 group-hover:scale-110 transition-transform" />
                        <h4 className="text-sm font-black text-white uppercase mb-2">Forensic Verification</h4>
                        <p className="text-[10px] text-gray-400 leading-relaxed italic mb-4">
                            Every visual shard is hashed against the Project Chronos Witnessary to ensure absolute fidelity and zero-drift.
                        </p>
                        <div className="w-full py-2 bg-emerald-600/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 text-center">
                            Auto-Audit: ENABLED
                        </div>
                    </div>

                    <div className="space-y-3">
                        {['Resolution: 8K', 'Bit Depth: 12-bit', 'Colorspace: REC.2020', 'Compression: LOSSLESS'].map((spec, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-black border border-white/5 rounded-xl">
                                <span className="text-[9px] font-black text-gray-500 uppercase">{spec.split(':')[0]}</span>
                                <span className="text-[9px] font-mono text-white">{spec.split(':')[1]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-6">
                    <div className="p-4 bg-amber-900/10 border-2 border-amber-600/30 rounded-2xl">
                        <p className="text-[9px] text-gray-400 leading-relaxed italic">
                            "The Eye of the System never blinks. Ingesting visual data at this velocity requires absolute architectural confidence."
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Lab Footer */}
      <div className="p-4 bg-slate-900 border-t-8 border-black flex justify-between items-center z-30 px-10 shadow-inner">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-600 animate-ping" />
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest leading-none">Synthesis: ACTIVE</span>
            </div>
            <span className="text-[9px] text-gray-700 font-mono tracking-widest uppercase">
                Shard Integrity: 0x03E2 | Forensic Stride: 1.2 PB/S
            </span>
        </div>
        <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.3em] hidden sm:block">"Project Chronos: Visualizing the Absolute."</p>
      </div>
    </div>
  );
};
