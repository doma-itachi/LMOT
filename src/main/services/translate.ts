/**
 * 翻訳サービス
 */

import type { TranslateRequest, TranslateResult } from '../../shared/types'
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
    const settings = getSettings()
    const { providerKey, targetLanguage, imageBase64 } = request

    // プロバイダ設定を取得
    let apiKey: string | undefined
    let model: string

    if (providerKey === 'groq') {
      apiKey = settings.providers.groq.apiKey
      model = settings.providers.groq.model

      if (!apiKey) {
        throw new Error('Groq API key is not configured')
      }
    } else if (providerKey === 'codex') {
      model = settings.providers.codex.model
    } else {
      throw new Error(`Unknown provider: ${providerKey}`)
    }

    // プロバイダインスタンスを取得
    const provider = getProvider(providerKey, apiKey)

    // 翻訳実行
    const result = await provider.translate({
      imageBase64,
      targetLanguage,
      model,
    })

    // 経過時間を計算
    const elapsedMs = Date.now() - startTime

    // 結果を返す
    return {
      ...result,
      elapsedMs,
      imageBase64,
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
