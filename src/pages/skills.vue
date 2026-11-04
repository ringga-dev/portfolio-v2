<template>
  <div class="min-h-screen">
    <!-- Floating glass navbar -->
    <header class="fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50 glass rounded-2xl px-5 py-3 flex items-center justify-between">
      <NuxtLink to="/" class="text-base font-bold tracking-tight text-[#ecfdf5] no-underline flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_12px_rgba(52,211,153,0.8)]"></span>
        R.S.P.
      </NuxtLink>
      <nav class="flex items-center gap-5 md:gap-7">
        <NuxtLink to="/about" class="nav-link">About</NuxtLink>
        <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
        <NuxtLink to="/skills" class="nav-link active">Skills</NuxtLink>
        <NuxtLink to="/contact" class="btn-glass !py-2 !px-4 text-sm">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-32 px-6 md:px-10 max-w-[1400px] mx-auto">
      <header class="mb-16">
        <h1 class="reveal text-[clamp(56px,10vw,140px)] font-black tracking-[-0.04em] leading-[0.85] text-[#ecfdf5]">
          Skills
        </h1>
        <p class="reveal mt-6 text-lg text-[#a7c4b5] max-w-2xl">
          Proficiency by category.
        </p>
      </header>

      <section class="mb-24">
        <div class="grid md:grid-cols-2 gap-6">
          <div
            v-for="cat in categories"
            :key="cat.name"
            class="reveal glass-card p-6"
          >
            <div class="text-sm text-[#a7c4b5] mb-5 uppercase tracking-wider">{{ cat.name }}</div>
            <div class="space-y-5">
              <div v-for="s in cat.skills" :key="s.name">
                <div class="flex justify-between items-baseline mb-2">
                  <span class="text-[#ecfdf5] font-medium">{{ s.name }}</span>
                  <span class="text-sm text-[#a7c4b5] tabular-nums">{{ s.level }}%</span>
                </div>
                <div
                  class="h-1.5 bg-white/10 rounded-full overflow-hidden"
                  role="progressbar"
                  :aria-valuenow="s.level"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-label="s.name + ' proficiency'"
                >
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
          <NuxtLink to="/about" class="block text-[16px] text-[#0a0f0d] no-underline">About</NuxtLink>
          <NuxtLink to="/projects" class="block text-[16px] text-[#0a0f0d] no-underline">Projects</NuxtLink>
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