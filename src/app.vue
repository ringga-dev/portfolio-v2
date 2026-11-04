<template>
  <div class="min-h-screen">
    <NuxtPage />
  </div>
</template>

<script setup>
import { onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

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
  watchEffect(() => {
    route.path
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
  })
})
</script>