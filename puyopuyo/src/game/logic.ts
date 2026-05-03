import type { Board, Cell, Piece, GameState, Rotation } from './types';
import {
  COLS, ROWS, SPAWN_X, ACTIVE_COLORS, CHILD_OFFSETS,
  CHAIN_BONUSES,
} from './constants';

export function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => new Array<Cell>(COLS).fill(null));
}

export function createEmptyMask(): boolean[][] {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
}

export function pickColors(): [import('./types').Color, import('./types').Color] {
  const a = ACTIVE_COLORS[Math.floor(Math.random() * ACTIVE_COLORS.length)];
  const b = ACTIVE_COLORS[Math.floor(Math.random() * ACTIVE_COLORS.length)];
  return [a, b];
}

export function childPos(piece: Piece): [number, number] {
  const [dx, dy] = CHILD_OFFSETS[piece.rot];
  return [piece.px + dx, piece.py + dy];
}

export function isCellValid(board: Board, col: number, row: number): boolean {
  if (col < 0 || col >= COLS) return false;
  if (row >= ROWS) return false;
  if (row < 0) return true;  // above board = ok
  return board[row][col] === null;
}

export function isPieceValid(board: Board, piece: Piece): boolean {
  const [cx, cy] = childPos(piece);
  return isCellValid(board, piece.px, piece.py) && isCellValid(board, cx, cy);
}

export function placePiece(board: Board, piece: Piece): Board {
  const newBoard = board.map(r => [...r]);
  const [cx, cy] = childPos(piece);
  if (piece.py >= 0) newBoard[piece.py][piece.px] = piece.pivotColor;
  if (cy >= 0) newBoard[cy][cx] = piece.childColor;
  return newBoard;
}

export function rotateCW(piece: Piece, board: Board): Piece {
  const newRot = ((piece.rot + 1) % 4) as Rotation;
  const attempts: Piece[] = [
    { ...piece, rot: newRot },
    { ...piece, rot: newRot, px: piece.px - 1 },
    { ...piece, rot: newRot, px: piece.px + 1 },
    { ...piece, rot: newRot, py: piece.py - 1 },
    { ...piece, rot: newRot, px: piece.px - 1, py: piece.py - 1 },
    { ...piece, rot: newRot, px: piece.px + 1, py: piece.py - 1 },
  ];
  return attempts.find(p => isPieceValid(board, p)) ?? piece;
}

export function rotateCCW(piece: Piece, board: Board): Piece {
  const newRot = ((piece.rot + 3) % 4) as Rotation;
  const attempts: Piece[] = [
    { ...piece, rot: newRot },
    { ...piece, rot: newRot, px: piece.px + 1 },
    { ...piece, rot: newRot, px: piece.px - 1 },
    { ...piece, rot: newRot, py: piece.py - 1 },
  ];
  return attempts.find(p => isPieceValid(board, p)) ?? piece;
}

export function ghostPiece(piece: Piece, board: Board): Piece {
  let g = { ...piece };
  while (isPieceValid(board, { ...g, py: g.py + 1 })) {
    g = { ...g, py: g.py + 1 };
  }
  return g;
}

export function findGroups(board: Board): [number, number][][] {
  const visited = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
  const groups: [number, number][][] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] !== null && !visited[row][col]) {
        const color = board[row][col];
        const group: [number, number][] = [];
        const queue: [number, number][] = [[row, col]];
        visited[row][col] = true;

        while (queue.length > 0) {
          const [r, c] = queue.shift()!;
          group.push([r, c]);
          for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS &&
              !visited[nr][nc] && board[nr][nc] === color) {
              visited[nr][nc] = true;
              queue.push([nr, nc]);
            }
          }
        }

        if (group.length >= 4) groups.push(group);
      }
    }
  }
  return groups;
}

export function buildPopMask(groups: [number, number][][]): boolean[][] {
  const mask = createEmptyMask();
  for (const group of groups) {
    for (const [r, c] of group) mask[r][c] = true;
  }
  return mask;
}

export function applyGravity(board: Board): Board {
  const newBoard = createEmptyBoard();
  for (let col = 0; col < COLS; col++) {
    const cells: Cell[] = [];
    for (let row = 0; row < ROWS; row++) {
      if (board[row][col] !== null) cells.push(board[row][col]);
    }
    let row = ROWS - 1;
    for (let i = cells.length - 1; i >= 0; i--) {
      newBoard[row][col] = cells[i];
      row--;
    }
  }
  return newBoard;
}

export function clearMasked(board: Board, mask: boolean[][]): Board {
  return board.map((row, r) => row.map((cell, c) => (mask[r][c] ? null : cell)));
}

export function calcScore(cleared: number, chain: number): number {
  const bonus = CHAIN_BONUSES[Math.min(chain - 1, CHAIN_BONUSES.length - 1)];
  return cleared * 10 * (bonus + 1);
}

export function spawnPiece(state: GameState): GameState {
  const [pivotColor, childColor] = state.next;

  if (state.board[0][SPAWN_X] !== null || state.board[1]?.[SPAWN_X] !== null) {
    return { ...state, phase: 'gameover', piece: null };
  }

  const piece: Piece = {
    px: SPAWN_X, py: 0,
    rot: 0,
    pivotColor, childColor,
  };

  return {
    ...state,
    piece,
    next: pickColors(),
    chain: 0,
    phase: 'falling',
    popMask: createEmptyMask(),
  };
}

export function countPopped(mask: boolean[][]): number {
  return mask.flat().filter(Boolean).length;
}

export function getLevel(score: number): number {
  if (score >= 22000) return 7;
  if (score >= 15000) return 6;
  if (score >= 10000) return 5;
  if (score >= 6000)  return 4;
  if (score >= 3000)  return 3;
  if (score >= 1000)  return 2;
  return 1;
}
