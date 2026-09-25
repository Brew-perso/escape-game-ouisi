import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Award, CheckCircle, Copy, RefreshCw, Sparkles, Scroll, Shield } from 'lucide-react';
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

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d97706', '#f59e0b', '#10b981', '#fbbf24', '#78350f'],
      });
    } else {
      sounds.playGentleError();
      alert(`La combinaison ne descellera pas le coffre. Vérifie tes 4 chiffres découverts lors des épreuves : ${course.vaultCode}`);
    }
  };

  const handleCopySummary = () => {
    const textToCopy = `📜 GUILDE OUI-SI LEA (Valence)
Initié : ${studentNameInput || 'Apprenti de la Guilde'}
Score : ${progress.score} pts
Quête : ${course.title}

🔑 LES SECRETS DU GRIMOIRE :
1. The Power of YET : L'incantation "pas encore" brise le découragement et forge les neurones.
2. Le Rituel en 3 Actes : Découper -> Repérer la syllabe forte -> Guetter le Schwa /ə/.
3. Les Archives : YouGlish (voix vivantes), Longman (LDOCE) et Merriam-Webster.`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Reliquary Card */}
      {!isUnlocked ? (
        <div className="parchment-card rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center space-y-6 border border-amber-600/40">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-950/70 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/50">
            <Lock className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <h2 className="text-2xl font-serif font-black text-amber-100">Le Reliquaire de Latour-Maubourg</h2>
            <p className="text-xs sm:text-sm text-stone-300 font-serif mt-2">
              Inscris la combinaison runique à 4 chiffres forgée au fil de ta quête pour desceller le Grimoire.
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
                className="w-14 h-16 sm:w-16 sm:h-20 text-3xl font-serif font-black text-center bg-stone-950 border-2 border-amber-600/60 rounded-2xl text-amber-300 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 shadow-inner"
              />
            ))}
          </div>

          {/* Unlocked digits helper */}
          <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800 text-xs text-stone-400 font-serif">
            Chiffres runiques récoltés :{' '}
            <strong className="text-amber-400 font-mono text-sm tracking-widest">
              {progress.unlockedDigits.length > 0 ? progress.unlockedDigits.join(' • ') : 'Aucun'}
            </strong>
          </div>

          <button
            onClick={handleUnlockAttempt}
            className="w-full py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-stone-950 font-serif font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition"
          >
            <Unlock className="w-5 h-5 text-stone-950" />
            <span>Desceller le Reliquaire Mystique !</span>
          </button>
        </div>
      ) : (
        /* VICTORY & SCROLL CERTIFICATE */
        <div className="parchment-card rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6 animate-fade-in text-center border border-amber-500/50">
          {/* Wax Seal Stamp */}
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full wax-seal p-1 shadow-2xl mx-auto flex items-center justify-center border-2 border-red-400/30">
              <Award className="w-12 h-12 text-amber-200" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-stone-950 rounded-full p-1 shadow">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[11px] font-serif font-bold uppercase tracking-wider mb-2">
              <CheckCircle className="w-3.5 h-3.5" /> Quête Accomplie avec Bravoure
            </div>
            <h2 className="text-2xl font-serif font-black text-amber-100">Félicitations, Initié de la Guilde !</h2>
            <p className="text-xs text-stone-300 font-serif mt-1">
              Tu as déjoué les pièges du rythme et percé les arcanes du Power of YET.
            </p>
          </div>

          {/* Student Profile Card */}
          <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 text-left space-y-3 font-serif">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-400">Ton Nom / Surnom d'Initié :</label>
              <input
                type="text"
                placeholder="Ex: Camille"
                value={studentNameInput}
                onChange={(e) => {
                  setStudentNameInput(e.target.value);
                  onUpdateName(e.target.value);
                }}
                className="px-3 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs font-bold text-amber-300 text-right focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800 text-center">
              <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Honneur & Points</span>
                <span className="text-xl font-bold text-amber-400 font-mono">
                  {progress.score} pts
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Rang de la Guilde</span>
                <span className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1 mt-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Maître du YET
                </span>
              </div>
            </div>
          </div>

          {/* Grimoire Takeaways */}
          <div className="p-4 bg-stone-950/80 rounded-2xl border border-amber-600/30 text-left space-y-2 font-serif">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Scroll className="w-4 h-4 text-amber-400" />
              Parchemin de Sagesse à conserver :
            </h4>
            <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong>The Power of YET :</strong> Dire <em>"I cannot speak English fluently... YET!"</em> transmute l'obstacle en progression.
              </li>
              <li>
                <strong>Le Word Stress :</strong> Fais sonner la syllabe maîtresse (plus haute, plus longue, plus sonore) et relâche les autres en Schwa /ə/.
              </li>
              <li>
                <strong>Le piège du suffixe -EE :</strong> <em>em-ploy-EE</em> attire l'accent sur sa terminaison, à l'inverse de <em>em-PLOY-er</em>.
              </li>
              <li>
                <strong>Les Oracles secrets :</strong> <em>YouGlish</em> pour voir des vidéos authentiques, <em>LDOCE / Merriam-Webster</em> pour guetter la marque d'accent.
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2 font-serif">
            <button
              onClick={handleCopySummary}
              className="w-full py-3 bg-amber-700 hover:bg-amber-600 active:scale-95 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Parchemin recopié !' : 'Copier le parchemin pour les Maîtres'}</span>
            </button>

            <button
              onClick={onRestart}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-stone-400 hover:text-amber-200 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rejouer la quête depuis l'aube</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
