// Standard screenshot set for before/after comparisons.
//
//   node checks/snap.mjs [baseUrl] [outDir] [--select <productId>] [--crop x,y,w,h[:view]] [--full-motion]
//
// baseUrl defaults to http://localhost:5173/ (npm run dev), outDir to checks/snaps.
// --select   material for 07-select-<id> (default mdf).
// --crop     adds 09-closeup: a 2x-DPR clip of the 1440x900 page. view is one of
//            cutaway (default, 100%), 25, 50, 75, explode, cutaway-off, select.
// --full-motion  keep normal explode damping (slower to settle, may not be pixel-stable).
//
// Browser: PW_CHROMIUM or /opt/pw-browsers/chromium with software GL (cloud); otherwise installed
// Chrome (channel: 'chrome'). Prints a JSON summary; exits 1 on a page error or horizontal overflow
// at 390px. Console errors and failed requests are reported but do not fail the run.
import fs from 'node:fs';
import path from 'node:path';

const { chromium } = await import('@playwright/test').catch(() => import('playwright'));

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i > -1 ? args.splice(i, 2)[1] : undefined;
};
const fullMotion = args.includes('--full-motion');
if (fullMotion) args.splice(args.indexOf('--full-motion'), 1);
const selectId = flag('--select') ?? 'mdf';
const crop = flag('--crop');
const [baseUrl = 'http://localhost:5173/', outDir = 'checks/snaps'] = args;
fs.mkdirSync(outDir, { recursive: true });

const cloudChromium =
  process.env.PW_CHROMIUM ||
  (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch(
  cloudChromium
    ? {
        executablePath: cloudChromium,
        args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
      }
    : { channel: 'chrome' },
);

const errors = [];
const failedRequests = [];

// Reduced motion makes explode damping converge in ~10 frames (rate 100 instead of 5) with the same
// end state, so shots are pixel-stable even at ~2 fps software GL.
async function open(viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor,
    reducedMotion: fullMotion ? 'no-preference' : 'reduce',
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  page.on('requestfailed', (r) => failedRequests.push(`failed ${r.url()}`));
  page.on('response', (r) => r.status() >= 400 && failedRequests.push(`${r.status()} ${r.url()}`));
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.houseExplorer);
  await settle(page);
  return { context, page };
}

// Settle by rendered frames, not wall time: tick() caps dt at 0.05 s, so at low fps a fixed wait
// covers less simulated time.
const frames = (page, n) =>
  page.evaluate(
    (n) =>
      new Promise((resolve) => {
        let i = 0;
        const step = () => (++i >= n ? resolve() : requestAnimationFrame(step));
        requestAnimationFrame(step);
      }),
    n,
  );
const settle = (page, n = 3, ms = 300) => Promise.all([frames(page, n), page.waitForTimeout(ms)]);
const settleMotion = (page) =>
  Promise.all([frames(page, fullMotion ? 90 : 12), page.waitForTimeout(800)]);

const state = (page) => page.evaluate(() => window.houseExplorer.getState());
const scrub = (page, value) =>
  page.evaluate((v) => {
    const el = document.querySelector('#progress');
    el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);

// Put the page into one of the named views, starting from 100% with cutaway on.
async function view(page, name) {
  if ((await state(page)).playing) await page.click('#play');
  await scrub(page, 100);
  if (!(await state(page)).cutaway) await page.click('#cutaway');
  await settle(page);
  if (['25', '50', '75'].includes(name)) {
    await scrub(page, Number(name));
    await settle(page);
  } else if (name === 'explode') {
    await page.click('#explode');
    await settleMotion(page);
  } else if (name === 'cutaway-off') {
    await page.click('#cutaway');
    await settle(page);
  } else if (name === 'select') {
    await page.click(`[data-id="${selectId}"]`);
    await settle(page);
  }
}

const shot = (page, name, opts = {}) =>
  page.screenshot({ path: path.join(outDir, `${name}.png`), ...opts });

// Desktop set.
const desk = await open({ width: 1440, height: 900 });
const t0 = Date.now();
await frames(desk.page, 5);
const fps = +(5000 / (Date.now() - t0)).toFixed(1);
const parts = await desk.page.evaluate(() => window.houseExplorer.parts);
const initial = await state(desk.page);
for (const [name, v] of [
  ['01-100-cutaway', 'cutaway'],
  ['02-25', '25'],
  ['03-50', '50'],
  ['04-75', '75'],
  ['05-explode', 'explode'],
  ['06-cutaway-off', 'cutaway-off'],
  [`07-select-${selectId}`, 'select'],
]) {
  await view(desk.page, v);
  await shot(desk.page, name);
  // Undo toggles so the next view starts clean.
  const s = await state(desk.page);
  if (s.exploded) {
    await desk.page.click('#explode');
    await settleMotion(desk.page);
  }
  if (s.selected) await desk.page.click(`[data-id="${s.selected}"]`);
}
await desk.context.close();

// Mobile from a fresh load: resizing the desktop page leaves canvas-resize history that makes
// full-page shots differ run to run.
const mob = await open({ width: 390, height: 844 });
await shot(mob.page, '08-mobile', { fullPage: true });
const overflow = await mob.page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth,
);
await mob.context.close();

// Optional close-up at 2x DPR.
let closeup;
if (crop) {
  const [rect, v = 'cutaway'] = crop.split(':');
  const [x, y, width, height] = rect.split(',').map(Number);
  const zoom = await open({ width: 1440, height: 900 }, 2);
  await view(zoom.page, v);
  await shot(zoom.page, '09-closeup', { clip: { x, y, width, height } });
  await zoom.context.close();
  closeup = { x, y, width, height, view: v };
}

await browser.close();
const summary = {
  baseUrl,
  outDir,
  browser: cloudChromium ?? 'chrome',
  fps,
  parts,
  initial,
  overflow,
  closeup,
  errors,
  failedRequests,
};
console.log(JSON.stringify(summary, null, 2));
if (overflow || errors.some((e) => e.startsWith('pageerror'))) process.exitCode = 1;
