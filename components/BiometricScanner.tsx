import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, ShieldAlert, CheckCircle, RefreshCw, Eye, Fingerprint, Lock, ShieldCheck, Video, VideoOff } from 'lucide-react';

interface BiometricScannerProps {
  operationName: string;
  onVerify: (success: boolean) => void;
  onClose: () => void;
}

export const BiometricScanner: React.FC<BiometricScannerProps> = ({
  operationName,
  onVerify,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  // States: 'initializing' | 'scanning' | 'aligning' | 'analyzing' | 'success' | 'failed'
  const [scanState, setScanState] = useState<'initializing' | 'scanning' | 'aligning' | 'analyzing' | 'success' | 'failed'>('initializing');
  const [progress, setProgress] = useState(0);
  const [telemetry, setTelemetry] = useState<string>('CONJUNCTION ENGINE STATUS: LINKED');
  
  // Matrix scan telemetry points
  const [neuralNodes, setNeuralNodes] = useState<{ x: number; y: number; active: boolean; label: string }[]>([
    { x: 35, y: 30, active: false, label: 'L_RETINA_LINK' },
    { x: 65, y: 30, active: false, label: 'R_RETINA_LINK' },
    { x: 50, y: 45, active: false, label: 'NOSE_BRIDGE_GRID' },
    { x: 40, y: 60, active: false, label: 'L_JAW_ALIGNED' },
    { x: 60, y: 60, active: false, label: 'R_JAW_ALIGNED' },
    { x: 50, y: 70, active: false, label: 'CHIN_SYMMETRY' },
    { x: 50, y: 20, active: false, label: 'GLABELLA_AXIS' },
  ]);

  // Start device camera
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const initCamera = async () => {
      try {
        setScanState('initializing');
        setTelemetry('SYSTEM_FEED: REQUESTING ACCESS TO CAMERA HARDWARE...');
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } }
        });
        
        activeStream = mediaStream;
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => console.error("Video playback failed", err));
        }
        
        setScanState('scanning');
        setTelemetry('SYSTEM_FEED: HARDWARE STROBE INITIATED. ACQUIRING PIXELS...');
      } catch (err: any) {
        console.warn("Camera hardware interface rejected or missing. Initializing Synthetic Signature Engine.", err);
        setPermissionError(err.message || 'HW_FEED_NOT_AVAILABLE');
        setScanState('scanning'); // continue with synthetic animation
        setTelemetry('SYSTEM_FEED: CAMERA OFFLINE // INITIATING SYNTH_VECTOR MATCHING...');
      }
    };

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Scanning loop simulations
  useEffect(() => {
    if (scanState === 'initializing') return;

    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + 2.5;

        // Change scanning telemetry and toggle nodes sequentially as scan develops
        if (next >= 100) {
          clearInterval(interval);
          setScanState('success');
          setTelemetry('MAPPING COMPLETED. OPERATOR SIGNATURE CONFIRMED // AUTHORIZING...');
          setTimeout(() => {
            onVerify(true);
          }, 1500);
          return 100;
        }

        // Mid-stage updates
        if (next > 20 && next <= 50) {
          if (scanState !== 'aligning') {
            setScanState('aligning');
            setTelemetry('MAPPING_ENGINE: TRIANGULATING NEURAL CORRELATIONS...');
          }
          // Turn on retina nodes
          setNeuralNodes(nodes => nodes.map((n, idx) => idx < 3 ? { ...n, active: true } : n));
        } else if (next > 50 && next <= 85) {
          if (scanState !== 'analyzing') {
            setScanState('analyzing');
            setTelemetry('VAULT_SEC: ENCRYPTION SIGNATURE ALIGNMENT COMMENCING...');
          }
          // Turn on remaining jaw and chin nodes
          setNeuralNodes(nodes => nodes.map((n, idx) => idx >= 3 ? { ...n, active: true } : n));
        }

        // Sprinkle random technical telemetry
        if (Math.random() > 0.7) {
          const telemetryLines = [
            'COORDINATE_GRID: ALIGNING POLAR THRESHOLD...',
            `SIGMA_HASH: 0x03E2_${Math.floor(Math.random() * 99999)}_MATCH`,
            'POLARIZATION: SPECTRAL RESOLUTION AT 98.4%',
            'SOVEREIGN_DATABASE: COMPLETED LOCAL RECURSIONS',
            'AUTONOMIC_INTEGRITY: CONSTANTS COHERENT'
          ];
          setTelemetry(telemetryLines[Math.floor(Math.random() * telemetryLines.length)]);
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [scanState, onVerify]);

  // Synthetic coordinate visualizer if camera is blocked
  useEffect(() => {
    if (!permissionError) return;
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
      
      // Radial grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1;
      for (let r = 30; r < 140; r += 30) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Sweep line
      angle += 0.03;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 140, cy + Math.sin(angle) * 140);
      ctx.stroke();

      // Cybernetic wireframe face silhouette helper
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Outer head contour
      ctx.ellipse(cx, cy - 10, 70, 95, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Eyes line
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx - 85, cy - 15);
      ctx.lineTo(cx + 85, cy - 15);
      ctx.stroke();

      // Horizontal scan lines mirroring radar mapping
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      const scanY = cy - 90 + ((progress * 1.8) % 180);
      ctx.fillRect(cx - 70, scanY - 1, 140, 2);

      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [permissionError, progress]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c1017] via-zinc-950 to-black pointer-events-none" />
      
      <div className="relative w-full max-w-lg aero-panel bg-black border-4 border-emerald-500/30 p-8 rounded-[2.5rem] shadow-[0_0_80px_rgba(16,185,129,0.15)] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500" />

        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="w-full text-center space-y-2 mb-6">
            <div className="flex items-center justify-center gap-2">
              <Fingerprint className="w-6 h-6 text-emerald-500 animate-pulse" />
              <h2 className="font-comic-header text-2xl text-white uppercase italic tracking-widest">Biometric Checkpoint</h2>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 py-1.5 px-4 rounded-xl text-[10px] font-black tracking-widest text-emerald-500 uppercase">
              SECTOR: {operationName}
            </div>
          </div>

          {/* Camera Viewfinder Box */}
          <div className="relative w-72 h-72 bg-zinc-950 border-4 border-black rounded-[2rem] overflow-hidden flex items-center justify-center shadow-inner group">
            <AnimatePresence>
              {permissionError ? (
                // Synthetic HUD Render canvas
                <motion.canvas
                  ref={canvasRef}
                  width="288"
                  height="288"
                  className="absolute inset-0 w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              ) : (
                // Real camera input video stream
                <motion.video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                  playsInline
                  muted
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>

            {/* Cyber HUD Overlays */}
            <div className="absolute inset-0 border-[3px] border-emerald-500/20 rounded-[2rem] pointer-events-none z-20" />
            
            {/* Viewfinder circle */}
            <div className="absolute w-56 h-56 border-2 border-emerald-500/40 border-dashed rounded-full pointer-events-none animate-spin-slow z-20" />
            
            {/* Moving Laser line */}
            <div className="absolute w-full h-2 bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent pointer-events-none animate-scan z-30" />
            
            {/* Telemetry Dots Overlay */}
            <div className="absolute inset-0 pointer-events-none font-mono text-[7px] text-emerald-500/60 p-4 select-none z-30">
              <div className="absolute top-2 left-2">SCAN_FRQ: 60Hz</div>
              <div className="absolute top-2 right-2">ISO: 400</div>
              <div className="absolute bottom-2 left-2">MATRIX: 0x03E2</div>
              <div className="absolute bottom-2 right-3">ZOOM: x1.0</div>
            </div>

            {/* Render neural mapping overlay points */}
            {neuralNodes.map((node, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full transition-all duration-300 pointer-events-none flex items-center z-30"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className={`w-2 h-2 rounded-full ${node.active ? 'bg-emerald-400 animate-ping' : 'bg-red-500/40'}`} />
                <div className={`absolute w-1.5 h-1.5 rounded-full ${node.active ? 'bg-emerald-400' : 'bg-red-500/70'}`} />
                
                {/* Node labels for extreme sci-fi high fidelity */}
                <span className="ml-3 text-[6px] font-mono text-emerald-400 tracking-tighter opacity-70 whitespace-nowrap bg-black/60 px-1 rounded">
                  {node.label}
                </span>
              </div>
            ))}

            {/* Camera off / video status overlay indicator */}
            <div className="absolute top-4 right-4 bg-black/60 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5 pointer-events-none z-40 text-[7px] font-black uppercase tracking-widest text-[#9ca3af]">
              {permissionError ? (
                <>
                  <VideoOff className="w-2.5 h-2.5 text-zinc-500" />
                  <span>SYNTH_LINES</span>
                </>
              ) : (
                <>
                  <Video className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                  <span className="text-emerald-500">LIVE_RGB</span>
                </>
              )}
            </div>
          </div>

          {/* Progress bar and scan action info */}
          <div className="w-full mt-6 space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <span>SCAN DETAILS:</span>
              <span className="text-emerald-400 font-mono">{progress.toFixed(0)}%</span>
            </div>
            
            <div className="h-2.5 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-sm transition-all shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Live Terminal outputs */}
            <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-3 min-h-[48px] flex items-center justify-center text-center font-mono text-[9px] text-emerald-400 leading-normal uppercase">
              <span className="animate-pulse mr-1">•</span> {telemetry}
            </div>
          </div>

          {/* Footer cancel button */}
          <div className="mt-8 flex gap-4 w-full">
            <button
              onClick={onClose}
              className="flex-1 uppercase font-black tracking-widest text-[10px] py-3 px-6 border-2 border-zinc-900 bg-zinc-950/50 rounded-xl text-zinc-500 hover:text-white hover:border-zinc-800 transition-all hover:bg-zinc-900"
            >
              Cancel Signature
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: calc(100% - 8px); }
        }
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
