import { useEffect, useRef } from 'react'
import { Icon } from './Icons'

export type ComfortPreferences = { calm: boolean; largeText: boolean; solid: boolean; sound: boolean }
type ComfortSetting = keyof ComfortPreferences
const STORAGE_KEY = 'waiting-at-lurie.comfort.v1'

export function readComfort(): ComfortPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { calm: saved?.calm === true, largeText: saved?.largeText === true, solid: saved?.solid === true, sound: saved?.sound !== false }
  } catch { return { calm: false, largeText: false, solid: false, sound: true } }
}

export function saveComfort(preferences: ComfortPreferences) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)) } catch { /* Play works without storage. */ }
}

export function ComfortSettings({ open, onClose, preferences, onToggle, deviceQuiet }: {
  open: boolean; onClose: () => void; preferences: ComfortPreferences
  onToggle: (setting: ComfortSetting) => void; deviceQuiet: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!open) return
    const sheet = dialog.current!
    sheet.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { sheet.close(); document.body.style.overflow = previousOverflow }
  }, [open])

  return <dialog className="comfort-sheet" ref={dialog} aria-labelledby="comfort-title" onCancel={onClose} onClose={onClose} onKeyDown={event => {
    if (event.key !== 'Tab') return
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
    const first = controls[0], last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }}>
    <div className="comfort-heading"><h2 id="comfort-title">Settings</h2><button className="icon-button" aria-label="Close settings" onClick={onClose}><Icon name="close"/></button></div>
    <div className="comfort-options">
      <button className="comfort-option" role="switch" aria-checked={preferences.sound} onClick={() => onToggle('sound')} aria-labelledby="sound-label"><Icon name={preferences.sound ? 'speaker' : 'mute'}/><span><strong id="sound-label">Sounds</strong></span><span className="setting-switch" aria-hidden="true"/></button>
      <button className="comfort-option" role="switch" aria-checked={preferences.calm || deviceQuiet} disabled={deviceQuiet} onClick={() => onToggle('calm')} aria-labelledby="calm-label" aria-describedby={deviceQuiet ? 'calm-description' : undefined}><Icon name="leaf"/><span><strong id="calm-label">Calmer motion</strong>{deviceQuiet && <small id="calm-description">Your device has asked for less movement.</small>}</span><span className="setting-switch" aria-hidden="true"/></button>
      <button className="comfort-option" role="switch" aria-checked={preferences.largeText} onClick={() => onToggle('largeText')} aria-labelledby="text-label"><Icon name="letters"/><span><strong id="text-label">Bigger text</strong></span><span className="setting-switch" aria-hidden="true"/></button>
      <button className="comfort-option" role="switch" aria-checked={preferences.solid} onClick={() => onToggle('solid')} aria-labelledby="solid-label"><Icon name="squares"/><span><strong id="solid-label">Solid backgrounds</strong></span><span className="setting-switch" aria-hidden="true"/></button>
    </div>
    <button className="primary-button" onClick={onClose}>Done <Icon name="check"/></button>
  </dialog>
}
