/**
 * 設定の永続化ストア
 */

import { app } from 'electron'
import {
  PROVIDER_DEFINITIONS,
  createDefaultAppSettings,
  detectAppLanguage,
  type AppSettings,
  type ProviderKey
} from '../../shared/types'

// electron-store v11はESMなので動的インポート
type AppSettingsStore = {
  store: AppSettings
  get: <K extends keyof AppSettings>(key: K) => AppSettings[K]
  set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  clear: () => void
}

type StoreConstructor = new (options: { defaults: AppSettings }) => AppSettingsStore

let Store: StoreConstructor | null = null

async function initStore(): Promise<StoreConstructor> {
  if (!Store) {
    const module = await import('electron-store')
    Store = module.default as unknown as StoreConstructor
  }
  return Store
}

/**
 * デフォルト設定
 */
function createDefaultSettings(): AppSettings {
  return createDefaultAppSettings(detectAppLanguage(app.getLocale()))
}

const providerKeys = Object.keys(PROVIDER_DEFINITIONS) as ProviderKey[]

function normalizeSettings(raw: AppSettings): AppSettings {
  const selectedProvider = providerKeys.includes(raw.selectedProvider)
    ? raw.selectedProvider
    : 'codex'

  return {
    ...raw,
    selectedProvider,
    providers: {
      codex: {
        model: raw.providers?.codex?.model || PROVIDER_DEFINITIONS.codex.defaultModel
      },
      groq: {
        apiKey: raw.providers?.groq?.apiKey || '',
        model: raw.providers?.groq?.model || PROVIDER_DEFINITIONS.groq.defaultModel
      },
      openai: {
        apiKey: raw.providers?.openai?.apiKey || '',
        model: raw.providers?.openai?.model || PROVIDER_DEFINITIONS.openai.defaultModel
      },
      gemini: {
        apiKey: raw.providers?.gemini?.apiKey || '',
        model: raw.providers?.gemini?.model || PROVIDER_DEFINITIONS.gemini.defaultModel
      }
    }
  }
}

/**
 * 設定ストアのインスタンス（遅延初期化）
 */
let storeInstance: AppSettingsStore | null = null

async function getStoreInstance(): Promise<AppSettingsStore> {
  if (!storeInstance) {
    const StoreClass = await initStore()
    storeInstance = new StoreClass({
      defaults: createDefaultSettings()
    })
  }
  return storeInstance
}

/**
 * 設定を取得
 */
export async function getSettings(): Promise<AppSettings> {
  const store = await getStoreInstance()
  const normalized = normalizeSettings(store.store)
  store.store = normalized
  return normalized
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
  store.store = createDefaultSettings()
}
