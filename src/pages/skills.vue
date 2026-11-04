<template>
  <div class="min-h-screen bg-[#0b0f14] text-[#e6eaf0]">
    <!-- Top bar -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[#0b0f14]/90 backdrop-blur-sm">
      <NuxtLink to="/" class="text-base font-bold tracking-tight text-[#e6eaf0] no-underline">R.S.P.</NuxtLink>
      <nav class="flex items-center gap-6 md:gap-8">
        <NuxtLink to="/about" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">About</NuxtLink>
        <NuxtLink to="/projects" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">Projects</NuxtLink>
        <NuxtLink to="/skills" class="text-sm text-[#10b981] font-semibold no-underline">Skills</NuxtLink>
        <NuxtLink to="/contact" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-28 px-6 md:px-10 max-w-[1400px] mx-auto">
      <header class="mb-16">
        <h1 class="reveal text-[clamp(56px,10vw,140px)] font-black tracking-[-0.04em] leading-[0.85] text-[#e6eaf0]">
          Skills
        </h1>
        <p class="reveal mt-6 text-lg text-[#8a93a3] max-w-2xl">
          Proficiency by category.
        </p>
      </header>

      <section class="mb-24">
        <div class="md:ml-[20%] space-y-0">
          <div
            v-for="cat in categories"
            :key="cat.name"
            class="reveal grid grid-cols-12 gap-4 py-8 border-b border-[#242c38]"
          >
            <div class="col-span-4 text-[#8a93a3] text-base">{{ cat.name }}</div>
            <div class="col-span-8 space-y-5">
              <div v-for="s in cat.skills" :key="s.name">
                <div class="flex justify-between items-baseline mb-2">
                  <span class="text-[#e6eaf0] font-medium">{{ s.name }}</span>
                  <span class="text-[#8a93a3] text-sm tabular-nums">{{ s.level }}%</span>
                </div>
                <div
                  class="h-2 bg-[#242c38] overflow-hidden"
                  role="progressbar"
                  :aria-valuenow="s.level"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-label="s.name + ' proficiency'"
                >
                  <div
                    class="h-full bg-[#10b981] transition-[width] duration-500"
                    :style="{ width: s.level + '%' }"
                  ></div>
                </div>
              </div>
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
            <NuxtLink to="/about" class="text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">About</NuxtLink>
            <NuxtLink to="/projects" class="text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">Projects</NuxtLink>
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
import skills from '~/data/skills.json'
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