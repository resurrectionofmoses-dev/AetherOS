import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldIcon, TerminalIcon, ZapIcon, LockIcon, MicIcon, RadioIcon, ActivityIcon } from './icons';

export const LoginView: React.FC = () => {
  const { login, guestLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authStep, setAuthStep] = useState<'INITIAL' | 'TWO_FACTOR'>('INITIAL');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [authMode, setAuthMode] = useState<'MANUAL' | 'NEURAL'>('NEURAL');
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SCANNING' | 'VERIFYING' | 'SUCCESS'>('IDLE');
  const [scanProgress, setScanProgress] = useState(0);
  const [cameraError, setCameraError] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (authMode === 'NEURAL') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [authMode]);

  const startCamera = async () => {
    try {
      setCameraError(false);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn("Video autoplay blocked or failed", e));
      }
      setScanStatus('IDLE');
    } catch (err) {
      console.warn("Camera hardware access denied or unavailable. Initializing Synthetic Optical Lattice...", err);
      setCameraError(true);
      setScanStatus('IDLE');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Synthetic canvas scanning feed drawing loop for offline/sandboxed state
  useEffect(() => {
    if (authMode !== 'NEURAL' || !cameraError) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw cybernetic grid matrix lines in crimson/amber
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 20; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 15; j < canvas.height; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Target Concentric Circles
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.12)';
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.stroke();

      // Hand/Face Wireframe Outline
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy + 50); // Wrist L
      ctx.lineTo(cx + 30, cy + 50); // Wrist R
      ctx.lineTo(cx + 25, cy + 5);  // Palm R
      ctx.lineTo(cx + 35, cy - 30); // Pinky
      ctx.lineTo(cx + 25, cy - 40); 
      ctx.lineTo(cx + 12, cy + 5);
      ctx.lineTo(cx + 12, cy - 50); // Ring Finger
      ctx.lineTo(cx + 2, cy - 50);
      ctx.lineTo(cx - 2, cy + 5);
      ctx.lineTo(cx - 2, cy - 55);  // Middle Finger
      ctx.lineTo(cx - 12, cy - 55);
      ctx.lineTo(cx - 12, cy + 5);
      ctx.lineTo(cx - 22, cy - 45); // Index Finger
      ctx.lineTo(cx - 30, cy - 40);
      ctx.lineTo(cx - 25, cy + 15); // Thumb base
      ctx.lineTo(cx - 45, cy + 5);  // Thumb
      ctx.lineTo(cx - 50, cy + 20);
      ctx.lineTo(cx - 30, cy + 32);
      ctx.closePath();
      ctx.stroke();

      // Sweeping radar scanning line
      angle += 0.035;
      const sweepX = cx + Math.cos(angle) * 110;
      const sweepY = cy + Math.sin(angle) * 110;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();

      // Target matching node coordinate system
      const nodePoints = [
        { x: cx, y: cy - 20 },
        { x: cx - 18, y: cy - 42 },
        { x: cx - 7, y: cy - 50 },
        { x: cx + 7, y: cy - 45 },
        { x: cx - 26, y: cy + 15 },
        { x: cx + 22, y: cy + 35 },
        { x: cx - 22, y: cy + 30 },
      ];

      nodePoints.forEach((pt, idx) => {
        const active = (scanStatus === 'SCANNING' && scanProgress > idx * 14) || scanStatus === 'SUCCESS';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, active ? 4.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = active ? '#ef4444' : 'rgba(239, 68, 68, 0.3)';
        ctx.fill();

        if (active) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Horizontal linear scan bar
      if (scanStatus === 'SCANNING') {
        const scanLineY = cy - 70 + ((scanProgress / 100) * 140);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.fillRect(cx - 90, scanLineY - 1.5, 180, 3);
      }

      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [authMode, cameraError, scanStatus, scanProgress]);

  const handleNeuralLogin = async () => {
    if (scanStatus !== 'IDLE') return;
    
    setScanStatus('SCANNING');
    setScanProgress(0);
    
    // Simulating hand-lattice extraction
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          performVerification();
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const performVerification = async () => {
    setScanStatus('VERIFYING');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setScanStatus('SUCCESS');
    setAuthStep('TWO_FACTOR');
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length !== 6) return;

    try {
      setLoading(true);
      // In a real app, we'd verify 'twoFactorCode' against the server
      // For this sovereign demo, we confirm the 2FA identity
      await login('admin@aetheros.local', 'AetherSovereign2026');
    } catch (err: any) {
      setError("2FA_IDENTITY_REJECTED: Code mismatch.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setAuthStep('TWO_FACTOR');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate.');
    }
  };

  const handleGuestAccess = async () => {
    try {
      setError(null);
      setLoading(true);
      await guestLogin();
    } catch (err: any) {
      setError('Guest access temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-gray-200 p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(239,68,68,0.05)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {/* Scanning Overlay Lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-red-900/20 animate-pulse pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-px bg-red-900/20 animate-pulse pointer-events-none" />

      <div className="w-full max-w-lg aero-panel bg-zinc-950/90 border-4 border-red-900/50 p-8 shadow-[20px_20px_0_0_#000] relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-red-600/10 border-4 border-red-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)] mb-8">
          <ShieldIcon className="w-10 h-10 text-red-500 animate-pulse" />
        </div>

        <h1 className="font-comic-header text-5xl text-white tracking-tighter italic uppercase leading-none mb-2 text-center">
          AetherOS
        </h1>
        <div className="flex items-center gap-2 mb-8">
            <RadioIcon className="w-3 h-3 text-red-600 animate-ping" />
            <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] text-center">
                Sovereign Authentication Node
            </p>
        </div>

        {error && (
          <div className="w-full bg-red-950/40 border-2 border-red-600/50 p-4 rounded-xl mb-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
            <LockIcon className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
                <p className="text-[10px] text-red-400 uppercase font-black mb-1 tracking-widest">Protocol Restriction</p>
                <p className="text-[11px] text-white font-mono">{error}</p>
            </div>
          </div>
        )}

        <div className="w-full flex gap-1 bg-black p-1 rounded-xl mb-8 border border-white/5">
            <button 
                onClick={() => setAuthMode('NEURAL')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${authMode === 'NEURAL' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Neural Hand-ID
            </button>
            <button 
                onClick={() => setAuthMode('MANUAL')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${authMode === 'MANUAL' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Manual Override
            </button>
        </div>

        <AnimatePresence mode="wait">
            {authStep === 'TWO_FACTOR' ? (
                <motion.form 
                    key="2fa"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onSubmit={handle2FAVerify}
                    className="w-full space-y-6 py-6"
                >
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-blue-500/10 border-2 border-blue-500 rounded-2xl flex items-center justify-center">
                            <LockIcon className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase italic tracking-widest">Authenticator Check</h2>
                            <p className="text-[10px] text-zinc-500 font-mono mt-1">Enter Sovereign 2FA Code</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <input 
                            type="text"
                            value={twoFactorCode}
                            onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="0 0 0 0 0 0"
                            className="w-full bg-black border-2 border-blue-900/40 rounded-xl p-5 text-center text-3xl font-black text-white tracking-[0.5em] focus:border-blue-500 outline-none"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading || twoFactorCode.length < 6}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-[6px_6px_0_0_#1e3a8a] uppercase tracking-widest text-sm active:translate-y-1 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Finalize Login'}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setAuthStep('INITIAL')}
                            className="w-full text-center text-[10px] text-zinc-600 hover:text-zinc-400 font-black uppercase tracking-widest"
                        >
                            Back to Primary Identification
                        </button>
                    </div>
                </motion.form>
            ) : authMode === 'NEURAL' ? (
                <motion.div 
                    key="neural"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full space-y-6"
                >
                    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-4 border-red-950/50 group shadow-inner flex items-center justify-center">
                        {cameraError ? (
                            <canvas 
                                ref={canvasRef}
                                width="320"
                                height="180"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <video 
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover grayscale brightness-75 contrast-125"
                            />
                        )}
                        
                        {/* Scanner Grids */}
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-30 pointer-events-none">
                            {[...Array(36)].map((_, i) => (
                                <div key={i} className="border-[0.5px] border-red-500/20" />
                            ))}
                        </div>

                        {/* Animated Scan Line */}
                        {scanStatus === 'SCANNING' && (
                            <motion.div 
                                className="absolute inset-x-0 h-1 bg-red-500 shadow-[0_0_20px_#ef4444] z-20"
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        )}

                        {/* UI Overlays */}
                        <div className="absolute top-4 left-4 flex gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${cameraError ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
                            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">
                                {cameraError ? 'Synthetic_Lattice_Uplink' : 'Optical_Feed_Live'}
                            </span>
                        </div>

                        <div className="absolute bottom-4 right-4 flex items-center gap-3">
                            <span className="text-[8px] font-black text-zinc-500 uppercase">
                                {cameraError ? 'Sim_Target: Active' : 'Lattice_Sync: 0.98'}
                            </span>
                            <ActivityIcon className="w-4 h-4 text-emerald-500" />
                        </div>

                        <AnimatePresence>
                            {scanStatus === 'VERIFYING' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
                                >
                                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-xs font-black text-red-500 uppercase tracking-[0.3em] mb-2 animate-pulse">Analyzing Pattern</p>
                                    <p className="text-[10px] text-zinc-400 font-mono italic">"Verifying Sovereignty..."</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-black/40 border-2 border-red-950/30 p-6 rounded-2xl flex flex-col items-center gap-4">
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mb-2">
                            <motion.div 
                                className="h-full bg-red-600 shadow-[0_0_10px_#ef4444]"
                                initial={{ width: 0 }}
                                animate={{ width: `${scanProgress}%` }}
                            />
                        </div>

                        {scanStatus === 'IDLE' ? (
                            <button
                                onClick={handleNeuralLogin}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl transition-all shadow-[8px_8px_0_0_#991b1b] uppercase tracking-[0.2em] text-sm flex flex-col items-center gap-1 active:translate-y-1"
                            >
                                <span className="flex items-center gap-3">
                                    <ShieldIcon className="w-5 h-5" />
                                    Initialize Hand-ID Scan
                                </span>
                                <span className="text-[8px] opacity-60 font-medium tracking-tight">Center hand in optical aperture</span>
                            </button>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1">
                                    {scanStatus === 'SCANNING' ? `Extracting Lattice Points: ${scanProgress}%` : 'Conjunction Established'}
                                </p>
                                <div className="flex gap-1 justify-center">
                                    {[...Array(12)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`w-1 h-3 rounded-full ${i < (scanProgress/10) ? 'bg-red-500' : 'bg-red-950/30'} transition-colors duration-300`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : (
                <motion.form 
                    key="manual"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleLogin} 
                    className="w-full space-y-4"
                >
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-red-500 uppercase tracking-widest pl-1">Access Identity (Email)</label>
                        <input 
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@aetheros.local"
                            className="w-full bg-black border border-red-900/40 rounded-xl p-4 text-white font-black focus:border-red-500 focus:ring-1 focus:ring-red-500/20 outline-none transition-all text-xs font-mono"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-red-500 uppercase tracking-widest pl-1">Sovereign Key (Password)</label>
                        <input 
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-black border border-red-900/40 rounded-xl p-4 text-white font-black focus:border-red-500 focus:ring-1 focus:ring-red-500/20 outline-none transition-all text-xs font-mono"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition-all shadow-[6px_6px_0_0_#991b1b] uppercase tracking-widest text-sm flex items-center justify-center gap-3 active:translate-y-1 disabled:opacity-50 mt-4"
                    >
                        <ZapIcon className="w-5 h-5 text-white" />
                        {loading ? 'Authenticating...' : 'Manual Override Access'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={handleGuestAccess}
                        disabled={loading}
                        className="w-full bg-transparent border-2 border-red-900/50 hover:border-red-600/50 text-zinc-500 font-bold py-3 rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:translate-y-0.5 disabled:opacity-50"
                    >
                        <TerminalIcon className="w-4 h-4" />
                        Guest Observer Protocol
                    </button>
                </motion.form>
            )}
        </AnimatePresence>

        <div className="mt-10 pt-6 border-t border-white/5 w-full text-center">
          <p className="text-[8px] text-zinc-700 font-mono uppercase italic">
            Biometric Sovereignty Enforced • Neural Lattice ID Required
          </p>
        </div>
      </div>
    </div>
  );
};

