export type LightDirection = 0 | 1 | 2 | 3 // north, east, south, west
export type Mirror = '/' | '\\'
export type LightPuzzle = {
  name: string
  size: number
  source: number
  direction: LightDirection
  receiver: number
  mirrors: readonly number[]
  initial: readonly Mirror[]
  solution: readonly Mirror[]
  targets: readonly number[]
  walls: readonly number[]
}

export const lightPuzzles: readonly LightPuzzle[] = [
  { name: 'First glow', size: 5, source: 20, direction: 1, receiver: 5, mirrors: [22, 7], initial: ['\\', '/'], solution: ['/', '\\'], targets: [21, 17, 6], walls: [10, 11, 13, 18] },
  { name: 'Corner circuit', size: 5, source: 10, direction: 1, receiver: 0, mirrors: [12, 22, 24, 4], initial: ['/', '/', '\\', '/'], solution: ['\\', '\\', '/', '\\'], targets: [11, 23, 14], walls: [6, 8, 16, 18] },
  { name: 'Starlight trail', size: 5, source: 0, direction: 1, receiver: 16, mirrors: [4, 24, 20, 5, 8, 18], initial: ['/', '\\', '/', '\\', '/', '\\'], solution: ['\\', '/', '\\', '/', '\\', '/'], targets: [2, 22, 17], walls: [11, 12] },
]

export function reflectLight(direction: LightDirection, mirror: Mirror): LightDirection {
  return (mirror === '/' ? [1, 0, 3, 2] : [3, 2, 1, 0])[direction] as LightDirection
}

export function turnMirror(board: readonly Mirror[], index: number): readonly Mirror[] {
  if (index < 0 || index >= board.length) return board
  return board.map((mirror, at) => at === index ? mirror === '/' ? '\\' : '/' : mirror)
}

export type LightTrace = {
  cells: number[]
  points: [number, number][]
  lit: number[]
  stop: 'edge' | 'wall' | 'source' | 'loop' | 'receiver'
  solved: boolean
}

/** Trace in cell units so the SVG and the responsive board share one coordinate system. */
export function traceLight(board: readonly Mirror[], puzzle: LightPuzzle): LightTrace {
  const cells: number[] = [], points: [number, number][] = [], lit: number[] = []
  const seen = new Set<string>()
  let at = puzzle.source, direction = puzzle.direction
  const result = (stop: LightTrace['stop']): LightTrace => ({ cells, points, lit, stop, solved: stop === 'receiver' && lit.length === puzzle.targets.length })
  while (true) {
    const x = at % puzzle.size + .5, y = Math.floor(at / puzzle.size) + .5
    cells.push(at); points.push([x, y])
    if (puzzle.walls.includes(at)) return result('wall')
    if (puzzle.targets.includes(at) && !lit.includes(at)) lit.push(at)
    if (at === puzzle.receiver) return result('receiver')
    if (at === puzzle.source && cells.length > 1) return result('source')
    const key = `${at}:${direction}`
    if (seen.has(key)) return result('loop')
    seen.add(key)
    const mirror = puzzle.mirrors.indexOf(at)
    if (mirror !== -1) direction = reflectLight(direction, board[mirror]!)
    const [dx, dy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][direction]!
    const nextX = x + dx, nextY = y + dy
    if (nextX < 0 || nextX >= puzzle.size || nextY < 0 || nextY >= puzzle.size) {
      points.push([x + dx * .5, y + dy * .5])
      return result('edge')
    }
    at = Math.floor(nextY) * puzzle.size + Math.floor(nextX)
  }
}

/** At most 64 arrangements: choose a valid solution with the fewest remaining turns. */
export function lightHint(board: readonly Mirror[], puzzle: LightPuzzle): number | null {
  let nearest: number[] | null = null
  for (let mask = 0; mask < 2 ** puzzle.mirrors.length; mask++) {
    const candidate: Mirror[] = puzzle.mirrors.map((_, index) => mask & (1 << index) ? '/' : '\\')
    const changed = candidate.flatMap((mirror, index) => mirror === board[index] ? [] : [index])
    if ((!nearest || changed.length < nearest.length) && traceLight(candidate, puzzle).solved) nearest = changed
  }
  return nearest?.[0] ?? null
}
