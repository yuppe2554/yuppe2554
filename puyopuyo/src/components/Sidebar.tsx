import { motion } from 'framer-motion';
import type { Color } from '../game/types';
import { PuyoCell } from './PuyoCell';

interface Props {
  score: number;
  maxChain: number;
  bestScore: number;
  level: number;
  next: [Color, Color];
}

const NEXT_CELL = 42;

const panel: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(120,120,255,0.18)',
  borderRadius: 12,
  padding: '16px 20px',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 24px rgba(0,0,50,0.4)',
};

const label: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '2.5px',
  textTransform: 'uppercase',
  color: 'rgba(160,160,255,0.7)',
  marginBottom: 6,
};

const LEVEL_COLORS = ['', '#88aaff', '#44ffaa', '#ffdd44', '#ff9944', '#ff5544', '#ff44cc', '#cc44ff'];

export function Sidebar({ score, maxChain, bestScore, level, next }: Props) {
  const [pivotColor, childColor] = next;
  const levelColor = LEVEL_COLORS[level] ?? '#ff44cc';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: 148,
    }}>
      {/* Level */}
      <div style={panel}>
        <div style={label}>Level</div>
        <motion.div
          key={level}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: levelColor,
            textShadow: `0 0 16px ${levelColor}`,
            lineHeight: 1,
          }}
        >
          {level}
        </motion.div>
        <div style={{ fontSize: 10, color: 'rgba(160,160,200,0.5)', marginTop: 4 }}>
          {level < 7 ? `next: ${[1000, 3000, 6000, 10000, 15000, 22000][level - 1].toLocaleString()}` : 'MAX'}
        </div>
      </div>

      {/* Score */}
      <div style={panel}>
        <div style={label}>Score</div>
        <motion.div
          key={score}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.15 }}
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: '#e0e0ff',
            textShadow: '0 0 12px rgba(160,160,255,0.6)',
            letterSpacing: '-0.5px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {score.toLocaleString()}
        </motion.div>
        {bestScore > 0 && (
          <div style={{ fontSize: 10, color: 'rgba(160,160,200,0.5)', marginTop: 4 }}>
            best: {bestScore.toLocaleString()}
          </div>
        )}
      </div>

      {/* Max chain */}
      <div style={panel}>
        <div style={label}>Best Chain</div>
        <div style={{
          fontSize: 32,
          fontWeight: 900,
          color: maxChain >= 3 ? '#ffdd44' : '#e0e0ff',
          textShadow: maxChain >= 3 ? '0 0 16px #ffaa00' : '0 0 12px rgba(160,160,255,0.6)',
        }}>
          {maxChain > 0 ? `${maxChain}x` : '--'}
        </div>
      </div>

      {/* Next piece */}
      <div style={panel}>
        <div style={label}>Next</div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          marginTop: 6,
        }}>
          {/* pivot on top, child below — matches default rot=0 spawn */}
          <div style={{ width: NEXT_CELL, height: NEXT_CELL }}>
            <PuyoCell color={pivotColor} size={NEXT_CELL} />
          </div>
          <div style={{ width: NEXT_CELL, height: NEXT_CELL }}>
            <PuyoCell color={childColor} size={NEXT_CELL} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ ...panel, fontSize: 11, color: 'rgba(160,160,200,0.7)', lineHeight: 1.8 }}>
        <div style={label}>Controls</div>
        <div>← → Move</div>
        <div>↑ Rotate CW</div>
        <div>Z Rotate CCW</div>
        <div>↓ Soft drop</div>
        <div>Space Hard drop</div>
        <div>P / Esc Pause</div>
      </div>
    </div>
  );
}
