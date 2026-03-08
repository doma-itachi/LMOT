/**
 * 設定モーダルコンポーネント
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { GeneralTab } from './GeneralTab'
import { LLMTab } from './LLMTab'
import { Settings } from 'lucide-react'
import type { AppSettings } from '../../../../shared/types'

type SettingsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: AppSettings
  onSave: (settings: AppSettings) => Promise<void>
}

export function SettingsModal({ open, onOpenChange, settings, onSave }: SettingsModalProps) {
  const { t } = useTranslation()
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSettingsChange = (newSettings: Partial<AppSettings>) => {
    setLocalSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const handleSave = async () => {
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

  const handleCancel = () => {
    setLocalSettings(settings)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('settings.title')}
          </DialogTitle>
          <DialogDescription>
            アプリケーションの設定を変更します
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
            <TabsTrigger value="llm">{t('settings.llm')}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <GeneralTab settings={localSettings} onSettingsChange={handleSettingsChange} />
          </TabsContent>

          <TabsContent value="llm" className="mt-4">
            <LLMTab settings={localSettings} onSettingsChange={handleSettingsChange} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            {t('buttons.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : t('buttons.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
