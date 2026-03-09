import { ipcMain } from 'electron'
import { IPC_CHANNELS, type UpdateCheckRequest } from '../../shared/types'
import { checkForUpdates, downloadUpdate, installUpdate } from '../services/updater'

export function registerUpdaterHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.UPDATER_CHECK,
    async (_event, request?: UpdateCheckRequest): Promise<void> => {
      await checkForUpdates(request)
    }
  )

  ipcMain.handle(IPC_CHANNELS.UPDATER_DOWNLOAD, async (): Promise<void> => {
    await downloadUpdate()
  })

  ipcMain.handle(IPC_CHANNELS.UPDATER_INSTALL, (): void => {
    installUpdate()
  })
}
