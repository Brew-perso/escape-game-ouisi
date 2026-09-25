import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
  onVolumeChange?: (volume: number) => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isListening, onVolumeChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isListening) {
      cleanup();
      return;
    }

    async function startVisualizer() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);

        draw();
      } catch (err) {
        console.warn('Microphone stream access not granted for visualization:', err);
      }
    }

    startVisualizer();

    return () => {
      cleanup();
    };
  }, [isListening]);

  const cleanup = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!analyserRef.current) return;
      animFrameRef.current = requestAnimationFrame(render);
      analyserRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      if (onVolumeChange) {
        onVolumeChange(avg);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;

        // Gradient color: Purple to cyan
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#6366f1'); // Indigo
        grad.addColorStop(0.5, '#a855f7'); // Purple
        grad.addColorStop(1, '#06b6d4'); // Cyan

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        x += barWidth + 2;
      }
    };

    render();
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/80 border border-indigo-500/30 backdrop-blur-sm shadow-inner">
      <div className="flex items-center gap-2 mb-2">
        <span className="relative flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isListening ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isListening ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
          {isListening ? 'Microphone actif - Parlez distinctement' : 'En attente du micro...'}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={240}
        height={50}
        className="w-full max-w-[280px] h-12 rounded-lg bg-slate-950/60"
      />
    </div>
  );
};
