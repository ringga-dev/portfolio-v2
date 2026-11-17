<template>
  <div>
    <section style="position: relative; min-height: 56dvh; display: flex; align-items: center; overflow: hidden;">
      <SpaceScene variant="orbital" style="position: absolute; inset: 0; z-index: 0; opacity: 0.85;" />
      <div class="wrap" style="position: relative; z-index: 1; padding-block: 96px 56px;">
        <p class="eyebrow rise-in">Signal map</p>
        <h1 class="rise-in" style="font-size: clamp(52px, 10vw, 128px); margin-top: 16px;">Skills</h1>
        <p class="rise-in" style="font-size: clamp(17px, 2vw, 21px); color: var(--ink); max-width: 52ch; margin-top: 20px;">Proficiency by orbital band — mobile, web, backend, and DevOps.</p>
      </div>
    </section>

    <section class="section" style="padding-top: 24px;">
      <div class="wrap">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
          <div v-for="cat in categories" :key="cat.name" class="panel reveal" style="padding: 30px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="width: 9px; height: 9px; border-radius: 50%; background: var(--accent); box-shadow: var(--glow);"></span>
              <h2 style="font-size: 22px; margin: 0;">{{ cat.name }}</h2>
            </div>
            <div style="margin-top: 26px;">
              <div v-for="s in cat.skills" :key="s.name" style="margin-bottom: 22px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-size: 15px; color: var(--ink);">{{ s.name }}</span>
                  <span style="font-family: var(--display); font-size: 14px; color: var(--accent);">{{ s.level }}%</span>
                </div>
                <div class="bar-track" role="progressbar" :aria-valuenow="s.level" aria-valuemin="0" aria-valuemax="100" :aria-label="s.name + ' proficiency'">
                  <div class="bar-fill" :style="{ width: s.level + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import skills from '~/data/skills.json'

const categories = computed(() => {
  const map = new Map()
  for (const s of skills.skills) {
    if (!map.has(s.category)) map.set(s.category, [])
    map.get(s.category).push(s)
  }
  return [...map.entries()].map(([name, skills]) => ({ name, skills }))
})

useSeoMeta({
  title: 'Skills — Ringga Septia Pribadi',
  description: 'Skill map of Ringga Septia Pribadi: Kotlin, Compose, KMP, Vue/Nuxt, TypeScript, Rust, Axum, Docker, and GitHub Actions.',
})
</script>
