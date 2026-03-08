/**
 * 翻訳履歴表示コンポーネント
 */

import { useTranslationStore } from '../../stores/translationStore'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import { Clock, Languages, History, Trash2 } from 'lucide-react'

export function TranslationHistory() {
  const { t } = useTranslation()
  const history = useTranslationStore((state) => state.history)
  const setCurrent = useTranslationStore((state) => state.setCurrent)
  const clearHistory = useTranslationStore((state) => state.clearHistory)

  const handleSelectHistory = (index: number) => {
    setCurrent(history[index])
  }

  if (history.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {t('translation.history')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
          <p className="text-sm">{t('translation.noHistory')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {t('translation.history')}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{history.length}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearHistory()}
              className="h-8 px-2"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {t('buttons.clear')}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={index}>
                <button
                  onClick={() => handleSelectHistory(index)}
                  className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Languages className="w-3 h-3" />
                        {item.originalLanguage}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.elapsedMs}ms
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                    {item.original}
                  </p>
                  <p className="text-sm font-medium line-clamp-2 text-blue-600 dark:text-blue-400">
                    {item.translated}
                  </p>
                </button>
                {index < history.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
