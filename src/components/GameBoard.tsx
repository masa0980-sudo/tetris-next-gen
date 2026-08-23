import type { Board, CellValue, Piece } from '@/lib/types';
import { COLS, VISIBLE_ROWS, HIDDEN_ROWS } from '@/lib/constants';
import { cellsForPiece } from '@/lib/tetrisGame';
import { TetrisCell } from './TetrisCell';

interface Props {
  board: Board;
  active: Piece | null;
  ghost: Piece | null;
  clearingRows: number[];
}

interface DisplayCell {
  value: CellValue;
  isGhost: boolean;
}

export function GameBoard({ board, active, ghost, clearingRows }: Props) {
  const grid: DisplayCell[][] = Array.from({ length: VISIBLE_ROWS }, (_, ri) =>
    Array.from({ length: COLS }, (_, ci) => ({
      value: board[ri + HIDDEN_ROWS][ci],
      isGhost: false,
    }))
  );

  if (ghost && (!active || ghost.row !== active.row || ghost.col !== active.col)) {
    for (const [row, col] of cellsForPiece(ghost)) {
      const vr = row - HIDDEN_ROWS;
      if (vr >= 0 && vr < VISIBLE_ROWS && grid[vr][col].value === null) {
        grid[vr][col] = { value: ghost.type, isGhost: true };
      }
    }
  }

  if (active) {
    for (const [row, col] of cellsForPiece(active)) {
      const vr = row - HIDDEN_ROWS;
      if (vr >= 0 && vr < VISIBLE_ROWS) {
        grid[vr][col] = { value: active.type, isGhost: false };
      }
    }
  }

  const clearingSet = new Set(clearingRows.map((r) => r - HIDDEN_ROWS));

  return (
    <div
      className="rounded-xl overflow-hidden p-1"
      style={{
        background: 'rgba(0,0,20,0.75)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.12)',
        display: 'grid',
        gridTemplateRows: `repeat(${VISIBLE_ROWS}, 1fr)`,
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gap: '2px',
        width: `calc(var(--cell-size) * ${COLS} + 2px * ${COLS - 1} + 8px)`,
        height: `calc(var(--cell-size) * ${VISIBLE_ROWS} + 2px * ${VISIBLE_ROWS - 1} + 8px)`,
      }}
    >
      {grid.map((row, ri) =>
        row.map((cell, ci) => (
          <div key={`${ri}-${ci}`} style={{ width: 'var(--cell-size)', height: 'var(--cell-size)' }}>
            <TetrisCell value={cell.value} isGhost={cell.isGhost} isClearing={clearingSet.has(ri)} />
          </div>
        ))
      )}
    </div>
  );
}
