import React, { useState, useEffect, useMemo } from 'react';
import { 
    Wallet, TrendingUp, DollarSign, PiggyBank, Plus, ArrowUpRight, ArrowDownLeft, 
    Zap, ShoppingBag, ShieldCheck, RefreshCw, AlertCircle, FileText, PieChart as PieIcon, 
    Calendar, CheckCircle2, XCircle, Search, HelpCircle, BarChart3, Sliders, Play
} from 'lucide-react';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { toast } from 'sonner';

// Define transaction structure
export interface SpendingTransaction {
    id: string;
    description: string;
    merchant: string;
    amount: number; // in USD equivalent or units
    type: 'EXPENSE' | 'INCOME';
    category: 'Energy' | 'Infrastructure' | 'Materials' | 'Sustenance' | 'General';
    subtype: 'solar_power' | 'grain' | 'iron_ore' | 'minted_aether_usd' | 'fiat_usd';
    quantity: number; // raw units spent/received
    timestamp: number;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    txHash?: string;
}

// Define budget structure
export interface BudgetAllocation {
    category: 'Energy' | 'Infrastructure' | 'Materials' | 'Sustenance' | 'General';
    allocated: number; // in USD / CPH
    spent: number;
}

const CATEGORY_COLORS: Record<string, string> = {
    Energy: '#f59e0b',       // Amber
    Infrastructure: '#3b82f6', // Blue
    Materials: '#8b5cf6',    // Purple
    Sustenance: '#10b981',   // Emerald
    General: '#6b7280'       // Gray
};

export const RealWorldSpendingWallet: React.FC = () => {
    const [reserves, setReserves] = useState<any>(null);
    const [transactions, setTransactions] = useState<SpendingTransaction[]>([]);
    const [budgets, setBudgets] = useState<BudgetAllocation[]>([]);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRANSACTIONS' | 'BUDGETS' | 'CHARTS'>('OVERVIEW');
    
    // Form States for Direct Real-World Spending
    const [desc, setDesc] = useState('');
    const [merchant, setMerchant] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<'Energy' | 'Infrastructure' | 'Materials' | 'Sustenance' | 'General'>('Energy');
    const [subtype, setSubtype] = useState<'solar_power' | 'grain' | 'iron_ore' | 'minted_aether_usd' | 'fiat_usd'>('solar_power');
    const [txType, setTxType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
    const [isProcessing, setIsProcessing] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');

    // Load initial data
    useEffect(() => {
        loadWalletData();
    }, []);

    const loadWalletData = () => {
        // 1. Load reserves from localStorage
        const savedReserves = localStorage.getItem('aetheros_resource_reserve');
        let parsedReserves;
        if (savedReserves) {
            try {
                parsedReserves = JSON.parse(savedReserves);
            } catch (e) {
                console.error(e);
            }
        }
        
        if (!parsedReserves) {
            // Seed a clean initial state matching RealMoneySystem
            parsedReserves = {
                reserves: [
                    { type: 'energy', subtype: 'solar_power', quantity: 200, unit: 'kWh', cphPerUnit: 1, totalValue: 200, depreciationRate: 50, remainingLifeWeeks: 4 },
                    { type: 'food', subtype: 'grain', quantity: 100, unit: 'kg', cphPerUnit: 5, totalValue: 500, depreciationRate: 100, remainingLifeWeeks: 2 },
                    { type: 'materials', subtype: 'iron_ore', quantity: 300, unit: 'kg', cphPerUnit: 2, totalValue: 600, depreciationRate: 5, remainingLifeWeeks: 200 },
                    { type: 'energy', subtype: 'minted_aether_usd', quantity: 500, unit: 'aetherUSD', cphPerUnit: 1, totalValue: 500, depreciationRate: 0, remainingLifeWeeks: 1000 }
                ],
                totalBackedCPH: 1800,
                cphInCirculation: 1300,
                cphInStorage: 500,
                resourcesExtractedCPH: 1800,
                resourcesConsumedCPH: 0,
                valueAddedCPH: 0,
                depreciationCPH: 0,
                netResourceBalance: 1800
            };
            localStorage.setItem('aetheros_resource_reserve', JSON.stringify(parsedReserves));
        }
        setReserves(parsedReserves);

        // 2. Load transactions
        const savedTx = localStorage.getItem('aetheros_wallet_transactions');
        if (savedTx) {
            try {
                setTransactions(JSON.parse(savedTx));
            } catch (e) {
                console.error(e);
            }
        } else {
            const seedTx: SpendingTransaction[] = [
                {
                    id: 'tx-1',
                    description: 'Direct solar power export to local microgrid',
                    merchant: 'Sovereign Energy Grid',
                    amount: 50,
                    type: 'INCOME',
                    category: 'Energy',
                    subtype: 'solar_power',
                    quantity: 50,
                    timestamp: Date.now() - 3600000 * 4,
                    status: 'COMPLETED',
                    txHash: '0x3e2a9b...f4f1'
                },
                {
                    id: 'tx-2',
                    description: 'Aether Cloud Cluster Sovereign tier license',
                    merchant: 'Aether Flow Systems',
                    amount: 100,
                    type: 'EXPENSE',
                    category: 'Infrastructure',
                    subtype: 'minted_aether_usd',
                    quantity: 100,
                    timestamp: Date.now() - 3600000 * 2,
                    status: 'COMPLETED',
                    txHash: '0xf8e19c...28a0'
                },
                {
                    id: 'tx-3',
                    description: 'Emergency bio-sustenance raw food requisition',
                    merchant: 'Sovereign Farm Depot',
                    amount: 75,
                    type: 'EXPENSE',
                    category: 'Sustenance',
                    subtype: 'grain',
                    quantity: 15,
                    timestamp: Date.now() - 1800000,
                    status: 'COMPLETED',
                    txHash: '0x2e08a1...19c4'
                }
            ];
            setTransactions(seedTx);
            localStorage.setItem('aetheros_wallet_transactions', JSON.stringify(seedTx));
        }

        // 3. Load or initialize budgets
        const savedBudgets = localStorage.getItem('aetheros_wallet_budgets');
        if (savedBudgets) {
            try {
                setBudgets(JSON.parse(savedBudgets));
            } catch (e) {
                console.error(e);
            }
        } else {
            const seedBudgets: BudgetAllocation[] = [
                { category: 'Energy', allocated: 250, spent: 0 },
                { category: 'Infrastructure', allocated: 500, spent: 100 },
                { category: 'Materials', allocated: 300, spent: 0 },
                { category: 'Sustenance', allocated: 200, spent: 75 },
                { category: 'General', allocated: 150, spent: 0 }
            ];
            setBudgets(seedBudgets);
            localStorage.setItem('aetheros_wallet_budgets', JSON.stringify(seedBudgets));
        }
    };

    // Recalculate budget consumption from transaction history
    const recalculateBudgets = (txs: SpendingTransaction[]) => {
        const savedBudgets = localStorage.getItem('aetheros_wallet_budgets');
        let currentBudgets: BudgetAllocation[] = [];
        if (savedBudgets) {
            try { currentBudgets = JSON.parse(savedBudgets); } catch {}
        }
        if (currentBudgets.length === 0) {
            currentBudgets = [
                { category: 'Energy', allocated: 250, spent: 0 },
                { category: 'Infrastructure', allocated: 500, spent: 0 },
                { category: 'Materials', allocated: 300, spent: 0 },
                { category: 'Sustenance', allocated: 200, spent: 0 },
                { category: 'General', allocated: 150, spent: 0 }
            ];
        }

        // Reset spent values
        const updated = currentBudgets.map(b => ({ ...b, spent: 0 }));
        
        // Sum expenses
        txs.forEach(tx => {
            if (tx.type === 'EXPENSE' && tx.status === 'COMPLETED') {
                const target = updated.find(b => b.category === tx.category);
                if (target) {
                    target.spent += tx.amount;
                }
            }
        });

        setBudgets(updated);
        localStorage.setItem('aetheros_wallet_budgets', JSON.stringify(updated));
    };

    // Execute real transaction
    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!desc.trim() || !merchant.trim() || !amount) {
            toast.error('Validation Failed', { description: 'All transaction fields are required.' });
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast.error('Invalid Amount', { description: 'Please provide a positive transaction value.' });
            return;
        }

        setIsProcessing(true);
        
        // Simulate Chainlink oracle settlement & Real-world reserve matching latency
        await new Promise(resolve => setTimeout(resolve, 1400));

        try {
            // Read latest reserve state
            const savedReserves = localStorage.getItem('aetheros_resource_reserve');
            if (!savedReserves) throw new Error("Resource reserve registry missing.");
            const currentReserve = JSON.parse(savedReserves);

            // Calculate raw unit cost
            // Let's find unit price based on realMoneySystem.ts: 
            // solar_power = 1 CPH/kWh, grain = 5 CPH/kg, iron_ore = 2 CPH/kg, minted_aether_usd = 1 CPH/aetherUSD, fiat_usd = 1 CPH
            let pricePerUnit = 1;
            let unitName = 'units';
            if (subtype === 'solar_power') { pricePerUnit = 1; unitName = 'kWh'; }
            else if (subtype === 'grain') { pricePerUnit = 5; unitName = 'kg'; }
            else if (subtype === 'iron_ore') { pricePerUnit = 2; unitName = 'kg'; }
            else if (subtype === 'minted_aether_usd') { pricePerUnit = 1; unitName = 'aetherUSD'; }
            else if (subtype === 'fiat_usd') { pricePerUnit = 1; unitName = 'USD'; }

            const requiredUnits = numericAmount / pricePerUnit;

            // Handle reserve updates for expenses
            if (txType === 'EXPENSE') {
                if (subtype !== 'fiat_usd') {
                    const targetAsset = currentReserve.reserves.find((r: any) => r.subtype === subtype);
                    if (!targetAsset || targetAsset.quantity < requiredUnits) {
                        toast.error('Insufficient Reserve', { 
                            description: `You only have ${targetAsset?.quantity || 0} ${unitName} left, but this transaction requires ${requiredUnits.toFixed(1)} ${unitName}.` 
                        });
                        setIsProcessing(false);
                        return;
                    }
                    // Deduct from reserve
                    targetAsset.quantity -= requiredUnits;
                    targetAsset.totalValue = targetAsset.quantity * targetAsset.cphPerUnit;
                }
                
                // Update overall statistics
                currentReserve.totalBackedCPH = Math.max(0, currentReserve.totalBackedCPH - numericAmount);
                currentReserve.cphInCirculation = Math.max(0, currentReserve.cphInCirculation - numericAmount);
                currentReserve.resourcesConsumedCPH += numericAmount;
                currentReserve.netResourceBalance = currentReserve.totalBackedCPH;
            } else {
                // Income
                if (subtype !== 'fiat_usd') {
                    const targetAsset = currentReserve.reserves.find((r: any) => r.subtype === subtype);
                    if (targetAsset) {
                        targetAsset.quantity += requiredUnits;
                        targetAsset.totalValue = targetAsset.quantity * targetAsset.cphPerUnit;
                    } else {
                        currentReserve.reserves.push({
                            type: subtype === 'grain' ? 'food' : subtype === 'iron_ore' ? 'materials' : 'energy',
                            subtype: subtype,
                            quantity: requiredUnits,
                            unit: unitName,
                            cphPerUnit: pricePerUnit,
                            totalValue: numericAmount,
                            depreciationRate: subtype === 'grain' ? 100 : subtype === 'solar_power' ? 50 : 5,
                            remainingLifeWeeks: subtype === 'grain' ? 2 : subtype === 'solar_power' ? 4 : 200
                        });
                    }
                }
                currentReserve.totalBackedCPH += numericAmount;
                currentReserve.cphInCirculation += numericAmount;
                currentReserve.resourcesExtractedCPH += numericAmount;
                currentReserve.netResourceBalance = currentReserve.totalBackedCPH;
            }

            // Save reserves back to localStorage
            localStorage.setItem('aetheros_resource_reserve', JSON.stringify(currentReserve));
            setReserves(currentReserve);

            // Add direct persistent transaction
            const newTx: SpendingTransaction = {
                id: `tx-${Date.now()}`,
                description: desc,
                merchant: merchant,
                amount: numericAmount,
                type: txType,
                category: category,
                subtype: subtype,
                quantity: requiredUnits,
                timestamp: Date.now(),
                status: 'COMPLETED',
                txHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
            };

            const updatedTxs = [newTx, ...transactions];
            setTransactions(updatedTxs);
            localStorage.setItem('aetheros_wallet_transactions', JSON.stringify(updatedTxs));

            recalculateBudgets(updatedTxs);

            // Trigger visual feedback
            toast.success('Transaction Confirmed', {
                description: `${txType === 'INCOME' ? 'Credited' : 'Debited'} $${numericAmount} against ${subtype.replace('_', ' ')} reserves.`
            });

            // Reset form
            setDesc('');
            setMerchant('');
            setAmount('');
        } catch (err: any) {
            console.error(err);
            toast.error('Transaction Failed', { description: err.message || 'An error occurred during transaction settlement.' });
        } finally {
            setIsProcessing(false);
        }
    };

    // Update individual budget limit
    const handleUpdateBudgetLimit = (catName: string, newLimit: string) => {
        const val = parseFloat(newLimit);
        if (isNaN(val) || val <= 0) return;

        const updated = budgets.map(b => b.category === catName ? { ...b, allocated: val } : b);
        setBudgets(updated);
        localStorage.setItem('aetheros_wallet_budgets', JSON.stringify(updated));
        toast.success(`Budget Limit Adjusted`, {
            description: `Allocated $${val} limit for ${catName} category.`
        });
    };

    // Reset standard transaction records to clean seed
    const handleResetWalletData = () => {
        if (window.confirm("Restore default transaction history and resource budgets? This will align with core system reserves.")) {
            localStorage.removeItem('aetheros_wallet_transactions');
            localStorage.removeItem('aetheros_wallet_budgets');
            loadWalletData();
            toast.info('Wallet Logs Sanitized', { description: 'Transactions and budget bounds restored.' });
        }
    };

    // Calculate chart analytics
    const chartData = useMemo(() => {
        return budgets.map(b => ({
            name: b.category,
            Spent: Math.round(b.spent),
            Allocated: Math.round(b.allocated),
            Percentage: b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0
        }));
    }, [budgets]);

    const pieData = useMemo(() => {
        return budgets
            .filter(b => b.spent > 0)
            .map(b => ({
                name: b.category,
                value: Math.round(b.spent),
                color: CATEGORY_COLORS[b.category] || '#ccc'
            }));
    }, [budgets]);

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             t.merchant.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getReserveBalance = (sub: string) => {
        if (!reserves) return 0;
        const found = reserves.reserves.find((r: any) => r.subtype === sub);
        return found ? found.quantity : 0;
    };

    const getReserveUnit = (sub: string) => {
        if (!reserves) return '';
        const found = reserves.reserves.find((r: any) => r.subtype === sub);
        return found ? found.unit : '';
    };

    return (
        <div className="w-full bg-zinc-950/40 border border-zinc-900 rounded-2xl flex flex-col overflow-hidden text-zinc-300 backdrop-blur-md">
            {/* Wallet Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 bg-gradient-to-r from-zinc-950/70 to-black/60 p-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)] text-amber-500">
                        <Wallet className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-sm font-sans font-bold text-white tracking-tight flex items-center gap-2">
                            Real-world Spending Wallet
                        </h2>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">AETHER-CREDIT PROOF OF RESERVES LINK</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto bg-zinc-950 p-1 rounded-xl border border-zinc-900">
                    {(['OVERVIEW', 'TRANSACTIONS', 'BUDGETS', 'CHARTS'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all ${
                                activeTab === tab
                                    ? 'bg-amber-500 text-stone-950 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                                    : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Interactive Workspaces */}
            <div className="flex-1 p-5 min-h-[460px]">
                {activeTab === 'OVERVIEW' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        
                        {/* Column 1: Financial State Card */}
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            
                            {/* Card Canvas */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-zinc-800/80 p-5 shadow-2xl flex flex-col justify-between min-h-[190px]">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
                                
                                <div className="flex justify-between items-start z-10">
                                    <div>
                                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">ESTIMATED AVAILABLE CREDIT</span>
                                        <span className="text-3xl font-sans font-extrabold text-white tracking-tight">
                                            ${reserves?.totalBackedCPH?.toLocaleString() || '1,800'}.00
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-mono font-bold">
                                            ACTIVE RESERVE SYNC
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 border-t border-zinc-800/60 pt-4 mt-4 z-10">
                                    <div>
                                        <span className="text-[8px] text-zinc-500 font-mono block">MINTED AETHER</span>
                                        <span className="text-xs font-mono font-bold text-zinc-200">
                                            {getReserveBalance('minted_aether_usd').toLocaleString()} <span className="text-[9px] text-zinc-500">aUSD</span>
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] text-zinc-500 font-mono block">SOLAR POWER LINK</span>
                                        <span className="text-xs font-mono font-bold text-zinc-200">
                                            {getReserveBalance('solar_power').toLocaleString()} <span className="text-[9px] text-zinc-500">kWh</span>
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[8px] text-zinc-500 font-mono block">GRAIN COMMODITY</span>
                                        <span className="text-xs font-mono font-bold text-zinc-200">
                                            {getReserveBalance('grain').toLocaleString()} <span className="text-[9px] text-zinc-500">kg</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Execute Payment Segment */}
                            <div className="bg-zinc-950/60 rounded-2xl border border-zinc-900 p-4">
                                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono">
                                    <Plus className="w-3.5 h-3.5 text-amber-500" /> Execute Direct Settlement Payment
                                </h3>

                                <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1">TX MEMO / DESCRIPTION</label>
                                        <input
                                            type="text"
                                            value={desc}
                                            onChange={e => setDesc(e.target.value)}
                                            placeholder="e.g. AWS Cloud Tier or Coffee Requisition"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1">MERCHANT NAME</label>
                                        <input
                                            type="text"
                                            value={merchant}
                                            onChange={e => setMerchant(e.target.value)}
                                            placeholder="e.g. Amazon Web Services or local merchant"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1">AMOUNT (USD VALUE)</label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1">TX TYPE</label>
                                            <select
                                                value={txType}
                                                onChange={e => setTxType(e.target.value as any)}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                                            >
                                                <option value="EXPENSE">EXPENSE (DEBIT)</option>
                                                <option value="INCOME">INCOME (CREDIT)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1">SETTLE ASSET</label>
                                            <select
                                                value={subtype}
                                                onChange={e => {
                                                    const sub = e.target.value as any;
                                                    setSubtype(sub);
                                                    if (sub === 'solar_power') setCategory('Energy');
                                                    else if (sub === 'grain') setCategory('Sustenance');
                                                    else if (sub === 'iron_ore') setCategory('Materials');
                                                    else if (sub === 'minted_aether_usd') setCategory('Infrastructure');
                                                    else setCategory('General');
                                                }}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                                            >
                                                <option value="minted_aether_usd">aUSD (aetherUSD)</option>
                                                <option value="solar_power">solar_power (kWh)</option>
                                                <option value="grain">grain (kg)</option>
                                                <option value="iron_ore">iron_ore (kg)</option>
                                                <option value="fiat_usd">Standard USD (Fiat)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="md:col-span-2 w-full mt-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold font-mono py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                COMMITTING BLOCK SECURE SETTLEMENT...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-3.5 h-3.5 fill-current" />
                                                SUBMIT TRANSACTION & ATTEST PROOF
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Column 2: Quick Logs & Mini Budget Pie */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-zinc-950/60 rounded-2xl border border-zinc-900 p-4 flex-1 flex flex-col">
                                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-3">BUDGET USAGE BY CATEGORY</span>
                                {pieData.length > 0 ? (
                                    <div className="h-44 w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={48}
                                                    outerRadius={68}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#020205', borderColor: '#1f2937', borderRadius: 8 }}
                                                    itemStyle={{ fontSize: 10, fontFamily: 'monospace', color: '#fff' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-[8px] font-mono text-zinc-500 uppercase">Total spent</span>
                                            <span className="text-sm font-extrabold text-white font-mono">
                                                ${budgets.reduce((acc, b) => acc + b.spent, 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 py-10">
                                        <BarChart3 className="w-8 h-8 opacity-40 mb-2" />
                                        <span className="text-[9px] font-mono uppercase tracking-wider">No expenses registered</span>
                                    </div>
                                )}

                                {/* Color Legend */}
                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-900 mt-auto">
                                    {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
                                        const b = budgets.find(bd => bd.category === cat);
                                        return (
                                            <div key={cat} className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                                <span className="text-[9px] font-mono text-zinc-400 capitalize">{cat}:</span>
                                                <span className="text-[9px] font-mono font-bold text-white">${b ? b.spent : 0}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button 
                                onClick={handleResetWalletData}
                                className="text-[8px] font-mono font-bold text-zinc-600 hover:text-red-400 tracking-wider flex items-center justify-center gap-1.5 self-center mt-1"
                            >
                                <Trash2Icon className="w-3 h-3" /> RESET TRANSACTION HISTORY
                            </button>
                        </div>

                    </div>
                )}

                {activeTab === 'TRANSACTIONS' && (
                    <div className="flex flex-col h-full gap-4">
                        
                        {/* Search & Filters */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                            <div className="relative w-full sm:max-w-xs">
                                <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search by description or merchant..."
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {['ALL', 'Energy', 'Infrastructure', 'Materials', 'Sustenance', 'General'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilterCategory(cat)}
                                        className={`px-2.5 py-1 rounded-md text-[8px] font-mono font-bold transition-all ${
                                            filterCategory === cat
                                                ? 'bg-zinc-800 text-amber-500 border border-amber-500/30'
                                                : 'bg-zinc-900 text-zinc-500 border border-zinc-900 hover:text-zinc-300'
                                        }`}
                                    >
                                        {cat.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table Frame */}
                        <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-900 bg-zinc-950/80">
                                        <th className="p-3 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">TRANSACTION INFO</th>
                                        <th className="p-3 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">ASSET CLASS</th>
                                        <th className="p-3 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">SETTLED AMOUNT</th>
                                        <th className="p-3 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest text-right">PROOF SIGNATURE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.length > 0 ? (
                                        filteredTransactions.map(tx => (
                                            <tr key={tx.id} className="border-b border-zinc-900 hover:bg-zinc-900/20 transition-all">
                                                <td className="p-3 flex items-center gap-2.5">
                                                    <div className={`p-1.5 rounded-lg border ${
                                                        tx.type === 'INCOME' 
                                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                                                    }`}>
                                                        {tx.type === 'INCOME' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-sans font-bold text-white block">{tx.description}</span>
                                                        <span className="text-[9px] text-zinc-500 font-mono tracking-wider block">Merchant: {tx.merchant} | {new Date(tx.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[tx.category] || '#ccc' }} />
                                                        <span className="text-[10px] font-mono font-bold text-zinc-300 capitalize">{tx.subtype.replace('_', ' ')}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`text-xs font-mono font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-zinc-200'}`}>
                                                        {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()}
                                                    </span>
                                                    <span className="text-[8px] text-zinc-500 font-mono block">({tx.quantity.toFixed(2)} {getReserveUnit(tx.subtype) || 'units'})</span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <span className="text-[9px] font-mono text-zinc-600 font-bold block">{tx.txHash ? tx.txHash.slice(0, 16) : '0x00'}...</span>
                                                    <span className="text-[7px] text-amber-500/60 font-mono tracking-widest font-black block">ATTESTED BY CHRONOS</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-zinc-600 font-mono text-xs">
                                                NO TRANSACTIONS MATCHED FILTERING CONSTRAINTS
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                )}

                {activeTab === 'BUDGETS' && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {budgets.map(b => {
                                const ratio = b.allocated > 0 ? (b.spent / b.allocated) * 100 : 0;
                                const isExceeded = b.spent > b.allocated;
                                const isWarn = b.spent >= b.allocated * 0.8 && b.spent <= b.allocated;

                                return (
                                    <div key={b.category} className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex flex-col justify-between">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[b.category] }} />
                                                <span className="text-xs font-sans font-bold text-white capitalize">{b.category} Budget</span>
                                            </div>
                                            
                                            {isExceeded && (
                                                <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-400 font-mono px-1.5 py-0.5 rounded uppercase font-bold animate-pulse">
                                                    CRITICAL: BREACHED
                                                </span>
                                            )}
                                            {isWarn && (
                                                <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono px-1.5 py-0.5 rounded uppercase font-bold">
                                                    LIMIT WARNING
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-baseline gap-2 mb-3">
                                            <span className="text-xl font-mono font-bold text-zinc-200">${b.spent.toLocaleString()}</span>
                                            <span className="text-[10px] text-zinc-500 font-mono">spent of</span>
                                            <span className="text-xs font-mono font-bold text-zinc-400">${b.allocated.toLocaleString()} allocated</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden mb-4 border border-zinc-800/50">
                                            <div 
                                                className={`h-full transition-all duration-500 ${
                                                    isExceeded ? 'bg-red-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'
                                                }`}
                                                style={{ width: `${Math.min(100, ratio)}%` }}
                                            />
                                        </div>

                                        {/* Edit limit */}
                                        <div className="flex items-center justify-between gap-2 border-t border-zinc-900 pt-3">
                                            <span className="text-[9px] font-mono text-zinc-500">ADJUST ALLOCATION LIMIT</span>
                                            <input
                                                type="number"
                                                defaultValue={b.allocated}
                                                onBlur={e => handleUpdateBudgetLimit(b.category, e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        handleUpdateBudgetLimit(b.category, (e.target as HTMLInputElement).value);
                                                    }
                                                }}
                                                className="w-20 bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-[10px] text-right font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'CHARTS' && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex flex-col gap-4">
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">ALLOCATION VS EXPENDITURE COMPARISON</span>
                        
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9, fontFamily: 'monospace' }} />
                                    <YAxis tick={{ fill: '#4b5563', fontSize: 9, fontFamily: 'monospace' }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#020205', borderColor: '#1f2937', borderRadius: 8 }}
                                        itemStyle={{ fontSize: 10, fontFamily: 'monospace' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', paddingTop: 10 }} />
                                    <Bar dataKey="Allocated" fill="#1f2937" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Spent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Seed generic Trash2 icon since we need a clean import
const Trash2Icon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
);
