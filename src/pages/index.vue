<template>
  <div class="min-h-screen">
    <!-- Sticky nav — solid surface, safe-area aware -->
    <header class="sticky top-0 z-50 px-4 md:px-8 border-b border-[var(--line)] bg-[var(--surface-base)]" style="padding-top: max(0px, env(safe-area-inset-top))">
      <nav class="flex items-center justify-between py-3.5 max-w-[1200px] mx-auto">
        <NuxtLink to="/" class="text-base font-bold text-[var(--text-heading)] no-underline flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[var(--accent)]"></span>
          R.S.P.
        </NuxtLink>
        <div class="flex items-center gap-5 md:gap-7">
          <NuxtLink to="/about" class="nav-link">About</NuxtLink>
          <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
          <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
          <NuxtLink to="/contact" class="btn-primary !py-2 !px-5 text-sm">Contact</NuxtLink>
          <button class="btn-theme" @click="toggleTheme" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">{{ isDark ? '☀️' : '🌙' }}</button>
        </div>
      </nav>
    </header>

    <!-- Hero: heading-1 127px/700 -->
    <section class="px-6 md:px-10 pt-16 pb-14">
      <div class="max-w-[1200px] mx-auto">
        <p class="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-6">
          {{ profile.title }} — {{ profile.location }}
        </p>
        <h1 class="font-bold leading-[1.0] text-[clamp(48px,8vw,127px)] text-[var(--text-heading)]">
          Ringga<br />Septia Pribadi
        </h1>
        <div class="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <p class="text-[18px] font-medium text-[var(--text-primary)] max-w-md leading-relaxed">
            {{ profile.tagline }}
          </p>
          <div class="flex flex-wrap gap-3">
            <a :href="'mailto:' + profile.email" class="btn-primary">Get in touch</a>
            <NuxtLink to="/projects" class="btn-ghost">View projects</NuxtLink>
          </div>
        </div>

        <div class="mt-12 grid grid-cols-3 gap-6 border-y border-[var(--line)] py-8">
          <div>
            <div class="text-[40px] md:text-[56px] font-bold tabular-nums leading-none text-[var(--text-heading)]">{{ profile.stats[0].value }}</div>
            <div class="text-sm text-[var(--text-secondary)] mt-2">{{ profile.stats[0].label }}</div>
          </div>
          <div>
            <div class="text-[40px] md:text-[56px] font-bold tabular-nums leading-none text-[var(--text-heading)]">{{ profile.stats[1].value }}</div>
            <div class="text-sm text-[var(--text-secondary)] mt-2">{{ profile.stats[1].label }}</div>
          </div>
          <div>
            <div class="text-[40px] md:text-[56px] font-bold tabular-nums leading-none text-[var(--text-heading)]">{{ profile.stats[2].value }}</div>
            <div class="text-sm text-[var(--text-secondary)] mt-2">{{ profile.stats[2].label }}</div>
          </div>
        </div>

        <div class="mt-8">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&fit=crop"
            alt="Mountain landscape"
            class="w-full h-[280px] md:h-[420px] object-cover rounded-[8px]"
          />
        </div>
        <p class="mt-4 text-[15px] text-[var(--text-primary)] max-w-2xl leading-relaxed">
          {{ profile.bio }}
        </p>
      </div>
    </section>

    <!-- Selected work -->
    <section class="px-6 md:px-10 py-16">
      <div class="max-w-[1200px] mx-auto">
        <div class="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p class="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-2">Selected work</p>
            <h2 class="reveal text-[28px] font-bold text-[var(--text-heading)]">Projects I have shipped</h2>
          </div>
          <NuxtLink to="/projects" class="reveal text-link text-[15px]">All projects</NuxtLink>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <article v-for="p in projects.projects.slice(0, 4)" :key="p.slug" class="reveal card overflow-hidden">
            <div class="tile h-[220px]">
              <img :src="`https://picsum.photos/seed/${p.slug}/900/600`" :alt="p.title" loading="lazy" />
            </div>
            <div class="p-6">
              <h3 class="text-[18px] font-bold mb-2">{{ p.title }}</h3>
              <p class="text-sm leading-relaxed mb-4">{{ p.description }}</p>
              <div class="flex flex-wrap gap-2 mb-4">
                <span v-for="t in p.tech" :key="t" class="tag">{{ t }}</span>
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
        <p class="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-2">What I use</p>
        <h2 class="reveal text-[28px] font-bold text-[var(--text-heading)] mb-10">Skills</h2>

        <div class="panel p-8">
          <div class="space-y-0">
            <div v-for="group in groupedSkills" :key="group.category" class="reveal grid md:grid-cols-12 gap-4 py-6 border-b border-[var(--border-default)] last:border-b-0">
              <div class="md:col-span-3 text-xs font-semibold uppercase text-[var(--text-on-dark-muted)] pt-1">{{ group.category }}</div>
              <div class="md:col-span-9 grid sm:grid-cols-2 gap-x-8 gap-y-5">
                <div v-for="s in group.items" :key="s.name">
                  <div class="flex justify-between mb-1.5">
                    <span class="text-[var(--text-on-dark)] font-medium text-[15px]">{{ s.name }}</span>
                    <span class="text-sm tabular-nums" style="color: var(--text-on-dark-muted)">{{ s.level }}%</span>
                  </div>
                  <div class="bar-track">
                    <div class="bar-fill" :style="{ width: s.level + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8">
          <NuxtLink to="/skills" class="btn-ghost">All skills</NuxtLink>
        </div>
      </div>
    </section>

    <!-- About strip -->
    <section class="px-6 md:px-10 py-16">
      <div class="max-w-[1200px] mx-auto panel p-8 md:p-12 grid md:grid-cols-12 gap-8">
        <div class="md:col-span-8">
          <p class="text-xs font-semibold uppercase mb-4" style="color: var(--text-on-dark-muted)">About</p>
          <p class="reveal text-[28px] font-bold leading-snug" style="color: var(--text-on-dark)">
            {{ profile.name }} builds software that ships — from mobile apps with Kotlin to web platforms with Vue, end to end.
          </p>
          <div class="mt-6">
            <NuxtLink to="/about" class="btn-ghost" style="border-color: var(--border-default)">More about me</NuxtLink>
          </div>
        </div>
        <div class="md:col-span-4 space-y-4">
          <div class="reveal">
            <div class="text-xs" style="color: var(--text-on-dark-muted)">Location</div>
            <div class="font-medium text-[15px]" style="color: var(--text-on-dark)">{{ profile.location }}</div>
          </div>
          <div class="reveal">
            <div class="text-xs" style="color: var(--text-on-dark-muted)">Focus</div>
            <div class="font-medium text-[15px]" style="color: var(--text-on-dark)">Kotlin · Vue · Rust</div>
          </div>
          <div class="reveal">
            <div class="text-xs" style="color: var(--text-on-dark-muted)">Since</div>
            <div class="font-medium text-[15px]" style="color: var(--text-on-dark)">2020</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="px-6 md:px-10 py-16">
      <div class="max-w-[1200px] mx-auto panel p-10 md:p-14 text-center reveal">
        <h2 class="text-[28px] md:text-[40px] font-bold">Let's build something together</h2>
        <p class="mt-4 max-w-xl mx-auto">Open to freelance work, collaborations, and full-time roles. Drop me a line.</p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <a :href="'mailto:' + profile.email" class="btn-primary" style="background: var(--surface-base); color: var(--surface-overlay); border-color: var(--surface-base)">Email me</a>
          <a :href="profile.linkedin" target="_blank" rel="noopener" class="btn-ghost" style="border-color: var(--border-default)">LinkedIn</a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer style="background: var(--surface-overlay)">
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div class="text-base font-bold" style="color: var(--surface-base)">R.S.P.</div>
          <div class="text-sm mt-1" style="color: var(--text-on-dark-muted)">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
        </div>
        <nav class="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-3">
          <NuxtLink to="/about" class="text-sm" style="color: var(--text-on-dark-muted)">About</NuxtLink>
          <NuxtLink to="/projects" class="text-sm" style="color: var(--text-on-dark-muted)">Projects</NuxtLink>
          <NuxtLink to="/skills" class="text-sm" style="color: var(--text-on-dark-muted)">Skills</NuxtLink>
          <NuxtLink to="/contact" class="text-sm" style="color: var(--text-on-dark-muted)">Contact</NuxtLink>
          <a :href="profile.github" target="_blank" rel="noopener" class="text-sm" style="color: var(--text-on-dark-muted)">GitHub</a>
          <a :href="profile.linkedin" target="_blank" rel="noopener" class="text-sm" style="color: var(--text-on-dark-muted)">LinkedIn</a>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import profile from "~/data/profile.json"
import projects from "~/data/projects.json"
import skills from "~/data/skills.json"

const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
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