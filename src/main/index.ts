/**
 * GLMT メインプロセス
 */

import { app, BrowserWindow, globalShortcut } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow } from './windows/main'
import { createCaptureWindows, isCapturing, restoreMainWindow } from './windows/capture'
import { registerCaptureHandlers } from './ipc/capture'
import { registerTranslateHandlers } from './ipc/translate'
import { registerSettingsHandlers } from './ipc/settings'
import { registerWindowHandlers } from './ipc/window'

/**
 * IPCハンドラを登録
 */
function registerIpcHandlers(): void {
  registerCaptureHandlers()
  registerTranslateHandlers()
  registerSettingsHandlers()
  registerWindowHandlers()
}

/**
 * グローバルショートカットを登録
 */
function registerGlobalShortcuts(): void {
  // Ctrl+Shift+P でキャプチャを起動
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    createCaptureWindows().catch((err) => {
      console.error('Failed to start capture:', err)
      restoreMainWindow()
    })
  })
}

/**
 * アプリケーション初期化
 */
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.glmt')

  // Default open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPCハンドラを登録
  registerIpcHandlers()

  // メインウィンドウを作成
  createMainWindow()

  // グローバルショートカットを登録
  registerGlobalShortcuts()

  // macOS: Dockアイコンクリック時にウィンドウを再作成
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

/**
 * 全ウィンドウが閉じられた時の処理
 * キャプチャ中はメインウィンドウを再作成、それ以外はアプリを終了
 */
app.on('window-all-closed', () => {
  if (isCapturing()) {
    createMainWindow()
    return
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * アプリ終了時の処理
 * グローバルショートカットを解除
 */
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
