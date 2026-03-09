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
export type ProviderKey = 'codex' | 'groq' | 'openai' | 'gemini'

/**
 * プロバイダ種別
 */
export type ProviderType = 'local' | 'api'

/**
 * プロバイダ定義
 */
export type ProviderDefinition = {
  /** 表示名 */
  label: string
  /** 接続種別 */
  type: ProviderType
  /** APIキーが必要かどうか */
  requiresApiKey: boolean
  /** デフォルトモデル */
  defaultModel: string
  /** 利用可能なモデル */
  availableModels: readonly string[]
}

/**
 * プロバイダ定義マップ
 */
export const PROVIDER_DEFINITIONS: Record<ProviderKey, ProviderDefinition> = {
  codex: {
    label: 'Codex',
    type: 'local',
    requiresApiKey: false,
    defaultModel: 'gpt-5.1-codex-mini',
    availableModels: ['gpt-5.1-codex-mini']
  },
  groq: {
    label: 'Groq',
    type: 'api',
    requiresApiKey: true,
    defaultModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
    availableModels: ['meta-llama/llama-4-scout-17b-16e-instruct']
  },
  openai: {
    label: 'OpenAI',
    type: 'api',
    requiresApiKey: true,
    defaultModel: 'gpt-5-nano-2025-08-07',
    availableModels: ['gpt-5-nano-2025-08-07']
  },
  gemini: {
    label: 'Gemini',
    type: 'api',
    requiresApiKey: true,
    defaultModel: 'gemini-3.1-flash-lite-preview',
    availableModels: ['gemini-3.1-flash-lite-preview']
  }
}

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

/**
 * プロバイダ接続テストリクエスト
 */
export type ProviderTestRequest = {
  /** テスト対象プロバイダ */
  providerKey: ProviderKey
  /** テストで使うモデル */
  model: string
  /** APIキー（必要な場合） */
  apiKey?: string
}

// =============================================================================
// 設定関連
// =============================================================================

export type AppLanguage = 'ja' | 'en'

/**
 * アプリケーション設定
 */
export type AppSettings = {
  /** UI言語 */
  language: AppLanguage
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
    openai: {
      /** APIキー */
      apiKey: string
      /** 使用するモデル */
      model: string
    }
    gemini: {
      /** APIキー */
      apiKey: string
      /** 使用するモデル */
      model: string
    }
  }
}

export function detectAppLanguage(locale: string): AppLanguage {
  return locale.toLowerCase().startsWith('ja') ? 'ja' : 'en'
}

export function createDefaultAppSettings(language: AppLanguage): AppSettings {
  return {
    language,
    darkMode: false,
    selectedProvider: 'codex',
    providers: {
      groq: {
        apiKey: '',
        model: PROVIDER_DEFINITIONS.groq.defaultModel
      },
      codex: {
        model: PROVIDER_DEFINITIONS.codex.defaultModel
      },
      openai: {
        apiKey: '',
        model: PROVIDER_DEFINITIONS.openai.defaultModel
      },
      gemini: {
        apiKey: '',
        model: PROVIDER_DEFINITIONS.gemini.defaultModel
      }
    }
  }
}

// =============================================================================
// アップデート関連
// =============================================================================

export type UpdateCheckRequest = {
  /** 最新版なし/失敗時の通知を抑制するか */
  silent?: boolean
}

export type UpdateCheckContext = {
  /** 最新版なし/失敗時の通知を抑制するか */
  silent: boolean
}

export type UpdateAvailableEvent = {
  /** 利用可能なバージョン */
  version: string
  /** リリース日時 */
  releaseDate?: string
  /** チェック時のコンテキスト */
  context: UpdateCheckContext
}

export type UpdateNotAvailableEvent = {
  /** チェック時のコンテキスト */
  context: UpdateCheckContext
}

export type UpdateDownloadProgressEvent = {
  /** ダウンロード進捗率 */
  percent: number
}

export type UpdateDownloadedEvent = {
  /** ダウンロード完了したバージョン */
  version: string
}

export type UpdateErrorEvent = {
  /** エラーメッセージ */
  message: string
  /** チェック時のコンテキスト */
  context: UpdateCheckContext
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
  PROVIDER_TEST: 'provider:test',

  // 設定関連
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // アップデート関連
  UPDATER_CHECK: 'updater:check',
  UPDATER_DOWNLOAD: 'updater:download',
  UPDATER_INSTALL: 'updater:install',
  UPDATER_UPDATE_AVAILABLE: 'updater:update-available',
  UPDATER_UPDATE_NOT_AVAILABLE: 'updater:update-not-available',
  UPDATER_DOWNLOAD_PROGRESS: 'updater:download-progress',
  UPDATER_UPDATE_DOWNLOADED: 'updater:update-downloaded',
  UPDATER_ERROR: 'updater:error',

  // ウィンドウ操作
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close'
} as const

/**
 * IPCチャンネル名の型
 */
export type IPCChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
