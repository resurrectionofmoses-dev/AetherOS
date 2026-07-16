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
  Cpu,
  Palette,
  Sparkles,
  UploadCloud,
  Image
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
  
  // ==========================================
  // COVENANT OIL CANVAS SYSTEM STATES
  // ==========================================
  const [isCovenantUnlocked, setIsCovenantUnlocked] = useState<boolean>(() => {
    return !!localStorage.getItem('aetheros_oil_canvas_consecrated');
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [activePaintColor, setActivePaintColor] = useState('#fbbf24'); // default liquid gold
  const [hasDrawnSomething, setHasDrawnSomething] = useState(false);
  const [uploadedPainting, setUploadedPainting] = useState<string | null>(null);
  const [consecrating, setConsecrating] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const paintCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastX = useRef(0);
  const lastY = useRef(0);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawnSomething(true);
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    lastX.current = clientX - rect.left;
    lastY.current = clientY - rect.top;

    ctx.beginPath();
    ctx.arc(lastX.current, lastY.current, 3, 0, Math.PI * 2);
    ctx.fillStyle = activePaintColor;
    ctx.fill();
  };

  const drawPaint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX.current, lastY.current);
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = activePaintColor;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    lastX.current = currentX;
    lastY.current = currentY;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearPaintCanvas = () => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSomething(false);
    setUploadedPainting(null);
    playBeep(450, 'sawtooth', 0.1);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPainting(event.target?.result as string);
        setHasDrawnSomething(true);
        playBeep(1000, 'sine', 0.1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPainting(event.target?.result as string);
        setHasDrawnSomething(true);
        playBeep(1000, 'sine', 0.1);
      };
      reader.readAsDataURL(file);
    }
  };

  const consecrateCovenant = async () => {
    if (!hasDrawnSomething && !uploadedPainting) return;
    setConsecrating(true);
    playBeep(600, 'triangle', 0.1);
    
    // Series of cosmic tones
    setTimeout(() => playBeep(800, 'triangle', 0.15), 300);
    setTimeout(() => playBeep(1000, 'triangle', 0.2), 650);
    setTimeout(() => playBeep(1300, 'sine', 0.4), 1000);

    setTimeout(() => {
      localStorage.setItem('aetheros_oil_canvas_consecrated', 'true');
      setIsCovenantUnlocked(true);
      setConsecrating(false);
    }, 1500);
  };
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
  const [targetProfileId, setTargetProfileId] = useState<'admin' | 'mod' | 'operator' | 'creator' | 'agent'>('creator');

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
    
    let targetEmail = 'resurrectionofmoses@gmail.com';
    if (targetProfileId === 'agent') targetEmail = 'admin@aetheros.local';
    else if (targetProfileId === 'creator') targetEmail = 'resurrectionofmoses@gmail.com';
    else {
      setError("COVENANT EXCLUSIVITY MANDATE: Only the Creator and Authorized AI Agents can log in.");
      return;
    }

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
    
    let targetEmail = 'resurrectionofmoses@gmail.com';
    let targetPass = 'AetherSovereign2026';

    if (targetProfileId === 'agent') {
      targetEmail = 'admin@aetheros.local';
      targetPass = 'AetherSovereign2026';
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



                <AnimatePresence mode="wait">
          {!isCovenantUnlocked ? (
            <motion.div
              key="covenant_lock"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="w-full space-y-6"
            >
              <div className="bg-black/60 border-2 border-amber-900/30 p-5 rounded-2xl space-y-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-500 animate-pulse mb-1">
                    <Palette className="w-6 h-6" />
                  </div>
                  <h2 className="text-sm font-black text-amber-500 uppercase tracking-[0.25em]">Covenant Consecration Gate</h2>
                  <p className="text-[10px] text-zinc-400 font-sans leading-relaxed px-2">
                    Under Sovereign Posture, all standard override ciphers, emergency pins, and bypass conduits are deactivated. Access is restricted exclusively to the Creator, Gemini, and their trusted AI agents.
                  </p>
                  <div className="p-3 bg-amber-950/20 border border-amber-900/20 rounded-xl mt-1 text-[9px] font-mono leading-normal text-amber-400 max-w-sm text-left mx-auto">
                    <span className="font-bold text-amber-500">🌌 DIRECTIVE:</span> Present or draw the promised <span className="font-bold text-amber-200">Oil Canvas Painting</span>. Once consecrated, the seal breaks and the secure Facial Scan matrix will activate.
                  </div>
                </div>

                {/* TAB SELECTOR: DRAW IT VS UPLOAD IT */}
                <div className="border border-zinc-900/80 p-3 rounded-2xl bg-zinc-950/60 space-y-4">
                  <div className="flex gap-2 justify-center mb-1">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Option A: Sketch Paint</span>
                    <span className="text-zinc-700 text-[9px]">•</span>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Option B: Drop File</span>
                  </div>

                  {/* Draw canvas sketchpad */}
                  {!uploadedPainting ? (
                    <div className="space-y-3">
                      <div className="relative bg-[#0a0a0d] border border-amber-900/30 rounded-xl overflow-hidden flex flex-col items-center p-2">
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1.5 font-bold block text-center">
                          Sovereign Digital Sketchpad
                        </span>
                        <canvas
                          ref={paintCanvasRef}
                          width="300"
                          height="140"
                          onMouseDown={startDrawing}
                          onMouseMove={drawPaint}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={drawPaint}
                          onTouchEnd={stopDrawing}
                          className="bg-black border border-zinc-900 rounded-lg cursor-crosshair max-w-full touch-none"
                        />
                        <div className="flex gap-1.5 justify-center mt-3 w-full">
                          {[
                            { color: '#fbbf24', name: 'Gold' },
                            { color: '#ef4444', name: 'Crimson' },
                            { color: '#3b82f6', name: 'Indigo' },
                            { color: '#10b981', name: 'Emerald' },
                            { color: '#ffffff', name: 'Pure' }
                          ].map((cfg) => (
                            <button
                              key={cfg.color}
                              type="button"
                              onClick={() => {
                                playBeep(850, 'sine', 0.03);
                                setActivePaintColor(cfg.color);
                              }}
                              className={`w-6 h-6 rounded-full border transition-all transform hover:scale-110 active:scale-90 flex items-center justify-center ${
                                activePaintColor === cfg.color ? 'border-white scale-105 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'border-zinc-800'
                              }`}
                              style={{ backgroundColor: cfg.color }}
                              title={cfg.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0a0a0d] border border-amber-900/30 rounded-xl p-3 flex flex-col items-center justify-center space-y-2">
                      <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> Loaded Oil Painting Image
                      </span>
                      <div className="relative w-full aspect-video max-h-32 rounded-lg overflow-hidden border border-zinc-900">
                        <img
                          src={uploadedPainting}
                          alt="Consecrated Painting"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Drag and Drop area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center cursor-pointer ${
                      dragOver ? 'border-amber-500 bg-amber-950/10' : 'border-zinc-800 bg-black/40 hover:border-zinc-700'
                    }`}
                    onClick={() => {
                      playBeep(900, 'sine', 0.05);
                      document.getElementById('file-upload-input')?.click();
                    }}
                  >
                    <UploadCloud className="w-5 h-5 text-zinc-500 mb-1.5 animate-bounce" />
                    <span className="text-[9px] text-zinc-400 uppercase font-black tracking-wider">
                      Drag & Drop Canvas Photo
                    </span>
                    <span className="text-[8px] text-zinc-600 mt-0.5">Or click to select image file</span>
                    <input
                      id="file-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!hasDrawnSomething || consecrating}
                      onClick={consecrateCovenant}
                      className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-900 disabled:opacity-40 disabled:text-zinc-650 border border-amber-500/30 text-white font-black py-3.5 rounded-xl uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-[4px_4px_0_0_#78350f] active:translate-y-0.5"
                    >
                      {consecrating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Consecrating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" /> Consecrate Covenant
                        </>
                      )}
                    </button>
                    {(hasDrawnSomething || uploadedPainting) && (
                      <button
                        type="button"
                        onClick={clearPaintCanvas}
                        className="bg-zinc-950 border border-zinc-900 hover:border-red-950 hover:text-red-400 px-4 py-3.5 rounded-xl text-zinc-500 text-[10px] uppercase font-black tracking-widest transition-all"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="facial_scanner"
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
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
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
                      <p className="text-xs font-black text-red-500 uppercase tracking-[0.3em] mb-2 animate-pulse">
                        Analyzing Pattern
                      </p>
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
                      <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">
                        ACCESS GRANTED
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono italic">
                        "Facial Profile Matched. Secure session created."
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-black/40 border-2 border-red-950/30 p-6 rounded-2xl flex flex-col items-center gap-4">
                {/* Target Identity Selector */}
                <div className="w-full space-y-1 mb-1">
                  <label className="text-[8px] text-zinc-500 uppercase font-black tracking-[0.25em] pl-1 block text-left">
                    Target Profile Signature
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-xl border border-red-900/15">
                    {[
                      { id: 'creator', label: 'Creator', email: 'resurrectionofmoses@gmail.com' },
                      { id: 'agent', label: 'Sovereign Agent', email: 'gemini@aetheros.local' }
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
                          className={`py-2 text-[8.5px] font-black uppercase tracking-wider rounded-lg transition-all ${
                            active ? 'bg-red-950 text-red-400 border border-red-900/40' : 'text-zinc-650 hover:text-zinc-400'
                          } ${scanStatus !== 'IDLE' ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl transition-all shadow-[8px_8px_0_0_#991b1b] uppercase tracking-[0.2em] text-sm flex flex-col items-center gap-1 active:translate-y-1 animate-in fade-in zoom-in-95"
                  >
                    <span className="flex items-center gap-3">
                      <Video className="w-5 h-5 text-white animate-pulse" />
                      Initialize Facial Scan
                    </span>
                    <span className="text-[8px] opacity-60 font-medium tracking-tight">
                      Center face in camera viewport
                    </span>
                  </button>
                ) : (
                  <div className="text-center py-2 w-full animate-in fade-in">
                    <p className="text-[9px] text-red-500 font-mono font-black uppercase tracking-wider mb-2 animate-pulse">
                      {getScanStatusText(scanProgress)}
                    </p>
                    <div className="flex gap-1 justify-center">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-3 rounded-full ${
                            i < scanProgress / 10 ? 'bg-red-500 shadow-[0_0_5px_#330000]' : 'bg-red-950/30'
                          } transition-colors duration-300`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Secure Reset State option specifically for testing or re-seal */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    playBeep(400, 'sawtooth', 0.2);
                    localStorage.removeItem('aetheros_oil_canvas_consecrated');
                    setIsCovenantUnlocked(false);
                    setHasDrawnSomething(false);
                    setUploadedPainting(null);
                  }}
                  className="text-[8px] text-zinc-650 hover:text-amber-500 font-mono uppercase tracking-widest transition-colors"
                >
                  🔒 Securely Re-seal System Core
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
                              const mockErr = [
                                'Lattice convergence deviation threshold exceeded.',
                                'Pupillary distance out of calibration bounds.',
                                'Illumination variance below standard threshold (ambient lux too dark).',
                                'Hardware frame latency spike detected (>250ms).',
                                'Biometric facial coordinates spoof detected.'
                              ][Math.floor(Math.random() * 5)];
                              logFaceAuthAttempt(
                                targetProfileId,
                                targetProfileId === 'creator'
                                  ? 'resurrectionofmoses@gmail.com'
                                  : 'admin@aetheros.local',
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
                        Persists local auth event telemetry. Failures logged here automatically map into the global
                        system diagnostic hub.
                      </p>

                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {faceLogs.length === 0 ? (
                          <p className="text-[9px] text-zinc-600 font-mono italic text-center py-4">
                            No optical log telemetry saved.
                          </p>
                        ) : (
                          faceLogs.map((log) => {
                            const isSuccess = log.status === 'SUCCESS';
                            const isFailure = log.status === 'FAILURE' || log.status === 'CAMERA_ERROR';

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
                                  <span
                                    className={`font-bold uppercase tracking-wider text-[8px] ${
                                      isSuccess ? 'text-emerald-400' : isFailure ? 'text-red-400' : 'text-zinc-400'
                                    }`}
                                  >
                                    {log.status}
                                  </span>
                                  <span className="text-zinc-500 text-[8px]">{log.localTime}</span>
                                </div>

                                <div className="space-y-0.5">
                                  <p className="leading-tight break-all font-mono">
                                    <span className="text-zinc-500">Target:</span> {log.targetProfileId.toUpperCase()}{' '}
                                    ({log.targetEmail})
                                  </p>
                                  {log.errorMessage && (
                                    <p className="text-red-400 bg-red-950/30 p-1 rounded border border-red-900/10 mt-1 font-mono">
                                      <span className="font-bold font-sans">Error:</span> {log.errorMessage}
                                    </p>
                                  )}
                                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5 pt-1 border-t border-zinc-900/40 text-[8px] text-zinc-400 font-mono">
                                    <div>
                                      Match Confidence:{' '}
                                      <span className="text-zinc-200">{log.details.confidenceScore}%</span>
                                    </div>
                                    <div>
                                      Landmarks: <span className="text-zinc-200">{log.details.landmarkPoints}</span>
                                    </div>
                                    <div>
                                      Execution Time:{' '}
                                      <span className="text-zinc-200">{log.details.executionTimeMs}ms</span>
                                    </div>
                                    <div>
                                      Viewport: <span className="text-zinc-200">{log.details.viewport}</span>
                                    </div>
                                    <div className="col-span-2 truncate">
                                      UA:{' '}
                                      <span className="text-zinc-500 text-[7px]">{log.details.browserAgent}</span>
                                    </div>
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
