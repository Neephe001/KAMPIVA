import { persisted } from './session'
import type { Pillar } from './types'

export type ReportContext = 'listing' | 'chat' | 'order' | 'profile' | 'review'
export type ReportStatus = 'submitted' | 'under_review' | 'info_requested' | 'decision'
export type ReportOutcome = 'no_action' | 'warning' | 'restricted' | 'escalated' | 'banned'

export interface ReportAttachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
}

export interface ReportEntry {
  id: string
  reference: string
  context: ReportContext
  sourceId: string
  sourceLabel: string
  title: string
  pillar: Pillar
  issue: string
  description: string
  evidence: string[]
  attachments: ReportAttachment[]
  requestedBy: string
  status: ReportStatus
  outcome?: ReportOutcome
  escalatedTo?: string
  createdAt: string
  updatedAt: string
}

export const REPORT_ISSUES: Record<Pillar, string[]> = {
  market: ['Misleading listing', 'Scam or fake payment', 'Unsafe meetup', 'Offensive content', 'Other'],
  research: ['Equipment mismatch', 'Unauthorised use', 'Verification issue', 'Unsafe or inappropriate behaviour', 'Other'],
  stay: ['Property mismatch', 'Safety concern', 'Misrepresentation', 'Harassment', 'Other'],
  move: ['Driver safety', 'Route or fare issue', 'Vehicle concerns', 'Disrespectful behaviour', 'Other'],
}

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under review',
  info_requested: 'Info requested',
  decision: 'Decision',
}

export const REPORT_OUTCOME_LABEL: Record<ReportOutcome, string> = {
  no_action: 'No action',
  warning: 'Warning',
  restricted: 'Restricted access',
  escalated: 'Escalated to safety team',
  banned: 'Account suspended',
}

export const REPORT_OUTCOME_LADDER: Array<{ value: ReportOutcome; label: string }> = [
  { value: 'no_action', label: 'No action' },
  { value: 'warning', label: 'Warning' },
  { value: 'restricted', label: 'Restricted access' },
  { value: 'escalated', label: 'Escalated to safety team' },
  { value: 'banned', label: 'Account suspended' },
]

export const reportsStore = persisted<ReportEntry[]>('kv-reports', seedReports())

export function createReport(params: {
  context: ReportContext
  sourceId: string
  sourceLabel: string
  title: string
  pillar: Pillar
  issue: string
  description: string
  evidence?: string[]
  attachments?: ReportAttachment[]
  requestedBy?: string
}): ReportEntry {
  const now = new Date().toISOString()
  const evidence = params.evidence ?? [params.sourceLabel]
  const entry: ReportEntry = {
    id: `report-${Date.now()}`,
    reference: `KMP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    context: params.context,
    sourceId: params.sourceId,
    sourceLabel: params.sourceLabel,
    title: params.title,
    pillar: params.pillar,
    issue: params.issue,
    description: params.description,
    evidence,
    attachments: params.attachments ?? [],
    requestedBy: params.requestedBy ?? 'Member',
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
  }
  reportsStore.set((items) => [entry, ...items])
  return entry
}

export function updateReportStatus(id: string, nextStatus: ReportStatus, outcome?: ReportOutcome, escalatedTo?: string) {
  reportsStore.set((items) => items.map((item) => item.id === id ? {
    ...item,
    status: nextStatus,
    outcome: outcome ?? item.outcome,
    escalatedTo: escalatedTo ?? item.escalatedTo,
    updatedAt: new Date().toISOString(),
  } : item))
}

function seedReports(): ReportEntry[] {
  const now = Date.now()
  const iso = (offset: number) => new Date(now - offset * 86400000).toISOString()
  return [
    {
      id: 'report-demo-1',
      reference: 'KMP-5F9A12',
      context: 'listing',
      sourceId: 'm1',
      sourceLabel: 'HP ProBook 440 G7 listing',
      title: 'Listing reported',
      pillar: 'market',
      issue: 'Scam or fake payment',
      description: 'The seller asked to move payment off-platform before even meeting.',
      evidence: ['Listing details', 'Message thread excerpt'],
      attachments: [],
      requestedBy: 'Student',
      status: 'under_review',
      outcome: 'warning',
      escalatedTo: 'Safety team',
      createdAt: iso(2),
      updatedAt: iso(1),
    },
    {
      id: 'report-demo-2',
      reference: 'KMP-7D1C44',
      context: 'order',
      sourceId: 'ord-demo-2',
      sourceLabel: 'Order for SEM booking',
      title: 'Order dispute reported',
      pillar: 'research',
      issue: 'Equipment mismatch',
      description: 'The lab equipment arrived without the agreed training and failed the basic setup checklist.',
      evidence: ['Order timeline', 'Receipt upload'],
      attachments: [],
      requestedBy: 'Researcher',
      status: 'info_requested',
      outcome: 'restricted',
      createdAt: iso(5),
      updatedAt: iso(4),
    },
    {
      id: 'report-demo-3',
      reference: 'KMP-2A9E81',
      context: 'chat',
      sourceId: 'new-t1',
      sourceLabel: 'Chat with Aisha R.',
      title: 'Safety concern in chat',
      pillar: 'stay',
      issue: 'Harassment',
      description: 'The other party pressed for personal details and continued after being told no.',
      evidence: ['Chat transcript'],
      attachments: [],
      requestedBy: 'Member',
      status: 'decision',
      outcome: 'escalated',
      escalatedTo: 'Trust & safety',
      createdAt: iso(7),
      updatedAt: iso(6),
    },
  ]
}
