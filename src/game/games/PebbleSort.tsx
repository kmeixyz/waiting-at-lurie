import { useEffect, useState, type CSSProperties } from 'react'
import { Icon } from '../Icons'
import { useGame, useGameDelay } from '../useGame'
import { play } from '../sound'
import { movePebble, pebbleKinds, sortHint, sortedJars, sortPuzzles, type Jars } from './discoveryLogic'

export function PebbleSort({ start = 0, onPuzzle }: { start?: number; onPuzzle?: (index: number) => void }) {
  const { paused, finish, report } = useGame()
  const [puzzle, setPuzzle] = useState(start)
  const [history, setHistory] = useState<Jars[]>([sortPuzzles[start]!.jars])
  const [selected, setSelected] = useState<number | null>(null)
  const [hint, setHint] = useState<[number, number] | null>(null)
  const [notice, setNotice] = useState('Tap a jar to pick up its top pebble.')
  const jars = history[history.length - 1]!
  const done = sortedJars(jars)
  const name = sortPuzzles[puzzle]!.name
  // Every sorted puzzle is a win of its own, with its own sticker; after a beat to see the jars, the finish screen offers the next puzzle.
  useGameDelay(() => finish(`${name} sorted!`), done ? 1200 : null, done)
  useEffect(() => { report(done ? `Sorted in ${history.length - 1} ${history.length === 2 ? 'move' : 'moves'}` : `${name}: ${history.length - 1} ${history.length === 2 ? 'move' : 'moves'}`) }, [done, name, history.length, report])
  // The hand shows the next helpful move: the jar to lift from, then the jar to drop in.
  const coachMove = done ? null : sortHint(jars)
  const coachJar = coachMove ? (selected === null ? coachMove[0] : selected === coachMove[0] ? coachMove[1] : selected) : -1
  // Once a pebble is lifted, show every jar it can go into, so no move is a guess.
  const canDrop = (index: number) => selected !== null && index !== selected && movePebble(jars, selected, index) !== null
  const choose = (index: number) => {
    if (paused || done) return
    if (selected === index) { setSelected(null); setHint(null); setNotice('Put back. Tap a jar to pick up a pebble.'); return }
    if (selected === null) {
      if (!jars[index]!.length) { play('oops'); setNotice('That jar is empty. Pick one with pebbles.'); return }
      play('tap'); setSelected(index); setNotice('Now tap a glowing jar to drop it in.'); return
    }
    const next = movePebble(jars, selected, index)
    if (!next) { play('oops'); setNotice('It can only go on the same shape, or in an empty jar.'); return }
    setHistory([...history, next]); setSelected(null); setHint(null)
    const sorted = sortedJars(next)
    play(sorted ? 'star' : 'tap')
    setNotice(sorted ? `All sorted in ${history.length} ${history.length === 1 ? 'move' : 'moves'}!` : 'Pebble moved!')
  }
  const reset = (index: number) => {
    if (paused) return
    setPuzzle(index); onPuzzle?.(index); setHistory([sortPuzzles[index]!.jars]); setSelected(null); setHint(null)
    setNotice('Tap a jar to start.')
  }
  const help = () => {
    const next = sortHint(jars)
    setSelected(null); setHint(next)
    setNotice(next ? `Try moving the top pebble from jar ${next[0] + 1} to jar ${next[1] + 1}.` : 'Tap Undo or Start fresh to try again.')
  }
  return <div className="discovery-game pebble-game">
    <div className="mini-game-heading"><div><h2>Sort the shapes</h2></div><span className="mini-game-count">{history.length - 1} {history.length === 2 ? 'move' : 'moves'}</span></div>
    <p className="discovery-instruction">Put the same shapes together. A jar holds 3.</p>
    <div className="puzzle-picker" role="group" aria-label="Choose a pebble puzzle">{sortPuzzles.map((entry,index) => <button key={entry.name} aria-pressed={index === puzzle} onClick={() => reset(index)}>{entry.name}</button>)}</div>
    <div className="pebble-jars" role="group" aria-label="Pebble jars" style={{ '--jars': jars.length } as CSSProperties}>{jars.map((jar,index) => <button key={index} className={`pebble-jar ${hint?.includes(index) ? 'hinted' : ''} ${canDrop(index) ? 'can-drop' : selected !== null && index !== selected ? 'no-drop' : ''}`} aria-pressed={selected === index} data-coach={index === coachJar || undefined} aria-label={`Jar ${index + 1}: ${jar.length ? jar.map(pebble => pebbleKinds[pebble].name).join(', ') + ', bottom to top' : 'empty'}${canDrop(index) ? '. It fits here.' : ''}`} onClick={() => choose(index)} disabled={done || paused}><span className="jar-vessel">{jar.map((pebble, position) => <span key={position} className="pebble" style={{ background: pebbleKinds[pebble].color }} aria-hidden="true">{pebbleKinds[pebble].symbol}</span>)}</span><strong>Jar {index + 1}</strong>{hint?.includes(index) ? <small>{hint[0] === index ? 'From here' : 'To here'}</small> : canDrop(index) && <small>It fits!</small>}</button>)}</div>
    <p className="discovery-feedback" role="status">{notice}</p>
    <div className="discovery-actions"><button className="secondary-button" disabled={history.length < 2 || paused} onClick={() => {setHistory(history.slice(0,-1));setSelected(null);setHint(null);setNotice('Move undone.')}}><Icon name="restart" size={18}/> Undo</button><button className="text-button" onClick={() => reset(puzzle)}>Start fresh</button><button className="secondary-button" disabled={done || paused} onClick={help}><Icon name="sparkle" size={18}/> Hint</button></div>
  </div>
}
