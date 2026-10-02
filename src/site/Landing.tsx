import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, BadgeCheck, ChevronDown, MapPin, Search, ShieldCheck, Star, Users } from 'lucide-react'
import { Btn, Eyebrow, Img, Reveal, useGo, useStartProvider } from './shared'
import { img, naira, PILLARS, type PillarKey } from './data'
import { JoinBand, PILLAR_ICON } from './Pages'
import { SECTORS } from '../lib/providers'
import { SEED_REVIEWS } from '../lib/reviews'
import { StarRow } from '../components/Reviews'
import { useUser } from '../lib/session'

const SCHOOLS = ['UNILORIN', 'UI Ibadan', 'OAU', 'UNILAG', 'UNN', 'ABU Zaria', 'FUTA', 'LASU']
const field = 'h-12 w-full rounded-xl bg-sand pl-3 pr-10 text-[15px] outline-none transition focus:ring-4 focus:ring-lime-400/50'

function Heading({ eyebrow, title, body, light }: { eyebrow?: string; title: string; body?: string; light?: boolean }) {
  return (
    <Reveal className="max-w-2xl">
      {eyebrow && <Eyebrow dark={light}>{eyebrow}</Eyebrow>}
      <h2 className={`${eyebrow ? 'mt-4' : ''} text-[30px] sm:text-[38px] leading-[1.1] font-semibold tracking-[-0.02em] ${light ? 'text-white' : ''}`}>{title}</h2>
      {body && <p className={`mt-4 text-[17px] leading-relaxed ${light ? 'text-white/80' : 'text-ink-500'}`}>{body}</p>}
    </Reveal>
  )
}

export function Landing() {
  const go = useGo()
  const navigate = useNavigate()
  const user = useUser()
  const startProvider = useStartProvider()
  const [tab, setTab] = useState<PillarKey>('market')
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [where, setWhere] = useState('')
  const current = PILLARS.find((p) => p.key === tab)!

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const term = (tab === 'move' ? to.trim() || from.trim() : q.trim() || where).trim()
    navigate(`/${tab}${term ? `?q=${encodeURIComponent(term)}` : ''}`)
  }
  const quick = (k: PillarKey, t: string) => navigate(`/${k}?q=${encodeURIComponent(t)}`)
  const top = [...SEED_REVIEWS].filter((r) => r.rating === 5).sort((a, b) => b.helpful - a.helpful).slice(0, 3)

  return (
    <main>
      {/* Hero: same layout as every pillar page */}
      <section className="bg-paper border-b border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 pt-14 pb-16 lg:pt-20 lg:pb-20 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-olive-100 px-3.5 py-1.5 text-[14px] font-semibold text-olive-800">
              <span className="h-2 w-2 rounded-full bg-lime-500 animate-ping-soft" />Now live at University of Ilorin
            </span>
            <h1 className="mt-6 text-[38px] sm:text-[52px] leading-[1.05] font-semibold tracking-[-0.03em]">Campus life, sorted by people you can trust.</h1>
            <p className="mt-5 max-w-[520px] text-[18px] leading-relaxed text-ink-700">Buy and sell, borrow lab equipment, find a room and share rides. Everyone here is a verified student or a checked provider.</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Btn onClick={() => go(user ? 'app' : 'signup')}>{user ? 'Open app' : 'Join free'} <ArrowRight size={18} /></Btn>
              {user
                ? <button onClick={() => startProvider()} className="font-semibold text-olive-700 underline decoration-lime-400 decoration-2 underline-offset-[6px] hover:text-olive-900">Become a provider</button>
                : <span className="text-ink-700">Have an account? <button onClick={() => go('login')} className="font-semibold text-olive-700 underline decoration-lime-400 decoration-2 underline-offset-[6px] hover:text-olive-900">Log in</button></span>}
            </div>
            <dl className="mt-10 grid max-w-[520px] grid-cols-3 gap-4 border-t border-line pt-6">
              {[['100%', 'verified by email and phone'], ['4 in 1', 'Market, Research, Stay, Move'], ['4.8', 'average student rating']].map(([n, l]) => (
                <div key={n}><dt className="font-display text-[26px] sm:text-[30px] font-semibold leading-none">{n}</dt><dd className="mt-2 text-[13px] leading-snug text-ink-500">{l}</dd></div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-sand animate-rise [animation-delay:100ms]">
            <Img src={img('photo-1759852692971-a2abc6799cbd', 1000, 750)} alt="A smiling student walking across campus with books" className="h-full w-full object-cover" />
            <div className="animate-float absolute left-4 bottom-4 flex items-center gap-3 rounded-2xl bg-white pl-2.5 pr-4 py-2.5 shadow-xl shadow-black/15">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-lime-400 text-olive-950"><BadgeCheck size={19} /></span>
              <div>
                <div className="text-[13.5px] font-semibold">KampivaID verified</div>
                <div className="text-[12px] text-ink-500">University of Ilorin · 300L</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section aria-labelledby="find" className="bg-olive-950 text-white">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-16 lg:py-20">
          <div className="max-w-2xl">
            <h2 id="find" className="text-[30px] sm:text-[38px] leading-[1.1] font-semibold tracking-[-0.02em]">Find it fast. See it first.</h2>
            <p className="mt-4 text-[17px] text-white/80">Pick what you're looking for and we'll take you straight to the results. No account needed to look around.</p>
          </div>
          <form role="search" onSubmit={submit} className="mt-8 grid gap-3 rounded-[24px] bg-white p-4 sm:p-5 text-ink sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr_1fr_auto] lg:items-end">
            <label className="block">
              <span className="block px-1 text-[13px] font-medium text-ink-700">Looking for</span>
              <span className="relative mt-1.5 block">
                <select value={tab} onChange={(e) => setTab(e.target.value as PillarKey)} className={`${field} appearance-none`}>
                  {PILLARS.map((p) => <option key={p.key} value={p.key}>{p.noun}</option>)}
                </select>
                <ChevronDown size={16} aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-500" />
              </span>
            </label>
            {tab === 'move' ? (
              <>
                <label className="block animate-fade">
                  <span className="block px-1 text-[13px] font-medium text-ink-700">From</span>
                  <span className="mt-1.5 flex h-12 items-center gap-2 rounded-xl bg-sand px-3 transition focus-within:ring-4 focus-within:ring-lime-400/50">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-olive-700" />
                    <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g. Tanke" className="w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-ink-500" />
                  </span>
                </label>
                <label className="block animate-fade">
                  <span className="block px-1 text-[13px] font-medium text-ink-700">To</span>
                  <span className="mt-1.5 flex h-12 items-center gap-2 rounded-xl bg-sand px-3 transition focus-within:ring-4 focus-within:ring-lime-400/50">
                    <MapPin size={16} className="shrink-0 text-olive-700" />
                    <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g. Main gate" className="w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-ink-500" />
                  </span>
                </label>
              </>
            ) : (
              <>
                <label className="block animate-fade">
                  <span className="block px-1 text-[13px] font-medium text-ink-700">What do you need?</span>
                  <span className="mt-1.5 flex h-12 items-center gap-2 rounded-xl bg-sand px-3 transition focus-within:ring-4 focus-within:ring-lime-400/50">
                    <Search size={17} className="shrink-0 text-ink-500" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={current.search} className="w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-ink-500" />
                  </span>
                </label>
                <label className="block animate-fade">
                  <span className="block px-1 text-[13px] font-medium text-ink-700">Location</span>
                  <span className="relative mt-1.5 block">
                    <select value={where} onChange={(e) => setWhere(e.target.value)} className={`${field} appearance-none`}>
                      <option value="">Anywhere near campus</option>
                      {['Main campus', 'Tanke', 'Oke Odo', 'Fate', 'Sango'].map((w) => <option key={w}>{w}</option>)}
                    </select>
                    <ChevronDown size={16} aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-500" />
                  </span>
                </label>
              </>
            )}
            <button type="submit" className="inline-flex h-12 sm:col-span-2 lg:col-span-1 items-center justify-center gap-2 rounded-xl bg-olive-950 px-7 text-[15px] font-semibold text-white transition hover:bg-olive-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/60">
              <Search size={17} /> Search
            </button>
          </form>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[14px]">
            <span className="text-white/75">Popular:</span>
            {([['market', 'Calculator'], ['research', 'Microscope'], ['stay', 'Tanke'], ['move', 'Main gate']] as [PillarKey, string][]).map(([k, t]) => (
              <button key={t} type="button" onClick={() => quick(k, t)} className="min-h-9 rounded-full border border-white/25 px-3.5 py-1 text-white/90 transition hover:border-lime-400 hover:text-white active:scale-95">{t}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Four pillars */}
      <section id="pillars" className="bg-white scroll-mt-20">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-24">
          <Heading eyebrow="Four pillars" title="One account. Four ways to get things done." body="Look around freely. Sign up only when you're ready to buy, book or message someone." />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((p, i) => {
              const I = PILLAR_ICON[p.key]
              const it = p.items[0]
              return (
                <Reveal key={p.key} delay={i * 70}>
                  <button onClick={() => go(p.key)} className="group flex h-full w-full min-w-0 flex-col rounded-[24px] border border-line bg-paper p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-olive-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/50">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-olive-700 text-white"><I size={22} /></span>
                    <h3 className="mt-5 text-[22px] font-semibold">Kampiva {p.name}</h3>
                    <p className="text-[14px] font-medium text-olive-700">{p.noun}</p>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink-700">{p.short}</p>
                    <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-line">
                      <Img src={img(it.photo, 480, 240)} className="h-24 w-full object-cover" />
                      <div className="flex items-center justify-between gap-2 p-3 text-[13px]">
                        <span className="min-w-0 truncate font-medium">{it.title}</span>
                        <span className="shrink-0 font-display font-semibold">{naira(it.price)}</span>
                      </div>
                    </div>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-semibold text-olive-700 transition-all group-hover:gap-2.5">Explore {p.name} <ArrowRight size={17} /></span>
                  </button>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Providers */}
      <section className="bg-paper border-y border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-24 grid lg:grid-cols-[1fr_1.3fr] gap-12 items-start">
          <Heading eyebrow="For providers" title="Have something students need? Start offering it." body="Sell, lend equipment, list rooms or drive. Pick the service that fits you and we'll take you through its own short set-up." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SECTORS.map((s, i) => (
              <Reveal key={s.id} delay={i * 60}>
                <button onClick={() => startProvider(s.id)} className="group flex h-full w-full items-start gap-4 rounded-[20px] border border-line bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-olive-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/50">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-olive-700 text-white"><s.icon size={20} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-semibold">{s.title}</span>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-[14px] font-semibold text-olive-700 transition-all group-hover:gap-2.5">{s.cta} <ArrowRight size={15} /></span>
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-24">
          <Heading eyebrow="Safety" title="No strangers. No scams." body="Campus deals shouldn't feel risky. Here is how Kampiva keeps you safe." />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              [ShieldCheck, 'Everyone is verified', 'Every account is confirmed with an email code, phone number and matric number before it can buy, sell or book.'],
              [Users, 'Your number stays private', 'Chat inside Kampiva. Share contact details only if you want to.'],
              [Star, 'Ratings after every deal', 'Sellers, landlords, lab owners and drivers are rated by real students.'],
            ].map(([I, t, d], i) => {
              const Ico = I as typeof ShieldCheck
              return (
                <Reveal key={t as string} delay={i * 80}>
                  <div className="h-full rounded-[24px] border border-line bg-paper p-8">
                    <Ico className="text-olive-700" size={26} />
                    <h3 className="mt-5 text-[20px] font-semibold">{t as string}</h3>
                    <p className="mt-2 leading-relaxed text-ink-700">{d as string}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-paper border-y border-line">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-24">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Heading eyebrow="Ratings and reviews" title="Students already get more done on Kampiva." />
            <Btn variant="outline" onClick={() => go('reviews')} className="self-start sm:self-auto">Read all reviews <ArrowRight size={17} /></Btn>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {top.map((r, i) => (
              <Reveal key={r.id} delay={i * 80}>
                <figure className="flex h-full flex-col rounded-[24px] border border-line bg-white p-7">
                  <StarRow n={r.rating} size={17} />
                  <blockquote className="mt-4 flex-1 text-[16px] leading-relaxed text-ink-700">“{r.body}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-olive-100 font-display font-semibold text-olive-800">{r.author[0]}</span>
                    <span><span className="block text-[15px] font-semibold">{r.author}</span><span className="block text-[13px] text-ink-500">{r.level} · reviewed {r.about}</span></span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Schools */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-20 lg:py-24">
          <Heading eyebrow="Where we are" title="Starting in Ilorin. Coming to your campus." body="We're rolling out across Nigerian universities. Join now and we'll tell you when yours goes live." />
          <ul className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {SCHOOLS.map((s, i) => (
              <li key={s} className={`flex h-16 sm:h-20 items-center justify-center gap-2 rounded-[20px] px-3 text-center font-display text-[15px] sm:text-[18px] font-semibold ${i === 0 ? 'bg-olive-950 text-white' : 'bg-sand text-ink-500'}`}>
                {s}{i === 0 && <span className="rounded-full bg-lime-400 px-2 py-0.5 text-[11px] text-olive-950">Live</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {user
        ? <JoinBand title="Pick up where you left off." body="Your KampivaID is ready. Open the app to browse, message and list." cta="app" />
        : <JoinBand title="Your coursemates are already here." body="Join free with any email. It takes about 2 minutes." />}
    </main>
  )
}
