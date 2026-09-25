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
    <div className="min-h-screen bg-stone-950 text-stone-200 flex flex-col justify-between selection:bg-amber-600 selection:text-stone-950 font-serif">
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
          /* Mission Briefing Welcome Screen - Medieval Fantasy Grimoire */
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in text-center font-serif">
            {/* Header badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Latour-Maubourg • Valence</span>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-amber-100">
                La Quête du <span className="text-amber-400 gold-glow">Grimoire Oui-Si</span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 font-serif">
                {course.title}
              </p>
            </div>

            {/* Scenario Card */}
            <div className="parchment-card rounded-3xl p-6 sm:p-7 shadow-2xl text-left space-y-4 relative overflow-hidden border border-amber-600/40">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 font-serif">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Chronique de la Guilde LEA</span>
              </div>

              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif">
                {course.storyIntro}
              </p>

              {/* What will be tested / reactivated */}
              <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-2.5 font-serif">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  Les 4 Sceaux à desceller pour ouvrir le Reliquaire :
                </span>
                <ul className="text-xs text-stone-300 space-y-2">
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-500/50 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0">I</span>
                    <span><strong>Le Sceau du YET :</strong> Dissipe le découragement et forge les neurones.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-500/50 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0">II</span>
                    <span><strong>Les Parchemins de l'Erudit :</strong> Le rituel en 3 actes et les oracles audio.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-500/50 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0">III</span>
                    <span><strong>L'Écho Rythmique :</strong> Tends la corde d'arc sur la syllabe maîtresse.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-500/50 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0">IV</span>
                    <span><strong>L'Épreuve du Verbe :</strong> Fais résonner ta voix dans la chambre d'écho !</span>
                  </li>
                </ul>
              </div>

              {/* Motivational message */}
              <div className="text-[11px] text-stone-400 italic bg-stone-950/60 p-3 rounded-xl border border-stone-800 font-serif">
                💬 <em>"Mistakes are not signs of failure; they are signs that you are trying and learning."</em> (Enseignement des Maîtres)
              </div>
            </div>

            {/* Launch button */}
            <div className="pt-2">
              <button
                onClick={handleStartMission}
                className="w-full py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-stone-950 font-serif font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 transition"
              >
                <Play className="w-5 h-5 fill-stone-950" />
                <span>Entrer dans la Quête !</span>
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
      <footer className="border-t border-stone-900 bg-stone-950/95 py-4 px-4 text-center text-xs text-stone-500 space-y-1 font-serif">
        <p>
          Guilde <strong className="text-amber-300">Oui-Si LEA Valence</strong> • Université Grenoble Alpes
        </p>
        <p className="text-[11px] text-stone-600">
          Maîtres enseignants : Gaël Diraison, Isabelle Darcy, Eric Tchelekian • PWA Vercel
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
