import React, { useState } from 'react';
import { Headphones, Volume2, ArrowRight, CheckCircle2, Flame, Music2 } from 'lucide-react';
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
  const allWordsDone = solvedWordIds.length >= 4; // Complete at least 4 key words to unlock

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
        text: `Bravo ! L'accent est sur [${currentWord.syllables[idx].toUpperCase()}]. ${currentWord.soundChangeNote || ''}`,
      });

      if (!solvedWordIds.includes(currentWord.id)) {
        setSolvedWordIds((prev) => [...prev, currentWord.id]);
      }
    } else {
      sounds.playGentleError();
      setFeedback({
        isCorrect: false,
        text: `Pas tout à fait sur [${currentWord.syllables[idx]}]. Réécoute le mot et étire l'élastique sur la syllabe qui a la voyelle la plus longue et aiguë !`,
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
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Épreuve 3/4
              </span>
              <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                <Flame className="w-3.5 h-3.5" /> +250 pts
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">Le Radar Rythmique & Rubber Band</h2>
          </div>
        </div>
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">
          En anglais, l'accent tonique (<strong>Word Stress</strong>) est le secret numéro 1 pour se faire comprendre.
          Écoute le mot, tends l'élastique et trouve la syllabe <strong>forte, longue et aiguë</strong> !
        </p>
      </div>

      {/* Mini rhythm warmup (LA-la vs la-LA from Slide 15) */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Music2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Échauffement rythmique (Slide 15) :</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePlayRhythmComparison('LA-la')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-lg font-mono text-[11px] text-cyan-300 border border-cyan-500/30 transition"
          >
            LA - la 🥁
          </button>
          <button
            onClick={() => handlePlayRhythmComparison('la-LA')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-lg font-mono text-[11px] text-purple-300 border border-purple-500/30 transition"
          >
            la - LA 🥁
          </button>
        </div>
      </div>

      {/* Word Challenge Card */}
      <div className="bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl relative space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-cyan-300">
            Mot {currentWordIndex + 1} / {words.length} : {currentWord.category}
          </span>
          <span className="text-emerald-400 font-bold">
            {solvedWordIds.length} mot(s) maîtrisé(s)
          </span>
        </div>

        {/* Word display & Audio play button */}
        <div className="text-center space-y-3">
          <h3 className="text-3xl font-extrabold tracking-wide text-white capitalize font-mono">
            {currentWord.word}
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            {currentWord.phonetic}
          </p>

          <button
            onClick={handlePlayWord}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white font-bold rounded-2xl shadow-lg transition"
          >
            <Volume2 className="w-5 h-5 text-cyan-100" />
            <span>Écouter la prononciation</span>
          </button>
        </div>

        {/* Syllable Buttons (The Rubber Band Experience) */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold text-center text-slate-300">
            Sur quelle syllabe l'accent tonique tape-t-il ? (Clique pour tendre l'élastique) :
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
                  className={`relative p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center transform ${
                    isStretching ? 'scale-110 shadow-cyan-500/50 shadow-lg' : 'hover:scale-105'
                  } ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200'
                        : 'bg-rose-950/70 border-rose-500 text-rose-200'
                      : 'bg-slate-950/80 border-slate-700 hover:border-cyan-400 text-white'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Syllabe {idx + 1}
                  </span>
                  <span
                    className={`font-mono font-bold tracking-wider text-lg uppercase ${
                      isSelected && isCorrect ? 'text-emerald-300' : 'text-white'
                    }`}
                  >
                    {syl}
                  </span>

                  {/* Rubber band visual indicator */}
                  <div
                    className={`mt-2 h-1.5 rounded-full transition-all duration-300 ${
                      isSelected && isCorrect
                        ? 'w-full bg-emerald-400 shadow-sm'
                        : isSelected
                        ? 'w-1/2 bg-rose-400'
                        : 'w-6 bg-slate-700'
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
            className={`p-4 rounded-2xl text-xs leading-relaxed border ${
              feedback.isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Hints progression */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Besoin d'un coup de pouce ?</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveHintLevel(1);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition ${
                  activeHintLevel >= 1
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
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
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                Indice 2 (Règle)
              </button>
            </div>
          </div>

          {activeHintLevel === 1 && (
            <p className="text-xs text-amber-200 bg-amber-950/30 p-3 rounded-xl border border-amber-500/30">
              💡 {currentWord.hint1}
            </p>
          )}
          {activeHintLevel === 2 && (
            <p className="text-xs text-amber-200 bg-amber-950/30 p-3 rounded-xl border border-amber-500/30">
              💡 {currentWord.hint2}
            </p>
          )}
        </div>

        {/* Navigation between words */}
        <div className="flex items-center justify-between pt-2">
          {currentWordIndex < words.length - 1 ? (
            <button
              onClick={handleNextWord}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <span>Mot suivant ({currentWordIndex + 2}/{words.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            allWordsDone && (
              <button
                onClick={handleFinish}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition"
              >
                <span>Débloquer le Chiffre n°3 du Coffre</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )
          )}
        </div>

        {allWordsDone && currentWordIndex < words.length - 1 && (
          <div className="pt-2">
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Suffisamment de mots validés ! Passer à l'épreuve suivante</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
