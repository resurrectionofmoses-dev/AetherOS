import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
    VaultIcon, 
    ShieldIcon, 
    ArchiveIcon, 
    ZapIcon, 
    LockIcon, 
    CheckCircleIcon,
    TerminalIcon,
    WarningIcon,
    XIcon,
    PlusIcon
} from './icons';

interface CreditCard {
    id: string;
    alias: string;
    lastFour: string;
    brand: string;
    expiry: string;
    status: 'ACTIVE' | 'LOCKED' | 'ARCHIVED';
}

export const CardRecoveryView: React.FC = () => {
    const [cards, setCards] = useState<CreditCard[]>([
        { id: '1', alias: 'Main Operational', lastFour: '4242', brand: 'Visa', expiry: '12/28', status: 'ACTIVE' },
        { id: '2', alias: 'Backup Sovereign', lastFour: '8888', brand: 'Amex', expiry: '05/27', status: 'LOCKED' }
    ]);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [recoveryStep, setRecoveryStep] = useState<'ID' | 'VERIFY' | 'SUCCESS'>('ID');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [show2FASetup, setShow2FASetup] = useState(false);

    const handleRecoveryFlow = async () => {
        setShowRecoveryModal(true);
        setRecoveryStep('ID');
    };

    const handleEnroll2FA = async () => {
        const res = await fetch('/api/2fa/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'sovereign@aetheros.local' })
        });
        const data = await res.json();
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setShow2FASetup(true);
    };

    return (
        <div className="flex flex-col h-full bg-black text-gray-200 font-mono p-8 overflow-y-auto custom-scrollbar">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="font-comic-header text-5xl text-white italic uppercase tracking-tighter mb-2">Asset Recovery</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Sovereign Crypto-Financial Vault</p>
                    </div>
                </div>
                <button 
                    onClick={handleRecoveryFlow}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-[4px_4px_0_0_#065f46] active:translate-y-1"
                >
                    <PlusIcon className="w-4 h-4" />
                    Initiate Recovery
                </button>
                <button 
                    onClick={handleEnroll2FA}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-[4px_4px_0_0_#1e3a8a] active:translate-y-1"
                >
                    <ShieldIcon className="w-4 h-4" />
                    Enroll 2FA
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards.map(card => (
                    <motion.div 
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-zinc-950 border-4 border-zinc-900 rounded-3xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <VaultIcon className="w-16 h-16" />
                        </div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">{card.brand}</p>
                                <h3 className="text-xl font-black text-white uppercase italic">{card.alias}</h3>
                            </div>
                            <div className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tighter ${
                                card.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 
                                card.status === 'LOCKED' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 
                                'bg-zinc-800 border-zinc-700 text-zinc-500'
                            }`}>
                                {card.status}
                            </div>
                        </div>

                        <div className="bg-black/40 border border-zinc-800 p-4 rounded-xl mb-6 font-mono text-lg tracking-[0.3em] flex justify-between items-center">
                            <span>••••</span>
                            <span>••••</span>
                            <span>••••</span>
                            <span className="text-white">{card.lastFour}</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                            <div className="text-zinc-600">Expires: <span className="text-zinc-400">{card.expiry}</span></div>
                            <button className="text-zinc-500 hover:text-white transition-colors">Details</button>
                        </div>
                    </motion.div>
                ))}

                <button 
                    onClick={handleRecoveryFlow}
                    className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-zinc-900 rounded-3xl hover:border-zinc-800 hover:bg-zinc-950/50 transition-all text-zinc-600 hover:text-zinc-400 group"
                >
                    <ArchiveIcon className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="font-black uppercase tracking-widest text-[10px]">Add Sovereign Resource</p>
                </button>
            </div>

            {/* Recovery Modal */}
            {showRecoveryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowRecoveryModal(false)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-zinc-950 border-4 border-emerald-900/50 p-8 rounded-[3rem] relative shadow-[30px_30px_0_0_rgba(0,0,0,0.5)]"
                    >
                        <button 
                            onClick={() => setShowRecoveryModal(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-zinc-900 rounded-full text-zinc-500"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>

                        {recoveryStep === 'ID' && (
                            <div className="space-y-6">
                                <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                                    <ShieldIcon className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-black text-white font-comic-header uppercase italic leading-none">Security Verification</h2>
                                <p className="text-xs text-zinc-500 leading-relaxed italic">
                                    To recover a locked asset, we must verify your 2FA presence and biometric signature. Ensure your Google Authenticator is ready.
                                </p>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest pl-1">Sovereign Email</label>
                                    <input 
                                        type="email" 
                                        placeholder="sovereign@aetheros.local"
                                        className="w-full bg-black border border-emerald-900/30 rounded-xl p-4 text-white focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <button 
                                    onClick={() => setRecoveryStep('VERIFY')}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-[6px_6px_0_0_#064e3b]"
                                >
                                    Proceed to Authenticator
                                </button>
                            </div>
                        )}

                        {recoveryStep === 'VERIFY' && (
                            <div className="space-y-6 text-center">
                                <div className="mx-auto w-16 h-16 bg-blue-500/10 border-2 border-blue-500 rounded-2xl flex items-center justify-center mb-6">
                                    <LockIcon className="w-8 h-8 text-blue-500" />
                                </div>
                                <h2 className="text-3xl font-black text-white font-comic-header uppercase italic leading-none">Auth Requirement</h2>
                                <p className="text-xs text-zinc-500">Enter the 6-digit code from Google Authenticator</p>
                                
                                <div className="flex gap-2 justify-center">
                                    {[1,2,3,4,5,6].map(i => (
                                        <input 
                                            key={i}
                                            type="text" 
                                            maxLength={1}
                                            className="w-12 h-14 bg-black border-2 border-zinc-800 focus:border-blue-500 rounded-xl text-center text-xl font-black text-white outline-none"
                                        />
                                    ))}
                                </div>

                                <button 
                                    onClick={() => setRecoveryStep('SUCCESS')}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs transition-all shadow-[6px_6px_0_0_#1e3a8a]"
                                >
                                    Verify 2FA Identity
                                </button>
                            </div>
                        )}

                        {recoveryStep === 'SUCCESS' && (
                            <div className="space-y-6 text-center py-4">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="mx-auto w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                                >
                                    <CheckCircleIcon className="w-10 h-10 text-white" />
                                </motion.div>
                                <h2 className="text-3xl font-black text-white font-comic-header uppercase italic leading-none">Access Restored</h2>
                                <p className="text-xs text-zinc-500 italic">"The Sovereign path is cleared. Asset re-synchronized."</p>
                                <div className="bg-black/50 border border-emerald-500/20 p-4 rounded-2xl text-left">
                                    <div className="flex items-center gap-3 mb-2">
                                        <TerminalIcon className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Recovery Log</span>
                                    </div>
                                    <p className="text-[9px] text-zinc-600 font-mono leading-relaxed">
                                        [00:00:01] Auth Token Accepted<br/>
                                        [00:00:02] RSA-4096 Fragment Rebuilt<br/>
                                        [00:00:03] Physical Resource Re-Lined<br/>
                                        [00:00:04] Status: ALIVE
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowRecoveryModal(false)}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs"
                                >
                                    Close Vault
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* 2FA Setup Modal */}
            {show2FASetup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShow2FASetup(false)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-sm bg-zinc-950 border-4 border-blue-900/50 p-8 rounded-[3rem] relative text-center"
                    >
                        <h2 className="text-2xl font-black text-white font-comic-header uppercase italic mb-4">Sovereign 2FA Sync</h2>
                        <p className="text-[10px] text-zinc-500 mb-6 font-mono">Scan this with Google Authenticator</p>
                        
                        {qrCode && (
                            <div className="bg-white p-4 rounded-3xl inline-block mb-6 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                            </div>
                        )}
                        
                        <div className="bg-black border border-zinc-800 p-3 rounded-xl mb-6 truncate font-mono text-[10px] text-zinc-400">
                            Secret Key: <span className="text-white select-all">{secret}</span>
                        </div>

                        <button 
                            onClick={() => setShow2FASetup(false)}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs shadow-[6px_6px_0_0_#1e3a8a]"
                        >
                            Sync Complete
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
