import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createHouse, products } from './model.js';
import {
  BUILD_SECONDS,
  CLIP_SECONDS,
  PART_RAMP,
  PART_STAGGER,
  STAGES,
  stageLabel,
} from './timeline.js';
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
// Fraction of the canvas height the house sits below centre (less on phones, where the view
// buttons sit under it).
const VIEW_DROP = { desktop: 0.1, phone: 0.04 };
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
  cutaway = false,
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
  // Lens shift: draw the house lower in the frame without moving the orbit pivot.
  camera.setViewOffset(
    width,
    height,
    0,
    -Math.round(height * VIEW_DROP[width < 550 ? 'phone' : 'desktop']),
    width,
    height,
  );
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();
function partFraction(mesh, i, t) {
  if (mesh.userData.product === 'base') return 1;
  const stage = mesh.userData.stage;
  const offset = (i % 17) * PART_STAGGER;
  return THREE.MathUtils.clamp(
    (t - stage - offset) / Math.min(PART_RAMP, 1 - stage - offset),
    0,
    1,
  );
}
// Exterior finishes (not West Fraser products) step aside in cutaway (wood only), explode view
// and while a material is selected, so only the wood shows. Cutaway off is the finished house.
const FINISHES = ['siding', 'shingle', 'trim', 'glass'];
// Explode offset of a loose part (products not in SPREAD): sides split at x 0.5 and z 0, and each
// product lifts one level higher than the one before.
function looseOffset(id, p, out) {
  const level = products.findIndex((q) => q.id === id);
  return out.set(
    (p[0] > 0.5 ? 1 : -1) * (level >= 0 ? 0.2 + level * 0.1 : 0),
    level >= 0 ? level * 0.32 : 0,
    (p[2] > 0 ? 1 : -1) * 0.8,
  );
}
// Explode by assembly (products in SPREAD). Parts of one product within `join` of each other
// (per axis, default touching) form an assembly, and its parts spread about the assembly's own
// centre by `spread`, so it stays together with even gaps. An assembly lifts like its product. If
// its parts rest on another product (userData.above), it lifts that product's lift plus
// EXPLODE_GAP, or, if they also carry one (userData.below), halfway between the two. Then:
// - slide (deck): long members stretch by the spread factor, so what they carry (balusters on a
//   rail, boards on joists) stays within their length, and the assembly slides straight out from
//   the house along its main horizontal axis until it clears every other exploded part by
//   EXPLODE_GAP.
// - in place (plates, webstock, rim): no stretch or slide. If any part would still overlap another
//   exploded part, the whole assembly spreads further (up to MAX_SPREAD), or else lifts, until
//   it clears, so its pieces never separate from each other.
// Products are placed in SPREAD order, each clearing the final boxes of those before it.
const SPREAD = {
    deck: { spread: 0.8, slide: true },
    plates: { spread: 0.5, join: [4, 0.01, 4] }, // one assembly per plate course
    webstock: { spread: 0.5, join: [0.5, 0.01, 0.5] }, // one assembly per floor
    rim: { spread: 0.5, join: [4, 0.01, 4] }, // one assembly per floor
  },
  EXPLODE_GAP = 0.7,
  MAX_SPREAD = 2;
// mesh -> { center, move, spread, stretch: extra scale per local axis, final: exploded box }
const assembly = new Map();
{
  const restBox = (m) => {
    m.updateMatrix();
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    return m.geometry.boundingBox.clone().applyMatrix4(m.matrix);
  };
  const rest = new Map(parts.map((m) => [m, restBox(m)]));
  const houseBox = new THREE.Box3();
  for (const m of parts)
    if (products.some((q) => q.id === m.userData.product)) houseBox.union(rest.get(m));
  const houseCenter = houseBox.getCenter(new THREE.Vector3()),
    v = new THREE.Vector3();
  const stretchOf = (m, s) => {
    const sc = m.userData.baseScale;
    return sc.map((x) => (x >= 3 * Math.min(...sc) ? s : 0));
  };
  // Each part's exploded box for an assembly centred on c, spread by s and moved by move.
  const layout = (list, c, s, slide, move) =>
    list.map((m) => {
      const r = rest.get(m),
        st = slide ? stretchOf(m, s) : [0, 0, 0],
        mid = r.getCenter(new THREE.Vector3()),
        half = r.getSize(new THREE.Vector3()).multiplyScalar(0.5),
        out = new THREE.Box3();
      for (let k = 0; k < 3; k++) {
        const q = c.getComponent(k) + (mid.getComponent(k) - c.getComponent(k)) * (1 + s),
          h = half.getComponent(k) * (1 + st[k]);
        out.min.setComponent(k, q - h);
        out.max.setComponent(k, q + h);
      }
      return out.translate(move);
    });
  for (const [id, { spread, slide = false, join = [0.01, 0.01, 0.01] }] of Object.entries(SPREAD)) {
    const group = parts.filter((m) => m.userData.product === id);
    const boxes = group.map((m) => {
      const b = rest.get(m).clone();
      b.min.sub(v.fromArray(join));
      b.max.add(v);
      return b;
    });
    const root = group.map((_, i) => i),
      find = (i) => (root[i] === i ? i : (root[i] = find(root[i])));
    for (let i = 0; i < group.length; i++)
      for (let j = i + 1; j < group.length; j++)
        if (boxes[i].intersectsBox(boxes[j])) root[find(i)] = find(j);
    const members = new Map();
    group.forEach((m, i) => members.set(find(i), [...(members.get(find(i)) ?? []), m]));
    // Everything else where it sits when exploded (finishes are hidden then).
    const others = parts
      .filter((m) => m.userData.product !== id && !FINISHES.includes(m.userData.product))
      .map((m) => {
        const a = assembly.get(m);
        return a
          ? a.final
          : rest
              .get(m)
              .clone()
              .translate(looseOffset(m.userData.product, m.userData.basePosition, v));
      });
    const clashes = (bs) =>
      bs.some((b) => {
        const probe = b.clone().expandByScalar(-0.005);
        return others.some((o) => o.intersectsBox(probe));
      });
    for (const list of members.values()) {
      const bounds = new THREE.Box3();
      for (const m of list) bounds.union(rest.get(m));
      const c = bounds.getCenter(new THREE.Vector3());
      const { above, below } = list.find((m) => m.userData.above)?.userData ?? {},
        liftOf = (product) => looseOffset(product, c.toArray(), v).y,
        lift = below
          ? (liftOf(above) + liftOf(below)) / 2
          : above
            ? liftOf(above) + EXPLODE_GAP
            : liftOf(id),
        move = new THREE.Vector3(0, lift, 0);
      let s = spread,
        final = layout(list, c, s, slide, move);
      if (slide) {
        const box = new THREE.Box3();
        for (const b of final) box.union(b);
        const dx = c.x - houseCenter.x,
          dz = c.z - houseCenter.z,
          ax = Math.abs(dx) >= Math.abs(dz) ? 0 : 2,
          side = 2 - ax,
          sign = Math.sign(ax ? dz : dx) || 1;
        let t = 0;
        for (const o of others) {
          if (o.max.y <= box.min.y || o.min.y >= box.max.y) continue;
          if (o.max.getComponent(side) <= box.min.getComponent(side)) continue;
          if (o.min.getComponent(side) >= box.max.getComponent(side)) continue;
          const need =
            sign > 0
              ? o.max.getComponent(ax) - box.min.getComponent(ax)
              : box.max.getComponent(ax) - o.min.getComponent(ax);
          t = Math.max(t, need);
        }
        v.set(0, 0, 0).setComponent(ax, sign * (t + EXPLODE_GAP));
        move.add(v);
        for (const b of final) b.translate(v);
      } else if (clashes(final)) {
        // Spread the whole assembly further; failing that, lift it at its own spread.
        for (
          s = spread + 0.05;
          s <= MAX_SPREAD && clashes((final = layout(list, c, s, slide, move)));
        )
          s += 0.05;
        if (s > MAX_SPREAD) {
          s = spread;
          do {
            move.y += 0.1;
            final = layout(list, c, s, slide, move);
          } while (clashes(final) && move.y < lift + 6);
        }
      }
      list.forEach((m, i) =>
        assembly.set(m, {
          center: c.toArray(),
          move,
          spread: s,
          stretch: slide ? stretchOf(m, s) : [0, 0, 0],
          final: final[i],
        }),
      );
    }
  }
}
const offset = new THREE.Vector3();
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
    mesh.visible = f > 0;
    // A selection shows only the selected products (on the foundation).
    if (selection.size && !picked && data.product !== 'base') mesh.visible = false;
    if (
      FINISHES.includes(data.product) &&
      (cutaway || selection.size || exploded || explodeValue > 0.01)
    )
      mesh.visible = false;
    const b = data.basePosition;
    mesh.position.set(b[0], b[1] + (1 - smooth) * (3 + (i % 5) * 0.35), b[2]);
    const a = assembly.get(mesh);
    mesh.position.addScaledVector(a ? a.move : looseOffset(data.product, b, offset), explodeValue);
    mesh.scale.fromArray(data.baseScale);
    if (a)
      for (let k = 0; k < 3; k++) {
        const v = mesh.position.getComponent(k) + explodeValue * a.spread * (b[k] - a.center[k]);
        mesh.position.setComponent(k, v);
        mesh.scale.setComponent(k, mesh.scale.getComponent(k) * (1 + explodeValue * a.stretch[k]));
      }
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
    // Same timing as partFraction(), in seconds.
    const from = part.userData.stage + (i % 17) * PART_STAGGER,
      start = from * BUILD_SECONDS,
      end = start + Math.min(PART_RAMP, 1 - from) * BUILD_SECONDS;
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
