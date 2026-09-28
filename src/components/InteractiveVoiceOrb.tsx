import React, { useState, useEffect, useRef } from 'react';
import { Mic, CheckCircle2, Sparkles, AlertCircle, Play, Volume2, RotateCcw, ArrowRight } from 'lucide-react';
import { VoiceEngine, type VoiceEngineState } from '../utils/voiceEngine';
import { sounds } from '../utils/audio';

interface InteractiveVoiceOrbProps {
  targetWord: string;
  targetDisplay: string;
  modelAudioText?: string;
  modelAudioUrl?: string;
  postSuccessAudioText?: string;
  postSuccessAudioLabel?: string;
  externalSuccess?: boolean;
  onSuccess: () => void;
  onAdvance?: () => void;
  nextLabel?: string;
  accentColor?: 'amber' | 'emerald' | 'rose';
}

export const InteractiveVoiceOrb: React.FC<InteractiveVoiceOrbProps> = ({
  targetWord,
  targetDisplay,
  modelAudioText,
  modelAudioUrl,
  postSuccessAudioText,
  postSuccessAudioLabel,
  externalSuccess,
  onSuccess,
  onAdvance,
  nextLabel,
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
  const mountCooldownRef = useRef(false);
  const voiceEngineRef = useRef<VoiceEngine | null>(null);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (externalSuccess && !hasSucceeded) {
      hasTriggeredRef.current = true;
      setHasSucceeded(true);
      voiceEngineRef.current?.stopListening();
    }
  }, [externalSuccess, hasSucceeded]);

  useEffect(() => {
    hasTriggeredRef.current = false;
    mountCooldownRef.current = false;
    setHasSucceeded(false);

    // 350ms mount guard: discard any touch/click event queued from previous question
    const mountTimer = setTimeout(() => {
      mountCooldownRef.current = true;
    }, 350);

    voiceEngineRef.current = new VoiceEngine((newState) => {
      setEngineState(newState);

      // Single-shot trigger protection: can NEVER trigger twice
      if (newState.voiceDetected && !hasTriggeredRef.current && mountCooldownRef.current) {
        hasTriggeredRef.current = true;
        setHasSucceeded(true);
        sounds.playSuccess();
        voiceEngineRef.current?.stopListening();

        // Notify parent immediately so state is saved, but DO NOT auto-advance!
        onSuccessRef.current();
      }
    });

    return () => {
      clearTimeout(mountTimer);
      if (voiceEngineRef.current) {
        voiceEngineRef.current.stopListening();
        voiceEngineRef.current = null;
      }
    };
  }, [targetWord]);

  const handleOrbClick = async () => {
    if (!mountCooldownRef.current || hasTriggeredRef.current || hasSucceeded) return;

    sounds.playClick();
    if (engineState.isListening) {
      voiceEngineRef.current?.stopListening();
    } else {
      await voiceEngineRef.current?.startListening([targetWord, 'yet', 'pas encore']);
    }
  };

  const handleManualValidation = () => {
    if (!mountCooldownRef.current || hasTriggeredRef.current || hasSucceeded) return;
    hasTriggeredRef.current = true;

    sounds.playSuccess();
    setHasSucceeded(true);
    if (voiceEngineRef.current) {
      voiceEngineRef.current.stopListening();
    }
    onSuccessRef.current();
  };

  const handlePlayModel = () => {
    sounds.stopSpeech();
    sounds.speakEnglish(modelAudioText || targetWord, {
      audioUrl: modelAudioUrl,
      rate: 0.85,
    });
  };

  const handlePlayPostSuccessModel = () => {
    sounds.stopSpeech();
    sounds.speakEnglish(postSuccessAudioText || modelAudioText || targetWord, {
      audioUrl: modelAudioUrl,
      rate: 0.85,
    });
  };

  const handlePlayRecording = () => {
    sounds.stopSpeech();
    if (engineState.recordedAudioUrl) {
      const audio = new Audio(engineState.recordedAudioUrl);
      audio.play().catch((e) => console.warn('Could not replay audio:', e));
    }
  };

  const handleRetry = () => {
    sounds.playClick();
    sounds.stopSpeech();
    hasTriggeredRef.current = false;
    setHasSucceeded(false);
    voiceEngineRef.current?.stopListening();
  };

  const handleAdvance = () => {
    sounds.playClick();
    sounds.stopSpeech();
    onAdvance?.();
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 py-2 font-serif">
      {/* Option to listen to the model before recording */}
      {!hasSucceeded && !engineState.isListening && (
        <button
          type="button"
          onClick={handlePlayModel}
          className="inline-flex items-center gap-1.5 text-xs font-serif font-semibold text-amber-200 hover:text-white bg-stone-900/90 hover:bg-stone-800 px-3.5 py-1.5 rounded-full border border-amber-600/40 transition shadow active:scale-95"
        >
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>Écouter la prononciation du Maître</span>
        </button>
      )}

      {/* Interactive Medieval Runic Orb Button */}
      <div className="relative flex items-center justify-center">
        {/* Outer glowing runic ring */}
        <div
          className={`absolute -inset-2 rounded-full transition-all duration-300 ${
            engineState.isListening
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 opacity-60 blur-md animate-pulse'
              : hasSucceeded
              ? 'bg-emerald-500/30 blur-md'
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

      {/* Direct Fallback Validation Button (before success) */}
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

      {/* Post-Success Action Panel (Listening, Review & Controlled Advance) */}
      {hasSucceeded && (
        <div className="w-full space-y-3 p-4 rounded-2xl bg-stone-900/95 border border-emerald-500/50 shadow-2xl animate-fade-in text-center font-serif">
          <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Incantation validée !</span>
          </div>

          {/* Listening and comparison controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {/* Listen to model / transformed sentence */}
            <button
              type="button"
              onClick={handlePlayPostSuccessModel}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-950 border border-amber-500/50 hover:border-amber-400 active:scale-95 text-xs font-serif font-semibold text-amber-200 hover:text-white transition shadow"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{postSuccessAudioLabel || 'Écouter le modèle'}</span>
            </button>

            {/* Replay student's own recording if available */}
            {engineState.recordedAudioUrl && (
              <button
                type="button"
                onClick={handlePlayRecording}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-950 border border-emerald-500/50 hover:border-emerald-400 active:scale-95 text-xs font-serif font-semibold text-emerald-300 hover:text-white transition shadow"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>Réécouter mon enregistrement</span>
              </button>
            )}

            {/* Re-record / Retry */}
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-stone-700 active:scale-95 text-xs font-serif text-stone-400 hover:text-stone-300 transition"
              title="Recommencer l'enregistrement pour t'améliorer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span>Réessayer</span>
            </button>
          </div>

          {/* Next action button: User chooses when to advance! */}
          {onAdvance && (
            <div className="pt-2 border-t border-stone-800/80">
              <button
                type="button"
                onClick={handleAdvance}
                className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-stone-950 font-serif font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <span>{nextLabel || 'Continuer'}</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
