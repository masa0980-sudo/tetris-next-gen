import {
  LINE_CLEAR_SCORE,
  LINES_PER_LEVEL,
  SOFT_DROP_SCORE_PER_CELL,
  HARD_DROP_SCORE_PER_CELL,
  BACK_TO_BACK_MULTIPLIER,
  NEXT_QUEUE_SIZE,
} from "./constants";
import {
  createEmptyBoard,
  makeBag,
  spawnPiece,
  movePiece,
  rotatePiece,
  hardDropTarget,
  lockPiece,
  findFullRows,
  clearRows,
  canSpawn,
} from "./tetrisGame";
import { saveHighScore } from "./storage";
import type { GameAction, GameState, TetrominoType } from "./types";

// スコア加算のたびに呼ぶ。ベストスコア更新分だけ即座に永続化する。
function addScore(state: GameState, delta: number): Pick<GameState, "score" | "bestScore"> {
  const score = state.score + delta;
  const bestScore = Math.max(score, state.bestScore);
  if (bestScore > state.bestScore) saveHighScore(bestScore);
  return { score, bestScore };
}

function refillQueue(queue: TetrominoType[]): TetrominoType[] {
  let next = queue;
  while (next.length < NEXT_QUEUE_SIZE) {
    next = next.concat(makeBag());
  }
  return next;
}

export function createInitialState(bestScore: number): GameState {
  return {
    phase: "title",
    board: createEmptyBoard(),
    active: null,
    queue: [],
    hold: null,
    canHold: true,
    score: 0,
    bestScore,
    level: 0,
    lines: 0,
    clearingRows: [],
    lastClearCount: 0,
    isBackToBack: false,
    combo: 0,
  };
}

function startFresh(bestScore: number): GameState {
  const bag = makeBag();
  const [firstType, ...rest] = bag;
  const queue = refillQueue(rest);
  return {
    phase: "falling",
    board: createEmptyBoard(),
    active: spawnPiece(firstType),
    queue,
    hold: null,
    canHold: true,
    score: 0,
    bestScore,
    level: 0,
    lines: 0,
    clearingRows: [],
    lastClearCount: 0,
    isBackToBack: false,
    combo: 0,
  };
}

// 接地したピースを固定し、ライン消去の有無で次の状態を決める共通処理
function resolveLock(state: GameState, lockedScoreBonus: number): GameState {
  if (!state.active) return state;
  const boardWithPiece = lockPiece(state.board, state.active);
  const fullRows = findFullRows(boardWithPiece);
  const scored = addScore(state, lockedScoreBonus);

  if (fullRows.length > 0) {
    return {
      ...state,
      ...scored,
      phase: "lineClear",
      board: boardWithPiece,
      active: null,
      clearingRows: fullRows,
    };
  }

  // クリアなし: コンボは途切れる。すぐ次のピースへ。
  return spawnNextInto({
    ...state,
    ...scored,
    board: boardWithPiece,
    active: null,
    combo: 0,
  });
}

function spawnNextInto(state: GameState): GameState {
  const [nextType, ...rest] = state.queue;
  const queue = refillQueue(rest);
  if (!canSpawn(state.board, nextType)) {
    return { ...state, phase: "gameover", queue, active: null };
  }
  return {
    ...state,
    phase: "falling",
    active: spawnPiece(nextType),
    queue,
    canHold: true,
  };
}

// ライン消去アニメーションが終わったあとに呼ぶ: 実際に行を詰め、スコア/レベルを反映する
function finishLineClear(state: GameState): GameState {
  const clearedCount = state.clearingRows.length;
  const board = clearRows(state.board, state.clearingRows);
  const combo = state.combo + 1;
  const isTetris = clearedCount >= 4;
  const backToBackBonus = isTetris && state.isBackToBack ? BACK_TO_BACK_MULTIPLIER : 1;
  const base = LINE_CLEAR_SCORE[Math.min(clearedCount, 4)] ?? 0;
  const comboBonus = combo > 1 ? 50 * (combo - 1) * (state.level + 1) : 0;
  const gained = Math.round(base * (state.level + 1) * backToBackBonus) + comboBonus;

  const lines = state.lines + clearedCount;
  const level = Math.floor(lines / LINES_PER_LEVEL);

  const next: GameState = spawnNextInto({
    ...state,
    ...addScore(state, gained),
    board,
    lines,
    level,
    clearingRows: [],
    lastClearCount: clearedCount,
    isBackToBack: isTetris ? true : clearedCount > 0 ? false : state.isBackToBack,
    combo,
  });
  return next;
}

export function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START":
    case "RESTART":
      return startFresh(state.bestScore);

    case "TOGGLE_PAUSE":
      if (state.phase === "falling") return { ...state, phase: "paused" };
      if (state.phase === "paused") return { ...state, phase: "falling" };
      return state;

    case "MOVE": {
      if (state.phase !== "falling" || !state.active) return state;
      const moved = movePiece(state.board, state.active, 0, action.dx);
      return moved ? { ...state, active: moved } : state;
    }

    case "ROTATE": {
      if (state.phase !== "falling" || !state.active) return state;
      const rotated = rotatePiece(state.board, state.active, action.dir);
      return rotated ? { ...state, active: rotated } : state;
    }

    case "SOFT_DROP": {
      if (state.phase !== "falling" || !state.active) return state;
      const moved = movePiece(state.board, state.active, 1, 0);
      if (!moved) return state;
      return { ...state, active: moved, ...addScore(state, SOFT_DROP_SCORE_PER_CELL) };
    }

    case "HARD_DROP": {
      if (state.phase !== "falling" || !state.active) return state;
      const target = hardDropTarget(state.board, state.active);
      const distance = target.row - state.active.row;
      return resolveLock(
        { ...state, active: target },
        distance * HARD_DROP_SCORE_PER_CELL
      );
    }

    case "TICK": {
      if (state.phase !== "falling" || !state.active) return state;
      const moved = movePiece(state.board, state.active, 1, 0);
      if (moved) return { ...state, active: moved };
      return resolveLock(state, 0);
    }

    case "HOLD": {
      if (state.phase !== "falling" || !state.active || !state.canHold) return state;
      if (state.hold === null) {
        const held = state.active.type;
        const withoutActive = spawnNextInto({ ...state, active: null });
        return { ...withoutActive, hold: held, canHold: false };
      }
      const swappedType = state.hold;
      const newActive = spawnPiece(swappedType);
      if (!canSpawn(state.board, swappedType)) {
        return { ...state, phase: "gameover" };
      }
      return {
        ...state,
        active: newActive,
        hold: state.active.type,
        canHold: false,
      };
    }

    case "LOCK_RESOLVED": {
      if (state.phase !== "lineClear") return state;
      return finishLineClear(state);
    }

    default:
      return state;
  }
}
