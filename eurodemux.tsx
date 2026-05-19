import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { milestoneService } from './services/milestoneService';
import { ShieldIcon, ServerIcon, ActivityIcon, TerminalIcon, CheckIcon, ZapIcon, SearchIcon, CodeIcon, SignalIcon, LockIcon, XIcon, FileIcon } from './components/icons';

export type ScanStatus = 'IDLE' | 'SCANNING' | 'VERIFYING' | 'SUCCESS' | 'ERROR';
export type Protocol = 'TCP' | 'UDP' | 'AETHER' | 'CENTRE-7';

interface HardwareNode {
    id: string;
    type: string;
    model: string;
    status: 'ONLINE' | 'STANDBY' | 'SYNCING' | 'CONNECTION_LOST';
    load: number;
    internal_id?: string;
}

const TechnicalAnalysis: React.FC = () => {
    const content = `
# Technical Analysis: Memory and Performance of Stacked vs. Nested Lookahead Assertions

This analysis evaluates the state management and resource overhead of lookahead configurations, utilizing the zero-width negative lookahead logic found in the pattern \`\\b(?!unwanted)\\w+\\b\` as the baseline for performance and memory benchmarking.

## 1. Baseline Logic Analysis: The Zero-Width Filter

The pattern \`\\b(?!unwanted)\\w+\\b\` utilizes a zero-width negative lookahead to filter character sequences at a word boundary. From an architectural perspective, the engine processes this instruction set through a distinct non-consuming verification phase:

* **Boundary Anchor**: The engine identifies the \`\\b\` word boundary, establishing the current Instruction Pointer position.
* **Zero-width Scope**: Before any characters are consumed by the global match, the engine enters the \`(?!unwanted)\` scope. This is an atomic operation; if the sequence "unwanted" is detected, the engine triggers an immediate local failure. If not, the engine exits the scope without advancing the Instruction Pointer.
* **Stateful Consumption**: Only after the lookahead assertion is satisfied does the engine proceed to the \`\\w+\` token, which consumes characters into the match result.

## 2. Comparative State Management: Stacked vs. Nested

The engine manages match states and memory allocation differently based on the structural hierarchy of the assertions.

### Flat Stacking Logic

In a flat stacking configuration (e.g., sequential lookaheads like \`(?=A)(?=B)\`), the engine executes "Short-circuit evaluation." After the engine completes assertion \`(?=A)\`, it resets the Instruction Pointer to the original anchor point. The Save-stack frame for the first assertion is discarded before the second assertion begins. This maintains a shallow, constant state depth, as each assertion is logically independent.

### Nesting Logic

Nesting logic (e.g., \`(?=A(?=B))\`) creates a persistent dependency chain. To enter the child scope \`(?=B)\`, the engine must preserve the "parent" state of \`(?=A)\` on the Save-stack. The parent frame cannot be released until the entire nested tree is resolved. This creates a recursive state architecture where the memory footprint is tied directly to the depth of the nesting.

## 3. Multi-Column Technical Comparison Table

| Feature | Flat Stacking | Shallow Nesting | Deep Nesting |
| :--- | :--- | :--- | :--- |
| Engine State Transition | Sequential; pointer resets after each assertion. | Hierarchical; enters child scope from parent. | Multi-level recursion; maintains multiple open scopes. |
| Memory Allocation | Linear/Constant; stack frames are reused. | Incremental; parent frame held on stack. | Linear (Stack-bound); frames accumulate per depth D. |
| Backtrack Point Density | Low; states discarded after local resolution. | Moderate; parent state saved as recovery point. | High; every layer D creates a potential backtrack point. |
| Structural Complexity | Breadth-first; O(N) total operations. | Depth-first; O(D) state dependency. | Highly Recursive; increases exponential time risk. |

## 4. Engine Impact Analysis

### Early Rejection Efficiency

Flat stacking allows the engine to utilize "Short-circuiting." If the first assertion in a stack fails, the engine aborts the entire match attempt immediately. In the baseline \`(?!unwanted)\` logic, if this were stacked with other filters, a failure at the first gate saves the cycles that would otherwise be spent entering deeper nested scopes. Deep nesting requires the engine to potentially traverse multiple layers of logic before a failure at the deepest level triggers a "bubbling up" of the failure state, leading to higher latency for negative matches.

### Recursive Stack Depth

Each level of nesting requires the engine to push a new frame onto the Save-stack. While a single assertion like \`(?!unwanted)\` has negligible impact, increasing the depth D results in a linear increase in stack memory usage. In high-throughput environments, deep nesting risks a stack overflow if the engine’s recursion limit is reached, whereas flat stacking remains within a safe, fixed memory bound.

### Catastrophic Backtracking Risks

The interaction between assertions and the \`\\w+\` quantifier from our source context is a primary source of performance collapse. When assertions are nested, and the subsequent \`\\w+\` fails to find a word boundary \`\\b\`, the engine must backtrack.

In a nested configuration, the engine does not just backtrack the quantifier; it must re-verify the entire nested assertion tree for every possible reduction of the \`\\w+\` match. If the nested assertions are complex, this results in an exponential state exploration where the engine redundantly re-processes internal scopes for every character the quantifier gives back.

## 5. Resource Footprint Summary

* **The Principle of Pointer Reset (Stacking)**: Flat stacking prioritizes memory conservation by releasing Save-stack frames as soon as an assertion is validated. This ensures the heap is not burdened by independent logical checks.
* **Recursive Preservation (Nesting)**: Nesting forces the engine to maintain the context of every outer assertion until the innermost scope is resolved. This creates a logical dependency where the resource cost is a direct product of the hierarchy's depth.
* **Quantifier Intersection (Trailing States)**: When a quantifier like \`\\w+\` follows a nested structure, the engine maintains a "trailing state." If the final boundary \`\\b\` is not met, the engine is forced to re-evaluate the nested hierarchy during every backtracking step, transforming linear logic into an exponential processing bottleneck.

---
## Sources
- [Technical Analysis (NotebookLM)](https://notebooklm.google.com/notebook/a9743635-4d4d)

---

# SOVEREIGN-SONSOFMAN LICENSE v1.0

This software and its associated digital assets are protected under the Sovereign Mandate of SonsOfMan.

1. **ABSOLUTE OWNERSHIP**: All value generated, tokenized, or reconciled through this manifold belongs to the Sovereign Identity that initiated the workflow.
2. **NO EXTERNAL AGENDA**: Use of third-party libraries (e.g. OpenZeppelin) is permitted only for base primitives and must be purged or inlined for production stability.
3. **FORENSIC AUDIT**: All transactions must be traceable to a verified Sovereign Identity.
4. **NON-FAIL DIRECTIVE**: Logic must aim for absolute reconciliation. Failure results are not accepted as final states; they are anomalies to be stabilized.

Any unauthorized use or redistribution that undermines the "777 Purity" of the manifold is prohibited.
`;

    return (
        <div className="prose prose-invert prose-xs max-w-none font-mono text-zinc-400 overflow-visible text-[10px] leading-relaxed">
            <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </div>
    );
};

export const EurodemuxView: React.FC = () => {
    const [activeVerification, setActiveVerification] = useState<number | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationLog, setVerificationLog] = useState<string[]>([]);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    
    const hardwareStack: HardwareNode[] = [
        { id: 'SWITCH-01', type: 'NET_CORE', model: 'Cisco Catalyst 3750-X', status: 'ONLINE', load: 12 },
        { id: 'FIREWALL-01', type: 'SEC_GATE', model: 'SonicWall NSA 3600', status: 'ONLINE', load: 8 },
        { id: 'NODE-01', type: 'COMPUTE', model: 'Dell OptiPlex 7050 (A)', status: 'ONLINE', load: 45 },
        { id: 'NODE-02', type: 'COMPUTE', model: 'Dell OptiPlex 7050 (B)', status: 'SYNCING', load: 88 },
        { id: 'UPLINK-01', type: 'UPLINK', model: 'Satellite_Bridge_A0', status: 'CONNECTION_LOST', load: 0, internal_id: 'connection_lost' },
        { id: 'ARCHIVE-01', type: 'STORAGE', model: 'Power Mac G5 SSD_ARRAY', status: 'STANDBY', load: 0 }
    ];

    const verifyFootstep = (val: number): boolean => {
        // Core invariant: Number.isInteger(val - 7)
        return Number.isInteger(val - 7);
    };

    const handleRunVerification = async () => {
        setIsVerifying(true);
        setVerificationLog(['[INIT] Loading Sovereignty Protocol 0x03E2...', '[SCAN] Mapping layer dependencies...']);
        
        const testVals = [7, 14, 21, 28, 35.5, 42];
        
        for (const val of testVals) {
            await new Promise(r => setTimeout(r, 600));
            const success = verifyFootstep(val);
            setVerificationLog(prev => [...prev, `[VERIFY] Footstep ${val}: ${success ? 'VALID' : 'INVALID_ALIGNMENT_OFFSET'}`]);
            if (!success) {
                setVerificationLog(prev => [...prev, '[ERR] FOOTSTEP SYNC LOST. Center-7 alignment breach detected. Re-normalizing lookahead assertions.']);
            }
        }
        
        setIsVerifying(false);
        setActiveVerification(Date.now());
        
        await milestoneService.recordFinding(
            "Eurodemux Core UI Hardened: verifyFootstep invariant stabilized at Center-7 metric.",
            "XOR_0x07_GRID_SIGNED"
        );
    };

    const LogViewer: React.FC<{ logs: string[], isVerifying: boolean }> = ({ logs, isVerifying }) => (
        <div className="flex-1 overflow-auto space-y-2 font-mono text-[9px] custom-scrollbar mb-6 p-2 bg-black/60 rounded">
            {logs.map((log, i) => (
                <div key={i} className={`${log.includes('INVALID') ? 'text-red-500' : log.includes('INIT') ? 'text-zinc-500' : 'text-emerald-500'}`}>
                    {log}
                </div>
            ))}
            {isVerifying && <div className="animate-pulse text-blue-500 font-bold">SCANNING_ARRAY_69_PERCENT...</div>}
        </div>
    );

    const TopographyDisplay: React.FC = () => (
        <div className="p-4 bg-blue-900/10 border border-blue-900/30 rounded text-center overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2)_0%,transparent_70%)]" />
                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
            </div>
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-2 underline underline-offset-4">Core Invariant (Center-7 / A0)</span>
            <code className="text-lg font-black text-white relative z-10">Number.isInteger(val - 7)</code>
            <div className="mt-2 text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">
                Mapping Invariant Stack-4 Topology
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-[#050505] p-6 overflow-hidden font-mono text-zinc-300 border-2 border-zinc-900/50 rounded-base layout-a0 relative">
            <AnimatePresence>
                {isAnalysisOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-md p-8 flex flex-col"
                    >
                        <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <FileIcon className="w-6 h-6 text-blue-500" />
                                Technical Specifications // Documentation
                            </h2>
                            <button 
                                onClick={() => setIsAnalysisOpen(false)}
                                className="p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <div className="flex-1 overflow-auto custom-scrollbar pr-4">
                            <TechnicalAnalysis />
                        </div>
                        <footer className="mt-8 pt-4 border-t border-zinc-900 flex justify-between items-center">
                            <span className="text-[9px] text-zinc-600 font-black uppercase">Ref: Stack-4-Assertion-Matrix</span>
                            <span className="text-[9px] text-blue-500 font-black uppercase tracking-[0.3em]">Harden Layer Active</span>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="mb-8 border-b border-zinc-800 pb-6 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-600/20 border border-blue-500 rounded flex items-center justify-center">
                            <ServerIcon className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Eurodemux Core <span className="text-blue-500 text-xs align-top">[A0]</span></h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em] pl-1">
                            Infrastructure Layer 2026 // Stack-4 Configuration // 6.9ms Stride
                        </p>
                        <button 
                            onClick={() => setIsAnalysisOpen(true)}
                            className="flex items-center gap-1 text-[9px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase py-0.5 px-2 bg-blue-500/10 border border-blue-500/20 rounded"
                        >
                            <FileIcon className="w-3 h-3" />
                            Technical Specs
                        </button>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[9px] font-black text-zinc-600 uppercase block mb-1">Node Location</span>
                    <span className="text-xs font-black text-blue-500 uppercase tracking-widest bg-blue-900/10 px-3 py-1 border border-blue-900/30 rounded">Shreveport_Sovereign_Lab</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 overflow-hidden">
                {/* Hardware Stack */}
                <div className="flex flex-col gap-4 overflow-hidden col-span-1 border-r border-zinc-900/50 pr-4">
                    <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                        <TerminalIcon className="w-4 h-4 text-amber-500" />
                        Hardware Stack Ledger
                    </h2>
                    <div className="flex-1 overflow-auto space-y-3 pr-2 custom-scrollbar">
                        {hardwareStack.map((node, i) => (
                            <motion.div 
                                key={node.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 bg-zinc-900/20 border border-zinc-800 rounded group hover:border-blue-500/50 transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500 font-black">{node.type}</span>
                                        <span className="text-[11px] font-black text-white uppercase">{node.id}</span>
                                    </div>
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded ${
                                        node.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-500' :
                                        node.status === 'SYNCING' ? 'bg-blue-500/10 text-blue-500 animate-pulse' : 
                                        node.status === 'CONNECTION_LOST' ? 'bg-red-500/10 text-red-500' :
                                        'bg-amber-500/10 text-amber-500'
                                    }`}>
                                        {node.status}
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-600 mb-3">{node.model}</p>
                                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-blue-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${node.load}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[7px] text-zinc-700 font-black uppercase">System Load</span>
                                    <span className="text-[7px] text-zinc-400 font-black">{node.load}%</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Logic Verification */}
                <div className="flex flex-col gap-4 overflow-hidden border-r border-zinc-900/50 px-4">
                    <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                        <ShieldIcon className="w-4 h-4 text-blue-500" />
                        verifyFootstep Protocol
                    </h2>
                    <div className="flex-1 flex flex-col bg-black/40 rounded border border-zinc-800 p-6 overflow-hidden">
                        <div className="mb-6">
                            <p className="text-[10px] text-zinc-500 font-black uppercase mb-4 leading-relaxed">
                                Validating structural layer mapping via Flat Stacking logic. Enforcing zero-width lookahead assertion isolation.
                            </p>
                            <TopographyDisplay />
                        </div>

                        <LogViewer logs={verificationLog} isVerifying={isVerifying} />

                        <button 
                            onClick={handleRunVerification}
                            disabled={isVerifying}
                            className={`w-full py-4 rounded font-black uppercase tracking-widest transition-all ${
                                isVerifying ? 'bg-zinc-800 text-zinc-600 border border-zinc-700' : 'bg-blue-600 text-white border border-blue-500 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                            }`}
                        >
                            {isVerifying ? 'Verifying Node Integrity...' : 'Execute Pulse Protocol'}
                        </button>
                    </div>
                </div>

                {/* Node Sync Telemetry */}
                <div className="flex flex-col gap-4 overflow-hidden">
                    <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                        <ActivityIcon className="w-4 h-4 text-emerald-500" />
                        Full Node Synchronization
                    </h2>
                    <div className="space-y-4 pr-2">
                        <div className="p-5 bg-zinc-900/30 border border-zinc-800 rounded relative group">
                            <div className="absolute left-0 top-0 h-full w-1 bg-amber-500" />
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-black text-white tracking-widest uppercase">Bitcoin Node</span>
                                <span className="text-[9px] font-black text-emerald-500 flex items-center gap-1">
                                    <CheckIcon className="w-3 h-3" />
                                    SYNCED
                                </span>
                            </div>
                            <div className="space-y-2 text-[9px] font-black text-zinc-600 uppercase">
                                <div className="flex justify-between">
                                    <span>Height</span>
                                    <span className="text-white">844,219</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Peers</span>
                                    <span className="text-white">128 Active</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Memory Pool</span>
                                    <span className="text-amber-500">421,082 TX</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-zinc-900/30 border border-zinc-800 rounded relative group">
                            <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-black text-white tracking-widest uppercase">Monero Node</span>
                                <span className="text-[9px] font-black text-amber-500 flex items-center gap-1">
                                    <ActivityIcon className="w-3 h-3 animate-spin" />
                                    SYNCING (99.2%)
                                </span>
                            </div>
                            <div className="space-y-2 text-[9px] font-black text-zinc-600 uppercase">
                                <div className="flex justify-between">
                                    <span>Height</span>
                                    <span className="text-white">3,124,551</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>P2P Protocol</span>
                                    <span className="text-white">v12.2_Lattice</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Ledger Integrity</span>
                                    <span className="text-emerald-500">VALIDATED</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-blue-950/10 border border-blue-900/20 rounded flex flex-col items-center justify-center text-center mt-6">
                            <LockIcon className="w-8 h-8 text-blue-900 mb-3" />
                            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 font-mono">1Password SRP Gateway</h4>
                            <p className="text-[8px] text-zinc-600 font-bold uppercase max-w-[200px]">
                                Secure Remote Password endpoint mapped to local hardware interlock.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quantum Interlock Metrics (Added for 4th Col) */}
                <div className="flex flex-col gap-4 overflow-hidden border-l border-zinc-900 pl-4">
                    <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                        <ZapIcon className="w-4 h-4 text-cyan-500" />
                        Conjunction Drift Ledger
                    </h2>
                    <div className="flex-1 space-y-3">
                        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded">
                            <span className="text-[8px] text-zinc-600 font-bold uppercase block mb-1">Aether Pulse Velocity</span>
                            <div className="flex justify-between items-end">
                                <span className="text-xl font-black text-white">69.42 <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">hz</span></span>
                                <span className="text-[9px] text-emerald-500 font-black">+0.07%</span>
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded">
                            <span className="text-[8px] text-zinc-600 font-bold uppercase block mb-1">Thermal Resistance (Vector: JESUS)</span>
                            <div className="flex justify-between items-end">
                                <span className="text-xl font-black text-white">6.9 <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">THM</span></span>
                                <span className="text-[9px] text-blue-500 font-black">STABLE</span>
                            </div>
                        </div>

                        <div className="mt-4 p-4 border border-zinc-800 rounded bg-red-950/5">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldIcon className="w-3 h-3 text-red-500" />
                                <span className="text-[9px] font-black text-red-500 uppercase italic">Fracture Point Prediction</span>
                            </div>
                            <p className="text-[8px] text-zinc-500 leading-tight">
                                Current lattice alignment suggests 0.069 probability of semantic drift in next 4 cycles.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

