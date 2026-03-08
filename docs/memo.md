# LMOT 実装メモ

このドキュメントは、LMOTプロジェクトの実装状況、注意点、残り作業をまとめたものです。

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

#### Phase 4: レンダラー（React）
- ✅ i18n設定（`src/renderer/src/i18n/`）
  - `index.ts`, `locales/ja.json`, `locales/en.json`
- ✅ 状態管理（`src/renderer/src/stores/`）
  - `translationStore.ts` - Zustand
  - `settingsStore.ts` - Zustand
- ✅ カスタムフック（`src/renderer/src/hooks/`）
  - `useCapture.ts`, `useTranslation.ts`, `useSettings.ts`
- ✅ UIコンポーネント
  - `components/layout/TitleBar.tsx` - カスタムタイトルバー
  - `components/translation/TranslationResult.tsx` - 翻訳結果表示
  - `components/translation/TranslationHistory.tsx` - 翻訳履歴
  - `components/capture/CaptureOverlay.tsx` - キャプチャオーバーレイ
  - `components/settings/SettingsModal.tsx` - 設定モーダル
  - `components/settings/GeneralTab.tsx` - 一般設定タブ
  - `components/settings/LLMTab.tsx` - LLM設定タブ
- ✅ メインアプリケーション
  - `App.tsx` - 全コンポーネント統合
  - `main.tsx` - i18n初期化

#### Phase 5: 仕上げと品質向上
- ✅ エラーハンドリング強化
- ✅ i18nメッセージ追加
- ✅ UX改善（履歴クリア、ガイダンス、設定初期化）
- ✅ 型安全性向上（TargetLanguage型）
- ✅ ダークモード微調整
- ✅ 動作確認チェックリスト作成

### 🚧 残り作業

現時点で主要な実装は全て完了しています。

#### 次のステップ
1. **動作確認**: `docs/phase5_checklist.md`の項目を確認
2. **メインプロセスの動作確認**: Phase 2で実装したメインプロセスが正常に動作するか確認
3. **統合テスト**: レンダラーとメインプロセスの連携を確認
4. **バグ修正**: 発見された問題を修正

#### 任意の追加機能
- 翻訳履歴の永続化（現在はメモリのみ）
- 翻訳結果のコピー機能
- キャプチャ領域のプリセット登録
- 複数の翻訳エンジン対応の追加

### 📋 Phase 5: 仕上げ（完了）

- ✅ エラーハンドリング強化
  - APIキー未設定時のチェックと警告
  - キャプチャキャンセル時の適切な処理
  - 設定モーダル自動表示

- ✅ i18nメッセージ追加
  - `messages.captureHint` - キャプチャのヒント
  - `messages.noTranslationYet` - 翻訳がまだない状態
  - `errors.apiKeyRequiredForGroq` - Groq用APIキー必須エラー

- ✅ UX改善
  - 翻訳履歴クリア機能（ボタン追加）
  - 初回起動時のガイダンスメッセージ
  - 設定モーダルの初期化処理（開くたびにリセット）

- ✅ 型安全性向上
  - `TargetLanguage`型の追加
  - `TranslateRequest`と`translationStore`で使用

- ✅ ダークモード微調整
  - プライマリカラーをブルー系に変更
  - ライト/ダークモードの視認性向上

- ✅ 動作確認チェックリスト作成
  - `docs/phase5_checklist.md`に詳細なチェック項目

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

- 2026-03-08: Phase 1〜5完了、全機能実装完了
  - Phase 4: 全UIコンポーネント実装
  - Phase 5: エラーハンドリング強化、UX改善、型安全性向上、ダークモード微調整
  - 動作確認チェックリスト作成（`docs/phase5_checklist.md`）
