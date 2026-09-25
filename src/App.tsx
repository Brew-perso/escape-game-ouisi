import React, { useState, useEffect } from 'react';
import { COURSES } from './data/courses';
import type { CourseSession, GameProgress } from './types';
import { Navbar } from './components/Navbar';
import { Stage1Yet } from './components/stages/Stage1Yet';
import { Stage2Tools } from './components/stages/Stage2Tools';
import { Stage3Rhythm } from './components/stages/Stage3Rhythm';
import { Stage4Voice } from './components/stages/Stage4Voice';
import { Stage5Vault } from './components/stages/Stage5Vault';
import { TeacherGuideModal } from './components/TeacherGuideModal';
import { CourseSelectorModal } from './components/CourseSelectorModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { InstallPrompt } from './components/InstallPrompt';
import { sounds } from './utils/audio';
import { Play, MapPin, KeyRound } from 'lucide-react';

const STORAGE_KEY = 'ouisi_quest_progress_v1';

export const App: React.FC = () => {
  const [course, setCourse] = useState<CourseSession>(COURSES[0]);
  const [showIntro, setShowIntro] = useState(true);
  const [isTeacherGuideOpen, setIsTeacherGuideOpen] = useState(false);
  const [isCourseSelectorOpen, setIsCourseSelectorOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Initialize progress from localStorage or default
  const [progress, setProgress] = useState<GameProgress>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (err) {
        console.warn('Could not read saved progress:', err);
      }
    }
    return {
      sessionId: COURSES[0].id,
      studentName: '',
      currentStage: 1,
      stagesCompleted: [],
      score: 0,
      unlockedDigits: [],
      startTime: Date.now(),
      hintsUsed: 0,
    };
  });

  // Save progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (err) {
      console.warn('Could not save progress:', err);
    }
  }, [progress]);

  const handleStartMission = () => {
    sounds.playSuccess();
    setShowIntro(false);
  };

  const handleStageComplete = (digit: string, points: number) => {
    sounds.playVaultUnlock();
    setProgress((prev) => {
      const nextStageNum = Math.min(prev.currentStage + 1, 5);
      const updatedDigits = prev.unlockedDigits.includes(digit)
        ? prev.unlockedDigits
        : [...prev.unlockedDigits, digit];
      const updatedStages = prev.stagesCompleted.includes(prev.currentStage)
        ? prev.stagesCompleted
        : [...prev.stagesCompleted, prev.currentStage];

      return {
        ...prev,
        score: prev.score + points,
        currentStage: nextStageNum,
        stagesCompleted: updatedStages,
        unlockedDigits: updatedDigits,
      };
    });
  };

  const handleSelectStage = (stageNum: number) => {
    setProgress((prev) => ({
      ...prev,
      currentStage: stageNum,
    }));
  };

  const handleUpdateStudentName = (name: string) => {
    setProgress((prev) => ({
      ...prev,
      studentName: name,
    }));
  };

  const handleRestartMission = () => {
    sounds.playClick();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Could not clear progress:', err);
    }
    setProgress({
      sessionId: course.id,
      studentName: progress.studentName,
      currentStage: 1,
      stagesCompleted: [],
      score: 0,
      unlockedDigits: [],
      startTime: Date.now(),
      hintsUsed: 0,
    });
    setShowIntro(true);
  };

  const handleResetGame = () => {
    sounds.playClick();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Could not clear progress:', err);
    }
    setProgress({
      sessionId: course.id,
      studentName: progress.studentName,
      currentStage: 1,
      stagesCompleted: [],
      score: 0,
      unlockedDigits: [],
      startTime: Date.now(),
      hintsUsed: 0,
    });
    setShowIntro(false); // start immediately on Stage 1
  };

  const handleSelectCourse = (newCourse: CourseSession) => {
    setCourse(newCourse);
    setProgress({
      sessionId: newCourse.id,
      studentName: progress.studentName,
      currentStage: 1,
      stagesCompleted: [],
      score: 0,
      unlockedDigits: [],
      startTime: Date.now(),
      hintsUsed: 0,
    });
    setShowIntro(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Bar */}
      <Navbar
        course={course}
        progress={progress}
        onOpenCourseSelector={() => setIsCourseSelectorOpen(true)}
        onOpenTeacherGuide={() => setIsTeacherGuideOpen(true)}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        onSelectStage={handleSelectStage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {showIntro ? (
          /* Mission Briefing Welcome Screen */
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in text-center">
            {/* Header badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Latour-Maubourg • Valence</span>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Escape Game <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Oui-Si LEA</span>
              </h1>
              <p className="text-sm font-medium text-indigo-200">
                {course.title}
              </p>
            </div>

            {/* Scenario Card */}
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl text-left space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                <KeyRound className="w-4 h-4 text-purple-400" />
                <span>Rapport de Mission : Alerte à Valence</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {course.storyIntro}
              </p>

              {/* What will be tested / reactivated */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tes 4 défis pour ouvrir le coffre :
                </span>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">1</span>
                    <span><strong>The Power of YET :</strong> Neutralise les doutes et active le bouclier mental.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600/40 border border-purple-400/40 flex items-center justify-center text-[10px] font-bold text-purple-300 shrink-0">2</span>
                    <span><strong>L'Arsenal du Détective :</strong> Les 3 étapes d'or et les dictionnaires YouTube.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-600/40 border border-cyan-400/40 flex items-center justify-center text-[10px] font-bold text-cyan-300 shrink-0">3</span>
                    <span><strong>Le Radar Rythmique :</strong> Tends l'élastique sur la bonne syllabe accentuée.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-600/40 border border-rose-400/40 flex items-center justify-center text-[10px] font-bold text-rose-300 shrink-0">4</span>
                    <span><strong>L'Épreuve du Micro :</strong> Parle distinctement et brise le silence !</span>
                  </li>
                </ul>
              </div>

              {/* Motivational message */}
              <div className="text-[11px] text-slate-400 italic bg-indigo-950/30 p-3 rounded-xl border border-indigo-500/20">
                💬 <em>"Mistakes are not signs of failure; they are signs that you are trying and learning."</em> (Slide 7)
              </div>
            </div>

            {/* Launch button */}
            <div className="pt-2">
              <button
                onClick={handleStartMission}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-extrabold text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Commencer la Mission !</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Stage Content */
          <div>
            {progress.currentStage === 1 && (
              <Stage1Yet
                course={course}
                onComplete={(digit, points) => handleStageComplete(digit, points)}
              />
            )}
            {progress.currentStage === 2 && (
              <Stage2Tools
                course={course}
                onComplete={(digit, points) => handleStageComplete(digit, points)}
              />
            )}
            {progress.currentStage === 3 && (
              <Stage3Rhythm
                course={course}
                onComplete={(digit, points) => handleStageComplete(digit, points)}
              />
            )}
            {progress.currentStage === 4 && (
              <Stage4Voice
                course={course}
                onComplete={(digit, points) => handleStageComplete(digit, points)}
              />
            )}
            {progress.currentStage === 5 && (
              <Stage5Vault
                course={course}
                progress={progress}
                onUpdateName={handleUpdateStudentName}
                onRestart={handleRestartMission}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-4 text-center text-xs text-slate-500 space-y-1">
        <p>
          Dispositif <strong className="text-slate-400">Oui-Si LEA Valence</strong> • Université Grenoble Alpes
        </p>
        <p className="text-[11px] text-slate-600">
          Équipe enseignante : Gaël Diraison, Isabelle Darcy, Eric Tchelekian • PWA prête pour Vercel
        </p>
      </footer>

      {/* Modals & PWA Install Banner */}
      <TeacherGuideModal
        isOpen={isTeacherGuideOpen}
        onClose={() => setIsTeacherGuideOpen(false)}
      />

      <CourseSelectorModal
        isOpen={isCourseSelectorOpen}
        onClose={() => setIsCourseSelectorOpen(false)}
        currentCourseId={course.id}
        onSelectCourse={handleSelectCourse}
      />

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetGame}
      />

      <InstallPrompt />
    </div>
  );
};

export default App;
