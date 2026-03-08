/**
 * 設定の永続化ストア
 */

import { app } from 'electron'
import type { AppSettings } from '../../shared/types'

// electron-store v11はESMなので動的インポート
let Store: any

async function initStore() {
  if (!Store) {
    const module = await import('electron-store')
    Store = module.default
  }
  return Store
}

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
 * 設定ストアのインスタンス（遅延初期化）
 */
let storeInstance: any = null

async function getStoreInstance() {
  if (!storeInstance) {
    const StoreClass = await initStore()
    storeInstance = new StoreClass<AppSettings>({
      defaults: defaultSettings,
    })
  }
  return storeInstance
}

/**
 * 設定を取得
 */
export async function getSettings(): Promise<AppSettings> {
  const store = await getStoreInstance()
  return store.store
}

/**
 * 設定を保存
 */
export async function setSettings(settings: Partial<AppSettings>): Promise<void> {
  const store = await getStoreInstance()
  store.store = { ...store.store, ...settings }
}

/**
 * 特定の設定値を取得
 */
export async function getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
  const store = await getStoreInstance()
  return store.get(key)
}

/**
 * 特定の設定値を保存
 */
export async function setSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  const store = await getStoreInstance()
  store.set(key, value)
}

/**
 * 設定をリセット
 */
export async function resetSettings(): Promise<void> {
  const store = await getStoreInstance()
  store.clear()
}
