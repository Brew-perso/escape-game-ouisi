import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isListening }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isListening) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 20;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      phase += 0.12;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        // Natural pulsing soundwave calculation without taking hardware mic lock
        const wave = Math.sin(phase + i * 0.45) * 0.5 + 0.5;
        const barHeight = Math.max(6, wave * (canvas.height * 0.85));
        const x = i * (barWidth + 2);
        const y = (canvas.height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#6366f1'); // Indigo
        grad.addColorStop(0.5, '#a855f7'); // Purple
        grad.addColorStop(1, '#06b6d4'); // Cyan

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 3, 3]);
        ctx.fill();
      }
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isListening]);

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/90 border border-indigo-500/30 backdrop-blur-sm shadow-inner w-full max-w-[280px]">
      <div className="flex items-center gap-2 mb-2">
        <span className="relative flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isListening ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isListening ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
          {isListening ? 'Micro à l\'écoute • Parle !' : 'En attente...'}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={240}
        height={46}
        className="w-full h-11 rounded-lg bg-slate-950/80"
      />
    </div>
  );
};
