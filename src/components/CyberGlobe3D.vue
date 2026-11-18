<template>
  <div ref="hostRef" class="cyber-globe" data-ui>
    <div ref="canvasHostRef" class="cyber-globe__canvas"></div>

    <!-- Fallback: foto Bumi asli bila WebGL gagal -->
    <div class="cyber-globe__fallback" :class="{ 'is-hidden': ready }">
      <div class="cyber-globe__fallback-img" :style="{ backgroundImage: `url('${earthDayUrl}')` }"></div>
    </div>

    <div v-if="ready" class="cyber-globe__reset-wrap">
      <button class="cyber-globe__reset" type="button" aria-label="Reset tampilan Bumi" title="Reset (R)" @click="resetView">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
      </button>
    </div>

    <div v-if="hoverLabel" class="cyber-globe__tip">{{ hoverLabel }}</div>

    <div class="cyber-globe__legend" aria-hidden="true">
      <span><i class="dot"></i> korban ransomware</span>
      <span><i class="in"></i> serangan masuk ke korban</span>
      <span><i class="arc"></i> korban satu grup</span>
      <span><i class="ring"></i> asal serangan (DShield)</span>
      <span class="cyber-globe__legend-note">arah acak = visual, bukan negara asal pelaku</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

import earthDayUrl from '~/assets/textures/earth-day-4k-safe.jpg?url'
import earthNightUrl from '~/assets/textures/earth-night.jpg?url'
import earthTopoUrl from '~/assets/textures/earth-topology.jpg?url'

const props = defineProps({
  events: { type: Array, default: () => [] },
  attackers: { type: Array, default: () => [] },
  focus: { type: String, default: '' },
  paused: { type: Boolean, default: false },
})
const emit = defineEmits(['select'])

const hostRef = ref(null)
const canvasHostRef = ref(null)
const ready = ref(false)
const hoverLabel = ref('')

/* -------------------------------------------------------------------------- */
/*  SHADER BUMI — disalin dari SpaceScene.vue yang sudah terverifikasi live.    */
/*  Aturan: jangan pernah mendeklarasikan variabel GLSL dua kali.               */
/* -------------------------------------------------------------------------- */
const VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uNormal;
  uniform vec3 uSunDirection;
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  vec3 linearToSrgb(vec3 c) { return pow(c, vec3(1.0 / 2.2)); }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(uSunDirection);

    float texel = 1.0 / 1024.0;
    float hL = texture2D(uNormal, vUv - vec2(texel, 0.0)).r;
    float hR = texture2D(uNormal, vUv + vec2(texel, 0.0)).r;
    float hD = texture2D(uNormal, vUv - vec2(0.0, texel)).r;
    float hU = texture2D(uNormal, vUv + vec2(0.0, texel)).r;
    vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), N) + vec3(1e-5));
    vec3 B = cross(N, T);
    vec3 Nb = normalize(N - ((hR - hL) * T + (hU - hD) * B) * 0.45);

    float ndl = dot(Nb, L);
    float day = smoothstep(-0.04, 0.12, ndl);

    vec3 dayCol = texture2D(uDay, vUv).rgb;
    vec3 nightCol = texture2D(uNight, vUv).rgb;

    float diffuse = clamp(ndl, 0.0, 1.0);
    vec3 lit = dayCol * (0.08 + 0.92 * diffuse);
    vec3 city = nightCol * 2.2;
    vec3 nightSide = city + vec3(0.010, 0.018, 0.045);

    vec3 color = mix(nightSide, lit, day);
    gl_FragColor = vec4(linearToSrgb(color), 1.0);
  }
`

let THREE, OrbitControlsCtor, renderer, scene, camera, controls, globeGroup
let earthMesh, raf = 0, ro, disposed = false, reduced = false
let arcs = [], nodeMeshes = [], raycaster, pointer, lastHover = null
let flashes = [], flashIdx = 0
let sunDir, W = 0, H = 0

const RADIUS = 2.0

function latLonToVec3(lat, lon, r = RADIUS) {
  const theta = (90 - lat) * Math.PI / 180
  const phi = (lon + 180) * Math.PI / 180
  return new THREE.Vector3(
    -r * Math.cos(phi) * Math.sin(theta),
    r * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

// Interpolasi great-circle: setiap titik dijamin di atas permukaan bola.
function slerpDir(a, b, t) {
  const dot = Math.max(-1, Math.min(1, a.dot(b)))
  const omega = Math.acos(dot)
  if (omega < 1e-4) return a.clone().lerp(b, t).normalize()
  const s = Math.sin(omega)
  return a.clone().multiplyScalar(Math.sin((1 - t) * omega) / s)
    .add(b.clone().multiplyScalar(Math.sin(t * omega) / s)).normalize()
}

function makeArc(event) {
  if (!event || !event.from || !event.to ||
      event.from.lat == null || event.to.lat == null) return null
  const dirA = latLonToVec3(event.from.lat, event.from.lon, 1).normalize()
  const dirB = latLonToVec3(event.to.lat, event.to.lon, 1).normalize()
  const angle = dirA.angleTo(dirB)
  const lift = RADIUS * (0.055 + 0.30 * (angle / Math.PI))
  const floor = RADIUS * 1.014 // selalu di atas kulit bumi, tidak pernah tenggelam
  const pts = []
  const N = 72
  for (let i = 0; i <= N; i++) {
    const u = i / N
    const d = slerpDir(dirA, dirB, u)
    const r = floor + lift * Math.sin(Math.PI * u)
    pts.push(d.multiplyScalar(r))
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
  const color = new THREE.Color(event.color || '#ff5d73')

  // Jalur samar sebagai lintasan.
  const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
  const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.22, depthWrite: false })
  const line = new THREE.Line(lineGeo, lineMat)

  // Ekor dengan gradien warna: terang di kepala, memudar ke belakang.
  const SEG = 22
  const trailGeo = new THREE.BufferGeometry()
  trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SEG * 3), 3))
  const shades = new Float32Array(SEG * 3)
  trailGeo.setAttribute('color', new THREE.BufferAttribute(shades, 3))
  const trailMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false })
  const trail = new THREE.Line(trailGeo, trailMat)

  const headGeo = new THREE.SphereGeometry(0.024, 8, 8)
  const headMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, depthWrite: false })
  const head = new THREE.Mesh(headGeo, headMat)
  const glowGeo = new THREE.SphereGeometry(0.055, 8, 8)
  const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending })
  const glow = new THREE.Mesh(glowGeo, glowMat)

  globeGroup.add(line, head, glow, trail)
  const dur = 1900 + Math.random() * 1500
  const gap = 500 + Math.random() * 1900
  return {
    curve, line, head, glow, trail, event, color, SEG,
    epoch: performance.now() + Math.random() * (dur + gap),
    dur, gap, prevT: 0,
  }
}

function clearArcs() {
  for (const a of arcs) {
    globeGroup.remove(a.line, a.head, a.glow, a.trail)
    a.line.geometry.dispose(); a.line.material.dispose()
    a.head.geometry.dispose(); a.head.material.dispose()
    a.glow.geometry.dispose(); a.glow.material.dispose()
    a.trail.geometry.dispose(); a.trail.material.dispose()
  }
  arcs = []
}

function addNodes(events) {
  for (const m of nodeMeshes) {
    globeGroup.remove(m.mesh)
    m.mesh.geometry.dispose(); m.mesh.material.dispose()
  }
  nodeMeshes = []
  const seen = new Set()
  for (const e of events) {
    for (const side of ['from', 'to']) {
      const p = e[side]
      if (!p || p.lat == null || seen.has(p.name || p.lat + ',' + p.lon)) continue
      seen.add(p.name || p.lat + ',' + p.lon)
      const v = latLonToVec3(p.lat, p.lon, RADIUS * 1.014)
      const geo = new THREE.SphereGeometry(0.024, 10, 10)
      const mat = new THREE.MeshBasicMaterial({ color: 0x6ee7f9, transparent: true, opacity: 0.9 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.copy(v)
      mesh.userData = { name: p.name, country: p.country || '', lat: p.lat, lon: p.lon }
      globeGroup.add(mesh)
      nodeMeshes.push({ mesh, name: p.name })
    }
  }
}

function addAttackers(list) {
  for (const a of list) {
    if (a.lat == null || a.lon == null) continue
    const v = latLonToVec3(a.lat, a.lon, RADIUS * 1.02)
    const geo = new THREE.RingGeometry(0.035, 0.055, 16)
    const mat = new THREE.MeshBasicMaterial({ color: 0xff5d73, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false })
    const ring = new THREE.Mesh(geo, mat)
    ring.position.copy(v)
    ring.lookAt(v.clone().multiplyScalar(2))
    ring.userData = { name: `${a.country} · ${a.ip}`, country: a.country }
    globeGroup.add(ring)
    nodeMeshes.push({ mesh: ring, name: `DShield ${a.country}` })
  }
}

function rebuild(events, attackers = []) {
  if (!globeGroup) return
  clearArcs()
  addNodes(events)
  addAttackers(attackers)
  // SEMUA insiden dapat busur, bukan cuma 36 pertama.
  for (const e of events) {
    const arc = makeArc(e)
    if (arc) arcs.push(arc)
  }
}

function initFlashes() {
  for (const f of flashes) {
    globeGroup.remove(f.mesh)
    f.mesh.geometry.dispose(); f.mesh.material.dispose()
  }
  flashes = []
  for (let i = 0; i < 18; i++) {
    const geo = new THREE.RingGeometry(0.035, 0.052, 20)
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.visible = false
    globeGroup.add(mesh)
    flashes.push({ mesh, start: -1, dur: 760 })
  }
}

function triggerFlash(pos, color) {
  if (!flashes.length) return
  const f = flashes[flashIdx++ % flashes.length]
  f.mesh.position.copy(pos)
  f.mesh.lookAt(pos.clone().multiplyScalar(2))
  f.mesh.material.color.copy(color)
  f.mesh.visible = true
  f.start = performance.now()
}

function draw(now) {
  if (!renderer || disposed) return
  for (const a of arcs) {
    const cycle = a.dur + a.gap
    const phase = ((now - a.epoch) % cycle + cycle) % cycle
    const active = phase < a.dur
    const t = active ? phase / a.dur : 0
    const dim = props.focus && a.event.group !== props.focus
    a.line.material.opacity = dim ? 0.07 : 0.2
    a.head.visible = active
    a.glow.visible = active
    a.trail.visible = active
    if (!active) { a.prevT = 0; continue }

    // ease-out: cepat di awal, melambat di akhir
    const et = 1 - Math.pow(1 - t, 1.6)
    const head = a.curve.getPoint(et)
    a.head.position.copy(head)
    a.glow.position.copy(head)
    a.glow.scale.setScalar(1 + 0.25 * Math.sin(now / 140 + a.epoch))

    const arr = a.trail.geometry.attributes.position.array
    const col = a.trail.geometry.attributes.color.array
    const f = Math.max(0, et - 0.22)
    for (let i = 0; i < a.SEG; i++) {
      const u = i / (a.SEG - 1)
      const tt = f + (et - f) * u
      const p = a.curve.getPoint(tt)
      arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z
      const fade = dim ? 0.12 * u : Math.pow(u, 1.8)
      col[i * 3] = a.color.r * fade
      col[i * 3 + 1] = a.color.g * fade
      col[i * 3 + 2] = a.color.b * fade
    }
    a.trail.geometry.attributes.position.needsUpdate = true
    a.trail.geometry.attributes.color.needsUpdate = true

    if (a.prevT < 0.97 && t >= 0.97) triggerFlash(a.curve.getPoint(1), a.color)
    a.prevT = t
  }

  // flash kedatangan: cincin membesar lalu memudar
  for (const f of flashes) {
    if (f.start < 0) continue
    const age = (now - f.start) / f.dur
    if (age >= 1) { f.mesh.visible = false; f.start = -1; continue }
    f.mesh.scale.setScalar(1 + age * 3.2)
    f.mesh.material.opacity = (1 - age) * 0.85
  }

  if (!props.paused && !reduced) globeGroup.rotation.y += 0.00055
  controls.update()
  renderer.render(scene, camera)
}

function loop(now) { if (disposed) return; draw(now); raf = requestAnimationFrame(loop) }

function resize() {
  if (!renderer || !hostRef.value) return
  W = hostRef.value.clientWidth; H = hostRef.value.clientHeight
  camera.aspect = W / Math.max(1, H)
  camera.updateProjectionMatrix()
  renderer.setSize(W, H, false)
}

function onPointerMove(e) {
  if (!raycaster || !camera) return
  const b = canvasHostRef.value.getBoundingClientRect()
  pointer.x = ((e.clientX - b.left) / b.width) * 2 - 1
  pointer.y = -((e.clientY - b.top) / b.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(nodeMeshes.map(n => n.mesh), false)
  const name = hits.length ? (hits[0].object.userData.name || '') : ''
  if (name !== lastHover) {
    lastHover = name
    hoverLabel.value = name ? `${name}${hits[0].object.userData.country ? ' · ' + hits[0].object.userData.country : ''}` : ''
  }
}

function onClick() {
  if (lastHover) emit('select', lastHover)
}

function resetView() { if (controls) controls.reset() }

function onKey(e) { if (e.key === 'r' || e.key === 'R') resetView() }

onMounted(async () => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduced = mq.matches
  try {
    const mod = await import('three')
    const addon = await import('three/addons/controls/OrbitControls.js')
    THREE = mod
    OrbitControlsCtor = addon.OrbitControls
  } catch (e) {
    console.warn('three import failed, fallback stays', e)
    return
  }
  if (disposed || !hostRef.value || !canvasHostRef.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(0, 0, 7.4)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x05060d, 0)
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace
  if (THREE.NoToneMapping !== undefined) renderer.toneMapping = THREE.NoToneMapping
  renderer.toneMappingExposure = 1.0
  canvasHostRef.value.appendChild(renderer.domElement)

  controls = new OrbitControlsCtor(camera, renderer.domElement)
  controls.enableDamping = !reduced
  controls.dampingFactor = 0.06
  controls.enablePan = false
  controls.minDistance = 4.4
  controls.maxDistance = 11.0
  controls.rotateSpeed = 0.62
  controls.zoomSpeed = 0.8
  controls.update()
  controls.saveState()

  globeGroup = new THREE.Group()
  globeGroup.rotation.y = -0.35
  scene.add(globeGroup)
  initFlashes()

  const loader = new THREE.TextureLoader()
  const load = (url, srgb) => new Promise((resolve) => {
    loader.load(url, (t) => {
      if (srgb && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = renderer.capabilities.getMaxAnisotropy?.() || 8
      resolve(t)
    }, undefined, () => resolve(null))
  })
  const [day, night, topo] = await Promise.all([
    load(earthDayUrl, true), load(earthNightUrl, true), load(earthTopoUrl, false),
  ])
  if (disposed) return
  if (!day || !night) { ready.value = false; return }

  const uniforms = {
    uDay: { value: day },
    uNight: { value: night },
    uNormal: { value: topo || day },
    uSunDirection: { value: new THREE.Vector3(-0.6, 0.22, 0.78).normalize() },
  }
  sunDir = uniforms.uSunDirection.value
  const mat = new THREE.ShaderMaterial({
    uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: false,
  })
  earthMesh = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, 96, 64), mat)
  globeGroup.add(earthMesh)

  // atmosphere tipis
  const atmoMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0x4aa8ff) } },
    vertexShader: `varying vec3 vN; varying vec3 vP; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 wp=modelMatrix*vec4(position,1.0); vP=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: `uniform vec3 uColor; varying vec3 vN; varying vec3 vP; void main(){ vec3 V=normalize(cameraPosition-vP); float f=pow(1.0-abs(dot(normalize(vN),V)),3.0); gl_FragColor=vec4(uColor,f*0.22); }`,
    transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
  })
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 1.045, 64, 48), atmoMat)
  globeGroup.add(atmo)

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()
  rebuild(props.events, props.attackers)

  resize()
  ro = new ResizeObserver(resize)
  ro.observe(hostRef.value)
  renderer.domElement.addEventListener('pointermove', onPointerMove)
  renderer.domElement.addEventListener('click', onClick)
  window.addEventListener('keydown', onKey)
  ready.value = true

  if (reduced) draw(performance.now())
  else raf = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(raf)
  ro?.disconnect()
  window.removeEventListener('keydown', onKey)
  if (renderer) {
    renderer.domElement.removeEventListener('pointermove', onPointerMove)
    renderer.domElement.removeEventListener('click', onClick)
    controls?.dispose()
    scene?.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material]
        mats.forEach(m => m.dispose())
      }
    })
    renderer.dispose()
  }
})

watch(() => [props.events, props.attackers], () => rebuild(props.events, props.attackers), { deep: false })
</script>

<style scoped>
.cyber-globe { position: relative; width: 100%; height: 100%; min-height: 460px; overflow: hidden; background: radial-gradient(circle at 50% 48%, #0a1226 0%, #05060d 70%); }
.cyber-globe__canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.cyber-globe__canvas :deep(canvas) { display: block; width: 100%; height: 100%; cursor: grab; touch-action: none; }
.cyber-globe__canvas :deep(canvas:active) { cursor: grabbing; }
.cyber-globe__fallback { position: absolute; inset: 0; display: grid; place-items: center; transition: opacity 700ms ease; pointer-events: none; }
.cyber-globe__fallback.is-hidden { opacity: 0; pointer-events: none; }
.cyber-globe__fallback-img { width: min(62%, 420px); aspect-ratio: 1; border-radius: 50%; background-size: cover; background-position: 50% 50%; box-shadow: 0 0 60px rgba(74,168,255,.22); }
.cyber-globe__reset-wrap { position: absolute; top: 12px; right: 12px; z-index: 2; }
.cyber-globe__reset { width: 30px; height: 30px; display: grid; place-items: center; background: rgba(8,14,34,.7); border: 1px solid rgba(110,231,249,.38); border-radius: 50%; color: #9fe8f7; cursor: pointer; }
.cyber-globe__reset:hover { background: rgba(16,34,70,.9); color: #fff; }
.cyber-globe__tip { position: absolute; bottom: 14px; right: 14px; font-size: 11px; letter-spacing: .06em; color: var(--accent); background: rgba(5,6,13,.75); padding: 5px 9px; pointer-events: none; }
.cyber-globe__legend { position: absolute; top: 14px; left: 14px; display: flex; flex-direction: column; gap: 4px; font-size: 10px; color: var(--muted); pointer-events: none; }
.cyber-globe__legend span { display: inline-flex; align-items: center; gap: 6px; }
.cyber-globe__legend i.dot { width: 7px; height: 7px; border-radius: 50%; background: #6ee7f9; }
.cyber-globe__legend i.in { width: 14px; height: 2px; background: #ff5d73; }
.cyber-globe__legend i.arc { width: 14px; height: 2px; background: #ff9f43; }
.cyber-globe__legend i.ring { width: 8px; height: 8px; border-radius: 50%; border: 2px solid #ff5d73; background: transparent; }
.cyber-globe__legend-note { color: var(--faint); font-size: 9px; margin-top: 2px; }
@media (max-width: 640px) { .cyber-globe { min-height: 380px; } .cyber-globe__fallback-img { width: 78%; } }
</style>
