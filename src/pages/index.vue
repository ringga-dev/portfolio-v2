<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100">
    <!-- Hero -->
    <section class="px-6 pt-24 pb-20 max-w-5xl mx-auto">
      <h1 class="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
        Hi, I'm <span class="text-emerald-400">{{ profile.name }}</span>.
      </h1>
      <p class="mt-6 text-xl md:text-2xl text-zinc-300 max-w-2xl">
        {{ profile.tagline }}
      </p>
      <p class="mt-4 text-zinc-400 max-w-2xl leading-relaxed">
        {{ profile.bio }}
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a
          href="#projects"
          class="px-5 py-3 rounded-lg bg-emerald-500 text-zinc-950 font-semibold hover:bg-emerald-400 transition-colors"
        >
          View projects
        </a>
        <a
          :href="profile.github"
          target="_blank"
          rel="noopener"
          class="px-5 py-3 rounded-lg border border-zinc-700 text-zinc-100 hover:border-zinc-500 transition-colors"
        >
          GitHub
        </a>
      </div>
      <div class="mt-12 grid grid-cols-3 gap-6 max-w-md">
        <div v-for="s in profile.stats" :key="s.label">
          <div class="text-3xl font-bold text-emerald-400">{{ s.value }}</div>
          <div class="text-sm text-zinc-400 mt-1">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <!-- Projects -->
    <section id="projects" class="px-6 py-20 max-w-5xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold tracking-tight">Projects</h2>
      <p class="mt-3 text-zinc-400 max-w-2xl">
        Selected work I've designed and shipped end to end.
      </p>
      <div class="mt-10 grid gap-6 sm:grid-cols-2">
        <article
          v-for="(project, i) in projects"
          :key="project.title"
          class="rounded-xl p-6 transition-transform hover:-translate-y-1"
          :class="i === 0 ? 'bg-zinc-900/60 backdrop-blur border border-emerald-500/30' : 'bg-zinc-900 border border-zinc-800'"
        >
          <h3 class="text-xl font-semibold text-zinc-100">{{ project.title }}</h3>
          <p class="mt-2 text-zinc-400 leading-relaxed">{{ project.description }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="tag in project.tags"
              :key="tag"
              class="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-300"
            >
              {{ tag }}
            </span>
          </div>
          <a
            :href="project.link"
            target="_blank"
            rel="noopener"
            class="mt-5 inline-block text-emerald-400 text-sm font-medium hover:text-emerald-300"
          >
            View on GitHub →
          </a>
        </article>
      </div>
    </section>

    <!-- Skills -->
    <section class="px-6 py-20 max-w-5xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold tracking-tight">Skills</h2>
      <p class="mt-3 text-zinc-400 max-w-2xl">
        Tools and technologies I work with day to day.
      </p>
      <div class="mt-10 space-y-5 max-w-2xl">
        <div v-for="skill in skills.skills" :key="skill.name">
          <div class="flex justify-between mb-2">
            <span class="text-zinc-200 font-medium">{{ skill.name }}</span>
            <span class="text-zinc-400 text-sm">{{ skill.level }}%</span>
          </div>
          <div class="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              class="h-full rounded-full bg-emerald-500 transition-all"
              :style="{ width: skill.level + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="px-6 py-24 max-w-5xl mx-auto text-center">
      <h2 class="text-3xl md:text-5xl font-bold tracking-tight">
        Let's build something together.
      </h2>
      <p class="mt-4 text-zinc-400 max-w-xl mx-auto">
        I'm open to freelance work, collaborations, and full-time roles. Drop me a line.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a
          :href="'mailto:' + profile.email"
          class="px-6 py-3 rounded-lg bg-emerald-500 text-zinc-950 font-semibold hover:bg-emerald-400 transition-colors"
        >
          Email me
        </a>
        <a
          :href="profile.linkedin"
          target="_blank"
          rel="noopener"
          class="px-6 py-3 rounded-lg border border-zinc-700 text-zinc-100 hover:border-zinc-500 transition-colors"
        >
          LinkedIn
        </a>
      </div>
    </section>

    <footer class="px-6 py-8 border-t border-zinc-800 text-center text-sm text-zinc-500">
      © {{ new Date().getFullYear() }} {{ profile.name }}. Built with Nuxt.
    </footer>
  </div>
</template>

<script setup lang="ts">
import profile from "~/data/profile.json";
import projects from "~/data/projects.json";
import skills from "~/data/skills.json";
</script>
