
import React, { useRef, useEffect } from 'react';

const WAVE_VS = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const WAVE_FS = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform float u_pressure; // Decibels equivalent
    uniform float u_stride;   // Stride intensity

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv = uv * 2.0 - 1.0;
        uv.x *= u_resolution.x / u_resolution.y;

        float color = 0.0;
        
        // The 7-7+7=8 Resonance Math
        // Base freq (7)
        float f1 = sin(uv.x * 7.0 + u_time * 2.0);
        // Phase-flipped cancellation (-7)
        float f2 = sin(uv.x * 7.0 + u_time * 2.0 + 3.14159);
        // Resonant Output (+7 Harmonic -> 8 Gain)
        float f3 = sin(uv.x * 8.0 + u_time * 5.0 * u_stride);

        float waves = abs(1.0 / (30.0 * (uv.y - (f1 + f2 + f3) * 0.2 * u_pressure)));
        
        vec3 finalColor = vec3(0.1, 0.5, 0.9) * waves;
        finalColor += vec3(0.9, 0.2, 0.1) * (1.0 - smoothstep(0.0, 0.01, abs(uv.y))) * 0.2;

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

export const WaveVisualizer: React.FC<{ pressure: number; stride: number }> = ({ pressure, stride }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl');
        if (!gl) return;
        glRef.current = gl;

        const createShader = (type: number, source: string) => {
            const shader = gl.createShader(type)!;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };

        const vs = createShader(gl.VERTEX_SHADER, WAVE_VS);
        const fs = createShader(gl.FRAGMENT_SHADER, WAVE_FS);
        const program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        programRef.current = program;

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

        let animationFrame: number;
        const render = (time: number) => {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.useProgram(program);

            const posLoc = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time * 0.001);
            gl.uniform1f(gl.getUniformLocation(program, 'u_pressure'), pressure);
            gl.uniform1f(gl.getUniformLocation(program, 'u_stride'), stride);
            gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), gl.canvas.width, gl.canvas.height);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationFrame = requestAnimationFrame(render);
        };

        animationFrame = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationFrame);
    }, [pressure, stride]);

    return (
        <div className="absolute inset-0 z-0">
            <canvas ref={canvasRef} className="w-full h-full opacity-40" width={1200} height={400} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-[#020408]" />
        </div>
    );
};
