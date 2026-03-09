/**
 * LLM設定タブコンポーネント
 */

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AlertCircle, CheckCircle2, PlugZap } from 'lucide-react'
import type { JSX } from 'react'
import { PROVIDER_DEFINITIONS, type AppSettings, type ProviderKey } from '../../../../shared/types'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type LLMTabProps = {
  settings: AppSettings
  onSettingsChange: (settings: Partial<AppSettings>) => void
}

const providerKeys = Object.keys(PROVIDER_DEFINITIONS) as ProviderKey[]

export function LLMTab({ settings, onSettingsChange }: LLMTabProps): JSX.Element {
  const { t } = useTranslation()
  const [isTesting, setIsTesting] = useState(false)

  const selectedProvider = settings.selectedProvider
  const providerDefinition = PROVIDER_DEFINITIONS[selectedProvider]
  const providerSettings = settings.providers[selectedProvider]
  const currentModel = providerSettings.model
  const currentApiKey = 'apiKey' in providerSettings ? providerSettings.apiKey : ''
  const apiKeyMissing = providerDefinition.requiresApiKey && !currentApiKey

  const providerTypeLabel = useMemo(() => {
    return t(`settings.providerType.${providerDefinition.type}`)
  }, [providerDefinition.type, t])

  const handleProviderChange = (provider: ProviderKey): void => {
    onSettingsChange({ selectedProvider: provider })
  }

  const handleModelChange = (model: string): void => {
    onSettingsChange({
      providers: {
        ...settings.providers,
        [selectedProvider]: {
          ...settings.providers[selectedProvider],
          model
        }
      }
    })
  }

  const handleApiKeyChange = (apiKey: string): void => {
    if (!('apiKey' in settings.providers[selectedProvider])) {
      return
    }

    onSettingsChange({
      providers: {
        ...settings.providers,
        [selectedProvider]: {
          ...settings.providers[selectedProvider],
          apiKey
        }
      }
    })
  }

  const handleTestProvider = async (): Promise<void> => {
    try {
      setIsTesting(true)
      await window.api.translate.testProvider({
        providerKey: selectedProvider,
        model: currentModel,
        apiKey: currentApiKey || undefined
      })

      toast.success(t('settings.providerTestSuccessTitle'), {
        description: t('settings.providerTestSuccessDescription', {
          provider: providerDefinition.label
        })
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.providerTestFailed')
      toast.error(t('settings.providerTestErrorTitle'), {
        description: errorMessage
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="provider">{t('settings.provider')}</Label>
        <Select value={selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger id="provider" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {providerKeys.map((providerKey) => {
              const definition = PROVIDER_DEFINITIONS[providerKey]
              return (
                <SelectItem key={providerKey} value={providerKey}>
                  <div className="flex items-center gap-2">
                    {definition.label}
                    <Badge variant="secondary" className="text-xs">
                      {t(`settings.providerType.${definition.type}`)}
                    </Badge>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {'apiKey' in providerSettings && (
        <div className="space-y-2">
          <Label htmlFor="api-key">{t('settings.apiKey')}</Label>
          <Input
            id="api-key"
            type="password"
            placeholder={t('settings.apiKeyPlaceholder')}
            value={currentApiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
          />
          {apiKeyMissing && (
            <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{t('errors.apiKeyRequired')}</span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="model">{t('settings.model')}</Label>
        <Select value={currentModel} onValueChange={handleModelChange}>
          <SelectTrigger id="model" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {providerDefinition.availableModels.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg bg-muted p-3 text-sm space-y-2">
        <p className="flex items-center gap-2 font-medium">
          <span>{providerDefinition.label}</span>
          <Badge variant="outline">{providerTypeLabel}</Badge>
          {providerDefinition.requiresApiKey ? (
            <Badge variant="secondary">{t('settings.apiKeyRequiredLabel')}</Badge>
          ) : (
            <Badge variant="secondary">{t('settings.apiKeyNotRequiredLabel')}</Badge>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('settings.availableModelsCount', { count: providerDefinition.availableModels.length })}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleTestProvider}
        disabled={isTesting || apiKeyMissing}
        className="w-full"
      >
        {isTesting ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4 animate-pulse" />
            {t('settings.testingProvider')}
          </>
        ) : (
          <>
            <PlugZap className="mr-2 h-4 w-4" />
            {t('settings.testProvider')}
          </>
        )}
      </Button>
    </div>
  )
}
