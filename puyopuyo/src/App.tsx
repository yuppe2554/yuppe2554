import { useCallback } from 'react';
import { useGame } from './hooks/useGame';
import { useKeyboard } from './hooks/useKeyboard';
import { Board } from './components/Board';
import { Sidebar } from './components/Sidebar';
import { Overlay } from './components/Overlay';
import { COLS, ROWS, CELL_SIZE } from './game/constants';

const BOARD_W = COLS * CELL_SIZE;
const BOARD_H = ROWS * CELL_SIZE;

export default function App() {
  const { state, ghost, level, bestScore, move, rotateCw, rotateCcw, hardDrop, pause, start, restart, setSoftDrop } = useGame();

  const kbActive = state.phase !== 'start' && state.phase !== 'gameover';
  useKeyboard({ move, rotateCw, rotateCcw, hardDrop, pause, setSoftDrop }, kbActive);

  const handleResume = useCallback(() => pause(), [pause]);

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0a1a 60%)',
      overflow: 'hidden',
    }}>
      <Stars />

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative', width: BOARD_W, height: BOARD_H }}>
          <Board
            board={state.board}
            piece={state.piece}
            ghost={ghost}
            popMask={state.popMask}
            chain={state.chain}
          />
          <Overlay
            phase={state.phase}
            paused={state.paused}
            score={state.score}
            maxChain={state.maxChain}
            bestScore={bestScore}
            onStart={start}
            onRestart={restart}
            onResume={handleResume}
          />
        </div>
        <Sidebar
          score={state.score}
          maxChain={state.maxChain}
          bestScore={bestScore}
          level={level}
          next={state.next}
        />
      </div>
    </div>
  );
}

function Stars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: (i * 1.618 * 100) % 100,
    y: (i * 2.414 * 100) % 100,
    size: (i % 3) + 0.5,
    opacity: ((i % 5) + 1) * 0.08,
    delay: (i % 7) * 0.6,
    dur: 2 + (i % 4),
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {stars.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: 'white',
            opacity: s.opacity,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
