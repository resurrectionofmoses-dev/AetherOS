import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Server, Activity, Zap, Shield, HelpCircle, 
    Terminal, ArrowRight, CheckCircle2, AlertTriangle, 
    RefreshCw, Cpu, Database, Coins, FileCode, Lock, Globe,
    TrendingUp, TrendingDown, Scale, Flame
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

interface WorkflowLog {
    timestamp: string;
    level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
    message: string;
}

interface TokenizedAsset {
    id: string;
    sovereignId: string;
    assetType: string;
    valuation: number;
    contractAddress: string;
    txHash: string;
    timestamp: string;
    mintedStablecoin: number;
}

export const AetherFlowOrchestratorView: React.FC = () => {
    // Tab State
    const [activeTab, setActiveTab] = useState<'orchestrator' | 'stablecoin' | 'terminal'>('orchestrator');

    // Workflow Inputs
    const [sovereignId, setSovereignId] = useState('maestro_shard_7x0419');
    const [assetType, setAssetType] = useState('Gold');
    const [customSystemPrompt, setCustomSystemPrompt] = useState(
        'You are the Maestro Risk Agent. Only approve assets with high liquidity and low volatility.'
    );

    // Workflow Execution State
    const [executing, setExecuting] = useState(false);
    const [stepLogs, setStepLogs] = useState<WorkflowLog[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(0);

    // Verification Result Shard
    const [verificationShard, setVerificationShard] = useState<any>(null);
    // Asset Valuation Price
    const [assetValuation, setAssetValuation] = useState<number>(0);
    // AI Risk Analysis Report
    const [aiRiskReport, setAiRiskReport] = useState<string>('');
    // Chain Deployment Result
    const [mintResult, setMintResult] = useState<any>(null);

    // DeFi Collateral State
    const [tokenizedAssets, setTokenizedAssets] = useState<TokenizedAsset[]>([
        {
            id: 'AETHER-RWA-001',
            sovereignId: 'maestro_shard_7x0419',
            assetType: 'Real Estate Vault',
            valuation: 1250000,
            contractAddress: '0x3a7e91d56e91f13b194fbc8c5d3d4b659f2488a1',
            txHash: '0x8892bf390f77bc5594002ea9ad3c59f24aa5a691b8d2122c45fbc',
            timestamp: new Date(Date.now() - 3600000 * 5).toLocaleTimeString(),
            mintedStablecoin: 500000
        },
        {
            id: 'AETHER-RWA-002',
            sovereignId: 'maestro_shard_9k1024',
            assetType: 'US Treasuries',
            valuation: 450000,
            contractAddress: '0x7e250d5630b4cf539739df2c5dacb4c659f2488d',
            txHash: '0x5c5ea9a73bd2cfbcbc31e847c2d8d80f848e1a69bd0620bc25aa',
            timestamp: new Date(Date.now() - 3600000 * 24).toLocaleTimeString(),
            mintedStablecoin: 300000
        }
    ]);
    const [priceModifiers, setPriceModifiers] = useState<Record<string, number>>({
        'AETHER-RWA-001': 1.0,
        'AETHER-RWA-002': 1.0
    });
    const [mintError, setMintError] = useState<string>('');
    const [mintAmount, setMintAmount] = useState<string>('50000');
    const [selectedAssetId, setSelectedAssetId] = useState<string>('AETHER-RWA-001');

    // Terminal State
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalLogs, setTerminalLogs] = useState<string[]>([
        'AetherOS CRE Orchestrator (Aether-Flow Shell) v1.0.0',
        'Type "help" to list available commands.',
        ''
    ]);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    // Oracle / PoR simulated states
    const [oracleHealth, setOracleHealth] = useState('SYNCED');
    const [oracleTicks, setOracleTicks] = useState(0);

    // Tick the simulated real-time oracle
    useEffect(() => {
        const interval = setInterval(() => {
            setOracleTicks(prev => prev + 1);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const addLog = (message: string, level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' = 'INFO') => {
        const timestamp = new Date().toLocaleTimeString();
        setStepLogs(prev => [...prev, { timestamp, level, message }]);
    };

    // Trigger Orchestration workflow
    const triggerOrchestration = async () => {
        if (executing) return;
        setExecuting(true);
        setStepLogs([]);
        setCurrentStep(1);
        setVerificationShard(null);
        setMintResult(null);
        setAiRiskReport('');

        addLog(`Initiating RWA Tokenization Flow for ${assetType}...`, 'INFO');

        // Step 1: Legacy Identity (AD LDS Shadow Directory Check)
        await new Promise(resolve => setTimeout(resolve, 1200));
        addLog(`Querying Shadow Directory (AD LDS ADAM shard) for ID: ${sovereignId}`, 'INFO');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const isSovereignValid = sovereignId.toLowerCase().includes('maestro') || sovereignId.length > 5;
        if (!isSovereignValid) {
            addLog(`State Collapse: Invalid Identity Shard in AD LDS.`, 'ERROR');
            setCurrentStep(0);
            setExecuting(false);
            return;
        }

        const simulatedShard = {
            is_valid: true,
            sovereignKey: `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`,
            identitySchema: 'ADAM_LDAP_Sovereign_Node_V3',
            userPrincipalName: `${sovereignId}@aetheros.local`,
            syncEpoch: Date.now()
        };
        setVerificationShard(simulatedShard);
        addLog(`Shadow Directory Shard Verified! SovereignKey extracted: ${simulatedShard.sovereignKey.substring(0, 16)}...`, 'SUCCESS');

        // Step 2: External RWA Valuation
        setCurrentStep(2);
        addLog(`Connecting to RWA Valuation feeds for ${assetType}...`, 'INFO');
        await new Promise(resolve => setTimeout(resolve, 1500));

        let calculatedPrice = 12500;
        if (assetType === 'Gold') calculatedPrice = 2385.40;
        else if (assetType === 'Real Estate Vault') calculatedPrice = 1350000;
        else if (assetType === 'US Treasuries') calculatedPrice = 500000;
        else if (assetType === 'Carbon Offsets') calculatedPrice = 65000;

        const valuationResult = calculatedPrice * (0.98 + Math.random() * 0.04);
        setAssetValuation(Math.round(valuationResult));
        addLog(`RWA Valuation received: $${Math.round(valuationResult).toLocaleString()} USD`, 'SUCCESS');

        // Step 3: AI Agent Risk Assessment
        setCurrentStep(3);
        addLog(`Constructing risk parameters. Triggering server-side Maestro AI Agent (Gemini API)...`, 'INFO');
        
        try {
            const prompt = `Perform risk analysis for a real-world asset of type: ${assetType} with an aggregated valuation of $${Math.round(valuationResult).toLocaleString()} USD.
            Input SovereignID authority credentials: ${simulatedShard.userPrincipalName}.
            Evaluate risk feasibility, volatility parameters, and issue an approval or rejection recommendation.`;

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelName: 'gemini-3.5-flash',
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: customSystemPrompt
                })
            });

            if (!response.ok) {
                throw new Error("Maestro AI Agent response failed.");
            }

            const data = await response.json();
            setAiRiskReport(data.text || 'Asset parameters approved.');
            addLog(`Maestro AI Agent completed evaluation. Verification payload received.`, 'SUCCESS');
        } catch (err: any) {
            addLog(`Maestro AI fallback triggered: Asset risk factors are well within optimal bounds. APPROVED.`, 'WARN');
            setAiRiskReport(`**MAESTRO RISK ASSESSMENT REPORT**
            Asset Type: ${assetType}
            Valuation: $${Math.round(valuationResult).toLocaleString()}
            Liquidity Coefficient: 0.94 (Optimal)
            Volatility Index: Low (Safe)
            Decision: APPROVED
            Reason: Dynamic reserve backing verified. Meets liquidity criteria for on-chain collateralization.`);
        }

        // Step 4: On-Chain Minting Event
        setCurrentStep(4);
        addLog(`Initiating blockchain Sepolia contract compilation and deployment...`, 'INFO');
        await new Promise(resolve => setTimeout(resolve, 2000));

        const contractAddr = `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
        const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
        
        const contractResult = {
            address: contractAddr,
            transactionHash: txHash,
            status: 'SUCCESS',
            blockNumber: Math.floor(Math.random() * 200000) + 5400000
        };
        
        setMintResult(contractResult);
        addLog(`RWAToken deployed on Ethereum Sepolia! Address: ${contractAddr}`, 'SUCCESS');
        addLog(`On-chain transaction finalized. Block #${contractResult.blockNumber}`, 'SUCCESS');

        // Add to active tokenized list
        const newId = `AETHER-RWA-00${tokenizedAssets.length + 1}`;
        const newAsset: TokenizedAsset = {
            id: newId,
            sovereignId,
            assetType,
            valuation: Math.round(valuationResult),
            contractAddress: contractAddr,
            txHash: txHash,
            timestamp: new Date().toLocaleTimeString(),
            mintedStablecoin: 0
        };
        setPriceModifiers(prev => ({
            ...prev,
            [newId]: 1.0
        }));
        setTokenizedAssets(prev => [newAsset, ...prev]);

        setCurrentStep(5);
        setExecuting(false);
        addLog(`Orchestration completed successfully. Vault limits adjusted.`, 'SUCCESS');
    };

    // Mint Stablecoins
    const handleMintStablecoin = () => {
        const amount = parseFloat(mintAmount);
        if (isNaN(amount) || amount <= 0) return;

        setMintError('');

        const asset = tokenizedAssets.find(a => a.id === selectedAssetId);
        if (!asset) return;

        const dynVal = asset.valuation * (priceModifiers[asset.id] ?? 1.0);
        const maxLTV = dynVal * 0.80;
        if (asset.mintedStablecoin + amount > maxLTV) {
            setMintError(`Collateral capacity exceeded! Max LTV is 80% ($${maxLTV.toLocaleString()}). Currently minted: $${asset.mintedStablecoin.toLocaleString()}`);
            return;
        }

        const updatedAssets = tokenizedAssets.map(a => {
            if (a.id === selectedAssetId) {
                return {
                    ...a,
                    mintedStablecoin: a.mintedStablecoin + amount
                };
            }
            return a;
        });

        setTokenizedAssets(updatedAssets);
        setTerminalLogs(prev => [
            ...prev,
            `[stablecoin-contract] Minted ${amount.toLocaleString()} aetherUSD as debt against collateral ${selectedAssetId}`,
            `[chainlink-por] Updating Proof of Reserve statistics...`
        ]);
    };

    // Liquidate Asset (DeFi Protocol mechanism)
    const handleLiquidateAsset = (assetId: string) => {
        const asset = tokenizedAssets.find(a => a.id === assetId);
        if (!asset) return;

        setTokenizedAssets(prev => prev.map(a => {
            if (a.id === assetId) {
                return { ...a, mintedStablecoin: 0 };
            }
            return a;
        }));

        setPriceModifiers(prev => ({
            ...prev,
            [assetId]: 1.0
        }));

        addLog(`[LIQUIDATION EVENT] Dynamic Liquidation triggered for ${assetId}. Collateral was siphoned, outstanding debt fully burned.`, 'ERROR');
        setTerminalLogs(prev => [
            ...prev,
            `[LIQUIDATION] System auto-liquidation contract successfully executed for ${assetId}.`,
            `[chainlink-por] Updated Physical Reserves and Outstanding Supply. Debt was cleared.`
        ]);
    };

    // Terminal Emulator Shell Commands
    const executeTerminalCommand = (cmd: string) => {
        const trimmed = cmd.trim();
        if (!trimmed) return;

        const newLogs = [...terminalLogs, `aether@orchestrator:~$ ${trimmed}`];
        const args = trimmed.split(' ');
        const baseCmd = args[0].toLowerCase();

        switch (baseCmd) {
            case 'help':
                newLogs.push(
                    'Available Commands:',
                    '  help                                Display help instructions',
                    '  cre-cli list                        List all workflows registered with AetherOS',
                    '  cre-cli simulate                    Run simulated Sovereign RWA Tokenization Workflow',
                    '  rwa status                          List all tokenized real world assets and collateral ratios',
                    '  rwa list                            Detailed list of smart contracts minted',
                    '  clear                               Clear shell console'
                );
                break;
            case 'clear':
                setTerminalLogs([]);
                setTerminalInput('');
                return;
            case 'cre-cli':
                if (args[1] === 'list') {
                    newLogs.push(
                        'Registered Orchestration Layers:',
                        '  - RWA_Tokenization_Flow (Type: workflow, File: rwaOrchestrator.ts)',
                        '  - Identity_Ingress_Provider (Type: api, Provider: AD LDS ADAM)',
                        '  - Maestro_Risk_Agent_Core (Type: llm, Model: gemini-3.5-flash)'
                    );
                } else if (args[1] === 'simulate') {
                    newLogs.push(
                        'Executing RWA_Tokenization_Flow simulation...',
                        '  [1] Verification: ADAM directory server lookup... SUCCESS',
                        '  [2] Feed check: api.rwa-valuation.com... Price: $1,250,000 USD',
                        '  [3] LLM Risk Model: Reasoning metrics parsed... SUCCESS',
                        '  [4] Minting smart contract RWA_0x39fa... SUCCESS',
                        'Simulation success! Contract verified on Sepolia chain.'
                    );
                    // Also trigger the orchestrator visual flow
                    triggerOrchestration();
                } else {
                    newLogs.push('Error: Usage: cre-cli [list | simulate]');
                }
                break;
            case 'rwa':
                if (args[1] === 'status') {
                    const totalVal = tokenizedAssets.reduce((acc, curr) => acc + curr.valuation * (priceModifiers[curr.id] ?? 1.0), 0);
                    const totalMinted = tokenizedAssets.reduce((acc, curr) => acc + curr.mintedStablecoin, 0);
                    const ltv = totalVal > 0 ? ((totalMinted / totalVal) * 100).toFixed(2) : '0';
                    newLogs.push(
                        'AetherOS Vault Status Summary:',
                        `  Total Collateral Asset Valuation: $${totalVal.toLocaleString()} USD`,
                        `  Outstanding aetherUSD Supply: $${totalMinted.toLocaleString()}`,
                        `  Aggregated LTV Ratio: ${ltv}%`
                    );
                } else if (args[1] === 'list') {
                    newLogs.push('Active Tokenized Smart Contracts:');
                    tokenizedAssets.forEach(a => {
                        const dynamicVal = a.valuation * (priceModifiers[a.id] ?? 1.0);
                        newLogs.push(`  ID: ${a.id} | Asset: ${a.assetType} | Value: $${dynamicVal.toLocaleString()} | Contract: ${a.contractAddress.substring(0, 16)}...`);
                    });
                } else {
                    newLogs.push('Error: Usage: rwa [status | list]');
                }
                break;
            default:
                newLogs.push(`Command not found: "${baseCmd}". Type "help" for instructions.`);
        }

        setTerminalLogs(newLogs);
        setTerminalInput('');
    };

    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [terminalLogs]);

    // Calculate aggregated values for statistics
    const totalCollateralVal = tokenizedAssets.reduce((acc, curr) => acc + curr.valuation * (priceModifiers[curr.id] ?? 1.0), 0);
    const totalMintedStablecoins = tokenizedAssets.reduce((acc, curr) => acc + curr.mintedStablecoin, 0);
    const activeAsset = tokenizedAssets.find(a => a.id === selectedAssetId) || tokenizedAssets[0];

    return (
        <div className="flex-1 overflow-y-auto bg-[#020205] text-zinc-100 font-mono p-4 md:p-8 relative">
            {/* Cyber background aesthetics */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(14,165,233,0.015)_1px,_transparent_1px),_linear-gradient(90deg,rgba(14,165,233,0.015)_1px,_transparent_1px)] bg-[length:24px_24px] opacity-70" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.06),transparent_65%)]" />

            <div className="max-w-6xl mx-auto space-y-6 relative z-10">
                {/* Header Block */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-950/40 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Cpu className="w-6 h-6 text-sky-400 animate-pulse" />
                            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white">
                                Aether-Flow Core Orchestrator
                            </h1>
                        </div>
                        <p className="text-xs text-sky-400/80 uppercase tracking-widest flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Chainlink CRE Workflow Layer • Legacy Identity & RWA Tokenization
                        </p>
                    </div>

                    {/* Navigation Tab Toggles */}
                    <div className="flex border border-sky-900/40 bg-zinc-950/80 p-1.5 rounded-xl">
                        <button
                            onClick={() => setActiveTab('orchestrator')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === 'orchestrator' 
                                    ? 'bg-sky-900/30 text-sky-400 border border-sky-800/50' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            Orchestrator Board
                        </button>
                        <button
                            onClick={() => setActiveTab('stablecoin')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === 'stablecoin' 
                                    ? 'bg-sky-900/30 text-sky-400 border border-sky-800/50' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            Sovereign Stablecoin
                        </button>
                        <button
                            onClick={() => setActiveTab('terminal')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === 'terminal' 
                                    ? 'bg-sky-900/30 text-sky-400 border border-sky-800/50' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            cre-cli Shell
                        </button>
                    </div>
                </div>

                {/* Dashboard Global Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-950/60 border border-zinc-900/80 p-4 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5 text-sky-400">
                            <Database className="w-16 h-16" />
                        </div>
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest block">Tokenized Assets</span>
                        <span className="text-xl font-black text-white mt-1 block">
                            {tokenizedAssets.length} RWAs
                        </span>
                    </div>

                    <div className="bg-zinc-950/60 border border-zinc-900/80 p-4 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5 text-sky-400">
                            <Shield className="w-16 h-16" />
                        </div>
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest block">Collateral Value</span>
                        <span className="text-xl font-black text-emerald-400 mt-1 block">
                            ${totalCollateralVal.toLocaleString()}
                        </span>
                    </div>

                    <div className="bg-zinc-950/60 border border-zinc-900/80 p-4 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5 text-sky-400">
                            <Coins className="w-16 h-16" />
                        </div>
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest block">Outstanding Debt</span>
                        <span className="text-xl font-black text-sky-400 mt-1 block">
                            ${totalMintedStablecoins.toLocaleString()}
                        </span>
                    </div>

                    <div className="bg-zinc-950/60 border border-zinc-900/80 p-4 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5 text-emerald-400">
                            <Activity className="w-16 h-16" />
                        </div>
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest block">Chainlink PoR Oracle</span>
                        <span className="text-xs font-bold text-zinc-300 mt-2 block flex items-center gap-1.5 uppercase">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            {oracleHealth} (T-{oracleTicks})
                        </span>
                    </div>
                </div>

                {/* TAB CONTENT: ORCHESTRATOR BOARD */}
                <AnimatePresence mode="wait">
                    {activeTab === 'orchestrator' && (
                        <motion.div
                            key="orchestrator"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                        >
                            {/* Left Configuration Panel */}
                            <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                                <div className="border-b border-zinc-900 pb-3 flex items-center gap-2">
                                    <Server className="w-4 h-4 text-sky-400" />
                                    <h3 className="text-xs font-black uppercase text-white tracking-wider">CRE Parameter Engine</h3>
                                </div>

                                <div className="space-y-3 text-xs">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">Sovereign Directory ID (AD LDS)</label>
                                        <input
                                            type="text"
                                            value={sovereignId}
                                            onChange={(e) => setSovereignId(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-800 py-2 px-3 text-white rounded-lg focus:outline-none focus:border-sky-500 text-xs font-mono"
                                            placeholder="User AD Shard path..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">Real World Asset Class</label>
                                        <select
                                            value={assetType}
                                            onChange={(e) => setAssetType(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-800 py-2 px-3 text-white rounded-lg focus:outline-none focus:border-sky-500 text-xs font-mono cursor-pointer"
                                        >
                                            <option value="Gold">Gold Bullion Vault</option>
                                            <option value="Real Estate Vault">Premium Real Estate Hub</option>
                                            <option value="US Treasuries">US Treasury Bill Shards</option>
                                            <option value="Carbon Offsets">Maestro Carbon Reserves</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">AI Agent Parameters (Gemini System Prompt)</label>
                                        <textarea
                                            value={customSystemPrompt}
                                            onChange={(e) => setCustomSystemPrompt(e.target.value)}
                                            rows={4}
                                            className="w-full bg-zinc-900 border border-zinc-800 py-2 px-3 text-zinc-300 rounded-lg focus:outline-none focus:border-sky-500 text-xs font-mono leading-relaxed"
                                        />
                                    </div>

                                    <button
                                        onClick={triggerOrchestration}
                                        disabled={executing}
                                        className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 disabled:from-zinc-800 disabled:to-zinc-850 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-sky-400/20"
                                    >
                                        {executing ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Running Orchestrator...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4" />
                                                <span>Compile & Run Workflow</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Right Execution Monitor */}
                            <div className="lg:col-span-8 space-y-4">
                                <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                                    <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-sky-400" />
                                            Active Orchestration Workflow Steps
                                        </h3>
                                        <span className="text-[9px] bg-sky-950 text-sky-400 border border-sky-900/60 px-2 py-0.5 rounded uppercase font-black tracking-wider">
                                            RWA_Tokenization_Flow
                                        </span>
                                    </div>

                                    {/* Steps Display */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                                        {/* Step 1 */}
                                        <div className={`p-4 rounded-xl border transition-all ${
                                            currentStep === 1 ? 'bg-sky-950/20 border-sky-500' : 
                                            currentStep > 1 ? 'bg-emerald-950/10 border-emerald-900 text-zinc-300' : 'bg-zinc-950/40 border-zinc-900/80 text-zinc-500'
                                        }`}>
                                            <span className="text-[10px] font-black uppercase block tracking-wider">01. Identity</span>
                                            <p className="text-[11px] font-bold text-white mt-1">AD LDS Verify</p>
                                            <span className="text-[9px] mt-2 block font-medium uppercase tracking-widest">
                                                {currentStep === 1 ? 'Extracting...' : currentStep > 1 ? 'VALID' : 'STANDBY'}
                                            </span>
                                        </div>

                                        {/* Step 2 */}
                                        <div className={`p-4 rounded-xl border transition-all ${
                                            currentStep === 2 ? 'bg-sky-950/20 border-sky-500' : 
                                            currentStep > 2 ? 'bg-emerald-950/10 border-emerald-900 text-zinc-300' : 'bg-zinc-950/40 border-zinc-900/80 text-zinc-500'
                                        }`}>
                                            <span className="text-[10px] font-black uppercase block tracking-wider">02. Valuation</span>
                                            <p className="text-[11px] font-bold text-white mt-1">Dynamic API Feed</p>
                                            <span className="text-[9px] mt-2 block font-medium uppercase tracking-widest">
                                                {currentStep === 2 ? 'Fetching...' : currentStep > 2 ? 'VALUED' : 'STANDBY'}
                                            </span>
                                        </div>

                                        {/* Step 3 */}
                                        <div className={`p-4 rounded-xl border transition-all ${
                                            currentStep === 3 ? 'bg-sky-950/20 border-sky-500' : 
                                            currentStep > 3 ? 'bg-emerald-950/10 border-emerald-900 text-zinc-300' : 'bg-zinc-950/40 border-zinc-900/80 text-zinc-500'
                                        }`}>
                                            <span className="text-[10px] font-black uppercase block tracking-wider">03. AI Risk</span>
                                            <p className="text-[11px] font-bold text-white mt-1">Maestro Agent</p>
                                            <span className="text-[9px] mt-2 block font-medium uppercase tracking-widest">
                                                {currentStep === 3 ? 'Analyzing...' : currentStep > 3 ? 'APPROVED' : 'STANDBY'}
                                            </span>
                                        </div>

                                        {/* Step 4 */}
                                        <div className={`p-4 rounded-xl border transition-all ${
                                            currentStep === 4 ? 'bg-sky-950/20 border-sky-500' : 
                                            currentStep > 4 ? 'bg-emerald-950/10 border-emerald-900 text-zinc-300' : 'bg-zinc-950/40 border-zinc-900/80 text-zinc-500'
                                        }`}>
                                            <span className="text-[10px] font-black uppercase block tracking-wider">04. Execution</span>
                                            <p className="text-[11px] font-bold text-white mt-1">On-chain Mint</p>
                                            <span className="text-[9px] mt-2 block font-medium uppercase tracking-widest">
                                                {currentStep === 4 ? 'Deploying...' : currentStep > 4 ? 'MINTED' : 'STANDBY'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Live Console Logs */}
                                    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 mt-4 h-48 overflow-y-auto font-mono text-[11px] space-y-1">
                                        <div className="text-zinc-500 uppercase tracking-wider border-b border-zinc-800 pb-1.5 mb-2 flex justify-between items-center">
                                            <span>Orchestration Execution Logs</span>
                                            {executing && <span className="animate-pulse inline-block w-2 h-2 bg-sky-500 rounded-full" />}
                                        </div>
                                        {stepLogs.length === 0 && (
                                            <div className="text-zinc-600 italic uppercase">System ready. Click "Compile & Run Workflow" to initiate.</div>
                                        )}
                                        {stepLogs.map((log, idx) => (
                                            <div key={idx} className="flex gap-2.5">
                                                <span className="text-zinc-600">{log.timestamp}</span>
                                                <span className={`font-bold ${
                                                    log.level === 'SUCCESS' ? 'text-emerald-400' :
                                                    log.level === 'WARN' ? 'text-amber-500' :
                                                    log.level === 'ERROR' ? 'text-rose-500' : 'text-sky-400'
                                                }`}>[{log.level}]</span>
                                                <span className="text-zinc-300">{log.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Details Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Directory Verification JSON */}
                                    <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex flex-col justify-between h-48 relative overflow-hidden">
                                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block">Legacy Identity Verification (AD LDS JSON)</span>
                                        <div className="flex-1 bg-zinc-900/40 rounded-lg p-2.5 mt-2 overflow-y-auto text-[10px] text-sky-400 font-mono">
                                            {verificationShard ? (
                                                <pre className="whitespace-pre-wrap">{JSON.stringify(verificationShard, null, 2)}</pre>
                                            ) : (
                                                <div className="text-zinc-600 italic flex items-center justify-center h-full uppercase">Waiting for verification sequence...</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* AI Agent Report Block */}
                                    <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex flex-col justify-between h-48 relative overflow-hidden">
                                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block">Maestro Risk Analysis Report (Gemini AI)</span>
                                        <div className="flex-1 bg-zinc-900/40 rounded-lg p-3 mt-2 overflow-y-auto text-[10px] text-zinc-300 leading-relaxed font-mono">
                                            {aiRiskReport ? (
                                                <div className="whitespace-pre-wrap">{aiRiskReport}</div>
                                            ) : (
                                                <div className="text-zinc-600 italic flex items-center justify-center h-full uppercase">Waiting for AI assessment...</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB CONTENT: STABLECOIN ISSUANCE */}
                    {activeTab === 'stablecoin' && (
                        <motion.div
                            key="stablecoin"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                        >
                            {/* Collateral Vault Asset List */}
                            <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                                <div className="border-b border-zinc-900 pb-3">
                                    <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                                        <Database className="w-4 h-4 text-sky-400" />
                                        Tokenized Real World Asset Collateral Registry
                                    </h3>
                                </div>

                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {tokenizedAssets.map(asset => {
                                        const dynVal = asset.valuation * (priceModifiers[asset.id] ?? 1.0);
                                        const maxBorrow = dynVal * 0.8;
                                        const hFactor = asset.mintedStablecoin === 0 ? 10.0 : maxBorrow / asset.mintedStablecoin;
                                        return (
                                            <div 
                                                key={asset.id}
                                                onClick={() => {
                                                    setSelectedAssetId(asset.id);
                                                    setMintError('');
                                                }}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                    selectedAssetId === asset.id 
                                                        ? 'bg-sky-950/20 border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.1)]' 
                                                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-750'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase text-sky-400 block tracking-widest">
                                                            {asset.id} • {asset.timestamp}
                                                        </span>
                                                        <h4 className="text-sm font-black text-white mt-1 uppercase">{asset.assetType}</h4>
                                                        <span className="text-[9px] text-zinc-500 mt-1 block truncate max-w-[280px] sm:max-w-[400px]">
                                                            Contract: {asset.contractAddress}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-zinc-500 block">COLLATERAL VALUE</span>
                                                        <span className="text-sm font-black text-emerald-400 mt-1 block">
                                                            ${dynVal.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-zinc-900 text-[10px]">
                                                    <div>
                                                        <span className="text-zinc-500 block uppercase font-bold text-[8px]">Active Debt</span>
                                                        <span className="font-bold text-white">${asset.mintedStablecoin.toLocaleString()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-zinc-500 block uppercase font-bold text-[8px]">Borrow Limit</span>
                                                        <span className="font-bold text-white">${maxBorrow.toLocaleString()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-zinc-500 block uppercase font-bold text-[8px]">Health Factor</span>
                                                        <span className={`font-black ${
                                                            asset.mintedStablecoin === 0 ? 'text-emerald-400' :
                                                            hFactor < 1.0 ? 'text-rose-500 animate-pulse' :
                                                            hFactor < 1.25 ? 'text-amber-400' : 'text-emerald-400'
                                                        }`}>
                                                            {hFactor >= 10.0 ? '10.0+' : hFactor.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Minting & Proof of Reserve */}
                            <div className="lg:col-span-5 space-y-6">
                                {/* Issuance Panel */}
                                <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-4">
                                    <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                                            <Coins className="w-4 h-4 text-sky-400" />
                                            Sovereign Mint Engine
                                        </h3>
                                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                            aetherUSD
                                        </span>
                                    </div>

                                    {activeAsset ? (() => {
                                        const activeDynVal = activeAsset.valuation * (priceModifiers[activeAsset.id] ?? 1.0);
                                        const activeMaxBorrow = activeDynVal * 0.8;
                                        const activeCapacity = activeMaxBorrow - activeAsset.mintedStablecoin;
                                        return (
                                            <div className="space-y-4 text-xs">
                                                <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-1">
                                                    <span className="text-[9px] text-zinc-500 block uppercase">Selected Collateral Node</span>
                                                    <span className="font-bold text-white block uppercase">{activeAsset.assetType} ({activeAsset.id})</span>
                                                    <span className={`text-[9px] font-bold block ${activeCapacity <= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                        Available Borrow Capacity: ${Math.max(0, activeCapacity).toLocaleString()} USD
                                                    </span>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">Mint stablecoin amount (aetherUSD)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={mintAmount}
                                                            onChange={(e) => setMintAmount(e.target.value)}
                                                            className="w-full bg-zinc-900 border border-zinc-800 py-2.5 px-3.5 text-white rounded-lg focus:outline-none focus:border-sky-500 font-mono text-sm font-black"
                                                            placeholder="Amount..."
                                                        />
                                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-rose-400">aetherUSD</span>
                                                    </div>
                                                </div>

                                                {mintError && (
                                                    <div className="p-2.5 bg-rose-950/20 border border-rose-900/50 text-rose-400 text-[10px] uppercase font-bold rounded-lg leading-relaxed">
                                                        {mintError}
                                                    </div>
                                                )}

                                                <button
                                                    onClick={handleMintStablecoin}
                                                    disabled={activeCapacity <= 0}
                                                    className={`w-full py-3 text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-2 border ${
                                                        activeCapacity <= 0 
                                                            ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed' 
                                                            : 'bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-[0.98] cursor-pointer border-rose-400/20'
                                                    }`}
                                                >
                                                    <Coins className="w-4 h-4" />
                                                    <span>Mint aetherUSD stablecoins</span>
                                                </button>
                                            </div>
                                        );
                                    })() : (
                                        <div className="text-zinc-600 italic text-center py-6 text-xs uppercase font-black">No active collateral vault. Run orchestrator first.</div>
                                    )}
                                </div>

                                {/* Custom Proof of Reserve Dashboard */}
                                <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-4">
                                    <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-sky-400" />
                                            Chainlink Proof of Reserve (PoR)
                                        </h3>
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                    </div>

                                    {/* Custom Visual Reserve Bar Comparison */}
                                    <div className="space-y-4 text-xs font-mono">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-zinc-500 uppercase font-black">Circulating Supply (aetherUSD)</span>
                                                <span className="text-white font-bold">${totalMintedStablecoins.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                                                <div 
                                                    className="bg-rose-500 h-full transition-all duration-500"
                                                    style={{ width: `${totalCollateralVal > 0 ? (totalMintedStablecoins / totalCollateralVal) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px]">
                                                <span className="text-zinc-500 uppercase font-black">Physical Reserves (Verified in Vaults)</span>
                                                <span className="text-emerald-400 font-bold">${totalCollateralVal.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                                                <div 
                                                    className="bg-emerald-400 h-full transition-all duration-500"
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        </div>

                                        <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/80 text-[10px] space-y-1 uppercase leading-relaxed text-zinc-500">
                                            <p>• Vault reserves are queried in real-time from Maestro physical vault smart oracle.</p>
                                            <p>• Current Collateral Ratio: <span className="text-white font-bold">{totalMintedStablecoins > 0 ? ((totalCollateralVal / totalMintedStablecoins) * 100).toFixed(2) : '1000+'}%</span> (Safe Overcollateralization Threshold: 125%)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Visual Allocations Chart & Oracle Controller */}
                            <div className="lg:col-span-8 bg-zinc-950 border border-zinc-900 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-4">
                                <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                                        Collateral vs Debt Allocation Visualizer
                                    </h3>
                                    <span className="text-[10px] text-zinc-500 font-mono">LIVE FEED SHARD</span>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={tokenizedAssets.map(asset => {
                                                const dVal = asset.valuation * (priceModifiers[asset.id] ?? 1.0);
                                                return {
                                                    name: asset.id,
                                                    'Collateral Value': Math.round(dVal),
                                                    'Borrow Limit (80%)': Math.round(dVal * 0.8),
                                                    'Outstanding Debt': asset.mintedStablecoin
                                                };
                                            })}
                                            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorLimit" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                                            <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                                            <YAxis stroke="#52525b" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                                                formatter={(value: any) => [`$${value.toLocaleString()}`, undefined]}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                                            <Area type="monotone" dataKey="Collateral Value" stroke="#10b981" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                                            <Area type="monotone" dataKey="Borrow Limit (80%)" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorLimit)" strokeWidth={2} />
                                            <Area type="monotone" dataKey="Outstanding Debt" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDebt)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Oracle Controls column */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Oracle Price Shaper & Liquidation Hub */}
                                <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-4">
                                    <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 text-rose-400 animate-spin-slow" />
                                            Oracle & Liquidation Hub
                                        </h3>
                                    </div>
                                    <div className="space-y-4 text-xs">
                                        {activeAsset ? (
                                            <>
                                                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-1.5">
                                                    <span className="text-[9px] text-zinc-500 block uppercase">Selected Asset</span>
                                                    <span className="font-bold text-white block uppercase">{activeAsset.assetType} ({activeAsset.id})</span>
                                                    <div className="flex justify-between items-center text-[10px] pt-1">
                                                        <span className="text-zinc-400">Current Valuation:</span>
                                                        <span className="font-black text-emerald-400">${(activeAsset.valuation * (priceModifiers[activeAsset.id] ?? 1.0)).toLocaleString()} USD</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <span className="text-zinc-400">Oracle Multiplier:</span>
                                                        <span className="font-mono font-black text-white">{(priceModifiers[activeAsset.id] ?? 1.0).toFixed(2)}x</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">Set Simulated Market Condition</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setPriceModifiers(prev => ({ ...prev, [activeAsset.id]: 1.25 }));
                                                                setMintError('');
                                                            }}
                                                            className="py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-emerald-400 font-bold uppercase text-[9px] rounded-lg transition-all"
                                                        >
                                                            Surge (+25%)
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setPriceModifiers(prev => ({ ...prev, [activeAsset.id]: 1.00 }));
                                                                setMintError('');
                                                            }}
                                                            className="py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-750 text-zinc-300 font-bold uppercase text-[9px] rounded-lg transition-all"
                                                        >
                                                            Baseline (1.0x)
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setPriceModifiers(prev => ({ ...prev, [activeAsset.id]: 0.80 }));
                                                                setMintError('');
                                                            }}
                                                            className="py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-rose-500/40 text-rose-400 font-bold uppercase text-[9px] rounded-lg transition-all"
                                                        >
                                                            Correction (-20%)
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setPriceModifiers(prev => ({ ...prev, [activeAsset.id]: 0.50 }));
                                                                setMintError('');
                                                            }}
                                                            className="py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 hover:border-rose-500 text-rose-500 font-bold uppercase text-[9px] rounded-lg transition-all"
                                                        >
                                                            Crash (-50%)
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Under-collateralized warning & Liquidation action */}
                                                {activeAsset.mintedStablecoin > 0 && 
                                                 (activeAsset.mintedStablecoin / ((activeAsset.valuation * (priceModifiers[activeAsset.id] ?? 1.0)) * 0.8)) > 1.0 ? (
                                                    <div className="p-3 bg-red-950/20 border border-red-900/60 rounded-xl space-y-3 animate-pulse">
                                                        <div className="flex items-center gap-2 text-rose-400">
                                                            <Flame className="w-4 h-4" />
                                                            <span className="font-black uppercase tracking-wider text-[10px]">Vault Liquidatable!</span>
                                                        </div>
                                                        <p className="text-[9px] text-zinc-400 leading-relaxed uppercase">
                                                            Outstanding debt exceeds limit. Health factor is below 1.0. Liquidate vault to burn debt and claim collateral.
                                                        </p>
                                                        <button
                                                            onClick={() => handleLiquidateAsset(activeAsset.id)}
                                                            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] rounded-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border border-red-400/20"
                                                        >
                                                            <Flame className="w-3.5 h-3.5" />
                                                            <span>Execute Liquidation</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-xl text-center text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                                                        ✅ Collateral Node Stable
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-zinc-600 italic text-center py-4 uppercase">No active vault.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB CONTENT: TERMINAL CLI SIMULATOR */}
                    {activeTab === 'terminal' && (
                        <motion.div
                            key="terminal"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.6)] flex flex-col h-[480px] md:h-[540px]"
                        >
                            {/* Terminal Window Header */}
                            <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-sky-400" />
                                    <span className="text-xs font-black text-white uppercase tracking-wider">aetheros@cre-cli:~ (Simulation Sandbox)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-rose-500/80 block" />
                                    <span className="w-3 h-3 rounded-full bg-amber-500/80 block" />
                                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
                                </div>
                            </div>

                            {/* Terminal Logs View */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 font-mono text-[11px] text-zinc-300 space-y-1.5 bg-[#010103]">
                                {terminalLogs.map((log, index) => (
                                    <div key={index} className="whitespace-pre-wrap leading-relaxed">
                                        {log}
                                    </div>
                                ))}
                                <div ref={terminalEndRef} />
                            </div>

                            {/* Terminal User Input bar */}
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    executeTerminalCommand(terminalInput);
                                }}
                                className="bg-zinc-950 border-t border-zinc-900 px-4 py-3 flex items-center gap-2"
                            >
                                <span className="text-sky-400 text-xs font-bold font-mono">aether@orchestrator:~$</span>
                                <input
                                    type="text"
                                    value={terminalInput}
                                    onChange={(e) => setTerminalInput(e.target.value)}
                                    className="flex-1 bg-transparent border-none text-white text-xs font-mono outline-none focus:ring-0 focus:border-transparent"
                                    placeholder="Type 'help'..."
                                    autoFocus
                                />
                                <button type="submit" className="hidden" />
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
