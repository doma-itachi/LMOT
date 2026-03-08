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
      // 選択完了の通知はメインプロセスで処理される
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
    <div
      className="fixed inset-0 cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ background: 'rgba(0, 0, 0, 0.3)' }}
    >
      {/* 指示メッセージ */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
        <p className="text-sm font-medium mb-1">{t('capture.instruction')}</p>
        <p className="text-xs opacity-90">{t('capture.cancel')}</p>
      </div>

      {/* 選択矩形 */}
      {selection && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10"
          style={getSelectionStyle()}
        >
          {/* 選択サイズ表示 */}
          <div className="absolute -bottom-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            {Math.abs(selection.currentX - selection.startX)} x{' '}
            {Math.abs(selection.currentY - selection.startY)}
          </div>
        </div>
      )}
    </div>
  )
}
