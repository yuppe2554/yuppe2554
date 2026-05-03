import { useEffect, useState } from 'react';
import { COLS, ROWS, CELL_SIZE } from '../game/constants';

const BREAKPOINT = 640;
const HEADER_H = 64;
const CONTROLS_H = 84;
const V_PAD = 20;

function compute() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw >= BREAKPOINT) return { cellSize: CELL_SIZE, isMobile: false };
  const fromW = Math.floor((vw - 8) / COLS);
  const fromH = Math.floor((vh - HEADER_H - CONTROLS_H - V_PAD) / ROWS);
  return { cellSize: Math.min(fromW, fromH, CELL_SIZE), isMobile: true };
}

export function useCellSize() {
  const [val, setVal] = useState(compute);
  useEffect(() => {
    const onResize = () => setVal(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return val;
}
