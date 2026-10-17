import type { Ref } from 'react'
import type { SkyState } from '../logic'
import { Icon } from '../Icons'
import { SkyBunny } from './SkyArt'
import { smoothStep, type SkyPose } from './skyMotion'

export function FlatSky({ sky, trackRef }: { sky: SkyState; trackRef: Ref<HTMLDivElement> }) {
  return <div className="flat-track" ref={trackRef} aria-hidden="true">
    <div className="flat-lanes"/>
    {sky.items.map(item => <span hidden className={`flat-object ${item.kind}`} data-sky-item={item.id} key={item.id}>
      {item.kind === 'gem' ? <Icon name="gem" weight="fill" size={27}/> : 'ᴗ'}
    </span>)}
    <span className="flat-ship"><SkyBunny/></span>
  </div>
}

/** Keep fallback motion on the animation clock, independent of the 10 Hz score display. */
export function createFlatSkyAnimator(track: HTMLDivElement) {
  const rider = track.querySelector<HTMLElement>('.flat-ship')!
  const items = new Map(Array.from(track.querySelectorAll<HTMLElement>('[data-sky-item]'), node => [Number(node.dataset.skyItem), {
    node, caughtAt: null as number | null, x: 50, y: 85, originX: 50, originY: 85,
  }]))
  return (sky: SkyState, pose: SkyPose, time: number, quiet: boolean) => {
    const riderX = 50 + pose.x / 2.25 * 30
    const jumpPixels = (pose.height - .5) * 36
    rider.style.left = `${riderX}%`
    rider.style.transform = `translate(-50%, calc(-50% - ${jumpPixels}px)) rotate(${-pose.lean}rad) scale(${1 / Math.sqrt(pose.stretch)}, ${pose.stretch})`
    rider.classList.toggle('jumping', sky.air > 0)
    for (const item of sky.items) {
      const visual = items.get(item.id)!, node = visual.node
      const distance = item.distance - sky.distance
      if (item.hit && item.kind === 'gem') {
        if (visual.caughtAt === null) {
          visual.caughtAt = time; visual.originX = visual.x; visual.originY = visual.y
        }
        const progress = (time - visual.caughtAt) / .34
        node.hidden = quiet || progress >= 1
        if (!node.hidden) {
          const ease = smoothStep(progress)
          node.style.left = `${visual.originX + (riderX - visual.originX) * ease}%`
          node.style.top = `${visual.originY + (85 - visual.originY) * ease}%`
          node.style.transform = `translate(-50%, calc(-50% - ${jumpPixels * ease + Math.sin(progress * Math.PI) * 18}px)) scale(${1 - ease}) rotate(${progress * 90}deg)`
          node.style.opacity = `${1 - ease}`
        }
        continue
      }
      node.hidden = item.hit || distance < -5 || distance > 65
      if (node.hidden) continue
      visual.x = 50 + item.lane * 30
      visual.y = 85 - distance / 65 * 85
      const pull = !quiet && item.kind === 'gem' && item.lane === sky.lane && distance >= 0 ? smoothStep(1 - distance / 2.8) * .65 : 0
      visual.x += (riderX - visual.x) * pull
      node.style.left = `${visual.x}%`; node.style.top = `${visual.y}%`
      const bob = quiet || item.kind !== 'gem' ? 0 : Math.sin(time * 2.5 + item.id) * 2
      node.style.transform = `translate(-50%, calc(-50% - ${bob + jumpPixels * pull}px))`
    }
  }
}
