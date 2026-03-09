/**
 * 翻訳サービス
 */

import {
  PROVIDER_DEFINITIONS,
  type TranslateRequest,
  type TranslateResult
} from '../../shared/types'
import { getProvider } from '../llm'
import { getSettings } from './store'

/**
 * 翻訳を実行
 * @param request 翻訳リクエスト
 * @returns 翻訳結果
 */
export async function executeTranslation(request: TranslateRequest): Promise<TranslateResult> {
  const startTime = Date.now()

  try {
    // 設定を取得
    const settings = await getSettings()
    const { providerKey, targetLanguage, imageBase64 } = request

    const providerDefinition = PROVIDER_DEFINITIONS[providerKey]
    if (!providerDefinition) {
      throw new Error(`Unknown provider: ${providerKey}`)
    }

    const providerSettings = settings.providers[providerKey]
    const model = providerSettings.model
    const apiKey = 'apiKey' in providerSettings ? providerSettings.apiKey : undefined

    if (providerDefinition.requiresApiKey && !apiKey) {
      throw new Error(`${providerDefinition.label} API key is not configured`)
    }

    // プロバイダインスタンスを取得
    const provider = getProvider(providerKey, apiKey)

    // 翻訳実行
    const result = await provider.translate({
      imageBase64,
      targetLanguage,
      model
    })

    // 経過時間を計算
    const elapsedMs = Date.now() - startTime

    // 結果を返す
    return {
      ...result,
      elapsedMs,
      imageBase64
    }
  } catch (error) {
    const elapsedMs = Date.now() - startTime

    // エラーメッセージを整形
    let errorMessage = 'Translation failed'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    throw new Error(`${errorMessage} (elapsed: ${elapsedMs}ms)`)
  }
}
