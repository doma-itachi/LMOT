/**
 * 一般設定タブコンポーネント
 */

import { useTranslation } from 'react-i18next'
import type { JSX } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import type { AppSettings } from '../../../../shared/types'

type GeneralTabProps = {
  settings: AppSettings
  onSettingsChange: (settings: Partial<AppSettings>) => void
  onReset: () => Promise<void>
  isResetting: boolean
}

export function GeneralTab({
  settings,
  onSettingsChange,
  onReset,
  isResetting
}: GeneralTabProps): JSX.Element {
  const { t, i18n } = useTranslation()

  const handleLanguageChange = (language: 'ja' | 'en'): void => {
    onSettingsChange({ language })
    void i18n.changeLanguage(language)
  }

  const handleDarkModeChange = (darkMode: boolean): void => {
    onSettingsChange({ darkMode })
  }

  return (
    <div className="space-y-6">
      {/* 言語選択 */}
      <div className="space-y-2">
        <Label htmlFor="language">{t('settings.language')}</Label>
        <Select value={settings.language} onValueChange={handleLanguageChange}>
          <SelectTrigger id="language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ja">{t('languages.ja')}</SelectItem>
            <SelectItem value="en">{t('languages.en')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ダークモード */}
      <div className="flex items-center justify-between">
        <Label htmlFor="dark-mode">{t('settings.darkMode')}</Label>
        <Switch id="dark-mode" checked={settings.darkMode} onCheckedChange={handleDarkModeChange} />
      </div>

      <div className="flex justify-start pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={isResetting}>
              {isResetting ? t('settings.resetting') : t('settings.reset')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('settings.resetConfirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('settings.resetConfirmDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isResetting}>{t('buttons.cancel')}</AlertDialogCancel>
              <AlertDialogAction disabled={isResetting} onClick={() => void onReset()}>
                {isResetting ? t('settings.resetting') : t('settings.resetConfirmAction')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
