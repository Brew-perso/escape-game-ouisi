// Bulletproof Web Audio & Acoustic Voice Engine for Mobile Browsers (including Android Xiaomi/Poco)
import { getSharedAudioContext, sounds } from './audio';

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
  private listeningStartTimestamp: number = 0;
  private lastFrameTimestamp: number = 0;
  private lastStateUpdateTimestamp: number = 0;
  private accumulatedSpeechMs: number = 0;
  private onStateChange: (state: VoiceEngineState) => void;
  private requiredSpeechMs: number = 340; // 340ms of sustained vocal presence
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
    // Stop any playing speech immediately so microphone doesn't capture speaker audio
    sounds.stopSpeech();

    if (this.state.isListening) {
      this.stopListening();
    }

    this.audioChunks = [];
    this.accumulatedSpeechMs = 0;
    this.isProcessingSuccess = false;
    this.lastStateUpdateTimestamp = 0;

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
            noiseSuppression: false,
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

      // Keep-alive dummy gain node (value 0) connected to destination
      this.dummyGain = this.audioCtx.createGain();
      this.dummyGain.gain.value = 0;
      source.connect(this.dummyGain);
      this.dummyGain.connect(this.audioCtx.destination);

      // 5. Start MediaRecorder for voice replay
      this.startMediaRecorder(stream);

      // 6. Start volume & vocal energy loop
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

    // Record the actual audio stream start timestamp when audio frames begin arriving
    this.listeningStartTimestamp = performance.now();
    this.lastFrameTimestamp = performance.now();
    this.accumulatedSpeechMs = 0;

    const check = () => {
      if (!this.analyser || !this.state.isListening || this.isProcessingSuccess) return;

      const now = performance.now();
      const deltaMs = Math.min(100, Math.max(1, now - this.lastFrameTimestamp));
      this.lastFrameTimestamp = now;

      // Resume context if browser suspended it in background
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      // 1. Analyze Vocal Frequency Band (approx 180 Hz to 3500 Hz: bins 2 to 36)
      this.analyser.getByteFrequencyData(freqBuffer);
      let vocalSum = 0;
      const minBin = 2;
      const maxBin = Math.min(36, freqBuffer.length);
      for (let i = minBin; i < maxBin; i++) {
        vocalSum += freqBuffer[i];
      }
      const vocalAvg = vocalSum / Math.max(1, maxBin - minBin); // 0 - 255
      const freqVolume = Math.min(100, Math.round((vocalAvg / 130) * 100));

      // 2. Analyze Time Domain Peak (instantaneous amplitude deviation from 128)
      this.analyser.getByteTimeDomainData(timeBuffer);
      let maxDev = 0;
      for (let i = 0; i < timeBuffer.length; i++) {
        const dev = Math.abs(timeBuffer[i] - 128);
        if (dev > maxDev) maxDev = dev;
      }
      const peakVolume = Math.min(100, Math.round((maxDev / 55) * 100));

      const currentVolume = Math.max(freqVolume, peakVolume);

      // Warmup guard: Ignore first 450ms of stream audio to discard button tap click, screen touch, and hardware mic pop
      const timeSinceStart = now - this.listeningStartTimestamp;
      if (timeSinceStart <= 450) {
        this.accumulatedSpeechMs = 0;
      } else {
        // Voice activity threshold:
        // Genuine vocal speech produces energy in the vocal frequency band (freqVolume >= 18)
        // and overall audio level (currentVolume >= 28)
        const isVoiceActive = freqVolume >= 18 && currentVolume >= 28;

        if (isVoiceActive) {
          this.accumulatedSpeechMs += deltaMs;

          if (this.accumulatedSpeechMs >= this.requiredSpeechMs && !this.isProcessingSuccess) {
            this.triggerSuccess();
            return;
          }
        } else {
          // Pause decay: fast decay during non-vocal periods so room noise doesn't accumulate
          if (this.accumulatedSpeechMs > 0) {
            this.accumulatedSpeechMs = Math.max(0, this.accumulatedSpeechMs - deltaMs * 0.8);
          }
        }
      }

      // Throttle React state updates to ~25 FPS (every 40ms) to prevent UI overload
      if (now - this.lastStateUpdateTimestamp >= 40) {
        this.lastStateUpdateTimestamp = now;
        this.updateState({
          volume: currentVolume,
          spokenDurationMs: Math.round(this.accumulatedSpeechMs),
        });
      }

      this.animFrameId = requestAnimationFrame(check);
    };

    this.animFrameId = requestAnimationFrame(check);
  }

  private triggerSuccess() {
    this.isProcessingSuccess = true;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    // Stop listening immediately so no subsequent frames or sound can re-trigger
    this.updateState({
      voiceDetected: true,
      volume: 100,
      isListening: false,
    });

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((t) => t.stop());
      } catch {}
      this.mediaStream = null;
    }

    if (this.dummyGain) {
      try {
        this.dummyGain.disconnect();
      } catch {}
      this.dummyGain = null;
    }

    this.analyser = null;
  }

  public stopListening() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.isProcessingSuccess = false;
    this.accumulatedSpeechMs = 0;

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((t) => t.stop());
      } catch {}
      this.mediaStream = null;
    }

    if (this.dummyGain) {
      try {
        this.dummyGain.disconnect();
      } catch {}
      this.dummyGain = null;
    }

    this.analyser = null;

    this.updateState({
      isListening: false,
      volume: 0,
      voiceDetected: false,
      spokenDurationMs: 0,
    });
  }
}
