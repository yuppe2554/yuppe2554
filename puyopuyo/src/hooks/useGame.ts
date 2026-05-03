import { useReducer, useEffect, useRef, useCallback, useState } from 'react';
import type { GameState, Phase } from '../game/types';
import {
  createEmptyBoard, createEmptyMask, pickColors,
  isPieceValid, placePiece, rotateCW, rotateCCW,
  ghostPiece, findGroups, buildPopMask,
  applyGravity, clearMasked, calcScore, spawnPiece, countPopped,
  getLevel,
} from '../game/logic';
import {
  POP_DURATION, DROP_DURATION, LEVEL_INTERVALS,
} from '../game/constants';

const LS_KEY = 'puyopuyo-best';

type Action =
  | { type: 'FALL_TICK' }
  | { type: 'MOVE'; dir: -1 | 1 }
  | { type: 'ROTATE_CW' }
  | { type: 'ROTATE_CCW' }
  | { type: 'SOFT_DROP' }
  | { type: 'HARD_DROP' }
  | { type: 'POP_DONE' }
  | { type: 'PAUSE' }
  | { type: 'RESTART' }
  | { type: 'START' };

function initialState(): GameState {
  return {
    board: createEmptyBoard(),
    piece: null,
    next: pickColors(),
    score: 0,
    chain: 0,
    maxChain: 0,
    phase: 'start',
    popMask: createEmptyMask(),
    paused: false,
  };
}

// Shared lock logic used by FALL_TICK and SOFT_DROP
function lockPiece(state: GameState, score: number): GameState {
  const placedBoard = placePiece(state.board, state.piece!);
  const newBoard = applyGravity(placedBoard);
  const groups = findGroups(newBoard);
  if (groups.length > 0) {
    return {
      ...state, board: newBoard, piece: null, score,
      phase: 'popping', popMask: buildPopMask(groups), chain: 1,
    };
  }
  return spawnPiece({ ...state, board: newBoard, piece: null, score, chain: 0 });
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START':
    case 'RESTART': {
      return spawnPiece({ ...initialState(), phase: 'falling' });
    }

    case 'FALL_TICK': {
      if (!state.piece || state.phase !== 'falling' || state.paused) return state;
      const moved = { ...state.piece, py: state.piece.py + 1 };
      if (isPieceValid(state.board, moved)) return { ...state, piece: moved };
      return lockPiece(state, state.score);
    }

    case 'SOFT_DROP': {
      if (!state.piece || state.phase !== 'falling' || state.paused) return state;
      const moved = { ...state.piece, py: state.piece.py + 1 };
      if (isPieceValid(state.board, moved)) {
        return { ...state, piece: moved, score: state.score + 1 };
      }
      // Bottom reached — lock immediately (no extra points)
      return lockPiece(state, state.score);
    }

    case 'HARD_DROP': {
      if (!state.piece || state.phase !== 'falling' || state.paused) return state;
      const dropped = ghostPiece(state.piece, state.board);
      const rows = dropped.py - state.piece.py;
      const newScore = state.score + rows * 2;
      const placedBoard = placePiece(state.board, dropped);
      const newBoard = applyGravity(placedBoard);
      const groups = findGroups(newBoard);
      if (groups.length > 0) {
        return {
          ...state, board: newBoard, piece: null, score: newScore,
          phase: 'popping', popMask: buildPopMask(groups), chain: 1,
        };
      }
      return spawnPiece({ ...state, board: newBoard, piece: null, score: newScore, chain: 0 });
    }

    case 'POP_DONE': {
      if (state.phase !== 'popping') return state;
      const cleared = countPopped(state.popMask);
      const scoreGain = calcScore(cleared, state.chain);
      const newBoard = applyGravity(clearMasked(state.board, state.popMask));
      const newScore = state.score + scoreGain;
      const newMaxChain = Math.max(state.maxChain, state.chain);
      const groups = findGroups(newBoard);
      if (groups.length > 0) {
        return {
          ...state, board: newBoard, score: newScore,
          phase: 'popping', popMask: buildPopMask(groups),
          chain: state.chain + 1, maxChain: newMaxChain,
        };
      }
      return spawnPiece({
        ...state, board: newBoard, score: newScore,
        popMask: createEmptyMask(), maxChain: newMaxChain,
      });
    }

    case 'MOVE': {
      if (!state.piece || state.phase !== 'falling' || state.paused) return state;
      const moved = { ...state.piece, px: state.piece.px + action.dir };
      if (isPieceValid(state.board, moved)) return { ...state, piece: moved };
      return state;
    }

    case 'ROTATE_CW': {
      if (!state.piece || state.phase !== 'falling' || state.paused) return state;
      return { ...state, piece: rotateCW(state.piece, state.board) };
    }

    case 'ROTATE_CCW': {
      if (!state.piece || state.phase !== 'falling' || state.paused) return state;
      return { ...state, piece: rotateCCW(state.piece, state.board) };
    }

    case 'PAUSE': {
      if (state.phase === 'gameover' || state.phase === 'start') return state;
      return { ...state, paused: !state.paused };
    }

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // Best score — persisted in localStorage
  const [bestScore, setBestScore] = useState<number>(() => {
    try { return parseInt(localStorage.getItem(LS_KEY) ?? '0', 10) || 0; }
    catch { return 0; }
  });

  // Save best score on game over
  useEffect(() => {
    if (state.phase !== 'gameover') return;
    setBestScore(prev => {
      const next = Math.max(prev, state.score);
      try { localStorage.setItem(LS_KEY, String(next)); } catch {}
      return next;
    });
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Level & fall interval (derived — no store in state)
  const level = getLevel(state.score);
  const fallInterval = LEVEL_INTERVALS[level - 1];

  // Main fall timer — resets only when phase, paused, or level changes
  useEffect(() => {
    if (state.phase !== 'falling' || state.paused) return;
    const id = setInterval(() => dispatch({ type: 'FALL_TICK' }), fallInterval);
    return () => clearInterval(id);
  }, [state.phase, state.paused, fallInterval]);

  // Popping phase timeout
  useEffect(() => {
    if (state.phase !== 'popping') return;
    const t = setTimeout(() => dispatch({ type: 'POP_DONE' }), POP_DURATION + DROP_DURATION);
    return () => clearTimeout(t);
  }, [state.phase, state.chain]);

  // Soft drop: dispatch once per keyboard repeat call
  const softDropRef = useRef(false);
  const setSoftDrop = useCallback((active: boolean) => {
    softDropRef.current = active;
    if (active) dispatch({ type: 'SOFT_DROP' });
  }, []);

  const move      = useCallback((dir: -1 | 1) => dispatch({ type: 'MOVE', dir }), []);
  const rotateCw  = useCallback(() => dispatch({ type: 'ROTATE_CW' }), []);
  const rotateCcw = useCallback(() => dispatch({ type: 'ROTATE_CCW' }), []);
  const hardDrop  = useCallback(() => dispatch({ type: 'HARD_DROP' }), []);
  const pause     = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const start     = useCallback(() => dispatch({ type: 'START' }), []);
  const restart   = useCallback(() => dispatch({ type: 'RESTART' }), []);

  const ghost = state.piece && state.phase === 'falling'
    ? ghostPiece(state.piece, state.board)
    : null;

  return { state, ghost, level, bestScore, move, rotateCw, rotateCcw, hardDrop, pause, start, restart, setSoftDrop };
}

export type { Phase };
