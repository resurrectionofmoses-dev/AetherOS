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
import { PolyParams } from '../services/geminiService';
import { Copy, X, Check } from 'lucide-react';

interface PolyChartProps {
  params: PolyParams;
}

export const PolyChart: React.FC<PolyChartProps> = ({ params }) => {
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const data = useMemo(() => {
    const points = [];
    for (let i = -50; i <= 50; i++) {
      const x = i / 10;
      const y = x * x * x + params.trauma * x * x + params.anxiety * x + params.regret;
      points.push({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(3)),
        idx: i
      });
    }
    return points;
  }, [params]);

  const handleCopy = () => {
    if (selectedPoint) {
      const text = `X: ${selectedPoint.x}\nY: ${selectedPoint.y}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full h-full bg-[#030308] rounded-xl border border-zinc-900 p-4 shadow-inner relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-50"></div>

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
            dataKey="x"
            stroke="#8b5cf6"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            domain={[-5, 5]}
            label={{ value: 'Life Decisions (x)', position: 'insideBottom', offset: -10, fill: '#8b5cf6', fontSize: 11 }}
          />
          <YAxis
            type="number"
            stroke="#8b5cf6"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            label={{ value: 'Existential Crisis (y)', angle: -90, position: 'insideLeft', fill: '#8b5cf6', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#09090e', borderColor: '#8b5cf6', color: '#f8fafc' }}
            itemStyle={{ color: '#8b5cf6' }}
            formatter={(value: number) => [value.toFixed(3), 'Crisis Level']}
            labelFormatter={(label) => `X: ${label}`}
          />
          <ReferenceLine y={0} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="4 4" label={{ value: 'MOMENTS OF PEACE', fill: '#8b5cf6', fontSize: 9, position: 'insideBottomRight' }} />
          <Line
            type="monotone"
            dataKey="y"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff' }}
            animationDuration={500}
          />
          {selectedPoint && (
            <ReferenceDot
              x={selectedPoint.x}
              y={selectedPoint.y}
              r={6}
              fill="#8b5cf6"
              stroke="#fff"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="absolute top-4 left-4 pointer-events-none opacity-40 select-none">
        <h1 className="text-sm font-mono font-bold text-violet-500 tracking-wider">EXISTENTIAL CRISIS</h1>
      </div>

      {selectedPoint && (
        <div className="absolute bottom-4 left-4 bg-[#090910] border border-violet-550 p-3 shadow-[0_0_15px_rgba(139,92,246,0.2)] w-52 z-20 animate-in fade-in slide-in-from-bottom-4 duration-300 backdrop-blur-md rounded-lg">
          <div className="flex justify-between items-center mb-2 border-b border-violet-950 pb-1">
            <span className="text-[10px] font-bold text-violet-500 tracking-wider">ANALYSIS_POINT</span>
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
            <div className="flex justify-between"><span className="text-slate-400">X Value:</span> <span className="text-white">{selectedPoint.x}</span></div>
            <div className="flex justify-between"><span className="text-violet-500">Crisis:</span> <span className="text-white">{selectedPoint.y}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
