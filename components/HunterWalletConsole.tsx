import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Wallet, Shield, ShieldAlert, ShieldCheck, TrendingUp, Coins, Cpu, Layers, Zap, Play, 
  Terminal, Settings, Search, Plus, RefreshCw, Compass, Crosshair, Activity, Eye, 
  BookOpen, Briefcase, Code, Lock, Unlock, Globe, HelpCircle, Info, ExternalLink, 
  AlertTriangle, CheckCircle2, DollarSign, ArrowUpRight, ArrowDownLeft, Trash2, ChevronRight,
  Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// =========================================================
// OMNI-CHAIN HUNTER WALLET & AUDIT PIPELINE CONSOLE
// =========================================================
// "Knowledge and knowhow are the ultimate assets. Secure them, 
// and the capital will follow." — Chief Auditor Barnaby Vance
// =========================================================

export interface AssetToken {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  basePrice: number; // Price as of 7/11/2026 4:49 pm
  currentPrice: number; // Fluctuate up to the second
  chain: string;
  contractAddress: string;
  isNFT: boolean;
  metadata?: {
    imageUrl?: string;
    description?: string;
    powerRating?: string;
    creator?: string;
  };
}

export interface ChainConfig {
  id: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  chainId: number;
  blockHeight: number;
  latency: number;
  connected: boolean;
}

export interface PredatorBot {
  id: string;
  ip: string;
  type: 'FLASH_BOT_SANDWICH' | 'PHISHING_SCRIPT' | 'MEV_FRONTRUNNER' | 'DEC_IP_HIJACKER';
  riskScore: number; // 0-100
  targetAsset: string;
  originCountry: string;
  status: 'ACTIVE_HUNT' | 'RECYCLED_MINER';
  interceptedAt?: string;
  hashrateReward?: number; // H/s added when recycled
}

export interface AuditLog {
  id: string;
  timestamp: string;
  category: 'AUDIT' | 'HUNTER' | 'MINT' | 'STATE';
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export const HunterWalletConsole: React.FC = () => {
  // ---------------------------------------------------------
  // 1. CHRONOLOGY STATE (Locked at Reference: 7/11/2026 4:49 pm)
  // ---------------------------------------------------------
  const referenceTimeStr = '2026-07-11T16:49:00';
  const [tickerOffsetMs, setTickerOffsetMs] = useState<number>(0);
  const [liveValueUSD, setLiveValueUSD] = useState<number>(0);

  // Time-tracking system
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setTickerOffsetMs(Date.now() - start);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSovereignTime = () => {
    const baseTime = new Date(referenceTimeStr);
    return new Date(baseTime.getTime() + tickerOffsetMs);
  };

  const getSovereignTimeFormatted = () => {
    const t = getSovereignTime();
    return t.toLocaleDateString() + ' ' + t.toLocaleTimeString();
  };

  // ---------------------------------------------------------
  // 2. SUPPORTED CHAINS CONFIGURATION (Connect to any chain)
  // ---------------------------------------------------------
  const [chains, setChains] = useState<ChainConfig[]>([
    { id: 'aetheros', name: 'AetherOS Sovereign Chain', symbol: 'AETH', rpcUrl: 'https://rpc.sovereign.aetheros.net', chainId: 9001, blockHeight: 14220551, latency: 12, connected: true },
    { id: 'ethereum', name: 'Ethereum Mainnet', symbol: 'ETH', rpcUrl: 'https://eth.sovereign-nodes.io', chainId: 1, blockHeight: 20119330, latency: 45, connected: true },
    { id: 'solana', name: 'Solana RPC Gateway', symbol: 'SOL', rpcUrl: 'https://solana.mainnet-beta.quiknode.pro', chainId: 101, blockHeight: 284112954, latency: 8, connected: true },
    { id: 'monero', name: 'Monero Cryptonight Stealth', symbol: 'XMR', rpcUrl: 'https://xmr.sovereign.onion:18081', chainId: 88, blockHeight: 3155102, latency: 120, connected: true },
    { id: 'bitcoin', name: 'Bitcoin Segwit Gateway', symbol: 'BTC', rpcUrl: 'https://btc.sovereign.node', chainId: 2, blockHeight: 890442, latency: 310, connected: true }
  ]);

  const [selectedChain, setSelectedChain] = useState<string>('aetheros');
  const [customChainName, setCustomChainName] = useState<string>('');
  const [customChainSymbol, setCustomChainSymbol] = useState<string>('');
  const [customChainRpc, setCustomChainRpc] = useState<string>('');
  const [customChainId, setCustomChainId] = useState<string>('');
  const [showAddChain, setShowAddChain] = useState<boolean>(false);

  // ---------------------------------------------------------
  // 3. ASSETS DATA: TOKENS & NFTS (Gets up to the second price)
  // ---------------------------------------------------------
  const [assets, setAssets] = useState<AssetToken[]>([
    { id: 'aeth', name: 'Aether Gas Token', symbol: 'AETH', balance: 450.00, basePrice: 1.00, currentPrice: 1.00, chain: 'aetheros', contractAddress: '0x0000000000000000000000000000000000000001', isNFT: false },
    { id: 'bitcoin-raw', name: 'Bitcoin Core Standard (SegWit)', symbol: 'BTC', balance: 0.85, basePrice: 62450.00, currentPrice: 62450.00, chain: 'bitcoin', contractAddress: 'bc1qutxovideo0049fjnf4fsj02d0', isNFT: false },
    { id: 'bitcoin-legacy', name: 'Bitcoin Legacy Sovereign (Accredited)', symbol: 'BTC', balance: 1.15, basePrice: 62450.00, currentPrice: 62450.00, chain: 'bitcoin', contractAddress: '1RyaeKgBrmrS364EDPXcRDqEpNzfcR33T', isNFT: false },
    { id: 'eth-vault', name: 'Wrapped Ether Liquidity', symbol: 'ETH', balance: 14.50, basePrice: 3420.00, currentPrice: 3420.00, chain: 'ethereum', contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', isNFT: false },
    { id: 'sol-lamport', name: 'Solana High Frequency', symbol: 'SOL', balance: 125.40, basePrice: 142.50, currentPrice: 142.50, chain: 'solana', contractAddress: 'So11111111111111111111111111111111111111112', isNFT: false },
    { id: 'xmr-stealth', name: 'Monero Anonymous Private', symbol: 'XMR', balance: 35.00, basePrice: 165.20, currentPrice: 165.20, chain: 'monero', contractAddress: 'StealthPayloadAddress95CharsFullEncryptionMoatSecure', isNFT: false },
    { id: 'genesis-nft', name: 'AetherOS Genesis Block NFT', symbol: 'AETHGEN', balance: 1, basePrice: 25000.00, currentPrice: 25000.00, chain: 'aetheros', contractAddress: '0x32A398D9fCc3d48911C5ff2D18302D8B11C3A1F2', isNFT: true, metadata: { imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=300&auto=format&fit=crop', description: 'Legendary sovereign identity artifact. Grants unlimited executive consensus rights.', powerRating: 'Consensus Overlord', creator: 'Maestro Architect' } },
    { id: 'hunting-trophy-1', name: 'Intercepted FlashBot Core #190', symbol: 'BOTCORE', balance: 1, basePrice: 850.00, currentPrice: 850.00, chain: 'ethereum', contractAddress: '0x88F0022219AcB9eF553535ff441f71A212d1F890', isNFT: true, metadata: { imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop', description: 'MEV Sandwich Frontrunner decompiled and converted into a proof-of-work mining block.', powerRating: 'AETH Mining Hashrate: +450 H/s', creator: 'Hunter V' } }
  ]);

  // Form states for minting any Token or NFT
  const [showMintModal, setShowMintModal] = useState<boolean>(false);
  const [mintIsNFT, setMintIsNFT] = useState<boolean>(false);
  const [mintName, setMintName] = useState<string>('');
  const [mintSymbol, setMintSymbol] = useState<string>('');
  const [mintBalance, setMintBalance] = useState<string>('100');
  const [mintPrice, setMintPrice] = useState<string>('5.00');
  const [mintChain, setMintChain] = useState<string>('aetheros');
  const [mintDesc, setMintDesc] = useState<string>('');
  const [mintImage, setMintImage] = useState<string>('');

  // ---------------------------------------------------------
  // 4. CHIEF AUDITOR BARNABY VANCE PIPELINE STATE
  // ---------------------------------------------------------
  // Vance's businessman attitude: "Knowledge and knowhow are the ultimate leverage."
  const [auditScore, setAuditScore] = useState<number>(88);
  const [knowledgeFactor, setKnowledgeFactor] = useState<number>(94);
  const [auditProgress, setAuditProgress] = useState<number>(0);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: '1', timestamp: '16:49:02', category: 'STATE', message: 'Sovereign Core Initialized. Synchronization established at 07/11/2026.', type: 'info' },
    { id: '2', timestamp: '16:49:05', category: 'AUDIT', message: 'Vance Capital Pipeline Active: Assessing ROI of Cryptographic Security Immunity.', type: 'success' },
    { id: '3', timestamp: '16:49:10', category: 'HUNTER', message: 'Honeypots armed. Sentinel sensors listening for predatory MEV payloads.', type: 'warning' }
  ]);

  const [vanceQuote, setVanceQuote] = useState<string>(
    "Security is not a cost center, my friend. It is a premium barrier of entries. Secure your code, and the cash flows take care of themselves."
  );

  const vanceQuotes = [
    "Sovereign knowhow is a high-yield moat. Why patch code when you can completely securitize and scale the asset yield?",
    "Predators are just unmonetized compute nodes waiting for our intervention. Let's redirect their frontrunning capital into our mining farms.",
    "Risk is perfectly fine. Unquantified and unmanaged risk, however, is a direct pathway to a devastating balance sheet. Let's optimize.",
    "A clean contract audit doesn't just protect funds; it signals elite intellectual capability to potential market-makers. Leverage that knowhow.",
    "I view phishing domains not as threats, but as highly aggressive, hostile marketing pipelines. We shall acquire and liquidate them."
  ];

  // ---------------------------------------------------------
  // 5. THREAT HUNTER & BOT RECYCLER (Hunter V) STATE
  // ---------------------------------------------------------
  const [activeRadarScale, setActiveRadarScale] = useState<number>(100);
  const [decoysArmed, setDecoysArmed] = useState<boolean>(true);
  const [hunterLogs, setHunterLogs] = useState<string[]>([
    "[TACTICAL] Decoys armed. Synthesizing false high-value LP pools on Ethereum and Solana.",
    "[RADAR] Scanning mempools for frontrunning sandwich predators..."
  ]);

  const [threats, setThreats] = useState<PredatorBot[]>([
    { id: 'P-99', ip: '45.22.189.102', type: 'FLASH_BOT_SANDWICH', riskScore: 92, targetAsset: 'ETH/AETH Liquidity Pool', originCountry: 'RU', status: 'ACTIVE_HUNT' },
    { id: 'P-104', ip: '198.51.100.42', type: 'PHISHING_SCRIPT', riskScore: 97, targetAsset: 'Sovereign Credentials', originCountry: 'CN', status: 'ACTIVE_HUNT' },
    { id: 'P-108', ip: '185.190.140.11', type: 'MEV_FRONTRUNNER', riskScore: 84, targetAsset: 'Solana Arbitrage Path', originCountry: 'NL', status: 'ACTIVE_HUNT' }
  ]);

  const [minersCount, setMinersCount] = useState<number>(2);
  const [totalHashrate, setTotalHashrate] = useState<number>(900); // H/s generated by recycled bots

  // ---------------------------------------------------------
  // 6. ETH|QUITY :: L[i]ON (Behavioral-Collateral) LOGEX STATE
  // ---------------------------------------------------------
  const [activeSubTab, setActiveSubTab] = useState<'terminal' | 'lion_logex' | 'api_portfolio'>('terminal');
  const [lastActionTimestamp, setLastActionTimestamp] = useState<number | null>(null);
  const [userBehaviorScore, setUserBehaviorScore] = useState<number>(0.5);
  const [calibrationX, setCalibrationX] = useState<number>(500); // ms - aggressive retry threshold
  const [calibrationY, setCalibrationY] = useState<number>(3000); // ms - patient wait state threshold
  const [weightPacing, setWeightPacing] = useState<number>(60); // % weighting for pacing vs intervals
  const [logexLogs, setLogexLogs] = useState<string[]>([
    "[L[i]ON LOGEX] 🦁 Behavioral-Collateral pipeline initialized.",
    "[L[i]ON LOGEX] Epoch synchronized. Scan-Behavior(Phase) sensors primed.",
    "[L[i]ON LOGEX] Default metrics calibrated: X=500ms (Force-Threshold), Y=3000ms (Pacing-Threshold)."
  ]);
  const [isSimulatingLogex, setIsSimulatingLogex] = useState<boolean>(false);
  const [logexSimStatus, setLogexSimStatus] = useState<string>('');
  const [latestDelta, setLatestDelta] = useState<number | null>(null);
  const [latestClassification, setLatestClassification] = useState<'CHAOS' | 'PACED' | 'NEUTRAL' | null>(null);

  // ---------------------------------------------------------
  // 6b. REAL-TIME THIRD-PARTY APIs & OAUTH PORTFOLIOS STATES
  // ---------------------------------------------------------
  const [isRatesApiLoading, setIsRatesApiLoading] = useState<boolean>(false);
  const [apiSource, setApiSource] = useState<string>("Sovereign Initial Feeds");
  const [apiLastUpdated, setApiLastUpdated] = useState<string>('7/11/2026 4:49 pm');
  const [isOauthConnecting, setIsOauthConnecting] = useState<boolean>(false);
  const [connectedPortfolio, setConnectedPortfolio] = useState<{ provider: string, connectedAt: string, assets: any[] } | null>(null);
  const [apiLogs, setApiLogs] = useState<string[]>([
    "[API-FEED] Initial sovereign feeds established.",
    "[API-FEED] Heuristic timing loop active at reference 7/11/2026 4:49:00 PM."
  ]);

  // Listen for OAuth messages from the popup window
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'OAUTH_AUTH_SUCCESS') {
        const payload = event.data;
        setIsOauthConnecting(false);
        setConnectedPortfolio(payload.portfolio);
        toast.success(`Sovereign Portfolio Linked!`, {
          description: `Successfully authenticated with ${payload.portfolio.provider}.`
        });
        setApiLogs(prev => [
          `[OAUTH-SUCCESS] Handshake approved. Token received: ${payload.code}`,
          `[OAUTH-SUCCESS] Connected to ${payload.portfolio.provider} at ${payload.portfolio.connectedAt}`,
          `[PORTFOLIO-SYNC] Imported ${payload.portfolio.assets.length} new high-value allocations.`,
          ...prev
        ]);
        
        // Add the imported assets to the local assets list!
        setAssets(prevAssets => {
          // Avoid duplicate additions
          const filtered = prevAssets.filter(a => !a.id.startsWith('ext-'));
          const extTokens: AssetToken[] = payload.portfolio.assets.map((item: any) => ({
            id: item.id,
            name: item.name,
            symbol: item.symbol,
            balance: item.balance,
            basePrice: item.price,
            currentPrice: item.price,
            chain: item.chain,
            contractAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
            isNFT: false
          }));
          return [...filtered, ...extTokens];
        });
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleFetchRates = async () => {
    setIsRatesApiLoading(true);
    setApiLogs(prev => [`[API-REQ] Querying real-time market tickers from Express Proxy /api/portfolio/rates...`, ...prev]);
    try {
      const response = await fetch("/api/portfolio/rates");
      const data = await response.json();
      if (data.success && data.rates) {
        setApiSource(data.source);
        setApiLastUpdated(new Date(data.timestamp).toLocaleTimeString());
        
        // Update asset prices
        setAssets(prev => prev.map(asset => {
          let coinKey = '';
          if (asset.symbol === 'BTC') coinKey = 'bitcoin';
          else if (asset.symbol === 'ETH') coinKey = 'ethereum';
          else if (asset.symbol === 'SOL') coinKey = 'solana';
          else if (asset.symbol === 'XMR') coinKey = 'monero';
          
          if (coinKey && data.rates[coinKey]) {
            const newPrice = data.rates[coinKey];
            return {
              ...asset,
              basePrice: newPrice,
              currentPrice: newPrice
            };
          }
          return asset;
        }));
        
        toast.success(`Rates Synchronized!`, {
          description: `Fetched live tickers from ${data.source}.`
        });
        
        setApiLogs(prev => [
          `[API-RES] Received payload from ${data.source}. Rates: BTC: $${data.rates.bitcoin.toFixed(2)}, ETH: $${data.rates.ethereum.toFixed(2)}, SOL: $${data.rates.solana.toFixed(2)}, XMR: $${data.rates.monero.toFixed(2)}`,
          `[API-SYNC] Portfolio valuation re-calibrated.`,
          ...prev
        ]);
      } else {
        throw new Error(data.reason || "Invalid response format");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Price synchronization failed.");
      setApiLogs(prev => [`[API-ERROR] Failed to synchronize rates: ${error.message || error}`, ...prev]);
    } finally {
      setIsRatesApiLoading(false);
    }
  };

  const handleInitiateOAuth = async () => {
    setIsOauthConnecting(true);
    setApiLogs(prev => [`[OAUTH-INIT] Triggering decentralized OAuth request to secure endpoint /api/auth/url...`, ...prev]);
    try {
      const response = await fetch("/api/auth/url");
      const data = await response.json();
      if (data.url) {
        const width = 500;
        const height = 620;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        setApiLogs(prev => [`[OAUTH-POPUP] Opening secure authorization popup window...`, ...prev]);
        const oauthWindow = window.open(
          data.url,
          "SovereignLedgerOAuth",
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
        );
        
        if (!oauthWindow) {
          throw new Error("Popup blocked by browser. Please enable popups to sync portfolios.");
        }
      } else {
        throw new Error("Failed to retrieve authorization URL.");
      }
    } catch (error: any) {
      console.error(error);
      setIsOauthConnecting(false);
      toast.error(error.message || "OAuth initiation failed.");
      setApiLogs(prev => [`[OAUTH-ERROR] OAuth handshake failed: ${error.message || error}`, ...prev]);
    }
  };

  const handleDisconnectPortfolio = () => {
    setConnectedPortfolio(null);
    setAssets(prev => prev.filter(a => !a.id.startsWith('ext-')));
    toast.info("Portfolio Disconnected", {
      description: "External allocations purged from secure ledger memory."
    });
    setApiLogs(prev => [
      `[OAUTH-DISCONNECT] External portfolio integration severed by user command.`,
      `[PORTFOLIO-PURGE] Removed live third-party assets.`,
      ...prev
    ]);
  };

  // ---------------------------------------------------------
  // 7. ALPENGLOW CONSENSUS UPGRADE STATE
  // ---------------------------------------------------------
  const [isAlpenglowUpgraded, setIsAlpenglowUpgraded] = useState<boolean>(false);
  const [alpenglowBlockCount, setAlpenglowBlockCount] = useState<number>(0);
  const [isAlpenglowRunning, setIsAlpenglowRunning] = useState<boolean>(false);
  const [votorVotingRound, setVotorVotingRound] = useState<number>(1);
  const [votorStakedAgreement, setVotorStakedAgreement] = useState<number>(0); // 0 to 100%
  const [rotorShredCount, setRotorShredCount] = useState<number>(0);

  // ---------------------------------------------------------
  // EFFECTS & HIGH-FREQUENCY LIVE ENGINE
  // ---------------------------------------------------------

  // 1. Live fluctuation of prices up to the second
  useEffect(() => {
    const priceInterval = setInterval(() => {
      setAssets(prev => prev.map(asset => {
        if (asset.id === 'aeth') return asset; // Fixed gas peg
        const direction = Math.random() > 0.48 ? 1 : -1;
        const scale = asset.isNFT ? 0.001 : 0.002;
        const change = asset.basePrice * (Math.random() * scale) * direction;
        const nextPrice = Math.max(0.1, asset.currentPrice + change);
        return {
          ...asset,
          currentPrice: nextPrice
        };
      }));
    }, 1000);

    return () => clearInterval(priceInterval);
  }, []);

  // 2. Calculated total portfolio valuation
  const totalValueUSD = useMemo(() => {
    return assets.reduce((sum, asset) => sum + (asset.balance * asset.currentPrice), 0);
  }, [assets]);

  // 3. Mining Farm generator - mined AETH grows in real-time based on hashrate
  useEffect(() => {
    const mineInterval = setInterval(() => {
      if (totalHashrate > 0) {
        const minedAmount = (totalHashrate * 0.000005);
        setAssets(prev => prev.map(asset => {
          if (asset.id === 'aeth') {
            return {
              ...asset,
              balance: asset.balance + minedAmount
            };
          }
          return asset;
        }));
      }
    }, 1500);
    return () => clearInterval(mineInterval);
  }, [totalHashrate]);

  // 4. Random incoming bot events
  useEffect(() => {
    const botInterval = setInterval(() => {
      if (Math.random() > 0.7 && threats.filter(t => t.status === 'ACTIVE_HUNT').length < 6) {
        const botTypes: Array<PredatorBot['type']> = ['FLASH_BOT_SANDWICH', 'PHISHING_SCRIPT', 'MEV_FRONTRUNNER', 'DEC_IP_HIJACKER'];
        const randomType = botTypes[Math.floor(Math.random() * botTypes.length)];
        const targetAssets = ['AETH Swap', 'BTC Multisig Hub', 'Uniswap LP', 'Solana Raydium Pool'];
        const randomTarget = targetAssets[Math.floor(Math.random() * targetAssets.length)];
        const countries = ['RU', 'CN', 'UA', 'KP', 'RO'];
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        const ip = `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
        const newBotId = `P-${Math.floor(Math.random() * 900) + 100}`;
        const risk = Math.floor(Math.random() * 25) + 75;

        const newBot: PredatorBot = {
          id: newBotId,
          ip,
          type: randomType,
          riskScore: risk,
          targetAsset: randomTarget,
          originCountry: randomCountry,
          status: 'ACTIVE_HUNT'
        };

        setThreats(prev => [newBot, ...prev]);
        setHunterLogs(prev => [
          `[ALERT] ⚠️ Threat Intercepted: ${randomType} detected at IP ${ip} tracking target ${randomTarget}.`,
          ...prev
        ]);
        addAuditLog('HUNTER', `New predator bot ${newBotId} locked in tactical scopes. Origin: ${randomCountry}`, 'alert');
        toast.warning(`New Predator Spotted!`, {
          description: `${randomType} targeting ${randomTarget}. Secure active decoders.`
        });
      }
    }, 12000);

    return () => clearInterval(botInterval);
  }, [threats]);

  // 5. Audit Vance quote rotation
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      if (!isAuditing) {
        const nextQuote = vanceQuotes[Math.floor(Math.random() * vanceQuotes.length)];
        setVanceQuote(nextQuote);
      }
    }, 18000);
    return () => clearInterval(quoteInterval);
  }, [isAuditing]);

  // ---------------------------------------------------------
  // ACTIONS & HANDLERS
  // ---------------------------------------------------------

  const addAuditLog = (category: AuditLog['category'], message: string, type: AuditLog['type']) => {
    const now = getSovereignTime();
    const timeStr = now.toTimeString().split(' ')[0];
    setAuditLogs(prev => [{
      id: String(Date.now()),
      timestamp: timeStr,
      category,
      message,
      type
    }, ...prev]);
  };

  // Add Custom Chain Handler
  const handleAddChain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customChainName || !customChainSymbol || !customChainRpc) {
      toast.error('Connection Failed', { description: 'All chain parameters must be fully calibrated.' });
      return;
    }

    const newChain: ChainConfig = {
      id: customChainName.toLowerCase().replace(/\s+/g, '-'),
      name: customChainName,
      symbol: customChainSymbol,
      rpcUrl: customChainRpc,
      chainId: Number(customChainId) || Math.floor(Math.random() * 5000) + 1,
      blockHeight: Math.floor(Math.random() * 10000000) + 100000,
      latency: Math.floor(Math.random() * 300) + 10,
      connected: true
    };

    setChains(prev => [...prev, newChain]);
    setSelectedChain(newChain.id);
    addAuditLog('STATE', `Connected custom chain gateway: ${newChain.name} (Chain ID: ${newChain.chainId})`, 'success');
    toast.success('Omni-Chain Link Active', {
      description: `Successfully established communication gateway with ${newChain.name}.`
    });

    // Reset Form
    setCustomChainName('');
    setCustomChainSymbol('');
    setCustomChainRpc('');
    setCustomChainId('');
    setShowAddChain(false);
  };

  // Mint Any Token or NFT Handler
  const handleMintAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintName || !mintSymbol) {
      toast.error('Minting Refused', { description: 'Please define token name and ticker abbreviation.' });
      return;
    }

    const price = Number(mintPrice) || 1.0;
    const qty = Number(mintBalance) || 100;

    const newAsset: AssetToken = {
      id: `m-${Date.now()}`,
      name: mintName,
      symbol: mintSymbol.toUpperCase(),
      balance: qty,
      basePrice: price,
      currentPrice: price,
      chain: mintChain,
      contractAddress: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      isNFT: mintIsNFT,
      metadata: mintIsNFT ? {
        imageUrl: mintImage || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=300&auto=format&fit=crop',
        description: mintDesc || 'Custom minted non-fungible sovereign collectible artifact.',
        powerRating: 'Tier 1 Secured Asset',
        creator: 'Sovereign Portal User'
      } : undefined
    };

    setAssets(prev => [...prev, newAsset]);
    addAuditLog('MINT', `Minted ${qty} ${newAsset.symbol} ${mintIsNFT ? 'NFT' : 'Fungible Token'} directly on ${chains.find(c => c.id === mintChain)?.name}.`, 'success');
    toast.success(`Mint Operation Successful`, {
      description: `Registered ${qty} ${newAsset.symbol} secure cryptographic allocations.`
    });

    // Reset Form
    setMintName('');
    setMintSymbol('');
    setMintBalance('100');
    setMintPrice('5.00');
    setMintDesc('');
    setMintImage('');
    setShowMintModal(false);
  };

  // Businessman Vance's Audit Activation
  const handleRunAudit = () => {
    if (isAuditing) return;
    setIsAuditing(true);
    setAuditProgress(0);
    setVanceQuote("Let us begin. Standby while we run our knowledge matrix over the ledger. Let's find those unoptimized yields.");
    addAuditLog('AUDIT', 'Businessman Audit Pipeline Engaged. Examining smart-contract dependencies...', 'info');

    const interval = setInterval(() => {
      setAuditProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAuditing(false);
          const scoreBump = Math.floor(Math.random() * 5) + 1;
          const knowBump = Math.floor(Math.random() * 4) + 1;
          const nextScore = Math.min(100, auditScore + scoreBump);
          const nextKnow = Math.min(100, knowledgeFactor + knowBump);
          setAuditScore(nextScore);
          setKnowledgeFactor(nextKnow);
          setVanceQuote("Superb performance. We've optimized contract execution friction and eliminated dead memory buffers. Risk structure is flawless.");
          addAuditLog('AUDIT', `Vance Audit Pipeline finished: Portfolio Audited. Health: ${nextScore}/100. Knowledge Factor: ${nextKnow}/100.`, 'success');
          toast.success('Security Audit Concluded', {
            description: `Audit Score upgraded to ${nextScore}/100. Business-grade compliance active.`
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Recycle Threat into Mining Node (Hunter V action)
  const handleRecycleBot = (id: string) => {
    const targetBot = threats.find(t => t.id === id);
    if (!targetBot) return;

    // Convert state
    setThreats(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'RECYCLED_MINER',
          interceptedAt: getSovereignTime().toLocaleTimeString()
        };
      }
      return t;
    }));

    // Calculate mining parameters
    const powerBump = Math.floor(Math.random() * 200) + 150; // H/s reward
    setTotalHashrate(prev => prev + powerBump);
    setMinersCount(prev => prev + 1);

    // Logs
    setHunterLogs(prev => [
      `[RECYCLED] 🔄 Enslaved ${targetBot.type} (${targetBot.id}). Reverse decompiler payload injected successfully.`,
      `[RECYCLED] ⚡ Configured Miner Node: +${powerBump} H/s allocated to mining $AETH.`,
      ...prev
    ]);

    addAuditLog('HUNTER', `Decompiled predator ${targetBot.id} at ${targetBot.ip}. Reprogrammed to mine gas. Reward: +${powerBump} H/s.`, 'success');
    
    // Play sound or show toast
    toast.success(`Predator Reprogrammed!`, {
      description: `Intercepted bot converted to high-rate $AETH miner node (+${powerBump} H/s)`
    });
  };

  // ---------------------------------------------------------
  // 6. ETH|QUITY :: L[i]ON LOGEX BUSINESS-BEHAVIORAL PIPELINE
  // ---------------------------------------------------------
  
  // Manual Interaction Scanner click handler
  const handleLogexManualClick = () => {
    if (isSimulatingLogex) return;
    const nowMs = Date.now();
    
    if (lastActionTimestamp === null) {
      setLastActionTimestamp(nowMs);
      setLatestDelta(5000); // Default long wait on first click
      setLatestClassification('PACED');
      setUserBehaviorScore(prev => Math.min(1, prev + 0.1));
      setLogexLogs(prev => [
        `[SCAN] 🦁 FIRST INTERACTION RECORDED: Initial behavior synchronized. Pacing established.`,
        ...prev
      ]);
      toast.success("Behavior Synchronized", {
        description: "Your initial pacing state has been registered."
      });
      return;
    }

    const delta = nowMs - lastActionTimestamp;
    setLatestDelta(delta);

    let classification: 'CHAOS' | 'PACED' | 'NEUTRAL' = 'NEUTRAL';
    let scoreChange = 0;

    if (delta < calibrationX) {
      classification = 'CHAOS';
      // Exponential penalty mapping for high urgency/spam
      const penaltyFactor = (calibrationX - delta) / calibrationX;
      scoreChange = -0.15 * penaltyFactor - 0.05; 
    } else if (delta >= calibrationY) {
      classification = 'PACED';
      // Logarithmic/linear reward mapping for patient waiting
      const rewardFactor = Math.min(2.5, delta / calibrationY);
      scoreChange = 0.06 * rewardFactor;
    } else {
      classification = 'NEUTRAL';
      // Minor penalty for mediocre pacing
      scoreChange = -0.02 * ((calibrationY - delta) / (calibrationY - calibrationX));
    }

    setLatestClassification(classification);
    setUserBehaviorScore(prev => Math.max(0, Math.min(1, prev + scoreChange)));
    setLastActionTimestamp(nowMs);

    // Dynamic log messages
    if (classification === 'CHAOS') {
      setLogexLogs(prev => [
        `[SCAN] ⚠️ AGGRESSIVE CHAOS: RetryInterval of ${delta}ms violated { E._T _/QU_ETte Check } (Limit: >=${calibrationX}ms). Rude force detected. Score penalty: ${(scoreChange * 100).toFixed(1)}%.`,
        ...prev
      ]);
      toast.error("Urgency Violation Detected", {
        description: "Rude / Aggressive click rate detected. Gating active assets."
      });
    } else if (classification === 'PACED') {
      setLogexLogs(prev => [
        `[SCAN] 🦁 SOVEREIGN MANNERS: WaitStateDuration of ${(delta / 1000).toFixed(2)}s satisfies { E._T _/QU_ETte Check } (Required: >=${(calibrationY / 1000).toFixed(1)}s). Polite agent verified. Score reward: +${(scoreChange * 100).toFixed(1)}%.`,
        ...prev
      ]);
      toast.success("Manners Check Passed", {
        description: "Patience and timing verification validated by L[i]ON Oracle."
      });
    } else {
      setLogexLogs(prev => [
        `[SCAN] ⚖️ INTERMEDIATE DELAY: Delta was ${(delta / 1000).toFixed(2)}s. Inefficient wait. Sidelined from high-tier truth pipeline. Score change: ${(scoreChange * 100).toFixed(1)}%.`,
        ...prev
      ]);
    }
  };

  // Automated Simulation Runners
  const triggerLogexSimulation = (type: 'chaos' | 'paced') => {
    if (isSimulatingLogex) return;
    setIsSimulatingLogex(true);
    
    const intervals = type === 'chaos' 
      ? [120, 180, 95, 210, 140, 160, 220] 
      : [3200, 3600, 3100, 3400];
      
    setLogexLogs(prev => [
      `[SIMULATION] 🛠️ Commencing ${type.toUpperCase()} behavioral chain evaluations...`,
      ...prev
    ]);

    if (type === 'chaos') {
      setUserBehaviorScore(0.85); // start high to demonstrate degradation
    } else {
      setUserBehaviorScore(0.15); // start low to demonstrate elevation
    }

    let i = 0;
    const runNext = () => {
      if (i >= intervals.length) {
        setIsSimulatingLogex(false);
        setLogexSimStatus('');
        setLogexLogs(prev => [
          `[SIMULATION] ✅ ${type.toUpperCase()} evaluation complete. Trust alignment stabilized.`,
          ...prev
        ]);
        toast.info("Simulation Concluded", {
          description: `Finished executing ${type} sequence.`
        });
        return;
      }

      const interval = intervals[i];
      setLogexSimStatus(type === 'chaos' 
        ? `Firing Spam Requests... Step #${i + 1} (Delta: ${interval}ms)`
        : `Simulating WaitState Pacing... Step #${i + 1} (Wait: ${(interval / 1000).toFixed(1)}s)`
      );

      // Perform simulation step
      let scoreChange = 0;
      let classification: 'CHAOS' | 'PACED' | 'NEUTRAL' = 'NEUTRAL';

      if (interval < calibrationX) {
        classification = 'CHAOS';
        const penaltyFactor = (calibrationX - interval) / calibrationX;
        scoreChange = -0.16 * penaltyFactor - 0.05;
      } else if (interval >= calibrationY) {
        classification = 'PACED';
        const rewardFactor = Math.min(2.5, interval / calibrationY);
        scoreChange = 0.09 * rewardFactor;
      }

      setLatestDelta(interval);
      setLatestClassification(classification);
      setUserBehaviorScore(prev => Math.max(0, Math.min(1, prev + scoreChange)));

      if (classification === 'CHAOS') {
        setLogexLogs(prev => [
          `[SIMULATION-SCAN] ⚠️ [AGRESSIVE CHAOS] Request #${i + 1}: Delta = ${interval}ms. Violent force behavior. Score penalty: ${(scoreChange * 100).toFixed(1)}%.`,
          ...prev
        ]);
      } else {
        setLogexLogs(prev => [
          `[SIMULATION-SCAN] 🦁 [SOVEREIGN MANNERS] Request #${i + 1}: Delta = ${(interval / 1000).toFixed(2)}s. Polite soul cadence. Score reward: +${(scoreChange * 100).toFixed(1)}%.`,
          ...prev
        ]);
      }

      i++;
      setTimeout(runNext, type === 'chaos' ? 500 : 1600);
    };

    runNext();
  };

  // Handle Alpenglow upgrade transition
  const handleAlpenglowUpgrade = () => {
    if (isAlpenglowUpgraded) return;
    setIsAlpenglowRunning(true);
    setLogexLogs(prev => [
      `[ALPENGLOW UPGRADE] 🚀 INITIATING TRANSITION PROTOCOL...`,
      `[ALPENGLOW UPGRADE] ⚙️ Retiring legacy PoH clock substrate and Tower BFT lockouts.`,
      `[ALPENGLOW UPGRADE] 🛠️ Spin-up Votor (Fast Finality Voting engine) & Rotor (Shred Routing).`,
      ...prev
    ]);
    
    // Simulate multi-phase spin-up sequence
    setTimeout(() => {
      setRotorShredCount(128);
      setLogexLogs(prev => [
        `[ALPENGLOW UPGRADE] 📡 [ROTOR ACTIVE] Erasure shreds generated (128 slices). Routing topology optimized.`,
        ...prev
      ]);
    }, 800);

    setTimeout(() => {
      setVotorStakedAgreement(82); // Exceeds the 80% consensus threshold!
      setLogexLogs(prev => [
        `[ALPENGLOW UPGRADE] 🗳️ [VOTOR ACTIVE] Round 1 complete. Staked validator agreement at 82% (Threshold: >=80%).`,
        ...prev
      ]);
    }, 1600);

    setTimeout(() => {
      setIsAlpenglowUpgraded(true);
      setIsAlpenglowRunning(false);
      setUserBehaviorScore(1.0); // Perfect trust
      setLatestClassification('PACED');
      setLatestDelta(120); // 120ms block time
      setAlpenglowBlockCount(1);
      setLogexLogs(prev => [
        `[ALPENGLOW UPGRADE] 🎉 UPGRADE COMPLETED SUCCESSFULLY.`,
        `[ALPENGLOW UPGRADE] ⛓️ Solana Alpenglow (2026 Edition) is now the primary consensus substrate.`,
        `[ALPENGLOW UPGRADE] ⚡ Single-slot finality secured at 120ms! "Force/Rude" restrictions deprecated.`,
        ...prev
      ]);
      toast.success("Consensus Upgraded to Alpenglow!", {
        description: "Votor Single-Slot Finality active. Force threshold checks bypassed."
      });
    }, 2400);
  };

  // Propose block in Alpenglow mode
  const handleAlpenglowProposeBlock = () => {
    if (!isAlpenglowUpgraded || isAlpenglowRunning) return;
    setIsAlpenglowRunning(true);
    
    // Alpenglow single-slot finality takes 100-150ms!
    const delay = 100 + Math.floor(Math.random() * 50); // 100-150ms
    setLogexLogs(prev => [
      `[VOTOR-PROPOSE] 🗳️ Broadcasting block #${alpenglowBlockCount + 1} to Rotor shred-routing network...`,
      ...prev
    ]);

    setTimeout(() => {
      const stake = 85 + Math.floor(Math.random() * 15); // 85% to 100%
      setVotorStakedAgreement(stake);
      setAlpenglowBlockCount(prev => prev + 1);
      setIsAlpenglowRunning(false);
      setLatestDelta(delay);
      setLatestClassification('PACED');
      setUserBehaviorScore(1.0); // Keep score at maximum since we have Alpenglow
      
      setLogexLogs(prev => [
        `[VOTOR-FINALITY] 🦁 Block #${alpenglowBlockCount + 1} finalized in ${delay}ms! Agreement: ${stake}% staked validators. Protocol-guaranteed & irreversible.`,
        ...prev
      ]);
      toast.success(`Block #${alpenglowBlockCount + 1} Finalized!`, {
        description: `Secured in ${delay}ms with ${stake}% validator consensus.`
      });
    }, delay);
  };

  // ---------------------------------------------------------
  // RENDER INTERFACE
  // ---------------------------------------------------------
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050508] text-zinc-100 font-sans select-text pb-12">
      
      {/* Real-Time Security & Chronology Header */}
      <div className="p-6 md:p-8 border-b border-zinc-900 bg-zinc-950/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2%_2%,_rgba(239,68,68,0.05)_0%,_transparent_60%)] pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-red-950/60 text-red-400 border border-red-900/40 rounded text-[9px] font-black tracking-widest uppercase">
                SECURITY WORKSTATION V
              </span>
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                TACTICAL RADAR ACTIVE
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Wallet className="w-6 h-6 text-red-500" />
              Sovereign Multi-Chain Hunter Wallet
            </h1>
            <p className="text-xs text-zinc-400 mt-1 uppercase font-semibold font-mono tracking-wide">
              Secure Ledger Isolation // Predator Neutralization Pipeline
            </p>
          </div>

          <div className="flex flex-col md:items-end bg-black/60 border border-zinc-900 px-4 py-3 rounded-xl font-mono text-left">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Reference Sync Epoch</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-emerald-400 text-xs font-black animate-pulse">● LIVE TICKER</span>
              <span className="text-white text-xs font-bold font-mono tracking-tight">{getSovereignTimeFormatted()}</span>
            </div>
            <span className="text-[8.5px] text-zinc-500 mt-0.5 block uppercase">Epoch: 07/11/2026 4:49:00 PM (+{Math.floor(tickerOffsetMs / 1000)}s)</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="border-b border-zinc-900 bg-zinc-950/40 px-6 md:px-8 flex gap-6">
        <button
          onClick={() => setActiveSubTab('terminal')}
          className={`py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'terminal'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          Omni-Chain Security Terminal
        </button>
        <button
          onClick={() => setActiveSubTab('lion_logex')}
          className={`py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'lion_logex'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          ETH|QUITY :: L[i]ON LOGEX Laboratory
        </button>
        <button
          onClick={() => setActiveSubTab('api_portfolio')}
          className={`py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'api_portfolio'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          Real-Time Portfolios & APIs
        </button>
      </div>

      {/* DASHBOARD GRID */}
      {activeSubTab === 'terminal' && (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* STATS HUD OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Portfolio USD Value */}
          <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-2xl relative overflow-hidden text-left shadow-lg">
            <div className="absolute top-0 right-0 p-3 text-zinc-800 pointer-events-none">
              <DollarSign className="w-12 h-12" />
            </div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-widest block mb-1">
              Sovereign Port Value (USD)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">
                ${totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center bg-emerald-950/40 px-1 py-0.5 rounded">
                <ArrowUpRight className="w-2.5 h-2.5" />
                +1.42%
              </span>
            </div>
            <p className="text-[8.5px] text-zinc-500 mt-2 font-mono uppercase">
              Aggregated across {chains.length} connected networks
            </p>
          </div>

          {/* Connected Networks */}
          <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-2xl relative overflow-hidden text-left shadow-lg">
            <div className="absolute top-0 right-0 p-3 text-zinc-800 pointer-events-none">
              <Globe className="w-12 h-12" />
            </div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-widest block mb-1">
              CONNECTED NETWORKS
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">
                {chains.filter(c => c.connected).length}
              </span>
              <span className="text-xs text-zinc-400 font-mono">/ {chains.length} Chains</span>
            </div>
            <button 
              onClick={() => setShowAddChain(true)}
              className="text-[9px] text-red-400 hover:text-red-300 font-mono font-bold uppercase mt-2.5 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Connect Custom Chain
            </button>
          </div>

          {/* Security Compliance Score */}
          <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-2xl relative overflow-hidden text-left shadow-lg">
            <div className="absolute top-0 right-0 p-3 text-zinc-800 pointer-events-none">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-widest block mb-1">
              COMPLIANCE AUDIT SCORE
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400 tracking-tight">
                {auditScore}/100
              </span>
              <span className="text-[9px] text-zinc-400 uppercase font-mono font-bold">
                Level A Secure
              </span>
            </div>
            <p className="text-[8.5px] text-zinc-500 mt-2.5 font-mono uppercase">
              Pipeline monitored by Chief Auditor Vance
            </p>
          </div>

          {/* Recycled Threat Mining Fleet */}
          <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-2xl relative overflow-hidden text-left shadow-lg">
            <div className="absolute top-0 right-0 p-3 text-zinc-800 pointer-events-none">
              <Cpu className="w-12 h-12" />
            </div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-widest block mb-1">
              RECYCLED MINER UNITS
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-red-400 tracking-tight">
                {minersCount}
              </span>
              <span className="text-xs text-zinc-400 font-mono">Nodes @ {totalHashrate} H/s</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[8px] text-zinc-500 font-mono uppercase">Mining gas into local $AETH reserve</span>
            </div>
          </div>
        </div>

        {/* CHAIN CONNECTIVITY CONTROLS */}
        {showAddChain && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl text-left shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
              <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                Establish Custom Chain RPC Connection
              </h3>
              <button 
                onClick={() => setShowAddChain(false)}
                className="text-zinc-500 hover:text-white text-xs cursor-pointer font-bold font-mono"
              >
                ✕ CANCEL
              </button>
            </div>
            
            <form onSubmit={handleAddChain} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[9px] text-zinc-500 font-mono font-bold block mb-1 uppercase">Chain Display Name</label>
                <input 
                  type="text" 
                  value={customChainName} 
                  onChange={(e) => setCustomChainName(e.target.value)}
                  placeholder="e.g. Binance Smart Chain" 
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono focus:border-red-500/50 outline-none text-white"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 font-mono font-bold block mb-1 uppercase">Native Ticker Abbreviation</label>
                <input 
                  type="text" 
                  value={customChainSymbol} 
                  onChange={(e) => setCustomChainSymbol(e.target.value)}
                  placeholder="e.g. BNB" 
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono focus:border-red-500/50 outline-none text-white"
                />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 font-mono font-bold block mb-1 uppercase">Sovereign RPC URL Gateway</label>
                <input 
                  type="text" 
                  value={customChainRpc} 
                  onChange={(e) => setCustomChainRpc(e.target.value)}
                  placeholder="https://bsc-dataseed.binance.org" 
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono focus:border-red-500/50 outline-none text-white"
                />
              </div>
              <div className="flex flex-col justify-end">
                <button 
                  type="submit"
                  className="w-full py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/80 text-[10px] font-black uppercase text-emerald-400 tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Configure RPC Connection
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* TWO-COLUMN LAYOUT: PORTFOLIO vs AUDITOR PIPELINE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COL: ASSET LEDGER (FUNGIBLES & NFTS) - spans 7 */}
          <div className="lg:col-span-7 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 text-left flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4 mb-4">
                <div>
                  <h2 className="text-sm font-black uppercase text-white tracking-widest">
                    Asset Ledger & Vault Storage
                  </h2>
                  <p className="text-[10px] text-zinc-500 uppercase font-semibold font-mono">
                    High-Frequency Live Exchange Valuation Hub
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowMintModal(true)}
                    className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-900/60 text-[9px] uppercase font-black text-red-400 tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Mint Token / NFT
                  </button>
                </div>
              </div>

              {/* Connected Chain Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 mb-4 p-1 bg-black/60 border border-zinc-900 rounded-xl">
                {chains.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChain(c.id)}
                    className={`px-3 py-1.5 text-[9px] font-bold uppercase rounded-lg font-mono cursor-pointer transition-all ${selectedChain === c.id ? 'bg-red-950 text-red-400 border border-red-900/50' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {c.name.split(' ')[0]} {c.symbol && `(${c.symbol})`}
                  </button>
                ))}
              </div>

              {/* FUNGIBLE TOKENS LIST */}
              <div className="space-y-4 mb-6">
                <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest block mb-2">Fungible Balances</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assets.filter(a => !a.isNFT && a.chain === selectedChain).map((asset) => {
                    const priceDiff = asset.currentPrice - asset.basePrice;
                    const pctDiff = (priceDiff / asset.basePrice) * 100;
                    return (
                      <div 
                        key={asset.id} 
                        className="bg-black/60 border border-zinc-900 p-4 rounded-xl hover:border-zinc-800 transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-zinc-400" />
                            <span className="font-bold text-xs text-white">{asset.name}</span>
                          </div>
                          <div className="text-[9px] text-zinc-500 font-mono uppercase mt-1">
                            Contract: <code className="text-zinc-400">{asset.contractAddress.slice(0, 10)}...</code>
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-2 font-mono">
                            Balance: <span className="font-bold text-white">{asset.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span> {asset.symbol}
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-xs font-bold text-white block">
                            ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                          </span>
                          <span className={`text-[9px] font-bold ${priceDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {priceDiff >= 0 ? '▲' : '▼'} {Math.abs(pctDiff).toFixed(2)}%
                          </span>
                          <span className="text-[10px] font-black text-white block mt-1.5">
                            Val: ${(asset.balance * asset.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {assets.filter(a => !a.isNFT && a.chain === selectedChain).length === 0 && (
                    <div className="col-span-2 p-6 bg-black/30 border border-zinc-900 rounded-xl text-center text-zinc-600 font-mono text-xs">
                      NO ACTIVE COINS/TOKENS REGISTERED ON {chains.find(c => c.id === selectedChain)?.name.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* NON-FUNGIBLE TOKENS (NFTS) LIST */}
              <div>
                <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest block mb-2">Secure Non-Fungible Inventory</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assets.filter(a => a.isNFT && a.chain === selectedChain).map((nft) => (
                    <div 
                      key={nft.id}
                      className="bg-black/60 border border-zinc-900 rounded-xl overflow-hidden hover:border-zinc-800 transition-all text-left flex flex-col justify-between"
                    >
                      <div className="relative h-28 bg-zinc-900">
                        {nft.metadata?.imageUrl ? (
                          <img 
                            src={nft.metadata.imageUrl} 
                            alt={nft.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-80"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            No Asset Visual
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                          <span className="px-1.5 py-0.5 bg-red-950/80 border border-red-900/50 text-red-400 text-[7px] font-black tracking-widest rounded uppercase">
                            NFT IDENTITY CARD
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-xs text-white leading-tight uppercase">{nft.name}</h4>
                        <p className="text-[9.5px] text-zinc-400 leading-normal line-clamp-2">
                          {nft.metadata?.description}
                        </p>
                        
                        <div className="pt-2 border-t border-zinc-900/60 flex items-center justify-between text-[9px] font-mono">
                          <span className="text-zinc-500 uppercase">Registry: {nft.symbol}</span>
                          <span className="text-emerald-400 font-bold uppercase">{nft.metadata?.powerRating}</span>
                        </div>

                        <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-zinc-500 uppercase">Valuation:</span>
                          <span className="text-white font-black">${nft.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {assets.filter(a => a.isNFT && a.chain === selectedChain).length === 0 && (
                    <div className="col-span-2 p-6 bg-black/30 border border-zinc-900 rounded-xl text-center text-zinc-600 font-mono text-xs">
                      NO SECURE COLLECTIBLES DETECTED ON {chains.find(c => c.id === selectedChain)?.name.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom quick network status */}
            <div className="mt-6 pt-4 border-t border-zinc-900/60 flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
              <span>Selected Node: {chains.find(c => c.id === selectedChain)?.rpcUrl}</span>
              <span>Sync Block: #{chains.find(c => c.id === selectedChain)?.blockHeight}</span>
            </div>
          </div>

          {/* RIGHT COL: BARNABY VANCE BUSINESSMAN AUDITOR PIPELINE - spans 5 */}
          <div className="lg:col-span-5 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 text-left flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <h2 className="text-sm font-black uppercase text-white tracking-widest">
                    Vance Audit Pipeline
                  </h2>
                </div>
                <p className="text-[10px] text-zinc-500 uppercase font-semibold font-mono">
                  Businessman Compliance & Cryptographic Strategy
                </p>
              </div>

              {/* Barnaby Vance Quote Card */}
              <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl relative overflow-hidden">
                <div className="absolute top-2 right-2 text-zinc-800 text-[40px] font-serif leading-none select-none pointer-events-none">
                  “
                </div>
                <div className="flex items-center gap-2.5 mb-2 border-b border-zinc-900/60 pb-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-[10px]">
                    BV
                  </div>
                  <div>
                    <span className="text-[10px] text-white font-bold block">Barnaby Vance</span>
                    <span className="text-[8px] text-zinc-500 uppercase font-black block">Chief Security Strategist</span>
                  </div>
                </div>
                <p className="text-[10.5px] text-emerald-300 italic leading-relaxed">
                  "{vanceQuote}"
                </p>
              </div>

              {/* Progress and parameters */}
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-mono uppercase font-bold">
                  <span className="text-zinc-500">Pipeline Execution:</span>
                  <span className={isAuditing ? 'text-emerald-400 animate-pulse' : 'text-zinc-400'}>
                    {isAuditing ? `${auditProgress}% SCANNING...` : 'IDLE - SAFE'}
                  </span>
                </div>
                {isAuditing && (
                  <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${auditProgress}%` }} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl">
                    <span className="text-[8px] text-zinc-500 font-mono font-bold block uppercase mb-1">Immunity Rating</span>
                    <span className="text-sm font-black text-white font-mono">{auditScore}% Secure</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl">
                    <span className="text-[8px] text-zinc-500 font-mono font-bold block uppercase mb-1">Knowledge Coefficient</span>
                    <span className="text-sm font-black text-white font-mono">{knowledgeFactor}% depth</span>
                  </div>
                </div>

                <button 
                  onClick={handleRunAudit}
                  disabled={isAuditing}
                  className={`w-full py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isAuditing 
                      ? 'bg-zinc-900 text-zinc-500 border-zinc-800 cursor-not-allowed'
                      : 'bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border-emerald-500/40 hover:border-emerald-500'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                  Engage Businessman Audit Pipeline
                </button>
              </div>

              {/* Audit System Logs */}
              <div className="space-y-2">
                <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-widest block">Pipeline Diagnostics Ledger</span>
                <div className="bg-black/90 border border-zinc-900 rounded-xl p-3 h-[180px] overflow-y-auto custom-scrollbar font-mono text-[9px] space-y-1.5 text-left">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="pb-1 border-b border-zinc-900/20 last:border-0 flex items-start gap-2">
                      <span className="text-zinc-600">[{log.timestamp}]</span>
                      <span className={`px-1 rounded text-[7.5px] font-bold ${
                        log.category === 'AUDIT' ? 'bg-emerald-950 text-emerald-400' :
                        log.category === 'HUNTER' ? 'bg-red-950 text-red-400' :
                        'bg-zinc-900 text-zinc-400'
                      }`}>
                        {log.category}
                      </span>
                      <span className={`flex-1 ${
                        log.type === 'alert' ? 'text-red-400 font-bold' :
                        log.type === 'success' ? 'text-emerald-400' :
                        'text-zinc-400'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-zinc-900/60 text-[8.5px] text-zinc-500 font-mono leading-normal uppercase">
              "We don't audit to find bugs, we audit to ensure uninterrupted capital accumulation."
            </div>
          </div>

        </div>

        {/* THREAT HUNTER & BOT RECYCLER (HUNTER V) - Spans full width */}
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-6 text-left shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_rgba(239,68,68,0.03)_0%,_transparent_50%)] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-5 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crosshair className="w-5 h-5 text-red-500 animate-pulse" />
                <h2 className="text-sm font-black uppercase text-white tracking-widest">
                  Predator Tracking & Bot Recycler
                </h2>
              </div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold font-mono">
                Hunter V Module: Defeating Phishers, Hijackers, and MEV Sandwich Bots
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase">Decoy Sensors:</span>
              <button
                onClick={() => {
                  setDecoysArmed(!decoysArmed);
                  toast.info(decoysArmed ? 'Decoys Disarmed' : 'Decoys Deployed', {
                    description: decoysArmed ? 'Scanning accuracy degraded.' : 'Honeypot parameters active.'
                  });
                }}
                className={`px-3 py-1 text-[9px] font-bold uppercase rounded-lg border font-mono cursor-pointer transition-all ${
                  decoysArmed 
                    ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/50' 
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {decoysArmed ? '🛡️ DECOYS ARMED' : '⚠️ HONEYPOTS OFF'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Live Hunter Scopes / Interactive Radar Visual - spans 5 */}
            <div className="lg:col-span-5 bg-black border-2 border-zinc-900 rounded-xl p-5 flex flex-col justify-between h-[340px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] text-white font-mono font-black tracking-widest uppercase">TACTICAL MEMPOOL RADAR</span>
                <span className="text-[8px] bg-red-950 text-red-500 border border-red-800 px-1.5 py-0.5 rounded font-black animate-pulse">SENSORS SWEEPING</span>
              </div>

              {/* Radar Graphic */}
              <div className="relative flex-1 bg-[#010102] rounded-lg overflow-hidden border border-zinc-950 flex items-center justify-center">
                
                {/* Simulated Radar Circular sweeps */}
                <div className="absolute w-44 h-44 rounded-full border border-zinc-900 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border border-zinc-900 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border border-zinc-900" />
                  </div>
                </div>

                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-zinc-900" />
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-zinc-900" />
                
                {/* Interception Scan lines */}
                <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.1)_0%,_transparent_70%)] animate-pulse" />

                {/* Plotting active threats */}
                <AnimatePresence>
                  {threats.filter(t => t.status === 'ACTIVE_HUNT').map((bot, idx) => (
                    <motion.div
                      key={bot.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0 }}
                      className="absolute p-1 cursor-pointer group"
                      style={{ 
                        top: `${25 + (idx * 20)}%`, 
                        left: `${15 + (idx * 25)}%` 
                      }}
                      onClick={() => handleRecycleBot(bot.id)}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-[0_0_8px_#ef4444] animate-ping absolute" />
                      <div className="w-3.5 h-3.5 rounded-full bg-red-500 border border-white flex items-center justify-center text-[7px] text-white font-black z-10 relative">
                        !
                      </div>
                      
                      {/* Tooltip detail */}
                      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black border border-zinc-800 p-2 rounded text-[8px] font-mono uppercase text-zinc-300 hidden group-hover:block z-20 whitespace-nowrap">
                        <span className="text-white font-black block">{bot.type}</span>
                        <span>Risk: {bot.riskScore}%</span>
                        <span className="text-red-400 block mt-0.5">Click to recycle</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Mine nodes (Recycled) */}
                {threats.filter(t => t.status === 'RECYCLED_MINER').slice(0, 3).map((bot, idx) => (
                  <div
                    key={bot.id}
                    className="absolute"
                    style={{ 
                      top: `${80 - (idx * 15)}%`, 
                      right: `${15 + (idx * 20)}%` 
                    }}
                  >
                    <div className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[7px] font-mono text-emerald-400 whitespace-nowrap">
                      MINER-{bot.id}
                    </span>
                  </div>
                ))}

              </div>

              <p className="text-[8.5px] text-zinc-500 font-mono uppercase mt-2.5 text-center">
                Click red danger nodes in radar or listed targets below to decompile them into miners.
              </p>
            </div>

            {/* Predator list and recycler logs - spans 7 */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">
              
              {/* Grid of Targets */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest block">Target Intercept Scope</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {threats.slice(0, 4).map((bot) => (
                    <div 
                      key={bot.id} 
                      className={`p-4 border rounded-xl relative overflow-hidden transition-all flex flex-col justify-between h-[105px] ${
                        bot.status === 'RECYCLED_MINER' 
                          ? 'bg-emerald-950/20 border-emerald-900/60' 
                          : 'bg-zinc-950 border-zinc-900 hover:border-red-500/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5 mb-1.5">
                          <span className="text-[10px] font-black text-white font-mono">{bot.id} // {bot.ip}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase ${
                            bot.status === 'RECYCLED_MINER' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : 'bg-red-950 text-red-400 border border-red-900/30'
                          }`}>
                            {bot.status === 'RECYCLED_MINER' ? 'RECYCLED' : 'ACTIVE_HUNT'}
                          </span>
                        </div>
                        
                        <div className="space-y-1 font-mono text-[9px] text-zinc-400">
                          <div>Threat: <span className="text-white font-semibold">{bot.type.replace(/_/g, ' ')}</span></div>
                          <div>Targeting: <span className="text-zinc-300">{bot.targetAsset}</span></div>
                        </div>
                      </div>

                      {bot.status === 'ACTIVE_HUNT' ? (
                        <button 
                          onClick={() => handleRecycleBot(bot.id)}
                          className="w-full py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-[8.5px] font-black uppercase text-red-400 tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1 mt-2"
                        >
                          <Zap className="w-3 h-3" /> Neutralize & Recycle Bot
                        </button>
                      ) : (
                        <div className="text-[9px] font-mono text-emerald-500 font-bold uppercase mt-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> Core Mine Active ({bot.interceptedAt})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recycler Tactical Output Terminal */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-widest block">Hunter-V Tactical Logs</span>
                <div className="bg-black/90 border border-zinc-900 rounded-xl p-3 h-[90px] overflow-y-auto custom-scrollbar font-mono text-[9.5px] text-zinc-400 space-y-1 text-left">
                  {hunterLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
      )}

      {activeSubTab === 'lion_logex' && (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-left animate-in fade-in duration-500">
          
          {/* Solana Alpenglow Consensus Upgrade Banner */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/20 via-transparent to-transparent pointer-events-none" />
            <div className="space-y-1.5 relative z-10 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                  isAlpenglowUpgraded 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' 
                    : 'bg-amber-950/60 text-amber-400 border border-amber-900/40'
                }`}>
                  {isAlpenglowUpgraded ? 'active' : 'legacy (tower bft)'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Consensus Stack Version: v2.0.0</span>
              </div>
              <h2 className="text-md font-black uppercase text-white tracking-widest">
                Solana Alpenglow v2 upgrade framework
              </h2>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                {isAlpenglowUpgraded 
                  ? "Consensus successfully upgraded. Proof-of-History clock and exponential Tower BFT lockouts replaced by Votor Fast-Finality Voting (80% staked threshold) and Rotor block propagation."
                  : "Legacy systems rely on patient pacing to avoid force limit penalties. Upgrade to the 2026 Alpenglow consensus stack to achieve deterministic single-slot finality in 100-150ms with no force limits."}
              </p>
            </div>

            <div className="relative z-10 w-full md:w-auto shrink-0">
              {!isAlpenglowUpgraded ? (
                <button
                  onClick={handleAlpenglowUpgrade}
                  disabled={isAlpenglowRunning}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden active:scale-95"
                >
                  {isAlpenglowRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      UPGRADING CONSENSUS...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4 text-black" />
                      UPGRADE TO ALPENGLOW
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-900/50 px-4 py-2.5 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <div className="font-mono text-left">
                    <span className="text-[8px] text-emerald-500 font-black block uppercase">consensus active</span>
                    <span className="text-[10px] text-white font-bold">ALPENGLOW SINGLE-SLOT</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* L[i]ON LOGEX LABORATORY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDE: CONCEPTUAL EXPLANATION & CALIBRATION KNOBS (Spans 5) */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              
              {/* Concept Deep-dive */}
              <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-emerald-950/20 pointer-events-none">
                  <ShieldCheck className="w-16 h-16 animate-pulse" />
                </div>
                <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 rounded text-[9px] font-black tracking-widest uppercase block w-fit mb-3">
                  consensus paradigm shift
                </span>
                <h2 className="text-md font-black uppercase text-white tracking-widest mb-2">
                  L[i]ON Proof of Behavior
                </h2>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed mb-4">
                  Moving from static, easily forgeable cryptographic private keys to <span className="text-white font-semibold">dynamic, unforgeable behavioral pacing metrics</span>. 
                  Manners are treated as high-grade economic collateral.
                </p>

                <div className="space-y-3 pt-3 border-t border-zinc-900/60 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">CONSENSUS METHOD:</span>
                    <span className="text-emerald-400 font-bold">
                      {isAlpenglowUpgraded ? "ALPENGLOW VOTOR BFT" : "PROOF-OF-BEHAVIOR (PoB)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">SCAN PHASE 1:</span>
                    <span className="text-zinc-300">
                      {isAlpenglowUpgraded ? "VOTOR AGGREGATED VOTING" : "E._T _/QU_ETte SCANNER"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">SCAN PHASE 2:</span>
                    <span className="text-zinc-300">
                      {isAlpenglowUpgraded ? "ROTOR SHRED-PROPAGATION" : "EQUALIZING TRUST FLOW"}
                    </span>
                  </div>
                </div>

                {/* Mathematical Equation presentation */}
                <div className="mt-4 p-3 bg-black/60 border border-zinc-900 rounded-xl text-center">
                  <span className="text-[8px] text-zinc-500 font-mono uppercase block mb-1">Normalized Scoring Function</span>
                  <code className="text-emerald-400 text-[10px] font-bold">
                    {isAlpenglowUpgraded 
                      ? "Score = f_votor(staked_stake >= 80%) => 1.00 TRUST"
                      : "Score = w₁·f_retry(RetryInterval) + w₂·f_wait(WaitStateDuration)"}
                  </code>
                </div>
              </div>

              {/* Calibration Knobs */}
              <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl space-y-4 relative overflow-hidden">
                {isAlpenglowUpgraded && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20 border border-emerald-900/30">
                    <Lock className="w-8 h-8 text-emerald-400 mb-3 animate-pulse" />
                    <span className="text-[10.5px] text-emerald-400 font-mono font-black uppercase tracking-widest block">calibration stabilized</span>
                    <p className="text-[10px] text-zinc-400 mt-2 max-w-[240px] leading-relaxed">
                      Votor single-slot finality has locked in optimal timing parameters. Delay restrictions are now 100% deprecated.
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-black uppercase text-white tracking-wider">Calibration Parameters</h3>
                </div>

                <div className="space-y-4">
                  {/* Slider X */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-zinc-400 uppercase">Limit X (Force Threshold)</span>
                      <span className="text-red-400 font-bold">{calibrationX}ms</span>
                    </div>
                    <input 
                      type="range" 
                      min="200" 
                      max="1000" 
                      step="50"
                      value={calibrationX}
                      onChange={(e) => setCalibrationX(Number(e.target.value))}
                      className="w-full accent-red-500 cursor-pointer h-1 bg-zinc-900 rounded-lg appearance-none"
                    />
                    <span className="text-[8px] text-zinc-600 font-mono block">Clicks faster than this trigger "Aggressive Chaos // Rude Force" penalties.</span>
                  </div>

                  {/* Slider Y */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-zinc-400 uppercase">Limit Y (Wait State Active)</span>
                      <span className="text-emerald-400 font-bold">{calibrationY}ms</span>
                    </div>
                    <input 
                      type="range" 
                      min="1500" 
                      max="5000" 
                      step="100"
                      value={calibrationY}
                      onChange={(e) => setCalibrationY(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-1 bg-zinc-900 rounded-lg appearance-none"
                    />
                    <span className="text-[8px] text-zinc-600 font-mono block">Waiting longer than this verifies "Sovereign Manners // Polite Pacing".</span>
                  </div>

                  {/* Weight slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-zinc-400 uppercase">Pacing Weight (w₂)</span>
                      <span className="text-white font-bold">{weightPacing}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      step="5"
                      value={weightPacing}
                      onChange={(e) => setWeightPacing(Number(e.target.value))}
                      className="w-full accent-zinc-400 cursor-pointer h-1 bg-zinc-900 rounded-lg appearance-none"
                    />
                    <span className="text-[8px] text-zinc-600 font-mono block">Importance of wait state pacing compared to rapid retry suppression.</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT SIDE: THE SIMULATOR INTERFACE (Spans 7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* INTERACTIVE SCANNING CONTAINER */}
              <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl space-y-6 text-left">
                
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                  <div>
                    <h2 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      {isAlpenglowUpgraded ? "Alpenglow Engine Console" : "Manners Evaluation Engine"}
                    </h2>
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold font-mono">
                      {isAlpenglowUpgraded ? "Votor 2026 fast-finality" : "Phase 1: { E._T _/QU_ETte Check }"}
                    </p>
                  </div>

                  <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[9px] text-zinc-400">
                    {isAlpenglowUpgraded ? "ALPENGLOW SUBSTRATE" : "REALTIME ORACLE DISPATCHER"}
                  </span>
                </div>

                {/* Simulation Status bar */}
                {(isSimulatingLogex || isAlpenglowRunning) && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-xs font-mono text-emerald-400 animate-pulse flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isAlpenglowRunning ? "Consensus Running..." : logexSimStatus}</span>
                  </div>
                )}

                {/* THE CLICK ZONE */}
                {isAlpenglowUpgraded ? (
                  /* ALPENGLOW INTERACTIVE CORE */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Votor Block Proposer */}
                    <div className="p-5 bg-black border border-zinc-900 rounded-xl flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase">Votor Fast-Finality Proposer</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed text-left">
                          Sovereignly propose and finalize single-slot blocks instantly. Votor guarantees irreversibility in 100–150ms.
                        </p>
                      </div>

                      <button 
                        onClick={handleAlpenglowProposeBlock}
                        disabled={isAlpenglowRunning}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 font-mono shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                      >
                        {isAlpenglowRunning ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            VOTING IN PROGRESS...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-current" />
                            PROPOSE SINGLE-SLOT BLOCK
                          </>
                        )}
                      </button>

                      <div className="grid grid-cols-2 gap-3 text-[9.5px] font-mono">
                        <div className="p-2 bg-zinc-950 border border-zinc-900 rounded">
                          <span className="text-zinc-500 block">FINALITY LATENCY</span>
                          <span className="font-bold text-white block mt-0.5">
                            {latestDelta !== null ? `${latestDelta} ms` : "120 ms"}
                          </span>
                        </div>
                        <div className="p-2 bg-zinc-950 border border-zinc-900 rounded">
                          <span className="text-zinc-500 block">BLOCKED HEIGHT</span>
                          <span className="font-bold text-emerald-400 block mt-0.5">
                            #{14220551 + alpenglowBlockCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rotor Block Propagation Monitor */}
                    <div className="p-5 bg-black border border-zinc-900 rounded-xl flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] text-zinc-500 font-mono font-bold block uppercase mb-1">Rotor Shred routing</span>
                        <p className="text-[10px] text-zinc-400 leading-relaxed text-left">
                          Maintains shred-based erasure coding with optimized low-latency path algorithms.
                        </p>
                      </div>

                      <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2 font-mono text-[9px] text-left">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">PROPAGATION PROTOCOL:</span>
                          <span className="text-emerald-400 font-bold">ROTOR (2026 SPEC)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">ERASURE CODING:</span>
                          <span className="text-white">SHRED-BASED REED-SOLOMON</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">ACTIVE SHREDS:</span>
                          <span className="text-white font-bold">{rotorShredCount || 128} Slices</span>
                        </div>
                      </div>

                      <div className="p-2 bg-emerald-950/20 border border-emerald-900/40 rounded text-center">
                        <span className="text-[8.5px] text-emerald-400 font-mono uppercase">
                          Agreement: {votorStakedAgreement || 82}% staked validators (Required: &gt;=80%)
                        </span>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* LEGACY PO_B CLICK ZONE WITH CHAOS CHECKS */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Manual Clicker Board */}
                    <div className="p-5 bg-black border border-zinc-900 rounded-xl flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] text-zinc-500 font-mono font-bold block uppercase mb-1">Manual Testing Pad</span>
                        <p className="text-[10px] text-zinc-400 leading-relaxed text-left">
                          Manually trigger simulated behavioral requests. Pace your clicks to maintain trust.
                        </p>
                      </div>

                      <button 
                        onClick={handleLogexManualClick}
                        disabled={isSimulatingLogex}
                        className="w-full py-4 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-[10px] font-black uppercase tracking-widest text-emerald-400 rounded-xl cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        SCAN-BEHAVIOR(PHASE)
                      </button>

                      <div className="grid grid-cols-2 gap-3 text-[9.5px] font-mono">
                        <div className="p-2 bg-zinc-950 border border-zinc-900 rounded">
                          <span className="text-zinc-500 block">LAST INTERVAL</span>
                          <span className="font-bold text-white block mt-0.5">
                            {latestDelta !== null ? `${latestDelta} ms` : "No Record"}
                          </span>
                        </div>
                        <div className="p-2 bg-zinc-950 border border-zinc-900 rounded">
                          <span className="text-zinc-500 block">STATE RATING</span>
                          <span className={`font-bold block mt-0.5 ${
                            latestClassification === 'CHAOS' ? 'text-red-400' :
                            latestClassification === 'PACED' ? 'text-emerald-400' :
                            'text-zinc-400'
                          }`}>
                            {latestClassification || "PENDING"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Presets and Simulations Board */}
                    <div className="p-5 bg-black border border-zinc-900 rounded-xl flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] text-zinc-500 font-mono font-bold block uppercase mb-1">Simulation Profiles</span>
                        <p className="text-[10px] text-zinc-400 leading-relaxed text-left">
                          Instantly fire pre-packaged sequences to evaluate different adversarial or compliant outcomes.
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <button 
                          onClick={() => triggerLogexSimulation('chaos')}
                          disabled={isSimulatingLogex}
                          className="w-full py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-900/60 text-[9.5px] font-black uppercase text-red-400 tracking-wider rounded-lg cursor-pointer transition-all disabled:opacity-50"
                        >
                          ⚡ Simulate Spam Bot (Rude Force)
                        </button>

                        <button 
                          onClick={() => triggerLogexSimulation('paced')}
                          disabled={isSimulatingLogex}
                          className="w-full py-2 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-900/60 text-[9.5px] font-black uppercase text-emerald-400 tracking-wider rounded-lg cursor-pointer transition-all disabled:opacity-50"
                        >
                          🦁 Simulate Sovereign Agent (Patient Pacing)
                        </button>
                      </div>

                      <p className="text-[8.5px] text-zinc-500 font-mono uppercase text-left">
                        Automated routines bypass manual delay for speed of testing.
                      </p>
                    </div>

                  </div>
                )}

                {/* THE TRUST SCORE GAUGE */}
                <div className="p-5 bg-black border border-zinc-900 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Dynamic Behavior Trust Rating:</span>
                    <span className={`font-mono font-black text-sm ${
                      userBehaviorScore >= 0.60 ? 'text-emerald-400' :
                      userBehaviorScore >= 0.30 ? 'text-amber-400' :
                      'text-red-500'
                    }`}>
                      {(userBehaviorScore * 100).toFixed(0)}% TRUSTED
                    </span>
                  </div>

                  <div className="w-full bg-zinc-950 border border-zinc-900 h-4 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        userBehaviorScore >= 0.60 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_8px_#10b981]' :
                        userBehaviorScore >= 0.30 ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_#f59e0b]' :
                        'bg-gradient-to-r from-red-700 to-red-500 shadow-[0_0_8px_#ef4444]'
                      }`}
                      style={{ width: `${userBehaviorScore * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[8px] text-zinc-600 font-mono uppercase pt-1">
                    <span>0.0 (aggressive Chaos)</span>
                    <span>0.4 (Sideline boundary)</span>
                    <span>0.6 (High-Tier threshold)</span>
                    <span>1.0 (sovereign manners)</span>
                  </div>
                </div>

                {/* PHASE 2 TRUST EQUALIZER OUTPUT */}
                <div className={`p-5 rounded-xl border transition-all text-left space-y-3 ${
                  userBehaviorScore >= 0.60 
                    ? 'bg-emerald-950/10 border-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                    : 'bg-red-950/10 border-red-900/40'
                }`}>
                  <div className="flex items-center justify-between border-b border-zinc-900/50 pb-2">
                    <span className="text-[10px] text-zinc-400 font-mono block uppercase">Phase 2: Trust Equalization Gated Access</span>
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                      userBehaviorScore >= 0.60 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                    }`}>
                      {userBehaviorScore >= 0.60 ? 'GRANTED' : 'DENIED / SIDELINED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[10px] font-mono leading-normal">
                    <div>
                      <span className="text-zinc-500 block uppercase">GRANTED ASSET QUALITY:</span>
                      <span className={`font-bold ${userBehaviorScore >= 0.60 ? 'text-white' : 'text-zinc-500'}`}>
                        {userBehaviorScore >= 0.60 ? 'HIGH (Sovereign Truth)' : 'LOW (Noisy / Fake Sandboxes)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block uppercase">DATA LOAN PIPELINE:</span>
                      <span className={`font-bold ${userBehaviorScore >= 0.60 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {userBehaviorScore >= 0.60 ? 'Pure Real K-Data Stream' : 'Noise Data & Slow Trajectory Maps'}
                      </span>
                    </div>
                  </div>

                  {userBehaviorScore >= 0.60 ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-3 border-t border-zinc-900/50 space-y-3"
                    >
                      <span className="text-[9px] text-emerald-400 font-mono font-bold block">
                        🎉 Verified {`{EQU UI/ tY S Ha_er > V 3 2 Real.txt Data Key}`} Released:
                      </span>
                      <div className="p-3 bg-black border border-zinc-900 rounded-lg flex items-center justify-between gap-4">
                        <code className="text-[9.5px] text-zinc-300 font-mono break-all leading-normal">
                          {"{EQU UI/ tY S Ha_er > V 3 2 Real.txt Data Key: 0x9f7a77df77bc88de629001}"}
                        </code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText("{EQU UI/ tY S Ha_er > V 3 2 Real.txt Data Key: 0x9f7a77df77bc88de629001}");
                            toast.success("Key Copied!", { description: "Cryptographic behavioral allocation key copied to clipboard." });
                          }}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[8.5px] text-white uppercase font-bold font-mono rounded border border-zinc-800 transition-all cursor-pointer shrink-0"
                        >
                          COPY
                        </button>
                      </div>

                      {isAlpenglowUpgraded && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="pt-2 space-y-2"
                        >
                          <span className="text-[9px] text-emerald-400 font-mono font-bold block">
                            🌟 Upgraded {`{ALPENGLOW v2 Votor_BFT_Fast_Finality_Active_Key}`} Released:
                          </span>
                          <div className="p-3 bg-black border border-emerald-950 rounded-lg flex items-center justify-between gap-4">
                            <code className="text-[9.5px] text-emerald-400 font-mono break-all leading-normal">
                              {"{ALPENGLOW v2 Votor_BFT_Fast_Finality_Active_Key: 0xc4a17e92bbcf4ee290c01}"}
                            </code>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText("{ALPENGLOW v2 Votor_BFT_Fast_Finality_Active_Key: 0xc4a17e92bbcf4ee290c01}");
                                toast.success("Alpenglow Key Copied!", { description: "Votor consensus key copied." });
                              }}
                              className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-[8.5px] text-emerald-400 uppercase font-bold font-mono rounded border border-emerald-800 transition-all cursor-pointer shrink-0"
                            >
                              COPY
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="pt-3 border-t border-zinc-900/50">
                      <span className="text-[9.5px] text-red-400 font-mono font-semibold block leading-relaxed">
                        ⚠️ Sidelining the Rude Node. Real asset buffers are isolated behind the behavioral firewall. Retrying too fast triggers an automated lockout.
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* L[i]ON BEHAVIORAL DIAGNOSTICS LOGS */}
              <div className="space-y-2">
                <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-widest block">L[i]ON Oracle Verification Console</span>
                <div className="bg-black border border-zinc-900 rounded-xl p-3 h-[140px] overflow-y-auto custom-scrollbar font-mono text-[9.5px] text-zinc-400 space-y-1 text-left">
                  {logexLogs.map((log, idx) => (
                    <div key={idx} className="pb-1 border-b border-zinc-950 last:border-0 leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* MINT NEW ASSET MODAL DIALOG */}
      {showMintModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-zinc-950 border-2 border-zinc-900 p-6 rounded-2xl text-left font-sans text-zinc-300 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Coins className="w-4 h-4 text-red-400" />
                Mint Sovereign Ledger Asset
              </h3>
              <button 
                onClick={() => setShowMintModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-xs cursor-pointer font-bold"
              >
                ✕ CANCEL
              </button>
            </div>

            {/* Asset Type Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/60 border border-zinc-900 rounded-xl">
              <button
                type="button"
                onClick={() => setMintIsNFT(false)}
                className={`py-2 text-[10px] font-black uppercase rounded-lg cursor-pointer font-mono transition-all ${!mintIsNFT ? 'bg-red-950 text-red-400 border border-red-900/50' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Fungible Token (ERC-20 / SPL)
              </button>
              <button
                type="button"
                onClick={() => setMintIsNFT(true)}
                className={`py-2 text-[10px] font-black uppercase rounded-lg cursor-pointer font-mono transition-all ${mintIsNFT ? 'bg-red-950 text-red-400 border border-red-900/50' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Non-Fungible NFT (ERC-721 / SPL)
              </button>
            </div>

            <form onSubmit={handleMintAsset} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-zinc-500 font-mono font-bold block mb-1 uppercase">Asset Display Name</label>
                  <input 
                    type="text" 
                    required
                    value={mintName} 
                    onChange={(e) => setMintName(e.target.value)}
                    placeholder={mintIsNFT ? "e.g. Masterwork Cybernet Core" : "e.g. Aether Premium Token"} 
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono focus:border-red-500/50 outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 font-mono font-bold block mb-1 uppercase">Asset Symbol/Ticker</label>
                  <input 
                    type="text" 
                    required
                    value={mintSymbol} 
                    onChange={(e) => setMintSymbol(e.target.value)}
                    placeholder="e.g. APT" 
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono focus:border-red-500/50 outline-none text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] text-zinc-500 font-mono font-bold block mb-1 uppercase">
                    {mintIsNFT ? "Quantity (Static)" : "Mint Balance / Amount"}
                  </label>
                  <input 
                    type="number" 
                    required
                    disabled={mintIsNFT}
                    value={mintIsNFT ? "1" : mintBalance} 
                    onChange={(e) => setMintBalance(e.target.value)}
                    placeholder="100" 
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono focus:border-red-500/50 outline-none text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 font-mono font-bold block mb-1 uppercase">Initial Price (USD)</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    required
                    value={mintPrice} 
                    onChange={(e) => setMintPrice(e.target.value)}
                    placeholder="5.00" 
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono focus:border-red-500/50 outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 font-mono font-bold block mb-1 uppercase">Target Blockchain</label>
                  <select
                    value={mintChain}
                    onChange={(e) => setMintChain(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-2 py-2 text-xs font-mono focus:border-red-500/50 outline-none text-white"
                  >
                    {chains.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {mintIsNFT && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] text-zinc-500 font-mono font-bold block mb-1 uppercase">Collectible Description</label>
                    <textarea 
                      value={mintDesc} 
                      onChange={(e) => setMintDesc(e.target.value)}
                      placeholder="Enter detailed description of the physical/logical qualities of the NFT" 
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono focus:border-red-500/50 outline-none text-white h-16 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-500 font-mono font-bold block mb-1 uppercase">Artwork Asset URL</label>
                    <input 
                      type="text" 
                      value={mintImage} 
                      onChange={(e) => setMintImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..." 
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono focus:border-red-500/50 outline-none text-white"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-red-950 hover:bg-red-900 border border-red-800 text-[10px] font-black uppercase text-red-400 tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Generate & Sync Secure Allocation
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* API & OAUTH PORTFOLIOS TAB */}
      {activeSubTab === 'api_portfolio' && (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-left animate-in fade-in duration-500">
          
          {/* Header summary of connection status */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-transparent to-transparent pointer-events-none" />
            <div className="space-y-1.5 relative z-10 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                  connectedPortfolio 
                    ? 'bg-purple-950 text-purple-400 border border-purple-900/40' 
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                }`}>
                  {connectedPortfolio ? 'Sovereign Sync Active' : 'Offline Mode'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold">API Stack Version: v4.2.0</span>
              </div>
              <h2 className="text-md font-black uppercase text-white tracking-widest">
                Real-Time Third-Party Ledger Portfolios
              </h2>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                Adhering to strict cryptographic standards, establish live connections to Coinbase Prime or standard localized Sandbox Ledger systems. Instantly sync your assets and feed live prices directly into your sovereign dashboard.
              </p>
            </div>

            <div className="relative z-10 w-full md:w-auto shrink-0">
              {connectedPortfolio ? (
                <div className="flex items-center gap-3 bg-purple-950/40 border border-purple-900/50 px-4 py-2.5 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-purple-400 animate-pulse" />
                  <div className="font-mono text-left">
                    <span className="text-[8px] text-purple-500 font-black block uppercase">secure handshake</span>
                    <span className="text-[10px] text-white font-bold">{connectedPortfolio.provider.toUpperCase()}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl">
                  <ShieldAlert className="w-5 h-5 text-zinc-500" />
                  <div className="font-mono text-left">
                    <span className="text-[8px] text-zinc-500 font-black block uppercase">synchronization</span>
                    <span className="text-[10px] text-zinc-400 font-bold">LOCAL FALLBACK ACTIVE</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: REAL-TIME TICKER PROXY (Spans 5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* CoinGecko Real-time Rates */}
              <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-purple-950/20 pointer-events-none">
                  <Activity className="w-16 h-16 animate-pulse" />
                </div>
                <span className="px-2 py-0.5 bg-purple-950/60 text-purple-400 border border-purple-900/40 rounded text-[9px] font-black tracking-widest uppercase block w-fit mb-3">
                  Market Rates Feed
                </span>
                <h3 className="text-md font-black uppercase text-white tracking-widest mb-1">
                  Express API Rates Proxy
                </h3>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed mb-4">
                  Query the live CoinGecko API in real-time. If rates are unavailable or rate-limited, the Sovereign heuristic model serves immediate high-frequency variations.
                </p>

                <div className="space-y-3 pt-3 border-t border-zinc-900/60 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">API SOURCE:</span>
                    <span className="text-purple-400 font-bold">{apiSource}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">LAST UPDATED:</span>
                    <span className="text-zinc-300">{apiLastUpdated}</span>
                  </div>
                </div>

                {/* Live Rates Display */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {assets.filter(a => ['BTC', 'ETH', 'SOL', 'XMR'].includes(a.symbol) && !a.id.startsWith('ext-')).map(asset => (
                    <div key={asset.id} className="p-3 bg-black/60 border border-zinc-900 rounded-xl font-mono">
                      <span className="text-[8px] text-zinc-500 uppercase block font-bold">{asset.name}</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-white font-bold text-[11px]">{asset.symbol}</span>
                        <span className="text-purple-400 font-bold text-[10px]">
                          ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleFetchRates}
                  disabled={isRatesApiLoading}
                  className="w-full py-3 bg-purple-950/40 hover:bg-purple-900/40 text-purple-400 border border-purple-500/40 hover:border-purple-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 mt-5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRatesApiLoading ? 'animate-spin' : ''}`} />
                  {isRatesApiLoading ? "Synchronizing Live Feeds..." : "Query Live Market Prices"}
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: SECURE OAUTH HANDSHAKE (Spans 7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* OAuth Connection Panel */}
              <div className="bg-zinc-950/80 border border-zinc-900 p-6 rounded-2xl relative overflow-hidden">
                <span className="px-2 py-0.5 bg-purple-950/60 text-purple-400 border border-purple-900/40 rounded text-[9px] font-black tracking-widest uppercase block w-fit mb-3">
                  OAuth Integration Pipeline
                </span>
                <h3 className="text-md font-black uppercase text-white tracking-widest mb-1">
                  Connect External Live Portfolios
                </h3>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed mb-6">
                  Authenticating via OAuth initiates a secure popup handshake. Once granted, your verified balances are retrieved directly and merged into your wallet totals.
                </p>

                {!connectedPortfolio ? (
                  <div className="border border-dashed border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4">
                    <Globe className="w-10 h-10 text-zinc-700 animate-pulse" />
                    <div>
                      <span className="text-[11px] text-white font-bold block uppercase tracking-wide">No Active Handshake Detected</span>
                      <span className="text-[9px] text-zinc-500 font-mono block mt-1">Ready for decentralized, popup-based OAuth authorization</span>
                    </div>
                    
                    <button
                      onClick={handleInitiateOAuth}
                      disabled={isOauthConnecting}
                      className="px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer font-mono shadow-[0_0_15px_rgba(147,51,234,0.2)] flex items-center justify-center gap-2"
                    >
                      {isOauthConnecting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Executing Handshake...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3.5 h-3.5" />
                          Initiate Live OAuth Connection
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-950/10 border border-purple-900/40 rounded-xl flex items-center justify-between">
                      <div className="font-mono text-left">
                        <span className="text-[8px] text-purple-500 font-bold block uppercase">Verified Provider</span>
                        <span className="text-[11px] text-white font-black">{connectedPortfolio.provider}</span>
                      </div>
                      <div className="font-mono text-right">
                        <span className="text-[8px] text-purple-500 font-bold block uppercase">Linked Time</span>
                        <span className="text-[9.5px] text-zinc-300">{new Date(connectedPortfolio.connectedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-widest block">Synced Assets Allocation</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {connectedPortfolio.assets.map((item: any) => (
                          <div key={item.id} className="p-4 bg-black border border-zinc-900 rounded-xl relative overflow-hidden flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5 mb-2">
                                <span className="text-[9px] font-bold text-white font-mono">{item.symbol}</span>
                                <span className="text-[8px] text-purple-400 font-mono font-black uppercase">{item.chain}</span>
                              </div>
                              <span className="text-[8px] text-zinc-500 block uppercase font-mono">{item.name}</span>
                              <span className="text-[12px] text-white font-black font-mono block mt-1">
                                {item.balance.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-[9px] font-mono text-zinc-400 text-right mt-2 border-t border-zinc-900/30 pt-1">
                              Valuation: <span className="text-purple-400 font-bold">${(item.balance * item.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleDisconnectPortfolio}
                      className="w-full py-2.5 bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-900/40 hover:border-red-500 rounded-xl text-[10px] font-black uppercase tracking-wider font-mono transition-all cursor-pointer mt-2"
                    >
                      Disconnect Portfolios & Wipes Cache
                    </button>
                  </div>
                )}
              </div>

              {/* Monospace API Logger */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-widest block">Real-Time Sync Diagnostics</span>
                <div className="bg-black/95 border border-zinc-900 rounded-xl p-3 h-[130px] overflow-y-auto custom-scrollbar font-mono text-[9.5px] text-zinc-400 space-y-1 text-left">
                  {apiLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed border-b border-zinc-900/30 last:border-0 pb-0.5">
                      <span className="text-zinc-600">[{new Date().toLocaleDateString()}]</span> {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
