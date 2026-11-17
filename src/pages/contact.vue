<template>
  <div>
    <section style="position: relative; min-height: 58dvh; display: flex; align-items: center; overflow: hidden;">
      <SpaceScene variant="mini" style="position: absolute; inset: 0; z-index: 0; opacity: 0.8;" />
      <div class="wrap" style="position: relative; z-index: 1; padding-block: 96px 56px;">
        <p class="eyebrow rise-in">Open channel</p>
        <h1 class="rise-in" style="font-size: clamp(52px, 10vw, 128px); margin-top: 16px;">Send a signal</h1>
        <p class="rise-in" style="font-size: clamp(17px, 2vw, 21px); color: var(--ink); max-width: 52ch; margin-top: 20px;">Open to freelance work, collaborations, and full-time roles. Pick a channel.</p>
      </div>
    </section>

    <section class="section" style="padding-top: 24px;">
      <div class="wrap" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        <a v-for="ch in channels" :key="ch.label" :href="ch.href" :target="ch.external ? '_blank' : undefined" rel="noopener" class="card reveal" style="padding: 28px; display: block;">
          <div style="font-family: var(--display); font-size: 13px; letter-spacing: 0.14em; color: var(--accent);">{{ ch.label }}</div>
          <div style="font-size: 17px; color: var(--ink); margin-top: 12px; word-break: break-word;">{{ ch.value }}</div>
          <div style="font-size: 13px; color: var(--muted); margin-top: 18px;">{{ ch.note }} →</div>
        </a>
      </div>
    </section>

    <section class="section" style="padding-top: 0;">
      <div class="wrap">
        <div class="panel reveal" style="padding: clamp(26px, 5vw, 44px); max-width: 720px;">
          <h2 style="font-size: 28px;">Write a message</h2>
          <p style="font-size: 14px;">This opens your email app with the message pre-filled — no form backend, no data stored.</p>
          <form @submit.prevent="handleSubmit" style="display: grid; gap: 14px; margin-top: 24px;">
            <label>
              <span style="display: block; font-size: 13px; color: var(--muted); margin-bottom: 7px;">Your name</span>
              <input v-model="name" type="text" required placeholder="Name" style="width: 100%; padding: 13px 16px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; color: var(--ink);" />
            </label>
            <label>
              <span style="display: block; font-size: 13px; color: var(--muted); margin-bottom: 7px;">Your email</span>
              <input v-model="email" type="email" required placeholder="you@example.com" style="width: 100%; padding: 13px 16px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; color: var(--ink);" />
            </label>
            <label>
              <span style="display: block; font-size: 13px; color: var(--muted); margin-bottom: 7px;">Message</span>
              <textarea v-model="message" required rows="5" placeholder="What are we building?" style="width: 100%; padding: 13px 16px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px; color: var(--ink); resize: vertical;"></textarea>
            </label>
            <button type="submit" class="btn-primary" style="justify-self: start; margin-top: 8px;">Open in email app →</button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import profile from '~/data/profile.json'

const channels = [
  { label: 'EMAIL', value: profile.email, href: 'mailto:' + profile.email, note: 'Direct line', external: false },
  { label: 'GITHUB', value: profile.github, href: profile.github, note: 'Repositories', external: true },
  { label: 'LINKEDIN', value: profile.linkedin, href: profile.linkedin, note: 'Professional profile', external: true },
]

const name = ref('')
const email = ref('')
const message = ref('')

function handleSubmit() {
  const subject = encodeURIComponent('Portfolio signal from ' + name.value)
  const body = encodeURIComponent(message.value + '\n\n— ' + name.value + ' (' + email.value + ')')
  window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
}

useSeoMeta({
  title: 'Contact — Ringga Septia Pribadi',
  description: 'Get in touch with Ringga Septia Pribadi for freelance work, collaborations, and full-time roles.',
})
</script>
