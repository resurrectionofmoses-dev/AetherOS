
import React, { useState, useEffect } from 'react';
import { 
    ActivityIcon, ShieldIcon, ZapIcon, LockIcon, 
    ChevronRightIcon, ArrowUpRightIcon, ArrowDownLeftIcon,
    RefreshCwIcon, DatabaseIcon, CpuIcon, TrendingUpIcon,
    BitcoinIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Transaction {
    id: string;
    coin: 'BTC' | 'XMR';
    amount: number;
    type: 'SEND' | 'RECEIVE';
    status: 'CONFIRMED' | 'PENDING' | 'FAILED';
    timestamp: number;
    address: string;
}

interface NetworkStats {
    blockHeight: number;
    hashrate: string;
    difficulty: string;
    price: string;
}

export const MainNetView: React.FC = () => {
    const [btcStats, setBtcStats] = useState<NetworkStats>({
        blockHeight: 841234,
        hashrate: '620.45 EH/s',
        difficulty: '83.95 T',
        price: '$64,231.42'
    });

    const [xmrStats, setXmrStats] = useState<NetworkStats>({
        blockHeight: 3123456,
        hashrate: '2.84 GH/s',
        difficulty: '341.2 G',
        price: '$164.28'
    });

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedCoin, setSelectedCoin] = useState<'BTC' | 'XMR'>('BTC');
    const [isMining, setIsMining] = useState(false);
    const [miningEfficiency, setMiningEfficiency] = useState(0);

    useEffect(() => {
        // Mock transaction stream
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const coin = Math.random() > 0.5 ? 'BTC' : 'XMR';
                const newTx: Transaction = {
                    id: Math.random().toString(16).slice(2, 10),
                    coin,
                    amount: coin === 'BTC' ? parseFloat((Math.random() * 0.1).toFixed(4)) : parseFloat((Math.random() * 10).toFixed(2)),
                    type: Math.random() > 0.5 ? 'SEND' : 'RECEIVE',
                    status: 'CONFIRMED',
                    timestamp: Date.now(),
                    address: coin === 'BTC' ? 'bc1q' + Math.random().toString(16).slice(2, 10) : '4' + Math.random().toString(16).slice(2, 20)
                };
                setTransactions(prev => [newTx, ...prev].slice(0, 50));
            }

            // Update stats slightly
            setBtcStats(prev => ({
                ...prev,
                blockHeight: prev.blockHeight + (Math.random() > 0.99 ? 1 : 0),
                price: '$' + (parseFloat(prev.price.replace('$', '').replace(',', '')) + (Math.random() - 0.5) * 10).toLocaleString(undefined, { minimumFractionDigits: 2 })
            }));

            setXmrStats(prev => ({
                ...prev,
                blockHeight: prev.blockHeight + (Math.random() > 0.95 ? 1 : 0),
                price: '$' + (parseFloat(prev.price.replace('$', '').replace(',', '')) + (Math.random() - 0.5) * 0.5).toLocaleString(undefined, { minimumFractionDigits: 2 })
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let miningInterval: any;
        if (isMining) {
            miningInterval = setInterval(() => {
                setMiningEfficiency(prev => (prev + 1) % 100);
            }, 100);
        } else {
            setMiningEfficiency(0);
        }
        return () => clearInterval(miningInterval);
    }, [isMining]);

    const handleSendMock = () => {
        const newTx: Transaction = {
            id: Math.random().toString(16).slice(2, 10),
            coin: selectedCoin,
            amount: selectedCoin === 'BTC' ? 0.001 : 1.5,
            type: 'SEND',
            status: 'PENDING',
            timestamp: Date.now(),
            address: selectedCoin === 'BTC' ? 'bc1qDestinationAddr' : '4DestinationAddr'
        };
        setTransactions(prev => [newTx, ...prev]);
        setTimeout(() => {
            setTransactions(prev => prev.map(tx => tx.id === newTx.id ? { ...tx, status: 'CONFIRMED' } : tx));
        }, 5000);
    };

    return (
        <div className="h-full flex flex-col bg-[#050508] text-zinc-300 font-mono overflow-auto">
            {/* Header */}
            <div className="p-8 border-b-4 border-black bg-zinc-900/40 flex justify-between items-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(247,147,26,0.05)_0%,_transparent_50%)]" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-orange-600/10 border-4 border-orange-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(247,147,26,0.2)]">
                        <BitcoinIcon className="w-10 h-10 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="font-black text-5xl text-white tracking-tighter italic uppercase leading-none">Main_Net Command</h2>
                        <p className="text-[10px] text-orange-600 font-black uppercase tracking-[0.4em] mt-2 italic">Monitoring Decentralized Global Liquidity.</p>
                    </div>
                </div>

                <div className="flex gap-8 relative z-10">
                    <div className="text-right">
                        <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Global Market Cap</p>
                        <p className="text-2xl font-black text-white italic tracking-tight">$2.42T</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="text-right">
                        <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Dominance</p>
                        <p className="text-2xl font-black text-orange-500 italic tracking-tight">BTC: 52.4%</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 p-8 overflow-y-auto custom-scrollbar">
                {/* Left Column: BTC Status */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-zinc-900/60 border-4 border-black p-8 rounded-[2rem] shadow-[10px_10px_0_0_#000] hover:border-orange-600/40 transition-all group">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <BitcoinIcon className="w-8 h-8 text-orange-500" />
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Bitcoin Core</h3>
                            </div>
                            <span className="text-[10px] font-black text-orange-600 bg-orange-950/30 px-3 py-1 rounded-full border border-orange-800 animate-pulse">LIVE NET</span>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Block Height</p>
                                    <p className="text-sm font-black text-white font-mono">{btcStats.blockHeight.toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Price (USD)</p>
                                    <p className="text-sm font-black text-emerald-500 font-mono">{btcStats.price}</p>
                                </div>
                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Hashrate</p>
                                    <p className="text-sm font-black text-zinc-400 font-mono text-[10px]">{btcStats.hashrate}</p>
                                </div>
                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Difficulty</p>
                                    <p className="text-sm font-black text-zinc-400 font-mono text-[10px]">{btcStats.difficulty}</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => { setSelectedCoin('BTC'); handleSendMock(); }}
                                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                <ArrowUpRightIcon className="w-4 h-4" />
                                Broadcast BTC TX
                            </button>
                        </div>
                    </div>

                    <div className="bg-zinc-900/60 border-4 border-black p-8 rounded-[2rem] shadow-[10px_10px_0_0_#000] hover:border-zinc-100/20 transition-all group">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <ShieldIcon className="w-8 h-8 text-zinc-400" />
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Monero (XMR)</h3>
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">PRIVACY MODE</span>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Block Height</p>
                                    <p className="text-sm font-black text-white font-mono">{xmrStats.blockHeight.toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Price (USD)</p>
                                    <p className="text-sm font-black text-emerald-500 font-mono">{xmrStats.price}</p>
                                </div>
                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Hashrate</p>
                                    <p className="text-sm font-black text-zinc-400 font-mono text-[10px]">{xmrStats.hashrate}</p>
                                </div>
                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Privacy Layer</p>
                                    <p className="text-sm font-black text-purple-500 font-mono text-[10px]">RingCT_EX_v8</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => { setSelectedCoin('XMR'); handleSendMock(); }}
                                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 border border-white/10"
                            >
                                <LockIcon className="w-4 h-4" />
                                Untraceable Send
                            </button>
                        </div>
                    </div>
                </div>

                {/* Middle Column: Mining Sim & Network View */}
                <div className="xl:col-span-5 space-y-6">
                    <div className="bg-black border-4 border-black p-8 rounded-[2rem] shadow-[20px_20px_40px_rgba(0,0,0,0.5)] h-fit">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <CpuIcon className="w-4 h-4" /> StratumV2 Mining Lab
                            </h4>
                            <div className="flex items-center gap-2 text-[8px] font-black text-zinc-600 uppercase">
                                <div className={`w-1.5 h-1.5 rounded-full ${isMining ? 'bg-emerald-500 animate-ping' : 'bg-red-600'}`} />
                                {isMining ? 'Hashing Active' : 'Rig Offline'}
                            </div>
                        </div>

                        <div className="flex flex-col items-center py-6">
                            <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle 
                                        cx="96" cy="96" r="80" 
                                        fill="transparent" 
                                        stroke="#18181b" 
                                        strokeWidth="12"
                                    />
                                    <circle 
                                        cx="96" cy="96" r="80" 
                                        fill="transparent" 
                                        stroke={selectedCoin === 'BTC' ? '#f7931a' : '#444'} 
                                        strokeWidth="12"
                                        strokeDasharray={2 * Math.PI * 80}
                                        strokeDashoffset={2 * Math.PI * 80 * (1 - miningEfficiency / 100)}
                                        strokeLinecap="round"
                                        className="transition-all duration-300"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-3xl font-black text-white italic">{miningEfficiency}%</span>
                                    <span className="text-[8px] font-black text-zinc-500 uppercase">Block Progress</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                <div className="text-center p-4 bg-zinc-900 border border-white/5 rounded-2xl">
                                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Worker</p>
                                    <p className="text-[10px] font-black text-white">AETHER_RIG_01</p>
                                </div>
                                <div className="text-center p-4 bg-zinc-900 border border-white/5 rounded-2xl">
                                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Temp</p>
                                    <p className="text-[10px] font-black text-red-500">62°C</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setIsMining(!isMining)}
                                className={`w-full py-6 font-black uppercase text-sm tracking-[0.3em] rounded-2xl shadow-xl transition-all active:scale-95 ${isMining ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-emerald-600 text-black hover:bg-emerald-500'}`}
                            >
                                {isMining ? 'Halt Mining' : 'Ignite Hashrate'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-zinc-900/30 border-4 border-black p-8 rounded-[2rem] flex flex-col gap-6">
                        <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Global Network Heatmap</h4>
                        <div className="h-48 bg-black rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center group overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {[...Array(64)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`w-4 h-4 rounded shadow-lg transition-all duration-1000 ${
                                                Math.random() > 0.8 ? 'bg-orange-500 scale-125' : 
                                                Math.random() > 0.9 ? 'bg-emerald-500' : 
                                                'bg-zinc-900'
                                            }`} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Transaction Ledger */}
                <div className="xl:col-span-3 h-full flex flex-col overflow-hidden">
                    <div className="flex flex-col h-full bg-zinc-900/60 border-4 border-black rounded-[2rem] shadow-[10px_10px_0_0_#000] overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-black/40">
                            <h3 className="text-xl font-black text-white italic uppercase flex items-center gap-3">
                                <ActivityIcon className="w-5 h-5 text-emerald-500" />
                                Real-Time Explorer
                            </h3>
                            <p className="text-[8px] text-zinc-600 font-black uppercase mt-1 tracking-widest italic">Monitoring every valid block admission.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                            <AnimatePresence initial={false}>
                                {transactions.map((tx) => (
                                    <motion.div 
                                        key={tx.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-black/80 border-2 border-black p-4 rounded-2xl group hover:border-emerald-500/20 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${tx.type === 'SEND' ? 'bg-red-950/20 text-red-500' : 'bg-emerald-950/20 text-emerald-500'}`}>
                                                    {tx.type === 'SEND' ? <ArrowUpRightIcon className="w-3 h-3" /> : <ArrowDownLeftIcon className="w-3 h-3" />}
                                                </div>
                                                <span className={`text-[10px] font-black ${tx.coin === 'BTC' ? 'text-orange-500' : 'text-zinc-400'}`}>
                                                    {tx.coin}
                                                </span>
                                            </div>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded border border-current ${tx.status === 'CONFIRMED' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                                                {tx.status}
                                            </span>
                                        </div>

                                        <p className="text-xs font-black text-white italic">
                                            {tx.type === 'SEND' ? '-' : '+'}{tx.amount} {tx.coin}
                                        </p>
                                        <p className="text-[7px] text-zinc-600 font-mono mt-1 truncate">
                                            {tx.address}
                                        </p>
                                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 opacity-40">
                                            <span className="text-[6px] font-black uppercase text-zinc-700">0x{tx.id.toUpperCase()}</span>
                                            <span className="text-[6px] font-black uppercase text-zinc-700">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-black border-t-8 border-black flex items-center justify-between shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Global Conjunction: SYNCED</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <span className="text-[10px] text-zinc-700 font-mono italic">Mined Blocks In Session: 0 | CPU Exhaustion: 12%</span>
                </div>
                <div className="text-[10px] text-zinc-800 font-black uppercase italic tracking-[0.4em]">
                    AetherOS // Main_Net_Viewer // Sovereign_Liquidity
                </div>
            </div>
        </div>
    );
};
