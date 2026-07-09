<script setup lang="ts">
import { EMPTY_MANIFEST, VERDICT_BADGE, type Manifest, type Report } from '~/types'

const { data: m } = await useJson<Manifest>('reports', EMPTY_MANIFEST)
const route = useRoute()
const q = ref((route.query.q as string) || '')

// Normalize so defanged and refanged forms match interchangeably
// (hxxp://c2[.]evil[.]top  ==  http://c2.evil.top).
function norm(s: string) {
  return (s || '').toLowerCase()
    .replaceAll('[.]', '.').replaceAll('[:]', ':').replaceAll('[at]', '@')
    .replace(/hxxp/g, 'http').replace(/[[\]]/g, '')
}

interface Hit { report: Report; matches: { field: string; value: string }[] }

const results = computed<Hit[]>(() => {
  const needle = norm(q.value.trim())
  if (needle.length < 2) return []
  const out: Hit[] = []
  for (const r of m.value.reports || []) {
    const matches: { field: string; value: string }[] = []
    const check = (field: string, value: string) => {
      if (value && norm(value).includes(needle)) matches.push({ field, value })
    }
    check('sha256', r.sha256)
    check('filename', r.filename)
    check('family', r.family)
    check('classification', r.classification)
    for (const t of r.tags || []) check('tag', t)
    for (const t of r.techniques || []) check('technique', t)
    for (const c of r.capabilities || []) check('capability', c)
    for (const s of r.signatures || []) check('signature', s)
    for (const ioc of r.network_iocs || []) check('network', ioc)
    if (matches.length) out.push({ report: r, matches })
  }
  return out
})

const clip = (s: string) => (s.length > 44 ? s.slice(0, 44) + '\u2026' : s)
</script>

<template>
  <div class="space-y-5">
    <PageHeader eyebrow="malscope" title="Search"
      subtitle="Where have I seen this? Paste a hash, domain, IP, ATT&amp;CK ID, capability, or signature — defanged or not." />

    <UInput v-model="q" icon="i-lucide-search" size="lg" autofocus class="max-w-xl"
      placeholder="c2.evil.top  ·  185.220.101.45  ·  T1055  ·  AgentTesla" />

    <template v-if="q.trim().length >= 2">
      <p class="text-sm text-dimmed">
        {{ results.length }} report{{ results.length === 1 ? '' : 's' }} matched
      </p>
      <div v-if="results.length" class="space-y-3">
        <NuxtLink v-for="hit in results" :key="hit.report.id" :to="`/reports/${hit.report.id}`"
          class="card-hover block rounded-xl border border-default/60 bg-elevated/30 p-4">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="truncate font-medium">{{ hit.report.filename || hit.report.id }}</div>
              <div class="mt-0.5 font-mono text-[11px] text-dimmed">{{ hit.report.sha256.slice(0, 24) }}...</div>
            </div>
            <UBadge :color="VERDICT_BADGE[hit.report.verdict] || 'neutral'" variant="subtle" size="sm">
              {{ hit.report.verdict }}
            </UBadge>
          </div>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span v-for="(mm, i) in hit.matches" :key="i"
              class="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[11px]">
              <span class="text-dimmed">{{ mm.field }}:</span>
              <span class="font-mono text-primary">{{ clip(mm.value) }}</span>
            </span>
          </div>
        </NuxtLink>
      </div>
      <p v-else class="rounded-lg border border-dashed border-default/60 p-8 text-center text-sm text-dimmed">
        No reports contain that indicator.
      </p>
    </template>
    <div v-else class="rounded-lg border border-dashed border-default/60 p-8 text-center text-sm text-dimmed">
      Type an indicator to search across all {{ m.count || 0 }} reports.
    </div>
  </div>
</template>
