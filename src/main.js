import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createHouse, products } from './model.js';
import { BUILD_SECONDS, CLIP_SECONDS, STAGES, stageLabel } from './timeline.js';
const $ = (s) => document.querySelector(s),
  canvas = $('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 13;
controls.maxDistance = 40;
controls.maxPolarAngle = Math.PI / 2 - 0.04;
controls.target.set(0.6, 2.2, 0.2);
function reset() {
  camera.position.set(20, 15, 25);
  controls.target.set(0.6, 2.2, 0.2);
  controls.update();
}
reset();
scene.add(new THREE.HemisphereLight(0xffffff, 0x7f8971, 2.8));
const sun = new THREE.DirectionalLight(0xfff2d8, 4);
sun.position.set(-8, 18, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -16;
sun.shadow.camera.right = 16;
sun.shadow.camera.top = 14;
sun.shadow.camera.bottom = -14;
sun.shadow.normalBias = 0.035;
sun.shadow.bias = -0.0001;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xd4e4ff, 1.2);
fill.position.set(10, 8, -12);
scene.add(fill);
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.ShadowMaterial({ color: 0x536044, opacity: 0.17 }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.13;
ground.receiveShadow = true;
scene.add(ground);
const { house, parts, mats } = createHouse();
scene.add(house);
const grid = new THREE.GridHelper(27, 27, 0xdde1d6, 0xe0e5da);
grid.position.y = -0.12;
grid.material.transparent = true;
grid.material.opacity = 0.22;
scene.add(grid);
let progress = 1,
  playing = false,
  exploded = false,
  explodeValue = 0,
  cutaway = true,
  selected = null; // the most recent pick, shown in the detail panel
// Products shown in isolation. Cards (and parts in the view) toggle in and out; empty shows all.
const selection = new Set();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const originalColors = Object.fromEntries(
  Object.entries(mats).map(([id, m]) => [id, m.color.clone()]),
);
$('#products').innerHTML = products
  .map(
    (p, i) =>
      `<button class="product" data-id="${p.id}" aria-pressed="false"><span class="swatch" style="--color:${p.color}"></span><span>${p.name}<small>${p.type}</small></span></button>`,
  )
  .join('');
// select(id) toggles a product in or out of the selection; select(null) clears it.
function select(id) {
  if (id === null) selection.clear();
  else if (!selection.delete(id)) selection.add(id);
  selected = [...selection].at(-1) ?? null;
  document.querySelectorAll('.product').forEach((el) => {
    el.classList.toggle('active', selection.has(el.dataset.id));
    el.setAttribute('aria-pressed', selection.has(el.dataset.id));
  });
  const p = products.find((p) => p.id === selected);
  $('#detail').innerHTML = p
    ? `<span class="eyebrow">${p.type} · IN THE HOUSE</span><h3>${p.name}</h3><p>${p.desc}</p><a href="https://www.westfraser.com/products" target="_blank" rel="noopener">Learn More →</a><button id="clear">Show all products</button>`
    : `<span class="eyebrow">ATTRIBUTES OF WOOD</span><h3>Carbon Storage</h3><p>Responsibly sourced wood products are grown naturally, capture carbon dioxide from the atmosphere as they grow and continue to store carbon throughout their lifetime.</p><a href="https://www.westfraser.com/products" target="_blank" rel="noopener">Explore Our Products →</a>`;
  $('#clear')?.addEventListener('click', () => select(null));
  if (p) {
    progress = 1;
    playing = false;
    syncUI();
  }
}
select(null);
$('#products').addEventListener('click', (e) => {
  const b = e.target.closest('[data-id]');
  if (b) select(b.dataset.id);
});
function syncUI() {
  $('#progress').value = progress * 100;
  $('#percent').innerHTML = `${Math.round(progress * 100)}<span>%</span>`;
  $('#play').textContent = playing ? 'Ⅱ' : '▶';
  $('#play').setAttribute('aria-label', playing ? 'Pause build animation' : 'Play build animation');
  $('#stage-label').textContent = stageLabel(progress);
}
$('#play').onclick = () => {
  if (!playing) {
    if (progress >= 0.999) progress = 0;
    if (selection.size) select(null);
    exploded = false;
    $('#explode').setAttribute('aria-pressed', 'false');
  }
  playing = !playing;
  syncUI();
};
$('#progress').oninput = (e) => {
  playing = false;
  progress = Number(e.target.value) / 100;
  syncUI();
};
$('.timeline-labels').innerHTML = STAGES.map(
  (s) => `<button data-progress="${s.stop}">${s.button}</button>`,
).join('');
document.querySelectorAll('[data-progress]').forEach(
  (b) =>
    (b.onclick = () => {
      progress = Number(b.dataset.progress) / 100;
      playing = false;
      syncUI();
    }),
);
$('#explode').onclick = () => {
  exploded = !exploded;
  $('#explode').setAttribute('aria-pressed', exploded);
  progress = 1;
  playing = false;
  syncUI();
};
$('#cutaway').onclick = () => {
  cutaway = !cutaway;
  $('#cutaway').setAttribute('aria-pressed', cutaway);
};
$('#reset').onclick = reset;
const raycaster = new THREE.Raycaster(),
  pointer = new THREE.Vector2();
let down;
canvas.addEventListener('pointerdown', (e) => {
  down = [e.clientX, e.clientY];
});
function hit(e) {
  const r = canvas.getBoundingClientRect();
  pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, (-(e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  return raycaster
    .intersectObjects(parts, false)
    .find((h) => h.object.visible && products.some((p) => p.id === h.object.userData.product));
}
canvas.addEventListener('pointerup', (e) => {
  if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 5) {
    const h = hit(e);
    if (h) select(h.object.userData.product);
  }
  down = null;
});
canvas.addEventListener('pointermove', (e) => {
  if (e.buttons) return;
  const h = hit(e),
    label = $('#hover-label');
  label.hidden = !h;
  canvas.style.cursor = h ? 'pointer' : 'grab';
  if (h) {
    label.textContent = products.find((p) => p.id === h.object.userData.product).name;
    const r = canvas.getBoundingClientRect();
    label.style.left = Math.min(e.clientX - r.left + 14, r.width - 160) + 'px';
    label.style.top = e.clientY - r.top - 35 + 'px';
  }
});
canvas.addEventListener('pointerleave', () => ($('#hover-label').hidden = true));
function resize() {
  const { width, height } = canvas.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.fov = width < 550 ? 46 : 35;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();
function partFraction(mesh, i, t) {
  if (mesh.userData.product === 'base') return 1;
  const stage = mesh.userData.stage;
  const offset = (i % 17) * 0.001;
  return THREE.MathUtils.clamp((t - stage - offset) / Math.min(0.045, 1 - stage - offset), 0, 1);
}
// Exterior finishes (not products) step aside in explode view and while a material is selected,
// so the materials stay visible.
const FINISHES = ['siding', 'shingle', 'trim', 'glass'];
function updateParts(dt) {
  explodeValue = THREE.MathUtils.damp(explodeValue, exploded ? 1 : 0, reduced ? 100 : 5, dt);
  for (const [id, mat] of Object.entries(mats)) {
    const product = mat.userData.product ?? id; // OSB edge materials follow their product
    mat.color.copy(originalColors[id]);
    if (selection.size && !selection.has(product)) mat.color.lerp(new THREE.Color('#e6e9df'), 0.76);
    mat.emissive.set(selection.has(product) ? '#40331b' : '#000000');
    mat.emissiveIntensity = 0.12;
  }
  parts.forEach((mesh, i) => {
    const data = mesh.userData,
      f = partFraction(mesh, i, progress),
      smooth = 1 - Math.pow(1 - f, 3);
    const picked = selection.has(data.product);
    const cutHide = cutaway && data.cut && !picked;
    mesh.visible = f > 0 && !cutHide;
    // A selection shows only the selected products (on the foundation).
    if (selection.size && !picked && data.product !== 'base') mesh.visible = false;
    if (FINISHES.includes(data.product) && (selection.size || exploded || explodeValue > 0.01))
      mesh.visible = false;
    const b = data.basePosition;
    mesh.position.set(b[0], b[1] + (1 - smooth) * (3 + (i % 5) * 0.35), b[2]);
    const level = products.findIndex((p) => p.id === data.product);
    mesh.position.x += explodeValue * (b[0] > 0.5 ? 1 : -1) * (level >= 0 ? 0.2 + level * 0.1 : 0);
    mesh.position.y += explodeValue * (level >= 0 ? level * 0.32 : 0);
    mesh.position.z += explodeValue * (b[2] > 0 ? 1 : -1) * 0.8;
    mesh.scale.fromArray(data.baseScale);
    mesh.scale.multiplyScalar(Math.max(0.001, smooth));
  });
}
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (playing) {
    progress = Math.min(1, progress + dt / BUILD_SECONDS);
    if (progress === 1) playing = false;
    syncUI();
  }
  updateParts(dt);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
// Export copies of each part's material(s) at their original colour, without selection dimming.
const matKey = new Map(Object.entries(mats).map(([id, m]) => [m, id]));
function exportMaterial(mat) {
  const copy = mat.clone();
  copy.color.copy(originalColors[matKey.get(mat)]);
  copy.emissive.set(0);
  return copy;
}
async function exportModel() {
  const out = new THREE.Group();
  out.name = 'West_Fraser_Demo_House';
  const tracks = [];
  for (const [i, part] of parts.entries()) {
    const m = part.clone();
    m.material = Array.isArray(part.material)
      ? part.material.map(exportMaterial)
      : exportMaterial(part.material);
    m.visible = true;
    m.position.fromArray(part.userData.basePosition);
    m.scale.fromArray(part.userData.baseScale);
    m.quaternion.fromArray(part.userData.baseQuaternion);
    out.add(m);
    if (part.userData.product === 'base') continue;
    const start = (part.userData.stage + (i % 17) * 0.001) * BUILD_SECONDS,
      end = start + 0.99;
    const pos = m.position.clone(),
      scale = m.scale.clone();
    tracks.push(
      new THREE.VectorKeyframeTrack(
        m.name + '.position',
        [0, start, end, CLIP_SECONDS],
        [
          pos.x,
          pos.y + 4,
          pos.z,
          pos.x,
          pos.y + 4,
          pos.z,
          pos.x,
          pos.y,
          pos.z,
          pos.x,
          pos.y,
          pos.z,
        ],
      ),
    );
    tracks.push(
      new THREE.VectorKeyframeTrack(
        m.name + '.scale',
        [0, start, end, CLIP_SECONDS],
        [
          0.00001,
          0.00001,
          0.00001,
          0.00001,
          0.00001,
          0.00001,
          scale.x,
          scale.y,
          scale.z,
          scale.x,
          scale.y,
          scale.z,
        ],
      ),
    );
  }
  const clip = new THREE.AnimationClip('Build_From_Materials', CLIP_SECONDS, tracks);
  return new Promise((resolve, reject) =>
    new GLTFExporter().parse(out, resolve, reject, {
      binary: true,
      animations: [clip],
      onlyVisible: false,
    }),
  );
}
window.houseExplorer = {
  parts: parts.length,
  products: products.length,
  getState: () => ({ progress, playing, exploded, cutaway, selected, selection: [...selection] }),
  exportModel,
};
