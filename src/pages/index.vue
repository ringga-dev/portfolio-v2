<template>
  <div class="min-h-screen relative">
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

    <!-- Hero: Photograph for a letter -->
    <section class="min-h-screen flex flex-col justify-center px-6 md:px-10 pt-28 pb-16 relative">
      <div class="max-w-[1400px] w-full mx-auto">
        <!-- Top-left: supporting sentence -->
        <div class="absolute top-28 left-6 md:left-10 max-w-[36ch]">
          <p class="fade-up text-[18px] leading-[1.4] text-[#ecfdf5]">
            {{ profile.tagline }}
          </p>
          <div class="fade-up mt-5 flex gap-3">
            <a :href="'mailto:' + profile.email" class="btn-solid">Get in touch</a>
            <a :href="profile.github" target="_blank" rel="noopener" class="btn-glass">GitHub</a>
          </div>
        </div>

        <!-- Top-right: links -->
        <div class="absolute top-28 right-6 md:right-10 flex gap-5">
          <a :href="profile.github" target="_blank" rel="noopener" class="text-[15px] text-[#a7c4b5] hover:text-[#ecfdf5] no-underline">GitHub</a>
          <a :href="profile.linkedin" target="_blank" rel="noopener" class="text-[15px] text-[#a7c4b5] hover:text-[#ecfdf5] no-underline">LinkedIn</a>
        </div>

        <!-- Name with photograph for a letter: RINGGA [photo] SEPTIA -->
        <div class="mt-24 flex items-center justify-center gap-4 md:gap-6 flex-wrap">
          <h1 class="font-black tracking-[-0.04em] leading-[0.85] text-[clamp(56px,10.5vw,168px)] text-[#ecfdf5] text-center">
            <span class="masked-line"><span>RINGGA</span></span>
          </h1>
          <div class="w-[1.6em] h-[1em] rounded-lg overflow-hidden shrink-0 hidden md:block" style="height: 0.7em">
            <img src="https://picsum.photos/id/1018/800/500" alt="Mountain lake" class="w-full h-full object-cover" />
          </div>
          <h1 class="font-black tracking-[-0.04em] leading-[0.85] text-[clamp(56px,10.5vw,168px)] text-[#ecfdf5] text-center">
            <span class="masked-line"><span>SEPTIA</span></span>
          </h1>
        </div>
        <h1 class="font-black tracking-[-0.04em] leading-[0.85] text-[clamp(56px,10.5vw,168px)] text-center">
          <span class="masked-line"><span class="text-[#34d399]" style="text-shadow: 0 0 60px rgba(52,211,153,0.4)">PRIBADI</span></span>
        </h1>

        <!-- Bottom: stats in glass bar -->
        <div class="mt-16 glass rounded-2xl p-6 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div class="text-center">
            <div class="text-[32px] font-light text-[#34d399]">{{ profile.stats[0].value }}</div>
            <div class="text-sm text-[#a7c4b5] mt-1">{{ profile.stats[0].label }}</div>
          </div>
          <div class="text-center border-x border-white/10">
            <div class="text-[32px] font-light text-[#34d399]">{{ profile.stats[1].value }}</div>
            <div class="text-sm text-[#a7c4b5] mt-1">{{ profile.stats[1].label }}</div>
          </div>
          <div class="text-center">
            <div class="text-[32px] font-light text-[#34d399]">{{ profile.stats[2].value }}</div>
            <div class="text-sm text-[#a7c4b5] mt-1">{{ profile.stats[2].label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Intro: Title, note, facts row -->
    <section class="px-6 md:px-10 py-24 md:py-32 relative">
      <div class="max-w-[1400px] mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <h2 class="reveal text-[clamp(44px,5vw,76px)] font-light tracking-tight leading-[1.05] text-[#ecfdf5]">
            What I build
          </h2>
          <p class="reveal text-base text-[#a7c4b5] max-w-[260px] leading-relaxed">
            I build mobile, web, and desktop applications with Kotlin and Vue, end to end.
          </p>
        </div>
        <div class="mt-16 flex flex-wrap justify-between gap-8 md:gap-12">
          <div class="reveal">
            <div class="text-[clamp(28px,3vw,44px)] font-light text-[#34d399]">{{ profile.stats[0].value }}</div>
            <div class="text-sm text-[#a7c4b5] mt-1">{{ profile.stats[0].label }}</div>
          </div>
          <div class="reveal">
            <div class="text-[clamp(28px,3vw,44px)] font-light text-[#34d399]">{{ profile.stats[1].value }}</div>
            <div class="text-sm text-[#a7c4b5] mt-1">{{ profile.stats[1].label }}</div>
          </div>
          <div class="reveal">
            <div class="text-[clamp(28px,3vw,44px)] font-light text-[#34d399]">{{ profile.stats[2].value }}</div>
            <div class="text-sm text-[#a7c4b5] mt-1">{{ profile.stats[2].label }}</div>
          </div>
          <div class="reveal">
            <div class="text-[clamp(28px,3vw,44px)] font-light text-[#34d399]">Indonesia</div>
            <div class="text-sm text-[#a7c4b5] mt-1">Based in</div>
          </div>
        </div>
        <div class="mt-16 reveal">
          <img
            src="https://picsum.photos/id/1018/1600/900"
            alt="Mountain lake landscape"
            class="w-full h-[400px] md:h-[500px] object-cover rounded-2xl"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <!-- Work: Names passing a held square -->
    <section class="px-6 md:px-10 py-24 md:py-32">
      <div class="max-w-[1400px] mx-auto">
        <div class="flex items-baseline justify-between mb-12">
          <h2 class="reveal text-[clamp(64px,9vw,136px)] font-black uppercase tracking-tight leading-[0.9] text-[#ecfdf5]">
            Work
          </h2>
          <NuxtLink to="/projects" class="reveal text-link text-base">Full archive</NuxtLink>
        </div>

        <div class="relative">
          <!-- Sticky image frame -->
          <div class="hidden lg:block sticky top-[calc(50svh-225px)] mx-auto w-[450px] h-[450px] z-0 pointer-events-none">
            <img
              :src="`https://picsum.photos/id/${activeImageId}/900/900`"
              alt=""
              class="w-full h-full object-cover rounded-2xl"
              style="opacity: 0.5"
            />
          </div>

          <!-- Names list -->
          <div class="relative z-10 lg:-mt-[450px]">
            <a
              v-for="(p, i) in projects.projects"
              :key="p.slug"
              :href="p.url"
              target="_blank"
              rel="noopener"
              class="block text-center text-[clamp(64px,10vw,150px)] font-black uppercase tracking-[-0.04em] leading-[0.9] py-6 no-underline transition-colors duration-200"
              :class="activeProject === i ? 'text-[#ecfdf5]' : 'text-[#a7c4b5]/40 hover:text-[#ecfdf5]/70'"
              @mouseenter="activeProject = i; activeImageId = projectImages[i]"
            >
              {{ p.title }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills: Poster lines -->
    <section class="px-6 md:px-10 py-24 md:py-32">
      <div class="max-w-[1400px] mx-auto">
        <div class="space-y-0">
          <div class="reveal flex justify-between items-baseline py-8 border-b border-white/10 group cursor-default">
            <span class="text-[clamp(48px,8vw,120px)] font-black uppercase tracking-[-0.04em] leading-[0.92] text-[#ecfdf5] group-hover:text-[#34d399] transition-colors">Kotlin</span>
            <span class="text-[20px] text-[#a7c4b5] tabular-nums">90%</span>
          </div>
          <div class="reveal flex justify-between items-baseline py-8 border-b border-white/10 group cursor-default">
            <span class="text-[clamp(48px,8vw,120px)] font-black uppercase tracking-[-0.04em] leading-[0.92] text-[#ecfdf5] group-hover:text-[#34d399] transition-colors">Vue / Nuxt</span>
            <span class="text-[20px] text-[#a7c4b5] tabular-nums">85%</span>
          </div>
          <div class="reveal flex justify-between items-baseline py-8 border-b border-white/10 group cursor-default">
            <span class="text-[clamp(48px,8vw,120px)] font-black uppercase tracking-[-0.04em] leading-[0.92] text-[#ecfdf5] group-hover:text-[#34d399] transition-colors">TypeScript</span>
            <span class="text-[20px] text-[#a7c4b5] tabular-nums">80%</span>
          </div>
          <div class="reveal flex justify-between items-baseline py-8 border-b border-white/10 group cursor-default">
            <span class="text-[clamp(48px,8vw,120px)] font-black uppercase tracking-[-0.04em] leading-[0.92] text-[#ecfdf5] group-hover:text-[#34d399] transition-colors">Rust</span>
            <span class="text-[20px] text-[#a7c4b5] tabular-nums">70%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- About: Portrait as drop cap -->
    <section class="px-6 md:px-10 py-24 md:py-32">
      <div class="max-w-[1400px] mx-auto">
        <div class="md:ml-[16%] max-w-3xl">
          <img
            src="https://picsum.photos/id/1015/400/400"
            alt="Portrait"
            class="float-left w-[100px] h-[100px] md:w-[120px] md:h-[120px] object-cover rounded-2xl mr-5 mb-3 glass"
          />
          <p class="reveal text-[clamp(24px,2.5vw,38px)] leading-[1.2] text-[#ecfdf5]">
            Ringga Septia Pribadi builds software that ships. {{ profile.bio }}
          </p>
          <p class="reveal mt-6 text-[clamp(20px,2vw,28px)] leading-[1.3] text-[#a7c4b5]">
            Focused on Kotlin Multiplatform and Vue since 2020, with a bias for systems that run in production.
          </p>
        </div>
        <div class="mt-16 md:ml-[16%] grid grid-cols-3 gap-6 max-w-3xl">
          <div class="reveal glass-card p-5">
            <div class="text-sm text-[#a7c4b5]">Location</div>
            <div class="text-base text-[#ecfdf5] mt-1 font-medium">Indonesia</div>
          </div>
          <div class="reveal glass-card p-5">
            <div class="text-sm text-[#a7c4b5]">Since</div>
            <div class="text-base text-[#ecfdf5] mt-1 font-medium">2020</div>
          </div>
          <div class="reveal glass-card p-5">
            <div class="text-sm text-[#a7c4b5]">Email</div>
            <a :href="'mailto:' + profile.email" class="text-link text-base mt-1 inline-block">{{ profile.email }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA: One word is the button -->
    <a :href="'mailto:' + profile.email" class="block bg-gradient-to-br from-[#10b981] to-[#059669] no-underline group">
      <div class="min-h-[50svh] md:min-h-[60svh] flex flex-col justify-between p-6 md:p-10 max-w-[1400px] mx-auto">
        <div class="flex justify-between items-start">
          <p class="text-[#022c22] text-lg md:text-xl font-medium max-w-[30ch]">Open to freelance, collaborations, and full-time roles.</p>
          <svg class="w-10 h-10 md:w-12 md:h-12 text-[#022c22] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </div>
        <div class="text-[#022c22] font-black tracking-[-0.04em] leading-[0.82] text-[clamp(64px,24vw,360px)] text-center">
          HELLO
        </div>
      </div>
    </a>

    <!-- Footer: Invitation over cropped name -->
    <footer class="bg-[#ecfdf5] text-[#0a0f0d] min-h-[100svh] flex flex-col justify-between p-6 md:p-10 overflow-hidden">
      <div class="grid md:grid-cols-12 gap-8 max-w-[1400px] mx-auto w-full pt-10">
        <div class="md:col-span-7">
          <h3 class="text-[clamp(32px,5vw,72px)] font-light tracking-tight leading-[0.95] text-[#0a0f0d]">
            Let's work<br/>together.
          </h3>
          <a :href="'mailto:' + profile.email" class="btn-solid mt-6">Start a project</a>
        </div>
        <div class="md:col-span-3 space-y-3">
          <a :href="profile.github" target="_blank" rel="noopener" class="block text-[16px] text-[#0a0f0d] no-underline">GitHub</a>
          <a :href="profile.linkedin" target="_blank" rel="noopener" class="block text-[16px] text-[#0a0f0d] no-underline">LinkedIn</a>
          <a :href="'mailto:' + profile.email" class="block text-[16px] text-[#0a0f0d] no-underline">{{ profile.email }}</a>
        </div>
        <div class="md:col-span-2">
          <div class="text-[13px] text-[#0a0f0d]/60">© {{ new Date().getFullYear() }} Ringga Septia Pribadi</div>
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
import profile from "~/data/profile.json"
import projects from "~/data/projects.json"
import { ref } from 'vue'

const activeProject = ref(0)
const activeImageId = ref(1018)
const projectImages = [1018, 1015, 1016, 1019]
</script>