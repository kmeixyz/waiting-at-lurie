import { useEffect, useRef, useState } from 'react'
import { Icon } from '../Icons'
import { shuffle } from '../logic'
import { useGame, useGameDelay } from '../useGame'
import { play } from '../sound'
import { colorRecipes, mixCloseness, mixColor, pigments, sameMix, type Drops } from './discoveryLogic'

export function ColorLab() {
  const { paused, finish, report } = useGame()
  const [round, setRound] = useState(0)
  const [collection, setCollection] = useState<number[]>([])
  const [history, setHistory] = useState<Drops[]>([[0, 0, 0]])
  // Three different colors each round, in a fresh order.
  const [targets] = useState(() => shuffle(colorRecipes.map((_, index) => index)).slice(0, 3))
  const firstPigment = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (round > 0) firstPigment.current?.focus({ preventScroll: true })
  }, [round])
  const drops = history[history.length - 1]!
  const targetIndex = targets[round]!
  const target = colorRecipes[targetIndex]!
  const matched = sameMix(drops, target.drops)
  const total = drops.reduce((a, b) => a + b, 0)
  const closeness = matched ? 1 : mixCloseness(drops, target.drops)
  // Point at a paint the recipe still needs; once a mix overshoots, point at Undo.
  const overshot = drops.some((count, i) => count > target.drops[i]!)
  const nextPaint = overshot ? -1 : drops.findIndex((count, i) => count < target.drops[i]!)
  // The recipe is always in view as paint dots, so a child copies rather than guesses.
  const recipeWords = target.drops.map((count, index) => count ? `${count} ${pigments[index]!.name.toLowerCase()}` : null).filter(Boolean).join(' and ')
  const add = (index: number) => {
    if (paused || total >= 6 || matched) return
    const next: Drops = [...drops]
    next[index]++
    play(sameMix(next, target.drops) ? 'good' : 'tap')
    setHistory([...history, next])
  }
  const save = () => {
    if (paused || !matched) return
    const next = [...collection, targetIndex]
    setCollection(next)
    report(`${next.length} of 3 colors discovered`)
    if (next.length === 3) {
      finish('Your colors!', <div className="color-collection">{next.map(index => <div key={index}><span style={{ background: colorRecipes[index]!.color }}/><strong>{colorRecipes[index]!.name}</strong></div>)}</div>)
    } else {
      setRound(round + 1); setHistory([[0, 0, 0]])
    }
  }
  // A match saves itself after a moment to enjoy it.
  useGameDelay(save, matched ? 1200 : null, `${round}:${history.length}`)
  return <div className="discovery-game color-game">
    <div className="mini-game-heading"><div><h2>Mix {target.name.toLowerCase()}</h2></div><span className="mini-game-count">{collection.length} / 3</span></div>
    <p className="discovery-instruction">Tap the paints shown under the color.</p>
    <div className="mix-workbench">
      <div className="mix-sample"><span className="mix-disc" style={{ background: target.color }}/><strong>{target.name}</strong><span className="mix-recipe-dots" role="img" aria-label={`Recipe: ${recipeWords}`}>{target.drops.flatMap((count, index) => Array.from({ length: count }, (_, drop) => <span key={`${index}-${drop}`} className={drop < drops[index]! ? 'is-added' : ''} style={{ background: pigments[index]!.color }}>{pigments[index]!.symbol}</span>))}</span></div>
      <span className="mix-equals" aria-hidden="true">=</span>
      <div className="mix-sample"><span className="mix-disc your-mix" style={{ background: mixColor(drops) }}><span aria-hidden="true">{total ? drops.flatMap((count, index) => Array.from({length:count}, () => pigments[index]!.symbol)).join(' ') : '+'}</span></span><strong>Your mix</strong><span>{total} {total === 1 ? 'drop' : 'drops'} added</span></div>
    </div>
    <div className={`mix-meter ${matched ? 'is-matched' : ''}`} role="meter" aria-label="How close your mix is" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(closeness * 100)}><span style={{ width: `${total ? Math.max(4, closeness * 100) : 0}%` }}/><strong>{matched ? 'It’s a match!' : !total ? 'Add some paint' : closeness >= .8 ? 'So close!' : closeness >= .5 ? 'Getting closer' : 'Keep mixing'}</strong></div>
    <div className="pigment-tray" role="group" aria-label="Add paint drops">{pigments.map((pigment, index) => <button ref={index === 0 ? firstPigment : undefined} key={pigment.name} data-coach={index === nextPaint || undefined} disabled={total >= 6 || paused || matched} onClick={() => add(index)} aria-label={`Add ${pigment.name.toLowerCase()} drop`}><span className="pigment-dot" style={{background:pigment.color}} aria-hidden="true">{pigment.symbol}</span><strong>{pigment.name}</strong><span>{drops[index]} added</span></button>)}</div>
    <p className="discovery-feedback" role="status">{matched ? `You made ${target.name.toLowerCase()}! Saving it…` : total >= 6 ? 'The dish is full. Tap Undo.' : total ? `${drops[0]} rose, ${drops[1]} yellow, ${drops[2]} blue.` : 'Tap a paint to add a drop.'}</p>
    <div className="discovery-actions"><button className="secondary-button" data-coach={overshot || undefined} disabled={history.length < 2 || paused || matched} onClick={() => setHistory(history.slice(0,-1))}><Icon name="restart" size={18}/> Undo</button><button className="text-button" disabled={!total || paused} onClick={() => setHistory([[0,0,0]])}>Clear mix</button></div>
  </div>
}
