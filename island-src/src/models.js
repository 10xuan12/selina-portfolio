import * as T from "three";
const materials = new Map();
export function mat(color, options = {}) {
  const key = JSON.stringify([color, options]);
  if (!materials.has(key))
    materials.set(
      key,
      new T.MeshStandardMaterial({ color, roughness: 0.86, ...options }),
    );
  return materials.get(key);
}
const sphere = new T.SphereGeometry(1, 16, 12),
  box = new T.BoxGeometry(1, 1, 1),
  cylinder = new T.CylinderGeometry(1, 1, 1, 12);
export function mesh(g, geo, color, p = [0, 0, 0], s = [1, 1, 1]) {
  const m = new T.Mesh(geo, color?.isMaterial ? color : mat(color));
  m.position.set(...p);
  m.scale.set(...s);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}
export const ball = (g, c, p, s) => mesh(g, sphere, c, p, s);
export const block = (g, c, p, s) => mesh(g, box, c, p, s);
export const cyl = (g, c, p, s) => mesh(g, cylinder, c, p, s);
export function capsule(g, c, p, s) {
  return mesh(g, new T.CapsuleGeometry(0.5, 1, 5, 10), c, p, s);
}
export function rod(g, c, a, b, r = 0.045) {
  const A = new T.Vector3(...a),
    B = new T.Vector3(...b),
    m = cyl(g, c, A.clone().add(B).multiplyScalar(0.5).toArray(), [
      r,
      A.distanceTo(B),
      r,
    ]);
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), B.sub(A).normalize());
  return m;
}
export function torus(g, c, p, r = 0.4, tube = 0.04) {
  return mesh(g, new T.TorusGeometry(r, tube, 8, 32), c, p);
}
export function group(parent, p = [0, 0, 0]) {
  const g = new T.Group();
  g.position.set(...p);
  parent?.add(g);
  return g;
}
export function makeHiker() {
  // Selina, as in her travel photos: black cap, long black hair, black top,
  // wide-leg dark jeans, white sneakers, hoop earrings and a brown woven tote.
  const root = new T.Group(),
    body = group(root, [0, 1.23, 0]);
  const top = "#26262b",
    topSoft = "#33333a",
    denim = "#3b4252",
    denimSeam = "#4a5266",
    skin = "#f0c19a",
    hair = "#17130f",
    sneaker = "#f3efe6",
    sole = "#2b2b2e",
    tote = "#6e4a33",
    toteDark = "#583a28",
    silver = "#d9d9de";
  const legs = [];
  for (const side of [-1, 1]) {
    const leg = group(root, [side * 0.18, 1.17, 0]);
    // wide-leg jeans: a little flare towards the ankle
    capsule(leg, denim, [0, -0.32, 0], [0.3, 0.5, 0.31]);
    capsule(leg, denim, [0, -0.66, 0.01], [0.36, 0.42, 0.36]);
    rod(leg, denimSeam, [side * 0.16, -0.1, 0.02], [side * 0.18, -0.8, 0.02], 0.01);
    capsule(leg, sneaker, [0, -0.9, 0.09], [0.27, 0.16, 0.42]);
    block(leg, sole, [0, -1.0, 0.12], [0.29, 0.06, 0.48]);
    legs.push(leg);
  }
  capsule(body, top, [0, 0.24, 0], [0.68, 0.52, 0.44]);
  ball(body, topSoft, [-0.21, 0.48, 0.06], [0.2, 0.18, 0.19]);
  ball(body, topSoft, [0.21, 0.48, 0.06], [0.2, 0.18, 0.19]);
  // thin silver necklace
  const chain = torus(body, silver, [0, 0.56, 0.12], 0.13, 0.006);
  chain.rotation.x = 1.2;
  // brown woven tote on the right shoulder
  rod(body, toteDark, [0.25, 0.55, 0.05], [0.42, -0.02, 0.12], 0.025);
  rod(body, toteDark, [0.25, 0.55, -0.05], [0.42, -0.02, -0.12], 0.025);
  const bag = capsule(body, tote, [0.47, -0.12, 0], [0.22, 0.42, 0.5]);
  bag.rotation.z = -0.08;
  for (let i = 0; i < 4; i++)
    block(body, toteDark, [0.58, -0.3 + i * 0.12, 0], [0.012, 0.012, 0.44]);
  const arms = [];
  for (const side of [-1, 1]) {
    let arm = group(body, [side * 0.39, 0.46, 0]);
    capsule(arm, top, [side * 0.03, -0.12, 0], [0.22, 0.16, 0.23]);
    capsule(arm, skin, [side * 0.035, -0.36, 0.01], [0.16, 0.3, 0.17]);
    ball(arm, skin, [side * 0.04, -0.6, 0.035], [0.12, 0.13, 0.11]);
    arms.push(arm);
  }
  const head = group(body, [0, 0.94, 0.015]);
  ball(head, skin, [0, 0, 0], [0.49, 0.53, 0.41]);
  ball(head, hair, [0, 0.12, -0.12], [0.52, 0.5, 0.38]);
  // side-swept front hair under the cap
  ball(head, hair, [-0.3, 0.12, 0.18], [0.2, 0.28, 0.2]);
  ball(head, hair, [0.3, 0.12, 0.18], [0.2, 0.28, 0.2]);
  // black baseball cap with a front brim
  const crown = mesh(head, new T.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), "#141416", [0, 0.2, -0.02], [0.53, 0.42, 0.5]);
  crown.rotation.x = -0.12;
  const brim = cyl(head, "#141416", [0, 0.22, 0.42], [0.36, 0.03, 0.3]);
  brim.rotation.x = 0.18;
  cyl(head, "#2b2b30", [0, 0.6, -0.04], [0.05, 0.03, 0.05]);
  // face: eyes, blush, black frames, a small smile
  for (const side of [-1, 1]) {
    ball(head, skin, [side * 0.46, -0.03, 0.02], [0.1, 0.14, 0.09]);
    ball(head, "#e3a08a", [side * 0.28, -0.18, 0.342], [0.11, 0.045, 0.012]);
    ball(head, "#fffaf0", [side * 0.19, 0.015, 0.364], [0.11, 0.13, 0.035]);
    ball(head, "#3a2418", [side * 0.18, 0.005, 0.398], [0.057, 0.08, 0.015]);
    ball(head, "#fffdf1", [side * 0.165, 0.04, 0.414], [0.017, 0.022, 0.006]);
    const lens = torus(head, "#1d1d20", [side * 0.205, 0.01, 0.415], 0.165, 0.022);
    lens.scale.set(1, 0.92, 1);
    rod(head, "#1d1d20", [side * 0.36, 0.06, 0.39], [side * 0.47, 0.08, 0.04], 0.016);
    // silver hoop earrings
    const hoop = torus(head, silver, [side * 0.5, -0.2, 0.03], 0.09, 0.012);
    hoop.rotation.y = Math.PI / 2;
  }
  rod(head, "#1d1d20", [-0.04, 0.035, 0.42], [0.04, 0.035, 0.42], 0.015);
  ball(head, skin, [0, -0.09, 0.412], [0.055, 0.075, 0.06]);
  let smile = new T.CatmullRomCurve3([
    new T.Vector3(-0.105, -0.235, 0.365),
    new T.Vector3(0, -0.263, 0.392),
    new T.Vector3(0.1, -0.228, 0.365),
  ]);
  mesh(head, new T.TubeGeometry(smile, 12, 0.013, 5, false), "#b4595a");
  // long straight black hair falling behind the shoulders (sways while walking)
  const braids = [];
  for (const side of [-1, 1]) {
    const lock = group(head, [side * 0.3, -0.05, -0.12]);
    capsule(lock, hair, [0, -0.35, -0.05], [0.26, 0.85, 0.22]);
    braids.push(lock);
  }
  const back = group(head, [0, -0.05, -0.25]);
  capsule(back, hair, [0, -0.4, 0], [0.62, 0.9, 0.2]);
  braids.push(back);
  root.userData = { body, head, legs, arms, braids };
  return root;
}
export function animateHiker(root, time, speed, reduced = false) {
  const { body, legs, arms, braids } = root.userData;
  const walk = reduced ? 0 : speed,
    phase = time * 9;
  legs[0].rotation.x = Math.sin(phase) * 0.48 * walk;
  legs[1].rotation.x = -Math.sin(phase) * 0.48 * walk;
  arms[0].rotation.x = -Math.sin(phase) * 0.36 * walk;
  arms[1].rotation.x = Math.sin(phase) * 0.36 * walk;
  body.position.y = 1.23 + Math.abs(Math.sin(phase)) * 0.055 * walk;
  braids.forEach((b, i) => (b.rotation.z = Math.sin(phase + i) * 0.07 * walk));
}
export function pine(g, x, y, z, s = 1, c = "#3e8271") {
  const t = group(g, [x, y, z]);
  rod(t, "#826e52", [0, 0, 0], [0, 2.9 * s, 0], 0.1 * s);
  for (let i = 0; i < 4; i++) {
    let m = mesh(
      t,
      new T.ConeGeometry(1, 1, 9),
      c,
      [0, (1.1 + i * 0.57) * s, 0],
      [(0.8 - i * 0.14) * s, 1.4 * s, (0.8 - i * 0.14) * s],
    );
    m.rotation.y = i * 0.9;
  }
  return t;
}
export function roundTree(g, x, y, z, s = 1, colors = ["#86b56b", "#b3cf76"]) {
  const t = group(g, [x, y, z]);
  rod(t, "#8b7865", [0, 0, 0], [0, 2.15 * s, 0], 0.14 * s);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.4;
    rod(
      t,
      "#8b7865",
      [0, 1 * s, 0],
      [Math.cos(a) * 0.55 * s, 2 * s, Math.sin(a) * 0.55 * s],
      0.085 * s,
    );
    ball(
      t,
      colors[i % colors.length],
      [Math.cos(a) * 0.42 * s, (2.1 + i * 0.17) * s, Math.sin(a) * 0.42 * s],
      [0.8 * s, 0.81 * s, 0.75 * s],
    );
  }
  return t;
}
export function palm(g, x, y, z, s = 1, c = "#719f79") {
  let t = group(g, [x, y, z]);
  for (let i = 0; i < 7; i++)
    cyl(
      t,
      "#b7a080",
      [i * 0.035 * s, (i * 0.3 + 0.15) * s, 0],
      [0.13 * s, 0.32 * s, 0.13 * s],
    );
  for (let i = 0; i < 7; i++) {
    let a = (i * Math.PI * 2) / 7;
    let leaf = ball(
      t,
      c,
      [Math.cos(a) * 0.67 * s, 2.1 * s, Math.sin(a) * 0.67 * s],
      [0.95 * s, 0.1 * s, 0.26 * s],
    );
    leaf.rotation.y = -a;
    leaf.rotation.z = 0.18 * Math.cos(a);
  }
  for (let i = 0; i < 3; i++)
    ball(
      t,
      "#a57c53",
      [Math.sin(i * 2) * 0.16 * s, 1.9 * s, Math.cos(i * 2) * 0.16 * s],
      [0.16 * s, 0.2 * s, 0.16 * s],
    );
  return t;
}
export function cactus(g, x, y, z, s = 1) {
  let t = group(g, [x, y, z]);
  capsule(t, "#77a58c", [0, 1 * s, 0], [0.4 * s, 1.3 * s, 0.4 * s]);
  for (let side of [-1, 1]) {
    rod(t, "#79ac90", [0, 0.8 * s, 0], [side * 0.55 * s, 0.8 * s, 0], 0.13 * s);
    capsule(
      t,
      "#8bb59b",
      [side * 0.55 * s, 1.15 * s, 0],
      [0.25 * s, 0.55 * s, 0.25 * s],
    );
  }
  ball(t, "#eba291", [0, 1.9 * s, 0], [0.19 * s, 0.09 * s, 0.18 * s]);
  return t;
}
export function coral(g, x, y, z, s = 1, color = "#d79bc2") {
  let t = group(g, [x, y, z]);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.6,
      len = 0.55 + (i % 3) * 0.3;
    rod(
      t,
      color,
      [0, 0, 0],
      [Math.cos(a) * 0.45 * s, len * s, Math.sin(a) * 0.4 * s],
      0.095 * s,
    );
    ball(
      t,
      color,
      [Math.cos(a) * 0.45 * s, len * s, Math.sin(a) * 0.4 * s],
      [0.12 * s, 0.12 * s, 0.12 * s],
    );
    rod(
      t,
      color,
      [Math.cos(a) * 0.25 * s, len * 0.6 * s, Math.sin(a) * 0.25 * s],
      [Math.cos(a + 0.8) * 0.7 * s, len * 0.9 * s, Math.sin(a + 0.8) * 0.6 * s],
      0.06 * s,
    );
  }
  return t;
}
export function tent(g) {
  const geo = new T.ConeGeometry(1.5, 1.7, 4, 1, false);
  geo.rotateY(Math.PI / 4);
  const t = mesh(g, geo, "#dba178", [0, 0.9, 0], [1.25, 1, 1]);
  const door = new T.Shape();
  door.moveTo(-0.67, 0);
  door.lineTo(0.67, 0);
  door.lineTo(0, 1.25);
  door.closePath();
  mesh(g, new T.ShapeGeometry(door), "#304e48", [0, 0.12, 1.07]);
  rod(g, "#f5dfb8", [-1.18, 0, 1.12], [0, 1.78, 0.15], 0.04);
  rod(g, "#f5dfb8", [1.18, 0, 1.12], [0, 1.78, 0.15], 0.04);
  for (let s of [-1, 1]) {
    rod(g, "#e8d7b7", [s * 0.9, 0.7, 0.5], [s * 1.8, 0.05, 1.4], 0.012);
    rod(g, "#86735b", [s * 1.8, 0, 1.4], [s * 1.8, 0.16, 1.4], 0.03);
  }
  block(g, "#e7c28c", [0, 0.04, 1.4], [1.25, 0.06, 0.7]);
  return t;
}
export function chair(g, x = 0, z = 0, color = "#9fb6b0") {
  const c = group(g, [x, 0, z]);
  for (let side of [-1, 1]) {
    rod(c, "#b19673", [side * 0.4, 0.05, -0.4], [side * 0.4, 0.8, 0.45], 0.04);
    rod(c, "#b19673", [side * 0.4, 0.05, 0.45], [side * 0.4, 1.5, -0.3], 0.04);
  }
  block(c, color, [0, 0.68, 0.04], [0.75, 0.045, 0.8]);
  const back = block(c, color, [0, 1.12, -0.26], [0.75, 0.7, 0.05]);
  back.rotation.x = -0.18;
  return c;
}
export function lantern(g, x, y, z) {
  cyl(g, "#d3a156", [x, y, z], [0.19, 0.09, 0.19]);
  cyl(
    g,
    mat("#fff2b0", { emissive: "#ffcf6f", emissiveIntensity: 0.6 }),
    [x, y + 0.2, z],
    [0.13, 0.32, 0.13],
  );
  cyl(g, "#d3a156", [x, y + 0.39, z], [0.18, 0.06, 0.18]);
  const loop = torus(g, "#ac8652", [x, y + 0.53, z], 0.11, 0.018);
  return loop;
}
export function table(g) {
  cyl(g, "#bb9771", [0, 0.65, 0], [0.85, 0.13, 0.6]);
  for (let a of [0, 2.1, 4.2])
    rod(
      g,
      "#8f795c",
      [0, 0.6, 0],
      [Math.cos(a) * 0.65, 0, Math.sin(a) * 0.45],
      0.06,
    );
}
export function book(g, x = 0, y = 0.8, z = 0) {
  const b = group(g, [x, y, z]);
  for (let s of [-1, 1]) {
    let page = block(b, "#fff1ce", [s * 0.29, 0, 0], [0.57, 0.08, 0.75]);
    page.rotation.z = s * 0.12;
    block(b, "#8ba8a5", [s * 0.29, -0.07, 0], [0.6, 0.04, 0.8]).rotation.z =
      s * 0.12;
    for (let i = 0; i < 4; i++) {
      const line = block(
        b,
        "#b3bdaf",
        [s * 0.29, 0.055, -0.2 + i * 0.12],
        [0.36, 0.008, 0.012],
      );
      line.rotation.z = s * 0.12;
    }
  }
  return b;
}
export function backpack(g) {
  capsule(g, "#4b8f87", [0, 0.83, 0], [1.1, 1.1, 0.6]);
  capsule(g, "#80b3a0", [0, 1.53, 0], [1.1, 0.22, 0.64]);
  block(g, "#cbac78", [0, 1.27, 0.33], [0.16, 0.28, 0.03]);
  capsule(g, "#39796e", [0, 0.55, 0.34], [0.72, 0.44, 0.16]);
  for (const s of [-1, 1]) {
    rod(g, "#657169", [s * 0.85, 0.05, 0.15], [s * 0.58, 1.9, 0.05], 0.025);
    capsule(g, "#564d3f", [s * 0.58, 1.86, 0.05], [0.08, 0.22, 0.08]);
  }
  cyl(g, "#a0c6bc", [0.64, 0.8, 0], [0.15, 0.58, 0.15]);
}
export function camel(g) {
  const c = group(g);
  ball(c, "#c29a68", [0, 1.15, 0], [1.02, 0.55, 0.42]);
  ball(c, "#b68b59", [-0.13, 1.62, 0], [0.4, 0.43, 0.37]);
  capsule(c, "#cda875", [0.78, 1.75, 0], [0.35, 0.95, 0.35]).rotation.z = -0.3;
  ball(c, "#cda875", [1.05, 2.38, 0.05], [0.44, 0.27, 0.25]);
  for (const s of [-1, 1]) {
    ball(c, "#624b33", [1.12, 2.43, s * 0.235], [0.035, 0.04, 0.02]);
    capsule(c, "#bc9464", [0.87, 2.66, s * 0.15], [0.09, 0.18, 0.07]);
  }
  for (let x of [-0.65, 0.6])
    for (let z of [-0.27, 0.27]) {
      capsule(c, "#b88b5b", [x, 0.55, z], [0.12, 0.66, 0.12]);
      ball(c, "#80654b", [x, 0.08, z + 0.07], [0.13, 0.08, 0.2]);
    }
  block(c, "#aa7562", [-0.15, 1.6, 0], [0.85, 0.1, 0.95]);
  block(c, "#ead7a0", [-0.15, 1.66, 0], [0.7, 0.06, 0.87]);
  rod(c, "#b58b5d", [-0.98, 1.3, 0], [-1.2, 0.8, 0], 0.045);
  return c;
}
export function fish(g, color = "#edc587", s = 1) {
  const f = group(g);
  ball(f, color, [0, 0, 0], [0.8 * s, 0.43 * s, 0.25 * s]);
  let tail = mesh(
    f,
    new T.ConeGeometry(0.4, 0.6, 3),
    color,
    [-0.9 * s, 0, 0],
    [s, s, 0.6 * s],
  );
  tail.rotation.z = -Math.PI / 2;
  for (const side of [-1, 1]) {
    ball(
      f,
      "#fff9e3",
      [0.42 * s, 0.08 * s, side * 0.21 * s],
      [0.13 * s, 0.14 * s, 0.05 * s],
    );
    ball(
      f,
      "#365561",
      [0.45 * s, 0.08 * s, side * 0.25 * s],
      [0.055 * s, 0.07 * s, 0.025 * s],
    );
  }
  let fin = mesh(
    f,
    new T.ConeGeometry(0.25, 0.4, 3),
    "#e4a77e",
    [0, 0.4 * s, 0],
    [s, s, s * 0.5],
  );
  fin.rotation.z = -0.3;
  return f;
}
export function shell(g) {
  for (let i = 0; i < 9; i++) {
    const a = (i / 8 - 0.5) * Math.PI * 0.8;
    let l = ball(
      g,
      i % 2 ? "#f2cebb" : "#e4b3b2",
      [Math.sin(a) * 0.5, 0.45 + Math.cos(a) * 0.4, -Math.cos(a) * 0.15],
      [0.2, 0.85, 0.16],
    );
    l.rotation.z = -a;
  }
  ball(
    g,
    mat("#fff5d9", { emissive: "#a6cfd7", emissiveIntensity: 0.2 }),
    [0, 0.35, 0.4],
    [0.35, 0.35, 0.35],
  );
}
// --- Selina's own camp props (the same in every theme) ---------------------
const WINE = "#6b1e23", IVORY = "#f6efe4";
function textBoard(g, text, p, w = 1.5, color = WINE, rotY = 0) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 128;
  const x = c.getContext("2d");
  x.fillStyle = color; x.fillRect(0, 0, 512, 128);
  x.fillStyle = IVORY;
  x.font = "700 58px Arial, Helvetica, sans-serif";
  x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText(text, 256, 68, 480);
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  const face = new T.MeshStandardMaterial({ map: tex, roughness: 0.8 });
  const board = mesh(g, new T.BoxGeometry(1, 1, 1), color, p, [w, w / 4, 0.06]);
  board.material = [mat(color), mat(color), mat(color), mat(color), face, face];
  board.rotation.y = rotY;
  return board;
}
function laptopDesk(g) {
  // little wine desk with an open laptop and a phone: "Work & projects"
  block(g, WINE, [0, 0.72, 0], [1.9, 0.08, 1.0]);
  for (const x of [-0.85, 0.85]) for (const z of [-0.42, 0.42])
    cyl(g, "#4a1418", [x, 0.36, z], [0.045, 0.72, 0.045]);
  block(g, "#cfd2d6", [0, 0.79, 0.05], [0.95, 0.04, 0.62]);
  const screen = block(g, "#cfd2d6", [0, 1.1, -0.27], [0.95, 0.6, 0.035]);
  screen.rotation.x = -0.2;
  const glow = block(g, mat("#fbe9ea", { emissive: "#f2b8bf", emissiveIntensity: 0.55 }), [0, 1.1, -0.25], [0.86, 0.5, 0.01]);
  glow.rotation.x = -0.2;
  block(g, WINE, [-0.2, 1.17, -0.235], [0.4, 0.06, 0.005]).rotation.x = -0.2;
  block(g, "#d9a3a8", [0.08, 1.05, -0.24], [0.6, 0.04, 0.005]).rotation.x = -0.2;
  block(g, "#1f1f22", [0.72, 0.78, 0.2], [0.18, 0.02, 0.34]);
  block(g, mat("#fbe9ea", { emissive: "#f2b8bf", emissiveIntensity: 0.4 }), [0.72, 0.795, 0.2], [0.15, 0.005, 0.29]);
}
function gradBooks(g) {
  // stack of books and a graduation cap: "Experience"
  const colors = [WINE, "#d9a3a8", "#efe2cf", "#8e3a42"];
  colors.forEach((c, i) => {
    const b = block(g, c, [0, 0.14 + i * 0.26, 0], [1.3 - i * 0.08, 0.24, 0.9 - i * 0.04]);
    b.rotation.y = (i % 2 ? 0.18 : -0.12);
    block(g, IVORY, [0.02, 0.14 + i * 0.26, 0.47 - i * 0.02], [1.18 - i * 0.08, 0.17, 0.02]).rotation.y = b.rotation.y;
  });
  cyl(g, "#1c1c1f", [0, 1.18, 0], [0.32, 0.18, 0.32]);
  const board = block(g, "#1c1c1f", [0, 1.3, 0], [0.95, 0.04, 0.95]);
  board.rotation.y = 0.6;
  cyl(g, WINE, [0, 1.33, 0], [0.06, 0.03, 0.06]);
  rod(g, "#e2b65c", [0, 1.33, 0], [0.42, 1.3, 0.3], 0.012);
  rod(g, "#e2b65c", [0.42, 1.3, 0.3], [0.44, 0.98, 0.32], 0.014);
  ball(g, "#e2b65c", [0.44, 0.94, 0.32], [0.05, 0.08, 0.05]);
}
function icedCoffee(g) {
  // a giant iced coffee ("續命咖啡") on a saucer: "About me"
  cyl(g, IVORY, [0, 0.06, 0], [0.95, 0.1, 0.95]);
  cyl(g, mat("#f4ece2", { transparent: true, opacity: 0.45, roughness: 0.15 }), [0, 0.95, 0], [0.62, 1.7, 0.62]);
  cyl(g, "#6a3f2a", [0, 0.62, 0], [0.56, 1.0, 0.56]);
  cyl(g, "#c79a72", [0, 1.18, 0], [0.56, 0.12, 0.56]);
  cyl(g, "#efe2cf", [0, 1.27, 0], [0.56, 0.06, 0.56]);
  for (const [x, z] of [[0.2, 0.1], [-0.18, -0.12], [0.05, -0.25]])
    block(g, mat("#e8f2f3", { transparent: true, opacity: 0.7, roughness: 0.1 }), [x, 1.3, z], [0.18, 0.16, 0.18]).rotation.y = x * 3;
  cyl(g, IVORY, [0, 1.82, 0], [0.66, 0.05, 0.66]);
  rod(g, WINE, [0.15, 0.4, 0.05], [0.35, 2.45, 0.2], 0.05);
  // heart sticker on the cup
  const heart = new T.Shape();
  heart.moveTo(0, -0.12);
  heart.bezierCurveTo(-0.2, 0.02, -0.12, 0.18, 0, 0.08);
  heart.bezierCurveTo(0.12, 0.18, 0.2, 0.02, 0, -0.12);
  mesh(g, new T.ShapeGeometry(heart), mat(WINE, { side: T.DoubleSide }), [0, 0.9, 0.63], [1.4, 1.4, 1]);
}
function suitcaseSign(g) {
  // a wine suitcase with stickers and a signpost to places she has been: "Travel"
  block(g, WINE, [-0.35, 0.62, 0], [1.05, 1.1, 0.45]);
  for (const x of [-0.65, -0.05]) block(g, "#4a1418", [x, 0.62, 0.23], [0.07, 1.05, 0.02]);
  torus(g, "#2b2b2e", [-0.35, 1.25, 0], 0.18, 0.035);
  for (const x of [-0.75, 0.05]) for (const z of [-0.15, 0.15]) ball(g, "#2b2b2e", [x, 0.05, z], [0.06, 0.06, 0.06]);
  block(g, "#efe2cf", [-0.55, 0.85, 0.235], [0.22, 0.15, 0.01]);
  block(g, "#d9a3a8", [-0.2, 0.45, 0.235], [0.25, 0.25, 0.01]).rotation.z = 0.3;
  block(g, "#9fbcc0", [-0.5, 0.35, 0.235], [0.18, 0.12, 0.01]).rotation.z = -0.2;
  // signpost
  const x0 = 0.75;
  cyl(g, "#5a2a1f", [x0, 1.3, 0], [0.06, 2.6, 0.06]);
  textBoard(g, "DA NANG", [x0 + 0.55, 2.35, 0], 1.25, WINE, 0.15);
  textBoard(g, "THAILAND", [x0 - 0.5, 2.0, 0.02], 1.3, "#8e3a42", -0.25);
  textBoard(g, "ESWATINI", [x0 + 0.5, 1.65, 0], 1.25, WINE, -0.1);
  textBoard(g, "JOBURG", [x0 - 0.45, 1.3, 0.02], 1.1, "#8e3a42", 0.2);
  textBoard(g, "TAICHUNG ⌂", [x0 + 0.1, 2.75, 0.03], 1.45, "#3a1014", 0.05);
}
export function landmark(theme, index) {
  const g = new T.Group();
  [laptopDesk, gradBooks, icedCoffee, suitcaseSign][index]?.(g);
  return g;
}
