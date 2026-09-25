// Robust Web Audio & Speech Engine designed for mobile browsers (including Android Xiaomi/Poco)

export interface VoiceEngineState {
  isListening: boolean;
  micPermissionGranted: boolean;
  volume: number; // 0 to 100
  voiceDetected: boolean;
  spokenDurationMs: number;
  transcript: string | null;
  recordedAudioUrl: string | null;
  errorMessage: string | null;
}

export class VoiceEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recognition: any = null;
  private animFrameId: number | null = null;
  private speechStartTimestamp: number | null = null;
  private accumulatedSpeechMs: number = 0;
  private onStateChange: (state: VoiceEngineState) => void;
  private targetWords: string[] = [];
  private requiredSpeechMs: number = 350; // 350ms of vocal energy is enough for "YET"

  private state: VoiceEngineState = {
    isListening: false,
    micPermissionGranted: false,
    volume: 0,
    voiceDetected: false,
    spokenDurationMs: 0,
    transcript: null,
    recordedAudioUrl: null,
    errorMessage: null,
  };

  constructor(onStateChange: (state: VoiceEngineState) => void) {
    this.onStateChange = onStateChange;
  }

  private updateState(partial: Partial<VoiceEngineState>) {
    this.state = { ...this.state, ...partial };
    this.onStateChange(this.state);
  }

  // Must be called directly on user touch/click to unlock Android audio context
  public async startListening(targetWords: string[] = ['yet']) {
    this.targetWords = targetWords;
    this.audioChunks = [];
    this.speechStartTimestamp = null;
    this.accumulatedSpeechMs = 0;

    this.updateState({
      isListening: true,
      voiceDetected: false,
      spokenDurationMs: 0,
      transcript: null,
      errorMessage: null,
    });

    try {
      // 1. Initialize AudioContext synchronously on user click
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      // 2. Request mic stream with Android-friendly constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Don't suppress short utterances like "YET"
          autoGainControl: true,
        },
      });
      this.mediaStream = stream;
      this.updateState({ micPermissionGranted: true });

      // 3. Connect analyser node for true hardware volume metering
      const source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.3;
      source.connect(this.analyser);

      // 4. Start MediaRecorder to allow instant playback
      if (typeof MediaRecorder !== 'undefined') {
        try {
          const recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              this.audioChunks.push(e.data);
            }
          };
          recorder.onstop = () => {
            if (this.audioChunks.length > 0) {
              const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
              const url = URL.createObjectURL(blob);
              this.updateState({ recordedAudioUrl: url });
            }
          };
          recorder.start();
          this.mediaRecorder = recorder;
        } catch (recErr) {
          console.warn('MediaRecorder not available or failed:', recErr);
        }
      }

      // 5. Start SpeechRecognition in parallel if supported
      this.initSpeechRecognition();

      // 6. Start volume polling loop (uses time domain deviation from 128 for 100% accuracy)
      this.startVolumeLoop();
    } catch (err: any) {
      console.error('VoiceEngine startup error:', err);
      let msg = "Microphone non accessible. Vérifie les autorisations de ton navigateur.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "Permission refusée : clique sur le cadenas de l'URL pour autoriser le micro.";
      }
      this.updateState({
        isListening: false,
        errorMessage: msg,
      });
      this.stopListening();
    }
  }

  private initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          text += event.results[i][0].transcript;
        }
        if (text) {
          this.updateState({ transcript: text.trim() });
          if (this.matchesTarget(text)) {
            this.triggerSuccess();
          }
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('SpeechRecognition error (fallback to volume analysis):', e.error);
        // Do not fail: volume detection handles it!
      };

      recognition.start();
      this.recognition = recognition;
    } catch (e) {
      console.warn('Could not launch SpeechRecognition:', e);
    }
  }

  private startVolumeLoop() {
    if (!this.analyser) return;

    const buffer = new Uint8Array(this.analyser.fftSize);

    const check = () => {
      if (!this.analyser || !this.state.isListening) return;

      this.analyser.getByteTimeDomainData(buffer);

      // Measure amplitude deviation from center (128)
      let maxDev = 0;
      for (let i = 0; i < buffer.length; i++) {
        const dev = Math.abs(buffer[i] - 128);
        if (dev > maxDev) maxDev = dev;
      }

      // Scale 0-128 to 0-100%
      const currentVolume = Math.min(100, Math.round((maxDev / 70) * 100));
      this.updateState({ volume: currentVolume });

      const now = performance.now();

      // Voice activity threshold (> 10% volume)
      if (currentVolume >= 10) {
        if (!this.speechStartTimestamp) {
          this.speechStartTimestamp = now;
        }
        this.accumulatedSpeechMs += 25;
        this.updateState({ spokenDurationMs: this.accumulatedSpeechMs });

        // If student spoke for sufficient duration, trigger voice detected!
        if (this.accumulatedSpeechMs >= this.requiredSpeechMs && !this.state.voiceDetected) {
          this.triggerSuccess();
          return;
        }
      } else {
        // Slow decay if silence
        if (this.accumulatedSpeechMs > 0) {
          this.accumulatedSpeechMs = Math.max(0, this.accumulatedSpeechMs - 5);
          this.updateState({ spokenDurationMs: this.accumulatedSpeechMs });
        }
      }

      this.animFrameId = requestAnimationFrame(check);
    };

    check();
  }

  private matchesTarget(spoken: string): boolean {
    const clean = spoken.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"’]/g, ' ').trim();
    const targets = this.targetWords.map((t) => t.toLowerCase().trim());

    if (targets.some((t) => clean.includes(t))) return true;

    // Forgiving English/French phonetics for "yet"
    if (targets.includes('yet')) {
      const variants = ['yet', 'get', 'yep', 'yes', 'yette', 'jet', 'head', 'hate', 'it', 'iet', 'hier', 'yeah'];
      if (variants.some((v) => clean.includes(v))) return true;
    }
    return false;
  }

  private triggerSuccess() {
    this.updateState({
      voiceDetected: true,
      volume: 100,
    });
    // Stop listening after a short celebratory moment
    setTimeout(() => {
      this.stopListening();
    }, 600);
  }

  public stopListening() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.recognition = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }

    this.updateState({
      isListening: false,
      volume: 0,
    });
  }
}
