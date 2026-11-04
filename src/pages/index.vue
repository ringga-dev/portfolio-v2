<template>
  <div class="min-h-screen bg-[#171717] text-[#fafafa]">
    <!-- Top bar — Supabase style -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#171717] border-b border-[#242424]">
      <NuxtLink to="/" class="text-sm font-medium text-[#fafafa] no-underline">R.S.P.</NuxtLink>
      <nav class="flex items-center gap-8">
        <NuxtLink to="/about" class="nav-link">About</NuxtLink>
        <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
        <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
        <NuxtLink to="/contact" class="btn-pill">Contact</NuxtLink>
      </nav>
    </header>

    <!-- Hero: Name across the middle -->
    <section class="min-h-screen flex flex-col justify-center px-[18px] pt-24 pb-16 relative">
      <div class="max-w-[1400px] w-full mx-auto">
        <!-- Top-left: supporting sentence -->
        <div class="absolute top-24 left-[18px] max-w-[36ch]">
          <p class="fade-up text-[18px] leading-[1.4] text-[#fafafa]">
            {{ profile.tagline }}
          </p>
          <a :href="'mailto:' + profile.email" class="btn-pill mt-4">Get in touch</a>
        </div>

        <!-- Top-right: links -->
        <div class="absolute top-24 right-[18px] flex gap-6">
          <a :href="profile.github" target="_blank" rel="noopener" class="text-[15px] text-[#b4b4b4] hover:text-[#fafafa] no-underline">GitHub</a>
          <a :href="profile.linkedin" target="_blank" rel="noopener" class="text-[15px] text-[#b4b4b4] hover:text-[#fafafa] no-underline">LinkedIn</a>
        </div>

        <!-- Name across the middle -->
        <h1 class="font-medium tracking-[-0.04em] leading-[1.00] text-center text-[clamp(72px,12vw,180px)] text-[#fafafa]">
          <span class="masked-line"><span>RINGGA SEPTIA PRIBADI</span></span>
        </h1>

        <!-- Bottom corners -->
        <div class="absolute bottom-6 left-[18px] text-[16px] text-[#898989]">
          Indonesia
        </div>
        <div class="absolute bottom-6 right-[18px] flex gap-6">
          <a :href="profile.github" target="_blank" rel="noopener" class="text-[15px] text-[#b4b4b4] hover:text-[#fafafa] no-underline">GitHub</a>
          <a :href="'mailto:' + profile.email" class="text-[15px] text-[#00c573] hover:text-[#3ecf8e] no-underline">Email</a>
        </div>
      </div>
    </section>

    <!-- Intro: Heading captions a panorama -->
    <section class="min-h-[100svh] px-6 py-24 bg-[#171717] border-t border-[#242424]">
      <div class="max-w-[1400px] mx-auto">
        <h2 class="reveal text-[clamp(48px,6.5vw,96px)] font-light tracking-tight leading-[0.95] text-[#fafafa]">
          What I build
        </h2>
        <div class="mt-7 flex gap-12">
          <p class="reveal text-[13px] leading-[1.5] text-[#898989] w-[150px]">
            Mobile, web, and desktop applications with Kotlin and Vue. End to end.
          </p>
          <p class="reveal text-[13px] leading-[1.5] text-[#898989] w-[150px]">
            Systems that run in production. Not demos.
          </p>
        </div>
        <!-- Full-bleed photograph -->
        <div class="mt-10 -mx-6 reveal">
          <img
            src="https://picsum.photos/id/228/2400/1200"
            alt="Fog over field at dawn"
            class="w-full h-[55svh] md:h-[60svh] object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <!-- Work: Names passing a held square -->
    <section class="py-24 bg-[#171717] border-t border-[#242424]">
      <div class="max-w-[1400px] mx-auto px-6">
        <h2 class="reveal text-[28px] font-light text-[#898989] mb-12">Work</h2>
        
        <div class="relative">
          <!-- Sticky image frame -->
          <div class="hidden lg:block sticky top-[calc(50svh-225px)] mx-auto w-[450px] h-[450px] z-0 pointer-events-none">
            <img
              :src="`https://picsum.photos/id/${activeImageId}/900/900`"
              alt=""
              class="w-full h-full object-cover"
              style="opacity: 0.3"
            />
          </div>

          <!-- Names list -->
          <div class="relative z-10 -mt-[450px] lg:-mt-0">
            <a
              v-for="(p, i) in projects.projects"
              :key="p.slug"
              :href="p.url"
              target="_blank"
              rel="noopener"
              class="project-name block text-center text-[clamp(96px,14vw,200px)] font-medium uppercase tracking-[-0.04em] leading-[0.85] py-4 no-underline"
              :class="{ active: activeProject === i }"
              @mouseenter="activeProject = i; activeImageId = projectImages[i]"
              @focus="activeProject = i; activeImageId = projectImages[i]"
            >
              {{ p.title }}
            </a>
          </div>
        </div>

        <div class="mt-12 text-center">
          <NuxtLink to="/projects" class="btn-pill-secondary">View all projects</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Skills: Poster lines -->
    <section class="py-24 bg-[#171717] border-t border-[#242424]">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="space-y-0">
          <div class="reveal flex justify-between items-baseline py-8 border-b border-[#242424]">
            <span class="text-[clamp(64px,10vw,150px)] font-medium uppercase tracking-[-0.04em] leading-[0.92] text-[#fafafa]">Kotlin</span>
            <span class="text-[18px] text-[#898989] tabular-nums">90%</span>
          </div>
          <div class="reveal flex justify-between items-baseline py-8 border-b border-[#242424]">
            <span class="text-[clamp(64px,10vw,150px)] font-medium uppercase tracking-[-0.04em] leading-[0.92] text-[#fafafa]">Vue / Nuxt</span>
            <span class="text-[18px] text-[#898989] tabular-nums">85%</span>
          </div>
          <div class="reveal flex justify-between items-baseline py-8 border-b border-[#242424]">
            <span class="text-[clamp(64px,10vw,150px)] font-medium uppercase tracking-[-0.04em] leading-[0.92] text-[#fafafa]">TypeScript</span>
            <span class="text-[18px] text-[#898989] tabular-nums">80%</span>
          </div>
          <div class="reveal flex justify-between items-baseline py-8 border-b border-[#242424]">
            <span class="text-[clamp(64px,10vw,150px)] font-medium uppercase tracking-[-0.04em] leading-[0.92] text-[#fafafa]">Rust</span>
            <span class="text-[18px] text-[#898989] tabular-nums">70%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- About: Side facts, wide paragraph -->
    <section class="py-24 bg-[#171717] border-t border-[#242424]">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="flex gap-12">
          <div class="w-[160px] shrink-0 space-y-5">
            <div>
              <div class="tech-label">Based in</div>
              <div class="text-[13px] text-[#fafafa] mt-1">Indonesia</div>
            </div>
            <div>
              <div class="tech-label">Since</div>
              <div class="text-[13px] text-[#fafafa] mt-1">2020</div>
            </div>
            <div>
              <div class="tech-label">Focus</div>
              <div class="text-[13px] text-[#fafafa] mt-1">Kotlin · Vue</div>
            </div>
          </div>
          <div class="flex-1">
            <p class="reveal text-[clamp(20px,1.7vw,26px)] leading-[1.35] text-[#fafafa]">
              Ringga Septia Pribadi builds software that ships. {{ profile.bio }}
            </p>
            <p class="reveal mt-8 text-[clamp(20px,1.7vw,26px)] leading-[1.35] text-[#898989]">
              Focused on Kotlin Multiplatform and Vue since 2020, with a bias for systems that run in production. Currently building monitoring tools, POS systems, and developer tooling.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Marquee: Edge-to-edge -->
    <div class="py-8 bg-[#171717] border-t border-[#242424] overflow-hidden">
      <div class="flex whitespace-nowrap" style="animation: marquee 30s linear infinite">
        <span class="text-[clamp(48px,8vw,120px)] font-medium uppercase tracking-[-0.04em] leading-[0.92] text-[#fafafa] pr-12">
          RINGGA SEPTIA PRIBADI — KOTLIN — VUE — RUST — 
        </span>
        <span class="text-[clamp(48px,8vw,120px)] font-medium uppercase tracking-[-0.04em] leading-[0.92] text-[#fafafa] pr-12">
          RINGGA SEPTIA PRIBADI — KOTLIN — VUE — RUST — 
        </span>
      </div>
    </div>

    <!-- CTA: Inverted -->
    <section class="bg-[#fafafa] text-[#171717] min-h-[90svh] flex flex-col justify-between p-6 md:p-10">
      <h2 class="text-[clamp(48px,9vw,140px)] font-medium tracking-[-0.04em] leading-[0.9] text-[#171717]">
        Let's build<br/>something.
      </h2>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <p class="text-[20px] text-[#171717] max-w-[36ch]">
          Open to freelance, collaborations, and full-time roles.
        </p>
        <a :href="'mailto:' + profile.email" class="btn-pill bg-[#171717] text-[#fafafa] border-[#171717] hover:border-[#3ecf8e]">
          Get in touch
        </a>
      </div>
    </section>

    <!-- Footer: Columns above, wordmark below -->
    <footer class="bg-[#fafafa] text-[#171717] min-h-[100svh] flex flex-col justify-between p-6 md:p-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-[1400px] mx-auto w-full pt-10">
        <div>
          <div class="tech-label mb-3">Navigate</div>
          <div class="space-y-2">
            <NuxtLink to="/about" class="block text-[15px] text-[#171717] no-underline">About</NuxtLink>
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
          <div class="space-y-2">
            <a :href="'mailto:' + profile.email" class="block text-[15px] text-[#171717] no-underline">{{ profile.email }}</a>
          </div>
        </div>
        <div>
          <div class="tech-label mb-3">Legal</div>
          <div class="text-[15px] text-[#171717]">© {{ new Date().getFullYear() }} Ringga Septia Pribadi</div>
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
import profile from "~/data/profile.json"
import projects from "~/data/projects.json"
import { ref } from 'vue'

const activeProject = ref(0)
const activeImageId = ref(266)
const projectImages = [266, 279, 228, 594]
</script>

<style>
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
</style>