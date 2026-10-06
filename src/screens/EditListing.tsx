import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { BackHeader, StackScroll } from '../components/Chrome'
import { Button, Field, inputClass, VerifiedBadge, AlertModal } from '../components/ui'
import { Choice, SelectField, TextField, UploadField } from '../components/forms'
import { MARKET_CATEGORIES, userListings, useListing } from '../lib/data'
import { useNav } from '../lib/nav'
import { sector as sectorInfo } from '../lib/providers'
import { AREAS, WEEKDAYS } from '../lib/providerFlow'
import type { Listing } from '../lib/types'

const digits = (v: string | number) => Number(String(v).replace(/\D/g, ''))

export function EditListing({ id }: { id: string }) {
  const { back } = useNav()
  const listing = useListing(id)
  const sector = listing?.pillar

  const [done, setDone] = useState<Listing | null>(null)
  const [alertMsg, setAlertMsg] = useState('')
  
  // Provide initial values from the listing
  const [f, setF] = useState({
    title: '', category: '', price: '', condition: 'Used, good', desc: '', place: '', photo: '' as string | File,
    unit: 'per hour', from: '', to: '', time: '07:30', seats: '3', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as string[],
    propType: '', per: 'per year', area: '', amenities: [] as string[],
  })

  // Populate state when listing loads
  useEffect(() => {
    if (listing) {
      setF(prev => ({
        ...prev,
        title: listing.title?.split(' → ')?.[0] || listing.title || '',
        to: listing.title?.split(' → ')?.[1] || '',
        category: listing.category || '',
        price: String(listing.price || digits(listing.priceLabel || '0')),
        condition: listing.condition || 'Used, good',
        desc: listing.description || '',
        place: listing.location?.split(', ')?.[1] || listing.location || '',
        photo: listing.image || '',
        unit: listing.priceUnit || 'per hour',
        time: listing.location?.includes('Departs') ? listing.location.replace('Departs ', '') : '07:30',
        seats: listing.availability?.split(' ')?.[0] || '3',
        propType: listing.category || 'Self-contained',
        per: listing.priceUnit || 'per year',
        area: listing.location?.split(', ')?.[0] || '',
      }))
    }
  }, [listing])

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }))

  if (!listing || !sector) {
    return <BackHeader title="Loading..." />
  }

  const info = sectorInfo(sector)
  const valid =
    sector === 'market' ? f.title.trim() && f.category && digits(f.price) && f.photo
    : sector === 'research' ? f.title.trim() && f.category && digits(f.price) && f.photo
    : sector === 'stay' ? f.title.trim() && f.propType && digits(f.price) && f.area && f.photo
    : f.title.trim() && f.to.trim() && digits(f.price) && f.days.length

  const update = async () => {
    try {
      const { default: api } = await import('../lib/axios')
      
      let finalImageUrl = listing.image || ''
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
      
      const base = { ...listing, image: finalImageUrl, description: f.desc.trim() || listing.description }
      let l: Listing
      
      if (sector === 'market') l = { ...base, title: f.title.trim(), category: f.category, price: digits(f.price), condition: f.condition, location: f.place || 'Main campus' }
      else if (sector === 'research') l = { ...base, title: f.title.trim(), category: f.category, price: digits(f.price), priceUnit: f.unit, location: f.place || 'Campus lab', availability: 'Available, request access' }
      else if (sector === 'stay') l = { ...base, title: f.title.trim(), category: f.propType, price: digits(f.price), priceUnit: f.per, location: `${f.area}${f.place ? ', ' + f.place : ''}` }
      else l = { ...base, title: `${f.title.trim()} → ${f.to.trim()}`, priceLabel: `₦${digits(f.price).toLocaleString('en-NG')}`, location: `Departs ${f.time}`, availability: `${f.seats} seats open` }
      
      await api.put(`/listings/${l.id}`, l)
      
      // Update local storage
      userListings.set((p) => p.map(item => item.id === l.id ? l : item))
      setDone(l)
    } catch (err) {
      console.error('Failed to update listing on backend:', err)
      setAlertMsg('Failed to update listing. Please try again.')
    }
  }

  if (done) {
    return (
      <>
        <BackHeader title="Listing updated" />
        <div className="absolute inset-0 grid place-items-center px-8 pt-14 text-center">
          <div className="max-w-sm animate-rise">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime-100"><span className="grid h-14 w-14 place-items-center rounded-full bg-olive-700 text-white"><Check size={30} strokeWidth={3} /></span></span>
            <h2 className="mt-6 font-display text-[22px] font-semibold">Listing updated!</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-500">“{done.title}” has been updated successfully.</p>
            <div className="mt-8 grid gap-2.5">
              <Button full size="lg" onClick={back}>Back to my listings</Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <BackHeader title="Edit listing" />
      <StackScroll bottom={80}>
        <div className="mx-auto w-full max-w-[600px] px-4 pt-14 pb-6">
          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-olive-50 text-olive-700"><info.icon size={20} /></span>
            <div><p className="font-display text-[15px] font-semibold">Editing {info.name} listing</p></div>
          </div>

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
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Rate (₦)" inputMode="numeric" value={f.price} onChange={(v) => set('price', v.replace(/[^\d,]/g, ''))} placeholder="1,500" />
                  <SelectField label="Charged" value={f.unit} onChange={(v) => set('unit', v)} options={['per hour', 'per day', 'per use']} />
                </div>
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
                  <TextField label="From" value={f.title} onChange={(v) => set('title', v)} placeholder="Main gate" />
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
        <div className="mx-auto max-w-[600px]"><Button full size="lg" disabled={!valid} onClick={update}>Save changes</Button></div>
      </div>
      <AlertModal open={!!alertMsg} message={alertMsg} onClose={() => setAlertMsg('')} title="Error" />
    </>
  )
}
