import { useEffect, useRef, useState } from 'react'
import { Icon } from '../Icons'
import { useGame } from '../useGame'
import { play } from '../sound'
import { FlowerArt, flowerKinds, GardenArt, type Plant, type FlowerKind } from './gardenArt'

export function PocketGarden() {
  const { paused, finish, report } = useGame()
  const [plants, setPlants] = useState<Plant[]>([])
  const [pot, setPot] = useState(0)
  const [step, setStep] = useState(0)
  const [feedback, setFeedback] = useState('Pick a flower to plant.')
  const [effect, setEffect] = useState<{ kind: 'water' | 'sun'; id: number } | null>(null)
  const actionRef = useRef<HTMLButtonElement>(null)
  const choiceRef = useRef<HTMLButtonElement>(null)
  const keyboardAction = useRef(false)
  const pending = useRef(false)

  useEffect(() => {
    pending.current = false
    if (keyboardAction.current) {
      keyboardAction.current = false
      ;(step === 0 ? choiceRef.current : actionRef.current)?.focus({ preventScroll: true })
    }
  }, [step, pot])

  const grow = (keyboard: boolean, flower?: FlowerKind) => {
    if (paused || pending.current) return
    pending.current = true
    keyboardAction.current = keyboard
    if (step === 3) {
      if (pot === 2) { finish('Your garden!', <GardenArt plants={plants}/>); return }
      play('tap'); setPot(pot + 1); setStep(0); setFeedback('Pick the next flower.')
      return
    }
    if (step === 1 || step === 2) {
      const kind = step === 1 ? 'water' : 'sun'
      setEffect({ kind, id: Date.now() })
      window.setTimeout(() => setEffect(current => current?.kind === kind ? null : current), 900)
    }
    play(step === 2 ? 'good' : step === 1 ? 'pop' : 'tap')
    const next = [...plants]
    next[pot] = { flower: flower ?? plants[pot]!.flower, stage: step + 1 }
    setPlants(next); setStep(step + 1)
    setFeedback(step === 0 ? 'Tap the pot to water your seed.' : step === 1 ? 'Now tap the sun!' : 'Your flower grew!')
    if (step === 2) { report(`${pot + 1} of 3 flowers grown`); }
  }

  return <div className="garden-game">
    <div className="mini-game-heading"><div><h2>{['Choose a flower', 'Water your seed', 'Add sunshine', pot === 2 ? 'Your garden is ready!' : 'Your flower is ready!'][step]}</h2></div><span className="mini-game-count"><Icon name="leaf"/>{pot + Number(step === 3)} / 3</span></div>
    <ol className="garden-steps" aria-label={`Pot ${pot + 1} growing steps`}>{['Plant', 'Water', 'Sunshine', 'Bloom'].map((label, i) => <li key={label} aria-current={i === step ? 'step' : undefined} className={i < step ? 'complete' : ''}><span aria-hidden="true">{i < step ? <Icon name="check" size={16}/> : i + 1}</span>{label}</li>)}</ol>
    <div className={`garden-stage ${effect ? `garden-${effect.kind}` : ''}`}>
      <GardenArt plants={plants} active={pot}/>
      {step === 1 && <button className="garden-spot" data-coach style={{ left: `${(48 + pot * 162) / 5.4}%`, top: '50%', width: '22%', height: '45%' }} onClick={event => grow(event.detail === 0)} aria-label="Water the seed in the pot"><span className="garden-drops" aria-hidden="true"><Icon name="water" weight="fill" size={22}/><Icon name="water" weight="fill" size={18}/><Icon name="water" weight="fill" size={22}/></span></button>}
      {step === 2 && <button className="garden-spot garden-sun-spot" data-coach style={{ left: '74%', top: '2%', width: '19%', height: '34%' }} onClick={event => grow(event.detail === 0)} aria-label="Shine the sun"/>}
      {effect && <span key={effect.id} className={`garden-effect garden-effect-${effect.kind}`} style={{ left: `${(108 + pot * 162) / 5.4}%` }} aria-hidden="true">{effect.kind === 'water' ? <><Icon name="water" weight="fill" size={20}/><Icon name="water" weight="fill" size={16}/><Icon name="water" weight="fill" size={20}/></> : <Icon name="sun" weight="fill" size={40}/>}</span>}
    </div>
    <p className="mini-game-feedback" role="status">{feedback}</p>
    {step === 0 ? <div className="picture-choices" role="group" aria-label="Choose your flower">{flowerKinds.map((flower, i) => <button key={flower} ref={i === 0 ? choiceRef : undefined} data-coach={i === 0 || undefined} onClick={event => grow(event.detail === 0, flower)}><FlowerArt flower={flower}/><span>{flower}</span></button>)}</div>
      : <div className="garden-actions"><button key={step} ref={actionRef} className="primary-button" data-coach={step === 3 || undefined} onClick={event => grow(event.detail === 0)}><Icon name={step === 1 ? 'water' : step === 2 ? 'sun' : pot === 2 ? 'check' : 'right'} size={28}/>{step === 1 ? 'Water my seed' : step === 2 ? 'Add sunshine' : pot === 2 ? 'All done' : 'Next flower'}</button></div>}
  </div>
}
