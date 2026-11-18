<template>
  <div class="cyber-page">
    <section class="cyber-hero">
      <div class="wrap">
        <h1>Perang Siber</h1>
        <p class="cyber-lede">
          Visualisasi simulasi lalu lintas serangan: simpul jaringan, kota, dan busur serangan yang
          melintasi peta dunia secara real-time. Ini karya visual, bukan data ancaman nyata.
        </p>
      </div>
    </section>

    <section class="cyber-stage-wrap">
      <div class="wrap">
        <div class="cyber-stage">
          <CyberScene
            :intensity="intensity"
            :focus="focus"
            :paused="paused"
            @attack="onAttack"
            @update:focus="focus = $event"
          />
          <div class="cyber-controls" role="group" aria-label="Kontrol visualisasi">
            <div class="cyber-seg" role="group" aria-label="Intensitas serangan">
              <button
                v-for="m in modes" :key="m.id" type="button"
                :class="{ on: intensity === m.id }"
                :aria-pressed="intensity === m.id"
                @click="intensity = m.id"
              >{{ m.name }}</button>
            </div>
            <button class="cyber-btn" type="button" :aria-pressed="paused" @click="paused = !paused">
              {{ paused ? 'Lanjutkan' : 'Jeda' }}
            </button>
            <label class="cyber-select">
              <span class="sr-only">Fokus ke simpul</span>
              <select :value="focus" @change="focus = $event.target.value">
                <option value="">Semua simpul</option>
                <option v-for="n in nodeList" :key="n.id" :value="n.id">{{ n.name }}</option>
              </select>
            </label>
          </div>
        </div>

        <div class="cyber-feed" aria-label="Aktivitas serangan simulasi">
          <div class="cyber-feed__head">
            <span>Aktivitas terbaru</span>
            <span class="cyber-feed__tag">SIMULASI</span>
          </div>
          <ul>
            <li v-for="(e, i) in feed" :key="e.key">
              <span class="cyber-feed__time">{{ e.time }}</span>
              <i :style="{ background: e.color }"></i>
              <span class="cyber-feed__type">{{ e.type }}</span>
              <span class="cyber-feed__route">{{ e.src }} <b>→</b> {{ e.dst }}</span>
            </li>
            <li v-if="!feed.length" class="cyber-feed__empty">Menunggu aktivitas…</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="cyber-section">
      <div class="wrap cyber-grid">
        <div class="cyber-section__head">
          <h2>Anatomi serangan</h2>
          <p>Empat tahap yang biasa terlihat pada insiden siber, dari pintu masuk sampai dampak akhir.</p>
        </div>
        <ol class="cyber-phases">
          <li>
            <span class="cyber-phase__kicker">PENGENALAN</span>
            <h3>Reconnaissance</h3>
            <p>Memindai port, enumerasi subdomain, dan mengumpulkan jejak publik sebelum menyentuh sistem.</p>
          </li>
          <li>
            <span class="cyber-phase__kicker">AKSES AWAL</span>
            <h3>Ekspoitasi</h3>
            <p>Kredensial bocor, phishing, atau celah aplikasi dipakai untuk masuk ke jaringan korban.</p>
          </li>
          <li>
            <span class="cyber-phase__kicker">PERGERAKAN</span>
            <h3>Lateral movement</h3>
            <p>Sekali masuk, pergerakan menyebar ke host lain memakai hak akses yang dicuri.</p>
          </li>
          <li>
            <span class="cyber-phase__kicker">DAMPAK</span>
            <h3>Eksfiltrasi &amp; ransomware</h3>
            <p>Data dikirim keluar atau dienkripsi, lalu pelaku meninggalkan jejak penghancuran.</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="cyber-section cyber-section--alt">
      <div class="wrap cyber-grid">
        <div class="cyber-section__head">
          <h2>Jenis vektor</h2>
          <p>Warna pada peta menandakan kategori serangan yang divisualisasikan.</p>
        </div>
        <ul class="cyber-vectors">
          <li v-for="v in vectors" :key="v.name">
            <i :style="{ background: v.color }"></i>
            <h3>{{ v.name }}</h3>
            <p>{{ v.desc }}</p>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CyberScene from '~/components/CyberScene.vue'

useHead({ title: 'Perang Siber — Ringga.Space' })

const modes = [
  { id: 'rendah', name: 'Rendah' },
  { id: 'sedang', name: 'Sedang' },
  { id: 'tinggi', name: 'Tinggi' },
]
const nodeList = [
  { id: 'jkt', name: 'Jakarta' }, { id: 'sin', name: 'Singapura' }, { id: 'tyo', name: 'Tokyo' },
  { id: 'sel', name: 'Seoul' }, { id: 'bjs', name: 'Beijing' }, { id: 'bom', name: 'Mumbai' },
  { id: 'dxb', name: 'Dubai' }, { id: 'mos', name: 'Moskow' }, { id: 'iev', name: 'Kyiv' },
  { id: 'ber', name: 'Berlin' }, { id: 'lon', name: 'London' }, { id: 'par', name: 'Paris' },
  { id: 'lag', name: 'Lagos' }, { id: 'jnb', name: 'Johannesburg' }, { id: 'nyc', name: 'New York' },
  { id: 'was', name: 'Washington' }, { id: 'yyz', name: 'Toronto' }, { id: 'sao', name: 'São Paulo' },
  { id: 'syd', name: 'Sydney' }, { id: 'tpe', name: 'Taipei' },
]
const vectors = [
  { name: 'DDoS', color: '#ff5d73', desc: 'Banjir trafik dari banyak sumber untuk melumpuhkan layanan.' },
  { name: 'Ransomware', color: '#ff9f43', desc: 'Malware yang mengunci data dan menuntut pembayaran.' },
  { name: 'Phishing', color: '#f6d365', desc: 'Penyamarataan identitas untuk mencuri kredensial.' },
  { name: 'Exploit', color: '#c084fc', desc: 'Pemanfaatan celah perangkat lunak yang belum ditambal.' },
  { name: 'Botnet', color: '#6ee7f9', desc: 'Jaringan perangkat yang dikendalikan dari jarak jauh.' },
]

const intensity = ref('sedang')
const focus = ref('')
const paused = ref(false)
const feed = ref([])
let seq = 0

function onAttack(e) {
  const now = new Date()
  feed.value = [{
    key: ++seq,
    time: now.toTimeString().slice(0, 8),
    color: e.color,
    type: e.type,
    src: e.src,
    dst: e.dst,
  }, ...feed.value].slice(0, 7)
}
</script>

<style scoped>
.cyber-page { padding-bottom: 40px; }
.cyber-hero { padding-block: clamp(72px, 10vw, 130px) clamp(36px, 5vw, 60px); }
.cyber-hero h1 {
  font-family: var(--display);
  font-weight: 700;
  font-size: clamp(56px, 11vw, 150px);
  line-height: 0.9;
  letter-spacing: -0.045em;
  margin: 0;
}
.cyber-lede {
  max-width: 62ch;
  margin: 26px 0 0;
  font-size: clamp(16px, 1.7vw, 20px);
  line-height: 1.55;
  color: var(--muted);
}
.cyber-stage-wrap { padding-bottom: clamp(80px, 12vw, 150px); }
.cyber-stage {
  position: relative;
  height: clamp(480px, 62vh, 720px);
  border: 1px solid var(--line-soft);
  background: #05060d;
  overflow: hidden;
}
.cyber-controls {
  position: absolute;
  left: 16px;
  bottom: 52px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  z-index: 2;
}
.cyber-seg { display: inline-flex; border: 1px solid var(--line); }
.cyber-seg button, .cyber-btn {
  font: 500 12px var(--body);
  color: var(--muted);
  background: rgba(5, 6, 13, 0.82);
  border: none;
  padding: 8px 14px;
  cursor: pointer;
  transition: color 160ms ease, background 160ms ease;
}
.cyber-seg button + button { border-left: 1px solid var(--line-soft); }
.cyber-seg button:hover, .cyber-btn:hover { color: var(--ink); }
.cyber-seg button.on { background: var(--accent); color: var(--accent-ink); }
.cyber-btn { border: 1px solid var(--line); }
.cyber-select select {
  font: 500 12px var(--body);
  color: var(--ink);
  background: rgba(5, 6, 13, 0.9);
  border: 1px solid var(--line);
  padding: 8px 10px;
  max-width: 170px;
}
.cyber-feed { margin-top: 22px; }
.cyber-feed__head {
  display: flex; align-items: center; gap: 12px;
  font: 600 12px var(--body); color: var(--ink); margin-bottom: 10px;
}
.cyber-feed__tag {
  font-size: 10px; letter-spacing: .1em; color: var(--faint);
  border: 1px solid var(--line-soft); padding: 2px 7px;
}
.cyber-feed ul { list-style: none; margin: 0; padding: 0; }
.cyber-feed li {
  display: flex; align-items: center; gap: 12px;
  padding: 7px 0; border-top: 1px solid var(--line-soft);
  font-size: 13px; color: var(--muted);
}
.cyber-feed li:first-child { border-top: none; }
.cyber-feed li i { width: 7px; height: 7px; border-radius: 50%; flex: none; }
.cyber-feed__time { font-variant-numeric: tabular-nums; color: var(--faint); min-width: 62px; }
.cyber-feed__type { min-width: 110px; color: var(--ink); }
.cyber-feed__route b { color: var(--accent); font-weight: 500; padding-inline: 3px; }
.cyber-feed__empty { color: var(--faint); }

.cyber-section { padding-block: clamp(70px, 10vw, 130px); border-top: 1px solid var(--line-soft); }
.cyber-section--alt { background: var(--bg-2); }
.cyber-grid { display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); gap: clamp(40px, 6vw, 100px); }
.cyber-section__head h2 {
  font-family: var(--display); font-weight: 700;
  font-size: clamp(34px, 5vw, 64px); line-height: 1; letter-spacing: -0.035em; margin: 0;
}
.cyber-section__head p { margin: 20px 0 0; color: var(--muted); font-size: 15px; line-height: 1.6; max-width: 38ch; }
.cyber-phases { list-style: none; margin: 0; padding: 0; }
.cyber-phases li { padding: 20px 0; border-top: 1px solid var(--line-soft); }
.cyber-phases li:first-child { border-top: none; padding-top: 0; }
.cyber-phase__kicker { font-size: 10px; letter-spacing: .12em; color: var(--accent); }
.cyber-phases h3 { font-family: var(--display); font-size: 21px; margin: 8px 0 6px; font-weight: 600; }
.cyber-phases p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.6; }
.cyber-vectors { list-style: none; margin: 0; padding: 0; }
.cyber-vectors li { display: grid; grid-template-columns: 10px 130px 1fr; align-items: baseline; gap: 14px; padding: 16px 0; border-top: 1px solid var(--line-soft); }
.cyber-vectors li:first-child { border-top: none; padding-top: 0; }
.cyber-vectors i { width: 9px; height: 9px; border-radius: 50%; }
.cyber-vectors h3 { font-family: var(--display); font-size: 17px; margin: 0; font-weight: 600; }
.cyber-vectors p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.55; }

.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

@media (max-width: 820px) {
  .cyber-grid { grid-template-columns: 1fr; gap: 40px; }
  .cyber-stage { height: 520px; }
}
@media (max-width: 640px) {
  .cyber-stage { height: 440px; }
  .cyber-controls { bottom: 46px; right: 12px; left: 12px; gap: 7px; }
  .cyber-seg button, .cyber-btn { padding: 7px 10px; font-size: 11px; }
  .cyber-select select { max-width: 130px; font-size: 11px; }
  .cyber-feed li { flex-wrap: wrap; gap: 6px 10px; }
  .cyber-feed__type { min-width: 0; }
  .cyber-vectors li { grid-template-columns: 10px 1fr; }
  .cyber-vectors p { grid-column: 2; }
}
@media (prefers-reduced-motion: reduce) {
  .cyber-seg button, .cyber-btn { transition: none; }
  html { scroll-behavior: auto; }
}
</style>
