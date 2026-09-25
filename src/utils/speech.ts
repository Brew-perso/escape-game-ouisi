// Speech recognition and fuzzy phonetic comparison

// Types for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string; message?: string }) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// Request permission beforehand on Android to avoid silent aborts
export async function requestMicPermission(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return true;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Immediately stop tracks so the hardware mic is released for SpeechRecognition
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch (err) {
    console.warn('Microphone permission rejected or unavailable:', err);
    return false;
  }
}

export function createSpeechRecognizer(
  onTranscript: (text: string) => void,
  onError: (userFriendlyError: string, rawError: string) => void,
  onEnd: () => void,
  lang: string = 'en-US'
): { start: () => void; stop: () => void } | null {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) return null;

  try {
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;
    recognition.lang = lang;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }

        // Also check alternative interpretations from Google Speech Recognizer
        for (let a = 0; a < item.length; a++) {
          const altText = item[a].transcript;
          if (cleanSpokenText(altText).includes('yet')) {
            onTranscript(altText);
            return;
          }
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      } else if (interimTranscript) {
        onTranscript(interimTranscript.trim());
      }
    };

    recognition.onerror = (e: { error: string; message?: string }) => {
      const code = e.error || 'unknown';
      let message = "Erreur microphone : réessaie en parlant plus fort !";

      if (code === 'not-allowed') {
        message = "Micro bloqué : clique sur le cadenas en haut à gauche de l'URL pour autoriser le micro.";
      } else if (code === 'no-speech') {
        message = "Aucun son capté : parle plus fort et rapproche ton micro !";
      } else if (code === 'audio-capture') {
        message = "Microphone indisponible (vérifie qu'aucune autre application ne l'utilise).";
      } else if (code === 'network') {
        message = "Connexion internet instable pour la voix. Utilise le bouton 'Valider' !";
      }

      onError(message, code);
    };

    recognition.onend = () => {
      onEnd();
    };

    return {
      start: () => {
        try {
          recognition.abort(); // clear any previous stuck session
        } catch {
          // ignore
        }
        try {
          recognition.start();
        } catch (err) {
          console.warn('Could not start recognition:', err);
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      },
    };
  } catch (err) {
    console.error('Failed to init SpeechRecognition', err);
    return null;
  }
}

// Clean and normalize strings for forgiving matching
export function cleanSpokenText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if spoken text contains the target keywords (forgiving French accents & Android misrecognitions)
export function matchesTargetWords(spoken: string, targets: string[]): boolean {
  const cleanedSpoken = cleanSpokenText(spoken);
  const words = cleanedSpoken.split(' ');

  return targets.some((target) => {
    const cleanedTarget = cleanSpokenText(target);

    // Direct substring or inclusion
    if (cleanedSpoken.includes(cleanedTarget)) return true;
    if (words.includes(cleanedTarget)) return true;

    // Forgiving matching for "YET" on Android Chrome
    if (cleanedTarget === 'yet') {
      const phoneticVariants = [
        'yet', 'get', 'yep', 'yes', 'yette', 'jet', 'head', 'hate',
        'yate', 'iet', 'it', 'yeah', 'yup', 'pas encore', 'let', 'hier',
        'yett', 'iat', 'eate', 'met'
      ];
      if (phoneticVariants.some((v) => cleanedSpoken.includes(v) || words.includes(v))) {
        return true;
      }
      if (cleanedSpoken.endsWith('et')) {
        return true;
      }
    }

    // Forgiving matching for "EMPLOYEE"
    if (cleanedTarget === 'employee') {
      const employeeVariants = ['employee', 'employe', 'employ', 'employes', 'employer', 'trainee'];
      if (employeeVariants.some((v) => cleanedSpoken.includes(v) || words.includes(v))) {
        return true;
      }
    }

    // Forgiving matching for "GOVERNMENT"
    if (cleanedTarget === 'government') {
      const govVariants = ['government', 'goverment', 'gouvernement', 'govern', 'gover', 'gov'];
      if (govVariants.some((v) => cleanedSpoken.includes(v) || words.includes(v))) {
        return true;
      }
    }

    return false;
  });
}
