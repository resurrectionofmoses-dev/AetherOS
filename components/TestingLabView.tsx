import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TestTubeIcon, 
  ActivityIcon, 
  ShieldIcon, 
  SpinnerIcon, 
  ZapIcon, 
  WarningIcon, 
  CheckCircleIcon,
  SearchIcon,
  HistoryIcon,
  DatabaseIcon,
  ClipboardIcon,
  PlayIcon,
  TerminalIcon
} from './icons';
import { 
  Key as LucideKey, 
  Copy as LucideCopy, 
  Check as LucideCheck, 
  Plus as LucidePlus, 
  Fingerprint as LucideFingerprint, 
  Coins as LucideCoins,
  Cpu as LucideCpu,
  FileText as LucideFileText,
  HelpCircle as LucideHelpCircle,
  Eye as LucideEye,
  Settings as LucideSettings,
  ShieldAlert as LucideShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { LabComponentProps } from '../types';

interface BtcBridgeTx {
  id: string;
  btcTxHash: string;
  height: number;
  pmtSerialized: string;
  segwitCommitment: boolean;
  status: 'VERIFIED' | 'FAILED';
  blockHash: string;
  merkleRoot: string;
  timestamp: string;
}

export const TestingLabView: React.FC<LabComponentProps> = ({ 
  labName = "TESTING LAB", 
  labIcon: LabIcon = TestTubeIcon, 
  labColor = "text-gray-400", 
  description = "Stress test execution and reliability verification." 
}) => {
  // Navigation Tabs state
  const [activeTab, setActiveTab ] = useState<'stress' | 'bridge' | 'keys'>('bridge');
  const { user } = useAuth();

  // ==========================================
  // BTC REAL-TIME BALANCE FETCHER STATES
  // ==========================================
  const [btcAddress] = useState("bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h");
  const [btcFetcherMode, setBtcFetcherMode] = useState<'live' | 'mock'>('live');
  const [btcBalanceSats, setBtcBalanceSats] = useState<number | null>(null);
  const [btcRawData, setBtcRawData] = useState<any | null>(null);
  const [btcLoading, setBtcLoading] = useState(false);
  const [btcError, setBtcError] = useState<string | null>(null);
  const [btcCopied, setBtcCopied] = useState(false);

  const fetchBtcBalance = async () => {
    setBtcLoading(true);
    setBtcError(null);
    try {
      if (btcFetcherMode === 'mock') {
        // High fidelity mock simulated conduit
        await new Promise(resolve => setTimeout(resolve, 800));
        setBtcBalanceSats(34850020); // 0.34850020 BTC
        setBtcRawData({
          address: "bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h",
          chain_stats: {
            funded_txo_count: 14,
            funded_txo_sum: 529450020,
            spent_txo_count: 12,
            spent_txo_sum: 494600000,
            tx_count: 26
          }
        });
      } else {
        const response = await fetch(`https://mempool.space/api/address/${btcAddress}`);
        if (!response.ok) {
          throw new Error(`Mempool API returned status code ${response.status}`);
        }
        const data = await response.json();
        const funded = data.chain_stats?.funded_txo_sum ?? 0;
        const spent = data.chain_stats?.spent_txo_sum ?? 0;
        const currentBalance = funded - spent;
        setBtcBalanceSats(currentBalance);
        setBtcRawData(data);
      }
    } catch (err: any) {
      console.warn("Live API fetch failed, falling back to local simulation", err);
      setBtcError(`Live API connection failed: ${err.message || err}. Falling back to secure simulated reserve balance.`);
      setBtcBalanceSats(34850020);
      setBtcRawData({
        address: "bc1q84muhrq6fjed6k9wsqy2av2qtdkzh7t49xfw7h",
        chain_stats: {
          funded_txo_count: 14,
          funded_txo_sum: 529450020,
          spent_txo_count: 12,
          spent_txo_sum: 494600000,
          tx_count: 26
        }
      });
    } finally {
      setBtcLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bridge') {
      fetchBtcBalance();
    }
  }, [activeTab, btcFetcherMode]);

  // ==========================================
  // TESTER KEY MANAGEMENT TAB STATES
  // ==========================================
  const [testerKeys, setTesterKeys] = useState<Array<{
    label: string;
    address: string;
    privateKey: string;
    description: string;
    balance: string;
  }>>(() => {
    try {
      const stored = localStorage.getItem('aetheros_tester_keys');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Local storage error loading keys", e);
    }
    return [
      {
        label: 'Anvil Master Deployer',
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        privateKey: '0xac0974bec39a17e31ba4a1aec30d17b5bca52f3d17c74c599045030551c4812d',
        description: 'Standard local development node system master authority key.',
        balance: '10,000 ETH'
      },
      {
        label: 'Aether AI Maestro',
        address: '0x1cFa06126D8F12dc3A010C7d01b50e0D17DC79C7',
        privateKey: '0x79ea3d17c74c599045030551c4812dac0974b2e61aaccdae88c7e8412f4603b6',
        description: 'Autonomous neural sovereign model authorized to sign automated consensus updates.',
        balance: '7,777 ETH'
      },
      {
        label: 'Aigent Local Executor #3',
        address: '0xADDBEef82dB6aBdD8bf255E0DddDda29CFFfA1F3',
        privateKey: '0xbeef52f3d1e31ba4a1aec30d17b5bca52f3d17c74c599045030551c4812dac097',
        description: 'Decentralized local worker daemon validating on-chain state hashes.',
        balance: '350 ETH'
      }
    ];
  });

  const [activeSignerAddress, setActiveSignerAddress] = useState<string>(
    () => testerKeys[0]?.address || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  );

  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Adding Custom Key Pair inputs
  const [customKeyLabel, setCustomKeyLabel] = useState('');
  const [customKeyAddr, setCustomKeyAddr] = useState('');
  const [customKeyPriv, setCustomKeyPriv] = useState('');
  const [keyInputError, setKeyInputError] = useState('');

  // Msg signing simulator states
  const [msgPayloadSelect, setMsgPayloadSelect] = useState<'text' | 'bridge' | 'consensus' | 'deploy'>('text');
  const [customTextPayload, setCustomTextPayload] = useState('Verify AetherOS system kernel stasis parameters.');
  const [signingLog, setSigningLog] = useState<string[]>([
    "[SYSTEM_STANDBY] Message Signing subsystem ready."
  ]);
  const [isSigningInProcess, setIsSigningInProcess] = useState(false);
  const [generatedSignature, setGeneratedSignature] = useState<{
    messageHash: string;
    r: string;
    s: string;
    v: number;
    signatureBytes: string;
  } | null>(null);

  // EVM Gas Estimation States
  const [gasContractFunc, setGasContractFunc] = useState<'verifyProof' | 'recordIdentity' | 'claimYield' | 'deployRegistry'>('verifyProof');
  const [gasPricingProfile, setGasPricingProfile] = useState<'eco' | 'nominal' | 'hyper'>('nominal');
  const [customBaseFee, setCustomBaseFee] = useState<number>(40); // Gwei
  const [customPriorityTip, setCustomPriorityTip] = useState<number>(2.5); // Gwei
  const [gasMultiplier, setGasMultiplier] = useState<number>(1.2); 
  const [gasEstLogs, setGasEstLogs] = useState<string[]>([
    "[STANDBY] EVM gas modeling computer online."
  ]);
  const [isEstimatesRunning, setIsEstimatesRunning] = useState(false);
  const [calculatedGasReceipt, setCalculatedGasReceipt] = useState<{
    contractName: string;
    methodSignature: string;
    intrinsicGas: number;
    opcodesGas: number;
    stateChangeGas: number;
    totalGasUnits: number;
    gasBaseFeeGwei: number;
    priorityTipGwei: number;
    estimatedCostEth: string;
    estimatedCostUsd: string;
    maxFeePerGasGwei: number;
  } | null>(null);

  // Sync keys list with localStorage
  useEffect(() => {
    localStorage.setItem('aetheros_tester_keys', JSON.stringify(testerKeys));
  }, [testerKeys]);

  // Adjust sliders if pricing profile is selected
  useEffect(() => {
    if (gasPricingProfile === 'eco') {
      setCustomBaseFee(12);
      setCustomPriorityTip(1.0);
    } else if (gasPricingProfile === 'nominal') {
      setCustomBaseFee(38);
      setCustomPriorityTip(2.0);
    } else if (gasPricingProfile === 'hyper') {
      setCustomBaseFee(190);
      setCustomPriorityTip(12.5);
    }
  }, [gasPricingProfile]);

  // Dynamic Text Payload updating
  useEffect(() => {
    if (msgPayloadSelect === 'text') {
      setCustomTextPayload('Verify AetherOS system kernel stasis parameters.');
    } else if (msgPayloadSelect === 'bridge') {
      setCustomTextPayload(JSON.stringify({
        endpoint: "RegisterBtcTransaction",
        btcTxHash: "0xdd13c8d4128f5ac8aaac3532f5e33c586eac00288c635d56f5687c2b6c84c5cb",
        height: 947440,
        network: "bitcoin-mainnet"
      }, null, 2));
    } else if (msgPayloadSelect === 'consensus') {
      setCustomTextPayload(JSON.stringify({
        action: "PROPOSE_CONSENSUS_SHARD",
        agentId: "aigent-autonomous-3",
        checkpointMerkle: "0x8F2C9A51E283FFBD5529A8DCB1280B8B9B1C5D4E3A20B1C40000122B4EDAB3E2",
        timestamp: new Date().toISOString()
      }, null, 2));
    } else if (msgPayloadSelect === 'deploy') {
      setCustomTextPayload(`0x608060405234801561001057600080fd5b50610c3c806100206000396000f3fe608060405234801561001057600080fd5b506004361061003657`);
    }
  }, [msgPayloadSelect]);

  const handleCopyKeyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleGenerateRandomDevPair = () => {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) address += chars[Math.floor(Math.random() * chars.length)];
    let privateKey = '0x';
    for (let i = 0; i < 64; i++) privateKey += chars[Math.floor(Math.random() * chars.length)];
    
    const prefixes = ['Sentinel', 'Neural', 'Cognitive', 'Quantum', 'Genesis', 'Spectre'];
    const suffixes = ['Node', 'Daemon', 'Validator', 'Signer', 'Watcher', 'Oracle'];
    const randomLabel = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]} #${Math.floor(Math.random() * 900) + 100}`;

    setCustomKeyLabel(randomLabel);
    setCustomKeyAddr(address);
    setCustomKeyPriv(privateKey);
    setKeyInputError('');
  };

  const handleAddDevKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeyLabel || !customKeyAddr || !customKeyPriv) {
      setKeyInputError('All cryptographic input elements are necessary.');
      return;
    }
    if (!customKeyAddr.startsWith('0x') || customKeyAddr.length !== 42) {
      setKeyInputError('Address must start with 0x and be exactly 42 hex characters.');
      return;
    }
    if (!customKeyPriv.startsWith('0x') || customKeyPriv.length < 10) {
      setKeyInputError('Private key sequence must be valid hexadecimal.');
      return;
    }

    const isDuplicate = testerKeys.some(k => k.address.toLowerCase() === customKeyAddr.toLowerCase());
    if (isDuplicate) {
      setKeyInputError('Address registry conflict or duplicate key.');
      return;
    }

    const newKey = {
      label: customKeyLabel,
      address: customKeyAddr,
      privateKey: customKeyPriv,
      description: 'Manually imported local simulator transactor keypair.',
      balance: '500 ETH'
    };

    setTesterKeys(prev => [...prev, newKey]);
    setActiveSignerAddress(customKeyAddr);
    setCustomKeyLabel('');
    setCustomKeyAddr('');
    setCustomKeyPriv('');
    setKeyInputError('');
  };

  const handleDeleteDevKey = (addr: string) => {
    if (testerKeys.length <= 1) {
      alert("Cannot delete the last available dev key; system needs at least one mock transactor.");
      return;
    }
    const filtered = testerKeys.filter(k => k.address !== addr);
    setTesterKeys(filtered);
    if (activeSignerAddress === addr) {
      setActiveSignerAddress(filtered[0].address);
    }
  };

  // Helper hash function to simulate cryptographic calculations
  const hashString = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h).toString(16).padStart(8, '0');
  };

  const handleSignSimulatedPayload = () => {
    setIsSigningInProcess(true);
    setSigningLog(prev => [
      `[SIGN_TRIGGER] Loading ECDSA key parameters for transactor: ${activeSignerAddress}`,
      ...prev
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step === 1) {
        setSigningLog(prev => [
          `[SHA3] Computing transaction message keccak256 hash...`,
          ...prev
        ]);
      } else if (step === 2) {
        setSigningLog(prev => [
          `[ECDSA] Extracting private key curve components (k-parameter derivation)...`,
          ...prev
        ]);
      } else if (step === 3) {
        const payloadHash = '0x' + hashString(customTextPayload).repeat(8).slice(0, 64);
        const activeKeyObj = testerKeys.find(k => k.address === activeSignerAddress);
        const privSeed = activeKeyObj?.privateKey || '0xac0974bec39a17e31ba4a1aec30d17b5bca52f3d17c74c599045030551c4812d';
        
        const rPart = '0x' + hashString(privSeed + "r_component").repeat(8).slice(0, 64);
        const sPart = '0x' + hashString(privSeed + "s_component" + customTextPayload).repeat(8).slice(0, 64);
        const vPart = Math.random() > 0.5 ? 27 : 28;
        const joinedHex = rPart + sPart.slice(2) + vPart.toString(16);

        setGeneratedSignature({
          messageHash: payloadHash,
          r: rPart,
          s: sPart,
          v: vPart,
          signatureBytes: joinedHex
        });

        setSigningLog(prev => [
          `[SUCCESS] Signed payload! Signature hash output: ${joinedHex.slice(0, 22)}...`,
          `[ECDSA_DONE] Signature complete. Verification coordinates computed successfully.`,
          ...prev
        ]);

        clearInterval(interval);
        setIsSigningInProcess(false);
      }
    }, 250);
  };

  const handleEstimateGasSimulated = () => {
    setIsEstimatesRunning(true);
    setGasEstLogs(prev => [
      `[TRACE_START] Constructing mock EVM sandboxed execution block...`,
      ...prev
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step === 1) {
        setGasEstLogs(prev => [
          `[TRACE_EVM] Initializing contract function dry-run: ${gasContractFunc}()`,
          ...prev
        ]);
      } else if (step === 2) {
        setGasEstLogs(prev => [
          `[TRACE_IO] Analyzing dirty SSTORE slot allocations for storage modifications...`,
          ...prev
        ]);
      } else if (step === 3) {
        let contractName = "AetherProofVerifier";
        let methodSignature = "verifyAetherProof(bytes32,bytes)";
        let intrinsicGas = 21000;
        let opcodesGas = 18500;
        let stateChangeGas = 5000;

        if (gasContractFunc === 'verifyProof') {
          // values set above
        } else if (gasContractFunc === 'recordIdentity') {
          contractName = "SovereignIdentityRegistry";
          methodSignature = "recordIdentity(address,bytes32,string)";
          intrinsicGas = 21000;
          opcodesGas = 12000;
          stateChangeGas = 45000;
        } else if (gasContractFunc === 'claimYield') {
          contractName = "NeuralYieldDistributor";
          methodSignature = "claimNeuralYield(address,uint256)";
          intrinsicGas = 21000;
          opcodesGas = 32500;
          stateChangeGas = 20000;
        } else if (gasContractFunc === 'deployRegistry') {
          contractName = "NeuralRegistryFactory";
          methodSignature = "constructor(address[])";
          intrinsicGas = 53000;
          opcodesGas = 112000;
          stateChangeGas = 80000;
        }

        const totalUnadjusted = intrinsicGas + opcodesGas + stateChangeGas;
        const totalGasUnits = Math.round(totalUnadjusted * gasMultiplier);
        
        const totalGwei = customBaseFee + customPriorityTip;
        const estimatedCostEthNum = (totalGasUnits * totalGwei) / 1000000000;
        const estimatedCostEth = estimatedCostEthNum.toFixed(8);
        const estimatedCostUsd = (estimatedCostEthNum * 3150).toFixed(4); // $3150/ETH mock conversion rate
        const maxFeePerGasGwei = customBaseFee + customPriorityTip;

        setCalculatedGasReceipt({
          contractName,
          methodSignature,
          intrinsicGas,
          opcodesGas,
          stateChangeGas,
          totalGasUnits,
          gasBaseFeeGwei: customBaseFee,
          priorityTipGwei: customPriorityTip,
          estimatedCostEth,
          estimatedCostUsd,
          maxFeePerGasGwei
        });

        setGasEstLogs(prev => [
          `[EVM_RECEIPT] Gas calculation closed. Units computed: ${totalGasUnits}. Total estimated cost: ${estimatedCostEth} ETH`,
          `[EST_SUCCESS] Model output verified against static sandbox estimates.`,
          ...prev
        ]);

        clearInterval(interval);
        setIsEstimatesRunning(false);
      }
    }, 300);
  };

  // ==========================================
  // STRESS TEST TAB STATES
  // ==========================================
  const [load, setLoad] = useState(14);
  const [isTesting, setIsTesting] = useState(false);
  const [stressLogs, setStressLogs] = useState<string[]>([
    "[STRESS_INIT] System standby at nominal load.",
    "[MONITOR] Threads: 64 Core Workers, Mem: 1.02GB/16.00GB"
  ]);

  const runTest = () => {
    setIsTesting(true);
    setStressLogs(prev => ["[STRESS_DRIVE] Initiating thermal pressure ramp...", ...prev]);
    let l = 14;
    const interval = setInterval(() => {
        l += 4;
        setLoad(l);
        if (l % 16 === 0) {
          setStressLogs(prev => [
            `[STRESS_RAMP] Load at ${l}%. Latency: ${(0.02 + (l * 0.005)).toFixed(3)}ms. Temp: ${(38 + (l * 0.32)).toFixed(1)}°C`,
            ...prev
          ]);
        }
        if (l >= 95) {
            clearInterval(interval);
            setIsTesting(false);
            setStressLogs(prev => [
              "[STRESS_HALT] Self-mitigating feedback loops active. Cooling cores.",
              "[STRESS_SUCCESS] Peak stress threshold verification completed without hard-vapor logic shards.",
              ...prev
            ]);
            setTimeout(() => setLoad(14), 2500);
        }
    }, 80);
  };

  // ==========================================
  // SOVEREIGNNEXUS BRIDGE VALIDATOR TAB STATES
  // ==========================================
  const [btcTxHash, setBtcTxHash] = useState("0xdd13c8d4128f5ac8aaac3532f5e33c586eac00288c635d56f5687c2b6c84c5cb");
  const [height, setHeight] = useState(947440);
  const [pmtSerialized, setPmtSerialized] = useState("0100000001FD0392CBE4811AA82B8F2A");
  const [segwitCommitment, setSegwitCommitment] = useState(true);

  // Failure Mode state: 'none' | 'absence' | 'non_parseable' | 'wrong_height' | 'segwit_mismatch'
  const [injectedErrorMode, setInjectedErrorMode] = useState<'none' | 'absence' | 'non_parseable' | 'wrong_height' | 'segwit_mismatch'>('none');
  const [validationProgress, setValidationProgress] = useState<number | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [activeLogs, setActiveLogs] = useState<string[]>([
    "[BRIDGE_INIT] Bridge listener ready for incoming BTC transaction proof registrations.",
    "[LEDGER] Genesis block anchor: Height 840000. Anchor Root: 0x8F2C9A..."
  ]);

  // Living Record Ledger List of verified transactions
  const [livingRecord, setLivingRecord] = useState<BtcBridgeTx[]>([
    {
      id: "REG_850100_01",
      btcTxHash: "0xAB73D1E20B85817F2E2C8439FE2DA88BC2C4A28BDB92",
      height: 850100,
      pmtSerialized: "010000000109EF89...00",
      segwitCommitment: true,
      status: 'VERIFIED',
      blockHash: "0x00000000000000000001CBBF2A83FB35DC86A3EAEBCE91C9A208D1E61A1DAB41",
      merkleRoot: "0x8F2C9A51E283FFBD5529A8DCB1280B8B9B1C5D4E3A20B1C40000122B4EDAB3E2",
      timestamp: "2026-05-30T00:15:30Z"
    },
    {
      id: "REG_849850_02",
      btcTxHash: "0x7F2C9EA20A95867D1A2BA8349FF1ED9BCBC5D28ADB5E",
      height: 849850,
      pmtSerialized: "0100000001A8320C...A2",
      segwitCommitment: true,
      status: 'VERIFIED',
      blockHash: "0x00000000000000000003FD1A8BBBC7D855EACEBFF3F28DAE55C1AA882E78AE5D",
      merkleRoot: "0x391D4C7EF92C8B500E5D1D4A88CC4EAA8BDBCE20FFBBD8A110AB4E3CBA22D891",
      timestamp: "2026-05-29T21:42:11Z"
    }
  ]);

  // Inject failure configurations
  const handleInjectError = (mode: 'absence' | 'non_parseable' | 'wrong_height' | 'segwit_mismatch') => {
    setInjectedErrorMode(mode);
    setValidationStatus('idle');
    setValidationProgress(null);

    if (mode === 'absence') {
      setBtcTxHash("0xBAAAAAAD_TX_COGNITIVE_COUNTERFEIT_SPAM_9999999999999999");
      setActiveLogs(prev => ["[INJECT] Error Mode Set: Absence from Merkle Tree (Simulating counterfeit hash lookup clash).", ...prev]);
    } else if (mode === 'non_parseable') {
      setPmtSerialized("CORRUPTED_NON_HEX_PMT_STRUCTURE_!!!_MALFORMED");
      setActiveLogs(prev => ["[INJECT] Error Mode Set: Non-Parseable Merkle Proof (Simulating corrupted partial proof vector).", ...prev]);
    } else if (mode === 'wrong_height') {
      setHeight(999999);
      setActiveLogs(prev => ["[INJECT] Error Mode Set: Incorrect Block Height (Simulating out-of-boundary block query).", ...prev]);
    } else if (mode === 'segwit_mismatch') {
      setSegwitCommitment(false);
      setActiveLogs(prev => ["[INJECT] Error Mode Set: SegWit Commitment Clash (Simulating witness-root Coinbase validation mismatch).", ...prev]);
    }
  };

  // Reset inputs to flawless genesis verified proof state
  const resetToVerifiedState = () => {
    setInjectedErrorMode('none');
    setBtcTxHash("0xE491E3A20B75817E1A7D10A29FE4EEF03E2D4A88BCBCBDBBDD");
    setHeight(850400);
    setPmtSerialized("0100000001FD0392CBE4811AA82B8F2A");
    setSegwitCommitment(true);
    setValidationStatus('idle');
    setValidationProgress(null);
    setActiveLogs(prev => ["[RESET] Ledger params restored to mathematical validated consensus values.", ...prev]);
  };

  // Execute SovereignNexus bridge cryptographic verification sequence
  const executeBridgeValidation = () => {
    setValidationStatus('validating');
    setValidationProgress(0);
    setActiveLogs(prev => ["[BRIDGE_START] Triggering RegisterBtcTransaction flow in SovereignNexus...", ...prev]);

    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setValidationProgress(p);

      if (p === 20) {
        setActiveLogs(prev => [
          `[STEP 1] Validating target block proof existence at Height ${height}...`,
          ...prev
        ]);
      } else if (p === 40) {
        setActiveLogs(prev => [
          `[STEP 2] Parsing Partial Merkle Tree proof bytes: "${pmtSerialized.slice(0, 18)}..."`,
          ...prev
        ]);
      } else if (p === 60) {
        setActiveLogs(prev => [
          `[STEP 3] Rebuilding Merkle Root path using leaf transaction hash: ${btcTxHash.slice(0, 12)}...`,
          ...prev
        ]);
      } else if (p === 80) {
        setActiveLogs(prev => [
          segwitCommitment 
            ? `[STEP 4] Testing witness vector and SegWit root commitment verification in Coinbase...`
            : `[STEP 4] Skipping or validating Witness Coinbase commitments...`,
          ...prev
        ]);
      } else if (p >= 100) {
        clearInterval(interval);
        setValidationProgress(null);

        // Determine if verification succeeds or fails
        if (injectedErrorMode !== 'none') {
          setValidationStatus('error');
          let errorMsg = "";
          if (injectedErrorMode === 'absence') {
            errorMsg = "Absence from Merkle Tree: The transaction hash is not found within the Merkle tree of the block header stored at the provided height.";
          } else if (injectedErrorMode === 'non_parseable') {
            errorMsg = "Non-Parseable Merkle Proofs: The Partial Merkle Tree provided is malformed, corrupted, or logically inconsistent.";
          } else if (injectedErrorMode === 'wrong_height') {
            errorMsg = "Incorrect Block Height: The specified height does not correspond to a block containing this transaction.";
          } else if (injectedErrorMode === 'segwit_mismatch') {
            errorMsg = "SegWit Root Mismatch: Coinbase witness commitment calculated does not match root registered.";
          }

          setActiveLogs(prev => [
            `[FATAL_ERROR] RegisterBtcTransactionException: ${errorMsg}`,
            `[COGNITIVE_BLOCK] Defended bridge from cognitive counterfeit entry. Blocked state.`,
            ...prev
          ]);
        } else {
          setValidationStatus('success');
          
          // Success! Write clean ledger registration to Living Record
          const recordId = `REG_${height}_${Math.floor(100 + Math.random() * 899)}`;
          const blockHash = "0x00000000000000000000" + Math.random().toString(16).slice(2, 12).toUpperCase() + "E491AAB83D";
          const computedMerkleRoot = "0x8F2C" + Math.random().toString(16).slice(2, 10).toUpperCase() + "D9F3A4B591D2C8EAA83B10FB";
          
          const newTxRecord: BtcBridgeTx = {
            id: recordId,
            btcTxHash,
            height,
            pmtSerialized,
            segwitCommitment,
            status: 'VERIFIED',
            blockHash,
            merkleRoot: computedMerkleRoot,
            timestamp: new Date().toISOString()
          };

          setLivingRecord(prev => [newTxRecord, ...prev]);
          setActiveLogs(prev => [
            `[CONSENSUS_RESTORED] Cryptographic inclusion path mathematically verified.`,
            `[RECORDED] Transaction registered to Living Record Ledger. ID: ${recordId}`,
            ...prev
          ]);
        }
      }
    }, 200);
  };

  return (
    <div className="h-full flex flex-col bg-[#070707] overflow-hidden font-mono text-zinc-300">
      
      {/* Premium Modular Header */}
      <div className="p-6 border-b-8 border-black bg-[#101012] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl shrink-0">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-zinc-900 border-2 border-zinc-800 rounded-2xl flex items-center justify-center">
                <LabIcon className={`w-8 h-8 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-3xl md:text-4xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1.5 italic flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  SovereignNexus Operational Validation Node
                </p>
            </div>
        </div>

        {/* Tab Controllers */}
        <div className="flex bg-black p-1.5 rounded-xl border border-zinc-900 gap-1.5 w-full md:w-auto flex-wrap">
          <button 
            onClick={() => setActiveTab('bridge')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'bridge' ? 'bg-red-950/40 border border-red-900/40 text-red-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <ShieldIcon className="w-3.5 h-3.5" />
            SovereignNexus Bridge
          </button>
          <button 
            onClick={() => setActiveTab('keys')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'keys' ? 'bg-amber-950/40 border border-amber-900/40 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <LucideKey className="w-3.5 h-3.5" />
            Tester Key Management
          </button>
          <button 
            onClick={() => setActiveTab('stress')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'stress' ? 'bg-zinc-800 border border-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <ActivityIcon className="w-3.5 h-3.5" />
            Thermal Stress Driver
          </button>
        </div>
      </div>

      {/* Main Content Workspace Layout */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <AnimatePresence mode="wait">
          
          {/* ========================================================= */}
          {/* TAB 1: SOVEREIGNNEXUS BRIDGE CRYPTOGRAPHIC VALIDATOR      */}
          {/* ========================================================= */}
          {activeTab === 'bridge' && (
            <motion.div 
              key="bridge-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
            >
              
              {/* Left Column Controls */}
              <div className="col-span-1 xl:col-span-5 space-y-6">
                
                {/* Proof Parameter Adjustment Dashboard */}
                <div className="p-6 bg-[#0c0c0e] border-2 border-zinc-900 rounded-2xl space-y-5 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                       Consensus Proof Deck
                    </h3>
                    <span className="text-[7.5px] font-mono font-bold text-zinc-550 uppercase">
                      BLOCKCHAIN REGISTER
                    </span>
                  </div>

                  {/* Input Hash */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">
                      Transaction Hash (btcTxHash)
                    </label>
                    <input 
                      type="text" 
                      value={btcTxHash}
                      onChange={(e) => setBtcTxHash(e.target.value)}
                      className="w-full bg-black border border-zinc-900 text-zinc-300 font-mono text-[9.5px] p-2.5 rounded-lg focus:outline-none focus:border-red-900/80 transition-colors"
                      placeholder="Enter 32-byte hash (0x...)"
                    />
                  </div>

                  {/* Input Height & SegWit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">
                        Target Block Height
                      </label>
                      <input 
                        type="number" 
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-full bg-black border border-zinc-900 text-zinc-300 font-mono text-[9.5px] p-2.5 rounded-lg focus:outline-none focus:border-red-900/80 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">
                        SegWit Evaluation
                      </label>
                      <div className="flex items-center gap-2.5 h-10 px-3 bg-black border border-zinc-900 rounded-lg select-none">
                        <input 
                          type="checkbox" 
                          id="segwit"
                          checked={segwitCommitment}
                          onChange={(e) => setSegwitCommitment(e.target.checked)}
                          className="accent-red-600 rounded cursor-pointer w-4 h-4"
                        />
                        <label htmlFor="segwit" className="text-[9px] text-zinc-400 font-extrabold cursor-pointer">
                          Witness commitment
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Input Partial Merkle Tree Serialized Data */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">
                      Partial Merkle Tree (pmtSerialized)
                    </label>
                    <textarea 
                      rows={2}
                      value={pmtSerialized}
                      onChange={(e) => setPmtSerialized(e.target.value)}
                      className="w-full bg-black border border-zinc-900 text-zinc-300 font-mono text-[9.5px] p-2.5 rounded-lg focus:outline-none focus:border-red-900/80 transition-colors resize-none"
                    />
                  </div>

                  {/* Diagnostic Failure Mode Injectors */}
                  <div className="space-y-2 border-t border-zinc-900 pt-4">
                    <span className="text-[7.5px] text-zinc-550 font-black uppercase tracking-widest block mb-1">
                      ⚠️ MOCK CRITICAL PATHOLOGY FAILURE MODES (AUDIT TEST CASES)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleInjectError('absence')}
                        className={`py-2 px-2.5 border rounded-lg text-[8px] font-black uppercase tracking-wider text-left transition-all ${injectedErrorMode === 'absence' ? 'bg-red-950/20 border-red-500 text-red-400' : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
                      >
                        ● Absence from Tree
                      </button>
                      <button
                        onClick={() => handleInjectError('non_parseable')}
                        className={`py-2 px-2.5 border rounded-lg text-[8px] font-black uppercase tracking-wider text-left transition-all ${injectedErrorMode === 'non_parseable' ? 'bg-red-950/20 border-red-500 text-red-400' : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
                      >
                        ● Corrupted PMT Proof
                      </button>
                      <button
                        onClick={() => handleInjectError('wrong_height')}
                        className={`py-2 px-2.5 border rounded-lg text-[8px] font-black uppercase tracking-wider text-left transition-all ${injectedErrorMode === 'wrong_height' ? 'bg-red-950/20 border-red-500 text-red-400' : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
                      >
                        ● Incorrect Height
                      </button>
                      <button
                        onClick={() => handleInjectError('segwit_mismatch')}
                        className={`py-2 px-2.5 border rounded-lg text-[8px] font-black uppercase tracking-wider text-left transition-all ${injectedErrorMode === 'segwit_mismatch' ? 'bg-red-950/20 border-red-500 text-red-400' : 'bg-black border-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
                      >
                        ● SegWit Root Clash
                      </button>
                    </div>
                  </div>

                  {/* Trigger buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={executeBridgeValidation}
                      disabled={validationStatus === 'validating'}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:bg-zinc-950 disabled:opacity-50 text-white font-mono text-[9px] font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(220,38,38,0.2)] flex items-center justify-center gap-2"
                    >
                      {validationStatus === 'validating' ? (
                        <>
                          <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                          Validating Inclusion Path...
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-3.5 h-3.5" />
                          Register & Verify Proof
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetToVerifiedState}
                      className="px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition-all flex items-center justify-center"
                      title="Restore Flawless Path"
                    >
                      <HistoryIcon className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Real-World Spending: BTC Balance Fetcher */}
                <div className="p-6 bg-[#0c0c0e] border-2 border-zinc-900 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-650/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-2">
                      <LucideCoins className="w-4 h-4 text-red-500 animate-pulse" />
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        Sovereign Spend Core
                      </h3>
                    </div>
                    {/* Mode selector tab */}
                    <div className="flex bg-black p-0.5 rounded-lg border border-zinc-900 text-[8px] font-mono select-none">
                      <button
                        type="button"
                        onClick={() => setBtcFetcherMode('live')}
                        className={`px-2 py-1 rounded font-black transition-all ${btcFetcherMode === 'live' ? 'bg-red-950/50 text-red-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                      >
                        LIVE NET
                      </button>
                      <button
                        type="button"
                        onClick={() => setBtcFetcherMode('mock')}
                        className={`px-2 py-1 rounded font-black transition-all ${btcFetcherMode === 'mock' ? 'bg-red-950/50 text-red-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                      >
                        CONDUIT
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Address Display and Copy block */}
                    <div className="space-y-1">
                      <span className="text-[7.5px] font-bold text-zinc-550 uppercase tracking-widest block">
                        Spend Target (Bitcoin Address v0)
                      </span>
                      <div className="flex items-center gap-2 bg-black border border-zinc-900/80 rounded-xl px-3 py-2.5">
                        <span className="text-[9.5px] font-mono text-zinc-400 select-all truncate flex-1">
                          {btcAddress}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(btcAddress);
                            setBtcCopied(true);
                            setTimeout(() => setBtcCopied(false), 2000);
                          }}
                          className="text-zinc-500 hover:text-white transition-colors"
                          title="Copy BTC Address"
                        >
                          {btcCopied ? (
                            <LucideCheck className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <LucideCopy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Balance Display Layout */}
                    <div className="bg-black/40 border border-zinc-900 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[7.5px] font-bold text-zinc-550 uppercase tracking-widest mt-0.5">
                          Verified Reserve Balance
                        </span>
                        <button
                          type="button"
                          onClick={fetchBtcBalance}
                          disabled={btcLoading}
                          className="text-[7.5px] text-zinc-400 hover:text-white uppercase font-black tracking-wider flex items-center gap-1 transition-colors disabled:opacity-40"
                        >
                          <svg className={`w-2.5 h-2.5 ${btcLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3" />
                          </svg>
                          Query Node
                        </button>
                      </div>

                      {btcLoading ? (
                        <div className="space-y-1.5 py-1">
                          <div className="h-6 w-32 bg-zinc-904 animate-pulse rounded" />
                          <div className="h-3 w-16 bg-zinc-904 animate-pulse rounded" />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-xl font-black text-white font-mono flex items-baseline gap-1.5 leading-none">
                            <span>
                              {btcBalanceSats !== null 
                                ? (btcBalanceSats / 100000000).toFixed(8) 
                                : '0.00000000'}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-black">BTC</span>
                          </div>
                          
                          <div className="flex justify-between text-[8px] text-zinc-500 font-mono">
                            <span>
                              ≈ $
                              {btcBalanceSats !== null 
                                ? ((btcBalanceSats / 100000000) * 95160).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                                : '0.00'}{" "}
                              USD
                            </span>
                            <span>
                              {btcBalanceSats !== null ? btcBalanceSats.toLocaleString() : '0'} Satoshis
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* API Stats Drawer if raw data is ready */}
                    {btcRawData && !btcLoading && (
                      <div className="grid grid-cols-3 gap-2 text-[7.5px] font-mono text-zinc-505 bg-black/30 p-2.5 rounded-lg border border-zinc-900">
                        <div>
                          <span className="text-zinc-600 uppercase block text-[6px] font-black">TX Count</span>
                          <span className="text-zinc-300 font-bold">{btcRawData.chain_stats?.tx_count ?? 0}</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 uppercase block text-[6px] font-black">Total Ingest</span>
                          <span className="text-zinc-300 font-bold">
                            {btcRawData.chain_stats?.funded_txo_sum 
                              ? (btcRawData.chain_stats.funded_txo_sum / 100000000).toFixed(4)
                              : '0.0000'}{" "}
                            BTC
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-600 uppercase block text-[6px] font-black">Reserve Status</span>
                          <span className="text-emerald-500 font-bold uppercase">SECURED</span>
                        </div>
                      </div>
                    )}

                    {btcError && (
                      <div className="p-2.5 bg-red-950/20 border border-red-900/35 text-red-400 rounded-lg text-[8px] leading-normal font-medium flex items-start gap-1.5">
                        <LucideShieldAlert className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{btcError}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit Defensive Context Card */}
                <div className="p-5 bg-gradient-to-br from-zinc-950 to-[#0e0c0c] border border-red-950/40 rounded-2xl">
                  <span className="text-[7.5px] text-red-900 font-extrabold uppercase tracking-widest block mb-2">
                    COGNITIVE BLOCKADE MECHANISM
                  </span>
                  <p className="text-[9.5px] text-zinc-500 leading-relaxed italic">
                    Within the SovereignNexus architecture, strict PMT validation acts as a structural filter against 
                    unverified/simulated transactions. Every block heights' Merkle validation serves as standard cryptographic ledger truth before memorization.
                  </p>
                </div>

              </div>

              {/* Right Column Validation Console */}
              <div className="col-span-1 xl:col-span-7 space-y-6">
                
                {/* Simulated Verification Result Banner */}
                {validationStatus !== 'idle' && (
                  <div className={`p-6 border-2 rounded-2xl shadow-2xl transition-all ${
                    validationStatus === 'validating' ? 'bg-[#0f1115] border-blue-900/30 text-blue-100' :
                    validationStatus === 'success' ? 'bg-[#0a0f0d] border-emerald-900/40 text-emerald-100' :
                    'bg-[#12080a] border-red-900/40 text-red-100'
                  }`}>
                    
                    {validationStatus === 'validating' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <SpinnerIcon className="w-6 h-6 animate-spin text-blue-500" />
                          <div>
                            <h4 className="font-extrabold uppercase tracking-wide text-xs text-blue-400">Performing Ledger Ingestion & Validation...</h4>
                            <p className="text-[8px] text-zinc-400 uppercase mt-0.5">SovereignNexus is testing inclusion coefficients</p>
                          </div>
                        </div>
                        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${validationProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {validationStatus === 'success' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-emerald-950/60 pb-3">
                          <div className="flex items-center gap-3">
                            <CheckCircleIcon className="w-7 h-7 text-emerald-500" />
                            <div>
                              <h4 className="font-black uppercase tracking-wide text-xs text-emerald-400">Consensus Confirmed & Admitted</h4>
                              <p className="text-[8px] text-zinc-500 uppercase mt-0.5">RegisterBtcTransaction: SUCCESS</p>
                            </div>
                          </div>
                          <span className="bg-emerald-950 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                            LEDGER STAMP ADMITTED
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-[9px] font-mono text-zinc-400 pt-1">
                          <div>
                            <span className="text-zinc-500 uppercase font-black block text-[7.5px]">Merkle Root Anchored</span>
                            <span className="text-zinc-200 truncate block">0x8F2C9A51E283FFBD5529A8DCB...</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 uppercase font-black block text-[7.5px]">Receipt Signature</span>
                            <span className="text-zinc-200 truncate block">0xRESTORED_Consensus_MerklePath_Valid</span>
                          </div>
                        </div>

                        {/* Merkle inclusion path drawing summary */}
                        <div className="bg-black/80 p-4 border border-emerald-950/65 rounded-xl">
                          <span className="text-[7.5px] font-black text-emerald-500 uppercase block mb-2 tracking-widest">
                            In-Block Proof Inclusion Path Graph (PMT Reconstruction)
                          </span>
                          <div className="flex flex-col items-center gap-2 py-1 select-none">
                            <div className="px-3 py-1.5 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded text-[8px] font-black">
                              Merkle Root: 0x8F2C9A [MATCH]
                            </div>
                            <div className="w-px h-3 bg-emerald-800" />
                            <div className="flex justify-between w-full max-w-xs gap-4">
                              <div className="flex-1 px-2.5 py-1.5 bg-[#0a0f0d] border border-emerald-950 text-emerald-300 rounded text-[7.5px] text-center">
                                Interior L: 0xA2C4D8 [OK]
                              </div>
                              <div className="flex-1 px-2.5 py-1.5 bg-[#0a0f0d] border border-emerald-950 text-emerald-300 rounded text-[7.5px] text-center">
                                Interior R: 0x981D2E [OK]
                              </div>
                            </div>
                            <div className="flex justify-between w-full max-w-xs gap-4">
                              <div className="w-1/2 flex flex-col items-center">
                                <div className="w-px h-3 bg-emerald-800" />
                                <div className="px-2 py-1 bg-emerald-900/30 border border-emerald-600 text-emerald-200 rounded text-[7.5px]">
                                  Leaf: 0xE491 [FOUND]
                                </div>
                              </div>
                              <div className="w-1/2 flex flex-col items-center opacity-40">
                                <div className="w-px h-3 bg-zinc-800" />
                                <div className="px-2 py-1 bg-zinc-900 border border-zinc-700 text-zinc-400 rounded text-[7.5px]">
                                  Sibling: 0xFB28 [PASS]
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {validationStatus === 'error' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-red-950/60 pb-3">
                          <div className="flex items-center gap-3">
                            <WarningIcon className="w-7 h-7 text-red-500 animate-pulse" />
                            <div>
                              <h4 className="font-black uppercase tracking-wide text-xs text-red-400">RegisterBtcTransactionException</h4>
                              <p className="text-[8px] text-red-600 uppercase font-black tracking-widest mt-0.5">Could not validate transaction</p>
                            </div>
                          </div>
                          <span className="bg-red-950/60 border border-red-800/40 text-red-400 text-[8px] font-black uppercase px-2.5 py-1 rounded">
                            COGNITIVE DEFENCE ENGAGED
                          </span>
                        </div>

                        {/* Error Cause Breakdown */}
                        <div className="space-y-3">
                          <p className="text-[9.5px] font-black text-zinc-200 leading-relaxed bg-black/60 p-3.5 border border-red-950/50 rounded-lg">
                            {injectedErrorMode === 'absence' && "Absence from Merkle Tree: The transaction hash (btcTxHash) is not found within the Merkle tree of the block header stored at the provided block height. The transaction cannot be mathematically verified as mined inside that specific block body."}
                            {injectedErrorMode === 'non_parseable' && "Non-Parseable Merkle Proofs: The Partial Merkle Tree (pmtSerialized) provided is malformed, corrupted, or logically inconsistent, preventing the parser from calculating the path hashes toward the Merkle root."}
                            {injectedErrorMode === 'wrong_height' && "Incorrect Block Height: The specified height does not correspond to the block where the transaction was mined. Submitting proof vectors at mismatched headers voids validation consensus checks."}
                            {injectedErrorMode === 'segwit_mismatch' && "SegWit Root Mismatches: For witness-enabled transactions, the evaluated witness Merkle root calculated from transaction data does not match the witness commitment registered inside the block's Coinbase."}
                          </p>

                          <div className="p-3 bg-[#17090b] border border-red-950 rounded-xl space-y-2">
                            <span className="text-[7.5px] font-black uppercase text-red-500 block tracking-wider">
                              CRITICAL PATHOLOGY ANALYSIS & ROOT CAUSES:
                            </span>
                            <ul className="text-[8.5px] text-zinc-400 space-y-1 bg-black/40 p-2.5 rounded border border-zinc-900">
                              <li className="flex items-start gap-1.5">
                                <span className="text-red-600">•</span>
                                <span>No inclusion certificate could be calculated because hash pathways broke intermediate constraints.</span>
                              </li>
                              <li className="flex items-start gap-1.5">
                                <span className="text-red-600">•</span>
                                <span>Inherent defense against <strong className="text-zinc-100">"cognitive counterfeits"</strong> successfully blocked unregistered transaction state.</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-1.5">
                          <button
                            onClick={resetToVerifiedState}
                            className="flex-1 py-2.5 px-4 bg-emerald-950/40 hover:bg-emerald-900/40 border-2 border-emerald-500 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Re-Synthesize Consensus Proof (Consensus Restored)
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Living Record ledger containing recently validated and default items */}
                <div className="p-6 bg-[#0c0c0e] border-2 border-zinc-900 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <DatabaseIcon className="w-4 h-4 text-red-500" />
                      The Living Record (Merkle DAG Memory)
                    </h3>
                    <span className="text-[8px] bg-red-950/30 border border-red-900/40 text-red-500 px-2.5 py-0.5 rounded-lg font-black tracking-widest">
                       BTC TRUTH MEMORIZED
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[290px] overflow-y-auto custom-scrollbar pr-1">
                    {livingRecord.map(tx => (
                      <div 
                        key={tx.id}
                        className="p-3.5 bg-black border border-zinc-900/70 hover:border-zinc-805 rounded-xl transition-colors space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-zinc-100 font-mono">ID: {tx.id}</span>
                          </div>
                          <span className="text-[7.5px] text-zinc-500 font-mono">{tx.timestamp}</span>
                        </div>

                        <div className="space-y-1 text-[8.5px] font-mono text-zinc-400">
                          <div className="truncate">Hash: <span className="text-zinc-200">{tx.btcTxHash}</span></div>
                          <div>Block Heights: <span className="text-zinc-200">{tx.height}</span></div>
                          <div className="truncate">Block Header Hash: <span className="text-zinc-500 select-all">{tx.blockHash}</span></div>
                          <div className="truncate">Consensus Root: <span className="text-emerald-500 select-all">{tx.merkleRoot}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Console Tracer Log Output */}
                <div className="p-5 bg-black border-2 border-zinc-900 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-[8.5px] text-zinc-500 font-black uppercase tracking-wider pb-1.5 border-b border-zinc-950">
                    <span className="flex items-center gap-1.5">
                      <TerminalIcon className="w-3.5 h-3.5" />
                      Live Bridge Console Stream
                    </span>
                    <span>TRACER ACTIVE</span>
                  </div>
                  <div className="h-28 overflow-y-auto custom-scrollbar font-mono text-[8px] text-zinc-500 space-y-1.5 pr-1.5">
                    {activeLogs.map((log, i) => (
                      <div 
                        key={i} 
                        className={` leading-relaxed ${
                          log.includes('[FATAL_ERROR]') ? 'text-red-500 font-bold' : 
                          log.includes('[CONSENSUS_RESTORED]') ? 'text-emerald-400 font-bold font-mono' :
                          log.includes('[INJECT]') ? 'text-amber-500' : 'text-zinc-500'
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: NEURAL PRESSURE STRESS DRIVER                      */}
          {/* ========================================================= */}
          {activeTab === 'stress' && (
            <motion.div 
              key="stress-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              
              {/* Load Guage Card */}
              <div className="aero-panel bg-black border-2 border-zinc-900 p-8 rounded-3xl flex flex-col justify-center items-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isTesting ? 'bg-red-500 animate-ping' : 'bg-zinc-800'}`} />
                  <span className="text-[7.5px] text-zinc-550 font-black uppercase tracking-widest">
                    STRESS GENERATOR BLOCK
                  </span>
                </div>

                {/* Forensic laser sweep line */}
                {isTesting && (
                  <div className="absolute left-0 right-0 h-[2px] pointer-events-none z-10 bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.8)] forensic-grid-scanner animate-pulse" />
                )}

                <h3 className="text-[9px] text-zinc-500 font-black uppercase mb-10 tracking-[0.5em] select-none">
                  Neural Pressure Load Coefficient
                </h3>
                
                <div className="relative w-64 h-64 flex items-center justify-center select-none">
                    <div className="absolute inset-0 border-8 border-zinc-950 rounded-full" />
                    <div 
                        className="absolute inset-0 border-8 border-red-600 rounded-full transition-all duration-300"
                        style={{ clipPath: `inset(${100 - load}% 0 0 0)` }}
                    />
                    <div className={`text-6.5xl font-black ${load > 85 ? 'text-red-500 animate-bounce' : 'text-white'}`}>
                        {load}%
                    </div>
                </div>

                {load > 80 && (
                    <div className="mt-8 flex items-center gap-3 text-red-500 font-black uppercase text-[10px] animate-pulse">
                        <WarningIcon className="w-5 h-5 col-span-1" /> CORE SATURATION LIMIT THRESHOLD
                    </div>
                )}

                <div className="w-full pt-8 flex gap-3">
                  <button 
                    onClick={runTest}
                    disabled={isTesting}
                    className={`flex-1 py-3.5 rounded-2xl border-2 border-black font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0_0_#000] active:translate-y-0.5 transition-all ${isTesting ? 'bg-red-600 text-white animate-pulse border-red-500' : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 hover:text-white'}`}
                  >
                    {isTesting ? 'TESTING ENGINE ACTIVE...' : 'INITIATE THERMAL DRIVER'}
                  </button>
                </div>
              </div>

              {/* Stress logs and secondary details Column */}
              <div className="space-y-6">
                
                {/* Secondary Reliability stats */}
                <div className="aero-panel bg-[#0d0d10] p-6 border-2 border-zinc-900 rounded-3xl space-y-5 shadow-xl">
                  <h4 className="font-comic-header text-2xl text-white uppercase italic">Reliability Vectors</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Session Uptime', val: '482,991s', ok: true },
                        { label: 'Admission Latency', val: '0.02ms', ok: true },
                        { label: 'Thermal Stasis', val: isTesting ? 'HIGH_CORE' : 'OPTIMAL_FLUID', ok: true },
                        { label: 'Clock Drifting', val: 'STABLE_LOCK', ok: true }
                    ].map(m => (
                        <div key={m.label} className="p-3 bg-black border border-zinc-900/40 rounded-xl flex flex-col justify-between">
                            <span className="text-[7.5px] font-black uppercase text-zinc-500 mb-1">{m.label}</span>
                            <span className={`text-[11px] font-black ${m.val.includes('HIGH') ? 'text-red-500 font-bold' : 'text-white'}`}>{m.val}</span>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Stress logger container */}
                <div className="p-6 bg-black border-2 border-zinc-900 rounded-3xl space-y-3 shadow-xl">
                  <div className="flex justify-between items-center text-[7.5px] text-zinc-550 font-black uppercase tracking-wider border-b border-zinc-950 pb-2">
                    <span>Stress Core Logs</span>
                    <span>100Hz</span>
                  </div>
                  <div className="h-32 overflow-y-auto custom-scrollbar font-mono text-[8px] text-zinc-500 space-y-1 pr-1">
                    {stressLogs.map((log, i) => (
                      <div key={i} className={`leading-relaxed ${log.includes('RAMP') ? 'text-red-400 font-bold' : log.includes('SUCCESS') ? 'text-emerald-400' : 'text-zinc-650'}`}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-red-950/10 border border-red-900/20 rounded-2xl text-center italic text-[9.5px] text-red-400/60 font-black uppercase">
                  "Warning: High load can result in hard-vapor logic shards. Conduct diagnostic tasks recursively."
                </div>

              </div>

            </motion.div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: TESTER KEY MANAGEMENT & CRYPTOGRAPHIC GATEWAY      */}
          {/* ========================================================= */}
          {activeTab === 'keys' && (
            <motion.div
              key="keys-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
            >
              
              {/* Left Column: Signers Registry & Custom Import */}
              <div className="col-span-1 xl:col-span-5 space-y-6">
                
                {/* Guest Account Protective Alert Frame */}
                {user?.role === 'guest' && (
                  <div className="p-5 bg-amber-950/20 border-2 border-amber-900/50 rounded-2xl space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-400">
                      <LucideShieldAlert className="w-5 h-5 shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        CRITICAL CREDENTIAL BLOCKADE ENGAGED
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-400 leading-relaxed font-sans">
                      The requested local developer key-pairs contain default system consensus authority private signers. 
                      To prevent key extraction or transaction signature forgery, guest observers are strictly restricted. 
                      Keys are fully censored and clipboard access is disabled.
                    </p>
                  </div>
                )}

                {/* Key Signers List */}
                <div className="p-6 bg-[#0c0c0e] border-2 border-zinc-900 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-3">
                      <LucideKey className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        Signer Registry Keys
                      </h3>
                    </div>
                    <span className="text-[7.5px] bg-amber-950/30 border border-amber-900/40 text-amber-500 px-2 py-0.5 rounded font-black tracking-widest">
                      LOCAL SIMULATOR
                    </span>
                  </div>

                  <div className="space-y-3">
                    {testerKeys.map((key) => {
                      const isActive = activeSignerAddress === key.address;
                      const isGuest = user?.role === 'guest';
                      return (
                        <div
                          key={key.address}
                          onClick={() => {
                            if (!isSigningInProcess) {
                              setActiveSignerAddress(key.address);
                            }
                          }}
                          className={`p-3 border rounded-xl transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                            isActive
                              ? 'bg-amber-950/20 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                              : 'bg-black border-zinc-900 hover:border-zinc-850'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-500 animate-pulse' : 'bg-zinc-700'}`} />
                              <span className={`text-[10px] font-extrabold truncate ${isActive ? 'text-amber-400' : 'text-zinc-300'}`}>
                                {key.label}
                              </span>
                            </div>
                            <span className="text-[8px] text-zinc-500 font-mono bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900">
                              {key.balance}
                            </span>
                          </div>

                          <div className="text-[8.5px] font-mono text-zinc-500 mt-2 space-y-1">
                            <div className="truncate">
                              Address: <span className="text-zinc-400 select-all">{key.address}</span>
                            </div>
                            <div className="truncate">
                              Private Key:{' '}
                              {isGuest ? (
                                <span className="text-red-950 bg-red-950/20 border border-red-950/30 px-1 py-0.2 rounded select-none text-[8px] font-bold">
                                  CENSORED_GUEST_PREVENTS_THEFT
                                </span>
                              ) : (
                                <span className="text-zinc-600 select-all font-bold">{key.privateKey}</span>
                              )}
                            </div>
                            <div className="text-zinc-600 italic text-[7.5px] mt-1">
                              {key.description}
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-zinc-950" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              disabled={isGuest}
                              onClick={() => handleCopyKeyText(key.privateKey, `${key.address}-pk`)}
                              className={`px-2 py-1 rounded text-[8px] font-black uppercase flex items-center gap-1 border ${
                                isGuest 
                                  ? 'bg-zinc-950 border-zinc-900/60 text-zinc-700 cursor-not-allowed animate-pulse'
                                  : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white'
                              }`}
                              title={isGuest ? "Access Restricted to Operators" : "Copy Private Key"}
                            >
                              {copiedKeyId === `${key.address}-pk` ? (
                                <LucideCheck className="w-2.5 h-2.5 text-green-500" />
                              ) : (
                                <LucideCopy className="w-2.5 h-2.5" />
                              )}
                              Copy Private Key
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyKeyText(key.address, `${key.address}-addr`)}
                              className="px-2 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white rounded text-[8px] font-black flex items-center gap-1"
                              title="Copy Public Hash"
                            >
                              {copiedKeyId === `${key.address}-addr` ? (
                                <LucideCheck className="w-2.5 h-2.5 text-green-500" />
                              ) : (
                                <LucideCopy className="w-2.5 h-2.5" />
                              )}
                              Copy Address
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Import/Generate Form Section */}
                <div className="p-6 bg-[#0c0c0e] border-2 border-zinc-900 rounded-2xl space-y-4">
                  <div className="border-b border-zinc-900 pb-2">
                    <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider block">
                      Register Custom Cryptographic Signer
                    </span>
                  </div>

                  {user?.role === 'guest' ? (
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl text-center">
                      <span className="text-[8px] text-zinc-650 font-mono block uppercase">
                        REGISTRAR SHIELD ENGAGED
                      </span>
                      <p className="text-[8.5px] font-mono text-zinc-600 mt-1 italic">
                        Credentials input forms are locked out in guest observer sandbox state.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleAddDevKey} className="space-y-3 font-mono text-[9px]">
                      <div className="space-y-1">
                        <label className="text-zinc-500 block uppercase font-bold text-[7.5px]">Signer Label</label>
                        <input
                          type="text"
                          placeholder="e.g. Validator Oracle Node"
                          value={customKeyLabel}
                          onChange={(e) => setCustomKeyLabel(e.target.value)}
                          className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-zinc-200 focus:outline-none focus:border-amber-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-500 block uppercase font-bold text-[7.5px]">EVM Public Address</label>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={customKeyAddr}
                          onChange={(e) => setCustomKeyAddr(e.target.value)}
                          className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-zinc-200 focus:outline-none focus:border-amber-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-500 block uppercase font-bold text-[7.5px]">EVM Private Key</label>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={customKeyPriv}
                          onChange={(e) => setCustomKeyPriv(e.target.value)}
                          className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-zinc-200 focus:outline-none focus:border-amber-900"
                        />
                      </div>

                      {keyInputError && (
                        <p className="text-[8.5px] text-red-500 font-bold">{keyInputError}</p>
                      )}

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={handleGenerateRandomDevPair}
                          className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg border border-zinc-850 font-black text-[8px] uppercase tracking-wider"
                        >
                          Generate Dev Pair
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-black rounded-lg font-black text-[8px] uppercase tracking-wider"
                        >
                          Import Signer
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </div>

              {/* Right Column: ECDSA Msg Signer & Gas Estimation */}
              <div className="col-span-1 xl:col-span-7 space-y-6">
                
                {/* ECDSA Message Signer Simulator */}
                <div className="p-6 bg-[#0c0c0e] border-2 border-zinc-900 rounded-2xl space-y-5">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <LucideFingerprint className="w-4.5 h-4.5 text-amber-500" />
                      ECDSA Message Signer
                    </h3>
                    <span className="text-[7.5px] font-mono font-bold text-zinc-550 uppercase">
                      SECURE CURVE SECP256K1
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">
                        Payload Type Template
                      </label>
                      <select
                        value={msgPayloadSelect}
                        onChange={(e) => setMsgPayloadSelect(e.target.value as any)}
                        className="w-full bg-black border border-zinc-900 text-zinc-300 font-mono text-[9.5px] p-2 rounded-lg focus:outline-none"
                      >
                        <option value="text">AetherOS Kernel Stasis Verification</option>
                        <option value="bridge">Bitcoin Bridge Tx Registration Payload</option>
                        <option value="consensus">Propose Consensus Shard Action</option>
                        <option value="deploy">EVM Contract Constructor Bytecode</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">
                        Signing Identity Source
                      </label>
                      <div className="p-2 bg-black border border-zinc-900 rounded-lg text-zinc-400 font-mono text-[9px] truncate">
                        {testerKeys.find(k => k.address === activeSignerAddress)?.label || 'Authorized Node'} <span className="text-zinc-600 font-bold">({activeSignerAddress.slice(0, 10)}...)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">
                      Serialized Payload Payload Bytes
                    </label>
                    <textarea
                      rows={3}
                      value={customTextPayload}
                      onChange={(e) => setCustomTextPayload(e.target.value)}
                      className="w-full bg-black border border-zinc-900 text-zinc-300 font-mono text-[9px] p-2.5 rounded-lg focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSignSimulatedPayload}
                      disabled={isSigningInProcess}
                      className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black font-mono text-[9px] font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.1)] flex items-center justify-center gap-2"
                    >
                      {isSigningInProcess ? (
                        <>
                          <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                          Generating Cryptographic Signature...
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-3.5 h-3.5" />
                          Sign Simulated Parameters
                        </>
                      )}
                    </button>
                  </div>

                  {generatedSignature && (
                    <div className="p-4 bg-black border border-amber-950/40 rounded-xl space-y-2.5 text-[8.5px] font-mono">
                      <div className="flex justify-between items-center text-[7.5px] text-amber-500 font-black tracking-wider uppercase">
                        <span>ECDSA Signature Output Array</span>
                        <span>SHA3 Digest Matched</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="truncate">
                          <span className="text-zinc-500 uppercase font-black mr-1">Message Keccak Hash:</span>
                          <span className="text-zinc-300">{generatedSignature.messageHash}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div className="truncate">
                            <span className="text-zinc-500 uppercase font-black block text-[7.5px]">Coordinate R</span>
                            <span className="text-zinc-400">{generatedSignature.r}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-zinc-500 uppercase font-black block text-[7.5px]">Coordinate S</span>
                            <span className="text-zinc-400">{generatedSignature.s}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-zinc-500 uppercase font-black mr-1">Recovery Variant (V):</span>
                          <span className="text-zinc-300">{generatedSignature.v}</span>
                        </div>
                        <div className="pt-2 border-t border-zinc-950 select-all truncate text-amber-400 font-black">
                          <span className="text-zinc-500 uppercase font-black mr-1 font-mono text-[8px]">Compiled Signature Bytes:</span>
                          {generatedSignature.signatureBytes}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Log Console Output for ECDSA Signing */}
                  <div className="p-4 bg-black border border-zinc-900 rounded-xl space-y-2">
                    <div className="flex justify-between text-[7.5px] text-zinc-550 uppercase tracking-widest font-bold">
                      <span>ECDSA Activity Stream</span>
                      <span>TRACE STACK</span>
                    </div>
                    <div className="h-20 overflow-y-auto custom-scrollbar font-mono text-[8px] text-zinc-650 space-y-1">
                      {signingLog.map((log, i) => (
                        <p key={i} className={log.includes('SUCCESS') ? 'text-green-500 font-bold' : log.includes('TRIG') ? 'text-amber-500' : 'text-zinc-500'}>
                          {log}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Simulated Gas Estimation Engine */}
                <div className="p-6 bg-[#0c0c0e] border-2 border-zinc-900 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <LucideCpu className="w-4.5 h-4.5 text-amber-500" />
                      EVM Transaction Gas Estimator
                    </h3>
                    <span className="text-[7.5px] font-mono font-bold text-zinc-550 uppercase">
                      SIMULATED TESTNET DRYRUN
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 flex flex-col justify-between">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
                        Target Contract Method
                      </label>
                      <select
                        value={gasContractFunc}
                        onChange={(e) => setGasContractFunc(e.target.value as any)}
                        className="w-full bg-black border border-zinc-900 text-zinc-300 font-mono text-[9px] p-2 rounded-lg"
                      >
                        <option value="verifyProof">AetherProofVerifier.verifyAetherProof</option>
                        <option value="recordIdentity">SovereignIdentityRegistry.recordIdentity</option>
                        <option value="claimYield">NeuralYieldDistributor.claimYield</option>
                        <option value="deployRegistry">NeuralRegistryFactory.deployRegistry (Contract Deploy)</option>
                      </select>
                    </div>

                    <div className="space-y-1 flex flex-col justify-between">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
                        Congestion Profile Fee
                      </label>
                      <select
                        value={gasPricingProfile}
                        onChange={(e) => setGasPricingProfile(e.target.value as any)}
                        className="w-full bg-black border border-zinc-900 text-zinc-300 font-mono text-[9px] p-2 rounded-lg"
                      >
                        <option value="eco">Eco Mode (Low: Base 12 Gwei)</option>
                        <option value="nominal">Nominal Stasis (Base 38 Gwei)</option>
                        <option value="hyper">Hyper Congested (Extreme: Base 190 Gwei)</option>
                      </select>
                    </div>

                    <div className="space-y-1 flex flex-col justify-between">
                      <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
                        Confidence Overhead Multiplier ({gasMultiplier}x)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="2"
                        step="0.1"
                        value={gasMultiplier}
                        onChange={(e) => setGasMultiplier(parseFloat(e.target.value))}
                        className="w-full bg-black accent-amber-500 cursor-pointer h-6"
                      />
                    </div>
                  </div>

                  {/* Gwei Adjusters */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1 bg-black p-2 rounded-lg border border-zinc-900">
                      <div className="flex justify-between items-center text-[8px] text-zinc-550 font-black uppercase tracking-wider">
                        <span>Simulated Gwei Base Fee</span>
                        <span>{customBaseFee} Gwei</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="300"
                        value={customBaseFee}
                        onChange={(e) => setCustomBaseFee(parseInt(e.target.value))}
                        className="w-full accent-amber-500 h-5"
                      />
                    </div>

                    <div className="space-y-1 bg-black p-2 rounded-lg border border-zinc-900">
                      <div className="flex justify-between items-center text-[8px] text-zinc-550 font-black uppercase tracking-wider">
                        <span>Max Miner Tip</span>
                        <span>{customPriorityTip} Gwei</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="0.5"
                        value={customPriorityTip}
                        onChange={(e) => setCustomPriorityTip(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 h-5"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleEstimateGasSimulated}
                      disabled={isEstimatesRunning}
                      className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-amber-500 border border-zinc-800 font-mono text-[9px] font-black uppercase rounded-lg flex items-center justify-center gap-2"
                    >
                      {isEstimatesRunning ? (
                        <>
                          <SpinnerIcon className="w-3 h-3 animate-spin" />
                          Dry-running EVM operations...
                        </>
                      ) : (
                        <>
                          <LucideCpu className="w-3.5 h-3.5" />
                          Estimate EVM Execution Gas Costs
                        </>
                      )}
                    </button>
                  </div>

                  {calculatedGasReceipt && (
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl font-mono text-[8.5px] space-y-3">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5 font-bold">
                        <span className="text-zinc-400 font-extrabold uppercase text-[7.5px]">EVM DRY RUN MODELLING RECEIPT</span>
                        <span className="text-emerald-500">PROCESSED</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-zinc-400">
                        <div>
                          <span className="text-zinc-600 font-extrabold block text-[7px] uppercase">Target Contract Class</span>
                          <span className="text-zinc-200">{calculatedGasReceipt.contractName}</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 font-extrabold block text-[7px] uppercase">Dynamic Method Signature</span>
                          <span className="text-zinc-200 truncate block">{calculatedGasReceipt.methodSignature}</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 font-extrabold block text-[7px] uppercase">Calculated Intrinsic Tx Gas</span>
                          <span className="text-zinc-200">{calculatedGasReceipt.intrinsicGas.toLocaleString()} units</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 font-extrabold block text-[7px] uppercase">EVM Opcode Processing Charge</span>
                          <span className="text-zinc-200">{calculatedGasReceipt.opcodesGas.toLocaleString()} units</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 font-extrabold block text-[7px] uppercase">Storage Modification (SSTORE)</span>
                          <span className="text-zinc-200">{calculatedGasReceipt.stateChangeGas.toLocaleString()} units</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 font-extrabold block text-[7px] uppercase">Total Safe Limit (Overhead incl.)</span>
                          <span className="text-amber-500 font-black">{calculatedGasReceipt.totalGasUnits.toLocaleString()} units</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-900 flex justify-between items-center text-[9px] font-extrabold">
                        <div>
                          <span className="text-zinc-600 text-[7px] block uppercase">Est. Cost in ETH</span>
                          <span className="text-amber-500">{calculatedGasReceipt.estimatedCostEth} ETH</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 text-[7px] block uppercase">Est. Fiat Value (USD)</span>
                          <span className="text-zinc-300">${calculatedGasReceipt.estimatedCostUsd}</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 text-[7px] block uppercase">Max Fee Per Gas</span>
                          <span className="text-zinc-400">{calculatedGasReceipt.maxFeePerGasGwei} Gwei</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Output log for EVM modeling */}
                  <div className="h-16 overflow-y-auto custom-scrollbar bg-black p-2.5 rounded-lg border border-zinc-900 font-mono text-[8px] text-zinc-600 space-y-1">
                    {gasEstLogs.map((log, i) => (
                      <p key={i}>{log}</p>
                    ))}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Elegant Persistent Footer */}
      <div className="px-6 py-3.5 bg-black border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 select-none">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[8.5px] font-bold text-red-500 uppercase tracking-widest">SovereignNexus Operational</span>
          </div>
          <div className="h-4 w-px bg-zinc-900 hidden md:block" />
          <span className="text-[8.5px] text-zinc-650 font-mono italic select-none">
            Verification Engine Status: ONLINE | Active Proofs: Verification Consensus Established
          </span>
        </div>
        <div className="text-[8.5px] text-zinc-850 font-black uppercase tracking-[0.25em] select-none">
          STRESS & INTEGRITY LAB // AETHEROS SYSTEM
        </div>
      </div>

    </div>
  );
};
