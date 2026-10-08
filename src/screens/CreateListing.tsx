import { useState } from 'react'
import { Check, Clock } from 'lucide-react'
import { BackHeader, StackScroll } from '../components/Chrome'
import { Button, Field, inputClass, VerifiedBadge, AlertModal } from '../components/ui'
import { Choice, SelectField, TextField, UploadField } from '../components/forms'
import { MARKET_CATEGORIES, userListings } from '../lib/data'
import { useNav } from '../lib/nav'
import { SECTORS, sector as sectorInfo } from '../lib/providers'
import { stockImage, AREAS, WEEKDAYS } from '../lib/providerFlow'
import type { Listing, Pillar } from '../lib/types'

const digits = (v: string) => Number(v.replace(/\D/g, ''))

/** Publish a new listing. The form changes with the service the provider picked. */
export function CreateListing({ sector: initial }: { sector?: Pillar }) {
  const { back, sectors, becomeProvider, replace } = useNav()
  const active = SECTORS.filter((s) => sectors[s.id] === 'active')
  const [sector, setSector] = useState<Pillar | undefined>(initial && sectors[initial] === 'active' ? initial : active[0]?.id)
  const [done, setDone] = useState<Listing | null>(null)
  const [alertMsg, setAlertMsg] = useState('')
  const [f, setF] = useState({
    title: '', category: '', price: '', condition: 'Used, good', desc: '', place: '', photo: '' as string | File,
    unit: 'per hour', from: '', to: '', time: '07:30', seats: '3', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as string[],
    propType: '', per: 'per year', area: '', amenities: [] as string[], mode: 'rent'
  })
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }))

  // Nothing approved yet: explain, rather than show a form that cannot publish.
  if (!sector) {
    const pending = SECTORS.filter((s) => sectors[s.id] === 'pending')
    return (
      <>
        <BackHeader title="New listing" />
        <div className="absolute inset-0 grid place-items-center px-8 pt-14 text-center">
          <div className="max-w-sm">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-olive-50 text-olive-700"><Clock size={28} /></span>
            <h2 className="mt-5 font-display text-[21px] font-semibold">{pending.length ? 'Your application is in review' : 'Choose a service first'}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-500">
              {pending.length ? `You can list as soon as ${pending.map((p) => p.name).join(' or ')} is approved. ${pending[0].review}.` : 'Pick Market, Research, Stay or Move and complete its short set-up to start listing.'}
            </p>
            <div className="mt-6 grid gap-2.5">
              <Button full size="lg" onClick={() => (pending.length ? replace({ name: 'providerDashboard' }) : becomeProvider())}>{pending.length ? 'View application status' : 'Become a provider'}</Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const info = sectorInfo(sector)
  const valid =
    sector === 'market' ? f.title.trim() && f.category && digits(f.price) && f.photo
    : sector === 'research' ? f.title.trim() && f.category && (f.mode === 'borrow' || digits(f.price)) && f.photo
    : sector === 'stay' ? f.title.trim() && f.propType && digits(f.price) && f.area && f.photo
    : f.from.trim() && f.to.trim() && digits(f.price) && f.days.length

  const publish = async () => {
    try {
      const { default: api } = await import('../lib/axios')
      
      let finalImageUrl = stockImage(sector)
      if (f.photo && typeof f.photo === 'object' && 'name' in f.photo) {
        const formData = new FormData()
        formData.append('image', f.photo as File)
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        finalImageUrl = uploadRes.data.url
      } else if (typeof f.photo === 'string' && f.photo) {
        finalImageUrl = f.photo
      }
      
      const id = `u-${Date.now()}`
      const base = { id, pillar: sector, sellerId: 'u-me', postedAgo: 'Just now', image: finalImageUrl, description: f.desc.trim() || 'New listing from a verified Kampiva provider.', tags: ['Verified provider'] }
      let l: Listing
      if (sector === 'market') l = { ...base, title: f.title.trim(), category: f.category, price: digits(f.price), condition: f.condition, location: f.place || 'Main campus' }
      else if (sector === 'research') l = { ...base, title: f.title.trim(), category: f.category, price: f.mode === 'borrow' ? 0 : digits(f.price), priceUnit: f.mode === 'borrow' ? 'borrow' : f.unit, priceLabel: f.mode === 'borrow' ? 'Free to borrow' : undefined, location: f.place || 'Campus lab', availability: 'Available, request access', tags: ['Institutional'] }
      else if (sector === 'stay') l = { ...base, title: f.title.trim(), category: f.propType, price: digits(f.price), priceUnit: f.per, location: `${f.area}${f.place ? ', ' + f.place : ''}`, availability: 'Enquiry & viewing', tags: ['Verified landlord', ...f.amenities.slice(0, 2)] }
      else l = { ...base, title: `${f.from.trim()} → ${f.to.trim()}`, category: 'Daily commute', priceLabel: `₦${digits(f.price).toLocaleString('en-NG')}`, priceUnit: 'per seat', location: `Departs ${f.time}`, availability: `${f.seats} seats open`, spec: [{ label: 'Route', value: `${f.from.trim()} → ${f.to.trim()}` }, { label: 'Departs', value: `${f.time}, ${f.days.join(', ')}` }, { label: 'Seats', value: `${f.seats} available` }], tags: ['Verified driver', 'Recurring'] }
      
      await api.post('/listings', l)
      userListings.set((p) => [l, ...p])
      setDone(l)
    } catch (err) {
      console.error('Failed to create listing on backend:', err)
      setAlertMsg('Failed to publish listing. Please try again.')
    }
  }

  if (done) {
    return (
      <>
        <BackHeader title="Listing published" />
        <div className="absolute inset-0 grid place-items-center px-8 pt-14 text-center">
          <div className="max-w-sm animate-rise">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime-100"><span className="grid h-14 w-14 place-items-center rounded-full bg-olive-700 text-white"><Check size={30} strokeWidth={3} /></span></span>
            <h2 className="mt-6 font-display text-[22px] font-semibold">You're live in {info.name}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-500">“{done.title}” is now visible to verified students on campus. You'll be notified when someone gets in touch.</p>
            <div className="mt-8 grid gap-2.5">
              <Button full size="lg" onClick={() => replace({ name: 'providerDashboard' })}>View my listings</Button>
              <Button full variant="ghost" onClick={() => { setDone(null); setF((x) => ({ ...x, title: '', price: '', desc: '', photo: '', from: '', to: '' })) }}>Add another</Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <BackHeader title="New listing" />
      <StackScroll bottom={80}>
        <div className="mx-auto w-full max-w-[600px] px-4 pt-14 pb-6">
          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-olive-50 text-olive-700"><info.icon size={20} /></span>
            <div><p className="font-display text-[15px] font-semibold">{info.full}</p><VerifiedBadge label="Listing as verified provider" /></div>
          </div>
          {active.length > 1 && (
            <div className="mt-5"><Field label="Listing in"><Choice options={active.map((a) => a.name)} value={info.name} onChange={(v) => setSector(active.find((a) => a.name === v)!.id)} /></Field></div>
          )}

          <div className="mt-5 space-y-5">
            {sector === 'market' && (
              <>
                <TextField label="Title" value={f.title} onChange={(v) => set('title', v)} placeholder="e.g. Engineering Drawing Set" />
                <Field label="Category"><Choice options={MARKET_CATEGORIES.filter((c) => c !== 'All')} value={f.category} onChange={(v) => set('category', v)} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Price (₦)" inputMode="numeric" value={f.price} onChange={(v) => set('price', v.replace(/[^\d,]/g, ''))} placeholder="8,500" />
                  <SelectField label="Condition" value={f.condition} onChange={(v) => set('condition', v)} options={['New', 'Used, like new', 'Used, good', 'Used, fair', 'Service']} />
                </div>
                <TextField label="Meetup location" value={f.place} onChange={(v) => set('place', v)} placeholder="e.g. Faculty of Engineering car park" />
              </>
            )}
            {sector === 'research' && (
              <>
                <TextField label="Equipment name" value={f.title} onChange={(v) => set('title', v)} placeholder="e.g. UV-Vis spectrophotometer" />
                <SelectField label="Category" value={f.category} onChange={(v) => set('category', v)} options={['Analytical Instruments', 'Sample Prep', 'Prototyping', 'Electronics', 'Other']} placeholder="Select category" />
                <Field label="Listing type"><Choice options={['Rent', 'Borrow']} value={f.mode === 'borrow' ? 'Borrow' : 'Rent'} onChange={(v) => set('mode', v.toLowerCase())} /></Field>
                {f.mode !== 'borrow' && (
                  <div className="grid grid-cols-2 gap-3">
                    <TextField label="Rate (₦)" inputMode="numeric" value={f.price} onChange={(v) => set('price', v.replace(/[^\d,]/g, ''))} placeholder="1,500" />
                    <SelectField label="Charged" value={f.unit} onChange={(v) => set('unit', v)} options={['per hour', 'per day', 'per use']} />
                  </div>
                )}
                <TextField label="Lab or room" value={f.place} onChange={(v) => set('place', v)} placeholder="e.g. Central Lab, Room C-14" />
              </>
            )}
            {sector === 'stay' && (
              <>
                <TextField label="Title" value={f.title} onChange={(v) => set('title', v)} placeholder="e.g. Self-contained room, Tanke" />
                <Field label="Room type"><Choice options={['Self-contained', 'Shared room', 'Bed space', 'Mini flat']} value={f.propType} onChange={(v) => set('propType', v)} /></Field>
                <div className="grid grid-cols-[1.4fr_1fr] gap-3">
                  <TextField label="Rent (₦)" inputMode="numeric" value={f.price} onChange={(v) => set('price', v.replace(/[^\d,]/g, ''))} placeholder="180,000" />
                  <SelectField label="Paid" value={f.per} onChange={(v) => set('per', v)} options={['per year', 'per session', 'per month']} />
                </div>
                <SelectField label="Area" value={f.area} onChange={(v) => set('area', v)} options={AREAS} placeholder="Select an area" />
                <TextField label="Street address (optional)" value={f.place} onChange={(v) => set('place', v)} placeholder="House number and street" />
                <Field label="Amenities"><Choice multi options={['Borehole water', 'Prepaid meter', 'Solar backup', 'Security', 'Kitchen']} value={f.amenities} onChange={(v) => set('amenities', v)} /></Field>
              </>
            )}
            {sector === 'move' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="From" value={f.from} onChange={(v) => set('from', v)} placeholder="Main gate" />
                  <TextField label="To" value={f.to} onChange={(v) => set('to', v)} placeholder="Faculty of Science" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Departs" type="time" value={f.time} onChange={(v) => set('time', v)} />
                  <TextField label="Fare per seat (₦)" inputMode="numeric" value={f.price} onChange={(v) => set('price', v.replace(/[^\d,]/g, ''))} placeholder="200" />
                </div>
                <SelectField label="Seats for riders" value={f.seats} onChange={(v) => set('seats', v)} options={['1', '2', '3', '4', '6', '10', '14']} />
                <Field label="Days"><Choice multi options={WEEKDAYS} value={f.days} onChange={(v) => set('days', v)} /></Field>
              </>
            )}
            <Field label="Description">
              <textarea className={`${inputClass} min-h-[96px] resize-none`} placeholder="Add anything a student should know before they reach out." value={f.desc} onChange={(e) => set('desc', e.target.value)} />
            </Field>
            {sector !== 'move' && <UploadField label="Photos" multiple accept="image/*" value={f.photo} onChange={(v) => set('photo', v)} />}
          </div>
        </div>
      </StackScroll>
      <div className="absolute inset-x-0 bottom-0 z-30 border-t border-line bg-white px-4 py-3">
        <div className="mx-auto max-w-[600px]"><Button full size="lg" disabled={!valid} onClick={publish}>Publish listing</Button></div>
      </div>
      <AlertModal open={!!alertMsg} message={alertMsg} onClose={() => setAlertMsg('')} title="Error" />
    </>
  )
}
