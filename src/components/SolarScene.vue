<script setup lang="ts">
/**
 * SolarScene — seluruh tata surya (Matahari + 8 planet), SSR-safe, self-contained.
 *
 * - Semua akses window/document/THREE terjadi di dalam onMounted / dynamic
 *   import. Tidak ada efek samping saat SSR.
 * - Tekstur NASA nyata diimpor sebagai URL Vite, dimuat via TextureLoader di
 *   client (mipmap + anisotropy + SRGBColorSpace). Gagal load -> warna fallback.
 * - WebGL / 'three' tidak tersedia -> fallback CSS tetap rapi.
 * - IntersectionObserver pause, ResizeObserver, DPR maks 2, dispose lengkap,
 *   dan hormati prefers-reduced-motion (satu frame statis).
 */

import mercuryUrl from '~/assets/textures/mercury.jpg?url'
import venusUrl from '~/assets/textures/venus.jpg?url'
import earthUrl from '~/assets/textures/earth-day.jpg?url'
import marsUrl from '~/assets/textures/mars.jpg?url'
import jupiterUrl from '~/assets/textures/jupiter.jpg?url'
import saturnUrl from '~/assets/textures/saturn.jpg?url'
import saturnRingUrl from '~/assets/textures/saturn-ring.jpg?url'
import uranusUrl from '~/assets/textures/uranus.jpg?url'
import neptuneUrl from '~/assets/textures/neptune.jpg?url'

import { onMounted, onUnmounted, ref } from 'vue'

defineOptions({ name: 'SolarScene' })

/* -------------------------------------------------------------------------- */
/*  DATA (urutan tata surya, planet dalam lebih cepat)                        */
/* -------------------------------------------------------------------------- */

interface PlanetDef {
  key: string
  name: string
  url: string
  color: number
  radius: number
  orbit: number
  orbitSpeed: number
  spinSpeed: number
  tilt: number
  angle: number
  ring?: boolean
  ringInner?: number
  ringOuter?: number
}

const PLANETS: PlanetDef[] = [
  { key: 'mercury', name: 'Merkurius', url: mercuryUrl, color: 0x9a938c, radius: 0.30, orbit: 2.3, orbitSpeed: 0.300, spinSpeed: 0.22, tilt: 0.03, angle: 0.40 },
  { key: 'venus',   name: 'Venus',     url: venusUrl,   color: 0xd8c08a, radius: 0.42, orbit: 3.2, orbitSpeed: 0.215, spinSpeed: 0.10, tilt: 3.05, angle: 2.20 },
  { key: 'earth',   name: 'Bumi',      url: earthUrl,   color: 0x2b6fc4, radius: 0.46, orbit: 4.2, orbitSpeed: 0.175, spinSpeed: 0.55, tilt: 0.41, angle: 4.10 },
  { key: 'mars',    name: 'Mars',      url: marsUrl,    color: 0xb7410e, radius: 0.36, orbit: 5.3, orbitSpeed: 0.135, spinSpeed: 0.48, tilt: 0.44, angle: 5.60 },
  { key: 'jupiter', name: 'Jupiter',   url: jupiterUrl, color: 0xc9a06f, radius: 0.95, orbit: 7.1, orbitSpeed: 0.082, spinSpeed: 0.85, tilt: 0.05, angle: 1.05 },
  { key: 'saturn',  name: 'Saturnus',  url: saturnUrl,  color: 0xe6d9a8, radius: 0.82, orbit: 9.2, orbitSpeed: 0.058, spinSpeed: 0.78, tilt: 0.47, angle: 3.30, ring: true, ringInner: 1.30, ringOuter: 2.25 },
  { key: 'uranus',  name: 'Uranus',    url: uranusUrl,  color: 0xa9dfe0, radius: 0.62, orbit: 11.2, orbitSpeed: 0.040, spinSpeed: 0.55, tilt: 1.71, angle: 0.20 },
  { key: 'neptune', name: 'Neptunus',  url: neptuneUrl, color: 0x3458d6, radius: 0.60, orbit: 13.0, orbitSpeed: 0.031, spinSpeed: 0.52, tilt: 0.49, angle: 4.70 },
]

// Label HTML: indeks 0 = Matahari, sisanya mengikuti urutan PLANETS.
const LABELS = [
  { key: 'sun', name: 'Matahari' },
  ...PLANETS.map((p) => ({ key: p.key, name: p.name })),
]

const SYSTEM_RADIUS = 14.4 // margin terluar untuk fitting kamera

/* -------------------------------------------------------------------------- */
/*  STATE RUNTIME                                                             */
/* -------------------------------------------------------------------------- */

const containerRef = ref<HTMLElement | null>(null)
const canvasHostRef = ref<HTMLElement | null>(null)
const webglReady = ref(false)
const reducedMotion = ref(false)

const labelEls: HTMLElement[] = []
function setLabel(i: number, el: any) {
  if (el) labelEls[i] = el
}

let THREE: any = null
let renderer: any = null
let scene: any = null
let camera: any = null
let system: any = null
let starField: any = null
let sunMesh: any = null
let sunGlow: any = null
let scratch: any = null
const camBase = { x: 0, y: 0, z: 0 }

interface Body {
  def: PlanetDef
  pivot: any
  mesh: any
  angle: number
}
let planets: Body[] = []

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

/* -------------------------------------------------------------------------- */
/*  TEKSTUR                                                                   */
/* -------------------------------------------------------------------------- */

function configureTexture(tex: any): any {
  if (!tex) return tex
  if (THREE?.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace
  tex.generateMipmaps = true
  if (THREE?.LinearMipmapLinearFilter) tex.minFilter = THREE.LinearMipmapLinearFilter
  if (THREE?.LinearFilter) tex.magFilter = THREE.LinearFilter
  const maxAniso = renderer?.capabilities?.getMaxAnisotropy?.() ?? 1
  tex.anisotropy = Math.min(8, maxAniso)
  tex.needsUpdate = true
  return tex
}

function loadTexture(url: string): Promise<any> {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader()
    loader.load(url, (t: any) => resolve(configureTexture(t)), undefined, () => resolve(null))
  })
}

// saturn-ring.jpg adalah strip kecerahan radial. Ubah menjadi tekstur
// konsentris yang cocok dengan UV RingGeometry (radius diukur dari tengah).
function radializeStrip(srcTex: any, innerRatio: number): any {
  const img = srcTex?.image
  if (!img || !img.width || !img.height) return null
  const sw = img.naturalWidth || img.width
  const sh = img.naturalHeight || img.height
  const sample = document.createElement('canvas')
  sample.width = sw
  sample.height = sh
  const sctx = sample.getContext('2d', { willReadFrequently: true } as any)
  if (!sctx) return null
  sctx.drawImage(img, 0, 0)
  let src: Uint8ClampedArray
  try {
    src = sctx.getImageData(0, 0, sw, sh).data
  } catch {
    return null
  }

  const size = 512
  const out = document.createElement('canvas')
  out.width = out.height = size
  const octx = out.getContext('2d')!
  const dst = octx.createImageData(size, size)
  const c = size / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const oi = (y * size + x) * 4
      const t = Math.hypot(x - c + 0.5, y - c + 0.5) / c
      if (t < innerRatio || t > 1) {
        dst.data[oi + 3] = 0
        continue
      }
      const s = (t - innerRatio) / Math.max(0.0001, 1 - innerRatio)
      const sx = Math.min(sw - 1, Math.round(s * (sw - 1)))
      const sy = Math.min(sh - 1, Math.floor(sh / 2))
      const si = (sy * sw + sx) * 4
      const lum = (src[si] * 0.299 + src[si + 1] * 0.587 + src[si + 2] * 0.114) / 255
      dst.data[oi] = 234
      dst.data[oi + 1] = 220
      dst.data[oi + 2] = 186
      dst.data[oi + 3] = Math.round((0.12 + 0.88 * lum) * 255)
    }
  }
  octx.putImageData(dst, 0, 0)
  return configureTexture(track(new THREE.CanvasTexture(out)))
}

function makeGlowTexture(): any {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,252,230,1)')
  g.addColorStop(0.18, 'rgba(255,224,150,0.92)')
  g.addColorStop(0.45, 'rgba(255,180,80,0.35)')
  g.addColorStop(1, 'rgba(255,150,60,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return configureTexture(track(new THREE.CanvasTexture(c)))
}

function makeStarSprite(): any {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(232,236,248,0.7)')
  g.addColorStop(1, 'rgba(232,236,248,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return configureTexture(track(new THREE.CanvasTexture(c)))
}

/* -------------------------------------------------------------------------- */
/*  PEMBANGUNAN OBJEK                                                         */
/* -------------------------------------------------------------------------- */

function createStarfield() {
  const count = 1400
  const geo = track(new THREE.BufferGeometry())
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = 45 + Math.random() * 55
    const theta = Math.random() * Math.PI * 2
    const u = Math.random() * 2 - 1
    const s = Math.sqrt(1 - u * u)
    pos[i * 3] = r * s * Math.cos(theta)
    pos[i * 3 + 1] = r * u
    pos[i * 3 + 2] = r * s * Math.sin(theta)
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = track(new THREE.PointsMaterial({
    color: 0xe8ecf8,
    size: 0.42,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    map: makeStarSprite(),
  }))
  starField = new THREE.Points(geo, mat)
  starField.frustumCulled = false
  scene.add(starField)
}

function createSun() {
  const geo = track(new THREE.SphereGeometry(1.5, 48, 48))
  const mat = track(new THREE.MeshBasicMaterial({ color: 0xffd27a }))
  sunMesh = new THREE.Mesh(geo, mat)
  system.add(sunMesh)

  const glowMat = track(new THREE.SpriteMaterial({
    map: makeGlowTexture(),
    color: 0xffcf66,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))
  sunGlow = new THREE.Sprite(glowMat)
  sunGlow.scale.set(9, 9, 1)
  system.add(sunGlow)

  // Cahaya di pusat: decay 0 agar planet terjauh tetap terang.
  const sunLight = track(new THREE.PointLight(0xfff0d0, 2.6, 0, 0))
  scene.add(sunLight)
  const ambient = track(new THREE.AmbientLight(0x334466, 0.55))
  scene.add(ambient)
}

function createOrbitRings() {
  const seg = 160
  for (const def of PLANETS) {
    const pts: any[] = []
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * def.orbit, 0, Math.sin(a) * def.orbit))
    }
    const geo = track(new THREE.BufferGeometry().setFromPoints(pts))
    const mat = track(new THREE.LineBasicMaterial({
      color: 0x6ee7f9, transparent: true, opacity: 0.15, depthWrite: false,
    }))
    system.add(new THREE.LineLoop(geo, mat))
  }
}

function createPlanets() {
  const sphereGeo = track(new THREE.SphereGeometry(1, 32, 24))

  planets = PLANETS.map((def) => {
    const pivot = new THREE.Group()
    system.add(pivot)

    const holder = new THREE.Group()
    holder.position.set(def.orbit, 0, 0)
    holder.rotation.z = def.tilt
    pivot.add(holder)

    const mat = track(new THREE.MeshStandardMaterial({
      color: def.color,
      roughness: 0.92,
      metalness: 0,
      emissive: new THREE.Color(def.color).multiplyScalar(0.06),
    }))
    const mesh = new THREE.Mesh(sphereGeo, mat)
    mesh.scale.setScalar(def.radius)
    holder.add(mesh)

    if (def.ring) {
      const inner = def.radius * (def.ringInner ?? 1.3)
      const outer = def.radius * (def.ringOuter ?? 2.2)
      const ringGeo = track(new THREE.RingGeometry(inner, outer, 96))
      const ringMat = track(new THREE.MeshStandardMaterial({
        color: 0xe8dcb8,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
        depthWrite: false,
        roughness: 1,
        metalness: 0,
      }))
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = -Math.PI / 2
      holder.add(ring)
      ;(mesh as any).__ring = ring
    }

    const body: Body = { def, pivot, mesh, angle: def.angle }
    pivot.rotation.y = def.angle
    return body
  })
}

async function upgradeTextures() {
  const keys = PLANETS.map((p) => p.key)
  const results = await Promise.all([
    ...PLANETS.map((p) => loadTexture(p.url)),
    loadTexture(saturnRingUrl),
  ])
  if (isDisposed) {
    results.forEach((t) => t?.dispose?.())
    return
  }

  PLANETS.forEach((def, i) => {
    const tex = results[i]
    if (!tex) return
    track(tex)
    const body = planets.find((b) => b.def.key === keys[i])
    if (!body?.mesh?.material) return
    body.mesh.material.map = tex
    body.mesh.material.color.set(0xffffff)
    body.mesh.material.emissive.set(0x000000)
    body.mesh.material.needsUpdate = true
  })

  const ringStrip = results[results.length - 1]
  if (!ringStrip) return
  const saturn = planets.find((b) => b.def.key === 'saturn')
  const ring: any = saturn && (saturn.mesh as any).__ring
  if (ring?.material) {
    const innerRatio = (saturn!.def.ringInner ?? 1.3) / (saturn!.def.ringOuter ?? 2.2)
    const ringTex = radializeStrip(ringStrip, innerRatio)
    if (ringTex) {
      ring.material.map = ringTex
      ring.material.needsUpdate = true
    }
  }
  ringStrip.dispose?.()
}

/* -------------------------------------------------------------------------- */
/*  KAMERA & LABEL                                                            */
/* -------------------------------------------------------------------------- */

function applyFit() {
  const container = containerRef.value
  if (!camera || !renderer || !container) return
  const w = Math.max(1, container.clientWidth)
  const h = Math.max(1, container.clientHeight)
  const aspect = w / h
  const halfV = Math.tan((camera.fov * Math.PI) / 180 / 2)
  const dist = Math.min(92, Math.max(24, SYSTEM_RADIUS / (halfV * aspect)))

  const dir = new THREE.Vector3(0, 0.66, 0.75).normalize().multiplyScalar(dist)
  camBase.x = dir.x
  camBase.y = dir.y
  camBase.z = dir.z
  camera.position.set(camBase.x, camBase.y, camBase.z)
  camera.aspect = aspect
  camera.lookAt(0, 0, 0)
  camera.updateProjectionMatrix()

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(w, h)
}

function updateLabels() {
  if (!camera || !scratch) return
  const container = containerRef.value
  if (!container) return
  const w = container.clientWidth
  const h = container.clientHeight
  const targets: any[] = [sunMesh, ...planets.map((p) => p.mesh)]
  for (let i = 0; i < LABELS.length; i++) {
    const el = labelEls[i]
    const obj = targets[i]
    if (!el) continue
    if (!obj || !camera) {
      el.style.opacity = '0'
      continue
    }
    obj.getWorldPosition(scratch)
    scratch.project(camera)
    if (scratch.z > 1) {
      el.style.opacity = '0'
      continue
    }
    let x = (scratch.x * 0.5 + 0.5) * w
    let y = (-scratch.y * 0.5 + 0.5) * h
    // Matahari di-offset ke atas agar tidak tumpang tindih dengan Merkurius.
    if (i === 0) y -= 26
    // Clamp ke dalam panel supaya label planet terluar (Neptunus) tetap terlihat.
    x = Math.max(36, Math.min(w - 36, x))
    y = Math.max(16, Math.min(h - 16, y))
    el.style.opacity = '1'
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
  }
}

/* -------------------------------------------------------------------------- */
/*  INISIALISASI                                                              */
/* -------------------------------------------------------------------------- */

function initScene(threeModule: any) {
  THREE = threeModule
  const container = containerRef.value
  const host = canvasHostRef.value
  if (!container || !host || isDisposed) return

  const w = Math.max(1, container.clientWidth)
  const h = Math.max(1, container.clientHeight)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 400)

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(w, h)
  renderer.setClearColor(0x05060d, 0)
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace
  if (THREE.ACESFilmicToneMapping) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
  }
  host.appendChild(renderer.domElement)

  scratch = new THREE.Vector3()
  system = new THREE.Group()
  scene.add(system)

  createStarfield()
  createOrbitRings()
  createSun()
  createPlanets()
  applyFit()

  bindEvents()

  resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(container)

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true
      if (isVisible) start()
      else stop()
    },
    { threshold: 0.02 },
  )
  intersectionObserver.observe(container)

  webglReady.value = true
  start()
  void upgradeTextures()
}

/* -------------------------------------------------------------------------- */
/*  EVENT                                                                     */
/* -------------------------------------------------------------------------- */

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
      camera.position.set(camBase.x, camBase.y, camBase.z)
      camera.lookAt(0, 0, 0)
    }
    start() // satu frame statis yang rapi
  } else if (isVisible) {
    start()
  }
}

function handleResize() {
  if (isDisposed || !renderer) return
  applyFit()
  if (reducedMotion.value) start()
}

/* -------------------------------------------------------------------------- */
/*  LOOP                                                                      */
/* -------------------------------------------------------------------------- */

function tick(now: number) {
  if (!running || isDisposed || !renderer) return
  rafId = requestAnimationFrame(tick)

  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0)
  lastTime = now

  const ease = Math.min(1, dt * 4)
  pointer.x += (pointerTarget.x - pointer.x) * ease
  pointer.y += (pointerTarget.y - pointer.y) * ease

  if (!reducedMotion.value) {
    for (const p of planets) {
      p.angle += dt * p.def.orbitSpeed
      p.pivot.rotation.y = p.angle
      p.mesh.rotation.y += dt * p.def.spinSpeed
    }
    if (sunMesh) sunMesh.rotation.y += dt * 0.05
    if (starField) starField.rotation.y += dt * 0.004

    if (camera) {
      camera.position.set(
        camBase.x + pointer.x * 2.4,
        camBase.y - pointer.y * 1.8,
        camBase.z,
      )
      camera.lookAt(0, 0, 0)
    }
  }

  renderer.render(scene, camera)
  updateLabels()

  if (reducedMotion.value) stop()
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

/* -------------------------------------------------------------------------- */
/*  SIKLUS HIDUP                                                              */
/* -------------------------------------------------------------------------- */

onMounted(async () => {
  if (typeof window === 'undefined') return

  if (typeof window.matchMedia === 'function') {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = mediaQuery.matches
    mediaQuery.addEventListener('change', handleMotionChange)
  }

  if (!supportsWebGL()) return

  try {
    // @ts-ignore -- 'three' opsional; fallback CSS menutupi ketiadaannya.
    const threeModule = await import('three')
    if (isDisposed || !threeModule) return
    initScene(threeModule)
  } catch {
    // Biarkan fallback CSS tampil.
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

  if (renderer) {
    try { renderer.dispose() } catch { /* abaikan */ }
    const el = renderer.domElement
    if (el && el.parentNode) el.parentNode.removeChild(el)
  }

  renderer = null
  scene = null
  camera = null
  system = null
  starField = null
  sunMesh = null
  sunGlow = null
  scratch = null
  planets = []
  labelEls.length = 0
  THREE = null
})
</script>

<template>
  <div ref="containerRef" class="solar-scene" aria-hidden="true">
    <!-- Kanvas WebGL (diisi secara dinamis di onMounted) -->
    <div ref="canvasHostRef" class="solar-scene__canvas"></div>

    <!-- Label nama planet (HTML overlay, diposisikan dari proyeksi 3D) -->
    <div class="solar-labels">
      <span
        v-for="(l, i) in LABELS"
        :key="l.key"
        :ref="(el) => setLabel(i, el)"
        class="solar-label"
        :class="{ 'solar-label--sun': i === 0 }"
      >{{ l.name }}</span>
    </div>

    <!-- Fallback CSS: tampil default, memudar saat WebGL siap -->
    <div class="solar-fallback" :class="{ 'solar-fallback--hidden': webglReady }">
      <div class="sf-orbit sf-orbit--a"></div>
      <div class="sf-orbit sf-orbit--b"></div>
      <div class="sf-orbit sf-orbit--c"></div>
      <div class="sf-orbit sf-orbit--d"></div>
      <div class="sf-sun"></div>
      <span class="sf-dot sf-dot--1"></span>
      <span class="sf-dot sf-dot--2"></span>
      <span class="sf-dot sf-dot--3"></span>
      <span class="sf-dot sf-dot--4"></span>
    </div>
  </div>
</template>

<style scoped>
.solar-scene {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
  background: radial-gradient(ellipse 70% 70% at 50% 50%, #0b1030 0%, #070b1c 46%, #05060d 100%);
}

.solar-scene__canvas,
.solar-scene__canvas :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

/* --------------------------- LABEL --------------------------- */
.solar-labels {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.solar-label {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  white-space: nowrap;
  font-family: var(--display);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--ink);
  padding: 2px 7px;
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  background: rgba(5, 6, 13, 0.55);
  backdrop-filter: blur(3px);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
  will-change: transform, opacity;
  transition: opacity 300ms ease;
}
.solar-label--sun {
  color: #ffe6a8;
  border-color: rgba(255, 210, 122, 0.35);
}

/* --------------------------- FALLBACK --------------------------- */
.solar-fallback {
  position: absolute;
  inset: 0;
  overflow: hidden;
  transition: opacity 700ms ease;
}
.solar-fallback--hidden {
  opacity: 0;
}
.sf-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px solid rgba(110, 231, 249, 0.28);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(-16deg);
}
.sf-orbit--a { width: 26%; height: 12%; }
.sf-orbit--b { width: 44%; height: 21%; border-color: rgba(167, 139, 250, 0.26); transform: translate(-50%, -50%) rotate(20deg); }
.sf-orbit--c { width: 64%; height: 31%; animation: sf-spin-c 60s linear infinite; }
.sf-orbit--d { width: 88%; height: 43%; border-color: rgba(232, 236, 248, 0.14); transform: translate(-50%, -50%) rotate(-24deg); }
.sf-sun {
  position: absolute;
  top: 50%;
  left: 50%;
  width: clamp(40px, 8%, 78px);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle at 40% 40%, #fff4c6, #ffcf66 45%, #ff9a3c 100%);
  box-shadow: 0 0 36px rgba(255, 200, 100, 0.7), 0 0 90px rgba(255, 160, 70, 0.4);
}
.sf-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
.sf-dot--1 { background: #9a938c; box-shadow: 0 0 10px #9a938c; animation: sf-orbit-a 9s linear infinite; }
.sf-dot--2 { background: #6ea8e0; box-shadow: 0 0 10px #6ea8e0; animation: sf-orbit-b 15s linear infinite; }
.sf-dot--3 { background: #c9a06f; box-shadow: 0 0 12px #c9a06f; width: 16px; height: 16px; animation: sf-orbit-c 28s linear infinite; }
.sf-dot--4 { background: #3458d6; box-shadow: 0 0 12px #3458d6; animation: sf-orbit-d 44s linear infinite; }

@keyframes sf-spin-c {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes sf-orbit-a {
  from { transform: translate(-50%, -50%) rotate(0deg) translateX(13%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg) translateX(13%) rotate(-360deg); }
}
@keyframes sf-orbit-b {
  from { transform: translate(-50%, -50%) rotate(60deg) translateX(22%) rotate(-60deg); }
  to { transform: translate(-50%, -50%) rotate(420deg) translateX(22%) rotate(-420deg); }
}
@keyframes sf-orbit-c {
  from { transform: translate(-50%, -50%) rotate(120deg) translateX(32%) rotate(-120deg); }
  to { transform: translate(-50%, -50%) rotate(480deg) translateX(32%) rotate(-480deg); }
}
@keyframes sf-orbit-d {
  from { transform: translate(-50%, -50%) rotate(200deg) translateX(44%) rotate(-200deg); }
  to { transform: translate(-50%, -50%) rotate(560deg) translateX(44%) rotate(-560deg); }
}

@media (prefers-reduced-motion: reduce) {
  .solar-scene,
  .solar-scene *,
  .solar-scene *::before,
  .solar-scene *::after {
    animation: none !important;
    transition: none !important;
  }
}
</style>
