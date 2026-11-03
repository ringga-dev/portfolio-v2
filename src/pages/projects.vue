<template>
  <main class="max-w-5xl mx-auto px-6 py-12">
    <header class="mb-10">
      <h1 class="text-4xl mb-2 text-[hsl(var(--text))]">Projects</h1>
      <p class="text-[hsl(var(--muted))]">Selected work and open-source contributions.</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="p in projects.projects"
        :key="p.slug"
        class="glass p-6 rounded-2xl flex flex-col gap-4"
      >
        <h2 class="text-xl font-semibold text-[hsl(var(--text))]">{{ p.title }}</h2>
        <p class="text-[hsl(var(--muted))] leading-relaxed text-sm flex-1">{{ p.description }}</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="t in p.tech"
            :key="t"
            class="text-xs px-2.5 py-1 rounded-full border border-[hsl(var(--border))] text-[hsl(var(--muted))]"
          >
            {{ t }}
          </span>
        </div>
        <a
          :href="p.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-[hsl(var(--accent))] font-medium hover:underline self-start"
        >
          View on GitHub
        </a>
      </article>
    </div>
  </main>
</template>

<script setup>
import projects from '~/data/projects.json'
</script>