import React, { useState, useMemo } from 'react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { 
    TrendingUp, TrendingDown, DollarSign, Percent, ArrowLeftRight, 
    Sliders, Calendar, Play, CheckCircle2, AlertCircle, PiggyBank, HelpCircle 
} from 'lucide-react';

export interface Bank {
    name: string;
    apr: number; // e.g. 0.055
}

export interface Fees {
    apr_fee_rate: number; // e.g. 0.0025
    title_cost: number;
    lender_fee: number;
    wire_fee: number;
}

export interface SimulationRow {
    day: number;
    bank: string;
    value: number;
    gain_percent: number;
    action: 'hold' | 'transfer' | 'no_transfer';
    transfer_fees_total: number;
}

export interface SimulationResult {
    principal: number;
    principal_cost_basis: number;
    start_bank: string;
    end_bank: string;
    final_value: number;
    final_gain_amount: number;
    final_gain_percent: number;
    transfer_event: boolean;
    timeline: SimulationRow[];
    assumptions: {
        interest_compounding: string;
        fees_model: string;
        title_cost_and_lender_fee_are_flat: boolean;
    };
}

export function dailyRate(apr: number): number {
    return Math.pow(1.0 + apr, 1.0 / 365.0) - 1.0;
}

export function simulate3Weeks(
    startBank: Bank,
    nextBank: Bank,
    principal: number,
    fees: Fees,
    minGainPercent: number,
    transferAmount: number,
    transferDays: number = 7
): SimulationResult {
    const days = 21;
    const principalCostBasis = principal;

    let currentBank = startBank;
    let value = principal;
    const timeline: SimulationRow[] = [];

    let transferred = false;

    for (let day = 1; day <= days; day++) {
        // accrue interest for the day
        value *= 1.0 + dailyRate(currentBank.apr);

        const gainAmount = value - principalCostBasis;
        const gainPercent = principalCostBasis ? gainAmount / principalCostBasis : 0.0;

        let action: 'hold' | 'transfer' | 'no_transfer' = 'hold';
        let transferFeeTotal = 0.0;

        // decision: transfer if gain% >= 0 but below minGainPercent threshold on transferDays
        if (!transferred && day === transferDays) {
            if (gainPercent >= 0 && gainPercent < minGainPercent) {
                action = 'transfer';
                transferred = true;

                transferFeeTotal = (
                    transferAmount * fees.apr_fee_rate +
                    fees.title_cost +
                    fees.lender_fee +
                    fees.wire_fee
                );
                value = Math.max(0.0, value - transferFeeTotal);
                currentBank = nextBank;
            } else {
                action = 'no_transfer';
            }
        }

        timeline.push({
            day,
            bank: currentBank.name,
            value: parseFloat(value.toFixed(2)),
            gain_percent: parseFloat(gainPercent.toFixed(6)),
            action,
            transfer_fees_total: parseFloat(transferFeeTotal.toFixed(2)),
        });
    }

    const finalGainAmount = value - principalCostBasis;
    const finalGainPercent = principalCostBasis ? finalGainAmount / principalCostBasis : 0.0;

    return {
        principal,
        principal_cost_basis: principalCostBasis,
        start_bank: startBank.name,
        end_bank: currentBank.name,
        final_value: parseFloat(value.toFixed(2)),
        final_gain_amount: parseFloat(finalGainAmount.toFixed(2)),
        final_gain_percent: parseFloat(finalGainPercent.toFixed(6)),
        transfer_event: transferred,
        timeline,
        assumptions: {
            interest_compounding: 'daily_equivalent',
            fees_model: 'fees are immediate haircut on transfer day',
            title_cost_and_lender_fee_are_flat: true,
        },
    };
}

export const BankTransferSimulator: React.FC = () => {
    // Start Bank Configuration
    const [startBankName, setStartBankName] = useState('BankA');
    const [startBankApr, setStartBankApr] = useState(5.5); // as percentage

    // Next Bank Configuration
    const [nextBankName, setNextBankName] = useState('BankB');
    const [nextBankApr, setNextBankApr] = useState(4.5); // as percentage

    // Parameters
    const [principal, setPrincipal] = useState(100000);
    const [transferAmount, setTransferAmount] = useState(100000);
    const [transferDay, setTransferDay] = useState(7);
    const [minGainPercent, setMinGainPercent] = useState(0.3); // as percentage (0.3% = 0.003)

    // Fees Configuration
    const [aprFeeRate, setAprFeeRate] = useState(0.25); // percentage haircut on transferred principal
    const [titleCost, setTitleCost] = useState(450);
    const [lenderFee, setLenderFee] = useState(300);
    const [wireFee, setWireFee] = useState(25);

    // Calculate simulation results memoized
    const result = useMemo(() => {
        const startBank: Bank = { name: startBankName, apr: startBankApr / 100 };
        const nextBank: Bank = { name: nextBankName, apr: nextBankApr / 100 };
        const fees: Fees = {
            apr_fee_rate: aprFeeRate / 100,
            title_cost: titleCost,
            lender_fee: lenderFee,
            wire_fee: wireFee
        };

        return simulate3Weeks(
            startBank,
            nextBank,
            principal,
            fees,
            minGainPercent / 100,
            transferAmount,
            transferDay
        );
    }, [
        startBankName, startBankApr, nextBankName, nextBankApr,
        principal, transferAmount, transferDay, minGainPercent,
        aprFeeRate, titleCost, lenderFee, wireFee
    ]);

    // Format chart data
    const chartData = useMemo(() => {
        return result.timeline.map(row => ({
            day: `Day ${row.day}`,
            value: row.value,
            gainPercent: (row.gain_percent * 100).toFixed(4),
            fees: row.transfer_fees_total,
            bank: row.bank,
            rawDay: row.day
        }));
    }, [result]);

    return (
        <div className="space-y-6 text-zinc-300 animate-in fade-in duration-300">
            {/* Header / Disclaimer Banner */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">Deterministic Toy Workflow Model</h4>
                    <p className="text-[10px] text-zinc-400 mt-1">
                        This simulator models daily compounded interest accrual over a 3-week period (21 days) with a deterministic transfer trigger. 
                        <strong> DISCLAIMER:</strong> This is NOT financial advice. It is a simplified toy model designed solely for workflow testing and algorithmic logic validation.
                    </p>
                </div>
            </div>

            {/* Main Interactive Workspace (Form + Dashboard Side-by-Side) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 space-y-4">
                    <div className="border-b border-zinc-900 pb-3">
                        <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-amber-300 flex items-center gap-2">
                            <Sliders className="w-3.5 h-3.5" /> Simulation Parameters
                        </h3>
                    </div>

                    {/* Principal and Transfer Amount */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-zinc-550 uppercase block font-bold">Principal ($)</label>
                            <input 
                                type="number" 
                                value={principal}
                                onChange={(e) => {
                                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                                    setPrincipal(val);
                                    // Keep transfer amount equal by default for simpler testing
                                    setTransferAmount(val);
                                }}
                                className="w-full bg-black border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-amber-500/50 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-zinc-550 uppercase block font-bold">Transfer Principal ($)</label>
                            <input 
                                type="number" 
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full bg-black border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-amber-500/50 outline-none"
                            />
                        </div>
                    </div>

                    {/* Start Bank */}
                    <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-3">
                        <div className="text-[10px] font-serif font-black uppercase text-amber-400 flex justify-between">
                            <span>🚀 Start Bank</span>
                            <span className="text-[9px] font-mono text-zinc-500">Day 1 onwards</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-mono text-zinc-500 uppercase block">Bank Name</label>
                                <input 
                                    type="text" 
                                    value={startBankName}
                                    onChange={(e) => setStartBankName(e.target.value)}
                                    className="w-full bg-black border border-zinc-850 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-mono text-zinc-500 uppercase block">APR Rate (%)</label>
                                <div className="relative flex items-center">
                                    <input 
                                        type="number" 
                                        step="0.05"
                                        value={startBankApr}
                                        onChange={(e) => setStartBankApr(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-black border border-zinc-850 rounded-lg pl-2.5 pr-6 py-1 text-xs text-white font-mono outline-none"
                                    />
                                    <span className="absolute right-2 text-[10px] font-mono text-zinc-550">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next Bank */}
                    <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-3">
                        <div className="text-[10px] font-serif font-black uppercase text-amber-400 flex justify-between">
                            <span>🎯 Next Bank (Target)</span>
                            <span className="text-[9px] font-mono text-zinc-500">After Transfer</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-mono text-zinc-500 uppercase block">Bank Name</label>
                                <input 
                                    type="text" 
                                    value={nextBankName}
                                    onChange={(e) => setNextBankName(e.target.value)}
                                    className="w-full bg-black border border-zinc-850 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-mono text-zinc-500 uppercase block">APR Rate (%)</label>
                                <div className="relative flex items-center">
                                    <input 
                                        type="number" 
                                        step="0.05"
                                        value={nextBankApr}
                                        onChange={(e) => setNextBankApr(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-black border border-zinc-850 rounded-lg pl-2.5 pr-6 py-1 text-xs text-white font-mono outline-none"
                                    />
                                    <span className="absolute right-2 text-[10px] font-mono text-zinc-550">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Workflow Settings */}
                    <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-3">
                        <span className="text-[10px] font-serif font-black uppercase text-amber-400 block">⚡ Workflow & Thresholds</span>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-mono text-zinc-500 uppercase block">Transfer Window Day</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="21"
                                    value={transferDay}
                                    onChange={(e) => setTransferDay(Math.min(21, Math.max(1, parseInt(e.target.value) || 1)))}
                                    className="w-full bg-black border border-zinc-850 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-mono text-zinc-500 uppercase block">Min Gain Threshold (%)</label>
                                <div className="relative flex items-center">
                                    <input 
                                        type="number" 
                                        step="0.05"
                                        value={minGainPercent}
                                        onChange={(e) => setMinGainPercent(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-black border border-zinc-850 rounded-lg pl-2.5 pr-6 py-1 text-xs text-white font-mono outline-none"
                                    />
                                    <span className="absolute right-2 text-[10px] font-mono text-zinc-550">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fees Configuration */}
                    <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-3">
                        <span className="text-[10px] font-serif font-black uppercase text-amber-400 block">💸 Transfer Cost & Haircuts</span>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-mono text-zinc-500 uppercase block">APR Fee Rate haircut (%)</label>
                                <div className="relative flex items-center">
                                    <input 
                                        type="number" 
                                        step="0.05"
                                        value={aprFeeRate}
                                        onChange={(e) => setAprFeeRate(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-black border border-zinc-850 rounded-lg pl-2.5 pr-6 py-1 text-xs text-white font-mono outline-none"
                                    />
                                    <span className="absolute right-2 text-[10px] font-mono text-zinc-550">%</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-mono text-zinc-500 uppercase block">Title Cost ($)</label>
                                <input 
                                    type="number" 
                                    value={titleCost}
                                    onChange={(e) => setTitleCost(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full bg-black border border-zinc-850 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-mono text-zinc-500 uppercase block">Lender Fee ($)</label>
                                <input 
                                    type="number" 
                                    value={lenderFee}
                                    onChange={(e) => setLenderFee(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full bg-black border border-zinc-850 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-mono text-zinc-500 uppercase block">Wire Fee ($)</label>
                                <input 
                                    type="number" 
                                    value={wireFee}
                                    onChange={(e) => setWireFee(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full bg-black border border-zinc-850 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard & Chart */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-900 flex flex-col justify-between">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase font-black">Final Portfolio Value</span>
                            <span className="text-sm font-sans font-black text-white mt-1">
                                ${result.final_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <div className="flex items-center gap-1 mt-1 text-[8px] font-mono text-zinc-400">
                                <PiggyBank className="w-3 h-3 text-amber-500" /> Init: ${principal.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-900 flex flex-col justify-between">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase font-black">Final Net Gain</span>
                            <span className={`text-sm font-sans font-black mt-1 flex items-center gap-1 ${
                                result.final_gain_amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                                {result.final_gain_amount >= 0 ? '+' : ''}
                                ${result.final_gain_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                {result.final_gain_amount >= 0 ? (
                                    <TrendingUp className="w-3.5 h-3.5" />
                                ) : (
                                    <TrendingDown className="w-3.5 h-3.5" />
                                )}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-500">
                                {result.final_gain_amount >= 0 ? 'Surplus Earned' : 'Loss via haircut'}
                            </span>
                        </div>

                        <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-900 flex flex-col justify-between">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase font-black">Final Gain %</span>
                            <span className={`text-sm font-sans font-black mt-1 ${
                                result.final_gain_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                                {(result.final_gain_percent * 100).toFixed(4)}%
                            </span>
                            <span className="text-[8px] font-mono text-zinc-500">Cost-basis matched</span>
                        </div>

                        <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-900 flex flex-col justify-between">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase font-black">Transfer Outcome</span>
                            <div className="mt-1.5">
                                {result.transfer_event ? (
                                    <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center justify-center gap-1">
                                        <ArrowLeftRight className="w-3 h-3 text-amber-400 animate-pulse" />
                                        TRIGGERED
                                    </span>
                                ) : (
                                    <span className="text-[9px] font-mono font-black text-zinc-500 bg-zinc-900/50 border border-zinc-800 px-2 py-0.5 rounded-md flex items-center justify-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-zinc-500" />
                                        HOLD (NO-OP)
                                    </span>
                                )}
                            </div>
                            <span className="text-[8px] font-mono text-zinc-500 mt-1 text-center truncate">
                                End Bank: <strong>{result.end_bank}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Chart Card */}
                    <div className="bg-zinc-950/60 p-5 rounded-2xl border border-zinc-900">
                        <div className="flex justify-between items-center mb-4 border-b border-zinc-900/80 pb-2">
                            <h4 className="text-xs font-serif font-bold uppercase tracking-widest text-amber-300">Portfolio Value Trajectory (21-Day Period)</h4>
                            <span className="text-[8px] font-mono text-zinc-500">compounding daily_equivalent</span>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                                    <XAxis 
                                        dataKey="day" 
                                        stroke="#52525b" 
                                        fontSize={9} 
                                        fontFamily="JetBrains Mono"
                                    />
                                    <YAxis 
                                        stroke="#52525b" 
                                        fontSize={9} 
                                        fontFamily="JetBrains Mono"
                                        domain={['auto', 'auto']}
                                        tickFormatter={(v) => `$${Math.round(v).toLocaleString()}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#09090b',
                                            borderColor: '#27272a',
                                            fontSize: '11px',
                                            fontFamily: 'JetBrains Mono',
                                            borderRadius: '8px',
                                            color: '#e4e4e7'
                                        }}
                                        formatter={(value: any, name: string, props: any) => {
                                            if (name === 'value') return [`$${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Portfolio Value'];
                                            if (name === 'gainPercent') return [`${value}%`, 'Accumulated Gain'];
                                            if (name === 'fees') return [`$${value}`, 'Haircut Fees paid'];
                                            return [value, name];
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke="#f59e0b" 
                                        strokeWidth={1.5}
                                        fillOpacity={1} 
                                        fill="url(#colorValue)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Timeline Table */}
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <h3 className="text-xs font-serif font-bold uppercase tracking-widest text-amber-300 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> Day-by-Day Workflow Timeline Log
                    </h3>
                    <span className="text-[8px] font-mono text-zinc-550 uppercase">21 records computed</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-zinc-900 bg-zinc-900/10 font-mono text-[9px] text-zinc-500 uppercase">
                                <th className="p-3 text-center">Day</th>
                                <th className="p-3">Active Bank</th>
                                <th className="p-3">Current Value ($)</th>
                                <th className="p-3">Acc. Gain (%)</th>
                                <th className="p-3">Transfer Haircut</th>
                                <th className="p-3 text-right">Action Decision</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/40 font-mono text-[10px]">
                            {result.timeline.map((row) => {
                                const isTransfer = row.action === 'transfer';
                                const isNoTransfer = row.action === 'no_transfer';
                                return (
                                    <tr 
                                        key={row.day} 
                                        className={`transition-colors duration-200 ${
                                            isTransfer 
                                                ? 'bg-amber-500/10 border-y border-amber-500/20 hover:bg-amber-500/15' 
                                                : isNoTransfer 
                                                ? 'bg-red-500/5 hover:bg-red-500/10'
                                                : 'hover:bg-zinc-900/10'
                                        }`}
                                    >
                                        <td className="p-3 text-center font-bold">
                                            {row.day === transferDay ? (
                                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                                                    {row.day}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-400">{row.day}</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <span className={`font-sans font-bold text-xs ${
                                                row.bank === nextBankName && result.transfer_event ? 'text-amber-300' : 'text-zinc-300'
                                            }`}>
                                                {row.bank}
                                            </span>
                                        </td>
                                        <td className="p-3 text-white font-bold">
                                            ${row.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className={`p-3 font-semibold ${
                                            row.gain_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                        }`}>
                                            {(row.gain_percent * 100).toFixed(4)}%
                                        </td>
                                        <td className="p-3">
                                            {row.transfer_fees_total > 0 ? (
                                                <span className="text-rose-400 font-bold">
                                                    -${row.transfer_fees_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-700">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            {isTransfer ? (
                                                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-amber-500 text-stone-950 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                                                    🔁 transfer trigger
                                                </span>
                                            ) : isNoTransfer ? (
                                                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                                                    🛑 no_transfer threshold
                                                </span>
                                            ) : (
                                                <span className="text-zinc-600 lowercase text-[9px]">
                                                    hold
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
