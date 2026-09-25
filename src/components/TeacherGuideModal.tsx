import React from 'react';
import { X, GraduationCap, Clock, Sparkles, Code2, Globe } from 'lucide-react';

interface TeacherGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherGuideModal: React.FC<TeacherGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Guide Enseignant : Oui-Si Quest</h3>
              <p className="text-[11px] text-indigo-300">Animation pédagogique de fin de cours (10 à 15 min)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
          {/* Section 1: Déroulement en classe */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              1. En fin de cours (10-15 minutes)
            </h4>
            <p className="text-slate-300">
              Projette le QR code de l'application Vercel sur le vidéoprojecteur. Les étudiants scannent avec leur smartphone.
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-0.5">
              <li><strong>Travail en binôme ou solo :</strong> Stimule l'entraide et dédramatise la prise de parole.</li>
              <li><strong>Sans casque requis :</strong> Les sons Web Audio et le Text-to-Speech fonctionnent sur le haut-parleur du téléphone ou en mode silencieux avec validation manuelle.</li>
            </ul>
          </div>

          {/* Section 2: Pédagogie Oui-Si & Valence */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              2. Bienveillance & Démystification
            </h4>
            <p className="text-slate-300">
              Les étudiants de L1 LEA Valence en Oui-Si manquent souvent de confiance en anglais. L'application valorise chaque tentative :
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-0.5">
              <li>Les erreurs ne pénalisent pas le score, elles encouragent à réessayer (Growth Mindset).</li>
              <li>Deux niveaux d'indices progressifs sont toujours disponibles.</li>
              <li>Le mot magique <em>"YET"</em> sert de réflexe anti-abandon.</li>
            </ul>
          </div>

          {/* Section 3: Comment créer un nouveau cours ? */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-purple-400" />
              3. Ajouter un cours pour la séance suivante
            </h4>
            <p className="text-slate-300">
              L'architecture est 100% modulaire dans <code className="bg-slate-800 px-1 py-0.5 rounded text-purple-200">src/data/courses.ts</code> :
            </p>
            <p className="text-slate-400">
              Il suffit d'ajouter un nouvel objet dans le tableau <code className="bg-slate-800 px-1 py-0.5 rounded text-purple-200">COURSES</code> avec les nouveaux mots de vocabulaire, phrases ou questions de grammaire.
            </p>
          </div>

          {/* Section 4: PWA & Vercel */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              4. Déploiement Vercel & PWA
            </h4>
            <p className="text-slate-300">
              Le projet se déploie en 1 clic sur Vercel avec <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-200">vercel deploy</code> ou en liant ton repo GitHub. L'app fonctionne hors ligne grâce au Service Worker PWA.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition"
        >
          Fermer le guide
        </button>
      </div>
    </div>
  );
};
