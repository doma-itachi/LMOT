/**
 * キャプチャ機能のカスタムフック
 */

export function useCapture() {
  const startCapture = () => {
    window.api.capture.start()
  }

  const onCaptureResult = (callback: (imageBase64: string | null) => void) => {
    return window.api.capture.onResult(callback)
  }

  const cancelCapture = () => {
    window.api.capture.cancel()
  }

  return { startCapture, onCaptureResult, cancelCapture }
}
