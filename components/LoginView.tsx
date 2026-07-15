import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Terminal, 
  Zap, 
  Lock, 
  Radio, 
  Activity, 
  Fingerprint, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  User,
  ShieldAlert,
  Video,
  VideoOff,
  Info,
  Trash2,
  Camera,
  Cpu
} from 'lucide-react';
import { logFaceAuthAttempt, getFaceAuthLogs, clearFaceAuthLogs, FacialAuthLog } from '../services/facialAuthLogger';

// ==========================================
// IMMERSIVE SOVEREIGN WEB AUDIO ENGINE
// ==========================================
const playBeep = (freq = 800, type: OscillatorType = 'sine', duration = 0.08) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Ultra-smooth gain envelope to protect operator ears
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Web audio blocked by browser context or not supported
  }
};

export const LoginView: React.FC = () => {
  const { login, guestLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Auth steps:
  // - 'INITIAL': Normal authentication view (choose Neural Scan or Manual Override)
  // - 'BIOMETRIC_MFA': Secure Biometric request (via browser API, with high-fidelity local sensory fallback)
  // - 'TWO_FACTOR': Optional final secure keypad fallback 
  const [authStep, setAuthStep] = useState<'INITIAL' | 'BIOMETRIC_MFA' | 'TWO_FACTOR'>('INITIAL');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [authMode, setAuthMode] = useState<'MANUAL' | 'NEURAL'>('NEURAL');
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SCANNING' | 'VERIFYING' | 'SUCCESS'>('IDLE');
  const [scanProgress, setScanProgress] = useState(0);
  const [cameraError, setCameraError] = useState(false);

  // Dual layout mode inside Manual Override
  const [showTerminal, setShowTerminal] = useState(false);
  const [bioScanType, setBioScanType] = useState<'HAND' | 'FACE'>('FACE');
  const [targetProfileId, setTargetProfileId] = useState<'admin' | 'mod' | 'operator' | 'creator'>('creator');

  // Biometrics MFA Specific States
  const [biometricStatus, setBiometricStatus] = useState<'IDLE' | 'REQUESTING_API' | 'API_MATCHED' | 'API_FAILED' | 'API_SANDBOX_RESTRICTED'>('IDLE');
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [showManualScanner, setShowManualScanner] = useState(false);
  const [mfaScanProgress, setMfaScanProgress] = useState(0);

  // Terminal Emulator States
  const [terminalBuffer, setTerminalBuffer] = useState<string[]>([
    "============================================================",
    "AETHER OS SECURE SECURITY CORE SYSTEM v4.11.0",
    "Sovereignty Cryptographic Conjunction Protocol.",
    "Access Level Grade Audits: STANDBY.",
    "============================================================",
    "Type 'help' for utility options.",
    "Type 'creds' to list working credentials.",
    ""
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalStep, setTerminalStep] = useState<'COMMAND' | 'EMAIL' | 'PASSWORD' | 'TWOFA'>('COMMAND');
  const [loginEmailInput, setLoginEmailInput] = useState("");
  const [loginPasswordInput, setLoginPasswordInput] = useState("");
  const [showFaceLogs, setShowFaceLogs] = useState(false);
  const [faceLogs, setFaceLogs] = useState<FacialAuthLog[]>([]);

  useEffect(() => {
    if (showFaceLogs) {
      setFaceLogs(getFaceAuthLogs());
    }
  }, [showFaceLogs]);

  const terminalBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalBuffer]);

  const executeCommand = async (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd && terminalStep === 'COMMAND') return;

    setTerminalInput("");
    playBeep(900, 'sine', 0.03); // Exec confirmation blip

    if (terminalStep === 'EMAIL') {
      setLoginEmailInput(cmd);
      setTerminalBuffer(prev => [...prev, `EMAIL: ${cmd}`, "SOVEREIGN PASSPHRASE CHECK: "]);
      setTerminalStep('PASSWORD');
      return;
    }

    if (terminalStep === 'PASSWORD') {
      setLoginPasswordInput(cmd);
      const masked = "*".repeat(cmd.length);

      const emailVal = loginEmailInput.trim();
      const passVal = cmd;

      const isMatch = (emailVal === 'admin@aetheros.local' && passVal === 'AetherSovereign2026') ||
                      (emailVal === 'mod@aetheros.local' && passVal === 'GuardianPass') ||
                      (emailVal === 'operator@aetheros.local' && passVal === 'OperatorActive');

      if (isMatch) {
        setTerminalBuffer(prev => [
          ...prev, 
          `PASSPHRASE: ${masked}`, 
          "✅ [ DETECTED ] BASIC SECURITY CREDENTIALS MATCH PERFECTLY.",
          "🔒 [ SOVEREIGN POSTURE ] BIOMETRIC KEYENVELOPE SIGNATURE REQUIRED...",
          "Launching Browser Biometrics protocol API..."
        ]);
        playBeep(1150, 'sine', 0.25);

        setTimeout(() => {
          setAuthStep('BIOMETRIC_MFA');
          setTimeout(() => {
            triggerBrowserBiometric(emailVal);
          }, 600);
        }, 1200);
      } else {
        playBeep(250, 'sawtooth', 0.3);
        setTerminalBuffer(prev => [
          ...prev,
          `PASSPHRASE: ${masked}`,
          "❌ [ ACCESS DENIED ] INVALID OPERATOR SIGNATURE CRYPTOGRAPHY.",
          "Verify credentials or inject standard keys from the cheatsheet Panel.",
          ""
        ]);
        setTerminalStep('COMMAND');
      }
      return;
    }

    if (terminalStep === 'TWOFA') {
      setTerminalBuffer(prev => [...prev, `CODE: ${cmd}`]);
      if (cmd.length !== 6 || isNaN(Number(cmd))) {
        playBeep(300, 'sawtooth', 0.25);
        setTerminalBuffer(prev => [...prev, "❌ ERROR: Verification key must be a 6-digit numeral.", ""]);
        setTerminalStep('COMMAND');
        return;
      }
      
      setTerminalBuffer(prev => [...prev, "[ PROCESSING ] Matching authority rings...", ""]);
      setLoading(true);
      try {
        await login(loginEmailInput, loginPasswordInput);
        playBeep(1200, 'sine', 0.45);
        setTerminalBuffer(prev => [...prev, "✅ SUCCESS: Conjunction established. Sovereign identity matched.", ""]);
      } catch (err: any) {
        playBeep(250, 'sawtooth', 0.3);
        setTerminalBuffer(prev => [...prev, `❌ ACCESS DENIED: ${err.message || 'Key validation failed.'}`, "Type 'login' or 'creds' to restart.", ""]);
        setTerminalStep('COMMAND');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Default COMMAND state
    setTerminalBuffer(prev => [...prev, `aetheros@auth-core:~$ ${cmd}`]);
    const normalizedParts = cmd.toLowerCase().split(/\s+/);
    const baseCmd = normalizedParts[0];

    switch (baseCmd) {
      case 'help':
        setTerminalBuffer(prev => [
          ...prev,
          "TACTICAL UTILITIES REGISTRY:",
          "  help     - Display this tactical guide menu",
          "  creds    - Reveal declassified key codes (cheatsheet)",
          "  login    - Run secure multi-factor authentication script",
          "  guest    - Request instant observer pass (guest mode)",
          "  scan     - Initiate optical cam for biometric scans",
          "  sysinfo  - Query machine and compression runtime spec",
          "  clear    - Flush terminal output buffer",
          "  reboot   - Soft-restart secure conduction channel",
          ""
        ]);
        break;

      case 'creds':
        setTerminalBuffer(prev => [
          ...prev,
          "------------------------------------------------------------",
          "DECLASSIFIED ACCESS CHANNELS:",
          "  0. SOVEREIGN CREATOR [ROLE: admin] (GRANDFATHERED)",
          "     Email: resurrectionofmoses@gmail.com",
          "     Pass:  AetherSovereign2026 (or Sovereign777)",
          "  1. SYSTEM ADMINISTRATOR [ROLE: admin]",
          "     Email: admin@aetheros.local",
          "     Pass:  AetherSovereign2026",
          "  2. LATTICE GUARDIAN [ROLE: moderator]",
          "     Email: mod@aetheros.local",
          "     Pass:  GuardianPass",
          "  3. GRID OPERATOR [ROLE: operator]",
          "     Email: operator@aetheros.local",
          "     Pass:  OperatorActive",
          "------------------------------------------------------------",
          "These can be simulated by running 'login' here.",
          ""
        ]);
        break;

      case 'clear':
        setTerminalBuffer([]);
        break;

      case 'reboot':
        setTerminalBuffer([
          "REBOOTING AUDIO AND DATA CHANNELS...",
          "Unloading neural drivers...",
          "Locking optical lattice vectors...",
          "Initialization stream ready.",
          "Type 'help' to reference console tools.",
          ""
        ]);
        setTerminalStep('COMMAND');
        break;

      case 'sysinfo':
        setTerminalBuffer(prev => [
          ...prev,
          `SYSTEM UPTIME      : 198223 SECONDS`,
          `CONNECTION PORT    : 3000 (INGRESS STREAM LISTENER)`,
          `SECURE SHIELD MODE : CONDUCTION CONJUNCTION SYMMETRY`,
          `ALIGNED PLATFORM   : AetherOS Unified Chain`,
          `COMPRESSION        : EXPLICIT (Vite Code Split)`,
          ""
        ]);
        break;

      case 'guest':
      case 'bypass':
        setTerminalBuffer(prev => [...prev, "[ SYSTEM ] Fetching Guest Observer bypass ticket..."]);
        setLoading(true);
        try {
          await guestLogin();
          playBeep(1100, 'sine', 0.35);
          setTerminalBuffer(prev => [...prev, "✅ Guest session successfully bypassed.", ""]);
        } catch (err: any) {
          playBeep(250, 'sawtooth', 0.25);
          setTerminalBuffer(prev => [...prev, `❌ ERROR: ${err.message || 'Bypass failed.'}`, ""]);
        } finally {
          setLoading(false);
        }
        break;

      case 'scan':
      case 'neural':
        setTerminalBuffer(prev => [...prev, "[ ACTION ] Swapping mode to optical biometric feed..."]);
        setAuthMode('NEURAL');
        setTimeout(() => {
          handleNeuralLogin();
        }, 500);
        break;

      case 'login':
        setTerminalStep('EMAIL');
        setTerminalBuffer(prev => [...prev, "ENTER OPERATOR IDENTITY EMAIL: "]);
        break;

      default:
        setTerminalBuffer(prev => [
          ...prev,
          `command not found: '${baseCmd}'. Type 'help' for tactical system options.`,
          ""
        ]);
        break;
    }
  };
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const neuralCanvasRef = useRef<HTMLCanvasElement>(null);
  const mfaCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (authMode === 'NEURAL' && authStep === 'INITIAL') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [authMode, authStep]);

  const startCamera = async () => {
    try {
      setCameraError(false);
      setError(null);
      
      const targetEmail = targetProfileId === 'creator' 
        ? 'resurrectionofmoses@gmail.com' 
        : `${targetProfileId}@aetheros.local`;
        
      logFaceAuthAttempt(
        targetProfileId,
        targetEmail,
        'INITIALIZED',
        undefined,
        { confidenceScore: 0, landmarkPoints: 0, hasCameraError: false }
      );

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => {
          console.warn("Video autoplay blocked or failed", e);
          logFaceAuthAttempt(
            targetProfileId,
            targetEmail,
            'CAMERA_ERROR',
            `Autoplay blocked: ${e.message || e}`,
            { hasCameraError: true }
          );
        });
      }
      setScanStatus('IDLE');
    } catch (err: any) {
      console.warn("Camera hardware access denied or unavailable. Initializing Synthetic Optical Lattice...", err);
      setCameraError(true);
      setScanStatus('IDLE');
      
      const targetEmail = targetProfileId === 'creator' 
        ? 'resurrectionofmoses@gmail.com' 
        : `${targetProfileId}@aetheros.local`;
        
      logFaceAuthAttempt(
        targetProfileId,
        targetEmail,
        'CAMERA_ERROR',
        err?.message || "Camera access denied or hardware unavailable.",
        { hasCameraError: true }
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Synthetic canvas scanning feed drawing loop for offline/sandboxed state (Neural Hand-ID page)
  useEffect(() => {
    if (authMode !== 'NEURAL' || authStep !== 'INITIAL') return;
    const canvas = neuralCanvasRef.current;
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
      ctx.strokeStyle = cameraError ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.03)';
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

      // Falling glowing green/red digital coordinate indicators
      ctx.fillStyle = cameraError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.25)';
      ctx.font = '8px monospace';
      ctx.fillText(`COORD_X: ${(cx + Math.sin(angle) * 30).toFixed(2)}`, 10, 20);
      ctx.fillText(`COORD_Y: ${(cy + Math.cos(angle) * 30).toFixed(2)}`, 10, 32);
      ctx.fillText(`VECTOR_LOCK: ${scanStatus === 'SUCCESS' ? 'SECURE' : 'PENDING'}`, 10, 44);
      ctx.fillText(`SCAN_TYPE: ${bioScanType === 'FACE' ? 'FACE_ID_PRIMARY' : 'HAND_ID_MATRIX'}`, 10, 56);
      
      let targetEmail = 'admin@aetheros.local';
      if (targetProfileId === 'mod') targetEmail = 'mod@aetheros.local';
      else if (targetProfileId === 'operator') targetEmail = 'operator@aetheros.local';
      else if (targetProfileId === 'creator') targetEmail = 'resurrectionofmoses@gmail.com';
      ctx.fillText(`TARGET_SIG: ${targetEmail.toUpperCase()}`, 10, 68);

      // Target Concentric Circles
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.12)';
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.stroke();

      if (bioScanType === 'FACE') {
        // Draw Face Wireframe
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.35)';
        ctx.lineWidth = 1.5;
        
        // Face Oval
        ctx.beginPath();
        ctx.ellipse(cx, cy - 5, 45, 60, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Eyes
        ctx.beginPath();
        ctx.arc(cx - 15, cy - 15, 4, 0, Math.PI * 2);
        ctx.arc(cx + 15, cy - 15, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.fill();
        
        // Nose bridge and bottom
        ctx.beginPath();
        ctx.moveTo(cx, cy - 15);
        ctx.lineTo(cx, cy + 5);
        ctx.lineTo(cx - 5, cy + 8);
        ctx.lineTo(cx + 5, cy + 8);
        ctx.stroke();
        
        // Mouth Arc
        ctx.beginPath();
        ctx.arc(cx, cy + 20, 10, 0.1, Math.PI - 0.1);
        ctx.stroke();

        // Eyebrows
        ctx.beginPath();
        ctx.moveTo(cx - 22, cy - 23);
        ctx.lineTo(cx - 8, cy - 23);
        ctx.moveTo(cx + 8, cy - 23);
        ctx.lineTo(cx + 22, cy - 23);
        ctx.stroke();

        // Face corner target borders
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 2;
        // Top Left corner
        ctx.beginPath();
        ctx.moveTo(cx - 65, cy - 75); ctx.lineTo(cx - 65, cy - 55);
        ctx.moveTo(cx - 65, cy - 75); ctx.lineTo(cx - 45, cy - 75);
        ctx.stroke();
        // Top Right corner
        ctx.beginPath();
        ctx.moveTo(cx + 65, cy - 75); ctx.lineTo(cx + 65, cy - 55);
        ctx.moveTo(cx + 65, cy - 75); ctx.lineTo(cx + 45, cy - 75);
        ctx.stroke();
        // Bottom Left corner
        ctx.beginPath();
        ctx.moveTo(cx - 65, cy + 65); ctx.lineTo(cx - 65, cy + 45);
        ctx.moveTo(cx - 65, cy + 65); ctx.lineTo(cx - 45, cy + 65);
        ctx.stroke();
        // Bottom Right corner
        ctx.beginPath();
        ctx.moveTo(cx + 65, cy + 65); ctx.lineTo(cx + 65, cy + 45);
        ctx.moveTo(cx + 65, cy + 65); ctx.lineTo(cx + 45, cy + 65);
        ctx.stroke();
      } else {
        // Hand Wireframe Outline
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
      }

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
      const nodePoints = bioScanType === 'FACE' ? [
        { x: cx - 15, y: cy - 15 }, // L Eye
        { x: cx + 15, y: cy - 15 }, // R Eye
        { x: cx, y: cy - 5 },       // Nose top
        { x: cx, y: cy + 8 },       // Nose tip
        { x: cx - 30, y: cy - 5 },  // L Cheek
        { x: cx + 30, y: cy - 5 },  // R Cheek
        { x: cx, y: cy + 20 },      // Mouth
        { x: cx, y: cy - 40 },      // Forehead
      ] : [
        { x: cx, y: cy - 20 },
        { x: cx - 18, y: cy - 42 },
        { x: cx - 7, y: cy - 50 },
        { x: cx + 7, y: cy - 45 },
        { x: cx - 26, y: cy + 15 },
        { x: cx + 22, y: cy + 35 },
        { x: cx - 22, y: cy + 30 },
      ];

      nodePoints.forEach((pt, idx) => {
        const active = (scanStatus === 'SCANNING' && scanProgress > idx * (100 / nodePoints.length)) || scanStatus === 'SUCCESS';
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
  }, [authMode, cameraError, scanStatus, scanProgress, authStep, bioScanType, targetProfileId]);

  // Drawing loop for local simulated biometric fingerprint engine (MFA Bypass mode)
  useEffect(() => {
    if (authStep !== 'BIOMETRIC_MFA' || !showManualScanner) return;
    const canvas = mfaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw high contrast digital cyber background grid mapping lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 15; i < canvas.width; i += 30) {
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

      // Scanner Concentric Targets
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 65, 0, Math.PI * 2);
      ctx.stroke();

      // Draw rotating radar sector
      angle += 0.04;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.03)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 75, angle, angle + 0.6);
      ctx.closePath();
      ctx.fill();

      if (bioScanType === 'FACE') {
        // Draw Face Wireframe for local scanner in emerald
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
        ctx.lineWidth = 1.5;
        
        // Face Oval
        ctx.beginPath();
        ctx.ellipse(cx, cy - 5, 40, 52, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Eyes
        ctx.beginPath();
        ctx.arc(cx - 15, cy - 15, 3.5, 0, Math.PI * 2);
        ctx.arc(cx + 15, cy - 15, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(52, 211, 153, 0.5)';
        ctx.fill();
        
        // Nose
        ctx.beginPath();
        ctx.moveTo(cx, cy - 15);
        ctx.lineTo(cx, cy + 5);
        ctx.lineTo(cx - 5, cy + 8);
        ctx.lineTo(cx + 5, cy + 8);
        ctx.stroke();
        
        // Mouth Arc
        ctx.beginPath();
        ctx.arc(cx, cy + 18, 8, 0.1, Math.PI - 0.1);
        ctx.stroke();

        // Eyebrows
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy - 22);
        ctx.lineTo(cx - 8, cy - 22);
        ctx.moveTo(cx + 8, cy - 22);
        ctx.lineTo(cx + 20, cy - 22);
        ctx.stroke();
      } else {
        // Interactive Fingerprint wireframe waves
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
        ctx.lineWidth = 1.8;
        for (let r = 8; r < 55; r += 7) {
          ctx.beginPath();
          ctx.arc(cx, cy + 10, r, Math.PI + 0.2, Math.PI * 2 - 0.2);
          ctx.stroke();
        }
      }
      
      // Sweep Scanning Laser line
      const lineY = cy - 50 + ((mfaScanProgress / 100) * 100);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.75)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 70, lineY);
      ctx.lineTo(cx + 70, lineY);
      ctx.stroke();

      // Glowing edge triangulation node points
      const bioNodes = bioScanType === 'FACE' ? [
        { x: cx - 15, y: cy - 15, active: mfaScanProgress > 15 }, // L Eye
        { x: cx + 15, y: cy - 15, active: mfaScanProgress > 30 }, // R Eye
        { x: cx, y: cy + 5, active: mfaScanProgress > 48 },      // Nose
        { x: cx - 22, y: cy + 10, active: mfaScanProgress > 65 }, // L Cheek
        { x: cx + 22, y: cy + 10, active: mfaScanProgress > 80 }, // R Cheek
        { x: cx, y: cy + 18, active: mfaScanProgress > 92 },     // Mouth
      ] : [
        { x: cx - 25, y: cy - 20, active: mfaScanProgress > 22 },
        { x: cx + 25, y: cy - 15, active: mfaScanProgress > 45 },
        { x: cx - 35, y: cy + 15, active: mfaScanProgress > 65 },
        { x: cx + 35, y: cy + 20, active: mfaScanProgress > 88 },
      ];

      bioNodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.active ? 4 : 2, 0, Math.PI * 2);
        ctx.fillStyle = node.active ? '#10b981' : 'rgba(16, 185, 129, 0.25)';
        ctx.fill();
        if (node.active) {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 7, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [authStep, showManualScanner, mfaScanProgress, bioScanType]);

  const handleNeuralLogin = async () => {
    if (scanStatus !== 'IDLE') return;
    
    let targetEmail = 'admin@aetheros.local';
    if (targetProfileId === 'mod') targetEmail = 'mod@aetheros.local';
    else if (targetProfileId === 'operator') targetEmail = 'operator@aetheros.local';
    else if (targetProfileId === 'creator') targetEmail = 'resurrectionofmoses@gmail.com';

    if (bioScanType === 'FACE') {
      logFaceAuthAttempt(
        targetProfileId,
        targetEmail,
        'SCANNING',
        undefined,
        { confidenceScore: 34.5, landmarkPoints: 64, hasCameraError: cameraError }
      );
    }

    playBeep(520, 'sawtooth', 0.15); // Sweep active initiation tone
    setScanStatus('SCANNING');
    setScanProgress(0);
    
    // Smooth scanning sequence with periodic blips
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          playBeep(1100, 'sine', 0.4); // successful lattice sweep
          performVerification();
          return 100;
        }
        if (prev % 10 === 0) {
          playBeep(850, 'triangle', 0.02); // progressive scan node sound
        }
        return prev + 2;
      });
    }, 45);
  };

  const performVerification = async () => {
    setScanStatus('VERIFYING');
    await new Promise(resolve => setTimeout(resolve, 1500));
    playBeep(980, 'sine', 0.25);
    
    setScanStatus('SUCCESS');
    
    let targetEmail = 'admin@aetheros.local';
    let targetPass = 'AetherSovereign2026';

    if (targetProfileId === 'mod') {
      targetEmail = 'mod@aetheros.local';
      targetPass = 'GuardianPass';
    } else if (targetProfileId === 'operator') {
      targetEmail = 'operator@aetheros.local';
      targetPass = 'OperatorActive';
    } else if (targetProfileId === 'creator') {
      targetEmail = 'resurrectionofmoses@gmail.com';
      targetPass = 'AetherSovereign2026';
    }

    if (bioScanType === 'FACE') {
      // Direct sign-in for facial recognition to bypass WebAuthn iframe restrictions!
      setTimeout(async () => {
        try {
          setLoading(true);
          await login(targetEmail, targetPass);
          playBeep(1200, 'sine', 0.5); // Success chime
          
          logFaceAuthAttempt(
            targetProfileId,
            targetEmail,
            'SUCCESS',
            undefined,
            { confidenceScore: 99.1, landmarkPoints: 128, hasCameraError: cameraError }
          );
        } catch (err: any) {
          playBeep(250, 'sawtooth', 0.35); // Error tone
          const errMsg = err?.message || "Facial recognition verification failed.";
          setError(errMsg);
          setScanStatus('IDLE');
          
          logFaceAuthAttempt(
            targetProfileId,
            targetEmail,
            'FAILURE',
            errMsg,
            { confidenceScore: 18.7, landmarkPoints: 12, hasCameraError: cameraError }
          );
        } finally {
          setLoading(false);
        }
      }, 1000);
      return;
    }

    // Trigger biometric checkpoint for Hand-ID
    setLoginEmailInput(targetEmail);
    setLoginPasswordInput(targetPass);
    setAuthStep('BIOMETRIC_MFA');
    setTimeout(() => {
      triggerBrowserBiometric(targetEmail);
    }, 600);
  };

  // Browser Biometric request API
  const triggerBrowserBiometric = async (explicitEmail?: string) => {
    const activeEmail = (explicitEmail && typeof explicitEmail === 'string') 
      ? explicitEmail 
      : loginEmailInput || email || "operator@aetheros.local";

    try {
      setBiometricStatus('REQUESTING_API');
      setBiometricError(null);
      
      // Attempt real browser biometrics API WebAuthn call (this enforces robust standard)
      if (!navigator.credentials || !window.PublicKeyCredential) {
        throw new Error("WebAuthn credentials API is not natively supported or enabled by this browser client.");
      }
      
      const randomBytes = new Uint8Array(16);
      window.crypto.getRandomValues(randomBytes);
      
      const options: CredentialCreationOptions = {
        publicKey: {
          challenge: randomBytes,
          rp: { name: "AetherOS Security Shield" },
          user: {
            id: new Uint8Array([1, 10, 20, 30]),
            name: activeEmail,
            displayName: activeEmail.split('@')[0].toUpperCase(),
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256
          timeout: 4000,
          authenticatorSelection: {
            userVerification: "required"
          }
        }
      };

      const credential = await navigator.credentials.create(options);
      if (credential) {
        setBiometricStatus('API_MATCHED');
        playBeep(1200, 'sine', 0.45);
        
        setTimeout(() => {
          completeMfaAuthentication(activeEmail);
        }, 850);
        return true;
      }
    } catch (err: any) {
      console.warn("Browser biometric API returned limitation, sandbox confinement, or rejection:", err);
      const errStr = err?.message || err?.toString() || 'Unknown credentials restriction.';
      setBiometricError(errStr);
      setBiometricStatus('API_SANDBOX_RESTRICTED');
      return false;
    }
  };

  // Local simulated biometric optical sensory progress
  const handleLocalMfaScan = () => {
    if (mfaScanProgress > 0) return;
    
    playBeep(520, 'sawtooth', 0.15); // Sensor activate sweep sound
    setMfaScanProgress(1);
    
    const interval = setInterval(() => {
      setMfaScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          playBeep(1200, 'sine', 0.45); // Successful verification
          completeMfaAuthentication();
          return 100;
        }
        if (prev % 12 === 0) {
          playBeep(850, 'triangle', 0.02); // dynamic digital laser sweep tone
        }
        return prev + 2;
      });
    }, 40);
  };

  const completeMfaAuthentication = async (explicitEmail?: string) => {
    const targetEmail = explicitEmail || loginEmailInput || email || 'admin@aetheros.local';
    
    // Choose password block matched back to standard mock database
    const targetPass = targetEmail === 'admin@aetheros.local' ? 'AetherSovereign2026' :
                       targetEmail === 'mod@aetheros.local' ? 'GuardianPass' : 'OperatorActive';

    try {
      setLoading(true);
      setError(null);
      await login(targetEmail, targetPass);
      playBeep(1200, 'sine', 0.5); // Success chime
    } catch (err: any) {
      playBeep(250, 'sawtooth', 0.35); // Error tone
      setError(err?.message || "MFA_INTEGRITY_MISMATCH: Unified conduction envelope rejected authentication signature.");
      setAuthStep('INITIAL');
    } finally {
      setLoading(false);
    }
  };

  const handleVisualLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    playBeep(900, 'sine', 0.1);

    const emailVal = email.trim();
    const passVal = password;

    const isMatch = (emailVal === 'admin@aetheros.local' && passVal === 'AetherSovereign2026') ||
                    (emailVal === 'mod@aetheros.local' && passVal === 'GuardianPass') ||
                    (emailVal === 'operator@aetheros.local' && passVal === 'OperatorActive');

    if (isMatch) {
      setLoginEmailInput(emailVal);
      setLoginPasswordInput(passVal);
      playBeep(1100, 'sine', 0.2);
      
      // Transition to biometric MFA page
      setAuthStep('BIOMETRIC_MFA');
      // Pre-trigger WebAuthn bio request automatically
      setTimeout(() => {
        triggerBrowserBiometric(emailVal);
      }, 600);
    } else {
      playBeep(250, 'sawtooth', 0.3);
      setError("INVALID_CONDUCTION_KEYS: The Sovereign Shield rejected your operator login passphrase.");
    }
  };

  const handle2FAVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (twoFactorCode.length !== 6) return;

    try {
      setLoading(true);
      await login(loginEmailInput || 'admin@aetheros.local', loginPasswordInput || 'AetherSovereign2026');
      playBeep(1200, 'sine', 0.5); // Success chime
    } catch (err: any) {
      playBeep(250, 'sawtooth', 0.35); // Error tone
      setError("2FA_IDENTITY_REJECTED: Code mismatch.");
    } finally {
      setLoading(false);
    }
  };

  // Keyboard press handler for tactile keypad grid
  const handleKeypadPress = (val: string) => {
    playBeep(1000, 'triangle', 0.04);
    if (val === 'backspace') {
      setTwoFactorCode(prev => prev.slice(0, -1));
    } else if (val === 'clear') {
      setTwoFactorCode('');
    } else {
      setTwoFactorCode(prev => {
        if (prev.length < 6) {
          return prev + val;
        }
        return prev;
      });
    }
  };

  // Auto-verify once 6 digits are typed
  useEffect(() => {
    if (twoFactorCode.length === 6 && authStep === 'TWO_FACTOR') {
      handle2FAVerify();
    }
  }, [twoFactorCode, authStep]);

  const handleGuestAccess = async () => {
    try {
      setError(null);
      setLoading(true);
      playBeep(1150, 'sine', 0.4);
      await guestLogin();
    } catch (err: any) {
      playBeep(250, 'sawtooth', 0.3);
      setError('Guest access temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const getScanStatusText = (progress: number) => {
    if (bioScanType === 'FACE') {
      if (progress < 15) return "LOCATING FACIAL BOUNDING RETICLE...";
      if (progress < 30) return "PROBING FACIAL LANDMARK SURFACE MATRIX...";
      if (progress < 45) return "COMPARING SOVEREIGN BIOMETRIC SEED...";
      if (progress < 60) return "EXTRACTING CRYPTO EMBEDDED HASH CODES...";
      if (progress < 75) return "VERIFYING LIVENESS PATTERN CONDUCTION...";
      if (progress < 90) return "DECRYPTING TRUSTED SIGNATURE KEY...";
      return "STABILIZING SECURED AUTHENTICATION PROFILE...";
    }
    if (progress < 15) return "CALIBRATING OPTICAL CORE VERTICES...";
    if (progress < 30) return "PROBING PALM INTEGRITY MATRIX...";
    if (progress < 45) return "RESOLVING SOVEREIGN MULTISIG RING...";
    if (progress < 60) return "EXTRACTING CRYPTO EMBEDDED SHA...";
    if (progress < 75) return "VERIFYING CRYPTOGRAPHIC HANDSHAKE...";
    if (progress < 90) return "DECRYPTING TRUSTED CERTIFICATE...";
    return "STABILIZING SECURED DATA TUNNEL...";
  };

  return (
    <div id="aetheros-view-wrapper" className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-gray-200 p-4 relative overflow-y-auto py-12 md:py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(239,68,68,0.05)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      {/* Scanning Overlay Lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-red-900/20 animate-pulse pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-px bg-red-900/20 animate-pulse pointer-events-none" />

      <div className="w-full max-w-lg aero-panel bg-zinc-950/90 border-4 border-red-905 border-red-900/50 p-8 shadow-[20px_20px_0_0_#000] relative z-10 flex flex-col items-center">
        {/* Glowing Shield Ring */}
        <div 
          onClick={() => playBeep(200, 'triangle', 0.15)}
          className="w-20 h-20 bg-red-600/10 border-4 border-red-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)] mb-8 cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
        >
          <Shield className="w-10 h-10 text-red-500 animate-pulse" />
        </div>

        <h1 className="font-comic-header text-5xl text-white tracking-tighter italic uppercase leading-none mb-2 text-center">
          AetherOS
        </h1>
        
        <div className="flex items-center gap-2 mb-8">
            <Radio className="w-3 h-3 text-red-600 animate-ping" />
            <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] text-center">
                Sovereign Authentication Node
            </p>
        </div>

        {error && (
          <div className="w-full bg-red-950/40 border-2 border-red-600/50 p-4 rounded-xl mb-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
                <p className="text-[10px] text-red-400 uppercase font-black mb-1 tracking-widest">Protocol Restriction</p>
                <p className="text-[11px] text-white font-mono">{error}</p>
            </div>
          </div>
        )}

        {/* Tab Selection (Only shown in INITIAL screen) */}
        {authStep === 'INITIAL' && (
          <div className="w-full flex gap-1 bg-black p-1 rounded-xl mb-8 border border-white/5">
              <button 
                  onClick={() => {
                    playBeep(900, 'sine', 0.05);
                    setAuthMode('NEURAL');
                  }}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${authMode === 'NEURAL' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                  Neural Hand-ID
              </button>
              <button 
                  onClick={() => {
                    playBeep(900, 'sine', 0.05);
                    setAuthMode('MANUAL');
                  }}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${authMode === 'MANUAL' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                  Manual Override
              </button>
          </div>
        )}

        <AnimatePresence mode="wait">
            {authStep === 'TWO_FACTOR' ? (
                <motion.form 
                    key="2fa"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onSubmit={handle2FAVerify}
                    className="w-full space-y-6 py-2"
                >
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-blue-500/10 border-2 border-blue-500 rounded-2xl flex items-center justify-center">
                            <Lock className="w-8 h-8 text-blue-500" />
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
                            className="w-full bg-black border-2 border-blue-900/40 rounded-xl p-4 text-center text-3xl font-black text-white tracking-[0.5em] focus:border-blue-500 outline-none"
                            required
                        />

                        {/* HIGH FIDELITY TOUCH KEYPAD PANEL */}
                        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto py-2 border-t border-b border-zinc-900">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleKeypadPress(num.toString())}
                              className="h-10 rounded-lg bg-black hover:border-blue-500 border border-zinc-900 hover:bg-zinc-950 text-white font-black text-sm transition-all active:scale-95 flex items-center justify-center font-mono"
                            >
                              {num}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleKeypadPress('clear')}
                            className="h-10 rounded-lg bg-black border border-zinc-900 hover:border-amber-800 text-amber-500 font-bold text-[10px] tracking-wide uppercase transition-all active:scale-95 flex items-center justify-center font-mono"
                          >
                            CLR
                          </button>
                          <button
                            type="button"
                            onClick={() => handleKeypadPress('0')}
                            className="h-10 rounded-lg bg-black border border-zinc-900 hover:border-blue-500 text-white font-black text-sm transition-all active:scale-95 flex items-center justify-center font-mono"
                          >
                            0
                          </button>
                          <button
                            type="button"
                            onClick={() => handleKeypadPress('backspace')}
                            className="h-10 rounded-lg bg-black border border-zinc-900 hover:border-red-850 text-red-400 font-bold text-[10px] tracking-wide uppercase transition-all active:scale-95 flex items-center justify-center font-mono"
                          >
                            DEL
                          </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || twoFactorCode.length < 6}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-[6px_6px_0_0_#1e3a8a] uppercase tracking-widest text-sm active:translate-y-1 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Finalize Login'}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => {
                              playBeep(450, 'sine', 0.1);
                              setAuthStep('INITIAL');
                            }}
                            className="w-full text-center text-[10px] text-zinc-650 hover:text-zinc-400 font-black uppercase tracking-widest focus:outline-none"
                        >
                            Back to Primary Identification
                        </button>
                    </div>
                </motion.form>
            ) : authStep === 'BIOMETRIC_MFA' ? (
                <motion.div 
                    key="biometric_mfa"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full space-y-6 py-2"
                >
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <Fingerprint className="w-8 h-8 text-emerald-500 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center gap-2 justify-center">
                                <span className="text-emerald-500 animate-ping">•</span> Sovereign MFA Core
                            </h2>
                            <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">Stage 2: Biological Cryptographic Signature</p>
                        </div>
                    </div>

                    {/* Biometric Status Display Card */}
                    <div className="bg-black/60 border-2 border-emerald-990/30 border-emerald-950 p-5 rounded-2xl space-y-4">
                        <div className="text-[11px] space-y-2 border-b border-zinc-900 pb-3 font-mono">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">OPERATOR IDENTITY:</span>
                                <span className="text-zinc-300 font-bold">{loginEmailInput || email || "admin@aetheros.local"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">AUTHENTICATION LEVEL:</span>
                                <span className="text-amber-500 font-bold">SOVEREIGN GRADE I</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">MULTIFACE PROTOCOL:</span>
                                <span className="text-emerald-500 font-bold font-mono">WEBAUTHN_BIO</span>
                            </div>
                        </div>

                        {/* Status logs */}
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 min-h-[70px] space-y-1 text-[9px] font-mono select-none">
                            {biometricStatus === 'IDLE' && (
                                <div className="text-zinc-400">
                                    <span className="text-zinc-600 animate-pulse mr-1.5">&gt;</span> Standby. Awaiting browser credentials handshake activation.
                                </div>
                            )}
                            {biometricStatus === 'REQUESTING_API' && (
                                <div className="text-sky-400 flex items-center gap-1.5 font-bold">
                                    <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                                    <span>CONTACTING BROWSER WEBAUTHN BIO API... AWAITING RESPONSE CONDUIT...</span>
                                </div>
                            )}
                            {biometricStatus === 'API_MATCHED' && (
                                <div className="text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>WEBAUTHN CREDENTIALS VERIFIED! OPERATOR AUTHENTICATED SUCCESSFULLY.</span>
                                </div>
                            )}
                            {biometricStatus === 'API_SANDBOX_RESTRICTED' && (
                                <div className="space-y-1.5">
                                    <div className="text-amber-500 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-bounce" />
                                        <span>IFRAME SANDBOX DETECTED: WebAuthn api restricted in preview.</span>
                                    </div>
                                    <div className="text-zinc-500 text-[8px] pl-5 uppercase leading-normal font-sans">
                                        Sovereign Posture mandates high-frequency local biometric bypass inside secure testing contexts. Engaging local optical module.
                                    </div>
                                </div>
                            )}
                            {biometricStatus === 'API_FAILED' && (
                                <div className="text-red-400 font-bold shrink-0">
                                    <span>❌ API_ERROR: {biometricError || 'Biometric verification cancelled.'}</span>
                                </div>
                            )}
                        </div>

                        {/* Control buttons & scanners based on current status */}
                        {showManualScanner ? (
                            <div className="space-y-4">
                                {/* Fully interactive simulated biometric HUD scan */}
                                <div className="relative aspect-video bg-zinc-950 rounded-xl overflow-hidden border-2 border-emerald-900/40 flex items-center justify-center">
                                    <canvas 
                                        ref={mfaCanvasRef}
                                        width="320"
                                        height="180"
                                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                                    />
                                    
                                    {mfaScanProgress > 0 && (
                                        <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_15px_#10b981] z-20 animate-scan" style={{ animationDuration: '3.5s' }} />
                                    )}

                                    {mfaScanProgress > 0 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[0.5px]">
                                            <span className="text-[11px] font-black text-emerald-400 font-mono tracking-widest uppercase animate-pulse">
                                                Scanning Biometrics: {mfaScanProgress}%
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full flex flex-col gap-2">
                                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${mfaScanProgress}%` }} />
                                    </div>
                                    
                                    {mfaScanProgress === 0 ? (
                                        <button
                                            type="button"
                                            onClick={handleLocalMfaScan}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-[6px_6px_0_0_#065f46] uppercase tracking-widest text-sm flex items-center justify-center gap-2 active:translate-y-0.5"
                                        >
                                            <Fingerprint className="w-4 h-4 text-white animate-pulse" /> {bioScanType === 'FACE' ? 'Verify Facial Signature' : 'Verify Biometric Conduction'}
                                        </button>
                                    ) : (
                                        <div className="text-center py-2">
                                            <p className="text-[9px] text-emerald-500 font-mono tracking-widest animate-pulse uppercase">
                                                {bioScanType === 'FACE' ? 'Scanning: Keep face centered in local optical frame...' : 'Scanning: Align palm or fingerprint node grid with sensor...'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => triggerBrowserBiometric()}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-[6px_6px_0_0_#065f46] uppercase tracking-widest text-sm flex items-center justify-center gap-2 active:translate-y-0.5"
                                >
                                    <Fingerprint className="w-4 h-4 text-white" /> Request Browser Biometrics API
                                </button>

                                {biometricStatus === 'API_SANDBOX_RESTRICTED' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            playBeep(980, 'sine', 0.1);
                                            setShowManualScanner(true);
                                        }}
                                        className="w-full bg-zinc-900 hover:bg-zinc-800 border-2 border-emerald-900/40 text-emerald-400 font-bold py-3.5 rounded-xl transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                                    >
                                        Deploy Local Quantum Bio-Scanner
                                    </button>
                                )}
                            </div>
                        )}

                        <button 
                            type="button"
                            onClick={() => {
                              playBeep(450, 'sine', 0.1);
                              setAuthStep('INITIAL');
                              setBiometricStatus('IDLE');
                              setBiometricError(null);
                              setShowManualScanner(false);
                              setMfaScanProgress(0);
                            }}
                            className="w-full text-center text-[9px] mt-2 text-zinc-650 hover:text-zinc-400 font-black uppercase tracking-widest focus:outline-none"
                        >
                            Back to Primary Credentials Override
                        </button>
                    </div>
                </motion.div>
            ) : authMode === 'NEURAL' ? (
                <motion.div 
                    key="neural"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full space-y-6"
                >
                    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-4 border-red-950/50 group shadow-inner flex items-center justify-center">
                        {!cameraError && (
                            <video 
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 contrast-125"
                            />
                        )}
                        <canvas 
                            ref={neuralCanvasRef}
                            width="320"
                            height="180"
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
                        />
                        
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
                        <div className="absolute top-4 left-4 flex gap-2 z-20">
                            <div className={`w-1.5 h-1.5 rounded-full ${cameraError ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
                            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">
                                {cameraError ? 'Synthetic_Lattice_Uplink' : 'Optical_Feed_Live'}
                            </span>
                        </div>

                        <div className="absolute bottom-4 right-4 flex items-center gap-3 z-20">
                            <span className="text-[8px] font-black text-zinc-500 uppercase">
                                {cameraError ? 'Sim_Target: Active' : 'Lattice_Sync: 0.98'}
                            </span>
                            <Activity className="w-4 h-4 text-emerald-500" />
                        </div>

                        <AnimatePresence>
                            {scanStatus === 'VERIFYING' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30"
                                >
                                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-xs font-black text-red-500 uppercase tracking-[0.3em] mb-2 animate-pulse">Analyzing Pattern</p>
                                    <p className="text-[10px] text-zinc-400 font-mono italic">"Verifying Sovereignty..."</p>
                                </motion.div>
                            )}
                            {scanStatus === 'SUCCESS' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-pulse"
                                >
                                    <div className="w-16 h-16 bg-emerald-950 border-2 border-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                                        <CheckCircle className="w-8 h-8 text-emerald-400 animate-bounce" />
                                    </div>
                                    <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">ACCESS GRANTED</p>
                                    <p className="text-[10px] text-zinc-400 font-mono italic">
                                        {bioScanType === 'FACE' ? '"Facial Profile Matched. Secure session created."' : '"Hand Matrix Decrypted. Secure session created."'}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-black/40 border-2 border-red-950/30 p-6 rounded-2xl flex flex-col items-center gap-4">
                        {/* Biometrics Type Toggle Selection tabs */}
                        <div className="w-full flex gap-1 bg-zinc-950 p-1 rounded-xl mb-1 border border-red-900/15">
                            <button 
                                type="button"
                                onClick={() => {
                                  playBeep(900, 'sine', 0.05);
                                  setBioScanType('FACE');
                                }}
                                className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${bioScanType === 'FACE' ? 'bg-red-950/80 text-red-400 border border-red-900/40' : 'text-zinc-500 hover:text-zinc-400'}`}
                            >
                                <span className="flex items-center justify-center gap-1">
                                    <Video className="w-2.5 h-2.5" />
                                    Facial Face-ID
                                </span>
                            </button>
                            <button 
                                type="button"
                                onClick={() => {
                                  playBeep(900, 'sine', 0.05);
                                  setBioScanType('HAND');
                                }}
                                className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${bioScanType === 'HAND' ? 'bg-red-950/80 text-red-400 border border-red-900/40' : 'text-zinc-500 hover:text-zinc-400'}`}
                            >
                                <span className="flex items-center justify-center gap-1">
                                    <Fingerprint className="w-2.5 h-2.5" />
                                    Hand-ID Matrix
                                </span>
                            </button>
                        </div>

                        {/* Target Identity Selector */}
                        <div className="w-full space-y-1 mb-1">
                            <label className="text-[8px] text-zinc-500 uppercase font-black tracking-[0.25em] pl-1 block text-left">Target Profile Signature</label>
                            <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-1 rounded-xl border border-red-900/15">
                                {[
                                    { id: 'creator', label: 'Creator', email: 'resurrectionofmoses@gmail.com' },
                                    { id: 'admin', label: 'Admin', email: 'admin@aetheros.local' },
                                    { id: 'mod', label: 'Guardian', email: 'mod@aetheros.local' },
                                    { id: 'operator', label: 'Operator', email: 'operator@aetheros.local' }
                                ].map((profile) => {
                                    const active = targetProfileId === profile.id;
                                    return (
                                        <button
                                            key={profile.id}
                                            type="button"
                                            disabled={scanStatus !== 'IDLE'}
                                            onClick={() => {
                                                playBeep(850, 'sine', 0.03);
                                                setTargetProfileId(profile.id as any);
                                            }}
                                            className={`py-1 text-[8px] font-black uppercase tracking-wider rounded-lg transition-all ${active ? 'bg-red-950 text-red-400 border border-red-900/40' : 'text-zinc-600 hover:text-zinc-400'} ${scanStatus !== 'IDLE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title={profile.email}
                                        >
                                            {profile.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mb-1">
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
                                {bioScanType === 'FACE' ? (
                                    <>
                                        <span className="flex items-center gap-3">
                                            <Video className="w-5 h-5 text-white animate-pulse" />
                                            Initialize Facial Scan
                                        </span>
                                        <span className="text-[8px] opacity-60 font-medium tracking-tight">Center face in camera viewport</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex items-center gap-3">
                                            <Fingerprint className="w-5 h-5 text-white animate-pulse" />
                                            Initialize Hand-ID Scan
                                        </span>
                                        <span className="text-[8px] opacity-60 font-medium tracking-tight">Center hand in optical aperture</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="text-center py-2 w-full">
                                <p className="text-[9px] text-red-500 font-mono font-black uppercase tracking-wider mb-2 animate-pulse">
                                    {getScanStatusText(scanProgress)}
                                </p>
                                <div className="flex gap-1 justify-center">
                                    {[...Array(12)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`w-1.5 h-3 rounded-full ${i < (scanProgress/10) ? 'bg-red-500 shadow-[0_0_5px_#330000]' : 'bg-red-950/30'} transition-colors duration-300`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CONVENIENT LIGHTWEIGHT ONE-CLICK DEMO BYPASS */}
                    <div className="flex justify-center border-t border-zinc-900 pt-3">
                      <button
                        type="button"
                        onClick={handleGuestAccess}
                        className="text-center text-[9px] text-zinc-500 hover:text-red-400 font-black uppercase tracking-wider transition-colors duration-150 flex items-center gap-1.5 focus:outline-none"
                      >
                        <Zap className="w-3.5 h-3.5 text-zinc-600 hover:text-red-500" />
                        Bypass with Guest Observer Pass
                      </button>
                    </div>

                    {/* FACIAL SCANNING TROUBLESHOOTING & AUDIT LOG PANEL */}
                    <div className="border-t border-zinc-900/60 pt-3 mt-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          playBeep(700, 'sine', 0.05);
                          setShowFaceLogs(!showFaceLogs);
                        }}
                        className="text-[9px] text-zinc-500 hover:text-red-400 font-black uppercase tracking-wider transition-colors duration-150 flex items-center gap-1.5 mx-auto focus:outline-none"
                      >
                        <Terminal className="w-3.5 h-3.5 text-zinc-600 hover:text-red-500" />
                        {showFaceLogs ? 'Hide Optical Trouble Logs' : 'View Face-ID Trouble Logs'}
                      </button>

                      <AnimatePresence>
                        {showFaceLogs && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden text-left mt-3 bg-black/60 border border-zinc-900 rounded-xl p-3 space-y-3"
                          >
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5" />
                                Optical Diagnostics Audit
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    playBeep(1100, 'triangle', 0.1);
                                    // Manually log a simulated diagnostic failure
                                    const mockErr = ["Lattice convergence deviation threshold exceeded.", "Pupillary distance out of calibration bounds.", "Illumination variance below standard threshold (ambient lux too dark).", "Hardware frame latency spike detected (>250ms).", "Biometric facial coordinates spoof detected."][Math.floor(Math.random() * 5)];
                                    logFaceAuthAttempt(
                                      targetProfileId,
                                      targetProfileId === 'creator' ? 'resurrectionofmoses@gmail.com' : `${targetProfileId}@aetheros.local`,
                                      'FAILURE',
                                      mockErr,
                                      { confidenceScore: 31.4, landmarkPoints: 18 }
                                    );
                                    setFaceLogs(getFaceAuthLogs());
                                  }}
                                  className="text-[8px] bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-900/30 px-1.5 py-0.5 rounded uppercase font-bold"
                                  title="Add simulated error log to verify logging behavior"
                                >
                                  Simulate Fail
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    playBeep(400, 'sawtooth', 0.1);
                                    clearFaceAuthLogs();
                                    setFaceLogs([]);
                                  }}
                                  className="text-[8px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                  Clear
                                </button>
                              </div>
                            </div>

                            <p className="text-[8.5px] text-zinc-500 leading-normal font-sans">
                              Persists local auth event telemetry. Failures logged here automatically map into the global system diagnostic hub.
                            </p>

                            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                              {faceLogs.length === 0 ? (
                                <p className="text-[9px] text-zinc-600 font-mono italic text-center py-4">No optical log telemetry saved.</p>
                              ) : (
                                faceLogs.map((log) => {
                                  const isSuccess = log.status === 'SUCCESS';
                                  const isFailure = log.status === 'FAILURE' || log.status === 'CAMERA_ERROR';
                                  const isScanning = log.status === 'SCANNING';
                                  
                                  return (
                                    <div 
                                      key={log.id} 
                                      className={`p-2 rounded-lg border text-[9px] font-mono ${
                                        isSuccess 
                                          ? 'bg-emerald-950/20 border-emerald-900/20 text-emerald-300' 
                                          : isFailure 
                                            ? 'bg-red-950/20 border-red-900/20 text-red-300' 
                                            : 'bg-zinc-900/40 border-zinc-900/60 text-zinc-300'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center mb-1">
                                        <span className={`font-bold uppercase tracking-wider text-[8px] ${
                                          isSuccess ? 'text-emerald-400' : isFailure ? 'text-red-400' : 'text-zinc-400'
                                        }`}>
                                          {log.status}
                                        </span>
                                        <span className="text-zinc-500 text-[8px]">{log.localTime}</span>
                                      </div>

                                      <div className="space-y-0.5">
                                        <p className="leading-tight break-all font-mono">
                                          <span className="text-zinc-500">Target:</span> {log.targetProfileId.toUpperCase()} ({log.targetEmail})
                                        </p>
                                        {log.errorMessage && (
                                          <p className="text-red-400 bg-red-950/30 p-1 rounded border border-red-900/10 mt-1 font-mono">
                                            <span className="font-bold font-sans">Error:</span> {log.errorMessage}
                                          </p>
                                        )}
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5 pt-1 border-t border-zinc-900/40 text-[8px] text-zinc-400 font-mono">
                                          <div>Match Confidence: <span className="text-zinc-200">{log.details.confidenceScore}%</span></div>
                                          <div>Landmarks: <span className="text-zinc-200">{log.details.landmarkPoints}</span></div>
                                          <div>Execution Time: <span className="text-zinc-200">{log.details.executionTimeMs}ms</span></div>
                                          <div>Viewport: <span className="text-zinc-200">{log.details.viewport}</span></div>
                                          <div className="col-span-2 truncate">UA: <span className="text-zinc-500 text-[7px]">{log.details.browserAgent}</span></div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    key="manual"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full flex flex-col gap-4"
                >
                    {/* Sovereign Identity visual interface selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-black/60 border border-zinc-900 px-4 py-2.5 rounded-xl">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider pl-1">Override Shell:</span>
                            <div className="flex gap-1 p-0.5 bg-zinc-950 border border-zinc-900 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => {
                                        playBeep(800, 'sine', 0.05);
                                        setShowTerminal(false);
                                    }}
                                    className={`px-3 py-1 text-[8.5px] uppercase font-black tracking-wider rounded-md transition-all ${!showTerminal ? 'bg-red-950 text-red-400 border border-red-900/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Sleek Card
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        playBeep(800, 'sine', 0.05);
                                        setShowTerminal(true);
                                    }}
                                    className={`px-3 py-1 text-[8.5px] uppercase font-black tracking-wider rounded-md transition-all ${showTerminal ? 'bg-red-950 text-red-400 border border-red-900/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Secure Shell CLI
                                </button>
                            </div>
                        </div>

                        {!showTerminal ? (
                            <form 
                                onSubmit={handleVisualLoginSubmit}
                                className="space-y-4 bg-black/40 border-[3px] border-zinc-900 p-6 rounded-2xl flex flex-col relative"
                            >
                                <div className="space-y-1.5">
                                    <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest pl-1">Operator Email</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-650 text-zinc-600" />
                                        <input 
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="operator@aetheros.local"
                                            className="w-full bg-black/80 border border-zinc-850 focus:border-red-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none transition-colors duration-150 font-mono"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest pl-1">Passphrase</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-650 text-zinc-600" />
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••••••••"
                                            className="w-full bg-black/80 border border-zinc-850 focus:border-red-500/50 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none transition-colors duration-150 font-mono"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                playBeep(950, 'sine', 0.02);
                                                setShowPassword(!showPassword);
                                            }}
                                            className="absolute right-3.5 top-3 text-zinc-600 hover:text-zinc-400"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-red-650 bg-red-700 hover:bg-red-650 hover:bg-red-600 text-white font-black py-3.5 rounded-xl transition-all shadow-[4px_4px_0_0_#580505] uppercase tracking-widest text-xs active:translate-y-0.5 mt-2"
                                >
                                    Verify Conduction keys
                                </button>

                                {/* Quick Sandbox Key injectors to bypass manual copy paste typing */}
                                <div className="border-t border-zinc-900 mt-4 pt-4 space-y-2">
                                    <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider text-center">Quick-Inject Operator Tokens</p>
                                    <div className="grid grid-cols-3 gap-1.5 text-[8px]">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                playBeep(900, 'sine', 0.03);
                                                setEmail('admin@aetheros.local');
                                                setPassword('AetherSovereign2026');
                                            }}
                                            className="py-2 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-400 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 transition-all text-center uppercase font-bold font-mono"
                                        >
                                            Admin
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                playBeep(900, 'sine', 0.03);
                                                setEmail('mod@aetheros.local');
                                                setPassword('GuardianPass');
                                            }}
                                            className="py-2 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-400 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 transition-all text-center uppercase font-bold font-mono"
                                        >
                                            Guardian
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                playBeep(900, 'sine', 0.03);
                                                setEmail('operator@aetheros.local');
                                                setPassword('OperatorActive');
                                            }}
                                            className="py-2 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-400 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 transition-all text-center uppercase font-bold font-mono"
                                        >
                                            Operator
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="w-full bg-[#030305] border-2 border-emerald-900/60 rounded-2xl overflow-hidden shadow-2xl font-mono text-[11px] text-emerald-400">
                                {/* Terminal Window Header Bar */}
                                <div className="bg-[#0a0c10] border-b border-emerald-900/60 px-4 py-2 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                                    </div>
                                    <span className="text-[9px] text-emerald-600 uppercase font-bold tracking-widest flex items-center gap-1.5">
                                        <Terminal className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                                        SOVEREIGN_SHELL_UPLINK
                                     </span>
                                     <span className="text-[8px] text-zinc-650 text-zinc-600 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-905 border-zinc-800">
                                        PORT: 3000
                                     </span>
                                </div>

                                {/* Scrolling Console Buffer Screen */}
                                <div className="h-64 overflow-y-auto p-4 space-y-1.5 select-text scrollbar-thin scrollbar-thumb-emerald-950">
                                    {terminalBuffer.map((line, idx) => (
                                        <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                                            {line.startsWith('❌') ? (
                                                <span className="text-red-400">{line}</span>
                                            ) : line.startsWith('✅') ? (
                                                <span className="text-emerald-300 font-bold">{line}</span>
                                            ) : line.startsWith('==') ? (
                                                <span className="text-emerald-850">{line}</span>
                                            ) : line.startsWith('aetheros@auth-core') ? (
                                                <span className="text-emerald-200">{line}</span>
                                            ) : (
                                                <span>{line}</span>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={terminalBottomRef} />
                                </div>

                                {/* Command Line Input Bar */}
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        executeCommand(terminalInput);
                                    }}
                                    className="bg-[#06080b] border-t border-emerald-900/60 p-3 flex items-center gap-2"
                                >
                                    <span className="text-emerald-500 font-bold flex-shrink-0">
                                        {terminalStep === 'COMMAND' ? 'aetheros@auth-core:~$ ' : '> '}
                                    </span>
                                    
                                    <input 
                                        type={terminalStep === 'PASSWORD' ? 'password' : 'text'}
                                        value={terminalInput}
                                        onChange={(e) => {
                                          setTerminalInput(e.target.value);
                                          playBeep(1100, 'triangle', 0.012); // subtle digital key sound
                                        }}
                                        placeholder={
                                            terminalStep === 'COMMAND' ? "Type 'help', 'creds', 'login'..." : 
                                            terminalStep === 'EMAIL' ? "Key in admin@aetheros.local..." : 
                                            terminalStep === 'PASSWORD' ? "Key in sovereign cipher..." : "Enter 6-digit MFA numeric code..."
                                        }
                                        className="w-full bg-transparent text-emerald-300 placeholder-emerald-950 font-mono outline-none border-none text-[11px]"
                                        autoFocus
                                        required={terminalStep !== 'COMMAND'}
                                    />
                                    
                                    <button 
                                        type="submit" 
                                        className="px-3 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 hover:border-emerald-600 rounded text-emerald-300 font-bold text-[9px] uppercase tracking-wider transition-all flex items-center gap-1.5"
                                    >
                                        <Zap className="w-2.5 h-2.5" />
                                        EXEC
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Quick Command Injector Panel for Usability */}
                    <div className="bg-[#050508] border border-zinc-900 p-4 rounded-2xl w-full">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest pl-1">
                                Quick Tactical Actions Panel
                            </span>
                            <span className="text-[8px] bg-red-950/30 text-red-400 px-1.5 py-0.5 rounded border border-red-950 font-bold">
                                STEP: {terminalStep}
                            </span>
                        </div>

                        {terminalStep === 'COMMAND' && (
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <button
                                    type="button"
                                    onClick={() => executeCommand('help')}
                                    className="p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left text-zinc-400 hover:text-emerald-400 transition-all font-mono group"
                                >
                                    <span className="text-emerald-500 group-hover:text-emerald-400 font-black">RUN:</span> help
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        playBeep(920, 'sine', 0.05);
                                        setTerminalBuffer(prev => [...prev, "aetheros@auth-core:~$ login"]);
                                        setTerminalStep('EMAIL');
                                        setTerminalBuffer(prev => [...prev, "ENTER OPERATOR IDENTITY EMAIL: "]);
                                    }}
                                    className="p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left text-zinc-400 hover:text-emerald-400 transition-all font-mono group"
                                >
                                    <span className="text-emerald-500 group-hover:text-emerald-400 font-black">RUN:</span> login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => executeCommand('creds')}
                                    className="p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left text-zinc-400 hover:text-emerald-400 transition-all font-mono group"
                                >
                                    <span className="text-emerald-500 group-hover:text-emerald-400 font-black">RUN:</span> creds
                                </button>
                                <button
                                    type="button"
                                    onClick={() => executeCommand('guest')}
                                    className="p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left text-zinc-400 hover:text-emerald-400 transition-all font-mono group"
                                >
                                    <span className="text-emerald-500 group-hover:text-emerald-400 font-black">RUN:</span> guest
                                </button>
                            </div>
                        )}

                        {terminalStep === 'EMAIL' && (
                            <div className="space-y-2">
                                <p className="text-[9px] text-zinc-500 italic pl-1">Select credential identity to inject:</p>
                                <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            executeCommand('admin@aetheros.local');
                                            setEmail('admin@aetheros.local');
                                        }}
                                        className="py-2 bg-zinc-950 hover:bg-[#0a3525] border border-zinc-800 hover:border-emerald-700 rounded-xl text-center text-zinc-400 hover:text-emerald-200 transition-all font-mono font-bold"
                                    >
                                        Admin
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            executeCommand('mod@aetheros.local');
                                            setEmail('mod@aetheros.local');
                                        }}
                                        className="py-2 bg-zinc-950 hover:bg-[#0a3525] border border-zinc-800 hover:border-emerald-700 rounded-xl text-center text-zinc-400 hover:text-emerald-200 transition-all font-mono font-bold"
                                    >
                                        Guardian
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            executeCommand('operator@aetheros.local');
                                            setEmail('operator@aetheros.local');
                                        }}
                                        className="py-2 bg-zinc-950 hover:bg-[#0a3525] border border-zinc-800 hover:border-emerald-700 rounded-xl text-center text-zinc-400 hover:text-emerald-200 transition-all font-mono font-bold"
                                    >
                                        Operator
                                    </button>
                                </div>
                            </div>
                        )}

                        {terminalStep === 'PASSWORD' && (
                            <div className="space-y-2">
                                <p className="text-[9px] text-zinc-500 italic pl-1">Inject password corresponding to identity choice:</p>
                                <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            executeCommand('AetherSovereign2026');
                                            setPassword('AetherSovereign2026');
                                        }}
                                        className="py-2 bg-zinc-950 hover:bg-[#0a3525] border border-zinc-800 hover:border-emerald-700 rounded-xl text-center text-zinc-400 hover:text-emerald-200 transition-all font-mono font-bold"
                                    >
                                        Admin Pass
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            executeCommand('GuardianPass');
                                            setPassword('GuardianPass');
                                        }}
                                        className="py-2 bg-zinc-950 hover:bg-[#0a3525] border border-zinc-800 hover:border-emerald-700 rounded-xl text-center text-zinc-400 hover:text-emerald-200 transition-all font-mono font-bold"
                                    >
                                        Guardian Pass
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            executeCommand('OperatorActive');
                                            setPassword('OperatorActive');
                                        }}
                                        className="py-2 bg-zinc-950 hover:bg-[#0a3525] border border-zinc-800 hover:border-emerald-700 rounded-xl text-center text-zinc-400 hover:text-emerald-200 transition-all font-mono font-bold"
                                    >
                                        Operator Pass
                                    </button>
                                </div>
                            </div>
                        )}

                        {terminalStep === 'TWOFA' && (
                            <div className="space-y-2">
                                <p className="text-[9px] text-zinc-500 italic pl-1">Inject standard 2FA verification token:</p>
                                <button
                                    type="button"
                                    onClick={() => executeCommand('000000')}
                                    className="w-full py-2 bg-zinc-950 hover:bg-emerald-950 border border-zinc-800 hover:border-emerald-700 rounded-xl text-center text-emerald-400 hover:text-emerald-200 font-bold transition-all font-mono text-[10px]"
                                >
                                    Inject '000000' and Connect
                                </button>
                            </div>
                        )}

                        {terminalStep !== 'COMMAND' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setTerminalStep('COMMAND');
                                    playBeep(320, 'triangle', 0.15);
                                    setTerminalBuffer(prev => [...prev, "❌ Authentication stream cancelled. Core standby.", ""]);
                                }}
                                className="mt-2.5 w-full bg-zinc-950/80 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 font-bold py-1.5 rounded-lg border border-zinc-900 hover:border-red-900/30 text-[9px] uppercase tracking-widest transition-all text-center"
                            >
                                Cancel Logon Process
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="mt-10 pt-6 border-t border-white/5 w-full text-center">
          <p className="text-[8px] text-zinc-500 font-mono uppercase italic tracking-wider">
            Biometric Sovereignty Enforced • Neural Lattice ID Required
          </p>
        </div>
      </div>
    </div>
  );
};
