<template>
  <main class="max-w-5xl mx-auto px-6 py-12">
    <header class="mb-10">
      <h1 class="text-4xl mb-2 text-[hsl(var(--text))]">Skills</h1>
      <p class="text-[hsl(var(--muted))]">Proficiency by category.</p>
    </header>

    <section class="glass p-8 md:p-10">
      <div v-for="(cat, ci) in categories" :key="cat.name" :class="ci > 0 ? 'mt-10 pt-10 border-t border-[hsl(var(--border))]' : ''">
        <h2 class="text-xl mb-5 text-[hsl(var(--accent))]">{{ cat.name }}</h2>
        <ul class="space-y-5">
          <li v-for="s in cat.skills" :key="s.name">
            <div class="flex items-baseline justify-between mb-2">
              <span class="font-medium text-[hsl(var(--text))]">{{ s.name }}</span>
              <span class="text-sm tabular-nums text-[hsl(var(--muted))]">{{ s.level }}%</span>
            </div>
            <div
              class="h-2 bg-[hsl(var(--surface))] rounded-full overflow-hidden"
              role="progressbar"
              :aria-valuenow="s.level"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="s.name + ' proficiency'"
            >
              <div
                class="h-full rounded-full transition-[width] duration-500"
                :style="{ width: s.level + '%', background: 'linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accent-glow)))' }"
              ></div>
            </div>
          </li>
        </ul>
      </div>
    </section>
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
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name))
})
</script>
