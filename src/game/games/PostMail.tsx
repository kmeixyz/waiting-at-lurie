import { useEffect, useRef, useState } from 'react'
import { MailFriend } from './PlanetArt'
import { useGame } from '../useGame'

const STEP_MS = 320
const ARRIVAL_MS = 160

/** One envelope glides between tile centers; only active animation time advances it. */
export function PostMail({ route, size, onArrive }: { route: number[]; size: number; onArrive: () => void }) {
  const { paused, quiet } = useGame()
  const [progress, setProgress] = useState(0)
  const elapsed = useRef(0)
  const arrived = useRef(false)
  const callback = useRef(onArrive)
  callback.current = onArrive
  const last = route.length - 1

  useEffect(() => {
    if (paused || arrived.current) return
    const complete = () => { arrived.current = true; callback.current() }
    if (quiet) { complete(); return }
    let previous = performance.now()
    let frame = 0
    const advance = (now: number) => {
      elapsed.current += Math.max(0, now - previous)
      previous = now
      setProgress(Math.min(last, elapsed.current / STEP_MS))
      if (elapsed.current >= last * STEP_MS + ARRIVAL_MS) complete()
      else frame = requestAnimationFrame(advance)
    }
    frame = requestAnimationFrame(advance)
    return () => cancelAnimationFrame(frame)
  }, [paused, quiet, last])

  const step = Math.floor(progress)
  const from = route[step]!, to = route[Math.min(last, step + 1)]!
  const fraction = progress - step
  const column = from % size + (to % size - from % size) * fraction
  const row = Math.floor(from / size) + (Math.floor(to / size) - Math.floor(from / size)) * fraction
  // Include the grid gap, so centers remain correct at every screen size.
  const center = (coordinate: number) => `calc(${(coordinate + .5) / size * 100}% + var(--post-gap) * ${(coordinate + .5) / size - .5})`
  return <span className="post-mail" aria-hidden="true" style={{ left: center(column), top: center(row) }}><MailFriend/></span>
}
