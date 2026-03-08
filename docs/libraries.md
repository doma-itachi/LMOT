# 使用ライブラリ

## 本番依存 (dependencies)

| パッケージ | 用途 |
|---|---|
| `ai` | Vercel AI SDK コア（generateText, Output等）|
| `ai-sdk-provider-codex-cli` | Codex プロバイダ（APIキー不要）|
| `@ai-sdk/groq` | Groq プロバイダ |
| `zod` | スキーマバリデーション（翻訳結果の型保証）|
| `electron-store` | 設定の永続化（APIキー・言語・ダークモード等）|
| `zustand` | レンダラー側グローバル状態管理 |
| `i18next` | 多言語対応コア（日本語・英語）|
| `react-i18next` | React向け i18next バインディング |

## 開発依存 (devDependencies)

| パッケージ | 用途 |
|---|---|
| `shadcn` (CLI) | Shadcn UIコンポーネントの追加（`bunx shadcn add`）|

## Shadcn コンポーネント（追加予定）

`bunx shadcn@latest init` 後に必要なものを追加する。

| コンポーネント | 用途 |
|---|---|
| `button` | 各種ボタン |
| `dialog` | 設定モーダル |
| `tabs` | 設定モーダルのタブ |
| `select` | 言語・プロバイダ・モデル選択 |
| `input` | APIキー入力 |
| `tooltip` | ホバー時の画像プレビュー |
| `scroll-area` | 翻訳履歴のスクロール |
| `badge` | 経過時間表示等 |
| `separator` | UI区切り |

## インストールコマンド

```bash
# 本番依存
bun add ai ai-sdk-provider-codex-cli @ai-sdk/groq zod electron-store zustand i18next react-i18next

# Shadcn 初期化
bunx shadcn@latest init

# Shadcn コンポーネント追加
bunx shadcn@latest add button dialog tabs select input tooltip scroll-area badge separator
```
