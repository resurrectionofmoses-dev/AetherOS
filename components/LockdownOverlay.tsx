import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
    ShieldIcon, 
    WarningIcon, 
    DownloadIcon, 
    LockIcon, 
    UnlockIcon, 
    TerminalIcon,
    ActivityIcon,
    XIcon
} from './icons';
import { MatrixCodeRain } from './MatrixCodeRain';

interface LockdownOverlayProps {
    isSystemFractured: boolean;
    onCloseLockdown: () => void;
    isHalted: boolean;
    onTriggerHalt: () => void;
    onResetHalt: () => void;
    onLogBreachData: () => void;
    acousticPressure: number;
    shards: number;
    activityDensity: number;
}

export const LockdownOverlay: React.FC<LockdownOverlayProps> = ({
    isSystemFractured,
    onCloseLockdown,
    isHalted,
    onTriggerHalt,
    onResetHalt,
    onLogBreachData,
    acousticPressure,
    shards,
    activityDensity
}) => {
    const [overrideCode, setOverrideCode] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    if (!isSystemFractured) return null;

    const handleKeypadPress = (val: string) => {
        setErrorMsg('');
        if (overrideCode.length < 12) {
            setOverrideCode(prev => prev + val);
        }
    };

    const handleClearCode = () => {
        setErrorMsg('');
        setOverrideCode('');
    };

    const handleVerifyOverride = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        // Supported signature overrides
        const normalizedCode = overrideCode.trim().toUpperCase();
        if (normalizedCode === 'AETHER-999' || normalizedCode === 'MAESTRO' || normalizedCode === '999') {
            setSuccessMsg('OVERRIDE CODE ACCEPTED. DE-ACTIVATING FRACTURED STATE...');
            setTimeout(() => {
                onCloseLockdown();
                setOverrideCode('');
                setSuccessMsg('');
            }, 1200);
        } else {
            setErrorMsg('INVALID COMPLIANCE SIGNATURE FORCE RE-TRY');
            setOverrideCode('');
        }
    };

    const handleForceBypass = () => {
        setSuccessMsg('EMERGENCY BACKDOOR ENGAGED. FORCE CLEARING LOCKDOWN...');
        setTimeout(() => {
            onCloseLockdown();
            setSuccessMsg('');
        }, 1000);
    };

    return (
        <motion.div 
            id="aetheros-lockdown-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[190] bg-zinc-950/95 backdrop-blur-md border-4 border-rose-600/80 p-6 flex flex-col justify-between overflow-y-auto select-none font-mono"
            style={{
                backgroundImage: 'radial-gradient(ellipse at center, rgba(159,18,57,0.15) 0%, rgba(9,9,11,0.95) 100%)'
            }}
        >
            {/* Ambient Matrix Rain Effect */}
            <MatrixCodeRain pointer-events-none />

            {/* Tech Matrix Decorative Grid Overlays */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#f43f5e_1px,transparent_1px),linear-gradient(to_bottom,#f43f5e_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            {/* Upper Alert Banner */}
            <div className="flex flex-col md:flex-row items-center justify-between border-b-4 border-rose-600 pb-4 gap-4 z-10">
                <div className="flex items-center gap-3">
                    <div id="lockdown-siren-indicator" className="bg-rose-600 p-2.5 rounded-lg text-black animate-ping" style={{ animationDuration: '1.2s' }}>
                        <WarningIcon className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-rose-500 tracking-[0.15em] uppercase flex items-center gap-2">
                            <span>⚠ SYSTEM CONJUNCTION BREACH</span>
                        </span>
                        <span className="text-[9px] text-rose-400/70 font-black tracking-widest mt-0.5">
                            PROTOCOL 0x7E_STASIS_ENGAGED | UNAUTHORIZED INTEGRITY FLUCTUATIONS
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-700/50 px-3 py-1.5 rounded-md flex items-center gap-2 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        ACTIVE EMERGENCY ISOLATION
                    </span>
                </div>
            </div>

            {/* Central Dashboard Layout */}
            <div className="flex-1 min-h-0 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
                
                {/* Left Side: Real-time telemetry values & status metrics */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                    <div className="bg-zinc-950/85 border-2 border-rose-900/60 rounded-xl p-4 flex-1 flex flex-col justify-between backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                        <div>
                            <div className="flex items-center justify-between border-b border-rose-900/50 pb-2 mb-3">
                                <span className="text-xs font-black text-rose-400 tracking-wider flex items-center gap-1.5">
                                    <ActivityIcon className="w-3.5 h-3.5" />
                                    LOCKDOWN TELEMETRY RECORD
                                </span>
                                <span className="text-[8px] text-zinc-500 select-none">T0_FORENSICS</span>
                            </div>

                            <p className="text-[11px] text-rose-300/80 leading-relaxed italic mb-4 p-2.5 bg-rose-950/15 rounded border border-rose-950/40">
                                "The workspace runtime is locked to manual authorization layers. Sub-conjunction routes are frozen. System operator authorization required below."
                            </p>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center p-2 bg-rose-950/10 rounded border border-rose-950/20">
                                    <span className="text-zinc-400 text-[10px]">Acoustic Pressure Hub</span>
                                    <span className="text-rose-400 font-bold tracking-wider">{acousticPressure.toFixed(1)} dB</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-rose-950/10 rounded border border-rose-950/20">
                                    <span className="text-zinc-400 text-[10px]">Total Shard Count</span>
                                    <span className="text-rose-400 font-bold tracking-wider">{shards}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-rose-950/10 rounded border border-rose-950/20">
                                    <span className="text-zinc-400 text-[10px]">Harmonic Conduit Rate</span>
                                    <span className="text-rose-400 font-bold tracking-wider">{(activityDensity * 1.5).toFixed(2)} Hz</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-rose-950/10 rounded border border-rose-950/20">
                                    <span className="text-zinc-400 text-[10px]">Aethel Link Status</span>
                                    <span className="text-rose-500 font-bold tracking-wider animate-pulse">FRACTURED</span>
                                </div>
                            </div>
                        </div>

                        {/* Static visual diagnostic diagram representing reactor */}
                        <div className="mt-4 border border-rose-900/40 p-3 bg-rose-950/5 rounded-lg flex flex-col justify-center items-center">
                            <span className="text-[7.5px] font-bold text-rose-400/60 uppercase tracking-widest mb-1.5">RESONANCE OVERRIDE VECTOR</span>
                            <div className="w-full h-8 flex gap-1 items-end bg-black/40 p-1 rounded border border-rose-950">
                                {Array.from({ length: 18 }).map((_, i) => {
                                    const heightPercent = 20 + Math.sin(i * 0.7 + Date.now()*0.01) * 60;
                                    return (
                                        <div 
                                            key={i} 
                                            className="flex-1 bg-rose-600/75 rounded-t" 
                                            style={{ height: `${heightPercent}%` }} 
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Interactive challenge override keypad validation */}
                <div className="lg:col-span-7 flex flex-col">
                    <form 
                        id="lockdown-override-challenge"
                        onSubmit={handleVerifyOverride} 
                        className="bg-zinc-950/90 border-2 border-rose-600/70 rounded-2xl p-5 flex flex-col gap-4 flex-1 justify-between shadow-[0_0_30px_rgba(244,63,94,0.15)]"
                    >
                        <div>
                            <div className="flex items-center gap-2 border-b border-rose-900/50 pb-2 mb-3">
                                <TerminalIcon className="w-4 h-4 text-rose-500" />
                                <span className="text-xs font-black text-rose-400 tracking-wider">
                                    AETHER COMPLIANCE CHALLENGE DECK
                                </span>
                            </div>

                            {/* Challenge response status notification screen */}
                            <div className="relative bg-black border border-rose-950 p-3 rounded-lg mb-4 text-center overflow-hidden min-h-[48px] flex items-center justify-center">
                                {errorMsg && (
                                    <span className="text-xs font-bold text-rose-500 tracking-wide animate-pulse">{errorMsg}</span>
                                )}
                                {successMsg && (
                                    <span className="text-xs font-bold text-emerald-400 tracking-wide">{successMsg}</span>
                                )}
                                {!errorMsg && !successMsg && (
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest select-none font-bold">Terminal Authentication Prompt</span>
                                        <span className="text-[11px] text-rose-400 select-all font-semibold font-mono mt-0.5">
                                            Hint: Type <span className="text-yellow-400 font-bold bg-yellow-400/10 px-1 rounded">AETHER-999</span> or <span className="text-yellow-400 font-bold bg-yellow-400/10 px-1 rounded">MAESTRO</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Active manual override character display */}
                            <div className="relative">
                                <input
                                    type="text"
                                    id="lockdown-signature-input"
                                    value={overrideCode}
                                    onChange={(e) => {
                                        setErrorMsg('');
                                        setOverrideCode(e.target.value);
                                    }}
                                    placeholder="AWAITING SYSTEM SIGNATURE SIGN-ON"
                                    className="w-full bg-black border-2 border-rose-900/60 rounded-xl p-3.5 pr-10 text-center font-bold tracking-widest text-rose-400 placeholder:text-rose-950/65 uppercase text-xs focus:outline-none focus:border-rose-500"
                                />
                                {overrideCode && (
                                    <button 
                                        type="button"
                                        onClick={handleClearCode}
                                        className="absolute right-3 top-3.5 text-rose-800 hover:text-rose-400 transition-colors"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Numeric & System override keypad */}
                            <div className="grid grid-cols-4 gap-2 mt-4">
                                {['1', '2', '3', 'AETHER-'].map((el) => (
                                    <button
                                        key={el}
                                        type="button"
                                        id={`lockdown-keypad-${el.toLowerCase().replace('-', '')}`}
                                        onClick={() => handleKeypadPress(el)}
                                        className="bg-rose-950/20 hover:bg-rose-950/45 text-rose-400 border border-rose-900/40 p-2.5 rounded-lg font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        {el}
                                    </button>
                                ))}
                                {['4', '5', '6', 'MAESTRO'].map((el) => (
                                    <button
                                        key={el}
                                        type="button"
                                        id={`lockdown-keypad-${el.toLowerCase()}`}
                                        onClick={() => handleKeypadPress(el)}
                                        className="bg-rose-950/20 hover:bg-rose-950/45 text-rose-400 border border-rose-900/40 p-2.5 rounded-lg font-bold text-[10px] hover:scale-[1.02] active:scale-95 transition-all uppercase"
                                    >
                                        {el}
                                    </button>
                                ))}
                                {['7', '8', '9', '999'].map((el) => (
                                    <button
                                        key={el}
                                        type="button"
                                        id={`lockdown-keypad-${el}`}
                                        onClick={() => handleKeypadPress(el)}
                                        className="bg-rose-950/20 hover:bg-rose-950/45 text-rose-400 border border-rose-900/40 p-2.5 rounded-lg font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        {el}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    id="lockdown-keypad-clear"
                                    onClick={handleClearCode}
                                    className="col-span-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 p-2.5 rounded-lg font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    CLEAR
                                </button>
                                <button
                                    type="submit"
                                    id="lockdown-keypad-submit"
                                    className="col-span-2 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-black border border-rose-500 p-2.5 rounded-lg font-black text-xs hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    VERIFY
                                </button>
                            </div>
                        </div>

                        {/* Interactive safety release secondary switch */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-rose-950/40">
                            <button
                                type="button"
                                id="lockdown-btn-force-bypass"
                                onClick={handleForceBypass}
                                className="flex-1 bg-zinc-950 hover:bg-rose-950/30 text-rose-400 border-2 border-rose-950/80 px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:border-rose-800/80"
                                title="Bypass keypad check to instantly release the system lockdown constraints"
                            >
                                <UnlockIcon className="w-3.5 h-3.5" />
                                <span>Core Force Bypass</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Bottom Actions Layout: Retaining and framing core emergency parameters */}
            <div className="border-t-2 border-rose-900/60 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 bg-zinc-950/60 p-4 rounded-xl border border-rose-950/30">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-400 font-bold tracking-wider">ESTOP EMERGENCY CIRCUITS:</span>
                    <button
                        type="button"
                        id="lockdown-emergency-stasis-btn"
                        onClick={isHalted ? onResetHalt : onTriggerHalt}
                        className={`font-mono px-4 py-2.5 rounded-lg border-2 text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                            isHalted 
                                ? 'bg-red-950/80 border-red-600 text-red-500 animate-pulse' 
                                : 'bg-red-600 border-rose-400 text-white hover:bg-rose-700'
                        }`}
                        title={isHalted ? "Resume robotic apertures kinetic logic conduction" : "Instantly sever absolute kinetic apertures"}
                    >
                        {isHalted ? 'RE-ARM STRIDE' : 'FORCE IMMED_ESTOP'}
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Embedded Forensics Export */}
                    <button
                        type="button"
                        id="lockdown-forensics-btn"
                        onClick={onLogBreachData}
                        className="w-full sm:w-auto bg-rose-600/10 hover:bg-rose-600/30 text-rose-400 font-bold px-4 py-2.5 rounded-lg border border-rose-500/40 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                        title="Compile and download a local secure forensics report representing current cracked system states"
                    >
                        <DownloadIcon className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                        <span>Log Forensic Breach Data</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
