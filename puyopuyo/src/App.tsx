import { useCallback } from 'react';
import { useGame } from './hooks/useGame';
import { useKeyboard } from './hooks/useKeyboard';
import { useCellSize } from './hooks/useCellSize';
import { Board } from './components/Board';
import { Sidebar } from './components/Sidebar';
import { Overlay } from './components/Overlay';
import { TouchControls } from './components/TouchControls';
import { PuyoCell } from './components/PuyoCell';
import { COLS, ROWS } from './game/constants';

const BG = 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0a1a 60%)';

const panel: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(120,120,255,0.18)',
  borderRadius: 10,
  backdropFilter: 'blur(8px)',
};

export default function App() {
  const { state, ghost, level, bestScore, move, rotateCw, rotateCcw, hardDrop, pause, start, restart, setSoftDrop } = useGame();
  const { cellSize, isMobile } = useCellSize();

  const kbActive = state.phase !== 'start' && state.phase !== 'gameover';
  useKeyboard({ move, rotateCw, rotateCcw, hardDrop, pause, setSoftDrop }, kbActive);

  const handleResume = useCallback(() => pause(), [pause]);

  const boardW = COLS * cellSize;
  const boardH = ROWS * cellSize;

  if (isMobile) {
    return (
      <div style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: BG,
        overflow: 'hidden',
        touchAction: 'none',
      }}>
        <Stars />

        {/* Compact header */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          gap: 8,
          position: 'relative',
          zIndex: 1,
          height: 64,
          flexShrink: 0,
        }}>
          {/* Score + Level */}
          <div style={{ ...panel, padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ fontSize: 9, letterSpacing: '2px', color: 'rgba(160,160,255,0.6)', textTransform: 'uppercase' }}>Score</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#e0e0ff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
              {state.score.toLocaleString()}
            </div>
          </div>

          {/* Next piece */}
          <div style={{ ...panel, padding: '4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ fontSize: 9, letterSpacing: '2px', color: 'rgba(160,160,255,0.6)', textTransform: 'uppercase' }}>Next</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <PuyoCell color={state.next[0]} size={22} />
              <PuyoCell color={state.next[1]} size={22} />
            </div>
          </div>

          {/* Level + Pause */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ ...panel, padding: '6px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, letterSpacing: '2px', color: 'rgba(160,160,255,0.6)', textTransform: 'uppercase' }}>Lv</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#88aaff' }}>{level}</div>
            </div>
            <button
              onClick={pause}
              style={{
                ...panel,
                padding: '8px 10px',
                color: 'rgba(180,180,255,0.8)',
                fontSize: 18,
                cursor: 'pointer',
                border: '1px solid rgba(120,120,255,0.25)',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
              }}
            >⏸</button>
          </div>
        </div>

        {/* Board area */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ position: 'relative', width: boardW, height: boardH }}>
            <Board
              board={state.board}
              piece={state.piece}
              ghost={ghost}
              popMask={state.popMask}
              chain={state.chain}
              cellSize={cellSize}
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
        </div>

        {/* Touch controls */}
        <div style={{ width: '100%', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <TouchControls
            move={move}
            rotateCw={rotateCw}
            rotateCcw={rotateCcw}
            hardDrop={hardDrop}
            setSoftDrop={setSoftDrop}
          />
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: BG,
      overflow: 'hidden',
    }}>
      <Stars />
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative', width: boardW, height: boardH }}>
          <Board
            board={state.board}
            piece={state.piece}
            ghost={ghost}
            popMask={state.popMask}
            chain={state.chain}
            cellSize={cellSize}
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
