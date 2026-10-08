import { Search, ChevronRight, ShoppingBag, FlaskConical, KeyRound, CarFront, ArrowRight, HandCoins, LayoutDashboard, Menu } from 'lucide-react'
import { KampivaMark } from '../site/shared'
import { Avatar, VerifiedBadge, SectionHeader } from '../components/ui'
import { ListingCard } from '../components/ListingCard'
import { ScreenScroll } from '../components/Chrome'
import { useNav } from '../lib/nav'
import { CURRENT_USER, PILLARS, useAllListings } from '../lib/data'
import type { Pillar } from '../lib/types'

const PILLAR_ICON: Record<Pillar, typeof ShoppingBag> = {
  market: ShoppingBag,
  research: FlaskConical,
  stay: KeyRound,
  move: CarFront,
}

export function Home() {
  const { push, setTab, isProvider, becomeProvider, setMenuOpen } = useNav()
  const all = useAllListings()
  const market = all.filter((l) => l.pillar === 'market')
  const nearby = all.filter((l) => l.pillar !== 'market').slice(0, 6)

  return (
    <ScreenScroll pad={false}>
      {/* header */}
      <div className="md:hidden px-4 pt-2 pb-3 flex items-center gap-3">
        <button onClick={() => setMenuOpen(true)} className="p-1.5 -ml-1.5 text-ink-700 active:bg-soft rounded-md transition"><Menu size={26} strokeWidth={2.2} /></button>
        <KampivaMark className="h-9" />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-ink-500 leading-none">Welcome back,</p>
          <p className="font-display font-semibold text-[15px] text-ink truncate mt-0.5">
            {CURRENT_USER.name.split(' ')[0]}
          </p>
        </div>
        <button onClick={() => setTab('profile')}>
          <Avatar initials={CURRENT_USER.initials} size={38} />
        </button>
      </div>

      {/* search */}
      <div className="md:hidden px-4">
        <button
          onClick={() => setTab('search')}
          className="w-full flex items-center gap-2.5 rounded-xl bg-soft border border-line px-3.5 py-3 text-[14px] text-ink-400"
        >
          <Search size={18} />
          Search across all of Kampiva…
        </button>
      </div>

      {/* desktop greeting */}
      <div className="hidden md:block px-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">Your campus today</p>
        <h1 className="font-display mt-2 text-[32px] lg:text-[38px] font-semibold leading-tight tracking-[-0.02em] text-ink">
          Good to see you, {CURRENT_USER.name.split(' ')[0]}.
        </h1>
      </div>

      {/* pillar switcher */}
      <div className="px-4 md:px-8 mt-5 md:mt-7">
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {PILLARS.map((p) => {
            const Icon = PILLAR_ICON[p.id]
            return (
              <button
                key={p.id}
                onClick={() =>
                  p.id === 'market' ? setTab('search') : push({ name: 'pillar', id: p.id })
                }
                className="flex flex-col md:flex-row items-center md:justify-start gap-1.5 md:gap-3 rounded-2xl py-3 md:px-4 md:py-4 lg:py-5 transition hover:-translate-y-0.5 hover:shadow-sm active:scale-95"
                style={{ background: p.soft }}
              >
                <Icon size={24} color={p.color} strokeWidth={2} />
                <span className="text-[11.5px] md:text-left font-semibold" style={{ color: p.color }}>
                  <span className="md:text-[15px] md:font-display">{p.name}</span>
                  <span className="hidden lg:block text-[12px] font-medium text-ink-500">{all.filter((l) => l.pillar === p.id).length} listings</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="md:grid md:grid-cols-[1.5fr_1fr] md:gap-4 md:px-8 md:mt-5">
      {/* verified banner */}
      <div className="px-4 md:px-0 mt-5 md:mt-0">
        <div className="h-full rounded-xl md:rounded-2xl bg-linear-to-br from-brand to-brand-700 p-4 md:p-6 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -right-10 top-10 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative">
            <VerifiedBadge label="KampivaID Active" size="md" />
            <p className="font-display font-semibold text-[16px] md:text-[22px] mt-2.5 leading-snug">
              One Verified Campus.<br />Everyday Journey.
            </p>
            <p className="text-[12.5px] text-white/80 mt-1">
              The unified operating system for campus life.
            </p>
          </div>
        </div>
      </div>

      {/* Become a provider */}
      <div className="px-4 md:px-0 mt-6 md:mt-0">
        <ProviderCta isProvider={isProvider} onClick={() => (isProvider ? push({ name: 'providerDashboard' }) : becomeProvider())} />
      </div>
      </div>

      {/* Market rail */}
      <div className="px-4 md:px-8 mt-6 md:mt-10">
        <SectionHeader title="Fresh in Market" action="See all" onAction={() => setTab('search')} />
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1 md:grid md:grid-cols-3 xl:grid-cols-4 md:gap-4 md:overflow-visible md:px-8">
        {market.slice(0, 8).map((l) => (
          <ListingCard key={l.id} listing={l} className="md:w-auto" />
        ))}
      </div>

      {/* Explore pillars */}
      <div className="px-4 md:px-8 mt-6 md:mt-10">
        <SectionHeader title="Explore campus" />
        <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
          {PILLARS.filter((p) => p.id !== 'market').map((p) => {
            const Icon = PILLAR_ICON[p.id]
            const count = all.filter((l) => l.pillar === p.id).length
            return (
              <button
                key={p.id}
                onClick={() => push({ name: 'pillar', id: p.id })}
                className="w-full flex items-center gap-3 rounded-xl bg-white border border-line p-3 text-left transition hover:shadow-sm active:scale-[0.995]"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: p.soft }}
                >
                  <Icon size={22} color={p.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14.5px] text-ink">{p.full}</p>
                  <p className="text-[12.5px] text-ink-500">{p.tagline} · {count} listings</p>
                </div>
                <ChevronRight size={20} className="text-ink-400" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Nearby now */}
      <div className="px-4 md:px-8 mt-6 md:mt-10">
        <SectionHeader title="Around you now" />
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 md:grid md:grid-cols-3 xl:grid-cols-4 md:gap-4 md:overflow-visible md:px-8">
        {nearby.map((l) => (
          <ListingCard key={l.id} listing={l} className="md:w-auto" />
        ))}
      </div>

      <div className="px-4 md:px-8 mt-6">
        <button
          onClick={() => setTab('search')}
          className="w-full flex items-center justify-center gap-1.5 text-[13.5px] font-semibold text-brand py-2"
        >
          Discover everything on campus <ArrowRight size={16} />
        </button>
      </div>
    </ScreenScroll>
  )
}

function ProviderCta({ isProvider, onClick }: { isProvider: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex h-full w-full items-center gap-3.5 rounded-xl border border-olive-100 bg-olive-50 p-3.5 text-left transition hover:border-olive-600 hover:shadow-sm active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-400/50 md:flex-col md:items-start md:rounded-2xl md:p-6"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-olive-700">
        {isProvider ? <LayoutDashboard size={22} /> : <HandCoins size={22} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[14.5px] font-semibold text-ink md:text-[17px]">{isProvider ? 'Provider dashboard' : 'Become a provider'}</span>
        <span className="block text-[12.5px] text-ink-500 md:mt-1 md:text-[13.5px]">{isProvider ? 'Manage your services and listings' : 'Sell, lend equipment, host rooms or offer rides'}</span>
      </span>
      <ArrowRight size={18} className="text-olive-700 transition group-hover:translate-x-1" />
    </button>
  )
}
