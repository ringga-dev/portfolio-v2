<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-50 px-4 md:px-8 py-2" style="padding-top: max(8px, env(safe-area-inset-top))">
      <div class="relative">
        <LiquidGlass :width="navWidth" :height="64" :shape-width="navWidth" :shape-height="64" :shape-radius="32" :shape-roundness="5" />
        <nav class="absolute inset-0 flex items-center justify-between px-6">
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
      </div>
    </header>

    <main class="pt-14 px-6 md:px-10 max-w-[1200px] mx-auto">
      <p class="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-3">About</p>
      <h1 class="reveal text-[48px] md:text-[72px] font-bold leading-[1.05] text-[var(--text-heading)]">{{ profile.name }}</h1>
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
          <div class="reveal glass-card p-5">
            <div class="text-xs text-[var(--text-secondary)]">Location</div>
            <div class="text-[var(--text-heading)] font-medium text-[15px] mt-1">{{ profile.location }}</div>
          </div>
          <div class="reveal glass-card p-5">
            <div class="text-xs text-[var(--text-secondary)]">Since</div>
            <div class="text-[var(--text-heading)] font-medium text-[15px] mt-1">2020</div>
          </div>
          <div class="reveal glass-card p-5">
            <div class="text-xs text-[var(--text-secondary)]">Email</div>
            <a :href="'mailto:' + profile.email" class="text-link text-[15px] mt-1 inline-block">{{ profile.email }}</a>
          </div>
        </div>
      </div>

      <section class="mt-20">
        <h2 class="reveal text-[28px] font-bold text-[var(--text-heading)] mb-8">Skills</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="group in groupedSkills" :key="group.category" class="reveal glass-card p-6">
            <div class="text-xs text-[var(--text-secondary)] mb-4 uppercase font-semibold">{{ group.category }}</div>
            <div class="space-y-4">
              <div v-for="s in group.items" :key="s.name">
                <div class="flex justify-between mb-1.5">
                  <span class="text-[var(--text-heading)] font-medium text-[15px]">{{ s.name }}</span>
                  <span class="text-sm text-[var(--text-secondary)] tabular-nums">{{ s.level }}%</span>
                </div>
                <div class="h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-[var(--accent)]" :style="{ width: s.level + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-20 mb-24">
        <h2 class="reveal text-[28px] font-bold text-[var(--text-heading)] mb-8">Experience</h2>
        <div class="space-y-6">
          <div v-for="(e, i) in profile.experience" :key="i" class="reveal glass-card p-6">
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div class="flex-1">
                <h3 class="text-[18px] font-bold text-[var(--text-heading)]">{{ e.role }}</h3>
                <p class="text-sm text-[var(--text-secondary)] mt-1">{{ e.company }}</p>
                <p class="mt-3 text-[15px] text-[var(--text-secondary)] leading-relaxed">{{ e.description }}</p>
              </div>
              <div class="text-sm font-semibold text-[var(--accent-deep)] whitespace-nowrap">{{ e.period }}</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-6 border-t border-[var(--line)]">
        <div>
          <div class="text-base font-bold text-[var(--text-heading)]">R.S.P.</div>
          <div class="text-sm text-[var(--text-secondary)] mt-1">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
        </div>
        <nav class="flex flex-wrap gap-6">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
          <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
          <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import LiquidGlass from '~/components/LiquidGlass.vue'
import profile from '~/data/profile.json'
import skills from '~/data/skills.json'

const isDark = ref(false)
const navWidth = ref(typeof window !== 'undefined' ? window.innerWidth - 32 : 1200)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
  const update = () => { navWidth.value = window.innerWidth - 32 }
  update()
  window.addEventListener('resize', update)
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