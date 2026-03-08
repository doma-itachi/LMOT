/**
 * 一般設定タブコンポーネント
 */

import { useTranslation } from 'react-i18next'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import type { AppSettings } from '../../../../shared/types'

type GeneralTabProps = {
  settings: AppSettings
  onSettingsChange: (settings: Partial<AppSettings>) => void
}

export function GeneralTab({ settings, onSettingsChange }: GeneralTabProps) {
  const { t, i18n } = useTranslation()

  const handleLanguageChange = (language: 'ja' | 'en') => {
    onSettingsChange({ language })
    i18n.changeLanguage(language)
  }

  const handleDarkModeChange = (darkMode: boolean) => {
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
        <Switch
          id="dark-mode"
          checked={settings.darkMode}
          onCheckedChange={handleDarkModeChange}
        />
      </div>
    </div>
  )
}
