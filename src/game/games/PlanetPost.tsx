import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Icon } from '../Icons'
import { useGame, useGameDelay } from '../useGame'
import { play } from '../sound'
import { usePipeTap } from './usePipeTap'
import { MailFriend, PlanetFriend, PlanetPostArt } from './PlanetArt'
import { PostMail } from './PostMail'
import { pipeShape, portNames, ports, postHint, postPuzzles, rotatePipe, tracePost, type PipeBoard } from './planetPostLogic'
import './planet-post.css'

/** Pipe openings remain a clear functional diagram beneath the storybook art. */
function PipeGlyph({ openings }: { openings: number }) {
  const ends = [[50, 0], [100, 50], [50, 100], [0, 50]]
  const points = ports.flatMap((port, index) => openings & port ? [ends[index]!] : [])
  const d = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}${index === 0 ? ' Q50 50' : ''}`).join(' ')
  // A quadratic curve joins bends; straight pieces pass through the same center.
  const path = points.length === 2 ? `M${points[0]![0]} ${points[0]![1]} Q50 50 ${points[1]![0]} ${points[1]![1]}` : d
  return <svg viewBox="0 0 100 100" aria-hidden="true" className="post-pipe-glyph"><path d={path} className="post-pipe-edge"/><path d={path} className="post-pipe-core"/><path d={path} className="post-pipe-shine"/></svg>
}

export function PlanetPostCover() {
  return <div className="post-cover" aria-hidden="true"><PlanetPostArt/></div>
}

export function PlanetPost({ start = 0, onPuzzle }: { start?: number; onPuzzle?: (index: number) => void }) {
  const { paused, quiet, report, finish } = useGame()
  const [puzzleIndex, setPuzzleIndex] = useState(start)
  const puzzle = postPuzzles[puzzleIndex]!
  const [history, setHistory] = useState<PipeBoard[]>([puzzle.initial])
  const [hint, setHint] = useState<number | null>(null)
  const [notice, setNotice] = useState('Tap a pipe to turn it.')
  const [delivering, setDelivering] = useState(false)
  const [delivered, setDelivered] = useState(false)
  const board = history[history.length - 1]!
  const turns = history.length - 1
  const route = tracePost(board, puzzle)
  const busy = delivering || delivered
  // Every route works by turning pipes alone; some pipes are spares the route never uses.
  const coachAt = busy || route.connected ? null : postHint(board, puzzle)
  const boardRef = useRef<HTMLDivElement>(null)
  const resetFocus = useRef(false)
  const wasConnected = useRef(false)
  const location = (at: number) => `row ${Math.floor(at / puzzle.size) + 1}, column ${at % puzzle.size + 1}`

  useEffect(() => {
    report(delivered ? `Delivered in ${turns} ${turns === 1 ? 'turn' : 'turns'}` : `${puzzle.name}: ${turns} ${turns === 1 ? 'turn' : 'turns'}`)
  }, [delivered, puzzle.name, turns, report])
  useEffect(() => {
    if (route.connected && !wasConnected.current) play('good')
    wasConnected.current = route.connected
  }, [route.connected])
  useEffect(() => {
    if (resetFocus.current && !paused) { resetFocus.current = false; boardRef.current?.focus({ preventScroll: true }) }
  }, [history, paused])
  useEffect(() => { if (delivering && !paused) boardRef.current?.focus({ preventScroll: true }) }, [delivering, paused])

  const arrive = () => {
    setDelivering(false); setDelivered(true)
    setNotice('Mail delivered!'); play('star')
  }
  const commit = (next: PipeBoard, message: string) => {
    setHistory(previous => [...previous, next]); setHint(null)
    const connected = tracePost(next, puzzle).connected
    if (!connected) play('tap')
    setNotice(connected ? 'Connected! Off goes the mail…' : message)
  }
  const pipeTap = usePipeTap({ enabled: !paused && !busy, boardKey: board, onTap: at => choose(at) })
  const choose = (at: number) => {
    if (paused || busy || board[at]?.fixed) return
    commit(rotatePipe(board, at), 'Pipe turned.')
  }
  const reset = (index: number) => {
    if (paused || delivering) return
    pipeTap.cancel()
    setPuzzleIndex(index); onPuzzle?.(index); setHistory([postPuzzles[index]!.initial]); setHint(null); setDelivered(false)
    setNotice('Tap a pipe to turn it.')
    resetFocus.current = true
  }
  const showHint = () => {
    if (paused || busy) return
    const next = postHint(board, puzzle)
    setHint(next)
    setNotice(next === null ? 'The route is ready. Send your mail!' : 'Turn the pipe with the !')
  }
  const send = () => {
    if (paused || busy || !route.connected) return
    setHint(null)
    if (quiet) arrive()
    else { setNotice('Your mail is on its way.'); setDelivering(true) }
  }
  // A finished path sends the mail by itself after a short look.
  useGameDelay(send, route.connected && !busy ? 700 : null, history.length)
  // Every delivery is a win of its own, with its own sticker; after a beat to see it land, the finish screen offers the next route.
  useGameDelay(() => finish(`Mail delivered to ${puzzle.name}!`), delivered ? 900 : null, delivered)

  return <div className="discovery-game post-game">
    <div className="mini-game-heading"><div><h2>{puzzle.name}</h2></div><span className="mini-game-count">{turns} {turns === 1 ? 'turn' : 'turns'}</span></div>
    <div className="puzzle-picker" role="group" aria-label="Choose a mail route">{postPuzzles.map((entry, index) => <button key={entry.name} disabled={paused || delivering} aria-pressed={index === puzzleIndex} onClick={() => reset(index)}>{entry.name}</button>)}</div>
    <p className="discovery-instruction">Make a path from <strong>Start</strong> to <strong>Planet</strong>. Tap a pipe to turn it. Not every pipe is needed.</p>
    <div className="post-map"><div className="post-map-key"><span><MailFriend/> Start</span><span><PlanetFriend/> Planet</span></div>
      <div ref={boardRef} className="post-board" role="group" tabIndex={0} aria-label={`${puzzle.name}, ${puzzle.size} by ${puzzle.size} pipe board`} style={{ '--post-size': puzzle.size } as CSSProperties}>
        {board.map((pipe, at) => {
          if (!pipe) return <span className="post-space" key={at} aria-hidden="true">·</span>
          const active = route.path.includes(at), highlighted = hint === at
          const destination = at === puzzle.end, start = at === puzzle.start
          const className = `post-tile ${active ? 'post-connected' : ''} ${highlighted ? 'post-hinted' : ''} ${pipe.fixed ? 'post-fixed' : ''} ${destination ? 'post-destination' : ''}`
          const connections = ports.flatMap((port, index) => pipe.openings & port ? [portNames[index]] : []).join(' and ')
          const content = <><PipeGlyph openings={pipe.openings}/>{pipe.fixed && <span className="post-endpoint">{start ? <MailFriend/> : <PlanetFriend/>}<span>{start ? 'Start' : 'Planet'}</span></span>}{highlighted && <span className="post-hint-dot" aria-hidden="true">!</span>}</>
          return pipe.fixed ? <div key={at} className={className} role="img" aria-label={`${start ? 'Start: post office' : 'Destination: planet'}, ${location(at)}, fixed pipe, connects ${connections}`}>{content}</div> : <button key={at} className={className} data-post-index={at} data-coach={at === coachAt || undefined} disabled={paused || busy} aria-label={`${location(at)}, ${pipeShape(pipe.openings)}, connects ${connections}${active ? ', connected to start' : ''}${highlighted ? ', hint' : ''}`} onPointerDown={event => pipeTap.begin(event, at)} onPointerUp={pipeTap.end} onPointerCancel={pipeTap.interrupted} onClick={event => { if (pipeTap.allowClick(event)) choose(at) }} onDragStart={event => event.preventDefault()} onContextMenu={event => event.preventDefault()}>{content}</button>
        })}
        {delivering && <PostMail route={route.path} size={puzzle.size} onArrive={arrive}/>}
      </div>
    </div>
    <p className="discovery-feedback" role="status">{notice}</p>
    <div className="discovery-actions"><button className="secondary-button" disabled={history.length < 2 || paused || busy} onClick={() => { setHistory(history.slice(0, -1)); setHint(null); setNotice('Move undone.'); }}><Icon name="restart" size={18}/> Undo</button><button className="text-button" disabled={paused || delivering} onClick={() => reset(puzzleIndex)}>Start fresh</button><button className="secondary-button" disabled={paused || busy || route.connected} onClick={showHint}><Icon name="sparkle" size={18}/> Hint</button></div>
    <p className="post-status discovery-complete" aria-hidden="true"><Icon name={delivered ? 'check' : 'mail'}/> {delivered ? `Delivered to ${puzzle.name}!` : delivering ? 'Delivering…' : route.connected ? 'Connected!' : 'Join Start to Planet'}</p>
  </div>
}
