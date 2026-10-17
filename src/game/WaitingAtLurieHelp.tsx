import { useEffect, useRef } from 'react'
import { Icon } from './Icons'

/** Help is a sheet so opening it never replaces a child's unfinished game. */
export function WaitingAtLurieHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!open) return
    const sheet = dialog.current!
    const overflow = document.body.style.overflow
    sheet.showModal()
    document.body.style.overflow = 'hidden'
    return () => { sheet.close(); document.body.style.overflow = overflow }
  }, [open])

  return <dialog ref={dialog} className="comfort-sheet help-sheet" aria-labelledby="help-title"
    onCancel={event => { event.preventDefault(); onClose() }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return
      const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button')
      const first = buttons[0], last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }}>
    <div className="comfort-heading"><h2 id="help-title">Help</h2><button className="icon-button" aria-label="Close help" onClick={onClose}><Icon name="close"/></button></div>
    <div className="help-steps">
      <div><Icon name="tap"/><div><h3>Choose a game</h3></div></div>
      <div><Icon name="point"/><div><h3>Show me</h3></div></div>
      <div><Icon name="pause"/><div><h3>Pause</h3></div></div>
      <div><Icon name="speaker"/><div><h3>Read to me</h3></div></div>
      <div><Icon name="settings"/><div><h3>Settings</h3></div></div>
      <div><Icon name="wave"/><div><h3>Bye</h3></div></div>
    </div>
    <button className="primary-button" onClick={onClose}>Got it <Icon name="check"/></button>
  </dialog>
}
