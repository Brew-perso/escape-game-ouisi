import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, CheckCircle2, Play, AlertCircle, Sparkles } from 'lucide-react';
import { VoiceEngine, type VoiceEngineState } from '../utils/voiceEngine';
import { sounds, getSharedAudioContext } from '../utils/audio';

interface MicrophoneDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MicrophoneDiagnosticModal: React.FC<MicrophoneDiagnosticModalProps> = ({
  isOpen,
  onClose,
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

  const [testSuccess, setTestSuccess] = useState(false);
  const voiceEngineRef = useRef<VoiceEngine | null>(null);

  useEffect(() => {
    if (isOpen) {
      voiceEngineRef.current = new VoiceEngine((state) => {
        setEngineState(state);
        if (state.voiceDetected) {
          setTestSuccess(true);
          sounds.playSuccess();
        }
      });
    } else {
      if (voiceEngineRef.current) {
        voiceEngineRef.current.stopListening();
        voiceEngineRef.current = null;
      }
      setTestSuccess(false);
    }

    return () => {
      if (voiceEngineRef.current) {
        voiceEngineRef.current.stopListening();
        voiceEngineRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const audioCtx = getSharedAudioContext();
  const ctxState = audioCtx ? audioCtx.state : 'non disponible';

  const handleStartTest = async () => {
    sounds.playClick();
    setTestSuccess(false);
    if (engineState.isListening) {
      voiceEngineRef.current?.stopListening();
    } else {
      await voiceEngineRef.current?.startListening(['yet', 'test']);
    }
  };

  const handlePlayRecording = () => {
    if (engineState.recordedAudioUrl) {
      const audio = new Audio(engineState.recordedAudioUrl);
      audio.play().catch((e) => console.warn('Erreur lecture replay:', e));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-serif">
      <div className="parchment-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-amber-600/40 relative space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-100">
              Sonde Mystique du Microphone
            </h3>
            <p className="text-xs text-stone-400">
              Diagnostique et teste la capture vocale sur ton appareil
            </p>
          </div>
        </div>

        {/* Diagnostic Status Box */}
        <div className="space-y-2 p-3.5 bg-stone-950/80 rounded-2xl border border-stone-800 text-xs">
          <div className="flex justify-between items-center text-stone-300">
            <span>Moteur Web Audio :</span>
            <span className="font-mono font-bold text-amber-400 uppercase">
              {ctxState}
            </span>
          </div>
          <div className="flex justify-between items-center text-stone-300">
            <span>Autorisation micro :</span>
            <span className={`font-mono font-bold ${engineState.micPermissionGranted ? 'text-emerald-400' : 'text-stone-400'}`}>
              {engineState.micPermissionGranted ? 'Accordée ✓' : 'En attente...'}
            </span>
          </div>
          <div className="flex justify-between items-center text-stone-300">
            <span>Intensité mesurée :</span>
            <span className="font-mono font-bold text-amber-300">
              {engineState.volume}%
            </span>
          </div>
        </div>

        {/* VU Meter Visualizer */}
        <div className="space-y-2 text-center">
          <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                engineState.volume >= 14
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400'
                  : 'bg-stone-700'
              }`}
              style={{ width: `${Math.max(3, engineState.volume)}%` }}
            />
          </div>
          <span className="text-[11px] text-stone-400 italic">
            {engineState.volume >= 14
              ? '🔥 Signal vocal détecté avec succès !'
              : engineState.isListening
              ? 'En attente de ta voix (dis "YET !")...'
              : 'Clique sur le bouton pour tester'}
          </span>
        </div>

        {/* Test Trigger Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleStartTest}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
              testSuccess
                ? 'bg-emerald-800 border border-emerald-500 text-emerald-100'
                : engineState.isListening
                ? 'bg-amber-600 border border-amber-400 text-stone-950 animate-medieval-pulse'
                : 'bg-stone-900 hover:bg-stone-850 border border-amber-600/50 text-amber-200'
            }`}
          >
            {testSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Succès : Ta voix a été captée !</span>
              </>
            ) : engineState.isListening ? (
              <>
                <Mic className="w-4 h-4 animate-pulse" />
                <span>Microphone Ouvert : Parle fort !</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Lancer le test du micro</span>
              </>
            )}
          </button>

          {/* Replay recording button */}
          {engineState.recordedAudioUrl && !engineState.isListening && (
            <button
              type="button"
              onClick={handlePlayRecording}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 border border-amber-500/40 text-xs text-amber-300 hover:text-white transition shadow"
            >
              <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Réécouter ce que le micro a capté</span>
            </button>
          )}
        </div>

        {/* Android / Poco specific tips */}
        <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1.5 leading-relaxed">
          <p className="font-bold text-amber-300 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Astuces pour Android (Poco / Xiaomi / MIUI) :</span>
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Si le volume reste à 0%, clique sur le cadenas 🔒 à gauche de l'adresse URL et choisis <strong>Autoriser le micro</strong>.</li>
            <li>Parle à environ 10-15 cm du bas de ton smartphone d'une voix nette et ferme.</li>
            <li>En cas de salle bruyante ou de blocage matériel, chaque épreuve comporte le bouton de validation manuelle immédiat.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
