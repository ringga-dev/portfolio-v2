<template>
  <div class="cyber-page">
    <section class="cyber-hero">
      <div class="wrap">
        <h1>Perang Siber</h1>
        <p class="cyber-lede">
          Insiden ransomware nyata dari ransomware.live, dipetakan ke Bumi dan diperbarui otomatis.
          Setiap titik adalah korban yang benar-benar dilaporkan; garis menghubungkan korban dalam
          grup yang sama — bukan klaim asal pelaku.
        </p>
        <div class="cyber-source">
          <span class="cyber-live-dot"></span>
          DATA REAL · {{ fetchedLabel }} · {{ data.count }} insiden
          <a href="https://www.ransomware.live/" target="_blank" rel="noopener">sumber ↗</a>
        </div>
      </div>
    </section>

    <section class="cyber-stage-wrap">
      <div class="wrap">
        <div class="cyber-stage">
          <CyberGlobe3D
            :events="arcEvents"
            :focus="focus"
            :paused="paused"
            @select="onSelect"
          />
          <div class="cyber-controls" role="group" aria-label="Kontrol visualisasi">
            <label class="cyber-select">
              <span class="sr-only">Fokus grup ransomware</span>
              <select :value="focus" @change="focus = $event.target.value">
                <option value="">Semua grup</option>
                <option v-for="g in groups" :key="g" :value="g">{{ g }}</option>
              </select>
            </label>
            <button class="cyber-btn" type="button" :aria-pressed="paused" @click="paused = !paused">
              {{ paused ? 'Lanjutkan' : 'Jeda' }}
            </button>
          </div>
          <p class="cyber-hint">Geser untuk memutar Bumi · gulir untuk zoom · klik titik untuk fokus</p>
        </div>

        <div class="cyber-feed" aria-label="Insiden nyata terbaru">
          <div class="cyber-feed__head">
            <span>Insiden terbaru</span>
            <span class="cyber-feed__tag">DATA REAL</span>
          </div>
          <ul>
            <li v-for="e in visibleEvents" :key="e.id">
              <span class="cyber-feed__time">{{ shortDate(e.discovered) }}</span>
              <span class="cyber-feed__type">{{ e.group }}</span>
              <span class="cyber-feed__route">
                <b>{{ e.victim }}</b> · {{ countryName(e.country) }} · {{ e.sector || 'sektor n/a' }}
              </span>
            </li>
          </ul>
          <details class="cyber-detail">
            <summary>Lihat {{ data.events.length }} insiden lengkap</summary>
            <ul>
              <li v-for="e in data.events" :key="e.id">
                <span class="cyber-feed__time">{{ shortDate(e.discovered) }}</span>
                <span class="cyber-feed__type">{{ e.group }}</span>
                <span class="cyber-feed__route">
                  <b>{{ e.victim }}</b> · {{ countryName(e.country) }} · {{ e.sector || 'sektor n/a' }}
                  <template v-if="e.dataSize"> · {{ e.dataSize }}</template>
                </span>
              </li>
            </ul>
          </details>
        </div>
      </div>
    </section>

    <section class="cyber-section">
      <div class="wrap cyber-grid">
        <div class="cyber-section__head">
          <h2>Grup paling aktif</h2>
          <p>Diurutkan dari jumlah korban yang saat ini tercatat di feed.</p>
        </div>
        <ol class="cyber-groups">
          <li v-for="g in rankedGroups" :key="g.name">
            <span class="cyber-group__count">{{ g.count }}</span>
            <h3>{{ g.name }}</h3>
            <p>{{ g.countries }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="cyber-section cyber-section--alt">
      <div class="wrap cyber-grid">
        <div class="cyber-section__head">
          <h2>Anatomi serangan</h2>
          <p>Empat tahap umum pada insiden ransomware, dari akses awal sampai dampak.</p>
        </div>
        <ol class="cyber-phases">
          <li><span class="cyber-phase__kicker">AKSES AWAL</span><h3>Ekspoitasi &amp; kredensial</h3><p>Celah perangkat lunak atau kredensial bocor dipakai untuk masuk ke jaringan korban.</p></li>
          <li><span class="cyber-phase__kicker">PERGERAKAN</span><h3>Lateral movement</h3><p>Akses diperluas ke host lain memakai hak yang dicuri.</p></li>
          <li><span class="cyber-phase__kicker">EKSTRAKSI</span><h3>Pencurian data</h3><p>Data disalin keluar sebelum enkripsi, lalu dipakai sebagai tekanan pembayaran.</p></li>
          <li><span class="cyber-phase__kicker">DAMPAK</span><h3>Enkripsi &amp; pengumuman</h3><p>Sistem dikunci dan korban dipublikasikan di situs grup bila tebusan tidak dibayar.</p></li>
        </ol>
      </div>
    </section>

    <section class="cyber-credit">
      <div class="wrap">
        <p>
          Sumber data: ransomware.live (korban ransomware yang dipublikasikan pelaku). Koordinat
          negara dari Natural Earth 110m. Data diambil otomatis oleh GitHub Actions, bukan rekaan.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CyberGlobe3D from '~/components/CyberGlobe3D.vue'
import snapshot from '~/data/threats-snapshot.json'

useHead({ title: 'Perang Siber — Ringga.Space' })

const data = ref(snapshot)
const focus = ref('')
const paused = ref(false)

onMounted(async () => {
  try {
    const base = useRuntimeConfig().app.baseURL || '/'
    const r = await fetch(`${base}data/threats.json`, { cache: 'no-store' })
    if (r.ok) {
      const fresh = await r.json()
      if (fresh && Array.isArray(fresh.events) && fresh.events.length) data.value = fresh
    }
  } catch { /* snapshot tetap dipakai */ }
})

const fetchedLabel = computed(() => {
  const d = new Date(data.value.fetchedAt)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
})

const names = typeof Intl !== 'undefined' && Intl.DisplayNames
  ? new Intl.DisplayNames(['id'], { type: 'region' }) : null
function countryName(code) {
  if (!code) return 'negara n/a'
  try { return names ? (names.of(code) || code) : code } catch { return code }
}
function shortDate(s) { return s ? String(s).slice(0, 10) : '—' }

const rankedGroups = computed(() => {
  const m = new Map()
  for (const e of data.value.events) {
    const g = e.group || 'tidak diketahui'
    if (!m.has(g)) m.set(g, { name: g, count: 0, set: new Set() })
    const o = m.get(g); o.count++; if (e.country) o.set.add(countryName(e.country))
  }
  return [...m.values()].sort((a, b) => b.count - a.count).slice(0, 8)
    .map(x => ({ name: x.name, count: x.count, countries: [...x.set].slice(0, 5).join(', ') }))
})

const groups = computed(() => [...new Set(data.value.events.map(e => e.group).filter(Boolean))].sort())

// Busur: hubungan antar korban dalam grup yang sama. BUKAN asal serangan.
const arcEvents = computed(() => {
  const byGroup = new Map()
  for (const e of data.value.events) {
    if (e.lat == null || e.lon == null) continue
    if (!byGroup.has(e.group)) byGroup.set(e.group, [])
    byGroup.get(e.group).push(e)
  }
  const out = []
  for (const [g, list] of byGroup) {
    if (list.length < 2) continue
    const sorted = [...list].sort((a, b) => new Date(a.discovered) - new Date(b.discovered))
    for (let i = 1; i < Math.min(sorted.length, 5); i++) {
      const a = sorted[i - 1], b = sorted[i]
      if (a.country === b.country) continue
      out.push({
        id: `${g}-${i}`,
        from: { lat: a.lat, lon: a.lon, name: a.victim, country: a.country },
        to: { lat: b.lat, lon: b.lon, name: b.victim, country: b.country },
        color: '#ff9f43',
        group: g,
      })
    }
  }
  return out
})

const visibleEvents = computed(() => {
  const list = focus.value ? data.value.events.filter(e => e.group === focus.value) : data.value.events
  return list.slice(0, 8)
})

function onSelect(name) {
  const hit = data.value.events.find(e => e.victim === name || e.group === name)
  if (hit) focus.value = hit.group
}
</script>

<style scoped>
.cyber-page { padding-bottom: 40px; }
.cyber-hero { padding-block: clamp(72px, 10vw, 130px) clamp(36px, 5vw, 60px); }
.cyber-hero h1 { font-family: var(--display); font-weight: 700; font-size: clamp(56px, 11vw, 150px); line-height: .9; letter-spacing: -.045em; margin: 0; }
.cyber-lede { max-width: 68ch; margin: 26px 0 0; font-size: clamp(16px, 1.7vw, 20px); line-height: 1.55; color: var(--muted); }
.cyber-source { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 20px; font-size: 12px; color: var(--muted); }
.cyber-source a { color: var(--accent); }
.cyber-live-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; }
.cyber-stage-wrap { padding-bottom: clamp(80px, 12vw, 150px); }
.cyber-stage { position: relative; height: clamp(560px, 72vh, 820px); border: 1px solid var(--line-soft); background: #05060d; overflow: hidden; }
.cyber-controls { position: absolute; left: 16px; bottom: 46px; display: flex; flex-wrap: wrap; gap: 10px; z-index: 3; }
.cyber-btn, .cyber-select select { font: 500 12px var(--body); color: var(--ink); background: rgba(5,6,13,.86); border: 1px solid var(--line); padding: 8px 12px; cursor: pointer; }
.cyber-btn:hover { color: var(--accent); }
.cyber-select select { max-width: 230px; }
.cyber-hint { position: absolute; left: 16px; bottom: 14px; margin: 0; font-size: 11px; color: var(--faint); z-index: 2; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
.cyber-feed { margin-top: 22px; }
.cyber-feed__head { display: flex; align-items: center; gap: 12px; font: 600 12px var(--body); color: var(--ink); margin-bottom: 10px; }
.cyber-feed__tag { font-size: 10px; letter-spacing: .1em; color: #4ade80; border: 1px solid rgba(74,222,128,.3); padding: 2px 7px; }
.cyber-feed ul { list-style: none; margin: 0; padding: 0; }
.cyber-feed li { display: flex; align-items: baseline; gap: 12px; padding: 7px 0; border-top: 1px solid var(--line-soft); font-size: 13px; color: var(--muted); }
.cyber-feed li:first-child { border-top: none; }
.cyber-feed__time { font-variant-numeric: tabular-nums; color: var(--faint); min-width: 86px; }
.cyber-feed__type { min-width: 130px; color: var(--ink); }
.cyber-feed__route b { color: var(--accent); font-weight: 500; }
.cyber-detail { margin-top: 16px; font-size: 13px; color: var(--muted); }
.cyber-detail summary { cursor: pointer; color: var(--accent); }
.cyber-detail ul { margin-top: 12px; max-height: 420px; overflow: auto; }
.cyber-section { padding-block: clamp(70px, 10vw, 130px); border-top: 1px solid var(--line-soft); }
.cyber-section--alt { background: var(--bg-2); }
.cyber-grid { display: grid; grid-template-columns: minmax(0,.85fr) minmax(0,1.15fr); gap: clamp(40px,6vw,100px); }
.cyber-section__head h2 { font-family: var(--display); font-weight: 700; font-size: clamp(34px,5vw,64px); line-height: 1; letter-spacing: -.035em; margin: 0; }
.cyber-section__head p { margin: 20px 0 0; color: var(--muted); font-size: 15px; line-height: 1.6; max-width: 38ch; }
.cyber-groups, .cyber-phases { list-style: none; margin: 0; padding: 0; }
.cyber-groups li { display: grid; grid-template-columns: 58px 1fr; gap: 4px 16px; padding: 14px 0; border-top: 1px solid var(--line-soft); }
.cyber-groups li:first-child, .cyber-phases li:first-child { border-top: none; padding-top: 0; }
.cyber-group__count { grid-row: span 2; font-family: var(--display); font-size: 28px; color: var(--accent); }
.cyber-groups h3, .cyber-phases h3 { font-family: var(--display); font-size: 18px; margin: 0; font-weight: 600; }
.cyber-groups p, .cyber-phases p { grid-column: 2; margin: 0; color: var(--muted); font-size: 13px; line-height: 1.5; }
.cyber-phases li { padding: 18px 0; border-top: 1px solid var(--line-soft); }
.cyber-phase__kicker { font-size: 10px; letter-spacing: .12em; color: var(--accent); }
.cyber-phases h3 { margin: 8px 0 6px; }
.cyber-credit { padding-block: 60px; border-top: 1px solid var(--line-soft); color: var(--faint); font-size: 13px; }
.cyber-credit a { color: var(--accent); }
@media (max-width: 820px) { .cyber-grid { grid-template-columns: 1fr; gap: 40px; } .cyber-stage { height: 540px; } }
@media (max-width: 640px) {
  .cyber-stage { height: 480px; }
  .cyber-controls { left: 12px; right: 12px; bottom: 42px; }
  .cyber-feed li { flex-wrap: wrap; gap: 4px 10px; }
  .cyber-feed__type { min-width: 0; }
}
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
</style>
