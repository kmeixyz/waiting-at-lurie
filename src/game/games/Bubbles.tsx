import { useEffect, useRef, useState } from 'react'
import { CreatureIcon, type CreatureKind } from '../creatures'
import { Icon } from '../Icons'
import { shuffle } from '../logic'
import { useGame } from '../useGame'
import { play } from '../sound'

const cast: CreatureKind[] = ['bunny', 'dino', 'cat', 'owl', 'duck', 'bear', 'fish', 'star', 'bunny', 'dino', 'cat', 'duck']

/** Stationary, generous targets: no chasing, missed taps, or color-matching rules. */
export function Bubbles() {
  const { paused, finish, report } = useGame()
  // A new hiding place for every friend each round.
  const [friends] = useState(() => shuffle(cast))
  const [popped, setPopped] = useState<number[]>([])
  const live = useRef(popped)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const complete = popped.length === friends.length
  const doneRef = useRef<HTMLButtonElement>(null)
  const keyboardAction = useRef(false)
  useEffect(() => { if (complete && keyboardAction.current) doneRef.current?.focus({ preventScroll: true }) }, [complete])

  const pop = (index: number, keyboard: boolean) => {
    if (paused || live.current.includes(index)) return
    const next = [...live.current, index]
    keyboardAction.current = keyboard
    live.current = next
    play(next.length === friends.length ? 'star' : 'pop')
    setPopped(next)
    report(`${next.length} ${next.length === 1 ? 'bubble' : 'bubbles'} popped`)
    // Keep keyboard users moving through the board without returning to its beginning.
    const nextIndex = friends.findIndex((_, i) => i > index && !next.includes(i))
    const remaining = nextIndex < 0 ? friends.findIndex((_, i) => !next.includes(i)) : nextIndex
    if (keyboard && remaining >= 0) buttons.current[remaining]?.focus({ preventScroll: true })
  }

  return <div className="bubble-game">
    <div className="bubble-game-heading"><div><h2>{complete ? 'Every friend found!' : popped.length ? `You found ${/^[aeiou]/.test(friends[popped.at(-1)!]!) ? 'an' : 'a'} ${friends[popped.at(-1)!]}!` : 'Tap a bubble'}</h2><p>{complete ? 'Tap All done.' : popped.length ? 'Who else is hiding?' : 'Who is hiding inside?'}</p></div><span className="bubble-count"><Icon name="sparkle"/>{popped.length} / {friends.length}</span></div>
    <div className="bubble-board" role="group" aria-label="Bubbles to pop">
      {friends.map((friend, index) => {
        const found = popped.includes(index)
        const coach = !found && friends.findIndex((_, i) => !popped.includes(i)) === index
        return <button key={index} ref={el => { buttons.current[index] = el }} className={`pop-bubble bubble-color-${index % 4} ${found ? 'is-popped' : ''}`} aria-label={found ? `Bubble ${index + 1}: ${friend} found` : `Pop bubble ${index + 1}`} aria-disabled={found} tabIndex={found ? -1 : 0} data-coach={coach || undefined} onClick={event => pop(index, event.detail === 0)}>
          <span className="bubble-friend" aria-hidden="true"><CreatureIcon kind={friend} size={76}/></span>
          <span className="bubble-shell" aria-hidden="true"><span className="bubble-face"/></span>
          {found && <span className="bubble-found" aria-hidden="true"><Icon name="check" size={16}/></span>}
        </button>
      })}
    </div>
    {complete && <div className="garden-actions"><button ref={doneRef} className="primary-button" data-coach onClick={() => { if (!paused) finish('You found every friend!') }}>All done <Icon name="check"/></button></div>}
    <p className="sr-only" role="status">{popped.length} of {friends.length} friends found.</p>
  </div>
}
