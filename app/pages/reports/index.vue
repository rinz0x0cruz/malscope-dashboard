<script setup lang="ts">
import { EMPTY_MANIFEST, type Manifest } from '~/types'

const { data: m } = await useJson<Manifest>('reports', EMPTY_MANIFEST)

const q = ref('')
const verdict = ref('all')
const verdicts = computed(() => ['all', ...Object.keys(m.value.verdicts || {})])

const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase()
  return (m.value.reports || []).filter((r) => {
    if (verdict.value !== 'all' && r.verdict !== verdict.value) return false
    if (!needle) return true
    const hay = [
      r.filename, r.family, r.classification, r.sha256,
      ...(r.tags || []), ...(r.techniques || []),
    ].join(' ').toLowerCase()
    return hay.includes(needle)
  })
})
</script>

<template>
  <div class="space-y-5">
    <PageHeader eyebrow="malscope" title="Reports"
      :subtitle="`${m.count || 0} analyzed samples — search by name, family, hash, tag, or ATT&CK ID.`" />

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <UInput v-model="q" icon="i-lucide-search" placeholder="Search reports..." class="sm:max-w-xs" />
      <div class="flex flex-wrap gap-1.5">
        <UButton
          v-for="v in verdicts" :key="v" size="xs"
          :variant="verdict === v ? 'solid' : 'soft'"
          :color="verdict === v ? 'primary' : 'neutral'"
          @click="verdict = v">
          {{ v }}
        </UButton>
      </div>
      <span class="text-sm text-dimmed sm:ml-auto">{{ filtered.length }} shown</span>
    </div>

    <div v-if="filtered.length" class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <ReportCard v-for="r in filtered" :key="r.id" :report="r" />
    </div>
    <p v-else class="rounded-lg border border-dashed border-default/60 p-8 text-center text-sm text-dimmed">
      No reports match your search.
    </p>
  </div>
</template>
