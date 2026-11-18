// Browser test of the free weapon (The Full Armor of God) with a mocked database. No real requests.
// Run: npx vite build && node tests/free-weapon.cjs dist   (needs playwright available to node)
let chromium; try { ({ chromium } = require('playwright')) } catch { ({ chromium } = require('/opt/npm-tools/node_modules/playwright')) }
const http = require('http'), fs = require('fs'), path = require('path')
const DIST = path.resolve(process.argv[2] || 'dist'), PORT = 4793, OUT = process.argv[3] || ''
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
  await page.goto(`http://localhost:${PORT}/`)
  await page.evaluate(([s, signed]) => { localStorage.clear(); if (signed) { localStorage.setItem('sb-cvtukqamaqrhjtdvmslb-auth-token', JSON.stringify(s)); localStorage.setItem('aa_onboarded', 'true') } }, [token, signedIn])
  await page.goto(`http://localhost:${PORT}/`); await page.waitForTimeout(1300)
  return { page, errs, state }
}
const text = (p) => p.locator('body').innerText()
const shot = async (p, n) => { if (OUT) await p.screenshot({ path: path.join(OUT, n + '.png') }) }

server.listen(PORT, async () => {
  const browser = await chromium.launch()
  try {
    // ── Signed out: welcome offers the free start ──
    let { page, errs } = await open(browser, { signedIn: false })
    let t = await text(page)
    check('Welcome: buy button and free start', /Get Lifetime Access/.test(t) && /Start Free: The Armor of God/.test(t) && /Free account, no card/.test(t), t.slice(0, 120))
    await shot(page, 'free-1-welcome')
    await page.getByRole('button', { name: /Start Free/ }).click(); await page.waitForTimeout(500)
    t = await text(page)
    check('Free start opens account creation', /Create a free account to open The Full Armor of God/.test(t), t.slice(0, 200).replace(/\s+/g, ' '))
    check('No page errors (signed out)', errs.length === 0, errs.join(' | ')); await page.close()

    // ── Free account: in the app with one weapon ──
    ;({ page, errs } = await open(browser, { signedIn: true, paid: false }))
    t = await text(page)
    check('Free account lands in the app, not the unlock page', /Your arsenal/i.test(t) && !/Get Lifetime Access/.test(t), t.slice(0, 160).replace(/\s+/g, ' '))
    check('Free banner shown', /Your free weapon/i.test(t) && /Unlock all 26 weapons/.test(t))
    check('25 weapons locked, Armor of God free', (t.match(/Locked/gi) || []).length === 25 && /✦ Free/i.test(t))
    await shot(page, 'free-2-arsenal')
    await page.getByRole('button', { name: /Armor of God ✦ Free/i }).click(); await page.waitForTimeout(700)
    t = await text(page)
    check('Free weapon opens', /Full Armor of God/.test(t) && /Weapon 2 of 26/i.test(t) && !/Get Lifetime Access/.test(t))
    for (const tab of ['Teaching', 'Lexicon', 'Enemy Tactics', 'Declare', 'Journal', 'Tool']) {
      const b = page.getByRole('button', { name: new RegExp(tab) }).first()
      if (await b.count()) { await b.click().catch(() => {}); await page.waitForTimeout(250) }
    }
    check('Every tab of the free weapon opens without the unlock page', !/Get Lifetime Access/.test(await text(page)))
    await shot(page, 'free-3-weapon')
    await page.goto(`http://localhost:${PORT}/`); await page.waitForTimeout(1200)
    await page.getByRole('button', { name: /Breaking Strongholds \(locked\)/ }).click(); await page.waitForTimeout(600)
    t = await text(page)
    check('Locked weapon opens the unlock page with a way back', /Get Lifetime Access/.test(t) && /Back to your free weapon/.test(t) && /Signed in as/.test(t))
    await shot(page, 'free-4-unlock')
    await page.getByRole('button', { name: /Back to your free weapon/ }).click(); await page.waitForTimeout(500)
    check('Back returns to the arsenal', /Your arsenal/i.test(await text(page)))
    // Under Attack and the Daily Drill run on the free weapon
    const attack = page.getByRole('button', { name: /Under attack\?/i }).first()
    if (await attack.count()) {
      await attack.click(); await page.waitForTimeout(500)
      const dlg = page.getByRole('dialog'); const dt = await dlg.innerText()
      check('Under Attack lists what you are facing', /What are you facing/.test(dt) && /Full Armor of God/.test(dt))
      await dlg.locator('.dr-attack').first().click(); await page.waitForTimeout(600)
      check('Under Attack runs on the Armor of God', /Stand on this|Armor/i.test(await page.getByRole('dialog').innerText()))
    } else check('Under Attack button found', false)
    check('No page errors (free account)', errs.length === 0, errs.join(' | ')); await page.close()

    // ── iPad, free ──
    ;({ page, errs } = await open(browser, { signedIn: true, paid: false, viewport: { width: 1032, height: 1376 } }))
    check('iPad: nothing wider than the screen', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    await shot(page, 'free-5-ipad'); await page.close()

    // ── Paid account: unchanged ──
    ;({ page, errs } = await open(browser, { signedIn: true, paid: true }))
    t = await text(page)
    check('Paid: no locks, no free banner', !/Locked/.test(t) && !/Your free weapon/i.test(t) && /Your arsenal/i.test(t))
    await page.getByRole('button', { name: /Breaking Strongholds/ }).first().click(); await page.waitForTimeout(600)
    check('Paid: any weapon opens', /Breaking Strongholds/.test(await text(page)) && !/Get Lifetime Access/.test(await text(page)))
    check('No page errors (paid)', errs.length === 0, errs.join(' | ')); await page.close()
  } catch (e) { results.push('FAIL crashed — ' + e.message) }
  await browser.close(); server.close()
  console.log(results.join('\n')); process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0)
})
