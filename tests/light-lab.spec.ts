import { test, expect, type Page } from '@playwright/test'
import { lightHint, lightPuzzles, traceLight, turnMirror } from '../src/game/games/lightLabLogic'

async function start(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Play Music Pad', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Play Sticker Scene', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Play Light Lab', exact: true }).click()
  await page.getByRole('button', { name: 'Start playing', exact: true }).click()
}

test('Light Lab uses the new library and retains touch, undo, pause, and continue', async ({ page }, info) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await start(page)
  const mirror = page.getByRole('button', { name: /^Mirror 1,/ })
  const initial = await mirror.getAttribute('aria-label')
  if (info.project.use.hasTouch) await mirror.tap()
  else await mirror.click()
  await expect(mirror).not.toHaveAttribute('aria-label', initial!)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(mirror).toHaveAttribute('aria-label', initial!)
  await mirror.press('Space')
  const beam = await page.locator('.light-beam-core').getAttribute('points')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('region', { name: 'Game paused' })).toBeVisible()
  await page.getByRole('button', { name: 'Keep playing', exact: true }).click()
  await expect(mirror).toBeFocused()
  await expect(page.locator('.light-beam-core')).toHaveAttribute('points', beam!)
  await page.getByRole('button', { name: 'All games', exact: true }).first().click()
  await page.getByRole('button', { name: 'Continue Light Lab', exact: true }).first().click()
  await expect(page.locator('.light-beam-core')).toHaveAttribute('points', beam!)
  await page.getByRole('button', { name: 'Start fresh', exact: true }).click()
  await expect(mirror).toHaveAttribute('aria-label', initial!)
  await expect(page.locator('.light-mirror[data-coach]')).toHaveCount(1)
  expect(errors).toEqual([])
})

test('all experiments solve, award a sticker, and replay from a fresh board', async ({ page }, info) => {
  await start(page)
  for (let index = 0; index < lightPuzzles.length; index++) {
    const puzzle = lightPuzzles[index]!
    let board = puzzle.initial
    while (!traceLight(board, puzzle).solved) {
      const hint = lightHint(board, puzzle)!
      await page.getByRole('button', { name: 'Hint', exact: true }).click()
      const mirror = page.getByRole('button', { name: new RegExp(`^Mirror ${hint + 1},`) })
      await expect(mirror).toHaveClass(/light-hinted/)
      await mirror.press('Enter')
      board = turnMirror(board, hint)
    }
    await expect(page.locator('.mini-game-count')).toHaveText(`${index + 1} / 3 complete`)
    if (index < 2) await page.getByRole('button', { name: 'Next experiment', exact: true }).click()
  }
  await page.screenshot({ path: `artifacts/${info.project.name}-light-lab-new-repo.png`, fullPage: true })
  await page.getByRole('button', { name: 'All done', exact: true }).click()
  await expect(page.getByText('You earned a Light Lab sticker!', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('waiting-at-lurie.stickers.v1')!).lightlab)).toBe(1)
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('mvp.pilot.v1')!).games.lightlab.finishes)).toBe(1)
  await page.getByRole('button', { name: 'Play again', exact: true }).click()
  await expect(page.locator('.mini-game-count')).toHaveText('0 / 3 complete')
  await expect(page.locator('.light-game h2')).toHaveText('First glow')
})

test('all three loopback addresses serve the new source', async ({ request }) => {
  for (const host of ['localhost', '127.0.0.1', '[::1]']) {
    const page = await request.get(`http://${host}:5173/`)
    expect(page.ok()).toBe(true)
    const source = await request.get(`http://${host}:5173/src/game/gameList.ts`)
    expect(await source.text()).toContain('Light Lab')
    expect(await source.text()).toContain('Music Pad')
  }
})

test('the board reflows on narrow screens with larger text', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 })
  await start(page)
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  await page.getByRole('button', { name: 'Starlight trail', exact: true }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(await page.locator('.light-mirror').evaluateAll(elements => elements.every(el => { const r = el.getBoundingClientRect(); return r.width >= 24 && r.height >= 24 }))).toBe(true)
})
