import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, Activity, Shield, Star, Zap, Compass, Sliders, Database, 
  Timer, History, Cpu, BookOpen, Heart, Sparkles, Clock, ArrowRight, Lock 
} from 'lucide-react';
import { toast } from 'sonner';

interface Point {
  x: number;
  y: number;
  type: 'seam' | 'mesh';
}

interface VoronoiCell {
  point: Point;
  polygon: { x: number; y: number }[];
}

interface CADIteration {
  id: string;
  version: string;
  timestamp: string;
  seamDensity: number;
  meshDensity: number;
  anisotropy: number;
  refractiveIndex: number;
  thinFilmThickness: number;
  pointsCount: number;
  cellsCount: number;
  conquerGroupFactor: number;
}

export const ClothingLabView: React.FC = () => {
  // 1. Material Physics & Shader Logic States
  const [refractiveIndex, setRefractiveIndex] = useState(1.65); // n = 1.65
  const [anisotropy, setAnisotropy] = useState(0.4);           // 0.4 liquid-glass stretch
  const [thinFilmThickness, setThinFilmThickness] = useState(0); // LOCKED to 0nm
  const [seamDensity, setSeamDensity] = useState(0.85);        // D_seam = 0.85
  const [meshDensity, setMeshDensity] = useState(0.15);        // D_mesh = 0.15
  const [shadowOpacity, setShadowOpacity] = useState(0.9);     // Stark shadows, opacity = 0.9
  const [lightAngle, setLightAngle] = useState(135);           // Stark studio light angle
  const [curvature, setCurvature] = useState(0.5);             // Body curvature warping factor

  // Interactivity
  const [hoveredCellIndex, setHoveredCellIndex] = useState<number | null>(null);
  const [simulationTime, setSimulationTime] = useState(0);
  const [isDispersionAlertOpen, setIsDispersionAlertOpen] = useState(false);

  // Time-based Work schedule states
  const [currentTime, setCurrentTime] = useState(new Date());

  // 2. Iteration History Vault (Divide by Two's and Conquer by Four's)
  // Legacy iterations should never be deleted. New iterations append.
  const [iterations, setIterations] = useState<CADIteration[]>(() => {
    const saved = localStorage.getItem('aetheros_obsidian_iterations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fall back to historical data
      }
    }
    return [
      {
        id: 'iter_1',
        version: 'OB_NEB_v2.cad',
        timestamp: '2026-07-03 09:30:00',
        seamDensity: 0.21,
        meshDensity: 0.04,
        anisotropy: 0.1,
        refractiveIndex: 1.5,
        thinFilmThickness: 0,
        pointsCount: 8,
        cellsCount: 8,
        conquerGroupFactor: 2
      },
      {
        id: 'iter_2',
        version: 'OB_NEB_v4.cad',
        timestamp: '2026-07-03 11:15:00',
        seamDensity: 0.42,
        meshDensity: 0.08,
        anisotropy: 0.2,
        refractiveIndex: 1.55,
        thinFilmThickness: 0,
        pointsCount: 16,
        cellsCount: 16,
        conquerGroupFactor: 4
      },
      {
        id: 'iter_3',
        version: 'OB_NEB_v8.cad',
        timestamp: '2026-07-03 13:45:00',
        seamDensity: 0.64,
        meshDensity: 0.11,
        anisotropy: 0.3,
        refractiveIndex: 1.60,
        thinFilmThickness: 0,
        pointsCount: 32,
        cellsCount: 32,
        conquerGroupFactor: 8
      },
      {
        id: 'iter_4',
        version: 'OB_NEB_v16.cad',
        timestamp: '2026-07-03 15:20:00',
        seamDensity: 0.85,
        meshDensity: 0.15,
        anisotropy: 0.4,
        refractiveIndex: 1.65,
        thinFilmThickness: 0,
        pointsCount: 64,
        cellsCount: 64,
        conquerGroupFactor: 16
      }
    ];
  });

  // Keep track of ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulationTime(prev => prev + 1);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  // Sync real-time clock and calculate schedule breaks
  useEffect(() => {
    const clock = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  // Workflow breaks definitions:
  // - Morning Break: 10:30 to 10:45
  // - Afternoon Break 1: 14:30 to 14:45
  // - Afternoon Break 2: 16:00 to 16:15
  // - Evening Break: 19:30 to 19:45
  const breakSchedule = useMemo(() => {
    return [
      { id: 'morning_break', label: 'Morning Respite', start: '10:30', end: '10:45', hStart: 10, mStart: 30, hEnd: 10, mEnd: 45 },
      { id: 'afternoon_break_1', label: 'Mid-Day Sync respite', start: '14:30', end: '14:45', hStart: 14, mStart: 30, hEnd: 14, mEnd: 45 },
      { id: 'afternoon_break_2', label: 'Sustainable Shift Break 2', start: '16:00', end: '16:15', hStart: 16, mStart: 0, hEnd: 16, mEnd: 15 },
      { id: 'evening_break', label: 'Twilight Alignment', start: '19:30', end: '19:45', hStart: 19, mStart: 30, hEnd: 19, mEnd: 45 }
    ];
  }, []);

  const breakStatus = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutesNow = hours * 60 + minutes;

    let activeBreak = null;
    let nextBreak = null;
    let minDiffToNext = Infinity;

    for (const b of breakSchedule) {
      const bStartMin = b.hStart * 60 + b.mStart;
      const bEndMin = b.hEnd * 60 + b.mEnd;

      if (totalMinutesNow >= bStartMin && totalMinutesNow < bEndMin) {
        activeBreak = b;
        break;
      }

      if (bStartMin > totalMinutesNow) {
        const diff = bStartMin - totalMinutesNow;
        if (diff < minDiffToNext) {
          minDiffToNext = diff;
          nextBreak = b;
        }
      }
    }

    // If nextBreak is still null, it means tomorrow's first break
    if (!nextBreak && !activeBreak) {
      nextBreak = breakSchedule[0]; // morning break
    }

    // Format remaining duration to next break
    let countdownText = "";
    if (nextBreak) {
      const bStartMin = nextBreak.hStart * 60 + nextBreak.mStart;
      let diffMin = bStartMin - totalMinutesNow;
      if (diffMin < 0) diffMin += 24 * 60; // next day wrap

      // exact seconds countdown
      const targetTime = new Date(currentTime);
      targetTime.setHours(nextBreak.hStart, nextBreak.mStart, 0, 0);
      if (targetTime.getTime() < currentTime.getTime()) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      const diffMs = targetTime.getTime() - currentTime.getTime();
      const diffSecTotal = Math.floor(diffMs / 1000);
      const countdownMin = Math.floor(diffSecTotal / 60);
      const countdownSec = diffSecTotal % 60;
      countdownText = `${countdownMin.toString().padStart(2, '0')}:${countdownSec.toString().padStart(2, '0')}`;
    }

    return {
      activeBreak,
      nextBreak,
      countdownText
    };
  }, [currentTime, breakSchedule]);

  // Panty Silhouette curve generation
  const silhouettePoints = useMemo(() => {
    const waistLeft = { x: 100, y: 120 };
    const waistRight = { x: 300, y: 120 };
    const hipLeft = { x: 75, y: 155 };
    const hipRight = { x: 325, y: 155 };
    const crotchLeft = { x: 165, y: 310 };
    const crotchRight = { x: 235, y: 310 };

    const pts: { x: number; y: number }[] = [];

    // 1. Waistline Dip Curve (Top edge)
    // Left to Right dipped slightly in center: control (200, 135)
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const cx = 200;
      const cy = 135;
      const x = (1 - t) * (1 - t) * waistLeft.x + 2 * (1 - t) * t * cx + t * t * waistRight.x;
      const y = (1 - t) * (1 - t) * waistLeft.y + 2 * (1 - t) * t * cy + t * t * waistRight.y;
      pts.push({ x, y });
    }

    // 2. Right Hip seam line
    pts.push(hipRight);

    // 3. Right Leg opening (deep inward curve to crotch)
    // Control: (230, 205)
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const cx = 225;
      const cy = 210;
      const x = (1 - t) * (1 - t) * hipRight.x + 2 * (1 - t) * t * cx + t * t * crotchRight.x;
      const y = (1 - t) * (1 - t) * hipRight.y + 2 * (1 - t) * t * cy + t * t * crotchRight.y;
      pts.push({ x, y });
    }

    // 4. Crotch Bottom Line
    pts.push(crotchRight);
    pts.push(crotchLeft);

    // 5. Left Leg opening (deep inward curve to hipLeft)
    // Control: (170, 205)
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const cx = 175;
      const cy = 210;
      const x = (1 - t) * (1 - t) * crotchLeft.x + 2 * (1 - t) * t * cx + t * t * hipLeft.x;
      const y = (1 - t) * (1 - t) * crotchLeft.y + 2 * (1 - t) * t * cy + t * t * hipLeft.y;
      pts.push({ x, y });
    }

    // 6. Left Hip seam line
    pts.push(waistLeft);

    return pts;
  }, []);

  // Helper check if inside polygon
  const isInsideSilhouette = (p: { x: number; y: number }) => {
    let inside = false;
    for (let i = 0, j = silhouettePoints.length - 1; i < silhouettePoints.length; j = i++) {
      const xi = silhouettePoints[i].x, yi = silhouettePoints[i].y;
      const xj = silhouettePoints[j].x, yj = silhouettePoints[j].y;
      const intersect = ((yi > p.y) !== (yj > p.y))
          && (p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Generate lattice control points (stable, responsive to densities)
  const voronoiPoints = useMemo(() => {
    const pts: Point[] = [];

    // Standard baseline distribution seeds
    // 1. Seam Points: along waist and leg curves
    const waistLeft = { x: 100, y: 120 };
    const waistRight = { x: 300, y: 120 };
    const hipLeft = { x: 75, y: 155 };
    const hipRight = { x: 325, y: 155 };
    const crotchLeft = { x: 165, y: 310 };
    const crotchRight = { x: 235, y: 310 };

    // Density of seam elements: scale count with seamDensity
    const waistCount = Math.max(4, Math.floor(18 * seamDensity));
    const legLeftCount = Math.max(4, Math.floor(15 * seamDensity));
    const legRightCount = Math.max(4, Math.floor(15 * seamDensity));

    // Waist points
    for (let i = 0; i <= waistCount; i++) {
      const t = i / waistCount;
      const cx = 200;
      const cy = 135;
      const x = (1 - t) * (1 - t) * waistLeft.x + 2 * (1 - t) * t * cx + t * t * waistRight.x;
      const y = (1 - t) * (1 - t) * waistLeft.y + 2 * (1 - t) * t * cy + t * t * waistRight.y;
      pts.push({ x, y, type: 'seam' });
    }

    // Leg openings right side
    for (let i = 1; i < legRightCount; i++) {
      const t = i / legRightCount;
      const cx = 225;
      const cy = 210;
      const x = (1 - t) * (1 - t) * hipRight.x + 2 * (1 - t) * t * cx + t * t * crotchRight.x;
      const y = (1 - t) * (1 - t) * hipRight.y + 2 * (1 - t) * t * cy + t * t * crotchRight.y;
      pts.push({ x, y, type: 'seam' });
    }

    // Leg openings left side
    for (let i = 1; i < legLeftCount; i++) {
      const t = i / legLeftCount;
      const cx = 175;
      const cy = 210;
      const x = (1 - t) * (1 - t) * crotchLeft.x + 2 * (1 - t) * t * cx + t * t * hipLeft.x;
      const y = (1 - t) * (1 - t) * crotchLeft.y + 2 * (1 - t) * t * cy + t * t * hipLeft.y;
      pts.push({ x, y, type: 'seam' });
    }

    // 2. Mesh interior points (Sparsely thinned on hips/interior)
    // Generate pseudo-random, seed-stable grid inside bounding box
    const interiorDensity = Math.max(2, Math.floor(25 * meshDensity));
    const baseGrid = [
      { x: 150, y: 160 }, { x: 200, y: 165 }, { x: 250, y: 160 },
      { x: 130, y: 200 }, { x: 170, y: 195 }, { x: 200, y: 210 }, { x: 230, y: 195 }, { x: 270, y: 200 },
      { x: 150, y: 240 }, { x: 200, y: 250 }, { x: 250, y: 240 },
      { x: 180, y: 285 }, { x: 220, y: 285 }, { x: 200, y: 295 }
    ];

    // Select subset based on meshDensity fraction
    const selectedGrid = baseGrid.slice(0, interiorDensity);
    selectedGrid.forEach(p => {
      if (isInsideSilhouette(p)) {
        pts.push({ x: p.x, y: p.y, type: 'mesh' });
      }
    });

    return pts;
  }, [seamDensity, meshDensity]);

  // Sutherland-Hodgman clipping algorithm to keep cell inside silhouette
  const clipCell = (poly: { x: number; y: number }[], a: number, b: number, c: number) => {
    const clipped: { x: number; y: number }[] = [];
    if (poly.length === 0) return clipped;

    for (let i = 0; i < poly.length; i++) {
      const s = poly[i];
      const e = poly[(i + 1) % poly.length];

      const dS = a * s.x + b * s.y + c;
      const dE = a * e.x + b * e.y + c;

      if (dS <= 0) {
        if (dE <= 0) {
          clipped.push(e);
        } else {
          const t = dS / (dS - dE);
          clipped.push({
            x: s.x + t * (e.x - s.x),
            y: s.y + t * (e.y - s.y)
          });
        }
      } else {
        if (dE <= 0) {
          const t = dS / (dS - dE);
          clipped.push({
            x: s.x + t * (e.x - s.x),
            y: s.y + t * (e.y - s.y)
          });
          clipped.push(e);
        }
      }
    }
    return clipped;
  };

  // Generate individual Voronoi Cells mapped directly to coordinates
  const voronoiCells = useMemo(() => {
    const cells: VoronoiCell[] = [];

    voronoiPoints.forEach((pi, idx) => {
      // Dynamic breathing of mesh points based on anisotropy and curvature
      let px = pi.x;
      let py = pi.y;

      if (pi.type === 'mesh') {
        const offsetMultiplier = anisotropy * 8;
        px += Math.sin(simulationTime * 0.05 + idx) * offsetMultiplier;
        py += Math.cos(simulationTime * 0.04 + idx) * offsetMultiplier * (1 + curvature);
      }

      // Start with the bounding silhouette
      let cellPoly = [...silhouettePoints];

      // Clip against bisectors of all other points
      for (let j = 0; j < voronoiPoints.length; j++) {
        if (idx === j) continue;
        const pj = voronoiPoints[j];

        let pjx = pj.x;
        let pjy = pj.y;
        if (pj.type === 'mesh') {
          const offsetMultiplier = anisotropy * 8;
          pjx += Math.sin(simulationTime * 0.05 + j) * offsetMultiplier;
          pjy += Math.cos(simulationTime * 0.04 + j) * offsetMultiplier * (1 + curvature);
        }

        const a = pjx - px;
        const b = pjy - py;
        const mx = (px + pjx) / 2;
        const my = (py + pjy) / 2;
        const c = -a * mx - b * my;

        cellPoly = clipCell(cellPoly, a, b, c);
        if (cellPoly.length === 0) break;
      }

      if (cellPoly.length > 0) {
        cells.push({
          point: { x: px, y: py, type: pi.type },
          polygon: cellPoly
        });
      }
    });

    return cells;
  }, [voronoiPoints, silhouettePoints, anisotropy, curvature, simulationTime]);

  // Append new CAD design state to history
  const handleAppendIteration = () => {
    const nextVerIndex = iterations.length + 1;
    // Divide by two and conquer by 4's calculations
    const baseValue = Math.max(1, Math.floor(64 / Math.pow(2, iterations.length - 3)));
    const cellsNum = voronoiCells.length;
    
    // Group cells into modular grids of 4's ("conquer group factor")
    const conquerGroupFactor = Math.ceil(cellsNum / 4);

    const newIter: CADIteration = {
      id: `iter_${Date.now()}`,
      version: `OB_NEB_v${baseValue}.cad`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      seamDensity,
      meshDensity,
      anisotropy,
      refractiveIndex,
      thinFilmThickness,
      pointsCount: voronoiPoints.length,
      cellsCount: cellsNum,
      conquerGroupFactor
    };

    const updated = [...iterations, newIter];
    setIterations(updated);
    localStorage.setItem('aetheros_obsidian_iterations', JSON.stringify(updated));

    toast.success('Appended CAD State Saved', {
      description: `Obsidian-Glass cellular configuration successfully logged to version legacy archives.`
    });
  };

  // Prevent editing the thin film dispersion block above 0nm (Locked rules)
  const handleThinFilmAttempt = (val: number) => {
    if (val > 0) {
      setIsDispersionAlertOpen(true);
      toast.error("Thin-film interference locked", {
        description: "Standard mandates lock to 0nm thickness to preserve pure black reflections."
      });
    } else {
      setThinFilmThickness(0);
    }
  };

  // Canvas Drawing Loop
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    canvas.width = 440;
    canvas.height = 440;

    // Draw Dark Studio Room Background with hazy vignetting
    const bgGrad = ctx.createRadialGradient(220, 220, 50, 220, 220, 280);
    bgGrad.addColorStop(0, '#121115'); // subtle core light leak warm tone
    bgGrad.addColorStop(1, '#050506'); // pure charcoal dark room vignette
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 440, 440);

    // Dynamic light beam / volumetric dust simulation
    ctx.fillStyle = 'rgba(255, 180, 120, 0.007)'; // f/1.8 atmospheric leakage
    ctx.beginPath();
    ctx.arc(220, 120, 150 + Math.sin(simulationTime * 0.02) * 20, 0, Math.PI * 2);
    ctx.fill();

    // 1. Draw Body Backing Silhouette (Warm Skin Tones, underexposed cinematic atmosphere)
    ctx.save();
    ctx.beginPath();
    // Slightly inflate silhouette bounds to represent skin border
    ctx.moveTo(silhouettePoints[0].x, silhouettePoints[0].y);
    for (let i = 1; i < silhouettePoints.length; i++) {
      ctx.lineTo(silhouettePoints[i].x, silhouettePoints[i].y);
    }
    ctx.closePath();
    ctx.clip();

    // Skin Tone Linear Gradient (cinematic side light)
    const skinGrad = ctx.createLinearGradient(100, 120, 340, 310);
    skinGrad.addColorStop(0, '#f9ebd2'); // warm highlights
    skinGrad.addColorStop(0.5, '#debca0'); // ambient skin
    skinGrad.addColorStop(1, '#613e2a'); // rich deep shadows of the dark-room
    ctx.fillStyle = skinGrad;
    ctx.fillRect(0, 0, 440, 440);
    ctx.restore();

    // 2. Draw Sharp Cellular Shadows (Opacity = 0.9, Stark Single Point Light)
    // Offset is driven by studio lightAngle
    const angleRad = (lightAngle * Math.PI) / 180;
    const shadowDist = 14;
    const sdx = Math.cos(angleRad) * shadowDist;
    const sdy = Math.sin(angleRad) * shadowDist;

    ctx.save();
    // Clip to skin region so shadows are only cast onto the skin
    ctx.beginPath();
    ctx.moveTo(silhouettePoints[0].x, silhouettePoints[0].y);
    for (let i = 1; i < silhouettePoints.length; i++) {
      ctx.lineTo(silhouettePoints[i].x, silhouettePoints[i].y);
    }
    ctx.closePath();
    ctx.clip();

    // Render cells in shadow layer
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
    voronoiCells.forEach(cell => {
      if (cell.polygon.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(cell.polygon[0].x + sdx, cell.polygon[0].y + sdy);
      for (let k = 1; k < cell.polygon.length; k++) {
        ctx.lineTo(cell.polygon[k].x + sdx, cell.polygon[k].y + sdy);
      }
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();

    // 3. Draw Liquid-Black Obsidian-Glass Mesh
    voronoiCells.forEach((cell, cellIdx) => {
      if (cell.polygon.length === 0) return;

      const isHovered = cellIdx === hoveredCellIndex;

      // Fill cellular region with translucent liquid-black
      // refractive index scale modifies fill base opacity
      const baseOpacity = isHovered ? 0.95 : 0.78;
      ctx.fillStyle = `rgba(3, 3, 4, ${baseOpacity})`;
      ctx.beginPath();
      ctx.moveTo(cell.polygon[0].x, cell.polygon[0].y);
      for (let k = 1; k < cell.polygon.length; k++) {
        ctx.lineTo(cell.polygon[k].x, cell.polygon[k].y);
      }
      ctx.closePath();
      ctx.fill();

      // Liquid shine gradient inside cell boundaries
      ctx.strokeStyle = '#050505';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Hyper-reflective Specular Highlights (Anisotropic liquid-glass aesthetics)
      // Calculated using Fresnel reflection (driven by n=1.65)
      const r0 = Math.pow((refractiveIndex - 1) / (refractiveIndex + 1), 2);
      // Fresnel approximation based on light distance to cell center
      const centerX = cell.point.x;
      const centerY = cell.point.y;
      const distFromLight = Math.sqrt(Math.pow(centerX - (220 + sdx), 2) + Math.pow(centerY - (120 + sdy), 2));
      const cosTheta = Math.max(0, 1 - distFromLight / 350);
      const fresnel = r0 + (1 - r0) * Math.pow(1 - cosTheta, 5);

      // Specular Highlight Stroke: Pure black reflections with zero chromatic rainbow dispersion
      // anisotropy shapes the highlight length and stretch
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cell.polygon[0].x, cell.polygon[0].y);
      for (let k = 1; k < cell.polygon.length; k++) {
        ctx.lineTo(cell.polygon[k].x, cell.polygon[k].y);
      }
      ctx.closePath();
      ctx.clip();

      const shinyGrad = ctx.createLinearGradient(
        centerX - anisotropy * 40,
        centerY - anisotropy * 40,
        centerX + anisotropy * 40,
        centerY + anisotropy * 40
      );
      shinyGrad.addColorStop(0, 'rgba(8, 8, 9, 0.9)');
      // Specular color vanta highlight colors: (0.05, 0.05, 0.05) with hyper shine highlight
      const glowScale = Math.min(1, Math.max(0.1, fresnel * 2.8));
      shinyGrad.addColorStop(0.5, `rgba(255, 255, 255, ${glowScale * 0.12})`);
      shinyGrad.addColorStop(1, 'rgba(2, 2, 3, 0.9)');
      ctx.fillStyle = shinyGrad;
      ctx.fill();
      ctx.restore();

      // Sharp inner cell highlights
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${isHovered ? 0.28 : 0.08})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cell.polygon[0].x + 1.5, cell.polygon[0].y + 1.5);
      for (let k = 1; k < cell.polygon.length; k++) {
        ctx.lineTo(cell.polygon[k].x + 1.5, cell.polygon[k].y + 1.5);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });

    // 4. Ambient Volumetric Floating Shards (Obsidian Glass Particles)
    ctx.save();
    const shardCount = 12;
    for (let i = 0; i < shardCount; i++) {
      const slowTick = simulationTime * 0.005 + (i * 2.5);
      // Slow float across the canvas
      const sx = (50 + (i * 35) + Math.sin(slowTick) * 30) % 400;
      const sy = (40 + (i * 45) + Math.cos(slowTick) * 20) % 400;
      const shardSize = 4 + (i % 3) * 3;

      // Skip drawing if inside panty silhouette to keep the silhouette crisp
      if (isInsideSilhouette({ x: sx, y: sy })) continue;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(slowTick * 3);

      // Draw reflective shard polygon
      ctx.beginPath();
      ctx.moveTo(0, -shardSize);
      ctx.lineTo(shardSize, shardSize / 2);
      ctx.lineTo(-shardSize, shardSize);
      ctx.closePath();

      // Liquid black face with crisp specularity reflection
      ctx.fillStyle = 'rgba(5, 5, 6, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // 5. Heavy 35mm Film Grain Simulation
    // Generates static high contrast grain dots dynamically
    ctx.save();
    const grainImgData = ctx.createImageData(440, 440);
    const data = grainImgData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < 0.18) { // grain density
        const val = Math.random() < 0.5 ? 0 : 255;
        // highly underexposed warm grey tint
        data[i] = val;     // R
        data[i + 1] = val; // G
        data[i + 2] = val; // B
        data[i + 3] = 11;  // very low alpha for heavy 35mm grit overlay
      }
    }
    ctx.putImageData(grainImgData, 0, 0);
    ctx.restore();

  }, [voronoiCells, silhouettePoints, shadowOpacity, lightAngle, refractiveIndex, anisotropy, simulationTime, hoveredCellIndex, curvature]);

  // Handle cell hover detection based on standard distance check
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Find the cell containing this point or nearest
    let nearestIdx = -1;
    let minDist = 35; // hover sensitivity bounding box

    voronoiCells.forEach((cell, idx) => {
      const dist = Math.sqrt(Math.pow(cell.point.x - mx, 2) + Math.pow(cell.point.y - my, 2));
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = idx;
      }
    });

    setHoveredCellIndex(nearestIdx >= 0 ? nearestIdx : null);
  };

  const handleMouseLeave = () => {
    setHoveredCellIndex(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] overflow-hidden text-neutral-200 custom-scrollbar relative">
      
      {/* Editorial Floating Light Leak Effect (f/1.8 atmospheric leakage) */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-amber-900/10 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-red-950/10 blur-[150px] pointer-events-none mix-blend-screen" />

      {/* Elegant Header Block */}
      <div className="px-8 py-5 bg-black border-b border-neutral-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-1 px-2.5 bg-neutral-900 text-amber-500 font-mono text-[9px] font-bold tracking-widest rounded uppercase">
              STUDIO EDITION // OBSIDIAN NEBULA
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          </div>
          <h2 className="font-sans font-black text-3xl text-white tracking-widest uppercase mt-1">
            Obsidian Nebula
          </h2>
          <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
            Architecture of intimate liquid meshes // Volumetric f/1.8 cellular render
          </p>
        </div>

        {/* Real-time Work shift break state */}
        <div className="flex items-center gap-4 bg-neutral-950 p-3 rounded-xl border border-neutral-800/60 font-mono text-left max-w-sm">
          <div className="p-2 bg-neutral-900/80 rounded-lg text-amber-500 border border-neutral-800 shrink-0">
            <Clock className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400 uppercase font-bold">
                {breakStatus.activeBreak ? "SYNCHRONIZED BREAK" : "SUSTAINABLE WORK SHIFT"}
              </span>
              <span className="text-[9px] bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-500">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            
            {breakStatus.activeBreak ? (
              <p className="text-[11px] font-bold text-green-500 uppercase tracking-tight">
                ACTIVE: {breakStatus.activeBreak.label} (ALIGN NOW)
              </p>
            ) : (
              <p className="text-[11px] font-bold text-neutral-300 uppercase tracking-tight">
                Break in <span className="text-amber-500">{breakStatus.countdownText}</span> ({breakStatus.nextBreak?.label})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sustainable Break Overlay Mode (Fades over if break is active) */}
      <AnimatePresence>
        {breakStatus.activeBreak && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#050506]/95 z-50 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="absolute top-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none animate-pulse" />
            <div className="w-20 h-20 rounded-full border border-neutral-800 flex items-center justify-center mb-6 bg-neutral-950/60 shadow-[0_0_50px_rgba(245,158,11,0.05)]">
              <Timer className="w-10 h-10 text-amber-500 animate-pulse" />
            </div>
            
            <span className="px-3 py-1 bg-neutral-900 text-neutral-500 font-mono text-[9px] tracking-[0.4em] rounded uppercase mb-2">
              SYSTEM_MANDATED_ALIGNMENT
            </span>
            <h3 className="text-3xl font-sans font-black text-white uppercase tracking-widest mb-4">
              {breakStatus.activeBreak.label}
            </h3>
            
            <p className="max-w-md text-sm text-neutral-400 font-mono leading-relaxed mb-6">
              "Sustainable computing is balanced labor. Take 15 minutes away from screens, align your posture, hydrate, and breathe."
            </p>

            <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl font-mono text-xs max-w-sm mb-8">
              <div className="flex justify-between items-center gap-12 mb-2">
                <span className="text-neutral-500">Break Schedule:</span>
                <span className="text-amber-500 font-bold">{breakStatus.activeBreak.start} - {breakStatus.activeBreak.end}</span>
              </div>
              <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 animate-pulse" style={{ width: '100%' }} />
              </div>
            </div>

            <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest animate-pulse">
              System monitoring active // Work interface will restore automatically at {breakStatus.activeBreak.end}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main CAD Editor Grid Layout */}
      <div className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-y-auto custom-scrollbar">
        
        {/* LEFT COLUMN: Physical Shader Controls (xl:col-span-4) */}
        <div className="xl:col-span-4 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="bg-[#0b0b0d]/80 border border-neutral-900 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-900">
                <Sliders className="w-4 h-4 text-amber-500" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-200">
                  Lattice Density Parameters
                </h3>
              </div>

              {/* Seam Density */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-neutral-400 uppercase font-medium">Seam Density (D_seam)</span>
                  <span className="text-amber-500 font-bold">{seamDensity.toFixed(2)}</span>
                </div>
                <input 
                  type="range"
                  min="0.30"
                  max="1.00"
                  step="0.05"
                  value={seamDensity}
                  onChange={(e) => setSeamDensity(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-neutral-900 rounded-lg cursor-pointer"
                />
                <div className="text-[9px] text-neutral-500 font-mono leading-none">
                  Determines point-grid spacing along waistband and leg line seams
                </div>
              </div>

              {/* Mesh Density */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-neutral-400 uppercase font-medium">Hips Mesh Density (D_mesh)</span>
                  <span className="text-amber-500 font-bold">{meshDensity.toFixed(2)}</span>
                </div>
                <input 
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.05"
                  value={meshDensity}
                  onChange={(e) => setMeshDensity(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-neutral-900 rounded-lg cursor-pointer"
                />
                <div className="text-[9px] text-neutral-500 font-mono leading-none">
                  Sparsity index across side hips (thins out material coverage)
                </div>
              </div>

              {/* Curvature Warping */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-neutral-400 uppercase font-medium">Body Curvature Warping</span>
                  <span className="text-amber-500 font-bold">{curvature.toFixed(2)}</span>
                </div>
                <input 
                  type="range"
                  min="0.10"
                  max="0.90"
                  step="0.05"
                  value={curvature}
                  onChange={(e) => setCurvature(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-neutral-900 rounded-lg cursor-pointer"
                />
                <div className="text-[9px] text-neutral-500 font-mono leading-none">
                  Multiplies physical Voronoi cell stretching across spatial curves
                </div>
              </div>
            </div>

            {/* Material Physics & Shader Logic Block */}
            <div className="bg-[#0b0b0d]/80 border border-neutral-900 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-900">
                <Cpu className="w-4 h-4 text-amber-500" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-200">
                  Obsidian Shader Physics
                </h3>
              </div>

              {/* Refractive Index */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-neutral-400 uppercase font-medium">Refractive Index (n_glass)</span>
                  <span className="text-amber-500 font-bold">{refractiveIndex.toFixed(2)}</span>
                </div>
                <input 
                  type="range"
                  min="1.30"
                  max="1.95"
                  step="0.05"
                  value={refractiveIndex}
                  onChange={(e) => setRefractiveIndex(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-neutral-900 rounded-lg cursor-pointer"
                />
                <div className="text-[9px] text-neutral-500 font-mono leading-none flex justify-between">
                  <span>Liquid obsidian default: n = 1.65</span>
                  <span>Fresnel(n_glass) reflection</span>
                </div>
              </div>

              {/* Anisotropy */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-neutral-400 uppercase font-medium">Anisotropic Stretch</span>
                  <span className="text-amber-500 font-bold">{anisotropy.toFixed(2)}</span>
                </div>
                <input 
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={anisotropy}
                  onChange={(e) => setAnisotropy(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1 bg-neutral-900 rounded-lg cursor-pointer"
                />
                <div className="text-[9px] text-neutral-500 font-mono leading-none">
                  Stretches the highlight reflections to simulate raw liquid-glass
                </div>
              </div>

              {/* Thin-film Dispersion Lock (strictly 0nm) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-neutral-400 uppercase font-medium flex items-center gap-1">
                    Thin-Film Thickness
                    <Lock className="w-3 h-3 text-red-500" />
                  </span>
                  <span className="text-red-500 font-bold font-mono">0 nm // STATIC</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="400"
                  step="50"
                  value={thinFilmThickness}
                  onChange={(e) => handleThinFilmAttempt(parseInt(e.target.value, 10))}
                  className="w-full accent-red-500 h-1 bg-neutral-900 rounded-lg cursor-pointer opacity-70"
                />
                <div className="text-[9px] text-red-400/80 font-mono leading-relaxed">
                  * STRICT CONVERSATION RULE: Force locked at 0nm to ensure pure black specular highlights with zero chromatic dispersion.
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Model Board */}
          <div className="bg-[#0d0909]/40 border border-neutral-900/60 p-4 rounded-xl space-y-2">
            <span className="text-[8px] font-mono font-black text-neutral-500 uppercase tracking-widest">
              ACTIVE MATHEMATICAL RESOLUTION
            </span>
            <div className="p-3 bg-black/60 rounded border border-neutral-950 font-mono text-[10px] text-amber-500/90 leading-relaxed text-center italic">
              Density = Voronoi(P) * Curvature(Body)
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400">
              <span>Seam points: {Math.max(4, Math.floor(18 * seamDensity)) + 2 * Math.max(4, Math.floor(15 * seamDensity))}</span>
              <span>Mesh cells: {voronoiCells.length}</span>
              <span>Anisotropy Warp: {anisotropy.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Real-time CAD Simulation View (xl:col-span-5) */}
        <div className="xl:col-span-5 flex flex-col items-center justify-center bg-[#070708] border border-neutral-900 rounded-2xl p-6 relative shadow-xl overflow-hidden min-h-[460px]">
          
          {/* Volumetric f/1.8 Studio Dust and Grain Canvas container */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 font-mono text-[9px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              SINGLE_POINT_LIGHT: ACTIVE
            </span>
            <span>SHADOW_OPACITY: {shadowOpacity.toFixed(2)}</span>
            <span>n_REFRACTIVE_INDEX: 1.65</span>
          </div>

          <div className="absolute top-4 right-4 z-10 font-mono text-[9px] text-neutral-500 flex flex-col items-end">
            <span>MODEL: VOLUMETRIC_F_1.8</span>
            <span>GRAIN: 35MM_grit_0.18</span>
          </div>

          <div className="relative border-4 border-black rounded-[2rem] overflow-hidden bg-neutral-950/80 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            <canvas 
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="block cursor-crosshair transition-opacity duration-300"
            />

            {/* Simulated interactive tooltip for cell inspection */}
            {hoveredCellIndex !== null && voronoiCells[hoveredCellIndex] && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/90 border border-neutral-800 rounded-xl font-mono text-[9px] text-neutral-300 pointer-events-none backdrop-blur animate-in fade-in duration-200">
                <div className="flex justify-between items-center text-amber-500 font-bold mb-1">
                  <span>CELL_ID: OB_CELL_{hoveredCellIndex.toString().padStart(3, '0')}</span>
                  <span className="uppercase text-[8px] bg-neutral-800 px-1 rounded text-neutral-400">
                    {voronoiCells[hoveredCellIndex].point.type === 'seam' ? 'Structural Seam Edge' : 'Hips Cellular Grid'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[8px]">
                  <div>Coord: X={Math.round(voronoiCells[hoveredCellIndex].point.x)}, Y={Math.round(voronoiCells[hoveredCellIndex].point.y)}</div>
                  <div className="text-right">Local Density: {(voronoiCells[hoveredCellIndex].point.type === 'seam' ? seamDensity : meshDensity).toFixed(3)}</div>
                  <div>Reflection index: {(refractiveIndex * (1 + anisotropy * 0.1)).toFixed(3)}</div>
                  <div className="text-right text-red-400">Zero chromatic dispersion</div>
                </div>
              </div>
            )}
          </div>

          {/* Canvas controller layout underneath */}
          <div className="w-full max-w-[400px] mt-4 grid grid-cols-2 gap-4">
            
            {/* Shadow opacity controller */}
            <div className="space-y-1">
              <label className="flex justify-between text-[10px] font-mono text-neutral-400 uppercase">
                <span>Shadow Opacity</span>
                <span>{shadowOpacity.toFixed(2)}</span>
              </label>
              <input 
                type="range"
                min="0.50"
                max="0.95"
                step="0.05"
                value={shadowOpacity}
                onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-neutral-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Light angle controller */}
            <div className="space-y-1">
              <label className="flex justify-between text-[10px] font-mono text-neutral-400 uppercase">
                <span>Light Angle</span>
                <span>{lightAngle}°</span>
              </label>
              <input 
                type="range"
                min="0"
                max="360"
                step="15"
                value={lightAngle}
                onChange={(e) => setLightAngle(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 h-1 bg-neutral-900 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CAD Iteration Log Vault (xl:col-span-3) */}
        <div className="xl:col-span-3 space-y-5 flex flex-col justify-between">
          <div className="bg-[#0b0b0d]/80 border border-neutral-900 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-900 justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-500" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-200">
                  CAD Iteration Vault
                </h3>
              </div>
              <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-mono font-bold">
                APPEND MODE ONLY
              </span>
            </div>

            <div className="text-[10px] text-neutral-400 font-mono leading-relaxed">
              * MANDATE: Legacy files are never to be deleted to capture design history. Outputs must divide by two's and conquer by 4's.
            </div>

            {/* Custom iterative catalog */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
              {iterations.map((iter, idx) => (
                <div 
                  key={iter.id}
                  className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-900/80 hover:border-neutral-800 transition-colors text-[9px] font-mono flex flex-col gap-1"
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-amber-500 text-[10px]">{iter.version}</span>
                    <span className="text-neutral-500 text-[8px]">{iter.timestamp}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-neutral-400">
                    <span>Points Grid: {iter.pointsCount} pts</span>
                    <span className="text-right">Cells: {iter.cellsCount}</span>
                    <span>D_seam: {iter.seamDensity.toFixed(2)}</span>
                    <span className="text-right text-amber-600 font-bold">Group factor: {iter.conquerGroupFactor}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAppendIteration}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 active:scale-98 text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Append New CAD Iteration
            </button>
          </div>

          {/* Candid Sunday Morning Editorial vibe text block */}
          <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[8px] font-mono font-black text-neutral-400 uppercase tracking-widest">
                Sunday Morning candid // quiet & expensive
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-serif leading-relaxed italic">
              "We constructed a garment designed to feel like air yet perform like architectural shield. Liquid black cells expand as they brush the waist, casting geometric lattices across warm morning skin."
            </p>
            <div className="text-[8px] font-mono text-neutral-500 uppercase tracking-wider text-right">
              — AETHEROS COUTURE // VOL 04
            </div>
          </div>
        </div>

      </div>

      {/* Warning modal for thin-film rainbows */}
      <AnimatePresence>
        {isDispersionAlertOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-950 border-2 border-red-500/30 rounded-2xl p-6 max-w-sm text-center relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)]"
            >
              <div className="w-12 h-12 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="text-white text-lg font-bold uppercase font-mono tracking-wider mb-2">
                Pure Black Constraint Locked
              </h4>
              <p className="text-neutral-400 text-xs font-mono leading-relaxed mb-6">
                Editorial direction locks Thin-Film Thickness to <span className="text-red-400 font-bold">0nm</span>. Any dispersion of chromatic rainbow shades destroys the pure liquid-black Vanta aesthetic.
              </p>
              <button 
                onClick={() => setIsDispersionAlertOpen(false)}
                className="px-5 py-1.5 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 text-xs font-mono rounded-lg transition-colors uppercase font-bold"
              >
                Restore Monochromatic Pureness
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
