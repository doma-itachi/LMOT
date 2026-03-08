/**
 * キャプチャ関連のIPCハンドラ
 */

import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/types'
import { createCaptureWindows, closeCaptureWindows } from '../windows/capture'
import { getMainWindow } from '../windows/main'
import type { CaptureRegion } from '../services/capture'
import { captureRegion } from '../services/capture'

/**
 * キャプチャ関連のIPCハンドラを登録
 */
export function registerCaptureHandlers(): void {
  // キャプチャ開始
  ipcMain.on(IPC_CHANNELS.CAPTURE_START, () => {
    createCaptureWindows()
  })

  // キャプチャ結果を受信
  ipcMain.on(IPC_CHANNELS.CAPTURE_RESULT, async (_event, region: CaptureRegion) => {
    try {
      // キャプチャウィンドウを閉じる
      closeCaptureWindows()

      // 指定領域をキャプチャ
      const imageBase64 = await captureRegion(region)

      // メインウィンドウに結果を送信
      const mainWindow = getMainWindow()
      if (mainWindow) {
        mainWindow.webContents.send(IPC_CHANNELS.CAPTURE_RESULT, imageBase64)
      }
    } catch (error) {
      console.error('Capture failed:', error)
      // エラーをメインウィンドウに送信
      const mainWindow = getMainWindow()
      if (mainWindow) {
        mainWindow.webContents.send(IPC_CHANNELS.CAPTURE_RESULT, null)
      }
    }
  })

  // キャプチャキャンセル
  ipcMain.on(IPC_CHANNELS.CAPTURE_CANCEL, () => {
    closeCaptureWindows()
  })
}
