/**
 * 設定モーダルコンポーネント
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { JSX } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { GeneralTab } from './GeneralTab'
import { LLMTab } from './LLMTab'
import { Settings } from 'lucide-react'
import {
  createDefaultAppSettings,
  detectAppLanguage,
  type AppSettings
} from '../../../../shared/types'

type SettingsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AppSettings
  onSave: (settings: AppSettings) => Promise<void>
}

export function SettingsModal({
  open,
  onOpenChange,
  settings,
  onSave
}: SettingsModalProps): JSX.Element {
  const { t, i18n } = useTranslation()
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  // モーダルを開いた時に設定をリセット
  useEffect(() => {
    if (open) {
      setLocalSettings(settings)
    }
  }, [open, settings])

  const handleSettingsChange = (newSettings: Partial<AppSettings>): void => {
    setLocalSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const handleSave = async (): Promise<void> => {
    setIsSaving(true)
    try {
      await onSave(localSettings)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async (): Promise<void> => {
    setIsResetting(true)
    try {
      const defaultSettings = createDefaultAppSettings(detectAppLanguage(navigator.language))
      setLocalSettings(defaultSettings)
      await i18n.changeLanguage(defaultSettings.language)
    } catch (error) {
      console.error('Failed to reset settings:', error)
      toast.error(t('errors.settingsResetFailed'))
    } finally {
      setIsResetting(false)
    }
  }

  const handleCancel = (): void => {
    setLocalSettings(settings)
    void i18n.changeLanguage(settings.language)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('settings.title')}
          </DialogTitle>
          <DialogDescription>{t('settings.description')}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
            <TabsTrigger value="llm">{t('settings.llm')}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <GeneralTab
              settings={localSettings}
              onSettingsChange={handleSettingsChange}
              onReset={handleReset}
              isResetting={isResetting}
            />
          </TabsContent>

          <TabsContent value="llm" className="mt-4">
            <LLMTab settings={localSettings} onSettingsChange={handleSettingsChange} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving || isResetting}>
            {t('buttons.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isResetting}>
            {isSaving ? t('settings.saving') : t('buttons.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
