<script setup lang="ts">
const links = [
  { label: 'Overview', to: '/', icon: 'i-lucide-layout-dashboard' },
  { label: 'Reports', to: '/reports', icon: 'i-lucide-file-text' },
  { label: 'Intel', to: '/intel', icon: 'i-lucide-share-2' },
  { label: 'Graph', to: '/graph', icon: 'i-lucide-waypoints' },
  { label: 'Operators', to: '/operators', icon: 'i-lucide-users' },
  { label: 'ATT&CK', to: '/attack', icon: 'i-lucide-grid-3x3' },
  { label: 'Detections', to: '/detections', icon: 'i-lucide-shield-check' },
  { label: 'Search', to: '/search', icon: 'i-lucide-search' },
]
const route = useRoute()
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-default text-default">
      <header class="sticky top-0 z-40 border-b border-default/60 bg-default/80 backdrop-blur">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <NuxtLink to="/" class="flex items-center gap-2 font-semibold">
            <UIcon name="i-lucide-bug" class="size-5 text-primary" />
            <span class="text-lg">mal<span class="text-gradient">scope</span></span>
          </NuxtLink>
          <nav class="flex items-center gap-1">
            <UButton
              v-for="l in links" :key="l.to" :to="l.to" :icon="l.icon"
              :variant="route.path === l.to ? 'soft' : 'ghost'"
              :color="route.path === l.to ? 'primary' : 'neutral'" size="sm">
              <span class="hidden sm:inline">{{ l.label }}</span>
            </UButton>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-6">
        <NuxtPage />
      </main>

      <footer class="mx-auto max-w-7xl px-4 pb-10 pt-4 text-xs text-dimmed">
        malscope · offline malware-analysis dashboard · all indicators defanged ·
        <NuxtLink to="/about" class="transition-colors hover:text-primary">how it works</NuxtLink>
      </footer>
    </div>
  </UApp>
</template>
