/**
 * 設定機能のカスタムフック
 */

import { useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

export function useSettings() {
  const store = useSettingsStore()

  useEffect(() => {
    store.loadSettings()
  }, [])

  return {
    settings: store.settings,
    isLoading: store.isLoading,
    updateSettings: store.updateSettings,
    toggleDarkMode: store.toggleDarkMode,
  }
}
