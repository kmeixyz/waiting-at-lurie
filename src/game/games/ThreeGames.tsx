import { useEffect, useRef, useState, type CSSProperties } from 'react'
import * as THREE from 'three'
import { advanceSky, makeSky, skyJump, skyLane, skyMaxMultiplier, skyMultiplier, skyStreakProgress, skyStreakStep } from '../logic'
import { useGame } from '../useGame'
import { useBoardInput } from '../Controls'
import { Icon } from '../Icons'
import { play } from '../sound'
import { FlatSky, createFlatSkyAnimator } from './FlatSky'
import { createSkyMotion } from './skyMotion'
import { createAdventureScene } from './adventureScene'

type View = { score: number; gems: number; bumps: number; combo: number; lane: number; air: number; cooldown: number; distance: number }

export function ThreeGame() {
  const runtime = useGame(), runtimeRef = useRef(runtime); runtimeRef.current = runtime
  const mount = useRef<HTMLDivElement>(null), flatTrack = useRef<HTMLDivElement>(null)
  const [initialSky] = useState(makeSky), sky = useRef(initialSky)
  const [fallback, setFallback] = useState(false)
  // Counts multiplier level-ups; the ring remounts on each one so its pop plays only when the streak goes up.
  const [streakPop, setStreakPop] = useState(0)
  const [view, setView] = useState<View>({ score: 0, gems: 0, bumps: 0, combo: 0, lane: 0, air: 0, cooldown: 0, distance: 0 })
  const [feedback, setFeedback] = useState('Swipe to catch the yellow gems!')
  const [upcoming, setUpcoming] = useState('')
  const move = (delta: number) => { if (!runtimeRef.current.paused) sky.current = skyLane(sky.current, delta) }
  const jump = () => { if (!runtimeRef.current.paused) sky.current = skyJump(sky.current) }
  const actions = useRef({ move, jump }); actions.current = { move, jump }
  const swipe = useBoardInput(direction => { if (direction === 'left') move(-1); else if (direction === 'right') move(1); else if (direction === 'up') jump() })

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      // Single-letter shortcuts operate only inside the focused game, as WCAG requires.
      if (runtimeRef.current.paused || event.altKey || event.ctrlKey || event.metaKey || !(event.target instanceof Element) || !event.target.closest('.three-game')) return
      if (['ArrowLeft', 'a', 'A'].includes(event.key)) { event.preventDefault(); actions.current.move(-1) }
      else if (['ArrowRight', 'd', 'D'].includes(event.key)) { event.preventDefault(); actions.current.move(1) }
      else if (['ArrowUp', 'w', 'W', ' '].includes(event.key) && !(event.target instanceof HTMLButtonElement && event.key === ' ')) { event.preventDefault(); if (!event.repeat) actions.current.jump() }
    }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key)
  }, [])

  useEffect(() => {
    const host = mount.current; if (!host) return
    const world = createAdventureScene(initialSky), motion = createSkyMotion(initialSky)
    let flatAnimator: ReturnType<typeof createFlatSkyAnimator> | null = null
    let renderer: THREE.WebGLRenderer | null = null, graphicsLost = false, frame = 0, alive = true
    let last = performance.now(), lastUI = last, sceneTime = 0, nextItemId = -1
    const resize = () => {
      // A retained round has a hidden, zero-size host while the library is open.
      if (!host.clientWidth || !host.clientHeight) return
      world.resize(host.clientWidth, host.clientHeight, runtimeRef.current.quiet)
      renderer?.setSize(host.clientWidth, host.clientHeight, false)
    }
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'default' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.35 : 1.6))
      renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12
      renderer.domElement.setAttribute('aria-hidden', 'true'); host.prepend(renderer.domElement); resize()
    } catch { setFallback(true) }
    const canvas = renderer?.domElement
    const lost = (event: Event) => { event.preventDefault(); graphicsLost = true; setFallback(true) }
    canvas?.addEventListener('webglcontextlost', lost)
    const observer = new ResizeObserver(resize); observer.observe(host)
    const update = (now: number) => {
      if (!alive) return
      const dt = Math.max(0, Math.min((now - last) / 1000, .1)); last = now
      const { paused, quiet } = runtimeRef.current
      if (!paused) {
        sceneTime += dt
        const before = sky.current; sky.current = advanceSky(before, dt, 10)
        if (sky.current.gems > before.gems) { const levelUp = skyMultiplier(sky.current.combo) > skyMultiplier(before.combo); play(levelUp ? 'star' : 'pop'); if (levelUp) setStreakPop(pop => pop + 1); setFeedback(levelUp ? `Streak ×${skyMultiplier(sky.current.combo)}! Gems are worth more.` : 'Gem caught!') }
        if (sky.current.bumps > before.bumps) { play('oops'); setFeedback(before.combo >= skyStreakStep ? 'Bump! Your streak starts over.' : 'Bump! Keep going.') }
        const next = sky.current.items.find(item => !item.hit && item.distance > sky.current.distance)
        if (next && next.id !== nextItemId) { nextItemId = next.id; setUpcoming(`${['Left', 'Center', 'Right'][next.lane + 1]} lane: ${next.kind === 'gem' ? 'gem ahead' : 'block ahead — jump or steer around'}.`) }
        const pose = motion.update(sky.current, sceneTime, dt, quiet)
        if (renderer && !graphicsLost) world.update(sky.current, sceneTime, dt, quiet, pose)
        if (flatTrack.current) {
          flatAnimator ??= createFlatSkyAnimator(flatTrack.current)
          flatAnimator(sky.current, pose, sceneTime, quiet)
        }
      }
      if (!paused && renderer && !graphicsLost) renderer.render(world.scene, world.camera)
      if (!paused && now - lastUI > 100) {
        lastUI = now; const s = sky.current
        runtimeRef.current.report(`${s.gems} ${s.gems === 1 ? 'gem' : 'gems'} · ${s.score} ${s.score === 1 ? 'point' : 'points'}`)
        setView({ score: s.score, gems: s.gems, bumps: s.bumps, combo: s.combo, lane: s.lane, air: s.air, cooldown: s.cooldown, distance: s.distance })
      }
      frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => { alive = false; cancelAnimationFrame(frame); observer.disconnect(); canvas?.removeEventListener('webglcontextlost', lost); world.dispose(); renderer?.dispose(); canvas?.remove() }
  }, [initialSky])

  const multiplier = skyMultiplier(view.combo), streak = skyStreakProgress(view.combo), maxed = multiplier === skyMaxMultiplier
  const toNext = skyStreakStep - view.combo % skyStreakStep
  return <div className={`three-game sky-game ${fallback ? 'flat-mode' : ''}`}>
    <div className="three-hud">
      <span className="hud-stat"><Icon name="gem" weight="fill" /><span><strong className={view.gems ? 'gem-count-pop' : undefined} key={view.gems}>{view.gems}</strong> {view.gems === 1 ? 'gem' : 'gems'}</span></span>
      {/* The ring fills with each gem in a row; when it closes, the multiplier goes up. */}
      <span className={`hud-streak ${maxed ? 'maxed' : ''}`} role="img" aria-label={`×${multiplier} streak. ${maxed ? 'Top streak!' : `${toNext} more ${toNext === 1 ? 'gem' : 'gems'} in a row for ×${multiplier + 1}.`}`}>
        <span className={`streak-ring ${streakPop ? 'pop' : ''}`} key={streakPop} style={{ '--streak': streak } as CSSProperties}><svg viewBox="0 0 40 40" aria-hidden="true"><circle className="streak-track" cx="20" cy="20" r="17" pathLength="1" /><circle className="streak-fill" cx="20" cy="20" r="17" pathLength="1" /></svg><strong>×{multiplier}</strong></span>
        <span className="streak-label">streak</span>
      </span>
      <span className="hud-stat"><span><strong>{view.score}</strong> points</span></span>
    </div>
    <div className="three-stage" ref={mount} data-coach="swipe" role="group" aria-label="Sky track. Guide the bunny on a cloud. Left and right steer. Up or Space jumps." tabIndex={0}
      onPointerDown={swipe.onPointerDown} onPointerUp={swipe.onPointerUp} onPointerCancel={swipe.onPointerCancel}>
      {fallback && <FlatSky sky={initialSky} trackRef={flatTrack}/>}
    </div>
    {fallback && <p className="graphics-note">3D isn’t available on this device. You’re playing the same game in flat view.</p>}
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{feedback}</p>
    <div className="sky-controls"><button className="steer-button" aria-label="Steer left" onClick={() => move(-1)}><Icon name="back" size={25} /><span>Left</span></button><button className="jump-button" aria-disabled={view.cooldown > 0} onClick={jump}><Icon name="up" />Jump<span>Space / ↑</span></button><button className="steer-button" aria-label="Steer right" onClick={() => move(1)}><span>Right</span><Icon name="right" size={25} /></button></div>
    <div className="journey-progress" role="progressbar" aria-label="Flight path completed" aria-valuemin={0} aria-valuemax={750} aria-valuenow={Math.min(750, Math.round(view.distance))}><span style={{ width: `${Math.min(100, view.distance / 7.5)}%` }} /><Icon name="flag" size={18} /></div>
    <p className="sr-only" aria-live="polite">{upcoming} Current lane: {['left', 'center', 'right'][view.lane + 1]}.</p>
  </div>
}
