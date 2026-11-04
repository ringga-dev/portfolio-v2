<template>
  <div class="min-h-screen">
    <!-- Liquid Glass: SVG refraction filter — warps backdrop like real liquid glass -->
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <filter id="liquid" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.022" numOctaves="2" seed="5" result="noise">
            <animate attributeName="baseFrequency" values="0.015 0.022;0.017 0.025;0.015 0.022" dur="16s" repeatCount="indefinite"/>
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
    </svg>
    <NuxtPage />
  </div>
</template>

<script setup>
import { onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
let observer

// Theme: light default, dark via toggle, persisted
function applyTheme() {
  const saved = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'))
}

async function observeReveals() {
  await nextTick()
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
    { threshold: 0.08 }
  )
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
}

onMounted(() => {
  applyTheme()
  observeReveals()
})
watch(() => route.path, observeReveals)
</script>