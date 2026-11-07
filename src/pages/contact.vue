<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-50 px-4 md:px-8 py-2" style="padding-top: max(8px, env(safe-area-inset-top))">
      <div class="relative">
        <LiquidGlass :width="navWidth" :height="64" :shape-width="navWidth" :shape-height="64" :shape-radius="32" :shape-roundness="5" />
        <nav class="absolute inset-0 flex items-center justify-between px-6">
          <NuxtLink to="/" class="text-base font-bold text-[var(--text-heading)] no-underline flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[var(--accent)]"></span>
            R.S.P.
          </NuxtLink>
          <div class="flex items-center gap-5 md:gap-7">
            <NuxtLink to="/about" class="nav-link">About</NuxtLink>
            <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
            <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
            <NuxtLink to="/contact" class="btn-primary !py-2 !px-5 text-sm active">Contact</NuxtLink>
            <button class="btn-theme" @click="toggleTheme" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">{{ isDark ? '☀️' : '🌙' }}</button>
          </div>
        </nav>
      </div>
    </header>

    <main class="pt-14 px-6 md:px-10 max-w-[1200px] mx-auto">
      <p class="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-3">Get in touch</p>
      <h1 class="reveal text-[48px] md:text-[72px] font-bold leading-[1.05] text-[var(--text-heading)]">Contact</h1>
      <p class="reveal mt-3 text-[18px] font-medium text-[var(--text-primary)] max-w-2xl">Have a project in mind or just want to say hi? Reach out through any of these.</p>

      <div class="grid md:grid-cols-2 gap-6 mt-12 mb-24">
        <section class="reveal glass-widget p-8">
          <h2 class="text-[18px] font-bold text-[var(--text-heading)] mb-6">Channels</h2>
          <div class="space-y-0">
            <div class="flex justify-between items-baseline py-4 border-b border-[var(--line)]">
              <span class="text-sm text-[var(--text-secondary)]">Email</span>
              <a :href="'mailto:' + profile.email" class="text-link text-[15px]">{{ profile.email }}</a>
            </div>
            <div class="flex justify-between items-baseline py-4 border-b border-[var(--line)]">
              <span class="text-sm text-[var(--text-secondary)]">GitHub</span>
              <a :href="profile.github" target="_blank" rel="noopener" class="text-link text-[15px]">{{ profile.github }}</a>
            </div>
            <div class="flex justify-between items-baseline py-4">
              <span class="text-sm text-[var(--text-secondary)]">LinkedIn</span>
              <a :href="profile.linkedin" target="_blank" rel="noopener" class="text-link text-[15px]">{{ profile.linkedin }}</a>
            </div>
          </div>
        </section>

        <section class="reveal glass-widget p-8">
          <h2 class="text-[18px] font-bold text-[var(--text-heading)] mb-6">Send a message</h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <input v-model="name" type="text" required placeholder="Your Name" />
            <input v-model="email" type="email" required placeholder="email@example.com" />
            <textarea v-model="message" required rows="5" placeholder="Drop your message here..." class="resize-y"></textarea>
            <button type="submit" class="btn-primary w-full justify-center">Send Message</button>
          </form>
        </section>
      </div>
    </main>

    <footer>
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-6 border-t border-[var(--line)]">
        <div>
          <div class="text-base font-bold text-[var(--text-heading)]">R.S.P.</div>
          <div class="text-sm text-[var(--text-secondary)] mt-1">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
        </div>
        <nav class="flex flex-wrap gap-6">
          <NuxtLink to="/" class="nav-link">Home</NuxtLink>
          <NuxtLink to="/about" class="nav-link">About</NuxtLink>
          <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
          <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LiquidGlass from '~/components/LiquidGlass.vue'
import profile from '~/data/profile.json'

const isDark = ref(false)
const navWidth = ref(typeof window !== 'undefined' ? window.innerWidth - 32 : 1200)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
  const update = () => { navWidth.value = window.innerWidth - 32 }
  update()
  window.addEventListener('resize', update)
})

const name = ref('')
const email = ref('')
const message = ref('')

function handleSubmit() {
  const subject = encodeURIComponent('Contact from ' + name.value)
  const body = encodeURIComponent(
    message.value + '\n\n— ' + name.value + ' (' + email.value + ')'
  )
  window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
}
</script>