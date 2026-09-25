import React from 'react';
import { RotateCcw, RefreshCw, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const handleForceUpdate = async () => {
    if (typeof window !== 'undefined' && (window as any).__forceClearPwaCache) {
      await (window as any).__forceClearPwaCache();
    } else {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-serif">
      <div className="parchment-card border border-rose-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-inner">
          <RotateCcw className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-amber-100">Recommencer la Quête ?</h3>
          <p className="text-xs text-stone-300 leading-relaxed font-serif">
            Tu vas réinitialiser ta progression, tes sceaux et tes points pour refaire toutes les épreuves depuis le début.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 font-semibold text-xs rounded-xl transition"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            Oui, réinitialiser
          </button>
        </div>

        {/* Force cache update button */}
        <div className="pt-3 border-t border-stone-800">
          <button
            type="button"
            onClick={handleForceUpdate}
            className="w-full py-2 px-3 bg-stone-950 hover:bg-stone-900 border border-amber-600/40 text-amber-300 hover:text-amber-200 text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Vider le cache & recharger la dernière version</span>
          </button>
        </div>
      </div>
    </div>
  );
};
