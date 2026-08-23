import type { TetrominoType } from "./types";

export const COLS = 10;
export const VISIBLE_ROWS = 20;
export const HIDDEN_ROWS = 2; // 出現位置の余裕(盤面上部の見えない行)
export const TOTAL_ROWS = VISIBLE_ROWS + HIDDEN_ROWS;

export const NEXT_QUEUE_SIZE = 3;

// SRSベースの回転形状(4x4/3x3グリッド)。row0が上。
// 0=spawn, 1=右回転(R), 2=180度, 3=左回転(L)
export const SHAPES: Record<TetrominoType, number[][][]> = {
  I: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
};

// 出現位置(左上基準の col)。中央寄せ。
export const SPAWN_COL: Record<TetrominoType, number> = {
  I: 3,
  O: 4,
  T: 3,
  S: 3,
  Z: 3,
  J: 3,
  L: 3,
};

// 簡易ウォールキック。回転後にこの順で(dCol, dRow)を試し、最初に置ける位置を採用する。
export const KICK_OFFSETS: Array<[number, number]> = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [-2, 0],
  [2, 0],
  [0, -1],
  [0, 1],
];

export const TETROMINO_COLORS: Record<TetrominoType, { from: string; to: string; glow: string }> = {
  I: { from: "#5ad1ff", to: "#2f8fd8", glow: "rgba(90,209,255,.55)" },
  O: { from: "#ffe066", to: "#ffb700", glow: "rgba(255,224,102,.55)" },
  T: { from: "#c88bff", to: "#8b3fe0", glow: "rgba(200,139,255,.55)" },
  S: { from: "#6bff9e", to: "#2ecc71", glow: "rgba(107,255,158,.55)" },
  Z: { from: "#ff6b6b", to: "#e0393f", glow: "rgba(255,107,107,.55)" },
  J: { from: "#6b8bff", to: "#3355d8", glow: "rgba(107,139,255,.55)" },
  L: { from: "#ffa25a", to: "#e0731f", glow: "rgba(255,162,90,.55)" },
};

// レベル(0始まり)ごとの落下間隔(ms)。10ラインごとにレベルアップ。
export const BASE_DROP_MS = 800;
export const DROP_STEP_MS = 70;
export const MIN_DROP_MS = 100;
export function dropIntervalForLevel(level: number): number {
  return Math.max(MIN_DROP_MS, BASE_DROP_MS - level * DROP_STEP_MS);
}

export const LINES_PER_LEVEL = 10;

// 同時消しライン数 -> 基礎スコア(レベル倍)
export const LINE_CLEAR_SCORE: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};
export const SOFT_DROP_SCORE_PER_CELL = 1;
export const HARD_DROP_SCORE_PER_CELL = 2;
export const BACK_TO_BACK_MULTIPLIER = 1.5;

export const LOCK_DELAY_MS = 500; // 接地してから固定されるまでの猶予
export const LINE_CLEAR_ANIM_MS = 280;

export const HIGH_SCORE_KEY = "tetris-next-gen:best-score";
