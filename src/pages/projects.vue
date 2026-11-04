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
        <NuxtLink to="/projects" class="nav-link active">Projects</NuxtLink>
        <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
        <NuxtLink to="/contact" class="btn-glass !py-2 !px-4 text-sm">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-32 px-6 md:px-10 max-w-[1400px] mx-auto">
      <header class="mb-16 flex items-baseline justify-between flex-wrap gap-4">
        <h1 class="reveal text-[clamp(56px,10vw,140px)] font-black tracking-[-0.04em] leading-[0.85] text-[#ecfdf5]">
          Projects
        </h1>
        <a :href="profile.github" target="_blank" rel="noopener" class="reveal text-link text-base">GitHub</a>
      </header>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        <article
          v-for="p in projects.projects"
          :key="p.slug"
          class="reveal glass-card overflow-hidden"
        >
          <div class="tile h-[220px]">
            <img
              :src="`https://picsum.photos/seed/${p.slug}/800/500`"
              :alt="p.title"
              loading="lazy"
            />
          </div>
          <div class="p-6">
            <h2 class="text-[20px] font-semibold text-[#ecfdf5] mb-2">{{ p.title }}</h2>
            <p class="text-sm text-[#a7c4b5] leading-relaxed mb-4">{{ p.description }}</p>
            <div class="flex flex-wrap gap-2 mb-5">
              <span
                v-for="t in p.tech"
                :key="t"
                class="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[#a7c4b5]"
              >
                {{ t }}
              </span>
            </div>
            <a :href="p.url" target="_blank" rel="noopener" class="text-link text-sm">View on GitHub</a>
          </div>
        </article>
      </div>
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
import projects from '~/data/projects.json'
import profile from '~/data/profile.json'
</script>