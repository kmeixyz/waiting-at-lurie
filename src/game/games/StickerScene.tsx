import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { CreatureIcon, type CreatureKind } from '../creatures'
import { Icon } from '../Icons'
import { gameList } from '../gameList'
import { play } from '../sound'
import { readStickers } from '../stickers'
import { useGame } from '../useGame'

type Scene = 'Meadow' | 'Ocean' | 'Space'
type Sticker = { id: string; label: string } & ({ kind: 'friend'; friend: CreatureKind } | { kind: 'badge'; icon: string; color: string })
type Placed = { key: number; sticker: Sticker; x: number; y: number; turn: number }

export const stickerScenes = ['Meadow', 'Ocean', 'Space'] as const
const friends: CreatureKind[] = ['bunny', 'bear', 'cat', 'dino', 'duck', 'owl', 'fish', 'star']
const MAX_STICKERS = 24

function Backdrop({ scene }: { scene: Scene }) {
  return <svg className="sticker-backdrop" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    {scene === 'Meadow' ? <>
      <rect width="400" height="260" fill="#dff0fb"/><circle cx="335" cy="52" r="28" fill="#f8d373"/>
      <path d="M40 60q8-20 28-12 14-20 32-3 22-2 24 15Z" fill="#fff"/><path d="M220 44q7-16 23-10 12-16 27-2 18-2 20 12Z" fill="#fff"/>
      <path d="M0 170Q100 130 200 165T400 150V260H0Z" fill="#b9dca5"/><path d="M0 205Q120 180 240 205T400 195V260H0Z" fill="#9fcd8b"/>
    </> : scene === 'Ocean' ? <>
      <rect width="400" height="260" fill="#cfeefa"/><circle cx="70" cy="48" r="24" fill="#f8d373"/>
      <path d="M0 110Q50 98 100 110T200 110T300 110T400 110V260H0Z" fill="#7fc4e3"/><path d="M0 160Q60 148 120 160T240 160T360 160T400 158V260H0Z" fill="#5fb0d6"/>
      <path d="M0 225Q100 205 200 225T400 220V260H0Z" fill="#f1dfb0"/>
    </> : <>
      <rect width="400" height="260" fill="#2c2f63"/>{[[40, 40], [120, 80], [210, 30], [300, 70], [360, 30], [80, 140], [250, 120], [340, 160], [160, 180]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.5" fill="#fff6c9"/>)}
      <circle cx="320" cy="200" r="46" fill="#b9a6ec"/><ellipse cx="320" cy="200" rx="74" ry="14" fill="none" stroke="#e8dcff" strokeWidth="5"/>
      <circle cx="70" cy="215" r="26" fill="#8fd3c5"/>
    </>}
  </svg>
}

function StickerArt({ sticker, size }: { sticker: Sticker; size: number }) {
  return sticker.kind === 'friend' ? <CreatureIcon kind={sticker.friend} size={size}/>
    : <span className={`sticker-badge theme-${sticker.color} sticker-${sticker.id}`} style={{ width: size, height: size }}><Icon name={sticker.icon} size={size * .55} weight="fill"/></span>
}

/** A finished picture for the result screen. */
function Picture({ scene, placed }: { scene: Scene; placed: Placed[] }) {
  return <div className="sticker-picture"><Backdrop scene={scene}/>{placed.map(item => <span key={item.key} className="placed-sticker" style={{ left: `${item.x}%`, top: `${item.y}%`, rotate: `${item.turn}deg` }}><StickerArt sticker={item.sticker} size={52}/></span>)}</div>
}

export function StickerCover() {
  return <div className="sticker-cover" aria-hidden="true"><Picture scene="Meadow" placed={[
    { key: 1, sticker: { id: 'bunny', label: 'Bunny', kind: 'friend', friend: 'bunny' }, x: 28, y: 62, turn: -8 },
    { key: 2, sticker: { id: 'duck', label: 'Duck', kind: 'friend', friend: 'duck' }, x: 62, y: 70, turn: 6 },
    { key: 3, sticker: { id: 'star', label: 'Star', kind: 'friend', friend: 'star' }, x: 78, y: 26, turn: 12 },
  ]}/></div>
}

export function StickerScene({ scene, onScene }: { scene: Scene; onScene: (scene: Scene) => void }) {
  const { paused, finish, report } = useGame()
  const setScene = onScene
  // Stickers won in other games join the tray after the friends.
  const [tray] = useState<Sticker[]>(() => {
    const book = readStickers()
    const earned = gameList.filter(game => book[game.id]).map(game => ({ id: game.id, label: `${game.name} sticker`, kind: 'badge' as const, icon: game.icon, color: game.color }))
    return [...friends.map(friend => ({ id: friend, label: friend[0]!.toUpperCase() + friend.slice(1), kind: 'friend' as const, friend })), ...earned]
  })
  // A sticker is ready from the start, so the very first tap on the picture works.
  const [chosen, setChosen] = useState(0)
  const [placed, setPlaced] = useState<Placed[]>([])
  const nextKey = useRef(0)
  const [notice, setNotice] = useState('Tap the picture to stick on the bunny!')
  useEffect(() => { report(`${placed.length} ${placed.length === 1 ? 'sticker' : 'stickers'}`) }, [placed.length, report])
  const full = placed.length >= MAX_STICKERS
  const sticker = tray[chosen]!

  function place(event: MouseEvent<HTMLButtonElement>) {
    if (paused) return
    if (full) { play('oops'); setNotice('The picture is full! Tap a sticker on it to take it off.'); return }
    const box = event.currentTarget.getBoundingClientRect()
    // Keyboard presses have no position: choose a spot that is not taken.
    const keyboard = event.detail === 0
    const x = keyboard ? 12 + (placed.length * 37) % 76 : (event.clientX - box.left) / box.width * 100
    const y = keyboard ? 18 + (placed.length * 23) % 64 : (event.clientY - box.top) / box.height * 100
    play('pop')
    const item = { key: nextKey.current++, sticker, x: Math.min(91, Math.max(9, x)), y: Math.min(86, Math.max(14, y)), turn: Math.round(Math.random() * 24 - 12) }
    // Quick double taps both land: build on the latest list, not this render's.
    setPlaced(previous => previous.length >= MAX_STICKERS ? previous : [...previous, item])
    setNotice(placed.length === 0 ? 'Great! Pick another sticker, or tap again.' : `${sticker.label} added.`)
  }
  function remove(key: number) {
    if (paused) return
    play('tap'); setPlaced(previous => previous.filter(item => item.key !== key)); setNotice('Sticker taken off.')
  }

  return <div className="sticker-game">
    <div className="mini-game-heading"><div><h2>Make a picture</h2></div><span className="mini-game-count"><Icon name="sticker"/>{placed.length}</span></div>
    <div className="puzzle-picker" role="group" aria-label="Choose a picture">{stickerScenes.map(name => <button key={name} aria-pressed={scene === name} onClick={() => setScene(name)}>{name}</button>)}</div>
    <div className="sticker-canvas">
      <Backdrop scene={scene}/>
      <button className="sticker-place" data-coach={placed.length < 4 || undefined} onClick={place} aria-label={`Picture. Add a ${sticker.label} sticker.`}/>
      {placed.map((item, index) => <button key={item.key} className="placed-sticker" style={{ left: `${item.x}%`, top: `${item.y}%`, rotate: `${item.turn}deg` }} onClick={() => remove(item.key)} aria-label={`${item.sticker.label} sticker ${index + 1}. Tap to take it off.`}><StickerArt sticker={item.sticker} size={52}/></button>)}
    </div>
    <p className="mini-game-feedback" role="status">{notice}</p>
    <div className="sticker-tray" role="group" aria-label="Stickers">{tray.map((item, index) => <button key={item.id} aria-pressed={chosen === index} onClick={() => { play('tap'); setChosen(index); setNotice(`Now tap the picture to add the ${item.label.toLowerCase()}.`) }} aria-label={item.label}><StickerArt sticker={item} size={40}/></button>)}</div>
    <div className="discovery-actions"><button className="secondary-button" disabled={!placed.length || paused} onClick={() => { setPlaced(placed.slice(0, -1)); setNotice('Last sticker taken off.') }}><Icon name="restart" size={18}/> Undo</button><button className="text-button" disabled={!placed.length || paused} onClick={() => { setPlaced([]); setNotice('A fresh picture.') }}>Clear</button><button className="primary-button" data-coach={placed.length >= 4 || undefined} disabled={!placed.length || paused} onClick={() => finish('Your sticker picture!', <Picture scene={scene} placed={placed}/>)}><Icon name="check"/> All done</button></div>
  </div>
}
