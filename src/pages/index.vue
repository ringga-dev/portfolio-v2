<template>
  <div>
    <!-- Hero -->
    <section class="min-h-[88vh] flex items-center relative overflow-hidden">
      <div class="max-w-5xl mx-auto px-6 py-20 w-full">
        <h1 class="text-5xl md:text-7xl font-semibold leading-tight mb-6">
          <span class="text-gradient">{{ profile.name }}</span>
        </h1>
        <p class="text-2xl md:text-3xl text-[hsl(var(--text))] mb-4 max-w-3xl leading-snug">
          {{ profile.title }}
        </p>
        <p class="text-lg text-[hsl(var(--muted))] mb-10 max-w-2xl leading-relaxed">
          {{ profile.bio }}
        </p>
        <div class="flex flex-wrap gap-4">
          <a :href="profile.github" class="btn-primary">GitHub</a>
          <NuxtLink to="/projects" class="btn-secondary">View Projects</NuxtLink>
          <NuxtLink to="/contact" class="btn-secondary">Contact</NuxtLink>
        </div>
      </div>
    </section>

    <!-- About snippet -->
    <section class="max-w-5xl mx-auto px-6 py-16">
      <div class="glass p-8 md:p-12 rounded-2xl">
        <h2 class="text-3xl md:text-4xl font-semibold mb-6">
          About <span class="text-gradient">Me</span>
        </h2>
        <p class="text-[hsl(var(--muted))] leading-relaxed mb-6 max-w-3xl">
          {{ profile.bio }} Based in {{ profile.location }}. I work across mobile, web, and desktop, with a focus on performance and clean architecture.
        </p>
        <NuxtLink to="/about" class="text-[hsl(var(--accent))] font-medium hover:underline">Learn more</NuxtLink>
      </div>
    </section>

    <!-- Featured projects -->
    <section class="max-w-5xl mx-auto px-6 py-16">
      <div class="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <h2 class="text-3xl md:text-4xl font-semibold">
          Featured <span class="text-gradient">Projects</span>
        </h2>
        <NuxtLink to="/projects" class="text-[hsl(var(--accent))] font-medium hover:underline">All projects</NuxtLink>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article
          v-for="p in projects.projects"
          :key="p.slug"
          class="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col gap-4"
        >
          <h3 class="text-xl font-semibold text-[hsl(var(--text))]">{{ p.title }}</h3>
          <p class="text-[hsl(var(--muted))] leading-relaxed flex-1">{{ p.description }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="t in p.tech"
              :key="t"
              class="text-xs px-2.5 py-1 rounded-full border border-[hsl(var(--border))] text-[hsl(var(--muted))]"
            >
              {{ t }}
            </span>
          </div>
          <a :href="p.url" class="text-[hsl(var(--accent))] font-medium hover:underline self-start">
            View on GitHub
          </a>
        </article>
      </div>
    </section>

    <!-- Skills -->
    <section class="max-w-5xl mx-auto px-6 py-16">
      <h2 class="text-3xl md:text-4xl font-semibold mb-10">
        Tech <span class="text-gradient">Stack</span>
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="s in skills.skills"
          :key="s.name"
          class="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="font-medium text-[hsl(var(--text))]">{{ s.name }}</span>
            <span class="text-sm text-[hsl(var(--muted))]">{{ s.level }}%</span>
          </div>
          <div class="h-2 rounded-full bg-[hsl(var(--border))] overflow-hidden">
            <div
              class="h-full rounded-full bg-[hsl(var(--accent))]"
              :style="{ width: s.level + '%' }"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="max-w-5xl mx-auto px-6 py-20">
      <div class="glass p-8 md:p-12 rounded-2xl text-center">
        <h2 class="text-3xl md:text-4xl font-semibold mb-4">
          Let's <span class="text-gradient">Work Together</span>
        </h2>
        <p class="text-[hsl(var(--muted))] mb-8 max-w-xl mx-auto leading-relaxed">
          Have a project in mind or just want to say hi? I'm always open to new opportunities.
        </p>
        <div class="flex flex-wrap gap-4 justify-center">
          <NuxtLink to="/contact" class="btn-primary">Get in Touch</NuxtLink>
          <a :href="profile.github" class="btn-secondary">GitHub</a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import profile from '~/data/profile.json'
import projects from '~/data/projects.json'
import skills from '~/data/skills.json'
</script>
