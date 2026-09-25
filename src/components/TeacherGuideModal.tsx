import React from 'react';
import { X, GraduationCap, Clock, Sparkles, Scroll, Shield } from 'lucide-react';

interface TeacherGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherGuideModal: React.FC<TeacherGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-serif">
      <div className="parchment-card border border-amber-600/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-stone-200 my-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/90 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-100 text-base">
                Le Grimoire des Maîtres Enseignants
              </h3>
              <p className="text-[11px] text-amber-300/90">
                Protocole pédagogique de fin de séance (10 à 15 min)
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

        {/* Scrollable Content */}
        <div className="space-y-3.5 text-xs leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
          {/* Section 1: Déroulement */}
          <div className="p-3.5 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-1.5 shadow-inner">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Clock className="w-4 h-4 text-amber-400" />
              1. Rituel de fin de cours (10-15 minutes)
            </h4>
            <p className="text-stone-300">
              Projette le QR code de l'application Vercel sur le vidéoprojecteur du cours. Les étudiants scannent simplement avec leur smartphone (Android ou iPhone).
            </p>
            <ul className="list-disc list-inside text-stone-400 space-y-1 pl-1">
              <li><strong>Travail en binôme ou solo :</strong> Stimule l'entraide et dédramatise la prise de parole orale en anglais.</li>
              <li><strong>Sans casque requis :</strong> Les synthèses vocales natives (UK/US) et la capture microphone fonctionnent directement sur le haut-parleur. En cas de salle bruyante, le bouton de validation manuelle immédiat évite tout blocage.</li>
            </ul>
          </div>

          {/* Section 2: Pédagogie Oui-Si & Valence */}
          <div className="p-3.5 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-1.5 shadow-inner">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              2. Bienveillance & Démystification (Oui-Si Valence)
            </h4>
            <p className="text-stone-300">
              Les étudiants de L1 LEA Valence en accompagnement Oui-Si ont souvent un sentiment d'insécurité linguistique. L'escape game est conçu selon le <em>Growth Mindset</em> :
            </p>
            <ul className="list-disc list-inside text-stone-400 space-y-1 pl-1">
              <li><strong>L'échec n'est pas puni :</strong> Aucune pénalité de points, chaque tentative rapproche du succès.</li>
              <li><strong>L'incantation sacrée « YET » :</strong> Utilisée au Sceau 1 pour transformer « I don't get it » en « I don't get it YET ! ».</li>
              <li><strong>Le geste physique de l'élastique :</strong> Retranscrit au Sceau 3 pour faire ressentir la longueur et l'énergie de la syllabe accentuée.</li>
            </ul>
          </div>

          {/* Section 3: Modulaire */}
          <div className="p-3.5 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-1.5 shadow-inner">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Scroll className="w-4 h-4 text-amber-400" />
              3. Forger de nouvelles quêtes pour les cours suivants
            </h4>
            <p className="text-stone-300">
              L'application est totalement modulaire dans <code className="bg-stone-900 border border-stone-700 px-1.5 py-0.5 rounded text-amber-200">src/data/courses.ts</code> :
            </p>
            <p className="text-stone-400">
              Il suffit d'ajouter un nouvel objet séance avec les nouveaux mots du cours (ex: <em>Connected Speech</em>, <em>Weak Forms</em>, etc.), les questions et le code à 4 chiffres du coffre.
            </p>
          </div>

          {/* Section 4: PWA */}
          <div className="p-3.5 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-1.5 shadow-inner">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <Shield className="w-4 h-4 text-amber-400" />
              4. PWA Hors-Ligne & Déploiement Vercel
            </h4>
            <p className="text-stone-300">
              L'application est une PWA installable en 1 tap. Le Service Worker en mode <em>Network-First</em> garantit le fonctionnement hors-ligne même si la connexion du campus est instable.
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-serif font-black rounded-xl text-xs uppercase tracking-widest shadow-xl transition active:scale-95"
        >
          Sceller le Guide et Retourner à la Quête
        </button>
      </div>
    </div>
  );
};
