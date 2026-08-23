import type { TetrominoType } from '@/lib/types';
import { SHAPES, TETROMINO_COLORS } from '@/lib/constants';

interface Props {
  type: TetrominoType | null;
  size?: number; // 1マスのpx
  dim?: boolean;
}

// NEXT/HOLD表示用。spawn形状(回転0)をそのまま小さく描く。
export function MiniPiece({ type, size = 16, dim = false }: Props) {
  if (!type) {
    return <div style={{ width: size * 4, height: size * 2 }} />;
  }
  const shape = SHAPES[type][0];
  const { from, to, glow } = TETROMINO_COLORS[type];

  // 上下左右の空行/空列を切り詰めて、見た目の余白を減らす
  const rowsUsed = shape.map((row) => row.some((v) => v === 1));
  const colsUsed = shape[0].map((_, c) => shape.some((row) => row[c] === 1));
  const firstRow = rowsUsed.indexOf(true);
  const lastRow = rowsUsed.lastIndexOf(true);
  const firstCol = colsUsed.indexOf(true);
  const lastCol = colsUsed.lastIndexOf(true);
  const trimmed = shape.slice(firstRow, lastRow + 1).map((row) => row.slice(firstCol, lastCol + 1));

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${trimmed.length}, ${size}px)`,
        gridTemplateColumns: `repeat(${trimmed[0].length}, ${size}px)`,
        gap: '2px',
        opacity: dim ? 0.35 : 1,
      }}
    >
      {trimmed.map((row, ri) =>
        row.map((filled, ci) =>
          filled ? (
            <div
              key={`${ri}-${ci}`}
              className="rounded-[3px]"
              style={{
                background: `linear-gradient(145deg, ${from}, ${to})`,
                boxShadow: `0 0 5px ${glow}, inset 0 1px 0 rgba(255,255,255,0.35)`,
                border: '1px solid rgba(0,0,0,0.25)',
              }}
            />
          ) : (
            <div key={`${ri}-${ci}`} />
          )
        )
      )}
    </div>
  );
}
