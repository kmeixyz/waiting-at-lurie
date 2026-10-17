import { useEffect, useRef, useState } from 'react'
import { CreatureIcon, type CreatureKind } from '../creatures'
import { Icon } from '../Icons'
import { play, playNote } from '../sound'
import { useGame } from '../useGame'

/** One octave of C major, low to high, each sung by a friend. */
const pads: { note: string; frequency: number; friend: CreatureKind; color: string }[] = [
  { note: 'C', frequency: 261.63, friend: 'bear', color: '#f3b5b5' },
  { note: 'D', frequency: 293.66, friend: 'bunny', color: '#f6cf9c' },
  { note: 'E', frequency: 329.63, friend: 'duck', color: '#f3e39a' },
  { note: 'F', frequency: 349.23, friend: 'dino', color: '#bfe3b0' },
  { note: 'G', frequency: 392.0, friend: 'fish', color: '#a9dcd8' },
  { note: 'A', frequency: 440.0, friend: 'cat', color: '#b4cdf2' },
  { note: 'B', frequency: 493.88, friend: 'owl', color: '#cdb9ef' },
  { note: 'high C', frequency: 523.25, friend: 'star', color: '#f2bddb' },
]

// Traditional melodies, written as pad numbers.
const songs = [
  { name: 'Twinkle star', notes: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0] },
  { name: 'Little lamb', notes: [2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 2, 4, 4] },
]

export function MusicCover() {
  return <div className="music-cover" aria-hidden="true">{pads.map(pad => <span key={pad.note} style={{ background: pad.color }}><CreatureIcon kind={pad.friend} size={34}/></span>)}<Icon name="note" size={30} weight="fill"/></div>
}

export function MusicPad() {
  const { paused, sound, finish, report } = useGame()
  const [song, setSong] = useState<number | null>(null)
  const [position, setPosition] = useState(0)
  // The song's place, read at tap time so quick repeated taps each count.
  const place = useRef(0)
  const [hits, setHits] = useState<number[]>(Array(pads.length).fill(0))
  const [played, setPlayed] = useState(0)
  const [songsDone, setSongsDone] = useState(0)
  const doneRef = useRef<HTMLButtonElement>(null)
  const melody = song === null ? null : songs[song]!.notes
  const finishedSong = melody !== null && position >= melody.length
  const glowing = melody && !finishedSong ? melody[position]! : -1

  useEffect(() => { report(`${played} ${played === 1 ? 'note' : 'notes'} played${songsDone ? ` · ${songsDone} ${songsDone === 1 ? 'song' : 'songs'}` : ''}`) }, [played, songsDone, report])
  useEffect(() => { if (finishedSong) doneRef.current?.focus({ preventScroll: true }) }, [finishedSong])

  function tap(index: number) {
    if (paused) return
    playNote(pads[index]!.frequency)
    setHits(previous => previous.map((count, i) => i === index ? count + 1 : count))
    setPlayed(count => count + 1)
    // Any pad still sings; only the glowing one moves the song along.
    if (melody && place.current < melody.length && melody[place.current] === index) {
      place.current++
      setPosition(place.current)
      if (place.current >= melody.length) { setSongsDone(count => count + 1); window.setTimeout(() => play('win'), 450) }
    }
  }
  const restart = () => { place.current = 0; setPosition(0) }
  const choose = (index: number | null) => { setSong(index); restart() }

  return <div className="music-game">
    <div className="mini-game-heading"><div><h2>{finishedSong ? 'You played a song!' : melody ? 'Tap the glowing friend' : 'Tap a friend to sing'}</h2></div><span className="mini-game-count"><Icon name="note" weight="fill"/>{played}</span></div>
    {!sound && <p className="music-muted"><Icon name="mute"/> Sounds are off. Turn on Sounds in Settings to hear the music.</p>}
    <div className="puzzle-picker music-modes" role="group" aria-label="How to play">
      <button aria-pressed={song === null} onClick={() => choose(null)}>Free play</button>
      {songs.map((entry, index) => <button key={entry.name} data-coach={(song === null && played > 0 && index === 0) || undefined} aria-pressed={song === index} onClick={() => choose(index)}><Icon name="star" size={15} weight="fill"/> {entry.name}</button>)}
    </div>
    {melody && <div className="music-progress" role="progressbar" aria-label={`${songs[song!]!.name} progress`} aria-valuemin={0} aria-valuemax={melody.length} aria-valuenow={Math.min(position, melody.length)}><span style={{ width: `${Math.min(position, melody.length) / melody.length * 100}%` }}/></div>}
    <div className="music-pads" role="group" aria-label="Music pads">
      {pads.map((pad, index) => <button key={pad.note} className={`music-pad ${index === glowing ? 'is-next' : ''}`} style={{ background: pad.color }} data-coach={index === glowing || (glowing < 0 && !finishedSong && played === 0 && index === 0) || undefined} onClick={() => tap(index)} aria-label={`${pad.note}, sung by ${pad.friend}${index === glowing ? ', next note' : ''}`}>
        <span className="music-friend" key={hits[index]} aria-hidden="true"><CreatureIcon kind={pad.friend} size={56}/></span>
        <span className="music-note-label" aria-hidden="true">{pad.note === 'high C' ? 'C' : pad.note}</span>
      </button>)}
    </div>
    <p className="sr-only" role="status">{finishedSong ? `You played ${songs[song!]!.name}!` : melody ? `Next: ${pads[glowing]!.note}.` : ''}</p>
    <div className="garden-actions music-actions">
      {finishedSong && <button className="secondary-button" onClick={restart}><Icon name="restart"/> Play it again</button>}
      <button ref={doneRef} className={finishedSong ? 'primary-button' : 'secondary-button'} data-coach={finishedSong || undefined} onClick={() => { if (!paused) finish(songsDone ? 'What a concert!' : 'What a song!') }}><Icon name="check"/> All done</button>
    </div>
  </div>
}
