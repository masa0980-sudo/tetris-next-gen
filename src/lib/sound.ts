let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.25,
  startOffset = 0,
  freqEnd?: number,
) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  const t = ac.currentTime + startOffset;
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
  }
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration);
}

export function playMove() {
  tone(240, 0.03, 'square', 0.06);
}

export function playRotate() {
  tone(480, 0.045, 'square', 0.08);
  tone(600, 0.045, 'square', 0.06, 0.03);
}

export function playHardDrop() {
  tone(240, 0.12, 'sawtooth', 0.45, 0, 55);
  tone(130, 0.09, 'sine', 0.3, 0.03, 50);
}

// 同時消しライン数(1〜4)に応じて音数・音程を変える。4(テトリス)は特別なファンファーレ。
export function playLineClear(lines: number) {
  if (lines >= 4) {
    const melody = [660, 880, 1046.5, 1318.5];
    melody.forEach((f, i) => tone(f, 0.14, 'square', 0.28, i * 0.06));
    return;
  }
  const base = 520 + lines * 100;
  for (let i = 0; i < lines; i++) {
    tone(base + i * 90, 0.11, 'sine', 0.3, i * 0.06);
  }
}

export function playLevelUp() {
  tone(523.3, 0.1, 'sine', 0.28, 0);
  tone(659.3, 0.1, 'sine', 0.28, 0.08);
  tone(784, 0.16, 'sine', 0.3, 0.16);
}

export function playHold() {
  tone(300, 0.06, 'triangle', 0.18);
}

export function playGameOver() {
  const melody = [440, 370, 330, 220];
  melody.forEach((f, i) => tone(f, 0.28, 'sine', 0.35, i * 0.22));
}
