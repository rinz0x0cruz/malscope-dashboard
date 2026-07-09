// malscope dashboard — Nuxt 4 SPA (mirrors the exploitrank console stack).
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  ssr: false,                                   // pure client SPA
  experimental: { payloadExtraction: false },
  runtimeConfig: {
    public: { buildId: Date.now().toString() }, // cache-bust data fetches
  },
  colorMode: { preference: 'dark', fallback: 'dark' },
  app: {
    head: {
      title: 'malscope — Malware Analysis Dashboard',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet' },
      ],
    },
  },
})
