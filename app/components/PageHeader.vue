<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; eyebrow?: string }>()
</script>

<template>
  <div class="space-y-1">
    <div v-if="eyebrow" class="font-mono text-xs uppercase tracking-widest text-primary/80">
      {{ eyebrow }}
    </div>
    <h1 class="text-2xl font-semibold">{{ title }}</h1>
    <p v-if="subtitle" class="max-w-2xl text-sm text-muted">{{ subtitle }}</p>
  </div>
</template>
