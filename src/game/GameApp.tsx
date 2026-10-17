import { useEffect, useRef, useState } from 'react'
import { shelf, type GameEntry } from './gameList'
import { Icon } from './Icons'
import { recordSession } from './analytics'
import { GameSession, type SessionStatus } from './GameSession'
import { WaitingAtLurieHelp } from './WaitingAtLurieHelp'
import { StickerBook } from './StickerBook'
import { BubbleArt } from './BubbleArt'
import { ComfortSettings, readComfort, saveComfort, type ComfortPreferences } from './ComfortSettings'
import { ColorLabArt, PebbleArt } from './games/DiscoveryArt'
import { GardenArt } from './games/gardenArt'
import { PostcardArt } from './games/postcardArt'
import { PlanetPostCover } from './games/PlanetPost'
import { LightLabCover } from './games/LightArt'
import { MusicCover } from './games/MusicPad'
import { MatchCover } from './games/Matching'
import { StickerCover } from './games/StickerScene'
import { RobotCover } from './games/RobotArt'
import { SkyCover } from './games/SkyArt'
import { WavingBear } from './creatures'
import { setSoundEnabled } from './sound'
import { readStickers } from './stickers'
function GameCover({ game }: { game: GameEntry }) {
  if (game.id === 'lightlab') return <LightLabCover crop/>
  if (game.id === 'planetpost') return <PlanetPostCover/>
  if (game.id === 'colors') return <ColorLabArt/>
  if (game.id === 'pebbles') return <PebbleArt/>
  if (game.id === 'bubbles') return <BubbleArt/>
  if (game.id === 'robot') return <RobotCover crop/>
  if (game.id === 'sky') return <SkyCover crop/>
  if (game.id === 'matching') return <MatchCover/>
  if (game.id === 'garden') return <GardenArt crop/>
  if (game.id === 'music') return <MusicCover/>
  if (game.id === 'stickers') return <StickerCover/>
  return <PostcardArt decorative crop/>
}

const shelves = [
  { id: 'little', title: 'For little kids' },
  { id: 'big', title: 'For big kids' },
]

export function GameApp() {
  const [active, setActive] = useState<GameEntry | null>(null)
  const [inGame, setInGame] = useState(false)
  const [sessionId, setSessionId] = useState(0)
  const [quickStart, setQuickStart] = useState(false)
  const [resumeRequest, setResumeRequest] = useState(0)
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('ready')
  const [deviceQuiet, setDeviceQuiet] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [preferences, setPreferences] = useState(readComfort)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [away, setAway] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)
  const [stickers, setStickers] = useState(readStickers)
  const quiet = deviceQuiet || preferences.calm
  const counted = useRef(false)
  const launchControl = useRef<string | null>(null)
  const libraryScroll = useRef(0)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setDeviceQuiet(preference.matches)
    preference.addEventListener('change', sync)
    return () => preference.removeEventListener('change', sync)
  }, [])
  useEffect(() => { if (!counted.current) { recordSession(); counted.current = true } }, [])
  useEffect(() => { setSoundEnabled(preferences.sound) }, [preferences.sound])
  // A finished game awards its sticker; refresh so the top bubble shows it at once.
  useEffect(() => { setStickers(readStickers()) }, [inGame, sessionStatus])
  const earned = shelf.filter(game => stickers[game.id])
  const stickerTotal = earned.reduce((sum, game) => sum + stickers[game.id]!, 0)
  useEffect(() => {
    document.documentElement.dataset.quiet = String(quiet)
    return () => { delete document.documentElement.dataset.quiet }
  }, [quiet])
  useEffect(() => {
    document.documentElement.dataset.largeText = String(preferences.largeText)
    return () => { delete document.documentElement.dataset.largeText }
  }, [preferences.largeText])
  useEffect(() => {
    document.documentElement.dataset.solid = String(preferences.solid)
    return () => { delete document.documentElement.dataset.solid }
  }, [preferences.solid])
  useEffect(() => {
    if (inGame) return
    const control = !away && launchControl.current ? (document.getElementById(launchControl.current) || document.getElementById('continue-game')) : null
    ;(control || mainRef.current)?.focus({ preventScroll: true })
    window.scrollTo(0, away ? 0 : libraryScroll.current)
  }, [inGame, away])

  // Phone Back (Android's button, iOS's edge swipe) returns to the shelf, with the
  // game paused, instead of leaving the site. A game adds one history entry.
  useEffect(() => {
    if (!inGame) return
    if (history.state?.waitingAtLurieGame !== true) history.pushState({ waitingAtLurieGame: true }, '')
    const back = () => setInGame(false)
    window.addEventListener('popstate', back)
    return () => window.removeEventListener('popstate', back)
  }, [inGame])
  useEffect(() => { history.scrollRestoration = 'manual' }, [])
  const dropGameEntry = () => { if (history.state?.waitingAtLurieGame === true) history.back() }
  const shelfView = () => { if (history.state?.waitingAtLurieGame === true) history.back(); else setInGame(false) }

  const launch = (game: GameEntry, controlId = `game-${game.id}`, immediately = false) => {
    if (active?.id === game.id && sessionStatus === 'playing') { resume(controlId); return }
    libraryScroll.current = window.scrollY
    launchControl.current = controlId
    setSessionStatus('ready')
    setQuickStart(immediately)
    setSessionId(id => id + 1)
    setActive(game)
    setInGame(true)
    setAway(false)
    window.scrollTo(0, 0)
  }
  const home = () => {
    launchControl.current = null
    libraryScroll.current = 0
    setInGame(false)
    setAway(false)
    window.scrollTo(0, 0)
  }
  const leave = () => {
    dropGameEntry()
    launchControl.current = null
    libraryScroll.current = 0
    setActive(null)
    setInGame(false)
    setAway(true)
    window.scrollTo(0, 0)
  }
  const resume = (controlId = 'continue-game') => {
    libraryScroll.current = window.scrollY
    launchControl.current = controlId
    setInGame(true)
    setResumeRequest(request => request + 1)
    window.scrollTo(0, 0)
  }
  // Safari does not focus a clicked button automatically; give native dialog
  // restoration an explicit opener for both pointer and keyboard users.
  const openHelp = (trigger: HTMLButtonElement) => {
    trigger.focus({ preventScroll: true })
    setHelpOpen(true)
  }
  // Derive from the latest state so quick successive toggles never undo each other.
  const togglePreference = (setting: keyof ComfortPreferences) => setPreferences(previous => ({ ...previous, [setting]: !previous[setting] }))
  useEffect(() => { saveComfort(preferences) }, [preferences])

  return <div className={`waiting-at-lurie ${inGame ? 'has-active-game' : ''}`}>
    <a className="skip-link" href="#waiting-at-lurie-main">Skip to {inGame ? 'game' : 'games'}</a>
    <header className="app-header">
      <button className="lurie-home" onClick={home} aria-label="Waiting at Lurie Children’s home"><img src="/lurie-logo.png" alt=""/><span className="lurie-name"><span className="lurie-l1">Waiting at</span> <span className="lurie-l2">Lurie Children’s</span></span></button>
      <button className={`sticker-bubble ${earned.length ? 'has-stickers' : ''}`} aria-haspopup="dialog" onClick={event => { event.currentTarget.focus({ preventScroll: true }); setBookOpen(true) }}
        aria-label={stickerTotal ? `Your stickers: ${stickerTotal}. Open the sticker book.` : 'Your stickers: none yet. Open the sticker book.'}>
        <Icon name="sticker" size={20}/><span className="sticker-label">Stickers</span>
        {earned.length > 0 && <span className="sticker-row" aria-hidden="true">{earned.map(game => <span key={game.id} className={`sticker-badge theme-${game.color} sticker-${game.id}`}><Icon name={game.icon} size={16} weight="fill"/></span>)}</span>}
        <strong aria-hidden="true">{stickerTotal}</strong>
      </button>
      <div className="header-actions">
        <button className="icon-button help-button" onClick={event => openHelp(event.currentTarget)} aria-label="Help" aria-haspopup="dialog"><Icon name="info"/><span>Help</span></button>
        <button className="icon-button settings-button" onClick={event => { event.currentTarget.focus({ preventScroll: true }); setSettingsOpen(true) }} aria-label="Settings" aria-haspopup="dialog"><Icon name="settings"/><span>Settings</span></button>
        <button className="appointment-button" onClick={leave}><Icon name="wave"/><span>Bye</span></button>
      </div>
    </header>
    <main id="waiting-at-lurie-main" ref={mainRef} tabIndex={-1} className={inGame ? 'session-main' : 'library-main'}>
      {active && <div hidden={!inGame}><GameSession key={sessionId} game={active} quiet={quiet} sound={preferences.sound} visible={inGame} quickStart={quickStart} onSettings={trigger => { trigger.focus({ preventScroll: true }); setSettingsOpen(true) }} resumeRequest={resumeRequest} onStatusChange={setSessionStatus} overlayOpen={settingsOpen || helpOpen || bookOpen || !inGame} onBack={shelfView}/></div>}
      {away ? <section className="goodbye"><WavingBear className="goodbye-icon"/><h1>See you next time!</h1><button className="primary-button" onClick={home}>Back to games <Icon name="right"/></button></section>
      : !inGame && <>
        <h1 className="sr-only">Games</h1>
        {active && sessionStatus === 'playing' && <section className="continue-strip" aria-label="Your current game">
          <span className={`continue-art theme-${active.color}`} aria-hidden="true"><GameCover game={active}/></span>
          <div><h2>{active.name}</h2><p>Your game is paused.</p></div>
          <button id="continue-game" className="primary-button" onClick={() => resume()}><Icon name="play" weight="fill" size={18}/> Continue <span className="sr-only">{active.name}</span></button>
        </section>}
        {shelves.map(group => <section key={group.id} className="games-section" aria-labelledby={`shelf-${group.id}`}>
          <div className="shelf-heading"><h2 id={`shelf-${group.id}`}>{group.title}</h2></div>
          <div className="game-grid">{shelf.filter(game => game.level === group.id).map(game => <button key={game.id} id={`game-${game.id}`} className={`game-card theme-${game.color}`} onClick={() => launch(game, `game-${game.id}`, ['bubbles', 'music', 'stickers'].includes(game.id))} aria-label={`${active?.id === game.id && sessionStatus === 'playing' ? 'Continue' : 'Play'} ${game.name}`} aria-describedby={`game-hint-${game.id}`}>
            <div className="game-cover" aria-hidden="true"><GameCover game={game}/></div>
            <div className="game-card-copy"><h2>{game.name}</h2><p id={`game-hint-${game.id}`}>{game.hint}</p></div><span className="card-open" aria-hidden="true">{active?.id === game.id && sessionStatus === 'playing' ? 'Continue' : 'Play'} <Icon name="right" size={15}/></span>
          </button>)}</div>
        </section>)}

      </>}
    </main>

    <ComfortSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} preferences={preferences} onToggle={togglePreference} deviceQuiet={deviceQuiet}/>
    <WaitingAtLurieHelp open={helpOpen} onClose={() => setHelpOpen(false)}/>
    <StickerBook open={bookOpen} onClose={() => setBookOpen(false)} stickers={stickers}/>
  </div>
}
