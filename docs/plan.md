# LMOT 実装計画

## 現状

electron-vite のスキャフォールドのみ存在。`src/main/index.ts`、`src/preload/`、`src/renderer/` は空の初期状態。

---

## 前提・決定事項

- **Codex**: `ai-sdk-provider-codex-cli` を使用。ユーザー環境に Codex CLI がインストールされている前提
- **翻訳履歴**: メモリ上のみ（アプリ終了で消える）
- **ウィンドウフレーム**: カスタムタイトルバー（`frame: false`）。ドラッグ領域・ウィンドウ操作ボタンは React で実装
- **ホットキー**: `Ctrl+Shift+P` でキャプチャ起動（グローバルショートカット）
- **デザイン方針**: `design_reference.png` のスタイルに寄せる（レイアウトは最適化する）
  - ブルー系アクセントカラー + 白基調（ダークモード時は反転）
  - 角丸、ソフトなシャドウ、余白を大事にした開放的なレイアウト
  - 軽やかで親しみやすい雰囲気

---

## 実装順序

```
フェーズ1: ディレクトリ作成・共通型定義
フェーズ2: LLMプロバイダ → サービス層 → IPC → ウィンドウ管理 → main/index.ts
フェーズ3: プリロード
フェーズ4: i18n → ストア → フック → コンポーネント → App.tsx
フェーズ5: ダークモード・エラー処理・動作確認
```

---

## フェーズ 1: 基盤整備

### ディレクトリ作成

`req.md` 記載の構成に合わせて以下を作成する。

```
src/
├── main/
│   ├── llm/
│   │   └── providers/
│   ├── ipc/
│   ├── services/
│   └── windows/
├── shared/
└── renderer/src/
    ├── stores/
    ├── hooks/
    ├── i18n/
    │   └── locales/
    ├── types/
    ├── lib/
    └── components/
        ├── ui/
        ├── layout/
        ├── translation/
        ├── capture/
        └── settings/
```

### 共通型定義 (`src/shared/types.ts`)

IPC 通信のペイロード型・翻訳結果型・設定型などを定義する。

```typescript
// 翻訳結果
type TranslateResult = {
  originalLanguage: string
  original: string
  translated: string
  elapsedMs: number
  imageBase64: string
}

// 翻訳リクエスト
type TranslateRequest = {
  imageBase64: string
  targetLanguage: string
  providerKey: ProviderKey
}

// プロバイダキー
type ProviderKey = 'codex' | 'groq'

// アプリ設定
type AppSettings = {
  language: 'ja' | 'en'
  darkMode: boolean
  selectedProvider: ProviderKey
  providers: {
    groq: { apiKey: string; model: string }
    codex: { model: string }
  }
}
```

---

## フェーズ 2: メインプロセス

### 2-1. LLM プロバイダ層 (`src/main/llm/`)

```
llm/
├── types.ts       # LLMProvider インターフェース
├── index.ts       # getProvider() ファクトリ関数
└── providers/
    ├── codex.ts   # APIキー不要、codexCli() ラップ
    └── groq.ts    # APIキー必要、groq() ラップ
```

**設計方針:**
- `types.ts` に `LLMProvider` インターフェースを定義（`requiresApiKey`, `availableModels`, `translate()` メソッド等）
- `index.ts` の `getProvider(key)` ファクトリ関数でプロバイダを切り替える
- 新プロバイダはファイルを追加して `index.ts` に登録するだけで拡張可能

```typescript
// types.ts
interface LLMProvider {
  requiresApiKey: boolean
  availableModels: string[]
  translate(params: TranslateParams): Promise<TranslateResult>
}
```

### 2-2. サービス層 (`src/main/services/`)

| ファイル | 実装内容 |
|---|---|
| `capture.ts` | `desktopCapturer` + `screen` API でマルチモニタ・DPI対応キャプチャ |
| `translate.ts` | 画像Base64 → LLMプロバイダ呼び出し → `TranslateResult` 返却・時間計測 |
| `store.ts` | `electron-store` で設定（APIキー・言語・モデル・ダークモード）永続化 |

**キャプチャ処理の注意点:**
- `screen.getAllDisplays()` でマルチモニタ対応
- `scaleFactor` を考慮して DPI 倍率に対応する

**プロンプト管理:**
- プロンプトは `prompt.yaml` で管理し、`prompts.ts` 経由で読み込む（`docs/sample` 参照）
- 翻訳先言語はプロンプト文字列に動的に差し込む（テンプレート置換）
- 出力スキーマは `zod` で定義: `{ originalLanguage, original, translated }`

**セキュリティ方針:**
- APIキーはメインプロセス (`store.ts`) のみで保持・使用する
- レンダラーには絶対に渡さない

### 2-3. ウィンドウ管理 (`src/main/windows/`)

| ファイル | 実装内容 |
|---|---|
| `main.ts` | メインウィンドウ生成（`frame: false` でカスタムタイトルバー）|
| `capture.ts` | キャプチャ用透過オーバーレイウィンドウ |

**メインウィンドウ:**
- `frame: false` でカスタムタイトルバー
- ドラッグ領域・ウィンドウ操作ボタン（最小化・最大化・閉じる）は React で実装

**キャプチャウィンドウ:**
- ディスプレイごとに透過ウィンドウを生成（マルチモニタ対応）
- `alwaysOnTop: true`, `transparent: true`, `frame: false`
- 矩形選択完了後、ウィンドウを閉じてメインウィンドウに結果を返す

### 2-4. IPC ハンドラ (`src/main/ipc/`)

| ファイル | チャンネル | 方向 |
|---|---|---|
| `capture.ts` | `capture:start`, `capture:result` | renderer → main, main → renderer |
| `translate.ts` | `translate:execute` | renderer → main (invoke) |
| `settings.ts` | `settings:get`, `settings:set` | renderer → main (invoke) |

### 2-5. グローバルショートカット

- `globalShortcut.register('Ctrl+Shift+P', ...)` でキャプチャを起動
- アプリ起動時に登録、終了時に解除

### 2-6. メインエントリーポイント (`src/main/index.ts`)

- ウィンドウ生成
- IPCハンドラの登録
- グローバルショートカットの登録
- アプリライフサイクル管理

---

## フェーズ 3: プリロード (`src/preload/`)

`contextBridge.exposeInMainWorld('api', { ... })` で IPC を安全にレンダラーへ公開する。

```typescript
// 公開するAPI
window.api = {
  capture: { start, onResult },
  translate: { execute },
  settings: { get, set },
  window: { minimize, maximize, close },
}
```

型定義は `index.d.ts` に記述し、レンダラー側で型安全に使用できるようにする。

---

## フェーズ 4: レンダラー (React)

### 4-1. i18n (`src/renderer/src/i18n/`)

- `i18next` + `react-i18next` セットアップ
- `ja.json` / `en.json` に全テキストを管理
- デフォルトは OS のロケールから自動検出
- 設定で手動変更可能

### 4-2. 状態管理 (`src/renderer/src/stores/`)

| ストア | 管理する状態 |
|---|---|
| `translationStore.ts` | 翻訳結果・履歴（メモリのみ）・ローディング状態・エラー・経過時間 |
| `settingsStore.ts` | 言語・ダークモード・選択中プロバイダ・モデル |

### 4-3. カスタムフック (`src/renderer/src/hooks/`)

| フック | 役割 |
|---|---|
| `useCapture.ts` | キャプチャ開始・IPC経由での結果受け取り |
| `useTranslation.ts` | 翻訳実行・履歴への追加 |
| `useSettings.ts` | 設定読み書き（IPC経由でメインプロセスの永続化ストアと同期）|

### 4-4. UIコンポーネント (`src/renderer/src/components/`)

#### カスタムタイトルバー (`layout/TitleBar.tsx`)

- ドラッグ領域（`-webkit-app-region: drag`）
- 最小化・最大化・閉じるボタン
- アプリ名表示

#### メイン画面 (`App.tsx`)

以下の要素を配置する:

- **カスタムタイトルバー**
- **選択ボタン**: クリックまたは `Ctrl+Shift+P` でキャプチャオーバーレイを起動
- **設定ボタン**: 設定モーダルを開く
- **翻訳先言語セレクタ**: デフォルトは OS ロケール
- **LLM プロバイダ切り替え**: 有効なプロバイダの中からセレクト
- **ダークモード切り替えボタン**
- **翻訳結果エリア**: 翻訳前テキスト（ホバーで元画像プレビュー）・翻訳後テキスト・経過時間
- **翻訳履歴**: 過去の翻訳結果一覧

#### コンポーネント一覧

| コンポーネント | 実装内容 |
|---|---|
| `layout/TitleBar.tsx` | カスタムタイトルバー（ドラッグ領域・ウィンドウ操作ボタン）|
| `translation/TranslationResult.tsx` | 翻訳前後テキスト表示、ホバーで画像プレビュー、経過時間 |
| `translation/TranslationHistory.tsx` | 過去の翻訳履歴一覧（メモリ上のみ）|
| `capture/CaptureOverlay.tsx` | 全画面透過ウィンドウ上での矩形選択UI |
| `settings/SettingsModal.tsx` | タブ切り替えモーダル本体 |
| `settings/GeneralTab.tsx` | 言語設定 |
| `settings/LLMTab.tsx` | APIキー・モデル設定（プロバイダごとに条件付き表示）|

---

## フェーズ 5: 仕上げ・品質

- **ダークモード**: Tailwind の `dark:` クラス + Shadcn テーマ変数で実装、`settingsStore` の値をルート要素の `class` に反映
- **エラーハンドリング**: 翻訳失敗時にエラーメッセージをUIに表示（ネットワークエラー・APIキー未設定等）
- **ローディング状態**: 翻訳中はスピナー表示
- **動作確認**: 各フェーズ完了後に手動動作確認

---

## 設計の要点

- **プロバイダ拡張**: `src/main/llm/providers/` にファイルを追加して `index.ts` に登録するだけ
- **型安全**: `src/shared/types.ts` でIPC通信の型を共有し、main・renderer間の型安全を担保
- **セキュリティ**: APIキーはメインプロセスのみで扱う
- **マルチモニタ/DPI**: `screen.getAllDisplays()` + `scaleFactor` で対応
- **グローバルショートカット**: `Ctrl+Shift+P` でいつでもキャプチャ起動
- **カスタムタイトルバー**: モダンなデザインのため `frame: false` + React 実装
