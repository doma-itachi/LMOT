/**
 * Geminiプロバイダ実装
 */

import { generateText, Output } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
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
 * Geminiプロバイダ
 * APIキー必要
 */
export class GeminiProvider implements LLMProvider {
  requiresApiKey = true

  availableModels = ['gemini-3.1-flash-lite-preview']

  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required')
    }
  }

  async testConnection(params: ProviderTestParams): Promise<void> {
    const google = createGoogleGenerativeAI({
      apiKey: this.apiKey
    })

    await generateText({
      model: google(params.model),
      prompt: 'Reply with OK',
      maxOutputTokens: 4
    })
  }

  async translate(params: TranslateParams): Promise<TranslateOutput> {
    const { imageBase64, targetLanguage, model } = params

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    const google = createGoogleGenerativeAI({
      apiKey: this.apiKey
    })

    const result = await generateText({
      model: google(model),
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
