/**
 * Codexプロバイダ実装
 */

import { generateText, Output } from 'ai'
import { codexCli } from 'ai-sdk-provider-codex-cli'
import { z } from 'zod'
import type { LLMProvider, TranslateParams, TranslateOutput } from '../types'
import { getTranslatePrompt } from '../prompts'

/**
 * 翻訳結果のスキーマ
 */
const translateResultSchema = z.object({
  originalLanguage: z.string(),
  original: z.string(),
  translated: z.string(),
})

/**
 * Codexプロバイダ
 * APIキー不要、ユーザー環境にCodex CLIがインストールされている前提
 */
export class CodexProvider implements LLMProvider {
  requiresApiKey = false

  availableModels = ['gpt-5.1-codex-mini', 'gpt-5.1-codex']

  async translate(params: TranslateParams): Promise<TranslateOutput> {
    const { imageBase64, targetLanguage, model } = params

    // Base64文字列からBufferに変換（data:image/png;base64,プレフィックスを除去）
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    const result = await generateText({
      model: codexCli(model, {
        reasoningEffort: 'low',
      }),
      output: Output.object({
        schema: translateResultSchema,
      }),
      prompt: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: getTranslatePrompt(targetLanguage),
            },
            {
              type: 'image',
              image: imageBuffer,
            },
          ],
        },
      ],
    })

    return result.output
  }
}
