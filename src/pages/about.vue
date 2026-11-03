<template>
  <main class="max-w-5xl mx-auto px-6 py-16">
    <header class="mb-12">
      <h1 class="text-4xl md:text-5xl font-semibold leading-tight mb-2">
        About <span class="text-gradient">Me</span>
      </h1>
      <p class="text-[hsl(var(--muted))] text-lg">{{ profile.title }} · {{ profile.location }}</p>
    </header>

    <section class="mb-12 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 md:p-10">
      <h2 class="text-2xl font-semibold mb-3 text-[hsl(var(--text))]">{{ profile.name }}</h2>
      <p class="text-[hsl(var(--muted))] leading-relaxed mb-4">{{ profile.bio }}</p>
      <div class="flex flex-wrap gap-4 text-sm text-[hsl(var(--muted))]">
        <a :href="`mailto:${profile.email}`" class="hover:text-[hsl(var(--accent))] transition-colors">{{ profile.email }}</a>
        <a :href="profile.github" target="_blank" rel="noopener" class="hover:text-[hsl(var(--accent))] transition-colors">GitHub</a>
        <a :href="profile.linkedin" target="_blank" rel="noopener" class="hover:text-[hsl(var(--accent))] transition-colors">LinkedIn</a>
      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl md:text-3xl font-semibold mb-6">Skills</h2>
      <div class="space-y-6">
        <div
          v-for="group in groupedSkills"
          :key="group.category"
          class="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6"
        >
          <h3 class="text-sm uppercase tracking-wide text-[hsl(var(--muted))] mb-4">{{ group.category }}</h3>
          <div class="space-y-4">
            <div v-for="s in group.items" :key="s.name">
              <div class="flex justify-between mb-1.5">
                <span class="font-medium text-[hsl(var(--text))]">{{ s.name }}</span>
                <span class="text-sm text-[hsl(var(--muted))]">{{ s.level }}%</span>
              </div>
              <div class="h-2 rounded-full bg-[hsl(var(--border))] overflow-hidden">
                <div
                  class="h-full rounded-full bg-[hsl(var(--accent))] transition-[width] duration-1000 ease-out"
                  :style="{ width: (animated[s.name] ?? 0) + '%' }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-2xl md:text-3xl font-semibold mb-6">Experience</h2>
      <ol class="relative border-l border-[hsl(var(--border))] ml-3 space-y-8">
        <li
          v-for="(e, i) in profile.experience"
          :key="i"
          class="pl-8 relative"
        >
          <span class="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full bg-[hsl(var(--accent))] ring-4 ring-[hsl(var(--bg))]" />
          <div class="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6">
            <h3 class="text-xl font-semibold text-[hsl(var(--text))]">{{ e.role }}</h3>
            <p class="text-sm text-[hsl(var(--muted))] mb-2">{{ e.company }} · {{ e.period }}</p>
            <p class="text-[hsl(var(--muted))] leading-relaxed">{{ e.description }}</p>
          </div>
        </li>
      </ol>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import profile from '~/data/profile.json'
import skills from '~/data/skills.json'

const animated = ref({})

const groupedSkills = computed(() => {
  const map = new Map()
  for (const s of skills.skills) {
    if (!map.has(s.category)) map.set(s.category, [])
    map.get(s.category).push(s)
  }
  return [...map.entries()].map(([category, items]) => ({ category, items }))
})

onMounted(() => {
  requestAnimationFrame(() => {
    const next = {}
    for (const s of skills.skills) next[s.name] = s.level
    animated.value = next
  })
})
</script>