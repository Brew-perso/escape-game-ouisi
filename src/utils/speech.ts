// Speech recognition and fuzzy phonetic comparison

// Types for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
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

export function createSpeechRecognizer(
  onTranscript: (text: string, isFinal: boolean) => void,
  onError: (err: string) => void,
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
    recognition.lang = lang;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        onTranscript(interimTranscript.trim(), false);
      }
    };

    recognition.onerror = (e: { error: string }) => {
      onError(e.error || 'Erreur microphone');
    };

    recognition.onend = () => {
      onEnd();
    };

    return {
      start: () => {
        try {
          recognition.start();
        } catch {
          // already started or aborted
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
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if spoken text contains the target keywords
export function matchesTargetWords(spoken: string, targets: string[]): boolean {
  const cleanedSpoken = cleanSpokenText(spoken);
  const words = cleanedSpoken.split(' ');

  return targets.some((target) => {
    const cleanedTarget = cleanSpokenText(target);
    // Direct substring or inclusion
    if (cleanedSpoken.includes(cleanedTarget)) return true;
    // Word by word fuzzy check
    if (words.includes(cleanedTarget)) return true;
    // For single letters/sounds or slight misrecognitions
    if (cleanedTarget === 'yet') {
      return (
        cleanedSpoken.includes('yet') ||
        cleanedSpoken.includes('get') || // common speech to text mishearing for yet
        cleanedSpoken.includes('yes') ||
        cleanedSpoken.endsWith('et')
      );
    }
    if (cleanedTarget === 'employee') {
      return (
        cleanedSpoken.includes('employee') ||
        cleanedSpoken.includes('employ') ||
        cleanedSpoken.includes('employe')
      );
    }
    if (cleanedTarget === 'government') {
      return (
        cleanedSpoken.includes('government') ||
        cleanedSpoken.includes('goverment') ||
        cleanedSpoken.includes('govern')
      );
    }
    return false;
  });
}
