<template>
  <nav class="fixed top-0 w-full z-50 glass border-b-0 rounded-none">
    <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="font-bold text-lg text-[hsl(var(--accent))]">Ringga Dev</NuxtLink>
      <div class="flex gap-6 text-sm">
        <NuxtLink to="/" class="hover:text-[hsl(var(--accent))] transition">Home</NuxtLink>
        <NuxtLink to="/about" class="hover:text-[hsl(var(--accent))] transition">About</NuxtLink>
        <NuxtLink to="/projects" class="hover:text-[hsl(var(--accent))] transition">Projects</NuxtLink>
        <NuxtLink to="/skills" class="hover:text-[hsl(var(--accent))] transition">Skills</NuxtLink>
        <NuxtLink to="/contact" class="hover:text-[hsl(var(--accent))] transition">Contact</NuxtLink>
      </div>
    </div>
  </nav>
</template>