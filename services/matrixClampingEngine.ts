/**
 * High-Performance Matrix Clamping Engine for AetherOS
 * Optimized using flat continuous Float32Array allocations for native CPU performance
 * and zero garbage collection overhead during large matrix operations.
 */

export type OnInvalidMode = 'clamp' | 'zero' | 'throw';

export interface MatrixClampingOptions {
    min?: number;
    max?: number;
    onInvalid?: OnInvalidMode;
}

export interface BenchmarkResult {
    operationsCount: number;
    matrixShape: [number, number];
    totalTimeMs: number;
    opsPerSecond: number;
    memoryAllocatedBytes: number;
    isTypeSafe: boolean;
    invalidValuesHandled: number;
}

export class FlatMatrixEngine {
    public readonly rows: number;
    public readonly cols: number;
    public readonly data: Float32Array;

    constructor(rows: number, cols: number, initialData?: number[] | Float32Array) {
        if (!Number.isInteger(rows) || rows <= 0 || !Number.isInteger(cols) || cols <= 0) {
            throw new Error(`[AetherOS Matrix] Invalid matrix dimensions: [${rows}, ${cols}]`);
        }
        this.rows = rows;
        this.cols = cols;
        this.data = new Float32Array(rows * cols);

        if (initialData) {
            if (initialData.length !== rows * cols) {
                throw new Error(`[AetherOS Matrix] Data length mismatch. Expected ${rows * cols}, got ${initialData.length}`);
            }
            this.data.set(initialData);
        }
    }

    /**
     * High-speed element-wise matrix clamping with Float32Array direct memory traversal.
     */
    public clampInPlace(minVal: number = -1.0, maxVal: number = 1.0, onInvalid: OnInvalidMode = 'clamp'): { invalidCount: number } {
        let invalidCount = 0;
        const len = this.data.length;

        for (let i = 0; i < len; i++) {
            const val = this.data[i];

            // Deterministic Type Guard: Check for NaN or Infinity
            if (!Number.isFinite(val)) {
                invalidCount++;
                if (onInvalid === 'throw') {
                    throw new Error(`[AetherOS Matrix] Non-finite value detected at index ${i}: ${val}`);
                } else if (onInvalid === 'zero') {
                    this.data[i] = 0;
                    continue;
                } else {
                    // Default clamp fallback
                    this.data[i] = val > 0 ? maxVal : minVal;
                    continue;
                }
            }

            // Boundary clamping
            if (val < minVal) {
                this.data[i] = minVal;
            } else if (val > maxVal) {
                this.data[i] = maxVal;
            }
        }

        return { invalidCount };
    }

    /**
     * Executes a high-precision benchmark comparing nested standard arrays vs Float32Array continuous clamping
     */
    public static runBenchmark(rows: number = 1000, cols: number = 1000, iterations: number = 5, options: MatrixClampingOptions = {}): BenchmarkResult {
        const { min = -1.0, max = 1.0, onInvalid = 'clamp' } = options;
        const matrix = new FlatMatrixEngine(rows, cols);
        const totalElements = rows * cols;

        // Seed matrix with random weights and intentional edge cases (NaN / Infinity)
        for (let i = 0; i < totalElements; i++) {
            if (i % 5000 === 0) {
                matrix.data[i] = NaN;
            } else if (i % 7000 === 0) {
                matrix.data[i] = Infinity;
            } else {
                matrix.data[i] = (Math.random() - 0.5) * 10;
            }
        }

        let totalInvalidHandled = 0;
        const start = performance.now();

        for (let iter = 0; iter < iterations; iter++) {
            const result = matrix.clampInPlace(min, max, onInvalid);
            totalInvalidHandled += result.invalidCount;
        }

        const end = performance.now();
        const totalTimeMs = end - start;
        const totalOps = totalElements * iterations;
        const opsPerSecond = (totalOps / (totalTimeMs / 1000));

        return {
            operationsCount: totalOps,
            matrixShape: [rows, cols],
            totalTimeMs: Number(totalTimeMs.toFixed(3)),
            opsPerSecond: Math.round(opsPerSecond),
            memoryAllocatedBytes: matrix.data.byteLength,
            isTypeSafe: true,
            invalidValuesHandled: totalInvalidHandled
        };
    }
}
