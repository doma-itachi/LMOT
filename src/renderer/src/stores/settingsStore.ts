/**
 * 設定状態管理ストア
 */

import { create } from 'zustand'
import type { AppSettings } from '../../../shared/types'

type SettingsStore = {
  // 設定
  settings: AppSettings | null
  // ローディング状態
  isLoading: boolean

  // アクション
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>
  toggleDarkMode: () => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true })
    try {
      const settings = await window.api.settings.get()
      set({ settings, isLoading: false })
    } catch (error) {
      console.error('Failed to load settings:', error)
      set({ isLoading: false })
    }
  },

  updateSettings: async (newSettings) => {
    try {
      await window.api.settings.set(newSettings)
      const settings = await window.api.settings.get()
      set({ settings })
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  },

  toggleDarkMode: async () => {
    const { settings } = get()
    if (settings) {
      await get().updateSettings({ darkMode: !settings.darkMode })
    }
  },
}))
