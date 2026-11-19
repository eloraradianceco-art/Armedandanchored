// Browser test of the giving line on the purchase page, with eloraradiance.com/giving.json mocked. No real requests.
// Run: npx vite build && node tests/giving-line.cjs dist [screenshot folder]
let chromium; try { ({ chromium } = require('playwright')) } catch { ({ chromium } = require('/opt/npm-tools/node_modules/playwright')) }
const http = require('http'), fs = require('fs'), path = require('path')
const DIST = path.resolve(process.argv[2] || 'dist'), PORT = 4794, OUT = process.argv[3] || ''
const server = http.createServer((req, res) => {
  let f = path.join(DIST, decodeURIComponent(req.url.split('?')[0]))
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIST, 'index.html')
  res.setHeader('Content-Type', { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' }[path.extname(f)] || 'application/octet-stream')
  fs.createReadStream(f).pipe(res)
})
const results = []; const check = (n, ok, x = '') => results.push((ok ? 'PASS ' : 'FAIL ') + n + (x ? ' — ' + x : ''))
const SENTENCE = "10% of this app's net sales each month is given to Children's Cup."

async function open(browser, giving) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  await page.route('https://cvtukqamaqrhjtdvmslb.supabase.co/**', (r) => r.fulfill({ json: [] }))
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ body: '' }))
  await page.route('https://eloraradiance.com/giving.json', (r) => giving === 'down' ? r.abort() : r.fulfill({ json: giving, headers: { 'access-control-allow-origin': '*' } }))
  await page.goto(`http://localhost:${PORT}/`); await page.evaluate(() => localStorage.clear())
  await page.goto(`http://localhost:${PORT}/`); await page.waitForTimeout(1300)
  const t = await page.locator('body').innerText()
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  return { page, errs, t, wide }
}

server.listen(PORT, async () => {
  const browser = await chromium.launch()
  try {
    let v = await open(browser, { ministry: "Children's Cup", percent: 10, total_cents: 0, through: null })
    check('no gift yet: sentence shows', v.t.includes(SENTENCE))
    check('no gift yet: no total', !v.t.includes('Given so far'))
    check('no gift yet: nothing runs off the side', v.wide <= 0, String(v.wide))
    check('no gift yet: no page errors', v.errs.length === 0, v.errs.join(' | '))
    if (OUT) await v.page.screenshot({ path: path.join(OUT, 'giving-none.png'), fullPage: true })

    v = await open(browser, { ministry: "Children's Cup", percent: 10, total_cents: 123456, through: 'December 2026' })
    check('with gifts: sentence shows', v.t.includes(SENTENCE))
    check('with gifts: total and month show', v.t.includes('Given so far: $1,235, through December 2026.'))
    check('with gifts: nothing runs off the side', v.wide <= 0, String(v.wide))
    if (OUT) await v.page.screenshot({ path: path.join(OUT, 'giving-total.png'), fullPage: true })

    v = await open(browser, 'down')
    check('file unreachable: sentence still shows', v.t.includes(SENTENCE))
    check('file unreachable: no total, no errors', !v.t.includes('Given so far') && v.errs.length === 0, v.errs.join(' | '))
  } catch (e) { check('test ran', false, e.message) }
  await browser.close(); server.close()
  console.log(results.join('\n')); process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0)
})
