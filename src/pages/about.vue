<template>
  <main class="max-w-5xl mx-auto px-6 py-12">
    <h1 class="text-4xl mb-8 text-[hsl(var(--accent))]">About</h1>
    <div class="glass p-8 mb-8">
      <p class="text-[hsl(var(--muted))] leading-relaxed">
        I'm a multi-platform engineer specializing in Kotlin Multiplatform, Jetpack Compose, and Vue/Nuxt. I build mobile, web, and desktop applications with a focus on performance and clean architecture.
      </p>
    </div>

    <h2 class="text-2xl mb-4">Skills</h2>
    <div class="glass p-8">
      <div v-for="s in skills.skills" :key="s.name" class="mb-4">
        <div class="flex justify-between mb-1">
          <span>{{ s.name }}</span>
          <span class="text-[hsl(var(--muted))] text-sm">{{ s.level }}%</span>
        </div>
        <div class="h-2 bg-[hsl(var(--glass))] rounded-full overflow-hidden">
          <div class="h-full bg-[hsl(var(--accent))] rounded-full" :style="{ width: s.level + '%' }"></div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import skills from '~/data/skills.json'
</script>