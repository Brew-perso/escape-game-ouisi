import React, { useEffect, useRef, useState } from 'react';
import { Mic, CheckCircle2 } from 'lucide-react';

interface VoiceMeterProps {
  isListening: boolean;
  onVoiceDetected: () => void;
  targetWordDisplay: string;
}

export const VoiceMeter: React.FC<VoiceMeterProps> = ({
  isListening,
  onVoiceDetected,
  targetWordDisplay,
}) => {
  const [volume, setVolume] = useState<number>(0);
  const [voiceSpokeDuration, setVoiceSpokeDuration] = useState<number>(0);
  const [detected, setDetected] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechAccumulatorRef = useRef<number>(0);

  useEffect(() => {
    if (!isListening) {
      cleanup();
      setVolume(0);
      setVoiceSpokeDuration(0);
      speechAccumulatorRef.current = 0;
      setDetected(false);
      return;
    }

    async function startAudioEngine() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;

        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.5;
        analyserRef.current = analyser;

        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length; // 0 to 255
          const normalized = Math.min(100, Math.round((avg / 128) * 100));
          setVolume(normalized);

          // Threshold for voice detection (~15%)
          if (normalized > 14) {
            speechAccumulatorRef.current += 1;
            setVoiceSpokeDuration((prev) => Math.min(100, prev + 12));

            // When user has spoken for ~0.4s (approx 6 frames of voice energy)
            if (speechAccumulatorRef.current >= 6 && !detected) {
              setDetected(true);
              setTimeout(() => {
                onVoiceDetected();
              }, 400);
              return;
            }
          } else {
            // Decaying speech accumulator if silence
            speechAccumulatorRef.current = Math.max(0, speechAccumulatorRef.current - 0.5);
          }

          animFrameRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (err) {
        console.warn('Microphone stream error in VoiceMeter:', err);
      }
    }

    startAudioEngine();

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

  if (!isListening) return null;

  return (
    <div className="w-full max-w-sm mx-auto p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/40 shadow-xl space-y-3 animate-fade-in text-center">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-indigo-300 flex items-center gap-1.5">
          <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Capteur audio en direct</span>
        </span>
        <span className="font-mono text-emerald-400 text-[11px] font-bold">
          {detected ? 'VOIX DÉTECTÉE !' : `${volume}%`}
        </span>
      </div>

      {/* Dynamic Sound Level Bar */}
      <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-75 ${
            volume > 40
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-md shadow-emerald-500/50'
              : volume > 15
              ? 'bg-gradient-to-r from-indigo-500 to-emerald-400'
              : 'bg-slate-700'
          }`}
          style={{ width: `${Math.max(6, volume)}%` }}
        />
      </div>

      {/* Speech validation progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Énergie vocale :</span>
          <span>{detected ? '✓ Validé' : `${voiceSpokeDuration}%`}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-150"
            style={{ width: `${voiceSpokeDuration}%` }}
          />
        </div>
      </div>

      {detected ? (
        <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Mot prononcé à voix haute avec succès !</span>
        </div>
      ) : (
        <p className="text-[11px] text-indigo-200">
          Dis ou crie distinctement <strong className="text-white font-mono bg-indigo-600/60 px-1.5 py-0.5 rounded">{targetWordDisplay}</strong> !
        </p>
      )}
    </div>
  );
};
