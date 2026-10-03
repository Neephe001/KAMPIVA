import { MapPin, Sparkles, Heart } from 'lucide-react'
import type { Listing } from '../lib/types'
import { formatNaira, getPerson, PILLARS } from '../lib/data'
import { useNav } from '../lib/nav'
import { Stars, VerifiedBadge } from './ui'
import { Img } from '../site/shared'

function priceText(l: Listing) {
  if (l.priceLabel) return l.priceLabel
  if (l.price != null) return formatNaira(l.price) + (l.priceUnit ? ` ${l.priceUnit}` : '')
  return ''
}

export function ListingCard({ listing, wide = false, className = '' }: { listing: Listing; wide?: boolean; className?: string }) {
  const { push, isSaved, toggleSaved } = useNav()
  const saved = isSaved(listing.id)
  const seller = getPerson(listing.sellerId)
  const pillar = PILLARS.find((p) => p.id === listing.pillar)!

  if (wide) {
    return (
      <button
        onClick={() => push({ name: 'listing', id: listing.id })}
        className="w-full text-left flex gap-3 rounded-xl bg-white border border-line p-2.5 transition hover:border-ink-400/40 hover:shadow-sm active:scale-[0.995]"
      >
        <div className="w-23 h-23 rounded-lg bg-soft overflow-hidden shrink-0">
          <Img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-semibold" style={{ color: pillar.color }}>
              {pillar.full}
            </span>
          </div>
          <p className="font-semibold text-[14px] text-ink leading-snug line-clamp-2">{listing.title}</p>
          <p className="font-display font-bold text-[15px] text-ink mt-1">{priceText(listing)}</p>
          <div className="flex items-center gap-1 mt-1 text-[12px] text-ink-400">
            <MapPin size={12} /> <span className="truncate">{listing.location}</span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => push({ name: 'listing', id: listing.id })}
      className={`w-43 shrink-0 text-left rounded-xl bg-white border border-line overflow-hidden transition hover:border-ink-400/40 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] ${className}`}
    >
      <div className="h-28 md:h-auto md:aspect-4/3 bg-soft relative overflow-hidden">
        <Img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
        {listing.promoted && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10.5px] font-bold text-amber z-10">
            <Sparkles size={11} /> Promoted
          </span>
        )}
        <span
          role="button"
          aria-label={saved ? 'Remove from saved' : 'Save'}
          onClick={(e) => {
            e.stopPropagation()
            toggleSaved(listing.id)
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 flex items-center justify-center shadow-sm active:scale-90 transition z-10"
        >
          <Heart size={15} className={saved ? 'fill-alert text-alert' : 'text-ink-700'} />
        </span>
      </div>
      <div className="p-2.5">
        <p className="font-semibold text-[13.5px] text-ink leading-snug line-clamp-2 min-h-9.5">
          {listing.title}
        </p>
        <p className="font-display font-bold text-[15px] text-ink mt-1">{priceText(listing)}</p>
        <div className="flex items-center justify-between mt-2">
          {seller.institutional ? (
            <VerifiedBadge institutional />
          ) : listing.rating != null ? (
            <Stars rating={listing.rating} size={12} />
          ) : (
            <VerifiedBadge />
          )}
          <span className="text-[11px] text-ink-400">{listing.postedAgo}</span>
        </div>
      </div>
    </button>
  )
}
