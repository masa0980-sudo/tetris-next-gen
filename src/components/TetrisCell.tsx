import type { CellValue } from '@/lib/types';
import { TETROMINO_COLORS } from '@/lib/constants';

interface Props {
  value: CellValue;
  isGhost?: boolean;
  isClearing?: boolean;
}

export function TetrisCell({ value, isGhost = false, isClearing = false }: Props) {
  if (!value) {
    return (
      <div className="w-full h-full rounded-sm" style={{ background: 'rgba(255,255,255,0.03)' }} />
    );
  }

  const { from, to, glow } = TETROMINO_COLORS[value];

  return (
    <div
      className={`w-full h-full rounded-[5px] relative overflow-hidden ${isClearing ? 'animate-line-clear' : ''}`}
      style={{
        background: `linear-gradient(145deg, ${from}, ${to})`,
        boxShadow: isGhost ? 'none' : `0 0 8px ${glow}, inset 0 1px 0 rgba(255,255,255,0.35)`,
        opacity: isGhost ? 0.3 : 1,
        border: isGhost ? '1px dashed rgba(255,255,255,0.45)' : '1px solid rgba(0,0,0,0.25)',
      }}
    >
      {!isGhost && (
        <div
          className="absolute top-0.5 left-0.5 rounded-sm bg-white/45"
          style={{ width: '38%', height: '28%', filter: 'blur(0.5px)' }}
        />
      )}
    </div>
  );
}
