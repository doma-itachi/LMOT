/**
 * スクリーンキャプチャサービス
 */

import { screen, desktopCapturer, type Display } from 'electron'

export type CaptureRegion = {
  x: number
  y: number
  width: number
  height: number
  displayId: number
}

export function getAllDisplays(): Display[] {
  return screen.getAllDisplays()
}

/**
 * 指定領域のスクリーンショットをキャプチャしてBase64で返す
 * NativeImage.crop() を使用（メインプロセスで動作）
 */
export async function captureRegion(region: CaptureRegion): Promise<string> {
  const { x, y, width, height, displayId } = region

  const displays = screen.getAllDisplays()
  const targetDisplay = displays.find((d) => d.id === displayId)

  if (!targetDisplay) {
    throw new Error(`Display with id ${displayId} not found`)
  }

  const scaleFactor = targetDisplay.scaleFactor

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: targetDisplay.size.width * scaleFactor,
      height: targetDisplay.size.height * scaleFactor,
    },
  })

  // display_id:XX 形式 or "Screen N" でマッチ、それでもダメなら最初のソースを使う
  const source =
    sources.find((s) => s.display_id === String(displayId)) ||
    sources.find((s) => s.name.includes('Screen')) ||
    sources[0]

  if (!source) {
    throw new Error('No screen source found')
  }

  const thumbnail = source.thumbnail

  // ディスプレイ座標からローカル座標に変換し、DPI倍率を適用
  const localX = Math.round((x - targetDisplay.bounds.x) * scaleFactor)
  const localY = Math.round((y - targetDisplay.bounds.y) * scaleFactor)
  const cropWidth = Math.round(width * scaleFactor)
  const cropHeight = Math.round(height * scaleFactor)

  const cropped = thumbnail.crop({
    x: localX,
    y: localY,
    width: cropWidth,
    height: cropHeight,
  })

  return cropped.toDataURL()
}

export function getPrimaryDisplay(): Display {
  return screen.getPrimaryDisplay()
}
