<script setup lang="ts">
import { EMPTY_DETECTIONS, VERDICT_BADGE, type DetectionsManifest } from '~/types'

const { data: d } = await useJson<DetectionsManifest>('detections', EMPTY_DETECTIONS)

const q = ref('')
const family = ref('')
const families = computed(() =>
  Array.from(new Set((d.value.detections || []).map(x => x.family).filter(Boolean))).sort())

const filtered = computed(() => {
  let list = d.value.detections || []
  if (family.value) list = list.filter(x => x.family === family.value)
  const s = q.value.trim().toLowerCase()
  if (s) list = list.filter(x => `${x.family} ${x.filename} ${x.id}`.toLowerCase().includes(s))
  return list
})
const totals = computed(() => ({
  yara: filtered.value.length,
  sigma: filtered.value.reduce((n, x) => n + (x.sigma_count || 0), 0),
}))

function download(name: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
const downloadYara = () =>
  download('malscope-detections.yar', filtered.value.map(x => x.yara).join('\n\n'))
const downloadSigma = () =>
  download('malscope-detections.sigma.yml',
    filtered.value.filter(x => x.sigma).map(x => x.sigma).join('\n---\n'))
</script>

<template>
  <div class="space-y-6">
    <PageHeader eyebrow="malscope · detect" title="Detections"
      subtitle="YARA + Sigma rules auto-generated from each sample's findings — imphash, notable strings and config for YARA; network / registry / file behaviour for Sigma. Filter by family and download a ready-to-deploy rule pack. Review before deploying." />

    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-3">
        <UInput v-model="q" icon="i-lucide-search" placeholder="Filter by family, filename or id"
          class="max-w-sm grow" />
        <div class="flex gap-2 text-xs">
          <span class="rounded-lg border border-default/60 bg-elevated/40 px-3 py-1.5">
            <span class="font-mono text-primary">{{ totals.yara }}</span> <span class="text-muted">YARA</span>
          </span>
          <span class="rounded-lg border border-default/60 bg-elevated/40 px-3 py-1.5">
            <span class="font-mono text-primary">{{ totals.sigma }}</span> <span class="text-muted">Sigma</span>
          </span>
        </div>
        <div class="ml-auto flex gap-2">
          <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-download"
            :disabled="!totals.yara" @click="downloadYara">.yar pack</UButton>
          <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-download"
            :disabled="!totals.sigma" @click="downloadSigma">Sigma pack</UButton>
        </div>
      </div>
      <div v-if="families.length" class="flex flex-wrap items-center gap-1.5">
        <button type="button" @click="family = ''"
          class="rounded-full px-2.5 py-0.5 text-xs"
          :class="family === '' ? 'bg-primary/20 text-primary' : 'bg-elevated/50 text-muted hover:bg-elevated'">
          all
        </button>
        <button v-for="f in families" :key="f" type="button" @click="family = f"
          class="rounded-full px-2.5 py-0.5 text-xs"
          :class="family === f ? 'bg-primary/20 text-primary' : 'bg-elevated/50 text-muted hover:bg-elevated'">
          {{ f }}
        </button>
      </div>
    </div>

    <div v-if="filtered.length" class="space-y-5">
      <section v-for="det in filtered" :key="det.id"
        class="rounded-xl border border-default/60 bg-elevated/20 p-4">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-code-2" class="size-4 text-primary" />
            <NuxtLink :to="`/reports/${det.id}`" class="font-medium hover:text-primary">
              {{ det.filename || det.id }}
            </NuxtLink>
            <UBadge v-if="det.family" color="neutral" variant="soft" size="sm">{{ det.family }}</UBadge>
          </div>
          <UBadge :color="VERDICT_BADGE[det.verdict] || 'neutral'" variant="subtle" size="sm">
            {{ det.verdict }}
          </UBadge>
        </div>
        <div class="grid gap-3 lg:grid-cols-2">
          <CodeBlock label="YARA" :code="det.yara" />
          <CodeBlock v-if="det.sigma" label="Sigma" :code="det.sigma" />
          <div v-else
            class="flex items-center justify-center rounded-lg border border-dashed border-default/50 p-4 text-center text-xs text-dimmed">
            No behavioural Sigma rule (no network / host IOCs)
          </div>
        </div>
      </section>
    </div>

    <p v-else class="rounded-lg border border-dashed border-default/60 p-10 text-center text-sm text-dimmed">
      No detections match.
    </p>
  </div>
</template>
