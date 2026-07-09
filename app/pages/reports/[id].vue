<script setup lang="ts">
import { EMPTY_MANIFEST, SEVERITY_COLOR, VERDICT_BADGE, type Manifest } from '~/types'

const route = useRoute()
const { data: m } = await useJson<Manifest>('reports', EMPTY_MANIFEST)

const report = computed(() => (m.value.reports || []).find(r => r.id === route.params.id))

const techMap = computed(() => {
  const map: Record<string, { name: string; tactic: string }> = {}
  for (const t of m.value.techniques_resolved || []) map[t.id] = { name: t.name, tactic: t.tactic }
  return map
})

function fmtSize(n: number) {
  if (!n) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

const meta = computed(() => {
  const r = report.value
  if (!r) return []
  return [
    { label: 'Family', value: r.family || '—' },
    { label: 'Classification', value: r.classification || '—' },
    { label: 'File type', value: r.filetype || '—' },
    { label: 'Size', value: fmtSize(r.size) },
    { label: 'First seen', value: (r.first_seen || '').slice(0, 10) || '—' },
    { label: 'TLP', value: r.tlp || '—' },
  ]
})
</script>

<template>
  <div v-if="report" class="space-y-6">
    <div>
      <UButton to="/reports" variant="link" size="xs" icon="i-lucide-arrow-left" class="mb-2">
        Back to reports
      </UButton>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold">{{ report.filename || report.id }}</h1>
          <p class="mt-1 break-all font-mono text-xs text-dimmed">{{ report.sha256 }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="report.severity" class="rounded px-2 py-1 text-xs font-medium"
            :style="{ color: SEVERITY_COLOR[report.severity] || '#a1a1aa',
                      backgroundColor: (SEVERITY_COLOR[report.severity] || '#a1a1aa') + '1a' }">
            {{ report.severity }}
          </span>
          <UBadge :color="VERDICT_BADGE[report.verdict] || 'neutral'" variant="subtle" size="lg">
            {{ report.verdict }}
          </UBadge>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <div v-for="mi in meta" :key="mi.label" class="rounded-lg border border-default/60 bg-elevated/30 p-3">
        <div class="text-[11px] uppercase tracking-wide text-dimmed">{{ mi.label }}</div>
        <div class="mt-0.5 truncate text-sm font-medium">{{ mi.value }}</div>
      </div>
    </div>

    <div v-if="(report.tags || []).length" class="flex flex-wrap gap-1.5">
      <UBadge v-for="t in report.tags" :key="t" color="neutral" variant="soft" size="sm">{{ t }}</UBadge>
    </div>

    <section v-if="(report.techniques || []).length">
      <h2 class="mb-2 flex items-center gap-2 text-sm font-semibold text-muted">
        <UIcon name="i-lucide-crosshair" class="size-4" /> ATT&amp;CK techniques
      </h2>
      <div class="flex flex-wrap gap-2">
        <div v-for="tid in report.techniques" :key="tid"
          class="rounded-lg border border-default/60 bg-elevated/30 px-3 py-2">
          <div class="font-mono text-xs text-primary">{{ tid }}</div>
          <div class="text-sm">{{ techMap[tid]?.name || 'Unknown technique' }}</div>
          <div v-if="techMap[tid]?.tactic" class="text-[11px] text-dimmed">{{ techMap[tid].tactic }}</div>
        </div>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section v-if="(report.capabilities || []).length">
        <h2 class="mb-2 flex items-center gap-2 text-sm font-semibold text-muted">
          <UIcon name="i-lucide-cpu" class="size-4" /> Capabilities
        </h2>
        <ul class="space-y-1">
          <li v-for="c in report.capabilities" :key="c"
            class="rounded-md border border-default/50 bg-elevated/20 px-3 py-1.5 font-mono text-xs">
            {{ c }}
          </li>
        </ul>
      </section>

      <section v-if="(report.signatures || []).length">
        <h2 class="mb-2 flex items-center gap-2 text-sm font-semibold text-muted">
          <UIcon name="i-lucide-shield-alert" class="size-4" /> Signatures
        </h2>
        <ul class="space-y-1">
          <li v-for="s in report.signatures" :key="s"
            class="rounded-md border border-warning/30 bg-warning/5 px-3 py-1.5 text-xs">
            {{ s }}
          </li>
        </ul>
      </section>
    </div>

    <section v-if="(report.network_iocs || []).length">
      <h2 class="mb-2 flex items-center gap-2 text-sm font-semibold text-muted">
        <UIcon name="i-lucide-network" class="size-4" /> Network indicators
        <span class="text-[11px] font-normal text-dimmed">(defanged)</span>
      </h2>
      <ul class="space-y-1">
        <li v-for="ioc in report.network_iocs" :key="ioc"
          class="flex items-center gap-2 rounded-md border border-error/25 bg-error/5 px-3 py-1.5 font-mono text-xs">
          <UIcon name="i-lucide-globe" class="size-3.5 shrink-0 text-error/70" />
          <span class="break-all">{{ ioc }}</span>
        </li>
      </ul>
    </section>

    <div class="flex flex-wrap gap-4 rounded-lg border border-default/60 bg-elevated/20 p-4 text-sm">
      <span v-for="(n, bucket) in report.ioc_counts" :key="bucket" class="flex items-center gap-1.5">
        <span class="font-mono text-primary">{{ n }}</span>
        <span class="text-muted">{{ bucket }}</span>
      </span>
      <span class="ml-auto font-mono text-xs text-dimmed">{{ report.report }}</span>
    </div>
  </div>

  <div v-else class="py-24 text-center">
    <UIcon name="i-lucide-file-question" class="mx-auto mb-3 size-10 text-dimmed" />
    <p class="text-muted">Report <code class="text-primary">{{ route.params.id }}</code> not found.</p>
    <UButton to="/reports" variant="link" class="mt-2">Back to reports</UButton>
  </div>
</template>
