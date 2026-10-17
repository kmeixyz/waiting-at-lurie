import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Icon } from '../Icons'
import { keyDirection } from '../Controls'
import type { Direction } from '../logic'
import { useGame, useGameDelay } from '../useGame'
import { play } from '../sound'
import { makeRobotBoard, robotHint, robotSolution, robotStep, robotWon, ROBOT_COMMAND_LIMIT, type RobotPosition } from './robotRouteLogic'
import { RobotAvatar, RobotBlock, RobotHome, RobotStar } from './RobotArt'
import './robot-route.css'

const directionIcon = (direction: Direction) => direction === 'left' ? 'back' : direction
type Run = RobotPosition & { step: number; status: 'planning' | 'running' | 'stopped' | 'blocked' | 'home'; id: number }

function RobotPlanner() {
  const { paused, finish, report } = useGame()
  const [board] = useState(makeRobotBoard)
  const [program, setProgram] = useState<Direction[]>([])
  const [run, setRun] = useState<Run>({ at: board.start, collected: 0, step: 0, status: 'planning', id: 0 })
  const [notice, setNotice] = useState('Collect 3 stars, then go to the house.')
  const [attempts, setAttempts] = useState(0)
  const workspace = useRef<HTMLDivElement>(null)
  const mobileStop = useRef<HTMLButtonElement>(null)
  const queue = useRef<HTMLOListElement>(null)
  const done = useRef(false)
  const running = run.status === 'running', home = run.status === 'home'
  const count = board.stars.filter((_, i) => (run.collected & (1 << i)) !== 0).length

  useEffect(() => { report(`${count} of 3 stars collected · ${attempts} ${attempts === 1 ? 'test run' : 'test runs'}`) }, [count, attempts, report])
  useEffect(() => {
    if (running && window.matchMedia('(max-width: 760px)').matches) {
      workspace.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
      mobileStop.current?.focus({ preventScroll: true })
    }
  }, [running])

  function stop() {
    setRun(previous => ({ ...previous, status: 'stopped' }))
    setNotice('Stopped. Edit your path, then run it again.')
  }

  function edit(next: Direction[], message = 'Route updated. Each run starts at the robot’s starting tile.') {
    if (paused || running || done.current) return
    setProgram(next)
    setRun(previous => ({ at: board.start, collected: 0, step: 0, status: 'planning', id: previous.id + 1 }))
    setNotice(message)
  }

  function add(direction: Direction) {
    if (program.length >= ROBOT_COMMAND_LIMIT) {
      setNotice('20 steps full. Remove an arrow or tap Hint.')
      return
    }
    play('tap')
    edit([...program, direction], `Step ${program.length + 1}: ${direction}.`)
  }

  function remove(index: number) {
    edit(program.filter((_, i) => i !== index), `Removed step ${index + 1}.`)
    requestAnimationFrame(() => {
      const buttons = queue.current?.querySelectorAll<HTMLButtonElement>('button')
      if (buttons?.length) buttons[Math.min(index, buttons.length - 1)]?.focus()
      else workspace.current?.focus()
    })
  }

  function start() {
    if (paused || running || !program.length || done.current) return
    setAttempts(value => value + 1)
    setRun(previous => ({ at: board.start, collected: 0, step: 0, status: 'running', id: previous.id + 1 }))
    setNotice('Robot moving…')
  }

  function hint() {
    const next = robotHint(board, program)
    edit(next.program, next.repaired ? 'I adjusted the end of your route and added a helpful step.' : next.program.length > program.length ? `Hint added: ${next.program.at(-1)}. Keep building, or run your route.` : 'Your route is ready! Press Run route.')
  }

  useGameDelay(() => {
    if (paused) return
    // Let the robot visibly arrive before the round ends.
    if (home) { finish('Your robot is home!'); return }
    if (done.current || !running) return
    const direction = program[run.step]!
    const next = robotStep(board, run, direction)
    if (!next) {
      play('oops')
      setRun(previous => ({ ...previous, status: 'blocked' }))
      setNotice(`Step ${run.step + 1} bumps into a block. Remove that arrow, or tap Hint.`)
      return
    }
    const step = run.step + 1
    if (robotWon(board, next)) {
      done.current = true
      report(`All 3 stars collected · ${step} ${step === 1 ? 'step' : 'steps'} · ${attempts} ${attempts === 1 ? 'test run' : 'test runs'}`)
      setRun(previous => ({ ...previous, ...next, step, status: 'home' }))
      setNotice('Home sweet home! All 3 stars collected.')
      return
    }
    if (next.collected !== run.collected) play('star')
    const stopped = step >= program.length
    setRun(previous => ({ ...previous, ...next, step, status: stopped ? 'stopped' : 'running' }))
    const stars = board.stars.filter((_, i) => next.collected & (1 << i)).length
    setNotice(stopped ? `${stars} of 3 stars. ${stars === 3 ? 'Add arrows to reach the house.' : 'Add more arrows to collect the remaining stars and reach the house.'} Every test starts from the beginning.` : `Step ${step}: ${direction}. Row ${Math.floor(next.at / board.size) + 1}, column ${next.at % board.size + 1}. ${stars} of 3 stars.`)
  }, running ? 550 : home ? 1200 : null, `${run.id}:${run.step}:${run.status}`)

  // The hand points at the next helpful arrow, or at Run once the route works.
  const coach = running || home ? null : robotHint(board, program)
  const routeWorks = !!coach && coach.program.length === program.length && !coach.repaired
  const coachArrow = coach && !coach.repaired && coach.program.length > program.length ? coach.program.at(-1) : undefined

  function keyboard(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey || paused || running) return
    const direction = keyDirection(event.key)
    if (direction) { event.preventDefault(); add(direction) }
  }

  return <div className={`robot-workspace ${home ? 'robot-arrived' : ''}`} ref={workspace} role="group" aria-label="Robot Route workspace. Arrow keys or W A S D add steps." tabIndex={0} onKeyDown={keyboard}>
    <RobotMap board={board} at={run.at} collected={run.collected}>{running && <div className="robot-mobile-run"><span>Running step {run.step + 1} of {program.length}</span><button ref={mobileStop} className="secondary-button" onClick={stop}>Stop robot</button></div>}</RobotMap>
    <div className="robot-program-panel">
      <div className="robot-program-heading"><h2>Your route</h2><span>{program.length} / {ROBOT_COMMAND_LIMIT} steps</span></div>
      <p className="robot-instruction">Add arrows to make a path. Tap an arrow in your path to remove it.</p>
      <div className="robot-add" role="group" aria-label="Add a direction">{(['up', 'right', 'down', 'left'] as Direction[]).map(direction => <button key={direction} data-coach={direction === coachArrow || undefined} onClick={() => add(direction)} disabled={running || home || program.length >= ROBOT_COMMAND_LIMIT} aria-label={`Add ${direction}`}><Icon name={directionIcon(direction)} size={25}/><span>{direction}</span></button>)}</div>
      <ol className="robot-queue" ref={queue} aria-label="Your path">{Array.from({ length: ROBOT_COMMAND_LIMIT }, (_, index) => <li key={index} aria-hidden={index >= program.length ? true : undefined}>{program[index] ? <button onClick={() => remove(index)} disabled={running || home} aria-label={`Remove step ${index + 1}: ${program[index]}`} aria-current={running && run.step === index ? 'step' : undefined} className={`${index < run.step ? 'executed' : ''} ${run.status === 'blocked' && index === run.step ? 'blocked' : ''}`}><span>{index + 1}</span><Icon name={directionIcon(program[index]!)} size={23}/></button> : <span className="robot-empty-slot">{index + 1}</span>}</li>)}</ol>
      <div className="robot-edit-actions"><button className="text-button" disabled={running || home || !program.length} onClick={() => edit(program.slice(0, -1), 'Last arrow removed.')}><Icon name="restart" size={18}/> Undo</button><button className="text-button" disabled={running || home || !program.length} onClick={() => edit([], 'Fresh route. Add your first arrow.')}>Clear</button><button className="secondary-button" data-coach={coach?.repaired || undefined} disabled={running || home} onClick={hint}><Icon name="sparkle" size={18}/> Hint</button></div>
      <button className="primary-button robot-run" data-coach={routeWorks || undefined} disabled={!program.length || home} onClick={running ? stop : start}><Icon name={running ? 'pause' : 'play'} weight="fill"/>{running ? 'Stop test' : 'Run route'}</button>
      <p className={`robot-notice ${run.status === 'blocked' ? 'needs-edit' : ''}`} role="status" aria-live="polite" aria-atomic="true">{notice}</p>
      <p className="robot-keyboard"><Icon name="keyboard" size={18}/> Arrow keys or W A S D add steps.</p>
    </div>
  </div>
}

type RobotBoard = ReturnType<typeof makeRobotBoard>

/** The shared map: both ways of playing draw the same board. */
type MapTaps = { steps: Map<number, Direction>; coach?: Direction; onTap: (at: number) => void }
function RobotMap({ board, at: position, collected, className = '', taps, children }: { board: RobotBoard; at: number; collected: number; className?: string; taps?: MapTaps; children?: ReactNode }) {
  const count = board.stars.filter((_, i) => (collected & (1 << i)) !== 0).length
  return <>
    <div className={`robot-map-panel ${className}`}>
      <div className="robot-map-heading"><strong aria-label={`${count} of 3 stars collected`}><Icon name="star" weight="fill"/>{count} / 3</strong></div>
      {children}
      <div className="robot-board-wrap">
        <table className="robot-board" aria-label="Route map. Rows run top to bottom; columns run left to right."><tbody>
          {Array.from({ length: board.size }, (_, y) => <tr key={y}>{Array.from({ length: board.size }, (_, x) => {
            const at = y * board.size + x, wall = board.walls.includes(at), star = board.stars.indexOf(at)
            const taken = star >= 0 && !!(collected & (1 << star)), robot = at === position, dock = at === board.dock
            const label = `Row ${y + 1}, column ${x + 1}: ${robot ? 'robot, ' : ''}${wall ? 'blocked' : dock ? 'home' : star >= 0 ? taken ? 'star collected' : 'star' : at === board.start ? 'start' : 'open'}`
            const step = taps?.steps.get(at)
            // Tapping a square is a shortcut for pointers; the arrow buttons stay the accessible controls.
            return <td key={x} aria-label={label} data-cell={at} data-step={step} data-coach={(step && step === taps?.coach) || undefined} onClick={taps && (() => taps.onTap(at))} data-robot={robot || undefined} data-wall={wall || undefined} data-star={star >= 0 || undefined} data-dock={dock || undefined} className={`${wall ? 'robot-wall' : ''} ${dock ? 'robot-dock' : ''} ${star >= 0 ? 'robot-star' : ''} ${taken ? 'collected' : ''} ${robot ? 'robot-here' : ''} ${step ? 'robot-step' : ''}`}>
              <div>{robot ? <RobotAvatar/> : wall ? <RobotBlock/> : dock ? <RobotHome/> : star >= 0 ? taken ? <Icon name="check" size={29} weight="fill"/> : <RobotStar/> : at === board.start ? <span className="robot-start-dot"/> : null}<span className="robot-coordinate" aria-hidden="true">{y + 1},{x + 1}</span></div>
            </td>
          })}</tr>)}
        </tbody></table>
      </div>
      <div className="robot-legend" aria-hidden="true"><span><RobotAvatar/> Robot</span><span><RobotStar/> Stars</span><span><RobotHome/> Home</span><span><RobotBlock/> Block</span></div>
    </div>
  </>
}

/** Little-kid mode: every arrow moves the robot right away. */
function RobotStepper() {
  const { paused, finish, report } = useGame()
  const [board] = useState(makeRobotBoard)
  const [trail, setTrail] = useState<RobotPosition[]>([{ at: board.start, collected: 0 }])
  const [notice, setNotice] = useState('Tap a glowing square to move the robot.')
  const [bump, setBump] = useState(0)
  const [home, setHome] = useState(false)
  const here = trail.at(-1)!
  const count = board.stars.filter((_, i) => (here.collected & (1 << i)) !== 0).length
  const next = home ? undefined : robotSolution(board, here)?.[0]
  // The open squares beside the robot glow; tapping one moves the robot there.
  const steps = new Map<number, Direction>()
  if (!home) for (const direction of ['up', 'left', 'right', 'down'] as Direction[]) { const moved = robotStep(board, here, direction); if (moved) steps.set(moved.at, direction) }
  function tap(at: number) {
    if (paused || home || at === here.at) return
    const direction = steps.get(at)
    if (direction) go(direction)
    else setNotice('Tap a glowing square next to the robot.')
  }

  useEffect(() => { report(`${count} of 3 stars · ${trail.length - 1} ${trail.length === 2 ? 'step' : 'steps'}`) }, [count, trail.length, report])
  useGameDelay(() => finish('Your robot is home!'), home ? 1200 : null, home)

  function go(direction: Direction) {
    if (paused || home) return
    const moved = robotStep(board, here, direction)
    if (!moved) { play('oops'); setBump(value => value + 1); setNotice('Bump! Try another way.'); return }
    setTrail([...trail, moved])
    const stars = board.stars.filter((_, i) => (moved.collected & (1 << i)) !== 0).length
    if (robotWon(board, moved)) { setHome(true); setNotice('Home sweet home!'); return }
    if (moved.collected !== here.collected) { play('star'); setNotice(stars === 3 ? 'All 3 stars! Now go to the house.' : `Star ${stars}! Find the next one.`); return }
    play('tap')
    setNotice(moved.at === board.dock ? 'Get all the stars first!' : stars === 3 ? 'Now go to the house.' : 'Keep going!')
  }

  function keyboard(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey || paused) return
    const direction = keyDirection(event.key)
    if (direction) { event.preventDefault(); go(direction) }
  }

  return <div className={`robot-workspace robot-stepper ${home ? 'robot-arrived' : ''}`} role="group" aria-label="Robot Route. Arrow keys or W A S D move the robot." tabIndex={0} onKeyDown={keyboard}>
    <RobotMap key={bump} className={bump ? 'robot-bumped' : ''} board={board} at={here.at} collected={here.collected} taps={{ steps, coach: next, onTap: tap }}/>
    <div className="robot-program-panel">
      <div className="robot-add robot-pad" role="group" aria-label="Move the robot">{(['up', 'left', 'right', 'down'] as Direction[]).map(direction => <button key={direction} className={`robot-pad-${direction}`} data-coach={direction === next || undefined} onClick={() => go(direction)} disabled={home} aria-label={`Move ${direction}`}><Icon name={directionIcon(direction)} size={30}/><span>{direction}</span></button>)}</div>
      <p className="robot-notice" role="status" aria-live="polite" aria-atomic="true"><Icon name="star" weight="fill" size={18}/> {count} / 3 · {notice}</p>
      <div className="robot-edit-actions"><button className="text-button" disabled={home || trail.length < 2} onClick={() => { setTrail(trail.slice(0, -1)); setNotice('Back one step.') }}><Icon name="restart" size={18}/> Undo</button><button className="text-button" disabled={home || trail.length < 2} onClick={() => { setTrail(trail.slice(0, 1)); setNotice('Back to the start.') }}>Start again</button></div>
      <p className="robot-keyboard"><Icon name="keyboard" size={18}/> Arrow keys or W A S D move the robot.</p>
    </div>
  </div>
}

export function RobotRoute({ mode = 'step' }: { mode?: 'step' | 'plan' }) {
  return mode === 'plan' ? <RobotPlanner/> : <RobotStepper/>
}
