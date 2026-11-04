<template>
  <div class="min-h-screen bg-[#171717] text-[#fafafa]">
    <!-- Top bar -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#171717] border-b border-[#242424]">
      <NuxtLink to="/" class="text-sm font-medium text-[#fafafa] no-underline">R.S.P.</NuxtLink>
      <nav class="flex items-center gap-8">
        <NuxtLink to="/about" class="nav-link active">About</NuxtLink>
        <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
        <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
        <NuxtLink to="/contact" class="btn-pill">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-28 px-6 max-w-[1400px] mx-auto">
      <header class="mb-16">
        <h1 class="reveal text-[72px] font-normal leading-[1.00] tracking-tight text-[#fafafa]">
          About
        </h1>
        <p class="reveal mt-4 text-[16px] text-[#b4b4b4]">
          {{ profile.title }} · {{ profile.location }}
        </p>
      </header>

      <!-- Bio -->
      <section class="mb-24">
        <div class="flex gap-12">
          <div class="w-[160px] shrink-0 space-y-5">
            <div>
              <div class="tech-label">Based in</div>
              <div class="text-[13px] text-[#fafafa] mt-1">{{ profile.location }}</div>
            </div>
            <div>
              <div class="tech-label">Since</div>
              <div class="text-[13px] text-[#fafafa] mt-1">2020</div>
            </div>
            <div>
              <div class="tech-label">Email</div>
              <a :href="'mailto:' + profile.email" class="text-[13px] text-[#00c573] mt-1 block">{{ profile.email }}</a>
            </div>
          </div>
          <div class="flex-1">
            <p class="reveal text-[clamp(20px,1.7vw,26px)] leading-[1.35] text-[#fafafa]">
              {{ profile.name }} builds software that ships. {{ profile.bio }}
            </p>
            <p class="reveal mt-8 text-[clamp(20px,1.7vw,26px)] leading-[1.35] text-[#898989]">
              Focused on Kotlin Multiplatform and Vue since 2020.
            </p>
          </div>
        </div>
      </section>

      <!-- Skills -->
      <section class="mb-24">
        <h2 class="reveal text-[36px] font-normal leading-[1.25] text-[#fafafa] mb-12">Skills</h2>
        <div class="space-y-0">
          <div
            v-for="group in groupedSkills"
            :key="group.category"
            class="reveal flex justify-between items-start py-6 border-b border-[#242424]"
          >
            <div class="tech-label w-[160px] shrink-0">{{ group.category }}</div>
            <div class="flex-1 space-y-2">
              <div v-for="s in group.items" :key="s.name" class="flex justify-between">
                <span class="text-[16px] text-[#fafafa]">{{ s.name }}</span>
                <span class="text-[14px] text-[#898989] tabular-nums">{{ s.level }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Experience -->
      <section class="mb-24">
        <h2 class="reveal text-[36px] font-normal leading-[1.25] text-[#fafafa] mb-12">Experience</h2>
        <div class="space-y-0">
          <div
            v-for="(e, i) in profile.experience"
            :key="i"
            class="reveal flex justify-between items-start py-6 border-b border-[#242424]"
          >
            <div class="tech-label w-[160px] shrink-0">{{ e.period }}</div>
            <div class="flex-1">
              <div class="text-[18px] font-medium text-[#fafafa]">{{ e.role }}</div>
              <div class="text-[14px] text-[#898989] mt-1">{{ e.company }}</div>
              <p class="mt-3 text-[16px] text-[#b4b4b4] leading-[1.5]">{{ e.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-[#fafafa] text-[#171717] min-h-[100svh] flex flex-col justify-between p-6 md:p-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-[1400px] mx-auto w-full pt-10">
        <div>
          <div class="tech-label mb-3">Navigate</div>
          <div class="space-y-2">
            <NuxtLink to="/" class="block text-[15px] text-[#171717] no-underline">Home</NuxtLink>
            <NuxtLink to="/projects" class="block text-[15px] text-[#171717] no-underline">Projects</NuxtLink>
            <NuxtLink to="/skills" class="block text-[15px] text-[#171717] no-underline">Skills</NuxtLink>
            <NuxtLink to="/contact" class="block text-[15px] text-[#171717] no-underline">Contact</NuxtLink>
          </div>
        </div>
        <div>
          <div class="tech-label mb-3">Social</div>
          <div class="space-y-2">
            <a :href="profile.github" target="_blank" rel="noopener" class="block text-[15px] text-[#171717] no-underline">GitHub</a>
            <a :href="profile.linkedin" target="_blank" rel="noopener" class="block text-[15px] text-[#171717] no-underline">LinkedIn</a>
          </div>
        </div>
        <div>
          <div class="tech-label mb-3">Contact</div>
          <a :href="'mailto:' + profile.email" class="block text-[15px] text-[#171717] no-underline">{{ profile.email }}</a>
        </div>
        <div>
          <div class="tech-label mb-3">Legal</div>
          <div class="text-[15px] text-[#171717]">© {{ new Date().getFullYear() }}</div>
        </div>
      </div>
      <div class="mt-24 max-w-[1400px] mx-auto w-full">
        <div class="text-center font-medium tracking-[-0.04em] leading-[1.00] text-[clamp(72px,12vw,180px)] text-[#171717]">
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