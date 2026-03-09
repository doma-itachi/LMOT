/**
 * LMOTメインアプリケーション
 */

import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { PROVIDER_DEFINITIONS, type TargetLanguage } from '../../shared/types'
import { TitleBar } from './components/layout/TitleBar'
import { TranslationResult } from './components/translation/TranslationResult'
import { TranslationHistory } from './components/translation/TranslationHistory'
import { SettingsModal } from './components/settings/SettingsModal'
import { Button } from './components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './components/ui/select'
import { Badge } from './components/ui/badge'
import { useCapture } from './hooks/useCapture'
import { useTranslation as useTranslationHook } from './hooks/useTranslation'
import { useSettings } from './hooks/useSettings'
import { useTranslationStore } from './stores/translationStore'
import { Camera, Settings, Loader2, AlertCircle } from 'lucide-react'

function App(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { settings, updateSettings } = useSettings()
  const { startCapture, onCaptureResult } = useCapture()
  const { executeTranslation } = useTranslationHook()
  const { isLoading, error, targetLanguage, setTargetLanguage, setError } = useTranslationStore()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // ダークモード適用
  useEffect(() => {
    if (settings) {
      void i18n.changeLanguage(settings.language)

      if (settings.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [i18n, settings])

  // キャプチャ結果の受信
  useEffect(() => {
    const unsubscribe = onCaptureResult((imageBase64) => {
      if (imageBase64) {
        executeTranslation(imageBase64)
      }
      // imageBase64がnullの場合はキャンセルされたので何もしない
    })
    return unsubscribe
  }, [onCaptureResult, executeTranslation])

  const handleCaptureClick = (): void => {
    // APIキーチェック
    if (!settings) return
    const selectedProviderDefinition = PROVIDER_DEFINITIONS[settings.selectedProvider]
    const selectedProviderSettings = settings.providers[settings.selectedProvider]
    const selectedProviderApiKey =
      'apiKey' in selectedProviderSettings ? selectedProviderSettings.apiKey : undefined

    if (selectedProviderDefinition.requiresApiKey && !selectedProviderApiKey) {
      setError(t('errors.apiKeyRequiredForGroq'))
      setIsSettingsOpen(true)
      return
    }
    setError(null)
    startCapture()
  }

  const handleSettingsSave = async (newSettings: typeof settings): Promise<void> => {
    if (newSettings) {
      await updateSettings(newSettings)
    }
  }

  const handleTargetLanguageChange = (lang: string): void => {
    setTargetLanguage(lang as TargetLanguage)
  }

  if (!settings) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <TitleBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* カスタムタイトルバー */}
      <TitleBar />

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* ツールバー */}
        <div className="border-b bg-card">
          <div className="p-4 flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleCaptureClick}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {t('buttons.capture')}
              <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded">Ctrl+Shift+P</kbd>
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {t('buttons.settings')}
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('translation.language')}:</span>
              <Select value={targetLanguage} onValueChange={handleTargetLanguageChange}>
                <SelectTrigger className="w-35">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ja">{t('targetLanguages.ja')}</SelectItem>
                  <SelectItem value="en">{t('targetLanguages.en')}</SelectItem>
                  <SelectItem value="zh">{t('targetLanguages.zh')}</SelectItem>
                  <SelectItem value="ko">{t('targetLanguages.ko')}</SelectItem>
                  <SelectItem value="fr">{t('targetLanguages.fr')}</SelectItem>
                  <SelectItem value="de">{t('targetLanguages.de')}</SelectItem>
                  <SelectItem value="es">{t('targetLanguages.es')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Badge variant="secondary" className="ml-auto">
              {PROVIDER_DEFINITIONS[settings.selectedProvider].label}
            </Badge>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">{t('translation.error')}</p>
              <p className="text-xs text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* 翻訳結果と履歴 */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* ローディング状態 */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                <p className="text-sm text-muted-foreground">{t('translation.loading')}</p>
              </div>
            </div>
          )}

          {/* 翻訳結果 */}
          {!isLoading && <TranslationResult />}

          {/* 翻訳履歴 */}
          <TranslationHistory />
        </div>
      </div>

      {/* 設定モーダル */}
      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onSave={handleSettingsSave}
      />
    </div>
  )
}

export default App
