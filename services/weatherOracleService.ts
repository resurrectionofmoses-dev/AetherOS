/**
 * AetherOS Weather Oracle & Parametric Financial Asset Service
 * 
 * Binds digital portfolio holdings, stock share valuations, and dividend yields
 * directly to real-time and forecasted meteorological indicators (Solar Irradiance,
 * Clear-Sky Index, Temperature Comfort, Barometric Highs, and Pristine Air Quality).
 */

export interface WeatherReading {
    city: string;
    region: string;
    temperatureF: number;
    temperatureC: number;
    condition: 'PEAK_SUNSHINE' | 'CLEAR_BLUE' | 'GOLDEN_HOUR' | 'PARTLY_CLOUDY' | 'OVERCAST' | 'MILD_DRIZZLE' | 'STORM_FRONT';
    conditionLabel: string;
    solarIrradiance: number; // Watts per square meter (0 - 1100 W/m²)
    uvIndex: number; // 0 - 12
    cloudCoverPct: number; // 0 - 100%
    humidityPct: number; // 0 - 100%
    barometricPressureHpa: number; // ~1013.25 hPa standard
    airQualityIndex: number; // 0 - 300 (lower is better, <30 is pristine)
    windSpeedMph: number;
    goodWeatherScore: number; // 0 - 100
    goodWeatherMultiplier: number; // 1.0x to 2.5x multiplier applied to stock returns & yields
    lastUpdated: string;
}

export interface WeatherStock {
    id: string;
    symbol: string;
    name: string;
    sector: 'Solar & Clean Energy' | 'Agrotech & Viticulture' | 'Aviation & High-Ceiling Transit' | 'Coastal Leisure & Hospitality' | 'Wind & Microclimate Grid' | 'Atmospheric Carbon Credits';
    iconEmoji: string;
    basePrice: number;
    currentPrice: number;
    change24hPct: number;
    sharesHeld: number;
    totalValueUsd: number;
    weatherBindingDescription: string;
    targetGoodWeatherMetric: string;
    weatherSensitivityBeta: number; // Elasticity to good weather score (1.0 - 2.5)
    baseDividendApy: number; // e.g. 3.5%
    effectiveWeatherDividendApy: number; // Dynamically calculated based on good weather
    accruedWeatherDividendsUsd: number;
    historicalPrices: number[];
    thesis: string;
}

export interface ParametricWeatherBond {
    id: string;
    title: string;
    underlyingMetric: string;
    strikeThreshold: string;
    currentObservedValue: string;
    payoutPotentialUsd: number;
    progressPct: number;
    timeRemainingSec: number;
    isTriggered: boolean;
    insurer: string;
}

export interface DigitalAssetHolderState {
    holderAddress: string;
    holderName: string;
    vaultType: 'SOVEREIGN_ATMOSPHERIC_CUSTODY' | 'PARAMETRIC_CLIMATE_ENCLAVE';
    cashBalanceUsd: number;
    totalPortfolioValueUsd: number;
    weatherAlphaBonusUsd: number; // Additional profit generated purely from good weather bindings
    totalDividendsClaimedUsd: number;
    portfolioChange24hUsd: number;
    portfolioChange24hPct: number;
    stocks: WeatherStock[];
    parametricBonds: ParametricWeatherBond[];
    transactionLog: {
        id: string;
        timestamp: string;
        type: 'BUY' | 'SELL' | 'WEATHER_DIVIDEND_PAYOUT' | 'PARAMETRIC_STRIKE_WIN' | 'REBALANCE';
        symbol?: string;
        amountUsd: number;
        note: string;
    }[];
}

export const SUPPORTED_CITIES: Record<string, { city: string; region: string; defaultTemp: number; baseSolar: number }> = {
    'san_francisco': { city: 'San Francisco', region: 'California, US', defaultTemp: 71, baseSolar: 890 },
    'honolulu': { city: 'Honolulu', region: 'Hawaii, US', defaultTemp: 84, baseSolar: 980 },
    'miami': { city: 'Miami', region: 'Florida, US', defaultTemp: 86, baseSolar: 920 },
    'zurich': { city: 'Zurich', region: 'Switzerland', defaultTemp: 68, baseSolar: 760 },
    'tokyo': { city: 'Tokyo', region: 'Japan', defaultTemp: 73, baseSolar: 810 },
    'nice': { city: 'Nice & Côte d’Azur', region: 'France', defaultTemp: 78, baseSolar: 950 },
    'dubai': { city: 'Dubai', region: 'UAE', defaultTemp: 92, baseSolar: 1020 }
};

export const INITIAL_WEATHER_STOCKS: WeatherStock[] = [
    {
        id: 'solr_01',
        symbol: 'SOLR',
        name: 'Solaria Radiant Photovoltaics',
        sector: 'Solar & Clean Energy',
        iconEmoji: '☀️',
        basePrice: 142.50,
        currentPrice: 154.20,
        change24hPct: 8.21,
        sharesHeld: 35,
        totalValueUsd: 5397.00,
        weatherBindingDescription: 'Directly linked to Solar Irradiance (>750 W/m²) and UV index. Clear blue skies pump photovoltaic generation and quarterly megawatt earnings.',
        targetGoodWeatherMetric: 'Solar Irradiance > 800 W/m² + Clear Sky Index 95%+',
        weatherSensitivityBeta: 2.1,
        baseDividendApy: 4.0,
        effectiveWeatherDividendApy: 9.4,
        accruedWeatherDividendsUsd: 142.80,
        historicalPrices: [141.2, 142.0, 144.5, 143.8, 147.2, 151.0, 154.2],
        thesis: 'Pioneering ultra-thin crystalline wafer cells. Each kilowatt-hour generated under direct unbroken sunshine directly accrues to the digital shareholder pool.'
    },
    {
        id: 'heli_02',
        symbol: 'HELI',
        name: 'Helios Precision Viticulture & Agrotech',
        sector: 'Agrotech & Viticulture',
        iconEmoji: '🍇',
        basePrice: 88.00,
        currentPrice: 94.60,
        change24hPct: 7.50,
        sharesHeld: 40,
        totalValueUsd: 3784.00,
        weatherBindingDescription: 'Bonded to Growing Degree Days (GDD) and sunny low-humidity warmth (70°F - 80°F). Ideal grapes produce premium reserve vintages with explosive margins.',
        targetGoodWeatherMetric: 'Temperate Warmth 72°F - 78°F + Low Rainfall Volatility',
        weatherSensitivityBeta: 1.6,
        baseDividendApy: 3.8,
        effectiveWeatherDividendApy: 7.8,
        accruedWeatherDividendsUsd: 96.20,
        historicalPrices: [87.5, 88.0, 89.2, 91.0, 90.5, 92.8, 94.6],
        thesis: 'Smart terroir automated sensor arrays trigger micro-irrigation only when ambient sunlight reaches biological grape photosynthetic perfection.'
    },
    {
        id: 'aero_03',
        symbol: 'AERO',
        name: 'AeroGlide High-Ceiling Tourism & Aviation',
        sector: 'Aviation & High-Ceiling Transit',
        iconEmoji: '✈️',
        basePrice: 215.00,
        currentPrice: 228.40,
        change24hPct: 6.23,
        sharesHeld: 20,
        totalValueUsd: 4568.00,
        weatherBindingDescription: 'Tied to High Barometric Stability (>1015 hPa), cloud ceiling clearance, and zero turbulence. Optimal flying conditions eliminate holding delays and boost luxury leisure traffic.',
        targetGoodWeatherMetric: 'Cloud Ceiling > 12,000 ft + Visibility 10+ Miles',
        weatherSensitivityBeta: 1.4,
        baseDividendApy: 3.2,
        effectiveWeatherDividendApy: 6.9,
        accruedWeatherDividendsUsd: 112.50,
        historicalPrices: [214.0, 215.0, 218.0, 219.5, 222.0, 225.2, 228.4],
        thesis: 'High clear-sky indices cut fuel burn by 14% via laminar boundary layer aerodynamic optimization on inter-resort transit routes.'
    },
    {
        id: 'azur_04',
        symbol: 'AZUR',
        name: 'Azure Coast Beachfront Real Estate',
        sector: 'Coastal Leisure & Hospitality',
        iconEmoji: '🏖️',
        basePrice: 64.20,
        currentPrice: 71.80,
        change24hPct: 11.84,
        sharesHeld: 55,
        totalValueUsd: 3949.00,
        weatherBindingDescription: 'Direct daily occupancy dividend triggers whenever ambient coastal temperature exceeds 74°F with 0% rain, driving maximum cabana & resort bookings.',
        targetGoodWeatherMetric: 'Ambient Coast Temp > 74°F + 0% Precipitation',
        weatherSensitivityBeta: 1.9,
        baseDividendApy: 5.0,
        effectiveWeatherDividendApy: 11.5,
        accruedWeatherDividendsUsd: 184.10,
        historicalPrices: [63.5, 64.2, 66.0, 65.5, 68.2, 70.0, 71.8],
        thesis: 'Parametric tokenized resort units that stream instant dividends to token holders during consecutive golden sun days.'
    },
    {
        id: 'zeph_05',
        symbol: 'ZEPH',
        name: 'Zephyr Balmy AeroPower & Micro-Grid',
        sector: 'Wind & Microclimate Grid',
        iconEmoji: '💨',
        basePrice: 110.00,
        currentPrice: 115.30,
        change24hPct: 4.82,
        sharesHeld: 25,
        totalValueUsd: 2882.50,
        weatherBindingDescription: 'Engineered for smooth, laminar breezes (10-18 mph) in high-pressure fair weather systems, avoiding storm shut-offs and maximizing grid feed tariffs.',
        targetGoodWeatherMetric: 'Smooth Laminar Breeze 12-16 mph + 1014 hPa',
        weatherSensitivityBeta: 1.2,
        baseDividendApy: 4.5,
        effectiveWeatherDividendApy: 7.2,
        accruedWeatherDividendsUsd: 74.50,
        historicalPrices: [109.0, 110.0, 111.2, 112.5, 113.8, 114.5, 115.3],
        thesis: 'Next-generation vertical vortex turbines that harvest pleasant thermals generated by sunlit mountain valleys and open plains.'
    },
    {
        id: 'fsky_06',
        symbol: 'FSKY',
        name: 'FairSky Pristine Atmosphere Sovereign Carbon',
        sector: 'Atmospheric Carbon Credits',
        iconEmoji: '🌱',
        basePrice: 42.00,
        currentPrice: 45.10,
        change24hPct: 7.38,
        sharesHeld: 60,
        totalValueUsd: 2706.00,
        weatherBindingDescription: 'Bonded to Air Quality Index (AQI < 25) and low tropospheric smog. Clean sunny days allow natural photosynthesis to scrub maximum CO2, generating certified high-grade credits.',
        targetGoodWeatherMetric: 'AQI < 25 (Pristine) + Sunshine Duration > 8 hrs',
        weatherSensitivityBeta: 1.5,
        baseDividendApy: 3.0,
        effectiveWeatherDividendApy: 6.8,
        accruedWeatherDividendsUsd: 59.30,
        historicalPrices: [41.5, 42.0, 42.8, 43.5, 43.9, 44.4, 45.1],
        thesis: 'Sovereign-backed atmospheric carbon offsets verified via orbital spectral imaging on cloudless sunny days.'
    }
];

export const INITIAL_PARAMETRIC_BONDS: ParametricWeatherBond[] = [
    {
        id: 'bond_01',
        title: 'Golden Sunshine 6-Hour Sustained Irradiance Bond',
        underlyingMetric: 'Solar Irradiance > 850 W/m²',
        strikeThreshold: 'Maintain > 850 W/m² for 6 continuous hours',
        currentObservedValue: '915 W/m² (Hour 4 of 6)',
        payoutPotentialUsd: 1250.00,
        progressPct: 78,
        timeRemainingSec: 7200,
        isTriggered: false,
        insurer: 'Swiss Re Atmospheric Syndicate'
    },
    {
        id: 'bond_02',
        title: 'Clear-Sky Zero Precipitation Weekend Multiplier',
        underlyingMetric: 'Precipitation Probability = 0.0%',
        strikeThreshold: '0mm rainfall recorded across 72 hours',
        currentObservedValue: '0.0mm (48 hrs passed)',
        payoutPotentialUsd: 850.00,
        progressPct: 92,
        timeRemainingSec: 18400,
        isTriggered: false,
        insurer: 'Lloyds Climate Consortium'
    },
    {
        id: 'bond_03',
        title: 'Pristine Air Quality (AQI < 20) Clean Sky Covenant',
        underlyingMetric: 'Particulate PM2.5 < 12 µg/m³',
        strikeThreshold: 'AQI index remains in Green Zone (<25)',
        currentObservedValue: 'AQI 14 (Pristine Alpine Level)',
        payoutPotentialUsd: 500.00,
        progressPct: 100,
        timeRemainingSec: 0,
        isTriggered: true,
        insurer: 'Aether Climate Reserve'
    }
];

export class WeatherOracleService {
    private static activeCityKey: string = 'honolulu';
    private static activeWeather: WeatherReading = {
        city: 'Honolulu',
        region: 'Hawaii, US',
        temperatureF: 84,
        temperatureC: 28.9,
        condition: 'PEAK_SUNSHINE',
        conditionLabel: 'Clear Blue Sky & Radiant Sunshine',
        solarIrradiance: 980,
        uvIndex: 9,
        cloudCoverPct: 8,
        humidityPct: 48,
        barometricPressureHpa: 1016.4,
        airQualityIndex: 14,
        windSpeedMph: 11.2,
        goodWeatherScore: 96,
        goodWeatherMultiplier: 1.88,
        lastUpdated: new Date().toLocaleTimeString()
    };

    private static wallet: DigitalAssetHolderState = {
        holderAddress: '0x77cE8892A8EaB3410F43c19eA4901B93AETHER99',
        holderName: 'Sovereign Atmospheric Custody Vault',
        vaultType: 'SOVEREIGN_ATMOSPHERIC_CUSTODY',
        cashBalanceUsd: 14250.00,
        totalPortfolioValueUsd: 37536.50, // Cash + stocks
        weatherAlphaBonusUsd: 2840.00, // Weather bonus
        totalDividendsClaimedUsd: 667.10,
        portfolioChange24hUsd: 2485.50,
        portfolioChange24hPct: 7.08,
        stocks: [...INITIAL_WEATHER_STOCKS],
        parametricBonds: [...INITIAL_PARAMETRIC_BONDS],
        transactionLog: [
            {
                id: 'tx_init_01',
                timestamp: '2026-09-24 07:15:22',
                type: 'WEATHER_DIVIDEND_PAYOUT',
                symbol: 'SOLR',
                amountUsd: 68.40,
                note: 'Peak solar irradiance trigger (980 W/m²) credited sunny dividend bonus.'
            },
            {
                id: 'tx_init_02',
                timestamp: '2026-09-24 07:45:00',
                type: 'PARAMETRIC_STRIKE_WIN',
                amountUsd: 500.00,
                note: 'Pristine Air Quality Covenant strike met (AQI < 20). Automatic settlement.'
            },
            {
                id: 'tx_init_03',
                timestamp: '2026-09-24 08:20:14',
                type: 'BUY',
                symbol: 'AZUR',
                amountUsd: 1436.00,
                note: 'Acquired 20 shares of Azure Coast ahead of warm weekend sunshine forecast.'
            }
        ]
    };

    private static listeners: Set<() => void> = new Set();
    private static timerStarted = false;

    public static subscribe(callback: () => void): () => void {
        this.listeners.add(callback);
        this.ensureTicker();
        return () => {
            this.listeners.delete(callback);
        };
    }

    private static notify(): void {
        this.recalculatePortfolio();
        this.listeners.forEach(cb => cb());
    }

    private static ensureTicker(): void {
        if (this.timerStarted) return;
        this.timerStarted = true;

        // Periodic minor drift every 5 seconds to give living heartbeat to stocks and weather
        setInterval(() => {
            this.driftWeatherTick();
        }, 5000);
    }

    private static driftWeatherTick(): void {
        const w = this.activeWeather;
        // Minor natural fluctuations
        const tempDelta = (Math.random() - 0.48) * 0.4;
        const solarDelta = (Math.random() - 0.45) * 8;
        
        w.temperatureF = Math.round((w.temperatureF + tempDelta) * 10) / 10;
        w.temperatureC = Math.round(((w.temperatureF - 32) * (5 / 9)) * 10) / 10;
        w.solarIrradiance = Math.max(100, Math.min(1100, Math.round(w.solarIrradiance + solarDelta)));
        w.lastUpdated = new Date().toLocaleTimeString();

        // Recalculate good weather score: high solar, comfortable temp (72-85F), low cloud cover, low AQI
        const tempScore = Math.max(0, 100 - Math.abs(w.temperatureF - 77) * 4);
        const solarScore = (w.solarIrradiance / 1000) * 100;
        const cloudScore = Math.max(0, 100 - w.cloudCoverPct);
        const aqiScore = Math.max(0, 100 - w.airQualityIndex * 2);

        const composite = Math.round((tempScore * 0.3) + (solarScore * 0.35) + (cloudScore * 0.2) + (aqiScore * 0.15));
        w.goodWeatherScore = Math.min(100, Math.max(10, composite));

        // Good weather multiplier ranges from 1.0x (poor weather) to 2.2x (radiant sun)
        w.goodWeatherMultiplier = Math.round((1.0 + (w.goodWeatherScore / 100) * 1.2) * 100) / 100;

        // Update stocks based on multiplier and sensitivity
        this.wallet.stocks = this.wallet.stocks.map(stock => {
            const weatherPush = (w.goodWeatherMultiplier - 1.0) * (stock.weatherSensitivityBeta * 0.05);
            const microFluctuation = (Math.random() - 0.49) * 0.1;
            const newPrice = Math.round((stock.basePrice * (1 + weatherPush + microFluctuation)) * 100) / 100;
            const changePct = Math.round(((newPrice - stock.basePrice) / stock.basePrice) * 10000) / 100;

            const updatedHistory = [...stock.historicalPrices.slice(1), newPrice];
            const updatedDividendApy = Math.round((stock.baseDividendApy * w.goodWeatherMultiplier) * 10) / 10;

            // Stream micro dividends when weather is great
            const microDividend = (w.goodWeatherScore > 75 && stock.sharesHeld > 0)
                ? (stock.sharesHeld * newPrice * (updatedDividendApy / 100) / (365 * 24 * 720)) // per 5 sec
                : 0;

            return {
                ...stock,
                currentPrice: newPrice,
                change24hPct: changePct,
                totalValueUsd: Math.round(newPrice * stock.sharesHeld * 100) / 100,
                historicalPrices: updatedHistory,
                effectiveWeatherDividendApy: updatedDividendApy,
                accruedWeatherDividendsUsd: Math.round((stock.accruedWeatherDividendsUsd + microDividend) * 100) / 100
            };
        });

        this.notify();
    }

    private static recalculatePortfolio(): void {
        let stockTotal = 0;
        let accruedDividends = 0;
        for (const s of this.wallet.stocks) {
            stockTotal += s.totalValueUsd;
            accruedDividends += s.accruedWeatherDividendsUsd;
        }

        const totalPortfolio = Math.round((this.wallet.cashBalanceUsd + stockTotal) * 100) / 100;
        const baselineValue = 32000.00;
        const alpha = Math.max(0, Math.round((totalPortfolio - baselineValue) * 100) / 100);

        this.wallet.totalPortfolioValueUsd = totalPortfolio;
        this.wallet.weatherAlphaBonusUsd = alpha;
        this.wallet.portfolioChange24hUsd = Math.round((stockTotal * 0.075) * 100) / 100;
        this.wallet.portfolioChange24hPct = Math.round(((this.wallet.portfolioChange24hUsd / (totalPortfolio || 1)) * 100) * 100) / 100;
    }

    // Public getters
    public static getWeather(): WeatherReading {
        return this.activeWeather;
    }

    public static getWallet(): DigitalAssetHolderState {
        return this.wallet;
    }

    public static getCityKey(): string {
        return this.activeCityKey;
    }

    // Change city
    public static setCity(cityKey: string): void {
        const cityData = SUPPORTED_CITIES[cityKey];
        if (!cityData) return;

        this.activeCityKey = cityKey;
        this.activeWeather = {
            city: cityData.city,
            region: cityData.region,
            temperatureF: cityData.defaultTemp,
            temperatureC: Math.round(((cityData.defaultTemp - 32) * (5 / 9)) * 10) / 10,
            condition: cityData.baseSolar > 900 ? 'PEAK_SUNSHINE' : 'CLEAR_BLUE',
            conditionLabel: cityData.baseSolar > 900 ? 'Radiant Sun & Thermal Harmony' : 'Clear Mediterranean Breeze',
            solarIrradiance: cityData.baseSolar,
            uvIndex: cityData.baseSolar > 900 ? 9 : 7,
            cloudCoverPct: Math.round(Math.random() * 15),
            humidityPct: 45 + Math.round(Math.random() * 15),
            barometricPressureHpa: 1015.2,
            airQualityIndex: 12 + Math.round(Math.random() * 15),
            windSpeedMph: 8 + Math.round(Math.random() * 7),
            goodWeatherScore: 92,
            goodWeatherMultiplier: 1.75,
            lastUpdated: new Date().toLocaleTimeString()
        };

        this.driftWeatherTick();
    }

    // Weather manual override / simulation
    public static simulateCondition(preset: 'RADIANT_SUMMER' | 'GOLDEN_CLEAR' | 'TROPICAL_BREEZE' | 'PASSING_CLOUD' | 'STORM_OVERCAST'): void {
        const w = this.activeWeather;
        if (preset === 'RADIANT_SUMMER') {
            w.condition = 'PEAK_SUNSHINE';
            w.conditionLabel = 'Radiant Summer Solstice Sun';
            w.temperatureF = 88;
            w.solarIrradiance = 1050;
            w.uvIndex = 11;
            w.cloudCoverPct = 2;
            w.humidityPct = 38;
            w.barometricPressureHpa = 1018.0;
            w.airQualityIndex = 11;
            w.windSpeedMph = 7.5;
            w.goodWeatherScore = 99;
            w.goodWeatherMultiplier = 2.18;
        } else if (preset === 'GOLDEN_CLEAR') {
            w.condition = 'GOLDEN_HOUR';
            w.conditionLabel = 'Warm Golden Hour Sunshine';
            w.temperatureF = 76;
            w.solarIrradiance = 840;
            w.uvIndex = 6;
            w.cloudCoverPct = 5;
            w.humidityPct = 44;
            w.barometricPressureHpa = 1016.5;
            w.airQualityIndex = 15;
            w.windSpeedMph = 9.0;
            w.goodWeatherScore = 94;
            w.goodWeatherMultiplier = 1.82;
        } else if (preset === 'TROPICAL_BREEZE') {
            w.condition = 'CLEAR_BLUE';
            w.conditionLabel = 'Balmy Coastal High-Pressure';
            w.temperatureF = 81;
            w.solarIrradiance = 920;
            w.uvIndex = 8;
            w.cloudCoverPct = 12;
            w.humidityPct = 52;
            w.barometricPressureHpa = 1015.0;
            w.airQualityIndex = 18;
            w.windSpeedMph = 14.0;
            w.goodWeatherScore = 91;
            w.goodWeatherMultiplier = 1.72;
        } else if (preset === 'PASSING_CLOUD') {
            w.condition = 'PARTLY_CLOUDY';
            w.conditionLabel = 'Passing White Cumulus Clouds';
            w.temperatureF = 69;
            w.solarIrradiance = 520;
            w.uvIndex = 4;
            w.cloudCoverPct = 48;
            w.humidityPct = 62;
            w.barometricPressureHpa = 1012.0;
            w.airQualityIndex = 32;
            w.windSpeedMph = 12.0;
            w.goodWeatherScore = 65;
            w.goodWeatherMultiplier = 1.28;
        } else {
            w.condition = 'STORM_FRONT';
            w.conditionLabel = 'Passing Grey Front (Hedge Test)';
            w.temperatureF = 58;
            w.solarIrradiance = 210;
            w.uvIndex = 1;
            w.cloudCoverPct = 92;
            w.humidityPct = 85;
            w.barometricPressureHpa = 1004.0;
            w.airQualityIndex = 45;
            w.windSpeedMph = 24.0;
            w.goodWeatherScore = 32;
            w.goodWeatherMultiplier = 1.05;
        }

        w.temperatureC = Math.round(((w.temperatureF - 32) * (5 / 9)) * 10) / 10;
        w.lastUpdated = new Date().toLocaleTimeString();
        this.driftWeatherTick();
    }

    // Trading operations
    public static buyShares(stockId: string, sharesToBuy: number): { success: boolean; message: string } {
        const stock = this.wallet.stocks.find(s => s.id === stockId);
        if (!stock) return { success: false, message: 'Stock instrument not found.' };

        const cost = Math.round((stock.currentPrice * sharesToBuy) * 100) / 100;
        if (this.wallet.cashBalanceUsd < cost) {
            return { success: false, message: `Insufficient vault reserves. Required: $${cost.toLocaleString()}, Available: $${this.wallet.cashBalanceUsd.toLocaleString()}` };
        }

        this.wallet.cashBalanceUsd = Math.round((this.wallet.cashBalanceUsd - cost) * 100) / 100;
        stock.sharesHeld += sharesToBuy;
        stock.totalValueUsd = Math.round(stock.sharesHeld * stock.currentPrice * 100) / 100;

        this.wallet.transactionLog.unshift({
            id: `tx_${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            type: 'BUY',
            symbol: stock.symbol,
            amountUsd: cost,
            note: `Purchased ${sharesToBuy} shares of ${stock.symbol} @ $${stock.currentPrice.toFixed(2)} (Weather multiplier: ${this.activeWeather.goodWeatherMultiplier}x)`
        });

        this.notify();
        return { success: true, message: `Successfully purchased ${sharesToBuy} shares of ${stock.symbol} for $${cost.toLocaleString()}` };
    }

    public static sellShares(stockId: string, sharesToSell: number): { success: boolean; message: string } {
        const stock = this.wallet.stocks.find(s => s.id === stockId);
        if (!stock) return { success: false, message: 'Stock instrument not found.' };

        if (stock.sharesHeld < sharesToSell) {
            return { success: false, message: `Cannot sell ${sharesToSell} shares. You currently hold ${stock.sharesHeld}.` };
        }

        const proceeds = Math.round((stock.currentPrice * sharesToSell) * 100) / 100;
        stock.sharesHeld -= sharesToSell;
        stock.totalValueUsd = Math.round(stock.sharesHeld * stock.currentPrice * 100) / 100;
        this.wallet.cashBalanceUsd = Math.round((this.wallet.cashBalanceUsd + proceeds) * 100) / 100;

        this.wallet.transactionLog.unshift({
            id: `tx_${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            type: 'SELL',
            symbol: stock.symbol,
            amountUsd: proceeds,
            note: `Sold ${sharesToSell} shares of ${stock.symbol} @ $${stock.currentPrice.toFixed(2)}`
        });

        this.notify();
        return { success: true, message: `Successfully sold ${sharesToSell} shares of ${stock.symbol} for $${proceeds.toLocaleString()}` };
    }

    public static claimAllDividends(): { success: boolean; amountClaimed: number } {
        let totalClaimable = 0;
        for (const stock of this.wallet.stocks) {
            totalClaimable += stock.accruedWeatherDividendsUsd;
            stock.accruedWeatherDividendsUsd = 0;
        }

        totalClaimable = Math.round(totalClaimable * 100) / 100;
        if (totalClaimable <= 0) {
            return { success: false, amountClaimed: 0 };
        }

        this.wallet.cashBalanceUsd = Math.round((this.wallet.cashBalanceUsd + totalClaimable) * 100) / 100;
        this.wallet.totalDividendsClaimedUsd = Math.round((this.wallet.totalDividendsClaimedUsd + totalClaimable) * 100) / 100;

        this.wallet.transactionLog.unshift({
            id: `tx_claim_${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            type: 'WEATHER_DIVIDEND_PAYOUT',
            amountUsd: totalClaimable,
            note: `Claimed $${totalClaimable.toFixed(2)} in meteorological sunshine yields across all portfolio stocks.`
        });

        this.notify();
        return { success: true, amountClaimed: totalClaimable };
    }

    public static triggerBondPayout(bondId: string): { success: boolean; payout: number } {
        const bond = this.wallet.parametricBonds.find(b => b.id === bondId);
        if (!bond || !bond.isTriggered) return { success: false, payout: 0 };

        const payout = bond.payoutPotentialUsd;
        this.wallet.cashBalanceUsd = Math.round((this.wallet.cashBalanceUsd + payout) * 100) / 100;
        bond.payoutPotentialUsd = 0;
        bond.strikeThreshold = 'SETTLED & PAID';

        this.wallet.transactionLog.unshift({
            id: `tx_settle_${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            type: 'PARAMETRIC_STRIKE_WIN',
            amountUsd: payout,
            note: `Parametric Climate Bond "${bond.title}" settled by ${bond.insurer}. Paid $${payout.toFixed(2)}.`
        });

        this.notify();
        return { success: true, payout };
    }

    public static depositCash(amount: number): void {
        this.wallet.cashBalanceUsd = Math.round((this.wallet.cashBalanceUsd + amount) * 100) / 100;
        this.wallet.transactionLog.unshift({
            id: `tx_dep_${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            type: 'REBALANCE',
            amountUsd: amount,
            note: `Deposited $${amount.toFixed(2)} into Sovereign Atmospheric Vault.`
        });
        this.notify();
    }
}
