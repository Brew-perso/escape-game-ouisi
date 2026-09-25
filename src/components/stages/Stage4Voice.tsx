import React, { useState } from 'react';
import { Volume2, CheckCircle2, ArrowRight, Sparkles, Feather } from 'lucide-react';
import type { CourseSession, VoiceChallenge } from '../../types';
import { sounds } from '../../utils/audio';
import { InteractiveVoiceOrb } from '../InteractiveVoiceOrb';

interface Stage4Props {
  course: CourseSession;
  onComplete: (digit: string, points: number) => void;
}

export const Stage4Voice: React.FC<Stage4Props> = ({ course, onComplete }) => {
  const challenges = course.voiceChallenges;
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  const currentChallenge: VoiceChallenge = challenges[challengeIdx];
  const allChallengesDone = completedChallenges.length === challenges.length;

  const handleSuccess = () => {
    sounds.playSuccess();

    if (!completedChallenges.includes(currentChallenge.id)) {
      setCompletedChallenges((prev) => [...prev, currentChallenge.id]);
    }

    if (challengeIdx < challenges.length - 1) {
      setTimeout(() => {
        setChallengeIdx((prev) => prev + 1);
      }, 1000);
    }
  };

  const handlePlayModel = () => {
    sounds.speakEnglish(currentChallenge.spokenModelText, { rate: 0.85 });
  };

  const handleFinish = () => {
    const digit4 = course.vaultCode[3];
    onComplete(digit4, 250);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="parchment-card rounded-2xl p-5 shadow-2xl relative overflow-hidden border border-amber-600/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center shrink-0 shadow-inner">
            <Feather className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-serif uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                4ème Sceau Mystique
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold">
                +250 pts
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-amber-100 mt-1">
              L'Épreuve du Verbe & La Chambre de l'Écho
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-stone-300 mt-3 font-serif leading-relaxed">
          Le dernier verrou ne cède qu'aux vibrations d'une voix affirmée. Dépasse la réserve : dans la Guilde LEA, l'art du verbe se forge en osant faire résonner la langue !
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between px-2">
        <span className="text-[11px] font-serif uppercase tracking-widest font-bold text-stone-400">
          Incantations accomplies ({completedChallenges.length}/{challenges.length})
        </span>
        <div className="flex gap-2">
          {challenges.map((c, idx) => (
            <div
              key={c.id}
              className={`w-8 h-2 rounded-full transition-all duration-300 ${
                completedChallenges.includes(c.id)
                  ? 'bg-amber-400 shadow-sm shadow-amber-500/60'
                  : idx === challengeIdx
                  ? 'bg-amber-600/70'
                  : 'bg-stone-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main card */}
      {!allChallengesDone ? (
        <div className="parchment-card rounded-3xl p-6 shadow-2xl relative space-y-5 border border-amber-600/40">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-serif uppercase tracking-widest text-amber-400 font-bold">
              Épreuve Orale #{challengeIdx + 1}
            </span>
            <h3 className="text-sm sm:text-base font-serif font-semibold text-stone-200">
              {currentChallenge.prompt}
            </h3>

            {/* Target phrase highlight - normal words divided by syllables with stressed uppercase */}
            <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 shadow-inner flex flex-col items-center justify-center gap-2.5">
              <div className="text-2xl sm:text-3xl font-serif font-black tracking-wide text-amber-300">
                {currentChallenge.displaySyllables}
              </div>

              <button
                type="button"
                onClick={handlePlayModel}
                className="inline-flex items-center gap-1.5 text-xs font-serif font-semibold text-amber-200 hover:text-white bg-stone-900 hover:bg-stone-800 px-3.5 py-1.5 rounded-full border border-amber-600/40 transition shadow"
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Écouter la prononciation du Maître</span>
              </button>
            </div>

            <p className="text-xs text-stone-400 font-serif italic">
              💡 {currentChallenge.pedagogicalTip}
            </p>
          </div>

          {/* Interactive Voice Orb with real-time audio volume detection */}
          <div className="pt-2">
            <InteractiveVoiceOrb
              targetWord={currentChallenge.spokenModelText}
              targetDisplay={currentChallenge.displaySyllables}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      ) : (
        /* All voice challenges completed */
        <div className="parchment-card rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in text-center border border-amber-500/40">
          <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-serif font-bold text-amber-100">Le 4ème Sceau a Résonné !</h3>
          <p className="text-xs text-stone-300 font-serif max-w-sm mx-auto">
            Ta voix a brisé l'ultime enchantement. Les 4 chiffres du Reliquaire de Latour-Maubourg sont désormais en ta possession.
          </p>

          <button
            onClick={handleFinish}
            className="w-full py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-stone-950 font-serif font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-5 h-5 text-stone-950" />
            <span>Débloquer le Dernier Chiffre et Ouvrir le Reliquaire !</span>
            <ArrowRight className="w-5 h-5 text-stone-950" />
          </button>
        </div>
      )}
    </div>
  );
};
