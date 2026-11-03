<template>
  <main class="max-w-5xl mx-auto px-6 py-12">
    <h1 class="text-4xl mb-8 text-[hsl(var(--accent))]">Contact</h1>
    <div class="glass p-8 mb-8">
      <p class="text-[hsl(var(--muted))] mb-4">Feel free to reach out:</p>
      <div class="space-y-3">
        <a :href="'mailto:' + profile.email" class="block text-[hsl(var(--accent))] hover:underline">{{ profile.email }}</a>
        <a :href="profile.github" target="_blank" class="block text-[hsl(var(--accent))] hover:underline">GitHub</a>
        <a :href="profile.linkedin" target="_blank" class="block text-[hsl(var(--accent))] hover:underline">LinkedIn</a>
      </div>
    </div>
    <div class="glass p-8">
      <p class="text-[hsl(var(--muted))] text-sm mb-4">Or send a message:</p>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <input v-model="name" type="text" placeholder="Name" class="w-full px-4 py-2 glass rounded" />
        <input v-model="email" type="email" placeholder="Email" class="w-full px-4 py-2 glass rounded" />
        <textarea v-model="message" placeholder="Message" rows="4" class="w-full px-4 py-2 glass rounded"></textarea>
        <button type="submit" class="btn-primary">Send</button>
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
  const body = encodeURIComponent(message.value + '\n\nFrom: ' + email.value)
  window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
}
</script>