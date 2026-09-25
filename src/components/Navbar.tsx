import React from 'react';
import { Volume2, VolumeX, GraduationCap, Compass, Trophy, MapPin } from 'lucide-react';
import type { CourseSession, GameProgress } from '../types';
import { sounds } from '../utils/audio';

interface NavbarProps {
  course: CourseSession;
  progress: GameProgress;
  onOpenCourseSelector: () => void;
  onOpenTeacherGuide: () => void;
  onSelectStage: (stage: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  course,
  progress,
  onOpenCourseSelector,
  onOpenTeacherGuide,
  onSelectStage,
}) => {
  const [soundActive, setSoundActive] = React.useState(sounds.isSoundEnabled());

  const toggleSound = () => {
    const next = !soundActive;
    sounds.setSoundEnabled(next);
    setSoundActive(next);
  };

  const stages = [
    { num: 1, label: 'Mindset & YET' },
    { num: 2, label: 'Outils' },
    { num: 3, label: 'Rythme & Stress' },
    { num: 4, label: 'Micro' },
    { num: 5, label: 'Coffre' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-indigo-500/20 px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {/* Top line: Brand + Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md font-black text-sm">
              LEA
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-300">
                  Oui-Si Quest
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" /> Valence
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-xs font-medium">
                {course.title}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Score pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{progress.score}</span>
            </div>

            {/* Change course */}
            <button
              onClick={onOpenCourseSelector}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white transition"
              title="Changer de cours"
            >
              <Compass className="w-4 h-4" />
            </button>

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white transition"
              title={soundActive ? 'Couper le son' : 'Activer le son'}
            >
              {soundActive ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Teacher Guide modal */}
            <button
              onClick={onOpenTeacherGuide}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 hover:text-white hover:bg-indigo-900/60 text-xs font-semibold transition"
              title="Guide Enseignant"
            >
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Guide Prof</span>
            </button>
          </div>
        </div>

        {/* Stage Progress Bar (1 to 5) */}
        <div className="flex items-center justify-between gap-1 pt-1">
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
                    ? 'bg-indigo-600/30 border border-indigo-400 text-indigo-200 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900/40 border border-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`w-3.5 h-3.5 rounded-full text-[9px] font-bold flex items-center justify-center ${
                      isCurrent
                        ? 'bg-indigo-500 text-white'
                        : isCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? '✓' : st.num}
                  </span>
                  <span className="text-[10px] font-semibold hidden md:inline truncate">
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
