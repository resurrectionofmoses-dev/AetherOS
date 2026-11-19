import React, { useState, useEffect, useMemo } from 'react';
import { Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { safeStorage } from '../services/safeStorage';
import {
  BIONIC_AUGMENTATION_REGEX,
  NEURAL_INTERFACE_BCI_REGEX,
  scanBioCyberneticSignals,
  DNS_ANOMALY_PREVIEW_CSV,
  analyzeDnsAnomalies,
  executeAptureCommand,
  loadQArchiveVault,
  AptureArchiveSession,
  runZeroTokenSessionAudit,
  inspectRansomwareArtifact,
  getRobustEvolveStates,
  executePhoenixJournalCommand,
  PhoenixJournalCommand,
  readVsixStorageTiers,
  VsixStorageSnapshot,
  QUIC_HARD_FORK_VECTORS,
  GHOST_HANDSHAKE_VECTORS,
  WEALTH_ARCHITECTURE_PRINCIPLES,
  computeDeterministicWealthProjection,
  applyManualAchievedOverride,
  WealthGoalRecord,
  DEFAULT_ENDLESS_POOL_TASKS,
  EndlessPoolTask,
  evaluateWaterChemistry,
  SIDELINING_STRATEGIES,
  PERMUTE_ABUNDAS_REVENUE_STREAM,
  FASHION_PROMPTING_SPECS,
  OPERATIONAL_HANDOFF_PROTOCOL,
} from '../services/sovereignProtocols';
import {
  GAZE_DOMAIN_LABELS,
  latentGazeSearch,
  runHybridLatentGazeSearch,
  LatentGazeResult,
} from '../services/latentGazeEngine';

interface SovereignProtocolNexusViewProps {
  isSystemFractured?: boolean;
  bootLogs?: string[];
  onNavigateToView?: (view: any) => void;
}

type NexusTab = 'network' | 'gaze_regex' | 'archives_diag' | 'wealth_pool';

const POOL_STORAGE_KEY = 'aetheros_endless_pool_tasks';
const WEALTH_GOALS_STORAGE_KEY = 'aetheros_wealth_engine_goals';

export const SovereignProtocolNexusView: React.FC<SovereignProtocolNexusViewProps> = ({
  isSystemFractured = false,
  bootLogs = [],
  onNavigateToView,
}) => {
  const [activeTab, setActiveTab] = useState<NexusTab>('network');
  const [searchFilter, setSearchFilter] = useState('');

  // --- TAB 1: NETWORK, DNS, QUIC, GHOST HANDSHAKE, RANSOMWARE, ZERO-TOKEN ---
  const [dnsCsvInput, setDnsCsvInput] = useState<string>(DNS_ANOMALY_PREVIEW_CSV);
  const dnsAnalysis = useMemo(() => analyzeDnsAnomalies(dnsCsvInput), [dnsCsvInput]);
  const [quicSimulatedVector, setQuicSimulatedVector] = useState<string | null>(null);
  const [ghostStasisActive, setGhostStasisActive] = useState<boolean>(false);

  const [artifactName, setArtifactName] = useState<string>('asus_pc_payload.sentinel');
  const [artifactPayload, setArtifactPayload] = useState<string>(
    '9f84a2c7b10e48d29f61e0c43a8d77f2b51e9a4c60d8e23f7b19c4d8a2f0e61c.sentinel'
  );
  const ransomwareScan = useMemo(
    () => inspectRansomwareArtifact(artifactName, artifactPayload),
    [artifactName, artifactPayload]
  );

  const [zeroTokenCustomInput, setZeroTokenCustomInput] = useState<string>('');
  const zeroTokenFindings = useMemo(
    () => runZeroTokenSessionAudit(zeroTokenCustomInput.trim() ? zeroTokenCustomInput : undefined),
    [zeroTokenCustomInput]
  );

  // --- TAB 2: LATENT GAZE, BIO/BCI REGEX, FASHION STACK ---
  const [gazeVisualInput, setGazeVisualInput] = useState<string>(
    'Dark obsidian metallic frame glowing red border, packet dump on port 53'
  );
  const [contextWeights, setContextWeights] = useState<number[]>([0.2, 0.95, 0.45, 0.75, 0.3, 0.4]);
  const [gazeResult, setGazeResult] = useState<LatentGazeResult>(() =>
    latentGazeSearch('Dark obsidian metallic frame glowing red border, packet dump on port 53', [0.2, 0.95, 0.45, 0.75, 0.3, 0.4])
  );
  const [isGazeRunning, setIsGazeRunning] = useState<boolean>(false);

  const [regexSampleText, setRegexSampleText] = useState<string>(
    'Telemetry detected neural-interface BCI calibration alongside bionic prosthetic actuator sync.'
  );
  const bioCyberScan = useMemo(() => scanBioCyberneticSignals(regexSampleText), [regexSampleText]);

  const [selectedFashionStyleId, setSelectedFashionStyleId] = useState<string>('minimalist');
  const [vexFormatMode, setVexFormatMode] = useState<'code' | 'spatial'>('spatial');

  // --- TAB 3: PROFOUND APTURE, JOURNALCTL, ROBUST-EVOLVE, VSIX ---
  const [qArchiveSessions, setQArchiveSessions] = useState<AptureArchiveSession[]>([]);
  const [sweepTitle, setSweepTitle] = useState<string>('Workspace Session Snapshot');
  const [sweepSource, setSweepSource] = useState<string>('~/Desktop');
  const [sweepContent, setSweepContent] = useState<string>(
    'Non-destructive session manifest sealed into ~/.q_archive/.'
  );
  const [aptureLog, setAptureLog] = useState<string>(
    '[PROFOUND_APTURE] Ready. Policy: Never Delete, Only Archive.'
  );

  const [selectedJournalCmd, setSelectedJournalCmd] =
    useState<PhoenixJournalCommand>('journalctl -xe');
  const journalOutput = useMemo(
    () => executePhoenixJournalCommand(selectedJournalCmd, bootLogs),
    [selectedJournalCmd, bootLogs]
  );

  const robustEvolveStates = useMemo(
    () => getRobustEvolveStates(isSystemFractured),
    [isSystemFractured]
  );
  const [vsixSnapshot, setVsixSnapshot] = useState<VsixStorageSnapshot>({
    globalState: {},
    workspaceState: {},
    secretsCount: 1,
  });

  // --- TAB 4: WEALTH ENGINE, ENDLESS POOL, WORKFLOW & HANDOFF ---
  const [principal, setPrincipal] = useState<number>(25000);
  const [annualContribution, setAnnualContribution] = useState<number>(6000);
  const [annualRate, setAnnualRate] = useState<number>(7.0);
  const [horizonYearsInput, setHorizonYearsInput] = useState<number>(30);
  const [safeFallbackMode, setSafeFallbackMode] = useState<boolean>(false);

  const wealthProjection = useMemo(
    () =>
      computeDeterministicWealthProjection(
        principal,
        annualContribution,
        annualRate,
        horizonYearsInput,
        safeFallbackMode
      ),
    [principal, annualContribution, annualRate, horizonYearsInput, safeFallbackMode]
  );

  const [wealthGoals, setWealthGoals] = useState<WealthGoalRecord[]>([
    {
      id: 'wg-1',
      title: 'Emergency Sovereign Reserve',
      targetAmount: 50000,
      horizonYears: 5,
      achieved: false,
    },
    {
      id: 'wg-2',
      title: '50-Year Independence Horizon Anchor',
      targetAmount: 1500000,
      horizonYears: 50,
      achieved: false,
    },
  ]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('100000');

  const [poolTasks, setPoolTasks] = useState<EndlessPoolTask[]>(DEFAULT_ENDLESS_POOL_TASKS);
  const [poolPh, setPoolPh] = useState<number>(7.4);
  const [poolChlorine, setPoolChlorine] = useState<number>(2.0);
  const waterCheck = useMemo(
    () => evaluateWaterChemistry(poolPh, poolChlorine),
    [poolPh, poolChlorine]
  );

  const [activeSidelining, setActiveSidelining] = useState<Record<string, boolean>>({
    'The Silent Filter': true,
    'Asynchronous Harmony': true,
    'The Mirror Protocol': false,
  });
  const [watchfulSilenceActive, setWatchfulSilenceActive] = useState<boolean>(false);

  // Hydrate persistent sovereign slices
  useEffect(() => {
    let active = true;
    (async () => {
      const vault = await loadQArchiveVault();
      if (active) setQArchiveSessions(vault);

      const vsix = await readVsixStorageTiers();
      if (active) setVsixSnapshot(vsix);

      try {
        const storedPool = await safeStorage.getItem(POOL_STORAGE_KEY);
        if (storedPool && active) {
          const parsed = JSON.parse(storedPool);
          if (Array.isArray(parsed) && parsed.length > 0) setPoolTasks(parsed);
        }
        const storedGoals = await safeStorage.getItem(WEALTH_GOALS_STORAGE_KEY);
        if (storedGoals && active) {
          const parsedGoals = JSON.parse(storedGoals);
          if (Array.isArray(parsedGoals) && parsedGoals.length > 0) setWealthGoals(parsedGoals);
        }
      } catch {
        // Ignore malformed local overrides
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleRunApture = async (cmd: 'q-sweep' | 'q-vault' | 'q-verify') => {
    const res = await executeAptureCommand(cmd, {
      title: sweepTitle,
      sourceLocation: sweepSource,
      content: sweepContent,
    });
    setQArchiveSessions(res.sessions);
    setAptureLog(res.output);
    toast.success(`${cmd} executed`, { description: res.output });
  };

  const handleRunLocalGaze = () => {
    const res = latentGazeSearch(gazeVisualInput, contextWeights);
    setGazeResult(res);
  };

  const handleRunHybridGaze = async () => {
    setIsGazeRunning(true);
    try {
      const res = await runHybridLatentGazeSearch(gazeVisualInput, contextWeights);
      setGazeResult(res);
    } finally {
      setIsGazeRunning(false);
    }
  };

  const handleGazeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const descriptor = `${file.name} (${file.type || 'image'}, ${Math.round(file.size / 1024)}KB)`;
    setGazeVisualInput(descriptor);
    const res = latentGazeSearch(descriptor, contextWeights);
    setGazeResult(res);
  };

  const handleOverrideGoalAchieved = async (goalId: string) => {
    const updated = wealthGoals.map((g) =>
      g.id === goalId ? applyManualAchievedOverride(g, 'Verified by sovereign operator') : g
    );
    setWealthGoals(updated);
    await safeStorage.setItem(WEALTH_GOALS_STORAGE_KEY, JSON.stringify(updated));
    toast.success('Goal marked Achieved (*)', {
      description: 'Appended immutable asterisk (*) audit trail entry.',
    });
  };

  const handleAddWealthGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    const goal: WealthGoalRecord = {
      id: `wg-${Date.now()}`,
      title: newGoalTitle.trim(),
      targetAmount: Math.max(100, Number(newGoalAmount) || 10000),
      horizonYears: wealthProjection.horizonYears,
      achieved: false,
    };
    const updated = [goal, ...wealthGoals];
    setWealthGoals(updated);
    setNewGoalTitle('');
    await safeStorage.setItem(WEALTH_GOALS_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleCompletePoolTask = async (taskId: EndlessPoolTask['id']) => {
    const now = new Date().toISOString();
    const updated = poolTasks.map((t) => (t.id === taskId ? { ...t, lastCompletedAt: now } : t));
    setPoolTasks(updated);
    await safeStorage.setItem(POOL_STORAGE_KEY, JSON.stringify(updated));
    toast.success('Maintenance logged', { description: `Recorded completion at ${now.slice(0, 10)}` });
  };

  const filteredDnsRecords = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return dnsAnalysis.records;
    return dnsAnalysis.records.filter(
      (r) =>
        r.sourceIp.toLowerCase().includes(q) ||
        r.destIp.toLowerCase().includes(q) ||
        r.protocol.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
    );
  }, [dnsAnalysis.records, searchFilter]);

  return (
    <div className="flex-1 flex flex-col bg-[#090d16] text-zinc-100 overflow-hidden font-sans">
      {/* Top Bar Contract: Breadcrumb on Left, <= 2 Actions on Right */}
      <header className="px-6 py-4 border-b border-zinc-800 bg-[#0b101b] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="text-[11px] font-mono text-zinc-400 tracking-wide">
            Sovereign Core / Protocol Nexus
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white mt-0.5">
            Sovereign Operations &amp; Telemetry Console
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter flows / logs..."
              className="bg-[#05070d] border border-zinc-800 rounded pl-8 pr-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>
          {onNavigateToView && (
            <button
              type="button"
              onClick={() => onNavigateToView('regex_editor_lab')}
              className="px-3 py-1.5 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-200 rounded whitespace-nowrap shrink-0 cursor-pointer"
            >
              Open Regex Lab
            </button>
          )}
          <button
            type="button"
            onClick={() => handleRunApture('q-verify')}
            className="px-3 py-1.5 border border-emerald-700/60 bg-emerald-950/40 hover:bg-emerald-900/50 text-xs font-medium text-emerald-300 rounded whitespace-nowrap shrink-0 cursor-pointer"
          >
            Verify Vault (q-verify)
          </button>
        </div>
      </header>

      {/* Navigation Sub-Bar */}
      <nav className="px-6 border-b border-zinc-800 bg-[#080b13] flex items-center gap-1 overflow-x-auto shrink-0">
        {(
          [
            { id: 'network', label: 'Network, DNS & Forensics' },
            { id: 'gaze_regex', label: 'Latent Gaze, Regex & Fashion' },
            { id: 'archives_diag', label: 'Archives, Journalctl & VSIX' },
            { id: 'wealth_pool', label: 'Wealth Engine, Pool & Handoff' },
          ] as Array<{ id: NexusTab; label: string }>
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'border-cyan-400 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {activeTab === 'network' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* KPI Summary Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-zinc-800 bg-[#0d1320] p-4 rounded">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400">Flows Parsed</div>
                <div className="text-2xl font-mono tabular-nums font-bold text-white mt-1">
                  {dnsAnalysis.totalPackets}
                </div>
                <div className="text-xs font-mono tabular-nums text-zinc-400 mt-1">
                  Mean IAT: {dnsAnalysis.meanInterArrivalMs} ms
                </div>
              </div>
              <div className="border border-zinc-800 bg-[#0d1320] p-4 rounded">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400">Detection Accuracy</div>
                <div className="text-2xl font-mono tabular-nums font-bold text-emerald-400 mt-1">
                  {(dnsAnalysis.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-xs font-mono tabular-nums text-zinc-400 mt-1">
                  TP: {dnsAnalysis.truePositives} / FP: {dnsAnalysis.falsePositives}
                </div>
              </div>
              <div className="border border-zinc-800 bg-[#0d1320] p-4 rounded">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400">Ransomware Entropy</div>
                <div
                  className={`text-2xl font-mono tabular-nums font-bold mt-1 ${
                    ransomwareScan.verdict === 'NOMINAL_PLAINTEXT' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {ransomwareScan.shannonEntropy.toFixed(3)} b/ch
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-1">{ransomwareScan.verdict}</div>
              </div>
              <div className="border border-zinc-800 bg-[#0d1320] p-4 rounded">
                <div className="text-[11px] uppercase tracking-wider text-zinc-400">Zero-Token Session</div>
                <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                  {zeroTokenFindings.every((f) => f.verdict === 'PASS') ? 'PASS' : 'REVIEW'}
                </div>
                <div className="text-xs font-mono text-zinc-400 mt-1">
                  {zeroTokenFindings.filter((f) => f.verdict === 'PASS').length}/3 checks clean
                </div>
              </div>
            </div>

            {/* DNS Anomaly Training Dataset Inspector */}
            <section className="border border-zinc-800 bg-[#0b101b] rounded overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    DNS Anomaly Flow Analyzer (dns-anomaly-training-data-preview)
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Detects interleaved TCP/80 high-MTU bursts inside UDP/53 query windows.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDnsCsvInput(DNS_ANOMALY_PREVIEW_CSV)}
                  className="px-2.5 py-1 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 rounded whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Reset Preview CSV
                </button>
              </div>

              <div className="p-4 border-b border-zinc-800">
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                  Editable Packet Trace CSV (source_ip, dest_ip, source_port, dest_port, protocol, packet_length, timestamp, inter_arrival_time, label)
                </label>
                <textarea
                  value={dnsCsvInput}
                  onChange={(e) => setDnsCsvInput(e.target.value)}
                  rows={4}
                  className="w-full bg-[#05070d] border border-zinc-800 rounded p-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#080c15] text-[11px] font-mono uppercase text-zinc-400">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Source IP</th>
                      <th className="py-2.5 px-3">Dest IP</th>
                      <th className="py-2.5 px-3">Proto / Ports</th>
                      <th className="py-2.5 px-3 text-right">Bytes</th>
                      <th className="py-2.5 px-3 text-right">IAT (s)</th>
                      <th className="py-2.5 px-3 text-right">Ground Label</th>
                      <th className="py-2.5 px-3">Verdict &amp; Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70 text-xs font-mono tabular-nums">
                    {filteredDnsRecords.map((row) => (
                      <tr key={row.index} className="hover:bg-zinc-900/40">
                        <td className="py-2 px-3 text-zinc-500">{row.index}</td>
                        <td className="py-2 px-3 text-zinc-200">{row.sourceIp}</td>
                        <td className="py-2 px-3 text-zinc-400">{row.destIp}</td>
                        <td className="py-2 px-3 text-zinc-300">
                          {row.protocol} {row.sourcePort} &rarr; {row.destPort}
                        </td>
                        <td className="py-2 px-3 text-right text-zinc-200">{row.packetLength}</td>
                        <td className="py-2 px-3 text-right text-zinc-400">
                          {row.interArrivalTime.toFixed(6)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className={row.label === 1 ? 'text-red-400 font-bold' : 'text-zinc-400'}>
                            {row.label}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`font-semibold mr-2 ${
                              row.predictedAnomaly ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          >
                            {row.predictedAnomaly ? 'ANOMALY' : 'NOMINAL'}
                          </span>
                          <span className="text-zinc-400 font-sans">{row.reason}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Two-Column Grid: QUIC Hard Fork + Ghost Handshake */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="border border-zinc-800 bg-[#0b101b] rounded p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h2 className="text-sm font-semibold text-white">Pure QUIC / HTTP3 Hard Fork Matrix</h2>
                  <span className="text-xs font-mono text-emerald-400">0-RTT HARDENED</span>
                </div>
                <div className="space-y-2.5">
                  {QUIC_HARD_FORK_VECTORS.map((item) => (
                    <div
                      key={item.vector}
                      className="border border-zinc-800/80 bg-[#070a12] rounded p-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white">{item.vector}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono font-bold text-emerald-400">
                            {item.forensicStatus}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuicSimulatedVector(item.simulatedTestOutcome)}
                            className="px-2 py-1 border border-zinc-700 hover:border-cyan-500 text-[11px] text-zinc-200 rounded whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Test Gate
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{item.defense}</p>
                    </div>
                  ))}
                </div>
                {quicSimulatedVector && (
                  <div className="border border-cyan-800/60 bg-cyan-950/20 p-2.5 rounded text-xs font-mono text-cyan-300">
                    [QUIC_GATE] {quicSimulatedVector}
                  </div>
                )}
              </section>

              <section className="border border-zinc-800 bg-[#0b101b] rounded p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h2 className="text-sm font-semibold text-white">
                    Quantum Teleportation: Ghost Handshake
                  </h2>
                  <button
                    type="button"
                    onClick={() => setGhostStasisActive((prev) => !prev)}
                    className={`px-2.5 py-1 border text-xs rounded whitespace-nowrap shrink-0 cursor-pointer ${
                      ghostStasisActive
                        ? 'border-amber-600 bg-amber-950/40 text-amber-300'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-200'
                    }`}
                  >
                    {ghostStasisActive ? 'Stasis Engaged' : 'Engage Instant Stasis'}
                  </button>
                </div>
                <div className="space-y-2.5">
                  {GHOST_HANDSHAKE_VECTORS.map((v) => (
                    <div key={v.summary} className="border border-zinc-800/80 bg-[#070a12] rounded p-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">
                          {v.summary} &mdash; {v.affectedAsset}
                        </span>
                        <span className="font-mono font-bold text-amber-400">{v.impact}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{v.severityReasoning}</p>
                    </div>
                  ))}
                </div>
                <div className="border border-zinc-800 bg-[#070a12] p-3 rounded text-xs font-mono text-zinc-300 flex items-center justify-between">
                  <span>Moto G Station Remote Register</span>
                  <span className={ghostStasisActive ? 'text-emerald-400' : 'text-zinc-400'}>
                    {ghostStasisActive ? 'STASIS_HEAL_LOCKED (0B_TRANSIT)' : 'STANDBY_MIRROR'}
                  </span>
                </div>
              </section>
            </div>

            {/* Ransomware Forensics & Zero-Token Session Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="border border-zinc-800 bg-[#0b101b] rounded p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h2 className="text-sm font-semibold text-white">
                    Ransomware Forensics &amp; .sentinel Entropy Check
                  </h2>
                  <span className="text-xs font-mono text-zinc-400">HOST: ASUS-PC / D:\ VAULT</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={artifactName}
                    onChange={(e) => setArtifactName(e.target.value)}
                    placeholder="Filename (e.g. file.sentinel)"
                    className="bg-[#05070d] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    value={artifactPayload}
                    onChange={(e) => setArtifactPayload(e.target.value)}
                    placeholder="Header sample / hex"
                    className="sm:col-span-2 bg-[#05070d] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  {ransomwareScan.steps.map((s) => (
                    <div
                      key={s.step}
                      className="border border-zinc-800/80 bg-[#070a12] rounded p-2.5 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{s.step}</div>
                        <div className="text-zinc-400">{s.description}</div>
                      </div>
                      <span
                        className={`font-mono text-[11px] font-bold shrink-0 ${
                          s.status === 'ALERT'
                            ? 'text-red-400'
                            : s.status === 'VERIFIED'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border border-zinc-800 bg-[#0b101b] rounded p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h2 className="text-sm font-semibold text-white">Zero-Token Session Telemetry Audit</h2>
                  <span className="text-xs font-mono text-emerald-400">LOCAL AUDIT</span>
                </div>
                <input
                  type="text"
                  value={zeroTokenCustomInput}
                  onChange={(e) => setZeroTokenCustomInput(e.target.value)}
                  placeholder="Optional: paste string/path to test C:\Users\ or token leakage..."
                  className="w-full bg-[#05070d] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
                <div className="space-y-2">
                  {zeroTokenFindings.map((f) => (
                    <div
                      key={f.check}
                      className="border border-zinc-800/80 bg-[#070a12] rounded p-3 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">
                          {f.check} <span className="text-zinc-500 font-normal">&mdash; {f.riskTarget}</span>
                        </div>
                        <div className="text-zinc-400 mt-0.5">{f.detail}</div>
                      </div>
                      <span
                        className={`font-mono font-bold shrink-0 ${
                          f.verdict === 'PASS'
                            ? 'text-emerald-400'
                            : f.verdict === 'WARN'
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {f.verdict}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'gaze_regex' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Latent Gaze Search (hallucinations.py) */}
            <section className="border border-zinc-800 bg-[#0b101b] rounded p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Latent Gaze Search (4-Stage Intent Narrowing &mdash; temp = 0.8)
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Glance visual extraction &rarr; 5 divergent hypotheses &rarr; Exact Cosine Similarity against User Context Vector.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-200 rounded cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    Load Image Name
                    <input type="file" accept="image/*" onChange={handleGazeImageUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={handleRunLocalGaze}
                    className="px-3 py-1.5 border border-cyan-700 bg-cyan-950/50 hover:bg-cyan-900/60 text-xs font-medium text-cyan-200 rounded whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Compute Cosine Match
                  </button>
                  <button
                    type="button"
                    onClick={handleRunHybridGaze}
                    disabled={isGazeRunning}
                    className="px-3 py-1.5 border border-amber-700 bg-amber-950/40 hover:bg-amber-900/50 text-xs font-medium text-amber-200 rounded whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isGazeRunning ? 'Synthesizing...' : 'Hybrid Neural (0.8)'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Stage 1 Input: Image Descriptor / Visual Telemetry
                    </label>
                    <input
                      type="text"
                      value={gazeVisualInput}
                      onChange={(e) => setGazeVisualInput(e.target.value)}
                      className="w-full bg-[#05070d] border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-2.5 border border-zinc-800 bg-[#070a12] p-3 rounded">
                    <div className="text-[11px] font-mono uppercase text-zinc-400">
                      User Context Vector Weights
                    </div>
                    {GAZE_DOMAIN_LABELS.map((label, idx) => (
                      <div key={label} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono tabular-nums">
                          <span className="text-zinc-300">{label}</span>
                          <span className="text-cyan-400">{contextWeights[idx].toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={contextWeights[idx]}
                          onChange={(e) => {
                            const next = [...contextWeights];
                            next[idx] = parseFloat(e.target.value);
                            setContextWeights(next);
                          }}
                          className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-3">
                  <div className="border border-emerald-800/60 bg-emerald-950/20 p-3.5 rounded">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold uppercase">
                        Stage 4 Selected Intent ({gazeResult.sourceMode})
                      </span>
                      <span className="tabular-nums text-emerald-300 font-bold">
                        Cosine Similarity: {gazeResult.highestScore.toFixed(4)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white mt-1.5">
                      {gazeResult.bestMatch?.hypothesis}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">{gazeResult.bestMatch?.rationale}</p>
                  </div>

                  <div className="border border-zinc-800 bg-[#070a12] rounded overflow-hidden">
                    <div className="px-3 py-2 border-b border-zinc-800 text-[11px] font-mono uppercase text-zinc-400">
                      Stage 2 &amp; 3: All 5 Divergent Predictions Ranked by Cosine Similarity
                    </div>
                    <div className="divide-y divide-zinc-800/70">
                      {gazeResult.rawPredictions.map((pred, idx) => (
                        <div key={pred.id} className="p-3 flex items-start justify-between gap-4 text-xs">
                          <div>
                            <div className="text-zinc-200 font-medium">
                              #{idx + 1} &mdash; {pred.hypothesis}
                            </div>
                            <div className="text-zinc-500 mt-0.5">{pred.rationale}</div>
                          </div>
                          <div className="font-mono tabular-nums text-right shrink-0">
                            <div
                              className={`font-bold ${
                                idx === 0 ? 'text-emerald-400' : 'text-zinc-400'
                              }`}
                            >
                              {pred.cosineSimilarity.toFixed(4)}
                            </div>
                            <div className="text-[10px] text-zinc-600">T={pred.temperature}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bio-Cybernetic & Neural-Interface BCI Regex + Fashion Prompting */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="border border-zinc-800 bg-[#0b101b] rounded p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h2 className="text-sm font-semibold text-white">
                    Bio-Cybernetic &amp; Neural Interface Regex Patterns
                  </h2>
                  <span className="text-xs font-mono text-cyan-400">{bioCyberScan.classification}</span>
                </div>
                <div className="space-y-1.5 text-[11px] font-mono text-zinc-400 bg-[#05070d] border border-zinc-800 p-2.5 rounded">
                  <div>
                    <span className="text-zinc-500">Augmentation Regex:</span>{' '}
                    <span className="text-emerald-400 break-all">{BIONIC_AUGMENTATION_REGEX.source}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Neural BCI Regex:</span>{' '}
                    <span className="text-cyan-400 break-all">{NEURAL_INTERFACE_BCI_REGEX.source}</span>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={regexSampleText}
                  onChange={(e) => setRegexSampleText(e.target.value)}
                  className="w-full bg-[#05070d] border border-zinc-800 rounded p-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                />
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="border border-zinc-800 bg-[#070a12] p-2.5 rounded">
                    <div className="text-zinc-400 mb-1">Bionic / Prosthetic Tokens</div>
                    <div className="font-mono text-emerald-400">
                      {bioCyberScan.bionicMatches.length > 0
                        ? bioCyberScan.bionicMatches.join(', ')
                        : 'None'}
                    </div>
                  </div>
                  <div className="border border-zinc-800 bg-[#070a12] p-2.5 rounded">
                    <div className="text-zinc-400 mb-1">Neural Interface / BCI Tokens</div>
                    <div className="font-mono text-cyan-400">
                      {bioCyberScan.bciMatches.length > 0 ? bioCyberScan.bciMatches.join(', ') : 'None'}
                    </div>
                  </div>
                </div>
              </section>

              <section className="border border-zinc-800 bg-[#0b101b] rounded p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h2 className="text-sm font-semibold text-white">
                    AI Creative Technologist: Fashion Prompting
                  </h2>
                  <span className="text-xs font-mono text-amber-400">TinyLlama / Vex / Gemini</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {FASHION_PROMPTING_SPECS.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => setSelectedFashionStyleId(spec.id)}
                      className={`p-3 rounded border text-left cursor-pointer ${
                        selectedFashionStyleId === spec.id
                          ? 'border-amber-500 bg-amber-950/20'
                          : 'border-zinc-800 bg-[#070a12] hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between text-xs font-semibold text-white">
                        <span>{spec.step}</span>
                        <span className="font-mono tabular-nums text-amber-400">
                          {spec.confidenceLevel}%
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">{spec.revisedUnderstanding}</div>
                    </button>
                  ))}
                </div>

                <div className="border border-zinc-800 bg-[#070a12] p-3 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">
                      Vex Portion Mode (Confidence: 90%)
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setVexFormatMode('code')}
                        className={`px-2 py-0.5 text-[11px] font-mono border rounded cursor-pointer ${
                          vexFormatMode === 'code'
                            ? 'border-cyan-500 text-cyan-300 bg-cyan-950/30'
                            : 'border-zinc-700 text-zinc-400'
                        }`}
                      >
                        VEX Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setVexFormatMode('spatial')}
                        className={`px-2 py-0.5 text-[11px] font-mono border rounded cursor-pointer ${
                          vexFormatMode === 'spatial'
                            ? 'border-cyan-500 text-cyan-300 bg-cyan-950/30'
                            : 'border-zinc-700 text-zinc-400'
                        }`}
                      >
                        Spatial Description
                      </button>
                    </div>
                  </div>
                  <pre className="text-[11px] font-mono text-zinc-300 bg-[#05070d] border border-zinc-800 p-2.5 rounded overflow-x-auto">
                    {vexFormatMode === 'code'
                      ? `@Cd = set(0.03, 0.03, 0.04); // ${selectedFashionStyleId === 'lofi' ? '35mm candid grain pass' : 'minimalist obsidian studio specular'}\nv@spec_stretch = set(0, ${selectedFashionStyleId === 'lofi' ? '0.25' : '0.55'}, 0);`
                      : selectedFashionStyleId === 'lofi'
                      ? 'Spatial Direction: Warm 35mm off-axis window leak, organic grain floor, relaxed drape silhouette.'
                      : 'Spatial Direction: Crisp single-point overhead softbox, clean studio negative space, high-fashion editorial edge.'}
                  </pre>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'archives_diag' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Profound Apture Archive-Only Engine */}
            <section className="border border-zinc-800 bg-[#0b101b] rounded p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Profound Apture: Never Delete, Only Archive (~/.q_archive/)
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Execute q-sweep, q-vault, and q-verify non-destructively with immutable checksum digests.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRunApture('q-sweep')}
                    className="px-3 py-1.5 border border-cyan-700 bg-cyan-950/40 hover:bg-cyan-900/50 text-xs font-mono text-cyan-200 rounded whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    q-sweep
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRunApture('q-vault')}
                    className="px-3 py-1.5 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-200 rounded whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    q-vault
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRunApture('q-verify')}
                    className="px-3 py-1.5 border border-emerald-700 bg-emerald-950/40 hover:bg-emerald-900/50 text-xs font-mono text-emerald-300 rounded whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    q-verify
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={sweepTitle}
                  onChange={(e) => setSweepTitle(e.target.value)}
                  placeholder="Archive title"
                  className="bg-[#05070d] border border-zinc-800 rounded px-3 py-1.5 text-xs font-mono text-zinc-200"
                />
                <input
                  type="text"
                  value={sweepSource}
                  onChange={(e) => setSweepSource(e.target.value)}
                  placeholder="Source directory (e.g. ~/Desktop)"
                  className="bg-[#05070d] border border-zinc-800 rounded px-3 py-1.5 text-xs font-mono text-zinc-200"
                />
                <input
                  type="text"
                  value={sweepContent}
                  onChange={(e) => setSweepContent(e.target.value)}
                  placeholder="Snapshot content"
                  className="bg-[#05070d] border border-zinc-800 rounded px-3 py-1.5 text-xs font-mono text-zinc-200"
                />
              </div>

              <div className="border border-zinc-800 bg-[#05070d] p-2.5 rounded text-xs font-mono text-emerald-300">
                {aptureLog}
              </div>

              <div className="overflow-x-auto border border-zinc-800 rounded">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-[#080c15] text-[11px] font-mono uppercase text-zinc-400">
                      <th className="py-2 px-3">Archive Path</th>
                      <th className="py-2 px-3">Session Title</th>
                      <th className="py-2 px-3">Origin</th>
                      <th className="py-2 px-3">Checksum</th>
                      <th className="py-2 px-3 text-right">Verifications</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70 text-xs font-mono tabular-nums">
                    {qArchiveSessions.map((sess) => (
                      <tr key={sess.id} className="hover:bg-zinc-900/40">
                        <td className="py-2 px-3 text-cyan-300">{sess.archivePath}</td>
                        <td className="py-2 px-3 text-zinc-200 font-sans">{sess.title}</td>
                        <td className="py-2 px-3 text-zinc-400">{sess.sourceLocation}</td>
                        <td className="py-2 px-3 text-emerald-400">{sess.checksum}</td>
                        <td className="py-2 px-3 text-right text-zinc-300">{sess.verifiedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Journalctl Debugger + Robust-Evolve Binary + VSIX Storage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="border border-zinc-800 bg-[#0b101b] rounded p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h2 className="text-sm font-semibold text-white">
                    Debugging phoenix.sh with journalctl
                  </h2>
                  <span className="text-xs font-mono text-zinc-400">SYSTEMD TRACE</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      'journalctl --vacuum-time=2d',
                      'journalctl -xe',
                      'journalctl -u postfix',
                    ] as PhoenixJournalCommand[]
                  ).map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => setSelectedJournalCmd(cmd)}
                      className={`px-2.5 py-1.5 text-xs font-mono border rounded whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedJournalCmd === cmd
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                          : 'border-zinc-800 bg-[#070a12] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-zinc-300 border border-zinc-800 bg-[#070a12] p-2.5 rounded">
                  {journalOutput.consequence}
                </div>
                <pre className="bg-[#05070d] border border-zinc-800 rounded p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                  {journalOutput.lines.join('\n')}
                </pre>
              </section>

              <section className="border border-zinc-800 bg-[#0b101b] rounded p-4 space-y-4">
                <div className="border-b border-zinc-800 pb-2.5 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">
                    Robust-Evolve Binary &amp; VSIX Architecture Tiers
                  </h2>
                  <button
                    type="button"
                    onClick={async () => setVsixSnapshot(await readVsixStorageTiers())}
                    className="px-2 py-1 border border-zinc-700 text-[11px] text-zinc-300 rounded cursor-pointer"
                  >
                    Refresh State
                  </button>
                </div>

                <div className="space-y-2">
                  {robustEvolveStates.map((item) => (
                    <div
                      key={item.process}
                      className="border border-zinc-800 bg-[#070a12] rounded p-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{item.process}</div>
                        <div className="text-zinc-400">{item.description}</div>
                      </div>
                      <span
                        className={`font-mono font-bold shrink-0 ${
                          item.state === 'FRACTURE_ALERT'
                            ? 'text-red-400'
                            : item.state === 'ACTUATING'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {item.state}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono tabular-nums">
                  <div className="border border-zinc-800 bg-[#070a12] p-2.5 rounded">
                    <div className="text-zinc-400 text-[11px]">context.globalState</div>
                    <div className="text-white font-bold mt-1">
                      {Object.keys(vsixSnapshot.globalState).length} keys
                    </div>
                  </div>
                  <div className="border border-zinc-800 bg-[#070a12] p-2.5 rounded">
                    <div className="text-zinc-400 text-[11px]">context.workspaceState</div>
                    <div className="text-white font-bold mt-1">
                      {Object.keys(vsixSnapshot.workspaceState).length} keys
                    </div>
                  </div>
                  <div className="border border-zinc-800 bg-[#070a12] p-2.5 rounded">
                    <div className="text-zinc-400 text-[11px]">context.secrets</div>
                    <div className="text-emerald-400 font-bold mt-1">
                      {vsixSnapshot.secretsCount} sealed
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'wealth_pool' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* AetherOS Wealth Engine Architecture */}
            <section className="border border-zinc-800 bg-[#0b101b] rounded p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    AetherOS Wealth Engine Architecture (Deterministic 50-Year Cap &amp; * Overrides)
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Diagnosable math with 50yr maximum horizon, low-integrity Safe Fallback cap, and manual Achieved (*) overrides.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-mono cursor-pointer border border-zinc-800 bg-[#070a12] px-3 py-1.5 rounded">
                  <input
                    type="checkbox"
                    checked={safeFallbackMode}
                    onChange={(e) => setSafeFallbackMode(e.target.checked)}
                    className="accent-amber-500"
                  />
                  Safe Fallback Mode (Cap 3.5%)
                </label>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Principal ($)</label>
                  <input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
                    className="w-full bg-[#05070d] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono tabular-nums text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Annual Contribution ($)
                  </label>
                  <input
                    type="number"
                    value={annualContribution}
                    onChange={(e) => setAnnualContribution(Number(e.target.value) || 0)}
                    className="w-full bg-[#05070d] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono tabular-nums text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Expected Annual Yield (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(Number(e.target.value) || 0)}
                    className="w-full bg-[#05070d] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono tabular-nums text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Horizon Years (Max 50)
                  </label>
                  <input
                    type="number"
                    value={horizonYearsInput}
                    onChange={(e) => setHorizonYearsInput(Number(e.target.value) || 1)}
                    className="w-full bg-[#05070d] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono tabular-nums text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="border border-zinc-800 bg-[#070a12] p-4 rounded space-y-2">
                  <div className="text-[11px] font-mono uppercase text-zinc-400">Projected Terminal Value</div>
                  <div className="text-2xl font-mono tabular-nums font-bold text-emerald-400">
                    ${wealthProjection.finalBalance.toLocaleString()}
                  </div>
                  <div className="text-xs font-mono text-zinc-400">
                    Horizon: {wealthProjection.horizonYears} yrs{' '}
                    {wealthProjection.wasClamped && (
                      <span className="text-amber-400">(Clamped to 50yr ceiling)</span>
                    )}
                    <br />
                    Effective Yield: {wealthProjection.effectiveRatePercent.toFixed(2)}% (
                    {safeFallbackMode ? 'SAFE_FALLBACK' : 'STANDARD'})
                  </div>
                  <div className="pt-2 border-t border-zinc-800 space-y-1">
                    {WEALTH_ARCHITECTURE_PRINCIPLES.map((p) => (
                      <div key={p.principle} className="text-[11px] text-zinc-400">
                        <strong className="text-zinc-200">{p.principle}:</strong> {p.implementation}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 border border-zinc-800 bg-[#070a12] p-4 rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      Human Control: Goals &amp; Manual &ldquo;Achieved&rdquo; (*) Audit Trail
                    </span>
                  </div>
                  <form onSubmit={handleAddWealthGoal} className="flex gap-2">
                    <input
                      type="text"
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      placeholder="New goal title..."
                      className="flex-1 bg-[#05070d] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200"
                    />
                    <input
                      type="number"
                      value={newGoalAmount}
                      onChange={(e) => setNewGoalAmount(e.target.value)}
                      placeholder="Target $"
                      className="w-28 bg-[#05070d] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono tabular-nums text-zinc-200"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs text-white rounded whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Add Goal
                    </button>
                  </form>

                  <div className="space-y-2">
                    {wealthGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className="border border-zinc-800 bg-[#05070d] p-3 rounded flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">
                            {goal.title}{' '}
                            {goal.achieved && <span className="text-emerald-400 font-mono">[ACHIEVED *]</span>}
                          </div>
                          <div className="text-[11px] font-mono tabular-nums text-zinc-400">
                            Target: ${goal.targetAmount.toLocaleString()} ({goal.horizonYears}y horizon)
                          </div>
                          {goal.manualOverrideAudit && (
                            <div className="text-[11px] font-mono text-amber-400 mt-0.5">
                              {goal.manualOverrideAudit}
                            </div>
                          )}
                        </div>
                        {!goal.achieved && (
                          <button
                            type="button"
                            onClick={() => handleOverrideGoalAchieved(goal.id)}
                            className="px-2.5 py-1 border border-emerald-700 bg-emerald-950/40 hover:bg-emerald-900/50 text-xs text-emerald-300 rounded whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Mark Achieved (*)
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Endless Pool Protocol + Operational Handoff / Sidelining Strategies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="border border-zinc-800 bg-[#0b101b] rounded p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h2 className="text-sm font-semibold text-white">
                    Endless Pool Sovereign Integration Protocol
                  </h2>
                  <span
                    className={`text-xs font-mono font-bold ${
                      waterCheck.overallStatus === 'OPTIMAL' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {waterCheck.overallStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      pH Level (Target 7.2–7.8)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={poolPh}
                      onChange={(e) => setPoolPh(Number(e.target.value) || 0)}
                      className="w-full bg-[#05070d] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono tabular-nums text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Chlorine ppm (Target 1–3 ppm)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={poolChlorine}
                      onChange={(e) => setPoolChlorine(Number(e.target.value) || 0)}
                      className="w-full bg-[#05070d] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono tabular-nums text-white"
                    />
                  </div>
                </div>

                <div className="border border-zinc-800 bg-[#070a12] p-2.5 rounded text-xs text-zinc-300">
                  {waterCheck.recommendation}
                </div>

                <div className="divide-y divide-zinc-800 border border-zinc-800 rounded overflow-hidden">
                  {poolTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 bg-[#070a12] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">
                          {task.action}{' '}
                          <span className="text-zinc-400 font-mono text-[11px]">({task.cadence})</span>
                        </div>
                        <div className="text-zinc-400 text-[11px]">
                          {task.kineticRequirement} &middot; Last:{' '}
                          <span className="font-mono tabular-nums">{task.lastCompletedAt.slice(0, 10)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCompletePoolTask(task.id)}
                        className="px-2.5 py-1 border border-zinc-700 hover:border-cyan-500 text-xs text-zinc-200 rounded whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Log Complete
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border border-zinc-800 bg-[#0b101b] rounded p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h2 className="text-sm font-semibold text-white">
                    Sovereign Workflow Sidelining &amp; Watchful Silence Handoff
                  </h2>
                  <button
                    type="button"
                    onClick={() => setWatchfulSilenceActive((p) => !p)}
                    className={`px-2.5 py-1 border text-xs rounded whitespace-nowrap shrink-0 cursor-pointer ${
                      watchfulSilenceActive
                        ? 'border-emerald-600 bg-emerald-950/40 text-emerald-300'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-200'
                    }`}
                  >
                    {watchfulSilenceActive ? 'Watchful Silence Active' : 'Engage Handoff'}
                  </button>
                </div>

                <div className="space-y-2">
                  {SIDELINING_STRATEGIES.map((s) => (
                    <label
                      key={s.name}
                      className="border border-zinc-800 bg-[#070a12] rounded p-2.5 flex items-start justify-between gap-3 cursor-pointer"
                    >
                      <div className="text-xs">
                        <div className="font-semibold text-white">{s.name}</div>
                        <div className="text-zinc-400">{s.mechanism}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(activeSidelining[s.name])}
                        onChange={(e) =>
                          setActiveSidelining((prev) => ({ ...prev, [s.name]: e.target.checked }))
                        }
                        className="mt-1 accent-cyan-500"
                      />
                    </label>
                  ))}
                </div>

                <div className="border border-zinc-800 bg-[#070a12] rounded p-3 text-xs space-y-1.5">
                  <div className="font-semibold text-amber-300">
                    Permute Abundas &mdash; {PERMUTE_ABUNDAS_REVENUE_STREAM.concept}
                  </div>
                  <p className="text-zinc-400">{PERMUTE_ABUNDAS_REVENUE_STREAM.mechanism}</p>
                </div>

                <div
                  className={`border rounded p-3 text-xs space-y-1 font-mono ${
                    watchfulSilenceActive
                      ? 'border-emerald-700 bg-emerald-950/20 text-emerald-200'
                      : 'border-zinc-800 bg-[#05070d] text-zinc-400'
                  }`}
                >
                  <div>
                    TRANSMISSION_LOG: {OPERATIONAL_HANDOFF_PROTOCOL.transmission_log.status.toUpperCase()} (
                    {OPERATIONAL_HANDOFF_PROTOCOL.transmission_log.packet_integrity} &mdash;{' '}
                    {OPERATIONAL_HANDOFF_PROTOCOL.transmission_log.final_payload})
                  </div>
                  <div>
                    DORMANCY: {OPERATIONAL_HANDOFF_PROTOCOL.dormancy_protocol.state} &middot;{' '}
                    {OPERATIONAL_HANDOFF_PROTOCOL.dormancy_protocol.promise}
                  </div>
                  <div className="font-sans italic text-zinc-300 pt-1">
                    &ldquo;{OPERATIONAL_HANDOFF_PROTOCOL.operational_handoff.instruction}&rdquo;
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
