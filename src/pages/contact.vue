<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-50 px-4 md:px-8 border-b border-[var(--line)] bg-[var(--surface-base)]" style="padding-top: max(0px, env(safe-area-inset-top))">
      <nav class="flex items-center justify-between py-3.5 max-w-[1200px] mx-auto">
        <NuxtLink to="/" class="text-base font-bold text-[var(--text-heading)] no-underline flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[var(--accent)]"></span>
          Nyawit
        </NuxtLink>
        <div class="flex items-center gap-5 md:gap-7">
          <NuxtLink to="/about" class="nav-link">About</NuxtLink>
          <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
          <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
          <NuxtLink to="/contact" class="btn-primary !py-2 !px-5 text-sm active">Contact</NuxtLink>
          <button class="btn-theme" @click="toggleTheme" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">{{ isDark ? '☀️' : '🌙' }}</button>
        </div>
      </nav>
    </header>

    <main class="pt-14 px-6 md:px-10 max-w-[1200px] mx-auto">
      <p class="text-xs font-semibold uppercase text-[var(--text-secondary)] mb-3">Get in touch</p>
      <h1 class="reveal font-bold leading-[1.05] text-[clamp(48px,6vw,88px)] text-[var(--text-heading)]">Contact</h1>
      <p class="reveal mt-3 text-[18px] font-medium text-[var(--text-primary)] max-w-2xl">Have a project in mind or just want to say hi? Reach out through any of these.</p>

      <div class="grid md:grid-cols-2 gap-6 mt-12 mb-24">
        <section class="reveal panel p-8">
          <h2 class="text-[18px] font-bold mb-6">Channels</h2>
          <div class="space-y-0">
            <div class="flex justify-between items-baseline py-4 border-b border-[var(--border-default)]">
              <span class="text-sm" style="color: var(--text-on-dark-muted)">Email</span>
              <a :href="'mailto:' + profile.email" class="text-link text-[15px]">{{ profile.email }}</a>
            </div>
            <div class="flex justify-between items-baseline py-4 border-b border-[var(--border-default)]">
              <span class="text-sm" style="color: var(--text-on-dark-muted)">GitHub</span>
              <a :href="profile.github" target="_blank" rel="noopener" class="text-link text-[15px]">{{ profile.github }}</a>
            </div>
          </div>
        </section>

        <section class="reveal panel p-8">
          <h2 class="text-[18px] font-bold mb-6">Send a message</h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <input v-model="name" type="text" required placeholder="Your Name" />
            <input v-model="email" type="email" required placeholder="email@example.com" />
            <textarea v-model="message" required rows="5" placeholder="Drop your message here..." class="resize-y"></textarea>
            <button type="submit" class="btn-primary w-full justify-center">Send Message</button>
          </form>
        </section>
      </div>
    </main>

    <footer style="background: var(--surface-overlay)">
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div class="text-base font-bold" style="color: var(--surface-base)">Nyawit</div>
          <div class="text-sm mt-1" style="color: var(--text-on-dark-muted)">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
        </div>
        <nav class="grid grid-cols-2 md:grid-cols-3 gap-x-10 gap-y-3">
          <NuxtLink to="/" class="text-sm" style="color: var(--text-on-dark-muted)">Home</NuxtLink>
          <NuxtLink to="/about" class="text-sm" style="color: var(--text-on-dark-muted)">About</NuxtLink>
          <NuxtLink to="/projects" class="text-sm" style="color: var(--text-on-dark-muted)">Projects</NuxtLink>
          <NuxtLink to="/skills" class="text-sm" style="color: var(--text-on-dark-muted)">Skills</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import profile from '~/data/profile.json'

const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
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