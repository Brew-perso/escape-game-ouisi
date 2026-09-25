import React, { useState } from 'react';
import { Volume2, ArrowRight, CheckCircle2, Music2, Sparkles, Compass } from 'lucide-react';
import type { CourseSession, SyllableWord } from '../../types';
import { sounds } from '../../utils/audio';

interface Stage3Props {
  course: CourseSession;
  onComplete: (digit: string, points: number) => void;
}

export const Stage3Rhythm: React.FC<Stage3Props> = ({ course, onComplete }) => {
  const words = course.rhythmWords;
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [solvedWordIds, setSolvedWordIds] = useState<string[]>([]);
  const [selectedSyllableIdx, setSelectedSyllableIdx] = useState<number | null>(null);
  const [activeHintLevel, setActiveHintLevel] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [stretchingIndex, setStretchingIndex] = useState<number | null>(null);

  const currentWord: SyllableWord = words[currentWordIndex];
  const allWordsDone = solvedWordIds.length >= 4;

  const handlePlayWord = () => {
    sounds.speakEnglish(currentWord.audioText || currentWord.word, { rate: 0.85 });
  };

  const handlePlayRhythmComparison = (pattern: 'LA-la' | 'la-LA') => {
    if (pattern === 'LA-la') {
      sounds.playBeat(true);
      setTimeout(() => sounds.playBeat(false), 240);
    } else {
      sounds.playBeat(false);
      setTimeout(() => sounds.playBeat(true), 240);
    }
  };

  const handleSyllableClick = (idx: number) => {
    setSelectedSyllableIdx(idx);
    setStretchingIndex(idx);
    sounds.playRubberStretch(idx === currentWord.stressedIndex ? 1.2 : 0.8);

    if (idx === currentWord.stressedIndex) {
      sounds.playSuccess();
      setFeedback({
        isCorrect: true,
        text: `Victoire ! La corde résonne sur [${currentWord.syllables[idx].toUpperCase()}]. ${currentWord.soundChangeNote || ''}`,
      });

      if (!solvedWordIds.includes(currentWord.id)) {
        setSolvedWordIds((prev) => [...prev, currentWord.id]);
      }
    } else {
      sounds.playGentleError();
      setFeedback({
        isCorrect: false,
        text: `Faible écho sur [${currentWord.syllables[idx]}]. Réécoute le mot et tends la corde sur la syllabe à la voyelle la plus longue et aiguë !`,
      });
    }

    setTimeout(() => {
      setStretchingIndex(null);
    }, 400);
  };

  const handleNextWord = () => {
    setSelectedSyllableIdx(null);
    setFeedback(null);
    setActiveHintLevel(0);
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    }
  };

  const handleFinish = () => {
    const digit3 = course.vaultCode[2];
    onComplete(digit3, 250);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="parchment-card rounded-2xl p-5 shadow-2xl relative overflow-hidden border border-amber-600/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center shrink-0 shadow-inner">
            <Compass className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-serif uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                3ème Sceau Mystique
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold">
                +250 pts
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-amber-100 mt-1">
              L'Écho Rythmique & La Corde d'Arc (Rubber Band)
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-stone-300 mt-3 font-serif leading-relaxed">
          En langue anglaise, l'accentuation syllabique est la clé de voûte de toute compréhension. Écoute la prononciation du Maître, bande la corde et désigne la syllabe <strong>forte, longue et aiguë</strong> !
        </p>
      </div>

      {/* Mini rhythm warmup (LA-la vs la-LA) */}
      <div className="p-3.5 bg-stone-950/80 border border-stone-800 rounded-2xl flex items-center justify-between text-xs font-serif">
        <div className="flex items-center gap-2 text-stone-300">
          <Music2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Échauffement rythmique (Slide 15) :</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePlayRhythmComparison('LA-la')}
            className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 active:scale-95 rounded-lg text-amber-300 border border-amber-600/30 transition text-[11px]"
          >
            LA - la 🥁
          </button>
          <button
            onClick={() => handlePlayRhythmComparison('la-LA')}
            className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 active:scale-95 rounded-lg text-amber-300 border border-amber-600/30 transition text-[11px]"
          >
            la - LA 🥁
          </button>
        </div>
      </div>

      {/* Word Challenge Card */}
      <div className="parchment-card rounded-3xl p-6 shadow-2xl relative space-y-6 border border-amber-600/40">
        <div className="flex items-center justify-between text-xs font-serif text-stone-400">
          <span className="font-semibold text-amber-300">
            Mot {currentWordIndex + 1} / {words.length} : {currentWord.category}
          </span>
          <span className="text-emerald-400 font-bold">
            {solvedWordIds.length} mot(s) maîtrisé(s)
          </span>
        </div>

        {/* Word display & Audio play button */}
        <div className="text-center space-y-3">
          <h3 className="text-3xl font-serif font-black tracking-wide text-amber-200 capitalize">
            {currentWord.word}
          </h3>
          <p className="text-xs text-stone-400 font-mono">
            {currentWord.phonetic}
          </p>

          <button
            onClick={handlePlayWord}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-amber-200 hover:text-white font-serif font-bold text-xs rounded-2xl border border-amber-500/40 shadow-lg transition"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Écouter la prononciation</span>
          </button>
        </div>

        {/* Syllable Buttons (Runic Archery Tablets) */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-serif text-center text-stone-300">
            Sur quelle syllabe l'accent frappe-t-il ? (Clique pour tendre la corde) :
          </p>

          <div className="grid grid-cols-3 gap-3">
            {currentWord.syllables.map((syl, idx) => {
              const isSelected = selectedSyllableIdx === idx;
              const isCorrect = idx === currentWord.stressedIndex;
              const isStretching = stretchingIndex === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleSyllableClick(idx)}
                  className={`relative p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center transform font-serif ${
                    isStretching ? 'scale-105 shadow-amber-500/30 shadow-lg' : 'hover:scale-[1.02]'
                  } ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200'
                        : 'bg-rose-950/70 border-rose-500 text-rose-200'
                      : 'bg-stone-950/80 border-stone-800 hover:border-amber-500 text-stone-200'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-stone-500 mb-1">
                    Syllabe {idx + 1}
                  </span>
                  <span
                    className={`font-serif font-bold tracking-wider text-lg uppercase ${
                      isSelected && isCorrect ? 'text-emerald-300' : 'text-amber-200'
                    }`}
                  >
                    {syl}
                  </span>

                  {/* Visual cord string */}
                  <div
                    className={`mt-2 h-1 rounded-full transition-all duration-300 ${
                      isSelected && isCorrect
                        ? 'w-full bg-emerald-400 shadow-sm'
                        : isSelected
                        ? 'w-1/2 bg-rose-400'
                        : 'w-6 bg-stone-700'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-serif leading-relaxed border ${
              feedback.isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Hints progression */}
        <div className="pt-2 border-t border-stone-800 space-y-2">
          <div className="flex items-center justify-between font-serif">
            <span className="text-xs text-stone-400">Besoin d'un indice de la Guilde ?</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveHintLevel(1);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                  activeHintLevel >= 1
                    ? 'bg-amber-950 border-amber-500/50 text-amber-300'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                Indice 1
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveHintLevel(2);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                  activeHintLevel >= 2
                    ? 'bg-amber-950 border-amber-500/50 text-amber-300'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                Indice 2 (Règle)
              </button>
            </div>
          </div>

          {activeHintLevel === 1 && (
            <p className="text-xs text-amber-200 bg-stone-950/90 p-3 rounded-xl border border-amber-500/30 font-serif">
              💡 {currentWord.hint1}
            </p>
          )}
          {activeHintLevel === 2 && (
            <p className="text-xs text-amber-200 bg-stone-950/90 p-3 rounded-xl border border-amber-500/30 font-serif">
              💡 {currentWord.hint2}
            </p>
          )}
        </div>

        {/* Navigation between words */}
        <div className="flex items-center justify-between pt-2">
          {currentWordIndex < words.length - 1 ? (
            <button
              onClick={handleNextWord}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-200 font-serif font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-stone-800 transition"
            >
              <span>Mot suivant ({currentWordIndex + 2}/{words.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            allWordsDone && (
              <button
                onClick={handleFinish}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-stone-950 font-serif font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>Révéler le 3ème Chiffre du Reliquaire</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>
            )
          )}
        </div>

        {allWordsDone && currentWordIndex < words.length - 1 && (
          <div className="pt-2">
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-amber-300 font-serif font-bold text-xs rounded-xl border border-amber-500/40 shadow-lg flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Suffisamment de mots maîtrisés ! Passer au 4ème Sceau</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
