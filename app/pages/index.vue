<script setup lang="ts">
import { EMPTY_INTEL, EMPTY_MANIFEST, type Intel, type Manifest } from '~/types'

const { data: m } = await useJson<Manifest>('reports', EMPTY_MANIFEST)
const { data: intel } = await useJson<Intel>('intel', EMPTY_INTEL)

const kpis = computed(() => [
  { label: 'Reports', value: m.value.count || 0, icon: 'i-lucide-file-text' },
  { label: 'Malicious', value: m.value.verdicts?.malicious || 0, icon: 'i-lucide-skull', tone: '#ef4444' },
  { label: 'Families', value: Object.keys(m.value.families || {}).length, icon: 'i-lucide-boxes' },
  { label: 'Techniques', value: (m.value.techniques_resolved || []).length, icon: 'i-lucide-crosshair' },
])
const topFamilies = computed(() =>
  Object.entries(m.value.families || {}).sort((a, b) => b[1] - a[1]).slice(0, 6))
const tacticProfile = computed(() => {
  const acc: Record<string, number> = {}
  for (const t of m.value.techniques_resolved || []) {
    const key = t.tactic || 'Unknown'
    acc[key] = (acc[key] || 0) + t.count
  }
  return Object.entries(acc)
    .map(([tactic, count]) => ({ tactic, count }))
    .sort((a, b) => b.count - a.count)
})
const recent = computed(() => (m.value.reports || []).slice(0, 6))
const sharedCount = computed(() => (intel.value.shared_iocs || []).length)
const clusterCount = computed(() => (intel.value.imphash_clusters || []).length)
</script>

<template>
  <div class="space-y-6">
    <PageHeader eyebrow="malscope" title="Overview"
      subtitle="Malware-analysis reports at a glance — every indicator defanged, safe to browse." />

    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div v-for="k in kpis" :key="k.label" class="rounded-xl border border-default/60 bg-elevated/40 p-4">
        <div class="flex items-center justify-between">
          <span class="text-xs uppercase tracking-wide text-muted">{{ k.label }}</span>
          <UIcon :name="k.icon" class="size-4 text-dimmed" />
        </div>
        <div class="mt-1 text-3xl font-semibold" :style="k.tone ? { color: k.tone } : {}">{{ k.value }}</div>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <section class="rounded-xl border border-default/60 bg-elevated/30 p-5">
        <h2 class="mb-3 text-sm font-semibold text-muted">Top families</h2>
        <BarList v-if="topFamilies.length"
          :items="topFamilies.map(([name, n]) => ({ label: name, value: n }))" />
        <p v-else class="text-sm text-dimmed">No families yet.</p>
      </section>

      <section class="rounded-xl border border-default/60 bg-elevated/30 p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-muted">ATT&amp;CK by tactic</h2>
          <UButton to="/intel" variant="link" size="xs" trailing-icon="i-lucide-arrow-right">Heatmap</UButton>
        </div>
        <TacticRadar v-if="tacticProfile.length" :items="tacticProfile" />
        <p v-else class="text-sm text-dimmed">No techniques yet.</p>
      </section>
    </div>

    <div v-if="sharedCount || clusterCount"
      class="flex flex-wrap gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
      <UIcon name="i-lucide-share-2" class="size-5 text-primary" />
      <span><strong>{{ sharedCount }}</strong> shared IOC{{ sharedCount === 1 ? '' : 's' }}</span>
      <span class="text-dimmed">·</span>
      <span><strong>{{ clusterCount }}</strong> imphash cluster{{ clusterCount === 1 ? '' : 's' }}</span>
      <UButton to="/intel" variant="link" size="xs" trailing-icon="i-lucide-arrow-right" class="ml-auto">
        Explore intel
      </UButton>
    </div>

    <section>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-muted">Recent reports</h2>
        <UButton to="/reports" variant="link" size="xs" trailing-icon="i-lucide-arrow-right">All reports</UButton>
      </div>
      <div v-if="recent.length" class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <ReportCard v-for="r in recent" :key="r.id" :report="r" />
      </div>
      <p v-else class="rounded-lg border border-dashed border-default/60 p-6 text-center text-sm text-dimmed">
        No reports yet — run
        <code class="text-primary">malscope index --emit-json --out web/public/data/reports.json</code>.
      </p>
    </section>
  </div>
</template>
