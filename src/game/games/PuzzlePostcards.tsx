import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Icon } from '../Icons'
import { shuffle } from '../logic'
import { useGame } from '../useGame'
import { play } from '../sound'
import { piecePosition, PostcardArt, type PieceCount, type PostcardScene } from './postcardArt'

export function PuzzlePostcards({ scene, count }: { scene: PostcardScene; count: PieceCount }) {
  const { paused, finish, report } = useGame()
  const [order] = useState(() => shuffle(Array.from({ length: count }, (_, i) => i)))
  const [placed, setPlaced] = useState<number[]>([])
  const livePlaced = useRef(placed)
  const [selected, setSelected] = useState<number | null>(null)
  const [hint, setHint] = useState(false)
  const [feedback, setFeedback] = useState('Tap a piece. Then tap where it goes.')
  const pieceRefs = useRef<(HTMLButtonElement | null)[]>([])
  const spaceRefs = useRef<(HTMLButtonElement | null)[]>([])
  const doneRef = useRef<HTMLButtonElement>(null)
  const focusAfterPlace = useRef(false)
  const complete = placed.length === count

  useEffect(() => {
    if (!focusAfterPlace.current) return
    focusAfterPlace.current = false
    if (complete) doneRef.current?.focus({ preventScroll: true })
    else pieceRefs.current[order.find(i => !placed.includes(i))!]?.focus({ preventScroll: true })
  }, [placed, complete, order])

  function select(piece: number, keyboard: boolean) {
    if (paused || livePlaced.current.includes(piece)) return
    play('tap'); setSelected(piece); setHint(livePlaced.current.length === 0)
    setFeedback('Now tap where it goes.')
    if (keyboard) spaceRefs.current[Array.from({ length: count }, (_, i) => i).find(i => !livePlaced.current.includes(i))!]?.focus({ preventScroll: true })
  }
  function place(space: number, keyboard: boolean) {
    if (paused || livePlaced.current.includes(space)) return
    if (selected === null) { setFeedback('First pick a piece below.'); return }
    if (selected !== space) { play('oops'); setHint(true); setFeedback('Not there. Try the space that says Here.'); return }
    const next = [...livePlaced.current, space]
    livePlaced.current = next; focusAfterPlace.current = keyboard
    play(next.length === count ? 'star' : 'good'); setPlaced(next); setSelected(null); setHint(false)
    report(`${next.length} of ${count} pieces placed`)
    setFeedback(next.length === count ? 'Tap All done to keep your postcard.' : 'It fits! Pick another piece.')
  }
  function help() {
    if (paused || selected === null) return
    setHint(true); setFeedback('It goes where it says Here.')
    spaceRefs.current[selected]?.focus({ preventScroll: true })
  }

  return <div className="postcard-game" style={{ '--piece-columns': count / 2, '--piece-count': count, '--tray-columns': count === 6 ? 3 : count } as CSSProperties}>
    <div className="mini-game-heading"><div><h2>{complete ? 'Picture complete!' : selected === null ? 'Pick a piece' : 'Pick a space'}</h2></div><span className="mini-game-count"><Icon name="puzzle"/>{placed.length} / {count}</span></div>
    <div className="postcard-workspace">
      <figure className="postcard-reference"><PostcardArt scene={scene}/><figcaption>Your picture</figcaption></figure>
      <div className={`postcard-board ${complete ? 'is-complete' : ''}`} role="group" aria-label="Your postcard">{Array.from({ length: count }, (_, i) => <button key={i} ref={el => { spaceRefs.current[i] = el }} onClick={event => place(i, event.detail === 0)} aria-label={`${piecePosition(i, count)} space${placed.includes(i) ? ', filled' : ''}${hint && selected === i ? ', place selected piece here' : ''}`} aria-disabled={placed.includes(i)} tabIndex={placed.includes(i) ? -1 : 0} data-coach={selected === i || undefined} className={hint && selected === i ? 'postcard-hint' : ''}>
        {placed.includes(i) ? <PostcardArt scene={scene} count={count} piece={i} decorative/> : <><span className="postcard-ghost" aria-hidden="true"><PostcardArt scene={scene} count={count} piece={i} decorative/></span>{hint && selected === i && <span className="space-label">Here</span>}</>}
      </button>)}</div>
    </div>
    <p className="mini-game-feedback" role="status">{feedback}</p>
    {!complete && <>
      <div className="postcard-tray" role="group" aria-label="Pick a puzzle piece">{order.map((piece, index) => <button key={piece} ref={el => { pieceRefs.current[piece] = el }} onClick={event => select(piece, event.detail === 0)} aria-label={`Piece ${index + 1}, ${piecePosition(piece, count)}${placed.includes(piece) ? ', placed' : ''}`} aria-pressed={selected === piece} aria-disabled={placed.includes(piece)} tabIndex={placed.includes(piece) ? -1 : 0} data-coach={(selected === null && order.find(i => !placed.includes(i)) === piece) || undefined}>
        {placed.includes(piece) ? <span className="piece-placed"><Icon name="check"/><span>Placed</span></span> : <><PostcardArt scene={scene} count={count} piece={piece} decorative/>{selected === piece && <span className="piece-number"><Icon name="check" size={15}/></span>}</>}
      </button>)}</div>
      <div className="postcard-actions"><button className="secondary-button" disabled={selected === null} onClick={help}><Icon name="eye"/> Show me where</button></div>
    </>}
    {complete && <div className="garden-actions"><button ref={doneRef} className="primary-button" data-coach onClick={() => { if (!paused) finish('Your postcard!', <PostcardArt scene={scene}/>) }}>All done <Icon name="check"/></button></div>}
  </div>
}
