import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  AppSettings,
  ProviderTestRequest,
  TranslateRequest,
  TranslateResult,
  UpdateAvailableEvent,
  UpdateCheckRequest,
  UpdateDownloadedEvent,
  UpdateDownloadProgressEvent,
  UpdateErrorEvent,
  UpdateNotAvailableEvent
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
      updater: {
        check: (request?: UpdateCheckRequest) => Promise<void>
        download: () => Promise<void>
        install: () => Promise<void>
        onUpdateAvailable: (callback: (payload: UpdateAvailableEvent) => void) => () => void
        onUpdateNotAvailable: (callback: (payload: UpdateNotAvailableEvent) => void) => () => void
        onDownloadProgress: (callback: (payload: UpdateDownloadProgressEvent) => void) => () => void
        onUpdateDownloaded: (callback: (payload: UpdateDownloadedEvent) => void) => () => void
        onError: (callback: (payload: UpdateErrorEvent) => void) => () => void
      }
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
      }
    }
  }
}
