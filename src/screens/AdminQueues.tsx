import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react'
import { Button } from '../components/ui'
import { REPORT_OUTCOME_LADDER, REPORT_OUTCOME_LABEL, REPORT_STATUS_LABEL, reportsStore, updateReportStatus } from '../lib/reports'

const STATUS_FLOW = ['submitted', 'under_review', 'info_requested', 'decision'] as const

export function AdminQueues() {
  const reports = reportsStore.use()
  const [selectedId, setSelectedId] = useState<string | null>(reports[0]?.id ?? null)
  const selected = useMemo(() => reports.find((item) => item.id === selectedId) ?? reports[0] ?? null, [reports, selectedId])

  const setStatus = (next: (typeof STATUS_FLOW)[number], outcome?: 'no_action' | 'warning' | 'restricted' | 'escalated' | 'banned') => {
    if (!selected) return
    updateReportStatus(selected.id, next, outcome, next === 'decision' ? 'Trust & safety' : undefined)
  }

  return (
    <div className="absolute inset-0 hidden md:flex flex-col bg-paper">
      <header className="flex h-[72px] items-center justify-between border-b border-line bg-white px-6">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-400">Admin</p>
          <h1 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">Verification and report queues</h1>
        </div>
        <span className="rounded-full bg-olive-100 px-3 py-1 text-[12px] font-semibold text-olive-800">Desktop view</span>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-[360px] shrink-0 border-r border-line bg-white">
          <div className="border-b border-line p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-400">Queue</p>
          </div>
          <div className="divide-y divide-line">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedId(report.id)}
                className={`flex w-full items-start gap-3 px-4 py-4 text-left transition ${selected?.id === report.id ? 'bg-olive-50' : 'hover:bg-soft'}`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-100 text-olive-800"><ShieldCheck size={17} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="block text-[13px] font-semibold text-ink">{report.reference}</span>
                    <span className="rounded-full bg-soft px-2 py-0.5 text-[10px] font-semibold text-ink-500">{REPORT_STATUS_LABEL[report.status]}</span>
                  </span>
                  <span className="mt-1 block truncate text-[14px] font-medium text-ink">{report.issue}</span>
                  <span className="mt-1 block text-[12px] text-ink-500">{report.sourceLabel}</span>
                </span>
                <ChevronRight size={16} className="mt-1 text-ink-400" />
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {selected ? (
            <div className="mx-auto max-w-[820px] space-y-6">
              <div className="rounded-3xl border border-line bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-400">Case summary</p>
                    <h2 className="mt-2 font-display text-[28px] font-semibold tracking-[-0.03em] text-ink">{selected.reference}</h2>
                  </div>
                  <span className="rounded-full border border-lime-200 bg-lime-50 px-3 py-1 text-[12px] font-semibold text-lime-800">{REPORT_STATUS_LABEL[selected.status]}</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-soft p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-400">Context</p>
                    <p className="mt-2 text-[15px] font-semibold text-ink">{selected.sourceLabel}</p>
                    <p className="mt-1 text-[13px] text-ink-500">{selected.context} · {selected.pillar}</p>
                  </div>
                  <div className="rounded-2xl bg-soft p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-400">Issue</p>
                    <p className="mt-2 text-[15px] font-semibold text-ink">{selected.issue}</p>
                    <p className="mt-1 text-[13px] text-ink-500">{selected.requestedBy}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-line bg-white p-5">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-400">Report details</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-700">{selected.description}</p>
                  <div className="mt-5 rounded-2xl border border-line bg-paper p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-400">Attached evidence</p>
                    <ul className="mt-3 space-y-2 text-[13px] text-ink-600">
                      {selected.evidence.map((item) => <li key={item}>• {item}</li>)}
                      {selected.attachments.map((file) => (
                        <li key={file.id}>• Attachment: {file.name} ({file.type})</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-3xl border border-line bg-white p-5">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-400">Outcome ladder</p>
                  <div className="mt-3 space-y-2">
                    {REPORT_OUTCOME_LADDER.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setStatus('decision', option.value)}
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-[13px] font-medium transition ${selected.outcome === option.value ? 'border-olive-700 bg-olive-50 text-olive-800' : 'border-line text-ink-700 hover:border-ink-400'}`}
                      >
                        <span>{option.label}</span>
                        <CheckCircle2 size={15} className={selected.outcome === option.value ? 'text-olive-700' : 'text-ink-300'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-white p-5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-400">Escalation routing</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    'Community safety',
                    'Fraud investigation',
                    'Provider escalation',
                    'Campus support',
                  ].map((route) => (
                    <button key={route} onClick={() => setStatus('under_review')} className="rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-medium text-ink-700 hover:border-ink-400">
                      {route}
                    </button>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <Button onClick={() => setStatus('under_review')}>Move to under review</Button>
                  <Button variant="outline" onClick={() => setStatus('info_requested')}>Request info</Button>
                  <Button variant="soft" color="#c23b22" onClick={() => setStatus('decision', 'banned')}>Decision: suspend</Button>
                  <Button variant="soft" color="#556522" onClick={() => setStatus('decision', 'warning')}>Decision: warn</Button>
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-white p-5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-400">Tracker</p>
                <div className="mt-4 space-y-3">
                  {STATUS_FLOW.map((step, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <span className={`grid h-8 w-8 place-items-center rounded-full text-[12px] font-bold ${STATUS_FLOW.indexOf(selected.status) >= index ? 'bg-lime-400 text-olive-950' : 'bg-soft text-ink-400'}`}>
                        {index + 1}
                      </span>
                      <span className={`text-[13px] ${STATUS_FLOW.indexOf(selected.status) >= index ? 'font-semibold text-ink' : 'text-ink-400'}`}>
                        {REPORT_STATUS_LABEL[step]}
                      </span>
                    </div>
                  ))}
                </div>
                {selected.outcome && (
                  <div className="mt-5 flex items-center gap-2 rounded-2xl bg-alert/5 px-3 py-2 text-[13px] font-medium text-alert">
                    <AlertTriangle size={15} /> Outcome: {REPORT_OUTCOME_LABEL[selected.outcome]}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid h-full place-items-center text-ink-400">No cases in the queue yet.</div>
          )}
        </main>
      </div>
    </div>
  )
}
