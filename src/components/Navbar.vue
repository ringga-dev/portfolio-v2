<template>
  <nav class="sticky top-0 z-50 glass rounded-none border-t-0 border-x-0">
    <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="font-bold text-lg text-[hsl(var(--accent))]">
        Ringga Dev
      </NuxtLink>
      <div class="flex gap-6 text-sm">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="text-[hsl(var(--muted))] hover:text-[hsl(var(--accent))] transition-colors"
          active-class="text-[hsl(var(--accent))]"
        >
          {{ link.label }}
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/contact', label: 'Contact' },
]
</script>