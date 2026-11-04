<template>
  <div class="min-h-screen">
    <header class="glass-nav px-6 py-3.5 flex items-center justify-between">
      <NuxtLink to="/" class="text-base font-extrabold tracking-tight text-[#1a2420] no-underline flex items-center gap-2.5">
        <span class="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.6)]"></span>
        R.S.P.
      </NuxtLink>
      <nav class="flex items-center gap-5 md:gap-7">
        <NuxtLink to="/about" class="nav-link">About</NuxtLink>
        <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
        <NuxtLink to="/skills" class="nav-link active">Skills</NuxtLink>
        <NuxtLink to="/contact" class="btn-jelly !py-2 !px-5 text-sm">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-14 px-6 md:px-10 max-w-[1200px] mx-auto">
      <p class="text-sm text-[#047857] font-bold tracking-widest uppercase mb-3">What I use</p>
      <h1 class="reveal text-5xl md:text-6xl font-black tracking-tight text-[#1a2420]">Skills</h1>
      <p class="reveal mt-3 text-lg text-[#6b7d73]">Proficiency by category.</p>

      <div class="grid md:grid-cols-2 gap-6 mt-12 mb-24">
        <div v-for="cat in categories" :key="cat.name" class="reveal glass-card p-6">
          <div class="text-sm text-[#6b7d73] mb-5 uppercase tracking-wider font-semibold">{{ cat.name }}</div>
          <div class="space-y-5">
            <div v-for="s in cat.skills" :key="s.name">
              <div class="flex justify-between items-baseline mb-1.5">
                <span class="text-[#1a2420] font-semibold">{{ s.name }}</span>
                <span class="text-sm text-[#6b7d73] tabular-nums">{{ s.level }}%</span>
              </div>
              <div class="h-2 bg-[#1a2420]/10 rounded-full overflow-hidden" role="progressbar" :aria-valuenow="s.level" aria-valuemin="0" aria-valuemax="100" :aria-label="s.name + ' proficiency'">
                <div class="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399]" :style="{ width: s.level + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer>
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-6 border-t border-[#1a2420]/10">
        <div>
          <div class="text-base font-extrabold text-[#1a2420]">R.S.P.</div>
          <div class="text-sm text-[#6b7d73] mt-1">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
        </div>
        <nav class="flex flex-wrap gap-6">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink to="/about" class="nav-link">About</NuxtLink>
          <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
          <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import skills from '~/data/skills.json'
import profile from '~/data/profile.json'
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