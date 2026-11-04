<template>
  <div class="min-h-screen">
    <header class="glass-nav px-6 md:px-10 py-4 flex items-center justify-between">
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

    <main class="pt-14 px-6 md:px-10 max-w-[1200px] mx-auto">
      <p class="text-sm text-[#34d399] font-semibold tracking-widest uppercase mb-3">Portfolio</p>
      <h1 class="reveal text-5xl md:text-6xl font-black tracking-tight text-[#ecfdf5]">Projects</h1>
      <p class="reveal mt-3 text-lg text-[#9db8ab]">Selected work and open-source contributions.</p>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 mb-24">
        <article v-for="p in projects.projects" :key="p.slug" class="reveal glass-card overflow-hidden">
          <div class="tile h-[220px]">
            <img :src="`https://picsum.photos/seed/${p.slug}/900/600`" :alt="p.title" loading="lazy" />
          </div>
          <div class="p-6">
            <h2 class="text-xl font-semibold text-[#ecfdf5] mb-2">{{ p.title }}</h2>
            <p class="text-sm text-[#9db8ab] leading-relaxed mb-4">{{ p.description }}</p>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="t in p.tech" :key="t" class="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[#9db8ab]">{{ t }}</span>
            </div>
            <a :href="p.url" target="_blank" rel="noopener" class="text-link text-sm">View on GitHub</a>
          </div>
        </article>
      </div>
    </main>

    <footer class="border-t border-white/10">
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <div class="text-base font-bold text-[#ecfdf5]">R.S.P.</div>
          <div class="text-sm text-[#9db8ab] mt-1">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
        </div>
        <nav class="flex flex-wrap gap-6">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink to="/about" class="nav-link">About</NuxtLink>
          <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
          <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import projects from '~/data/projects.json'
import profile from '~/data/profile.json'
</script>