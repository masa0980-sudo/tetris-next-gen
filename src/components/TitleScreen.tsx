interface Props {
  bestScore: number;
  onStart: () => void;
}

const BLOCKS: { color: string; glow: string; size: number; left: string; duration: string; delay: string }[] = [
  { color: '#5ad1ff', glow: 'rgba(90,209,255,.6)',  size: 46, left: '8%',  duration: '13s', delay: '-2s' },
  { color: '#ffe066', glow: 'rgba(255,224,102,.6)', size: 34, left: '22%', duration: '17s', delay: '-9s' },
  { color: '#c88bff', glow: 'rgba(200,139,255,.6)', size: 50, left: '40%', duration: '15s', delay: '-5s' },
  { color: '#6bff9e', glow: 'rgba(107,255,158,.6)', size: 30, left: '58%', duration: '11s', delay: '-1s' },
  { color: '#ff6b6b', glow: 'rgba(255,107,107,.6)', size: 42, left: '72%', duration: '19s', delay: '-12s' },
  { color: '#6b8bff', glow: 'rgba(107,139,255,.6)', size: 36, left: '86%', duration: '14s', delay: '-6s' },
  { color: '#ffa25a', glow: 'rgba(255,162,90,.6)',  size: 44, left: '95%', duration: '16s', delay: '-4s' },
];

export function TitleScreen({ bestScore, onStart }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 flex flex-col items-center justify-center gap-8 p-8">
      {/* 落ちてくるブロックのシルエット + グリッド背景 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="title-grid" />
        {BLOCKS.map((b, i) => (
          <div
            key={i}
            className="title-block"
            style={{
              width: b.size, height: b.size, left: b.left, top: 0,
              background: b.color, boxShadow: `0 0 24px ${b.glow}`,
              opacity: 0.55, animationDuration: b.duration, animationDelay: b.delay,
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 45%, rgba(5,5,16,0.2), rgba(5,5,16,0.94) 72%)' }}
        />
      </div>

      <div className="relative flex flex-col items-center gap-2">
        <div className="text-7xl sm:text-8xl font-black tracking-tight drop-shadow-[0_0_40px_rgba(90,209,255,0.4)]" style={{ background: 'linear-gradient(135deg, #5ad1ff, #6b8bff, #c88bff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TETRIS
        </div>
        <div className="text-sm text-white/40 font-mono tracking-widest mt-2">NEXT GEN EDITION</div>
      </div>

      {bestScore > 0 && (
        <div
          className="relative flex flex-col items-center px-8 py-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="text-xs text-white/40 font-mono tracking-widest">BEST SCORE</span>
          <span className="text-3xl font-bold font-mono text-yellow-300 tabular-nums">
            {bestScore.toLocaleString()}
          </span>
        </div>
      )}

      <button
        onClick={onStart}
        className="relative px-12 py-4 rounded-2xl text-xl font-bold text-white transition-all duration-200 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          boxShadow: '0 0 30px rgba(37,99,235,0.5)',
        }}
        onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
      >
        PLAY NOW
      </button>

      <div className="relative flex flex-col items-center gap-1 text-white/20 text-xs font-mono">
        <p>← → : Move　　Z / X : Rotate</p>
        <p>↓ : Soft Drop　　Space : Hard Drop</p>
        <p>C : Hold　　P : Pause</p>
      </div>
    </div>
  );
}
