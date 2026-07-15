import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Plus, 
  Trash2, 
  Download, 
  TrendingUp, 
  FileSpreadsheet, 
  FileJson, 
  Coins, 
  Layers, 
  Database,
  Hammer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';
import type { AssayLog, NetworkProject } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { GoldD3LineChart } from './GoldD3LineChart';

interface AssayTestLogProps {
  project: NetworkProject;
  onUpdateProject: (projectId: string, updates: Partial<NetworkProject>) => void;
}

export const AssayTestLog: React.FC<AssayTestLogProps> = ({ project, onUpdateProject }) => {
  const assayLogs = useMemo(() => project.assayLogs || [], [project.assayLogs]);

  // Form states
  const [siteName, setSiteName] = useState('');
  const [sampleMass, setSampleMass] = useState('');
  const [colorCount, setColorCount] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [notes, setNotes] = useState('');

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');

  // Chart view toggle ('d3' | 'bar')
  const [chartView, setChartView] = useState<'bar' | 'd3'>('d3');

  // Handle addition of new Assay Log entry
  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();

    if (!siteName.trim()) {
      toast.error('Site Name is required');
      return;
    }

    const mass = parseFloat(sampleMass);
    const count = parseInt(colorCount, 10);

    if (isNaN(mass) || mass <= 0) {
      toast.error('Please enter a valid sample mass greater than 0');
      return;
    }

    if (isNaN(count) || count < 0) {
      toast.error('Please enter a valid gold color count (0 or higher)');
      return;
    }

    const newLog: AssayLog = {
      id: `assay_${uuidv4()}`,
      siteName: siteName.trim(),
      sampleMass: mass,
      colorCount: count,
      coordinates: coordinates.trim() || 'Undisclosed Lat/Long',
      notes: notes.trim() || undefined,
      timestamp: Date.now()
    };

    const updatedLogs = [...assayLogs, newLog];
    onUpdateProject(project.id, { assayLogs: updatedLogs });

    // Reset Form
    setSiteName('');
    setSampleMass('');
    setColorCount('');
    setCoordinates('');
    setNotes('');

    toast.success('Physical Assay Log registered successfully!', {
      description: `Logged site: ${newLog.siteName} with ${count} colors from ${mass} kg sample.`
    });
  };

  // Handle entry deletion
  const handleDeleteEntry = (logId: string) => {
    const updatedLogs = assayLogs.filter(log => log.id !== logId);
    onUpdateProject(project.id, { assayLogs: updatedLogs });
    toast.success('Assay Log entry removed.');
  };

  // Populate mock data if logs are empty for testing
  const handlePreseedData = () => {
    const mockLogs: AssayLog[] = [
      {
        id: `assay_${uuidv4()}`,
        siteName: 'Eureka Bar Bench',
        sampleMass: 15.0,
        colorCount: 42,
        coordinates: '39.5121, -121.5543',
        notes: 'High concentration of black sand. Promising bedrock crack yield.',
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000
      },
      {
        id: `assay_${uuidv4()}`,
        siteName: 'Bear Creek Confluence',
        sampleMass: 20.0,
        colorCount: 18,
        coordinates: '39.5284, -121.5312',
        notes: 'Sub-rounded fine gold. Heavy cobble layer.',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000
      },
      {
        id: `assay_${uuidv4()}`,
        siteName: 'Feather River Plunge Pool',
        sampleMass: 8.5,
        colorCount: 35,
        coordinates: '39.5095, -121.5611',
        notes: 'Coarse flake gold trapped behind giant boulder.',
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000
      }
    ];

    onUpdateProject(project.id, { assayLogs: [...assayLogs, ...mockLogs] });
    toast.success('Preseeded 3 Geological Field Sites.');
  };

  // Chart data calculations
  const chartData = useMemo(() => {
    return assayLogs.map(log => {
      const roe = log.sampleMass > 0 ? (log.colorCount / log.sampleMass) : 0;
      return {
        name: log.siteName,
        'Colors (Count)': log.colorCount,
        'Sample Mass (kg)': log.sampleMass,
        'Return on Effort (Colors/kg)': parseFloat(roe.toFixed(2))
      };
    });
  }, [assayLogs]);

  // Total metrics
  const metrics = useMemo(() => {
    if (assayLogs.length === 0) return { totalMass: 0, totalColors: 0, avgYield: 0 };
    const totalMass = assayLogs.reduce((acc, curr) => acc + curr.sampleMass, 0);
    const totalColors = assayLogs.reduce((acc, curr) => acc + curr.colorCount, 0);
    const avgYield = totalMass > 0 ? (totalColors / totalMass) : 0;
    return {
      totalMass: parseFloat(totalMass.toFixed(2)),
      totalColors,
      avgYield: parseFloat(avgYield.toFixed(2))
    };
  }, [assayLogs]);

  // Export to CSV
  const handleExportCSV = () => {
    if (assayLogs.length === 0) {
      toast.error('No prospecting history to export.');
      return;
    }

    const headers = ['ID', 'Site Name', 'Sample Mass (kg)', 'Gold Color Count', 'Coordinates', 'Notes', 'Date', 'Return on Effort (Colors/kg)'];
    const rows = assayLogs.map(log => {
      const roe = log.sampleMass > 0 ? (log.colorCount / log.sampleMass).toFixed(4) : '0';
      const dateString = new Date(log.timestamp).toISOString();
      return [
        log.id,
        `"${log.siteName.replace(/"/g, '""')}"`,
        log.sampleMass,
        log.colorCount,
        `"${log.coordinates.replace(/"/g, '""')}"`,
        `"${(log.notes || '').replace(/"/g, '""')}"`,
        dateString,
        roe
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Assay_Test_Log_Campaign_${project.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Prospecting CSV Downloaded successfully!');
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (assayLogs.length === 0) {
      toast.error('No prospecting history to export.');
      return;
    }

    const exportData = {
      campaignId: project.id,
      campaignTitle: project.title,
      exportedAt: new Date().toISOString(),
      metrics: {
        totalSites: assayLogs.length,
        totalSampleMassKg: metrics.totalMass,
        totalGoldColorsCount: metrics.totalColors,
        averageReturnOnEffort: metrics.avgYield
      },
      prospectingSites: assayLogs.map(log => ({
        ...log,
        returnOnEffortColorsPerKg: log.sampleMass > 0 ? parseFloat((log.colorCount / log.sampleMass).toFixed(4)) : 0
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Assay_Test_Log_Campaign_${project.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Geological JSON analysis exported!');
  };

  const filteredLogs = assayLogs.filter(log => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      log.siteName.toLowerCase().includes(q) ||
      log.coordinates.toLowerCase().includes(q) ||
      (log.notes || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-zinc-100 animate-in fade-in duration-300">
      
      {/* Metrics Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-950/60 border border-amber-500/20 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Total Sample Massed</span>
            <span className="text-xl font-serif font-bold text-amber-100">{metrics.totalMass} <span className="text-xs text-zinc-500">kg</span></span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-zinc-950/60 border border-amber-500/20 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Total Colors Counted</span>
            <span className="text-xl font-serif font-bold text-yellow-500">{metrics.totalColors} <span className="text-xs text-zinc-500">specks</span></span>
          </div>
          <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-zinc-950/60 border border-amber-500/20 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Average Return on Effort</span>
            <span className="text-xl font-serif font-bold text-emerald-400">{metrics.avgYield} <span className="text-xs text-zinc-500">colors/kg</span></span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Panel (Form) */}
        <div className="lg:col-span-4 bg-zinc-950/80 border border-amber-500/10 p-5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-amber-500/10">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-amber-300">Record Test Pan</h3>
            </div>
            {assayLogs.length === 0 && (
              <button 
                type="button" 
                onClick={handlePreseedData}
                className="text-[9px] font-mono text-amber-500/70 hover:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase"
              >
                Preseed Demo
              </button>
            )}
          </div>

          <form onSubmit={handleAddEntry} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-400 uppercase block font-bold">Site/Location Name</label>
              <input 
                required
                type="text"
                placeholder="e.g. Bedrock Fracture #3A"
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-700 font-mono focus:border-amber-500/50 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-400 uppercase block font-bold">Sample Mass (kg)</label>
                <input 
                  required
                  type="number"
                  step="0.01"
                  placeholder="e.g. 12.5"
                  value={sampleMass}
                  onChange={e => setSampleMass(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-700 font-mono focus:border-amber-500/50 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-400 uppercase block font-bold">Color Count (Gold)</label>
                <input 
                  required
                  type="number"
                  placeholder="e.g. 14"
                  value={colorCount}
                  onChange={e => setColorCount(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-700 font-mono focus:border-amber-500/50 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-mono text-zinc-400 uppercase block font-bold">Coordinates (Lat, Long)</label>
                <span className="text-[8px] text-zinc-500 font-mono">Optional</span>
              </div>
              <input 
                type="text"
                placeholder="e.g. 39.5121, -121.5543"
                value={coordinates}
                onChange={e => setCoordinates(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-700 font-mono focus:border-amber-500/50 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-400 uppercase block font-bold">Field Notes</label>
              <textarea 
                rows={2}
                placeholder="Bedrock condition, gravel size, clay content..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-700 font-mono focus:border-amber-500/50 outline-none resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-amber-650 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-serif font-black uppercase text-[10px] tracking-widest rounded-xl transition-all border border-amber-400/20 mt-2 flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Register Assay Log
            </button>
          </form>
        </div>

        {/* Visual Charts & Statistics */}
        <div className="lg:col-span-8 bg-zinc-950/40 border border-amber-500/10 p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-amber-500/10 gap-2">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-emerald-400 font-bold" />
              <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-zinc-900">
                <button
                  type="button"
                  onClick={() => setChartView('d3')}
                  className={`px-3 py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-all ${
                    chartView === 'd3'
                      ? 'bg-amber-500 text-stone-950 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  📈 D3 Live Spot Trend
                </button>
                <button
                  type="button"
                  onClick={() => setChartView('bar')}
                  className={`px-3 py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-all ${
                    chartView === 'bar'
                      ? 'bg-amber-500 text-stone-950 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  📊 Return on Effort
                </button>
              </div>
            </div>

            {/* Export Toolbar */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-amber-500/20 hover:border-amber-500/40 rounded-lg text-[9px] font-mono text-amber-200 transition-all uppercase font-bold"
              >
                <FileSpreadsheet className="w-3 h-3" /> CSV Export
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-amber-500/20 hover:border-amber-500/40 rounded-lg text-[9px] font-mono text-amber-200 transition-all uppercase font-bold"
              >
                <FileJson className="w-3 h-3" /> JSON Export
              </button>
            </div>
          </div>

          <div className="w-full">
            {chartView === 'd3' ? (
              <GoldD3LineChart assayLogs={assayLogs} />
            ) : (
              <div className="h-64 w-full">
                {assayLogs.length === 0 ? (
                  <div className="w-full h-full border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-black/20">
                    <Layers className="w-8 h-8 text-zinc-700 mb-2 stroke-[1.5]" />
                    <p className="text-[10px] text-zinc-500 max-w-xs font-mono">
                      No assay test data available to map. Register a physical test pan above to generate return on effort visualization.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#808090" 
                        fontSize={9} 
                        fontFamily="JetBrains Mono"
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#808090" 
                        fontSize={9} 
                        fontFamily="JetBrains Mono"
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#09090e', borderColor: '#d97706', borderRadius: '12px' }} 
                        labelStyle={{ fontFamily: 'Cinzel, Georgia, serif', fontWeight: 'bold', fontSize: '10px', color: '#fbbf24' }}
                        itemStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
                      />
                      <Legend 
                        wrapperStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', paddingTop: '5px' }}
                      />
                      <Bar 
                        dataKey="Return on Effort (Colors/kg)" 
                        fill="#10b981" 
                        name="Return on Effort (Colors per kg)" 
                        radius={[4, 4, 0, 0]} 
                      />
                      <Bar 
                        dataKey="Colors (Count)" 
                        fill="#fbbf24" 
                        name="Gold Color Specks" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assay Entries Logs Table */}
      <div className="bg-zinc-950/50 border border-amber-500/10 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-500/10">
          <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-amber-300">Geological Specimen Ledger</h3>
          <input 
            type="text"
            placeholder="Filter by site or coordinates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-black border border-zinc-800 rounded-xl px-3 py-1 text-[10px] text-white font-mono w-full sm:w-64 placeholder-zinc-700 focus:border-amber-500/50 outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] font-mono">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-550 uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">Field Site</th>
                <th className="py-2.5 px-3">Sample Mass</th>
                <th className="py-2.5 px-3">Gold Colors</th>
                <th className="py-2.5 px-3 text-emerald-400">Return on Effort</th>
                <th className="py-2.5 px-3">Coordinates</th>
                <th className="py-2.5 px-3">Notes</th>
                <th className="py-2.5 px-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-950">
              {filteredLogs.map(log => {
                const roe = log.sampleMass > 0 ? (log.colorCount / log.sampleMass) : 0;
                return (
                  <tr key={log.id} className="hover:bg-zinc-900/30 group">
                    <td className="py-3 px-3 font-bold text-zinc-200 uppercase tracking-tight">{log.siteName}</td>
                    <td className="py-3 px-3 text-zinc-400">{log.sampleMass} kg</td>
                    <td className="py-3 px-3 text-yellow-500">{log.colorCount} specks</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">{roe.toFixed(2)} colors/kg</td>
                    <td className="py-3 px-3 text-zinc-550 flex items-center gap-1 whitespace-nowrap">
                      <MapPin className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                      <span className="truncate max-w-[120px]">{log.coordinates}</span>
                    </td>
                    <td className="py-3 px-3 text-zinc-400 max-w-[160px] truncate" title={log.notes}>
                      {log.notes || <span className="text-zinc-700 italic">No notes</span>}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        onClick={() => handleDeleteEntry(log.id)}
                        className="text-red-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-zinc-650 italic">
                    {assayLogs.length === 0 ? 'No Geological specimen records. Register your first test pan above!' : 'No entries match your search criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
