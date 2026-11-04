<template>
  <div class="min-h-screen bg-[#0b0f14] text-[#e6eaf0]">
    <!-- Top bar -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[#0b0f14]/90 backdrop-blur-sm">
      <NuxtLink to="/" class="text-base font-bold tracking-tight text-[#e6eaf0] no-underline">R.S.P.</NuxtLink>
      <nav class="flex items-center gap-6 md:gap-8">
        <NuxtLink to="/about" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">About</NuxtLink>
        <NuxtLink to="/projects" class="text-sm text-[#10b981] font-semibold no-underline">Projects</NuxtLink>
        <NuxtLink to="/skills" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">Skills</NuxtLink>
        <NuxtLink to="/contact" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-28 px-6 md:px-10 max-w-[1400px] mx-auto">
      <header class="mb-16 flex items-baseline justify-between">
        <h1 class="reveal text-[clamp(56px,10vw,140px)] font-black tracking-[-0.04em] leading-[0.85] text-[#e6eaf0]">
          Projects
        </h1>
        <a :href="profile.github" target="_blank" rel="noopener" class="reveal text-link text-base hidden md:inline-block">GitHub</a>
      </header>

      <div class="flex flex-wrap gap-2 mb-24">
        <div
          v-for="(p, i) in projects.projects"
          :key="p.slug"
          class="reveal"
          :class="i % 3 === 0 ? 'w-full md:w-[calc(50%-4px)]' : 'w-full md:w-[calc(33%-6px)]'"
        >
          <div class="tile" :class="i % 3 === 0 ? 'h-[280px] md:h-[360px]' : 'h-[240px] md:h-[300px]'">
            <img
              :src="`https://picsum.photos/seed/${p.slug}/900/600`"
              :alt="p.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div class="tile-caption">
            <span class="name">{{ p.title }}</span>
            <span class="year">2024</span>
          </div>
          <p class="mt-2 text-sm text-[#8a93a3] leading-relaxed">{{ p.description }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="t in p.tech"
              :key="t"
              class="text-xs px-2.5 py-1 border border-[#242c38] text-[#8a93a3]"
            >
              {{ t }}
            </span>
          </div>
          <a :href="p.url" target="_blank" rel="noopener" class="mt-4 inline-block text-link text-sm">View on GitHub</a>
        </div>
      </div>
    </main>

    <!-- Footer (simplified) -->
    <footer class="bg-[#e6eaf0] text-[#0b0f14] p-6 md:p-10">
      <div class="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div class="text-sm font-semibold mb-3">Navigate</div>
          <div class="flex flex-wrap gap-4">
            <NuxtLink to="/" class="text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">Home</NuxtLink>
            <NuxtLink to="/about" class="text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">About</NuxtLink>
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
import projects from '~/data/projects.json'
import profile from '~/data/profile.json'
</script>