import { Heart, ArrowRight } from 'lucide-react'
import { BackHeader, StackScroll } from '../components/Chrome'
import { ListingCard } from '../components/ListingCard'
import { Button } from '../components/ui'
import { useNav } from '../lib/nav'
import { useAllListings, PILLARS } from '../lib/data'
import type { Listing } from '../lib/types'

export function Saved() {
  const { saved, setTab, back } = useNav()
  const allListings = useAllListings()

  const items = saved.map((id) => allListings.find(l => l.id === id)).filter((l): l is Listing => !!l)
  const groups = PILLARS.map((p) => ({
    pillar: p,
    listings: items.filter((l) => l.pillar === p.id),
  })).filter((g) => g.listings.length > 0)

  return (
    <>
      <BackHeader title="Saved" />
      <StackScroll bottom={0}>
        <div className="pt-16 px-4 pb-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center text-center pt-20">
              <div className="w-16 h-16 rounded-2xl bg-soft flex items-center justify-center text-ink-400">
                <Heart size={28} />
              </div>
              <p className="font-display font-semibold text-[17px] text-ink mt-4">Nothing saved yet</p>
              <p className="text-[13.5px] text-ink-500 mt-1.5 max-w-[240px]">
                Tap the heart on any listing to keep it here, across Market, Research, Stay and Move.
              </p>
              <div className="mt-5 w-full max-w-[220px]">
                <Button
                  full
                  onClick={() => {
                    back()
                    setTab('search')
                  }}
                >
                  Discover campus <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[13px] text-ink-500 -mt-1 mb-4">
                {items.length} saved {items.length === 1 ? 'item' : 'items'} across your campus.
              </p>
              <div className="space-y-6">
                {groups.map(({ pillar, listings }) => (
                  <div key={pillar.id}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: pillar.color }} />
                      <h3 className="font-display font-semibold text-[14px] text-ink">{pillar.full}</h3>
                      <span className="text-[12px] text-ink-400">· {listings.length}</span>
                    </div>
                    <div className="space-y-2.5">
                      {listings.map((l) => (
                        <ListingCard key={l.id} listing={l} wide />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </StackScroll>
    </>
  )
}
