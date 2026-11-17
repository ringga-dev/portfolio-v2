<template>
  <div>
    <section style="position: relative; min-height: 58dvh; display: flex; align-items: center; overflow: hidden;">
      <SpaceScene variant="mini" style="position: absolute; inset: 0; z-index: 0; opacity: 0.8;" />
      <div class="wrap" style="position: relative; z-index: 1; padding-block: 96px 56px;">
        <p class="eyebrow rise-in">Full manifest</p>
        <h1 class="rise-in" style="font-size: clamp(52px, 10vw, 128px); margin-top: 16px;">The work</h1>
        <p class="rise-in" style="font-size: clamp(17px, 2vw, 21px); color: var(--ink); max-width: 52ch; margin-top: 20px;">Systems designed, launched, and maintained. Open-source and production work.</p>
      </div>
    </section>

    <section class="section" style="padding-top: 24px;">
      <div class="wrap">
        <div style="display: grid; gap: 20px;">
          <article v-for="(p, i) in projects.projects" :key="p.slug" class="card reveal" style="padding: clamp(24px, 4vw, 38px); position: relative; overflow: hidden;">
            <div class="orbit-line" :style="{ position: 'absolute', width: '240px', height: '240px', right: '-110px', top: '-110px', '--r': '120px', animationDirection: i % 2 ? 'reverse' : 'normal' }"></div>
            <div style="position: relative; z-index: 1;">
              <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px;">
                <span style="font-family: var(--display); font-size: 13px; letter-spacing: 0.16em; color: var(--accent);">ORBIT {{ String(i + 1).padStart(2, '0') }}</span>
                <span style="font-size: 12px; color: var(--faint);">{{ p.slug }}</span>
              </div>
              <h2 style="font-size: clamp(26px, 4vw, 40px); margin-top: 16px;">{{ p.title }}</h2>
              <p style="font-size: 16px; max-width: 66ch; color: var(--muted);">{{ p.description }}</p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0 24px;">
                <span v-for="t in p.tech" :key="t" style="font-size: 12px; padding: 5px 12px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted);">{{ t }}</span>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <a :href="p.url" target="_blank" rel="noopener" style="font-size: 14px; color: var(--accent); font-weight: 600;">Repository →</a>
                <a v-if="p.live" :href="p.live" target="_blank" rel="noopener" style="font-size: 14px; color: var(--accent-2); font-weight: 600;">Live site →</a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import projects from '~/data/projects.json'

useSeoMeta({
  title: 'Work — Ringga Septia Pribadi',
  description: 'Selected projects: System Monitor, Dongeng Sebelum Tidur, Pancing Bot, KMP Printer, and Portfolio v2.',
})
</script>
