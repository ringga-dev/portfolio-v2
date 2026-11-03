<template>
  <header class="navbar">
    <div class="navbar__inner">
      <a href="/" class="navbar__logo" aria-label="Home">
        <span class="navbar__logo-mark">P</span>
        <span class="navbar__logo-text">Portfolio</span>
      </a>
      <nav class="navbar__nav" aria-label="Primary">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="navbar__link"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const links = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Skills', href: '/skills' },
  { label: 'Contact', href: '/contact' },
]
</script>

<style scoped>
.navbar {
  background-color: hsl(var(--background));
  border-bottom: 1px solid hsl(var(--border));
}

.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 72rem;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

.navbar__logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: hsl(var(--foreground));
  font-weight: 600;
}

.navbar__logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-weight: 700;
}

.navbar__logo-text {
  color: hsl(var(--primary));
}

.navbar__nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.navbar__link {
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.15s ease;
}

.navbar__link:hover {
  color: hsl(var(--foreground));
}
</style>
