<script setup lang="ts">
import { TACTIC_COLOR } from '~/types'

const props = defineProps<{ items: { tactic: string; count: number }[] }>()

const CX = 100
const CY = 100
const R = 78

const max = computed(() => Math.max(1, ...props.items.map(i => i.count)))
const n = computed(() => Math.max(1, props.items.length))

function pt(i: number, radius: number): [number, number] {
  const a = ((i * 360) / n.value - 90) * (Math.PI / 180)
  return [CX + radius * Math.cos(a), CY + radius * Math.sin(a)]
}

const rings = computed(() =>
  [0.25, 0.5, 0.75, 1].map(level =>
    props.items.map((_it, i) => pt(i, level * R).join(',')).join(' ')))

const spokes = computed(() => props.items.map((_it, i) => pt(i, R)))

const valuePoints = computed(() =>
  props.items.map((it, i) => pt(i, (it.count / max.value) * R).join(',')).join(' '))

const vertices = computed(() =>
  props.items.map((it, i) => {
    const [x, y] = pt(i, (it.count / max.value) * R)
    return { x, y, tactic: it.tactic, count: it.count, color: TACTIC_COLOR[it.tactic] || '#71717a' }
  }))
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <svg viewBox="0 0 200 200" class="mx-auto w-full max-w-[15rem]">
      <polygon v-for="(ring, i) in rings" :key="'r' + i" :points="ring"
        fill="none" stroke="#27272a" stroke-width="0.6" />
      <line v-for="(s, i) in spokes" :key="'s' + i" :x1="CX" :y1="CY" :x2="s[0]" :y2="s[1]"
        stroke="#27272a" stroke-width="0.6" />
      <polygon :points="valuePoints" fill="rgba(239,68,68,0.16)" stroke="#ef4444"
        stroke-width="1.5" stroke-linejoin="round" />
      <circle v-for="(v, i) in vertices" :key="'v' + i" :cx="v.x" :cy="v.y" r="2.6" :fill="v.color">
        <title>{{ v.tactic }}: {{ v.count }}</title>
      </circle>
    </svg>

    <ul class="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs">
      <li v-for="v in vertices" :key="v.tactic" class="flex items-center gap-1.5">
        <span class="size-2 shrink-0 rounded-full" :style="{ backgroundColor: v.color }" />
        <span class="text-muted">{{ v.tactic }}</span>
        <span class="font-mono text-dimmed">{{ v.count }}</span>
      </li>
    </ul>
  </div>
</template>
