/**
 * OpenAIプロバイダ実装
 */

import { generateText, Output } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import type { LLMProvider, ProviderTestParams, TranslateParams, TranslateOutput } from '../types'
import { getTranslatePrompt } from '../prompts'

/**
 * 翻訳結果のスキーマ
 */
const translateResultSchema = z.object({
  originalLanguage: z.string(),
  original: z.string(),
  translated: z.string()
})

/**
 * OpenAIプロバイダ
 * APIキー必要
 */
export class OpenAIProvider implements LLMProvider {
  requiresApiKey = true

  availableModels = ['gpt-5-nano-2025-08-07']

  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required')
    }
  }

  async testConnection(params: ProviderTestParams): Promise<void> {
    const openai = createOpenAI({
      apiKey: this.apiKey
    })

    await generateText({
      model: openai(params.model),
      prompt: 'Reply with OK',
      maxOutputTokens: 16
    })
  }

  async translate(params: TranslateParams): Promise<TranslateOutput> {
    const { imageBase64, targetLanguage, model } = params

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    const openai = createOpenAI({
      apiKey: this.apiKey
    })

    const result = await generateText({
      model: openai(model),
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
