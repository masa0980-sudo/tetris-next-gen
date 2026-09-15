# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Goal

モダンで先進的なUI/UXのテトリス(Tetris)アプリをNext.jsで構築する。
以前Manusで公開していたテトリス(https://tetrisapp-fxrxwaql.manus.space)の改良版。
Manusのソースには直接アクセスできなかったため、同じジャンルのゲームとして
`puyo-puyo-next-gen` と同じスタック・同じアーキテクチャ思想で新規に構築している。

## Links

- **GitHub**: https://github.com/masa0980-sudo/tetris-next-gen
- **Production**: https://masa0980-sudo.github.io/tetris-next-gen/

## Commands

```bash
npm install
node node_modules/next/dist/bin/next dev --webpack   # 開発サーバー起動
npm run build    # 本番ビルド(静的エクスポート)
npm run lint     # ESLint 実行
```

GitHub Pagesへの公開時のみ `GITHUB_PAGES=true npm run build` でbasePath付きビルドになる
(`.github/workflows/deploy-pages.yml` が自動で行う。ローカル開発では不要)。

## Stack

- **Next.js 16** — App Router, `src/` ディレクトリ構成, `output: "export"` で静的サイト化
- **React 19** — Server Components デフォルト、`"use client"` でクライアント化
- **TypeScript 5** — strict モード有効
- **Tailwind CSS v4** — `@import "tailwindcss"` 方式（設定ファイル不要）
- **Geist フォント** — CSS 変数 `--font-geist-sans` / `--font-geist-mono` で適用

## Architecture

ゲームロジックはすべてクライアントサイドで動作する(サーバーサイドレンダリング不使用)。

```
src/
  app/
    page.tsx        # エントリポイント（GameScreen をレンダリング）
    layout.tsx       # Geist フォント・メタデータ
    globals.css       # Tailwind v4 + line-clear / popup アニメーション
  lib/
    types.ts         # 全型定義（TetrominoType, Piece, GameState, GameAction 等）
    constants.ts      # ゲーム定数（盤面サイズ・形状データ・スコアテーブル・落下速度）
    tetrisGame.ts      # 純粋関数ゲームロジック（衝突判定・回転キック・ライン検出）
    reducer.ts         # useReducer 状態機械（フェーズ管理・スコア計算・7-bag）
    storage.ts          # localStorage ハイスコア永続化
    sound.ts            # Web Audio API サウンドエフェクト（外部ファイル不要）
  components/
    GameScreen.tsx       # メインコンテナ（ゲームループ・キーボード入力）
    GameBoard.tsx         # 10×20 ボード描画（ゴーストピース・ライン消去演出）
    TetrisCell.tsx          # 個別セル（グラデーション・光沢）
    MiniPiece.tsx             # NEXT/HOLD用の小さいピース表示
    NextQueue.tsx              # NEXT 3個プレビュー
    HoldBox.tsx                 # ホールド表示
    ScorePanel.tsx                # スコア/ベスト/レベル/ライン数 HUD
    TitleScreen.tsx                # タイトル画面
    PauseOverlay.tsx                 # ポーズオーバーレイ
    GameOverScreen.tsx                # ゲームオーバー画面
    TouchControls.tsx                  # モバイルタッチボタン
```

### ゲームフェーズ

```
title → falling → (接地) → lineClear(揃った行があれば) → falling → …
                          ↘ (揃った行がなければ即座に) falling
                                                        ↘ gameover(次のピースが出現できない)
```

`falling` 中は `paused` にトグルできる。

### 実装済みの仕様・簡略化した点

- **7-bagランダマイザ**: 7種類を1袋としてシャッフルし、同じ種類が連続で出過ぎないようにしている
  (`makeBag()` / `reducer.ts` の `refillQueue`)
- **回転**: SRSの形状データを使っているが、ウォールキックは簡易版
  （そのまま→左右に1・2マスずらす→上にずらす、の順で最初に置ける位置を採用）。
  本家のフルSRSキックテーブル・T-spin判定は実装していない
- **ロック**: 接地したら次のTICKで即座に固定する(いわゆるlock delay/infinity spinは無し)。
  カジュアルに遊べる分、ぎりぎりの調整プレイはしにくい
- **スコア**: `LINE_CLEAR_SCORE`(1〜4ライン) × レベル + コンボボーナス + Back-to-Backボーナス(4ライン連続)
- **レベル**: 10ライン消去ごとに1上がり、落下速度が`DROP_STEP_MS`ずつ短縮(下限`MIN_DROP_MS`)
- **ハイスコア**: `localStorage`に永続化。スコア更新はプレイ中も即座に反映・保存される(`reducer.ts`の`addScore`)
- **ホールド**: 1回ロックするまで再ホールド不可(`canHold`フラグ)
- **サウンド**: Web Audio APIで合成。移動・回転・ハードドロップ・ライン消去(4ラインは特別なファンファーレ)・
  レベルアップ・ホールド・ゲームオーバーの各SEを持つ

## プレイ回数集計 (PlayCounts)

`src/lib/playCounts.ts` が、他の自作ブラウザゲーム(Rhythm_gameなど)と共有している
Firestoreプロジェクト `rythm-game-mo` に対して `fetch()` のみでプレイ回数を送信する
(Firebase SDKは導入しない、単一関数の小さなモジュール)。

- ドキュメントは `playCounts/tetris`(1ドキュメント・`count`フィールドのみ)。
- `increment()` はまず `:commit` で原子的な `count + 1`(increment transform)を試み、
  ドキュメント未作成(このgameId初回プレイ)で失敗した場合のみ `count: 1` での新規作成に
  フォールバックする。セキュリティルールが新規作成を `{count: 1}` ちょうどの場合のみ許可する
  ため、手動でのドキュメント作成は不要。
- 呼び出し元は `src/components/GameScreen.tsx` の `startGame()` — `title → falling` への
  遷移(`START`)と、ポーズ/ゲームオーバーからのリスタート(`RESTART`)を1つの関数に集約し、
  新規ゲーム開始のたびに1回だけ発火する。`useReducer` の `reducer.ts` 自体は純粋関数のまま
  保つため、副作用(このfetch呼び出し)はコンポーネント側のディスパッチ経路に置いている。
- 完全にfire-and-forget: `await` せず、失敗してもゲーム進行やUIに一切影響しない
  (ローディング表示もエラー表示も無し。失敗時は`console.warn`のみ)。
- 表示用の読み取りは `fetchCount()`(`playCounts.ts` に `increment()` と並んで定義)。
  `playCounts/tetris` を素の `GET` で1件取得するだけの読み取り専用関数で、ドキュメント未作成
  (誰もまだプレイしていない)やエラー時は `null` を返す。呼び出し側はその場合何も表示しない。
- `TitleScreen.tsx` がマウント時に一度だけ `fetchCount()` を呼び、解決してから
  「PLAY NOW」ボタンの下に `PLAYED {count} TIMES` を小さく表示する(BEST SCOREと同系統の
  `font-mono tracking-widest text-white/40` スタイル)。これもブロッキングではなく、
  取得できるまで/失敗時はそのスペースに何も出さない。

## デプロイ

`main`ブランチへのpushで`.github/workflows/deploy-pages.yml`が自動的に静的ビルド・GitHub Pagesへデプロイする。
リポジトリがpublicであることと、Settings → Actions → General → Workflow permissions が
「Read and write permissions」になっている必要がある(privateリポジトリや読み取り専用権限のままだと
Pagesサイトの作成に失敗する)。
