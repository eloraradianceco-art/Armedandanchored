// Browser test (Supabase mocked): Settings folds into rows, the weapon page has one share button (the floating one),
// and the weapon list fits on a phone without scrolling.
// Run: npx vite build && node tests/settings-and-jump.cjs dist [screenshot folder]
let chromium; try { ({ chromium } = require('playwright')) } catch { ({ chromium } = require('/opt/npm-tools/node_modules/playwright')) }
const http = require('http'), fs = require('fs'), path = require('path')
const DIST = path.resolve(process.argv[2] || 'dist'), PORT = 4795, OUT = process.argv[3] || ''
const server = http.createServer((req, res) => {
  let f = path.join(DIST, decodeURIComponent(req.url.split('?')[0]))
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIST, 'index.html')
  res.setHeader('Content-Type', { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' }[path.extname(f)] || 'application/octet-stream')
  fs.createReadStream(f).pipe(res)
})
const UID = '00000000-0000-4000-8000-000000000001'
const user = { id: UID, aud: 'authenticated', role: 'authenticated', email: 'test@example.com', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }
const token = { access_token: 'x.' + Buffer.from(JSON.stringify({ sub: UID, exp: 4102444800 })).toString('base64') + '.y', token_type: 'bearer', expires_in: 3600, expires_at: 4102444800, refresh_token: 'r', user }
const results = []; const check = (n, ok, x = '') => results.push((ok ? 'PASS ' : 'FAIL ') + n + (x ? ' — ' + x : ''))

async function open(browser, { signedIn, paid, viewport = { width: 390, height: 844 } }) {
  const page = await browser.newPage({ viewport }); const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  const state = { paid }
  await page.route('https://cvtukqamaqrhjtdvmslb.supabase.co/**', async (route) => {
    const u = route.request().url()
    if (u.includes('/rpc/aa_load_profile')) return route.fulfill({ json: { id: UID, email: user.email, paid: state.paid, onboarded: true, light_mode: false, saved: [] } })
    if (u.includes('/auth/v1/user')) return route.fulfill({ json: user })
    if (route.request().method() !== 'GET') return route.fulfill({ status: 204, body: '' })
    return route.fulfill({ json: [] })
  })
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ body: '' }))
  await page.route('https://eloraradiance.com/**', (r) => r.fulfill({ json: {} }))
  await page.goto(`http://localhost:${PORT}/`)
  page.on('pageerror', (e) => errs.push(e.message))
  await page.evaluate(([s]) => { localStorage.clear(); localStorage.setItem('sb-cvtukqamaqrhjtdvmslb-auth-token', JSON.stringify(s)); localStorage.setItem('aa_onboarded', 'true') }, [token])
  await page.goto(`http://localhost:${PORT}/`); await page.waitForTimeout(1300)
  return { page, errs, state }
}
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: path.join(OUT, n + '.png') }) }

server.listen(PORT, async () => {
  const browser = await chromium.launch()
  try {
    for (const [label, viewport] of [['iPhone', { width: 390, height: 844 }], ['small iPhone', { width: 375, height: 667 }]]) {
      const { page, errs } = await open(browser, { signedIn: true, paid: true, viewport })
      // ── Weapon page ──
      await page.getByRole('button', { name: 'Open your arsenal' }).click(); await page.waitForTimeout(500)
      await page.getByText('The Full Armor of God').first().click(); await page.waitForTimeout(700)
      const headerButtons = await page.evaluate(() => {
        const img = [...document.querySelectorAll('img[src="/icon.png"]')].find((i) => i.offsetParent)
        let el = img; while (el && getComputedStyle(el).position !== 'sticky') el = el.parentElement
        return el ? el.querySelectorAll('button').length : -1
      })
      check(`${label}: no share button in the weapon header; the floating one remains`, headerButtons === 0 && (await page.getByRole('button', { name: 'Share this weapon' }).count()) === 1, String(headerButtons))
      await page.locator('h2', { hasText: 'The Full Armor of God' }).click(); await page.waitForTimeout(400)
      const list = await page.evaluate(() => {
        const tiles = [...document.querySelectorAll('button')].filter((b) => b.parentElement && getComputedStyle(b.parentElement).gridTemplateColumns.split(' ').length === 4 && getComputedStyle(b.parentElement).position === 'fixed')
        const box = tiles[0] && tiles[0].parentElement
        if (!box) return null
        const r = box.getBoundingClientRect(); const nav = document.querySelector('nav[aria-label="Main"]')
        return { count: tiles.length, scrolls: box.scrollHeight > box.clientHeight + 1, bottom: Math.round(r.bottom), navTop: nav ? Math.round(nav.getBoundingClientRect().top) : null, wide: document.documentElement.scrollWidth - window.innerWidth }
      })
      check(`${label}: all 26 weapons listed`, list && list.count === 26, JSON.stringify(list))
      check(`${label}: the list does not scroll`, list && !list.scrolls, JSON.stringify(list))
      check(`${label}: the list ends above the tab bar`, list && (list.navTop === null || list.bottom <= list.navTop), JSON.stringify(list))
      await shot(page, 'jump-' + viewport.width)
      await page.mouse.click(5, 5); await page.waitForTimeout(300)

      // ── Settings ──
      await page.locator('nav[aria-label="Main"] button', { hasText: 'Settings' }).click(); await page.waitForTimeout(600)
      const st = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('details.aa-fold')]
        const scroller = [...document.querySelectorAll('div')].find((d) => getComputedStyle(d).position === 'fixed' && getComputedStyle(d).overflowY === 'auto' && d.querySelector('details.aa-fold'))
        return { rows: rows.map((d) => d.querySelector('summary').innerText.split('\n')[1].trim()), open: rows.filter((d) => d.open).length, screens: scroller ? +(scroller.scrollHeight / window.innerHeight).toFixed(2) : null, wide: document.documentElement.scrollWidth - window.innerWidth }
      })
      check(`${label}: Settings has nine rows, all closed`, st.rows.length === 9 && st.open === 0, JSON.stringify(st.rows))
      check(`${label}: Settings is under a screen and a half`, st.screens !== null && st.screens <= 1.5, String(st.screens))
      const t = await page.locator('body').innerText()
      check(`${label}: account, light mode and Sign Out stay visible`, /test@example\.com/.test(t) && /Light Mode/.test(t) && (await page.getByRole('button', { name: 'Sign Out' }).isVisible()))
      await shot(page, 'settings-' + viewport.width)
      await page.locator('#set-data > summary').click(); await page.waitForTimeout(300)
      check(`${label}: Your Data opens to export and reset`, await page.getByRole('button', { name: /Export Journal/ }).isVisible() && await page.getByRole('button', { name: /Reset Progress/ }).isVisible())
      await page.locator('#set-reminders > summary').click(); await page.waitForTimeout(300)
      const stillOpen = await page.evaluate(() => document.querySelector('#set-data').open)
      check(`${label}: a row stays open while you use another`, stillOpen)
      const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      check(`${label}: nothing runs off the side`, wide <= 0 && st.wide <= 0 && list && list.wide <= 0, String(wide))
      await shot(page, 'settings-open-' + viewport.width)
      check(`${label}: no page errors`, errs.length === 0, errs.join(' | ')); await page.close()
    }
  } catch (e) { check('test ran', false, e.message.slice(0, 300)) }
  await browser.close(); server.close()
  console.log(results.join('\n')); process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0)
})
