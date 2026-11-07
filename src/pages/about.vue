<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-50 px-4 md:px-8 border-b border-[var(--line)] bg-[var(--surface-base)]" style="padding-top: max(0px, env(safe-area-inset-top))">
      <nav class="flex items-center justify-between py-3.5 max-w-[1200px] mx-auto">
        <NuxtLink to="/" class="text-base font-bold text-[var(--text-heading)] no-underline flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[var(--accent)]"></span>
          R.S.P.
        </NuxtLink>
        <div class="flex items-center gap-5 md:gap-7">
          <NuxtLink to="/about" class="nav-link active">About</NuxtLink>
          <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
          <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
          <NuxtLink to="/contact" class="btn-primary !py-2 !px-5 text-sm">Contact</NuxtLink>
          <button class="btn-theme" @click="toggleTheme" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">{{ isDark ? '☀️' : '🌙' }}</button>
        </div>
      </nav>
    </header>

    <main class="pt-14 px-6 md:px-10 max-w-[1200px] mx-auto">
      <p class="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-3">About</p>
      <h1 class="reveal font-bold leading-[1.05] text-[clamp(48px,6vw,88px)] text-[var(--text-heading)]">{{ profile.name }}</h1>
      <p class="reveal mt-3 text-[18px] font-medium text-[var(--text-primary)]">{{ profile.title }} · {{ profile.location }}</p>

      <div class="mt-10 grid md:grid-cols-12 gap-8">
        <div class="md:col-span-8">
          <p class="reveal text-[20px] leading-relaxed text-[var(--text-heading)] font-medium">{{ profile.bio }}</p>
          <p class="reveal mt-5 text-[15px] leading-relaxed text-[var(--text-secondary)]">
            Focused on Kotlin Multiplatform and Vue since 2020, with a bias for systems that run in production. Currently building monitoring tools, POS systems, and developer tooling.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a :href="'mailto:' + profile.email" class="btn-primary">Email me</a>
            <a :href="profile.github" target="_blank" rel="noopener" class="btn-ghost">GitHub</a>
            <a :href="profile.linkedin" target="_blank" rel="noopener" class="btn-ghost">LinkedIn</a>
          </div>
        </div>
        <div class="md:col-span-4 space-y-4">
          <div class="reveal card p-5">
            <div class="text-xs text-[var(--text-on-dark-muted)]">Location</div>
            <div class="font-medium text-[15px] mt-1">{{ profile.location }}</div>
          </div>
          <div class="reveal card p-5">
            <div class="text-xs text-[var(--text-on-dark-muted)]">Since</div>
            <div class="font-medium text-[15px] mt-1">2020</div>
          </div>
          <div class="reveal card p-5">
            <div class="text-xs text-[var(--text-on-dark-muted)]">Email</div>
            <a :href="'mailto:' + profile.email" class="text-link text-[15px] mt-1 inline-block">{{ profile.email }}</a>
          </div>
        </div>
      </div>

      <section class="mt-20">
        <h2 class="reveal text-[28px] font-bold text-[var(--text-heading)] mb-8">Skills</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="group in groupedSkills" :key="group.category" class="reveal card p-6">
            <div class="text-xs uppercase font-semibold mb-4" style="color: var(--text-on-dark-muted)">{{ group.category }}</div>
            <div class="space-y-4">
              <div v-for="s in group.items" :key="s.name">
                <div class="flex justify-between mb-1.5">
                  <span class="font-medium text-[15px]" style="color: var(--text-on-dark)">{{ s.name }}</span>
                  <span class="text-sm tabular-nums" style="color: var(--text-on-dark-muted)">{{ s.level }}%</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: s.level + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-20 mb-24">
        <h2 class="reveal text-[28px] font-bold text-[var(--text-heading)] mb-8">Experience</h2>
        <div class="space-y-6">
          <div v-for="(e, i) in profile.experience" :key="i" class="reveal card p-6">
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div class="flex-1">
                <h3 class="text-[18px] font-bold">{{ e.role }}</h3>
                <p class="text-sm mt-1" style="color: var(--text-on-dark-muted)">{{ e.company }}</p>
                <p class="mt-3 text-[15px] leading-relaxed" style="color: var(--text-on-dark-muted)">{{ e.description }}</p>
              </div>
              <div class="text-sm font-semibold text-[var(--accent)] whitespace-nowrap">{{ e.period }}</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer style="background: var(--surface-overlay)">
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div class="text-base font-bold" style="color: var(--surface-base)">R.S.P.</div>
          <div class="text-sm mt-1" style="color: var(--text-on-dark-muted)">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
        </div>
        <nav class="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-3">
          <NuxtLink to="/" class="text-sm" style="color: var(--text-on-dark-muted)">Home</NuxtLink>
          <NuxtLink to="/projects" class="text-sm" style="color: var(--text-on-dark-muted)">Projects</NuxtLink>
          <NuxtLink to="/skills" class="text-sm" style="color: var(--text-on-dark-muted)">Skills</NuxtLink>
          <NuxtLink to="/contact" class="text-sm" style="color: var(--text-on-dark-muted)">Contact</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import profile from '~/data/profile.json'
import skills from '~/data/skills.json'

const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
})

const groupedSkills = computed(() => {
  const map = new Map()
  for (const s of skills.skills) {
    if (!map.has(s.category)) map.set(s.category, [])
    map.get(s.category).push(s)
  }
  return [...map.entries()].map(([category, items]) => ({ category, items }))
})
</script>