/**
 * LLMプロバイダファクトリ
 */

import type { ProviderKey } from '../../shared/types'
import type { LLMProvider } from './types'
import { CodexProvider } from './providers/codex'
import { GroqProvider } from './providers/groq'

/**
 * プロバイダインスタンスを取得する
 * @param key プロバイダキー
 * @param apiKey APIキー（必要な場合）
 * @returns プロバイダインスタンス
 */
export function getProvider(key: ProviderKey, apiKey?: string): LLMProvider {
  switch (key) {
    case 'codex':
      return new CodexProvider()
    case 'groq':
      if (!apiKey) {
        throw new Error('Groq provider requires an API key')
      }
      return new GroqProvider(apiKey)
    default:
      throw new Error(`Unknown provider: ${key}`)
  }
}

/**
 * プロバイダが利用可能かチェックする
 * @param key プロバイダキー
 * @param apiKey APIキー（必要な場合）
 * @returns 利用可能な場合true
 */
export function isProviderAvailable(key: ProviderKey, apiKey?: string): boolean {
  try {
    const provider = getProvider(key, apiKey)
    return !provider.requiresApiKey || !!apiKey
  } catch {
    return false
  }
}

// 型と関数を再エクスポート
export type { LLMProvider, TranslateParams, TranslateOutput } from './types'
export { getTranslatePrompt } from './prompts'
