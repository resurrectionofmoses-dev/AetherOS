import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode, 
  Cpu, 
  Terminal, 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Flame, 
  Braces, 
  AlertOctagon,
  Wrench,
  Key,
  Copy,
  Check,
  Plus,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SolidityPlaygroundProps {
  onAddLog?: (msg: string) => void;
}

const NUMERIC_EXAMPLES_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NumericExamples {
    uint256 public constant THE_NUMBER_ONE_CONSTANT = 1;
    uint256 public theNumberOneVariable;
    uint8 public smallCounter; // Max 255

    event OperationResult(string description, uint256 oldValue, uint256 newValue);

    constructor() {
        theNumberOneVariable = 1;
        smallCounter = 255;
    }

    function getTheNumberOne() public pure returns (uint256) {
        return 1;
    }

    function incrementSmallCounter() public {
        emit OperationResult("Before Increment", smallCounter, 0);
        smallCounter++; // Will revert on overflow 255+ in >=0.8.0
        emit OperationResult("After Increment", 255, smallCounter);
    }

    function decrementSmallCounter() public {
        smallCounter = 0;
        emit OperationResult("Before Decrement", smallCounter, 0);
        smallCounter--; // Will revert on underflow 0-1 in >=0.8.0
        emit OperationResult("After Decrement", 0, smallCounter);
    }

    function forceOverflowUnchecked() public {
        uint8 tempCounter = 255;
        emit OperationResult("Before Unchecked Overflow", tempCounter, 0);
        unchecked {
            tempCounter++; // Wrapping (255 -> 0)
        }
        emit OperationResult("After Unchecked Overflow", 255, tempCounter);
        smallCounter = tempCounter;
    }

    function forceUnderflowUnchecked() public {
        uint8 tempCounter = 0;
        emit OperationResult("Before Unchecked Underflow", tempCounter, 0);
        unchecked {
            tempCounter--; // Wrapping (0 -> 255)
        }
        emit OperationResult("After Unchecked Underflow", 0, tempCounter);
        smallCounter = tempCounter;
    }
}`;

const BIOMETRIC_REGISTRY_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BiometricRegistry {
    struct Identity {
        uint256 keystrokeEntropy;
        uint256 mouseJitter;
        uint256 timestamp;
    }

    mapping(address => Identity) public identityProfiles;

    event ProfileUpdated(address indexed user, uint256 entropy, uint256 jitter);

    function recordIdentity(uint256 _entropy, uint256 _jitter) public {
        identityProfiles[msg.sender] = Identity({
            keystrokeEntropy: _entropy,
            mouseJitter: _jitter,
            timestamp: block.timestamp
        });
        emit ProfileUpdated(msg.sender, _entropy, _jitter);
    }
}`;

export const SolidityPlayground: React.FC<SolidityPlaygroundProps> = () => {
  const { user } = useAuth();
  const [selectedContract, setSelectedContract] = useState<'NumericExamples' | 'BiometricRegistry'>('NumericExamples');
  
  // Compiler State
  const [isCompiling, setIsCompiling] = useState(false);
  const [isCompiled, setIsCompiled] = useState(false);
  const [compilerLogs, setCompilerLogs] = useState<string[]>([]);
  
  // Deployment State
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [gasUsed, setGasUsed] = useState<number>(0);
  const [evmChainId, setEvmChainId] = useState<number>(1337);
  
  // Numeric Contract Simulated Variables
  const [smallCounter, setSmallCounter] = useState<number>(255);
  const [theNumberOneVariable, setTheNumberOneVariable] = useState<number>(1);
  const [blockchainEventLog, setBlockchainEventLog] = useState<Array<{
    txHash: string;
    block: number;
    description: string;
    eventSig: string;
    details: string;
    gas: number;
    reverted: boolean;
  }>>([]);

  // Tester Keys State
  const [testerKeys, setTesterKeys] = useState<Array<{
    label: string;
    address: string;
    privateKey: string;
    description: string;
    balance: string;
  }>>([
    {
      label: 'Hardhat #0 (Anvil Master)',
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      privateKey: '0xac0974bec39a17e31ba4a1aec30d17b5bca52f3d17c74c599045030551c4812d',
      description: 'Default master deploying key for local hardhat network environments.',
      balance: '10,000 ETH'
    },
    {
      label: 'Hardhat #1 (Standard Attester)',
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
      description: 'Standard multi-signature attester and governance voting authority.',
      balance: '8,500 ETH'
    },
    {
      label: 'Hardhat #2 (Forensic Auditor)',
      address: '0x3C44CdDB6a900fa2b585dd299e03d12FA4293BC1',
      privateKey: '0x5de4111defac7531641d9da65540989ea52407bfe739e30f1d977a44a11c828d',
      description: 'Secured fallback key reserved for sandboxed smart contract debugging.',
      balance: '450 ETH'
    },
    {
      label: 'Aether AI Maestro',
      address: '0x1cFa06126D8F12dc3A010C7d01B50e0D17DC79C7',
      privateKey: '0x79ea3d17c74c599045030551c4812dac0974b2e61aaccdae88c7e8412f4603b6',
      description: 'Autonomous neural sovereign model authorized to sign automated consensus updates.',
      balance: '7,777 ETH'
    },
    {
      label: 'Aigent Autonomous Executor #3',
      address: '0xADDBEef82dB6aBdD8bf255E0DddDda29CFFfA1F3',
      privateKey: '0xbeef52f3d1e31ba4a1aec30d17b5bca52f3d17c74c599045030551c4812dac097',
      description: 'Decentralized local worker daemon validating on-chain state hashes.',
      balance: '350 ETH'
    }
  ]);

  const [activeSigner, setActiveSigner] = useState<string>('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states to add new custom key
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyAddress, setNewKeyAddress] = useState('');
  const [newKeyPrivate, setNewKeyPrivate] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCopy = (text: string, id: string) => {
    if (user?.role === 'guest' && id.endsWith('-pk')) {
      addCompilerLog(`[SECURITY_EXCEPTION] Private key extraction rejected for guest session.`);
      return;
    }
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyLabel || !newKeyAddress || !newKeyPrivate) {
      setValidationError('Please fill in all layout fields to register key');
      return;
    }
    if (!newKeyAddress.startsWith('0x') || newKeyAddress.length !== 42) {
      setValidationError('EVM Address must start with 0x and be 42 characters');
      return;
    }
    if (!newKeyPrivate.startsWith('0x') || newKeyPrivate.length < 10) {
      setValidationError('EVM Private Key must start with 0x sequence');
      return;
    }

    setTesterKeys(prev => [
      ...prev,
      {
        label: `${newKeyLabel} (Ephemeral Custom)`,
        address: newKeyAddress,
        privateKey: newKeyPrivate,
        description: 'User-provided custom sandbox signer key pair.',
        balance: '100 ETH'
      }
    ]);
    setActiveSigner(newKeyAddress);
    setNewKeyLabel('');
    setNewKeyAddress('');
    setNewKeyPrivate('');
    setValidationError('');
    addCompilerLog(`[INFO] Registered new custom tester key for address: ${newKeyAddress}`);
  };

  const generateRandomKeyPair = () => {
    const chars = '0123456789abcdef';
    let randAddress = '0x';
    for (let i = 0; i < 40; i++) randAddress += chars[Math.floor(Math.random() * chars.length)];
    let randPrivate = '0x';
    for (let i = 0; i < 64; i++) randPrivate += chars[Math.floor(Math.random() * chars.length)];
    
    setNewKeyLabel('Genesis Oracle');
    setNewKeyAddress(randAddress);
    setNewKeyPrivate(randPrivate);
    setValidationError('');
  };

  // Biometric Contract Simulated mapping
  const [biometricProfiles, setBiometricProfiles] = useState<Record<string, {
    entropy: number;
    jitter: number;
    timestamp: string;
  }>>({
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
      entropy: 82,
      jitter: 14,
      timestamp: new Date().toLocaleTimeString()
    }
  });
  
  // Inputs for Biometric Call
  const [entropyInput, setEntropyInput] = useState<string>('95');
  const [jitterInput, setJitterInput] = useState<string>('24');

  // Interactive console reference
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [compilerLogs]);

  const addCompilerLog = (msg: string) => {
    setCompilerLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleCompile = () => {
    setIsCompiling(true);
    setIsCompiled(false);
    setCompilerLogs([]);
    setDeployedAddress(null);
    
    addCompilerLog(`hardhat compile initialized via Hardhat Runtime Environment (HRE)`);
    addCompilerLog(`Target Solidity compiler version: ^0.8.0`);
    addCompilerLog(`Analyzing dependency graph for contracts/${selectedContract}.sol...`);
    
    setTimeout(() => {
      addCompilerLog(`[OK] Abstract Syntax Tree parsed cleanly.`);
      addCompilerLog(`[OK] Generating intermediate Yul representation...`);
      addCompilerLog(`[OK] EVM Bytecode successfully assembled.`);
    }, 600);

    setTimeout(() => {
      setIsCompiling(false);
      setIsCompiled(true);
      addCompilerLog(`[SUCCESS] Compilation complete. Produced ABI and volatile bytecodes.`);
    }, 1200);
  };

  const handleDeploy = () => {
    if (!isCompiled) return;
    setIsDeploying(true);
    addCompilerLog(`Deploying contract ${selectedContract} to Localhost:1337 Mock EVM Node...`);
    
    setTimeout(() => {
      const mockAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      const gas = selectedContract === 'NumericExamples' ? 385412 : 512030;
      setDeployedAddress(mockAddress);
      setGasUsed(gas);
      setIsDeploying(false);
      addCompilerLog(`[STATUS] Transaction broadcast to EVM memory pool.`);
    }, 800);

    setTimeout(() => {
      addCompilerLog(`[SUCCESS] Contract deployed to network!`);
      addCompilerLog(`Contract Address: ${deployedAddress || 'Pending'}`);
    }, 1400);
  };

  // Execution triggers simulating EVM logic constraints
  const callContractMethod = (method: string, args: any[] = []) => {
    if (!deployedAddress) return;
    
    const blockNum = Math.floor(Math.random() * 200) + 1200;
    const txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const caller = activeSigner;

    const newTx: typeof blockchainEventLog[0] = {
      txHash,
      block: blockNum,
      description: `Called function ${method}`,
      eventSig: '',
      details: '',
      gas: 21000,
      reverted: false
    };

    if (selectedContract === 'NumericExamples') {
      if (method === 'getTheNumberOne') {
        newTx.details = `Returned output: 1`;
        newTx.gas = 21015;
      } 
      else if (method === 'incrementSmallCounter') {
        // Solidity 0.8.0 will revert on overflow
        if (smallCounter >= 255) {
          newTx.reverted = true;
          newTx.details = `REVERT: Arithmetic overflow detected! (uint8 max is 255). Transaction rolled back under Solidity 0.8.0 rules.`;
          newTx.gas = 23145;
          addCompilerLog(`[REVERT] Tx ${txHash.slice(0, 8)} failed: Arithmetic overflow in incrementSmallCounter`);
        } else {
          const oldVal = smallCounter;
          const newVal = smallCounter + 1;
          setSmallCounter(newVal);
          newTx.eventSig = `OperationResult("Before Increment", ${oldVal}, ${newVal})`;
          newTx.details = `smallCounter incremented to ${newVal}`;
          newTx.gas = 45100;
        }
      } 
      else if (method === 'decrementSmallCounter') {
        // Sets counter to 0 then decrements -> will revert under >=0.8.0
        newTx.reverted = true;
        newTx.details = `REVERT: Arithmetic underflow detected! (uint8 cannot be less than 0). Transaction rolled back under Solidity 0.8.0 rules.`;
        newTx.gas = 23180;
        addCompilerLog(`[REVERT] Tx ${txHash.slice(0, 8)} failed: Arithmetic underflow in decrementSmallCounter`);
      } 
      else if (method === 'forceOverflowUnchecked') {
        // Overflows successfully due to unchecked block
        const oldVal = 255;
        const newVal = 0; // Wraps around
        setSmallCounter(newVal);
        newTx.eventSig = `OperationResult("Before Unchecked Overflow", ${oldVal}, ${newVal})`;
        newTx.details = `smallCounter forced overflow wrapping. Value established: ${newVal}`;
        newTx.gas = 28412;
      } 
      else if (method === 'forceUnderflowUnchecked') {
        // Underflows successfully due to unchecked block
        const oldVal = 0;
        const newVal = 255; // Wraps around
        setSmallCounter(newVal);
        newTx.eventSig = `OperationResult("Before Unchecked Underflow", ${oldVal}, ${newVal})`;
        newTx.details = `smallCounter forced underflow wrapping. Value established: ${newVal}`;
        newTx.gas = 28450;
      }
    } else {
      // BiometricRegistry
      if (method === 'recordIdentity') {
        const ent = parseInt(args[0]) || 0;
        const jit = parseInt(args[1]) || 0;
        
        setBiometricProfiles(prev => ({
          ...prev,
          [caller]: {
            entropy: ent,
            jitter: jit,
            timestamp: new Date().toLocaleTimeString()
          }
        }));

        newTx.eventSig = `ProfileUpdated("${caller}", ${ent}, ${jit})`;
        newTx.details = `Sender mapping matching details: entropy ${ent}%, jitter ${jit}%`;
        newTx.gas = 85400;
        addCompilerLog(`[EVENT] ProfileUpdated compiled and broadcast for ${caller.slice(0, 8)}`);
      }
    }

    setBlockchainEventLog(prev => [newTx, ...prev]);
  };

  const handleResetSandbox = () => {
    setSmallCounter(255);
    setTheNumberOneVariable(1);
    setBlockchainEventLog([]);
    addCompilerLog(`EVM block state completely reset.`);
  };

  const sourceToShow = selectedContract === 'NumericExamples' ? NUMERIC_EXAMPLES_SOURCE : BIOMETRIC_REGISTRY_SOURCE;

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
      
      {/* Left Pane - Contract Selection and Smart Contract Code */}
      <div className="flex-1 flex flex-col bg-zinc-950 border-4 border-zinc-900 rounded-3xl p-6 min-h-0 relative">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-zinc-400" />
            <h3 className="font-bold text-white text-sm uppercase font-mono">Sovereign Solidity Core</h3>
          </div>
          <div className="flex bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
            <button 
              onClick={() => { setSelectedContract('NumericExamples'); setIsCompiled(false); setDeployedAddress(null); }}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${selectedContract === 'NumericExamples' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              NumericExamples.sol
            </button>
            <button 
              onClick={() => { setSelectedContract('BiometricRegistry'); setIsCompiled(false); setDeployedAddress(null); }}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${selectedContract === 'BiometricRegistry' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              BiometricRegistry.sol
            </button>
          </div>
        </div>

        {/* Read-Only Source Code Box */}
        <div className="flex-1 bg-black/60 rounded-2xl p-4 overflow-y-auto font-mono text-[10px] text-zinc-400 border border-zinc-900 leading-relaxed text-left max-h-[290px] custom-scrollbar">
          <pre className="text-zinc-300 whitespace-pre">
            {sourceToShow}
          </pre>
        </div>

        {/* Compile/Deploy Control Hub */}
        <div className="mt-4 grid grid-cols-2 gap-3 shrink-0">
          <button 
            onClick={handleCompile}
            disabled={isCompiling}
            className="flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-800 hover:border-zinc-700 text-white font-bold rounded-2xl text-xs uppercase cursor-pointer transition-all disabled:opacity-40"
          >
            <Cpu className="w-4 h-4 text-zinc-400" />
            {isCompiling ? 'Compiling AST...' : 'Compile Source'}
          </button>
          <button 
            onClick={handleDeploy}
            disabled={!isCompiled || isDeploying || !!deployedAddress}
            className={`flex items-center justify-center gap-2 py-3 font-bold rounded-2xl text-xs uppercase cursor-pointer transition-all ${isCompiled && !deployedAddress ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_15px_rgba(217,119,6,0.3)]' : 'bg-zinc-900 text-zinc-600 border border-zinc-800 opacity-50 cursor-not-allowed'}`}
          >
            <Layers className="w-4 h-4" />
            {isDeploying ? 'Deploying...' : deployedAddress ? 'Deployed to Node' : 'Deploy to Localhost'}
          </button>
        </div>

        {/* Hardhat compilation terminal outputs */}
        <div className="mt-4 bg-black rounded-2xl p-3 border border-zinc-900 h-28 flex flex-col overflow-hidden text-left font-mono text-[9px]">
          <div className="text-[8px] text-zinc-600 font-bold uppercase pb-1.5 border-b border-zinc-900 flex items-center gap-1.5 shrink-0">
            <Terminal className="w-3.5 h-3.5 text-zinc-500" />
            Terminal Console logs (npx hardhat stream)
          </div>
          <div className="flex-1 overflow-y-auto space-y-0.5 pt-1.5 text-zinc-500 custom-scrollbar pr-1">
            {compilerLogs.length === 0 ? (
              <p className="text-zinc-700 italic">No compile or deploy actions recorded yet. Press "Compile Source".</p>
            ) : (
              compilerLogs.map((log, i) => (
                <p key={i} className={log.includes('SUCCESS') ? 'text-green-500 font-bold' : log.includes('REVERT') ? 'text-red-500 font-bold' : 'text-zinc-500'}>
                  {log}
                </p>
              ))
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>

      </div>

      {/* Right Pane - EVM ABI Tester Sandbox */}
      <div className="flex-1 flex flex-col bg-zinc-950 border-4 border-zinc-900 rounded-3xl p-6 min-h-0 relative overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-900 shrink-0">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-zinc-400" />
            <h3 className="font-bold text-white text-sm uppercase font-mono">EVM Interface Lab</h3>
          </div>
          <div>
            <span className="text-[8px] font-bold border border-zinc-800 text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded uppercase">
              Chain ID: {evmChainId}
            </span>
          </div>
        </div>

        {/* Tester Credentials & Cryptographic Keys Hub */}
        <div className="mb-5 bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl text-left shrink-0">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
            <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" /> Tester Keys / EVM Signers
            </span>
            <span className="text-[8.5px] text-zinc-500 font-mono">Select Active Transactor</span>
          </div>
          
          <div className="space-y-2 mb-3 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
            {testerKeys.map((k) => {
              const isActive = activeSigner === k.address;
              const isGuest = user?.role === 'guest';
              return (
                <div 
                  key={k.address}
                  onClick={() => {
                    setActiveSigner(k.address);
                    addCompilerLog(`[INFO] Switch active tx signer to ${k.label}`);
                  }}
                  className={`p-2.5 border rounded-xl transition-all cursor-pointer relative flex justify-between items-center ${isActive ? 'bg-amber-950/25 border-amber-500/80 shadow-[0_0_12px_rgba(217,119,6,0.1)]' : 'bg-black/40 border-zinc-900 hover:border-zinc-850'}`}
                >
                  <div className="font-mono text-[9.5px] min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-500 animate-pulse' : 'bg-zinc-700'}`} />
                      <span className={`font-black uppercase tracking-tight ${isActive ? 'text-amber-500 font-black' : 'text-zinc-400 font-bold'}`}>{k.label}</span>
                      <span className="text-[8px] text-zinc-500 font-bold bg-zinc-900 py-0.5 px-1.5 rounded-md border border-zinc-850">{k.balance}</span>
                    </div>
                    <div className="text-[8.5px] text-zinc-500 truncate mt-1">
                      Addr: <span className="text-zinc-400 font-black tracking-tight">{k.address}</span>
                    </div>
                    <div className="text-[8px] text-zinc-650 truncate mt-0.5">
                      PrivKey:{' '}
                      {isGuest ? (
                        <span className="text-red-500/70 bg-red-950/20 border border-red-955/35 px-1.5 py-0.2 rounded select-none text-[8px] font-bold">
                          CENSORED_GUEST_PREVENTS_THEFT
                        </span>
                      ) : (
                        <span className="text-zinc-600 tracking-tight font-black">{k.privateKey}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button"
                      disabled={isGuest}
                      onClick={() => handleCopy(k.privateKey, `${k.address}-pk`)}
                      className={`p-1 px-2.5 rounded border flex items-center gap-1.5 text-[8.5px] font-bold ${
                        isGuest 
                          ? 'bg-zinc-950 border-zinc-900 text-zinc-700 cursor-not-allowed animate-pulse' 
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
                      }`}
                      title={isGuest ? "Access Restricted to Operators" : "Copy Private Key for Hardhat config or scripts"}
                    >
                      {copiedKey === `${k.address}-pk` ? <Check className="w-2.5 h-2.5 text-green-500 shadow-green-400" /> : <Copy className="w-2.5 h-2.5" />}
                      Key
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleCopy(k.address, `${k.address}-addr`)}
                      className="p-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800 flex items-center gap-1.5 text-[8.5px] font-bold"
                      title="Copy address"
                    >
                      {copiedKey === `${k.address}-addr` ? <Check className="w-2.5 h-2.5 text-green-500" /> : <Copy className="w-2.5 h-2.5" />}
                      Addr
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {user?.role === 'guest' ? (
            <div className="border-t border-zinc-900 pt-3 text-center">
              <span className="text-[8px] text-zinc-550 font-black uppercase tracking-widest block mb-1">Import Custom Cryptographic Key</span>
              <p className="text-[8px] font-mono text-zinc-600 italic">Signer registration locked for guest observer sandbox state.</p>
            </div>
          ) : (
            <form onSubmit={handleAddCustomKey} className="border-t border-zinc-900 pt-3">
              <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest block mb-2">Import Custom Cryptographic Key</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <input 
                  type="text" 
                  placeholder="Label (e.g., Mainnet Dev)"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  className="bg-black border border-zinc-900 py-1 px-2 rounded-lg font-mono text-[9px] text-zinc-300 focus:outline-none focus:border-cyan-500"
                />
                <input 
                  type="text" 
                  placeholder="EVM Address (0x...)"
                  value={newKeyAddress}
                  onChange={(e) => setNewKeyAddress(e.target.value)}
                  className="bg-black border border-zinc-900 py-1 px-2 rounded-lg font-mono text-[9px] text-zinc-300 focus:outline-none focus:border-cyan-500"
                />
                <input 
                  type="text" 
                  placeholder="EVM Private Key (0x...)"
                  value={newKeyPrivate}
                  onChange={(e) => setNewKeyPrivate(e.target.value)}
                  className="bg-black border border-zinc-900 py-1 px-2 rounded-lg font-mono text-[9px] text-zinc-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
              {validationError && (
                <p className="text-[8px] text-red-500 font-bold mb-2">{validationError}</p>
              )}
              <div className="flex gap-2 justify-end">
                <button 
                  type="button"
                  onClick={generateRandomKeyPair}
                  className="px-2 py-0.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 font-bold font-mono text-[8px] uppercase rounded border border-zinc-850"
                >
                  Auto-generate Pair
                </button>
                <button 
                  type="submit"
                  className="px-2.5 py-0.5 bg-green-600 hover:bg-green-500 text-black font-black font-mono text-[8.5px] uppercase rounded-md"
                >
                  Import Signer
                </button>
              </div>
            </form>
          )}
        </div>

        {!deployedAddress ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 p-6 min-h-[160px]">
            <Flame className="w-12 h-12 text-zinc-700 mb-2 animate-pulse" />
            <p className="text-white font-bold text-xs uppercase tracking-widest font-mono">Contract Sandbox offline</p>
            <p className="text-[10px] text-zinc-500 max-w-xs mt-1 leading-relaxed">
              Compile the source code and hit "Deploy to Localhost" to unlock the ABI visualizer and run active EVM transactions.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 mb-4 shrink-0">
              <div className="text-left font-mono">
                <span className="text-[7px] text-zinc-500 font-black uppercase tracking-widest block">Deployed Target Contract Address</span>
                <span className="text-[10px] text-amber-500 select-all font-black break-all">{deployedAddress}</span>
              </div>
              <button 
                onClick={handleResetSandbox}
                title="Reset counter variables and transaction ledger"
                className="p-1 px-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[9px] text-zinc-400 hover:text-white flex items-center gap-1 hover:border-zinc-700"
              >
                <RotateCcw className="w-3 h-3" /> Reset State
              </button>
            </div>

            {/* Simulated Live Variable Inspectors */}
            <div className="grid grid-cols-2 gap-3.5 mb-4 shrink-0 text-left">
              <div className="bg-black border border-zinc-900 rounded-2xl p-3.5">
                <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest block mb-1">THE_NUMBER_ONE_CONSTANT</span>
                <div className="text-lg font-black font-mono text-zinc-300">1</div>
                <span className="text-[7px] font-mono text-zinc-700 uppercase">uint256 public constant</span>
              </div>
              {selectedContract === 'NumericExamples' ? (
                <div className="bg-black border border-zinc-900 rounded-2xl p-3.5">
                  <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest block mb-1">smallCounter (uint8)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-amber-400 tracking-tighter">{smallCounter}</span>
                    <span className="text-[8px] text-zinc-600 font-bold uppercase">/ 255 Max</span>
                  </div>
                  <span className="text-[7px] font-mono text-zinc-700 uppercase">uint8 public state variable</span>
                </div>
              ) : (
                <div className="bg-black border border-zinc-900 rounded-2xl p-3.5">
                  <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest block mb-1">Mapped Profiles Registry</span>
                  <div className="text-xs font-black font-mono text-cyan-400 truncate">
                    {Object.keys(biometricProfiles).length} Identity Nodes
                  </div>
                  <span className="text-[7px] font-mono text-zinc-700 uppercase">mapping(address =&gt; Identity)</span>
                </div>
              )}
            </div>

            {/* ABI Function Invocation Center */}
            <div className="flex-1 bg-black rounded-2xl border border-zinc-900 p-4.5 overflow-y-auto custom-scrollbar flex flex-col text-left mb-4">
              <h4 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest border-b border-zinc-900 pb-2 mb-3.5 flex items-center gap-1.5 shrink-0">
                <Braces className="w-3.5 h-3.5 text-amber-500" />
                ABI Function Dispatcher
              </h4>

              {selectedContract === 'NumericExamples' ? (
                <div className="space-y-4 flex-1">
                  
                  {/* View Functions */}
                  <div className="p-3 bg-zinc-950/40 border border-zinc-900/60 rounded-xl relative">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 uppercase px-1.5 py-0.5 rounded text-[8px] font-bold">pure / view</span>
                        <span className="text-white text-xs font-bold font-mono ml-2">getTheNumberOne()</span>
                      </div>
                      <button 
                        onClick={() => callContractMethod('getTheNumberOne')}
                        className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 text-[10px] font-bold rounded-lg border border-zinc-800 hover:border-zinc-700"
                      >
                        Call (Local)
                      </button>
                    </div>
                    <p className="text-[9px] text-zinc-600 italic">Demonstrates basic pure function returned constant directly without gas consumption.</p>
                  </div>

                  {/* Transaction Mutating Functions */}
                  <div className="p-3 bg-zinc-950/40 border border-zinc-900/60 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="bg-amber-950/50 text-amber-500 border border-amber-900/40 uppercase px-1.5 py-0.5 rounded text-[8px] font-extrabold">nonpayable tx</span>
                        <span className="text-white text-xs font-bold font-mono ml-2">incrementSmallCounter()</span>
                      </div>
                      <button 
                        onClick={() => callContractMethod('incrementSmallCounter')}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 hover:border-amber-500 text-black text-[10px] font-bold rounded-lg"
                      >
                        Transact
                      </button>
                    </div>
                    <p className="text-[9px] text-zinc-600 italic">Increments counter. Since Solidity 0.8.0, this triggers built-in safety overflow check reverting 255 -&gt; 256.</p>
                  </div>

                  <div className="p-3 bg-zinc-950/40 border border-zinc-900/60 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="bg-amber-950/50 text-amber-500 border border-amber-900/40 uppercase px-1.5 py-0.5 rounded text-[8px] font-extrabold">nonpayable tx</span>
                        <span className="text-white text-xs font-bold font-mono ml-2">decrementSmallCounter()</span>
                      </div>
                      <button 
                        onClick={() => callContractMethod('decrementSmallCounter')}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 hover:border-amber-500 text-black text-[10px] font-bold rounded-lg"
                      >
                        Transact
                      </button>
                    </div>
                    <p className="text-[9px] text-zinc-600 italic">Resets counter to 0 and decrements. Triggers Solidity 0.8.0 safe underflow revert error block.</p>
                  </div>

                  <div className="p-3 bg-zinc-950/40 border border-red-950/40 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="bg-amber-950/60 text-amber-500 border border-amber-900/40 uppercase px-1.5 py-0.5 rounded text-[8px] font-bold">unchecked tx</span>
                        <span className="text-white text-xs font-bold font-mono ml-2">forceOverflowUnchecked()</span>
                      </div>
                      <button 
                        onClick={() => callContractMethod('forceOverflowUnchecked')}
                        className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 hover:border-red-900 text-amber-500 text-[10px] font-bold rounded-lg border border-zinc-800"
                      >
                        Transact
                      </button>
                    </div>
                    <p className="text-[9px] text-zinc-600 italic">By-passes 0.8.0 compile checks using the 'unchecked' block demonstrating classic EVM wrapping (255 -&gt; 0).</p>
                  </div>

                  <div className="p-3 bg-zinc-950/40 border border-red-950/40 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="bg-amber-950/60 text-amber-500 border border-amber-900/40 uppercase px-1.5 py-0.5 rounded text-[8px] font-bold">unchecked tx</span>
                        <span className="text-white text-xs font-bold font-mono ml-2">forceUnderflowUnchecked()</span>
                      </div>
                      <button 
                        onClick={() => callContractMethod('forceUnderflowUnchecked')}
                        className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 hover:border-red-900 text-amber-500 text-[10px] font-bold rounded-lg border border-zinc-800"
                      >
                        Transact
                      </button>
                    </div>
                    <p className="text-[9px] text-zinc-600 italic">Toggles unchecked underflow which forces EVM back to max uint8 value wrapping (0 -&gt; 255).</p>
                  </div>

                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  <div className="p-3 bg-zinc-950/40 border border-zinc-900/60 rounded-xl">
                    <span className="bg-amber-950/50 text-amber-500 border border-amber-900/40 uppercase px-1.5 py-0.5 rounded text-[8px] font-extrabold block mb-2 w-max">nonpayable tx</span>
                    <span className="text-white text-xs font-bold font-mono block mb-3">recordIdentity(uint256 _entropy, uint256 _jitter)</span>
                    
                    <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                      <div>
                        <label className="text-[7px] text-zinc-500 uppercase font-black block mb-1">Keystroke Entropy %</label>
                        <input 
                          type="number" 
                          value={entropyInput}
                          onChange={(e) => setEntropyInput(e.target.value)}
                          className="w-full bg-black border border-zinc-900 p-1 px-2.5 rounded text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[7px] text-zinc-500 uppercase font-black block mb-1">Mouse Jitter %</label>
                        <input 
                          type="number" 
                          value={jitterInput}
                          onChange={(e) => setJitterInput(e.target.value)}
                          className="w-full bg-black border border-zinc-900 p-1 px-2.5 rounded text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => callContractMethod('recordIdentity', [entropyInput, jitterInput])}
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-black text-[10px] font-black uppercase rounded-lg transition-colors"
                    >
                      Broadcast Biometric Handshake
                    </button>
                    <p className="text-[9px] text-zinc-650 italic mt-2">Siphons and locks spatial and keystroke dynamics within secure EVM contract storage mapping mapping.</p>
                  </div>

                  {/* Mapping profiles preview table */}
                  <div className="flex-1 border border-zinc-900 bg-zinc-950/20 rounded-xl p-3">
                    <span className="text-[8px] text-zinc-500 uppercase font-black tracking-wider block mb-2">Local Mapped Identity Profiles (Mapping)</span>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                      {Object.entries(biometricProfiles).map(([addr, prof]) => (
                        <div key={addr} className="flex justify-between items-center text-[9px] font-mono p-1.5 border border-zinc-900/60 rounded bg-black/40">
                          <span className="text-zinc-400 font-black">{addr.slice(0, 10)}...{addr.slice(-6)}</span>
                          <span className="text-zinc-500">Entropy: <strong className="text-white">{prof.entropy}%</strong> | Jitter: <strong className="text-white">{prof.jitter}%</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* EVM Block/Tx Receipts Ledger logs */}
            <div className="h-32 bg-black rounded-2xl border border-zinc-900 p-3 flex flex-col overflow-hidden text-left font-mono text-[9px] shrink-0">
              <div className="text-[8px] text-zinc-600 font-bold uppercase pb-1.5 border-b border-zinc-900 flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-500" />
                  EVM Blockchain Transactions Explorer
                </span>
                <span className="text-[7.5px] italic text-zinc-650 font-bold">Simulated Gas Fee Ledger</span>
              </div>
              <div className="flex-1 overflow-y-auto pt-1.5 space-y-2 custom-scrollbar text-zinc-400">
                {blockchainEventLog.length === 0 ? (
                  <p className="text-zinc-700 italic">No transactions processed in current sandbox instance yet.</p>
                ) : (
                  blockchainEventLog.map((tx) => (
                    <div key={tx.txHash} className={`p-2 border rounded-lg ${tx.reverted ? 'bg-red-950/20 border-red-950/50' : 'bg-zinc-950/50 border-zinc-900'}`}>
                      <div className="flex justify-between items-center text-[8px] mb-1">
                        <span className={`font-black uppercase ${tx.reverted ? 'text-red-500' : 'text-green-500'}`}>
                          {tx.reverted ? 'REVERTED' : 'SUCCESS'}
                        </span>
                        <span className="text-zinc-605 truncate max-w-[120px]">TxHash: {tx.txHash}</span>
                        <span className="text-zinc-605">Block: #{tx.block}</span>
                      </div>
                      <p className="text-[9px] text-zinc-300 font-bold">{tx.description}</p>
                      {tx.eventSig && (
                        <p className="text-[8px] text-zinc-500 font-mono mt-0.5 italic">
                          <span className="text-cyan-500 uppercase font-bold text-[7px] tracking-wide not-italic">Event Emitted:</span> {tx.eventSig}
                        </p>
                      )}
                      <p className={`text-[8.5px] mt-1 italic ${tx.reverted ? 'text-red-400' : 'text-zinc-500'}`}>{tx.details}</p>
                      <p className="text-[7.5px] text-zinc-605 font-mono text-right mt-1.5 uppercase font-bold">Gas consumed: {tx.gas} units</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
