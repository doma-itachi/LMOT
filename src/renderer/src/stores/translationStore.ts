/**
 * 翻訳状態管理ストア
 */

import { create } from 'zustand'
import type { TranslateResult } from '../../../shared/types'

type TranslationStore = {
  // 現在の翻訳結果
  current: TranslateResult | null
  // 翻訳履歴（メモリのみ）
  history: TranslateResult[]
  // ローディング状態
  isLoading: boolean
  // エラーメッセージ
  error: string | null
  // 翻訳先言語
  targetLanguage: string

  // アクション
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addTranslation: (result: TranslateResult) => void
  setTargetLanguage: (lang: string) => void
  clearHistory: () => void
  setCurrent: (result: TranslateResult | null) => void
}

export const useTranslationStore = create<TranslationStore>((set) => ({
  current: null,
  history: [],
  isLoading: false,
  error: null,
  targetLanguage: 'ja',

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  addTranslation: (result) =>
    set((state) => ({
      current: result,
      history: [result, ...state.history],
      error: null,
    })),

  setTargetLanguage: (lang) => set({ targetLanguage: lang }),

  clearHistory: () => set({ history: [], current: null }),

  setCurrent: (result) => set({ current: result }),
}))
