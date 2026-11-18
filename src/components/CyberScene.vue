<template>
  <div ref="hostRef" class="cyber-scene" data-ui>
    <canvas ref="canvasRef" class="cyber-scene__canvas" :aria-label="`Peta serangan siber simulasi. Klik simpul untuk memfokus. ${focus ? 'Fokus: ' + focus : ''}`"></canvas>

    <div class="cyber-scene__hud">
      <div class="cyber-hud__stat">
        <span class="cyber-hud__label"> EVENT </span>
        <strong>{{ total }}</strong>
      </div>
      <div class="cyber-hud__stat">
        <span class="cyber-hud__label"> AKTIF </span>
        <strong>{{ active }}</strong>
      </div>
      <div class="cyber-hud__stat">
        <span class="cyber-hud__label"> MODE </span>
        <strong>{{ label }}</strong>
      </div>
    </div>

    <div class="cyber-scene__legend" aria-hidden="true">
      <span v-for="t in types" :key="t.id" class="cyber-legend">
        <i :style="{ background: t.color }"></i>{{ t.name }}
      </span>
    </div>

    <div v-if="focus" class="cyber-scene__focus">
      FOKUS · {{ focus.toUpperCase() }}
      <button type="button" @click="$emit('update:focus', '')" aria-label="Hapus fokus">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  intensity: { type: String, default: 'sedang' }, // rendah | sedang | tinggi
  focus: { type: String, default: '' },
  paused: { type: Boolean, default: false },
})
const emit = defineEmits(['attack', 'update:focus'])

// Mask benua Natural Earth 110m, equirectangular 96x48. '#' = daratan.
const WORLD = `................................................................................................
.........................#######...########.....................................................
..................###########################.....######...###..........####....................
...............#############################.......####.......#####....########.....#####.......
#.....#.......###############...###########..................###..#######################.......
#..############################..##########........#############################################
################################.######..####.....##############################################
..#############################...####....##.....###############################################
...######################..#####..............##.#############################################..
....##......######################...........##########################################..###....
............######################...........##########################################..##.....
..............####################............#########################################.........
..............##################.............##########################################.........
..............###############................####.#################################..#..........
...............#############.................#########################################..........
................###########..................####################################.###...........
.................###########................#####################################...............
..................#####..###...............######################################...............
.....##............###########.............#####################..#############.#...............
....................######.####............#####################...####..#####.##...............
.......................###..##.............###################.....###....####.###..............
.........................########..........###################......##....###..###..............
..........................#########.........##################.......#...###..####..............
..........................#########...............###########............###.######.............
..........................############............##########..............#############.#.......
..........................#############...........#########................################.....
..........................#############............########.................######.######.##....
...........................###########.............########.##...................######.....#...
#..........................###########.............###########..................#######.....#..#
.............................#########.............#######.###................###########..##...
.............................########..............#######.##.................###########.......
............................########................#####.....................###########.......
............................#######.................#####.....................###########.......
............................######..................###.......................###...#####.....#.
............................#####....................................................###.....###
............................####......................................................##....###.
...........................####...................................#.........................##..
...........................###.##.................................#.............................
............................###.................................................................
................................................................................................
................................#...............................................................
.............................####...........................####.#...##################.........
...........................###############....################################################..
..........#######################################.############################################..
....##################.....#################...............##################################...
....###########............##############............................########################...
##########......................##........................................##################...
######.................................................................................#########`.split('\n')

const NODES = [
  { id: 'jkt', name: 'Jakarta', lat: -6.2, lon: 106.8 },
  { id: 'sin', name: 'Singapura', lat: 1.35, lon: 103.8 },
  { id: 'tyo', name: 'Tokyo', lat: 35.7, lon: 139.7 },
  { id: 'sel', name: 'Seoul', lat: 37.5, lon: 127.0 },
  { id: 'bjs', name: 'Beijing', lat: 39.9, lon: 116.4 },
  { id: 'bom', name: 'Mumbai', lat: 19.0, lon: 72.8 },
  { id: 'dxb', name: 'Dubai', lat: 25.2, lon: 55.2 },
  { id: 'mos', name: 'Moskow', lat: 55.75, lon: 37.6 },
  { id: 'iev', name: 'Kyiv', lat: 50.45, lon: 30.5 },
  { id: 'ber', name: 'Berlin', lat: 52.5, lon: 13.4 },
  { id: 'lon', name: 'London', lat: 51.5, lon: -0.12 },
  { id: 'par', name: 'Paris', lat: 48.8, lon: 2.35 },
  { id: 'lag', name: 'Lagos', lat: 6.5, lon: 3.4 },
  { id: 'jnb', name: 'Johannesburg', lat: -26.2, lon: 28.0 },
  { id: 'nyc', name: 'New York', lat: 40.7, lon: -74.0 },
  { id: 'was', name: 'Washington', lat: 38.9, lon: -77.0 },
  { id: 'yyz', name: 'Toronto', lat: 43.6, lon: -79.4 },
  { id: 'sao', name: 'São Paulo', lat: -23.5, lon: -46.6 },
  { id: 'syd', name: 'Sydney', lat: -33.8, lon: 151.2 },
  { id: 'tpe', name: 'Taipei', lat: 25.0, lon: 121.5 },
]

const TYPES = [
  { id: 'ddos', name: 'DDoS', color: '#ff5d73' },
  { id: 'ransom', name: 'Ransomware', color: '#ff9f43' },
  { id: 'phish', name: 'Phishing', color: '#f6d365' },
  { id: 'exploit', name: 'Exploit', color: '#c084fc' },
  { id: 'bot', name: 'Botnet', color: '#6ee7f9' },
]
const types = TYPES

const hostRef = ref(null)
const canvasRef = ref(null)
const total = ref(0)
const active = ref(0)
const label = computed(() => ({ rendah: 'RENDAH', sedang: 'SEDANG', tinggi: 'TINGGI' })[props.intensity] || 'SEDANG')

let ctx, raf = 0, ro, disposed = false
let W = 0, H = 0, dpr = 1
let rect = { x: 0, y: 0, w: 0, h: 0 }
let attacks = [], pulses = [], lastSpawn = 0, hover = null
let reduced = false

const SPAWN_MS = { rendah: 620, sedang: 340, tinggi: 150 }
const SPEED = { rendah: 1900, sedang: 1300, tinggi: 850 }

function resize() {
  const el = hostRef.value
  if (!el) return
  W = el.clientWidth; H = el.clientHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  const c = canvasRef.value
  c.width = Math.max(1, Math.round(W * dpr))
  c.height = Math.max(1, Math.round(H * dpr))
  c.style.width = W + 'px'; c.style.height = H + 'px'
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  let mw = W * 0.94, mh = mw / 2
  const cap = H * 0.78
  if (mh > cap) { mh = cap; mw = mh * 2 }
  rect = { x: (W - mw) / 2, y: (H - mh) / 2 - H * 0.02, w: mw, h: mh }
}

function xy(lat, lon) {
  return {
    x: rect.x + ((lon + 180) / 360) * rect.w,
    y: rect.y + ((90 - lat) / 180) * rect.h,
  }
}

function pickNode(px, py) {
  let best = null, bd = 20
  for (const n of NODES) {
    const p = xy(n.lat, n.lon)
    const d = Math.hypot(p.x - px, p.y - py)
    if (d < bd) { bd = d; best = n }
  }
  return best
}

function spawn(now) {
  let a = NODES[Math.floor(Math.random() * NODES.length)]
  let b = NODES[Math.floor(Math.random() * NODES.length)]
  if (props.focus) {
    const f = NODES.find(n => n.id === props.focus)
    if (f && Math.random() < 0.7) { b = f; a = NODES[Math.floor(Math.random() * NODES.length)] }
  }
  if (a.id === b.id) b = NODES[(NODES.indexOf(b) + 3) % NODES.length]
  const type = TYPES[Math.floor(Math.random() * TYPES.length)]
  const from = xy(a.lat, a.lon), to = xy(b.lat, b.lon)
  const dx = to.x - from.x, dy = to.y - from.y
  const dist = Math.hypot(dx, dy)
  const lift = Math.min(rect.h * 0.34, dist * 0.28) + 8
  const nx = -dy / (dist || 1), ny = dx / (dist || 1)
  const sign = ny > 0 ? 1 : -1
  attacks.push({
    from, to,
    cx: (from.x + to.x) / 2 + nx * lift * sign,
    cy: (from.y + to.y) / 2 + ny * lift * sign - 6,
    start: now, dur: SPEED[props.intensity] * (0.75 + Math.random() * 0.6),
    color: type.color, type: type.name, src: a.name, dst: b.name,
    srcId: a.id, dstId: b.id,
  })
  pulses.push({ p: from, start: now, color: type.color })
  total.value++
  active.value = attacks.length
  emit('attack', { src: a.name, dst: b.name, type: type.name, color: type.color })
}

function bezier(a, c, b, t) {
  const u = 1 - t
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  }
}

function draw(now) {
  if (!ctx || disposed) return
  ctx.clearRect(0, 0, W, H)

  // graticule
  ctx.strokeStyle = 'rgba(110,231,249,0.055)'
  ctx.lineWidth = 1
  for (let i = 1; i < 12; i++) {
    const x = rect.x + (rect.w * i) / 12
    ctx.beginPath(); ctx.moveTo(x, rect.y); ctx.lineTo(x, rect.y + rect.h); ctx.stroke()
  }
  for (let i = 1; i < 6; i++) {
    const y = rect.y + (rect.h * i) / 6
    ctx.beginPath(); ctx.moveTo(rect.x, y); ctx.lineTo(rect.x + rect.w, y); ctx.stroke()
  }

  // dot-map benua
  const step = rect.w / 96
  for (let y = 0; y < 48; y++) {
    const row = WORLD[y]
    for (let x = 0; x < 96; x++) {
      if (row[x] !== '#') continue
      const px = rect.x + (x + 0.5) * step
      const py = rect.y + (y + 0.5) * (rect.h / 48)
      ctx.fillStyle = 'rgba(110,231,249,0.30)'
      ctx.beginPath(); ctx.arc(px, py, Math.max(0.7, step * 0.20), 0, 6.2832); ctx.fill()
    }
  }

  // garis serangan
  for (const atk of attacks) {
    const t = Math.min(1, (now - atk.start) / atk.dur)
    const dim = props.focus && atk.srcId !== props.focus && atk.dstId !== props.focus
    const alpha = dim ? 0.16 : 1
    ctx.globalAlpha = dim ? 0.2 : 0.5
    ctx.strokeStyle = atk.color
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(atk.from.x, atk.from.y)
    ctx.quadraticCurveTo(atk.cx, atk.cy, atk.to.x, atk.to.y); ctx.stroke()

    const head = bezier(atk.from, { x: atk.cx, y: atk.cy }, atk.to, t)
    ctx.globalAlpha = alpha
    const tailT = Math.max(0, t - 0.13)
    const tail = bezier(atk.from, { x: atk.cx, y: atk.cy }, atk.to, tailT)
    const g = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(1, atk.color)
    ctx.strokeStyle = g
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(head.x, head.y); ctx.stroke()
    ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.arc(head.x, head.y, 2.1, 0, 6.2832); ctx.fill()
    ctx.globalAlpha = 1
  }

  // pulse sumber
  for (const p of pulses) {
    const age = (now - p.start) / 900
    if (age > 1) continue
    ctx.globalAlpha = (1 - age) * 0.7
    ctx.strokeStyle = p.color; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(p.p.x, p.p.y, 3 + age * 14, 0, 6.2832); ctx.stroke()
    ctx.globalAlpha = 1
  }

  // simpul
  for (const n of NODES) {
    const p = xy(n.lat, n.lon)
    const isFocus = props.focus === n.id
    const isHover = hover === n.id
    const r = isFocus || isHover ? 4.2 : 2.3
    ctx.fillStyle = isFocus ? '#ff5d73' : '#6ee7f9'
    ctx.globalAlpha = isFocus || isHover ? 1 : 0.8
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill()
    ctx.globalAlpha = 0.25
    ctx.beginPath(); ctx.arc(p.x, p.y, r + 4, 0, 6.2832); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke()
    ctx.globalAlpha = 1
    if (isFocus || isHover) {
      ctx.fillStyle = '#e8ecf8'
      ctx.font = '600 11px Inter, sans-serif'
      ctx.fillText(n.name.toUpperCase(), p.x + 9, p.y - 8)
    }
  }

  // sapuan scan
  const sx = rect.x + ((now / 60) % rect.w)
  const sg = ctx.createLinearGradient(sx - 30, 0, sx + 4, 0)
  sg.addColorStop(0, 'rgba(110,231,249,0)')
  sg.addColorStop(1, 'rgba(110,231,249,0.10)')
  ctx.fillStyle = sg
  ctx.fillRect(sx - 30, rect.y, 34, rect.h)

  // bersihkan yang selesai
  attacks = attacks.filter(a => now - a.start < a.dur + 120)
  pulses = pulses.filter(p => now - p.start < 900)
  active.value = attacks.length
}

function loop(now) {
  if (disposed) return
  if (!props.paused) {
    if (!reduced && now - lastSpawn > SPAWN_MS[props.intensity]) {
      spawn(now); lastSpawn = now
    }
    draw(now)
  }
  raf = requestAnimationFrame(loop)
}

function onMove(e) {
  const c = canvasRef.value
  const b = c.getBoundingClientRect()
  const n = pickNode(e.clientX - b.left, e.clientY - b.top)
  hover = n ? n.id : null
  c.style.cursor = n ? 'pointer' : 'default'
}
function onClick(e) {
  const c = canvasRef.value
  const b = c.getBoundingClientRect()
  const n = pickNode(e.clientX - b.left, e.clientY - b.top)
  if (n) emit('update:focus', n.id === props.focus ? '' : n.id)
}
function onLeave() { hover = null }

onMounted(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduced = mq.matches
  ctx = canvasRef.value.getContext('2d')
  resize()
  ro = new ResizeObserver(resize)
  ro.observe(hostRef.value)
  const c = canvasRef.value
  c.addEventListener('pointermove', onMove)
  c.addEventListener('pointerleave', onLeave)
  c.addEventListener('click', onClick)
  if (reduced) {
    const base = performance.now()
    for (let i = 0; i < 9; i++) spawn(base - i * 190)
    draw(base)
  } else {
    raf = requestAnimationFrame(loop)
  }
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(raf)
  ro?.disconnect()
  const c = canvasRef.value
  if (c) {
    c.removeEventListener('pointermove', onMove)
    c.removeEventListener('pointerleave', onLeave)
    c.removeEventListener('click', onClick)
  }
})

watch(() => props.paused, (p) => {
  if (!p && reduced) draw(performance.now())
})
</script>

<style scoped>
.cyber-scene { position: relative; width: 100%; height: 100%; min-height: 420px; overflow: hidden; background: #05060d; }
.cyber-scene__canvas { display: block; width: 100%; height: 100%; touch-action: manipulation; }
.cyber-scene__hud { position: absolute; top: 14px; left: 16px; display: flex; gap: 26px; pointer-events: none; }
.cyber-hud__stat { display: flex; flex-direction: column; gap: 2px; }
.cyber-hud__label { font-size: 10px; letter-spacing: .12em; color: var(--faint); }
.cyber-hud__stat strong { font-family: var(--display); font-size: 18px; color: var(--ink); font-weight: 600; }
.cyber-scene__legend { position: absolute; bottom: 12px; left: 16px; display: flex; flex-wrap: wrap; gap: 14px; pointer-events: none; }
.cyber-legend { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted); }
.cyber-legend i { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.cyber-scene__focus { position: absolute; top: 14px; right: 16px; font-size: 11px; letter-spacing: .08em; color: #ff8a9a; display: flex; align-items: center; gap: 8px; }
.cyber-scene__focus button { pointer-events: auto; background: none; border: none; color: #ff8a9a; font-size: 17px; line-height: 1; cursor: pointer; padding: 2px 4px; }
@media (max-width: 640px) {
  .cyber-scene { min-height: 340px; }
  .cyber-scene__legend { gap: 9px; font-size: 10px; }
  .cyber-hud__stat strong { font-size: 15px; }
}
</style>
