import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  AppSettings,
  ProviderTestRequest,
  TranslateRequest,
  TranslateResult
} from '../shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      capture: {
        start: () => void
        onScreenshot: (callback: (dataUrl: string) => void) => () => void
        sendResult: (region: { x: number; y: number; width: number; height: number }) => void
        onResult: (callback: (imageBase64: string | null) => void) => () => void
        cancel: () => void
      }
      translate: {
        execute: (request: TranslateRequest) => Promise<TranslateResult>
        testProvider: (request: ProviderTestRequest) => Promise<void>
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
