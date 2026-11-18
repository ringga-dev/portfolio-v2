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
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

import earthDayUrl from '~/assets/textures/earth-day-4k-safe.jpg?url'
import earthNightUrl from '~/assets/textures/earth-night.jpg?url'
import earthTopoUrl from '~/assets/textures/earth-topology.jpg?url'

const props = defineProps({
  events: { type: Array, default: () => [] },
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

function makeArc(event) {
  if (!event || !event.from || !event.to ||
      event.from.lat == null || event.to.lat == null) return null
  const a = latLonToVec3(event.from.lat, event.from.lon, RADIUS * 1.008)
  const b = latLonToVec3(event.to.lat, event.to.lon, RADIUS * 1.008)
  const angle = a.clone().normalize().angleTo(b.clone().normalize())
  const lift = RADIUS * (0.06 + Math.min(0.42, angle * 0.24))
  const mid = a.clone().add(b).normalize().multiplyScalar(RADIUS + lift)
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b)
  const pts = curve.getPoints(64)
  const color = new THREE.Color(event.color || '#ff5d73')

  const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
  const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.34, depthWrite: false })
  const line = new THREE.Line(lineGeo, lineMat)

  const headGeo = new THREE.SphereGeometry(0.026, 8, 8)
  const headMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, depthWrite: false })
  const head = new THREE.Mesh(headGeo, headMat)

  const trailGeo = new THREE.BufferGeometry()
  trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12 * 3), 3))
  const trailMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95, depthWrite: false })
  const trail = new THREE.Line(trailGeo, trailMat)

  globeGroup.add(line, head, trail)
  return {
    curve, line, head, trail, event,
    start: performance.now(),
    dur: 2600 + Math.random() * 1400,
    head, line, trail, color,
  }
}

function clearArcs() {
  for (const a of arcs) {
    globeGroup.remove(a.line, a.head, a.trail)
    a.line.geometry.dispose(); a.line.material.dispose()
    a.head.geometry.dispose(); a.head.material.dispose()
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

function rebuild(events) {
  if (!globeGroup) return
  clearArcs()
  addNodes(events)
  const slice = events.slice(0, 36)
  slice.forEach((e, i) => {
    const arc = makeArc(e)
    if (arc) { arc.start = performance.now() + i * 55; arcs.push(arc) }
  })
}

function draw(now) {
  if (!renderer || disposed) return
  for (const a of arcs) {
    const raw = (now - a.start) / a.dur
    const t = Math.max(0, Math.min(1, raw))
    const dim = props.focus && !(a.event.from?.name || '').toLowerCase().includes(props.focus.toLowerCase()) &&
      !(a.event.to?.name || '').toLowerCase().includes(props.focus.toLowerCase())
    a.line.material.opacity = dim ? 0.08 : 0.34
    if (raw < 0) { a.head.visible = false; a.trail.visible = false; continue }
    a.head.visible = true; a.trail.visible = true
    a.head.position.copy(a.curve.getPoint(t))
    const arr = a.trail.geometry.attributes.position.array
    const seg = 12
    for (let i = 0; i < seg; i++) {
      const tt = Math.max(0, t - 0.14 + (0.14 * i) / (seg - 1))
      const p = a.curve.getPoint(tt)
      arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z
    }
    a.trail.geometry.attributes.position.needsUpdate = true
    a.trail.material.opacity = dim ? 0.2 : 0.95
    if (t >= 1) {
      a.head.visible = false
      a.trail.visible = false
    }
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
  camera.position.set(0, 0, 6.4)
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
  controls.minDistance = 4.0
  controls.maxDistance = 10.0
  controls.rotateSpeed = 0.62
  controls.zoomSpeed = 0.8
  controls.update()
  controls.saveState()

  globeGroup = new THREE.Group()
  globeGroup.rotation.y = -0.35
  scene.add(globeGroup)

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
  rebuild(props.events)

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

watch(() => props.events, (v) => rebuild(v), { deep: false })
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
@media (max-width: 640px) { .cyber-globe { min-height: 380px; } .cyber-globe__fallback-img { width: 78%; } }
</style>
