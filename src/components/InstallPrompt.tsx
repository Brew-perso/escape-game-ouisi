import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if running as PWA standalone
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (isStandalone || dismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-gradient-to-r from-indigo-900/90 to-purple-900/90 border border-indigo-400/40 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl flex items-center justify-between text-white animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-md">
            <Download className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-200">Installer Oui-Si Quest</p>
            <p className="text-[11px] text-slate-300">Jouer en plein écran comme une vraie application !</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 rounded-lg shadow transition"
          >
            Installer
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <Download className="w-5 h-5 text-indigo-400" />
              Installer sur iPhone / iPad
            </h3>
            <div className="text-sm text-slate-300 text-left space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <p className="flex items-center gap-2">
                1. Appuie sur le bouton <Share2 className="w-4 h-4 text-indigo-400 inline" /> <strong>Partager</strong> en bas de Safari.
              </p>
              <p className="flex items-center gap-2">
                2. Fais défiler et sélectionne <PlusSquare className="w-4 h-4 text-indigo-400 inline" /> <strong>Sur l'écran d'accueil</strong>.
              </p>
              <p>3. Clique sur <strong>Ajouter</strong> en haut à droite !</p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition"
            >
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
};
