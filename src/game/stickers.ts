import type { GameId } from './analytics'

/** Finishing a game earns its sticker. Counts stay on this device only. */
export type StickerBook = Partial<Record<GameId, number>>
const KEY = 'waiting-at-lurie.stickers.v1'

export function readStickers(): StickerBook {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
    if (!saved || typeof saved !== 'object') return {}
    return Object.fromEntries(Object.entries(saved).filter(([, count]) => typeof count === 'number' && count > 0)) as StickerBook
  } catch { return {} }
}

export function awardSticker(id: GameId): StickerBook {
  const book = readStickers()
  const next = { ...book, [id]: (book[id] ?? 0) + 1 }
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* Play continues without the book. */ }
  return next
}
