import type { Color, Cell, Piece, GameState } from './types';
import { createEmptyBoard } from './logic';

export type TutorialStep = {
  title: string
  instruction: string
  hint: string
  makeBoard: () => Cell[][]
  initialPiece: Piece
  initialNext: [Color, Color]
  isComplete: (state: GameState) => boolean
  highlightCol?: number
  completionMessage: string
}

function makeBoard(...cells: [col: number, row: number, color: Color][]): () => Cell[][] {
  return () => {
    const b = createEmptyBoard();
    for (const [col, row, color] of cells) b[row][col] = color;
    return b;
  };
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'ステップ 1 / 5',
    instruction: 'ピースを左右に動かそう',
    hint: 'キーボードの ← → を押してみよう',
    makeBoard: () => createEmptyBoard(),
    initialPiece: { px: 2, py: 0, rot: 0, pivotColor: 'red', childColor: 'blue' },
    initialNext: ['green', 'yellow'],
    isComplete: (s) => s.piece != null && s.piece.px !== 2,
    completionMessage: '完璧！左右移動できたね！',
  },
  {
    title: 'ステップ 2 / 5',
    instruction: 'ピースを回転させよう',
    hint: '↑ で時計回り、Z で反時計回りに回せるよ',
    makeBoard: () => createEmptyBoard(),
    initialPiece: { px: 2, py: 0, rot: 0, pivotColor: 'red', childColor: 'blue' },
    initialNext: ['green', 'yellow'],
    isComplete: (s) => s.piece != null && s.piece.rot !== 0,
    completionMessage: 'やった！回転できたね！',
  },
  {
    title: 'ステップ 3 / 5',
    instruction: 'ピースを落とそう',
    hint: 'スペースキーで一気に落とせるよ（ハードドロップ）',
    makeBoard: () => createEmptyBoard(),
    initialPiece: { px: 2, py: 0, rot: 0, pivotColor: 'red', childColor: 'blue' },
    initialNext: ['green', 'yellow'],
    // complete when new piece (green) has spawned after the red piece landed
    isComplete: (s) => s.phase === 'popping' || (s.piece !== null && s.piece.pivotColor === 'green'),
    completionMessage: 'ナイス！落とせたね！',
  },
  {
    title: 'ステップ 4 / 5',
    instruction: '4つつなげて消そう！',
    hint: '← キーで左端まで移動して、スペースで落としてね',
    makeBoard: makeBoard([0, 9, 'red'], [0, 10, 'red'], [0, 11, 'red']),
    initialPiece: { px: 2, py: 0, rot: 0, pivotColor: 'red', childColor: 'blue' },
    initialNext: ['green', 'yellow'],
    isComplete: (s) => s.popMask.some(row => row.some(Boolean)),
    highlightCol: 0,
    completionMessage: '消えた！4つつながると消えるんだね！',
  },
  {
    title: 'ステップ 5 / 5',
    instruction: '連鎖を体験しよう！',
    hint: 'スペースキーでそのまま落としてみよう',
    // row 11: red at 0,1,3 (gap at 2) — piece fills col 2 → 4 reds pop
    // row 10: blue at 0,1,3 — after reds pop blues fall → 4 blues → chain!
    makeBoard: makeBoard(
      [0, 11, 'red'], [1, 11, 'red'], [3, 11, 'red'],
      [0, 10, 'blue'], [1, 10, 'blue'], [3, 10, 'blue'],
    ),
    initialPiece: { px: 2, py: 0, rot: 0, pivotColor: 'red', childColor: 'blue' },
    initialNext: ['green', 'yellow'],
    isComplete: (s) => s.chain >= 2,
    completionMessage: '連鎖！消えた後にさらに消えたね！すごい！',
  },
];
