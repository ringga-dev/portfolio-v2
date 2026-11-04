<template>
  <div class="min-h-screen bg-[#0b0f14] text-[#e6eaf0]">
    <!-- Top bar -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[#0b0f14]/90 backdrop-blur-sm">
      <NuxtLink to="/" class="text-base font-bold tracking-tight text-[#e6eaf0] no-underline">R.S.P.</NuxtLink>
      <nav class="flex items-center gap-6 md:gap-8">
        <NuxtLink to="/about" class="text-sm text-[#10b981] font-semibold no-underline">About</NuxtLink>
        <NuxtLink to="/projects" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">Projects</NuxtLink>
        <NuxtLink to="/skills" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">Skills</NuxtLink>
        <NuxtLink to="/contact" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-28 px-6 md:px-10 max-w-[1400px] mx-auto">
      <header class="mb-16">
        <h1 class="reveal text-[clamp(56px,10vw,140px)] font-black tracking-[-0.04em] leading-[0.85] text-[#e6eaf0]">
          About
        </h1>
        <p class="reveal mt-6 text-lg text-[#8a93a3] max-w-2xl">
          {{ profile.title }} · {{ profile.location }}
        </p>
      </header>

      <!-- Bio -->
      <section class="mb-20">
        <div class="reveal max-w-3xl">
          <img
            src="https://picsum.photos/id/279/400/400"
            alt="Portrait"
            class="float-left w-[100px] h-[100px] md:w-[120px] md:h-[120px] object-cover mr-4 mb-2"
          />
          <p class="text-[clamp(22px,2.5vw,34px)] leading-[1.2] text-[#e6eaf0]">
            {{ profile.name }} builds software that ships. {{ profile.bio }}
          </p>
        </div>
        <div class="clear-both mt-8 flex flex-wrap gap-4">
          <a :href="'mailto:' + profile.email" class="text-link">{{ profile.email }}</a>
          <a :href="profile.github" target="_blank" rel="noopener" class="text-link">GitHub</a>
          <a :href="profile.linkedin" target="_blank" rel="noopener" class="text-link">LinkedIn</a>
        </div>
      </section>

      <!-- Skills -->
      <section class="mb-20">
        <h2 class="reveal text-[clamp(32px,4vw,56px)] font-light tracking-tight leading-[0.98] text-[#e6eaf0] mb-12">
          Skills
        </h2>
        <div class="md:ml-[20%] space-y-0">
          <div
            v-for="group in groupedSkills"
            :key="group.category"
            class="reveal grid grid-cols-12 gap-4 py-6 border-b border-[#242c38]"
          >
            <div class="col-span-4 text-[#8a93a3] text-base">{{ group.category }}</div>
            <div class="col-span-8">
              <div class="space-y-3">
                <div v-for="s in group.items" :key="s.name" class="flex justify-between items-baseline">
                  <span class="text-[#e6eaf0] font-medium">{{ s.name }}</span>
                  <span class="text-[#8a93a3] text-sm">{{ s.level }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Experience -->
      <section class="mb-24">
        <h2 class="reveal text-[clamp(32px,4vw,56px)] font-light tracking-tight leading-[0.98] text-[#e6eaf0] mb-12">
          Experience
        </h2>
        <div class="md:ml-[20%] space-y-0">
          <div
            v-for="(e, i) in profile.experience"
            :key="i"
            class="reveal grid grid-cols-12 gap-4 py-6 border-b border-[#242c38]"
          >
            <div class="col-span-4 text-[#8a93a3] text-base">{{ e.period }}</div>
            <div class="col-span-8">
              <div class="text-xl font-semibold text-[#e6eaf0]">{{ e.role }}</div>
              <div class="text-sm text-[#8a93a3] mt-1">{{ e.company }}</div>
              <p class="mt-3 text-[#8a93a3] leading-relaxed">{{ e.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer (simplified) -->
    <footer class="bg-[#e6eaf0] text-[#0b0f14] p-6 md:p-10">
      <div class="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div class="text-sm font-semibold mb-3">Navigate</div>
          <div class="flex flex-wrap gap-4">
            <NuxtLink to="/" class="text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">Home</NuxtLink>
            <NuxtLink to="/projects" class="text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">Projects</NuxtLink>
            <NuxtLink to="/skills" class="text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">Skills</NuxtLink>
            <NuxtLink to="/contact" class="text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">Contact</NuxtLink>
          </div>
        </div>
        <div class="text-center font-black tracking-[-0.04em] leading-[0.82] text-[clamp(40px,12vw,180px)] text-[#0b0f14]">
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