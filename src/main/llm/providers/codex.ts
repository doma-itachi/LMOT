/**
 * Codexプロバイダ実装
 */

import { join } from 'path'
import { app } from 'electron'
import { generateText, Output } from 'ai'
import { codexCli } from 'ai-sdk-provider-codex-cli'
import { z } from 'zod'
import type { LLMProvider, ProviderTestParams, TranslateParams, TranslateOutput } from '../types'
import { getTranslatePrompt } from '../prompts'

const translateResultSchema = z.object({
  originalLanguage: z.string(),
  original: z.string(),
  translated: z.string()
})

/**
 * パッケージ済みアプリではasarから展開された@openai/codexのパスを返す。
 * 開発時はundefined（プロバイダの自動解決に任せる）。
 */
function getCodexPath(): string | undefined {
  if (!app.isPackaged) return undefined
  const unpackedRoot = app.getAppPath().replace('app.asar', 'app.asar.unpacked')
  return join(unpackedRoot, 'node_modules', '@openai', 'codex', 'bin', 'codex.js')
}

/**
 * Codexプロバイダ
 * APIキー不要、ユーザー環境にCodex CLIがインストールされている前提
 */
export class CodexProvider implements LLMProvider {
  requiresApiKey = false

  availableModels = ['gpt-5.1-codex-mini']

  private modelSettings(overrides?: Record<string, unknown>) {
    return {
      reasoningEffort: 'low' as const,
      codexPath: getCodexPath(),
      ...overrides
    }
  }

  async testConnection(params: ProviderTestParams): Promise<void> {
    await generateText({
      model: codexCli(params.model, this.modelSettings()),
      prompt: 'Reply with OK',
      maxOutputTokens: 4
    })
  }

  async translate(params: TranslateParams): Promise<TranslateOutput> {
    const { imageBase64, targetLanguage, model } = params

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    const result = await generateText({
      model: codexCli(model, this.modelSettings()),
      output: Output.object({
        schema: translateResultSchema
      }),
      prompt: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: getTranslatePrompt(targetLanguage)
            },
            {
              type: 'image',
              image: imageBuffer
            }
          ]
        }
      ]
    })

    return result.output
  }
}
