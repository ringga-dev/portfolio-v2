<template>
  <div>
    <section style="position: relative; min-height: 62dvh; display: flex; align-items: center; overflow: hidden;">
      <SpaceScene planet="mars" variant="hero" style="position: absolute; inset: 0; z-index: 0; opacity: 0.9;" />
      <div class="wrap" style="position: relative; z-index: 1; padding-block: 96px 56px;">
        <p class="eyebrow rise-in">Mission log · Mars</p>
        <span class="planet-badge rise-in">PLANET 04 · MARS</span>
        <h1 class="rise-in" style="font-size: clamp(48px, 9vw, 110px); max-width: 12ch; margin-top: 16px;">About the engineer</h1>
        <p class="rise-in" style="font-size: clamp(17px, 2vw, 21px); color: var(--ink); max-width: 52ch; margin-top: 22px;">{{ profile.title }} based in {{ profile.location }}.</p>
      </div>
    </section>

    <section class="section">
      <div class="wrap" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: clamp(28px, 6vw, 80px);">
        <div>
          <p class="eyebrow reveal">Briefing</p>
          <h2 class="section-title reveal" style="margin-top: 12px;">What I do</h2>
          <p class="reveal" style="font-size: 18px; color: var(--ink); max-width: 54ch; margin-top: 20px;">{{ profile.bio }}</p>
          <p class="reveal" style="font-size: 16px; max-width: 54ch; margin-top: 18px;">My work spans Kotlin Multiplatform and Vue — from mobile interfaces to system-level integrations. I care about software that actually ships and keeps running.</p>
          <div class="reveal" style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px;">
            <a :href="'mailto:' + profile.email" class="btn-primary">Email me</a>
            <a :href="profile.github" target="_blank" rel="noopener" class="btn-ghost">GitHub</a>
          </div>
        </div>
        <div class="panel reveal" style="padding: 30px; align-self: start;">
          <div style="font-family: var(--display); color: var(--accent); font-size: 14px; letter-spacing: 0.14em; margin-bottom: 22px;">FLIGHT DATA</div>
          <div v-for="row in flightData" :key="row.label" style="display: flex; justify-content: space-between; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--line-soft);">
            <span style="color: var(--muted); font-size: 14px;">{{ row.label }}</span>
            <span style="color: var(--ink); font-size: 14px; text-align: right;">{{ row.value }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="background: rgba(10,13,28,0.5);">
      <div class="wrap">
        <p class="eyebrow reveal">Missions</p>
        <h2 class="section-title reveal" style="margin-top: 12px;">Experience</h2>
        <div style="margin-top: 40px; position: relative; padding-left: 28px;">
          <div style="position: absolute; left: 6px; top: 8px; bottom: 8px; width: 1px; background: linear-gradient(var(--accent), var(--accent-2), transparent);"></div>
          <div v-for="(e, i) in profile.experience" :key="i" class="card reveal" style="padding: 28px; margin-bottom: 20px; position: relative;">
            <div style="position: absolute; left: -28px; top: 32px; width: 11px; height: 11px; border-radius: 50%; background: var(--accent); box-shadow: var(--glow);"></div>
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px;">
              <h3 style="font-size: 22px; margin: 0;">{{ e.role }}</h3>
              <span style="font-family: var(--display); font-size: 14px; color: var(--accent-2);">{{ e.period }}</span>
            </div>
            <p style="color: var(--muted); margin: 6px 0 14px;">{{ e.company }}</p>
            <p style="color: var(--ink); margin: 0; font-size: 15px;">{{ e.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import profile from '~/data/profile.json'

const flightData = [
  { label: 'Role', value: profile.title },
  { label: 'Base', value: profile.location },
  { label: 'Focus', value: 'Kotlin · Vue · Rust' },
  { label: 'Email', value: profile.email },
]

useSeoMeta({
  title: 'About — Ringga Septia Pribadi',
  description: 'Mission log of Ringga Septia Pribadi, a multi-platform engineer based in Batam, Indonesia.',
})
</script>
