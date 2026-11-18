<script setup lang="ts">
/**
 * SpaceScene — planet realistik ala NASA Eyes, SSR-safe, self-contained.
 *
 * API:
 *   <SpaceScene planet="earth" variant="hero" style="position:absolute; inset:0; z-index:0" />
 *   planet:  'earth' | 'mars' | 'jupiter' | 'saturn' | 'neptune' | 'mercury' | 'venus' | 'uranus'
 *   variant: 'hero' | 'orbital' | 'mini' (API lama tetap didukung).
 *   class / atribut pemakai diteruskan ke elemen akar (inheritAttrs: false).
 *
 * Arsitektur:
 *  - Semua akses window/document/THREE terjadi di dalam onMounted / dynamic
 *    import. Tidak ada efek samping di SSR.
 *  - Bumi: color + night (city lights) + normal map NASA Eyes -> benua tajam.
 *    Planet lain: color map + diffuse matte, tanpa city lights.
 *  - Tekstur diimpor sebagai URL Vite, dimuat dengan TextureLoader di client.
 *    Jika gagal -> material warna planet + wireframe tetap tampil.
 *  - OrbitControls: drag = rotate, wheel = zoom, tombol reset, panah = rotasi.
 *    Rotasi scroll tetap diterapkan ke objek planet, bukan kamera.
 *  - Jika three gagal diimpor / WebGL tidak ada -> fallback CSS tetap rapi.
 */

// URL Vite (string pada SSR; tidak menyentuh DOM). Nama file sesuai kontrak.
// Tekstur equirectangular 4096x2048 yang terverifikasi benar (Blue Marble NASA).
// 4096x2048 kompatibel dengan SEMUA GPU (banyak device max 4096, bukan 8192).
// 8192 bisa gagal upload -> planet hitam/transparan di device tersebut.
import earthDayUrl from '~/assets/textures/earth-day-4k-safe.jpg?url'
import earthNightUrl from '~/assets/textures/earth-night.jpg?url'
import earthTopoUrl from '~/assets/textures/earth-topology.jpg?url'
import marsUrl from '~/assets/textures/mars.jpg?url'
import jupiterUrl from '~/assets/textures/jupiter.jpg?url'
import saturnUrl from '~/assets/textures/saturn.jpg?url'
import neptuneUrl from '~/assets/textures/neptune.jpg?url'
import mercuryUrl from '~/assets/textures/mercury.jpg?url'
import venusUrl from '~/assets/textures/venus.jpg?url'
import uranusUrl from '~/assets/textures/uranus.jpg?url'

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
type Planet = 'earth' | 'mars' | 'jupiter' | 'saturn' | 'neptune' | 'mercury' | 'venus' | 'uranus'

interface VariantConfig {
  stars: number
  dust: number
  radius: number
  segW: number
  segH: number
  cameraZ: number
  arcs: number
}

interface PlanetConfig {
  color: string        // peta warna (sRGB)
  night?: string       // city lights — hanya Bumi
  normal?: string      // tangent-space normal map — hanya Bumi
  cssColor: string     // fallback CSS
  cssGlow: string      // rgba untuk glow fallback CSS
  threeColor: number   // material fallback WebGL
  tilt: number         // kemiringan sumbu (derajat)
}

const props = withDefaults(defineProps<{ variant?: Variant; planet?: string }>(), {
  variant: 'hero',
  planet: 'earth',
})
const attrs = useAttrs()

const CONFIG: Record<Variant, VariantConfig> = {
  hero: { stars: 1900, dust: 300, radius: 2.35, segW: 72, segH: 54, cameraZ: 7.2, arcs: 28 },
  orbital: { stars: 1600, dust: 240, radius: 1.35, segW: 56, segH: 40, cameraZ: 6.2, arcs: 22 },
  mini: { stars: 1500, dust: 140, radius: 1.1, segW: 40, segH: 28, cameraZ: 5.6, arcs: 20 },
}

const PLANETS: Record<Planet, PlanetConfig> = {
  earth: {
    color: earthDayUrl, night: earthNightUrl, normal: earthTopoUrl,
    cssColor: '#1e6fc4', cssGlow: 'rgba(110, 231, 249, .34)', threeColor: 0x14306b, tilt: 23.4,
  },
  mars: {
    color: marsUrl,
    cssColor: '#c1562f', cssGlow: 'rgba(224, 112, 72, .32)', threeColor: 0x6b2f1c, tilt: 25.2,
  },
  jupiter: {
    color: jupiterUrl,
    cssColor: '#d8b98a', cssGlow: 'rgba(226, 190, 138, .30)', threeColor: 0x715438, tilt: 3.1,
  },
  saturn: {
    color: saturnUrl,
    cssColor: '#e3d3a2', cssGlow: 'rgba(233, 214, 160, .30)', threeColor: 0x766844, tilt: 26.7,
  },
  neptune: {
    color: neptuneUrl,
    cssColor: '#3f66d8', cssGlow: 'rgba(88, 126, 240, .34)', threeColor: 0x142a6b, tilt: 28.3,
  },
  mercury: {
    color: mercuryUrl,
    cssColor: '#a89c90', cssGlow: 'rgba(190, 180, 170, .28)', threeColor: 0x4a4540, tilt: 0.03,
  },
  venus: {
    color: venusUrl,
    cssColor: '#e6c982', cssGlow: 'rgba(238, 205, 134, .32)', threeColor: 0x6f5730, tilt: 177.4,
  },
  uranus: {
    color: uranusUrl,
    cssColor: '#a4dce2', cssGlow: 'rgba(164, 220, 226, .32)', threeColor: 0x2c5a60, tilt: 97.8,
  },
}

function planetName(): Planet {
  const p = props.planet as Planet
  return PLANETS[p] ? p : 'earth'
}
function planetCfg(): PlanetConfig {
  return PLANETS[planetName()]
}
function isEarth(): boolean {
  return planetName() === 'earth'
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
let controls: any = null   // OrbitControls (dibuat di initScene, dibuang saat unmount)

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
// Matahari dari samping kiri (+Z sedikit) → sisi kiri terang, kanan gelap.
// z positif penting: tanpa itu seluruh sisi depan gelap dan tidak ada siang.
let sunAngle = Math.PI * 0.75 // 135°: cos=-0.71 (kiri), sin=+0.71 (depan)
let sunPhase = 0

let disposables: Array<{ dispose(): void }> = []

let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let mediaQuery: MediaQueryList | null = null

let rafId = 0
let running = false
let isVisible = true
let isDisposed = false
let lastTime = 0

// Rotasi Bumi: spin dasar + offset scroll (dilembutkan via lerp).
// Keduanya diterapkan ke earthSpin, TIDAK ke kamera — kamera milik OrbitControls.
const SCROLL_SPIN_FACTOR = 0.0016
let baseSpin = 0
let scrollTargetY = 0
let scrollCurrentY = 0
let viewTiltX = 0 // kemiringan pandangan dari keyboard (panah atas/bawah)

const pointer = { x: 0, y: 0 }
const pointerTarget = { x: 0, y: 0 }
const starTimeUniform = { value: 0 } // dipakai onBeforeCompile PointsMaterial bintang

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
  uniform sampler2D uNormal;
  uniform vec3 uSunDirection;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  vec3 linearToSrgb(vec3 c) { return pow(c, vec3(1.0 / 2.2)); }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(uSunDirection);

    // Topografi -> normal kasar. Peta topografi 1024x512 -> texel 1/1024.
    float texel = 1.0 / 1024.0;
    float hL = texture2D(uNormal, vUv - vec2(texel, 0.0)).r;
    float hR = texture2D(uNormal, vUv + vec2(texel, 0.0)).r;
    float hD = texture2D(uNormal, vUv - vec2(0.0, texel)).r;
    float hU = texture2D(uNormal, vUv + vec2(0.0, texel)).r;
    vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), N) + vec3(1e-5));
    vec3 B = cross(N, T);
    vec3 Nb = normalize(N - ((hR - hL) * T + (hU - hD) * B) * 0.45);

    float ndl = dot(Nb, L);
    // Terminator tegas: siang terang, malam gelap — pembagian jelas.
    float day = smoothstep(-0.04, 0.12, ndl);

    // Tekstur warna memakai SRGBColorSpace -> GPU sudah linearisasi saat
    // sampling. Jangan srgbToLinear di sini. Sudah di-unsharp saat generation.
    vec3 dayCol = texture2D(uDay, vUv).rgb;
    vec3 nightCol = texture2D(uNight, vUv).rgb;

    // Siang: Blue Marble + diffuse matte (tanpa specular).
    float diffuse = clamp(ndl, 0.0, 1.0);
    vec3 lit = dayCol * (0.06 + 0.94 * diffuse);
    vec3 specCol = vec3(0.0);

    // Malam: city lights NASA, tipis bukan noda putih.
    vec3 city = nightCol * 2.0;
    vec3 nightAmbient = vec3(0.010, 0.018, 0.045);
    vec3 nightSide = city + nightAmbient;

    vec3 color = mix(nightSide, lit + specCol, day);
    gl_FragColor = vec4(linearToSrgb(color), 1.0);
  }
`

// Planet non-Bumi: peta warna + diffuse matte. Tanpa city lights, tanpa
// specular, tanpa normal map. Terminator siang/malam tetap dipertahankan.
const PLANET_FRAG = /* glsl */ `
  uniform sampler2D uDay;
  uniform vec3 uSunDirection;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  vec3 linearToSrgb(vec3 c) { return pow(c, vec3(1.0 / 2.2)); }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(uSunDirection);
    float ndl = dot(N, L);
    float day = smoothstep(-0.04, 0.12, ndl);

    vec3 dayCol = texture2D(uDay, vUv).rgb;
    float diffuse = clamp(ndl, 0.0, 1.0);
    vec3 lit = dayCol * (0.05 + 0.95 * diffuse);

    vec3 nightAmbient = vec3(0.006, 0.010, 0.026);
    vec3 color = mix(nightAmbient, lit, day);
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
    // BackSide: normal outward menjauhi kamera. rim hanya muncul di siluet,
    // di mana normal tegak lurus arah pandang (|dot| -> 0). Di tengah bola
    // |dot| -> 1 sehingga glow = 0 (dulu rumus 1+dot membuat seluruh bola putih).
    float ndv = abs(dot(normalize(vViewNormal), V));
    float rim = pow(clamp(1.0 - ndv, 0.0, 1.0), uPower);
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

// Peta warna (day/night/planet) -> SRGBColorSpace; peta data (topo/water/
// clouds alpha) -> NoColorSpace. Semua pakai mipmap + filtering anisotropik.
function configureTexture(tex: any, isColor = true): any {
  if (!tex) return tex
  if (isColor && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace
  if (!isColor && THREE.NoColorSpace) tex.colorSpace = THREE.NoColorSpace
  tex.generateMipmaps = true
  if (THREE.LinearMipmapLinearFilter) tex.minFilter = THREE.LinearMipmapLinearFilter
  if (THREE.LinearFilter) tex.magFilter = THREE.LinearFilter
  const maxAniso = renderer?.capabilities?.getMaxAnisotropy?.() ?? 1
  tex.anisotropy = Math.min(16, maxAniso)
  tex.needsUpdate = true
  return tex
}

function loadTexture(url: string, isColor = true): Promise<any> {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (t: any) => resolve(configureTexture(t, isColor)),
      undefined,
      () => resolve(null),
    )
  })
}

/* -------------------------------------------------------------------------- */
/*  PEMBANGUNAN OBJEK                                                          */
/* -------------------------------------------------------------------------- */

let roundSprite: any = null

function getRoundSprite(): any {
  if (roundSprite) return roundSprite
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.85)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  roundSprite = track(new THREE.CanvasTexture(canvas))
  return roundSprite
}

function createStarfield(count: number, isDust = false) {
  const geometry = track(new THREE.BufferGeometry())
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)

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

    // Distribusi ukuran alami: mayoritas kecil, sebagian sedang, sedikit besar.
    const sizeRoll = Math.random()
    sizes[i] = isDust
      ? 0.6 + Math.random() * 0.4
      : sizeRoll < 0.82 ? 0.55 + Math.random() * 0.45
        : sizeRoll < 0.96 ? 1.0 + Math.random() * 0.5
          : 1.5 + Math.random() * 0.7
    phases[i] = Math.random() * Math.PI * 2
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

  const material = track(new THREE.PointsMaterial({
    size: isDust ? 0.055 : 0.085,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: isDust ? 0.5 : 0.88,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    map: getRoundSprite(),
    alphaTest: 0.01,
  }))

  // Ukuran per-bintang + kedip halus per-fase. Fallback aman: bila pola
  // shader three berubah, replace tidak cocok dan bintang tetap bulat.
  material.onBeforeCompile = (shader: any) => {
    shader.uniforms.uStarTime = starTimeUniform
    const vs = 'attribute float aSize;\nattribute float aPhase;\nvarying float vTwinkle;\nuniform float uStarTime;\n'
    const patchedVs = shader.vertexShader.replace(
      'gl_PointSize = size;',
      'gl_PointSize = size * aSize;\n\tvTwinkle = 0.88 + 0.12 * sin(uStarTime * 1.6 + aPhase);',
    )
    shader.vertexShader = vs + (patchedVs === shader.vertexShader
      ? shader.vertexShader.replace('void main() {', 'void main() {\n\tvTwinkle = 0.88 + 0.12 * sin(uStarTime * 1.6 + aPhase);')
      : patchedVs)
    const patchedFs = shader.fragmentShader.replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      'vec4 diffuseColor = vec4( diffuse, opacity * vTwinkle );',
    )
    shader.fragmentShader = 'varying float vTwinkle;\n' + patchedFs
  }

  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  return { points, material }
}

function createEarth(cfg: VariantConfig) {
  // Material warna planet + wireframe sebagai fallback (diganti saat tekstur termuat).
  const geo = track(new THREE.SphereGeometry(cfg.radius, cfg.segW, cfg.segH))
  const base = planetCfg().threeColor
  const emissive = new THREE.Color(base).multiplyScalar(0.18).getHex()
  const mat = track(new THREE.MeshStandardMaterial({
    color: base,
    emissive,
    emissiveIntensity: 0.55,
    metalness: 0.1,
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
  const earth = isEarth()
  const tint = new THREE.Color(planetCfg().cssColor)
  const colorA = earth ? PALETTE.cyan : tint.getHex()
  const colorB = earth ? 0x2b6cff : tint.clone().multiplyScalar(0.35).getHex()
  const intensity = earth ? 0.42 : 0.2
  const makeMat = (a: number, b: number, power: number, strength: number) => track(
    new THREE.ShaderMaterial({
      uniforms: {
        uColorA: { value: new THREE.Color(a) },
        uColorB: { value: new THREE.Color(b) },
        uPower: { value: power },
        uIntensity: { value: strength },
      },
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  )

  // Glow utama + halo tipis. Intensity diredam agar additive blending tidak
  // menutupi permukaan planet dengan warna glow.
  const glowGeo = track(new THREE.SphereGeometry(cfg.radius * 1.16, 48, 48))
  const glow = new THREE.Mesh(glowGeo, makeMat(colorA, colorB, 2.6, intensity))
  tiltGroup.add(glow)

  const haloGeo = track(new THREE.SphereGeometry(cfg.radius * 1.3, 48, 48))
  const halo = new THREE.Mesh(haloGeo, makeMat(colorB, colorA, 3.6, intensity * 0.25))
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

async function upgradePlanetMaterials() {
  const earth = isEarth()
  const cfg = planetCfg()

  // Bumi butuh 3 peta (color + night + normal), planet lain cukup color.
  const loaded = earth
    ? await Promise.all([
        loadTexture(cfg.color, true),          // warna -> sRGB
        loadTexture(cfg.night as string, true),// city lights -> sRGB
        loadTexture(cfg.normal as string, false), // normal map -> NoColorSpace
      ])
    : await Promise.all([loadTexture(cfg.color, true)])

  const day = loaded[0]
  const night = earth ? loaded[1] : null
  const normalMap = earth ? loaded[2] : null

  if (isDisposed) {
    loaded.forEach((t) => t?.dispose?.())
    return
  }

  // Awan sengaja tidak dirender untuk semua planet.
  if (clouds) clouds.visible = false
  if (!earthMesh) {
    loaded.forEach((t) => t?.dispose?.())
    return
  }

  // Tanpa peta warna (dan untuk Bumi tanpa night): pertahankan fallback.
  if (!day || (earth && !night)) {
    loaded.forEach((t) => t?.dispose?.())
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

  const sunValue = new THREE.Vector3(sunDir.x, sunDir.y, sunDir.z)
  let shaderMat: any

  if (earth && night) {
    track(day)
    track(night)
    const normalTex = normalMap ?? makeSolidTexture(128, 128, 255)
    if (normalMap) track(normalMap)

    earthUniforms = {
      uDay: { value: day },
      uNight: { value: night },
      uNormal: { value: normalTex },
      uSunDirection: { value: sunValue },
    }
    shaderMat = new THREE.ShaderMaterial({
      uniforms: earthUniforms,
      vertexShader: EARTH_VERT,
      fragmentShader: EARTH_FRAG,
    })
  } else {
    track(day)
    earthUniforms = {
      uDay: { value: day },
      uSunDirection: { value: sunValue },
    }
    shaderMat = new THREE.ShaderMaterial({
      uniforms: earthUniforms,
      vertexShader: EARTH_VERT,
      fragmentShader: PLANET_FRAG,
    })
  }

  earthMesh.material = track(shaderMat)

  // Tekstur sudah terpasang — sekarang aman sembunyikan fallback.
  webglReady.value = true
  if (reducedMotion.value) start() // satu frame final dengan tekstur nyata
}

/* -------------------------------------------------------------------------- */
/*  INISIALISASI                                                               */
/* -------------------------------------------------------------------------- */

function applyFit(aspect: number) {
  if (!world) return
  const fit = Math.min(1, Math.max(0.55, aspect / 1.25))
  world.scale.setScalar(fit)
  // Komposisi: di layar lebar Bumi duduk di kanan supaya tipografi besar
  // di kiri tidak menimpanya. Di layar sempit Bumi turun ke bawah teks.
  if (tiltGroup) {
    const wide = aspect >= 1.15
    const targetX = wide ? (props.variant === 'hero' ? 0.82 : 0.6) : 0
    const targetY = wide ? (props.variant === 'hero' ? 0.05 : -0.12) : -0.95
    tiltGroup.position.set(targetX / fit, targetY / fit, 0)
  }
}

function initScene(threeModule: any, OrbitControlsCtor: any) {
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
  if (THREE.ACESFilmicToneMapping) {
    // Tone mapping netral (tanpa ACES) supaya warna tidak kusam/kabut.
    if (THREE.NoToneMapping !== undefined) renderer.toneMapping = THREE.NoToneMapping
    renderer.toneMappingExposure = 1.0
  }
  host.appendChild(renderer.domElement)

  // OrbitControls: drag = rotate, wheel = zoom. Menempel pada canvas, BUKAN
  // kamera statis — rotasi scroll tetap di earthSpin (lihat applyScrollRotation).
  if (OrbitControlsCtor) {
    controls = new OrbitControlsCtor(camera, renderer.domElement)
    controls.enableDamping = !reducedMotion.value
    controls.dampingFactor = 0.06
    controls.enablePan = false
    controls.minDistance = cfg.cameraZ * 0.5
    controls.maxDistance = cfg.cameraZ * 2.0
    controls.zoomToCursor = true
    controls.target.set(0, 0, 0)
    controls.update()
    controls.saveState() // reset() kembali ke framing awal ini
    controls.addEventListener('change', handleControlsChange)
  }

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

  // Debu kosmik sengaja tidak dipakai: partikel dekat kamera mudah
  // terlihat kotak dan mengganggu Bumi. Starfield saja sudah cukup.


  // Planet: kemiringan sumbu sesuai planet (Bumi 23.4°).
  tiltGroup = new THREE.Group()
  tiltGroup.rotation.z = planetCfg().tilt * (Math.PI / 180)
  world.add(tiltGroup)
  applyViewTilt()

  earthSpin = new THREE.Group()
  tiltGroup.add(earthSpin)

  createEarth(cfg)
  createAtmosphere(cfg)
  // Jaringan 16 kota HANYA untuk Bumi.
  if (isEarth()) createNetwork(cfg)

  applyFit(width / height)

  // Pakai posisi scroll awal sebelum event scroll pertama datang.
  scrollTargetY = scrollCurrentY = window.scrollY || 0
  applyScrollRotation()

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

  // Jangan sembunyikan fallback di sini. upgradePlanetMaterials() yang akan
  // menandai webglReady = true SETELAH tekstur selesai dimuat & frame siap.
  // Kalau disembunyikan lebih awal, user melihat planet biru polos/"transparan"
  // selama texture 8K masih loading.
  start()
  void upgradePlanetMaterials()
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

// Rotasi Bumi = spin dasar + offset scroll. Dipakai loop animasi maupun event
// scroll saat reduced-motion (tanpa animasi kontinu). Seluruhnya di earthSpin,
// sehingga TIDAK bertabrakan dengan OrbitControls yang menguasai kamera.
function applyScrollRotation() {
  if (!earthSpin) return
  earthSpin.rotation.y = baseSpin + scrollCurrentY * SCROLL_SPIN_FACTOR
}

function applyViewTilt() {
  if (tiltGroup) tiltGroup.rotation.x = viewTiltX
}

function handleScroll() {
  scrollTargetY = window.scrollY || window.pageYOffset || 0
  if (reducedMotion.value) {
    // Tanpa animasi kontinu: rotasi statis mengikuti posisi scroll.
    scrollCurrentY = scrollTargetY
    applyScrollRotation()
    start() // satu frame statis
  }
}

// Saat reduced-motion loop tidak berjalan; 'change' dari OrbitControls
// cukup untuk meminta satu frame statis. update() dipanggil di tick().
function handleControlsChange() {
  if (reducedMotion.value) start()
}

// Jaga-jaga: beberapa versi OrbitControls hanya memanggil update() di loop.
function handleInteract() {
  if (reducedMotion.value && controls) {
    controls.update()
    start()
  }
}

function resetView() {
  if (controls) controls.reset()
  baseSpin = 0
  scrollCurrentY = scrollTargetY = window.scrollY || 0 // sinkron dgn halaman
  viewTiltX = 0
  applyScrollRotation()
  applyViewTilt()
  start()
}

function handleKeyDown(e: KeyboardEvent) {
  const step = 0.16
  let handled = true
  switch (e.key) {
    case 'ArrowLeft': baseSpin -= step; break
    case 'ArrowRight': baseSpin += step; break
    case 'ArrowUp': viewTiltX = Math.max(-0.6, viewTiltX - 0.08); break
    case 'ArrowDown': viewTiltX = Math.min(0.6, viewTiltX + 0.08); break
    case 'r': case 'R': resetView(); break
    default: handled = false
  }
  if (!handled) return
  e.preventDefault()
  applyScrollRotation()
  applyViewTilt()
  start()
}

function bindEvents() {
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('pointerleave', handlePointerLeave, { passive: true })
  window.addEventListener('blur', handlePointerLeave)
  window.addEventListener('scroll', handleScroll, { passive: true })
  containerRef.value?.addEventListener('keydown', handleKeyDown)
  const canvas = renderer?.domElement
  if (canvas) {
    canvas.addEventListener('pointerdown', handleInteract, { passive: true })
    canvas.addEventListener('pointermove', handleInteract, { passive: true })
    canvas.addEventListener('wheel', handleInteract, { passive: true })
  }
}

function unbindEvents() {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerleave', handlePointerLeave)
  window.removeEventListener('blur', handlePointerLeave)
  window.removeEventListener('scroll', handleScroll)
  containerRef.value?.removeEventListener('keydown', handleKeyDown)
  const canvas = renderer?.domElement
  if (canvas) {
    canvas.removeEventListener('pointerdown', handleInteract)
    canvas.removeEventListener('pointermove', handleInteract)
    canvas.removeEventListener('wheel', handleInteract)
  }
}

function handleMotionChange(e: MediaQueryListEvent) {
  reducedMotion.value = e.matches
  if (controls) controls.enableDamping = !e.matches
  if (e.matches) {
    pointer.x = pointer.y = pointerTarget.x = pointerTarget.y = 0
    if (controls) controls.reset() // view statis kembali ke framing awal
    if (starField) starField.rotation.set(0, 0, 0)
    scrollCurrentY = scrollTargetY
    baseSpin = 0
    viewTiltX = 0
    applyScrollRotation()
    applyViewTilt()
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
  controls?.update()
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

    // Spin dasar terus jalan; scroll menambah rotasi secara halus.
    baseSpin += dt * 0.2
    scrollCurrentY += (scrollTargetY - scrollCurrentY) * Math.min(1, dt * 6)
    applyScrollRotation()

    // Matahari bergerak bolak-balik di rentang depan (±40° dari 135°) supaya
    // terminator SELALU terlihat — jangan sampai muter ke belakang Bumi.
    sunPhase += dt * 0.28
    const sunA = Math.PI * 0.75 + Math.sin(sunPhase) * 0.7
    sunDir.set(Math.cos(sunA), 0.16, Math.sin(sunA)).normalize()
    if (sunLight) sunLight.position.set(sunDir.x * 8, sunDir.y * 8, sunDir.z * 8)
    if (earthUniforms) earthUniforms.uSunDirection.value.set(sunDir.x, sunDir.y, sunDir.z)

    // Latar.
    if (starField) {
      starField.rotation.y = t * 0.008 + pointer.x * 0.12
      starField.rotation.x = -pointer.y * 0.08
    }
    starTimeUniform.value = t
    if (starMaterial) starMaterial.opacity = 0.86 + Math.sin(t * 0.9) * 0.04

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

    // Parallax pointer cukup pada latar; kamera diserahkan ke OrbitControls
    // supaya drag/wheel tidak bertabrakan (lihat blok update() di bawah).
  }

  // Wajib tiap frame saat damping aktif; aman pula saat reduced-motion.
  if (controls) controls.update()
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

    // OrbitControls opsional: bila gagal diimpor, scene tetap tampil tanpa
    // kontrol mouse (drag/zoom dinonaktifkan, bukan menggagalkan scene).
    let OrbitCtor: any = null
    try {
      const mod = await import('three/addons/controls/OrbitControls.js')
      OrbitCtor = (mod as any).OrbitControls ?? null
    } catch { /* abaikan */ }

    if (isDisposed) return
    initScene(threeModule, OrbitCtor)
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

  // controls.dispose() melepas listener DOM internal; listener 'change' kita
  // dilepas eksplisit karena tidak ikut terhapus oleh dispose().
  if (controls) {
    controls.removeEventListener('change', handleControlsChange)
    controls.dispose()
  }
  controls = null

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
  viewTiltX = 0
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
  roundSprite = null
  starTimeUniform.value = 0
  THREE = null
})
</script>

<template>
  <div
    ref="containerRef"
    class="space-scene"
    :class="`space-scene--${variant} space-scene--${planetName()}`"
    v-bind="attrs"
    tabindex="0"
    role="img"
    :aria-label="`${planetName() === 'earth' ? 'Bumi' : planetName()} interaktif. Geser untuk memutar, gulir untuk zoom, panah untuk memutar, R untuk reset.`"
  >
    <!-- Kanvas WebGL (diisi secara dinamis di onMounted) -->
    <div ref="canvasHostRef" class="space-scene__canvas"></div>

    <!-- Fallback CSS: tampil default, memudar saat WebGL siap -->
    <div
      class="space-fallback"
      :class="{ 'space-fallback--hidden': webglReady }"
      :style="{
        '--planet-color': planetCfg().cssColor,
        '--planet-glow': planetCfg().cssGlow,
      }"
    >
      <div class="space-fallback__stars space-fallback__stars--far"></div>
      <div class="space-fallback__stars space-fallback__stars--near"></div>
      <div class="space-fallback__nebula"></div>
      <div class="space-fallback__system">
        <div class="space-fallback__orbit space-fallback__orbit--one"></div>
        <div class="space-fallback__orbit space-fallback__orbit--two"></div>
        <div class="space-fallback__orbit space-fallback__orbit--three"></div>
        <!-- Fallback memakai FOTO TEKSTUR ASLI, bukan gradien/wireframe.
             Dibungkus lingkaran + shading supaya tetap terbaca sebagai bola. -->
        <div
          class="space-fallback__planet"
          :style="{ '--planet-map': `url('${planetCfg().color}')` }"
        >
          <div class="space-fallback__globe"></div>
        </div>
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

    <!-- Kontrol overlay: tombol reset view (hanya saat WebGL aktif). -->
    <div class="space-scene__overlay">
      <button
        v-if="webglReady"
        class="space-scene__reset"
        type="button"
        aria-label="Reset tampilan planet"
        title="Reset tampilan (R)"
        @click="resetView"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
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

.space-scene:focus-visible {
  outline: 2px solid rgba(110, 231, 249, .7);
  outline-offset: -2px;
}

.space-scene__canvas,
.space-scene__canvas :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

/* Kanvas harus menerima pointer supaya OrbitControls bisa drag/zoom. */
.space-scene__canvas {
  pointer-events: auto;
  cursor: grab;
  touch-action: none;
}
.space-scene__canvas:active,
.space-scene__canvas:active :deep(canvas) {
  cursor: grabbing;
}
.space-scene__canvas :deep(canvas) {
  touch-action: none;
}

/* Overlay tombol reset — tidak menghalangi drag di kanvas. */
.space-scene__overlay {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 12px;
  pointer-events: none;
}
.space-scene__reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid rgba(110, 231, 249, .38);
  border-radius: 50%;
  background: rgba(8, 14, 34, .62);
  color: #9fe8f7;
  cursor: pointer;
  pointer-events: auto;
  backdrop-filter: blur(6px);
  transition: background 180ms ease, color 180ms ease, border-color 180ms ease, transform 180ms ease;
}
.space-scene__reset:hover {
  background: rgba(16, 34, 70, .86);
  border-color: rgba(110, 231, 249, .8);
  color: #ffffff;
  transform: rotate(-25deg);
}
.space-scene__reset:focus-visible {
  outline: 2px solid rgba(110, 231, 249, .9);
  outline-offset: 2px;
}

/* --------------------------- FALLBACK --------------------------- */
.space-fallback {
  /* Default (Bumi); ditimpa inline :style per planet dari template. */
  --planet-color: #1e6fc4;
  --planet-glow: rgba(110, 231, 249, .34);
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: opacity 700ms ease;
}
.space-fallback--hidden {
  opacity: 0;
  /* PENTING: elemen opacity:0 tetap menangkap pointer dan mem-blok drag
     OrbitControls di canvas di bawahnya. Harus non-interaktif. */
  pointer-events: none;
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
  width: min(72vmin, 640px);
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
  width: 88%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  overflow: hidden;
  background: #05060d;
  box-shadow:
    0 0 42px var(--planet-glow),
    0 0 110px var(--planet-glow);
}
/* Bola dari FOTO TEKSTUR NASA asli. Peta equirectangular dipetakan ke
   lingkaran: hanya satu "wajah" bumi yang terlihat, jadi pakai cover dan
   posisi tengah. Animasi hanya menggeser sedikit (±8%) agar benua tidak
   pernah keluar frame / tampak transparan. */
.space-fallback__globe {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background-image: var(--planet-map);
  background-size: cover;
  background-position: 50% 50%;
  animation: globe-pan 40s ease-in-out infinite alternate;
}
/* Shading bola: tepi gelap + terminator terang-kiri/gelap-kanan dari cahaya. */
.space-fallback__planet::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    linear-gradient(105deg, rgba(255,255,255,0.10) 0%, transparent 34%, rgba(0,0,0,0.72) 78%),
    radial-gradient(circle at 30% 26%, rgba(255,255,255,0.12), transparent 42%),
    radial-gradient(circle at 50% 50%, transparent 58%, rgba(0,0,0,0.88) 100%);
  pointer-events: none;
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
@keyframes globe-pan {
  from { background-position: 42% 50%; }
  to { background-position: 58% 50%; }
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
