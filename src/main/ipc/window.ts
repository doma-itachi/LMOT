/**
 * ウィンドウ操作関連のIPCハンドラ
 */

import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/types'
import { minimizeMainWindow, toggleMaximizeMainWindow, closeMainWindow } from '../windows/main'

/**
 * ウィンドウ操作関連のIPCハンドラを登録
 */
export function registerWindowHandlers(): void {
  // ウィンドウを最小化
  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    minimizeMainWindow()
  })

  // ウィンドウを最大化/復元
  ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    toggleMaximizeMainWindow()
  })

  // ウィンドウを閉じる
  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
    closeMainWindow()
  })
}
