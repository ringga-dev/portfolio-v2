<template>
  <div class="min-h-screen bg-[#0b0f14] text-[#e6eaf0]">
    <NuxtPage />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    },
    { threshold: 0.1 }
  )
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
})
</script>