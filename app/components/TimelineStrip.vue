<script setup lang="ts">
import { SEVERITY_COLOR, type Report } from '~/types'

const props = defineProps<{ reports: Report[] }>()

const dated = computed(() =>
  (props.reports || [])
    .map(r => ({ r, t: Date.parse(r.first_seen) }))
    .filter(x => !Number.isNaN(x.t))
    .sort((a, b) => a.t - b.t))

const range = computed(() => {
  if (!dated.value.length) return { min: 0, max: 1 }
  const min = dated.value[0].t
  const max = dated.value[dated.value.length - 1].t
  return { min, max: max === min ? min + 86400000 : max }
})

// Map a timestamp to 2%..98% so edge dots aren't clipped.
function pos(t: number) {
  const { min, max } = range.value
  return 2 + ((t - min) / (max - min)) * 96
}
const fmt = (t: number) => new Date(t).toISOString().slice(0, 10)
</script>

<template>
  <div v-if="dated.length" class="pt-1">
    <div class="relative h-12">
      <div class="absolute inset-x-0 top-4 h-px bg-default/60" />
      <NuxtLink
        v-for="{ r, t } in dated" :key="r.id" :to="`/reports/${r.id}`"
        class="group absolute top-4 -ml-1.5 -mt-1.5" :style="{ left: pos(t) + '%' }">
        <span
          class="block size-3 rounded-full ring-2 ring-default/40 transition-transform group-hover:scale-150"
          :style="{ backgroundColor: SEVERITY_COLOR[r.severity] || '#a1a1aa' }" />
        <span
          class="pointer-events-none absolute left-1/2 top-5 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-elevated px-1.5 py-0.5 text-[10px] shadow group-hover:block">
          {{ r.filename || r.id }} · {{ fmt(t) }}
        </span>
      </NuxtLink>
    </div>
    <div class="flex justify-between font-mono text-[11px] text-dimmed">
      <span>{{ fmt(range.min) }}</span>
      <span>{{ fmt(range.max) }}</span>
    </div>
  </div>
  <p v-else class="text-sm text-dimmed">No dated reports yet.</p>
</template>
