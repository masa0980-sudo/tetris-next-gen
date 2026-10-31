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

let master: GainNode | null = null;
let muted = false;
function getMaster(ac: AudioContext): GainNode {
  if (!master) {
    master = ac.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ac.destination);
  }
  return master;
}
/** メドレーから mute=1 で呼ばれたとき。効果音もBGMもここを通るので0にすれば無音 */
export function setMuted(m: boolean) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 1;
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
  gain.connect(getMaster(ac));
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

/* =========================================================
   BGM — プレイ中だけ鳴らすループ曲。外部音源は使わず、
   look-ahead スケジューラでベース+リードの16分音符パターンを
   ループ再生する(効果音と同じ Web Audio API の合成のみ)。
   イ短調・駆け足のウォーキングベースで、テンポ感のある曲調にしている。
   ========================================================= */
const NOTE: Record<string, number> = {
  A2: 110.0, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0,
};

const BGM_BPM = 150;
const SIXTEENTH = 60 / BGM_BPM / 4;
const BGM_STEPS = 16;
// 8分音符ごとのウォーキングベース(Am - F - C - G の駆け足進行)
const BGM_BASS = [
  'A2', null, 'A2', null, 'F3', null, 'A2', null,
  'C3', null, 'A2', null, 'E3', null, 'G3', null,
];
// 4分音符ごとの短いリード動機。少し緊張感のある短調フレーズ
const BGM_LEAD = [
  'E4', null, null, null, 'C4', null, null, null,
  'D4', null, null, null, 'A3', null, null, null,
];

let bgmTimerId: number | null = null;
let bgmNextTime = 0;
let bgmStep = 0;

function scheduleBgmStep(step: number, offset: number) {
  const bassNote = BGM_BASS[step];
  if (bassNote) tone(NOTE[bassNote], SIXTEENTH * 1.8, 'triangle', 0.14, offset);
  const leadNote = BGM_LEAD[step];
  if (leadNote) tone(NOTE[leadNote], SIXTEENTH * 3, 'square', 0.06, offset);
}

function bgmTick() {
  const ac = getCtx();
  if (!ac) return;
  while (bgmNextTime < ac.currentTime + 0.15) {
    scheduleBgmStep(bgmStep, bgmNextTime - ac.currentTime);
    bgmNextTime += SIXTEENTH;
    bgmStep = (bgmStep + 1) % BGM_STEPS;
  }
}

export function startBgm() {
  const ac = getCtx();
  if (!ac || bgmTimerId !== null) return;
  if (ac.state === 'suspended') ac.resume();
  bgmStep = 0;
  bgmNextTime = ac.currentTime + 0.05;
  bgmTimerId = window.setInterval(bgmTick, 50);
}

export function stopBgm() {
  if (bgmTimerId !== null) {
    window.clearInterval(bgmTimerId);
    bgmTimerId = null;
  }
}
