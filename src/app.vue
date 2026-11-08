<template>
  <div class="min-h-screen">
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4" style="background: var(--bg);">
      <NuxtLink to="/" class="font-bold text-xl tracking-tight" style="font-family:'Barlow Condensed',sans-serif; color: var(--ink);">Nyawit</NuxtLink>
      <nav class="flex gap-6">
        <NuxtLink to="/" class="nav-link">Home</NuxtLink>
        <NuxtLink to="/about" class="nav-link">About</NuxtLink>
        <NuxtLink to="/projects" class="nav-link">Work</NuxtLink>
        <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
        <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
      </nav>
    </header>
    <main>
      <NuxtPage />
    </main>
    <footer class="px-4 md:px-8 py-12 text-center" style="background: var(--bg); color: var(--muted);">
      <p class="text-sm">© Nyawit · open-source satire · imagery: picsum.photos</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
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