/**
 * カスタムタイトルバー
 */

import { Minus, Square, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function TitleBar() {
  const { t } = useTranslation()

  const handleMinimize = () => {
    window.api.window.minimize()
  }

  const handleMaximize = () => {
    window.api.window.maximize()
  }

  const handleClose = () => {
    window.api.window.close()
  }

  return (
    <div className="flex items-center justify-between h-8 bg-blue-600 dark:bg-blue-800 text-white select-none">
      {/* ドラッグ領域 */}
      <div
        className="flex-1 h-full flex items-center px-3 text-sm font-medium"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {t('app.name')}
      </div>

      {/* ウィンドウ操作ボタン */}
      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={handleMinimize}
          className="h-full px-4 hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors"
          aria-label="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-full px-4 hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors"
          aria-label="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={handleClose}
          className="h-full px-4 hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
