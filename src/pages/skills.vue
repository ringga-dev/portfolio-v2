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
            <NuxtLink to="/about" class="nav-link">About</NuxtLink>
            <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
            <NuxtLink to="/skills" class="nav-link active">Skills</NuxtLink>
            <NuxtLink to="/contact" class="btn-primary !py-2 !px-5 text-sm">Contact</NuxtLink>
            <button class="btn-theme" @click="toggleTheme" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">{{ isDark ? '☀️' : '🌙' }}</button>
          </div>
        </nav>
      </div>
    </header>

    <main class="pt-14 px-6 md:px-10 max-w-[1200px] mx-auto">
      <p class="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-3">What I use</p>
      <h1 class="reveal text-[48px] md:text-[72px] font-bold leading-[1.05] text-[var(--text-heading)]">Skills</h1>
      <p class="reveal mt-3 text-[18px] font-medium text-[var(--text-primary)]">Proficiency by category.</p>

      <div class="grid md:grid-cols-2 gap-6 mt-12 mb-24">
        <div v-for="cat in categories" :key="cat.name" class="reveal glass-card p-6">
          <div class="text-xs text-[var(--text-secondary)] mb-5 uppercase font-semibold">{{ cat.name }}</div>
          <div class="space-y-5">
            <div v-for="s in cat.skills" :key="s.name">
              <div class="flex justify-between items-baseline mb-1.5">
                <span class="text-[var(--text-heading)] font-medium text-[15px]">{{ s.name }}</span>
                <span class="text-sm text-[var(--text-secondary)] tabular-nums">{{ s.level }}%</span>
              </div>
              <div class="h-1.5 bg-[var(--line)] rounded-full overflow-hidden" role="progressbar" :aria-valuenow="s.level" aria-valuemin="0" aria-valuemax="100" :aria-label="s.name + ' proficiency'">
                <div class="h-full rounded-full bg-[var(--accent)]" :style="{ width: s.level + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer>
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-6 border-t border-[var(--line)]">
        <div>
          <div class="text-base font-bold text-[var(--text-heading)]">R.S.P.</div>
          <div class="text-sm text-[var(--text-secondary)] mt-1">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
        </div>
        <nav class="flex flex-wrap gap-6">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink to="/about" class="nav-link">About</NuxtLink>
          <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
          <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import LiquidGlass from '~/components/LiquidGlass.vue'
import skills from '~/data/skills.json'
import profile from '~/data/profile.json'

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

const categories = computed(() => {
  const map = {}
  for (const s of skills.skills) {
    const c = s.category || 'Other'
    if (!map[c]) map[c] = { name: c, skills: [] }
    map[c].skills.push(s)
  }
  return Object.values(map)
})
</script>