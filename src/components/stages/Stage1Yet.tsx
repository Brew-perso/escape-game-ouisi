import React, { useState } from 'react';
import { Shield, ArrowRight, CheckCircle2, Scroll, Sparkles } from 'lucide-react';
import type { CourseSession } from '../../types';
import { sounds } from '../../utils/audio';
import { InteractiveVoiceOrb } from '../InteractiveVoiceOrb';

interface Stage1Props {
  course: CourseSession;
  onComplete: (digit: string, points: number) => void;
}

export const Stage1Yet: React.FC<Stage1Props> = ({ course, onComplete }) => {
  const [completedSentences, setCompletedSentences] = useState<string[]>([]);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [selectedMindsetOption, setSelectedMindsetOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const sentences = course.yetSentences;
  const currentSentence = sentences[activeSentenceIndex];
  const allSentencesDone = completedSentences.length === sentences.length;

  const handleSuccessYet = () => {
    sounds.playSuccess();

    if (!completedSentences.includes(currentSentence.id)) {
      setCompletedSentences((prev) => [...prev, currentSentence.id]);
    }

    // Play text-to-speech for the transformed sentence
    sounds.speakEnglish(currentSentence.correctedSentence);

    // Advance to next sentence
    if (activeSentenceIndex < sentences.length - 1) {
      setTimeout(() => {
        setActiveSentenceIndex((prev) => prev + 1);
        setTypedInput('');
      }, 1200);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedInput.trim().toUpperCase() === 'YET') {
      handleSuccessYet();
    } else {
      sounds.playGentleError();
    }
  };

  const handleMindsetAnswer = (optionIdx: number) => {
    setSelectedMindsetOption(optionIdx);
    setShowExplanation(true);
    if (optionIdx === 1) {
      sounds.playSuccess();
      setQuestionAnswered(true);
    } else {
      sounds.playGentleError();
    }
  };

  const handleFinishStage = () => {
    const digit1 = course.vaultCode[0];
    onComplete(digit1, 250);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Stage Header - Medieval Grimoire Style */}
      <div className="parchment-card rounded-2xl p-5 shadow-2xl relative overflow-hidden border border-amber-600/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center shrink-0 shadow-inner">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-serif uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                1er Sceau Mystique
              </span>
              <span className="text-xs text-amber-400/90 font-mono font-bold flex items-center gap-1">
                +250 pts
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-amber-100 mt-1">
              Le Sceau de Résilience & Le Mot d'Incantation "YET"
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-stone-300 mt-3 font-serif leading-relaxed">
          Pour briser le premier verrou du Reliquaire, l'initié doit neutraliser 3 malédictions de découragement
          avec le mot magique enseigné par la Grande Erudite Carol Dweck : <strong>« YET »</strong> !
        </p>
      </div>

      {/* Progress of seals */}
      <div className="flex items-center justify-between px-2">
        <span className="text-[11px] font-serif uppercase tracking-widest font-bold text-stone-400">
          Sceaux purifiés ({completedSentences.length}/{sentences.length})
        </span>
        <div className="flex gap-2">
          {sentences.map((s, idx) => (
            <div
              key={s.id}
              className={`w-8 h-2 rounded-full transition-all duration-300 ${
                completedSentences.includes(s.id)
                  ? 'bg-amber-400 shadow-sm shadow-amber-500/60'
                  : idx === activeSentenceIndex
                  ? 'bg-amber-600/70'
                  : 'bg-stone-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main interactive challenge card */}
      {!allSentencesDone ? (
        <div className="parchment-card rounded-3xl p-6 shadow-2xl relative space-y-5 border border-amber-600/40">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-serif uppercase tracking-widest text-amber-400 font-bold flex items-center justify-center gap-1.5">
              <Scroll className="w-3.5 h-3.5 text-amber-400" />
              <span>Malédiction à dissiper #{activeSentenceIndex + 1}</span>
            </span>
            <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-stone-200 font-serif text-lg italic shadow-inner">
              "{currentSentence.toxicSentence}"
            </div>
          </div>

          {/* Interactive Voice Orb with real-time volume detection */}
          <div className="space-y-3">
            <p className="text-xs text-center text-stone-400 font-serif">
              Prononce le mot sacré <strong className="text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">YET !</strong> dans ton micro :
            </p>

            <InteractiveVoiceOrb
              targetWord="yet"
              targetDisplay="YET !"
              onSuccess={handleSuccessYet}
            />

            {/* Quick manual typing fallback */}
            <div className="pt-2 border-t border-stone-800 text-center">
              <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="Ou écris YET ici..."
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-serif uppercase tracking-widest bg-stone-950 border border-stone-800 rounded-xl focus:outline-none focus:border-amber-500 text-center text-amber-200 font-bold placeholder:text-stone-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-600 active:scale-95 text-stone-950 font-serif font-bold rounded-xl text-xs transition"
                >
                  Dissiper
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Sentences completed -> Carol Dweck wisdom check */
        <div className="parchment-card rounded-3xl p-6 shadow-2xl space-y-5 animate-fade-in border border-amber-500/40">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif font-bold text-amber-100">Les 3 Malédictions sont dissipées !</h3>
            <p className="text-xs text-stone-300 font-serif">
              Épreuve de sagesse : Que se produit-il réellement lors de l'effort et de l'erreur ?
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => handleMindsetAnswer(0)}
              className={`w-full p-3.5 text-left rounded-xl text-xs font-serif transition border ${
                selectedMindsetOption === 0
                  ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                  : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 text-stone-300'
              }`}
            >
              A. Rien, cela prouve que les langues étrangères sont un don inné que l'on possède ou non.
            </button>

            <button
              onClick={() => handleMindsetAnswer(1)}
              className={`w-full p-3.5 text-left rounded-xl text-xs font-serif transition border ${
                selectedMindsetOption === 1
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10'
                  : 'bg-stone-950/70 border-stone-800 hover:border-amber-600 text-stone-300'
              }`}
            >
              B. ✨ L'effort forge de nouvelles connexions neuronales : le cerveau grandit et se muscle face à la difficulté !
            </button>

            <button
              onClick={() => handleMindsetAnswer(2)}
              className={`w-full p-3.5 text-left rounded-xl text-xs font-serif transition border ${
                selectedMindsetOption === 2
                  ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                  : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 text-stone-300'
              }`}
            >
              C. L'erreur est une honte qu'il convient de cacher.
            </button>
          </div>

          {showExplanation && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-serif leading-relaxed border ${
                selectedMindsetOption === 1
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}
            >
              {selectedMindsetOption === 1 ? (
                <div>
                  <strong>Enseignement de la Guilde (Slide 7) :</strong> "Struggling when something is difficult makes your brain grow. Mistakes are not signs of failure; they are signs that you are trying and learning."
                </div>
              ) : (
                <div>
                  <strong>Fausse route !</strong> L'esprit figé (*Fixed Mindset*) est un piège. Relis attentivement la réponse B : l'effort biologique développe le réseau de neurones.
                </div>
              )}
            </div>
          )}

          {questionAnswered && (
            <div className="pt-2">
              <button
                onClick={handleFinishStage}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-stone-950 font-serif font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>Révéler le 1er Chiffre du Reliquaire</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
