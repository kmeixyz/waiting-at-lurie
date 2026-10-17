/**
 * Small synthesized sounds, read-aloud and buzzes: no audio files to load.
 * Everything is a no-op until a tap has happened (browsers require one) and
 * whenever the Sounds setting is off.
 */

export type Effect = 'tap' | 'pop' | 'good' | 'win' | 'oops' | 'star'

let enabled = true
let context: AudioContext | null = null
let master: GainNode | null = null

export function setSoundEnabled(on: boolean) {
  enabled = on
  if (!on) stopSpeaking()
}

function audio() {
  if (!enabled || typeof window === 'undefined') return null
  try {
    if (!context) {
      const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Context) return null
      context = new Context()
      master = context.createGain()
      master.gain.value = .22
      master.connect(context.destination)
    }
    if (context.state === 'suspended') void context.resume()
    return context
  } catch { return null }
}

function tone(frequency: number, start: number, length: number, { type = 'sine', to, volume = 1 }: { type?: OscillatorType; to?: number; volume?: number } = {}) {
  const ctx = audio()
  if (!ctx || !master) return
  const at = ctx.currentTime + start
  const oscillator = ctx.createOscillator(), gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, at)
  if (to) oscillator.frequency.exponentialRampToValueAtTime(to, at + length)
  // A quick rise and an exponential tail keep every sound soft-edged.
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(volume, at + .012)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length)
  oscillator.connect(gain).connect(master)
  oscillator.start(at)
  oscillator.stop(at + length + .02)
}

const recipes: Record<Effect, () => void> = {
  tap: () => tone(620, 0, .07, { volume: .35 }),
  pop: () => { tone(420, 0, .12, { to: 980, volume: .8 }); tone(1320, .05, .08, { volume: .25 }) },
  good: () => { tone(659, 0, .18, { type: 'triangle' }); tone(988, .1, .3, { type: 'triangle' }) },
  star: () => [1047, 1319, 1568].forEach((f, i) => tone(f, i * .06, .2, { volume: .5 })),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .11, i === 3 ? .6 : .25, { type: 'triangle' })),
  // Gentle, never a buzzer: a soft step down that says "try another".
  oops: () => { tone(392, 0, .14, { type: 'triangle', volume: .45 }); tone(330, .1, .2, { type: 'triangle', volume: .4 }) },
}

const buzzes: Partial<Record<Effect, number | number[]>> = { pop: 12, good: 20, star: [15, 40, 15], win: [30, 60, 30] }

export function play(effect: Effect) {
  if (!enabled) return
  recipes[effect]()
  const buzz = buzzes[effect]
  // Browsers refuse to buzz before the first real tap; don't ask until then.
  const tapped = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive ?? true
  if (buzz && tapped) try { navigator.vibrate?.(buzz) } catch { /* Buzzing is optional. */ }
}

/** A plucked note for the music pad. */
export function playNote(frequency: number) {
  tone(frequency, 0, .9, { type: 'triangle', volume: .9 })
  tone(frequency * 2, 0, .35, { volume: .18 })
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text: string) {
  if (!enabled || !canSpeak()) return false
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = .92
    utterance.pitch = 1.1
    utterance.lang = 'en-US'
    window.speechSynthesis.speak(utterance)
    return true
  } catch { return false }
}

export function stopSpeaking() {
  try { if (canSpeak()) window.speechSynthesis.cancel() } catch { /* Nothing to stop. */ }
}
