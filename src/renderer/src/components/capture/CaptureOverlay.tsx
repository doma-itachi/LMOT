/**
 * キャプチャオーバーレイコンポーネント
 * キャプチャウィンドウ専用の全画面透過UI
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
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<SelectionRect | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.api.capture.cancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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
      
      // 選択領域を計算
      const x = Math.min(selection.startX, selection.currentX)
      const y = Math.min(selection.startY, selection.currentY)
      const width = Math.abs(selection.currentX - selection.startX)
      const height = Math.abs(selection.currentY - selection.startY)
      
      // 最小サイズのチェック（誤クリック防止）
      if (width > 10 && height > 10) {
        window.api.capture.sendResult({ x, y, width, height })
      } else {
        // 小さすぎる選択はキャンセル扱い
        window.api.capture.cancel()
      }
    }
  }

  const getSelectionStyle = () => {
    if (!selection) return {}

    const x = Math.min(selection.startX, selection.currentX)
    const y = Math.min(selection.startY, selection.currentY)
    const width = Math.abs(selection.currentX - selection.startX)
    const height = Math.abs(selection.currentY - selection.startY)

    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    }
  }

  return (
    <div className="fixed inset-0 cursor-crosshair" style={{ background: 'transparent' }}>
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
