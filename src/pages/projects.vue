<template>
  <div class="min-h-screen bg-[#171717] text-[#fafafa]">
    <!-- Top bar -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#171717] border-b border-[#242424]">
      <NuxtLink to="/" class="text-sm font-medium text-[#fafafa] no-underline">R.S.P.</NuxtLink>
      <nav class="flex items-center gap-8">
        <NuxtLink to="/about" class="nav-link">About</NuxtLink>
        <NuxtLink to="/projects" class="nav-link active">Projects</NuxtLink>
        <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
        <NuxtLink to="/contact" class="btn-pill">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-28 px-6 max-w-[1400px] mx-auto">
      <header class="mb-16">
        <h1 class="reveal text-[72px] font-normal leading-[1.00] tracking-tight text-[#fafafa]">
          Projects
        </h1>
        <p class="reveal mt-4 text-[16px] text-[#b4b4b4]">
          Selected work and open-source contributions.
        </p>
      </header>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        <article
          v-for="p in projects.projects"
          :key="p.slug"
          class="reveal bg-[#171717] border border-[#2e2e2e] rounded-[16px] p-6 hover:border-[#363636] transition-colors"
        >
          <div class="mb-4">
            <img
              :src="`https://picsum.photos/seed/${p.slug}/800/500`"
              :alt="p.title"
              class="w-full h-[200px] object-cover rounded-[8px]"
              loading="lazy"
            />
          </div>
          <h2 class="text-[24px] font-normal leading-[1.33] tracking-[-0.16px] text-[#fafafa] mb-2">{{ p.title }}</h2>
          <p class="text-[14px] text-[#898989] leading-[1.43] mb-4">{{ p.description }}</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="t in p.tech"
              :key="t"
              class="text-[12px] px-2 py-1 border border-[#2e2e2e] rounded-md text-[#b4b4b4]"
            >
              {{ t }}
            </span>
          </div>
          <a :href="p.url" target="_blank" rel="noopener" class="text-[14px] text-[#00c573] hover:text-[#3ecf8e] no-underline">
            View on GitHub
          </a>
        </article>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-[#fafafa] text-[#171717] min-h-[100svh] flex flex-col justify-between p-6 md:p-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-[1400px] mx-auto w-full pt-10">
        <div>
          <div class="tech-label mb-3">Navigate</div>
          <div class="space-y-2">
            <NuxtLink to="/" class="block text-[15px] text-[#171717] no-underline">Home</NuxtLink>
            <NuxtLink to="/about" class="block text-[15px] text-[#171717] no-underline">About</NuxtLink>
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
          <a :href="'mailto:' + profile.email" class="block text-[15px] text-[#171717] no-underline">{{ profile.email }}</a>
        </div>
        <div>
          <div class="tech-label mb-3">Legal</div>
          <div class="text-[15px] text-[#171717]">© {{ new Date().getFullYear() }}</div>
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
import projects from '~/data/projects.json'
import profile from '~/data/profile.json'
</script>