class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private isMuted = false;
  private masterGain: GainNode | null = null;
  private ambientOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isAmbientPlaying = false;
  private ambientVolume = 0.15;

  constructor() {
    // Tự động kiểm tra cài đặt âm thanh từ bộ nhớ nếu có, mặc định là BẬT
    const saved = localStorage.getItem("app_sound_enabled");
    this.isMuted = saved !== null ? saved === "false" : false;

    // Tự động kích hoạt AudioContext khi người dùng chạm hoặc bấm vào bất kỳ đâu trên màn hình
    this.setupAutoResume();
  }

  private setupAutoResume() {
    const triggerEvents = ["click", "touchstart", "keydown", "mousedown"];
    const handleFirstInteraction = () => {
      this.init();
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      triggerEvents.forEach((ev) => window.removeEventListener(ev, handleFirstInteraction));
    };

    triggerEvents.forEach((ev) => window.addEventListener(ev, handleFirstInteraction, { once: true }));
  }

  public init() {
    if (this.isInitialized && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.8;
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem("app_sound_enabled", String(!muted));
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.8, now + 0.1);
    }
    if (muted && this.isAmbientPlaying) {
      this.stopBackgroundAmbience();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return !this.isMuted;
  }

  // Âm thanh khi có dữ liệu đồng bộ từ máy khác tới (Real-time Sync Chime)
  public playSyncChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Hợp âm tươi sáng)

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  }

  // Âm thanh khi lưu hoặc thêm mới thành công
  public playSuccessChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.01, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.55);
    });
  }

  // Âm thanh tương tác khi click nút bấm
  public playClickSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Âm thanh khi xóa
  public playDeletePop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Nhạc nền êm dịu thư giãn (Ambient Lo-Fi Drone)
  public toggleBackgroundAmbience(): boolean {
    if (this.isAmbientPlaying) {
      this.stopBackgroundAmbience();
      return false;
    } else {
      this.startBackgroundAmbience();
      return true;
    }
  }

  public startBackgroundAmbience() {
    if (this.isMuted) {
      this.setMuted(false);
    }
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    this.stopBackgroundAmbience();

    const baseFreqs = [174, 217.5, 261, 348]; // 432Hz harmonic series
    const now = this.ctx.currentTime;

    baseFreqs.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.ambientVolume / baseFreqs.length, now + 2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      this.ambientOscillators.push({ osc, gain });
    });

    this.isAmbientPlaying = true;
  }

  public stopBackgroundAmbience() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.ambientOscillators.forEach(({ osc, gain }) => {
      try {
        gain.gain.linearRampToValueAtTime(0.0001, now + 1);
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (e) {}
        }, 1100);
      } catch (e) {}
    });
    this.ambientOscillators = [];
    this.isAmbientPlaying = false;
  }

  public getIsAmbientPlaying(): boolean {
    return this.isAmbientPlaying;
  }
}

export const soundManager = new SoundEffectsManager();
