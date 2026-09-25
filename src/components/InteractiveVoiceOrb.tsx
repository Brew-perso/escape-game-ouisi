import React, { useState, useEffect, useRef } from 'react';
import { Mic, CheckCircle2, Sparkles, AlertCircle, Play } from 'lucide-react';
import { VoiceEngine, type VoiceEngineState } from '../utils/voiceEngine';
import { sounds } from '../utils/audio';

interface InteractiveVoiceOrbProps {
  targetWord: string;
  targetDisplay: string;
  onSuccess: () => void;
  accentColor?: 'amber' | 'emerald' | 'rose';
}

export const InteractiveVoiceOrb: React.FC<InteractiveVoiceOrbProps> = ({
  targetWord,
  targetDisplay,
  onSuccess,
}) => {
  const [engineState, setEngineState] = useState<VoiceEngineState>({
    isListening: false,
    micPermissionGranted: false,
    volume: 0,
    voiceDetected: false,
    spokenDurationMs: 0,
    transcript: null,
    recordedAudioUrl: null,
    errorMessage: null,
  });

  const [hasSucceeded, setHasSucceeded] = useState(false);
  const hasTriggeredRef = useRef(false);
  const voiceEngineRef = useRef<VoiceEngine | null>(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    hasTriggeredRef.current = false;
    setHasSucceeded(false);

    voiceEngineRef.current = new VoiceEngine((newState) => {
      setEngineState(newState);

      // Single-shot trigger protection: can NEVER trigger twice
      if (newState.voiceDetected && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        setHasSucceeded(true);
        sounds.playSuccess();

        // Advance cleanly after victory animation
        setTimeout(() => {
          onSuccessRef.current();
        }, 1200);
      }
    });

    return () => {
      if (voiceEngineRef.current) {
        voiceEngineRef.current.stopListening();
        voiceEngineRef.current = null;
      }
    };
  }, [targetWord]);

  const handleOrbClick = async () => {
    if (hasTriggeredRef.current || hasSucceeded) return;

    sounds.playClick();
    if (engineState.isListening) {
      voiceEngineRef.current?.stopListening();
    } else {
      await voiceEngineRef.current?.startListening([targetWord, 'yet', 'pas encore']);
    }
  };

  const handleManualValidation = () => {
    if (hasTriggeredRef.current || hasSucceeded) return;
    hasTriggeredRef.current = true;

    sounds.playClick();
    setHasSucceeded(true);
    if (voiceEngineRef.current) {
      voiceEngineRef.current.stopListening();
    }
    onSuccessRef.current();
  };

  const handlePlayRecording = () => {
    if (engineState.recordedAudioUrl) {
      const audio = new Audio(engineState.recordedAudioUrl);
      audio.play().catch((e) => console.warn('Could not replay audio:', e));
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 py-2 font-serif">
      {/* Interactive Medieval Runic Orb Button */}
      <div className="relative flex items-center justify-center">
        {/* Outer glowing runic ring */}
        <div
          className={`absolute -inset-2 rounded-full transition-all duration-300 ${
            engineState.isListening
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 opacity-60 blur-md animate-pulse'
              : 'bg-amber-600/20 blur-sm'
          }`}
        />

        <button
          type="button"
          onClick={handleOrbClick}
          disabled={hasSucceeded}
          className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 flex flex-col items-center justify-center gap-1 transition-all transform active:scale-95 shadow-2xl ${
            hasSucceeded
              ? 'bg-emerald-950 border-emerald-500 text-emerald-400 ring-4 ring-emerald-500/30 cursor-default'
              : engineState.isListening
              ? 'bg-gradient-to-b from-amber-700 via-amber-900 to-stone-950 border-amber-400 text-amber-200 ring-4 ring-amber-500/40 animate-medieval-pulse cursor-pointer'
              : 'bg-gradient-to-b from-stone-800 to-stone-950 border-amber-600/60 hover:border-amber-400 text-amber-400 hover:text-amber-200 cursor-pointer'
          }`}
        >
          {hasSucceeded ? (
            <CheckCircle2 className="w-10 h-10 animate-bounce text-emerald-400" />
          ) : (
            <Mic className={`w-9 h-9 sm:w-10 sm:h-10 ${engineState.isListening ? 'animate-pulse text-amber-300' : ''}`} />
          )}

          <span className="text-[10px] sm:text-xs font-serif uppercase tracking-widest font-bold">
            {hasSucceeded ? 'Sceau Brisé !' : engineState.isListening ? 'À l\'écoute' : 'Prononcer'}
          </span>
        </button>
      </div>

      {/* Live Volume & Feedback Display */}
      {engineState.isListening && (
        <div className="w-full space-y-2 p-3.5 rounded-2xl bg-stone-900/90 border border-amber-600/40 text-center shadow-lg animate-fade-in">
          <div className="flex items-center justify-between text-xs text-amber-300 font-serif">
            <span>Écho de ta voix :</span>
            <span className="font-mono font-bold">{engineState.volume}%</span>
          </div>

          {/* Real Audio Volume Bar */}
          <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                engineState.volume >= 25
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                  : 'bg-gradient-to-r from-stone-700 to-amber-600'
              }`}
              style={{ width: `${Math.max(4, engineState.volume)}%` }}
            />
          </div>

          <p className="text-[11px] text-stone-300 font-serif italic">
            {engineState.volume >= 25 ? (
              <span className="text-emerald-300 font-bold">🔥 Voix reçue ! Continue...</span>
            ) : (
              <>Parle fort et distinctement : <strong className="text-amber-300">{targetDisplay}</strong> !</>
            )}
          </p>
        </div>
      )}

      {/* Error display if permission denied */}
      {engineState.errorMessage && (
        <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/40 p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{engineState.errorMessage}</span>
        </div>
      )}

      {/* Audio Playback of what was recorded */}
      {engineState.recordedAudioUrl && !engineState.isListening && (
        <button
          type="button"
          onClick={handlePlayRecording}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-amber-600/40 text-xs font-serif text-amber-200 hover:text-white transition shadow"
        >
          <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Réécouter mon enregistrement</span>
        </button>
      )}

      {/* Direct Fallback Validation Button */}
      {!hasSucceeded && (
        <button
          type="button"
          onClick={handleManualValidation}
          className="w-full max-w-xs py-2.5 px-4 bg-stone-900 hover:bg-stone-800 active:scale-95 text-stone-300 hover:text-amber-200 font-serif text-xs rounded-xl border border-stone-800 hover:border-amber-600/50 shadow flex items-center justify-center gap-2 transition"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>J'ai prononcé à voix haute ! (Valider)</span>
        </button>
      )}
    </div>
  );
};
