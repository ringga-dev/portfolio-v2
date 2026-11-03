<template>
  <main class="max-w-5xl mx-auto px-6 py-12">
    <h1 class="text-4xl mb-8 text-[hsl(var(--accent))]">About</h1>

    <div class="glass p-8 mb-8">
      <h2 class="text-2xl mb-3 text-[hsl(var(--accent))]">{{ profile.name }}</h2>
      <p class="text-[hsl(var(--muted))] mb-4">{{ profile.title }} · {{ profile.location }}</p>
      <p class="text-[hsl(var(--muted))] leading-relaxed">{{ profile.bio }}</p>
    </div>

    <h2 class="text-2xl mb-4">Skills</h2>
    <div class="glass p-8 mb-8">
      <div v-for="s in skills.skills" :key="s.name" class="mb-4">
        <div class="flex justify-between mb-1">
          <span>{{ s.name }}</span>
          <span class="text-[hsl(var(--muted))] text-sm">{{ s.level }}%</span>
        </div>
        <div class="h-2 bg-[hsl(var(--glass))] rounded-full overflow-hidden">
          <div class="h-full bg-[hsl(var(--accent))] rounded-full transition-all" :style="{ width: s.level + '%' }"></div>
        </div>
      </div>
    </div>

    <h2 class="text-2xl mb-4">Experience</h2>
    <div class="glass p-8">
      <div v-for="(e, i) in profile.experience" :key="i" class="relative pl-6 pb-8 last:pb-0 border-l border-[hsl(var(--glass-border))]">
        <span class="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-[hsl(var(--accent))]"></span>
        <h3 class="text-xl text-[hsl(var(--accent))]">{{ e.role }}</h3>
        <p class="text-sm text-[hsl(var(--muted))] mb-1">{{ e.company }} · {{ e.period }}</p>
        <p class="text-[hsl(var(--muted))] leading-relaxed">{{ e.description }}</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import profile from '~/data/profile.json'
import skills from '~/data/skills.json'
</script>
