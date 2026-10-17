import { useEffect, useRef } from 'react'
import { shelf } from './gameList'
import { Icon } from './Icons'
import type { StickerBook as Book } from './stickers'

/** Every game's sticker in home screen order: won ones in color, each with how many times it was won. */
export function StickerBook({ open, onClose, stickers }: { open: boolean; onClose: () => void; stickers: Book }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!open) return
    const sheet = dialog.current!
    const overflow = document.body.style.overflow
    sheet.showModal()
    document.body.style.overflow = 'hidden'
    return () => { sheet.close(); document.body.style.overflow = overflow }
  }, [open])

  return <dialog ref={dialog} className="comfort-sheet sticker-sheet" aria-labelledby="sticker-title"
    onCancel={event => { event.preventDefault(); onClose() }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return
      const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button')
      const first = buttons[0], last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }}>
    <div className="comfort-heading"><h2 id="sticker-title">Stickers</h2><button className="icon-button" aria-label="Close stickers" onClick={onClose}><Icon name="close"/></button></div>
    <ul className="sticker-grid">{shelf.map(game => {
      const count = stickers[game.id] ?? 0
      return <li key={game.id} className={count ? 'is-won' : 'is-waiting'}>
        <span className={`sticker-badge theme-${game.color} sticker-${game.id}`} aria-hidden="true"><Icon name={game.icon} size={28} weight="fill"/><span className="sticker-times">×{count}</span></span>
        <strong>{game.name}<span className="sr-only">, won {count} {count === 1 ? 'time' : 'times'}</span></strong>
      </li>
    })}</ul>
    <button className="primary-button" onClick={onClose}>Done <Icon name="check"/></button>
  </dialog>
}
