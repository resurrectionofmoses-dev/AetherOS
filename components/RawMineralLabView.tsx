
import React, { useState, useRef, useEffect } from 'react';
import { GemIcon, ActivityIcon, ShieldIcon, SpinnerIcon, ZapIcon } from './icons';
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
        float n = noise(uv * 3.0 + u_time * 0.2);
        
        // Lattice effect
        float lattice = abs(sin(uv.x * 10.0 + n) * cos(uv.y * 10.0 + n));
        lattice = smoothstep(0.4, 0.5, lattice);

        // Color based on purity
        vec3 colorHi = vec3(0.9, 0.8, 0.4); // Gold-ish
        vec3 colorLo = vec3(0.4, 0.4, 0.5); // Stone-ish
        vec3 baseColor = mix(colorLo, colorHi, u_purity / 100.0);
        
        // Scanline logic
        float scan = abs(sin(uv.y * 2.0 - u_time * 1.5));
        float scanLine = smoothstep(0.98, 1.0, scan);

        vec3 finalColor = baseColor * (0.5 + 0.5 * lattice);
        finalColor += scanLine * vec3(0.0, 1.0, 1.0) * 0.5; // Cyan scan flare
        
        float alpha = smoothstep(0.8, 0.2, dist);
        gl_FragColor = vec4(finalColor, alpha * 0.6);
    }
`;

export const RawMineralLabView: React.FC<LabComponentProps> = ({ 
  labName = "RAW MINERAL LAB", 
  labIcon: LabIcon = GemIcon, 
  labColor = "text-stone-400", 
  description = "Elemental composition analysis and structural stress testing." 
}) => {
  const [purity, setPurity] = useState(94.2);
  const [isScanning, setIsScanning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

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
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, []);

  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    let frame: number;
    const render = (time: number) => {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      const posLoc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time * 0.001);
      gl.uniform1f(gl.getUniformLocation(program, 'u_purity'), purity);
      gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), gl.canvas.width, gl.canvas.height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [purity]);

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

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setPurity(prev => +(prev + (Math.random() - 0.5)).toFixed(1));
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] overflow-hidden font-mono text-stone-300">
      <div className="p-6 border-b-8 border-black bg-stone-900 flex justify-between items-center shadow-xl z-20">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-stone-500/10 border-4 border-stone-600 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-stone-500 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <button 
          onClick={runScan}
          disabled={isScanning}
          className="px-10 py-3 bg-stone-600 hover:bg-stone-500 text-black rounded-2xl border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all disabled:opacity-50"
        >
          {isScanning ? 'GPU_DECONSTRUCTING...' : 'SCROLL SPECTRUM'}
        </button>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* WebGL Visualization Background */}
        <div className="absolute inset-0 z-0">
          <canvas ref={canvasRef} className="w-full h-full opacity-60" />
        </div>
        
        <div className="max-w-xl w-full aero-panel bg-black/80 border-4 border-stone-800 p-10 text-center space-y-10 shadow-[20px_20px_0_0_rgba(0,0,0,1)] relative z-10">
            <h3 className="font-comic-header text-4xl text-white uppercase italic tracking-widest">Shard Purity</h3>
            
            <div className="relative">
                {isScanning && <div className="absolute inset-0 border-t-4 border-cyan-400 animate-scan pointer-events-none z-20" />}
                <div className={`text-9xl font-black transition-all duration-700 ${isScanning ? 'opacity-20 blur-md' : 'text-stone-300 wisdom-glow'}`}>
                    {purity}%
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl">
                    <p className="text-[8px] text-stone-600 uppercase font-black mb-1">Density</p>
                    <p className="text-white font-bold">12.4 g/cm³</p>
                </div>
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl">
                    <p className="text-[8px] text-stone-600 uppercase font-black mb-1">GPU Compute</p>
                    <p className="text-cyan-400 font-bold uppercase">Active</p>
                </div>
            </div>
            
            <p className="text-xs italic text-stone-500">"Procedural lattice resonance confirms the integrity of the raw code mineral via hardware shaders."</p>
        </div>
      </div>
      
      <style>{`
        .animate-scan {
            animation: scan 1.5s ease-in-out infinite;
        }
        @keyframes scan {
            0% { transform: translateY(-50px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(200px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
