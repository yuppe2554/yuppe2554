import type { Color } from './types';

export const COLS = 6;
export const ROWS = 12;
export const SPAWN_X = 2;
export const CELL_SIZE = 48;

export const ACTIVE_COLORS: Color[] = ['red', 'green', 'blue', 'yellow'];

export const CHILD_OFFSETS: [number, number][] = [
  [0, -1],  // rot 0: child above
  [1, 0],   // rot 1: child right
  [0, 1],   // rot 2: child below
  [-1, 0],  // rot 3: child left
];

export const POP_DURATION = 420;
export const DROP_DURATION = 180;
export const BASE_FALL_INTERVAL = 650;
export const SOFT_DROP_INTERVAL = 60;

// Level 1–7 thresholds (score) and corresponding fall intervals (ms)
export const LEVEL_THRESHOLDS = [0, 1000, 3000, 6000, 10000, 15000, 22000];
export const LEVEL_INTERVALS   = [650,  540,  430,  330,   240,   170,  120];

// Chain bonus multipliers (index = chain - 1)
export const CHAIN_BONUSES = [0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256];

export const COLOR_CONFIG: Record<
  Color,
  { base: string; light: string; dark: string; glow: string }
> = {
  red:    { base: '#ff3355', light: '#ff6680', dark: '#cc2244', glow: 'rgba(255,51,85,0.65)' },
  green:  { base: '#22dd77', light: '#55ffaa', dark: '#11aa55', glow: 'rgba(34,221,119,0.65)' },
  blue:   { base: '#3388ff', light: '#66aaff', dark: '#2266cc', glow: 'rgba(51,136,255,0.65)' },
  yellow: { base: '#ffcc00', light: '#ffee66', dark: '#cc9900', glow: 'rgba(255,204,0,0.65)' },
  purple: { base: '#bb33ff', light: '#dd77ff', dark: '#8822cc', glow: 'rgba(187,51,255,0.65)' },
};
