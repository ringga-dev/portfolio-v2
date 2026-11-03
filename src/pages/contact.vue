<template>
  <main class="max-w-3xl mx-auto px-6 py-12">
    <h1 class="text-4xl mb-2 text-[hsl(var(--accent))]">Contact</h1>
    <p class="text-[hsl(var(--muted))] mb-8 leading-relaxed">
      Have a project in mind or just want to say hi? Reach out through any of these.
    </p>

    <div class="glass p-8 mb-8">
      <h2 class="text-xl mb-4 text-[hsl(var(--accent))]">Get in touch</h2>
      <ul class="space-y-4">
        <li>
          <a
            :href="'mailto:' + profile.email"
            class="flex items-center gap-3 text-[hsl(var(--text))] hover:text-[hsl(var(--accent))] transition-colors"
          >
            <span class="text-[hsl(var(--muted))] w-20 text-sm">Email</span>
            <span>{{ profile.email }}</span>
          </a>
        </li>
        <li>
          <a
            :href="profile.github"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 text-[hsl(var(--text))] hover:text-[hsl(var(--accent))] transition-colors"
          >
            <span class="text-[hsl(var(--muted))] w-20 text-sm">GitHub</span>
            <span>{{ profile.github }}</span>
          </a>
        </li>
        <li>
          <a
            :href="profile.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 text-[hsl(var(--text))] hover:text-[hsl(var(--accent))] transition-colors"
          >
            <span class="text-[hsl(var(--muted))] w-20 text-sm">LinkedIn</span>
            <span>{{ profile.linkedin }}</span>
          </a>
        </li>
      </ul>
    </div>

    <div class="glass p-8">
      <h2 class="text-xl mb-4 text-[hsl(var(--accent))]">Send a message</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <input
          v-model="name"
          type="text"
          required
          placeholder="Your Name"
          class="w-full px-4 py-3 glass rounded"
        />
        <input
          v-model="email"
          type="email"
          required
          placeholder="email@example.com"
          class="w-full px-4 py-3 glass rounded"
        />
        <textarea
          v-model="message"
          required
          rows="5"
          placeholder="Drop your message here..."
          class="w-full px-4 py-3 glass rounded resize-y"
        ></textarea>
        <button type="submit" class="btn-primary">Send Message</button>
      </form>
    </div>
  </main>
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