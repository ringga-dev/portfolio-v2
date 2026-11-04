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
        <NuxtLink to="/contact" class="btn-glass !py-2 !px-4 text-sm active">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-32 px-6 md:px-10 max-w-[1400px] mx-auto">
      <header class="mb-16">
        <h1 class="reveal text-[clamp(56px,10vw,140px)] font-black tracking-[-0.04em] leading-[0.85] text-[#ecfdf5]">
          Contact
        </h1>
        <p class="reveal mt-6 text-lg text-[#a7c4b5] max-w-2xl">
          Have a project in mind or just want to say hi? Reach out through any of these.
        </p>
      </header>

      <div class="grid md:grid-cols-2 gap-8 md:gap-12 mb-24">
        <!-- Contact links in glass -->
        <section class="reveal glass-strong rounded-2xl p-8">
          <h2 class="text-xl font-light text-[#ecfdf5] mb-8">Get in touch</h2>
          <div class="space-y-0">
            <div class="flex justify-between items-baseline py-5 border-b border-white/10">
              <span class="text-sm text-[#a7c4b5] w-20">Email</span>
              <a :href="'mailto:' + profile.email" class="text-link">{{ profile.email }}</a>
            </div>
            <div class="flex justify-between items-baseline py-5 border-b border-white/10">
              <span class="text-sm text-[#a7c4b5] w-20">GitHub</span>
              <a :href="profile.github" target="_blank" rel="noopener" class="text-link">{{ profile.github }}</a>
            </div>
            <div class="flex justify-between items-baseline py-5">
              <span class="text-sm text-[#a7c4b5] w-20">LinkedIn</span>
              <a :href="profile.linkedin" target="_blank" rel="noopener" class="text-link">{{ profile.linkedin }}</a>
            </div>
          </div>
        </section>

        <!-- Form in glass -->
        <section class="reveal glass-strong rounded-2xl p-8">
          <h2 class="text-xl font-light text-[#ecfdf5] mb-8">Send a message</h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <input
              v-model="name"
              type="text"
              required
              placeholder="Your Name"
              class="w-full"
            />
            <input
              v-model="email"
              type="email"
              required
              placeholder="email@example.com"
              class="w-full"
            />
            <textarea
              v-model="message"
              required
              rows="5"
              placeholder="Drop your message here..."
              class="w-full resize-y"
            ></textarea>
            <button type="submit" class="btn-solid w-full justify-center">Send Message</button>
          </form>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-[#ecfdf5] text-[#0a0f0d] min-h-[100svh] flex flex-col justify-between p-6 md:p-10 overflow-hidden">
      <div class="grid md:grid-cols-12 gap-8 max-w-[1400px] mx-auto w-full pt-10">
        <div class="md:col-span-7">
          <h3 class="text-[clamp(32px,5vw,72px)] font-light tracking-tight leading-[0.95] text-[#0a0f0d]">
            Let's work<br/>together.
          </h3>
          <a :href="'mailto:' + profile.email" class="btn-solid mt-6">Start a project</a>
        </div>
        <div class="md:col-span-3 space-y-3">
          <NuxtLink to="/" class="block text-[16px] text-[#0a0f0d] no-underline">Home</NuxtLink>
          <NuxtLink to="/about" class="block text-[16px] text-[#0a0f0d] no-underline">About</NuxtLink>
          <NuxtLink to="/projects" class="block text-[16px] text-[#0a0f0d] no-underline">Projects</NuxtLink>
          <NuxtLink to="/skills" class="block text-[16px] text-[#0a0f0d] no-underline">Skills</NuxtLink>
        </div>
        <div class="md:col-span-2">
          <div class="text-[13px] text-[#0a0f0d]/60">© {{ new Date().getFullYear() }}</div>
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