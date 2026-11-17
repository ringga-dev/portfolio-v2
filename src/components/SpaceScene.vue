<script setup lang="ts">
/**
 * SpaceScene — Bumi realistik, SSR-safe, self-contained.
 *
 * API (jangan diubah):
 *   <SpaceScene variant="hero" style="position:absolute; inset:0; z-index:0" />
 *   variant: 'hero' | 'orbital' | 'mini'
 *   class / atribut pemakai diteruskan ke elemen akar (inheritAttrs: false).
 *
 * Arsitektur:
 *  - Semua akses window/document/THREE terjadi di dalam onMounted / dynamic
 *    import. Tidak ada efek samping di SSR.
 *  - Tekstur NASA (day / night / topology / water) diimpor sebagai URL Vite,
 *    dimuat dengan TextureLoader di client. Jika gagal -> material biru +
 *    wireframe tetap tampil.
 *  - Jika three gagal diimpor / WebGL tidak ada -> fallback CSS tetap rapi.
 */

// URL Vite (string pada SSR; tidak menyentuh DOM). Nama file sesuai kontrak.
import dayUrl from '~/assets/textures/earth-day.jpg?url'
import nightUrl from '~/assets/textures/earth-night.jpg?url'
import topoUrl from '~/assets/textures/earth-topology.jpg?url'
import waterUrl from '~/assets/textures/earth-water.jpg?url'
import cloudsUrl from '~/assets/textures/earth-clouds.jpg?url'

import {
  onMounted,
  onUnmounted,
  ref,
  useAttrs,
} from 'vue'

defineOptions({
  name: 'SpaceScene',
  inheritAttrs: false,
})

type Variant = 'hero' | 'orbital' | 'mini'

interface VariantConfig {
  stars: number
  dust: number
  radius: number
  segW: number
  segH: number
  cameraZ: number
  arcs: number
}

const props = withDefaults(defineProps<{ variant?: Variant }>(), { variant: 'hero' })
const attrs = useAttrs()

const CONFIG: Record<Variant, VariantConfig> = {
  hero: { stars: 1900, dust: 300, radius: 1.5, segW: 64, segH: 48, cameraZ: 6.4, arcs: 28 },
  orbital: { stars: 1600, dust: 240, radius: 1.35, segW: 56, segH: 40, cameraZ: 6.2, arcs: 22 },
  mini: { stars: 1500, dust: 140, radius: 1.1, segW: 40, segH: 28, cameraZ: 5.6, arcs: 20 },
}

const PALETTE = {
  star: 0xe8ecf8,
  cyan: 0x6ee7f9,
  violet: 0xa78bfa,
}

const containerRef = ref<HTMLElement | null>(null)
const canvasHostRef = ref<HTMLElement | null>(null)
const webglReady = ref(false)
const reducedMotion = ref(false)

/* -------------------------------------------------------------------------- */
/*  DATA KOTA & RUTE                                                           */
/* -------------------------------------------------------------------------- */

const CITIES: Array<{ lat: number; lon: number }> = [
  { lat: -6.21, lon: 106.85 }, // Jakarta
  { lat: 1.35, lon: 103.82 },  // Singapore
  { lat: 35.68, lon: 139.69 }, // Tokyo
  { lat: 51.51, lon: -0.13 },  // London
  { lat: 40.71, lon: -74.01 }, // New York
  { lat: 37.77, lon: -122.42 },// San Francisco
  { lat: -33.87, lon: 151.21 },// Sydney
  { lat: 25.20, lon: 55.27 },  // Dubai
  { lat: 19.08, lon: 72.88 },  // Mumbai
  { lat: -23.55, lon: -46.63 },// São Paulo
  { lat: 6.52, lon: 3.38 },    // Lagos
  { lat: 50.11, lon: 8.68 },   // Frankfurt
  { lat: 37.57, lon: 126.98 }, // Seoul
  { lat: 22.32, lon: 114.17 }, // Hong Kong
  { lat: 55.76, lon: 37.62 },  // Moscow
  { lat: -26.20, lon: 28.05 }, // Johannesburg
]

// 28 rute masuk akal (index城市). Dipangkas sesuai config.arcs untuk mini.
const ROUTES: Array<[number, number]> = [
  [0, 1], [0, 2], [1, 2], [1, 13], [2, 12], [2, 4], [2, 5],
  [3, 4], [3, 11], [3, 9], [3, 14], [4, 5], [4, 9], [5, 6],
  [1, 7], [1, 8], [7, 8], [7, 3], [7, 14], [8, 10], [9, 10],
  [10, 15], [11, 14], [13, 2], [12, 13], [6, 1], [14, 2], [15, 7],
]

/* -------------------------------------------------------------------------- */
/*  STATE RUNTIME                                                              */
/* -------------------------------------------------------------------------- */

let THREE: any = null
let renderer: any = null
let scene: any = null
let camera: any = null
let world: any = null
let tiltGroup: any = null
let earthSpin: any = null

let starField: any = null
let starMaterial: any = null
let dustField: any = null
let sunLight: any = null

let earthMesh: any = null
let earthUniforms: any = null
let fallbackWire: any = null
let clouds: any = null

let networkGroup: any = null
let nodePoints: any = null
let pulsePoints: any = null
let pulsePositions: Float32Array | null = null

interface ArcData {
  pts: any[] // Vector3[]
  speed: number
  offset: number
}
interface RingData { mesh: any; base: number; phase: number }

let arcs: ArcData[] = []
let rings: RingData[] = []
let cityVectors: any[] = []

const sunDir: any = { x: 0, y: 0, z: 0, copy(v: any) { this.x = v.x; this.y = v.y; this.z = v.z; return this }, normalize() { const l = Math.hypot(this.x, this.y, this.z) || 1; this.x /= l; this.y /= l; this.z /= l; return this }, set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; return this } }
let sunAngle = 0.6

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
/*  SHADER SOURCE                                                              */
/* -------------------------------------------------------------------------- */

const EARTH_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const EARTH_FRAG = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uTopo;
  uniform sampler2D uWater;
  uniform vec3 uSunDirection;
  uniform float uTexel;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  vec3 srgbToLinear(vec3 c) { return pow(c, vec3(2.2)); }
  vec3 linearToSrgb(vec3 c) { return pow(c, vec3(1.0 / 2.2)); }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(uSunDirection);
    vec3 V = normalize(cameraPosition - vWorldPos);

    // Topografi -> normal kasar (bump) lewat turunan tekstur.
    vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), N) + vec3(1e-5));
    vec3 B = cross(N, T);
    float hL = texture2D(uTopo, vUv - vec2(uTexel, 0.0)).r;
    float hR = texture2D(uTopo, vUv + vec2(uTexel, 0.0)).r;
    float hD = texture2D(uTopo, vUv - vec2(0.0, uTexel)).r;
    float hU = texture2D(uTopo, vUv + vec2(0.0, uTexel)).r;
    vec3 Nb = normalize(N - ((hR - hL) * T + (hU - hD) * B) * 0.55);

    float ndl = dot(Nb, L);
    float day = smoothstep(-0.18, 0.28, ndl); // terminator lembut

    vec3 dayCol = srgbToLinear(texture2D(uDay, vUv).rgb);
    vec3 nightCol = srgbToLinear(texture2D(uNight, vUv).rgb);

    // Siang: Blue Marble + pencahayaan diffuse.
    float diffuse = clamp(ndl, 0.0, 1.0);
    vec3 lit = dayCol * (0.16 + 0.92 * diffuse);

    // Specular pada laut (water mask).
    float water = smoothstep(0.32, 0.75, texture2D(uWater, vUv).r);
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(Nb, H), 0.0), 70.0);
    vec3 specCol = vec3(0.55, 0.78, 1.0) * spec * water * day * 1.2;

    // Malam: city lights menyala.
    vec3 city = nightCol * 1.75;
    vec3 nightAmbient = vec3(0.010, 0.018, 0.045);
    vec3 nightSide = city + nightAmbient;

    vec3 color = mix(nightSide, lit + specCol, day);

    // Glow tipis di terminator / tepi.
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * day;
    color += vec3(0.10, 0.28, 0.42) * rim * 0.55;

    gl_FragColor = vec4(linearToSrgb(color), 1.0);
  }
`

const ATMO_VERT = /* glsl */ `
  varying vec3 vViewNormal;
  varying vec3 vViewPos;
  void main() {
    vViewNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vViewNormal;
  varying vec3 vViewPos;
  void main() {
    vec3 V = normalize(-vViewPos);
    // BackSide: normal menjauhi kamera -> 1+dot tinggi hanya di siluet.
    float f = clamp(1.0 + dot(normalize(vViewNormal), V), 0.0, 1.0);
    float rim = pow(f, uPower);
    vec3 col = mix(uColorA, uColorB, clamp(vViewNormal.y * 0.5 + 0.5, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0) * rim * uIntensity;
  }
`

/* -------------------------------------------------------------------------- */
/*  HELPERS GEOMETRI                                                           */
/* -------------------------------------------------------------------------- */

function slerpUnit(a: any, b: any, t: number) {
  const dot = Math.max(-1, Math.min(1, a.dot(b)))
  const omega = Math.acos(dot)
  if (omega < 1e-4) return a.clone().lerp(b, t).normalize()
  const so = Math.sin(omega)
  return a.clone()
    .multiplyScalar(Math.sin((1 - t) * omega) / so)
    .add(b.clone().multiplyScalar(Math.sin(t * omega) / so))
    .normalize()
}

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function makeGlowSprite() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(190,244,255,0.9)')
  g.addColorStop(1, 'rgba(110,231,249,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return track(new THREE.CanvasTexture(c))
}

function makeSolidTexture(r: number, g: number, b: number) {
  const tex = track(new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1, THREE.RGBAFormat))
  tex.needsUpdate = true
  return tex
}

function loadTexture(url: string): Promise<any> {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (t: any) => {
        if (renderer?.capabilities?.getMaxAnisotropy) {
          t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())
        }
        resolve(t)
      },
      undefined,
      () => resolve(null),
    )
  })
}

/* -------------------------------------------------------------------------- */
/*  PEMBANGUNAN OBJEK                                                          */
/* -------------------------------------------------------------------------- */

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
      const r = 2.2 + Math.random() * 4.4
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * 0.9
      positions[i3] = Math.cos(theta) * Math.cos(phi) * r
      positions[i3 + 1] = Math.sin(phi) * r * 0.55
      positions[i3 + 2] = Math.sin(theta) * Math.cos(phi) * r
    } else {
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

  const material = track(new THREE.PointsMaterial({
    size: isDust ? 0.055 : 0.085,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: isDust ? 0.5 : 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }))

  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  return { points, material }
}

function createEarth(cfg: VariantConfig) {
  // Material biru + wireframe sebagai fallback (diganti saat tekstur termuat).
  const geo = track(new THREE.SphereGeometry(cfg.radius, cfg.segW, cfg.segH))
  const mat = track(new THREE.MeshStandardMaterial({
    color: 0x14306b,
    emissive: 0x0a1a3a,
    emissiveIntensity: 0.55,
    metalness: 0.12,
    roughness: 0.85,
  }))
  earthMesh = new THREE.Mesh(geo, mat)
  earthSpin.add(earthMesh)

  const wireGeo = track(new THREE.SphereGeometry(cfg.radius * 1.006, 28, 20))
  const wireMat = track(new THREE.MeshBasicMaterial({
    color: PALETTE.cyan,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  }))
  fallbackWire = new THREE.Mesh(wireGeo, wireMat)
  earthSpin.add(fallbackWire)

  // Awan: sphere transparan sedikit lebih besar; alphaMap dari tekstur NASA
  // (grayscale fair-weather clouds) dipasang saat tekstur termuat.
  const cloudGeo = track(new THREE.SphereGeometry(cfg.radius * 1.016, cfg.segW, cfg.segH))
  const cloudMat = track(new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0, // tidak tampil sampai alphaMap nyata tersedia
    alphaMap: null,
    depthWrite: false,
    roughness: 1,
    metalness: 0,
  }))
  clouds = new THREE.Mesh(cloudGeo, cloudMat)
  clouds.visible = false
  earthSpin.add(clouds)
}

function createAtmosphere(cfg: VariantConfig) {
  const makeMat = (a: number, b: number, power: number, intensity: number) => track(
    new THREE.ShaderMaterial({
      uniforms: {
        uColorA: { value: new THREE.Color(a) },
        uColorB: { value: new THREE.Color(b) },
        uPower: { value: power },
        uIntensity: { value: intensity },
      },
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  )

  // Glow utama + halo tipis.
  const glowGeo = track(new THREE.SphereGeometry(cfg.radius * 1.16, 48, 48))
  const glow = new THREE.Mesh(glowGeo, makeMat(PALETTE.cyan, 0x2b6cff, 2.6, 0.95))
  tiltGroup.add(glow)

  const haloGeo = track(new THREE.SphereGeometry(cfg.radius * 1.3, 48, 48))
  const halo = new THREE.Mesh(haloGeo, makeMat(0x2b6cff, PALETTE.violet, 3.6, 0.32))
  tiltGroup.add(halo)
}

function createNetwork(cfg: VariantConfig) {
  networkGroup = new THREE.Group()
  earthSpin.add(networkGroup)

  const surfaceR = cfg.radius * 1.012
  cityVectors = CITIES.map((c) => latLonToVector3(c.lat, c.lon, surfaceR))

  const sprite = makeGlowSprite()

  // Node: titik menyala + cincin pulsing.
  const nodeGeo = track(new THREE.BufferGeometry())
  const nodePos = new Float32Array(CITIES.length * 3)
  const nodeCol = new Float32Array(CITIES.length * 3)
  const cCyan = new THREE.Color(PALETTE.cyan)
  const cViolet = new THREE.Color(PALETTE.violet)
  cityVectors.forEach((v, i) => {
    nodePos[i * 3] = v.x
    nodePos[i * 3 + 1] = v.y
    nodePos[i * 3 + 2] = v.z
    const c = i % 3 === 0 ? cViolet : cCyan
    nodeCol[i * 3] = c.r
    nodeCol[i * 3 + 1] = c.g
    nodeCol[i * 3 + 2] = c.b
  })
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3))
  nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeCol, 3))
  const nodeMat = track(new THREE.PointsMaterial({
    size: 0.085,
    map: sprite,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  }))
  nodePoints = new THREE.Points(nodeGeo, nodeMat)
  networkGroup.add(nodePoints)

  rings = []
  const ringGeo = track(new THREE.RingGeometry(0.032, 0.046, 24))
  cityVectors.forEach((v, i) => {
    const ringMat = track(new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? PALETTE.violet : PALETTE.cyan,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }))
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.position.copy(v).multiplyScalar(1.004)
    ring.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      v.clone().normalize(),
    )
    networkGroup.add(ring)
    rings.push({ mesh: ring, base: 1 + (i % 3) * 0.15, phase: i * 0.7 })
  })

  // Busur great-circle + pulse cahaya bergerak.
  arcs = []
  const routeCount = Math.min(ROUTES.length, cfg.arcs)
  for (let i = 0; i < routeCount; i++) {
    const [ia, ib] = ROUTES[i]
    const va = cityVectors[ia].clone().normalize()
    const vb = cityVectors[ib].clone().normalize()
    const angle = va.angleTo(vb)
    const bulge = 0.12 + angle * 0.2
    const segments = 40
    const pts: any[] = []
    for (let s = 0; s <= segments; s++) {
      const t = s / segments
      const dir = slerpUnit(va, vb, t)
      const r = cfg.radius * (1 + Math.sin(Math.PI * t) * bulge)
      pts.push(dir.multiplyScalar(r))
    }

    const g = track(new THREE.BufferGeometry())
    g.setAttribute('position', new THREE.Float32BufferAttribute(
      pts.flatMap((p) => [p.x, p.y, p.z]), 3,
    ))
    const lineMat = track(new THREE.LineBasicMaterial({
      color: i % 2 === 0 ? PALETTE.cyan : PALETTE.violet,
      transparent: true,
      opacity: props.variant === 'mini' ? 0.16 : 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }))
    networkGroup.add(new THREE.Line(g, lineMat))

    arcs.push({ pts, speed: 0.14 + Math.random() * 0.12, offset: (i * 0.37) % 1 })
  }

  // Satu Points untuk semua pulse (satu vertex per busur).
  const pulseGeo = track(new THREE.BufferGeometry())
  pulsePositions = new Float32Array(arcs.length * 3)
  arcs.forEach((a, i) => {
    const p = sampleArc(a, a.offset)
    pulsePositions![i * 3] = p.x
    pulsePositions![i * 3 + 1] = p.y
    pulsePositions![i * 3 + 2] = p.z
  })
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3))
  const pulseMat = track(new THREE.PointsMaterial({
    size: 0.15,
    map: sprite,
    color: 0xa8f4ff,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  }))
  pulsePoints = new THREE.Points(pulseGeo, pulseMat)
  networkGroup.add(pulsePoints)
}

function sampleArc(arc: ArcData, t: number) {
  const f = Math.max(0, Math.min(0.99999, t))
  const idx = Math.floor(f * (arc.pts.length - 1))
  return arc.pts[idx].clone().lerp(arc.pts[idx + 1], f * (arc.pts.length - 1) - idx)
}

/* -------------------------------------------------------------------------- */
/*  TEKSTUR -> SHADER MATERIAL                                                 */
/* -------------------------------------------------------------------------- */

async function upgradeEarthMaterials() {
  const results = await Promise.all([
    loadTexture(dayUrl),
    loadTexture(nightUrl),
    loadTexture(topoUrl),
    loadTexture(waterUrl),
    loadTexture(cloudsUrl),
  ])
  if (isDisposed) {
    results.forEach((t) => t?.dispose?.())
    return
  }

  const [day, night, topo, water, cloudTex] = results

  // Awan memakai tekstur NASA nyata sebagai alphaMap (bukan prosedural).
  if (cloudTex && clouds) {
    track(cloudTex)
    clouds.material.alphaMap = cloudTex
    clouds.material.opacity = 0.9
    clouds.material.needsUpdate = true
    clouds.visible = true
  }

  if (!earthMesh) return

  // Tanpa day/night: pertahankan fallback biru + wireframe.
  if (!day || !night) {
    [day, night, topo, water].forEach((t) => t?.dispose?.())
    return
  }

  // Bersihkan material fallback.
  if (fallbackWire) {
    earthSpin.remove(fallbackWire)
    fallbackWire = null
  }
  const oldMat = earthMesh.material
  earthMesh.material = null
  oldMat?.dispose?.()

  const topoTex = topo ?? makeSolidTexture(0, 0, 0)
  const waterTex = water ?? makeSolidTexture(0, 0, 0)
  if (topo) track(topo)
  if (water) track(water)
  track(day)
  track(night)

  earthUniforms = {
    uDay: { value: day },
    uNight: { value: night },
    uTopo: { value: topoTex },
    uWater: { value: waterTex },
    uSunDirection: { value: new THREE.Vector3(sunDir.x, sunDir.y, sunDir.z) },
    uTexel: { value: 1 / 1024 },
  }

  const shaderMat = track(new THREE.ShaderMaterial({
    uniforms: earthUniforms,
    vertexShader: EARTH_VERT,
    fragmentShader: EARTH_FRAG,
  }))
  earthMesh.material = shaderMat
}

/* -------------------------------------------------------------------------- */
/*  INISIALISASI                                                               */
/* -------------------------------------------------------------------------- */

function applyFit(aspect: number) {
  if (!world) return
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

  // Cahaya: ambient rendah + matahari (mengikuti sunDirection) + fill.
  const ambient = new THREE.AmbientLight(0x2a3a66, 0.45)
  sunLight = new THREE.DirectionalLight(0xfff3e0, 2.1)
  const fill = new THREE.PointLight(PALETTE.violet, 8, 40)
  fill.position.set(-4, 2, 3)
  for (const light of [ambient, sunLight, fill]) {
    scene.add(light)
    if (typeof light.dispose === 'function') track(light)
  }
  sunDir.set(Math.cos(sunAngle), 0.18, Math.sin(sunAngle)).normalize()
  sunLight.position.set(sunDir.x * 8, sunDir.y * 8, sunDir.z * 8)

  world = new THREE.Group()
  scene.add(world)

  const stars = createStarfield(cfg.stars)
  starField = stars.points
  starMaterial = stars.material
  scene.add(starField)

  const dust = createStarfield(cfg.dust, true)
  dustField = dust.points
  world.add(dustField)

  // Bumi: kemiringan sumbu ~23.4 derajat.
  tiltGroup = new THREE.Group()
  tiltGroup.rotation.z = 23.4 * (Math.PI / 180)
  world.add(tiltGroup)

  earthSpin = new THREE.Group()
  tiltGroup.add(earthSpin)

  createEarth(cfg)
  createAtmosphere(cfg)
  createNetwork(cfg)

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
  start()
  void upgradeEarthMaterials()
}

/* -------------------------------------------------------------------------- */
/*  EVENT                                                                      */
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

/* -------------------------------------------------------------------------- */
/*  LOOP                                                                       */
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
    const t = now * 0.001

    // Rotasi Bumi + awan lebih cepat.
    if (earthSpin) earthSpin.rotation.y += dt * 0.2
    if (clouds) clouds.rotation.y += dt * 0.06

    // Siklus siang/malam: matahari berputar perlahan.
    sunAngle += dt * 0.055
    sunDir.set(Math.cos(sunAngle), 0.18, Math.sin(sunAngle)).normalize()
    if (sunLight) sunLight.position.set(sunDir.x * 8, sunDir.y * 8, sunDir.z * 8)
    if (earthUniforms) earthUniforms.uSunDirection.value.set(sunDir.x, sunDir.y, sunDir.z)

    // Latar.
    if (starField) {
      starField.rotation.y = t * 0.008 + pointer.x * 0.12
      starField.rotation.x = -pointer.y * 0.08
    }
    if (starMaterial) starMaterial.opacity = 0.72 + Math.sin(t * 1.6) * 0.16
    if (dustField) {
      dustField.rotation.y = -t * 0.018
      dustField.rotation.x = pointer.y * 0.04
    }

    // Cincin node berdenyut.
    for (let i = 0; i < rings.length; i++) {
      const r = rings[i]
      const p = (t * 0.6 + r.phase) % 1
      const s = r.base * (1 + p * 0.9)
      r.mesh.scale.setScalar(s)
      r.mesh.material.opacity = 0.42 * (1 - p)
    }

    // Pulse cahaya sepanjang busur.
    if (pulsePositions) {
      for (let i = 0; i < arcs.length; i++) {
        const a = arcs[i]
        const p = sampleArc(a, (t * a.speed + a.offset) % 1)
        pulsePositions[i * 3] = p.x
        pulsePositions[i * 3 + 1] = p.y
        pulsePositions[i * 3 + 2] = p.z
      }
      if (pulsePoints) pulsePoints.geometry.attributes.position.needsUpdate = true
    }

    // Parallax pointer.
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

/* -------------------------------------------------------------------------- */
/*  SIKLUS HIDUP                                                               */
/* -------------------------------------------------------------------------- */

onMounted(async () => {
  // SSR aman: seluruh akses window/document ada di dalam onMounted.
  if (typeof window === 'undefined') return

  if (typeof window.matchMedia === 'function') {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = mediaQuery.matches
    mediaQuery.addEventListener('change', handleMotionChange)
  }

  if (!supportsWebGL()) return // biarkan fallback CSS tampil

  try {
    // @ts-ignore -- 'three' opsional; fallback CSS menutupi ketiadaannya.
    const threeModule = await import('three')
    if (isDisposed || !threeModule) return
    initScene(threeModule)
  } catch {
    // Impor gagal -> fallback CSS tetap terlihat.
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
  arcs = []
  rings = []
  cityVectors = []

  if (renderer) {
    try { renderer.dispose() } catch { /* abaikan */ }
    const el = renderer.domElement
    if (el && el.parentNode) el.parentNode.removeChild(el)
  }

  renderer = null
  scene = null
  camera = null
  world = null
  tiltGroup = null
  earthSpin = null
  starField = null
  starMaterial = null
  dustField = null
  sunLight = null
  earthMesh = null
  earthUniforms = null
  fallbackWire = null
  clouds = null
  networkGroup = null
  nodePoints = null
  pulsePoints = null
  pulsePositions = null
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
        <div class="space-fallback__net">
          <span class="space-fallback__link space-fallback__link--a"></span>
          <span class="space-fallback__link space-fallback__link--b"></span>
          <span class="space-fallback__link space-fallback__link--c"></span>
          <span class="space-fallback__node space-fallback__node--a"></span>
          <span class="space-fallback__node space-fallback__node--b"></span>
          <span class="space-fallback__node space-fallback__node--c"></span>
          <span class="space-fallback__node space-fallback__node--d"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.space-scene {
  /* Grid membuat semua layer bertumpuk tanpa position:relative,
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
    radial-gradient(circle at 30% 26%, rgba(110, 231, 249, .5), transparent 42%),
    radial-gradient(circle at 74% 72%, rgba(167, 139, 250, .38), transparent 48%),
    radial-gradient(circle at 46% 44%, #16427a 0%, #0c1e46 52%, #05060d 100%);
  box-shadow:
    inset -16px -12px 38px rgba(0, 0, 0, .82),
    inset 10px 8px 30px rgba(110, 231, 249, .1),
    0 0 48px rgba(110, 231, 249, .24),
    0 0 110px rgba(167, 139, 250, .18);
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

/* Jaringan dekoratif di fallback. */
.space-fallback__net {
  position: absolute;
  inset: 0;
}
.space-fallback__link {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, rgba(110, 231, 249, .45), rgba(167, 139, 250, .35));
  transform-origin: left center;
  opacity: .65;
  animation: link-pulse 4s ease-in-out infinite alternate;
}
.space-fallback__link--a { top: 30%; left: 28%; width: 46%; transform: rotate(18deg); }
.space-fallback__link--b { top: 62%; left: 30%; width: 40%; transform: rotate(-24deg); animation-delay: -1.4s; }
.space-fallback__link--c { top: 44%; left: 22%; width: 56%; transform: rotate(-6deg); animation-delay: -2.6s; }
.space-fallback__node {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6ee7f9;
  box-shadow: 0 0 8px #6ee7f9, 0 0 18px rgba(110, 231, 249, .7);
  animation: node-pulse 3s ease-in-out infinite alternate;
}
.space-fallback__node--a { top: 30%; left: 28%; }
.space-fallback__node--b { top: 44%; left: 76%; background: #a78bfa; box-shadow: 0 0 8px #a78bfa, 0 0 18px rgba(167, 139, 250, .7); animation-delay: -.8s; }
.space-fallback__node--c { top: 62%; left: 32%; animation-delay: -1.6s; }
.space-fallback__node--d { top: 33%; left: 66%; background: #e8ecf8; box-shadow: 0 0 8px #e8ecf8; animation-delay: -2.2s; }

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
@keyframes link-pulse {
  from { opacity: .3; }
  to { opacity: .8; }
}
@keyframes node-pulse {
  from { opacity: .5; transform: scale(.85); }
  to { opacity: 1; transform: scale(1.15); }
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
