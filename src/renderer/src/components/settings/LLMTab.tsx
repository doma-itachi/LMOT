/**
 * LLM設定タブコンポーネント
 */

import { useTranslation } from 'react-i18next'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { AlertCircle } from 'lucide-react'
import type { AppSettings, ProviderKey } from '../../../../shared/types'

type LLMTabProps = {
  settings: AppSettings
  onSettingsChange: (settings: Partial<AppSettings>) => void
}

const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const CODEX_MODEL = 'gpt-5.1-codex-mini'

export function LLMTab({ settings, onSettingsChange }: LLMTabProps) {
  const { t } = useTranslation()

  const handleProviderChange = (provider: ProviderKey) => {
    onSettingsChange({ selectedProvider: provider })
  }

  const handleApiKeyChange = (apiKey: string) => {
    onSettingsChange({
      providers: {
        ...settings.providers,
        groq: {
          ...settings.providers.groq,
          apiKey,
        },
      },
    })
  }

  const handleModelChange = (model: string) => {
    if (settings.selectedProvider === 'groq') {
      onSettingsChange({
        providers: {
          ...settings.providers,
          groq: {
            ...settings.providers.groq,
            model,
          },
        },
      })
    } else {
      onSettingsChange({
        providers: {
          ...settings.providers,
          codex: {
            model,
          },
        },
      })
    }
  }

  const isGroqSelected = settings.selectedProvider === 'groq'
  const currentModel = isGroqSelected
    ? settings.providers.groq.model
    : settings.providers.codex.model
  const groqApiKeyMissing = isGroqSelected && !settings.providers.groq.apiKey

  return (
    <div className="space-y-6">
      {/* プロバイダ選択 */}
      <div className="space-y-2">
        <Label htmlFor="provider">{t('settings.provider')}</Label>
        <Select value={settings.selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger id="provider">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="codex">
              <div className="flex items-center gap-2">
                Codex
                <Badge variant="secondary" className="text-xs">
                  Local
                </Badge>
              </div>
            </SelectItem>
            <SelectItem value="groq">
              <div className="flex items-center gap-2">
                Groq
                <Badge variant="secondary" className="text-xs">
                  API
                </Badge>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Groq APIキー入力 */}
      {isGroqSelected && (
        <div className="space-y-2">
          <Label htmlFor="api-key">{t('settings.apiKey')}</Label>
          <Input
            id="api-key"
            type="password"
            placeholder={t('settings.apiKeyPlaceholder')}
            value={settings.providers.groq.apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
          />
          {groqApiKeyMissing && (
            <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{t('errors.apiKeyRequired')}</span>
            </div>
          )}
        </div>
      )}

      {/* モデル選択 */}
      <div className="space-y-2">
        <Label htmlFor="model">{t('settings.model')}</Label>
        <Select value={currentModel} onValueChange={handleModelChange}>
          <SelectTrigger id="model">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {isGroqSelected ? (
              <SelectItem value={GROQ_MODEL}>{GROQ_MODEL}</SelectItem>
            ) : (
              <SelectItem value={CODEX_MODEL}>{CODEX_MODEL}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* プロバイダ情報 */}
      <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
        <p className="font-medium">
          {isGroqSelected ? 'Groq' : 'Codex'}
        </p>
        <p className="text-muted-foreground text-xs">
          {isGroqSelected
            ? 'クラウドAPIを使用します。APIキーが必要です。'
            : 'ローカルのCodex CLIを使用します。APIキー不要です。'}
        </p>
      </div>
    </div>
  )
}
