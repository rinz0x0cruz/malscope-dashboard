<script setup lang="ts">
import type { Intel, Report } from '~/types'

const props = defineProps<{ reports: Report[]; intel: Intel }>()

const W = 760
const H = 520

type Kind = 'report' | 'ioc' | 'imphash' | 'family' | 'config'
interface GNode {
  id: string; label: string; full: string; kind: Kind; to?: string
  x: number; y: number; vx: number; vy: number
}
interface GEdge { a: number; b: number }

const KIND_COLOR: Record<Exclude<Kind, 'report'>, string> = {
  ioc: '#f97316',      // shared infrastructure (orange)
  imphash: '#eab308',  // code similarity (gold)
  family: '#14b8a6',   // family (teal)
  config: '#f43f5e',   // shared malware config = same operator (crimson)
}
// Hexagon vertices (r=8, pointy-top) for config / operator nodes.
const HEX = '0,-8 6.93,-4 6.93,4 0,8 -6.93,4 -6.93,-4'
const VERDICT_NODE: Record<string, string> = {
  malicious: '#a855f7', suspicious: '#ec4899', benign: '#10b981', unknown: '#71717a',
}

const verdictOf = (id: string) =>
  (props.reports || []).find(r => `r:${r.id}` === id)?.verdict || 'unknown'

// Build the node/edge set + a deterministic force-directed layout (no d3).
const graph = computed(() => {
  const nodes: GNode[] = []
  const index = new Map<string, number>()
  const add = (id: string, label: string, full: string, kind: Kind, to?: string) => {
    if (!index.has(id)) {
      index.set(id, nodes.length)
      nodes.push({ id, label, full, kind, to, x: 0, y: 0, vx: 0, vy: 0 })
    }
    return index.get(id)!
  }
  for (const r of props.reports || [])
    add(`r:${r.id}`, (r.filename || r.id).slice(0, 16), r.filename || r.id, 'report', `/reports/${r.id}`)

  const edges: GEdge[] = []
  const link = (aId: string, bId: string) => {
    const a = index.get(aId), b = index.get(bId)
    if (a !== undefined && b !== undefined) edges.push({ a, b })
  }
  for (const s of props.intel.shared_iocs || []) {
    const id = `ioc:${s.bucket}:${s.value}`
    add(id, s.value.length > 18 ? s.value.slice(0, 18) + '\u2026' : s.value, s.value, 'ioc')
    for (const rid of s.reports) link(id, `r:${rid}`)
  }
  for (const c of props.intel.imphash_clusters || []) {
    const id = `imp:${c.imphash}`
    add(id, c.imphash.slice(0, 10), c.imphash, 'imphash')
    for (const rid of c.reports) link(id, `r:${rid}`)
  }
  for (const f of props.intel.families || []) {
    const id = `fam:${f.family}`
    add(id, f.family, f.family, 'family')
    for (const rid of f.reports) link(id, `r:${rid}`)
  }
  // Operator/campaign signals: a shared campaign id or encryption key binds
  // reports far more strongly than shared infra, so surface them as nodes.
  for (const c of props.intel.config_links || []) {
    if (c.field !== 'campaign' && c.field !== 'keys') continue
    const id = `cfg:${c.field}:${c.value}`
    add(id, c.value.length > 16 ? c.value.slice(0, 16) + '\u2026' : c.value,
        `${c.field}: ${c.value}`, 'config')
    for (const rid of c.reports) link(id, `r:${rid}`)
  }

  const N = nodes.length
  const CX = W / 2, CY = H / 2
  const R0 = Math.min(W, H) * 0.32
  nodes.forEach((n, i) => {
    const a = (i / Math.max(1, N)) * Math.PI * 2
    n.x = CX + Math.cos(a) * R0
    n.y = CY + Math.sin(a) * R0
  })
  const REP = 3200, SPR = 0.03, IDEAL = 78, CEN = 0.016, DAMP = 0.85
  const iters = N > 250 ? 160 : 340
  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const d2 = dx * dx + dy * dy + 0.01
        const d = Math.sqrt(d2)
        const f = REP / d2
        const fx = (f * dx) / d, fy = (f * dy) / d
        nodes[i].vx += fx; nodes[i].vy += fy
        nodes[j].vx -= fx; nodes[j].vy -= fy
      }
    }
    for (const e of edges) {
      const a = nodes[e.a], b = nodes[e.b]
      const dx = b.x - a.x, dy = b.y - a.y
      const d = Math.sqrt(dx * dx + dy * dy) + 0.01
      const f = (d - IDEAL) * SPR
      const fx = (f * dx) / d, fy = (f * dy) / d
      a.vx += fx; a.vy += fy
      b.vx -= fx; b.vy -= fy
    }
    for (const n of nodes) {
      n.vx += (CX - n.x) * CEN
      n.vy += (CY - n.y) * CEN
      n.vx *= DAMP; n.vy *= DAMP
      n.x += n.vx; n.y += n.vy
      n.x = Math.max(26, Math.min(W - 26, n.x))
      n.y = Math.max(26, Math.min(H - 26, n.y))
    }
  }
  return { nodes, edges }
})

const hover = ref<number | null>(null)
const nodeColor = (n: GNode) =>
  n.kind === 'report' ? (VERDICT_NODE[verdictOf(n.id)] || '#71717a') : KIND_COLOR[n.kind]
const isDim = (i: number) => {
  if (hover.value === null || hover.value === i) return false
  return !graph.value.edges.some(e =>
    (e.a === hover.value && e.b === i) || (e.b === hover.value && e.a === i))
}
const edgeDim = (e: GEdge) =>
  hover.value !== null && e.a !== hover.value && e.b !== hover.value
</script>

<template>
  <svg v-if="graph.nodes.length" :viewBox="`0 0 ${W} ${H}`" class="w-full select-none">
    <line
      v-for="(e, i) in graph.edges" :key="'e' + i"
      :x1="graph.nodes[e.a].x" :y1="graph.nodes[e.a].y"
      :x2="graph.nodes[e.b].x" :y2="graph.nodes[e.b].y"
      stroke="#52525b" :stroke-opacity="edgeDim(e) ? 0.12 : 0.5" stroke-width="1" />

    <g
      v-for="(n, i) in graph.nodes" :key="n.id"
      :transform="`translate(${n.x} ${n.y})`" :opacity="isDim(i) ? 0.2 : 1"
      :class="n.to ? 'cursor-pointer' : 'cursor-default'"
      @mouseenter="hover = i" @mouseleave="hover = null"
      @click="n.to && navigateTo(n.to)">
      <title>{{ n.full }}</title>
      <circle v-if="n.kind === 'report'" :r="hover === i ? 11 : 8"
        :fill="nodeColor(n)" stroke="#0a0a0a" stroke-width="1.5" />
      <rect v-else-if="n.kind === 'ioc'" x="-6" y="-6" width="12" height="12"
        transform="rotate(45)" :fill="nodeColor(n)" stroke="#0a0a0a" stroke-width="1.5" />
      <rect v-else-if="n.kind === 'imphash'" x="-6" y="-6" width="12" height="12" rx="1.5"
        :fill="nodeColor(n)" stroke="#0a0a0a" stroke-width="1.5" />
      <polygon v-else-if="n.kind === 'config'" :points="HEX"
        :fill="nodeColor(n)" stroke="#0a0a0a" stroke-width="1.5" />
      <template v-else>
        <circle r="12" fill="none" :stroke="nodeColor(n)" stroke-opacity="0.4" />
        <circle r="8.5" :fill="nodeColor(n)" stroke="#0a0a0a" stroke-width="1.5" />
      </template>
      <text y="21" text-anchor="middle" font-size="8"
        :fill="n.kind === 'report' ? '#a1a1aa' : '#71717a'">{{ n.label }}</text>
    </g>
  </svg>
  <p v-else class="py-16 text-center text-sm text-dimmed">
    No correlations yet — needs at least two reports sharing an indicator, imphash, or family.
  </p>
</template>
