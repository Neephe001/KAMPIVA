import { useMemo, useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { ScreenScroll } from '../components/Chrome'
import { Button, Chip, Sheet, Toggle } from '../components/ui'
import { ListingCard } from '../components/ListingCard'
import { useAllListings, PILLARS, MARKET_CATEGORIES, getPerson } from '../lib/data'
import { useNav } from '../lib/nav'
import type { Pillar } from '../lib/types'

type Scope = 'all' | Pillar

export function Discover() {
  const { preset } = useNav()
  const LISTINGS = useAllListings()
  const [q, setQ] = useState(preset.q ?? '')
  const [scope, setScope] = useState<Scope>(preset.pillar ?? 'all')
  const [cat, setCat] = useState('All')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sort, setSort] = useState<Sort>('relevant')
  const [maxPrice, setMaxPrice] = useState(0)
  const [partnersOnly, setPartnersOnly] = useState(false)
  const [ratedOnly, setRatedOnly] = useState(false)
  const activeFilters = (sort !== 'relevant' ? 1 : 0) + (maxPrice ? 1 : 0) + (partnersOnly ? 1 : 0) + (ratedOnly ? 1 : 0)

  const results = useMemo(() => {
    const list = LISTINGS.filter((l) => {
      if (maxPrice && (l.price == null || l.price > maxPrice)) return false
      if (partnersOnly && !getPerson(l.sellerId).institutional) return false
      if (ratedOnly && (l.rating ?? 0) < 4.5) return false
      if (scope !== 'all' && l.pillar !== scope) return false
      if (scope === 'market' && cat !== 'All' && l.category !== cat) return false
      if (q.trim()) {
        const hay = (l.title + ' ' + l.category + ' ' + l.description + ' ' + l.location).toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
    if (sort === 'low') return [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
    if (sort === 'high') return [...list].sort((a, b) => (b.price ?? -1) - (a.price ?? -1))
    if (sort === 'rated') return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    return list
  }, [LISTINGS, q, scope, cat, sort, maxPrice, partnersOnly, ratedOnly])

  return (
    <ScreenScroll pad={false}>
      {/* sticky-ish search header */}
      <div className="px-4 md:px-8 pt-2 pb-2 bg-white">
        <h1 className="font-display font-bold text-[22px] text-ink mb-3 md:hidden">Discover</h1>
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, equipment, rooms, rides…"
            className="w-full rounded-xl bg-soft border border-line pl-10 pr-10 py-3 text-[14px] outline-none focus:border-brand focus:bg-white transition"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Clear search" className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-400 hover:bg-sand">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* scope tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 md:px-8 py-2">
        <Chip active={scope === 'all'} onClick={() => setScope('all')}>
          All Kampiva
        </Chip>
        {PILLARS.map((p) => (
          <Chip key={p.id} active={scope === p.id} onClick={() => setScope(p.id)} color={p.color}>
            {p.name}
          </Chip>
        ))}
      </div>

      {/* market pillar tagline */}
      {scope === 'market' && (
        <p className="px-4 md:px-8 pt-1 text-[12.5px] font-semibold text-market">Kampiva Market · Find it. Trust it.</p>
      )}

      {/* market categories */}
      {scope === 'market' && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 md:px-8 pb-1">
          {MARKET_CATEGORIES.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>
      )}

      {/* result meta */}
      <div className="flex items-center justify-between px-4 md:px-8 pt-3 pb-2">
        <p className="text-[13px] text-ink-500">
          <span className="font-semibold text-ink">{results.length}</span> result{results.length !== 1 && 's'}
          {scope !== 'all' && <span> in {PILLARS.find((p) => p.id === scope)?.name}</span>}
        </p>
        <button onClick={() => setFiltersOpen(true)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${activeFilters ? 'bg-olive-700 text-white' : 'text-ink-700 hover:bg-soft'}`}>
          <SlidersHorizontal size={15} /> Filters{activeFilters ? ` (${activeFilters})` : ''}
        </button>
      </div>

      {/* results */}
      <div className="px-4 md:px-8 space-y-2.5 md:space-y-0 md:grid md:grid-cols-3 xl:grid-cols-4 md:gap-4">
        {results.map((l) => (
          <div key={l.id} className="contents">
            <div className="md:hidden"><ListingCard listing={l} wide /></div>
            <ListingCard listing={l} className="hidden md:block w-full" />
          </div>
        ))}
        {results.length === 0 && (
          <div className="col-span-full text-center py-16 px-8">
            <div className="w-14 h-14 rounded-full bg-soft flex items-center justify-center mx-auto mb-3">
              <Search size={24} className="text-ink-400" />
            </div>
            <p className="font-semibold text-ink">No matches yet</p>
            <p className="text-[13px] text-ink-500 mt-1">Try a different keyword or widen your filters.</p>
          </div>
        )}
      </div>
      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        footer={
          <div className="flex gap-2.5">
            <Button variant="ghost" onClick={() => { setSort('relevant'); setMaxPrice(0); setPartnersOnly(false); setRatedOnly(false) }}>Clear all</Button>
            <Button full onClick={() => setFiltersOpen(false)}>Show {results.length} results</Button>
          </div>
        }
      >
        <p className="mb-2 text-[13px] font-medium text-ink-700">Sort by</p>
        <div className="grid grid-cols-2 gap-2">
          {SORTS.map(([k, label]) => (
            <Chip key={k} active={sort === k} onClick={() => setSort(k)}>{label}</Chip>
          ))}
        </div>
        <p className="mt-5 mb-2 text-[13px] font-medium text-ink-700">Maximum price</p>
        <div className="flex flex-wrap gap-2">
          {PRICES.map(([v, label]) => (
            <Chip key={v} active={maxPrice === v} onClick={() => setMaxPrice(v)}>{label}</Chip>
          ))}
        </div>
        <div className="mt-5 divide-y divide-line rounded-2xl border border-line">
          <div className="flex items-center gap-3 p-3.5">
            <div className="flex-1"><p className="text-[14px] font-medium text-ink">Institutional partners only</p><p className="text-[12px] text-ink-500">Departments, labs and campus services</p></div>
            <Toggle label="Institutional partners only" on={partnersOnly} onChange={setPartnersOnly} />
          </div>
          <div className="flex items-center gap-3 p-3.5">
            <div className="flex-1"><p className="text-[14px] font-medium text-ink">Rated 4.5 and above</p><p className="text-[12px] text-ink-500">Based on verified reviews</p></div>
            <Toggle label="Rated 4.5 and above" on={ratedOnly} onChange={setRatedOnly} />
          </div>
        </div>
      </Sheet>
    </ScreenScroll>
  )
}

type Sort = 'relevant' | 'low' | 'high' | 'rated'
const SORTS: [Sort, string][] = [['relevant', 'Most relevant'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['rated', 'Top rated']]
const PRICES: [number, string][] = [[0, 'Any'], [5000, 'Under ₦5k'], [20000, 'Under ₦20k'], [50000, 'Under ₦50k'], [200000, 'Under ₦200k']]
