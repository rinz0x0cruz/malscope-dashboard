// Shared shapes for the two manifests malscope emits (index + correlate).
export interface Report {
  id: string
  sha256: string
  filename: string
  filetype: string
  size: number
  family: string
  classification: string
  verdict: string
  severity: string
  first_seen: string
  tags: string[]
  techniques: string[]
  capabilities: string[]
  signatures: string[]
  tlp: string
  report: string
  network_iocs: string[]
  ioc_counts: Record<string, number>
}

export interface TechniqueResolved { id: string; name: string; tactic: string; count: number }

export interface Manifest {
  generated: string
  count: number
  reports: Report[]
  techniques: Record<string, number>
  techniques_resolved: TechniqueResolved[]
  families: Record<string, number>
  verdicts: Record<string, number>
}

export interface SharedIoc { bucket: string; value: string; reports: string[]; count: number }
export interface ImphashCluster { imphash: string; reports: string[]; count: number }
export interface FamilyGroup { family: string; reports: string[]; count: number }
export interface HeatTactic { count: number; techniques: { id: string; name: string; count: number }[] }

export interface Intel {
  generated: string
  reports: number
  shared_iocs: SharedIoc[]
  imphash_clusters: ImphashCluster[]
  families: FamilyGroup[]
  attack_heatmap: Record<string, HeatTactic>
  technique_totals: TechniqueResolved[]
}

export const EMPTY_MANIFEST: Manifest = {
  generated: '', count: 0, reports: [], techniques: {},
  techniques_resolved: [], families: {}, verdicts: {},
}
export const EMPTY_INTEL: Intel = {
  generated: '', reports: 0, shared_iocs: [], imphash_clusters: [],
  families: [], attack_heatmap: {}, technique_totals: [],
}

export const VERDICT_BADGE: Record<string, 'error' | 'warning' | 'success' | 'neutral'> = {
  malicious: 'error', suspicious: 'warning', benign: 'success', unknown: 'neutral',
}
export const SEVERITY_COLOR: Record<string, string> = {
  critical: '#dc2626', high: '#f97316', medium: '#f59e0b', low: '#38bdf8',
}
