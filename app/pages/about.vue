<script setup lang="ts">
import { EMPTY_MANIFEST, type Manifest } from '~/types'

const { data: m } = await useJson<Manifest>('reports', EMPTY_MANIFEST)
const base = useRuntimeConfig().app.baseURL

const pipeline = [
  { cmd: 'acquire', icon: 'i-lucide-download', net: true,
    desc: 'Pull sample / IOC metadata from public feeds (MalwareBazaar, URLhaus). Acquisition station only.' },
  { cmd: 'ingest', icon: 'i-lucide-import', net: false,
    desc: 'Parse analyzer OUTPUT (capa / Suricata / Zeek / FLOSS / Volatility / Sysmon / Procmon / config) into IOCs, ATT&CK, capabilities and extracted config. Never runs the sample.' },
  { cmd: 'correlate', icon: 'i-lucide-share-2', net: false,
    desc: 'Cross-report intel: shared C2, imphash + TLSH clusters, operator / campaign clusters, ATT&CK heatmap.' },
  { cmd: 'detect', icon: 'i-lucide-shield-check', net: false,
    desc: 'Generate YARA (imphash + strings + config) and Sigma (network / registry / file) rules from the findings.' },
  { cmd: 'enrich', icon: 'i-lucide-radar', net: true,
    desc: 'OPTIONAL GreyNoise IP-context (live C2 vs benign scanner). Network + key gated, off by default.' },
  { cmd: 'index', icon: 'i-lucide-file-json', net: false,
    desc: 'Emit the redacted, defanged JSON manifests this site renders.' },
]

const safety = [
  'The deterministic core runs fully offline — no network, no AI. Safe to run inside the air-gapped analysis VM.',
  'malscope parses tool OUTPUT only; it never executes a sample.',
  'Every IOC is defanged (hxxp, [.]) and every published manifest is redacted — hashes, defanged indicators and findings only, never sample bytes.',
  'A pre-commit guard blocks executables, archives and high-entropy blobs from ever reaching git.',
  'This site is marked noindex; the analysis repo (and its lab topology) stays private.',
]

const feeds = [
  { name: 'reports.json', desc: 'redacted per-sample manifest', path: 'data/reports.json' },
  { name: 'intel.json', desc: 'shared IOCs, imphash + TLSH clusters, operators, ATT&CK heatmap', path: 'data/intel.json' },
  { name: 'detections.json', desc: 'generated YARA + Sigma rules', path: 'data/detections.json' },
]
</script>

<template>
  <div class="space-y-8">
    <PageHeader eyebrow="malscope" title="How it works"
      subtitle="An offline-first, reproducible malware-analysis pipeline. Everything here is machine-readable and free to consume — the site is a view over the JSON feeds below." />

    <section>
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
        <UIcon name="i-lucide-workflow" class="size-4" /> Pipeline
      </h2>
      <ol class="space-y-2">
        <li v-for="(step, i) in pipeline" :key="step.cmd"
          class="flex items-start gap-3 rounded-lg border border-default/60 bg-elevated/20 p-3">
          <span class="mt-0.5 font-mono text-xs text-dimmed">{{ i + 1 }}</span>
          <UIcon :name="step.icon" class="mt-0.5 size-4 shrink-0 text-primary" />
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <code class="font-mono text-sm text-primary">malscope {{ step.cmd }}</code>
              <span v-if="step.net" class="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] text-warning">network · optional</span>
              <span v-else class="rounded bg-success/15 px-1.5 py-0.5 text-[10px] text-success">offline</span>
            </div>
            <p class="mt-0.5 text-sm text-muted">{{ step.desc }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section>
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
        <UIcon name="i-lucide-shield" class="size-4" /> Safety model
      </h2>
      <ul class="space-y-1.5">
        <li v-for="s in safety" :key="s" class="flex items-start gap-2 text-sm text-muted">
          <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-success" />
          <span>{{ s }}</span>
        </li>
      </ul>
    </section>

    <section>
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
        <UIcon name="i-lucide-rss" class="size-4" /> Data &amp; feeds
        <span class="text-[11px] font-normal text-dimmed">consume these directly</span>
      </h2>
      <ul class="space-y-2">
        <li v-for="f in feeds" :key="f.name"
          class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-default/60 bg-elevated/20 p-3">
          <div>
            <a :href="`${base}${f.path}`" target="_blank" rel="noopener"
              class="font-mono text-sm text-primary hover:underline">{{ f.name }}</a>
            <span class="ml-2 text-xs text-muted">{{ f.desc }}</span>
          </div>
          <UIcon name="i-lucide-external-link" class="size-3.5 text-dimmed" />
        </li>
      </ul>
      <p v-if="m.generated" class="mt-3 text-xs text-dimmed">
        Manifests generated {{ m.generated.slice(0, 10) }} · all indicators defanged · TLP-marked.
      </p>
    </section>
  </div>
</template>
