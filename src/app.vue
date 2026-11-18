<template>
  <div class="min-h-screen">
    <header class="site-nav" style="padding-top: max(0px, env(safe-area-inset-top))">
      <div class="wrap">
        <NuxtLink to="/" class="brand">
          <span class="brand-dot" aria-hidden="true"></span>
          <span>RINGGA<span style="color: var(--accent)">.SPACE</span></span>
        </NuxtLink>
        <span class="planet-now" aria-hidden="true">{{ activePlanet }}</span>
        <nav class="nav-links" aria-label="Main">
          <NuxtLink to="/" class="nav-link" :class="{ active: isActive('/') }">Home</NuxtLink>
          <NuxtLink to="/about" class="nav-link" :class="{ active: isActive('/about') }">About</NuxtLink>
          <NuxtLink to="/projects" class="nav-link" :class="{ active: isActive('/projects') }">Work</NuxtLink>
          <NuxtLink to="/skills" class="nav-link" :class="{ active: isActive('/skills') }">Skills</NuxtLink>
          <NuxtLink to="/tata-surya" class="nav-link" :class="{ active: isActive('/tata-surya') }">Tata Surya</NuxtLink>
          <NuxtLink to="/siber" class="nav-link" :class="{ active: isActive('/siber') }">Siber</NuxtLink>
          <NuxtLink to="/contact" class="btn-primary" style="padding: 9px 18px; font-size: 13px;">Contact</NuxtLink>
        </nav>
      </div>
    </header>

    <main>
      <NuxtPage />
    </main>

    <footer class="site-footer">
      <div class="wrap" style="padding-block: clamp(40px, 7vw, 72px) 32px;">
        <a :href="'mailto:' + profile.email" class="big-name" style="display: block; text-decoration: none;">RINGGA.</a>
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 24px; margin-top: 32px;">
          <div>
            <p style="color: var(--muted); font-size: 14px; margin: 0;">{{ profile.title }} · {{ profile.location }}</p>
            <p style="color: var(--faint); font-size: 13px; margin: 6px 0 0;">© {{ year }} {{ profile.name }}. Built in orbit.</p>
            <p style="color: var(--faint); font-size: 12px; margin: 10px 0 0;">Imagery: NASA/JPL-Caltech, Eyes on the Solar System</p>
          </div>
          <nav class="nav-links" aria-label="Footer">
            <a :href="profile.github" target="_blank" rel="noopener">GitHub</a>
            <a :href="profile.linkedin" target="_blank" rel="noopener">LinkedIn</a>
            <a :href="'mailto:' + profile.email">Email</a>
          </nav>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import profile from '~/data/profile.json'

const route = useRoute()
const year = computed(() => new Date().getFullYear())
const isActive = (path) => route.path === path || (path !== '/' && route.path.startsWith(path))

const planetByPath = {
  '/': 'BUMI',
  '/about': 'MARS',
  '/projects': 'JUPITER',
  '/skills': 'SATURNUS',
  '/contact': 'NEPTUNUS',
}
const activePlanet = computed(() => planetByPath[route.path] ?? 'BUMI')

let observer
async function observeReveals() {
  await nextTick()
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
    { threshold: 0.08 }
  )
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
}
onMounted(observeReveals)
watch(() => route.path, observeReveals)
</script>
