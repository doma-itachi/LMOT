/**
 * 翻訳結果表示コンポーネント
 */

import { useTranslationStore } from '../../stores/translationStore'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Clock, Languages, Image as ImageIcon } from 'lucide-react'

export function TranslationResult() {
  const { t } = useTranslation()
  const current = useTranslationStore((state) => state.current)

  if (!current) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('translation.noHistory')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('translation.translated')}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Languages className="w-3 h-3" />
              {current.originalLanguage}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {current.elapsedMs}ms
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 原文 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{t('translation.original')}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {t('translation.original')}画像
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-md">
                  <img
                    src={current.imageBase64}
                    alt="Original capture"
                    className="max-w-full rounded-md shadow-lg"
                  />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{current.original}</p>
          </div>
        </div>

        {/* 翻訳後 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">{t('translation.translated')}</h3>
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium whitespace-pre-wrap">{current.translated}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
