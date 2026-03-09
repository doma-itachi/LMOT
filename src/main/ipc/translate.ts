/**
 * 翻訳関連のIPCハンドラ
 */

import { ipcMain } from 'electron'
import {
  IPC_CHANNELS,
  ProviderTestRequest,
  TranslateRequest,
  TranslateResult
} from '../../shared/types'
import { testProviderConnection } from '../services/providerTest'
import { executeTranslation } from '../services/translate'

/**
 * 翻訳関連のIPCハンドラを登録
 */
export function registerTranslateHandlers(): void {
  // 翻訳実行
  ipcMain.handle(
    IPC_CHANNELS.TRANSLATE_EXECUTE,
    async (_event, request: TranslateRequest): Promise<TranslateResult> => {
      try {
        const result = await executeTranslation(request)
        return result
      } catch (error) {
        console.error('Translation failed:', error)
        throw error
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.PROVIDER_TEST, async (_event, request: ProviderTestRequest) => {
    try {
      await testProviderConnection(request)
    } catch (error) {
      console.error('Provider test failed:', error)
      throw error
    }
  })
}
