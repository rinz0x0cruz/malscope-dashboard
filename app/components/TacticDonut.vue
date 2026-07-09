<script setup lang="ts">
import { TACTIC_COLOR } from '~/types'

const props = defineProps<{ items: { tactic: string; count: number }[] }>()

const total = computed(() => props.items.reduce((a, b) => a + b.count, 0))
const segments = computed(() => {
  let acc = 0
  return props.items.map((it) => {
    const pct = total.value ? (it.count / total.value) * 100 : 0
    const seg = { ...it, pct, offset: acc, color: TACTIC_COLOR[it.tactic] || '#71717a' }
    acc += pct
    return seg
  })
})
</script>

<template>
  <div class="flex flex-col items-center gap-5 sm:flex-row">
    <div class="relative shrink-0">
      <svg viewBox="0 0 36 36" class="size-36 -rotate-90">
        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#27272a" stroke-width="3.5" />
        <circle
          v-for="s in segments" :key="s.tactic" cx="18" cy="18" r="15.915" fill="none"
          :stroke="s.color" stroke-width="3.5" stroke-linecap="butt"
          :stroke-dasharray="`${s.pct} ${100 - s.pct}`" :stroke-dashoffset="-s.offset">
          <title>{{ s.tactic }}: {{ s.count }}</title>
        </circle>
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-2xl font-semibold leading-none">{{ total }}</span>
        <span class="mt-0.5 text-[10px] uppercase tracking-widest text-dimmed">hits</span>
      </div>
    </div>

    <ul class="w-full space-y-1.5 text-sm">
      <li v-for="s in segments" :key="s.tactic" class="flex items-center gap-2">
        <span class="size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: s.color }" />
        <span class="truncate">{{ s.tactic }}</span>
        <span class="ml-auto font-mono text-xs text-muted">{{ s.count }}</span>
      </li>
    </ul>
  </div>
</template>
