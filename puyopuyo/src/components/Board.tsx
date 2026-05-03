import { motion, AnimatePresence } from 'framer-motion';
import type { Board as BoardType, Piece } from '../game/types';
import { COLS, ROWS, CELL_SIZE, CHILD_OFFSETS } from '../game/constants';
import { PuyoCell } from './PuyoCell';

interface Props {
  board: BoardType;
  piece: Piece | null;
  ghost: Piece | null;
  popMask: boolean[][];
  chain: number;
}

function pieceCells(p: Piece): { col: number; row: number; color: import('../game/types').Color }[] {
  const [dx, dy] = CHILD_OFFSETS[p.rot];
  const cells = [
    { col: p.px, row: p.py, color: p.pivotColor },
    { col: p.px + dx, row: p.py + dy, color: p.childColor },
  ];
  return cells.filter(c => c.row >= 0 && c.row < ROWS);
}

const BOARD_W = COLS * CELL_SIZE;
const BOARD_H = ROWS * CELL_SIZE;

export function Board({ board, piece, ghost, popMask, chain }: Props) {
  const ghostCells = ghost ? pieceCells(ghost) : [];
  const pieceCellList = piece ? pieceCells(piece) : [];

  return (
    <div style={{ position: 'relative', width: BOARD_W, height: BOARD_H }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(10,10,30,0.92)',
        borderRadius: 8,
        border: '1px solid rgba(120,120,255,0.15)',
        boxShadow: '0 0 30px rgba(80,80,255,0.1), inset 0 0 20px rgba(0,0,30,0.5)',
        backgroundImage: `
          linear-gradient(rgba(80,80,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(80,80,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
      }} />

      {/* Static board cells */}
      {board.map((row, r) =>
        row.map((cell, c) => {
          if (!cell) return null;
          const popping = popMask[r][c];
          return (
            <div
              key={`${r}-${c}`}
              style={{
                position: 'absolute',
                left: c * CELL_SIZE + 2,
                top: r * CELL_SIZE + 2,
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
              }}
            >
              <PuyoCell color={cell} popping={popping} />
            </div>
          );
        })
      )}

      {/* Ghost piece */}
      {ghostCells.map(({ col, row, color }) => (
        <div
          key={`ghost-${col}-${row}`}
          style={{
            position: 'absolute',
            left: col * CELL_SIZE + 2,
            top: row * CELL_SIZE + 2,
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
          }}
        >
          <PuyoCell color={color} ghost />
        </div>
      ))}

      {/* Active piece — stable key (index) so Framer Motion tracks movement */}
      {pieceCellList.map(({ col, row, color }, idx) => (
        <motion.div
          key={`piece-${idx}`}
          initial={{ x: col * CELL_SIZE + 2, y: row * CELL_SIZE + 2 }}
          animate={{ x: col * CELL_SIZE + 2, y: row * CELL_SIZE + 2 }}
          transition={{ duration: 0.07, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
          }}
        >
          <PuyoCell color={color} />
        </motion.div>
      ))}

      {/* Chain banner */}
      <AnimatePresence>
        {chain > 1 && (
          <motion.div
            key={`chain-${chain}`}
            initial={{ scale: 0.4, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.4, opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          >
            <div style={{
              background: 'rgba(0,0,0,0.75)',
              border: '2px solid rgba(255,200,50,0.8)',
              borderRadius: 16,
              padding: '12px 24px',
              textAlign: 'center',
              boxShadow: '0 0 30px rgba(255,200,50,0.5)',
            }}>
              <div style={{
                fontSize: 42,
                fontWeight: 900,
                color: '#ffdd44',
                textShadow: '0 0 20px #ffdd44, 0 0 40px #ffaa00',
                lineHeight: 1,
              }}>
                {chain}
              </div>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'rgba(255,220,80,0.9)',
                letterSpacing: '3px',
                textTransform: 'uppercase',
              }}>
                Chain!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
