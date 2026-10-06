import { useState } from 'react'
import { Share2, Heart, MapPin, ChevronRight, Flag, ShieldCheck, Star, Check } from 'lucide-react'
import { BackHeader, StackScroll } from '../components/Chrome'
import { Avatar, Button, Field, Sheet, Stars, Toast, VerifiedBadge, inputClass, useToast } from '../components/ui'
import { Img } from '../site/shared'
import { useListing, getPerson, formatNaira, PILLARS } from '../lib/data'
import { useNav } from '../lib/nav'
import type { Listing } from '../lib/types'
import { createOrder } from '../lib/orders'
import { ReportFlow } from '../components/ReportFlow'


function priceBlock(l: Listing) {
  if (l.priceLabel) return l.priceLabel
  if (l.price != null) return formatNaira(l.price)
  return ''
}

const CTA: Record<string, { primary: string; secondary?: string; note: string }> = {
  market: { primary: 'Message seller', secondary: 'Make offer', note: 'Payments handled off-platform in the pilot.' },
  research: { primary: 'Request access', note: 'Sensitive equipment may require departmental clearance.' },
  stay: { primary: 'Book a viewing', secondary: 'Enquire', note: 'No online payment. Arrange viewing first.' },
  move: { primary: 'Reserve a seat', note: 'Confirm your seat directly with the driver.' },
}

export function ListingDetail({ id }: { id: string }) {
  const { push, setTab, isSaved, toggleSaved } = useNav()
  const [requested, setRequested] = useState(false)
  const [sheet, setSheet] = useState<'request' | 'offer' | 'report' | null>(null)
  const [day, setDay] = useState(0)
  const [slot, setSlot] = useState('10:00 AM')
  const [note, setNote] = useState('')
  const [offer, setOffer] = useState('')
  const [reason, setReason] = useState('')
  const [reported, setReported] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [toast, showToast] = useToast()
  const [activeImg, setActiveImg] = useState(0)
  const listing = useListing(id)
  if (!listing) return null
  const seller = getPerson(listing.sellerId)
  const pillar = PILLARS.find((p) => p.id === listing.pillar)!
  const cta = CTA[listing.pillar]
  const images = listing.images ?? [listing.image]

  return (
    <>
      <BackHeader
        right={
          <>
            <button
              aria-label="Share"
              onClick={() => {
                navigator.clipboard?.writeText(`${window.location.origin}/app?listing=${listing.id}`).catch(() => {})
                showToast('Link copied to clipboard')
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-soft"
            >
              <Share2 size={19} className="text-ink-700" />
            </button>
            <button
              aria-label="Save"
              onClick={() => {
                showToast(isSaved(listing.id) ? 'Removed from saved' : 'Saved to your list')
                toggleSaved(listing.id)
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-soft"
            >
              <Heart size={19} className={isSaved(listing.id) ? 'fill-alert text-alert' : 'text-ink-700'} />
            </button>
          </>
        }
      />
      <StackScroll bottom={88}>
        <div className="pt-14">
          {/* gallery */}
          <div className="relative">
            <div
              className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
              onScroll={(e) => {
                const el = e.currentTarget
                setActiveImg(Math.round(el.scrollLeft / el.clientWidth))
              }}
            >
              {images.map((src, i) => (
                <div key={i} className="h-64 w-full shrink-0 snap-center bg-soft relative overflow-hidden">
                  <Img src={src} alt={listing.title} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span
              className="absolute bottom-3 left-4 rounded-full px-2.5 py-1 text-[11.5px] font-semibold text-white"
              style={{ background: pillar.color }}
            >
              {pillar.full}
            </span>
            {images.length > 1 && (
              <>
                <span className="absolute bottom-3 right-4 rounded-full bg-black/50 px-2.5 py-1 text-[11.5px] font-medium text-white">
                  {activeImg + 1} / {images.length}
                </span>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: i === activeImg ? 16 : 6,
                        background: i === activeImg ? '#fff' : 'rgba(255,255,255,0.55)',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="px-4 py-4">
            {/* title + price */}
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display font-bold text-[20px] text-ink leading-snug flex-1">{listing.title}</h1>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-display font-bold text-[22px]" style={{ color: pillar.color }}>
                {priceBlock(listing)}
              </span>
              {listing.priceUnit && <span className="text-[13px] text-ink-500">{listing.priceUnit}</span>}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-[13px] text-ink-500">
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} /> {listing.location}
              </span>
              {listing.condition && <span>· {listing.condition}</span>}
              <span>· {listing.postedAgo}</span>
            </div>

            {/* tags */}
            {listing.tags && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {listing.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-soft border border-line px-2.5 py-1 text-[11.5px] font-medium text-ink-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* availability (non-market) */}
            {listing.availability && (
              <div className="flex items-center gap-2 mt-4 rounded-xl bg-verify-50 px-3.5 py-2.5">
                <Check size={16} className="text-verify" strokeWidth={3} />
                <span className="text-[13.5px] font-semibold text-verify-700">{listing.availability}</span>
              </div>
            )}

            {/* route visual (Move) */}
            {listing.pillar === 'move' && (
              <div className="mt-4 rounded-xl border border-line p-3.5">
                <p className="text-[12px] font-semibold text-ink-400 uppercase tracking-wide mb-3">Route & pickup points</p>
                <div className="relative pl-1">
                  {(listing.spec?.find((s) => s.label === 'Route')?.value ?? listing.location)
                    .split(/→|,/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((stop, i, arr) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="flex flex-col items-center">
                          <span
                            className="w-3 h-3 rounded-full border-2"
                            style={{
                              borderColor: pillar.color,
                              background: i === 0 || i === arr.length - 1 ? pillar.color : '#fff',
                            }}
                          />
                          {i < arr.length - 1 && <span className="w-0.5 h-6" style={{ background: pillar.color + '55' }} />}
                        </div>
                        <span className="text-[13.5px] text-ink-700 -mt-0.5 pb-2">{stop}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* seller */}
            <button
              onClick={() => push({ name: 'seller', id: seller.id })}
              className="w-full flex items-center gap-3 mt-4 rounded-xl border border-line p-3 text-left transition hover:shadow-sm"
            >
              <Avatar initials={seller.initials} institutional={seller.institutional} color={pillar.color} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-[14.5px] text-ink truncate">{seller.name}</p>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <VerifiedBadge institutional={seller.institutional} />
                  {seller.rating != null && <Stars rating={seller.rating} count={seller.reviews} size={12} />}
                </div>
              </div>
              <ChevronRight size={20} className="text-ink-400" />
            </button>

            {/* description */}
            <div className="mt-5">
              <h3 className="font-display font-semibold text-[15px] text-ink mb-1.5">Details</h3>
              <p className="text-[14px] text-ink-700 leading-relaxed">{listing.description}</p>
            </div>

            {/* spec table */}
            {listing.spec && (
              <div className="mt-5 rounded-xl border border-line overflow-hidden">
                {listing.spec.map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between px-3.5 py-3 text-[13.5px] ${
                      i > 0 ? 'border-t border-line' : ''
                    }`}
                  >
                    <span className="text-ink-500">{row.label}</span>
                    <span className="font-medium text-ink text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* trust note */}
            <div className="flex items-start gap-2 mt-5 rounded-xl bg-brand-50 p-3">
              <ShieldCheck size={17} className="text-brand shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-ink-700 leading-snug">
                Verification confirms identity. It doesn't guarantee a transaction. Always meet in a safe campus spot
                and inspect before you pay.
              </p>
            </div>

            {/* reviews */}
            {listing.reviewsList && listing.reviewsList.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-[15px] text-ink">Reviews</h3>
                  <Stars rating={listing.rating} count={listing.reviewCount} />
                </div>
                <div className="space-y-3">
                  {listing.reviewsList.map((r) => (
                    <div key={r.id} className="rounded-xl border border-line p-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={r.initials} size={32} color="#6b6f5e" />
                        <div className="flex-1">
                          <p className="text-[13.5px] font-semibold text-ink">{r.author}</p>
                          <p className="text-[11.5px] text-ink-400">{r.date}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={i < r.rating ? 'fill-amber text-amber' : 'text-line'}
                              strokeWidth={0}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[13.5px] text-ink-700 mt-2 leading-snug">{r.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => { setReportOpen(true); setSheet(null) }} disabled={reported} className="flex items-center gap-1.5 mx-auto mt-6 text-[12.5px] font-medium text-ink-400 hover:text-alert disabled:hover:text-ink-400">
              <Flag size={14} /> {reported ? 'Reported. Thanks for keeping campus safe' : 'Report this listing'}
            </button>
          </div>
        </div>
      </StackScroll>

      {/* sticky CTA */}
      <div className="absolute bottom-0 inset-x-0 z-30 bg-white border-t border-line px-4 py-3">
        {requested ? (
          <div className="flex items-center justify-between gap-3 py-1">
            <span className="flex items-center gap-2 text-verify-700 font-semibold text-[14px]">
              <Check size={18} strokeWidth={3} /> {cta.primary} sent
            </span>
            <Button size="sm" variant="soft" color={pillar.color} onClick={() => setTab('inbox')}>Go to Inbox</Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2.5">
              {cta.secondary && (
                <Button variant="soft" color={pillar.color} size="lg" onClick={() => (listing.pillar === 'market' ? setSheet('offer') : push({ name: 'chat', id: seller.id, listingId: listing.id }))}>
                  {cta.secondary}
                </Button>
              )}
              <Button
                full
                size="lg"
                color={pillar.color}
                onClick={() =>
                  listing.pillar === 'market'
                    ? push({ name: 'chat', id: seller.id, listingId: listing.id })
                    : setSheet('request')
                }
              >
                {cta.primary}
              </Button>
            </div>
            <p className="text-center text-[11px] text-ink-400 mt-1.5">{cta.note}</p>
          </>
        )}
      </div>

      <Sheet
        open={sheet === 'request'}
        onClose={() => setSheet(null)}
        title={cta.primary}
        footer={<Button full size="lg" color={pillar.color} onClick={() => {
          // §2.6 – Create order in 'requested' state; push to order detail screen
          const order = createOrder({
            listingId: listing.id,
            listingTitle: listing.title,
            pillar: listing.pillar,
            buyerId: 'u-me',
            providerId: seller.id,
            price: listing.price,
            notes: note.trim() || undefined,
          })
          setSheet(null)
          setRequested(true)
          showToast(`Request sent to ${seller.name.split(' ')[0]}`)
          push({ name: 'order', id: order.id })
        }}>Send request</Button>}

      >
        <p className="text-[13.5px] text-ink-500">{listing.title}</p>
        <p className="mt-4 mb-2 text-[13px] font-medium text-ink-700">{listing.pillar === 'move' ? 'Travel day' : 'Preferred day'}</p>
        <div className="grid grid-cols-4 gap-2">
          {DAYS.map((d, i) => (
            <button key={d.label} onClick={() => setDay(i)} className={`rounded-xl border py-2.5 text-center transition ${day === i ? 'text-white' : 'border-line hover:border-ink-400'}`} style={day === i ? { background: pillar.color, borderColor: pillar.color } : undefined}>
              <span className="block text-[11px] opacity-80">{d.label}</span>
              <span className="block font-display text-[16px] font-semibold">{d.date}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 mb-2 text-[13px] font-medium text-ink-700">Time</p>
        <div className="flex flex-wrap gap-2">
          {SLOTS[listing.pillar].map((t) => (
            <button key={t} onClick={() => setSlot(t)} className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${slot === t ? 'text-white' : 'border-line text-ink-700 hover:border-ink-400'}`} style={slot === t ? { background: pillar.color, borderColor: pillar.color } : undefined}>{t}</button>
          ))}
        </div>
        <div className="mt-4">
          <Field label="Note (optional)">
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={`${inputClass} resize-none`} placeholder={listing.pillar === 'research' ? 'Project title and supervisor' : 'Anything they should know'} />
          </Field>
        </div>
        <p className="mt-3 text-[12px] text-ink-400">{cta.note}</p>
      </Sheet>

      <Sheet
        open={sheet === 'offer'}
        onClose={() => setSheet(null)}
        title="Make an offer"
        footer={<Button full size="lg" color={pillar.color} disabled={!offer} onClick={() => { setSheet(null); setRequested(true); showToast(`Offer of ${formatNaira(Number(offer))} sent`) }}>Send offer</Button>}
      >
        <p className="text-[13.5px] text-ink-500">Asking price <b className="text-ink">{priceBlock(listing)}</b></p>
        <div className="mt-4 flex items-center rounded-2xl border border-line bg-soft px-4 focus-within:border-olive-600 focus-within:bg-white">
          <span className="font-display text-[22px] font-semibold text-ink-400">₦</span>
          <input autoFocus inputMode="numeric" value={offer} onChange={(e) => setOffer(e.target.value.replace(/\D/g, ''))} placeholder="0" className="w-full bg-transparent px-2 py-4 font-display text-[26px] font-semibold text-ink outline-none" />
        </div>
        {listing.price != null && (
          <div className="mt-3 flex gap-2">
            {[0.9, 0.85, 0.8].map((f) => (
              <button key={f} onClick={() => setOffer(String(Math.round((listing.price! * f) / 500) * 500))} className="flex-1 rounded-full border border-line py-1.5 text-[12.5px] font-semibold text-ink-700 hover:border-ink-400">
                {formatNaira(Math.round((listing.price! * f) / 500) * 500)}
              </button>
            ))}
          </div>
        )}
      </Sheet>

      <ReportFlow open={reportOpen} onClose={() => { setReportOpen(false); setReported(true) }} context="listing" sourceId={listing.id} sourceLabel={listing.title} title="Report this listing" pillar={listing.pillar} autoEvidence={[`Seller: ${seller.name}`, `Location: ${listing.location}`]} />
      <Toast message={toast} />
    </>
  )
}

const DAYS = Array.from({ length: 4 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i + 1)
  return { label: i === 0 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short' }), date: d.getDate() }
})

const SLOTS: Record<string, string[]> = {
  market: ['10:00 AM', '1:00 PM', '4:00 PM'],
  research: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
  stay: ['10:00 AM', '12:00 PM', '3:00 PM', '5:00 PM'],
  move: ['7:30 AM', '12:30 PM', '5:30 PM'],
}

const REASONS = ['Looks like a scam', 'Wrong price or details', 'Item or service not available', 'Offensive content', 'Something else']
