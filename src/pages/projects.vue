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
          <NuxtLink to="/projects" class="nav-link active">Projects</NuxtLink>
          <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
          <NuxtLink to="/contact" class="btn-primary !py-2 !px-5 text-sm">Contact</NuxtLink>
          <button class="btn-theme" @click="toggleTheme" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">{{ isDark ? '☀️' : '🌙' }}</button>
        </div>
      </nav>
    </header>

    <main class="pt-14 px-6 md:px-10 max-w-[1200px] mx-auto">
      <p class="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-3">Portfolio</p>
      <h1 class="reveal font-bold leading-[1.05] text-[clamp(48px,6vw,88px)] text-[var(--text-heading)]">Projects</h1>
      <p class="reveal mt-3 text-[18px] font-medium text-[var(--text-primary)]">Selected work and open-source contributions.</p>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 mb-24">
        <article v-for="p in projects.projects" :key="p.slug" class="reveal card overflow-hidden">
          <div class="tile h-[220px]">
            <img :src="`https://picsum.photos/seed/${p.slug}/900/600`" :alt="p.title" loading="lazy" />
          </div>
          <div class="p-6">
            <h2 class="text-[18px] font-bold mb-2">{{ p.title }}</h2>
            <p class="text-sm leading-relaxed mb-4">{{ p.description }}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="t in p.tech" :key="t" class="tag">{{ t }}</span>
            </div>
            <a :href="p.url" target="_blank" rel="noopener" class="text-link text-sm">View on GitHub</a>
          </div>
        </article>
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
          <NuxtLink to="/skills" class="text-sm" style="color: var(--text-on-dark-muted)">Skills</NuxtLink>
          <NuxtLink to="/contact" class="text-sm" style="color: var(--text-on-dark-muted)">Contact</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import projects from '~/data/projects.json'
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
</script>