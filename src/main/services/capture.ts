/**
 * スクリーンキャプチャサービス
 * 「先にキャプチャ、後で選択」パターンを実装
 */

import { screen, desktopCapturer, type Display, type NativeImage } from 'electron'

export type DisplayScreenshot = {
  displayId: number
  image: NativeImage
  scaleFactor: number
  bounds: Electron.Rectangle
}

/**
 * 全ディスプレイのスクリーンショットを一括取得
 * ウィンドウ操作の前に呼ぶことでフルスクリーンアプリも正しくキャプチャできる
 */
export async function captureAllDisplays(): Promise<DisplayScreenshot[]> {
  const displays = screen.getAllDisplays()

  const maxWidth = Math.max(...displays.map((d) => d.size.width * d.scaleFactor))
  const maxHeight = Math.max(...displays.map((d) => d.size.height * d.scaleFactor))

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: maxWidth, height: maxHeight },
  })

  return displays.map((display) => {
    const source =
      sources.find((s) => s.display_id === String(display.id)) ||
      sources.find((s) => s.name.includes('Screen')) ||
      sources[0]

    if (!source) {
      throw new Error(`No screen source found for display ${display.id}`)
    }

    return {
      displayId: display.id,
      image: source.thumbnail,
      scaleFactor: display.scaleFactor,
      bounds: display.bounds,
    }
  })
}

/**
 * 事前キャプチャ済みの NativeImage から指定領域を切り抜き
 * 座標はディスプレイローカルの CSS ピクセル
 */
export function cropFromScreenshot(
  screenshot: DisplayScreenshot,
  region: { x: number; y: number; width: number; height: number }
): string {
  const { scaleFactor } = screenshot

  const cropped = screenshot.image.crop({
    x: Math.round(region.x * scaleFactor),
    y: Math.round(region.y * scaleFactor),
    width: Math.round(region.width * scaleFactor),
    height: Math.round(region.height * scaleFactor),
  })

  return cropped.toDataURL()
}

export function getAllDisplays(): Display[] {
  return screen.getAllDisplays()
}

export function getPrimaryDisplay(): Display {
  return screen.getPrimaryDisplay()
}
