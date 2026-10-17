/**
 * Anonymous, on-device engagement counters.
 *
 * Nothing here leaves the device and nothing identifies a person: only counts
 * and durations per activity, kept in localStorage.
 */

export type GameId =
  | 'planetpost'
  | 'colors'
  | 'pebbles'
  | 'robot'
  | 'bubbles'
  | 'sky'
  | 'postcards'
  | 'matching'
  | 'garden'
  | 'music'
  | 'stickers'

type GameStats = { starts: number; seconds: number; finishes: number }

type PilotStats = {
  version: 1
  sessions: number
  switches: number
  games: Partial<Record<GameId, GameStats>>
}

const KEY = 'mvp.pilot.v1'

const empty: PilotStats = { version: 1, sessions: 0, switches: 0, games: {} }

function read(): PilotStats {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...empty, games: {} }
    const parsed = JSON.parse(raw) as PilotStats
    if (parsed?.version !== 1) return { ...empty, games: {} }
    const count = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
    const games: PilotStats['games'] = {}
    const ids: GameId[] = ['planetpost','colors','pebbles','robot','bubbles','sky','matching','postcards','garden','music','stickers']
    for (const id of ids) {
      const game = parsed.games?.[id]
      if (game && typeof game === 'object') games[id] = { starts: count(game.starts), seconds: count(game.seconds), finishes: count(game.finishes) }
    }
    return { version: 1, sessions: count(parsed.sessions), switches: count(parsed.switches), games }
  } catch {
    return { ...empty, games: {} }
  }
}

function write(stats: PilotStats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats))
  } catch {
    // Private browsing or a full quota: play continues without measurement.
  }
}

function forGame(stats: PilotStats, id: GameId): GameStats {
  return stats.games[id] ?? { starts: 0, seconds: 0, finishes: 0 }
}

export function recordSession() {
  const stats = read()
  write({ ...stats, sessions: stats.sessions + 1 })
}

export function recordStart(id: GameId) {
  const stats = read()
  const game = forGame(stats, id)
  write({
    ...stats,
    switches: stats.switches + 1,
    games: { ...stats.games, [id]: { ...game, starts: game.starts + 1 } },
  })
}

export function recordTime(id: GameId, seconds: number) {
  if (seconds < 1) return
  const stats = read()
  const game = forGame(stats, id)
  write({
    ...stats,
    games: {
      ...stats.games,
      [id]: { ...game, seconds: game.seconds + Math.round(seconds) },
    },
  })
}

export function recordFinish(id: GameId) {
  const stats = read()
  const game = forGame(stats, id)
  write({
    ...stats,
    games: { ...stats.games, [id]: { ...game, finishes: game.finishes + 1 } },
  })
}
