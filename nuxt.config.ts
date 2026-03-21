/// <reference types="node" />
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-04-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['node']
      }
    }
  },
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY || '', // Server-side only
    public: {
      // Public variables here
    }
  },
  app: {
    head: {
      title: 'Prompting Workshop Game',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  css: ['~/assets/css/main.css'],
  vite: {
    server: {
      allowedHosts: ['.ngrok-free.app']
    },
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'pinia',
        'lucide-vue-next'
      ]
    }
  }
})
