<template>
  <div class="min-h-screen bg-[#171717] text-[#fafafa]">
    <!-- Top bar -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#171717] border-b border-[#242424]">
      <NuxtLink to="/" class="text-sm font-medium text-[#fafafa] no-underline">R.S.P.</NuxtLink>
      <nav class="flex items-center gap-8">
        <NuxtLink to="/about" class="nav-link">About</NuxtLink>
        <NuxtLink to="/projects" class="nav-link">Projects</NuxtLink>
        <NuxtLink to="/skills" class="nav-link">Skills</NuxtLink>
        <NuxtLink to="/contact" class="btn-pill active">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-28 px-6 max-w-[1400px] mx-auto">
      <header class="mb-16">
        <h1 class="reveal text-[72px] font-normal leading-[1.00] tracking-tight text-[#fafafa]">
          Contact
        </h1>
        <p class="reveal mt-4 text-[16px] text-[#b4b4b4]">
          Have a project in mind or just want to say hi? Reach out through any of these.
        </p>
      </header>

      <div class="grid md:grid-cols-2 gap-12 md:gap-20 mb-24">
        <!-- Contact links -->
        <section class="reveal">
          <h2 class="tech-label mb-6">Get in touch</h2>
          <div class="space-y-0">
            <div class="flex justify-between items-baseline py-6 border-b border-[#242424]">
              <span class="text-[16px] text-[#898989] w-[120px]">Email</span>
              <a :href="'mailto:' + profile.email" class="text-[16px] text-[#00c573] hover:text-[#3ecf8e] no-underline">{{ profile.email }}</a>
            </div>
            <div class="flex justify-between items-baseline py-6 border-b border-[#242424]">
              <span class="text-[16px] text-[#898989] w-[120px]">GitHub</span>
              <a :href="profile.github" target="_blank" rel="noopener" class="text-[16px] text-[#00c573] hover:text-[#3ecf8e] no-underline">{{ profile.github }}</a>
            </div>
            <div class="flex justify-between items-baseline py-6 border-b border-[#242424]">
              <span class="text-[16px] text-[#898989] w-[120px]">LinkedIn</span>
              <a :href="profile.linkedin" target="_blank" rel="noopener" class="text-[16px] text-[#00c573] hover:text-[#3ecf8e] no-underline">{{ profile.linkedin }}</a>
            </div>
          </div>
        </section>

        <!-- Form -->
        <section class="reveal">
          <h2 class="tech-label mb-6">Send a message</h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <input
              v-model="name"
              type="text"
              required
              placeholder="Your Name"
              class="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2e2e2e] rounded-[8px] text-[#fafafa] placeholder-[#898989] focus:border-[#3ecf8e] focus:outline-none transition-colors text-[16px]"
            />
            <input
              v-model="email"
              type="email"
              required
              placeholder="email@example.com"
              class="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2e2e2e] rounded-[8px] text-[#fafafa] placeholder-[#898989] focus:border-[#3ecf8e] focus:outline-none transition-colors text-[16px]"
            />
            <textarea
              v-model="message"
              required
              rows="5"
              placeholder="Drop your message here..."
              class="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2e2e2e] rounded-[8px] text-[#fafafa] placeholder-[#898989] focus:border-[#3ecf8e] focus:outline-none transition-colors text-[16px] resize-y"
            ></textarea>
            <button type="submit" class="btn-pill w-full justify-center">Send Message</button>
          </form>
        </section>
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
            <NuxtLink to="/projects" class="block text-[15px] text-[#171717] no-underline">Projects</NuxtLink>
            <NuxtLink to="/skills" class="block text-[15px] text-[#171717] no-underline">Skills</NuxtLink>
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