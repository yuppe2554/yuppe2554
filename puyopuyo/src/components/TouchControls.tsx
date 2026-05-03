import { useRef, useCallback } from 'react';

interface Props {
  move: (dir: -1 | 1) => void;
  rotateCw: () => void;
  rotateCcw: () => void;
  hardDrop: () => void;
  setSoftDrop: (active: boolean) => void;
}

const MOVE_DELAY = 160;
const MOVE_INTERVAL = 50;
const SOFT_INTERVAL = 80;

function btnStyle(color: string): React.CSSProperties {
  return {
    flex: 1,
    height: 64,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `${color}1a`,
    border: `2px solid ${color}55`,
    color,
    fontSize: 22,
    fontWeight: 900,
    userSelect: 'none',
    touchAction: 'none',
    WebkitTapHighlightColor: 'transparent',
    cursor: 'pointer',
    boxShadow: `0 2px 10px ${color}22`,
  };
}

export function TouchControls({ move, rotateCw, rotateCcw, hardDrop, setSoftDrop }: Props) {
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const startRepeat = useCallback((id: string, fn: () => void, interval: number, delay: number) => {
    fn();
    const tick = () => {
      fn();
      timers.current.set(id, setTimeout(tick, interval));
    };
    timers.current.set(id, setTimeout(tick, delay));
  }, []);

  const stopRepeat = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t !== undefined) clearTimeout(t);
    timers.current.delete(id);
  }, []);

  return (
    <div style={{
      display: 'flex',
      gap: 6,
      padding: '8px 8px calc(8px + env(safe-area-inset-bottom))',
      userSelect: 'none',
      width: '100%',
    }}>
      {/* ← Left */}
      <div
        style={btnStyle('#88aaff')}
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); startRepeat('l', () => move(-1), MOVE_INTERVAL, MOVE_DELAY); }}
        onPointerUp={() => stopRepeat('l')}
        onPointerCancel={() => stopRepeat('l')}
      >◀</div>

      {/* → Right */}
      <div
        style={btnStyle('#88aaff')}
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); startRepeat('r', () => move(1), MOVE_INTERVAL, MOVE_DELAY); }}
        onPointerUp={() => stopRepeat('r')}
        onPointerCancel={() => stopRepeat('r')}
      >▶</div>

      {/* ▼ Soft drop */}
      <div
        style={btnStyle('#44ffaa')}
        onPointerDown={e => {
          e.currentTarget.setPointerCapture(e.pointerId);
          startRepeat('s', () => setSoftDrop(true), SOFT_INTERVAL, 0);
        }}
        onPointerUp={() => { stopRepeat('s'); setSoftDrop(false); }}
        onPointerCancel={() => { stopRepeat('s'); setSoftDrop(false); }}
      >▼</div>

      {/* ⬇ Hard drop */}
      <div
        style={btnStyle('#ff9944')}
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); hardDrop(); }}
      >⬇</div>

      {/* ↺ Rotate CCW */}
      <div
        style={btnStyle('#ee88ff')}
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); rotateCcw(); }}
      >↺</div>

      {/* ↻ Rotate CW */}
      <div
        style={btnStyle('#ffdd44')}
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); rotateCw(); }}
      >↻</div>
    </div>
  );
}
