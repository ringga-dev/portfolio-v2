<template>
  <main class="max-w-5xl mx-auto px-6 py-12">
    <section class="glass p-8 mb-8 glow">
      <h1 class="text-5xl mb-2">Ringga Dev</h1>
      <p class="text-xl text-[hsl(var(--muted))] mb-6">Multi-Platform Engineer</p>
      <p class="text-[hsl(var(--muted))] mb-6 max-w-2xl">
        I build mobile, web, and desktop applications with Kotlin and Vue. Specialized in Kotlin Multiplatform, Jetpack Compose, and system-level integrations.
      </p>
      <div class="flex gap-4">
        <a href="https://github.com/ringga-dev" class="btn-primary">GitHub</a>
        <NuxtLink to="/contact" class="btn-secondary">Contact</NuxtLink>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="text-2xl mb-4">Featured Projects</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="p in projects.projects.slice(0, 2)" :key="p.slug" class="glass p-6 hover:glow transition">
          <h3 class="text-xl mb-2 text-[hsl(var(--accent))]">{{ p.title }}</h3>
          <p class="text-[hsl(var(--muted))] mb-4 text-sm">{{ p.description }}</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="t in p.tech" :key="t" class="text-xs px-2 py-1 glass rounded">{{ t }}</span>
          </div>
          <a :href="p.url" class="text-[hsl(var(--accent))] text-sm hover:underline">View →</a>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import projects from '~/data/projects.json'
</script>