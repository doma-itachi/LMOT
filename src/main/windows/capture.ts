/**
 * キャプチャオーバーレイウィンドウの管理
 */

import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { getMainWindow } from './main'

let captureWindows: BrowserWindow[] = []
let capturing = false

export function isCapturing(): boolean {
  return capturing
}

/**
 * キャプチャオーバーレイウィンドウを作成
 * 各ディスプレイごとに透過フルスクリーンウィンドウを作成
 */
export function createCaptureWindows(): BrowserWindow[] {
  closeCaptureWindows()

  const mainWindow = getMainWindow()
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide()
  }

  capturing = true
  const displays = screen.getAllDisplays()

  captureWindows = displays.map((display) => {
    const win = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: true,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false,
      },
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/capture.html`)
    } else {
      win.loadFile(join(__dirname, '../renderer/capture.html'))
    }

    return win
  })

  return captureWindows
}

export function getCaptureWindows(): BrowserWindow[] {
  return captureWindows
}

/**
 * キャプチャオーバーレイウィンドウをすべて閉じる（メインウィンドウは復帰しない）
 */
export function closeCaptureWindows(): void {
  captureWindows.forEach((win) => {
    if (!win.isDestroyed()) {
      win.destroy()
    }
  })
  captureWindows = []
  capturing = false
}

/**
 * メインウィンドウを復帰・フォーカス
 */
export function restoreMainWindow(): void {
  const mainWindow = getMainWindow()
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show()
    mainWindow.focus()
  }
}
