import { useMemo, useState, type ChangeEvent } from 'react'
import { AlertTriangle, CheckCircle2, ShieldAlert, X } from 'lucide-react'
import { Button, Field, Sheet } from './ui'
import { REPORT_ISSUES, REPORT_STATUS_LABEL, createReport, type ReportAttachment } from '../lib/reports'
import type { Pillar } from '../lib/types'

function Tracker({ status }: { status: 'submitted' | 'under_review' | 'info_requested' | 'decision' }) {
  const steps = ['submitted', 'under_review', 'info_requested', 'decision'] as const
  const index = steps.indexOf(status)
  return (
    <div className="space-y-2.5">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-3">
          <span className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${i <= index ? 'bg-lime-400 text-olive-950' : 'bg-soft text-ink-400'}`}>
            {i + 1}
          </span>
          <span className={`text-[13px] ${i <= index ? 'font-semibold text-ink' : 'text-ink-400'}`}>
            {REPORT_STATUS_LABEL[step]}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ReportFlow({
  open,
  onClose,
  context,
  sourceId,
  sourceLabel,
  title,
  pillar,
  autoEvidence = [],
}: {
  open: boolean
  onClose: () => void
  context: 'listing' | 'chat' | 'order' | 'profile' | 'review'
  sourceId: string
  sourceLabel: string
  title: string
  pillar: Pillar
  autoEvidence?: string[]
}) {
  const [danger, setDanger] = useState(false)
  const [issue, setIssue] = useState<string>(REPORT_ISSUES[pillar][0])
  const [detail, setDetail] = useState('')
  const [attachments, setAttachments] = useState<ReportAttachment[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [reference, setReference] = useState<string | null>(null)

  const evidence = useMemo(() => [sourceLabel, ...autoEvidence], [sourceLabel, autoEvidence])

  const readFileAsDataUrl = (file: File) => new Promise<ReportAttachment>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      dataUrl: typeof reader.result === 'string' ? reader.result : '',
    })
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
    reader.readAsDataURL(file)
  })

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    const next = await Promise.all(files.map(readFileAsDataUrl))
    setAttachments((current) => [...current, ...next])
    event.target.value = ''
  }

  const removeAttachment = (id: string) => setAttachments((current) => current.filter((item) => item.id !== id))

  const submit = () => {
    const report = createReport({
      context,
      sourceId,
      sourceLabel,
      title,
      pillar,
      issue,
      description: detail.trim() || 'No extra details were added.',
      evidence: [...evidence, ...attachments.map((item) => `Attachment: ${item.name}`)],
      attachments,
      requestedBy: 'Member',
    })
    setReference(report.reference)
    setSubmitted(true)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={submitted ? 'Report submitted' : title}
      wide
      footer={
        submitted ? (
          <Button full onClick={onClose}>Close</Button>
        ) : (
          <Button full color="#c23b22" disabled={!issue || !detail.trim()} onClick={submit}>Submit report</Button>
        )
      }
    >
      {!submitted ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-alert/20 bg-alert/5 p-3.5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-full bg-alert/10 text-alert"><ShieldAlert size={18} /></span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-ink">Emergency prompt</p>
                <p className="mt-1 text-[12.5px] text-ink-600">If this is an immediate danger or someone is at risk, stop and call campus security or emergency services now.</p>
                <button type="button" onClick={() => setDanger((v) => !v)} className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold ${danger ? 'bg-alert text-white' : 'bg-white text-alert border border-alert/30'}`}>
                  <AlertTriangle size={13} /> {danger ? 'Emergency help flagged' : 'I need emergency help'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-ink-400">Issue type</p>
            <div className="space-y-2">
              {REPORT_ISSUES[pillar].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setIssue(item)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-[14px] transition ${issue === item ? 'border-alert bg-alert/5' : 'border-line hover:border-ink-400'}`}
                >
                  <span className={`h-4 w-4 rounded-full border-2 ${issue === item ? 'border-alert bg-alert' : 'border-line'}`} />
                  {item}
                </button>
              ))}
            </div>
          </div>

          <Field label="What happened?">
            <textarea
              rows={4}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Add as much detail as you can. We will review it and keep your identity private."
              className="w-full resize-none rounded-xl border border-line bg-soft px-3.5 py-3 text-[15px] text-ink outline-none focus:border-brand focus:bg-white transition"
            />
          </Field>

          <div className="rounded-2xl border border-line bg-soft p-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-400">Evidence attached automatically</p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-olive-700/30 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-olive-800">
                <input type="file" accept="image/*,.pdf" multiple onChange={handleFiles} className="hidden" />
                Add files
              </label>
            </div>
            <ul className="mt-2 space-y-1.5 text-[12.5px] text-ink-600">
              {evidence.map((item) => <li key={item}>• {item}</li>)}
            </ul>

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">Screenshots and documents</p>
                <ul className="space-y-2">
                  {attachments.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 py-2 text-[12.5px] text-ink-600">
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                      <button type="button" onClick={() => removeAttachment(item.id)} aria-label={`Remove ${item.name}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-500 hover:bg-soft hover:text-alert">
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 py-2">
          <div className="rounded-2xl border border-lime-200 bg-lime-50 p-4">
            <div className="flex items-center gap-2 text-lime-800">
              <CheckCircle2 size={18} />
              <span className="text-[13px] font-semibold">Reference number created</span>
            </div>
            <p className="mt-2 font-display text-[26px] font-semibold tracking-tight text-ink">{reference}</p>
            <p className="mt-1 text-[13px] text-ink-600">Your report is now in the submitted queue.</p>
          </div>
          <div className="rounded-2xl border border-line bg-paper p-4">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-400">Tracker</p>
            <div className="mt-3"><Tracker status="submitted" /></div>
          </div>
          <div className="rounded-2xl border border-line p-4">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-400">Summary</p>
            <dl className="mt-2 space-y-2 text-[13px]">
              <div className="flex justify-between gap-3"><dt className="text-ink-500">Issue</dt><dd className="font-semibold text-ink">{issue}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-500">Status</dt><dd className="font-semibold text-ink">Submitted</dd></div>
            </dl>
          </div>
        </div>
      )}
    </Sheet>
  )
}
