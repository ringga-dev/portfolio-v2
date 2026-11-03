<template>
  <footer class="footer">
    <div class="footer__inner">
      <p class="footer__copyright">
        © {{ year }} Portfolio. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background-color: hsl(var(--background));
  border-top: 1px solid hsl(var(--border));
}

.footer__inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 1.5rem;
}

.footer__copyright {
  margin: 0;
  color: hsl(var(--muted-foreground));
  font-size: 0.9rem;
}
</style>
