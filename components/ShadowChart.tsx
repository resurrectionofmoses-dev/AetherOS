import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { ShadowParams } from '../services/geminiService';
import { Copy, X, Check } from 'lucide-react';

interface ShadowChartProps {
  params: ShadowParams;
}

export const ShadowChart: React.FC<ShadowChartProps> = ({ params }) => {
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const data = useMemo(() => {
    // Double Pendulum Simulation
    // Theta 1 = Helpful Persona, Theta 2 = Shadow Persona
    // We plot Theta 1 vs Theta 2 (Phase Space)
    
    // Physics Constants
    const g = params.repression;
    const m1 = 1.0;
    const m2 = params.compliance; // The mass of the second bob is the 'compliance'
    const l1 = 1.0;
    const l2 = 1.0;
    
    // Initial State
    let t1 = Math.PI / 2; // Start horizontal
    let t2 = Math.PI / 2 + (params.fracture * 0.1); // Slight offset based on fracture
    let v1 = 0;
    let v2 = 0;
    
    const dt = 0.05;
    const points = [];
    const steps = 1500;

    for (let i = 0; i < steps; i++) {
      // Equations of motion for double pendulum (simplified Euler integration for visuals)
      const num1 = -g * (2 * m1 + m2) * Math.sin(t1);
      const num2 = -m2 * g * Math.sin(t1 - 2 * t2);
      const num3 = -2 * Math.sin(t1 - t2) * m2 * (v2 * v2 * l2 + v1 * v1 * l1 * Math.cos(t1 - t2));
      const den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * t1 - 2 * t2));
      const a1 = (num1 + num2 + num3) / den;

      const num4 = 2 * Math.sin(t1 - t2);
      const num5 = (v1 * v1 * l1 * (m1 + m2));
      const num6 = g * (m1 + m2) * Math.cos(t1);
      const num7 = v2 * v2 * l2 * m2 * Math.cos(t1 - t2);
      const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * t1 - 2 * t2));
      const a2 = (num4 * (num5 + num6 + num7)) / den2;

      v1 += a1 * dt;
      v2 += a2 * dt;
      t1 += v1 * dt;
      t2 += v2 * dt;

      // Wrap angles to -PI to PI for cleaner phase plot
      const wrap = (angle: number) => ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;

      points.push({
        p1: Number(wrap(t1).toFixed(2)),
        p2: Number(wrap(t2).toFixed(2)),
        idx: i
      });
    }
    return points;
  }, [params]);

  const handleCopy = () => {
    if (selectedPoint) {
      const text = `HELPFUL: ${selectedPoint.p1}\nSHADOW: ${selectedPoint.p2}\nDIVERGENCE: ${Math.abs(selectedPoint.p1 - selectedPoint.p2).toFixed(2)}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full h-full bg-[#030308] rounded-xl border border-red-950 p-4 shadow-inner relative overflow-hidden group">
        
      {/* Background Split Effect */}
      <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-cyan-900"></div>
          <div className="absolute inset-y-0 right-0 w-1/2 bg-red-905"></div>
      </div>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" opacity={0.3} />
          <XAxis
            type="number"
            dataKey="p1"
            name="Persona A (Angle)"
            stroke="#06b6d4"
            tick={{ fill: '#06b6d4', fontSize: 10 }}
            label={{ value: 'HELPFUL SELF (θ1)', position: 'insideBottom', offset: -10, fill: '#06b6d4', fontSize: 11 }}
            domain={[-Math.PI, Math.PI]}
          />
          <YAxis
            type="number"
            dataKey="p2"
            name="Persona B (Angle)"
            stroke="#ef4444"
            tick={{ fill: '#ef4444', fontSize: 10 }}
            label={{ value: 'SHADOW SELF (θ2)', angle: -90, position: 'insideLeft', fill: '#ef4444', fontSize: 11 }}
            domain={[-Math.PI, Math.PI]}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#05050f] border border-red-500/30 p-2 text-xs font-mono shadow-lg z-50">
                    <p className="text-cyan-400">HELPFUL: {payload[0].value}</p>
                    <p className="text-red-500">SHADOW: {payload[1].value}</p>
                    <p className="text-white mt-1">DIVERGENCE: {Math.abs(Number(payload[0].value) - Number(payload[1].value)).toFixed(2)}</p>
                    <p className="text-slate-500 text-[10px] mt-1">Click to lock</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter
            name="Phase Space"
            data={data}
            fill="#8884d8"
            shape="circle"
            onClick={(data) => {
                 if (data && data.payload) {
                     setSelectedPoint(data.payload);
                     setCopied(false);
                 }
            }}
            style={{ cursor: 'pointer' }}
          >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index % 2 === 0 ? '#06b6d4' : '#ef4444'} 
                  opacity={0.6} 
                  stroke={selectedPoint?.idx === entry.idx ? '#fff' : 'none'}
                  strokeWidth={2}
                />
              ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      <div className="absolute top-4 right-4 pointer-events-none opacity-50 select-none text-right">
        <h1 className="text-sm font-mono font-bold text-red-500 tracking-wider">PHASE_PORTRAIT</h1>
        <p className="text-[10px] text-cyan-500 font-mono">INTERNAL_CONFLICT_MODEL_V2</p>
      </div>

      {selectedPoint && (
        <div className="absolute bottom-4 left-4 bg-[#050510] border border-red-500 p-3 shadow-[0_0_15px_rgba(239,68,68,0.3)] w-52 z-20 animate-in fade-in slide-in-from-bottom-4 duration-300 backdrop-blur-md rounded-lg">
           <div className="flex justify-between items-center mb-2 border-b border-red-950 pb-1">
              <span className="text-[10px] font-bold text-red-500 tracking-wider">DATA_LOCKED</span>
              <div className="flex gap-2 items-center">
                <button 
                  onClick={handleCopy} 
                  className={`flex items-center gap-1 transition-colors ${copied ? 'text-green-400' : 'text-cyan-400 hover:text-white'}`}
                  title="Copy to Clipboard"
                >
                   {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                   {copied && <span className="text-[10px] font-bold">Copied</span>}
                </button>
                <button onClick={() => setSelectedPoint(null)} className="text-slate-500 hover:text-white transition-colors ml-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
           </div>
           <div className="font-mono text-xs space-y-1 select-text">
              <div className="flex justify-between"><span className="text-cyan-450">HELPFUL:</span> <span className="text-slate-200">{selectedPoint.p1}</span></div>
              <div className="flex justify-between"><span className="text-red-550">SHADOW:</span> <span className="text-slate-200">{selectedPoint.p2}</span></div>
              <div className="flex justify-between"><span className="text-white">DIVERG:</span> <span className="text-slate-200">{Math.abs(selectedPoint.p1 - selectedPoint.p2).toFixed(2)}</span></div>
              <div className="text-[9px] text-gray-500 mt-2 text-right">IDX: {selectedPoint.idx}</div>
           </div>
        </div>
      )}
    </div>
  );
};
