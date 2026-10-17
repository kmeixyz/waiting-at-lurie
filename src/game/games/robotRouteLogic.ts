import type { Direction } from '../logic'

export const ROBOT_COMMAND_LIMIT = 20
const robotBoards = [
  ['..*.D', '.##..', '.*...', '.#.#.', 'S..*.'],
  ['.*..D', '.#.#.', '...*.', '.##..', 'S.*..'],
  ['..*.D', '.#...', '.*.#.', '...#.', 'S..*.'],
] as const

type RobotBoard = { size: number; walls: number[]; stars: number[]; start: number; dock: number }
export type RobotPosition = { at: number; collected: number }
const robotDirections: Direction[] = ['up', 'right', 'down', 'left']

export function makeRobotBoard(index = Math.floor(Math.random() * robotBoards.length)): RobotBoard {
  const rows = robotBoards[index % robotBoards.length]!
  const tiles = rows.join('').split('')
  return { size: rows.length, walls: tiles.flatMap((tile, i) => tile === '#' ? [i] : []), stars: tiles.flatMap((tile, i) => tile === '*' ? [i] : []), start: tiles.indexOf('S'), dock: tiles.indexOf('D') }
}

export function robotStep(board: RobotBoard, state: RobotPosition, direction: Direction): RobotPosition | null {
  const x = state.at % board.size, y = Math.floor(state.at / board.size)
  const dx = direction === 'right' ? 1 : direction === 'left' ? -1 : 0
  const dy = direction === 'down' ? 1 : direction === 'up' ? -1 : 0
  if (x + dx < 0 || x + dx >= board.size || y + dy < 0 || y + dy >= board.size) return null
  const at = state.at + dx + dy * board.size
  if (board.walls.includes(at)) return null
  const star = board.stars.indexOf(at)
  return { at, collected: star < 0 ? state.collected : state.collected | (1 << star) }
}

export function robotWon(board: RobotBoard, state: RobotPosition) {
  return state.at === board.dock && state.collected === (1 << board.stars.length) - 1
}

/** Breadth-first search includes the collected stars, so hints never strand a missing star. */
export function robotSolution(board: RobotBoard, from: RobotPosition = { at: board.start, collected: 0 }): Direction[] | null {
  const queue = [{ state: from, path: [] as Direction[] }]
  const seen = new Set([`${from.at}:${from.collected}`])
  for (let i = 0; i < queue.length; i++) {
    const { state, path } = queue[i]!
    if (robotWon(board, state)) return path
    for (const direction of robotDirections) {
      const next = robotStep(board, state, direction)
      if (!next) continue
      const key = `${next.at}:${next.collected}`
      if (seen.has(key)) continue
      seen.add(key)
      queue.push({ state: next, path: [...path, direction] })
    }
  }
  return null
}

/** Keep the longest usable prefix that can still finish within the command budget. */
export function robotHint(board: RobotBoard, program: Direction[]): { program: Direction[]; repaired: boolean } {
  const states: RobotPosition[] = [{ at: board.start, collected: 0 }]
  for (const direction of program) {
    const next = robotStep(board, states.at(-1)!, direction)
    if (!next) break
    states.push(next)
    if (robotWon(board, next)) break
  }
  for (let length = states.length - 1; length >= 0; length--) {
    const solution = robotSolution(board, states[length]!)
    if (solution && length + solution.length <= ROBOT_COMMAND_LIMIT) {
      return { program: [...program.slice(0, length), ...solution.slice(0, 1)], repaired: length < program.length }
    }
  }
  return { program: [], repaired: true }
}
