import { useMemo, useState } from 'react'
import { Search, Info, FlaskConical, KeyRound, CarFront } from 'lucide-react'
import { BackHeader, StackScroll } from '../components/Chrome'
import { Chip } from '../components/ui'
import { ListingCard } from '../components/ListingCard'
import { useListingsByPillar, PILLARS } from '../lib/data'
import type { Pillar } from '../lib/types'

const HERO: Record<Exclude<Pillar, 'market'>, { icon: typeof FlaskConical; blurb: string; cats: string[] }> = {
  research: {
    icon: FlaskConical,
    blurb: 'See what research equipment exists across campus and request access. Discovery-only in the pilot. Booking arrives later.',
    cats: ['All', 'Analytical Instruments', 'Sample Prep', 'Prototyping'],
  },
  stay: {
    icon: KeyRound,
    blurb: 'Verified rooms and flats from verified landlords. Enquire and book a viewing. No online payments in the pilot.',
    cats: ['All', 'Self-contained', 'Shared apartment'],
  },
  move: {
    icon: CarFront,
    blurb: 'Discover rides, shuttle routes and pickup points. Reserve a seat directly. Live booking comes later.',
    cats: ['All', 'Daily commute', 'Shuttle route'],
  },
}

export function PillarHub({ id }: { id: string }) {
  const pillar = PILLARS.find((p) => p.id === id)!
  const meta = HERO[id as Exclude<Pillar, 'market'>]
  const Icon = meta.icon
  const all = useListingsByPillar(pillar.id)
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')

  const items = useMemo(
    () =>
      all.filter((l) => {
        if (cat !== 'All' && l.category !== cat) return false
        if (q.trim() && !(l.title + l.description + l.location).toLowerCase().includes(q.toLowerCase())) return false
        return true
      }),
    [all, cat, q],
  )

  return (
    <>
      <BackHeader title={pillar.full} />
      <StackScroll>
        <div className="pt-14">
          {/* hero */}
          <div className="px-4 pt-4 pb-4" style={{ background: pillar.soft }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center bg-white"
                style={{ color: pillar.color }}
              >
                <Icon size={24} />
              </div>
              <div>
                <h1 className="font-display font-bold text-[19px] text-ink">{pillar.full}</h1>
                <p className="text-[12.5px]" style={{ color: pillar.color }}>
                  {pillar.tagline}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 mt-3 rounded-xl bg-white/70 p-2.5">
              <Info size={15} style={{ color: pillar.color }} className="shrink-0 mt-0.5" />
              <p className="text-[12px] text-ink-700 leading-snug">{meta.blurb}</p>
            </div>
          </div>

          {/* search */}
          <div className="px-4 pt-3">
            <div className="relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`Search ${pillar.name}…`}
                className="w-full rounded-xl bg-soft border border-line pl-10 pr-3 py-2.5 text-[14px] outline-none focus:bg-white transition"
                style={{ borderColor: undefined }}
              />
            </div>
          </div>

          {/* categories */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3">
            {meta.cats.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)} color={pillar.color}>
                {c}
              </Chip>
            ))}
          </div>

          {/* list */}
          <div className="px-4 space-y-2.5 pb-4">
            {items.map((l) => (
              <ListingCard key={l.id} listing={l} wide />
            ))}
          </div>
        </div>
      </StackScroll>
    </>
  )
}
