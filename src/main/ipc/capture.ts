/**
 * キャプチャ関連のIPCハンドラ
 */

import { BrowserWindow, ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/types'
import {
  createCaptureWindows,
  closeCaptureWindows,
  getCaptureWindows,
  getScreenshots,
  restoreMainWindow,
} from '../windows/capture'
import { getMainWindow } from '../windows/main'
import { cropFromScreenshot } from '../services/capture'

type SelectionRegion = { x: number; y: number; width: number; height: number }

export function registerCaptureHandlers(): void {
  ipcMain.on(IPC_CHANNELS.CAPTURE_START, () => {
    createCaptureWindows().catch((err) => {
      console.error('Failed to create capture windows:', err)
      restoreMainWindow()
    })
  })

  ipcMain.on(IPC_CHANNELS.CAPTURE_RESULT, (_event, region: SelectionRegion) => {
    try {
      const senderWindow = BrowserWindow.fromWebContents(_event.sender)
      const captureWins = getCaptureWindows()
      const winIndex = captureWins.findIndex((w) => w === senderWindow)
      const allScreenshots = getScreenshots()

      const screenshot = winIndex >= 0 ? allScreenshots[winIndex] : allScreenshots[0]
      if (!screenshot) {
        throw new Error('No pre-captured screenshot found')
      }

      // 事前キャプチャ画像から切り抜き（desktopCapturer の再呼び出し不要）
      const imageBase64 = cropFromScreenshot(screenshot, region)

      closeCaptureWindows()
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
