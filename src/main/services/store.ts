/**
 * 設定の永続化ストア
 */

import Store from 'electron-store'
import { app } from 'electron'
import type { AppSettings } from '../../shared/types'

/**
 * OSのロケールから言語を検出
 */
function detectLanguage(): 'ja' | 'en' {
  const locale = app.getLocale()
  return locale.startsWith('ja') ? 'ja' : 'en'
}

/**
 * デフォルト設定
 */
const defaultSettings: AppSettings = {
  language: detectLanguage(),
  darkMode: false,
  selectedProvider: 'codex',
  providers: {
    groq: {
      apiKey: '',
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    },
    codex: {
      model: 'gpt-5.1-codex-mini',
    },
  },
}

/**
 * 設定ストアのインスタンス
 */
const store = new Store<AppSettings>({
  defaults: defaultSettings,
})

/**
 * 設定を取得
 */
export function getSettings(): AppSettings {
  return store.store
}

/**
 * 設定を保存
 */
export function setSettings(settings: Partial<AppSettings>): void {
  store.store = { ...store.store, ...settings }
}

/**
 * 特定の設定値を取得
 */
export function getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
  return store.get(key)
}

/**
 * 特定の設定値を保存
 */
export function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
  store.set(key, value)
}

/**
 * 設定をリセット
 */
export function resetSettings(): void {
  store.clear()
}
