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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Sélectionner une Séance</h3>
              <p className="text-[11px] text-purple-300">Choisis la thématique de cours à réactiver</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
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
                className={`w-full p-4 rounded-2xl border text-left transition flex items-start justify-between ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg'
                    : isAvailable
                    ? 'bg-slate-950/70 border-slate-800 hover:border-indigo-500/60 text-slate-300'
                    : 'bg-slate-950/30 border-slate-900 opacity-60 cursor-not-allowed text-slate-500'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {course.date}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> En cours
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white">{course.title}</h4>
                  <p className="text-xs text-slate-400">{course.subtitle}</p>
                </div>

                {!isAvailable && (
                  <span className="text-[10px] font-semibold text-amber-400/80 bg-amber-950/40 px-2 py-1 rounded-md border border-amber-500/20 shrink-0 ml-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Bientôt
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-center text-slate-500 pt-2">
          De nouvelles missions peuvent être ajoutées au fil du semestre dans <code>src/data/courses.ts</code>.
        </p>
      </div>
    </div>
  );
};
