<template>
  <div class="min-h-screen">
    <!-- Floating glass navbar -->
    <header class="fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50 glass rounded-2xl px-5 py-3 flex items-center justify-between">
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

    <main class="pt-32 px-6 md:px-10 max-w-[1400px] mx-auto">
      <header class="mb-16">
        <h1 class="reveal text-[clamp(56px,10vw,140px)] font-black tracking-[-0.04em] leading-[0.85] text-[#ecfdf5]">
          About
        </h1>
        <p class="reveal mt-6 text-lg text-[#a7c4b5] max-w-2xl">
          {{ profile.title }} · {{ profile.location }}
        </p>
      </header>

      <!-- Bio -->
      <section class="mb-20">
        <div class="max-w-3xl">
          <img
            src="https://picsum.photos/id/1015/400/400"
            alt="Portrait"
            class="float-left w-[100px] h-[100px] md:w-[120px] md:h-[120px] object-cover rounded-2xl mr-5 mb-3 glass"
          />
          <p class="reveal text-[clamp(22px,2.5vw,34px)] leading-[1.2] text-[#ecfdf5]">
            {{ profile.name }} builds software that ships. {{ profile.bio }}
          </p>
          <p class="reveal mt-6 text-[clamp(18px,2vw,24px)] leading-[1.3] text-[#a7c4b5]">
            Focused on Kotlin Multiplatform and Vue since 2020.
          </p>
        </div>
        <div class="clear-both mt-10 flex flex-wrap gap-4">
          <a :href="'mailto:' + profile.email" class="btn-glass">Email</a>
          <a :href="profile.github" target="_blank" rel="noopener" class="btn-glass">GitHub</a>
          <a :href="profile.linkedin" target="_blank" rel="noopener" class="btn-glass">LinkedIn</a>
        </div>
      </section>

      <!-- Skills in glass cards -->
      <section class="mb-20">
        <h2 class="reveal text-[clamp(32px,4vw,56px)] font-light tracking-tight leading-[0.98] text-[#ecfdf5] mb-12">
          Skills
        </h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div
            v-for="group in groupedSkills"
            :key="group.category"
            class="reveal glass-card p-6"
          >
            <div class="text-sm text-[#a7c4b5] mb-4 uppercase tracking-wider">{{ group.category }}</div>
            <div class="space-y-4">
              <div v-for="s in group.items" :key="s.name">
                <div class="flex justify-between mb-2">
                  <span class="text-[#ecfdf5] font-medium">{{ s.name }}</span>
                  <span class="text-[#a7c4b5] text-sm tabular-nums">{{ s.level }}%</span>
                </div>
                <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399] transition-[width] duration-500"
                    :style="{ width: s.level + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Experience -->
      <section class="mb-24">
        <h2 class="reveal text-[clamp(32px,4vw,56px)] font-light tracking-tight leading-[0.98] text-[#ecfdf5] mb-12">
          Experience
        </h2>
        <div class="space-y-6">
          <div
            v-for="(e, i) in profile.experience"
            :key="i"
            class="reveal glass-card p-6"
          >
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-[#ecfdf5]">{{ e.role }}</h3>
                <p class="text-sm text-[#a7c4b5] mt-1">{{ e.company }}</p>
                <p class="mt-3 text-[#a7c4b5] leading-relaxed">{{ e.description }}</p>
              </div>
              <div class="text-sm text-[#34d399] whitespace-nowrap">{{ e.period }}</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-[#ecfdf5] text-[#0a0f0d] min-h-[100svh] flex flex-col justify-between p-6 md:p-10 overflow-hidden">
      <div class="grid md:grid-cols-12 gap-8 max-w-[1400px] mx-auto w-full pt-10">
        <div class="md:col-span-7">
          <h3 class="text-[clamp(32px,5vw,72px)] font-light tracking-tight leading-[0.95] text-[#0a0f0d]">
            Let's work<br/>together.
          </h3>
          <a :href="'mailto:' + profile.email" class="btn-solid mt-6">Start a project</a>
        </div>
        <div class="md:col-span-3 space-y-3">
          <NuxtLink to="/" class="block text-[16px] text-[#0a0f0d] no-underline">Home</NuxtLink>
          <NuxtLink to="/projects" class="block text-[16px] text-[#0a0f0d] no-underline">Projects</NuxtLink>
          <NuxtLink to="/skills" class="block text-[16px] text-[#0a0f0d] no-underline">Skills</NuxtLink>
          <NuxtLink to="/contact" class="block text-[16px] text-[#0a0f0d] no-underline">Contact</NuxtLink>
        </div>
        <div class="md:col-span-2">
          <div class="text-[13px] text-[#0a0f0d]/60">© {{ new Date().getFullYear() }}</div>
        </div>
      </div>
      <div class="mt-24 max-w-[1400px] mx-auto w-full">
        <div class="text-center font-black tracking-[-0.04em] leading-[0.82] text-[clamp(72px,26vw,400px)] text-[#0a0f0d] whitespace-nowrap" style="transform: translateY(30%)">
          RINGGA
        </div>
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