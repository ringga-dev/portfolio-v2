<template>
  <main class="max-w-5xl mx-auto px-6 py-12">
    <h1 class="text-4xl mb-8 text-[hsl(var(--accent))]">Skills</h1>
    <div v-for="cat in categories" :key="cat.name" class="glass p-8 mb-6">
      <h2 class="text-2xl mb-4 text-[hsl(var(--accent))]">{{ cat.name }}</h2>
      <div v-for="s in cat.skills" :key="s.name" class="mb-4 last:mb-0">
        <div class="flex justify-between mb-1">
          <span class="font-medium">{{ s.name }}</span>
          <span class="text-[hsl(var(--muted))] text-sm">{{ s.level }}%</span>
        </div>
        <div class="h-3 bg-[hsl(var(--glass))] rounded-full overflow-hidden">
          <div class="h-full bg-[hsl(var(--accent))] rounded-full transition-all" :style="{ width: s.level + '%' }"></div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import skills from '~/data/skills.json'
import { computed } from 'vue'

const categories = computed(() => {
  const map = {}
  for (const s of skills.skills) {
    const c = s.category || 'Other'
    if (!map[c]) map[c] = { name: c, skills: [] }
    map[c].skills.push(s)
  }
  return Object.values(map)
})
</script>
