import React from 'react';
import { Volume2, VolumeX, GraduationCap, Compass, Shield, RotateCcw, Mic } from 'lucide-react';
import type { CourseSession, GameProgress } from '../types';
import { sounds } from '../utils/audio';

interface NavbarProps {
  course: CourseSession;
  progress: GameProgress;
  onOpenCourseSelector: () => void;
  onOpenTeacherGuide: () => void;
  onOpenResetModal: () => void;
  onOpenMicDiagnostic: () => void;
  onSelectStage: (stage: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  course,
  progress,
  onOpenCourseSelector,
  onOpenTeacherGuide,
  onOpenResetModal,
  onOpenMicDiagnostic,
  onSelectStage,
}) => {
  const [soundActive, setSoundActive] = React.useState(sounds.isSoundEnabled());
  const [accent, setAccent] = React.useState<'en-GB' | 'en-US'>(sounds.getPreferredAccent());

  const toggleSound = () => {
    const next = !soundActive;
    sounds.setSoundEnabled(next);
    setSoundActive(next);
  };

  const stages = [
    { num: 1, label: 'Sceau 1 : YET' },
    { num: 2, label: 'Sceau 2 : Outils' },
    { num: 3, label: 'Sceau 3 : Rythme' },
    { num: 4, label: 'Sceau 4 : Verbe' },
    { num: 5, label: 'Reliquaire' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-amber-600/30 px-4 py-2.5 shadow-xl">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {/* Top line: Brand + Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md font-serif font-black text-sm">
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-serif">
                <span className="text-xs font-bold tracking-wider uppercase text-amber-200">
                  Guilde Oui-Si
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-serif border border-amber-500/30">
                  Valence
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-serif truncate max-w-[180px] sm:max-w-xs">
                {course.title}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Score pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{progress.score}</span>
            </div>

            {/* Change course */}
            <button
              onClick={onOpenCourseSelector}
              className="p-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500 text-stone-300 hover:text-white transition"
              title="Changer de quête"
            >
              <Compass className="w-4 h-4" />
            </button>

            {/* Accent toggle (UK / US) */}
            <button
              onClick={() => {
                const nextAccent = accent === 'en-GB' ? 'en-US' : 'en-GB';
                setAccent(nextAccent);
                sounds.setPreferredAccent(nextAccent);
                sounds.speakEnglish(nextAccent === 'en-GB' ? 'British English' : 'American English');
              }}
              className="px-2 py-1 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-400 text-xs font-serif font-bold text-amber-200 hover:text-white transition flex items-center gap-1 shadow-sm"
              title={`Changer l'accent anglais (actuellement ${accent === 'en-GB' ? 'British' : 'American'})`}
            >
              <span>{accent === 'en-GB' ? '🇬🇧 UK' : '🇺🇸 US'}</span>
            </button>

            {/* Reset / Restart game button */}
            <button
              onClick={onOpenResetModal}
              className="p-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-rose-500 text-stone-400 hover:text-rose-400 transition"
              title="Recommencer la quête à zéro"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Mic Diagnostic */}
            <button
              onClick={onOpenMicDiagnostic}
              className="p-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-400 text-amber-300 hover:text-white transition"
              title="Tester le microphone (Diagnostic)"
            >
              <Mic className="w-4 h-4 text-amber-400" />
            </button>

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500 text-stone-300 hover:text-white transition"
              title={soundActive ? 'Couper le son' : 'Activer le son'}
            >
              {soundActive ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            </button>

            {/* Teacher Guide modal */}
            <button
              onClick={onOpenTeacherGuide}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-stone-900 border border-amber-600/40 text-amber-200 hover:text-white text-xs font-serif font-semibold transition"
              title="Guide Enseignant"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Maîtres</span>
            </button>
          </div>
        </div>

        {/* Stage Progress Bar (1 to 5) */}
        <div className="flex items-center justify-between gap-1 pt-1 font-serif">
          {stages.map((st) => {
            const isCompleted = progress.stagesCompleted.includes(st.num);
            const isCurrent = progress.currentStage === st.num;
            const isAccessible = isCompleted || isCurrent || st.num === 1;

            return (
              <button
                key={st.num}
                disabled={!isAccessible}
                onClick={() => {
                  sounds.playClick();
                  onSelectStage(st.num);
                }}
                className={`flex-1 py-1 px-1 rounded-lg text-center transition flex flex-col items-center gap-0.5 ${
                  isCurrent
                    ? 'bg-amber-950/80 border border-amber-400 text-amber-200 shadow-sm'
                    : isCompleted
                    ? 'bg-stone-900/90 border border-emerald-500/50 text-emerald-300'
                    : 'bg-stone-950/40 border border-stone-850 text-stone-600 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`w-3.5 h-3.5 rounded-full text-[9px] font-bold flex items-center justify-center ${
                      isCurrent
                        ? 'bg-amber-500 text-stone-950'
                        : isCompleted
                        ? 'bg-emerald-500 text-stone-950'
                        : 'bg-stone-800 text-stone-600'
                    }`}
                  >
                    {isCompleted ? '✓' : st.num}
                  </span>
                  <span className="text-[10px] font-serif font-semibold hidden md:inline truncate">
                    {st.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
