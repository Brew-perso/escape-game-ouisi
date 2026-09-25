import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import type { CourseSession } from '../../types';
import { sounds } from '../../utils/audio';

interface Stage2Props {
  course: CourseSession;
  onComplete: (digit: string, points: number) => void;
}

export const Stage2Tools: React.FC<Stage2Props> = ({ course, onComplete }) => {
  const originalSteps = [
    { id: 'step-change', text: 'Observer les réductions de voyelles (ex: le Schwa /ə/ dans "GU-vər-mənt")', stepNum: 3 },
    { id: 'step-divide', text: 'Découper le mot en syllabes (ex: go - vern - ment)', stepNum: 1 },
    { id: 'step-stress', text: 'Repérer la syllabe accentuée : plus forte, plus aiguë, plus longue', stepNum: 2 },
  ];

  const [orderedSteps, setOrderedSteps] = useState<typeof originalSteps>([]);
  const [stepsSolved, setStepsSolved] = useState(false);
  const [toolAnswered, setToolAnswered] = useState(false);
  const [selectedToolIdx, setSelectedToolIdx] = useState<number | null>(null);

  const handleSelectStep = (step: (typeof originalSteps)[0]) => {
    sounds.playClick();
    if (orderedSteps.find((s) => s.id === step.id)) return;

    const newOrder = [...orderedSteps, step];
    setOrderedSteps(newOrder);

    if (newOrder.length === 3) {
      const isCorrect =
        newOrder[0].stepNum === 1 &&
        newOrder[1].stepNum === 2 &&
        newOrder[2].stepNum === 3;

      if (isCorrect) {
        sounds.playSuccess();
        setStepsSolved(true);
      } else {
        sounds.playGentleError();
        setTimeout(() => {
          setOrderedSteps([]);
        }, 1200);
      }
    }
  };

  const handleToolClick = (idx: number) => {
    setSelectedToolIdx(idx);
    sounds.playClick();
    if (idx === 1) {
      sounds.playSuccess();
      setToolAnswered(true);
    } else {
      sounds.playGentleError();
    }
  };

  const handleFinish = () => {
    const digit2 = course.vaultCode[1];
    onComplete(digit2, 250);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="parchment-card rounded-2xl p-5 shadow-2xl relative overflow-hidden border border-amber-600/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center shrink-0 shadow-inner">
            <BookOpen className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-serif uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                2ème Sceau Mystique
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold">
                +250 pts
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-amber-100 mt-1">
              Le Rituel en 3 Actes & Les Parchemins de l'Erudit
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-stone-300 mt-3 font-serif leading-relaxed">
          Pour décoder le rythme anglo-saxon, l'initié doit ordonner les <strong>3 étapes d'or</strong> du cours (Slide 13) et identifier les <strong>meilleurs parchemins et archives</strong> recommandés par la Guilde.
        </p>
      </div>

      {/* Part A: Reorder the 3 golden steps */}
      <div className="parchment-card rounded-3xl p-6 shadow-xl space-y-4 border border-amber-600/30">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-amber-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            1. Ordonne les 3 actes canoniques du Word Stress :
          </h3>
          {stepsSolved && (
            <span className="text-xs font-serif font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Actes accomplis !
            </span>
          )}
        </div>

        <p className="text-xs text-stone-400 font-serif">
          Clique sur les tablettes dans l'ordre chronologique (du 1er au 3ème acte) :
        </p>

        {/* Selected boxes */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((num, i) => {
            const step = orderedSteps[i];
            return (
              <div
                key={num}
                className={`p-3 rounded-xl border text-center transition min-h-[70px] flex flex-col items-center justify-center font-serif ${
                  step
                    ? stepsSolved
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                      : 'bg-amber-950/60 border-amber-500/60 text-amber-200'
                    : 'bg-stone-950/60 border-dashed border-stone-800 text-stone-600'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider mb-1">
                  Acte {num}
                </span>
                <span className="text-xs font-medium line-clamp-2">
                  {step ? step.text.split('(')[0] : '...'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Available buttons to click */}
        {!stepsSolved && (
          <div className="space-y-2 pt-2">
            {originalSteps.map((step) => {
              const isSelected = orderedSteps.find((s) => s.id === step.id);
              return (
                <button
                  key={step.id}
                  disabled={!!isSelected}
                  onClick={() => handleSelectStep(step)}
                  className={`w-full p-3 text-left rounded-xl text-xs font-serif font-medium transition border flex items-center justify-between ${
                    isSelected
                      ? 'opacity-40 bg-stone-950/50 border-stone-900 text-stone-600 cursor-not-allowed'
                      : 'bg-stone-950/80 border-stone-800 hover:border-amber-500 active:scale-[0.99] text-stone-300 hover:text-white hover:bg-stone-900'
                  }`}
                >
                  <span>{step.text}</span>
                  <span className="text-amber-400 shrink-0 ml-2 font-bold">+</span>
                </button>
              );
            })}
          </div>
        )}

        {orderedSteps.length === 3 && !stepsSolved && (
          <p className="text-xs text-rose-400 font-serif text-center">
            L'ordre mystique est brisé ! Souviens-toi : 1. Découper ➔ 2. Repérer l'accent ➔ 3. Noter les réductions.
          </p>
        )}
      </div>

      {/* Part B: The Recommended Tools */}
      {stepsSolved && (
        <div className="parchment-card rounded-3xl p-6 shadow-xl space-y-4 animate-fade-in border border-amber-500/40">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-amber-200 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              2. Quel oracle permet d'entendre des voix vivantes ?
            </h3>
            {toolAnswered && (
              <span className="text-xs font-serif font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Oracle révélé !
              </span>
            )}
          </div>

          <p className="text-xs text-stone-300 font-serif">
            Quel parchemin numérique (recommandé en slide 11 et 17) permet de taper n'importe quel mot et de l'entendre prononcé dans des milliers d'extraits vidéo réels ?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { name: 'Google Traduction', desc: 'Traduction automatique standard', correct: false },
              { name: 'YouGlish.com', desc: 'Prononciations réelles en contexte vidéo', correct: true },
              { name: 'Wikipédia', desc: 'Articles encyclopédiques', correct: false },
            ].map((tool, idx) => (
              <button
                key={tool.name}
                onClick={() => handleToolClick(idx)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between font-serif ${
                  selectedToolIdx === idx
                    ? tool.correct
                      ? 'bg-emerald-950/60 border-emerald-500 text-white'
                      : 'bg-rose-950/50 border-rose-500 text-rose-200'
                    : 'bg-stone-950/70 border-stone-800 hover:border-amber-500 text-stone-300'
                }`}
              >
                <div className="font-bold text-sm mb-1 text-amber-200">{tool.name}</div>
                <div className="text-[11px] text-stone-400">{tool.desc}</div>
              </button>
            ))}
          </div>

          {/* Grimoire notes */}
          <div className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-2xl text-xs font-serif text-stone-300 space-y-1">
            <strong className="text-amber-300 block">Secrets d'entraînement de la Guilde :</strong>
            <ul className="list-disc list-inside space-y-0.5 text-stone-400">
              <li>L'Élastique (ou corde d'arc) : Tends-le sur la voyelle longue accentuée !</li>
              <li>Taper du pied ou ouvrir la main sur la syllabe forte.</li>
              <li>Consulter <em>Longman (LDOCE)</em> ou <em>Merriam-Webster</em> pour guetter la marque d'accent <strong>ˈ</strong>.</li>
            </ul>
          </div>

          {toolAnswered && (
            <div className="pt-2">
              <button
                onClick={handleFinish}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-stone-950 font-serif font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>Révéler le 2ème Chiffre du Reliquaire</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
