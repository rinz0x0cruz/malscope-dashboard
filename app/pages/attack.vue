<script setup lang="ts">
import { EMPTY_INTEL, TACTIC_COLOR, type Intel } from '~/types'

const { data: intel } = await useJson<Intel>('intel', EMPTY_INTEL)

// Canonical Enterprise ATT&CK tactic order (kill chain).
const TACTIC_ORDER = [
  'Reconnaissance', 'Resource Development', 'Initial Access', 'Execution',
  'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Credential Access',
  'Discovery', 'Lateral Movement', 'Collection', 'Command and Control',
  'Exfiltration', 'Impact',
]

const max = computed(() => Math.max(
  1, ...Object.values(intel.value.attack_heatmap || {}).flatMap(t => t.techniques.map(x => x.count))))

const columns = computed(() => TACTIC_ORDER.map((tactic) => {
  const data = (intel.value.attack_heatmap || {})[tactic]
  return {
    tactic,
    color: TACTIC_COLOR[tactic] || '#71717a',
    techniques: (data?.techniques || []).slice().sort((a, b) => b.count - a.count),
  }
}))

const covered = computed(() => columns.value.filter(c => c.techniques.length).length)
const totalTech = computed(() => new Set(
  Object.values(intel.value.attack_heatmap || {}).flatMap(t => t.techniques.map(x => x.id))).size)

function heat(n: number) {
  const t = Math.min(1, n / max.value)
  return `rgba(239, 68, 68, ${(0.16 + t * 0.7).toFixed(3)})`
}
</script>

<template>
  <div class="space-y-5">
    <PageHeader eyebrow="malscope · correlate" title="ATT&amp;CK matrix"
      subtitle="Technique coverage across the ATT&amp;CK kill chain. Cell heat = how many reports exhibit the technique; click a cell to see them." />

    <div class="flex flex-wrap items-center gap-3 text-xs">
      <div class="rounded-lg border border-default/60 bg-elevated/40 px-3 py-1.5">
        <span class="font-mono text-primary">{{ covered }}</span><span class="text-dimmed">/14</span>
        <span class="text-muted"> tactics covered</span>
      </div>
      <div class="rounded-lg border border-default/60 bg-elevated/40 px-3 py-1.5">
        <span class="font-mono text-primary">{{ totalTech }}</span>
        <span class="text-muted"> techniques observed</span>
      </div>
      <div class="ml-auto flex items-center gap-1.5 text-dimmed">
        <span>less</span>
        <span class="inline-block h-3 w-6 rounded-sm" :style="{ background: heat(0) }" />
        <span class="inline-block h-3 w-6 rounded-sm" :style="{ background: heat(max / 2) }" />
        <span class="inline-block h-3 w-6 rounded-sm" :style="{ background: heat(max) }" />
        <span>more</span>
      </div>
    </div>

    <div class="overflow-x-auto pb-2">
      <div class="flex min-w-max gap-2">
        <div v-for="col in columns" :key="col.tactic" class="w-40 shrink-0">
          <div class="mb-2 border-b-2 pb-1" :style="{ borderColor: col.color }">
            <div class="flex items-center justify-between gap-1">
              <h3 class="truncate text-[11px] font-semibold uppercase tracking-wide text-muted"
                :title="col.tactic">{{ col.tactic }}</h3>
              <span class="font-mono text-[10px] text-dimmed">{{ col.techniques.length }}</span>
            </div>
          </div>
          <div v-if="col.techniques.length" class="space-y-1.5">
            <button v-for="t in col.techniques" :key="t.id" type="button"
              class="block w-full rounded-md border border-white/5 p-2 text-left transition hover:ring-1 hover:ring-white/40"
              :style="{ backgroundColor: heat(t.count) }"
              :title="`${t.id} ${t.name} — ${t.count} report(s); click to view`"
              @click="navigateTo(`/search?q=${t.id}`)">
              <div class="flex items-center justify-between gap-1">
                <span class="font-mono text-[11px] text-white/95">{{ t.id }}</span>
                <span class="font-mono text-[11px] text-white/80">{{ t.count }}×</span>
              </div>
              <div class="mt-0.5 text-xs leading-tight text-white/90">{{ t.name }}</div>
            </button>
          </div>
          <div v-else
            class="rounded-md border border-dashed border-default/40 py-3 text-center text-[10px] text-dimmed/50">
            —
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
