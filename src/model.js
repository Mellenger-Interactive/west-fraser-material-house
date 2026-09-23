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
    name: 'LVL headers',
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
    name: 'Interior finishes',
    type: 'MDF',
    color: '#e8d7b3',
    stage: 0.91,
    desc: 'Medium-density fibreboard is used for interior trim and cabinetry. Select this material to reveal the simplified cabinet and interior trim elements.',
  },
  {
    id: 'particle',
    name: 'Cabinet cores',
    type: 'PARTICLEBOARD',
    color: '#bda67d',
    stage: 0.96,
    desc: 'Particleboard is another West Fraser panel family. A cabinet-core application is illustrated here to extend the supplied house reference; product specifications and availability vary by region.',
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
      map: ['webstock', 'rim', 'walls', 'particle'].includes(p.id) ? osb : wood,
      roughness: 0.84,
    });
  mats.context = new THREE.MeshStandardMaterial({ color: '#687c7d', roughness: 0.9 });
  mats.trim = new THREE.MeshStandardMaterial({ color: '#f5f2e5', roughness: 0.75 });
  mats.shingle = new THREE.MeshStandardMaterial({ color: '#414948', roughness: 1 });
  mats.base = new THREE.MeshStandardMaterial({ color: '#a7aaa1', roughness: 1 });
  mats.glass = new THREE.MeshStandardMaterial({
    color: '#819b9a',
    metalness: 0.2,
    roughness: 0.24,
  });
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  function box(id, x, y, z, w, h, d, opts = {}) {
    const mesh = new THREE.Mesh(boxGeo, mats[id]);
    mesh.scale.set(w, h, d);
    mesh.position.set(x, y, z);
    if (opts.rot) mesh.rotation.set(...opts.rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = `${id}_${parts.length.toString().padStart(4, '0')}`;
    const p = products.find((p) => p.id === id);
    mesh.userData = {
      product: id,
      stage: p?.stage ?? (id === 'base' ? 0 : 0.92),
      cut: !!opts.cut,
      ...opts,
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
  box('base', 7.5, 0.02, 0.6, 3.8, 0.22, 8.3);
  function floor(x, z, w, d, y) {
    // Joists run between the rims; end rims butt between the side rims so corners don't overlap.
    for (let xx = x - w / 2 + 0.24; xx + 0.065 <= x + w / 2 - 0.0375; xx += 0.49) {
      box('webstock', xx, y, z, 0.06, 0.25, d - 0.075);
      box('framing', xx, y + 0.15, z, 0.13, 0.055, d - 0.075);
      box('framing', xx, y - 0.15, z, 0.13, 0.055, d - 0.075);
    }
    for (const zz of [z - d / 2, z + d / 2]) box('rim', x, y, zz, w + 0.075, 0.355, 0.075);
    for (const xx of [x - w / 2, x + w / 2]) box('rim', xx, y, z, 0.075, 0.355, d - 0.075);
    for (let xx = x - w / 2; xx < x + w / 2 - 0.1; xx += 1.2)
      for (let zz = z - d / 2; zz < z + d / 2 - 0.1; zz += 2.4) {
        const pw = Math.min(1.2, x + w / 2 - xx),
          pd = Math.min(2.4, z + d / 2 - zz);
        box('floor', xx + pw / 2, y + 0.2, zz + pd / 2, pw - 0.018, 0.065, pd - 0.018);
      }
  }
  floor(0, 0, 11.6, 7, 0.42);
  // The 2nd storey sits on the ground walls: its joists and rim bear on the double top plate
  // (wall base 0.66 + 2.7 + half a plate), and its walls stand on its subfloor.
  const upperFloor = 0.66 + 2.7 + 0.0425 + 0.1775,
    upperWall = upperFloor + 0.2325 + 0.0425;
  floor(0.1, -0.2, 4.4, 5.8, upperFloor);
  function wall(x, z, length, y, height, axis = 'x', openings = [], cut = false) {
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
    const out = Math.sign(axis === 'x' ? z : x) || 1,
      sEnd = length / 2 + (axis === 'x' ? 0.1225 : 0.0775);
    const breaks = [-sEnd, sEnd, ...openings.flatMap((o) => [o[0], o[1]])];
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
      }
    }
  }
  wall(-3.7, 3.5, 4.2, 0.66, 2.7, 'x', [[-1.7, 1.7, 0, 2.18]], false);
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
  );
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
  );
  wall(0, -3.1, 4.4, upperWall, 2.65, 'x', [[-0.65, 0.65, 0.8, 1.95]]);
  wall(-2.2, -0.2, 5.8, upperWall, 2.65, 'z');
  wall(2.2, -0.2, 5.8, upperWall, 2.65, 'z', [[-1.3, 0.1, 0.8, 1.95]], true);
  function roof(cx, cz, w, d, y, rise, cut = false) {
    const left = cx - w / 2 - 0.22,
      right = cx + w / 2 + 0.22;
    for (let z = cz - d / 2 - 0.2; z <= cz + d / 2 + 0.25; z += 0.54) {
      beam('trusses', [left, y, z], [cx, y + rise, z], 0.1, 0.14);
      beam('trusses', [cx, y + rise, z], [right, y, z], 0.1, 0.14);
      beam('trusses', [left, y, z], [right, y, z], 0.1, 0.14);
      beam('trusses', [cx, y, z], [cx, y + rise, z], 0.075, 0.1);
      beam('trusses', [cx - w * 0.28, y + rise * 0.43, z], [cx, y, z], 0.075, 0.1);
      beam('trusses', [cx + w * 0.28, y + rise * 0.43, z], [cx, y, z], 0.075, 0.1);
    }
    for (const side of [-1, 1]) {
      const slopeW = Math.sqrt((w / 2 + 0.22) ** 2 + rise ** 2),
        angle = Math.atan2(rise, w / 2 + 0.22) * side;
      for (let z = cz - d / 2 - 0.25; z < cz + d / 2 + 0.24; z += 1.2) {
        const pd = Math.min(1.2, cz + d / 2 + 0.25 - z);
        for (let row = 0; row < 2; row++) {
          const frac = (row + 0.5) / 2;
          box(
            'roof',
            cx + side * (w / 2 + 0.22) * frac,
            y + rise * (1 - frac) + 0.05,
            z + pd / 2,
            slopeW / 2 - 0.018,
            0.055,
            pd - 0.018,
            { rot: [0, 0, -angle], cut: cut && side === 1 },
          );
        }
      }
      if (!cut || side === -1) {
        for (let j = 0; j < 12; j++) {
          const frac = (j + 0.5) / 12;
          box(
            'shingle',
            cx + side * (w / 2 + 0.22) * frac,
            y + rise * (1 - frac) + 0.095,
            cz,
            slopeW / 12 - 0.008,
            0.035,
            d + 0.52,
            { rot: [0, 0, -angle], cut: cut },
          );
        }
      }
    }
    for (const z of [cz - d / 2 - 0.25, cz + d / 2 + 0.25]) {
      beam('trim', [left, y + 0.03, z], [cx, y + rise + 0.03, z], 0.14, 0.16, { cut });
      beam('trim', [cx, y + rise + 0.03, z], [right, y + 0.03, z], 0.14, 0.16, { cut });
    }
  }
  roof(-3.8, 0, 4, 7, 3.42, 1.85);
  roof(0, -0.2, 4.4, 5.8, upperWall + 2.7, 1.9, true);
  roof(3.9, 0, 3.8, 7, 3.42, 2.15, true);
  // Garage door and limited finished siding retain the reference's cutaway identity.
  box('trim', -3.7, 1.755, 3.62, 3.35, 2.17, 0.07); // fills the opening up to the header
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
  for (let yy = upperWall + 0.04; yy < upperWall + 2.58; yy += 0.16)
    box('context', -2.356, yy, -0.2, 0.065, 0.143, 5.8);
  for (let yy = 0.8; yy < 3.35; yy += 0.16) box('context', -5.945, yy, 0, 0.04, 0.145, 7);
  // Front porch with shed roof and separate boards.
  for (let x = -1.95; x <= 1.95; x += 0.22) box('deck', x, 0.6, 3.9, 0.205, 0.11, 2.2);
  for (const x of [-2, 0, 2]) box('trim', x, 1.9, 4.9, 0.15, 2.55, 0.15);
  for (let z = 2.9; z < 5; z += 0.52)
    box('roof', 0, 3.48 - (z - 2.9) * 0.2, z + 0.24, 4.5, 0.06, 0.54, {
      rot: [-0.197, 0, 0],
      cut: true,
    });
  box('deck', 0, 0.38, 5.07, 4.25, 0.3, 0.2);
  for (let x = 6.02; x < 9.35; x += 0.2) box('deck', x, 0.58, 0.8, 0.188, 0.12, 8.25);
  for (const z of [-3.3, 4.93]) {
    box('deck', 7.67, 0.34, z, 3.7, 0.33, 0.12);
    for (const x of [5.98, 7.65, 9.32]) box('deck', x, 1.15, z, 0.13, 1.25, 0.13);
    box('deck', 7.65, 1.77, z, 3.5, 0.1, 0.16);
    box('deck', 7.65, 0.83, z, 3.5, 0.08, 0.09);
    for (let x = 6.1; x < 9.3; x += 0.22) box('deck', x, 1.28, z, 0.055, 0.86, 0.055);
  }
  for (const z of [-1.25, 0.8, 2.85]) box('deck', 9.32, 1.15, z, 0.13, 1.25, 0.13);
  for (let z = -3.2; z < 4.9; z += 0.22) box('deck', 9.32, 1.28, z, 0.055, 0.86, 0.055);
  box('deck', 9.32, 1.77, 0.815, 0.16, 0.1, 8.07);
  box('deck', 9.32, 0.83, 0.815, 0.09, 0.08, 8.14);
  box('deck', 9.32, 0.34, 0.815, 0.12, 0.33, 8.11);
  // Interior cabinet carcasses and MDF fronts; structural products stay independent.
  for (let x = 2.6; x < 5.1; x += 0.65) {
    box('particle', x, 1.15, -2.95, 0.6, 0.94, 0.6);
    box('mdf', x, 1.16, -2.63, 0.56, 0.85, 0.04);
    box('mdf', x, 1.66, -2.94, 0.65, 0.065, 0.7);
    box('trim', x + 0.17, 1.33, -2.594, 0.025, 0.16, 0.025);
  }
  for (const x of [2.5, 5.4]) box('mdf', x, 0.77, -1.2, 0.035, 0.16, 4);
  box('mdf', 3.95, 0.77, -3.32, 3, 0.16, 0.035);
  house.position.x = -1;
  return { house, parts, products, mats };
}
