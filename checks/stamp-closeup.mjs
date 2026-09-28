// Ad-hoc: frame one LVL header head-on and shoot it at 3x DPR to judge the mill stamp.
//   node checks/stamp-closeup.mjs <outPng> [baseUrl]
import { chromium } from '@playwright/test';

const [out = 'stamp.png', baseUrl = 'http://localhost:5173/'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 700 }, deviceScaleFactor: 3 });
await page.goto(baseUrl, { waitUntil: 'load' });
await page.waitForFunction(() => window.houseExplorer);

const info = await page.evaluate(async () => {
  const h = window.houseExplorer;
  document.querySelector('[data-id="lvl"]').click();
  const { scene, camera, controls } = h;
  // Widest LVL mesh: the garage header, the clearest stamp in the model.
  let best = null;
  scene.traverse((m) => {
    if (m.isMesh && m.userData.product === 'lvl') {
      const s = m.userData.baseScale;
      if (!best || s[0] > best.userData.baseScale[0]) best = m;
    }
  });
  const p = best.userData.basePosition;
  // Sit off the broad face (+z) and slightly above, looking straight at it.
  controls.target.set(p[0], p[1], p[2]);
  camera.position.set(p[0], p[1] + 0.25, p[2] + 2.2);
  controls.update();
  for (let i = 0; i < 40; i++) await new Promise((r) => requestAnimationFrame(r));
  return { name: best.name, scale: best.userData.baseScale, pos: p };
});

await page.locator('#canvas').screenshot({ path: out });
console.log(JSON.stringify(info));
await browser.close();
