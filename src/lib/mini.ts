// ミニゲーム・メドレー(mini-medley)から ?mini=1&sec=N&mute=0|1 で呼ばれたときの約束。
// 仕様の正本は mini-medley/CLAUDE.md。mini=1 が無いときは何もしない(従来どおり)。
export const GAME_ID = 'tetris-next-gen';
// 100点の目安は6ライン消し。ハードドロップの加点だけでは高得点にならないよう、ライン数を主役にする
export const MINI_LINES_FOR_100 = 6;

export interface MiniConfig {
  sec: number;
  mute: boolean;
}

export function readMini(): MiniConfig | null {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  if (q.get('mini') !== '1') return null;
  const sec = Number(q.get('sec'));
  return { sec: sec > 0 ? sec : 30, mute: q.get('mute') === '1' };
}

export function postToHub(msg: Record<string, unknown>): void {
  try {
    window.parent.postMessage({ ...msg, game: GAME_ID }, '*');
  } catch {
    /* 親が無いときは何もしない */
  }
}

export function scoreToPoints(score: number, lines: number): number {
  const fromLines = (lines / MINI_LINES_FOR_100) * 86;
  const fromScore = (Math.min(score, 500) / 500) * 14;
  return Math.max(0, Math.min(100, Math.round(fromLines + fromScore)));
}
