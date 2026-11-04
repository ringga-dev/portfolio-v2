<template>
  <div class="min-h-screen bg-[#0b0f14] text-[#e6eaf0]">
    <!-- Top bar -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-[#0b0f14]/90 backdrop-blur-sm">
      <NuxtLink to="/" class="text-base font-bold tracking-tight text-[#e6eaf0] no-underline">R.S.P.</NuxtLink>
      <nav class="flex items-center gap-6 md:gap-8">
        <NuxtLink to="/about" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">About</NuxtLink>
        <NuxtLink to="/projects" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">Projects</NuxtLink>
        <NuxtLink to="/skills" class="text-sm text-[#8a93a3] hover:text-[#e6eaf0] transition-colors no-underline">Skills</NuxtLink>
        <NuxtLink to="/contact" class="text-sm text-[#10b981] font-semibold no-underline">Contact</NuxtLink>
      </nav>
    </header>

    <main class="pt-28 px-6 md:px-10 max-w-[1400px] mx-auto">
      <header class="mb-16">
        <h1 class="reveal text-[clamp(56px,10vw,140px)] font-black tracking-[-0.04em] leading-[0.85] text-[#e6eaf0]">
          Contact
        </h1>
        <p class="reveal mt-6 text-lg text-[#8a93a3] max-w-2xl">
          Have a project in mind or just want to say hi? Reach out through any of these.
        </p>
      </header>

      <div class="grid md:grid-cols-2 gap-12 md:gap-20 mb-24">
        <!-- Contact links -->
        <section class="reveal">
          <h2 class="text-2xl font-light text-[#e6eaf0] mb-8">Get in touch</h2>
          <div class="space-y-0">
            <div class="grid grid-cols-12 gap-4 py-6 border-b border-[#242c38]">
              <div class="col-span-3 text-[#8a93a3] text-base">Email</div>
              <div class="col-span-9">
                <a :href="'mailto:' + profile.email" class="text-link text-base">{{ profile.email }}</a>
              </div>
            </div>
            <div class="grid grid-cols-12 gap-4 py-6 border-b border-[#242c38]">
              <div class="col-span-3 text-[#8a93a3] text-base">GitHub</div>
              <div class="col-span-9">
                <a :href="profile.github" target="_blank" rel="noopener" class="text-link text-base">{{ profile.github }}</a>
              </div>
            </div>
            <div class="grid grid-cols-12 gap-4 py-6 border-b border-[#242c38]">
              <div class="col-span-3 text-[#8a93a3] text-base">LinkedIn</div>
              <div class="col-span-9">
                <a :href="profile.linkedin" target="_blank" rel="noopener" class="text-link text-base">{{ profile.linkedin }}</a>
              </div>
            </div>
          </div>
        </section>

        <!-- Form -->
        <section class="reveal">
          <h2 class="text-2xl font-light text-[#e6eaf0] mb-8">Send a message</h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <input
              v-model="name"
              type="text"
              required
              placeholder="Your Name"
              class="w-full px-4 py-3 bg-[#131922] border border-[#242c38] text-[#e6eaf0] placeholder-[#8a93a3] focus:border-[#10b981] focus:outline-none transition-colors"
            />
            <input
              v-model="email"
              type="email"
              required
              placeholder="email@example.com"
              class="w-full px-4 py-3 bg-[#131922] border border-[#242c38] text-[#e6eaf0] placeholder-[#8a93a3] focus:border-[#10b981] focus:outline-none transition-colors"
            />
            <textarea
              v-model="message"
              required
              rows="5"
              placeholder="Drop your message here..."
              class="w-full px-4 py-3 bg-[#131922] border border-[#242c38] text-[#e6eaf0] placeholder-[#8a93a3] focus:border-[#10b981] focus:outline-none transition-colors resize-y"
            ></textarea>
            <button type="submit" class="btn-solid w-full justify-center">Send Message</button>
          </form>
        </section>
      </div>
    </main>

    <!-- Footer (simplified) -->
    <footer class="bg-[#e6eaf0] text-[#0b0f14] p-6 md:p-10">
      <div class="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div class="text-sm font-semibold mb-3">Navigate</div>
          <div class="flex flex-wrap gap-4">
            <NuxtLink to="/" class="text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">Home</NuxtLink>
            <NuxtLink to="/about" class="text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">About</NuxtLink>
            <NuxtLink to="/projects" class="text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">Projects</NuxtLink>
            <NuxtLink to="/skills" class="text-sm text-[#0b0f14]/70 hover:text-[#0b0f14] no-underline">Skills</NuxtLink>
          </div>
        </div>
        <div class="text-center font-black tracking-[-0.04em] leading-[0.82] text-[clamp(40px,12vw,180px)] text-[#0b0f14]">
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