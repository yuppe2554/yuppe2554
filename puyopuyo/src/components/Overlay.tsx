import { motion } from 'framer-motion';
import type { Phase } from '../game/types';

interface Props {
  phase: Phase;
  paused: boolean;
  score: number;
  maxChain: number;
  bestScore: number;
  onStart: () => void;
  onRestart: () => void;
  onResume: () => void;
}

const backdrop: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(5,5,20,0.88)',
  borderRadius: 8,
  backdropFilter: 'blur(4px)',
  zIndex: 30,
};

const card: React.CSSProperties = {
  textAlign: 'center',
  padding: '32px 36px',
  background: 'rgba(30,30,60,0.9)',
  border: '1px solid rgba(120,120,255,0.3)',
  borderRadius: 20,
  boxShadow: '0 0 60px rgba(80,80,255,0.2)',
};

const title: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 900,
  letterSpacing: '-0.5px',
  marginBottom: 8,
};

const subtitle: React.CSSProperties = {
  fontSize: 13,
  color: 'rgba(180,180,220,0.7)',
  marginBottom: 28,
  letterSpacing: '0.5px',
};

function Btn({ children, onClick, primary }: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: 'block',
        width: '100%',
        padding: '12px 0',
        borderRadius: 12,
        border: primary ? 'none' : '1px solid rgba(120,120,255,0.4)',
        background: primary
          ? 'linear-gradient(135deg, #6644ff, #4422cc)'
          : 'rgba(255,255,255,0.05)',
        color: '#fff',
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        marginBottom: 10,
        boxShadow: primary ? '0 0 20px rgba(100,68,255,0.5)' : 'none',
        letterSpacing: '0.3px',
      }}
    >
      {children}
    </motion.button>
  );
}

export function Overlay({ phase, paused, score, maxChain, bestScore, onStart, onRestart, onResume }: Props) {
  if (phase === 'start') {
    return (
      <motion.div
        style={backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          style={card}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <div style={{ ...title, color: '#cc88ff', textShadow: '0 0 30px #aa44ff' }}>
            ぷよぷよ
          </div>
          <div style={{ ...title, fontSize: 18, color: 'rgba(200,180,255,0.8)', marginTop: -4 }}>
            PUYO PUYO
          </div>
          <div style={subtitle}>Connect 4 or more puyos to clear them!</div>
          <Btn onClick={onStart} primary>Start Game</Btn>
        </motion.div>
      </motion.div>
    );
  }

  if (phase === 'gameover') {
    return (
      <motion.div
        style={backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          style={card}
          initial={{ scale: 0.8, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        >
          <div style={{ ...title, color: '#ff4466', textShadow: '0 0 24px #ff2244' }}>
            Game Over
          </div>
          <div style={subtitle}>
            {score >= bestScore && bestScore > 0 ? '🏆 New Best Score!' : 'Better luck next time!'}
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'rgba(180,180,220,0.6)', letterSpacing: '2px', textTransform: 'uppercase' }}>Score</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#e0e0ff' }}>{score.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'rgba(180,180,220,0.6)', letterSpacing: '2px', textTransform: 'uppercase' }}>Best</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#44ffaa' }}>{Math.max(score, bestScore).toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'rgba(180,180,220,0.6)', letterSpacing: '2px', textTransform: 'uppercase' }}>Chain</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#ffdd44' }}>{maxChain > 0 ? `${maxChain}x` : '--'}</div>
            </div>
          </div>
          <Btn onClick={onRestart} primary>Play Again</Btn>
        </motion.div>
      </motion.div>
    );
  }

  if (paused) {
    return (
      <motion.div
        style={backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          style={card}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div style={{ ...title, color: '#88ccff', textShadow: '0 0 20px #4488ff' }}>
            Paused
          </div>
          <div style={subtitle}>Take a breather!</div>
          <Btn onClick={onResume} primary>Resume</Btn>
          <Btn onClick={onRestart}>Restart</Btn>
        </motion.div>
      </motion.div>
    );
  }

  return null;
}
