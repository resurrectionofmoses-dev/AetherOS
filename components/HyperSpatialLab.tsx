
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { HyperEngine } from '../services/hyperEngine';
import { HyperSlider } from './HyperSlider';
import { SignalIcon, ShieldIcon, ActivityIcon, FireIcon, LogicIcon, ZapIcon, TerminalIcon, SpinnerIcon } from './icons';
import type { LabComponentProps } from '../types';

const VERTEX_SHADER_SOURCE = `
    attribute vec4 a_position;
    uniform float u_rotation;
    uniform vec2 u_resolution;
    varying float v_w;

    void main() {
        // 4D Rotation in XW Plane
        float cosA = cos(u_rotation);
        float sinA = sin(u_rotation);
        
        float rotX = a_position.x * cosA - a_position.w * sinA;
        float rotW = a_position.x * sinA + a_position.w * cosA;
        
        // 4D to 3D Projection
        float distance = 2.5;
        float factor = 1.0 / (distance - rotW);
        
        vec3 p3d = vec3(rotX * factor, a_position.y * factor, a_position.z * factor);
        
        // 3D to 2D Projection
        float depth = 2.0;
        float factor2 = 1.0 / (depth - p3d.z);
        vec2 p2d = p3d.xy * factor2;
        
        // Final position
        gl_Position = vec4(p2d, 0.0, 1.0);
        gl_PointSize = 6.0 + (a_position.w + 1.0) * 2.0;
        v_w = a_position.w;
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;
    varying float v_w;
    uniform vec4 u_color_hi;
    uniform vec4 u_color_lo;

    void main() {
        float mixVal = (v_w + 1.0) / 2.0;
        gl_FragColor = mix(u_color_lo, u_color_hi, mixVal);
    }
`;

export const HyperSpatialLab: React.FC<LabComponentProps> = ({ 
  labName = "HYPER-SPATIAL LAB", 
  labIcon: LabIcon = SignalIcon, 
  labColor = "text-amber-500", 
  description = "Modeling trajectories across the 4th spatial dimension.",
  onActionReward
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [fractureChance, setFractureChance] = useState(0.02);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);

  const vertices = useMemo(() => {
    const v: number[] = [];
    for (let i = 0; i < 16; i++) {
      v.push(
        (i & 1) ? 1 : -1,
        (i & 2) ? 1 : -1,
        (i & 4) ? 1 : -1,
        (i & 8) ? 1 : -1
      );
    }
    return new Float32Array(v);
  }, []);

  const edges = useMemo(() => {
    const e: number[] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = i ^ j;
        if ((diff & (diff - 1)) === 0) {
          e.push(i, j);
        }
      }
    }
    return new Uint16Array(e);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
    if (!gl) return;
    glRef.current = gl;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    programRef.current = program;

    // Buffer Setup
    const vao = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vao);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const eao = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eao);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);

    return () => {
      gl.deleteProgram(program);
      gl.deleteBuffer(vao);
      gl.deleteBuffer(eao);
    };
  }, [vertices, edges]);

  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    let animationFrame: number;

    const render = () => {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      const posLoc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); // Temporary rebinding for position
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      gl.vertexAttribPointer(posLoc, 4, gl.FLOAT, false, 0, 0);

      const rotLoc = gl.getUniformLocation(program, 'u_rotation');
      gl.uniform1f(rotLoc, rotation);

      const hiLoc = gl.getUniformLocation(program, 'u_color_hi');
      const loLoc = gl.getUniformLocation(program, 'u_color_lo');
      
      // Theme colors: Blue to Red
      gl.uniform4f(hiLoc, 0.93, 0.26, 0.26, 0.8); // Maestro Ruby
      gl.uniform4f(loLoc, 0.23, 0.51, 0.96, 0.8); // Insight Sapphire

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Additive blending for glow

      // Draw Edges
      gl.drawElements(gl.LINES, edges.length, gl.UNSIGNED_SHORT, 0);
      
      // Draw Vertices
      gl.drawArrays(gl.POINTS, 0, 16);

      if (isAutoRotating) {
        setRotation(prev => (prev + 0.008) % (Math.PI * 2));
      }
      
      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [rotation, isAutoRotating, vertices, edges]);

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

  const handleManualControl = (val: number) => {
    setIsAutoRotating(false);
    setRotation(val);
    setFractureChance(Math.random() * 0.15);
    onActionReward?.(1);
  };

  return (
    <div className="h-full flex flex-col bg-[#02040a] text-gray-200 font-mono overflow-hidden selection:bg-amber-500/30">
      <div className="p-6 border-b-8 border-black bg-slate-900 flex justify-between items-center shadow-2xl relative z-30">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-600/10 border-4 border-amber-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
          </div>
          <div>
            <h2 className="font-comic-header text-5xl text-white tracking-tighter italic leading-none uppercase">{labName}</h2>
            <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.4em] mt-1 italic flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
               GPU-Accelerated Stride: WebGL 4D Manifold
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="text-right">
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Fracture Probability</p>
            <p className={`text-3xl font-comic-header ${fractureChance > 0.1 ? 'text-red-500' : 'text-green-500'}`}>{(fractureChance * 100).toFixed(2)}%</p>
          </div>
          <button 
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`vista-button px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isAutoRotating ? 'bg-zinc-800 text-gray-500' : 'bg-amber-600 text-black animate-pulse'}`}
          >
            {isAutoRotating ? 'MANUAL STEER' : 'AUTOROTATE'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="absolute top-8 left-8 space-y-6 z-20">
          <div className="aero-panel bg-black/80 border-2 border-amber-600/40 p-4 shadow-xl">
            <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <LogicIcon className="w-4 h-4" /> Solid-State History
            </h4>
            <div className="space-y-2">
               {['GENESIS_0x0001', 'HANDSHAKE_OK', 'EPITUME_LINKED'].map(shard => (
                 <div key={shard} className="flex items-center gap-3 text-[10px] font-mono text-gray-500 italic">
                   <div className="w-1 h-1 rounded-full bg-amber-900" />
                   <span>{shard}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="aero-panel bg-black/80 border-2 border-cyan-600/40 p-4 shadow-xl">
             <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <ShieldIcon className="w-4 h-4" /> Hyper-Apertures
            </h4>
            <div className="space-y-1">
               <div className="flex justify-between text-[7px] font-black text-gray-700 uppercase">
                 <span>XW-Plane</span>
                 <span className="text-cyan-400">GPU_SYNC</span>
               </div>
               <div className="flex justify-between text-[7px] font-black text-gray-700 uppercase">
                 <span>Shader Thread</span>
                 <span className="text-green-500">OPTIMAL</span>
               </div>
            </div>
          </div>
        </div>

        <canvas 
          ref={canvasRef} 
          className="w-full h-full cursor-crosshair opacity-90"
        />

        <HyperSlider value={rotation} onChange={handleManualControl} />

        <div className="absolute bottom-8 left-8 z-20 max-w-sm">
           <div className="p-4 bg-red-950/10 border-2 border-red-900/30 rounded-2xl italic text-[10px] text-red-400/60 leading-relaxed font-mono">
                "WebGL shaders allow us to compute the 4D fold directly on the hardware. To rotate in 4D is to stop seeing objects and start seeing trajectories."
            </div>
        </div>
      </div>

      <div className="p-4 bg-slate-900 border-t-8 border-black flex justify-between items-center z-40 px-12">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Hyper-Engine: {isAutoRotating ? 'CRUISING' : 'CONDUCTED'}</span>
          </div>
          <span className="text-[10px] text-gray-700 font-mono italic">
            W_COORD: {rotation.toFixed(4)} | GPU_ACCEL: TRUE
          </span>
        </div>
        <div className="flex items-center gap-4">
             <TerminalIcon className="w-4 h-4 text-gray-800" />
             <p className="text-[10px] text-gray-700 font-black uppercase italic tracking-[0.2em]">Absolute Dimensional Authority.</p>
        </div>
      </div>
    </div>
  );
};
