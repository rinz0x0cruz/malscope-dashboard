<script setup lang="ts">
import {
  EMPTY_DETECTIONS, EMPTY_INTEL, EMPTY_MANIFEST, VERDICT_BADGE,
  type DetectionsManifest, type Intel, type Manifest, type OperatorSignal, type Report,
} from '~/types'

const { data: intel } = await useJson<Intel>('intel', EMPTY_INTEL)
const { data: m } = await useJson<Manifest>('reports', EMPTY_MANIFEST)
const { data: det } = await useJson<DetectionsManifest>('detections', EMPTY_DETECTIONS)

const reportById = computed(() => {
  const map: Record<string, Report> = {}
  for (const r of m.value.reports || []) map[r.id] = r
  return map
})
const techName = computed(() => {
  const map: Record<string, string> = {}
  for (const t of m.value.techniques_resolved || []) map[t.id] = t.name
  return map
})
const tlshLinked = computed(() => {
  const s = new Set<string>()
  for (const c of intel.value.tlsh_clusters || []) for (const id of c.reports) s.add(id)
  return s
})

const FIELD_LABEL: Record<string, string> = {
  campaign: 'Campaign / botnet', keys: 'Encryption key', c2: 'C2', mutex: 'Mutex', version: 'Version',
}

function labelFor(signals: OperatorSignal[], i: number) {
  return signals.find(s => s.field === 'campaign')?.value
    || signals.find(s => s.field === 'keys')?.value
    || `Operator ${i + 1}`
}

const operators = computed(() => (intel.value.operator_clusters || []).map((oc, i) => {
  const samples = oc.reports
    .map(id => reportById.value[id])
    .filter(Boolean)
    .sort((a, b) => (a.first_seen || '').localeCompare(b.first_seen || ''))
  const dets = (det.value.detections || []).filter(x => oc.reports.includes(x.id))
  return {
    key: `op-${i}`,
    label: labelFor(oc.signals, i),
    count: oc.count,
    samples,
    signals: oc.signals,
    techniques: Array.from(new Set(samples.flatMap(s => s.techniques || []))),
    fuzzy: oc.reports.some(id => tlshLinked.value.has(id)),
    yara: dets.length,
    sigma: dets.reduce((n, x) => n + (x.sigma_count || 0), 0),
  }
}))

const fmtDate = (s: string) => (s || '').slice(0, 10) || '\u2014'
</script>

<template>
  <div class="space-y-6">
    <PageHeader eyebrow="malscope · correlate" title="Operators &amp; campaigns"
      subtitle="Samples grouped by shared extracted config — the same encryption key, campaign id, C2 or mutex means almost certainly the same actor. Each profile rolls up an operator's variants, infrastructure, ATT&amp;CK coverage and detections." />

    <div v-if="operators.length" class="space-y-5">
      <section v-for="op in operators" :key="op.key"
        class="rounded-xl border border-primary/25 bg-primary/5 p-5">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <UIcon name="i-lucide-users" class="size-5 text-primary" />
            <h2 class="break-all font-mono text-lg font-semibold text-primary">{{ op.label }}</h2>
            <UBadge color="primary" variant="subtle" size="sm">{{ op.count }} samples</UBadge>
            <span v-if="op.fuzzy" class="rounded bg-sky-500/15 px-1.5 py-0.5 text-[11px] text-sky-400">
              TLSH-linked variants
            </span>
          </div>
          <NuxtLink to="/graph" class="text-xs text-dimmed hover:text-primary">view in graph →</NuxtLink>
        </div>

        <div class="mb-4">
          <div class="mb-1.5 text-[11px] uppercase tracking-wide text-dimmed">Variant timeline</div>
          <ol class="space-y-1.5">
            <li v-for="(s, idx) in op.samples" :key="s.id" class="flex flex-wrap items-center gap-2.5 text-sm">
              <span class="w-20 shrink-0 font-mono text-[11px] text-dimmed">{{ fmtDate(s.first_seen) }}</span>
              <span class="size-2 shrink-0 rounded-full"
                :style="{ background: idx === 0 ? '#22c55e' : '#38bdf8' }" />
              <NuxtLink :to="`/reports/${s.id}`" class="font-medium hover:text-primary">{{ s.filename || s.id }}</NuxtLink>
              <UBadge :color="VERDICT_BADGE[s.verdict] || 'neutral'" variant="subtle" size="xs">{{ s.verdict }}</UBadge>
              <span class="text-[11px] text-dimmed">{{ idx === 0 ? 'first seen' : 'later variant' }}</span>
            </li>
          </ol>
        </div>

        <div class="mb-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="sig in op.signals" :key="sig.field + sig.value"
            class="rounded-lg border border-default/60 bg-elevated/30 p-2.5">
            <div class="text-[10px] uppercase tracking-wide text-dimmed">{{ FIELD_LABEL[sig.field] || sig.field }}</div>
            <div class="break-all font-mono text-xs text-muted">{{ sig.value }}</div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-[11px] uppercase tracking-wide text-dimmed">ATT&amp;CK</span>
            <span v-for="t in op.techniques" :key="t" :title="techName[t] || ''"
              class="rounded bg-elevated/60 px-1.5 py-0.5 font-mono text-[11px] text-muted">{{ t }}</span>
          </div>
          <NuxtLink to="/detections" class="flex items-center gap-1.5 text-xs text-primary hover:underline">
            <UIcon name="i-lucide-shield-check" class="size-3.5" />
            {{ op.yara }} YARA · {{ op.sigma }} Sigma
          </NuxtLink>
        </div>
      </section>
    </div>

    <p v-else class="rounded-lg border border-dashed border-default/60 p-10 text-center text-sm text-dimmed">
      No operator clusters yet — needs ≥2 samples sharing an extracted config value
      (campaign / key / C2 / mutex).
    </p>
  </div>
</template>
