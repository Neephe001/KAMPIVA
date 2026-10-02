import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowRight, BadgeCheck, Lock, MapPin, Search, Star, X } from 'lucide-react'
import { Btn, Img, KampivaMark } from './shared'
import { img, naira, type Listing, type Pillar } from './data'
import { session, type Launch } from '../lib/session'

/** Stable demo rating per listing so cards and the detail view always agree. */
function ratingFor(l: Listing) {
  let h = 0
  for (const c of l.id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return { score: 4 + (h % 10) / 10, count: 4 + (h % 37) }
}

const PAGE = 8
type Sort = 'featured' | 'low' | 'high' | 'rated'

/** Search, filter and preview listings for one pillar. Actions ask visitors to sign in, or open the app for members. */
export function Explorer({ p, initialQuery = '' }: { p: Pillar; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [cat, setCat] = useState('All')
  const [sort, setSort] = useState<Sort>('featured')
  const [shown, setShown] = useState(PAGE)
  const [view, setView] = useState<Listing | null>(null)
  const [gate, setGate] = useState<{ action: string; launch?: Launch } | null>(null)
  const navigate = useNavigate()

  useEffect(() => setQuery(initialQuery), [initialQuery])
  useEffect(() => setShown(PAGE), [query, cat, sort])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const r = p.items.filter((l) => (cat === 'All' || l.cat === cat) && (!q || `${l.title} ${l.tags} ${l.cat} ${l.where}`.toLowerCase().includes(q)))
    if (sort === 'low') return [...r].sort((a, b) => a.price - b.price)
    if (sort === 'high') return [...r].sort((a, b) => b.price - a.price)
    if (sort === 'rated') return [...r].sort((a, b) => ratingFor(b).score - ratingFor(a).score)
    return r
  }, [p, query, cat, sort])

  // Signed-in members go straight into the app; visitors see the sign-up prompt.
  const act = (action: string, l?: Listing) => {
    const launch: Launch = l
      ? { type: 'listing', id: l.id }
      : { type: 'discover', pillar: p.key, q: '' }
    if (session.user()) {
      const target = l ? `/app?listing=${encodeURIComponent(l.id)}` : '/app'
      session.setLaunch(launch)
      session.setNext(target)
      navigate(target)
    } else {
      setView(null)
      setGate({ action, launch })
    }
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible" role="group" aria-label="Filter by category">
          {p.cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`h-10 shrink-0 rounded-full border px-4 text-[14px] font-medium transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/50 ${cat === c ? 'border-olive-950 bg-olive-950 text-white' : 'border-line bg-white text-ink-700 hover:border-field'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <label className="relative sm:w-[300px]">
            <span className="sr-only">Search {p.name}</span>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={p.search}
              className="h-12 w-full rounded-full border border-field bg-white pl-11 pr-4 text-[15px] outline-none transition focus:border-olive-700 focus:ring-4 focus:ring-lime-400/40 placeholder:text-ink-500"
            />
          </label>
          <label className="sr-only" htmlFor={`sort-${p.key}`}>Sort</label>
          <select id={`sort-${p.key}`} value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-12 rounded-full border border-field bg-white px-4 text-[15px] outline-none transition focus:border-olive-700 focus:ring-4 focus:ring-lime-400/40">
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="rated">Top rated</option>
          </select>
        </div>
      </div>

      <p className="mt-5 text-[14px] text-ink-500" aria-live="polite">
        {results.length} {results.length === 1 ? 'result' : 'results'}
        {(query || cat !== 'All') && <button onClick={() => { setQuery(''); setCat('All') }} className="ml-3 font-semibold text-olive-700 underline underline-offset-4">Clear filters</button>}
      </p>

      {results.length ? (
        <>
          <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {results.slice(0, shown).map((l) => <li key={l.id}><Card l={l} onOpen={() => setView(l)} /></li>)}
            {shown >= results.length && <li><MoreCard name={p.name} onOpen={() => act(`see every ${p.name} listing`)} /></li>}
          </ul>
          {shown < results.length && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <Btn variant="outline" onClick={() => setShown(shown + PAGE)}>Show more</Btn>
              <span className="text-[13px] text-ink-500">Showing {Math.min(shown, results.length)} of {results.length}</span>
            </div>
          )}
        </>
      ) : (
        <div className="mt-8 grid place-items-center rounded-[28px] bg-olive-950 px-6 py-14 text-center text-white">
          <KampivaMark className="h-12" />
          <p className="mt-6 max-w-md font-display text-[24px] sm:text-[28px] font-semibold leading-tight">{query.trim() ? `“${query.trim()}” could be one sign-in away.` : 'Nothing here yet.'}</p>
          <p className="mt-3 max-w-md text-white/75">You're seeing a small sample. Students post new {p.noun.toLowerCase()} every day, and members can search all of it. Join free or log in to see what matches.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Btn variant="lime" onClick={() => act(query.trim() ? `see results for “${query.trim()}”` : `see every ${p.name} listing`)}>{session.user() ? 'Search in the app' : 'Join free to see results'} <ArrowRight size={18} /></Btn>
            <Btn variant="ghostDark" onClick={() => { setQuery(''); setCat('All') }}>Clear filters</Btn>
          </div>
        </div>
      )}

      {view && <Detail p={p} l={view} onClose={() => setView(null)} onAct={(a) => act(a, view)} />}
      {gate && <Gate action={gate.action} launch={gate.launch} onClose={() => setGate(null)} />}
    </div>
  )
}

/** Closing card in the grid: nudges visitors to join for the full catalogue. */
function MoreCard({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="group relative flex h-full min-h-[340px] w-full flex-col overflow-hidden rounded-[22px] bg-olive-950 p-7 text-left text-white transition duration-300 hover:-translate-y-1 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/60">
      <KampivaMark className="pointer-events-none absolute -right-8 -bottom-8 h-48 opacity-[0.08] transition duration-700 group-hover:rotate-12" />
      <h3 className="font-display text-[24px] font-semibold leading-tight">There's a lot more where this came from.</h3>
      <p className="mt-3 text-[14.5px] text-white/75">{session.user() ? `Open the app to browse every ${name} listing on your campus.` : `Sign up free to unlock every ${name} listing on your campus, plus new posts the moment they go live.`}</p>
      <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-lime-400 px-5 py-2.5 text-[14px] font-semibold text-olive-950">
        {session.user() ? 'Open app' : 'See more'} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  )
}

function Card({ l, onOpen }: { l: Listing; onOpen: () => void }) {
  const r = ratingFor(l)
  return (
    <article className="group flex h-full flex-col rounded-[22px] border border-line bg-white p-2 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-olive-950/[0.07]">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-sand">
        <Img src={img(l.photo, 640, 400)} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
        {l.badge && <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[12.5px] font-semibold text-olive-800">{l.badge}</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <div className="font-display text-[19px] font-semibold">{naira(l.price)}{l.unit && <span className="font-sans text-[13px] font-normal text-ink-500"> /{l.unit.replace(/^per /, '')}</span>}</div>
          <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-ink-700"><Star size={13} className="fill-amber text-amber" strokeWidth={0} />{r.score.toFixed(1)}<span className="font-normal text-ink-400">({r.count})</span></span>
        </div>
        <h3 className="mt-0.5 text-[16px] font-semibold leading-snug">{l.title}</h3>
        <div className="mt-2 mb-4 flex items-center gap-1.5 text-[13.5px] text-ink-500"><MapPin size={14} className="shrink-0" /><span className="truncate">{l.where}</span></div>
        <div className="mt-auto pt-3 border-t border-line flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-500">
          <span className="inline-flex items-center gap-1 font-medium text-ink-700"><BadgeCheck size={14} className="text-olive-700" />{l.by}</span>
          {l.facts.slice(0, 1).map(([, v]) => <span key={v} className="truncate">{v}</span>)}
        </div>
        <button onClick={onOpen} className="mt-4 w-full rounded-full border border-ink/80 py-2.5 text-[14px] font-medium transition hover:bg-olive-950 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/60">
          View detail<span className="sr-only">: {l.title}</span>
        </button>
      </div>
    </article>
  )
}

export function Modal({ onClose, label, children }: { onClose: () => void; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const on = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', on)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', on); document.body.style.overflow = ''; prev?.focus() }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[60] grid place-items-end sm:place-items-center bg-olive-950/50 sm:p-6 animate-fade" onClick={onClose}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()} className="relative w-full sm:max-w-[520px] max-h-[92dvh] overflow-auto rounded-t-[24px] sm:rounded-[24px] bg-white outline-none animate-rise">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow transition hover:bg-sand active:scale-90"><X size={20} /></button>
        {children}
      </div>
    </div>
  )
}

function Detail({ p, l, onClose, onAct }: { p: Pillar; l: Listing; onClose: () => void; onAct: (a: string) => void }) {
  const r = ratingFor(l)
  return (
    <Modal onClose={onClose} label={l.title}>
      <div className="aspect-[16/10] bg-sand"><Img src={img(l.photo, 1040, 650)} alt={l.title} className="h-full w-full object-cover" /></div>
      <div className="p-6 sm:p-8">
        <span className="text-[13px] font-semibold text-olive-700">Kampiva {p.name} · {l.cat}</span>
        <h3 className="mt-1 text-[24px] font-semibold leading-snug">{l.title}</h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <div className="font-display text-[22px] font-semibold text-olive-800">{naira(l.price)} {l.unit && <span className="font-sans text-[15px] font-normal text-ink-500">{l.unit}</span>}</div>
          <Link to="/reviews" onClick={onClose} className="inline-flex items-center gap-1 text-[14px] font-medium text-ink-700 underline decoration-lime-400 decoration-2 underline-offset-4"><Star size={14} className="fill-amber text-amber" strokeWidth={0} />{r.score.toFixed(1)} · {r.count} reviews</Link>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-[14px]">
          {[['Location', l.where] as [string, string], ...l.facts].map(([k, v]) => (
            <div key={k}><dt className="text-ink-500">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>
          ))}
        </dl>
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-paper border border-line p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-olive-100 font-semibold text-olive-800">{l.by.replace(/^(Dr\.|Mr\.|Mrs\.|Engr\.) /, '')[0]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 font-semibold">{l.by}<BadgeCheck size={16} className="text-olive-700" /></div>
            <div className="text-[13.5px] text-ink-500">{l.byMeta}</div>
          </div>
          <span className="inline-flex items-center gap-1 text-[12.5px] text-ink-500"><Lock size={13} />Contact hidden</span>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          <Btn onClick={() => onAct(p.gate)}>{p.primary}</Btn>
          <Btn variant="outline" onClick={() => onAct(`message ${l.by}`)}>{p.secondary(l.by)}</Btn>
        </div>
      </div>
    </Modal>
  )
}

/** Sign-up prompt. Remembers the page and what the visitor wanted, so sign-in can bring them straight back to it. */
export function Gate({ action, onClose, launch }: { action: string; onClose: () => void; launch?: Launch }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const to = (r: 'signup' | 'login') => {
    const next = launch?.type === 'listing' ? `/app?listing=${encodeURIComponent(launch.id)}` : pathname
    session.setNext(next)
    if (launch) session.setLaunch(launch)
    navigate(`/${r}`)
  }
  return (
    <Modal onClose={onClose} label="Sign up to continue">
      <div className="p-8 sm:p-10 text-center">
        <KampivaMark className="mx-auto h-14" />
        <h3 className="mt-6 text-[26px] font-semibold leading-tight">One quick step to {action}.</h3>
        <p className="mt-3 text-ink-700">Everyone on Kampiva is a confirmed student, so we ask you to verify too. It's free and takes about 2 minutes with any email.</p>
        <div className="mt-8 grid gap-3">
          <Btn onClick={() => to('signup')}>Create my free account <ArrowRight size={18} /></Btn>
          <Btn variant="ghost" onClick={() => to('login')}>I already have an account</Btn>
        </div>
        <button onClick={onClose} className="mt-4 min-h-10 px-3 text-[14px] text-ink-500 underline underline-offset-4 hover:text-ink">Keep browsing</button>
      </div>
    </Modal>
  )
}
