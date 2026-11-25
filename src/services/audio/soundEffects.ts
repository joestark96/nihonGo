export function playCorrectSfx(ctx: AudioContext) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  gain.connect(ctx.destination);
  osc.connect(gain);

  osc.frequency.setValueAtTime(523.25, now);
  osc.frequency.setValueAtTime(659.25, now + 0.08);
  osc.frequency.setValueAtTime(783.99, now + 0.16);
  osc.frequency.setValueAtTime(1046.5, now + 0.24);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc.start(now);
  osc.stop(now + 0.6);
}

export function playIncorrectSfx(ctx: AudioContext) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  gain.connect(ctx.destination);
  osc.connect(gain);

  osc.frequency.setValueAtTime(155.56, now);
  osc.frequency.linearRampToValueAtTime(130.81, now + 0.25);

  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.start(now);
  osc.stop(now + 0.4);
}

export function playTapSfx(ctx: AudioContext) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  gain.connect(ctx.destination);
  osc.connect(gain);

  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.start(now);
  osc.stop(now + 0.05);
}

export function playLessonCompleteSfx(ctx: AudioContext) {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(ctx.destination);

    const noteTime = now + idx * 0.12;
    osc.frequency.setValueAtTime(freq, noteTime);
    gain.gain.setValueAtTime(0.16, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

    osc.start(noteTime);
    osc.stop(noteTime + 0.45);
  });
}
