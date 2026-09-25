import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Award, CheckCircle, Copy, RefreshCw, Sparkles, BookOpen, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CourseSession, GameProgress } from '../../types';
import { sounds } from '../../utils/audio';

interface Stage5Props {
  course: CourseSession;
  progress: GameProgress;
  onUpdateName: (name: string) => void;
  onRestart: () => void;
}

export const Stage5Vault: React.FC<Stage5Props> = ({ course, progress, onUpdateName, onRestart }) => {
  const [enteredCode, setEnteredCode] = useState<string[]>(['', '', '', '']);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [studentNameInput, setStudentNameInput] = useState(progress.studentName || '');
  const [copied, setCopied] = useState(false);

  // Pre-fill with unlocked digits
  useEffect(() => {
    if (progress.unlockedDigits.length >= 4) {
      setEnteredCode([...progress.unlockedDigits]);
    }
  }, [progress.unlockedDigits]);

  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const newCode = [...enteredCode];
    newCode[index] = cleaned;
    setEnteredCode(newCode);

    sounds.playClick();

    // Auto advance input if next input exists
    if (cleaned && index < 3) {
      const nextInput = document.getElementById(`vault-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleUnlockAttempt = () => {
    const codeStr = enteredCode.join('');
    if (codeStr === course.vaultCode) {
      sounds.playVaultUnlock();
      setIsUnlocked(true);

      // Trigger multi-color celebratory confetti!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    } else {
      sounds.playGentleError();
      alert(`Le code n'est pas correct. As-tu bien noté les 4 chiffres débloqués lors des épreuves ? Indice : ${course.vaultCode}`);
    }
  };

  const handleCopySummary = () => {
    const textToCopy = `🎓 ESCAPE GAME OUI-SI LEA (Valence)
Agent : ${studentNameInput || 'Étudiant Oui-Si'}
Score : ${progress.score} pts
Mission : ${course.title}

🔑 MES CLÉS DU COURS :
1. The Power of YET : Dire "pas encore" pour muscler le cerveau face aux difficultés.
2. Word Stress en 3 étapes : Découper -> Repérer la syllabe accentuée (plus forte & plus longue) -> Noter les réductions (schwa /ə/).
3. Outils secrets : YouGlish (vidéos réelles), Merriam-Webster & Longman (LDOCE).`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Vault Card */}
      {!isUnlocked ? (
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
            <Lock className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Le Coffre de Latour-Maubourg</h2>
            <p className="text-sm text-slate-300 mt-2">
              Saisis la combinaison à 4 chiffres récupérée au fil des épreuves pour ouvrir la mallette !
            </p>
          </div>

          {/* 4 Digit inputs */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((idx) => (
              <input
                key={idx}
                id={`vault-digit-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={enteredCode[idx]}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                className="w-14 h-16 sm:w-16 sm:h-20 text-3xl font-black text-center bg-slate-950 border-2 border-amber-500/50 rounded-2xl text-amber-300 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 shadow-inner"
              />
            ))}
          </div>

          {/* Helper showing unlocked digits from progress */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
            Chiffres collectés pendant ton parcours :{' '}
            <strong className="text-amber-400 font-mono text-sm tracking-widest">
              {progress.unlockedDigits.length > 0 ? progress.unlockedDigits.join(' - ') : 'Aucun'}
            </strong>
          </div>

          <button
            onClick={handleUnlockAttempt}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition"
          >
            <Unlock className="w-5 h-5 text-slate-950" />
            <span>Ouvrir la Mallette Secrète !</span>
          </button>
        </div>
      ) : (
        /* VICTORY & DIPLOMA CARD */
        <div className="bg-slate-900/90 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 animate-fade-in text-center">
          {/* Badge Icon */}
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/30 mx-auto flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <Award className="w-12 h-12 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 rounded-full p-1 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle className="w-3.5 h-3.5" /> Mission Accomplie
            </div>
            <h2 className="text-2xl font-black text-white">Félicitations, Agent LEA !</h2>
            <p className="text-xs text-slate-300 mt-1">
              Tu as surmonté les épreuves et débloqué le secret du rythme anglais et du Power of YET !
            </p>
          </div>

          {/* Student Profile & Badge Details */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-left space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400">Ton Prénom / Pseudo :</label>
              <input
                type="text"
                placeholder="Ex: Camille"
                value={studentNameInput}
                onChange={(e) => {
                  setStudentNameInput(e.target.value);
                  onUpdateName(e.target.value);
                }}
                className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-emerald-300 text-right focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Score Final</span>
                <span className="text-xl font-extrabold text-amber-400 font-mono">
                  {progress.score} pts
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Rang Obtenu</span>
                <span className="text-xs font-bold text-indigo-300 flex items-center justify-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Master of YET
                </span>
              </div>
            </div>
          </div>

          {/* Pedagogical Cheat Sheet to Take Away */}
          <div className="p-4 bg-gradient-to-b from-indigo-950/40 to-purple-950/30 rounded-2xl border border-indigo-500/30 text-left space-y-2">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Ce que tu retiens pour la semaine prochaine :
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong>The Power of YET :</strong> Dire <em>"I cannot speak English fluently... YET!"</em> transforme l'obstacle en opportunité.
              </li>
              <li>
                <strong>L'accent tonique (Word Stress) :</strong> Fais vibrer la syllabe forte (plus haute, plus longue, plus forte) et relâche les autres avec le Schwa /ə/ !
              </li>
              <li>
                <strong>Le piège du suffixe -EE :</strong> <em>em-ploy-EE</em> prend l'accent sur la fin, contrairement à <em>em-PLOY-er</em>.
              </li>
              <li>
                <strong>Outils secrets :</strong> <em>YouGlish</em> pour voir des vidéos réelles, <em>LDOCE / Merriam-Webster</em> pour vérifier l'accent.
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleCopySummary}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié dans le presse-papier !' : 'Copier ma fiche bilan pour le prof'}</span>
            </button>

            <button
              onClick={onRestart}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rejouer l'escape game</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
