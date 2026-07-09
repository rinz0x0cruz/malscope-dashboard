<script setup lang="ts">
import type { HeatTactic } from '~/types'

const props = defineProps<{ heatmap: Record<string, HeatTactic> }>()

const tactics = computed(() =>
  Object.entries(props.heatmap).sort((a, b) => b[1].count - a[1].count))

const max = computed(() =>
  Math.max(1, ...Object.values(props.heatmap).flatMap(t => t.techniques.map(x => x.count))))

function heat(n: number) {
  const t = Math.min(1, n / max.value)
  return `rgba(239, 68, 68, ${(0.14 + t * 0.72).toFixed(3)})`
}
</script>

<template>
  <div class="overflow-x-auto pb-2">
    <div class="flex min-w-max gap-3">
      <div v-for="[tactic, data] in tactics" :key="tactic" class="w-44 shrink-0">
        <div class="mb-2 flex items-center justify-between border-b border-default/50 pb-1">
          <h3 class="truncate text-xs font-semibold uppercase tracking-wide text-muted">{{ tactic }}</h3>
          <span class="font-mono text-[11px] text-dimmed">{{ data.count }}</span>
        </div>
        <div class="space-y-1.5">
          <div v-for="t in data.techniques" :key="t.id"
            class="rounded-md border border-white/5 p-2" :style="{ backgroundColor: heat(t.count) }">
            <div class="flex items-center justify-between gap-1">
              <span class="font-mono text-[11px] text-white/95">{{ t.id }}</span>
              <span class="font-mono text-[11px] text-white/80">{{ t.count }}×</span>
            </div>
            <div class="mt-0.5 text-xs leading-tight text-white/90">{{ t.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
