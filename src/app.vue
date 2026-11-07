<template>
  <div class="min-h-screen">
    <NuxtPage />
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