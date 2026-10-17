import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icons'

const FIRST_HINT = 2500, IDLE_HINT = 9000
const nextTarget = () => [...document.querySelectorAll<HTMLElement>('.game-surface [data-coach]')].find(element => !element.matches(':disabled,[aria-disabled="true"]') && element.getClientRects().length)

/**
 * A pointing hand that shows, rather than tells, what to tap next.
 * Each game marks its next useful control with `data-coach` ("swipe" for a
 * swipe area). The hand appears after a short pause with no taps, and hides
 * on the next touch, click or key press.
 */
export function Coach({ active }: { active: boolean }) {
  const [shown, setShown] = useState(false)
  const [swipe, setSwipe] = useState(false)
  const hand = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  useEffect(() => {
    if (!active) { setShown(false); return }
    let timer = 0
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setShown(true), first.current ? FIRST_HINT : IDLE_HINT)
    }
    const interact = (event: Event) => {
      if (!(event.target instanceof Element) || !event.target.closest('.game-surface')) return
      first.current = false
      setShown(false)
      schedule()
    }
    const showNow = () => {
      // Only an explicit request scrolls: on small phones the next action may
      // be below the board. Idle hints never move the child's page for them.
      nextTarget()?.scrollIntoView({ block: 'center', behavior: 'instant' })
      window.clearTimeout(timer)
      setShown(true)
      schedule()
    }
    schedule()
    window.addEventListener('waiting-at-lurie:show-me', showNow)
    document.addEventListener('pointerdown', interact, true)
    document.addEventListener('keydown', interact, true)
    document.addEventListener('click', interact, true)
    return () => { window.clearTimeout(timer); window.removeEventListener('waiting-at-lurie:show-me', showNow); document.removeEventListener('pointerdown', interact, true); document.removeEventListener('keydown', interact, true); document.removeEventListener('click', interact, true) }
  }, [active])

  useEffect(() => {
    if (!shown) return
    let frame = 0
    // Follow the target while it is shown: layouts shift as games respond.
    const follow = () => {
      const target = nextTarget()
      const element = hand.current
      if (element) {
        const box = target?.getBoundingClientRect()
        const visible = box && box.bottom > 0 && box.top < window.innerHeight
        element.style.opacity = visible ? '1' : '0'
        if (box && visible) {
          const isSwipe = target!.dataset.coach === 'swipe'
          setSwipe(isSwipe)
          element.style.left = `${box.left + box.width / 2}px`
          element.style.top = `${box.top + (isSwipe ? box.height * .62 : box.height / 2)}px`
        }
      }
      frame = requestAnimationFrame(follow)
    }
    follow()
    return () => cancelAnimationFrame(frame)
  }, [shown])

  if (!active || !shown) return null
  return <div ref={hand} className={`coach-hand ${swipe ? 'coach-swipe' : ''}`} aria-hidden="true"><Icon name="point" size={46} weight="fill"/></div>
}
