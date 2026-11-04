<template>
  <div class="min-h-screen">
    <!-- Liquid Glass navbar (WebGL) -->
    <header class="px-4 md:px-8 pt-4">
      <div class="relative">
        <LiquidGlass :width="navWidth" :height="64" :shape-width="navWidth" :shape-height="64" :shape-radius="32" :shape-roundness="5" :mouse-follow="false" />
        <nav class="absolute inset-0 flex items-center justify-between px-6">
          <NuxtLink to="/" class="text-base font-extrabold tracking-tight text-[var(--ink)] no-underline flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_12px_rgba(16,185,129,0.6)]"></span>
            R.S.P.
          </NuxtLink>
          <div class="flex items-center gap-5 md:gap-7">
            <NuxtLink to="/about" class="nav-link">About</NuxtLink>
            <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
            <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
            <NuxtLink to="/contact" class="btn-jelly !py-2 !px-5 text-sm">Contact</NuxtLink>
            <button class="btn-theme" @click="toggleTheme" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">{{ isDark ? '☀️' : '🌙' }}</button>
          </div>
        </nav>
      </div>
    </header>

    <!-- Hero: stacked name, two inks -->
    <section class="px-6 md:px-10 pt-14 pb-14">
      <div class="max-w-[1200px] mx-auto">
        <p class="fade-up text-sm text-[var(--accent-deep)] font-bold tracking-widest uppercase mb-5">
          {{ profile.title }} — {{ profile.location }}
        </p>
        <h1 class="font-black tracking-[-0.03em] leading-[0.85] text-[clamp(56px,11vw,160px)] text-[var(--ink)]">
          <span class="masked-line"><span>Ringga</span></span>
          <span class="masked-line"><span class="text-[var(--accent-deep)]">Septia Pribadi</span></span>
        </h1>
        <div class="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <p class="fade-up text-lg text-[var(--ink-soft)] max-w-md leading-relaxed">
            {{ profile.tagline }}
          </p>
          <div class="fade-up flex flex-wrap gap-3">
            <a :href="'mailto:' + profile.email" class="btn-accent">Get in touch</a>
            <NuxtLink to="/projects" class="btn-jelly">View projects</NuxtLink>
          </div>
        </div>

        <div class="fade-up mt-10 flex justify-center">
          <LiquidGlass :width="heroWidth" :height="220" :shape-width="heroWidth" :shape-height="220" :shape-radius="80" :shape-roundness="5" />
        </div>

        <div class="fade-up mt-8">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&fit=crop"
            alt="Mountain landscape"
            class="w-full h-[280px] md:h-[420px] object-cover rounded-[28px] shadow-[0_20px_60px_rgba(180,110,60,0.18)]"
          />
        </div>
        <p class="fade-up mt-4 text-base text-[var(--ink-soft)] max-w-2xl leading-relaxed">
          {{ profile.bio }}
        </p>
      </div>
    </section>

    <!-- Selected work -->
    <section class="px-6 md:px-10 py-16">
      <div class="max-w-[1200px] mx-auto">
        <div class="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p class="text-sm text-[var(--accent-deep)] font-bold tracking-widest uppercase mb-2">Selected work</p>
            <h2 class="reveal text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--ink)]">Projects I have shipped</h2>
          </div>
          <NuxtLink to="/projects" class="reveal text-link">All projects</NuxtLink>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <article v-for="p in projects.projects.slice(0, 4)" :key="p.slug" class="reveal glass-card overflow-hidden">
            <div class="tile h-[220px]">
              <img :src="`https://picsum.photos/seed/${p.slug}/900/600`" :alt="p.title" loading="lazy" />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-[var(--ink)] mb-2">{{ p.title }}</h3>
              <p class="text-sm text-[var(--muted)] leading-relaxed mb-4">{{ p.description }}</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span v-for="t in p.tech" :key="t" class="text-xs px-3 py-1.5 rounded-full bg-white/50 border border-white/70 text-[var(--ink-soft)] font-medium">{{ t }}</span>
              </div>
              <a :href="p.url" target="_blank" rel="noopener" class="text-link text-sm">View on GitHub</a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Skills -->
    <section class="px-6 md:px-10 py-16">
      <div class="max-w-[1200px] mx-auto">
        <p class="text-sm text-[var(--accent-deep)] font-bold tracking-widest uppercase mb-2">What I use</p>
        <h2 class="reveal text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--ink)] mb-10">Skills</h2>

        <div class="glass-card p-8">
          <div class="space-y-0">
            <div v-for="group in groupedSkills" :key="group.category" class="reveal grid md:grid-cols-12 gap-4 py-6 border-b border-[var(--line)] last:border-b-0">
              <div class="md:col-span-3 text-sm text-[var(--muted)] uppercase tracking-wider pt-1 font-semibold">{{ group.category }}</div>
              <div class="md:col-span-9 grid sm:grid-cols-2 gap-x-8 gap-y-5">
                <div v-for="s in group.items" :key="s.name">
                  <div class="flex justify-between mb-1.5">
                    <span class="text-[var(--ink)] font-semibold">{{ s.name }}</span>
                    <span class="text-sm text-[var(--muted)] tabular-nums">{{ s.level }}%</span>
                  </div>
                  <div class="h-2 bg-[var(--line)] rounded-full overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399]" :style="{ width: s.level + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8">
          <NuxtLink to="/skills" class="btn-jelly">All skills</NuxtLink>
        </div>
      </div>
    </section>

    <!-- About strip -->
    <section class="px-6 md:px-10 py-16">
      <div class="max-w-[1200px] mx-auto glass-widget p-8 md:p-12 grid md:grid-cols-12 gap-8">
        <div class="md:col-span-8">
          <p class="text-sm text-[var(--accent-deep)] font-bold tracking-widest uppercase mb-4">About</p>
          <p class="reveal text-2xl md:text-3xl font-semibold leading-snug text-[var(--ink)]">
            {{ profile.name }} builds software that ships — from mobile apps with Kotlin to web platforms with Vue, end to end.
          </p>
          <div class="mt-6">
            <NuxtLink to="/about" class="btn-jelly">More about me</NuxtLink>
          </div>
        </div>
        <div class="md:col-span-4 space-y-4">
          <div class="reveal">
            <div class="text-sm text-[var(--muted)]">Location</div>
            <div class="text-[var(--ink)] font-semibold">{{ profile.location }}</div>
          </div>
          <div class="reveal">
            <div class="text-sm text-[var(--muted)]">Focus</div>
            <div class="text-[var(--ink)] font-semibold">Kotlin · Vue · Rust</div>
          </div>
          <div class="reveal">
            <div class="text-sm text-[var(--muted)]">Since</div>
            <div class="text-[var(--ink)] font-semibold">2020</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="px-6 md:px-10 py-16">
      <div class="max-w-[1200px] mx-auto glass-widget p-10 md:p-14 text-center reveal">
        <h2 class="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--ink)]">Let's build something together</h2>
        <p class="mt-4 text-[var(--muted)] max-w-xl mx-auto">Open to freelance work, collaborations, and full-time roles. Drop me a line.</p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <a :href="'mailto:' + profile.email" class="btn-accent">Email me</a>
          <a :href="profile.linkedin" target="_blank" rel="noopener" class="btn-jelly">LinkedIn</a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="mt-8">
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-6 border-t border-[var(--line)]">
        <div>
          <div class="text-base font-extrabold text-[var(--ink)]">R.S.P.</div>
          <div class="text-sm text-[var(--muted)] mt-1">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
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
import { computed, ref, onMounted } from 'vue'
import LiquidGlass from '~/components/LiquidGlass.vue'
import profile from "~/data/profile.json"
import projects from "~/data/projects.json"
import skills from "~/data/skills.json"

const isDark = ref(false)
const navWidth = ref(typeof window !== 'undefined' ? window.innerWidth - 32 : 1200)
const heroWidth = ref(typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 1200) : 1200)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
  const update = () => {
    navWidth.value = window.innerWidth - 32
    heroWidth.value = Math.min(window.innerWidth - 48, 1200)
  }
  update()
  window.addEventListener('resize', update)
})

const groupedSkills = computed(() => {
  const map = new Map()
  for (const s of skills.skills) {
    if (!map.has(s.category)) map.set(s.category, [])
    map.get(s.category).push(s)
  }
  return [...map.entries()].map(([category, items]) => ({ category, items }))
})
</script>