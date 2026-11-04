<template>
  <div class="min-h-screen bg-[#0b0f14] text-[#e6eaf0]">
    <!-- Top bar -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[#0b0f14]/90 backdrop-blur-sm">
      <NuxtLink to="/" class="text-base font-bold tracking-tight text-[#e6eaf0] no-underline">R.S.P.</NuxtLink>
      <nav class="flex items-center gap-6 md:gap-8">
        <NuxtLink to="/about" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">About</NuxtLink>
        <NuxtLink to="/projects" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">Projects</NuxtLink>
        <NuxtLink to="/skills" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">Skills</NuxtLink>
        <NuxtLink to="/contact" class="text-sm text-[#10b981] font-semibold hover:text-[#0da271] transition-colors no-underline">Contact</NuxtLink>
      </nav>
    </header>

    <!-- Hero: name as monument -->
    <section class="min-h-screen flex flex-col justify-center px-6 md:px-10 pt-24 pb-16 relative">
      <div class="max-w-[1400px] w-full mx-auto">
        <h1 class="font-black tracking-[-0.04em] leading-[0.82] text-[clamp(56px,15vw,230px)]">
          <span class="masked-line"><span class="text-[#e6eaf0]">RINGGA</span></span>
          <span class="masked-line"><span class="text-[#8a93a3]">SEPTIA PRIBADI</span></span>
        </h1>
        <div class="mt-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <p class="fade-up text-lg md:text-xl text-[#8a93a3] max-w-md leading-relaxed">
            {{ profile.tagline }}
          </p>
          <div class="fade-up">
            <a :href="'mailto:' + profile.email" class="btn-solid">Get in touch</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Intro: title, note, facts row -->
    <section class="px-6 md:px-10 py-24 md:py-32 bg-[#0b0f14] border-t border-[#242c38]">
      <div class="max-w-[1400px] mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <h2 class="reveal text-[clamp(44px,5vw,76px)] font-light tracking-tight leading-[1.05] text-[#e6eaf0] max-w-[12ch]">
            What I do
          </h2>
          <p class="reveal text-base text-[#8a93a3] max-w-[260px] leading-relaxed">
            I build mobile, web, and desktop applications with Kotlin and Vue, end to end.
          </p>
        </div>
        <div class="mt-16 flex flex-wrap justify-between gap-8 md:gap-12">
          <div class="reveal">
            <div class="text-[clamp(28px,3vw,44px)] font-light text-[#e6eaf0]">{{ profile.stats[0].value }}</div>
            <div class="text-sm text-[#8a93a3] mt-1">{{ profile.stats[0].label }}</div>
          </div>
          <div class="reveal">
            <div class="text-[clamp(28px,3vw,44px)] font-light text-[#e6eaf0]">{{ profile.stats[1].value }}</div>
            <div class="text-sm text-[#8a93a3] mt-1">{{ profile.stats[1].label }}</div>
          </div>
          <div class="reveal">
            <div class="text-[clamp(28px,3vw,44px)] font-light text-[#e6eaf0]">{{ profile.stats[2].value }}</div>
            <div class="text-sm text-[#8a93a3] mt-1">{{ profile.stats[2].label }}</div>
          </div>
          <div class="reveal">
            <div class="text-[clamp(28px,3vw,44px)] font-light text-[#e6eaf0]">Indonesia</div>
            <div class="text-sm text-[#8a93a3] mt-1">Based in</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Work: giant title, uneven wall -->
    <section class="px-6 md:px-10 py-24 md:py-32 bg-[#131922] border-t border-[#242c38]">
      <div class="max-w-[1400px] mx-auto">
        <div class="flex items-baseline justify-between mb-12">
          <h2 class="reveal text-[clamp(64px,9vw,136px)] font-black uppercase tracking-tight leading-[0.9] text-[#e6eaf0]">
            Work
          </h2>
          <NuxtLink to="/projects" class="reveal text-link text-base">Full archive</NuxtLink>
        </div>
        <div class="flex flex-wrap gap-2">
          <div class="reveal w-full md:w-[calc(50%-4px)]">
            <div class="tile h-[280px] md:h-[360px]">
              <img src="https://picsum.photos/id/228/1200/800" alt="System Monitor project" class="w-full h-full object-cover" />
            </div>
            <div class="tile-caption">
              <span class="name">System Monitor</span>
              <span class="year">2024</span>
            </div>
          </div>
          <div class="reveal w-full md:w-[calc(33%-6px)]">
            <div class="tile h-[240px] md:h-[300px]">
              <img src="https://picsum.photos/id/266/900/600" alt="Pancing Bot" class="w-full h-full object-cover" />
            </div>
            <div class="tile-caption">
              <span class="name">Pancing Bot</span>
              <span class="year">2024</span>
            </div>
          </div>
          <div class="reveal w-full md:w-[calc(33%-6px)]">
            <div class="tile h-[240px] md:h-[300px]">
              <img src="https://picsum.photos/id/994/900/600" alt="KMP Printer" class="w-full h-full object-cover" />
            </div>
            <div class="tile-caption">
              <span class="name">KMP Printer</span>
              <span class="year">2024</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills: statement, table pushed right -->
    <section class="px-6 md:px-10 py-24 md:py-32 bg-[#0b0f14] border-t border-[#242c38]">
      <div class="max-w-[1400px] mx-auto">
        <h2 class="reveal text-[clamp(40px,4.5vw,68px)] font-light tracking-tight leading-[0.98] text-[#e6eaf0] max-w-[20ch]">
          Tools I use every day
        </h2>
        <div class="mt-24 md:ml-[30%]">
          <div class="reveal grid grid-cols-12 gap-4 py-4 border-b border-[#242c38]">
            <div class="col-span-4 text-[#8a93a3] text-base">Mobile</div>
            <div class="col-span-8 text-[#e6eaf0] text-base font-medium">Kotlin · Jetpack Compose · KMP</div>
          </div>
          <div class="reveal grid grid-cols-12 gap-4 py-4 border-b border-[#242c38]">
            <div class="col-span-4 text-[#8a93a3] text-base">Web</div>
            <div class="col-span-8 text-[#e6eaf0] text-base font-medium">Vue / Nuxt · TypeScript · Tailwind</div>
          </div>
          <div class="reveal grid grid-cols-12 gap-4 py-4 border-b border-[#242c38]">
            <div class="col-span-4 text-[#8a93a3] text-base">Backend</div>
            <div class="col-span-8 text-[#e6eaf0] text-base font-medium">Rust · Axum · PostgreSQL</div>
          </div>
          <div class="reveal grid grid-cols-12 gap-4 py-4 border-b border-[#242c38]">
            <div class="col-span-4 text-[#8a93a3] text-base">DevOps</div>
            <div class="col-span-8 text-[#e6eaf0] text-base font-medium">Docker · GitHub Actions · CI/CD</div>
          </div>
        </div>
      </div>
    </section>

    <!-- About: portrait as drop cap -->
    <section class="px-6 md:px-10 py-24 md:py-32 bg-[#131922] border-t border-[#242c38]">
      <div class="max-w-[1400px] mx-auto">
        <div class="md:ml-[16%] max-w-3xl">
          <img
            src="https://picsum.photos/id/842/400/400"
            alt="Portrait"
            class="float-left w-[100px] h-[100px] md:w-[120px] md:h-[120px] object-cover mr-4 mb-2"
          />
          <p class="reveal text-[clamp(24px,2.5vw,38px)] leading-[1.2] text-[#e6eaf0]">
            Ringga Septia Pribadi builds software that ships. {{ profile.bio }}
          </p>
          <p class="reveal mt-6 text-[clamp(20px,2vw,28px)] leading-[1.3] text-[#8a93a3]">
            Focused on Kotlin Multiplatform and Vue since 2020, with a bias for systems that run in production.
          </p>
        </div>
        <div class="mt-16 md:ml-[16%] grid grid-cols-3 gap-6 max-w-3xl">
          <div class="reveal">
            <div class="text-sm text-[#8a93a3]">Location</div>
            <div class="text-base text-[#e6eaf0] mt-1">Indonesia</div>
          </div>
          <div class="reveal">
            <div class="text-sm text-[#8a93a3]">Since</div>
            <div class="text-base text-[#e6eaf0] mt-1">2020</div>
          </div>
          <div class="reveal">
            <div class="text-sm text-[#8a93a3]">Email</div>
            <a :href="'mailto:' + profile.email" class="text-link text-base mt-1 inline-block">{{ profile.email }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA: one word is the button -->
    <a :href="'mailto:' + profile.email" class="block bg-[#10b981] hover:bg-[#0da271] transition-colors no-underline group">
      <div class="min-h-[46svh] md:min-h-[60svh] flex flex-col justify-between p-6 md:p-10 max-w-[1400px] mx-auto">
        <div class="flex justify-between items-start">
          <p class="text-[#062e22] text-lg md:text-xl font-medium max-w-[30ch]">Open to freelance, collaborations, and full-time roles.</p>
          <svg class="w-10 h-10 md:w-12 md:h-12 text-[#062e22] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </div>
        <div class="text-[#062e22] font-black tracking-[-0.04em] leading-[0.82] text-[clamp(64px,24vw,360px)] text-center">
          HELLO
        </div>
      </div>
    </a>

    <!-- Footer: columns above, wordmark below -->
    <footer class="bg-[#e6eaf0] text-[#0b0f14] min-h-[100svh] flex flex-col justify-between p-6 md:p-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-[1400px] mx-auto w-full pt-10">
        <div>
          <div class="text-sm font-semibold mb-3">Navigate</div>
          <div class="space-y-2">
            <NuxtLink to="/about" class="block text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">About</NuxtLink>
            <NuxtLink to="/projects" class="block text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">Projects</NuxtLink>
            <NuxtLink to="/skills" class="block text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">Skills</NuxtLink>
            <NuxtLink to="/contact" class="block text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">Contact</NuxtLink>
          </div>
        </div>
        <div>
          <div class="text-sm font-semibold mb-3">Social</div>
          <div class="space-y-2">
            <a :href="profile.github" target="_blank" rel="noopener" class="block text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">GitHub</a>
            <a :href="profile.linkedin" target="_blank" rel="noopener" class="block text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">LinkedIn</a>
          </div>
        </div>
        <div>
          <div class="text-sm font-semibold mb-3">Contact</div>
          <div class="space-y-2">
            <a :href="'mailto:' + profile.email" class="block text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">{{ profile.email }}</a>
          </div>
        </div>
        <div>
          <div class="text-sm font-semibold mb-3">Legal</div>
          <div class="text-sm text-[#0b0f14]/70">© {{ new Date().getFullYear() }} Ringga Septia Pribadi</div>
        </div>
      </div>
      <div class="mt-24 max-w-[1400px] mx-auto w-full">
        <div class="text-center font-black tracking-[-0.04em] leading-[0.82] text-[clamp(40px,12vw,180px)] text-[#0b0f14]">
          RINGGA
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import profile from "~/data/profile.json"
</script>