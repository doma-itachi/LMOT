/**
 * キャプチャオーバーレイウィンドウの管理
 */

import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let captureWindows: BrowserWindow[] = []

/**
 * キャプチャオーバーレイウィンドウを作成
 * 各ディスプレイごとに透過フルスクリーンウィンドウを作成
 */
export function createCaptureWindows(): BrowserWindow[] {
  // 既存のキャプチャウィンドウを閉じる
  closeCaptureWindows()

  const displays = screen.getAllDisplays()

  captureWindows = displays.map((display) => {
    const window = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      fullscreen: true,
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

    // キャプチャオーバーレイのHTMLを読み込む
    // 開発時とプロダクション時で異なるパスを使用
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/capture.html`)
    } else {
      window.loadFile(join(__dirname, '../renderer/capture.html'))
    }

    return window
  })

  return captureWindows
}

/**
 * キャプチャオーバーレイウィンドウを取得
 */
export function getCaptureWindows(): BrowserWindow[] {
  return captureWindows
}

/**
 * キャプチャオーバーレイウィンドウをすべて閉じる
 */
export function closeCaptureWindows(): void {
  captureWindows.forEach((window) => {
    if (!window.isDestroyed()) {
      window.close()
    }
  })
  captureWindows = []
}
