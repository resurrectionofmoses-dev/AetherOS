
import type { Vector4D, Vector3D } from '../types';

/**
 * --- 18. HYPER-ENGINE: THE 4D PROJECTION ---
 * Protocol: 0x03E2_HYPER
 * Enables the visualization of trajectories across the temporal W-axis.
 */
export const HyperEngine = {
  /**
   * Projects a 4D point (x, y, z, w) into 3D coordinates.
   * 'w' represents the hyper-spatial (temporal) axis.
   */
  project4Dto3D(point4D: Vector4D, angle: number): Vector3D {
    const { x, y, z, w } = point4D;
    
    // Rotation in the XW plane (The "Fold" into the 4th dimension)
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    
    const rotX = x * cosA - w * sinA;
    const rotW = x * sinA + w * cosA;
    
    // Standard perspective projection from 4D to 3D
    // As W increases, the object "recedes" into the hyper-axis.
    // 
    // SECURITY CHECKPOINT:
    // Clamp rotW to prevent division by zero (Mathematical Singularity).
    const distance = 2.5;
    const factor = 1 / (distance - Math.min(rotW, distance - 0.1));
    
    return {
      x: rotX * factor,
      y: y * factor,
      z: z * factor
    };
  },

  /**
   * Generates a Tesseract (Hypercube) vertex set.
   * 16 vertices: (±1, ±1, ±1, ±1)
   */
  generateTesseractVertices(): Vector4D[] {
    const vertices: Vector4D[] = [];
    for (let i = 0; i < 16; i++) {
      vertices.push({
        x: (i & 1) ? 1 : -1,
        y: (i & 2) ? 1 : -1,
        z: (i & 4) ? 1 : -1,
        w: (i & 8) ? 1 : -1
      });
    }
    return vertices;
  },

  /**
   * Defines connectivity for a Tesseract.
   * Edges connect vertices that differ by exactly one coordinate.
   */
  getTesseractEdges(): [number, number][] {
    const edges: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = i ^ j;
        // If Hamming Distance is 1, they are connected
        if ((diff & (diff - 1)) === 0) {
          edges.push([i, j]);
        }
      }
    }
    return edges;
  }
};
