import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import {
  IPC_CHANNELS,
  type UpdateAvailableEvent,
  type UpdateCheckContext,
  type UpdateCheckRequest,
  type UpdateDownloadedEvent,
  type UpdateDownloadProgressEvent,
  type UpdateErrorEvent,
  type UpdateNotAvailableEvent
} from '../../shared/types'
import { getMainWindow } from '../windows/main'

let isInitialized = false
let lastCheckContext: UpdateCheckContext = { silent: true }

function sendToRenderer<T>(channel: string, payload: T): void {
  const mainWindow = getMainWindow()
  if (!mainWindow || mainWindow.isDestroyed()) {
    return
  }

  mainWindow.webContents.send(channel, payload)
}

function createCheckContext(request?: UpdateCheckRequest): UpdateCheckContext {
  return {
    silent: request?.silent ?? false
  }
}

function createDevelopmentError(context: UpdateCheckContext): UpdateErrorEvent {
  return {
    message: 'Auto updates are only available in packaged builds.',
    context
  }
}

export function initAutoUpdater(): void {
  if (isInitialized) {
    return
  }

  isInitialized = true
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    const payload: UpdateAvailableEvent = {
      version: info.version,
      releaseDate: info.releaseDate,
      context: lastCheckContext
    }

    sendToRenderer(IPC_CHANNELS.UPDATER_UPDATE_AVAILABLE, payload)
  })

  autoUpdater.on('update-not-available', () => {
    const payload: UpdateNotAvailableEvent = {
      context: lastCheckContext
    }

    sendToRenderer(IPC_CHANNELS.UPDATER_UPDATE_NOT_AVAILABLE, payload)
  })

  autoUpdater.on('download-progress', (progress) => {
    const payload: UpdateDownloadProgressEvent = {
      percent: progress.percent
    }

    sendToRenderer(IPC_CHANNELS.UPDATER_DOWNLOAD_PROGRESS, payload)
  })

  autoUpdater.on('update-downloaded', (info) => {
    const payload: UpdateDownloadedEvent = {
      version: info.version
    }

    sendToRenderer(IPC_CHANNELS.UPDATER_UPDATE_DOWNLOADED, payload)
  })

  autoUpdater.on('error', (error) => {
    const payload: UpdateErrorEvent = {
      message: error instanceof Error ? error.message : 'Failed to check for updates.',
      context: lastCheckContext
    }

    sendToRenderer(IPC_CHANNELS.UPDATER_ERROR, payload)
  })
}

export async function checkForUpdates(request?: UpdateCheckRequest): Promise<void> {
  const context = createCheckContext(request)
  lastCheckContext = context

  if (!app.isPackaged) {
    sendToRenderer(IPC_CHANNELS.UPDATER_ERROR, createDevelopmentError(context))

    return
  }

  try {
    await autoUpdater.checkForUpdates()
  } catch (error) {
    const payload: UpdateErrorEvent = {
      message: error instanceof Error ? error.message : 'Failed to check for updates.',
      context
    }

    sendToRenderer(IPC_CHANNELS.UPDATER_ERROR, payload)
  }
}

export async function downloadUpdate(): Promise<void> {
  if (!app.isPackaged) {
    sendToRenderer(
      IPC_CHANNELS.UPDATER_ERROR,
      createDevelopmentError({
        silent: false
      })
    )
    return
  }

  await autoUpdater.downloadUpdate()
}

export function installUpdate(): void {
  if (!app.isPackaged) {
    sendToRenderer(
      IPC_CHANNELS.UPDATER_ERROR,
      createDevelopmentError({
        silent: false
      })
    )
    return
  }

  autoUpdater.quitAndInstall()
}
