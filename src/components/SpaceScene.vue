<script setup lang="ts">
/**
 * SpaceScene — self-contained, SSR-safe 3D / CSS antariksa background.
 *
 * - Hero:        <SpaceScene variant="hero" class="absolute inset-0" />
 * - Widget kecil: <SpaceScene variant="mini" class="h-48 w-full" />
 *
 * Dependensi `three` bersifat opsional. Jika tidak terpasang / WebGL tidak
 * tersedia / impor gagal, layer fallback CSS (bintang + planet) tetap tampil.
 */

import {
  defineOptions,
  onMounted,
  onUnmounted,
  ref,
  useAttrs,
  withDefaults,
  defineProps,
} from 'vue'

defineOptions({
  name: 'SpaceScene',
  inheritAttrs: false,
})

type Variant = 'hero' | 'orbital' | 'mini'

interface VariantConfig {
  stars: number
  dust: number
  orbits: number
  planetRadius: number
  planetDetail: number
  cameraZ: number
}

const props = withDefaults(
  defineProps<{ variant?: Variant }>(),
  { variant: 'hero' },
)

// class (dan atribut lain) dari pemakai diteruskan ke elemen akar
const attrs = useAttrs()

const CONFIG: Record<Variant, VariantConfig> = {
  hero: { stars: 1800, dust: 320, orbits: 3, planetRadius: 1.65, planetDetail: 3, cameraZ: 7.4 },
  orbital: { stars: 1500, dust: 240, orbits: 3, planetRadius: 1.35, planetDetail: 3, cameraZ: 7.0 },
  mini: { stars: 1200, dust: 140, orbits: 1, planetRadius: 1.15, planetDetail: 2, cameraZ: 6.6 },
}

const containerRef = ref<HTMLElement | null>(null)
const canvasHostRef = ref<HTMLElement | null>(null)
const webglReady = ref(false)
const reducedMotion = ref(false)

const PALETTE = {
  star: 0xe8ecf8,
  cyan: 0x6ee7f9,
  violet: 0xa78bfa,
}

/* ---------- state runtime (disimpan agar bisa dibersihkan saat unmount) ---------- */
let THREE: any = null
let renderer: any = null
let scene: any = null
let camera: any = null
let world: any = null
let starField: any = null
let starMaterial: any = null
let dustField: any = null
let planet: any = null
let planetGlow: any = null

interface OrbitNode {
  group: any
  satellite: any
  rx: number
  rz: number
  speed: number
  phase: number
}
let orbitNodes: OrbitNode[] = []
let disposables: Array<{ dispose(): void }> = []

let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let mediaQuery: MediaQueryList | null = null

let rafId = 0
let running = false
let isVisible = true
let isDisposed = false
let lastTime = 0

const pointer = { x: 0, y: 0 }
const pointerTarget = { x: 0, y: 0 }

function track<T extends { dispose(): void }>(item: T): T {
  disposables.push(item)
  return item
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    return false
  }
}

function createStarfield(count: number, isDust = false) {
  const geometry = track(new THREE.BufferGeometry())
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  const white = new THREE.Color(PALETTE.star)
  const cyan = new THREE.Color(PALETTE.cyan)
  const violet = new THREE.Color(PALETTE.violet)
  const tmp = new THREE.Color()

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    if (isDust) {
      // Debu antariksa: awan pipih dekat planet
      const r = 2.4 + Math.random() * 4.6
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * 0.9
      positions[i3] = Math.cos(theta) * Math.cos(phi) * r
      positions[i3 + 1] = Math.sin(phi) * r * 0.6
      positions[i3 + 2] = Math.sin(theta) * Math.cos(phi) * r
    } else {
      // Bintang: kulit bola besar di sekeliling kamera
      const r = 12 + Math.random() * 26
      const theta = Math.random() * Math.PI * 2
      const u = Math.random() * 2 - 1
      const s = Math.sqrt(1 - u * u)
      positions[i3] = r * s * Math.cos(theta)
      positions[i3 + 1] = r * u
      positions[i3 + 2] = r * s * Math.sin(theta)
    }

    const pick = Math.random()
    tmp.copy(pick < 0.62 ? white : pick < 0.86 ? cyan : violet)
    const shade = 0.65 + Math.random() * 0.35
    colors[i3] = tmp.r * shade
    colors[i3 + 1] = tmp.g * shade
    colors[i3 + 2] = tmp.b * shade
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = track(
    new THREE.PointsMaterial({
      size: isDust ? 0.055 : 0.085,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: isDust ? 0.55 : 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )

  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  return { points, material }
}

function createPlanet(radius: number, detail: number) {
  const group = new THREE.Group()

  const geo = track(new THREE.IcosahedronGeometry(radius, detail))
  const mat = track(
    new THREE.MeshStandardMaterial({
      color: 0x10183f,
      emissive: 0x16265e,
      emissiveIntensity: 0.65,
      metalness: 0.45,
      roughness: 0.5,
      flatShading: true,
    }),
  )
  planet = new THREE.Mesh(geo, mat)
  group.add(planet)

  // Jaring halus memberi kesan "tech" pada permukaan
  const wireGeo = track(new THREE.IcosahedronGeometry(radius * 1.012, detail))
  const wireMat = track(
    new THREE.MeshBasicMaterial({
      color: PALETTE.cyan,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
    }),
  )
  group.add(new THREE.Mesh(wireGeo, wireMat))

  // Atmosfer / glow dengan shader fresnel sederhana
  const glowGeo = track(new THREE.SphereGeometry(radius * 1.28, 48, 48))
  const glowMat = track(
    new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(PALETTE.cyan) },
        glowColor2: { value: new THREE.Color(PALETTE.violet) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform vec3 glowColor2;
        varying vec3 vNormal;
        varying vec3 vPos;
        void main() {
          float d = max(0.0, 0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)));
          float rim = pow(d, 3.0);
          vec3 col = mix(glowColor, glowColor2, clamp(vPos.y * 0.35 + 0.5, 0.0, 1.0));
          gl_FragColor = vec4(col, 1.0) * rim * 0.9;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  )
  planetGlow = new THREE.Mesh(glowGeo, glowMat)
  group.add(planetGlow)

  return group
}

function createOrbits(count: number, baseRadius: number): OrbitNode[] {
  const nodes: OrbitNode[] = []

  for (let i = 0; i < count; i++) {
    const group = new THREE.Group()
    const rx = baseRadius * (1.7 + i * 0.62)
    const rz = rx * (0.78 - i * 0.05)

    const pts: number[] = []
    const segments = 160
    for (let a = 0; a <= segments; a++) {
      const t = (a / segments) * Math.PI * 2
      pts.push(Math.cos(t) * rx, 0, Math.sin(t) * rz)
    }

    const g = track(new THREE.BufferGeometry())
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    const lineMat = track(
      new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? PALETTE.cyan : PALETTE.violet,
        transparent: true,
        opacity: 0.26 - i * 0.04,
        depthWrite: false,
      }),
    )
    group.add(new THREE.LineLoop(g, lineMat))

    const satGeo = track(new THREE.SphereGeometry(0.075, 14, 14))
    const satMat = track(
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? PALETTE.cyan : PALETTE.star,
      }),
    )
    const satellite = new THREE.Mesh(satGeo, satMat)
    satellite.position.set(rx, 0, 0)
    group.add(satellite)

    group.rotation.x = 0.42 + i * 0.17
    group.rotation.y = i * 0.55
    scene.add(group)

    nodes.push({
      group,
      satellite,
      rx,
      rz,
      speed: 0.24 - i * 0.06,
      phase: i * 1.9,
    })
  }

  return nodes
}

function applyFit(aspect: number) {
  if (!world) return
  // Mengecilkan dunia pada container sempit agar orbit tidak terpotong
  const fit = Math.min(1, Math.max(0.55, aspect / 1.25))
  world.scale.setScalar(fit)
}

function initScene(threeModule: any) {
  THREE = threeModule
  const container = containerRef.value
  const host = canvasHostRef.value
  if (!container || !host || isDisposed) return

  const width = Math.max(1, container.clientWidth)
  const height = Math.max(1, container.clientHeight)
  const cfg = CONFIG[props.variant] ?? CONFIG.hero

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 120)
  camera.position.set(0, 0, cfg.cameraZ)

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height)
  renderer.setClearColor(0x05060d, 0)
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace
  host.appendChild(renderer.domElement)

  // Cahaya: ambient + point (cyan) + directional (ungu) + fill
  const ambient = new THREE.AmbientLight(0x93a7dd, 0.8)
  const key = new THREE.PointLight(PALETTE.cyan, 30, 60)
  key.position.set(5, 3.5, 6)
  const rim = new THREE.DirectionalLight(PALETTE.violet, 1.6)
  rim.position.set(-5, -2, -4)
  const fill = new THREE.PointLight(PALETTE.violet, 14, 40)
  fill.position.set(-4, 2, 3)
  for (const light of [ambient, key, rim, fill]) {
    scene.add(light)
    if (typeof light.dispose === 'function') track(light)
  }

  world = new THREE.Group()
  scene.add(world)

  const stars = createStarfield(cfg.stars)
  starField = stars.points
  starMaterial = stars.material
  scene.add(starField)

  const dust = createStarfield(cfg.dust, true)
  dustField = dust.points
  world.add(dustField)

  world.add(createPlanet(cfg.planetRadius, cfg.planetDetail))
  orbitNodes = createOrbits(cfg.orbits, cfg.planetRadius)

  applyFit(width / height)

  bindEvents()

  resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(container)

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true
      if (isVisible) start()
      else stop()
    },
    { threshold: 0.01 },
  )
  intersectionObserver.observe(container)

  webglReady.value = true
  start() // tick pertama merender; reduced-motion berhenti setelah satu frame
}

/* ---------- event ---------- */
function handlePointerMove(e: PointerEvent) {
  const container = containerRef.value
  if (!container) return
  const rect = container.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  pointerTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointerTarget.y = ((e.clientY - rect.top) / rect.height) * 2 - 1
}

function handlePointerLeave() {
  pointerTarget.x = 0
  pointerTarget.y = 0
}

function bindEvents() {
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('pointerleave', handlePointerLeave, { passive: true })
  window.addEventListener('blur', handlePointerLeave)
}

function unbindEvents() {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerleave', handlePointerLeave)
  window.removeEventListener('blur', handlePointerLeave)
}

function handleMotionChange(e: MediaQueryListEvent) {
  reducedMotion.value = e.matches
  if (e.matches) {
    pointer.x = pointer.y = pointerTarget.x = pointerTarget.y = 0
    if (camera) {
      camera.position.x = 0
      camera.position.y = 0
      camera.lookAt(0, 0, 0)
    }
    if (starField) starField.rotation.set(0, 0, 0)
    start() // satu frame statis yang rapi
  } else if (isVisible) {
    start()
  }
}

function handleResize() {
  if (!renderer || !camera || isDisposed) return
  const container = containerRef.value
  if (!container) return
  const w = Math.max(1, container.clientWidth)
  const h = Math.max(1, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  applyFit(w / h)
  if (reducedMotion.value) start()
}

/* ---------- loop ---------- */
function tick(now: number) {
  if (!running || isDisposed || !renderer) return
  rafId = requestAnimationFrame(tick)

  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0)
  lastTime = now

  // Parallax pointer yang dihaluskan
  const ease = Math.min(1, dt * 4)
  pointer.x += (pointerTarget.x - pointer.x) * ease
  pointer.y += (pointerTarget.y - pointer.y) * ease

  if (!reducedMotion.value) {
    const t = now * 0.001

    if (planet) {
      planet.rotation.y += dt * 0.22
      planet.rotation.x += dt * 0.05
    }
    if (planetGlow) planetGlow.rotation.y -= dt * 0.08

    if (starField) {
      starField.rotation.y = t * 0.008 + pointer.x * 0.12
      starField.rotation.x = -pointer.y * 0.08
    }
    if (starMaterial) {
      starMaterial.opacity = 0.72 + Math.sin(t * 1.6) * 0.16 // kedip
    }
    if (dustField) {
      dustField.rotation.y = -t * 0.018
      dustField.rotation.x = pointer.y * 0.04
    }

    for (let i = 0; i < orbitNodes.length; i++) {
      const o = orbitNodes[i]
      const a = t * o.speed + o.phase
      o.satellite.position.set(Math.cos(a) * o.rx, 0, Math.sin(a) * o.rz)
      o.group.rotation.z = Math.sin(t * 0.22 + i) * 0.06
    }

    if (camera) {
      camera.position.x = pointer.x * 0.85
      camera.position.y = -pointer.y * 0.6
      camera.lookAt(0, 0, 0)
    }
  }

  renderer.render(scene, camera)

  if (reducedMotion.value) stop() // cukup satu frame
}

function start() {
  if (running || isDisposed || !renderer) return
  running = true
  lastTime = performance.now()
  rafId = requestAnimationFrame(tick)
}

function stop() {
  running = false
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
}

/* ---------- siklus hidup ---------- */
onMounted(async () => {
  // SSR aman: seluruh akses window/document ada di dalam onMounted
  if (typeof window === 'undefined') return

  if (typeof window.matchMedia === 'function') {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = mediaQuery.matches
    mediaQuery.addEventListener('change', handleMotionChange)
  }

  if (!supportsWebGL()) return // biarkan fallback CSS tampil

  try {
    // @ts-ignore -- 'three' opsional; fallback CSS menutupi ketiadaannya
    const threeModule = await import('three')
    if (isDisposed || !threeModule) return
    initScene(threeModule)
  } catch {
    // Impor gagal -> fallback CSS tetap terlihat
  }
})

onUnmounted(() => {
  isDisposed = true
  stop()
  unbindEvents()

  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  resizeObserver = null
  intersectionObserver = null

  if (mediaQuery && typeof mediaQuery.removeEventListener === 'function') {
    mediaQuery.removeEventListener('change', handleMotionChange)
  }
  mediaQuery = null

  for (const item of disposables) {
    try { item.dispose() } catch { /* abaikan */ }
  }
  disposables = []
  orbitNodes = []

  if (renderer) {
    try { renderer.dispose() } catch { /* abaikan */ }
    const el = renderer.domElement
    if (el && el.parentNode) el.parentNode.removeChild(el)
  }

  renderer = null
  scene = null
  camera = null
  world = null
  starField = null
  starMaterial = null
  dustField = null
  planet = null
  planetGlow = null
  THREE = null
})
</script>

<template>
  <div
    ref="containerRef"
    class="space-scene"
    :class="`space-scene--${variant}`"
    v-bind="attrs"
    aria-hidden="true"
  >
    <!-- Kanvas WebGL (diisi secara dinamis di onMounted) -->
    <div ref="canvasHostRef" class="space-scene__canvas"></div>

    <!-- Fallback CSS: tampil default, memudar saat WebGL siap -->
    <div
      class="space-fallback"
      :class="{ 'space-fallback--hidden': webglReady }"
    >
      <div class="space-fallback__stars space-fallback__stars--far"></div>
      <div class="space-fallback__stars space-fallback__stars--near"></div>
      <div class="space-fallback__nebula"></div>
      <div class="space-fallback__system">
        <div class="space-fallback__orbit space-fallback__orbit--one"></div>
        <div class="space-fallback__orbit space-fallback__orbit--two"></div>
        <div class="space-fallback__orbit space-fallback__orbit--three"></div>
        <div class="space-fallback__planet"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.space-scene {
  /* Grid membuat semua layer bertumpuk tanpa perlu position:relative,
     sehingga class 'absolute inset-0' dari pemakai tetap bekerja. */
  display: grid;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  isolation: isolate;
  background: radial-gradient(
    ellipse 70% 60% at 50% 45%,
    #0b1230 0%,
    #070b1c 46%,
    #05060d 100%
  );
}

.space-scene > * {
  grid-area: 1 / 1;
  min-width: 0;
  min-height: 0;
}

.space-scene__canvas,
.space-scene__canvas :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

/* --------------------------- FALLBACK --------------------------- */
.space-fallback {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: opacity 700ms ease;
}
.space-fallback--hidden {
  opacity: 0;
}

.space-fallback__stars {
  position: absolute;
  inset: -8%;
  background-repeat: no-repeat;
  will-change: opacity, transform;
}

.space-fallback__stars--far {
  background-image:
    radial-gradient(2px 2px at 6% 12%, rgba(232, 236, 248, .95) 30%, transparent 72%),
    radial-gradient(2px 2px at 15% 78%, rgba(190, 214, 255, .9) 30%, transparent 72%),
    radial-gradient(1.8px 1.8px at 23% 34%, rgba(232, 236, 248, .85) 30%, transparent 72%),
    radial-gradient(2px 2px at 31% 64%, rgba(110, 231, 249, .8) 30%, transparent 72%),
    radial-gradient(1.6px 1.6px at 38% 18%, rgba(232, 236, 248, .8) 30%, transparent 72%),
    radial-gradient(2px 2px at 44% 88%, rgba(167, 139, 250, .75) 30%, transparent 72%),
    radial-gradient(1.8px 1.8px at 51% 26%, rgba(232, 236, 248, .9) 30%, transparent 72%),
    radial-gradient(2px 2px at 57% 58%, rgba(190, 214, 255, .8) 30%, transparent 72%),
    radial-gradient(1.6px 1.6px at 63% 9%, rgba(232, 236, 248, .8) 30%, transparent 72%),
    radial-gradient(2px 2px at 69% 74%, rgba(110, 231, 249, .8) 30%, transparent 72%),
    radial-gradient(1.8px 1.8px at 76% 42%, rgba(232, 236, 248, .85) 30%, transparent 72%),
    radial-gradient(2px 2px at 82% 84%, rgba(167, 139, 250, .7) 30%, transparent 72%),
    radial-gradient(1.6px 1.6px at 88% 22%, rgba(232, 236, 248, .9) 30%, transparent 72%),
    radial-gradient(2px 2px at 94% 60%, rgba(190, 214, 255, .8) 30%, transparent 72%),
    radial-gradient(1.8px 1.8px at 10% 48%, rgba(232, 236, 248, .75) 30%, transparent 72%),
    radial-gradient(1.6px 1.6px at 27% 92%, rgba(232, 236, 248, .7) 30%, transparent 72%),
    radial-gradient(2px 2px at 72% 15%, rgba(110, 231, 249, .7) 30%, transparent 72%),
    radial-gradient(1.8px 1.8px at 48% 70%, rgba(232, 236, 248, .8) 30%, transparent 72%);
  animation:
    star-drift 90s linear infinite alternate,
    star-twinkle 6s ease-in-out infinite alternate;
}

.space-fallback__stars--near {
  background-image:
    radial-gradient(2.8px 2.8px at 12% 28%, rgba(232, 236, 248, .98) 26%, transparent 70%),
    radial-gradient(2.6px 2.6px at 36% 82%, rgba(110, 231, 249, .92) 26%, transparent 70%),
    radial-gradient(3px 3px at 59% 18%, rgba(232, 236, 248, .95) 26%, transparent 70%),
    radial-gradient(2.6px 2.6px at 74% 66%, rgba(167, 139, 250, .85) 26%, transparent 70%),
    radial-gradient(2.8px 2.8px at 91% 36%, rgba(232, 236, 248, .95) 26%, transparent 70%),
    radial-gradient(2.4px 2.4px at 21% 60%, rgba(190, 214, 255, .9) 26%, transparent 70%),
    radial-gradient(2.8px 2.8px at 47% 46%, rgba(232, 236, 248, .85) 26%, transparent 70%),
    radial-gradient(2.4px 2.4px at 84% 90%, rgba(110, 231, 249, .85) 26%, transparent 70%);
  animation:
    star-drift 62s linear infinite alternate-reverse,
    star-twinkle 4.5s ease-in-out infinite alternate;
}

.space-fallback__nebula {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 24% 30%, rgba(110, 231, 249, .09), transparent 42%),
    radial-gradient(circle at 76% 68%, rgba(167, 139, 250, .11), transparent 45%);
  animation: nebula-breathe 12s ease-in-out infinite alternate;
}

.space-fallback__system {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(52vmin, 480px);
  aspect-ratio: 1 / 1;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
}
.space-scene--orbital .space-fallback__system {
  width: min(44vmin, 380px);
}
.space-scene--mini .space-fallback__system {
  width: min(38vmin, 220px);
}

.space-fallback__orbit {
  position: absolute;
  width: 96%;
  height: 38%;
  border: 1px solid rgba(110, 231, 249, .34);
  border-radius: 50%;
  box-shadow: 0 0 16px rgba(110, 231, 249, .08), inset 0 0 12px rgba(110, 231, 249, .05);
  transform: rotate(-20deg);
}
.space-fallback__orbit::after {
  content: '';
  position: absolute;
  top: 50%;
  left: -4px;
  width: 7px;
  height: 7px;
  margin-top: -3.5px;
  border-radius: 50%;
  background: #6ee7f9;
  box-shadow: 0 0 10px #6ee7f9, 0 0 22px rgba(110, 231, 249, .6);
}

.space-fallback__orbit--two {
  width: 122%;
  height: 48%;
  border-color: rgba(167, 139, 250, .3);
  transform: rotate(24deg);
  animation: orbit-two 34s linear infinite;
}
.space-fallback__orbit--two::after {
  background: #a78bfa;
  box-shadow: 0 0 10px #a78bfa, 0 0 20px rgba(167, 139, 250, .6);
}

.space-fallback__orbit--three {
  width: 146%;
  height: 56%;
  border-color: rgba(232, 236, 248, .14);
  transform: rotate(-38deg);
  animation: orbit-three 52s linear infinite;
}
.space-fallback__orbit--three::after {
  background: #e8ecf8;
  box-shadow: 0 0 9px #e8ecf8;
}

.space-scene--orbital .space-fallback__orbit--three,
.space-scene--mini .space-fallback__orbit--two,
.space-scene--mini .space-fallback__orbit--three {
  display: none;
}

.space-fallback__planet {
  position: relative;
  width: 44%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  overflow: hidden;
  background:
    radial-gradient(circle at 30% 26%, rgba(110, 231, 249, .55), transparent 40%),
    radial-gradient(circle at 70% 72%, rgba(167, 139, 250, .5), transparent 46%),
    radial-gradient(circle at 48% 45%, #1a2454 0%, #0c1231 55%, #05060d 100%);
  box-shadow:
    inset -16px -12px 38px rgba(0, 0, 0, .78),
    inset 10px 8px 30px rgba(110, 231, 249, .08),
    0 0 48px rgba(110, 231, 249, .22),
    0 0 110px rgba(167, 139, 250, .16);
  animation: planet-spin 28s linear infinite;
}
.space-fallback__planet::before {
  content: '';
  position: absolute;
  inset: -20%;
  border-radius: 50%;
  background: repeating-linear-gradient(
    118deg,
    transparent 0 12px,
    rgba(110, 231, 249, .09) 13px 15px,
    transparent 16px 26px,
    rgba(167, 139, 250, .07) 27px 29px
  );
  animation: bands-slide 18s linear infinite;
}
.space-fallback__planet::after {
  content: '';
  position: absolute;
  inset: -18%;
  border-radius: 50%;
  background: radial-gradient(circle at 33% 27%, rgba(255, 255, 255, .16), transparent 34%);
  mix-blend-mode: screen;
}

/* --------------------------- KEYFRAMES --------------------------- */
@keyframes star-drift {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(2%, -1%, 0) scale(1.04); }
}
@keyframes star-twinkle {
  from { opacity: .45; }
  to { opacity: .95; }
}
@keyframes nebula-breathe {
  from { opacity: .6; transform: scale(1); }
  to { opacity: 1; transform: scale(1.06); }
}
@keyframes orbit-two {
  from { transform: rotate(24deg); }
  to { transform: rotate(384deg); }
}
@keyframes orbit-three {
  from { transform: rotate(-38deg); }
  to { transform: rotate(322deg); }
}
@keyframes planet-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes bands-slide {
  from { transform: translateX(-12%); }
  to { transform: translateX(12%); }
}

/* --------------------------- REDUCED MOTION --------------------------- */
@media (prefers-reduced-motion: reduce) {
  .space-scene,
  .space-scene *,
  .space-scene *::before,
  .space-scene *::after {
    animation: none !important;
    transition: none !important;
  }
}
</style>
