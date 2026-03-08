/**
 * LMOT 共通型定義
 * メインプロセスとレンダラープロセス間で共有する型・定数を定義
 */

// =============================================================================
// プロバイダ関連
// =============================================================================

/**
 * 利用可能なLLMプロバイダのキー
 */
export type ProviderKey = 'codex' | 'groq'

// =============================================================================
// 翻訳関連
// =============================================================================

/**
 * サポート対象の翻訳先言語
 */
export type TargetLanguage = 'ja' | 'en' | 'zh' | 'ko' | 'fr' | 'de' | 'es'

/**
 * 翻訳結果
 */
export type TranslateResult = {
  /** 元の言語 */
  originalLanguage: string
  /** 翻訳前のテキスト */
  original: string
  /** 翻訳後のテキスト */
  translated: string
  /** 処理にかかった時間（ミリ秒） */
  elapsedMs: number
  /** キャプチャした画像（Base64エンコード） */
  imageBase64: string
}

/**
 * 翻訳リクエスト
 */
export type TranslateRequest = {
  /** 翻訳する画像（Base64エンコード） */
  imageBase64: string
  /** 翻訳先の言語 */
  targetLanguage: TargetLanguage
  /** 使用するプロバイダ */
  providerKey: ProviderKey
}

// =============================================================================
// 設定関連
// =============================================================================

/**
 * アプリケーション設定
 */
export type AppSettings = {
  /** UI言語 */
  language: 'ja' | 'en'
  /** ダークモード有効/無効 */
  darkMode: boolean
  /** 選択中のプロバイダ */
  selectedProvider: ProviderKey
  /** 各プロバイダの設定 */
  providers: {
    groq: {
      /** APIキー */
      apiKey: string
      /** 使用するモデル */
      model: string
    }
    codex: {
      /** 使用するモデル */
      model: string
    }
  }
}

// =============================================================================
// IPC通信チャンネル定数
// =============================================================================

/**
 * IPC通信で使用するチャンネル名
 * 文字列リテラルの重複を防ぎ、型安全性を確保する
 */
export const IPC_CHANNELS = {
  // キャプチャ関連
  CAPTURE_START: 'capture:start',
  CAPTURE_RESULT: 'capture:result',
  CAPTURE_CANCEL: 'capture:cancel',
  CAPTURE_SCREENSHOT: 'capture:screenshot',

  // 翻訳関連
  TRANSLATE_EXECUTE: 'translate:execute',

  // 設定関連
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // ウィンドウ操作
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close'
} as const

/**
 * IPCチャンネル名の型
 */
export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
