<template>
  <main class="max-w-5xl mx-auto px-6 py-12">
    <h1 class="text-4xl mb-8 text-[hsl(var(--accent))]">Projects</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="p in projects.projects" :key="p.slug" class="glass p-6 hover:glow transition">
        <h3 class="text-xl mb-2 text-[hsl(var(--accent))]">{{ p.title }}</h3>
        <p class="text-[hsl(var(--muted))] mb-4 text-sm">{{ p.description }}</p>
        <div class="flex flex-wrap gap-2 mb-4">
          <span v-for="t in p.tech" :key="t" class="text-xs px-2 py-1 glass rounded">{{ t }}</span>
        </div>
        <a :href="p.url" class="text-[hsl(var(--accent))] text-sm hover:underline">View on GitHub →</a>
      </div>
    </div>
  </main>
</template>

<script setup>
import projects from '~/data/projects.json'
</script>