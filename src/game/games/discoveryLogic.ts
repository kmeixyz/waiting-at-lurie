export type Drops = [number, number, number]
export const pigments = [
  { name: 'Rose', color: '#da6475', symbol: '●' },
  { name: 'Yellow', color: '#eac352', symbol: '◆' },
  { name: 'Blue', color: '#619bd4', symbol: '▲' },
] as const
export const colorRecipes: { name: string; color: string; drops: Drops }[] = [
  { name: 'Apricot', color: '#edaa70', drops: [1, 1, 0] },
  { name: 'Meadow', color: '#87b891', drops: [0, 1, 1] },
  { name: 'Wisteria', color: '#b298d0', drops: [1, 0, 1] },
  { name: 'Coral', color: '#e98983', drops: [2, 1, 0] },
  { name: 'Lime', color: '#b5c971', drops: [0, 2, 1] },
  { name: 'Iris', color: '#8e9cce', drops: [1, 0, 2] },
]
export function sameMix(a: Drops, b: Drops) {
  const totalA = a.reduce((sum, count) => sum + count, 0)
  const totalB = b.reduce((sum, count) => sum + count, 0)
  if (!totalA || !totalB) return totalA === totalB
  return a.every((value, i) => value * totalB === b[i]! * totalA)
}
/** Illustrative paint palette: labels and drop counts are the source of truth. */
export function mixColor(drops: Drops): string {
  const recipe = colorRecipes.find(recipe => sameMix(drops, recipe.drops))
  if (recipe) return recipe.color
  const total = drops.reduce((sum, count) => sum + count, 0)
  if (!total) return '#f4f1ec'
  const rgb = pigments.map(pigment => pigment.color.slice(1).match(/../g)!.map(channel => parseInt(channel, 16)))
  return `rgb(${[0, 1, 2].map(channel => Math.round(drops.reduce((sum, count, i) => sum + count * rgb[i]![channel]!, 0) / total)).join(',')})`
}

export type Pebble = 0 | 1 | 2
export type Jars = Pebble[][]
export const pebbleKinds = [
  { name: 'Rose circles', color: '#d9868f', symbol: '●' },
  { name: 'Blue diamonds', color: '#779fc4', symbol: '◆' },
  { name: 'Green triangles', color: '#8aaa83', symbol: '▲' },
] as const
const jarCapacity = 3
export const sortPuzzles: { name: string; jars: Jars }[] = [
  // Two shapes, three moves: learn the rule before the real puzzles.
  { name: 'Puzzle 1', jars: [[0, 0, 1], [1, 1, 0], []] },
  { name: 'Puzzle 2', jars: [[0, 0, 1], [1, 1, 2], [2, 2, 0], []] },
  { name: 'Puzzle 3', jars: [[0, 1, 2], [1, 2, 0], [2, 0, 1], []] },
  { name: 'Puzzle 4', jars: [[0, 2, 1], [1, 0, 2], [2, 1, 0], []] },
]
export function sortedJars(jars: Jars) {
  return jars.every(jar => jar.length === 0 || (jar.length === jarCapacity && jar.every(pebble => pebble === jar[0])))
}
export function movePebble(jars: Jars, from: number, to: number): Jars | null {
  const source = jars[from], target = jars[to]
  if (!source || !target || from === to || !source.length || target.length >= jarCapacity) return null
  const pebble = source[source.length - 1]!
  if (target.length && target[target.length - 1] !== pebble) return null
  return jars.map((jar, index) => index === from ? jar.slice(0, -1) : index === to ? [...jar, pebble] : [...jar])
}
/** Small breadth-first search finds a shortest route from the current arrangement. */
export function sortHint(jars: Jars): [number, number] | null {
  const key = (state: Jars) => state.map(jar => jar.join('')).join('|')
  const queue: { jars: Jars; first: [number, number] | null }[] = [{ jars, first: null }]
  const seen = new Set([key(jars)])
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const current = queue[cursor]!
    if (sortedJars(current.jars)) return current.first
    for (let from = 0; from < jars.length; from++) {
      for (let to = 0; to < jars.length; to++) {
        const next = movePebble(current.jars, from, to)
        if (!next || seen.has(key(next))) continue
        seen.add(key(next))
        queue.push({ jars: next, first: current.first ?? [from, to] })
      }
    }
  }
  return null
}

/** 0 to 1: how close a mix's proportions are to a recipe's. */
export function mixCloseness(drops: Drops, recipe: Drops) {
  const total = drops.reduce((sum, count) => sum + count, 0)
  const target = recipe.reduce((sum, count) => sum + count, 0)
  if (!total || !target) return 0
  return 1 - drops.reduce((sum, count, i) => sum + Math.abs(count / total - recipe[i]! / target), 0) / 2
}
