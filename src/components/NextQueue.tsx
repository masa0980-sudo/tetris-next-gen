import type { TetrominoType } from '@/lib/types';
import { MiniPiece } from './MiniPiece';

interface Props {
  queue: TetrominoType[];
}

export function NextQueue({ queue }: Props) {
  return (
    <div
      className="flex flex-col items-center gap-2 px-3 py-2 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <span className="text-xs text-white/40 font-mono tracking-widest">NEXT</span>
      <div className="flex flex-col gap-2">
        {queue.map((type, i) => (
          <MiniPiece key={i} type={type} size={i === 0 ? 16 : 12} dim={i > 0} />
        ))}
      </div>
    </div>
  );
}
