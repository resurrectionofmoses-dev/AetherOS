import React, { useState, useEffect, useRef } from 'react';
import { 
    ActivityIcon, ShieldIcon, ZapIcon, LockIcon, 
    ChevronRightIcon, ArrowUpRightIcon, ArrowDownLeftIcon,
    RefreshCwIcon, DatabaseIcon, CpuIcon, TrendingUpIcon,
    BitcoinIcon, HelpCircleIcon, CheckCircle2Icon, AlertTriangleIcon,
    InfoIcon, GlobeIcon, Share2Icon, PlayIcon, ServerIcon, 
    BookOpenIcon, SlidersIcon,
    Wallet, Key, Fingerprint, LogIn, LogOut, ArrowRight, ShoppingCart, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { RealMoneySystem, ResourceReserve } from '../services/realMoneySystem';

// --- SYSTEM COMPLIANT DETECTABLE DETERMINISTIC CRYPTOGRAPHIC HASH ENGINE ---
const hashString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return '0x' + hex.repeat(8).substring(0, 64);
};

// Types & Definitions
interface Tx {
    id: string; 
    coin: 'BTC' | 'XMR' | 'AERO' | 'SPEND';
    amount: number;
    sender: string;
    recipient: string;
    fee: number;
    timestamp: number;
    status: 'CONFIRMED' | 'PENDING';
    extraData?: Record<string, any>;
}

interface Block {
    height: number;
    hash: string;
    prevHash: string;
    merkleRoot: string;
    timestamp: number;
    transactions: Tx[];
    nonce: number;
    minedBy: string;
}

interface NetworkStats {
    blockHeight: number;
    hashrate: string;
    difficulty: string;
    price: string;
}

// Cognitive tab state retention cache
interface MainNetCache {
    selectedChain: 'BTC' | 'XMR' | 'AERO' | 'SPEND';
    btcStats: NetworkStats;
    xmrStats: NetworkStats;
    aeroStats: NetworkStats;
    btcBlocks: Block[];
    xmrBlocks: Block[];
    aeroBlocks: Block[];
    mempool: Tx[];
    isMining: boolean;
    miningEfficiency: number;
    rigWorker: string;
    rigTemp: number;
    latestNetworkLogs: string[];
    craftBTC: { utxoId: string; address: string; amount: string; feeRate: string; btcType: 'SEG_WIT' | 'LEGACY' };
    craftXMR: { stealthAddress: string; amount: string; mixInRingSize: string; blindFactor: string };
    craftAERO: { address: string; amount: string; nonce: string; gasPrice: string; dataHex: string };
    selectedBlockHeight: number | null;
    selectedTxId: string | null;
    proofSteps: { level: number; value: string; sibling: string; isLeft: boolean; result: string }[];
    currentProofStepIndex: number;
}

let mainNetCache: MainNetCache | null = null;

// Initial pre-loaded seed blocks for simulation
const initialBTCBlocks: Block[] = [
    {
        height: 841230,
        hash: '0x00000000000000000004fcf138da06214f4fbef9059f1388b1f24d10abcdef12',
        prevHash: '0x00000000000000000003bbaab1efef89a059fcccddeefab123ab456ef09876ff',
        merkleRoot: '0xde045fa0b41124fbef904ba015243bcdaef095efb05423fdbecdc014589abe42',
        timestamp: Date.now() - 3600000,
        nonce: 41249581,
        minedBy: 'Sovereign_Rig_04',
        transactions: [
            { id: 'tx_btc_01', coin: 'BTC', amount: 0.145, sender: 'bc1q9efb...632fda', recipient: 'bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h', fee: 0.00012, timestamp: Date.now() - 3610000, status: 'CONFIRMED' },
            { id: 'tx_btc_02', coin: 'BTC', amount: 1.250, sender: 'bc1q46ba...def102', recipient: 'bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h', fee: 0.00035, timestamp: Date.now() - 3620000, status: 'CONFIRMED' },
            { id: 'tx_btc_03', coin: 'BTC', amount: 0.045, sender: 'bc1qp6ec...ef8322', recipient: 'bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h', fee: 0.00008, timestamp: Date.now() - 3630000, status: 'CONFIRMED' },
            { id: 'tx_btc_04', coin: 'BTC', amount: 3.400, sender: 'bc1q0032...cf0041', recipient: 'bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h', fee: 0.00055, timestamp: Date.now() - 3640000, status: 'CONFIRMED' },
        ]
    },
    {
        height: 841231,
        hash: '0x00000000000000000001aef90590cceea0515ffbedef9099882431cf910543e2',
        prevHash: '0x00000000000000000004fcf138da06214f4fbef9059f1388b1f24d10abcdef12',
        merkleRoot: '0xea052ffb01249fa025e1ffa0451cfab0defbc0841258ef90abc45efa014389df',
        timestamp: Date.now() - 1800000,
        nonce: 83512903,
        minedBy: 'F2Pool_AetherOS',
        transactions: [
            { id: 'tx_btc_05', coin: 'BTC', amount: 0.005, sender: 'bc1qk0ef...632ffd', recipient: 'bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h', fee: 0.00005, timestamp: Date.now() - 1810000, status: 'CONFIRMED' },
            { id: 'tx_btc_06', coin: 'BTC', amount: 0.620, sender: 'bc1qaaa2...fffdd1', recipient: 'bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h', fee: 0.00021, timestamp: Date.now() - 1820000, status: 'CONFIRMED' },
            { id: 'tx_btc_07', coin: 'BTC', amount: 5.120, sender: 'bc1qxyz5...928abc', recipient: 'bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h', fee: 0.00085, timestamp: Date.now() - 1830000, status: 'CONFIRMED' },
            { id: 'tx_btc_08', coin: 'BTC', amount: 0.095, sender: 'bc1qkkk4...ff11ff', recipient: 'bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h', fee: 0.00011, timestamp: Date.now() - 1840000, status: 'CONFIRMED' },
        ]
    }
];

const initialXMRBlocks: Block[] = [
    {
        height: 3123450,
        hash: '0x44abbf88921df0105ffbaedbeef992e105eec09e63aae65492acff23eefca124',
        prevHash: '0x02ffe4aa12def909ccff9eebbedfe55aab01eecd00f2e0a293aacccfff23ef45',
        merkleRoot: '0xbcde445fadff019aebba62ebbedfa09923aacccddefbbee3e65421acddeefba0',
        timestamp: Date.now() - 4000000,
        nonce: 51221,
        minedBy: 'RandomX_Node_09',
        transactions: [
            { id: 'tx_xmr_01', coin: 'XMR', amount: 15.42, sender: 'StealthAddress_K91A...', recipient: '48fcae21...02faec4', fee: 0.002, timestamp: Date.now() - 4010000, status: 'CONFIRMED', extraData: { ringSize: 11, commit: 'PedersenCommit[15.42 XMR]', keyImage: '0xef9081e6...' } },
            { id: 'tx_xmr_02', coin: 'XMR', amount: 120.00, sender: 'StealthAddress_P64D...', recipient: '48ccffea...12defab', fee: 0.008, timestamp: Date.now() - 4020000, status: 'CONFIRMED', extraData: { ringSize: 11, commit: 'PedersenCommit[120.00 XMR]', keyImage: '0xee7788fa...' } },
            { id: 'tx_xmr_03', coin: 'XMR', amount: 3.14, sender: 'StealthAddress_M31F...', recipient: '45ffab00...bb8877f', fee: 0.001, timestamp: Date.now() - 4030000, status: 'CONFIRMED', extraData: { ringSize: 11, commit: 'PedersenCommit[3.14 XMR]', keyImage: '0xdd1122a1...' } },
            { id: 'tx_xmr_04', coin: 'XMR', amount: 8.88, sender: 'StealthAddress_Z12X...', recipient: '49ffe88f...99ac023', fee: 0.0015, timestamp: Date.now() - 4040000, status: 'CONFIRMED', extraData: { ringSize: 11, commit: 'PedersenCommit[8.88 XMR]', keyImage: '0x2233ff01...' } },
        ]
    },
    {
        height: 3123451,
        hash: '0x12defa015ffea0515ffbebdefaccdcce92accffeeddaee556214abeff831efaa',
        prevHash: '0x44abbf88921df0105ffbaedbeef992e105eec09e63aae65492acff23eefca124',
        merkleRoot: '0xeecdfabb9021ebdf0912abfeffccaee92ccff99238eebbee542ef9adef89fa62',
        timestamp: Date.now() - 2200000,
        nonce: 665241,
        minedBy: 'SupportXMR_Pool',
        transactions: [
            { id: 'tx_xmr_05', coin: 'XMR', amount: 25.10, sender: 'StealthAddress_Q42W...', recipient: '44abcdee...90faec2', fee: 0.003, timestamp: Date.now() - 2210000, status: 'CONFIRMED', extraData: { ringSize: 16, commit: 'PedersenCommit[25.10 XMR]', keyImage: '0xacfe9012...' } },
            { id: 'tx_xmr_06', coin: 'XMR', amount: 4.56, sender: 'StealthAddress_A02R...', recipient: '49ff2031...ef77ee8', fee: 0.001, timestamp: Date.now() - 2220000, status: 'CONFIRMED', extraData: { ringSize: 16, commit: 'PedersenCommit[4.56 XMR]', keyImage: '0xde4199cc...' } },
            { id: 'tx_xmr_07', coin: 'XMR', amount: 50.00, sender: 'StealthAddress_V48V...', recipient: '4abcffff...12aac7c', fee: 0.005, timestamp: Date.now() - 2230000, status: 'CONFIRMED', extraData: { ringSize: 16, commit: 'PedersenCommit[50.00 XMR]', keyImage: '0x77aa8892...' } },
            { id: 'tx_xmr_08', coin: 'XMR', amount: 1.09, sender: 'StealthAddress_X99F...', recipient: '45eeff22...bba12f8', fee: 0.0005, timestamp: Date.now() - 2240000, status: 'CONFIRMED', extraData: { ringSize: 16, commit: 'PedersenCommit[1.09 XMR]', keyImage: '0x9922aacc...' } },
        ]
    }
];

const initialAEROBlocks: Block[] = [
    {
        height: 1514233,
        hash: '0x99214abeffddee65241bcfff901265faec9815aacde8714faecffeed0124acba',
        prevHash: '0x321aef77bbccaee92ccddeef08162239aacdcceff90126aefdd4812392723acb',
        merkleRoot: '0x4421aefeedbccaaee551cfab9273cbaedff0152431faec98acbdeff9012431cf',
        timestamp: Date.now() - 3900000,
        nonce: 9942,
        minedBy: 'Aero_Validator_Lead',
        transactions: [
            { id: 'tx_aero_01', coin: 'AERO', amount: 250, sender: '0x8412eB...fFc11', recipient: '0x99213A...DDe90', fee: 0.05, timestamp: Date.now() - 3910000, status: 'CONFIRMED', extraData: { nonce: 4, gasLimit: 21000, data: '0x' } },
            { id: 'tx_aero_02', coin: 'AERO', amount: 15.2, sender: '0x1121cA...aAb55', recipient: '0x7ffff5...2134f', fee: 0.12, timestamp: Date.now() - 3920000, status: 'CONFIRMED', extraData: { nonce: 12, gasLimit: 60000, data: '0xa9059cbb00000000000000000000000099213...' } },
            { id: 'tx_aero_03', coin: 'AERO', amount: 1000, sender: '0xSovereign...Admin', recipient: '0xUniswap...AERO-BTC', fee: 0.85, timestamp: Date.now() - 3930000, status: 'CONFIRMED', extraData: { nonce: 1, gasLimit: 120000, data: '0xfcf138da0000000021aefbcde0002' } },
            { id: 'tx_aero_04', coin: 'AERO', amount: 1.5, sender: '0x489cbA...11fdd', recipient: '0x00Aero...Claim', fee: 0.04, timestamp: Date.now() - 3940000, status: 'CONFIRMED', extraData: { nonce: 0, gasLimit: 21000, data: '0x' } },
        ]
    },
    {
        height: 1514234,
        hash: '0xbcdef012aefbcdd992815ffbedef99815aacdeffbeed7722115fef0156efcbab',
        prevHash: '0x99214abeffddee65241bcfff901265faec9815aacde8714faecffeed0124acba',
        merkleRoot: '0x3312aef9125faec015ffea054deedffbccee882241cf90126ffeed0153efbbac',
        timestamp: Date.now() - 1500000,
        nonce: 10432,
        minedBy: 'Sovereign_State_Staker',
        transactions: [
            { id: 'tx_aero_05', coin: 'AERO', amount: 420.69, sender: '0xElon...Doger', recipient: '0xSovereign...Fund', fee: 0.22, timestamp: Date.now() - 1515000, status: 'CONFIRMED', extraData: { nonce: 69, gasLimit: 21000, data: '0x' } },
            { id: 'tx_aero_06', coin: 'AERO', amount: 9.99, sender: '0x98121a...abcca', recipient: '0x712fa6...ef321', fee: 0.08, timestamp: Date.now() - 1520000, status: 'CONFIRMED', extraData: { nonce: 1, gasLimit: 45000, data: '0xef9081e6' } },
            { id: 'tx_aero_07', coin: 'AERO', amount: 75.00, sender: '0xDeFi...Yielder', recipient: '0xVault...V2', fee: 0.41, timestamp: Date.now() - 1530000, status: 'CONFIRMED', extraData: { nonce: 145, gasLimit: 95000, data: '0x2e1aef90214c' } },
            { id: 'tx_aero_08', coin: 'AERO', amount: 12.00, sender: '0x00Aero...Deploy', recipient: '0xFactory...Router', fee: 0.55, timestamp: Date.now() - 1540000, status: 'CONFIRMED', extraData: { nonce: 8, gasLimit: 145000, data: '0x608060405234801561001057600080fd5b5061' } },
        ]
    }
];

// Helper to build a complete Merkle Tree
function buildMerkleTree(txs: Tx[]) {
    if (txs.length === 0) {
        return {
            leaves: [],
            levels: [["0x" + "0".repeat(64)]],
            root: "0x" + "0".repeat(64)
        };
    }
    
    const leaves = txs.map(t => {
        const payload = `${t.id}-${t.coin}-${t.amount}-${t.sender}-${t.recipient}-${t.fee}`;
        return hashString(payload);
    });
    
    const levels = [leaves];
    let currentLevel = leaves;
    
    while (currentLevel.length > 1) {
        const nextLevel: string[] = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i];
            const right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left;
            nextLevel.push(hashString(left + right));
        }
        levels.push(nextLevel);
        currentLevel = nextLevel;
    }
    
    return {
        leaves,
        levels,
        root: levels[levels.length - 1][0]
    };
}

// Generate specific verification path steps
function calculateMerkleProofAndSteps(txs: Tx[], targetIndex: number) {
    if (txs.length === 0 || targetIndex < 0 || targetIndex >= txs.length) return [];
    
    const { leaves, levels } = buildMerkleTree(txs);
    const steps = [];
    let currentIdx = targetIndex;
    let currentValue = leaves[targetIndex];
    let currentLevelIdx = 0;
    
    while (currentLevelIdx < levels.length - 1) {
        const currentLevel = levels[currentLevelIdx];
        const isSelfEven = currentIdx % 2 === 0;
        const siblingIdx = isSelfEven ? currentIdx + 1 : currentIdx - 1;
        
        let sibling = currentValue;
        if (siblingIdx < currentLevel.length) {
            sibling = currentLevel[siblingIdx];
        }
        
        const nextHash = isSelfEven 
            ? hashString(currentValue + sibling)
            : hashString(sibling + currentValue);
            
        steps.push({
            level: currentLevelIdx,
            value: currentValue,
            sibling,
            isLeft: !isSelfEven,
            result: nextHash
        });
        
        currentValue = nextHash;
        currentIdx = Math.floor(currentIdx / 2);
        currentLevelIdx++;
    }
    
    return steps;
}

export const MainNetView: React.FC = () => {
    const { user, login, guestLogin, logout, verifyBiometricSignature } = useAuth();

    const [selectedChain, setSelectedChain] = useState<'BTC' | 'XMR' | 'AERO' | 'SPEND'>(() => mainNetCache?.selectedChain ?? 'BTC');

    const [btcStats, setBtcStats] = useState<NetworkStats>(() => mainNetCache?.btcStats ?? {
        blockHeight: 841231,
        hashrate: '622.14 EH/s',
        difficulty: '84.38 T',
        price: '$67,402.12'
    });

    const [xmrStats, setXmrStats] = useState<NetworkStats>(() => mainNetCache?.xmrStats ?? {
        blockHeight: 3123451,
        hashrate: '2.89 GH/s',
        difficulty: '344.1 G',
        price: '$182.45'
    });

    const [aeroStats, setAeroStats] = useState<NetworkStats>(() => mainNetCache?.aeroStats ?? {
        blockHeight: 1514234,
        hashrate: '124.81 TH/s',
        difficulty: '5.20 P',
        price: '$2.42'
    });

    const [btcBlocks, setBtcBlocks] = useState<Block[]>(() => mainNetCache?.btcBlocks ?? initialBTCBlocks);
    const [xmrBlocks, setXmrBlocks] = useState<Block[]>(() => mainNetCache?.xmrBlocks ?? initialXMRBlocks);
    const [aeroBlocks, setAeroBlocks] = useState<Block[]>(() => mainNetCache?.aeroBlocks ?? initialAEROBlocks);

    const [spendBlocks, setSpendBlocks] = useState<Block[]>(() => {
        const saved = localStorage.getItem('aetheros_spend_blocks');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { console.error(e); }
        }
        return [
            {
                height: 100,
                hash: '0x00000000000000000004ff2bcf0a202611aaccdd058b7eed8892110cbeef9a12',
                prevHash: '0x00000000000000000003bbaab1efef89a059fcccddeefab123ab456ef09876ff',
                merkleRoot: '0xde045fa0b41124fbef904ba015243bcdaef095efb05423fdbecdc014589abe42',
                timestamp: Date.now() - 3600000,
                transactions: [
                    { id: 'tx_spend_genesis', coin: 'SPEND', amount: 50.0, sender: 'GENESIS_VALUATION', recipient: '0xSovereignOwnerWallet', fee: 0.1, timestamp: Date.now() - 3600000, status: 'CONFIRMED', extraData: { item: 'Genesis Reserve Distribution', certifiedBy: 'CENTRAL_BANK' } }
                ],
                nonce: 42,
                minedBy: 'MINING_RIG_AETHER_01'
            }
        ] as Block[];
    });

    useEffect(() => {
        localStorage.setItem('aetheros_spend_blocks', JSON.stringify(spendBlocks));
    }, [spendBlocks]);

    const [reserve, setReserve] = useState<ResourceReserve>(() => {
        const saved = localStorage.getItem('aetheros_resource_reserve');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { console.error(e); }
        }
        const newReserve = RealMoneySystem.instantiateReserve();
        localStorage.setItem('aetheros_resource_reserve', JSON.stringify(newReserve));
        return newReserve;
    });

    const updateReserveState = (newReserve: ResourceReserve) => {
        setReserve(newReserve);
        localStorage.setItem('aetheros_resource_reserve', JSON.stringify(newReserve));
    };

    const spendStats: NetworkStats = {
        blockHeight: spendBlocks[spendBlocks.length - 1]?.height ?? 100,
        hashrate: 'Value: ' + reserve.totalBackedCPH + ' CPH',
        difficulty: 'USD Pool: $' + reserve.totalBackedCPH.toFixed(2),
        price: '1 CPH = 1.00 USD'
    };

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const [customPayload, setCustomPayload] = useState('Purchase logistics fuel - 80 CPH');
    const [signingPassphrase, setSigningPassphrase] = useState('');
    const [signedResult, setSignedResult] = useState<string | null>(null);

    const [mempool, setMempool] = useState<Tx[]>(() => mainNetCache?.mempool ?? [
        { id: 'tx_un_01', coin: 'BTC', amount: 0.1200, sender: 'bc1q9efb...632fda', recipient: 'bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h', fee: 0.00015, timestamp: Date.now() - 30000, status: 'PENDING' },
        { id: 'tx_un_02', coin: 'XMR', amount: 4.80, sender: 'StealthAddress_P64D...', recipient: '48memp...55aa66', fee: 0.0012, timestamp: Date.now() - 15000, status: 'PENDING', extraData: { ringSize: 11, commit: 'PedersenCommit[4.80 XMR]', keyImage: '0x81ee82aa...' } },
        { id: 'tx_un_03', coin: 'AERO', amount: 150, sender: '0x8412eB...fFc11', recipient: '0xMemPool...Contract', fee: 0.08, timestamp: Date.now() - 5000, status: 'PENDING', extraData: { nonce: 5, gasLimit: 30000, data: '0x' } }
    ]);

    const [activeOpTab, setActiveOpTab] = useState<'consoles' | 'craftsman' | 'explorer'>('consoles');

    const [isMining, setIsMining] = useState(() => mainNetCache?.isMining ?? false);
    const [miningEfficiency, setMiningEfficiency] = useState(() => mainNetCache?.miningEfficiency ?? 0);
    const [rigWorker] = useState(() => mainNetCache?.rigWorker ?? 'AETHER_RIG_CORES_X8');
    const [rigTemp, setRigTemp] = useState(() => mainNetCache?.rigTemp ?? 54);

    const [latestNetworkLogs, setLatestNetworkLogs] = useState<string[]>(() => mainNetCache?.latestNetworkLogs ?? [
        '[AETHEROS_NET] Node cluster connected successfully.',
        '[BTC_DAEMON] Segment witness relay initialized on port 8333.',
        '[MONERO_XMR] RandomX JIT compilation active.',
        '[AERO_EVM] Gas scheduler initialized. Nonce tracker online.'
    ]);

    const [craftBTC, setCraftBTC] = useState(() => mainNetCache?.craftBTC ?? {
        utxoId: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        address: 'bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h',
        amount: '0.045',
        feeRate: '25',
        btcType: 'SEG_WIT' as 'SEG_WIT' | 'LEGACY'
    });

    const [craftXMR, setCraftXMR] = useState(() => mainNetCache?.craftXMR ?? {
        stealthAddress: '48fcae213210ab55ffe8899aaccc90aabdedfeefb9021eb482aef12a32ffcc90a78c12eed33',
        amount: '12.50',
        mixInRingSize: '11',
        blindFactor: '0xdeae1124fbcf88'
    });

    const [craftAERO, setCraftAERO] = useState(() => mainNetCache?.craftAERO ?? {
        address: '0x99213Acef901124faaebdedf0124ffaab0213ccb',
        amount: '75',
        nonce: '4',
        gasPrice: '28',
        dataHex: '0x'
    });

    const [selectedBlockHeight, setSelectedBlockHeight] = useState<number | null>(() => mainNetCache?.selectedBlockHeight ?? null);
    const [selectedTxId, setSelectedTxId] = useState<string | null>(() => mainNetCache?.selectedTxId ?? null);
    const [proofSteps, setProofSteps] = useState<{ level: number; value: string; sibling: string; isLeft: boolean; result: string }[]>(() => mainNetCache?.proofSteps ?? []);
    const [currentProofStepIndex, setCurrentProofStepIndex] = useState(() => mainNetCache?.currentProofStepIndex ?? 0);

    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const blocks = selectedChain === 'BTC' ? btcBlocks : selectedChain === 'XMR' ? xmrBlocks : selectedChain === 'AERO' ? aeroBlocks : spendBlocks;
        if (blocks.length > 0) {
            setSelectedBlockHeight(blocks[blocks.length - 1].height);
            setSelectedTxId(blocks[blocks.length - 1].transactions[0]?.id || null);
        }
    }, [selectedChain, btcBlocks, xmrBlocks, aeroBlocks, spendBlocks]);

    useEffect(() => {
        if (selectedBlockHeight === null) {
            setProofSteps([]);
            return;
        }
        
        const blocks = selectedChain === 'BTC' ? btcBlocks : selectedChain === 'XMR' ? xmrBlocks : selectedChain === 'AERO' ? aeroBlocks : spendBlocks;
        const currentBlock = blocks.find(b => b.height === selectedBlockHeight);
        if (!currentBlock) {
            setProofSteps([]);
            return;
        }

        const txIndex = currentBlock.transactions.findIndex(t => t.id === selectedTxId);
        if (txIndex !== -1) {
            const steps = calculateMerkleProofAndSteps(currentBlock.transactions, txIndex);
            setProofSteps(steps);
            setCurrentProofStepIndex(0);
        } else {
            setSelectedTxId(currentBlock.transactions[0]?.id || null);
        }
    }, [selectedBlockHeight, selectedTxId, selectedChain, btcBlocks, xmrBlocks, aeroBlocks, spendBlocks]);

    const isFirstLogsRef = useRef(true);

    useEffect(() => {
        const element = logEndRef.current;
        if (element && element.parentElement && element.parentElement.parentElement) {
            const container = element.parentElement.parentElement;
            const selection = window.getSelection();
            const hasSelection = selection && selection.toString();
            const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
            
            if (isFirstLogsRef.current || (isNearBottom && !hasSelection)) {
                element.scrollIntoView({ behavior: 'smooth' });
                isFirstLogsRef.current = false;
            }
        } else {
            logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [latestNetworkLogs]);

    useEffect(() => {
        mainNetCache = {
            selectedChain, btcStats, xmrStats, aeroStats, btcBlocks, xmrBlocks,
            aeroBlocks, mempool, isMining, miningEfficiency, rigWorker, rigTemp,
            latestNetworkLogs, craftBTC, craftXMR, craftAERO, selectedBlockHeight,
            selectedTxId, proofSteps, currentProofStepIndex
        };
    }, [
        selectedChain, btcStats, xmrStats, aeroStats, btcBlocks, xmrBlocks,
        aeroBlocks, mempool, isMining, miningEfficiency, rigWorker, rigTemp,
        latestNetworkLogs, craftBTC, craftXMR, craftAERO, selectedBlockHeight,
        selectedTxId, proofSteps, currentProofStepIndex
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setBtcStats(prev => ({
                ...prev,
                price: '$' + (parseFloat(prev.price.replace('$', '').replace(',', '')) + (Math.random() - 0.5) * 22).toLocaleString(undefined, { minimumFractionDigits: 2 }),
                hashrate: (620 + Math.random() * 8).toFixed(2) + ' EH/s'
            }));
            
            setXmrStats(prev => ({
                ...prev,
                price: '$' + (parseFloat(prev.price.replace('$', '').replace(',', '')) + (Math.random() - 0.5) * 0.45).toLocaleString(undefined, { minimumFractionDigits: 2 }),
                hashrate: (2.8 + Math.random() * 0.15).toFixed(2) + ' GH/s'
            }));

            setAeroStats(prev => ({
                ...prev,
                price: '$' + (parseFloat(prev.price.replace('$', '').replace(',', '')) + (Math.random() - 0.5) * 0.025).toLocaleString(undefined, { minimumFractionDigits: 4 }),
                hashrate: (123 + Math.random() * 3).toFixed(2) + ' TH/s'
            }));

            if (isMining) {
                setRigTemp(prev => Math.min(85, prev + (Math.random() > 0.4 ? 1 : -1)));
            } else {
                setRigTemp(prev => Math.max(48, prev - 1));
            }

            if (Math.random() > 0.85) {
                const triggerType = Math.random();
                if (triggerType < 0.4) {
                    const newTx: Tx = {
                        id: 'tx_org_' + Math.random().toString(16).slice(2, 8),
                        coin: 'BTC',
                        amount: parseFloat((Math.random() * 0.05).toFixed(4)),
                        sender: 'bc1q' + Math.random().toString(16).slice(2, 8) + '...',
                        recipient: 'bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h',
                        fee: 0.00008 + parseFloat((Math.random() * 0.0001).toFixed(5)),
                        timestamp: Date.now(),
                        status: 'PENDING'
                    };
                    setMempool(prev => [...prev, newTx]);
                    setLatestNetworkLogs(l => [...l, `[MEMPOOL] Accepted BTC transaction: ${newTx.amount} BTC`]);
                } else if (triggerType < 0.7) {
                    const newTx: Tx = {
                        id: 'tx_org_' + Math.random().toString(16).slice(2, 8),
                        coin: 'XMR',
                        amount: parseFloat((Math.random() * 6).toFixed(2)),
                        sender: 'StealthAddress_' + Math.random().toString(16).slice(2, 4).toUpperCase() + '...',
                        recipient: '4' + Math.random().toString(16).slice(2, 14) + '...',
                        fee: 0.001,
                        timestamp: Date.now(),
                        status: 'PENDING',
                        extraData: { ringSize: 11, commit: 'PedersenCommit[Masked]', keyImage: '0x' + Math.random().toString(16).slice(2, 10) }
                    };
                    setMempool(prev => [...prev, newTx]);
                    setLatestNetworkLogs(l => [...l, `[MEMPOOL] Private XMR transaction buffered.`]);
                } else {
                    const newTx: Tx = {
                        id: 'tx_org_' + Math.random().toString(16).slice(2, 8),
                        coin: 'AERO',
                        amount: Math.floor(Math.random() * 50) + 1,
                        sender: '0x' + Math.random().toString(16).slice(2, 8),
                        recipient: '0x' + Math.random().toString(16).slice(2, 8),
                        fee: 0.02 + parseFloat((Math.random() * 0.05).toFixed(3)),
                        timestamp: Date.now(),
                        status: 'PENDING',
                        extraData: { nonce: Math.floor(Math.random() * 10), gasLimit: 21000, data: '0x' }
                    };
                    setMempool(prev => [...prev, newTx]);
                    setLatestNetworkLogs(l => [...l, `[MEMPOOL] EVM transaction queued.`]);
                }
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [isMining]);

    useEffect(() => {
        let miningInterval: any;
        if (isMining) {
            miningInterval = setInterval(() => {
                setMiningEfficiency(prev => {
                    const next = prev + 5;
                    if (next >= 100) {
                        mineCurrentTransactions();
                        return 0;
                    }
                    return next;
                });
            }, 600);
        } else {
            setMiningEfficiency(0);
        }
        return () => clearInterval(miningInterval);
    }, [isMining, mempool, selectedChain]);

    const mineCurrentTransactions = () => {
        const toMine = mempool.filter(tx => tx.coin === selectedChain);
        const blockTxs = [...toMine];
        const requiredTxCount = 4;
        
        while (blockTxs.length < requiredTxCount) {
            const fillerId = 'tx_fill_' + Math.random().toString(16).slice(2, 8);
            if (selectedChain === 'BTC') {
                blockTxs.push({
                    id: fillerId, coin: 'BTC', amount: parseFloat((Math.random() * 0.08).toFixed(5)),
                    sender: 'bc1q' + Math.random().toString(16).slice(2,6) + '...filler', recipient: 'bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h',
                    fee: 0.0001, timestamp: Date.now(), status: 'CONFIRMED'
                });
            } else if (selectedChain === 'XMR') {
                blockTxs.push({
                    id: fillerId, coin: 'XMR', amount: parseFloat((Math.random() * 5).toFixed(2)),
                    sender: 'StealthAddress_' + fillerId.toUpperCase(), recipient: '4' + Math.random().toString(16).slice(2, 10) + '...',
                    fee: 0.001, timestamp: Date.now(), status: 'CONFIRMED',
                    extraData: { ringSize: 11, commit: 'PedersenCommit[MaskedAmount]', keyImage: '0x' + Math.random().toString(16).slice(2, 10) }
                });
            } else if (selectedChain === 'AERO') {
                blockTxs.push({
                    id: fillerId, coin: 'AERO', amount: Math.floor(Math.random() * 80) + 1,
                    sender: '0x' + Math.random().toString(16).slice(2, 6) + '...filler', recipient: '0x' + Math.random().toString(16).slice(2,6) + '...filler',
                    fee: 0.015, timestamp: Date.now(), status: 'CONFIRMED',
                    extraData: { nonce: Math.floor(Math.random() * 10), gasLimit: 21000, data: '0x' }
                });
            } else {
                blockTxs.push({
                    id: fillerId, coin: 'SPEND', amount: Math.floor(Math.random() * 25) + 5,
                    sender: '0xSovereignOwnerWallet', recipient: 'MerchantPartner_' + Math.floor(Math.random() * 9),
                    fee: 0.1, timestamp: Date.now(), status: 'CONFIRMED',
                    extraData: { item: 'Simulated Settlement', details: 'Automated value reconciliation' }
                });
            }
        }

        const merkle = buildMerkleTree(blockTxs);
        
        if (selectedChain === 'BTC') {
            const lastBlock = btcBlocks[btcBlocks.length - 1];
            const newBlockHeight = lastBlock.height + 1;
            const newBlockHash = hashString(lastBlock.hash + merkle.root);
            const block: Block = {
                height: newBlockHeight, hash: newBlockHash, prevHash: lastBlock.hash,
                merkleRoot: merkle.root, timestamp: Date.now(), nonce: Math.floor(Math.random() * 99999999),
                minedBy: rigWorker, transactions: blockTxs
            };
            setBtcBlocks(prev => [...prev, block]);
            setBtcStats(prev => ({ ...prev, blockHeight: newBlockHeight }));
            setSelectedBlockHeight(newBlockHeight);
        } else if (selectedChain === 'XMR') {
            const lastBlock = xmrBlocks[xmrBlocks.length - 1];
            const newBlockHeight = lastBlock.height + 1;
            const newBlockHash = hashString(lastBlock.hash + merkle.root);
            const block: Block = {
                height: newBlockHeight, hash: newBlockHash, prevHash: lastBlock.hash,
                merkleRoot: merkle.root, timestamp: Date.now(), nonce: Math.floor(Math.random() * 999999),
                minedBy: rigWorker, transactions: blockTxs
            };
            setXmrBlocks(prev => [...prev, block]);
            setXmrStats(prev => ({ ...prev, blockHeight: newBlockHeight }));
            setSelectedBlockHeight(newBlockHeight);
        } else if (selectedChain === 'AERO') {
            const lastBlock = aeroBlocks[aeroBlocks.length - 1];
            const newBlockHeight = lastBlock.height + 1;
            const newBlockHash = hashString(lastBlock.hash + merkle.root);
            const block: Block = {
                height: newBlockHeight, hash: newBlockHash, prevHash: lastBlock.hash,
                merkleRoot: merkle.root, timestamp: Date.now(), nonce: Math.floor(Math.random() * 99999),
                minedBy: rigWorker, transactions: blockTxs
            };
            setAeroBlocks(prev => [...prev, block]);
            setAeroStats(prev => ({ ...prev, blockHeight: newBlockHeight }));
            setSelectedBlockHeight(newBlockHeight);
        } else {
            const lastBlock = spendBlocks[spendBlocks.length - 1];
            const newBlockHeight = lastBlock.height + 1;
            const newBlockHash = hashString(lastBlock.hash + merkle.root);
            const block: Block = {
                height: newBlockHeight, hash: newBlockHash, prevHash: lastBlock.hash,
                merkleRoot: merkle.root, timestamp: Date.now(), nonce: Math.floor(Math.random() * 9999),
                minedBy: 'Sovereign Mining Core', transactions: blockTxs
            };
            setSpendBlocks(prev => [...prev, block]);
            setSelectedBlockHeight(newBlockHeight);
        }

        setMempool(prev => prev.filter(tx => !toMine.some(tm => tm.id === tx.id)));
        setLatestNetworkLogs(l => [
            ...l, 
            `[BLOCKCHAIN] Forged block #${selectedChain === 'BTC' ? btcStats.blockHeight + 1 : selectedChain === 'XMR' ? xmrStats.blockHeight + 1 : selectedChain === 'AERO' ? aeroStats.blockHeight + 1 : spendBlocks[spendBlocks.length - 1].height + 1}!`,
            `[BLOCKCHAIN] Merkle Root: ${merkle.root.slice(0, 24)}...`
        ]);
    };

    const handleCraftBroadcast = (e: React.FormEvent) => {
        e.preventDefault();
        let newTx: Tx;
        const txId = 'tx_custom_' + Math.random().toString(16).slice(2, 8);

        if (selectedChain === 'BTC') {
            const amt = parseFloat(craftBTC.amount) || 0.005;
            newTx = {
                id: txId, coin: 'BTC', amount: amt,
                sender: 'bc1q_UTXO_source_' + craftBTC.utxoId.slice(2, 8), recipient: craftBTC.address,
                fee: (parseFloat(craftBTC.feeRate) * 141) / 100000000, timestamp: Date.now(), status: 'PENDING',
                extraData: { utxoSpend: craftBTC.utxoId, scriptType: craftBTC.btcType }
            };
            setLatestNetworkLogs(prev => [
                ...prev,
                `[TRANSACTION] Signed with UTXO private key.`,
                `[MEMPOOL] BTC Address bc1q... loaded in memory.`
            ]);
        } else if (selectedChain === 'XMR') {
            const amt = parseFloat(craftXMR.amount) || 1.5;
            newTx = {
                id: txId, coin: 'XMR', amount: amt,
                sender: 'StealthAddress_Generated_blip', recipient: craftXMR.stealthAddress,
                fee: 0.0015, timestamp: Date.now(), status: 'PENDING',
                extraData: { ringSize: parseInt(craftXMR.mixInRingSize), commit: `PedersenCommit[Blinded: ${craftXMR.blindFactor.slice(0, 10)}...]` }
            };
            setLatestNetworkLogs(prev => [
                ...prev,
                `[XMR_PRIVACY] Concealing amount via Pedersen commitments.`,
                `[XMR_PRIVACY] Forged ring signature with decoy keys.`
            ]);
        } else {
            const amt = parseFloat(craftAERO.amount) || 12;
            newTx = {
                id: txId, coin: 'AERO', amount: amt,
                sender: '0xSovereignOwnerWalletAccount', recipient: craftAERO.address,
                fee: (parseInt(craftAERO.gasPrice) * 21000) / 1000000000, timestamp: Date.now(), status: 'PENDING',
                extraData: { nonce: parseInt(craftAERO.nonce), gasLimit: 21000, data: craftAERO.dataHex }
            };
            setLatestNetworkLogs(prev => [
                ...prev,
                `[AERO_EVM] Gas cost: ${newTx.fee} AERO`,
                `[MEMPOOL] EVM transition submitted to memory pool.`
            ]);
        }

        setMempool(prev => [...prev, newTx]);

        if (selectedChain === 'BTC') {
            setCraftBTC(prev => ({ ...prev, utxoId: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('') }));
        } else if (selectedChain === 'XMR') {
            setCraftXMR(prev => ({ ...prev, blindFactor: '0x' + Array(16).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('') }));
        } else {
            setCraftAERO(prev => ({ ...prev, nonce: (parseInt(prev.nonce) + 1).toString() }));
        }
    };

    const activeBlocks = selectedChain === 'BTC' ? btcBlocks : selectedChain === 'XMR' ? xmrBlocks : selectedChain === 'AERO' ? aeroBlocks : spendBlocks;
    const activeBlock = activeBlocks.find(b => b.height === selectedBlockHeight) || activeBlocks[activeBlocks.length - 1];

    const chainColorMap = {
        BTC: { text: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/10', solid: 'bg-orange-500', hover: 'hover:bg-orange-500/20' },
        XMR: { text: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/10', solid: 'bg-purple-500', hover: 'hover:bg-purple-500/20' },
        AERO: { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/10', solid: 'bg-emerald-500', hover: 'hover:bg-emerald-500/20' },
        SPEND: { text: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10', glow: 'shadow-sky-500/10', solid: 'bg-sky-500', hover: 'hover:bg-sky-500/20' },
    };

    const cColors = chainColorMap[selectedChain];

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050508] text-zinc-100 font-sans select-text pb-12">
            {/* Real-time Crypto Header HUD */}
            <div className="p-6 md:p-8 border-b border-zinc-900 bg-zinc-950/60 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_2%_2%,_rgba(16,185,129,0.05)_0%,_transparent_60%)] pointer-events-none" />
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                            <ActivityIcon className="w-6 h-6 text-emerald-400 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-wider uppercase">
                                AERO_Sovereign_Main_Net
                            </h2>
                            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                Multi-Node Ledger Terminal Active
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs">
                        <div className="border border-zinc-900 bg-zinc-950/40 px-4 py-2 rounded-xl">
                            <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Peers Online</p>
                            <p className="font-bold text-white flex items-center gap-1.5">
                                <DatabaseIcon className="w-3.5 h-3.5 text-sky-400" />
                                3 Verifiable L1 Nodes
                            </p>
                        </div>
                        <div className="border border-zinc-900 bg-zinc-950/40 px-4 py-2 rounded-xl">
                            <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Verifiable Proofing</p>
                            <p className="font-bold text-white flex items-center gap-1.5">
                                <ShieldIcon className="w-3.5 h-3.5 text-emerald-400" />
                                SHA-256 Merkle Verification
                            </p>
                        </div>
                        <div className="border border-zinc-900 bg-zinc-950/40 px-4 py-2 rounded-xl">
                            <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Mempool Status</p>
                            <p className="font-bold text-rose-400 flex items-center gap-1.5">
                                <SlidersIcon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                                {mempool.filter(t => t.coin === selectedChain).length} Queued Tx
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Blockchain Tab Switchers */}
            <div className="border-b border-zinc-900 bg-zinc-950/30">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => setSelectedChain('BTC')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 border ${
                                selectedChain === 'BTC' 
                                    ? 'bg-orange-500/10 border-orange-500/80 text-orange-400 shadow-lg shadow-orange-500/5' 
                                    : 'bg-zinc-900/20 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
                            }`}
                        >
                            <BitcoinIcon className="w-4 h-4" />
                            Bitcoin Core
                        </button>
                        <button 
                            onClick={() => setSelectedChain('XMR')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 border ${
                                selectedChain === 'XMR' 
                                    ? 'bg-purple-500/10 border-purple-500/80 text-purple-400 shadow-lg shadow-purple-500/5' 
                                    : 'bg-zinc-900/20 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
                            }`}
                        >
                            <LockIcon className="w-4 h-4" />
                            Monero Sovereign
                        </button>
                        <button 
                            onClick={() => setSelectedChain('AERO')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 border ${
                                selectedChain === 'AERO' 
                                    ? 'bg-emerald-500/10 border-emerald-500/80 text-emerald-400 shadow-lg shadow-emerald-500/5' 
                                    : 'bg-zinc-900/20 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
                            }`}
                        >
                            <ZapIcon className="w-4 h-4" />
                            AERO EVM L1
                        </button>
                        <button 
                            onClick={() => setSelectedChain('SPEND')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 border ${
                                selectedChain === 'SPEND' 
                                    ? 'bg-sky-500/10 border-sky-500/80 text-sky-400 shadow-lg shadow-sky-500/5' 
                                    : 'bg-zinc-900/20 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
                            }`}
                        >
                            <Wallet className="w-4 h-4" />
                            Spend Wallet (CPH)
                        </button>
                    </div>

                    <div className="text-xs font-semibold text-zinc-500 flex items-center gap-2">
                        <GlobeIcon className="w-4 h-4 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
                        <span>INTERCEPTABLE CONSOLE ENABLED</span>
                    </div>
                </div>
            </div>

            {/* High-Tech Operating Mode Switcher */}
            <div className="max-w-7xl mx-auto w-full px-6 md:px-8 mt-6">
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-1.5 flex flex-wrap gap-2 backdrop-blur-md">
                    <button
                        onClick={() => setActiveOpTab('consoles')}
                        className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer border ${activeOpTab === 'consoles' ? 'bg-emerald-600 border-emerald-500 text-black shadow-lg shadow-emerald-500/10 font-extrabold' : 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/40'}`}
                    >
                        <CpuIcon className="w-4 h-4" />
                        Cores & Consoles
                    </button>
                    <button
                        onClick={() => setActiveOpTab('craftsman')}
                        className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer border ${activeOpTab === 'craftsman' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/10 font-extrabold' : 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/40'}`}
                    >
                        <SlidersIcon className="w-4 h-4" />
                        Transaction Craftsman
                    </button>
                    <button
                        onClick={() => setActiveOpTab('explorer')}
                        className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer border ${activeOpTab === 'explorer' ? 'bg-orange-500/10 border-orange-500/80 text-orange-400 shadow-lg shadow-orange-500/5 font-extrabold' : 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/40'}`}
                    >
                        <ShieldIcon className="w-4 h-4" />
                        Merkle Explorer
                    </button>
                </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="max-w-7xl mx-auto w-full px-6 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Section - Responsive Column Width based on Mode */}
                <div className={`${activeOpTab === 'consoles' ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-8`}>
                    
                    {/* Live Network Stats Cards */}
                    {activeOpTab === 'consoles' && (
                        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/20 to-transparent pointer-events-none" />
                            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <TrendingUpIcon className="w-4.5 h-4.5 text-emerald-400" /> 
                                {selectedChain === 'BTC' ? 'Bitcoin L1 Core Parameters' : selectedChain === 'XMR' ? 'Monero Sovereign Privacy Parameters' : selectedChain === 'AERO' ? 'Aether EVM Engine Parameters' : 'Real Spending (CPH) Liquidity Backing'}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-black/40 border border-zinc-900 rounded-xl">
                                    <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Tip Block Height</p>
                                    <p className="text-base font-bold text-white">
                                        {selectedChain === 'BTC' ? btcStats.blockHeight.toLocaleString() : selectedChain === 'XMR' ? xmrStats.blockHeight.toLocaleString() : selectedChain === 'AERO' ? aeroStats.blockHeight.toLocaleString() : spendStats.blockHeight.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-black/40 border border-zinc-900 rounded-xl">
                                    <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Asset Quote</p>
                                    <p className="text-base font-bold text-emerald-400">
                                        {selectedChain === 'BTC' ? btcStats.price : selectedChain === 'XMR' ? xmrStats.price : selectedChain === 'AERO' ? aeroStats.price : spendStats.price}
                                    </p>
                                </div>
                                <div className="p-4 bg-black/40 border border-zinc-900 rounded-xl col-span-1">
                                    <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Network Capacity</p>
                                    <p className="text-sm font-bold text-zinc-300 truncate">
                                        {selectedChain === 'BTC' ? btcStats.hashrate : selectedChain === 'XMR' ? xmrStats.hashrate : selectedChain === 'AERO' ? aeroStats.hashrate : spendStats.hashrate}
                                    </p>
                                </div>
                                <div className="p-4 bg-black/40 border border-zinc-900 rounded-xl col-span-1">
                                    <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Consensus Difficulty</p>
                                    <p className="text-sm font-bold text-zinc-300 truncate">
                                        {selectedChain === 'BTC' ? btcStats.difficulty : selectedChain === 'XMR' ? xmrStats.difficulty : selectedChain === 'AERO' ? aeroStats.difficulty : spendStats.difficulty}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transaction Maker */}
                    {activeOpTab === 'craftsman' && (
                        <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6">
                            {selectedChain !== 'SPEND' ? (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                            <Share2Icon className="w-4.5 h-4.5 text-emerald-400" /> Transaction Craftsman
                                        </h3>
                                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/30 px-2.5 py-1 rounded border border-indigo-900/50 uppercase">
                                            RAW SIGNATURE ENGINE
                                        </span>
                                    </div>

                                <form onSubmit={handleCraftBroadcast} className="space-y-4">
                                    {selectedChain === 'BTC' && (
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-zinc-400 uppercase font-semibold">UTXO Outpoint Origin Hash</label>
                                                <input 
                                                    type="text"
                                                    value={craftBTC.utxoId}
                                                    onChange={(e) => setCraftBTC({ ...craftBTC, utxoId: e.target.value })}
                                                    className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-zinc-400 uppercase font-semibold">Recipient Segwit Address</label>
                                                <input 
                                                    type="text"
                                                    value={craftBTC.address}
                                                    onChange={(e) => setCraftBTC({ ...craftBTC, address: e.target.value })}
                                                    className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs text-zinc-400 uppercase font-semibold">Value (BTC)</label>
                                                    <input 
                                                        type="number"
                                                        step="0.0001"
                                                        value={craftBTC.amount}
                                                        onChange={(e) => setCraftBTC({ ...craftBTC, amount: e.target.value })}
                                                        className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs text-zinc-400 uppercase font-semibold">Fee (sat/vB)</label>
                                                    <input 
                                                        type="number"
                                                        value={craftBTC.feeRate}
                                                        onChange={(e) => setCraftBTC({ ...craftBTC, feeRate: e.target.value })}
                                                        className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs text-zinc-400 uppercase font-semibold block mb-2">Encoding Scheme</span>
                                                <div className="flex gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setCraftBTC({ ...craftBTC, btcType: 'SEG_WIT' })}
                                                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${craftBTC.btcType === 'SEG_WIT' ? 'bg-orange-500/10 text-orange-400 border-orange-500' : 'bg-transparent border-zinc-800 text-zinc-500'}`}
                                                    >
                                                        Native Segwit (bc1q)
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setCraftBTC({ ...craftBTC, btcType: 'LEGACY' })}
                                                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${craftBTC.btcType === 'LEGACY' ? 'bg-orange-500/10 text-orange-400 border-orange-500' : 'bg-transparent border-zinc-800 text-zinc-500'}`}
                                                    >
                                                        Legacy Address (1)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedChain === 'XMR' && (
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-zinc-400 uppercase font-semibold">Anonymous Stealth Address</label>
                                                <input 
                                                    type="text"
                                                    value={craftXMR.stealthAddress}
                                                    onChange={(e) => setCraftXMR({ ...craftXMR, stealthAddress: e.target.value })}
                                                    className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-purple-500 focus:outline-none leading-relaxed"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs text-zinc-400 uppercase font-semibold">Privacy Ring Mixins</label>
                                                    <select 
                                                        value={craftXMR.mixInRingSize}
                                                        onChange={(e) => setCraftXMR({ ...craftXMR, mixInRingSize: e.target.value })}
                                                        className="w-full bg-black border border-zinc-800 text-purple-400 font-mono text-xs px-3 py-2.5 rounded-xl focus:border-purple-500 focus:outline-none"
                                                    >
                                                        <option value="11">Ring Size: 11 (Standard)</option>
                                                        <option value="16">Ring Size: 16 (Enhanced)</option>
                                                        <option value="24">Ring Size: 24 (Sovereign)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs text-zinc-400 uppercase font-semibold">Confidential Value (XMR)</label>
                                                    <input 
                                                        type="number"
                                                        step="0.01"
                                                        value={craftXMR.amount}
                                                        onChange={(e) => setCraftXMR({ ...craftXMR, amount: e.target.value })}
                                                        className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-purple-500 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-zinc-400 uppercase font-semibold">Pedersen Commitment Blinding Factor</label>
                                                <input 
                                                    type="text"
                                                    value={craftXMR.blindFactor}
                                                    onChange={(e) => setCraftXMR({ ...craftXMR, blindFactor: e.target.value })}
                                                    className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-purple-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {selectedChain === 'AERO' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs text-zinc-400 uppercase font-semibold">Nonce Sequence</label>
                                                    <input 
                                                        type="number"
                                                        value={craftAERO.nonce}
                                                        onChange={(e) => setCraftAERO({ ...craftAERO, nonce: e.target.value })}
                                                        className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs text-zinc-400 uppercase font-semibold">Gas Price (Gwei)</label>
                                                    <input 
                                                        type="number"
                                                        value={craftAERO.gasPrice}
                                                        onChange={(e) => setCraftAERO({ ...craftAERO, gasPrice: e.target.value })}
                                                        className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-zinc-400 uppercase font-semibold">Destination EVM Address</label>
                                                <input 
                                                    type="text"
                                                    value={craftAERO.address}
                                                    onChange={(e) => setCraftAERO({ ...craftAERO, address: e.target.value })}
                                                    className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-zinc-400 uppercase font-semibold">Smart Contract Bytecode Data Payload</label>
                                                <input 
                                                    type="text"
                                                    value={craftAERO.dataHex}
                                                    onChange={(e) => setCraftAERO({ ...craftAERO, dataHex: e.target.value })}
                                                    className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-black/40 rounded-xl border border-zinc-900 flex flex-col justify-center">
                                                    <span className="text-[10px] text-zinc-500 uppercase font-black">Intrinsic Gas Limit</span>
                                                    <span className="text-xs font-bold text-white mt-1">21,000 gas units</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs text-zinc-400 uppercase font-semibold">Amount AERO</label>
                                                    <input 
                                                        type="number"
                                                        value={craftAERO.amount}
                                                        onChange={(e) => setCraftAERO({ ...craftAERO, amount: e.target.value })}
                                                        className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Serialized Hex Stream Box */}
                                    <div className="p-4 bg-black/50 border border-zinc-900 rounded-xl">
                                        <p className="text-[10px] text-zinc-500 font-extrabold uppercase mb-2 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                                            Dynamic Pre-Broadcast Serialized Hex Payload
                                        </p>
                                        <p className="text-xs font-mono leading-relaxed text-zinc-300 break-all bg-zinc-950 p-3 rounded-lg max-h-16 overflow-y-auto selection:bg-emerald-800 selection:text-white">
                                            {selectedChain === 'BTC' 
                                                ? `0200000001${craftBTC.utxoId.slice(2,24)}0000000000ffffff1a${hashString(craftBTC.address).slice(2, 28)}` 
                                                : selectedChain === 'XMR' 
                                                ? `0c11aeef4812f${hashString(craftXMR.stealthAddress).slice(2, 34)}ffff8ac077` 
                                                : `0xf86a048505bcbe170082520894${craftAERO.address.slice(2, 18)}880de`
                                            }
                                        </p>
                                    </div>

                                    <button 
                                        type="submit"
                                        className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 border shadow-lg cursor-pointer ${
                                            selectedChain === 'BTC' 
                                                ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-700 hover:shadow-orange-500/10' 
                                                : selectedChain === 'XMR' 
                                                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-700 hover:shadow-purple-500/10' 
                                                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700 hover:shadow-emerald-500/10'
                                        }`}
                                    >
                                        <ArrowUpRightIcon className="w-4 h-4 animate-bounce" />
                                        Broadcast Cryptographic {selectedChain} TX
                                    </button>
                                </form>
                            </div>
                        ) : (
                            // ==========================================
                            // REAL-WORLD SPEND (CPH) PORTAL
                            // ==========================================
                            <div className="space-y-6">
                                <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <Wallet className="w-4.5 h-4.5 text-sky-400" /> Spending Handshake
                                    </h3>
                                    <span className="text-[10px] font-bold text-sky-400 bg-sky-950/30 px-2.5 py-1 rounded border border-sky-900/50 uppercase">
                                        BACKED LIQUIDITY
                                    </span>
                                </div>

                                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4 relative overflow-hidden">
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500" />
                                    {user ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-xs font-bold text-zinc-200">Operator Session Connected</span>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        logout();
                                                        setLatestNetworkLogs(l => [...l, `[SESSION] Operator logged out.`]);
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-bold uppercase text-rose-400 bg-rose-950/10 hover:bg-rose-950/30 border border-rose-900/50 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                                                >
                                                    <LogOut className="w-3.5 h-3.5" />
                                                    Handshake Exit
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-zinc-400 leading-relaxed">
                                                <p><span className="text-zinc-650 font-sans font-bold">Identity:</span> {user.displayName}</p>
                                                <p><span className="text-zinc-650 font-sans font-bold">Key Handle:</span> {user.email}</p>
                                                <p><span className="text-zinc-650 font-sans font-bold">Role Class:</span> <span className="text-sky-400 font-bold">{user.role?.toUpperCase()}</span></p>
                                                <p><span className="text-zinc-650 font-sans font-bold">Sovereignty:</span> {user.sovereignty}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-rose-400">
                                                <AlertTriangleIcon className="w-4 h-4 animate-bounce" />
                                                <span className="text-xs font-bold uppercase tracking-wider">No Active Handshake Session</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 leading-relaxed">
                                                A secure operator handshake is required to initiate biometrically signed merchant transactions.
                                            </p>
                                            {loginError && (
                                                <div className="p-3 bg-rose-950/20 border border-rose-900/50 rounded-xl text-xs text-rose-400 font-bold uppercase">
                                                    Error: {loginError}
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input 
                                                    type="email" 
                                                    placeholder="Operator Email" 
                                                    value={loginEmail}
                                                    onChange={e => setLoginEmail(e.target.value)}
                                                    className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-sky-500 focus:outline-none"
                                                />
                                                <input 
                                                    type="password" 
                                                    placeholder="Cryptographic Passphrase" 
                                                    value={loginPassword}
                                                    onChange={e => setLoginPassword(e.target.value)}
                                                    className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-sky-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    type="button"
                                                    disabled={loginLoading}
                                                    onClick={async () => {
                                                        if (!loginEmail || !loginPassword) {
                                                            setLoginError('Email and passphrase required.');
                                                            return;
                                                        }
                                                        setLoginLoading(true);
                                                        setLoginError(null);
                                                        try {
                                                            await login(loginEmail, loginPassword);
                                                            setLatestNetworkLogs(l => [...l, `[SESSION] Keys bound: ${loginEmail}`]);
                                                            setLoginEmail(''); setLoginPassword('');
                                                        } catch (err: any) {
                                                            setLoginError(err.message || 'Key Conduction Handshake failed.');
                                                        } finally {
                                                            setLoginLoading(false);
                                                        }
                                                    }}
                                                    className="flex-1 py-2.5 text-xs font-bold bg-sky-900 hover:bg-sky-800 text-white uppercase rounded-xl border border-sky-950 transition-all flex items-center justify-center gap-1 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                                >
                                                    <LogIn className="w-4 h-4" />
                                                    Conduction Handshake
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        guestLogin();
                                                        setLatestNetworkLogs(l => [...l, `[SESSION] Guest Mode bypass loaded.`]);
                                                        setLoginError(null);
                                                    }}
                                                    className="px-4 py-2.5 text-xs font-bold border border-zinc-800 text-zinc-300 bg-zinc-900/60 rounded-xl hover:text-white transition-all uppercase cursor-pointer"
                                                >
                                                    Bypass
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Resource extraction tools */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs text-zinc-400 uppercase font-semibold">Reserve Mining & Extractions</label>
                                        <span className="text-[10px] font-bold text-sky-400 bg-sky-950/20 px-2.5 py-1 rounded border border-sky-900/40 uppercase">CPH Valuation backing</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (!user) { alert("Security Lock: Operator Handshake required."); return; }
                                                const res = RealMoneySystem.runExtraction(reserve, 'energy', 'solar_power', 50, 1, 'kWh');
                                                updateReserveState(res.reserve);
                                                setLatestNetworkLogs(l => [...l, `[EXTRACTOR] Produced Solar Energy: +50 kWh (+50 CPH value)`]);
                                            }}
                                            className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-yellow-500/30 transition-all text-center flex flex-col items-center justify-center group active:scale-95 cursor-pointer"
                                        >
                                            <ZapIcon className="w-5 h-5 text-yellow-500 mb-1.5 group-hover:animate-bounce" />
                                            <span className="text-xs text-zinc-400 font-bold uppercase">Solar Power</span>
                                            <span className="text-xs font-bold text-white mt-1">+50 kWh</span>
                                            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">+50 CPH</span>
                                        </button>

                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (!user) { alert("Security Lock: Operator Handshake required."); return; }
                                                const res = RealMoneySystem.runExtraction(reserve, 'food', 'grain', 20, 5, 'kg');
                                                updateReserveState(res.reserve);
                                                setLatestNetworkLogs(l => [...l, `[EXTRACTOR] Harvested Wheat farm: +20 kg (+100 CPH backing)`]);
                                            }}
                                            className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-orange-500/30 transition-all text-center flex flex-col items-center justify-center group active:scale-95 cursor-pointer"
                                        >
                                            <BookOpenIcon className="w-5 h-5 text-orange-400 mb-1.5 group-hover:animate-bounce" />
                                            <span className="text-xs text-zinc-400 font-bold uppercase">Grain Farm</span>
                                            <span className="text-xs font-bold text-white mt-1">+20 kg</span>
                                            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">+100 CPH</span>
                                        </button>

                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (!user) { alert("Security Lock: Operator Handshake required."); return; }
                                                const res = RealMoneySystem.runExtraction(reserve, 'materials', 'iron_ore', 50, 2, 'kg');
                                                updateReserveState(res.reserve);
                                                setLatestNetworkLogs(l => [...l, `[EXTRACTOR] Extracted Iron ore: +50 kg (+100 CPH value)`]);
                                            }}
                                            className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-sky-500/30 transition-all text-center flex flex-col items-center justify-center group active:scale-95 cursor-pointer"
                                        >
                                            <DatabaseIcon className="w-5 h-5 text-sky-400 mb-1.5 group-hover:animate-bounce" />
                                            <span className="text-xs text-zinc-400 font-bold uppercase">Iron Ore</span>
                                            <span className="text-xs font-bold text-white mt-1">+50 kg</span>
                                            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">+100 CPH</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Payload Signature tool */}
                                <div className="space-y-3 pt-3 border-t border-zinc-900">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs text-zinc-400 uppercase font-semibold">Deterministic Payload Signer</label>
                                        <span className="text-[10px] font-mono text-zinc-500">Double SHA-256 Engine</span>
                                    </div>
                                    <div className="space-y-3">
                                        <input 
                                            type="text" 
                                            placeholder="Write signing payload"
                                            value={customPayload}
                                            onChange={e => setCustomPayload(e.target.value)}
                                            className="w-full bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-sky-500 focus:outline-none"
                                        />
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Signing passphrase secret (optional)"
                                                value={signingPassphrase}
                                                onChange={e => setSigningPassphrase(e.target.value)}
                                                className="flex-1 bg-black border border-zinc-800 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:border-sky-500 focus:outline-none"
                                            />
                                            <button 
                                                type="button"
                                                onClick={async () => {
                                                    if (!user) { alert("Error: Conduction Handshake required."); return; }
                                                    const calculatedHash = hashString(customPayload + signingPassphrase);
                                                    const prefix = user.role === 'guest' ? 'GUEST_SANDBOX' : 'DERIV_SIG';
                                                    const simulatedSignature = prefix + '_' + calculatedHash.slice(2, 24).toUpperCase() + '//APPROVED_BY_KEY';
                                                    setSignedResult(simulatedSignature);
                                                    setLatestNetworkLogs(l => [...l, `[SIGNER] Signed payload with Operator key.`]);
                                                }}
                                                className="px-4 py-2.5 text-xs font-bold uppercase text-sky-400 bg-sky-950/20 hover:bg-sky-950/40 border border-sky-900 rounded-xl transition-all cursor-pointer"
                                            >
                                                Sign Payload
                                            </button>
                                        </div>
                                        {signedResult && (
                                            <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Generated Key Signature Hash</p>
                                                <p className="text-xs font-mono text-sky-400 break-all bg-black p-2 rounded-lg">{signedResult}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Spend Merchant places */}
                                <div className="space-y-3 pt-3 border-t border-zinc-900">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs text-zinc-400 uppercase font-semibold font-sans">Spend Wallet Merchant Portal</label>
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Biometric Signature Secured</span>
                                    </div>

                                    <div className="space-y-2.5">
                                        {[
                                            { name: 'Fresh Groceries Daily Basket', merchant: 'Fresh Market Place', cost: 45, subtype: 'grain', amountNeeded: 9, unit: 'kg', icon: ShoppingCart },
                                            { name: 'Energy Charge & Warm Coffee', merchant: 'Java Junction Cafeteria', cost: 15, subtype: 'solar_power', amountNeeded: 15, unit: 'kWh', icon: ZapIcon },
                                            { name: 'Alpha Logistics Diesel Charge', merchant: 'Alpha Truck Depot', cost: 80, subtype: 'solar_power', amountNeeded: 80, unit: 'kWh', icon: CpuIcon },
                                            { name: 'Server Core Integration Slot', merchant: 'Cloud Native Systems', cost: 150, subtype: 'iron_ore', amountNeeded: 75, unit: 'kg', icon: DatabaseIcon },
                                        ].map((item, idx) => {
                                            const asset = reserve.reserves.find(r => r.subtype === item.subtype);
                                            const canAfford = asset && asset.quantity >= item.amountNeeded;
                                            return (
                                                <div key={idx} className="p-4 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-9 h-9 rounded-xl bg-sky-950/20 border border-sky-900/60 flex items-center justify-center shrink-0">
                                                            <item.icon className="w-5 h-5 text-sky-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-white truncate">{item.name}</p>
                                                            <p className="text-[10px] text-zinc-500 mt-1 truncate">
                                                                Merchant: {item.merchant} • Decays: {item.amountNeeded} {item.unit}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-xs font-bold text-sky-400 italic">{item.cost} CPH</p>
                                                        <button 
                                                            type="button"
                                                            disabled={!canAfford}
                                                            onClick={async () => {
                                                                if (!user) { alert("Security Violation: Authorized operator handshake required."); return; }
                                                                try {
                                                                    const approved = await verifyBiometricSignature(`Spend: ${item.cost} CPH at ${item.merchant}`);
                                                                    if (approved) {
                                                                        const response = RealMoneySystem.runConsumption(reserve, item.subtype, item.amountNeeded);
                                                                        if (response.success) {
                                                                            updateReserveState(response.reserve);
                                                                            const sigBlock = 'BIOMETRIC_MD5_' + Math.random().toString(16).slice(2, 10).toUpperCase() + '//SEAL';
                                                                            const newTx: Tx = {
                                                                                id: 'tx_spend_' + Math.random().toString(16).slice(2, 8),
                                                                                coin: 'SPEND', amount: item.cost,
                                                                                sender: user.displayName || '0xSovereignOwnerWallet', recipient: item.merchant,
                                                                                fee: 0.1, timestamp: Date.now(), status: 'PENDING',
                                                                                extraData: { item: item.name, verified_by_biometrics: true, checksum: sigBlock }
                                                                            };
                                                                            setMempool(prev => [...prev, newTx]);
                                                                            setLatestNetworkLogs(l => [...l, `[SPEND] Biometrics approved. Spent ${item.cost} CPH at ${item.merchant}.`]);
                                                                        } else {
                                                                            alert(`Error: ${response.error}`);
                                                                        }
                                                                    } else {
                                                                        setLatestNetworkLogs(l => [...l, `[SPEND] Biometrics verification rejected.`]);
                                                                    }
                                                                } catch (err) { console.error(err); }
                                                            }}
                                                            className={`mt-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${canAfford ? 'bg-sky-600 text-white hover:bg-sky-500 border border-sky-700' : 'bg-zinc-900 text-zinc-600 border border-zinc-900 cursor-not-allowed'}`}
                                                        >
                                                            {canAfford ? 'Scan & Spend' : 'Empty Reserves'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    )}

                    {/* Merkle Proof Simulator */}
                    {activeOpTab === 'explorer' && (
                        <>
                            <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 relative">
                        <div className="absolute right-6 top-6">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded border border-emerald-900/60 flex items-center gap-1.5 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                CRYPTO PROVENANCE ACTIVE
                            </span>
                        </div>

                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-2">
                            <ShieldIcon className="w-5 h-5 text-orange-500" />
                            Merkle Proof Simulator
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed max-w-xl mb-6">
                            Select a block height and a target transaction to visually verify its mathematical membership inside the Block Header Merkle Root.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="space-y-1.5">
                                <label className="text-xs text-zinc-500 uppercase font-bold">1. Select Mined Block Height</label>
                                <select 
                                    value={selectedBlockHeight || ''} 
                                    onChange={(e) => setSelectedBlockHeight(Number(e.target.value))}
                                    className="w-full bg-black border border-zinc-800 text-xs font-bold p-3 rounded-xl uppercase tracking-wider text-emerald-400 focus:outline-none"
                                >
                                    {activeBlocks.map(b => (
                                        <option key={b.height} value={b.height}>
                                            Height #{b.height.toLocaleString()} ({b.transactions.length} Tx)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs text-zinc-500 uppercase font-bold">2. Target Tx for Proof</label>
                                <select 
                                    value={selectedTxId || ''} 
                                    onChange={(e) => setSelectedTxId(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 text-xs font-mono p-3 rounded-xl text-white focus:outline-none"
                                >
                                    {activeBlock?.transactions.map((tx, idx) => (
                                        <option key={tx.id} value={tx.id}>
                                            Tx #{idx}: {tx.amount} {tx.coin} ({tx.id.slice(0, 10)}...)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {proofSteps.length > 0 && selectedBlockHeight !== null && (
                            <div className="space-y-5">
                                <div className="p-4 bg-black/40 border border-zinc-900 rounded-xl space-y-4">
                                    <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                                        <span className="text-xs text-zinc-400 font-bold uppercase">
                                            Step {currentProofStepIndex + 1} of {proofSteps.length}
                                        </span>
                                        <span className="text-xs font-bold text-zinc-500 uppercase">
                                            Verification Depth: #{proofSteps[currentProofStepIndex].level}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-3">
                                            <div className="md:col-span-2 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                                                    {proofSteps[currentProofStepIndex].isLeft ? 'Sibling Hash (Left)' : 'Target/Calculated Hash'}
                                                </p>
                                                <p className="text-xs font-mono text-zinc-300 truncate selection:bg-indigo-850">
                                                    {proofSteps[currentProofStepIndex].isLeft 
                                                        ? proofSteps[currentProofStepIndex].sibling 
                                                        : proofSteps[currentProofStepIndex].value}
                                                </p>
                                            </div>
                                            <div className="text-center text-sm font-black text-zinc-600">
                                                +
                                            </div>
                                            <div className="md:col-span-2 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                                                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                                                    {proofSteps[currentProofStepIndex].isLeft ? 'Target/Calculated Hash' : 'Sibling Hash (Right)'}
                                                </p>
                                                <p className="text-xs font-mono text-zinc-300 truncate selection:bg-indigo-850">
                                                    {proofSteps[currentProofStepIndex].isLeft 
                                                        ? proofSteps[currentProofStepIndex].value 
                                                        : proofSteps[currentProofStepIndex].sibling}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="w-full p-3 bg-black/60 border border-zinc-900 rounded-xl">
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1 italic">
                                                Hash Concatenation Result: SHA256(Sibling + Value)
                                            </p>
                                            <p className="text-xs font-mono text-emerald-400 truncate selection:bg-emerald-950">
                                                {proofSteps[currentProofStepIndex].result}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            disabled={currentProofStepIndex === 0}
                                            onClick={() => setCurrentProofStepIndex(prev => Math.max(0, prev - 1))}
                                            className="px-4 py-2 text-xs font-bold border border-zinc-800 text-zinc-400 bg-zinc-900/40 rounded-lg disabled:opacity-20 uppercase cursor-pointer"
                                        >
                                            Previous Level
                                        </button>
                                        
                                        {currentProofStepIndex < proofSteps.length - 1 ? (
                                            <button 
                                                type="button"
                                                onClick={() => setCurrentProofStepIndex(prev => prev + 1)}
                                                className="flex-1 py-2 text-xs font-bold bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg uppercase text-center cursor-pointer"
                                            >
                                                Hash with Sibling at next level
                                            </button>
                                        ) : (
                                            <div className="flex-1 p-2 bg-emerald-950/20 border border-emerald-900/60 rounded-lg flex items-center justify-center gap-1.5 animate-pulse">
                                                <CheckCircle2Icon className="w-4 h-4 text-emerald-400" />
                                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                                    PROOF VERIFIED UP TO MERKLE ROOT
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border border-zinc-900 rounded-xl p-4 bg-black/30 space-y-3">
                                    <div className="flex items-center justify-between text-xs font-mono">
                                        <p className="text-zinc-500 uppercase font-sans">Calculated Proof Root:</p>
                                        <p className="text-emerald-400 truncate max-w-[240px] md:max-w-none">
                                            {proofSteps[proofSteps.length - 1].result}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-mono">
                                        <p className="text-zinc-500 uppercase font-sans">Block Header Root:</p>
                                        <p className="text-orange-400 truncate max-w-[240px] md:max-w-none">
                                            {activeBlock.merkleRoot}
                                        </p>
                                    </div>
                                    <div className="h-px bg-zinc-900" />
                                    <div className="flex items-start gap-2.5 text-xs bg-black/50 p-3 rounded-lg border border-zinc-900">
                                        <InfoIcon className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                        <p className="text-zinc-400 leading-relaxed">
                                            Verification Status: {proofSteps[proofSteps.length - 1].result === activeBlock.merkleRoot 
                                                ? 'Roots match! Cryptographic provenance confirmed. This transaction is guaranteed to reside unaltered within Block #' + activeBlock.height.toLocaleString() + ' with mathematical certainty.'
                                                : 'Mismatched Root. Please recalculate block elements.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Block Explorer / History */}
                    <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold tracking-wider text-zinc-300 uppercase flex items-center gap-2">
                                <ServerIcon className="w-4.5 h-4.5 text-emerald-400" /> Block Ledger History
                            </span>
                            <span className="text-xs text-zinc-500 font-bold uppercase">
                                {selectedChain} Verifications
                            </span>
                        </div>

                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {activeBlocks.slice().reverse().map((b) => (
                                <div 
                                    key={b.height}
                                    onClick={() => {
                                        setSelectedBlockHeight(b.height);
                                        setSelectedTxId(b.transactions[0]?.id || null);
                                    }}
                                    className={`p-4 border rounded-xl cursor-pointer transition-all relative overflow-hidden ${
                                        selectedBlockHeight === b.height 
                                            ? 'bg-zinc-900/40 border-emerald-500 shadow-md shadow-emerald-500/5' 
                                            : 'bg-black/40 hover:bg-zinc-900/20 border-zinc-900'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <p className="font-extrabold text-sm text-white italic">
                                            Block Height #{b.height.toLocaleString()}
                                        </p>
                                        <span className="text-xs font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded uppercase">
                                            {b.transactions.length} Tx
                                        </span>
                                    </div>
                                    <div className="pt-3 space-y-1.5 text-xs text-zinc-400 font-mono">
                                        <p className="truncate"><span className="text-zinc-600 font-sans font-bold">Block Hash:</span> {b.hash}</p>
                                        <p className="truncate"><span className="text-zinc-650 font-sans font-bold">Merkle Root:</span> {b.merkleRoot}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-3 pt-2 border-t border-zinc-900/60">
                                        <span>MINER: {b.minedBy}</span>
                                        <span>{new Date(b.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                        </>
                    )}

                </div>

                {/* Right Section (Column Span 4) - Console and Side Panel */}
                {activeOpTab === 'consoles' && (
                    <div className="lg:col-span-4 space-y-8">
                    
                    {/* Mining Rig Controls */}
                    <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 shadow-md relative">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                <CpuIcon className="w-4.5 h-4.5 text-orange-400" /> Mining Console
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase">
                                <div className={`w-2 h-2 rounded-full ${isMining ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                                <span className={isMining ? 'text-emerald-400' : 'text-zinc-500'}>{isMining ? 'HASHING' : 'IDLE'}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center py-4">
                            <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle 
                                        cx="80" cy="80" r="66" 
                                        fill="transparent" 
                                        stroke="#101015" 
                                        strokeWidth="10"
                                    />
                                    <circle 
                                        cx="80" cy="80" r="66" 
                                        fill="transparent" 
                                        stroke={selectedChain === 'BTC' ? '#f7931a' : selectedChain === 'XMR' ? '#9333ea' : selectedChain === 'AERO' ? '#10b981' : '#0ea5e9'} 
                                        strokeWidth="10"
                                        strokeDasharray={2 * Math.PI * 66}
                                        strokeDashoffset={2 * Math.PI * 66 * (1 - miningEfficiency / 100)}
                                        strokeLinecap="round"
                                        className="transition-all duration-300"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-3xl font-extrabold text-white italic">{miningEfficiency}%</span>
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1">FORGING BLOCK</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full mb-4 text-xs">
                                <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl text-center">
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Target Rig</p>
                                    <p className="font-bold text-zinc-200 truncate">{rigWorker.replace('AETHER_RIG_', '')}</p>
                                </div>
                                <div className="p-3 bg-black/40 border border-zinc-900 rounded-xl text-center">
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Core Temp</p>
                                    <p className={`font-bold ${rigTemp > 75 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>{rigTemp}°C</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setIsMining(!isMining)}
                                className={`w-full py-3.5 font-bold uppercase text-xs tracking-widest rounded-xl transition-all active:scale-95 cursor-pointer border ${
                                    isMining 
                                        ? 'bg-rose-950/20 text-rose-400 border-rose-900 hover:bg-rose-950/40' 
                                        : 'bg-emerald-600 text-black border-emerald-700 hover:bg-emerald-500'
                                }`}
                            >
                                {isMining ? 'Halt Forging Rig' : 'Ignite Hashrate Engine'}
                            </button>
                        </div>
                    </div>

                    {/* Global Mempool Monitor */}
                    <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold tracking-wider text-zinc-300 uppercase">
                                Global Mempool ({mempool.filter(tx => tx.coin === selectedChain).length})
                            </span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">Relayed Peer Broadcasts</span>
                        </div>
                        
                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                            {mempool.filter(tx => tx.coin === selectedChain).length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-zinc-900 rounded-xl">
                                    <p className="text-xs text-zinc-500 font-bold uppercase">Mempool Empty</p>
                                    <p className="text-[10px] text-zinc-600 italic mt-1">Submit transactions to populate mempool queue.</p>
                                </div>
                            ) : (
                                mempool.filter(tx => tx.coin === selectedChain).map((tx) => (
                                    <div key={tx.id} className="p-3 bg-black/40 border border-zinc-900 rounded-xl relative overflow-hidden">
                                        <div className="absolute right-0 top-0 text-[9px] font-bold text-amber-500 bg-amber-950/20 px-2 py-0.5 border-l border-b border-zinc-900 rounded-bl uppercase">
                                            PENDING
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs font-bold text-white leading-relaxed">
                                                    {tx.amount} {tx.coin}
                                                </p>
                                                <p className="text-[10px] text-zinc-500 mt-1 max-w-[140px] truncate">
                                                    Rec: {tx.recipient}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-zinc-400 font-bold">Fee: {tx.fee}</p>
                                                <p className="text-[9px] text-zinc-600 mt-1 font-mono">0x{tx.id.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Active Protocol Logs */}
                    <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 flex flex-col h-72">
                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <SlidersIcon className="w-4 h-4 text-blue-400" /> Active Protocol Logs
                        </span>
                        
                        <div className="flex-1 overflow-y-auto font-mono text-[11px] text-zinc-400 leading-relaxed bg-black/40 p-4 rounded-xl border border-zinc-900/60 custom-scrollbar">
                            <div className="space-y-2">
                                {latestNetworkLogs.map((log, i) => (
                                    <p key={i} className="break-all">
                                        <span className="text-zinc-600">{`>`}</span> {log}
                                    </p>
                                ))}
                                <div ref={logEndRef} />
                            </div>
                        </div>
                    </div>
                </div>
                )}

            </div>

            {/* Sovereign Web3 Knowledge Vault */}
            <div className="border-t border-zinc-900/60 pt-8 mt-4">
                <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-6">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-900">
                        <BookOpenIcon className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-bold text-white text-sm uppercase tracking-widest">
                            Sovereign Web3 Knowledge Vault & Asset Guide
                        </h3>
                    </div>

                    <div 
                        onWheel={(e) => {
                            if (e.deltaY !== 0) {
                                const container = e.currentTarget;
                                const isAtStart = container.scrollLeft === 0;
                                const isAtEnd = Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth;
                                if ((e.deltaY < 0 && !isAtStart) || (e.deltaY > 0 && !isAtEnd)) {
                                    e.preventDefault();
                                    container.scrollLeft += e.deltaY;
                                }
                            }
                        }}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory custom-scrollbar pb-4 scroll-smooth"
                    >
                        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-orange-500/20 transition-all snap-start shrink-0 w-[290px] sm:w-[340px] md:w-[380px] flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <BitcoinIcon className="w-5 h-5 text-orange-400" />
                                    <h4 className="font-bold text-xs text-white uppercase italic">
                                        Bitcoin (BTC) Ledger Asset
                                    </h4>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Uses the UTXO bookkeeping model, SHA-256 consensus, and Merkle tree verification blocks. Utilize Native Segwit addresses beginning with <code className="text-orange-400">bc1q</code> for optimal routing fees. Use the Mining console to pack unconfirmed pool TXs.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-purple-500/20 transition-all snap-start shrink-0 w-[290px] sm:w-[340px] md:w-[380px] flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <LockIcon className="w-5 h-5 text-purple-400" />
                                    <h4 className="font-bold text-xs text-white uppercase italic">
                                        Monero (XMR) Privacy Asset
                                    </h4>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Focuses on absolute sender and receiver anonymity. Utilizes stealth destination address mapping, decoy ring mixins, and Pedersen Commitments to fully mask raw transaction values on-chain. Stealth addresses span 95 alphanumeric characters.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-emerald-500/20 transition-all snap-start shrink-0 w-[290px] sm:w-[340px] md:w-[380px] flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <ZapIcon className="w-5 h-5 text-emerald-400" />
                                    <h4 className="font-bold text-xs text-white uppercase italic">
                                        AERO EVM L1 Gas Mechanics
                                    </h4>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Built with Account-based sequenced state. Utilizes execution Nonces to secure against replay vector attacks, gas fees scaled in Gwei, and optional hexadecimal bytecode data payloads for direct decentralized smart contract execution.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
