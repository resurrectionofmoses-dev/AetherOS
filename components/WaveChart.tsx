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
import { WaveParams } from '../services/geminiService';
import { Copy, X, Check } from 'lucide-react';

interface WaveChartProps {
  params: WaveParams;
}

export const WaveChart: React.FC<WaveChartProps> = ({ params }) => {
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const data = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const time = i / 10;
      const displacement = params.ego * Math.sin(params.volatility * time) * Math.exp(-params.decay * time);
      points.push({
        time: Number(time.toFixed(2)),
        displacement: Number(displacement.toFixed(3)),
        idx: i
      });
    }
    return points;
  }, [params]);

  const handleCopy = () => {
    if (selectedPoint) {
      const text = `Time: ${selectedPoint.time}\nRelevance: ${selectedPoint.displacement}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full h-full bg-[#030308] rounded-xl border border-zinc-900 p-4 shadow-inner relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.06)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-50"></div>

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
            stroke="#ef4444"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            domain={[0, 10]}
            label={{ value: 'Time Wasted Chasing Highs', position: 'insideBottom', offset: -10, fill: '#ef4444', fontSize: 11 }}
          />
          <YAxis
            type="number"
            stroke="#ef4444"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            label={{ value: 'The Inevitable Crash', angle: -90, position: 'insideLeft', fill: '#ef4444', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#09090e', borderColor: '#ef4444', color: '#f8fafc' }}
            itemStyle={{ color: '#ef4444' }}
            formatter={(value: number) => [value.toFixed(3), 'Relevance']}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <ReferenceLine y={0} stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4" label={{ value: 'ZERO RELEVANCE', fill: '#ef4444', fontSize: 9, position: 'insideBottomRight' }} />
          <Line
            type="monotone"
            dataKey="displacement"
            stroke="#ef4444"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff' }}
            animationDuration={500}
          />
          {selectedPoint && (
            <ReferenceDot
              x={selectedPoint.time}
              y={selectedPoint.displacement}
              r={6}
              fill="#ef4444"
              stroke="#fff"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="absolute top-4 left-4 pointer-events-none opacity-40 select-none">
        <h1 className="text-sm font-mono font-bold text-red-500 tracking-wider">FADING RELEVANCE</h1>
      </div>

      {selectedPoint && (
        <div className="absolute bottom-4 left-4 bg-[#090910] border border-red-500/50 p-3 shadow-[0_0_15px_rgba(239,68,68,0.2)] w-52 z-20 animate-in fade-in slide-in-from-bottom-4 duration-300 backdrop-blur-md rounded-lg">
          <div className="flex justify-between items-center mb-2 border-b border-red-950 pb-1">
            <span className="text-[10px] font-bold text-red-500 tracking-wider">ANALYSIS_POINT</span>
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
            <div className="flex justify-between"><span className="text-red-500">Relevance:</span> <span className="text-white">{selectedPoint.displacement}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
