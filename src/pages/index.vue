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
        <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
        <NuxtLink to="/contact" class="btn-glass !py-2 !px-4 text-sm">Contact</NuxtLink>
      </nav>
    </header>

    <!-- Hero -->
    <section class="px-6 md:px-10 pt-36 pb-16">
      <div class="max-w-[1200px] mx-auto">
        <p class="fade-up text-sm text-[#34d399] font-semibold tracking-widest uppercase mb-6">
          {{ profile.title }} — {{ profile.location }}
        </p>
        <h1 class="font-black tracking-[-0.03em] leading-[0.95] text-[clamp(48px,9vw,128px)] text-[#ecfdf5]">
          <span class="masked-line"><span>Ringga</span></span>
          <span class="masked-line"><span class="text-[#34d399]" style="text-shadow: 0 0 50px rgba(52,211,153,0.35)">Septia Pribadi</span></span>
        </h1>
        <p class="fade-up mt-8 text-xl text-[#c9e5d8] max-w-2xl leading-relaxed">
          {{ profile.tagline }}
        </p>
        <p class="fade-up mt-4 text-base text-[#9db8ab] max-w-2xl leading-relaxed">
          {{ profile.bio }}
        </p>
        <div class="fade-up mt-8 flex flex-wrap gap-3">
          <a :href="'mailto:' + profile.email" class="btn-solid">Get in touch</a>
          <NuxtLink to="/projects" class="btn-glass">View projects</NuxtLink>
          <a :href="profile.github" target="_blank" rel="noopener" class="btn-glass">GitHub</a>
        </div>

        <div class="fade-up mt-12 glass rounded-2xl p-6 grid grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-light text-[#34d399]">{{ profile.stats[0].value }}</div>
            <div class="text-sm text-[#9db8ab] mt-1">{{ profile.stats[0].label }}</div>
          </div>
          <div class="text-center border-x border-white/10">
            <div class="text-3xl font-light text-[#34d399]">{{ profile.stats[1].value }}</div>
            <div class="text-sm text-[#9db8ab] mt-1">{{ profile.stats[1].label }}</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-light text-[#34d399]">{{ profile.stats[2].value }}</div>
            <div class="text-sm text-[#9db8ab] mt-1">{{ profile.stats[2].label }}</div>
          </div>
        </div>

        <div class="fade-up mt-8">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&fit=crop"
            alt="Mountain landscape"
            class="w-full h-[280px] md:h-[420px] object-cover rounded-2xl"
          />
        </div>
      </div>
    </section>

    <!-- Selected work -->
    <section class="px-6 md:px-10 py-20">
      <div class="max-w-[1200px] mx-auto">
        <div class="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p class="text-sm text-[#34d399] font-semibold tracking-widest uppercase mb-2">Selected work</p>
            <h2 class="reveal text-4xl md:text-5xl font-light tracking-tight text-[#ecfdf5]">Projects I have shipped</h2>
          </div>
          <NuxtLink to="/projects" class="reveal text-link">All projects</NuxtLink>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <article v-for="p in projects.projects.slice(0, 4)" :key="p.slug" class="reveal glass-card overflow-hidden">
            <div class="tile h-[220px]">
              <img :src="`https://picsum.photos/seed/${p.slug}/900/600`" :alt="p.title" loading="lazy" />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-semibold text-[#ecfdf5] mb-2">{{ p.title }}</h3>
              <p class="text-sm text-[#9db8ab] leading-relaxed mb-4">{{ p.description }}</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span v-for="t in p.tech" :key="t" class="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[#9db8ab]">{{ t }}</span>
              </div>
              <a :href="p.url" target="_blank" rel="noopener" class="text-link text-sm">View on GitHub</a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Skills -->
    <section class="px-6 md:px-10 py-20">
      <div class="max-w-[1200px] mx-auto">
        <p class="text-sm text-[#34d399] font-semibold tracking-widest uppercase mb-2">What I use</p>
        <h2 class="reveal text-4xl md:text-5xl font-light tracking-tight text-[#ecfdf5] mb-10">Skills</h2>

        <div class="space-y-0">
          <div v-for="group in groupedSkills" :key="group.category" class="reveal grid md:grid-cols-12 gap-4 py-6 border-b border-white/10">
            <div class="md:col-span-3 text-sm text-[#9db8ab] uppercase tracking-wider pt-1">{{ group.category }}</div>
            <div class="md:col-span-9 space-y-4">
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

        <div class="mt-8">
          <NuxtLink to="/skills" class="btn-glass">All skills</NuxtLink>
        </div>
      </div>
    </section>

    <!-- About strip -->
    <section class="px-6 md:px-10 py-20">
      <div class="max-w-[1200px] mx-auto glass rounded-2xl p-8 md:p-12 grid md:grid-cols-12 gap-8">
        <div class="md:col-span-8">
          <p class="text-sm text-[#34d399] font-semibold tracking-widest uppercase mb-4">About</p>
          <p class="reveal text-2xl md:text-3xl font-light leading-snug text-[#ecfdf5]">
            {{ profile.name }} builds software that ships — from mobile apps with Kotlin to web platforms with Vue, end to end.
          </p>
          <div class="mt-6">
            <NuxtLink to="/about" class="btn-glass">More about me</NuxtLink>
          </div>
        </div>
        <div class="md:col-span-4 space-y-4">
          <div class="reveal">
            <div class="text-sm text-[#9db8ab]">Location</div>
            <div class="text-[#ecfdf5] font-medium">{{ profile.location }}</div>
          </div>
          <div class="reveal">
            <div class="text-sm text-[#9db8ab]">Focus</div>
            <div class="text-[#ecfdf5] font-medium">Kotlin · Vue · Rust</div>
          </div>
          <div class="reveal">
            <div class="text-sm text-[#9db8ab]">Since</div>
            <div class="text-[#ecfdf5] font-medium">2020</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="px-6 md:px-10 py-20">
      <div class="max-w-[1200px] mx-auto glass rounded-2xl p-10 md:p-14 text-center reveal">
        <h2 class="text-4xl md:text-5xl font-light tracking-tight text-[#ecfdf5]">Let's build something together</h2>
        <p class="mt-4 text-[#9db8ab] max-w-xl mx-auto">Open to freelance work, collaborations, and full-time roles. Drop me a line.</p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <a :href="'mailto:' + profile.email" class="btn-solid">Email me</a>
          <a :href="profile.linkedin" target="_blank" rel="noopener" class="btn-glass">LinkedIn</a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="mt-8 border-t border-white/10">
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <div class="text-base font-bold text-[#ecfdf5]">R.S.P.</div>
          <div class="text-sm text-[#9db8ab] mt-1">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
        </div>
        <nav class="flex flex-wrap gap-6">
          <NuxtLink to="/about" class="nav-link">About</NuxtLink>
          <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
          <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
          <NuxtLink to="/contact" class="nav-link">Contact</NuxtLink>
          <a :href="profile.github" target="_blank" rel="noopener" class="nav-link">GitHub</a>
          <a :href="profile.linkedin" target="_blank" rel="noopener" class="nav-link">LinkedIn</a>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import profile from "~/data/profile.json"
import projects from "~/data/projects.json"
import skills from "~/data/skills.json"

const groupedSkills = computed(() => {
  const map = new Map()
  for (const s of skills.skills) {
    if (!map.has(s.category)) map.set(s.category, [])
    map.get(s.category).push(s)
  }
  return [...map.entries()].map(([category, items]) => ({ category, items }))
})
</script>