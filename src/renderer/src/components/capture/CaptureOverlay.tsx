/**
 * キャプチャオーバーレイコンポーネント
 * 事前撮影したスクリーンショットを背景に表示し、その上で領域選択を行う
 */

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type SelectionRect = {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

export function CaptureOverlay() {
  const { t } = useTranslation()
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<SelectionRect | null>(null)

  useEffect(() => {
    const cleanupScreenshot = window.api.capture.onScreenshot((dataUrl) => {
      setScreenshotUrl(dataUrl)
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.api.capture.cancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      cleanupScreenshot()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsSelecting(true)
    setSelection({
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting && selection) {
      setSelection({
        ...selection,
        currentX: e.clientX,
        currentY: e.clientY,
      })
    }
  }

  const handleMouseUp = () => {
    if (isSelecting && selection) {
      setIsSelecting(false)

      const x = Math.min(selection.startX, selection.currentX)
      const y = Math.min(selection.startY, selection.currentY)
      const width = Math.abs(selection.currentX - selection.startX)
      const height = Math.abs(selection.currentY - selection.startY)

      if (width > 10 && height > 10) {
        window.api.capture.sendResult({ x, y, width, height })
      } else {
        window.api.capture.cancel()
      }
    }
  }

  const getSelectionStyle = () => {
    if (!selection) return {}

    return {
      left: `${Math.min(selection.startX, selection.currentX)}px`,
      top: `${Math.min(selection.startY, selection.currentY)}px`,
      width: `${Math.abs(selection.currentX - selection.startX)}px`,
      height: `${Math.abs(selection.currentY - selection.startY)}px`,
    }
  }

  return (
    <div className="fixed inset-0 cursor-crosshair" style={{ background: '#000' }}>
      {/* 事前キャプチャ済みスクリーンショット */}
      {screenshotUrl && (
        <img
          src={screenshotUrl}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: 'fill' }}
          draggable={false}
        />
      )}

      {/* 半透明オーバーレイ */}
      {selection ? (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute"
            style={{
              left: 0,
              top: 0,
              right: 0,
              height: `${Math.min(selection.startY, selection.currentY)}px`,
              background: 'rgba(0, 0, 0, 0.4)',
            }}
          />
          <div
            className="absolute"
            style={{
              left: 0,
              top: `${Math.min(selection.startY, selection.currentY)}px`,
              width: `${Math.min(selection.startX, selection.currentX)}px`,
              height: `${Math.abs(selection.currentY - selection.startY)}px`,
              background: 'rgba(0, 0, 0, 0.4)',
            }}
          />
          <div
            className="absolute"
            style={{
              left: `${Math.max(selection.startX, selection.currentX)}px`,
              top: `${Math.min(selection.startY, selection.currentY)}px`,
              right: 0,
              height: `${Math.abs(selection.currentY - selection.startY)}px`,
              background: 'rgba(0, 0, 0, 0.4)',
            }}
          />
          <div
            className="absolute"
            style={{
              left: 0,
              top: `${Math.max(selection.startY, selection.currentY)}px`,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.4)',
            }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(0, 0, 0, 0.3)' }}
        />
      )}

      {/* クリック可能なレイヤー */}
      <div
        className="absolute inset-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {/* 指示メッセージ */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 pointer-events-none">
        <p className="text-sm font-medium mb-1">{t('capture.instruction')}</p>
        <p className="text-xs opacity-90">{t('capture.cancel')}</p>
      </div>

      {/* 選択矩形 */}
      {selection && (
        <div
          className="absolute border-2 border-blue-500 pointer-events-none"
          style={{
            ...getSelectionStyle(),
            background: 'rgba(59, 130, 246, 0.1)',
          }}
        >
          <div className="absolute -bottom-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            {Math.abs(selection.currentX - selection.startX)} x{' '}
            {Math.abs(selection.currentY - selection.startY)}
          </div>
        </div>
      )}
    </div>
  )
}
