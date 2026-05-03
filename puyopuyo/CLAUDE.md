# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server at http://localhost:5173
npm run build    # TypeScript check + Vite production build
npm run preview  # Serve production build locally
```

No test suite is configured. TypeScript errors surface via `npm run build` (uses `tsc -b`).

## Architecture

**Stack:** Vite + React 19 + TypeScript · Tailwind CSS v4 (`@tailwindcss/vite` plugin) · Framer Motion

### Game logic (`src/game/`)

Pure functions only — no React, no side effects.

- `types.ts` — `Color | null = Cell`, `Board = Cell[][]` (row 0 = top), `Piece` (pivot x/y + rotation 0–3), `Phase`
- `constants.ts` — board size (6 × 12), `CHILD_OFFSETS` (rotation → `[dx,dy]`), fall timings, `COLOR_CONFIG` (neon gradients per color)
- `logic.ts` — `isPieceValid`, `placePiece`, `rotateCW/CCW` (with wall kicks), `ghostPiece`, `findGroups` (BFS, groups ≥ 4), `applyGravity`, `spawnPiece`

**Rotation convention:** `rot=0` child above pivot, `rot=1` right, `rot=2` below, `rot=3` left.  
**Spawn position:** pivot at `(SPAWN_X=2, row 0)`, child at `(SPAWN_X, row -1)` (off-board, valid).  
**Game over:** triggered inside `spawnPiece` when `board[0][SPAWN_X]` or `board[1][SPAWN_X]` is occupied.

### State management (`src/hooks/useGame.ts`)

`useReducer` with a `GameState` — single source of truth. The reducer is the only place state transitions happen.

**Phase machine:**
```
'start' → (START action) → 'falling' ↔ 'popping' → 'gameover'
```
- `'falling'`: `setInterval` at `BASE_FALL_INTERVAL` (650 ms) dispatches `FALL_TICK`
- On lock: if groups ≥ 4 found → `'popping'`; otherwise → `spawnPiece`
- `'popping'`: `setTimeout(POP_DURATION + DROP_DURATION)` fires `POP_DONE`, which clears cells, applies gravity, and re-enters `'popping'` for chains or calls `spawnPiece`

Chain counter increments each time groups are found before `spawnPiece` resets it to 0.

### Keyboard (`src/hooks/useKeyboard.ts`)

Attaches `keydown`/`keyup` to `window`. Held keys (`ArrowLeft/Right/Down`) use a two-level repeat: 160 ms initial delay then 50 ms repeat. Hook is disabled (`active=false`) during `'start'` and `'gameover'` phases.

Controls: `←→` move · `↑` rotate CW · `Z` rotate CCW · `↓` soft drop · `Space` hard drop · `P/Esc` pause.

### Rendering (`src/components/`)

- `Board.tsx` — absolute-positioned grid. Static cells from `board[][]`; ghost piece (semi-transparent); active piece via `motion.div` with stable `key={index}` so Framer Motion tracks smooth movement. Chain banner overlaid with `AnimatePresence`.
- `PuyoCell.tsx` — single puyo: radial-gradient fill + neon `box-shadow` from `COLOR_CONFIG`. Popping cells use Framer Motion `scale→0` animation. Ghost cells use transparent border style.
- `Sidebar.tsx` — score, best chain, next-piece preview, controls legend. Glass-morphism panels with `backdrop-filter: blur`.
- `Overlay.tsx` — start / paused / game-over screens rendered over the board with `position: absolute`.

### Styling

Global CSS is minimal (`src/index.css`): Tailwind v4 import + `@keyframes twinkle` for star background. All game UI uses inline `style` props (no Tailwind utility classes in components).

---

## 要件定義 (Requirements)

### 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロダクト名 | ぷよぷよ (Puyo Puyo) Web ゲーム |
| 目的 | ブラウザで遊べるモダンな落ちものパズルゲームの提供 |
| 対象ユーザー | PC ブラウザを使用するゲームプレイヤー全般 |
| 動作環境 | Chrome / Firefox / Edge / Safari 最新版（デスクトップ優先） |

---

### 2. 機能要件

#### 2.1 コアゲームプレイ

| # | 要件 | 優先度 |
|---|------|--------|
| F-01 | 6列 × 12行のゲームボードを表示する | 必須 |
| F-02 | 2個1組のぷよ（ピース）が上部中央（列2）からスポーンする | 必須 |
| F-03 | ピースは一定間隔（650ms）で1行ずつ自動落下する | 必須 |
| F-04 | 同色の隣接ぷよが4個以上で消去（グループ判定: BFS） | 必須 |
| F-05 | 消去後、上に残ったぷよが重力で落下する | 必須 |
| F-06 | 連続消去（チェーン）を自動検出し繰り返す | 必須 |
| F-07 | ボード最上部が埋まった状態でスポーン時にゲームオーバー | 必須 |
| F-08 | 次に出現するピースをサイドバーに表示する | 必須 |
| F-09 | ゲーム開始・リスタート機能 | 必須 |
| F-10 | ポーズ／再開機能 | 必須 |

#### 2.2 操作

| キー | 動作 |
|------|------|
| `←` / `→` | ピースを左右に移動（長押し連続移動: 160ms後50ms間隔） |
| `↑` | 時計回り回転（ウォールキック付き） |
| `Z` | 反時計回り回転（ウォールキック付き） |
| `↓` | ソフトドロップ（1行ずつ高速落下） |
| `Space` | ハードドロップ（最下段へ即時落下、+2pt/行） |
| `P` / `Esc` | ポーズ／再開 |

#### 2.3 スコアリング

| 条件 | 計算式 |
|------|--------|
| 消去ボーナス | `消去数 × 10 × (CHAIN_BONUS[chain-1] + 1)` |
| ソフトドロップ | 1行 +1pt |
| ハードドロップ | 1行 +2pt |
| チェーンボーナス | 1連=0 / 2連=8 / 3連=16 / 4連=32 / 5連=64 … (`constants.ts` の `CHAIN_BONUSES`) |

#### 2.4 ゲーム状態

```
start → falling ↔ popping → gameover
                ↑ pause/resume (paused flag)
```

- **start**: タイトル画面表示
- **falling**: ピース落下中
- **popping**: 消去アニメーション + 重力処理（420ms + 180ms）
- **gameover**: スコア・ベストチェーン表示、リトライ可能

---

### 3. 非機能要件

| # | 要件 | 基準値 |
|---|------|--------|
| NF-01 | フレームレート | 60fps で滑らかなアニメーション |
| NF-02 | ビルドサイズ | JS gzip 110KB 以下 |
| NF-03 | 初回描画 | dev サーバー起動 1秒以内（Vite HMR） |
| NF-04 | ブラウザ互換性 | モダンブラウザ最新2バージョン |
| NF-05 | キーリピート精度 | 長押し時のリピートレートが一定（50ms）であること |

---

### 4. UI/UX 要件

| # | 要件 |
|---|------|
| U-01 | ダーク系ネオンテーマ（背景: `#0a0a1a`、ぷよに色別グロー） |
| U-02 | 各ぷよは色別のラジアルグラデーション + ネオン `box-shadow` |
| U-03 | ぷよにシンプルな顔（目2つ + 口）を表示 |
| U-04 | 落下先をゴーストピース（半透明枠）で常時表示 |
| U-05 | 消去時にスケールアウトアニメーション（Framer Motion） |
| U-06 | 2連鎖以上でボード中央にチェーン数バナーを表示 |
| U-07 | サイドバーにスコア・ベストチェーン・ネクストピース・操作説明を表示 |
| U-08 | オーバーレイ（スタート / ポーズ / ゲームオーバー）はグラスモーフィズムカード |
| U-09 | 背景に星がゆっくり点滅するアニメーション |

---

### 5. 使用ぷよカラー

| 色 | Base | Glow |
|----|------|------|
| Red | `#ff3355` | `rgba(255,51,85,0.65)` |
| Green | `#22dd77` | `rgba(34,221,119,0.65)` |
| Blue | `#3388ff` | `rgba(51,136,255,0.65)` |
| Yellow | `#ffcc00` | `rgba(255,204,0,0.65)` |
| Purple | `#bb33ff` | `rgba(187,51,255,0.65)` |

アクティブ色数は `ACTIVE_COLORS`（`constants.ts`）で制御。現在は4色（Red/Green/Blue/Yellow）。

---

### 6. 将来の拡張候補（スコープ外）

- レベルシステム（落下速度の段階的加速）
- BGM / 効果音（Web Audio API）
- ハイスコアのローカル保存（`localStorage`）
- タッチ操作対応（スマートフォン）
- CPU対戦モード
- おじゃまぷよ（ガーベージぷよ）システム
