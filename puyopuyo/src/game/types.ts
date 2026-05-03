export type Color = 'red' | 'green' | 'blue' | 'yellow' | 'purple';
export type Cell = Color | null;
export type Board = Cell[][];

export type Rotation = 0 | 1 | 2 | 3;
// 0 = child above, 1 = child right, 2 = child below, 3 = child left

export interface Piece {
  px: number;
  py: number;
  rot: Rotation;
  pivotColor: Color;
  childColor: Color;
}

export type Phase = 'falling' | 'popping' | 'gameover' | 'start';

export interface GameState {
  board: Board;
  piece: Piece | null;
  next: [Color, Color];
  score: number;
  chain: number;
  maxChain: number;
  phase: Phase;
  popMask: boolean[][];
  paused: boolean;
}
