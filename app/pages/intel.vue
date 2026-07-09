<script setup lang="ts">
import { EMPTY_INTEL, type Intel } from '~/types'

const { data: intel } = await useJson<Intel>('intel', EMPTY_INTEL)

const kpis = computed(() => [
  { label: 'Reports', value: intel.value.reports || 0, icon: 'i-lucide-file-text' },
  { label: 'Operator clusters', value: (intel.value.operator_clusters || []).length, icon: 'i-lucide-users', tone: '#f43f5e' },
  { label: 'Shared IOCs', value: (intel.value.shared_iocs || []).length, icon: 'i-lucide-share-2', tone: '#ef4444' },
  { label: 'Imphash clusters', value: (intel.value.imphash_clusters || []).length, icon: 'i-lucide-boxes' },
  { label: 'Families', value: (intel.value.families || []).length, icon: 'i-lucide-bug' },
])
const hasHeat = computed(() => Object.keys(intel.value.attack_heatmap || {}).length > 0)
</script>

<template>
  <div class="space-y-6">
    <PageHeader eyebrow="malscope · correlate" title="Threat Intel"
      subtitle="Cross-report correlation — shared infrastructure, code-similar clusters, and ATT&CK coverage. All indicators defanged." />

    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      <div v-for="k in kpis" :key="k.label" class="rounded-xl border border-default/60 bg-elevated/40 p-4">
        <div class="flex items-center justify-between">
          <span class="text-xs uppercase tracking-wide text-muted">{{ k.label }}</span>
          <UIcon :name="k.icon" class="size-4 text-dimmed" />
        </div>
        <div class="mt-1 text-3xl font-semibold" :style="k.tone ? { color: k.tone } : {}">{{ k.value }}</div>
      </div>
    </div>

    <section v-if="(intel.operator_clusters || []).length">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
        <UIcon name="i-lucide-users" class="size-4" /> Operator clusters
        <span class="text-[11px] font-normal text-dimmed">(samples sharing extracted config — likely the same actor / campaign)</span>
      </h2>
      <div class="grid gap-3 md:grid-cols-2">
        <div v-for="(oc, i) in intel.operator_clusters" :key="i"
          class="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div class="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
            <UIcon name="i-lucide-git-fork" class="size-4" /> {{ oc.count }} linked samples
          </div>
          <div class="mb-3 flex flex-wrap gap-1">
            <NuxtLink v-for="rid in oc.reports" :key="rid" :to="`/reports/${rid}`"
              class="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[11px] text-primary hover:bg-primary/25">
              {{ rid.slice(0, 8) }}
            </NuxtLink>
          </div>
          <div class="space-y-1">
            <div v-for="(s, j) in oc.signals" :key="j" class="flex items-start gap-2 text-xs">
              <span class="w-16 shrink-0 text-[10px] uppercase tracking-wide text-dimmed">{{ s.field }}</span>
              <span class="break-all font-mono text-muted">{{ s.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="hasHeat" class="rounded-xl border border-default/60 bg-elevated/20 p-5">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
        <UIcon name="i-lucide-grid-3x3" class="size-4" /> ATT&amp;CK heatmap
      </h2>
      <AttackHeatmap :heatmap="intel.attack_heatmap" />
    </section>

    <section>
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
        <UIcon name="i-lucide-share-2" class="size-4" /> Shared indicators
        <span class="text-[11px] font-normal text-dimmed">(seen in ≥2 reports)</span>
      </h2>
      <div v-if="(intel.shared_iocs || []).length"
        class="overflow-hidden rounded-xl border border-default/60">
        <table class="w-full text-sm">
          <thead class="bg-elevated/40 text-left text-xs uppercase tracking-wide text-dimmed">
            <tr>
              <th class="px-4 py-2 font-medium">Type</th>
              <th class="px-4 py-2 font-medium">Indicator</th>
              <th class="px-4 py-2 font-medium">Reports</th>
              <th class="px-4 py-2 text-right font-medium">Seen</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default/40">
            <tr v-for="ioc in intel.shared_iocs" :key="ioc.bucket + ioc.value" class="hover:bg-elevated/20">
              <td class="px-4 py-2">
                <UBadge color="neutral" variant="soft" size="sm">{{ ioc.bucket }}</UBadge>
              </td>
              <td class="break-all px-4 py-2 font-mono text-xs text-error/90">{{ ioc.value }}</td>
              <td class="px-4 py-2">
                <div class="flex flex-wrap gap-1">
                  <NuxtLink v-for="rid in ioc.reports" :key="rid" :to="`/reports/${rid}`"
                    class="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary hover:bg-primary/20">
                    {{ rid.slice(0, 8) }}
                  </NuxtLink>
                </div>
              </td>
              <td class="px-4 py-2 text-right font-mono text-xs">{{ ioc.count }}×</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="rounded-lg border border-dashed border-default/60 p-6 text-center text-sm text-dimmed">
        No shared indicators yet.
      </p>
    </section>

    <div class="grid gap-6 lg:grid-cols-3">
      <section>
        <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
          <UIcon name="i-lucide-fingerprint" class="size-4" /> Imphash clusters
          <span class="text-[11px] font-normal text-dimmed">(code-similar samples)</span>
        </h2>
        <ul v-if="(intel.imphash_clusters || []).length" class="space-y-2">
          <li v-for="c in intel.imphash_clusters" :key="c.imphash"
            class="rounded-lg border border-default/60 bg-elevated/20 p-3">
            <div class="flex items-center justify-between">
              <span class="break-all font-mono text-xs text-primary">{{ c.imphash }}</span>
              <span class="font-mono text-[11px] text-dimmed">{{ c.count }} samples</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-1">
              <NuxtLink v-for="rid in c.reports" :key="rid" :to="`/reports/${rid}`"
                class="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary hover:bg-primary/20">
                {{ rid.slice(0, 8) }}
              </NuxtLink>
            </div>
          </li>
        </ul>
        <p v-else class="rounded-lg border border-dashed border-default/60 p-6 text-center text-sm text-dimmed">
          No clusters yet.
        </p>
      </section>

      <section>
        <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
          <UIcon name="i-lucide-radar" class="size-4" /> Fuzzy (TLSH)
          <span class="text-[11px] font-normal text-dimmed">(variants imphash misses)</span>
        </h2>
        <ul v-if="(intel.tlsh_clusters || []).length" class="space-y-2">
          <li v-for="(c, i) in intel.tlsh_clusters" :key="i"
            class="rounded-lg border border-default/60 bg-elevated/20 p-3">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-xs font-medium" style="color:#38bdf8">
                <UIcon name="i-lucide-git-compare" class="size-3.5" /> {{ c.count }} similar
              </span>
              <span class="font-mono text-[11px] text-dimmed">max dist {{ c.max_distance }}</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-1">
              <NuxtLink v-for="rid in c.reports" :key="rid" :to="`/reports/${rid}`"
                class="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary hover:bg-primary/20">
                {{ rid.slice(0, 8) }}
              </NuxtLink>
            </div>
          </li>
        </ul>
        <p v-else class="rounded-lg border border-dashed border-default/60 p-6 text-center text-sm text-dimmed">
          No fuzzy clusters yet.
        </p>
      </section>

      <section>
        <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
          <UIcon name="i-lucide-bug" class="size-4" /> Families
        </h2>
        <ul v-if="(intel.families || []).length" class="space-y-2">
          <li v-for="f in intel.families" :key="f.family"
            class="flex items-center justify-between rounded-lg border border-default/60 bg-elevated/20 p-3">
            <div>
              <div class="font-medium">{{ f.family }}</div>
              <div class="mt-1 flex flex-wrap gap-1">
                <NuxtLink v-for="rid in f.reports" :key="rid" :to="`/reports/${rid}`"
                  class="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary hover:bg-primary/20">
                  {{ rid.slice(0, 8) }}
                </NuxtLink>
              </div>
            </div>
            <UBadge color="primary" variant="subtle" size="sm">{{ f.count }}</UBadge>
          </li>
        </ul>
        <p v-else class="rounded-lg border border-dashed border-default/60 p-6 text-center text-sm text-dimmed">
          No families yet.
        </p>
      </section>
    </div>
  </div>
</template>
