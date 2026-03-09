/**
 * プロバイダ接続テストサービス
 */

import { PROVIDER_DEFINITIONS, type ProviderTestRequest } from '../../shared/types'
import { getProvider } from '../llm'

/**
 * 指定プロバイダで最小コストの接続テストを実行
 */
export async function testProviderConnection(request: ProviderTestRequest): Promise<void> {
  const { providerKey, model, apiKey } = request
  const providerDefinition = PROVIDER_DEFINITIONS[providerKey]

  if (!providerDefinition) {
    throw new Error(`Unknown provider: ${providerKey}`)
  }

  if (providerDefinition.requiresApiKey && !apiKey) {
    throw new Error(`${providerDefinition.label} API key is required`)
  }

  const provider = getProvider(providerKey, apiKey)
  await provider.testConnection({ model })
}
