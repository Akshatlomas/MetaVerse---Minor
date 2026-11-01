/**
 * Campus Audio & Ambience Manager
 * Generates procedural atmospheric campus audio using standard Web Audio API.
 * Ensures seamless audio isolation:
 * - When in campus: outdoor atmospheric ambience.
 * - When entering classroom: door transition chime, campus ambience is muted.
 * - When exiting classroom: media tracks stopped, campus ambience restored.
 */

class CampusAudioManager {
  constructor() {
    this.ctx = null;
    this.ambienceGain = null;
    this.isPlaying = false;
    this.isMutedForClassroom = false;
    this.nodes = [];
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.ambienceGain = this.ctx.createGain();
        this.ambienceGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        this.ambienceGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  startAmbience() {
    try {
      this.initContext();
      if (!this.ctx || this.isPlaying) return;

      // 1. Gentle low breeze white noise
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Lowpass filter for smooth wind/air
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, this.ctx.currentTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ambienceGain);
      whiteNoise.start();

      this.nodes.push(whiteNoise);
      this.isPlaying = true;
    } catch {
      // Audio autoplay policy handled
    }
  }

  muteForClassroom() {
    this.isMutedForClassroom = true;
    if (this.ambienceGain && this.ctx) {
      try {
        this.ambienceGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
      } catch {}
    }
  }

  resumeFromClassroom() {
    this.isMutedForClassroom = false;
    if (this.ambienceGain && this.ctx) {
      try {
        this.ambienceGain.gain.setTargetAtTime(0.08, this.ctx.currentTime, 0.3);
      } catch {}
    }
  }

  playDoorTransition() {
    try {
      this.initContext();
      if (!this.ctx) return;

      // Smooth double tone representing automatic glass door opening
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {}
  }

  playBellChime() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.2); // A5

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch {}
  }

  playHandRaisePing() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.1); // E5

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  stopAll() {
    this.nodes.forEach((n) => {
      try {
        n.stop();
        n.disconnect();
      } catch {}
    });
    this.nodes = [];
    this.isPlaying = false;
  }
}

export const campusAudio = new CampusAudioManager();
