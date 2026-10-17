import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import './game/waiting-at-lurie.css'
import './game/mobile-accessibility.css'
import './game/playful-premium.css'
import './game/apple-ui.css'
import './game/discovery-games.css'
import './game/features.css'
import './game/mobile-play.css'
import './game/games/sky-dash.css'
import './game/games/robot-art.css'

// Focus rings are for keyboard and switch users. A tap or click turns them
// off, even where the app then moves focus itself; the next key press turns
// them back on.
const root = document.documentElement
root.dataset.keys = 'false'
window.addEventListener('keydown', event => { if (!event.metaKey && !event.ctrlKey) root.dataset.keys = 'true' }, true)
window.addEventListener('pointerdown', () => { root.dataset.keys = 'false' }, true)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
