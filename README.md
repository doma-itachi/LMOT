# LMOT(Language Model OCR Translator)

LLMを用いたOCR翻訳ツールです。\
画面上の文字や画像を選択して文字起こし＆翻訳をすることができます。

- 👩‍🏫LLMを用いるため高い精度で翻訳できます
- 💵Codexを使えばChatGPT Plus以上の方は無料で使えます
- 🌐多言語対応（現状日本語・英語のみ）
- 🗃️履歴機能（起動中のみ）

### 対応モデル
|プロバイダ|モデル名|特徴|スピード(開発者環境)|
|--|---|---|---|
|[Codex](https://openai.com/ja-JP/codex/)|gpt-5.1-codex-mini|Codex CLIを利用するため(ほぼ)無料です|普通(4.5~11秒)|
|[Groq](https://console.groq.com/)|llama-4-scout-17b|APIキーを指定することで使用できます|超高速⚡(1~3秒)|

## 貢献
貢献を歓迎します

- **バグ報告・機能要望**: リポジトリの Issues からお願いします
- **プルリクエスト**: 修正や機能追加は PR で送ってください。大きな変更の場合は先に Issue で相談するとスムーズです
- **開発の始め方**: 下記の [Project Setup](#project-setup) に従って環境を用意し、`bun run dev` で動作確認できます

## 著者
doma-itachi @itachi_yukari

## ライセンス
Copyright (c) 2026 doma-itachi\
このプロジェクトはMITライセンスの下で公開されています

## Project Setup

### Install

```bash
$ bun install
```

### Development

```bash
$ bun run dev
```

### Build

```bash
# For windows
$ bun run build:win

# For macOS
$ bun run build:mac

# For Linux
$ bun run build:linux
```
