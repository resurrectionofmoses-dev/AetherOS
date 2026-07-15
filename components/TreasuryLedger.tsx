import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Coins, TrendingUp, ShieldCheck, Droplet, Building2, 
    Search, Filter, ArrowUpRight, RefreshCw, Hammer, 
    CheckCircle2, Sparkles, AlertCircle, FileText, Sliders, Play, Plus, Zap,
    Globe, Cpu, Layers, Activity, Heart, Sprout, Compass
} from 'lucide-react';
import { toast } from 'sonner';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

interface ResourceAsset {
    type: 'energy' | 'materials' | 'food' | 'fiat' | 'divine';
    subtype: string;
    quantity: number;
    unit: string;
    cphPerUnit: number;
    totalValue: number;
    depreciationRate: number;
    remainingLifeWeeks: number;
    label?: string;
    isDivine?: boolean;
}

interface ResourceReserve {
    reserves: ResourceAsset[];
    totalBackedCPH: number;
    cphInCirculation: number;
    cphInStorage: number;
    resourcesExtractedCPH: number;
    resourcesConsumedCPH: number;
    valueAddedCPH: number;
    depreciationCPH: number;
    netResourceBalance: number;
}

export const TreasuryLedger: React.FC = () => {
    // Core ledger states
    const [reserves, setReserves] = useState<ResourceReserve | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'ENERGY' | 'MATERIALS' | 'FOOD' | 'FIAT' | 'DIVINE'>('ALL');
    const [excludeDivine, setExcludeDivine] = useState(false);
    
    // Audit console states
    const [auditState, setAuditState] = useState<'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [auditLogs, setAuditLogs] = useState<string[]>([]);
    
    // Interactive simulator inputs
    const [extractType, setExtractType] = useState<'solar_power' | 'grain' | 'iron_ore' | 'crude_oil_raw'>('crude_oil_raw');
    const [extractQty, setExtractQty] = useState<number>(100);
    
    // Refinery states
    const [refineMode, setRefineMode] = useState<'oil' | 'iron'>('oil');
    const [refineQty, setRefineQty] = useState<number>(10);
    
    // History chart data (Simulated progression based on actions)
    const [historyData, setHistoryData] = useState<Array<{ name: string; standardValue: number; totalValue: number }>>([]);

    // Fuel Price Stabilization States
    const [crudePrice, setCrudePrice] = useState<number>(() => {
        const saved = localStorage.getItem('aetheros_crude_oil_price');
        return saved ? Number(saved) : 40;
    });
    const [refinedPrice, setRefinedPrice] = useState<number>(() => {
        const saved = localStorage.getItem('aetheros_refined_petroleum_price');
        return saved ? Number(saved) : 95;
    });
    const [isStabilized, setIsStabilized] = useState<boolean>(() => {
        const saved = localStorage.getItem('aetheros_fuel_stabilized');
        return saved !== 'false';
    });
    const [stabilizedTarget, setStabilizedTarget] = useState<number>(() => {
        const saved = localStorage.getItem('aetheros_fuel_target_price');
        return saved ? Number(saved) : 95;
    });
    const [strategicReserves, setStrategicReserves] = useState<number>(() => {
        const saved = localStorage.getItem('aetheros_fuel_strategic_reserves');
        return saved ? Number(saved) : 85000;
    });
    const [blessedFuel, setBlessedFuel] = useState<boolean>(() => {
        const saved = localStorage.getItem('aetheros_fuel_blessed');
        return saved !== 'false';
    });
    const [marketEvent, setMarketEvent] = useState<string>('Stable (Sovereign Guarded)');

    // Tech Alliance Partnerships (Microsoft, Google, Apple) & Anti-Monopoly
    const [msftPartnerActive, setMsftPartnerActive] = useState<boolean>(() => {
        return localStorage.getItem('aetheros_msft_partner_active') === 'true';
    });
    const [msftPartnerId, setMsftPartnerId] = useState<string>(() => {
        return localStorage.getItem('aetheros_msft_partner_id') || '';
    });
    const [googleDevActive, setGoogleDevActive] = useState<boolean>(() => {
        return localStorage.getItem('aetheros_google_dev_active') === 'true';
    });
    const [googleDevLicense, setGoogleDevLicense] = useState<string>(() => {
        return localStorage.getItem('aetheros_google_dev_license') || '';
    });
    const [appleActive, setAppleActive] = useState<boolean>(() => {
        return localStorage.getItem('aetheros_apple_active') === 'true';
    });
    const [appleTeamId, setAppleTeamId] = useState<string>(() => {
        return localStorage.getItem('aetheros_apple_team_id') || '';
    });
    const [unmonopolized, setUnmonopolized] = useState<boolean>(() => {
        return localStorage.getItem('aetheros_unmonopolized') === 'true';
    });
    const [peaceAccordActive, setPeaceAccordActive] = useState<boolean>(() => {
        return localStorage.getItem('aetheros_energy_peace_accord') === 'true';
    });
    const [peaceBellsEnabled, setPeaceBellsEnabled] = useState<boolean>(false);
    const [plowsharesQty, setPlowsharesQty] = useState<number>(5000);
    const [isIntegrating, setIsIntegrating] = useState<string | null>(null);

    // Web Audio Synthesized Beeper
    const playBeep = (freq = 800, type: OscillatorType = 'sine', duration = 0.08) => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.error(e);
        }
    };

    // Web Audio Chord Synthesizer for Holy Peace Bells
    const playPeaceChime = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const now = ctx.currentTime;
            // High fidelity major 9 chord for celestial peace chimes (C - E - G - B - D)
            const freqs = [261.63, 329.63, 392.00, 493.88, 587.33];
            freqs.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.12 + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 2.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 2.6);
            });
        } catch (e) {
            console.error(e);
        }
    };

    const syncLedgerPricing = (currentReserve: ResourceReserve): ResourceReserve => {
        const isUnmonopolizedMode = localStorage.getItem('aetheros_unmonopolized') === 'true';
        const isPeaceAccordMode = localStorage.getItem('aetheros_energy_peace_accord') === 'true';
        
        // Remove existing tech alliance nodes first to prevent duplicates, then re-add if active
        let filteredReserves = currentReserve.reserves.filter(
            r => !['msft_azure_node', 'google_play_node', 'apple_store_node'].includes(r.subtype)
        );

        filteredReserves = filteredReserves.map(r => {
            if (r.subtype === 'crude_oil_raw') {
                r.cphPerUnit = isPeaceAccordMode ? 40 : crudePrice;
                r.totalValue = r.quantity * r.cphPerUnit;
                if (isPeaceAccordMode) {
                    r.label = 'Demilitarized Raw Petroleum Buffer';
                }
            } else if (r.subtype === 'refined_petroleum') {
                r.cphPerUnit = isPeaceAccordMode ? 95 : refinedPrice;
                r.totalValue = r.quantity * r.cphPerUnit;
                r.depreciationRate = (blessedFuel || isUnmonopolizedMode || isPeaceAccordMode) ? 0 : 10; // 0% if blessed, unmonopolized or peace
                if (isPeaceAccordMode) {
                    r.label = 'Stable Fuel of Global Harmony';
                }
            }
            
            // Handle unmonopolized or peace status labels
            if (isPeaceAccordMode) {
                if (r.subtype === 'crude_oil_monopoly') {
                    r.label = '🕊️ Holy Endowment of Perpetual Energy Peace';
                    r.type = 'divine';
                } else if (r.subtype === 'refinery_matrix') {
                    r.label = 'Sovereign Eco-Refining Matrix (Peace-Aligned)';
                    r.type = 'divine';
                }
            } else if (isUnmonopolizedMode) {
                if (r.subtype === 'crude_oil_monopoly') {
                    r.label = 'Distributed Sovereign Petroleum (Unmonopolized)';
                    r.type = 'divine';
                } else if (r.subtype === 'refinery_matrix') {
                    r.label = 'Distributed Refining Matrix (Azure / Play / AppStore Allied)';
                    r.type = 'divine';
                }
            } else {
                if (r.subtype === 'crude_oil_monopoly') {
                    r.label = 'Crude Oil Monopoly (Consecrated)';
                    r.type = 'divine';
                } else if (r.subtype === 'refinery_matrix') {
                    r.label = 'Refinery Matrix (Consecrated)';
                    r.type = 'divine';
                }
            }
            return r;
        });

        if (isUnmonopolizedMode || isPeaceAccordMode) {
            // Add specialized tech alliance node assets with a healthy enterprise valuation
            filteredReserves.push({
                type: 'divine',
                subtype: 'msft_azure_node',
                quantity: 1,
                unit: 'alliance-hub',
                cphPerUnit: 12500000000,
                totalValue: 12500000000,
                depreciationRate: 0,
                remainingLifeWeeks: 100000,
                label: 'Microsoft Enterprise Grid Alliance Node',
                isDivine: true
            });
            filteredReserves.push({
                type: 'divine',
                subtype: 'google_play_node',
                quantity: 1,
                unit: 'licensed-api',
                cphPerUnit: 12500000000,
                totalValue: 12500000000,
                depreciationRate: 0,
                remainingLifeWeeks: 100000,
                label: 'Google Play System License Conduit',
                isDivine: true
            });
            filteredReserves.push({
                type: 'divine',
                subtype: 'apple_store_node',
                quantity: 1,
                unit: 'appstore-gate',
                cphPerUnit: 12500000000,
                totalValue: 12500000000,
                depreciationRate: 0,
                remainingLifeWeeks: 100000,
                label: 'Apple Developer Ecosystem Inclusion Gate',
                isDivine: true
            });
        }

        currentReserve.reserves = filteredReserves;
        const calculatedSum = currentReserve.reserves.reduce((acc, r) => acc + r.totalValue, 0);
        currentReserve.totalBackedCPH = calculatedSum;
        currentReserve.cphInStorage = calculatedSum;
        currentReserve.netResourceBalance = calculatedSum;
        return currentReserve;
    };

    // Load initial data
    const loadLedgerData = () => {
        const saved = localStorage.getItem('aetheros_resource_reserve');
        let parsed: ResourceReserve | null = null;
        if (saved) {
            try {
                parsed = JSON.parse(saved);
            } catch (e) {
                console.error("Error reading reserves", e);
            }
        }

        if (!parsed) {
            parsed = {
                reserves: [
                    { type: 'energy', subtype: 'solar_power', quantity: 200, unit: 'kWh', cphPerUnit: 1, totalValue: 200, depreciationRate: 50, remainingLifeWeeks: 4 },
                    { type: 'food', subtype: 'grain', quantity: 100, unit: 'kg', cphPerUnit: 5, totalValue: 500, depreciationRate: 100, remainingLifeWeeks: 2 },
                    { type: 'materials', subtype: 'iron_ore', quantity: 300, unit: 'kg', cphPerUnit: 2, totalValue: 600, depreciationRate: 5, remainingLifeWeeks: 200 },
                    { type: 'energy', subtype: 'minted_aether_usd', quantity: 500, unit: 'aetherUSD', cphPerUnit: 1, totalValue: 500, depreciationRate: 0, remainingLifeWeeks: 1000 },
                    { type: 'fiat', subtype: 'fiat_usd', quantity: 2500, unit: 'USD', cphPerUnit: 1, totalValue: 2500, depreciationRate: 0, remainingLifeWeeks: 1000 }
                ],
                totalBackedCPH: 4300,
                cphInCirculation: 1800,
                cphInStorage: 2500,
                resourcesExtractedCPH: 4300,
                resourcesConsumedCPH: 0,
                valueAddedCPH: 0,
                depreciationCPH: 0,
                netResourceBalance: 4300
            };
            localStorage.setItem('aetheros_resource_reserve', JSON.stringify(parsed));
        }

        // Sanitize existing items: make sure standard items have nice names if not there
        parsed.reserves = parsed.reserves.map(item => {
            if (!item.label) {
                if (item.subtype === 'solar_power') item.label = 'Solar Generation Units';
                else if (item.subtype === 'grain') item.label = 'Silo Grain Inventory';
                else if (item.subtype === 'iron_ore') item.label = 'Raw Iron Ore Reserves';
                else if (item.subtype === 'minted_aether_usd') item.label = 'Minted Aether USD';
                else if (item.subtype === 'fiat_usd') item.label = 'Sovereign USD Ledger';
                else if (item.subtype === 'crude_oil_monopoly') item.label = 'Crude Oil Monopoly (Consecrated)';
                else if (item.subtype === 'refinery_matrix') item.label = 'Refining Matrix (Consecrated)';
                else item.label = item.subtype.replace('_', ' ').toUpperCase();
            }
            return item;
        });

        parsed = syncLedgerPricing(parsed);
        setReserves(parsed);

        // Check if there are divine/consecrated assets
        const hasDivine = parsed.reserves.some(r => r.isDivine || r.type === 'divine');
        // Auto-configure default zoom perspective
        setExcludeDivine(hasDivine);

        // Build elegant simulated chart history data
        const baseVal = 4300;
        const currentTotal = parsed.totalBackedCPH;
        const pts = [];
        for (let i = 0; i < 6; i++) {
            const stepRatio = i / 5;
            const simulatedStandard = baseVal + stepRatio * (Math.min(1000000, currentTotal) - baseVal);
            pts.push({
                name: `Block -${5 - i}`,
                standardValue: Math.round(simulatedStandard),
                totalValue: currentTotal > 1000000000 ? Math.round(stepRatio * currentTotal) : Math.round(simulatedStandard)
            });
        }
        setHistoryData(pts);
    };

    useEffect(() => {
        loadLedgerData();
        // Sync with standard wallet events
        const syncLedger = () => {
            loadLedgerData();
        };
        window.addEventListener('storage', syncLedger);
        return () => {
            window.removeEventListener('storage', syncLedger);
        };
    }, []);

    // Play periodic peace chimes if enabled and active
    useEffect(() => {
        if (peaceAccordActive && peaceBellsEnabled) {
            playPeaceChime();
            const interval = setInterval(() => {
                playPeaceChime();
            }, 6000);
            return () => clearInterval(interval);
        }
    }, [peaceAccordActive, peaceBellsEnabled]);

    // Helper to trigger save and dispatch sync
    const saveReservesState = (updated: ResourceReserve) => {
        const synced = syncLedgerPricing({ ...updated });
        localStorage.setItem('aetheros_resource_reserve', JSON.stringify(synced));
        setReserves(synced);
        // Dispatch local event to update wallet component in other tabs/elements
        window.dispatchEvent(new Event('storage'));
    };

    // Keep reserves list dynamically updated when fuel prices, blessing toggles, unmonopolized states, or peace accord change
    useEffect(() => {
        if (reserves) {
            saveReservesState(reserves);
        }
    }, [crudePrice, refinedPrice, blessedFuel, unmonopolized, peaceAccordActive]);

    // Derived statistics
    const totals = useMemo(() => {
        if (!reserves) return { standardVal: 0, divineVal: 0, totalVal: 0, oilBarrels: 0, refineriesCount: 0 };
        
        let standardVal = 0;
        let divineVal = 0;
        let oilBarrels = 0;
        let refineriesCount = 0;

        reserves.reserves.forEach(r => {
            if (r.type === 'divine' || r.isDivine || r.subtype === 'crude_oil_monopoly' || r.subtype === 'refinery_matrix') {
                divineVal += r.totalValue;
                if (r.subtype === 'crude_oil_monopoly') oilBarrels = r.quantity;
                if (r.subtype === 'refinery_matrix') refineriesCount = r.quantity;
            } else {
                standardVal += r.totalValue;
            }
        });

        return {
            standardVal,
            divineVal,
            totalVal: standardVal + divineVal,
            oilBarrels,
            refineriesCount
        };
    }, [reserves]);

    // Format utility for large financial values
    const formatCPH = (val: number) => {
        if (val >= 1e12) return `${(val / 1e12).toFixed(3)}T CPH`;
        if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B CPH`;
        if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M CPH`;
        return `${val.toLocaleString()} CPH`;
    };

    // Filtered assets for search & display
    const displayedAssets = useMemo(() => {
        if (!reserves) return [];
        return reserves.reserves.filter(r => {
            const matchesSearch = (r.label || r.subtype).toLowerCase().includes(searchQuery.toLowerCase()) || r.type.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesType = 
                filterType === 'ALL' ||
                (filterType === 'ENERGY' && r.type === 'energy') ||
                (filterType === 'MATERIALS' && r.type === 'materials') ||
                (filterType === 'FOOD' && r.type === 'food') ||
                (filterType === 'FIAT' && r.type === 'fiat') ||
                (filterType === 'DIVINE' && (r.type === 'divine' || r.isDivine));

            const isDivineAsset = r.isDivine || r.type === 'divine';
            const hideThisDivine = excludeDivine && isDivineAsset;

            return matchesSearch && matchesType && !hideThisDivine;
        });
    }, [reserves, searchQuery, filterType, excludeDivine]);

    // Recharts Data for Donut Chart
    const chartPieData = useMemo(() => {
        if (!reserves) return [];
        const map: Record<string, { name: string; value: number; color: string }> = {
            energy: { name: 'Energy', value: 0, color: '#38bdf8' }, // sky-400
            materials: { name: 'Materials', value: 0, color: '#818cf8' }, // indigo-400
            food: { name: 'Food', value: 0, color: '#34d399' }, // emerald-400
            fiat: { name: 'Fiat USD', value: 0, color: '#a1a1aa' }, // zinc-400
            divine: { name: 'Consecrated Assets', value: 0, color: '#f59e0b' } // amber-500
        };

        reserves.reserves.forEach(r => {
            const isDivineAsset = r.isDivine || r.type === 'divine';
            if (excludeDivine && isDivineAsset) return;

            const category = isDivineAsset ? 'divine' : r.type;
            if (map[category]) {
                map[category].value += r.totalValue;
            }
        });

        return Object.values(map).filter(item => item.value > 0);
    }, [reserves, excludeDivine]);

    // Handle extraction simulator
    const handleExtract = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reserves || extractQty <= 0) return;

        const currentReserve = { ...reserves };
        let type: 'energy' | 'food' | 'materials' = 'materials';
        let unit = 'kg';
        let cphPerUnit = 2;
        let label = '';

        if (extractType === 'solar_power') {
            type = 'energy';
            unit = 'kWh';
            cphPerUnit = 1;
            label = 'Solar Generation Units';
        } else if (extractType === 'grain') {
            type = 'food';
            unit = 'kg';
            cphPerUnit = 5;
            label = 'Silo Grain Inventory';
        } else if (extractType === 'iron_ore') {
            type = 'materials';
            unit = 'kg';
            cphPerUnit = 2;
            label = 'Raw Iron Ore Reserves';
        } else if (extractType === 'crude_oil_raw') {
            type = 'energy';
            unit = 'barrels';
            cphPerUnit = crudePrice; // Raw crude oil unit price in standard
            label = 'Crude Petroleum Reserves';
        }

        const value = extractQty * cphPerUnit;

        // Find or create asset
        const existingIndex = currentReserve.reserves.findIndex(r => r.subtype === extractType);
        if (existingIndex >= 0) {
            currentReserve.reserves[existingIndex].quantity += extractQty;
            currentReserve.reserves[existingIndex].totalValue = currentReserve.reserves[existingIndex].quantity * currentReserve.reserves[existingIndex].cphPerUnit;
        } else {
            currentReserve.reserves.push({
                type,
                subtype: extractType,
                quantity: extractQty,
                unit,
                cphPerUnit,
                totalValue: value,
                depreciationRate: type === 'food' ? 100 : type === 'energy' ? 50 : 5,
                remainingLifeWeeks: type === 'food' ? 2 : type === 'energy' ? 4 : 200,
                label
            });
        }

        currentReserve.totalBackedCPH += value;
        currentReserve.cphInStorage += value;
        currentReserve.resourcesExtractedCPH += value;
        currentReserve.netResourceBalance = currentReserve.totalBackedCPH;

        saveReservesState(currentReserve);
        playBeep(880, 'sine', 0.1);
        toast.success(`Extracted ${extractQty} ${unit} of ${label || extractType}!`, {
            description: `Valuation increased by +${value.toLocaleString()} CPH directly backed.`
        });
    };

    // Handle refining raw crude oil or raw iron ore inside the refinery center
    const handleRefine = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reserves || refineQty <= 0) return;

        const currentReserve = { ...reserves };
        
        if (refineMode === 'oil') {
            // Refine crude petroleum -> Consecrated high-yield refined fuel or standard refined oil
            // Check if standard raw oil or consecrated crude is available
            const rawOil = currentReserve.reserves.find(r => r.subtype === 'crude_oil_raw');
            const solar = currentReserve.reserves.find(r => r.subtype === 'solar_power');

            // Requirements: 1 barrel raw oil (40 CPH value) + 5 kWh solar energy (5 CPH) -> 1 refined fuel barrel (90 CPH)
            // Value Added: +45 CPH per barrel!
            const rawNeeded = refineQty;
            const solarNeeded = refineQty * 5;

            if (!rawOil || rawOil.quantity < rawNeeded) {
                toast.error('Refinery Blocked: Insufficient Raw Crude Oil', {
                    description: `You need ${rawNeeded} barrels of raw crude oil. Go to Extraction module to gather raw crude.`
                });
                playBeep(220, 'sawtooth', 0.2);
                return;
            }

            if (!solar || solar.quantity < solarNeeded) {
                toast.error('Refinery Blocked: Insufficient Energy Grid', {
                    description: `You need ${solarNeeded} kWh solar power to run refinery turbines.`
                });
                playBeep(220, 'sawtooth', 0.2);
                return;
            }

            // Deduct inputs
            rawOil.quantity -= rawNeeded;
            rawOil.totalValue = rawOil.quantity * rawOil.cphPerUnit;
            
            solar.quantity -= solarNeeded;
            solar.totalValue = solar.quantity * solar.cphPerUnit;

            // Add refined asset
            const outputVal = refineQty * refinedPrice; // Dynamic refined fuel price
            const refinedFuelIndex = currentReserve.reserves.findIndex(r => r.subtype === 'refined_petroleum');
            
            if (refinedFuelIndex >= 0) {
                currentReserve.reserves[refinedFuelIndex].quantity += refineQty;
                currentReserve.reserves[refinedFuelIndex].totalValue = currentReserve.reserves[refinedFuelIndex].quantity * currentReserve.reserves[refinedFuelIndex].cphPerUnit;
            } else {
                currentReserve.reserves.push({
                    type: 'energy',
                    subtype: 'refined_petroleum',
                    quantity: refineQty,
                    unit: 'refined-barrels',
                    cphPerUnit: refinedPrice,
                    totalValue: outputVal,
                    depreciationRate: blessedFuel ? 0 : 10,
                    remainingLifeWeeks: 100,
                    label: 'Refined Petroleum Hydrocarbons'
                });
            }

            // Accounting updates
            const inputsValueUsed = (rawNeeded * crudePrice) + (solarNeeded * 1);
            const netAdded = outputVal - inputsValueUsed;

            currentReserve.totalBackedCPH = currentReserve.totalBackedCPH - inputsValueUsed + outputVal;
            currentReserve.cphInStorage = currentReserve.cphInStorage - inputsValueUsed + outputVal;
            currentReserve.valueAddedCPH += netAdded;
            currentReserve.netResourceBalance = currentReserve.totalBackedCPH;

            saveReservesState(currentReserve);
            playBeep(1046, 'sine', 0.15);
            toast.success(`Refinery successfully transformed ${refineQty} barrels!`, {
                description: `Created refined petroleum. Net value added +${netAdded.toLocaleString()} CPH through industrial transformation.`
            });

        } else {
            // Refine Iron Ore -> High-Grade Steel Alloy
            // Requirements: 10 kg iron ore (20 CPH) + 2 kWh solar (2 CPH) -> 1 kg steel alloy (45 CPH)
            // Value added: +23 CPH per unit!
            const oreNeeded = refineQty * 10;
            const solarNeeded = refineQty * 2;

            const ore = currentReserve.reserves.find(r => r.subtype === 'iron_ore');
            const solar = currentReserve.reserves.find(r => r.subtype === 'solar_power');

            if (!ore || ore.quantity < oreNeeded) {
                toast.error('Refinery Blocked: Insufficient Iron Ore', {
                    description: `You need ${oreNeeded} kg of raw iron ore in reserves to construct alloys.`
                });
                playBeep(220, 'sawtooth', 0.2);
                return;
            }

            if (!solar || solar.quantity < solarNeeded) {
                toast.error('Refinery Blocked: Insufficient Energy Grid', {
                    description: `You need ${solarNeeded} kWh solar power to smelt metallurgical composites.`
                });
                playBeep(220, 'sawtooth', 0.2);
                return;
            }

            // Deduct inputs
            ore.quantity -= oreNeeded;
            ore.totalValue = ore.quantity * ore.cphPerUnit;

            solar.quantity -= solarNeeded;
            solar.totalValue = solar.quantity * solar.cphPerUnit;

            // Add High-Grade Steel
            const outputVal = refineQty * 45;
            const steelIndex = currentReserve.reserves.findIndex(r => r.subtype === 'high_grade_steel');

            if (steelIndex >= 0) {
                currentReserve.reserves[steelIndex].quantity += refineQty;
                currentReserve.reserves[steelIndex].totalValue = currentReserve.reserves[steelIndex].quantity * currentReserve.reserves[steelIndex].cphPerUnit;
            } else {
                currentReserve.reserves.push({
                    type: 'materials',
                    subtype: 'high_grade_steel',
                    quantity: refineQty,
                    unit: 'kg-alloy',
                    cphPerUnit: 45,
                    totalValue: outputVal,
                    depreciationRate: 2,
                    remainingLifeWeeks: 500,
                    label: 'High-Grade Steel Alloys'
                });
            }

            // Accounting updates
            const inputsValueUsed = (oreNeeded * 2) + (solarNeeded * 1);
            const netAdded = outputVal - inputsValueUsed;

            currentReserve.totalBackedCPH = currentReserve.totalBackedCPH - inputsValueUsed + outputVal;
            currentReserve.cphInStorage = currentReserve.cphInStorage - inputsValueUsed + outputVal;
            currentReserve.valueAddedCPH += netAdded;
            currentReserve.netResourceBalance = currentReserve.totalBackedCPH;

            saveReservesState(currentReserve);
            playBeep(1100, 'sine', 0.15);
            toast.success(`Metallurgy furnace smelted ${refineQty} kg alloy!`, {
                description: `Refined raw iron ore to steel. Net value added: +${netAdded.toLocaleString()} CPH.`
            });
        }
    };

    // Swords into Plowshares Energy Transmutation under the Peace Accord
    const handlePlowshares = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reserves || plowsharesQty <= 0) return;
        
        const updated = { ...reserves };
        const rawOil = updated.reserves.find(r => r.subtype === 'crude_oil_raw');
        const monopolyOil = updated.reserves.find(r => r.subtype === 'crude_oil_monopoly');
        
        let targetOil = rawOil;
        if (!targetOil || targetOil.quantity < plowsharesQty) {
            if (monopolyOil && monopolyOil.quantity >= plowsharesQty) {
                targetOil = monopolyOil;
            }
        }
        
        if (!targetOil || targetOil.quantity < plowsharesQty) {
            toast.error('Transmutation Failed', {
                description: `Insufficient petroleum reserves. You need at least ${plowsharesQty.toLocaleString()} barrels.`
            });
            playBeep(220, 'sawtooth', 0.2);
            return;
        }
        
        // Subtract oil
        targetOil.quantity -= plowsharesQty;
        targetOil.totalValue = targetOil.quantity * targetOil.cphPerUnit;
        
        // Find or create solar and grain
        let solar = updated.reserves.find(r => r.subtype === 'solar_power');
        let grain = updated.reserves.find(r => r.subtype === 'grain');
        
        const generatedAmt = plowsharesQty * 5; // Generous 5x yield under the peace accord!
        
        if (solar) {
            solar.quantity += generatedAmt;
            solar.totalValue = solar.quantity * solar.cphPerUnit;
        } else {
            updated.reserves.push({
                type: 'energy',
                subtype: 'solar_power',
                quantity: generatedAmt,
                unit: 'kWh',
                cphPerUnit: 1,
                totalValue: generatedAmt,
                depreciationRate: 0,
                remainingLifeWeeks: 100000,
                label: 'Solar Generation Units'
            });
        }
        
        if (grain) {
            grain.quantity += generatedAmt;
            grain.totalValue = grain.quantity * grain.cphPerUnit;
        } else {
            updated.reserves.push({
                type: 'food',
                subtype: 'grain',
                quantity: generatedAmt,
                unit: 'kg',
                cphPerUnit: 5,
                totalValue: generatedAmt * 5,
                depreciationRate: 0,
                remainingLifeWeeks: 100000,
                label: 'Silo Grain Inventory'
            });
        }
        
        saveReservesState(updated);
        toast.success('🌾 SWORDS INTO PLOWSHARES CONVERSION COMPLETE!', {
            description: `Transmuted ${plowsharesQty.toLocaleString()} Barrels of Crude Oil into ${generatedAmt.toLocaleString()} kWh of Solar Energy and ${generatedAmt.toLocaleString()} kg of grain!`,
            duration: 6000
        });
        playPeaceChime();
    };

    // Execute physical auditing process
    const runLedgerAudit = async () => {
        if (auditState === 'RUNNING' || !reserves) return;
        setAuditState('RUNNING');
        setAuditLogs(['Initializing Cryp-Secure physical ledger validation...', 'Analyzing standard asset reserves in Jesus\' Name...']);
        playBeep(650, 'sine', 0.1);

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        await delay(1000);
        setAuditLogs(prev => [...prev, '⚡ STEP 1: Verifying storage totals vs circulating volume...']);
        const calculatedSum = reserves.reserves.reduce((acc, r) => acc + r.totalValue, 0);
        const circulation = reserves.cphInCirculation;
        const storage = reserves.cphInStorage;
        playBeep(750, 'sine', 0.08);

        await delay(1200);
        setAuditLogs(prev => [...prev, 
            `   - Circulating: ${circulation.toLocaleString()} CPH`,
            `   - Stored Backing: ${storage.toLocaleString()} CPH`,
            `   - Net Calculated: ${calculatedSum.toLocaleString()} CPH`,
            `   - Ledger Record: ${reserves.totalBackedCPH.toLocaleString()} CPH`
        ]);

        await delay(1000);
        setAuditLogs(prev => [...prev, '⚡ STEP 2: Auditing physical crude oil & mega-facilities titles...']);
        const oilRes = reserves.reserves.find(r => r.subtype === 'crude_oil_monopoly');
        const refMatrix = reserves.reserves.find(r => r.subtype === 'refinery_matrix');
        
        if (oilRes || refMatrix) {
            setAuditLogs(prev => [...prev, 
                `   - Consecrated oil volume detected: ${oilRes ? oilRes.quantity.toLocaleString() : 0} Barrels`,
                `   - Consecrated refinery units detected: ${refMatrix ? refMatrix.quantity.toLocaleString() : 0} facilities`,
                `   - Covenant Titles Signature: MATCHED & CONSECRATED IN THE NAME OF JESUS CHRIST`
            ]);
        } else {
            setAuditLogs(prev => [...prev, '   - No divine/consecrated energy monopolies detected in local partition.']);
        }
        playBeep(850, 'sine', 0.08);

        await delay(1200);
        setAuditLogs(prev => [...prev, '⚡ STEP 3: Checking resource depreciation vectors...']);
        let decayingCount = 0;
        let graceCount = 0;
        reserves.reserves.forEach(r => {
            if (r.depreciationRate > 0) decayingCount++;
            else graceCount++;
        });
        setAuditLogs(prev => [...prev, 
            `   - Normal decaying assets: ${decayingCount}`,
            `   - Consecrated / Non-decaying grace assets: ${graceCount}`
        ]);
        playBeep(950, 'sine', 0.08);

        await delay(1000);
        const mismatch = Math.abs(calculatedSum - reserves.totalBackedCPH) > 0.01;
        if (mismatch) {
            setAuditState('ERROR');
            setAuditLogs(prev => [...prev, '🚨 AUDIT ERROR: Physical inventory valuation does not match ledger backing totals!', 'Validation aborted with status 0xLedgerDeficit.']);
            playBeep(220, 'sawtooth', 0.3);
        } else {
            setAuditState('SUCCESS');
            setAuditLogs(prev => [...prev, '👑 CRYPTO-PHYSICAL AUDIT: 100% CORRECT & BALANCED.', 'Validation: PASSED. Wealth conservation remains perfectly physical.', 'No inflation detected.']);
            playBeep(1100, 'sine', 0.2);
            setTimeout(() => playBeep(1400, 'sine', 0.3), 150);
            toast.success('Treasury physical ledger audit successfully passed!', {
                description: 'Verifiable physical backing is 100% correct.'
            });
        }
    };

    if (!reserves) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-zinc-500 font-mono">
                <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                <span>Synchronizing Treasury Database...</span>
            </div>
        );
    }

    const hasDivineMonopoly = reserves.reserves.some(r => r.isDivine || r.type === 'divine');

    return (
        <div className="space-y-8">
            
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1: Total Treasury Backing */}
                <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
                                Total Resource Valuation
                            </span>
                            <h2 className="text-xl font-black font-mono text-zinc-100 tracking-tight mt-1 truncate">
                                {formatCPH(totals.totalVal)}
                            </h2>
                            <p className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                100% Physically Backed
                            </p>
                        </div>
                        <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 text-amber-500 shadow-sm">
                            <Coins className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* 2: Standard Assets */}
                <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
                                Local Commodity Reserves
                            </span>
                            <h2 className="text-xl font-black font-mono text-zinc-100 tracking-tight mt-1">
                                {formatCPH(totals.standardVal)}
                            </h2>
                            <p className="text-[10px] text-zinc-400 font-mono mt-1">
                                Food, Energy, Materials & USD
                            </p>
                        </div>
                        <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 text-sky-400 shadow-sm">
                            <Sliders className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* 3: Crude Oil Monopoly */}
                <div className={`relative overflow-hidden rounded-2xl border bg-zinc-950 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-colors ${
                    hasDivineMonopoly ? 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'border-zinc-800/80'
                }`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
                                Consecrated Crude Oil
                            </span>
                            <h2 className="text-xl font-black font-mono text-zinc-100 tracking-tight mt-1">
                                {totals.oilBarrels > 0 ? `${(totals.oilBarrels / 1e9).toFixed(2)}B Barrels` : '0 Barrels'}
                            </h2>
                            <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md mt-1 inline-block font-mono">
                                {hasDivineMonopoly ? '† Sovereign Covenant Title' : 'Standard Raw Petroleum'}
                            </span>
                        </div>
                        <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 text-amber-500 shadow-sm">
                            <Droplet className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* 4: Refinery Matrix */}
                <div className={`relative overflow-hidden rounded-2xl border bg-zinc-950 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-colors ${
                    hasDivineMonopoly ? 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'border-zinc-800/80'
                }`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
                                Active Refining Megastructures
                            </span>
                            <h2 className="text-xl font-black font-mono text-zinc-100 tracking-tight mt-1">
                                {totals.refineriesCount > 0 ? `${totals.refineriesCount} Complexes` : '0 facilities'}
                            </h2>
                            <p className="text-[10px] text-zinc-400 font-mono mt-1">
                                Operating Refinery Matrices
                            </p>
                        </div>
                        <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 text-amber-500 shadow-sm">
                            <Building2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

            </div>

            {/* Visual Charts & Scale Perspectives */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Donut Allocation Chart */}
                <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl p-6 shadow-md flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-black font-mono tracking-wide text-zinc-100 uppercase">
                                    Reserves Asset Allocation
                                </h3>
                                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">ALLOCATION WEIGHT BY VALUE</p>
                            </div>
                            
                            {hasDivineMonopoly && (
                                <button
                                    type="button"
                                    onClick={() => setExcludeDivine(!excludeDivine)}
                                    className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border transition-all ${
                                        excludeDivine 
                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/35' 
                                            : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                                    }`}
                                >
                                    {excludeDivine ? 'ZOOMED TO STANDARD' : 'COSMIC SOVEREIGN SCALE'}
                                </button>
                            )}
                        </div>

                        {chartPieData.length > 0 ? (
                            <div className="h-44 w-full relative flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartPieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {chartPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                                            itemStyle={{ fontFamily: 'monospace', fontSize: '10px' }}
                                            formatter={(value: any) => [`${value.toLocaleString()} CPH`, 'Backed Value']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute flex flex-col items-center justify-center text-center">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">Total Backed</span>
                                    <span className="text-[11px] font-bold font-mono text-zinc-100 mt-0.5">
                                        {formatCPH(chartPieData.reduce((acc, curr) => acc + curr.value, 0))}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-44 w-full flex items-center justify-center text-xs text-zinc-600 font-mono">
                                No allocation data.
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-zinc-900 pt-4 mt-2">
                        {chartPieData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-[10px] font-mono text-zinc-400 truncate">{entry.name}</span>
                                <span className="text-[9px] font-mono font-bold text-zinc-500 ml-auto">
                                    {totals.totalVal > 0 ? `${((entry.value / (excludeDivine ? totals.standardVal : totals.totalVal)) * 100).toFixed(1)}%` : '0%'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Accumulation Area Chart */}
                <div className="lg:col-span-2 bg-zinc-950/40 border border-zinc-800/60 rounded-2xl p-6 shadow-md flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h3 className="text-sm font-black font-mono tracking-wide text-zinc-100 uppercase">
                                    Treasury Accumulation Growth
                                </h3>
                                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">CUMULATIVE PHYSICAL WEALTH VELOCITY</p>
                            </div>
                            <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                INFLATION-FREE COMMODITY EXPANSION
                            </span>
                        </div>

                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={excludeDivine ? '#38bdf8' : '#f59e0b'} stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor={excludeDivine ? '#38bdf8' : '#f59e0b'} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
                                    <XAxis dataKey="name" stroke="#52525b" style={{ fontSize: '9px', fontFamily: 'monospace' }} />
                                    <YAxis stroke="#52525b" style={{ fontSize: '9px', fontFamily: 'monospace' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                                        labelStyle={{ fontFamily: 'monospace', fontSize: '10px', color: '#a1a1aa' }}
                                        itemStyle={{ fontFamily: 'monospace', fontSize: '10px' }}
                                        formatter={(value: any) => [`${value.toLocaleString()} CPH`, 'Valuation']}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey={excludeDivine ? "standardValue" : "totalValue"} 
                                        stroke={excludeDivine ? "#38bdf8" : "#f59e0b"} 
                                        fillOpacity={1} 
                                        fill="url(#colorValue)" 
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="text-[9px] text-zinc-600 font-mono text-center mt-3 border-t border-zinc-900 pt-3">
                        *Chart represents actual physical resource backing compiled over ledger checkpoints.
                    </div>
                </div>

            </div>

            {/* Sovereign Tech Alliance & De-monopolization Network */}
            <div className="bg-zinc-950/25 border border-zinc-800/40 rounded-3xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                                <Globe className="w-5 h-5" />
                            </span>
                            <h2 className="text-base font-black font-mono tracking-wide text-zinc-100 uppercase">
                                Sovereign Tech Alliance & Anti-Monopoly Matrix
                            </h2>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1.5 max-w-2xl leading-relaxed">
                            Bypass centralized physical resource monopolies by integrating premium global developer environments. Distribute resource ownership across Microsoft Azure pipelines, Google Play Dev channels, and Apple App Store pipelines.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono uppercase bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 text-zinc-400">
                            Anti-Monopoly Ratio: <span className="text-emerald-400 font-bold">{unmonopolized ? '100% (Decentralized)' : '0% (Single Cartel)'}</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Microsoft Partnership */}
                    <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-400">
                                        <Globe className="w-4 h-4" />
                                    </span>
                                    <span className="text-[11px] font-black font-mono text-zinc-300 uppercase">Microsoft Partnership</span>
                                </div>
                                <span className={`text-[8px] font-black font-mono px-2 py-0.5 rounded ${
                                    msftPartnerActive ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                }`}>
                                    {msftPartnerActive ? 'CONNECTED' : 'DISCONNECTED'}
                                </span>
                            </div>

                            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed mb-4">
                                Leverages Microsoft Azure enterprise clouds for massive physical supply line load-balancing.
                            </p>

                            {!msftPartnerActive ? (
                                <div className="space-y-2">
                                    <label className="text-[9px] font-mono text-zinc-600 uppercase block">Partner MPN ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. MSFT-AETHEROS-99-ALPHA"
                                        value={msftPartnerId}
                                        onChange={(e) => setMsftPartnerId(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono outline-none focus:border-zinc-700"
                                    />
                                </div>
                            ) : (
                                <div className="bg-black/40 border border-zinc-900 rounded-xl p-3 text-center">
                                    <span className="text-[10px] font-mono text-blue-400 font-bold block mb-1">✓ Connection Secure</span>
                                    <span className="text-[9px] font-mono text-zinc-500 select-all">{msftPartnerId || 'MSFT-AETHEROS-DEFAULT'}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-5">
                            {!msftPartnerActive ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const finalId = msftPartnerId.trim() || 'MSFT-AETHEROS-777-ALPHA';
                                        setMsftPartnerId(finalId);
                                        setMsftPartnerActive(true);
                                        localStorage.setItem('aetheros_msft_partner_id', finalId);
                                        localStorage.setItem('aetheros_msft_partner_active', 'true');
                                        toast.success('Microsoft Alliance Established!', {
                                            description: `Azure load-balancer mapped to ID: ${finalId}`
                                        });
                                        playBeep(880, 'sine', 0.1);
                                    }}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-stone-950 font-mono font-black text-[10px] rounded-xl transition-all cursor-pointer"
                                >
                                    ACTIVATE MICROSOFT GRID
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMsftPartnerActive(false);
                                        localStorage.setItem('aetheros_msft_partner_active', 'false');
                                        toast.warning('Microsoft Partnership Disconnected');
                                        playBeep(440, 'sawtooth', 0.1);
                                    }}
                                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-mono font-bold text-[10px] rounded-xl transition-all cursor-pointer"
                                >
                                    DE-AUTHORIZE CONNECTION
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Google Developers License */}
                    <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-amber-500">
                                        <Cpu className="w-4 h-4" />
                                    </span>
                                    <span className="text-[11px] font-black font-mono text-zinc-300 uppercase">Google Developers</span>
                                </div>
                                <span className={`text-[8px] font-black font-mono px-2 py-0.5 rounded ${
                                    googleDevActive ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                }`}>
                                    {googleDevActive ? 'LICENSED' : 'PENDING'}
                                </span>
                            </div>

                            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed mb-4">
                                Connects the Google Play System console to automate raw refinery matrix throughput metrics.
                            </p>

                            {!googleDevActive ? (
                                <div className="space-y-2">
                                    <label className="text-[9px] font-mono text-zinc-600 uppercase block">Developer License Key</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. GDEV-LICENSE-888-OMEGA"
                                        value={googleDevLicense}
                                        onChange={(e) => setGoogleDevLicense(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono outline-none focus:border-zinc-700"
                                    />
                                </div>
                            ) : (
                                <div className="bg-black/40 border border-zinc-900 rounded-xl p-3 text-center">
                                    <span className="text-[10px] font-mono text-amber-500 font-bold block mb-1">✓ Play Console Active</span>
                                    <span className="text-[9px] font-mono text-zinc-500 select-all">{googleDevLicense || 'GGL-DEV-LIC-888-OMEGA'}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-5">
                            {!googleDevActive ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const finalKey = googleDevLicense.trim() || 'GDEV-LICENSE-888-OMEGA';
                                        setGoogleDevLicense(finalKey);
                                        setGoogleDevActive(true);
                                        localStorage.setItem('aetheros_google_dev_license', finalKey);
                                        localStorage.setItem('aetheros_google_dev_active', 'true');
                                        toast.success('Google Dev Console Integrated!', {
                                            description: `Automation conduit established with License ID: ${finalKey}`
                                        });
                                        playBeep(920, 'sine', 0.1);
                                    }}
                                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono font-black text-[10px] rounded-xl transition-all cursor-pointer"
                                >
                                    ACTIVATE DEVELOPER LICENSE
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setGoogleDevActive(false);
                                        localStorage.setItem('aetheros_google_dev_active', 'false');
                                        toast.warning('Google Developers License Revoked');
                                        playBeep(440, 'sawtooth', 0.1);
                                    }}
                                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-mono font-bold text-[10px] rounded-xl transition-all cursor-pointer"
                                >
                                    REVOKE API ACCESS
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Apple Developer Program Include */}
                    <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-cyan-400">
                                        <Layers className="w-4 h-4" />
                                    </span>
                                    <span className="text-[11px] font-black font-mono text-zinc-300 uppercase">Apple Include</span>
                                </div>
                                <span className={`text-[8px] font-black font-mono px-2 py-0.5 rounded ${
                                    appleActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                }`}>
                                    {appleActive ? 'VERIFIED' : 'PENDING'}
                                </span>
                            </div>

                            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed mb-4">
                                Couples premium end-consumer distribution, bypassing commercial energy middlemen cartels.
                            </p>

                            {!appleActive ? (
                                <div className="space-y-2">
                                    <label className="text-[9px] font-mono text-zinc-600 uppercase block">Developer Team ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. APPLE-TEAM-777-SIGMA"
                                        value={appleTeamId}
                                        onChange={(e) => setAppleTeamId(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono outline-none focus:border-zinc-700"
                                    />
                                </div>
                            ) : (
                                <div className="bg-black/40 border border-zinc-900 rounded-xl p-3 text-center">
                                    <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">✓ Apple Verified</span>
                                    <span className="text-[9px] font-mono text-zinc-500 select-all">{appleTeamId || 'APPLE-TEAM-777-SIGMA'}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-5">
                            {!appleActive ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const finalId = appleTeamId.trim() || 'APPLE-TEAM-777-SIGMA';
                                        setAppleTeamId(finalId);
                                        setAppleActive(true);
                                        localStorage.setItem('aetheros_apple_team_id', finalId);
                                        localStorage.setItem('aetheros_apple_active', 'true');
                                        toast.success('Apple Ecosystem Inclusion Established!', {
                                            description: `Premium gate assigned to Team: ${finalId}`
                                        });
                                        playBeep(980, 'sine', 0.1);
                                    }}
                                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-mono font-black text-[10px] rounded-xl transition-all cursor-pointer"
                                >
                                    ACTIVATE APPLE INCLUDE
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAppleActive(false);
                                        localStorage.setItem('aetheros_apple_active', 'false');
                                        toast.warning('Apple Inclusion Terminated');
                                        playBeep(440, 'sawtooth', 0.1);
                                    }}
                                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-mono font-bold text-[10px] rounded-xl transition-all cursor-pointer"
                                >
                                    TERMINATE INCLUDE
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Anti-Monopoly Sovereign Action Console */}
                    <div className="bg-zinc-950/70 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
                        {unmonopolized && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full filter blur-xl pointer-events-none" />
                        )}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[11px] font-black font-mono text-zinc-300 uppercase flex items-center gap-2">
                                    <Activity className={`w-4 h-4 ${unmonopolized ? 'text-emerald-400 animate-pulse' : 'text-zinc-600'}`} />
                                    Anti-Monopoly Core
                                </span>
                                <span className={`text-[8px] font-black font-mono px-2 py-0.5 rounded ${
                                    unmonopolized ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                }`}>
                                    {unmonopolized ? 'DECENTRALIZED' : 'CONCENTRATED'}
                                </span>
                            </div>

                            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed mb-4">
                                Converts raw petroleum and refinery monopoly assets into a distributed tech-allied commodity trust network.
                            </p>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[9px] font-mono border-b border-zinc-900 pb-2">
                                    <span className="text-zinc-600">Microsoft Grid:</span>
                                    <span className={msftPartnerActive ? 'text-blue-400 font-bold' : 'text-zinc-600'}>
                                        {msftPartnerActive ? '✓ OK' : '⚠ NONE'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-mono border-b border-zinc-900 pb-2">
                                    <span className="text-zinc-600">Google License:</span>
                                    <span className={googleDevActive ? 'text-amber-500 font-bold' : 'text-zinc-600'}>
                                        {googleDevActive ? '✓ OK' : '⚠ NONE'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-mono border-b border-zinc-900 pb-2">
                                    <span className="text-zinc-600">Apple Include:</span>
                                    <span className={appleActive ? 'text-cyan-400 font-bold' : 'text-zinc-600'}>
                                        {appleActive ? '✓ OK' : '⚠ NONE'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            {unmonopolized ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUnmonopolized(false);
                                        localStorage.setItem('aetheros_unmonopolized', 'false');
                                        toast.warning('Resource Monopolies Re-established', {
                                            description: 'Distributed petroleum grid reverted back to centralized sovereign custody.'
                                        });
                                        playBeep(330, 'sawtooth', 0.25);
                                    }}
                                    className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-mono font-black text-[10px] rounded-xl transition-all cursor-pointer"
                                >
                                    RE-CENTRALIZE MONOPOLY
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={!(msftPartnerActive && googleDevActive && appleActive)}
                                    onClick={() => {
                                        setUnmonopolized(true);
                                        localStorage.setItem('aetheros_unmonopolized', 'true');
                                        // Stabilize fuel target to sweet spot
                                        setRefinedPrice(90);
                                        localStorage.setItem('aetheros_refined_petroleum_price', '90');
                                        
                                        toast.success('DE-MONOPOLIZATION ENFORCED!', {
                                            description: 'Sovereign oil reserves distributed across MSFT, Google, & Apple pipelines. Volatility stabilized.',
                                            duration: 6000
                                        });
                                        playBeep(600, 'sine', 0.15);
                                        setTimeout(() => playBeep(800, 'sine', 0.15), 150);
                                        setTimeout(() => playBeep(1100, 'sine', 0.25), 300);
                                    }}
                                    className={`w-full py-3 font-mono font-black text-[10px] rounded-xl transition-all border ${
                                        msftPartnerActive && googleDevActive && appleActive
                                            ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 border-emerald-500 cursor-pointer shadow-md animate-pulse'
                                            : 'bg-zinc-950 text-zinc-600 border-zinc-900 cursor-not-allowed text-[9px]'
                                    }`}
                                >
                                    {msftPartnerActive && googleDevActive && appleActive
                                        ? '⚡ EXECUTE DE-MONOPOLIZATION'
                                        : 'AWAITING ALL 3 SIGNATURES'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Refinery Transformation Center, Resource Extraction, Price Stabilization & Cryptographic Balance Auditor */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Extraction Module (Adds raw materials) */}
                <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl p-6 shadow-md flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1 bg-sky-500/10 text-sky-400 rounded-md border border-sky-500/15">
                                <Plus className="w-4 h-4" />
                            </span>
                            <h3 className="text-sm font-black font-mono tracking-wide text-zinc-100 uppercase">
                                Commodity Extraction
                            </h3>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1 leading-relaxed">
                            Mine or capture raw natural assets. This physically creates backing CPH under the Law of Conservation.
                        </p>

                        <form onSubmit={handleExtract} className="space-y-4 mt-5">
                            <div>
                                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Resource Vector</label>
                                <select
                                    value={extractType}
                                    onChange={(e: any) => setExtractType(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 font-mono focus:border-sky-500 outline-none"
                                >
                                    <option value="crude_oil_raw">Raw Crude Petroleum (barrels) @ 40 CPH</option>
                                    <option value="iron_ore">Raw Iron Ore (kg) @ 2 CPH</option>
                                    <option value="solar_power">Solar Energy (kWh) @ 1 CPH</option>
                                    <option value="grain">Field Grain (kg) @ 5 CPH</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Extraction Volume</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="50000"
                                        value={extractQty}
                                        onChange={(e) => setExtractQty(Math.max(1, parseInt(e.target.value) || 0))}
                                        className="w-full bg-black border border-zinc-800 rounded-xl pl-3.5 pr-14 py-2.5 text-xs text-zinc-100 font-mono focus:border-sky-500 outline-none"
                                    />
                                    <span className="absolute right-3 top-2.5 text-[10px] text-zinc-500 font-mono uppercase">
                                        {extractType === 'solar_power' ? 'kWh' : extractType === 'crude_oil_raw' ? 'BBL' : 'kg'}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-sky-600 hover:bg-sky-500 text-stone-950 font-mono font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(2,132,199,0.1)]"
                            >
                                <Zap className="w-3.5 h-3.5" />
                                EXECUTE NATURE EXTRACTION
                            </button>
                        </form>
                    </div>

                    <div className="bg-sky-950/5 border border-sky-950/25 rounded-xl p-3.5 mt-5 font-mono text-[9px] text-sky-400/90 leading-normal">
                        <strong>Eco-Physics Rule:</strong> Total money in storage rises exactly by the value extracted. Natural reserves are fully itemized.
                    </div>
                </div>

                {/* Industrial Refinery Center */}
                <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl p-6 shadow-md flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1 bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/15">
                                <Hammer className="w-4 h-4" />
                            </span>
                            <h3 className="text-sm font-black font-mono tracking-wide text-zinc-100 uppercase">
                                Value-Added Refinery
                            </h3>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1 leading-relaxed">
                            Synthesize or refine raw commodities to add value to the system through manufacturing processes.
                        </p>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setRefineMode('oil')}
                                className={`py-2 text-[10px] font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                                    refineMode === 'oil'
                                        ? 'bg-purple-500/15 text-purple-400 border-purple-500/40 font-black'
                                        : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                PETROLEUM CRACKING
                            </button>
                            <button
                                type="button"
                                onClick={() => setRefineMode('iron')}
                                className={`py-2 text-[10px] font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                                    refineMode === 'iron'
                                        ? 'bg-purple-500/15 text-purple-400 border-purple-500/40 font-black'
                                        : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                METALLURGY SMELTING
                            </button>
                        </div>

                        <form onSubmit={handleRefine} className="space-y-4 mt-4">
                            <div>
                                <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Manufacturing Parameters</span>
                                <div className="bg-black/70 rounded-xl p-3 border border-zinc-900 font-mono text-[10px] space-y-1 text-zinc-400">
                                    {refineMode === 'oil' ? (
                                        <>
                                            <div>• Input: 1 Barrel Raw Oil (40 CPH)</div>
                                            <div>• Input: 5 kWh Solar Grid (5 CPH)</div>
                                            <div className="text-purple-400 font-bold">• Output: Refined Fuel (95 CPH)</div>
                                            <div className="text-emerald-400">• Net Value Added: +50 CPH per unit</div>
                                        </>
                                    ) : (
                                        <>
                                            <div>• Input: 10 kg Raw Iron Ore (20 CPH)</div>
                                            <div>• Input: 2 kWh Solar Grid (2 CPH)</div>
                                            <div className="text-purple-400 font-bold">• Output: Steel Alloy (45 CPH)</div>
                                            <div className="text-emerald-400">• Net Value Added: +23 CPH per unit</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Batch Manufacturing Quantity</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="1000"
                                    value={refineQty}
                                    onChange={(e) => setRefineQty(Math.max(1, parseInt(e.target.value) || 0))}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 font-mono focus:border-purple-500 outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-500 text-stone-950 font-mono font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(168,85,247,0.1)]"
                            >
                                <Hammer className="w-3.5 h-3.5" />
                                START REFINING TRANSFORM
                            </button>
                        </form>
                    </div>

                    <div className="text-[9px] text-zinc-600 font-mono text-center mt-3 border-t border-zinc-950 pt-2.5">
                        Labor force cost is fully integrated into the synthesis cycle.
                    </div>
                </div>

                {/* Fuel Price Stabilization Console */}
                <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl p-6 shadow-md flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/15">
                                <Sliders className="w-4 h-4" />
                            </span>
                            <h3 className="text-sm font-black font-mono tracking-wide text-zinc-100 uppercase">
                                Fuel Price Stabilizer
                            </h3>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1 leading-relaxed">
                            Control energy volatility and deploy strategic reserves to protect standard consumer purchasing power.
                        </p>

                        {peaceAccordActive ? (
                            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 text-center flex flex-col items-center justify-center mt-6 min-h-[220px]">
                                <Heart className="w-8 h-8 text-amber-400 mb-3 animate-pulse" />
                                <h4 className="text-xs font-black font-mono text-amber-300 uppercase">Eternal Covenant Active</h4>
                                <p className="text-[10px] text-zinc-400 font-mono mt-2 leading-relaxed max-w-[210px]">
                                    Petroleum prices are locked permanently by the Holy Peace Accord at:
                                </p>
                                <div className="grid grid-cols-2 gap-2 w-full mt-3 font-mono text-[10px]">
                                    <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-900">
                                        <span className="text-zinc-500 block text-[8px]">RAW CRUDE</span>
                                        <span className="text-amber-200 font-bold">40 CPH</span>
                                    </div>
                                    <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-900">
                                        <span className="text-zinc-500 block text-[8px]">REFINED FUEL</span>
                                        <span className="text-amber-200 font-bold">95 CPH</span>
                                    </div>
                                </div>
                                <span className="text-[9px] font-mono text-emerald-400 mt-4 flex items-center gap-1">
                                    ✓ Volatility Fully Extinguished
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-4 mt-5">
                                {/* Toggle Switch */}
                                <div>
                                    <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1.5">Stabilization Mode</label>
                                    <div className="flex items-center justify-between bg-black border border-zinc-900 rounded-xl p-2.5">
                                        <span className="text-[10px] font-bold font-mono text-zinc-300">
                                            {isStabilized ? '✓ SOVEREIGN GRACE' : '⚠ FREE FLOAT'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const nextVal = !isStabilized;
                                                setIsStabilized(nextVal);
                                                localStorage.setItem('aetheros_fuel_stabilized', String(nextVal));
                                                if (nextVal) {
                                                    setRefinedPrice(stabilizedTarget);
                                                    setMarketEvent('Sovereign Guarded');
                                                    toast.success('Price Stabilization Enforced!', {
                                                        description: `Refined fuel locked at target: ${stabilizedTarget} CPH.`
                                                    });
                                                    playBeep(1000, 'sine', 0.1);
                                                } else {
                                                    setMarketEvent('Volatile Speculation');
                                                    toast.warning('Stabilization Override Active!', {
                                                        description: 'Fuel is subject to free market commodity fluctuations.'
                                                    });
                                                    playBeep(330, 'sawtooth', 0.2);
                                                }
                                            }}
                                            className={`px-3 py-1 text-[9px] font-black font-mono uppercase rounded-lg border transition-all cursor-pointer ${
                                                isStabilized
                                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                                                    : 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse'
                                            }`}
                                        >
                                            {isStabilized ? 'ACTIVE' : 'OVERRIDE'}
                                        </button>
                                    </div>
                                </div>

                                {/* Target Price Slider */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] font-mono text-zinc-500 uppercase">Target Fuel Price</span>
                                        <span className="text-[10px] font-bold font-mono text-amber-500">{stabilizedTarget} CPH</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="50"
                                        max="150"
                                        value={stabilizedTarget}
                                        onChange={(e) => {
                                            const targetVal = Number(e.target.value);
                                            setStabilizedTarget(targetVal);
                                            localStorage.setItem('aetheros_fuel_target_price', String(targetVal));
                                            if (isStabilized) {
                                                setRefinedPrice(targetVal);
                                            }
                                        }}
                                        className="w-full accent-amber-500 bg-zinc-900 rounded-lg appearance-none h-1 cursor-pointer"
                                    />
                                </div>

                                {/* Strategic Reserves Slider */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] font-mono text-zinc-500 uppercase">Strategic Reserves</span>
                                        <span className="text-[10px] font-bold font-mono text-sky-400">{strategicReserves.toLocaleString()} bbl</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (strategicReserves < 5000) {
                                                    toast.error('Tactical Buffer Depleted!');
                                                    return;
                                                }
                                                const nextRes = strategicReserves - 5000;
                                                setStrategicReserves(nextRes);
                                                localStorage.setItem('aetheros_fuel_strategic_reserves', String(nextRes));
                                                
                                                if (!isStabilized) {
                                                    // Release lowers price
                                                    const nextPrice = Math.max(50, refinedPrice - 8);
                                                    setRefinedPrice(nextPrice);
                                                    setMarketEvent('Reserve Liquidity Release (-8 CPH)');
                                                    toast.success('Injected 5,000 Barrels of Strategic Fuel!', {
                                                        description: `Market price stabilized downward to ${nextPrice} CPH.`
                                                    });
                                                } else {
                                                    toast.success('Injected 5,000 Barrels!', {
                                                        description: 'Price remains locked under sovereign stabilization decree.'
                                                    });
                                                }
                                                playBeep(900, 'sine', 0.1);
                                            }}
                                            className="py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-[9px] font-mono font-bold cursor-pointer"
                                        >
                                            RELEASE 5K BBL
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const nextRes = strategicReserves + 5000;
                                                setStrategicReserves(nextRes);
                                                localStorage.setItem('aetheros_fuel_strategic_reserves', String(nextRes));
                                                
                                                if (!isStabilized) {
                                                    const nextPrice = Math.min(150, refinedPrice + 5);
                                                    setRefinedPrice(nextPrice);
                                                    setMarketEvent('Reserve Replenish Siphon (+5 CPH)');
                                                    toast.success('Replenished 5,000 Barrels of Strategic Fuel!', {
                                                        description: `Market price slightly adjusted to ${nextPrice} CPH.`
                                                    });
                                                } else {
                                                    toast.success('Strategic reserves replenished!', {
                                                        description: 'Buffer increased safely without price impact.'
                                                    });
                                                }
                                                playBeep(700, 'sine', 0.1);
                                            }}
                                            className="py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-[9px] font-mono font-bold cursor-pointer"
                                        >
                                            REPLENISH 5K
                                        </button>
                                    </div>
                                </div>

                                {/* Geopolitical Volatility Generator (visible when not stabilized) */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isStabilized) {
                                                toast.error('Override Required', {
                                                    description: 'Disable Sovereign Price Stabilization to simulate free market volatility.'
                                                });
                                                return;
                                            }
                                            const drift = Math.random() > 0.5 ? 1 : -1;
                                            const magnitude = Math.floor(Math.random() * 25) + 10; // 10 to 35 CPH shift
                                            const nextPrice = Math.max(50, Math.min(150, refinedPrice + (drift * magnitude)));
                                            const nextCrude = Math.max(20, Math.min(80, Math.round(nextPrice * 0.42)));
                                            
                                            setRefinedPrice(nextPrice);
                                            setCrudePrice(nextCrude);
                                            
                                            const shockName = drift > 0 
                                                ? `Supply Blockage (+${magnitude} CPH)` 
                                                : `Surplus Glut (-${magnitude} CPH)`;
                                            setMarketEvent(shockName);
                                            
                                            toast.warning('Market Price Shock Triggered!', {
                                                description: `Fuel adjusted to ${nextPrice} CPH. Crude to ${nextCrude} CPH.`
                                            });
                                            playBeep(260, 'sawtooth', 0.3);
                                        }}
                                        disabled={isStabilized}
                                        className={`w-full py-2 rounded-xl text-[10px] font-mono font-bold transition-all border ${
                                            isStabilized
                                                ? 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed'
                                                : 'bg-amber-600 hover:bg-amber-500 text-stone-950 border-amber-600 cursor-pointer shadow-sm animate-pulse'
                                        }`}
                                    >
                                        {isStabilized ? 'STABILIZATION LOCKED' : '⚡ TRIGGER VOLATILITY EVENT'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-950/5 border border-amber-950/20 rounded-xl p-3 mt-4 text-[9px] font-mono text-zinc-400">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-zinc-500">Live Status:</span>
                            <span className={`font-bold ${peaceAccordActive ? 'text-amber-400' : isStabilized ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {peaceAccordActive ? '🕊️ Eternal Harmony' : marketEvent}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-500">Depreciation:</span>
                            <span 
                                onClick={() => {
                                    if (peaceAccordActive) return;
                                    const nextB = !blessedFuel;
                                    setBlessedFuel(nextB);
                                    localStorage.setItem('aetheros_fuel_blessed', String(nextB));
                                }}
                                className={`font-bold text-amber-500 ${peaceAccordActive ? 'cursor-default' : 'hover:underline cursor-pointer'}`}
                            >
                                {peaceAccordActive || blessedFuel ? '0.0% (Grace Sealed)' : '10.0%/wk (Decaying)'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cryptographic Ledger Verification Console */}
                <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl p-6 shadow-md flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/15">
                                <ShieldCheck className="w-4 h-4" />
                            </span>
                            <h3 className="text-sm font-black font-mono tracking-wide text-zinc-100 uppercase">
                                Cryptographic Balance Auditor
                            </h3>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1 leading-relaxed">
                            Run physical backing queries to prove that the ledger remains 100% inflation-free and mathematically sound.
                        </p>

                        <div className="space-y-3.5 mt-5">
                            {auditState === 'IDLE' && (
                                <div className="h-44 bg-black/90 border border-zinc-900 rounded-xl flex flex-col items-center justify-center text-center p-4">
                                    <FileText className="w-8 h-8 text-zinc-600 mb-2" />
                                    <span className="text-[10px] font-mono text-zinc-500">
                                        No active ledger audit running.
                                    </span>
                                    <span className="text-[8px] font-mono text-zinc-600 mt-1 uppercase">
                                        System state: PRE-SECURE
                                    </span>
                                </div>
                            )}

                            {auditState !== 'IDLE' && (
                                <div className="h-44 bg-black/95 border border-zinc-900 rounded-xl p-3 font-mono text-[9px] space-y-1.5 overflow-y-auto max-h-44 text-zinc-400 leading-normal">
                                    {auditLogs.map((log, idx) => (
                                        <div 
                                            key={idx} 
                                            className={
                                                log.startsWith('🚨') ? 'text-rose-500 font-bold' : 
                                                log.startsWith('👑') ? 'text-amber-400 font-bold' : 
                                                log.startsWith('⚡') ? 'text-zinc-200 font-bold' : ''
                                            }
                                        >
                                            {log}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                disabled={auditState === 'RUNNING'}
                                onClick={runLedgerAudit}
                                className={`w-full font-mono font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-sm ${
                                    auditState === 'RUNNING' 
                                        ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800' 
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-stone-950 shadow-[0_4px_12px_rgba(16,185,129,0.15)]'
                                }`}
                            >
                                {auditState === 'RUNNING' ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        AUDITING BACKING RATIOS...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        INITIATE LEDGER SYSTEM AUDIT
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="text-[9px] text-zinc-600 font-mono text-center mt-3 border-t border-zinc-950 pt-2.5">
                        Security Signature: 0xCHRONOS_LEGER_BACKED_V1
                    </div>
                </div>

            </div>

            {/* Detailed Ledger Inventory Table */}
            <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl p-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-sm font-black font-mono tracking-wide text-zinc-100 uppercase">
                            Treasury Ledger Directory
                        </h3>
                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">ITEMIZED PHYSICAL BACKING RESERVES</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search ledger assets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-52 bg-black border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-300 font-mono focus:border-zinc-700 outline-none"
                            />
                        </div>

                        {/* Dropdown Filters */}
                        <div className="relative">
                            <select
                                value={filterType}
                                onChange={(e: any) => setFilterType(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400 font-mono focus:border-zinc-700 outline-none"
                            >
                                <option value="ALL">ALL TYPES</option>
                                <option value="ENERGY">ENERGY</option>
                                <option value="MATERIALS">MATERIALS</option>
                                <option value="FOOD">FOOD</option>
                                <option value="FIAT">FIAT CURRENCY</option>
                                <option value="DIVINE">DIVINE MONOPOLY</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-black/40">
                    <table className="w-full text-left font-mono text-[11px] border-collapse">
                        <thead>
                            <tr className="bg-zinc-950 border-b border-zinc-900 text-zinc-500 text-[10px] uppercase">
                                <th className="py-3.5 px-4 font-bold">Asset Label</th>
                                <th className="py-3.5 px-4 font-bold">Type</th>
                                <th className="py-3.5 px-4 font-bold">Subtype</th>
                                <th className="py-3.5 px-4 font-bold text-right">Physical Quantity</th>
                                <th className="py-3.5 px-4 font-bold text-right">Unit Price</th>
                                <th className="py-3.5 px-4 font-bold text-right">Total Valuation</th>
                                <th className="py-3.5 px-4 font-bold text-right">Depreciation / Wk</th>
                                <th className="py-3.5 px-4 font-bold text-center">Grace Condition</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                            {displayedAssets.length > 0 ? (
                                displayedAssets.map((asset, index) => {
                                    const isDivineAsset = asset.isDivine || asset.type === 'divine';
                                    return (
                                        <tr 
                                            key={index} 
                                            className={`hover:bg-zinc-900/30 transition-colors ${
                                                isDivineAsset ? 'bg-amber-950/5 hover:bg-amber-950/10' : ''
                                            }`}
                                        >
                                            <td className="py-3.5 px-4 font-bold text-zinc-200">
                                                <div className="flex items-center gap-1.5">
                                                    {isDivineAsset && <span className="text-amber-500 text-[12px]">👑</span>}
                                                    {asset.label}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-zinc-400 capitalize">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                                    asset.type === 'energy' ? 'bg-sky-500/10 text-sky-400' :
                                                    asset.type === 'materials' ? 'bg-indigo-500/10 text-indigo-400' :
                                                    asset.type === 'food' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    asset.type === 'fiat' ? 'bg-zinc-500/10 text-zinc-400' :
                                                    'bg-amber-500/15 text-amber-500 border border-amber-500/10'
                                                }`}>
                                                    {asset.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-zinc-500 font-mono">{asset.subtype}</td>
                                            <td className="py-3.5 px-4 text-right text-zinc-300 font-bold">
                                                {asset.quantity.toLocaleString()} <span className="text-[9px] text-zinc-600 uppercase font-normal">{asset.unit}</span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right text-zinc-400">
                                                {asset.cphPerUnit.toLocaleString()} CPH
                                            </td>
                                            <td className={`py-3.5 px-4 text-right font-black ${isDivineAsset ? 'text-amber-400' : 'text-zinc-100'}`}>
                                                {formatCPH(asset.totalValue)}
                                            </td>
                                            <td className="py-3.5 px-4 text-right text-zinc-500">
                                                {asset.depreciationRate > 0 
                                                    ? `${(asset.depreciationRate / 10).toFixed(1)}%` 
                                                    : '0.0% (Infinite)'}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {asset.depreciationRate === 0 ? (
                                                    <span className="text-[9px] font-bold text-amber-500 bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                                                        HOLY GRACE
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] text-zinc-500 font-mono">
                                                        {asset.remainingLifeWeeks} Wks Left
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center text-zinc-600 font-mono">
                                        No matching assets found in local partition directories.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between mt-4 text-[10px] text-zinc-600 font-sans">
                    <span>Showing {displayedAssets.length} of {reserves.reserves.length} total active reserve types</span>
                    <span className="font-mono text-[9px] uppercase">CPH INTEGRITY BLOCK: SHA256-CONSISTENT</span>
                </div>
            </div>

        </div>
    );
};
