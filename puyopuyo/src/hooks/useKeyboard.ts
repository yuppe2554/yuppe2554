import { useEffect, useRef } from 'react';

interface Handlers {
  move: (dir: -1 | 1) => void;
  rotateCw: () => void;
  rotateCcw: () => void;
  hardDrop: () => void;
  pause: () => void;
  setSoftDrop: (active: boolean) => void;
}

const REPEAT_DELAY = 160;
const REPEAT_INTERVAL = 50;

export function useKeyboard(handlers: Handlers, active: boolean) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!active) return;

    const held = new Map<string, ReturnType<typeof setTimeout>>();

    function press(key: string) {
      const h = handlersRef.current;
      switch (key) {
        case 'ArrowLeft':  h.move(-1); break;
        case 'ArrowRight': h.move(1); break;
        case 'ArrowUp':    h.rotateCw(); break;
        case 'KeyZ':
        case 'KeyX':       h.rotateCcw(); break;
        case 'ArrowDown':  h.setSoftDrop(true); break;
        case 'Space':      h.hardDrop(); break;
        case 'KeyP':
        case 'Escape':     h.pause(); break;
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      const key = e.code;
      if (held.has(key)) return;

      e.preventDefault();
      press(key);

      if (['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(key)) {
        const repeat = () => {
          press(key);
          held.set(key, setTimeout(repeat, REPEAT_INTERVAL));
        };
        held.set(key, setTimeout(repeat, REPEAT_DELAY));
      } else {
        held.set(key, -1 as unknown as ReturnType<typeof setTimeout>);
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      const key = e.code;
      const t = held.get(key);
      if (t !== undefined && t !== (-1 as unknown)) clearTimeout(t);
      held.delete(key);
      if (key === 'ArrowDown') handlersRef.current.setSoftDrop(false);
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      held.forEach(t => { if (t !== (-1 as unknown)) clearTimeout(t); });
    };
  }, [active]);
}
