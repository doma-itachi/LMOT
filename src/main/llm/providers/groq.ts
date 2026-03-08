/**
 * Groqプロバイダ実装
 */

import { generateText, Output } from 'ai'
import { createGroq } from '@ai-sdk/groq'
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
 * Groqプロバイダ
 * APIキー必要
 */
export class GroqProvider implements LLMProvider {
  requiresApiKey = true

  availableModels = ['meta-llama/llama-4-scout-17b-16e-instruct']

  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error('Groq API key is required')
    }
  }

  async translate(params: TranslateParams): Promise<TranslateOutput> {
    const { imageBase64, targetLanguage, model } = params

    // Base64文字列からBufferに変換（data:image/png;base64,プレフィックスを除去）
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // APIキーを使ってGroqクライアントを作成
    const groq = createGroq({
      apiKey: this.apiKey,
    })

    const result = await generateText({
      model: groq(model),
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
