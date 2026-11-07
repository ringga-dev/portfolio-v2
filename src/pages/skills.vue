<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-50 px-4 md:px-8 border-b border-[var(--line)] bg-[var(--surface-base)]" style="padding-top: max(0px, env(safe-area-inset-top))">
      <nav class="flex items-center justify-between py-3.5 max-w-[1200px] mx-auto">
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
    </header>

    <main class="pt-14 px-6 md:px-10 max-w-[1200px] mx-auto">
      <p class="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-3">What I use</p>
      <h1 class="reveal font-bold leading-[1.05] text-[clamp(48px,6vw,88px)] text-[var(--text-heading)]">Skills</h1>
      <p class="reveal mt-3 text-[18px] font-medium text-[var(--text-primary)]">Proficiency by category.</p>

      <div class="grid md:grid-cols-2 gap-6 mt-12 mb-24">
        <div v-for="cat in categories" :key="cat.name" class="reveal card p-6">
          <div class="text-xs uppercase font-semibold mb-5" style="color: var(--text-on-dark-muted)">{{ cat.name }}</div>
          <div class="space-y-5">
            <div v-for="s in cat.skills" :key="s.name">
              <div class="flex justify-between items-baseline mb-1.5">
                <span class="font-medium text-[15px]" style="color: var(--text-on-dark)">{{ s.name }}</span>
                <span class="text-sm tabular-nums" style="color: var(--text-on-dark-muted)">{{ s.level }}%</span>
              </div>
              <div class="bar-track" role="progressbar" :aria-valuenow="s.level" aria-valuemin="0" aria-valuemax="100" :aria-label="s.name + ' proficiency'">
                <div class="bar-fill" :style="{ width: s.level + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer style="background: var(--surface-overlay)">
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div class="text-base font-bold" style="color: var(--surface-base)">R.S.P.</div>
          <div class="text-sm mt-1" style="color: var(--text-on-dark-muted)">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
        </div>
        <nav class="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-3">
          <NuxtLink to="/" class="text-sm" style="color: var(--text-on-dark-muted)">Home</NuxtLink>
          <NuxtLink to="/about" class="text-sm" style="color: var(--text-on-dark-muted)">About</NuxtLink>
          <NuxtLink to="/projects" class="text-sm" style="color: var(--text-on-dark-muted)">Projects</NuxtLink>
          <NuxtLink to="/contact" class="text-sm" style="color: var(--text-on-dark-muted)">Contact</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import skills from '~/data/skills.json'
import profile from '~/data/profile.json'

const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
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