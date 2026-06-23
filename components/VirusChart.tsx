import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceDot,
} from 'recharts';
import { VirusParams } from '../services/geminiService';
import { Copy, X, Check } from 'lucide-react';

interface VirusChartProps {
  params: VirusParams;
}

export const VirusChart: React.FC<VirusChartProps> = ({ params }) => {
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const data = useMemo(() => {
    const points = [];
    const dt = 0.01; // Time step
    const numSteps = 1500; // Keep normal step counts for good rendering

    let x = 0.1;
    let y = 0;
    let z = 0;

    const sigma = params.fever;
    const rho = params.delirium;
    const beta = params.collapse;

    for (let i = 0; i < numSteps; i++) {
      const dx = sigma * (y - x) * dt;
      const dy = (x * (rho - z) - y) * dt;
      const dz = (x * y - beta * z) * dt;

      x += dx;
      y += dy;
      z += dz;

      points.push({
        x: Number(x.toFixed(3)),
        y: Number(y.toFixed(3)),
        z: Number(z.toFixed(3)),
        order: i
      });
    }
    return points;
  }, [params]);

  const handleCopy = () => {
    if (selectedPoint) {
      const text = `X: ${selectedPoint.x}\nY: ${selectedPoint.y}\nZ: ${selectedPoint.z}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full h-full bg-black rounded-xl border border-zinc-900 p-4 shadow-inner relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.06)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none opacity-50"></div>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
          onClick={(e: any) => {
            if (e && e.activePayload && e.activePayload.length) {
              setSelectedPoint(e.activePayload[0].payload);
              setCopied(false);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" opacity={0.3} />
          <XAxis
            type="number"
            dataKey="x"
            name="Dimension X"
            stroke="#ef4444"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            label={{ value: 'Delusional Thoughts (X)', position: 'insideBottom', offset: -10, fill: '#ef4444', fontSize: 11 }}
            domain={['auto', 'auto']}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Dimension Y"
            stroke="#ef4444"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            label={{ value: 'Chaotic Emotions (Y)', angle: -90, position: 'insideLeft', fill: '#ef4444', fontSize: 11 }}
            domain={['auto', 'auto']}
          />
          <ZAxis
            type="number"
            dataKey="z"
            name="Dimension Z"
            range={[10, 100]}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3', stroke: '#ef4444' }}
            contentStyle={{ backgroundColor: '#09090e', borderColor: '#ef4444', color: '#f8fafc' }}
            itemStyle={{ color: '#ef4444' }}
            formatter={(value: number, name: string) => [`${value.toFixed(3)}`, name === 'x' ? 'Delusional Thoughts' : (name === 'y' ? 'Chaotic Emotions' : 'Structural Breakdown')]}
          />
          <Scatter name="A life of chaos" data={data} fill="#ef4444" opacity={0.7}>
             {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill="#ef4444"
                  stroke={selectedPoint?.order === entry.order ? '#fff' : 'none'}
                  strokeWidth={2}
                />
              ))}
          </Scatter>
          {selectedPoint && (
            <ReferenceDot
              x={selectedPoint.x}
              y={selectedPoint.y}
              r={6}
              fill="#ef4444"
              stroke="#fff"
              strokeWidth={2}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>

      <div className="absolute top-4 left-4 pointer-events-none opacity-40 select-none">
        <h1 className="text-sm font-mono font-bold text-red-500 tracking-wider">CHAOTIC EXISTENCE</h1>
      </div>

      {selectedPoint && (
        <div className="absolute bottom-4 left-4 bg-black border border-red-500 p-3 shadow-[0_0_15px_rgba(239,68,68,0.3)] w-52 z-20 animate-in fade-in slide-in-from-bottom-4 duration-300 backdrop-blur-md bg-opacity-90 rounded">
          <div className="flex justify-between items-center mb-2 border-b border-red-955 pb-1">
            <span className="text-[10px] font-bold text-red-500 tracking-wider">INFECTED_SECTOR</span>
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
          <div className="font-mono text-xs space-y-1 select-text text-red-650">
            <div className="flex justify-between"><span className="text-red-900">Chaos (X):</span> <span className="text-red-400">{selectedPoint.x}</span></div>
            <div className="flex justify-between"><span className="text-red-900">Emotions (Y):</span> <span className="text-red-400">{selectedPoint.y}</span></div>
            <div className="flex justify-between"><span className="text-red-900">Entropy (Z):</span> <span className="text-red-400">{selectedPoint.z}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
