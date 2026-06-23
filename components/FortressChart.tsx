import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { FortressParams } from '../services/geminiService';
import { Copy, X, Check } from 'lucide-react';

interface FortressChartProps {
  params: FortressParams;
}

export const FortressChart: React.FC<FortressChartProps> = ({ params }) => {
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const data = useMemo(() => {
    const points = [];
    const dt = 0.1; // Time step
    const simulationDuration = 20; // seconds
    const totalSteps = simulationDuration / dt;

    // Mass-Spring-Damper parameters
    const m = params.coreResilience; // Mass
    const k = params.recoveryDrive;  // Spring constant
    const c = params.shockAbsorption; // Damping coefficient

    // Initial conditions
    let x = 1.0; // Initial displacement
    let v = 0.0; // Initial velocity
    let time = 0.0;

    for (let i = 0; i < totalSteps; i++) {
      // Calculate acceleration
      const a = (-c * v - k * x) / m;

      // Update velocity and position using Euler's method
      v = v + a * dt;
      x = x + v * dt;
      time = time + dt;

      points.push({
        time: Number(time.toFixed(2)),
        displacement: Number(x.toFixed(3)),
        idx: i
      });
    }
    return points;
  }, [params]);

  const handleCopy = () => {
    if (selectedPoint) {
      const text = `Time: ${selectedPoint.time}\nDisplacement: ${selectedPoint.displacement}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full h-full bg-[#030308] rounded-xl border border-zinc-900 p-4 shadow-inner relative overflow-hidden">
      {/* Background grid effect for structural feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.06)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-50"></div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          onClick={(e: any) => {
            if (e && e.activePayload && e.activePayload.length) {
              setSelectedPoint(e.activePayload[0].payload);
              setCopied(false);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" opacity={0.5} />
          <XAxis
            type="number"
            dataKey="time"
            stroke="#3b82f6"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            label={{ value: 'Time Under Pressure (s)', position: 'insideBottom', offset: -10, fill: '#3b82f6', fontSize: 11 }}
            domain={[0, 20]}
          />
          <YAxis
            type="number"
            dataKey="displacement"
            stroke="#3b82f6"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            label={{ value: 'Structural Displacement (x)', angle: -90, position: 'insideLeft', fill: '#3b82f6', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#09090e', borderColor: '#3b82f6', color: '#f8fafc' }}
            itemStyle={{ color: '#3b82f6' }}
            formatter={(value: number) => [value.toFixed(3), 'Displacement']}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <ReferenceLine y={0} stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 4" label={{ value: 'EQUILIBRIUM', fill: '#3b82f6', fontSize: 9, position: 'insideBottomRight' }} />
          <Line
            type="monotone"
            dataKey="displacement"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff' }}
            animationDuration={500}
          />
          {selectedPoint && (
            <ReferenceDot
              x={selectedPoint.time}
              y={selectedPoint.displacement}
              r={6}
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Thematic overlay text */}
      <div className="absolute top-4 left-4 pointer-events-none opacity-40 select-none">
        <h1 className="text-sm font-mono font-bold text-sky-500 tracking-wider">STRUCTURAL INTEGRITY</h1>
      </div>

      {selectedPoint && (
        <div className="absolute bottom-4 left-4 bg-[#050510] border border-blue-500 p-3 shadow-[0_0_15px_rgba(59,130,246,0.3)] w-52 z-20 animate-in fade-in slide-in-from-bottom-4 duration-300 backdrop-blur-md rounded-lg">
          <div className="flex justify-between items-center mb-2 border-b border-blue-900/50 pb-1">
            <span className="text-[10px] font-bold text-blue-500 tracking-wider">ANALYSIS_POINT</span>
            <div className="flex gap-2 items-center">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 transition-colors ${copied ? 'text-green-400' : 'text-slate-400 hover:text-white'}`}
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
            <div className="flex justify-between"><span className="text-slate-400">Time:</span> <span className="text-white">{selectedPoint.time}s</span></div>
            <div className="flex justify-between"><span className="text-blue-500">Displacement:</span> <span className="text-white">{selectedPoint.displacement}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
