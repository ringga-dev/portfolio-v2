<template>
  <div class="min-h-screen">
    <header class="glass-nav px-6 md:px-10 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="text-base font-bold tracking-tight text-[#ecfdf5] no-underline flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_12px_rgba(52,211,153,0.8)]"></span>
        R.S.P.
      </NuxtLink>
      <nav class="flex items-center gap-5 md:gap-7">
        <NuxtLink to="/about" class="nav-link active">About</NuxtLink>
        <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
        <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
        <NuxtLink to="/contact" class="btn-glass !py-2 !px-4 text-sm">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-14 px-6 md:px-10 max-w-[1200px] mx-auto">
      <p class="text-sm text-[#34d399] font-semibold tracking-widest uppercase mb-3">About</p>
      <h1 class="reveal text-5xl md:text-6xl font-black tracking-tight text-[#ecfdf5]">{{ profile.name }}</h1>
      <p class="reveal mt-3 text-lg text-[#9db8ab]">{{ profile.title }} · {{ profile.location }}</p>

      <div class="mt-10 grid md:grid-cols-12 gap-8">
        <div class="md:col-span-8">
          <p class="reveal text-xl leading-relaxed text-[#ecfdf5]">{{ profile.bio }}</p>
          <p class="reveal mt-5 text-base leading-relaxed text-[#9db8ab]">
            Focused on Kotlin Multiplatform and Vue since 2020, with a bias for systems that run in production. Currently building monitoring tools, POS systems, and developer tooling.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a :href="'mailto:' + profile.email" class="btn-solid">Email me</a>
            <a :href="profile.github" target="_blank" rel="noopener" class="btn-glass">GitHub</a>
            <a :href="profile.linkedin" target="_blank" rel="noopener" class="btn-glass">LinkedIn</a>
          </div>
        </div>
        <div class="md:col-span-4 space-y-4">
          <div class="reveal glass-card p-5">
            <div class="text-sm text-[#9db8ab]">Location</div>
            <div class="text-[#ecfdf5] font-medium mt-1">{{ profile.location }}</div>
          </div>
          <div class="reveal glass-card p-5">
            <div class="text-sm text-[#9db8ab]">Since</div>
            <div class="text-[#ecfdf5] font-medium mt-1">2020</div>
          </div>
          <div class="reveal glass-card p-5">
            <div class="text-sm text-[#9db8ab]">Email</div>
            <a :href="'mailto:' + profile.email" class="text-link mt-1 inline-block">{{ profile.email }}</a>
          </div>
        </div>
      </div>

      <section class="mt-20">
        <h2 class="reveal text-3xl md:text-4xl font-light tracking-tight text-[#ecfdf5] mb-8">Skills</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="group in groupedSkills" :key="group.category" class="reveal glass-card p-6">
            <div class="text-sm text-[#9db8ab] mb-4 uppercase tracking-wider">{{ group.category }}</div>
            <div class="space-y-4">
              <div v-for="s in group.items" :key="s.name">
                <div class="flex justify-between mb-1.5">
                  <span class="text-[#ecfdf5] font-medium">{{ s.name }}</span>
                  <span class="text-sm text-[#9db8ab] tabular-nums">{{ s.level }}%</span>
                </div>
                <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399]" :style="{ width: s.level + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-20 mb-24">
        <h2 class="reveal text-3xl md:text-4xl font-light tracking-tight text-[#ecfdf5] mb-8">Experience</h2>
        <div class="space-y-6">
          <div v-for="(e, i) in profile.experience" :key="i" class="reveal glass-card p-6">
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-[#ecfdf5]">{{ e.role }}</h3>
                <p class="text-sm text-[#9db8ab] mt-1">{{ e.company }}</p>
                <p class="mt-3 text-[#9db8ab] leading-relaxed">{{ e.description }}</p>
              </div>
              <div class="text-sm text-[#34d399] whitespace-nowrap">{{ e.period }}</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="border-t border-white/10">
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <div class="text-base font-bold text-[#ecfdf5]">R.S.P.</div>
          <div class="text-sm text-[#9db8ab] mt-1">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
        </div>
        <nav class="flex flex-wrap gap-6">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
          <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
          <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import profile from '~/data/profile.json'
import skills from '~/data/skills.json'

const groupedSkills = computed(() => {
  const map = new Map()
  for (const s of skills.skills) {
    if (!map.has(s.category)) map.set(s.category, [])
    map.get(s.category).push(s)
  }
  return [...map.entries()].map(([category, items]) => ({ category, items }))
})
</script>