import * as THREE from 'three';
export const products = [
  {
    id: 'plates',
    name: 'Lumber plates',
    type: 'LUMBER',
    color: '#ba9360',
    stage: 0.08,
    desc: 'Horizontal lumber plates connect wall studs to the floor and tie the tops of framed walls together.',
  },
  {
    id: 'webstock',
    name: 'OSB webstock',
    type: 'OSB',
    color: '#a9854f',
    stage: 0.14,
    desc: 'The OSB web forms the central section of an engineered I-joist. Lumber flanges and panel webs work together in the floor assembly.',
  },
  {
    id: 'rim',
    name: 'Rimboard',
    type: 'OSB',
    color: '#b68b4d',
    stage: 0.2,
    desc: 'Rimboard closes the perimeter of the floor system, connecting the ends of the joists around the building.',
  },
  {
    id: 'floor',
    name: 'Sub-flooring',
    type: 'OSB / PLYWOOD',
    color: '#dac397',
    stage: 0.27,
    desc: 'Structural panels create a continuous floor surface over the joists. Select OSB or plywood products according to the application.',
  },
  {
    id: 'framing',
    name: 'Framing lumber',
    type: 'LUMBER',
    color: '#ddba81',
    stage: 0.37,
    desc: 'Individual studs, beams and framing members form the skeleton of the house. Explore the cutaway to see the structure behind the walls.',
  },
  {
    id: 'lvl',
    name: 'LVL header',
    type: 'LVL',
    color: '#bd9053',
    stage: 0.45,
    desc: 'Laminated veneer lumber headers span openings such as doors and garage entrances, transferring loads to the framing on either side.',
  },
  {
    id: 'trusses',
    name: 'Roof trusses',
    type: 'FRAMING LUMBER',
    color: '#e7c992',
    stage: 0.53,
    desc: 'Triangulated lumber members form the roof structure and support the roof sheathing. Shown as a conceptual framing arrangement.',
  },
  {
    id: 'walls',
    name: 'Wall sheathing',
    type: 'OSB / PLYWOOD',
    color: '#c5a36a',
    stage: 0.65,
    desc: 'Structural sheathing panels cover the wall frame. The open portions of this house reveal how panels and lumber fit together.',
  },
  {
    id: 'roof',
    name: 'Roof sheathing',
    type: 'OSB / PLYWOOD',
    color: '#e5cfa4',
    stage: 0.74,
    desc: 'Panels span the roof framing to create a continuous deck beneath the roof covering.',
  },
  {
    id: 'deck',
    name: 'Decking',
    type: 'TREATED LUMBER',
    color: '#ad8758',
    stage: 0.83,
    desc: 'Individual boards form the outdoor deck and front porch. The supplied reference identifies treated lumber; treatment and availability should be confirmed for the intended market.',
  },
  {
    id: 'mdf',
    name: 'MDF',
    type: 'TRIM & CABINETS',
    color: '#e8d7b3',
    stage: 0.91,
    desc: 'Medium-density fibreboard is used for interior trim and cabinetry. Select this material to reveal the simplified cabinets.',
  },
];
function texture(kind) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = kind === 'osb' ? '#c9ac79' : '#dfc194';
  ctx.fillRect(0, 0, 256, 256);
  let seed = 29;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < (kind === 'osb' ? 2200 : 550); i++) {
    ctx.save();
    const x = rnd() * 256,
      y = rnd() * 256;
    ctx.translate(x, y);
    ctx.rotate(kind === 'osb' ? rnd() * Math.PI : (rnd() - 0.5) * 0.07);
    ctx.fillStyle = `rgba(${kind === 'osb' ? '103,70,31' : '110,76,34'},${rnd() * 0.17})`;
    ctx.fillRect(
      0,
      0,
      kind === 'osb' ? rnd() * 22 + 3 : rnd() * 120 + 30,
      kind === 'osb' ? rnd() * 4 + 1 : 0.6,
    );
    ctx.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}
// Lap siding: 8 courses per 1.28 m tile (0.16 m exposure), pale so the material colour tints it.
function lapTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  for (let i = 0; i < 8; i++) {
    const g = ctx.createLinearGradient(0, i * 32, 0, i * 32 + 32);
    g.addColorStop(0, '#d7dada');
    g.addColorStop(0.2, '#ffffff');
    g.addColorStop(1, '#eef0f0');
    ctx.fillStyle = g;
    ctx.fillRect(0, i * 32, 256, 32);
    ctx.fillStyle = 'rgba(35,45,45,0.55)';
    ctx.fillRect(0, i * 32 + 30, 256, 2); // shadow under each lap
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}
// Three-tab asphalt shingles: 8 courses per 1 m tile (0.125 m exposure), 0.25 m tabs staggered by
// half a tab, with a deterministic tab-to-tab tone variation.
function shingleTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  let seed = 11;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 8; i++)
    for (let t = -1; t < 4; t++) {
      const v = 205 + Math.floor(rnd() * 50),
        x0 = t * 64 + (i % 2) * 32;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x0, i * 32, 64, 32);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(x0, i * 32, 2, 32); // tab cut
    }
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  for (let i = 0; i < 8; i++) ctx.fillRect(0, i * 32 + 29, 256, 3); // course shadow line
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

// Equirectangular sky-over-ground gradient for the window glass to reflect.
function skyTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const ctx = c.getContext('2d'),
    g = ctx.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, '#5f86ad');
  g.addColorStop(0.46, '#dfe8ef');
  g.addColorStop(0.5, '#9a9d8e');
  g.addColorStop(1, '#4f5548');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
}

// Unit box whose UVs come from map(normal, x, y, z) in metres (x, y, z local, -0.5..0.5), divided
// by the texture's tile size, so textures keep their scale and line up across pieces.
function uvBox(tile, map) {
  const g = new THREE.BoxGeometry(1, 1, 1),
    { position: p, normal: n, uv } = g.attributes;
  for (let i = 0; i < uv.count; i++) {
    const [u, v] = map([n.getX(i), n.getY(i), n.getZ(i)], p.getX(i), p.getY(i), p.getZ(i));
    uv.setXY(i, u / tile, v / tile);
  }
  return g;
}
export function createHouse() {
  const house = new THREE.Group();
  house.name = 'West_Fraser_Material_House';
  const parts = [],
    wood = texture('wood'),
    osb = texture('osb');
  const mats = {};
  for (const p of products)
    mats[p.id] = new THREE.MeshStandardMaterial({
      color: p.color,
      map: ['webstock', 'rim', 'walls'].includes(p.id) ? osb : wood,
      roughness: 0.84,
    });
  mats.siding = new THREE.MeshStandardMaterial({
    color: '#7c8892',
    map: lapTexture(),
    roughness: 0.85,
  });
  mats.trim = new THREE.MeshStandardMaterial({ color: '#f5f2e5', roughness: 0.75 });
  mats.shingle = new THREE.MeshStandardMaterial({
    color: '#4d5655',
    map: shingleTexture(),
    roughness: 1,
  });
  mats.base = new THREE.MeshStandardMaterial({ color: '#a7aaa1', roughness: 1 });
  // Clear glass: see-through, tinted, reflecting a sky gradient; it casts no shadow.
  mats.glass = new THREE.MeshStandardMaterial({
    color: '#1d272c',
    roughness: 0.05,
    envMap: skyTexture(),
    envMapIntensity: 2,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  // West Fraser OSB has a green edge seal. OSB parts use a panel geometry whose two broad faces
  // take the product material and whose four edges take a green edge material (one per product,
  // so selection dims and highlights the edges with their product).
  const OSB = ['webstock', 'rim', 'walls'];
  for (const id of OSB) {
    mats[`${id}Edge`] = new THREE.MeshStandardMaterial({
      name: 'OSB edge seal',
      color: '#08564f',
      roughness: 0.6,
    });
    mats[`${id}Edge`].userData.product = id;
  }
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  // Unit boxes regrouped as [2 broad faces, 4 edges], one per thin axis (x, y, z). BoxGeometry
  // builds its faces in +x, -x, +y, -y, +z, -z order, 6 indices each.
  const panelGeos = [0, 1, 2].map((k) => {
    const g = new THREE.BoxGeometry(1, 1, 1),
      idx = Array.from(g.index.array),
      faces = [2 * k, 2 * k + 1, ...[0, 1, 2, 3, 4, 5].filter((f) => f >> 1 !== k)];
    g.setIndex(faces.flatMap((f) => idx.slice(f * 6, f * 6 + 6)));
    g.clearGroups();
    g.addGroup(0, 12, 0);
    g.addGroup(12, 24, 1);
    return g;
  });
  function box(id, x, y, z, w, h, d, opts = {}) {
    const { geo, ...data } = opts; // geo: a non-box geometry (gables); kept out of userData
    // OSB: the thinnest axis is the panel thickness. A gable's ExtrudeGeometry already groups
    // its caps (0) and sides (1), so it takes the same [face, edge] materials.
    const osb = OSB.includes(id),
      thin = [w, h, d].indexOf(Math.min(w, h, d));
    const mesh = new THREE.Mesh(
      geo ?? (osb ? panelGeos[thin] : boxGeo),
      osb ? [mats[id], mats[`${id}Edge`]] : mats[id],
    );
    mesh.scale.set(w, h, d);
    mesh.position.set(x, y, z);
    if (opts.rot) mesh.rotation.set(...opts.rot);
    mesh.castShadow = id !== 'glass';
    mesh.receiveShadow = true;
    mesh.name = `${id}_${parts.length.toString().padStart(4, '0')}`;
    const p = products.find((p) => p.id === id);
    mesh.userData = {
      product: id,
      stage: p?.stage ?? (id === 'base' ? 0 : 0.92),
      cut: !!opts.cut,
      ...data,
    };
    mesh.userData.basePosition = mesh.position.toArray();
    mesh.userData.baseScale = mesh.scale.toArray();
    mesh.userData.baseQuaternion = mesh.quaternion.toArray();
    house.add(mesh);
    parts.push(mesh);
    return mesh;
  }
  function beam(id, a, b, width = 0.1, depth = 0.15, opts = {}) {
    const av = new THREE.Vector3(...a),
      bv = new THREE.Vector3(...b),
      mid = av.clone().add(bv).multiplyScalar(0.5);
    const mesh = box(id, mid.x, mid.y, mid.z, width, av.distanceTo(bv), depth, opts);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), bv.sub(av).normalize());
    mesh.userData.baseQuaternion = mesh.quaternion.toArray();
    return mesh;
  }
  // Three intersecting volumes: garage, tall main house and right wing.
  box('base', 0, 0.03, 0, 12, 0.25, 7.5);
  box('base', 7.8, 0.03, 0.725, 3.6, 0.25, 8.65); // deck slab, butting the house base
  // notch = [x0, x1, zN] leaves x0..x1 out of the floor from zN to the front (+z) edge, framed
  // with its own rims (the porch recess).
  function floor(x, z, w, d, y, notch = null) {
    const inNotch = (xx, zz) => notch && xx > notch[0] && xx < notch[1] && zz > notch[2];
    // Joists run between the rims; end rims butt between the side rims so corners don't overlap.
    for (let xx = x - w / 2 + 0.24; xx + 0.065 <= x + w / 2 - 0.0375; xx += 0.49) {
      if (notch && [notch[0], notch[1]].some((e) => Math.abs(xx - e) < 0.065 + 0.0375)) continue;
      const z0 = z - d / 2 + 0.0375,
        z1 = inNotch(xx, z + d / 2) ? notch[2] - 0.0375 : z + d / 2 - 0.0375;
      box('webstock', xx, y, (z0 + z1) / 2, 0.06, 0.25, z1 - z0);
      box('framing', xx, y + 0.15, (z0 + z1) / 2, 0.13, 0.055, z1 - z0);
      box('framing', xx, y - 0.15, (z0 + z1) / 2, 0.13, 0.055, z1 - z0);
    }
    const rimX = (a, b, zz) => box('rim', (a + b) / 2, y, zz, b - a, 0.355, 0.075),
      rimZ = (xx, a, b) => box('rim', xx, y, (a + b) / 2, 0.075, 0.355, b - a),
      xa = x - w / 2 - 0.0375,
      xb = x + w / 2 + 0.0375;
    rimX(xa, xb, z - d / 2);
    if (notch) {
      rimX(xa, notch[0] + 0.0375, z + d / 2);
      rimX(notch[1] - 0.0375, xb, z + d / 2);
      rimX(notch[0] - 0.0375, notch[1] + 0.0375, notch[2]);
      for (const e of [notch[0], notch[1]]) rimZ(e, notch[2] + 0.0375, z + d / 2 - 0.0375);
    } else rimX(xa, xb, z + d / 2);
    for (const xx of [x - w / 2, x + w / 2]) rimZ(xx, z - d / 2 + 0.0375, z + d / 2 - 0.0375);
    for (let xx = x - w / 2; xx < x + w / 2 - 0.1; xx += 1.2)
      for (let zz = z - d / 2; zz < z + d / 2 - 0.1; zz += 2.4) {
        const pw = Math.min(1.2, x + w / 2 - xx),
          pd = Math.min(2.4, z + d / 2 - zz);
        // Panels crossing the notch edges are split and the part inside the notch left out.
        const xs = [xx, xx + pw, ...(notch ?? []).slice(0, 2).filter((e) => e > xx && e < xx + pw)],
          zs = [zz, zz + pd, ...(notch && notch[2] > zz && notch[2] < zz + pd ? [notch[2]] : [])];
        xs.sort((a, b) => a - b);
        zs.sort((a, b) => a - b);
        for (let i = 0; i < xs.length - 1; i++)
          for (let j = 0; j < zs.length - 1; j++) {
            const [a, b, c, e] = [xs[i], xs[i + 1], zs[j], zs[j + 1]];
            if (inNotch((a + b) / 2, (c + e) / 2)) continue;
            box('floor', (a + b) / 2, y + 0.2, (c + e) / 2, b - a - 0.018, 0.065, e - c - 0.018);
          }
      }
  }
  floor(0, 0, 11.6, 7, 0.42, [-1.6, 1.6, 2.7]); // porch recess left out
  // The 2nd storey sits on the ground walls: its joists and rim bear on the double top plate
  // (wall base 0.66 + 2.7 + half a plate), and its walls stand on its subfloor.
  const upperFloor = 0.66 + 2.7 + 0.0425 + 0.1775,
    upperWall = upperFloor + 0.2325 + 0.0425;
  floor(0, -0.4, 4.4, 6.2, upperFloor); // flush with the ground-floor back wall
  // opts.out overrides which side the sheathing faces (default: away from the house centre);
  // opts.sheathEnds / sidingEnds = [start, end] override how far sheathing / siding run past each
  // end (inside corners); opts.siding = [from, to] is the siding's height range relative to y.
  function wall(x, z, length, y, height, axis = 'x', openings = [], cut = false, opts = {}) {
    const horizontal = (along, yy, w, h, id = 'framing', dep = 0.14) =>
      axis === 'x' ? box(id, x + along, yy, z, w, h, dep) : box(id, x, yy, z + along, dep, h, w);
    // Framing butts rather than overlaps. Walls along z sit between walls along x, so x-wall
    // framing runs half a stud depth past each end and z-wall framing stops half a depth short.
    const SW = 0.075, // stud width
      PT = 0.085, // plate thickness
      end = length / 2 + (axis === 'x' ? 0.07 : -0.07),
      bottom = y + PT / 2, // top of the bottom plate
      top = y + height - PT * 1.5; // underside of the double top plate
    const stud = (u, from, to) => to - from > 0.02 && horizontal(u, (from + to) / 2, SW, to - from);
    // Bottom plate stops at door openings; double top plate runs through.
    let from = -end;
    for (const o of openings.filter((o) => o[2] <= 0.12).sort((a, b) => a[0] - b[0])) {
      horizontal((from + o[0]) / 2, y, o[0] - from, PT, 'plates');
      from = o[1];
    }
    horizontal((from + end) / 2, y, end - from, PT, 'plates');
    for (const yy of [y + height - PT, y + height]) horizontal(0, yy, end * 2, PT, 'plates');
    // Common studs on a 0.4 grid plus an end stud each side; skip any that clash with a
    // king/jack pair, and keep only cripples that fit fully inside an opening.
    const clashes = (u) =>
      openings.some((o) => u + SW / 2 > o[0] - 2 * SW && u - SW / 2 < o[1] + 2 * SW);
    const studs = [];
    const add = (u) => {
      if (u - SW / 2 < -end - 1e-6 || u + SW / 2 > end + 1e-6) return;
      if (studs.every((v) => Math.abs(v - u) >= SW - 1e-6)) studs.push(u);
    };
    add(-end + SW / 2);
    add(end - SW / 2);
    for (let u = axis === 'x' ? -length / 2 + 0.05 : -end + SW / 2; u < end; u += 0.4) add(u);
    for (const u of studs) {
      const op = openings.find((o) => u - SW / 2 >= o[0] && u + SW / 2 <= o[1]);
      if (op) {
        if (op[2] > 0.12) stud(u, bottom, y + op[2] - 0.09);
        stud(u, y + op[3] + 0.24, top);
      } else if (!clashes(u)) stud(u, bottom, top);
    }
    for (const [u0, u1, sill, head] of openings) {
      horizontal((u0 + u1) / 2, y + head + 0.12, u1 - u0 + 2 * SW, 0.24, 'lvl'); // header on jacks
      if (sill > 0.12) horizontal((u0 + u1) / 2, y + sill - 0.045, u1 - u0, 0.09); // rough sill
      for (const [jack, king] of [
        [u0 - SW / 2, u0 - SW * 1.5],
        [u1 + SW / 2, u1 + SW * 1.5],
      ]) {
        stud(jack, bottom, y + head);
        stud(king, bottom, top);
      }
    }
    // Sheet strips subdivided at opening edges preserve real holes. Sheathing sits on the
    // outside face (away from the house centre); walls along x run it past the corners and walls
    // along z butt into it, matching the framing.
    const out = opts.out ?? (Math.sign(axis === 'x' ? z : x) || 1),
      [e0, e1] = opts.sheathEnds ?? Array(2).fill(axis === 'x' ? 0.1225 : 0.0775);
    const breaks = [-length / 2 - e0, length / 2 + e1, ...openings.flatMap((o) => [o[0], o[1]])];
    for (let a = -length / 2 + 1.2; a < length / 2; a += 1.2) breaks.push(a);
    breaks.sort((a, b) => a - b);
    for (let i = 0; i < breaks.length - 1; i++) {
      const a = breaks[i],
        b = breaks[i + 1];
      if (b - a < 0.01) continue;
      const op = openings.find((o) => (a + b) / 2 > o[0] && (a + b) / 2 < o[1]);
      const spans = op
        ? [
            [0, op[2]],
            [op[3] + 0.13, height],
          ]
        : [[0, height]];
      for (const [low, high] of spans) {
        if (high - low < 0.05) continue;
        const mesh = horizontal(
          (a + b) / 2,
          y + (low + high) / 2,
          b - a - 0.015,
          high - low - 0.015,
          'walls',
          0.045,
        );
        if (axis === 'x') mesh.position.z += 0.1 * out;
        else mesh.position.x += 0.1 * out;
        mesh.userData.basePosition = mesh.position.toArray();
        mesh.userData.cut = cut;
        // Edges stay green on strips narrower than the sheathing is thick.
        mesh.geometry = panelGeos[axis === 'x' ? 2 : 0];
      }
    }
    // Lap siding over the sheathing, split around the openings. Courses follow world height so
    // they line up across walls. Walls along x carry it past outside corners.
    const onFace = (id, u, yy, w, h, n, dep, o) =>
      axis === 'x'
        ? box(id, x + u, yy, z + n * out, w, h, dep, o)
        : box(id, x + n * out, yy, z + u, dep, h, w, o);
    const [s0, s1] = opts.siding ?? [y < 1 ? -0.49 : -0.0425, height + (axis === 'z' ? 0.03 : 0)],
      [f0, f1] = opts.sidingEnds ?? Array(2).fill(axis === 'x' ? 0.1425 : 0.1225),
      sBreaks = [-length / 2 - f0, length / 2 + f1, ...openings.flatMap((o) => [o[0], o[1]])];
    sBreaks.sort((a, b) => a - b);
    for (let i = 0; i < sBreaks.length - 1; i++) {
      const [a, b] = [sBreaks[i], sBreaks[i + 1]];
      if (b - a < 0.01) continue;
      const op = openings.find((o) => (a + b) / 2 > o[0] && (a + b) / 2 < o[1]);
      for (const [lo, hi] of op
        ? [
            [s0, op[2]],
            [op[3], s1],
          ]
        : [[s0, s1]]) {
        if (hi - lo < 0.05) continue;
        const bw = b - a - 0.004,
          bh = hi - lo,
          yc = y + (lo + hi) / 2,
          [sx, sz] = axis === 'x' ? [bw, 0.02] : [0.02, bw];
        const geo = uvBox(1.28, (nr, X, Y, Z) => [
          Math.abs(nr[0]) > 0.5 ? Z * sz : X * sx,
          Math.abs(nr[1]) > 0.5 ? Z * sz : yc + Y * bh,
        ]);
        onFace('siding', (a + b) / 2, yc, bw, bh, 0.1325, 0.02, { geo, cut });
      }
    }
    // Windows and doors, hiding with the wall on a cut wall (opts.fit false: filled elsewhere,
    // like the garage door). Casings sit on the siding; glass is in the sheathing plane.
    if (opts.fit !== false)
      for (const [u0, u1, sill, head] of openings) {
        const w = u1 - u0,
          mid = (u0 + u1) / 2,
          o = { cut },
          base = Math.max(sill, 0),
          trim = (u, yy, ww, hh, n = 0.155, dep = 0.025) =>
            onFace('trim', u, yy, ww, hh, n, dep, o);
        trim(mid, y + head + 0.045, w + 0.19, 0.09); // head casing
        for (const u of [u0 - 0.045, u1 + 0.045]) trim(u, y + (base + head) / 2, 0.09, head - base);
        if (sill > 0.12) {
          // Double-hung window: sill, glass, two sash frames and muntin grids (two rows per sash).
          trim(mid, y + sill - 0.025, w + 0.24, 0.05, 0.1675, 0.05);
          onFace('glass', mid, y + (sill + head) / 2, w - 0.004, head - sill - 0.004, 0.1, 0.01, o);
          const sash = (u, yy, ww, hh, dep = 0.04) => trim(u, yy, ww, hh, 0.11, dep),
            f = 0.05, // sash frame width
            inW = w - 2 * f,
            cols = Math.round(w / 0.34),
            meet = (sill + head) / 2;
          for (const u of [u0 + f / 2, u1 - f / 2]) sash(u, y + meet, f, head - sill); // stiles
          for (const yy of [sill + f / 2, meet, head - f / 2]) sash(mid, y + yy, inW, f); // rails
          // Muntins; verticals and horizontals differ in depth so their crossings don't z-fight.
          for (const [g0, g1] of [
            [sill + f, meet - f / 2],
            [meet + f / 2, head - f],
          ]) {
            for (let c = 1; c < cols; c++)
              sash(u0 + f + (inW * c) / cols, y + (g0 + g1) / 2, 0.022, g1 - g0, 0.022);
            sash(mid, y + (g0 + g1) / 2, inW, 0.022, 0.018);
          }
        } else {
          const b = y - 0.0075, // subfloor top
            h = y + head - b;
          if (w > 1.5) {
            // Glazed two-panel patio door.
            for (const sd of [-1, 1])
              onFace('glass', mid + (sd * w) / 4, b + h / 2, w / 2 - 0.08, h - 0.12, 0.1, 0.01, o);
            for (const u of [u0 + 0.03, u1 - 0.03]) trim(u, b + h / 2, 0.06, h, 0.1, 0.06);
            trim(mid, b + h / 2, 0.06, h - 0.12, 0.1, 0.06); // meeting stile between the rails
            for (const yy of [b + 0.03, b + h - 0.03]) trim(mid, yy, w - 0.12, 0.06, 0.1, 0.06);
          } else {
            // Front door: a slab framing a glass lite.
            const l0 = y + head - 0.95,
              l1 = y + head - 0.15,
              door = (u, y0, y1, ww) => trim(u, (y0 + y1) / 2, ww, y1 - y0, 0.1, 0.045);
            door(mid, b, l0, w);
            door(mid, l1, y + head, w);
            for (const u of [u0 + 0.075, u1 - 0.075]) door(u, l0, l1, 0.15);
            onFace('glass', mid, (l0 + l1) / 2, w - 0.3, 0.8, 0.1, 0.01, o);
          }
        }
      }
  }
  wall(-3.7, 3.5, 4.2, 0.66, 2.7, 'x', [[-1.7, 1.7, 0, 2.18]], false, { fit: false });
  wall(-5.8, 0, 7, 0.66, 2.7, 'z', [[-0.5, 0.7, 1.1, 2.15]]);
  wall(0, -3.5, 11.6, 0.66, 2.7, 'x', [
    [-4, -2.7, 1, 2.1],
    [0.2, 1.4, 1, 2.1],
    [3.3, 4.5, 1, 2.1],
  ]);
  wall(
    5.8,
    0,
    7,
    0.66,
    2.7,
    'z',
    [
      [-2.3, -1.1, 1, 2.1],
      [0.9, 2.1, 1, 2.1],
    ],
    true,
    { siding: [-0.015, 2.73] },
  );
  wall(3.7, 3.5, 4.2, 0.66, 2.7, 'x', [[-1, 1, 0, 2.2]], true);
  wall(
    0,
    2.7,
    3.2,
    0.66,
    2.7,
    'x',
    [
      [-1.25, -0.35, 0, 2.18],
      [0.25, 1.25, 0.9, 2.1],
    ],
    true,
    { sheathEnds: [-0.07, -0.07], siding: [-0.025, 2.7], sidingEnds: [-0.1225, -0.1225] },
  );
  // Return walls close the recess sides; their sheathing faces the porch and starts at the recess
  // wall's sheathing face (inside corner).
  wall(-1.6, 3.1, 0.8, 0.66, 2.7, 'z', [], false, {
    out: 1,
    sheathEnds: [-0.1225, 0.0775],
    siding: [-0.025, 2.7],
    sidingEnds: [-0.1425, 0.1225],
  });
  wall(1.6, 3.1, 0.8, 0.66, 2.7, 'z', [], true, {
    out: -1,
    sheathEnds: [-0.1225, 0.0775],
    siding: [-0.025, 2.7],
    sidingEnds: [-0.1425, 0.1225],
  });
  wall(
    0,
    2.7,
    4.4,
    upperWall,
    2.65,
    'x',
    [
      [-1.5, -0.45, 0.8, 1.95],
      [0.45, 1.5, 0.8, 1.95],
    ],
    true,
    { siding: [-0.035, 2.65] },
  );
  wall(0, -3.5, 4.4, upperWall, 2.65, 'x', [[-0.65, 0.65, 0.8, 1.95]], false, {
    siding: [-0.495, 2.65],
  });
  wall(-2.2, -0.4, 6.2, upperWall, 2.65, 'z');
  wall(2.2, -0.4, 6.2, upperWall, 2.65, 'z', [[-1.1, 0.3, 0.8, 1.95]], true);
  // clip = { side, x, z: [zMin, zMax] }: inside that z-range the roof's `side` slope stops at x
  // (an upper storey's wall face), with part trusses; outside it the slope runs to its eave.
  // gables = [{ z, x0, x1, sx0, sx1, yBase }]: gable-end sheathing (x0..x1) in the end walls'
  // sheathing planes, with siding (sx0..sx1) over it.
  // y is where the bottom chords bear (on the walls' double top plate).
  function roof(cx, cz, w, d, y, rise, cut = false, clip = null, gables = []) {
    const H = w / 2 + 0.22, // ridge to eave, horizontally
      left = cx - H,
      right = cx + H,
      cosA = Math.cos(Math.atan2(rise, H)),
      E = H - 0.1; // chord tails stop behind the fascia
    const fc = clip ? Math.abs(clip.x - cx) / H : 1, // clip line as a fraction ridge -> eave
      clipped = (z0, z1) => clip && z1 > clip.z[0] && z0 < clip.z[1];
    // Same truss count as before, spread so the end trusses sit on the end walls.
    const n = Math.floor((d + 0.45) / 0.54);
    for (let i = 0; i <= n; i++) {
      const z = cz - d / 2 + (d * i) / n,
        s = clipped(z - 0.07, z + 0.07) ? clip.side : 0,
        apex = [cx, y + rise, z],
        stop = [clip?.x, y + rise * (1 - fc), z],
        tail = y + rise * (1 - E / H);
      // Part truss on the clipped side: its top chord and the bottom chord end at the wall face.
      beam('trusses', s === -1 ? stop : [cx - E, tail, z], apex, 0.1, 0.14);
      beam('trusses', apex, s === 1 ? stop : [cx + E, tail, z], 0.1, 0.14);
      beam(
        'trusses',
        s === -1 ? [clip.x, y, z] : [cx - E, y, z],
        s === 1 ? [clip.x, y, z] : [cx + E, y, z],
        0.1,
        0.14,
      );
      beam('trusses', [cx, y, z], apex, 0.075, 0.1);
      for (const side of [-1, 1])
        if (side !== s || w * 0.28 < fc * H - 0.05)
          beam('trusses', [cx + side * w * 0.28, y + rise * 0.43, z], [cx, y, z], 0.075, 0.1);
    }
    for (const side of [-1, 1]) {
      const slopeW = Math.sqrt(H ** 2 + rise ** 2),
        angle = Math.atan2(rise, H) * side,
        onClip = clip?.side === side;
      // Panel or strip spanning fractions a..b (ridge -> eave) of this slope.
      const piece = (id, a, b, lift, thick, z0, z1, gapW, gapD, cutPiece) =>
        box(
          id,
          cx + side * H * ((a + b) / 2),
          y + rise * (1 - (a + b) / 2) + lift,
          (z0 + z1) / 2,
          slopeW * (b - a) - gapW,
          thick,
          z1 - z0 - gapD,
          { rot: [0, 0, -angle], cut: cutPiece },
        );
      const zs = [];
      for (let z = cz - d / 2 - 0.25; z < cz + d / 2 + 0.24; z += 1.2) zs.push(z);
      zs.push(cz + d / 2 + 0.25);
      if (onClip) for (const zc of clip.z) if (zc > zs[0] && zc < zs.at(-1)) zs.push(zc);
      zs.sort((a, b) => a - b);
      for (let i = 0; i < zs.length - 1; i++) {
        const [z0, z1] = [zs[i], zs[i + 1]];
        if (z1 - z0 < 0.01) continue;
        for (let row = 0; row < 2; row++) {
          const b = onClip && clipped(z0, z1) ? Math.min((row + 1) / 2, fc) : (row + 1) / 2;
          if (b - row / 2 > 0.01)
            piece('roof', row / 2, b, 0.05, 0.055, z0, z1, 0.018, 0.018, cut && side === 1);
        }
      }
      // Shingles: one textured sheet per slope, split only where the slope is clipped. Every slope
      // is shingled; on a cut roof the cut side's shingles hide with its sheathing. UVs run along
      // the ridge (u) and up from the eave (v) so the courses line up across sheets.
      const zA = cz - d / 2 - 0.26,
        zB = cz + d / 2 + 0.26;
      const sheet = (a, b, z0, z1) => {
        const dz = z1 - z0,
          zc = (z0 + z1) / 2,
          len = slopeW * (b - a);
        const geo = uvBox(1, (nr, X, Y, Z) => [
          zc + Z * dz,
          slopeW * (side === 1 ? 1 - a - (X + 0.5) * (b - a) : 1 - b + (X + 0.5) * (b - a)),
        ]);
        box(
          'shingle',
          cx + side * H * ((a + b) / 2),
          y + rise * (1 - (a + b) / 2) + 0.095,
          zc,
          len,
          0.035,
          dz,
          {
            rot: [0, 0, -angle],
            cut: cut && side === 1,
            geo,
          },
        );
      };
      if (!onClip) sheet(0, 1, zA, zB);
      else {
        // Beyond the clip line the slope only exists in front of and behind the upper storey.
        if (clip.z[0] > zA) sheet(0, 1, zA, clip.z[0]);
        if (clip.z[1] < zB) sheet(0, 1, clip.z[1], zB);
        sheet(0, fc, clip.z[0], clip.z[1]);
      }
      // Fascia on the truss tails, tucked under the deck edge, between the rake boards. On a
      // clipped slope it only runs where the eave exists and stops on the wall plate below.
      const fTop = y + rise * (0.035 / H) + 0.05 - 0.0275 / cosA - 0.005,
        fBot = y - (onClip ? 0.05 : 0.07),
        fz = [cz - d / 2 - 0.17, cz + d / 2 + 0.17];
      for (const [a, b] of onClip
        ? [
            [fz[0], clip.z[0]],
            [clip.z[1], fz[1]],
          ]
        : [fz])
        if (b - a > 0.05)
          box(
            'trim',
            cx + side * (H - 0.0475),
            (fTop + fBot) / 2,
            (a + b) / 2,
            0.025,
            fTop - fBot,
            b - a,
            {
              cut: cut && side === 1,
            },
          );
    }
    for (const z of [cz - d / 2 - 0.25, cz + d / 2 + 0.25]) {
      beam('trim', [left, y + 0.03, z], [cx, y + rise + 0.03, z], 0.14, 0.16, { cut });
      beam('trim', [cx, y + rise + 0.03, z], [right, y + 0.03, z], 0.14, 0.16, { cut });
    }
    // Gable sheathing from the wall sheathing up to the top of the end truss's chords, with siding
    // over it (courses keyed to world height like the walls').
    const topAt = (x) => y + rise * (1 - Math.abs(x - cx) / H) + 0.05 / cosA - 0.005;
    const gablePanel = (id, x0, x1, yBase, z, depth, o = {}) => {
      const pts = [
        [x0, yBase],
        [x1, yBase],
        [x1, topAt(x1)],
        ...(x0 < cx && cx < x1 ? [[cx, topAt(cx)]] : []),
        [x0, topAt(x0)],
      ];
      const mx = (x0 + x1) / 2,
        my = (yBase + Math.max(...pts.map((p) => p[1]))) / 2;
      const geo = new THREE.ExtrudeGeometry(
        new THREE.Shape(pts.map(([px, py]) => new THREE.Vector2(px - mx, py - my))),
        { depth, bevelEnabled: false },
      );
      geo.translate(0, 0, -depth / 2);
      if (id === 'siding') {
        const { position: p, uv } = geo.attributes;
        for (let k = 0; k < uv.count; k++)
          uv.setXY(k, (p.getX(k) + mx) / 1.28, (p.getY(k) + my) / 1.28);
      }
      box(id, mx, my, z, 1, 1, 1, { geo, ...o });
    };
    for (const { z, x0, x1, sx0, sx1, yBase } of gables) {
      gablePanel('walls', x0, x1, yBase, z, 0.045);
      gablePanel('siding', sx0, sx1, yBase, z + Math.sign(z - cz) * 0.0325, 0.02, { cut });
    }
  }
  // The lower roofs stop at the 2nd storey's siding faces
  // where it sits over them, and run full to their inner eaves in front of it.
  const upperZ = [-3.5 - 0.1425, 2.7 + 0.1425];
  // Bottom chords bear on the walls' double top plate; gables sit in the end walls' sheathing
  // planes (z +-0.1 outside the wall lines) above the wall sheathing.
  const plateTop = (base, h) => base + h + 0.0425 + 0.05,
    groundGable = 0.66 + 2.7,
    upperGable = upperWall + 2.65;
  roof(-3.8, 0, 4, 7, plateTop(0.66, 2.7), 1.85, false, { side: 1, x: -2.3425, z: upperZ }, [
    { z: 3.6, x0: -5.9225, x1: -1.58, sx0: -5.9425, sx1: -1.58, yBase: groundGable },
    { z: -3.6, x0: -5.9225, x1: -2.3225, sx0: -5.9425, sx1: -2.3425, yBase: groundGable },
  ]);
  roof(0, -0.4, 4.4, 6.2, plateTop(upperWall, 2.65), 1.9, true, null, [
    { z: 2.8, x0: -2.3225, x1: 2.3225, sx0: -2.3425, sx1: 2.3425, yBase: upperGable },
    { z: -3.6, x0: -2.3225, x1: 2.3225, sx0: -2.3425, sx1: 2.3425, yBase: upperGable },
  ]);
  roof(3.9, 0, 3.8, 7, plateTop(0.66, 2.7), 2.15, true, { side: -1, x: 2.3425, z: upperZ }, [
    { z: 3.6, x0: 1.78, x1: 5.9225, sx0: 1.78, sx1: 5.9425, yBase: groundGable },
    { z: -3.6, x0: 2.3225, x1: 5.9225, sx0: 2.3425, sx1: 5.9425, yBase: groundGable },
  ]);
  // Garage door.
  // The slab fills the opening up to the header, open behind the glazed top row.
  const lite = [2.245, 2.635];
  box('trim', -3.7, (0.67 + lite[0]) / 2, 3.62, 3.35, lite[0] - 0.67, 0.07);
  box('trim', -3.7, (lite[1] + 2.84) / 2, 3.62, 3.35, 2.84 - lite[1], 0.07);
  for (let col = 0; col <= 6; col++) {
    const x0 = col ? -4.835 + (col - 1) * 0.55 : -5.375,
      x1 = col < 6 ? -5.325 + col * 0.55 : -2.025;
    box('trim', (x0 + x1) / 2, (lite[0] + lite[1]) / 2, 3.62, x1 - x0, lite[1] - lite[0], 0.07);
  }
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 6; col++)
      box(
        row === 3 ? 'glass' : 'trim',
        -5.08 + col * 0.55,
        0.94 + row * 0.5,
        3.67,
        0.49,
        0.39,
        0.035,
      );
  // Corner boards at the outside corners, a little proud of the siding.
  for (const [cx, cz, sx, sz, y0, y1, cut] of [
    [-5.8, 3.5, -1, 1, 0.17, 3.36, false],
    [-5.8, -3.5, -1, -1, 0.17, 3.36, false],
    [5.8, -3.5, 1, -1, 0.17, 3.36, true],
    [5.8, 3.5, 1, 1, 0.645, 3.36, true],
    [-1.6, 3.5, 1, 1, 0.63, 3.36, false],
    [1.6, 3.5, -1, 1, 0.63, 3.36, true],
    [-2.2, 2.7, -1, 1, 4.2, upperWall + 2.65, true],
    [2.2, 2.7, 1, 1, 4.2, upperWall + 2.65, true],
    [2.2, -3.5, 1, -1, 4.2, upperWall + 2.65, true],
    [-2.2, -3.5, -1, -1, 4.2, upperWall + 2.65, false],
  ])
    box('trim', cx + sx * 0.1075, (y0 + y1) / 2, cz + sz * 0.1075, 0.09, y1 - y0 + 0.02, 0.09, {
      cut,
    });
  // Front porch: a deck just below the interior floor on treated joists, skirted down to a slab,
  // with steps in line with the front door. Its shed roof hangs from a ledger on the 2nd-floor rim,
  // rests on a beam over three posts, and fits between the garage and right-wing eaves.
  const porchTop = 0.63,
    porchFront = 5.1,
    recessFace = 2.7 + 0.1425, // recess wall siding
    frontFace = 3.5 + 0.1425, // garage / right-wing front wall siding
    ledgerFace = 2.8125; // porch-roof ledger on the 2nd-floor rim
  box('base', 0, 0.03, 4.4125, 3.9, 0.25, 1.325); // porch slab, continuing the house base
  for (let k = -8; k <= 8; k++) {
    const x = k * 0.2275,
      z0 = (Math.abs(k) <= 6 ? recessFace : frontFace) + 0.005;
    box('deck', x, porchTop - 0.055, (z0 + porchFront) / 2, 0.205, 0.11, porchFront - z0);
  }
  for (const z of [2.95, 3.35]) box('deck', 0, porchTop - 0.205, z, 3.125, 0.19, 0.045); // recess
  for (const z of [3.7, 4.15, 4.6, 5.0]) box('deck', 0, porchTop - 0.205, z, 3.725, 0.19, 0.045);
  const skirtY = (0.155 + porchTop - 0.11) / 2,
    skirtH = porchTop - 0.11 - 0.155;
  for (const x of [-1.8875, 1.8875])
    box('deck', x, skirtY, (frontFace + 5.025) / 2, 0.05, skirtH, 5.025 - frontFace);
  box('deck', 0, skirtY, 5.05, 3.825, skirtH, 0.05);
  for (let i = 1; i <= 3; i++) {
    const top = porchTop - 0.19 * i;
    box('deck', -0.8, (top - 0.13) / 2, 5.075 + 0.28 * (i - 0.5), 1.1, top + 0.13, 0.28);
  }
  const beamTop = 3.24,
    slope = (3.58 - beamTop) / (4.9 - ledgerFace),
    rafterBottom = (z) => 3.58 - slope * (z - ledgerFace);
  // Treated posts (shown in the wood-only view) inside white post wraps (a finish).
  for (const x of [-1.45, 0.1, 1.65]) {
    const postY = (porchTop + beamTop - 0.24) / 2,
      postH = beamTop - 0.24 - porchTop;
    box('deck', x, postY, 4.9, 0.13, postH, 0.13);
    box('trim', x, postY, 4.9, 0.15, postH, 0.15);
  }
  box('lvl', 0.1, beamTop - 0.12, 4.9, 3.3, 0.24, 0.14);
  box('framing', 0.1, 3.58, 2.775, 3.3, 0.24, 0.075); // ledger on the 2nd-floor rim
  const c = Math.cos(Math.atan(slope)),
    z0 = ledgerFace,
    z1 = porchFront + 0.02;
  for (const x of [-1.5, -0.7, 0.1, 0.9, 1.7])
    beam(
      'framing',
      [x, rafterBottom(z0) + 0.07 / c, z0],
      [x, rafterBottom(z1) + 0.07 / c, z1],
      0.045,
      0.14,
    );
  const deckY = (z) => rafterBottom(z) + 0.14 / c + 0.0275 / c,
    zm = (z0 + z1 + 0.02) / 2;
  for (const [a, b] of [
    [z0, zm],
    [zm, z1 + 0.02],
  ])
    box('roof', 0.1, deckY((a + b) / 2), (a + b) / 2, 3.31, 0.055, (b - a) / c - 0.018, {
      rot: [Math.atan(slope), 0, 0],
      cut: true,
    });
  const pLen = (z1 + 0.02 - z0) / c,
    pz = (z0 + z1 + 0.02) / 2;
  box('shingle', 0.1, deckY(pz) + 0.045 / c, pz, 3.31, 0.035, pLen, {
    rot: [Math.atan(slope), 0, 0],
    cut: true,
    geo: uvBox(1, (nr, X, Y, Z) => [0.1 + X * 3.31, pLen * (0.5 - Z)]),
  });
  box('trim', 0.1, rafterBottom(z1) + 0.05, z1 + 0.0325, 3.35, 0.2, 0.025, { cut: true }); // fascia
  for (let x = 6.045; x < 9.35; x += 0.2) box('deck', x, 0.58, 0.8, 0.188, 0.12, 8.25);
  for (const z of [-3.3, 4.93]) {
    box('deck', 7.68, 0.33, z, 3.68, 0.35, 0.12);
    for (const x of [6.02, 7.65, 9.32]) box('deck', x, 1.15, z, 0.13, 1.25, 0.13);
    box('deck', 7.68, 1.77, z, 3.44, 0.1, 0.16);
    box('deck', 7.68, 0.83, z, 3.44, 0.08, 0.09);
    for (let x = 6.1; x < 9.3; x += 0.22) box('deck', x, 1.28, z, 0.055, 0.86, 0.055);
  }
  for (const z of [-1.25, 0.8, 2.85]) box('deck', 9.32, 1.15, z, 0.13, 1.25, 0.13);
  for (let z = -3.2; z < 4.9; z += 0.22) box('deck', 9.32, 1.28, z, 0.055, 0.86, 0.055);
  box('deck', 9.32, 1.77, 0.815, 0.16, 0.1, 8.07);
  box('deck', 9.32, 0.83, 0.815, 0.09, 0.08, 8.14);
  box('deck', 9.32, 0.33, 0.815, 0.12, 0.35, 8.11);
  // Interior MDF cabinets (carcass, front, top) and pulls; structural products stay independent.
  // An island about 1 m behind the right wing's front wall, doors facing its framed opening
  // (as in the reference).
  for (let x = 2.6; x < 5.1; x += 0.65) {
    box('mdf', x, 1.15, 2.05, 0.6, 0.94, 0.6);
    box('mdf', x, 1.16, 2.37, 0.56, 0.85, 0.04);
    box('mdf', x, 1.66, 2.06, 0.65, 0.065, 0.7);
    box('trim', x + 0.17, 1.33, 2.406, 0.025, 0.16, 0.025);
  }
  house.position.x = -1;
  return { house, parts, products, mats };
}
