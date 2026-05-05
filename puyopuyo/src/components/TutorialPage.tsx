import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial } from '../hooks/useTutorial';
import { useKeyboard } from '../hooks/useKeyboard';
import { useCellSize } from '../hooks/useCellSize';
import { Board } from './Board';
import { TouchControls } from './TouchControls';
import { TUTORIAL_STEPS } from '../game/tutorialSteps';
import { COLS, ROWS } from '../game/constants';

const BG = 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0a1a 60%)';

const panel: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(120,120,255,0.18)',
  borderRadius: 12,
  backdropFilter: 'blur(8px)',
};

export function TutorialPage({ onExit }: { onExit: () => void }) {
  const {
    state, ghost, step, stepIndex, stepComplete, tutorialDone,
    move, rotateCw, rotateCcw, hardDrop, setSoftDrop, nextStep,
  } = useTutorial();
  const { cellSize, isMobile } = useCellSize();

  const kbActive = state.phase === 'falling' && !stepComplete;
  useKeyboard({ move, rotateCw, rotateCcw, hardDrop, pause: () => {}, setSoftDrop }, kbActive);

  const boardW = COLS * cellSize;
  const boardH = ROWS * cellSize;
  const isLast = stepIndex === TUTORIAL_STEPS.length - 1;

  if (tutorialDone) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          style={{
            textAlign: 'center',
            padding: '40px 48px',
            background: 'rgba(30,30,60,0.9)',
            border: '1px solid rgba(120,120,255,0.3)',
            borderRadius: 20,
            boxShadow: '0 0 60px rgba(80,80,255,0.2)',
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#cc88ff', textShadow: '0 0 30px #aa44ff', marginBottom: 8 }}>
            チュートリアル完了！
          </div>
          <div style={{ fontSize: 14, color: 'rgba(180,180,220,0.7)', marginBottom: 32 }}>
            基本操作をマスターしたね！ゲームを始めよう！
          </div>
          <Btn onClick={onExit} primary>ゲームをはじめよう！</Btn>
        </motion.div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', background: BG, overflow: 'hidden', touchAction: 'none',
      }}>
        {/* Header */}
        <div style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', height: 52, flexShrink: 0, position: 'relative', zIndex: 1,
        }}>
          <button onClick={onExit} style={{
            ...panel, padding: '6px 10px', color: 'rgba(180,180,255,0.7)',
            fontSize: 12, cursor: 'pointer', border: '1px solid rgba(120,120,255,0.25)',
            borderRadius: 8, background: 'rgba(255,255,255,0.04)',
          }}>
            ← 戻る
          </button>
          <StepDots current={stepIndex} total={TUTORIAL_STEPS.length} />
        </div>

        {/* Instruction */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              ...panel,
              width: 'calc(100% - 24px)',
              padding: '10px 14px',
              margin: '0 0 6px',
              flexShrink: 0,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ fontSize: 11, color: 'rgba(160,160,255,0.5)', letterSpacing: '1px', marginBottom: 2 }}>
              {step.title}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e0e0ff', marginBottom: 4 }}>
              {step.instruction}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(180,180,220,0.55)' }}>
              💡 {step.hint}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Board */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 1,
        }}>
          <BoardWithOverlays
            state={state} ghost={ghost} step={step} stepComplete={stepComplete}
            cellSize={cellSize} boardW={boardW} boardH={boardH}
            nextStep={nextStep} isLast={isLast}
          />
        </div>

        {/* Touch controls */}
        <div style={{ width: '100%', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <TouchControls
            move={move} rotateCw={rotateCw} rotateCcw={rotateCcw}
            hardDrop={hardDrop} setSoftDrop={setSoftDrop}
          />
        </div>
      </div>
    );
  }

  // Desktop
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: BG, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', position: 'relative', zIndex: 1 }}>
        {/* Top bar */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onExit} style={{
            ...panel, padding: '7px 14px', color: 'rgba(180,180,255,0.7)',
            fontSize: 13, cursor: 'pointer', border: '1px solid rgba(120,120,255,0.25)',
            borderRadius: 8, background: 'rgba(255,255,255,0.04)',
          }}>
            ← ゲームに戻る
          </button>
          <div style={{ flex: 1 }} />
          <StepDots current={stepIndex} total={TUTORIAL_STEPS.length} />
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Board */}
          <BoardWithOverlays
            state={state} ghost={ghost} step={step} stepComplete={stepComplete}
            cellSize={cellSize} boardW={boardW} boardH={boardH}
            nextStep={nextStep} isLast={isLast}
          />

          {/* Instruction panel */}
          <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ ...panel, padding: '20px 18px' }}
              >
                <div style={{
                  fontSize: 11, color: 'rgba(160,160,255,0.5)',
                  letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10,
                }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#e0e0ff', lineHeight: 1.4, marginBottom: 14 }}>
                  {step.instruction}
                </div>
                <div style={{
                  fontSize: 12.5, color: 'rgba(180,180,220,0.65)',
                  background: 'rgba(120,120,255,0.08)', borderRadius: 8,
                  padding: '8px 10px', lineHeight: 1.5,
                }}>
                  💡 {step.hint}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls reference */}
            <div style={{ ...panel, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'rgba(160,160,255,0.5)', letterSpacing: '1px', marginBottom: 10 }}>
                CONTROLS
              </div>
              {([
                ['← →', '左右移動'],
                ['↑ / Z', '回転'],
                ['↓', 'ゆっくり落とす'],
                ['Space', 'ハードドロップ'],
              ] as const).map(([key, label]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <span style={{
                    fontSize: 11, fontFamily: 'monospace',
                    background: 'rgba(120,120,255,0.2)', borderRadius: 4,
                    padding: '2px 6px', color: '#aaccff',
                  }}>
                    {key}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(180,180,220,0.6)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Board + column highlight + completion overlay, extracted to avoid duplication
function BoardWithOverlays({
  state, ghost, step, stepComplete, cellSize, boardW, boardH, nextStep, isLast,
}: {
  state: ReturnType<typeof useTutorial>['state'];
  ghost: ReturnType<typeof useTutorial>['ghost'];
  step: ReturnType<typeof useTutorial>['step'];
  stepComplete: boolean;
  cellSize: number;
  boardW: number;
  boardH: number;
  nextStep: () => void;
  isLast: boolean;
}) {
  return (
    <div style={{ position: 'relative', width: boardW, height: boardH }}>
      <Board
        board={state.board}
        piece={state.piece}
        ghost={ghost}
        popMask={state.popMask}
        chain={state.chain}
        cellSize={cellSize}
      />

      {/* Target column highlight for step 4 */}
      {step.highlightCol !== undefined && !stepComplete && (
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: step.highlightCol * cellSize,
            width: cellSize,
            height: boardH,
            background: 'linear-gradient(to bottom, rgba(255,220,50,0.18) 0%, rgba(255,220,50,0.04) 60%)',
            borderLeft: '2px solid rgba(255,220,50,0.5)',
            borderRight: '2px solid rgba(255,220,50,0.5)',
            borderTop: '3px solid rgba(255,220,50,0.9)',
            pointerEvents: 'none',
            zIndex: 15,
            borderRadius: 4,
          }}
        />
      )}

      {/* Step complete overlay */}
      {stepComplete && (
        <StepCompleteOverlay message={step.completionMessage} onNext={nextStep} isLast={isLast} />
      )}
    </div>
  );
}

function StepCompleteOverlay({ message, onNext, isLast }: {
  message: string;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(5,5,20,0.86)', borderRadius: 8,
        backdropFilter: 'blur(4px)', zIndex: 30,
      }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          textAlign: 'center', padding: '24px 28px',
          background: 'rgba(20,30,50,0.96)',
          border: '1px solid rgba(120,255,160,0.35)',
          borderRadius: 16,
          boxShadow: '0 0 40px rgba(40,200,100,0.2)',
          maxWidth: 200,
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#88ffcc', marginBottom: 20, lineHeight: 1.5 }}>
          {message}
        </div>
        <Btn onClick={onNext} primary>
          {isLast ? 'チュートリアルを終える 🎉' : '次のステップへ →'}
        </Btn>
      </motion.div>
    </motion.div>
  );
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 18 : 8,
            background: i === current ? '#aa66ff' : i < current ? 'rgba(170,102,255,0.45)' : 'rgba(120,120,255,0.2)',
          }}
          transition={{ duration: 0.3 }}
          style={{ height: 8, borderRadius: 4 }}
        />
      ))}
    </div>
  );
}

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
        display: 'block', width: '100%', padding: '12px 0',
        borderRadius: 12,
        border: primary ? 'none' : '1px solid rgba(120,120,255,0.4)',
        background: primary
          ? 'linear-gradient(135deg, #6644ff, #4422cc)'
          : 'rgba(255,255,255,0.05)',
        color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        boxShadow: primary ? '0 0 20px rgba(100,68,255,0.5)' : 'none',
        letterSpacing: '0.3px',
      }}
    >
      {children}
    </motion.button>
  );
}
