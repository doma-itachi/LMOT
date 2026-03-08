/**
 * スクリーンキャプチャサービス
 */

import { screen, desktopCapturer } from 'electron'
import { Display } from 'electron'

/**
 * キャプチャ領域
 */
export type CaptureRegion = {
  x: number
  y: number
  width: number
  height: number
  displayId: number
}

/**
 * 全ディスプレイ情報を取得
 */
export function getAllDisplays(): Display[] {
  return screen.getAllDisplays()
}

/**
 * 指定領域のスクリーンショットをキャプチャしてBase64で返す
 * @param region キャプチャする領域
 * @returns Base64エンコードされた画像データ
 */
export async function captureRegion(region: CaptureRegion): Promise<string> {
  const { x, y, width, height, displayId } = region

  // 対象のディスプレイを取得
  const displays = screen.getAllDisplays()
  const targetDisplay = displays.find((d) => d.id === displayId)

  if (!targetDisplay) {
    throw new Error(`Display with id ${displayId} not found`)
  }

  // DPI倍率を考慮
  const scaleFactor = targetDisplay.scaleFactor

  // デスクトップキャプチャソースを取得
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: targetDisplay.size.width * scaleFactor,
      height: targetDisplay.size.height * scaleFactor,
    },
  })

  // 対象ディスプレイに対応するソースを見つける
  const source = sources.find((s) => {
    // ソース名からディスプレイを特定
    // Windowsの場合は "Screen 1", "Screen 2" など
    // Macの場合は異なる可能性があるが、とりあえず最初のものを使う
    return s.name.includes('Screen')
  })

  if (!source) {
    throw new Error('No screen source found')
  }

  // サムネイルから画像データを取得
  const thumbnail = source.thumbnail

  // 指定領域を切り抜き
  const canvas = document.createElement('canvas')
  canvas.width = width * scaleFactor
  canvas.height = height * scaleFactor

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // サムネイルをImageに変換
  const image = new Image()
  image.src = thumbnail.toDataURL()

  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
  })

  // ディスプレイ座標からローカル座標に変換
  const localX = (x - targetDisplay.bounds.x) * scaleFactor
  const localY = (y - targetDisplay.bounds.y) * scaleFactor

  // 指定領域を描画
  ctx.drawImage(
    image,
    localX,
    localY,
    width * scaleFactor,
    height * scaleFactor,
    0,
    0,
    width * scaleFactor,
    height * scaleFactor
  )

  // Base64に変換
  return canvas.toDataURL('image/png')
}

/**
 * プライマリディスプレイを取得
 */
export function getPrimaryDisplay(): Display {
  return screen.getPrimaryDisplay()
}
