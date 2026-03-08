# LMOT
PCOTのようなゲーム用の翻訳ソフト

## 主な機能
選択ボタンを押して画面の範囲を選択するとそこがキャプチャされ、LLMによってOCR・翻訳された文章が出てくる
Vercel AI SDKにより、CodexやGroqなどのLLMを使用することができる
多言語対応（日本語と英語のみ）
ダークモード

## 対応LLM
とりあえずこの2つで
あとで拡張できるように柔軟な構造にする
- Codex（APIキー不要、ユーザー環境に Codex CLI がインストールされている前提）
- Groq（APIキー必要）

## 対象プラットフォーム
Windows(対応できるならMac/Linuxも、無理にはしなくてもいい)

## 画面
モダンなUIにする
デザインはこれに寄せる（./design_reference.png）（レイアウトは別に寄せなくていい）
ウィンドウフレームはカスタムタイトルバー（frame: false）にする
カラー: ブルー系アクセント + 白基調（ダークモード時は反転）、角丸・ソフトシャドウ

### メイン画面
- 選択ボタン
- 設定モーダルを開くボタン
- 翻訳先言語を選択するボタン（デフォルトはマシンの設定）
- 前の翻訳も見ることができる（履歴機能・メモリ上のみ、アプリ終了で消える）
- 翻訳前の文章と翻訳された文章（翻訳前をホバーすると画像が見れる）
- 有効なLLMの中から切り替えることができる
- 翻訳にかかった時間
- ダークモード切り替えボタン

### 設定モーダル
- 一般タブとLLM設定タブ
- 一般タブではとりあえず言語設定だけ（日本語・英語）
- LLM設定タブではGroqなどAPIキーが必要なものを設定できる、モデルも選択できるようにする（モデルの種類はコード内で定義できればいい）（プロバイダによってAPIキーがいらない物がある(Codexがそう)、柔軟な設計にする）

### キャプチャ画面
メイン画面の選択ボタンを押すと画面全体がちょっと暗くなって矩形選択できるようにする（デュアルディスプレイ・解像度倍率にも対応する）
イメージはSnippingToolみたいな感じ
Ctrl+Shift+P のグローバルショートカットでも起動できる（PCOTと同じ）

## フロー
ソフトを起動する
→選択ボタンを押す
→翻訳したい部分をドラッグで選択する
→選択するとメイン画面に戻り、ロードする
→ロード後、翻訳結果が出る
→失敗時は失敗した旨を表示する

## 技術面
electron-viteを使用する(https://electron-vite.org/guide/)
翻訳するサンプルは./sampleにある(LLMに画像とプロンプトを渡してOCRさせると同時に)

スタイリングはTailwindを使用する
UIフレームワークはReact、Typescriptを使用する
必要に応じてShadcnやその他のライブラリも使用してOK
パッケージマネージャーはbun
テストも必要であればbun test

フォルダ・ファイル構成は人間でもわかりやすいようにする
Providerはできるだけ柔軟で拡張しやすくする

## ディレクトリ構成

```
lmot/
├── build/                        # ビルド成果物・アイコン等
├── docs/                         # ドキュメント・サンプル
│   ├── sample/                   # LLMプロンプトのサンプル
│   ├── design_reference.png
│   └── req.md
├── resources/                    # アプリアイコン等の静的リソース
├── src/
│   ├── main/                     # Electronメインプロセス
│   │   ├── index.ts              # エントリーポイント・ウィンドウ生成
│   │   ├── windows/              # ウィンドウ管理
│   │   │   ├── main.ts           # メインウィンドウ
│   │   │   └── capture.ts        # キャプチャオーバーレイウィンドウ
│   │   ├── ipc/                  # IPCハンドラ（renderer ↔ main 通信）
│   │   │   ├── capture.ts        # キャプチャ関連
│   │   │   ├── translate.ts      # 翻訳関連
│   │   │   └── settings.ts       # 設定関連
│   │   ├── services/             # ビジネスロジック
│   │   │   ├── capture.ts        # スクリーンキャプチャ処理
│   │   │   ├── translate.ts      # OCR・翻訳処理（LLMへの橋渡し）
│   │   │   └── store.ts          # 設定の永続化（electron-store等）
│   │   └── llm/                  # LLMプロバイダ（Vercel AI SDK）
│   │       ├── index.ts          # プロバイダファクトリ・切り替えロジック
│   │       ├── types.ts          # プロバイダ共通インターフェース
│   │       └── providers/        # 各LLMプロバイダ実装
│   │           ├── codex.ts      # Codex（APIキー不要）
│   │           └── groq.ts       # Groq（APIキー必要）
│   ├── preload/                  # プリロードスクリプト
│   │   ├── index.ts              # contextBridgeでIPCをレンダラーに公開
│   │   └── index.d.ts            # レンダラー向け型定義
│   ├── renderer/                 # レンダラープロセス（React）
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx          # エントリーポイント
│   │       ├── App.tsx           # ルートコンポーネント・ルーティング
│   │       ├── assets/           # フォント・画像等の静的アセット
│   │       ├── components/       # UIコンポーネント
│   │       │   ├── ui/           # Shadcnコンポーネント（自動生成）
│   │       │   ├── layout/       # ヘッダー・レイアウト等の共通構造
│   │       │   ├── translation/  # 翻訳結果・履歴表示
│   │       │   │   ├── TranslationResult.tsx
│   │       │   │   └── TranslationHistory.tsx
│   │       │   ├── capture/      # キャプチャオーバーレイUI
│   │       │   │   └── CaptureOverlay.tsx
│   │       │   └── settings/     # 設定モーダル
│   │       │       ├── SettingsModal.tsx
│   │       │       ├── GeneralTab.tsx    # 言語設定等
│   │       │       └── LLMTab.tsx        # APIキー・モデル設定
│   │       ├── hooks/            # カスタムReactフック
│   │       │   ├── useTranslation.ts
│   │       │   ├── useCapture.ts
│   │       │   └── useSettings.ts
│   │       ├── stores/           # グローバル状態管理（Zustand等）
│   │       │   ├── translationStore.ts
│   │       │   └── settingsStore.ts
│   │       ├── i18n/             # 多言語対応（日本語・英語）
│   │       │   ├── index.ts      # i18nセットアップ
│   │       │   └── locales/
│   │       │       ├── ja.json
│   │       │       └── en.json
│   │       ├── types/            # レンダラー側の型定義
│   │       └── lib/              # ユーティリティ・ヘルパー関数
│   └── shared/                   # main・renderer共通の型定義
│       └── types.ts              # IPC通信のペイロード型等
└── （設定ファイル群）
    ├── electron.vite.config.ts
    ├── electron-builder.yml
    ├── tsconfig.json / tsconfig.node.json / tsconfig.web.json
    ├── eslint.config.mjs
    └── package.json
```

### 設計方針

- **`src/main/llm/providers/`** に各プロバイダを1ファイルで実装し、`index.ts` のファクトリ関数で切り替える → プロバイダ追加時はファイルを追加するだけ
- **APIキーはメインプロセスのみ**で扱い、レンダラーには渡さない（セキュリティ）
- **`src/shared/types.ts`** でIPC通信の型を共有し、main・renderer間の型安全を担保する
- **キャプチャオーバーレイ**は別ウィンドウ（`windows/capture.ts`）として管理し、全画面を覆う透過ウィンドウとして実装する