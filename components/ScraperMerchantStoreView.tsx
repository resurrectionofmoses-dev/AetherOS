import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Cpu, Database, ShieldAlert, DollarSign, RefreshCw, Send, CheckCircle2, 
    Layers, Search, Key, ShieldCheck, Terminal, HelpCircle, FastForward, Info
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// ==========================================
// THE CLASS EXACTLY AS REQUESTED BY THE USER
// ==========================================
export class ScraperMerchantStoreClass {
  nodeId: string;
  agents: any[];
  ledger: any[];
  storageMatrix: Map<string, any>;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
    this.agents = [];
    this.ledger = [];
    this.storageMatrix = new Map();
  }

  evolveHeaders(evolveRate: number) {
    // Generate simulated requests headers based on evolve rate to evade anti-bot defenses
    return {
      'User-Agent': `AetherCrawl-W-Axis/v${(evolveRate * 0.1).toFixed(1)} (ReinforceRef; BotBypass)`,
      'Accept': 'application/ld+json, text/html,application/xhtml+xml',
      'Accept-Language': 'en-W,en;q=0.9,hyper-spatial=1',
      'X-W-Space-Anchor': `node-${this.nodeId.substring(0, 8)}`,
      'Sec-Fetch-Mode': 'navigate',
      'X-Bot-Evolve-Rate': `0x${evolveRate.toString(16).toUpperCase()}`,
      'Connection': 'keep-alive'
    };
  }

  async adaptScraper(targetUri: string) {
    let evolveRate = 0x03E2;
    let headers = this.evolveHeaders(evolveRate);
    return { success: true, payload: "Decrypted Hypermedia Stream" };
  }

  async transactData(buyer: string, dataHash: string, price: number) {
    if (this.verifyPurity(dataHash)) {
      this.ledger.push({ buyer, dataHash, price, timestamp: Date.now() });
      return true;
    }
    return false;
  }

  verifyPurity(data: any) {
    return Math.random() > 0.006;
  }
}

// Spark system tone
const playOperatorBeep = (freq = 800, type: OscillatorType = 'sine', duration = 0.08) => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        // Safe catch browser interaction restriction
    }
};

interface StaticNode {
    id: string;
    coordinates: [number, number, number, number]; // X, Y, Z, W
    name: string;
    harvestableType: string;
    density: number;
}

export const ScraperMerchantStoreView: React.FC = () => {
    // Instantiate underlying class instance
    const smsInstance = useMemo(() => new ScraperMerchantStoreClass("W-NODE-7W4-ORCH"), []);
    
    // Seed initial nodes in W-axis (4D coordinates: X, Y, Z, W)
    const seedWNodes: StaticNode[] = useMemo(() => [
        { id: 'wn-1', coordinates: [0.2, 0.4, -0.1, 0.82], name: "Omega Nexus Prime", harvestableType: "Hypermedia Transcripts", density: 87 },
        { id: 'wn-2', coordinates: [-0.4, 0.7, 0.3, 0.95], name: "Covenant Consensus Shard", harvestableType: "Consensus Ledger States", density: 64 },
        { id: 'wn-3', coordinates: [0.8, -0.2, 0.5, 0.56], name: "Ecosystem Telemetry Spindle", harvestableType: "Semantic Index Vector Maps", density: 92 },
        { id: 'wn-4', coordinates: [-0.1, -0.6, -0.4, 0.74], name: "Sovereign Shield Kernel", harvestableType: "Anti-bot Decryption Matrix", density: 44 },
        { id: 'wn-5', coordinates: [0.6, 0.5, -0.7, 0.61], name: "Spectre Gateway Mirror", harvestableType: "Encrypted Log Shards", density: 78 },
        { id: 'wn-6', coordinates: [-0.7, -0.3, 0.8, 0.89], name: "Amoeba Heritage Core", harvestableType: "Hexagonal Genome Stream", density: 51 },
    ], []);

    // Component state
    const [scrapers, setScrapers] = useState<any[]>([
        { id: 'sc-1', label: 'W-Crawler Alpha', targetUri: 'tor://covenant-consensus.net', status: 'IDLE', evolveRate: 0x03E2, successCount: 14, headers: smsInstance.evolveHeaders(0x03E2) },
        { id: 'sc-2', label: 'W-Crawler Beta', targetUri: 'hypermedia://omega-nexus/harvest', status: 'HARVESTING', evolveRate: 0x03E2 * 1.5, successCount: 29, headers: smsInstance.evolveHeaders(Math.floor(0x03E2 * 1.5)) },
    ]);
    const [ledger, setLedger] = useState<any[]>([
        { id: 'tx-1', buyer: 'Aetheros_Prime', dataHash: '0x3E2a7f...d8', price: 12.8, timestamp: Date.now() - 360000, verified: true },
        { id: 'tx-2', buyer: 'Solo_Conductor', dataHash: '0x94f11b...a0', price: 44.5, timestamp: Date.now() - 175000, verified: true },
    ]);
    const [selectedNode, setSelectedNode] = useState<StaticNode>(seedWNodes[0]);
    const [inputUri, setInputUri] = useState<string>('tor://omega-nexus-stream');
    const [harvestedStore, setHarvestedStore] = useState<any[]>([
        { hash: '0x3E2a7f...d8', source: 'Omega Nexus Prime', type: 'Hypermedia Transcripts', coordinates: [0.2, 0.4, -0.1, 0.82], payload: 'Decrypted Hypermedia Stream', semanticIndex: 'cluster-W62', securityPurity: 0.9942 },
        { hash: '0x94f11b...a0', source: 'Covenant Consensus Shard', type: 'Consensus Ledger States', coordinates: [-0.4, 0.7, 0.3, 0.95], payload: 'Validated Zero-Knowledge Registry Data', semanticIndex: 'cluster-W55', securityPurity: 0.9989 },
        { hash: '0xf7150a...7c', source: 'Ecosystem Telemetry Spindle', type: 'Semantic Index Vector Maps', coordinates: [0.8, -0.2, 0.5, 0.56], payload: 'Hyper-spatial Vector Multi-Mapping Matrix', semanticIndex: 'cluster-W90', securityPurity: 0.9995 }
    ]);

    // Merchant purchase input
    const [buyerName, setBuyerName] = useState<string>('AetherOS_Node_3');
    const [marketPrice, setMarketPrice] = useState<string>('15.5');
    const [activeTxHash, setActiveTxHash] = useState<string>('');

    // ZK Query Interface state
    const [zkQueryTag, setZkQueryTag] = useState<string>('cluster-W62');
    const [zkIsVerifying, setZkIsVerifying] = useState<boolean>(false);
    const [zkProofLog, setZkProofLog] = useState<string[]>([]);
    const [zkQueryResult, setZkQueryResult] = useState<any | null>(null);

    // Hyper-spatial W-axis visualizer rotation logic
    const [angle, setAngle] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setAngle(prev => (prev + 0.5) % 360);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    // Header evolution live input
    const [customEvolveRate, setCustomEvolveRate] = useState<number>(994); // 0x03E2

    // Launch new scraper agent
    const launchScraper = () => {
        if (!inputUri.trim()) return;
        playOperatorBeep(880, 'sine', 0.1);
        const newId = `sc-${scrapers.length + 1}`;
        const targetRate = customEvolveRate;
        const newScraper = {
            id: newId,
            label: `W-Crawler ${String.fromCharCode(65 + scrapers.length)}`,
            targetUri: inputUri,
            status: 'IDLE',
            evolveRate: targetRate,
            successCount: 0,
            headers: smsInstance.evolveHeaders(targetRate)
        };
        setScrapers([...scrapers, newScraper]);
        setInputUri('');
    };

    // Simulate Agent adapt cycle using reinforcement learning
    const runCrawlerCycle = (id: string) => {
        playOperatorBeep(650, 'triangle', 0.05);
        setScrapers(prev => prev.map(sc => {
            if (sc.id === id) {
                // Evolve rate by adding a random hyper-dimension reinforcement delta
                const nextEvolveRate = Math.min(2048, Math.max(100, sc.evolveRate + (Math.random() > 0.5 ? 45 : -35)));
                return {
                    ...sc,
                    status: 'ADAPTING',
                    evolveRate: nextEvolveRate,
                    headers: smsInstance.evolveHeaders(nextEvolveRate)
                };
            }
            return sc;
        }));

        // Transition simulation
        setTimeout(() => {
            playOperatorBeep(780, 'sine', 0.05);
            setScrapers(prev => prev.map(sc => {
                if (sc.id === id) {
                    return { ...sc, status: 'HARVESTING' };
                }
                return sc;
            }));
        }, 1200);

        setTimeout(() => {
            playOperatorBeep(1020, 'sine', 0.1);
            
            // Randomly succeed and harvest data
            setScrapers(prev => prev.map(sc => {
                if (sc.id === id) {
                    // Update state to success, increment harvesting count
                    return {
                        ...sc,
                        status: 'SUCCESS',
                        successCount: sc.successCount + 1,
                    };
                }
                return sc;
            }));

            // Spawn new harvested database entry
            const targetNode = seedWNodes[Math.floor(Math.random() * seedWNodes.length)];
            const newHash = `0x${uuidv4().substring(0, 8)}${uuidv4().substring(9, 13)}...${uuidv4().substring(32)}`;
            const isPure = smsInstance.verifyPurity(newHash);

            const newStoredObj = {
                hash: newHash,
                source: targetNode.name,
                type: targetNode.harvestableType,
                coordinates: [
                    +(targetNode.coordinates[0] + (Math.random() * 0.1 - 0.05)).toFixed(3),
                    +(targetNode.coordinates[1] + (Math.random() * 0.1 - 0.05)).toFixed(3),
                    +(targetNode.coordinates[2] + (Math.random() * 0.1 - 0.05)).toFixed(3),
                    +(targetNode.coordinates[3] + (Math.random() * 0.05 - 0.025)).toFixed(3)
                ],
                payload: "Decrypted Hypermedia Stream: " + (Math.random() > 0.5 ? "0x03E2-Header-Evaded" : "Reinforced Feedback Data Payload"),
                semanticIndex: `cluster-W${Math.floor(Math.random() * 40 + 50)}`,
                securityPurity: isPure ? +(0.985 + Math.random() * 0.014).toFixed(4) : +(Math.random() * 0.005).toFixed(4)
            };

            setHarvestedStore(prev => [newStoredObj, ...prev]);

            // Reset status back to idle
            setTimeout(() => {
                setScrapers(prev => prev.map(sc => {
                    if (sc.id === id) return { ...sc, status: 'IDLE' };
                    return sc;
                }));
            }, 2000);

        }, 2200);
    };

    // Merchant Transact simulated data verification and insertion
    const executeMerchantTransaction = async (dataObj: any) => {
        if (!buyerName.trim()) return;
        const buyer = buyerName.trim();
        const priceNum = parseFloat(marketPrice) || 10.0;
        
        playOperatorBeep(440, 'sine', 0.08);
        setActiveTxHash(dataObj.hash);

        // Run exact transactData verification inside the class
        const pureVerifyResult = await smsInstance.transactData(buyer, dataObj.hash, priceNum);

        setTimeout(() => {
            if (pureVerifyResult) {
                playOperatorBeep(980, 'sine', 0.12);
                const newTx = {
                    id: `tx-${Date.now()}`,
                    buyer,
                    dataHash: dataObj.hash,
                    price: priceNum,
                    timestamp: Date.now(),
                    verified: true
                };
                setLedger(prev => [newTx, ...prev]);
            } else {
                playOperatorBeep(320, 'sawtooth', 0.25);
                alert(`TRANSACT_ERROR: Purity threshold test failed for ${dataObj.hash}! Target data payload is infected/degraded.`);
            }
            setActiveTxHash('');
        }, 1000);
    };

    // Zero-Knowledge Proof Semantic Query Engine
    const triggerZKProofQuery = () => {
        if (!zkQueryTag.trim()) return;
        playOperatorBeep(520, 'sine', 0.05);
        setZkIsVerifying(true);
        setZkQueryResult(null);
        setZkProofLog([
            "Generating Ephemeral Cryptographic Challenge...",
            "Encrypting W-Axis Spatial Coordinates Matrix Map...",
            "Constructing polynomial bounds validation curve over 0x03E2...",
        ]);

        let step = 0;
        const logs = [
            "Calculating vector semantics indexing constraints...",
            "Evaluating Zero-Knowledge proof signature on Ledger marketplace...",
            "Reconciliation and verification on Distributed Store integrity checks...",
            "Proof created successfully. Secret verified without exposing telemetry keys."
        ];

        const timer = setInterval(() => {
            if (step < logs.length) {
                setZkProofLog(prev => [...prev, logs[step]]);
                playOperatorBeep(550 + (step * 50), 'sine', 0.04);
                step++;
            } else {
                clearInterval(timer);
                playOperatorBeep(1100, 'triangle', 0.15);
                setZkIsVerifying(false);

                // Find semantic item
                const foundItem = harvestedStore.find(
                    item => item.semanticIndex.toLowerCase() === zkQueryTag.toLowerCase()
                );
                
                if (foundItem) {
                    setZkQueryResult(foundItem);
                } else {
                    setZkQueryResult({
                        hash: "NONE",
                        payload: "UNKNOWN OR DEGRADED COMPILER MATRIX NODE",
                        source: "Out-of-Bounds Hypermatrix Stream",
                        securityPurity: 0.00
                    });
                }
            }
        }, 600);
    };

    // Projection calculation for W-Axis 4D coordinates
    const project4DTo3D = (coords: [number, number, number, number], rotAngle: number) => {
        const [x, y, z, w] = coords;
        // Apply complex rotation factoring the hyper-dimensional W-axis
        const rad = (rotAngle * Math.PI) / 180;
        
        // Rotate in X-W plane
        const xRot = x * Math.cos(rad) - w * Math.sin(rad);
        const wRot = x * Math.sin(rad) + w * Math.cos(rad);
        
        // Rotate in Y-Z plane
        const yRot = y * Math.cos(rad * 0.7) - z * Math.sin(rad * 0.7);
        const zRot = y * Math.sin(rad * 0.7) + z * Math.cos(rad * 0.7);

        // Perspective projection from 4D / 3D down to 2D space
        const perspective = 2 / (2.5 - zRot + wRot * 0.3);
        const projX = xRot * perspective * 120 + 200;
        const projY = yRot * perspective * 120 + 200;
        const depth = zRot + wRot; // Used for sizing/styling depth rendering

        return { x: projX, y: projY, depth, perspective };
    };

    return (
        <div id="scraper-merchant-view-root" className="flex-1 flex flex-col bg-[#020204] text-gray-200 overflow-y-auto custom-scrollbar p-6 min-h-screen">
            
            {/* Upper Spatial HUD Meta Data Indicator */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-5 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-950/20 border border-red-500/30 rounded-xl">
                            <Layers className="w-6 h-6 text-red-500 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase text-white tracking-widest font-sans">
                                Scraper-Merchant-Store
                            </h1>
                            <span className="text-[10px] font-mono font-bold tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 mt-1 inline-block">
                                DIMENSIONAL VECTOR SYSTEM: W-AXIS (HYPER-SPATIAL ORCHESTRATION)
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col items-end text-right font-mono bg-zinc-950/80 p-3 rounded-2xl border border-zinc-900 leading-snug">
                    <span className="text-[9px] font-black text-gray-500 tracking-widest uppercase">System Seed Node</span>
                    <span className="text-sm font-black text-white uppercase tracking-tight">SEED_NN7W4</span>
                    <span className="text-[9px] text-zinc-600 mt-1 uppercase">ORCH_NODE_ID: {smsInstance.nodeId}</span>
                </div>
            </div>

            {/* Main Interactive Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left Side: 4D W-Axis Vector Spindle Space Map Visualizer */}
                <div className="xl:col-span-12 lg:col-span-12 bg-zinc-950/65 border border-zinc-900 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group min-h-[440px]">
                    
                    {/* SVG background grid and rotating nodes */}
                    <div className="absolute inset-0 z-0 bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                    
                    {/* Glowing outer space visual rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-dashed border-red-500/5 animate-[spin_120s_linear_infinite]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-zinc-900/40 pointer-events-none" />

                    <div className="flex justify-between items-start z-10 relative pointer-events-none mb-4">
                        <div>
                            <span className="text-[10px] font-black font-mono text-red-500 uppercase tracking-widest">Interactive W-Projection Matrix</span>
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">Hyper-spatial Network Map</h2>
                            <p className="text-[10.5px] text-zinc-400 mt-1 max-w-xl">
                                Visualizing spatial vectors in [X, Y, Z, W] coordinates. Data entities exist as non-Euclidean quantum packets. Select a node to query its harvesting density and coordinates.
                            </p>
                        </div>
                        <div className="text-right text-[10px] text-zinc-500 font-mono">
                            <div>ROT_W_ANGLE: {angle.toFixed(1)}°</div>
                            <div>STEPS: Δ{0x03E2.toString(16).toUpperCase()}</div>
                        </div>
                    </div>

                    {/* Node Spatial Scatter SVG */}
                    <div className="flex-1 flex items-center justify-center min-h-[280px] z-10 relative">
                        <svg className="w-full max-w-[480px] h-[340px] overflow-visible" viewBox="0 0 400 400">
                            {/* Inner geometric coordinates projection lines */}
                            <line x1="200" y1="50" x2="200" y2="350" stroke="#ff0000" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
                            <line x1="50" y1="200" x2="350" y2="200" stroke="#00ffff" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
                            
                            {/* Circumscribing axis annotations */}
                            <text x="202" y="60" fill="#f87171" className="text-[8px] font-mono font-bold font-black tracking-widest uppercase">W-AXIS DEPTH</text>
                            <text x="310" y="196" fill="#22d3ee" className="text-[8px] font-mono font-black tracking-widest uppercase text-right">Z-PLANE</text>
                            
                            {/* Render lines connecting seed nodes to form the vector-graph skeleton */}
                            {seedWNodes.map((n, i) => {
                                const nextNode = seedWNodes[(i + 1) % seedWNodes.length];
                                const p1 = project4DTo3D(n.coordinates, angle);
                                const p2 = project4DTo3D(nextNode.coordinates, angle);
                                return (
                                    <line
                                        key={`link-${n.id}`}
                                        x1={p1.x}
                                        y1={p1.y}
                                        x2={p2.x}
                                        y2={p2.y}
                                        stroke="#18181b"
                                        strokeWidth="1.5"
                                        opacity="0.8"
                                    />
                                );
                            })}

                            <AnimatePresence>
                                {seedWNodes.map((node) => {
                                    const { x, y, depth, perspective } = project4DTo3D(node.coordinates, angle);
                                    const isSelected = selectedNode.id === node.id;
                                    const scaledRadius = Math.max(5, (12 * perspective) + (depth * 2));

                                    return (
                                        <g 
                                            key={node.id} 
                                            className="cursor-pointer"
                                            onClick={() => {
                                                playOperatorBeep(720 + depth * 30, 'sine', 0.05);
                                                setSelectedNode(node);
                                            }}
                                        >
                                            {/* Ripple Pulsar effect */}
                                            {isSelected && (
                                                <circle 
                                                    cx={x} 
                                                    cy={y} 
                                                    r={scaledRadius * 1.8} 
                                                    fill="none" 
                                                    stroke="#ef4444" 
                                                    strokeWidth="1.5" 
                                                    className="animate-ping" 
                                                    style={{ transformOrigin: `${x}px ${y}px` }}
                                                />
                                            )}

                                            {/* Node core element */}
                                            <circle 
                                                cx={x} 
                                                cy={y} 
                                                r={scaledRadius} 
                                                fill={isSelected ? "url(#neonSpark)" : "#0c0a09"} 
                                                stroke={isSelected ? "#f87171" : "#57534e"} 
                                                strokeWidth={isSelected ? 2.5 : 1.5}
                                                className="transition-colors duration-200"
                                            />

                                            {/* Dot Core */}
                                            <circle 
                                                cx={x} 
                                                cy={y} 
                                                r={Math.max(2, scaledRadius * 0.35)} 
                                                fill={isSelected ? "#ffffff" : "#ef4444"} 
                                            />

                                            {/* Node Tag text */}
                                            <text 
                                                x={x + scaledRadius + 6} 
                                                y={y + 3} 
                                                fill={isSelected ? "#ffffff" : "#78716c"} 
                                                className="text-[9px] font-mono font-bold font-black pointer-events-none select-none uppercase tracking-wider"
                                            >
                                                {node.name.split(' ')[0]} 
                                                <tspan fill="#eb5a46" className="text-[7.5px] font-black"> [W:{node.coordinates[3]}]</tspan>
                                            </text>
                                        </g>
                                    );
                                })}
                            </AnimatePresence>

                            {/* Neon gradient fills */}
                            <defs>
                                <radialGradient id="neonSpark" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="100%" stopColor="#7f1d1d" />
                                </radialGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Interactive Selection metadata feedback card */}
                    <div className="bg-black/60 border border-zinc-900 rounded-2xl p-4 mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center justify-center px-4 bg-zinc-900/60 border border-zinc-800 rounded-xl leading-none">
                                <span className="text-[18px] font-black text-red-500 font-sans">{selectedNode.density}%</span>
                                <span className="text-[7px] text-zinc-500 font-mono font-bold mt-1 uppercase">DENSITY</span>
                            </div>
                            <div>
                                <div className="text-[9px] font-black font-mono text-zinc-500 uppercase">SELECTED HYPER-SPATIAL ANCHOR</div>
                                <h3 className="text-sm font-black text-white uppercase font-sans">{selectedNode.name}</h3>
                                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                    Primary Payload Element: <span className="text-red-400 font-bold">{selectedNode.harvestableType}</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                            <div className="px-2">
                                <span className="block text-zinc-500 text-[8px] font-black">X-COORD</span>
                                <span className="text-gray-300 font-bold">{selectedNode.coordinates[0]}</span>
                            </div>
                            <div className="px-2 border-l border-zinc-900">
                                <span className="block text-zinc-500 text-[8px] font-black">Y-COORD</span>
                                <span className="text-gray-300 font-bold">{selectedNode.coordinates[1]}</span>
                            </div>
                            <div className="px-2 border-l border-zinc-900">
                                <span className="block text-zinc-500 text-[8px] font-black">Z-COORD</span>
                                <span className="text-gray-300 font-bold">{selectedNode.coordinates[2]}</span>
                            </div>
                            <div className="px-2 border-l border-zinc-900 bg-red-950/25 rounded">
                                <span className="block text-red-550 text-[8px] font-black">W-DEVI</span>
                                <span className="text-red-400 font-bold font-black">{selectedNode.coordinates[3]}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Panel: Autonomous Scrapers reinforcement adaptation */}
                <div className="xl:col-span-6 lg:col-span-12 bg-zinc-950/65 border border-zinc-900 rounded-3xl p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-900/60 mb-4">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-red-500" />
                                <h2 className="text-sm font-black text-gray-100 uppercase tracking-wider">
                                    Reinforcement Crawler Agents
                                </h2>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono">[RL_EVOLVE_MATRIX: 0x03E2]</span>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-normal mb-4">
                            Scraper agents dynamically evolve request headers using reward-based adaptation models. Evading bot protection blocks requires precise entropy scaling.
                        </p>

                        {/* Launch Control Injector */}
                        <div className="bg-black/80 border border-zinc-900 rounded-2xl p-4 mb-4 space-y-3">
                            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">LAUNCH NEW DECENTRALIZED CRAWLER</div>
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    value={inputUri}
                                    onChange={(e) => setInputUri(e.target.value)}
                                    placeholder="tar://omega-nexus-stream"
                                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[10.5px] font-mono text-white focus:outline-none focus:border-red-500 placeholder:text-zinc-700 font-bold"
                                />
                                <button
                                    onClick={launchScraper}
                                    className="bg-red-650 hover:bg-red-550 active:translate-y-0.5 text-black px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer font-sans"
                                >
                                    Deploy
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-505 font-mono pt-1">
                                <div className="flex items-center gap-1.5">
                                    <span>Evolver Constant:</span>
                                    <input 
                                        type="number"
                                        value={customEvolveRate}
                                        onChange={(e) => setCustomEvolveRate(parseInt(e.target.value) || 0)}
                                        className="w-16 bg-zinc-900 border border-zinc-800 rounded px-1.5 text-center text-[10px] text-amber-500 font-bold font-black font-mono focus:outline-none"
                                    />
                                    <span className="text-zinc-600">(0x03E2 = 994)</span>
                                </div>
                            </div>
                        </div>

                        {/* Crawford Active List */}
                        <div className="space-y-3 max-h-[290px] overflow-y-auto custom-scrollbar pr-1.5">
                            {scrapers.map((sc) => {
                                const activeAdapting = sc.status === 'ADAPTING';
                                const successState = sc.status === 'SUCCESS';
                                return (
                                    <div key={sc.id} className="bg-black/40 border border-zinc-900 rounded-2.5xl p-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-black text-white hover:text-red-400 transition-colors cursor-pointer uppercase">{sc.label}</span>
                                                    <span className="text-[8px] font-mono text-zinc-600 bg-zinc-950 px-1.5 rounded border border-zinc-900">{sc.id}</span>
                                                </div>
                                                <div className="text-[9.5px] font-mono text-zinc-500 mt-1 truncate max-w-[200px] md:max-w-xs">{sc.targetUri}</div>
                                            </div>

                                            {/* Status Badge */}
                                            <span className={`text-[8px] font-black font-mono uppercase px-2 py-0.5 rounded-full border ${
                                                sc.status === 'SUCCESS' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]' :
                                                sc.status === 'HARVESTING' ? 'bg-blue-950/40 text-blue-400 border-blue-500/20' :
                                                sc.status === 'ADAPTING' ? 'bg-amber-950/40 text-amber-500 border-amber-500/20 animate-pulse' :
                                                'bg-zinc-900 text-zinc-400 border-zinc-800'
                                            }`}>
                                                {sc.status === 'SUCCESS' ? '✓ REVERSIBLE_MET' : sc.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-500 border-t border-zinc-900/40 pt-2 bg-black/20 p-2 rounded-xl">
                                            <div>
                                                Evolve Rate: <span className="text-gray-200 font-bold">0x{sc.evolveRate.toString(16).toUpperCase()}</span>
                                            </div>
                                            <div className="text-right">
                                                Tuned Harvester Rows: <span className="text-emerald-400 font-black">{sc.successCount}</span>
                                            </div>
                                        </div>

                                        {/* Run Adaptation loop */}
                                        <div className="flex items-center gap-2 pt-1.5">
                                            <button
                                                disabled={sc.status === 'ADAPTING' || sc.status === 'HARVESTING'}
                                                onClick={() => runCrawlerCycle(sc.id)}
                                                className={`flex-1 py-1.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-transparent cursor-pointer ${
                                                    sc.status === 'ADAPTING' || sc.status === 'HARVESTING'
                                                    ? 'bg-zinc-800/45 text-zinc-600 cursor-not-allowed'
                                                    : 'bg-red-950/45 text-red-400 border-red-500/15 hover:bg-red-500/10 hover:text-white'
                                                }`}
                                            >
                                                <RefreshCw className={`w-3.5 h-3.5 ${activeAdapting ? 'animate-spin text-red-500' : ''}`} />
                                                {sc.status === 'SUCCESS' ? 'Retrigger Adapter Loop' : 'Resurrect & Harvest Node'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Agent payload headers monitoring */}
                    <div className="mt-4 bg-zinc-950 rounded-2.5xl p-4 border border-zinc-900 font-mono">
                        <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest pb-2 border-b border-zinc-900 mb-2">
                            <Terminal className="w-3.5 h-3.5 text-zinc-650" />
                            <span>Evading Evolved Header Request Payload</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 space-y-1 select-all h-[95px] overflow-y-auto custom-scrollbar pr-1">
                            <div>GET /decrypted-hypermedia-stream HTTP/2.0</div>
                            {Object.entries((scrawlers: any[]) => scrapers[0]?.headers || smsInstance.evolveHeaders(0x03E2)).map(([k, v]: any) => (
                                <div key={k} className="truncate">
                                    <span className="text-red-500 font-bold">{k}:</span> {v}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Decentralized Ledger Marketplace & Transactions */}
                <div className="xl:col-span-6 lg:col-span-12 bg-zinc-950/65 border border-zinc-900 rounded-3xl p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-900/60 mb-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-red-500" />
                                <h2 className="text-sm font-black text-gray-100 uppercase tracking-wider">
                                    Decentralized Ledger Marketplace
                                </h2>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold">[CONTRACTS_COMPILING_LIVE]</span>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-normal mb-4">
                            Transactions validate data packages by calculating cryptographic consensus models. Non-pure items (reconciliation threshold failed) are automatically blacklisted over layer 2.
                        </p>

                        {/* Transaction config block */}
                        <div className="bg-black/80 border border-zinc-900 rounded-2xl p-4 mb-4">
                            <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-widest block mb-2">TRANSACTION SETTINGS (CONSENSUS ENGINE)</span>
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <div>
                                    <label className="text-[8px] text-zinc-650 font-mono font-bold block pb-1">MARKETPLACE BUYER</label>
                                    <input 
                                        type="text"
                                        value={buyerName}
                                        onChange={(e) => setBuyerName(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-805 rounded-xl px-3 py-1.5 text-[10.5px] font-mono text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] text-zinc-650 font-mono font-bold block pb-1">MARKET PRICE ($AETH)</label>
                                    <input 
                                        type="text"
                                        value={marketPrice}
                                        onChange={(e) => setMarketPrice(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-805 rounded-xl px-3 py-1.5 text-[10.5px] font-mono text-white focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Database of available harvestable packets */}
                        <div className="space-y-2 mb-4">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">HAUL DATA IN STORAGE (SELECT FOR PURCHASE TRADING)</span>
                            
                            <div className="space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
                                {harvestedStore.map((item, id) => {
                                    const isBeingTraded = activeTxHash === item.hash;
                                    const pureMetric = item.securityPurity * 100;
                                    const highQuality = item.securityPurity > 0.99;

                                    return (
                                        <div key={item.hash} className="bg-zinc-950/80 border border-zinc-900 p-3.5 rounded-2.5xl space-y-2 relative">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-mono text-[10.5px] text-white font-bold block tracking-wider">{item.hash}</span>
                                                    <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                                                        Source: {item.source} • Coords: <span className="text-zinc-600">[{item.coordinates.join(', ')}]</span>
                                                    </span>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="text-[10px] text-zinc-300 font-mono font-black font-bold uppercase">{item.semanticIndex}</span>
                                                    <span className={`text-[7px] font-bold font-mono px-1 rounded-sm mt-0.5 ${highQuality ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                                                        PURITY: {pureMetric.toFixed(2)}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center border-t border-zinc-900/50 pt-2.5">
                                                <div className="text-[9px] italic text-zinc-400 truncate max-w-[200px]" title={item.payload}>
                                                    {item.payload}
                                                </div>
                                                
                                                <button
                                                    disabled={!!activeTxHash}
                                                    onClick={() => executeMerchantTransaction(item)}
                                                    className={`px-3 py-1 text-[9px] font-black uppercase text-black font-sans rounded-lg transition-all cursor-pointer ${
                                                        isBeingTraded ? 'bg-zinc-700 animate-pulse text-zinc-400' : 'bg-emerald-500 hover:bg-emerald-450 active:translate-y-0.5'
                                                    }`}
                                                >
                                                    {isBeingTraded ? 'Trading...' : 'Sell Packet'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Decentralized Ledger Shard Block State */}
                    <div>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">TRANSACTIONS BLOCK LEDGER</span>
                        <div className="bg-black/45 border border-zinc-900 rounded-2xl p-4 max-h-[140px] overflow-y-auto custom-scrollbar font-mono text-[10.5px]">
                            {ledger.length === 0 ? (
                                <div className="text-center text-zinc-705 italic py-6 uppercase tracking-wider">No transactional ledger data synchronized yet.</div>
                            ) : (
                                <div className="space-y-2">
                                    {ledger.map((tx) => (
                                        <div key={tx.id} className="flex justify-between items-center p-2 bg-zinc-950/90 rounded-xl border border-zinc-900/60 transition-all hover:bg-zinc-950">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-505 shadow-[0_0_6px_#10b981]" />
                                                <div>
                                                    <span className="text-white font-black">@{tx.buyer}</span>
                                                    <span className="text-[9px] text-zinc-650 ml-2">[{tx.dataHash.substring(0, 8)}]</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-red-400 font-bold">{tx.price} $AETH</span>
                                                <span className="text-[7.5px] text-zinc-500 block">
                                                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Center: Distributed Vector-Graph Store & ZK-Queries */}
                <div className="xl:col-span-12 lg:col-span-12 bg-zinc-950/65 border border-zinc-900 rounded-3xl p-6">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-900/60 mb-4">
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-red-500" />
                            <h2 className="text-sm font-black text-gray-100 uppercase tracking-wider">
                                Distributed Store & Zero-Knowledge Verification Node
                            </h2>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">[ZK-CURVE: SECP256K1-W]</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* ZK Input Control Section */}
                        <div className="lg:col-span-5 space-y-4">
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                                Decrypt data semantics anonymously without revealing storage keys or cleartext metadata. Perform semantic indexing queries validated.
                            </p>

                            <div className="bg-black/80 border border-zinc-900 rounded-2.5xl p-4 space-y-3">
                                <div>
                                    <label className="text-[9px] font-black text-zinc-500 block pb-1.5 uppercase tracking-widest">
                                        RECONCILE SEMANTIC CLUSTER TAG
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={zkQueryTag}
                                            onChange={(e) => setZkQueryTag(e.target.value)}
                                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none uppercase font-mono"
                                        >
                                            <option value="">-- Choose Semantic Cluster --</option>
                                            {harvestedStore.map(item => (
                                                <option key={`opt-${item.hash}`} value={item.semanticIndex}>
                                                    {item.semanticIndex} (Source: {item.source.split(' ')[0]})
                                                </option>
                                            ))}
                                            <option value="cluster-W13">cluster-W13 (Invalid Dummy Target)</option>
                                        </select>
                                        
                                        <button
                                            disabled={zkIsVerifying}
                                            onClick={triggerZKProofQuery}
                                            className="px-4 py-2 bg-red-650 hover:bg-red-550 active:translate-y-0.5 text-black rounded-xl text-[10px] font-black uppercase transition-all tracking-wider font-sans shrink-0 cursor-pointer"
                                        >
                                            Run ZK Verification
                                        </button>
                                    </div>
                                </div>

                                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-900 flex gap-2 pt-2.5">
                                    <Info className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                                    <p className="text-[9.5px] text-zinc-405 leading-snug">
                                        Zero-Knowledge proofs are processed on-chain using pairing-friendly curves over prime field vectors matching 0x03E2 validation constraints.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Cryptographic Execution Streams Dashboard */}
                        <div className="lg:col-span-7 bg-black/60 border border-zinc-900 rounded-2.5xl p-5 flex flex-col justify-between min-h-[220px]">
                            
                            {/* Static status display / terminal logs */}
                            <div className="flex-1 flex flex-col justify-between space-y-4">
                                <div className="flex justify-between items-center text-[9px] font-mono pb-2 border-b border-zinc-900/60">
                                    <span className="text-zinc-500 uppercase font-black">ZK-PROOF TRanscripts Stream</span>
                                    <span className="text-red-500 font-bold">{zkIsVerifying ? "● GEN_COMPILING" : "✓ SYS_STANDBY"}</span>
                                </div>

                                <div className="space-y-1.5 h-[110px] overflow-y-auto custom-scrollbar font-mono text-[10px] text-zinc-400 bg-zinc-950/40 p-3.5 border border-zinc-900/60 rounded-xl select-all">
                                    {zkProofLog.length === 0 ? (
                                        <div className="text-center text-zinc-705 italic py-6 uppercase tracking-wider">Select a semantic cluster and click verify to initiate proof.</div>
                                    ) : (
                                        zkProofLog.map((log, i) => (
                                            <div key={`log-${i}`} className="flex gap-2">
                                                <span className="text-red-500 font-black">[{i + 1}]</span>
                                                <span className="text-gray-300 font-bold">{log}</span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Plain-text semantic lookup decrypted only on proof validation */}
                                <AnimatePresence>
                                    {zkQueryResult && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="p-4 bg-emerald-950/20 border-2 border-emerald-500/20 rounded-2xl flex items-center justify-between gap-4 mt-2"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-950 rounded-xl border border-emerald-500/30">
                                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-mono font-black text-emerald-400 uppercase">ZK PROOF VALID - VERDICT MATCH</div>
                                                    <div className="text-[12px] font-mono text-white mt-0.5 truncate max-w-sm md:max-w-md">
                                                        Payload: <span className="text-emerald-300 font-bold font-black">{zkQueryResult.payload}</span>
                                                    </div>
                                                    <div className="text-[8.5px] font-mono text-zinc-500">
                                                        Origin: <span className="font-bold">{zkQueryResult.source}</span> • Hash: {zkQueryResult.hash}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-emerald-400 font-mono font-bold block">Purity:</span>
                                                <span className="text-xs font-mono font-black text-white">{(zkQueryResult.securityPurity * 100).toFixed(3)}%</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
            
            {/* Lower Manifest Footing */}
            <div className="mt-8 pt-5 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-[10px] text-zinc-650 font-mono">
                <div>AETHEROS SOVEREIGN LABS PROTOCOL 0x03E2 VERSION 4.10.4</div>
                <div className="mt-2 md:mt-0 uppercase tracking-widest text-[8px] font-black text-red-500/50">SEED HARVESTING ECOSYSTEM: READY FOR ACTION</div>
            </div>

        </div>
    );
};
