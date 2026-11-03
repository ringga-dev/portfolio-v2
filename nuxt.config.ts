import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  srcDir: 'src',
  css: ['~/assets/css/index.css'],
  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    cssPath: '~/assets/css/index.css',
    configPath: 'tailwind.config.ts',
  },
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
  app: {
    baseURL: '/portfolio-v2/',
  },
})