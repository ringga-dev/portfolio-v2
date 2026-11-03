<template>
  <main class="max-w-5xl mx-auto px-6 py-12">
    <h1 class="text-4xl mb-8 text-[hsl(var(--accent))]">Skills</h1>
    <div class="glass p-8">
      <div v-for="s in skills.skills" :key="s.name" class="mb-6">
        <div class="flex justify-between mb-2">
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
</script>