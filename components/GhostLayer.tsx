import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ghost, 
  Compass, 
  Sliders, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Eye, 
  Sparkles, 
  Maximize2,
  Minimize2,
  Grid,
  Moon,
  Zap,
  Magnet,
  Shield,
  MousePointer,
  Pin
} from 'lucide-react';
import { toast } from 'sonner';
import { safeStorage } from '../services/safeStorage';

interface GhostLayerProps {
  children: React.ReactNode;
}

export const GhostLayer: React.FC<GhostLayerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  
  // Position coordinates stored as state & persisted
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 }); // Home anchor when follow is active
  const [opacity, setOpacity] = useState<number>(0.95);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isDrifting, setIsDrifting] = useState<boolean>(true);
  const [showHUD, setShowHUD] = useState<boolean>(false);
  const [showSpiritLattice, setShowSpiritLattice] = useState<boolean>(false);
  const [latticeStyle, setLatticeStyle] = useState<'matrix' | 'neon' | 'scanline'>('neon');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Mouse inactivity and sleep states
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [autoIdle, setAutoIdle] = useState<boolean>(true);
  const [idleTimeout, setIdleTimeout] = useState<number>(8000); // Default 8 seconds of inactivity
  const [idleMicroBehavior, setIdleMicroBehavior] = useState<'none' | 'bobbing' | 'look_left' | 'look_right' | 'jitter' | 'sigh' | 'stretch'>('none');

  // Trigger idle micro-behaviors periodically when the companion is sleeping/idle
  useEffect(() => {
    if (!isIdle) {
      setIdleMicroBehavior('none');
      return;
    }

    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const triggerRandomBehavior = () => {
      const behaviors: Array<'bobbing' | 'look_left' | 'look_right' | 'jitter' | 'sigh' | 'stretch'> = [
        'bobbing',
        'look_left',
        'look_right',
        'jitter',
        'sigh',
        'stretch'
      ];
      // Pick a random behavior
      const randomBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      setIdleMicroBehavior(randomBehavior);

      // Play a very subtle mechanical or ambient hum depending on the behavior
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        let freq = 120;
        let vol = 0.001;
        let dur = 0.4;
        
        if (randomBehavior === 'jitter') {
          freq = 240;
          osc.type = 'triangle';
          vol = 0.002;
          dur = 0.2;
        } else if (randomBehavior === 'sigh') {
          freq = 90;
          vol = 0.0008;
          dur = 0.6;
        } else if (randomBehavior === 'stretch') {
          freq = 140;
          vol = 0.001;
          dur = 0.3;
        }

        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      } catch (e) {}

      // Reset to none after the duration of the animation (e.g., 1.5s)
      timeoutId = setTimeout(() => {
        setIdleMicroBehavior('none');
      }, 1500);
    };

    // Trigger every 5 seconds
    intervalId = setInterval(triggerRandomBehavior, 5000);

    // Initial trigger after 2.5 seconds
    const initialTriggerId = setTimeout(triggerRandomBehavior, 2500);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      clearTimeout(initialTriggerId);
    };
  }, [isIdle]);

  // Magnetic & Avoidance fields
  const [isMagnetic, setIsMagnetic] = useState<boolean>(true);
  const [avoidObstacles, setAvoidObstacles] = useState<boolean>(true);
  const [activeSnapEffect, setActiveSnapEffect] = useState<'none' | 'edge' | 'obstacle'>('none');
  const [dblClickPin, setDblClickPin] = useState<boolean>(true);

  // Follow Mode States & Refs
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followStyle, setFollowStyle] = useState<'leash' | 'chase'>('leash');
  const [followRadius, setFollowRadius] = useState<number>(150);
  const [followSpeed, setFollowSpeed] = useState<number>(0.06);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Visual Tether Settings, Refs & State
  const [tetherEnabled, setTetherEnabled] = useState<boolean>(true);
  const tetherContainerRef = useRef<SVGSVGElement>(null);
  const tetherPathRef = useRef<SVGPathElement>(null);
  const tetherGlowRef = useRef<SVGPathElement>(null);
  const tetherParticleRef = useRef<SVGCircleElement>(null);
  const tetherLabelGroupRef = useRef<SVGGElement>(null);
  const tetherLabelRef = useRef<SVGTextElement>(null);
  const tetherLabelBgRef = useRef<SVGRectElement>(null);
  
  const snapTargetRef = useRef<{ x: number; y: number; label: string } | null>(null);
  const tetherOpacityRef = useRef<number>(0);
  const particleProgressRef = useRef<number>(0);

  // Close context menu on global click or right-click anywhere else
  useEffect(() => {
    if (!contextMenu) return;

    const handleGlobalClick = () => {
      setContextMenu(null);
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('contextmenu', handleGlobalClick);
    
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('contextmenu', handleGlobalClick);
    };
  }, [contextMenu]);

  // Load coordinates & configurations on mount
  useEffect(() => {
    // Asynchronously load the coordinates from safeStorage
    const loadCoords = async () => {
      try {
        const savedCoords = await safeStorage.getItem('aether_ghost_coords');
        if (savedCoords) {
          const parsed = JSON.parse(savedCoords);
          setPosition(parsed);
          setAnchorPosition(parsed);
        }
      } catch (e) {
        console.warn('Failed to load GhostLayer coordinates from safeStorage', e);
      }
    };
    loadCoords();

    try {
      
      const savedOpacity = localStorage.getItem('aether_ghost_opacity');
      if (savedOpacity) {
        setOpacity(parseFloat(savedOpacity));
      }

      const savedLocked = localStorage.getItem('aether_ghost_locked');
      if (savedLocked) {
        setIsLocked(savedLocked === 'true');
      }

      const savedDrift = localStorage.getItem('aether_ghost_drift');
      if (savedDrift) {
        setIsDrifting(savedDrift === 'true');
      }

      const savedLattice = localStorage.getItem('aether_ghost_lattice');
      if (savedLattice) {
        setShowSpiritLattice(savedLattice === 'true');
      }

      const savedAutoIdle = localStorage.getItem('aether_ghost_autoidle');
      if (savedAutoIdle) {
        setAutoIdle(savedAutoIdle === 'true');
      }

      const savedTimeout = localStorage.getItem('aether_ghost_idletimeout');
      if (savedTimeout) {
        setIdleTimeout(parseInt(savedTimeout, 10));
      }

      const savedMagnetic = localStorage.getItem('aether_ghost_magnetic');
      if (savedMagnetic) {
        setIsMagnetic(savedMagnetic === 'true');
      }

      const savedAvoid = localStorage.getItem('aether_ghost_avoid');
      if (savedAvoid) {
        setAvoidObstacles(savedAvoid === 'true');
      }

      const savedDblClickPin = localStorage.getItem('aether_ghost_dblclick_pin');
      if (savedDblClickPin) {
        setDblClickPin(savedDblClickPin === 'true');
      }

      const savedFollowing = localStorage.getItem('aether_ghost_following');
      if (savedFollowing) {
        setIsFollowing(savedFollowing === 'true');
      }

      const savedFollowStyle = localStorage.getItem('aether_ghost_follow_style');
      if (savedFollowStyle === 'leash' || savedFollowStyle === 'chase') {
        setFollowStyle(savedFollowStyle as 'leash' | 'chase');
      }

      const savedFollowRadius = localStorage.getItem('aether_ghost_follow_radius');
      if (savedFollowRadius) {
        setFollowRadius(parseInt(savedFollowRadius, 10));
      }

      const savedFollowSpeed = localStorage.getItem('aether_ghost_follow_speed');
      if (savedFollowSpeed) {
        setFollowSpeed(parseFloat(savedFollowSpeed));
      }

      const savedTether = localStorage.getItem('aether_ghost_tether_enabled');
      if (savedTether) {
        setTetherEnabled(savedTether === 'true');
      }
    } catch (e) {
      console.warn('Failed to load GhostLayer coordinates', e);
    }
  }, []);

  const toggleTether = () => {
    const next = !tetherEnabled;
    setTetherEnabled(next);
    localStorage.setItem('aether_ghost_tether_enabled', next.toString());
    toast.success(next ? 'Visual Tether linkage activated.' : 'Visual Tether disconnected.');
  };

  // High-performance animation frame loop to update SVG Tether path dynamically
  useEffect(() => {
    if (!tetherEnabled) {
      if (tetherContainerRef.current) {
        tetherContainerRef.current.style.display = 'none';
      }
      return;
    }

    let activeFrameId: number;
    
    const updateTether = () => {
      // 1. Check if we need to show the tether
      let isTetherActive = false;
      let targetX = 0;
      let targetY = 0;
      let labelText = '';

      if (isDragging) {
        isTetherActive = true;
        targetX = mouseRef.current.x;
        targetY = mouseRef.current.y;
        labelText = 'SPECTRAL LINK';
      } else if (isFollowing && !isIdle) {
        isTetherActive = true;
        targetX = mouseRef.current.x;
        targetY = mouseRef.current.y;
        labelText = 'AUTONOMIC TRACKING';
      } else if (activeSnapEffect !== 'none' && snapTargetRef.current) {
        isTetherActive = true;
        targetX = snapTargetRef.current.x;
        targetY = snapTargetRef.current.y;
        labelText = snapTargetRef.current.label;
      }

      // 2. Smoothly transition tether opacity
      const targetOpacity = isTetherActive ? 1 : 0;
      tetherOpacityRef.current += (targetOpacity - tetherOpacityRef.current) * 0.15;

      const container = tetherContainerRef.current;
      if (container) {
        if (tetherOpacityRef.current < 0.01) {
          container.style.display = 'none';
        } else {
          container.style.display = 'block';
          container.style.opacity = tetherOpacityRef.current.toString();
          
          if (ghostRef.current) {
            const rect = ghostRef.current.getBoundingClientRect();
            const originX = rect.left + rect.width / 2;
            const originY = rect.top + rect.height / 2;

            // 3. Compute curved path coordinates
            const midX = (originX + targetX) / 2;
            const midY = (originY + targetY) / 2;

            const time = Date.now() / 1000;
            // Oscillate wave offset to make it look floating & organic
            const waveOffset = Math.sin(time * 3.5) * 12;

            const dx = targetX - originX;
            const dy = targetY - originY;
            const length = Math.sqrt(dx * dx + dy * dy);
            let nx = 0;
            let ny = 0;
            if (length > 0) {
              nx = -dy / length;
              ny = dx / length;
            }

            const ctrlX = midX + nx * waveOffset;
            const ctrlY = midY + ny * waveOffset;

            const pathD = `M ${originX} ${originY} Q ${ctrlX} ${ctrlY} ${targetX} ${targetY}`;

            // Update SVG paths
            if (tetherPathRef.current) {
              tetherPathRef.current.setAttribute('d', pathD);
            }
            if (tetherGlowRef.current) {
              tetherGlowRef.current.setAttribute('d', pathD);
            }

            // Update particle position along Bezier curve
            particleProgressRef.current = (particleProgressRef.current + 0.012) % 1.0;
            const t = particleProgressRef.current;
            const mt = 1 - t;
            const px = mt * mt * originX + 2 * mt * t * ctrlX + t * t * targetX;
            const py = mt * mt * originY + 2 * mt * t * ctrlY + t * t * targetY;

            if (tetherParticleRef.current) {
              tetherParticleRef.current.setAttribute('cx', px.toString());
              tetherParticleRef.current.setAttribute('cy', py.toString());
            }

            // Update target label
            if (tetherLabelGroupRef.current) {
              tetherLabelGroupRef.current.setAttribute('transform', `translate(${targetX}, ${targetY})`);
            }
            if (tetherLabelRef.current) {
              tetherLabelRef.current.textContent = labelText;
              
              // Dynamically adjust colors & glow depending on state
              let strokeColor = '#c084fc'; // purple
              let textColor = '#e9d5ff';

              if (labelText.includes('DEFLECTION')) {
                strokeColor = '#fbbf24'; // amber
                textColor = '#fde68a';
              } else if (labelText.includes('SNAP')) {
                strokeColor = '#22d3ee'; // cyan
                textColor = '#cffafe';
              } else if (labelText.includes('AUTONOMIC')) {
                strokeColor = '#818cf8'; // indigo
                textColor = '#e0e7ff';
              }

              if (tetherPathRef.current) {
                tetherPathRef.current.setAttribute('stroke', strokeColor);
              }
              if (tetherGlowRef.current) {
                tetherGlowRef.current.setAttribute('stroke', strokeColor);
              }
              if (tetherParticleRef.current) {
                tetherParticleRef.current.setAttribute('fill', strokeColor);
              }
              tetherLabelRef.current.setAttribute('fill', textColor);
              if (tetherLabelBgRef.current) {
                tetherLabelBgRef.current.setAttribute('stroke', strokeColor);
              }
            }
          }
        }
      }

      activeFrameId = requestAnimationFrame(updateTether);
    };

    activeFrameId = requestAnimationFrame(updateTether);
    return () => {
      cancelAnimationFrame(activeFrameId);
    };
  }, [tetherEnabled, isDragging, isFollowing, isIdle, activeSnapEffect]);

  // Mouse inactivity tracking to auto-sleep
  useEffect(() => {
    if (!autoIdle) {
      setIsIdle(false);
      return;
    }

    let timer: NodeJS.Timeout;

    const handleUserActivity = () => {
      setIsIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsIdle(true);
      }, idleTimeout);
    };

    // Events that signal active use
    const activeEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    handleUserActivity();

    activeEvents.forEach(evt => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    return () => {
      clearTimeout(timer);
      activeEvents.forEach(evt => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [autoIdle, idleTimeout]);

  // Save coordinates when dragging ends
  const handleDragEnd = async (event: any, info: any) => {
    // Accumulate the new position offset relative to starting position
    let newX = position.x + info.offset.x;
    let newY = position.y + info.offset.y;
    
    let snapFeedback: 'none' | 'edge' | 'obstacle' = 'none';
    let snapMsg = '';

    // Check snapping/avoidance if element and reference are active
    if (ghostRef.current) {
      const rect = ghostRef.current.getBoundingClientRect();
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      
      let totalPushX = 0;
      let totalPushY = 0;
      let avoidedCount = 0;
      let lastAvoidedCenter = { x: 0, y: 0 };

      // 1. Obstacle Avoidance (Avoid covering important interactive elements)
      if (avoidObstacles) {
        // Query visible interactive elements (buttons, inputs, select fields, links)
        const interactiveSelectors = 'button, input, textarea, select, [role="button"], a';
        const obstacles = Array.from(document.querySelectorAll(interactiveSelectors));

        obstacles.forEach(el => {
          // Skip if the element is inside the ghost layer container itself!
          if (containerRef.current?.contains(el)) return;
          
          const obsRect = el.getBoundingClientRect();
          // Filter to visible, reasonably sized elements inside viewport
          if (obsRect.width > 0 && obsRect.height > 0 && obsRect.top < winH && obsRect.left < winW) {
            // Check bounding box overlap
            const isOverlapping = !(
              rect.right < obsRect.left ||
              rect.left > obsRect.right ||
              rect.bottom < obsRect.top ||
              rect.top > obsRect.bottom
            );

            if (isOverlapping) {
              // Calculate overlap resolution vector to push the companion away
              const ghostCenter = { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
              const obsCenter = { x: (obsRect.left + obsRect.right) / 2, y: (obsRect.top + obsRect.bottom) / 2 };
              
              // Capture obstacle center for high-fidelity visual tether
              lastAvoidedCenter = obsCenter;

              const overlapX = Math.min(rect.right, obsRect.right) - Math.max(rect.left, obsRect.left);
              const overlapY = Math.min(rect.bottom, obsRect.bottom) - Math.max(rect.top, obsRect.top);

              if (overlapX < overlapY) {
                // Resolve horizontally along the direction away from obstacle center
                const push = ghostCenter.x < obsCenter.x ? -(overlapX + 16) : (overlapX + 16);
                totalPushX += push;
              } else {
                // Resolve vertically along the direction away from obstacle center
                const push = ghostCenter.y < obsCenter.y ? -(overlapY + 16) : (overlapY + 16);
                totalPushY += push;
              }
              avoidedCount++;
            }
          }
        });

        if (avoidedCount > 0) {
          newX += totalPushX;
          newY += totalPushY;
          snapFeedback = 'obstacle';
          snapMsg = `Deflection shield engaged: pushed away from ${avoidedCount} interactive element(s).`;
        }
      }

      // 2. Magnetic Edge Snapping
      let snapX = rect.left + rect.width / 2;
      let snapY = rect.top + rect.height / 2;

      if (isMagnetic) {
        // Calculate temporary boundary positions after any deflection push is applied
        const currentLeft = rect.left + totalPushX;
        const currentRight = rect.right + totalPushX;
        const currentTop = rect.top + totalPushY;
        const currentBottom = rect.bottom + totalPushY;

        const snapThreshold = 75; // Snaps if within 75px
        const padding = 16; // Edge padding distance on snap

        const distLeft = currentLeft;
        const distRight = winW - currentRight;
        const distTop = currentTop;
        const distBottom = winH - currentBottom;

        let appliedSnapX = 0;
        let appliedSnapY = 0;
        let snappedEdge = '';

        if (distLeft < snapThreshold) {
          appliedSnapX = padding - currentLeft;
          snappedEdge = 'left';
          snapX = padding;
        } else if (distRight < snapThreshold) {
          appliedSnapX = (winW - padding) - currentRight;
          snappedEdge = 'right';
          snapX = winW - padding;
        }

        if (distTop < snapThreshold) {
          appliedSnapY = padding - currentTop;
          snappedEdge = snappedEdge ? `${snappedEdge} & top` : 'top';
          snapY = padding;
        } else if (distBottom < snapThreshold) {
          appliedSnapY = (winH - padding) - currentBottom;
          snappedEdge = snappedEdge ? `${snappedEdge} & bottom` : 'bottom';
          snapY = winH - padding;
        }

        if (appliedSnapX !== 0 || appliedSnapY !== 0) {
          newX += appliedSnapX;
          newY += appliedSnapY;
          // Upgrade or assign snap feedback
          snapFeedback = snapFeedback === 'obstacle' ? 'obstacle' : 'edge';
          snapMsg = snapMsg 
            ? `${snapMsg} Snapped to ${snappedEdge} edge.`
            : `Magnetic snap alignment locked to ${snappedEdge} boundary.`;
        }
      }

      // Store visual tether targets
      if (snapFeedback === 'obstacle' && lastAvoidedCenter.x !== 0) {
        snapTargetRef.current = {
          x: lastAvoidedCenter.x,
          y: lastAvoidedCenter.y,
          label: 'DEFLECTION SHIELD'
        };
      } else if (snapFeedback === 'edge') {
        snapTargetRef.current = {
          x: snapX,
          y: snapY,
          label: `SNAP ALIGNMENT`
        };
      }
    }

    if (snapFeedback !== 'none') {
      setActiveSnapEffect(snapFeedback);
      setTimeout(() => setActiveSnapEffect('none'), 1500);
      toast(snapMsg, {
        icon: snapFeedback === 'edge' ? '🧲' : '🛡️',
        style: {
          background: '#090915',
          color: '#d8b4fe',
          border: '1px solid #8b5cf6'
        }
      });
    }

    const newPos = { x: newX, y: newY };
    setAnchorPosition(newPos);
    setPosition(newPos);
    await safeStorage.setItem('aether_ghost_coords', JSON.stringify(newPos));
    
    // Play subtle audio confirmation
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      const frequency = snapFeedback !== 'none' ? 780 : 600;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  // Track cursor position globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Smooth drift animation tick loop for Follow Mode
  useEffect(() => {
    let active = true;
    const tick = () => {
      if (!active) return;

      if (!isFollowing || isDragging || isIdle) {
        // Return smoothly to the last dragged/placed anchorPosition
        setPosition(current => {
          const dx = anchorPosition.x - current.x;
          const dy = anchorPosition.y - current.y;
          if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) {
            return anchorPosition;
          }
          return {
            x: current.x + dx * 0.12,
            y: current.y + dy * 0.12
          };
        });
        requestAnimationFrame(tick);
        return;
      }

      // Read window boundaries
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      let ghostW = 320;
      let ghostH = 240;

      if (ghostRef.current) {
        const rect = ghostRef.current.getBoundingClientRect();
        ghostW = rect.width || 320;
        ghostH = rect.height || 240;
      }

      // Default bottom-right offset coordinates relative to screen
      const defaultLeft = winW - 24 - ghostW;
      const defaultTop = winH - 24 - ghostH;

      let targetX = anchorPosition.x;
      let targetY = anchorPosition.y;

      const mX = mouseRef.current.x;
      const mY = mouseRef.current.y;

      if (followStyle === 'leash') {
        // Option A: Local Leash. Moves toward cursor but constrained inside a local circle around anchorPosition
        const anchorScreenX = defaultLeft + anchorPosition.x + ghostW / 2;
        const anchorScreenY = defaultTop + anchorPosition.y + ghostH / 2;

        const dx = mX - anchorScreenX;
        const dy = mY - anchorScreenY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          const clampedDist = Math.min(dist, followRadius);
          const dispX = (dx / dist) * clampedDist;
          const dispY = (dy / dist) * clampedDist;

          targetX = anchorPosition.x + dispX;
          targetY = anchorPosition.y + dispY;
        }
      } else {
        // Option B: Full Screen Chase. Trails the cursor across the entire screen, staying exactly followRadius distance away
        const currentCenterX = defaultLeft + position.x + ghostW / 2;
        const currentCenterY = defaultTop + position.y + ghostH / 2;

        const dx = currentCenterX - mX;
        const dy = currentCenterY - mY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetCenterX = mX;
        let targetCenterY = mY;

        if (dist > 0) {
          targetCenterX = mX + (dx / dist) * followRadius;
          targetCenterY = mY + (dy / dist) * followRadius;
        } else {
          targetCenterX = mX - followRadius;
          targetCenterY = mY - followRadius;
        }

        targetX = targetCenterX - ghostW / 2 - defaultLeft;
        targetY = targetCenterY - ghostH / 2 - defaultTop;
      }

      // Ensure the companion stays completely within visible screen boundaries plus 10px safe margin
      const minOffsetLeft = 10 - defaultLeft;
      const maxOffsetRight = (winW - ghostW - 10) - defaultLeft;
      const minOffsetTop = 10 - defaultTop;
      const maxOffsetBottom = (winH - ghostH - 10) - defaultTop;

      targetX = Math.max(minOffsetLeft, Math.min(maxOffsetRight, targetX));
      targetY = Math.max(minOffsetTop, Math.min(maxOffsetBottom, targetY));

      setPosition(current => {
        const dx = targetX - current.x;
        const dy = targetY - current.y;
        return {
          x: current.x + dx * followSpeed,
          y: current.y + dy * followSpeed
        };
      });

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => {
      active = false;
    };
  }, [isFollowing, isDragging, isIdle, followStyle, followRadius, followSpeed, anchorPosition]);

  // Reset the companion's portal location
  const handleReset = async () => {
    const defaultPos = { x: 0, y: 0 };
    setAnchorPosition(defaultPos);
    setPosition(defaultPos);
    await safeStorage.setItem('aether_ghost_coords', JSON.stringify(defaultPos));
    toast.success('Ghost Portal coordinates synchronized to standard matrix anchor (Bottom Right).');
  };

  // Set and persist configurations
  const handleOpacityChange = (val: number) => {
    setOpacity(val);
    localStorage.setItem('aether_ghost_opacity', val.toString());
  };

  const toggleLock = () => {
    const next = !isLocked;
    setIsLocked(next);
    localStorage.setItem('aether_ghost_locked', next.toString());
    toast.info(next ? 'Sovereign anchor engaged. Dragging locked.' : 'Sovereign anchor dissolved. Dragging active.');
  };

  const toggleDrift = () => {
    const next = !isDrifting;
    setIsDrifting(next);
    localStorage.setItem('aether_ghost_drift', next.toString());
    toast.info(next ? 'Ethereal drift active. Gentle swaying engaged.' : 'Ethereal drift suspended. Rigid position.');
  };

  const toggleLattice = () => {
    const next = !showSpiritLattice;
    setShowSpiritLattice(next);
    localStorage.setItem('aether_ghost_lattice', next.toString());
    toast.success(next ? 'Ghost overlay spirit lattice activated.' : 'Spirit lattice dissolved.');
  };

  const toggleAutoIdle = () => {
    const next = !autoIdle;
    setAutoIdle(next);
    localStorage.setItem('aether_ghost_autoidle', next.toString());
    toast.info(next ? 'Auto-Sleep active (dims on inactivity).' : 'Auto-Sleep suspended (companion remains active).');
  };

  const toggleMagnetic = () => {
    const next = !isMagnetic;
    setIsMagnetic(next);
    localStorage.setItem('aether_ghost_magnetic', next.toString());
    toast.success(next ? 'Magnetic edge snapping activated.' : 'Magnetic edge snapping deactivated.');
  };

  const toggleAvoidObstacles = () => {
    const next = !avoidObstacles;
    setAvoidObstacles(next);
    localStorage.setItem('aether_ghost_avoid', next.toString());
    toast.success(next ? 'Obstacle avoidance shield activated.' : 'Obstacle avoidance shield deactivated.');
  };

  const toggleDblClickPin = () => {
    const next = !dblClickPin;
    setDblClickPin(next);
    localStorage.setItem('aether_ghost_dblclick_pin', next.toString());
    toast.success(next ? 'Double-click coordinate pinning activated.' : 'Double-click coordinate pinning deactivated.');
  };

  // Double-click listener to snap Ghost to any dashboard element
  useEffect(() => {
    if (!dblClickPin) return;

    const handleDoubleClick = async (e: MouseEvent) => {
      // Check if clicked element or its ancestors are part of the companion container
      const target = e.target as HTMLElement;
      if (ghostRef.current?.contains(target)) return;

      // Skip elements inside toasts or active dialogs/overlays to preserve standard controls
      if (target.closest('.sonner-toast') || target.closest('[role="dialog"]') || target.closest('.pointer-events-auto')) {
        // Wait, some interactive buttons in the dashboard might have 'pointer-events-auto', so let's only exclude the HUD and ghost container
        if (target.closest('#ghost-layer-universe') || target.closest('[id^="ghost-"]')) {
          return;
        }
      }

      const winW = window.innerWidth;
      const winH = window.innerHeight;
      let ghostW = 320;
      let ghostH = 240;

      if (ghostRef.current) {
        const rect = ghostRef.current.getBoundingClientRect();
        ghostW = rect.width || 320;
        ghostH = rect.height || 240;
      }

      const defaultLeft = winW - 24 - ghostW;
      const defaultTop = winH - 24 - ghostH;

      // Snap companion's center to double-clicked coordinates
      const targetX = e.clientX - ghostW / 2 - defaultLeft;
      const targetY = e.clientY - ghostH / 2 - defaultTop;

      const minOffsetLeft = 10 - defaultLeft;
      const maxOffsetRight = (winW - ghostW - 10) - defaultLeft;
      const minOffsetTop = 10 - defaultTop;
      const maxOffsetBottom = (winH - ghostH - 10) - defaultTop;

      const finalX = Math.max(minOffsetLeft, Math.min(maxOffsetRight, targetX));
      const finalY = Math.max(minOffsetTop, Math.min(maxOffsetBottom, targetY));

      const newPos = { x: finalX, y: finalY };
      setAnchorPosition(newPos);
      setPosition(newPos);
      await safeStorage.setItem('aether_ghost_coords', JSON.stringify(newPos));

      // Trigger wave snap ripple visual effect (using 'edge' for cyan feedback)
      setActiveSnapEffect('edge');
      setTimeout(() => setActiveSnapEffect('none'), 1200);

      toast.success('Companion coordinates locked & pinned.', {
        icon: '📌',
        style: {
          background: '#090915',
          color: '#d8b4fe',
          border: '1px solid #8b5cf6'
        }
      });

      // Play audio cue
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (err) {}
    };

    window.addEventListener('dblclick', handleDoubleClick);
    return () => {
      window.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [dblClickPin]);

  const handleTimeoutChange = (ms: number) => {
    setIdleTimeout(ms);
    localStorage.setItem('aether_ghost_idletimeout', ms.toString());
    toast.success(`Idle threshold set to ${ms / 1000} seconds.`);
  };

  const toggleFollowing = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    localStorage.setItem('aether_ghost_following', next.toString());
    toast.info(next ? 'Companion Follow Mode engaged.' : 'Follow Mode suspended.');
  };

  const changeFollowStyle = (style: 'leash' | 'chase') => {
    setFollowStyle(style);
    localStorage.setItem('aether_ghost_follow_style', style);
    toast.success(style === 'leash' ? 'Local Orbit Leash activated.' : 'Full Screen Chase activated.');
  };

  const changeFollowRadius = (radius: number) => {
    setFollowRadius(radius);
    localStorage.setItem('aether_ghost_follow_radius', radius.toString());
    toast.success(`Follow radius set to ${radius}px.`);
  };

  const changeFollowSpeed = (speed: number) => {
    setFollowSpeed(speed);
    localStorage.setItem('aether_ghost_follow_speed', speed.toString());
    toast.success(`Tracking agility updated.`);
  };

  // Dragging controls for Framer Motion
  const dragProps = isLocked ? {} : {
    drag: true,
    dragConstraints: containerRef,
    dragElastic: 0.1,
    dragMomentum: false,
    onDragStart: () => setIsDragging(true),
    onDragEnd: (event: any, info: any) => {
      setIsDragging(false);
      handleDragEnd(event, info);
    }
  };

  return (
    <div 
      id="ghost-layer-universe" 
      ref={containerRef} 
      className="fixed inset-0 z-[999] pointer-events-none overflow-hidden select-none"
    >
      {/* Visual Tether SVG Overlay (Spans entire screen) */}
      <svg
        ref={tetherContainerRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[49]"
        style={{ display: 'none', transition: 'opacity 0.2s ease-out' }}
      >
        <defs>
          <filter id="tether-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Glowing background line shadow */}
        <path
          ref={tetherGlowRef}
          fill="none"
          strokeWidth="6"
          opacity="0.35"
          strokeLinecap="round"
          filter="url(#tether-glow-filter)"
        />
        
        {/* Sharp core vector line */}
        <path
          ref={tetherPathRef}
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Floating animated core energy particle */}
        <circle
          ref={tetherParticleRef}
          r="4.5"
          filter="url(#tether-glow-filter)"
        />

        {/* Interactive target anchor badge */}
        <g ref={tetherLabelGroupRef}>
          <circle r="7" fill="none" stroke="currentColor" strokeWidth="1.2" className="animate-pulse" />
          <circle r="3.5" fill="currentColor" />
          
          <rect
            ref={tetherLabelBgRef}
            x="12"
            y="-10"
            width="115"
            height="18"
            rx="4"
            fill="#05050a"
            strokeWidth="1"
            opacity="0.9"
          />
          <text
            ref={tetherLabelRef}
            x="18"
            y="2"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            TETHER LINK
          </text>
        </g>
      </svg>

      {/* 1. Digital Spirit Lattice Layer (Across Viewport) */}
      <AnimatePresence>
        {showSpiritLattice && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          >
            {latticeStyle === 'neon' && (
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 80%),
                    linear-gradient(to right, rgba(168, 85, 247, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(168, 85, 247, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '100% 100%, 40px 40px, 40px 40px'
                }}
              />
            )}
            {latticeStyle === 'matrix' && (
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(34, 197, 94, 0.03) 50%, transparent 50%),
                    linear-gradient(90deg, rgba(34, 197, 94, 0.03) 50%, transparent 50%)
                  `,
                  backgroundSize: '8px 8px, 8px 8px'
                }}
              />
            )}
            {latticeStyle === 'scanline' && (
              <div 
                className="w-full h-full bg-gradient-to-b from-transparent via-purple-500/5 to-transparent animate-pulse"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)'
                }}
              />
            )}
            {/* Ambient spirit lights floating around */}
            <div className="absolute top-[20%] left-[30%] w-60 h-60 bg-purple-600/5 rounded-full blur-[80px] animate-pulse" />
            <div className="absolute bottom-[20%] right-[35%] w-80 h-80 bg-cyan-600/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Companion Container wrapped with Framer Motion drag mechanics */}
      <motion.div
        ref={ghostRef}
        {...dragProps}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
        style={{ 
          x: position.x, 
          y: position.y
        }}
        whileHover={{
          scale: 1.03,
          filter: "drop-shadow(0 0 16px rgba(168, 85, 247, 0.45))",
          opacity: Math.max(0.75, opacity)
        }}
        animate={{
          ...(isDrifting ? {
            y: [position.y, position.y - (isIdle ? 4 : 8), position.y],
            x: [position.x, position.x + (isIdle ? 1 : 3), position.x - (isIdle ? 1 : 3), position.x],
            transition: {
              duration: isIdle ? 8 : 5, // Slower breathing/drift when sleeping!
              repeat: Infinity,
              ease: "easeInOut"
            }
          } : {}),
          scale: isIdle ? 0.85 : 1,
          opacity: isIdle ? 0.22 : opacity
        }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 25,
          filter: { duration: 0.3 },
          scale: { duration: 0.4 },
          opacity: { duration: 0.5 }
        }}
        className="absolute bottom-6 right-6 pointer-events-auto flex flex-col items-end z-50 select-none group/ghost"
      >
        {/* Dynamic Snap/Avoidance Wave Overlay */}
        <AnimatePresence>
          {activeSnapEffect !== 'none' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={`absolute inset-0 rounded-3xl pointer-events-none z-[-1] border-2 ${
                activeSnapEffect === 'edge' 
                  ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.7)]' 
                  : 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.7)]'
              }`}
            />
          )}
        </AnimatePresence>

        {/* Sleeping crescent moon badge on top-left of companion when sleeping */}
        {isIdle && (
          <span className="absolute -top-3 left-2 bg-purple-950/90 border border-purple-500/40 text-purple-300 text-[8.5px] font-mono uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse z-[100] shadow-md">
            <Moon className="w-2.5 h-2.5 text-purple-400 animate-spin" style={{ animationDuration: '10s' }} /> Sleep
          </span>
        )}

        {/* Floating zZZ animation when idle */}
        <AnimatePresence>
          {isIdle && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ 
                opacity: [0, 0.8, 0.8, 0], 
                y: [-20, -65], 
                x: [0, 8, -4, 4],
                scale: [0.8, 1.1, 0.9, 0.7]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-2 right-12 pointer-events-none text-purple-400 font-mono text-[9px] font-black tracking-widest flex flex-col items-center gap-1 z-[101] drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
            >
              <span className="animate-pulse">z</span>
              <span className="text-[11px] ml-1.5">Z</span>
              <span className="text-[13px] ml-3">Z</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ghost Controller Hover Toolbar */}
        <div className="flex items-center gap-1.5 mb-1 opacity-0 group-hover/ghost:opacity-100 transition-opacity duration-300 pointer-events-auto bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-xl p-1 shadow-lg mr-2">
          {/* Compass/Ghost Mode controls indicator */}
          <button
            onClick={() => setShowHUD(!showHUD)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showHUD ? 'bg-purple-600 text-white' : 'text-purple-400 hover:bg-zinc-800'}`}
            title="Toggle Ghost Controller Panel"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFollowing}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isFollowing ? 'text-purple-300 bg-purple-500/20 border border-purple-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            title={isFollowing ? "Disable Follow Mode" : "Enable Follow Mode"}
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={toggleLock}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isLocked ? 'text-red-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            title={isLocked ? "Unlock dragging" : "Lock dragging"}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Reset to home bottom-right anchor"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          
          <span className="text-[7.5px] font-mono tracking-widest text-purple-300 px-1 select-none font-bold">
            {isIdle ? "SLEEPING" : isFollowing ? `FOLLOW (${followStyle.toUpperCase()})` : isLocked ? "LOCKED" : "DRAGGABLE"}
          </span>
        </div>

        {/* 3. Ghost Settings Control HUD */}
        <AnimatePresence>
          {showHUD && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="mr-2 mb-2 w-64 bg-[#05050a]/95 border-2 border-purple-500/50 rounded-2xl p-4 shadow-[0_12px_40px_rgba(168,85,247,0.3)] backdrop-blur-md text-left text-white"
            >
              <div className="flex justify-between items-center border-b border-purple-900/40 pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <Ghost className="w-4 h-4 text-purple-400 animate-bounce" />
                  <span className="text-[10px] font-sans font-black tracking-widest uppercase">GHOST LAYER CONTROL</span>
                </div>
                <button 
                  onClick={() => setShowHUD(false)}
                  className="text-zinc-500 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Spectral Opacity Parameter */}
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-[8px] font-mono font-black uppercase tracking-wider text-zinc-400">
                  <span>Spectral Transparency</span>
                  <span className="text-purple-400">{(opacity * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpacityChange(0.35)} 
                    className={`flex-1 py-1 rounded text-[8.5px] font-mono tracking-wider transition-all ${opacity === 0.35 ? 'bg-purple-600 text-black font-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-purple-500'}`}
                  >
                    35% Ghost
                  </button>
                  <button 
                    onClick={() => handleOpacityChange(0.65)} 
                    className={`flex-1 py-1 rounded text-[8.5px] font-mono tracking-wider transition-all ${opacity === 0.65 ? 'bg-purple-600 text-black font-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-purple-500'}`}
                  >
                    65% Mist
                  </button>
                  <button 
                    onClick={() => handleOpacityChange(0.95)} 
                    className={`flex-1 py-1 rounded text-[8.5px] font-mono tracking-wider transition-all ${opacity === 0.95 ? 'bg-purple-600 text-black font-black' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-purple-500'}`}
                  >
                    95% Solid
                  </button>
                </div>
              </div>

              {/* Auto-Sleep / Idle Mode Configurations */}
              <div className="space-y-2 mb-3 border-t border-zinc-900 pt-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Moon className="w-3 h-3 text-purple-400" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-wider text-zinc-400">Auto-Sleep Inactivity</span>
                  </div>
                  <button 
                    onClick={toggleAutoIdle}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${autoIdle ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                  >
                    {autoIdle ? 'ON' : 'OFF'}
                  </button>
                </div>
                {autoIdle && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[7px] font-mono text-zinc-500 uppercase">
                      <span>Sleep Threshold</span>
                      <span className="text-purple-300">{idleTimeout / 1000}s</span>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleTimeoutChange(5000)}
                        className={`flex-1 py-0.5 rounded text-[7.5px] font-mono transition-all ${idleTimeout === 5000 ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40' : 'bg-zinc-900 text-zinc-500'}`}
                      >
                        5s Fast
                      </button>
                      <button 
                        onClick={() => handleTimeoutChange(15000)}
                        className={`flex-1 py-0.5 rounded text-[7.5px] font-mono transition-all ${idleTimeout === 15000 ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40' : 'bg-zinc-900 text-zinc-500'}`}
                      >
                        15s Mid
                      </button>
                      <button 
                        onClick={() => handleTimeoutChange(30000)}
                        className={`flex-1 py-0.5 rounded text-[7.5px] font-mono transition-all ${idleTimeout === 30000 ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40' : 'bg-zinc-900 text-zinc-500'}`}
                      >
                        30s Long
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Idle Micro-Behaviors Testing Panel */}
              <div className="space-y-2 mb-3 border-t border-zinc-900 pt-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-wider text-zinc-400">Micro-Behaviors (Idle)</span>
                  </div>
                  <span className="text-[7.5px] font-mono px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-900/60 text-purple-300 font-black uppercase tracking-wider">
                    {idleMicroBehavior === 'none' ? 'BREATHING' : idleMicroBehavior}
                  </span>
                </div>
                <p className="text-[8px] text-zinc-400 leading-normal mb-1">
                  Gentle body ticks & expressive movements that loop during inactive periods. Select any to manually preview:
                </p>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIdleMicroBehavior('bobbing');
                      setTimeout(() => setIdleMicroBehavior('none'), 1500);
                    }}
                    className={`py-1 rounded text-[7px] font-mono font-bold uppercase transition-all border ${idleMicroBehavior === 'bobbing' ? 'bg-purple-600 text-white border-purple-500' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:border-purple-500 border-zinc-800'}`}
                    title="Vertical elastic jump and bounce"
                  >
                    Bobbing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdleMicroBehavior('look_left');
                      setTimeout(() => setIdleMicroBehavior('none'), 1500);
                    }}
                    className={`py-1 rounded text-[7px] font-mono font-bold uppercase transition-all border ${idleMicroBehavior === 'look_left' ? 'bg-purple-600 text-white border-purple-500' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:border-purple-500 border-zinc-800'}`}
                    title="Slight tilt and turn to the left"
                  >
                    Look L
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdleMicroBehavior('look_right');
                      setTimeout(() => setIdleMicroBehavior('none'), 1500);
                    }}
                    className={`py-1 rounded text-[7px] font-mono font-bold uppercase transition-all border ${idleMicroBehavior === 'look_right' ? 'bg-purple-600 text-white border-purple-500' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:border-purple-500 border-zinc-800'}`}
                    title="Slight tilt and turn to the right"
                  >
                    Look R
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdleMicroBehavior('jitter');
                      setTimeout(() => setIdleMicroBehavior('none'), 1500);
                    }}
                    className={`py-1 rounded text-[7px] font-mono font-bold uppercase transition-all border ${idleMicroBehavior === 'jitter' ? 'bg-purple-600 text-white border-purple-500' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:border-purple-500 border-zinc-800'}`}
                    title="Rapid minor vibration/shiver"
                  >
                    Jitter
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdleMicroBehavior('sigh');
                      setTimeout(() => setIdleMicroBehavior('none'), 1500);
                    }}
                    className={`py-1 rounded text-[7px] font-mono font-bold uppercase transition-all border ${idleMicroBehavior === 'sigh' ? 'bg-purple-600 text-white border-purple-500' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:border-purple-500 border-zinc-800'}`}
                    title="Deep, slow scale/opacity breathing breath"
                  >
                    Sigh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIdleMicroBehavior('stretch');
                      setTimeout(() => setIdleMicroBehavior('none'), 1500);
                    }}
                    className={`py-1 rounded text-[7px] font-mono font-bold uppercase transition-all border ${idleMicroBehavior === 'stretch' ? 'bg-purple-600 text-white border-purple-500' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:border-purple-500 border-zinc-800'}`}
                    title="Vertical stretch and horizontal squash"
                  >
                    Stretch
                  </button>
                </div>
              </div>

              {/* Autonomic Follow Mode Configurations */}
              <div className="space-y-2 mb-3 border-t border-zinc-900 pt-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <MousePointer className="w-3 h-3 text-purple-400" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-wider text-zinc-400">Autonomic Follow Mode</span>
                  </div>
                  <button 
                    onClick={toggleFollowing}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${isFollowing ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                  >
                    {isFollowing ? 'ON' : 'OFF'}
                  </button>
                </div>
                {isFollowing && (
                  <div className="space-y-2 pt-1 border-t border-zinc-950/60 mt-1">
                    {/* Follow Style / Algorithm */}
                    <div className="space-y-1">
                      <div className="text-[7.5px] font-mono text-zinc-500 uppercase">Tracking Algorithm</div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => changeFollowStyle('leash')}
                          className={`flex-1 py-0.5 rounded text-[7.5px] font-mono transition-all ${followStyle === 'leash' ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
                          title="Stays within bounds of its anchor position"
                        >
                          Local Leash
                        </button>
                        <button 
                          onClick={() => changeFollowStyle('chase')}
                          className={`flex-1 py-0.5 rounded text-[7.5px] font-mono transition-all ${followStyle === 'chase' ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
                          title="Follows cursor across the entire screen at safe radius"
                        >
                          Full Chase
                        </button>
                      </div>
                    </div>

                    {/* Follow Radius */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[7.5px] font-mono text-zinc-500 uppercase">
                        <span>Leash / Safety Radius</span>
                        <span className="text-purple-300">{followRadius}px</span>
                      </div>
                      <div className="flex gap-1">
                        {[100, 150, 200].map((radius) => (
                          <button 
                            key={radius}
                            onClick={() => changeFollowRadius(radius)}
                            className={`flex-1 py-0.5 rounded text-[7.5px] font-mono transition-all ${followRadius === radius ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
                          >
                            {radius}px
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Follow Agility / Speed */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[7.5px] font-mono text-zinc-500 uppercase">
                        <span>Agility (Speed)</span>
                        <span className="text-purple-300">
                          {followSpeed === 0.03 ? 'Drifting' : followSpeed === 0.06 ? 'Balanced' : 'Snappy'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => changeFollowSpeed(0.03)}
                          className={`flex-1 py-0.5 rounded text-[7.5px] font-mono transition-all ${followSpeed === 0.03 ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
                        >
                          Slow
                        </button>
                        <button 
                          onClick={() => changeFollowSpeed(0.06)}
                          className={`flex-1 py-0.5 rounded text-[7.5px] font-mono transition-all ${followSpeed === 0.06 ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
                        >
                          Balanced
                        </button>
                        <button 
                          onClick={() => changeFollowSpeed(0.12)}
                          className={`flex-1 py-0.5 rounded text-[7.5px] font-mono transition-all ${followSpeed === 0.12 ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'}`}
                        >
                          Snappy
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Magnetic Alignment & Obstacle Avoidance Shield */}
              <div className="space-y-2 mb-3 border-t border-zinc-900 pt-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Magnet className="w-3 h-3 text-cyan-400" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-wider text-zinc-400">Magnetic Edge Snap</span>
                  </div>
                  <button 
                    onClick={toggleMagnetic}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${isMagnetic ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                  >
                    {isMagnetic ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-wider text-zinc-400">Deflection Shield</span>
                  </div>
                  <button 
                    onClick={toggleAvoidObstacles}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${avoidObstacles ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                  >
                    {avoidObstacles ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Pin className="w-3 h-3 text-purple-400" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-wider text-zinc-400">Double-Click Pin</span>
                  </div>
                  <button 
                    onClick={toggleDblClickPin}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${dblClickPin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                  >
                    {dblClickPin ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-purple-400 animate-pulse" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-wider text-zinc-400">Quantum Tether Link</span>
                  </div>
                  <button 
                    onClick={toggleTether}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${tetherEnabled ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                  >
                    {tetherEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* Lattice & Grid Matrix */}
              <div className="space-y-1.5 mb-3 border-t border-zinc-900 pt-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Grid className="w-3 h-3 text-purple-400" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-wider text-zinc-400">Spirit Lattice Overlay</span>
                  </div>
                  <button 
                    onClick={toggleLattice}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${showSpiritLattice ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                  >
                    {showSpiritLattice ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>
                {showSpiritLattice && (
                  <div className="flex gap-1.5 mt-1.5">
                    <button 
                      onClick={() => setLatticeStyle('neon')}
                      className={`flex-1 py-1 rounded text-[7.5px] font-mono font-bold uppercase tracking-wider transition-all ${latticeStyle === 'neon' ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'bg-zinc-900/60 text-zinc-500'}`}
                    >
                      Aether grid
                    </button>
                    <button 
                      onClick={() => setLatticeStyle('matrix')}
                      className={`flex-1 py-1 rounded text-[7.5px] font-mono font-bold uppercase tracking-wider transition-all ${latticeStyle === 'matrix' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'bg-zinc-900/60 text-zinc-500'}`}
                    >
                      Matrix code
                    </button>
                    <button 
                      onClick={() => setLatticeStyle('scanline')}
                      className={`flex-1 py-1 rounded text-[7.5px] font-mono font-bold uppercase tracking-wider transition-all ${latticeStyle === 'scanline' ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40' : 'bg-zinc-900/60 text-zinc-500'}`}
                    >
                      Scanlines
                    </button>
                  </div>
                )}
              </div>

              {/* Sway and Drift configurations */}
              <div className="space-y-1.5 mb-3 border-t border-zinc-900 pt-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Compass className="w-3 h-3 text-purple-400" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-wider text-zinc-400">Ethereal Swaying Drift</span>
                  </div>
                  <button 
                    onClick={toggleDrift}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${isDrifting ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                  >
                    {isDrifting ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>
              </div>

              <div className="text-[7.5px] font-mono text-zinc-600 uppercase tracking-widest border-t border-zinc-900 pt-2 text-center">
                Sovereign Reality Shift Engaged
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The child component (the JesterCompanion chat bot itself) wrapped in an expressive micro-behavior layer */}
        <motion.div
          animate={
            isIdle || idleMicroBehavior !== 'none'
              ? idleMicroBehavior === 'jitter'
                ? {
                    x: [0, -2, 2, -1.5, 1.5, -0.8, 0.8, 0],
                    y: [0, 1.2, -1.2, 0.8, -0.8, 0],
                    rotate: [0, -1.5, 1.5, -1, 1, 0],
                    scale: 0.85,
                  }
                : idleMicroBehavior === 'bobbing'
                ? {
                    y: [0, -15, 5, -2, 0],
                    scaleY: [1, 0.9, 1.08, 0.97, 1],
                    scaleX: [1, 1.06, 0.94, 1.01, 1],
                    scale: 0.85,
                  }
                : idleMicroBehavior === 'look_left'
                ? {
                    rotate: [0, -7, -7, 0],
                    x: [0, -6, -6, 0],
                    scale: 0.85,
                  }
                : idleMicroBehavior === 'look_right'
                ? {
                    rotate: [0, 7, 7, 0],
                    x: [0, 6, 6, 0],
                    scale: 0.85,
                  }
                : idleMicroBehavior === 'sigh'
                ? {
                    scale: [0.85, 0.91, 0.82, 0.85],
                    opacity: [0.35, 0.6, 0.25, 0.35],
                  }
                : idleMicroBehavior === 'stretch'
                ? {
                    scaleY: [1, 1.15, 0.88, 1.03, 1],
                    scaleX: [1, 0.85, 1.08, 0.97, 1],
                    y: [0, -9, 0, 0],
                    scale: 0.85,
                  }
                : {
                    // Default idle breathing/swaying
                    y: [0, -3, 0],
                    x: [0, 0.6, -0.6, 0],
                    scale: 0.85,
                    opacity: 0.35
                  }
              : {
                  x: 0,
                  y: 0,
                  rotate: 0,
                  scale: 1,
                  scaleX: 1,
                  scaleY: 1,
                  opacity: 1
                }
          }
          transition={{
            duration: (isIdle || idleMicroBehavior !== 'none')
              ? idleMicroBehavior === 'jitter'
                ? 0.4
                : idleMicroBehavior === 'bobbing'
                ? 1.2
                : idleMicroBehavior === 'look_left' || idleMicroBehavior === 'look_right'
                ? 1.6
                : idleMicroBehavior === 'sigh'
                ? 2.2
                : idleMicroBehavior === 'stretch'
                ? 1.0
                : 6 // Super slow gentle drift
              : 0.4,
            repeat: (isIdle || idleMicroBehavior !== 'none') && idleMicroBehavior === 'none' ? Infinity : 0,
            ease: "easeInOut"
          }}
          className="w-full h-full flex flex-col items-end pointer-events-auto"
        >
          {children}
        </motion.div>
      </motion.div>

      {/* 4. Right-Click Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'fixed',
              left: contextMenu.x,
              top: contextMenu.y,
              zIndex: 9999,
            }}
            className="w-48 bg-[#05050a]/95 border border-purple-500/40 rounded-xl p-1.5 shadow-[0_10px_30px_rgba(168,85,247,0.25)] backdrop-blur-md pointer-events-auto text-left"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Header/Title */}
            <div className="px-2 py-1 text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900/60 mb-1 flex items-center gap-1">
              <Ghost className="w-2.5 h-2.5 text-purple-400" />
              <span>Ghost Companion</span>
            </div>

            {/* Follow Mode Option */}
            <button
              onClick={() => {
                toggleFollowing();
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-medium text-zinc-300 hover:text-white hover:bg-purple-950/40 hover:border-purple-800/40 border border-transparent transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <MousePointer className={`w-3 h-3 ${isFollowing ? 'text-purple-400' : 'text-zinc-500'}`} />
                <span>Follow Mode</span>
              </div>
              <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${isFollowing ? 'bg-purple-500/20 text-purple-300' : 'bg-zinc-900 text-zinc-500'}`}>
                {isFollowing ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Sleep Mode Option */}
            <button
              onClick={() => {
                const nextIdle = !isIdle;
                setIsIdle(nextIdle);
                if (nextIdle) {
                  toast.success('Companion forced to Sleep Mode.');
                } else {
                  toast.success('Companion woke up from Sleep Mode.');
                }
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-medium text-zinc-300 hover:text-white hover:bg-purple-950/40 hover:border-purple-800/40 border border-transparent transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Moon className={`w-3 h-3 ${isIdle ? 'text-purple-400 animate-pulse' : 'text-zinc-500'}`} />
                <span>Sleep Mode</span>
              </div>
              <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${isIdle ? 'bg-purple-500/20 text-purple-300' : 'bg-zinc-900 text-zinc-500'}`}>
                {isIdle ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Reset Location Option */}
            <button
              onClick={() => {
                handleReset();
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-medium text-zinc-300 hover:text-white hover:bg-purple-950/40 hover:border-purple-800/40 border border-transparent transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3 text-zinc-500" />
                <span>Reset Location</span>
              </div>
              <span className="text-[8px] text-zinc-500 uppercase tracking-tight">HOME</span>
            </button>

            {/* Toggle HUD Panel */}
            <button
              onClick={() => {
                setShowHUD(!showHUD);
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-medium text-zinc-300 hover:text-white hover:bg-purple-950/40 hover:border-purple-800/40 border border-transparent transition cursor-pointer border-t border-zinc-900/40 mt-1 pt-1.5"
            >
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-zinc-500" />
                <span>Control HUD</span>
              </div>
              <span className={`text-[8px] px-1 py-0.2 rounded font-bold ${showHUD ? 'bg-purple-500/20 text-purple-300' : 'bg-zinc-900 text-zinc-500'}`}>
                {showHUD ? 'OPEN' : 'HIDE'}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
