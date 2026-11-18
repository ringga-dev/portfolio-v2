<template>
  <div>
    <section style="position: relative; min-height: min(92dvh, 900px); display: flex; align-items: center; overflow: hidden;">
      <SpaceScene planet="earth" variant="hero" style="position: absolute; inset: 0; z-index: 0;" />
      <div class="wrap hero-content" style="position: relative; z-index: 1; padding-block: 96px 64px;">
        <p class="eyebrow rise-in">Mission control · Bumi</p>
        <span class="planet-badge rise-in">PLANET 03 · BUMI</span>
        <h1 class="rise-in" style="font-size: clamp(52px, 11vw, 150px); max-width: 15ch; margin-top: 20px;">
          Ringga<br /><span class="typed">Septia Pribadi</span>
        </h1>
        <p class="rise-in" style="font-size: clamp(17px, 2vw, 22px); color: var(--ink); max-width: 46ch; margin-top: 24px; line-height: 1.55;">
          I build mobile, web, and desktop applications with Kotlin and Vue.
        </p>
        <div class="rise-in" style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 36px;">
          <NuxtLink to="/projects" class="btn-primary">Explore the work →</NuxtLink>
          <NuxtLink to="/about" class="btn-ghost">Mission log</NuxtLink>
        </div>
        <div class="rise-in" style="display: flex; flex-wrap: wrap; gap: clamp(20px, 5vw, 56px); margin-top: 64px; padding-top: 28px; border-top: 1px solid var(--line);">
          <div v-for="s in profile.stats" :key="s.label">
            <div style="font-family: var(--display); font-size: clamp(30px, 5vw, 48px); font-weight: 700; line-height: 1; color: var(--accent);">{{ s.value }}</div>
            <div style="font-size: 13px; color: var(--muted); margin-top: 6px;">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <p class="eyebrow reveal">Selected work</p>
        <h2 class="section-title reveal" style="margin-top: 14px;">Satellites in orbit</h2>
        <p class="reveal" style="max-width: 56ch; font-size: 17px;">Each project is its own orbit — a system designed, launched, and maintained end to end.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 44px;">
          <article v-for="(p, i) in projects.projects.slice(0, 4)" :key="p.slug" class="card reveal" :class="'reveal-delay-' + (i % 3)" style="padding: 26px; position: relative; overflow: hidden;">
            <div class="orbit-line" style="position: absolute; width: 180px; height: 180px; right: -70px; top: -70px; --r: 90px;"></div>
            <div style="font-size: 12px; color: var(--accent); font-family: var(--display); letter-spacing: 0.14em;">{{ String(i + 1).padStart(2, '0') }} / ORBIT</div>
            <h3 style="font-size: 23px; margin-top: 16px;">{{ p.title }}</h3>
            <p style="font-size: 14px; min-height: 66px;">{{ p.description }}</p>
            <div style="display: flex; flex-wrap: wrap; gap: 7px; margin: 18px 0 20px;">
              <span v-for="t in p.tech" :key="t" style="font-size: 11px; padding: 4px 10px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted);">{{ t }}</span>
            </div>
            <a :href="p.url" target="_blank" rel="noopener" style="font-size: 13px; color: var(--accent); font-weight: 600;">View repository →</a>
          </article>
        </div>
        <div class="reveal" style="margin-top: 36px;">
          <NuxtLink to="/projects" class="btn-ghost">All projects</NuxtLink>
        </div>
      </div>
    </section>

    <section class="section" style="background: linear-gradient(180deg, transparent, rgba(110,231,249,0.03), transparent);">
      <div class="wrap">
        <p class="eyebrow reveal">The signal</p>
        <h2 class="section-title reveal" style="margin-top: 14px;">Built across platforms</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 20px; margin-top: 40px;">
          <div v-for="group in groupedSkills" :key="group.category" class="panel reveal" style="padding: 26px;">
            <div style="font-family: var(--display); font-size: 19px; font-weight: 700; color: var(--accent);">{{ group.category }}</div>
            <div style="display: flex; flex-wrap: wrap; gap: 7px; margin-top: 18px;">
              <span v-for="s in group.items" :key="s.name" style="font-size: 13px; color: var(--ink);">{{ s.name }}</span>
            </div>
          </div>
        </div>
        <div class="reveal" style="margin-top: 32px;"><NuxtLink to="/skills" class="btn-ghost">Full skill map</NuxtLink></div>
      </div>
    </section>

    <section class="section">
      <div class="wrap" style="position: relative;">
        <div class="orbit-line rot-b" style="position: absolute; width: 320px; height: 320px; right: -80px; top: 0; --r: 160px;"></div>
        <p class="eyebrow reveal">Open channel</p>
        <h2 class="section-title reveal" style="margin-top: 14px; max-width: 18ch;">Let's launch something together</h2>
        <p class="reveal" style="max-width: 50ch; font-size: 17px;">Open to freelance work, collaborations, and full-time roles. Send a signal.</p>
        <div class="reveal" style="margin-top: 28px;"><a :href="'mailto:' + profile.email" class="btn-primary">Send a signal →</a></div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import profile from '~/data/profile.json'
import projects from '~/data/projects.json'
import skills from '~/data/skills.json'

const groupedSkills = computed(() => {
  const map = new Map()
  for (const s of skills.skills) {
    if (!map.has(s.category)) map.set(s.category, [])
    map.get(s.category).push(s)
  }
  return [...map.entries()].map(([category, items]) => ({ category, items }))
})

useSeoMeta({
  title: 'Ringga Septia Pribadi — Multi-Platform Engineer',
  description: 'Portfolio of Ringga Septia Pribadi. Mobile, web, and desktop applications with Kotlin and Vue.',
})
</script>
