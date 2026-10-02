import { useMemo, useState } from 'react'
import { BadgeCheck, Star, ThumbsUp } from 'lucide-react'
import { Button, Field, Sheet, Toast, inputClass, useToast } from './ui'
import { Choice } from './forms'
import { addReview, summarize, useReviews, type ReviewItem } from '../lib/reviews'
import { SECTORS } from '../lib/providers'
import { CURRENT_USER } from '../lib/data'
import type { Sector } from '../lib/session'

export function StarRow({ n, size = 15 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} strokeWidth={0} className={i <= Math.round(n) ? 'fill-amber text-amber' : 'fill-line text-line'} />)}
    </span>
  )
}

/** Tap-to-rate input with keyboard support (arrow keys). */
export function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i} type="button" role="radio" aria-checked={value === i} aria-label={`${i} star${i > 1 ? 's' : ''}`}
          onClick={() => onChange(i)}
          onKeyDown={(e) => { if (e.key === 'ArrowRight') onChange(Math.min(5, value + 1)); if (e.key === 'ArrowLeft') onChange(Math.max(1, value - 1)) }}
          className="grid h-11 w-11 place-items-center rounded-xl transition active:scale-90 hover:bg-sand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/50"
        >
          <Star size={28} strokeWidth={1.5} className={i <= value ? 'fill-amber text-amber' : 'text-field'} />
        </button>
      ))}
    </div>
  )
}

const LABEL: Record<number, string> = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very good', 5: 'Excellent' }

export function WriteReview({ open, onClose, onDone, defaultPillar }: { open: boolean; onClose: () => void; onDone: () => void; defaultPillar?: Sector }) {
  const [pillar, setPillar] = useState<Sector>(defaultPillar ?? 'market')
  const [about, setAbout] = useState('')
  const [subject, setSubject] = useState('')
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const ok = about.trim() && rating > 0 && body.trim().length >= 10
  return (
    <Sheet
      open={open} onClose={onClose} title="Write a review" wide
      footer={<Button full size="lg" disabled={!ok} onClick={() => {
        addReview({ pillar, about: about.trim(), subject: subject.trim() || SECTORS.find((s) => s.id === pillar)!.full, author: CURRENT_USER.name.split(' ').map((w, i) => (i ? w[0] + '.' : w)).join(' '), level: CURRENT_USER.level ?? 'Member', rating, body: body.trim() })
        setAbout(''); setSubject(''); setRating(0); setBody(''); onDone()
      }}>Post review</Button>}
    >
      <div className="space-y-5">
        <Field label="What was it for?"><Choice options={SECTORS.map((s) => s.name)} value={SECTORS.find((s) => s.id === pillar)!.name} onChange={(v) => setPillar(SECTORS.find((s) => s.name === v)!.id)} /></Field>
        <Field label="Who are you reviewing?"><input className={inputClass} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Seller, landlord, driver or lab name" /></Field>
        <Field label="Item, room, ride or equipment (optional)"><input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. HP EliteBook 840" /></Field>
        <div>
          <span className="mb-1 block text-[13px] font-medium text-ink-700">Your rating {rating > 0 && <span className="font-normal text-ink-500">· {LABEL[rating]}</span>}</span>
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <Field label="Your experience" hint={`${body.trim().length < 10 ? 'At least 10 characters. ' : ''}Be specific and fair. Reviews can't be edited once posted.`}>
          <textarea className={`${inputClass} min-h-27.5 resize-none`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What went well? Was anything different from the listing?" maxLength={400} />
        </Field>
      </div>
    </Sheet>
  )
}

function ReviewCard({ r }: { r: ReviewItem }) {
  const [up, setUp] = useState(false)
  const p = SECTORS.find((s) => s.id === r.pillar)!
  return (
    <article className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-olive-100 font-display text-[14px] font-semibold text-olive-800">{r.author[0]}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="text-[15px] font-semibold">{r.author}</span>
            <span className="inline-flex items-center gap-1 text-[12px] text-olive-700"><BadgeCheck size={13} /> Verified student</span>
          </div>
          <p className="text-[12.5px] text-ink-500">{r.level} · {r.date}</p>
        </div>
        <StarRow n={r.rating} />
      </div>
      <p className="mt-3 text-[13px] text-ink-500"><span className="inline-flex items-center gap-1 rounded-full bg-olive-50 px-2 py-0.5 font-medium text-olive-800"><p.icon size={12} /> {p.name}</span> <span className="ml-1">{r.about} · {r.subject}</span></p>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{r.body}</p>
      {r.reply && (
        <div className="mt-3 rounded-xl bg-paper p-3 text-[13.5px] text-ink-700"><span className="font-semibold">Reply from {r.about}:</span> {r.reply}</div>
      )}
      <button onClick={() => setUp(!up)} aria-pressed={up} className={`mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition active:scale-95 ${up ? 'bg-olive-100 text-olive-800' : 'text-ink-500 hover:bg-sand'}`}>
        <ThumbsUp size={14} /> Helpful ({r.helpful + (up ? 1 : 0)})
      </button>
    </article>
  )
}

/** Ratings summary, filters and review list. Used by the public /reviews page and inside the app. */
export function ReviewsBoard({ onWrite, compact = false }: { onWrite: () => void; compact?: boolean }) {
  const all = useReviews()
  const [pillar, setPillar] = useState<'All' | Sector>('All')
  const [stars, setStars] = useState(0)
  const [sort, setSort] = useState<'new' | 'high' | 'low'>('new')
  const [limit, setLimit] = useState(6)
  const scoped = useMemo(() => all.filter((r) => pillar === 'All' || r.pillar === pillar), [all, pillar])
  const sum = summarize(scoped)
  const list = useMemo(() => {
    const l = scoped.filter((r) => !stars || r.rating === stars)
    return sort === 'high' ? [...l].sort((a, b) => b.rating - a.rating || b.ts - a.ts) : sort === 'low' ? [...l].sort((a, b) => a.rating - b.rating || b.ts - a.ts) : l
  }, [scoped, stars, sort])

  return (
    <div>
      <div className={`grid grid-cols-1 gap-6 ${compact ? '' : 'lg:grid-cols-[320px_minmax(0,1fr)]'} items-start`}>
        <aside className={`rounded-2xl border border-line bg-white p-6 ${compact ? '' : 'lg:sticky lg:top-28'}`}>
          <div className="flex items-end gap-3">
            <span className="font-display text-[56px] font-semibold leading-none tracking-[-0.03em]">{sum.avg.toFixed(1)}</span>
            <div className="pb-1.5"><StarRow n={sum.avg} size={17} /><p className="mt-1 text-[13px] text-ink-500">{sum.total} review{sum.total === 1 ? '' : 's'}</p></div>
          </div>
          <ul className="mt-5 space-y-1.5">
            {sum.dist.map(({ s, n }) => (
              <li key={s}>
                <button onClick={() => { setStars(stars === s ? 0 : s); setLimit(6) }} aria-pressed={stars === s} className={`flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1 text-[13px] transition hover:bg-sand ${stars === s ? 'bg-olive-50 font-semibold' : ''}`}>
                  <span className="w-8 shrink-0 whitespace-nowrap text-left tabular-nums">{s} ★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-lime-500" style={{ width: `${sum.total ? (n / sum.total) * 100 : 0}%` }} /></span>
                  <span className="w-5 text-right tabular-nums text-ink-500">{n}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-5"><Button full onClick={onWrite}>Write a review</Button></div>
          <p className="mt-3 text-[12.5px] leading-snug text-ink-500">Only verified members who dealt with a provider can review them.</p>
        </aside>

        <div className="min-w-0">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="no-scrollbar -mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 pb-1">
              {(['All', ...SECTORS.map((s) => s.id)] as const).map((k) => {
                const label = k === 'All' ? 'All' : SECTORS.find((s) => s.id === k)!.name
                return <button key={k} onClick={() => { setPillar(k); setLimit(6) }} aria-pressed={pillar === k} className={`h-10 shrink-0 rounded-full border px-4 text-[14px] font-medium transition active:scale-95 ${pillar === k ? 'border-olive-950 bg-olive-950 text-white' : 'border-line bg-white text-ink-700 hover:border-field'}`}>{label}</button>
              })}
            </div>
            <label className="flex items-center gap-2 text-[13.5px] text-ink-500">
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 rounded-xl border border-line bg-white px-3 text-[14px] text-ink outline-none focus:border-olive-700 focus:ring-4 focus:ring-lime-400/40">
                <option value="new">Newest</option><option value="high">Highest rated</option><option value="low">Lowest rated</option>
              </select>
            </label>
          </div>

          <p className="mt-4 text-[13.5px] text-ink-500" aria-live="polite">{list.length} review{list.length === 1 ? '' : 's'}{stars ? ` with ${stars} stars` : ''}</p>
          <div className="mt-3 space-y-4">
            {list.slice(0, limit).map((r) => <ReviewCard key={r.id} r={r} />)}
            {list.length === 0 && (
              <div className="rounded-2xl border border-dashed border-field/60 p-10 text-center">
                <p className="font-semibold">No reviews match</p>
                <button onClick={() => { setStars(0); setPillar('All') }} className="mt-2 text-[14px] font-semibold text-olive-700 underline underline-offset-4">Clear filters</button>
              </div>
            )}
          </div>
          {list.length > limit && <div className="mt-6 flex justify-center"><Button variant="outline" onClick={() => setLimit(limit + 6)}>Show more reviews</Button></div>}
        </div>
      </div>
    </div>
  )
}

export function useReviewFlow(canWrite: boolean, gate: () => void) {
  const [open, setOpen] = useState(false)
  const [toast, show] = useToast()
  return {
    write: () => (canWrite ? setOpen(true) : gate()),
    node: (
      <>
        <WriteReview open={open} onClose={() => setOpen(false)} onDone={() => { setOpen(false); show('Review posted. Thank you!') }} />
        <Toast message={toast} />
      </>
    ),
  }
}
