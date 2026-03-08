/**
 * キャプチャ関連のIPCハンドラ
 */

import { BrowserWindow, ipcMain, screen } from 'electron'
import { IPC_CHANNELS } from '../../shared/types'
import {
  createCaptureWindows,
  closeCaptureWindows,
  getCaptureWindows,
  restoreMainWindow,
} from '../windows/capture'
import { getMainWindow } from '../windows/main'
import { captureRegion } from '../services/capture'

type SelectionRegion = { x: number; y: number; width: number; height: number }

export function registerCaptureHandlers(): void {
  ipcMain.on(IPC_CHANNELS.CAPTURE_START, () => {
    createCaptureWindows()
  })

  ipcMain.on(IPC_CHANNELS.CAPTURE_RESULT, async (event, region: SelectionRegion) => {
    try {
      const senderWindow = BrowserWindow.fromWebContents(event.sender)
      const captureWins = getCaptureWindows()
      const winIndex = captureWins.findIndex((w) => w === senderWindow)
      const displays = screen.getAllDisplays()
      const display = winIndex >= 0 ? displays[winIndex] : screen.getPrimaryDisplay()

      // キャプチャウィンドウを閉じてからスクリーンショットを撮る
      // メインウィンドウはまだ非表示のまま
      closeCaptureWindows()

      const imageBase64 = await captureRegion({
        ...region,
        displayId: display.id,
      })

      // キャプチャ完了後にメインウィンドウを復帰
      restoreMainWindow()

      const mainWindow = getMainWindow()
      if (mainWindow) {
        mainWindow.webContents.send(IPC_CHANNELS.CAPTURE_RESULT, imageBase64)
      }
    } catch (error) {
      console.error('Capture failed:', error)
      closeCaptureWindows()
      restoreMainWindow()
      const mainWindow = getMainWindow()
      if (mainWindow) {
        mainWindow.webContents.send(IPC_CHANNELS.CAPTURE_RESULT, null)
      }
    }
  })

  ipcMain.on(IPC_CHANNELS.CAPTURE_CANCEL, () => {
    closeCaptureWindows()
    restoreMainWindow()
  })
}
