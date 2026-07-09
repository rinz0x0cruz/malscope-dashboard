<script setup lang="ts">
interface Item { label: string; value: number; to?: string }
const props = withDefaults(defineProps<{ items: Item[]; max?: number; color?: string }>(), {
  max: 0, color: '#ef4444',
})
const mx = computed(() => props.max || Math.max(1, ...props.items.map(i => i.value)))
const pct = (v: number) => Math.max(2, Math.round((v / mx.value) * 100))
</script>

<template>
  <ol class="space-y-2.5">
    <li v-for="(it, i) in items" :key="i" class="text-sm">
      <div class="mb-1 flex items-center justify-between gap-3">
        <component :is="it.to ? resolveComponent('NuxtLink') : 'span'" :to="it.to"
          class="truncate" :class="it.to ? 'text-primary hover:underline' : ''">{{ it.label }}</component>
        <span class="font-mono text-xs text-muted">{{ it.value }}</span>
      </div>
      <div class="h-1.5 rounded-full bg-default/60">
        <div class="bar-grow h-full rounded-full" :style="{ width: pct(it.value) + '%', backgroundColor: color }" />
      </div>
    </li>
  </ol>
</template>
