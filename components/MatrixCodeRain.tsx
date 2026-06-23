import React, { useEffect, useRef } from 'react';

interface MatrixCodeRainProps {
    color?: string;
    speed?: number;
    fontSize?: number;
}

export const MatrixCodeRain: React.FC<MatrixCodeRainProps> = ({
    color = 'rgba(244, 63, 94, 0.22)', // defaulted to high contrast forensic rose/red
    speed = 30,
    fontSize = 11,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        
        // Handle responsive canvas scaling to avoid pixelation
        const handleResize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        // Character pool containing binary, hex, and sovereign runic glyphs
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZØΔΨΞΩΣλπθμ_#[]<>*+-';
        const charArr = chars.split('');

        // Compute columns dynamically based on dimensions
        const rect = canvas.getBoundingClientRect();
        const columns = Math.floor(rect.width / fontSize) + 1;
        const drops = Array(columns).fill(0).map(() => Math.random() * -100);

        let lastTime = 0;

        const draw = (timestamp: number) => {
            if (timestamp - lastTime >= speed) {
                lastTime = timestamp;

                // Subtle alpha-fade background repaint to create the trailing rain tail effect
                ctx.fillStyle = 'rgba(9, 9, 11, 0.085)';
                ctx.fillRect(0, 0, rect.width, rect.height);

                ctx.font = `bold ${fontSize}px monospace`;
                ctx.fillStyle = color;

                for (let i = 0; i < drops.length; i++) {
                    const char = charArr[Math.floor(Math.random() * charArr.length)];
                    const x = i * fontSize;
                    const y = drops[i] * fontSize;

                    // Draw the falling character
                    ctx.fillText(char, x, y);

                    // Randomly highlight the leading tip character with white/pink glow for organic feel
                    if (Math.random() > 0.98) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                        ctx.fillText(char, x, y);
                        ctx.fillStyle = color; // reset
                    }

                    // Reset drop coordinates with tiny random offsets once they exceed viewport threshold
                    if (y > rect.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }

                    drops[i]++;
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        animationFrameId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, [color, speed, fontSize]);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none block z-[1] select-none"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};
