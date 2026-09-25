import React from 'react';
import { X, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { COURSES } from '../data/courses';
import type { CourseSession } from '../types';

interface CourseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCourseId: string;
  onSelectCourse: (course: CourseSession) => void;
}

export const CourseSelectorModal: React.FC<CourseSelectorModalProps> = ({
  isOpen,
  onClose,
  currentCourseId,
  onSelectCourse,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-serif">
      <div className="parchment-card border border-amber-600/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-stone-200 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-100 text-base">
                Archives des Quêtes &amp; Chapitres
              </h3>
              <p className="text-[11px] text-amber-300/80">
                Choisis la thématique de la Guilde à explorer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-xl bg-stone-900 border border-stone-800 transition"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Course List */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {COURSES.map((course) => {
            const isSelected = course.id === currentCourseId;
            const isAvailable = course.rhythmWords.length > 0;

            return (
              <button
                key={course.id}
                disabled={!isAvailable}
                onClick={() => {
                  onSelectCourse(course);
                  onClose();
                }}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-start justify-between font-serif ${
                  isSelected
                    ? 'bg-amber-950/70 border-amber-400 text-amber-100 shadow-lg ring-1 ring-amber-400/30'
                    : isAvailable
                    ? 'bg-stone-950/80 border-stone-800 hover:border-amber-500/60 text-stone-200'
                    : 'bg-stone-950/30 border-stone-900 opacity-60 cursor-not-allowed text-stone-600'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-900 border border-stone-750 text-amber-300">
                      {course.date}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Chapitre Actif
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-stone-100">{course.title}</h4>
                  <p className="text-xs text-stone-400">{course.subtitle}</p>
                </div>

                {!isAvailable && (
                  <span className="text-[10px] font-semibold text-amber-400/80 bg-amber-950/40 px-2 py-1 rounded-md border border-amber-500/20 shrink-0 ml-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Bientôt forgié
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-center text-stone-500 pt-2 font-serif">
          De nouveaux chapitres peuvent être rédigés dans <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300/80">src/data/courses.ts</code>.
        </p>
      </div>
    </div>
  );
};
