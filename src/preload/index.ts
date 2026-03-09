/**
 * LMOTプリロードスクリプト
 * contextBridgeを使用してIPCをレンダラーに安全に公開
 */

import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  IPC_CHANNELS,
  type AppSettings,
  type ProviderTestRequest,
  type TranslateRequest,
  type TranslateResult,
  type UpdateAvailableEvent,
  type UpdateCheckRequest,
  type UpdateDownloadedEvent,
  type UpdateDownloadProgressEvent,
  type UpdateErrorEvent,
  type UpdateNotAvailableEvent
} from '../shared/types'

// レンダラーに公開するAPI
const api = {
  // キャプチャ関連
  capture: {
    /**
     * キャプチャを開始
     */
    start: (): void => {
      ipcRenderer.send(IPC_CHANNELS.CAPTURE_START)
    },

    /**
     * キャプチャ結果を受信
     * @param callback キャプチャ結果を受け取るコールバック
     * @returns クリーンアップ関数
     */
    onResult: (callback: (imageBase64: string | null) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, imageBase64: string | null): void => {
        callback(imageBase64)
      }
      ipcRenderer.on(IPC_CHANNELS.CAPTURE_RESULT, listener)

      // クリーンアップ関数を返す
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.CAPTURE_RESULT, listener)
      }
    },

    /**
     * 事前キャプチャ済みスクリーンショットを受信
     */
    onScreenshot: (callback: (dataUrl: string) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, dataUrl: string): void => {
        callback(dataUrl)
      }
      ipcRenderer.on(IPC_CHANNELS.CAPTURE_SCREENSHOT, listener)
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.CAPTURE_SCREENSHOT, listener)
      }
    },

    /**
     * キャプチャ結果（選択領域）を送信
     */
    sendResult: (region: { x: number; y: number; width: number; height: number }): void => {
      ipcRenderer.send(IPC_CHANNELS.CAPTURE_RESULT, region)
    },

    /**
     * キャプチャをキャンセル
     */
    cancel: (): void => {
      ipcRenderer.send(IPC_CHANNELS.CAPTURE_CANCEL)
    }
  },

  // 翻訳関連
  translate: {
    /**
     * 翻訳を実行
     * @param request 翻訳リクエスト
     * @returns 翻訳結果
     */
    execute: async (request: TranslateRequest): Promise<TranslateResult> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.TRANSLATE_EXECUTE, request)
    },

    /**
     * プロバイダ接続テスト
     */
    testProvider: async (request: ProviderTestRequest): Promise<void> => {
      await ipcRenderer.invoke(IPC_CHANNELS.PROVIDER_TEST, request)
    }
  },

  // 設定関連
  settings: {
    /**
     * 設定を取得
     * @returns アプリケーション設定
     */
    get: async (): Promise<AppSettings> => {
      return await ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET)
    },

    /**
     * 設定を保存
     * @param settings 保存する設定（部分的でもOK）
     */
    set: async (settings: Partial<AppSettings>): Promise<void> => {
      await ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings)
    }
  },

  updater: {
    check: async (request?: UpdateCheckRequest): Promise<void> => {
      await ipcRenderer.invoke(IPC_CHANNELS.UPDATER_CHECK, request)
    },

    download: async (): Promise<void> => {
      await ipcRenderer.invoke(IPC_CHANNELS.UPDATER_DOWNLOAD)
    },

    install: async (): Promise<void> => {
      await ipcRenderer.invoke(IPC_CHANNELS.UPDATER_INSTALL)
    },

    onUpdateAvailable: (callback: (payload: UpdateAvailableEvent) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: UpdateAvailableEvent): void => {
        callback(payload)
      }

      ipcRenderer.on(IPC_CHANNELS.UPDATER_UPDATE_AVAILABLE, listener)

      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.UPDATER_UPDATE_AVAILABLE, listener)
      }
    },

    onUpdateNotAvailable: (callback: (payload: UpdateNotAvailableEvent) => void): (() => void) => {
      const listener = (
        _event: Electron.IpcRendererEvent,
        payload: UpdateNotAvailableEvent
      ): void => {
        callback(payload)
      }

      ipcRenderer.on(IPC_CHANNELS.UPDATER_UPDATE_NOT_AVAILABLE, listener)

      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.UPDATER_UPDATE_NOT_AVAILABLE, listener)
      }
    },

    onDownloadProgress: (
      callback: (payload: UpdateDownloadProgressEvent) => void
    ): (() => void) => {
      const listener = (
        _event: Electron.IpcRendererEvent,
        payload: UpdateDownloadProgressEvent
      ): void => {
        callback(payload)
      }

      ipcRenderer.on(IPC_CHANNELS.UPDATER_DOWNLOAD_PROGRESS, listener)

      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.UPDATER_DOWNLOAD_PROGRESS, listener)
      }
    },

    onUpdateDownloaded: (callback: (payload: UpdateDownloadedEvent) => void): (() => void) => {
      const listener = (
        _event: Electron.IpcRendererEvent,
        payload: UpdateDownloadedEvent
      ): void => {
        callback(payload)
      }

      ipcRenderer.on(IPC_CHANNELS.UPDATER_UPDATE_DOWNLOADED, listener)

      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.UPDATER_UPDATE_DOWNLOADED, listener)
      }
    },

    onError: (callback: (payload: UpdateErrorEvent) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: UpdateErrorEvent): void => {
        callback(payload)
      }

      ipcRenderer.on(IPC_CHANNELS.UPDATER_ERROR, listener)

      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.UPDATER_ERROR, listener)
      }
    }
  },

  // ウィンドウ操作
  window: {
    /**
     * ウィンドウを最小化
     */
    minimize: (): void => {
      ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE)
    },

    /**
     * ウィンドウを最大化/復元
     */
    maximize: (): void => {
      ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE)
    },

    /**
     * ウィンドウを閉じる
     */
    close: (): void => {
      ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE)
    }
  }
}

// contextBridgeを使用してAPIを安全に公開
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Failed to expose APIs:', error)
  }
} else {
  // contextIsolationが無効な場合（開発時など）
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
