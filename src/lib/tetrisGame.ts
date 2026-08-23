import {
  COLS,
  TOTAL_ROWS,
  SHAPES,
  SPAWN_COL,
  KICK_OFFSETS,
} from "./constants";
import type { Board, CellValue, Piece, RotationState, TetrominoType } from "./types";

const ALL_TYPES: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];

export function createEmptyBoard(): Board {
  return Array.from({ length: TOTAL_ROWS }, () =>
    Array<CellValue>(COLS).fill(null)
  );
}

// Fisher-Yates で1袋(7種類を1つずつ)をシャッフルする。7-bagランダマイザ。
export function makeBag(): TetrominoType[] {
  const bag = [...ALL_TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function spawnPiece(type: TetrominoType): Piece {
  return { type, rotation: 0, row: 0, col: SPAWN_COL[type] };
}

// 現在の回転状態でピースが占めるセルの絶対座標一覧
export function cellsForPiece(piece: Piece): Array<[number, number]> {
  const shape = SHAPES[piece.type][piece.rotation];
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) cells.push([piece.row + r, piece.col + c]);
    }
  }
  return cells;
}

export function isValidPosition(board: Board, piece: Piece): boolean {
  for (const [row, col] of cellsForPiece(piece)) {
    if (col < 0 || col >= COLS) return false;
    if (row < 0 || row >= TOTAL_ROWS) return false;
    if (board[row][col] !== null) return false;
  }
  return true;
}

export function movePiece(
  board: Board,
  piece: Piece,
  dRow: number,
  dCol: number
): Piece | null {
  const next: Piece = { ...piece, row: piece.row + dRow, col: piece.col + dCol };
  return isValidPosition(board, next) ? next : null;
}

// 簡易ウォールキック付き回転。SRSの完全なキックテーブルではなく、
// よく使う「そのまま→左右に1,2マスずらす→上にずらす」の順で試す簡易版。
export function rotatePiece(
  board: Board,
  piece: Piece,
  dir: 1 | -1
): Piece | null {
  const nextRotation = (((piece.rotation + dir) % 4) + 4) % 4 as RotationState;
  for (const [dCol, dRow] of KICK_OFFSETS) {
    const candidate: Piece = {
      ...piece,
      rotation: nextRotation,
      row: piece.row + dRow,
      col: piece.col + dCol,
    };
    if (isValidPosition(board, candidate)) return candidate;
  }
  return null;
}

export function hardDropTarget(board: Board, piece: Piece): Piece {
  let current = piece;
  while (true) {
    const next: Piece = { ...current, row: current.row + 1 };
    if (!isValidPosition(board, next)) return current;
    current = next;
  }
}

export function isGrounded(board: Board, piece: Piece): boolean {
  const below: Piece = { ...piece, row: piece.row + 1 };
  return !isValidPosition(board, below);
}

export function lockPiece(board: Board, piece: Piece): Board {
  const next = board.map((row) => row.slice());
  for (const [row, col] of cellsForPiece(piece)) {
    if (row >= 0 && row < TOTAL_ROWS && col >= 0 && col < COLS) {
      next[row][col] = piece.type;
    }
  }
  return next;
}

export interface ClearResult {
  board: Board;
  clearedRows: number[];
  clearedCount: number;
}

export function findFullRows(board: Board): number[] {
  const rows: number[] = [];
  for (let r = 0; r < board.length; r++) {
    if (board[r].every((cell) => cell !== null)) rows.push(r);
  }
  return rows;
}

// クリア対象行を除いて上に詰め、空行を先頭に補充する
export function clearRows(board: Board, rows: number[]): Board {
  if (rows.length === 0) return board;
  const rowSet = new Set(rows);
  const remaining = board.filter((_, i) => !rowSet.has(i));
  const emptyRows = Array.from({ length: rows.length }, () =>
    Array<CellValue>(COLS).fill(null)
  );
  return [...emptyRows, ...remaining];
}

export function canSpawn(board: Board, type: TetrominoType): boolean {
  return isValidPosition(board, spawnPiece(type));
}
