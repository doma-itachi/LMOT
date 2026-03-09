import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function useUpdater() {
  const { t } = useTranslation()
  const progressToastIdRef = useRef<string | number | null>(null)
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false)

  const dismissProgressToast = useCallback((): void => {
    if (progressToastIdRef.current !== null) {
      toast.dismiss(progressToastIdRef.current)
      progressToastIdRef.current = null
    }
  }, [])

  const checkForUpdates = useCallback(
    async (silent = false): Promise<void> => {
      setIsCheckingForUpdates(true)

      try {
        await window.api.updater.check({ silent })
      } catch (error) {
        const message = error instanceof Error ? error.message : t('updater.errors.checkFailed')
        if (!silent) {
          toast.error(t('updater.errors.title'), {
            description: message
          })
        }
        setIsCheckingForUpdates(false)
      }
    },
    [t]
  )

  const handleDownload = useCallback(async (): Promise<void> => {
    progressToastIdRef.current = toast.loading(t('updater.downloading', { percent: 0 }))

    try {
      await window.api.updater.download()
    } catch (error) {
      dismissProgressToast()
      toast.error(t('updater.errors.title'), {
        description: error instanceof Error ? error.message : t('updater.errors.downloadFailed')
      })
    }
  }, [dismissProgressToast, t])

  const handleInstall = useCallback(async (): Promise<void> => {
    try {
      await window.api.updater.install()
    } catch (error) {
      toast.error(t('updater.errors.title'), {
        description: error instanceof Error ? error.message : t('updater.errors.installFailed')
      })
    }
  }, [t])

  useEffect(() => {
    const cleanupUpdateAvailable = window.api.updater.onUpdateAvailable((payload) => {
      setIsCheckingForUpdates(false)

      toast(t('updater.updateAvailableTitle'), {
        id: `update-available-${payload.version}`,
        description: t('updater.updateAvailableDescription', { version: payload.version }),
        duration: Infinity,
        action: {
          label: t('updater.updateNow'),
          onClick: () => {
            void handleDownload()
          }
        },
        cancel: {
          label: t('updater.later'),
          onClick: () => undefined
        }
      })
    })

    const cleanupUpdateNotAvailable = window.api.updater.onUpdateNotAvailable((payload) => {
      setIsCheckingForUpdates(false)
      dismissProgressToast()

      if (!payload.context.silent) {
        toast.success(t('updater.noUpdatesTitle'), {
          description: t('updater.noUpdatesDescription')
        })
      }
    })

    const cleanupDownloadProgress = window.api.updater.onDownloadProgress((payload) => {
      progressToastIdRef.current = toast.loading(
        t('updater.downloading', {
          percent: Math.round(payload.percent)
        }),
        {
          id: progressToastIdRef.current ?? undefined
        }
      )
    })

    const cleanupUpdateDownloaded = window.api.updater.onUpdateDownloaded((payload) => {
      setIsCheckingForUpdates(false)
      dismissProgressToast()

      toast.success(t('updater.readyToInstallTitle'), {
        id: `update-downloaded-${payload.version}`,
        description: t('updater.readyToInstallDescription', { version: payload.version }),
        duration: Infinity,
        action: {
          label: t('updater.restart'),
          onClick: () => {
            void handleInstall()
          }
        },
        cancel: {
          label: t('updater.later'),
          onClick: () => undefined
        }
      })
    })

    const cleanupError = window.api.updater.onError((payload) => {
      setIsCheckingForUpdates(false)
      dismissProgressToast()

      if (!payload.context.silent) {
        toast.error(t('updater.errors.title'), {
          description: payload.message
        })
      }
    })

    void checkForUpdates(true)

    return () => {
      cleanupUpdateAvailable()
      cleanupUpdateNotAvailable()
      cleanupDownloadProgress()
      cleanupUpdateDownloaded()
      cleanupError()
    }
  }, [checkForUpdates, dismissProgressToast, handleDownload, handleInstall, t])

  return {
    isCheckingForUpdates,
    checkForUpdates
  }
}
