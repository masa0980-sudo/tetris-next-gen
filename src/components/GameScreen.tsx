'use client';

import { useReducer, useEffect, useRef } from 'react';
import { reducer, createInitialState } from '@/lib/reducer';
import { hardDropTarget } from '@/lib/tetrisGame';
import { loadHighScore } from '@/lib/storage';
import { LINE_CLEAR_ANIM_MS, dropIntervalForLevel } from '@/lib/constants';
import {
  playMove,
  playRotate,
  playHardDrop,
  playLineClear,
  playLevelUp,
  playHold,
  playGameOver,
} from '@/lib/sound';
import { GameBoard } from './GameBoard';
import { NextQueue } from './NextQueue';
import { HoldBox } from './HoldBox';
import { ScorePanel } from './ScorePanel';
import { TitleScreen } from './TitleScreen';
import { PauseOverlay } from './PauseOverlay';
import { GameOverScreen } from './GameOverScreen';
import { TouchControls } from './TouchControls';

const INACTIVE_PHASES = new Set(['title', 'paused', 'gameover', 'lineClear']);

export function GameScreen() {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createInitialState(loadHighScore())
  );

  const ghost =
    state.active && state.phase === 'falling'
      ? hardDropTarget(state.board, state.active)
      : null;

  // 効果音: フェーズ/レベルの変化を検知して鳴らす
  const prevPhaseRef = useRef(state.phase);
  const prevLevelRef = useRef(state.level);
  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    const prevLevel = prevLevelRef.current;
    prevPhaseRef.current = state.phase;
    prevLevelRef.current = state.level;

    if (state.phase === 'lineClear' && prevPhase !== 'lineClear') {
      playLineClear(state.clearingRows.length);
    }
    if (state.phase === 'gameover' && prevPhase !== 'gameover') {
      playGameOver();
    }
    if (state.phase === 'falling' && state.level > prevLevel) {
      playLevelUp();
    }
  }, [state.phase, state.clearingRows.length, state.level]);

  // ラインクリア演出のあと、実際に行を詰めて次のピースへ進める
  useEffect(() => {
    if (state.phase !== 'lineClear') return;
    const id = setTimeout(() => dispatch({ type: 'LOCK_RESOLVED' }), LINE_CLEAR_ANIM_MS);
    return () => clearTimeout(id);
  }, [state.phase, state.clearingRows]);

  // 落下ループ
  useEffect(() => {
    if (INACTIVE_PHASES.has(state.phase)) return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), dropIntervalForLevel(state.level));
    return () => clearInterval(id);
  }, [state.phase, state.level]);

  // キーボード入力
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault(); playMove(); dispatch({ type: 'MOVE', dx: -1 }); break;
        case 'ArrowRight':
          e.preventDefault(); playMove(); dispatch({ type: 'MOVE', dx: 1 }); break;
        case 'ArrowDown':
          e.preventDefault(); dispatch({ type: 'SOFT_DROP' }); break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault(); playHardDrop(); dispatch({ type: 'HARD_DROP' }); break;
        case 'z':
        case 'Z':
          playRotate(); dispatch({ type: 'ROTATE', dir: -1 }); break;
        case 'x':
        case 'X':
          playRotate(); dispatch({ type: 'ROTATE', dir: 1 }); break;
        case 'c':
        case 'C':
          playHold(); dispatch({ type: 'HOLD' }); break;
        case 'p':
        case 'P':
          dispatch({ type: 'TOGGLE_PAUSE' }); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (state.phase === 'title') {
    return (
      <TitleScreen
        bestScore={state.bestScore}
        onStart={() => dispatch({ type: 'START' })}
      />
    );
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #0b1a3a 0%, #050510 60%)' }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${100 + i * 60}px`,
              height: `${100 + i * 60}px`,
              background: ['#5ad1ff', '#6b8bff', '#c88bff', '#ffe066', '#6bff9e', '#ff6b6b'][i],
              top: `${10 + i * 15}%`,
              left: `${5 + (i % 3) * 35}%`,
              filter: 'blur(40px)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3 w-full max-w-sm">
        <ScorePanel
          score={state.score}
          bestScore={state.bestScore}
          level={state.level}
          lines={state.lines}
        />

        <div className="flex gap-3 items-start">
          <div className="flex flex-col gap-3 pt-1">
            <HoldBox hold={state.hold} canHold={state.canHold} />
            <NextQueue queue={state.queue.slice(0, 3)} />
          </div>

          <div className="relative">
            <GameBoard
              board={state.board}
              active={state.active}
              ghost={ghost}
              clearingRows={state.clearingRows}
            />

            {state.phase === 'paused' && (
              <PauseOverlay
                onResume={() => dispatch({ type: 'TOGGLE_PAUSE' })}
                onRestart={() => dispatch({ type: 'RESTART' })}
              />
            )}

            {state.phase === 'gameover' && (
              <GameOverScreen
                score={state.score}
                bestScore={state.bestScore}
                lines={state.lines}
                onRetry={() => dispatch({ type: 'RESTART' })}
              />
            )}
          </div>
        </div>

        <TouchControls
          onMoveLeft={() => { playMove(); dispatch({ type: 'MOVE', dx: -1 }); }}
          onMoveRight={() => { playMove(); dispatch({ type: 'MOVE', dx: 1 }); }}
          onSoftDrop={() => dispatch({ type: 'SOFT_DROP' })}
          onHardDrop={() => { playHardDrop(); dispatch({ type: 'HARD_DROP' }); }}
          onRotateLeft={() => { playRotate(); dispatch({ type: 'ROTATE', dir: -1 }); }}
          onRotateRight={() => { playRotate(); dispatch({ type: 'ROTATE', dir: 1 }); }}
          onHold={() => { playHold(); dispatch({ type: 'HOLD' }); }}
        />
      </div>
    </div>
  );
}
