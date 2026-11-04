<template>
  <div class="min-h-screen">
    <header class="px-4 md:px-8 pt-4">
      <div class="relative">
        <LiquidGlass :width="navWidth" :height="64" :shape-width="navWidth" :shape-height="64" :shape-radius="32" :shape-roundness="5" />
        <nav class="absolute inset-0 flex items-center justify-between px-6">
          <NuxtLink to="/" class="text-base font-extrabold tracking-tight text-[var(--ink)] no-underline flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_12px_rgba(16,185,129,0.6)]"></span>
            R.S.P.
          </NuxtLink>
          <div class="flex items-center gap-5 md:gap-7">
            <NuxtLink to="/about" class="nav-link">About</NuxtLink>
            <NuxtLink to="/projects" class="nav-link active">Projects</NuxtLink>
            <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
            <NuxtLink to="/contact" class="btn-jelly !py-2 !px-5 text-sm">Contact</NuxtLink>
            <button class="btn-theme" @click="toggleTheme" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">{{ isDark ? '☀️' : '🌙' }}</button>
          </div>
        </nav>
      </div>
    </header>

    <main class="pt-14 px-6 md:px-10 max-w-[1200px] mx-auto">
      <p class="text-sm text-[var(--accent-deep)] font-bold tracking-widest uppercase mb-3">Portfolio</p>
      <h1 class="reveal text-5xl md:text-6xl font-black tracking-tight text-[var(--ink)]">Projects</h1>
      <p class="reveal mt-3 text-lg text-[var(--muted)]">Selected work and open-source contributions.</p>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 mb-24">
        <article v-for="p in projects.projects" :key="p.slug" class="reveal glass-card overflow-hidden">
          <div class="tile h-[220px]">
            <img :src="`https://picsum.photos/seed/${p.slug}/900/600`" :alt="p.title" loading="lazy" />
          </div>
          <div class="p-6">
            <h2 class="text-xl font-bold text-[var(--ink)] mb-2">{{ p.title }}</h2>
            <p class="text-sm text-[var(--muted)] leading-relaxed mb-4">{{ p.description }}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="t in p.tech" :key="t" class="text-xs px-3 py-1.5 rounded-full bg-white/50 border border-white/70 text-[var(--ink-soft)] font-medium">{{ t }}</span>
            </div>
            <a :href="p.url" target="_blank" rel="noopener" class="text-link text-sm">View on GitHub</a>
          </div>
        </article>
      </div>
    </main>

    <footer>
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-6 border-t border-[var(--line)]">
        <div>
          <div class="text-base font-extrabold text-[var(--ink)]">R.S.P.</div>
          <div class="text-sm text-[var(--muted)] mt-1">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
        </div>
        <nav class="flex flex-wrap gap-6">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink to="/about" class="nav-link">About</NuxtLink>
          <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
          <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LiquidGlass from '~/components/LiquidGlass.vue'
import projects from '~/data/projects.json'
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
</script>