/**
 * 翻訳機能のカスタムフック
 */

import { useTranslationStore } from '../stores/translationStore'
import { useSettingsStore } from '../stores/settingsStore'

export function useTranslation() {
  const translationStore = useTranslationStore()
  const settingsStore = useSettingsStore()

  const executeTranslation = async (imageBase64: string) => {
    translationStore.setLoading(true)
    translationStore.setError(null)

    try {
      const settings = settingsStore.settings
      if (!settings) {
        throw new Error('Settings not loaded')
      }

      const result = await window.api.translate.execute({
        imageBase64,
        targetLanguage: translationStore.targetLanguage,
        providerKey: settings.selectedProvider,
      })

      translationStore.addTranslation(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Translation failed'
      translationStore.setError(errorMessage)
      console.error('Translation error:', error)
    } finally {
      translationStore.setLoading(false)
    }
  }

  return { executeTranslation }
}
