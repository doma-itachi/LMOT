/**
 * LLMプロバイダファクトリ
 */

import type { ProviderKey } from '../../shared/types'
import type { LLMProvider } from './types'
import { CodexProvider } from './providers/codex'
import { GeminiProvider } from './providers/gemini'
import { GroqProvider } from './providers/groq'
import { OpenAIProvider } from './providers/openai'

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
    case 'openai':
      if (!apiKey) {
        throw new Error('OpenAI provider requires an API key')
      }
      return new OpenAIProvider(apiKey)
    case 'gemini':
      if (!apiKey) {
        throw new Error('Gemini provider requires an API key')
      }
      return new GeminiProvider(apiKey)
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
export type { LLMProvider, ProviderTestParams, TranslateParams, TranslateOutput } from './types'
export { getTranslatePrompt } from './prompts'
