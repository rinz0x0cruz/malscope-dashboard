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
  config?: MalwareConfig
  ioc_context?: Record<string, IocContext>
}

export interface IocContext {
  classification: string
  noise?: boolean
  riot?: boolean
  name?: string
  tags?: string[]
  asn?: string
  last_seen?: string
}

export interface MalwareConfig {
  c2: string[]
  keys: string[]
  campaign: string[]
  mutex: string[]
  version: string[]
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

export interface SharedIoc {
  bucket: string; value: string; reports: string[]; count: number
  classification?: string; tags?: string[]
}
export interface ImphashCluster { imphash: string; reports: string[]; count: number }
export interface TlshCluster { reports: string[]; count: number; max_distance: number }
export interface FamilyGroup { family: string; reports: string[]; count: number }
export interface ConfigLink { field: string; value: string; reports: string[]; count: number }
export interface OperatorSignal { field: string; value: string }
export interface OperatorCluster { reports: string[]; signals: OperatorSignal[]; count: number }
export interface HeatTactic { count: number; techniques: { id: string; name: string; count: number }[] }

export interface Intel {
  generated: string
  reports: number
  shared_iocs: SharedIoc[]
  imphash_clusters: ImphashCluster[]
  tlsh_clusters: TlshCluster[]
  families: FamilyGroup[]
  config_links: ConfigLink[]
  operator_clusters: OperatorCluster[]
  attack_heatmap: Record<string, HeatTactic>
  technique_totals: TechniqueResolved[]
}

export const EMPTY_MANIFEST: Manifest = {
  generated: '', count: 0, reports: [], techniques: {},
  techniques_resolved: [], families: {}, verdicts: {},
}
export const EMPTY_INTEL: Intel = {
  generated: '', reports: 0, shared_iocs: [], imphash_clusters: [], tlsh_clusters: [],
  families: [], config_links: [], operator_clusters: [], attack_heatmap: {}, technique_totals: [],
}

export interface Detection {
  id: string
  family: string
  filename: string
  verdict: string
  severity: string
  report: string
  yara: string
  sigma: string
  sigma_count: number
}
export interface DetectionsManifest {
  generated: string
  count: number
  detections: Detection[]
}
export const EMPTY_DETECTIONS: DetectionsManifest = { generated: '', count: 0, detections: [] }

export const VERDICT_BADGE: Record<string, 'error' | 'warning' | 'success' | 'neutral'> = {
  malicious: 'error', suspicious: 'warning', benign: 'success', unknown: 'neutral',
}
export const SEVERITY_COLOR: Record<string, string> = {
  critical: '#dc2626', high: '#f97316', medium: '#f59e0b', low: '#38bdf8',
}

// ATT&CK tactic -> color (used by the Overview donut). Fallback zinc for unknown.
export const TACTIC_COLOR: Record<string, string> = {
  'Reconnaissance': '#a78bfa',
  'Resource Development': '#8b5cf6',
  'Initial Access': '#f472b6',
  'Execution': '#22d3ee',
  'Persistence': '#34d399',
  'Privilege Escalation': '#f59e0b',
  'Defense Evasion': '#ef4444',
  'Credential Access': '#eab308',
  'Discovery': '#38bdf8',
  'Lateral Movement': '#fb923c',
  'Collection': '#c084fc',
  'Command and Control': '#60a5fa',
  'Exfiltration': '#fb7185',
  'Impact': '#f43f5e',
}
