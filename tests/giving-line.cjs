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
const PLAIN = '10% of net sales is given to ministry.'
const NAMED = "10% of net sales is given to ministry, with the largest share going to Children's Cup."
const OLD = /each month|monthly|this app's net sales/i
// giving.json as served by eloraradiance.com (schema of 2026-11-24)
const file = ({ total = 0, through = '', named = false } = {}) => ({
  total_cents: total, through, updated: '2026-11-24', cadence: 'quarterly',
  recipients: [{ name: "Children's Cup", url: 'https://childrenscup.org', total_cents: total, primary: true, named_publicly: named }],
})

async function open(browser, giving) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  await page.route('https://cvtukqamaqrhjtdvmslb.supabase.co/**', (r) => r.fulfill({ json: [] }))
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ body: '' }))
  await page.route('https://eloraradiance.com/giving.json', (r) => giving === 'down' ? r.abort() : r.fulfill({ json: giving, headers: { 'access-control-allow-origin': '*' } }))
  await page.goto(`http://localhost:${PORT}/`); await page.evaluate(() => localStorage.clear())
  await page.goto(`http://localhost:${PORT}/`); await page.waitForTimeout(900); await page.locator('[data-see-prices]').click(); await page.waitForTimeout(700)   // the giving line is on the prices page
  const t = await page.locator('body').innerText()
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  return { page, errs, t, wide }
}

server.listen(PORT, async () => {
  const browser = await chromium.launch()
  try {
    let v = await open(browser, file())
    check('no gift yet: plain sentence shows', v.t.includes(PLAIN))
    check('no gift yet: no total', !v.t.includes('Given so far'))
    check('no gift yet: nothing runs off the side', v.wide <= 0, String(v.wide))
    check('no gift yet: no page errors', v.errs.length === 0, v.errs.join(' | '))
    if (OUT) await v.page.screenshot({ path: path.join(OUT, 'giving-none.png'), fullPage: true })

    v = await open(browser, file({ total: 123456, through: 'December 2026' }))
    check('with total: plain sentence shows', v.t.includes(PLAIN))
    check('with total: total and month show', /Given so far: \$1,235, through December 2026(\n|$)/.test(v.t))
    check('with total: nothing runs off the side', v.wide <= 0, String(v.wide))
    if (OUT) await v.page.screenshot({ path: path.join(OUT, 'giving-total.png'), fullPage: true })

    v = await open(browser, 'down')
    check('file unreachable: plain sentence still shows', v.t.includes(PLAIN))
    check('file unreachable: no total, no errors', !v.t.includes('Given so far') && v.errs.length === 0, v.errs.join(' | '))
    check("file unreachable: Children's Cup is not named", !v.t.includes("Children's Cup"))

    v = await open(browser, file({ total: 123456, through: 'December 2026', named: false }))
    check("named_publicly false: plain wording, Children's Cup not named", v.t.includes(PLAIN) && !v.t.includes("Children's Cup") && !v.t.includes('largest share'))
    check('named_publicly false: no monthly-gift wording', !OLD.test(v.t))

    v = await open(browser, file({ total: 123456, through: 'December 2026', named: true }))
    check("named_publicly true: Children's Cup wording shows", v.t.includes(NAMED))
    check('named_publicly true: the plain sentence is not shown as well', !v.t.includes(PLAIN))
    check('named_publicly true: total still shows', v.t.includes('Given so far: $1,235, through December 2026'))
    check('named_publicly true: nothing runs off the side, no errors', v.wide <= 0 && v.errs.length === 0, String(v.wide) + ' ' + v.errs.join(' | '))
    if (OUT) await v.page.screenshot({ path: path.join(OUT, 'giving-named.png'), fullPage: true })

    // A file that marks no main recipient, or names one without the flag, never names anyone
    v = await open(browser, { total_cents: 5000, through: 'January 2027', cadence: 'quarterly', recipients: [{ name: "Children's Cup", primary: false, named_publicly: true }] })
    check('no primary recipient: plain wording', v.t.includes(PLAIN) && !v.t.includes("Children's Cup"))
  } catch (e) { check('test ran', false, e.message) }
  await browser.close(); server.close()
  console.log(results.join('\n')); process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0)
})
