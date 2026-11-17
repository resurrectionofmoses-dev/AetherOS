import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sun, 
    CloudSun, 
    CloudRain, 
    Wind, 
    TrendingUp, 
    DollarSign, 
    ShieldCheck, 
    Wallet, 
    Sparkles, 
    RefreshCw, 
    ArrowUpRight, 
    ArrowDownRight, 
    Coins, 
    Layers, 
    Thermometer, 
    Compass, 
    Eye, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Download, 
    Copy, 
    Check, 
    Sliders,
    Zap,
    Building2,
    Plane,
    TreePine,
    Umbrella,
    Globe
} from 'lucide-react';
import { 
    WeatherOracleService, 
    WeatherReading, 
    WeatherStock, 
    ParametricWeatherBond, 
    DigitalAssetHolderState, 
    SUPPORTED_CITIES 
} from '../services/weatherOracleService';

interface WeatherAssetHolderViewProps {
    onNavigateToView?: (view: string) => void;
}

export const WeatherAssetHolderView: React.FC<WeatherAssetHolderViewProps> = ({ onNavigateToView }) => {
    const [weather, setWeather] = useState<WeatherReading>(WeatherOracleService.getWeather());
    const [wallet, setWallet] = useState<DigitalAssetHolderState>(WeatherOracleService.getWallet());
    const [selectedCity, setSelectedCity] = useState<string>(WeatherOracleService.getCityKey());
    
    // Trade Modal state
    const [activeTradeStock, setActiveTradeStock] = useState<WeatherStock | null>(null);
    const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');
    const [tradeShares, setTradeShares] = useState<number>(5);
    const [tradeMessage, setTradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Deposit Modal state
    const [depositAmount, setDepositAmount] = useState<number>(2500);
    const [showDepositModal, setShowDepositModal] = useState<boolean>(false);

    // Filter & view state
    const [selectedSector, setSelectedSector] = useState<string>('ALL');
    const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
    const [harvestSuccess, setHarvestSuccess] = useState<string | null>(null);

    // Subscribe to real-time weather & stock ticks
    useEffect(() => {
        const unsubscribe = WeatherOracleService.subscribe(() => {
            setWeather({ ...WeatherOracleService.getWeather() });
            setWallet({ ...WeatherOracleService.getWallet() });
        });
        return () => unsubscribe();
    }, []);

    const handleCityChange = (cityKey: string) => {
        setSelectedCity(cityKey);
        WeatherOracleService.setCity(cityKey);
    };

    const handleSimulateWeather = (preset: 'RADIANT_SUMMER' | 'GOLDEN_CLEAR' | 'TROPICAL_BREEZE' | 'PASSING_CLOUD' | 'STORM_OVERCAST') => {
        WeatherOracleService.simulateCondition(preset);
    };

    const handleExecuteTrade = () => {
        if (!activeTradeStock) return;
        setTradeMessage(null);

        if (tradeMode === 'BUY') {
            const res = WeatherOracleService.buyShares(activeTradeStock.id, tradeShares);
            if (res.success) {
                setTradeMessage({ type: 'success', text: res.message });
                setTimeout(() => {
                    setActiveTradeStock(null);
                    setTradeMessage(null);
                }, 1200);
            } else {
                setTradeMessage({ type: 'error', text: res.message });
            }
        } else {
            const res = WeatherOracleService.sellShares(activeTradeStock.id, tradeShares);
            if (res.success) {
                setTradeMessage({ type: 'success', text: res.message });
                setTimeout(() => {
                    setActiveTradeStock(null);
                    setTradeMessage(null);
                }, 1200);
            } else {
                setTradeMessage({ type: 'error', text: res.message });
            }
        }
    };

    const handleClaimAllDividends = () => {
        const res = WeatherOracleService.claimAllDividends();
        if (res.success) {
            setHarvestSuccess(`Harvested $${res.amountClaimed.toFixed(2)} in sunshine dividends directly into vault cash!`);
            setTimeout(() => setHarvestSuccess(null), 3500);
        }
    };

    const handleTriggerBondPayout = (bondId: string) => {
        const res = WeatherOracleService.triggerBondPayout(bondId);
        if (res.success) {
            setHarvestSuccess(`Settled parametric climate contract: +$${res.payout.toFixed(2)} received!`);
            setTimeout(() => setHarvestSuccess(null), 3500);
        }
    };

    const handleDeposit = () => {
        WeatherOracleService.depositCash(depositAmount);
        setShowDepositModal(false);
    };

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(wallet.holderAddress);
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
    };

    const filteredStocks = useMemo(() => {
        if (selectedSector === 'ALL') return wallet.stocks;
        return wallet.stocks.filter(s => s.sector === selectedSector);
    }, [wallet.stocks, selectedSector]);

    const totalClaimableDividends = useMemo(() => {
        return wallet.stocks.reduce((acc, s) => acc + s.accruedWeatherDividendsUsd, 0);
    }, [wallet.stocks]);

    return (
        <div className="w-full h-full flex flex-col bg-[#050508] text-zinc-100 font-mono overflow-y-auto custom-scrollbar select-text p-4 md:p-8">
            {/* Notification Bar */}
            <AnimatePresence>
                {harvestSuccess && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-4 p-3.5 bg-amber-500/20 border-2 border-amber-500 text-amber-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    >
                        <div className="flex items-center gap-2.5">
                            <Sun className="w-5 h-5 text-amber-400 animate-spin" />
                            <span>{harvestSuccess}</span>
                        </div>
                        <span className="text-[10px] text-amber-400/80 font-mono">AUTOMATED_ATMOSPHERIC_CLEARING</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header: Digital Asset Holder & Weather Nexus */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/25 via-yellow-500/15 to-blue-500/20 border-2 border-amber-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.25)] shrink-0">
                        <Sun className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">
                                ATMOSPHERIC ASSET HOLDER & WEATHER STOCKS
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                SUNSHINE MULTIPLIER ACTIVE ({weather.goodWeatherMultiplier}x)
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-sans mt-1">
                            Portfolio instruments and stock shares algorithmically bonded to good weather, solar irradiance, and clear skies.
                        </p>
                    </div>
                </div>

                {/* City & Oracle Selector */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-1.5">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">Climate Oracle:</span>
                        <select
                            value={selectedCity}
                            onChange={(e) => handleCityChange(e.target.value)}
                            className="bg-black text-amber-400 text-xs font-mono font-bold border border-zinc-700 rounded px-2 py-0.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                            {Object.entries(SUPPORTED_CITIES).map(([key, data]) => (
                                <option key={key} value={key}>
                                    {data.city} ({data.region})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleClaimAllDividends}
                        disabled={totalClaimableDividends <= 0}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer disabled:opacity-40 disabled:hover:from-amber-600 disabled:hover:to-yellow-500"
                    >
                        <Coins className="w-4 h-4 text-black" />
                        Harvest Sunshine Yield (${totalClaimableDividends.toFixed(2)})
                    </button>
                </div>
            </div>

            {/* Weather Oracle Live Telemetry Strip */}
            <div className="mt-6 bg-[#09090e] border-2 border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Main Condition & Multiplier */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                            {weather.condition === 'PEAK_SUNSHINE' && <Sun className="w-10 h-10 text-amber-400 animate-spin" />}
                            {weather.condition === 'CLEAR_BLUE' && <Sun className="w-10 h-10 text-yellow-400" />}
                            {weather.condition === 'GOLDEN_HOUR' && <Sun className="w-10 h-10 text-orange-400" />}
                            {weather.condition === 'PARTLY_CLOUDY' && <CloudSun className="w-10 h-10 text-cyan-400" />}
                            {weather.condition === 'STORM_FRONT' && <CloudRain className="w-10 h-10 text-blue-400" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl md:text-3xl font-black text-white">{weather.temperatureF}°F</span>
                                <span className="text-sm font-mono text-zinc-400">({weather.temperatureC}°C)</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    {weather.conditionLabel}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 font-sans">
                                <span>Station: <strong className="text-white">{weather.city} Oracle</strong></span>
                                <span>•</span>
                                <span>Updated: <span className="font-mono text-zinc-300">{weather.lastUpdated}</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Meteorological Metric Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Solar Irradiance</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-base font-black text-amber-400">{weather.solarIrradiance}</span>
                                <span className="text-[10px] text-zinc-400">W/m²</span>
                            </div>
                            <span className="text-[9px] text-zinc-500">UV Index: {weather.uvIndex}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Sky Clearance</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-base font-black text-cyan-400">{100 - weather.cloudCoverPct}%</span>
                                <span className="text-[10px] text-zinc-400">Clear</span>
                            </div>
                            <span className="text-[9px] text-zinc-500">Humidity: {weather.humidityPct}%</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Barometric High</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-base font-black text-white">{weather.barometricPressureHpa}</span>
                                <span className="text-[10px] text-zinc-400">hPa</span>
                            </div>
                            <span className="text-[9px] text-zinc-500">Wind: {weather.windSpeedMph} mph</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Good Weather Multiplier</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-base font-black text-emerald-400">{weather.goodWeatherMultiplier}x</span>
                            </div>
                            <span className="text-[9px] text-emerald-500">Score: {weather.goodWeatherScore}/100</span>
                        </div>
                    </div>
                </div>

                {/* Weather Simulation Controls Bar */}
                <div className="mt-4 pt-3 border-t border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span>Simulate Meteorological Shift:</span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto">
                        <button
                            onClick={() => handleSimulateWeather('RADIANT_SUMMER')}
                            className="px-2.5 py-1 rounded bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 text-[10px] font-mono uppercase font-bold transition-all cursor-pointer whitespace-nowrap"
                        >
                            ☀️ Radiant Summer Solstice (2.18x)
                        </button>
                        <button
                            onClick={() => handleSimulateWeather('GOLDEN_CLEAR')}
                            className="px-2.5 py-1 rounded bg-yellow-950/40 hover:bg-yellow-900/60 border border-yellow-500/40 text-yellow-300 text-[10px] font-mono uppercase font-bold transition-all cursor-pointer whitespace-nowrap"
                        >
                            🌅 Golden Hour Sun (1.82x)
                        </button>
                        <button
                            onClick={() => handleSimulateWeather('TROPICAL_BREEZE')}
                            className="px-2.5 py-1 rounded bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono uppercase font-bold transition-all cursor-pointer whitespace-nowrap"
                        >
                            🏝️ Coastal Warmth (1.72x)
                        </button>
                        <button
                            onClick={() => handleSimulateWeather('PASSING_CLOUD')}
                            className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-mono uppercase font-bold transition-all cursor-pointer whitespace-nowrap"
                        >
                            ⛅ Passing Cloud (1.28x)
                        </button>
                        <button
                            onClick={() => handleSimulateWeather('STORM_OVERCAST')}
                            className="px-2.5 py-1 rounded bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 text-[10px] font-mono uppercase font-bold transition-all cursor-pointer whitespace-nowrap"
                        >
                            🌧️ Overcast Hedge Test (1.05x)
                        </button>
                    </div>
                </div>
            </div>

            {/* Digital Asset Holder Vault Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                {/* Total Portfolio Value */}
                <div className="bg-[#09090e] border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider block">
                            Total Portfolio Valuation
                        </span>
                        <div className="text-2xl md:text-3xl font-black text-white mt-1">
                            ${wallet.totalPortfolioValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500 font-sans">24h Net Gain:</span>
                        <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            +${wallet.portfolioChange24hUsd.toFixed(2)} (+{wallet.portfolioChange24hPct}%)
                        </span>
                    </div>
                </div>

                {/* Weather Alpha Bonus */}
                <div className="bg-[#09090e] border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider block">
                                Weather Alpha Surplus
                            </span>
                            <Sparkles className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-2xl md:text-3xl font-black text-amber-400 mt-1">
                            +${wallet.weatherAlphaBonusUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500 font-sans">Sunshine Multiplier:</span>
                        <span className="text-amber-400 font-mono font-bold">
                            {weather.goodWeatherMultiplier}x Active Yield
                        </span>
                    </div>
                </div>

                {/* Cash Balance in Vault */}
                <div className="bg-[#09090e] border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider block">
                                Vault Cash Reserves
                            </span>
                            <button
                                onClick={() => setShowDepositModal(true)}
                                className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                            >
                                + Deposit
                            </button>
                        </div>
                        <div className="text-2xl md:text-3xl font-black text-white mt-1">
                            ${wallet.cashBalanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500 font-sans">Dividends Collected:</span>
                        <span className="text-emerald-400 font-mono font-bold">
                            ${wallet.totalDividendsClaimedUsd.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Atmospheric Vault Identity */}
                <div className="bg-[#09090e] border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase font-black tracking-wider block">
                                Digital Asset Vault
                            </span>
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">
                                CUSTODY ACTIVE
                            </span>
                        </div>
                        <div className="text-xs font-mono font-bold text-zinc-300 mt-2 truncate max-w-[200px]">
                            {wallet.holderAddress}
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px]">
                        <button
                            onClick={handleCopyAddress}
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                        >
                            {copiedAddress ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedAddress ? 'Copied' : 'Copy Vault Address'}</span>
                        </button>
                        <span className="text-zinc-500 font-mono text-[10px]">AETHER_V3</span>
                    </div>
                </div>
            </div>

            {/* Stocks Tied to Good Weather */}
            <div className="mt-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                            <span>Weather-Bonded Share Stocks</span>
                            <span className="text-xs font-normal text-zinc-400">({wallet.stocks.length} instruments)</span>
                        </h2>
                        <p className="text-xs text-zinc-400 font-sans mt-0.5">
                            Equities whose revenue, dividend streams, and valuation formula expand with sustained clear skies and optimal temperatures.
                        </p>
                    </div>

                    {/* Sector Filters */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                        {['ALL', 'Solar & Clean Energy', 'Agrotech & Viticulture', 'Aviation & High-Ceiling Transit', 'Coastal Leisure & Hospitality', 'Wind & Microclimate Grid', 'Atmospheric Carbon Credits'].map(sector => (
                            <button
                                key={sector}
                                onClick={() => setSelectedSector(sector)}
                                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    selectedSector === sector
                                        ? 'bg-amber-600/30 border border-amber-500 text-amber-300'
                                        : 'bg-black/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                {sector === 'ALL' ? 'All Sectors' : sector.split('&')[0].trim()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stock Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStocks.map((stock) => {
                        const isPositive = stock.change24hPct >= 0;

                        return (
                            <div
                                key={stock.id}
                                className="bg-[#09090e] border border-zinc-850 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all group"
                            >
                                <div>
                                    {/* Ticker & Sector */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl p-2 rounded-xl bg-black/60 border border-zinc-800">
                                                {stock.iconEmoji}
                                            </span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-black text-white font-mono">{stock.symbol}</span>
                                                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                                                        {stock.sector.split('&')[0].trim()}
                                                    </span>
                                                </div>
                                                <h3 className="text-xs font-bold text-zinc-300 mt-0.5">{stock.name}</h3>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-base font-black text-white font-mono">
                                                ${stock.currentPrice.toFixed(2)}
                                            </div>
                                            <div className={`text-[11px] font-mono font-bold flex items-center justify-end gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                                <span>{isPositive ? '+' : ''}{stock.change24hPct}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Weather-Binding Metric & Formula */}
                                    <div className="mt-4 p-3 rounded-xl bg-black/70 border border-zinc-850">
                                        <div className="flex items-center justify-between text-[10px] font-mono">
                                            <span className="text-amber-400 font-bold uppercase">Weather Binding:</span>
                                            <span className="text-zinc-400">Beta: {stock.weatherSensitivityBeta}x</span>
                                        </div>
                                        <p className="text-[11px] text-zinc-300 font-sans mt-1 leading-relaxed">
                                            {stock.weatherBindingDescription}
                                        </p>
                                        <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/30 p-1.5 rounded border border-emerald-500/20 flex items-center justify-between">
                                            <span>Good Weather Target:</span>
                                            <span className="font-bold">{stock.targetGoodWeatherMetric}</span>
                                        </div>
                                    </div>

                                    {/* Dividend Yield Metrics */}
                                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                                        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-850">
                                            <span className="text-[9px] text-zinc-500 uppercase block">Weather Dividend</span>
                                            <div className="text-sm font-black text-amber-400 mt-0.5">
                                                {stock.effectiveWeatherDividendApy}% APY
                                            </div>
                                            <span className="text-[9px] text-zinc-500">Base: {stock.baseDividendApy}%</span>
                                        </div>

                                        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-850">
                                            <span className="text-[9px] text-zinc-500 uppercase block">Holdings ({stock.sharesHeld} sh)</span>
                                            <div className="text-sm font-black text-white mt-0.5">
                                                ${stock.totalValueUsd.toFixed(2)}
                                            </div>
                                            <span className="text-[9px] text-emerald-400 font-bold">
                                                +${stock.accruedWeatherDividendsUsd.toFixed(2)} uncollected
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Trade Actions */}
                                <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setActiveTradeStock(stock);
                                            setTradeMode('BUY');
                                            setTradeShares(5);
                                        }}
                                        className="flex-1 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                                    >
                                        Buy Shares
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTradeStock(stock);
                                            setTradeMode('SELL');
                                            setTradeShares(Math.min(stock.sharesHeld, 5));
                                        }}
                                        disabled={stock.sharesHeld <= 0}
                                        className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-zinc-300 disabled:opacity-30 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                                    >
                                        Sell
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Parametric Weather Bonds & Climate Derivatives Section */}
            <div className="mt-8 bg-[#09090e] border border-zinc-850 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                            <span>Parametric Climate Bonds & Good-Weather Derivatives</span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                ORACLE SETTLED
                            </span>
                        </h2>
                        <p className="text-xs text-zinc-400 font-sans mt-0.5">
                            Automated parametric smart bonds that pay lump-sum cash payouts when atmospheric metrics achieve verified good weather strikes.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {wallet.parametricBonds.map((bond) => (
                        <div 
                            key={bond.id}
                            className="p-4 rounded-xl bg-black/60 border border-zinc-800 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">{bond.underlyingMetric}</span>
                                    {bond.isTriggered ? (
                                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                            STRIKE TRIGGERED
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-amber-400" />
                                            RUNNING
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xs font-bold text-white mt-1.5">{bond.title}</h3>
                                
                                <div className="mt-3 space-y-1 text-[11px] font-sans">
                                    <div className="text-zinc-400">
                                        <span className="font-mono text-[10px] text-zinc-500 uppercase block">Strike Condition:</span>
                                        <span className="text-zinc-300">{bond.strikeThreshold}</span>
                                    </div>
                                    <div className="text-zinc-400 pt-1">
                                        <span className="font-mono text-[10px] text-zinc-500 uppercase block">Current Reading:</span>
                                        <span className="font-mono text-amber-400 font-bold">{bond.currentObservedValue}</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3">
                                    <div className="flex justify-between text-[10px] font-mono mb-1">
                                        <span className="text-zinc-500">Progress</span>
                                        <span className="text-cyan-400">{bond.progressPct}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${bond.isTriggered ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-cyan-400'}`}
                                            style={{ width: `${bond.progressPct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between">
                                <div>
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Payout Value</span>
                                    <span className="text-base font-black font-mono text-white">
                                        ${bond.payoutPotentialUsd.toLocaleString()}
                                    </span>
                                </div>

                                {bond.isTriggered && bond.payoutPotentialUsd > 0 ? (
                                    <button
                                        onClick={() => handleTriggerBondPayout(bond.id)}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                    >
                                        Claim Payout
                                    </button>
                                ) : (
                                    <span className="text-[10px] font-mono text-zinc-500">
                                        {bond.payoutPotentialUsd === 0 ? 'SETTLED' : `Underwritten by ${bond.insurer.split(' ')[0]}`}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Holder Transaction & Settlement Ledger */}
            <div className="mt-8 bg-[#09090e] border border-zinc-850 rounded-2xl p-6">
                <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">
                    Atmospheric Custody Vault Ledger
                </h3>
                <div className="divide-y divide-zinc-850 font-mono text-xs">
                    {wallet.transactionLog.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                    tx.type === 'WEATHER_DIVIDEND_PAYOUT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                    tx.type === 'PARAMETRIC_STRIKE_WIN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                    tx.type === 'BUY' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                    'bg-zinc-800 text-zinc-300'
                                }`}>
                                    {tx.type.replace(/_/g, ' ')}
                                </span>
                                <span className="text-zinc-300 font-sans text-xs">{tx.note}</span>
                            </div>
                            <div className="flex items-center gap-4 shrink-0 text-right">
                                <span className="font-bold text-white">${tx.amountUsd.toFixed(2)}</span>
                                <span className="text-[10px] text-zinc-500">{tx.timestamp}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trade Modal */}
            <AnimatePresence>
                {activeTradeStock && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#09090e] border-2 border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.2)] font-mono text-zinc-200"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-2xl">{activeTradeStock.iconEmoji}</span>
                                    <div>
                                        <h3 className="text-base font-black text-white">{activeTradeStock.name}</h3>
                                        <span className="text-xs text-amber-400 font-bold">{activeTradeStock.symbol} • ${activeTradeStock.currentPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTradeStock(null)}
                                    className="p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Buy / Sell Tab */}
                            <div className="flex gap-2 mt-4 p-1 rounded-xl bg-black border border-zinc-800">
                                <button
                                    onClick={() => setTradeMode('BUY')}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                                        tradeMode === 'BUY' ? 'bg-emerald-600 text-white' : 'text-zinc-400'
                                    }`}
                                >
                                    Buy Shares
                                </button>
                                <button
                                    onClick={() => setTradeMode('SELL')}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                                        tradeMode === 'SELL' ? 'bg-rose-600 text-white' : 'text-zinc-400'
                                    }`}
                                >
                                    Sell Shares
                                </button>
                            </div>

                            {/* Share Quantity Input */}
                            <div className="mt-4 space-y-3">
                                <div>
                                    <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                                        Quantity of Shares:
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            max={tradeMode === 'SELL' ? activeTradeStock.sharesHeld : 500}
                                            value={tradeShares}
                                            onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white font-mono text-base focus:outline-none focus:border-amber-500"
                                        />
                                        <div className="flex gap-1">
                                            {[1, 5, 10, 25].map((n) => (
                                                <button
                                                    key={n}
                                                    onClick={() => setTradeShares(n)}
                                                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] font-bold cursor-pointer"
                                                >
                                                    +{n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 space-y-1.5 text-xs font-sans">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Price per share:</span>
                                        <span className="font-mono text-white font-bold">${activeTradeStock.currentPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Weather Multiplier:</span>
                                        <span className="font-mono text-amber-400 font-bold">{weather.goodWeatherMultiplier}x Boost</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Effective Weather Yield:</span>
                                        <span className="font-mono text-emerald-400 font-bold">{activeTradeStock.effectiveWeatherDividendApy}% APY</span>
                                    </div>
                                    <div className="pt-2 border-t border-zinc-800 flex justify-between font-bold">
                                        <span className="text-zinc-200">Total Transaction Cost:</span>
                                        <span className="font-mono text-amber-300 text-sm">
                                            ${(activeTradeStock.currentPrice * tradeShares).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {tradeMessage && (
                                    <div className={`p-2.5 rounded-lg text-xs font-mono font-bold ${
                                        tradeMessage.type === 'success' ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/50 text-rose-300 border border-rose-500/40'
                                    }`}>
                                        {tradeMessage.text}
                                    </div>
                                )}
                            </div>

                            {/* Execution Button */}
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setActiveTradeStock(null)}
                                    className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExecuteTrade}
                                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer shadow-lg ${
                                        tradeMode === 'BUY'
                                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                                    }`}
                                >
                                    Confirm {tradeMode}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Deposit Cash Modal */}
            <AnimatePresence>
                {showDepositModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#09090e] border-2 border-emerald-500/40 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(16,185,129,0.2)] font-mono text-zinc-200"
                        >
                            <h3 className="text-base font-black text-white uppercase tracking-wider">Deposit into Vault</h3>
                            <p className="text-xs text-zinc-400 font-sans mt-1">
                                Add liquidity to your Sovereign Atmospheric Vault to fund weather-bound share purchases.
                            </p>

                            <div className="mt-4">
                                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Deposit Amount ($USD):</label>
                                <input
                                    type="number"
                                    min="100"
                                    step="100"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(Math.max(10, parseInt(e.target.value) || 0))}
                                    className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-xl text-white font-mono text-base focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex gap-2 mt-3">
                                {[1000, 2500, 5000, 10000].map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => setDepositAmount(amt)}
                                        className="flex-1 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] font-mono font-bold cursor-pointer"
                                    >
                                        +${amt}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setShowDepositModal(false)}
                                    className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeposit}
                                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
                                >
                                    Confirm Deposit
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
