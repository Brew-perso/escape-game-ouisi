import React, { useState } from 'react';
import { Wrench, CheckCircle2, ArrowRight, ExternalLink, Flame, Sparkles } from 'lucide-react';
import type { CourseSession } from '../../types';
import { sounds } from '../../utils/audio';

interface Stage2Props {
  course: CourseSession;
  onComplete: (digit: string, points: number) => void;
}

export const Stage2Tools: React.FC<Stage2Props> = ({ course, onComplete }) => {
  // Step 1: Re-order the 3 steps of word stress
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
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Épreuve 2/4
              </span>
              <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                <Flame className="w-3.5 h-3.5" /> +250 pts
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">L'Arsenal & La Méthode en 3 Étapes</h2>
          </div>
        </div>
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">
          Pour percer le secret du rythme anglais, le détective doit maîtriser les <strong>3 étapes clés</strong> (Slide 13) et connaître les <strong>meilleurs outils gratuits</strong> recommandés par l'équipe enseignante.
        </p>
      </div>

      {/* Part A: Reorder the 3 golden steps */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            1. Remets dans l'ordre les 3 étapes d'or du Word Stress :
          </h3>
          {stepsSolved && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Validé !
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400">
          Clique sur les blocs dans l'ordre chronologique (de l'étape 1 à 3) :
        </p>

        {/* Selected boxes */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((num, i) => {
            const step = orderedSteps[i];
            return (
              <div
                key={num}
                className={`p-3 rounded-xl border text-center transition min-h-[70px] flex flex-col items-center justify-center ${
                  step
                    ? stepsSolved
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                      : 'bg-indigo-950/60 border-indigo-500 text-indigo-100'
                    : 'bg-slate-950/40 border-dashed border-slate-700 text-slate-500'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider mb-1">
                  Étape {num}
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
                  className={`w-full p-3 text-left rounded-xl text-xs font-medium transition border flex items-center justify-between ${
                    isSelected
                      ? 'opacity-40 bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-950/80 border-slate-700 hover:border-purple-500 active:scale-[0.99] text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span>{step.text}</span>
                  <span className="text-indigo-400 shrink-0 ml-2 font-bold">+</span>
                </button>
              );
            })}
          </div>
        )}

        {orderedSteps.length === 3 && !stepsSolved && (
          <p className="text-xs text-rose-400 font-medium text-center animate-shake">
            Oups ! L'ordre n'est pas le bon. On réessaie : Découper ➔ Repérer l'accent ➔ Observer les réductions.
          </p>
        )}
      </div>

      {/* Part B: The Recommended Tools */}
      {stepsSolved && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-purple-400" />
              2. Mission Outils : Comment entendre de vrais humains ?
            </h3>
            {toolAnswered && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Validé !
              </span>
            )}
          </div>

          <p className="text-xs text-indigo-200">
            Quel site génial (recommandé en slide 11 et 17) permet de taper n'importe quel mot anglais et de l'écouter prononcé dans des milliers de vidéos YouTube authentiques ?
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
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  selectedToolIdx === idx
                    ? tool.correct
                      ? 'bg-emerald-950/60 border-emerald-500 text-white'
                      : 'bg-rose-950/50 border-rose-500 text-rose-200'
                    : 'bg-slate-950/60 border-slate-800 hover:border-purple-500 text-slate-300'
                }`}
              >
                <div className="font-bold text-sm mb-1">{tool.name}</div>
                <div className="text-[11px] text-slate-400">{tool.desc}</div>
              </button>
            ))}
          </div>

          {/* Bonus tips from the slides */}
          <div className="p-3.5 bg-purple-950/30 border border-purple-500/30 rounded-2xl text-xs text-purple-200 space-y-1">
            <strong className="text-purple-300 block">Astuces physiques du cours pour t'entraîner :</strong>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
              <li>L'élastique (Rubber band) : Tends-le sur la voyelle longue accentuée !</li>
              <li>Ouvrir la main ou taper du pied sur la syllabe forte.</li>
              <li>Consulter <em>Longman (LDOCE)</em> ou <em>Merriam-Webster</em> pour voir l'apostrophe <strong>ˈ</strong> avant la syllabe accentuée.</li>
            </ul>
          </div>

          {toolAnswered && (
            <div className="pt-2">
              <button
                onClick={handleFinish}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 transform active:scale-95 transition"
              >
                <span>Débloquer le Chiffre n°2 du Coffre</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
