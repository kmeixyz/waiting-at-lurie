import { useEffect, useRef, useState } from 'react'
import { Icon } from '../Icons'
import { useGame, useGameDelay } from '../useGame'
import { play } from '../sound'
import { LightBulb, LightMirror, LightStar, LightSun, LightWall } from './LightArt'
import { lightHint, lightPuzzles, traceLight, turnMirror, type Mirror } from './lightLabLogic'
import './light-lab.css'

export function LightLab({ start = 0, onPuzzle }: { start?: number; onPuzzle?: (index: number) => void }) {
  const { paused, report, finish } = useGame()
  const [puzzleIndex, setPuzzleIndex] = useState(start)
  const puzzle = lightPuzzles[puzzleIndex]!
  const [history, setHistory] = useState<readonly Mirror[][]>([[...puzzle.initial]])
  const [hint, setHint] = useState<number | null>(null)
  const [notice, setNotice] = useState('Tap a mirror to turn it. Follow the light as you go.')
  const board = history[history.length - 1]!
  const beam = traceLight(board, puzzle)
  const coachMirror = beam.solved ? null : lightHint(board, puzzle)
  const turns = history.length - 1
  const firstMirror = useRef<HTMLButtonElement>(null)
  const resetFocus = useRef(false)
  const location = (at: number) => `row ${Math.floor(at / puzzle.size) + 1}, column ${at % puzzle.size + 1}`

  useEffect(() => {
    report(beam.solved ? `Lit up in ${turns} ${turns === 1 ? 'turn' : 'turns'}` : `${puzzle.name}: ${turns} ${turns === 1 ? 'turn' : 'turns'}`)
  }, [beam.solved, puzzle.name, turns, report])
  useEffect(() => {
    if (resetFocus.current && !paused) { resetFocus.current = false; firstMirror.current?.focus({ preventScroll: true }) }
  }, [history, paused])

  const turn = (index: number) => {
    if (paused || beam.solved) return
    const next = turnMirror(board, index)
    setHistory(previous => [...previous, [...next]])
    setHint(null)
    if (traceLight(next, puzzle).solved) {
      setNotice('All three stars are glowing and the light reached the goal!')
      play('good')
    } else { setNotice(`Mirror ${index + 1} turned. Keep exploring the path.`); play('tap') }
  }
  const reset = (index: number) => {
    if (paused) return
    setPuzzleIndex(index); onPuzzle?.(index); setHistory([[...lightPuzzles[index]!.initial]]); setHint(null)
    setNotice('Tap a mirror to turn it. Follow the light as you go.')
    resetFocus.current = true
  }
  const showHint = () => {
    if (paused || beam.solved) return
    const next = lightHint(board, puzzle)
    setHint(next)
    if (next !== null) setNotice(`Turn mirror ${next + 1} at ${location(puzzle.mirrors[next]!)}. It is marked with a dotted outline.`)
  }
  // Every lit board is a win of its own, with its own sticker; after a beat to see it glow, the finish screen offers the next one.
  useGameDelay(() => finish(`${puzzle.name} lit up!`), beam.solved ? 1100 : null, `${puzzleIndex}:${history.length}`)
  const stopMessage = { edge: 'The beam leaves the board.', wall: 'The beam meets a wall.', source: 'The beam returns to Start.', loop: 'The beam goes around in a loop.', receiver: beam.solved ? 'Goal reached!' : 'Goal reached. Light the remaining stars too.' }[beam.stop]

  return <div className="discovery-game light-game">
    <div className="mini-game-heading"><div><span className="eyebrow">A bright little idea</span><h2>{puzzle.name}</h2></div><span className="mini-game-count">{turns} {turns === 1 ? 'turn' : 'turns'}</span></div>
    <div className="puzzle-picker" role="group" aria-label="Choose a light experiment">{lightPuzzles.map((entry, index) => <button key={entry.name} disabled={paused || beam.solved} aria-pressed={index === puzzleIndex} onClick={() => reset(index)}>{entry.name}</button>)}</div>
    <p className="discovery-instruction"><strong>Tap a mirror to turn it.</strong> Guide the light through all three stars, then into the goal.</p>
    <div className="light-map">
      <div className="light-key"><span><LightSun/> Start</span><span><LightStar lit/> Light 3 stars</span><span><LightBulb lit/> Goal</span></div>
      <div className="light-board" role="group" aria-label={`${puzzle.name}, 5 by 5 light board`}>
        <svg className="light-beam" viewBox="0 0 5 5" aria-hidden="true"><polyline points={beam.points.map(point => point.join(',')).join(' ')} className="light-beam-halo"/><polyline points={beam.points.map(point => point.join(',')).join(' ')} className="light-beam-core"/></svg>
        {Array.from({ length: puzzle.size ** 2 }, (_, at) => {
          const mirror = puzzle.mirrors.indexOf(at), target = puzzle.targets.indexOf(at)
          const lit = beam.lit.includes(at)
          if (mirror !== -1) return <button ref={mirror === 0 ? firstMirror : undefined} key={at} className={`light-cell light-mirror ${hint === mirror ? 'light-hinted' : ''}`} disabled={paused || beam.solved} data-coach={mirror === coachMirror || undefined} aria-label={`Mirror ${mirror + 1}, ${location(at)}, ${board[mirror] === '/' ? 'slash' : 'backslash'}${hint === mirror ? ', hint' : ''}. Turn mirror.`} onClick={() => turn(mirror)}><LightMirror mirror={board[mirror]!}/><span className="light-mirror-number" aria-hidden="true">{mirror + 1}</span></button>
          if (target !== -1) return <div key={at} className={`light-cell light-target ${lit ? 'light-lit' : ''}`} role="img" aria-label={`Star ${target + 1}, ${location(at)}, ${lit ? 'lit' : 'unlit'}`}><span><LightStar lit={lit}/><b>{target + 1}</b></span></div>
          if (at === puzzle.source || at === puzzle.receiver) {
            const start = at === puzzle.source
            return <div key={at} className={`light-cell light-endpoint ${start || beam.stop === 'receiver' ? 'light-lit' : ''}`} role="img" aria-label={`${start ? 'Start, light shines right' : 'Goal'}, ${location(at)}${!start && beam.stop === 'receiver' ? ', reached' : ''}`}><span>{start ? <LightSun/> : <LightBulb lit={beam.stop === 'receiver'}/>}<b>{start ? 'Start →' : 'Goal'}</b></span></div>
          }
          return <div key={at} className={`light-cell ${puzzle.walls.includes(at) ? 'light-wall' : ''}`} role={puzzle.walls.includes(at) ? 'img' : undefined} aria-label={puzzle.walls.includes(at) ? `Wall, ${location(at)}` : undefined} aria-hidden={puzzle.walls.includes(at) ? undefined : true}>{puzzle.walls.includes(at) && <LightWall/>}</div>
        })}
      </div>
    </div>
    <div className="discovery-feedback" role="status"><strong>{beam.lit.length} of 3 stars lit. {stopMessage}</strong><p>{notice}</p></div>
    <div className="discovery-actions"><button className="secondary-button" disabled={paused || beam.solved || history.length < 2} onClick={() => { setHistory(previous => previous.slice(0, -1)); setHint(null); setNotice('Last turn undone.'); }}><Icon name="restart" size={18}/> Undo</button><button className="text-button" disabled={paused || beam.solved} onClick={() => reset(puzzleIndex)}>Start fresh</button><button className="secondary-button" disabled={paused || beam.solved} onClick={showHint}><Icon name="sparkle" size={18}/> Hint</button></div>
  </div>
}
