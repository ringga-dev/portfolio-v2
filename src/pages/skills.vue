<template>
  <div class="min-h-screen bg-[#171717] text-[#fafafa]">
    <!-- Top bar -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#171717] border-b border-[#242424]">
      <NuxtLink to="/" class="text-sm font-medium text-[#fafafa] no-underline">R.S.P.</NuxtLink>
      <nav class="flex items-center gap-8">
        <NuxtLink to="/about" class="nav-link">About</NuxtLink>
        <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
        <NuxtLink to="/skills" class="nav-link active">Skills</NuxtLink>
        <NuxtLink to="/contact" class="btn-pill">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-28 px-6 max-w-[1400px] mx-auto">
      <header class="mb-16">
        <h1 class="reveal text-[72px] font-normal leading-[1.00] tracking-tight text-[#fafafa]">
          Skills
        </h1>
        <p class="reveal mt-4 text-[16px] text-[#b4b4b4]">
          Proficiency by category.
        </p>
      </header>

      <section class="mb-24">
        <div class="space-y-0">
          <div
            v-for="cat in categories"
            :key="cat.name"
            class="reveal flex gap-12 py-8 border-b border-[#242424]"
          >
            <div class="tech-label w-[160px] shrink-0">{{ cat.name }}</div>
            <div class="flex-1 space-y-5">
              <div v-for="s in cat.skills" :key="s.name">
                <div class="flex justify-between items-baseline mb-2">
                  <span class="text-[16px] text-[#fafafa]">{{ s.name }}</span>
                  <span class="text-[14px] text-[#898989] tabular-nums">{{ s.level }}%</span>
                </div>
                <div
                  class="h-[2px] bg-[#2e2e2e] overflow-hidden"
                  role="progressbar"
                  :aria-valuenow="s.level"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-label="s.name + ' proficiency'"
                >
                  <div
                    class="h-full bg-[#3ecf8e] transition-[width] duration-500"
                    :style="{ width: s.level + '%' }"
                  ></div>
                </div>
              </div>
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
            <NuxtLink to="/about" class="block text-[15px] text-[#171717] no-underline">About</NuxtLink>
            <NuxtLink to="/projects" class="block text-[15px] text-[#171717] no-underline">Projects</NuxtLink>
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