import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { SkyState } from '../logic'
import { smoothStep, type SkyPose } from './skyMotion'

const curve = (z: number) => Math.sin(Math.max(0, 2 - z) * .032) * Math.min(Math.max(0, 2 - z) * .075, 4)

/** Shared geometry, bounded particles and instanced track keep the world light on phones. */
export function createAdventureScene(initialSky: SkyState) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(58, 1, .1, 180)
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>()
  const cache = new Map<string, THREE.MeshStandardMaterial>()
  const material = (color: number, glow = false) => {
    const key = `${color}-${glow}`
    if (cache.has(key)) return cache.get(key)!
    const value = new THREE.MeshStandardMaterial({ color, roughness: .85, metalness: 0, emissive: glow ? color : 0, emissiveIntensity: glow ? .25 : 0 })
    materials.add(value); cache.set(key, value); return value
  }
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D = scene) => {
    geometries.add(geo); const mesh = new THREE.Mesh(geo, mat); parent.add(mesh); return mesh
  }
  const ballGeo = new THREE.SphereGeometry(1, 20, 14), cubeGeo = new THREE.BoxGeometry(1, 1, 1)
  const ball = (r: number, color: number, parent: THREE.Object3D, glow = false) => { const m = add(ballGeo, material(color, glow), parent); m.scale.setScalar(r); return m }
  const block = (w: number, h: number, d: number, color: number, parent: THREE.Object3D) => { const m = add(cubeGeo, material(color), parent); m.scale.set(w, h, d); return m }
  const torus = (r: number, tube: number, color: number, parent: THREE.Object3D) => add(new THREE.TorusGeometry(r, tube, 6, 36), material(color), parent)

  // A small procedural sky texture provides depth without a post-processing pass.
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, 0, 256)
  gradient.addColorStop(0, '#a5dce9')
  gradient.addColorStop(.6, '#d5eef4')
  gradient.addColorStop(1, '#fff1e6')
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 256)
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture); scene.background = texture
  scene.fog = new THREE.Fog(0xf6e9ed, 48, 135)
  scene.add(new THREE.HemisphereLight(0xfff9f0, 0xc2b4d0, 2))
  const sun = new THREE.DirectionalLight(0xffeddc, 2.5); sun.position.set(-8, 12, 8); scene.add(sun)
  const rim = new THREE.DirectionalLight(0xc4deff, .6); rim.position.set(4, 3, -5); scene.add(rim)

  const islands: { group: THREE.Group; offset: number }[] = [], clouds: THREE.Group[] = [], arches: THREE.Group[] = []
  const items = new Map<number, { group: THREE.Group; caughtAt: number | null; origin: THREE.Vector3 }>(), ears: THREE.Group[] = []

  const roadGeo = new THREE.BoxGeometry(7, .35, 2.55), edgeGeo = new THREE.BoxGeometry(.28, .4, 2.3)
  geometries.add(roadGeo); geometries.add(edgeGeo)
  const road = new THREE.InstancedMesh(roadGeo, material(0xffefd0), 55), edge = new THREE.InstancedMesh(edgeGeo, material(0xf4a8bb), 110)
  const markers = new THREE.InstancedMesh(cubeGeo, material(0xd9b9db), 110), dummy = new THREE.Object3D()
  geometries.add(cubeGeo)
  for (let i = 0; i < 55; i++) {
    const z = 8 - i * 2.5, x = curve(z), angle = Math.atan2(curve(z - .2) - curve(z + .2), .4)
    dummy.position.set(x, -.4, z); dummy.rotation.set(0, -angle, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); road.setMatrixAt(i, dummy.matrix)
    for (let j = 0; j < 2; j++) {
      dummy.position.set(x + (j ? 3.52 : -3.52), -.12, z); dummy.updateMatrix(); edge.setMatrixAt(i * 2 + j, dummy.matrix)
      dummy.position.set(x + (j ? 1.14 : -1.14), -.21, z); dummy.scale.set(.06, .015, 1.2); dummy.updateMatrix(); markers.setMatrixAt(i * 2 + j, dummy.matrix); dummy.scale.set(1, 1, 1)
    }
  }
  scene.add(road, edge, markers)
  // Marshmallow rainbows and cloud gardens frame the lanes without hiding pickups.
  const rainbow = [0xef99ae, 0xffce82, 0xb8dfc5, 0xb8b1e5]
  const archGeometries = rainbow.map((_, i) => new THREE.TorusGeometry(4.65 - i * .29, .17, 6, 36, Math.PI))
  for (let i = 0; i < 5; i++) {
    const group = new THREE.Group()
    rainbow.forEach((color, band) => add(archGeometries[band]!, material(color), group))
    for (const side of [-1, 1]) {
      for (let j = 0; j < 3; j++) {
        const puff = ball(.55, 0xfffbf4, group)
        puff.position.set(side * (3.75 + j * .42), -.12 + (j === 1 ? .2 : 0), 0)
        puff.scale.y = .65
      }
    }
    scene.add(group); arches.push(group)
  }
  for (let i = 0; i < 12; i++) {
    const group = new THREE.Group(), side = i % 2 ? 1 : -1
    group.position.set(side * (9 + i % 3 * 2.5), -2.5 - i % 2, 8 - i * 12)
    for (let j = 0; j < 3; j++) {
      const puff = ball(2, 0xfff7f5, group)
      puff.position.set((j - 1) * 1.8, j === 1 ? .25 : 0, 0); puff.scale.set(1.3, .65, 1.2)
    }
    const grass = ball(1, 0xb7dec5, group); grass.position.y = .9; grass.scale.set(3.2, .35, 2)
    for (let j = 0; j < 2; j++) {
      const tree = new THREE.Group(); tree.position.set(j ? 1.2 : -1, 1.1, j ? -.5 : .6)
      const trunk = block(.23, 1.4, .23, 0xc49682, tree); trunk.position.y = .6
      const leaves = ball(1, j ? 0xf5b7cd : 0xc2b4e5, tree); leaves.position.y = 1.6; leaves.scale.set(1, 1.25, .95)
      const fruit = ball(.18, 0xffe4a0, tree); fruit.position.set(.35, 1.7, .87)
      group.add(tree)
    }
    // A tiny daisy on each floating garden.
    for (let petal = 0; petal < 5; petal++) {
      const a = petal / 5 * Math.PI * 2, flower = ball(.19, 0xfffaf0, group)
      flower.position.set(Math.cos(a) * .25, 1.3 + Math.sin(a) * .25, 1.7)
    }
    ball(.16, 0xf5bf57, group).position.set(0, 1.3, 1.84)
    scene.add(group); islands.push({ group, offset: i * 13 })
  }
  for (let i = 0; i < 10; i++) {
    const cloud = new THREE.Group()
    for (let j = 0; j < 3; j++) { const puff = ball(1.7 + j * .3, 0xfffcf8, cloud); puff.position.x = j * 1.7; puff.scale.multiply(new THREE.Vector3(1.3, .6, 1)) }
    cloud.position.set((i % 2 ? 1 : -1) * (13 + i % 4 * 3), 5 + i % 3, -i * 13); scene.add(cloud); clouds.push(cloud)
  }

  // Mochi the bunny rides a little cloud. All pieces share the same sphere geometry.
  const rider = new THREE.Group(), bunny = new THREE.Group()
  rider.name = 'sky-rider'
  const puff = (x: number, y: number, z: number, sx: number, sy: number, sz: number, color: number, parent = rider) => {
    const mesh = ball(1, color, parent); mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); return mesh
  }
  puff(0, -.1, 0, .78, .22, .7, 0xe4d4ef)
  puff(0, .02, 0, .72, .25, .65, 0xfffcf4)
  for (const side of [-1, 1]) {
    puff(side * .5, .05, .15, .36, .26, .42, 0xfffcf4)
    puff(side * .34, .08, -.45, .4, .28, .33, 0xfffcf4)
  }
  rider.add(bunny)
  puff(0, .48, 0, .39, .46, .31, 0xfff3e2, bunny)
  puff(0, .47, .27, .24, .27, .08, 0xffffff, bunny)
  puff(0, 1.02, .04, .53, .47, .4, 0xfff3e2, bunny)
  for (const side of [-1, 1]) {
    const ear = new THREE.Group(); ear.position.set(side * .25, 1.32, .02); ear.rotation.z = side * -.15
    puff(0, .3, 0, .16, .47, .13, 0xfff3e2, ear)
    puff(0, .32, .105, .085, .32, .045, 0xf3a9bb, ear)
    bunny.add(ear); ears.push(ear)
    puff(side * .2, 1.07, .406, .064, .085, .035, 0x493746, bunny)
    puff(side * .2 - .015, 1.1, .436, .019, .025, .012, 0xffffff, bunny)
    puff(side * .34, .93, .36, .105, .06, .035, 0xf2afbd, bunny)
    puff(side * .25, .19, .3, .19, .14, .25, 0xfff3e2, bunny)
    const paw = puff(side * .4, .56, .12, .14, .24, .15, 0xfff3e2, bunny); paw.rotation.z = side * -.4
    const smile = torus(.06, .014, 0x6b4b50, bunny); smile.scale.set(1, .65, .35); smile.position.set(side * .055, .92, .438)
    // The upper half of each smile is nestled into the muzzle.
    puff(side * .055, .95, .436, .075, .045, .02, 0xfff3e2, bunny)
  }
  puff(0, .98, .452, .049, .035, .024, 0xcc7b8b, bunny)
  const scarf = torus(.28, .085, 0x76c7bb, bunny); scarf.rotation.x = Math.PI / 2; scarf.position.y = .72
  const scarfEnd = puff(.31, .51, -.06, .12, .26, .07, 0x76c7bb, bunny); scarfEnd.rotation.z = -.4
  puff(0, .38, -.32, .2, .2, .2, 0xffffff, bunny)
  rider.position.set(0, .5, 2); rider.scale.setScalar(.85); scene.add(rider)

  const gemGeo = new THREE.OctahedronGeometry(.42), obstacleGeo = new RoundedBoxGeometry(1.25, .85, 1.15, 2, .17)
  const obstacleColors = [0xc399d9, 0xee9c99, 0x8fc7cf]
  for (const item of initialSky.items) {
    const group = new THREE.Group()
    group.name = `sky-${item.kind}-${item.id}`
    if (item.kind === 'gem') {
      const gem = add(gemGeo, material(0xffc234), group); gem.scale.y = 1.3
      const glint = ball(.07, 0xfff8da, group); glint.position.set(-.12, .18, .28)
    } else {
      add(obstacleGeo, material(obstacleColors[Math.floor(item.id / 6) % obstacleColors.length]!), group)
      const badge = ball(.26, 0xffefd9, group); badge.scale.z = .12; badge.position.z = .58
      for (const side of [-1, 1]) {
        const eye = ball(.032, 0x614b68, group); eye.position.set(side * .085, .05, .617)
      }
      const smile = torus(.075, .017, 0x614b68, group); smile.scale.y = .6; smile.position.set(0, -.05, .616)
      const cover = block(.2, .08, .02, 0xffefd9, group); cover.position.set(0, -.015, .636)
    }
    group.visible = false; scene.add(group); items.set(item.id, { group, caughtAt: null, origin: new THREE.Vector3() })
  }

  // Reuse bounded pools for soft sparkles and expanding pickup halos.
  const particleGeo = new THREE.OctahedronGeometry(.085)
  const particles = Array.from({ length: 36 }, (_, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffd779 : 0xfff5d3, transparent: true, depthWrite: false })
    materials.add(mat)
    const mesh = add(particleGeo, mat); mesh.visible = false
    return { mesh, mat, life: 0, velocity: new THREE.Vector3() }
  })
  const haloGeo = new THREE.TorusGeometry(.43, .035, 6, 28)
  const halos = Array.from({ length: 3 }, () => {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffdf8b, transparent: true, depthWrite: false })
    materials.add(mat)
    const mesh = add(haloGeo, mat); mesh.visible = false
    return { mesh, mat, life: 0 }
  })
  let burst = 0, haloIndex = 0
  const catchPoint = new THREE.Vector3()
  const emit = (point: THREE.Vector3) => {
    const halo = halos[haloIndex++ % halos.length]!; halo.life = .5; halo.mesh.position.copy(point)
    for (let i = 0; i < 10; i++) {
      const p = particles[burst++ % particles.length]!
      p.life = .65; p.mesh.visible = true; p.mesh.position.copy(point)
      p.velocity.set(Math.sin(i * 2.4) * 1.3, .5 + Math.cos(i * 2.4) * .8, Math.sin(i * 1.1) * .45)
    }
  }
  let quietView = false
  const resize = (width: number, height: number, quiet: boolean) => {
    camera.aspect = width / Math.max(height, 1); quietView = quiet
    camera.position.set(0, quiet ? 11.5 : 4.9, quiet ? 10 : camera.aspect < 1 ? 10 : 8.5); camera.lookAt(0, quiet ? 0 : .3, quiet ? -5 : -13)
    camera.updateProjectionMatrix()
  }
  const update = (sky: SkyState, time: number, dt: number, quiet: boolean, pose: SkyPose) => {
    if (quietView !== quiet) resize(camera.aspect * 100, 100, quiet)
    rider.position.set(pose.x, pose.height, 2)
    rider.rotation.z = pose.lean
    bunny.rotation.x = quiet ? -.3 : 0
    bunny.scale.set(1 / Math.sqrt(pose.stretch), pose.stretch, 1 / Math.sqrt(pose.stretch))
    scarfEnd.rotation.z = quiet ? -.4 : -.4 + Math.sin(time * 4) * .06 - pose.lean * .6
    ears.forEach((ear, i) => {
      ear.rotation.z = (i ? -1 : 1) * .15 + (quiet ? 0 : Math.sin(time * 4 + i) * .035 - pose.lean * .45)
      ear.rotation.x = THREE.MathUtils.damp(ear.rotation.x, pose.earPitch, 14, dt)
    })
    catchPoint.copy(rider.position); catchPoint.y += .9; catchPoint.z += .15
    for (const item of sky.items) {
      const visual = items.get(item.id)!, m = visual.group
      const z = 2 + sky.distance - item.distance
      if (item.hit && item.kind === 'gem') {
        if (visual.caughtAt === null) {
          visual.caughtAt = time
          visual.origin.copy(m.position)
          if (!quiet) emit(catchPoint)
        }
        const progress = (time - visual.caughtAt) / .34
        m.visible = !quiet && progress < 1
        if (m.visible) {
          m.position.lerpVectors(visual.origin, catchPoint, smoothStep(progress))
          m.position.y += Math.sin(progress * Math.PI) * .35
          m.scale.setScalar((1 - smoothStep(progress)) * (1 + Math.sin(progress * Math.PI) * .25))
          m.rotation.y += dt * 5
        }
        continue
      }
      m.visible = !item.hit && z > -90 && z < 8
      if (!m.visible) continue
      m.position.set(item.lane * 2.25 + curve(z), item.kind === 'gem' ? 1.1 : .22, z)
      if (item.kind === 'gem') {
        m.rotation.y = quiet ? 0 : time * 1.5 + item.id
        if (!quiet) {
          m.position.y += Math.sin(time * 2.5 + item.id) * .09
          // The last stretch pulls a gem gently toward its collector, then the pickup completes above.
          const pull = item.lane === sky.lane ? smoothStep(1 - (item.distance - sky.distance) / 2.8) * .65 : 0
          if (item.distance >= sky.distance) m.position.lerp(catchPoint, pull)
        }
      }
    }
    arches.forEach((arch, i) => { const z = quiet ? -i * 29 - 20 : 6 - ((i * 29 + 145 - sky.distance % 145) % 145); arch.position.set(curve(z), .15, z) })
    islands.forEach(({ group, offset }) => { group.position.z = quiet ? 8 - offset : 16 - ((offset + 160 - sky.distance % 160) % 160) })
    clouds.forEach((cloud, i) => { cloud.position.y = 5 + i % 3 + (quiet ? 0 : Math.sin(time * .3 + i) * .22) })
    for (const p of particles) {
      p.life = quiet ? 0 : Math.max(0, p.life - dt)
      p.mesh.visible = p.life > 0
      if (!p.mesh.visible) continue
      p.mesh.position.addScaledVector(p.velocity, dt)
      p.velocity.multiplyScalar(Math.exp(-2.5 * dt)); p.velocity.y -= dt * .5
      const fade = smoothStep(p.life / .65)
      p.mesh.scale.setScalar(.35 + fade * .65); p.mat.opacity = fade
      p.mesh.rotation.y += dt * 1.5
    }
    for (const halo of halos) {
      halo.life = quiet ? 0 : Math.max(0, halo.life - dt)
      halo.mesh.visible = halo.life > 0
      if (!halo.mesh.visible) continue
      const progress = 1 - halo.life / .5
      halo.mesh.scale.setScalar(1 + smoothStep(progress) * 1.8)
      halo.mat.opacity = (1 - smoothStep(progress)) * .6
    }
  }
  const dispose = () => { geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); scene.clear() }
  return { scene, camera, resize, update, dispose }
}
