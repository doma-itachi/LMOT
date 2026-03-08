/**
 * 設定関連のIPCハンドラ
 */

import { ipcMain } from 'electron'
import { IPC_CHANNELS, AppSettings } from '../../shared/types'
import { getSettings, setSettings } from '../services/store'

/**
 * 設定関連のIPCハンドラを登録
 */
export function registerSettingsHandlers(): void {
  // 設定を取得
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async (): Promise<AppSettings> => {
    return await getSettings()
  })

  // 設定を保存
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_SET,
    async (_event, settings: Partial<AppSettings>): Promise<void> => {
      await setSettings(settings)
    }
  )
}
