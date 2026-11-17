<template>
  <div class="tata-surya-page">
    <!-- HERO -->
    <section class="section ts-hero">
      <div class="wrap">
        <p class="eyebrow reveal">Eksplorasi kosmik · Sistem kita</p>
        <h1 class="ts-title reveal" style="margin-top: 16px;">Tata Surya</h1>
        <p class="ts-sub reveal" style="margin-top: 18px;">
          Delapan planet, satu bintang, dan hamparan ruang hampa — sebuah sistem yang
          terus berputar selama miliaran tahun. Lihat dan jelajahi orbitnya di bawah.
        </p>
      </div>
    </section>

    <!-- SIMULASI 3D -->
    <section class="ts-stage-wrap">
      <div class="wrap">
        <div class="panel ts-stage reveal">
          <SolarScene />
        </div>
        <p class="ts-hint reveal">
          Arahkan kursor untuk sedikit menggeser sudut pandang · animasi berhenti saat
          tab tidak terlihat atau saat preferensi gerak dikurangi.
        </p>
      </div>
    </section>

    <!-- DAFTAR PLANET -->
    <section class="section">
      <div class="wrap">
        <p class="eyebrow reveal">Peta sistem</p>
        <h2 class="section-title reveal" style="margin-top: 14px;">Delapan planet, berurutan dari Matahari</h2>
        <p class="reveal" style="max-width: 58ch; font-size: 16px; margin-top: 12px;">
          Semakin dekat ke Matahari, semakin cepat planet mengorbit. Planet dalam
          berbatu; planet luar sebagian besar adalah raksasa gas dan es.
        </p>

        <ol class="ts-list" style="margin-top: 40px;">
          <li
            v-for="p in planets"
            :key="p.key"
            class="card ts-row reveal"
          >
            <span class="ts-order">{{ String(p.order).padStart(2, '0') }}</span>
            <span class="ts-dot" :style="{ '--dot': p.color }" aria-hidden="true"></span>
            <div class="ts-name">
              <strong>{{ p.name }}</strong>
              <small>{{ p.en }}</small>
            </div>
            <span class="ts-type">{{ p.type }}</span>
          </li>
        </ol>

        <div class="reveal" style="margin-top: 40px; display: flex; flex-wrap: wrap; gap: 12px;">
          <NuxtLink to="/" class="btn-ghost">← Kembali ke beranda</NuxtLink>
          <NuxtLink to="/about" class="btn-primary">Tentang saya →</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import SolarScene from '~/components/SolarScene.vue'

const planets = [
  { key: 'mercury', order: 1, name: 'Merkurius', en: 'Mercury', type: 'Planet kebumian', color: '#9a938c' },
  { key: 'venus', order: 2, name: 'Venus', en: 'Venus', type: 'Planet kebumian', color: '#d8c08a' },
  { key: 'earth', order: 3, name: 'Bumi', en: 'Earth', type: 'Planet kebumian', color: '#4e93e0' },
  { key: 'mars', order: 4, name: 'Mars', en: 'Mars', type: 'Planet kebumian', color: '#c1501c' },
  { key: 'jupiter', order: 5, name: 'Jupiter', en: 'Jupiter', type: 'Gas raksasa', color: '#c9a06f' },
  { key: 'saturn', order: 6, name: 'Saturnus', en: 'Saturn', type: 'Gas raksasa', color: '#e6d9a8' },
  { key: 'uranus', order: 7, name: 'Uranus', en: 'Uranus', type: 'Raksasa es', color: '#a9dfe0' },
  { key: 'neptune', order: 8, name: 'Neptunus', en: 'Neptune', type: 'Raksasa es', color: '#5a7ce0' },
]

useSeoMeta({
  title: 'Tata Surya — Ringga.SPACE',
  description: 'Jelajahi tata surya dalam simulasi 3D interaktif: Matahari dan delapan planet dengan tekstur NASA nyata, orbit, dan cincin Saturnus.',
})
</script>

<style scoped>
.ts-hero {
  padding-bottom: clamp(24px, 4vw, 48px);
}
.ts-title {
  font-family: var(--display);
  font-size: clamp(56px, 13vw, 150px);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.05em;
  color: var(--ink);
}
.ts-sub {
  font-size: clamp(16px, 2vw, 21px);
  line-height: 1.6;
  color: var(--ink);
  max-width: 60ch;
}

.ts-stage-wrap {
  padding-block: clamp(8px, 2vw, 24px) clamp(48px, 8vw, 88px);
}
.ts-stage {
  position: relative;
  width: 100%;
  height: clamp(380px, 72vh, 720px);
  overflow: hidden;
  padding: 0;
}
.ts-hint {
  margin-top: 16px;
  font-size: 12px;
  color: var(--faint);
  text-align: center;
}

.ts-list {
  list-style: none;
  margin-inline: 0;
  padding-inline: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}
.ts-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  margin: 0;
}
.ts-order {
  font-family: var(--display);
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  min-width: 2ch;
}
.ts-dot {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  border-radius: 50%;
  background: var(--dot);
  box-shadow: 0 0 12px var(--dot);
}
.ts-name {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}
.ts-name strong {
  font-size: 16px;
  color: var(--ink);
}
.ts-name small {
  font-size: 11px;
  color: var(--faint);
}
.ts-type {
  margin-left: auto;
  text-align: right;
  font-size: 12px;
  color: var(--muted);
}

@media (max-width: 520px) {
  .ts-stage {
    height: clamp(340px, 62vh, 520px);
  }
}
</style>
