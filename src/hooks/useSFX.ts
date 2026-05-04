import { Howl } from 'howler'

// Preload sounds. Files should be located in /public/sfx/
const successSound = new Howl({
  src: ['/sfx/success.mp3'],
  preload: true,
})

const failSound = new Howl({
  src: ['/sfx/fail.mp3'],
  preload: true,
})

export function useSFX() {
  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern)
      } catch (e) {
        // Silent fail for browsers that restrict vibration
        console.warn('Vibration failed', e)
      }
    }
  }

  const playSuccess = () => {
    successSound.play()
    vibrate([50, 30, 50]) // Double vibration for success
  }

  const playFail = () => {
    failSound.play()
    vibrate(200) // Long vibration for failure
  }

  const playTick = () => {
    // Standard haptic feedback for buttons (very short vibration)
    vibrate(10)
  }

  return { playSuccess, playFail, playTick, vibrate }
}
