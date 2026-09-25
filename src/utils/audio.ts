// Audio synthesis and Text-to-Speech helper for Escape Game

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private englishVoices: SpeechSynthesisVoice[] = [];
  private preferredAccent: 'en-GB' | 'en-US' = 'en-GB';

  constructor() {
    this.initVoices();
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setPreferredAccent(accent: 'en-GB' | 'en-US') {
    this.preferredAccent = accent;
  }

  public getPreferredAccent(): 'en-GB' | 'en-US' {
    return this.preferredAccent;
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const refreshVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (!allVoices || allVoices.length === 0) return;

      // STRICTLY filter only English voices, NEVER French or other languages
      this.englishVoices = allVoices.filter((v) => {
        const lang = (v.lang || '').toLowerCase().replace('_', '-');
        return lang.startsWith('en') && !lang.startsWith('fr');
      });
    };

    refreshVoices();
    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
    } else {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
  }

  public getAvailableEnglishVoices(): SpeechSynthesisVoice[] {
    if (this.englishVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const all = window.speechSynthesis.getVoices();
      this.englishVoices = all.filter((v) => {
        const lang = (v.lang || '').toLowerCase().replace('_', '-');
        return lang.startsWith('en') && !lang.startsWith('fr');
      });
    }
    return this.englishVoices;
  }

  // Play subtle click
  public playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Play success arpeggio
  public playSuccess() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  // Play gentle retry sound (supportive, growth mindset)
  public playGentleError() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(349.23, now); // F4
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.25); // C4

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Play rubber band stretch sound (pitch shifts upward)
  public playRubberStretch(pitchFactor: number = 1.0) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const baseFreq = 180 * pitchFactor;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + 0.3);

    // Filter to make it sound like rubber
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // Play drum beat (accented vs non-accented for word stress rhythm)
  public playBeat(accented: boolean) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    if (accented) {
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
  }

  // Play unlock fanfare for stage completion
  public playVaultUnlock() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major 9th

    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 1.3);
    });
  }

  // Find the highest quality English voice strictly matching preferences
  private resolveEnglishVoice(preferredLang: string): SpeechSynthesisVoice | null {
    const voices = this.getAvailableEnglishVoices();
    if (!voices || voices.length === 0) return null;

    const target = preferredLang.toLowerCase().replace('_', '-');

    // 1. High quality British / US voices (Google, Daniel, Oliver, Samantha, Serena, Natural)
    const naturalVoice = voices.find((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      const matchesTarget = vLang.startsWith(target.slice(0, 5));
      const hasNaturalName =
        v.name.includes('Google') ||
        v.name.includes('Natural') ||
        v.name.includes('Daniel') ||
        v.name.includes('Oliver') ||
        v.name.includes('Samantha') ||
        v.name.includes('Serena') ||
        v.name.includes('George') ||
        v.name.includes('Zira');
      return matchesTarget && hasNaturalName;
    });

    if (naturalVoice) return naturalVoice;

    // 2. Exact language match (e.g. en-GB or en-US)
    const exactLangMatch = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === target);
    if (exactLangMatch) return exactLangMatch;

    // 3. Prefix match (e.g. starts with en-GB)
    const prefixMatch = voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(target.slice(0, 5)));
    if (prefixMatch) return prefixMatch;

    // 4. Any English voice
    const anyEn = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    if (anyEn) return anyEn;

    return null;
  }

  // Text-To-Speech using native SpeechSynthesis API strictly with native English voice
  public speakEnglish(text: string, options: { rate?: number; pitch?: number; lang?: string } = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const performSpeak = () => {
      const targetLang = options.lang || this.preferredAccent;
      const englishVoice = this.resolveEnglishVoice(targetLang);

      const utterance = new SpeechSynthesisUtterance(text);

      if (englishVoice) {
        utterance.voice = englishVoice;
        utterance.lang = englishVoice.lang; // Force match voice language
      } else {
        // Fallback: force lang attribute to English US so browser never uses French OS voice
        utterance.lang = 'en-US';
      }

      utterance.rate = options.rate ?? 0.85; // pedagogical rate for L1 learners
      utterance.pitch = options.pitch ?? 1.0;

      window.speechSynthesis.speak(utterance);
    };

    // If voices are not yet loaded (Chrome async bug), wait for them
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      const onVoicesReady = () => {
        window.speechSynthesis.removeEventListener?.('voiceschanged', onVoicesReady);
        performSpeak();
      };

      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', onVoicesReady, { once: true });
      } else {
        window.speechSynthesis.onvoiceschanged = onVoicesReady;
      }

      // Safety timeout in case voiceschanged does not trigger
      setTimeout(performSpeak, 300);
    } else {
      performSpeak();
    }
  }
}

export const sounds = new SoundManager();
