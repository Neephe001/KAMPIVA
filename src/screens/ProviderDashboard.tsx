import { useState } from 'react'
import { Eye, MessageCircle, TrendingUp, Plus, MoreHorizontal, Sparkles, Clock, Check, Trash2, Pause, Play, ArrowRight } from 'lucide-react'
import { BackHeader, StackScroll } from '../components/Chrome'
import { Button, Sheet, Toast, useToast } from '../components/ui'
import { Img } from '../site/shared'
import { userListings, formatNaira } from '../lib/data'
import { useNav } from '../lib/nav'
import { SECTORS } from '../lib/providers'
import type { Listing } from '../lib/types'

export function ProviderDashboard() {
  const { push, sectors, setSector, becomeProvider } = useNav()
  const mine = userListings.use()
  const items = mine
  const [menu, setMenu] = useState<Listing | null>(null)
  const [paused, setPaused] = useState<string[]>([])
  const [boost, setBoost] = useState(false)
  const [toast, showToast] = useToast()
  const activeSectors = SECTORS.filter((s) => sectors[s.id] === 'active')
  const live = items.filter((l) => !l.draft && !paused.includes(l.id)).length
  const others = SECTORS.filter((s) => sectors[s.id] === 'none')

  const approve = (id: (typeof SECTORS)[number]['id']) => {
    setSector(id, 'active')
    userListings.set((l) => l.map((x) => (x.pillar === id ? { ...x, draft: false } : x)))
    showToast('Approved. Your listings are now live')
  }

  return (
    <>
      <BackHeader
        title="Provider dashboard"
        right={activeSectors.length > 0 && (
          <button onClick={() => push({ name: 'create' })} className="inline-flex items-center gap-1 rounded-full bg-olive-700 px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-olive-800 active:scale-95">
            <Plus size={15} /> New
          </button>
        )}
      />
      <StackScroll>
        <div className="mx-auto w-full max-w-[720px] px-4 pt-16 pb-8">
          {/* services */}
          <h3 className="font-display text-[16px] font-semibold">Your services</h3>
          <div className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {SECTORS.map((s) => {
              const st = sectors[s.id]
              return (
                <div key={s.id} className="flex items-center gap-3 px-3.5 py-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-olive-50 text-olive-700"><s.icon size={19} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold">{s.full}</p>
                    <p className="text-[12.5px] text-ink-500">{st === 'active' ? 'Approved. You can list now.' : st === 'pending' ? s.review : s.title}</p>
                  </div>
                  {st === 'active' && <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-verify-700"><Check size={14} strokeWidth={3} /> Active</span>}
                  {st === 'pending' && (
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber/15 px-2.5 py-1 text-[11.5px] font-bold text-amber"><Clock size={12} /> In review</span>
                      <button onClick={() => approve(s.id)} className="text-[11.5px] font-medium text-ink-500 underline underline-offset-2 hover:text-ink">Demo: mark approved</button>
                    </div>
                  )}
                  {st === 'none' && <button onClick={() => becomeProvider(s.id)} className="shrink-0 rounded-full border border-olive-700/30 px-3.5 py-2 text-[12.5px] font-semibold text-olive-800 transition hover:bg-olive-50 active:scale-95">Set up</button>}
                </div>
              )
            })}
          </div>
          {others.length > 0 && (
            <button onClick={() => becomeProvider()} className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-olive-700 hover:gap-2.5 transition-all">Add another service <ArrowRight size={15} /></button>
          )}

          {/* KPIs */}
          <div className="mt-6 grid grid-cols-3 gap-2.5">
            <Kpi icon={<Eye size={16} />} value="0" label="Views (7d)" />
            <Kpi icon={<MessageCircle size={16} />} value="0" label="Enquiries" />
            <Kpi icon={<TrendingUp size={16} />} value={String(live)} label="Live listings" />
          </div>

          {/* listings */}
          <div className="mb-3 mt-7 flex items-center justify-between">
            <h3 className="font-display text-[16px] font-semibold">Your listings</h3>
            <span className="text-[13px] text-ink-500">{items.length} total</span>
          </div>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-field/60 p-8 text-center">
              <p className="font-semibold">No listings yet</p>
              <p className="mx-auto mt-1 max-w-xs text-[13.5px] text-ink-500">{activeSectors.length ? 'Publish your first listing and students can find it straight away.' : 'Listings appear here once your service is approved.'}</p>
              {activeSectors.length > 0 && <div className="mx-auto mt-4 max-w-[200px]"><Button full onClick={() => push({ name: 'create' })}><Plus size={16} /> New listing</Button></div>}
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map((l) => {
                const isPaused = paused.includes(l.id)
                return (
                  <div key={l.id} className="flex gap-3 rounded-xl border border-line p-2.5">
                    <div className="h-16 w-16 shrink-0 rounded-lg bg-sand overflow-hidden">
                      <Img src={l.image} alt={l.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <button onClick={() => !l.draft && push({ name: 'listing', id: l.id })} className="line-clamp-1 text-left text-[13.5px] font-semibold hover:underline">{l.title}</button>
                        <button onClick={() => setMenu(l)} aria-label={`Manage ${l.title}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-500 transition hover:bg-sand active:scale-90"><MoreHorizontal size={18} /></button>
                      </div>
                      <p className="mt-0.5 font-display text-[14px] font-bold">{l.price != null ? formatNaira(l.price) : l.priceLabel}{l.priceUnit && <span className="ml-1 font-sans text-[12px] font-normal text-ink-500">{l.priceUnit}</span>}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className={`text-[11.5px] font-semibold ${l.draft ? 'text-amber' : isPaused ? 'text-ink-400' : 'text-verify-700'}`}>{l.draft ? 'In review' : isPaused ? 'Paused' : 'Live'}</span>
                        {!l.draft && !isPaused && <button onClick={() => setBoost(true)} className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-olive-700 hover:underline"><Sparkles size={11} /> Promote</button>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {live > 0 && (
            <div className="mt-6 rounded-2xl border border-lime-400/60 bg-lime-50 p-4">
              <div className="mb-1 flex items-center gap-2"><Sparkles size={17} className="text-olive-700" /><p className="font-display text-[14.5px] font-semibold">Promote to get found faster</p></div>
              <p className="mb-3 text-[12.5px] leading-snug text-ink-700">Promoted listings appear at the top of search for verified students.</p>
              <Button variant="soft" size="sm" onClick={() => setBoost(true)}>Boost a listing</Button>
            </div>
          )}
        </div>
      </StackScroll>

      <Sheet open={!!menu} onClose={() => setMenu(null)} title={menu?.title}>
        {menu && (
          <div className="space-y-2">
            {!menu.draft && (
              <button onClick={() => { setPaused((p) => (p.includes(menu.id) ? p.filter((x) => x !== menu.id) : [...p, menu.id])); showToast(paused.includes(menu.id) ? 'Listing resumed' : 'Listing paused'); setMenu(null) }} className="flex w-full items-center gap-3 rounded-xl border border-line p-3.5 text-left text-[14.5px] font-medium transition hover:bg-sand">
                {paused.includes(menu.id) ? <Play size={18} /> : <Pause size={18} />} {paused.includes(menu.id) ? 'Resume listing' : 'Pause listing'}
              </button>
            )}
            <button onClick={() => { userListings.set((p) => p.filter((x) => x.id !== menu.id)); setMenu(null); showToast('Listing deleted') }} className="flex w-full items-center gap-3 rounded-xl border border-line p-3.5 text-left text-[14.5px] font-medium text-alert transition hover:bg-alert-50">
              <Trash2 size={18} /> Delete listing
            </button>
          </div>
        )}
      </Sheet>
      <Sheet open={boost} onClose={() => setBoost(false)} title="Boost a listing" footer={<Button full size="lg" onClick={() => { setBoost(false); showToast('Boost requested. We will confirm shortly') }}>Request boost</Button>}>
        <p className="text-[14px] leading-relaxed text-ink-700">Boosted listings appear first for 7 days. We'll message you with the fee and payment details before anything is charged.</p>
      </Sheet>
      <Toast message={toast} />
    </>
  )
}

function Kpi({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-olive-50 text-olive-700">{icon}</div>
      <p className="font-display text-[19px] font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-ink-400">{label}</p>
    </div>
  )
}
