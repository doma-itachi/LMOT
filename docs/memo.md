# GLMT 実装メモ

このドキュメントは、GLMTプロジェクトの実装状況、注意点、残り作業をまとめたものです。

## 実装状況（2026-03-08時点）

### ✅ 完了したフェーズ

#### Phase 1: 基盤整備
- ディレクトリ構成作成（すべて完了）
- `src/shared/types.ts` 共通型定義実装
- スキャフォールドの不要ファイル削除

#### Phase 2: メインプロセス
- ✅ LLMプロバイダ層（`src/main/llm/`）
  - `types.ts` - プロバイダインターフェース
  - `prompts.ts` - プロンプト管理
  - `providers/codex.ts` - Codexプロバイダ
  - `providers/groq.ts` - Groqプロバイダ
  - `index.ts` - ファクトリ関数
- ✅ サービス層（`src/main/services/`）
  - `store.ts` - electron-storeによる設定永続化
  - `capture.ts` - スクリーンキャプチャ（マルチモニタ・DPI対応）
  - `translate.ts` - 翻訳処理と時間計測
- ✅ ウィンドウ管理（`src/main/windows/`）
  - `main.ts` - メインウィンドウ（frame: false）
  - `capture.ts` - キャプチャオーバーレイウィンドウ
- ✅ IPCハンドラ（`src/main/ipc/`）
  - `capture.ts`, `translate.ts`, `settings.ts`, `window.ts`
- ✅ `src/main/index.ts` - グローバルショートカット含む統合実装

#### Phase 3: プリロード
- ✅ `src/preload/index.ts` - contextBridgeでIPC公開
- ✅ `src/preload/index.d.ts` - 型定義整備

#### Phase 4: レンダラー（React）- **一部完了**
- ✅ i18n設定（`src/renderer/src/i18n/`）
  - `index.ts`, `locales/ja.json`, `locales/en.json`
- ✅ 状態管理（`src/renderer/src/stores/`）
  - `translationStore.ts` - Zustand
  - `settingsStore.ts` - Zustand
- ✅ カスタムフック（`src/renderer/src/hooks/`）
  - `useCapture.ts`, `useTranslation.ts`, `useSettings.ts`
- ✅ レイアウトコンポーネント
  - `components/layout/TitleBar.tsx` - カスタムタイトルバー

### 🚧 Phase 4: 残り作業

以下のコンポーネントがまだ実装されていません：

#### 翻訳コンポーネント
- [ ] `components/translation/TranslationResult.tsx`
  - 翻訳前後のテキスト表示
  - ホバーで元画像をプレビュー表示
  - 経過時間表示
  - 元の言語表示

- [ ] `components/translation/TranslationHistory.tsx`
  - 過去の翻訳履歴をリスト表示
  - クリックで履歴アイテムを選択
  - スクロール可能

#### キャプチャコンポーネント
- [ ] `components/capture/CaptureOverlay.tsx`
  - 全画面透過オーバーレイUI
  - マウスドラッグで矩形選択
  - 選択中の矩形を視覚的に表示
  - Escキーでキャンセル
  - マウスアップで選択完了 → IPCで領域情報を送信

#### 設定コンポーネント
- [ ] `components/settings/SettingsModal.tsx`
  - モーダルダイアログ（Shadcn Dialog使用）
  - タブ切り替え（Shadcn Tabs使用）

- [ ] `components/settings/GeneralTab.tsx`
  - 言語選択（日本語・英語）
  - ダークモード切り替え

- [ ] `components/settings/LLMTab.tsx`
  - プロバイダ選択（Codex / Groq）
  - Groq選択時: APIキー入力フィールド
  - モデル選択（プロバイダごとに利用可能モデル表示）

#### メインアプリケーション
- [ ] `src/renderer/src/App.tsx`
  - スキャフォールドを完全な実装に置き換え
  - すべてのコンポーネントを統合
  - キャプチャ結果の受信と翻訳実行
  - ダークモードの適用

- [ ] `src/renderer/src/main.tsx`
  - i18n初期化の追加（`import './i18n'`）

### 📋 Phase 5: 仕上げ（未着手）

- [ ] ダークモード実装
  - Tailwindの`dark:`クラス使用
  - Shadcnテーマ変数
  - `settingsStore`の値をルート要素のclassに反映

- [ ] エラーハンドリング
  - 翻訳失敗時のエラーメッセージUI表示
  - ネットワークエラー対応
  - APIキー未設定時の警告

- [ ] ローディング状態
  - 翻訳中のスピナー表示
  - ボタンの無効化

- [ ] 動作確認
  - 各機能の手動テスト
  - マルチモニタ環境でのテスト
  - ダークモードのテスト

## 重要な注意点・修正履歴

### TypeScript設定
- **修正済み**: `tsconfig.node.json`の`include`配列に`"src/shared/**/*"`を追加
  - 理由: メインプロセスから`src/shared/types.ts`をインポートするため

### Groq SDKの使用方法
- **修正済み**: `src/main/llm/providers/groq.ts`でのGroq SDK使用方法
  - ❌ 誤: `groq(model, { apiKey })`
  - ✅ 正: `createGroq({ apiKey })`でクライアント作成 → `groq(model)`
  - 実装: 
    ```typescript
    import { createGroq } from '@ai-sdk/groq'
    const groq = createGroq({ apiKey: this.apiKey })
    model: groq(model)
    ```

### Groqのモデル設定
- **修正済み**: `src/main/llm/providers/groq.ts`
  - 利用可能モデルは`meta-llama/llama-4-scout-17b-16e-instruct`のみ
  - 他のモデルは削除済み

## 技術スタック

### メインプロセス
- **Electron**: ウィンドウ管理、IPC
- **Vercel AI SDK**: LLM統合
  - `ai-sdk-provider-codex-cli`: Codexプロバイダ
  - `@ai-sdk/groq`: Groqプロバイダ
- **electron-store**: 設定永続化
- **zod**: スキーマ検証

### レンダラープロセス
- **React 19**: UIフレームワーク
- **TypeScript**: 型安全
- **Zustand**: 状態管理
- **i18next**: 多言語対応（日本語・英語）
- **Tailwind CSS**: スタイリング
- **Shadcn/ui**: UIコンポーネント
- **lucide-react**: アイコン

## デザイン方針

- **カラー**: ブルー系アクセント + 白基調（ダークモード時は反転）
- **形状**: 角丸、ソフトシャドウ
- **参考**: `docs/design_reference.png`（レイアウトは最適化する）
- **カスタムタイトルバー**: `frame: false`で実装済み

## ファイル構成

```
src/
├── main/                   # メインプロセス（完了）
│   ├── llm/               # LLMプロバイダ
│   ├── ipc/               # IPCハンドラ
│   ├── services/          # ビジネスロジック
│   ├── windows/           # ウィンドウ管理
│   └── index.ts           # エントリーポイント
├── preload/               # プリロード（完了）
│   ├── index.ts
│   └── index.d.ts
├── shared/                # 共通型定義（完了）
│   └── types.ts
└── renderer/              # レンダラー（一部完了）
    └── src/
        ├── i18n/          # 多言語対応（完了）
        ├── stores/        # 状態管理（完了）
        ├── hooks/         # カスタムフック（完了）
        ├── components/    # UIコンポーネント（一部完了）
        │   ├── layout/    # ✅ TitleBar
        │   ├── translation/ # ❌ 未実装
        │   ├── capture/   # ❌ 未実装
        │   └── settings/  # ❌ 未実装
        ├── App.tsx        # ❌ 未実装
        └── main.tsx       # ❌ i18n初期化追加が必要
```

## 次のステップ

1. **Phase 4の残りコンポーネントを実装**
   - TranslationResult.tsx から開始することを推奨
   - 次に TranslationHistory.tsx
   - その後 CaptureOverlay.tsx
   - 設定関連コンポーネント（SettingsModal, GeneralTab, LLMTab）
   - 最後に App.tsx と main.tsx を更新

2. **Phase 5の仕上げ**
   - ダークモード対応
   - エラーハンドリング
   - ローディング状態
   - 動作確認

## 参考ドキュメント

- **要件**: `docs/req.md`
- **実装計画**: `docs/plan.md`
- **サンプルコード**: `docs/sample/`（Vercel AI SDK使用例）
- **デザイン参考**: `docs/design_reference.png`

## トラブルシューティング

### TypeScriptエラー: shared/types.tsが見つからない
- `tsconfig.node.json`に`"src/shared/**/*"`を追加（修正済み）

### Groq APIエラー: 引数の数が不正
- `createGroq({ apiKey })`でクライアント作成してから使用（修正済み）

### キャプチャが動作しない
- `src/main/services/capture.ts`でブラウザAPIを使用している箇所を確認
- メインプロセスではCanvasが使えないため、別のアプローチが必要な可能性

## 連絡先・質問

実装に関する質問や不明点がある場合は、以下を参照してください：
- `docs/plan.md`: 詳細な実装計画
- `docs/req.md`: 要件定義
- 各フェーズの計画ファイル: `.cursor/plans/`

## 更新履歴

- 2026-03-08: Phase 1〜3完了、Phase 4一部完了時点でのメモ作成
