import { motion } from 'framer-motion';
import type { Color } from '../game/types';
import { COLOR_CONFIG } from '../game/constants';

interface Props {
  color: Color;
  popping?: boolean;
  ghost?: boolean;
  size?: number;
}

export function PuyoCell({ color, popping = false, ghost = false, size = 48 }: Props) {
  if (!color) return null;
  const cfg = COLOR_CONFIG[color];

  const gradient = `radial-gradient(circle at 35% 32%, ${cfg.light} 0%, ${cfg.base} 55%, ${cfg.dark} 100%)`;
  const shadow = ghost
    ? `0 0 6px 2px ${cfg.glow}, inset 0 1px 2px rgba(255,255,255,0.15)`
    : `0 0 14px 4px ${cfg.glow}, 0 0 4px 1px ${cfg.glow}, inset 0 2px 4px rgba(255,255,255,0.3)`;

  const eyeSize = Math.round(size * 0.17);
  const eyeTop = Math.round(size * 0.28);
  const eyeLeft1 = Math.round(size * 0.2);
  const eyeLeft2 = Math.round(size * 0.57);
  const mouthSize = Math.round(size * 0.22);
  const mouthTop = Math.round(size * 0.56);
  const mouthLeft = Math.round(size * 0.28);

  return (
    <motion.div
      style={{
        width: size,
        height: size,
        background: ghost ? 'transparent' : gradient,
        boxShadow: shadow,
        borderRadius: '42%',
        border: ghost ? `2px solid ${cfg.base}` : 'none',
        opacity: ghost ? 0.35 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
      animate={popping ? { scale: [1, 1.35, 0], opacity: [1, 0.8, 0] } : { scale: 1, opacity: 1 }}
      transition={popping
        ? { duration: 0.38, ease: 'easeOut' }
        : { duration: 0 }
      }
    >
      {!ghost && (
        <>
          {/* Shine highlight */}
          <div style={{
            position: 'absolute',
            top: '8%', left: '12%',
            width: '35%', height: '28%',
            background: 'rgba(255,255,255,0.45)',
            borderRadius: '50%',
            filter: 'blur(2px)',
          }} />
          {/* Eyes */}
          <div style={{
            position: 'absolute',
            width: eyeSize, height: eyeSize,
            top: eyeTop, left: eyeLeft1,
            background: '#1a0a1a',
            borderRadius: '50%',
            boxShadow: '0 0 2px rgba(0,0,0,0.8)',
          }} />
          <div style={{
            position: 'absolute',
            width: eyeSize, height: eyeSize,
            top: eyeTop, left: eyeLeft2,
            background: '#1a0a1a',
            borderRadius: '50%',
            boxShadow: '0 0 2px rgba(0,0,0,0.8)',
          }} />
          {/* Mouth */}
          <div style={{
            position: 'absolute',
            width: mouthSize, height: Math.round(mouthSize * 0.45),
            top: mouthTop, left: mouthLeft,
            border: '2px solid #1a0a1a',
            borderTop: 'none',
            borderRadius: '0 0 50% 50%',
          }} />
        </>
      )}
    </motion.div>
  );
}
