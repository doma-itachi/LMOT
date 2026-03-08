/**
 * キャプチャオーバーレイのエントリーポイント
 */

import './assets/main.css'
import './i18n'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CaptureOverlay } from './components/capture/CaptureOverlay'

createRoot(document.getElementById('capture-root')!).render(
  <StrictMode>
    <CaptureOverlay />
  </StrictMode>
)
