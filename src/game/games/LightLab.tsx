import { useEffect, useRef, useState } from 'react'
import { Icon } from '../Icons'
import { useGame } from '../useGame'
import { play } from '../sound'
import { lightHint, lightPuzzles, traceLight, turnMirror, type Mirror } from './lightLabLogic'
import './light-lab.css'

function MirrorGlyph({ mirror }: { mirror: Mirror }) {
  return <svg viewBox="0 0 100 100" aria-hidden="true" className="light-mirror-glyph"><path d={mirror === '/' ? 'M23 77L77 23' : 'M23 23L77 77'} stroke="currentColor" strokeWidth="9" strokeLinecap="round"/><path d={mirror === '/' ? 'M29 77L77 29' : 'M23 29L71 77'} stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
}

export function LightLabCover() {
  return <div className="light-cover" aria-hidden="true"><svg viewBox="0 0 320 230"><g stroke="#39435f" strokeWidth="1">{[60, 110, 160, 210, 260].map(x => <path key={x} d={`M${x} 25V205`}/>)}{[40, 90, 140, 190].map(y => <path key={y} d={`M35 ${y}H285`}/>)}</g><path d="M60 190H210V90H110V40" fill="none" stroke="#ffdd76" strokeWidth="7" strokeLinejoin="round"/><g stroke="#9be6f4" strokeWidth="10" strokeLinecap="round"><path d="M194 206L226 174M194 74L226 106M94 106L126 74"/></g><circle cx="60" cy="190" r="15" fill="#ffdd76"/><circle cx="110" cy="40" r="14" fill="#9be6f4"/><g fill="#ffe9a6" stroke="#202941" strokeWidth="3">{[[135, 190], [210, 140], [160, 90]].map(([x, y]) => <path key={x} transform={`translate(${x} ${y})`} d="M0-13 4-4 14-4 6 3 9 13 0 7-9 13-6 3-14-4-4-4Z"/>)}</g></svg></div>
}

export function LightLab() {
  const { paused, report, finish } = useGame()
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const puzzle = lightPuzzles[puzzleIndex]!
  const [history, setHistory] = useState<readonly Mirror[][]>([[...puzzle.initial]])
  const [completed, setCompleted] = useState<number[]>([])
  const [hint, setHint] = useState<number | null>(null)
  const [notice, setNotice] = useState('Tap a mirror to turn it. Follow the light as you go.')
  const board = history[history.length - 1]!
  const beam = traceLight(board, puzzle)
  const coachMirror = beam.solved ? null : lightHint(board, puzzle)
  const firstMirror = useRef<HTMLButtonElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const resetFocus = useRef(false)
  const location = (at: number) => `row ${Math.floor(at / puzzle.size) + 1}, column ${at % puzzle.size + 1}`

  useEffect(() => { report(`${completed.length} of 3 light experiments`) }, [completed.length, report])
  useEffect(() => { if (beam.solved && !paused) nextButton.current?.focus({ preventScroll: true }) }, [beam.solved, paused])
  useEffect(() => {
    if (resetFocus.current && !paused) { resetFocus.current = false; firstMirror.current?.focus({ preventScroll: true }) }
  }, [history, paused])

  const turn = (index: number) => {
    if (paused || beam.solved) return
    const next = turnMirror(board, index)
    setHistory(previous => [...previous, [...next]])
    setHint(null)
    if (traceLight(next, puzzle).solved) {
      setCompleted(previous => previous.includes(puzzleIndex) ? previous : [...previous, puzzleIndex])
      setNotice('All three stars are glowing and the light reached the goal!')
      play('good')
    } else { setNotice(`Mirror ${index + 1} turned. Keep exploring the path.`); play('tap') }
  }
  const reset = (index: number) => {
    if (paused) return
    setPuzzleIndex(index); setHistory([[...lightPuzzles[index]!.initial]]); setHint(null)
    setNotice('Tap a mirror to turn it. Follow the light as you go.')
    resetFocus.current = true
  }
  const showHint = () => {
    if (paused || beam.solved) return
    const next = lightHint(board, puzzle)
    setHint(next)
    if (next !== null) setNotice(`Turn mirror ${next + 1} at ${location(puzzle.mirrors[next]!)}. It is marked with a dotted outline.`)
  }
  const stopMessage = { edge: 'The beam leaves the board.', wall: 'The beam meets a wall.', source: 'The beam returns to Start.', loop: 'The beam goes around in a loop.', receiver: beam.solved ? 'Goal reached!' : 'Goal reached. Light the remaining stars too.' }[beam.stop]

  return <div className="discovery-game light-game">
    <div className="mini-game-heading"><div><span className="eyebrow">A bright little idea</span><h2>{puzzle.name}</h2></div><span className="mini-game-count">{completed.length} / 3 complete</span></div>
    <div className="puzzle-picker" role="group" aria-label="Choose a light experiment">{lightPuzzles.map((entry, index) => <button key={entry.name} disabled={paused} aria-pressed={index === puzzleIndex} onClick={() => reset(index)}>{entry.name}{completed.includes(index) && <Icon name="check" size={16}/>}</button>)}</div>
    <p className="discovery-instruction"><strong>Tap a mirror to turn it.</strong> Guide the light through all three stars, then into the goal.</p>
    <div className="light-map">
      <div className="light-key"><span><Icon name="sun" size={18}/> Start</span><span><Icon name="star" size={18}/> Light 3 stars</span><span><Icon name="check" size={18}/> Goal</span></div>
      <div className="light-board" role="group" aria-label={`${puzzle.name}, 5 by 5 light board`}>
        <svg className="light-beam" viewBox="0 0 5 5" aria-hidden="true"><polyline points={beam.points.map(point => point.join(',')).join(' ')} className="light-beam-halo"/><polyline points={beam.points.map(point => point.join(',')).join(' ')} className="light-beam-core"/></svg>
        {Array.from({ length: puzzle.size ** 2 }, (_, at) => {
          const mirror = puzzle.mirrors.indexOf(at), target = puzzle.targets.indexOf(at)
          const lit = beam.lit.includes(at)
          if (mirror !== -1) return <button ref={mirror === 0 ? firstMirror : undefined} key={at} className={`light-cell light-mirror ${hint === mirror ? 'light-hinted' : ''}`} disabled={paused || beam.solved} data-coach={mirror === coachMirror || undefined} aria-label={`Mirror ${mirror + 1}, ${location(at)}, ${board[mirror] === '/' ? 'slash' : 'backslash'}${hint === mirror ? ', hint' : ''}. Turn mirror.`} onClick={() => turn(mirror)}><MirrorGlyph mirror={board[mirror]!}/><span className="light-mirror-number" aria-hidden="true">{mirror + 1}</span></button>
          if (target !== -1) return <div key={at} className={`light-cell light-target ${lit ? 'light-lit' : ''}`} role="img" aria-label={`Star ${target + 1}, ${location(at)}, ${lit ? 'lit' : 'unlit'}`}><span><Icon name="star" size={34} weight={lit ? 'fill' : 'regular'}/><b>{target + 1}</b></span></div>
          if (at === puzzle.source || at === puzzle.receiver) {
            const start = at === puzzle.source
            return <div key={at} className={`light-cell light-endpoint ${start || beam.stop === 'receiver' ? 'light-lit' : ''}`} role="img" aria-label={`${start ? 'Start, light shines right' : 'Goal'}, ${location(at)}${!start && beam.stop === 'receiver' ? ', reached' : ''}`}><span><Icon name={start ? 'sun' : 'check'} size={25}/><b>{start ? 'Start →' : 'Goal'}</b></span></div>
          }
          return <div key={at} className={`light-cell ${puzzle.walls.includes(at) ? 'light-wall' : ''}`} role={puzzle.walls.includes(at) ? 'img' : undefined} aria-label={puzzle.walls.includes(at) ? `Wall, ${location(at)}` : undefined} aria-hidden={puzzle.walls.includes(at) ? undefined : true}>{puzzle.walls.includes(at) && <span>×</span>}</div>
        })}
      </div>
    </div>
    <div className="discovery-feedback" role="status"><strong>{beam.lit.length} of 3 stars lit. {stopMessage}</strong><p>{notice}</p></div>
    <div className="discovery-actions"><button className="secondary-button" disabled={paused || beam.solved || history.length < 2} onClick={() => { setHistory(previous => previous.slice(0, -1)); setHint(null); setNotice('Last turn undone.'); }}><Icon name="restart" size={18}/> Undo</button><button className="text-button" disabled={paused} onClick={() => reset(puzzleIndex)}>Start fresh</button><button className="secondary-button" disabled={paused || beam.solved} onClick={showHint}><Icon name="sparkle" size={18}/> Hint</button></div>
    {beam.solved && <div className="light-success"><strong><Icon name="check"/> A bright idea, brought to life.</strong>{completed.length < 3 && <button ref={nextButton} data-coach className="primary-button" disabled={paused} onClick={() => reset(lightPuzzles.findIndex((_, index) => !completed.includes(index)))}>Next experiment</button>}<button ref={completed.length === 3 ? nextButton : undefined} data-coach={completed.length === 3 || undefined} className={completed.length === 3 ? 'primary-button' : 'secondary-button'} disabled={paused} onClick={() => finish(completed.length === 3 ? 'Three bright ideas. Look at you glow.' : 'A little light goes a long way.')}>All done</button></div>}
  </div>
}
