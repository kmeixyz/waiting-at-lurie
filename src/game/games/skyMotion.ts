import type { SkyState } from '../logic'

type Spring = { position: number; velocity: number }

/** Exact critically damped spring: stable at 30, 60 or 120 Hz, including mid-move reversals. */
export function springTo(spring: Spring, target: number, frequency: number, dt: number) {
  const offset = spring.position - target
  const impulse = spring.velocity + frequency * offset
  const decay = Math.exp(-frequency * dt)
  spring.position = target + (offset + impulse * dt) * decay
  spring.velocity = (spring.velocity - frequency * impulse * dt) * decay
}

export const smoothStep = (value: number) => {
  const t = Math.max(0, Math.min(1, value))
  return t * t * (3 - 2 * t)
}

export function skyJumpPose(air: number, cooldown: number) {
  const t = Math.max(0, Math.min(1, 1 - air / .8))
  // Zero vertical speed at takeoff, the apex and touchdown prevents a landing snap.
  const arc = air > 0 ? Math.sin(Math.PI * t) ** 2 : 0
  const settle = air <= 0 && cooldown > 0 ? Math.sin(Math.PI * Math.max(0, Math.min(1, 1 - cooldown / .35))) ** 2 : 0
  return { lift: arc * 1.65, stretch: 1 + arc * .1 - settle * .14, earPitch: air > 0 ? Math.sin(Math.PI * 2 * t) * .2 : -settle * .12 }
}

export type SkyPose = { x: number; height: number; lean: number; stretch: number; earPitch: number }

export function createSkyMotion(initial: SkyState) {
  const lateral = { position: initial.lane * 2.25, velocity: 0 }
  const bank = { position: 0, velocity: 0 }
  const pose: SkyPose = { x: lateral.position, height: .5, lean: 0, stretch: 1, earPitch: 0 }
  return {
    update(sky: SkyState, time: number, dt: number, quiet: boolean) {
      const target = sky.lane * 2.25
      if (quiet) { lateral.position = target; lateral.velocity = 0; bank.position = 0; bank.velocity = 0 }
      else {
        springTo(lateral, target, 19, dt)
        springTo(bank, Math.max(-.18, Math.min(.18, -lateral.velocity * .024)), 16, dt)
      }
      const jump = skyJumpPose(sky.air, sky.cooldown)
      pose.x = lateral.position
      pose.height = .5 + jump.lift * (quiet ? .35 : 1) + (quiet ? 0 : Math.sin(time * 3.2) * .035)
      pose.lean = bank.position
      pose.stretch = quiet ? 1 : jump.stretch
      pose.earPitch = quiet ? 0 : jump.earPitch
      return pose
    },
  }
}
