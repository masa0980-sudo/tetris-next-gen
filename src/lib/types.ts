export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type RotationState = 0 | 1 | 2 | 3; // 0=spawn, 1=R(cw), 2=180, 3=L(ccw)

export type CellValue = TetrominoType | null;

export type Board = CellValue[][]; // [row][col], row 0 = 一番上(隠し行を含む)

export interface Piece {
  type: TetrominoType;
  rotation: RotationState;
  row: number; // ボード座標(左上基準)
  col: number;
}

export type GamePhase =
  | "title"
  | "falling"
  | "lineClear"
  | "paused"
  | "gameover";

export interface GameState {
  phase: GamePhase;
  board: Board;
  active: Piece | null;
  queue: TetrominoType[]; // これから出る順(先頭が次)
  hold: TetrominoType | null;
  canHold: boolean;
  score: number;
  bestScore: number;
  level: number;
  lines: number;
  clearingRows: number[]; // ラインクリア演出中の行番号
  lastClearCount: number; // 直近の同時消し数(演出・SE用)
  isBackToBack: boolean;
  combo: number;
}

export type GameAction =
  | { type: "START" }
  | { type: "TICK" }
  | { type: "MOVE"; dx: number }
  | { type: "SOFT_DROP" }
  | { type: "HARD_DROP" }
  | { type: "ROTATE"; dir: 1 | -1 }
  | { type: "HOLD" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "LOCK_RESOLVED" }
  | { type: "RESTART" };
