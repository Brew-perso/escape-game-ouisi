import React, { useState, useEffect } from 'react';
import { Mic, Volume2, CheckCircle2, ArrowRight, Sparkles, Flame } from 'lucide-react';
import type { CourseSession, VoiceChallenge } from '../../types';
import { sounds } from '../../utils/audio';
import { createSpeechRecognizer, matchesTargetWords } from '../../utils/speech';
import { AudioVisualizer } from '../AudioVisualizer';

interface Stage4Props {
  course: CourseSession;
  onComplete: (digit: string, points: number) => void;
}

export const Stage4Voice: React.FC<Stage4Props> = ({ course, onComplete }) => {
  const challenges = course.voiceChallenges;
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognizer, setSpeechRecognizer] = useState<{ start: () => void; stop: () => void } | null>(null);
  const [heardTranscript, setHeardTranscript] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentChallenge: VoiceChallenge = challenges[challengeIdx];
  const allChallengesDone = completedChallenges.length === challenges.length;

  useEffect(() => {
    const recognizer = createSpeechRecognizer(
      (transcript) => {
        setHeardTranscript(transcript);
        if (matchesTargetWords(transcript, currentChallenge.targetWords)) {
          handleSuccess();
        }
      },
      (error) => {
        console.warn('Speech recognition error:', error);
        setIsListening(false);
        setStatusMessage('Microphone non détecté ou muet. Tu peux utiliser la validation manuelle !');
      },
      () => {
        setIsListening(false);
      },
      'en-US'
    );
    setSpeechRecognizer(recognizer);

    return () => {
      if (recognizer) recognizer.stop();
    };
  }, [challengeIdx]);

  const toggleMic = () => {
    if (!speechRecognizer) {
      alert("La reconnaissance vocale n'est pas disponible sur ce navigateur. Tu peux valider manuellement avec le bouton 'J'ai prononcé à voix haute !'");
      return;
    }
    if (isListening) {
      speechRecognizer.stop();
      setIsListening(false);
    } else {
      setHeardTranscript(null);
      setStatusMessage('À toi de jouer : parle distinctement dans ton micro !');
      setIsListening(true);
      speechRecognizer.start();
    }
  };

  const handleSuccess = () => {
    sounds.playSuccess();
    if (speechRecognizer && isListening) {
      speechRecognizer.stop();
      setIsListening(false);
    }

    if (!completedChallenges.includes(currentChallenge.id)) {
      setCompletedChallenges((prev) => [...prev, currentChallenge.id]);
    }

    setStatusMessage('Génial ! Accentuation et prononciation validées !');

    if (challengeIdx < challenges.length - 1) {
      setTimeout(() => {
        setChallengeIdx((prev) => prev + 1);
        setHeardTranscript(null);
        setStatusMessage(null);
      }, 1500);
    }
  };

  const handlePlayModel = () => {
    sounds.speakEnglish(currentChallenge.guidePhonetic.replace(/['"]/g, ''), { rate: 0.8 });
  };

  const handleFinish = () => {
    const digit4 = course.vaultCode[3];
    onComplete(digit4, 250);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-600/30 border border-rose-400/50 flex items-center justify-center shrink-0">
            <Mic className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Épreuve 4/4
              </span>
              <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                <Flame className="w-3.5 h-3.5" /> +250 pts
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">L'Épreuve du Micro & Défi Vocal</h2>
          </div>
        </div>
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">
          Le dernier verrou réagit uniquement aux vibrations d'une voix affirmée.
          Dépasse la timidité : en LEA Oui-Si, on apprend en osant parler !
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Défis oraux ({completedChallenges.length}/{challenges.length})
        </span>
        <div className="flex gap-2">
          {challenges.map((c, idx) => (
            <div
              key={c.id}
              className={`w-8 h-2 rounded-full transition-all duration-300 ${
                completedChallenges.includes(c.id)
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50'
                  : idx === challengeIdx
                  ? 'bg-rose-500'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main card */}
      {!allChallengesDone ? (
        <div className="bg-slate-900/90 border border-rose-500/40 rounded-3xl p-6 shadow-2xl relative space-y-5">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
              Mission Vocale #{challengeIdx + 1}
            </span>
            <h3 className="text-base font-semibold text-white">
              {currentChallenge.prompt}
            </h3>

            {/* Target phrase highlight */}
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-rose-500/30 shadow-inner flex flex-col items-center justify-center gap-2">
              <span className="font-mono text-xl font-extrabold text-rose-300">
                {currentChallenge.guidePhonetic}
              </span>
              <button
                onClick={handlePlayModel}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-500/30 transition"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Écouter le modèle audio</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 italic">
              💡 {currentChallenge.pedagogicalTip}
            </p>
          </div>

          {/* Voice Input Section */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggleMic}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 transition-all transform active:scale-95 shadow-2xl ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-500 ring-4 ring-rose-400/50 animate-pulse text-white'
                    : 'bg-gradient-to-tr from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white'
                }`}
              >
                <Mic className="w-10 h-10" />
                <span className="text-[11px] font-bold uppercase">{isListening ? 'Stop' : 'Parler'}</span>
              </button>

              {isListening && <AudioVisualizer isListening={isListening} />}

              {heardTranscript && (
                <div className="text-xs font-mono text-cyan-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  Transcrit : "{heardTranscript}"
                </div>
              )}

              {statusMessage && (
                <div className="text-xs text-center font-medium text-emerald-300 bg-emerald-950/40 px-4 py-2 rounded-xl border border-emerald-500/30">
                  {statusMessage}
                </div>
              )}
            </div>

            {/* Silent room / In-class fallback button */}
            <div className="pt-3 border-t border-slate-800 text-center space-y-2">
              <p className="text-[11px] text-slate-500">
                Dans une salle silencieuse ou micro bloqué ?
              </p>
              <button
                onClick={() => {
                  sounds.playClick();
                  handleSuccess();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition"
              >
                J'ai prononcé à voix haute ! (Valider)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* All voice challenges completed */
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in text-center">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white">4ème Épreuve Validée !</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Tu as prononcé les mots clés et bravé la timidité. Le 4ème et dernier chiffre du coffre est prêt à être révélé.
          </p>

          <button
            onClick={handleFinish}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            <span>Débloquer le Dernier Chiffre et Ouvrir le Coffre !</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>
        </div>
      )}
    </div>
  );
};
