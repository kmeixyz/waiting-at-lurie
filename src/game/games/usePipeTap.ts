import { useCallback, useEffect, useRef, type MouseEvent, type PointerEvent } from 'react'

type Press = { id: number; at: number; startX: number; startY: number; target: HTMLButtonElement }

/** Turns a pipe on tap. The tap is handled on pointer up, since mobile browsers may omit click after tiny finger movement. */
export function usePipeTap({ enabled, boardKey, onTap }: {
  enabled: boolean
  boardKey: unknown
  onTap: (at: number) => void
}) {
  const press = useRef<Press | null>(null)
  const suppressClick = useRef(false)

  const cancel = useCallback(() => {
    if (press.current) suppressClick.current = true
    press.current = null
  }, [])
  useEffect(() => { cancel() }, [enabled, boardKey, cancel])

  const begin = (event: PointerEvent<HTMLButtonElement>, at: number) => {
    if (!enabled || !event.isPrimary || event.button !== 0 || press.current) return
    suppressClick.current = false
    press.current = { id: event.pointerId, at, startX: event.clientX, startY: event.clientY, target: event.currentTarget }
  }
  const end = (event: PointerEvent<HTMLButtonElement>) => {
    const current = press.current
    if (!current || current.id !== event.pointerId) return
    press.current = null
    suppressClick.current = true
    // A slide is not a tap: only a press that stays on its pipe turns it.
    const stayed = Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < 8
    if (enabled && stayed && document.elementFromPoint(event.clientX, event.clientY)?.closest('button[data-post-index]') === current.target) {
      event.preventDefault()
      onTap(current.at)
    }
  }
  const interrupted = (event: PointerEvent<HTMLButtonElement>) => {
    if (press.current?.id === event.pointerId) cancel()
  }
  const allowClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Enter/Space and assistive-technology activation always turn the pipe.
    if (event.detail === 0 || (!suppressClick.current && !press.current)) return true
    event.preventDefault()
    return false
  }

  return { begin, end, interrupted, allowClick, cancel }
}
