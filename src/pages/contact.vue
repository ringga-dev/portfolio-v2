<template>
  <div class="min-h-screen">
    <header class="glass-nav px-6 py-3.5 flex items-center justify-between">
      <NuxtLink to="/" class="text-base font-extrabold tracking-tight text-[#1a2420] no-underline flex items-center gap-2.5">
        <span class="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.6)]"></span>
        R.S.P.
      </NuxtLink>
      <nav class="flex items-center gap-5 md:gap-7">
        <NuxtLink to="/about" class="nav-link">About</NuxtLink>
        <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
        <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
        <NuxtLink to="/contact" class="btn-jelly !py-2 !px-5 text-sm active">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-14 px-6 md:px-10 max-w-[1200px] mx-auto">
      <p class="text-sm text-[#047857] font-bold tracking-widest uppercase mb-3">Get in touch</p>
      <h1 class="reveal text-5xl md:text-6xl font-black tracking-tight text-[#1a2420]">Contact</h1>
      <p class="reveal mt-3 text-lg text-[#6b7d73] max-w-2xl">Have a project in mind or just want to say hi? Reach out through any of these.</p>

      <div class="grid md:grid-cols-2 gap-6 mt-12 mb-24">
        <section class="reveal glass-widget p-8">
          <h2 class="text-xl font-bold text-[#1a2420] mb-6">Channels</h2>
          <div class="space-y-0">
            <div class="flex justify-between items-baseline py-4 border-b border-[#1a2420]/10">
              <span class="text-sm text-[#6b7d73]">Email</span>
              <a :href="'mailto:' + profile.email" class="text-link">{{ profile.email }}</a>
            </div>
            <div class="flex justify-between items-baseline py-4 border-b border-[#1a2420]/10">
              <span class="text-sm text-[#6b7d73]">GitHub</span>
              <a :href="profile.github" target="_blank" rel="noopener" class="text-link">{{ profile.github }}</a>
            </div>
            <div class="flex justify-between items-baseline py-4">
              <span class="text-sm text-[#6b7d73]">LinkedIn</span>
              <a :href="profile.linkedin" target="_blank" rel="noopener" class="text-link">{{ profile.linkedin }}</a>
            </div>
          </div>
        </section>

        <section class="reveal glass-widget p-8">
          <h2 class="text-xl font-bold text-[#1a2420] mb-6">Send a message</h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <input v-model="name" type="text" required placeholder="Your Name" />
            <input v-model="email" type="email" required placeholder="email@example.com" />
            <textarea v-model="message" required rows="5" placeholder="Drop your message here..." class="resize-y"></textarea>
            <button type="submit" class="btn-accent w-full justify-center">Send Message</button>
          </form>
        </section>
      </div>
    </main>

    <footer>
      <div class="max-w-[1200px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-6 border-t border-[#1a2420]/10">
        <div>
          <div class="text-base font-extrabold text-[#1a2420]">R.S.P.</div>
          <div class="text-sm text-[#6b7d73] mt-1">© {{ new Date().getFullYear() }} {{ profile.name }}</div>
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
import profile from '~/data/profile.json'

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