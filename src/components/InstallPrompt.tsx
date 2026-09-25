import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X, Shield, Sparkles } from 'lucide-react';

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
      {/* Floating Medieval Installation Banner */}
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto parchment-card border border-amber-500/50 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl flex items-center justify-between text-stone-200 animate-fade-in font-serif">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center shrink-0 shadow-inner text-amber-400">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
              <span>Graver le Grimoire Oui-Si</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </p>
            <p className="text-[11px] text-stone-300">
              Plein écran &amp; accès hors-ligne pour la séance !
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-stone-950 rounded-xl shadow-md transition font-serif"
          >
            Installer
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 font-serif">
          <div className="parchment-card border border-amber-600/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Download className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-amber-100">
              Graver le Grimoire sur iPhone / iPad
            </h3>

            <div className="text-xs text-stone-300 text-left space-y-2.5 bg-stone-950/80 p-4 rounded-2xl border border-stone-800">
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-500/50 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0">1</span>
                <span>Appuie sur le bouton <Share2 className="w-3.5 h-3.5 text-amber-400 inline mx-1" /> <strong>Partager</strong> en bas de Safari.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-500/50 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0">2</span>
                <span>Fais défiler et touche <PlusSquare className="w-3.5 h-3.5 text-amber-400 inline mx-1" /> <strong>Sur l'écran d'accueil</strong>.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-500/50 flex items-center justify-center text-[10px] font-bold text-amber-300 shrink-0">3</span>
                <span>Touche <strong>Ajouter</strong> en haut à droite !</span>
              </p>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 font-semibold text-xs rounded-xl transition"
            >
              Compris, fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
