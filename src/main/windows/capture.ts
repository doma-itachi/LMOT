/**
 * キャプチャオーバーレイウィンドウの管理
 * 「先にキャプチャ、後で選択」パターン
 */

import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { getMainWindow } from './main'
import { captureAllDisplays, type DisplayScreenshot } from '../services/capture'
import { IPC_CHANNELS } from '../../shared/types'

let captureWindows: BrowserWindow[] = []
let capturing = false
let screenshots: DisplayScreenshot[] = []

export function isCapturing(): boolean {
  return capturing
}

export function getScreenshots(): DisplayScreenshot[] {
  return screenshots
}

/**
 * キャプチャオーバーレイウィンドウを作成
 * 1. メインウィンドウを非表示（フルスクリーンアプリに影響しない）
 * 2. 描画反映を待つ
 * 3. 全ディスプレイをキャプチャ（メインウィンドウが映らない状態で）
 * 4. 各ディスプレイにオーバーレイウィンドウを生成
 * 5. 撮影済み画像をレンダラーに送信
 */
export async function createCaptureWindows(): Promise<BrowserWindow[]> {
  closeCaptureWindows()

  // メインウィンドウを先に隠す（通常ウィンドウの非表示はフルスクリーンアプリに影響しない）
  const mainWindow = getMainWindow()
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide()
  }

  // OS がウィンドウ非表示を描画に反映するのを待つ
  await new Promise((resolve) => setTimeout(resolve, 150))

  // メインウィンドウが消えた状態でスクリーンショットを撮影
  screenshots = await captureAllDisplays()

  capturing = true
  const displays = screen.getAllDisplays()

  captureWindows = displays.map((display, index) => {
    const win = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      transparent: true,
      frame: false,
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

    // screen-saver レベルでタスクバーより上に表示
    win.setAlwaysOnTop(true, 'screen-saver')
    // Windows がウィンドウを workArea に押し込むのを防ぐため bounds を再設定
    win.setBounds(display.bounds)

    win.webContents.on('did-finish-load', () => {
      if (screenshots[index] && !win.isDestroyed()) {
        const jpegBuffer = screenshots[index].image.toJPEG(90)
        const dataUrl = `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`
        win.webContents.send(IPC_CHANNELS.CAPTURE_SCREENSHOT, dataUrl)
      }
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
  screenshots = []
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
