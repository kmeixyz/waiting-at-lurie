import { Icon } from './Icons'

export function RoundPace({ relaxed, onChange, minutes }: { relaxed: boolean; onChange: (value: boolean) => void; minutes: number }) {
  return <fieldset className="matching-level">
    <legend>Timer</legend>
    <div>
      <button aria-pressed={relaxed} onClick={() => onChange(true)}>
        <Icon name="leaf"/><span><strong>No timer</strong></span>{relaxed && <Icon name="check" size={18}/>}
      </button>
      <button aria-pressed={!relaxed} onClick={() => onChange(false)}>
        <Icon name="clock"/><span><strong>{minutes} min timer</strong></span>{!relaxed && <Icon name="check" size={18}/>}
      </button>
    </div>
  </fieldset>
}
