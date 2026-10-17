import { useEffect, useRef, useState } from 'react'
import { memoryDeal, memoryFlip } from '../logic'
import { useGame, useGameDelay } from '../useGame'
import { Icon } from '../Icons'
import { play } from '../sound'

const title = (word: string) => word[0]!.toUpperCase() + word.slice(1)

export function MatchCover() {
  return <div className="cover-cards" aria-hidden="true"><span><Icon name="star" size={44} weight="fill" /></span><span>?</span><span><Icon name="star" size={44} weight="fill" /></span></div>
}

export function Matching({ onFinish, pairs = 3, memoryChallenge = false }: { onFinish: () => void; pairs?: 3 | 6; memoryChallenge?: boolean }) {
  const { paused, relaxed, report } = useGame()
  const [state, setState] = useState(() => memoryDeal(Math.random, pairs))
  const live = useRef(state)
  const area = useRef<HTMLDivElement>(null)
  const board = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLButtonElement | null)[]>([])
  const keyboardFocus = useRef(false)
  const lastCard = useRef(-1)
  const update = (next: typeof state) => { live.current = next; setState(next) }

  const complete = state.matched.length === pairs * 2
  useGameDelay(() => update({ ...live.current, open: [] }), state.open.length === 2 ? (relaxed ? 1400 : 900) : null, state.turns)
  // Different pictures stay up long enough to remember, then turn back by themselves.
  // Leave the last pair on screen for a moment before the result.
  useGameDelay(onFinish, complete ? 900 : null, complete)
  useEffect(() => { report(`${state.turns} ${state.turns === 1 ? 'turn' : 'turns'}`) }, [state.turns, report])
  useEffect(() => {
    if (paused || !keyboardFocus.current) return
    // Automatic card turning must never pull focus away from navigation or settings.
    if (document.activeElement !== document.body && !area.current?.contains(document.activeElement)) {
      keyboardFocus.current = false
      return
    }
    if (state.open.length === 2) {
      // All cards are temporarily disabled. Keep a focus position until they reopen.
      board.current?.focus({ preventScroll: true })
      return
    }
    keyboardFocus.current = false
    const available = state.deck.map((_, index) => index).filter(index => !state.open.includes(index) && !state.matched.includes(index))
    const next = available.find(index => index > lastCard.current) ?? available[0]
    if (next !== undefined) cards.current[next]?.focus({ preventScroll: true })
  }, [state, paused])

  const flip = (index: number, keyboard: boolean) => {
    if (paused) return
    const next = memoryFlip(live.current, index)
    if (next === live.current) return
    keyboardFocus.current = keyboard
    lastCard.current = index
    play(next.matched.length > live.current.matched.length ? 'good' : next.open.length === 2 ? 'oops' : 'tap')
    update(next)
  }

  return <div className="puzzle-area" ref={area}>
    <h2 className="matching-instruction">{memoryChallenge ? "Turn over two cards" : state.open.length === 1 ? "Find the same picture" : "Tap two matching pictures"}</h2>
    <div className="puzzle-status"><span><Icon name="cards"/> {state.matched.length / 2} of {pairs} pairs</span><span>{state.turns} {state.turns === 1 ? 'turn' : 'turns'}</span></div>
    <div ref={board} tabIndex={-1} className={`memory-board ${pairs === 3 ? 'memory-board-small' : ''}`} role="group" aria-label={memoryChallenge ? 'Memory cards' : 'Matching pictures'}>
      {state.deck.map((kind, i) => {
        const matched = state.matched.includes(i), selected = state.open.includes(i), open = !memoryChallenge || matched || selected
        const first = state.open[0]
        const coach = !matched && !selected && state.open.length < 2 && state.deck.findIndex((picture, c) => !state.matched.includes(c) && !state.open.includes(c) && (memoryChallenge || first === undefined || picture === state.deck[first])) === i
        return <button key={i} ref={el => { cards.current[i] = el }} data-coach={coach || undefined} className={`memory-card ${open ? 'open' : ''} ${matched ? 'matched' : ''} ${selected ? 'selected' : ''}`} aria-pressed={selected}
          onClick={event => flip(i, event.detail === 0)} disabled={matched || state.open.includes(i) || state.open.length === 2}
          aria-label={open ? `Card ${i + 1}: ${kind}${matched ? ', matched' : ''}` : `Hidden card ${i + 1}`}>
          <span>{open ? <Icon name={kind} size={40} weight="fill"/> : '?'}</span>{selected && !matched && <span className="matching-picked">Picked</span>}{matched && <Icon className="matched-check" name="check" size={15}/>}
        </button>
      })}
    </div>
    <p className="control-note" aria-live="polite">{complete ? 'You found every pair!' : state.open.length === 2
      ? `${title(state.deck[state.open[0]!]!)} and ${state.deck[state.open[1]!]!}. Not the same. Try again!`
      : state.open.length === 1 ? `${title(state.deck[state.open[0]!]!)}! Find another one.` : memoryChallenge ? 'Tap any card.' : 'Tap any picture.'}</p>
  </div>
}
