<script setup lang="ts">
import { SEVERITY_COLOR, VERDICT_BADGE, type Report } from '~/types'
const props = defineProps<{ report: Report }>()
const iocTotal = computed(() =>
  Object.values(props.report.ioc_counts || {}).reduce((a, b) => a + (b || 0), 0))
</script>

<template>
  <NuxtLink :to="`/reports/${report.id}`"
    class="card-hover block h-full rounded-xl border border-default/60 bg-elevated/30 p-4">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <div class="truncate font-medium">{{ report.filename || report.id }}</div>
        <div class="mt-0.5 font-mono text-[11px] text-dimmed">{{ report.sha256.slice(0, 24) }}...</div>
      </div>
      <UBadge :color="VERDICT_BADGE[report.verdict] || 'neutral'" variant="subtle" size="sm">
        {{ report.verdict }}
      </UBadge>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-1.5">
      <UBadge v-if="report.family" color="primary" variant="soft" size="sm">{{ report.family }}</UBadge>
      <UBadge v-if="report.classification" color="neutral" variant="soft" size="sm">{{ report.classification }}</UBadge>
      <span v-if="report.severity" class="rounded px-1.5 py-0.5 text-[11px] font-medium"
        :style="{ color: SEVERITY_COLOR[report.severity] || '#a1a1aa',
                  backgroundColor: (SEVERITY_COLOR[report.severity] || '#a1a1aa') + '1a' }">
        {{ report.severity }}
      </span>
    </div>

    <div class="mt-3 flex items-center gap-4 text-xs text-muted">
      <span class="inline-flex items-center gap-1">
        <UIcon name="i-lucide-crosshair" class="size-3.5" />{{ (report.techniques || []).length }} TTP
      </span>
      <span class="inline-flex items-center gap-1">
        <UIcon name="i-lucide-network" class="size-3.5" />{{ iocTotal }} IOC
      </span>
      <span class="ml-auto font-mono">{{ (report.first_seen || '').slice(0, 10) }}</span>
    </div>
  </NuxtLink>
</template>
