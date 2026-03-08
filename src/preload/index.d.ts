import { ElectronAPI } from '@electron-toolkit/preload'
import type { TranslateRequest, TranslateResult, AppSettings } from '../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      capture: {
        start: () => void
        onResult: (callback: (imageBase64: string | null) => void) => () => void
        cancel: () => void
      }
      translate: {
        execute: (request: TranslateRequest) => Promise<TranslateResult>
      }
      settings: {
        get: () => Promise<AppSettings>
        set: (settings: Partial<AppSettings>) => Promise<void>
      }
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
      }
    }
  }
}

