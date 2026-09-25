// Bulletproof Web Audio & Acoustic Voice Engine for Mobile Browsers (including Android Xiaomi/Poco)
import { getSharedAudioContext } from './audio';

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
  private dummyGain: GainNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private animFrameId: number | null = null;
  private lastFrameTimestamp: number = 0;
  private accumulatedSpeechMs: number = 0;
  private onStateChange: (state: VoiceEngineState) => void;
  private requiredSpeechMs: number = 220; // 220ms of vocal energy reliably catches "YET !"
  private isProcessingSuccess: boolean = false;

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

  // Must be called directly on user touch/click to unlock mobile AudioContext
  public async startListening(_targetWords: string[] = ['yet']) {
    if (this.state.isListening) {
      this.stopListening();
    }

    this.audioChunks = [];
    this.accumulatedSpeechMs = 0;
    this.isProcessingSuccess = false;

    this.updateState({
      isListening: true,
      voiceDetected: false,
      spokenDurationMs: 0,
      errorMessage: null,
      volume: 0,
    });

    try {
      // 1. Initialize and unlock the shared AudioContext synchronously
      this.audioCtx = getSharedAudioContext();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      // 2. Request mic stream with Android-friendly constraints & graceful fallback
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: false, // Don't filter out short sharp bursts like "YET"
            autoGainControl: true,
          },
        });
      } catch (constraintErr) {
        console.warn('Advanced audio constraints failed, falling back to basic audio: true', constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      this.mediaStream = stream;
      this.updateState({ micPermissionGranted: true });

      // 3. Re-verify AudioContext is resumed after permission dialog
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = getSharedAudioContext();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      if (!this.audioCtx) {
        throw new Error('AudioContext unavailable');
      }

      // 4. Connect Web Audio Pipeline
      const source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.25;
      source.connect(this.analyser);

      // Keep-alive dummy gain node (value 0) connected to destination:
      // Guarantees Android Chrome rendering thread continuously pulls audio from mic
      this.dummyGain = this.audioCtx.createGain();
      this.dummyGain.gain.value = 0;
      source.connect(this.dummyGain);
      this.dummyGain.connect(this.audioCtx.destination);

      // 5. Start MediaRecorder for immediate voice replay
      this.startMediaRecorder(stream);

      // 6. Start volume & vocal energy loop
      this.lastFrameTimestamp = performance.now();
      this.startVolumeLoop();
    } catch (err: any) {
      console.error('VoiceEngine startup error:', err);
      let msg = "Microphone non accessible. Vérifie les autorisations de ton navigateur.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "Micro refusé : clique sur le cadenas de l'adresse URL pour autoriser le micro.";
      }
      this.updateState({
        isListening: false,
        errorMessage: msg,
      });
      this.stopListening();
    }
  }

  private startMediaRecorder(stream: MediaStream) {
    if (typeof MediaRecorder === 'undefined') return;

    let mimeType = '';
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) {
        mimeType = c;
        break;
      }
    }

    try {
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (this.audioChunks.length > 0) {
          const blob = new Blob(this.audioChunks, { type: mimeType || 'audio/webm' });
          const url = URL.createObjectURL(blob);
          this.updateState({ recordedAudioUrl: url });
        }
      };

      recorder.start(100); // 100ms timeslices
      this.mediaRecorder = recorder;
    } catch (recErr) {
      console.warn('MediaRecorder error:', recErr);
    }
  }

  private startVolumeLoop() {
    if (!this.analyser) return;

    const freqBuffer = new Uint8Array(this.analyser.frequencyBinCount);
    const timeBuffer = new Uint8Array(this.analyser.fftSize);

    const check = () => {
      if (!this.analyser || !this.state.isListening || this.isProcessingSuccess) return;

      // Resume context if browser suspended it in background
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      // 1. Analyze Vocal Frequency Band (approx 150 Hz to 3500 Hz: bins 2 to 36)
      this.analyser.getByteFrequencyData(freqBuffer);
      let vocalSum = 0;
      const minBin = 2;
      const maxBin = Math.min(36, freqBuffer.length);
      for (let i = minBin; i < maxBin; i++) {
        vocalSum += freqBuffer[i];
      }
      const vocalAvg = vocalSum / Math.max(1, maxBin - minBin); // 0 - 255
      const freqVolume = Math.min(100, Math.round((vocalAvg / 140) * 100));

      // 2. Analyze Time Domain Peak (instantaneous amplitude deviation from 128)
      this.analyser.getByteTimeDomainData(timeBuffer);
      let maxDev = 0;
      for (let i = 0; i < timeBuffer.length; i++) {
        const dev = Math.abs(timeBuffer[i] - 128);
        if (dev > maxDev) maxDev = dev;
      }
      const peakVolume = Math.min(100, Math.round((maxDev / 50) * 100));

      // Combined volume gives instantaneous reaction to speech
      const currentVolume = Math.max(freqVolume, peakVolume);
      this.updateState({ volume: currentVolume });

      // Frame time delta in milliseconds (frame-rate independent for 60Hz and 120Hz screens)
      const now = performance.now();
      const deltaMs = Math.min(100, Math.max(1, now - this.lastFrameTimestamp));
      this.lastFrameTimestamp = now;

      // Voice activity threshold (volume >= 14% is clearly distinct from background ambient room hum)
      if (currentVolume >= 14) {
        this.accumulatedSpeechMs += deltaMs;
        this.updateState({ spokenDurationMs: Math.round(this.accumulatedSpeechMs) });

        // If voice burst matches threshold (~220ms for "YET !"), validate immediately!
        if (this.accumulatedSpeechMs >= this.requiredSpeechMs && !this.isProcessingSuccess) {
          this.triggerSuccess();
          return;
        }
      } else {
        // Natural speech pause decay
        if (this.accumulatedSpeechMs > 0) {
          this.accumulatedSpeechMs = Math.max(0, this.accumulatedSpeechMs - deltaMs * 0.4);
          this.updateState({ spokenDurationMs: Math.round(this.accumulatedSpeechMs) });
        }
      }

      this.animFrameId = requestAnimationFrame(check);
    };

    this.animFrameId = requestAnimationFrame(check);
  }

  private triggerSuccess() {
    this.isProcessingSuccess = true;
    this.updateState({
      voiceDetected: true,
      volume: 100,
    });

    // Allow user to see the success flash and record final audio snippet
    setTimeout(() => {
      this.stopListening();
    }, 700);
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

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      this.mediaStream = null;
    }

    if (this.dummyGain) {
      try {
        this.dummyGain.disconnect();
      } catch (e) {}
      this.dummyGain = null;
    }

    this.analyser = null;

    this.updateState({
      isListening: false,
      volume: 0,
    });
  }
}
