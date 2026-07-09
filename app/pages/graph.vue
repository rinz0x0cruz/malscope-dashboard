<script setup lang="ts">
import { EMPTY_INTEL, EMPTY_MANIFEST, type Intel, type Manifest } from '~/types'

const { data: m } = await useJson<Manifest>('reports', EMPTY_MANIFEST)
const { data: intel } = await useJson<Intel>('intel', EMPTY_INTEL)
</script>

<template>
  <div class="space-y-5">
    <PageHeader eyebrow="malscope · correlate" title="Correlation graph"
      subtitle="How the corpus connects — shared C2 infrastructure, imphash code-similarity, family, and shared malware config (same operator). Hover a node to trace its links; click a report to open it." />

    <div class="flex flex-wrap gap-4 text-xs text-muted">
      <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-full" style="background:#a855f7" />report (malicious)</span>
      <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-full" style="background:#ec4899" />report (suspicious)</span>
      <span class="flex items-center gap-1.5"><span class="size-2.5 rotate-45" style="background:#f97316" />shared IOC</span>
      <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-[2px]" style="background:#eab308" />imphash cluster</span>
      <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-full ring-2 ring-teal-400/40" style="background:#14b8a6" />family</span>
      <span class="flex items-center gap-1.5"><span class="size-2.5" style="background:#f43f5e; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" />operator config</span>
    </div>

    <div class="rounded-xl border border-default/60 bg-elevated/20 p-2">
      <CorrelationGraph :reports="m.reports || []" :intel="intel" />
    </div>
  </div>
</template>
