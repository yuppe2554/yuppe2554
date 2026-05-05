import { useReducer, useEffect, useCallback, useState } from 'react';
import type { GameState } from '../game/types';
import {
  createEmptyMask, isPieceValid, placePiece,
  rotateCW, rotateCCW, ghostPiece, findGroups, buildPopMask,
  applyGravity, clearMasked, calcScore, spawnPiece, countPopped,
} from '../game/logic';
import { POP_DURATION, DROP_DURATION } from '../game/constants';
import { TUTORIAL_STEPS, type TutorialStep } from '../game/tutorialSteps';

type Action =
  | { type: 'FALL_TICK' }
  | { type: 'MOVE'; dir: -1 | 1 }
  | { type: 'ROTATE_CW' }
  | { type: 'ROTATE_CCW' }
  | { type: 'SOFT_DROP' }
  | { type: 'HARD_DROP' }
  | { type: 'POP_DONE' }
  | { type: 'RESET'; step: TutorialStep };

function makeStepState(step: TutorialStep): GameState {
  return {
    board: step.makeBoard(),
    piece: { ...step.initialPiece },
    next: [step.initialNext[0], step.initialNext[1]],
    score: 0,
    chain: 0,
    maxChain: 0,
    phase: 'falling',
    popMask: createEmptyMask(),
    paused: false,
  };
}

function lockPiece(state: GameState): GameState {
  const board = applyGravity(placePiece(state.board, state.piece!));
  const groups = findGroups(board);
  if (groups.length > 0) {
    return { ...state, board, piece: null, phase: 'popping', popMask: buildPopMask(groups), chain: 1 };
  }
  return spawnPiece({ ...state, board, piece: null, chain: 0 });
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'RESET':
      return makeStepState(action.step);

    case 'FALL_TICK': {
      if (!state.piece || state.phase !== 'falling') return state;
      const moved = { ...state.piece, py: state.piece.py + 1 };
      return isPieceValid(state.board, moved) ? { ...state, piece: moved } : lockPiece(state);
    }

    case 'SOFT_DROP': {
      if (!state.piece || state.phase !== 'falling') return state;
      const moved = { ...state.piece, py: state.piece.py + 1 };
      if (isPieceValid(state.board, moved)) return { ...state, piece: moved, score: state.score + 1 };
      return lockPiece(state);
    }

    case 'HARD_DROP': {
      if (!state.piece || state.phase !== 'falling') return state;
      const dropped = ghostPiece(state.piece, state.board);
      const score = state.score + (dropped.py - state.piece.py) * 2;
      const board = applyGravity(placePiece(state.board, dropped));
      const groups = findGroups(board);
      if (groups.length > 0) {
        return { ...state, board, piece: null, score, phase: 'popping', popMask: buildPopMask(groups), chain: 1 };
      }
      return spawnPiece({ ...state, board, piece: null, score, chain: 0 });
    }

    case 'POP_DONE': {
      if (state.phase !== 'popping') return state;
      const score = state.score + calcScore(countPopped(state.popMask), state.chain);
      const board = applyGravity(clearMasked(state.board, state.popMask));
      const maxChain = Math.max(state.maxChain, state.chain);
      const groups = findGroups(board);
      if (groups.length > 0) {
        return { ...state, board, score, phase: 'popping', popMask: buildPopMask(groups), chain: state.chain + 1, maxChain };
      }
      return spawnPiece({ ...state, board, score, popMask: createEmptyMask(), maxChain });
    }

    case 'MOVE': {
      if (!state.piece || state.phase !== 'falling') return state;
      const moved = { ...state.piece, px: state.piece.px + action.dir };
      return isPieceValid(state.board, moved) ? { ...state, piece: moved } : state;
    }

    case 'ROTATE_CW': {
      if (!state.piece || state.phase !== 'falling') return state;
      return { ...state, piece: rotateCW(state.piece, state.board) };
    }

    case 'ROTATE_CCW': {
      if (!state.piece || state.phase !== 'falling') return state;
      return { ...state, piece: rotateCCW(state.piece, state.board) };
    }

    default:
      return state;
  }
}

export function useTutorial() {
  const [stepIndex, setStepIndex] = useState(0);
  const [stepComplete, setStepComplete] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(false);

  const step = TUTORIAL_STEPS[stepIndex];
  const [state, dispatch] = useReducer(reducer, undefined, () => makeStepState(step));

  // Detect step completion
  useEffect(() => {
    if (!stepComplete && step.isComplete(state)) {
      setStepComplete(true);
    }
  }, [state, step, stepComplete]);

  // Auto-reset if board fills up (gameover during tutorial)
  useEffect(() => {
    if (state.phase === 'gameover') {
      dispatch({ type: 'RESET', step: TUTORIAL_STEPS[stepIndex] });
    }
  }, [state.phase, stepIndex]);

  // Fall timer — slower than normal to give beginners time
  useEffect(() => {
    if (state.phase !== 'falling' || stepComplete) return;
    const id = setInterval(() => dispatch({ type: 'FALL_TICK' }), 900);
    return () => clearInterval(id);
  }, [state.phase, stepComplete]);

  // Pop timer
  useEffect(() => {
    if (state.phase !== 'popping') return;
    const t = setTimeout(() => dispatch({ type: 'POP_DONE' }), POP_DURATION + DROP_DURATION);
    return () => clearTimeout(t);
  }, [state.phase, state.chain]);

  const nextStep = useCallback(() => {
    const next = stepIndex + 1;
    if (next < TUTORIAL_STEPS.length) {
      setStepIndex(next);
      setStepComplete(false);
      dispatch({ type: 'RESET', step: TUTORIAL_STEPS[next] });
    } else {
      setTutorialDone(true);
    }
  }, [stepIndex]);

  const setSoftDrop = useCallback((active: boolean) => {
    if (active) dispatch({ type: 'SOFT_DROP' });
  }, []);

  const move = useCallback((dir: -1 | 1) => dispatch({ type: 'MOVE', dir }), []);
  const rotateCw = useCallback(() => dispatch({ type: 'ROTATE_CW' }), []);
  const rotateCcw = useCallback(() => dispatch({ type: 'ROTATE_CCW' }), []);
  const hardDrop = useCallback(() => dispatch({ type: 'HARD_DROP' }), []);

  const ghost = state.piece && state.phase === 'falling'
    ? ghostPiece(state.piece, state.board)
    : null;

  return {
    state, ghost, step, stepIndex, stepComplete, tutorialDone,
    move, rotateCw, rotateCcw, hardDrop, setSoftDrop, nextStep,
  };
}
