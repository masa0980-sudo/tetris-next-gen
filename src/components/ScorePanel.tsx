interface Props {
  score: number;
  bestScore: number;
  level: number;
  lines: number;
}

export function ScorePanel({ score, bestScore, level, lines }: Props) {
  return (
    <div
      className="w-full flex items-center justify-between px-4 py-2 rounded-xl mb-3"
      style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <Stat label="SCORE" value={score.toLocaleString()} />
      <Stat label="BEST" value={bestScore.toLocaleString()} />
      <Stat label="LEVEL" value={String(level)} />
      <Stat label="LINES" value={String(lines)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-white/40 font-mono tracking-widest">{label}</span>
      <span className="text-lg font-bold font-mono tabular-nums text-white">{value}</span>
    </div>
  );
}
