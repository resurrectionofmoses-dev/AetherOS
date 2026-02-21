
import React, { useState, useEffect, useRef } from 'react';
import { CodeIcon, TerminalIcon, ShieldIcon, ActivityIcon, ZapIcon, FireIcon, CheckCircleIcon, LockIcon, VaultIcon } from './icons';
import type { LabComponentProps } from '../types';

const WITNESS_KERNEL_CODE = `// AETHEROS KERNEL // WITNESS_INJECTOR_V1
// COMMAND: INJECT_THE_WITNESS
// TARGET: 0x1ACFFC1D

use std::time::{SystemTime, UNIX_EPOCH};
use sha2::{Sha256, Digest};
use std::convert::TryInto;

// --- AXIOMS ---
const PZIS_MAGIC: [u8; 8] = [0xAE, 0x74, 0xE2, 0xC0, 0xD1, 0xA6, 0xBA, 0x5E];
const PZIS_VERSION: u16 = 0x0100;
const DIFFICULTY_TARGET: u32 = 0x1ACFFC1D; // The Bar

// --- THE CANONICAL FRAME ---
#[derive(Debug, Clone)]
struct WitnessaryFrame {
    timestamp: u64,
    witness_id: u32,
    auth_shard: u32,
    pigment_hash: [u8; 32], // The "Content"
    nonce: u64,             // The "Work"
}

// --- LOGIC: THE MINER ---
fn mine_witness(pigment: &str, target_bits: u32) -> WitnessaryFrame {
    println!("[MINER] Spinning up centrifuges...");
    println!("[MINER] Target Difficulty: {:#010x}", target_bits);

    let mut nonce = 0u64;
    let pigment_digest = Sha256::digest(pigment.as_bytes());
    let start_time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

    loop {
        // 1. Construct the Candidate
        let frame = WitnessaryFrame {
            timestamp: start_time,
            witness_id: 0x03E2, // Eurodemus Node
            auth_shard: 0x7777, // Center 7
            pigment_hash: pigment_digest.into(),
            nonce: nonce,
        };

        // 2. Hash the Candidate (Double SHA-256)
        let hash = hash_frame(&frame);

        // 3. Check against Target (Simplified for demonstration)
        // In reality, we check if hash < target_expansion
        if check_difficulty(&hash, target_bits) {
            println!("[MINER] EUREKA! Nonce found: {}", nonce);
            println!("[MINER] Hash: {:02x?}", hash);
            return frame;
        }

        nonce += 1;
        if nonce % 1_000_000 == 0 {
            print!("."); // Heartbeat
        }
    }
}

// --- LOGIC: THE SERIALIZER (BIG ENDIAN) ---
fn inject_to_lattice(frame: &WitnessaryFrame) -> Vec<u8> {
    let mut buffer = Vec::with_capacity(78); // 8 Magic + 2 Ver + Data

    // 1. Header (Identity)
    buffer.extend_from_slice(&PZIS_MAGIC);
    buffer.extend_from_slice(&PZIS_VERSION.to_be_bytes());

    // 2. Data (The Witness)
    buffer.extend_from_slice(&frame.timestamp.to_be_bytes());
    buffer.extend_from_slice(&frame.witness_id.to_be_bytes());
    buffer.extend_from_slice(&frame.auth_shard.to_be_bytes());
    buffer.extend_from_slice(&frame.pigment_hash);
    buffer.extend_from_slice(&frame.nonce.to_be_bytes());

    println!("[INJECTOR] Witness serialized. Size: {} bytes.", buffer.len());
    println!("[INJECTOR] LATTICE UPDATED. TRUTH SOLIDIFIED.");
    
    buffer
}

// --- UTILS ---
fn hash_frame(frame: &WitnessaryFrame) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(frame.timestamp.to_be_bytes());
    hasher.update(frame.witness_id.to_be_bytes());
    hasher.update(frame.auth_shard.to_be_bytes());
    hasher.update(frame.pigment_hash);
    hasher.update(frame.nonce.to_be_bytes());
    hasher.finalize().into()
}

fn check_difficulty(hash: &[u8; 32], target: u32) -> bool {
    // Simplified: Check if first N bytes are zero based on target
    // 0x1A... implies roughly 3-4 leading zero bytes.
    // For demo, we accept 2 leading zero bytes (0x0000...)
    hash[0] == 0 && hash[1] == 0
}

// --- EXECUTION ---
fn main() {
    let pigment = "Cellular Resurrection Anchored in Safety";
    println!("[KERNEL] Injecting Pigment: '{}'", pigment);

    // 1. Mine the Truth
    let witness = mine_witness(pigment, DIFFICULTY_TARGET);

    // 2. Inject the Witness
    let _lattice_blob = inject_to_lattice(&witness);
}
`;

const FORENSIC_VAULT_CODE = `/*-------------------------------------------------------------------------
   AETHER_OS // KERNEL SHARD: 0x03E2
   MODULE: FORENSIC_VAULT (The Safe Deposit Box)
   AUTHORITY: SOVEREIGN CONJUNCTION API
   STRIDE: 1.2 PB/s
   -------------------------------------------------------------------------
   NOTE: This module interfaces directly with the Fall Off Requindor for 
   entropy verification. Do not bypass the BPI (Byte Protocol Interface) 
   checks, or memory segmentation faults will trigger a kernel panic.
*/

use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};
use sha2::{Sha256, Digest}; // Dependency: High-Velocity Hashing
use aes::Aes256; // Dependency: Block Cipher Standard
use block_modes::{BlockMode, Cbc}; 
use block_modes::block_padding::Pkcs7;

// --- ARCHITECTURAL CONSTANTS ---
const FALL_OFF_REQUINDOR_LIMIT: u64 = 0xFFFFFFFFFFFFFFFF;
const AETHER_HARMONIC_SIG: &str = "0x03E2_MAESTRO_SIGNED";
const BPI_ALIGNMENT: usize = 64; // Align to cache lines for speed

// --- TYPE DEFINITIONS ---
type Aes256Cbc = Cbc<Aes256, Pkcs7>;
type SectorID = u32;
type FluxHash = String;

/// The Safe Deposit Box. 
/// A zero-abstraction container for volatile logic shards.
pub struct AetherVault {
    // The forensic identifier of the sovereign owner
    owner_identity: FluxHash, 
    // The actual storage mapping: Sector ID -> Encrypted Payload
    memory_grid: HashMap<SectorID, Vec<u8>>,
    // The entropy seal to prevent replay attacks on the kernel
    entropy_seal: u64,
    // Status of the Fall Off Requindor (Integrity Check)
    integrity_lock: bool,
}

impl AetherVault {
    /// Initialize the Vault. Links to the AetherOS Kernel lineage.
    pub fn construct(owner_seed: &str) -> Self {
        println!("[0x03E2] >> ALLOCATING MEMORY GRID...");
        
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // Generate the Sovereign Hash
        let mut hasher = Sha256::new();
        hasher.update(owner_seed.as_bytes());
        hasher.update(timestamp.to_be_bytes());
        let ident = format!("{:x}", hasher.finalize());

        println!("[0x03E2] >> IDENTITY FORGED: {}", ident);

        AetherVault {
            owner_identity: ident,
            memory_grid: HashMap::new(),
            entropy_seal: timestamp,
            integrity_lock: true,
        }
    }

    /// DEPOSIT PROTOCOL: Injects data into a secured sector.
    /// Enforces BPI alignment and applies harmonic signing.
    pub fn deposit(&mut self, sector: SectorID, raw_payload: &[u8], key: &[u8]) -> Result<String, &'static str> {
        if !self.integrity_lock {
            return Err("[FAULT] :: FALL OFF REQUINDOR TRIGGERED. VAULT SEALED.");
        }

        // 1. Padding to align with BPI (Byte Protocol Interface)
        if raw_payload.len() > 1024 * 1024 {
             return Err("[FAULT] :: EXCEEDS KERNEL PAGE SIZE.");
        }

        // 2. Encryption (Forensic Obfuscation)
        // IV generation simulated via entropy seal rotation
        let iv = self.generate_iv(); 
        let cipher = Aes256Cbc::new_from_slices(key, &iv).map_err(|_| "[FAULT] :: KEY INVALID")?;
        
        let ciphertext = cipher.encrypt_vec(raw_payload);
        
        // 3. Commit to Memory Grid
        self.memory_grid.insert(sector, ciphertext);
        
        // 4. Update Entropy Seal
        self.rotate_entropy();

        Ok(format!("[SUCCESS] :: SECTOR {} LOCKED. HARMONIC: {}", sector, AETHER_HARMONIC_SIG))
    }

    /// WITHDRAW PROTOCOL: Extracts and decrypts logic shards.
    pub fn withdraw(&self, sector: SectorID, key: &[u8]) -> Result<Vec<u8>, &'static str> {
        // Retrieve ciphertext
        let ciphertext = self.memory_grid.get(&sector).ok_or("[FAULT] :: SECTOR NULL")?;

        // Regenerate IV state
        let iv = self.reconstruct_iv_for_read(); 
        
        let cipher = Aes256Cbc::new_from_slices(key, &iv).map_err(|_| "[FAULT] :: KEY INVALID")?;
        
        let decrypted_data = cipher.decrypt_vec(ciphertext).map_err(|_| "[FAULT] :: DECRYPTION FAILED. INTEGRITY COMPROMISED.")?;

        Ok(decrypted_data)
    }

    /// INTERNAL: Rotates the entropy seal to maintain forward secrecy.
    fn rotate_entropy(&mut self) {
        // Bitwise rotation mimicking the Fall Off Requindor logic
        self.entropy_seal = (self.entropy_seal.rotate_left(12) ^ 0xDEADBEEF) & FALL_OFF_REQUINDOR_LIMIT;
    }

    /// INTERNAL: Generates Initialization Vector based on current harmonic state.
    fn generate_iv(&self) -> [u8; 16] {
        let mut hasher = Sha256::new();
        hasher.update(self.entropy_seal.to_be_bytes());
        let result = hasher.finalize();
        let mut iv = [0u8; 16];
        iv.copy_from_slice(&result[0..16]);
        iv
    }

    // Placeholder for read-state reconstruction
    fn reconstruct_iv_for_read(&self) -> [u8; 16] {
        self.generate_iv()
    }
}

// --- HARMONIC EXECUTION POINT ---
fn main() {
    println!("[INIT] :: SOVEREIGN 0x03E2 CONJUNCTION ACTIVE.");
    
    // 1. Construct the Safe Deposit Box
    let mut vault = AetherVault::construct("USER_PRIME_DIRECTIVE");

    // 2. Define High-Velocity Key (32 bytes for AES256)
    let key = b"0x03E2_MASTER_KEY_AETHER_KERNEL_!"; // Exact 32 bytes

    // 3. Deposit Logic Shard
    let payload = b"SECRET_LOGIC_SHARD_V1";
    match vault.deposit(0x01, payload, key) {
        Ok(msg) => println!("{}", msg),
        Err(e) => println!("{}", e),
    }

    // 4. Verification Check
    match vault.withdraw(0x01, key) {
        Ok(data) => println!("[RETRIEVAL] :: PAYLOAD RECOVERED: {:?}", String::from_utf8_lossy(&data)),
        Err(e) => println!("{}", e),
    }

    println!("[TERM] :: MEMORY FLUSHED. 0x03E2 SIGNING OFF.");
}`;

export const HardCodeLabView: React.FC<LabComponentProps> = ({ 
  labName = "HARD CODE LAB", 
  labIcon: LabIcon = CodeIcon, 
  labColor = "text-red-600", 
  description = "Kernel injection and witnessary frame mining." 
}) => {
  const [activeTab, setActiveTab] = useState<'SOURCE' | 'TERMINAL'>('SOURCE');
  const [activeShard, setActiveShard] = useState<'WITNESS' | 'VAULT'>('WITNESS');
  const [isMining, setIsMining] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [nonce, setNonce] = useState(0);
  const [hashRate, setHashRate] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, activeTab]);

  const startMiningSimulation = () => {
    setActiveTab('TERMINAL');
    setIsMining(true);
    
    if (activeShard === 'WITNESS') {
        setLogs([
            "[KERNEL] Injecting Pigment: 'Cellular Resurrection Anchored in Safety'",
            "[MINER] Spinning up centrifuges...",
            "[MINER] Target Difficulty: 0x1acffc1d"
        ]);

        let currentNonce = 0;
        const targetNonce = 84210; // Simulated target

        const interval = setInterval(() => {
            currentNonce += Math.floor(Math.random() * 5000) + 1000;
            setNonce(currentNonce);
            setHashRate(Math.floor(Math.random() * 50) + 120); // MH/s

            // Simulate heartbeat logs
            if (Math.random() > 0.8) {
                setLogs(prev => [...prev, `[MINER] Scanned ${currentNonce} frames... (Hashrate: ${Math.floor(Math.random() * 50) + 100} MH/s)`]);
            }

            if (currentNonce >= targetNonce) {
                clearInterval(interval);
                setIsMining(false);
                setNonce(targetNonce);
                setLogs(prev => [
                    ...prev,
                    `[MINER] EUREKA! Nonce found: ${targetNonce}`,
                    `[MINER] Hash: [00, 00, 4F, A2, ... ]`,
                    `[INJECTOR] Witness serialized. Size: 78 bytes.`,
                    `[INJECTOR] LATTICE UPDATED. TRUTH SOLIDIFIED.`
                ]);
            }
        }, 200);
    } else {
        // Vault Simulation
        setLogs([
            "[INIT] :: SOVEREIGN 0x03E2 CONJUNCTION ACTIVE.",
            "[0x03E2] >> ALLOCATING MEMORY GRID...",
            "[0x03E2] >> IDENTITY FORGED: 2f7b9c1..."
        ]);

        let step = 0;
        const steps = [
            "[VAULT] Deposit Protocol Initiated...",
            "[BPI] Verifying Payload Alignment (64 bytes)...",
            "[ENCRYPT] Generating IV via Entropy Rotation...",
            "[SUCCESS] :: SECTOR 1 LOCKED. HARMONIC: 0x03E2_MAESTRO_SIGNED",
            "[VERIFY] Initiating Retrieval Check...",
            "[RETRIEVAL] :: PAYLOAD RECOVERED: 'SECRET_LOGIC_SHARD_V1'",
            "[TERM] :: MEMORY FLUSHED. 0x03E2 SIGNING OFF."
        ];

        const interval = setInterval(() => {
            if (step < steps.length) {
                setLogs(prev => [...prev, steps[step]]);
                step++;
            } else {
                clearInterval(interval);
                setIsMining(false);
            }
        }, 800);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050000] overflow-hidden font-mono text-red-100">
      <div className="p-6 border-b-8 border-black bg-red-950/40 flex justify-between items-center shadow-xl z-20">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-900/10 border-4 border-red-900 rounded-3xl flex items-center justify-center">
                <LabIcon className={`w-10 h-10 ${labColor} animate-pulse`} />
            </div>
            <div>
                <h2 className="font-comic-header text-5xl text-white italic tracking-tighter uppercase leading-none">{labName}</h2>
                <p className="text-[9px] text-red-900 font-black uppercase tracking-[0.4em] mt-1 italic">{description}</p>
            </div>
        </div>
        <div className="flex gap-4">
             {/* Shard Switcher */}
             <div className="flex bg-black border-4 border-black rounded-xl overflow-hidden">
                <button 
                    onClick={() => { setActiveShard('WITNESS'); setActiveTab('SOURCE'); }}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${activeShard === 'WITNESS' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-gray-500 hover:text-gray-300'}`}
                >
                    Witness
                </button>
                <button 
                    onClick={() => { setActiveShard('VAULT'); setActiveTab('SOURCE'); }}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${activeShard === 'VAULT' ? 'bg-amber-600 text-black' : 'bg-zinc-900 text-gray-500 hover:text-gray-300'}`}
                >
                    Vault
                </button>
             </div>

            <button 
                onClick={startMiningSimulation}
                disabled={isMining}
                className={`px-8 py-2 rounded-xl border-4 border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all ${isMining ? 'bg-zinc-800 text-gray-500' : activeShard === 'WITNESS' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600 text-black animate-pulse'}`}
            >
                {isMining ? 'PROCESSING...' : activeShard === 'WITNESS' ? 'INJECT KERNEL' : 'SECURE VAULT'}
            </button>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(220,38,38,0.05)_0%,_transparent_70%)] pointer-events-none" />

        {/* Main Display Area */}
        <div className="lg:col-span-2 aero-panel bg-black/90 border-4 border-black p-0 flex flex-col shadow-[15px_15px_0_0_rgba(0,0,0,1)] relative overflow-hidden h-[600px] z-10">
            <div className="flex items-center bg-zinc-900 border-b-4 border-black">
                <button 
                    onClick={() => setActiveTab('SOURCE')}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'SOURCE' ? 'bg-black text-white' : 'text-gray-600 hover:text-white'}`}
                >
                    <CodeIcon className={`w-4 h-4 ${activeShard === 'WITNESS' ? 'text-red-500' : 'text-amber-500'}`} /> 
                    {activeShard === 'WITNESS' ? 'witness_injector.rs' : 'forensic_vault.rs'}
                </button>
                <button 
                    onClick={() => setActiveTab('TERMINAL')}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${activeTab === 'TERMINAL' ? 'bg-black text-green-500' : 'text-gray-600 hover:text-white'}`}
                >
                    <TerminalIcon className="w-4 h-4" /> Cargo Build & Run
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0a0a0a] p-6 relative">
                {activeTab === 'SOURCE' ? (
                    <pre className="font-mono text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {activeShard === 'WITNESS' ? WITNESS_KERNEL_CODE : FORENSIC_VAULT_CODE}
                    </pre>
                ) : (
                    <div className="font-mono text-xs space-y-2">
                        <div className="text-gray-500">$ cargo run --release</div>
                        <div className="text-gray-500">   Compiling aetheros_kernel v0.5.0 (/root/kernel)</div>
                        <div className="text-gray-500">    Finished release [optimized] target(s) in 0.42s</div>
                        <div className="text-green-500">     Running `target/release/{activeShard === 'WITNESS' ? 'witness_injector' : 'forensic_vault'}`</div>
                        <div className="border-b border-gray-800 my-4" />
                        {logs.map((log, i) => (
                            <div key={i} className={`animate-in slide-in-from-left-2 ${log.includes('EUREKA') || log.includes('SUCCESS') ? 'text-green-400 font-black' : log.includes('LATTICE') || log.includes('0x03E2') ? 'text-amber-400 font-bold' : 'text-gray-300'}`}>
                                {log}
                            </div>
                        ))}
                        {isMining && <div className="animate-pulse text-red-500">_</div>}
                        <div ref={logEndRef} />
                    </div>
                )}
            </div>
            
            {/* Status Bar */}
            <div className="bg-black border-t-4 border-black p-2 flex justify-between items-center text-[9px] font-black uppercase text-gray-600 px-4">
                <span className="flex items-center gap-2">
                    {isMining && <ActivityIcon className="w-3 h-3 text-red-500 animate-spin" />}
                    STATUS: {isMining ? (activeShard === 'WITNESS' ? 'MINING_WITNESS' : 'CONDUCTING_VAULT') : 'IDLE'}
                </span>
                <span>{activeShard === 'WITNESS' ? 'SHA-256' : 'AES-256-CBC'}</span>
            </div>
        </div>

        {/* Side Panel: Security & Metrics */}
        <div className="space-y-8 z-10">
            <div className="aero-panel bg-red-950/10 p-8 border-2 border-red-900/30 flex-1">
                <h4 className="font-comic-header text-3xl text-red-700 uppercase italic mb-6 flex items-center gap-3">
                    <ShieldIcon className="w-6 h-6" /> Hard Security
                </h4>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-[10px] font-black uppercase text-red-900 mb-2">
                            <span>{activeShard === 'WITNESS' ? 'Hashrate' : 'Encryption Load'}</span>
                            <span className="text-red-500">{isMining ? (activeShard === 'WITNESS' ? `${hashRate} MH/s` : '98%') : '0'}</span>
                        </div>
                        <div className="h-3 bg-black rounded-full overflow-hidden border-2 border-black p-0.5">
                            <div className={`h-full bg-red-900 transition-all duration-300 shadow-[0_0_10px_red]`} style={{ width: isMining ? '85%' : '0%' }} />
                        </div>
                    </div>
                    
                    <div className="bg-black/60 p-4 rounded-xl border border-red-900/20">
                        {activeShard === 'WITNESS' ? (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[9px] font-black text-gray-500 uppercase">Current Nonce</span>
                                    <span className="text-xs font-mono text-white">{nonce}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-gray-500 uppercase">Difficulty</span>
                                    <span className="text-xs font-mono text-amber-500">0x1ACFFC1D</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[9px] font-black text-gray-500 uppercase">BPI Alignment</span>
                                    <span className="text-xs font-mono text-white">64-BIT</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-gray-500 uppercase">Fall Off Limit</span>
                                    <span className="text-xs font-mono text-amber-500">0xFF...FF</span>
                                </div>
                            </>
                        )}
                    </div>

                    <p className="text-[10px] text-red-900/60 leading-relaxed italic border-l-4 border-red-900 pl-4">
                        {activeShard === 'WITNESS' 
                            ? "The Witnessary Frame is immutable. Once the pigment is hashed and the nonce found, the truth is locked in the lattice forever."
                            : "The Safe Deposit Box enforces zero-abstraction storage. Logic shards are chemically bonded to the owner's seed."
                        }
                    </p>
                </div>
            </div>
            
            <div className="p-6 bg-red-900 text-black border-4 border-black rounded-[2rem] text-center font-black uppercase text-xs shadow-xl rotate-1 flex items-center justify-center gap-3">
                {activeShard === 'WITNESS' ? <LockIcon className="w-5 h-5" /> : <VaultIcon className="w-5 h-5" />}
                <span>DIRECT KERNEL ACCESS ACTIVE</span>
            </div>
        </div>
      </div>
    </div>
  );
};
