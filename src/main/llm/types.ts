/**
 * LLMプロバイダの共通インターフェースと型定義
 */

/**
 * 翻訳リクエストパラメータ
 */
export type TranslateParams = {
  /** 画像データ（Base64エンコード） */
  imageBase64: string
  /** 翻訳先の言語 */
  targetLanguage: string
  /** 使用するモデル */
  model: string
}

/**
 * 翻訳結果（LLMからの出力）
 */
export type TranslateOutput = {
  /** 元の言語 */
  originalLanguage: string
  /** 翻訳前のテキスト */
  original: string
  /** 翻訳後のテキスト */
  translated: string
}

/**
 * LLMプロバイダインターフェース
 * 新しいプロバイダを追加する際はこのインターフェースを実装する
 */
export interface LLMProvider {
  /** APIキーが必要かどうか */
  requiresApiKey: boolean

  /** 利用可能なモデルのリスト */
  availableModels: string[]

  /**
   * 画像から文字を抽出し、指定言語に翻訳する
   * @param params 翻訳パラメータ
   * @returns 翻訳結果
   */
  translate(params: TranslateParams): Promise<TranslateOutput>
}
