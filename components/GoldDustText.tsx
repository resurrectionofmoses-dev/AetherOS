import React, { useMemo } from 'react';

interface GoldDustTextProps {
  text: string;
  className?: string;
  stride?: number;
}

export const GoldDustText: React.FC<GoldDustTextProps> = ({ text, className, stride = 1.2 }) => {
  const words = useMemo(() => text.split(' '), [text]);
  
  const resonanceOpacity = useMemo(() => {
    return Math.max(0.1, (stride - 1.0) / 0.5);
  }, [stride]);

  const driftScale = useMemo(() => Math.max(0.5, stride * 0.8), [stride]);

  return (
    <div className={`relative flex flex-wrap gap-x-3 gap-y-2 perspective-[1000px] overflow-visible ${className}`}>
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-flex overflow-visible whitespace-nowrap">
          {word.split('').map((char, charIdx) => {
            const randomDelay = Math.random() * -20;
            const randomDuration = (15 + Math.random() * 25) / stride;
            
            return (
              <span
                key={charIdx}
                className="inline-block transition-all duration-[5000ms] ease-out hover:text-white hover:scale-150"
                style={{
                  color: '#fbbf24',
                  opacity: resonanceOpacity,
                  textShadow: `0 0 ${12 * stride}px rgba(251, 191, 36, ${0.4 * resonanceOpacity}), 0 0 ${25 * stride}px rgba(251, 191, 36, ${0.1 * resonanceOpacity})`,
                  animation: `gold-ultra-drift-${(wordIdx + charIdx) % 8} ${randomDuration}s ease-in-out infinite alternate`,
                  animationDelay: `${randomDelay}s`,
                  filter: `blur(${Math.max(0, 2 - (stride - 1) * 4)}px)`,
                  willChange: 'transform, opacity',
                  fontSize: `${14 + Math.random() * 4}px`
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
      <style>{`
        @keyframes gold-ultra-drift-0 {
          0% { transform: translate3d(0,0,0) rotate(0deg); opacity: 0.8; }
          100% { transform: translate3d(${25 * driftScale}vw, -${30 * driftScale}vh, 400px) rotate(15deg); opacity: 0.1; }
        }
        @keyframes gold-ultra-drift-1 {
          0% { transform: translate3d(0,0,0) rotate(0deg); opacity: 0.7; }
          100% { transform: translate3d(-${20 * driftScale}vw, ${25 * driftScale}vh, -300px) rotate(-25deg); opacity: 0.2; }
        }
        @keyframes gold-ultra-drift-2 {
          0% { transform: translate3d(0,0,0); opacity: 0.9; }
          100% { transform: translate3d(${30 * driftScale}vw, ${10 * driftScale}vh, 100px) scale(0.5); opacity: 0; }
        }
        @keyframes gold-ultra-drift-3 {
          0% { transform: translate3d(0,0,0); opacity: 0.6; }
          100% { transform: translate3d(-${35 * driftScale}vw, -${40 * driftScale}vh, 600px) scale(1.4); opacity: 0.15; }
        }
        @keyframes gold-ultra-drift-4 {
          0% { transform: translate3d(0,0,0); opacity: 0.8; }
          100% { transform: translate3d(${15 * driftScale}vw, ${45 * driftScale}vh, -500px) blur(6px); opacity: 0.05; }
        }
        @keyframes gold-ultra-drift-5 {
          0% { transform: translate3d(0,0,0); opacity: 0.7; }
          100% { transform: translate3d(-${40 * driftScale}vw, ${5 * driftScale}vh, 200px) rotateY(180deg); opacity: 0.1; }
        }
        @keyframes gold-ultra-drift-6 {
          0% { transform: translate3d(0,0,0); opacity: 0.9; }
          100% { transform: translate3d(${5 * driftScale}vw, -${50 * driftScale}vh, -100px) rotateX(90deg); opacity: 0.2; }
        }
        @keyframes gold-ultra-drift-7 {
          0% { transform: translate3d(0,0,0); opacity: 0.8; }
          100% { transform: translate3d(-${10 * driftScale}vw, ${40 * driftScale}vh, 300px) scale(0.8); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};