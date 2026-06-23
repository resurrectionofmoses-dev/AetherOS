import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SparklesIcon, ShieldIcon, HistoryIcon } from './icons';

export const QuantumCoin3D: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Coin State
    const [angle, setAngle] = useState(0); // in radians
    const [isDragging, setIsDragging] = useState(false);
    const [currentSide, setCurrentSide] = useState<'FRONT' | 'BACK'>('FRONT');
    const [entropyFlares, setEntropyFlares] = useState<any[]>([]);

    const dragStartX = useRef(0);
    const currentAngle = useRef(0);
    const velocity = useRef(0.015); // Auto-rotation speed

    // Generate random ambient flares
    useEffect(() => {
        const flares = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 4,
            duration: Math.random() * 3 + 2
        }));
        setEntropyFlares(flares);
    }, []);

    // Draw Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        // Auto-sizing
        const resize = () => {
            if (canvas.parentElement) {
                const size = Math.min(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight || 300);
                canvas.width = size * window.devicePixelRatio;
                canvas.height = size * window.devicePixelRatio;
                canvas.style.width = `${size}px`;
                canvas.style.height = `${size}px`;
            }
        };
        resize();
        window.addEventListener('resize', resize);

        const render = () => {
            if (!isDragging) {
                currentAngle.current = (currentAngle.current + velocity.current) % (Math.PI * 2);
            }

            // Keep angle updated in local react state for HUD descriptors
            const normalizedAngle = ((currentAngle.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            setAngle(normalizedAngle);
            
            const cosVal = Math.cos(normalizedAngle);
            const side = cosVal > 0 ? 'FRONT' : 'BACK';
            setCurrentSide(side);

            // Fetch dynamic dimensions
            const dpr = window.devicePixelRatio;
            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;
            const cy = h / 2;
            const radius = (w * 0.38);
            const thickness = radius * 0.08; // 3D Coin thickness

            ctx.clearRect(0, 0, w, h);

            // Draw shadow under the coin
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 40 * dpr;
            ctx.fillStyle = 'rgba(0,0,0,0.01)';
            ctx.beginPath();
            ctx.ellipse(cx, cy + radius * 1.05, radius * Math.max(0.2, Math.abs(cosVal)), radius * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 1. Draw 3D rim edge (reoccurring teeth segment mapping)
            ctx.save();
            const sinVal = Math.sin(normalizedAngle);
            const numSteps = 40;
            
            // Draw rim thickness projection
            for (let t = -thickness / 2; t <= thickness / 2; t += 0.5 * dpr) {
                const shiftX = sinVal * t;
                const alpha = 0.85 - Math.abs(t / (thickness / 2)) * 0.3;
                
                ctx.strokeStyle = `rgba(163, 163, 163, ${alpha})`;
                ctx.lineWidth = 1 * dpr;
                ctx.fillStyle = `rgba(38, 38, 38, ${alpha})`;

                ctx.beginPath();
                ctx.ellipse(cx + shiftX, cy, radius * Math.abs(cosVal), radius, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }

            // Draw ridged teeth marks on the coin rim
            ctx.strokeStyle = 'rgba(92, 92, 92, 0.4)';
            ctx.lineWidth = 2 * dpr;
            for (let i = 0; i < numSteps; i++) {
                const stepAngle = (i / numSteps) * Math.PI * 2;
                // Projected points based on current rotation
                const itemX = Math.cos(stepAngle + normalizedAngle) * radius;
                const itemY = Math.sin(stepAngle) * radius;
                
                // Only draw teeth facing the side edge view
                const itemCos = Math.cos(stepAngle + normalizedAngle);
                if (Math.abs(itemCos) > 0.05) {
                    ctx.beginPath();
                    ctx.moveTo(cx + itemX - sinVal * (thickness / 2), cy + itemY);
                    ctx.lineTo(cx + itemX + sinVal * (thickness / 2), cy + itemY);
                    ctx.stroke();
                }
            }
            ctx.restore();

            // Helper to draw shiny silver base face
            const drawSilverFaceBase = (scaleX: number) => {
                ctx.save();
                // Face Base
                const faceGrad = ctx.createLinearGradient(cx - radius * scaleX, cy - radius, cx + radius * scaleX, cy + radius);
                faceGrad.addColorStop(0, '#FFFFFF');
                faceGrad.addColorStop(0.3, '#D4D4D8');
                faceGrad.addColorStop(0.5, '#A1A1AA');
                faceGrad.addColorStop(0.7, '#D4D4D8');
                faceGrad.addColorStop(1, '#52525B');

                ctx.fillStyle = faceGrad;
                ctx.beginPath();
                ctx.ellipse(cx, cy, radius * scaleX, radius, 0, 0, Math.PI * 2);
                ctx.fill();

                // Inner ring contour
                ctx.strokeStyle = '#F4F4F5';
                ctx.lineWidth = 3 * dpr;
                ctx.beginPath();
                ctx.ellipse(cx, cy, radius * 0.92 * scaleX, radius * 0.92, 0, 0, Math.PI * 2);
                ctx.stroke();

                ctx.strokeStyle = '#71717A';
                ctx.lineWidth = 1 * dpr;
                ctx.beginPath();
                ctx.ellipse(cx, cy, radius * 0.88 * scaleX, radius * 0.88, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            };

            // 2. Draw front/back coin face graphic depending on visible side
            const scaleX = Math.abs(cosVal);
            drawSilverFaceBase(scaleX);

            ctx.save();
            // Project all face drawings inside a coordinate clip for exact ellipse rotation
            ctx.beginPath();
            ctx.ellipse(cx, cy, radius * 0.88 * scaleX, radius * 0.88, 0, 0, Math.PI * 2);
            ctx.clip();

            if (side === 'FRONT') {
                // RENDER METAMASK CUTE PENGUIN
                // Background
                ctx.fillStyle = '#E4E4E7';
                ctx.fillRect(cx - radius * scaleX, cy - radius, radius * 2 * scaleX, radius * 2);

                // Add background concentric lines
                ctx.strokeStyle = '#71717a';
                ctx.lineWidth = 0.5 * dpr;
                for (let r = radius * 0.2; r < radius; r += radius * 0.2) {
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, r * scaleX, r, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // DRAW THE PUDGY PENGUIN IN OUTFIT
                // Head coordinates (scaled by scaleX for 3D distortion)
                const px = cx;
                const py = cy + radius * 0.15;
                const sz = radius * 0.45; // base penguin scale

                // Body (flannel orange coat)
                ctx.fillStyle = '#EA580C'; // Red flannel
                ctx.beginPath();
                ctx.ellipse(px, py + sz * 0.7, sz * 0.85 * scaleX, sz * 0.7, 0, 0, Math.PI * 2);
                ctx.fill();

                // Flannel pattern strips
                ctx.strokeStyle = '#18181B';
                ctx.lineWidth = 4 * dpr;
                for (let i = -3; i <= 3; i++) {
                    // Vertical stripes
                    ctx.beginPath();
                    ctx.ellipse(px + i * sz * 0.2 * scaleX, py + sz * 0.7, 1 * scaleX, sz * 0.6, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Penguin white belly
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.ellipse(px, py + sz * 0.65, sz * 0.5 * scaleX, sz * 0.5, 0, 0, Math.PI * 1.8);
                ctx.fill();

                // Penguin dark Head back/wings
                ctx.fillStyle = '#1E3A8A'; // Deep blue penguin back
                ctx.beginPath();
                ctx.ellipse(px, py - sz * 0.1, sz * 0.62 * scaleX, sz * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();

                // White face patch (heart-like shape)
                ctx.fillStyle = '#FFFFFF';
                // Left face lobe
                ctx.beginPath();
                ctx.ellipse(px - sz * 0.21 * scaleX, py - sz * 0.05, sz * 0.3 * scaleX, sz * 0.38, 0, 0, Math.PI * 2);
                ctx.fill();
                // Right face lobe
                ctx.beginPath();
                ctx.ellipse(px + sz * 0.21 * scaleX, py - sz * 0.05, sz * 0.3 * scaleX, sz * 0.38, 0, 0, Math.PI * 2);
                ctx.fill();

                // Cute big black eyes with spark highlights
                ctx.fillStyle = '#09090B';
                ctx.beginPath();
                ctx.ellipse(px - sz * 0.22 * scaleX, py - sz * 0.04, sz * 0.1 * scaleX, sz * 0.1, 0, 0, Math.PI * 2);
                ctx.ellipse(px + sz * 0.22 * scaleX, py - sz * 0.04, sz * 0.1 * scaleX, sz * 0.1, 0, 0, Math.PI * 2);
                ctx.fill();

                // White eye spark reflection
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.ellipse(px - (sz * 0.25) * scaleX, py - sz * 0.07, sz * 0.035 * scaleX, sz * 0.035, 0, 0, Math.PI * 2);
                ctx.ellipse(px + (sz * 0.19) * scaleX, py - sz * 0.07, sz * 0.035 * scaleX, sz * 0.035, 0, 0, Math.PI * 2);
                ctx.fill();

                // Orange gold triangle beak
                ctx.fillStyle = '#F59E0B';
                ctx.beginPath();
                ctx.moveTo(px - sz * 0.09 * scaleX, py + sz * 0.03);
                ctx.lineTo(px + sz * 0.09 * scaleX, py + sz * 0.03);
                ctx.lineTo(px, py + sz * 0.18);
                ctx.closePath();
                ctx.fill();

                // METAMASK FOX BASEBALL CAP (on Head)
                ctx.fillStyle = '#09090B'; // Black cap dome
                ctx.beginPath();
                ctx.ellipse(px, py - sz * 0.55, sz * 0.6 * scaleX, sz * 0.35, 0, Math.PI, Math.PI * 2);
                ctx.fill();

                // Cap brim/bill sticking forward
                ctx.fillStyle = '#27272A'; // Cap brim
                ctx.beginPath();
                ctx.ellipse(px, py - sz * 0.52, sz * 0.72 * scaleX, sz * 0.09, 0, 0, Math.PI * 2);
                ctx.fill();

                // MetaMask Fox logo on center of cap
                ctx.fillStyle = '#EA580C'; // Fox Orange
                ctx.beginPath();
                // Fox face shield polygon
                ctx.moveTo(px, py - sz * 0.78);
                ctx.lineTo(px - sz * 0.12 * scaleX, py - sz * 0.65);
                ctx.lineTo(px - sz * 0.05 * scaleX, py - sz * 0.58);
                ctx.lineTo(px, py - sz * 0.62);
                ctx.lineTo(px + sz * 0.05 * scaleX, py - sz * 0.58);
                ctx.lineTo(px + sz * 0.12 * scaleX, py - sz * 0.65);
                ctx.closePath();
                ctx.fill();

                // Fox ears
                ctx.fillStyle = '#D97706';
                ctx.beginPath();
                ctx.moveTo(px - sz * 0.10 * scaleX, py - sz * 0.74);
                ctx.lineTo(px - sz * 0.15 * scaleX, py - sz * 0.88);
                ctx.lineTo(px - sz * 0.04 * scaleX, py - sz * 0.76);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(px + sz * 0.10 * scaleX, py - sz * 0.74);
                ctx.lineTo(px + sz * 0.15 * scaleX, py - sz * 0.88);
                ctx.lineTo(px + sz * 0.04 * scaleX, py - sz * 0.76);
                ctx.closePath();
                ctx.fill();

            } else {
                // RENDER IGLOO SYSTEM SIDE (BACK)
                ctx.fillStyle = '#1C1917'; // Graphite stone background
                ctx.fillRect(cx - radius * scaleX, cy - radius, radius * 2 * scaleX, radius * 2);

                // Add dynamic grid matrix
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // Cyber crimson grid line
                ctx.lineWidth = 1 * dpr;
                ctx.save();
                for (let i = -5; i <= 5; i++) {
                    // Vertical prospective grid lines
                    ctx.beginPath();
                    ctx.ellipse(cx + (i * radius * 0.15) * scaleX, cy, 1 * scaleX, radius * 0.85, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();

                // White Igloo Graphic
                const ix = cx;
                const iy = cy - radius * 0.05;
                const ir = radius * 0.42;

                ctx.fillStyle = 'rgba(255,255,255,0.95)';
                ctx.strokeStyle = '#09090B';
                ctx.lineWidth = 2 * dpr;

                // Main dome of igloo
                ctx.beginPath();
                ctx.ellipse(ix, iy + ir * 0.2, ir * 0.9 * scaleX, ir * 0.75, 0, Math.PI, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Dome outline grid bricks representation
                ctx.strokeStyle = '#52525B';
                ctx.lineWidth = 1.5 * dpr;
                
                // Horizontals
                for (let h = 0.2; h < 0.8; h += 0.25) {
                    ctx.beginPath();
                    ctx.ellipse(ix, iy + ir * 0.2, ir * 0.9 * h * scaleX, ir * 0.75 * h, 0, Math.PI, Math.PI * 2);
                    ctx.stroke();
                }

                // Entrance tunnel of igloo
                ctx.fillStyle = '#E4E4E7';
                ctx.beginPath();
                ctx.ellipse(ix + ir * 0.35 * scaleX, iy + ir * 0.32, ir * 0.38 * scaleX, ir * 0.35, 0, Math.PI, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Text overlay curve: "PUDGY PENGUINS" and "METAMASK-PENGUIN"
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `bold ${Math.floor(10 * dpr)}px monospace`;
                ctx.textAlign = 'center';

                // Top label text
                ctx.save();
                ctx.font = `black ${Math.floor(9 * dpr)}px sans-serif`;
                ctx.fillStyle = 'rgba(255,255,255,0.75)';
                ctx.fillText("METAMASK-PENGUIN", cx, cy - radius * 0.65);
                ctx.fillText("PUDGY PENGUINS", cx, cy + radius * 0.65);
                ctx.restore();
            }

            ctx.restore();

            // 3. Draw specular glare sweep
            ctx.save();
            const glareGrad = ctx.createLinearGradient(cx - radius * 1.5, cy, cx + radius * 1.5, cy);
            glareGrad.addColorStop(0, 'rgba(255,255,255,0)');
            glareGrad.addColorStop(0.45, 'rgba(255,255,255,0)');
            glareGrad.addColorStop(0.5, 'rgba(255,255,255,0.45)');
            glareGrad.addColorStop(0.55, 'rgba(255,255,255,0)');
            glareGrad.addColorStop(1, 'rgba(255,255,255,0)');

            ctx.fillStyle = glareGrad;
            ctx.beginPath();
            ctx.ellipse(cx, cy, radius * scaleX, radius, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            animationId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [isDragging]);

    // Handle Drag Interactivity
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartX.current = e.clientX;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - dragStartX.current;
        dragStartX.current = e.clientX;
        
        // Convert screen offset directly to radians rotation
        currentAngle.current = (currentAngle.current + deltaX * 0.012) % (Math.PI * 2);
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        dragStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - dragStartX.current;
        dragStartX.current = e.touches[0].clientX;
        
        currentAngle.current = (currentAngle.current + deltaX * 0.014) % (Math.PI * 2);
    };

    // Spin speed kick
    const triggerSpinSlick = () => {
        velocity.current = 0.28;
        setTimeout(() => {
            velocity.current = 0.015;
        }, 1500);
    };

    return (
        <div 
            id="quantum-pudgy-coin-panel"
            ref={containerRef}
            className="flex flex-col items-center justify-between p-6 bg-black/80 border-2 border-zinc-900 rounded-3xl relative h-[520px] shadow-2xl select-none"
        >
            {/* Ambient Background Flares (Simulating Ethereum network flares) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0">
                {entropyFlares.map(flare => (
                    <div 
                        key={flare.id}
                        className="absolute rounded-full bg-rose-500/10 blur-[1px]"
                        style={{
                            left: `${flare.x}%`,
                            top: `${flare.y}%`,
                            width: `${flare.size}px`,
                            height: `${flare.size}px`,
                            animation: `pulse ${flare.duration}s infinite ease-in-out`,
                            animationDelay: `${flare.delay}s`
                        }}
                    />
                ))}
            </div>

            {/* Coin Header Indicators */}
            <div className="w-full flex justify-between items-center relative z-10">
                <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-500/20 px-2.5 py-1 rounded-full">
                    <SparklesIcon className="w-3.5 h-3.5 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
                    <span className="text-[8.5px] font-black uppercase text-rose-400">WebGL Interactive CSS Coin</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 text-[8px] font-bold uppercase transition-all">
                    {isDragging ? (
                        <span className="text-amber-400 animate-pulse">● Manipulating vector angles</span>
                    ) : (
                        <span>○ Drag to rotate coin manually</span>
                    )}
                </div>
            </div>

            {/* Render Canvas element */}
            <div className="relative flex-1 flex items-center justify-center w-full min-h-[300px] cursor-grab active:cursor-grabbing">
                <canvas 
                    id="three-d-coin-canvas"
                    ref={canvasRef} 
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUpOrLeave}
                    className="z-10 transition-transform hover:scale-[1.03] active:scale-[0.99] duration-300"
                />
            </div>

            {/* Coin HUD Stats */}
            <div className="w-full space-y-4 relative z-10 border-t border-zinc-950 pt-4">
                <div className="grid grid-cols-3 gap-2.5 text-center text-[8.5px] text-zinc-500 uppercase font-semibold">
                    <div className="bg-[#050508] border border-zinc-900 rounded-xl p-2.5">
                        <div className="text-zinc-650">Current Side</div>
                        <div className={`font-black text-xs mt-1 ${currentSide === 'FRONT' ? 'text-amber-500' : 'text-rose-500'}`}>{currentSide}</div>
                    </div>
                    <div className="bg-[#050508] border border-zinc-900 rounded-xl p-2.5">
                        <div className="text-zinc-650">Euler Angle</div>
                        <div className="font-bold text-white text-xs mt-1 tabular-nums">{angle.toFixed(3)} rad</div>
                    </div>
                    <div className="bg-[#050508] border border-zinc-900 rounded-xl p-2.5">
                        <div className="text-zinc-650">Projection Mode</div>
                        <div className="font-bold text-cyan-400 text-xs mt-1">2.5D FLAT CYL</div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        id="pudgy-spin-kick-btn"
                        name="spin_kick"
                        onClick={triggerSpinSlick}
                        className="flex-1 py-2 bg-gradient-to-r from-rose-955 to-rose-900 hover:from-rose-900 hover:to-rose-800 border-2 border-rose-500/30 font-black uppercase text-[9px] text-rose-400 hover:text-white rounded-xl active:translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0_0_#000]"
                    >
                        <HistoryIcon className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '2s' }} />
                        <span>KICK COIN SPIN MOMENTUM</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
