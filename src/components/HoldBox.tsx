import type { TetrominoType } from '@/lib/types';
import { MiniPiece } from './MiniPiece';

interface Props {
  hold: TetrominoType | null;
  canHold: boolean;
}

export function HoldBox({ hold, canHold }: Props) {
  return (
    <div
      className="flex flex-col items-center gap-2 px-3 py-2 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <span className="text-xs text-white/40 font-mono tracking-widest">HOLD</span>
      <MiniPiece type={hold} size={16} dim={!canHold} />
    </div>
  );
}
