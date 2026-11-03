<template>
  <main>
    <!-- Hero -->
    <section class="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-[hsl(var(--accent)/0.05)] to-transparent"></div>
      <div class="max-w-5xl mx-auto px-6 text-center relative z-10">
        <div class="glass inline-block px-4 py-2 mb-6 text-sm text-[hsl(var(--muted))]">
          Multi-Platform Engineer
        </div>
        <h1 class="text-6xl md:text-8xl mb-6">
          <span class="text-gradient">Ringga Dev</span>
        </h1>
        <p class="text-xl text-[hsl(var(--muted))] mb-10 max-w-2xl mx-auto leading-relaxed">
          I build mobile, web, and desktop applications with Kotlin and Vue. Specialized in Kotlin Multiplatform, Jetpack Compose, and system-level integrations.
        </p>
        <div class="flex gap-4 justify-center">
          <a href="https://github.com/ringga-dev" class="btn-primary">GitHub</a>
          <NuxtLink to="/projects" class="btn-secondary">View Projects</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Projects -->
    <section class="max-w-5xl mx-auto px-6 py-24">
      <h2 class="text-4xl mb-12 text-center">Featured <span class="text-gradient">Projects</span></h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div v-for="p in projects.projects.slice(0, 2)" :key="p.slug" class="glass p-8 card-hover">
          <h3 class="text-2xl mb-3 text-[hsl(var(--accent))]">{{ p.title }}</h3>
          <p class="text-[hsl(var(--muted))] mb-6 leading-relaxed">{{ p.description }}</p>
          <div class="flex flex-wrap gap-2 mb-6">
            <span v-for="t in p.tech" :key="t" class="text-xs px-3 py-1 glass rounded-full">{{ t }}</span>
          </div>
          <a :href="p.url" class="text-[hsl(var(--accent))] font-medium hover:underline">View on GitHub →</a>
        </div>
      </div>
      <div class="text-center mt-12">
        <NuxtLink to="/projects" class="btn-secondary">All Projects</NuxtLink>
      </div>
    </section>

    <!-- Skills -->
    <section class="max-w-5xl mx-auto px-6 py-24">
      <h2 class="text-4xl mb-12 text-center">Tech <span class="text-gradient">Stack</span></h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="s in skills.skills" :key="s.name" class="glass p-6 text-center card-hover">
          <div class="text-2xl font-bold text-[hsl(var(--accent))] mb-2">{{ s.level }}%</div>
          <div class="text-[hsl(var(--muted))]">{{ s.name }}</div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import projects from '~/data/projects.json'
import skills from '~/data/skills.json'
</script>